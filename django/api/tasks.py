from __future__ import absolute_import, unicode_literals
import os
import logging
from urllib.request import urlretrieve
from celery import shared_task
import geopandas as gpd
import pandas as pd
import pickle
from sqlalchemy import create_engine
from django.db import connections
from django.conf import settings
from .models import InputSourceUpdate
from django.utils import timezone

logging.basicConfig(level=logging.INFO)


def check_compatible_columns(update_id: int, df: pd.DataFrame):
    """
    Check that the columns (shape) of the new downloaded data are
    compatible with the previous data store in the db. The idea
    is to be sure that the new table will have the same shape
    and won't break the treatment of the data

    This function will the columns of the df for checking it next
    time
    """
    if os.path.exists(f"{settings.DB_SHAPE_DIR}/{update_id}.pkl"):
        with open(f"{settings.DB_SHAPE_DIR}/{update_id}.pkl", "rb") as file:
            previous_columns = pickle.load(file)

            if not previous_columns.isin(df.columns).all():
                # some columns that we have in db are column of the new df
                return False

    if not os.path.exists(settings.DB_SHAPE_DIR):
        os.makedirs(settings.DB_SHAPE_DIR)

    # save the file for the next analysis
    with open(f"{settings.DB_SHAPE_DIR}/{update_id}.pkl", "wb") as file:
        pickle.dump(df.columns, file)

    return True


@shared_task(name="download json and save to db")
def download_json_and_save_to_db(update_id: int):
    """Download a json data and save in into the db"""
    try:
        update = InputSourceUpdate.objects.get(id=update_id)
        source = update.source

        django_database_settings = connections["default"].settings_dict
        db_connection_string = (
            f"postgresql+psycopg2://{django_database_settings['USER']}:{django_database_settings['PASSWORD']}@"
            f"{django_database_settings['HOST']}:{django_database_settings['PORT']}/{django_database_settings['NAME']}"
        )
        db_engine = create_engine(db_connection_string)

        temp_file = urlretrieve(source.url)
        gdf = gpd.read_file(temp_file[0])

        update = InputSourceUpdate.objects.get(id=update_id)

        if check_compatible_columns(update_id, gdf):
            gdf.to_postgis(
                source.table,
                db_engine,
                if_exists="replace",
                index=False,
                schema=source.schema,
            )
            update.status = update.Status.SUCCESS
        else:
            update.status = update.Status.FAIL
            update.message = "Not compatible with the db"

        update.end_time = timezone.now()
        update.save()

    except Exception as e:
        update.status = update.Status.FAIL
        update.end_time = timezone.now()
        update.message = str(e)
        update.save()

from __future__ import absolute_import, unicode_literals
import os
import logging
import zipfile
from urllib.request import urlretrieve
from celery import shared_task
import geopandas as gpd
import pandas as pd
import pickle
from sqlalchemy import create_engine
from django.db import connections
from django.conf import settings
from .models import InputSourceUpdate, InputSource
from django.utils import timezone


logging.basicConfig(level=logging.INFO)


def check_compatible_columns(source_id: int, df: pd.DataFrame, subfile: str = None):
    """
    Check that the columns (shape) of the new downloaded data are
    compatible with the previous data store in the db. The idea
    is to be sure that the new table will have the same shape
    and won't break the treatment of the data

    This function will the columns of the df for checking it next
    time

    subfile: used when we import zipped shp files, we can have more than one
    """
    previous_columns_file = f"{settings.DB_SHAPE_DIR}/{source_id}.pkl"
    if subfile:
        previous_columns_file = f"{settings.DB_SHAPE_DIR}/{source_id}_{subfile}.pkl"
    if os.path.exists(previous_columns_file):
        with open(previous_columns_file, "rb") as file:
            previous_columns = pickle.load(file)

            if not previous_columns.isin(df.columns).all():
                # some columns that we have in db are column of the new df
                return False

    if not os.path.exists(settings.DB_SHAPE_DIR):
        os.makedirs(settings.DB_SHAPE_DIR)

    # save the file for the next analysis
    with open(previous_columns_file, "wb") as file:
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

        if source.type == InputSource.Types.GEOJSON:
            temp_file = urlretrieve(source.url)
            gdf = gpd.read_file(temp_file[0])

            if check_compatible_columns(source.id, gdf):
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

        elif source.type == InputSource.Types.SHAPEFILEZ:
            zip_dir = settings.DB_ZIP_DIR
            shps_to_import = source.filenames.split(',')
            tables_to_fill = source.table.split(',')

            if len(shps_to_import) != len(tables_to_fill):
                raise Exception()

            temp_file = urlretrieve(source.url)
            extract_folder = f"{zip_dir}/{source.id}"

            with zipfile.ZipFile(temp_file[0], 'r') as zip_ref:
                zip_ref.extractall(extract_folder)

            for shp_to_import, table_to_fill in zip(shps_to_import, tables_to_fill):
                if os.path.exists(f"{extract_folder}/{shp_to_import}"):
                    filepath = f"{extract_folder}/{shp_to_import}"
                    gdf = gpd.read_file(filepath)

                    if check_compatible_columns(source.id, gdf, table_to_fill):
                        gdf.to_postgis(table_to_fill, db_engine, if_exists='replace', index=False, schema=source.schema)
                        update.status = update.Status.SUCCESS
                    else:
                        update.status = update.Status.FAIL
                        update.message = f"File {shp_to_import} compatible with the db"
                else:
                    raise Exception(f"File {shp_to_import} not found in the zip")

        update.end_time = timezone.now()
        update.save()

    except Exception as e:
        update.status = update.Status.FAIL
        update.end_time = timezone.now()
        update.message = str(e)
        update.save()

from __future__ import absolute_import, unicode_literals
from celery import shared_task
from datetime import datetime
from .models import InputSourceUpdate
import geopandas as gpd
from sqlalchemy import create_engine
from django.db import connections
from urllib.request import urlretrieve
import logging

logging.basicConfig(level=logging.INFO)


@shared_task(name="download json and save to db")
def download_json_and_save_to_db(update_id):
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

        gdf.to_postgis(
            source.table,
            db_engine,
            if_exists="replace",
            index=False,
            schema=source.schema,
        )

        update = InputSourceUpdate.objects.get(id=update_id)
        update.status = update.Status.SUCCESS
        update.end_time = datetime.now()
        update.save()

    except Exception as e:
        update.status = update.Status.FAIL
        update.end_time = datetime.now()
        update.message = str(e)
        update.save()

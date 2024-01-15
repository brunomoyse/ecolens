from __future__ import absolute_import, unicode_literals
from celery import shared_task
from datetime import datetime
from .models import InputSource
import geopandas as gpd
from sqlalchemy import create_engine
from django.db import connections
from urllib.request import urlretrieve


@shared_task(name = "print_msg_main")
def print_message(message, *args, **kwargs):
    print(f"Celery is working!! Message is {message}")

@shared_task(name = "download json and save to db")
def download_json_and_save_to_db(*args, **kwargs):
    django_database_settings = connections['default'].settings_dict
    db_connection_string = (
        f"postgresql+psycopg2://{django_database_settings['USER']}:{django_database_settings['PASSWORD']}@"
        f"{django_database_settings['HOST']}:{django_database_settings['PORT']}/{django_database_settings['NAME']}"
    )
    db_engine = create_engine(db_connection_string)

    sources = InputSource.objects.all()

    for source in sources:
        temp_file = urlretrieve(source.url)
        gdf = gpd.read_file(temp_file[0])

        gdf.to_postgis(source.table, db_engine, if_exists='replace', index=False, schema=source.schema)
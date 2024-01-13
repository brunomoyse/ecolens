# django_celery/celery.py


import os

from celery import Celery
from celery.schedules import crontab
from django.conf import settings

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecolens.settings")

app = Celery("ecolens")

app.config_from_object("django.conf:settings", namespace="CELERY")

app.autodiscover_tasks()
app.conf.timezone = settings.TIME_ZONE

@app.task(bind=True)
def debug_task(self):
    print('Request: {0!r}'.format(self.request))


app.conf.beat_schedule = {
    'download-json-and-save-to-db': {
        'task': 'download_json_and_save_to_db',
        'schedule': crontab(minute=0, hour=0),  # Minuit chaque jour
    }
}
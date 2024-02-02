from django.contrib.gis.db import models

class InputSourceUpdate(models.Model):
    class Status(models.TextChoices):
        SUCCESS = 'success', 'Success'
        FAIL = 'fail', 'Fail'
        IN_PROGRESS = 'in_progress', 'In progress'

    status = models.CharField(
        max_length=12,
        choices=Status.choices,
        default=Status.IN_PROGRESS
    )

    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True)
    message = models.CharField(max_length=255, null=True)
    source = models.ForeignKey(
        'InputSource',
        on_delete=models.CASCADE,
        null=True
    )

class InputSource(models.Model):
    class Types(models.TextChoices):
        GEOJSON = 'json', 'Geojson'

    type = models.CharField(
        max_length=4,
        choices=Types.choices,
        default=Types.GEOJSON
    )

    name = models.CharField(max_length=255)
    url = models.URLField(max_length=255)
    schema = models.CharField(max_length=255)
    table = models.CharField(max_length=255)

class Layer(models.Model):
    name = models.CharField(max_length=255)
    url = models.URLField(max_length=255)

class View(models.Model):
    center = models.PointField()
    zoom_level = models.IntegerField(
        default=10)
    is_default = models.BooleanField(
        default=False)
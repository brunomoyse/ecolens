from django.contrib.gis.db import models

class Layer(models.Model):
    name = models.CharField(max_length=255)
    url = models.URLField(max_length=255)

class View(models.Model):
    center = models.PointField()
    zoom_level = models.IntegerField(
        default=10)
    is_default = models.BooleanField(
        default=False)
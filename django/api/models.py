# models.py

from django.contrib.postgres.fields import ArrayField
from django.contrib.gis.db import models


class InputSourceUpdate(models.Model):
    class Status(models.TextChoices):
        SUCCESS = "success", "Success"
        FAIL = "fail", "Fail"
        IN_PROGRESS = "in_progress", "In progress"

    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.IN_PROGRESS
    )

    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True)
    message = models.CharField(max_length=255, null=True)
    source = models.ForeignKey("InputSource", on_delete=models.CASCADE, null=True)


class InputSource(models.Model):
    class Types(models.TextChoices):
        GEOJSON = "json", "Geojson"
        SHAPEFILEZ = "shpz", "ShapefileZipped"  # a zipped shapefile

    type = models.CharField(max_length=4, choices=Types.choices, default=Types.GEOJSON)

    name = models.CharField(max_length=255)
    url = models.URLField(max_length=255)
    schema = models.CharField(max_length=255)
    table = models.CharField(max_length=255)  # for a shp can have more than one
    filenames = models.CharField(max_length=255)

    def last_update(self):
        last_update = self.inputsourceupdate_set.order_by("-start_time").first()
        return last_update


class EconomicalActivityPark(models.Model):
    id = models.UUIDField(primary_key=True)
    name = models.TextField(blank=True, null=True, db_column="LIBELLE")
    code_carto = models.TextField(blank=True, null=True, db_column="CODECARTO")
    geom = models.GeometryField(blank=True, srid=4326, db_column="geometry")

    class Meta:
        managed = False
        db_table = '"ingestion"."pre_geoportail"'


class Enterprises(models.Model):
    """Final enterprises (displayed on the map)"""

    class Sector(models.TextChoices):
        PRIMARY = "PRIMARY", "PRIMARY"
        SECONDARY = "SECONDARY", "SECONDARY"
        TERTIARY = "TERTIARY", "TERTIARY"

    def __str__(self):
        return self.name or self.name_commercial or self.name_short

    # TODO : not possible to chose the schema in Django,
    # having same table name in different schema
    # may be problematic
    id = models.UUIDField(primary_key=True)
    establishment_number = models.TextField(unique=True)
    enterprise_number = models.TextField(unique=True)
    name = models.TextField(blank=True, null=True)
    name_commercial = models.TextField(blank=True, null=True)
    name_short = models.TextField(blank=True, null=True)
    form = models.TextField(blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    nace_main = ArrayField(
        models.TextField(blank=True), blank=True, null=True, default=list
    )
    nace_other = ArrayField(
        models.TextField(blank=True), blank=True, null=True, default=list
    )
    nace_letter = models.TextField(blank=True, null=True)
    sector = models.CharField(
        max_length=10, blank=True, null=True, choices=Sector.choices
    )
    address_extra = models.TextField(blank=True, null=True)
    website = models.TextField(blank=True, null=True)
    email = models.TextField(blank=True, null=True)
    phone = models.TextField(blank=True, null=True)
    reliability_index = models.IntegerField(blank=True, null=True)
    capakey = models.TextField(blank=True, null=True)
    extra_properties = models.JSONField(blank=True, null=True)
    geom = models.GeometryField(blank=True, srid=31370)
    # Linked objects
    eap = models.ForeignKey(
        "EconomicalActivityPark",
        on_delete=models.CASCADE,
        db_column="eap_id",
        related_name="enterprises",
        null=True,
        blank=True,
    )

    class Meta:
        managed = False
        db_table = "enterprises"


class Addresses(models.Model):

    def __class__(self):
        return f"{self.street_number} {self.street_name} {self.postal_code} {self.municipality}"

    id = models.UUIDField(primary_key=True)
    street_name = models.TextField(blank=True, null=True)
    street_number = models.TextField(blank=True, null=True)
    postal_code = models.TextField(blank=True, null=True)
    municipality = models.TextField(blank=True, null=True)
    district = models.TextField(blank=True, null=True)
    province = models.TextField(blank=True, null=True)
    region = models.TextField(blank=True, null=True)
    dist_fuzzy = models.TextField(blank=True, null=True)
    geom = models.GeometryField(blank=True, srid=31370)

    class Meta:
        managed = False
        db_table = "addresses"


class AddressEnterprise(models.Model):
    id = models.UUIDField(primary_key=True)
    address = models.ForeignKey(Addresses, on_delete=models.CASCADE)
    enterprise = models.ForeignKey(Enterprises, on_delete=models.CASCADE)
    source = models.TextField()

    class Meta:
        managed = False
        db_table = "address_enterprise"


class WalloniaPlots(models.Model):
    capakey = models.TextField(primary_key=True)
    geom = models.GeometryField(blank=True, srid=31370, db_column="geometry")

    class Meta:
        managed = False
        db_table = '"plots"."wallonia"'


class NaceCodeManager(models.Manager):
    def get_queryset(self):
        # Override the default queryset to apply specific filters
        return (
            super()
            .get_queryset()
            .filter(code__regex=r"^[A-Za-z]+$", category="Nace2008", language="FR")
        )


class NaceCode(models.Model):
    code = models.TextField(primary_key=True)
    description = models.TextField()
    category = models.TextField()
    language = models.TextField()

    objects = NaceCodeManager()

    class Meta:
        managed = False
        db_table = '"kbo"."code"'

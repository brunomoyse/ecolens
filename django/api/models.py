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

    def last_update(self):
        last_update = self.inputsourceupdate_set.order_by('-start_time').first()
        return last_update

class Layer(models.Model):
    name = models.CharField(max_length=255)
    url = models.URLField(max_length=255)

class View(models.Model):
    center = models.PointField()
    zoom_level = models.IntegerField(
        default=10)
    is_default = models.BooleanField(
        default=False)


class EntreprisesSpwSiegesExportation(models.Model):
    ndeg_du_siege_social = models.TextField(blank=True, null=True)
    ndeg_du_siege_d_exploitation = models.TextField(primary_key=True)
    nom_du_siege_social = models.TextField(blank=True, null=True)
    nom_du_siege_d_exploitation = models.TextField(blank=True, null=True)
    abreviation = models.TextField(blank=True, null=True)
    forme_juridique = models.TextField(blank=True, null=True)
    rue = models.TextField(blank=True, null=True)
    numero = models.TextField(blank=True, null=True)
    code_postal = models.TextField(blank=True, null=True)
    localite = models.TextField(blank=True, null=True)
    adresse = models.TextField(blank=True, null=True)
    province = models.TextField(blank=True, null=True)
    arrondissement = models.TextField(blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    telephone = models.TextField(blank=True, null=True)
    site_internet = models.TextField(blank=True, null=True)
    e_mail = models.TextField(blank=True, null=True)
    numero_d_entreprise = models.TextField(blank=True, null=True)
    personnes_employees_nombre = models.FloatField(blank=True, null=True)
    categorie_de_personnel = models.TextField(blank=True, null=True)
    lien_vers_la_fiche_signaletique = models.TextField(blank=True, null=True)
    coordonnees = models.TextField(blank=True, null=True)
    geolocalisation = models.TextField(blank=True, null=True)
    commune = models.TextField(blank=True, null=True)
    municipality_name_french = models.TextField(blank=True, null=True)
    commune_maj = models.TextField(blank=True, null=True)
    geometry = models.PointField()

    class Meta:
        managed = False
        db_table = 'entreprises_spw_sieges_exportation'
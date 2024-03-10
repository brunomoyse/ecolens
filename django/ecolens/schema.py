# schema.py

import json
import graphene
from graphene_django import DjangoObjectType
from django.contrib.gis.geos import Polygon, GEOSGeometry
from api.models import Layer, Enterprises, EconomicalActivityPark, WalloniaPlots, NaceCode
from django.db.models import Q, F, IntegerField
from django.db.models.functions import LTrim, Cast
from django.contrib.gis.db.models.functions import Distance

# CoordinatesType to encapsulate latitude and longitude
class CoordinatesType(graphene.ObjectType):
    latitude = graphene.Float()
    longitude = graphene.Float()

class WalloniaPlotsType(DjangoObjectType):
    distance_to_centroid = graphene.Int()

    class Meta:
        model = WalloniaPlots
        fields = ("capakey", "distance_to_centroid")

    def resolve_distance_to_centroid(self, info):
        # Since distance_to_centroid is manually set in the resolver function, just return it
        return self.distance_to_centroid


# NaceCodeType to encapsulate nace code and description
class NaceCodeType(DjangoObjectType):
    class Meta:
        model = NaceCode
        fields = ("code", "description")

# EAP
class EconomicalActivityParkType(DjangoObjectType):
    distance_to_centroid = graphene.Int()
    class Meta:
        model = EconomicalActivityPark
        fields = ("id", "name", "code_carto")

    def resolve_distance_to_centroid(self, info):
        # Since distance_to_centroid is manually set in the resolver function, just return it
        return self.distance_to_centroid

# Enterprises with excluded "geom" field
class EnterprisesType(DjangoObjectType):
    distance_to_centroid = graphene.Int()
    coordinates = graphene.Field(CoordinatesType)
    economical_activity_park = graphene.Field(EconomicalActivityParkType)

    class Meta:
        model = Enterprises
        exclude = ("geom",)

    def resolve_coordinates(self, info):
        if self.geom:
            # Transform the geometry to WGS84 and return the coordinates
            geom_transformed = self.geom.transform(4326, clone=True)
            return CoordinatesType(latitude=geom_transformed.y, longitude=geom_transformed.x)

    def resolve_economical_activity_park(self, info):
        # Check if the eap relationship exists before trying to access it
        if hasattr(self, 'eap') and self.eap:
            return self.eap
        return None

    def resolve_distance_to_centroid(self, info):
        # Since distance_to_centroid is manually set in the resolver function, just return it
        return self.distance_to_centroid

class DetailedSearchResponseType(graphene.ObjectType):
    enterprises = graphene.List(EnterprisesType)
    eaps = graphene.List(EconomicalActivityParkType)
    plots = graphene.List(WalloniaPlotsType)

# Layer
class LayerType(DjangoObjectType):
    class Meta:
        model = Layer
        fields = ("id", "name", "url")

# Enum for Sector
class SectorEnum(graphene.Enum):
    PRIMARY = "PRIMARY"
    SECONDARY = "SECONDARY"
    TERTIARY = "TERTIARY"

# Pagination ObjectType
class Pagination(graphene.ObjectType):
    total = graphene.Int()
    per_page = graphene.Int()
    current_page = graphene.Int()
    last_page = graphene.Int()
    first_page = graphene.Int(default_value=1)

# Define a response structure that includes both enterprises and pagination info
class EnterprisesWithPagination(graphene.ObjectType):
    pagination = graphene.Field(Pagination)
    data = graphene.List(EnterprisesType)

# Define the main Query ObjectType
class Query(graphene.ObjectType):
    all_layers = graphene.List(LayerType)
    layer_by_id = graphene.Field(LayerType, id=graphene.Int(required=True))
    nace_codes = graphene.List(NaceCodeType)
    economical_activity_parks = graphene.List(EconomicalActivityParkType)
    enterprises = graphene.Field(
        EnterprisesWithPagination,
        page=graphene.Int(),
        page_size=graphene.Int(),
        bbox=graphene.List(graphene.Float),
        wkt=graphene.String(),
        sector=graphene.Argument(SectorEnum),
        naceMain=graphene.List(graphene.String),
        naceLetter=graphene.String(),
        eapId=graphene.UUID(),
        entityType=graphene.String(),
    )
    enterprise = graphene.Field(EnterprisesType, id=graphene.ID(required=True))
    resolver_detail_search = graphene.Field(
        DetailedSearchResponseType,
        wkt=graphene.String(required=True),
    )

    def resolve_resolver_detail_search(self, info, wkt):
        # Convert the input WKT to a GEOSGeometry object
        wkt_geom = GEOSGeometry(wkt, srid=4326)  # Assuming input WKT is in WGS84

        # For tables in Lambert 72 (EPSG:31370), transform the geometry
        wkt_geom_31370 = wkt_geom.transform(31370, clone=True)

        # Filter for enterprises within the polygon (assuming Lambert 72 projection)
        enterprises = Enterprises.objects.filter(
            geom__within=wkt_geom_31370
        ).annotate(
            distance_to_centroid=Distance('geom', wkt_geom_31370.centroid)
        ).order_by('distance_to_centroid')

        # Filter for EconomicalActivityPark intersecting the polygon (assuming it's in WGS84)
        eaps = EconomicalActivityPark.objects.filter(
            geom__intersects=wkt_geom
        ).annotate(
            distance_to_centroid=Distance('geom', wkt_geom.centroid)
        ).order_by('distance_to_centroid')

        # Filter for wallonia_plots intersecting the polygon and calculate distances (assuming Lambert 72 projection)
        wallonia_plots = WalloniaPlots.objects.filter(
            geom__intersects=wkt_geom_31370
        ).annotate(
            distance_to_centroid=Distance('geom', wkt_geom_31370.centroid)
        ).order_by('distance_to_centroid')

        # Convert the QuerySet to a list to evaluate the annotations
        enterprises_list = list(enterprises)
        eaps_list = list(eaps)
        wallonia_plots_list = list(wallonia_plots)

        # Ensure distance_to_centroid is converted to a float (meters in this example)
        for enterprise in enterprises_list:
            if hasattr(enterprise, 'distance_to_centroid') and enterprise.distance_to_centroid is not None:
                enterprise.distance_to_centroid = round(enterprise.distance_to_centroid.m)
            else:
                enterprise.distance_to_centroid = None
        for eap in eaps_list:
            if hasattr(eap, 'distance_to_centroid') and eap.distance_to_centroid is not None:
                eap.distance_to_centroid = round(eap.distance_to_centroid.m)
            else:
                eap.distance_to_centroid = None
        for plot in wallonia_plots_list:
            if hasattr(plot, 'distance_to_centroid') and plot.distance_to_centroid is not None:
                plot.distance_to_centroid = round(plot.distance_to_centroid.m)
            else:
                plot.distance_to_centroid = None

        # Construct and return the detailed search response
        return DetailedSearchResponseType(
            enterprises=list(enterprises_list),
            eaps=list(eaps_list),
            plots=list(wallonia_plots_list)
        )

    # Resolver for all_layers
    def resolve_all_layers(self, info):
        return Layer.objects.all()

    # Resolver for layer_by_id
    def resolve_layer_by_id(self, info, id):
        try:
            return Layer.objects.get(pk=id)
        except Layer.DoesNotExist:
            return None

    # Resolver for nace_codes
    def resolve_nace_codes(self, info):
        return NaceCode.objects.all()

    # Resolver for economical_activity_parks
    def resolve_economical_activity_parks(self, info):
        return EconomicalActivityPark.objects.all()

    # Resolver for enterprises with simplified pagination and filters
    def resolve_enterprises(
        self,
        info,
        page=1,
        page_size=5,
        bbox=None,
        wkt=None,
        sector=None,
        naceMain=None,
        naceLetter=None,
        eapId=None,
        entityType=None,
    ):
        queryset = Enterprises.objects.all()

        # Filter by entityType
        if entityType:
            queryset = queryset.filter(form=entityType)

        # Filter by EAP
        if eapId:
            queryset = queryset.filter(eap_id=eapId)

        # Filter by sector
        if sector:
            sector_value = sector.value  # Convert EnumMeta instance to its value
            queryset = queryset.filter(sector=sector_value)

        # Filter by naceMain
        if naceMain:
            queryset = queryset.annotate(trimmed_value=LTrim(F("nace_main"))).filter(
                trimmed_value__startswith=naceMain
            )

        # Filter by naceLetter (letter A-U)
        if naceLetter:
            queryset = queryset.filter(nace_letter=naceLetter)

        # Filter on extent
        if bbox:
            if len(bbox) != 4:
                raise ValueError(
                    "The bbox must contain exactly 4 elements (min_lon, min_lat, max_lon, max_lat)"
                )

            bbox_polygon = Polygon.from_bbox(bbox)
            bbox_polygon.srid = 4326
            bbox_polygon.transform(31370)

            queryset = queryset.filter(
                addressenterprise__address__geom__within=bbox_polygon
            )

        elif wkt:
            wkt_polygon = GEOSGeometry(wkt)

            if not wkt_polygon.srid:
                wkt_polygon.srid = 4326

            wkt_polygon.transform(31370)

            queryset = queryset.filter(
                addressenterprise__address__geom__within=wkt_polygon
            )

        # Pagination calculations
        total = queryset.count()
        last_page = (total // page_size) + (1 if total % page_size > 0 else 0)
        queryset = queryset[(page - 1) * page_size: page * page_size]

        pagination = Pagination(
            total=total,
            per_page=page_size,
            current_page=page,
            last_page=last_page,
            first_page=1
        )

        return EnterprisesWithPagination(
            pagination=pagination,
            data=list(queryset),
        )

    # Resolver for enterprise (single one)
    def resolve_enterprise(self, info, id):
        try:
            return Enterprises.objects.get(pk=id)
        except Enterprises.DoesNotExist:
            return None
# Generate the GraphQL schema
schema = graphene.Schema(query=Query)

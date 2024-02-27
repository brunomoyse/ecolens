import json
import graphene
from graphene_django import DjangoObjectType
from django.contrib.gis.geos import Polygon, GEOSGeometry
from api.models import Layer, Enterprises
from django.db.models import Q, F
from django.db.models.functions import LTrim

# CoordinatesType to encapsulate latitude and longitude
class CoordinatesType(graphene.ObjectType):
    latitude = graphene.Float()
    longitude = graphene.Float()

# Define your DjangoObjectType for Enterprises with excluded "geom" field
class EnterprisesType(DjangoObjectType):
    coordinates = graphene.Field(CoordinatesType)

    class Meta:
        model = Enterprises
        exclude = ("geom",)

    def resolve_coordinates(self, info):
        if self.geom:
            # Transform the geometry to WGS84 and return the coordinates
            geom_transformed = self.geom.transform(4326, clone=True)
            return CoordinatesType(latitude=geom_transformed.y, longitude=geom_transformed.x)

# Define your DjangoObjectType for Layer
class LayerType(DjangoObjectType):
    class Meta:
        model = Layer
        fields = ("id", "name", "url")

# Define an Enum for Sector
class SectorEnum(graphene.Enum):
    PRIMARY = "PRIMARY"
    SECONDARY = "SECONDARY"
    TERTIARY = "TERTIARY"

# Define a Pagination ObjectType
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

# Define your main Query ObjectType
class Query(graphene.ObjectType):
    all_layers = graphene.List(LayerType)
    layer_by_id = graphene.Field(LayerType, id=graphene.Int(required=True))
    enterprises = graphene.Field(
        EnterprisesWithPagination,
        page=graphene.Int(),
        page_size=graphene.Int(),
        bbox=graphene.List(graphene.Float),
        wkt=graphene.String(),
        sector=graphene.Argument(SectorEnum),
        naceMain=graphene.List(graphene.String),
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
    ):
        queryset = Enterprises.objects.all()

        # Filter by sector
        if sector:
            queryset = queryset.filter(sector=sector)

        # Filter by naceMain
        if naceMain:
            queryset = queryset.annotate(trimmed_value=LTrim(F("nace_main"))).filter(
                trimmed_value__startswith=naceMain
            )

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

# Generate the GraphQL schema
schema = graphene.Schema(query=Query)

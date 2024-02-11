import json
import graphene
from graphene_django import DjangoObjectType
from api.models import Layer, Enterprises
from django.contrib.gis.geos import Polygon, GEOSGeometry
from django.db.models import F
from django.db.models.functions import LTrim


class EnterprisesType(DjangoObjectType):
    class Meta:
        model = Enterprises
        exclude = ("geom",)


class LayerType(DjangoObjectType):
    class Meta:
        model = Layer
        fields = ("id", "name", "url")


class Query(graphene.ObjectType):
    all_layers = graphene.List(LayerType)
    layer_by_id = graphene.Field(LayerType, id=graphene.Int(required=True))
    enterprises = graphene.List(
        EnterprisesType,
        first=graphene.Int(),
        skip=graphene.Int(),
        bbox=graphene.List(graphene.Float),
        wkt=graphene.String(),
        sector=graphene.String(),  # TODO VOIR SI EXISTE UNE ENUM
        nace=graphene.String(),
    )
    csv = graphene.String()


    def resolve_enterprises(
        self,
        info,
        first=None,
        skip=None,
        bbox=None,
        wkt=None,
        sector=None,
        nace=None,
    ):
        queryset = Enterprises.objects.all()

        if nace:
            queryset = queryset.annotate(trimmed_value=LTrim(F("nace_main"))).filter(
                trimmed_value__startswith=nace
            )

        if sector:
            queryset = queryset.filter(sector=sector)

        if bbox:
            if len(bbox) != 4:
                raise ValueError(
                    "The bbox must contain exactly 4 elements (min_lon, min_lat, max_lon, max_lat)"
                )

            bbox_polygon = Polygon.from_bbox(bbox)
            bbox_polygon.srid = 4326
            bbox_polygon.transform(31370)

            queryset = queryset.filter(geom__within=bbox_polygon)

        elif wkt:
            wkt_polygon = GEOSGeometry(wkt)

            if not wkt_polygon.srid:
                wkt_polygon.srid = 4326

            wkt_polygon.transform(31370)
            queryset = queryset.filter(geom__within=wkt_polygon)

        if skip:
            queryset = queryset[skip:]

        if first:
            queryset = queryset[:first]

        return queryset

    def resolve_all_layers(self, _):
        # We can easily optimize query count in the resolve method
        return Layer.objects.all()

    def resolve_layer_by_id(self, info, id):
        try:
            return Layer.objects.get(pk=id)
        except Layer.DoesNotExist:
            return None


schema = graphene.Schema(query=Query)

import json
import graphene
from graphene_django import DjangoObjectType
from api.models import Layer, Enterprises
from django.contrib.gis.geos import Polygon, GEOSGeometry


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
        polygon=graphene.JSONString(),
    )

    def resolve_enterprises(self, info, first=None, skip=None, bbox=None, polygon=None):
        queryset = Enterprises.objects.all()

        if bbox:
            if len(bbox) != 4:
                raise ValueError(
                    "La bbox doit contenir exactement 4 éléments (min_lon, min_lat, max_lon, max_lat)"
                )

            bbox_polygon = Polygon.from_bbox(bbox)
            queryset = queryset.filter(geometry__within=bbox_polygon)

        elif polygon:
            geom_geojson = GEOSGeometry(json.dumps(polygon))
            queryset = queryset.filter(geometry__within=geom_geojson)

        if skip:
            queryset = queryset[skip:]

        if first:
            queryset = queryset[:first]

        return queryset

    def resolve_all_layers(self, info):
        # We can easily optimize query count in the resolve method
        return Layer.objects.all()

    def resolve_layer_by_id(self, info, id):
        try:
            return Layer.objects.get(pk=id)
        except Layer.DoesNotExist:
            return None


schema = graphene.Schema(query=Query)

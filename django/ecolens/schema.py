import graphene
from graphene_django import DjangoObjectType

from api.models import Layer, EntreprisesSpwSiegesExportation

class EntreprisesSpwSiegesExportationType(DjangoObjectType):
    class Meta:
        model = EntreprisesSpwSiegesExportation
        fields = (
            "ndeg_du_siege_social",
            "nom_du_siege_social",
            "nom_du_siege_social",
            "nom_du_siege_d_exploitation")

class LayerType(DjangoObjectType):
    class Meta:
        model = Layer
        fields = ("id", "name", "url")

class Query(graphene.ObjectType):
    all_layers = graphene.List(LayerType)
    layer_by_id = graphene.Field(LayerType, id=graphene.Int(required=True))
    enterprises = graphene.List(EntreprisesSpwSiegesExportationType, first=graphene.Int(), skip=graphene.Int())

    def resolve_enterprises(self, info, first=None, skip=None):
        queryset = EntreprisesSpwSiegesExportation.objects.all()

        if skip:
            queryset = queryset[skip:]

        if first:
            queryset = queryset[:first]

        return queryset

    def resolve_all_layers(root, info):
        # We can easily optimize query count in the resolve method
        return Layer.objects.all()

    def resolve_layer_by_id(root, info, id):
        try:
            return Layer.objects.get(pk=id)
        except Layer.DoesNotExist:
            return None

schema = graphene.Schema(query=Query)
import graphene
from graphene_django import DjangoObjectType

from api.models import Layer, View

class LayerType(DjangoObjectType):
    class Meta:
        model = Layer
        fields = ("id", "name", "url")

class Query(graphene.ObjectType):
    all_layers = graphene.List(LayerType)
    layer_by_id = graphene.Field(LayerType, id=graphene.Int(required=True))

    def resolve_all_layers(root, info):
        # We can easily optimize query count in the resolve method
        return Layer.objects.all()

    def resolve_layer_by_id(root, info, id):
        try:
            return Layer.objects.get(pk=id)
        except Layer.DoesNotExist:
            return None

schema = graphene.Schema(query=Query)
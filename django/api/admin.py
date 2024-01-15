from django.contrib import admin

from .models import Layer, View, InputSource

class LayerAdmin(admin.ModelAdmin):
    list_display = ['name']

class ViewAdmin(admin.ModelAdmin):
    list_display = ['center', 'zoom_level']


class InputSourceAdmin(admin.ModelAdmin):
    list_display = ['name', 'type']


admin.site.register(Layer, LayerAdmin)
admin.site.register(View, ViewAdmin)
admin.site.register(InputSource, InputSourceAdmin)
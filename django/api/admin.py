from django.contrib import admin

from .models import Layer, View, InputSource, InputSourceUpdate
from .tasks import download_json_and_save_to_db
import logging

class LayerAdmin(admin.ModelAdmin):
    list_display = ['name']

class ViewAdmin(admin.ModelAdmin):
    list_display = ['center', 'zoom_level']

@admin.action(description="Update the selected layer ")
def update_layer(modeladmin, request, queryset):
    logging.info("start action update_layer")
    for layer in queryset:
        new_update = InputSourceUpdate(source=layer)
        new_update.save()

        download_json_and_save_to_db.delay(new_update.id)


class InputSourceAdmin(admin.ModelAdmin):
    list_display = ['name', 'type']
    actions = [update_layer]


admin.site.register(Layer, LayerAdmin)
admin.site.register(View, ViewAdmin)
admin.site.register(InputSource, InputSourceAdmin)
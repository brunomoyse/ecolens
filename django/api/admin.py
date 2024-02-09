from django.contrib import admin

from .models import Layer, View, InputSource, InputSourceUpdate
from .tasks import download_json_and_save_to_db
import logging


class LayerAdmin(admin.ModelAdmin):
    list_display = ["name"]


class ViewAdmin(admin.ModelAdmin):
    list_display = ["center", "zoom_level"]


@admin.action(description="Update the selected layer ")
def update_layer(modeladmin, request, queryset):
    logging.info("start action update_layer")
    for layer in queryset:
        new_update = InputSourceUpdate(source=layer)
        new_update.save()

        download_json_and_save_to_db.delay(new_update.id)


class InputSourceAdmin(admin.ModelAdmin):
    list_display = ["name", "type", "last_update_time", "last_update_status"]
    actions = [update_layer]

    def last_update_time(self, obj):
        last_update = obj.last_update()
        if last_update:
            return last_update.end_time
        return None

    def last_update_status(self, obj):
        last_update = obj.last_update()
        if last_update:
            return last_update.status
        return None


admin.site.register(Layer, LayerAdmin)
admin.site.register(View, ViewAdmin)
admin.site.register(InputSource, InputSourceAdmin)

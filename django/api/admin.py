import logging
from django.contrib import admin

from .models import (
    InputSource,
    InputSourceUpdate,
    Enterprises,
    Addresses,
    AddressEnterprise,
)
from .tasks import download_json_and_save_to_db


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


class EnterprisesAdmin(admin.ModelAdmin):
    list_display = ["id", "establishment_number", "enterprise_number", "name"]


class AddressesAdmin(admin.ModelAdmin):
    list_display = ["id", "street_name", "street_number", "postal_code", "municipality"]


class AddressEnterpriseAdmin(admin.ModelAdmin):
    raw_id_fields = ["address", "enterprise"]
    # list_display = ["id", "enterprise", "address"]


admin.site.register(InputSource, InputSourceAdmin)
admin.site.register(Enterprises, EnterprisesAdmin)
admin.site.register(Addresses, AddressesAdmin)
admin.site.register(AddressEnterprise, AddressEnterpriseAdmin)

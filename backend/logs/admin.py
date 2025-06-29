from django.contrib import admin
from .models import ModificationLog

@admin.register(ModificationLog)
class ModificationLogAdmin(admin.ModelAdmin):
    list_display = ('model_name', 'instance_id', 'field_name', 'old_value', 'new_value', 'modified_at', 'modified_by')
    list_filter = ('model_name', 'modified_by', 'modified_at')
    search_fields = ('model_name', 'field_name', 'old_value', 'new_value')

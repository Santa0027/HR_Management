from django.db import models

from django.conf import settings


class ModificationLog(models.Model):
    model_name = models.CharField(max_length=100)
    instance_id = models.PositiveIntegerField()
    field_name = models.CharField(max_length=100)
    old_value = models.TextField(null=True, blank=True)
    new_value = models.TextField(null=True, blank=True)
    modified_at = models.DateTimeField(auto_now_add=True)
    modified_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return f'{self.model_name} #{self.instance_id} | {self.field_name} changed'

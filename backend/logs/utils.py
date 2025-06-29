from .models import ModificationLog

def log_model_changes(new_instance, old_instance, user=None):
    for field in new_instance._meta.fields:
        field_name = field.name
        if field.primary_key:  # Skip primary key
            continue
        old_value = getattr(old_instance, field_name)
        new_value = getattr(new_instance, field_name)
        if old_value != new_value:
            ModificationLog.objects.create(
                model_name=new_instance.__class__.__name__,
                instance_id=new_instance.pk,
                field_name=field_name,
                old_value=str(old_value),
                new_value=str(new_value),
                modified_by=user
            )

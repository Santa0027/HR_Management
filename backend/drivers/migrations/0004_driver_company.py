# Generated by Django 5.2.3 on 2025-06-14 11:26

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('company', '0001_initial'),
        ('drivers', '0003_alter_driver_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='driver',
            name='company',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='driver', to='company.company'),
        ),
    ]

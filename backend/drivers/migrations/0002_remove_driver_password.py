# Generated by Django 5.2.3 on 2025-06-13 06:57

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('drivers', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='driver',
            name='password',
        ),
    ]

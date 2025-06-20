# Generated by Django 5.2.3 on 2025-06-13 02:07

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Driver',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('driver_name', models.CharField(max_length=100)),
                ('gender', models.CharField(choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')], max_length=10)),
                ('iqama', models.CharField(max_length=20, unique=True)),
                ('mobile', models.CharField(max_length=20)),
                ('city', models.CharField(max_length=100)),
                ('nationality', models.CharField(max_length=100)),
                ('password', models.CharField(max_length=100)),
                ('dob', models.DateField()),
                ('iqama_document', models.FileField(upload_to='drivers/iqama/')),
                ('iqama_expiry', models.DateField()),
                ('passport_document', models.FileField(upload_to='drivers/passport/')),
                ('passport_expiry', models.DateField()),
                ('license_document', models.FileField(upload_to='drivers/license/')),
                ('license_expiry', models.DateField()),
                ('visa_document', models.FileField(upload_to='drivers/visa/')),
                ('visa_expiry', models.DateField()),
                ('medical_document', models.FileField(upload_to='drivers/medical/')),
                ('medical_expiry', models.DateField()),
                ('submitted_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected'), ('expired', 'Expired')], default='pending', max_length=20)),
                ('remarks', models.TextField(blank=True, help_text='Admin or HR remarks for approval, rejection, or additional notes')),
                ('submitted_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='submitted_drivers', to=settings.AUTH_USER_MODEL)),
                ('updated_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='updated_drivers', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='DriverLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.CharField(max_length=100)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('note', models.TextField(blank=True)),
                ('driver', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='drivers.driver')),
                ('performed_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]

from django.shortcuts import render

# Create your views here.
from rest_framework import serializers
from .models import VehicleRegistration

class VehicleRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleRegistration
        fields = '__all__'

from rest_framework import serializers
from .models import Driver, DriverLog

class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = '__all__'

class DriverLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriverLog
        fields = '__all__'

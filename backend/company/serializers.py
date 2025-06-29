# companies/serializers.py

from rest_framework import serializers
from .models import Company

class CompanySerializer(serializers.ModelSerializer):
    driver_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Company
        fields = '__all__' 
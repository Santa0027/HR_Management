from rest_framework import serializers
from .models import ModificationLog

class ModificationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModificationLog
        fields = '__all__'

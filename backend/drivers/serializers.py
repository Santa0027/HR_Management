from rest_framework import serializers
from .models import Driver, DriverLog
from rest_framework import serializers
from .models import Driver

class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = '__all__'  # or a specific list of fields

    def validate(self, data):
        # Safely access fields even during PATCH
        iqama_expiry = data.get('iqama_expiry', getattr(self.instance, 'iqama_expiry', None))
        dob = data.get('dob', getattr(self.instance, 'dob', None))

        if iqama_expiry and dob and iqama_expiry < dob:
            raise serializers.ValidationError("Iqama expiry must be after Date of Birth.")

        return data


class DriverLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriverLog
        fields = '__all__'

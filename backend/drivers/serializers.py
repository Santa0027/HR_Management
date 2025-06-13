from rest_framework import serializers
from .models import Driver, DriverLog
from rest_framework import serializers
from .models import Driver

class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = '__all__'  # Or list all the fields explicitly

    def validate(self, data):
        # Example: Check that expiry dates are not in the past
        if data['iqama_expiry'] < data['dob']:
            raise serializers.ValidationError("Iqama expiry must be after DOB.")
        return data


class DriverLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriverLog
        fields = '__all__'

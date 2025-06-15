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
from rest_framework import serializers
from .models import Driver, DriverLog
from vehicle.models import VehicleRegistration


class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleRegistration
        fields = ['id', 'vehicle_name', 'vehicle_number','vehicle_type']


class DriverSerializer(serializers.ModelSerializer):
    # Show vehicle details on GET
    vehicle = VehicleSerializer(read_only=True)

    # Accept vehicle ID on POST/PUT
    vehicle_id = serializers.PrimaryKeyRelatedField(
        queryset=VehicleRegistration.objects.all(),
        source='vehicle',  # This maps vehicle_id to vehicle FK
        write_only=True
    )

    class Meta:
        model = Driver
        fields = '__all__'  # Or list them out if needed: ['id', 'driver_name', ..., 'vehicle', 'vehicle_id']

    def validate(self, data):
        # Safely access fields even during PATCH
        iqama_expiry = data.get('iqama_expiry', getattr(self.instance, 'iqama_expiry', None))
        dob = data.get('dob', getattr(self.instance, 'dob', None))

        if iqama_expiry and dob and iqama_expiry < dob:
            raise serializers.ValidationError("Iqama expiry must be after Date of Birth.")

        return data

from rest_framework import serializers
from .models import Driver, DriverLog
from vehicle.models import VehicleRegistration
from company.models import Company

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleRegistration
        fields = ['id', 'vehicle_name', 'vehicle_number', 'vehicle_type']


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields=['id','company_name']


class DriverSerializer(serializers.ModelSerializer):
    vehicle = VehicleSerializer(read_only=True)

    vehicle_id = serializers.PrimaryKeyRelatedField(
        queryset=VehicleRegistration.objects.all(),
        source='vehicle',
        write_only=True
    )

    company = CompanySerializer(read_only=True)

    Company_id= serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(),
        source='company',
        write_only=True
    )

    class Meta:
        model = Driver
        fields = '__all__'

    def validate(self, data):
        iqama_expiry = data.get('iqama_expiry', getattr(self.instance, 'iqama_expiry', None))
        dob = data.get('dob', getattr(self.instance, 'dob', None))

        if iqama_expiry and dob and iqama_expiry < dob:
            raise serializers.ValidationError("Iqama expiry must be after Date of Birth.")
        return data

    def create(self, validated_data):
        vehicle = validated_data.pop('vehicle', None)
        submitted_by = validated_data.pop('submitted_by', None)

        driver = Driver.objects.create(**validated_data)

        if vehicle:
            driver.vehicle = vehicle
        if submitted_by:
            driver.submitted_by = submitted_by

        driver.save()
        return driver


class DriverLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriverLog
        fields = '__all__'

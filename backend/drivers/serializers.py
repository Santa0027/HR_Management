# In your serializers.py
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

    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(),
        source='company',
        write_only=True
    )

    # *** THIS IS THE KEY CHANGE ***
    company_id = serializers.PrimaryKeyRelatedField( # Changed from Company_id to company_id
        queryset=Company.objects.all(),
        source='company',
        write_only=True,
        required=True # Explicitly set to True if it's a mandatory field
    )

    class Meta:
        model = Driver
        # If you are using fields = '__all__', make sure your Driver model actually
        # has a ForeignKey field named 'company'. DRF will automatically
        # create 'company_id' for the serializer if 'company' is present in the model.
        # If your model's ForeignKey is named 'company_id', then '__all__' will work fine.
        fields = '__all__'

    def validate(self, data):
        iqama_expiry = data.get('iqama_expiry', getattr(self.instance, 'iqama_expiry', None))
        dob = data.get('dob', getattr(self.instance, 'dob', None))

        if iqama_expiry and dob and iqama_expiry < dob:
            raise serializers.ValidationError("Iqama expiry must be after Date of Birth.")
        return data

    def create(self, validated_data):
        # When using PrimaryKeyRelatedField with source='company',
        # the 'company' instance will be popped, not 'company_id'.
        # Ensure your model has a ForeignKey field named 'company'.
        company_instance = validated_data.pop('company', None) # This correctly pops the Company object
        vehicle_instance = validated_data.pop('vehicle', None) # Rename 'vehicle' if it's causing issues
        submitted_by = validated_data.pop('submitted_by', None)

        driver = Driver.objects.create(**validated_data)

        if vehicle_instance: # Use vehicle_instance
            driver.vehicle = vehicle_instance
        if company_instance: # Assign the popped Company instance
            driver.company = company_instance
        if submitted_by:
            driver.submitted_by = submitted_by

        driver.save()
        return driver


class DriverLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriverLog
        fields = '__all__'
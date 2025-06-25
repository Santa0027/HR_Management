from rest_framework import serializers
from django.contrib.auth import get_user_model

# Assuming these imports are correct based on your setup
from .models import (
    Driver, Company, 
    CheckinLocation, ApartmentLocation,
    Attendance, MonthlyAttendanceSummary,
    WarningLetter, Termination
)
from vehicle.models import VehicleRegistration

User = get_user_model()


# -----------------------------
# Company Serializer (No changes needed)
# -----------------------------
class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'


# -----------------------------
# Vehicle Registration Serializer (No changes needed)
# -----------------------------
class VehicleRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleRegistration
        fields = '__all__'


# -----------------------------
# Driver Serializer (No changes needed)
# -----------------------------
class DriverSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(),
        source='company',
        write_only=True,
        allow_null=True
    )
    vehicleType = VehicleRegistrationSerializer(read_only=True)
    vehicleType_id = serializers.PrimaryKeyRelatedField(
        queryset=VehicleRegistration.objects.all(),
        source='vehicleType',
        write_only=True,
        allow_null=True
    )

    class Meta:
        model = Driver
        fields = '__all__'


# -----------------------------
# Check-in Location Serializer (REMOVED DRIVER NESTED FIELD)
# -----------------------------
class CheckinLocationSerializer(serializers.ModelSerializer):
    # Removed: driver = DriverSerializer(read_only=True)
    driver_id = serializers.PrimaryKeyRelatedField( # For writing/updating (expects driver ID)
        queryset=Driver.objects.all(),
        write_only=True
    )

    class Meta:
        model = CheckinLocation
        fields = [
            'id', 'name', 'latitude', 'longitude', 'radius_meters',
            'is_active', 'created_at', 'updated_at',
            'driver_id', 'driver'
            # 'driver' is no longer in fields because the field is removed above
        ]

    def create(self, validated_data):
        driver_id = validated_data.pop('driver_id') 
        
        try:
            driver_instance = Driver.objects.get(id=driver_id)
        except Driver.DoesNotExist:
            raise serializers.ValidationError({"driver_id": "Driver with this ID does not exist."})
        
        # This line remains correct as your model field is named 'driver'
        checkin_location = CheckinLocation.objects.create(driver=driver_instance, **validated_data)
        return checkin_location

    def update(self, instance, validated_data):
        driver_id = validated_data.pop('driver_id', None)
        
        if driver_id is not None:
            try:
                # This line remains correct as your model field is named 'driver'
                instance.driver = Driver.objects.get(id=driver_id)
            except Driver.DoesNotExist:
                raise serializers.ValidationError({"driver_id": "Driver with this ID does not exist."})

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


# -----------------------------
# Apartment Location Serializer (REMOVED DRIVER NESTED FIELD)
# -----------------------------
class ApartmentLocationSerializer(serializers.ModelSerializer):
    # Removed: driver = DriverSerializer(read_only=True)
    driver_id = serializers.PrimaryKeyRelatedField(
        queryset=Driver.objects.all(),
        write_only=True
    )

    class Meta:
        model = ApartmentLocation
        fields = [
            'id', 'name', 'latitude', 'longitude', 'alarm_radius_meters',
            'is_active', 'created_at', 'updated_at',
            'driver_id', 
            # 'driver' is no longer in fields because the field is removed above
        ]

    def create(self, validated_data):
        driver_id = validated_data.pop('driver_id') 
        try:
            driver_instance = Driver.objects.get(id=driver_id)
        except Driver.DoesNotExist:
            raise serializers.ValidationError({"driver_id": "Driver with this ID does not exist."})
        
        # This line remains correct as your model field is named 'driver'
        apartment_location = ApartmentLocation.objects.create(driver=driver_instance, **validated_data)
        return apartment_location

    def update(self, instance, validated_data):
        driver_id = validated_data.pop('driver_id', None)
        
        if driver_id is not None:
            try:
                # This line remains correct as your model field is named 'driver'
                instance.driver = Driver.objects.get(id=driver_id)
            except Driver.DoesNotExist:
                raise serializers.ValidationError({"driver_id": "Driver with this ID does not exist."})

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


# -----------------------------
# Other Serializers (No changes needed)
# -----------------------------
class AttendanceSerializer(serializers.ModelSerializer):
    driver = DriverSerializer(read_only=True)
    driver_id = serializers.PrimaryKeyRelatedField(
        queryset=Driver.objects.all(),
        source='driver',
        write_only=True
    )
    checked_in_location = CheckinLocationSerializer(read_only=True)
    checked_in_location_id = serializers.PrimaryKeyRelatedField(
        queryset=CheckinLocation.objects.all(),
        source='checked_in_location',
        write_only=True,
        allow_null=True
    )

    class Meta:
        model = Attendance
        fields = '__all__'
        read_only_fields = ['driver_name']


class MonthlyAttendanceSummarySerializer(serializers.ModelSerializer):
    driver = DriverSerializer(read_only=True)
    driver_id = serializers.PrimaryKeyRelatedField(
        queryset=Driver.objects.all(),
        source='driver',
        write_only=True
    )

    class Meta:
        model = MonthlyAttendanceSummary
        fields = '__all__'


class WarningLetterSerializer(serializers.ModelSerializer):
    driver = DriverSerializer(read_only=True)
    driver_id = serializers.PrimaryKeyRelatedField(
        queryset=Driver.objects.all(),
        source='driver',
        write_only=True
    )
    issued_by = serializers.SerializerMethodField(read_only=True)
    issued_by_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='issued_by',
        write_only=True,
        allow_null=True
    )
    driver_name = serializers.SerializerMethodField()

    class Meta:
        model = WarningLetter
        fields = '__all__'

    def get_issued_by(self, obj):
        try:
            from usermanagement.serializers import CustomUserSerializer
            return CustomUserSerializer(obj.issued_by).data if obj.issued_by else None
        except ImportError:
            return None

    def get_driver_name(self, obj):
        return obj.driver.driver_name if obj.driver else ''


class TerminationSerializer(serializers.ModelSerializer):
    driver = DriverSerializer(read_only=True)
    driver_id = serializers.PrimaryKeyRelatedField(
        queryset=Driver.objects.all(),
        source='driver',
        write_only=True
    )
    generated_letter = serializers.FileField(read_only=True)
    processed_by = serializers.SerializerMethodField(read_only=True)
    # processed_by_id = serializers.PrimaryKeyRelatedField(
    #     queryset=User.objects.all(),
    #     source='processed_by',
    #     write_only=True,
    #     allow_null=True
    # )

    class Meta:
        model = Termination
        fields = '__all__'

    def get_processed_by(self, obj):
        try:
            from usermanagement.serializers import CustomUserSerializer
            return CustomUserSerializer(obj.processed_by).data if obj.processed_by else None
        except ImportError:
            return None
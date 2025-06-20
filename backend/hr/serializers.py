from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import (
    Driver, Company, 
    CheckinLocation, ApartmentLocation,
    Attendance, MonthlyAttendanceSummary,
    WarningLetter, Termination
)
from vehicle.models import VehicleRegistration

User = get_user_model()


# -----------------------------
# Company Serializer
# -----------------------------
class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'


# -----------------------------
# Vehicle Registration Serializer
# -----------------------------
class VehicleRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleRegistration
        fields = '__all__'


# -----------------------------
# Driver Serializer
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
# Check-in Location Serializer
# -----------------------------
class CheckinLocationSerializer(serializers.ModelSerializer):
    driver = DriverSerializer(read_only=True)
    driver_name = serializers.PrimaryKeyRelatedField(
        queryset=Driver.objects.all(), write_only=True
    )

    class Meta:
        model = CheckinLocation
        fields = [
            'id', 'name', 'latitude', 'longitude', 'radius_meters',
            'is_active', 'created_at', 'updated_at',
            'driver_name', 'driver'
        ]


# -----------------------------
# Apartment Location Serializer
# -----------------------------
class ApartmentLocationSerializer(serializers.ModelSerializer):
    driver = DriverSerializer(read_only=True)
    driver_name = serializers.PrimaryKeyRelatedField(
        queryset=Driver.objects.all(), write_only=True
    )

    class Meta:
        model = ApartmentLocation
        fields = [
            'id', 'name', 'latitude', 'longitude', 'alarm_radius_meters',
            'is_active', 'created_at', 'updated_at',
            'driver_name', 'driver'
        ]


# -----------------------------
# Attendance Serializer
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


# -----------------------------
# Monthly Attendance Summary Serializer
# -----------------------------
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


# -----------------------------
# Warning Letter Serializer
# -----------------------------
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

    class Meta:
        model = WarningLetter
        fields = '__all__'

    def get_issued_by(self, obj):
        from usermanagement.serializers import UserSerializer  # Lazy import to avoid circular import
        return UserSerializer(obj.issued_by).data if obj.issued_by else None


# -----------------------------
# Termination Serializer
# -----------------------------
class TerminationSerializer(serializers.ModelSerializer):
    driver = DriverSerializer(read_only=True)
    driver_id = serializers.PrimaryKeyRelatedField(
        queryset=Driver.objects.all(),
        source='driver',
        write_only=True
    )
    processed_by = serializers.SerializerMethodField(read_only=True)
    processed_by_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='processed_by',
        write_only=True,
        allow_null=True
    )

    class Meta:
        model = Termination
        fields = '__all__'

    def get_processed_by(self, obj):
        from usermanagement.serializers import UserSerializer  # Lazy import to avoid circular import
        return UserSerializer(obj.processed_by).data if obj.processed_by else None

from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Driver, DriverLog, DriverAuth
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


# ==================== DRIVER MOBILE AUTHENTICATION SERIALIZERS ====================

class DriverAuthSerializer(serializers.ModelSerializer):
    """Serializer for DriverAuth model (admin use)"""
    driver_name = serializers.CharField(source='driver.driver_name', read_only=True)
    driver_id = serializers.CharField(source='driver.id', read_only=True)
    driver_status = serializers.CharField(source='driver.status', read_only=True)

    class Meta:
        model = DriverAuth
        fields = [
            'id', 'driver', 'driver_id', 'driver_name', 'driver_status',
            'username', 'is_active', 'is_locked', 'failed_login_attempts',
            'last_login', 'last_failed_login', 'password_changed_at',
            'last_login_device', 'last_login_ip', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'failed_login_attempts', 'last_login', 'last_failed_login',
            'password_changed_at', 'last_login_device', 'last_login_ip',
            'created_at', 'updated_at'
        ]


class DriverAuthCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating driver authentication credentials"""
    password = serializers.CharField(write_only=True, min_length=6, max_length=50)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = DriverAuth
        fields = ['driver', 'username', 'password', 'confirm_password', 'is_active']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")

        # Check if driver already has auth credentials
        if DriverAuth.objects.filter(driver=data['driver']).exists():
            raise serializers.ValidationError("Driver already has authentication credentials")

        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')

        driver_auth = DriverAuth.objects.create(**validated_data)
        driver_auth.set_password(password)
        driver_auth.save()

        return driver_auth


class DriverAuthUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating driver authentication credentials"""
    new_password = serializers.CharField(write_only=True, required=False, min_length=6, max_length=50)
    confirm_password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = DriverAuth
        fields = ['username', 'is_active', 'new_password', 'confirm_password']

    def validate(self, data):
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')

        if new_password or confirm_password:
            if not new_password or not confirm_password:
                raise serializers.ValidationError("Both new_password and confirm_password are required to change password")

            if new_password != confirm_password:
                raise serializers.ValidationError("Passwords do not match")

        return data

    def update(self, instance, validated_data):
        new_password = validated_data.pop('new_password', None)
        validated_data.pop('confirm_password', None)

        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Update password if provided
        if new_password:
            instance.set_password(new_password)

        instance.save()
        return instance


# ==================== DRIVER MOBILE LOGIN SERIALIZERS ====================

class DriverLoginSerializer(serializers.Serializer):
    """Serializer for driver mobile app login"""
    username = serializers.CharField(max_length=50)
    password = serializers.CharField(max_length=50, write_only=True)
    device_info = serializers.CharField(max_length=255, required=False, allow_blank=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            raise serializers.ValidationError("Username and password are required")

        try:
            driver_auth = DriverAuth.objects.select_related('driver').get(username=username)
        except DriverAuth.DoesNotExist:
            raise serializers.ValidationError("Invalid username or password")

        # Check if account can login
        if not driver_auth.can_login:
            if driver_auth.is_locked:
                raise serializers.ValidationError(f"Account is locked. Remaining attempts: {driver_auth.remaining_attempts}")
            elif not driver_auth.is_active:
                raise serializers.ValidationError("Account is deactivated")
            elif driver_auth.driver.status != 'approved':
                raise serializers.ValidationError("Driver account is not approved")

        # Check password
        if not driver_auth.check_password(password):
            driver_auth.record_failed_login()
            remaining = driver_auth.remaining_attempts
            if remaining > 0:
                raise serializers.ValidationError(f"Invalid username or password. {remaining} attempts remaining")
            else:
                raise serializers.ValidationError("Account has been locked due to too many failed attempts")

        data['driver_auth'] = driver_auth
        return data


class DriverProfileSerializer(serializers.ModelSerializer):
    """Serializer for driver profile in mobile app"""
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    vehicle_name = serializers.CharField(source='vehicle.vehicle_name', read_only=True)
    vehicle_number = serializers.CharField(source='vehicle.vehicle_number', read_only=True)

    class Meta:
        model = Driver
        fields = [
            'id', 'driver_name', 'driver_profile_img', 'gender', 'iqama',
            'mobile', 'city', 'nationality', 'dob', 'status',
            'company_name', 'vehicle_name', 'vehicle_number',
            'iqama_expiry', 'passport_expiry', 'license_expiry',
            'visa_expiry', 'medical_expiry'
        ]
        read_only_fields = ['id', 'status']


class DriverChangePasswordSerializer(serializers.Serializer):
    """Serializer for driver to change their own password in mobile app"""
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6, max_length=50)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("New passwords do not match")

        return data

    def validate_current_password(self, value):
        driver_auth = self.context['driver_auth']
        if not driver_auth.check_password(value):
            raise serializers.ValidationError("Current password is incorrect")
        return value

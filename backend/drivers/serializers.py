from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Driver, DriverLog, DriverAuth, NewDriverApplication, WorkingDriver
from company.models import Company
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
        write_only=True,
        required=False,
        allow_null=True
    )

    # Company is stored as CharField in Driver model, so we handle it as string
    company_name = serializers.CharField(source='company', read_only=True)

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


# ==================== NEW ENHANCED DRIVER SERIALIZERS ====================

class NewDriverApplicationSerializer(serializers.ModelSerializer):
    age_calculated = serializers.SerializerMethodField()
    application_status_display = serializers.CharField(source='get_status_display', read_only=True)
    company_name = serializers.CharField(source='company.company_name', read_only=True)

    # Handle company selection by name or ID
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(),
        source='company',
        write_only=True,
        required=False
    )

    class Meta:
        model = NewDriverApplication
        fields = '__all__'
        read_only_fields = ('application_number', 'age', 'created_at', 'updated_at')

    def get_age_calculated(self, obj):
        if obj.date_of_birth:
            from datetime import date
            today = date.today()
            return today.year - obj.date_of_birth.year - ((today.month, today.day) < (obj.date_of_birth.month, obj.date_of_birth.day))
        return None

    def validate(self, data):
        # Handle company selection by name if company_id not provided
        if 'company' not in data and 'company_name' in self.initial_data:
            try:
                company = Company.objects.get(company_name=self.initial_data['company_name'])
                data['company'] = company
            except Company.DoesNotExist:
                raise serializers.ValidationError(f"Company '{self.initial_data['company_name']}' not found")

        return data

    def create(self, validated_data):
        # Auto-calculate age before saving
        if validated_data.get('date_of_birth'):
            from datetime import date
            today = date.today()
            dob = validated_data['date_of_birth']
            age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
            validated_data['age'] = age

        return super().create(validated_data)


class WorkingDriverSerializer(serializers.ModelSerializer):
    age_calculated = serializers.SerializerMethodField()
    employment_status_display = serializers.CharField(source='get_employment_status_display', read_only=True)
    documents_expiring_soon = serializers.ReadOnlyField()
    all_accessories_issued = serializers.ReadOnlyField()

    class Meta:
        model = WorkingDriver
        fields = '__all__'
        read_only_fields = ('total_trips', 'total_earnings', 'created_at', 'updated_at')

    def get_age_calculated(self, obj):
        return obj.age

    def validate(self, data):
        # Validate that expiry dates are in the future
        from datetime import date
        today = date.today()

        if data.get('civil_id_expiry') and data['civil_id_expiry'] <= today:
            raise serializers.ValidationError({'civil_id_expiry': 'Civil ID expiry date must be in the future'})

        if data.get('license_expiry_date') and data['license_expiry_date'] <= today:
            raise serializers.ValidationError({'license_expiry_date': 'License expiry date must be in the future'})

        if data.get('vehicle_expiry_date') and data['vehicle_expiry_date'] <= today:
            raise serializers.ValidationError({'vehicle_expiry_date': 'Vehicle expiry date must be in the future'})

        if data.get('health_card_expiry') and data['health_card_expiry'] <= today:
            raise serializers.ValidationError({'health_card_expiry': 'Health card expiry date must be in the future'})

        return data


# Simplified serializers for list views
class NewDriverApplicationListSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = NewDriverApplication
        fields = ['id', 'application_number', 'full_name', 'company_name', 'status', 'status_display',
                 'vehicle_type', 'nationality', 'phone_number', 'application_date', 'age']


class WorkingDriverListSerializer(serializers.ModelSerializer):
    employment_status_display = serializers.CharField(source='get_employment_status_display', read_only=True)
    working_department_display = serializers.CharField(source='get_working_department_display', read_only=True)
    age_calculated = serializers.ReadOnlyField(source='age')

    class Meta:
        model = WorkingDriver
        fields = ['id', 'employee_id', 'full_name', 'employment_status', 'employment_status_display',
                 'working_department', 'working_department_display', 'vehicle_type', 'vehicle_model',
                 'phone_number', 'nationality', 'age_calculated', 'joining_date', 'rating']


# Driver form submission serializer
class DriverFormSubmissionSerializer(serializers.Serializer):
    driver_type = serializers.ChoiceField(choices=[('new', 'New Driver'), ('working', 'Working Driver')])

    # Common fields
    full_name = serializers.CharField(max_length=255)
    gender = serializers.ChoiceField(choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')])
    date_of_birth = serializers.DateField()
    nationality = serializers.CharField(max_length=100)
    phone_number = serializers.CharField(max_length=20)
    vehicle_type = serializers.CharField(max_length=20)

    # New driver specific fields
    passport_document = serializers.FileField(required=False)
    visa_document = serializers.FileField(required=False)
    police_certificate = serializers.FileField(required=False)
    passport_photo = serializers.ImageField(required=False)
    medical_certificate = serializers.FileField(required=False)
    city = serializers.CharField(max_length=100, required=False)
    company = serializers.CharField(max_length=100, required=False)
    apartment_area = serializers.CharField(max_length=200, required=False)
    marital_status = serializers.CharField(max_length=20, required=False)
    blood_group = serializers.CharField(max_length=5, required=False)
    home_country_address = serializers.CharField(required=False)
    home_country_phone = serializers.CharField(max_length=20, required=False)
    nominee_name = serializers.CharField(max_length=255, required=False)
    nominee_relationship = serializers.CharField(max_length=20, required=False)
    nominee_phone = serializers.CharField(max_length=20, required=False)
    nominee_address = serializers.CharField(required=False)
    t_shirt_size = serializers.CharField(max_length=5, required=False)
    weight = serializers.DecimalField(max_digits=5, decimal_places=2, required=False)
    height = serializers.DecimalField(max_digits=5, decimal_places=2, required=False)
    kuwait_entry_date = serializers.DateField(required=False)
    vehicle_destination = serializers.CharField(max_length=200, required=False)

    # Working driver specific fields
    vehicle_model = serializers.CharField(max_length=100, required=False)
    employee_id = serializers.CharField(max_length=20, required=False)
    civil_id_front = serializers.ImageField(required=False)
    civil_id_back = serializers.ImageField(required=False)
    license_front = serializers.ImageField(required=False)
    license_back = serializers.ImageField(required=False)
    vehicle_documents = serializers.FileField(required=False)
    driver_photo = serializers.ImageField(required=False)
    health_card_document = serializers.FileField(required=False)
    vehicle_photo_front = serializers.ImageField(required=False)
    vehicle_photo_back = serializers.ImageField(required=False)
    vehicle_photo_left = serializers.ImageField(required=False)
    vehicle_photo_right = serializers.ImageField(required=False)
    civil_id_number = serializers.CharField(max_length=50, required=False)
    civil_id_expiry = serializers.DateField(required=False)
    license_number = serializers.CharField(max_length=50, required=False)
    license_expiry_date = serializers.DateField(required=False)
    vehicle_number = serializers.CharField(max_length=50, required=False)
    vehicle_expiry_date = serializers.DateField(required=False)
    health_card_number = serializers.CharField(max_length=50, required=False)
    health_card_expiry = serializers.DateField(required=False)
    working_department = serializers.CharField(max_length=20, required=False)

    # Accessory Quantities (for both new and working drivers)
    t_shirt_quantity = serializers.IntegerField(default=0, required=False)
    cap_quantity = serializers.IntegerField(default=0, required=False)
    jackets_quantity = serializers.IntegerField(default=0, required=False)
    bag_quantity = serializers.IntegerField(default=0, required=False)
    wristbands_quantity = serializers.IntegerField(default=0, required=False)
    water_bottle_quantity = serializers.IntegerField(default=0, required=False)
    safety_gear_quantity = serializers.IntegerField(default=0, required=False)
    helmet_quantity = serializers.IntegerField(default=0, required=False)

    # Working driver accessories (boolean fields for issued status)
    t_shirt_issued = serializers.BooleanField(required=False)
    cap_issued = serializers.BooleanField(required=False)
    bag_issued = serializers.BooleanField(required=False)
    vest_issued = serializers.BooleanField(required=False)
    safety_equipment_issued = serializers.BooleanField(required=False)
    helmet_issued = serializers.BooleanField(required=False)
    cool_jacket_issued = serializers.BooleanField(required=False)
    water_bottle_issued = serializers.BooleanField(required=False)

    def validate(self, data):
        driver_type = data.get('driver_type')

        if driver_type == 'new':
            # Validate required fields for new driver
            required_fields = ['city', 'company', 'apartment_area', 'nominee_name', 'kuwait_entry_date']
            for field in required_fields:
                if not data.get(field):
                    raise serializers.ValidationError({field: f'{field} is required for new driver application'})

        elif driver_type == 'working':
            # Validate required fields for working driver
            required_fields = ['employee_id', 'vehicle_model', 'civil_id_number', 'civil_id_expiry',
                             'license_number', 'license_expiry_date', 'working_department']
            for field in required_fields:
                if not data.get(field):
                    raise serializers.ValidationError({field: f'{field} is required for working driver'})

        return data

    def create(self, validated_data):
        driver_type = validated_data.pop('driver_type')

        if driver_type == 'new':
            # Create new driver application
            company_name = validated_data.pop('company', None)
            if company_name:
                try:
                    company = Company.objects.get(company_name=company_name)
                    validated_data['company'] = company
                except Company.DoesNotExist:
                    raise serializers.ValidationError(f"Company '{company_name}' not found")
            else:
                raise serializers.ValidationError("Company is required for new driver application")

            return NewDriverApplication.objects.create(**validated_data)

        elif driver_type == 'working':
            # Create working driver
            company_name = validated_data.pop('company', None)
            if company_name:
                try:
                    company = Company.objects.get(company_name=company_name)
                    validated_data['company'] = company
                except Company.DoesNotExist:
                    raise serializers.ValidationError(f"Company '{company_name}' not found")
            else:
                # Default to first company if not specified
                company = Company.objects.first()
                if not company:
                    raise serializers.ValidationError("No companies available")
                validated_data['company'] = company

            validated_data['created_by'] = 'System'  # Should be from request.user

            return WorkingDriver.objects.create(**validated_data)

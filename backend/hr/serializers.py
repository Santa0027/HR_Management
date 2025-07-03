from rest_framework import serializers
from django.contrib.auth import get_user_model

# Assuming these imports are correct based on your setup
from .models import (
    Driver, Company,
    CheckinLocation, ApartmentLocation,
    Attendance, MonthlyAttendanceSummary,
    WarningLetter, Termination,
    Employee, LeaveType, LeaveBalance, LeaveRequest, PerformanceReview,
    Goal, EmployeeDocument, Payroll, Training, TrainingEnrollment,
    HRPolicy, PolicyAcknowledgment
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
    driver_id = serializers.PrimaryKeyRelatedField(read_only=True)



    class Meta:
        model = CheckinLocation
        fields = "__all__"
    # def create(self, validated_data):
    #     driver_id = validated_data.get("driver_id")
    #     if not driver_id:
    #         raise serializers.ValidationError({"driver_id": "This field is required."})
        
    #     # Proceed using driver_id now safely
    #     return CheckinLocation.objects.create(**validated_data)


    # def update(self, instance, validated_data):
    #     driver_id = validated_data.pop('driver_id', None)
        
    #     if driver_id is not None:
    #         try:
    #             # This line remains correct as your model field is named 'driver'
    #             instance.driver = Driver.objects.get(id=driver_id)
    #         except Driver.DoesNotExist:
    #             raise serializers.ValidationError({"driver_id": "Driver with this ID does not exist."})

    #     for attr, value in validated_data.items():
    #         setattr(instance, attr, value)
        
    #     instance.save()
    #     return instance


# -----------------------------
# Apartment Location Serializer (REMOVED DRIVER NESTED FIELD)
# -----------------------------
class ApartmentLocationSerializer(serializers.ModelSerializer):
    # driver_id = serializers.PrimaryKeyRelatedField(
    #     queryset=Driver.objects.all(),
    #     write_only=True # <--- This is the key.
    # )
    driver_id = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = ApartmentLocation
        fields = "__all__" # <--- This is interacting with the above.

    # def create(self, validated_data):
    #     driver_id = validated_data.pop('driver_id') # Correctly pops the ID
    #     try:
    #         driver_instance = Driver.objects.get(id=driver_id) # Correctly gets the Driver instance
    #     except Driver.DoesNotExist:
    #         raise serializers.ValidationError({"driver_id": "Driver with this ID does not exist."})
        
    #     # This line remains correct as your model field is named 'driver'
    #     apartment_location = ApartmentLocation.objects.create(driver=driver_instance, **validated_data)
    #     return apartment_location

    # def update(self, instance, validated_data):
    #     driver_id = validated_data.pop('driver_id', None)
        
    #     if driver_id is not None:
    #         try:
    #             # This line remains correct as your model field is named 'driver'
    #             instance.driver = Driver.objects.get(id=driver_id)
    #         except Driver.DoesNotExist:
    #             raise serializers.ValidationError({"driver_id": "Driver with this ID does not exist."})

    #     for attr, value in validated_data.items():
    #         setattr(instance, attr, value)
        
    #     instance.save()
    #     return instance


# -----------------------------
# Other Serializers (No changes needed)
# -----------------------------
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
    active_time_hours = serializers.FloatField(read_only=True)

    class Meta:
        model = Attendance
        fields = '__all__'
        read_only_fields = ['status', 'created_at', 'updated_at', 'active_time_hours']
        # Explicitly mark photo fields as not required by the serializer if they are nullable in the model
        extra_kwargs = {
            'login_photo': {'required': False, 'allow_null': True},
            'logout_photo': {'required': False, 'allow_null': True},
            'reason_for_deduction': {'required': False, 'allow_null': True},
            'deduct_amount': {'required': False, 'allow_null': True},
            'platform': {'required': False, 'allow_null': True},
            'assigned_time': {'required': False, 'allow_null': True},
            'login_latitude': {'required': False, 'allow_null': True},
            'login_longitude': {'required': False, 'allow_null': True},
            'logout_latitude': {'required': False, 'allow_null': True},
            'logout_longitude': {'required': False, 'allow_null': True},
        }


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


from rest_framework import serializers
from .models import WarningLetter, Termination # Assuming these are in the same models.py
from drivers.models import Driver # Make sure Driver is imported if not using string literal
from django.contrib.auth import get_user_model
User = get_user_model()

# Assuming DriverSerializer is defined or imported here
# from .your_app_name.serializers import DriverSerializer # If in a different file
class DriverSerializer(serializers.ModelSerializer): # Placeholder if not defined elsewhere
    class Meta:
        model = Driver
        fields = ['id', 'driver_name']

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
    generated_letter = serializers.FileField(read_only=True) # <<< ADD THIS LINE FOR CLARITY

    class Meta:
        model = WarningLetter
        fields = '__all__' # This will now include 'generated_letter' and it's explicitly defined above

    def get_issued_by(self, obj):
        try:
            from usermanagement.serializers import CustomUserSerializer
            return CustomUserSerializer(obj.issued_by).data if obj.issued_by else None
        except ImportError:
            # Fallback if CustomUserSerializer cannot be imported (e.g., during testing or if app not installed)
            return {'id': obj.issued_by.id, 'user': obj.issued_by.user} if obj.issued_by else None


    def get_driver_name(self, obj):
        return obj.driver.driver_name if obj.driver else ''


# your_app_name/serializers.py (e.g., terminations/serializers.py)

from rest_framework import serializers
from .models import Termination  # Assuming your Termination model is here
# from driver.models import Driver # Import your Driver model
# from accounts.models import User # If processed_by is a User model


# /home/ubuntu/app/HR_Management/backend/hr/serializers.py

from rest_framework import serializers
from .models import Termination # Make sure you import your Termination model
from driver.models import Driver # Assuming Driver model is in driver.models
from django.contrib.auth import get_user_model

User = get_user_model() # Get the User model for processed_by

class TerminationSerializer(serializers.ModelSerializer):
    # These fields are for input (write_only) and expect primary keys (IDs)
    driver = serializers.PrimaryKeyRelatedField(
        queryset=Driver.objects.all(),
        write_only=True
    )
    processed_by = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        required=False # `processed_by` can be optional
    )

    # These fields are for output (read_only) and display related object details
    # You'll need to confirm these fields exist on your Driver and User models
    driver_name = serializers.CharField(source='driver.driver_name', read_only=True)
    processed_by_name = serializers.CharField(source='processed_by.username', read_only=True)


    class Meta:
        model = Termination
        fields = [
            'id',
            'driver',
            'driver_name', # For display in API responses
            'termination_date',
            'reason',
            'details',
            'document',
            'processed_by',
            'processed_by_name', # For display in API responses
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


    def create(self, validated_data):
        driver = validated_data.pop('driver')
        processed_by = validated_data.pop('processed_by', None)

        termination = Termination.objects.create(
            driver=driver,
            processed_by=processed_by,
            **validated_data
        )

        # Mark the driver as inactive upon successful termination
        if driver:
            driver.is_active = False # Assuming 'is_active' field exists on your Driver model
            driver.save()
        return termination

    def update(self, instance, validated_data):
        # Retrieve the old driver and the new driver (if changed)
        current_driver = instance.driver
        new_driver = validated_data.get('driver', current_driver)

        # Retrieve the new processed_by user (if changed)
        new_processed_by = validated_data.get('processed_by', instance.processed_by)

        # Update standard fields
        instance.termination_date = validated_data.get('termination_date', instance.termination_date)
        instance.reason = validated_data.get('reason', instance.reason)
        instance.details = validated_data.get('details', instance.details)
        instance.document = validated_data.get('document', instance.document) # Handle file updates


        # Logic for managing driver status when updating a termination record
        if new_driver != current_driver:
            # If the driver is changed in the termination record:
            # 1. Reactivate the *old* driver (if it exists)
            if current_driver:
                current_driver.is_active = True
                current_driver.save()
            # 2. Deactivate the *new* driver selected for this termination
            if new_driver:
                new_driver.is_active = False
                new_driver.save()
            instance.driver = new_driver # Assign the new driver to the instance
        elif new_driver and new_driver.is_active:
            # If the driver remains the same but was somehow still active, ensure deactivation.
            # This handles edge cases where the driver might have been manually reactivated elsewhere.
            new_driver.is_active = False
            new_driver.save()

        # Update the processed_by user
        instance.processed_by = new_processed_by

        # Save all changes to the Termination instance
        instance.save()
        return instance

class EmployeeSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    years_of_service = serializers.ReadOnlyField()
    manager_name = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = '__all__'
        extra_kwargs = {
            'user': {'read_only': True},
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }

    def get_manager_name(self, obj):
        return obj.manager.full_name if obj.manager else None

    def get_company_name(self, obj):
        return obj.company.company_name if obj.company else None


class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = '__all__'


class LeaveBalanceSerializer(serializers.ModelSerializer):
    remaining_days = serializers.ReadOnlyField()
    employee_name = serializers.SerializerMethodField()
    leave_type_name = serializers.SerializerMethodField()

    class Meta:
        model = LeaveBalance
        fields = '__all__'

    def get_employee_name(self, obj):
        return obj.employee.full_name

    def get_leave_type_name(self, obj):
        return obj.leave_type.name


class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    leave_type_name = serializers.SerializerMethodField()
    approved_by_name = serializers.SerializerMethodField()

    class Meta:
        model = LeaveRequest
        fields = '__all__'
        extra_kwargs = {
            'days_requested': {'read_only': True},
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }

    def get_employee_name(self, obj):
        return obj.employee.full_name

    def get_leave_type_name(self, obj):
        return obj.leave_type.name

    def get_approved_by_name(self, obj):
        return obj.approved_by.full_name if obj.approved_by else None


class PerformanceReviewSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    reviewer_name = serializers.SerializerMethodField()
    approved_by_name = serializers.SerializerMethodField()
    average_rating = serializers.ReadOnlyField()

    class Meta:
        model = PerformanceReview
        fields = '__all__'

    def get_employee_name(self, obj):
        return obj.employee.full_name

    def get_reviewer_name(self, obj):
        return obj.reviewer.full_name

    def get_approved_by_name(self, obj):
        return obj.approved_by.full_name if obj.approved_by else None


class GoalSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    is_overdue = serializers.ReadOnlyField()

    class Meta:
        model = Goal
        fields = '__all__'

    def get_employee_name(self, obj):
        return obj.employee.full_name

    def get_created_by_name(self, obj):
        return obj.created_by.full_name


class EmployeeDocumentSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    uploaded_by_name = serializers.SerializerMethodField()
    is_expired = serializers.ReadOnlyField()

    class Meta:
        model = EmployeeDocument
        fields = '__all__'

    def get_employee_name(self, obj):
        return obj.employee.full_name

    def get_uploaded_by_name(self, obj):
        return obj.uploaded_by.full_name


class PayrollSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    processed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Payroll
        fields = '__all__'
        extra_kwargs = {
            'gross_salary': {'read_only': True},
            'total_deductions': {'read_only': True},
            'net_salary': {'read_only': True},
            'overtime_pay': {'read_only': True},
        }

    def get_employee_name(self, obj):
        return obj.employee.full_name

    def get_processed_by_name(self, obj):
        return obj.processed_by.full_name if obj.processed_by else None


class TrainingSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    enrolled_count = serializers.ReadOnlyField()
    available_slots = serializers.ReadOnlyField()

    class Meta:
        model = Training
        fields = '__all__'

    def get_created_by_name(self, obj):
        return obj.created_by.full_name


class TrainingEnrollmentSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    training_title = serializers.SerializerMethodField()

    class Meta:
        model = TrainingEnrollment
        fields = '__all__'

    def get_employee_name(self, obj):
        return obj.employee.full_name

    def get_training_title(self, obj):
        return obj.training.title


class HRPolicySerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = HRPolicy
        fields = '__all__'

    def get_created_by_name(self, obj):
        return obj.created_by.full_name


class PolicyAcknowledgmentSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    policy_title = serializers.SerializerMethodField()

    class Meta:
        model = PolicyAcknowledgment
        fields = '__all__'

    def get_employee_name(self, obj):
        return obj.employee.full_name

    def get_policy_title(self, obj):
        return obj.policy.title
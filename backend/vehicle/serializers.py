from rest_framework import serializers
from .models import (
    VehicleRegistration,
    VehicleLog,
    VehicleServiceRecord,
    VehicleFuelRecord,
    VehicleRentalRecord,
    VehicleExpense
)

class VehicleRegistrationSerializer(serializers.ModelSerializer):
    # Add computed fields
    assigned_driver_name = serializers.CharField(source='assigned_driver.driver_name', read_only=True)
    days_since_last_service = serializers.SerializerMethodField()
    documents_expiring_soon = serializers.SerializerMethodField()

    class Meta:
        model = VehicleRegistration
        fields = '__all__'

    def get_days_since_last_service(self, obj):
        """Calculate days since last service"""
        if obj.last_service_date:
            from datetime import date
            return (date.today() - obj.last_service_date).days
        return None

    def get_documents_expiring_soon(self, obj):
        """Get list of documents expiring within 30 days"""
        from datetime import date, timedelta
        thirty_days_from_now = date.today() + timedelta(days=30)
        expiring = []

        if obj.insurance_expiry_date and obj.insurance_expiry_date <= thirty_days_from_now:
            expiring.append({
                'type': 'Insurance',
                'expiry_date': obj.insurance_expiry_date,
                'days_remaining': (obj.insurance_expiry_date - date.today()).days
            })
        if obj.rc_expiry_date and obj.rc_expiry_date <= thirty_days_from_now:
            expiring.append({
                'type': 'RC',
                'expiry_date': obj.rc_expiry_date,
                'days_remaining': (obj.rc_expiry_date - date.today()).days
            })
        if obj.next_service_date and obj.next_service_date <= thirty_days_from_now:
            expiring.append({
                'type': 'Service Due',
                'expiry_date': obj.next_service_date,
                'days_remaining': (obj.next_service_date - date.today()).days
            })

        return expiring

class VehicleLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    vehicle_name = serializers.CharField(source='vehicle.vehicle_name', read_only=True)

    class Meta:
        model = VehicleLog
        fields = '__all__'

class VehicleServiceRecordSerializer(serializers.ModelSerializer):
    vehicle_name = serializers.CharField(source='vehicle.vehicle_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = VehicleServiceRecord
        fields = '__all__'

class VehicleFuelRecordSerializer(serializers.ModelSerializer):
    vehicle_name = serializers.CharField(source='vehicle.vehicle_name', read_only=True)
    driver_name = serializers.CharField(source='driver.driver_name', read_only=True)
    fuel_efficiency = serializers.SerializerMethodField()

    class Meta:
        model = VehicleFuelRecord
        fields = '__all__'

    def get_fuel_efficiency(self, obj):
        """Calculate fuel efficiency if distance is available"""
        if obj.distance_covered and obj.quantity_liters:
            return round(float(obj.distance_covered) / float(obj.quantity_liters), 2)
        return None

class VehicleRentalRecordSerializer(serializers.ModelSerializer):
    vehicle_name = serializers.CharField(source='vehicle.vehicle_name', read_only=True)
    days_remaining = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = VehicleRentalRecord
        fields = '__all__'

    def get_days_remaining(self, obj):
        """Calculate days remaining for active leases"""
        if obj.lease_status == 'ACTIVE':
            from datetime import date
            return (obj.lease_end_date.date() - date.today()).days
        return None

    def get_is_overdue(self, obj):
        """Check if lease is overdue"""
        if obj.lease_status == 'ACTIVE':
            from datetime import date
            return obj.lease_end_date.date() < date.today()
        return False

class VehicleExpenseSerializer(serializers.ModelSerializer):
    vehicle_name = serializers.CharField(source='vehicle.vehicle_name', read_only=True)
    driver_name = serializers.CharField(source='driver.driver_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.username', read_only=True)

    class Meta:
        model = VehicleExpense
        fields = '__all__'

from rest_framework import serializers
from .models import Trip, TripExpense, DriverEarningsSummary
from drivers.models import Driver
from company.models import Company
from vehicle.models import VehicleRegistration


class TripExpenseSerializer(serializers.ModelSerializer):
    """Serializer for trip expenses"""
    
    class Meta:
        model = TripExpense
        fields = [
            'id', 'expense_type', 'amount', 'description', 'receipt_image',
            'expense_date', 'is_reimbursable', 'is_reimbursed', 'reimbursed_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TripSerializer(serializers.ModelSerializer):
    """Comprehensive serializer for Trip model"""
    
    # Read-only fields for display
    driver_name = serializers.CharField(source='driver.driver_name', read_only=True)
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    vehicle_number = serializers.CharField(source='vehicle.vehicle_number', read_only=True)
    
    # Nested expenses
    expenses = TripExpenseSerializer(many=True, read_only=True)
    
    # Calculated fields
    total_earnings = serializers.ReadOnlyField()
    trip_duration_hours = serializers.ReadOnlyField()
    
    class Meta:
        model = Trip
        fields = [
            # Basic Information
            'id', 'trip_id', 'driver', 'driver_name', 'company', 'company_name',
            'vehicle', 'vehicle_number',
            
            # Customer Information
            'customer_name', 'customer_phone', 'customer_rating',
            
            # Trip Details
            'trip_type', 'pickup_location', 'pickup_latitude', 'pickup_longitude',
            'pickup_time', 'dropoff_location', 'dropoff_latitude', 'dropoff_longitude',
            'dropoff_time',
            
            # Trip Metrics
            'distance_km', 'duration_minutes', 'waiting_time_minutes',
            'trip_duration_hours',
            
            # Financial Information
            'base_fare', 'distance_fare', 'time_fare', 'waiting_charges',
            'surge_multiplier', 'total_fare', 'tip_amount', 'toll_charges',
            'parking_charges', 'additional_charges',
            
            # Commission and Earnings
            'platform_commission_rate', 'platform_commission_amount',
            'driver_earnings', 'total_earnings',
            
            # Payment Information
            'payment_method', 'payment_status', 'payment_reference',
            
            # Status and Tracking
            'status', 'started_at', 'completed_at', 'cancelled_at',
            'cancellation_reason',
            
            # Additional Information
            'notes', 'driver_rating', 'customer_feedback',
            
            # Nested data
            'expenses',
            
            # Metadata
            'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = [
            'id', 'trip_id', 'total_fare', 'platform_commission_amount',
            'driver_earnings', 'total_earnings', 'trip_duration_hours',
            'driver_name', 'company_name', 'vehicle_number', 'expenses',
            'created_at', 'updated_at'
        ]

    def validate(self, data):
        """Custom validation for trip data"""
        
        # Validate that dropoff time is after pickup time
        if data.get('pickup_time') and data.get('dropoff_time'):
            if data['dropoff_time'] <= data['pickup_time']:
                raise serializers.ValidationError(
                    "Dropoff time must be after pickup time"
                )
        
        # Validate distance and duration
        if data.get('distance_km') and data['distance_km'] <= 0:
            raise serializers.ValidationError(
                "Distance must be greater than 0"
            )
        
        if data.get('duration_minutes') and data['duration_minutes'] <= 0:
            raise serializers.ValidationError(
                "Duration must be greater than 0"
            )
        
        # Validate fare amounts
        if data.get('base_fare') and data['base_fare'] < 0:
            raise serializers.ValidationError(
                "Base fare cannot be negative"
            )
        
        if data.get('tip_amount') and data['tip_amount'] < 0:
            raise serializers.ValidationError(
                "Tip amount cannot be negative"
            )
        
        return data


class TripCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating trips from mobile app"""
    
    class Meta:
        model = Trip
        fields = [
            'driver', 'customer_name', 'pickup_location', 'dropoff_location',
            'distance_km', 'duration_minutes', 'base_fare', 'tip_amount',
            'payment_method', 'notes'
        ]

    def create(self, validated_data):
        """Create trip with default values"""
        # Set default values for mobile app creation
        validated_data['status'] = 'completed'
        validated_data['created_by'] = 'mobile_app'
        validated_data['distance_fare'] = 0
        validated_data['time_fare'] = 0
        validated_data['waiting_charges'] = 0
        validated_data['toll_charges'] = 0
        validated_data['parking_charges'] = 0
        validated_data['additional_charges'] = 0
        validated_data['platform_commission_rate'] = 0  # No commission for now
        
        return super().create(validated_data)


class DriverEarningsSummarySerializer(serializers.ModelSerializer):
    """Serializer for driver earnings summary"""
    
    driver_name = serializers.CharField(source='driver.driver_name', read_only=True)
    average_trip_earnings = serializers.SerializerMethodField()
    average_trip_distance = serializers.SerializerMethodField()
    
    class Meta:
        model = DriverEarningsSummary
        fields = [
            'id', 'driver', 'driver_name', 'period_type', 'period_start', 'period_end',
            'total_trips', 'completed_trips', 'cancelled_trips',
            'total_distance_km', 'total_duration_minutes',
            'total_fare', 'total_tips', 'total_commission', 'net_earnings',
            'cash_earnings', 'digital_earnings', 'total_expenses', 'fuel_expenses',
            'average_trip_earnings', 'average_trip_distance',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'driver_name', 'created_at', 'updated_at']

    def get_average_trip_earnings(self, obj):
        """Calculate average earnings per trip"""
        if obj.completed_trips > 0:
            return round(float(obj.net_earnings) / obj.completed_trips, 2)
        return 0

    def get_average_trip_distance(self, obj):
        """Calculate average distance per trip"""
        if obj.completed_trips > 0:
            return round(float(obj.total_distance_km) / obj.completed_trips, 2)
        return 0


class TripStatsSerializer(serializers.Serializer):
    """Serializer for trip statistics and analytics"""
    
    total_trips = serializers.IntegerField()
    completed_trips = serializers.IntegerField()
    cancelled_trips = serializers.IntegerField()
    total_earnings = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_tips = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_distance = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_duration = serializers.IntegerField()
    average_trip_earnings = serializers.DecimalField(max_digits=10, decimal_places=2)
    average_trip_distance = serializers.DecimalField(max_digits=8, decimal_places=2)
    cash_trips = serializers.IntegerField()
    digital_trips = serializers.IntegerField()
    cash_earnings = serializers.DecimalField(max_digits=10, decimal_places=2)
    digital_earnings = serializers.DecimalField(max_digits=10, decimal_places=2)


class TripSummarySerializer(serializers.ModelSerializer):
    """Lightweight serializer for trip summaries and lists"""
    
    driver_name = serializers.CharField(source='driver.driver_name', read_only=True)
    total_earnings = serializers.ReadOnlyField()
    
    class Meta:
        model = Trip
        fields = [
            'id', 'trip_id', 'driver', 'driver_name', 'customer_name',
            'pickup_location', 'dropoff_location', 'distance_km',
            'duration_minutes', 'total_fare', 'tip_amount', 'total_earnings',
            'payment_method', 'status', 'created_at'
        ]

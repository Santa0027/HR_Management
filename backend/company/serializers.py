# companies/serializers.py

from rest_framework import serializers
from .models import Company, EmployeeAccessory

class EmployeeAccessorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeAccessory
        fields = [
            'id', 'name', 'description', 'category', 'icon', 'color',
            'enabled', 'default_quantity', 'initial_stock', 'size_required',
            'size_options', 'created_at', 'updated_at'
        ]

class CompanySerializer(serializers.ModelSerializer):
    driver_count = serializers.IntegerField(read_only=True)
    employee_accessories = EmployeeAccessorySerializer(many=True, read_only=True)

    # Commission data for cars
    car_commission_info = serializers.SerializerMethodField()

    # Commission data for bikes
    bike_commission_info = serializers.SerializerMethodField()

    # General commission info (legacy)
    commission_info = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = '__all__'

    def get_car_commission_info(self, obj):
        """Get car commission information"""
        return {
            'type': obj.car_commission_type,
            'rate_per_km': obj.car_rate_per_km,
            'min_km': obj.car_min_km,
            'rate_per_order': obj.car_rate_per_order,
            'fixed_commission': obj.car_fixed_commission,
        }

    def get_bike_commission_info(self, obj):
        """Get bike commission information"""
        return {
            'type': obj.bike_commission_type,
            'rate_per_km': obj.bike_rate_per_km,
            'min_km': obj.bike_min_km,
            'rate_per_order': obj.bike_rate_per_order,
            'fixed_commission': obj.bike_fixed_commission,
        }

    def get_commission_info(self, obj):
        """Get general commission information (legacy)"""
        return {
            'type': obj.commission_type,
            'rate_per_km': obj.rate_per_km,
            'min_km': obj.min_km,
            'rate_per_order': obj.rate_per_order,
            'fixed_commission': obj.fixed_commission,
        }

class CompanyListSerializer(serializers.ModelSerializer):
    """Simplified serializer for company lists"""
    driver_count = serializers.IntegerField(read_only=True)
    accessories_count = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = [
            'id', 'company_name', 'contact_person', 'contact_phone',
            'contact_email', 'city', 'country', 'driver_count',
            'accessories_count', 'created_at'
        ]

    def get_accessories_count(self, obj):
        """Get count of enabled accessories"""
        return obj.employee_accessories.filter(enabled=True).count()

class CompanyCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating companies with accessories"""
    employee_accessories = EmployeeAccessorySerializer(many=True, required=False)

    class Meta:
        model = Company
        fields = '__all__'

    def create(self, validated_data):
        accessories_data = validated_data.pop('employee_accessories', [])
        company = Company.objects.create(**validated_data)

        # Create accessories
        for accessory_data in accessories_data:
            EmployeeAccessory.objects.create(company=company, **accessory_data)

        return company

    def update(self, instance, validated_data):
        accessories_data = validated_data.pop('employee_accessories', None)

        # Update company fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update accessories if provided
        if accessories_data is not None:
            # Clear existing accessories
            instance.employee_accessories.all().delete()

            # Create new accessories
            for accessory_data in accessories_data:
                EmployeeAccessory.objects.create(company=instance, **accessory_data)

        return instance
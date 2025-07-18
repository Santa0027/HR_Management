# companies/serializers.py

from rest_framework import serializers
from .models import Company

class CompanySerializer(serializers.ModelSerializer):
    driver_count = serializers.IntegerField(read_only=True)

    # Commission data for cars
    car_commission_info = serializers.SerializerMethodField()

    # Commission data for bikes
    bike_commission_info = serializers.SerializerMethodField()

    # Employee accessories data
    employee_accessories = serializers.SerializerMethodField()

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

    def get_employee_accessories(self, obj):
        """Get employee accessories from company fields"""
        accessories = []

        # Define accessory mapping (no quantities - just availability)
        accessory_fields = [
            ('t_shirt', 'T-Shirt', '👕', 'uniform'),
            ('cap', 'Cap', '🧢', 'uniform'),
            ('jackets', 'Jackets', '🧥', 'uniform'),
            ('bag', 'Bag', '🎒', 'personal'),
            ('wristbands', 'Wristbands', '⌚', 'personal'),
            ('water_bottle', 'Water Bottle', '🍼', 'personal'),
            ('safety_gear', 'Safety Gear', '🦺', 'safety'),
            ('helmet', 'Helmet', '⛑️', 'safety'),
        ]

        for enabled_field, name, icon, category in accessory_fields:
            if getattr(obj, enabled_field, False):
                accessories.append({
                    'name': name,
                    'description': f"Company provided {name.lower()}",
                    'category': category,
                    'icon': icon,
                    'enabled': True,
                })

        return accessories

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
        count = 0
        accessory_fields = ['t_shirt', 'cap', 'jackets', 'bag', 'wristbands', 'water_bottle', 'safety_gear', 'helmet']
        for field in accessory_fields:
            if getattr(obj, field, False):
                count += 1
        return count

class CompanyCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating companies with accessories"""

    class Meta:
        model = Company
        fields = '__all__'

    def to_internal_value(self, data):
        """Transform frontend nested commission data to flat model fields"""
        # Handle car commission details
        if 'car_commission_details' in data:
            car_data = data.pop('car_commission_details', {})
            if isinstance(car_data, dict):
                data['car_commission_type'] = car_data.get('commission_type', 'FIXED')
                data['car_rate_per_km'] = car_data.get('rate_per_km', '')
                data['car_min_km'] = car_data.get('min_km', '')
                data['car_rate_per_order'] = car_data.get('rate_per_order', '')
                data['car_fixed_commission'] = car_data.get('fixed_commission', '')

        # Handle bike commission details
        if 'bike_commission_details' in data:
            bike_data = data.pop('bike_commission_details', {})
            if isinstance(bike_data, dict):
                data['bike_commission_type'] = bike_data.get('commission_type', 'FIXED')
                data['bike_rate_per_km'] = bike_data.get('rate_per_km', '')
                data['bike_min_km'] = bike_data.get('min_km', '')
                data['bike_rate_per_order'] = bike_data.get('rate_per_order', '')
                data['bike_fixed_commission'] = bike_data.get('fixed_commission', '')

        # Handle accessories data - map to individual boolean fields only
        if 'accessories' in data:
            accessories_data = data.pop('accessories', {})
            if isinstance(accessories_data, dict):
                # Map frontend accessory checkboxes to model boolean fields
                accessory_mapping = {
                    't_shirt': 't_shirt',
                    'cap': 'cap',
                    'jackets': 'jackets',
                    'bag': 'bag',
                    'wristbands': 'wristbands',
                    'water_bottle': 'water_bottle',
                    'safety_gear': 'safety_gear',
                    'helmet': 'helmet',
                }

                for key, enabled_field in accessory_mapping.items():
                    if key in accessories_data:
                        data[enabled_field] = accessories_data[key]

        # Handle direct accessory fields (for form submissions)
        accessory_fields = ['t_shirt', 'cap', 'jackets', 'bag', 'wristbands', 'water_bottle', 'safety_gear', 'helmet']
        for field in accessory_fields:
            if field in data:
                # Ensure boolean conversion
                if isinstance(data[field], str):
                    data[field] = data[field].lower() in ['true', '1', 'yes', 'on']

        return super().to_internal_value(data)
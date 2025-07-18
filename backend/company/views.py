# companies/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Count
from django.shortcuts import get_object_or_404

from .models import Company
from .serializers import (
    CompanySerializer,
    CompanyListSerializer,
    CompanyCreateUpdateSerializer
)

class CompanyViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Company.objects.annotate(
            driver_count=Count('working_drivers')
        ).order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'list':
            return CompanyListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CompanyCreateUpdateSerializer
        return CompanySerializer

    def _parse_formdata_to_dict(self, request_data):
        """Parse FormData with nested keys into nested dictionary"""
        import json
        parsed_data = {}

        for key, value in request_data.items():
            if '.' in key:
                # Handle nested keys like 'car_commission_details.fixed_commission'
                parts = key.split('.')
                current = parsed_data

                for part in parts[:-1]:
                    if part not in current:
                        current[part] = {}
                    current = current[part]

                current[parts[-1]] = value
            else:
                # Handle regular keys
                if key == 'accessories':
                    # Parse JSON string for accessories
                    try:
                        parsed_data[key] = json.loads(value)
                    except (json.JSONDecodeError, TypeError):
                        parsed_data[key] = value
                else:
                    parsed_data[key] = value

        return parsed_data

    def create(self, request, *args, **kwargs):
        # Parse FormData into proper nested structure
        parsed_data = self._parse_formdata_to_dict(request.data)

        serializer = self.get_serializer(data=parsed_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # Parse FormData into proper nested structure
        parsed_data = self._parse_formdata_to_dict(request.data)

        serializer = self.get_serializer(instance, data=parsed_data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def _parse_formdata_to_dict(self, request_data):
        """Parse FormData with nested keys into nested dictionary"""
        parsed_data = {}

        for key, value in request_data.items():
            if '.' in key:
                # Handle nested keys like 'car_commission_details.fixed_commission'
                parts = key.split('.')
                current = parsed_data

                for part in parts[:-1]:
                    if part not in current:
                        current[part] = {}
                    current = current[part]

                current[parts[-1]] = value
            else:
                # Handle regular keys
                if key == 'accessories':
                    # Parse JSON string for accessories
                    try:
                        import json
                        parsed_data[key] = json.loads(value)
                    except (json.JSONDecodeError, TypeError):
                        parsed_data[key] = value
                else:
                    parsed_data[key] = value

        return parsed_data

    def create(self, request, *args, **kwargs):
        # Parse FormData into proper nested structure
        parsed_data = self._parse_formdata_to_dict(request.data)

        serializer = self.get_serializer(data=parsed_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # Parse FormData into proper nested structure
        parsed_data = self._parse_formdata_to_dict(request.data)

        serializer = self.get_serializer(instance, data=parsed_data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def accessories(self, request, pk=None):
        """Get accessories for a specific company"""
        company = self.get_object()
        serializer = CompanySerializer(company)
        return Response(serializer.data.get('employee_accessories', []))

    @action(detail=True, methods=['get'])
    def commission_info(self, request, pk=None):
        """Get commission information for a specific company"""
        company = self.get_object()
        vehicle_type = request.query_params.get('vehicle_type', 'car')

        if vehicle_type.lower() == 'bike':
            commission_data = {
                'type': company.bike_commission_type,
                'rate_per_km': company.bike_rate_per_km,
                'min_km': company.bike_min_km,
                'rate_per_order': company.bike_rate_per_order,
                'fixed_commission': company.bike_fixed_commission,
            }
        else:  # default to car
            commission_data = {
                'type': company.car_commission_type,
                'rate_per_km': company.car_rate_per_km,
                'min_km': company.car_min_km,
                'rate_per_order': company.car_rate_per_order,
                'fixed_commission': company.car_fixed_commission,
            }

        return Response({
            'company_name': company.company_name,
            'vehicle_type': vehicle_type,
            'commission': commission_data
        })

@api_view(['GET'])
def company_list_for_drivers(request):
    """Simplified endpoint for driver forms - returns companies with basic info and accessories"""
    companies = Company.objects.all()
    serializer = CompanySerializer(companies, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def company_profile(request, company_id):
    """Get detailed company profile with drivers and accessories"""
    try:
        company = Company.objects.select_related().prefetch_related(
            'working_drivers',
            'new_driver_applications'
        ).get(pk=company_id)

        serializer = CompanySerializer(company)
        return Response(serializer.data)
    except Company.DoesNotExist:
        return Response({"error": "Company not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def dropdown_options(request):
    """Get dropdown options for forms"""

    # Countries list
    countries = [
        {'value': 'Kuwait', 'label': 'Kuwait'},
        {'value': 'Saudi Arabia', 'label': 'Saudi Arabia'},
        {'value': 'UAE', 'label': 'United Arab Emirates'},
        {'value': 'Qatar', 'label': 'Qatar'},
        {'value': 'Bahrain', 'label': 'Bahrain'},
        {'value': 'Oman', 'label': 'Oman'},
        {'value': 'India', 'label': 'India'},
        {'value': 'Pakistan', 'label': 'Pakistan'},
        {'value': 'Bangladesh', 'label': 'Bangladesh'},
        {'value': 'Philippines', 'label': 'Philippines'},
        {'value': 'Egypt', 'label': 'Egypt'},
        {'value': 'Jordan', 'label': 'Jordan'},
        {'value': 'Lebanon', 'label': 'Lebanon'},
        {'value': 'Syria', 'label': 'Syria'},
    ]

    # Kuwait cities
    kuwait_cities = [
        {'value': 'Kuwait City', 'label': 'Kuwait City'},
        {'value': 'Hawalli', 'label': 'Hawalli'},
        {'value': 'Farwaniya', 'label': 'Farwaniya'},
        {'value': 'Ahmadi', 'label': 'Ahmadi'},
        {'value': 'Jahra', 'label': 'Jahra'},
        {'value': 'Mubarak Al-Kabeer', 'label': 'Mubarak Al-Kabeer'},
        {'value': 'Salmiya', 'label': 'Salmiya'},
        {'value': 'Fahaheel', 'label': 'Fahaheel'},
        {'value': 'Mangaf', 'label': 'Mangaf'},
        {'value': 'Mahboula', 'label': 'Mahboula'},
        {'value': 'Fintas', 'label': 'Fintas'},
        {'value': 'Khaitan', 'label': 'Khaitan'},
        {'value': 'Jleeb Al-Shuyoukh', 'label': 'Jleeb Al-Shuyoukh'},
        {'value': 'Abraq Khaitan', 'label': 'Abraq Khaitan'},
    ]

    # Vehicle types
    vehicle_types = [
        {'value': 'bike', 'label': 'Bike/Motorcycle'},
        {'value': 'car', 'label': 'Car'},
        {'value': 'van', 'label': 'Van'},
        {'value': 'truck', 'label': 'Truck'},
        {'value': 'bus', 'label': 'Bus'},
    ]

    return Response({
        'countries': countries,
        'cities': {
            'Kuwait': kuwait_cities,
            'default': [{'value': 'Other', 'label': 'Other'}]
        },
        'vehicle_types': vehicle_types
    })
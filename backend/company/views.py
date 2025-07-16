# companies/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Count
from django.shortcuts import get_object_or_404

from .models import Company, EmployeeAccessory
from .serializers import (
    CompanySerializer,
    CompanyListSerializer,
    CompanyCreateUpdateSerializer,
    EmployeeAccessorySerializer
)

class CompanyViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Company.objects.prefetch_related('employee_accessories').annotate(
            driver_count=Count('working_drivers')
        ).order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'list':
            return CompanyListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CompanyCreateUpdateSerializer
        return CompanySerializer

    @action(detail=True, methods=['get'])
    def accessories(self, request, pk=None):
        """Get accessories for a specific company"""
        company = self.get_object()
        accessories = company.employee_accessories.all()
        serializer = EmployeeAccessorySerializer(accessories, many=True)
        return Response(serializer.data)

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
    companies = Company.objects.prefetch_related('employee_accessories').all()

    company_data = []
    for company in companies:
        accessories = []
        for accessory in company.employee_accessories.filter(enabled=True):
            accessories.append({
                'name': accessory.name,
                'description': accessory.description,
                'icon': accessory.icon,
                'category': accessory.category,
                'default_quantity': accessory.default_quantity,
                'enabled': accessory.enabled
            })

        company_data.append({
            'id': company.id,
            'company_name': company.company_name,
            'contact_person': company.contact_person,
            'contact_phone': company.contact_phone,
            'contact_email': company.contact_email,
            'city': company.city,
            'country': company.country,
            'employee_accessories': accessories,
            'car_commission_info': {
                'type': company.car_commission_type,
                'rate_per_km': company.car_rate_per_km,
                'min_km': company.car_min_km,
                'rate_per_order': company.car_rate_per_order,
                'fixed_commission': company.car_fixed_commission,
            },
            'bike_commission_info': {
                'type': company.bike_commission_type,
                'rate_per_km': company.bike_rate_per_km,
                'min_km': company.bike_min_km,
                'rate_per_order': company.bike_rate_per_order,
                'fixed_commission': company.bike_fixed_commission,
            }
        })

    return Response(company_data)

@api_view(['GET'])
def company_profile(request, company_id):
    """Get detailed company profile with drivers and accessories"""
    try:
        company = Company.objects.prefetch_related(
            'employee_accessories',
            'working_drivers',
            'new_driver_applications'
        ).get(pk=company_id)

        serializer = CompanySerializer(company)
        return Response(serializer.data)
    except Company.DoesNotExist:
        return Response({"error": "Company not found"}, status=status.HTTP_404_NOT_FOUND)
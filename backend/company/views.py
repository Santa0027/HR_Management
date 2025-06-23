# companies/views.py

from rest_framework import viewsets
from .models import Company
from .serializers import CompanySerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Company
from drivers.models import Driver
from drivers.serializers import DriverSerializer
from .serializers import CompanySerializer
from django.db.models import Count

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.annotate(driver_count=Count('drivers')).order_by('-created_at')
    serializer_class = CompanySerializer
    permission_classes = [AllowAny]

# @api_view(['GET'])
# def company_profile(request, company_id):
#     try:
#         company = Company.objects.get(pk=company_id)
#         drivers = Driver.objects.filter(company=company)
#         return Response({
#             "company": CompanySerializer(company).data,
#             "drivers": DriverSerializer(drivers, many=True).data
#         })
#     except Company.DoesNotExist:
#         return Response({"error": "Company not found"}, status=404)
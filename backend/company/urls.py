# companies/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet, company_list_for_drivers, company_profile, dropdown_options

router = DefaultRouter()
router.register(r'companies', CompanyViewSet, basename='companies')

urlpatterns = [
    path('', include(router.urls)),
    path('companies-for-drivers/', company_list_for_drivers, name='companies-for-drivers'),
    path('companies/<int:company_id>/profile/', company_profile, name='company-profile'),
    path('dropdown-options/', dropdown_options, name='dropdown-options'),
]



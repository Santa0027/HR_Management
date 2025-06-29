from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DriverViewSet, DriverLogViewSet
from . import views


router = DefaultRouter()
router.register(r'drivers', DriverViewSet)
router.register(r'driver-logs', DriverLogViewSet)

urlpatterns = [
    path('Register/', include(router.urls)),
    path('by-company/<int:company_id>/', views.get_drivers_by_company, name='drivers-by-company'),
    path('Register/onboarded/', views.onboarded_drivers, name='onboarded-drivers'),
]
    
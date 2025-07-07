from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VehicleRegistrationViewSet,
    VehicleServiceRecordViewSet,
    VehicleFuelRecordViewSet,
    VehicleRentalRecordViewSet,
    VehicleExpenseViewSet,
    VehicleLogViewSet,
    vehicle_list
)

router = DefaultRouter()
router.register(r'vehicles', VehicleRegistrationViewSet, basename='vehicle')
router.register(r'vehicle-services', VehicleServiceRecordViewSet, basename='vehicle-service')
router.register(r'vehicle-fuel', VehicleFuelRecordViewSet, basename='vehicle-fuel')
router.register(r'vehicle-rentals', VehicleRentalRecordViewSet, basename='vehicle-rental')
router.register(r'vehicle-expenses', VehicleExpenseViewSet, basename='vehicle-expense')
router.register(r'vehicle-logs', VehicleLogViewSet, basename='vehicle-log')

urlpatterns = [
    path('vehicles-list/', vehicle_list, name='vehicle-list'),  # Optional additional endpoint
    
]

urlpatterns += router.urls

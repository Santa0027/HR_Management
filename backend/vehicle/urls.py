from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VehicleRegistrationViewSet, vehicle_list

router = DefaultRouter()
router.register(r'vehicles', VehicleRegistrationViewSet, basename='vehicle')

urlpatterns = [
    path('vehicles-list/', vehicle_list, name='vehicle-list'),  # Optional additional endpoint
]

urlpatterns += router.urls

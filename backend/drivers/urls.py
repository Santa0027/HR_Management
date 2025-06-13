from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DriverViewSet, DriverLogViewSet

router = DefaultRouter()
router.register(r'drivers', DriverViewSet)
router.register(r'driver-logs', DriverLogViewSet)

urlpatterns = [
    path('Register/', include(router.urls)),
]

# your_app_name/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AttendanceViewSet,CheckinLocationCreateView

router = DefaultRouter()
router.register(r'attendance', AttendanceViewSet, basename='attendance')

urlpatterns = [
    path('checkin-location/create/', CheckinLocationCreateView.as_view(), name='checkin-location-create'),
    path('', include(router.urls)),
]

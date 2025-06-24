from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AttendanceViewSet,
    CheckinLocationViewSet,
    ApartmentLocationViewSet,
    MonthlyAttendanceSummaryViewSet,
    TerminationViewSet,
    WarningLetterViewSet
)

router = DefaultRouter()
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'checkin-locations', CheckinLocationViewSet, basename='checkin-location')
router.register(r'apartment-locations', ApartmentLocationViewSet, basename='apartment-location')
router.register(r'monthly-summary', MonthlyAttendanceSummaryViewSet) # Register the monthly summary endpoint
router.register(r'warningletter', WarningLetterViewSet) 
router.register(r'terminationletter', TerminationViewSet) 
urlpatterns = [
    path('', include(router.urls)),
]

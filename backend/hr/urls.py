# attendance/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AttendanceViewSet,
    CheckinLocationViewSet,
    ApartmentLocationViewSet,
    MonthlyAttendanceSummaryViewSet,
    TerminationViewSet,
    WarningLetterViewSet,
    CompanyViewSet, # Make sure CompanyViewSet is imported if used in router
    VehicleRegistrationViewSet, # Make sure VehicleRegistrationViewSet is imported if used in router
    # New shift management viewsets
    ShiftTypeViewSet,
    DriverShiftAssignmentViewSet,
    # Leave management viewsets
    LeaveTypeViewSet,
    LeaveRequestViewSet,
    LeaveBalanceViewSet
)

router = DefaultRouter()
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'checkin-locations', CheckinLocationViewSet, basename='checkin-location')
router.register(r'apartment-locations', ApartmentLocationViewSet, basename='apartment-location')
router.register(r'monthly-summary', MonthlyAttendanceSummaryViewSet) # Register the monthly summary endpoint
router.register(r'warning-letters', WarningLetterViewSet, basename='warning-letters') # Changed basename for consistency
router.register(r'terminations', TerminationViewSet)
router.register(r'companies', CompanyViewSet) # Assuming these are used
router.register(r'vehicle-registrations', VehicleRegistrationViewSet) # Assuming these are used

# New shift management endpoints
router.register(r'shift-types', ShiftTypeViewSet, basename='shift-types')
router.register(r'shift-assignments', DriverShiftAssignmentViewSet, basename='shift-assignments')

# Leave management endpoints
router.register(r'leave-types', LeaveTypeViewSet, basename='leave-types')
router.register(r'leave-requests', LeaveRequestViewSet, basename='leave-requests')
router.register(r'leave-balances', LeaveBalanceViewSet, basename='leave-balances')
# Leave management endpoints will be added in the next phase


urlpatterns = [
    # Include all router URLs (includes attendance CRUD operations)
    path('', include(router.urls)),

    # Driver Attendance API Endpoints
    path('attendance/current-day/<int:driver_id>/',
         AttendanceViewSet.as_view({'get': 'retrieve_current_day_attendance'}),
         name='current_day_attendance'),

    # Driver Login/Logout Endpoints (explicit paths for easier access)
    path('attendance/login/',
         AttendanceViewSet.as_view({'post': 'driver_login'}),
         name='driver_login'),

    path('attendance/<int:pk>/logout/',
         AttendanceViewSet.as_view({'patch': 'driver_logout'}),
         name='driver_logout'),

    # Additional driver attendance endpoints
    path('attendance/driver/<int:driver_id>/',
         AttendanceViewSet.as_view({'get': 'list'}),
         name='driver_attendance_list'),

    # Driver status and location endpoints
    path('attendance/driver-status/<int:driver_id>/',
         AttendanceViewSet.as_view({'get': 'get_driver_status'}),
         name='driver_status'),

    path('attendance/locations/<int:driver_id>/',
         AttendanceViewSet.as_view({'get': 'get_driver_locations'}),
         name='driver_locations'),
]

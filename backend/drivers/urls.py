from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DriverViewSet, DriverLogViewSet, DriverAuthViewSet,
    driver_login, driver_profile, driver_change_password,
    driver_logout, check_username_availability,
    NewDriverApplicationViewSet, WorkingDriverViewSet,
    submit_driver_form
)
from . import views


router = DefaultRouter()
router.register(r'drivers', DriverViewSet)
router.register(r'driver-logs', DriverLogViewSet)
router.register(r'driver-auth', DriverAuthViewSet, basename='driver-auth')
router.register(r'new-driver-applications', NewDriverApplicationViewSet)
router.register(r'working-drivers', WorkingDriverViewSet)

urlpatterns = [
    # Admin/Dashboard URLs
    path('Register/', include(router.urls)),
    path('by-company/<int:company_id>/', views.get_drivers_by_company, name='drivers-by-company'),
    path('by-user/<int:user_id>/', views.get_driver_by_user_id, name='driver-by-user'),
    path('Register/onboarded/', views.onboarded_drivers, name='onboarded-drivers'),

    # Driver Mobile App Authentication URLs
    path('mobile/login/', driver_login, name='driver-mobile-login'),
    path('mobile/logout/', driver_logout, name='driver-mobile-logout'),
    path('mobile/profile/<int:driver_id>/', driver_profile, name='driver-mobile-profile'),
    path('mobile/change-password/<int:driver_id>/', driver_change_password, name='driver-mobile-change-password'),

    # Utility URLs
    path('check-username/', check_username_availability, name='check-username-availability'),

    # Enhanced Driver Form URLs
    path('submit-form/', submit_driver_form, name='submit-driver-form'),
]
    
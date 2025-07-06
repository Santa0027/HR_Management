from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TripViewSet, TripExpenseViewSet, DriverEarningsSummaryViewSet

router = DefaultRouter()
router.register(r'trips', TripViewSet, basename='trip')
router.register(r'expenses', TripExpenseViewSet, basename='trip-expense')
router.register(r'earnings-summary', DriverEarningsSummaryViewSet, basename='earnings-summary')

urlpatterns = [
    # Include all router URLs
    path('', include(router.urls)),
    
    # Additional custom endpoints can be added here if needed
]

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static



urlpatterns = [


    # Other app routes
    path('', include('drivers.urls')),  # if you have app-specific URLs
    path('', include('core.urls')),
    path('', include('vehicle.urls')),
    path('', include('company.urls')),
    path('', include('usermanagement.urls')),
    path('hr/', include('hr.urls')),
    path('accounting/', include('accounting.urls')),  # Add accounting URLs
    path('trips/', include('trips.urls')),  # Add trips URLs


] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
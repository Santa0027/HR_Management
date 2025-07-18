from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static



urlpatterns = [
    path('admin/', admin.site.urls),

    # Authentication endpoints
    path('', include('core.urls')),  # This includes api/token/

    # API routes with /api/ prefix
    path('', include('drivers.urls')),
    path('', include('vehicle.urls')),
    path('', include('company.urls')),
    path('', include('usermanagement.urls')),
    path('hr/', include('hr.urls')),
    path('accounting/', include('accounting.urls')),
    path('trips/', include('trips.urls')),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
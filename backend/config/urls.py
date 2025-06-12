from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView




urlpatterns = [
  

    # Other app routes
    path('', include('drivers.urls')),  # if you have app-specific URLs
    path('', include('core.urls')),
]

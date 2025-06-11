from django.urls import path
from .views import driver_list

urlpatterns = [
    path('api/drivers/', driver_list),
]

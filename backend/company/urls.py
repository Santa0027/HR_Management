# companies/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet
from .views import company_profile

router = DefaultRouter()
router.register(r'company', CompanyViewSet,basename='company')

urlpatterns = [
    # path('comapnay', include(router.urls)),
     path('company-profile/<int:company_id>/', company_profile, name='company-profile'),
]
urlpatterns += router.urls



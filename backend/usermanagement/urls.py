from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomUserViewSet,
    RegisterView,
    CurrentUserView,
    EmailTokenObtainPairView,
    LoginView,  # <- your custom login view
)
from rest_framework_simplejwt.views import TokenRefreshView


router = DefaultRouter()
router.register(r'users', CustomUserViewSet)

urlpatterns = [
    # API routes
    path('', include(router.urls)),

    # Auth routes
    path('auth/register/', RegisterView.as_view(), name='register'),

    # ✅ Your custom login view (returns 'token', 'refresh', 'email', etc.)
    path('auth/login/', LoginView.as_view(), name='custom_login'),

    # 🔄 Optional: standard JWT login (returns 'access', 'refresh')
    path('auth/login-jwt/', EmailTokenObtainPairView.as_view(), name='jwt_login'),

    # 🔁 Token refresh endpoint
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # 🙋‍♂️ Get current logged-in user
    path('auth/me/', CurrentUserView.as_view(), name='current_user'),
]

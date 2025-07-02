from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .serializers import (
    CustomUserSerializer,
    RegisterSerializer,
    EmailTokenObtainPairSerializer,
)

User = get_user_model()

class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAuthenticated]



@method_decorator(csrf_exempt, name='dispatch')
class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer
    permission_classes = [AllowAny]

class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


from .serializers import RegisterSerializer
from rest_framework import serializers
from .models import CustomUser

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access for registration
    

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .models import CustomUser
from rest_framework.decorators import api_view


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    permission_classes = [AllowAny]  # Allow unauthenticated access for login

    def get_user_permissions(self, user):
        """Get user permissions based on role"""
        permissions = {
            'can_manage_users': user.role == 'admin',
            'can_manage_drivers': user.role in ['admin', 'hr'],
            'can_view_drivers': user.role in ['admin', 'hr', 'management'],
            'can_manage_companies': user.role == 'admin',
            'can_view_companies': user.role in ['admin', 'hr', 'management'],
            'can_manage_vehicles': user.role in ['admin', 'hr'],
            'can_view_vehicles': user.role in ['admin', 'hr', 'management'],
            'can_manage_attendance': user.role in ['admin', 'hr'],
            'can_view_attendance': user.role in ['admin', 'hr', 'management'],
            'can_manage_hr': user.role in ['admin', 'hr'],
            'can_view_hr': user.role in ['admin', 'hr', 'management'],
            'can_manage_accounting': user.role in ['admin', 'accountant'],
            'can_view_accounting': user.role in ['admin', 'accountant', 'hr', 'management'],
            'can_manage_payroll': user.role in ['admin', 'accountant', 'hr'],
            'can_view_payroll': user.role in ['admin', 'accountant', 'hr', 'management'],
            'can_generate_reports': user.role in ['admin', 'hr', 'accountant', 'management'],
            'can_approve_expenses': user.role in ['admin', 'accountant', 'management'],
            'can_view_own_data': True,  # All users can view their own data
        }

        # Driver-specific permissions
        if user.role == 'driver':
            permissions.update({
                'can_view_own_attendance': True,
                'can_update_own_profile': True,
                'can_view_own_payroll': True,
                'can_upload_documents': True,
            })

        return permissions

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({
                'error': 'Email and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=email, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'token': str(refresh.access_token),
                'refresh': str(refresh),
                'access': str(refresh.access_token),  # Add for compatibility
                'email': user.email,
                'name': user.get_full_name(),
                'user_id': user.id,
                'role': user.role,
                'permissions': self.get_user_permissions(user),
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser
            })
        else:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)

    def options(self, request, *args, **kwargs):
        """Handle preflight OPTIONS requests"""
        response = Response()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

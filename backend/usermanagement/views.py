from rest_framework import generics, permissions, viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db.models import Q
from django.utils import timezone
from .serializers import (
    CustomUserSerializer,
    RegisterSerializer,
    EmailTokenObtainPairSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    UserDetailSerializer,
    ChangePasswordSerializer,
    AdminUserSerializer,
    DriverAuthenticationSerializer,
)
from .models import DriverAuthentication

User = get_user_model()

class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-created_at')
    permission_classes = [AllowAny]  # Change to IsAuthenticated for production

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        elif self.action == 'retrieve':
            return UserDetailSerializer
        return CustomUserSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter parameters
        role = self.request.query_params.get('role')
        is_active = self.request.query_params.get('is_active')
        search = self.request.query_params.get('search')

        if role:
            queryset = queryset.filter(role=role)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search)
            )

        return queryset

    @action(detail=True, methods=['post'], url_path='change-password')
    def change_password(self, request, pk=None):
        """Change user password (Admin only)"""
        user = self.get_object()
        serializer = ChangePasswordSerializer(data=request.data)

        if serializer.is_valid():
            new_password = serializer.validated_data['new_password']
            user.set_password(new_password)
            user.save()

            return Response({
                'message': f'Password changed successfully for {user.get_full_name()}'
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='toggle-active')
    def toggle_active(self, request, pk=None):
        """Toggle user active status"""
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()

        return Response({
            'message': f'User {user.get_full_name()} {"activated" if user.is_active else "deactivated"}',
            'is_active': user.is_active
        })

    @action(detail=True, methods=['post'], url_path='toggle-staff')
    def toggle_staff(self, request, pk=None):
        """Toggle user staff status"""
        user = self.get_object()
        user.is_staff = not user.is_staff
        user.save()

        return Response({
            'message': f'User {user.get_full_name()} staff status {"enabled" if user.is_staff else "disabled"}',
            'is_staff': user.is_staff
        })

    @action(detail=False, methods=['get'], url_path='stats')
    def get_stats(self, request):
        """Get user statistics"""
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        inactive_users = total_users - active_users

        role_stats = {}
        for role_code, role_name in User.ROLE_CHOICES:
            role_stats[role_name] = User.objects.filter(role=role_code).count()

        return Response({
            'total_users': total_users,
            'active_users': active_users,
            'inactive_users': inactive_users,
            'role_distribution': role_stats,
            'staff_users': User.objects.filter(is_staff=True).count(),
            'superusers': User.objects.filter(is_superuser=True).count(),
        })



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


class AdminUserViewSet(viewsets.ModelViewSet):
    """ViewSet for admin user management"""
    queryset = User.objects.filter(role__in=['super_admin', 'admin', 'hr_manager', 'supervisor', 'viewer']).order_by('-created_at')
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter parameters
        role = self.request.query_params.get('role')
        status = self.request.query_params.get('status')
        search = self.request.query_params.get('search')

        if role and role != 'all':
            queryset = queryset.filter(role=role)
        if status and status != 'all':
            is_active = status == 'active'
            queryset = queryset.filter(is_active=is_active)
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(username__icontains=search)
            )

        return queryset

    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        """Toggle user active status"""
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()

        return Response({
            'status': 'success',
            'message': f'User {"activated" if user.is_active else "deactivated"} successfully',
            'is_active': user.is_active
        })

    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        """Reset user password"""
        user = self.get_object()

        # Generate random password
        import secrets
        import string
        alphabet = string.ascii_letters + string.digits
        new_password = ''.join(secrets.choice(alphabet) for i in range(8))

        user.set_password(new_password)
        user.login_attempts = 0
        user.is_locked = False
        user.locked_until = None
        user.save()

        return Response({
            'status': 'success',
            'message': 'Password reset successfully',
            'new_password': new_password
        })


class DriverAuthenticationViewSet(viewsets.ModelViewSet):
    """ViewSet for driver authentication management"""
    queryset = DriverAuthentication.objects.all().order_by('-created_at')
    serializer_class = DriverAuthenticationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter parameters
        status = self.request.query_params.get('status')
        search = self.request.query_params.get('search')

        if status and status != 'all':
            queryset = queryset.filter(status=status)
        if search:
            queryset = queryset.filter(
                Q(driver__name__icontains=search) |
                Q(username__icontains=search) |
                Q(driver__mobile__icontains=search)
            )

        return queryset

    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        """Toggle driver authentication status"""
        driver_auth = self.get_object()
        driver_auth.status = 'inactive' if driver_auth.status == 'active' else 'active'
        driver_auth.save()

        return Response({
            'status': 'success',
            'message': f'Driver authentication {"activated" if driver_auth.status == "active" else "deactivated"} successfully',
            'auth_status': driver_auth.status
        })

    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        """Reset driver password"""
        driver_auth = self.get_object()

        # Generate random password
        import secrets
        import string
        alphabet = string.ascii_letters + string.digits
        new_password = ''.join(secrets.choice(alphabet) for i in range(8))

        # Hash the password (you should use proper hashing)
        from django.contrib.auth.hashers import make_password
        driver_auth.password_hash = make_password(new_password)
        driver_auth.login_attempts = 0
        driver_auth.locked_until = None
        if driver_auth.status == 'locked':
            driver_auth.status = 'active'
        driver_auth.save()

        return Response({
            'status': 'success',
            'message': 'Password reset successfully',
            'new_password': new_password
        })

    @action(detail=True, methods=['post'])
    def unlock_account(self, request, pk=None):
        """Unlock driver account"""
        driver_auth = self.get_object()
        driver_auth.unlock_account()

        return Response({
            'status': 'success',
            'message': 'Account unlocked successfully'
        })

    @action(detail=True, methods=['get'])
    def generate_qr(self, request, pk=None):
        """Generate QR code for app download"""
        driver_auth = self.get_object()

        # In a real implementation, you would generate an actual QR code
        # For now, return the data that would be encoded
        qr_data = {
            'app_download_url': 'https://your-app-store-link.com',
            'driver_id': driver_auth.driver.id,
            'username': driver_auth.username,
            'setup_code': f"SETUP_{driver_auth.id}_{driver_auth.driver.id}"
        }

        return Response({
            'status': 'success',
            'qr_data': qr_data,
            'message': 'QR code data generated successfully'
        })

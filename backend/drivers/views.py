from rest_framework import viewsets, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import JsonResponse
from django.utils import timezone
from django.db import transaction

from .models import Driver, DriverLog, DriverAuth
from .serializers import (
    DriverSerializer, DriverLogSerializer,
    DriverAuthSerializer, DriverAuthCreateSerializer, DriverAuthUpdateSerializer,
    DriverLoginSerializer, DriverProfileSerializer, DriverChangePasswordSerializer
)
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser

class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.all().order_by('-created_at')
    serializer_class = DriverSerializer
    permission_classes = [AllowAny]  # Use IsAuthenticated for protected endpoints
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(submitted_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    def create(self, request, *args, **kwargs):
        print("Request DATA:", request.data)
        print("Request FILES:", request.FILES)
        return super().create(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        try:
            print("PATCH data received:", request.data)
        except Exception as e:
            print("Error accessing request.data:", str(e))
        return super().partial_update(request, *args, **kwargs)


    @action(detail=False, methods=['get'], url_path='new-requests')
    def new_requests(self, request):
        pending_drivers = Driver.objects.filter(status='pending').order_by('-created_at')
        serializer = self.get_serializer(pending_drivers, many=True)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def onboarded_drivers(request):
    """
    Return only drivers with status = 'approved'
    """
    approved_drivers = Driver.objects.filter(status='approved')
    serializer = DriverSerializer(approved_drivers, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


class DriverLogViewSet(viewsets.ModelViewSet):
    queryset = DriverLog.objects.all().order_by('-timestamp')
    serializer_class = DriverLogSerializer
    permission_classes = [IsAuthenticated]


@api_view(['GET']) # Decorator to make this a DRF API view
@permission_classes([AllowAny]) # You can change permission as needed
def get_drivers_by_company(request, company_id):
    """
    Returns drivers filtered by company ID
    """
    try:
        # 1. Get the queryset of Driver objects without .values()
        drivers = Driver.objects.filter(company_id=company_id)

        # 2. Pass the queryset to your DriverSerializer
        #    'many=True' is crucial because you're serializing a list of drivers
        serializer = DriverSerializer(drivers, many=True) # <--- USE YOUR DRIVERSERIALIZER HERE!

        # 3. Return the serialized data using DRF's Response
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e: # Catch any potential errors, e.g., company_id not found or database issues
        return Response({"detail": f"Error fetching drivers: {str(e)}"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_driver_by_user_id(request, user_id):
    """
    Returns driver data for a specific user ID (for mobile app)
    """
    try:
        # Find driver by matching user ID (assuming driver_name matches user's name)
        # This is a temporary solution - in production you'd have a proper user-driver relationship
        from django.contrib.auth import get_user_model
        User = get_user_model()

        user = User.objects.get(id=user_id)
        driver_name = f"{user.first_name} {user.last_name}"

        driver = Driver.objects.get(driver_name=driver_name)
        serializer = DriverSerializer(driver)

        return Response(serializer.data, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except Driver.DoesNotExist:
        return Response({"error": "Driver profile not found for this user"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== DRIVER MOBILE AUTHENTICATION VIEWS ====================

class DriverAuthViewSet(viewsets.ModelViewSet):
    """ViewSet for managing driver authentication credentials (Admin use)"""
    queryset = DriverAuth.objects.all().select_related('driver')
    permission_classes = [AllowAny]  # Change to IsAuthenticated for production

    def get_serializer_class(self):
        if self.action == 'create':
            return DriverAuthCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return DriverAuthUpdateSerializer
        return DriverAuthSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        driver_id = self.request.query_params.get('driver')
        is_active = self.request.query_params.get('is_active')
        is_locked = self.request.query_params.get('is_locked')

        if driver_id:
            queryset = queryset.filter(driver_id=driver_id)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        if is_locked is not None:
            queryset = queryset.filter(is_locked=is_locked.lower() == 'true')

        return queryset.order_by('driver__driver_name')

    @action(detail=True, methods=['post'], url_path='unlock-account')
    def unlock_account(self, request, pk=None):
        """Unlock a driver's account"""
        driver_auth = self.get_object()
        driver_auth.unlock_account()

        return Response({
            'message': f'Account for {driver_auth.driver.driver_name} has been unlocked',
            'remaining_attempts': driver_auth.remaining_attempts
        })

    @action(detail=True, methods=['post'], url_path='reset-password')
    def reset_password(self, request, pk=None):
        """Reset driver's password (Admin only)"""
        driver_auth = self.get_object()
        new_password = request.data.get('new_password')

        if not new_password:
            return Response({'error': 'new_password is required'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 6:
            return Response({'error': 'Password must be at least 6 characters'}, status=status.HTTP_400_BAD_REQUEST)

        driver_auth.set_password(new_password)
        driver_auth.save()

        return Response({
            'message': f'Password reset successfully for {driver_auth.driver.driver_name}'
        })

    @action(detail=False, methods=['get'], url_path='drivers-without-auth')
    def drivers_without_auth(self, request):
        """Get list of drivers who don't have authentication credentials yet"""
        drivers_with_auth = DriverAuth.objects.values_list('driver_id', flat=True)
        drivers_without_auth = Driver.objects.filter(
            status='approved'
        ).exclude(
            id__in=drivers_with_auth
        ).values('id', 'driver_name', 'iqama', 'mobile')

        return Response(list(drivers_without_auth))


# ==================== DRIVER MOBILE APP API VIEWS ====================

@api_view(['POST'])
@permission_classes([AllowAny])
def driver_login(request):
    """Driver mobile app login endpoint"""
    serializer = DriverLoginSerializer(data=request.data)

    if serializer.is_valid():
        driver_auth = serializer.validated_data['driver_auth']
        device_info = serializer.validated_data.get('device_info')

        # Get client IP
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')

        # Record successful login
        driver_auth.record_successful_login(device_info=device_info, ip_address=ip_address)

        # Generate JWT tokens
        refresh = RefreshToken()
        refresh['driver_id'] = driver_auth.driver.id
        refresh['username'] = driver_auth.username
        refresh['driver_name'] = driver_auth.driver.driver_name

        return Response({
            'message': 'Login successful',
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'driver': {
                'id': driver_auth.driver.id,
                'name': driver_auth.driver.driver_name,
                'username': driver_auth.username,
                'mobile': driver_auth.driver.mobile,
                'iqama': driver_auth.driver.iqama,
                'status': driver_auth.driver.status,
                'profile_image': driver_auth.driver.driver_profile_img.url if driver_auth.driver.driver_profile_img else None
            },
            'last_login': driver_auth.last_login,
            'login_device': driver_auth.last_login_device
        }, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])  # In production, implement custom JWT authentication for drivers
def driver_profile(request, driver_id):
    """Get driver profile for mobile app"""
    try:
        driver = Driver.objects.select_related('company', 'vehicle').get(id=driver_id)
        serializer = DriverProfileSerializer(driver)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Driver.DoesNotExist:
        return Response({'error': 'Driver not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([AllowAny])  # In production, implement custom JWT authentication for drivers
def driver_change_password(request, driver_id):
    """Driver change password in mobile app"""
    try:
        driver_auth = DriverAuth.objects.get(driver_id=driver_id)

        serializer = DriverChangePasswordSerializer(
            data=request.data,
            context={'driver_auth': driver_auth}
        )

        if serializer.is_valid():
            new_password = serializer.validated_data['new_password']
            driver_auth.set_password(new_password)
            driver_auth.save()

            return Response({
                'message': 'Password changed successfully'
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except DriverAuth.DoesNotExist:
        return Response({'error': 'Driver authentication not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([AllowAny])
def driver_logout(request):
    """Driver mobile app logout endpoint"""
    # In a real implementation, you might want to blacklist the JWT token
    # For now, we'll just return a success message
    return Response({
        'message': 'Logout successful'
    }, status=status.HTTP_200_OK)


# ==================== UTILITY VIEWS ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def check_username_availability(request):
    """Check if username is available for driver registration"""
    username = request.query_params.get('username')

    if not username:
        return Response({'error': 'Username parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

    is_available = not DriverAuth.objects.filter(username=username).exists()

    return Response({
        'username': username,
        'is_available': is_available
    }, status=status.HTTP_200_OK)

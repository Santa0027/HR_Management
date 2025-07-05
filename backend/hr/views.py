# your_app_name/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
import math # For haversine distance
from django.db import transaction, models
from rest_framework.permissions import AllowAny
from django.http import FileResponse, Http404
from django.template.loader import render_to_string
from django.core.files.base import ContentFile
from weasyprint import HTML
import os
from django.conf import settings
import base64
import uuid
from django.core.files.storage import default_storage


from .models import (
    Driver, CheckinLocation, Attendance,
    MonthlyAttendanceSummary, WarningLetter, Termination,
    ApartmentLocation, Company,
    ShiftType, DriverShiftAssignment,
    LeaveType, LeaveRequest, LeaveBalance
)

# LeaveType will be handled separately
from vehicle.models import VehicleRegistration
from .serializers import (
    DriverSerializer, CheckinLocationSerializer, AttendanceSerializer,
    MonthlyAttendanceSummarySerializer, TerminationSerializer, WarningLetterSerializer,
    ApartmentLocationSerializer, CompanySerializer, VehicleRegistrationSerializer,
    ShiftTypeSerializer, DriverShiftAssignmentSerializer,
    LeaveTypeSerializer, LeaveRequestSerializer, LeaveRequestCreateSerializer,
    LeaveRequestUpdateSerializer, LeaveBalanceSerializer, LeaveStatsSerializer
)


# Helper function for Haversine distance
def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371000  # Radius of Earth in meters

    lat1_rad = math.radians(float(lat1))
    lon1_rad = math.radians(float(lon1))
    lat2_rad = math.radians(float(lat2))
    lon2_rad = math.radians(float(lon2))

    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad

    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    distance = R * c
    return distance # Distance in meters

# Helper function to handle base64 photo uploads
def save_base64_photo(base64_string, folder_name, filename_prefix):
    """
    Converts base64 string to image file and saves it.
    Returns the saved file path or None if invalid.
    """
    try:
        # Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]

        # Decode base64 string
        image_data = base64.b64decode(base64_string)

        # Generate unique filename
        filename = f"{filename_prefix}_{uuid.uuid4().hex[:8]}.jpg"
        file_path = f"{folder_name}/{filename}"

        # Save file using Django's default storage
        saved_path = default_storage.save(file_path, ContentFile(image_data))
        return saved_path
    except Exception as e:
        print(f"Error saving base64 photo: {e}")
        return None


# Basic ViewSets for CRUD operations
class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [AllowAny] # Example: require authentication

class VehicleRegistrationViewSet(viewsets.ModelViewSet):
    queryset = VehicleRegistration.objects.all()
    serializer_class = VehicleRegistrationSerializer
    permission_classes = [AllowAny]

class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer
    permission_classes = [AllowAny]

class CheckinLocationViewSet(viewsets.ModelViewSet):
    queryset = CheckinLocation.objects.all()
    serializer_class = CheckinLocationSerializer
    permission_classes = [AllowAny]

class ApartmentLocationViewSet(viewsets.ModelViewSet):
    queryset = ApartmentLocation.objects.all()
    serializer_class = ApartmentLocationSerializer
    permission_classes = [AllowAny]


class AttendanceViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

    # Custom action to retrieve the current day's attendance for a driver
    # Accessible via GET /api/attendance/current-day/<driver_id>/
    @action(detail=False, methods=['get'], url_path='current-day/(?P<driver_id>\d+)')
    def retrieve_current_day_attendance(self, request, driver_id=None):
        """
        API view to get the current day's attendance record for a specific driver.
        """
        if driver_id is None:
            return Response({"detail": "Driver ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            today = timezone.localdate()
            attendance = Attendance.objects.get(driver_id=driver_id, date=today)
            serializer = self.get_serializer(attendance)
            return Response(serializer.data)
        except Attendance.DoesNotExist:
            return Response(
                {'detail': 'No attendance record found for today for this driver.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Custom action for driver login/check-in
    # Accessible via POST /api/attendance/login/
    @action(detail=False, methods=['post'], url_path='login')
    def driver_login(self, request):
        driver_id = request.data.get('driver') # Flutter sends 'driver' not 'driver_id'
        login_time_str = request.data.get('login_time')
        login_lat = request.data.get('login_latitude')
        login_lon = request.data.get('login_longitude')

        # Handle both file upload and base64 photo
        login_photo_file = request.FILES.get('login_photo')
        login_photo_base64 = request.data.get('login_photo_base64')

        print(f"🔍 Driver Login Request - Driver: {driver_id}, Time: {login_time_str}")
        print(f"📍 Location - Lat: {login_lat}, Lon: {login_lon}")
        print(f"📸 Photo - File: {'Yes' if login_photo_file else 'No'}, Base64: {'Yes' if login_photo_base64 else 'No'}")

        if not all([driver_id, login_time_str]):
            return Response({"detail": "Missing required login data (driver, login_time)."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            driver = Driver.objects.get(id=driver_id)
            login_time = timezone.datetime.strptime(login_time_str, '%H:%M:%S').time()
            login_lat_dec = float(login_lat) if login_lat else None
            login_lon_dec = float(login_lon) if login_lon else None
        except (Driver.DoesNotExist, ValueError) as e:
            return Response({"detail": f"Invalid driver ID or time/coordinate format: {e}"}, status=status.HTTP_400_BAD_REQUEST)

        # --- Geolocation Validation (only if coordinates provided) ---
        matched_location = None
        if login_lat_dec is not None and login_lon_dec is not None:
            # CheckinLocation has a ForeignKey to Driver, not Company
            # Get locations for this specific driver or general locations (driver=None)
            allowed_locations = CheckinLocation.objects.filter(
                models.Q(driver=driver) | models.Q(driver__isnull=True),
                is_active=True
            )
            for loc in allowed_locations:
                distance = haversine_distance(login_lat_dec, login_lon_dec, loc.latitude, loc.longitude)
                if distance <= loc.radius_meters:
                    matched_location = loc
                    break

            # TEMPORARILY SKIP LOCATION AUTHENTICATION
            # if not matched_location:
            #     return Response({"detail": "You are not at an authorized check-in location."}, status=status.HTTP_403_FORBIDDEN)

            if not matched_location:
                print("🔄 SKIPPING location authentication - allowing check-in from anywhere")
            else:
                print(f"📍 Check-in location found: {matched_location.name}")
        # --- End Geolocation Validation ---

        # Handle photo upload (file or base64)
        photo_path = None
        if login_photo_file:
            # Traditional file upload
            photo_path = login_photo_file
            print("📸 Using uploaded file for login photo")
        elif login_photo_base64:
            # Base64 photo from mobile app
            saved_path = save_base64_photo(login_photo_base64, 'login_photos', f'login_{driver_id}')
            if saved_path:
                photo_path = saved_path
                print(f"📸 Saved base64 photo to: {saved_path}")
            else:
                print("❌ Failed to save base64 photo")

        # Prepare defaults for update_or_create
        defaults = {
            'login_time': login_time,
            'login_latitude': login_lat_dec,
            'login_longitude': login_lon_dec,
            'checked_in_location': matched_location,
            'platform': request.data.get('platform', 'mobile_app'), # Default to mobile_app
            'status': 'logged_in',  # Set status to logged_in
        }
        if photo_path:
            defaults['login_photo'] = photo_path

        with transaction.atomic():
            attendance, created = Attendance.objects.update_or_create(
                driver=driver,
                date=timezone.localdate(), # Assumes check-in is for the current local date
                defaults=defaults
            )
            attendance.save() # Call save to trigger automatic status calculation

            serializer = self.get_serializer(attendance)
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


    # Custom action for driver logout/check-out
    # Accessible via PATCH /api/attendance/<pk>/logout/
    @action(detail=True, methods=['patch'], url_path='logout')
    def driver_logout(self, request, pk=None): # pk is the attendance ID
        logout_time_str = request.data.get('logout_time')
        logout_lat = request.data.get('logout_latitude')
        logout_lon = request.data.get('logout_longitude')

        # Handle both file upload and base64 photo
        logout_photo_file = request.FILES.get('logout_photo')
        logout_photo_base64 = request.data.get('logout_photo_base64')

        print(f"🔍 Driver Logout Request - Attendance ID: {pk}, Time: {logout_time_str}")
        print(f"📍 Location - Lat: {logout_lat}, Lon: {logout_lon}")
        print(f"📸 Photo - File: {'Yes' if logout_photo_file else 'No'}, Base64: {'Yes' if logout_photo_base64 else 'No'}")

        if not logout_time_str:
            return Response({"detail": "Missing required logout data (logout_time)."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            attendance = self.get_object() # Gets the Attendance record by pk
            logout_time = timezone.datetime.strptime(logout_time_str, '%H:%M:%S').time()
            logout_lat_dec = float(logout_lat) if logout_lat else None
            logout_lon_dec = float(logout_lon) if logout_lon else None
        except (Http404, ValueError) as e:
            return Response({"detail": f"Invalid attendance ID or time/coordinate format: {e}"}, status=status.HTTP_400_BAD_REQUEST)


        if attendance.logout_time:
            return Response({"detail": "Driver already logged out for today."}, status=status.HTTP_409_CONFLICT)

        # Handle photo upload (file or base64)
        photo_path = None
        if logout_photo_file:
            # Traditional file upload
            photo_path = logout_photo_file
            print("📸 Using uploaded file for logout photo")
        elif logout_photo_base64:
            # Base64 photo from mobile app
            saved_path = save_base64_photo(logout_photo_base64, 'logout_photos', f'logout_{attendance.driver.id}')
            if saved_path:
                photo_path = saved_path
                print(f"📸 Saved base64 logout photo to: {saved_path}")
            else:
                print("❌ Failed to save base64 logout photo")

        with transaction.atomic():
            attendance.logout_time = logout_time
            attendance.logout_latitude = logout_lat_dec
            attendance.logout_longitude = logout_lon_dec
            attendance.status = 'logged_out'  # Set status to logged_out
            if photo_path:
                attendance.logout_photo = photo_path
            attendance.save() # Save to update the record and trigger status calculation

            serializer = self.get_serializer(attendance)
            return Response(serializer.data, status=status.HTTP_200_OK)

    # Optional: Filter attendance by driver or date for reports
    def get_queryset(self):
        queryset = super().get_queryset()
        driver_id = self.request.query_params.get('driver_id')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        if driver_id:
            queryset = queryset.filter(driver__id=driver_id)
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        return queryset

class MonthlyAttendanceSummaryViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for viewing and managing monthly attendance summaries.
    Allows read, create, update, and delete operations.
    Includes a custom action to calculate summaries for a specific month and driver.
    """
    queryset = MonthlyAttendanceSummary.objects.all()
    serializer_class = MonthlyAttendanceSummarySerializer
    permission_classes = [AllowAny] # Uncomment if authentication is required

    @action(detail=False, methods=['post'], url_path='calculate-for-month')
    def calculate_for_month(self, request):
        """
        Calculates and updates the monthly attendance summary for a specific driver, month, and year.
        Expects 'driver_id', 'month', and 'year' in the POST request data.
        """
        driver_id = request.data.get('driver_id')
        month = request.data.get('month')
        year = request.data.get('year')

        if not all([driver_id, month, year]):
            return Response(
                {"detail": "Missing driver_id, month, or year."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            driver = Driver.objects.get(id=driver_id)
            month = int(month)
            year = int(year)
            if not (1 <= month <= 12 and year >= 2000 and year <= 2100):
                 return Response({"detail": "Invalid month or year value."}, status=status.HTTP_400_BAD_REQUEST)
        except Driver.DoesNotExist:
            return Response({"detail": f"Driver with ID {driver_id} not found."}, status=status.HTTP_404_NOT_FOUND)
        except ValueError:
            return Response({"detail": "Month and year must be valid integers."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            summary, created = MonthlyAttendanceSummary.objects.get_or_create(
                driver=driver,
                month=month,
                year=year
            )
            summary.calculate_summary()
            serializer = self.get_serializer(summary)
            response_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK
            return Response(serializer.data, status=response_status)
        except Exception as e:
            return Response({"detail": f"An error occurred during calculation: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class WarningLetterViewSet(viewsets.ModelViewSet):
    queryset = WarningLetter.objects.all()
    serializer_class = WarningLetterSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        instance = serializer.save()
        self.generate_letter(instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        self.generate_letter(instance)

    def generate_letter(self, instance):
        if not hasattr(instance, 'driver') or not instance.driver_id:
            instance.driver = Driver.objects.get(id=instance.driver_id)

        formatted_reason = instance.reason.replace('_', ' ').title()

        issued_by_username = (
            instance.issued_by.get_full_name()
            if hasattr(instance.issued_by, 'get_full_name') and instance.issued_by.get_full_name()
            else getattr(instance.issued_by, 'email', 'HR Department')
        )

        html_string = render_to_string('warning_letter_template.html', {
            'letter': instance,
            'driver_name': instance.driver.driver_name,
            'issued_by_username': issued_by_username,
            'company_name': 'Your Company Name',
            'current_date': timezone.now().strftime("%Y-%m-%d"),
            'formatted_reason': formatted_reason,
        })

        pdf_file = HTML(string=html_string, base_url=settings.BASE_DIR).write_pdf()

        upload_dir = os.path.join(settings.MEDIA_ROOT, 'warning_letters_generated')
        os.makedirs(upload_dir, exist_ok=True)

        file_name = f"warning_letter_{instance.driver.driver_name.replace(' ', '_')}_{instance.id}.pdf"
        instance.generated_letter.save(file_name, ContentFile(pdf_file), save=True)

    @action(detail=True, methods=['get'], url_path='generate_pdf')
    def generate_pdf_action(self, request, pk=None):
        try:
            warning_letter = self.get_object()
        except Http404:
            return Response({"detail": "Warning letter record not found."}, status=status.HTTP_404_NOT_FOUND)

        if warning_letter.generated_letter and os.path.exists(warning_letter.generated_letter.path):
            file_path = warning_letter.generated_letter.path
        else:
            self.generate_letter(warning_letter)
            warning_letter.refresh_from_db()
            file_path = warning_letter.generated_letter.path

        if not os.path.exists(file_path):
            return Response({"detail": "Generated letter file not found on server after generation attempt."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        response = FileResponse(open(file_path, 'rb'), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
        return response


class TerminationViewSet(viewsets.ModelViewSet):
    queryset = Termination.objects.all()
    serializer_class = TerminationSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        instance = serializer.save()
        self.generate_letter(instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        self.generate_letter(instance)

    def generate_letter(self, instance):
        if not hasattr(instance, 'driver') or not instance.driver_id:
             instance.driver = Driver.objects.get(id=instance.driver_id)

        formatted_reason = instance.reason.replace('_', ' ').title()

        html_string = render_to_string('termination_letter_template.html', {
            'termination': instance,
            'driver_name': instance.driver.driver_name,
            'company_name': 'Your Company Name',
            'current_date': timezone.now().strftime("%Y-%m-%d"),
            'formatted_reason': formatted_reason,
        })

        pdf_file = HTML(string=html_string, base_url=settings.BASE_DIR).write_pdf()

        upload_dir = os.path.join(settings.MEDIA_ROOT, 'termination_letters')
        os.makedirs(upload_dir, exist_ok=True)

        file_name = f"termination_letter_{instance.driver.driver_name.replace(' ', '_')}_{instance.id}.pdf"
        instance.generated_letter.save(file_name, ContentFile(pdf_file), save=True)

    @action(detail=True, methods=['get'], url_path='generate_pdf')
    def generate_pdf_action(self, request, pk=None):
        try:
            termination = self.get_object()
        except Http404:
            return Response({"detail": "Termination record not found."}, status=status.HTTP_404_NOT_FOUND)

        if termination.generated_letter and os.path.exists(termination.generated_letter.path):
            file_path = termination.generated_letter.path
        else:
            self.generate_letter(termination)
            termination.refresh_from_db()
            file_path = termination.generated_letter.path

        if not os.path.exists(file_path):
            return Response({"detail": "Generated letter file not found on server after generation attempt."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        response = FileResponse(open(file_path, 'rb'), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
        return response


# ==================== SHIFT MANAGEMENT VIEWSETS ====================

class ShiftTypeViewSet(viewsets.ModelViewSet):
    """ViewSet for managing shift types"""
    queryset = ShiftType.objects.all()
    serializer_class = ShiftTypeSerializer
    permission_classes = [AllowAny]  # Adjust permissions as needed

    def get_queryset(self):
        queryset = super().get_queryset()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        return queryset.order_by('start_time', 'name')


class DriverShiftAssignmentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing driver shift assignments"""
    queryset = DriverShiftAssignment.objects.all()
    serializer_class = DriverShiftAssignmentSerializer
    permission_classes = [AllowAny]  # Adjust permissions as needed

    def get_queryset(self):
        queryset = super().get_queryset()
        driver_id = self.request.query_params.get('driver')
        is_active = self.request.query_params.get('is_active')
        date = self.request.query_params.get('date')

        if driver_id:
            queryset = queryset.filter(driver_id=driver_id)

        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        if date:
            from datetime import datetime
            try:
                filter_date = datetime.strptime(date, '%Y-%m-%d').date()
                queryset = queryset.filter(
                    start_date__lte=filter_date
                ).filter(
                    models.Q(end_date__isnull=True) | models.Q(end_date__gte=filter_date)
                )
            except ValueError:
                pass  # Invalid date format, ignore filter

        return queryset.order_by('-start_date', 'driver__driver_name')

    def perform_create(self, serializer):
        # Set the assigned_by field to the current user
        serializer.save(assigned_by=self.request.user if self.request.user.is_authenticated else None)

    @action(detail=False, methods=['get'], url_path='by-driver/(?P<driver_id>[^/.]+)')
    def by_driver(self, request, driver_id=None):
        """Get shift assignments for a specific driver"""
        assignments = self.get_queryset().filter(driver_id=driver_id, is_active=True)
        serializer = self.get_serializer(assignments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='current-assignments')
    def current_assignments(self, request):
        """Get current active shift assignments"""
        from datetime import date
        today = date.today()

        assignments = self.get_queryset().filter(
            is_active=True,
            start_date__lte=today
        ).filter(
            models.Q(end_date__isnull=True) | models.Q(end_date__gte=today)
        )

        serializer = self.get_serializer(assignments, many=True)
        return Response(serializer.data)


# ==================== LEAVE MANAGEMENT VIEWSETS ====================

class LeaveTypeViewSet(viewsets.ModelViewSet):
    """ViewSet for managing leave types"""
    queryset = LeaveType.objects.all().order_by('name')
    serializer_class = LeaveTypeSerializer
    permission_classes = [AllowAny]  # Change to IsAuthenticated for production

    def get_queryset(self):
        queryset = super().get_queryset()
        is_active = self.request.query_params.get('is_active')

        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        return queryset

    @action(detail=False, methods=['get'], url_path='active')
    def active_leave_types(self, request):
        """Get only active leave types"""
        active_types = self.queryset.filter(is_active=True)
        serializer = self.get_serializer(active_types, many=True)
        return Response(serializer.data)


class LeaveRequestViewSet(viewsets.ModelViewSet):
    """ViewSet for managing leave requests"""
    queryset = LeaveRequest.objects.all().select_related('driver', 'leave_type', 'reviewed_by').order_by('-applied_date')
    permission_classes = [AllowAny]  # Change to IsAuthenticated for production

    def get_serializer_class(self):
        if self.action == 'create':
            return LeaveRequestCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return LeaveRequestUpdateSerializer
        return LeaveRequestSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter parameters
        driver_id = self.request.query_params.get('driver')
        status = self.request.query_params.get('status')
        leave_type = self.request.query_params.get('leave_type')
        year = self.request.query_params.get('year')
        month = self.request.query_params.get('month')

        if driver_id:
            queryset = queryset.filter(driver_id=driver_id)
        if status:
            queryset = queryset.filter(status=status)
        if leave_type:
            queryset = queryset.filter(leave_type_id=leave_type)
        if year:
            queryset = queryset.filter(start_date__year=year)
        if month:
            queryset = queryset.filter(start_date__month=month)

        return queryset

    @action(detail=True, methods=['post'], url_path='approve')
    def approve_request(self, request, pk=None):
        """Approve a leave request"""
        leave_request = self.get_object()

        if leave_request.status != 'pending':
            return Response(
                {'error': 'Only pending requests can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )

        leave_request.status = 'approved'
        # Only set reviewed_by if user is authenticated
        if request.user.is_authenticated:
            leave_request.reviewed_by = request.user
        leave_request.reviewed_date = timezone.now()
        leave_request.admin_comments = request.data.get('admin_comments', '')
        leave_request.save()

        # Update leave balance
        self._update_leave_balance(leave_request, 'approve')

        serializer = self.get_serializer(leave_request)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject_request(self, request, pk=None):
        """Reject a leave request"""
        leave_request = self.get_object()

        if leave_request.status != 'pending':
            return Response(
                {'error': 'Only pending requests can be rejected'},
                status=status.HTTP_400_BAD_REQUEST
            )

        leave_request.status = 'rejected'
        # Only set reviewed_by if user is authenticated
        if request.user.is_authenticated:
            leave_request.reviewed_by = request.user
        leave_request.reviewed_date = timezone.now()
        leave_request.admin_comments = request.data.get('admin_comments', '')
        leave_request.save()

        serializer = self.get_serializer(leave_request)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel_request(self, request, pk=None):
        """Cancel a leave request (driver or admin)"""
        leave_request = self.get_object()

        if leave_request.status not in ['pending', 'approved']:
            return Response(
                {'error': 'Only pending or approved requests can be cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # If approved request is being cancelled, update leave balance
        if leave_request.status == 'approved':
            self._update_leave_balance(leave_request, 'cancel')

        leave_request.status = 'cancelled'
        leave_request.admin_comments = request.data.get('admin_comments', 'Request cancelled')
        leave_request.save()

        serializer = self.get_serializer(leave_request)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='stats')
    def get_stats(self, request):
        """Get leave request statistics"""
        from django.db.models import Count, Sum

        # Basic counts
        total_requests = LeaveRequest.objects.count()
        pending_requests = LeaveRequest.objects.filter(status='pending').count()
        approved_requests = LeaveRequest.objects.filter(status='approved').count()
        rejected_requests = LeaveRequest.objects.filter(status='rejected').count()

        # Total leave days
        total_leave_days = LeaveRequest.objects.filter(
            status='approved'
        ).aggregate(total=Sum('total_days'))['total'] or 0

        # Leave types count
        leave_types_count = LeaveType.objects.filter(is_active=True).count()

        # Drivers on leave today
        from django.utils import timezone
        today = timezone.now().date()
        drivers_on_leave_today = LeaveRequest.objects.filter(
            status='approved',
            start_date__lte=today,
            end_date__gte=today
        ).count()

        stats_data = {
            'total_requests': total_requests,
            'pending_requests': pending_requests,
            'approved_requests': approved_requests,
            'rejected_requests': rejected_requests,
            'total_leave_days': total_leave_days,
            'leave_types_count': leave_types_count,
            'drivers_on_leave_today': drivers_on_leave_today
        }

        serializer = LeaveStatsSerializer(stats_data)
        return Response(serializer.data)

    def _update_leave_balance(self, leave_request, action):
        """Update leave balance when request is approved/cancelled"""
        balance, created = LeaveBalance.objects.get_or_create(
            driver=leave_request.driver,
            leave_type=leave_request.leave_type,
            year=leave_request.start_date.year,
            defaults={
                'allocated_days': leave_request.leave_type.max_days_per_year,
                'used_days': 0,
                'pending_days': 0
            }
        )

        if action == 'approve':
            balance.used_days += leave_request.total_days
            balance.pending_days = max(0, balance.pending_days - leave_request.total_days)
        elif action == 'cancel':
            balance.used_days = max(0, balance.used_days - leave_request.total_days)

        balance.save()


class LeaveBalanceViewSet(viewsets.ModelViewSet):
    """ViewSet for managing leave balances"""
    queryset = LeaveBalance.objects.all().select_related('driver', 'leave_type').order_by('-year', 'driver__driver_name')
    serializer_class = LeaveBalanceSerializer
    permission_classes = [AllowAny]  # Change to IsAuthenticated for production

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter parameters
        driver_id = self.request.query_params.get('driver')
        leave_type_id = self.request.query_params.get('leave_type')
        year = self.request.query_params.get('year')

        if driver_id:
            queryset = queryset.filter(driver_id=driver_id)
        if leave_type_id:
            queryset = queryset.filter(leave_type_id=leave_type_id)
        if year:
            queryset = queryset.filter(year=year)

        return queryset

    @action(detail=False, methods=['post'], url_path='initialize-balances')
    def initialize_balances(self, request):
        """Initialize leave balances for all drivers for a specific year"""
        year = request.data.get('year', timezone.now().year)

        drivers = Driver.objects.filter(status='approved')
        leave_types = LeaveType.objects.filter(is_active=True)

        created_count = 0
        for driver in drivers:
            for leave_type in leave_types:
                balance, created = LeaveBalance.objects.get_or_create(
                    driver=driver,
                    leave_type=leave_type,
                    year=year,
                    defaults={
                        'allocated_days': leave_type.max_days_per_year,
                        'used_days': 0,
                        'pending_days': 0
                    }
                )
                if created:
                    created_count += 1

        return Response({
            'message': f'Initialized {created_count} leave balances for year {year}',
            'year': year,
            'drivers_count': drivers.count(),
            'leave_types_count': leave_types.count()
        })

    @action(detail=False, methods=['get'], url_path='driver/(?P<driver_id>\d+)')
    def driver_balances(self, request, driver_id=None):
        """Get all leave balances for a specific driver"""
        try:
            driver = Driver.objects.get(id=driver_id)
        except Driver.DoesNotExist:
            return Response({'error': 'Driver not found'}, status=status.HTTP_404_NOT_FOUND)

        year = request.query_params.get('year', timezone.now().year)
        balances = self.queryset.filter(driver=driver, year=year)

        serializer = self.get_serializer(balances, many=True)
        return Response({
            'driver_name': driver.driver_name,
            'year': year,
            'balances': serializer.data
        })

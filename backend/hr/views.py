# your_app_name/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
import math # For haversine distance
from django.db import transaction
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.db.models import Q, Count, Avg, Sum
from core.permissions import IsHRUser, IsAdminUser, IsStaffUser
from django.http import FileResponse, Http404
from django.template.loader import render_to_string
from django.core.files.base import ContentFile
from weasyprint import HTML
import os
from django.conf import settings


from .models import (
    Driver, CheckinLocation, Attendance,
    MonthlyAttendanceSummary, WarningLetter, Termination,
    ApartmentLocation, Company,
    Employee, LeaveType, LeaveBalance, LeaveRequest, PerformanceReview,
    Goal, EmployeeDocument, Payroll, Training, TrainingEnrollment,
    HRPolicy, PolicyAcknowledgment
)
from vehicle.models import VehicleRegistration
from .serializers import (
    DriverSerializer, CheckinLocationSerializer, AttendanceSerializer,
    MonthlyAttendanceSummarySerializer, TerminationSerializer, WarningLetterSerializer,
    ApartmentLocationSerializer, CompanySerializer, VehicleRegistrationSerializer,
    EmployeeSerializer, LeaveTypeSerializer, LeaveBalanceSerializer, LeaveRequestSerializer,
    PerformanceReviewSerializer, GoalSerializer, EmployeeDocumentSerializer,
    PayrollSerializer, TrainingSerializer, TrainingEnrollmentSerializer,
    HRPolicySerializer, PolicyAcknowledgmentSerializer
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
        # login_photo_file will be in request.FILES if content-type is multipart/form-data.
        # If the Flutter app is sending JSON with base64 encoded photo, you would access it from request.data
        # like: login_photo_base64 = request.data.get('login_photo_base64') and then decode and save it.
        # For now, it expects a file via multipart/form-data, or will be None if not provided.
        login_photo_file = request.FILES.get('login_photo')

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
            # Assumes CheckinLocation has a ForeignKey to Company (driver.company)
            # and is_active flag.
            allowed_locations = CheckinLocation.objects.filter(company=driver.company, is_active=True)
            for loc in allowed_locations:
                distance = haversine_distance(login_lat_dec, login_lon_dec, loc.latitude, loc.longitude)
                if distance <= loc.radius_meters:
                    matched_location = loc
                    break

            if not matched_location:
                return Response({"detail": "You are not at an authorized check-in location."}, status=status.HTTP_403_FORBIDDEN)
        # --- End Geolocation Validation ---

        # Prepare defaults for update_or_create
        defaults = {
            'login_time': login_time,
            'login_latitude': login_lat_dec,
            'login_longitude': login_lon_dec,
            'checked_in_location': matched_location,
            'platform': request.data.get('platform'), # Include platform if sent
        }
        if login_photo_file: # Only add photo if it was actually provided in request.FILES
            defaults['login_photo'] = login_photo_file

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
        # logout_photo_file will be in request.FILES if content-type is multipart/form-data.
        # If sending base64 in JSON, you'd handle it differently.
        logout_photo_file = request.FILES.get('logout_photo')

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

        with transaction.atomic():
            attendance.logout_time = logout_time
            attendance.logout_latitude = logout_lat_dec
            attendance.logout_longitude = logout_lon_dec
            if logout_photo_file: # Only assign if file was provided
                attendance.logout_photo = logout_photo_file
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


# Enhanced HR ViewSets

class EmployeeViewSet(viewsets.ModelViewSet):
    """Employee management with role-based permissions"""
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'position', 'employment_type', 'employment_status', 'company', 'manager']
    search_fields = ['first_name', 'last_name', 'email', 'employee_id']
    ordering_fields = ['first_name', 'last_name', 'hire_date', 'created_at']
    ordering = ['first_name', 'last_name']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsHRUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        if user.role == 'admin':
            return queryset
        elif user.role in ['hr', 'management']:
            return queryset
        elif user.role == 'driver':
            # Drivers can only see their own profile
            return queryset.filter(user=user)
        else:
            return queryset.filter(user=user)

    @action(detail=True, methods=['get'])
    def performance_summary(self, request, pk=None):
        """Get employee performance summary"""
        employee = self.get_object()

        # Get recent performance reviews
        reviews = PerformanceReview.objects.filter(employee=employee).order_by('-review_period_end')[:5]

        # Get active goals
        goals = Goal.objects.filter(employee=employee, status__in=['not_started', 'in_progress'])

        # Calculate average ratings
        avg_rating = reviews.aggregate(avg=Avg('overall_rating'))['avg'] or 0

        return Response({
            'employee': EmployeeSerializer(employee).data,
            'recent_reviews': PerformanceReviewSerializer(reviews, many=True).data,
            'active_goals': GoalSerializer(goals, many=True).data,
            'average_rating': round(avg_rating, 2),
            'total_reviews': reviews.count(),
            'completed_goals': Goal.objects.filter(employee=employee, status='completed').count()
        })

    @action(detail=True, methods=['get'])
    def leave_summary(self, request, pk=None):
        """Get employee leave summary"""
        employee = self.get_object()
        current_year = timezone.now().year

        # Get leave balances for current year
        balances = LeaveBalance.objects.filter(employee=employee, year=current_year)

        # Get recent leave requests
        recent_requests = LeaveRequest.objects.filter(employee=employee).order_by('-created_at')[:10]

        return Response({
            'employee': EmployeeSerializer(employee).data,
            'leave_balances': LeaveBalanceSerializer(balances, many=True).data,
            'recent_requests': LeaveRequestSerializer(recent_requests, many=True).data,
            'total_leaves_taken': sum(b.used_days for b in balances),
            'pending_requests': recent_requests.filter(status='pending').count()
        })


class LeaveTypeViewSet(viewsets.ModelViewSet):
    """Leave type management"""
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_paid', 'requires_approval', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'max_days_per_year']
    ordering = ['name']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsHRUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]


class LeaveBalanceViewSet(viewsets.ModelViewSet):
    """Leave balance management"""
    queryset = LeaveBalance.objects.all()
    serializer_class = LeaveBalanceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employee', 'leave_type', 'year']
    search_fields = ['employee__first_name', 'employee__last_name', 'leave_type__name']
    ordering_fields = ['year', 'allocated_days', 'used_days']
    ordering = ['-year', 'employee__first_name']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsHRUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        if user.role in ['admin', 'hr', 'management']:
            return queryset
        elif user.role == 'driver':
            # Drivers can only see their own leave balances
            return queryset.filter(employee__user=user)
        else:
            return queryset.filter(employee__user=user)


class LeaveRequestViewSet(viewsets.ModelViewSet):
    """Leave request management with approval workflow"""
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employee', 'leave_type', 'status', 'start_date', 'end_date']
    search_fields = ['employee__first_name', 'employee__last_name', 'reason']
    ordering_fields = ['start_date', 'created_at', 'days_requested']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        if user.role in ['admin', 'hr', 'management']:
            return queryset
        elif user.role == 'driver':
            # Drivers can only see their own leave requests
            return queryset.filter(employee__user=user)
        else:
            return queryset.filter(employee__user=user)

    def perform_create(self, serializer):
        # Set the employee to the current user's employee profile
        try:
            employee = Employee.objects.get(user=self.request.user)
            serializer.save(employee=employee)
        except Employee.DoesNotExist:
            from rest_framework import serializers
            raise serializers.ValidationError("Employee profile not found for current user")

    @action(detail=True, methods=['post'], permission_classes=[IsHRUser])
    def approve(self, request, pk=None):
        """Approve a leave request"""
        leave_request = self.get_object()

        if leave_request.status != 'pending':
            return Response({'error': 'Leave request is not pending'}, status=status.HTTP_400_BAD_REQUEST)

        # Check leave balance
        try:
            balance = LeaveBalance.objects.get(
                employee=leave_request.employee,
                leave_type=leave_request.leave_type,
                year=leave_request.start_date.year
            )

            if balance.remaining_days < leave_request.days_requested:
                return Response({
                    'error': f'Insufficient leave balance. Available: {balance.remaining_days}, Requested: {leave_request.days_requested}'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Update leave request
            leave_request.status = 'approved'
            leave_request.approved_by = Employee.objects.get(user=request.user)
            leave_request.approved_at = timezone.now()
            leave_request.save()

            # Update leave balance
            balance.used_days += leave_request.days_requested
            balance.save()

            return Response({'message': 'Leave request approved successfully'})

        except LeaveBalance.DoesNotExist:
            return Response({'error': 'Leave balance not found'}, status=status.HTTP_400_BAD_REQUEST)
        except Employee.DoesNotExist:
            return Response({'error': 'Employee profile not found'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsHRUser])
    def reject(self, request, pk=None):
        """Reject a leave request"""
        leave_request = self.get_object()

        if leave_request.status != 'pending':
            return Response({'error': 'Leave request is not pending'}, status=status.HTTP_400_BAD_REQUEST)

        rejection_reason = request.data.get('rejection_reason', '')

        leave_request.status = 'rejected'
        leave_request.rejection_reason = rejection_reason
        leave_request.save()

        return Response({'message': 'Leave request rejected successfully'})


class PerformanceReviewViewSet(viewsets.ModelViewSet):
    """Performance review management"""
    queryset = PerformanceReview.objects.all()
    serializer_class = PerformanceReviewSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employee', 'reviewer', 'review_type', 'status']
    search_fields = ['employee__first_name', 'employee__last_name']
    ordering_fields = ['review_period_end', 'overall_rating', 'created_at']
    ordering = ['-review_period_end']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsHRUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        if user.role in ['admin', 'hr', 'management']:
            return queryset
        elif user.role == 'driver':
            # Drivers can only see their own reviews
            return queryset.filter(employee__user=user)
        else:
            return queryset.filter(employee__user=user)

    def perform_create(self, serializer):
        try:
            reviewer = Employee.objects.get(user=self.request.user)
            serializer.save(reviewer=reviewer)
        except Employee.DoesNotExist:
            from rest_framework import serializers
            raise serializers.ValidationError("Employee profile not found for current user")


class GoalViewSet(viewsets.ModelViewSet):
    """Goal management"""
    queryset = Goal.objects.all()
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employee', 'priority', 'status', 'created_by']
    search_fields = ['title', 'description', 'employee__first_name', 'employee__last_name']
    ordering_fields = ['target_date', 'priority', 'progress_percentage', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        if user.role in ['admin', 'hr', 'management']:
            return queryset
        elif user.role == 'driver':
            # Drivers can only see their own goals
            return queryset.filter(employee__user=user)
        else:
            return queryset.filter(employee__user=user)

    def perform_create(self, serializer):
        try:
            created_by = Employee.objects.get(user=self.request.user)
            serializer.save(created_by=created_by)
        except Employee.DoesNotExist:
            from rest_framework import serializers
            raise serializers.ValidationError("Employee profile not found for current user")

    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        """Update goal progress"""
        goal = self.get_object()
        progress = request.data.get('progress_percentage', goal.progress_percentage)

        if not (0 <= progress <= 100):
            return Response({'error': 'Progress must be between 0 and 100'}, status=status.HTTP_400_BAD_REQUEST)

        goal.progress_percentage = progress

        # Auto-complete if 100%
        if progress == 100:
            goal.status = 'completed'
            goal.completion_date = timezone.now().date()

        goal.save()

        return Response({
            'message': 'Goal progress updated successfully',
            'goal': GoalSerializer(goal).data
        })


class EmployeeDocumentViewSet(viewsets.ModelViewSet):
    """Employee document management"""
    queryset = EmployeeDocument.objects.all()
    serializer_class = EmployeeDocumentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employee', 'document_type', 'is_confidential']
    search_fields = ['title', 'description', 'employee__first_name', 'employee__last_name']
    ordering_fields = ['created_at', 'expiry_date']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsHRUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        if user.role in ['admin', 'hr']:
            return queryset
        elif user.role == 'driver':
            # Drivers can only see their own documents (non-confidential)
            return queryset.filter(employee__user=user, is_confidential=False)
        else:
            return queryset.filter(employee__user=user, is_confidential=False)

    def perform_create(self, serializer):
        try:
            uploaded_by = Employee.objects.get(user=self.request.user)
            serializer.save(uploaded_by=uploaded_by)
        except Employee.DoesNotExist:
            from rest_framework import serializers
            raise serializers.ValidationError("Employee profile not found for current user")

    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        """Get documents expiring in the next 30 days"""
        from datetime import timedelta

        expiry_threshold = timezone.now().date() + timedelta(days=30)
        expiring_docs = self.get_queryset().filter(
            expiry_date__lte=expiry_threshold,
            expiry_date__gte=timezone.now().date()
        )

        serializer = self.get_serializer(expiring_docs, many=True)
        return Response({
            'expiring_documents': serializer.data,
            'count': expiring_docs.count()
        })


class PayrollViewSet(viewsets.ModelViewSet):
    """Payroll management"""
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer
    permission_classes = [IsHRUser]  # Only HR can manage payroll
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employee', 'pay_period_start', 'pay_period_end', 'is_processed']
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__employee_id']
    ordering_fields = ['pay_period_end', 'net_salary', 'created_at']
    ordering = ['-pay_period_end']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        if user.role in ['admin', 'hr', 'accountant']:
            return queryset
        elif user.role == 'driver':
            # Drivers can only see their own payroll
            return queryset.filter(employee__user=user)
        else:
            return queryset.filter(employee__user=user)

    @action(detail=True, methods=['post'], permission_classes=[IsHRUser])
    def process_payment(self, request, pk=None):
        """Process payroll payment"""
        payroll = self.get_object()

        if payroll.is_processed:
            return Response({'error': 'Payroll already processed'}, status=status.HTTP_400_BAD_REQUEST)

        payment_date = request.data.get('payment_date', timezone.now().date())
        payment_method = request.data.get('payment_method', 'bank_transfer')
        payment_reference = request.data.get('payment_reference', '')

        payroll.is_processed = True
        payroll.payment_date = payment_date
        payroll.payment_method = payment_method
        payroll.payment_reference = payment_reference

        try:
            payroll.processed_by = Employee.objects.get(user=request.user)
        except Employee.DoesNotExist:
            pass

        payroll.save()

        return Response({
            'message': 'Payroll processed successfully',
            'payroll': PayrollSerializer(payroll).data
        })

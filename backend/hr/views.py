# your_app_name/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
import math # For haversine distance
from django.db import transaction
from rest_framework.permissions import AllowAny
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
)
from vehicle.models import VehicleRegistration
from .serializers import (
    DriverSerializer, CheckinLocationSerializer, AttendanceSerializer,
    MonthlyAttendanceSummarySerializer, TerminationSerializer, WarningLetterSerializer,
    ApartmentLocationSerializer, CompanySerializer, VehicleRegistrationSerializer
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

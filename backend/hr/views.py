# your_app_name/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
import math # For haversine distance
from django.db import transaction
from rest_framework.permissions import AllowAny
from usermanagement.serializers import CustomUserSerializer



from .models import (
    Driver, CheckinLocation, Attendance,
    MonthlyAttendanceSummary, WarningLetter, Termination,
    ApartmentLocation, Company, 
)
from vehicle.models import VehicleRegistration
from .serializers import (
    DriverSerializer, CheckinLocationSerializer, AttendanceSerializer,
    MonthlyAttendanceSummarySerializer, TerminationSerializer,WarningLetterSerializer,
    ApartmentLocationSerializer, CompanySerializer, VehicleRegistrationSerializer
)


from vehicle.serializers import VehicleRegistrationSerializer
# Assuming you want some authentication for your API
from rest_framework.permissions import IsAuthenticated

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
    # permission_classes = [IsAuthenticated]

    # Custom action for driver login/check-in
    @action(detail=False, methods=['post'], url_path='driver-login')
    def driver_login(self, request):
        driver_id = request.data.get('driver_id')
        login_time_str = request.data.get('login_time') # e.g., "10:30:00"
        login_lat = request.data.get('login_latitude')
        login_lon = request.data.get('login_longitude')
        login_photo_file = request.FILES.get('login_photo')

        if not all([driver_id, login_time_str, login_lat, login_lon, login_photo_file]):
            return Response({"detail": "Missing required login data."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            driver = Driver.objects.get(id=driver_id)
            login_time = timezone.datetime.strptime(login_time_str, '%H:%M:%S').time()
            login_lat_dec = float(login_lat)
            login_lon_dec = float(login_lon)
        except (Driver.DoesNotExist, ValueError):
            return Response({"detail": "Invalid driver ID or time format."}, status=status.HTTP_400_BAD_REQUEST)

        # --- Geolocation Validation ---
        allowed_locations = CheckinLocation.objects.filter(company=driver.company, is_active=True)
        matched_location = None

        for loc in allowed_locations:
            distance = haversine_distance(login_lat_dec, login_lon_dec, loc.latitude, loc.longitude)
            if distance <= loc.radius_meters:
                matched_location = loc
                break

        if not matched_location:
            return Response({"detail": "You are not at an authorized check-in location."}, status=status.HTTP_403_FORBIDDEN)

        # Create or update attendance record for today
        with transaction.atomic():
            attendance, created = Attendance.objects.update_or_create(
                driver=driver,
                date=timezone.localdate(), # Assumes check-in is for the current local date
                defaults={
                    'login_time': login_time,
                    'login_photo': login_photo_file,
                    'login_latitude': login_lat_dec,
                    'login_longitude': login_lon_dec,
                    'checked_in_location': matched_location,
                    # status will be set by the Attendance model's save method
                }
            )
            attendance.save() # Call save to trigger automatic status calculation

            serializer = self.get_serializer(attendance)
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


    # Custom action for driver logout/check-out
    @action(detail=False, methods=['post'], url_path='driver-logout')
    def driver_logout(self, request):
        driver_id = request.data.get('driver_id')
        logout_time_str = request.data.get('logout_time') # e.g., "17:30:00"
        logout_lat = request.data.get('logout_latitude')
        logout_lon = request.data.get('logout_longitude')
        logout_photo_file = request.FILES.get('logout_photo')

        if not all([driver_id, logout_time_str, logout_lat, logout_lon, logout_photo_file]):
            return Response({"detail": "Missing required logout data."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            driver = Driver.objects.get(id=driver_id)
            logout_time = timezone.datetime.strptime(logout_time_str, '%H:%M:%S').time()
            logout_lat_dec = float(logout_lat)
            logout_lon_dec = float(logout_lon)
        except (Driver.DoesNotExist, ValueError):
            return Response({"detail": "Invalid driver ID or time format."}, status=status.HTTP_400_BAD_REQUEST)

        # Find today's attendance record
        try:
            attendance = Attendance.objects.get(driver=driver, date=timezone.localdate())
        except Attendance.DoesNotExist:
            return Response({"detail": "No active attendance record found for today. Please login first."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            attendance.logout_time = logout_time
            attendance.logout_photo = logout_photo_file
            attendance.logout_latitude = logout_lat_dec
            attendance.logout_longitude = logout_lon_dec
            attendance.save() # Save to update the record

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

class MonthlyAttendanceSummaryViewSet(viewsets.ModelViewSet): # Changed to ModelViewSet
    """
    A ViewSet for viewing and managing monthly attendance summaries.
    Allows read, create, update, and delete operations.
    Includes a custom action to calculate summaries for a specific month and driver.
    """
    queryset = MonthlyAttendanceSummary.objects.all()
    serializer_class = MonthlyAttendanceSummarySerializer
    # permission_classes = [IsAuthenticated] # Uncomment if authentication is required

    # Optional: Action to trigger monthly summary calculation (e.g., from admin UI or another service)
    # This action can be accessed at: /api/attendance/monthly-summary/calculate-for-month/
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
            # Basic validation for month/year ranges
            if not (1 <= month <= 12 and year >= 2000 and year <= 2100): # Adjust year range as needed
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
            summary.calculate_summary() # Call the model method to populate/re-calculate fields
            serializer = self.get_serializer(summary)
            # Return appropriate status based on whether a new summary was created or an existing one updated
            response_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK
            return Response(serializer.data, status=response_status)
        except Exception as e:
            # Catch any other unexpected errors during summary calculation/save
            return Response({"detail": f"An error occurred during calculation: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




class WarningLetterViewSet(viewsets.ModelViewSet):
    queryset = WarningLetter.objects.all()
    serializer_class = WarningLetterSerializer
    permission_classes = [AllowAny] # Adjust permissions as needed

    def perform_create(self, serializer):
        instance = serializer.save()
        self.generate_letter(instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        self.generate_letter(instance)

    def generate_letter(self, instance):
        # Ensure driver is loaded for the template
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
        """
        Generates and returns the warning letter PDF for a specific WarningLetter instance.
        If the letter is already generated and saved, it returns the existing file.
        Otherwise, it generates it and then returns it.
        """
        try:
            warning_letter = self.get_object()
        except Http404:
            return Response({"detail": "Warning letter record not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if the generated_letter already exists and the file is on disk
        if warning_letter.generated_letter and os.path.exists(warning_letter.generated_letter.path):
            file_path = warning_letter.generated_letter.path
        else:
            # If not generated or file is missing, generate it now
            self.generate_letter(warning_letter) # This will save it to the instance
            warning_letter.refresh_from_db() # Refresh instance to get the new generated_letter path
            file_path = warning_letter.generated_letter.path # Get the path after saving

        if not os.path.exists(file_path):
            return Response({"detail": "Generated letter file not found on server after generation attempt."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        response = FileResponse(open(file_path, 'rb'), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
        return response



from django.template.loader import render_to_string
from django.core.files.base import ContentFile
from weasyprint import HTML
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import FileResponse, Http404
import os
from django.utils import timezone # Import timezone for default date values

# Assuming these imports are already correct based on your setup
from .models import Termination, Driver # Make sure Driver is imported
from .serializers import TerminationSerializer # Ensure your TerminationSerializer is imported
from django.conf import settings
from django.contrib.auth import get_user_model
User = get_user_model()


class TerminationViewSet(viewsets.ModelViewSet):
    queryset = Termination.objects.all()
    serializer_class = TerminationSerializer
    permission_classes = [AllowAny] # Or [IsAuthenticated] if you uncomment later

    def perform_create(self, serializer):
        instance = serializer.save()
        self.generate_letter(instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        self.generate_letter(instance)

    def generate_letter(self, instance):
        # Ensure driver is loaded for the template
        # This pre-fetching helps avoid extra database hits if driver isn't already loaded
        if not hasattr(instance, 'driver') or not instance.driver_id:
             instance.driver = Driver.objects.get(id=instance.driver_id) # Fetch driver if not already loaded

        # --- FIX FOR 'replace' FILTER ---
        # Preprocess the reason string in Python before passing to the template
        formatted_reason = instance.reason.replace('_', ' ').title()
        # --- END FIX ---

        html_string = render_to_string('termination_letter_template.html', {
            'termination': instance,
            'driver_name': instance.driver.driver_name,
            'company_name': 'Your Company Name', # Make this dynamic or configurable
            'current_date': timezone.now().strftime("%Y-%m-%d"),
            'formatted_reason': formatted_reason, # Pass the pre-formatted reason
            # Add any other context variables needed for your template
        })

        pdf_file = HTML(string=html_string, base_url=settings.BASE_DIR).write_pdf()

        # Ensure directory exists before saving
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'termination_letters')
        os.makedirs(upload_dir, exist_ok=True)

        file_name = f"termination_letter_{instance.driver.driver_name.replace(' ', '_')}_{instance.id}.pdf"
        instance.generated_letter.save(file_name, ContentFile(pdf_file), save=True)


    @action(detail=True, methods=['get'], url_path='generate_pdf')
    def generate_pdf_action(self, request, pk=None):
        """
        Generates and returns the termination letter PDF for a specific Termination instance.
        If the letter is already generated and saved, it returns the existing file.
        Otherwise, it generates it and then returns it.
        """
        try:
            termination = self.get_object()
        except Http404:
            return Response({"detail": "Termination record not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if the generated_letter already exists
        # This check should ideally also confirm the file exists on disk
        if termination.generated_letter and os.path.exists(termination.generated_letter.path):
            file_path = termination.generated_letter.path
        else:
            # If not generated or file is missing, generate it now
            self.generate_letter(termination) # This will save it to the instance
            termination.refresh_from_db() # Refresh instance to get the new generated_letter path
            file_path = termination.generated_letter.path # Get the path after saving

        if not os.path.exists(file_path):
            return Response({"detail": "Generated letter file not found on server after generation attempt."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        response = FileResponse(open(file_path, 'rb'), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
        return response


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import render
from .models import CheckinLocation, Company
from .serializers import CheckinLocationSerializer

# class CheckinLocationCreateView(APIView):
#     def post(self, request):
#         serializer = CheckinLocationSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response({'message': 'Check-in location created successfully.'}, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# from .models import CheckinLocation, ApartmentLocation

# from .serializers import CheckinLocationSerializer, ApartmentLocationSerializer

# class LocationDashboardAPIView(APIView):
#     def get(self, request):
#         checkin_locations = CheckinLocation.objects.all()
#         apartment_locations = ApartmentLocation.objects.all()

#         checkin_serializer = CheckinLocationSerializer(checkin_locations, many=True)
#         apartment_serializer = ApartmentLocationSerializer(apartment_locations, many=True)

#         return Response({
#             'checkin_locations': checkin_serializer.data,
#             'apartment_locations': apartment_serializer.data
#         }, status=status.HTTP_200_OK)

from rest_framework import serializers
from .models import CheckinLocation, ApartmentLocation, Driver # Make sure Driver is imported

class DriverSerializer(serializers.ModelSerializer):
    """Serializer for the Driver model."""
    class Meta:
        model = Driver
        fields = ['id', 'driver_name'] # Explicitly list fields for clarity and control

class CheckinLocationSerializer(serializers.ModelSerializer):
    """Serializer for CheckinLocation model."""
    # This correctly handles the ForeignKey:
    # For POST/PUT (input), it expects an integer ID for the 'driver' field.
    # For GET (output), it will display the driver's ID by default.
    driver = serializers.PrimaryKeyRelatedField(queryset=Driver.objects.all())

    # Add a read-only field to display the driver's name when retrieving data (GET requests).
    # This is a common pattern to include related data without requiring it for input.
    driver_name = serializers.CharField(source='driver.driver_name', read_only=True)

    class Meta:
        model = CheckinLocation
        # Include both 'driver' (for input/output as ID) and 'driver_name' (for display only)
        fields = "__all__"

class ApartmentLocationSerializer(serializers.ModelSerializer):
    """Serializer for ApartmentLocation model."""

    driver = serializers.PrimaryKeyRelatedField(queryset=Driver.objects.all())
    driver_name = serializers.CharField(source='driver.driver_name', read_only=True)

    class Meta:
        model = ApartmentLocation
        fields = "__all__"  # ✅ Corrected from "_all__"

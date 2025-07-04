from django.db import models
from django.conf import settings 
from django.utils import timezone
from company.models import Company
from drivers.models import Driver
from vehicle.models import VehicleRegistration

class CheckinLocation(models.Model):
    name = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    radius_meters = models.IntegerField()
    is_active = models.BooleanField(default=True)
    # THIS LINE IS CRUCIAL: What is the name of your ForeignKey field to Driver?
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE,null=True,blank=True,related_name='checkin_locations') # <--- Is it 'driver'? Or something else?
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class ApartmentLocation(models.Model):
    name = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    alarm_radius_meters = models.IntegerField()
    is_active = models.BooleanField(default=True)
    # THIS LINE IS CRUCIAL: What is the name of your ForeignKey field to Driver?
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE,null=True,blank=True,related_name='apartment_locations') # <--- Is it 'driver'? Or something else?
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name



# your_app_name/models.py (Excerpt, focus on Attendance model)

from django.db import models
from django.utils import timezone
# from drivers.models import Driver, CheckinLocation # Assuming these imports are correct

class Attendance(models.Model):
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField(default=timezone.localdate) # Date of attendance
    assigned_time = models.TimeField(null=True, blank=True) # E.g., scheduled start time

    # Login (Check-in) details
    login_time = models.TimeField(null=True, blank=True)
    login_photo = models.ImageField(upload_to='login_photos/', null=True, blank=True) # <<< IMPORTANT: null=True, blank=True
    login_latitude = models.CharField(max_length=20, null=True, blank=True)
    login_longitude = models.CharField(max_length=20, null=True, blank=True)
    checked_in_location = models.ForeignKey(CheckinLocation, on_delete=models.SET_NULL, null=True, blank=True)

    # Logout (Check-out) details
    logout_time = models.TimeField(null=True, blank=True)
    logout_photo = models.ImageField(upload_to='logout_photos/', null=True, blank=True) # <<< IMPORTANT: null=True, blank=True
    logout_latitude = models.CharField(max_length=20, null=True, blank=True)
    logout_longitude = models.CharField(max_length=20, null=True, blank=True)

    # Status and deduction
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('logged_in', 'Logged In'),
        ('logged_out', 'Logged Out'),
        ('absent', 'Absent'),
        ('leave', 'Leave'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reason_for_deduction = models.TextField(null=True, blank=True)
    deduct_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # Other details
    platform = models.CharField(max_length=50, null=True, blank=True) # E.g., 'mobile_app', 'web_admin'

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('driver', 'date') # A driver can only have one attendance record per day
        ordering = ['-date', 'driver__driver_name']

    def __str__(self):
        return f"{self.driver.driver_name} - {self.date} ({self.status})"

    @property
    def active_time_hours(self):
        """Calculates the duration the driver was logged in, in hours."""
        if self.login_time and self.logout_time:
            # Convert time objects to datetime objects for calculation (using a dummy date)
            dummy_date = timezone.localdate()
            login_datetime = timezone.datetime.combine(dummy_date, self.login_time)
            logout_datetime = timezone.datetime.combine(dummy_date, self.logout_time)

            # Ensure logout is after login for valid calculation
            if logout_datetime > login_datetime:
                duration = logout_datetime - login_datetime
                return duration.total_seconds() / 3600
        return 0.0 # Return 0 if not logged in/out or invalid times



class MonthlyAttendanceSummary(models.Model):
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='monthly_summaries')
    month = models.IntegerField()
    year = models.IntegerField()
    total_working_days = models.IntegerField(default=0)
    present_days = models.IntegerField(default=0)
    late_days = models.IntegerField(default=0)
    absent_days = models.IntegerField(default=0)
    on_time_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    total_deductions_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    attendance_score = models.IntegerField(default=0)

    class Meta:
        unique_together = ('driver', 'month', 'year')
        ordering = ['-year', '-month', 'driver__driver_name']
        verbose_name = "Monthly Attendance Summary"
        verbose_name_plural = "Monthly Attendance Summaries"

    def __str__(self):
        return f"Monthly Summary for {self.driver.driver_name} - {self.month}/{self.year}"

    def calculate_summary(self):
        attendances = self.driver.attendances.filter(date__year=self.year, date__month=self.month)
        self.total_working_days = attendances.count()
        self.present_days = attendances.filter(status__in=['on_time', 'late']).count()
        self.late_days = attendances.filter(status='late').count()
        self.absent_days = attendances.filter(status='absent').count()
        if self.total_working_days > 0:
            on_time_count = attendances.filter(status='on_time').count()
            self.on_time_percentage = (on_time_count / self.total_working_days) * 100
        self.total_deductions_amount = attendances.aggregate(total=models.Sum('deduct_amount'))['total'] or 0.00
        self.attendance_score = max(0, 100 - (self.late_days * 5) - (self.absent_days * 10))
        self.save()




class WarningLetter(models.Model):
    WARNING_STATUS_CHOICES = [('active', 'Active'), ('inactive', 'Inactive')]
    WARNING_REASON_CHOICES = [
        ('speeding', 'Speeding'),
        ('reckless_driving', 'Reckless Driving'),
        ('unauthorized_route', 'Unauthorized Route'),
        ('vehicle_damage', 'Vehicle Damage'),
        ('late_delivery', 'Late Delivery'),
        ('other', 'Other'),
    ]

    driver = models.ForeignKey(Driver,null=True,blank=True, on_delete=models.CASCADE, related_name='warning_letters')
    issued_date = models.DateField(default=timezone.now)
    reason = models.CharField(max_length=100, choices=WARNING_REASON_CHOICES)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=WARNING_STATUS_CHOICES, default='active')
    document = models.FileField(upload_to='drivers/warning_letters/', null=True, blank=True)
    generated_letter = models.FileField(upload_to='warning_letters_generated/', null=True, blank=True) # <<< ADD THIS LINE
    issued_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='issued_warning_letters')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # ordering = ['-issued_date', 'driver__driver_name']
        verbose_name = "Warning Letter"
        verbose_name_plural = "Warning Letters"

    def __str__(self):
        return f"Warning for {self.driver.driver_name} - {self.reason} on {self.issued_date}"

# ... (Your Termination model and other code) ..


class Termination(models.Model):
    TERMINATION_REASON_CHOICES = [
        ('performance_issues', 'Performance Issues'),
        ('voluntary_resignation', 'Voluntary Resignation'),
        ('policy_violation', 'Policy Violation'),
        ('contract_expiration', 'Contract Expiration'),
        ('redundancy', 'Redundancy'),
        ('other', 'Other'),
    ]

    driver = models.OneToOneField(Driver, on_delete=models.CASCADE, related_name='termination_record')
    termination_date = models.DateField(default=timezone.now)
    reason = models.CharField(max_length=100, choices=TERMINATION_REASON_CHOICES)
    details = models.TextField(blank=True, null=True)
    document = models.FileField(upload_to='drivers/terminations/', null=True, blank=True)
    processed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_terminations')
    generated_letter = models.FileField(upload_to='termination_letters/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # ordering = ['-termination_date', 'driver__driver_name']
        verbose_name = "Termination"
        verbose_name_plural = "Terminations"

    def __str__(self):
        return f"Termination of {self.driver.driver_name} on {self.termination_date} due to {self.reason}"

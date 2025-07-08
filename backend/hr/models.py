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

    # Login (Check-in) details - Photo and Location are MANDATORY (enforced in views)
    login_time = models.TimeField(null=True, blank=True)
    login_photo = models.ImageField(upload_to='login_photos/', null=True, blank=True, help_text="Photo is required for check-in")
    login_latitude = models.CharField(max_length=20, null=True, blank=True, help_text="Location latitude is required for check-in")
    login_longitude = models.CharField(max_length=20, null=True, blank=True, help_text="Location longitude is required for check-in")
    checked_in_location = models.ForeignKey(CheckinLocation, on_delete=models.SET_NULL, null=True, blank=True)

    # Logout (Check-out) details - Photo and Location are MANDATORY (enforced in views)
    logout_time = models.TimeField(null=True, blank=True)
    logout_photo = models.ImageField(upload_to='logout_photos/', null=True, blank=True, help_text="Photo is required for check-out")
    logout_latitude = models.CharField(max_length=20, null=True, blank=True, help_text="Location latitude is required for check-out")
    logout_longitude = models.CharField(max_length=20, null=True, blank=True, help_text="Location longitude is required for check-out")

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


# ==================== SHIFT MANAGEMENT MODELS ====================

class ShiftType(models.Model):
    """Defines different types of shifts (Morning, Evening, Night, etc.)"""
    SHIFT_TYPE_CHOICES = [
        ('morning', 'Morning Shift'),
        ('afternoon', 'Afternoon Shift'),
        ('evening', 'Evening Shift'),
        ('night', 'Night Shift'),
        ('flexible', 'Flexible Shift'),
        ('custom', 'Custom Shift'),
    ]

    name = models.CharField(max_length=100, unique=True)
    shift_type = models.CharField(max_length=20, choices=SHIFT_TYPE_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    break_duration_minutes = models.IntegerField(default=30, help_text="Break duration in minutes")
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True, null=True)

    # Overtime settings
    overtime_threshold_hours = models.DecimalField(max_digits=4, decimal_places=2, default=8.0)
    overtime_rate_multiplier = models.DecimalField(max_digits=3, decimal_places=2, default=1.5)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['start_time', 'name']
        verbose_name = "Shift Type"
        verbose_name_plural = "Shift Types"

    def __str__(self):
        return f"{self.name} ({self.start_time} - {self.end_time})"

    @property
    def duration_hours(self):
        """Calculate shift duration in hours"""
        from datetime import datetime, timedelta

        # Handle overnight shifts
        start = datetime.combine(datetime.today(), self.start_time)
        end = datetime.combine(datetime.today(), self.end_time)

        if end < start:  # Overnight shift
            end += timedelta(days=1)

        duration = end - start
        return duration.total_seconds() / 3600


class DriverShiftAssignment(models.Model):
    """Assigns shifts to drivers for specific date ranges"""
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='shift_assignments')
    shift_type = models.ForeignKey(ShiftType, on_delete=models.CASCADE, related_name='driver_assignments')

    # Date range for the assignment
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True, help_text="Leave blank for ongoing assignment")

    # Days of the week (for recurring assignments)
    WEEKDAY_CHOICES = [
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    ]

    # Store as JSON field for multiple days
    working_days = models.JSONField(default=list, help_text="List of working days: ['monday', 'tuesday', ...]")

    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True, null=True)

    # Assignment metadata
    assigned_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date', 'driver__driver_name']
        verbose_name = "Driver Shift Assignment"
        verbose_name_plural = "Driver Shift Assignments"

    def __str__(self):
        end_date_str = self.end_date.strftime('%Y-%m-%d') if self.end_date else 'Ongoing'
        return f"{self.driver.driver_name} - {self.shift_type.name} ({self.start_date} to {end_date_str})"

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.end_date and self.end_date < self.start_date:
            raise ValidationError("End date cannot be before start date")

    def is_valid_for_date(self, date):
        """Check if this assignment is valid for a given date"""
        if not self.is_active:
            return False

        if date < self.start_date:
            return False

        if self.end_date and date > self.end_date:
            return False

        # Check if the day of the week is in working_days
        weekday_name = date.strftime('%A').lower()
        return weekday_name in self.working_days


# ==================== LEAVE MANAGEMENT MODELS ====================

# Leave models removed as per user request





class LeaveType(models.Model):
    """Define different types of leave (Annual, Sick, Emergency, etc.)"""
    name = models.CharField(max_length=100, unique=True, help_text="Leave type name (e.g., Annual Leave)")
    description = models.TextField(blank=True, null=True, help_text="Description of the leave type")
    max_days_per_year = models.IntegerField(default=30, help_text="Maximum days allowed per year")
    max_consecutive_days = models.IntegerField(default=30, help_text="Maximum consecutive days allowed")
    requires_approval = models.BooleanField(default=True, help_text="Whether this leave type requires approval")
    requires_document = models.BooleanField(default=False, help_text="Whether supporting document is required")
    advance_notice_days = models.IntegerField(default=7, help_text="Minimum advance notice required in days")
    is_active = models.BooleanField(default=True, help_text="Whether this leave type is currently active")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = "Leave Type"
        verbose_name_plural = "Leave Types"

    def __str__(self):
        return self.name


class LeaveRequest(models.Model):
    """Leave requests submitted by drivers"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ]

    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE, related_name='requests')

    # Leave details
    start_date = models.DateField(help_text="Leave start date")
    end_date = models.DateField(help_text="Leave end date")
    total_days = models.IntegerField(help_text="Total number of leave days")
    reason = models.TextField(help_text="Reason for leave")
    emergency_contact = models.CharField(max_length=20, blank=True, null=True, help_text="Emergency contact number")
    supporting_document = models.FileField(upload_to='leave_documents/', blank=True, null=True, help_text="Supporting document if required")

    # Status and review
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    applied_date = models.DateTimeField(auto_now_add=True, help_text="When the request was submitted")
    reviewed_by = models.ForeignKey('usermanagement.CustomUser', on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_leave_requests')
    reviewed_date = models.DateTimeField(null=True, blank=True, help_text="When the request was reviewed")
    admin_comments = models.TextField(blank=True, null=True, help_text="Admin comments on the request")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-applied_date']
        verbose_name = "Leave Request"
        verbose_name_plural = "Leave Requests"

    def __str__(self):
        return f"{self.driver.driver_name} - {self.leave_type.name} ({self.start_date} to {self.end_date})"

    def save(self, *args, **kwargs):
        # Calculate total days if not set
        if not self.total_days and self.start_date and self.end_date:
            self.total_days = (self.end_date - self.start_date).days + 1
        super().save(*args, **kwargs)

    @property
    def duration_text(self):
        """Human readable duration"""
        if self.total_days == 1:
            return "1 day"
        return f"{self.total_days} days"


class LeaveBalance(models.Model):
    """Track leave balances for each driver and leave type"""
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='leave_balances')
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE, related_name='balances')
    year = models.IntegerField(default=timezone.now().year)

    # Balance tracking
    allocated_days = models.IntegerField(default=0, help_text="Days allocated for this year")
    used_days = models.IntegerField(default=0, help_text="Days already used")
    pending_days = models.IntegerField(default=0, help_text="Days in pending requests")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('driver', 'leave_type', 'year')
        ordering = ['-year', 'driver__driver_name', 'leave_type__name']
        verbose_name = "Leave Balance"
        verbose_name_plural = "Leave Balances"

    def __str__(self):
        return f"{self.driver.driver_name} - {self.leave_type.name} ({self.year})"

    @property
    def remaining_days(self):
        """Calculate remaining leave days"""
        return self.allocated_days - self.used_days - self.pending_days

    @property
    def available_days(self):
        """Calculate available days (excluding pending)"""
        return self.allocated_days - self.used_days

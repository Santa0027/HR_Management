from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from company.models import Company
from drivers.models import Driver
from vehicle.models import VehicleRegistration

class CheckinLocation(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='checkin_locations')
    name = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    radius_meters = models.PositiveIntegerField(default=50)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Check-in Location"
        verbose_name_plural = "Check-in Locations"
        unique_together = ('company', 'name')
        ordering = ['company', 'name']

    def __str__(self):
        return f"{self.name} ({self.company.company_name})"


class ApartmentLocation(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='apartment_locations')
    name = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    alarm_radius_meters = models.PositiveIntegerField(default=200)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Apartment/Alarm Location"
        verbose_name_plural = "Apartment/Alarm Locations"
        unique_together = ('company', 'name')
        ordering = ['company', 'name']

    def __str__(self):
        return f"{self.name} ({self.company.name})"


class Attendance(models.Model):
    ATTENDANCE_STATUS_CHOICES = [
        ('on_time', 'On-time'),
        ('late', 'Late'),
        ('absent', 'Absent'),
    ]

    DEDUCTION_REASON_CHOICES = [
        ('traffic', 'Traffic'),
        ('personal', 'Personal'),
        ('logistics_issue', 'Logistics Issue'),
        ('other', 'Other'),
    ]

    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField(default=timezone.now)
    assigned_time = models.TimeField(blank=True, null=True)
    login_time = models.TimeField(blank=True, null=True)
    login_photo = models.ImageField(upload_to='attendance_photos/login/', null=True, blank=True)
    login_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    login_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    checked_in_location = models.ForeignKey(CheckinLocation, on_delete=models.SET_NULL, null=True, blank=True, related_name='login_checkins')
    logout_time = models.TimeField(blank=True, null=True)
    logout_photo = models.ImageField(upload_to='attendance_photos/logout/', null=True, blank=True)
    logout_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    logout_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    status = models.CharField(max_length=20, choices=ATTENDANCE_STATUS_CHOICES, default='absent')
    reason_for_deduction = models.CharField(max_length=50, choices=DEDUCTION_REASON_CHOICES, blank=True, null=True)
    deduct_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    platform = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('driver', 'date')
        ordering = ['-date', 'driver__driver_name']

    def __str__(self):
        return f"Attendance for {self.driver.driver_name} on {self.date}"

    @property
    def active_time_hours(self):
        if self.login_time and self.logout_time:
            login_dt = timezone.datetime.combine(self.date, self.login_time)
            logout_dt = timezone.datetime.combine(self.date, self.logout_time)
            if logout_dt < login_dt:
                logout_dt += timezone.timedelta(days=1)
            duration = logout_dt - login_dt
            return round(duration.total_seconds() / 3600, 2)
        return None

    def save(self, *args, **kwargs):
        if self.login_time and self.assigned_time:
            login_dt = timezone.datetime.combine(self.date, self.login_time)
            assigned_dt = timezone.datetime.combine(self.date, self.assigned_time)
            if login_dt <= assigned_dt + timezone.timedelta(minutes=5):
                self.status = 'on_time'
            else:
                self.status = 'late'
        elif self.login_time:
            self.status = 'on_time'
        else:
            self.status = 'absent'
        super().save(*args, **kwargs)


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

    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='warning_letters')
    issued_date = models.DateField(default=timezone.now)
    reason = models.CharField(max_length=100, choices=WARNING_REASON_CHOICES)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=WARNING_STATUS_CHOICES, default='active')
    document = models.FileField(upload_to='drivers/warning_letters/', null=True, blank=True)
    issued_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='issued_warning_letters')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-issued_date', 'driver__driver_name']
        verbose_name = "Warning Letter"
        verbose_name_plural = "Warning Letters"

    def __str__(self):
        return f"Warning for {self.driver.driver_name} - {self.reason} on {self.issued_date}"


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
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_terminations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-termination_date', 'driver__driver_name']
        verbose_name = "Termination"
        verbose_name_plural = "Terminations"

    def __str__(self):
        return f"Termination of {self.driver.driver_name} on {self.termination_date} due to {self.reason}"

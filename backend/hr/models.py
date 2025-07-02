from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
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


# Enhanced HR Models

class Employee(models.Model):
    """Enhanced employee model for comprehensive HR management"""
    EMPLOYMENT_TYPE_CHOICES = [
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
        ('intern', 'Intern'),
        ('temporary', 'Temporary'),
    ]

    EMPLOYMENT_STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('terminated', 'Terminated'),
        ('on_leave', 'On Leave'),
        ('suspended', 'Suspended'),
    ]

    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
        ('prefer_not_to_say', 'Prefer not to say'),
    ]

    # Basic Information
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='employee_profile')
    employee_id = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, null=True, blank=True)

    # Address Information
    address_line1 = models.CharField(max_length=255, null=True, blank=True)
    address_line2 = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    postal_code = models.CharField(max_length=20, null=True, blank=True)
    country = models.CharField(max_length=100, default='India')

    # Employment Information
    department = models.CharField(max_length=100, null=True, blank=True)
    position = models.CharField(max_length=100)
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPE_CHOICES, default='full_time')
    employment_status = models.CharField(max_length=20, choices=EMPLOYMENT_STATUS_CHOICES, default='active')
    hire_date = models.DateField()
    termination_date = models.DateField(null=True, blank=True)

    # Reporting Structure
    manager = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subordinates')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='employees')

    # Salary Information
    base_salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)

    # Documents
    profile_picture = models.ImageField(upload_to='employee_profiles/', null=True, blank=True)
    resume = models.FileField(upload_to='employee_documents/resumes/', null=True, blank=True)

    # Emergency Contact
    emergency_contact_name = models.CharField(max_length=100, null=True, blank=True)
    emergency_contact_phone = models.CharField(max_length=15, null=True, blank=True)
    emergency_contact_relationship = models.CharField(max_length=50, null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['first_name', 'last_name']
        verbose_name = "Employee"
        verbose_name_plural = "Employees"

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.employee_id})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def years_of_service(self):
        if self.termination_date:
            end_date = self.termination_date
        else:
            end_date = timezone.now().date()
        return (end_date - self.hire_date).days // 365


class LeaveType(models.Model):
    """Leave types configuration"""
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(null=True, blank=True)
    max_days_per_year = models.IntegerField(default=0)
    is_paid = models.BooleanField(default=True)
    requires_approval = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = "Leave Type"
        verbose_name_plural = "Leave Types"

    def __str__(self):
        return self.name


class LeaveBalance(models.Model):
    """Employee leave balance tracking"""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leave_balances')
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE)
    year = models.IntegerField(default=timezone.now().year)
    allocated_days = models.DecimalField(max_digits=5, decimal_places=1, default=0)
    used_days = models.DecimalField(max_digits=5, decimal_places=1, default=0)
    pending_days = models.DecimalField(max_digits=5, decimal_places=1, default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('employee', 'leave_type', 'year')
        ordering = ['employee', 'leave_type']
        verbose_name = "Leave Balance"
        verbose_name_plural = "Leave Balances"

    def __str__(self):
        return f"{self.employee.full_name} - {self.leave_type.name} ({self.year})"

    @property
    def remaining_days(self):
        return self.allocated_days - self.used_days - self.pending_days


class LeaveRequest(models.Model):
    """Leave request management"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    days_requested = models.DecimalField(max_digits=5, decimal_places=1)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # Approval workflow
    approved_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_leaves')
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(null=True, blank=True)

    # Supporting documents
    supporting_document = models.FileField(upload_to='leave_documents/', null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Leave Request"
        verbose_name_plural = "Leave Requests"

    def __str__(self):
        return f"{self.employee.full_name} - {self.leave_type.name} ({self.start_date} to {self.end_date})"

    def save(self, *args, **kwargs):
        # Calculate days requested
        if self.start_date and self.end_date:
            self.days_requested = (self.end_date - self.start_date).days + 1
        super().save(*args, **kwargs)


class PerformanceReview(models.Model):
    """Performance review management"""
    REVIEW_TYPE_CHOICES = [
        ('annual', 'Annual Review'),
        ('quarterly', 'Quarterly Review'),
        ('probation', 'Probation Review'),
        ('project', 'Project Review'),
        ('360', '360 Degree Review'),
    ]

    RATING_CHOICES = [
        (1, 'Poor'),
        (2, 'Below Average'),
        (3, 'Average'),
        (4, 'Good'),
        (5, 'Excellent'),
    ]

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('approved', 'Approved'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='performance_reviews')
    reviewer = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='conducted_reviews')
    review_type = models.CharField(max_length=20, choices=REVIEW_TYPE_CHOICES)
    review_period_start = models.DateField()
    review_period_end = models.DateField()

    # Ratings
    overall_rating = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)
    technical_skills = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)
    communication = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)
    teamwork = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)
    leadership = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)
    punctuality = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)

    # Comments
    strengths = models.TextField(null=True, blank=True)
    areas_for_improvement = models.TextField(null=True, blank=True)
    goals_for_next_period = models.TextField(null=True, blank=True)
    reviewer_comments = models.TextField(null=True, blank=True)
    employee_comments = models.TextField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')

    # Approval
    approved_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_reviews')
    approved_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-review_period_end']
        verbose_name = "Performance Review"
        verbose_name_plural = "Performance Reviews"

    def __str__(self):
        return f"{self.employee.full_name} - {self.review_type} ({self.review_period_start} to {self.review_period_end})"

    @property
    def average_rating(self):
        ratings = [
            self.technical_skills, self.communication, self.teamwork,
            self.leadership, self.punctuality
        ]
        valid_ratings = [r for r in ratings if r is not None]
        return sum(valid_ratings) / len(valid_ratings) if valid_ratings else 0


class Goal(models.Model):
    """Employee goal tracking"""
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('on_hold', 'On Hold'),
        ('cancelled', 'Cancelled'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='goals')
    title = models.CharField(max_length=200)
    description = models.TextField()
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')

    start_date = models.DateField()
    target_date = models.DateField()
    completion_date = models.DateField(null=True, blank=True)

    progress_percentage = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])

    # Tracking
    created_by = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='created_goals')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Goal"
        verbose_name_plural = "Goals"

    def __str__(self):
        return f"{self.employee.full_name} - {self.title}"

    @property
    def is_overdue(self):
        return self.target_date < timezone.now().date() and self.status != 'completed'


class EmployeeDocument(models.Model):
    """Employee document management"""
    DOCUMENT_TYPE_CHOICES = [
        ('contract', 'Employment Contract'),
        ('id_proof', 'ID Proof'),
        ('address_proof', 'Address Proof'),
        ('education', 'Education Certificate'),
        ('experience', 'Experience Letter'),
        ('medical', 'Medical Certificate'),
        ('bank_details', 'Bank Details'),
        ('tax_documents', 'Tax Documents'),
        ('other', 'Other'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    document_file = models.FileField(upload_to='employee_documents/')

    # Metadata
    uploaded_by = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='uploaded_documents')
    is_confidential = models.BooleanField(default=False)
    expiry_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Employee Document"
        verbose_name_plural = "Employee Documents"

    def __str__(self):
        return f"{self.employee.full_name} - {self.title}"

    @property
    def is_expired(self):
        return self.expiry_date and self.expiry_date < timezone.now().date()


class Payroll(models.Model):
    """Employee payroll management"""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='payrolls')
    pay_period_start = models.DateField()
    pay_period_end = models.DateField()

    # Earnings
    base_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    overtime_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    overtime_rate = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    overtime_pay = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    bonus = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    allowances = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Deductions
    tax_deduction = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    provident_fund = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    insurance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    other_deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Calculated fields
    gross_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Payment details
    payment_date = models.DateField(null=True, blank=True)
    payment_method = models.CharField(max_length=50, default='bank_transfer')
    payment_reference = models.CharField(max_length=100, null=True, blank=True)

    # Status
    is_processed = models.BooleanField(default=False)
    processed_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_payrolls')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-pay_period_end']
        unique_together = ('employee', 'pay_period_start', 'pay_period_end')
        verbose_name = "Payroll"
        verbose_name_plural = "Payrolls"

    def __str__(self):
        return f"{self.employee.full_name} - {self.pay_period_start} to {self.pay_period_end}"

    def save(self, *args, **kwargs):
        # Calculate derived fields
        self.overtime_pay = self.overtime_hours * self.overtime_rate
        self.gross_salary = self.base_salary + self.overtime_pay + self.bonus + self.allowances
        self.total_deductions = self.tax_deduction + self.provident_fund + self.insurance + self.other_deductions
        self.net_salary = self.gross_salary - self.total_deductions
        super().save(*args, **kwargs)


class Training(models.Model):
    """Training program management"""
    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    trainer_name = models.CharField(max_length=100)
    training_type = models.CharField(max_length=50)  # online, offline, workshop, etc.

    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    location = models.CharField(max_length=200, null=True, blank=True)
    max_participants = models.IntegerField(default=0)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')

    # Cost
    cost_per_participant = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    created_by = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='created_trainings')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date']
        verbose_name = "Training"
        verbose_name_plural = "Trainings"

    def __str__(self):
        return f"{self.title} - {self.start_date.date()}"

    @property
    def enrolled_count(self):
        return self.enrollments.filter(status='enrolled').count()

    @property
    def available_slots(self):
        return max(0, self.max_participants - self.enrolled_count)


class TrainingEnrollment(models.Model):
    """Training enrollment tracking"""
    STATUS_CHOICES = [
        ('enrolled', 'Enrolled'),
        ('completed', 'Completed'),
        ('dropped', 'Dropped'),
        ('no_show', 'No Show'),
    ]

    training = models.ForeignKey(Training, on_delete=models.CASCADE, related_name='enrollments')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='training_enrollments')

    enrollment_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='enrolled')

    # Completion tracking
    completion_date = models.DateTimeField(null=True, blank=True)
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)
    certificate_issued = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('training', 'employee')
        ordering = ['-enrollment_date']
        verbose_name = "Training Enrollment"
        verbose_name_plural = "Training Enrollments"

    def __str__(self):
        return f"{self.employee.full_name} - {self.training.title}"


class HRPolicy(models.Model):
    """HR policy management"""
    title = models.CharField(max_length=200)
    description = models.TextField()
    policy_document = models.FileField(upload_to='hr_policies/', null=True, blank=True)

    effective_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)

    is_active = models.BooleanField(default=True)
    requires_acknowledgment = models.BooleanField(default=False)

    created_by = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='created_policies')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "HR Policy"
        verbose_name_plural = "HR Policies"

    def __str__(self):
        return self.title


class PolicyAcknowledgment(models.Model):
    """Policy acknowledgment tracking"""
    policy = models.ForeignKey(HRPolicy, on_delete=models.CASCADE, related_name='acknowledgments')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='policy_acknowledgments')

    acknowledged_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        unique_together = ('policy', 'employee')
        ordering = ['-acknowledged_at']
        verbose_name = "Policy Acknowledgment"
        verbose_name_plural = "Policy Acknowledgments"

    def __str__(self):
        return f"{self.employee.full_name} - {self.policy.title}"

from django.db import models
from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone

from company.models import Company
from vehicle.models import VehicleRegistration

class Driver(models.Model):
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]

       # Choices for who pays for the bill/expense
    PAID_BY_CHOICES = [
        ('own', 'Own'),
        ('company', 'Company'),
    ]

    status = models.CharField(
        max_length=20,
        choices=(
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
        ),
        default='pending'
    )
    remarks = models.TextField(blank=True, help_text="Admin or HR remarks for approval, rejection, or additional notes")

    driver_name = models.CharField(max_length=255)
    driver_profile_img= models.FileField(upload_to='drivers/profileimg/', null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    iqama = models.CharField(max_length=100, unique=True)
    mobile = models.CharField(max_length=20, blank=True, null=True)
    city = models.CharField(max_length=100)
    nationality = models.CharField(max_length=100, blank=True, null=True)
    dob = models.DateField(blank=True, null=True)

    # ForeignKey relationships
    vehicle = models.ForeignKey(VehicleRegistration, on_delete=models.SET_NULL, null=True, blank=True)
    company = models.ForeignKey(
    Company,
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name='drivers'  # 👈 Add this!
)

    # Document fields
    iqama_document = models.FileField(upload_to='drivers/iqama/', null=True, blank=True)
    iqama_expiry = models.DateField(null=True, blank=True)

    passport_document = models.FileField(upload_to='drivers/passport/', null=True, blank=True)
    passport_expiry = models.DateField(null=True, blank=True)

    license_document = models.FileField(upload_to='drivers/license/', null=True, blank=True)
    license_expiry = models.DateField(null=True, blank=True)

    visa_document = models.FileField(upload_to='drivers/visa/', null=True, blank=True)
    visa_expiry = models.DateField(null=True, blank=True)

    medical_document = models.FileField(upload_to='drivers/medical/', null=True, blank=True)
    medical_expiry = models.DateField(null=True, blank=True)    


      # New fields for expenses/bills
    # Insurance
    insurance_paid_by = models.CharField(
        max_length=10,
        choices=PAID_BY_CHOICES,
        blank=True,
        null=True,
        help_text="Who pays for the driver's insurance?"
    )
    # insurance_document = models.FileField(upload_to='drivers/insurance/', null=True, blank=True)
    # insurance_expiry = models.DateField(null=True, blank=True)


    # Accommodation Rent
    accommodation_paid_by = models.CharField(
        max_length=10,
        choices=PAID_BY_CHOICES,
        blank=True,
        null=True,
        help_text="Who pays for the driver's accommodation rent?"
    )
    # accommodation_document = models.FileField(upload_to='drivers/accommodation/', null=True, blank=True)
    # accommodation_expiry = models.DateField(null=True, blank=True)


    # Phone Bill
    phone_bill_paid_by = models.CharField(
        max_length=10,
        choices=PAID_BY_CHOICES,
        blank=True,
        null=True,
        help_text="Who pays for the driver's phone bill?"
    )
    # phone_bill_document = models.FileField(upload_to='drivers/phone_bill/', null=True, blank=True)
    # phone_bill_expiry = models.DateField(null=True, blank=True)


    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.driver_name





class DriverLog(models.Model):
    driver = models.ForeignKey(Driver,null=True,blank=True, on_delete=models.CASCADE)
    action = models.CharField(max_length=100)  # e.g., "Uploaded Document", "Updated Expiry"
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True)

    def __str__(self):
        return f"{self.driver.driver_name} - {self.action} at {self.timestamp}"


# ==================== DRIVER MOBILE AUTHENTICATION ====================

class DriverAuth(models.Model):
    """
    Separate authentication model for driver mobile app login.
    This is independent from the admin dashboard CustomUser authentication.
    """
    driver = models.OneToOneField(Driver, on_delete=models.CASCADE, related_name='auth_credentials')

    # Authentication credentials
    username = models.CharField(max_length=50, unique=True, help_text="Unique username for driver mobile login")
    password_hash = models.CharField(max_length=255, help_text="Hashed password")

    # Account status
    is_active = models.BooleanField(default=True, help_text="Can the driver login to mobile app?")
    is_locked = models.BooleanField(default=False, help_text="Account locked due to failed attempts")

    # Security features
    failed_login_attempts = models.IntegerField(default=0)
    last_login = models.DateTimeField(null=True, blank=True)
    last_failed_login = models.DateTimeField(null=True, blank=True)
    password_changed_at = models.DateTimeField(auto_now_add=True)

    # Device management (optional for future use)
    last_login_device = models.CharField(max_length=255, blank=True, null=True)
    last_login_ip = models.GenericIPAddressField(blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Driver Authentication"
        verbose_name_plural = "Driver Authentications"
        ordering = ['driver__driver_name']

    def __str__(self):
        return f"{self.driver.driver_name} - {self.username}"

    def set_password(self, raw_password):
        """Set password with proper hashing"""
        self.password_hash = make_password(raw_password)
        self.password_changed_at = timezone.now()
        self.failed_login_attempts = 0  # Reset failed attempts when password is changed
        self.is_locked = False

    def check_password(self, raw_password):
        """Check if provided password matches the stored hash"""
        return check_password(raw_password, self.password_hash)

    def lock_account(self):
        """Lock the account due to too many failed attempts"""
        self.is_locked = True
        self.save()

    def unlock_account(self):
        """Unlock the account and reset failed attempts"""
        self.is_locked = False
        self.failed_login_attempts = 0
        self.save()

    def record_failed_login(self):
        """Record a failed login attempt"""
        self.failed_login_attempts += 1
        self.last_failed_login = timezone.now()

        # Lock account after 5 failed attempts
        if self.failed_login_attempts >= 5:
            self.lock_account()
        else:
            self.save()

    def record_successful_login(self, device_info=None, ip_address=None):
        """Record a successful login"""
        self.last_login = timezone.now()
        self.failed_login_attempts = 0  # Reset failed attempts on successful login
        self.is_locked = False

        if device_info:
            self.last_login_device = device_info
        if ip_address:
            self.last_login_ip = ip_address

        self.save()

    @property
    def can_login(self):
        """Check if driver can login (active and not locked)"""
        return self.is_active and not self.is_locked and self.driver.status == 'approved'

    @property
    def remaining_attempts(self):
        """Get remaining login attempts before account lock"""
        return max(0, 5 - self.failed_login_attempts)

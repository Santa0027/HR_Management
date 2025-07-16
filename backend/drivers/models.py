from django.db import models
from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from decimal import Decimal

from company.models import Company
from vehicle.models import VehicleRegistration

class Driver(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('suspended', 'Suspended'),
        ('active', 'Active'),
    ]

    # Basic Information (for compatibility with existing code)
    driver_name = models.CharField(max_length=255, default='', help_text="Driver's full name")
    iqama = models.CharField(max_length=50, default='', help_text="Iqama/ID number")
    mobile = models.CharField(max_length=20, default='', help_text="Mobile phone number")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # Personal Details
    full_name = models.CharField(max_length=255, default='')
    gender = models.CharField(max_length=10, default='')
    dob = models.DateField(null=True, blank=True)
    age = models.CharField(max_length=10, blank=True, default='')
    phone_number = models.CharField(max_length=20, default='')
    home_phone = models.CharField(max_length=20, blank=True, default='')
    nationality = models.CharField(max_length=100, default='')
    city = models.CharField(max_length=100, blank=True, default='')
    apartment_area = models.CharField(max_length=100, blank=True, default='')
    home_country_address = models.TextField(blank=True, default='')
    company = models.CharField(max_length=100, blank=True, default='')
    vehicle_type = models.CharField(max_length=100, default='')
    vehicle_destination = models.CharField(max_length=100, blank=True, default='')
    kuwait_entry_date = models.DateField(blank=True, null=True)
    marital_status = models.CharField(max_length=50, blank=True, default='')
    blood_group = models.CharField(max_length=10, blank=True, default='')
    t_shirt_size = models.CharField(max_length=10, blank=True, default='')
    weight = models.CharField(max_length=10, blank=True, default='')
    height = models.CharField(max_length=10, blank=True, default='')
    nominee = models.CharField(max_length=100, blank=True, default='')

    # Documents
    passport = models.FileField(upload_to='documents/', blank=True, null=True)
    visa = models.FileField(upload_to='documents/', blank=True, null=True)
    police_cer = models.FileField(upload_to='documents/', blank=True, null=True)
    medical_cer = models.FileField(upload_to='documents/', blank=True, null=True)
    passport_photo = models.FileField(upload_to='documents/', blank=True, null=True)

    # Working Details
    emp_id = models.CharField(max_length=100, blank=True)
    vehicle_model = models.CharField(max_length=100, blank=True)
    civil_id_number = models.CharField(max_length=100, blank=True)
    civil_id_expiry = models.DateField(blank=True, null=True)
    licence_number = models.CharField(max_length=100, blank=True)
    licence_expiry = models.DateField(blank=True, null=True)
    vehicle_number = models.CharField(max_length=100, blank=True)
    vehicle_expiry = models.DateField(blank=True, null=True)
    health_card_expiry = models.DateField(blank=True, null=True)
    working_dept = models.CharField(max_length=100, blank=True)

    cap = models.CharField(max_length=50, blank=True)
    bag = models.CharField(max_length=50, blank=True)
    waist = models.CharField(max_length=50, blank=True)
    safeties = models.CharField(max_length=50, blank=True)
    helmet = models.CharField(max_length=50, blank=True)
    cool_jackets = models.CharField(max_length=50, blank=True)
    water_bottle = models.CharField(max_length=50, blank=True)

    civil_id_doc = models.FileField(upload_to='documents/', blank=True, null=True)
    licence_doc = models.FileField(upload_to='documents/', blank=True, null=True)
    vehicle_doc = models.FileField(upload_to='documents/', blank=True, null=True)
    driver_photo = models.FileField(upload_to='documents/', blank=True, null=True)
    health_card_doc = models.FileField(upload_to='documents/', blank=True, null=True)
    vehicle_photos = models.FileField(upload_to='documents/', blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.driver_name or self.full_name




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


# ==================== NEW ENHANCED DRIVER MODELS ====================

class NewDriverApplication(models.Model):
    """New driver application form with comprehensive details"""

    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]

    MARITAL_STATUS_CHOICES = [
        ('single', 'Single'),
        ('married', 'Married'),
        ('divorced', 'Divorced'),
        ('widowed', 'Widowed'),
    ]

    BLOOD_GROUP_CHOICES = [
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
    ]

    T_SHIRT_SIZE_CHOICES = [
        ('xs', 'XS'), ('s', 'S'), ('m', 'M'),
        ('l', 'L'), ('xl', 'XL'), ('xxl', 'XXL'), ('xxxl', 'XXXL'),
    ]

    NOMINEE_RELATIONSHIP_CHOICES = [
        ('wife', 'Wife'),
        ('husband', 'Husband'),
        ('father', 'Father'),
        ('mother', 'Mother'),
        ('brother', 'Brother'),
        ('sister', 'Sister'),
        ('son', 'Son'),
        ('daughter', 'Daughter'),
        ('other', 'Other'),
    ]

    VEHICLE_TYPE_CHOICES = [
        ('bike', 'Bike/Motorcycle'),
        ('car', 'Car'),
        ('van', 'Van'),
        ('truck', 'Truck'),
        ('bus', 'Bus'),
    ]

    APPLICATION_STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('on_hold', 'On Hold'),
    ]

    # Application Info
    application_number = models.CharField(max_length=20, unique=True, editable=False)
    application_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=APPLICATION_STATUS_CHOICES, default='pending')

    # Personal Details
    full_name = models.CharField(max_length=255)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    date_of_birth = models.DateField()
    age = models.IntegerField(editable=False)  # Auto-calculated
    nationality = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    apartment_area = models.CharField(max_length=200)
    phone_number = models.CharField(max_length=20)
    home_country_address = models.TextField()
    home_country_phone = models.CharField(max_length=20, blank=True)

    # Physical Details
    marital_status = models.CharField(max_length=20, choices=MARITAL_STATUS_CHOICES)
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUP_CHOICES)
    t_shirt_size = models.CharField(max_length=5, choices=T_SHIRT_SIZE_CHOICES)
    weight = models.DecimalField(max_digits=5, decimal_places=2, help_text="Weight in KG")
    height = models.DecimalField(max_digits=5, decimal_places=2, help_text="Height in CM")

    # Work Details
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='new_driver_applications')
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_TYPE_CHOICES)
    vehicle_destination = models.CharField(max_length=200, blank=True)
    kuwait_entry_date = models.DateField()

    # Nominee Details
    nominee_name = models.CharField(max_length=255)
    nominee_relationship = models.CharField(max_length=20, choices=NOMINEE_RELATIONSHIP_CHOICES)
    nominee_phone = models.CharField(max_length=20)
    nominee_address = models.TextField()

    # Documents
    passport_document = models.FileField(upload_to='new_drivers/documents/', help_text="Passport copy")
    visa_document = models.FileField(upload_to='new_drivers/documents/', help_text="Visa copy")
    police_certificate = models.FileField(upload_to='new_drivers/documents/', help_text="Police clearance certificate")
    medical_certificate = models.FileField(upload_to='new_drivers/documents/', help_text="Medical certificate")
    passport_photo = models.ImageField(upload_to='new_drivers/photos/', help_text="Passport size photo")

    # Review Notes
    review_notes = models.TextField(blank=True)
    reviewed_by = models.CharField(max_length=100, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "New Driver Application"
        verbose_name_plural = "New Driver Applications"
        ordering = ['-application_date']

    def save(self, *args, **kwargs):
        # Auto-generate application number
        if not self.application_number:
            from datetime import datetime
            self.application_number = f"NDA{datetime.now().strftime('%Y%m%d')}{self.pk or '001'}"

        # Auto-calculate age
        if self.date_of_birth:
            from datetime import date
            today = date.today()
            self.age = today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.application_number} - {self.full_name}"


class WorkingDriver(models.Model):
    """Working driver with employment details and documents"""

    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]

    VEHICLE_TYPE_CHOICES = [
        ('bike', 'Bike/Motorcycle'),
        ('car', 'Car'),
        ('van', 'Van'),
        ('truck', 'Truck'),
        ('bus', 'Bus'),
    ]

    DEPARTMENT_CHOICES = [
        ('delivery', 'Delivery'),
        ('transport', 'Transport'),
        ('logistics', 'Logistics'),
        ('maintenance', 'Maintenance'),
        ('emergency', 'Emergency Services'),
    ]

    EMPLOYMENT_STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
        ('terminated', 'Terminated'),
        ('on_leave', 'On Leave'),
    ]

    # Basic Information
    employee_id = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=255)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    date_of_birth = models.DateField()
    nationality = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20)

    # Vehicle Information
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_TYPE_CHOICES)
    vehicle_model = models.CharField(max_length=100)
    vehicle_number = models.CharField(max_length=50)
    vehicle_expiry_date = models.DateField()

    # Legal Documents Numbers & Expiry
    civil_id_number = models.CharField(max_length=50, unique=True)
    civil_id_expiry = models.DateField()
    license_number = models.CharField(max_length=50)
    license_expiry_date = models.DateField()
    health_card_number = models.CharField(max_length=50, blank=True)
    health_card_expiry = models.DateField(null=True, blank=True)

    # Document Files
    civil_id_front = models.ImageField(upload_to='working_drivers/civil_id/', help_text="Civil ID Front")
    civil_id_back = models.ImageField(upload_to='working_drivers/civil_id/', help_text="Civil ID Back")
    license_front = models.ImageField(upload_to='working_drivers/license/', help_text="License Front")
    license_back = models.ImageField(upload_to='working_drivers/license/', help_text="License Back")
    vehicle_registration = models.FileField(upload_to='working_drivers/vehicle_docs/', help_text="Vehicle Registration")
    vehicle_insurance = models.FileField(upload_to='working_drivers/vehicle_docs/', help_text="Vehicle Insurance")
    driver_photo = models.ImageField(upload_to='working_drivers/photos/', help_text="Driver Photo")
    health_card_document = models.FileField(upload_to='working_drivers/health/', blank=True, help_text="Health Card")

    # Vehicle Photos (4 sides)
    vehicle_photo_front = models.ImageField(upload_to='working_drivers/vehicle_photos/', help_text="Vehicle Front")
    vehicle_photo_back = models.ImageField(upload_to='working_drivers/vehicle_photos/', help_text="Vehicle Back")
    vehicle_photo_left = models.ImageField(upload_to='working_drivers/vehicle_photos/', help_text="Vehicle Left Side")
    vehicle_photo_right = models.ImageField(upload_to='working_drivers/vehicle_photos/', help_text="Vehicle Right Side")

    # Employment Details
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='working_drivers')
    working_department = models.CharField(max_length=20, choices=DEPARTMENT_CHOICES)
    employment_status = models.CharField(max_length=20, choices=EMPLOYMENT_STATUS_CHOICES, default='active')
    joining_date = models.DateField()

    # Employee Accessories/Uniform
    t_shirt_issued = models.BooleanField(default=False)
    cap_issued = models.BooleanField(default=False)
    bag_issued = models.BooleanField(default=False)
    vest_issued = models.BooleanField(default=False)
    safety_equipment_issued = models.BooleanField(default=False)
    helmet_issued = models.BooleanField(default=False)
    cool_jacket_issued = models.BooleanField(default=False)
    water_bottle_issued = models.BooleanField(default=False)

    # Accessory Details
    t_shirt_size = models.CharField(max_length=5, choices=[
        ('xs', 'XS'), ('s', 'S'), ('m', 'M'),
        ('l', 'L'), ('xl', 'XL'), ('xxl', 'XXL'), ('xxxl', 'XXXL'),
    ], blank=True)

    # Performance & Status
    total_trips = models.IntegerField(default=0)
    total_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=Decimal('5.00'))

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.CharField(max_length=100)  # Admin who created the record

    class Meta:
        verbose_name = "Working Driver"
        verbose_name_plural = "Working Drivers"
        ordering = ['employee_id']

    def __str__(self):
        return f"{self.employee_id} - {self.full_name}"

    @property
    def age(self):
        """Calculate age from date of birth"""
        from datetime import date
        today = date.today()
        return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))

    @property
    def documents_expiring_soon(self):
        """Check for documents expiring within 30 days"""
        from datetime import date, timedelta
        thirty_days = date.today() + timedelta(days=30)

        expiring = []
        if self.civil_id_expiry <= thirty_days:
            expiring.append('Civil ID')
        if self.license_expiry_date <= thirty_days:
            expiring.append('License')
        if self.vehicle_expiry_date <= thirty_days:
            expiring.append('Vehicle Registration')
        if self.health_card_expiry and self.health_card_expiry <= thirty_days:
            expiring.append('Health Card')

        return expiring

    @property
    def all_accessories_issued(self):
        """Check if all mandatory accessories are issued"""
        mandatory_accessories = [
            self.t_shirt_issued,
            self.cap_issued,
            self.bag_issued,
            self.vest_issued,
            self.safety_equipment_issued,
            self.helmet_issued,
        ]
        return all(mandatory_accessories)


class WorkingDriver(models.Model):
    """Working driver with employment details and document management"""

    EMPLOYMENT_STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
        ('terminated', 'Terminated'),
    ]

    DEPARTMENT_CHOICES = [
        ('delivery', 'Delivery'),
        ('transport', 'Transport'),
        ('logistics', 'Logistics'),
        ('maintenance', 'Maintenance'),
        ('emergency', 'Emergency Services'),
    ]

    # Basic Information
    employee_id = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=255)
    gender = models.CharField(max_length=10, choices=NewDriverApplication.GENDER_CHOICES)
    date_of_birth = models.DateField()
    nationality = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20)

    # Vehicle Information
    vehicle_type = models.CharField(max_length=20, choices=NewDriverApplication.VEHICLE_TYPE_CHOICES)
    vehicle_model = models.CharField(max_length=100)
    vehicle_number = models.CharField(max_length=50, blank=True)
    vehicle_expiry_date = models.DateField(null=True, blank=True)

    # Employment Details
    employment_status = models.CharField(max_length=20, choices=EMPLOYMENT_STATUS_CHOICES, default='active')
    working_department = models.CharField(max_length=20, choices=DEPARTMENT_CHOICES)
    joining_date = models.DateField(auto_now_add=True)

    # Legal Documents
    civil_id_number = models.CharField(max_length=50)
    civil_id_expiry = models.DateField()
    license_number = models.CharField(max_length=50)
    license_expiry_date = models.DateField()
    health_card_number = models.CharField(max_length=50, blank=True)
    health_card_expiry = models.DateField(null=True, blank=True)

    # Document Photos
    civil_id_front = models.ImageField(upload_to='working_drivers/civil_id/', null=True, blank=True)
    civil_id_back = models.ImageField(upload_to='working_drivers/civil_id/', null=True, blank=True)
    license_front = models.ImageField(upload_to='working_drivers/license/', null=True, blank=True)
    license_back = models.ImageField(upload_to='working_drivers/license/', null=True, blank=True)
    vehicle_documents = models.FileField(upload_to='working_drivers/vehicle_docs/', null=True, blank=True)
    driver_photo = models.ImageField(upload_to='working_drivers/photos/', null=True, blank=True)
    health_card_document = models.FileField(upload_to='working_drivers/health/', null=True, blank=True)

    # Vehicle Photos
    vehicle_photo_front = models.ImageField(upload_to='working_drivers/vehicle_photos/', null=True, blank=True)
    vehicle_photo_back = models.ImageField(upload_to='working_drivers/vehicle_photos/', null=True, blank=True)
    vehicle_photo_left = models.ImageField(upload_to='working_drivers/vehicle_photos/', null=True, blank=True)
    vehicle_photo_right = models.ImageField(upload_to='working_drivers/vehicle_photos/', null=True, blank=True)

    # Accessories & Uniform
    t_shirt_issued = models.BooleanField(default=False)
    cap_issued = models.BooleanField(default=False)
    bag_issued = models.BooleanField(default=False)
    vest_issued = models.BooleanField(default=False)
    safety_equipment_issued = models.BooleanField(default=False)
    helmet_issued = models.BooleanField(default=False)
    cool_jacket_issued = models.BooleanField(default=False)
    water_bottle_issued = models.BooleanField(default=False)

    # Performance Metrics
    total_trips = models.IntegerField(default=0)
    total_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)

    # Company relationship
    company = models.ForeignKey('company.Company', on_delete=models.CASCADE, related_name='working_drivers')

    # Metadata
    created_by = models.CharField(max_length=100, default='System')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Working Driver"
        verbose_name_plural = "Working Drivers"
        ordering = ['-joining_date']

    def __str__(self):
        return f"{self.employee_id} - {self.full_name}"

    @property
    def age(self):
        """Calculate age from date of birth"""
        if self.date_of_birth:
            from datetime import date
            today = date.today()
            return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
        return None

    @property
    def documents_expiring_soon(self):
        """Check if any documents are expiring within 30 days"""
        from datetime import date, timedelta
        thirty_days = date.today() + timedelta(days=30)

        expiring = []
        if self.civil_id_expiry and self.civil_id_expiry <= thirty_days:
            expiring.append('Civil ID')
        if self.license_expiry_date and self.license_expiry_date <= thirty_days:
            expiring.append('License')
        if self.vehicle_expiry_date and self.vehicle_expiry_date <= thirty_days:
            expiring.append('Vehicle Registration')
        if self.health_card_expiry and self.health_card_expiry <= thirty_days:
            expiring.append('Health Card')

        return expiring

    @property
    def all_accessories_issued(self):
        """Check if all mandatory accessories are issued"""
        mandatory_accessories = [
            self.t_shirt_issued,
            self.cap_issued,
            self.bag_issued,
            self.vest_issued,
            self.safety_equipment_issued,
            self.helmet_issued,
        ]
        return all(mandatory_accessories)

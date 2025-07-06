from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('super_admin', 'Super Admin'),
        ('admin', 'Admin'),
        ('hr_manager', 'HR Manager'),
        ('supervisor', 'Supervisor'),
        ('viewer', 'Viewer'),
        ('driver', 'Driver'),
        ('staff', 'Staff'),
        ('accountant', 'Accountant'),
        ('management', 'Management'),
    )

    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    phone = models.CharField(max_length=15, blank=True, null=True)
    role = models.CharField(max_length=15, choices=ROLE_CHOICES, default='staff')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    last_login_at = models.DateTimeField(blank=True, null=True)
    login_attempts = models.IntegerField(default=0)
    is_locked = models.BooleanField(default=False)
    locked_until = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def get_full_name(self):
        """Return the full name of the user"""
        return f"{self.first_name} {self.last_name}".strip()

    def get_short_name(self):
        """Return the short name of the user"""
        return self.first_name

    def __str__(self):
        return self.email

    @property
    def permissions_list(self):
        """Return a list of permissions based on role"""
        role_permissions = {
            'super_admin': [
                'user_management', 'driver_management', 'attendance_management',
                'warning_letters', 'termination_letters', 'reports_view', 'system_settings'
            ],
            'admin': [
                'driver_management', 'attendance_management', 'warning_letters',
                'termination_letters', 'reports_view'
            ],
            'hr_manager': [
                'driver_management', 'attendance_management', 'warning_letters', 'reports_view'
            ],
            'supervisor': ['attendance_management', 'reports_view'],
            'viewer': ['reports_view'],
        }
        return role_permissions.get(self.role, [])


class DriverAuthentication(models.Model):
    """Model for driver mobile app authentication"""
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('locked', 'Locked'),
    )

    driver = models.OneToOneField(
        'drivers.Driver',
        on_delete=models.CASCADE,
        related_name='authentication'
    )
    username = models.CharField(max_length=150, unique=True)
    password_hash = models.CharField(max_length=255)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    device_id = models.CharField(max_length=255, blank=True, null=True)
    device_info = models.JSONField(default=dict, blank=True)

    # Security fields
    last_login_at = models.DateTimeField(blank=True, null=True)
    login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(blank=True, null=True)
    password_reset_token = models.CharField(max_length=255, blank=True, null=True)
    password_reset_expires = models.DateTimeField(blank=True, null=True)

    # Tracking
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_driver_auths'
    )

    class Meta:
        db_table = 'driver_authentication'
        verbose_name = 'Driver Authentication'
        verbose_name_plural = 'Driver Authentications'

    def __str__(self):
        return f"{self.driver.name} (@{self.username})"

    @property
    def is_locked(self):
        """Check if account is currently locked"""
        if self.status == 'locked':
            return True
        if self.locked_until and self.locked_until > timezone.now():
            return True
        return False

    def lock_account(self, duration_minutes=30):
        """Lock the account for specified duration"""
        from django.utils import timezone
        self.status = 'locked'
        self.locked_until = timezone.now() + timezone.timedelta(minutes=duration_minutes)
        self.save()

    def unlock_account(self):
        """Unlock the account"""
        self.status = 'active'
        self.locked_until = None
        self.login_attempts = 0
        self.save()

    def increment_login_attempts(self):
        """Increment login attempts and lock if necessary"""
        self.login_attempts += 1
        if self.login_attempts >= 3:
            self.lock_account()
        self.save()

    def reset_login_attempts(self):
        """Reset login attempts on successful login"""
        self.login_attempts = 0
        self.last_login_at = timezone.now()
        self.save()

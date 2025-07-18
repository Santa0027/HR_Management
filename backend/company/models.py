from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator, EmailValidator
from decimal import Decimal


# --- Simplified Company Model with all fields integrated ---
class Company(models.Model):
    # Car commission fields
    CAR_COMMISSION_TYPE_CHOICES = [
        ('KM', 'KM Based'),
        ('ORDER', 'Order Based'),
        ('FIXED', 'Fixed Commission'),
    ]
    car_commission_type = models.CharField(
        max_length=10,
        choices=CAR_COMMISSION_TYPE_CHOICES,
        default='FIXED',
        help_text="Type of commission for car (e.g., KM Based, Order Based, Fixed).",
        null=True,
        blank=True,
    )
    car_rate_per_km = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Car: Rate of commission per kilometer (applicable for KM Based)."
    )
    car_min_km = models.IntegerField(
        null=True,
        blank=True,
        help_text="Car: Minimum kilometers for KM Based commission calculation."
    )
    car_rate_per_order = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Car: Rate of commission per order (applicable for Order Based)."
    )
    car_fixed_commission = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Car: Fixed commission amount (applicable for Fixed Commission)."
    )

    # Bike commission fields
    BIKE_COMMISSION_TYPE_CHOICES = [
        ('KM', 'KM Based'),
        ('ORDER', 'Order Based'),
        ('FIXED', 'Fixed Commission'),
    ]
    bike_commission_type = models.CharField(
        max_length=10,
        choices=BIKE_COMMISSION_TYPE_CHOICES,
        default='FIXED',
        help_text="Type of commission for bike (e.g., KM Based, Order Based, Fixed).",
        null=True,
        blank=True,
    )
    bike_rate_per_km = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Bike: Rate of commission per kilometer (applicable for KM Based)."
    )
    bike_min_km = models.IntegerField(
        null=True,
        blank=True,
        help_text="Bike: Minimum kilometers for KM Based commission calculation."
    )
    bike_rate_per_order = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Bike: Rate of commission per order (applicable for Order Based)."
    )
    bike_fixed_commission = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Bike: Fixed commission amount (applicable for Fixed Commission)."
    )

    # Employee Accessories - Company only selects which accessories are available
    # Uniform accessories
    t_shirt = models.BooleanField(default=False, help_text="Company provides T-shirts")
    cap = models.BooleanField(default=False, help_text="Company provides caps")
    jackets = models.BooleanField(default=False, help_text="Company provides jackets")

    # Personal accessories
    bag = models.BooleanField(default=False, help_text="Company provides bags")
    wristbands = models.BooleanField(default=False, help_text="Company provides wristbands")
    water_bottle = models.BooleanField(default=False, help_text="Company provides water bottles")

    # Safety accessories
    safety_gear = models.BooleanField(default=False, help_text="Company provides safety gear")
    helmet = models.BooleanField(default=False, help_text="Company provides helmets")
    # Step 1: Company Info
    company_logo = models.ImageField(
        upload_to='company/logo/',
        null=True,
        blank=True,
        verbose_name="Company Logo",
        help_text="Upload the company's official logo."
    )
    company_name = models.CharField(max_length=255, unique=True, verbose_name="Company Name")
    registration_number = models.CharField(max_length=100, unique=True, verbose_name="Registration Number")
    gst_number = models.CharField( # Re-added and added validator
        max_length=15,
        blank=True,
        null=True,
        verbose_name="GST Number (Optional)",
        validators=[RegexValidator(r'^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$',
                                   message='Enter a valid GST number (e.g., 22AAAAA0000A1Z5).')]
    )
    website = models.URLField(max_length=200, blank=True, null=True, verbose_name="Company Website")
    description = models.TextField(blank=True, verbose_name="Company Description")
    established_date = models.DateField(blank=True, null=True, verbose_name="Established Date")


    address = models.TextField(verbose_name="Full Address")
    city = models.CharField(max_length=100, verbose_name="City")
    country = models.CharField(max_length=100, verbose_name="Country")

    contact_person = models.CharField(max_length=100, verbose_name="Contact Person")
    contact_email = models.EmailField(verbose_name="Contact Email", validators=[EmailValidator()])
    contact_phone = models.CharField(
        max_length=20,
        verbose_name="Contact Phone",
        validators=[RegexValidator(r'^\+?1?\d{9,15}$', # Flexible phone number regex
                                   message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")]
    )

    # Step 2: Accounting Info
    bank_name = models.CharField(max_length=100, blank=True, null=True, verbose_name="Bank Name") # Made optional
    account_number = models.CharField(max_length=50, blank=True, null=True, verbose_name="Account Number") # Made optional
    ifsc_code = models.CharField(
        max_length=11,
        blank=True,
        null=True,
        verbose_name="IFSC Code",
        validators=[RegexValidator(r'^[A-Z]{4}0[A-Z0-9]{6}$',
                                   message='Enter a valid IFSC code (e.g., SBIN0001234).')]
    )
    swift_code = models.CharField(max_length=20, blank=True, null=True, verbose_name="SWIFT Code")
    iban_code = models.CharField(max_length=34, blank=True, null=True, verbose_name="IBAN Code")

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Company"
        verbose_name_plural = "Companies"
        ordering = ['company_name']

    def __str__(self):
        return self.company_name

    def clean(self):
        super().clean()
        # Ensure contact_email is unique
        if self.contact_email and Company.objects.filter(contact_email=self.contact_email).exclude(pk=self.pk).exists():
            raise ValidationError({'contact_email': 'This email address is already associated with another company.'})

        # Ensure registration_number is unique
        if self.registration_number and Company.objects.filter(registration_number=self.registration_number).exclude(pk=self.pk).exists():
            raise ValidationError({'registration_number': 'This registration number is already registered.'})
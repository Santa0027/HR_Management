from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator, EmailValidator
from decimal import Decimal

# --- Commission Details Model ---
# This model will define the flexible commission structure (KM, Order, Fixed)
# It will be linked to the Company model via OneToOne fields for specific vehicle types.
class CommissionDetails(models.Model):
    COMMISSION_TYPE_CHOICES = [
        ('KM', 'KM Based'), # Changed to uppercase to match frontend values if needed
        ('ORDER', 'Order Based'),
        ('FIXED', 'Fixed Commission'),
    ]

    commission_type = models.CharField(
        max_length=10,
        choices=COMMISSION_TYPE_CHOICES,
        default='FIXED', # Default as per frontend
        help_text="Type of commission (e.g., KM Based, Order Based, Fixed)."
    )
    # Fields for 'KM' based commission
    rate_per_km = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Rate of commission per kilometer (applicable for KM Based)."
    )
    min_km = models.IntegerField( # Changed to IntegerField as KM is usually integer
        null=True,
        blank=True,
        help_text="Minimum kilometers for KM Based commission calculation (applicable for KM Based)."
    )
    # Field for 'ORDER' based commission
    rate_per_order = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Rate of commission per order (applicable for Order Based)."
    )
    # Field for 'FIXED' commission
    fixed_commission = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Fixed commission amount (applicable for Fixed Commission)."
    )

    class Meta:
        verbose_name = "Commission Detail"
        verbose_name_plural = "Commission Details"

    def __str__(self):
        if self.commission_type == 'KM':
            return f"KM: {self.rate_per_km} / KM (Min: {self.min_km or 0}KM)"
        elif self.commission_type == 'ORDER':
            return f"Order: {self.rate_per_order} / Order"
        elif self.commission_type == 'FIXED':
            return f"Fixed: {self.fixed_commission}"
        return f"Unknown Commission Type: {self.commission_type}"

    def clean(self):
        # Ensure only relevant fields are populated based on commission_type
        if self.commission_type == 'KM':
            if self.rate_per_km is None or self.rate_per_km <= 0:
                raise ValidationError({'rate_per_km': 'Rate per KM must be a positive number for KM Based commission.'})
            if self.min_km is None or self.min_km < 0:
                raise ValidationError({'min_km': 'Minimum KM must be a non-negative integer for KM Based commission.'})
            # Clear irrelevant fields
            self.rate_per_order = None
            self.fixed_commission = None
        elif self.commission_type == 'ORDER':
            if self.rate_per_order is None or self.rate_per_order <= 0:
                raise ValidationError({'rate_per_order': 'Rate per Order must be a positive number for Order Based commission.'})
            # Clear irrelevant fields
            self.rate_per_km = None
            self.min_km = None
            self.fixed_commission = None
        elif self.commission_type == 'FIXED':
            if self.fixed_commission is None or self.fixed_commission <= 0:
                raise ValidationError({'fixed_commission': 'Fixed commission must be a positive number for Fixed Commission.'})
            # Clear irrelevant fields
            self.rate_per_km = None
            self.min_km = None
            self.rate_per_order = None
        else:
            # If commission_type is somehow invalid or not set (shouldn't happen with choices)
            # Clear all commission-specific fields
            self.rate_per_km = None
            self.min_km = None
            self.rate_per_order = None
            self.fixed_commission = None

        super().clean()


# --- Company Model ---
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
    COMMISSION_TYPE_CHOICES = [
        ('KM', 'KM Based'),
        ('ORDER', 'Order Based'),
        ('FIXED', 'Fixed Commission'),
    ]

    commission_type = models.CharField(
        max_length=10,
        choices=COMMISSION_TYPE_CHOICES,
        default='FIXED',
        help_text="Type of commission (e.g., KM Based, Order Based, Fixed)."
    )
    # Fields for 'KM' based commission
    rate_per_km = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Rate of commission per kilometer (applicable for KM Based)."
    )
    min_km = models.IntegerField(
        null=True,
        blank=True,
        help_text="Minimum kilometers for KM Based commission calculation (applicable for KM Based)."
    )
    # Field for 'ORDER' based commission
    rate_per_order = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Rate of commission per order (applicable for Order Based)."
    )
    # Field for 'FIXED' commission
    fixed_commission = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Fixed commission amount (applicable for Fixed Commission)."
    )
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

    # Commission fields are now directly in the Company model (see above)

    # Accessories are now handled by the EmployeeAccessory model, not directly on Company
    # The frontend's accessory checkboxes likely control the *types* of accessories
    # this company *can provide*, which would be managed through the EmployeeAccessory model
    # associated with this company.

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Company"
        verbose_name_plural = "Companies"
        ordering = ['company_name']

    def __str__(self):
        return self.company_name

    # The clean method on Company for commission validation is no longer needed here,
    # as the validation is now handled within the CommissionDetails model's clean method.
    # We only need to ensure that if a commission detail exists, its data is valid.
    def clean(self):
        super().clean()
        # You could add cross-field validation here if needed, but for commissions
        # the validation is encapsulated in CommissionDetails.

        # Example: if you need to ensure contact_email is unique across companies
        # and not just in this specific instance save.
        if self.contact_email and Company.objects.filter(contact_email=self.contact_email).exclude(pk=self.pk).exists():
            raise ValidationError({'contact_email': 'This email address is already associated with another company.'})

        # Example: ensure registration_number is unique
        if self.registration_number and Company.objects.filter(registration_number=self.registration_number).exclude(pk=self.pk).exists():
            raise ValidationError({'registration_number': 'This registration number is already registered.'})


# --- VehicleTariff Model (No changes from your provided code, good as is) ---
class VehicleTariff(models.Model):
    """Different tariff rates for bikes and cars"""
    VEHICLE_TYPE_CHOICES = [
        ('bike', 'Bike/Motorcycle'),
        ('car', 'Car'),
        ('van', 'Van'),
        ('truck', 'Truck'),
        ('bus', 'Bus'),
    ]

    TARIFF_TYPE_CHOICES = [
        ('per_km', 'Per Kilometer'),
        ('per_hour', 'Per Hour'),
        ('per_day', 'Per Day'),
        ('fixed', 'Fixed Rate'),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='vehicle_tariffs')
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_TYPE_CHOICES)
    tariff_type = models.CharField(max_length=20, choices=TARIFF_TYPE_CHOICES)

    # Pricing
    base_rate = models.DecimalField(max_digits=10, decimal_places=2, help_text="Base rate for the tariff")
    minimum_charge = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    waiting_charge_per_minute = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('0.00'))

    # Distance/Time limits
    free_km_limit = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('0.00'), help_text="Free kilometers included")
    free_time_limit = models.IntegerField(default=0, help_text="Free time in minutes")

    # Additional charges
    fuel_surcharge_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    night_charge_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    holiday_charge_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))

    # Validity
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Vehicle Tariff"
        verbose_name_plural = "Vehicle Tariffs"
        ordering = ['vehicle_type', 'tariff_type']
        # This unique_together constraint ensures that a company cannot have two identical tariffs
        # (same vehicle, same tariff type) starting on the same date.
        unique_together = ['company', 'vehicle_type', 'tariff_type', 'effective_from']

    def __str__(self):
        return f"{self.company.company_name} - {self.get_vehicle_type_display()} - {self.get_tariff_type_display()}"


# --- EmployeeAccessory Model (No changes from your provided code, good as is) ---
class EmployeeAccessory(models.Model):
    """Employee accessories and uniform items provided by a company"""
    ACCESSORY_CATEGORY_CHOICES = [
        ('uniform', 'Uniform'),
        ('safety', 'Safety Equipment'),
        ('technology', 'Technology'),
        ('personal', 'Personal Items'),
        ('vehicle', 'Vehicle Accessories'),
    ]

    SIZE_CHOICES = [
        ('xs', 'Extra Small'),
        ('s', 'Small'),
        ('m', 'Medium'),
        ('l', 'Large'),
        ('xl', 'Extra Large'),
        ('xxl', 'Double Extra Large'),
        ('xxxl', 'Triple Extra Large'),
        ('na', 'Not Applicable'),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='employee_accessories')

    # Item details
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=ACCESSORY_CATEGORY_CHOICES)
    description = models.TextField(blank=True)

    # Specifications
    brand = models.CharField(max_length=50, blank=True)
    model = models.CharField(max_length=50, blank=True)
    color = models.CharField(max_length=30, blank=True)
    size = models.CharField(max_length=10, choices=SIZE_CHOICES, default='na')

    # Pricing
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # Inventory
    stock_quantity = models.IntegerField(default=0)
    minimum_stock_level = models.IntegerField(default=5)

    # Validity
    is_mandatory = models.BooleanField(default=False, help_text="Required for all employees")
    is_returnable = models.BooleanField(default=True, help_text="Must be returned when leaving")
    replacement_period_months = models.IntegerField(default=12, help_text="How often to replace")

    # Status
    is_active = models.BooleanField(default=True)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Employee Accessory"
        verbose_name_plural = "Employee Accessories"
        ordering = ['category', 'name']

    def __str__(self):
        return f"{self.name} ({self.get_category_display()}) - {self.company.company_name}"

    @property
    def is_low_stock(self):
        return self.stock_quantity <= self.minimum_stock_level


# --- EmployeeAccessoryAssignment Model (No changes from your provided code, good as is) ---
class EmployeeAccessoryAssignment(models.Model):
    """Track accessory assignments to employees"""
    STATUS_CHOICES = [
        ('assigned', 'Assigned'),
        ('returned', 'Returned'),
        ('lost', 'Lost'),
        ('damaged', 'Damaged'),
        ('replaced', 'Replaced'),
    ]

    # This will be linked to Driver model when we enhance it
    employee_id = models.IntegerField(help_text="Driver/Employee ID (e.g., linked to a Driver model)")
    employee_name = models.CharField(max_length=100)

    accessory = models.ForeignKey(EmployeeAccessory, on_delete=models.CASCADE, related_name='assignments')

    # Assignment details
    assigned_date = models.DateField()
    expected_return_date = models.DateField(null=True, blank=True)
    actual_return_date = models.DateField(null=True, blank=True)

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='assigned')
    condition_when_assigned = models.CharField(max_length=20, default='new')
    condition_when_returned = models.CharField(max_length=20, blank=True)

    # Notes
    assignment_notes = models.TextField(blank=True) 
    return_notes = models.TextField(blank=True)

    # Charges
    security_deposit = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('0.00'))
    damage_charge = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('0.00'))

    # Metadata
    assigned_by = models.CharField(max_length=100)  # Admin user name
    returned_to = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Accessory Assignment"
        verbose_name_plural = "Accessory Assignments"
        ordering = ['-assigned_date']

    def __str__(self):
        return f"{self.employee_name} - {self.accessory.name} ({self.status})"
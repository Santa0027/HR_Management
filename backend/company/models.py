from django.db import models
from django.core.exceptions import ValidationError
from decimal import Decimal

class Company(models.Model):
    COMMISSION_TYPE_CHOICES = [
        ('km', 'KM Based'),
        ('order', 'Order Based'),
        ('fixed', 'Fixed Commission'),
    ]

    # Step 1: Company Info
    company_logo=models.FileField(upload_to='company/logo/', null=True, blank=True)
    company_name = models.CharField(max_length=255)
    registration_number = models.CharField(max_length=100, unique=True)
    # gst_number = models.CharField(max_length=100, blank=True, null=True)

    address = models.TextField()
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)

    contact_person = models.CharField(max_length=100)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20)

    # Step 2: Accounting Info
    bank_name = models.CharField(max_length=100)
    account_number = models.CharField(max_length=50)
    ifsc_code = models.CharField(max_length=20)
    swift_code = models.CharField(max_length=20, blank=True, null=True)
    iban_code = models.CharField(max_length=34, blank=True, null=True)

    # Step 3: Commission Info
    commission_type = models.CharField(
        max_length=10, choices=COMMISSION_TYPE_CHOICES, blank=True, null=True
    )
    rate_per_km = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True,
        help_text="Applicable only if KM Based"
    )
    min_km = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True,
        help_text="Applicable only if KM Based"
    )
    rate_per_order = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True,
        help_text="Applicable only if Order Based"
    )
    fixed_commission = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True,
        help_text="Applicable only if Fixed Commission"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.company_name

    def clean(self):
        super().clean() # Call the parent class's clean method first

        if self.commission_type == 'km':
            if self.rate_per_km is None:
                raise ValidationError({'rate_per_km': 'Rate per KM is required for KM Based commission.'})
            # Validate that other commission types are not set
            if self.rate_per_order is not None:
                raise ValidationError({'rate_per_order': 'Rate per Order should not be set for KM Based commission.'})
            if self.fixed_commission is not None:
                raise ValidationError({'fixed_commission': 'Fixed Commission should not be set for KM Based commission.'})

        elif self.commission_type == 'order':
            if self.rate_per_order is None:
                raise ValidationError({'rate_per_order': 'Rate per Order is required for Order Based commission.'})
            # Validate that other commission types are not set
            if self.rate_per_km is not None:
                raise ValidationError({'rate_per_km': 'Rate per KM should not be set for Order Based commission.'})
            if self.min_km is not None:
                raise ValidationError({'min_km': 'Min KM should not be set for Order Based commission.'})
            if self.fixed_commission is not None:
                raise ValidationError({'fixed_commission': 'Fixed Commission should not be set for Order Based commission.'})

        elif self.commission_type == 'fixed':
            if self.fixed_commission is None:
                raise ValidationError({'fixed_commission': 'Fixed Commission amount is required for Fixed Commission.'})
            # Validate that other commission types are not set
            if self.rate_per_km is not None:
                raise ValidationError({'rate_per_km': 'Rate per KM should not be set for Fixed Commission.'})
            if self.min_km is not None:
                raise ValidationError({'min_km': 'Min KM should not be set for Fixed Commission.'})
            if self.rate_per_order is not None:
                raise ValidationError({'rate_per_order': 'Rate per Order should not be set for Fixed Commission.'})

        else: # self.commission_type is None or an invalid choice (though choices usually prevent invalid ones)
            # If commission_type is None, ensure no commission-related fields are populated
            if self.commission_type is None:
                if self.rate_per_km is not None:
                    raise ValidationError({'rate_per_km': 'Commission type must be selected if rate per KM is provided.'})
                if self.min_km is not None:
                    raise ValidationError({'min_km': 'Commission type must be selected if min KM is provided.'})
                if self.rate_per_order is not None:
                    raise ValidationError({'rate_per_order': 'Commission type must be selected if rate per order is provided.'})
                if self.fixed_commission is not None:
                    raise ValidationError({'fixed_commission': 'Commission type must be selected if fixed commission is provided.'})
            # If commission_type is not None but not one of the valid choices (unlikely with 'choices'),
            # you could add a generic error here if desired.


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
        unique_together = ['company', 'vehicle_type', 'tariff_type', 'effective_from']

    def __str__(self):
        return f"{self.company.company_name} - {self.get_vehicle_type_display()} - {self.get_tariff_type_display()}"


class EmployeeAccessory(models.Model):
    """Employee accessories and uniform items"""
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
        return f"{self.name} ({self.get_category_display()})"

    @property
    def is_low_stock(self):
        return self.stock_quantity <= self.minimum_stock_level


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
    employee_id = models.IntegerField(help_text="Driver/Employee ID")
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
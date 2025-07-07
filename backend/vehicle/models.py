from django.db import models
from django.conf import settings
from decimal import Decimal

class VehicleRegistration(models.Model):
    VEHICLE_TYPE_CHOICES = [
        ('CAR', 'Car'),
        ('BIKE', 'Bike'),
        ('TRUCK', 'Truck'),
        ('BUS', 'Bus'),
        ('VAN', 'Van'),
        ('SUV', 'SUV'),
        ('PICKUP', 'Pickup'),
        ('OTHER', 'Other'),
    ]

    APPROVAL_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    OWNERSHIP_TYPE_CHOICES = [
        ('OWN', 'Owned'),
        ('LEASE', 'Leased'),
        ('RENTAL', 'Rental'),
        ('FINANCE', 'Financed'),
    ]

    VEHICLE_STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('MAINTENANCE', 'Under Maintenance'),
        ('OUT_OF_SERVICE', 'Out of Service'),
        ('RETIRED', 'Retired'),
    ]

    FUEL_TYPE_CHOICES = [
        ('PETROL', 'Petrol'),
        ('DIESEL', 'Diesel'),
        ('ELECTRIC', 'Electric'),
        ('HYBRID', 'Hybrid'),
        ('CNG', 'CNG'),
        ('LPG', 'LPG'),
    ]

    # Basic Information
    vehicle_name = models.CharField(max_length=100)
    vehicle_number = models.CharField(max_length=50, unique=True)
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_TYPE_CHOICES, default='CAR')
    make = models.CharField(max_length=50, blank=True, null=True)
    model = models.CharField(max_length=50, blank=True, null=True)
    year = models.IntegerField(blank=True, null=True)
    color = models.CharField(max_length=30, blank=True, null=True)

    # Vehicle Specifications
    engine_number = models.CharField(max_length=100, blank=True, null=True)
    chassis_number = models.CharField(max_length=100, blank=True, null=True)
    fuel_type = models.CharField(max_length=20, choices=FUEL_TYPE_CHOICES, default='PETROL')
    seating_capacity = models.IntegerField(blank=True, null=True)
    mileage_kmpl = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)

    # Ownership and Status
    ownership_type = models.CharField(max_length=20, choices=OWNERSHIP_TYPE_CHOICES, default='OWN')
    vehicle_status = models.CharField(max_length=20, choices=VEHICLE_STATUS_CHOICES, default='ACTIVE')
    purchase_date = models.DateField(blank=True, null=True)
    purchase_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)

    # Lease/Rental Information
    lease_start_date = models.DateField(blank=True, null=True)
    lease_end_date = models.DateField(blank=True, null=True)
    monthly_lease_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    lease_company = models.CharField(max_length=100, blank=True, null=True)

    # Documents and Images
    image = models.ImageField(upload_to='vehicles/images/', blank=True, null=True)

    # Insurance Information
    insurance_number = models.CharField(max_length=100, blank=True, null=True)
    insurance_company = models.CharField(max_length=100, blank=True, null=True)
    insurance_document = models.FileField(upload_to='vehicles/insurance_docs/', blank=True, null=True)
    insurance_expiry_date = models.DateField(blank=True, null=True)
    insurance_premium = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    # Registration Information
    rc_book_number = models.CharField(max_length=100, blank=True, null=True)
    rc_document = models.FileField(upload_to='vehicles/rc_docs/', blank=True, null=True)
    rc_expiry_date = models.DateField(blank=True, null=True)

    # Service and Maintenance
    last_service_date = models.DateField(blank=True, null=True)
    next_service_date = models.DateField(blank=True, null=True)
    service_interval_km = models.IntegerField(default=10000, help_text="Service interval in kilometers")
    current_odometer = models.IntegerField(default=0, help_text="Current odometer reading in km")

    # Driver Assignment
    assigned_driver = models.ForeignKey(
        'drivers.Driver',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_vehicles'
    )

    # System Fields
    approval_status = models.CharField(max_length=20, choices=APPROVAL_STATUS_CHOICES, default='PENDING')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.vehicle_name} ({self.vehicle_number})"

    @property
    def is_lease_expired(self):
        if self.ownership_type == 'LEASE' and self.lease_end_date:
            from django.utils import timezone
            return self.lease_end_date < timezone.now().date()
        return False

    @property
    def is_insurance_expired(self):
        if self.insurance_expiry_date:
            from django.utils import timezone
            return self.insurance_expiry_date < timezone.now().date()
        return False

    @property
    def is_service_due(self):
        if self.next_service_date:
            from django.utils import timezone
            return self.next_service_date <= timezone.now().date()
        return False
    

class VehicleLog(models.Model):
    ACTION_CHOICES = [
        ('CREATED', 'Created'),
        ('UPDATED', 'Updated'),
        ('DELETED', 'Deleted'),
        ('ASSIGNED', 'Driver Assigned'),
        ('UNASSIGNED', 'Driver Unassigned'),
        ('SERVICE_SCHEDULED', 'Service Scheduled'),
        ('SERVICE_COMPLETED', 'Service Completed'),
        ('FUEL_REFILLED', 'Fuel Refilled'),
        ('MAINTENANCE', 'Maintenance'),
        ('ACCIDENT', 'Accident Reported'),
    ]

    vehicle = models.ForeignKey('VehicleRegistration', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    remarks = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.vehicle.vehicle_number} - {self.action}"


class VehicleServiceRecord(models.Model):
    SERVICE_TYPE_CHOICES = [
        ('ROUTINE', 'Routine Service'),
        ('REPAIR', 'Repair'),
        ('MAINTENANCE', 'Maintenance'),
        ('INSPECTION', 'Inspection'),
        ('EMERGENCY', 'Emergency Repair'),
        ('ACCIDENT_REPAIR', 'Accident Repair'),
    ]

    STATUS_CHOICES = [
        ('SCHEDULED', 'Scheduled'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    vehicle = models.ForeignKey(VehicleRegistration, on_delete=models.CASCADE, related_name='service_records')
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPE_CHOICES)
    service_date = models.DateField()
    service_provider = models.CharField(max_length=100)
    service_description = models.TextField()
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    odometer_reading = models.IntegerField(help_text="Odometer reading at service time")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SCHEDULED')

    # Service details
    parts_replaced = models.TextField(blank=True, null=True)
    warranty_period_days = models.IntegerField(blank=True, null=True)
    next_service_km = models.IntegerField(blank=True, null=True)

    # Documents
    invoice_document = models.FileField(upload_to='vehicles/service_invoices/', blank=True, null=True)
    service_report = models.FileField(upload_to='vehicles/service_reports/', blank=True, null=True)

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-service_date']

    def __str__(self):
        return f"{self.vehicle.vehicle_number} - {self.service_type} on {self.service_date}"


class VehicleFuelRecord(models.Model):
    FUEL_TYPE_CHOICES = [
        ('PETROL', 'Petrol'),
        ('DIESEL', 'Diesel'),
        ('CNG', 'CNG'),
        ('LPG', 'LPG'),
    ]

    vehicle = models.ForeignKey(VehicleRegistration, on_delete=models.CASCADE, related_name='fuel_records')
    fuel_date = models.DateTimeField()
    fuel_type = models.CharField(max_length=10, choices=FUEL_TYPE_CHOICES)
    quantity_liters = models.DecimalField(max_digits=8, decimal_places=2)
    cost_per_liter = models.DecimalField(max_digits=6, decimal_places=2)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2)
    odometer_reading = models.IntegerField()
    fuel_station = models.CharField(max_length=100, blank=True, null=True)
    driver = models.ForeignKey('drivers.Driver', on_delete=models.SET_NULL, null=True, blank=True)

    # Receipt and documentation
    receipt_number = models.CharField(max_length=50, blank=True, null=True)
    receipt_image = models.ImageField(upload_to='vehicles/fuel_receipts/', blank=True, null=True)

    # Trip information
    trip_purpose = models.CharField(max_length=100, blank=True, null=True)
    distance_covered = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fuel_date']

    def __str__(self):
        return f"{self.vehicle.vehicle_number} - {self.quantity_liters}L on {self.fuel_date.date()}"

    @property
    def fuel_efficiency(self):
        """Calculate fuel efficiency if distance is available"""
        if self.distance_covered and self.quantity_liters:
            return round(float(self.distance_covered) / float(self.quantity_liters), 2)
        return None


class VehicleRentalRecord(models.Model):
    RENTAL_STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
        ('OVERDUE', 'Overdue'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PARTIAL', 'Partial'),
        ('PAID', 'Paid'),
        ('OVERDUE', 'Overdue'),
    ]

    vehicle = models.ForeignKey(VehicleRegistration, on_delete=models.CASCADE, related_name='rental_records')
    renter_name = models.CharField(max_length=100)
    renter_contact = models.CharField(max_length=20)
    renter_license = models.CharField(max_length=50)
    renter_address = models.TextField()

    # Rental period
    rental_start_date = models.DateTimeField()
    rental_end_date = models.DateTimeField()
    actual_return_date = models.DateTimeField(blank=True, null=True)

    # Pricing
    daily_rate = models.DecimalField(max_digits=8, decimal_places=2)
    total_days = models.IntegerField()
    base_amount = models.DecimalField(max_digits=10, decimal_places=2)
    security_deposit = models.DecimalField(max_digits=10, decimal_places=2)
    additional_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    # Vehicle condition
    pickup_odometer = models.IntegerField()
    return_odometer = models.IntegerField(blank=True, null=True)
    pickup_fuel_level = models.CharField(max_length=10, default='FULL')
    return_fuel_level = models.CharField(max_length=10, blank=True, null=True)

    # Status
    rental_status = models.CharField(max_length=20, choices=RENTAL_STATUS_CHOICES, default='ACTIVE')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='PENDING')

    # Documents
    rental_agreement = models.FileField(upload_to='vehicles/rental_agreements/', blank=True, null=True)
    pickup_inspection_report = models.FileField(upload_to='vehicles/inspection_reports/', blank=True, null=True)
    return_inspection_report = models.FileField(upload_to='vehicles/inspection_reports/', blank=True, null=True)

    # Notes
    pickup_notes = models.TextField(blank=True, null=True)
    return_notes = models.TextField(blank=True, null=True)

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-rental_start_date']

    def __str__(self):
        return f"{self.vehicle.vehicle_number} - {self.renter_name} ({self.rental_start_date.date()})"

    @property
    def is_overdue(self):
        from django.utils import timezone
        return self.rental_end_date < timezone.now() and self.rental_status == 'ACTIVE'

    @property
    def total_distance(self):
        if self.return_odometer and self.pickup_odometer:
            return self.return_odometer - self.pickup_odometer
        return None


class VehicleExpense(models.Model):
    EXPENSE_TYPE_CHOICES = [
        ('FUEL', 'Fuel'),
        ('SERVICE', 'Service & Maintenance'),
        ('INSURANCE', 'Insurance'),
        ('REGISTRATION', 'Registration'),
        ('TOLL', 'Toll Charges'),
        ('PARKING', 'Parking'),
        ('FINE', 'Traffic Fine'),
        ('REPAIR', 'Repair'),
        ('CLEANING', 'Cleaning'),
        ('OTHER', 'Other'),
    ]

    vehicle = models.ForeignKey(VehicleRegistration, on_delete=models.CASCADE, related_name='expenses')
    expense_type = models.CharField(max_length=20, choices=EXPENSE_TYPE_CHOICES)
    expense_date = models.DateField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    vendor = models.CharField(max_length=100, blank=True, null=True)
    invoice_number = models.CharField(max_length=50, blank=True, null=True)

    # Documentation
    receipt_image = models.ImageField(upload_to='vehicles/expense_receipts/', blank=True, null=True)
    invoice_document = models.FileField(upload_to='vehicles/expense_invoices/', blank=True, null=True)

    # Trip/Driver information
    driver = models.ForeignKey('drivers.Driver', on_delete=models.SET_NULL, null=True, blank=True)
    odometer_reading = models.IntegerField(blank=True, null=True)

    # Approval workflow
    is_approved = models.BooleanField(default=False)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_vehicle_expenses'
    )
    approved_at = models.DateTimeField(blank=True, null=True)

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-expense_date']

    def __str__(self):
        return f"{self.vehicle.vehicle_number} - {self.expense_type} - ${self.amount}"

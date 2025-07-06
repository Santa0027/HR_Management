from django.db import models
from django.utils import timezone
from decimal import Decimal
from drivers.models import Driver
from company.models import Company
from vehicle.models import VehicleRegistration


class Trip(models.Model):
    """
    Model to track individual trips/rides taken by drivers.
    Integrates with the accounting system for earnings tracking.
    """
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('digital', 'Digital Payment'),
        ('card', 'Credit/Debit Card'),
        ('wallet', 'Digital Wallet'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('disputed', 'Disputed'),
    ]
    
    TRIP_TYPE_CHOICES = [
        ('regular', 'Regular Trip'),
        ('delivery', 'Delivery'),
        ('rental', 'Car Rental'),
        ('intercity', 'Intercity'),
        ('airport', 'Airport Transfer'),
    ]

    # Basic Trip Information
    trip_id = models.CharField(max_length=50, unique=True, blank=True)
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='trips')
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True)
    vehicle = models.ForeignKey(VehicleRegistration, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Customer Information
    customer_name = models.CharField(max_length=255)
    customer_phone = models.CharField(max_length=20, blank=True, null=True)
    customer_rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    
    # Trip Details
    trip_type = models.CharField(max_length=20, choices=TRIP_TYPE_CHOICES, default='regular')
    pickup_location = models.CharField(max_length=500)
    pickup_latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    pickup_longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    pickup_time = models.DateTimeField(null=True, blank=True)
    
    dropoff_location = models.CharField(max_length=500)
    dropoff_latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    dropoff_longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    dropoff_time = models.DateTimeField(null=True, blank=True)
    
    # Trip Metrics
    distance_km = models.DecimalField(max_digits=8, decimal_places=2, help_text="Distance in kilometers")
    duration_minutes = models.IntegerField(help_text="Duration in minutes")
    waiting_time_minutes = models.IntegerField(default=0, help_text="Waiting time in minutes")
    
    # Financial Information
    base_fare = models.DecimalField(max_digits=10, decimal_places=2)
    distance_fare = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    time_fare = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    waiting_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    surge_multiplier = models.DecimalField(max_digits=4, decimal_places=2, default=1.0)
    total_fare = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Tips and Additional Charges
    tip_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    toll_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    parking_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    additional_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Commission and Deductions
    platform_commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    platform_commission_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    driver_earnings = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Payment Information
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    payment_status = models.CharField(max_length=20, default='pending')
    payment_reference = models.CharField(max_length=100, blank=True, null=True)
    
    # Trip Status and Tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(blank=True, null=True)
    
    # Additional Information
    notes = models.TextField(blank=True, null=True)
    driver_rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    customer_feedback = models.TextField(blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.CharField(max_length=50, default='mobile_app')  # mobile_app, admin, api
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['driver', 'created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['payment_method']),
            models.Index(fields=['trip_type']),
            models.Index(fields=['company']),
        ]

    def save(self, *args, **kwargs):
        # Generate trip ID if not provided
        if not self.trip_id:
            import uuid
            self.trip_id = f"TRIP-{timezone.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        
        # Calculate total fare (ensure all values are Decimal)
        from decimal import Decimal

        base_total = (
            Decimal(str(self.base_fare)) +
            Decimal(str(self.distance_fare)) +
            Decimal(str(self.time_fare)) +
            Decimal(str(self.waiting_charges)) +
            Decimal(str(self.toll_charges)) +
            Decimal(str(self.parking_charges)) +
            Decimal(str(self.additional_charges))
        )

        self.total_fare = base_total * Decimal(str(self.surge_multiplier))
        
        # Calculate platform commission
        self.platform_commission_amount = (self.total_fare * Decimal(str(self.platform_commission_rate))) / Decimal('100')

        # Calculate driver earnings
        self.driver_earnings = self.total_fare - self.platform_commission_amount + Decimal(str(self.tip_amount))
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.trip_id} - {self.driver.driver_name} - {self.pickup_location[:30]}..."

    @property
    def total_earnings(self):
        """Total earnings including tips"""
        return self.driver_earnings + self.tip_amount

    @property
    def trip_duration_hours(self):
        """Trip duration in hours"""
        return self.duration_minutes / 60 if self.duration_minutes else 0

    def mark_completed(self):
        """Mark trip as completed"""
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.save()

    def mark_cancelled(self, reason=None):
        """Mark trip as cancelled"""
        self.status = 'cancelled'
        self.cancelled_at = timezone.now()
        if reason:
            self.cancellation_reason = reason
        self.save()


class TripExpense(models.Model):
    """
    Model to track expenses related to specific trips.
    Links with the accounting system for comprehensive financial tracking.
    """
    EXPENSE_TYPE_CHOICES = [
        ('fuel', 'Fuel'),
        ('toll', 'Toll Charges'),
        ('parking', 'Parking'),
        ('maintenance', 'Vehicle Maintenance'),
        ('fine', 'Traffic Fine'),
        ('other', 'Other'),
    ]

    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='expenses')
    expense_type = models.CharField(max_length=20, choices=EXPENSE_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255)
    receipt_image = models.ImageField(upload_to='trip_expenses/', null=True, blank=True)
    expense_date = models.DateTimeField(default=timezone.now)
    
    # Reimbursement tracking
    is_reimbursable = models.BooleanField(default=False)
    is_reimbursed = models.BooleanField(default=False)
    reimbursed_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-expense_date']

    def __str__(self):
        return f"{self.trip.trip_id} - {self.get_expense_type_display()} - {self.amount}"


class DriverEarningsSummary(models.Model):
    """
    Model to store daily/weekly/monthly earnings summaries for drivers.
    Helps with quick reporting and analytics.
    """
    PERIOD_TYPE_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]

    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='earnings_summaries')
    period_type = models.CharField(max_length=10, choices=PERIOD_TYPE_CHOICES)
    period_start = models.DateField()
    period_end = models.DateField()
    
    # Trip Statistics
    total_trips = models.IntegerField(default=0)
    completed_trips = models.IntegerField(default=0)
    cancelled_trips = models.IntegerField(default=0)
    
    # Distance and Time
    total_distance_km = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_duration_minutes = models.IntegerField(default=0)
    
    # Earnings Breakdown
    total_fare = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_tips = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_commission = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Payment Method Breakdown
    cash_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    digital_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Expenses
    total_expenses = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fuel_expenses = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['driver', 'period_type', 'period_start']
        ordering = ['-period_start']

    def __str__(self):
        return f"{self.driver.driver_name} - {self.get_period_type_display()} - {self.period_start}"

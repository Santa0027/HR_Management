from django.db import models
from django.conf import settings

class VehicleRegistration(models.Model):
    VEHICLE_TYPE_CHOICES = [
        ('CAR', 'Car'),
        ('BIKE', 'Bike'),
        ('TRUCK', 'Truck'),
        ('BUS', 'Bus'),
        ('OTHER', 'Other'),
    ]

    APPROVAL_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    vehicle_name = models.CharField(max_length=100)
    vehicle_number = models.CharField(max_length=50, unique=True)
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_TYPE_CHOICES, default='CAR')

    image = models.ImageField(upload_to='vehicles/images/', blank=True, null=True)

    insurance_number = models.CharField(max_length=100, blank=True, null=True)
    insurance_document = models.FileField(upload_to='vehicles/insurance_docs/', blank=True, null=True)
    insurance_expiry_date = models.DateField(blank=True, null=True)
    
    Chassis_Number =models.CharField(max_length=100, blank=True, null=True)

    service_date = models.DateField(blank=True, null=True)

    rc_book_number = models.CharField(max_length=100, blank=True, null=True)
    rc_document = models.FileField(upload_to='vehicles/rc_docs/', blank=True, null=True)

    is_leased = models.BooleanField(default=False)

    approval_status = models.CharField(max_length=20, choices=APPROVAL_STATUS_CHOICES, default='PENDING')

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.vehicle_name} ({self.vehicle_number})"
    

class VehicleLog(models.Model):
    ACTION_CHOICES = [
        ('CREATED', 'Created'),
        ('UPDATED', 'Updated'),
        ('DELETED', 'Deleted'),
    ]

    vehicle = models.ForeignKey('VehicleRegistration', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    remarks = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.vehicle.vehicle_number} - {self.action}"    

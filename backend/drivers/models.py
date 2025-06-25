from django.db import models
from django.conf import settings

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
    mobile = models.CharField(max_length=20)
    city = models.CharField(max_length=100)
    nationality = models.CharField(max_length=100, blank=True, null=True)
    dob = models.DateField(blank=True, null=True)

    # ForeignKey relationships
    vehicleType = models.ForeignKey(VehicleRegistration, on_delete=models.SET_NULL, null=True, blank=True)
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
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE)
    action = models.CharField(max_length=100)  # e.g., "Uploaded Document", "Updated Expiry"
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True)

    def __str__(self):
        return f"{self.driver.driver_name} - {self.action} at {self.timestamp}"
    
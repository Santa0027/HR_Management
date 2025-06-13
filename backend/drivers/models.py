from django.db import models
from django.contrib.auth.models import User

class Driver(models.Model):
    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    )

    # Step 1: Personal Information
    driver_name = models.CharField(max_length=100)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    iqama = models.CharField(max_length=20, unique=True)
    mobile = models.CharField(max_length=20)
    city = models.CharField(max_length=100)
    nationality = models.CharField(max_length=100)
    dob = models.DateField()

    # Step 2: Documents 
    iqama_document = models.FileField(upload_to='drivers/iqama/')
    iqama_expiry = models.DateField()

    passport_document = models.FileField(upload_to='drivers/passport/')
    passport_expiry = models.DateField()

    license_document = models.FileField(upload_to='drivers/license/')
    license_expiry = models.DateField()

    visa_document = models.FileField(upload_to='drivers/visa/')
    visa_expiry = models.DateField()

    medical_document = models.FileField(upload_to='drivers/medical/')
    medical_expiry = models.DateField()

    # Log & Audit Fields
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    submitted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='submitted_drivers')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_drivers')
    
    status = models.CharField(
        max_length=20,
        choices=(
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
            ('expired', 'Expired'),
        ),
        default='pending'
    )
    remarks = models.TextField(blank=True, help_text="Admin or HR remarks for approval, rejection, or additional notes")

    def __str__(self):
        return self.driver_name



class DriverLog(models.Model):
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE)
    action = models.CharField(max_length=100)  # e.g., "Uploaded Document", "Updated Expiry"
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True)

    def __str__(self):
        return f"{self.driver.driver_name} - {self.action} at {self.timestamp}"
    
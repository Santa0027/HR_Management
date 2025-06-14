from django.db import models

# Create your models here.
from django.db import models

class Company(models.Model):
    # Company Information
    company_name = models.CharField(max_length=255)
    registration_number = models.CharField(max_length=100, unique=True)
    gst_number = models.CharField(max_length=100, blank=True, null=True)

    address = models.TextField()
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)

    contact_person = models.CharField(max_length=100)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20)

    # Accounting Information
    bank_name = models.CharField(max_length=100)
    account_number = models.CharField(max_length=50)
    ifsc_code = models.CharField(max_length=20)
    swift_code = models.CharField(max_length=20, blank=True, null=True)

    commission_percentage = models.DecimalField(
        max_digits=5, decimal_places=2,
        help_text="Commission percentage the company charges (e.g., 10.50%)"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.company_name

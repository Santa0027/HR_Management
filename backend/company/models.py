from django.db import models
from django.core.exceptions import ValidationError

class Company(models.Model):
    COMMISSION_TYPE_CHOICES = [
        ('km', 'KM Based'),
        ('order', 'Order Based'),
        ('fixed', 'Fixed Commission'),
    ]

    # Step 1: Company Info
    company_name = models.CharField(max_length=255)
    registration_number = models.CharField(max_length=100, unique=True)
    gst_number = models.CharField(max_length=100, blank=True, null=True)

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
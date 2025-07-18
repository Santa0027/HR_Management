from django.contrib import admin
from .models import Company

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = [
        'company_name', 'registration_number', 'contact_person', 'contact_email',
        'car_commission_type', 'car_rate_per_km', 'car_fixed_commission',
        'bike_commission_type', 'bike_rate_per_km', 'bike_fixed_commission',
        'city', 'country'
    ]
    list_filter = [
        'car_commission_type', 'bike_commission_type',
        'country', 'city', 't_shirt', 'cap', 'helmet', 'safety_gear'
    ]
    search_fields = ['company_name', 'registration_number', 'contact_person', 'contact_email']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Company Information', {
            'fields': ('company_logo', 'company_name', 'registration_number', 'gst_number',
                      'website', 'description', 'established_date')
        }),
        ('Address Information', {
            'fields': ('address', 'city', 'country')
        }),
        ('Contact Information', {
            'fields': ('contact_person', 'contact_email', 'contact_phone')
        }),
        ('Banking Information', {
            'fields': ('bank_name', 'account_number', 'ifsc_code', 'swift_code', 'iban_code')
        }),
        ('Car Commission Settings', {
            'fields': ('car_commission_type', 'car_rate_per_km', 'car_min_km',
                      'car_rate_per_order', 'car_fixed_commission')
        }),
        ('Bike Commission Settings', {
            'fields': ('bike_commission_type', 'bike_rate_per_km', 'bike_min_km',
                      'bike_rate_per_order', 'bike_fixed_commission')
        }),
        ('Employee Accessories', {
            'fields': ('t_shirt', 'cap', 'jackets', 'bag', 'wristbands',
                      'water_bottle', 'safety_gear', 'helmet')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

from django.contrib import admin
from .models import Company, VehicleTariff, EmployeeAccessory, EmployeeAccessoryAssignment

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['company_name', 'registration_number', 'contact_person', 'contact_email', 'commission_type']
    list_filter = ['commission_type', 'country', 'city']
    search_fields = ['company_name', 'registration_number', 'contact_person', 'contact_email']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Company Information', {
            'fields': ('company_logo', 'company_name', 'registration_number', 'address', 'city', 'country')
        }),
        ('Contact Information', {
            'fields': ('contact_person', 'contact_email', 'contact_phone')
        }),
        ('Banking Information', {
            'fields': ('bank_name', 'account_number', 'ifsc_code', 'swift_code', 'iban_code')
        }),
        ('Commission Settings', {
            'fields': ('commission_type', 'rate_per_km', 'min_km', 'rate_per_order', 'fixed_commission')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(VehicleTariff)
class VehicleTariffAdmin(admin.ModelAdmin):
    list_display = ['company', 'vehicle_type', 'tariff_type', 'base_rate', 'effective_from', 'is_active']
    list_filter = ['vehicle_type', 'tariff_type', 'is_active', 'company']
    search_fields = ['company__company_name']
    date_hierarchy = 'effective_from'

    fieldsets = (
        ('Basic Information', {
            'fields': ('company', 'vehicle_type', 'tariff_type')
        }),
        ('Pricing', {
            'fields': ('base_rate', 'minimum_charge', 'waiting_charge_per_minute')
        }),
        ('Limits', {
            'fields': ('free_km_limit', 'free_time_limit')
        }),
        ('Additional Charges', {
            'fields': ('fuel_surcharge_percentage', 'night_charge_percentage', 'holiday_charge_percentage')
        }),
        ('Validity', {
            'fields': ('effective_from', 'effective_to', 'is_active')
        }),
    )


@admin.register(EmployeeAccessory)
class EmployeeAccessoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'company', 'cost_price', 'stock_quantity', 'is_low_stock', 'is_active']
    list_filter = ['category', 'is_mandatory', 'is_returnable', 'is_active', 'company']
    search_fields = ['name', 'brand', 'model']

    fieldsets = (
        ('Basic Information', {
            'fields': ('company', 'name', 'category', 'description')
        }),
        ('Specifications', {
            'fields': ('brand', 'model', 'color', 'size')
        }),
        ('Pricing', {
            'fields': ('cost_price', 'selling_price')
        }),
        ('Inventory', {
            'fields': ('stock_quantity', 'minimum_stock_level')
        }),
        ('Policies', {
            'fields': ('is_mandatory', 'is_returnable', 'replacement_period_months')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )

    def is_low_stock(self, obj):
        return obj.is_low_stock
    is_low_stock.boolean = True
    is_low_stock.short_description = 'Low Stock'


@admin.register(EmployeeAccessoryAssignment)
class EmployeeAccessoryAssignmentAdmin(admin.ModelAdmin):
    list_display = ['employee_name', 'accessory', 'assigned_date', 'status', 'security_deposit']
    list_filter = ['status', 'assigned_date', 'accessory__category']
    search_fields = ['employee_name', 'accessory__name']
    date_hierarchy = 'assigned_date'

    fieldsets = (
        ('Assignment Details', {
            'fields': ('employee_id', 'employee_name', 'accessory', 'assigned_by')
        }),
        ('Dates', {
            'fields': ('assigned_date', 'expected_return_date', 'actual_return_date')
        }),
        ('Status & Condition', {
            'fields': ('status', 'condition_when_assigned', 'condition_when_returned')
        }),
        ('Financial', {
            'fields': ('security_deposit', 'damage_charge')
        }),
        ('Notes', {
            'fields': ('assignment_notes', 'return_notes', 'returned_to')
        }),
    )

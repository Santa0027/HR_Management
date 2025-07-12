from django.contrib import admin
from django.utils.html import format_html
from .models import Driver, DriverLog, DriverAuth


@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ['driver_name', 'iqama', 'mobile', 'status', 'company', 'has_auth_credentials', 'created_at']
    list_filter = ['status', 'gender', 'company', 'created_at']
    search_fields = ['driver_name', 'iqama', 'mobile']
    readonly_fields = ['created_at']

    def has_auth_credentials(self, obj):
        """Check if driver has authentication credentials"""
        has_auth = hasattr(obj, 'auth_credentials')
        if has_auth:
            return format_html('<span style="color: green;">✓ Yes</span>')
        else:
            return format_html('<span style="color: red;">✗ No</span>')
    has_auth_credentials.short_description = 'Mobile Auth'


@admin.register(DriverAuth)
class DriverAuthAdmin(admin.ModelAdmin):
    list_display = [
        'driver_name', 'username', 'is_active', 'is_locked',
        'failed_attempts', 'last_login', 'account_status'
    ]
    list_filter = ['is_active', 'is_locked', 'created_at', 'last_login']
    search_fields = ['driver__driver_name', 'username', 'driver__iqama']
    readonly_fields = [
        'password_hash', 'failed_login_attempts', 'last_login',
        'last_failed_login', 'password_changed_at', 'last_login_device',
        'last_login_ip', 'created_at', 'updated_at'
    ]

    fieldsets = (
        ('Driver Information', {
            'fields': ('driver',)
        }),
        ('Authentication', {
            'fields': ('username', 'is_active')
        }),
        ('Security Status', {
            'fields': ('is_locked', 'failed_login_attempts', 'last_failed_login'),
            'classes': ('collapse',)
        }),
        ('Login History', {
            'fields': ('last_login', 'last_login_device', 'last_login_ip'),
            'classes': ('collapse',)
        }),
        ('System Information', {
            'fields': ('password_changed_at', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    actions = ['unlock_accounts', 'lock_accounts', 'activate_accounts', 'deactivate_accounts']

    def driver_name(self, obj):
        return obj.driver.driver_name
    driver_name.short_description = 'Driver Name'

    def failed_attempts(self, obj):
        if obj.failed_login_attempts > 0:
            return format_html(
                '<span style="color: red;">{}</span>',
                obj.failed_login_attempts
            )
        return obj.failed_login_attempts
    failed_attempts.short_description = 'Failed Attempts'

    def account_status(self, obj):
        if obj.is_locked:
            return format_html('<span style="color: red;">🔒 Locked</span>')
        elif not obj.is_active:
            return format_html('<span style="color: orange;">⏸️ Inactive</span>')
        elif obj.driver.status != 'approved':
            return format_html('<span style="color: orange;">⏳ Driver Not Approved</span>')
        else:
            return format_html('<span style="color: green;">✅ Active</span>')
    account_status.short_description = 'Status'

    def unlock_accounts(self, request, queryset):
        """Unlock selected accounts"""
        count = 0
        for auth in queryset:
            if auth.is_locked:
                auth.unlock_account()
                count += 1

        self.message_user(request, f'Successfully unlocked {count} accounts.')
    unlock_accounts.short_description = 'Unlock selected accounts'

    def lock_accounts(self, request, queryset):
        """Lock selected accounts"""
        count = 0
        for auth in queryset:
            if not auth.is_locked:
                auth.lock_account()
                count += 1

        self.message_user(request, f'Successfully locked {count} accounts.')
    lock_accounts.short_description = 'Lock selected accounts'

    def activate_accounts(self, request, queryset):
        """Activate selected accounts"""
        count = queryset.update(is_active=True)
        self.message_user(request, f'Successfully activated {count} accounts.')
    activate_accounts.short_description = 'Activate selected accounts'

    def deactivate_accounts(self, request, queryset):
        """Deactivate selected accounts"""
        count = queryset.update(is_active=False)
        self.message_user(request, f'Successfully deactivated {count} accounts.')
    deactivate_accounts.short_description = 'Deactivate selected accounts'


@admin.register(DriverLog)
class DriverLogAdmin(admin.ModelAdmin):
    list_display = ['driver', 'action', 'performed_by', 'timestamp']
    list_filter = ['action', 'timestamp', 'performed_by']
    search_fields = ['driver__driver_name', 'action', 'note']
    readonly_fields = ['timestamp']


# ==================== NEW DRIVER MODELS ADMIN ====================

from .models import NewDriverApplication, WorkingDriver

@admin.register(NewDriverApplication)
class NewDriverApplicationAdmin(admin.ModelAdmin):
    list_display = ['application_number', 'full_name', 'company', 'status', 'application_date', 'age']
    list_filter = ['status', 'company', 'vehicle_type', 'gender', 'nationality', 'application_date']
    search_fields = ['application_number', 'full_name', 'phone_number', 'nominee_name']
    readonly_fields = ['application_number', 'age', 'application_date', 'created_at', 'updated_at']
    date_hierarchy = 'application_date'

    fieldsets = (
        ('Application Info', {
            'fields': ('application_number', 'application_date', 'status', 'company')
        }),
        ('Personal Details', {
            'fields': ('full_name', 'gender', 'date_of_birth', 'age', 'nationality', 'city', 'apartment_area')
        }),
        ('Contact Information', {
            'fields': ('phone_number', 'home_country_address', 'home_country_phone')
        }),
        ('Physical Details', {
            'fields': ('marital_status', 'blood_group', 't_shirt_size', 'weight', 'height')
        }),
        ('Work Details', {
            'fields': ('vehicle_type', 'vehicle_destination', 'kuwait_entry_date')
        }),
        ('Nominee Information', {
            'fields': ('nominee_name', 'nominee_relationship', 'nominee_phone', 'nominee_address')
        }),
        ('Documents', {
            'fields': ('passport_document', 'visa_document', 'police_certificate', 'medical_certificate', 'passport_photo')
        }),
        ('Review', {
            'fields': ('review_notes', 'reviewed_by', 'reviewed_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    actions = ['approve_applications', 'reject_applications']

    def approve_applications(self, request, queryset):
        """Approve selected applications"""
        count = queryset.update(status='approved', reviewed_by=request.user.get_full_name())
        self.message_user(request, f'Successfully approved {count} applications.')
    approve_applications.short_description = 'Approve selected applications'

    def reject_applications(self, request, queryset):
        """Reject selected applications"""
        count = queryset.update(status='rejected', reviewed_by=request.user.get_full_name())
        self.message_user(request, f'Successfully rejected {count} applications.')
    reject_applications.short_description = 'Reject selected applications'


@admin.register(WorkingDriver)
class WorkingDriverAdmin(admin.ModelAdmin):
    list_display = ['employee_id', 'full_name', 'company', 'working_department', 'employment_status', 'vehicle_type', 'age']
    list_filter = ['employment_status', 'company', 'working_department', 'vehicle_type', 'gender', 'joining_date']
    search_fields = ['employee_id', 'full_name', 'phone_number', 'civil_id_number', 'license_number', 'vehicle_number']
    readonly_fields = ['age', 'total_trips', 'total_earnings', 'created_at', 'updated_at']
    date_hierarchy = 'joining_date'

    fieldsets = (
        ('Basic Information', {
            'fields': ('employee_id', 'full_name', 'gender', 'date_of_birth', 'nationality', 'phone_number')
        }),
        ('Vehicle Information', {
            'fields': ('vehicle_type', 'vehicle_model', 'vehicle_number', 'vehicle_expiry_date')
        }),
        ('Legal Documents', {
            'fields': ('civil_id_number', 'civil_id_expiry', 'license_number', 'license_expiry_date',
                      'health_card_number', 'health_card_expiry')
        }),
        ('Document Files', {
            'fields': ('civil_id_front', 'civil_id_back', 'license_front', 'license_back',
                      'vehicle_registration', 'vehicle_insurance', 'driver_photo', 'health_card_document')
        }),
        ('Vehicle Photos', {
            'fields': ('vehicle_photo_front', 'vehicle_photo_back', 'vehicle_photo_left', 'vehicle_photo_right')
        }),
        ('Employment', {
            'fields': ('company', 'working_department', 'employment_status', 'joining_date', 'created_by')
        }),
        ('Accessories & Uniform', {
            'fields': ('t_shirt_issued', 't_shirt_size', 'cap_issued', 'bag_issued', 'vest_issued',
                      'safety_equipment_issued', 'helmet_issued', 'cool_jacket_issued', 'water_bottle_issued')
        }),
        ('Performance', {
            'fields': ('total_trips', 'total_earnings', 'rating'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    actions = ['activate_drivers', 'suspend_drivers', 'issue_all_accessories']

    def activate_drivers(self, request, queryset):
        """Activate selected drivers"""
        count = queryset.update(employment_status='active')
        self.message_user(request, f'Successfully activated {count} drivers.')
    activate_drivers.short_description = 'Activate selected drivers'

    def suspend_drivers(self, request, queryset):
        """Suspend selected drivers"""
        count = queryset.update(employment_status='suspended')
        self.message_user(request, f'Successfully suspended {count} drivers.')
    suspend_drivers.short_description = 'Suspend selected drivers'

    def issue_all_accessories(self, request, queryset):
        """Mark all accessories as issued for selected drivers"""
        count = 0
        for driver in queryset:
            driver.t_shirt_issued = True
            driver.cap_issued = True
            driver.bag_issued = True
            driver.vest_issued = True
            driver.safety_equipment_issued = True
            driver.helmet_issued = True
            driver.cool_jacket_issued = True
            driver.water_bottle_issued = True
            driver.save()
            count += 1
        self.message_user(request, f'Successfully issued all accessories to {count} drivers.')
    issue_all_accessories.short_description = 'Issue all accessories to selected drivers'

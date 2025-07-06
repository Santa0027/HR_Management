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

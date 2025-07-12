from django.contrib import admin
from .models import Trip, TripExpense, DriverEarningsSummary

@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('trip_id', 'driver', 'trip_type', 'status', 'total_fare', 'created_at')
    search_fields = ('trip_id', 'driver__name', 'customer_name')
    list_filter = ('trip_type', 'status', 'payment_method', 'created_at')


@admin.register(TripExpense)
class TripExpenseAdmin(admin.ModelAdmin):
    list_display = ('trip', 'expense_type', 'amount', 'is_reimbursable', 'is_reimbursed')


@admin.register(DriverEarningsSummary)
class DriverEarningsSummaryAdmin(admin.ModelAdmin):
    list_display = ('driver', 'period_type', 'period_start', 'total_fare', 'net_earnings')

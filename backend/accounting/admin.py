from django.contrib import admin
from .models import Transaction, Income, Expense


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['reference_number', 'transaction_type', 'amount', 'created_at', 'created_by']
    list_filter = ['transaction_type', 'created_at']
    search_fields = ['reference_number', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Income)
class IncomeAdmin(admin.ModelAdmin):
    list_display = ['reference_number', 'source', 'amount', 'driver', 'created_at']
    list_filter = ['source', 'created_at']
    search_fields = ['reference_number', 'description', 'driver__name']
    readonly_fields = ['created_at']


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ['category', 'amount', 'vendor', 'created_at', 'created_by']
    list_filter = ['category', 'created_at']
    search_fields = ['description', 'vendor', 'receipt_number']
    readonly_fields = ['created_at']

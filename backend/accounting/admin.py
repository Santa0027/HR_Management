from django.contrib import admin
from django.utils.html import format_html
from .models import (
    AccountingCategory, PaymentMethod, BankAccount, Transaction,
    Income, Expense, DriverPayroll, Budget, FinancialReport, RecurringTransaction
)


@admin.register(AccountingCategory)
class AccountingCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'category_type', 'is_active', 'created_at']
    list_filter = ['category_type', 'is_active']
    search_fields = ['name', 'description']
    ordering = ['category_type', 'name']


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'description']


@admin.register(BankAccount)
class BankAccountAdmin(admin.ModelAdmin):
    list_display = ['account_name', 'bank_name', 'account_number', 'account_type', 'balance', 'currency', 'is_active']
    list_filter = ['account_type', 'currency', 'is_active', 'company']
    search_fields = ['account_name', 'bank_name', 'account_number']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = [
        'transaction_id', 'transaction_type', 'amount', 'currency',
        'status', 'transaction_date', 'category', 'company', 'driver'
    ]
    list_filter = [
        'transaction_type', 'status', 'currency', 'category',
        'payment_method', 'company', 'transaction_date'
    ]
    search_fields = ['transaction_id', 'description', 'reference_number']
    readonly_fields = ['transaction_id', 'created_at', 'updated_at']
    date_hierarchy = 'transaction_date'
    ordering = ['-transaction_date']

    fieldsets = (
        ('Transaction Details', {
            'fields': ('transaction_id', 'transaction_type', 'amount', 'currency', 'description', 'status')
        }),
        ('Classification', {
            'fields': ('category', 'payment_method', 'bank_account')
        }),
        ('Relationships', {
            'fields': ('company', 'driver')
        }),
        ('Additional Info', {
            'fields': ('reference_number', 'notes', 'receipt_document')
        }),
        ('Approval', {
            'fields': ('created_by', 'approved_by')
        }),
        ('Timestamps', {
            'fields': ('transaction_date', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


class IncomeInline(admin.StackedInline):
    model = Income
    extra = 0


class ExpenseInline(admin.StackedInline):
    model = Expense
    extra = 0


@admin.register(Income)
class IncomeAdmin(admin.ModelAdmin):
    list_display = [
        'transaction', 'income_source', 'net_amount', 'tax_amount',
        'is_recurring', 'due_date'
    ]
    list_filter = ['income_source', 'is_recurring', 'recurring_frequency']
    search_fields = ['transaction__transaction_id', 'transaction__description', 'invoice_number']
    readonly_fields = ['net_amount']


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = [
        'transaction', 'expense_type', 'vendor_name', 'tax_amount',
        'approval_status', 'requires_approval', 'due_date'
    ]
    list_filter = [
        'expense_type', 'approval_status', 'requires_approval',
        'is_recurring', 'recurring_frequency'
    ]
    search_fields = ['transaction__transaction_id', 'transaction__description', 'vendor_name', 'bill_number']
    readonly_fields = ['approved_at']

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('transaction')


@admin.register(DriverPayroll)
class DriverPayrollAdmin(admin.ModelAdmin):
    list_display = [
        'driver', 'company', 'pay_period_start', 'pay_period_end',
        'gross_salary', 'total_deductions', 'net_salary', 'status'
    ]
    list_filter = ['status', 'company', 'pay_date']
    search_fields = ['driver__driver_name', 'company__company_name']
    readonly_fields = ['gross_salary', 'total_deductions', 'net_salary', 'created_at', 'updated_at']
    date_hierarchy = 'pay_date'

    fieldsets = (
        ('Basic Info', {
            'fields': ('driver', 'company', 'pay_period_start', 'pay_period_end', 'pay_date', 'status')
        }),
        ('Salary Components', {
            'fields': ('base_salary', 'overtime_hours', 'overtime_rate', 'overtime_amount', 'allowances', 'bonuses')
        }),
        ('Deductions', {
            'fields': (
                'attendance_deductions', 'insurance_deduction',
                'accommodation_deduction', 'phone_bill_deduction', 'other_deductions'
            )
        }),
        ('Calculated Totals', {
            'fields': ('gross_salary', 'total_deductions', 'net_salary'),
            'classes': ('collapse',)
        }),
        ('Additional Info', {
            'fields': ('transaction', 'notes', 'created_by'),
            'classes': ('collapse',)
        })
    )


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'budget_period_start', 'budget_period_end',
        'total_budget', 'actual_income', 'actual_expense', 'variance', 'status'
    ]
    list_filter = ['status', 'company', 'category']
    search_fields = ['name', 'description']
    readonly_fields = ['actual_income', 'actual_expense', 'variance', 'created_at', 'updated_at']
    date_hierarchy = 'budget_period_start'

    actions = ['calculate_actuals']

    def calculate_actuals(self, request, queryset):
        for budget in queryset:
            budget.calculate_actuals()
        self.message_user(request, f"Calculated actuals for {queryset.count()} budgets.")
    calculate_actuals.short_description = "Calculate actual amounts"


@admin.register(FinancialReport)
class FinancialReportAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'report_type', 'period_start', 'period_end',
        'company', 'generated_by', 'generated_at'
    ]
    list_filter = ['report_type', 'company', 'generated_at']
    search_fields = ['title', 'description']
    readonly_fields = ['generated_at']
    date_hierarchy = 'generated_at'


@admin.register(RecurringTransaction)
class RecurringTransactionAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'transaction_type', 'amount', 'frequency',
        'next_execution_date', 'is_active', 'execution_count'
    ]
    list_filter = [
        'transaction_type', 'frequency', 'is_active',
        'category', 'company'
    ]
    search_fields = ['name', 'description']
    readonly_fields = ['last_executed', 'execution_count', 'created_at', 'updated_at']
    date_hierarchy = 'next_execution_date'

    actions = ['execute_transactions']

    def execute_transactions(self, request, queryset):
        executed_count = 0
        for recurring_transaction in queryset.filter(is_active=True):
            try:
                recurring_transaction.create_transaction()
                executed_count += 1
            except Exception as e:
                self.message_user(request, f"Error executing {recurring_transaction.name}: {str(e)}", level='ERROR')

        if executed_count > 0:
            self.message_user(request, f"Successfully executed {executed_count} recurring transactions.")
    execute_transactions.short_description = "Execute selected recurring transactions"

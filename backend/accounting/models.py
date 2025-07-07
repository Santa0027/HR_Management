from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator
from decimal import Decimal
from company.models import Company
from drivers.models import Driver
import uuid


class AccountingCategory(models.Model):
    """Categories for organizing income and expenses"""
    CATEGORY_TYPE_CHOICES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    category_type = models.CharField(max_length=10, choices=CATEGORY_TYPE_CHOICES)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Accounting Category"
        verbose_name_plural = "Accounting Categories"
        ordering = ['category_type', 'name']

    def __str__(self):
        return f"{self.name} ({self.get_category_type_display()})"


class PaymentMethod(models.Model):
    """Payment methods for transactions"""
    name = models.CharField(max_length=50, unique=True)  # Cash, Bank Transfer, Credit Card, etc.
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class BankAccount(models.Model):
    """Company bank accounts for tracking financial transactions"""
    account_name = models.CharField(max_length=100)
    bank_name = models.CharField(max_length=100)
    account_number = models.CharField(max_length=50, unique=True)
    account_type = models.CharField(max_length=20, choices=[
        ('checking', 'Checking'),
        ('savings', 'Savings'),
        ('business', 'Business'),
    ])
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    currency = models.CharField(max_length=3, default='USD')
    is_active = models.BooleanField(default=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='bank_accounts', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['bank_name', 'account_name']

    def __str__(self):
        return f"{self.bank_name} - {self.account_name} ({self.account_number})"


class Transaction(models.Model):
    """Base model for all financial transactions"""
    TRANSACTION_TYPE_CHOICES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
        # Add other transaction types if needed, e.g., ('transfer', 'Transfer')
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('failed', 'Failed'),
    ]

    transaction_id = models.CharField(max_length=50, unique=True, editable=False)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    currency = models.CharField(max_length=3, default='USD')
    description = models.TextField()
    transaction_date = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    # Relationships
    category = models.ForeignKey(AccountingCategory, on_delete=models.PROTECT, related_name='transactions')
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.PROTECT, related_name='transactions')
    bank_account = models.ForeignKey(BankAccount, on_delete=models.PROTECT, related_name='transactions', null=True, blank=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='transactions', null=True, blank=True)
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='transactions', null=True, blank=True)

    # Metadata
    reference_number = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    receipt_document = models.FileField(upload_to='accounting/receipts/', null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_transactions')
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_transactions')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-transaction_date', '-created_at']
        indexes = [
            models.Index(fields=['transaction_date']),
            models.Index(fields=['transaction_type']),
            models.Index(fields=['status']),
            models.Index(fields=['company']),
            models.Index(fields=['driver']),
        ]

    def save(self, *args, **kwargs):
        if not self.transaction_id:
            import uuid
            self.transaction_id = f"TXN-{timezone.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.transaction_id} - {self.get_transaction_type_display()} - {self.amount} {self.currency}"

class Income(models.Model):
    """Specific income tracking model"""
    INCOME_SOURCE_CHOICES = [
        ('driver_commission', 'Driver Commission'),
        ('company_payment', 'Company Payment'),
        ('vehicle_rental', 'Vehicle Rental'),
        ('service_fee', 'Service Fee'),
        ('penalty_collection', 'Penalty Collection'),
        ('other', 'Other'),
    ]

    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, related_name='income_detail')
    income_source = models.CharField(max_length=50, choices=INCOME_SOURCE_CHOICES) # Adjusted max_length
    invoice_number = models.CharField(max_length=100, blank=True, null=True)
    due_date = models.DateField(null=True, blank=True)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    net_amount = models.DecimalField(max_digits=15, decimal_places=2, editable=False)

    # For recurring income
    is_recurring = models.BooleanField(default=False)
    recurring_frequency = models.CharField(max_length=10, choices=[
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
    ], blank=True, null=True)
    next_due_date = models.DateField(null=True, blank=True)

    # Standard audit fields
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='incomes_created'
    )
    updated_at = models.DateTimeField(auto_now=True) # Added updated_at

    class Meta:
        ordering = ['-transaction__transaction_date']

    def save(self, *args, **kwargs):
        # Calculate net amount (gross - tax)
        if self.transaction and self.transaction.amount is not None:
            self.net_amount = self.transaction.amount - self.tax_amount
        else:
            self.net_amount = 0.00 # Default or handle error if transaction is not yet linked or amount is None
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Income: {self.transaction.transaction_id if self.transaction else 'N/A'} - {self.get_income_source_display()}"


class Expense(models.Model):
    """Specific expense tracking model"""
    EXPENSE_TYPE_CHOICES = [
        ('driver_salary', 'Driver Salary'),
        ('driver_allowance', 'Driver Allowance'),
        ('vehicle_maintenance', 'Vehicle Maintenance'),
        ('fuel', 'Fuel'),
        ('insurance', 'Insurance'),
        ('accommodation', 'Accommodation'),
        ('phone_bill', 'Phone Bill'),
        ('office_rent', 'Office Rent'),
        ('utilities', 'Utilities'),
        ('marketing', 'Marketing'),
        ('legal_fees', 'Legal Fees'),
        ('other', 'Other'),
    ]

    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, related_name='expense_detail')
    expense_type = models.CharField(max_length=20, choices=EXPENSE_TYPE_CHOICES)
    vendor_name = models.CharField(max_length=100, blank=True, null=True)
    bill_number = models.CharField(max_length=50, blank=True, null=True)
    due_date = models.DateField(null=True, blank=True)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    # For recurring expenses
    is_recurring = models.BooleanField(default=False)
    recurring_frequency = models.CharField(max_length=10, choices=[
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
    ], blank=True, null=True)
    next_due_date = models.DateField(null=True, blank=True)

    # Approval workflow
    requires_approval = models.BooleanField(default=False)
    approval_status = models.CharField(max_length=10, choices=[
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ], default='pending')
    approved_at = models.DateTimeField(null=True, blank=True)

    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='expenses_created')


    class Meta:
        ordering = ['-transaction__transaction_date']

    def __str__(self):
        return f"Expense: {self.transaction.transaction_id} - {self.get_expense_type_display()}"


class DriverPayroll(models.Model):
    """Driver payroll and salary management"""
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='payroll_records')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='driver_payrolls')

    # Payroll period
    pay_period_start = models.DateField()
    pay_period_end = models.DateField()
    pay_date = models.DateField(default=timezone.now)

    # Salary components
    base_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    overtime_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    overtime_rate = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    overtime_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    allowances = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    bonuses = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    # Deductions
    attendance_deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    insurance_deduction = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    accommodation_deduction = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    phone_bill_deduction = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    other_deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    # Calculated fields
    gross_salary = models.DecimalField(max_digits=10, decimal_places=2, editable=False)
    total_deductions = models.DecimalField(max_digits=10, decimal_places=2, editable=False)
    net_salary = models.DecimalField(max_digits=10, decimal_places=2, editable=False)

    # Status and metadata
    status = models.CharField(max_length=10, choices=[
        ('draft', 'Draft'),
        ('processed', 'Processed'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ], default='draft')

    transaction = models.OneToOneField(Transaction, on_delete=models.SET_NULL, null=True, blank=True, related_name='payroll_record')
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('driver', 'pay_period_start', 'pay_period_end')
        ordering = ['-pay_date', 'driver__driver_name']

    def save(self, *args, **kwargs):
        # Calculate overtime amount
        self.overtime_amount = self.overtime_hours * self.overtime_rate

        # Calculate gross salary
        self.gross_salary = (
            self.base_salary +
            self.overtime_amount +
            self.allowances +
            self.bonuses
        )

        # Calculate total deductions
        self.total_deductions = (
            self.attendance_deductions +
            self.insurance_deduction +
            self.accommodation_deduction +
            self.phone_bill_deduction +
            self.other_deductions
        )

        # Calculate net salary
        self.net_salary = self.gross_salary - self.total_deductions

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Payroll: {self.driver.driver_name} - {self.pay_period_start} to {self.pay_period_end}"


class Budget(models.Model):
    """Budget planning and tracking"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    budget_period_start = models.DateField()
    budget_period_end = models.DateField()

    # Budget amounts
    total_budget = models.DecimalField(max_digits=15, decimal_places=2)
    income_budget = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    expense_budget = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)

    # Actual amounts (calculated)
    actual_income = models.DecimalField(max_digits=15, decimal_places=2, default=0.00, editable=False)
    actual_expense = models.DecimalField(max_digits=15, decimal_places=2, default=0.00, editable=False)
    variance = models.DecimalField(max_digits=15, decimal_places=2, default=0.00, editable=False)

    # Relationships
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='budgets', null=True, blank=True)
    category = models.ForeignKey(AccountingCategory, on_delete=models.PROTECT, related_name='budgets', null=True, blank=True)

    # Status
    status = models.CharField(max_length=10, choices=[
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ], default='draft')

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-budget_period_start']

    def calculate_actuals(self):
        """Calculate actual income and expenses for the budget period"""
        from django.db.models import Sum

        # Get transactions within budget period
        transactions = Transaction.objects.filter(
            transaction_date__date__gte=self.budget_period_start,
            transaction_date__date__lte=self.budget_period_end,
            status='completed'
        )

        if self.company:
            transactions = transactions.filter(company=self.company)

        if self.category:
            transactions = transactions.filter(category=self.category)

        # Calculate actual income
        income_sum = transactions.filter(transaction_type='income').aggregate(
            total=Sum('amount')
        )['total'] or 0

        # Calculate actual expenses
        expense_sum = transactions.filter(transaction_type='expense').aggregate(
            total=Sum('amount')
        )['total'] or 0

        self.actual_income = income_sum
        self.actual_expense = expense_sum
        self.variance = (self.actual_income - self.actual_expense) - (self.income_budget - self.expense_budget)
        self.save()

    def __str__(self):
        return f"Budget: {self.name} ({self.budget_period_start} - {self.budget_period_end})"


class FinancialReport(models.Model):
    """Generated financial reports"""
    REPORT_TYPE_CHOICES = [
        ('income_statement', 'Income Statement'),
        ('expense_report', 'Expense Report'),
        ('cash_flow', 'Cash Flow Statement'),
        ('budget_variance', 'Budget Variance Report'),
        ('driver_payroll', 'Driver Payroll Report'),
        ('company_commission', 'Company Commission Report'),
    ]

    report_type = models.CharField(max_length=20, choices=REPORT_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)

    # Report period
    period_start = models.DateField()
    period_end = models.DateField()

    # Filters applied
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='financial_reports', null=True, blank=True)
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='financial_reports', null=True, blank=True)
    category = models.ForeignKey(AccountingCategory, on_delete=models.PROTECT, related_name='financial_reports', null=True, blank=True)

    # Report data (stored as JSON)
    report_data = models.JSONField(default=dict)

    # File generation
    report_file = models.FileField(upload_to='accounting/reports/', null=True, blank=True)

    # Metadata
    generated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-generated_at']

    def __str__(self):
        return f"{self.get_report_type_display()}: {self.title} ({self.period_start} - {self.period_end})"


class RecurringTransaction(models.Model):
    """Template for recurring transactions"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    # Transaction template data
    transaction_type = models.CharField(max_length=10, choices=Transaction.TRANSACTION_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    category = models.ForeignKey(AccountingCategory, on_delete=models.PROTECT, related_name='recurring_transactions')
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.PROTECT, related_name='recurring_transactions')
    bank_account = models.ForeignKey(BankAccount, on_delete=models.PROTECT, related_name='recurring_transactions', null=True, blank=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='recurring_transactions', null=True, blank=True)
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='recurring_transactions', null=True, blank=True)

    # Recurrence settings
    frequency = models.CharField(max_length=10, choices=[
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
    ])
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    next_execution_date = models.DateField()

    # Status
    is_active = models.BooleanField(default=True)
    last_executed = models.DateTimeField(null=True, blank=True)
    execution_count = models.IntegerField(default=0)

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['next_execution_date']

    def create_transaction(self):
        """Create a new transaction based on this template"""
        transaction = Transaction.objects.create(
            transaction_type=self.transaction_type,
            amount=self.amount,
            description=f"Recurring: {self.description or self.name}",
            category=self.category,
            payment_method=self.payment_method,
            bank_account=self.bank_account,
            company=self.company,
            driver=self.driver,
            created_by=self.created_by,
        )

        # Update execution tracking
        self.last_executed = timezone.now()
        self.execution_count += 1

        # Calculate next execution date
        from dateutil.relativedelta import relativedelta
        if self.frequency == 'daily':
            self.next_execution_date += timezone.timedelta(days=1)
        elif self.frequency == 'weekly':
            self.next_execution_date += timezone.timedelta(weeks=1)
        elif self.frequency == 'monthly':
            self.next_execution_date += relativedelta(months=1)
        elif self.frequency == 'quarterly':
            self.next_execution_date += relativedelta(months=3)
        elif self.frequency == 'yearly':
            self.next_execution_date += relativedelta(years=1)

        # Check if we should deactivate
        if self.end_date and self.next_execution_date > self.end_date:
            self.is_active = False

        self.save()
        return transaction

    def __str__(self):
        return f"Recurring: {self.name} ({self.get_frequency_display()})"


class Trip(models.Model):
    """Trip model for driver trip management"""
    TRIP_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    TRIP_TYPE_CHOICES = [
        ('regular', 'Regular'),
        ('airport', 'Airport'),
        ('intercity', 'Intercity'),
        ('hourly', 'Hourly'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]

    # Basic trip information
    trip_id = models.CharField(max_length=50, unique=True, editable=False)
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='accounting_trips')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='trips', null=True, blank=True)

    # Customer information
    customer_name = models.CharField(max_length=100)
    customer_phone = models.CharField(max_length=20, blank=True, null=True)

    # Trip details
    trip_type = models.CharField(max_length=20, choices=TRIP_TYPE_CHOICES, default='regular')
    pickup_location = models.CharField(max_length=255)
    pickup_latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    pickup_longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    pickup_time = models.DateTimeField(null=True, blank=True)

    dropoff_location = models.CharField(max_length=255)
    dropoff_latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    dropoff_longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    dropoff_time = models.DateTimeField(null=True, blank=True)

    # Trip metrics
    distance_km = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    duration_minutes = models.IntegerField(default=0)
    waiting_time_minutes = models.IntegerField(default=0)

    # Financial information
    base_fare = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    distance_fare = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    time_fare = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    waiting_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    surge_multiplier = models.DecimalField(max_digits=4, decimal_places=2, default=1.00)
    total_fare = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tip_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    toll_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    parking_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    additional_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    # Commission and earnings
    platform_commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    platform_commission_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    driver_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    # Payment information
    payment_method = models.CharField(max_length=50, default='cash')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_reference = models.CharField(max_length=100, blank=True, null=True)

    # Status and tracking
    status = models.CharField(max_length=20, choices=TRIP_STATUS_CHOICES, default='pending')
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(blank=True, null=True)

    # Additional information
    notes = models.TextField(blank=True, null=True)
    driver_rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    customer_feedback = models.TextField(blank=True, null=True)

    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['driver', 'status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['payment_status']),
        ]

    def save(self, *args, **kwargs):
        if not self.trip_id:
            self.trip_id = f"TRIP-{timezone.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"

        # Ensure all financial fields are Decimal and not None
        from decimal import Decimal

        self.base_fare = Decimal(str(self.base_fare or 0))
        self.distance_fare = Decimal(str(self.distance_fare or 0))
        self.time_fare = Decimal(str(self.time_fare or 0))
        self.waiting_charges = Decimal(str(self.waiting_charges or 0))
        self.tip_amount = Decimal(str(self.tip_amount or 0))
        self.toll_charges = Decimal(str(self.toll_charges or 0))
        self.parking_charges = Decimal(str(self.parking_charges or 0))
        self.additional_charges = Decimal(str(self.additional_charges or 0))
        self.surge_multiplier = Decimal(str(self.surge_multiplier or 1))
        self.platform_commission_rate = Decimal(str(self.platform_commission_rate or 0))

        # Calculate total earnings
        self.total_earnings = (
            self.base_fare + self.distance_fare + self.time_fare +
            self.waiting_charges + self.tip_amount + self.toll_charges +
            self.parking_charges + self.additional_charges
        ) * self.surge_multiplier

        # Calculate platform commission
        self.platform_commission_amount = self.total_earnings * (self.platform_commission_rate / Decimal('100'))

        # Calculate driver earnings
        self.driver_earnings = self.total_earnings - self.platform_commission_amount

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.trip_id} - {self.driver.driver_name} - {self.pickup_location} to {self.dropoff_location}"

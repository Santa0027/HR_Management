from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Transaction(models.Model):
    """Base transaction model"""
    TRANSACTION_TYPES = (
        ('income', 'Income'),
        ('expense', 'Expense'),
    )
    
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    reference_number = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    class Meta:
        db_table = 'accounting_transaction'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.transaction_type.title()} - {self.amount} - {self.reference_number}"


class Income(models.Model):
    """Income tracking model"""
    INCOME_SOURCES = (
        ('trip_commission', 'Trip Commission'),
        ('subscription_fee', 'Subscription Fee'),
        ('penalty_fee', 'Penalty Fee'),
        ('other', 'Other'),
    )
    
    source = models.CharField(max_length=20, choices=INCOME_SOURCES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    driver = models.ForeignKey('drivers.Driver', on_delete=models.CASCADE, null=True, blank=True)
    reference_number = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    class Meta:
        db_table = 'accounting_income'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.source} - {self.amount}"


class Expense(models.Model):
    """Expense tracking model"""
    EXPENSE_CATEGORIES = (
        ('operational', 'Operational'),
        ('maintenance', 'Maintenance'),
        ('marketing', 'Marketing'),
        ('administrative', 'Administrative'),
        ('other', 'Other'),
    )
    
    category = models.CharField(max_length=20, choices=EXPENSE_CATEGORIES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    vendor = models.CharField(max_length=200, blank=True)
    receipt_number = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    class Meta:
        db_table = 'accounting_expense'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.category} - {self.amount}"

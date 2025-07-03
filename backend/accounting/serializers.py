from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction as db_transaction
from .models import (
    AccountingCategory, PaymentMethod, BankAccount, Transaction,
    Income, Expense, DriverPayroll, Budget, FinancialReport, RecurringTransaction
)
from company.models import Company
from drivers.models import Driver

User = get_user_model()


class AccountingCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountingCategory
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = '__all__'
        read_only_fields = ('created_at',)


class BankAccountSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    
    class Meta:
        model = BankAccount
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

# /home/ubuntu/app/HR_Management/backend/hr/serializers.py


class SimpleDriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = ['id', 'driver_name'] # Or whatever name field your Driver model has

class SimpleCompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'company_name'] # Or whatever name field your Company model has


# --- Transaction Serializer (Nested within IncomeSerializer) ---
# This serializer needs to handle the fields within newIncome.transaction_data
class TransactionSerializer(serializers.ModelSerializer):
    # For display purposes (read-only nested objects)
    category_name = serializers.CharField(source='category.name', read_only=True)
    payment_method_name = serializers.CharField(source='payment_method.name', read_only=True)
    bank_account_name = serializers.CharField(source='bank_account.account_name', read_only=True)
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    driver_name = serializers.CharField(source='driver.driver_name', read_only=True)

    # For writing (expecting IDs from the frontend)
    category = serializers.PrimaryKeyRelatedField(
        queryset=AccountingCategory.objects.filter(category_type='income'), # Filter for income categories
        write_only=True
    )
    payment_method = serializers.PrimaryKeyRelatedField(
        queryset=PaymentMethod.objects.all(),
        write_only=True
    )
    bank_account = serializers.PrimaryKeyRelatedField(
        queryset=BankAccount.objects.all(),
        write_only=True,
        required=False, allow_null=True # Make optional if bank_account is not always required
    )
    company = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(),
        write_only=True,
        required=False, allow_null=True
    )
    driver = serializers.PrimaryKeyRelatedField(
        queryset=Driver.objects.all(),
        write_only=True,
        required=False, allow_null=True
    )

    class Meta:
        model = Transaction
        fields = [
            'id', 'transaction_id', 'amount', 'description', 'transaction_date', 'status',
            'category', 'category_name', 'payment_method', 'payment_method_name',
            'bank_account', 'bank_account_name', 'company', 'company_name',
            'driver', 'driver_name', 'reference_number', 'created_at', 'updated_at'
        ]
        read_only_fields = ['transaction_id', 'created_at', 'updated_at']


# --- Income Serializer ---
# This serializer will create/update an Income record AND its associated Transaction record.
class IncomeSerializer(serializers.ModelSerializer):
    # Use the TransactionSerializer to handle the nested 'transaction_data' from the frontend
    transaction = TransactionSerializer() # This creates a nested writable field

    class Meta:
        model = Income
        fields = [
            'id', 'transaction', 'income_source', 'invoice_number',
            'due_date', 'tax_amount', 'net_amount',
            'is_recurring', 'recurring_frequency', 'next_due_date',
            'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = ['net_amount', 'created_at', 'updated_at', 'created_by']

    def create(self, validated_data):
        # Pop the nested transaction data
        transaction_data = validated_data.pop('transaction')
        created_by = self.context['request'].user # Get user from request context

        # 1. Create the Transaction instance first
        transaction_serializer = TransactionSerializer(data=transaction_data, context=self.context)
        transaction_serializer.is_valid(raise_exception=True)
        transaction_instance = transaction_serializer.save(
            transaction_type='income', # Always 'income' for this context
            created_by=created_by
        )

        # 2. Create the Income instance, linking it to the newly created Transaction
        income_instance = Income.objects.create(
            transaction=transaction_instance,
            created_by=created_by,
            **validated_data
        )

        return income_instance

    def update(self, instance, validated_data):
        # Handle updating the nested Transaction data
        transaction_data = validated_data.pop('transaction', {})
        transaction_instance = instance.transaction

        # Update the Transaction instance
        transaction_serializer = TransactionSerializer(
            transaction_instance,
            data=transaction_data,
            partial=True, # Allow partial updates
            context=self.context
        )
        transaction_serializer.is_valid(raise_exception=True)
        transaction_serializer.save() # Save the updated transaction

        # Update the Income instance's direct fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class ExpenseSerializer(serializers.ModelSerializer):
    transaction = TransactionSerializer(read_only=True)
    transaction_data = serializers.DictField(write_only=True)

    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ('approved_at',)

    @db_transaction.atomic
    def create(self, validated_data):
        transaction_data = validated_data.pop('transaction_data')
        transaction_data['transaction_type'] = 'expense'

        # Create transaction first
        transaction_serializer = TransactionSerializer(data=transaction_data)
        if transaction_serializer.is_valid():
            transaction_obj = transaction_serializer.save()
        else:
            raise serializers.ValidationError(transaction_serializer.errors)

        # Create expense record
        expense = Expense.objects.create(transaction=transaction_obj, **validated_data)
        return expense

    @db_transaction.atomic
    def update(self, instance, validated_data):
        transaction_data = validated_data.pop('transaction_data', None)

        if transaction_data:
            transaction_serializer = TransactionSerializer(
                instance.transaction,
                data=transaction_data,
                partial=True
            )
            if transaction_serializer.is_valid():
                transaction_serializer.save()
            else:
                raise serializers.ValidationError(transaction_serializer.errors)

        # Update expense record
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class DriverPayrollSerializer(serializers.ModelSerializer):
    driver_name = serializers.CharField(source='driver.driver_name', read_only=True)
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    transaction_id = serializers.CharField(source='transaction.transaction_id', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = DriverPayroll
        fields = '__all__'
        read_only_fields = (
            'gross_salary', 'total_deductions', 'net_salary', 
            'created_at', 'updated_at'
        )
    
    def validate(self, data):
        # Ensure pay period is valid
        if data.get('pay_period_start') and data.get('pay_period_end'):
            if data['pay_period_start'] >= data['pay_period_end']:
                raise serializers.ValidationError(
                    "Pay period start date must be before end date"
                )
        return data


class BudgetSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Budget
        fields = '__all__'
        read_only_fields = (
            'actual_income', 'actual_expense', 'variance',
            'created_at', 'updated_at'
        )
    
    def validate(self, data):
        # Ensure budget period is valid
        if data.get('budget_period_start') and data.get('budget_period_end'):
            if data['budget_period_start'] >= data['budget_period_end']:
                raise serializers.ValidationError(
                    "Budget period start date must be before end date"
                )
        return data


class FinancialReportSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    driver_name = serializers.CharField(source='driver.driver_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    generated_by_name = serializers.CharField(source='generated_by.username', read_only=True)
    
    class Meta:
        model = FinancialReport
        fields = '__all__'
        read_only_fields = ('generated_at',)


class RecurringTransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    payment_method_name = serializers.CharField(source='payment_method.name', read_only=True)
    bank_account_name = serializers.CharField(source='bank_account.account_name', read_only=True)
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    driver_name = serializers.CharField(source='driver.driver_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = RecurringTransaction
        fields = '__all__'
        read_only_fields = (
            'last_executed', 'execution_count', 'created_at', 'updated_at'
        )
    
    def validate(self, data):
        # Ensure start date is before end date
        if data.get('start_date') and data.get('end_date'):
            if data['start_date'] >= data['end_date']:
                raise serializers.ValidationError(
                    "Start date must be before end date"
                )
        
        # Ensure category type matches transaction type
        if data.get('category') and data.get('transaction_type'):
            if data['category'].category_type != data['transaction_type']:
                raise serializers.ValidationError(
                    f"Category type '{data['category'].category_type}' doesn't match transaction type '{data['transaction_type']}'"
                )
        return data


# Summary serializers for dashboard/reporting
class TransactionSummarySerializer(serializers.Serializer):
    total_income = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_expense = serializers.DecimalField(max_digits=15, decimal_places=2)
    net_profit = serializers.DecimalField(max_digits=15, decimal_places=2)
    transaction_count = serializers.IntegerField()
    period_start = serializers.DateField()
    period_end = serializers.DateField()


class CategorySummarySerializer(serializers.Serializer):
    category_name = serializers.CharField()
    category_type = serializers.CharField()
    total_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    transaction_count = serializers.IntegerField()


class DriverPayrollSummarySerializer(serializers.Serializer):
    driver_name = serializers.CharField()
    total_gross_salary = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_deductions = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_net_salary = serializers.DecimalField(max_digits=15, decimal_places=2)
    payroll_count = serializers.IntegerField()

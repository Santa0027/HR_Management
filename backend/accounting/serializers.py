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


class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    payment_method_name = serializers.CharField(source='payment_method.name', read_only=True)
    bank_account_name = serializers.CharField(source='bank_account.account_name', read_only=True)
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    driver_name = serializers.CharField(source='driver.driver_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.username', read_only=True)
    
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ('transaction_id', 'created_at', 'updated_at')
    
    def validate(self, data):
        # Ensure category type matches transaction type
        if data.get('category') and data.get('transaction_type'):
            if data['category'].category_type != data['transaction_type']:
                raise serializers.ValidationError(
                    f"Category type '{data['category'].category_type}' doesn't match transaction type '{data['transaction_type']}'"
                )
        return data


class IncomeSerializer(serializers.ModelSerializer):
    transaction = TransactionSerializer(read_only=True)
    transaction_data = serializers.DictField(write_only=True)

    class Meta:
        model = Income
        fields = '__all__'

    @db_transaction.atomic
    def create(self, validated_data):
        transaction_data = validated_data.pop('transaction_data')
        transaction_data['transaction_type'] = 'income'

        # Create transaction first
        transaction_serializer = TransactionSerializer(data=transaction_data)
        if transaction_serializer.is_valid():
            transaction_obj = transaction_serializer.save()
        else:
            raise serializers.ValidationError(transaction_serializer.errors)

        # Create income record
        income = Income.objects.create(transaction=transaction_obj, **validated_data)
        return income

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

        # Update income record
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

from rest_framework import serializers
from .models import (
    AccountingCategory, PaymentMethod, BankAccount, Transaction,
    Income, Expense, DriverPayroll, Budget, FinancialReport, RecurringTransaction, Trip
)
from django.contrib.auth import get_user_model
from decimal import Decimal # Explicitly import Decimal

User = get_user_model()


class AccountingCategorySerializer(serializers.ModelSerializer):
    """
    Serializer for the AccountingCategory model.
    Handles serialization and deserialization of accounting categories.
    """
    class Meta:
        model = AccountingCategory
        fields = '__all__'

class PaymentMethodSerializer(serializers.ModelSerializer):
    """
    Serializer for the PaymentMethod model.
    Handles serialization and deserialization of payment methods.
    """
    class Meta:
        model = PaymentMethod
        fields = '__all__'

class BankAccountSerializer(serializers.ModelSerializer):
    """
    Serializer for the BankAccount model.
    Handles serialization and deserialization of bank accounts.
    Includes fields for account details and balance.
    """
    # Ensure balance is a DecimalField for consistency
    balance = serializers.DecimalField(max_digits=15, decimal_places=2)

    class Meta:
        model = BankAccount
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at'] # Assuming these are auto-set

class TransactionSerializer(serializers.ModelSerializer):
    """
    Serializer for the Transaction model.
    Handles serialization and deserialization of financial transactions.
    Includes read-only fields for related model names for display purposes.
    """
    # Read-only fields to display names from related models
    category_name = serializers.CharField(source='category.name', read_only=True)
    payment_method_name = serializers.CharField(source='payment_method.name', read_only=True)
    bank_account_name = serializers.CharField(source='bank_account.account_name', read_only=True, allow_null=True)
    company_name = serializers.CharField(source='company.company_name', read_only=True, allow_null=True)
    driver_name = serializers.CharField(source='driver.full_name', read_only=True, allow_null=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    approved_by_username = serializers.CharField(source='approved_by.username', read_only=True, allow_null=True)

    # Ensure amount is a DecimalField
    amount = serializers.DecimalField(max_digits=15, decimal_places=2)


    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = [
            'transaction_id', 'created_at', 'updated_at', 'category_name',
            'payment_method_name', 'bank_account_name', 'company_name', 'driver_name',
            'created_by', 'created_by_username', # 'created_by' is set in view's perform_create
            'approved_by', 'approved_by_username',
            'transaction_type' # transaction_type is often set by Income/Expense serializers
        ]


class IncomeSerializer(serializers.ModelSerializer):
    """
    Serializer for the Income model.
    Handles nested creation/update of a Transaction object along with Income.
    """
    # Use 'transaction' as the field name for the nested serializer
    transaction = TransactionSerializer(required=True)
    
    # Read-only fields for display from the nested transaction
    category_name = serializers.CharField(source='transaction.category.name', read_only=True)
    payment_method_name = serializers.CharField(source='transaction.payment_method.name', read_only=True)
    bank_account_name = serializers.CharField(source='transaction.bank_account.account_name', read_only=True, allow_null=True)
    company_name = serializers.CharField(source='transaction.company.company_name', read_only=True, allow_null=True)
    driver_name = serializers.CharField(source='transaction.driver.full_name', read_only=True, allow_null=True)
    
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    # Ensure tax_amount is a DecimalField
    tax_amount = serializers.DecimalField(max_digits=15, decimal_places=2, required=False, allow_null=True, default=Decimal('0.00'))


    class Meta:
        model = Income
        fields = [
            'id', 'income_source', 'invoice_number', 'due_date', 'tax_amount',
            'is_recurring', 'recurring_frequency', 'next_due_date',
            'transaction', # This is the nested serializer field
            'created_by', # This will be set by the view's perform_create
            'created_at',
            'updated_at', # Assuming this exists on the model

            'category_name', 'payment_method_name', 'bank_account_name',
            'company_name',
            'driver_name',
            'created_by_username',
        ]
        read_only_fields = [
            'created_by', 'created_at', 'updated_at', # These are typically auto-set or set by view
            'category_name', 'payment_method_name', 'bank_account_name',
            'company_name', 'driver_name', 'created_by_username',
        ]

    def create(self, validated_data):
        """
        Create a new Income instance and its associated Transaction instance.
        Handles setting 'created_by' and 'transaction_type' for the Transaction.
        """
        print("\n--- IncomeSerializer Create Method ---")
        print("Validated Data (before pop transaction):", validated_data)

        # Pop the nested transaction data
        transaction_data = validated_data.pop('transaction')
        print("Transaction Data (popped):", transaction_data)
        
        # IMPORTANT: Ensure 'created_by' is handled correctly for the nested Transaction.
        # It should come from the request user, not from the client's payload.
        if 'created_by' in transaction_data:
            print("WARNING: 'created_by' found in transaction_data from frontend. Removing it.")
            transaction_data.pop('created_by')
        
        # Set 'created_by' for the Transaction from the request context
        transaction_data['created_by'] = self.context['request'].user
        # Ensure transaction_type is always 'income' for Income-related transactions
        transaction_data['transaction_type'] = 'income'
        
        print("Transaction Data (after setting created_by and type):", transaction_data)
        
        try:
            # Create the Transaction instance
            transaction = Transaction.objects.create(**transaction_data)
            print(f"Transaction created: {transaction.id}")
        except Exception as e:
            print(f"Error creating Transaction object for Income: {e}")
            from rest_framework.exceptions import ValidationError
            # Re-raise as ValidationError to provide meaningful error messages to the client
            if hasattr(e, 'message_dict'):
                raise ValidationError({'transaction': e.message_dict})
            elif hasattr(e, 'detail'):
                raise ValidationError({'transaction': e.detail})
            else:
                raise serializers.ValidationError({'transaction': str(e)})

        # IMPORTANT: If 'created_by' is in validated_data for Income (e.g., if it was in fields and read_only_fields),
        # pop it before passing **validated_data, as we provide it explicitly below.
        if 'created_by' in validated_data:
            print("WARNING: 'created_by' found in validated_data for Income. Removing it to prevent duplication.")
            validated_data.pop('created_by')

        # Create the Income instance, linking it to the newly created Transaction
        income = Income.objects.create(
            transaction=transaction,
            created_by=self.context['request'].user, # Explicitly set created_by for Income
            **validated_data
        )
        print(f"Income created: {income.id}")
        return income

    def update(self, instance, validated_data):
        """
        Update an existing Income instance and its associated Transaction instance.
        """
        # Pop the nested transaction data
        transaction_data = validated_data.pop('transaction', {})
        transaction_instance = instance.transaction

        # Prevent 'transaction_type' and 'created_by' from being updated via nested serializer
        if 'transaction_type' in transaction_data:
            print("WARNING: Attempted to update 'transaction_type' during Income update. Ignoring.")
            transaction_data.pop('transaction_type')
        if 'created_by' in transaction_data:
            print("WARNING: Attempted to update 'created_by' during Income update. Ignoring.")
            transaction_data.pop('created_by')
        
        # Update fields of the nested Transaction instance
        for attr, value in transaction_data.items():
            setattr(transaction_instance, attr, value)
        transaction_instance.save()

        # Update fields of the Income instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
    

class ExpenseSerializer(serializers.ModelSerializer):
    """
    Serializer for the Expense model.
    Handles nested creation/update of a Transaction object along with Expense.
    """
    # Changed field name from 'transaction_data' to 'transaction' and removed 'source'
    transaction = TransactionSerializer(required=True)
    
    # Calculate net_amount based on transaction.amount and tax_amount
    # Ensure net_amount is a DecimalField
    net_amount = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    # Ensure tax_amount is a DecimalField
    tax_amount = serializers.DecimalField(max_digits=15, decimal_places=2, required=False, allow_null=True, default=Decimal('0.00'))


    class Meta:
        model = Expense
        fields = [
            'id', 'transaction', 'expense_type', 'vendor_name', # Changed 'transaction_data' to 'transaction'
            'bill_number',
            'due_date', 'tax_amount', 'net_amount', 'is_recurring',
            'recurring_frequency', 'next_due_date', 'created_at',
            'updated_at', 'created_by', 'created_by_username'
        ]
        read_only_fields = [
            'id', 'net_amount', 'created_at', 'updated_at',
            'created_by', 'created_by_username'
        ]

    def create(self, validated_data):
        """
        Create a new Expense instance and its associated Transaction instance.
        Handles setting 'created_by' and 'transaction_type' for the Transaction.
        """
        # --- FIX START ---
        # Pop the nested transaction data using the serializer field name 'transaction'
        transaction_data = validated_data.pop('transaction') 
        # --- FIX END ---
        
        # IMPORTANT: Ensure 'created_by' is handled correctly for the nested Transaction.
        if 'created_by' in transaction_data:
            print("WARNING: 'created_by' found in transaction_data from frontend. Removing it.")
            transaction_data.pop('created_by')

        # Set 'created_by' for the Transaction from the request context
        # Handle anonymous users for testing
        if self.context['request'].user.is_authenticated:
            transaction_data['created_by'] = self.context['request'].user
        else:
            transaction_data['created_by'] = None
        # Ensure transaction_type is always 'expense' for Expense-related transactions
        transaction_data['transaction_type'] = 'expense'

        try:
            # Create the Transaction instance
            transaction = Transaction.objects.create(**transaction_data)
        except Exception as e:
            print(f"Error creating Transaction object for Expense: {e}")
            from rest_framework.exceptions import ValidationError
            # Changed key to 'transaction' as per serializer field name
            if hasattr(e, 'message_dict'):
                raise ValidationError({'transaction': e.message_dict})
            elif hasattr(e, 'detail'):
                raise ValidationError({'transaction': e.detail})
            else:
                raise serializers.ValidationError({'transaction': str(e)})

        # IMPORTANT: If 'created_by' is in validated_data for Expense, pop it.
        if 'created_by' in validated_data:
            print("WARNING: 'created_by' found in validated_data for Expense. Removing it.")
            validated_data.pop('created_by')

        # Create the Expense instance, linking it to the newly created Transaction
        # Handle anonymous users for testing
        created_by = self.context['request'].user if self.context['request'].user.is_authenticated else None
        expense = Expense.objects.create(
            transaction=transaction,
            created_by=created_by, # Explicitly set created_by for Expense
            **validated_data
        )
        return expense

    def update(self, instance, validated_data):
        """
        Update an existing Expense instance and its associated Transaction instance.
        """
        # --- FIX START ---
        # Pop the nested transaction data using the serializer field name 'transaction'
        transaction_data = validated_data.pop('transaction', {})
        # --- FIX END ---
        transaction_instance = instance.transaction

        # Prevent 'transaction_type' and 'created_by' from being updated via nested serializer
        if 'transaction_type' in transaction_data:
            print("WARNING: Attempted to update 'transaction_type' during Expense update. Ignoring.")
            transaction_data.pop('transaction_type')
        if 'created_by' in transaction_data:
            print("WARNING: Attempted to update 'created_by' during Expense update. Ignoring.")
            transaction_data.pop('created_by')

        # Update fields of the nested Transaction instance
        for attr, value in transaction_data.items():
            setattr(transaction_instance, attr, value)
        transaction_instance.save()

        # Update fields of the Expense instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class DriverPayrollSerializer(serializers.ModelSerializer):
    """
    Serializer for the DriverPayroll model.
    Includes read-only fields for related driver and company names, and transaction ID.
    """
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    driver_name = serializers.CharField(source='driver.full_name', read_only=True)
    company_name = serializers.CharField(source='company.company_name', read_only=True, allow_null=True)
    transaction_id = serializers.UUIDField(source='transaction.transaction_id', read_only=True, allow_null=True)

    # Ensure all salary/deduction fields are DecimalFields
    gross_salary = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_deductions = serializers.DecimalField(max_digits=15, decimal_places=2)
    net_salary = serializers.DecimalField(max_digits=15, decimal_places=2)


    class Meta:
        model = DriverPayroll
        fields = '__all__'
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'created_by', 'created_by_username',
            'transaction', 'transaction_id' # 'transaction' is FK, 'transaction_id' is for display
        ]

class BudgetSerializer(serializers.ModelSerializer):
    """
    Serializer for the Budget model.
    Includes read-only fields for related user, company, and category names.
    """
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    company_name = serializers.CharField(source='company.company_name', read_only=True, allow_null=True)
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)

    # Ensure all budget/actual/variance fields are DecimalFields
    total_budget = serializers.DecimalField(max_digits=15, decimal_places=2)
    actual_income = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    actual_expense = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    variance = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)


    class Meta:
        model = Budget
        fields = '__all__'
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'created_by', 'created_by_username',
            'actual_income', 'actual_expense', 'variance'
        ]


class FinancialReportSerializer(serializers.ModelSerializer):
    """
    Serializer for the FinancialReport model.
    Includes read-only fields for related user, company, driver, and category names.
    The 'report_data' field is a JSONField and will be serialized as a dictionary.
    """
    generated_by_username = serializers.CharField(source='generated_by.username', read_only=True)
    company_name = serializers.CharField(source='company.company_name', read_only=True, allow_null=True)
    driver_name = serializers.CharField(source='driver.full_name', read_only=True, allow_null=True)
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)

    class Meta:
        model = FinancialReport
        fields = '__all__'
        read_only_fields = ['id', 'generated_at', 'generated_by', 'generated_by_username']


class RecurringTransactionSerializer(serializers.ModelSerializer):
    """
    Serializer for the RecurringTransaction model.
    Handles nested creation/update of a Transaction object along with RecurringTransaction.
    """
    # Use 'transaction_data' for the nested serializer
    transaction_data = TransactionSerializer(source='transaction', required=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    # Ensure amount is a DecimalField
    amount = serializers.DecimalField(max_digits=15, decimal_places=2)


    class Meta:
        model = RecurringTransaction
        fields = '__all__'
        read_only_fields = [
            'id', 'last_generated_date', 'created_at', 'updated_at',
            'created_by', 'created_by_username'
        ]

    def create(self, validated_data):
        """
        Create a new RecurringTransaction instance and its associated Transaction instance.
        Handles setting 'created_by' for the Transaction.
        """
        # Pop the nested transaction data
        transaction_data = validated_data.pop('transaction')
        
        # IMPORTANT: Ensure 'created_by' is handled correctly for the nested Transaction.
        if 'created_by' in transaction_data:
            print("WARNING: 'created_by' found in transaction_data from frontend. Removing it.")
            transaction_data.pop('created_by')

        # Set 'created_by' for the Transaction from the request context
        transaction_data['created_by'] = self.context['request'].user

        try:
            # Create the Transaction instance
            transaction = Transaction.objects.create(**transaction_data)
        except Exception as e:
            print(f"Error creating Transaction object for RecurringTransaction: {e}")
            from rest_framework.exceptions import ValidationError
            if hasattr(e, 'message_dict'):
                raise ValidationError({'transaction_data': e.message_dict})
            elif hasattr(e, 'detail'):
                raise ValidationError({'transaction_data': e.detail})
            else:
                raise serializers.ValidationError({'transaction_data': str(e)})

        # IMPORTANT: If 'created_by' is in validated_data for RecurringTransaction, pop it.
        if 'created_by' in validated_data:
            print("WARNING: 'created_by' found in validated_data for RecurringTransaction. Removing it.")
            validated_data.pop('created_by')

        # Create the RecurringTransaction instance, linking it to the newly created Transaction
        recurring_transaction = RecurringTransaction.objects.create(
            transaction=transaction,
            created_by=self.context['request'].user, # Explicitly set created_by for RecurringTransaction
            **validated_data
        )
        return recurring_transaction

    def update(self, instance, validated_data):
        """
        Update an existing RecurringTransaction instance and its associated Transaction instance.
        """
        # Pop the nested transaction data
        transaction_data = validated_data.pop('transaction', {})
        transaction_instance = instance.transaction

        # Prevent 'created_by' from being updated via nested serializer
        if 'created_by' in transaction_data:
            print("WARNING: Attempted to update 'created_by' during RecurringTransaction update. Ignoring.")
            transaction_data.pop('created_by')

        # Update fields of the nested Transaction instance
        for attr, value in transaction_data.items():
            setattr(transaction_instance, attr, value)
        transaction_instance.save()

        # Update fields of the RecurringTransaction instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class TransactionSummarySerializer(serializers.Serializer):
    """
    Serializer for the transaction summary report.
    Defines the fields for aggregated income, expense, profit, and transaction count.
    """
    # Increased max_digits for financial totals to allow for larger sums
    total_income = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_expense = serializers.DecimalField(max_digits=15, decimal_places=2)
    net_profit = serializers.DecimalField(max_digits=15, decimal_places=2)
    transaction_count = serializers.IntegerField()
    period_start = serializers.DateField()
    period_end = serializers.DateField()

class CategorySummarySerializer(serializers.Serializer):
    """
    Serializer for the category breakdown summary report.
    """
    category_name = serializers.CharField(max_length=255)
    category_type = serializers.CharField(max_length=50)
    total_amount = serializers.DecimalField(max_digits=15, decimal_places=2) # Increased max_digits
    transaction_count = serializers.IntegerField()

class DriverPayrollSummarySerializer(serializers.Serializer):
    """
    Serializer for the driver payroll summary report.
    """
    driver_name = serializers.CharField(max_length=255)
    total_gross_salary = serializers.DecimalField(max_digits=15, decimal_places=2) # Increased max_digits
    total_deductions = serializers.DecimalField(max_digits=15, decimal_places=2) # Increased max_digits
    total_net_salary = serializers.DecimalField(max_digits=15, decimal_places=2) # Increased max_digits
    payroll_count = serializers.IntegerField()


class TripSerializer(serializers.ModelSerializer):
    """
    Serializer for the Trip model.
    Handles trip creation and management for mobile app.
    """
    # Read-only fields for display
    driver_name = serializers.CharField(source='driver.driver_name', read_only=True)
    company_name = serializers.CharField(source='company.company_name', read_only=True, allow_null=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True, allow_null=True)

    class Meta:
        model = Trip
        fields = '__all__'
        read_only_fields = [
            'id', 'trip_id', 'total_earnings', 'platform_commission_amount',
            'driver_earnings', 'created_at', 'updated_at', 'created_by',
            'driver_name', 'company_name', 'created_by_username'
        ]

    def create(self, validated_data):
        """Create a new trip instance"""
        # Set created_by from request user if authenticated
        if self.context['request'].user.is_authenticated:
            validated_data['created_by'] = self.context['request'].user

        return super().create(validated_data)


class TripStatsSerializer(serializers.Serializer):
    """
    Serializer for trip statistics.
    """
    total_trips = serializers.IntegerField()
    completed_trips = serializers.IntegerField()
    cancelled_trips = serializers.IntegerField()
    total_earnings = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_tips = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_distance = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_duration = serializers.IntegerField()
    average_trip_earnings = serializers.DecimalField(max_digits=10, decimal_places=2)
    average_trip_distance = serializers.DecimalField(max_digits=8, decimal_places=2)
    cash_trips = serializers.IntegerField()
    digital_trips = serializers.IntegerField()
    cash_earnings = serializers.DecimalField(max_digits=15, decimal_places=2)
    digital_earnings = serializers.DecimalField(max_digits=15, decimal_places=2)

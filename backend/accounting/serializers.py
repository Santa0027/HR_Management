from rest_framework import serializers
from .models import Transaction, Income, Expense


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for Transaction model"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'transaction_type', 'amount', 'description', 
            'reference_number', 'created_at', 'updated_at',
            'created_by', 'created_by_name'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by']


class IncomeSerializer(serializers.ModelSerializer):
    """Serializer for Income model"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    driver_name = serializers.CharField(source='driver.name', read_only=True)
    source_display = serializers.CharField(source='get_source_display', read_only=True)
    
    class Meta:
        model = Income
        fields = [
            'id', 'source', 'source_display', 'amount', 'description',
            'driver', 'driver_name', 'reference_number', 'created_at',
            'created_by', 'created_by_name'
        ]
        read_only_fields = ['created_at', 'created_by']


class ExpenseSerializer(serializers.ModelSerializer):
    """Serializer for Expense model"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Expense
        fields = [
            'id', 'category', 'category_display', 'amount', 'description',
            'vendor', 'receipt_number', 'created_at', 'created_by',
            'created_by_name'
        ]
        read_only_fields = ['created_at', 'created_by']

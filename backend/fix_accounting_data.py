#!/usr/bin/env python
"""
Script to fix accounting data inconsistencies
"""
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounting.models import AccountingCategory, Transaction, Income, Expense

def fix_category_types():
    """Fix category type values to be lowercase"""
    print("Fixing category types...")
    
    # Fix categories with uppercase values
    categories_updated = 0
    for category in AccountingCategory.objects.all():
        if category.category_type == 'EXPENSE':
            category.category_type = 'expense'
            category.save()
            categories_updated += 1
            print(f"Fixed category: {category.name} -> expense")
        elif category.category_type == 'INCOME':
            category.category_type = 'income'
            category.save()
            categories_updated += 1
            print(f"Fixed category: {category.name} -> income")
    
    print(f"Updated {categories_updated} categories")

def fix_transaction_types():
    """Fix transaction type values to be lowercase"""
    print("Fixing transaction types...")
    
    transactions_updated = 0
    for transaction in Transaction.objects.all():
        if transaction.transaction_type == 'EXPENSE':
            transaction.transaction_type = 'expense'
            transaction.save()
            transactions_updated += 1
        elif transaction.transaction_type == 'INCOME':
            transaction.transaction_type = 'income'
            transaction.save()
            transactions_updated += 1
    
    print(f"Updated {transactions_updated} transactions")

def create_default_categories():
    """Create default categories if they don't exist"""
    print("Creating default categories...")
    
    default_categories = [
        {'name': 'Trip Revenue', 'category_type': 'income', 'description': 'Revenue from completed trips'},
        {'name': 'Contract Payment', 'category_type': 'income', 'description': 'Payments from contracts'},
        {'name': 'Fuel', 'category_type': 'expense', 'description': 'Vehicle fuel expenses'},
        {'name': 'Maintenance', 'category_type': 'expense', 'description': 'Vehicle maintenance costs'},
        {'name': 'Driver Salary', 'category_type': 'expense', 'description': 'Driver salary payments'},
        {'name': 'Insurance', 'category_type': 'expense', 'description': 'Vehicle and business insurance'},
        {'name': 'Office Rent', 'category_type': 'expense', 'description': 'Office rental expenses'},
        {'name': 'Utilities', 'category_type': 'expense', 'description': 'Electricity, water, internet'},
    ]
    
    created_count = 0
    for cat_data in default_categories:
        category, created = AccountingCategory.objects.get_or_create(
            name=cat_data['name'],
            defaults={
                'category_type': cat_data['category_type'],
                'description': cat_data['description'],
                'is_active': True
            }
        )
        if created:
            created_count += 1
            print(f"Created category: {category.name}")
    
    print(f"Created {created_count} new categories")

def create_default_payment_methods():
    """Create default payment methods if they don't exist"""
    print("Creating default payment methods...")
    
    from accounting.models import PaymentMethod
    
    default_methods = [
        {'name': 'Cash', 'description': 'Cash payments'},
        {'name': 'Bank Transfer', 'description': 'Electronic bank transfers'},
        {'name': 'Credit Card', 'description': 'Credit card payments'},
        {'name': 'Debit Card', 'description': 'Debit card payments'},
        {'name': 'Check', 'description': 'Check payments'},
        {'name': 'Mobile Payment', 'description': 'Mobile payment apps'},
    ]
    
    created_count = 0
    for method_data in default_methods:
        method, created = PaymentMethod.objects.get_or_create(
            name=method_data['name'],
            defaults={
                'description': method_data['description'],
                'is_active': True
            }
        )
        if created:
            created_count += 1
            print(f"Created payment method: {method.name}")
    
    print(f"Created {created_count} new payment methods")

def main():
    """Main function to run all fixes"""
    print("Starting accounting data fixes...")
    print("=" * 50)
    
    try:
        fix_category_types()
        print()
        
        fix_transaction_types()
        print()
        
        create_default_categories()
        print()
        
        create_default_payment_methods()
        print()
        
        print("=" * 50)
        print("All fixes completed successfully!")
        
    except Exception as e:
        print(f"Error occurred: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()

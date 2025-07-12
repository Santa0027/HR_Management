#!/usr/bin/env python3
"""
Initial Data Setup Script
Creates all necessary initial data for the HR Management System
"""

import os
import sys
import django
from datetime import datetime, timedelta, date, time
from decimal import Decimal

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from company.models import Company
from drivers.models import Driver, DriverAuth
from vehicle.models import VehicleRegistration
from hr.models import ShiftType, LeaveType, LeaveBalance, Attendance
from accounting.models import AccountingCategory, PaymentMethod
from usermanagement.models import CustomUser

def create_companies():
    """Create sample companies"""
    print("🏢 Creating Companies...")
    
    companies_data = [
        {
            'company_name': 'Al-Rashid Transport Co.',
            'address': 'King Fahd Road, Riyadh, Saudi Arabia',
            'contact_phone': '+966112345678',
            'contact_email': 'info@alrashid-transport.com',
            'registration_number': 'TL-2024-001',
            'city': 'Riyadh',
            'country': 'Saudi Arabia',
            'contact_person': 'Ahmed Al-Rashid',
        },
        {
            'company_name': 'Gulf Logistics LLC',
            'address': 'Prince Sultan Road, Jeddah, Saudi Arabia',
            'contact_phone': '+966126789012',
            'contact_email': 'contact@gulf-logistics.com',
            'registration_number': 'TL-2024-002',
            'city': 'Jeddah',
            'country': 'Saudi Arabia',
            'contact_person': 'Mohammed Al-Fahad',
        }
    ]

    created_companies = []
    for company_data in companies_data:
        company, created = Company.objects.get_or_create(
            company_name=company_data['company_name'],
            defaults=company_data
        )
        created_companies.append(company)
        if created:
            print(f"✅ Created Company: {company.company_name}")
        else:
            print(f"ℹ️ Company already exists: {company.company_name}")
    
    return created_companies

def create_vehicle_types():
    """Create vehicle types - using choices from VehicleRegistration"""
    print("\n🚗 Vehicle Types are defined in VehicleRegistration choices...")

    # Vehicle types are now defined as choices in VehicleRegistration model
    vehicle_types = [choice[1] for choice in VehicleRegistration.VEHICLE_TYPE_CHOICES]

    for vehicle_type in vehicle_types:
        print(f"✅ Vehicle Type Available: {vehicle_type}")

    return vehicle_types

def create_vehicles(companies, vehicle_types):
    """Create sample vehicles"""
    print("\n🚙 Creating Vehicles...")

    vehicles_data = [
        {
            'vehicle_number': 'ABC-1234',
            'vehicle_name': 'Toyota Camry 2022',
            'make': 'Toyota',
            'model': 'Camry',
            'year': 2022,
            'color': 'White',
            'chassis_number': 'JT2BF28K123456789',
            'vehicle_status': 'ACTIVE',
            'vehicle_type': 'CAR',
        },
        {
            'vehicle_number': 'XYZ-5678',
            'vehicle_name': 'Honda Accord 2023',
            'make': 'Honda',
            'model': 'Accord',
            'year': 2023,
            'color': 'Silver',
            'chassis_number': 'JH4TB2H26CC123456',
            'vehicle_status': 'ACTIVE',
            'vehicle_type': 'CAR',
        },
        {
            'vehicle_number': 'DEF-9012',
            'vehicle_name': 'Nissan Altima 2021',
            'make': 'Nissan',
            'model': 'Altima',
            'year': 2021,
            'color': 'Black',
            'chassis_number': '1N4AL3AP8DC123456',
            'vehicle_status': 'MAINTENANCE',
            'vehicle_type': 'SUV',
        }
    ]

    created_vehicles = []
    for i, vehicle_data in enumerate(vehicles_data):
        vehicle, created = VehicleRegistration.objects.get_or_create(
            vehicle_number=vehicle_data['vehicle_number'],
            defaults={
                **vehicle_data,
                'purchase_date': date.today() - timedelta(days=30*(i+1)),
                'insurance_expiry_date': date.today() + timedelta(days=365),
                'rc_expiry_date': date.today() + timedelta(days=180),
                'ownership_type': 'OWN',
                'approval_status': 'APPROVED',
                'seating_capacity': 5,
                'fuel_type': 'PETROL',
            }
        )
        created_vehicles.append(vehicle)
        if created:
            print(f"✅ Created Vehicle: {vehicle.vehicle_number} - {vehicle.make} {vehicle.model}")

    return created_vehicles

def create_shift_types():
    """Create shift types"""
    print("\n⏰ Creating Shift Types...")
    
    shift_types_data = [
        {
            'name': 'Morning Shift',
            'start_time': time(6, 0),
            'end_time': time(14, 0),
            'description': 'Early morning shift',
            'is_active': True,
        },
        {
            'name': 'Evening Shift', 
            'start_time': time(14, 0),
            'end_time': time(22, 0),
            'description': 'Afternoon to evening shift',
            'is_active': True,
        },
        {
            'name': 'Night Shift',
            'start_time': time(22, 0),
            'end_time': time(6, 0),
            'description': 'Night shift',
            'is_active': True,
        },
        {
            'name': 'Full Day',
            'start_time': time(8, 0),
            'end_time': time(17, 0),
            'description': 'Standard 9-hour shift',
            'is_active': True,
        }
    ]
    
    created_shifts = []
    for shift_data in shift_types_data:
        shift, created = ShiftType.objects.get_or_create(
            name=shift_data['name'],
            defaults=shift_data
        )
        created_shifts.append(shift)
        if created:
            print(f"✅ Created Shift Type: {shift.name} ({shift.start_time} - {shift.end_time})")
    
    return created_shifts

def create_leave_types():
    """Create leave types"""
    print("\n📅 Creating Leave Types...")
    
    leave_types_data = [
        {
            'name': 'Annual Leave',
            'description': 'Yearly vacation leave',
            'max_days_per_year': 30,
            'max_consecutive_days': 15,
            'requires_approval': True,
            'requires_document': False,
            'advance_notice_days': 7,
            'is_active': True,
        },
        {
            'name': 'Sick Leave',
            'description': 'Medical leave for illness',
            'max_days_per_year': 15,
            'max_consecutive_days': 7,
            'requires_approval': True,
            'requires_document': True,
            'advance_notice_days': 1,
            'is_active': True,
        },
        {
            'name': 'Emergency Leave',
            'description': 'Urgent family or personal emergency',
            'max_days_per_year': 10,
            'max_consecutive_days': 5,
            'requires_approval': True,
            'requires_document': False,
            'advance_notice_days': 0,
            'is_active': True,
        },
        {
            'name': 'Maternity Leave',
            'description': 'Maternity/Paternity leave',
            'max_days_per_year': 90,
            'max_consecutive_days': 90,
            'requires_approval': True,
            'requires_document': True,
            'advance_notice_days': 30,
            'is_active': True,
        },
        {
            'name': 'Bereavement Leave',
            'description': 'Leave for family bereavement',
            'max_days_per_year': 7,
            'max_consecutive_days': 7,
            'requires_approval': True,
            'requires_document': False,
            'advance_notice_days': 0,
            'is_active': True,
        }
    ]
    
    created_leave_types = []
    for leave_data in leave_types_data:
        leave_type, created = LeaveType.objects.get_or_create(
            name=leave_data['name'],
            defaults=leave_data
        )
        created_leave_types.append(leave_type)
        if created:
            print(f"✅ Created Leave Type: {leave_type.name} ({leave_type.max_days_per_year} days/year)")
    
    return created_leave_types

def create_accounting_categories():
    """Create accounting categories"""
    print("\n💰 Creating Accounting Categories...")
    
    categories_data = [
        {'name': 'Fuel Expenses', 'type': 'expense', 'description': 'Vehicle fuel costs'},
        {'name': 'Maintenance', 'type': 'expense', 'description': 'Vehicle maintenance and repairs'},
        {'name': 'Insurance', 'type': 'expense', 'description': 'Vehicle and liability insurance'},
        {'name': 'Driver Salaries', 'type': 'expense', 'description': 'Driver compensation'},
        {'name': 'Trip Revenue', 'type': 'income', 'description': 'Revenue from completed trips'},
        {'name': 'Rental Income', 'type': 'income', 'description': 'Vehicle rental income'},
        {'name': 'Office Rent', 'type': 'expense', 'description': 'Office space rental'},
        {'name': 'Utilities', 'type': 'expense', 'description': 'Electricity, water, internet'},
    ]
    
    created_categories = []
    for category_data in categories_data:
        category, created = AccountingCategory.objects.get_or_create(
            name=category_data['name'],
            defaults=category_data
        )
        created_categories.append(category)
        if created:
            print(f"✅ Created Accounting Category: {category.name} ({category.type})")
    
    return created_categories

def create_payment_methods():
    """Create payment methods"""
    print("\n💳 Creating Payment Methods...")
    
    payment_methods_data = [
        {'name': 'Cash', 'description': 'Cash payment', 'is_active': True},
        {'name': 'Bank Transfer', 'description': 'Electronic bank transfer', 'is_active': True},
        {'name': 'Credit Card', 'description': 'Credit card payment', 'is_active': True},
        {'name': 'Debit Card', 'description': 'Debit card payment', 'is_active': True},
        {'name': 'Check', 'description': 'Bank check payment', 'is_active': True},
        {'name': 'Mobile Payment', 'description': 'Mobile wallet payment', 'is_active': True},
    ]
    
    created_methods = []
    for method_data in payment_methods_data:
        method, created = PaymentMethod.objects.get_or_create(
            name=method_data['name'],
            defaults=method_data
        )
        created_methods.append(method)
        if created:
            print(f"✅ Created Payment Method: {method.name}")
    
    return created_methods

def create_leave_balances(drivers, leave_types):
    """Create leave balances for drivers"""
    print("\n📊 Creating Leave Balances...")
    
    current_year = datetime.now().year
    
    for driver in drivers:
        for leave_type in leave_types:
            balance, created = LeaveBalance.objects.get_or_create(
                driver=driver,
                leave_type=leave_type,
                year=current_year,
                defaults={
                    'allocated_days': leave_type.max_days_per_year,
                    'used_days': 0,
                    'pending_days': 0,
                }
            )
            
            if created:
                print(f"✅ Created Leave Balance: {driver.driver_name} - {leave_type.name}: {balance.allocated_days} days")

def print_summary():
    """Print setup summary"""
    print("\n" + "="*60)
    print("📋 INITIAL DATA SETUP SUMMARY")
    print("="*60)
    
    print(f"🏢 Companies: {Company.objects.count()}")
    print(f"👨‍💼 Drivers: {Driver.objects.count()}")
    print(f"🚗 Vehicles: {VehicleRegistration.objects.count()}")
    print(f"🚙 Vehicle Types: {len(VehicleRegistration.VEHICLE_TYPE_CHOICES)} (defined as choices)")
    print(f"⏰ Shift Types: {ShiftType.objects.count()}")
    print(f"📅 Leave Types: {LeaveType.objects.count()}")
    print(f"📊 Leave Balances: {LeaveBalance.objects.count()}")
    print(f"💰 Accounting Categories: {AccountingCategory.objects.count()}")
    print(f"💳 Payment Methods: {PaymentMethod.objects.count()}")
    print(f"👤 Admin Users: {CustomUser.objects.count()}")
    print(f"🔐 Driver Auth: {DriverAuth.objects.count()}")
    
    print("\n✅ All initial data has been created successfully!")
    print("💡 Run 'python setup_login_system.py' to see login credentials")

def main():
    """Main setup function"""
    print("🚀 Setting up Initial Data...")
    print("="*60)
    
    try:
        # Create all initial data
        companies = create_companies()
        vehicle_types = create_vehicle_types()
        vehicles = create_vehicles(companies, vehicle_types)
        shift_types = create_shift_types()
        leave_types = create_leave_types()
        accounting_categories = create_accounting_categories()
        payment_methods = create_payment_methods()
        
        # Get drivers (should be created by login setup script)
        drivers = Driver.objects.all()
        if drivers.exists():
            create_leave_balances(drivers, leave_types)
        
        # Print summary
        print_summary()
        
    except Exception as e:
        print(f"\n❌ Error setting up initial data: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()

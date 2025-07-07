#!/usr/bin/env python3
"""
Sample Data Creation Script for HR Management System
Creates comprehensive test data for all models
"""

import os
import sys
import django
from datetime import datetime

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from company.models import Company
from drivers.models import Driver, DriverAuth
from vehicle.models import VehicleRegistration
from hr.models import ShiftType, LeaveType
from accounting.models import AccountingCategory, PaymentMethod
from usermanagement.models import CustomUser

def create_sample_data():
    print("🚀 Creating comprehensive sample data...")
    
    # 1. Create Admin Users
    print("👤 Creating admin users...")
    
    # Super Admin
    super_admin, created = CustomUser.objects.get_or_create(
        email='admin@company.com',
        defaults={
            'first_name': 'Super',
            'last_name': 'Admin',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True,
            'is_active': True,
        }
    )
    if created:
        super_admin.set_password('admin123')
        super_admin.save()
        print(f"✅ Created Super Admin: {super_admin.email}")

    # HR Manager
    hr_manager, created = CustomUser.objects.get_or_create(
        email='hr@company.com',
        defaults={
            'first_name': 'HR',
            'last_name': 'Manager',
            'role': 'hr',
            'is_staff': True,
            'is_active': True,
        }
    )
    if created:
        hr_manager.set_password('hr123')
        hr_manager.save()
        print(f"✅ Created HR Manager: {hr_manager.email}")
    
    # 2. Create Company
    print("🏢 Creating company...")
    company, created = Company.objects.get_or_create(
        company_name='Kuwait Transport Company',
        defaults={
            'address': '123 Kuwait City, Kuwait',
            'city': 'Kuwait City',
            'country': 'Kuwait',
            'contact_person': 'Ahmed Al-Mansouri',
            'contact_phone': '+965-1234-5678',
            'contact_email': 'info@kuwaittransport.com',
            'registration_number': 'KWT-2024-001',
            'bank_name': 'Kuwait National Bank',
            'account_number': '1234567890',
            'ifsc_code': 'KNB001',
        }
    )
    if created:
        print(f"✅ Created Company: {company.company_name}")
    
    # 3. Create Vehicle Registrations
    print("🚗 Creating vehicles...")
    vehicles_data = [
        {'vehicle_number': 'KWT-001', 'vehicle_name': 'Toyota Hiace', 'vehicle_type': 'BUS'},
        {'vehicle_number': 'KWT-002', 'vehicle_name': 'Nissan Urvan', 'vehicle_type': 'BUS'},
        {'vehicle_number': 'KWT-003', 'vehicle_name': 'Mercedes Sprinter', 'vehicle_type': 'BUS'},
    ]

    vehicles = []
    for vehicle_data in vehicles_data:
        vehicle, created = VehicleRegistration.objects.get_or_create(
            vehicle_number=vehicle_data['vehicle_number'],
            defaults={
                'vehicle_name': vehicle_data['vehicle_name'],
                'vehicle_type': vehicle_data['vehicle_type'],
                'approval_status': 'APPROVED',
                'created_by': super_admin,
            }
        )
        vehicles.append(vehicle)
        if created:
            print(f"✅ Created Vehicle: {vehicle.vehicle_number}")
    
    # 4. Create Drivers
    print("👨‍💼 Creating drivers...")
    drivers_data = [
        {'name': 'Mohammed Al-Ahmad', 'mobile': '+965-9876-5432', 'iqama': 'IQ001'},
        {'name': 'Ahmed Hassan', 'mobile': '+965-9876-5433', 'iqama': 'IQ002'},
        {'name': 'Omar Al-Rashid', 'mobile': '+965-9876-5434', 'iqama': 'IQ003'},
    ]

    drivers = []
    for i, driver_data in enumerate(drivers_data):
        driver, created = Driver.objects.get_or_create(
            driver_name=driver_data['name'],
            defaults={
                'mobile': driver_data['mobile'],
                'iqama': driver_data['iqama'],
                'gender': 'male',
                'city': 'Kuwait City',
                'nationality': 'Kuwait',
                'vehicle': vehicles[i] if i < len(vehicles) else None,
                'status': 'approved',
                'company': company,
            }
        )
        drivers.append(driver)
        if created:
            print(f"✅ Created Driver: {driver.driver_name}")
    
    # 5. Create Driver Authentication
    print("🔐 Creating driver authentication...")
    for i, driver in enumerate(drivers):
        driver_auth, created = DriverAuth.objects.get_or_create(
            driver=driver,
            defaults={
                'username': f'driver{i+1}',
                'is_active': True,
            }
        )
        if created:
            driver_auth.set_password('driver123')
            driver_auth.save()
            print(f"✅ Created Driver Auth: {driver_auth.username}")
    
    # 6. Create Shift Types
    print("⏰ Creating shift types...")
    shift_types_data = [
        {'name': 'Morning Shift', 'start_time': '06:00', 'end_time': '14:00'},
        {'name': 'Evening Shift', 'start_time': '14:00', 'end_time': '22:00'},
        {'name': 'Night Shift', 'start_time': '22:00', 'end_time': '06:00'},
    ]
    
    shift_types = []
    for shift_data in shift_types_data:
        shift_type, created = ShiftType.objects.get_or_create(
            name=shift_data['name'],
            defaults={
                'start_time': shift_data['start_time'],
                'end_time': shift_data['end_time'],
                'is_active': True,
            }
        )
        shift_types.append(shift_type)
        if created:
            print(f"✅ Created Shift Type: {shift_type.name}")
    
    # 7. Create Accounting Categories
    print("💰 Creating accounting categories...")
    categories_data = [
        {'name': 'Fuel', 'type': 'EXPENSE'},
        {'name': 'Maintenance', 'type': 'EXPENSE'},
        {'name': 'Driver Salary', 'type': 'EXPENSE'},
        {'name': 'Trip Revenue', 'type': 'INCOME'},
        {'name': 'Contract Payment', 'type': 'INCOME'},
    ]
    
    categories = []
    for cat_data in categories_data:
        category, created = AccountingCategory.objects.get_or_create(
            name=cat_data['name'],
            defaults={
                'category_type': cat_data['type'],
                'is_active': True,
            }
        )
        categories.append(category)
        if created:
            print(f"✅ Created Category: {category.name}")

    # 8. Create Leave Types
    print("🏖️ Creating leave types...")
    leave_types_data = [
        {
            'name': 'Annual Leave',
            'description': 'Yearly vacation leave',
            'max_days_per_year': 30,
            'is_paid': True,
            'requires_approval': True,
            'advance_notice_days': 7,
            'is_active': True
        },
        {
            'name': 'Sick Leave',
            'description': 'Medical leave for illness',
            'max_days_per_year': 15,
            'is_paid': True,
            'requires_approval': True,
            'advance_notice_days': 1,
            'is_active': True
        },
        {
            'name': 'Emergency Leave',
            'description': 'Emergency family situations',
            'max_days_per_year': 10,
            'is_paid': True,
            'requires_approval': True,
            'advance_notice_days': 0,
            'is_active': True
        },
        {
            'name': 'Personal Leave',
            'description': 'Personal time off',
            'max_days_per_year': 5,
            'is_paid': False,
            'requires_approval': True,
            'advance_notice_days': 3,
            'is_active': True
        },
        {
            'name': 'Maternity Leave',
            'description': 'Maternity leave for new mothers',
            'max_days_per_year': 90,
            'is_paid': True,
            'requires_approval': True,
            'advance_notice_days': 30,
            'is_active': True
        }
    ]

    leave_types = []
    for leave_data in leave_types_data:
        leave_type, created = LeaveType.objects.get_or_create(
            name=leave_data['name'],
            defaults=leave_data
        )
        leave_types.append(leave_type)
        if created:
            print(f"✅ Created Leave Type: {leave_type.name}")

    # Create Leave Balances for all drivers
    print("📊 Creating leave balances...")
    from hr.models import LeaveBalance
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
                    'pending_days': 0
                }
            )
            if created:
                print(f"✅ Created Leave Balance: {driver.driver_name} - {leave_type.name}")

    # 9. Create Payment Methods
    print("💳 Creating payment methods...")
    payment_methods_data = ['Cash', 'Bank Transfer', 'Credit Card', 'Check']
    
    payment_methods = []
    for method_name in payment_methods_data:
        method, created = PaymentMethod.objects.get_or_create(
            name=method_name,
            defaults={'is_active': True}
        )
        payment_methods.append(method)
        if created:
            print(f"✅ Created Payment Method: {method.name}")
    
    print("✅ Sample data creation completed successfully!")
    print("\n🔑 LOGIN CREDENTIALS:")
    print("Super Admin: admin@company.com / admin123")
    print("HR Manager: hr@company.com / hr123")
    print("Driver 1: driver1 / driver123")
    print("Driver 2: driver2 / driver123")
    print("Driver 3: driver3 / driver123")

if __name__ == '__main__':
    create_sample_data()

#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from usermanagement.models import CustomUser, DriverAuthentication
from drivers.models import Driver, DriverAuth
from company.models import Company
from vehicle.models import VehicleRegistration
from hr.models import CheckinLocation, ApartmentLocation, ShiftType, LeaveType
from accounting.models import Transaction, Income, Expense
from django.contrib.auth.hashers import make_password
import uuid

def create_sample_data():
    print("Creating sample data...")
    
    # Create superuser
    if not CustomUser.objects.filter(email='admin@company.com').exists():
        admin = CustomUser.objects.create_superuser(
            email='admin@company.com',
            password='admin123',
            first_name='System',
            last_name='Administrator',
            role='super_admin'
        )
        print(f"✅ Created superuser: {admin.email}")
    
    # Create HR Manager
    if not CustomUser.objects.filter(email='hr@company.com').exists():
        hr_manager = CustomUser.objects.create_user(
            email='hr@company.com',
            password='hr123',
            first_name='Sarah',
            last_name='Johnson',
            role='hr_manager'
        )
        print(f"✅ Created HR Manager: {hr_manager.email}")
    
    # Create Company
    if not Company.objects.exists():
        company = Company.objects.create(
            company_name='Kuwait Transport Services',
            registration_number='KTS-2024-001',
            address='Kuwait City, Kuwait',
            city='Kuwait City',
            country='Kuwait',
            contact_person='Ahmed Al-Manager',
            contact_email='info@kts.com.kw',
            contact_phone='+965-2222-3333',
            bank_name='Kuwait National Bank',
            account_number='1234567890',
            ifsc_code='KNB001',
            commission_type='fixed',
            fixed_commission=100.00
        )
        print(f"✅ Created company: {company.company_name}")
    else:
        company = Company.objects.first()
    
    # Create Vehicle
    if not VehicleRegistration.objects.exists():
        vehicle = VehicleRegistration.objects.create(
            vehicle_name='Toyota Camry 2023',
            vehicle_number='KWT-001',
            vehicle_type='CAR',
            insurance_number='INS-2024-001',
            insurance_expiry_date='2025-01-01',
            Chassis_Number='CH123456789',
            service_date='2024-01-01',
            rc_book_number='RC-2024-001',
            is_leased=False,
            approval_status='APPROVED',
            created_by=CustomUser.objects.filter(role='super_admin').first()
        )
        print(f"✅ Created vehicle: {vehicle.vehicle_number}")
    else:
        vehicle = VehicleRegistration.objects.first()
    
    # Create Sample Drivers
    drivers_data = [
        {
            'driver_name': 'Mohammed Al-Ahmad',
            'mobile': '+965-1111-2222',
            'iqama': 'IQ001234567',
            'username': 'driver1',
            'password': 'driver123'
        },
        {
            'driver_name': 'Ahmed Hassan',
            'mobile': '+965-2222-3333',
            'iqama': 'IQ002345678',
            'username': 'driver2',
            'password': 'driver123'
        },
        {
            'driver_name': 'Omar Al-Rashid',
            'mobile': '+965-3333-4444',
            'iqama': 'IQ003456789',
            'username': 'driver3',
            'password': 'driver123'
        }
    ]

    for driver_data in drivers_data:
        if not Driver.objects.filter(iqama=driver_data['iqama']).exists():
            driver = Driver.objects.create(
                driver_name=driver_data['driver_name'],
                mobile=driver_data['mobile'],
                iqama=driver_data['iqama'],
                gender='male',
                city='Kuwait City',
                status='approved',
                vehicle=vehicle
            )
            
            # Create DriverAuth for mobile login
            DriverAuth.objects.create(
                driver=driver,
                username=driver_data['username'],
                password_hash=make_password(driver_data['password']),
                is_active=True
            )
            
            # Create DriverAuthentication for admin management
            DriverAuthentication.objects.create(
                driver=driver,
                username=driver_data['username'],
                password_hash=make_password(driver_data['password']),
                status='active',
                created_by=CustomUser.objects.filter(role='super_admin').first()
            )
            
            print(f"✅ Created driver: {driver.driver_name} (username: {driver_data['username']})")
    
    # Create Check-in Locations
    locations_data = [
        {'name': 'Main Office', 'lat': 29.3759, 'lng': 47.9774, 'radius': 100},
        {'name': 'Airport Terminal', 'lat': 29.2267, 'lng': 47.9690, 'radius': 200},
        {'name': 'Shopping Mall', 'lat': 29.3697, 'lng': 47.9735, 'radius': 150},
    ]
    
    for loc_data in locations_data:
        if not CheckinLocation.objects.filter(name=loc_data['name']).exists():
            CheckinLocation.objects.create(
                name=loc_data['name'],
                latitude=loc_data['lat'],
                longitude=loc_data['lng'],
                radius_meters=loc_data['radius'],
                is_active=True
            )
            print(f"✅ Created check-in location: {loc_data['name']}")
    
    # Create Apartment Locations
    for i, driver in enumerate(Driver.objects.all()[:3]):
        if not ApartmentLocation.objects.filter(driver=driver).exists():
            ApartmentLocation.objects.create(
                name=f"{driver.driver_name}'s Apartment",
                latitude=29.3759 + (i * 0.01),
                longitude=47.9774 + (i * 0.01),
                alarm_radius_meters=30,
                driver=driver,
                is_active=True
            )
            print(f"✅ Created apartment location for: {driver.driver_name}")
    
    # Create Shift Types
    shift_types = [
        {'name': 'Morning Shift', 'start_time': '06:00:00', 'end_time': '14:00:00'},
        {'name': 'Evening Shift', 'start_time': '14:00:00', 'end_time': '22:00:00'},
        {'name': 'Night Shift', 'start_time': '22:00:00', 'end_time': '06:00:00'},
    ]
    
    for shift_data in shift_types:
        if not ShiftType.objects.filter(name=shift_data['name']).exists():
            ShiftType.objects.create(**shift_data)
            print(f"✅ Created shift type: {shift_data['name']}")
    
    # Create Leave Types
    leave_types = [
        {'name': 'Annual Leave', 'max_days_per_year': 30, 'is_paid': True},
        {'name': 'Sick Leave', 'max_days_per_year': 15, 'is_paid': True},
        {'name': 'Emergency Leave', 'max_days_per_year': 5, 'is_paid': False},
    ]
    
    for leave_data in leave_types:
        if not LeaveType.objects.filter(name=leave_data['name']).exists():
            LeaveType.objects.create(**leave_data)
            print(f"✅ Created leave type: {leave_data['name']}")
    
    # Create Sample Accounting Data
    if not Transaction.objects.exists():
        # Sample Income
        Income.objects.create(
            source='trip_commission',
            amount=1500.00,
            description='Driver commission for January',
            driver=Driver.objects.first(),
            reference_number='INC-2024-001',
            created_by=CustomUser.objects.filter(role='super_admin').first()
        )
        
        # Sample Expense
        Expense.objects.create(
            category='operational',
            amount=500.00,
            description='Fuel costs for fleet',
            vendor='Kuwait Petroleum',
            receipt_number='KP-2024-001',
            created_by=CustomUser.objects.filter(role='super_admin').first()
        )
        
        # Sample Transactions
        Transaction.objects.create(
            transaction_type='income',
            amount=1500.00,
            description='Driver commission payment',
            reference_number='TXN-2024-001',
            created_by=CustomUser.objects.filter(role='super_admin').first()
        )
        
        Transaction.objects.create(
            transaction_type='expense',
            amount=500.00,
            description='Operational expenses',
            reference_number='TXN-2024-002',
            created_by=CustomUser.objects.filter(role='super_admin').first()
        )
        
        print("✅ Created sample accounting data")
    
    print("\n🎉 Sample data creation completed!")
    print("\n📋 Login Credentials:")
    print("👤 Admin: admin@company.com / admin123")
    print("👤 HR Manager: hr@company.com / hr123")
    print("📱 Driver 1: driver1 / driver123")
    print("📱 Driver 2: driver2 / driver123")
    print("📱 Driver 3: driver3 / driver123")

if __name__ == '__main__':
    create_sample_data()

#!/usr/bin/env python3
"""
Login System Setup Script
Creates admin users, driver authentication, and initial login data
"""

import os
import sys
import django
from datetime import datetime, timedelta
from django.contrib.auth.hashers import make_password

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from usermanagement.models import CustomUser, DriverAuthentication
from drivers.models import Driver, DriverAuth
from company.models import Company

def create_admin_users():
    """Create admin users for the system"""
    print("👤 Creating Admin Users...")
    
    admin_users = [
        {
            'email': 'admin@company.com',
            'first_name': 'Super',
            'last_name': 'Admin',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True,
            'password': 'admin123'
        },
        {
            'email': 'hr@company.com',
            'first_name': 'HR',
            'last_name': 'Manager',
            'role': 'hr',
            'is_staff': True,
            'is_superuser': False,
            'password': 'hr123'
        },
        {
            'email': 'manager@company.com',
            'first_name': 'Fleet',
            'last_name': 'Manager',
            'role': 'manager',
            'is_staff': True,
            'is_superuser': False,
            'password': 'manager123'
        },
        {
            'email': 'accountant@company.com',
            'first_name': 'Chief',
            'last_name': 'Accountant',
            'role': 'accountant',
            'is_staff': True,
            'is_superuser': False,
            'password': 'accountant123'
        }
    ]
    
    created_users = []
    for user_data in admin_users:
        password = user_data.pop('password')
        user, created = CustomUser.objects.get_or_create(
            email=user_data['email'],
            defaults=user_data
        )
        
        if created:
            user.set_password(password)
            user.save()
            print(f"✅ Created Admin User: {user.email} ({user.role})")
        else:
            print(f"ℹ️ Admin User already exists: {user.email}")
        
        created_users.append({
            'email': user.email,
            'password': password,
            'role': user.role,
            'name': f"{user.first_name} {user.last_name}"
        })
    
    return created_users

def create_driver_authentication():
    """Create driver authentication for mobile app login"""
    print("\n🔐 Creating Driver Authentication...")
    
    # Get all approved drivers
    drivers = Driver.objects.filter(status='approved')
    
    if not drivers.exists():
        print("⚠️ No approved drivers found. Creating sample drivers first...")
        create_sample_drivers()
        drivers = Driver.objects.filter(status='approved')
    
    created_auths = []
    for i, driver in enumerate(drivers):
        # Create DriverAuth (new system)
        driver_auth, created = DriverAuth.objects.get_or_create(
            driver=driver,
            defaults={
                'username': f'driver{i+1:03d}',  # driver001, driver002, etc.
                'is_active': True,
                'failed_login_attempts': 0,
            }
        )
        
        if created:
            # Set password
            driver_auth.set_password('driver123')
            driver_auth.save()
            print(f"✅ Created DriverAuth: {driver_auth.username} for {driver.driver_name}")
        else:
            print(f"ℹ️ DriverAuth already exists: {driver_auth.username}")
        
        # Also create DriverAuthentication (legacy system for compatibility)
        driver_auth_legacy, created_legacy = DriverAuthentication.objects.get_or_create(
            driver=driver,
            defaults={
                'username': f'driver{i+1:03d}',
                'password_hash': make_password('driver123'),
                'status': 'active',
            }
        )
        
        if created_legacy:
            print(f"✅ Created DriverAuthentication (legacy): {driver_auth_legacy.username}")
        
        created_auths.append({
            'username': driver_auth.username,
            'password': 'driver123',
            'driver_name': driver.driver_name,
            'driver_id': driver.id,
            'mobile': driver.mobile,
            'iqama': driver.iqama
        })
    
    return created_auths

def create_sample_drivers():
    """Create sample drivers if none exist"""
    print("👨‍💼 Creating Sample Drivers...")
    
    # Get or create a company first
    company, _ = Company.objects.get_or_create(
        company_name='Sample Transport Company',
        defaults={
            'address': '123 Main Street, City',
            'contact_phone': '+966501234567',
            'contact_email': 'info@company.com',
            'registration_number': 'LIC123456',
            'city': 'Riyadh',
            'country': 'Saudi Arabia',
            'contact_person': 'Admin Manager'
        }
    )
    
    sample_drivers = [
        {
            'driver_name': 'Ahmed Al-Rashid',
            'full_name': 'Ahmed Al-Rashid',
            'iqama': '1234567890',
            'mobile': '+966501234567',
            'phone_number': '+966501234567',
            'nationality': 'Saudi',
            'licence_number': 'LIC001',
            'licence_expiry': datetime.now().date() + timedelta(days=365),
            'gender': 'male',
            'vehicle_type': 'car',
            'company': company.company_name,
        },
        {
            'driver_name': 'Mohammed Al-Fahad',
            'full_name': 'Mohammed Al-Fahad',
            'iqama': '1234567891',
            'mobile': '+966501234568',
            'phone_number': '+966501234568',
            'nationality': 'Saudi',
            'licence_number': 'LIC002',
            'licence_expiry': datetime.now().date() + timedelta(days=365),
            'gender': 'male',
            'vehicle_type': 'bike',
            'company': company.company_name,
        },
        {
            'driver_name': 'Abdullah Al-Mansour',
            'full_name': 'Abdullah Al-Mansour',
            'iqama': '1234567892',
            'mobile': '+966501234569',
            'phone_number': '+966501234569',
            'nationality': 'Saudi',
            'licence_number': 'LIC003',
            'licence_expiry': datetime.now().date() + timedelta(days=365),
            'gender': 'male',
            'vehicle_type': 'van',
            'company': company.company_name,
        }
    ]
    
    for driver_data in sample_drivers:
        driver, created = Driver.objects.get_or_create(
            iqama=driver_data['iqama'],
            defaults={
                **driver_data,
                'status': 'approved',
                'dob': datetime.now().date() - timedelta(days=365*30),  # 30 years old
            }
        )

        if created:
            print(f"✅ Created Driver: {driver.driver_name}")

def print_login_credentials(admin_users, driver_auths):
    """Print all login credentials"""
    print("\n" + "="*60)
    print("🔑 LOGIN CREDENTIALS SUMMARY")
    print("="*60)
    
    print("\n📊 ADMIN DASHBOARD LOGIN:")
    print("URL: http://localhost:3000/login")
    print("-" * 40)
    for user in admin_users:
        print(f"Role: {user['role'].upper()}")
        print(f"Email: {user['email']}")
        print(f"Password: {user['password']}")
        print(f"Name: {user['name']}")
        print("-" * 40)
    
    print("\n📱 MOBILE APP LOGIN:")
    print("Mobile App: Flutter Driver App")
    print("-" * 40)
    for auth in driver_auths:
        print(f"Driver: {auth['driver_name']}")
        print(f"Username: {auth['username']}")
        print(f"Password: {auth['password']}")
        print(f"Mobile: {auth['mobile']}")
        print(f"ID: {auth['iqama']}")
        print("-" * 40)
    
    print("\n🌐 API ENDPOINTS:")
    print("Admin Login: POST /api/auth/login/")
    print("Driver Login: POST /api/drivers/login/")
    print("Driver Profile: GET /api/drivers/profile/")
    
    print("\n💡 QUICK START:")
    print("1. Start backend: python manage.py runserver")
    print("2. Start frontend: npm start")
    print("3. Start mobile app: flutter run")
    print("4. Use credentials above to login")

def main():
    """Main setup function"""
    print("🚀 Setting up Login System...")
    print("="*60)
    
    try:
        # Create admin users
        admin_users = create_admin_users()
        
        # Create driver authentication
        driver_auths = create_driver_authentication()
        
        # Print credentials
        print_login_credentials(admin_users, driver_auths)
        
        print("\n✅ Login system setup completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error setting up login system: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()

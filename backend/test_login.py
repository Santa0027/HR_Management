#!/usr/bin/env python3
"""
Login Test Script
Tests both admin and driver authentication systems
"""

import os
import sys
import django
import requests
import json

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import authenticate
from usermanagement.models import CustomUser
from drivers.models import DriverAuth

def test_admin_login():
    """Test admin login authentication"""
    print("🔐 Testing Admin Login...")
    
    test_users = [
        {'email': 'admin@company.com', 'password': 'admin123', 'role': 'Super Admin'},
        {'email': 'hr@company.com', 'password': 'hr123', 'role': 'HR Manager'},
        {'email': 'manager@company.com', 'password': 'manager123', 'role': 'Fleet Manager'},
        {'email': 'accountant@company.com', 'password': 'accountant123', 'role': 'Accountant'},
    ]
    
    for user_data in test_users:
        try:
            user = authenticate(username=user_data['email'], password=user_data['password'])
            if user:
                print(f"✅ {user_data['role']}: {user_data['email']} - Login successful")
            else:
                print(f"❌ {user_data['role']}: {user_data['email']} - Login failed")
        except Exception as e:
            print(f"❌ {user_data['role']}: Error - {e}")

def test_driver_login():
    """Test driver login authentication"""
    print("\n🚗 Testing Driver Login...")
    
    driver_auths = DriverAuth.objects.all()[:3]  # Test first 3 drivers
    
    for driver_auth in driver_auths:
        try:
            # Test password verification
            if driver_auth.check_password('driver123'):
                print(f"✅ Driver: {driver_auth.username} ({driver_auth.driver.driver_name}) - Login successful")
            else:
                print(f"❌ Driver: {driver_auth.username} - Login failed")
        except Exception as e:
            print(f"❌ Driver: {driver_auth.username} - Error: {e}")

def test_api_endpoints():
    """Test API endpoints"""
    print("\n🌐 Testing API Endpoints...")
    
    base_url = "http://127.0.0.1:8000"
    
    # Test admin login endpoint
    print("Testing Admin Login API...")
    try:
        response = requests.post(f"{base_url}/api/auth/login/", json={
            'email': 'admin@company.com',
            'password': 'admin123'
        }, timeout=5)
        
        if response.status_code == 200:
            print("✅ Admin Login API - Working")
        else:
            print(f"❌ Admin Login API - Status: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"⚠️ Admin Login API - Server not running or error: {e}")
    
    # Test driver login endpoint
    print("Testing Driver Login API...")
    try:
        response = requests.post(f"{base_url}/api/drivers/login/", json={
            'username': 'driver001',
            'password': 'driver123'
        }, timeout=5)
        
        if response.status_code == 200:
            print("✅ Driver Login API - Working")
        else:
            print(f"❌ Driver Login API - Status: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"⚠️ Driver Login API - Server not running or error: {e}")

def print_login_guide():
    """Print login guide"""
    print("\n" + "="*60)
    print("📋 LOGIN TESTING GUIDE")
    print("="*60)
    
    print("\n🖥️ ADMIN DASHBOARD LOGIN:")
    print("URL: http://localhost:3000/login")
    print("Method: Email + Password")
    print("Test Accounts:")
    print("  - admin@company.com / admin123 (Super Admin)")
    print("  - hr@company.com / hr123 (HR Manager)")
    print("  - manager@company.com / manager123 (Fleet Manager)")
    print("  - accountant@company.com / accountant123 (Accountant)")
    
    print("\n📱 MOBILE APP LOGIN:")
    print("Method: Username + Password")
    print("Test Accounts:")
    print("  - driver001 / driver123")
    print("  - driver002 / driver123")
    print("  - driver003 / driver123")
    
    print("\n🔧 API TESTING:")
    print("Admin Login: POST /api/auth/login/")
    print("Driver Login: POST /api/drivers/login/")
    print("Driver Profile: GET /api/drivers/profile/")
    
    print("\n💡 TROUBLESHOOTING:")
    print("1. Make sure backend server is running: python manage.py runserver")
    print("2. Check database migrations: python manage.py migrate")
    print("3. Verify user creation: python setup_login_system.py")
    print("4. Check API documentation: http://localhost:8000/api/docs")

def main():
    """Main test function"""
    print("🧪 LOGIN SYSTEM TESTING")
    print("="*60)
    
    # Test database authentication
    test_admin_login()
    test_driver_login()
    
    # Test API endpoints
    test_api_endpoints()
    
    # Print guide
    print_login_guide()
    
    print("\n✅ Login testing completed!")

if __name__ == '__main__':
    main()

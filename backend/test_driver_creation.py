#!/usr/bin/env python3
"""
Test script to verify driver creation API works correctly
"""
import os
import sys
import django
import json

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hr_management.settings')
django.setup()

from drivers.models import Driver
from drivers.serializers import DriverSerializer
from vehicle.models import VehicleRegistration
from company.models import Company

def test_driver_creation():
    """Test driver creation with and without vehicle/company"""
    
    print("🧪 Testing Driver Creation API...")
    
    # Test 1: Create driver without vehicle and company (should work now)
    print("\n1️⃣ Testing driver creation without vehicle/company...")
    
    driver_data_minimal = {
        'driver_name': 'Test Driver 1',
        'gender': 'male',
        'iqama': '1234567890',
        'mobile': '+966987654321',
        'city': 'Riyadh',
        'nationality': 'Saudi Arabia',
        'status': 'pending'
    }
    
    serializer = DriverSerializer(data=driver_data_minimal)
    if serializer.is_valid():
        driver = serializer.save()
        print(f"✅ Driver created successfully: {driver.driver_name} (ID: {driver.id})")
        print(f"   Vehicle: {driver.vehicle}")
        print(f"   Company: {driver.company}")
    else:
        print(f"❌ Validation failed: {serializer.errors}")
    
    # Test 2: Create driver with vehicle and company (if they exist)
    print("\n2️⃣ Testing driver creation with vehicle/company...")
    
    # Try to get existing vehicle and company
    vehicle = VehicleRegistration.objects.first()
    company = Company.objects.first()
    
    driver_data_full = {
        'driver_name': 'Test Driver 2',
        'gender': 'female',
        'iqama': '0987654321',
        'mobile': '+966123456789',
        'city': 'Jeddah',
        'nationality': 'Saudi Arabia',
        'status': 'approved'
    }
    
    if vehicle:
        driver_data_full['vehicle_id'] = vehicle.id
        print(f"   Using vehicle: {vehicle.vehicle_name}")
    
    if company:
        driver_data_full['Company_id'] = company.id
        print(f"   Using company: {company.company_name}")
    
    serializer = DriverSerializer(data=driver_data_full)
    if serializer.is_valid():
        driver = serializer.save()
        print(f"✅ Driver created successfully: {driver.driver_name} (ID: {driver.id})")
        print(f"   Vehicle: {driver.vehicle}")
        print(f"   Company: {driver.company}")
    else:
        print(f"❌ Validation failed: {serializer.errors}")
    
    # Test 3: Test with invalid data
    print("\n3️⃣ Testing driver creation with invalid data...")
    
    driver_data_invalid = {
        'driver_name': '',  # Empty name should fail
        'gender': 'male',
        'iqama': '123',  # Too short
        'mobile': 'invalid',
        'city': 'Riyadh'
    }
    
    serializer = DriverSerializer(data=driver_data_invalid)
    if serializer.is_valid():
        print("❌ Validation should have failed but didn't!")
    else:
        print(f"✅ Validation correctly failed: {serializer.errors}")
    
    print("\n📊 Current driver count:", Driver.objects.count())
    print("📊 Current vehicle count:", VehicleRegistration.objects.count())
    print("📊 Current company count:", Company.objects.count())

if __name__ == '__main__':
    test_driver_creation()

#!/usr/bin/env python3
"""
Test script to debug driver-company relationship issues
"""
import os
import sys
import django
import json

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from drivers.models import Driver
from drivers.serializers import DriverSerializer
from vehicle.models import VehicleRegistration
from company.models import Company

def test_driver_company_relationship():
    """Test driver creation with company assignment"""
    
    print("🧪 Testing Driver-Company Relationship...")
    
    # Check existing data
    print(f"\n📊 Current Data:")
    print(f"   Drivers: {Driver.objects.count()}")
    print(f"   Companies: {Company.objects.count()}")
    print(f"   Vehicles: {VehicleRegistration.objects.count()}")
    
    # List existing companies
    companies = Company.objects.all()
    print(f"\n🏢 Available Companies:")
    for company in companies:
        print(f"   ID: {company.id}, Name: {company.company_name}")
    
    # List existing vehicles
    vehicles = VehicleRegistration.objects.all()
    print(f"\n🚗 Available Vehicles:")
    for vehicle in vehicles:
        print(f"   ID: {vehicle.id}, Name: {vehicle.vehicle_name}")
    
    # Test 1: Create driver with company (if company exists)
    if companies.exists():
        company = companies.first()
        print(f"\n1️⃣ Testing driver creation with company: {company.company_name}")
        
        driver_data = {
            'driver_name': 'Test Driver with Company',
            'gender': 'male',
            'iqama': '1111111111',
            'mobile': '+966555111111',
            'city': 'Riyadh',
            'nationality': 'Saudi Arabia',
            'status': 'pending',
            'Company_id': company.id
        }
        
        print(f"   Submitting data: {driver_data}")
        
        serializer = DriverSerializer(data=driver_data)
        if serializer.is_valid():
            driver = serializer.save()
            print(f"   ✅ Driver created: {driver.driver_name}")
            print(f"   Company assigned: {driver.company}")
            print(f"   Company ID: {driver.company.id if driver.company else 'None'}")
            print(f"   Company Name: {driver.company.company_name if driver.company else 'None'}")
        else:
            print(f"   ❌ Validation failed: {serializer.errors}")
    else:
        print("\n1️⃣ No companies available for testing")
    
    # Test 2: Create driver with vehicle (if vehicle exists)
    if vehicles.exists():
        vehicle = vehicles.first()
        print(f"\n2️⃣ Testing driver creation with vehicle: {vehicle.vehicle_name}")
        
        driver_data = {
            'driver_name': 'Test Driver with Vehicle',
            'gender': 'female',
            'iqama': '2222222222',
            'mobile': '+966555222222',
            'city': 'Jeddah',
            'nationality': 'Saudi Arabia',
            'status': 'pending',
            'vehicle_id': vehicle.id
        }
        
        print(f"   Submitting data: {driver_data}")
        
        serializer = DriverSerializer(data=driver_data)
        if serializer.is_valid():
            driver = serializer.save()
            print(f"   ✅ Driver created: {driver.driver_name}")
            print(f"   Vehicle assigned: {driver.vehicle}")
            print(f"   Vehicle ID: {driver.vehicle.id if driver.vehicle else 'None'}")
            print(f"   Vehicle Name: {driver.vehicle.vehicle_name if driver.vehicle else 'None'}")
        else:
            print(f"   ❌ Validation failed: {serializer.errors}")
    else:
        print("\n2️⃣ No vehicles available for testing")
    
    # Test 3: Create driver with both company and vehicle
    if companies.exists() and vehicles.exists():
        company = companies.first()
        vehicle = vehicles.first()
        print(f"\n3️⃣ Testing driver creation with both company and vehicle")
        
        driver_data = {
            'driver_name': 'Test Driver Full',
            'gender': 'male',
            'iqama': '3333333333',
            'mobile': '+966555333333',
            'city': 'Dammam',
            'nationality': 'Saudi Arabia',
            'status': 'pending',
            'Company_id': company.id,
            'vehicle_id': vehicle.id
        }
        
        print(f"   Submitting data: {driver_data}")
        
        serializer = DriverSerializer(data=driver_data)
        if serializer.is_valid():
            driver = serializer.save()
            print(f"   ✅ Driver created: {driver.driver_name}")
            print(f"   Company: {driver.company.company_name if driver.company else 'None'}")
            print(f"   Vehicle: {driver.vehicle.vehicle_name if driver.vehicle else 'None'}")
        else:
            print(f"   ❌ Validation failed: {serializer.errors}")
    else:
        print("\n3️⃣ Missing companies or vehicles for full testing")
    
    # Test 4: Check the latest driver from the API call
    print(f"\n4️⃣ Checking latest driver (Ram)...")
    try:
        ram_driver = Driver.objects.get(driver_name='Ram')
        print(f"   Driver: {ram_driver.driver_name}")
        print(f"   IQAMA: {ram_driver.iqama}")
        print(f"   Company: {ram_driver.company}")
        print(f"   Vehicle: {ram_driver.vehicle}")
        print(f"   Status: {ram_driver.status}")
    except Driver.DoesNotExist:
        print("   Ram driver not found")
    
    print(f"\n📊 Final Data Count:")
    print(f"   Total Drivers: {Driver.objects.count()}")

if __name__ == '__main__':
    test_driver_company_relationship()

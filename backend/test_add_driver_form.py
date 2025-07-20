#!/usr/bin/env python3
"""
Test script for the Add Driver Form functionality
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_form_apis():
    """Test all APIs that the form depends on"""
    print("🔍 Testing Add Driver Form APIs...")
    
    # Test 1: Dropdown Options API
    print("\n1. Testing dropdown options...")
    try:
        response = requests.get(f"{BASE_URL}/dropdown-options/")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Dropdown options: {len(data.get('countries', []))} countries, {len(data.get('vehicle_types', []))} vehicle types")
        else:
            print(f"   ❌ Dropdown options failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Dropdown options error: {e}")
        return False
    
    # Test 2: Companies with Accessories API
    print("\n2. Testing companies with accessories...")
    try:
        response = requests.get(f"{BASE_URL}/companies-with-accessories/")
        if response.status_code == 200:
            companies = response.json()
            companies_with_accessories = [c for c in companies if c.get('employee_accessories')]
            print(f"   ✅ Companies: {len(companies)} total, {len(companies_with_accessories)} with accessories")
            
            if companies_with_accessories:
                example = companies_with_accessories[0]
                print(f"   📋 Example: {example['company_name']} has {len(example['employee_accessories'])} accessories")
                return example
        else:
            print(f"   ❌ Companies API failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Companies API error: {e}")
        return False
    
    return True

def test_new_driver_submission(company):
    """Test new driver form submission"""
    print("\n3. Testing new driver form submission...")
    
    driver_data = {
        "driver_type": "new",
        "full_name": "Test Driver Ahmed",
        "gender": "male",
        "date_of_birth": "1992-03-20",
        "nationality": "Kuwait",
        "phone_number": "+96512345678",
        "city": "Kuwait City",
        "apartment_area": "Salmiya Block 2",
        "home_country_address": "Test Address Kuwait",
        "home_country_phone": "+96512345679",
        "company": company['company_name'] if company else "Test Company",
        "vehicle_type": "bike",
        "vehicle_destination": "Local delivery",
        "kuwait_entry_date": "2023-02-01",
        "marital_status": "single",
        "blood_group": "A+",
        "t_shirt_size": "L",
        "weight": "75.0",
        "height": "180.0",
        "nominee_name": "Test Nominee",
        "nominee_relationship": "father",
        "nominee_phone": "+96512345680",
        "nominee_address": "Test Nominee Address",
        "t_shirt_quantity": 2,
        "cap_quantity": 1,
        "helmet_quantity": 1,
        "bag_quantity": 1,
        "safety_gear_quantity": 1
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/submit-form/",
            json=driver_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 201:
            result = response.json()
            print(f"   ✅ New driver submitted successfully!")
            print(f"   📋 Application created with ID: {result.get('id', 'N/A')}")
            return True
        else:
            print(f"   ❌ New driver submission failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   📋 Error details: {error_data}")
            except:
                print(f"   📋 Response: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ New driver submission error: {e}")
        return False

def test_working_driver_submission(company):
    """Test working driver form submission"""
    print("\n4. Testing working driver form submission...")
    
    driver_data = {
        "driver_type": "working",
        "employee_id": "EMP001",
        "full_name": "Working Driver Hassan",
        "gender": "male",
        "date_of_birth": "1988-07-15",
        "nationality": "Kuwait",
        "phone_number": "+96512345681",
        "vehicle_type": "car",
        "vehicle_model": "Toyota Camry",
        "vehicle_number": "KWT123",
        "vehicle_expiry_date": "2025-12-31",
        "working_department": "delivery",
        "civil_id_number": "123456789",
        "civil_id_expiry": "2026-01-01",
        "license_number": "LIC123456",
        "license_expiry_date": "2025-06-30",
        "health_card_expiry": "2025-03-15",
        "company": company['company_name'] if company else "Test Company",
        "t_shirt_quantity": 3,
        "cap_quantity": 2,
        "helmet_quantity": 1,
        "bag_quantity": 1,
        "safety_gear_quantity": 2
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/submit-form/",
            json=driver_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 201:
            result = response.json()
            print(f"   ✅ Working driver submitted successfully!")
            print(f"   📋 Driver created with ID: {result.get('id', 'N/A')}")
            return True
        else:
            print(f"   ❌ Working driver submission failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   📋 Error details: {error_data}")
            except:
                print(f"   📋 Response: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ Working driver submission error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Testing Add Driver Form Complete Functionality")
    print("=" * 60)
    
    # Test APIs
    company = test_form_apis()
    if not company:
        print("\n❌ API tests failed. Cannot proceed with form submissions.")
        return
    
    # Test form submissions
    new_driver_success = test_new_driver_submission(company)
    working_driver_success = test_working_driver_submission(company)
    
    print("\n" + "=" * 60)
    if new_driver_success and working_driver_success:
        print("🎉 All tests passed! Add Driver Form is working correctly.")
        print("✅ Frontend can now successfully submit both new and working driver forms.")
    else:
        print("❌ Some tests failed. Check the errors above.")
    print("=" * 60)

if __name__ == "__main__":
    main()

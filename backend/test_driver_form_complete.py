#!/usr/bin/env python3
"""
Complete test script for driver form with company selection and accessories
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_dropdown_options():
    """Test dropdown options API"""
    print("🔍 Testing dropdown options API...")
    response = requests.get(f"{BASE_URL}/dropdown-options/")
    if response.status_code == 200:
        data = response.json()
        print("✅ Dropdown options API working")
        print(f"   - Countries: {len(data.get('countries', []))}")
        print(f"   - Cities: {len(data.get('cities', {}).get('Kuwait', []))}")
        print(f"   - Vehicle types: {len(data.get('vehicle_types', []))}")
        return True
    else:
        print(f"❌ Dropdown options API failed: {response.status_code}")
        return False

def test_companies_with_accessories():
    """Test companies with accessories API"""
    print("\n🔍 Testing companies with accessories API...")
    response = requests.get(f"{BASE_URL}/companies-with-accessories/")
    if response.status_code == 200:
        companies = response.json()
        print(f"✅ Companies API working - Found {len(companies)} companies")
        
        # Find companies with accessories
        companies_with_accessories = [c for c in companies if c.get('employee_accessories')]
        print(f"   - Companies with accessories: {len(companies_with_accessories)}")
        
        if companies_with_accessories:
            company = companies_with_accessories[0]
            print(f"   - Example: {company['company_name']} has {len(company['employee_accessories'])} accessories")
            return company
        else:
            print("   - No companies with accessories found")
            return companies[0] if companies else None
    else:
        print(f"❌ Companies API failed: {response.status_code}")
        return None

def test_driver_form_submission(company):
    """Test driver form submission"""
    print("\n🔍 Testing driver form submission...")
    
    driver_data = {
        "driver_type": "new",
        "full_name": "Ahmed Hassan Test",
        "gender": "male",
        "date_of_birth": "1990-05-15",
        "nationality": "Kuwait",
        "phone_number": "+96512345678",
        "city": "Kuwait City",
        "apartment_area": "Salmiya Block 1",
        "home_country_address": "Test Address 123, Kuwait City",
        "home_country_phone": "+96512345679",
        "company": company['company_name'],
        "vehicle_type": "bike",
        "vehicle_destination": "Local delivery",
        "kuwait_entry_date": "2023-01-15",
        "marital_status": "single",
        "blood_group": "O+",
        "t_shirt_size": "M",
        "weight": "70.5",
        "height": "175.0",
        "nominee_name": "Hassan Ahmed",
        "nominee_relationship": "father",
        "nominee_phone": "+96512345680",
        "nominee_address": "Test Nominee Address, Kuwait",
        "t_shirt_quantity": 2,
        "cap_quantity": 1,
        "helmet_quantity": 1,
        "bag_quantity": 1,
        "safety_gear_quantity": 1
    }
    
    response = requests.post(
        f"{BASE_URL}/submit-form/",
        json=driver_data,
        headers={'Content-Type': 'application/json'}
    )
    
    if response.status_code == 201:
        result = response.json()
        print("✅ Driver form submission successful")
        print(f"   - Driver ID: {result.get('id')}")
        print(f"   - Application Number: {result.get('application_number')}")
        return True
    else:
        print(f"❌ Driver form submission failed: {response.status_code}")
        try:
            error_data = response.json()
            print(f"   - Error: {error_data}")
        except:
            print(f"   - Response: {response.text}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting Complete Driver Form Test Suite")
    print("=" * 50)
    
    # Test 1: Dropdown options
    if not test_dropdown_options():
        return
    
    # Test 2: Companies with accessories
    company = test_companies_with_accessories()
    if not company:
        return
    
    # Test 3: Driver form submission
    if test_driver_form_submission(company):
        print("\n🎉 All tests passed! Driver form is working correctly.")
    else:
        print("\n❌ Driver form submission failed.")
    
    print("=" * 50)

if __name__ == "__main__":
    main()

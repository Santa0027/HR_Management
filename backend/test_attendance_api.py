#!/usr/bin/env python3
"""
Driver Attendance API Test Script

This script demonstrates how to use the Driver Attendance API endpoints
with geolocation validation and check-in location authentication.
"""

import requests
import json
import base64
from datetime import datetime

# API Configuration
BASE_URL = "http://localhost:8000/hr/attendance"
DRIVER_ID = 3  # Test driver ID

def test_driver_status():
    """Test getting driver status"""
    print("🔍 Testing Driver Status API...")
    
    url = f"{BASE_URL}/driver-status/{DRIVER_ID}/"
    response = requests.get(url)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print("-" * 50)
    
    return response.json()

def test_driver_locations():
    """Test getting driver authorized locations"""
    print("📍 Testing Driver Locations API...")
    
    url = f"{BASE_URL}/locations/{DRIVER_ID}/"
    response = requests.get(url)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print("-" * 50)
    
    return response.json()

def test_driver_login():
    """Test driver check-in with geolocation"""
    print("🚀 Testing Driver Login API...")
    
    # Sample check-in data (using coordinates from authorized location)
    login_data = {
        "driver": DRIVER_ID,
        "login_time": datetime.now().strftime("%H:%M:%S"),
        "login_latitude": "24.7136",  # Main Office coordinates
        "login_longitude": "46.6753",
        "platform": "test_script"
    }
    
    url = f"{BASE_URL}/login/"
    response = requests.post(url, json=login_data)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print("-" * 50)
    
    return response.json()

def test_driver_logout(attendance_id):
    """Test driver check-out"""
    print("🏁 Testing Driver Logout API...")
    
    logout_data = {
        "logout_time": datetime.now().strftime("%H:%M:%S"),
        "logout_latitude": "24.7140",  # Slightly different coordinates
        "logout_longitude": "46.6750"
    }
    
    url = f"{BASE_URL}/{attendance_id}/logout/"
    response = requests.patch(url, json=logout_data)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print("-" * 50)
    
    return response.json()

def test_current_day_attendance():
    """Test getting current day attendance"""
    print("📅 Testing Current Day Attendance API...")
    
    url = f"{BASE_URL}/current-day/{DRIVER_ID}/"
    response = requests.get(url)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print("-" * 50)
    
    return response.json()

def test_location_validation_failure():
    """Test location validation failure scenario"""
    print("❌ Testing Location Validation Failure...")
    
    # Use coordinates far from authorized locations
    login_data = {
        "driver": DRIVER_ID,
        "login_time": datetime.now().strftime("%H:%M:%S"),
        "login_latitude": "25.0000",  # Far from authorized location
        "login_longitude": "47.0000",
        "platform": "test_script"
    }
    
    url = f"{BASE_URL}/login/"
    response = requests.post(url, json=login_data)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print("-" * 50)
    
    return response.json()

def main():
    """Run all API tests"""
    print("🧪 Driver Attendance API Test Suite")
    print("=" * 60)
    
    try:
        # Test 1: Get driver status
        status_result = test_driver_status()
        
        # Test 2: Get driver locations
        locations_result = test_driver_locations()
        
        # Test 3: Get current day attendance
        current_attendance = test_current_day_attendance()
        
        # Test 4: Test location validation failure
        test_location_validation_failure()
        
        # Test 5: Driver login (only if not already checked in)
        if status_result.get("can_check_in", False):
            login_result = test_driver_login()
            
            # Test 6: Driver logout (if login was successful)
            if login_result.get("success") and "attendance" in login_result:
                attendance_id = login_result["attendance"]["id"]
                test_driver_logout(attendance_id)
        else:
            print("⚠️ Driver already checked in today. Skipping login test.")
            
            # If already checked in, test logout
            if status_result.get("can_check_out", False):
                attendance_id = status_result.get("attendance_id")
                if attendance_id:
                    test_driver_logout(attendance_id)
        
        print("✅ All tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to the API server.")
        print("Make sure the Django server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    main()

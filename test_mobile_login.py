#!/usr/bin/env python3
"""
Test script to verify mobile app login API integration
"""
import requests
import json

# Test configuration
BASE_URL = "http://127.0.0.1:8000"
TEST_CREDENTIALS = {
    "email": "driver@hrmanagement.com",
    "password": "driver123"
}

def test_login():
    """Test the login endpoint"""
    print("🔐 Testing Login API...")
    
    url = f"{BASE_URL}/auth/login/"
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    try:
        response = requests.post(url, json=TEST_CREDENTIALS, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login successful!")
            print(f"User ID: {data.get('user_id')}")
            print(f"Role: {data.get('role')}")
            print(f"Name: {data.get('name')}")
            print(f"Email: {data.get('email')}")
            print(f"Access Token: {data.get('access', 'N/A')[:50]}...")
            print(f"Refresh Token: {data.get('refresh', 'N/A')[:50]}...")
            return data.get('access')
        else:
            print(f"❌ Login failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error during login: {e}")
        return None

def test_current_user(access_token):
    """Test the current user endpoint"""
    print("\n👤 Testing Current User API...")
    
    url = f"{BASE_URL}/auth/me/"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Current user data retrieved!")
            print(f"ID: {data.get('id')}")
            print(f"Email: {data.get('email')}")
            print(f"First Name: {data.get('first_name')}")
            print(f"Last Name: {data.get('last_name')}")
            print(f"Role: {data.get('role')}")
            print(f"Active: {data.get('is_active')}")
        else:
            print(f"❌ Current user failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error getting current user: {e}")

def test_attendance_current_day(access_token, user_id):
    """Test the current day attendance endpoint"""
    print(f"\n📅 Testing Current Day Attendance API for user {user_id}...")
    
    url = f"{BASE_URL}/attendance/current-day/{user_id}/"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Current day attendance found!")
            print(f"ID: {data.get('id')}")
            print(f"Date: {data.get('date')}")
            print(f"Login Time: {data.get('login_time')}")
            print(f"Logout Time: {data.get('logout_time')}")
        elif response.status_code == 404:
            print("ℹ️ No attendance record for today (expected for new user)")
        else:
            print(f"❌ Attendance check failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error checking attendance: {e}")

def test_attendance_login(access_token, driver_id):
    """Test the attendance login endpoint"""
    print(f"\n⏰ Testing Attendance Login API for driver {driver_id}...")

    url = f"{BASE_URL}/attendance/login/"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    data = {
        "driver": driver_id,
        "login_time": "09:00:00",
        "login_latitude": "24.713600",  # Exact coordinates from our checkin location
        "login_longitude": "46.675300"
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code in [200, 201]:
            response_data = response.json()
            print("✅ Attendance login successful!")
            print(f"Attendance ID: {response_data.get('id')}")
            print(f"Date: {response_data.get('date')}")
            print(f"Login Time: {response_data.get('login_time')}")
            return response_data.get('id')
        else:
            print(f"❌ Attendance login failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error during attendance login: {e}")
        return None

def main():
    """Main test function"""
    print("🚀 Starting Mobile App API Integration Tests")
    print("=" * 50)
    
    # Test login
    access_token = test_login()
    if not access_token:
        print("❌ Cannot proceed without valid access token")
        return
    
    # Test current user
    test_current_user(access_token)
    
    # Test attendance endpoints
    user_id = 5  # From login response
    driver_id = 3  # From our test driver setup
    test_attendance_current_day(access_token, driver_id)

    # Test attendance login
    attendance_id = test_attendance_login(access_token, driver_id)
    
    print("\n" + "=" * 50)
    print("🎉 API Integration Tests Completed!")
    print("\n📱 You can now test the mobile app with these credentials:")
    print(f"   Email: {TEST_CREDENTIALS['email']}")
    print(f"   Password: {TEST_CREDENTIALS['password']}")

if __name__ == "__main__":
    main()

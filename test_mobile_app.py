#!/usr/bin/env python3
"""
Mobile App Testing Script
Tests all mobile API endpoints and functionality
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "http://192.168.77.6:8000"
TEST_DRIVER_USERNAME = "driver1"
TEST_DRIVER_PASSWORD = "driver123"
TEST_DRIVER_ID = 1

class MobileAppTester:
    def __init__(self):
        self.access_token = None
        self.driver_data = None
        self.session = requests.Session()
        
    def log(self, message, status="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        status_emoji = {
            "INFO": "ℹ️",
            "SUCCESS": "✅", 
            "ERROR": "❌",
            "WARNING": "⚠️"
        }
        print(f"[{timestamp}] {status_emoji.get(status, 'ℹ️')} {message}")
        
    def test_mobile_login(self):
        """Test mobile driver login"""
        self.log("Testing mobile driver login...")
        
        url = f"{BASE_URL}/mobile/login/"
        data = {
            "username": TEST_DRIVER_USERNAME,
            "password": TEST_DRIVER_PASSWORD,
            "device_info": "Python Test Script"
        }
        
        try:
            response = self.session.post(url, json=data)
            
            if response.status_code == 200:
                result = response.json()
                self.access_token = result.get('access_token')
                self.driver_data = result.get('driver')
                self.log(f"Mobile login successful for driver: {self.driver_data['name']}", "SUCCESS")
                return True
            else:
                self.log(f"Mobile login failed: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"Mobile login error: {str(e)}", "ERROR")
            return False
            
    def test_driver_profile(self):
        """Test driver profile endpoint"""
        self.log("Testing driver profile endpoint...")
        
        url = f"{BASE_URL}/mobile/profile/{TEST_DRIVER_ID}/"
        
        try:
            response = self.session.get(url)
            
            if response.status_code == 200:
                profile = response.json()
                self.log(f"Driver profile loaded: {profile['driver_name']}", "SUCCESS")
                return True
            else:
                self.log(f"Driver profile failed: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"Driver profile error: {str(e)}", "ERROR")
            return False
            
    def test_attendance_status(self):
        """Test attendance current day status"""
        self.log("Testing attendance status...")
        
        url = f"{BASE_URL}/hr/attendance/current-day/{TEST_DRIVER_ID}/"
        
        try:
            response = self.session.get(url)
            
            if response.status_code == 200:
                attendance = response.json()
                self.log(f"Attendance status: {attendance['status']}", "SUCCESS")
                return True
            else:
                self.log(f"Attendance status failed: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"Attendance status error: {str(e)}", "ERROR")
            return False
            
    def test_checkin_locations(self):
        """Test check-in locations endpoint"""
        self.log("Testing check-in locations...")
        
        url = f"{BASE_URL}/hr/checkin-locations/"
        
        try:
            response = self.session.get(url)
            
            if response.status_code == 200:
                locations = response.json()
                count = len(locations.get('results', locations))
                self.log(f"Check-in locations loaded: {count} locations", "SUCCESS")
                return True
            else:
                self.log(f"Check-in locations failed: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"Check-in locations error: {str(e)}", "ERROR")
            return False
            
    def test_trips_api(self):
        """Test trips API endpoints"""
        self.log("Testing trips API...")
        
        # Test driver stats
        url = f"{BASE_URL}/trips/trips/driver_stats/?driver_id={TEST_DRIVER_ID}"
        
        try:
            response = self.session.get(url)
            
            if response.status_code == 200:
                stats = response.json()
                self.log(f"Driver stats loaded: {stats['stats']['total_trips']} trips", "SUCCESS")
            else:
                self.log(f"Driver stats failed: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"Driver stats error: {str(e)}", "ERROR")
            return False
            
        # Test recent trips
        url = f"{BASE_URL}/trips/trips/recent_trips/?driver_id={TEST_DRIVER_ID}&limit=5"
        
        try:
            response = self.session.get(url)
            
            if response.status_code == 200:
                trips = response.json()
                count = len(trips)
                self.log(f"Recent trips loaded: {count} trips", "SUCCESS")
                return True
            else:
                self.log(f"Recent trips failed: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"Recent trips error: {str(e)}", "ERROR")
            return False
            
    def test_leave_management(self):
        """Test leave management endpoints"""
        self.log("Testing leave management...")
        
        # Test leave types
        url = f"{BASE_URL}/hr/leave-types/"
        
        try:
            response = self.session.get(url)
            
            if response.status_code == 200:
                leave_types = response.json()
                count = len(leave_types.get('results', leave_types))
                self.log(f"Leave types loaded: {count} types", "SUCCESS")
            else:
                self.log(f"Leave types failed: {response.status_code} - {response.text}", "WARNING")
                
        except Exception as e:
            self.log(f"Leave types error: {str(e)}", "WARNING")
            
        # Test leave requests
        url = f"{BASE_URL}/hr/leave-requests/?driver={TEST_DRIVER_ID}"
        
        try:
            response = self.session.get(url)
            
            if response.status_code == 200:
                requests_data = response.json()
                count = len(requests_data.get('results', requests_data))
                self.log(f"Leave requests loaded: {count} requests", "SUCCESS")
                return True
            else:
                self.log(f"Leave requests failed: {response.status_code} - {response.text}", "WARNING")
                return False
                
        except Exception as e:
            self.log(f"Leave requests error: {str(e)}", "WARNING")
            return False
            
    def run_all_tests(self):
        """Run all mobile app tests"""
        self.log("🚀 Starting Mobile App API Tests", "INFO")
        self.log("=" * 50, "INFO")
        
        tests = [
            ("Mobile Login", self.test_mobile_login),
            ("Driver Profile", self.test_driver_profile),
            ("Attendance Status", self.test_attendance_status),
            ("Check-in Locations", self.test_checkin_locations),
            ("Trips API", self.test_trips_api),
            ("Leave Management", self.test_leave_management),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            self.log(f"\n--- Testing {test_name} ---", "INFO")
            if test_func():
                passed += 1
                
        self.log("\n" + "=" * 50, "INFO")
        self.log(f"🎯 Test Results: {passed}/{total} tests passed", "SUCCESS" if passed == total else "WARNING")
        
        if passed == total:
            self.log("🎉 All mobile app APIs are working correctly!", "SUCCESS")
        else:
            self.log(f"⚠️ {total - passed} test(s) failed. Check the logs above.", "WARNING")
            
        return passed == total

if __name__ == "__main__":
    tester = MobileAppTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)

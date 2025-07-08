#!/usr/bin/env python3
"""
Test Mandatory Photo and Location for Attendance
Tests the new validation requirements for driver check-in and check-out
"""

import requests
import json
import base64
from datetime import datetime

# Configuration
BASE_URL = "http://192.168.77.6:8000"
TEST_DRIVER_ID = 1

class AttendanceMandatoryTester:
    def __init__(self):
        self.session = requests.Session()
        
    def log(self, message, status="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        status_emoji = {
            "INFO": "ℹ️",
            "SUCCESS": "✅", 
            "ERROR": "❌",
            "WARNING": "⚠️",
            "TEST": "🧪"
        }
        print(f"[{timestamp}] {status_emoji.get(status, 'ℹ️')} {message}")
        
    def create_dummy_photo_base64(self):
        """Create a small dummy image as base64 for testing"""
        # Create a minimal 1x1 pixel PNG image
        png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82'
        return base64.b64encode(png_data).decode('utf-8')
        
    def test_checkin_without_photo(self):
        """Test check-in without photo - should fail"""
        self.log("Testing check-in without photo (should fail)", "TEST")
        
        url = f"{BASE_URL}/hr/attendance/login/"
        data = {
            "driver": TEST_DRIVER_ID,
            "login_time": "09:00:00",
            "login_latitude": "24.7136",
            "login_longitude": "46.6753",
            # No photo provided
        }
        
        try:
            response = self.session.post(url, json=data)
            
            if response.status_code == 400:
                result = response.json()
                if result.get('error') == 'PHOTO_REQUIRED':
                    self.log("✅ PASS: Check-in correctly rejected without photo", "SUCCESS")
                    self.log(f"   Message: {result.get('message')}", "INFO")
                    return True
                else:
                    self.log(f"❌ FAIL: Wrong error type: {result.get('error')}", "ERROR")
                    return False
            else:
                self.log(f"❌ FAIL: Check-in allowed without photo (status: {response.status_code})", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ ERROR: {str(e)}", "ERROR")
            return False
            
    def test_checkin_without_location(self):
        """Test check-in without location - should fail"""
        self.log("Testing check-in without location (should fail)", "TEST")
        
        url = f"{BASE_URL}/hr/attendance/login/"
        data = {
            "driver": TEST_DRIVER_ID,
            "login_time": "09:00:00",
            "login_photo_base64": self.create_dummy_photo_base64(),
            # No location provided
        }
        
        try:
            response = self.session.post(url, json=data)
            
            if response.status_code == 400:
                result = response.json()
                if result.get('error') == 'LOCATION_REQUIRED':
                    self.log("✅ PASS: Check-in correctly rejected without location", "SUCCESS")
                    self.log(f"   Message: {result.get('message')}", "INFO")
                    return True
                else:
                    self.log(f"❌ FAIL: Wrong error type: {result.get('error')}", "ERROR")
                    return False
            else:
                self.log(f"❌ FAIL: Check-in allowed without location (status: {response.status_code})", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ ERROR: {str(e)}", "ERROR")
            return False
            
    def test_checkin_with_photo_and_location(self):
        """Test check-in with both photo and location - should succeed"""
        self.log("Testing check-in with photo and location (should succeed)", "TEST")
        
        url = f"{BASE_URL}/hr/attendance/login/"
        data = {
            "driver": TEST_DRIVER_ID,
            "login_time": "09:00:00",
            "login_latitude": "24.7136",
            "login_longitude": "46.6753",
            "login_photo_base64": self.create_dummy_photo_base64(),
            "location_name": "Test Location",
            "notes": "Mandatory validation test"
        }
        
        try:
            response = self.session.post(url, json=data)
            
            if response.status_code in [200, 201]:
                result = response.json()
                if result.get('success'):
                    self.log("✅ PASS: Check-in successful with photo and location", "SUCCESS")
                    return result.get('attendance', {}).get('id')  # Return attendance ID for logout test
                else:
                    self.log(f"❌ FAIL: Check-in failed: {result.get('message')}", "ERROR")
                    return None
            else:
                self.log(f"❌ FAIL: Check-in failed (status: {response.status_code})", "ERROR")
                self.log(f"   Response: {response.text}", "ERROR")
                return None
                
        except Exception as e:
            self.log(f"❌ ERROR: {str(e)}", "ERROR")
            return None
            
    def test_checkout_without_photo(self, attendance_id):
        """Test check-out without photo - should fail"""
        if not attendance_id:
            self.log("⚠️ SKIP: No attendance ID for checkout test", "WARNING")
            return False
            
        self.log("Testing check-out without photo (should fail)", "TEST")
        
        url = f"{BASE_URL}/hr/attendance/{attendance_id}/logout/"
        data = {
            "logout_time": "17:00:00",
            "logout_latitude": "24.7136",
            "logout_longitude": "46.6753",
            # No photo provided
        }
        
        try:
            response = self.session.patch(url, json=data)
            
            if response.status_code == 400:
                result = response.json()
                if result.get('error') == 'PHOTO_REQUIRED':
                    self.log("✅ PASS: Check-out correctly rejected without photo", "SUCCESS")
                    self.log(f"   Message: {result.get('message')}", "INFO")
                    return True
                else:
                    self.log(f"❌ FAIL: Wrong error type: {result.get('error')}", "ERROR")
                    return False
            else:
                self.log(f"❌ FAIL: Check-out allowed without photo (status: {response.status_code})", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ ERROR: {str(e)}", "ERROR")
            return False
            
    def test_checkout_without_location(self, attendance_id):
        """Test check-out without location - should fail"""
        if not attendance_id:
            self.log("⚠️ SKIP: No attendance ID for checkout test", "WARNING")
            return False
            
        self.log("Testing check-out without location (should fail)", "TEST")
        
        url = f"{BASE_URL}/hr/attendance/{attendance_id}/logout/"
        data = {
            "logout_time": "17:00:00",
            "logout_photo_base64": self.create_dummy_photo_base64(),
            # No location provided
        }
        
        try:
            response = self.session.patch(url, json=data)
            
            if response.status_code == 400:
                result = response.json()
                if result.get('error') == 'LOCATION_REQUIRED':
                    self.log("✅ PASS: Check-out correctly rejected without location", "SUCCESS")
                    self.log(f"   Message: {result.get('message')}", "INFO")
                    return True
                else:
                    self.log(f"❌ FAIL: Wrong error type: {result.get('error')}", "ERROR")
                    return False
            else:
                self.log(f"❌ FAIL: Check-out allowed without location (status: {response.status_code})", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ ERROR: {str(e)}", "ERROR")
            return False
            
    def test_checkout_with_photo_and_location(self, attendance_id):
        """Test check-out with both photo and location - should succeed"""
        if not attendance_id:
            self.log("⚠️ SKIP: No attendance ID for checkout test", "WARNING")
            return False
            
        self.log("Testing check-out with photo and location (should succeed)", "TEST")
        
        url = f"{BASE_URL}/hr/attendance/{attendance_id}/logout/"
        data = {
            "logout_time": "17:00:00",
            "logout_latitude": "24.7136",
            "logout_longitude": "46.6753",
            "logout_photo_base64": self.create_dummy_photo_base64(),
            "notes": "Mandatory validation test checkout"
        }
        
        try:
            response = self.session.patch(url, json=data)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    self.log("✅ PASS: Check-out successful with photo and location", "SUCCESS")
                    return True
                else:
                    self.log(f"❌ FAIL: Check-out failed: {result.get('message')}", "ERROR")
                    return False
            else:
                self.log(f"❌ FAIL: Check-out failed (status: {response.status_code})", "ERROR")
                self.log(f"   Response: {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ ERROR: {str(e)}", "ERROR")
            return False
            
    def run_all_tests(self):
        """Run all mandatory validation tests"""
        self.log("🚀 Starting Mandatory Photo & Location Validation Tests", "INFO")
        self.log("=" * 60, "INFO")
        
        tests_passed = 0
        total_tests = 6
        
        # Test 1: Check-in without photo
        if self.test_checkin_without_photo():
            tests_passed += 1
            
        # Test 2: Check-in without location  
        if self.test_checkin_without_location():
            tests_passed += 1
            
        # Test 3: Check-in with both (should succeed and return attendance ID)
        attendance_id = self.test_checkin_with_photo_and_location()
        if attendance_id:
            tests_passed += 1
            
        # Test 4: Check-out without photo
        if self.test_checkout_without_photo(attendance_id):
            tests_passed += 1
            
        # Test 5: Check-out without location
        if self.test_checkout_without_location(attendance_id):
            tests_passed += 1
            
        # Test 6: Check-out with both (should succeed)
        if self.test_checkout_with_photo_and_location(attendance_id):
            tests_passed += 1
            
        self.log("\n" + "=" * 60, "INFO")
        self.log(f"🎯 Test Results: {tests_passed}/{total_tests} tests passed", 
                "SUCCESS" if tests_passed == total_tests else "WARNING")
        
        if tests_passed == total_tests:
            self.log("🎉 All mandatory validation tests passed!", "SUCCESS")
            self.log("✅ Photo and location are now required for attendance", "SUCCESS")
        else:
            self.log(f"⚠️ {total_tests - tests_passed} test(s) failed", "WARNING")
            
        return tests_passed == total_tests

if __name__ == "__main__":
    tester = AttendanceMandatoryTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)

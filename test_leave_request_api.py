#!/usr/bin/env python3
"""
Test Leave Request API Functionality
Tests the leave request creation, retrieval, and management
"""

import requests
import json
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://127.0.0.1:8000"
TEST_DRIVER_ID = 1

class LeaveRequestTester:
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
        
    def test_get_leave_types(self):
        """Test getting leave types"""
        self.log("Testing get leave types", "TEST")
        
        url = f"{BASE_URL}/hr/leave-types/"
        
        try:
            response = self.session.get(url)
            
            if response.status_code == 200:
                result = response.json()
                leave_types = result.get('results', [])
                self.log(f"✅ PASS: Retrieved {len(leave_types)} leave types", "SUCCESS")
                for lt in leave_types:
                    self.log(f"   - {lt['name']}: {lt['max_days_per_year']} days/year", "INFO")
                return leave_types
            else:
                self.log(f"❌ FAIL: Status {response.status_code}", "ERROR")
                return []
                
        except Exception as e:
            self.log(f"❌ ERROR: {str(e)}", "ERROR")
            return []
            
    def test_get_leave_balances(self):
        """Test getting leave balances for driver"""
        self.log("Testing get leave balances", "TEST")
        
        url = f"{BASE_URL}/hr/leave-balances/?driver={TEST_DRIVER_ID}"
        
        try:
            response = self.session.get(url)
            
            if response.status_code == 200:
                result = response.json()
                balances = result.get('results', [])
                self.log(f"✅ PASS: Retrieved {len(balances)} leave balances", "SUCCESS")
                for balance in balances:
                    self.log(f"   - {balance['leave_type_name']}: {balance['remaining_days']} remaining", "INFO")
                return balances
            else:
                self.log(f"❌ FAIL: Status {response.status_code}", "ERROR")
                return []
                
        except Exception as e:
            self.log(f"❌ ERROR: {str(e)}", "ERROR")
            return []
            
    def test_create_leave_request(self, leave_types):
        """Test creating a leave request"""
        if not leave_types:
            self.log("⚠️ SKIP: No leave types available", "WARNING")
            return None
            
        self.log("Testing create leave request", "TEST")
        
        # Use the first leave type (Annual Leave)
        leave_type = leave_types[0]
        start_date = datetime.now() + timedelta(days=7)  # 7 days from now
        end_date = start_date + timedelta(days=2)  # 3 days leave
        
        url = f"{BASE_URL}/hr/leave-requests/"
        data = {
            "driver": TEST_DRIVER_ID,
            "leave_type": leave_type['id'],
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d"),
            "total_days": 3,
            "reason": "Family vacation - API test",
            "emergency_contact": "+1234567890"
        }
        
        try:
            response = self.session.post(url, json=data)
            
            if response.status_code in [200, 201]:
                result = response.json()
                self.log("✅ PASS: Leave request created successfully", "SUCCESS")
                self.log(f"   Request ID: {result.get('id')}", "INFO")
                self.log(f"   Status: {result.get('status')}", "INFO")
                self.log(f"   Duration: {result.get('total_days')} days", "INFO")
                return result
            else:
                self.log(f"❌ FAIL: Status {response.status_code}", "ERROR")
                self.log(f"   Response: {response.text}", "ERROR")
                return None
                
        except Exception as e:
            self.log(f"❌ ERROR: {str(e)}", "ERROR")
            return None
            
    def test_get_leave_requests(self):
        """Test getting leave requests for driver"""
        self.log("Testing get leave requests", "TEST")
        
        url = f"{BASE_URL}/hr/leave-requests/?driver={TEST_DRIVER_ID}"
        
        try:
            response = self.session.get(url)
            
            if response.status_code == 200:
                result = response.json()
                requests_list = result.get('results', [])
                self.log(f"✅ PASS: Retrieved {len(requests_list)} leave requests", "SUCCESS")
                for req in requests_list:
                    self.log(f"   - {req['leave_type_name']}: {req['start_date']} to {req['end_date']} ({req['status']})", "INFO")
                return requests_list
            else:
                self.log(f"❌ FAIL: Status {response.status_code}", "ERROR")
                return []
                
        except Exception as e:
            self.log(f"❌ ERROR: {str(e)}", "ERROR")
            return []
            
    def test_cancel_leave_request(self, leave_request):
        """Test cancelling a leave request"""
        if not leave_request:
            self.log("⚠️ SKIP: No leave request to cancel", "WARNING")
            return False
            
        self.log("Testing cancel leave request", "TEST")
        
        url = f"{BASE_URL}/hr/leave-requests/{leave_request['id']}/cancel/"
        data = {
            "admin_comments": "Cancelled via API test"
        }
        
        try:
            response = self.session.post(url, json=data)
            
            if response.status_code == 200:
                result = response.json()
                self.log("✅ PASS: Leave request cancelled successfully", "SUCCESS")
                self.log(f"   New status: {result.get('status')}", "INFO")
                return True
            else:
                self.log(f"❌ FAIL: Status {response.status_code}", "ERROR")
                self.log(f"   Response: {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ ERROR: {str(e)}", "ERROR")
            return False
            
    def run_all_tests(self):
        """Run all leave request tests"""
        self.log("🚀 Starting Leave Request API Tests", "INFO")
        self.log("=" * 60, "INFO")
        
        tests_passed = 0
        total_tests = 5
        
        # Test 1: Get leave types
        leave_types = self.test_get_leave_types()
        if leave_types:
            tests_passed += 1
            
        # Test 2: Get leave balances
        balances = self.test_get_leave_balances()
        if balances:
            tests_passed += 1
            
        # Test 3: Create leave request
        leave_request = self.test_create_leave_request(leave_types)
        if leave_request:
            tests_passed += 1
            
        # Test 4: Get leave requests
        requests_list = self.test_get_leave_requests()
        if requests_list:
            tests_passed += 1
            
        # Test 5: Cancel leave request
        if self.test_cancel_leave_request(leave_request):
            tests_passed += 1
            
        self.log("\n" + "=" * 60, "INFO")
        self.log(f"🎯 Test Results: {tests_passed}/{total_tests} tests passed", 
                "SUCCESS" if tests_passed == total_tests else "WARNING")
        
        if tests_passed == total_tests:
            self.log("🎉 All leave request API tests passed!", "SUCCESS")
            self.log("✅ Leave request functionality is working correctly", "SUCCESS")
        else:
            self.log(f"⚠️ {total_tests - tests_passed} test(s) failed", "WARNING")
            
        return tests_passed == total_tests

if __name__ == "__main__":
    tester = LeaveRequestTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)

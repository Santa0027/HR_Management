import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const SystemStatusCheck = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runComprehensiveTest = async () => {
    setLoading(true);
    const results = {};

    // Test 1: Shift Management
    try {
      console.log('Testing Shift Management...');
      const [shiftTypesRes, assignmentsRes] = await Promise.all([
        axiosInstance.get('/shift-types/'),
        axiosInstance.get('/shift-assignments/')
      ]);
      
      results.shiftManagement = {
        success: true,
        shiftTypes: shiftTypesRes.data?.results?.length || shiftTypesRes.data?.length || 0,
        assignments: assignmentsRes.data?.results?.length || assignmentsRes.data?.length || 0
      };
    } catch (error) {
      results.shiftManagement = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    // Test 2: Leave Management
    try {
      console.log('Testing Leave Management...');
      const leaveRes = await axiosInstance.get('/hr/leave-requests/');
      
      results.leaveManagement = {
        success: true,
        leaveRequests: leaveRes.data?.results?.length || leaveRes.data?.length || 0
      };
    } catch (error) {
      results.leaveManagement = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    // Test 3: Driver Management
    try {
      console.log('Testing Driver Management...');
      const driversRes = await axiosInstance.get('/Register/drivers/');
      
      results.driverManagement = {
        success: true,
        drivers: driversRes.data?.results?.length || driversRes.data?.length || 0
      };
    } catch (error) {
      results.driverManagement = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    // Test 4: Driver Mobile Authentication
    try {
      console.log('Testing Driver Mobile Auth...');
      const [authRes, driversWithoutAuthRes] = await Promise.all([
        axiosInstance.get('/Register/driver-auth/'),
        axiosInstance.get('/Register/driver-auth/drivers-without-auth/')
      ]);
      
      results.driverAuth = {
        success: true,
        authCredentials: authRes.data?.results?.length || authRes.data?.length || 0,
        driversWithoutAuth: driversWithoutAuthRes.data?.length || 0
      };
    } catch (error) {
      results.driverAuth = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    // Test 5: User Management
    try {
      console.log('Testing User Management...');
      const [usersRes, statsRes] = await Promise.all([
        axiosInstance.get('/users/'),
        axiosInstance.get('/users/stats/')
      ]);
      
      results.userManagement = {
        success: true,
        users: usersRes.data?.results?.length || usersRes.data?.length || 0,
        stats: statsRes.data
      };
    } catch (error) {
      results.userManagement = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    // Test 6: Location Management
    try {
      console.log('Testing Location Management...');
      const [checkinRes, apartmentRes] = await Promise.all([
        axiosInstance.get('/checkin-locations/'),
        axiosInstance.get('/apartment-locations/')
      ]);
      
      results.locationManagement = {
        success: true,
        checkinLocations: checkinRes.data?.results?.length || checkinRes.data?.length || 0,
        apartmentLocations: apartmentRes.data?.results?.length || apartmentRes.data?.length || 0
      };
    } catch (error) {
      results.locationManagement = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    // Test 7: Mobile Login Test
    try {
      console.log('Testing Mobile Login...');
      const loginRes = await axiosInstance.post('/mobile/login/', {
        username: 'driver1',
        password: 'driver123',
        device_info: 'System Test'
      });
      
      results.mobileLogin = {
        success: true,
        driverName: loginRes.data?.driver?.name,
        hasTokens: !!(loginRes.data?.access_token && loginRes.data?.refresh_token)
      };
    } catch (error) {
      results.mobileLogin = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    runComprehensiveTest();
  }, []);

  const getStatusIcon = (success) => {
    return success ? '✅' : '❌';
  };

  const getStatusColor = (success) => {
    return success ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🔍 HR Management System Status Check</h2>
          <button
            onClick={runComprehensiveTest}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Run Full Test'}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            <div className="ml-4 text-lg">Running comprehensive system test...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">📊 System Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.shiftManagement?.success)}</div>
                  <div className="text-sm font-medium">Shift Management</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.leaveManagement?.success)}</div>
                  <div className="text-sm font-medium">Leave Management</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.driverAuth?.success)}</div>
                  <div className="text-sm font-medium">Driver Mobile Auth</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.userManagement?.success)}</div>
                  <div className="text-sm font-medium">User Management</div>
                </div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shift Management */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {getStatusIcon(testResults.shiftManagement?.success)}
                  <span className="ml-2">🕒 Shift Management</span>
                </h3>
                {testResults.shiftManagement?.success ? (
                  <div className="text-sm text-gray-600">
                    <p>✅ Shift Types: {testResults.shiftManagement.shiftTypes}</p>
                    <p>✅ Assignments: {testResults.shiftManagement.assignments}</p>
                    <p className="text-green-600 font-medium">System working correctly</p>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    <p>❌ Failed to load shift data</p>
                  </div>
                )}
              </div>

              {/* Leave Management */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {getStatusIcon(testResults.leaveManagement?.success)}
                  <span className="ml-2">📅 Leave Management</span>
                </h3>
                {testResults.leaveManagement?.success ? (
                  <div className="text-sm text-gray-600">
                    <p>✅ Leave Requests: {testResults.leaveManagement.leaveRequests}</p>
                    <p className="text-green-600 font-medium">System working correctly</p>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    <p>❌ Failed to load leave data</p>
                  </div>
                )}
              </div>

              {/* Driver Management */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {getStatusIcon(testResults.driverManagement?.success)}
                  <span className="ml-2">🚗 Driver Management</span>
                </h3>
                {testResults.driverManagement?.success ? (
                  <div className="text-sm text-gray-600">
                    <p>✅ Total Drivers: {testResults.driverManagement.drivers}</p>
                    <p className="text-green-600 font-medium">System working correctly</p>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    <p>❌ Failed to load driver data</p>
                  </div>
                )}
              </div>

              {/* Driver Mobile Auth */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {getStatusIcon(testResults.driverAuth?.success)}
                  <span className="ml-2">🔐 Driver Mobile Auth</span>
                </h3>
                {testResults.driverAuth?.success ? (
                  <div className="text-sm text-gray-600">
                    <p>✅ Auth Credentials: {testResults.driverAuth.authCredentials}</p>
                    <p>✅ Drivers without Auth: {testResults.driverAuth.driversWithoutAuth}</p>
                    <p className="text-green-600 font-medium">System working correctly</p>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    <p>❌ Failed to load auth data</p>
                  </div>
                )}
              </div>

              {/* User Management */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {getStatusIcon(testResults.userManagement?.success)}
                  <span className="ml-2">👥 User Management</span>
                </h3>
                {testResults.userManagement?.success ? (
                  <div className="text-sm text-gray-600">
                    <p>✅ Total Users: {testResults.userManagement.users}</p>
                    <p>✅ Active Users: {testResults.userManagement.stats?.active_users}</p>
                    <p>✅ Staff Users: {testResults.userManagement.stats?.staff_users}</p>
                    <p className="text-green-600 font-medium">System working correctly</p>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    <p>❌ Failed to load user data</p>
                  </div>
                )}
              </div>

              {/* Mobile Login */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {getStatusIcon(testResults.mobileLogin?.success)}
                  <span className="ml-2">📱 Mobile Login</span>
                </h3>
                {testResults.mobileLogin?.success ? (
                  <div className="text-sm text-gray-600">
                    <p>✅ Login Test: Successful</p>
                    <p>✅ Driver: {testResults.mobileLogin.driverName}</p>
                    <p>✅ JWT Tokens: {testResults.mobileLogin.hasTokens ? 'Generated' : 'Missing'}</p>
                    <p className="text-green-600 font-medium">Mobile auth working</p>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    <p>❌ Mobile login test failed</p>
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">📋 Test Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>✅ Working Systems:</strong></p>
                  <ul className="list-disc list-inside text-green-600">
                    {testResults.shiftManagement?.success && <li>Shift Management</li>}
                    {testResults.leaveManagement?.success && <li>Leave Management</li>}
                    {testResults.driverManagement?.success && <li>Driver Management</li>}
                    {testResults.driverAuth?.success && <li>Driver Mobile Auth</li>}
                    {testResults.userManagement?.success && <li>User Management</li>}
                    {testResults.mobileLogin?.success && <li>Mobile Login</li>}
                  </ul>
                </div>
                <div>
                  <p><strong>❌ Issues Found:</strong></p>
                  <ul className="list-disc list-inside text-red-600">
                    {!testResults.shiftManagement?.success && <li>Shift Management</li>}
                    {!testResults.leaveManagement?.success && <li>Leave Management</li>}
                    {!testResults.driverManagement?.success && <li>Driver Management</li>}
                    {!testResults.driverAuth?.success && <li>Driver Mobile Auth</li>}
                    {!testResults.userManagement?.success && <li>User Management</li>}
                    {!testResults.mobileLogin?.success && <li>Mobile Login</li>}
                  </ul>
                  {Object.values(testResults).every(result => result?.success) && (
                    <p className="text-green-600">🎉 All systems working perfectly!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemStatusCheck;

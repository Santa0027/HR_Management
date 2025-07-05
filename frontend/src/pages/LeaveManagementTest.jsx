import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const LeaveManagementTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testLeaveManagement = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test 1: Get leave types
      console.log('Testing: GET /hr/leave-types/');
      const typesRes = await axiosInstance.get('/hr/leave-types/');
      results.leaveTypes = {
        success: true,
        data: typesRes.data,
        count: typesRes.data?.results?.length || typesRes.data?.length || 0
      };
      console.log('Leave types response:', typesRes.data);
    } catch (error) {
      console.error('Leave types error:', error);
      results.leaveTypes = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    try {
      // Test 2: Get leave requests
      console.log('Testing: GET /hr/leave-requests/');
      const requestsRes = await axiosInstance.get('/hr/leave-requests/');
      results.leaveRequests = {
        success: true,
        data: requestsRes.data,
        count: requestsRes.data?.results?.length || requestsRes.data?.length || 0
      };
      console.log('Leave requests response:', requestsRes.data);
    } catch (error) {
      console.error('Leave requests error:', error);
      results.leaveRequests = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    try {
      // Test 3: Get leave balances
      console.log('Testing: GET /hr/leave-balances/');
      const balancesRes = await axiosInstance.get('/hr/leave-balances/');
      results.leaveBalances = {
        success: true,
        data: balancesRes.data,
        count: balancesRes.data?.results?.length || balancesRes.data?.length || 0
      };
      console.log('Leave balances response:', balancesRes.data);
    } catch (error) {
      console.error('Leave balances error:', error);
      results.leaveBalances = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    try {
      // Test 4: Get leave statistics
      console.log('Testing: GET /hr/leave-requests/stats/');
      const statsRes = await axiosInstance.get('/hr/leave-requests/stats/');
      results.leaveStats = {
        success: true,
        data: statsRes.data
      };
      console.log('Leave stats response:', statsRes.data);
    } catch (error) {
      console.error('Leave stats error:', error);
      results.leaveStats = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    try {
      // Test 5: Create a test leave request (if we have drivers and leave types)
      if (results.leaveTypes?.success && results.leaveTypes.count > 0) {
        const driversRes = await axiosInstance.get('/Register/drivers/');
        const drivers = driversRes.data.results || driversRes.data;
        
        if (drivers.length > 0) {
          const firstDriver = drivers[0];
          const firstLeaveType = results.leaveTypes.data.results?.[0] || results.leaveTypes.data[0];
          
          console.log('Testing: POST /leave-requests/');
          const createData = {
            driver: firstDriver.id,
            leave_type: firstLeaveType.id,
            start_date: '2025-07-15',
            end_date: '2025-07-17',
            reason: 'Test leave request from frontend',
            emergency_contact: '+966123456789'
          };
          
          const createRes = await axiosInstance.post('/hr/leave-requests/', createData);
          results.createRequest = {
            success: true,
            data: createRes.data,
            driverName: firstDriver.driver_name,
            leaveTypeName: firstLeaveType.name
          };
          console.log('Create request response:', createRes.data);
        } else {
          results.createRequest = {
            success: false,
            error: 'No drivers found'
          };
        }
      } else {
        results.createRequest = {
          success: false,
          error: 'Cannot create request - missing leave types'
        };
      }
    } catch (error) {
      console.error('Create request error:', error);
      results.createRequest = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    testLeaveManagement();
  }, []);

  const getStatusIcon = (success) => {
    return success ? '✅' : '❌';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">📅 Leave Management Test</h2>
          <button
            onClick={testLeaveManagement}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Retest APIs'}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            <div className="ml-4 text-lg">Testing leave management APIs...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">📊 Test Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.leaveTypes?.success)}</div>
                  <div className="text-sm font-medium">Leave Types</div>
                  <div className="text-xs text-gray-600">{testResults.leaveTypes?.count || 0} found</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.leaveRequests?.success)}</div>
                  <div className="text-sm font-medium">Requests</div>
                  <div className="text-xs text-gray-600">{testResults.leaveRequests?.count || 0} found</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.leaveBalances?.success)}</div>
                  <div className="text-sm font-medium">Balances</div>
                  <div className="text-xs text-gray-600">{testResults.leaveBalances?.count || 0} found</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.leaveStats?.success)}</div>
                  <div className="text-sm font-medium">Statistics</div>
                  <div className="text-xs text-gray-600">Dashboard</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.createRequest?.success)}</div>
                  <div className="text-sm font-medium">Create Test</div>
                  <div className="text-xs text-gray-600">Request</div>
                </div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Leave Types */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {getStatusIcon(testResults.leaveTypes?.success)}
                  <span className="ml-2">Leave Types</span>
                </h3>
                {testResults.leaveTypes?.success ? (
                  <div className="text-sm text-gray-600">
                    <p>✅ Found: {testResults.leaveTypes.count} leave types</p>
                    {testResults.leaveTypes.data?.results?.slice(0, 3).map((type, index) => (
                      <p key={index} className="text-xs">• {type.name} ({type.max_days_per_year} days/year)</p>
                    )) || testResults.leaveTypes.data?.slice(0, 3).map((type, index) => (
                      <p key={index} className="text-xs">• {type.name} ({type.max_days_per_year} days/year)</p>
                    ))}
                    <p className="text-green-600 font-medium mt-2">Leave types API working</p>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    <p>❌ Failed to load leave types</p>
                    <pre className="text-xs bg-red-50 p-2 rounded mt-2">
                      {JSON.stringify(testResults.leaveTypes?.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Leave Requests */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {getStatusIcon(testResults.leaveRequests?.success)}
                  <span className="ml-2">Leave Requests</span>
                </h3>
                {testResults.leaveRequests?.success ? (
                  <div className="text-sm text-gray-600">
                    <p>✅ Found: {testResults.leaveRequests.count} requests</p>
                    {testResults.leaveRequests.data?.results?.slice(0, 3).map((request, index) => (
                      <p key={index} className="text-xs">• {request.driver_name} - {request.leave_type_name} ({request.status})</p>
                    )) || testResults.leaveRequests.data?.slice(0, 3).map((request, index) => (
                      <p key={index} className="text-xs">• {request.driver_name} - {request.leave_type_name} ({request.status})</p>
                    ))}
                    <p className="text-green-600 font-medium mt-2">Requests API working</p>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    <p>❌ Failed to load requests</p>
                    <pre className="text-xs bg-red-50 p-2 rounded mt-2">
                      {JSON.stringify(testResults.leaveRequests?.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Leave Statistics */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {getStatusIcon(testResults.leaveStats?.success)}
                  <span className="ml-2">Statistics</span>
                </h3>
                {testResults.leaveStats?.success ? (
                  <div className="text-sm text-gray-600">
                    <p>✅ Statistics loaded successfully</p>
                    <p className="text-xs">Total Requests: {testResults.leaveStats.data.total_requests}</p>
                    <p className="text-xs">Pending: {testResults.leaveStats.data.pending_requests}</p>
                    <p className="text-xs">Approved: {testResults.leaveStats.data.approved_requests}</p>
                    <p className="text-xs">Rejected: {testResults.leaveStats.data.rejected_requests}</p>
                    <p className="text-green-600 font-medium mt-2">Statistics API working</p>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    <p>❌ Failed to load statistics</p>
                    <pre className="text-xs bg-red-50 p-2 rounded mt-2">
                      {JSON.stringify(testResults.leaveStats?.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Create Request Test */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {getStatusIcon(testResults.createRequest?.success)}
                  <span className="ml-2">Create Request Test</span>
                </h3>
                {testResults.createRequest?.success ? (
                  <div className="text-sm text-gray-600">
                    <p>✅ Successfully created request</p>
                    <p className="text-xs">Driver: {testResults.createRequest.driverName}</p>
                    <p className="text-xs">Leave Type: {testResults.createRequest.leaveTypeName}</p>
                    <p className="text-xs">Period: 2025-07-15 to 2025-07-17</p>
                    <p className="text-green-600 font-medium mt-2">Request creation working</p>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    <p>❌ Failed to create request</p>
                    <pre className="text-xs bg-red-50 p-2 rounded mt-2">
                      {JSON.stringify(testResults.createRequest?.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">📋 Test Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>✅ Working Components:</strong></p>
                  <ul className="list-disc list-inside text-green-600">
                    {testResults.leaveTypes?.success && <li>Leave Types API ({testResults.leaveTypes.count} types)</li>}
                    {testResults.leaveRequests?.success && <li>Leave Requests API ({testResults.leaveRequests.count} requests)</li>}
                    {testResults.leaveBalances?.success && <li>Leave Balances API ({testResults.leaveBalances.count} balances)</li>}
                    {testResults.leaveStats?.success && <li>Statistics Dashboard</li>}
                    {testResults.createRequest?.success && <li>Request Creation</li>}
                  </ul>
                </div>
                <div>
                  <p><strong>❌ Issues Found:</strong></p>
                  <ul className="list-disc list-inside text-red-600">
                    {!testResults.leaveTypes?.success && <li>Leave Types API</li>}
                    {!testResults.leaveRequests?.success && <li>Leave Requests API</li>}
                    {!testResults.leaveBalances?.success && <li>Leave Balances API</li>}
                    {!testResults.leaveStats?.success && <li>Statistics API</li>}
                    {!testResults.createRequest?.success && <li>Request Creation</li>}
                  </ul>
                  {Object.values(testResults).every(result => result?.success) && (
                    <p className="text-green-600">🎉 All leave management features working!</p>
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

export default LeaveManagementTest;

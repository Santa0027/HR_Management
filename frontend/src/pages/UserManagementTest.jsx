import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const UserManagementTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test 1: Get users list
      console.log('Testing: GET /users/');
      const usersResponse = await axiosInstance.get('/users/');
      results.users = {
        success: true,
        data: usersResponse.data,
        count: usersResponse.data?.results?.length || usersResponse.data?.length || 0
      };
      console.log('Users response:', usersResponse.data);
    } catch (error) {
      console.error('Users error:', error);
      results.users = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    try {
      // Test 2: Get user stats
      console.log('Testing: GET /users/stats/');
      const statsResponse = await axiosInstance.get('/users/stats/');
      results.stats = {
        success: true,
        data: statsResponse.data
      };
      console.log('Stats response:', statsResponse.data);
    } catch (error) {
      console.error('Stats error:', error);
      results.stats = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    try {
      // Test 3: Create a test user
      console.log('Testing: POST /users/');
      const createData = {
        email: `test${Date.now()}@example.com`,
        password: 'testpass123',
        confirm_password: 'testpass123',
        first_name: 'Test',
        last_name: 'User',
        role: 'staff',
        is_active: true
      };
      
      const createResponse = await axiosInstance.post('/users/', createData);
      results.create = {
        success: true,
        data: createResponse.data,
        created_email: createData.email
      };
      console.log('Create response:', createResponse.data);
    } catch (error) {
      console.error('Create error:', error);
      results.create = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🧪 User Management API Test</h2>
          <button
            onClick={testAPI}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Retest APIs'}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Users List Test */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">
                1. Users List
                <span className="text-sm text-gray-500 ml-2">GET /users/</span>
              </h3>
              {testResults.users ? (
                testResults.users.success ? (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-green-800">
                      ✅ Success! Found {testResults.users.count} users
                    </p>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-green-700 hover:text-green-900">
                        View Response Data (First 3 users)
                      </summary>
                      <pre className="mt-2 text-xs bg-green-100 p-2 rounded overflow-auto">
                        {JSON.stringify(
                          testResults.users.data?.results?.slice(0, 3) || 
                          testResults.users.data?.slice(0, 3) || 
                          testResults.users.data, 
                          null, 2
                        )}
                      </pre>
                    </details>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-red-800">❌ Failed</p>
                    <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                      {JSON.stringify(testResults.users.error, null, 2)}
                    </pre>
                  </div>
                )
              ) : (
                <p className="text-gray-500">Not tested yet</p>
              )}
            </div>

            {/* Stats Test */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">
                2. User Statistics
                <span className="text-sm text-gray-500 ml-2">GET /users/stats/</span>
              </h3>
              {testResults.stats ? (
                testResults.stats.success ? (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-green-800">✅ Success!</p>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-2 rounded">
                        <div className="text-xs text-gray-600">Total Users</div>
                        <div className="text-lg font-bold">{testResults.stats.data?.total_users || 0}</div>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <div className="text-xs text-gray-600">Active Users</div>
                        <div className="text-lg font-bold">{testResults.stats.data?.active_users || 0}</div>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <div className="text-xs text-gray-600">Staff Users</div>
                        <div className="text-lg font-bold">{testResults.stats.data?.staff_users || 0}</div>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <div className="text-xs text-gray-600">Superusers</div>
                        <div className="text-lg font-bold">{testResults.stats.data?.superusers || 0}</div>
                      </div>
                    </div>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-green-700 hover:text-green-900">
                        View Full Response
                      </summary>
                      <pre className="mt-2 text-xs bg-green-100 p-2 rounded overflow-auto">
                        {JSON.stringify(testResults.stats.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-red-800">❌ Failed</p>
                    <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                      {JSON.stringify(testResults.stats.error, null, 2)}
                    </pre>
                  </div>
                )
              ) : (
                <p className="text-gray-500">Not tested yet</p>
              )}
            </div>

            {/* Create User Test */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">
                3. Create User
                <span className="text-sm text-gray-500 ml-2">POST /users/</span>
              </h3>
              {testResults.create ? (
                testResults.create.success ? (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-green-800">
                      ✅ Success! Created user: {testResults.create.created_email}
                    </p>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-green-700 hover:text-green-900">
                        View Created User Data
                      </summary>
                      <pre className="mt-2 text-xs bg-green-100 p-2 rounded overflow-auto">
                        {JSON.stringify(testResults.create.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-red-800">❌ Failed</p>
                    <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                      {JSON.stringify(testResults.create.error, null, 2)}
                    </pre>
                  </div>
                )
              ) : (
                <p className="text-gray-500">Not tested yet</p>
              )}
            </div>

            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">📊 Test Summary</h3>
              <div className="text-blue-700">
                <p>
                  <strong>Users API:</strong> {testResults.users?.success ? '✅ Working' : '❌ Failed'}
                </p>
                <p>
                  <strong>Stats API:</strong> {testResults.stats?.success ? '✅ Working' : '❌ Failed'}
                </p>
                <p>
                  <strong>Create User API:</strong> {testResults.create?.success ? '✅ Working' : '❌ Failed'}
                </p>
                <p className="mt-2">
                  <strong>Total Users Found:</strong> {testResults.users?.success ? testResults.users.count : 'N/A'}
                </p>
                <p>
                  <strong>Active Users:</strong> {testResults.stats?.success ? testResults.stats.data?.active_users : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementTest;

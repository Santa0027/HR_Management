import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const DriverAuthTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test 1: Get driver auth list
      console.log('Testing: GET /Register/driver-auth/');
      const authResponse = await axiosInstance.get('/Register/driver-auth/');
      results.driverAuth = {
        success: true,
        data: authResponse.data,
        count: authResponse.data?.results?.length || authResponse.data?.length || 0
      };
      console.log('Driver auth response:', authResponse.data);
    } catch (error) {
      console.error('Driver auth error:', error);
      results.driverAuth = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    try {
      // Test 2: Get drivers without auth
      console.log('Testing: GET /Register/driver-auth/drivers-without-auth/');
      const driversResponse = await axiosInstance.get('/Register/driver-auth/drivers-without-auth/');
      results.driversWithoutAuth = {
        success: true,
        data: driversResponse.data,
        count: driversResponse.data?.length || 0
      };
      console.log('Drivers without auth response:', driversResponse.data);
    } catch (error) {
      console.error('Drivers without auth error:', error);
      results.driversWithoutAuth = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    try {
      // Test 3: Get regular drivers list
      console.log('Testing: GET /Register/drivers/');
      const driversListResponse = await axiosInstance.get('/Register/drivers/');
      results.driversList = {
        success: true,
        data: driversListResponse.data,
        count: driversListResponse.data?.results?.length || driversListResponse.data?.length || 0
      };
      console.log('Drivers list response:', driversListResponse.data);
    } catch (error) {
      console.error('Drivers list error:', error);
      results.driversList = {
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
          <h2 className="text-2xl font-bold text-gray-900">🧪 Driver Auth API Test</h2>
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
            {/* Driver Auth Test */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">
                1. Driver Authentication List
                <span className="text-sm text-gray-500 ml-2">GET /Register/driver-auth/</span>
              </h3>
              {testResults.driverAuth ? (
                testResults.driverAuth.success ? (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-green-800">
                      ✅ Success! Found {testResults.driverAuth.count} driver authentication records
                    </p>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-green-700 hover:text-green-900">
                        View Response Data
                      </summary>
                      <pre className="mt-2 text-xs bg-green-100 p-2 rounded overflow-auto">
                        {JSON.stringify(testResults.driverAuth.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-red-800">❌ Failed</p>
                    <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                      {JSON.stringify(testResults.driverAuth.error, null, 2)}
                    </pre>
                  </div>
                )
              ) : (
                <p className="text-gray-500">Not tested yet</p>
              )}
            </div>

            {/* Drivers Without Auth Test */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">
                2. Drivers Without Authentication
                <span className="text-sm text-gray-500 ml-2">GET /Register/driver-auth/drivers-without-auth/</span>
              </h3>
              {testResults.driversWithoutAuth ? (
                testResults.driversWithoutAuth.success ? (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-green-800">
                      ✅ Success! Found {testResults.driversWithoutAuth.count} drivers without authentication
                    </p>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-green-700 hover:text-green-900">
                        View Response Data
                      </summary>
                      <pre className="mt-2 text-xs bg-green-100 p-2 rounded overflow-auto">
                        {JSON.stringify(testResults.driversWithoutAuth.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-red-800">❌ Failed</p>
                    <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                      {JSON.stringify(testResults.driversWithoutAuth.error, null, 2)}
                    </pre>
                  </div>
                )
              ) : (
                <p className="text-gray-500">Not tested yet</p>
              )}
            </div>

            {/* Drivers List Test */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">
                3. All Drivers List
                <span className="text-sm text-gray-500 ml-2">GET /Register/drivers/</span>
              </h3>
              {testResults.driversList ? (
                testResults.driversList.success ? (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-green-800">
                      ✅ Success! Found {testResults.driversList.count} total drivers
                    </p>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-green-700 hover:text-green-900">
                        View Response Data (First 3 records)
                      </summary>
                      <pre className="mt-2 text-xs bg-green-100 p-2 rounded overflow-auto">
                        {JSON.stringify(
                          testResults.driversList.data?.results?.slice(0, 3) || 
                          testResults.driversList.data?.slice(0, 3) || 
                          testResults.driversList.data, 
                          null, 2
                        )}
                      </pre>
                    </details>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-red-800">❌ Failed</p>
                    <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                      {JSON.stringify(testResults.driversList.error, null, 2)}
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
                  <strong>Driver Auth Records:</strong> {testResults.driverAuth?.success ? `${testResults.driverAuth.count} found` : 'Failed to fetch'}
                </p>
                <p>
                  <strong>Drivers Without Auth:</strong> {testResults.driversWithoutAuth?.success ? `${testResults.driversWithoutAuth.count} found` : 'Failed to fetch'}
                </p>
                <p>
                  <strong>Total Drivers:</strong> {testResults.driversList?.success ? `${testResults.driversList.count} found` : 'Failed to fetch'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverAuthTest;

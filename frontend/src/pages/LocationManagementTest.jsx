import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const LocationManagementTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testLocationManagement = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test 1: Get check-in locations
      console.log('Testing: GET /hr/checkin-locations/');
      const checkinRes = await axiosInstance.get('/hr/checkin-locations/');
      results.checkinLocations = {
        success: true,
        data: checkinRes.data,
        count: checkinRes.data?.results?.length || checkinRes.data?.length || 0
      };
      console.log('Check-in locations response:', checkinRes.data);
    } catch (error) {
      console.error('Check-in locations error:', error);
      results.checkinLocations = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    try {
      // Test 2: Get apartment locations
      console.log('Testing: GET /hr/apartment-locations/');
      const apartmentRes = await axiosInstance.get('/hr/apartment-locations/');
      results.apartmentLocations = {
        success: true,
        data: apartmentRes.data,
        count: apartmentRes.data?.results?.length || apartmentRes.data?.length || 0
      };
      console.log('Apartment locations response:', apartmentRes.data);
    } catch (error) {
      console.error('Apartment locations error:', error);
      results.apartmentLocations = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    try {
      // Test 3: Get drivers for location assignment
      console.log('Testing: GET /Register/drivers/');
      const driversRes = await axiosInstance.get('/Register/drivers/');
      results.drivers = {
        success: true,
        data: driversRes.data,
        count: driversRes.data?.results?.length || driversRes.data?.length || 0
      };
      console.log('Drivers response:', driversRes.data);
    } catch (error) {
      console.error('Drivers error:', error);
      results.drivers = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    try {
      // Test 4: Create a test check-in location
      if (results.drivers?.success && results.drivers.count > 0) {
        const drivers = results.drivers.data.results || results.drivers.data;
        const firstDriver = drivers[0];
        
        console.log('Testing: POST /checkin-locations/');
        const createData = {
          name: 'Test Check-in Location',
          latitude: 24.7136,
          longitude: 46.6753,
          radius_meters: 100,
          is_active: true,
          driver: firstDriver.id
        };
        
        const createRes = await axiosInstance.post('/hr/checkin-locations/', createData);
        results.createCheckin = {
          success: true,
          data: createRes.data,
          driverName: firstDriver.driver_name
        };
        console.log('Create check-in location response:', createRes.data);
      } else {
        results.createCheckin = {
          success: false,
          error: 'Cannot create location - missing drivers'
        };
      }
    } catch (error) {
      console.error('Create check-in location error:', error);
      results.createCheckin = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    try {
      // Test 5: Create a test apartment location
      if (results.drivers?.success && results.drivers.count > 0) {
        const drivers = results.drivers.data.results || results.drivers.data;
        const firstDriver = drivers[0];
        
        console.log('Testing: POST /apartment-locations/');
        const createData = {
          name: 'Test Apartment Location',
          latitude: 24.7200,
          longitude: 46.6800,
          alarm_radius_meters: 50,
          is_active: true,
          driver: firstDriver.id
        };
        
        const createRes = await axiosInstance.post('/hr/apartment-locations/', createData);
        results.createApartment = {
          success: true,
          data: createRes.data,
          driverName: firstDriver.driver_name
        };
        console.log('Create apartment location response:', createRes.data);
      } else {
        results.createApartment = {
          success: false,
          error: 'Cannot create location - missing drivers'
        };
      }
    } catch (error) {
      console.error('Create apartment location error:', error);
      results.createApartment = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    testLocationManagement();
  }, []);

  const getStatusIcon = (success) => {
    return success ? '✅' : '❌';
  };

  const formatCoordinates = (lat, lng) => {
    return `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">📍 Location Management Test</h2>
          <button
            onClick={testLocationManagement}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Retest APIs'}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            <div className="ml-4 text-lg">Testing location management APIs...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">📊 Test Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.checkinLocations?.success)}</div>
                  <div className="text-sm font-medium">Check-in Locations</div>
                  <div className="text-xs text-gray-600">{testResults.checkinLocations?.count || 0} found</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.apartmentLocations?.success)}</div>
                  <div className="text-sm font-medium">Apartment Locations</div>
                  <div className="text-xs text-gray-600">{testResults.apartmentLocations?.count || 0} found</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.drivers?.success)}</div>
                  <div className="text-sm font-medium">Drivers</div>
                  <div className="text-xs text-gray-600">{testResults.drivers?.count || 0} found</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.createCheckin?.success)}</div>
                  <div className="text-sm font-medium">Create Check-in</div>
                  <div className="text-xs text-gray-600">Test</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.createApartment?.success)}</div>
                  <div className="text-sm font-medium">Create Apartment</div>
                  <div className="text-xs text-gray-600">Test</div>
                </div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Check-in Locations */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {getStatusIcon(testResults.checkinLocations?.success)}
                  <span className="ml-2">🏢 Check-in Locations</span>
                </h3>
                {testResults.checkinLocations?.success ? (
                  <div className="text-sm text-gray-600">
                    <p>✅ Found: {testResults.checkinLocations.count} locations</p>
                    {testResults.checkinLocations.data?.results?.slice(0, 3).map((location, index) => (
                      <p key={index} className="text-xs">
                        • {location.name} - {formatCoordinates(location.latitude, location.longitude)} ({location.radius_meters}m)
                      </p>
                    )) || testResults.checkinLocations.data?.slice(0, 3).map((location, index) => (
                      <p key={index} className="text-xs">
                        • {location.name} - {formatCoordinates(location.latitude, location.longitude)} ({location.radius_meters}m)
                      </p>
                    ))}
                    <p className="text-green-600 font-medium mt-2">Check-in locations API working</p>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    <p>❌ Failed to load check-in locations</p>
                    <pre className="text-xs bg-red-50 p-2 rounded mt-2">
                      {JSON.stringify(testResults.checkinLocations?.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Apartment Locations */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {getStatusIcon(testResults.apartmentLocations?.success)}
                  <span className="ml-2">🏠 Apartment Locations</span>
                </h3>
                {testResults.apartmentLocations?.success ? (
                  <div className="text-sm text-gray-600">
                    <p>✅ Found: {testResults.apartmentLocations.count} locations</p>
                    {testResults.apartmentLocations.data?.results?.slice(0, 3).map((location, index) => (
                      <p key={index} className="text-xs">
                        • {location.name} - {formatCoordinates(location.latitude, location.longitude)} ({location.alarm_radius_meters}m)
                      </p>
                    )) || testResults.apartmentLocations.data?.slice(0, 3).map((location, index) => (
                      <p key={index} className="text-xs">
                        • {location.name} - {formatCoordinates(location.latitude, location.longitude)} ({location.alarm_radius_meters}m)
                      </p>
                    ))}
                    <p className="text-green-600 font-medium mt-2">Apartment locations API working</p>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    <p>❌ Failed to load apartment locations</p>
                    <pre className="text-xs bg-red-50 p-2 rounded mt-2">
                      {JSON.stringify(testResults.apartmentLocations?.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Create Check-in Test */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {getStatusIcon(testResults.createCheckin?.success)}
                  <span className="ml-2">➕ Create Check-in Test</span>
                </h3>
                {testResults.createCheckin?.success ? (
                  <div className="text-sm text-gray-600">
                    <p>✅ Successfully created check-in location</p>
                    <p className="text-xs">Name: {testResults.createCheckin.data.name}</p>
                    <p className="text-xs">Driver: {testResults.createCheckin.driverName}</p>
                    <p className="text-xs">Coordinates: {formatCoordinates(testResults.createCheckin.data.latitude, testResults.createCheckin.data.longitude)}</p>
                    <p className="text-xs">Radius: {testResults.createCheckin.data.radius_meters}m</p>
                    <p className="text-green-600 font-medium mt-2">Check-in creation working</p>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    <p>❌ Failed to create check-in location</p>
                    <pre className="text-xs bg-red-50 p-2 rounded mt-2">
                      {JSON.stringify(testResults.createCheckin?.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Create Apartment Test */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {getStatusIcon(testResults.createApartment?.success)}
                  <span className="ml-2">➕ Create Apartment Test</span>
                </h3>
                {testResults.createApartment?.success ? (
                  <div className="text-sm text-gray-600">
                    <p>✅ Successfully created apartment location</p>
                    <p className="text-xs">Name: {testResults.createApartment.data.name}</p>
                    <p className="text-xs">Driver: {testResults.createApartment.driverName}</p>
                    <p className="text-xs">Coordinates: {formatCoordinates(testResults.createApartment.data.latitude, testResults.createApartment.data.longitude)}</p>
                    <p className="text-xs">Alarm Radius: {testResults.createApartment.data.alarm_radius_meters}m</p>
                    <p className="text-green-600 font-medium mt-2">Apartment creation working</p>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    <p>❌ Failed to create apartment location</p>
                    <pre className="text-xs bg-red-50 p-2 rounded mt-2">
                      {JSON.stringify(testResults.createApartment?.error, null, 2)}
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
                    {testResults.checkinLocations?.success && <li>Check-in Locations API ({testResults.checkinLocations.count} locations)</li>}
                    {testResults.apartmentLocations?.success && <li>Apartment Locations API ({testResults.apartmentLocations.count} locations)</li>}
                    {testResults.drivers?.success && <li>Driver Integration ({testResults.drivers.count} drivers)</li>}
                    {testResults.createCheckin?.success && <li>Check-in Location Creation</li>}
                    {testResults.createApartment?.success && <li>Apartment Location Creation</li>}
                  </ul>
                </div>
                <div>
                  <p><strong>❌ Issues Found:</strong></p>
                  <ul className="list-disc list-inside text-red-600">
                    {!testResults.checkinLocations?.success && <li>Check-in Locations API</li>}
                    {!testResults.apartmentLocations?.success && <li>Apartment Locations API</li>}
                    {!testResults.drivers?.success && <li>Driver Integration</li>}
                    {!testResults.createCheckin?.success && <li>Check-in Creation</li>}
                    {!testResults.createApartment?.success && <li>Apartment Creation</li>}
                  </ul>
                  {Object.values(testResults).every(result => result?.success) && (
                    <p className="text-green-600">🎉 All location management features working!</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2">🚀 Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                <a
                  href="/location-management"
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm"
                >
                  📍 Open Enhanced Location Management
                </a>
                <a
                  href="/hr-dashboard"
                  className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm"
                >
                  🏢 Back to HR Dashboard
                </a>
                <button
                  onClick={() => window.open('https://www.google.com/maps/@24.7136,46.6753,15z', '_blank')}
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-sm"
                >
                  🗺️ View Test Location on Map
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationManagementTest;

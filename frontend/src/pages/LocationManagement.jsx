import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';

// Interactive Map Component using OpenStreetMap (Leaflet)
const MapSelector = ({ latitude, longitude, onLocationSelect, radius = 100 }) => {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [clickCoords, setClickCoords] = useState(null);

  useEffect(() => {
    // Load Leaflet CSS and JS if not already loaded
    if (!window.L) {
      // Load CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(cssLink);

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.L) return;

    const initialLat = parseFloat(latitude) || 24.7136; // Default to Riyadh
    const initialLng = parseFloat(longitude) || 46.6753;

    // Create map
    const map = window.L.map(mapRef.current).setView([initialLat, initialLng], 15);

    // Add OpenStreetMap tiles
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add marker
    const marker = window.L.marker([initialLat, initialLng], {
      draggable: true
    }).addTo(map);

    // Add radius circle
    const circle = window.L.circle([initialLat, initialLng], {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.15,
      radius: radius
    }).addTo(map);

    // Handle marker drag
    marker.on('dragend', (event) => {
      const position = event.target.getLatLng();
      circle.setLatLng(position);
      onLocationSelect(position.lat, position.lng);
    });

    // Handle map click
    map.on('click', (event) => {
      const { lat, lng } = event.latlng;
      marker.setLatLng([lat, lng]);
      circle.setLatLng([lat, lng]);
      setClickCoords({ lat, lng });
      onLocationSelect(lat, lng);
    });

    // Cleanup function
    return () => {
      map.remove();
    };
  }, [mapLoaded, latitude, longitude, radius, onLocationSelect]);

  if (!mapLoaded) {
    return (
      <div className="w-full h-96 bg-gray-50 rounded-lg border border-gray-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interactive map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        ref={mapRef}
        style={{ width: '100%', height: '400px' }}
        className="rounded-lg border border-gray-300"
      />
      <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
        💡 <strong>Tip:</strong> Click anywhere on the map or drag the red marker to select a location. The circle shows the coverage radius.
      </div>
      {clickCoords && (
        <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
          ✅ Location selected: {clickCoords.lat.toFixed(6)}, {clickCoords.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
};

// Simple coordinate picker as fallback
const CoordinatePicker = ({ latitude, longitude, onLocationSelect, radius }) => {
  const [tempLat, setTempLat] = useState(latitude || '24.7136');
  const [tempLng, setTempLng] = useState(longitude || '46.6753');

  const handleApplyCoordinates = () => {
    const lat = parseFloat(tempLat);
    const lng = parseFloat(tempLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      onLocationSelect(lat, lng);
      toast.success('Coordinates applied successfully');
    } else {
      toast.error('Please enter valid coordinates');
    }
  };

  return (
    <div className="w-full h-96 bg-gray-50 rounded-lg border border-gray-300 p-6">
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">📍</div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">Coordinate Selector</h3>
        <p className="text-gray-600 text-sm">
          Enter coordinates manually or use the quick location buttons below
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              value={tempLat}
              onChange={(e) => setTempLat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="24.7136"
            />
          </div>
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              value={tempLng}
              onChange={(e) => setTempLng(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="46.6753"
            />
          </div>
        </div>

        <button
          onClick={handleApplyCoordinates}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm"
        >
          📍 Apply Coordinates
        </button>

        <div className="border-t pt-4">
          <p className="text-xs text-gray-600 mb-2">Quick Locations (Saudi Arabia):</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setTempLat('24.7136');
                setTempLng('46.6753');
                onLocationSelect(24.7136, 46.6753);
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded text-xs"
            >
              🏢 Riyadh Center
            </button>
            <button
              onClick={() => {
                setTempLat('21.4858');
                setTempLng('39.1925');
                onLocationSelect(21.4858, 39.1925);
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded text-xs"
            >
              🏢 Jeddah Center
            </button>
            <button
              onClick={() => {
                setTempLat('26.4207');
                setTempLng('50.0888');
                onLocationSelect(26.4207, 50.0888);
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded text-xs"
            >
              🏢 Dammam Center
            </button>
            <button
              onClick={() => {
                setTempLat('21.2854');
                setTempLng('40.4183');
                onLocationSelect(21.2854, 40.4183);
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded text-xs"
            >
              🏢 Mecca Center
            </button>
          </div>
        </div>

        {latitude && longitude && (
          <div className="text-xs text-gray-500 text-center pt-2 border-t">
            Current: {parseFloat(latitude).toFixed(6)}, {parseFloat(longitude).toFixed(6)} •
            <a
              href={`https://www.google.com/maps?q=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 text-blue-500 hover:text-blue-700 underline"
            >
              View on Google Maps
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

const LocationManagement = () => {
  const [activeTab, setActiveTab] = useState('checkin');
  const [loading, setLoading] = useState(false);

  // Data states
  const [checkinLocations, setCheckinLocations] = useState([]);
  const [apartmentLocations, setApartmentLocations] = useState([]);
  const [drivers, setDrivers] = useState([]);

  // Modal states
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [editingLocation, setEditingLocation] = useState(null);
  const [showMapSelector, setShowMapSelector] = useState(false);

  // Form state
  const [locationForm, setLocationForm] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radius_meters: '',
    alarm_radius_meters: '',
    driver: '',
    is_active: true
  });

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    driver: '',
    status: ''
  });

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [checkinRes, apartmentRes, driversRes] = await Promise.all([
        axiosInstance.get('/hr/checkin-locations/'),
        axiosInstance.get('/hr/apartment-locations/'),
        axiosInstance.get('/Register/drivers/')
      ]);

      setCheckinLocations(checkinRes.data.results || checkinRes.data);
      setApartmentLocations(apartmentRes.data.results || apartmentRes.data);
      setDrivers(driversRes.data.results || driversRes.data);

      console.log('Location data loaded:', {
        checkin: checkinRes.data.results?.length || checkinRes.data.length,
        apartment: apartmentRes.data.results?.length || apartmentRes.data.length,
        drivers: driversRes.data.results?.length || driversRes.data.length
      });
    } catch (error) {
      console.error('Error fetching location data:', error);
      toast.error('Failed to load location data');
    } finally {
      setLoading(false);
    }
  };

  // Create/Update location
  const handleSaveLocation = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = activeTab === 'checkin' ? '/hr/checkin-locations/' : '/hr/apartment-locations/';
      const data = {
        ...locationForm,
        latitude: parseFloat(locationForm.latitude),
        longitude: parseFloat(locationForm.longitude),
        ...(activeTab === 'checkin' 
          ? { radius_meters: parseInt(locationForm.radius_meters) }
          : { alarm_radius_meters: parseInt(locationForm.alarm_radius_meters) }
        ),
        driver: locationForm.driver || null
      };

      if (editingLocation) {
        await axiosInstance.put(`${endpoint}${editingLocation.id}/`, data);
        toast.success(`${activeTab === 'checkin' ? 'Check-in' : 'Apartment'} location updated successfully`);
      } else {
        await axiosInstance.post(endpoint, data);
        toast.success(`${activeTab === 'checkin' ? 'Check-in' : 'Apartment'} location created successfully`);
      }

      setShowLocationModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving location:', error);
      toast.error(error.response?.data?.detail || 'Failed to save location');
    } finally {
      setLoading(false);
    }
  };

  // Delete location
  const handleDeleteLocation = async (location) => {
    if (!window.confirm(`Are you sure you want to delete "${location.name}"?`)) return;

    setLoading(true);
    try {
      const endpoint = activeTab === 'checkin' ? '/hr/checkin-locations/' : '/hr/apartment-locations/';
      await axiosInstance.delete(`${endpoint}${location.id}/`);
      toast.success('Location deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error('Failed to delete location');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setLocationForm({
      name: '',
      latitude: '',
      longitude: '',
      radius_meters: '',
      alarm_radius_meters: '',
      driver: '',
      is_active: true
    });
    setEditingLocation(null);
  };

  // Open location modal
  const openLocationModal = (location = null) => {
    if (location) {
      setLocationForm({
        name: location.name,
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        radius_meters: location.radius_meters?.toString() || '',
        alarm_radius_meters: location.alarm_radius_meters?.toString() || '',
        driver: location.driver?.toString() || '',
        is_active: location.is_active
      });
      setEditingLocation(location);
    } else {
      resetForm();
    }
    setShowLocationModal(true);
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationForm(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }));
          toast.success('Current location detected');
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Failed to get current location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser');
    }
  };

  // Handle map location selection
  const handleMapLocationSelect = (lat, lng) => {
    setLocationForm(prev => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6)
    }));
  };

  // Filter locations
  const getFilteredLocations = () => {
    const locations = activeTab === 'checkin' ? checkinLocations : apartmentLocations;
    return locations.filter(location => {
      const matchesSearch = location.name.toLowerCase().includes(filters.search.toLowerCase());
      const matchesDriver = !filters.driver || location.driver?.toString() === filters.driver;
      const matchesStatus = !filters.status || 
        (filters.status === 'active' && location.is_active) ||
        (filters.status === 'inactive' && !location.is_active);
      
      return matchesSearch && matchesDriver && matchesStatus;
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadge = (isActive) => {
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const getDriverName = (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.driver_name : 'Unassigned';
  };

  const formatCoordinates = (lat, lng) => {
    return `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">📍 Location Management</h1>
        <p className="text-gray-600">Manage check-in locations and apartment locations for drivers</p>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('checkin')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'checkin'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏢 Check-in Locations ({checkinLocations.length})
            </button>
            <button
              onClick={() => setActiveTab('apartment')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'apartment'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏠 Apartment Locations ({apartmentLocations.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Enhanced Controls Section */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search locations..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10 pr-4 py-3 w-64 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <select
                  value={filters.driver}
                  onChange={(e) => setFilters({ ...filters, driver: e.target.value })}
                  className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">All Drivers</option>
                  <option value="">Unassigned</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.driver_name}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  {getFilteredLocations().length} of {(activeTab === 'checkin' ? checkinLocations : apartmentLocations).length} locations
                </div>
            <button
              onClick={() => openLocationModal()}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add {activeTab === 'checkin' ? 'Check-in' : 'Apartment'} Location
            </button>
              </div>
            </div>
          </div>

          {/* Location List */}
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredLocations().length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-4xl mb-4">📍</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No {activeTab === 'checkin' ? 'check-in' : 'apartment'} locations found
                  </h3>
                  <p className="text-gray-500">
                    Add your first {activeTab === 'checkin' ? 'check-in' : 'apartment'} location to get started
                  </p>
                </div>
              ) : (
                getFilteredLocations().map((location) => (
                  <div key={location.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                      {getStatusBadge(location.is_active)}
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <span className="w-20">📍 Location:</span>
                        <span className="font-mono">{formatCoordinates(location.latitude, location.longitude)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-20">👤 Driver:</span>
                        <span>{getDriverName(location.driver)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-20">📏 Radius:</span>
                        <span>
                          {activeTab === 'checkin' 
                            ? `${location.radius_meters}m` 
                            : `${location.alarm_radius_meters}m`
                          }
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-20">📅 Created:</span>
                        <span>{new Date(location.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedLocation(location)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-2 px-3 rounded"
                      >
                        🗺️ View Map
                      </button>
                      <button
                        onClick={() => openLocationModal(location)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 px-3 rounded"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(location)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs py-2 px-3 rounded"
                        disabled={loading}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Location Form Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingLocation ? 'Edit' : 'Add New'} {activeTab === 'checkin' ? 'Check-in' : 'Apartment'} Location
              </h3>

              <form onSubmit={handleSaveLocation}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Form Fields */}
                  <div className="space-y-4">
                    {/* Location Name */}
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        📍 Location Name *
                      </label>
                      <input
                        type="text"
                        value={locationForm.name}
                        onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="e.g., Main Office, Building A"
                        required
                      />
                    </div>

                    {/* Coordinates Section */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3">🌐 Location Coordinates</h4>

                      {/* Coordinate Input Method Toggle */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <button
                          type="button"
                          onClick={() => setShowMapSelector(true)}
                          className={`px-3 py-2 text-xs rounded ${
                            showMapSelector === true
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          🗺️ Interactive Map
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowMapSelector('coordinate')}
                          className={`px-3 py-2 text-xs rounded ${
                            showMapSelector === 'coordinate'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          📍 Coordinate Picker
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowMapSelector(false)}
                          className={`px-3 py-2 text-xs rounded ${
                            showMapSelector === false
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          📝 Manual Input
                        </button>
                        <button
                          type="button"
                          onClick={getCurrentLocation}
                          className="px-3 py-2 text-xs rounded bg-green-500 hover:bg-green-600 text-white"
                        >
                          📱 Current Location
                        </button>
                      </div>

                      {/* Coordinate Inputs */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-gray-600 text-xs font-medium mb-1">
                            Latitude *
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={locationForm.latitude}
                            onChange={(e) => setLocationForm({ ...locationForm, latitude: e.target.value })}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 text-sm leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="24.7136"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 text-xs font-medium mb-1">
                            Longitude *
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={locationForm.longitude}
                            onChange={(e) => setLocationForm({ ...locationForm, longitude: e.target.value })}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 text-sm leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="46.6753"
                            required
                          />
                        </div>
                      </div>

                      {/* Coordinate Preview */}
                      {locationForm.latitude && locationForm.longitude && (
                        <div className="text-xs text-gray-600">
                          📍 {formatCoordinates(locationForm.latitude, locationForm.longitude)} •
                          <a
                            href={`https://www.google.com/maps?q=${locationForm.latitude},${locationForm.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-1 text-blue-500 hover:text-blue-700 underline"
                          >
                            View on Google Maps
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Radius Configuration */}
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        📏 {activeTab === 'checkin' ? 'Check-in Radius (meters)' : 'Alarm Radius (meters)'} *
                      </label>
                      <input
                        type="number"
                        value={activeTab === 'checkin' ? locationForm.radius_meters : locationForm.alarm_radius_meters}
                        onChange={(e) => setLocationForm({
                          ...locationForm,
                          [activeTab === 'checkin' ? 'radius_meters' : 'alarm_radius_meters']: e.target.value
                        })}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="100"
                        min="1"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {activeTab === 'checkin'
                          ? 'Drivers must be within this radius to check in'
                          : 'Alert radius for apartment location monitoring'
                        }
                      </p>
                    </div>

                    {/* Driver Assignment */}
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        👤 Assign to Driver
                      </label>
                      <select
                        value={locationForm.driver}
                        onChange={(e) => setLocationForm({ ...locationForm, driver: e.target.value })}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      >
                        <option value="">Unassigned (General Location)</option>
                        {drivers.map((driver) => (
                          <option key={driver.id} value={driver.id}>
                            {driver.driver_name}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Leave unassigned for general use by all drivers
                      </p>
                    </div>

                    {/* Status Toggle */}
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={locationForm.is_active}
                          onChange={(e) => setLocationForm({ ...locationForm, is_active: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">✅ Location is active</span>
                      </label>
                    </div>
                  </div>

                  {/* Right Column - Map Selector */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3">
                        {showMapSelector ? '🗺️ Interactive Map' : '📍 Location Preview'}
                      </h4>

                      {showMapSelector ? (
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <p className="text-xs text-gray-600">
                              Click on the map or drag the marker to select location. The circle shows the {activeTab === 'checkin' ? 'check-in' : 'alarm'} radius.
                            </p>
                            <button
                              type="button"
                              onClick={() => setShowMapSelector('coordinate')}
                              className="text-xs text-blue-500 hover:text-blue-700 underline"
                            >
                              Use coordinate picker instead
                            </button>
                          </div>
                          {showMapSelector === 'coordinate' ? (
                            <CoordinatePicker
                              latitude={locationForm.latitude}
                              longitude={locationForm.longitude}
                              onLocationSelect={handleMapLocationSelect}
                              radius={parseInt(activeTab === 'checkin' ? locationForm.radius_meters : locationForm.alarm_radius_meters) || 100}
                            />
                          ) : (
                            <MapSelector
                              latitude={locationForm.latitude}
                              longitude={locationForm.longitude}
                              onLocationSelect={handleMapLocationSelect}
                              radius={parseInt(activeTab === 'checkin' ? locationForm.radius_meters : locationForm.alarm_radius_meters) || 100}
                            />
                          )}
                        </div>
                      ) : (
                        <div className="h-96 bg-gray-100 rounded-lg border border-gray-300 flex flex-col items-center justify-center">
                          <div className="text-4xl mb-4">📍</div>
                          <h4 className="text-lg font-medium text-gray-700 mb-2">Location Preview</h4>
                          {locationForm.latitude && locationForm.longitude ? (
                            <div className="text-center">
                              <p className="text-sm text-gray-600 mb-2">
                                Coordinates: {formatCoordinates(locationForm.latitude, locationForm.longitude)}
                              </p>
                              <p className="text-sm text-gray-600 mb-4">
                                Radius: {activeTab === 'checkin' ? locationForm.radius_meters : locationForm.alarm_radius_meters}m
                              </p>
                              <a
                                href={`https://www.google.com/maps?q=${locationForm.latitude},${locationForm.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm"
                              >
                                🌐 View on Google Maps
                              </a>
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center">
                              Enter coordinates or use map selector to see location preview
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLocationModal(false);
                      setShowMapSelector(false);
                    }}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !locationForm.latitude || !locationForm.longitude}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (editingLocation ? 'Update' : 'Create')} Location
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Map View Modal */}
      {selectedLocation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  🗺️ {selectedLocation.name} - Location Map
                </h3>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Location Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">📋 Location Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <div className="font-medium">{selectedLocation.name}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Coordinates:</span>
                      <div className="font-mono text-xs">{formatCoordinates(selectedLocation.latitude, selectedLocation.longitude)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Driver:</span>
                      <div className="font-medium">{getDriverName(selectedLocation.driver)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Radius:</span>
                      <div className="font-medium">
                        {activeTab === 'checkin'
                          ? `${selectedLocation.radius_meters}m`
                          : `${selectedLocation.alarm_radius_meters}m`
                        }
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <div>{getStatusBadge(selectedLocation.is_active)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <div className="text-xs">{new Date(selectedLocation.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* Map Placeholder */}
                <div className="lg:col-span-2 bg-gray-100 rounded-lg p-8 text-center">
                  <div className="text-4xl mb-4">🗺️</div>
                  <h4 className="text-lg font-medium text-gray-700 mb-2">Interactive Map</h4>
                  <p className="text-gray-600 mb-4">
                    Map integration coming soon. For now, you can view the location on Google Maps.
                  </p>
                  <a
                    href={`https://www.google.com/maps?q=${selectedLocation.latitude},${selectedLocation.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded inline-block"
                  >
                    🌐 Open in Google Maps
                  </a>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationManagement;

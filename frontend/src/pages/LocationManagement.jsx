import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import {
  X, Plus, MapPin, Building, Car, Search, Filter, CheckCircle, XCircle, Trash2, Edit, Save, ArrowLeft,
  AlertTriangle, Eye, Upload, Download, Phone, Mail, Calendar, User, FileText, ChevronDown, Clock
} from 'lucide-react'; // Ensure you have lucide-react installed if using these icons


// --- Reusable MapSelector Component (for interactive map) ---
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

    // Ensure initial coordinates are valid numbers, fallback to Riyadh
    const initialLat = parseFloat(latitude) || 24.7136;
    const initialLng = parseFloat(longitude) || 46.6753;

    // Destroy existing map instance if it exists to prevent re-initialization errors
    if (mapRef.current._leaflet_map) {
      mapRef.current._leaflet_map.remove();
    }

    // Create map
    const map = window.L.map(mapRef.current).setView([initialLat, initialLng], 15);
    mapRef.current._leaflet_map = map; // Store map instance on ref for cleanup

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
      setClickCoords({ lat: position.lat, lng: position.lng }); // Update clickCoords
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
      if (mapRef.current && mapRef.current._leaflet_map) {
        mapRef.current._leaflet_map.remove();
        mapRef.current._leaflet_map = null;
      }
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

// --- Reusable CoordinatePicker Component (for manual input and quick selections) ---
const CoordinatePicker = ({ latitude, longitude, onLocationSelect }) => {
  const [tempLat, setTempLat] = useState(latitude ? parseFloat(latitude).toFixed(6) : '24.7136');
  const [tempLng, setTempLng] = useState(longitude ? parseFloat(longitude).toFixed(6) : '46.6753');

  useEffect(() => {
    // Update internal state when props change (e.g., when editing an existing location)
    setTempLat(latitude ? parseFloat(latitude).toFixed(6) : '');
    setTempLng(longitude ? parseFloat(longitude).toFixed(6) : '');
  }, [latitude, longitude]);

  const handleApplyCoordinates = () => {
    const lat = parseFloat(tempLat);
    const lng = parseFloat(tempLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      onLocationSelect(lat, lng);
      toast.success('Coordinates applied successfully!');
    } else {
      toast.error('Please enter valid numerical coordinates.');
    }
  };

  const setQuickLocation = (lat, lng, name) => {
    setTempLat(lat.toFixed(6));
    setTempLng(lng.toFixed(6));
    onLocationSelect(lat, lng);
    toast.info(`Quick location set to ${name}`);
  };

  return (
    <div className="w-full h-auto bg-gray-50 rounded-lg border border-gray-300 p-6">
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">📍</div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">Manual Coordinate Selector</h3>
        <p className="text-gray-600 text-sm">
          Enter coordinates manually or use the quick location buttons below.
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
              placeholder="e.g., 24.7136"
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
              placeholder="e.g., 46.6753"
            />
          </div>
        </div>

        <button
          type="button" // Important: Prevent form submission
          onClick={handleApplyCoordinates}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm"
        >
          📍 Apply Coordinates
        </button>

        <div className="border-t pt-4">
          <p className="text-xs text-gray-600 mb-2">Quick Locations (Saudi Arabia):</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setQuickLocation(24.7136, 46.6753, 'Riyadh')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded text-xs"
            >
              🏢 Riyadh Center
            </button>
            <button
              type="button"
              onClick={() => setQuickLocation(21.4858, 39.1925, 'Jeddah')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded text-xs"
            >
              🏢 Jeddah Center
            </button>
            <button
              type="button"
              onClick={() => setQuickLocation(26.4207, 50.0888, 'Dammam')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded text-xs"
            >
              🏢 Dammam Center
            </button>
            <button
              type="button"
              onClick={() => setQuickLocation(21.2854, 40.4183, 'Mecca')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded text-xs"
            >
              🏢 Mecca Center
            </button>
          </div>
        </div>

        {latitude && longitude && (
          <div className="text-xs text-gray-500 text-center pt-2 border-t">
            Current Set: {parseFloat(latitude).toFixed(6)}, {parseFloat(longitude).toFixed(6)} •
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
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


// --- Main LocationManagement Component ---

const LocationManagement = () => {
  const [activeTab, setActiveTab] = useState('checkin');
  const [loading, setLoading] = useState(false);

  // Data states
  const [checkinLocations, setCheckinLocations] = useState([]);
  const [apartmentLocations, setApartmentLocations] = useState([]);
  const [drivers, setDrivers] = useState([]);

  // Modal states
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocationForMap, setSelectedLocationForMap] = useState(null); // For viewing map of an existing location
  const [editingLocation, setEditingLocation] = useState(null);
  const [showMapInputSelector, setShowMapInputSelector] = useState(false); // Controls which input method is shown in the form modal

  // Form state
  const [locationForm, setLocationForm] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radius_meters: '', // For check-in
    alarm_radius_meters: '', // For apartment
    driver: '', // Driver ID, can be null
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

      // Ensure data is always an array, handle `results` key from DRF pagination if present
      setCheckinLocations(checkinRes.data.results || checkinRes.data);
      setApartmentLocations(apartmentRes.data.results || apartmentRes.data);
      setDrivers(driversRes.data.results || driversRes.data);

      console.log('Location data loaded:', {
        checkin: (checkinRes.data.results || checkinRes.data).length,
        apartment: (apartmentRes.data.results || apartmentRes.data).length,
        drivers: (driversRes.data.results || driversRes.data).length
      });
    } catch (error) {
      console.error('Error fetching location data:', error.response?.data || error.message);
      toast.error('Failed to load location data.');
    } finally {
      setLoading(false);
    }
  };

  // Create/Update location
  const handleSaveLocation = async (e) => {
    e.preventDefault();
    setLoading(true);

    const isCheckin = activeTab === 'checkin';

    // Basic client-side validation
    if (!locationForm.name.trim()) {
      toast.error('Location Name is required.');
      setLoading(false);
      return;
    }
    const lat = parseFloat(locationForm.latitude);
    const lng = parseFloat(locationForm.longitude);
    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Valid Latitude and Longitude are required.');
      setLoading(false);
      return;
    }
    let radiusValue = isCheckin ? locationForm.radius_meters : locationForm.alarm_radius_meters;
    if (isNaN(parseInt(radiusValue)) || parseInt(radiusValue) <= 0) {
        toast.error(`${isCheckin ? 'Check-in Radius' : 'Alarm Radius'} must be a positive number.`);
        setLoading(false);
        return;
    }


    try {
      const endpoint = isCheckin ? '/hr/checkin-locations/' : '/hr/apartment-locations/';
      const dataToSend = {
        name: locationForm.name,
        latitude: lat,
        longitude: lng,
        is_active: locationForm.is_active,
        // Send driver ID or null
        driver: locationForm.driver ? parseInt(locationForm.driver) : null
      };

      // Add radius based on active tab
      if (isCheckin) {
        dataToSend.radius_meters = parseInt(locationForm.radius_meters);
      } else {
        dataToSend.alarm_radius_meters = parseInt(locationForm.alarm_radius_meters);
      }

      if (editingLocation) {
        await axiosInstance.put(`${endpoint}${editingLocation.id}/`, dataToSend);
        toast.success(`${isCheckin ? 'Check-in' : 'Apartment'} location updated successfully!`);
      } else {
        await axiosInstance.post(endpoint, dataToSend);
        toast.success(`${isCheckin ? 'Check-in' : 'Apartment'} location created successfully!`);
      }

      setShowLocationModal(false);
      resetForm();
      fetchData(); // Re-fetch all data to update lists
    } catch (error) {
      console.error('Error saving location:', error.response?.data || error.message);
      // More specific error handling for API responses
      if (error.response?.data) {
          const errors = error.response.data;
          let errorMessage = 'Failed to save location: ';
          if (typeof errors === 'object') {
              for (const key in errors) {
                  errorMessage += `${key}: ${errors[key].join(', ')} `;
              }
          } else {
              errorMessage = errors; // If it's a simple string error
          }
          toast.error(errorMessage);
      } else {
          toast.error('Failed to save location. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete location
  const handleDeleteLocation = async (location) => {
    if (!window.confirm(`Are you sure you want to delete "${location.name}"? This action cannot be undone.`)) return;

    setLoading(true);
    try {
      const endpoint = activeTab === 'checkin' ? '/hr/checkin-locations/' : '/hr/apartment-locations/';
      await axiosInstance.delete(`${endpoint}${location.id}/`);
      toast.success('Location deleted successfully!');
      fetchData(); // Re-fetch data after deletion
    } catch (error) {
      console.error('Error deleting location:', error.response?.data || error.message);
      toast.error('Failed to delete location.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form state
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
    setShowMapInputSelector(false); // Reset map input selector
  };

  // Open location form modal (for add or edit)
  const openLocationModal = (location = null) => {
    if (location) {
      setLocationForm({
        name: location.name,
        latitude: location.latitude?.toString() || '',
        longitude: location.longitude?.toString() || '',
        radius_meters: location.radius_meters?.toString() || '',
        alarm_radius_meters: location.alarm_radius_meters?.toString() || '',
        driver: location.driver?.toString() || '', // Ensure driver ID is string for select value
        is_active: location.is_active
      });
      setEditingLocation(location);
    } else {
      resetForm(); // Reset form for new entry
    }
    setShowLocationModal(true);
  };

  // Close form modal
  const closeLocationModal = () => {
    setShowLocationModal(false);
    resetForm();
  }

  // Get current geolocation from browser
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      // Check if already on HTTPS for secure context
      if (window.location.protocol !== 'https:') {
        toast.error('Geolocation requires a secure connection (HTTPS).');
        console.warn('Geolocation request blocked: Not a secure context (HTTPS).');
        return;
      }

      toast.info('Requesting current location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationForm(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }));
          toast.success('Current location detected successfully!');
        },
        (error) => {
          console.error('Error getting location:', error);
          let errorMessage = 'Failed to get current location: ';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += "User denied geolocation prompt.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage += "The request to get user location timed out.";
              break;
            case error.UNKNOWN_ERROR:
              errorMessage += "An unknown error occurred.";
              break;
            default:
              errorMessage += "An unexpected error occurred.";
          }
          toast.error(errorMessage);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
    }
  };

  // Handle location selected from MapSelector or CoordinatePicker
  const handleMapLocationSelect = (lat, lng) => {
    setLocationForm(prev => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6)
    }));
  };

  // Filter locations based on search, driver, and status
  const getFilteredLocations = () => {
    const locations = activeTab === 'checkin' ? checkinLocations : apartmentLocations;
    return locations.filter(location => {
      const matchesSearch = location.name.toLowerCase().includes(filters.search.toLowerCase());
      // If filters.driver is 'unassigned', match locations with no driver assigned
      const matchesDriver = !filters.driver ||
                            (filters.driver === 'unassigned' && !location.driver) ||
                            (location.driver?.toString() === filters.driver);
      const matchesStatus = !filters.status ||
        (filters.status === 'active' && location.is_active) ||
        (filters.status === 'inactive' && !location.is_active);

      return matchesSearch && matchesDriver && matchesStatus;
    });
  };

  // Initial data fetch on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Helper to get status badge styling
  const getStatusBadge = (isActive) => {
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  // Helper to get driver name from ID
  const getDriverName = (driverId) => {
    if (!driverId) return 'Unassigned';
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.driver_name : 'Unknown Driver';
  };

  // Helper to format coordinates for display
  const formatCoordinates = (lat, lng) => {
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      return 'N/A';
    }
    return `${parsedLat.toFixed(4)}, ${parsedLng.toFixed(4)}`;
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                  <option value="unassigned">Unassigned</option> {/* Explicit option for unassigned */}
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
              <Plus className="w-5 h-5 mr-2" />
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
                  <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No {activeTab === 'checkin' ? 'check-in' : 'apartment'} locations found
                  </h3>
                  <p className="text-gray-500">
                    Add your first {activeTab === 'checkin' ? 'check-in' : 'apartment'} location to get started.
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
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-gray-500" />
                        <span className="font-mono">{formatCoordinates(location.latitude, location.longitude)}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 flex-shrink-0 text-gray-500" />
                        <span>{getDriverName(location.driver)}</span>
                      </div>
                      <div className="flex items-center">
                        <Filter className="h-4 w-4 mr-2 flex-shrink-0 text-gray-500" />
                        <span>
                          {activeTab === 'checkin'
                            ? `${location.radius_meters || 'N/A'}m (Check-in)`
                            : `${location.alarm_radius_meters || 'N/A'}m (Alarm)`
                          }
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 flex-shrink-0 text-gray-500" />
                        <span>Created: {new Date(location.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedLocationForMap(location)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-2 px-3 rounded flex items-center justify-center"
                      >
                        <MapPin className="h-3 w-3 mr-1" /> View Map
                      </button>
                      <button
                        onClick={() => openLocationModal(location)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 px-3 rounded flex items-center justify-center"
                      >
                        <Edit className="h-3 w-3 mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(location)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs py-2 px-3 rounded flex items-center justify-center"
                        disabled={loading}
                      >
                        <Trash2 className="h-3 w-3 mr-1" /> Delete
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {editingLocation ? 'Edit' : 'Add New'} {activeTab === 'checkin' ? 'Check-in' : 'Apartment'} Location
              </h3>
              <button onClick={closeLocationModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveLocation} className="p-6">
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
                        onClick={() => setShowMapInputSelector('map')}
                        className={`px-3 py-2 text-xs rounded ${
                          showMapInputSelector === 'map'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        🗺️ Interactive Map
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMapInputSelector('coordinate')}
                        className={`px-3 py-2 text-xs rounded ${
                          showMapInputSelector === 'coordinate'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        📍 Coordinate Picker
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMapInputSelector('manual')}
                        className={`px-3 py-2 text-xs rounded ${
                          showMapInputSelector === 'manual'
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

                    {/* Render MapSelector, CoordinatePicker or manual inputs based on toggle */}
                    {showMapInputSelector === 'map' && (
                      <MapSelector
                        latitude={locationForm.latitude}
                        longitude={locationForm.longitude}
                        onLocationSelect={handleMapLocationSelect}
                        radius={activeTab === 'checkin' ? (parseFloat(locationForm.radius_meters) || 100) : (parseFloat(locationForm.alarm_radius_meters) || 100)}
                      />
                    )}
                    {showMapInputSelector === 'coordinate' && (
                      <CoordinatePicker
                        latitude={locationForm.latitude}
                        longitude={locationForm.longitude}
                        onLocationSelect={handleMapLocationSelect}
                      />
                    )}
                    {showMapInputSelector === 'manual' && (
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
                    )}


                    {/* Coordinate Preview (always show if available, regardless of input method) */}
                    {locationForm.latitude && locationForm.longitude && (
                      <div className="text-xs text-gray-600 mt-3 p-2 bg-white rounded border">
                        📍 Current selection: {formatCoordinates(locationForm.latitude, locationForm.longitude)} •
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${locationForm.latitude},${locationForm.longitude}`}
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
                        ? 'Drivers must be within this radius to check in.'
                        : 'Alert radius for apartment location monitoring.'
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
                      <option value="">-- No Driver --</option> {/* Option for unassigning */}
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.driver_name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                        Assign this location to a specific driver. Leave blank for unassigned.
                    </p>
                  </div>

                  {/* Active Status Toggle */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={locationForm.is_active}
                      onChange={(e) => setLocationForm({ ...locationForm, is_active: e.target.checked })}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="text-gray-700 text-sm font-bold">
                      Is Active
                    </label>
                    <p className="text-xs text-gray-500 ml-2">
                      Toggle to activate or deactivate this location.
                    </p>
                  </div>
                </div>

                {/* Right Column - Map/Coordinate Selector (Placeholder - actual rendering is dynamic now) */}
                <div className="hidden lg:block"> {/* This column is primarily for visual separation */}
                  {/* The actual MapSelector or CoordinatePicker will render within the left column based on showMapInputSelector */}
                  <div className="h-full flex items-center justify-center p-4 bg-gray-100 rounded-lg border border-gray-200 text-gray-500">
                    <p>Select a location input method from the left.</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-8 flex justify-end space-x-3 border-t pt-4">
                <button
                  type="button"
                  onClick={closeLocationModal}
                  className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-md transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 inline-block mr-2" />
                      {editingLocation ? 'Update Location' : 'Add Location'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Map Modal (for existing locations) */}
      {selectedLocationForMap && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Map View for: {selectedLocationForMap.name}
              </h3>
              <button onClick={() => setSelectedLocationForMap(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-6">
              <MapSelector
                latitude={selectedLocationForMap.latitude}
                longitude={selectedLocationForMap.longitude}
                onLocationSelect={(lat, lng) => toast.info(`Map position changed to ${lat.toFixed(4)}, ${lng.toFixed(4)}`)} // Read-only for this modal
                radius={activeTab === 'checkin' ? (selectedLocationForMap.radius_meters || 100) : (selectedLocationForMap.alarm_radius_meters || 100)}
              />
              <div className="mt-4 text-sm text-gray-700">
                Coordinates: {formatCoordinates(selectedLocationForMap.latitude, selectedLocationForMap.longitude)}
                <br />
                Assigned Driver: {getDriverName(selectedLocationForMap.driver)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationManagement;
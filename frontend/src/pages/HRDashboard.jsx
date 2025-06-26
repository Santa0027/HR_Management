import React, { useEffect, useState, useRef } from 'react';
// import axios from 'axios'; // This import is no longer needed
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet'; // Import Leaflet for custom icon

// Import your configured axiosInstance
import axiosInstance from '../api/axiosInstance'; // ADJUST THIS PATH if your axiosConfig.js is elsewhere

// --- SHADCN UI IMPORTS (UNCOMMENT IF YOU ARE USING SHADCN UI) ---
// If you have Shadcn UI components properly set up and configured with your Vite project,
// uncomment these lines and remove/comment out the placeholder components below.
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


// --- PLACEHOLDER COMPONENTS (COMMENT OUT/DELETE IF USING SHADCN UI) ---
// These are basic functional components that mimic the structure and props
// of common UI elements. They are used if Shadcn UI imports are commented out.
// You'll need to style them with Tailwind CSS classes to match your design.
const Table = ({ children, ...props }) => <table className="w-full table-auto text-sm" {...props}>{children}</table>;
const TableBody = ({ children }) => <tbody className="text-white">{children}</tbody>;
const TableCell = ({ children, ...props }) => <td className="py-2 px-2" {...props}>{children}</td>;
const TableHead = ({ children, ...props }) => <th className="py-2 px-2" {...props}>{children}</th>; // Added props for flexibility
const TableHeader = ({ children }) => <thead className="text-left text-gray-400 border-b border-gray-700">{children}</thead>;
const TableRow = ({ children }) => <tr className="border-b border-gray-800">{children}</tr>;
const Button = ({ children, onClick, className = '', type = 'button' }) => <button type={type} onClick={onClick} className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm ${className}`}>{children}</button>;
const Input = ({ type = 'text', placeholder, value, onChange, className = '', id, name, step, readOnly = false }) => <input id={id} name={name} type={type} placeholder={placeholder} value={value} onChange={onChange} step={step} readOnly={readOnly} className={`w-full px-4 py-2 bg-gray-800 text-white rounded-md border border-gray-700 ${className}`} />;
const Label = ({ children, htmlFor }) => <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-300 mb-1 mt-3">{children}</label>;

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full">
        {children}
      </div>
    </div>
  );
};
const DialogContent = ({ children }) => <div>{children}</div>;
const DialogHeader = ({ children }) => <div className="mb-4 text-xl font-semibold">{children}</div>;
const DialogTitle = ({ children }) => <h2>{children}</h2>;
const DialogFooter = ({ children }) => <div className="flex justify-end space-x-2 mt-4">{children}</div>;
const DialogClose = ({ children, onClick }) => <Button onClick={onClick} className="bg-gray-600 hover:bg-gray-700">{children}</Button>;

const Select = ({ children, value, onValueChange, className = '', id }) => (
  <select id={id} value={value} onChange={(e) => onValueChange(e.target.value)} className={`w-full px-4 py-2 bg-gray-800 text-white rounded-md border border-gray-700 ${className}`}>
    {children}
  </select>
);
const SelectTrigger = ({ children }) => <>{children}</>;
const SelectValue = ({ placeholder }) => <option value="">{placeholder}</option>;
const SelectContent = ({ children }) => <>{children}</>;
const SelectItem = ({ value, children, disabled = false }) => <option value={value} disabled={disabled}>{children}</option>;
// --- END PLACEHOLDER COMPONENTS ---


// --- Custom marker icon (optional, but good for visibility) ---
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Map Click Handler Component
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// --- Reusable Location Form Component ---
const LocationForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isCheckin = true, // Determines if it's a checkin location (true) or apartment (false)
  drivers, // Contains list of drivers for both checkin and apartment locations now
  loadingDrivers, // Loading state for drivers
}) => {
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radius_meters: '',        // Applicable for checkin
    alarm_radius_meters: '',  // Applicable for apartment
    driver_id: '',            // Applicable for both checkin and apartment
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      const dataToLoad = initialData || {};
      const initialLat = parseFloat(dataToLoad.latitude) || '';
      const initialLng = parseFloat(dataToLoad.longitude) || '';

      setFormData({
        name: dataToLoad.name || '',
        latitude: initialLat.toString(),
        longitude: initialLng.toString(),
        radius_meters: dataToLoad.radius_meters || '',
        alarm_radius_meters: dataToLoad.alarm_radius_meters || '',
        driver_id: dataToLoad.driver_id || dataToLoad.driver?.id || '',
      });
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMapClick = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toFixed(6), // Format to 6 decimal places for display
      longitude: lng.toFixed(6),
    }));
  };

  const handleDriverChange = (value) => {
    setFormData((prev) => ({ ...prev, driver_id: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Location Name is required.';
    if (!formData.latitude) newErrors.latitude = 'Latitude is required.';
    if (!formData.longitude) newErrors.longitude = 'Longitude is required.';
    if (isCheckin && (!formData.radius_meters || isNaN(parseInt(formData.radius_meters)))) newErrors.radius_meters = 'Radius (m) is required and must be an integer.';
    if (!isCheckin && (!formData.alarm_radius_meters || isNaN(parseInt(formData.alarm_radius_meters)))) newErrors.alarm_radius_meters = 'Alarm Radius (m) is required and must be an integer.';

    // Driver is now required for both checkin and apartment locations
    if (!formData.driver_id) newErrors.driver_id = 'Driver is required.';

    if (formData.latitude && isNaN(parseFloat(formData.latitude))) newErrors.latitude = 'Latitude must be a number.';
    if (formData.longitude && isNaN(parseFloat(formData.longitude))) newErrors.longitude = 'Longitude must be a number.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("Form validation failed on frontend. Errors:", errors);
      return;
    }

    const selectedDriver = drivers.find(
      (driver) => String(driver.id) === String(formData.driver_id)
    );
    if (!selectedDriver) {
      alert("Error: Selected driver not found in the list. Please re-select a driver.");
      return;
    }

    let payload = {
      name: formData.name,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      driver_id: parseInt(formData.driver_id),
    };

    if (isCheckin) {
      payload.radius_meters = parseInt(formData.radius_meters);
    } else {
      payload.alarm_radius_meters = parseInt(formData.alarm_radius_meters);
    }

    onSubmit(payload);
  };

  const initialMapCenter = [
    parseFloat(formData.latitude) || 12.9716, // Default to Chennai if no latitude
    parseFloat(formData.longitude) || 80.2707  // Default to Chennai if no longitude
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit' : 'Add New'} {isCheckin ? 'Check-in' : 'Apartment'} Location</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Label htmlFor="name">Location Name:</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Main Office" />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}

          <Label htmlFor="map">Select Location on Map:</Label>
          <div className="rounded-md overflow-hidden border border-gray-700 mb-4" style={{ height: '300px', width: '100%' }}>
            <MapContainer
              center={initialMapCenter}
              zoom={13}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {formData.latitude && formData.longitude && (
                <Marker
                  position={[parseFloat(formData.latitude), parseFloat(formData.longitude)]}
                  icon={customIcon}
                />
              )}
              <MapClickHandler onMapClick={handleMapClick} />
            </MapContainer>
          </div>

          <Label htmlFor="latitude">Latitude:</Label>
          <Input id="latitude" name="latitude" type="number" step="0.000001" value={formData.latitude} onChange={handleChange} placeholder="e.g., 12.345678" readOnly />
          {errors.latitude && <p className="text-red-400 text-xs mt-1">{errors.latitude}</p>}

          <Label htmlFor="longitude">Longitude:</Label>
          <Input id="longitude" name="longitude" type="number" step="0.000001" value={formData.longitude} onChange={handleChange} placeholder="e.g., 98.765432" readOnly />
          {errors.longitude && <p className="text-red-400 text-xs mt-1">{errors.longitude}</p>}

          {isCheckin && (
            <>
              <Label htmlFor="radius_meters">Radius (m):</Label>
              <Input id="radius_meters" name="radius_meters" type="number" value={formData.radius_meters} onChange={handleChange} placeholder="e.g., 50" />
              {errors.radius_meters && <p className="text-red-400 text-xs mt-1">{errors.radius_meters}</p>}
            </>
          )}

          {!isCheckin && (
            <>
              <Label htmlFor="alarm_radius_meters">Alarm Radius (m):</Label>
              <Input id="alarm_radius_meters" name="alarm_radius_meters" type="number" value={formData.alarm_radius_meters} onChange={handleChange} placeholder="e.g., 200" />
              {errors.alarm_radius_meters && <p className="text-red-400 text-xs mt-1">{errors.alarm_radius_meters}</p>}
            </>
          )}

          {/* Driver selection is now universal for both checkin and apartment */}
          <>
            <Label htmlFor="driver_id">Driver:</Label>
            <Select id="driver_id" value={formData.driver_id} onValueChange={handleDriverChange}>
              <SelectTrigger>
                <SelectValue placeholder={loadingDrivers ? "Loading drivers..." : "Select a driver"} />
              </SelectTrigger>
              <SelectContent>
                {loadingDrivers ? (
                  <SelectItem value="" disabled key="loading-driver-option">Loading...</SelectItem>
                ) : (
                  <>
                    <SelectItem value="" key="default-driver-option">Select a driver</SelectItem>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.driver_name}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
            {errors.driver_id && <p className="text-red-400 text-xs mt-1">{errors.driver_id}</p>}
          </>

          <DialogFooter>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {initialData ? 'Save Changes' : 'Add Location'}
            </Button>
            <DialogClose onClick={onClose}>Cancel</DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// --- CheckinLocationTable Component ---
const CheckinLocationTable = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [filterText, setFilterText] = useState('');

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('checkin-locations/');
      setLocations(res.data);
    } catch (err) {
      console.error('Error fetching checkin locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    setLoadingDrivers(true);
    try {
      const res = await axiosInstance.get('Register/drivers/');
      setDrivers(res.data);
    } catch (err) {
      console.error('Error fetching drivers:', err);
    } finally {
      setLoadingDrivers(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchDrivers();
  }, []);

  const handleAddLocationClick = () => {
    setEditingLocation(null);
    setShowForm(true);
  };

  const handleEditLocationClick = (location) => {
    setEditingLocation(location);
    setShowForm(true);
  };

  const handleDeleteLocation = async (id) => {
    if (window.confirm('Are you sure you want to delete this check-in location?')) {
      try {
        await axiosInstance.delete(`checkin-locations/${id}/`);
        alert('Location deleted successfully!');
        fetchLocations();
      } catch (err) {
        console.error('Error deleting location:', err.response ? err.response.data : err.message);
        alert('Failed to delete location.');
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingLocation) {
        await axiosInstance.put(`checkin-locations/${editingLocation.id}/`, formData);
        alert('Location updated successfully!');
      } else {
        await axiosInstance.post('checkin-locations/', formData);
        alert('Location added successfully!');
      }
      setShowForm(false);
      fetchLocations();
    } catch (err) {
      console.error('Error saving location:', err.response ? err.response.data : err.message);
      alert(`Failed to save location: ${err.response?.data?.driver_name || err.message || 'Unknown error'}`);
    }
  };

  const filteredLocations = locations.filter(loc =>
    loc.name.toLowerCase().includes(filterText.toLowerCase()) ||
    loc.driver?.driver_name.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search check-in locations by name or driver"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Location Name</TableHead>
              <TableHead>Latitude</TableHead>
              <TableHead>Longitude</TableHead>
              <TableHead>Radius (m)</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="py-4 text-center">Loading...</TableCell></TableRow>
            ) : filteredLocations.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="py-4 text-center">No check-in locations found.</TableCell></TableRow>
            ) : (
              filteredLocations.map((loc) => (
                <TableRow key={loc.id}>
                  <TableCell>{loc.name}</TableCell>
                  <TableCell>{loc.latitude}</TableCell>
                  <TableCell>{loc.longitude}</TableCell>
                  <TableCell>{loc.radius_meters}</TableCell>
                  <TableCell>{loc.driver?.driver_name || 'N/A'}</TableCell>
                  <TableCell>
                    <span
                      className="text-blue-400 cursor-pointer hover:underline mr-2"
                      onClick={() => handleEditLocationClick(loc)}
                    >
                      Edit
                    </span>
                    <span
                      className="text-red-400 cursor-pointer hover:underline"
                      onClick={() => handleDeleteLocation(loc.id)}
                    >
                      Delete
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm">Showing {filteredLocations.length} of {locations.length} locations</div>
        <Button onClick={handleAddLocationClick}>
          Add New Location
        </Button>
      </div>

      <LocationForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleFormSubmit}
        initialData={editingLocation}
        isCheckin={true}
        drivers={drivers}
        loadingDrivers={loadingDrivers}
      />
    </div>
  );
};


// --- ApartmentLocationTable Component (Now functions like CheckinLocationTable) ---
const ApartmentLocationTable = () => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingApartment, setEditingApartment] = useState(null);
  const [drivers, setDrivers] = useState([]); // Now using drivers state
  const [loadingDrivers, setLoadingDrivers] = useState(true); // Now using loadingDrivers state
  const [filterText, setFilterText] = useState('');

  const fetchApartments = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('apartment-locations/');
      setApartments(res.data);
    } catch (err) {
      console.error('Error fetching apartment locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => { // Now fetching drivers for apartments
    setLoadingDrivers(true);
    try {
      const res = await axiosInstance.get('Register/drivers/'); // Correct endpoint for drivers
      setDrivers(res.data);
    } catch (err) {
      console.error('Error fetching drivers for apartments:', err);
    } finally {
      setLoadingDrivers(false);
    }
  };

  useEffect(() => {
    fetchApartments();
    fetchDrivers(); // Fetch drivers for this table as well
  }, []);

  const handleAddApartmentClick = () => {
    setEditingApartment(null);
    setShowForm(true);
  };

  const handleEditApartmentClick = (apartment) => {
    setEditingApartment(apartment);
    setShowForm(true);
  };

  const handleDeleteApartment = async (id) => {
    if (window.confirm('Are you sure you want to delete this apartment location?')) {
      try {
        await axiosInstance.delete(`apartment-locations/${id}/`);
        alert('Apartment deleted successfully!');
        fetchApartments();
      } catch (err) {
        console.error('Error deleting apartment:', err.response ? err.response.data : err.message);
        alert('Failed to delete apartment.');
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingApartment) {
        await axiosInstance.put(`apartment-locations/${editingApartment.id}/`, formData);
        alert('Apartment updated successfully!');
      } else {
        await axiosInstance.post('apartment-locations/', formData);
        alert('Apartment added successfully!');
      }
      setShowForm(false);
      fetchApartments();
    } catch (err) {
      console.error('Error saving apartment:', err.response ? err.response.data : err.message);
      alert(`Failed to save apartment: ${err.response?.data?.name || err.message || 'Unknown error'}`);
    }
  };

  const filteredApartments = apartments.filter(apt =>
    apt.name.toLowerCase().includes(filterText.toLowerCase()) ||
    apt.driver?.driver_name.toLowerCase().includes(filterText.toLowerCase()) // Filter by driver name
  );

  return (
    <div>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search apartment locations by name or driver" // Updated placeholder
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Apartment Name</TableHead>
              <TableHead>Latitude</TableHead>
              <TableHead>Longitude</TableHead>
              <TableHead>Alarm Radius (m)</TableHead>
              <TableHead>Driver</TableHead> {/* Changed from Company to Driver */}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="py-4 text-center">Loading...</TableCell></TableRow>
            ) : filteredApartments.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="py-4 text-center">No apartment locations found.</TableCell></TableRow>
            ) : (
              filteredApartments.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell>{apt.name}</TableCell>
                  <TableCell>{apt.latitude}</TableCell>
                  <TableCell>{apt.longitude}</TableCell>
                  <TableCell>{apt.alarm_radius_meters}</TableCell>
                  <TableCell>{apt.driver?.driver_name || 'N/A'}</TableCell> {/* Display driver_name */}
                  <TableCell>
                    <span
                      className="text-blue-400 cursor-pointer hover:underline mr-2"
                      onClick={() => handleEditApartmentClick(apt)}
                    >
                      Edit
                    </span>
                    <span
                      className="text-red-400 cursor-pointer hover:underline"
                      onClick={() => handleDeleteApartment(apt.id)}
                    >
                      Delete
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm">Showing {filteredApartments.length} of {apartments.length} apartments</div>
        <Button onClick={handleAddApartmentClick}>
          Add Apartment
        </Button>
      </div>

      <LocationForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleFormSubmit}
        initialData={editingApartment}
        isCheckin={false} // This prop still differentiates between radius_meters and alarm_radius_meters
        drivers={drivers} // Pass drivers to LocationForm for apartment locations
        loadingDrivers={loadingDrivers} // Pass loadingDrivers for apartment locations
      />
    </div>
  );
};


// HRDashboard component
const HRDashboard = () => {
  const [activeTab, setActiveTab] = useState('checkin');

  const renderTab = () => {
    switch (activeTab) {
      case 'checkin':
        return <CheckinLocationTable />;
      case 'apartment':
        return <ApartmentLocationTable />;
      case 'notifications':
        return <NotificationManagement />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">HR Management Dashboard</h1>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('checkin')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'checkin' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
          }`}
        >
          Check-in Locations
        </button>
        <button
          onClick={() => setActiveTab('apartment')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'apartment' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
          }`}
        >
          Apartment Locations
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'notifications' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
          }`}
        >
          Notifications
        </button>
      </div>

      <div>{renderTab()}</div>
    </div>
  );
};


// Simple placeholder for Notification Management - you can expand this similarly
const NotificationManagement = () => (
  <div className="text-center py-10">
    <p className="text-lg">Notification Management section under construction.</p>
    {/* You'd build out similar CRUD functionality for notifications here */}
  </div>
);

export default HRDashboard;
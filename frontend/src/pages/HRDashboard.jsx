// import React, { useEffect, useState, useRef } from 'react';
// import axios from 'axios';

// // --- SHADCN UI IMPORTS (UNCOMMENT IF YOU ARE USING SHADCN UI) ---
// // If you have Shadcn UI components properly set up and configured with your Vite project,
// // uncomment these lines and remove/comment out the placeholder components below.
// // import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
// // import { Label } from "@/components/ui/label";
// // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


// // --- PLACEHOLDER COMPONENTS (COMMENT OUT/DELETE IF USING SHADCN UI) ---
// // These are basic functional components that mimic the structure and props
// // of common UI elements. They are used if Shadcn UI imports are commented out.
// // You'll need to style them with Tailwind CSS classes to match your design.
// const Table = ({ children, ...props }) => <table className="w-full table-auto text-sm" {...props}>{children}</table>;
// const TableBody = ({ children }) => <tbody className="text-white">{children}</tbody>;
// const TableCell = ({ children, ...props }) => <td className="py-2 px-2" {...props}>{children}</td>;
// const TableHead = ({ children }) => <th className="py-2 px-2">{children}</th>;
// const TableHeader = ({ children }) => <thead className="text-left text-gray-400 border-b border-gray-700">{children}</thead>;
// const TableRow = ({ children }) => <tr className="border-b border-gray-800">{children}</tr>;
// const Button = ({ children, onClick, className = '', type = 'button' }) => <button type={type} onClick={onClick} className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm ${className}`}>{children}</button>;
// const Input = ({ type = 'text', placeholder, value, onChange, className = '', id, name, step }) => <input id={id} name={name} type={type} placeholder={placeholder} value={value} onChange={onChange} step={step} className={`w-full px-4 py-2 bg-gray-800 text-white rounded-md border border-gray-700 ${className}`} />;
// const Label = ({ children, htmlFor }) => <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-300 mb-1 mt-3">{children}</label>;

// const Dialog = ({ open, onOpenChange, children }) => {
//   if (!open) return null;
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full">
//         {children}
//       </div>
//     </div>
//   );
// };
// const DialogContent = ({ children }) => <div>{children}</div>;
// const DialogHeader = ({ children }) => <div className="mb-4 text-xl font-semibold">{children}</div>;
// const DialogTitle = ({ children }) => <h2>{children}</h2>;
// const DialogFooter = ({ children }) => <div className="flex justify-end space-x-2 mt-4">{children}</div>;
// const DialogClose = ({ children, onClick }) => <Button onClick={onClick} className="bg-gray-600 hover:bg-gray-700">{children}</Button>;

// const Select = ({ children, value, onValueChange, className = '', id }) => (
//   <select id={id} value={value} onChange={(e) => onValueChange(e.target.value)} className={`w-full px-4 py-2 bg-gray-800 text-white rounded-md border border-gray-700 ${className}`}>
//     {children}
//   </select>
// );
// const SelectTrigger = ({ children }) => <>{children}</>;
// const SelectValue = ({ placeholder }) => <option value="">{placeholder}</option>;
// const SelectContent = ({ children }) => <>{children}</>;
// const SelectItem = ({ value, children }) => <option value={value}>{children}</option>;
// // --- END PLACEHOLDER COMPONENTS ---


// // --- API Base URL ---
// // Make sure this matches your Django API's root URL (e.g., if your Django project runs on port 8000
// // and has `path('api/', include('your_app_name.urls'))` in its main urls.py)
// const API_BASE_URL = 'http://localhost:8000/'; // Corrected to include /api/

// // --- Reusable Location Form Component ---
// const LocationForm = ({
//   isOpen,
//   onClose,
//   onSubmit,
//   initialData = null, // Default to null for new additions
//   isCheckin = true, // true for CheckinLocation, false for ApartmentLocation
//   company, // List of company to populate the dropdown
//   loadingcompany // Loading state for company
// }) => {
//   const [formData, setFormData] = useState({
//     name: '',
//     latitude: '',
//     longitude: '',
//     radius_meters: '', // For CheckinLocation
//     alarm_radius_meters: '', // For ApartmentLocation
//     company_id: '', // Foreign key for company
//   });
//   const [errors, setErrors] = useState({});
//   const mapRef = useRef(null); // Ref for the map div
//   const mapInstance = useRef(null); // To store the Google Map object
//   const markerInstance = useRef(null); // To store the AdvancedMarkerElement

//   useEffect(() => {
//     // This effect handles initializing and cleaning up the map
//     if (isOpen) {
//       const dataToLoad = initialData || {};
//       const initialLat = parseFloat(dataToLoad.latitude) || 0;
//       const initialLng = parseFloat(dataToLoad.longitude) || 0;

//       // Set form data when the dialog opens or initialData changes (for editing)
//       setFormData({
//         name: dataToLoad.name || '',
//         latitude: initialLat.toString(),
//         longitude: initialLng.toString(),
//         radius_meters: dataToLoad.radius_meters || '',
//         alarm_radius_meters: dataToLoad.alarm_radius_meters || '',
//         company_id: dataToLoad.company?.id || '', // Safely access company.id
//       });
//       setErrors({}); // Clear errors when opening form

//       const loadGoogleMapsScript = (callback) => {
//         if (window.google) {
//           callback();
//           return;
//         }
//         const script = document.createElement('script');
//         // IMPORTANT: Replace 'YOUR_ACTUAL_GOOGLE_MAPS_API_KEY_HERE' with your valid API key.
//         // Ensure 'places' and 'marker' libraries are included.
//         script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_GOOGLE_MAPS_API_KEY_HERE&libraries=places,marker`;
//         script.async = true;
//         script.defer = true;
//         script.onerror = (error) => {
//           console.error("Failed to load Google Maps script:", error);
//           alert("Failed to load Google Maps. Please check your API key and network connection.");
//         };
//         script.onload = callback;
//         document.head.appendChild(script);
//       };

//       const initializeMap = async () => {
//         if (!mapRef.current) return;

//         // Default to a common location if initial coordinates are 0,0
//         const defaultCenter = { lat: 34.0522, lng: -118.2437 }; // Example: Los Angeles
//         const center = (initialLat === 0 && initialLng === 0) ? defaultCenter : { lat: initialLat, lng: initialLng };

//         // Initialize the map
//         mapInstance.current = new window.google.maps.Map(mapRef.current, {
//           center: center,
//           zoom: 8,
//           // Optional: If you're using custom map styles via Cloud Console
//           // mapId: 'YOUR_MAP_ID',
//         });

//         // Create the AdvancedMarkerElement (recommended over google.maps.Marker)
//         markerInstance.current = new window.google.maps.marker.AdvancedMarkerElement({
//           map: mapInstance.current,
//           position: center,
//           gmpDraggable: true, // This makes the Advanced Marker draggable
//         });

//         // Add listener for dragend event on the marker
//         markerInstance.current.addListener('dragend', (event) => {
//           const lat = event.latLng.lat();
//           const lng = event.latLng.lng();
//           setFormData(prev => ({ ...prev, latitude: lat.toString(), longitude: lng.toString() }));
//         });

//         // Add listener for map click event to move the marker
//         mapInstance.current.addListener('click', (event) => {
//           const lat = event.latLng.lat();
//           const lng = event.latLng.lng();
//           setFormData(prev => ({ ...prev, latitude: lat.toString(), longitude: lng.toString() }));
//           markerInstance.current.position = { lat, lng }; // Update the marker's position
//           mapInstance.current.setCenter({ lat, lng }); // Center map on new marker position
//         });

//         // Add listener for map idle event to center the map when it's ready
//         // This can help ensure the map is properly rendered after the dialog appears
//         window.google.maps.event.addListenerOnce(mapInstance.current, 'idle', () => {
//             mapInstance.current.setCenter(center);
//             mapInstance.current.setZoom(mapInstance.current.getZoom()); // Re-set zoom to trigger redraw
//         });
//       };

//       // Load script and then initialize map
//       loadGoogleMapsScript(initializeMap);

//     } else {
//       // Clean up map resources when the dialog closes to prevent memory leaks
//       if (markerInstance.current) {
//         markerInstance.current.map = null; // Detach marker from map
//         markerInstance.current = null;
//       }
//       if (mapInstance.current) {
//         // This helps release resources, though Google Maps API handles most cleanup
//         mapInstance.current = null;
//       }
//       // Clear the map div content to ensure it's truly gone
//       if (mapRef.current) {
//         mapRef.current.innerHTML = '';
//       }
//     }
//   }, [isOpen, initialData]); // initialData is sufficient as dependency here, lat/lng updates handled by separate effect

//   // This effect ensures the marker and map center update if latitude/longitude are manually typed
//   useEffect(() => {
//     if (markerInstance.current && mapInstance.current && formData.latitude && formData.longitude) {
//       const newPosition = {
//         lat: parseFloat(formData.latitude),
//         lng: parseFloat(formData.longitude)
//       };
//       if (!isNaN(newPosition.lat) && !isNaN(newPosition.lng)) {
//         markerInstance.current.position = newPosition;
//         mapInstance.current.setCenter(newPosition); // Keep map centered on input changes
//       }
//     }
//   }, [formData.latitude, formData.longitude]); // Depend on changes in lat/lng input fields


//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleCompanyChange = (value) => {
//     setFormData((prev) => ({ ...prev, company_id: value }));
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.name) newErrors.name = 'Location Name is required.';
//     if (!formData.latitude) newErrors.latitude = 'Latitude is required.';
//     if (!formData.longitude) newErrors.longitude = 'Longitude is required.';
//     if (isCheckin && !formData.radius_meters) newErrors.radius_meters = 'Radius (m) is required.';
//     if (!isCheckin && !formData.alarm_radius_meters) newErrors.alarm_radius_meters = 'Alarm Radius (m) is required.';
//     if (!formData.company_id) newErrors.company_id = 'Company is required.';

//     // Basic number validation
//     if (formData.latitude && isNaN(parseFloat(formData.latitude))) newErrors.latitude = 'Latitude must be a number.';
//     if (formData.longitude && isNaN(parseFloat(formData.longitude))) newErrors.longitude = 'Longitude must be a number.';
//     if (isCheckin && formData.radius_meters && isNaN(parseInt(formData.radius_meters))) newErrors.radius_meters = 'Radius must be an integer.';
//     if (!isCheckin && formData.alarm_radius_meters && isNaN(parseInt(formData.alarm_radius_meters))) newErrors.alarm_radius_meters = 'Alarm Radius must be an integer.';

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!validateForm()) {
//       return;
//     }
//     // Convert numeric fields to numbers before submission
//     const payload = {
//       ...formData,
//       latitude: parseFloat(formData.latitude),
//       longitude: parseFloat(formData.longitude),
//     };
//     if (isCheckin) {
//       payload.radius_meters = parseInt(formData.radius_meters);
//     } else {
//       payload.alarm_radius_meters = parseInt(formData.alarm_radius_meters);
//     }

//     onSubmit(payload);
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>{initialData ? 'Edit' : 'Add New'} {isCheckin ? 'Check-in' : 'Apartment'} Location</DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleSubmit}>
//           <Label htmlFor="name">Location Name:</Label>
//           <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Main Office" />
//           {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}

//           {/* Map container - will be populated by Google Maps */}
//           <div ref={mapRef} style={{ height: '300px', width: '100%', marginTop: '1rem', borderRadius: '8px' }} />

//           <Label htmlFor="latitude">Latitude:</Label>
//           <Input id="latitude" name="latitude" type="number" step="0.000001" value={formData.latitude} onChange={handleChange} placeholder="e.g., 12.345678" />
//           {errors.latitude && <p className="text-red-400 text-xs mt-1">{errors.latitude}</p>}

//           <Label htmlFor="longitude">Longitude:</Label>
//           <Input id="longitude" name="longitude" type="number" step="0.000001" value={formData.longitude} onChange={handleChange} placeholder="e.g., 98.765432" />
//           {errors.longitude && <p className="text-red-400 text-xs mt-1">{errors.longitude}</p>}

//           {isCheckin && (
//             <>
//               <Label htmlFor="radius_meters">Radius (m):</Label>
//               <Input id="radius_meters" name="radius_meters" type="number" value={formData.radius_meters} onChange={handleChange} placeholder="e.g., 50" />
//               {errors.radius_meters && <p className="text-red-400 text-xs mt-1">{errors.radius_meters}</p>}
//             </>
//           )}

//           {!isCheckin && (
//             <>
//               <Label htmlFor="alarm_radius_meters">Alarm Radius (m):</Label>
//               <Input id="alarm_radius_meters" name="alarm_radius_meters" type="number" value={formData.alarm_radius_meters} onChange={handleChange} placeholder="e.g., 200" />
//               {errors.alarm_radius_meters && <p className="text-red-400 text-xs mt-1">{errors.alarm_radius_meters}</p>}
//             </>
//           )}

//           <Label htmlFor="company_id">Company:</Label>
//           <Select id="company_id" value={formData.company_id} onValueChange={handleCompanyChange}>
//             <SelectTrigger>
//               <SelectValue placeholder={loadingcompany ? "Loading company..." : "Select a company"} />
//             </SelectTrigger>
//             <SelectContent>
//               {loadingcompany ? (
//                 <SelectItem value="" disabled>Loading...</SelectItem>
//               ) : (
//                 <>
//                   <SelectItem value="">Select a company</SelectItem>
//                   {company.map((company) => (
//                     // Ensure company.id is number and company.name is string
//                     <SelectItem key={company.id} value={company.id}>
//                       {company.company_name}
//                     </SelectItem>
//                   ))}
//                 </>
//               )}
//             </SelectContent>
//           </Select>
//           {errors.company_id && <p className="text-red-400 text-xs mt-1">{errors.company_id}</p>}

//           <DialogFooter>
//             <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
//               {initialData ? 'Save Changes' : 'Add Location'}
//             </Button>
//             <DialogClose onClick={onClose}>Cancel</DialogClose>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// };

// // --- CheckinLocationTable Component ---
// const CheckinLocationTable = () => {
//   const [locations, setLocations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [editingLocation, setEditingLocation] = useState(null);
//   const [company, setcompany] = useState([]);
//   const [loadingcompany, setLoadingcompany] = useState(true);
//   const [filterText, setFilterText] = useState('');

//   const fetchLocations = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`${API_BASE_URL}checkin-locations/`);
//       setLocations(res.data);
//     } catch (err) {
//       console.error('Error fetching checkin locations:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchcompany = async () => {
//     setLoadingcompany(true);
//     try {
//       // Corrected API endpoint for company
//       const res = await axios.get(`${API_BASE_URL}company/`);
//       setcompany(res.data);
//     } catch (err) {
//       console.error('Error fetching company:', err);
//     } finally {
//       setLoadingcompany(false);
//     }
//   };

//   useEffect(() => {
//     fetchLocations();
//     fetchcompany();
//   }, []);

//   const handleAddLocationClick = () => {
//     setEditingLocation(null);
//     setShowForm(true);
//   };

//   const handleEditLocationClick = (location) => {
//     setEditingLocation(location);
//     setShowForm(true);
//   };

//   const handleDeleteLocation = async (id) => {
//     if (window.confirm('Are you sure you want to delete this check-in location?')) {
//       try {
//         await axios.delete(`${API_BASE_URL}checkin-locations/${id}/`);
//         alert('Location deleted successfully!');
//         fetchLocations();
//       } catch (err) {
//         console.error('Error deleting location:', err.response ? err.response.data : err.message);
//         alert('Failed to delete location.');
//       }
//     }
//   };

//   const handleFormSubmit = async (formData) => {
//     try {
//       if (editingLocation) {
//         await axios.put(`${API_BASE_URL}checkin-locations/${editingLocation.id}/`, formData);
//         alert('Location updated successfully!');
//       } else {
//         await axios.post(`${API_BASE_URL}checkin-locations/`, formData);
//         alert('Location added successfully!');
//       }
//       setShowForm(false);
//       fetchLocations();
//     } catch (err) {
//       console.error('Error saving location:', err.response ? err.response.data : err.message);
//       alert(`Failed to save location: ${err.response?.data?.name || err.message || 'Unknown error'}`);
//     }
//   };

//   const filteredLocations = locations.filter(loc =>
//     loc.name.toLowerCase().includes(filterText.toLowerCase()) ||
//     loc.company?.name.toLowerCase().includes(filterText.toLowerCase())
//   );

//   return (
//     <div>
//       <div className="mb-4">
//         <Input
//           type="text"
//           placeholder="Search check-in locations by name or company"
//           value={filterText}
//           onChange={(e) => setFilterText(e.target.value)}
//         />
//       </div>
//       <div className="overflow-auto">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Location Name</TableHead>
//               <TableHead>Latitude</TableHead>
//               <TableHead>Longitude</TableHead>
//               <TableHead>Radius (m)</TableHead>
//               <TableHead>Company</TableHead>
//               <TableHead>Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {loading ? (
//               <TableRow><TableCell colSpan={6} className="py-4 text-center">Loading...</TableCell></TableRow>
//             ) : filteredLocations.length === 0 ? (
//               <TableRow><TableCell colSpan={6} className="py-4 text-center">No check-in locations found.</TableCell></TableRow>
//             ) : (
//               filteredLocations.map((loc) => (
//                 <TableRow key={loc.id}>
//                   <TableCell>{loc.name}</TableCell>
//                   <TableCell>{loc.latitude}</TableCell>
//                   <TableCell>{loc.longitude}</TableCell>
//                   <TableCell>{loc.radius_meters}</TableCell>
//                   <TableCell>{loc.company?.name || 'N/A'}</TableCell>
//                   <TableCell>
//                     <span
//                       className="text-blue-400 cursor-pointer hover:underline mr-2"
//                       onClick={() => handleEditLocationClick(loc)}
//                     >
//                       Edit
//                     </span>
//                     <span
//                       className="text-red-400 cursor-pointer hover:underline"
//                       onClick={() => handleDeleteLocation(loc.id)}
//                     >
//                       Delete
//                     </span>
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </div>
//       <div className="flex justify-between items-center mt-4">
//         <div className="text-sm">Showing {filteredLocations.length} of {locations.length} locations</div>
//         <Button onClick={handleAddLocationClick}>
//           Add New Location
//         </Button>
//       </div>

//       <LocationForm
//         isOpen={showForm}
//         onClose={() => setShowForm(false)}
//         onSubmit={handleFormSubmit}
//         initialData={editingLocation}
//         isCheckin={true}
//         company={company}
//         loadingcompany={loadingcompany}
//       />
//     </div>
//   );
// };


// // --- ApartmentLocationTable Component ---
// const ApartmentLocationTable = () => {
//   const [apartments, setApartments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [editingApartment, setEditingApartment] = useState(null);
//   const [company, setcompany] = useState([]);
//   const [loadingcompany, setLoadingcompany] = useState(true);
//   const [filterText, setFilterText] = useState('');

//   const fetchApartments = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`${API_BASE_URL}apartment-locations/`);
//       setApartments(res.data);
//     } catch (err) {
//       console.error('Error fetching apartment locations:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchcompany = async () => {
//     setLoadingcompany(true);
//     try {
//       const res = await axios.get(`${API_BASE_URL}company/`); // Corrected API endpoint for company
//       setcompany(res.data);
//     } catch (err) {
//       console.error('Error fetching company:', err);
//     } finally {
//       setLoadingcompany(false);
//     }
//   };

//   useEffect(() => {
//     fetchApartments();
//     fetchcompany();
//   }, []);

//   const handleAddApartmentClick = () => {
//     setEditingApartment(null);
//     setShowForm(true);
//   };

//   const handleEditApartmentClick = (apartment) => {
//     setEditingApartment(apartment);
//     setShowForm(true);
//   };

//   const handleDeleteApartment = async (id) => {
//     if (window.confirm('Are you sure you want to delete this apartment location?')) {
//       try {
//         await axios.delete(`${API_BASE_URL}apartment-locations/${id}/`);
//         alert('Apartment deleted successfully!');
//         fetchApartments();
//       } catch (err) {
//         console.error('Error deleting apartment:', err.response ? err.response.data : err.message);
//         alert('Failed to delete apartment.');
//       }
//     }
//   };

//   const handleFormSubmit = async (formData) => {
//     try {
//       if (editingApartment) {
//         await axios.put(`${API_BASE_URL}apartment-locations/${editingApartment.id}/`, formData);
//         alert('Apartment updated successfully!');
//       } else {
//         await axios.post(`${API_BASE_URL}apartment-locations/`, formData);
//         alert('Apartment added successfully!');
//       }
//       setShowForm(false);
//       fetchApartments();
//     } catch (err) {
//       console.error('Error saving apartment:', err.response ? err.response.data : err.message);
//       alert(`Failed to save apartment: ${err.response?.data?.name || err.message || 'Unknown error'}`);
//     }
//   };

//   const filteredApartments = apartments.filter(apt =>
//     apt.name.toLowerCase().includes(filterText.toLowerCase()) ||
//     apt.company?.name.toLowerCase().includes(filterText.toLowerCase())
//   );

//   return (
//     <div>
//       <div className="mb-4">
//         <Input
//           type="text"
//           placeholder="Search apartment locations by name or company"
//           value={filterText}
//           onChange={(e) => setFilterText(e.target.value)}
//         />
//       </div>
//       <div className="overflow-auto">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Apartment Name</TableHead>
//               <TableHead>Latitude</TableHead>
//               <TableHead>Longitude</TableHead>
//               <TableHead>Alarm Radius (m)</TableHead>
//               <TableHead>Company</TableHead>
//               <TableHead>Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {loading ? (
//               <TableRow><TableCell colSpan={6} className="py-4 text-center">Loading...</TableCell></TableRow>
//             ) : filteredApartments.length === 0 ? (
//               <TableRow><TableCell colSpan={6} className="py-4 text-center">No apartment locations found.</TableCell></TableRow>
//             ) : (
//               filteredApartments.map((apt) => (
//                 <TableRow key={apt.id}>
//                   <TableCell>{apt.name}</TableCell>
//                   <TableCell>{apt.latitude}</TableCell>
//                   <TableCell>{apt.longitude}</TableCell>
//                   <TableCell>{apt.alarm_radius_meters}</TableCell>
//                   <TableCell>{apt.company?.name || 'N/A'}</TableCell>
//                   <TableCell>
//                     <span
//                       className="text-blue-400 cursor-pointer hover:underline mr-2"
//                       onClick={() => handleEditApartmentClick(apt)}
//                     >
//                       Edit
//                     </span>
//                     <span
//                       className="text-red-400 cursor-pointer hover:underline"
//                       onClick={() => handleDeleteApartment(apt.id)}
//                     >
//                       Delete
//                     </span>
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </div>
//       <div className="flex justify-between items-center mt-4">
//         <div className="text-sm">Showing {filteredApartments.length} of {apartments.length} apartments</div>
//         <Button onClick={handleAddApartmentClick}>
//           Add Apartment
//         </Button>
//       </div>

//       <LocationForm
//         isOpen={showForm}
//         onClose={() => setShowForm(false)}
//         onSubmit={handleFormSubmit}
//         initialData={editingApartment}
//         isCheckin={false}
//         company={company}
//         loadingcompany={loadingcompany}
//       />
//     </div>
//   );
// };


// // HRDashboard component (remains mostly the same as your original)
// const HRDashboard = () => {
//   const [activeTab, setActiveTab] = useState('checkin');

//   const renderTab = () => {
//     switch (activeTab) {
//       case 'checkin':
//         return <CheckinLocationTable />;
//       case 'apartment':
//         return <ApartmentLocationTable />;
//       case 'notifications':
//         return <NotificationManagement />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="p-6 bg-gray-900 min-h-screen text-white">
//       <h1 className="text-3xl font-bold mb-6">HR Management Dashboard</h1>

//       <div className="flex space-x-4 mb-6">
//         <button
//           onClick={() => setActiveTab('checkin')}
//           className={`px-4 py-2 rounded-md ${
//             activeTab === 'checkin' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
//           }`}
//         >
//           Check-in Locations
//         </button>
//         <button
//           onClick={() => setActiveTab('apartment')}
//           className={`px-4 py-2 rounded-md ${
//             activeTab === 'apartment' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
//           }`}
//         >
//           Apartment Locations
//         </button>
//         <button
//           onClick={() => setActiveTab('notifications')}
//           className={`px-4 py-2 rounded-md ${
//             activeTab === 'notifications' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
//           }`}
//         >
//           Notifications
//         </button>
//       </div>

//       <div>{renderTab()}</div>
//     </div>
//   );
// };


// // Simple placeholder for Notification Management - you can expand this similarly
// const NotificationManagement = () => (
//   <div className="text-center py-10">
//     <p className="text-lg">Notification Management section under construction.</p>
//     {/* You'd build out similar CRUD functionality for notifications here */}
//   </div>
// );

// export default HRDashboard;




import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

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
const TableHead = ({ children }) => <th className="py-2 px-2">{children}</th>;
const TableHeader = ({ children }) => <thead className="text-left text-gray-400 border-b border-gray-700">{children}</thead>;
const TableRow = ({ children }) => <tr className="border-b border-gray-800">{children}</tr>;
const Button = ({ children, onClick, className = '', type = 'button' }) => <button type={type} onClick={onClick} className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm ${className}`}>{children}</button>;
const Input = ({ type = 'text', placeholder, value, onChange, className = '', id, name, step }) => <input id={id} name={name} type={type} placeholder={placeholder} value={value} onChange={onChange} step={step} className={`w-full px-4 py-2 bg-gray-800 text-white rounded-md border border-gray-700 ${className}`} />;
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
const SelectItem = ({ value, children }) => <option value={value}>{children}</option>;
// --- END PLACEHOLDER COMPONENTS ---


// --- API Base URL ---
const API_BASE_URL = 'http://localhost:8000/';

// --- Reusable Location Form Component (MAP REMOVED) ---
const LocationForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isCheckin = true,
  drivers,
  loadingDrivers
}) => {
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radius_meters: '',
    alarm_radius_meters: '',
    driver_id: '',
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
        // Use dataToLoad.driver?.id as the initial driver_id
        driver_id: dataToLoad.driver?.id || '',
      });
      setErrors({});
      console.log("LocationForm opened. initialData:", initialData);
      console.log("Initial formData.driver_id (from initialData):", dataToLoad.driver?.id);
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDriverChange = (value) => {
    console.log("Driver selected (value from Select):", value);
    setFormData((prev) => ({ ...prev, driver_id: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Location Name is required.';
    if (!formData.latitude) newErrors.latitude = 'Latitude is required.';
    if (!formData.longitude) newErrors.longitude = 'Longitude is required.';
    if (isCheckin && !formData.radius_meters) newErrors.radius_meters = 'Radius (m) is required.';
    if (!isCheckin && !formData.alarm_radius_meters) newErrors.alarm_radius_meters = 'Alarm Radius (m) is required.';
    if (!formData.driver_id) newErrors.driver_id = 'Driver is required.';

    if (formData.latitude && isNaN(parseFloat(formData.latitude))) newErrors.latitude = 'Latitude must be a number.';
    if (formData.longitude && isNaN(parseFloat(formData.longitude))) newErrors.longitude = 'Longitude must be a number.';
    if (isCheckin && formData.radius_meters && isNaN(parseInt(formData.radius_meters))) newErrors.radius_meters = 'Radius must be an integer.';
    if (!isCheckin && formData.alarm_radius_meters && isNaN(parseInt(formData.alarm_radius_meters))) newErrors.alarm_radius_meters = 'Alarm Radius must be an integer.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting form...");
    console.log("Current formData:", formData);
    console.log("Drivers available in form context (should be populated from prop):", drivers);

    if (!validateForm()) {
      console.log("Form validation failed. Check `errors` state.");
      return;
    }

    const selectedDriver = drivers.find(
      // Compare formData.driver_id with driver.id
      (driver) => String(driver.id) === String(formData.driver_id)
    );
    console.log("Attempting to find selected driver with driver_id:", formData.driver_id);
    console.log("Found selectedDriver:", selectedDriver);

    if (!selectedDriver) {
      alert("Error: Selected driver not found in the list. Please re-select a driver.");
      console.error("Critical: selectedDriver is null/undefined! This means formData.driver_id did not match any driver in the 'drivers' array.");
      return;
    }

    const payload = {
      ...formData,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      // Use selectedDriver.id for the payload
      driver_id: parseInt(selectedDriver.id),
      // *** Adding driver_name back to payload as backend insists it's required ***
      // *** This is likely a Django backend configuration issue, not a frontend one. ***
      driver_name: selectedDriver.driver_name,
    };

    if (isCheckin) {
      payload.radius_meters = parseInt(formData.radius_meters);
    } else {
      payload.alarm_radius_meters = parseInt(formData.alarm_radius_meters);
    }

    onSubmit(payload);
  };

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

          <Label htmlFor="latitude">Latitude:</Label>
          <Input id="latitude" name="latitude" type="number" step="0.000001" value={formData.latitude} onChange={handleChange} placeholder="e.g., 12.345678" />
          {errors.latitude && <p className="text-red-400 text-xs mt-1">{errors.latitude}</p>}

          <Label htmlFor="longitude">Longitude:</Label>
          <Input id="longitude" name="longitude" type="number" step="0.000001" value={formData.longitude} onChange={handleChange} placeholder="e.g., 98.765432" />
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
                    // Use driver.id for key and value
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.driver_name}
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
          {errors.driver_id && <p className="text-red-400 text-xs mt-1">{errors.driver_id}</p>}

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
      const res = await axios.get(`${API_BASE_URL}checkin-locations/`);
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
      const res = await axios.get(`${API_BASE_URL}/Register/drivers/`);
      console.log("Drivers fetched successfully from API:", res.data); // IMPORTANT: Check this output
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
        await axios.delete(`${API_BASE_URL}checkin-locations/${id}/`);
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
        await axios.put(`${API_BASE_URL}checkin-locations/${editingLocation.id}/`, formData);
        alert('Location updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}checkin-locations/`, formData);
        alert('Location added successfully!');
      }
      setShowForm(false);
      fetchLocations();
    } catch (err) {
      console.error('Error saving location:', err.response ? err.response.data : err.message);
      // More specific error message if driver_name is the culprit
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


// --- ApartmentLocationTable Component ---
const ApartmentLocationTable = () => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingApartment, setEditingApartment] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [filterText, setFilterText] = useState('');

  const fetchApartments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}apartment-locations/`);
      setApartments(res.data);
    } catch (err) {
      console.error('Error fetching apartment locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    setLoadingDrivers(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/Register/drivers/`);
      console.log("Drivers fetched successfully from API:", res.data); // IMPORTANT: Check this output
      setDrivers(res.data);
    }
    catch (err) {
      console.error('Error fetching drivers:', err);
    } finally {
      setLoadingDrivers(false);
    }
  };

  useEffect(() => {
    fetchApartments();
    fetchDrivers();
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
        await axios.delete(`${API_BASE_URL}apartment-locations/${id}/`);
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
        await axios.put(`${API_BASE_URL}apartment-locations/${editingApartment.id}/`, formData);
        alert('Apartment updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}apartment-locations/`, formData);
        alert('Apartment added successfully!');
      }
      setShowForm(false);
      fetchApartments();
    } catch (err) {
      console.error('Error saving apartment:', err.response ? err.response.data : err.message);
      // More specific error message if driver_name is the culprit
      alert(`Failed to save apartment: ${err.response?.data?.driver_name || err.message || 'Unknown error'}`);
    }
  };

  const filteredApartments = apartments.filter(apt =>
    apt.name.toLowerCase().includes(filterText.toLowerCase()) ||
    apt.driver?.driver_name.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search apartment locations by name or driver"
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
              <TableHead>Driver</TableHead>
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
                  <TableCell>{apt.driver?.driver_name || 'N/A'}</TableCell>
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
        isCheckin={false}
        drivers={drivers}
        loadingDrivers={loadingDrivers}
      />
    </div>
  );
};


// HRDashboard component (remains mostly the same as your original)
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
          className={`px-4 py-2 rounded-md ${activeTab === 'checkin' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
        >
          Check-in Locations
        </button>
        <button
          onClick={() => setActiveTab('apartment')}
          className={`px-4 py-2 rounded-md ${activeTab === 'apartment' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
        >
          Apartment Locations
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-md ${activeTab === 'notifications' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
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
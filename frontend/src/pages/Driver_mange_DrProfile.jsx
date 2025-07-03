import React, { useEffect, useState } from 'react';
import { ChevronDown, CircleUserRound, FileText, ExternalLink, Image } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance'; // Assuming axiosInstance is configured

function Driver_mange_DrProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Driver Information');
  const [driverData, setDriverData] = useState(null);
  const [assignedVehicle, setAssignedVehicle] = useState(null);
  const [loadingDriverData, setLoadingDriverData] = useState(true);
  const [loadingVehicleData, setLoadingVehicleData] = useState(false);
  const [driverProfilePicture, setDriverProfilePicture] = useState(
    'https://placehold.co/100x100/535c9b/ffffff?text=Avatar'
  );

  useEffect(() => {
    const fetchDriverAndVehicleData = async () => {
      setLoadingDriverData(true);
      try {
        const driverResponse = await axiosInstance.get(`/Register/drivers/${id}/`);
        const driverData = driverResponse.data;
        setDriverData(driverData);

        // --- DEBUGGING LOGS START ---
        console.log('Driver data fetched:', driverData);
        console.log('Driver\'s vehicle property:', driverData.vehicle);
        // --- DEBUGGING LOGS END ---
        console.log("vehicle id",driverData.vehicleType)


        if (driverData.profile_picture_url) {
          setDriverProfilePicture(driverData.profile_picture_url);
        }

        // Fetch assigned vehicle data if vehicle ID exists in driverData
        // IMPORTANT: Ensure driverData.vehicle contains the actual ID of the vehicle,
        // and that your backend endpoint for vehicles is correctly structured.
        if (driverData.vehicle) { // Assuming 'vehicle' key holds the vehicle ID (e.g., 1, 2, 3...)
          setLoadingVehicleData(true);
          try {
            // Ensure this URL is correct for fetching a single vehicle by ID
            const vehicleResponse = await axiosInstance.get(`/vehicles/${driverData.vehicle.id}/`);
            setAssignedVehicle(vehicleResponse.data);
          } catch (vehicleError) {
            console.error('Failed to fetch assigned vehicle data:', vehicleError);
            setAssignedVehicle(null); // Explicitly set to null on error
          } finally {
            setLoadingVehicleData(false);
          }
        } else {
          setAssignedVehicle(null); // No vehicle assigned or vehicle property is empty/invalid
          console.log('No vehicle ID found in driver data or it is invalid.');
        }
      } catch (error) {
        console.error('Failed to fetch driver data:', error);
        setDriverData({}); // Set to empty object to avoid 'null' check issues for properties
        setAssignedVehicle(null);
      } finally {
        setLoadingDriverData(false);
      }
    };

    if (id) {
      fetchDriverAndVehicleData();
    }
  }, [id]);

  const handleDeleteVehicle = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.');
    if (!confirmDelete) return;

    // if (!assignedVehicle || !assignedVehicle.id) {
    //   alert('No assigned vehicle to delete.'); // Using alert for now, consider custom modal
    //   return;
    // }

    try {
      // Ensure this URL is correct for deleting a single vehicle by ID
      await axiosInstance.delete(`/vehicles/${assignedVehicle.id}/`);
      alert('Vehicle deleted successfully!'); 
      redirect('/registration-management')// Using alert for now, consider custom modal
      setAssignedVehicle(null); // Clear the vehicle data after deletion
      // You might want to refresh driver data if the backend automatically unlinks the vehicle
      // Or simply show a message that the vehicle is no longer assigned.
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete vehicle.'); // Using alert for now, consider custom modal
    }
  };

  if (loadingDriverData) {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
        <p className="text-lg">Loading driver profile...</p>
      </div>
    );
  }

  if (!driverData || Object.keys(driverData).length === 0) {
    return (
      <div className="min-h-screen bg-black text-red-500 p-8 flex items-center justify-center">
        <p className="text-lg">Driver not found or data could not be loaded.</p>
      </div>
    );
  }

  // Helper function to check if a URL is likely an image (for documents)
  const isImageUrl = (url) => {
    return url && /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url.split('?')[0]);
  };

  // Helper function to render a document link, preview, and expiry date
  const renderDocument = (docName, docUrl, expiryDate) => (
    <div className="bg-[#3C6E71] p-4 rounded-lg border border-gray-700 flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-gray-300 font-medium text-lg">{docName}</span>
        {docUrl ? (
          <a
            href={docUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-green-400 hover:underline transition-colors text-sm"
          >
            <FileText size={16} className="mr-1" /> View Document <ExternalLink size={12} className="ml-1" />
          </a>
        ) : (
          <span className="text-gray-500 text-sm">Not Uploaded</span>
        )}
      </div>

      {docUrl && isImageUrl(docUrl) && (
        <div className="mt-2 p-2 bg-gray-900 rounded-md border border-gray-700 flex flex-col items-center">
          <label className="text-sm font-medium text-[#353535]0 mb-2 flex items-center">
            <Image size={16} className="mr-1" /> Preview:
          </label>
          <img
            src={docUrl}
            alt={`${docName} Preview`}
            className="w-full max-w-sm h-auto rounded-lg object-contain border border-gray-600"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/300x200/374151/ffffff?text=Image+Load+Error';
              e.target.alt = 'Failed to load image preview.';
              console.error(`Failed to load image for ${docName}:`, docUrl);
            }}
          />
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-700">
        <span className="text-white text-sm font-medium">Expiry Date:</span>
        <span className="text-gray-200 text-sm">{expiryDate || 'N/A'}</span>
      </div>
    </div>
  );

  // Helper function for date formatting
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return 'Invalid Date';
    }
  };

  // Generic Detail component for consistent styling
  const Detail = ({ label, value }) => (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-[#353535]0 mb-1">{label}</label>
      <p className="px-4 py-2 rounded bg-[#3C6E71] text-white border border-gray-700">
        {value}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0F5F9] text-[#1E2022] font-inter p-8">
      {/* Header */}
      <div className="flex justify-end items-center mb-6">
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-3 py-1 bg-[#284B63] hover:bg-[#52616B] text-[#FFFFFF] rounded-full text-sm transition-colors">
            English <ChevronDown size={16} className="ml-1" />
          </button>
          <CircleUserRound size={24} className="text-[#1E2022]" />
        </div>
      </div>

      <div className="text-sm text-[#52616B] mb-6">Driver Management / Driver Profile</div>

      {/* Profile Header Section */}
      <div className="bg-[#D9D9D9] p-6 rounded-lg flex items-center mb-8">
        <img
          src={driverData.driver_profile_img}
          alt="Driver Avatar"
          className="w-24 h-24 rounded-full object-cover mr-6"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://.co/100x100/535c9b/ffffff?text=Avatar';
          }}
        />
        <div>
          <h1 className="text-3xl font-semibold text-[#187795] mb-2">Driver Profile</h1>
          <h2 className="text-2xl font-medium text-[#2f3838] mb-4">{driverData.driver_name || 'N/A'}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-2 text-sm text-[#52616B] font-bold">
            <div>
              <span className="font-semibold text-[#52616B]">Driver ID:</span>{' '}
              {driverData.id || 'N/A'}{' '}
            </div>
            <div>
              <span className="font-semibold text-[#52616B]">National ID:</span> {driverData.iqama || 'N/A'}
            </div>
            <div>
              <span className="font-semibold text-[#52616B]">Delivery Provider:</span>{' '}
              {driverData.company?.company_name || 'N/A'}
            </div>
            <div>
              <span className="font-semibold text-gray-300">Phone Number:</span> {driverData.mobile || 'N/A'}
            </div>
            <div>
              <span className="font-semibold text-gray-300">Availability:</span>{' '}
              {'N/A'}
            </div>
            <div>
              <span className="font-semibold text-gray-300">Status:</span>{' '}
              <span
                className={`py-1 px-3 rounded-full text-xs font-medium ${
                  driverData.status === 'approved' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}
              >
                {driverData.status || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-800">
        {['Driver Information', 'Documents', 'Vehicle', 'logs'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === tab ? 'border-b-2 border-green-400 text-[#52616B] font-bold' : 'text-[#52616B] hover:gray-400'
            } transition-colors`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Driver Information' && (
        <div className="bg-[#D9D9D9] p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-[#353535] mb-4">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-[#353535] mb-1">Driver Name</label>
              <p className="px-4 py-2 rounded bg-[#3C6E71] text-white border border-gray-700">
                {driverData.driver_name || 'N/A'}
              </p>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-[#353535] mb-1">Date of Birth</label>
              <p className="px-4 py-2 rounded bg-[#3C6E71] text-white border border-gray-700">
                {driverData.dob || 'N/A'}
              </p>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-[#353535] mb-1">ID/Iqama</label>
              <p className="px-4 py-2 rounded bg-[#3C6E71] text-white border border-gray-700">
                {driverData.iqama || 'N/A'}
              </p>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-[#353535] mb-1">Nationality</label>
              <p className="px-4 py-2 rounded bg-[#3C6E71] text-white border border-gray-700">
                {driverData.nationality || 'N/A'}
              </p>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-[#353535] mb-1">ID/Iqama Expiry Date</label>
              <p className="px-4 py-2 rounded bg-[#3C6E71] text-white border border-gray-700">
                {driverData.iqama_expiry || 'N/A'}
              </p>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-[#353535] mb-1">City</label>
              <p className="px-4 py-2 rounded bg-[#3C6E71] text-white border border-gray-700">
                {driverData.city || 'N/A'}
              </p>
            </div>
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-[#353535] mb-1">Gender</label>
              <p className="px-4 py-2 rounded bg-[#3C6E71] text-white border border-gray-700">
                {driverData.gender || 'N/A'}
              </p>
            </div>
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-[#353535] mb-1">Status</label>
              <p className="px-4 py-2 rounded bg-[#3C6E71] text-white border border-gray-700">
                 {driverData.status || 'N/A'}
              </p>
            </div>
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-[#353535] mb-1">Mobile</label>
              <p className="px-4 py-2 rounded bg-[#3C6E71] text-white border border-gray-700">
                 {driverData.mobile || 'N/A'}
              </p>
            </div>
             <div className="flex flex-col">
              <label className="block text-sm font-medium text-[#353535]0 mb-1">Company</label>
              <p className="px-4 py-2 rounded bg-[#3C6E71] text-white border border-gray-700">
                 {driverData.company?.company_name || 'N/A'}
              </p>
            </div>
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-[#353535]0 mb-1">Created At</label>
              <p className="px-4 py-2 rounded bg-[#3C6E71] text-white border border-gray-700">
                 {driverData.created_at ? new Date(driverData.created_at).toLocaleString() : 'N/A'}
              </p>
            </div>
            {/* Displaying password directly is not recommended. If you need to show it's set, use a placeholder. */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-[#353535]0 mb-1">Password</label>
              <p className="px-4 py-2 rounded bg-[#3C6E71] text-white border border-gray-700">
                ******** {/* Placeholder for password */}
              </p>
            </div>


            <h3 className="text-lg font-semibold text-[#353535] mt-4 md:col-span-3">Expense Information</h3>
            <div className="flex flex-col">
                <label className="text-sm font-medium text-[#353535]0 mb-1">Insurance Paid By</label>
                <p className="px-4 py-2 rounded bg-[#3C6E71] text-white border border-gray-700">
                    {driverData.insurance_paid_by || 'N/A'}
                </p>
            </div>
            <div className="flex flex-col">
                <label className="text-sm font-medium text-[#353535]0 mb-1">Accommodation Paid By</label>
                <p className="px-4 py-2 rounded bg-[#3C6E71] text-white border border-gray-700">
                    {driverData.accommodation_paid_by || 'N/A'}
                </p>
            </div>
            <div className="flex flex-col">
                <label className="text-sm font-medium text-[#353535]0 mb-1">Phone Bill Paid By</label>
                <p className="px-4 py-2 rounded bg-[#3C6E71] text-white border border-gray-700">
                    {driverData.phone_bill_paid_by || 'N/A'}
                </p>
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex flex-col">
              <label className="block text-sm font-medium text-[#353535]0 mb-1">Remarks / Notes</label>
              <p className="w-full px-4 py-2 rounded bg-[#3C6E71] text-white border border-gray-700 min-h-24">
                {driverData.remarks || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Documents Tab Content */}
      {activeTab === 'Documents' && (
        <div className="bg-[#D9D9D9] p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-[#353535] mb-4">Uploaded Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderDocument('Iqama Document', driverData.iqama_document, driverData.iqama_expiry)}
            {renderDocument('Passport Document', driverData.passport_document, driverData.passport_expiry)}
            {renderDocument('Driving License Document', driverData.license_document, driverData.license_expiry)}
            {renderDocument('Visa Document', driverData.visa_document, driverData.visa_expiry)}
            {renderDocument('Medical Document', driverData.medical_document, driverData.medical_expiry)}
          </div>
        </div>
      )}

      {/* Vehicle Tab Content */}
      {activeTab === 'Vehicle' && (
        <div className="bg-[#D9D9D9] p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-[#353535] mb-4">Assigned Vehicle Information</h3>
          {loadingVehicleData ? (
            <p className="text-gray-500">Loading vehicle information...</p>
          ) : assignedVehicle ? (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#D9D9D9] p-6 rounded-xl">
                <Detail label="Vehicle Name" value={assignedVehicle.vehicle_name || '—'} />
                <Detail label="Vehicle Number" value={assignedVehicle.vehicle_number || '—'} />
                <Detail label="Vehicle Type" value={assignedVehicle.vehicle_type || '—'} />
                <Detail label="Approval Status" value={assignedVehicle.approval_status || '—'} />
                <Detail label="Insurance Number" value={assignedVehicle.insurance_number || '—'} />
                <Detail label="Insurance Expiry" value={formatDate(assignedVehicle.insurance_expiry_date)} />
                <Detail label="Chassis Number" value={assignedVehicle.Chassis_Number || '—'} />
                <Detail label="Service Date" value={formatDate(assignedVehicle.service_date)} />
                <Detail label="RC Book Number" value={assignedVehicle.rc_book_number || '—'} />
                <Detail label="Is Leased" value={assignedVehicle.is_leased ? 'Yes' : 'No'} />
                <Detail label="Created By" value={assignedVehicle.created_by?.username || '—'} />
                <Detail label="Created At" value={formatDate(assignedVehicle.created_at)} />

                {/* New: Vehicle Image */}
                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm font-medium text-white mb-1">Vehicle Image</label>
                  {assignedVehicle.image ? (
                    <img
                      src={assignedVehicle.image}
                      alt="Vehicle"
                      className="w-full max-w-sm h-auto rounded-lg object-contain border border-gray-600 mt-2"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/300x200/374151/ffffff?text=Image+Not+Available';
                        e.target.alt = 'Failed to load vehicle image.';
                        console.error('Failed to load vehicle image:', assignedVehicle.image);
                      }}
                    />
                  ) : (
                    <p className="px-4 py-2 rounded bg-[#3C6E71] text-white border border-gray-700">
                      No image uploaded
                    </p>
                  )}
                </div>

                {/* New: Insurance Document */}
                {renderDocument(
                  'Insurance Document',
                  assignedVehicle.insurance_document,
                  assignedVehicle.insurance_expiry_date
                )}

                {/* New: RC Document */}
                {renderDocument(
                  'RC Book Document',
                  assignedVehicle.rc_document,
                  'N/A' // RC document usually doesn't have an expiry date, based on model
                )}

              </div>
              <div className="flex justify-end space-x-4 mt-4">
                <button
                  onClick={() => navigate(`/edit-vehicle/${assignedVehicle.id}`)} // Assuming an edit route
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit Vehicle
                </button>
                <button
                  onClick={handleDeleteVehicle}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete Vehicle
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No vehicle assigned to this driver.</p>
          )}
        </div>
      )}

      {/* Logs Tab Content */}
      {activeTab === 'logs' && (
        <div className="bg-[#D9D9D9] p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-[#353535] mb-4">Driver Activity Logs</h3>
          {driverData.logs && driverData.logs.length > 0 ? (
            <div className="space-y-3">
              {driverData.logs.map((log, index) => (
                <div key={index} className="bg-[#3C6E71] p-3 rounded-md flex items-center space-x-3">
                  <span className="text-gray-500 text-sm">
                    {log.formatted_timestamp || 'N/A'}:
                  </span>
                  <span className="text-gray-300">
                    {log.action || 'N/A'} {log.note && `(${log.note})`}
                  </span>
                  {log.performed_by && <span className="text-[#353535] text-xs">- By {log.performed_by}</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No activity logs available for this driver.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Driver_mange_DrProfile;

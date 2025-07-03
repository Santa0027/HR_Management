import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // Ensure axios is imported if axiosInstance relies on it
import { Upload, CircleUserRound } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
// --- Axios Instance ---
// This instance will be used for all API calls within this component.
// Adjust the baseURL to your actual Django backend URL.


// --- Reusable Components ---

/**
 * Reusable component for fields that can be toggled between view and edit mode.
 * It renders an input field when `isEditing` is true, otherwise it displays the value.
 */
const EditableField = ({ label, value, onChange, name, isEditing, type = 'text', placeholder, required = false, children }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        {isEditing ? (
            // If children are provided (e.g., for a <select> element), render them
            children ? children : (
                <input
                    type={type}
                    name={name}
                    id={name}
                    value={value || ''} // Ensures the input is a controlled component
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            )
        ) : (
            // View mode: display the value or a placeholder
            <div className="w-full p-2 bg-gray-800 rounded min-h-[40px] text-gray-300">
                {value ? (
                    type === 'date' ? new Date(value).toLocaleDateString() : value
                ) : (
                    <span className="text-gray-500">{placeholder || 'N/A'}</span>
                )}
            </div>
        )}
    </div>
);

/**
 * Reusable component for uploading files with an associated expiry date.
 * It displays the file name and allows file selection and expiry date input when `isEditing`.
 */
const FileUploadField = ({ label, name, file, expiryKey, expiryValue, onFileChange, onExpiryChange, isEditing, required = false }) => {
    // Helper function to get the display name of the file
    const getFileName = (file) => {
        if (file instanceof File) {
            return file.name;
        }
        // If file is a string (e.g., a URL from the backend), try to extract the name
        if (typeof file === 'string' && file) {
            try {
                const url = new URL(file);
                return url.pathname.split('/').pop();
            } catch (e) {
                return file; // Not a valid URL, display as is
            }
        }
        return 'No file selected';
    };

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-300 mb-2">{label} Document</label>
            <div className="flex items-center">
                <input
                    type="text"
                    readOnly
                    value={getFileName(file)}
                    className="flex-1 bg-gray-700 p-2 text-white rounded-l-md border border-gray-600 text-sm overflow-hidden text-ellipsis whitespace-nowrap"
                    title={getFileName(file)} // Shows full name on hover
                />
                {/* The actual file input, which is hidden but triggered by the label */}
                {isEditing && (
                    <input
                        type="file"
                        name={name}
                        id={name} // ID links to the htmlFor of the label
                        onChange={onFileChange}
                        className="hidden" // Hides the default file input button
                        required={required}
                    />
                )}
                {/* The clickable label (upload icon) that visually represents the file input */}
                <label
                    htmlFor={name} // This links the label to the hidden input by its ID
                    className={`cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md flex items-center justify-center ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <Upload size={18} />
                </label>
            </div>
            <div className="mt-3">
                <EditableField
                    label={`${label} Expiry Date`}
                    name={expiryKey}
                    value={expiryValue}
                    onChange={onExpiryChange}
                    isEditing={isEditing}
                    type="date"
                />
            </div>
        </div>
    );
};

/**
 * Component for uploading a profile image, with preview functionality.
 */
const ImageUploadField = ({ label, name, imageFile, onFileChange, isEditing }) => {
    // Creates a URL for previewing the image if it's a File object, otherwise uses the existing string URL
    const imageUrl = imageFile instanceof File ? URL.createObjectURL(imageFile) : imageFile;

    // Clean up the object URL created by URL.createObjectURL when component unmounts or image changes
    useEffect(() => {
        return () => {
            if (imageUrl && imageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [imageUrl]); // Effect re-runs when imageUrl changes

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg flex flex-col items-center">
            <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-600 flex items-center justify-center bg-gray-700 mb-3">
                {imageUrl ? (
                    <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <CircleUserRound size={60} className="text-gray-400" />
                )}

                {/* The actual hidden file input */}
                {isEditing && (
                    <input
                        type="file"
                        name={name}
                        id={name} // Matches htmlFor of the label below
                        onChange={onFileChange}
                        className="hidden" // Hides the default file input
                        accept="image/*" // Restricts file selection to images
                    />
                )}

                {/* The clickable label (upload icon button) that triggers the hidden input */}
                {isEditing && (
                    <label
                        htmlFor={name} // Links this label to the hidden input
                        className="absolute bottom-0 right-0 p-1 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 z-10" // z-10 ensures it's above other elements
                        title="Upload Image"
                    >
                        <Upload size={18} className="text-white" />
                    </label>
                )}
            </div>
            {/* Display status in view mode if no image is present */}
            {!imageUrl && !isEditing && (
                <span className="text-gray-500 text-sm">No image uploaded</span>
            )}
            {/* Display filename from URL in view mode */}
            {typeof imageFile === 'string' && imageFile && !isEditing && (
                <p className="text-xs text-gray-400 mt-1">{imageFile.split('/').pop()}</p>
            )}
        </div>
    );
};

// --- Child Form Components ---

/**
 * Form section for basic driver information AND Vehicle & Company Assignment.
 * This component now receives vehicles, companies, and loadingInitialData as props.
 */
const DriverInfoForm = ({ formData, isEditing, handleChange, handleFileChange, vehicles, companies, loadingInitialData }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ImageUploadField
            label="Driver Profile Image"
            name="driver_profile_img"
            imageFile={formData.documents.driver_profile_img}
            onFileChange={handleFileChange}
            isEditing={isEditing}
        />
        <EditableField label="Driver Name" name="driver_name" value={formData.driver_name} onChange={handleChange} isEditing={isEditing} placeholder="Enter full name" required />
        <EditableField label="Iqama Number" name="iqama" value={formData.iqama} onChange={handleChange} isEditing={isEditing} placeholder="Enter Iqama number" required />
        <EditableField label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} isEditing={isEditing} placeholder="Enter mobile number" required />
        <EditableField label="City" name="city" value={formData.city} onChange={handleChange} isEditing={isEditing} placeholder="Enter city" required />
        <EditableField label="Gender" name="gender" value={formData.gender} onChange={handleChange} isEditing={isEditing} required>
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white" required>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
            </select>
        </EditableField>
        <EditableField label="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} isEditing={isEditing} placeholder="Enter nationality" />
        <EditableField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} isEditing={isEditing} />

        {/* Vehicle & Company Assignment section - now part of DriverInfoForm */}
        <div className="lg:col-span-3"> {/* Use full width for this section on larger screens */}
            <h4 className="text-lg font-semibold text-gray-200 mb-4">Vehicle & Company Assignment</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EditableField label="Assign Vehicle" name="vehicle_id" value={formData.vehicle_id} onChange={handleChange} isEditing={isEditing}>
                    <select name="vehicle_id" value={formData.vehicle_id} onChange={handleChange} className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white">
                        <option value="">{loadingInitialData ? 'Loading...' : 'Select Vehicle'}</option>
                        {vehicles.map(v => <option key={v.id} value={v.id}>{`${v.vehicle_name} (${v.vehicle_number})`}</option>)}
                    </select>
                </EditableField>
                <EditableField label="Assign Company" name="company_id" value={formData.company_id} onChange={handleChange} isEditing={isEditing}>
                    <select name="company_id" value={formData.company_id} onChange={handleChange} className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white">
                        <option value="">{loadingInitialData ? 'Loading...' : 'Select Company'}</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                    </select>
                </EditableField>
            </div>
        </div>
    </div>
);

/**
 * Form section for driver documents and expenses.
 * Note: Vehicle & Company Assignment has been removed from this component.
 */
const DocumentsAndAssignmentsForm = ({ formData, isEditing, handleChange, handleFileChange, handleDocumentExpiryChange, PAID_BY_OPTIONS }) => (
    <div className="space-y-8">
        <div>
            <h4 className="text-lg font-semibold text-gray-200 mb-4">Mandatory Documents</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['iqama', 'passport', 'license', 'visa', 'medical'].map(doc => (
                    <FileUploadField
                        key={doc}
                        label={doc.charAt(0).toUpperCase() + doc.slice(1)}
                        name={`${doc}_document`}
                        file={formData.documents[`${doc}_document`]}
                        expiryKey={`${doc}_expiry`}
                        expiryValue={formData.documents[`${doc}_expiry`]}
                        onFileChange={handleFileChange}
                        onExpiryChange={handleDocumentExpiryChange}
                        isEditing={isEditing}
                    />
                ))}
            </div>
        </div>
        <div>
            <h4 className="text-lg font-semibold text-gray-200 mb-4">Expenses & Bills</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['insurance', 'accommodation', 'phone_bill'].map(expense => (
                    <div key={expense} className="bg-gray-900/50 p-4 rounded-lg space-y-3">
                        <EditableField label={`${expense.charAt(0).toUpperCase() + expense.slice(1)} Paid By`} name={`${expense}_paid_by`} value={formData[`${expense}_paid_by`]} onChange={handleChange} isEditing={isEditing}>
                            <select name={`${expense}_paid_by`} value={formData[`${expense}_paid_by`]} onChange={handleChange} className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white">
                                {PAID_BY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </EditableField>
                        <FileUploadField
                            label={`${expense.charAt(0).toUpperCase() + expense.slice(1)}`}
                            name={`${expense}_document`}
                            file={formData.documents[`${expense}_document`]}
                            expiryKey={`${expense}_expiry`}
                            expiryValue={formData.documents[`${expense}_expiry`]}
                            onFileChange={handleFileChange}
                            onExpiryChange={handleDocumentExpiryChange}
                            isEditing={isEditing}
                        />
                    </div>
                ))}
            </div>
        </div>
    </div>
);


// --- Main Parent Component ---

const AddDriverForm = () => {
    const [mode, setMode] = useState('partial'); // 'partial' or 'full' details mode
    const [isEditing, setIsEditing] = useState(true); // Form is always editable when adding a new driver
    const [activeTab, setActiveTab] = useState('info'); // Controls tab display for 'full' mode
    const [vehicles, setVehicles] = useState([]); // Stores fetched vehicle data
    const [companies, setCompanies] = useState([]); // Stores fetched company data
    const [loadingInitialData, setLoadingInitialData] = useState(true); // Tracks loading state for vehicles/companies

    // Initial state for the form data, including nested documents
    const initialFormData = {
        driver_name: '', gender: '', iqama: '', mobile: '', city: '',
        nationality: '', dob: '',
        vehicle_id: '', // Using vehicle_id to match backend expectation
        company_id: '', // Using company_id to match backend expectation
        documents: {
            driver_profile_img: null, // Holds File object or URL
            iqama_document: null, iqama_expiry: '', passport_document: null, passport_expiry: '',
            license_document: null, license_expiry: '', visa_document: null, visa_expiry: '',
            medical_document: null, medical_expiry: '', insurance_document: null, insurance_expiry: '',
            accommodation_document: null, accommodation_expiry: '', phone_bill_document: null, phone_bill_expiry: ''
        },
        insurance_paid_by: '', accommodation_paid_by: '', phone_bill_paid_by: ''
    };

    const [formData, setFormData] = useState(initialFormData);

    // Options for who paid for expenses
    const PAID_BY_OPTIONS = [{ value: '', label: 'Select Payer' }, { value: 'own', label: 'Own' }, { value: 'company', label: 'Company' }];

    // Effect to fetch initial data (vehicles and companies) on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Using axiosInstance for fetching vehicles and companies
                const [vehiclesRes, companiesRes] = await Promise.all([
                    axiosInstance.get('vehicles/'), // Fetch all vehicles
                    axiosInstance.get('company/')    // Fetch all companies
                ]);

                // Filter vehicles to include only approved ones
                // IMPORTANT: Ensure your Django Vehicle model/serializer sends an 'is_approved' field
                const approvedVehicles = vehiclesRes.data.filter(vehicle => vehicle.is_approved);
                setVehicles(approvedVehicles); // Set only approved vehicles

                setCompanies(companiesRes.data);
            } catch (err) {
                console.error("Error fetching initial data:", err);
                // In a real app, you might show a user-friendly error message here
            } finally {
                setLoadingInitialData(false);
            }
        };
        fetchInitialData();
    }, []); // Empty dependency array ensures this runs only once on mount

    // Memoized callback for handling changes in standard input fields (text, date, select)
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    // Memoized callback for handling changes in file input fields
    const handleFileChange = useCallback((e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setFormData(prev => ({ ...prev, documents: { ...prev.documents, [name]: files[0] } }));
        }
    }, []);

    // Memoized callback for handling changes in document expiry date fields
    const handleDocumentExpiryChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, documents: { ...prev.documents, [name]: value } }));
    }, []);

    // Handles switching between 'partial' and 'full' modes
    const handleModeChange = (newMode) => {
        setMode(newMode);
        setActiveTab('info'); // Reset to info tab when mode changes
    };

    // Function to submit driver data to the backend API
    const submitDriver = async (data) => {
        console.log("Submitting data:", Object.fromEntries(data.entries())); // Log FormData content for debugging

        try {
            // Using axiosInstance for submitting driver data
            const response = await axiosInstance.post('Register/drivers/', data, { // Use axiosInstance
                headers: {
                    'Content-Type': 'multipart/form-data' // Essential for sending FormData with files
                    // Add authorization header here if your API requires it, e.g.:
                    // 'Authorization': `Bearer ${yourAuthToken}`
                }
            });
            return response;
        } catch (error) {
            console.error("API Submission error:", error.response ? error.response.data : error.message);
            throw error; // Re-throw the error to be caught by the handleSubmit function
        }
    };

    // Handles the form submission event
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default browser form submission

        const data = new FormData(); // Create FormData object to send form data, including files

        // Append basic driver information fields, including vehicle_id and company_id
        // NOTE: 'company_id' is now correctly used here.
        const infoKeys = ['driver_name', 'gender', 'iqama', 'mobile', 'city', 'nationality', 'dob', 'vehicle_id', 'company_id'];
        infoKeys.forEach(key => {
            if (formData[key]) data.append(key, formData[key]);
        });

        // If in 'full' mode, append additional fields (documents and expense payers)
        if (mode === 'full') {
            const fullModeKeys = ['insurance_paid_by', 'accommodation_paid_by', 'phone_bill_paid_by'];
            fullModeKeys.forEach(key => {
                if (formData[key]) data.append(key, formData[key]);
            });

            // Iterate through documents and append them to FormData
            Object.entries(formData.documents).forEach(([docKey, docValue]) => {
                if (docValue instanceof File) {
                    data.append(docKey, docValue, docValue.name); // Append File object with its original name
                } else if (typeof docValue === 'string' && docValue) {
                    data.append(docKey, docValue); // Append string values (like expiry dates or existing URLs)
                }
            });
        }

        try {
            const response = await submitDriver(data); // Call the submission helper function
            if (response.status === 201 || response.status === 200) {
                alert(`Driver submitted in ${mode} mode successfully!`);
                setFormData(initialFormData); // Reset form to initial state on successful submission
                setIsEditing(true); // Keep editing mode active (or set to false if preferred)
                setActiveTab('info'); // Return to the info tab
            } else {
                alert('Submission failed with an unexpected status.');
            }
        } catch (err) {
            console.error("Submission failed:", err);
            let errorMessage = 'Submission failed. Please check your network or server logs.';
            if (err.response && err.response.data) {
                // If the API provides specific error details, include them in the alert
                errorMessage = `Submission failed: ${JSON.stringify(err.response.data)}`;
            }
            alert(errorMessage);
        }
    };

    return (
        <div className="min-h-screen font-sans p-4 sm:p-8 bg-[#1a1a2e]">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Add New Driver</h1>
                    <p className="text-sm text-gray-400">Current Mode: <span className="font-semibold text-cyan-400">{mode === 'partial' ? 'Partial Details' : 'Full Details'}</span></p>
                </div>
                <div className="flex items-center space-x-4">
                    <label htmlFor="mode-select" className="text-white text-sm">Mode:</label>
                    <select
                        id="mode-select"
                        value={mode}
                        onChange={e => handleModeChange(e.target.value)}
                        className="bg-gray-700 border border-gray-600 p-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="partial">Partial Details</option>
                        <option value="full">Full Details</option>
                    </select>
                    <CircleUserRound size={24} className="text-gray-400" />
                </div>
            </header>

            <form onSubmit={handleSubmit}>
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    {/* Navigation tabs for 'full' mode */}
                    {mode === 'full' && (
                        <div className="mb-6 border-b border-gray-700">
                            <nav className="flex space-x-2">
                                <button type="button" onClick={() => setActiveTab('info')} className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === 'info' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                                    Driver Details
                                </button>
                                <button type="button" onClick={() => setActiveTab('documents')} className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === 'documents' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                                    Driver Attachment
                                </button>
                            </nav>
                        </div>
                    )}

                    {/* Render content based on selected mode and active tab */}
                    {(mode === 'partial' || (mode === 'full' && activeTab === 'info')) && (
                        <DriverInfoForm
                            formData={formData}
                            isEditing={isEditing}
                            handleChange={handleChange}
                            handleFileChange={handleFileChange}
                            vehicles={vehicles} // Pass vehicles to DriverInfoForm
                            companies={companies} // Pass companies to DriverInfoForm
                            loadingInitialData={loadingInitialData} // Pass loadingInitialData to DriverInfoForm
                        />
                    )}
                    {(mode === 'full' && activeTab === 'documents') && (
                        <DocumentsAndAssignmentsForm
                            formData={formData}
                            isEditing={isEditing}
                            handleChange={handleChange}
                            handleFileChange={handleFileChange}
                            handleDocumentExpiryChange={handleDocumentExpiryChange}
                            PAID_BY_OPTIONS={PAID_BY_OPTIONS}
                        />
                    )}
                </div>

                {/* Form action buttons, visible when editing */}
                {isEditing && (
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={() => setFormData(initialFormData)} className="px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white">
                            Reset
                        </button>
                        <button type="submit" className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white">
                            Submit Driver Details
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default AddDriverForm;
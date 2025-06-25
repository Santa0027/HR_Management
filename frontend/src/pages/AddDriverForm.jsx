import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Upload, ChevronDown, CircleUserRound } from 'lucide-react'; // ChevronDown is imported but not used, can remove if not needed

// --- Reusable Components ---

// Reusable component for fields that can be toggled between view and edit mode.
const EditableField = ({ label, value, onChange, name, isEditing, type = 'text', placeholder, required = false, children }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        {isEditing ? (
            // If children are provided, render them (e.g., for select fields)
            children ? children : (
                <input
                    type={type}
                    name={name}
                    id={name}
                    value={value || ''} // Ensure value is not null/undefined for controlled components
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            )
        ) : (
            // View mode
            <div className="w-full p-2 bg-gray-800 rounded min-h-[40px] text-gray-300">
                {/* Display value or placeholder if no value */}
                {value ? (
                    type === 'date' ? new Date(value).toLocaleDateString() : value
                ) : (
                    <span className="text-gray-500">{placeholder || 'N/A'}</span>
                )}
            </div>
        )}
    </div>
);

// Reusable File Upload Component
const FileUploadField = ({ label, name, file, expiryKey, expiryValue, onFileChange, onExpiryChange, isEditing, required = false }) => {
    // Helper to display file name or default text
    const getFileName = (file) => {
        if (file instanceof File) {
            return file.name;
        }
        // If file is a string (e.g., a URL from backend), extract name or display URL
        if (typeof file === 'string' && file) {
            try {
                // Attempt to get filename from URL
                const url = new URL(file);
                return url.pathname.split('/').pop();
            } catch (e) {
                return file; // Not a valid URL, just display the string
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
                    title={getFileName(file)} // Show full name on hover
                />
                <label
                    htmlFor={name}
                    className={`cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md flex items-center justify-center ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <Upload size={18} />
                </label>
                {/* The actual file input, only visible if editing */}
                {isEditing && (
                    <input
                        type="file"
                        name={name}
                        id={name}
                        onChange={onFileChange}
                        className="hidden"
                        required={required} // Apply required to the file input
                    />
                )}
            </div>
            {/* Expiry Date Field */}
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

// New Image Upload Component (specifically for profile image)
const ImageUploadField = ({ label, name, imageFile, onFileChange, isEditing }) => {
    const imageUrl = imageFile instanceof File ? URL.createObjectURL(imageFile) : imageFile;

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg flex flex-col items-center">
            <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-600 flex items-center justify-center bg-gray-700 mb-3">
                {imageUrl ? (
                    <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <CircleUserRound size={60} className="text-gray-400" />
                )}
                {isEditing && (
                    <label
                        htmlFor={name}
                        className="absolute bottom-0 right-0 p-1 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700"
                        title="Upload Image"
                    >
                        <Upload size={18} className="text-white" />
                        <input
                            type="file"
                            name={name}
                            id={name}
                            onChange={onFileChange}
                            className="hidden"
                            accept="image/*" // Restrict to image files
                        />
                    </label>
                )}
            </div>
            {!imageUrl && !isEditing && ( // Show placeholder text if no image and not editing
                <span className="text-gray-500 text-sm">No image uploaded</span>
            )}
            {/* Displaying file name in view mode if there's an image string (URL) */}
            {typeof imageFile === 'string' && imageFile && !isEditing && (
                <p className="text-xs text-gray-400 mt-1">{imageFile.split('/').pop()}</p>
            )}
        </div>
    );
};


// --- Child Components ---

const DriverInfoForm = ({ formData, isEditing, handleChange, handleFileChange }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Use the new ImageUploadField for profile image */}
        <ImageUploadField
            label="Driver Profile Image"
            name="driver_profile_img"
            imageFile={formData.documents.driver_profile_img}
            onFileChange={handleFileChange} // This handles the file selection
            isEditing={isEditing}
        />
        {/* Removed duplicate EditableField for driver_profile_img as FileUploadField handles it */}
        <EditableField label="Driver Name" name="driver_name" value={formData.driver_name} onChange={handleChange} isEditing={isEditing} placeholder="Enter full name" required />
        <EditableField label="Iqama Number" name="iqama" value={formData.iqama} onChange={handleChange} isEditing={isEditing} placeholder="Enter Iqama number" required />
        <EditableField label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} isEditing={isEditing} placeholder="Enter mobile number" required />
        <EditableField label="City" name="city" value={formData.city} onChange={handleChange} isEditing={isEditing} placeholder="Enter city" required />
        <EditableField label="Gender" name="gender" value={formData.gender} onChange={handleChange} isEditing={isEditing} required>
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white" required>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option> {/* Changed 'other' to 'Other' for consistency */}
            </select>
        </EditableField>
        <EditableField label="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} isEditing={isEditing} placeholder="Enter nationality" />
        <EditableField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} isEditing={isEditing} />
    </div>
);

const DocumentsAndAssignmentsForm = ({ formData, isEditing, handleChange, handleFileChange, handleDocumentExpiryChange, vehicles, companies, loadingInitialData, PAID_BY_OPTIONS }) => (
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
                        // Add required for specific documents if needed, e.g., iqama, license
                        // required={doc === 'iqama' || doc === 'license'}
                    />
                ))}
            </div>
        </div>
        <div>
            <h4 className="text-lg font-semibold text-gray-200 mb-4">Expenses & Bills</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['insurance', 'accommodation', 'phone_bill'].map(expense => (
                    <div key={expense} className="bg-gray-900/50 p-4 rounded-lg space-y-3">
                        {/* Payer selection */}
                        <EditableField label={`${expense.charAt(0).toUpperCase() + expense.slice(1)} Paid By`} name={`${expense}_paid_by`} value={formData[`${expense}_paid_by`]} onChange={handleChange} isEditing={isEditing}>
                            <select name={`${expense}_paid_by`} value={formData[`${expense}_paid_by`]} onChange={handleChange} className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white">
                                {PAID_BY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </EditableField>
                        {/* Associated document for expense */}
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
        <div>
            <h4 className="text-lg font-semibold text-gray-200 mb-4">Vehicle & Company Assignment</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EditableField label="Assign Vehicle" name="vehicleType" value={formData.vehicleType} onChange={handleChange} isEditing={isEditing}>
                    <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white">
                        <option value="">{loadingInitialData ? 'Loading...' : 'Select Vehicle'}</option>
                        {vehicles.map(v => <option key={v.id} value={v.id}>{`${v.vehicle_name} (${v.vehicle_number})`}</option>)}
                    </select>
                </EditableField>
                <EditableField label="Assign Company" name="company" value={formData.company} onChange={handleChange} isEditing={isEditing}>
                    <select name="company" value={formData.company} onChange={handleChange} className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white">
                        <option value="">{loadingInitialData ? 'Loading...' : 'Select Company'}</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                    </select>
                </EditableField>
            </div>
        </div>
    </div>
);


// --- Main Parent Component ---

const AddDriverForm = () => {
    const [mode, setMode] = useState('partial'); // 'partial' or 'full'
    const [isEditing, setIsEditing] = useState(true); // Default to editing mode for Add form
    const [activeTab, setActiveTab] = useState('info'); // 'info' or 'documents'
    const [vehicles, setVehicles] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loadingInitialData, setLoadingInitialData] = useState(true);

    // Define initial form data
    const initialFormData = {
        driver_name: '', gender: '', iqama: '', mobile: '', city: '',
        nationality: '', dob: '', vehicleType: '', company: '',
        documents: {
            driver_profile_img: null, // This will hold File object or URL string
            iqama_document: null, iqama_expiry: '', passport_document: null, passport_expiry: '',
            license_document: null, license_expiry: '', visa_document: null, visa_expiry: '',
            medical_document: null, medical_expiry: '', insurance_document: null, insurance_expiry: '',
            accommodation_document: null, accommodation_expiry: '', phone_bill_document: null, phone_bill_expiry: ''
        },
        insurance_paid_by: '', accommodation_paid_by: '', phone_bill_paid_by: ''
    };

    const [formData, setFormData] = useState(initialFormData);

    const PAID_BY_OPTIONS = [{ value: '', label: 'Select Payer' }, { value: 'own', label: 'Own' }, { value: 'company', label: 'Company' }];

    // Fetch initial data (vehicles, companies) on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [vehiclesRes, companiesRes] = await Promise.all([
                    axios.get('http://localhost:8000/vehicles/'),
                    axios.get('http://localhost:8000/company/')
                ]);
                setVehicles(vehiclesRes.data);
                setCompanies(companiesRes.data);
            } catch (err) {
                console.error("Error fetching initial data:", err);
                // Optionally show an error message to the user
            } finally {
                setLoadingInitialData(false);
            }
        };
        fetchInitialData();
    }, []); // Empty dependency array means this runs once on mount

    // Handles changes for all standard input fields (text, date, select)
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        // Check if the field is one of the 'paid_by' fields
        if (name.endsWith('_paid_by') || name === 'vehicleType' || name === 'company') {
            setFormData(prev => ({ ...prev, [name]: value }));
        } else {
            // Standard form fields
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    }, []);

    // Handles changes for file inputs (documents and profile image)
    const handleFileChange = useCallback((e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setFormData(prev => ({
                ...prev,
                documents: {
                    ...prev.documents,
                    [name]: files[0] // Store the File object
                }
            }));
        }
    }, []);

    // Handles changes for document expiry date inputs
    const handleDocumentExpiryChange = useCallback((e) => {
        const { name, value } = e.target; // name will be like 'iqama_expiry'
        setFormData(prev => ({
            ...prev,
            documents: {
                ...prev.documents,
                [name]: value // Store the expiry date string
            }
        }));
    }, []);

    // Handles mode change (partial/full) and resets tab
    const handleModeChange = (newMode) => {
        setMode(newMode);
        setActiveTab('info'); // Always go back to info tab when changing mode
    };

    // --- Submission Logic ---
    const submitDriver = async (data) => {
        console.log("Submitting data:", Object.fromEntries(data.entries())); // For debugging FormData content

        try {
            // Replace with your actual axios post request
            // const response = await axios.post('http://localhost:8000/Register/drivers/', data, {
            //     headers: {
            //         'Content-Type': 'multipart/form-data' // Important for FormData
            //         // Add authorization header if needed, e.g., 'Authorization': `Bearer ${yourToken}`
            //     }
            // });
            // return response;

            // Placeholder for success:
            console.log("Simulating API call success.");
            return Promise.resolve({ status: 201, data: { message: "Driver created successfully!" } });
        } catch (error) {
            console.error("API Submission error:", error.response ? error.response.data : error.message);
            // Re-throw to be caught by handleSubmit's catch block
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Create FormData object for sending files and text data
        const data = new FormData();

        // Append basic driver info
        const infoKeys = ['driver_name', 'gender', 'iqama', 'mobile', 'city', 'nationality', 'dob'];
        infoKeys.forEach(key => {
            if (formData[key]) data.append(key, formData[key]);
        });

        // Append mode-specific fields
        if (mode === 'full') {
            const fullModeKeys = ['vehicleType', 'company', 'insurance_paid_by', 'accommodation_paid_by', 'phone_bill_paid_by'];
            fullModeKeys.forEach(key => {
                if (formData[key]) data.append(key, formData[key]);
            });

            // Append documents and their expiry dates
            Object.entries(formData.documents).forEach(([docKey, docValue]) => {
                if (docValue instanceof File) {
                    // Append actual File objects
                    data.append(docKey, docValue, docValue.name); // FormData.append(name, blob, filename)
                } else if (typeof docValue === 'string' && docValue) {
                    // For expiry dates (e.g., 'iqama_expiry') or existing URLs
                    data.append(docKey, docValue);
                }
            });
        }

        try {
            const response = await submitDriver(data); // Call the submission function
            if (response.status === 201 || response.status === 200) {
                alert(`Driver submitted in ${mode} mode successfully!`);
                // Reset form to initial state
                setFormData(initialFormData);
                setIsEditing(true); // Keep editing mode after submission, or set to false if preferred
                setActiveTab('info'); // Go back to info tab
            } else {
                 alert('Submission failed with an unexpected status.');
            }
        } catch (err) {
            console.error("Submission failed:", err);
            let errorMessage = 'Submission failed.';
            // Enhance error message if API provides details
            if (err.response && err.response.data) {
                errorMessage += ` Details: ${JSON.stringify(err.response.data)}`;
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

                    {/* Render content based on mode and tab */}
                    {/* Only render the active tab's content */}
                    { (mode === 'partial' || (mode === 'full' && activeTab === 'info')) && (
                        <DriverInfoForm
                            formData={formData}
                            isEditing={isEditing}
                            handleChange={handleChange}
                            handleFileChange={handleFileChange} // Pass handleFileChange for profile image
                        />
                    )}
                    { (mode === 'full' && activeTab === 'documents') && (
                        <DocumentsAndAssignmentsForm
                            formData={formData}
                            isEditing={isEditing}
                            handleChange={handleChange}
                            handleFileChange={handleFileChange}
                            handleDocumentExpiryChange={handleDocumentExpiryChange}
                            vehicles={vehicles}
                            companies={companies}
                            loadingInitialData={loadingInitialData}
                            PAID_BY_OPTIONS={PAID_BY_OPTIONS}
                        />
                    )}
                </div>

                {isEditing && ( // Only show buttons if in editing mode
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
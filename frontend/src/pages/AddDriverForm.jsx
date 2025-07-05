import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import {
  Upload, CircleUserRound, Save, X, AlertTriangle, User, FileText, Building,
  Phone, Mail, MapPin, Calendar, Globe, CreditCard, Camera, Plus, Minus,
  CheckCircle, XCircle, Clock, ArrowRight, ArrowLeft
} from 'lucide-react';
import { toast } from 'react-toastify';
// --- Reusable Components ---

/**
 * Reusable component for fields that can be toggled between view and edit mode.
 * It renders an input field when `isEditing` is true, otherwise it displays the value.
 */
const EditableField = ({ label, value, onChange, name, isEditing, type = 'text', placeholder, required = false, children }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">{label} {required && <span className="text-red-500">*</span>}</label>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
            )
        ) : (
            // View mode: display the value or a placeholder
            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg min-h-[48px] text-gray-700">
                {value ? (
                    type === 'date' ? new Date(value).toLocaleDateString() : value
                ) : (
                    <span className="text-gray-400">{placeholder || 'N/A'}</span>
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
        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-3">{label} Document {required && <span className="text-red-500">*</span>}</label>
            <div className="flex items-center">
                <input
                    type="text"
                    readOnly
                    value={getFileName(file)}
                    className="flex-1 bg-gray-50 px-4 py-3 text-gray-700 rounded-l-lg border border-gray-300 text-sm overflow-hidden text-ellipsis whitespace-nowrap"
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
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                )}
                {/* The clickable label (upload icon) that visually represents the file input */}
                <label
                    htmlFor={name} // This links the label to the hidden input by its ID
                    className={`cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-r-lg flex items-center justify-center transition-colors ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
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
        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm flex flex-col items-center">
            <label className="block text-sm font-medium text-gray-700 mb-4">{label}</label>
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 flex items-center justify-center bg-gray-50 mb-4 shadow-md">
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
                        className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 z-10 shadow-lg transition-colors" // z-10 ensures it's above other elements
                        title="Upload Image"
                    >
                        <Camera size={16} className="text-white" />
                    </label>
                )}
            </div>
            {/* Display status in view mode if no image is present */}
            {!imageUrl && !isEditing && (
                <span className="text-gray-500 text-sm">No image uploaded</span>
            )}
            {/* Display filename from URL in view mode */}
            {typeof imageFile === 'string' && imageFile && !isEditing && (
                <p className="text-xs text-gray-500 mt-1">{imageFile.split('/').pop()}</p>
            )}
        </div>
    );
};

// --- Child Form Components ---

/**
 * Form section for basic driver information AND Vehicle & Company Assignment.
 * This component now receives vehicles, companies, and loadingInitialData as props.
 */
const DriverInfoForm = ({ formData, isEditing, handleChange, handleFileChange, vehicles, companies, loadingInitialData, validationErrors = {} }) => (
    <div className="space-y-8">
        {/* Profile Image Section */}
        <div className="flex justify-center">
            <ImageUploadField
                label="Driver Profile Image"
                name="driver_profile_img"
                imageFile={formData.documents.driver_profile_img}
                onFileChange={handleFileChange}
                isEditing={isEditing}
            />
        </div>

        {/* Personal Information */}
        <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <User className="mr-2 h-5 w-5 text-blue-600" />
                Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                    <EditableField
                        label="Driver Name"
                        name="driver_name"
                        value={formData.driver_name}
                        onChange={handleChange}
                        isEditing={isEditing}
                        placeholder="Enter full name"
                        required
                    />
                    {validationErrors.driver_name && (
                        <p className="text-red-600 text-sm mt-1 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            {validationErrors.driver_name}
                        </p>
                    )}
                </div>

                <div>
                    <EditableField
                        label="Iqama Number"
                        name="iqama"
                        value={formData.iqama}
                        onChange={handleChange}
                        isEditing={isEditing}
                        placeholder="Enter 10-digit Iqama number"
                        required
                    />
                    {validationErrors.iqama && (
                        <p className="text-red-600 text-sm mt-1 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            {validationErrors.iqama}
                        </p>
                    )}
                </div>

                <div>
                    <EditableField
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        isEditing={isEditing}
                        placeholder="Enter email address"
                        required
                    />
                    {validationErrors.email && (
                        <p className="text-red-600 text-sm mt-1 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            {validationErrors.email}
                        </p>
                    )}
                </div>

                <div>
                    <EditableField
                        label="Mobile Number"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        isEditing={isEditing}
                        placeholder="Enter mobile number"
                        required
                    />
                    {validationErrors.mobile && (
                        <p className="text-red-600 text-sm mt-1 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            {validationErrors.mobile}
                        </p>
                    )}
                </div>

                <div>
                    <EditableField
                        label="City"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        isEditing={isEditing}
                        placeholder="Enter city"
                        required
                    />
                    {validationErrors.city && (
                        <p className="text-red-600 text-sm mt-1 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            {validationErrors.city}
                        </p>
                    )}
                </div>

                <div>
                    <EditableField label="Gender" name="gender" value={formData.gender} onChange={handleChange} isEditing={isEditing} required>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white" required>
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </EditableField>
                </div>

                <div>
                    <EditableField
                        label="Nationality"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        isEditing={isEditing}
                        placeholder="Enter nationality"
                        required
                    />
                    {validationErrors.nationality && (
                        <p className="text-red-600 text-sm mt-1 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            {validationErrors.nationality}
                        </p>
                    )}
                </div>

                <div>
                    <EditableField
                        label="Date of Birth"
                        name="dob"
                        type="date"
                        value={formData.dob}
                        onChange={handleChange}
                        isEditing={isEditing}
                        required
                    />
                    {validationErrors.dob && (
                        <p className="text-red-600 text-sm mt-1 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            {validationErrors.dob}
                        </p>
                    )}
                </div>
            </div>
        </div>

        {/* Company Assignment */}
        <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Building className="mr-2 h-5 w-5 text-blue-600" />
                Company Assignment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <EditableField label="Assign Company" name="company_id" value={formData.company_id} onChange={handleChange} isEditing={isEditing} required>
                        <select name="company_id" value={formData.company_id} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" required>
                            <option value="">{loadingInitialData ? 'Loading...' : 'Select Company'}</option>
                            {Array.isArray(companies) && companies.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                        </select>
                    </EditableField>
                    {validationErrors.company_id && (
                        <p className="text-red-600 text-sm mt-1 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            {validationErrors.company_id}
                        </p>
                    )}
                </div>

                <div>
                    <EditableField label="Assign Vehicle (Optional)" name="vehicle_id" value={formData.vehicle_id} onChange={handleChange} isEditing={isEditing}>
                        <select name="vehicle_id" value={formData.vehicle_id} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                            <option value="">{loadingInitialData ? 'Loading...' : 'Select Vehicle (Optional)'}</option>
                            {Array.isArray(vehicles) && vehicles.map(v => <option key={v.id} value={v.id}>{`${v.vehicle_name} (${v.vehicle_number || 'No Number'})`}</option>)}
                        </select>
                    </EditableField>
                </div>
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
            <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <FileText className="mr-2 h-5 w-5 text-blue-600" />
                Mandatory Documents
            </h4>
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
            <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <CreditCard className="mr-2 h-5 w-5 text-green-600" />
                Expenses & Bills
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {['insurance', 'accommodation', 'phone_bill'].map(expense => (
                    <div key={expense} className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm space-y-4">
                        <EditableField label={`${expense.charAt(0).toUpperCase() + expense.slice(1)} Paid By`} name={`${expense}_paid_by`} value={formData[`${expense}_paid_by`]} onChange={handleChange} isEditing={isEditing}>
                            <select name={`${expense}_paid_by`} value={formData[`${expense}_paid_by`]} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
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
    const navigate = useNavigate();
    const [mode, setMode] = useState('partial'); // 'partial' or 'full' details mode
    const [isEditing, setIsEditing] = useState(true); // Form is always editable when adding a new driver
    const [activeTab, setActiveTab] = useState('info'); // Controls tab display for 'full' mode
    const [vehicles, setVehicles] = useState([]); // Stores fetched vehicle data
    const [companies, setCompanies] = useState([]); // Stores fetched company data
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [formProgress, setFormProgress] = useState(0);
    const [loadingInitialData, setLoadingInitialData] = useState(true); // Tracks loading state for vehicles/companies

    // Initial state for the form data, including nested documents
    const initialFormData = {
        driver_name: '', gender: '', iqama: '', mobile: '', email: '', city: '',
        nationality: '', dob: '',
        vehicle_id: '', // Using vehicle_id to match backend expectation
        company_id: '', // Changed from 'company' to 'company_id'
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
                    axiosInstance.get('vehicles/'), // Use axiosInstance
                    axiosInstance.get('companies/')    // Use axiosInstance (fixed endpoint)
                ]);

                // Handle different response formats
                const vehiclesData = vehiclesRes.data.results || vehiclesRes.data || [];
                const companiesData = companiesRes.data.results || companiesRes.data || [];

                setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
                setCompanies(Array.isArray(companiesData) ? companiesData : []);

                console.log('Vehicles loaded:', vehiclesData.length);
                console.log('Companies loaded:', companiesData.length);
            } catch (err) {
                console.error("Error fetching initial data:", err);
                // Set empty arrays on error to prevent map errors
                setVehicles([]);
                setCompanies([]);
                toast.error('Failed to load companies and vehicles');
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

    // Validation functions
    const validateForm = () => {
        const errors = {};

        // Required fields validation
        if (!formData.driver_name?.trim()) {
            errors.driver_name = 'Driver name is required';
        }

        if (!formData.iqama?.trim()) {
            errors.iqama = 'Iqama number is required';
        } else if (!/^\d{10}$/.test(formData.iqama)) {
            errors.iqama = 'Iqama must be 10 digits';
        }

        if (!formData.mobile?.trim()) {
            errors.mobile = 'Mobile number is required';
        } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.mobile.replace(/\s/g, ''))) {
            errors.mobile = 'Please enter a valid mobile number';
        }

        if (!formData.email?.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!formData.city?.trim()) {
            errors.city = 'City is required';
        }

        if (!formData.nationality?.trim()) {
            errors.nationality = 'Nationality is required';
        }

        if (!formData.dob) {
            errors.dob = 'Date of birth is required';
        } else {
            const age = new Date().getFullYear() - new Date(formData.dob).getFullYear();
            if (age < 18 || age > 65) {
                errors.dob = 'Driver must be between 18 and 65 years old';
            }
        }

        if (!formData.company_id) {
            errors.company_id = 'Please select a company';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Calculate form progress
    const calculateProgress = () => {
        const requiredFields = ['driver_name', 'iqama', 'mobile', 'email', 'city', 'nationality', 'dob', 'company_id'];
        const filledFields = requiredFields.filter(field => formData[field]?.toString().trim());
        const progress = Math.round((filledFields.length / requiredFields.length) * 100);
        setFormProgress(progress);
        return progress;
    };

    // Update progress when form data changes
    useEffect(() => {
        calculateProgress();
    }, [formData]);

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

    // Enhanced form submission with validation
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form before submission
        if (!validateForm()) {
            toast.error('Please fix the validation errors before submitting');
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();

            // Append basic driver information fields, including vehicle_id and Company_id (note the capital C)
            const infoKeys = ['driver_name', 'gender', 'iqama', 'mobile', 'email', 'city', 'nationality', 'dob', 'vehicle_id'];
            infoKeys.forEach(key => {
                if (formData[key]) data.append(key, formData[key]);
            });

            // Handle company_id separately with correct field name for backend
            if (formData.company_id) {
                data.append('Company_id', formData.company_id);
            }

            // If in 'full' mode, append additional fields (documents and expense payers)
            if (mode === 'full') {
                const fullModeKeys = ['insurance_paid_by', 'accommodation_paid_by', 'phone_bill_paid_by'];
                fullModeKeys.forEach(key => {
                    if (formData[key]) data.append(key, formData[key]);
                });

                // Iterate through documents and append them to FormData
                Object.entries(formData.documents).forEach(([docKey, docValue]) => {
                    if (docValue instanceof File) {
                        data.append(docKey, docValue, docValue.name);
                        console.log(`Appending file: ${docKey}`, docValue.name);
                    } else if (typeof docValue === 'string' && docValue && !docKey.includes('_expiry')) {
                        data.append(docKey, docValue);
                        console.log(`Appending string: ${docKey}`, docValue);
                    } else if (docKey.includes('_expiry') && docValue) {
                        data.append(docKey, docValue);
                        console.log(`Appending expiry: ${docKey}`, docValue);
                    }
                });
            }

            // Debug: Log all FormData entries
            console.log('FormData entries:');
            for (let [key, value] of data.entries()) {
                console.log(key, value);
            }

            const response = await submitDriver(data);
            if (response.status === 201 || response.status === 200) {
                toast.success(`Driver registered successfully in ${mode} mode!`);
                setFormData(initialFormData);
                setValidationErrors({});
                setFormProgress(0);
                setIsEditing(true);
                setActiveTab('info');

                // Navigate to driver list after successful submission
                setTimeout(() => {
                    navigate('/registration-management');
                }, 2000);
            } else {
                toast.error('Submission failed with an unexpected status');
            }
        } catch (err) {
            console.error("Submission failed:", err);
            let errorMessage = 'Submission failed. Please check your network connection.';

            if (err.response?.data) {
                if (typeof err.response.data === 'object') {
                    // Handle validation errors from backend
                    const backendErrors = {};
                    Object.entries(err.response.data).forEach(([key, value]) => {
                        if (Array.isArray(value)) {
                            backendErrors[key] = value[0];
                        } else {
                            backendErrors[key] = value;
                        }
                    });
                    setValidationErrors(backendErrors);
                    errorMessage = 'Please fix the validation errors';
                } else {
                    errorMessage = err.response.data;
                }
            }

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen font-sans p-4 sm:p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Enhanced Light Header */}
            <header className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                            <User className="mr-3 h-8 w-8 text-blue-600" />
                            Add New Driver
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Current Mode: <span className="font-semibold text-blue-600">{mode === 'partial' ? 'Quick Registration' : 'Complete Profile'}</span>
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <label htmlFor="mode-select" className="text-gray-700 text-sm block mb-1">Registration Mode:</label>
                            <select
                                id="mode-select"
                                value={mode}
                                onChange={e => handleModeChange(e.target.value)}
                                className="bg-white border border-gray-300 p-2 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="partial">Quick Registration</option>
                                <option value="full">Complete Profile</option>
                            </select>
                        </div>
                        <CircleUserRound size={32} className="text-blue-600" />
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Form Progress</span>
                        <span className="text-sm text-gray-600">{formProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-gradient-to-r from-green-500 to-blue-600 h-3 rounded-full transition-all duration-300 shadow-sm"
                            style={{ width: `${formProgress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Validation Summary */}
                {Object.keys(validationErrors).length > 0 && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center text-red-700">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            <span className="text-sm font-medium">
                                {Object.keys(validationErrors).length} validation error{Object.keys(validationErrors).length !== 1 ? 's' : ''} found
                            </span>
                        </div>
                    </div>
                )}
            </header>

            <form onSubmit={handleSubmit}>
                <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                    {/* Enhanced Navigation tabs for 'full' mode */}
                    {mode === 'full' && (
                        <div className="bg-gray-50 border-b border-gray-200">
                            <nav className="flex">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('info')}
                                    className={`flex items-center px-6 py-4 text-sm font-medium transition-all ${
                                        activeTab === 'info'
                                            ? 'bg-blue-600 text-white border-b-2 border-blue-500 shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                                    }`}
                                >
                                    <User className="mr-2 h-4 w-4" />
                                    Driver Details
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('documents')}
                                    className={`flex items-center px-6 py-4 text-sm font-medium transition-all ${
                                        activeTab === 'documents'
                                            ? 'bg-blue-600 text-white border-b-2 border-blue-500 shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                                    }`}
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    Documents & Attachments
                                </button>
                            </nav>
                        </div>
                    )}

                    <div className="p-8">{/* Form content container */}

                    {/* Render content based on selected mode and active tab */}
                    { (mode === 'partial' || (mode === 'full' && activeTab === 'info')) && (
                        <DriverInfoForm
                            formData={formData}
                            isEditing={isEditing}
                            handleChange={handleChange}
                            handleFileChange={handleFileChange}
                            vehicles={vehicles}
                            companies={companies}
                            loadingInitialData={loadingInitialData}
                            validationErrors={validationErrors}
                        />
                    )}
                    { (mode === 'full' && activeTab === 'documents') && (
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

                    {/* Enhanced Form Action Buttons */}
                    <div className="bg-gray-50 border-t border-gray-200 p-6">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                {mode === 'partial' ? 'Quick registration mode' : 'Complete profile mode'}
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData(initialFormData);
                                        setValidationErrors({});
                                        setFormProgress(0);
                                    }}
                                    className="flex items-center px-6 py-3 bg-gray-500 hover:bg-gray-600 rounded-lg text-white transition-all shadow-md hover:shadow-lg"
                                    disabled={loading}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Reset Form
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-lg text-white font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            {mode === 'partial' ? 'Register Driver' : 'Create Complete Profile'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddDriverForm;


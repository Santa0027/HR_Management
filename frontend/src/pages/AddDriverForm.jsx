import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Upload, ChevronDown, CircleUserRound } from 'lucide-react';

// Reusable component for fields that can be toggled between view and edit mode.
const EditableField = ({ label, value, onChange, name, isEditing, type = 'text', placeholder, required = false, children }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        {isEditing ? (
            children ? children : (
                <input
                    type={type}
                    name={name}
                    id={name}
                    value={value || ''}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            )
        ) : (
            <div className="w-full p-2 bg-gray-800 rounded min-h-[40px] text-gray-300">
                {value || <span className="text-gray-500">{placeholder}</span>}
            </div>
        )}
    </div>
);

// Reusable File Upload Component
const FileUploadField = ({ label, name, file, expiryKey, expiryValue, onFileChange, onExpiryChange, isEditing }) => {
    const getFileName = (file) => file?.name || 'No file selected';

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-300 mb-2">{label} Document</label>
            <div className="flex items-center">
                <input type="text" readOnly value={getFileName(file)} className="flex-1 bg-gray-700 p-2 text-white rounded-l-md border border-gray-600 text-sm" />
                <label htmlFor={name} className={`cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md flex items-center justify-center ${!isEditing && 'opacity-50 cursor-not-allowed'}`}>
                    <Upload size={18} />
                </label>
                {isEditing && <input type="file" name={name} id={name} onChange={onFileChange} className="hidden" />}
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

// --- Child Components ---
// By defining these outside the main component, they won't be recreated on every render.
// This is the key fix for the "losing focus" issue.

const DriverInfoForm = ({ formData, isEditing, handleChange }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <EditableField label="Driver Name" name="driver_name" value={formData.driver_name} onChange={handleChange} isEditing={isEditing} placeholder="Enter full name" required/>
        <EditableField label="Iqama Number" name="iqama" value={formData.iqama} onChange={handleChange} isEditing={isEditing} placeholder="Enter Iqama number" required/>
        <EditableField label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} isEditing={isEditing} placeholder="Enter mobile number" required/>
        <EditableField label="City" name="city" value={formData.city} onChange={handleChange} isEditing={isEditing} placeholder="Enter city" required/>
        <EditableField label="Gender" name="gender" value={formData.gender} onChange={handleChange} isEditing={isEditing} required>
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white" required>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
            </select>
        </EditableField>
        <EditableField label="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} isEditing={isEditing} placeholder="Enter nationality"/>
        <EditableField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} isEditing={isEditing}/>
    </div>
);

const DocumentsAndAssignmentsForm = ({ formData, isEditing, handleChange, handleFileChange, handleDocumentExpiryChange, vehicles, companies, loadingInitialData, PAID_BY_OPTIONS }) => (
    <div className="space-y-8">
        <div>
            <h4 className="text-lg font-semibold text-gray-200 mb-4">Mandatory Documents</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['iqama', 'passport', 'license', 'visa', 'medical'].map(doc => (
                    <FileUploadField key={doc} label={doc.charAt(0).toUpperCase() + doc.slice(1)} name={`${doc}_document`} file={formData.documents[`${doc}_document`]} expiryKey={`${doc}_expiry`} expiryValue={formData.documents[`${doc}_expiry`]} onFileChange={handleFileChange} onExpiryChange={handleDocumentExpiryChange} isEditing={isEditing}/>
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
                        <FileUploadField label="" name={`${expense}_document`} file={formData.documents[`${expense}_document`]} expiryKey={`${expense}_expiry`} expiryValue={formData.documents[`${expense}_expiry`]} onFileChange={handleFileChange} onExpiryChange={handleDocumentExpiryChange} isEditing={isEditing}/>
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
    const [isEditing, setIsEditing] = useState(true);
    const [activeTab, setActiveTab] = useState('info'); // 'info' or 'documents'
    const [vehicles, setVehicles] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loadingInitialData, setLoadingInitialData] = useState(true);

    const initialFormData = {
        driver_name: '', gender: '', iqama: '', mobile: '', city: '',
        nationality: '', dob: '', vehicleType: '', company: '',
        documents: {
          iqama_document: null, iqama_expiry: '', passport_document: null, passport_expiry: '',
          license_document: null, license_expiry: '', visa_document: null, visa_expiry: '',
          medical_document: null, medical_expiry: '', insurance_document: null, insurance_expiry: '',
          accommodation_document: null, accommodation_expiry: '', phone_bill_document: null, phone_bill_expiry: ''
        },
        insurance_paid_by: '', accommodation_paid_by: '', phone_bill_paid_by: ''
      };

    const [formData, setFormData] = useState(initialFormData);

    const PAID_BY_OPTIONS = [ { value: '', label: 'Select Payer' }, { value: 'own', label: 'Own' }, { value: 'company', label: 'Company' }];

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
          } finally {
            setLoadingInitialData(false);
          }
        };
        fetchInitialData();
      }, []);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleFileChange = useCallback((e) => {
        const { name, files } = e.target;
        setFormData(prev => ({ ...prev, documents: { ...prev.documents, [name]: files[0] } }));
    }, []);

    const handleDocumentExpiryChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, documents: { ...prev.documents, [name]: value } }));
    }, []);
    
    const handleModeChange = (newMode) => {
        setMode(newMode);
        setActiveTab('info');
    };

    // Token refresh and API submission logic (replace with your actual implementation)
    const submitDriver = async (data) => {
        console.log("Submitting data:", Object.fromEntries(data.entries()));
        // Replace with your actual axios post request
        // return axios.post('http://localhost:8000/Register/drivers/', data, { ... });
        return Promise.resolve({ status: 200 }); // Placeholder for success
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();

        const infoKeys = ['driver_name', 'gender', 'iqama', 'mobile', 'city', 'nationality', 'dob'];
        infoKeys.forEach(key => {
            if (formData[key]) data.append(key, formData[key]);
        });

        if (mode === 'full') {
            const fullModeKeys = ['vehicleType', 'company', 'insurance_paid_by', 'accommodation_paid_by', 'phone_bill_paid_by'];
            fullModeKeys.forEach(key => {
                if(formData[key]) data.append(key, formData[key]);
            });
            
            Object.entries(formData.documents).forEach(([docKey, docValue]) => {
                if (docValue instanceof File || (typeof docValue === 'string' && docValue)) {
                    data.append(docKey, docValue);
                }
            });
        }
        
        try {
            await submitDriver(data);
            alert(`Driver submitted in ${mode} mode successfully!`);
            setFormData(initialFormData);
            setIsEditing(true);
            setActiveTab('info');
        } catch (err) {
            console.error("Submission failed:", err);
            alert('Submission failed.');
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
                <CircleUserRound size={24} className="text-gray-400"/>
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
                    <div className={ (mode === 'partial' || (mode === 'full' && activeTab === 'info')) ? 'block' : 'hidden' }>
                        <DriverInfoForm 
                            formData={formData} 
                            isEditing={isEditing} 
                            handleChange={handleChange} 
                        />
                    </div>
                    <div className={ (mode === 'full' && activeTab === 'documents') ? 'block' : 'hidden'}>
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
                    </div>
                </div>

                {isEditing && (
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={() => { setFormData(initialFormData); }} className="px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white">
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
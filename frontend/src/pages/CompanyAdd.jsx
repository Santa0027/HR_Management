import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import {
  Building,
  Save,
  X,
  Upload,
  Calendar,
  DollarSign,
  FileText,
  User,
  Phone,
  MapPin,
  Mail,
  Globe,
  Hash,
  CreditCard,
  Users,
  ArrowLeft,
  Info,
  Building2,
  Briefcase,
  Home,
  Heart
} from 'lucide-react';

const CompanyAdd = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  const [company, setCompany] = useState({
    // Basic Information
    company_name: '',
    company_type: 'CORPORATION',
    registration_number: '',
    tax_id: '',
    established_date: '',
    
    // Contact Information
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    
    // Business Details
    industry: '',
    description: '',
    employee_count: '',
    annual_revenue: '',
    
    // Status and Verification
    status: 'PENDING',
    is_verified: false,
    
    // Documents
    company_logo: null,
    registration_document: null,
    tax_document: null,
    business_license: null
  });

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    
    if (type === 'file') {
      setCompany(prev => ({ ...prev, [name]: files[0] }));
    } else if (type === 'checkbox') {
      setCompany(prev => ({ ...prev, [name]: checked }));
    } else {
      setCompany(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      
      // Append all company data
      Object.keys(company).forEach(key => {
        if (company[key] !== null && company[key] !== undefined && company[key] !== '') {
          if (company[key] instanceof File) {
            formData.append(key, company[key]);
          } else {
            formData.append(key, company[key]);
          }
        }
      });

      const response = await axiosInstance.post('/companies/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Company added successfully!');
      navigate('/company-management');
    } catch (error) {
      console.error('Error adding company:', error);
      toast.error('Failed to add company');
    } finally {
      setLoading(false);
    }
  };

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </button>
  );

  const InputField = ({ label, name, type = 'text', required = false, options = null, placeholder = '', help = '' }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'select' ? (
        <select
          name={name}
          value={company[name]}
          onChange={handleChange}
          required={required}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select {label}</option>
          {options?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          name={name}
          value={company[name]}
          onChange={handleChange}
          required={required}
          placeholder={placeholder}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      ) : type === 'file' ? (
        <input
          type="file"
          name={name}
          onChange={handleChange}
          accept={name.includes('logo') ? 'image/*' : '.pdf,.doc,.docx'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      ) : type === 'checkbox' ? (
        <div className="flex items-center">
          <input
            type="checkbox"
            name={name}
            checked={company[name]}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">{label}</label>
        </div>
      ) : (
        <input
          type={type}
          name={name}
          value={company[name]}
          onChange={handleChange}
          required={required}
          placeholder={placeholder}
          step={type === 'number' ? '0.01' : undefined}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      )}
      {help && <p className="text-xs text-gray-500">{help}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Building className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Company</h1>
                <p className="text-gray-600">Register a new company in the system</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/company-management')}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-wrap gap-2 mb-6">
              <TabButton
                id="basic"
                label="Basic Info"
                icon={Building}
                isActive={activeTab === 'basic'}
                onClick={setActiveTab}
              />
              <TabButton
                id="contact"
                label="Contact Details"
                icon={Phone}
                isActive={activeTab === 'contact'}
                onClick={setActiveTab}
              />
              <TabButton
                id="business"
                label="Business Details"
                icon={Briefcase}
                isActive={activeTab === 'business'}
                onClick={setActiveTab}
              />
              <TabButton
                id="documents"
                label="Documents"
                icon={FileText}
                isActive={activeTab === 'documents'}
                onClick={setActiveTab}
              />
            </div>

            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Company Name"
                  name="company_name"
                  required
                  placeholder="e.g., ABC Corporation"
                />
                <InputField
                  label="Company Type"
                  name="company_type"
                  type="select"
                  required
                  options={[
                    { value: 'CORPORATION', label: 'Corporation' },
                    { value: 'LLC', label: 'Limited Liability Company (LLC)' },
                    { value: 'PARTNERSHIP', label: 'Partnership' },
                    { value: 'SOLE_PROPRIETORSHIP', label: 'Sole Proprietorship' },
                    { value: 'NONPROFIT', label: 'Non-Profit Organization' }
                  ]}
                />
                <InputField
                  label="Registration Number"
                  name="registration_number"
                  required
                  placeholder="e.g., REG123456789"
                />
                <InputField
                  label="Tax ID / EIN"
                  name="tax_id"
                  required
                  placeholder="e.g., 12-3456789"
                />
                <InputField
                  label="Established Date"
                  name="established_date"
                  type="date"
                  required
                />
                <InputField
                  label="Status"
                  name="status"
                  type="select"
                  required
                  options={[
                    { value: 'PENDING', label: 'Pending Approval' },
                    { value: 'ACTIVE', label: 'Active' },
                    { value: 'INACTIVE', label: 'Inactive' },
                    { value: 'SUSPENDED', label: 'Suspended' }
                  ]}
                />
              </div>
            )}

            {/* Contact Details Tab */}
            {activeTab === 'contact' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Email Address"
                  name="email"
                  type="email"
                  required
                  placeholder="contact@company.com"
                />
                <InputField
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  required
                  placeholder="+1-555-0123"
                />
                <InputField
                  label="Website"
                  name="website"
                  type="url"
                  placeholder="https://www.company.com"
                />
                <InputField
                  label="Country"
                  name="country"
                  required
                  placeholder="e.g., United States"
                />
                <div className="md:col-span-2">
                  <InputField
                    label="Address"
                    name="address"
                    type="textarea"
                    required
                    placeholder="Complete business address"
                  />
                </div>
                <InputField
                  label="City"
                  name="city"
                  required
                  placeholder="e.g., New York"
                />
                <InputField
                  label="State/Province"
                  name="state"
                  required
                  placeholder="e.g., NY"
                />
                <InputField
                  label="Postal Code"
                  name="postal_code"
                  required
                  placeholder="e.g., 10001"
                />
              </div>
            )}

            {/* Business Details Tab */}
            {activeTab === 'business' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Industry"
                  name="industry"
                  placeholder="e.g., Technology, Healthcare"
                />
                <InputField
                  label="Employee Count"
                  name="employee_count"
                  type="number"
                  placeholder="e.g., 50"
                />
                <InputField
                  label="Annual Revenue"
                  name="annual_revenue"
                  type="number"
                  placeholder="e.g., 1000000"
                  help="Annual revenue in USD"
                />
                <div className="flex items-center">
                  <InputField
                    label="Verified Company"
                    name="is_verified"
                    type="checkbox"
                  />
                </div>
                <div className="md:col-span-2">
                  <InputField
                    label="Company Description"
                    name="description"
                    type="textarea"
                    placeholder="Brief description of the company's business..."
                  />
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Company Logo"
                  name="company_logo"
                  type="file"
                  help="Upload company logo (JPG, PNG)"
                />
                <InputField
                  label="Registration Document"
                  name="registration_document"
                  type="file"
                  help="Upload registration certificate (PDF, DOC)"
                />
                <InputField
                  label="Tax Document"
                  name="tax_document"
                  type="file"
                  help="Upload tax registration document (PDF, DOC)"
                />
                <InputField
                  label="Business License"
                  name="business_license"
                  type="file"
                  help="Upload business license (PDF, DOC)"
                />
                <div className="md:col-span-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Document Guidelines</h4>
                        <ul className="mt-2 text-sm text-blue-700 space-y-1">
                          <li>• All documents should be clear and legible</li>
                          <li>• Maximum file size: 10MB per document</li>
                          <li>• Accepted formats: PDF, DOC, DOCX for documents; JPG, PNG for images</li>
                          <li>• Registration and tax documents are required for verification</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/company-management')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Adding...' : 'Add Company'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyAdd;

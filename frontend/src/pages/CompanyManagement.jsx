import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import {
  Building,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Download,
  Upload,
  MoreVertical,
  Star,
  Award,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  PieChart,
  RefreshCw,
  Settings,
  Mail,
  Shield,
  UserCheck,
  UserX,
  Users,
  Car,
  DollarSign,
  Globe,
  Briefcase,
  CreditCard,
  Hash,
  Building2,
  Factory,
  Store,
  Home,
  Zap,
  Target,
  Bell,
  Archive,
  Bookmark,
  Copy,
  ExternalLink,
  History,
  Info,
  Grid3X3,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';

// Company Card Component
const CompanyCard = ({ company, onView, onEdit, onDelete, onActivate, onDeactivate }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'INACTIVE': return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SUSPENDED': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCompanyTypeIcon = (type) => {
    switch (type) {
      case 'CORPORATION': return <Building2 className="w-4 h-4" />;
      case 'LLC': return <Briefcase className="w-4 h-4" />;
      case 'PARTNERSHIP': return <Users className="w-4 h-4" />;
      case 'SOLE_PROPRIETORSHIP': return <Home className="w-4 h-4" />;
      case 'NONPROFIT': return <Heart className="w-4 h-4" />;
      default: return <Building className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {company.company_logo ? (
            <img
              src={company.company_logo}
              alt={company.company_name}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 truncate">{company.company_name}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              {getCompanyTypeIcon(company.company_type)}
              <span>{company.company_type?.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(company.status)}`}>
            {company.status}
          </span>
          {company.is_verified && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Company Information */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{company.email}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{company.phone}</span>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600 truncate">{company.address}</span>
        </div>
        {company.website && (
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-gray-400" />
            <a 
              href={company.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline truncate"
            >
              {company.website}
            </a>
          </div>
        )}
      </div>

      {/* Company Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Registration Number:</span>
          <span className="text-sm font-medium text-gray-900">{company.registration_number || 'N/A'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Tax ID:</span>
          <span className="text-sm font-medium text-gray-900">{company.tax_id || 'N/A'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Employees:</span>
          <span className="text-sm font-medium text-gray-900">{company.employee_count || 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Vehicles:</span>
          <span className="text-sm font-medium text-gray-900">{company.vehicle_count || 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Established:</span>
          <span className="text-sm font-medium text-gray-900">
            {company.established_date ? new Date(company.established_date).getFullYear() : 'N/A'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={() => onView(company)}
            className="flex items-center px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </button>
          <button
            onClick={() => onEdit(company)}
            className="flex items-center px-3 py-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </button>
        </div>
        <div className="flex space-x-2">
          {company.status === 'ACTIVE' ? (
            <button
              onClick={() => onDeactivate(company)}
              className="flex items-center px-3 py-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <UserX className="w-4 h-4 mr-1" />
              Deactivate
            </button>
          ) : (
            <button
              onClick={() => onActivate(company)}
              className="flex items-center px-3 py-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            >
              <UserCheck className="w-4 h-4 mr-1" />
              Activate
            </button>
          )}
          <button
            onClick={() => onDelete(company)}
            className="flex items-center px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const CompanyManagement = () => {
  const navigate = useNavigate();
  
  // Main state
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Company statistics
  const [companyStats, setCompanyStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
    suspended: 0,
    verified: 0,
    unverified: 0,
    totalEmployees: 0,
    totalVehicles: 0,
    averageEmployees: 0,
    thisMonth: 0,
    thisYear: 0
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');

  // Additional state for enhanced features
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'date', 'status'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [selectedCompanies, setSelectedCompanies] = useState([]); // For bulk operations
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Fetch companies data
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/companies/');
      
      // Ensure we have an array of companies
      let companyData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          companyData = response.data;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          // Handle paginated response
          companyData = response.data.results;
        } else if (typeof response.data === 'object') {
          // Handle single object response
          companyData = [response.data];
        }
      }
      
      setCompanies(companyData);
      setFilteredCompanies(companyData);
      setCompanyStats(calculateEnhancedStats(companyData));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to load companies');
      // Set empty arrays on error
      setCompanies([]);
      setFilteredCompanies([]);
      setCompanyStats(calculateEnhancedStats([]));
      setLoading(false);
    }
  };

  // Enhanced statistics calculation function
  const calculateEnhancedStats = (companiesData) => {
    // Ensure companiesData is an array
    if (!Array.isArray(companiesData)) {
      return {
        total: 0,
        active: 0,
        inactive: 0,
        pending: 0,
        suspended: 0,
        verified: 0,
        unverified: 0,
        totalEmployees: 0,
        totalVehicles: 0,
        averageEmployees: 0,
        thisMonth: 0,
        thisYear: 0
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate totals
    const totalEmployees = companiesData.reduce((sum, company) => sum + (company.employee_count || 0), 0);
    const totalVehicles = companiesData.reduce((sum, company) => sum + (company.vehicle_count || 0), 0);
    const averageEmployees = companiesData.length > 0 ? Math.round(totalEmployees / companiesData.length) : 0;

    // Companies registered this month/year
    const thisMonth = companiesData.filter(company => {
      if (company.created_at) {
        const createdDate = new Date(company.created_at);
        return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
      }
      return false;
    }).length;

    const thisYear = companiesData.filter(company => {
      if (company.created_at) {
        const createdDate = new Date(company.created_at);
        return createdDate.getFullYear() === currentYear;
      }
      return false;
    }).length;

    return {
      total: companiesData.length,
      active: companiesData.filter(c => c.status === 'ACTIVE').length,
      inactive: companiesData.filter(c => c.status === 'INACTIVE').length,
      pending: companiesData.filter(c => c.status === 'PENDING').length,
      suspended: companiesData.filter(c => c.status === 'SUSPENDED').length,
      verified: companiesData.filter(c => c.is_verified).length,
      unverified: companiesData.filter(c => !c.is_verified).length,
      totalEmployees,
      totalVehicles,
      averageEmployees,
      thisMonth,
      thisYear
    };
  };

  // Filter companies based on search and filters
  useEffect(() => {
    // Ensure companies is an array before filtering
    if (!Array.isArray(companies)) {
      setFilteredCompanies([]);
      return;
    }

    let filtered = companies;

    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.phone?.includes(searchTerm) ||
        company.registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.tax_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(company => company.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(company => company.company_type === typeFilter);
    }

    if (verificationFilter !== 'all') {
      if (verificationFilter === 'verified') {
        filtered = filtered.filter(company => company.is_verified);
      } else if (verificationFilter === 'unverified') {
        filtered = filtered.filter(company => !company.is_verified);
      }
    }

    setFilteredCompanies(filtered);
  }, [companies, searchTerm, statusFilter, typeFilter, verificationFilter]);

  // CRUD Operations
  const handleDeleteCompany = async (company) => {
    if (window.confirm(`Are you sure you want to delete ${company.company_name}?`)) {
      try {
        await axiosInstance.delete(`/companies/${company.id}/`);
        toast.success('Company deleted successfully');
        fetchCompanies(); // Refresh the list
      } catch (error) {
        console.error('Error deleting company:', error);
        toast.error('Failed to delete company');
      }
    }
  };

  const handleActivateCompany = async (company) => {
    try {
      await axiosInstance.patch(`/companies/${company.id}/`, { status: 'ACTIVE' });
      toast.success('Company activated successfully');
      fetchCompanies(); // Refresh the list
    } catch (error) {
      console.error('Error activating company:', error);
      toast.error('Failed to activate company');
    }
  };

  const handleDeactivateCompany = async (company) => {
    try {
      await axiosInstance.patch(`/companies/${company.id}/`, { status: 'INACTIVE' });
      toast.success('Company deactivated successfully');
      fetchCompanies(); // Refresh the list
    } catch (error) {
      console.error('Error deactivating company:', error);
      toast.error('Failed to deactivate company');
    }
  };

  const handleBulkOperation = async (operation) => {
    try {
      let promises = [];

      switch (operation) {
        case 'activate':
          promises = selectedCompanies.map(id =>
            axiosInstance.patch(`/companies/${id}/`, { status: 'ACTIVE' })
          );
          break;
        case 'deactivate':
          promises = selectedCompanies.map(id =>
            axiosInstance.patch(`/companies/${id}/`, { status: 'INACTIVE' })
          );
          break;
        case 'delete':
          promises = selectedCompanies.map(id =>
            axiosInstance.delete(`/companies/${id}/`)
          );
          break;
        default:
          return;
      }

      await Promise.all(promises);
      toast.success(`Bulk ${operation} completed successfully`);
      setSelectedCompanies([]);
      setShowBulkActions(false);
      fetchCompanies(); // Refresh the list
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      toast.error('Failed to perform bulk operation');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Company Management</h1>
            <p className="text-gray-600 mt-2">Manage companies, registrations, and business relationships</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <button
              onClick={() => navigate('/company-add')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </button>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Companies</p>
                <p className="text-2xl font-bold text-gray-900">{companyStats.total}</p>
                <p className="text-xs text-gray-500">{companyStats.thisMonth} this month</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Companies</p>
                <p className="text-2xl font-bold text-gray-900">{companyStats.active}</p>
                <p className="text-xs text-gray-500">{companyStats.verified} verified</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{companyStats.totalEmployees}</p>
                <p className="text-xs text-gray-500">Avg: {companyStats.averageEmployees} per company</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fleet Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">{companyStats.totalVehicles}</p>
                <p className="text-xs text-gray-500">{companyStats.pending} pending approval</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <Car className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={fetchCompanies}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="PENDING">Pending</option>
                <option value="SUSPENDED">Suspended</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="CORPORATION">Corporation</option>
                <option value="LLC">LLC</option>
                <option value="PARTNERSHIP">Partnership</option>
                <option value="SOLE_PROPRIETORSHIP">Sole Proprietorship</option>
                <option value="NONPROFIT">Non-Profit</option>
              </select>

              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Verification</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions Panel */}
          {showBulkActions && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Bulk Actions</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkOperation('activate')}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                >
                  Activate Selected
                </button>
                <button
                  onClick={() => handleBulkOperation('deactivate')}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm"
                >
                  Deactivate Selected
                </button>
                <button
                  onClick={() => handleBulkOperation('delete')}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              onView={(company) => navigate(`/company-profile/${company.id}`)}
              onEdit={(company) => navigate(`/company-edit/${company.id}`)}
              onDelete={handleDeleteCompany}
              onActivate={handleActivateCompany}
              onDeactivate={handleDeactivateCompany}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredCompanies.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Building className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No companies found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first company.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => navigate('/company-add')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Company
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyManagement;

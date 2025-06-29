import React, { useState, useEffect } from 'react';
import {
  ChevronDown, CircleUserRound, Plus, Edit, Trash2, Eye,
  Search, Filter, Building, Mail, Phone, MapPin,
  CreditCard, Globe, AlertTriangle, CheckCircle,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';

// Enhanced Platform/Company List Component
function Reg_ma_platform_list() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    commission_type: '',
    country: '',
  });
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);

  const itemsPerPage = 9;

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/companies/');
      const companyData = response.data.results || response.data || [];
      setCompanies(Array.isArray(companyData) ? companyData : []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to load companies');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete company
  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;

    try {
      await axiosInstance.delete(`/companies/${companyToDelete.id}/`);
      toast.success('Company deleted successfully');
      fetchCompanies(); // Refresh the list
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error('Failed to delete company');
    } finally {
      setShowDeleteModal(false);
      setCompanyToDelete(null);
    }
  };

  // Filter and search logic
  const getFilteredCompanies = () => {
    let filtered = companies;

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.registration_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.commission_type) {
      filtered = filtered.filter(company => company.commission_type === filters.commission_type);
    }
    if (filters.country) {
      filtered = filtered.filter(company => company.country?.toLowerCase().includes(filters.country.toLowerCase()));
    }

    return filtered;
  };

  const filteredCompanies = getFilteredCompanies();
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get commission display
  const getCommissionDisplay = (company) => {
    switch (company.commission_type) {
      case 'KM':
        return `${company.rate_per_km || 0}/km (Min: ${company.min_km || 0}km)`;
      case 'ORDER':
        return `${company.rate_per_order || 0}/order`;
      case 'FIXED':
        return `${company.fixed_commission || 0} (Fixed)`;
      default:
        return 'Not specified';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced Light Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-gray-500">Company Management / Platform List</div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors">
              English <ChevronDown size={16} className="ml-1" />
            </button>
            <CircleUserRound size={24} className="text-blue-600" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8">
        <div className="max-w-8xl mx-auto">
          {/* Page Header */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                  <Building className="h-8 w-8 mr-3 text-blue-600" />
                  Platform Companies
                </h1>
                <p className="text-gray-600 mt-2">Manage and monitor all registered platform companies</p>
              </div>
              <div className="mt-4 lg:mt-0">
                <button
                  onClick={() => navigate('/company-registration')}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg shadow-md transition-all hover:shadow-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Company
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Commission Type Filter */}
              <select
                value={filters.commission_type}
                onChange={(e) => setFilters(prev => ({ ...prev, commission_type: e.target.value }))}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Commission Types</option>
                <option value="FIXED">Fixed Commission</option>
                <option value="KM">KM Based</option>
                <option value="ORDER">Order Based</option>
              </select>

              {/* Country Filter */}
              <input
                type="text"
                placeholder="Filter by country..."
                value={filters.country}
                onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {/* Reset Filters */}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ commission_type: '', country: '' });
                  setCurrentPage(1);
                }}
                className="flex items-center justify-center px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Filter className="h-5 w-5 mr-2" />
                Reset
              </button>
            </div>
          </div>

          {/* Company Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedCompanies.map((company) => (
              <div key={company.id} className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all">
                {/* Company Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                        {company.company_logo ? (
                          <img
                            src={company.company_logo}
                            alt={company.company_name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <Building className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{company.company_name}</h3>
                        <p className="text-blue-100 text-sm">{company.registration_number}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company Info */}
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    {company.contact_email && (
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="text-sm">{company.contact_email}</span>
                      </div>
                    )}
                    {company.contact_phone && (
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2 text-green-500" />
                        <span className="text-sm">{company.contact_phone}</span>
                      </div>
                    )}
                    {company.city && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-red-500" />
                        <span className="text-sm">{company.city}, {company.country}</span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600">
                      <CreditCard className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="text-sm">{getCommissionDisplay(company)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/company-profile/${company.id}`)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/company-registration/${company.id}`)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setCompanyToDelete(company);
                        setShowDeleteModal(true);
                      }}
                      className="flex items-center justify-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {paginatedCompanies.length === 0 && (
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-12 text-center">
              <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Companies Found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filters.commission_type || filters.country
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first company'
                }
              </p>
              <button
                onClick={() => navigate('/company-registration')}
                className="flex items-center mx-auto px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg shadow-md transition-all hover:shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Company
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCompanies.length)} of {filteredCompanies.length} companies
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </button>

                  <div className="flex space-x-1">
                    {[...Array(totalPages)].map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(idx + 1)}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          currentPage === idx + 1
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">Delete Company</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{companyToDelete?.company_name}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setCompanyToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCompany}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reg_ma_platform_list;
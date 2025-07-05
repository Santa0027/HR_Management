import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import Modal from '../components/Model';
import DownloadWarningLetter from './DownloadWarningLetter';
import {
  ChevronDown, CircleUserRound, AlertTriangle, FileText, Search, Filter,
  Download, Edit, Trash2, Plus, RefreshCw, Calendar,
  CheckCircle, XCircle, TrendingUp, TrendingDown, BarChart3
} from 'lucide-react';

// Modern UI Components
const Card = ({ children, className = '' }) => (
  <div className={`bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const MetricCard = ({ title, value, change, changeType, icon: Icon, color, onClick }) => (
  <Card onClick={onClick} className="p-6 cursor-pointer hover:scale-105">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        {change && (
          <div className={`flex items-center mt-2 text-sm ${
            changeType === 'increase' ? 'text-green-600' :
            changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {changeType === 'increase' ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : changeType === 'decrease' ? (
              <TrendingDown className="h-4 w-4 mr-1" />
            ) : null}
            {change}
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-8 w-8 text-white" />
      </div>
    </div>
  </Card>
);

const Button = ({ children, onClick, className = '', type = 'button', variant = 'primary', size = 'md', disabled = false }) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-md hover:shadow-lg',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 shadow-md hover:shadow-lg',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-md hover:shadow-lg',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500 shadow-md hover:shadow-lg',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ type = 'text', placeholder, value, onChange, className = '', id, name, icon: Icon }) => (
  <div className="relative">
    {Icon && (
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
    )}
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 ${Icon ? 'pl-10' : ''} bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${className}`}
    />
  </div>
);

const Select = ({ value, onChange, children, className = '', placeholder }) => (
  <select
    value={value}
    onChange={onChange}
    className={`w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${className}`}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {children}
  </select>
);

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};


function WarningLetters() {
  const [letters, setLetters] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byReason: {}
  });
  const [form, setForm] = useState({
    driver_id: '',
    issued_by_id: 1, // Replace with actual logged-in user ID if needed
    issued_date: '',
    reason: '',
    description: '',
    status: 'active',
    document: null, // For manual upload, distinct from generated_letter
  });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const REASONS = [
    { value: 'speeding', label: 'Speeding' },
    { value: 'reckless_driving', label: 'Reckless Driving' },
    { value: 'unauthorized_route', label: 'Unauthorized Route' },
    { value: 'vehicle_damage', label: 'Vehicle Damage' },
    { value: 'late_delivery', label: 'Late Delivery' },
    { value: 'attendance_issues', label: 'Attendance Issues' },
    { value: 'performance_issues', label: 'Performance Issues' },
    { value: 'policy_violation', label: 'Policy Violation' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    fetchLetters();
    fetchDrivers();
  }, []);

  const fetchLetters = async () => {
    try {
      const res = await axiosInstance.get('/hr/warning-letters/');
      const data = Array.isArray(res.data.results) ? res.data.results : res.data;
      const formattedData = data.map(item => ({
        ...item,
        driver_name: item.driver?.driver_name || 'N/A',
        driver_id: item.driver?.id || null,
        issued_by_name: item.issued_by?.username || item.issued_by?.email || 'N/A', // Handle potential 'username' error here too
        issued_by_id: item.issued_by?.id || null,
      }));
      setLetters(formattedData);

      // Calculate statistics
      const stats = {
        total: formattedData.length,
        active: formattedData.filter(l => l.status === 'active').length,
        inactive: formattedData.filter(l => l.status === 'inactive').length,
        byReason: {}
      };

      // Count by reason
      formattedData.forEach(letter => {
        const reason = letter.reason || 'unknown';
        stats.byReason[reason] = (stats.byReason[reason] || 0) + 1;
      });

      setStatistics(stats);
    } catch (error) {
      console.error('Failed to fetch warning letters:', error);
      toast.error('Failed to fetch warning letters');
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await axiosInstance.get('/Register/drivers/');
      setDrivers(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
      toast.error('Failed to fetch drivers');
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'document') {
      const file = files[0];
      if (file && file.type !== 'application/pdf' && file.type !== '') {
        toast.error('Only PDF files are allowed');
        setForm({ ...form, document: null });
        return;
      }
      setForm({ ...form, document: file });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async () => {
    if (!form.driver_id || !form.issued_date || !form.reason || !form.issued_by_id) {
      toast.error('Please fill all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('driver_id', form.driver_id);
    formData.append('issued_date', form.issued_date);
    formData.append('reason', form.reason);
    formData.append('description', form.description || '');
    formData.append('status', form.status);
    formData.append('issued_by_id', form.issued_by_id);

    if (form.document) {
      formData.append('document', form.document);
    }

    try {
      if (editingId) {
        await axiosInstance.patch(`/hr/warning-letters/${editingId}/`, formData);
        toast.success('Warning letter updated');
      } else {
        await axiosInstance.post('/hr/warning-letters/', formData);
        toast.success('Warning letter issued');
      }
      resetForm();
      fetchLetters();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Submission failed:', error.response?.data || error.message);
      let errorMessage = 'Submission failed.';
      if (error.response && error.response.data) {
          try {
              errorMessage += ' Details: ' + JSON.stringify(error.response.data);
          } catch (e) {
              errorMessage += ' Details: ' + (error.response.data.detail || error.response.data.message || 'Unknown error from server.');
          }
      }
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setForm({
      driver_id: '',
      issued_by_id: 1,
      issued_date: '',
      reason: '',
      description: '',
      status: 'active',
      document: null,
    });
    setEditingId(null);
  };

  const handleEdit = (letter) => {
    setForm({
      driver_id: letter.driver_id,
      issued_by_id: letter.issued_by_id || 1,
      issued_date: letter.issued_date,
      reason: letter.reason,
      description: letter.description || '',
      status: letter.status,
      document: null,
    });
    setEditingId(letter.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this letter?')) return;
    try {
      await axiosInstance.delete(`/hr/warning-letters/${id}/`);
      toast.success('Deleted successfully');
      fetchLetters();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Delete failed');
    }
  };

  const filteredLetters = letters.filter((l) => {
    const matchesSearch = l.driver_name?.toLowerCase().includes(search.toLowerCase()) ||
                         l.reason?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || l.status === statusFilter;
    const matchesReason = !reasonFilter || l.reason === reasonFilter;

    return matchesSearch && matchesStatus && matchesReason;
  });

  const paginated = filteredLetters.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredLetters.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Enhanced Professional Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <AlertTriangle className="h-8 w-8 mr-3 text-red-600" />
                  Warning Letters Management
                </h1>
                <p className="text-gray-600 mt-1">Issue and manage employee warning letters</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <button className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors">
                English <ChevronDown size={16} className="ml-1" />
              </button>
              <CircleUserRound size={32} className="text-red-600" />
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Enhanced Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Warnings"
              value={statistics.total}
              change="+3 this month"
              changeType="increase"
              icon={FileText}
              color="bg-blue-500"
            />
            <MetricCard
              title="Active Warnings"
              value={statistics.active}
              change="+2 this week"
              changeType="increase"
              icon={CheckCircle}
              color="bg-green-500"
            />
            <MetricCard
              title="Resolved Warnings"
              value={statistics.inactive}
              change="+5 this month"
              changeType="increase"
              icon={XCircle}
              color="bg-gray-500"
            />
            <MetricCard
              title="Warning Types"
              value={Object.keys(statistics.byReason).length}
              change="8 categories"
              changeType="neutral"
              icon={BarChart3}
              color="bg-orange-500"
            />
          </div>

          {/* Controls Section */}
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(true);
                  }}
                  variant="primary"
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Issue Warning Letter
                </Button>
                <Button
                  onClick={() => window.location.href = '/AttendanceDashboard'}
                  variant="outline"
                  className="flex items-center"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Back to Attendance
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 lg:w-2/3">
                <Input
                  type="text"
                  placeholder="Search by driver name or reason..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  icon={Search}
                  className="flex-1"
                />
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  placeholder="All Status"
                  className="w-full sm:w-40"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
                <Select
                  value={reasonFilter}
                  onChange={(e) => setReasonFilter(e.target.value)}
                  placeholder="All Reasons"
                  className="w-full sm:w-48"
                >
                  {REASONS.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>Showing {filteredLetters.length} of {letters.length} warning letters</span>
              <Badge variant="info" className="text-xs">
                <Filter className="h-3 w-3 mr-1" />
                {filteredLetters.length} filtered
              </Badge>
            </div>
          </Card>

          {/* Enhanced Warning Letters Table */}
          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-red-600" />
                  Warning Letters
                </h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="danger" className="text-xs">
                    {paginated.length} active
                  </Badge>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issue Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Generated Letter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginated.length > 0 ? paginated.map((letter) => (
                    <tr key={letter.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-red-600 font-medium text-sm">
                              {(letter.driver_name || 'N/A').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{letter.driver_name}</div>
                            <div className="text-sm text-gray-500">Driver ID: {letter.driver_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{letter.issued_date}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="warning" className="capitalize">
                          {letter.reason?.replace(/_/g, ' ') || 'N/A'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={letter.status === 'active' ? 'danger' : 'success'}
                          className="capitalize"
                        >
                          {letter.status === 'active' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {letter.status === 'inactive' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {letter.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {letter.id && <DownloadWarningLetter letterId={letter.id} />}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => handleEdit(letter)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(letter.id)}
                            variant="danger"
                            size="sm"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <FileText className="h-12 w-12 text-gray-400 mb-4" />
                          <span className="text-gray-600 text-lg">No warning letters found</span>
                          <span className="text-gray-400 text-sm">Try adjusting your search criteria</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Modal for Creating/Editing Warning Letters */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? 'Edit Warning Letter' : 'Issue New Warning Letter'}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="driver-select" className="block text-sm font-medium text-gray-300 mb-1">Driver:</label>
              <select
                id="driver-select"
                name="driver_id"
                value={form.driver_id}
                onChange={handleChange}
                className="p-2 bg-gray-800 rounded w-full border border-gray-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Driver</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.driver_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="date-input" className="block text-sm font-medium text-gray-300 mb-1">Issue Date:</label>
              <input
                id="date-input"
                type="date"
                name="issued_date"
                value={form.issued_date}
                onChange={handleChange}
                className="p-2 bg-gray-800 rounded w-full border border-gray-700 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="reason-select" className="block text-sm font-medium text-gray-300 mb-1">Reason:</label>
              <select
                id="reason-select"
                name="reason"
                value={form.reason}
                onChange={handleChange}
                className="p-2 bg-gray-800 rounded w-full border border-gray-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Reason</option>
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="description-textarea" className="block text-sm font-medium text-gray-300 mb-1">Description (Optional):</label>
              <textarea
                id="description-textarea"
                name="description"
                value={form.description}
                onChange={handleChange}
                className="p-2 bg-gray-800 rounded w-full border border-gray-700 focus:ring-2 focus:ring-blue-500"
                placeholder="Detailed description of the warning..."
                rows="3"
              />
            </div>
            <div>
              <label htmlFor="status-select" className="block text-sm font-medium text-gray-300 mb-1">Status:</label>
              <select
                id="status-select"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="p-2 bg-gray-800 rounded w-full border border-gray-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label htmlFor="document-upload" className="block text-sm font-medium text-gray-300 mb-1">Upload Supporting Document (PDF Only, Optional):</label>
              <input
                id="document-upload"
                type="file"
                name="document"
                onChange={handleChange}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 cursor-pointer"
              />
            </div>
            <Button
              onClick={handleSubmit}
              variant="primary"
              className="w-full"
            >
              {editingId ? 'Update Warning' : 'Issue Warning'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default WarningLetters;
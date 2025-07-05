import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import Modal from '../components/Model';
import DownloadTerminationLetter from './DownloadTerminationLetter';
import {
  ChevronDown, CircleUserRound, UserX, FileText, Search, Filter,
  Download, Edit, Trash2, Plus, RefreshCw, Calendar,
  TrendingUp, TrendingDown, BarChart3, AlertTriangle
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


function Terminations() {
  const [terminations, setTerminations] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [statistics, setStatistics] = useState({
    total: 0,
    byReason: {},
    thisMonth: 0,
    thisYear: 0
  });
  const [form, setForm] = useState({
    driver: '', // This will hold the driver's ID from the select input
    termination_date: '',
    reason: '',
    details: '',
    document: null, // For manual document upload (if applicable)
    processed_by: 1, // Assuming a default user ID for now, adjust as needed
  });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const REASONS = [
    { value: 'performance_issues', label: 'Performance Issues' },
    { value: 'attendance_violations', label: 'Repeated Attendance Violations' },
    { value: 'policy_violation', label: 'Policy Violation' },
    { value: 'voluntary_resignation', label: 'Voluntary Resignation' },
    { value: 'contract_expiration', label: 'Contract Expiration' },
    { value: 'redundancy', label: 'Redundancy' },
    { value: 'misconduct', label: 'Misconduct' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    fetchTerminations();
    fetchDrivers();
  }, []);

  async function fetchTerminations() {
    try {
      const res = await axiosInstance.get('/hr/terminations/');
      // Ensure res.data is handled correctly whether it has 'results' or is direct array
      const data = Array.isArray(res.data.results) ? res.data.results : res.data;
      const formatted = data.map(item => ({
        ...item,
        // Assuming driver and processed_by are objects with 'id' and 'name'/'driver_name'
        driver_name: item.driver?.driver_name || 'N/A', // Handle potential null driver
        driver_id: item.driver?.id || null,
        processed_by: item.processed_by?.id || null, // Ensure this is the ID
      }));
      setTerminations(formatted);

      // Calculate statistics
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const stats = {
        total: formatted.length,
        byReason: {},
        thisMonth: 0,
        thisYear: 0
      };

      formatted.forEach(termination => {
        // Count by reason
        const reason = termination.reason || 'unknown';
        stats.byReason[reason] = (stats.byReason[reason] || 0) + 1;

        // Count this month and year
        const terminationDate = new Date(termination.termination_date);
        if (terminationDate.getFullYear() === currentYear) {
          stats.thisYear++;
          if (terminationDate.getMonth() === currentMonth) {
            stats.thisMonth++;
          }
        }
      });

      setStatistics(stats);
    } catch (err) {
      console.error('Error fetching terminations:', err);
      toast.error('Failed to fetch terminations');
    }
  }

  async function fetchDrivers() {
    try {
      const res = await axiosInstance.get('/Register/drivers/');
      // Handle cases where API returns array directly or an object with 'results'
      setDrivers(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      console.error('Error fetching drivers:', err);
      toast.error('Failed to fetch drivers');
    }
  }

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (name === 'document') {
      const file = files[0];
      setForm(prev => ({ ...prev, document: file }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit() {
    // Frontend validation
    if (!form.driver || !form.termination_date || !form.reason) {
      toast.error('Please fill required fields (Driver, Date, Reason).');
      return;
    }

    const fd = new FormData();
    // CRITICAL FIX: Backend expects 'driver_id' and 'processed_by_id'
    fd.append('driver_id', form.driver); // Sending the ID collected from the 'driver' select input
    fd.append('termination_date', form.termination_date);
    fd.append('reason', form.reason);
    fd.append('details', form.details || '');
    fd.append('processed_by_id', form.processed_by); // Sending the ID for 'processed_by'
    if (form.document) {
      fd.append('document', form.document);
    }

    try {
      if (editingId) {
        // Use PATCH for partial updates if your API supports it, otherwise PUT
        await axiosInstance.patch(`/hr/terminations/${editingId}/`, fd);
        toast.success('Termination updated successfully!');
      } else {
        await axiosInstance.post('/hr/terminations/', fd);
        toast.success('Termination recorded successfully!');
      }
      resetForm();
      fetchTerminations(); // Refresh the list
      setIsModalOpen(false); // Close modal
    } catch (err) {
      console.error('Submission failed:', err.response?.data || err.message);
      // More detailed error message from backend
      let errorMessage = 'Submission failed. Please check your input.';
      if (err.response && err.response.data) {
        try {
          // Attempt to stringify the error response for display
          errorMessage = `Submission failed: ${JSON.stringify(err.response.data)}`;
        } catch (jsonErr) {
          // Fallback if parsing fails
          errorMessage = `Submission failed: ${err.response.data.detail || err.message}`;
        }
      }
      toast.error(errorMessage);
    }
  }

  function resetForm() {
    setForm({
      driver: '',
      termination_date: '',
      reason: '',
      details: '',
      document: null,
      processed_by: 1, // Reset to default
    });
    setEditingId(null);
  }

  function handleEdit(item) {
    setForm({
      driver: item.driver_id, // Pre-fill with driver_id
      termination_date: item.termination_date,
      reason: item.reason,
      details: item.details || '',
      document: null, // Document usually not pre-filled for edit, needs re-upload
      processed_by: item.processed_by, // Pre-fill with processed_by_id
    });
    setEditingId(item.id);
    setIsModalOpen(true);
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this termination record?')) return;
    try {
      await axiosInstance.delete(`/hr/terminations/${id}/`);
      toast.success('Termination record deleted!');
      fetchTerminations();
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to delete termination record!');
    }
  }

  const filtered = terminations.filter(t => {
    const matchesSearch = t.driver_name?.toLowerCase().includes(search.toLowerCase()) ||
                         t.reason?.toLowerCase().includes(search.toLowerCase());
    const matchesReason = !reasonFilter || t.reason === reasonFilter;

    return matchesSearch && matchesReason;
  });
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50">
      {/* Enhanced Professional Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <UserX className="h-8 w-8 mr-3 text-red-600" />
                  Termination Management
                </h1>
                <p className="text-gray-600 mt-1">Process and manage employee terminations</p>
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
              title="Total Terminations"
              value={statistics.total}
              change="+2 this month"
              changeType="increase"
              icon={FileText}
              color="bg-red-500"
            />
            <MetricCard
              title="This Month"
              value={statistics.thisMonth}
              change="+1 from last month"
              changeType="increase"
              icon={Calendar}
              color="bg-orange-500"
            />
            <MetricCard
              title="This Year"
              value={statistics.thisYear}
              change="+15% from last year"
              changeType="increase"
              icon={BarChart3}
              color="bg-yellow-500"
            />
            <MetricCard
              title="Termination Types"
              value={Object.keys(statistics.byReason).length}
              change="8 categories"
              changeType="neutral"
              icon={AlertTriangle}
              color="bg-purple-500"
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
                  variant="danger"
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Process Termination
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
              <span>Showing {filtered.length} of {terminations.length} termination records</span>
              <Badge variant="danger" className="text-xs">
                <Filter className="h-3 w-3 mr-1" />
                {filtered.length} filtered
              </Badge>
            </div>
          </Card>

          {/* Enhanced Termination Table */}
          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-red-600" />
                  Termination Records
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
                      Termination Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
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
                  {paginated.length > 0 ? paginated.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-red-600 font-medium text-sm">
                              {(item.driver_name || 'N/A').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.driver_name}</div>
                            <div className="text-sm text-gray-500">Driver ID: {item.driver_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{item.termination_date}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="danger" className="capitalize">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {item.reason?.replace(/_/g, ' ') || 'N/A'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <DownloadTerminationLetter terminationId={item.id} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => handleEdit(item)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(item.id)}
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
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <FileText className="h-12 w-12 text-gray-400 mb-4" />
                          <span className="text-gray-600 text-lg">No termination records found</span>
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

      {/* Modal for Creating/Editing Termination Records */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? 'Edit Termination Record' : 'Process New Termination'}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="driver-select" className="block text-sm font-medium text-gray-700 mb-1">Driver:</label>
              <Select
                id="driver-select"
                name="driver"
                value={form.driver}
                onChange={handleChange}
                placeholder="Select Driver"
                className="w-full"
              >
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.driver_name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label htmlFor="termination-date" className="block text-sm font-medium text-gray-700 mb-1">Termination Date:</label>
              <Input
                id="termination-date"
                type="date"
                name="termination_date"
                value={form.termination_date}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="reason-select" className="block text-sm font-medium text-gray-700 mb-1">Reason:</label>
              <Select
                id="reason-select"
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder="Select Reason"
                className="w-full"
              >
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label htmlFor="details-textarea" className="block text-sm font-medium text-gray-700 mb-1">Details (Optional):</label>
              <textarea
                id="details-textarea"
                name="details"
                value={form.details}
                onChange={handleChange}
                placeholder="Enter additional details about the termination..."
                rows="3"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="document-upload" className="block text-sm font-medium text-gray-700 mb-1">Upload Supporting Document (Optional):</label>
              <input
                id="document-upload"
                type="file"
                name="document"
                onChange={handleChange}
                className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer border border-gray-300 rounded-lg"
              />
            </div>

            <Button
              onClick={handleSubmit}
              variant="danger"
              className="w-full"
            >
              {editingId ? 'Update Termination' : 'Process Termination'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Terminations;
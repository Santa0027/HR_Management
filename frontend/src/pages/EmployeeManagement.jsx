import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Eye, 
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';

const EmployeeManagement = () => {
  const { user, canManageUsers, canViewDrivers } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (canViewDrivers()) {
      fetchEmployees();
    }
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockEmployees = [
        {
          id: 1,
          employee_id: 'EMP001',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@company.com',
          phone: '+1234567890',
          position: 'Software Engineer',
          department: 'IT',
          employment_status: 'active',
          hire_date: '2023-01-15',
          manager: 'Jane Smith',
          company: 'Tech Corp'
        },
        {
          id: 2,
          employee_id: 'EMP002',
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@company.com',
          phone: '+1234567891',
          position: 'HR Manager',
          department: 'Human Resources',
          employment_status: 'active',
          hire_date: '2022-03-10',
          manager: 'CEO',
          company: 'Tech Corp'
        },
        {
          id: 3,
          employee_id: 'EMP003',
          first_name: 'Mike',
          last_name: 'Johnson',
          email: 'mike.johnson@company.com',
          phone: '+1234567892',
          position: 'Driver',
          department: 'Operations',
          employment_status: 'active',
          hire_date: '2023-06-01',
          manager: 'Operations Manager',
          company: 'Tech Corp'
        }
      ];
      
      setEmployees(mockEmployees);
    } catch (err) {
      setError('Failed to load employees');
      console.error('Employee fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !filterDepartment || employee.department === filterDepartment;
    const matchesStatus = !filterStatus || employee.employment_status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const departments = [...new Set(employees.map(emp => emp.department))];
  const statuses = [...new Set(employees.map(emp => emp.employment_status))];

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  if (!canViewDrivers()) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          You don't have permission to access Employee Management.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-gray-200 h-64 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
            <p className="text-gray-600">Manage your organization's employees</p>
          </div>
          {canManageUsers() && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </button>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map(employee => (
          <div key={employee.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {employee.first_name} {employee.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">{employee.employee_id}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                employee.employment_status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {employee.employment_status}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                {employee.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                {employee.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                {employee.department}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                Hired: {new Date(employee.hire_date).toLocaleDateString()}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleViewEmployee(employee)}
                className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 flex items-center justify-center"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </button>
              {canManageUsers() && (
                <button className="flex-1 bg-gray-50 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Employee Detail Modal */}
      {showModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Employee Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {selectedEmployee.first_name} {selectedEmployee.last_name}</p>
                  <p><strong>Employee ID:</strong> {selectedEmployee.employee_id}</p>
                  <p><strong>Email:</strong> {selectedEmployee.email}</p>
                  <p><strong>Phone:</strong> {selectedEmployee.phone}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Employment Information</h3>
                <div className="space-y-2">
                  <p><strong>Position:</strong> {selectedEmployee.position}</p>
                  <p><strong>Department:</strong> {selectedEmployee.department}</p>
                  <p><strong>Status:</strong> {selectedEmployee.employment_status}</p>
                  <p><strong>Hire Date:</strong> {new Date(selectedEmployee.hire_date).toLocaleDateString()}</p>
                  <p><strong>Manager:</strong> {selectedEmployee.manager}</p>
                  <p><strong>Company:</strong> {selectedEmployee.company}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;

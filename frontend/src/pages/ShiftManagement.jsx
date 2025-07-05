import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';

const ShiftManagement = () => {
  const [shiftTypes, setShiftTypes] = useState([]);
  const [shiftAssignments, setShiftAssignments] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('types');

  // Form states
  const [showShiftTypeForm, setShowShiftTypeForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [editingShiftType, setEditingShiftType] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);

  const [shiftTypeForm, setShiftTypeForm] = useState({
    name: '',
    shift_type: 'morning',
    start_time: '',
    end_time: '',
    break_duration_minutes: 30,
    description: '',
    overtime_threshold_hours: 8.0,
    overtime_rate_multiplier: 1.5,
    is_active: true
  });

  const [assignmentForm, setAssignmentForm] = useState({
    driver: '',
    shift_type: '',
    start_date: '',
    end_date: '',
    working_days: [],
    notes: '',
    is_active: true
  });

  const weekdays = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  const shiftTypeChoices = [
    { value: 'morning', label: 'Morning Shift' },
    { value: 'afternoon', label: 'Afternoon Shift' },
    { value: 'evening', label: 'Evening Shift' },
    { value: 'night', label: 'Night Shift' },
    { value: 'flexible', label: 'Flexible Shift' },
    { value: 'custom', label: 'Custom Shift' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [shiftTypesRes, assignmentsRes, driversRes] = await Promise.all([
        axiosInstance.get('/hr/shift-types/'),
        axiosInstance.get('/hr/shift-assignments/'),
        axiosInstance.get('/Register/drivers/')
      ]);

      console.log('API Responses:', {
        shiftTypes: shiftTypesRes.data,
        assignments: assignmentsRes.data,
        drivers: driversRes.data
      });

      // Handle paginated API responses
      const shiftTypesData = shiftTypesRes.data?.results || shiftTypesRes.data || [];
      const assignmentsData = assignmentsRes.data?.results || assignmentsRes.data || [];
      const driversData = driversRes.data?.results || driversRes.data || [];

      // Ensure data is arrays
      setShiftTypes(Array.isArray(shiftTypesData) ? shiftTypesData : []);
      setShiftAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
      setDrivers(Array.isArray(driversData) ? driversData : []);

      console.log('Set state with:', {
        shiftTypes: Array.isArray(shiftTypesData) ? shiftTypesData.length : 'not array',
        assignments: Array.isArray(assignmentsData) ? assignmentsData.length : 'not array',
        drivers: Array.isArray(driversData) ? driversData.length : 'not array'
      });

      console.log('Drivers data details:', driversData);
      console.log('Drivers state after setting:', drivers);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleShiftTypeSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingShiftType) {
        await axiosInstance.put(`/hr/shift-types/${editingShiftType.id}/`, shiftTypeForm);
        toast.success('Shift type updated successfully');
      } else {
        await axiosInstance.post('/hr/shift-types/', shiftTypeForm);
        toast.success('Shift type created successfully');
      }
      
      setShowShiftTypeForm(false);
      setEditingShiftType(null);
      resetShiftTypeForm();
      fetchData();
    } catch (error) {
      console.error('Error saving shift type:', error);
      toast.error('Failed to save shift type');
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAssignment) {
        await axiosInstance.put(`/hr/shift-assignments/${editingAssignment.id}/`, assignmentForm);
        toast.success('Shift assignment updated successfully');
      } else {
        await axiosInstance.post('/hr/shift-assignments/', assignmentForm);
        toast.success('Shift assignment created successfully');
      }
      
      setShowAssignmentForm(false);
      setEditingAssignment(null);
      resetAssignmentForm();
      fetchData();
    } catch (error) {
      console.error('Error saving shift assignment:', error);
      toast.error('Failed to save shift assignment');
    }
  };

  const resetShiftTypeForm = () => {
    setShiftTypeForm({
      name: '',
      shift_type: 'morning',
      start_time: '',
      end_time: '',
      break_duration_minutes: 30,
      description: '',
      overtime_threshold_hours: 8.0,
      overtime_rate_multiplier: 1.5,
      is_active: true
    });
  };

  const resetAssignmentForm = () => {
    setAssignmentForm({
      driver: '',
      shift_type: '',
      start_date: '',
      end_date: '',
      working_days: [],
      notes: '',
      is_active: true
    });
  };

  const editShiftType = (shiftType) => {
    setEditingShiftType(shiftType);
    setShiftTypeForm({
      name: shiftType.name,
      shift_type: shiftType.shift_type,
      start_time: shiftType.start_time,
      end_time: shiftType.end_time,
      break_duration_minutes: shiftType.break_duration_minutes,
      description: shiftType.description || '',
      overtime_threshold_hours: shiftType.overtime_threshold_hours,
      overtime_rate_multiplier: shiftType.overtime_rate_multiplier,
      is_active: shiftType.is_active
    });
    setShowShiftTypeForm(true);
  };

  const editAssignment = (assignment) => {
    setEditingAssignment(assignment);
    setAssignmentForm({
      driver: assignment.driver,
      shift_type: assignment.shift_type,
      start_date: assignment.start_date,
      end_date: assignment.end_date || '',
      working_days: assignment.working_days || [],
      notes: assignment.notes || '',
      is_active: assignment.is_active
    });
    setShowAssignmentForm(true);
  };

  const deleteShiftType = async (id) => {
    if (window.confirm('Are you sure you want to delete this shift type?')) {
      try {
        await axiosInstance.delete(`/hr/shift-types/${id}/`);
        toast.success('Shift type deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting shift type:', error);
        toast.error('Failed to delete shift type');
      }
    }
  };

  const deleteAssignment = async (id) => {
    if (window.confirm('Are you sure you want to delete this shift assignment?')) {
      try {
        await axiosInstance.delete(`/hr/shift-assignments/${id}/`);
        toast.success('Shift assignment deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting shift assignment:', error);
        toast.error('Failed to delete shift assignment');
      }
    }
  };

  const handleWorkingDaysChange = (day) => {
    const currentWorkingDays = assignmentForm.working_days || [];
    const updatedDays = currentWorkingDays.includes(day)
      ? currentWorkingDays.filter(d => d !== day)
      : [...currentWorkingDays, day];

    setAssignmentForm({ ...assignmentForm, working_days: updatedDays });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('types')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'types'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Shift Types
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assignments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Shift Assignments
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'types' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Shift Types</h2>
                <button
                  onClick={() => {
                    resetShiftTypeForm();
                    setEditingShiftType(null);
                    setShowShiftTypeForm(true);
                  }}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Add Shift Type
                </button>
              </div>

              {/* Shift Types Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(shiftTypes || []).map((shiftType) => (
                      <tr key={shiftType.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {shiftType.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {shiftTypeChoices.find(choice => choice.value === shiftType.shift_type)?.label || shiftType.shift_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {shiftType.start_time} - {shiftType.end_time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {shiftType.duration_hours?.toFixed(1)}h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            shiftType.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {shiftType.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => editShiftType(shiftType)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteShiftType(shiftType.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Shift Assignments</h2>
                <button
                  onClick={() => {
                    resetAssignmentForm();
                    setEditingAssignment(null);
                    setShowAssignmentForm(true);
                  }}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Assign Shift
                </button>
              </div>

              {/* Shift Assignments Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Driver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Shift
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Working Days
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(shiftAssignments || []).map((assignment) => (
                      <tr key={assignment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {assignment.driver_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {assignment.shift_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {assignment.start_date} - {assignment.end_date || 'Ongoing'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {Array.isArray(assignment.working_days) && assignment.working_days.length > 0
                            ? assignment.working_days.join(', ')
                            : 'All days'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            assignment.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {assignment.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => editAssignment(assignment)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteAssignment(assignment.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Shift Type Form Modal */}
      {showShiftTypeForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingShiftType ? 'Edit Shift Type' : 'Add Shift Type'}
              </h3>
              <form onSubmit={handleShiftTypeSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={shiftTypeForm.name}
                    onChange={(e) => setShiftTypeForm({ ...shiftTypeForm, name: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Shift Type *
                  </label>
                  <select
                    value={shiftTypeForm.shift_type}
                    onChange={(e) => setShiftTypeForm({ ...shiftTypeForm, shift_type: e.target.value })}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    {shiftTypeChoices.map((choice) => (
                      <option key={choice.value} value={choice.value}>
                        {choice.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={shiftTypeForm.start_time}
                      onChange={(e) => setShiftTypeForm({ ...shiftTypeForm, start_time: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      End Time *
                    </label>
                    <input
                      type="time"
                      value={shiftTypeForm.end_time}
                      onChange={(e) => setShiftTypeForm({ ...shiftTypeForm, end_time: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Break Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={shiftTypeForm.break_duration_minutes}
                    onChange={(e) => setShiftTypeForm({ ...shiftTypeForm, break_duration_minutes: parseInt(e.target.value) })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    min="0"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Overtime Threshold (hours)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={shiftTypeForm.overtime_threshold_hours}
                      onChange={(e) => setShiftTypeForm({ ...shiftTypeForm, overtime_threshold_hours: parseFloat(e.target.value) })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Overtime Rate Multiplier
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={shiftTypeForm.overtime_rate_multiplier}
                      onChange={(e) => setShiftTypeForm({ ...shiftTypeForm, overtime_rate_multiplier: parseFloat(e.target.value) })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      min="1"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Description
                  </label>
                  <textarea
                    value={shiftTypeForm.description}
                    onChange={(e) => setShiftTypeForm({ ...shiftTypeForm, description: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows="3"
                  />
                </div>

                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={shiftTypeForm.is_active}
                      onChange={(e) => setShiftTypeForm({ ...shiftTypeForm, is_active: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-gray-700 text-sm font-bold">Active</span>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setShowShiftTypeForm(false);
                      setEditingShiftType(null);
                      resetShiftTypeForm();
                    }}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    {editingShiftType ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Shift Assignment Form Modal */}
      {showAssignmentForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingAssignment ? 'Edit Shift Assignment' : 'Assign Shift'}
              </h3>
              <form onSubmit={handleAssignmentSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Driver * ({drivers.length} drivers available)
                  </label>
                  {drivers.length === 0 && (
                    <div className="text-red-500 text-sm mb-2">
                      No drivers found. Please check if drivers are loaded.
                    </div>
                  )}
                  <select
                    value={assignmentForm.driver}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, driver: e.target.value })}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="">Select Driver</option>
                    {(drivers || []).map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.driver_name} (ID: {driver.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Shift Type *
                  </label>
                  <select
                    value={assignmentForm.shift_type}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, shift_type: e.target.value })}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="">Select Shift Type</option>
                    {(shiftTypes || []).filter(st => st.is_active).map((shiftType) => (
                      <option key={shiftType.id} value={shiftType.id}>
                        {shiftType.name} ({shiftType.start_time} - {shiftType.end_time})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={assignmentForm.start_date}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, start_date: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={assignmentForm.end_date}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, end_date: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Working Days
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {weekdays.map((day) => (
                      <label key={day.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={(assignmentForm.working_days || []).includes(day.value)}
                          onChange={() => handleWorkingDaysChange(day.value)}
                          className="mr-2"
                        />
                        <span className="text-sm">{day.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Notes
                  </label>
                  <textarea
                    value={assignmentForm.notes}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, notes: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows="3"
                  />
                </div>

                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={assignmentForm.is_active}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, is_active: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-gray-700 text-sm font-bold">Active</span>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignmentForm(false);
                      setEditingAssignment(null);
                      resetAssignmentForm();
                    }}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    {editingAssignment ? 'Update' : 'Assign'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftManagement;

// src/pages/Terminations.js
import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance'; // Make sure this path is correct for your project
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '../components/Model'; // Make sure this path is correct for your project
import DownloadTerminationLetter from './DownloadTerminationLetter'; // Make sure this path is correct for your project

export default function Terminations() {
  const [terminations, setTerminations] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
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
    'performance_issues',
    'voluntary_resignation',
    'policy_violation',
    'contract_expiration',
    'redundancy',
    'other',
  ];

  useEffect(() => {
    fetchTerminations();
    fetchDrivers();
  }, []);

  async function fetchTerminations() {
    try {
      const res = await axiosInstance.get('/terminationletter/');
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
        await axiosInstance.patch(`/terminationletter/${editingId}/`, fd);
        toast.success('Termination updated successfully!');
      } else {
        await axiosInstance.post('/terminationletter/', fd);
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
      await axiosInstance.delete(`/terminationletter/${id}/`);
      toast.success('Termination record deleted!');
      fetchTerminations();
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to delete termination record!');
    }
  }

  const filtered = terminations.filter(t =>
    t.driver_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.reason?.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Termination Management</h1>
        <button
          className="bg-red-700 hover:bg-red-600 px-4 py-2 rounded transition-colors duration-200"
          onClick={() => { resetForm(); setIsModalOpen(true); }}
        >
          + Add Termination
        </button>
      </div>

      <input
        type="text"
        className="w-full p-2 mb-4 bg-gray-800 rounded border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Search by driver or reason"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="overflow-x-auto rounded border border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-900 text-left text-gray-400">
            <tr>
              <th className="p-3">Driver</th>
              <th className="p-3">Date</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Generated Letter</th> {/* Changed column header */}
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-200 divide-y divide-gray-800">
            {paginated.length > 0 ? paginated.map(item => (
              <tr key={item.id} className="hover:bg-gray-800 transition-colors duration-150">
                <td className="p-3 font-medium">{item.driver_name}</td>
                <td className="p-3">{item.termination_date}</td>
                <td className="p-3">{item.reason.replace(/_/g, ' ')}</td>
                <td className="p-3">
                 {/* This is where the new component is used */}
                 {item.id && <DownloadTerminationLetter terminationId={item.id} />}
                 {/* You might also display the 'document' field here if it's for an uploaded document
                     and not the generated letter. For now, assuming generated letter. */}
                </td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-400 hover:text-red-300 transition-colors duration-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" className="p-4 text-center text-gray-500">No termination records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center space-x-2 mt-4">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {isModalOpen && (
        <Modal title={editingId ? 'Edit Termination Record' : 'Add Termination Record'} onClose={() => setIsModalOpen(false)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="driver-select" className="block text-sm font-medium text-gray-300 mb-1">Driver:</label>
              <select
                id="driver-select"
                name="driver" // Use 'driver' here to update the form state
                value={form.driver}
                onChange={handleChange}
                className="p-2 bg-gray-800 rounded w-full border border-gray-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Driver</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.driver_name}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="termination-date" className="block text-sm font-medium text-gray-300 mb-1">Termination Date:</label>
              <input
                id="termination-date"
                type="date"
                name="termination_date"
                value={form.termination_date}
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
                {REASONS.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="details-textarea" className="block text-sm font-medium text-gray-300 mb-1">Details (Optional):</label>
              <textarea
                id="details-textarea"
                name="details"
                value={form.details}
                onChange={handleChange}
                placeholder="Enter additional details about the termination..."
                rows="3"
                className="p-2 bg-gray-800 rounded w-full border border-gray-700 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="document-upload" className="block text-sm font-medium text-gray-300 mb-1">Upload Supporting Document (Optional):</label>
              <input
                id="document-upload"
                type="file"
                name="document"
                onChange={handleChange}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 cursor-pointer"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded w-full font-semibold transition-colors duration-200"
            >
              {editingId ? 'Update Termination' : 'Record Termination'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
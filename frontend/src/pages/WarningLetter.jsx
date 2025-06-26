import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance'; // Adjust path if necessary
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '../components/Model'; // Adjust path if necessary
import DownloadWarningLetter from './DownloadWarningLetter'; // Assuming this component is in the same directory or adjust path
// Ensure lucide-react is installed: npm install lucide-react
import { ChevronDown, CircleUserRound } from 'lucide-react';


export default function WarningLetters() {
  const [letters, setLetters] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
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
    'speeding',
    'reckless_driving',
    'unauthorized_route',
    'vehicle_damage',
    'late_delivery',
    'other',
  ];

  useEffect(() => {
    fetchLetters();
    fetchDrivers();
  }, []);

  const fetchLetters = async () => {
    try {
      const res = await axiosInstance.get('/warningletter/');
      const data = Array.isArray(res.data.results) ? res.data.results : res.data;
      const formattedData = data.map(item => ({
        ...item,
        driver_name: item.driver?.driver_name || 'N/A',
        driver_id: item.driver?.id || null,
        issued_by_name: item.issued_by?.username || item.issued_by?.email || 'N/A', // Handle potential 'username' error here too
        issued_by_id: item.issued_by?.id || null,
      }));
      setLetters(formattedData);
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
        await axiosInstance.patch(`/warningletter/${editingId}/`, formData);
        toast.success('Warning letter updated');
      } else {
        await axiosInstance.post('/warningletter/', formData);
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
      await axiosInstance.delete(`/warningletter/${id}/`);
      toast.success('Deleted successfully');
      fetchLetters();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Delete failed');
    }
  };

  const filteredLetters = letters.filter((l) =>
    l.driver_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.reason?.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filteredLetters.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredLetters.length / itemsPerPage);

  return (
    <div className="p-6 bg-white text-[#1E2022] min-h-screen">


{/* Header */}
        <header className="flex justify-between items-center pb-6 border-b border-gray-700 mb-8">
          <div className="text-sm text-[#52616B]">Organization / Warning Letters</div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-3 py-1 bg-[#284B63] hover:bg-[#52616B] text-[#FFFFFF] rounded-full text-sm  transition-colors">
              English <ChevronDown size={16} className="ml-1" />
            </button>
            <CircleUserRound size={24} className="text-[#1E2022]" />
          </div>
        </header>
        <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl text-[#187795] font-bold">Warning Letters</h1>
        <button
          className="bg-green-700 text-white px-4 py-2 rounded"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          + Issue Warning Letter
        </button>
      </div>

      <input
        type="text"
        className="w-full p-2 mb-4 bg-[#D9D9D9] text-[#353535] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Search by driver name or reason"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="overflow-x-auto rounded-lg border border-gray-700"> {/* Added border and rounded corners */}
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#284B63] text-white">
            <tr>
              <th className="p-3">Driver</th>
              <th className="p-3">Date</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Status</th>
              <th className="p-3">Generated Letter</th> {/* New column for PDF */}
              {/* <th className="p-3">Uploaded Document</th> */} {/* Optional: if you want to show manual upload */}
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length > 0 ? paginated.map((letter) => (
              <tr key={letter.id} className="border-t bg-[#C9D6DF] text-[#353535] border-gray-700 hover:bg-[#E0E7EB] transition-colors">
                <td className="p-3">{letter.driver_name}</td>
                <td className="p-3">{letter.issued_date}</td>
                {/* Solved: Added optional chaining for .reason before .replace() */}
                <td className="p-3">{letter.reason?.replace(/_/g, ' ') || ''}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      letter.status === 'active'
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {letter.status}
                  </span>
                </td>
                <td className="p-3">
                  {letter.id && <DownloadWarningLetter letterId={letter.id} />} {/* <<< INTEGRATE NEW COMPONENT */}
                </td>
                {/* <td className="p-3">
                  {letter.document && (
                    <a
                      href={letter.document}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      View Uploaded
                    </a>
                  )}
                </td> */}
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => handleEdit(letter)}
                    className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(letter.id)}
                    className="text-red-400 hover:text-red-300 transition-colors duration-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="6" className="p-4 text-center text-gray-500">No warning letters found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4 space-x-2">
        {[...Array(totalPages).keys()].map((num) => (
          <button
            key={num}
            className={`px-3 py-1 rounded ${
              currentPage === num + 1 ? 'bg-blue-600 text-white' : 'bg-gray-400 hover:bg-gray-300 text-gray-800' // Updated colors
            }`}
            onClick={() => setCurrentPage(num + 1)}
          >
            {num + 1}
          </button>
        ))}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <Modal
          title={editingId ? 'Edit Warning Letter' : 'Issue Warning Letter'}
          onClose={() => setIsModalOpen(false)}
        >
          <div className="grid gap-4">
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
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.driver_name}
                    </option>
                  ))}
                </select>
            </div>
            <div>
                <label htmlFor="issued-date" className="block text-sm font-medium text-gray-300 mb-1">Issued Date:</label>
                <input
                  id="issued-date"
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
                    <option key={r} value={r}>
                      {r.replace(/_/g, ' ')}
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
            <button
              onClick={handleSubmit}
              className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded mt-2 w-full font-semibold transition-colors duration-200"
            >
              {editingId ? 'Update Warning' : 'Issue Warning'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
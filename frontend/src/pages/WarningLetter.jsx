// File: WarningLetters.jsx
import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance'; // Reusable Axios instance
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import Modal from './Modal'; // Assume custom modal component

export default function WarningLetters() {
  const [letters, setLetters] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    driver: '',
    issued_date: '',
    reason: '',
    description: '',
    status: 'active',
    document: null
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
    'other'
  ];

  const fetchLetters = async () => {
    try {
      const res = await axiosInstance.get('/warningletter/');
      setLetters(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error('Failed to fetch warning letters');
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await axiosInstance.get('/Register/drivers/');
      setDrivers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error('Failed to fetch drivers');
    }
  };

  useEffect(() => {
    fetchLetters();
    fetchDrivers();
  }, []);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'document') {
      const file = files[0];
      if (file && file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed');
        return;
      }
      setForm({ ...form, document: file });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null) formData.append(key, value);
    });

    try {
      if (editingId) {
        await axiosInstance.put(`/warningletter/${editingId}/`, formData);
        toast.success('Warning letter updated');
      } else {
        await axiosInstance.post('/warningletter/', formData);
        toast.success('Warning letter issued');
      }
      resetForm();
      fetchLetters();
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Submission failed');
    }
  };

  const resetForm = () => {
    setForm({
      driver: '',
      issued_date: '',
      reason: '',
      description: '',
      status: 'active',
      document: null
    });
    setEditingId(null);
  };

  const handleEdit = (letter) => {
    setForm({
      driver: letter.driver,
      issued_date: letter.issued_date,
      reason: letter.reason,
      description: letter.description,
      status: letter.status,
      document: null
    });
    setEditingId(letter.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this warning letter?')) return;
    try {
      await axiosInstance.delete(`/warningletter/${id}/`);
      toast.success('Deleted successfully');
      fetchLetters();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const filteredLetters = letters.filter(l =>
    l.driver_name?.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filteredLetters.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredLetters.length / itemsPerPage);

  return (
    <div className="p-6 bg-black text-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Warning Letters</h1>
        <button
          className="bg-green-700 px-4 py-2 rounded"
          onClick={() => { resetForm(); setIsModalOpen(true); }}
        >
          + Issue Warning Letter
        </button>
      </div>

      <input
        type="text"
        className="w-full p-2 mb-4 bg-gray-800 border border-gray-600"
        placeholder="Search by driver name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-900">
            <tr>
              <th className="p-3">Driver</th>
              <th className="p-3">Date</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Status</th>
              <th className="p-3">Document</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(letter => (
              <tr key={letter.id} className="border-t border-gray-700">
                <td className="p-3">{letter.driver_name}</td>
                <td className="p-3">{letter.issued_date}</td>
                <td className="p-3">{letter.reason.replace(/_/g, ' ')}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${letter.status === 'active' ? 'bg-green-600' : 'bg-red-600'}`}>{letter.status}</span>
                </td>
                <td className="p-3">
                  {letter.document && (
                    <a
                      href={letter.document}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 underline"
                    >
                      View
                    </a>
                  )}
                </td>
                <td className="p-3 space-x-2">
                  <button onClick={() => handleEdit(letter)} className="text-blue-400">Edit</button>
                  <button onClick={() => handleDelete(letter.id)} className="text-red-400">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4 space-x-2">
        {[...Array(totalPages).keys()].map(num => (
          <button
            key={num}
            className={`px-3 py-1 rounded ${currentPage === num + 1 ? 'bg-blue-600' : 'bg-gray-700'}`}
            onClick={() => setCurrentPage(num + 1)}
          >
            {num + 1}
          </button>
        ))}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <Modal title={editingId ? 'Edit Warning Letter' : 'Issue Warning Letter'} onClose={() => setIsModalOpen(false)}>
          <div className="grid gap-3">
            <select name="driver" value={form.driver} onChange={handleChange} className="p-2 bg-gray-800">
              <option value="">Select Driver</option>
              {drivers.map(d => <option key={d.id} value={d.id}>{d.driver_name}</option>)}
            </select>
            <input type="date" name="issued_date" value={form.issued_date} onChange={handleChange} className="p-2 bg-gray-800" />
            <select name="reason" value={form.reason} onChange={handleChange} className="p-2 bg-gray-800">
              <option value="">Select Reason</option>
              {REASONS.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
            </select>
            <textarea name="description" value={form.description} onChange={handleChange} className="p-2 bg-gray-800" placeholder="Description" />
            <select name="status" value={form.status} onChange={handleChange} className="p-2 bg-gray-800">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <input type="file" name="document" onChange={handleChange} className="p-2 bg-gray-800" />
            <button onClick={handleSubmit} className="bg-blue-700 px-4 py-2 rounded mt-2">
              {editingId ? 'Update' : 'Submit'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

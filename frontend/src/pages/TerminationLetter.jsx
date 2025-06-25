import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '../components/Model';
import DownloadTerminationLetter from './DownloadTerminationLetter';

export default function Terminations() {
  const [terminations, setTerminations] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    driver: '',
    termination_date: '',
    reason: '',
    details: '',
    document: null,
    processed_by: 1,
    
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
      const data = Array.isArray(res.data.results) ? res.data.results : res.data;
      const formatted = data.map(item => ({
        ...item,
        driver_name: item.driver.driver_name,
        driver_id: item.driver.id,
        processed_by: item.processed_by.id,
      }));
      setTerminations(formatted);
    } catch (err) {
      toast.error('Failed to fetch terminations');
    }
  }

  async function fetchDrivers() {
    try {
      const res = await axiosInstance.get('/Register/drivers/');
      setDrivers(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
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
    if (!form.driver || !form.termination_date || !form.reason) {
      toast.error('Please fill required fields');
      return;
    }

    const fd = new FormData();
    fd.append('driver_id', form.driver);
    fd.append('termination_date', form.termination_date);
    fd.append('reason', form.reason);
    fd.append('details', form.details || '');
    fd.append('processed_by_id', form.processed_by);
    if (form.document) {
      fd.append('document', form.document);
    }

    try {
      if (editingId) {
        await axiosInstance.put(`/terminationletter/${editingId}/`, fd);
        toast.success('Termination updated');
      } else {
        await axiosInstance.post('/terminationletter/', fd);
        toast.success('Termination recorded');
      }
      resetForm();
      fetchTerminations();
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Submission failed');
    }
  }

  function resetForm() {
    setForm({
      driver: '',
      termination_date: '',
      reason: '',
      details: '',
      document: null,
      processed_by: 1,
    });
    setEditingId(null);
  }

  function handleEdit(item) {
    setForm({
      driver: item.driver_id,
      termination_date: item.termination_date,
      reason: item.reason,
      details: item.details || '',
      document: null,
      processed_by: item.processed_by,
    });
    setEditingId(item.id);
    setIsModalOpen(true);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this record?')) return;
    try {
      await axiosInstance.delete(`/terminationletter/${id}/`);
      toast.success('Deleted');
      fetchTerminations();
    } catch {
      toast.error('Delete failed');
    }
  }

  const filtered = terminations.filter(t =>
    t.driver_name?.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Termination Management</h1>
        <button
          className="bg-red-700 px-4 py-2 rounded"
          onClick={() => { resetForm(); setIsModalOpen(true); }}
        >
          + Add Termination
        </button>
      </div>

      <input
        type="text"
        className="w-full p-2 mb-4 bg-gray-800 rounded border border-gray-600"
        placeholder="Search by driver"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="overflow-x-auto rounded border border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-900 text-left text-gray-400">
            <tr>
              <th className="p-2">Driver</th>
              <th className="p-2">Date</th>
              <th className="p-2">Reason</th>
              <th className="p-2">Document</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-200">
            {paginated.length > 0 ? paginated.map(item => (
              <tr key={item.id} className="border-t border-gray-700 hover:bg-gray-800">
                <td className="p-2">{item.driver_name}</td>
                <td className="p-2">{item.termination_date}</td>
                <td className="p-2">{item.reason.replace(/_/g, ' ')}</td>
                <td className="p-2">

                 <DownloadTerminationLetter terminationId={item.id} />

                </td>
                <td className="p-2 space-x-2">
                  <button onClick={() => handleEdit(item)} className="text-blue-400">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-400">Delete</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" className="p-4 text-center text-gray-500">No records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center space-x-2 mt-4">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-600' : 'bg-gray-700'}`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {isModalOpen && (
        <Modal title={editingId ? 'Edit Termination' : 'Add Termination'} onClose={() => setIsModalOpen(false)}>
          <div className="space-y-3">
            <select name="driver" value={form.driver} onChange={handleChange} className="p-2 bg-gray-800 rounded w-full">
              <option value="">Select Driver</option>
              {drivers.map(d => <option key={d.id} value={d.id}>{d.driver_name}</option>)}
            </select>

            <input type="date" name="termination_date" value={form.termination_date} onChange={handleChange} className="p-2 bg-gray-800 rounded w-full" />

            <select name="reason" value={form.reason} onChange={handleChange} className="p-2 bg-gray-800 rounded w-full">
              <option value="">Select Reason</option>
              {REASONS.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
            </select>

            <textarea name="details" value={form.details} onChange={handleChange} placeholder="Details" className="p-2 bg-gray-800 rounded w-full" />

            <input type="file" name="document" onChange={handleChange} className="p-2 bg-gray-800 rounded w-full" />

            <button onClick={handleSubmit} className="mt-2 bg-blue-600 px-4 py-2 rounded w-full">
              {editingId ? 'Update' : 'Submit'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
// generated_letter
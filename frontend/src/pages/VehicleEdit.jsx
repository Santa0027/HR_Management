import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function VehicleEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState({
    vehicle_name: '',
    vehicle_number: '',
    vehicle_type: '',
    approval_status: '',
    insurance_number: '',
    insurance_expiry_date: '',
    Chassis_Number: '',
    service_date: '',
    rc_book_number: '',
    is_leased: false,
    image: null,
    insurance_document: null,
    rc_document: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:8000/vehicles/${id}/`)
      .then(res => {
        const data = res.data;
        setVehicle({
          ...data,
          insurance_expiry_date: data.insurance_expiry_date?.split('T')[0] || '',
          service_date: data.service_date?.split('T')[0] || '',
          image: null,
          insurance_document: null,
          rc_document: null,
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch failed:', err);
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setVehicle(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      setVehicle(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setVehicle(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    for (let key in vehicle) {
      if (vehicle[key] !== null) formData.append(key, vehicle[key]);
    }

    try {
      await axios.put(`http://localhost:8000/vehicles/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Vehicle updated successfully!');
      navigate(`/vehicles/${id}`);
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update vehicles.');
    }
  };

  if (loading) return <div className="text-white mt-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="mb-6 flex justify-between items-center">
        <Link to={`/vehicle-profile/${id}`} className="text-green-400 hover:text-green-300">
          ← Back to Profile
        </Link>
        <h1 className="text-2xl font-bold">Edit Vehicle</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900 p-6 rounded-lg shadow-md">
        {/* Text Inputs */}
        {[
          ['Vehicle Name', 'vehicle_name'],
          ['Vehicle Number', 'vehicle_number'],
          ['Vehicle Type', 'vehicle_type'],
          ['Approval Status', 'approval_status'],
          ['Insurance Number', 'insurance_number'],
          ['Chassis Number', 'Chassis_Number'],
          ['RC Book Number', 'rc_book_number'],
        ].map(([label, name]) => (
          <InputField
            key={name}
            label={label}
            name={name}
            value={vehicle[name]}
            onChange={handleChange}
          />
        ))}

        {/* Date Inputs */}
        <InputField label="Insurance Expiry Date" name="insurance_expiry_date" type="date" value={vehicle.insurance_expiry_date} onChange={handleChange} />
        <InputField label="Service Date" name="service_date" type="date" value={vehicle.service_date} onChange={handleChange} />

        {/* Checkbox */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="is_leased"
            checked={vehicle.is_leased}
            onChange={handleChange}
            className="form-checkbox text-green-500"
          />
          <label htmlFor="is_leased" className="text-sm">Is Leased?</label>
        </div>

        {/* File Uploads */}
        <FileInput label="Vehicle Image" name="image" onChange={handleChange} />
        <FileInput label="Insurance Document" name="insurance_document" onChange={handleChange} />
        <FileInput label="RC Book Document" name="rc_document" onChange={handleChange} />

        {/* Submit Button */}
        <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-md font-semibold">
          Save Changes
        </button>
      </form>
    </div>
  );
}

// Reusable Input
function InputField({ label, name, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white"
      />
    </div>
  );
}

// Reusable File Input
function FileInput({ label, name, onChange }) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-1">{label}</label>
      <input
        type="file"
        name={name}
        onChange={onChange}
        className="text-gray-300"
      />
    </div>
  );
}

export default VehicleEdit;

import React, { useState, useEffect } from 'react';

const AddDriverForm = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [vehicles, setVehicles] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [formData, setFormData] = useState({
    driver_name: '',
    gender: '',
    iqama: '',
    mobile: '',
    city: '',
    nationality: '',
    dob: '',
    vehicleType: '',
    company: '',
    documents: {
      iqama_document: null,
      iqama_expiry: '',
      passport_document: null,
      passport_expiry: '',
      license_document: null,
      license_expiry: '',
      visa_document: null,
      visa_expiry: '',
      medical_document: null,
      medical_expiry: '',
    },
  });

  useEffect(() => {
    fetch('http://localhost:8000/vehicles/')
      .then(res => res.json())
      .then(data => setVehicles(data))
      .catch(err => console.error('Vehicle error:', err));

    fetch('http://localhost:8000/company/')
      .then(res => res.json())
      .then(data => setCompanies(data))
      .catch(err => console.error('Company error:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [name]: files[0]
      }
    }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [name]: value
      }
    }));
  };

  const refreshAccessToken = async () => {
    const refresh = localStorage.getItem('refresh_token');
    const res = await fetch('http://localhost:8000/api/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await res.json();
    localStorage.setItem('access_token', data.access);
    return data.access;
  };

  const submitDriver = async (token, data) => {
    const response = await fetch('http://localhost:8000/Register/drivers/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: data,
    });

    return response;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'documents') {
        Object.entries(value).forEach(([docKey, docValue]) => {
          if (docValue) data.append(docKey, docValue);
        });
      } else {
        data.append(key, value);
      }
    });

    let token = localStorage.getItem('access_token');

    try {
      let res = await submitDriver(token, data);

      if (res.status === 401) {
        // Token might be expired
        token = await refreshAccessToken();
        res = await submitDriver(token, data);
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(JSON.stringify(errData));
      }

      const result = await res.json();
      alert('Driver added successfully!');
      console.log(result);
    } catch (err) {
      console.error('Error submitting driver:', err);
      alert('Failed to submit driver. Please log in again or check your data.');
    }
  };

  const infoTab = (
    <div className="grid gap-4">
      <input type="text" name="driver_name" value={formData.driver_name} onChange={handleChange} placeholder="Name" className="p-2 border rounded bg-gray-800 text-white" />
      <select name="gender" value={formData.gender} onChange={handleChange} className="p-2 border rounded bg-gray-800 text-white">
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>
      <input type="text" name="iqama" value={formData.iqama} onChange={handleChange} placeholder="Iqama Number" className="p-2 border rounded bg-gray-800 text-white" />
      <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Mobile Number" className="p-2 border rounded bg-gray-800 text-white" />
      <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" className="p-2 border rounded bg-gray-800 text-white" />
      <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} placeholder="Nationality" className="p-2 border rounded bg-gray-800 text-white" />
      <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="p-2 border rounded bg-gray-800 text-white" />
    </div>
  );

  const documentsTab = (
    <div className="grid gap-4">
      {[
        { label: 'Iqama', name: 'iqama_document', expiry: 'iqama_expiry' },
        { label: 'Passport', name: 'passport_document', expiry: 'passport_expiry' },
        { label: 'License', name: 'license_document', expiry: 'license_expiry' },
        { label: 'Visa', name: 'visa_document', expiry: 'visa_expiry' },
        { label: 'Medical', name: 'medical_document', expiry: 'medical_expiry' },
      ].map(({ label, name, expiry }) => (
        <div key={name}>
          <label className="block text-sm">{label} Document:</label>
          <input type="file" name={name} onChange={handleFileChange} className="p-2 border rounded bg-gray-800 text-white" />
          <label className="block text-sm">{label} Expiry:</label>
          <input type="date" name={expiry} value={formData.documents[expiry] || ''} onChange={handleDateChange} className="p-2 border rounded bg-gray-800 text-white" />
        </div>
      ))}

      <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="p-2 border rounded bg-gray-800 text-white mt-4">
        <option value="">Select Vehicle</option>
        {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_name}</option>)}
      </select>

      <select name="company" value={formData.company} onChange={handleChange} className="p-2 border rounded bg-gray-800 text-white">
        <option value="">Select Company</option>
        {companies.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
      </select>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6 bg-black text-white rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Add Driver</h2>

      <div className="flex space-x-4 mb-6">
        <button
          type="button"
          className={`px-4 py-2 rounded ${activeTab === 'info' ? 'bg-blue-700' : 'bg-gray-700'}`}
          onClick={() => setActiveTab('info')}
        >
          Driver Info
        </button>
        <button
          type="button"
          className={`px-4 py-2 rounded ${activeTab === 'documents' ? 'bg-blue-700' : 'bg-gray-700'}`}
          onClick={() => setActiveTab('documents')}
        >
          Documents & Assignment
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && activeTab !== 'documents') {
            const tag = e.target.tagName.toLowerCase();
            const type = e.target.type;
            if (!(tag === 'textarea' || type === 'file')) {
              e.preventDefault();
            }
          }
        }}
      >
        {activeTab === 'info' ? infoTab : documentsTab}

        {activeTab === 'documents' && (
          <div className="mt-6">
            <button type="submit" className="px-6 py-2 bg-green-600 rounded hover:bg-green-700">Submit</button>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddDriverForm;

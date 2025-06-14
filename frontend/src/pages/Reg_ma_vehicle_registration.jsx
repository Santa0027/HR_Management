import React, { useState } from 'react';
import axios from 'axios';
import axiosInstance from '../api/axiosInstance'

const Reg_ma_vehicle_registration = () => {
    const [formData, setFormData] = useState({
        vehicle_name: '',   
        vehicle_number: '',
        vehicle_type: 'CAR', // default
        image: null,
        insurance_number: '',
        insurance_document: null,
        insurance_expiry_date: '',
        service_date: '',
        rc_book_number: '',
        rc_document: null,
        is_leased: false,
        approval_status: 'PENDING', // default
    });

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'file') {
            setFormData({ ...formData, [name]: files[0] });
        } else if (type === 'checkbox') {
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const submitData = new FormData();
        for (const key in formData) {
            submitData.append(key, formData[key]);
        }

          try {
    await axiosInstance.post('/vehicles/', submitData);
    alert('Vehicle registered successfully!');
  } catch (error) {
    console.error("Error response:", error.response?.data);
    alert('Error registering vehicle.');
  }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-slate-800 text-white p-6 rounded-lg w-full max-w-3xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Register New Vehicle</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label>Vehicle Image Profile</label>
                    <input type="file" name="image" onChange={handleChange} className="mt-1 block w-full" />
                </div>

                <div>
                    <label>Vehicle Name</label>
                    <input type="text" name="vehicle_name" value={formData.vehicle_name} onChange={handleChange} className="w-full p-2 rounded bg-slate-700" />
                </div>

                <div>
                    <label>Vehicle Number</label>
                    <input type="text" name="vehicle_number" value={formData.vehicle_number} onChange={handleChange} className="w-full p-2 rounded bg-slate-700" />
                </div>

                {/* Vehicle Type */}
                <div>
                    <label>Vehicle Type</label>
                    <select
                        name="vehicle_type"
                        value={formData.vehicle_type}
                        onChange={handleChange}
                        className="w-full p-2 rounded bg-slate-700"
                    >
                        <option value="CAR">Car</option>
                        <option value="BIKE">Bike</option>
                        <option value="TRUCK">Truck</option>
                        <option value="BUS">Bus</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>

                <div>
                    <label>Insurance Number</label>
                    <input type="text" name="insurance_number" value={formData.insurance_number} onChange={handleChange} className="w-full p-2 rounded bg-slate-700" />
                </div>

                <div>
                    <label>Insurance Document</label>
                    <input type="file" name="insurance_document" onChange={handleChange} className="mt-1 block w-full" />
                </div>

                <div>
                    <label>Insurance Expiry Date</label>
                    <input type="date" name="insurance_expiry_date" value={formData.insurance_expiry_date} onChange={handleChange} className="w-full p-2 rounded bg-slate-700" />
                </div>

                <div>
                    <label>Service Date</label>
                    <input type="date" name="service_date" value={formData.service_date} onChange={handleChange} className="w-full p-2 rounded bg-slate-700" />
                </div>

                <div>
                    <label>RC Book Number</label>
                    <input type="text" name="rc_book_number" value={formData.rc_book_number} onChange={handleChange} className="w-full p-2 rounded bg-slate-700" />
                </div>

                <div>
                    <label>RC Document</label>
                    <input type="file" name="rc_document" onChange={handleChange} className="mt-1 block w-full" />
                </div>
            </div>

            <div className="mt-4">
                <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                    Add Vehicle
                </button>
            </div>
        </form>
    );
};

export default Reg_ma_vehicle_registration;

import React, { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import { useNavigate, useParams } from 'react-router-dom';

function UserEditForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', phone: '' });

  useEffect(() => {
    api.get(`users/${id}/`).then(res => setForm(res.data));
  }, [id]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    await api.put(`users/${id}/`, form);
    navigate('/users');
  };

  return (
    <div>   
      <h2>Edit User</h2>
      <form onSubmit={handleSubmit}>
        <input name="username" value={form.username} onChange={handleChange} placeholder="Username" />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
        <button type="submit">Update</button>
      </form>
    </div>
  );
}

export default UserEditForm;

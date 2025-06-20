// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService'; // Not default import

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await loginUser(credentials);

      console.log('Login success:', res);

      if (res?.access) {
        localStorage.setItem('accessToken', res.access); // ✅ Correct key
        localStorage.setItem('refreshToken', res.refresh);
        console.log('Navigating to dashboard...');
        navigate('/dashboard');
      } else {
        setError('Unexpected response from server.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label><br />
          <input type="email" name="email" value={credentials.email} onChange={handleChange} required />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label>Password:</label><br />
          <input type="password" name="password" value={credentials.password} onChange={handleChange} required />
        </div>
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
        <button type="submit" style={{ marginTop: '1rem' }}>Login</button>
      </form>
    </div>
  );
};

export default LoginPage;

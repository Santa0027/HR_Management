// src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost/api/token/';

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(API_URL, credentials);
    return response.data; // Make sure response.data is returned here
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
};

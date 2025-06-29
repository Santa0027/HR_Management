// src/services/authService.js
import axios from 'axios';

const API_URL = 'http://13.204.66.176:8000/api/token/';

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(API_URL, credentials);
    return response.data; // Make sure response.data is returned here
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
};

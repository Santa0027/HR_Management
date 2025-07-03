// src/services/authService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://43.204.238.225:8000";

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login/`, credentials);
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const refreshToken = async (refreshToken) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
      refresh: refreshToken
    });
    return response.data;
  } catch (error) {
    console.error("Token refresh failed:", error);
    throw error;
  }
};

export const getCurrentUser = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/me/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Get current user failed:", error);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register/`, userData);
    return response.data;
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
};

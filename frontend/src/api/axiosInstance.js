import axios from 'axios';

const baseURL = 'http://localhost:8000';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'multipart/form-data',
    accept: 'application/json',
  },
});

// Automatically refresh token on 401 errors
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const response = await axios.post(`${baseURL}/api/token/refresh/`, {
          refresh: localStorage.getItem('refresh_token'),
        });

        const newAccessToken = response.data.access;
        localStorage.setItem('access_token', newAccessToken);

        axiosInstance.defaults.headers['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token failed', refreshError);
        window.location.href = '/login'; // Optional: redirect to login
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

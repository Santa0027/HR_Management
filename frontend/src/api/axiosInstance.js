// src/api/axiosInstance.js (Updated with more logs)
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import dayjs from 'dayjs';

const API_BASE_URL = 'http://localhost:8000/';
const FRONTEND_LOGIN_URL = '/login';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
});

axiosInstance.interceptors.request.use(async (req) => {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    console.groupCollapsed(`Axios Interceptor: ${req.method.toUpperCase()} ${req.url}`);
    console.log("Current access_token in localStorage:", accessToken ? 'Exists' : 'Does NOT exist');
    if (accessToken) console.log("Decoded Access Token Payload (exp):", jwtDecode(accessToken).exp, "Current Time:", dayjs().unix());
    console.log("Current refresh_token in localStorage:", refreshToken ? 'Exists' : 'Does NOT exist');
    console.log("Is Login/Refresh Request:", req.url.includes('auth/login/') || req.url.includes('auth/token/refresh/'));


    // If no access token, or if it's a login/refresh request, just proceed
    if (!accessToken || req.url.includes('auth/login/') || req.url.includes('auth/token/refresh/')) {
        if (accessToken) {
            req.headers.Authorization = `Bearer ${accessToken}`;
            console.log("Setting Authorization header with existing token (for login/refresh or no refresh needed yet).");
        } else {
            console.warn("No access token found in localStorage. Not setting Authorization header.");
        }
        console.groupEnd();
        return req;
    }

    // Access token exists and it's not a login/refresh request, so check expiry
    let user;
    try {
        user = jwtDecode(accessToken);
    } catch (e) {
        console.error("Error decoding access token:", e);
        console.warn("Invalid access token in localStorage. Clearing tokens and redirecting to login.");
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = FRONTEND_LOGIN_URL;
        console.groupEnd();
        return Promise.reject(new Error('Invalid Access Token.'));
    }

    const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;
    console.log("Access token expired?", isExpired);

    if (!isExpired) {
        req.headers.Authorization = `Bearer ${accessToken}`;
        console.log("Access token is valid. Setting Authorization header.");
        console.groupEnd();
        return req;
    }

    // Access token is expired, try to refresh
    console.log("Access token expired. Attempting to refresh token...");
    if (refreshToken) {
        try {
            console.log("Sending refresh request to:", `${API_BASE_URL}/auth/token/refresh/`);
            const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
                refresh: refreshToken,
            });

            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh || refreshToken);

            req.headers.Authorization = `Bearer ${response.data.access}`;
            console.log("Token refreshed successfully. New Authorization header set.");
            console.groupEnd();
            return req;
        } catch (error) {
            console.error('Token refresh failed:', error.response?.data || error.message);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            console.warn('User session expired or refresh token invalid. Redirecting to login.');
            window.location.href = FRONTEND_LOGIN_URL;
            console.groupEnd();
            return Promise.reject(error);
        }
    } else {
        console.warn('No refresh token available. User needs to re-authenticate.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = FRONTEND_LOGIN_URL;
        console.groupEnd();
        return Promise.reject(new Error('Authentication required: No refresh token available.'));
    }
}, (error) => {
    console.error('Axios request error (before sending):', error);
    console.groupEnd();
    return Promise.reject(error);
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // This interceptor will catch the 401 response
        if (error.response && error.response.status === 401) {
            console.error('Axios Response 401 Error:', error.response.data.detail || 'Unauthorized');
            // If the 401 is *not* for the refresh token endpoint, and we couldn't refresh,
            // the request interceptor should have already redirected.
            // This case might mean a 401 for refresh endpoint itself, or a very fast expiry.
            // The request interceptor handles clearing tokens and redirecting for refresh failures.
        } else {
            console.error('Axios Response Error:', error);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
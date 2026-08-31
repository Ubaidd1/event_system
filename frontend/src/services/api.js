import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach bearer token if stored
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shaadi_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    if (error.response?.status === 401) {
      localStorage.removeItem('shaadi_token');
      localStorage.removeItem('shaadi_user');
    }
    return Promise.reject(new Error(message));
  }
);

export default api;

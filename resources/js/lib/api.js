import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor: attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nutrilogic_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle 401 errors (auto logout)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If 401 Unauthorized, token is invalid or expired
    if (error.response && error.response.status === 401) {
      // Clear auth data
      localStorage.removeItem('nutrilogic_token');
      localStorage.removeItem('nutrilogic_user');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/auth' && window.location.pathname !== '/') {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export default api;


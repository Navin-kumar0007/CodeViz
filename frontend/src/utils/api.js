import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically attach JWT token to all requests if present
API.interceptors.request.use(
  (config) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for universal 401 handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Session expired. Please log in again.');
      localStorage.removeItem('userInfo');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Surgical compatibility fix:
// When this object is used in a template literal like `${API}/path`,
// it will return the base URL string instead of "[object Object]" or "function..."
API.toString = () => API_BASE_URL;
API.toJSON = () => API_BASE_URL; // For JSON.stringify

export default API;
export { API, API_BASE_URL };

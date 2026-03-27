import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Surgical compatibility fix:
// When this object is used in a template literal like `${API}/path`,
// it will return the base URL string instead of "[object Object]" or "function..."
API.toString = () => API_BASE_URL;
API.toJSON = () => API_BASE_URL; // For JSON.stringify

export default API;
export { API_BASE_URL };

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext'
import { API as axios } from './utils/api';

// Global Axios Configuration
axios.defaults.withCredentials = true;

axios.interceptors.request.use((config) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  // Support legacy tokens if they exist
  if (userInfo && userInfo.token) {
    config.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  return config;
});

// Global Fetch Interceptor
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  if (!config) config = {};
  
  // Force cookies to be sent
  config.credentials = 'include';
  
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
  if (userInfo && userInfo.token) {
    config.headers = {
       ...config.headers,
       'Authorization': `Bearer ${userInfo.token}`
    };
  }
  
  return originalFetch(resource, config);
};

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('userInfo');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)

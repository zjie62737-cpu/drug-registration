import axios from 'axios';
import { message } from 'antd';

// In production, use relative URL (same origin). In dev, use localhost proxy.
const baseURL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

const api = axios.create({
  baseURL,
  timeout: 30000,
});

// Request interceptor - add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.error?.message || '网络错误';
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    message.error(msg);
    return Promise.reject(error);
  }
);

export default api;

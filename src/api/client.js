// api/client.js
import axios from 'axios';
import Config from 'react-native-config';
import { getToken, removeToken } from '../utils/storage'; // Adjust the import path to your store

const API_BASE_URL = Config.REACT_APP_API_URL || 'https://service.kkfinsure.org/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor – attach token from the global auth store
client.interceptors.request.use(
  async (config) => {
    // Read the current auth state from the Zustand store (sync)
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – handle 401 and clear auth state
client.interceptors.response.use(
  (response) => response.data, // Return only the `data` object
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Mark as retried to avoid infinite loops
      originalRequest._retry = true;
      // Clear the authentication state (this triggers a logout)
      await removeToken();
      // The useRequireAuth hook will automatically open the login modal
      // if the user is on a protected screen.
    }
    // Log the error for debugging (optional)
    console.log('API Error:', error);
    // Reject with a structured error object
    return Promise.reject(error.response?.data || { message: 'Network error' });
  }
);

export default client;
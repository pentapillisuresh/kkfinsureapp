// api/client.js
import axios from 'axios';
import Constants from 'expo-constants';
import { getToken, removeToken } from '../utils/storage';

// Get API URL from Constants or use default
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'https://service.kkfinsure.org/api';

console.log('API Base URL:', API_BASE_URL);

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor – attach token from storage
client.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.log('Error getting token:', error);
      return config;
    }
  },
  (error) => {
    console.log('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
client.interceptors.response.use(
  (response) => {
    return response.data || response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await removeToken();
        console.log('Session expired - please login again');
        // Optionally emit an event or navigate to login
      } catch (clearError) {
        console.log('Error clearing session:', clearError);
      }
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        success: false,
        message: 'Network error. Please check your internet connection.',
        status: 0,
      });
    }

    // Handle other errors
    const errorData = error.response.data || {};
    return Promise.reject({
      success: false,
      status: error.response.status,
      message: errorData.message || errorData.error || 'An unexpected error occurred',
      data: errorData,
    });
  }
);

export default client;
import axios from 'axios';
import CONFIG from './Config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: CONFIG.apiEndpoint,
});

// Request interceptor
api.interceptors.request.use(
  async request => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (token) {
        request.headers.Authorization = `JWT ${token}`;
      }

      console.log('================ API REQUEST ================');
      console.log('URL:', CONFIG.apiEndpoint + request.url);
      console.log('Method:', request.method);
      console.log('Token:', token);
      console.log('Headers:', request.headers);
      console.log('Params:', request.params);
      console.log('Body:', request.data);
      console.log('============================================');

      return request;
    } catch (error) {
      console.log('Interceptor Error:', error);
      return request;
    }
  },
  error => Promise.reject(error),
);

// Response interceptor
api.interceptors.response.use(
  response => {
    // console.log('================ API RESPONSE ================');
    // console.log('URL:', response.config.url);
    // console.log('Status:', response.status);
    // console.log('Response:', response.data);
    // console.log('=============================================');

    return response;
  },
  error => {
    // console.log('================ API ERROR ==================');
    // console.log('URL:', error?.config?.url);
    // console.log('Status:', error?.response?.status);
    // console.log('Error:', error?.response?.data || error.message);
    // console.log('=============================================');

    return Promise.reject(error);
  },
);

// ============================================
// Subscription API Methods
// ============================================

/**
 * Sync subscription receipt with backend
 */
export const syncSubscription = async (receiptData: {
  receipt: string;
  productId: string;
  transactionId: string;
}) => {
  try {
    const response = await api.post('/api/subscription/sync', receiptData);
    return response.data;
  } catch (error) {
    console.error('Sync subscription error:', error);
    throw error;
  }
};

/**
 * Get current subscription status from backend
 */
export const getSubscriptionStatus = async () => {
  try {
    const response = await api.get('/api/subscription/status');
    return response.data;
  } catch (error) {
    console.error('Get subscription status error:', error);
    throw error;
  }
};

/**
 * Cancel subscription (mark as cancelled in backend)
 */
export const cancelSubscription = async () => {
  try {
    const response = await api.post('/api/subscription/cancel');
    return response.data;
  } catch (error) {
    console.error('Cancel subscription error:', error);
    throw error;
  }
};

/**
 * Update subscription plan (upgrade/downgrade)
 */
export const updateSubscriptionPlan = async (planData: {
  newSku: string;
  transactionId: string;
  receipt: string;
}) => {
  try {
    const response = await api.post('/api/subscription/update', planData);
    return response.data;
  } catch (error) {
    console.error('Update subscription plan error:', error);
    throw error;
  }
};

export default api;

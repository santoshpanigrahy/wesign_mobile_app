import axios from "axios";
import CONFIG from "./Config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: CONFIG.apiEndpoint,
});

// Request interceptor
api.interceptors.request.use(
  async (request) => {
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
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // console.log('================ API RESPONSE ================');
    // console.log('URL:', response.config.url);
    // console.log('Status:', response.status);
    // console.log('Response:', response.data);
    // console.log('=============================================');

    return response;
  },
  (error) => {
    // console.log('================ API ERROR ==================');
    // console.log('URL:', error?.config?.url);
    // console.log('Status:', error?.response?.status);
    // console.log('Error:', error?.response?.data || error.message);
    // console.log('=============================================');

    return Promise.reject(error);
  }
);

export default api;


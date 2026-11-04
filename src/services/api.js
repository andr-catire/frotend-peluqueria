import axios from 'axios';
import { useAuthStore } from '../stores/auth.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const auth = useAuthStore();

  if (auth.token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${auth.token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const auth = useAuthStore();
      auth.logout();

      if (window.location.pathname !== '/login') {
        const actual = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        window.location.assign(`/login?redirect=${encodeURIComponent(actual)}`);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

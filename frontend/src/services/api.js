import axios from 'axios';

/**
 * Dynamically resolves the API base URL.
 * Automatically adapts between:
 *  1. Production deployments (via VITE_API_URL or same-origin /api)
 *  2. Mobile phones on local Wi-Fi / LAN (connects to laptop's IP:5000)
 *  3. Laptop / desktop development on localhost:5000
 */
export const getApiBaseUrl = () => {
  // 1. In browser environment, check if accessed on mobile phone / LAN IP
  if (typeof window !== 'undefined' && window.location) {
    const { hostname, protocol, port } = window.location;

    // Accessed on a mobile phone / external device via local LAN Wi-Fi (e.g., http://192.168.x.x:5173)
    // Localhost on mobile would refuse connection, so always route to the hosting machine's port 5000
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      if (port === '5173' || port === '3000' || port === '4173') {
        return `${protocol}//${hostname}:5000/api`;
      }
      // Production deployed domain (same-host API unless explicit external VITE_API_URL is configured)
      if (!import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL.includes('localhost')) {
        return `${protocol}//${hostname}${port && port !== '80' && port !== '443' ? `:${port}` : ''}/api`;
      }
    }
  }

  // 2. Explicit external Vite environment variable takes precedence if configured
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }

  // 3. Accessed locally on laptop/desktop development
  return 'http://localhost:5000/api';
};

/**
 * Returns the base server URL (without /api suffix) for static uploads.
 */
export const getServerBaseUrl = () => {
  const apiUrl = getApiBaseUrl();
  return apiUrl.replace(/\/api\/?$/, '');
};

/**
 * Resolves full URL for book cover images on any device.
 */
export const getCoverImageUrl = (coverImage, fallback = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600') => {
  if (!coverImage) return fallback;
  if (coverImage.startsWith('/uploads')) {
    return `${getServerBaseUrl()}${coverImage}`;
  }
  return coverImage;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to inject JWT token based on active session
api.interceptors.request.use(
  (config) => {
    // Check which token exists in localStorage
    const adminToken = localStorage.getItem('adminToken');
    const deliveryBoyToken = localStorage.getItem('deliveryBoyToken');
    const customerToken = localStorage.getItem('token');

    // Prefer token matching route if relevant, or active portal
    if (config.url && config.url.includes('/admin') && adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (config.url && (config.url.includes('/delivery-boy') || config.url.includes('/deliveries/delivery-boy')) && deliveryBoyToken) {
      config.headers.Authorization = `Bearer ${deliveryBoyToken}`;
    } else {
      const activeToken = customerToken || adminToken || deliveryBoyToken;
      if (activeToken) {
        config.headers.Authorization = `Bearer ${activeToken}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const message = error.response.data && error.response.data.message;
      if (message && message.includes('expired due to a recent password change')) {
        localStorage.clear();
        window.location.href = '/login?msg=session_expired';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

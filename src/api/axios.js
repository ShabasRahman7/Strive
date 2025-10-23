// import axios from 'axios';

// const api = axios.create({
//   baseURL: 'https://strive-backend-nv40.onrender.com',
// });

// export default api;
import axios from 'axios';

const BASE_URL = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

// Helper to read cookie value
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return undefined;
}

// Request interceptor - add CSRF 
api.interceptors.request.use(
  async (config) => {
    // Get CSRF token for state-changing requests
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
      // Prefer reading csrftoken cookie directly to avoid header mismatches
      const cookieToken = getCookie('csrftoken');
      if (cookieToken) {
        config.headers['X-CSRFToken'] = cookieToken;
      } else {
        try {
          const response = await axios.get(`${BASE_URL}/api/csrf-token/`, { withCredentials: true });
          config.headers['X-CSRFToken'] = response.data.csrfToken;
        } catch (error) {
          console.warn('Failed to get CSRF token:', error);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Skip refresh for specific endpoints to prevent infinite loops
      const skipRefreshEndpoints = ['/logout/', '/jwt/refresh/', '/login/', '/register/', '/profile/'];
      if (skipRefreshEndpoints.some(endpoint => originalRequest.url?.includes(endpoint))) {
        return Promise.reject(error);
      }
      
      // Only attempt refresh if we have a refresh token cookie
      const refreshToken = getCookie('refresh_token');
      if (!refreshToken) {
        return Promise.reject(error);
      }
      
      try {
        // refresh token using cookie stored one
        const response = await axios.post(`${BASE_URL}/api/auth/jwt/refresh/`, {}, {
          withCredentials: true
        });
        
        // If refresh successful, retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed so logout user
        // Clear user state and redirect to login without making API calls
        if (window.logoutUser) {
          // Clear user state immediately without making logout API call
          window.updateAuthUser && window.updateAuthUser(null);
          window.location.href = '/login';
        } else {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    console.error('[API Error]', error?.response?.status, error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
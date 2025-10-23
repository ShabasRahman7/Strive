// Secure token storage utility - only stores JWT tokens
export const tokenStorage = {
  // Store only JWT tokens
  setTokens: (accessToken, refreshToken) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      return true;
    } catch (error) {
      console.warn('Failed to store tokens:', error);
      return false;
    }
  },

  // Get access token
  getAccessToken: () => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return null;
      }
      return localStorage.getItem('access_token');
    } catch (error) {
      console.warn('Failed to get access token:', error);
      return null;
    }
  },

  // Get refresh token
  getRefreshToken: () => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return null;
      }
      return localStorage.getItem('refresh_token');
    } catch (error) {
      console.warn('Failed to get refresh token:', error);
      return null;
    }
  },

  // Clear all tokens
  clearTokens: () => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return true;
    } catch (error) {
      console.warn('Failed to clear tokens:', error);
      return false;
    }
  },

  // Check if user is authenticated (has valid tokens)
  isAuthenticated: () => {
    const accessToken = tokenStorage.getAccessToken();
    const refreshToken = tokenStorage.getRefreshToken();
    return !!(accessToken && refreshToken);
  }
};

// Legacy localStorage utilities (for theme, etc.)
export const safeLocalStorage = {
  getItem: (key) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return null;
      }
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage.getItem failed:', error);
      return null;
    }
  },
  
  setItem: (key, value) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('localStorage.setItem failed:', error);
      return false;
    }
  },
  
  removeItem: (key) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('localStorage.removeItem failed:', error);
      return false;
    }
  }
};

// Safe JSON parsing
export const safeJsonParse = (jsonString, fallback = null) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('JSON.parse failed:', error);
    return fallback;
  }
};

// Safe JSON stringify
export const safeJsonStringify = (obj, fallback = '{}') => {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.warn('JSON.stringify failed:', error);
    return fallback;
  }
};

import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import { safeLocalStorage } from "../utils/tokenStorage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip authentication check on certain pages
    const currentPath = window.location.pathname;
    const skipAuthPages = ['/setup-password', '/reset-password', '/forgot-password'];
    
    if (skipAuthPages.includes(currentPath)) {
      setLoading(false);
      return;
    }

    // Check if user is authenticated by trying to fetch profile
    // With cookie-based auth, we don't need to check localStorage
    const checkAuth = async () => {
      try {
        const res = await api.get(`/api/users/profile/`);
        const fetchedUser = res.data;

        if (fetchedUser.isBlocked) {
          // User is blocked, clear state without calling logout API
          setUser(null);
        } else {
          setUser(fetchedUser);
        }
      } catch (error) {
        // If profile fetch fails, user is not authenticated
        // This is expected for unauthenticated users, so don't log as error
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []); // Empty dependency array to run only once

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/users/login/', { email, password });
      const userData = res.data;

      if (userData.isBlocked) {
        throw new Error("Your account is blocked. Please contact support.");
      }

      // JWT tokens are automatically stored in HttpOnly cookies by the backend
      setUser(userData);
      return userData;
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      if (status === 404) {
        throw new Error('User not found. Please check your email or register.');
      }
      if (status === 401) {
        throw new Error('Invalid email or password.');
      }
      if (status === 400) {
        const detail = typeof data === 'string' ? data : (data?.error || 'Invalid request.');
        throw new Error(detail);
      }
      if (err?.message === 'Network Error' || !status) {
        throw new Error('Unable to reach server. Please try again later.');
      }
      throw new Error('Login failed. Please try again.');
    }
  };

  const register = async (email, password, name, confirmPassword) => {
    try {
      const res = await api.post('/api/users/register/', { 
        email, 
        password, 
        name, 
        confirm_password: confirmPassword 
      });
      const userData = res.data;
      
      // JWT tokens are automatically stored in HttpOnly cookies by the backend
      // No need to store tokens in localStorage
      setUser(userData);
      return userData;
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    // Clear user state immediately
    setUser(null);
    
    try {
      // Only call logout endpoint if we have cookies (user was authenticated)
      // This prevents unnecessary API calls when user is already logged out
      await api.post('/api/users/logout/');
    } catch (error) {
      // Silently ignore logout API errors since user is already logged out locally
      // This prevents console errors when user is not authenticated
      console.log('Logout API call failed (expected for unauthenticated users)');
    }
  };

  // Expose functions globally for axios interceptor
  useEffect(() => {
    window.updateAuthUser = setUser;
    window.logoutUser = logout;
    return () => {
      delete window.updateAuthUser;
      delete window.logoutUser;
    };
  }, []);

  const updateUser = async (newUserData) => {
    try {
      const res = await api.patch('/api/users/profile/', newUserData);
      const updatedUser = res.data;
      
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("Failed to update user:", error.message);
      throw error;
    }
  };

  const updateUserLocal = (newUserData) => {
    // Update local state without making API calls or storing in localStorage
    setUser(newUserData);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, register, updateUser, updateUserLocal }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

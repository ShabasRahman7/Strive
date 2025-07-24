import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();
const LOCAL_STORAGE_KEY = "auth_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      api.get(`/users/${parsed.id}`).then((res) => {
        setUser(res.data);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(res.data));
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.get(`/users?email=${email}`);
      const users = res.data;

      if (users.length === 0) throw new Error("User not found");

      const user = users[0];
      if (user.password !== password) throw new Error("Incorrect password");

      setUser(user);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
      return user;
    } catch (err) {
      throw err;
    }
  };

  const register = async (email, password, name) => {
    try {
      const res = await api.get(`/users?email=${email}`);
      const existing = res.data;

      if (existing.length > 0) throw new Error("Email already registered");

      const newUser = {
        email,
        password,
        name,
        role: "user",
        isBlocked:false,
        profileImage:
          "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
        addresses: [],
        cart: [],
        wishlist: [],
      };

      const createRes = await api.post(`/users`, newUser);
      const createdUser = createRes.data;

      setUser(createdUser);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(createdUser));
      return createdUser;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const updateUser = async (newUserData) => {
    try {
      const res = await api.patch(`/users/${newUserData.id}`, newUserData);
      const updatedUser = res.data;

      setUser(updatedUser);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error("Failed to update user:", error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, register, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

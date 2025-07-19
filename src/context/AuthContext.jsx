import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();
const LOCAL_STORAGE_KEY = "auth_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Track auth loading

  // Load user from localStorage on initial mount
  useEffect(() => {
    const savedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false); // ✅ Done loading
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`http://localhost:3001/users?email=${email}`);
    const users = await res.json();

    if (users.length === 0) throw new Error("User not found");

    const user = users[0];
    if (user.password !== password) throw new Error("Incorrect password");

    setUser(user);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
    return user;
  };

  const register = async (email, password) => {
    const res = await fetch(`http://localhost:3001/users?email=${email}`);
    const existing = await res.json();

    if (existing.length > 0) throw new Error("Email already registered");

    const newUser = {
      email,
      password,
      role: "user",
      cart: [],
      wishlist: [],
    };

    const createRes = await fetch(`http://localhost:3001/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    if (!createRes.ok) throw new Error("Failed to register");

    const createdUser = await createRes.json();
    setUser(createdUser);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(createdUser));
    return createdUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newUserData));
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

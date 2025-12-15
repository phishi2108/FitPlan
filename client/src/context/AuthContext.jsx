import { createContext, useState, useEffect } from "react";
import api from "../api"; // Your axios instance

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. THIS USEEFFECT RUNS ON REFRESH
  useEffect(() => {
    const checkLoggedIn = async () => {
      // Check if token exists in LocalStorage
      const token = localStorage.getItem("token");

      if (token) {
        try {
          // If token exists, verify it with backend to get user details
          const { data } = await api.get(
            "http://localhost:3000/user/getcurruser"
          );
          setUser(data);
        } catch (error) {
          // If token is invalid (expired), clear it
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  // 2. LOGIN FUNCTION
  const login = (token, userData) => {
    localStorage.setItem("token", token); // SAVE TO LOCAL STORAGE
    setUser(userData);
  };

  // 3. LOGOUT FUNCTION
  const logout = () => {
    localStorage.removeItem("token"); // CLEAR FROM LOCAL STORAGE
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // ADJUST PORT IF NEEDED
});

// Interceptor: Add Token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["x-auth-token"] = token; // Or 'Authorization': `Bearer ${token}` depending on your middleware
  }
  return config;
});

export default api;

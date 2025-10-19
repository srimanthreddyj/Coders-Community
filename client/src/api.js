import axios from "axios";

// Base URL from .env, fallback to localhost
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL + "/api",
  withCredentials: false, // we’re using JWT in headers, not cookies
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Optional: auto-logout on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized: clearing token");
      localStorage.removeItem("token");
      // You could redirect to /login here if needed
    }
    return Promise.reject(error);
  }
);

export default api;

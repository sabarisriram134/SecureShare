import axios from "axios";

const api = axios.create({
  baseURL: "/",
  timeout: 20000,
});

// Add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[API] Error:", error.response?.status, error.response?.data?.error || error.message);
    return Promise.reject(error);
  }
);

// Provide both default and named export so bundlers resolve correctly
export default api;
export { api };

import axios from "axios";

// Use environment variable if set, otherwise fall back to local dev
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export default apiClient;
export { API_URL };

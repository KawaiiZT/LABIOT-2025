import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.headers.common['Authorization'] = `Bearer ${import.meta.env.VITE_API_SECRET}`;

// const api = axios.create({
//   baseURL: import.meta.env.DEV
//     ? '/api'  // Use proxy in development
//     : import.meta.env.VITE_API_URL,  // Use direct URL in production
//   headers: {
//     'Content-Type': 'application/json',
//   }
// });

// api.interceptors.request.use(config => {
//   // Only add Authorization header if secret exists
//   if (import.meta.env.VITE_API_SECRET) {
//     config.headers.Authorization = `Bearer ${import.meta.env.VITE_API_SECRET}`;
//   }
//   return config;
// });

export default axios;

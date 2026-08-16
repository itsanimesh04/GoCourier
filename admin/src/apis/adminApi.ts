import axios from "axios";

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL + "/admin",
  withCredentials: true,
});

adminApi.defaults.withCredentials = true;

adminApi.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

adminApi.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401 && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default adminApi;

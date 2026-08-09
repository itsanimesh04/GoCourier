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

    // if (error.response?.status === 401 && !originalRequest._retry) {
    //   originalRequest._retry = true;

    //   try {
    //     await axios.post(
    //       `${import.meta.env.VITE_BACKEND_BASE_URL}/admin/refresh-token`,
    //       {},
    //       { withCredentials: true },
    //     );

    //     return adminApi(originalRequest);
    //   } catch (refreshError) {
    //     console.error("Token refresh failed:", refreshError);
    //   }
    // }

    return Promise.reject(error);
  },
);

export default adminApi;

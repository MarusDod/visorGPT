import axios from "axios";

export const axiosInstance = axios.create({
  withCredentials: true,
  adapter: "fetch",
});

axiosInstance.defaults.baseURL = import.meta.env.VITE_APP_BASE_URL;
axiosInstance.defaults.validateStatus = (status) =>
  status >= 200 && status <= 500;

axiosInstance.defaults.headers["post"]["Content-Type"] = "application/json";
axiosInstance.defaults.headers["common"]["Accept"] =
  "application/json; charset=utf-8";

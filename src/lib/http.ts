import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getSession } from 'next-auth/react';

const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
});


http.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const session = await getSession();
    const token = session?.accessToken;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

http.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
    }
    return Promise.reject(error);
  }
);

export default http;
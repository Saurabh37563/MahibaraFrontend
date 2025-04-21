import {
    authAccessToken,
    authRefreshToken,
    cookieExpirationDays,
  } from '@/constants/config-constant';
  import { USER_URL } from '@/constants/api-constant';
  import { CookieUtils } from '@/lib/helpers/index';
  import axios, {
    AxiosError,
    AxiosResponse,
    InternalAxiosRequestConfig,
  } from 'axios';
  
  const http = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  });
  
  http.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith(authAccessToken))
        ?.split('=')[1];
  
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
  
      return config; 
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  http.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        try {
          const refreshToken = document.cookie 
            .split('; ')
            .find((row) => row.startsWith(authRefreshToken))
            ?.split('=')[1];
          const response = await http.post(USER_URL.postGetAccessToken, {
            refreshToken,
          });
          CookieUtils.setCookie(
            authAccessToken,
            response.data.AccessToken,
            cookieExpirationDays
          );
          console.log('Access Token Refreshed', response);
          console.log('Access Token Refreshed', response);
          if (error.config) {
            return http.request(error.config);
          }
        } catch (refreshError) {
          console.error('Session Expired, Please log in again', refreshError);
          window.location.href = '/auth/user/login';
        }
      }
      return Promise.reject(error);
    }
  );
  
  export default http;
import http from "@/lib/http";
import { USER_AUTH_URL } from '@/constants/endpoints-constant';

export const authApi = {
  login: async (credentials: Record<string, unknown>) => {
    const response = await http.post(USER_AUTH_URL?.postLogin, credentials);
    return response.data;
  },
  logout: async () => {
    const response = await http.post(USER_AUTH_URL?.postLogout);
    return response.data;
  },
};

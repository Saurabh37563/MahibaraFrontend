import http from "@/lib/http";
import { USER_AUTH_URL } from '@/constants/endpoints-constant';
import { 
  AuthResponse, 
  LoginFormData, 
} from "@/types/auth-types";

const authService = {
  login: async (credentials: LoginFormData): Promise<AuthResponse> => {
    const response = await http.post(USER_AUTH_URL?.postLogin, credentials);
    const data = response.data;
    localStorage.setItem("token", data.token);
    return data;
  },


  logout: async (): Promise<void> => {
    await http.post(USER_AUTH_URL?.postLogout);
    localStorage.removeItem("token");
  },

};

export default authService;
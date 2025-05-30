import { authApi } from "./api/auth-api";
import { 
  AuthResponse, 
  LoginFormData, 
} from "@/types/auth-types";

const authService = {
  login: async (credentials: LoginFormData): Promise<AuthResponse> => {
    const data = await authApi.login(credentials);
    localStorage.setItem("token", data.token);
    return data;
  },


  logout: async (): Promise<void> => {
    await authApi.logout();
    localStorage.removeItem("token");
  },

};

export default authService;
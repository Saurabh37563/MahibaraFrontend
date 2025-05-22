import { authApi } from "./api/auth-api";
import { 
  AuthResponse, 
  LoginFormData, 
  User 
} from "@/types/auth-types";

const authService = {
  login: async (credentials: LoginFormData): Promise<AuthResponse> => {
    const data = await authApi.login(credentials);
    localStorage.setItem("token", data.token);
    return data;
  },

  getCurrentUser: async (): Promise<User> => {
    return await authApi.userData();
  },

  logout: async (): Promise<void> => {
    await authApi.logout();
    localStorage.removeItem("token");
  },

};

export default authService;
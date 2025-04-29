import { authApi } from "./api/auth-api";

const authService = {
  login: async (credentials:any) => {
    const data = await authApi.login(credentials);
    localStorage.setItem("token", data.token);
    return data;
  },

  getCurrentUser: async () => {
    return await authApi.userData();
  },

  logout: async () => {
    await authApi.logout();
    localStorage.removeItem("token");
  },
};

export default authService;

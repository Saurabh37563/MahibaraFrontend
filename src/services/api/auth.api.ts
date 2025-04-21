import http from "@/lib/http";

export const authApi = {
  login: async (credentials:any) => {
    const response = await http.post("/auth/login", credentials);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await http.get("/auth/me");
    return response.data;
  },

  logout: async () => {
    const response = await http.post("/auth/logout");
    return response.data;
  },
};

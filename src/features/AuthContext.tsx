import authService from "@/services/authService";
import { User } from "@/types/auth-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: unknown;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  // Get current user on mount
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: authService.getCurrentUser,
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
    retry: false,
  });

  // Set user when data changes
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
  }, [currentUser]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      setUser(data.user);
      queryClient.setQueryData(["currentUser"], data.user);
    },
  });

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    queryClient.clear();
  };

  const login = async (credentials: { email: string; password: string }) => {
    await loginMutation.mutateAsync(credentials);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading: isLoading || loginMutation.isPending,
    error: loginMutation.error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

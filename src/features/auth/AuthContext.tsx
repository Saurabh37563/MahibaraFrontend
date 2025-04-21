import { createContext, useContext } from "react";
import { useLogin, useLogout } from "./useAuthMutations";
import { useCurrentUser } from "./useAuthQueries";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }: { children: unknown }) => {
  const { data: user, isLoading: isLoadingUser } = useCurrentUser();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const login = async (credentials: unknown) => {
    await loginMutation.mutateAsync(credentials);
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading: isLoadingUser || loginMutation.isPending,
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

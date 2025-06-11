"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, UserSchema } from "@/types/user-types";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { getErrorMessage } from "@/utils/getErrorMassage";

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get NextAuth session
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    // First try to get user info from NextAuth session
    if (sessionStatus === "authenticated" && session) {
      // Extract token from session
      const sessionToken = session.accessToken as string;

      if (sessionToken) {
        setToken(sessionToken);

        // Create a user object from session data
        try {
          // Merge session.user with extra fields
          const userWithExtras = session.user as typeof session.user &
            SessionUserExtra;
          const sessionUser = {
            id: Number(userWithExtras.id) || 0, // Convert to number as required by User type
            name: userWithExtras.name ?? "",
            email: userWithExtras.email ?? "unknown@example.com",
            image: userWithExtras.image ?? null,
            designation: null, // Add missing required field
            organizationId: null,
            organizationName: null,
            userType:
              (userWithExtras.userType as "ADMIN" | "USER" | "SUPER_ADMIN") ??
              "USER",
            createdAt: null,
            updatedAt: null,
          };

          // Use proper validation with Zod schema
          const validatedUser = UserSchema.parse(sessionUser);
          setUser(validatedUser);

          // Optionally store in localStorage as backup
          localStorage.setItem("auth_token", sessionToken);
          localStorage.setItem("user", JSON.stringify(validatedUser));
        } catch (e) {
          console.error("Failed to validate session user data:", e);
          setError("Invalid session user data");
        }
      }
    } else if (sessionStatus === "unauthenticated") {
      // Fallback to localStorage if no session is available
      const storedToken = localStorage.getItem("auth_token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          const parsedUser = UserSchema.parse(JSON.parse(storedUser));
          setUser(parsedUser);
          setToken(storedToken);
        } catch (e: unknown) {
          const errorMessage = getErrorMessage(e, "Invalid user data stored");
          console.error("Failed to parse stored user data:", errorMessage);
          setError("Invalid user data stored");
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
        }
      }
    }

    // Set loading to false once we've checked both session and localStorage
    if (sessionStatus !== "loading") {
      setLoading(false);
    }
  }, [session, sessionStatus]);

  const logout = async () => {
    // Clear localStorage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");

    // Reset state
    setUser(null);
    setToken(null);

    // Use NextAuth signOut
    await nextAuthSignOut();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Add this interface for extra fields possibly present in session.user
interface SessionUserExtra {
  id?: string;
  firstName?: string;
  lastName?: string;
  loginName?: string;
  userType?: string;
}

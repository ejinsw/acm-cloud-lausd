"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { showNotification } from "@mantine/notifications";
import { getToken, refreshToken, logout } from "@/actions/authentication";
import { User } from "@/lib/types";
import { routes } from "@/app/routes";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch user data from API
  const fetchUserData = async (): Promise<User | null> => {
    try {
      const response = await fetch("/api/auth/me");

      if (response.ok) {
        const userData = await response.json();
        return userData;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  // Initialize authentication state - runs once on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await getToken();
        
        if (token) {
          const userData = await fetchUserData();
          if (userData) {
            setUser(userData);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []); // Empty dependency array - only run once

  // Refresh authentication
  const refreshAuth = async () => {
    try {
      const newToken = await refreshToken();
      if (newToken) {
        const userData = await fetchUserData();
        if (userData) {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error("Error refreshing auth:", error);
    }
  };

  // Login function
  const login = async (
    email: string,
    password: string
  ): Promise<User | null> => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // Fetch user data after successful login
        const userData = await fetchUserData();
        if (userData) {
          setUser(userData);
          showNotification({
            title: "Welcome back!",
            message: `Hello, ${userData.firstName}!`,
            color: "green",
          });
          return userData;
        }
      } else {
        const errorData = await response.json();
        showNotification({
          title: "Login failed",
          message: errorData.error || "Invalid credentials",
          color: "red",
        });
        console.log(errorData);
        if (errorData.error === "User is not confirmed") {
          router.push(
            `${routes.emailVerification}?email=${encodeURIComponent(email)}`
          );
        }
      }
      return null;
    } catch (error) {
      console.error("Login error:", error);
      showNotification({
        title: "Login failed",
        message: "An error occurred during login",
        color: "red",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      showNotification({
        title: "Logged out",
        message: "You have been successfully logged out",
        color: "blue",
      });
      router.push("/auth/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Update user data
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    const userData = await fetchUserData();
    if (userData) {
      setUser(userData);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout: handleLogout,
    refreshAuth,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Higher-order component for route protection (deprecated - use useRequireAuth hook instead)
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: "STUDENT" | "INSTRUCTOR" | "ADMIN"
) {
  return function ProtectedComponent(props: P) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // Redirect to login if not authenticated after loading
      if (!isLoading && !user) {
        router.push("/auth/sign-in");
      }
    }, [user, isLoading, router]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return null; // Will be redirected
    }

    if (requiredRole && user?.role !== requiredRole) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600">
              You don&apos;t have permission to access this page.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

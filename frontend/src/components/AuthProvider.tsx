"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { showNotification } from "@mantine/notifications";
import { getToken, refreshToken, logout } from "@/actions/authentication";
import { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  apiCallWithRefresh: (apiCall: () => Promise<unknown>, onRefreshSuccess?: () => void) => Promise<unknown>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/sessions",
  "/profile",
  "/instructor",
  "/help",
];

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check if current route requires authentication
  const isProtectedRoute = (path: string) => {
    return PROTECTED_ROUTES.some((route) => path.startsWith(route));
  };

  // Helper function to check if token is valid and not expired
  const isTokenValid = (token: string): boolean => {
    try {
      const tokenData = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return tokenData.exp > currentTime;
    } catch {
      return false;
    }
  };

  // Helper function to check if token expires soon (within 5 minutes)
  const isTokenExpiringSoon = (token: string): boolean => {
    try {
      const tokenData = JSON.parse(atob(token.split(".")[1]));
      const expiryTime = tokenData.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;
      return timeUntilExpiry < 5 * 60 * 1000; // 5 minutes
    } catch {
      return true; // If we can't parse the token, assume it's expiring soon
    }
  };

  // Fetch user data from API
  const fetchUserData = async (): Promise<User | null> => {
    try {
      const response = await fetch("/api/auth/me");

      if (response.ok) {
        const userData = await response.json();
        return userData;
      } else if (response.status === 401) {
        // Token is expired or invalid, return null to trigger refresh
        return null;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  // Initialize authentication state
  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();

      if (token && isTokenValid(token)) {
        const userData = await fetchUserData();
        if (userData) {
          setUser(userData);
        } else {
          // Token might be expired, try to refresh once before giving up
          try {
            await refreshAuth();
            // If refreshAuth succeeds, it will set the user
            // If it fails, it will handle logout and redirect
            return;
          } catch (refreshError) {
            console.error("Token refresh failed during initialization:", refreshError);
            await logout();
            router.push("/auth/sign-in");
          }
        }
      } else {
        // No token found or token is invalid, redirect to login
        router.push("/auth/sign-in");
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
      await logout();
      router.push("/auth/sign-in");
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  // Auto-refresh token
  const setupTokenRefresh = () => {
    const refreshInterval = setInterval(async () => {
      try {
        // Don't refresh if already refreshing
        if (isRefreshing) {
          return;
        }

        const token = await getToken();
        if (token && isTokenExpiringSoon(token)) {
          await refreshAuth();
        }
      } catch (error) {
        console.error("Error in token refresh:", error);
        // If there's an error checking the token, try to refresh
        if (!isRefreshing) {
          try {
            await refreshAuth();
          } catch (refreshError) {
            console.error("Failed to refresh token:", refreshError);
          }
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(refreshInterval);
  };

  // Refresh authentication
  const refreshAuth = async () => {
    // Prevent multiple simultaneous refresh attempts
    if (isRefreshing) {
      return;
    }

    try {
      setIsRefreshing(true);
      const newToken = await refreshToken();
      if (newToken) {
        // Token refreshed successfully, fetch updated user data
        const userData = await fetchUserData();
        if (userData) {
          setUser(userData);
          return;
        }
      }
      // If refresh failed or user data couldn't be fetched, logout
      await logout();
      router.push("/auth/sign-in");
    } catch (error) {
      console.error("Error refreshing auth:", error);
      await logout();
      router.push("/auth/sign-in");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
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
          return true;
        }
      } else {
        const errorData = await response.json();
        showNotification({
          title: "Login failed",
          message: errorData.error || "Invalid credentials",
          color: "red",
        });
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      showNotification({
        title: "Login failed",
        message: "An error occurred during login",
        color: "red",
      });
      return false;
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

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Setup token refresh after initialization
  useEffect(() => {
    if (isInitialized && user) {
      const cleanup = setupTokenRefresh();
      return cleanup;
    }
  }, [isInitialized, user]);

  // Route protection
  useEffect(() => {
    if (isInitialized && !isLoading) {
      if (!user && isProtectedRoute(pathname)) {
        // Redirect to login if accessing protected route without auth
        router.push("/auth/sign-in");
      } else if (
        user &&
        (pathname === "/auth/sign-in" || pathname === "/auth/sign-up")
      ) {
        // Redirect to dashboard if accessing public route while authenticated
        router.push("/dashboard/student");
      }
    }
  }, [isInitialized, isLoading, user, pathname, router]);

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
    apiCallWithRefresh: async (apiCall, onRefreshSuccess) => {
      try {
        const result = await apiCall();
        return result;
      } catch (error) {
        console.error("API call failed, attempting refresh:", error);
        // Don't refresh if already refreshing
        if (!isRefreshing) {
          try {
            await refreshAuth();
            const result = await apiCall();
            onRefreshSuccess?.();
            return result;
          } catch (refreshError) {
            console.error("Failed to refresh token and retry API call:", refreshError);
            await logout();
            router.push("/auth/sign-in");
            throw refreshError; // Re-throw the error after logout
          }
        } else {
          // If already refreshing, wait a bit and retry the original call
          await new Promise(resolve => setTimeout(resolve, 1000));
          return await apiCall();
        }
      }
    },
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

// Higher-order component for route protection
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: "STUDENT" | "INSTRUCTOR"
) {
  return function ProtectedComponent(props: P) {
    const { user, isLoading, isAuthenticated } = useAuth();

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

    if (!isAuthenticated) {
      return null; // Will be redirected by AuthProvider
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

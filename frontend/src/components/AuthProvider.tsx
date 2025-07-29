"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { showNotification } from '@mantine/notifications';
import { getToken, refreshToken, logout } from '@/actions/authentication';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'INSTRUCTOR';
  verified: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/sessions',
  '/profile',
  '/instructor',
  '/help',
];

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check if current route requires authentication
  const isProtectedRoute = (path: string) => {
    return PROTECTED_ROUTES.some(route => path.startsWith(route));
  };

  // Fetch user data from API
  const fetchUserData = async (): Promise<User | null> => {
    try {
      const response = await fetch('/api/auth/me');

      if (response.ok) {
        const userData = await response.json();
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Initialize authentication state
  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      
      if (token) {
        const userData = await fetchUserData();
        if (userData) {
          setUser(userData);
        } else {
          // Token is invalid, clear it
          await logout();
          router.push('/auth/sign-in');
        }
      } else {
        await logout();
        router.push('/auth/sign-in');
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      await logout();
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  // Auto-refresh token
  const setupTokenRefresh = () => {
    const refreshInterval = setInterval(async () => {
      try {
        const token = await getToken();
        if (token) {
          // Check if token is about to expire (refresh 5 minutes before expiry)
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          const expiryTime = tokenData.exp * 1000; // Convert to milliseconds
          const currentTime = Date.now();
          const timeUntilExpiry = expiryTime - currentTime;
          
          // If token expires in less than 5 minutes, refresh it
          if (timeUntilExpiry < 5 * 60 * 1000) {
            await refreshAuth();
          }
        }
      } catch (error) {
        console.error('Error in token refresh:', error);
      }
    }, 60000); // Check every minute

    return () => clearInterval(refreshInterval);
  };

  // Refresh authentication
  const refreshAuth = async () => {
    try {
              const newToken = await refreshToken();
        if (newToken) {
          const userData = await fetchUserData();
          if (userData) {
            setUser(userData);
            return;
          }
        }
      // If refresh failed, logout
      await logout();
    } catch (error) {
      console.error('Error refreshing auth:', error);
      await logout();
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // Fetch user data after successful login
        const userData = await fetchUserData();
        if (userData) {
          setUser(userData);
          showNotification({
            title: 'Welcome back!',
            message: `Hello, ${userData.firstName}!`,
            color: 'green',
          });
          return true;
        }
      } else {
        const errorData = await response.json();
        showNotification({
          title: 'Login failed',
          message: errorData.error || 'Invalid credentials',
          color: 'red',
        });
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      showNotification({
        title: 'Login failed',
        message: 'An error occurred during login',
        color: 'red',
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
        title: 'Logged out',
        message: 'You have been successfully logged out',
        color: 'blue',
      });
      router.push('/auth/sign-in');
    } catch (error) {
      console.error('Logout error:', error);
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
        router.push('/auth/sign-in');
      } else if (user && (pathname === '/auth/sign-in' || pathname === '/auth/sign-up')) {
        // Redirect to dashboard if accessing public route while authenticated
        router.push('/dashboard/student');
      }
    }
  }, [isInitialized, isLoading, user, pathname, router]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout: handleLogout,
    refreshAuth,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for route protection
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: 'STUDENT' | 'INSTRUCTOR'
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
            <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
            <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

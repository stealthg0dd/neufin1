import { useEffect, useState, createContext, useContext } from "react";
import { apiRequest } from "./queryClient";

// Types for our auth context
interface User {
  id: string;
  email: string;
  name: string;
  profileImageUrl: string;
  subscriptionTier?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider component that wraps the app and makes auth available
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if the user is authenticated on initial load
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        setIsLoading(true);
        const userData = await apiRequest<User | null>('/api/auth/user');
        setUser(userData);
      } catch (err) {
        // If API returns 401, the user is not authenticated
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userData = await apiRequest<User>('/api/auth/login', 'POST', {
        email,
        password
      });
      
      setUser(userData);
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Google login function
  const googleLogin = async () => {
    // For Google auth, we'll redirect to the OAuth endpoint
    window.location.href = '/api/login';
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      await apiRequest('/api/logout');
      setUser(null);
    } catch (err: any) {
      setError(err.message || 'Failed to logout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Provide the auth context value
  const contextValue = {
    user,
    isLoading,
    error,
    login,
    googleLogin,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
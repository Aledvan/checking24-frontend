import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { api, User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; errors?: Record<string, string> }>;
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string; errors?: Record<string, string> }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!api.getAccessToken()) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const result = await api.getMe();
      if (result.success && result.data) {
        setUser(result.data);
      } else {
        setUser(null);
        api.clearTokens();
      }
    } catch {
      setUser(null);
      api.clearTokens();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.login(email, password);

    if (result.success && result.data) {
      setUser(result.data.user);
      return { success: true };
    }

    return {
      success: false,
      error: result.error,
      errors: result.errors,
    };
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const result = await api.register(email, password, name);

    if (result.success && result.data) {
      setUser(result.data.user);
      return { success: true };
    }

    return {
      success: false,
      error: result.error,
      errors: result.errors,
    };
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

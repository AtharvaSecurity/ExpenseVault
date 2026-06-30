import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { User } from '@/types';
import { authApi } from '@/api/auth';
import { getErrorMessage } from '@/api/client';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setUser = useCallback((u: User) => {
    setUserState(u);
    localStorage.setItem('user', JSON.stringify(u));
  }, []);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('accessToken');
      const cachedUser = localStorage.getItem('user');
      if (token && cachedUser) {
        try {
          setUserState(JSON.parse(cachedUser));
          const freshUser = await authApi.me();
          setUser(freshUser);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          setUserState(null);
        }
      }
      setIsLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await authApi.login({ email, password });
        localStorage.setItem('accessToken', response.accessToken);
        setUser(response.user);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
    [setUser],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        const response = await authApi.register({ name, email, password });
        localStorage.setItem('accessToken', response.accessToken);
        setUser(response.user);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
    [setUser],
  );

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUserState(null);
    authApi.logout().catch(() => undefined);
  }, []);

  const refreshUser = useCallback(async () => {
    const freshUser = await authApi.me();
    setUser(freshUser);
  }, [setUser]);

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
        setUser,
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

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { tokenStorage, User } from "../api/authApi";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Load user data khi app khởi động
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      setIsLoading(true);
      const [storedToken, storedUser] = await Promise.all([
        tokenStorage.getToken(),
        tokenStorage.getUser(),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
    } catch (error) {
      console.error("Error loading stored auth:", error);
      // Clear corrupted data
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: User, authToken: string) => {
    try {
      setUser(userData);
      setToken(authToken);

      // Save to storage
      await Promise.all([
        tokenStorage.setToken(authToken),
        tokenStorage.setUser(userData),
      ]);
    } catch (error) {
      console.error("Error saving auth data:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setToken(null);

      // Clear storage
      await Promise.all([
        tokenStorage.removeToken(),
        tokenStorage.removeUser(),
      ]);
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      setUser(updatedUser);
      await tokenStorage.setUser(updatedUser);
    } catch (error) {
      console.error("Error updating user data:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

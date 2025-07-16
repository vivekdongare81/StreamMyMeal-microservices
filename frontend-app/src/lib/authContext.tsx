import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { userService, ProfileResponse } from '@/services';

interface AuthContextType {
  user: ProfileResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ProfileResponse | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (token && !userService.isTokenExpired(token)) {
      userService.getProfile(token)
        .then(profile => {
          setUser(profile);
          setIsAuthenticated(true);
        })
        .catch(() => {
          setUser(null);
          setIsAuthenticated(false);
          setToken(null);
          userService.logout();
        });
    } else {
      setUser(null);
      setIsAuthenticated(false);
      setToken(null);
      userService.logout();
    }
  }, [token]);

  const login = async (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const profile = await userService.getProfile(newToken);
    setUser(profile);
    setIsAuthenticated(true);
  };

  const logout = () => {
    userService.logout();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}; 
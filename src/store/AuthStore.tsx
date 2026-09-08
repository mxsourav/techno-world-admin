import { createContext, useContext, useState, type ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  login: (token: string, user?: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('tw_admin_token') || localStorage.getItem('tw_customer_token');
  });
  const [user, setUser] = useState<User | null>(null);

  const login = (token: string, userData?: User) => {
    const isAdmin = userData?.role === 'ADMIN' || userData?.role === 'SUPER_ADMIN';
    if (isAdmin) {
      localStorage.setItem('tw_admin_token', token);
    } else {
      localStorage.setItem('tw_customer_token', token);
    }
    setAccessToken(token);
    setUser(userData || null);
  };

  const logout = () => {
    localStorage.removeItem('tw_admin_token');
    localStorage.removeItem('tw_customer_token');
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ accessToken, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthStore() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthStore must be used within an AuthProvider');
  }
  return context;
}

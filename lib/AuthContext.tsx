'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = Cookies.get('kdbookbazaar_user');
    if (saved) {
      try { setUser(JSON.parse(saved) as User); }
      catch { Cookies.remove('kdbookbazaar_user'); }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.message || 'Login failed. Please check your credentials.');
    }

    const userData: User = {
      id: result.data.id,
      email: result.data.email,
      username: result.data.username,
      first_name: result.data.first_name || '',
      last_name: result.data.last_name || '',
    };

    setUser(userData);
    Cookies.set('kdbookbazaar_user', JSON.stringify(userData), { expires: 7 });
    Cookies.set('caishen_token', result.data.token, { expires: 7 });
  };

  const register = async (data: RegisterData) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || 'Registration failed. Please try again.');
    }

    // Auto-login after registration; propagate as LOGIN_FAILED so caller can redirect gracefully
    try {
      await login(data.username, data.password);
    } catch {
      throw new Error('ACCOUNT_CREATED_LOGIN_FAILED');
    }
  };

  const logout = () => {
    setUser(null);
    Cookies.remove('kdbookbazaar_user');
    Cookies.remove('caishen_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

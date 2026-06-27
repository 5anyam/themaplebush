'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone?: string;
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
  loginWithPhone: (userData: User) => void;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = Cookies.get('kdbookbazaar_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser) as User);
      } catch {
        Cookies.remove('kdbookbazaar_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const response = await fetch('https://cms.kdbookbazaar.com/wp-json/custom-api/v1/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Login failed. Please check your credentials.');
    }

    const userData: User = {
      id: result.data.id,
      email: result.data.email,
      username: result.data.username,
      first_name: result.data.first_name,
      last_name: result.data.last_name,
    };

    setUser(userData);
    Cookies.set('kdbookbazaar_user', JSON.stringify(userData), { expires: 7 });
    Cookies.set('caishen_token', result.data.token, { expires: 7 });
  };

  const loginWithPhone = (userData: User) => {
    setUser(userData);
    Cookies.set('kdbookbazaar_user', JSON.stringify(userData), { expires: 7 });
  };

  const register = async (data: RegisterData) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || 'Registration failed.');
    }

    const userData: User = result.user;
    setUser(userData);
    Cookies.set('kdbookbazaar_user', JSON.stringify(userData), { expires: 7 });
    if (result.token) {
      Cookies.set('caishen_token', result.token, { expires: 7 });
    }
  };

  const logout = () => {
    setUser(null);
    Cookies.remove('kdbookbazaar_user');
    Cookies.remove('caishen_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithPhone, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

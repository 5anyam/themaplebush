'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
// 👇 1. Yahan se 'registerCustomer' wapis import karo, lekin login hata do kyunki login hum plugin se kar rahe hain
import { registerCustomer } from './woocommerceApi'; 

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
    const savedUser = Cookies.get('kdbookbazaar_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser) as User);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        Cookies.remove('kdbookbazaar_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // Direct fetch to our new Custom Plugin
      const response = await fetch('https://cms.kdbookbazaar.com/wp-json/custom-api/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Login failed. Please check credentials.');
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

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // 👇 2. Register function updated (Ab 'data' use ho raha hai, error hat jayega)
  const register = async (data: RegisterData) => {
    try {
      console.log('Registering user:', data.username);
      
      // Purana register logic use karenge
      const newUser = await registerCustomer(data); 
      console.log('📝 Registration response:', newUser);
      
      // Register hone ke baad naye plugin se auto-login
      await login(data.username, data.password);
      
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
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
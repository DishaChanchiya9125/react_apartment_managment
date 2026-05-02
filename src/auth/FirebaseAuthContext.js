// Firebase Authentication Context
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/firebase-config';
import { onAuthChange } from '../firebase/services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const api = {
    user,
    loading,
    login: async ({ email, password }) => {
      const { login } = await import('../firebase/services/authService');
      return await login(email, password);
    },
    logout: async () => {
      const { logout } = await import('../firebase/services/authService');
      return await logout();
    },
    register: async ({ email, password, name }) => {
      const { register } = await import('../firebase/services/authService');
      return await register(email, password, name);
    }
  };

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ADMIN_EMAIL, ADMIN_PASSWORD, clearSession, loadSession, loadUsers, saveSession, saveUsers } from './authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadSession());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(loadSession());
    setLoading(false);
  }, []);

  const api = useMemo(() => {
    return {
      user,
      loading,
      login: ({ email, password }) => {
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const normalizedPassword = String(password || '');

        if (normalizedEmail === ADMIN_EMAIL && normalizedPassword === ADMIN_PASSWORD) {
          const session = { email: normalizedEmail, role: 'admin' };
          saveSession(session);
          setUser(session);
          return { ok: true };
        }

        const users = loadUsers();
        const existing = users.find((u) => u.email === normalizedEmail);
        if (!existing) return { ok: false, error: 'User not found. Please register.' };
        if (existing.password !== normalizedPassword) return { ok: false, error: 'Wrong password.' };

        const session = { email: existing.email, role: 'user' };
        saveSession(session);
        setUser(session);
        return { ok: true };
      },

      logout: () => {
        clearSession();
        setUser(null);
      },

      register: ({ email, password }) => {
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const normalizedPassword = String(password || '');

        if (!normalizedEmail || !normalizedPassword) {
          return { ok: false, error: 'Email and password are required.' };
        }
        if (normalizedEmail === ADMIN_EMAIL) {
          return { ok: false, error: 'This admin account is not for registration.' };
        }

        const users = loadUsers();
        const exists = users.some((u) => u.email === normalizedEmail);
        if (exists) return { ok: false, error: 'Email already registered. Please login.' };

        const nextUsers = [...users, { email: normalizedEmail, password: normalizedPassword, role: 'user' }];
        saveUsers(nextUsers);
        return { ok: true };
      },
    };
  }, [user, loading]);

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


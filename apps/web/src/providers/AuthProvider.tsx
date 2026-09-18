'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import type { User } from '@devroom/shared';

import { apiFetch } from '@/lib/api/client';

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(
      'accessToken',
    );

    if (!token) {
      setIsLoading(false);
      return;
    }

    setAccessToken(token);

    apiFetch<User>('/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('accessToken');
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  async function login(
    email: string,
    password: string,
  ) {
    const response =
      await apiFetch<{
        accessToken: string;
        user: User;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      });

    localStorage.setItem(
      'accessToken',
      response.accessToken,
    );

    setAccessToken(response.accessToken);
    setUser(response.user);
  }

  function logout() {
    localStorage.removeItem('accessToken');
    setAccessToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
        value={{
            user,
            accessToken,
            isLoading,
            login,
            logout,
        }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider',
    );
  }

  return context;
}
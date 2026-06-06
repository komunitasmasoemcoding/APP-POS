import { useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

interface AuthUser {
  id: string;
  username: string;
  role: string;
  permissions: string[];
}

export const getToken = (): string | null => localStorage.getItem('token');

export const getStoredUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const isTokenValid = (): boolean => {
  const token = getToken();
  if (!token) return false;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const useAuth = () => {
  const isAuthenticated = useMemo(() => isTokenValid(), []);
  const user = useMemo(() => getStoredUser(), []);

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) ?? false;
  };

  const isAdmin = (): boolean => {
    return user?.role === 'ADMIN' || hasPermission('manage_users');
  };

  return {
    isAuthenticated,
    user,
    hasPermission,
    isAdmin,
    logout,
  };
};

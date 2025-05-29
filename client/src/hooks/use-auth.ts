import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { authManager, type User, type AuthState } from '@/lib/auth';

export function useAuth() {
  const [, setLocation] = useLocation();
  const [authState, setAuthState] = useState<AuthState>(authManager.getState());

  useEffect(() => {
    const unsubscribe = authManager.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  const login = useCallback((user: User, token: string) => {
    authManager.login(user, token);
  }, []);

  const logout = useCallback(() => {
    authManager.logout();
    setLocation('/login');
  }, [setLocation]);

  const updateUser = useCallback((userData: Partial<User>) => {
    authManager.updateUser(userData);
  }, []);

  return {
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    login,
    logout,
    updateUser,
  };
}

export function useRequireAuth(redirectTo: string = '/login') {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation(redirectTo);
    }
  }, [isAuthenticated, redirectTo, setLocation]);

  return isAuthenticated;
}

export function useRequireAdmin(redirectTo: string = '/backoffice/login') {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation(redirectTo);
    } else if (user && user.role !== 'admin') {
      setLocation('/login');
    }
  }, [isAuthenticated, user, redirectTo, setLocation]);

  return isAuthenticated && user?.role === 'admin';
}

import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { initAuthListener } from '../services/authService';

export function useAuth() {
  const { user, session, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initAuthListener();
    return unsubscribe;
  }, []);

  return { user, session, isLoading, isAuthenticated };
}

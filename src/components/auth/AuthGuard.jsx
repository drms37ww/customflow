import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { isSupabaseConfigured } from '../../config/supabase';

export default function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuth();

  // If Supabase isn't configured, skip auth (local-only mode)
  if (!isSupabaseConfigured()) {
    return <Outlet />;
  }

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        color: 'var(--color-text-tertiary)',
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { isAdmin as checkAdmin } from './guards';

type Props = {
  children: React.ReactNode;
};

export function RequireAuth({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;

  return <>{children}</>;
}

export function RequireAdmin({ children }: Props) {
  const { session, isLoading } = useAuth();

  if (isLoading) return null;
  if (!session || !checkAdmin(session)) return <Navigate to="/" replace />;

  return <>{children}</>;
}

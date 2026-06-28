import { Navigate } from 'react-router-dom';

import { useAppSelector } from '@/store/hooks';

/** Auth-only guard — renders children when isAuthenticated, else redirects to /login. */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((s) => !!s.auth.user && !!s.auth.accessToken);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

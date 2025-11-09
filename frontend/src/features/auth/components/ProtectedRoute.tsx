import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';
import { Spinner } from '@/components/ui/Spinner';

export const ProtectedRoute = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const location = useLocation();

  if (!hasHydrated) {
    return (
      <div className="auth-gate">
        <Spinner />
      </div>
    );
  }

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

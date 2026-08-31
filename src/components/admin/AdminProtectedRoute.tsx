import { Navigate } from 'react-router';
import { useAuthStore } from '@/store/AuthStore';

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

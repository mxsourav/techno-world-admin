import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '@/store/AuthStore';

export default function AdminProtectedRoute() {
  const { accessToken } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

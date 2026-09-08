import { Navigate } from 'react-router';

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const adminToken = localStorage.getItem('tw_admin_token');

  let isAdmin = false;
  if (adminToken && adminToken.includes('.')) {
    try {
      const payload = JSON.parse(atob(adminToken.split('.')[1]));
      isAdmin = payload?.role === 'ADMIN' || payload?.role === 'SUPER_ADMIN';
    } catch {
      isAdmin = false;
    }
  }

  if (!adminToken || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

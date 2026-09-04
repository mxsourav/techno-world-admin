import { useEffect } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { StoreProvider } from '@/store/StoreContext';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import AdminLogin from '@/pages/admin/AdminLogin';
import Dashboard from '@/pages/admin/Dashboard';
import { AuthProvider, useAuthStore } from '@/store/AuthStore';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const titles: Record<string, string> = {
      '/': 'Admin Portal | Techno World Books',
      '/login': 'Admin Login | Techno World Books',
      '/admin/login': 'Admin Login | Techno World Books',
      '/admin/dashboard': 'Admin Dashboard | Techno World Books',
      '/dashboard': 'Admin Dashboard | Techno World Books',
    };
    if (titles[pathname]) document.title = titles[pathname];
  }, [pathname]);
  return null;
}

function KeepAlivePing() {
  useEffect(() => {
    const interval = setInterval(() => {
      const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || (import.meta.env.PROD ? 'https://techno-world-api-qw4j.onrender.com' : 'http://localhost:5000');
      fetch(`${baseUrl}/health`).catch(() => {});
    }, 14 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  return null;
}

function AdminPortal() {
  const { accessToken } = useAuthStore();

  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
      </Route>

      <Route
        path="/dashboard"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
      </Route>

      <Route
        path="/admin/dashboard"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
      </Route>

      <Route
        path="/"
        element={<Navigate to={accessToken ? "/admin/dashboard" : "/admin/login"} replace />}
      />
      <Route
        path="*"
        element={<Navigate to={accessToken ? "/admin/dashboard" : "/admin/login"} replace />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AuthProvider>
        <ScrollToTop />
        <KeepAlivePing />
        <Toaster position="top-center" richColors />
        <ErrorBoundary>
          <AdminPortal />
        </ErrorBoundary>
      </AuthProvider>
    </StoreProvider>
  );
}

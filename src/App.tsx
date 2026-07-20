import { useEffect } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router';
import { Toaster } from 'sonner';

import AdminLayout from '@/components/admin/AdminLayout';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import AdminLogin from '@/pages/admin/AdminLogin';
import Dashboard from '@/pages/admin/Dashboard';
import { AuthProvider } from '@/store/AuthStore';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const titles: Record<string, string> = {
      '/admin/login': 'Admin Login | Techno World Books',
      '/admin/dashboard': 'Admin Dashboard | Techno World Books',
    };
    if (titles[pathname]) document.title = titles[pathname];
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
        <ScrollToTop />
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route index element={<Dashboard />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
        <Toaster position="top-center" richColors />
      </div>
    </AuthProvider>
  );
}

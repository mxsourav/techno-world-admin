import { useEffect } from 'react';
import { Route, Routes, useLocation, Outlet, Navigate } from 'react-router';
import { MessageCircle } from 'lucide-react';
import { Toaster } from 'sonner';
import { StoreProvider } from '@/store/StoreContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Listing from '@/pages/Listing';
import Product from '@/pages/Product';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Wishlist from '@/pages/Wishlist';
import Account from '@/pages/Account';
import Track from '@/pages/Track';
import { BlogList, BlogPost } from '@/pages/Blog';
import Help from '@/pages/Help';
import About from '@/pages/About';

import AdminLayout from '@/components/admin/AdminLayout';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import AdminLogin from '@/pages/admin/AdminLogin';
import Dashboard from '@/pages/admin/Dashboard';
import { AuthProvider } from '@/store/AuthStore';
import OrderSuccess from '@/pages/OrderSuccess';
import MyOrders from '@/pages/MyOrders';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const titles: Record<string, string> = {
      '/': 'Techno World Books — Buy Books Online in India | School, College, Exam & Fiction',
      '/cart': 'Shopping Cart | Techno World Books',
      '/checkout': 'Secure Checkout | Techno World Books',
      '/wishlist': 'My Wishlist | Techno World Books',
      '/account': 'My Account | Techno World Books',
      '/track': 'Track Order | Techno World Books',
      '/blog': 'Book Lists & Study Guides | Techno World Books Blog',
      '/about': 'About Us | Techno World Books',
      '/help': 'Help Center | Techno World Books',
      '/admin/login': 'Admin Login | Techno World Books',
      '/admin/dashboard': 'Admin Dashboard | Techno World Books',
    };
    if (titles[pathname]) document.title = titles[pathname];
  }, [pathname]);
  return null;
}


function KeepAlivePing() {
  useEffect(() => {
    // Ping backend every 14 minutes to prevent Render free-tier sleep
    const interval = setInterval(() => {
      const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || '';
      fetch(`${baseUrl}/health`).catch(() => {});
    }, 14 * 60 * 1000); // 14 minutes
    
    return () => clearInterval(interval);
  }, []);
  
  return null;
}

function CustomerLayout() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {/* floating WhatsApp support */}
      <a
        href="https://wa.me/919876543210?text=Hi%20Techno%20World%20Books!%20I%20need%20help%20with%20my%20order."
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp Support"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition hover:scale-105 hover:bg-emerald-600"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AuthProvider>
        <ScrollToTop />
        <KeepAlivePing />
        <Toaster position="top-center" />
        <ErrorBoundary>
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
            </Route>

            {/* Customer Routes */}
            <Route element={<CustomerLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/category/:category" element={<Listing />} />
              <Route path="/search" element={<Listing />} />
              <Route path="/book/:slug" element={<Product />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/account" element={<Account />} />
              <Route path="/track" element={<Track />} />
              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/about" element={<About />} />
              <Route path="/help" element={<Help />} />
              <Route path="*" element={<Listing />} />
            </Route>
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </StoreProvider>
  );
}

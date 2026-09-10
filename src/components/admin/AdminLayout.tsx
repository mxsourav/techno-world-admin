import { toast } from 'sonner';
import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  Store,
  LogOut,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Star,
  BarChart3,
  ChevronRight,
  FolderOpen,
  FileEdit,
  Bell,
  Settings,
  AlertTriangle,
  Loader2,
  ArrowRight,
  CreditCard,
  Plus,
  CheckCircle2,
  XCircle,
  BookOpen,
  Search,
  Clock
} from 'lucide-react';
import { useAuthStore } from '@/store/AuthStore';
import { orderService, authService } from '@/services/api';
import { formatINR } from '@/utils/helpers';

const TABS = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', name: 'Products', icon: Package },
  { id: 'orders', name: 'Orders', icon: ShoppingCart },
  { id: 'payments', name: 'Payments', icon: CreditCard },
  { id: 'customers', name: 'Customers', icon: Users },
  { id: 'coupons', name: 'Coupons', icon: Tag },
  { id: 'reviews', name: 'Reviews', icon: Star },
  { id: 'media', name: 'Media Library', icon: FolderOpen },
  { id: 'cms', name: 'Homepage CMS', icon: FileEdit },
  { id: 'blog', name: 'Blog & Social Posts', icon: BookOpen },
  { id: 'analytics', name: 'Analytics & Trends', icon: BarChart3 },
  { id: 'settings', name: 'Settings & Email', icon: Settings },
];

export default function AdminLayout() {
  const { logout } = useAuthStore();
  // In-Place Session Unlock Dialog State (Prevents form data loss)
  const [isReAuthOpen, setIsReAuthOpen] = useState(false);
  const [reAuthPassword, setReAuthPassword] = useState('');
  const [isReAuthing, setIsReAuthing] = useState(false);

  useEffect(() => {
    const handleAuthExpired = () => {
      setIsReAuthOpen(true);
    };
    window.addEventListener('tw:admin-auth-expired', handleAuthExpired);
    return () => window.removeEventListener('tw:admin-auth-expired', handleAuthExpired);
  }, []);

  const handleReAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reAuthPassword) return;
    setIsReAuthing(true);
    try {
      const res = await authService.login({ email: 'admin', password: reAuthPassword });
      if (res.success) {
        const token = res.data?.accessToken || res.data?.token || '';
        const refreshToken = res.data?.refreshToken || '';
        if (token) localStorage.setItem('tw_admin_token', token);
        if (refreshToken) localStorage.setItem('tw_admin_refresh_token', refreshToken);
        setIsReAuthOpen(false);
        setReAuthPassword('');
        toast.success('Session verified! You can now save your form without losing any work.');
      } else {
        toast.error(res.message || 'Invalid admin password');
      }
    } catch (err: any) {
      toast.error(err.message || 'Re-authentication failed');
    } finally {
      setIsReAuthing(false);
    }
  };
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'dashboard';

  const [pendingCount, setPendingCount] = useState<number>(0);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [isProductsFlyoutOpen, setIsProductsFlyoutOpen] = useState<boolean>(false);
  const [productsFlyoutPos, setProductsFlyoutPos] = useState<{ top: number; left: number }>({ top: 0, left: 260 });
  const [isOrdersFlyoutOpen, setIsOrdersFlyoutOpen] = useState<boolean>(false);
  const [flyoutPos, setFlyoutPos] = useState<{ top: number; left: number }>({ top: 0, left: 260 });
  const [isPaymentsFlyoutOpen, setIsPaymentsFlyoutOpen] = useState<boolean>(false);
  const [paymentsFlyoutPos, setPaymentsFlyoutPos] = useState<{ top: number; left: number }>({ top: 0, left: 260 });
  const [isBlogFlyoutOpen, setIsBlogFlyoutOpen] = useState<boolean>(false);
  const [blogFlyoutPos, setBlogFlyoutPos] = useState<{ top: number; left: number }>({ top: 0, left: 260 });
  const notifRef = useRef<HTMLDivElement>(null);
  const productsBtnRef = useRef<HTMLDivElement>(null);
  const ordersBtnRef = useRef<HTMLDivElement>(null);
  const paymentsBtnRef = useRef<HTMLDivElement>(null);
  const blogBtnRef = useRef<HTMLDivElement>(null);
  const productsTimeoutRef = useRef<any>(null);
  const ordersTimeoutRef = useRef<any>(null);
  const paymentsTimeoutRef = useRef<any>(null);
  const blogTimeoutRef = useRef<any>(null);

  const handleProductsMouseEnter = () => {
    if (productsTimeoutRef.current) {
      clearTimeout(productsTimeoutRef.current);
      productsTimeoutRef.current = null;
    }
    if (productsBtnRef.current) {
      const rect = productsBtnRef.current.getBoundingClientRect();
      setProductsFlyoutPos({ top: Math.max(8, rect.top - 8), left: 252 });
    }
    setIsProductsFlyoutOpen(true);
  };

  const handleProductsMouseLeave = () => {
    productsTimeoutRef.current = setTimeout(() => {
      setIsProductsFlyoutOpen(false);
    }, 300);
  };

  const handleOrdersMouseEnter = () => {
    if (ordersTimeoutRef.current) {
      clearTimeout(ordersTimeoutRef.current);
      ordersTimeoutRef.current = null;
    }
    if (ordersBtnRef.current) {
      const rect = ordersBtnRef.current.getBoundingClientRect();
      setFlyoutPos({ top: Math.max(8, rect.top - 8), left: 252 });
    }
    setIsOrdersFlyoutOpen(true);
  };

  const handleOrdersMouseLeave = () => {
    ordersTimeoutRef.current = setTimeout(() => {
      setIsOrdersFlyoutOpen(false);
    }, 300);
  };

  const handlePaymentsMouseEnter = () => {
    if (paymentsTimeoutRef.current) {
      clearTimeout(paymentsTimeoutRef.current);
      paymentsTimeoutRef.current = null;
    }
    if (paymentsBtnRef.current) {
      const rect = paymentsBtnRef.current.getBoundingClientRect();
      setPaymentsFlyoutPos({ top: Math.max(8, rect.top - 8), left: 252 });
    }
    setIsPaymentsFlyoutOpen(true);
  };

  const handlePaymentsMouseLeave = () => {
    paymentsTimeoutRef.current = setTimeout(() => {
      setIsPaymentsFlyoutOpen(false);
    }, 300);
  };

  const handleBlogMouseEnter = () => {
    if (blogTimeoutRef.current) {
      clearTimeout(blogTimeoutRef.current);
      blogTimeoutRef.current = null;
    }
    if (blogBtnRef.current) {
      const rect = blogBtnRef.current.getBoundingClientRect();
      setBlogFlyoutPos({ top: Math.max(8, rect.top - 8), left: 252 });
    }
    setIsBlogFlyoutOpen(true);
  };

  const handleBlogMouseLeave = () => {
    blogTimeoutRef.current = setTimeout(() => {
      setIsBlogFlyoutOpen(false);
    }, 300);
  };

  const tabName = TABS.find(t => t.id === currentTab)?.name || 'Dashboard';

  const fetchNotifications = () => {
    orderService.getNotifications()
      .then((res: any) => {
        if (res.success) {
          setPendingCount(res.pendingCount || 0);
          setPendingOrders(res.pendingOrders || []);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    // Intelligent polling: 15s when active, paused when tab is hidden
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchNotifications();
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="apple-admin-theme flex h-screen overflow-hidden bg-black font-sans text-neutral-100">
      {/* Sidebar - Apple Frosted Glass with Traffic Lights */}
      <aside className="w-64 flex-shrink-0 bg-[#0d0d10]/90 backdrop-blur-2xl flex flex-col border-r border-white/[0.08] h-full relative z-30 overflow-x-hidden overflow-y-hidden shadow-2xl">
        {/* macOS Traffic Lights */}
        <div className="flex items-center gap-2 px-6 pt-5 pb-2">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/50 shadow-xs inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/50 shadow-xs inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/50 shadow-xs inline-block" />
        </div>

        <div className="px-6 py-4 flex items-center gap-3 border-b border-white/[0.08] flex-shrink-0">
          <div className="w-8 h-8 bg-white/[0.08] border border-white/[0.12] rounded-xl flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
            <Store className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-base leading-tight tracking-tight">Admin Portal</h2>
            <p className="text-xs text-neutral-400 font-medium">Techno World Books</p>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-5 px-3 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-2 px-3">Menu</div>
          {TABS.map((t) => {
            const isActive = currentTab === t.id || (t.id === 'analytics' && currentTab === 'reports');
            const isProductsTab = t.id === 'products';
            const isOrdersTab = t.id === 'orders';
            const isPaymentsTab = t.id === 'payments';
            const isBlogTab = t.id === 'blog';

            const activeTabClasses = 'bg-white/[0.14] text-white border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_8px_rgba(0,0,0,0.3)] backdrop-blur-md font-medium';
            const inactiveTabClasses = 'text-neutral-400 hover:text-white hover:bg-white/[0.06] border border-transparent font-normal';

            if (isProductsTab) {
              return (
                <div
                  key={t.id}
                  ref={productsBtnRef}
                  className="relative"
                  onMouseEnter={handleProductsMouseEnter}
                  onMouseLeave={handleProductsMouseLeave}
                >
                  <Link
                    to={`/admin/dashboard?tab=products`}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                      isActive ? activeTabClasses : inactiveTabClasses
                    }`}
                  >
                    <t.icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                    <span>{t.name}</span>
                  </Link>
                </div>
              );
            }

            if (isOrdersTab) {
              return (
                <div
                  key={t.id}
                  ref={ordersBtnRef}
                  className="relative"
                  onMouseEnter={handleOrdersMouseEnter}
                  onMouseLeave={handleOrdersMouseLeave}
                >
                  <Link
                    to={`/admin/dashboard?tab=orders&stage=to_accept`}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                      isActive ? activeTabClasses : inactiveTabClasses
                    }`}
                  >
                    <t.icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                    <span>{t.name}</span>
                    {pendingCount > 0 && (
                      <span className="ml-auto rounded-full bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 shadow-sm animate-pulse">
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                </div>
              );
            }

            if (isPaymentsTab) {
              return (
                <div
                  key={t.id}
                  ref={paymentsBtnRef}
                  className="relative"
                  onMouseEnter={handlePaymentsMouseEnter}
                  onMouseLeave={handlePaymentsMouseLeave}
                >
                  <Link
                    to={`/admin/dashboard?tab=payments&sub=overview`}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                      isActive ? activeTabClasses : inactiveTabClasses
                    }`}
                  >
                    <t.icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                    <span>{t.name}</span>
                  </Link>
                </div>
              );
            }

            if (isBlogTab) {
              return (
                <div
                  key={t.id}
                  ref={blogBtnRef}
                  className="relative"
                  onMouseEnter={handleBlogMouseEnter}
                  onMouseLeave={handleBlogMouseLeave}
                >
                  <Link
                    to={`/admin/dashboard?tab=blog`}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                      isActive ? activeTabClasses : inactiveTabClasses
                    }`}
                  >
                    <t.icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                    <span>{t.name}</span>
                  </Link>
                </div>
              );
            }

            return (
              <Link
                key={t.id}
                to={`/admin/dashboard?tab=${t.id}`}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                  isActive ? activeTabClasses : inactiveTabClasses
                }`}
              >
                <t.icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                <span>{t.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/[0.08] flex-shrink-0">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="h-4.5 w-4.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-black h-full">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 sm:px-8 bg-[#0a0a0c]/85 backdrop-blur-2xl border-b border-white/[0.08] flex-shrink-0 z-20 relative">
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm font-medium min-w-0 pr-4">
            <span className="text-neutral-400 shrink-0">Admin</span>
            <ChevronRight className="h-4 w-4 mx-1.5 text-neutral-600 shrink-0" />
            <span className="text-white font-semibold truncate max-w-[180px] lg:max-w-[260px]">{tabName}</span>
          </div>

          {/* Global Order Lookup Bar - Mathematically Locked in Absolute Center */}
          <div className="hidden md:flex items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-10">
            <div className="relative w-64 lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Lookup Order (e.g. #TW-1002)..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val) {
                      navigate(`/admin/dashboard?tab=orders&lookup=${encodeURIComponent(val)}`);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
                className="w-full rounded-full border border-white/[0.12] bg-white/[0.06] pl-9 pr-3 py-1.5 text-xs font-medium text-white placeholder-neutral-400 outline-none focus:border-white/[0.28] focus:bg-white/[0.10] focus:ring-1 focus:ring-white/[0.20] transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] backdrop-blur-md"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Interactive Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-2 rounded-full transition-all border border-white/[0.10] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ${
                  isNotifOpen ? 'bg-white/[0.16] text-white' : 'text-neutral-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12]'
                }`}
                title="Orders requiring review"
              >
                <Bell className="h-4.5 w-4.5" />
                {pendingCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white shadow animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-white/[0.12] bg-[#141418]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.12)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 text-white">
                  <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3 bg-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">Order Action Center</span>
                      {pendingCount > 0 && (
                        <span className="rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5">
                          {pendingCount} Pending
                        </span>
                      )}
                    </div>
                    <Link
                      to="/admin/dashboard?tab=orders"
                      onClick={() => setIsNotifOpen(false)}
                      className="text-xs font-semibold text-neutral-300 hover:text-white hover:underline"
                    >
                      View All
                    </Link>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.06]">
                    {pendingOrders.length === 0 ? (
                      <div className="p-8 text-center text-neutral-400">
                        <Bell className="mx-auto h-8 w-8 text-neutral-500 mb-2" />
                        <p className="text-xs font-medium">No pending orders. All caught up!</p>
                      </div>
                    ) : (
                      pendingOrders.map((ord: any) => {
                        const timeStr = ord.createdAt
                          ? new Date(ord.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '';
                        
                        const diffSec = ord.createdAt ? Math.floor((Date.now() - new Date(ord.createdAt).getTime()) / 1000) : 0;
                        const relTime = diffSec < 60 ? 'Just now' : diffSec < 3600 ? `${Math.floor(diffSec / 60)}m ago` : diffSec < 86400 ? `${Math.floor(diffSec / 3600)}h ago` : timeStr;

                        return (
                          <div key={ord.id} className="p-3.5 hover:bg-white/[0.04] transition-colors">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-xs text-white">#{ord.orderNumber}</span>
                              <span className="font-bold text-xs text-emerald-400">{formatINR(ord.totalAmount)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2 mt-0.5">
                              <p className="text-xs text-neutral-300 font-medium truncate">
                                Customer: <b className="text-white">{ord.address?.fullName || ord.user?.name || 'Customer'}</b>
                              </p>
                              <span className="text-[10px] font-medium text-neutral-400 shrink-0" title={timeStr}>
                                <Clock className="h-3 w-3 inline text-neutral-400 mr-1" />{relTime}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                              {ord.items?.map((i: any) => i.book?.title || 'Book').join(', ')}
                            </p>
                            <div className="mt-2 flex items-center justify-between pt-1 border-t border-white/[0.06]">
                              <span className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" /> Awaiting Approval
                              </span>
                              <button
                                onClick={() => {
                                  setIsNotifOpen(false);
                                  navigate('/admin/dashboard?tab=orders');
                                }}
                                className="flex items-center gap-1 text-[11px] font-semibold text-neutral-200 hover:text-white"
                              >
                                Review <ArrowRight className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-xs font-medium text-neutral-200 hover:text-white transition-all bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.10] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] px-3.5 py-1.5 rounded-full backdrop-blur-md"
            >
              <Store className="h-3.5 w-3.5" />
              View Store
            </a>

            <Link
              to="/admin/dashboard?tab=settings"
              className="w-8 h-8 rounded-full bg-white/[0.10] border border-white/[0.16] flex items-center justify-center text-xs font-semibold text-white hover:bg-white/[0.18] transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
              title="Admin Profile & Outbound Email Settings"
            >
              AD
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-black p-3 sm:p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
      {/* Floating Orders Hover Flyout */}
      {isOrdersFlyoutOpen && (
        <div
          style={{ top: `${flyoutPos.top}px`, left: `${flyoutPos.left}px` }}
          onMouseEnter={handleOrdersMouseEnter}
          onMouseLeave={handleOrdersMouseLeave}
          className="fixed w-56 rounded-2xl border border-white/[0.12] bg-[#141418]/95 backdrop-blur-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.12)] z-50 text-neutral-200 animate-in fade-in zoom-in-95 duration-100 before:absolute before:-left-6 before:top-0 before:bottom-0 before:w-6"
        >
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-white/[0.08] mb-1">
            Orders Pipeline
          </div>

          <Link
            to="/admin/dashboard?tab=orders&stage=to_accept"
            onClick={() => setIsOrdersFlyoutOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-neutral-200 hover:bg-white/[0.08] hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-3.5 w-3.5 text-blue-400" />
              Active Orders
            </span>
            {pendingCount > 0 && (
              <span className="rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold px-1.5 py-0.5">
                {pendingCount}
              </span>
            )}
          </Link>

          <Link
            to="/admin/dashboard?tab=orders&stage=returns"
            onClick={() => setIsOrdersFlyoutOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-neutral-200 hover:bg-white/[0.08] hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              Returns
            </span>
            <span className="text-[10px] text-neutral-500 font-semibold">0</span>
          </Link>

          <Link
            to="/admin/dashboard?tab=orders&stage=cancellations"
            onClick={() => setIsOrdersFlyoutOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-neutral-200 hover:bg-white/[0.08] hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <LogOut className="h-3.5 w-3.5 text-rose-400 rotate-180" />
              Cancellations
            </span>
            <span className="text-[10px] text-neutral-500 font-semibold">0</span>
          </Link>
        </div>
      )}

      {/* Floating Products Hover Flyout */}
      {isProductsFlyoutOpen && (
        <div
          style={{ top: `${productsFlyoutPos.top}px`, left: `${productsFlyoutPos.left}px` }}
          onMouseEnter={handleProductsMouseEnter}
          onMouseLeave={handleProductsMouseLeave}
          className="fixed w-64 rounded-2xl border border-white/[0.12] bg-[#141418]/95 backdrop-blur-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.12)] z-50 text-neutral-200 animate-in fade-in zoom-in-95 duration-100 before:absolute before:-left-6 before:top-0 before:bottom-0 before:w-6"
        >
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-white/[0.08] mb-1">
            Catalog & Inventory
          </div>

          <div className="space-y-0.5">
            <Link
              to="/admin/dashboard?tab=products&status=all"
              onClick={() => setIsProductsFlyoutOpen(false)}
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <Package className="h-3.5 w-3.5 text-neutral-300" />
                All Products (Catalog)
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=products&action=add"
              onClick={() => setIsProductsFlyoutOpen(false)}
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.10] transition-colors"
            >
              <span className="flex items-center gap-2">
                <Plus className="h-3.5 w-3.5 text-white" />
                Add New Product
              </span>
              <span className="bg-white/[0.20] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                + Add
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=products&status=published"
              onClick={() => setIsProductsFlyoutOpen(false)}
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Published Books
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=products&status=low_stock"
              onClick={() => setIsProductsFlyoutOpen(false)}
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                Low Stock Alerts
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=products&status=out_of_stock"
              onClick={() => setIsProductsFlyoutOpen(false)}
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <XCircle className="h-3.5 w-3.5 text-rose-400" />
                Out of Stock
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=products&status=draft"
              onClick={() => setIsProductsFlyoutOpen(false)}
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <FileEdit className="h-3.5 w-3.5 text-purple-400" />
                Draft Listings
              </span>
            </Link>
          </div>
        </div>
      )}

      {/* Floating Payments Hover Flyout */}
      {isPaymentsFlyoutOpen && (
        <div
          style={{ top: `${paymentsFlyoutPos.top}px`, left: `${paymentsFlyoutPos.left}px` }}
          onMouseEnter={handlePaymentsMouseEnter}
          onMouseLeave={handlePaymentsMouseLeave}
          className="fixed w-64 rounded-2xl border border-white/[0.12] bg-[#141418]/95 backdrop-blur-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.12)] z-50 text-neutral-200 animate-in fade-in zoom-in-95 duration-100 before:absolute before:-left-6 before:top-0 before:bottom-0 before:w-6"
        >
          <div className="space-y-0.5">
            <Link
              to="/admin/dashboard?tab=payments&sub=overview"
              onClick={() => setIsPaymentsFlyoutOpen(false)}
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors"
            >
              <span>Payments Overview</span>
            </Link>

            <Link
              to="/admin/dashboard?tab=payments&sub=earnings"
              onClick={() => setIsPaymentsFlyoutOpen(false)}
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors"
            >
              <span>Earnings Summary</span>
              <span className="bg-white/[0.15] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs tracking-wide">
                New
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=payments&sub=settlements"
              onClick={() => setIsPaymentsFlyoutOpen(false)}
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors"
            >
              <span>Search Order-wise Settlements</span>
            </Link>

            <Link
              to="/admin/dashboard?tab=payments&sub=transactions"
              onClick={() => setIsPaymentsFlyoutOpen(false)}
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors"
            >
              <span>Services Transaction History</span>
            </Link>

            <Link
              to="/admin/dashboard?tab=payments&sub=spf"
              onClick={() => setIsPaymentsFlyoutOpen(false)}
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors"
            >
              <span>Seller Protection Fund (SPF)</span>
            </Link>
          </div>
        </div>
      )}

      {/* Floating Blog Hover Flyout */}
      {isBlogFlyoutOpen && (
        <div
          style={{ top: `${blogFlyoutPos.top}px`, left: `${blogFlyoutPos.left}px` }}
          onMouseEnter={handleBlogMouseEnter}
          onMouseLeave={handleBlogMouseLeave}
          className="fixed w-64 rounded-2xl border border-white/[0.12] bg-[#141418]/95 backdrop-blur-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.12)] z-50 text-neutral-200 animate-in fade-in zoom-in-95 duration-100 before:absolute before:-left-6 before:top-0 before:bottom-0 before:w-6"
        >
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-white/[0.08] mb-1 flex items-center justify-between">
            <span>Blog & Social Feed</span>
            <span className="text-neutral-300 font-medium">Feed Manager</span>
          </div>

          <div className="space-y-0.5">
            <Link
              to="/admin/dashboard?tab=blog&filter=all"
              onClick={() => setIsBlogFlyoutOpen(false)}
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5 text-neutral-300" />
                All Posts & Social Feed
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=blog&action=new"
              onClick={() => setIsBlogFlyoutOpen(false)}
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.10] transition-colors"
            >
              <span className="flex items-center gap-2">
                <Plus className="h-3.5 w-3.5 text-white" />
                Create New Post
              </span>
              <span className="text-[10px] uppercase font-bold bg-white/[0.20] text-white px-1.5 py-0.5 rounded">
                + New
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=blog&filter=active"
              onClick={() => setIsBlogFlyoutOpen(false)}
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Active / Published
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=blog&filter=scheduled"
              onClick={() => setIsBlogFlyoutOpen(false)}
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                Scheduled Posts
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=blog&filter=expired"
              onClick={() => setIsBlogFlyoutOpen(false)}
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Expired & Archived
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=blog&filter=hidden"
              onClick={() => setIsBlogFlyoutOpen(false)}
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-neutral-500" />
                Hidden / Drafts
              </span>
            </Link>
          </div>
        </div>
      )}

      {/* Non-Disruptive In-Place Admin Re-Authentication Dialog */}
      {isReAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#16161b]/95 backdrop-blur-2xl shadow-2xl border border-white/[0.12] overflow-hidden text-white">
            <div className="bg-white/[0.05] border-b border-white/[0.08] p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/[0.10] border border-white/[0.12] flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-white">Session Re-Verification</h3>
                  <p className="text-xs text-neutral-400 font-medium">Your work is safe! Enter your password to continue.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleReAuthSubmit} className="p-6 space-y-4">
              <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                Your session timed out. Enter your admin password below to re-verify your session. Any open forms (including your book description, catalog changes, and order updates) will remain open with zero lost progress.
              </p>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">Admin Password</label>
                <input
                  type="password"
                  autoFocus
                  required
                  value={reAuthPassword}
                  onChange={(e) => setReAuthPassword(e.target.value)}
                  placeholder="Enter admin password..."
                  className="w-full rounded-xl border border-white/[0.12] bg-white/[0.06] px-3.5 py-2.5 text-xs font-medium text-white placeholder-neutral-500 outline-none focus:border-white/[0.30] focus:ring-1 focus:ring-white/[0.20]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsReAuthOpen(false)}
                  className="rounded-xl border border-white/[0.12] bg-white/[0.06] hover:bg-white/[0.12] px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white transition-all"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  disabled={isReAuthing || !reAuthPassword}
                  className="flex items-center gap-1.5 rounded-xl bg-white/[0.15] hover:bg-white/[0.22] border border-white/[0.20] px-5 py-2 text-xs font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] transition-all disabled:opacity-50"
                >
                  {isReAuthing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  <span>Unlock & Resume Work</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
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
  Image,
  Star,
  BarChart3,
  ChevronRight,
  FolderOpen,
  FileEdit,
  Bell,
  Settings,
  AlertTriangle,
  ArrowRight,
  CreditCard,
  Plus,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/AuthStore';
import { orderService } from '@/services/api';
import { formatINR } from '@/utils/helpers';

const TABS = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', name: 'Products', icon: Package },
  { id: 'orders', name: 'Orders', icon: ShoppingCart },
  { id: 'payments', name: 'Payments', icon: CreditCard },
  { id: 'customers', name: 'Customers', icon: Users },
  { id: 'coupons', name: 'Coupons', icon: Tag },
  { id: 'banners', name: 'Banners', icon: Image },
  { id: 'reviews', name: 'Reviews', icon: Star },
  { id: 'media', name: 'Media Library', icon: FolderOpen },
  { id: 'cms', name: 'Homepage CMS', icon: FileEdit },
  { id: 'analytics', name: 'Analytics & Trends', icon: BarChart3 },
  { id: 'settings', name: 'Settings & Email', icon: Settings },
];

export default function AdminLayout() {
  const { logout } = useAuthStore();
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
  const notifRef = useRef<HTMLDivElement>(null);
  const productsBtnRef = useRef<HTMLDivElement>(null);
  const ordersBtnRef = useRef<HTMLDivElement>(null);
  const paymentsBtnRef = useRef<HTMLDivElement>(null);
  const productsTimeoutRef = useRef<any>(null);
  const ordersTimeoutRef = useRef<any>(null);
  const paymentsTimeoutRef = useRef<any>(null);

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
    // Fast polling every 4 seconds for real-time order alerts
    const interval = setInterval(fetchNotifications, 4000);
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
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Sidebar - Dark/Premium */}
      <aside className="w-64 flex-shrink-0 bg-slate-950 flex flex-col border-r border-slate-900 h-full relative z-30 overflow-x-hidden overflow-y-hidden">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/50 flex-shrink-0">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/50">
            <Store className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">Admin Portal</h2>
            <p className="text-xs text-slate-400 font-medium">Techno World Books</p>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-4 space-y-1.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">Menu</div>
          {TABS.map((t) => {
            const isActive = currentTab === t.id || (t.id === 'analytics' && currentTab === 'reports');
            const isProductsTab = t.id === 'products';
            const isOrdersTab = t.id === 'orders';
            const isPaymentsTab = t.id === 'payments';

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
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      isActive 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <t.icon className={`h-4.5 w-4.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
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
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      isActive 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <t.icon className={`h-4.5 w-4.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>{t.name}</span>
                    {pendingCount > 0 && (
                      <span className="ml-auto rounded-full bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 shadow-sm animate-pulse">
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
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      isActive 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <t.icon className={`h-4.5 w-4.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>{t.name}</span>
                  </Link>
                </div>
              );
            }

            return (
              <Link
                key={t.id}
                to={`/admin/dashboard?tab=${t.id}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <t.icon className={`h-4.5 w-4.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{t.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/50 flex-shrink-0">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="h-4.5 w-4.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 h-full">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-200 flex-shrink-0 z-20 relative">
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm font-medium">
            <span className="text-slate-400">Admin</span>
            <ChevronRight className="h-4 w-4 mx-1.5 text-slate-300" />
            <span className="text-slate-900">{tabName}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Interactive Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-2 rounded-full transition-colors ${
                  isNotifOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
                title="Orders requiring review"
              >
                <Bell className="h-5 w-5" />
                {pendingCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white shadow animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">Order Action Center</span>
                      {pendingCount > 0 && (
                        <span className="rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2 py-0.5">
                          {pendingCount} Pending
                        </span>
                      )}
                    </div>
                    <Link
                      to="/admin/dashboard?tab=orders"
                      onClick={() => setIsNotifOpen(false)}
                      className="text-xs font-bold text-emerald-700 hover:underline"
                    >
                      View All
                    </Link>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {pendingOrders.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">
                        <Bell className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                        <p className="text-xs font-semibold">No pending orders. All caught up!</p>
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
                          <div key={ord.id} className="p-3.5 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-extrabold text-xs text-slate-900">#{ord.orderNumber}</span>
                              <span className="font-bold text-xs text-emerald-700">{formatINR(ord.totalAmount)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2 mt-0.5">
                              <p className="text-xs text-slate-600 font-medium truncate">
                                Customer: <b>{ord.address?.fullName || ord.user?.name || 'Customer'}</b>
                              </p>
                              <span className="text-[10px] font-semibold text-slate-400 shrink-0" title={timeStr}>
                                🕒 {relTime}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {ord.items?.map((i: any) => i.book?.title || 'Book').join(', ')}
                            </p>
                            <div className="mt-2 flex items-center justify-between pt-1 border-t border-slate-100">
                              <span className="text-[10px] text-amber-700 font-bold flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" /> Awaiting Approval
                              </span>
                              <button
                                onClick={() => {
                                  setIsNotifOpen(false);
                                  navigate('/admin/dashboard?tab=orders');
                                }}
                                className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
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
              className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-emerald-700 transition-colors bg-slate-100 hover:bg-emerald-50 px-3.5 py-1.5 rounded-full"
            >
              <Store className="h-4 w-4" />
              View Store
            </a>

            <Link
              to="/admin/dashboard?tab=settings"
              className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-xs font-bold text-emerald-800 hover:ring-2 hover:ring-emerald-500/20 transition-all cursor-pointer"
              title="Admin Profile & Outbound Email Settings"
            >
              AD
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-slate-50 p-6">
          <Outlet />
        </main>
      </div>
      {/* Floating Orders Hover Flyout */}
      {isOrdersFlyoutOpen && (
        <div
          style={{ top: `${flyoutPos.top}px`, left: `${flyoutPos.left}px` }}
          onMouseEnter={handleOrdersMouseEnter}
          onMouseLeave={handleOrdersMouseLeave}
          className="fixed w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-100 before:absolute before:-left-6 before:top-0 before:bottom-0 before:w-6"
        >
          <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
            Orders Pipeline
          </div>

          <Link
            to="/admin/dashboard?tab=orders&stage=to_accept"
            onClick={() => setIsOrdersFlyoutOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-3.5 w-3.5 text-blue-600" />
              Active Orders
            </span>
            {pendingCount > 0 && (
              <span className="rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold px-1.5 py-0.5">
                {pendingCount}
              </span>
            )}
          </Link>

          <Link
            to="/admin/dashboard?tab=orders&stage=returns"
            onClick={() => setIsOrdersFlyoutOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-amber-50 hover:text-amber-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              Returns
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">0</span>
          </Link>

          <Link
            to="/admin/dashboard?tab=orders&stage=cancellations"
            onClick={() => setIsOrdersFlyoutOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-rose-50 hover:text-rose-700 transition-colors"
          >
            <span className="flex items-center gap-2">
              <LogOut className="h-3.5 w-3.5 text-rose-600 rotate-180" />
              Cancellations
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">0</span>
          </Link>
        </div>
      )}

      {/* Floating Products Hover Flyout */}
      {isProductsFlyoutOpen && (
        <div
          style={{ top: `${productsFlyoutPos.top}px`, left: `${productsFlyoutPos.left}px` }}
          onMouseEnter={handleProductsMouseEnter}
          onMouseLeave={handleProductsMouseLeave}
          className="fixed w-64 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-2xl z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-100 before:absolute before:-left-6 before:top-0 before:bottom-0 before:w-6"
        >
          <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
            Catalog & Inventory
          </div>

          <div className="space-y-0.5">
            <Link
              to="/admin/dashboard?tab=products&status=all"
              onClick={() => setIsProductsFlyoutOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Package className="h-3.5 w-3.5 text-emerald-600" />
                All Products (Catalog)
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=products&action=add"
              onClick={() => setIsProductsFlyoutOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Plus className="h-3.5 w-3.5 text-emerald-600" />
                Add New Product
              </span>
              <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                + Add
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=products&status=published"
              onClick={() => setIsProductsFlyoutOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                Published Books
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=products&status=low_stock"
              onClick={() => setIsProductsFlyoutOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-800 transition-colors"
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                Low Stock Alerts
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=products&status=out_of_stock"
              onClick={() => setIsProductsFlyoutOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-800 transition-colors"
            >
              <span className="flex items-center gap-2">
                <XCircle className="h-3.5 w-3.5 text-rose-600" />
                Out of Stock
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=products&status=draft"
              onClick={() => setIsProductsFlyoutOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <span className="flex items-center gap-2">
                <FileEdit className="h-3.5 w-3.5 text-purple-600" />
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
          className="fixed w-64 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-2xl z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-100 before:absolute before:-left-6 before:top-0 before:bottom-0 before:w-6"
        >
          <div className="space-y-0.5">
            <Link
              to="/admin/dashboard?tab=payments&sub=overview"
              onClick={() => setIsPaymentsFlyoutOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <span>Payments Overview</span>
            </Link>

            <Link
              to="/admin/dashboard?tab=payments&sub=earnings"
              onClick={() => setIsPaymentsFlyoutOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <span>Earnings Summary</span>
              <span className="bg-[#c2185b] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs tracking-wide">
                New
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=payments&sub=settlements"
              onClick={() => setIsPaymentsFlyoutOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <span>Search Order-wise Settlements</span>
            </Link>

            <Link
              to="/admin/dashboard?tab=payments&sub=transactions"
              onClick={() => setIsPaymentsFlyoutOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <span>Services Transaction History</span>
            </Link>

            <Link
              to="/admin/dashboard?tab=payments&sub=spf"
              onClick={() => setIsPaymentsFlyoutOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <span>Seller Protection Fund (SPF)</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
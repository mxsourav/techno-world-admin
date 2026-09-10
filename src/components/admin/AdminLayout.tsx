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
  Clock,
  Sun,
  Moon,
  MessageSquare,
  PanelLeft,
} from 'lucide-react';
import { useAuthStore } from '@/store/AuthStore';
import { orderService, authService } from '@/services/api';
import { formatINR } from '@/utils/helpers';

export const TAB_SECTIONS = [
  {
    title: 'Favorites',
    tabs: [
      { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
      { id: 'orders', name: 'Orders', icon: ShoppingCart },
      { id: 'products', name: 'Products', icon: Package },
      { id: 'payments', name: 'Payments', icon: CreditCard },
    ],
  },
  {
    title: 'Store & Content',
    tabs: [
      { id: 'customers', name: 'Customers', icon: Users },
      { id: 'coupons', name: 'Coupons', icon: Tag },
      { id: 'reviews', name: 'Reviews', icon: Star },
      { id: 'media', name: 'Media Library', icon: FolderOpen },
      { id: 'cms', name: 'Homepage CMS', icon: FileEdit },
      { id: 'blog', name: 'Blog & Social Feed', icon: BookOpen },
    ],
  },
  {
    title: 'System',
    tabs: [
      { id: 'analytics', name: 'Analytics & Trends', icon: BarChart3 },
      { id: 'settings', name: 'Settings & Email', icon: Settings },
    ],
  },
];

const TABS = TAB_SECTIONS.flatMap((section) => section.tabs);

export default function AdminLayout() {
  const { logout } = useAuthStore();
  // In-Place Session Unlock Dialog State (Prevents form data loss)
  const [isReAuthOpen, setIsReAuthOpen] = useState(false);
  const [reAuthPassword, setReAuthPassword] = useState('');
  const [isReAuthing, setIsReAuthing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try { return localStorage.getItem('tw_admin_dark_mode') === 'true'; } catch { return false; }
  });
  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      try { localStorage.setItem('tw_admin_dark_mode', String(next)); } catch {}
      return next;
    });
  };

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
  const currentStage = searchParams.get('stage') || 'to_accept';
  const currentStatus = searchParams.get('status') || 'all';
  const currentAction = searchParams.get('action') || '';
  const currentSub = searchParams.get('sub') || 'overview';
  const currentFilter = searchParams.get('filter') || 'all';

  const [pendingCount, setPendingCount] = useState<number>(0);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  type ActiveFlyout = 'products' | 'orders' | 'payments' | 'blog' | 'coupons' | 'reviews' | null;
  const [activeFlyout, setActiveFlyout] = useState<ActiveFlyout>(null);
  const [flyoutPos, setFlyoutPos] = useState<{ top: number; left: number }>({ top: 0, left: 252 });
  const flyoutTimerRef = useRef<any>(null);

  const notifRef = useRef<HTMLDivElement>(null);
  const productsBtnRef = useRef<HTMLDivElement>(null);
  const ordersBtnRef = useRef<HTMLDivElement>(null);
  const paymentsBtnRef = useRef<HTMLDivElement>(null);
  const blogBtnRef = useRef<HTMLDivElement>(null);
  const couponsBtnRef = useRef<HTMLDivElement>(null);
  const reviewsBtnRef = useRef<HTMLDivElement>(null);

  const openFlyout = (flyout: ActiveFlyout, btnRef: React.RefObject<HTMLDivElement | null>) => {
    if (flyoutTimerRef.current) {
      clearTimeout(flyoutTimerRef.current);
      flyoutTimerRef.current = null;
    }
    if (btnRef && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setFlyoutPos({ top: Math.max(8, rect.top - 8), left: 252 });
    }
    setActiveFlyout(flyout);
  };

  const closeFlyoutWithDelay = () => {
    if (flyoutTimerRef.current) {
      clearTimeout(flyoutTimerRef.current);
    }
    flyoutTimerRef.current = setTimeout(() => {
      setActiveFlyout(null);
    }, 160);
  };

  const keepFlyoutOpen = () => {
    if (flyoutTimerRef.current) {
      clearTimeout(flyoutTimerRef.current);
      flyoutTimerRef.current = null;
    }
  };

  const closeFlyoutImmediately = () => {
    if (flyoutTimerRef.current) {
      clearTimeout(flyoutTimerRef.current);
      flyoutTimerRef.current = null;
    }
    setActiveFlyout(null);
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

  const flyoutRefMap: Record<string, React.RefObject<HTMLDivElement | null>> = {
    products: productsBtnRef,
    orders: ordersBtnRef,
    payments: paymentsBtnRef,
    blog: blogBtnRef,
    coupons: couponsBtnRef,
    reviews: reviewsBtnRef,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Sidebar - Apple macOS Authentic Frosted Glass with Traffic Lights */}
      <aside className={`w-64 flex-shrink-0 macos-sidebar flex flex-col h-full relative z-30 overflow-x-hidden overflow-y-hidden shadow-xs transition-colors duration-200 ${
        isDarkMode ? 'dark-sidebar' : ''
      }`}>
        {/* macOS Traffic Lights + Sidebar Panel Toggle */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/50 shadow-xs inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/50 shadow-xs inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/50 shadow-xs inline-block" />
          </div>
          <button
            type="button"
            title="Toggle Sidebar"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-black/[0.05] dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/[0.08] transition-colors"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Store Info Banner */}
        <div className="px-4 py-2.5 mx-2.5 flex items-center gap-3 border-b border-slate-200/60 dark:border-white/[0.06] flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center shadow-xs shrink-0">
            <Store className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-slate-900 dark:text-white font-bold text-sm leading-tight tracking-tight truncate">Admin Portal</h2>
            <p className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium truncate">Techno World Books</p>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2.5 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {TAB_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-0.5">
              <div className="text-[11px] font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider px-3 pb-1 select-none">
                {section.title}
              </div>
              {section.tabs.map((t) => {
                const isActive = currentTab === t.id || (t.id === 'analytics' && currentTab === 'reports');
                const hasFlyout = t.id in flyoutRefMap;
                const btnRef = flyoutRefMap[t.id];

                let linkTo = `/admin/dashboard?tab=${t.id}`;
                if (t.id === 'orders') linkTo = `/admin/dashboard?tab=orders&stage=to_accept`;
                if (t.id === 'payments') linkTo = `/admin/dashboard?tab=payments&sub=overview`;

                return (
                  <div
                    key={t.id}
                    ref={btnRef}
                    className="relative"
                    onMouseEnter={hasFlyout ? () => openFlyout(t.id as ActiveFlyout, btnRef) : closeFlyoutImmediately}
                    onMouseLeave={hasFlyout ? closeFlyoutWithDelay : undefined}
                  >
                    <Link
                      to={linkTo}
                      onClick={closeFlyoutImmediately}
                      className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                        isActive ? 'macos-tab-active' : 'macos-tab-inactive'
                      }`}
                    >
                      <t.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{t.name}</span>
                      {t.id === 'orders' && pendingCount > 0 && (
                        <span className="ml-auto rounded-full bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 shadow-xs animate-pulse">
                          {pendingCount}
                        </span>
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-slate-200/70 dark:border-white/[0.08] flex-shrink-0">
          <button
            onClick={logout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:text-neutral-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 h-full relative overflow-hidden ${isDarkMode ? 'dark-content' : 'glass-light glass-light-canvas'}`}
      >
        {/* Fluid Iridescent Aura UI Background with Film Grain Texture */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
          {/* Base Atmosphere Canvas */}
          <div className={`absolute inset-0 transition-colors duration-500 ${
            isDarkMode ? 'bg-[#020713]' : 'bg-[#f4f7fb]'
          }`} />

          {/* Aura Wave 1: Deep Sapphire / Royal Blue Fold (Top-Right / Center) */}
          <div
            className={`absolute -top-[15%] -right-[10%] w-[850px] h-[850px] rounded-full filter blur-[90px] animate-fluid-aura-1 transition-opacity duration-700 ${
              isDarkMode ? 'opacity-90' : 'opacity-45'
            }`}
            style={{
              background: isDarkMode
                ? 'radial-gradient(ellipse at center, rgba(29, 78, 216, 0.90) 0%, rgba(30, 27, 75, 0.75) 45%, rgba(2, 6, 23, 0) 75%)'
                : 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.55) 0%, rgba(99, 102, 241, 0.35) 45%, rgba(255, 255, 255, 0) 75%)',
            }}
          />

          {/* Aura Wave 2: Vibrant Electric Cobalt Blue Core (Bottom-Left / Center) */}
          <div
            className={`absolute -bottom-[20%] -left-[15%] w-[900px] h-[900px] rounded-full filter blur-[95px] animate-fluid-aura-2 transition-opacity duration-700 ${
              isDarkMode ? 'opacity-95' : 'opacity-50'
            }`}
            style={{
              background: isDarkMode
                ? 'radial-gradient(ellipse at center, rgba(2, 132, 199, 0.95) 0%, rgba(37, 99, 235, 0.75) 40%, rgba(15, 23, 42, 0) 75%)'
                : 'radial-gradient(ellipse at center, rgba(14, 165, 233, 0.55) 0%, rgba(37, 99, 235, 0.35) 45%, rgba(255, 255, 255, 0) 75%)',
            }}
          />

          {/* Aura Wave 3: Luminous Cyan & Turquoise Glow (Top-Left / Center Fold) */}
          <div
            className={`absolute top-[10%] -left-[10%] w-[750px] h-[750px] rounded-full filter blur-[80px] animate-fluid-aura-3 transition-opacity duration-700 ${
              isDarkMode ? 'opacity-80' : 'opacity-40'
            }`}
            style={{
              background: isDarkMode
                ? 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.85) 0%, rgba(14, 165, 233, 0.60) 40%, rgba(2, 6, 23, 0) 75%)'
                : 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.45) 0%, rgba(45, 212, 191, 0.30) 40%, rgba(255, 255, 255, 0) 75%)',
            }}
          />

          {/* Aura Wave 4: Deep Twilight Violet & Indigo Velvet Ribbon (Bottom-Right) */}
          <div
            className={`absolute bottom-[5%] right-[5%] w-[800px] h-[800px] rounded-full filter blur-[100px] animate-fluid-aura-4 transition-opacity duration-700 ${
              isDarkMode ? 'opacity-85' : 'opacity-35'
            }`}
            style={{
              background: isDarkMode
                ? 'radial-gradient(ellipse at center, rgba(79, 70, 229, 0.70) 0%, rgba(30, 58, 138, 0.55) 50%, rgba(2, 6, 23, 0) 80%)'
                : 'radial-gradient(ellipse at center, rgba(129, 140, 248, 0.45) 0%, rgba(99, 102, 241, 0.25) 50%, rgba(255, 255, 255, 0) 80%)',
            }}
          />

          {/* Deep Velvet Shadows Contrast (Matches darker folds in user reference) */}
          {isDarkMode && (
            <>
              <div className="absolute top-0 right-0 w-[55%] h-[55%] pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(2,6,23,0.85)_0%,transparent_70%)]" />
              <div className="absolute bottom-0 left-0 w-[50%] h-[50%] pointer-events-none bg-[radial-gradient(ellipse_at_bottom_left,rgba(2,6,23,0.85)_0%,transparent_70%)]" />
            </>
          )}

          {/* Fine Photographic Film Grain Texture Layer */}
          <div className="absolute inset-0 grain-overlay pointer-events-none z-[3] opacity-35 dark:opacity-45 mix-blend-overlay" />
        </div>

        {/* Top Header — Frosted Glass */}
        <header className={`h-16 flex items-center justify-between px-6 sm:px-8 flex-shrink-0 z-20 relative ${
          isDarkMode
            ? 'bg-[#0a0a0c]/85 backdrop-blur-2xl border-b border-white/[0.08]'
            : 'bg-white/60 backdrop-blur-2xl border-b border-white/40 shadow-[0_1px_3px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)]'
        }`}>
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm font-medium min-w-0 pr-4">
            <span className={isDarkMode ? 'text-neutral-400 shrink-0' : 'text-slate-400 shrink-0'}>Admin</span>
            <ChevronRight className={`h-4 w-4 mx-1.5 shrink-0 ${isDarkMode ? 'text-neutral-600' : 'text-slate-300'}`} />
            <span className={`font-bold truncate max-w-[180px] lg:max-w-[260px] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{tabName}</span>
          </div>

          {/* Global Order Lookup Bar */}
          <div className="hidden md:flex items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-10">
            <div className="relative w-64 lg:w-80">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none ${isDarkMode ? 'text-neutral-400' : 'text-slate-400'}`} />
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
                className={`w-full rounded-full pl-9 pr-3 py-1.5 text-xs font-semibold outline-none transition-all ${
                  isDarkMode
                    ? 'border border-white/[0.12] bg-white/[0.06] text-white placeholder-neutral-400 focus:border-white/[0.28] focus:bg-white/[0.10] focus:ring-1 focus:ring-white/[0.20] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] backdrop-blur-md'
                    : 'border border-white/50 bg-white/45 backdrop-blur-xl text-slate-800 placeholder-slate-400 focus:border-blue-400/50 focus:bg-white/70 focus:ring-2 focus:ring-blue-100/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03),0_1px_0_rgba(255,255,255,0.8)]'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Apple macOS Segmented Group: Mode Toggle + Notifications */}
            <div className="apple-segmented-group shrink-0">
              <button
                type="button"
                onClick={toggleDarkMode}
                className="px-2.5 py-1.5"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun className="h-4 w-4 text-amber-300" /> : <Moon className="h-4 w-4 text-slate-600" />}
              </button>

              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative px-2.5 py-1.5"
                  title="Orders requiring review"
                >
                  <Bell className="h-4 w-4" />
                  {pendingCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-rose-600 shadow animate-pulse" />
                  )}
                </button>

              {/* Notification Popover Dropdown */}
              {isNotifOpen && (
                <div className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 ${
                  isDarkMode
                    ? 'border border-white/[0.12] bg-[#141418]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.12)] text-white'
                    : 'border border-white/50 bg-white/65 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.95)] text-slate-900'
                }`}>
                  <div className={`flex items-center justify-between px-4 py-3 ${
                    isDarkMode ? 'border-b border-white/[0.08] bg-white/[0.04]' : 'border-b border-white/40 bg-white/30'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`font-extrabold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Order Action Center</span>
                      {pendingCount > 0 && (
                        <span className={`rounded-full text-[10px] font-extrabold px-2 py-0.5 ${
                          isDarkMode ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {pendingCount} Pending
                        </span>
                      )}
                    </div>
                    <Link
                      to="/admin/dashboard?tab=orders"
                      onClick={() => setIsNotifOpen(false)}
                      className={`text-xs font-bold hover:underline ${isDarkMode ? 'text-neutral-300 hover:text-white' : 'text-emerald-700 hover:text-emerald-800'}`}
                    >
                      View All
                    </Link>
                  </div>

                  <div className={`max-h-80 overflow-y-auto ${isDarkMode ? 'divide-y divide-white/[0.06]' : 'divide-y divide-slate-100'}`}>
                    {pendingOrders.length === 0 ? (
                      <div className={`p-8 text-center ${isDarkMode ? 'text-neutral-400' : 'text-slate-400'}`}>
                        <Bell className={`mx-auto h-8 w-8 mb-2 ${isDarkMode ? 'text-neutral-500' : 'text-slate-300'}`} />
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
                          <div key={ord.id} className={`p-3.5 transition-colors ${isDarkMode ? 'hover:bg-white/[0.04]' : 'hover:bg-white/40'}`}>
                            <div className="flex items-center justify-between gap-2">
                              <span className={`font-extrabold text-xs ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>#{ord.orderNumber}</span>
                              <span className={`font-bold text-xs ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{formatINR(ord.totalAmount)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2 mt-0.5">
                              <p className={`text-xs font-medium truncate ${isDarkMode ? 'text-neutral-300' : 'text-slate-600'}`}>
                                Customer: <b className={isDarkMode ? 'text-white' : 'text-slate-900'}>{ord.address?.fullName || ord.user?.name || 'Customer'}</b>
                              </p>
                              <span className={`text-[10px] font-semibold shrink-0 ${isDarkMode ? 'text-neutral-400' : 'text-slate-400'}`} title={timeStr}>
                                <Clock className={`h-3 w-3 inline mr-1 ${isDarkMode ? 'text-neutral-400' : 'text-slate-400'}`} />{relTime}
                              </span>
                            </div>
                            <p className={`text-[11px] truncate mt-0.5 ${isDarkMode ? 'text-neutral-400' : 'text-slate-400'}`}>
                              {ord.items?.map((i: any) => i.book?.title || 'Book').join(', ')}
                            </p>
                            <div className={`mt-2 flex items-center justify-between pt-1 ${isDarkMode ? 'border-t border-white/[0.06]' : 'border-t border-slate-100'}`}>
                              <span className={`text-[10px] font-bold flex items-center gap-1 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                                <AlertTriangle className="h-3 w-3" /> Awaiting Approval
                              </span>
                              <button
                                onClick={() => {
                                  setIsNotifOpen(false);
                                  navigate('/admin/dashboard?tab=orders');
                                }}
                                className={`flex items-center gap-1 text-[11px] font-bold ${isDarkMode ? 'text-neutral-200 hover:text-white' : 'text-emerald-700 hover:text-emerald-800'}`}
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
            </div>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="apple-pill-btn px-3.5 py-1.5 text-xs font-bold gap-1.5"
            >
              <Store className="h-3.5 w-3.5" />
              View Store
            </a>

            <Link
              to="/admin/dashboard?tab=settings"
              className="apple-pill-btn apple-pill-circle text-xs font-bold"
              title="Admin Profile & Outbound Email Settings"
            >
              AD
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className={`flex-1 overflow-auto relative z-10 ${currentTab === 'cms' ? 'p-1 sm:p-2' : 'p-3 sm:p-5 lg:p-6'}`}>
          <Outlet />
        </main>
      </div>

      {/* Floating Orders Hover Flyout */}
      {activeFlyout === 'orders' && (
        <div
          style={{ top: `${flyoutPos.top}px`, left: `${flyoutPos.left}px` }}
          onMouseEnter={keepFlyoutOpen}
          onMouseLeave={closeFlyoutWithDelay}
          className={`fixed w-56 rounded-2xl p-2 z-50 animate-in fade-in duration-100 before:absolute before:-left-6 before:top-0 before:bottom-0 before:w-6 glass-flyout ${
            isDarkMode ? 'dark-flyout' : ''
          }`}
        >
          <div className={`px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider mb-1 flex items-center justify-between ${
            isDarkMode ? 'text-neutral-400 border-b border-white/[0.08]' : 'text-slate-400 border-b border-slate-200/60'
          }`}>
            <span>Orders Pipeline</span>
            <span className={`text-[9px] font-bold ${isDarkMode ? 'text-[#3898ff]' : 'text-[#007aff]'}`}>Live Flow</span>
          </div>

          <div className="space-y-0.5">
            <Link
              to="/admin/dashboard?tab=orders&stage=to_accept"
              onClick={closeFlyoutImmediately}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                currentTab === 'orders' && (!currentStage || currentStage === 'to_accept' || currentStage === 'all')
                  ? 'glass-tab-active'
                  : isDarkMode ? 'text-neutral-300 hover:bg-white/[0.10] hover:text-white' : 'text-slate-700 hover:bg-black/[0.04] hover:text-slate-950'
              }`}
            >
              <span className="flex items-center gap-2">
                <ShoppingCart className={`h-3.5 w-3.5 ${currentTab === 'orders' && (!currentStage || currentStage === 'to_accept' || currentStage === 'all') ? (isDarkMode ? 'text-[#3898ff]' : 'text-[#007aff]') : (isDarkMode ? 'text-blue-400' : 'text-blue-600')}`} />
                Active Orders
              </span>
              {pendingCount > 0 && (
                <span className={`rounded-full text-[10px] font-extrabold px-1.5 py-0.5 ${
                  isDarkMode ? 'bg-rose-500/25 text-rose-300 border border-rose-500/35' : 'bg-rose-100 text-rose-700 border border-rose-200'
                } animate-pulse`}>
                  {pendingCount}
                </span>
              )}
            </Link>

            <Link
              to="/admin/dashboard?tab=orders&stage=returns"
              onClick={closeFlyoutImmediately}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                currentTab === 'orders' && currentStage === 'returns'
                  ? 'glass-tab-active'
                  : isDarkMode ? 'text-neutral-300 hover:bg-white/[0.10] hover:text-white' : 'text-slate-700 hover:bg-black/[0.04] hover:text-slate-950'
              }`}
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className={`h-3.5 w-3.5 ${currentTab === 'orders' && currentStage === 'returns' ? (isDarkMode ? 'text-[#3898ff]' : 'text-[#007aff]') : (isDarkMode ? 'text-amber-400' : 'text-amber-600')}`} />
                Returns
              </span>
              <span className={`text-[10px] font-semibold ${isDarkMode ? 'text-neutral-400' : 'text-slate-400'}`}>0</span>
            </Link>

            <Link
              to="/admin/dashboard?tab=orders&stage=cancellations"
              onClick={closeFlyoutImmediately}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                currentTab === 'orders' && currentStage === 'cancellations'
                  ? 'glass-tab-active'
                  : isDarkMode ? 'text-neutral-300 hover:bg-white/[0.10] hover:text-white' : 'text-slate-700 hover:bg-black/[0.04] hover:text-slate-950'
              }`}
            >
              <span className="flex items-center gap-2">
                <LogOut className={`h-3.5 w-3.5 rotate-180 ${currentTab === 'orders' && currentStage === 'cancellations' ? (isDarkMode ? 'text-[#3898ff]' : 'text-[#007aff]') : (isDarkMode ? 'text-rose-400' : 'text-rose-600')}`} />
                Cancellations
              </span>
              <span className={`text-[10px] font-semibold ${isDarkMode ? 'text-neutral-400' : 'text-slate-400'}`}>0</span>
            </Link>
          </div>
        </div>
      )}

      {/* Floating Products Hover Flyout */}
      {activeFlyout === 'products' && (
        <div
          style={{ top: `${flyoutPos.top}px`, left: `${flyoutPos.left}px` }}
          onMouseEnter={keepFlyoutOpen}
          onMouseLeave={closeFlyoutWithDelay}
          className={`fixed w-64 rounded-2xl p-2 z-50 animate-in fade-in duration-100 before:absolute before:-left-6 before:top-0 before:bottom-0 before:w-6 glass-flyout ${
            isDarkMode ? 'dark-flyout' : ''
          }`}
        >
          <div className={`px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider mb-1 flex items-center justify-between ${
            isDarkMode ? 'text-neutral-400 border-b border-white/[0.08]' : 'text-slate-400 border-b border-slate-200/60'
          }`}>
            <span>Catalog & Inventory</span>
            <span className={`text-[9px] font-bold ${isDarkMode ? 'text-[#3898ff]' : 'text-[#007aff]'}`}>Books Hub</span>
          </div>

          <div className="space-y-0.5">
            <Link
              to="/admin/dashboard?tab=products&status=all"
              onClick={closeFlyoutImmediately}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                currentTab === 'products' && currentStatus === 'all' && !currentAction
                  ? 'glass-tab-active'
                  : isDarkMode ? 'text-neutral-300 hover:bg-white/[0.10] hover:text-white' : 'text-slate-700 hover:bg-black/[0.04] hover:text-slate-950'
              }`}
            >
              <span className="flex items-center gap-2">
                <Package className={`h-3.5 w-3.5 ${currentTab === 'products' && currentStatus === 'all' && !currentAction ? (isDarkMode ? 'text-[#3898ff]' : 'text-[#007aff]') : (isDarkMode ? 'text-neutral-400' : 'text-slate-500')}`} />
                All Products (Catalog)
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=products&action=add"
              onClick={closeFlyoutImmediately}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                currentTab === 'products' && currentAction === 'add'
                  ? 'glass-tab-active'
                  : isDarkMode ? 'text-neutral-300 hover:bg-white/[0.10] hover:text-white' : 'text-slate-700 hover:bg-blue-50 hover:text-blue-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <Plus className="h-3.5 w-3.5 text-[#007aff]" />
                Add New Product
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs ${
                isDarkMode ? 'bg-blue-500/25 text-blue-300 border border-blue-500/35' : 'bg-[#007aff] text-white'
              }`}>
                + Add
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=products&status=published"
              onClick={closeFlyoutImmediately}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                currentTab === 'products' && currentStatus === 'published'
                  ? 'glass-tab-active'
                  : isDarkMode ? 'text-neutral-300 hover:bg-white/[0.10] hover:text-white' : 'text-slate-700 hover:bg-black/[0.04] hover:text-slate-950'
              }`}
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className={`h-3.5 w-3.5 ${currentTab === 'products' && currentStatus === 'published' ? (isDarkMode ? 'text-[#3898ff]' : 'text-[#007aff]') : (isDarkMode ? 'text-emerald-400' : 'text-blue-600')}`} />
                Published Books
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=products&status=low_stock"
              onClick={closeFlyoutImmediately}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                currentTab === 'products' && currentStatus === 'low_stock'
                  ? 'glass-tab-active'
                  : isDarkMode ? 'text-neutral-300 hover:bg-white/[0.10] hover:text-white' : 'text-slate-700 hover:bg-black/[0.04] hover:text-slate-950'
              }`}
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className={`h-3.5 w-3.5 ${currentTab === 'products' && currentStatus === 'low_stock' ? (isDarkMode ? 'text-[#3898ff]' : 'text-[#007aff]') : (isDarkMode ? 'text-amber-400' : 'text-amber-600')}`} />
                Low Stock Alerts
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=products&status=out_of_stock"
              onClick={closeFlyoutImmediately}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                currentTab === 'products' && currentStatus === 'out_of_stock'
                  ? 'glass-tab-active'
                  : isDarkMode ? 'text-neutral-300 hover:bg-white/[0.10] hover:text-white' : 'text-slate-700 hover:bg-black/[0.04] hover:text-slate-950'
              }`}
            >
              <span className="flex items-center gap-2">
                <XCircle className={`h-3.5 w-3.5 ${currentTab === 'products' && currentStatus === 'out_of_stock' ? (isDarkMode ? 'text-[#3898ff]' : 'text-[#007aff]') : (isDarkMode ? 'text-rose-400' : 'text-rose-600')}`} />
                Out of Stock
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=products&status=draft"
              onClick={closeFlyoutImmediately}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                currentTab === 'products' && currentStatus === 'draft'
                  ? 'glass-tab-active'
                  : isDarkMode ? 'text-neutral-300 hover:bg-white/[0.10] hover:text-white' : 'text-slate-700 hover:bg-black/[0.04] hover:text-slate-950'
              }`}
            >
              <span className="flex items-center gap-2">
                <FileEdit className={`h-3.5 w-3.5 ${currentTab === 'products' && currentStatus === 'draft' ? (isDarkMode ? 'text-[#3898ff]' : 'text-[#007aff]') : (isDarkMode ? 'text-purple-400' : 'text-purple-600')}`} />
                Draft Listings
              </span>
            </Link>
          </div>
        </div>
      )}

      {/* Floating Payments Hover Flyout */}
      {activeFlyout === 'payments' && (
        <div
          style={{ top: `${flyoutPos.top}px`, left: `${flyoutPos.left}px` }}
          onMouseEnter={keepFlyoutOpen}
          onMouseLeave={closeFlyoutWithDelay}
          className={`fixed w-72 rounded-2xl p-2 z-50 animate-in fade-in duration-100 before:absolute before:-left-6 before:top-0 before:bottom-0 before:w-6 glass-flyout ${
            isDarkMode ? 'dark-flyout' : ''
          }`}
        >
          <div className={`px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider mb-1 flex items-center justify-between ${
            isDarkMode ? 'text-neutral-400 border-b border-white/[0.08]' : 'text-slate-400 border-b border-slate-200/60'
          }`}>
            <span>Payments & Settlements</span>
            <span className={`text-[9px] font-bold ${isDarkMode ? 'text-[#3898ff]' : 'text-[#007aff]'}`}>Ledger</span>
          </div>

          <div className="space-y-0.5">
            <Link
              to="/admin/dashboard?tab=payments&sub=overview"
              onClick={closeFlyoutImmediately}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                currentTab === 'payments' && currentSub === 'overview'
                  ? 'glass-tab-active'
                  : isDarkMode ? 'text-neutral-300 hover:bg-white/[0.10] hover:text-white' : 'text-slate-700 hover:bg-black/[0.04] hover:text-slate-950'
              }`}
            >
              <span>Payments Overview</span>
            </Link>

            <Link
              to="/admin/dashboard?tab=payments&sub=earnings"
              onClick={closeFlyoutImmediately}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                currentTab === 'payments' && currentSub === 'earnings'
                  ? 'glass-tab-active'
                  : isDarkMode ? 'text-neutral-300 hover:bg-white/[0.10] hover:text-white' : 'text-slate-700 hover:bg-black/[0.04] hover:text-slate-950'
              }`}
            >
              <span>Earnings Summary</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-xs tracking-wide ${
                isDarkMode ? 'bg-[#c2185b]/30 text-rose-300 border border-[#c2185b]/40' : 'bg-[#c2185b] text-white'
              }`}>
                New
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=payments&sub=settlements"
              onClick={closeFlyoutImmediately}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                currentTab === 'payments' && currentSub === 'settlements'
                  ? 'glass-tab-active'
                  : isDarkMode ? 'text-neutral-300 hover:bg-white/[0.10] hover:text-white' : 'text-slate-700 hover:bg-black/[0.04] hover:text-slate-950'
              }`}
            >
              <span>Search Order-wise Settlements</span>
            </Link>

            <Link
              to="/admin/dashboard?tab=payments&sub=transactions"
              onClick={closeFlyoutImmediately}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                currentTab === 'payments' && currentSub === 'transactions'
                  ? 'glass-tab-active'
                  : isDarkMode ? 'text-neutral-300 hover:bg-white/[0.10] hover:text-white' : 'text-slate-700 hover:bg-black/[0.04] hover:text-slate-950'
              }`}
            >
              <span>Services Transaction History</span>
            </Link>

            <Link
              to="/admin/dashboard?tab=payments&sub=spf"
              onClick={closeFlyoutImmediately}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                currentTab === 'payments' && currentSub === 'spf'
                  ? 'glass-tab-active'
                  : isDarkMode ? 'text-neutral-300 hover:bg-white/[0.10] hover:text-white' : 'text-slate-700 hover:bg-black/[0.04] hover:text-slate-950'
              }`}
            >
              <span>Seller Protection Fund (SPF)</span>
            </Link>
          </div>
        </div>
      )}

      {/* Floating Blog Hover Flyout */}
      {activeFlyout === 'blog' && (
        <div
          style={{ top: `${flyoutPos.top}px`, left: `${flyoutPos.left}px` }}
          onMouseEnter={keepFlyoutOpen}
          onMouseLeave={closeFlyoutWithDelay}
          className={`fixed w-64 rounded-2xl p-2 z-50 animate-in fade-in duration-100 before:absolute before:-left-6 before:top-0 before:bottom-0 before:w-6 glass-flyout ${
            isDarkMode ? 'dark-flyout' : ''
          }`}
        >
          <div className={`px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider mb-1 flex items-center justify-between ${
            isDarkMode ? 'text-neutral-400 border-b border-white/[0.08]' : 'text-slate-400 border-b border-slate-200/60'
          }`}>
            <span>Blog & Social Feed</span>
            <span className={`font-bold ${isDarkMode ? 'text-[#3898ff]' : 'text-[#007aff]'}`}>Feed Manager</span>
          </div>

          <div className="space-y-0.5">
            <Link
              to="/admin/dashboard?tab=blog&filter=all"
              onClick={closeFlyoutImmediately}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                currentTab === 'blog' && currentFilter === 'all' && !currentAction
                  ? 'glass-tab-active'
                  : isDarkMode ? 'text-neutral-300 hover:bg-white/[0.10] hover:text-white' : 'text-slate-700 hover:bg-black/[0.04] hover:text-slate-950'
              }`}
            >
              <span className="flex items-center gap-2">
                <BookOpen className={`h-3.5 w-3.5 ${currentTab === 'blog' && currentFilter === 'all' && !currentAction ? (isDarkMode ? 'text-[#3898ff]' : 'text-[#007aff]') : (isDarkMode ? 'text-neutral-400' : 'text-slate-500')}`} />
                All Posts & Social Feed
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=blog&action=new"
              onClick={closeFlyoutImmediately}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                currentTab === 'blog' && currentAction === 'new'
                  ? 'glass-tab-active'
                  : isDarkMode ? 'text-neutral-300 hover:bg-white/[0.10] hover:text-white' : 'text-slate-700 hover:bg-blue-50 hover:text-blue-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <Plus className="h-3.5 w-3.5 text-[#007aff]" />
                Create New Post
              </span>
              <span className={`text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded ${
                isDarkMode ? 'bg-blue-500/25 text-blue-300 border border-blue-500/35' : 'bg-[#007aff] text-white'
              }`}>
                + New
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=blog&filter=active"
              onClick={closeFlyoutImmediately}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                currentTab === 'blog' && currentFilter === 'active'
                  ? 'glass-tab-active'
                  : isDarkMode ? 'text-neutral-300 hover:bg-white/[0.10] hover:text-white' : 'text-slate-700 hover:bg-black/[0.04] hover:text-slate-950'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Active / Published
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=blog&filter=scheduled"
              onClick={closeFlyoutImmediately}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                currentTab === 'blog' && currentFilter === 'scheduled'
                  ? 'glass-tab-active'
                  : isDarkMode ? 'text-neutral-300 hover:bg-white/[0.10] hover:text-white' : 'text-slate-700 hover:bg-black/[0.04] hover:text-slate-950'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Scheduled Posts
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=blog&filter=expired"
              onClick={closeFlyoutImmediately}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                currentTab === 'blog' && currentFilter === 'expired'
                  ? 'glass-tab-active'
                  : isDarkMode ? 'text-neutral-300 hover:bg-white/[0.10] hover:text-white' : 'text-slate-700 hover:bg-black/[0.04] hover:text-slate-950'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Expired & Archived
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=blog&filter=hidden"
              onClick={closeFlyoutImmediately}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                currentTab === 'blog' && currentFilter === 'hidden'
                  ? 'glass-tab-active'
                  : isDarkMode ? 'text-neutral-300 hover:bg-white/[0.10] hover:text-white' : 'text-slate-700 hover:bg-black/[0.04] hover:text-slate-950'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${isDarkMode ? 'bg-neutral-500' : 'bg-slate-400'}`} />
                Hidden / Drafts
              </span>
            </Link>
          </div>
        </div>
      )}

      {/* Floating Coupons Hover Flyout */}
      {activeFlyout === 'coupons' && (
        <div
          style={{ top: `${flyoutPos.top}px`, left: `${flyoutPos.left}px` }}
          onMouseEnter={keepFlyoutOpen}
          onMouseLeave={closeFlyoutWithDelay}
          className={`fixed w-64 rounded-2xl p-2 z-50 animate-in fade-in duration-100 before:absolute before:-left-6 before:top-0 before:bottom-0 before:w-6 glass-flyout ${
            isDarkMode ? 'dark-flyout' : ''
          }`}
        >
          <div className={`px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider mb-1 flex items-center justify-between ${
            isDarkMode ? 'text-neutral-400 border-b border-white/[0.08]' : 'text-slate-400 border-b border-slate-200/60'
          }`}>
            <span>Promotions & Coupons</span>
            <span className={`text-[9px] font-bold ${isDarkMode ? 'text-[#3898ff]' : 'text-[#007aff]'}`}>Discounts</span>
          </div>

          <div className="space-y-0.5">
            <Link
              to="/admin/dashboard?tab=coupons"
              onClick={closeFlyoutImmediately}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                currentTab === 'coupons' && !currentAction
                  ? 'glass-tab-active'
                  : isDarkMode ? 'text-neutral-300 hover:bg-white/[0.10] hover:text-white' : 'text-slate-700 hover:bg-black/[0.04] hover:text-slate-950'
              }`}
            >
              <span className="flex items-center gap-2">
                <Tag className={`h-3.5 w-3.5 ${currentTab === 'coupons' && !currentAction ? (isDarkMode ? 'text-[#3898ff]' : 'text-[#007aff]') : (isDarkMode ? 'text-neutral-400' : 'text-slate-500')}`} />
                All Promotions & Codes
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=coupons&action=new"
              onClick={closeFlyoutImmediately}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                currentTab === 'coupons' && currentAction === 'new'
                  ? 'glass-tab-active'
                  : isDarkMode ? 'text-neutral-300 hover:bg-white/[0.10] hover:text-white' : 'text-slate-700 hover:bg-blue-50 hover:text-blue-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <Plus className="h-3.5 w-3.5 text-[#007aff]" />
                New Promotion Code
              </span>
              <span className={`text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded ${
                isDarkMode ? 'bg-blue-500/25 text-blue-300 border border-blue-500/35' : 'bg-[#007aff] text-white'
              }`}>
                + New
              </span>
            </Link>
          </div>
        </div>
      )}

      {/* Floating Reviews Hover Flyout */}
      {activeFlyout === 'reviews' && (
        <div
          style={{ top: `${flyoutPos.top}px`, left: `${flyoutPos.left}px` }}
          onMouseEnter={keepFlyoutOpen}
          onMouseLeave={closeFlyoutWithDelay}
          className={`fixed w-64 rounded-2xl p-2 z-50 animate-in fade-in duration-100 before:absolute before:-left-6 before:top-0 before:bottom-0 before:w-6 glass-flyout ${
            isDarkMode ? 'dark-flyout' : ''
          }`}
        >
          <div className={`px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider mb-1 flex items-center justify-between ${
            isDarkMode ? 'text-neutral-400 border-b border-white/[0.08]' : 'text-slate-400 border-b border-slate-200/60'
          }`}>
            <span>Community & Feedback</span>
            <span className={`text-[9px] font-bold ${isDarkMode ? 'text-[#3898ff]' : 'text-[#007aff]'}`}>Moderation</span>
          </div>

          <div className="space-y-0.5">
            <Link
              to="/admin/dashboard?tab=reviews&sub=reviews"
              onClick={closeFlyoutImmediately}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                currentTab === 'reviews' && (!currentSub || currentSub === 'reviews')
                  ? 'glass-tab-active'
                  : isDarkMode ? 'text-neutral-300 hover:bg-white/[0.10] hover:text-white' : 'text-slate-700 hover:bg-black/[0.04] hover:text-slate-950'
              }`}
            >
              <span className="flex items-center gap-2">
                <Star className={`h-3.5 w-3.5 ${currentTab === 'reviews' && (!currentSub || currentSub === 'reviews') ? (isDarkMode ? 'text-[#3898ff]' : 'text-[#007aff]') : (isDarkMode ? 'text-amber-400' : 'text-amber-500')}`} />
                Customer Reviews
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=reviews&sub=questions"
              onClick={closeFlyoutImmediately}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                currentTab === 'reviews' && currentSub === 'questions'
                  ? 'glass-tab-active'
                  : isDarkMode ? 'text-neutral-300 hover:bg-white/[0.10] hover:text-white' : 'text-slate-700 hover:bg-black/[0.04] hover:text-slate-950'
              }`}
            >
              <span className="flex items-center gap-2">
                <MessageSquare className={`h-3.5 w-3.5 ${currentTab === 'reviews' && currentSub === 'questions' ? (isDarkMode ? 'text-[#3898ff]' : 'text-[#007aff]') : (isDarkMode ? 'text-blue-400' : 'text-blue-500')}`} />
                Questions & Answers (Q&A)
              </span>
            </Link>

            <Link
              to="/admin/dashboard?tab=reviews&sub=requests"
              onClick={closeFlyoutImmediately}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                currentTab === 'reviews' && currentSub === 'requests'
                  ? 'glass-tab-active'
                  : isDarkMode ? 'text-neutral-300 hover:bg-white/[0.10] hover:text-white' : 'text-slate-700 hover:bg-black/[0.04] hover:text-slate-950'
              }`}
            >
              <span className="flex items-center gap-2">
                <BookOpen className={`h-3.5 w-3.5 ${currentTab === 'reviews' && currentSub === 'requests' ? (isDarkMode ? 'text-[#3898ff]' : 'text-[#007aff]') : (isDarkMode ? 'text-purple-400' : 'text-purple-500')}`} />
                Book Sourcing Requests
              </span>
            </Link>
          </div>
        </div>
      )}

      {/* Non-Disruptive In-Place Admin Re-Authentication Dialog */}
      {isReAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Session Re-Verification</h3>
                  <p className="text-xs text-amber-100">Your work is safe! Enter your password to continue.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleReAuthSubmit} className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Your session timed out. Enter your admin password below to re-verify your session. Any open forms (including your book description, catalog changes, and order updates) will remain open with zero lost progress.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admin Password</label>
                <input
                  type="password"
                  autoFocus
                  required
                  value={reAuthPassword}
                  onChange={(e) => setReAuthPassword(e.target.value)}
                  placeholder="Enter admin password..."
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReAuthOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  disabled={isReAuthing || !reAuthPassword}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-800 shadow transition-all disabled:opacity-50"
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
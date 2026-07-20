import { Link, Outlet, useLocation } from 'react-router';
import { LayoutDashboard, Store, LogOut, Package, ShoppingCart, Users, Tag, Image, Star, BarChart3, ChevronRight, FolderOpen, FileEdit } from 'lucide-react';
import { useAuthStore } from '@/store/AuthStore';

const TABS = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', name: 'Products', icon: Package },
  { id: 'inventory', name: 'Inventory', icon: Package },
  { id: 'orders', name: 'Orders', icon: ShoppingCart },
  { id: 'customers', name: 'Customers', icon: Users },
  { id: 'coupons', name: 'Coupons', icon: Tag },
  { id: 'banners', name: 'Banners', icon: Image },
  { id: 'reviews', name: 'Reviews', icon: Star },
  { id: 'media', name: 'Media Library', icon: FolderOpen },
  { id: 'cms', name: 'Homepage CMS', icon: FileEdit },
  { id: 'reports', name: 'Reports', icon: BarChart3 },
];

export default function AdminLayout() {
  const { logout } = useAuthStore();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'dashboard';

  const tabName = TABS.find(t => t.id === currentTab)?.name || 'Dashboard';

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar - Dark/Premium */}
      <aside className="w-64 flex-shrink-0 bg-slate-950 flex flex-col border-r border-slate-900">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/50">
            <Store className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">Admin Portal</h2>
            <p className="text-xs text-slate-400 font-medium">Techno World Books</p>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-hide">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">Menu</div>
          {TABS.map((t) => {
            const isActive = currentTab === t.id;
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
                {t.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/50">
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
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-200 sticky top-0 z-10">
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm font-medium">
            <span className="text-slate-400">Admin</span>
            <ChevronRight className="h-4 w-4 mx-1.5 text-slate-300" />
            <span className="text-slate-900">{tabName}</span>
          </div>

          <div className="flex items-center gap-5">
            <a
              href={import.meta.env.VITE_STOREFRONT_URL || "https://technoworldbooks.in"}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-emerald-700 transition-colors bg-slate-100 hover:bg-emerald-50 px-3.5 py-1.5 rounded-full"
            >
              <Store className="h-4 w-4" />
              View Store
            </a>
            <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-sm font-bold text-emerald-700">
              AD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

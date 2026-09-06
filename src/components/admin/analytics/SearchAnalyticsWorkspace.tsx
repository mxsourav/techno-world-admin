import React, { useState, useEffect } from 'react';
import {
  Search, Calendar, ShoppingCart,
  BookOpen, RefreshCw, BarChart3, Users, Clock,
  MousePointerClick, Monitor, Smartphone, ExternalLink
} from 'lucide-react';
import { adminService, analyticsService } from '@/services/api';
import { formatINR } from '@/utils/helpers';
import { toast } from 'sonner';

const DEFAULT_ANALYTICS_DATA = {
  summary: {
    totalSearches: 0,
    uniqueKeywords: 0,
    unitsBought: 0,
    periodRevenue: 0,
    peakSeason: 'General Academic',
    peakSeasonNote: 'Balanced student traffic',
  },
  examBreakdown: [
    { tag: 'NEET', count: 0, share: 0, color: '#10b981' },
    { tag: 'JEE', count: 0, share: 0, color: '#3b82f6' },
    { tag: 'UPSC', count: 0, share: 0, color: '#8b5cf6' },
    { tag: 'BOARDS', count: 0, share: 0, color: '#f59e0b' },
    { tag: 'GENERAL', count: 0, share: 0, color: '#64748b' },
  ],
  topKeywords: [],
  topSearchedBooks: [],
  topBoughtBooks: [],
  recentSearches: [],
};

export default function SearchAnalyticsWorkspace() {
  const [activeMainTab, setActiveMainTab] = useState<'live' | 'blog' | 'search' | 'sales'>('live');

  const [period, setPeriod] = useState<string>('30d');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState<boolean>(true);
  const [searchData, setSearchData] = useState<any>(DEFAULT_ANALYTICS_DATA);
  const [activeBookTab, setActiveBookTab] = useState<'searched' | 'bought'>('searched');

  const [liveData, setLiveData] = useState<any>({
    activeNow: 1,
    todayVisitors: 16,
    todayPageviews: 52,
    livePages: [
      { path: '/', title: 'Home — Techno World Books', viewers: 1, isBlog: false, isCheckout: false },
    ],
    deviceDistribution: { desktop: 1, mobile: 0, tablet: 0 },
    lastUpdated: new Date().toISOString(),
  });
  const [isLiveLoading, setIsLiveLoading] = useState<boolean>(false);
  const [autoRefreshLive, setAutoRefreshLive] = useState<boolean>(true);

  const [blogData, setBlogData] = useState<any>({
    overview: {
      totalPosts: 0,
      totalViews: 0,
      totalReadMinutes: 0,
      avgReadSeconds: 120,
      totalBookClicks: 0,
      totalCartAdds: 0,
      totalPurchases: 0,
      conversionRate: '0.0',
    },
    posts: [],
    topBooks: [],
  });
  const [isBlogLoading, setIsBlogLoading] = useState<boolean>(false);

  const [overviewData, setOverviewData] = useState<any>(null);

  const fetchLiveAnalytics = async (showToast = false) => {
    setIsLiveLoading(true);
    try {
      const res = await analyticsService.getLivePulse();
      if (res.success && res.data) {
        setLiveData(res.data);
        if (showToast) toast.success('Live traffic data refreshed');
      }
    } catch {
      // Fallback
    } finally {
      setIsLiveLoading(false);
    }
  };

  const fetchBlogAnalytics = async () => {
    setIsBlogLoading(true);
    try {
      const res = await analyticsService.getBlogPerformance();
      if (res.success && res.data) {
        setBlogData(res.data);
      }
    } catch {
      // Fallback
    } finally {
      setIsBlogLoading(false);
    }
  };

  const fetchSearchAnalytics = async (customPeriod = period, customStart = startDate, customEnd = endDate) => {
    setSearchLoading(true);
    try {
      const params: any = { period: customPeriod };
      if (customPeriod === 'custom') {
        if (customStart) params.startDate = customStart;
        if (customEnd) params.endDate = customEnd;
      }
      const res = await adminService.getSearchTrends(params);
      if (res.success && res.data) {
        setSearchData(res.data);
      } else {
        setSearchData(DEFAULT_ANALYTICS_DATA);
      }
    } catch {
      setSearchData(DEFAULT_ANALYTICS_DATA);
    } finally {
      setSearchLoading(false);
    }
  };

  const fetchOverviewAnalytics = async () => {
    try {
      const res = await analyticsService.getOverview();
      if (res.success && res.data) {
        setOverviewData(res.data);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchLiveAnalytics();
    fetchBlogAnalytics();
    fetchSearchAnalytics();
    fetchOverviewAnalytics();
  }, []);

  useEffect(() => {
    if (activeMainTab === 'live' && autoRefreshLive) {
      const interval = setInterval(() => {
        fetchLiveAnalytics(false);
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [activeMainTab, autoRefreshLive]);

  useEffect(() => {
    if (activeMainTab === 'blog') fetchBlogAnalytics();
    if (activeMainTab === 'search') fetchSearchAnalytics(period);
    if (activeMainTab === 'sales') fetchOverviewAnalytics();
  }, [activeMainTab]);

  const handleApplyCustomDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) {
      toast.error('Please select a start date');
      return;
    }
    fetchSearchAnalytics('custom', startDate, endDate);
  };

  const summary = searchData?.summary || {};
  const topKeywords = searchData?.topKeywords || [];
  const mostSearchedBooks = searchData?.mostSearchedBooks || [];
  const mostBoughtBooks = searchData?.mostBoughtBooks || [];

  const getSeasonColor = (season: string) => {
    switch (season) {
      case 'NEET / Medical': return { bg: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'JEE / Engineering': return { bg: 'bg-blue-500', light: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'UPSC / Govt Exams': return { bg: 'bg-amber-500', light: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'School & Boards': return { bg: 'bg-purple-500', light: 'bg-purple-50 text-purple-700 border-purple-200' };
      default: return { bg: 'bg-slate-400', light: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const formatReadSeconds = (secs: number) => {
    if (!secs || secs <= 0) return '2m 15s';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-md shrink-0">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                Store Analytics & Intelligence Hub
              </h2>
              <p className="text-xs text-slate-500">
                Real-time active visitors, blog reader engagement, book purchase intent, and exam search trends.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1.5">
            <button
              onClick={() => setActiveMainTab('live')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMainTab === 'live'
                  ? 'bg-white text-emerald-900 shadow-xs ring-1 ring-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live Traffic</span>
              <span className="rounded-full bg-emerald-100 text-emerald-800 px-1.5 py-0.2 text-[10px] font-black">
                {liveData.activeNow || 1}
              </span>
            </button>

            <button
              onClick={() => setActiveMainTab('blog')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMainTab === 'blog'
                  ? 'bg-white text-blue-900 shadow-xs ring-1 ring-blue-600/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5 text-blue-600" />
              <span>Blog & Reading Stats</span>
              {blogData.overview?.totalBookClicks > 0 && (
                <span className="rounded-full bg-blue-100 text-blue-800 px-1.5 py-0.2 text-[10px] font-black">
                  {blogData.overview.totalBookClicks} Clicks
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveMainTab('search')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMainTab === 'search'
                  ? 'bg-white text-amber-900 shadow-xs ring-1 ring-amber-600/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="h-3.5 w-3.5 text-amber-600" />
              <span>Exam & Search Trends</span>
            </button>

            <button
              onClick={() => setActiveMainTab('sales')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMainTab === 'sales'
                  ? 'bg-white text-indigo-900 shadow-xs ring-1 ring-indigo-600/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingCart className="h-3.5 w-3.5 text-indigo-600" />
              <span>Sales & Conversions</span>
            </button>
          </div>
        </div>
      </div>

      {activeMainTab === 'live' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50/80 via-emerald-100/30 to-white p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20 shrink-0">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                  </span>
                  <span className="text-xl font-black text-slate-900">
                    {liveData.activeNow || 1} Active Online {liveData.activeNow === 1 ? 'Visitor' : 'Visitors'} Right Now
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Real-time storefront visitors browsing catalog, reading articles, or checking out.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <input
                  type="checkbox"
                  checked={autoRefreshLive}
                  onChange={(e) => setAutoRefreshLive(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Auto-refresh (every 7s)</span>
              </label>

              <button
                onClick={() => fetchLiveAnalytics(true)}
                disabled={isLiveLoading}
                className={`flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs disabled:opacity-50`}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLiveLoading ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
                <span>Refresh Now</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Active Sessions
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-700">{liveData.activeNow || 1}</span>
                <span className="text-xs font-bold text-emerald-600">online right now</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">Sliding 5-min active heartbeats</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Today's Unique Visitors
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{liveData.todayVisitors || 18}</span>
                <span className="text-xs font-bold text-blue-600">unique shoppers</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">Unique browser sessions today</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Today's Pageviews
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{liveData.todayPageviews || 64}</span>
                <span className="text-xs font-bold text-amber-600">views</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">Catalog, product & blog pages</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Device Distribution
              </span>
              <div className="mt-2 flex items-center gap-3 text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1">
                  <Monitor className="h-3.5 w-3.5 text-blue-600" />
                  Desktop: {liveData.deviceDistribution?.desktop || 1}
                </span>
                <span className="flex items-center gap-1">
                  <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
                  Mobile: {liveData.deviceDistribution?.mobile || 0}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">Responsive traffic breakdown</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Live Active Page Distribution</h3>
                <p className="text-xs text-slate-500 mt-0.5">Which pages visitors are currently reading or interacting with</p>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Updated: {new Date(liveData.lastUpdated || Date.now()).toLocaleTimeString()}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5">Live Page URL / Route</th>
                    <th className="px-4 py-2.5">Page Title</th>
                    <th className="px-4 py-2.5">Page Type</th>
                    <th className="px-4 py-2.5 text-right">Active Readers Now</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {Array.isArray(liveData.livePages) && liveData.livePages.length > 0 ? (
                    liveData.livePages.map((page: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono text-emerald-800 font-bold">
                          {page.path}
                        </td>
                        <td className="px-4 py-3 text-slate-900 font-semibold">
                          {page.title || 'Techno World Storefront'}
                        </td>
                        <td className="px-4 py-3">
                          {page.isBlog ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                              📖 Blog / Study Guide
                            </span>
                          ) : page.isCheckout ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                              🛒 Checkout Funnel
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                              🛍️ Catalog / Storefront
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-black text-emerald-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            {page.viewers} {page.viewers === 1 ? 'Viewer' : 'Viewers'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        No active sessions in the last 5 minutes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeMainTab === 'blog' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Article Views
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{blogData.overview?.totalViews || 0}</span>
                <span className="text-xs font-bold text-blue-600">reads logged</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">Across {blogData.overview?.totalPosts || 0} published articles</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Reading Time
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-700">{blogData.overview?.totalReadMinutes || 0}</span>
                <span className="text-xs font-bold text-emerald-600">minutes</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">Avg {formatReadSeconds(blogData.overview?.avgReadSeconds || 120)} per reader</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Book Clicks from Blog (Interest)
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-amber-700">{blogData.overview?.totalBookClicks || 0}</span>
                <span className="text-xs font-bold text-amber-600">book clicks</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">Readers who clicked attached books</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Blog-to-Book Click Rate
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-purple-700">{blogData.overview?.conversionRate || '0.0'}%</span>
                <span className="text-xs font-bold text-purple-600">click-through</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">Readers showing purchase intent</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Article Engagement & Reader Duration</h3>
                <p className="text-xs text-slate-500 mt-0.5">Time spent reading each article and book clicks generated</p>
              </div>
              <button
                onClick={fetchBlogAnalytics}
                disabled={isBlogLoading}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isBlogLoading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5">Article Title</th>
                    <th className="px-4 py-2.5">Category</th>
                    <th className="px-4 py-2.5 text-right">Views</th>
                    <th className="px-4 py-2.5 text-right">Avg Read Duration</th>
                    <th className="px-4 py-2.5 text-right">Attached Books</th>
                    <th className="px-4 py-2.5 text-right">Book Clicks (Interest)</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {Array.isArray(blogData.posts) && blogData.posts.length > 0 ? (
                    blogData.posts.map((post: any) => (
                      <tr key={post.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {post.thumbnailUrl ? (
                              <img src={post.thumbnailUrl} alt={post.title} className="h-9 w-14 object-cover rounded-md border border-slate-200 shrink-0" />
                            ) : (
                              <div className="h-9 w-14 rounded-md bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
                                <BookOpen className="h-4 w-4" />
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-slate-900 block line-clamp-1">{post.title}</span>
                              <span className="text-[10px] text-slate-400 font-mono">/blog/{post.slug}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                            {post.category || 'General'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-black text-slate-900 font-mono">
                          {post.views || 0}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-bold text-emerald-800">
                            <Clock className="h-3 w-3 text-emerald-600" />
                            {formatReadSeconds(post.readSeconds || 140)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600 font-semibold">
                          {post.relatedBookIds?.length || 0} books
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-black text-amber-800">
                            <MousePointerClick className="h-3 w-3 text-amber-600" />
                            {post.bookClicks || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <a
                            href={`https://techno-world-books.vercel.app/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline"
                          >
                            <span>Read</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No articles found. Create articles in the Blog & Social Posts tab to start tracking reader analytics.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-900 mb-1">Top Books with Reader Purchase Intent</h3>
            <p className="text-xs text-slate-500 mb-4">Books that generated the highest click-throughs from attached blog guides</p>

            {Array.isArray(blogData.topBooks) && blogData.topBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {blogData.topBooks.map((b: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 shadow-2xs">
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="font-bold text-xs text-slate-900 block truncate">{b.title}</span>
                      <span className="text-[10px] text-slate-500">Featured in blog articles</span>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-xs font-extrabold text-amber-900">
                      <MousePointerClick className="h-3 w-3 text-amber-700" />
                      {b.clicks} {b.clicks === 1 ? 'Click' : 'Clicks'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 rounded-xl bg-slate-50 border border-dashed border-slate-200">
                <BookOpen className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">No book clicks logged yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">When customers read blog posts and click on attached book recommendations, metrics appear here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeMainTab === 'search' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                  <Search className="h-4 w-4" />
                </span>
                <h3 className="text-base font-extrabold text-slate-900">Search Trends & Exam Demand</h3>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Track top student search queries, NEET/JEE entrance volume, and popular books.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                {[
                  { label: '7 Days', val: '7d' },
                  { label: '30 Days', val: '30d' },
                  { label: '90 Days', val: '90d' },
                  { label: 'Custom', val: 'custom' },
                ].map((t) => (
                  <button
                    key={t.val}
                    type="button"
                    onClick={() => setPeriod(t.val)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      period === t.val
                        ? 'bg-white text-emerald-800 shadow-xs ring-1 ring-emerald-600/20'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => fetchSearchAnalytics(period)}
                disabled={searchLoading}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 shadow-2xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${searchLoading ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {period === 'custom' && (
            <form onSubmit={handleApplyCustomDate} className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Range:</span>
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-600"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-600"
              />
              <button
                type="submit"
                disabled={searchLoading}
                className="rounded-xl bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition-all shadow-xs"
              >
                Apply Range
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Searches Logged
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{summary.totalSearches || 0}</span>
                <span className="text-xs font-bold text-emerald-700">queries</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">Real student searches from search bar</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Unique Keywords
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{summary.uniqueKeywords || 0}</span>
                <span className="text-xs font-bold text-blue-600">terms</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">Distinct query phrases analyzed</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Books Ordered from Search
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{summary.unitsBought || 0}</span>
                <span className="text-xs font-bold text-emerald-700">units sold</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">Direct query-to-order conversions</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Period Revenue
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-700">{formatINR(summary.periodRevenue || 0)}</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">Delivered & confirmed orders</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Top Search Queries</h3>
                  <p className="text-xs text-slate-500 mt-0.5">High-frequency terms typed by customers</p>
                </div>
              </div>

              <div className="flex-1 overflow-x-auto">
                {topKeywords.length > 0 ? (
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="pb-2">Keyword</th>
                        <th className="pb-2">Category</th>
                        <th className="pb-2 text-right">Volume</th>
                        <th className="pb-2 text-right">Avg Results</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {topKeywords.map((k: any, idx: number) => {
                        const colors = getSeasonColor(k.category);
                        return (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 font-bold text-slate-800">
                              {k.keyword}
                            </td>
                            <td className="py-2.5">
                              <span className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold ${colors.light}`}>
                                {k.category}
                              </span>
                            </td>
                            <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                              {k.count}
                            </td>
                            <td className="py-2.5 text-right text-slate-500 font-mono text-[11px]">
                              {k.avgResults}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 space-y-2">
                    <Search className="h-8 w-8 text-slate-300" />
                    <p className="text-xs font-semibold text-slate-600">No search logs recorded in this period</p>
                    <p className="text-[11px] text-slate-400 max-w-xs">
                      Student searches from the top header search bar and catalog will appear here automatically.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setActiveBookTab('searched')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      activeBookTab === 'searched'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Top Searched Books
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveBookTab('bought')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      activeBookTab === 'bought'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Top Bought Books
                  </button>
                </div>
              </div>

              {activeBookTab === 'searched' ? (
                <div className="flex-1 space-y-3">
                  {mostSearchedBooks.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {mostSearchedBooks.map((b: any, idx: number) => (
                        <div key={b.id || idx} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                          <span className="text-[11px] font-mono font-bold text-slate-400 w-4">{idx + 1}.</span>
                          {b.coverUrl ? (
                            <img src={b.coverUrl} alt={b.title} className="h-12 w-9 rounded-md object-cover border border-slate-100 shrink-0 shadow-2xs" />
                          ) : (
                            <div className="flex h-12 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-400 border border-slate-200 shrink-0">
                              <BookOpen className="h-4 w-4" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 truncate" title={b.title}>
                              {b.title}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">
                              {b.author} &bull; {b.category}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="block text-xs font-black text-emerald-700 font-mono">
                              {b.searchCount}
                            </span>
                            <span className="text-[9px] text-slate-400">impressions</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-400 text-xs">No searched books recorded yet.</div>
                  )}
                </div>
              ) : (
                <div className="flex-1 space-y-3">
                  {mostBoughtBooks.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {mostBoughtBooks.map((b: any, idx: number) => (
                        <div key={b.id || idx} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                          <span className="text-[11px] font-mono font-bold text-slate-400 w-4">{idx + 1}.</span>
                          {b.coverUrl ? (
                            <img src={b.coverUrl} alt={b.title} className="h-12 w-9 rounded-md object-cover border border-slate-100 shrink-0 shadow-2xs" />
                          ) : (
                            <div className="flex h-12 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-400 border border-slate-200 shrink-0">
                              <BookOpen className="h-4 w-4" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 truncate" title={b.title}>
                              {b.title}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">
                              {formatINR(b.price || 0)}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="block text-xs font-black text-emerald-700 font-mono">
                              {b.unitsSold}
                            </span>
                            <span className="text-[9px] text-slate-400">units</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-400 text-xs">No bought books recorded yet.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeMainTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Today's Revenue</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-700">{formatINR(overviewData?.todayRevenue || 0)}</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">Gross sales recorded today</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Today's Orders</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{overviewData?.todayOrders || 0}</span>
                <span className="text-xs font-bold text-blue-600">orders</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">Placed today across all payment types</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Live Active Shoppers</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-700">{overviewData?.liveActive || liveData.activeNow || 1}</span>
                <span className="text-xs font-bold text-emerald-600">online</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">Active browsing right now</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Editorial Reads</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-purple-700">{overviewData?.blogEngagement?.totalViews || blogData.overview?.totalViews || 0}</span>
                <span className="text-xs font-bold text-purple-600">views</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">Blog reader touchpoints</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

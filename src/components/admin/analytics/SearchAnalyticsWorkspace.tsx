import React, { useState, useEffect } from 'react';
import {
  Search, Calendar, TrendingUp, ShoppingCart, IndianRupee,
  BookOpen, Flame, RefreshCw, BarChart3
} from 'lucide-react';
import { adminService } from '@/services/api';
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
  const [period, setPeriod] = useState<string>('30d');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>(DEFAULT_ANALYTICS_DATA);
  const [activeBookTab, setActiveBookTab] = useState<'searched' | 'bought'>('searched');

  const fetchAnalytics = async (customPeriod = period, customStart = startDate, customEnd = endDate) => {
    setLoading(true);
    try {
      const params: any = { period: customPeriod };
      if (customPeriod === 'custom') {
        if (customStart) params.startDate = customStart;
        if (customEnd) params.endDate = customEnd;
      }
      const res = await adminService.getSearchTrends(params);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setData(DEFAULT_ANALYTICS_DATA);
      }
    } catch (err: any) {
      console.warn('Search analytics initializing or unavailable, using baseline data:', err.message);
      setData(DEFAULT_ANALYTICS_DATA);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(period);
  }, [period]);

  const handleApplyCustomDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) {
      toast.error('Please select a start date');
      return;
    }
    fetchAnalytics('custom', startDate, endDate);
  };

  const summary = data?.summary || {};
  const seasonBreakdown = data?.examSeasonBreakdown || {};
  const topKeywords = data?.topKeywords || [];
  const mostSearchedBooks = data?.mostSearchedBooks || [];
  const mostBoughtBooks = data?.mostBoughtBooks || [];

  // Calculate percentage distribution for Exam Seasons
  const totalSeasonSearches = Object.values(seasonBreakdown).reduce((acc: number, val: any) => acc + Number(val || 0), 0) as number;

  const getSeasonColor = (season: string) => {
    switch (season) {
      case 'NEET / Medical': return { bg: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'JEE / Engineering': return { bg: 'bg-blue-500', light: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'UPSC / Govt Exams': return { bg: 'bg-amber-500', light: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'School & Boards': return { bg: 'bg-purple-500', light: 'bg-purple-50 text-purple-700 border-purple-200' };
      default: return { bg: 'bg-slate-400', light: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar: Header & Date Filter Dropdown */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <TrendingUp className="h-4 w-4" />
            </span>
            <h2 className="text-lg font-black text-slate-900">
              Search Keywords & Exam Seasons Intelligence
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track student search queries, entrance exam seasons (NEET, JEE, UPSC), and top bought books over time.
          </p>
        </div>

        {/* Date Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white transition-colors"
            >
              <option value="30d">Last 30 Days (Standard Tracking)</option>
              <option value="today">Today (Real-time)</option>
              <option value="7d">Last 7 Days (Recent Surge)</option>
              <option value="90d">Last 90 Days (Exam Seasons: NEET/JEE/UPSC)</option>
              <option value="year">Past 1 Year (Annual Cycle)</option>
              <option value="custom">Custom Date Range...</option>
            </select>
          </div>

          <button
            onClick={() => fetchAnalytics()}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            title="Refresh analytics data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Custom Date Range Selector (Only visible if period === 'custom') */}
      {period === 'custom' && (
        <form onSubmit={handleApplyCustomDate} className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 animate-in fade-in">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">End Date (Optional)</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-xs"
          >
            Apply Range Filter
          </button>
        </form>
      )}

      {/* Active Range Indicator */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing tracking data for:{' '}
          <b className="text-slate-800">
            {period === '30d' ? 'Last 30 Days' :
             period === 'today' ? 'Today' :
             period === '7d' ? 'Last 7 Days' :
             period === '90d' ? 'Last 90 Days (Exam Seasons)' :
             period === 'year' ? 'Past 1 Year' :
             `${startDate || 'Start'} to ${endDate || 'Now'}`}
          </b>
          {data?.startDate && (
            <span className="text-[11px] text-slate-400 ml-2">
              ({new Date(data.startDate).toLocaleDateString('en-IN')} &ndash; {new Date(data.endDate).toLocaleDateString('en-IN')})
            </span>
          )}
        </span>
        <span>
          Unique Keywords Searched: <b className="text-slate-800">{summary.uniqueKeywords || 0}</b>
        </span>
      </div>

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Total Searches */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Searches</span>
            <Search className="h-4 w-4 text-emerald-700" />
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">
            {(summary.totalSearches || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Storefront queries in period
          </p>
        </div>

        {/* Dominant Exam Season */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Peak Exam Season</span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-3 text-lg font-black text-slate-900 truncate" title={summary.dominantSeason}>
            {summary.dominantSeason || 'General Academic'}
          </p>
          <p className="text-[11px] font-semibold text-amber-700 mt-1">
            {summary.dominantSeasonCount ? `${summary.dominantSeasonCount} search hits` : 'Balanced student traffic'}
          </p>
        </div>

        {/* Total Books Bought */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Units Bought</span>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">
            {(summary.totalUnitsSold || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Copies sold in this period
          </p>
        </div>

        {/* Period Revenue */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Period Book Revenue</span>
            <IndianRupee className="h-4 w-4 text-emerald-700" />
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">
            {formatINR(summary.totalRevenue || 0)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            From orders placed in range
          </p>
        </div>
      </div>

      {/* Exam Season Distribution & Trend Analysis Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-700" />
              Exam Season Demand Breakdown (NEET &bull; JEE &bull; UPSC &bull; Boards)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Identifies which student entrance exam is currently trending so you can adjust warehouse stock and publisher orders.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Based on keyword categorisation
          </span>
        </div>

        {/* Distribution Progress Bars */}
        <div className="space-y-3 pt-1">
          {Object.entries(seasonBreakdown).map(([season, count]: [string, any]) => {
            const countNum = Number(count || 0);
            const pct = totalSeasonSearches > 0 ? Math.round((countNum / totalSeasonSearches) * 100) : 0;
            const colors = getSeasonColor(season);

            return (
              <div key={season} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span>{season}</span>
                    {season === summary.dominantSeason && countNum > 0 && (
                      <span className="rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.2">
                        Trending Season
                      </span>
                    )}
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    <b>{countNum}</b> searches ({pct}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${colors.bg}`}
                    style={{ width: `${Math.max(pct, countNum > 0 ? 3 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Analytics Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column (7 cols): Top Searched Keywords Table */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Search className="h-4 w-4 text-emerald-700" />
                Top Searched Keywords & Student Query Trends
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Exact terms typed into the store search bar with match volume.
              </p>
            </div>
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
              {topKeywords.length} Keywords
            </span>
          </div>

          <div className="flex-1 overflow-x-auto">
            {topKeywords.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-2.5">Search Keyword</th>
                    <th className="pb-2.5">Exam Category</th>
                    <th className="pb-2.5 text-right">Searches</th>
                    <th className="pb-2.5 text-right">Avg Results</th>
                    <th className="pb-2.5 text-right">Last Searched</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topKeywords.map((k: any, idx: number) => {
                    const colors = getSeasonColor(k.category);
                    return (
                      <tr key={k.query + idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 pr-2 font-bold text-slate-900">
                          <span className="flex items-center gap-1.5">
                            <span className="text-slate-400 font-mono text-[10px] w-4">{idx + 1}.</span>
                            <span className="capitalize">{k.query}</span>
                          </span>
                        </td>
                        <td className="py-2.5 pr-2">
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
                        <td className="py-2.5 text-right text-[10px] text-slate-400">
                          {k.lastSearched ? new Date(k.lastSearched).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '—'}
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

        {/* Right Column (5 cols): Most Searched Books vs Most Bought Books */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col">
          {/* Tab Switcher */}
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

          {/* Tab Content: Most Searched Books */}
          {activeBookTab === 'searched' && (
            <div className="flex-1 space-y-3">
              <p className="text-[11px] text-slate-500 mb-2">
                Books surfaced most frequently by student search queries in this timeframe:
              </p>
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
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-slate-900">{formatINR(b.price || 0)}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${b.stock <= 5 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                            {b.stock <= 0 ? 'Out of stock' : `${b.stock} left`}
                          </span>
                        </div>
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
                <div className="py-12 text-center text-slate-400 space-y-1">
                  <BookOpen className="h-6 w-6 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-600">No book match logs in this period</p>
                  <p className="text-[10px] text-slate-400">Books will populate as users search keywords.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Most Bought Books */}
          {activeBookTab === 'bought' && (
            <div className="flex-1 space-y-3">
              <p className="text-[11px] text-slate-500 mb-2">
                Best-selling titles ordered by customers within this date range:
              </p>
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
                          {b.author} &bull; {b.category}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-slate-900">{formatINR(b.price || 0)}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${b.stock <= 5 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                            {b.stock <= 0 ? 'Out of stock' : `${b.stock} left`}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block text-xs font-black text-blue-700 font-mono">
                          {b.unitsSold} sold
                        </span>
                        <span className="text-[10px] font-bold text-slate-600">
                          {formatINR(b.revenue || 0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 space-y-1">
                  <ShoppingCart className="h-6 w-6 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-600">No orders placed in this time range</p>
                  <p className="text-[10px] text-slate-400">Order items will show sales volume here.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Download,
  RefreshCw,
  Calendar,
  IndianRupee,
  ShoppingBag,
  BookOpen,
  Truck,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  PackageCheck,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { toast } from 'sonner';
import { salesReportService, type SalesReportParams } from '@/services/api';
import { formatINR } from '@/utils/helpers';

interface MonthData {
  month: string;
  label: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
  booksSold: number;
  shipping: number;
  discounts: number;
  tax: number;
  netRevenue: number;
  paymentBreakdown: Record<string, { count: number; amount: number }>;
  statusBreakdown: Record<string, number>;
}

interface TopBook {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
  quantitySold: number;
  revenue: number;
}

interface TopCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  orderCount: number;
  totalSpent: number;
}

interface ReportData {
  period: string;
  startDate: string;
  endDate: string;
  summary: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    totalBooksSold: number;
    totalShippingCollected: number;
    totalDiscountsGiven: number;
    totalTaxCollected: number;
    netRevenue: number;
  };
  monthly: MonthData[];
  daily: Array<{ date: string; label: string; revenue: number; orders: number }>;
  topBooks: TopBook[];
  topCustomers: TopCustomer[];
  paymentBreakdown: Record<string, { count: number; amount: number }>;
  statusBreakdown: Record<string, number>;
}

export default function SalesReportWorkspace() {
  const [period, setPeriod] = useState<'1month' | '3months' | '6months' | '1year' | 'custom'>('6months');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<ReportData | null>(null);

  // Fetch report data
  const fetchReport = async () => {
    try {
      setLoading(true);
      const params: SalesReportParams = { period };
      if (period === 'custom') {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }
      const res = await salesReportService.getReport(params);
      setData(res.data || res);
    } catch (err: any) {
      console.error('Failed to load sales report:', err);
      toast.error(err.message || 'Failed to fetch sales report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [period]);

  const handleCustomApply = () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date cannot be after end date');
      return;
    }
    fetchReport();
  };

  // Export to Tally CSV
  const handleExportTally = async () => {
    try {
      setExporting(true);
      const params: SalesReportParams = { period };
      if (period === 'custom') {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }
      toast.loading('Generating Tally CSV export...', { id: 'tally-export' });
      await salesReportService.downloadTallyCSV(params);
      toast.success('Sales report exported successfully!', { id: 'tally-export' });
    } catch (err: any) {
      console.error('Export error:', err);
      toast.error(err.message || 'Failed to export sales report', { id: 'tally-export' });
    } finally {
      setExporting(false);
    }
  };

  // Refresh Snapshots
  const handleRefreshSnapshots = async () => {
    try {
      setRefreshing(true);
      toast.loading('Refreshing historical sales snapshots in database...', { id: 'refresh-snap' });
      await salesReportService.refreshSnapshots(12);
      toast.success('Snapshots synchronized and persisted!', { id: 'refresh-snap' });
      fetchReport();
    } catch (err: any) {
      toast.error(err.message || 'Failed to refresh snapshots', { id: 'refresh-snap' });
    } finally {
      setRefreshing(false);
    }
  };

  const currentYearMonth = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  // Format payment breakdown array
  const paymentList = useMemo(() => {
    if (!data?.paymentBreakdown) return [];
    const totalAmount = data.summary.totalRevenue || 1;
    return Object.entries(data.paymentBreakdown).map(([method, item]) => ({
      method,
      count: item.count,
      amount: item.amount,
      pct: Math.round((item.amount / totalAmount) * 100),
    })).sort((a, b) => b.amount - a.amount);
  }, [data]);

  // Format status breakdown array
  const statusList = useMemo(() => {
    if (!data?.statusBreakdown) return [];
    const totalCount = Object.values(data.statusBreakdown).reduce((s, c) => s + c, 0) || 1;
    return Object.entries(data.statusBreakdown).map(([status, count]) => ({
      status,
      count,
      pct: Math.round((count / totalCount) * 100),
    })).sort((a, b) => b.count - a.count);
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Top Header / Action Bar (macOS style) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-white/[0.08] dark:bg-[#0f172a]">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-white/10 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <TrendingUp className="h-4 w-4" />
            </span>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Sales & Revenue Reports</h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Real-time sales analytics, persisted monthly aggregates & direct Tally accounting export
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefreshSnapshots}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 active:bg-slate-100 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-all disabled:opacity-40 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            title="Recalculate and persist monthly snapshots"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Snapshots</span>
          </button>

          <button
            onClick={handleExportTally}
            disabled={exporting || loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0071e3] hover:bg-[#0077ed] active:bg-[#0064c8] px-4 py-1.5 text-xs font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.12)] active:scale-[0.98] transition-all disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{exporting ? 'Exporting...' : 'Export for Tally (CSV)'}</span>
          </button>
        </div>
      </div>

      {/* Period Filter Bar (macOS Segmented Control) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-white/[0.08] dark:bg-[#0f172a]">
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100/90 p-0.5 border border-slate-200/60 dark:bg-slate-800/80 dark:border-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
          <span className="flex items-center gap-1 px-2.5 text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">
            <Calendar className="h-3.5 w-3.5 text-slate-400" /> Range:
          </span>
          {(['1month', '3months', '6months', '1year', 'custom'] as const).map((p) => {
            const labels: Record<string, string> = {
              '1month': 'Last 30 Days',
              '3months': '3 Months',
              '6months': '6 Months',
              '1year': '1 Year',
              custom: 'Custom Range',
            };
            const active = period === p;
            return (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-md px-3 py-1 text-xs transition-all ${
                  active
                    ? 'bg-white text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] dark:bg-slate-700 dark:text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium'
                }`}
              >
                {labels[p]}
              </button>
            );
          })}
        </div>

        {period === 'custom' && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200"
            />
            <button
              onClick={handleCustomApply}
              className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-bold text-white hover:bg-slate-800 dark:bg-emerald-700 dark:hover:bg-emerald-800"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-white/5 dark:bg-slate-800/60" />
          ))}
        </div>
      ) : !data ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-white/[0.08] dark:bg-[#0f172a]">
          <AlertCircle className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-3 text-base font-bold text-slate-800 dark:text-white">No sales data found</h3>
          <p className="mt-1 text-xs text-slate-500">Try selecting a different date range or period.</p>
        </div>
      ) : (
        <>
          {/* Key Metric Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Revenue */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#0f172a]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Gross Sales
                </span>
                <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                  <IndianRupee className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                {formatINR(data.summary.totalRevenue)}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Net: <strong className="text-slate-700 dark:text-slate-200">{formatINR(data.summary.netRevenue)}</strong></span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">Excl. returns</span>
              </div>
            </div>

            {/* Total Orders */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#0f172a]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Orders
                </span>
                <span className="rounded-lg bg-blue-50 p-2 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
                  <ShoppingBag className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                {data.summary.totalOrders.toLocaleString('en-IN')}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>AOV: <strong className="text-slate-700 dark:text-slate-200">{formatINR(data.summary.avgOrderValue)}</strong></span>
                <span className="text-[11px] text-slate-400">Per valid order</span>
              </div>
            </div>

            {/* Books Sold */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#0f172a]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Books Sold
                </span>
                <span className="rounded-lg bg-indigo-50 p-2 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400">
                  <BookOpen className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                {data.summary.totalBooksSold.toLocaleString('en-IN')}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Units delivered / active</span>
                <span className="text-[11px] text-indigo-700 dark:text-indigo-400 font-semibold">Total items</span>
              </div>
            </div>

            {/* Shipping & Tax */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#0f172a]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Shipping & Taxes
                </span>
                <span className="rounded-lg bg-amber-50 p-2 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                  <Truck className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                {formatINR(data.summary.totalShippingCollected)}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>GST: <strong className="text-slate-700 dark:text-slate-200">{formatINR(data.summary.totalTaxCollected)}</strong></span>
                <span>Discounts: <strong className="text-rose-600">-{formatINR(data.summary.totalDiscountsGiven)}</strong></span>
              </div>
            </div>
          </div>

          {/* Revenue Trajectory Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#0f172a]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Revenue Trajectory</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Daily revenue curve over the active reporting window
                </p>
              </div>
              <div className="mt-2 sm:mt-0 flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Daily Revenue
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              {data.daily.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.daily} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-white/10 dark:bg-slate-900">
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{item.label}</p>
                              <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                                {formatINR(item.revenue)}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {item.orders} {item.orders === 1 ? 'order' : 'orders'}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#059669"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#salesGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                  No daily sales recorded in this interval
                </div>
              )}
            </div>
          </div>

          {/* Payment Methods & Order Status Breakdown */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Payment Method Split */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#0f172a]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Payment Methods Split</h3>
                </div>
                <span className="text-xs text-slate-400">By Total Value</span>
              </div>

              <div className="mt-4 space-y-3">
                {paymentList.length > 0 ? (
                  paymentList.map((p) => (
                    <div key={p.method} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {p.method}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          <strong>{formatINR(p.amount)}</strong> ({p.count} orders · {p.pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(2, p.pct))}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No payment data recorded</p>
                )}
              </div>
            </div>

            {/* Order Status Split */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#0f172a]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Fulfillment Status Split</h3>
                </div>
                <span className="text-xs text-slate-400">By Order Volume</span>
              </div>

              <div className="mt-4 space-y-3">
                {statusList.length > 0 ? (
                  statusList.map((s) => {
                    const isPositive = ['DELIVERED', 'SHIPPED', 'CONFIRMED'].includes(s.status);
                    const isNegative = ['CANCELLED', 'REFUNDED'].includes(s.status);
                    return (
                      <div key={s.status} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {s.status}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400">
                            {s.count} orders ({s.pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isNegative ? 'bg-rose-500' : isPositive ? 'bg-emerald-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(2, s.pct))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No status data recorded</p>
                )}
              </div>
            </div>
          </div>

          {/* Monthly Audit Table (Persisted in DB) */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-white/[0.08] dark:bg-[#0f172a]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 border-b border-slate-100 dark:border-white/5">
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Monthly Accounting Audit Table
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Aggregated and persisted records up to 1 year for Tally balancing
                </p>
              </div>

              <span className="mt-2 sm:mt-0 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Database Persisted
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-white/5 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-3.5">Month</th>
                    <th className="px-4 py-3.5 text-right">Gross Sales</th>
                    <th className="px-4 py-3.5 text-right">Orders</th>
                    <th className="px-4 py-3.5 text-right">AOV</th>
                    <th className="px-4 py-3.5 text-right">Books Sold</th>
                    <th className="px-4 py-3.5 text-right">Shipping</th>
                    <th className="px-4 py-3.5 text-right">Discounts</th>
                    <th className="px-4 py-3.5 text-right">Tax (GST)</th>
                    <th className="px-5 py-3.5 text-right">Net Sales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {data.monthly.map((m) => {
                    const isLive = m.month === currentYearMonth;
                    return (
                      <tr
                        key={m.month}
                        className={`hover:bg-slate-50/80 transition-colors dark:hover:bg-slate-800/40 ${
                          isLive ? 'bg-emerald-50/30 dark:bg-emerald-950/20' : ''
                        }`}
                      >
                        <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span>{m.label}</span>
                            {isLive && (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                                Live
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-slate-900 dark:text-white">
                          {formatINR(m.revenue)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-semibold">
                          {m.orders.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {formatINR(m.avgOrderValue)}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {m.booksSold.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3.5 text-right text-slate-500">
                          {formatINR(m.shipping)}
                        </td>
                        <td className="px-4 py-3.5 text-right text-rose-600 font-medium">
                          {m.discounts > 0 ? `-${formatINR(m.discounts)}` : '₹0'}
                        </td>
                        <td className="px-4 py-3.5 text-right text-slate-500">
                          {formatINR(m.tax)}
                        </td>
                        <td className="px-5 py-3.5 text-right font-extrabold text-emerald-700 dark:text-emerald-400">
                          {formatINR(m.netRevenue)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Total Summary Footer Row */}
                <tfoot className="border-t-2 border-slate-200 bg-slate-50/90 font-bold text-slate-900 dark:border-white/10 dark:bg-slate-800/80 dark:text-white">
                  <tr>
                    <td className="px-5 py-4 uppercase text-[11px] tracking-wider text-slate-500">Total Period</td>
                    <td className="px-4 py-4 text-right text-sm font-extrabold text-slate-900 dark:text-white">
                      {formatINR(data.summary.totalRevenue)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {data.summary.totalOrders.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {formatINR(data.summary.avgOrderValue)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {data.summary.totalBooksSold.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {formatINR(data.summary.totalShippingCollected)}
                    </td>
                    <td className="px-4 py-4 text-right text-rose-600">
                      -{formatINR(data.summary.totalDiscountsGiven)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {formatINR(data.summary.totalTaxCollected)}
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                      {formatINR(data.summary.netRevenue)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Top Selling Books & Top Customers */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Top Books */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#0f172a]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top 10 Selling Books</h3>
                </div>
                <span className="text-xs text-slate-400">By Units Sold</span>
              </div>

              <div className="mt-4 divide-y divide-slate-100 dark:divide-white/5">
                {data.topBooks.length > 0 ? (
                  data.topBooks.map((b, idx) => (
                    <div key={b.id} className="flex items-center justify-between py-2.5">
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200" title={b.title}>
                            {b.title}
                          </p>
                          <p className="truncate text-[11px] text-slate-400">
                            {b.author}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {b.quantitySold} sold
                        </p>
                        <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                          {formatINR(b.revenue)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No book sales in this interval</p>
                )}
              </div>
            </div>

            {/* Top Customers */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#0f172a]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <PackageCheck className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top 10 Customers</h3>
                </div>
                <span className="text-xs text-slate-400">By Lifetime Spend</span>
              </div>

              <div className="mt-4 divide-y divide-slate-100 dark:divide-white/5">
                {data.topCustomers.length > 0 ? (
                  data.topCustomers.map((c, idx) => (
                    <div key={c.id} className="flex items-center justify-between py-2.5">
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200" title={c.name}>
                            {c.name}
                          </p>
                          <p className="truncate text-[11px] text-slate-400">
                            {c.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          {formatINR(c.totalSpent)}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {c.orderCount} {c.orderCount === 1 ? 'order' : 'orders'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No customer orders in this interval</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

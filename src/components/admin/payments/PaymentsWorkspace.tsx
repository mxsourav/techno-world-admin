import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  CreditCard,
  Search,
  Download,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  IndianRupee,
  ShieldCheck,
  TrendingUp,
  Building2,
  Wallet,
  FileText,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { paymentService } from '@/services/api';
import { formatINR } from '@/utils/helpers';
import { toast } from 'sonner';

interface PaymentsWorkspaceProps {
  onPreviewOrder?: (order: any) => void;
}

export default function PaymentsWorkspace({ onPreviewOrder }: PaymentsWorkspaceProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const subTab = searchParams.get('sub') || 'overview';

  const [overview, setOverview] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filters for settlements
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Status Update & Refund Modal
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [updateStatus, setUpdateStatus] = useState<'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED'>('PAID');
  const [paymentIdInput, setPaymentIdInput] = useState<string>('');
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [refundReason, setRefundReason] = useState<string>('Damaged / Defective Book Returned');
  const [customRefundNote, setCustomRefundNote] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // SPF Claim Modal
  const [isSpfModalOpen, setIsSpfModalOpen] = useState<boolean>(false);
  const [spfOrderId, setSpfOrderId] = useState<string>('');
  const [spfReason, setSpfReason] = useState<string>('Lost in Postal Transit (India Post)');
  const [spfClaimAmount, setSpfClaimAmount] = useState<string>('');

  // Earnings timeframe
  const [earningsTimeframe, setEarningsTimeframe] = useState<'today' | 'week' | 'month' | 'lifetime'>('lifetime');

  const setSubTab = (tab: string) => {
    const params = new URLSearchParams(location.search);
    params.set('tab', 'payments');
    params.set('sub', tab);
    navigate(`/admin/dashboard?${params.toString()}`);
  };

  const loadData = async (showToast = false) => {
    try {
      setIsRefreshing(true);
      const [overviewRes, txRes] = await Promise.all([
        paymentService.getOverview(),
        paymentService.getTransactions({ limit: 100 }),
      ]);

      if (overviewRes.success) {
        setOverview(overviewRes.data);
      }
      if (txRes.success) {
        setTransactions(txRes.data || []);
      }
      if (showToast) {
        toast.success('Payments and settlements data refreshed successfully!');
      }
    } catch (err: any) {
      console.error('Failed to load payments data:', err);
      toast.error('Unable to fetch payment records');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // Fast polling every 10 seconds for real-time payments
    const timer = setInterval(() => loadData(false), 10000);
    return () => clearInterval(timer);
  }, []);

  // Filtered transactions for the Settlements table
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // If on the dedicated refunds tab, only show REFUNDED items
      if (subTab === 'refunds' && tx.paymentStatus !== 'REFUNDED') {
        return false;
      }

      if (statusFilter !== 'ALL' && tx.paymentStatus !== statusFilter) {
        return false;
      }

      if (methodFilter !== 'ALL') {
        if (methodFilter === 'COD' && tx.normalizedMethod !== 'COD') return false;
        if (methodFilter === 'ONLINE' && tx.normalizedMethod === 'COD') return false;
        if (['UPI', 'CARD', 'NETBANKING'].includes(methodFilter) && tx.normalizedMethod !== methodFilter) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchOrder = tx.orderNumber?.toLowerCase().includes(q);
        const matchPayId = tx.paymentId?.toLowerCase().includes(q);
        const matchName = tx.customer?.name?.toLowerCase().includes(q);
        const matchPhone = tx.customer?.phone?.toLowerCase().includes(q);
        if (!matchOrder && !matchPayId && !matchName && !matchPhone) return false;
      }

      return true;
    });
  }, [transactions, statusFilter, methodFilter, searchQuery, subTab]);

  // Handle open modal for status change / refund
  const openStatusModal = (tx: any) => {
    setSelectedTx(tx);
    setUpdateStatus(tx.paymentStatus || 'PAID');
    setPaymentIdInput(tx.paymentId || '');
    setRefundAmount(String(tx.grossAmount || ''));
    setRefundReason('Damaged / Defective Book Returned');
    setCustomRefundNote('');
  };

  // Submit payment status / refund update
  const handleSavePaymentStatus = async () => {
    if (!selectedTx) return;

    try {
      setIsUpdating(true);
      const payload: any = {
        paymentStatus: updateStatus,
        paymentId: paymentIdInput.trim() || undefined,
        notes: customRefundNote.trim() || undefined,
      };

      if (updateStatus === 'REFUNDED') {
        payload.refundAmount = parseFloat(refundAmount) || selectedTx.grossAmount;
        payload.refundReason = refundReason;
      }

      const res = await paymentService.updatePaymentStatus(selectedTx.orderId, payload);
      if (res.success) {
        toast.success(res.message || 'Payment updated successfully!');
        setSelectedTx(null);
        loadData(false);
      } else {
        toast.error(res.message || 'Failed to update payment status');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('An error occurred while updating payment');
    } finally {
      setIsUpdating(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error('No transactions available to export');
      return;
    }

    const headers = [
      'Order Number',
      'Transaction Ref / Razorpay ID',
      'Date & Time',
      'Customer Name',
      'Customer Phone',
      'Customer Email',
      'Payment Method',
      'Payment Status',
      'Gross Amount (INR)',
      'Gateway Fee (INR)',
      'Net Settled (INR)',
      'Refund Reason'
    ];

    const rows = filteredTransactions.map((tx) => [
      `"${tx.orderNumber || ''}"`,
      `"${tx.paymentId || ''}"`,
      `"${new Date(tx.createdAt).toLocaleString('en-IN')}"`,
      `"${tx.customer?.name || ''}"`,
      `"${tx.customer?.phone || ''}"`,
      `"${tx.customer?.email || ''}"`,
      `"${tx.paymentMethod || 'COD'}"`,
      `"${tx.paymentStatus || ''}"`,
      tx.grossAmount || 0,
      tx.estimatedGatewayFee || 0,
      tx.netSettled || 0,
      `"${tx.refundInfo?.refundReason || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `techno_world_settlements_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Settlement CSV exported successfully!');
  };

  // SPF submit dummy handler
  const handleFileSpfClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spfOrderId) {
      toast.error('Please enter the Order ID');
      return;
    }
    toast.success(`SPF Claim submitted for Order #${spfOrderId} (Amount: ₹${spfClaimAmount || 'Full Value'}). Status: Under Review.`);
    setIsSpfModalOpen(false);
    setSpfOrderId('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Razorpay Integration Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <CreditCard className="h-6 w-6 text-emerald-600" />
              Payments & Settlement Hub
            </h1>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Live Flipkart Style
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time settlement tracking, payment method distribution, order-wise reconciliation, and refunds monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh payments data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            Refresh
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs matching Flipkart Seller Hub */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setSubTab('overview')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            subTab === 'overview'
              ? 'border-emerald-600 text-emerald-600 bg-emerald-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Building2 className="h-4 w-4" />
          Payments Overview
        </button>

        <button
          onClick={() => setSubTab('earnings')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            subTab === 'earnings'
              ? 'border-[#c2185b] text-[#c2185b] bg-rose-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Earnings Summary</span>
          <span className="bg-[#c2185b] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-xs">
            New
          </span>
        </button>

        <button
          onClick={() => setSubTab('settlements')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            subTab === 'settlements'
              ? 'border-emerald-600 text-emerald-600 bg-emerald-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Search className="h-4 w-4" />
          Search Order-wise Settlements
        </button>

        <button
          onClick={() => setSubTab('refunds')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            subTab === 'refunds'
              ? 'border-purple-600 text-purple-700 bg-purple-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <RotateCcw className="h-4 w-4" />
          Refunds Monitoring
          {overview?.counts?.refunded > 0 && (
            <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
              {overview.counts.refunded}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('transactions')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            subTab === 'transactions'
              ? 'border-emerald-600 text-emerald-600 bg-emerald-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <FileText className="h-4 w-4" />
          Services Transaction History
        </button>

        <button
          onClick={() => setSubTab('spf')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            subTab === 'spf'
              ? 'border-emerald-600 text-emerald-600 bg-emerald-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          Seller Protection Fund (SPF)
        </button>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-emerald-600 mb-3" />
          <p className="text-sm font-bold text-slate-800">Loading settlement records & financials...</p>
          <p className="text-xs text-slate-400 mt-1">Aggregating live transactions and payment statuses...</p>
        </div>
      ) : (
        <>
          {/* ─────────────────────────────────────────────────────────────
              1. SUB-TAB: PAYMENTS OVERVIEW
             ───────────────────────────────────────────────────────────── */}
          {subTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 5 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Gross Volume */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Gross Sales</span>
                <IndianRupee className="h-4 w-4 text-slate-400" />
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {overview ? formatINR(overview.grossVolume) : '₹0'}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-slate-500">
                <span>{overview?.counts?.total || 0} total orders placed</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900" />
            </div>

            {/* Net Settled */}
            <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs relative overflow-hidden bg-gradient-to-br from-white to-emerald-50/30">
              <div className="flex items-center justify-between text-emerald-600 mb-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">Settled to Bank</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700 tracking-tight">
                {overview ? formatINR(overview.settledVolume) : '₹0'}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-700">
                <span>{overview?.counts?.paid || 0} Successful (Paid)</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
            </div>

            {/* Pending Settlements */}
            <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs relative overflow-hidden bg-gradient-to-br from-white to-amber-50/30">
              <div className="flex items-center justify-between text-amber-600 mb-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">Unsettled / Pending</span>
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-700 tracking-tight">
                {overview ? formatINR(overview.pendingSettlements) : '₹0'}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-amber-700">
                <span>{overview?.counts?.pending || 0} Pending orders</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
            </div>

            {/* Total Refunds */}
            <div className="bg-white p-5 rounded-2xl border border-rose-200/80 shadow-xs relative overflow-hidden bg-gradient-to-br from-white to-rose-50/30">
              <div className="flex items-center justify-between text-rose-600 mb-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600">Total Refunds</span>
                <RotateCcw className="h-4 w-4 text-rose-600" />
              </div>
              <div className="text-2xl font-black text-rose-700 tracking-tight">
                {overview ? formatINR(overview.refundedVolume) : '₹0'}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-rose-700">
                <span>{overview?.counts?.refunded || 0} Returned / Refunded</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500" />
            </div>

            {/* COD Pending Collection */}
            <div className="bg-white p-5 rounded-2xl border border-blue-200/80 shadow-xs relative overflow-hidden bg-gradient-to-br from-white to-blue-50/30">
              <div className="flex items-center justify-between text-blue-600 mb-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600">COD In-Transit</span>
                <Wallet className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-700 tracking-tight">
                {overview ? formatINR(overview.codPendingCollection) : '₹0'}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-blue-700">
                <span>Awaiting delivery cash</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
            </div>
          </div>

          {/* Two Columns: Settlement Details & Method Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Settlement Cycle & Bank Status */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-emerald-600" />
                  Bank Settlement Cycle
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  ACTIVE
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <span className="text-slate-500 font-medium">Settlement Policy</span>
                  <span className="font-bold text-slate-900">T+2 Business Days</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <span className="text-slate-500 font-medium">Next Projected Payout</span>
                  <span className="font-bold text-emerald-700">
                    {overview?.settlementCycle?.nextEstimatedPayoutDate
                      ? new Date(overview.settlementCycle.nextEstimatedPayoutDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Next Working Day'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <span className="text-slate-500 font-medium">Settlement Cutoff</span>
                  <span className="font-bold text-slate-900">11:59 PM Daily</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <span className="text-slate-500 font-medium">Bank Account</span>
                  <span className="font-bold text-slate-900">State Bank of India (••• 4091)</span>
                </div>
              </div>

              {/* Razorpay Readiness Banner */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span className="font-black text-xs text-blue-900">Razorpay API Integration</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  {overview?.razorpayIntegration?.isConfigured
                    ? `Live Gateway Configured (Key ID: ${overview.razorpayIntegration.keyIdPrefix}). Instant UPI intent & auto-webhook active.`
                    : 'System is configured with Razorpay webhooks & transaction listeners. Provide API keys to switch to 100% automated live payouts.'}
                </p>
                <div className="text-[10px] text-blue-700 font-mono">
                  Endpoint: /api/v1/payments/razorpay/webhook
                </div>
              </div>
            </div>

            {/* Payment Methods Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  Payment Methods Distribution
                </h3>
                <span className="text-xs text-slate-400 font-medium">Share of Total Revenue</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* UPI */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        UPI
                      </div>
                      <span className="text-xs font-bold text-slate-800">UPI / QR Code</span>
                    </div>
                    <span className="text-xs font-black text-emerald-700">
                      {overview ? formatINR(overview.methodBreakdown?.UPI?.volume || 0) : '₹0'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    PhonePe, Google Pay, Paytm, BHIM ({overview?.methodBreakdown?.UPI?.count || 0} orders)
                  </p>
                </div>

                {/* Cards */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        💳
                      </div>
                      <span className="text-xs font-bold text-slate-800">Debit / Credit Cards</span>
                    </div>
                    <span className="text-xs font-black text-blue-700">
                      {overview ? formatINR(overview.methodBreakdown?.CARD?.volume || 0) : '₹0'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Visa, MasterCard, RuPay ({overview?.methodBreakdown?.CARD?.count || 0} orders)
                  </p>
                </div>

                {/* Net Banking */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                        🏛️
                      </div>
                      <span className="text-xs font-bold text-slate-800">Net Banking</span>
                    </div>
                    <span className="text-xs font-black text-purple-700">
                      {overview ? formatINR(overview.methodBreakdown?.NETBANKING?.volume || 0) : '₹0'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    50+ Indian banks ({overview?.methodBreakdown?.NETBANKING?.count || 0} orders)
                  </p>
                </div>

                {/* COD */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                        💵
                      </div>
                      <span className="text-xs font-bold text-slate-800">Cash on Delivery</span>
                    </div>
                    <span className="text-xs font-black text-amber-700">
                      {overview ? formatINR(overview.methodBreakdown?.COD?.volume || 0) : '₹0'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Pay on Parcel Handover ({overview?.methodBreakdown?.COD?.count || 0} orders)
                  </p>
                </div>
              </div>

              {/* Quick Jump to Settlements */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSubTab('settlements')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                >
                  View all order settlements & transactions <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Recent 10 Transactions Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">Recent Payment Transactions</h3>
                <p className="text-xs text-slate-400 mt-0.5">Real-time incoming orders & settlement states</p>
              </div>
              <button
                onClick={() => setSubTab('settlements')}
                className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-100 text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">Order Number</th>
                    <th className="px-5 py-3.5">Payment Reference</th>
                    <th className="px-5 py-3.5">Date & Time</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Method</th>
                    <th className="px-5 py-3.5">Amount</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overview?.recentTransactions?.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-400">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    overview?.recentTransactions?.map((tx: any) => {
                      const dateStr = new Date(tx.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-slate-900">
                            #{tx.orderNumber}
                          </td>
                          <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">
                            {tx.paymentId}
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-slate-400" />
                              {dateStr}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-medium text-slate-700">
                            {tx.customerName}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {tx.paymentMethod}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-black text-slate-900">
                            {formatINR(tx.totalAmount)}
                          </td>
                          <td className="px-5 py-3.5">
                            {tx.paymentStatus === 'PAID' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="h-3 w-3" /> Successful
                              </span>
                            ) : tx.paymentStatus === 'REFUNDED' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                                <RotateCcw className="h-3 w-3" /> Refunded
                              </span>
                            ) : tx.paymentStatus === 'FAILED' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                <XCircle className="h-3 w-3" /> Failed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                <Clock className="h-3 w-3" /> Pending
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => {
                                const fullTx = transactions.find((t) => t.id === tx.id) || tx;
                                openStatusModal(fullTx);
                              }}
                              className="text-xs font-bold text-slate-700 hover:text-emerald-700 hover:underline cursor-pointer"
                            >
                              Update Status
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. SUB-TAB: EARNINGS SUMMARY (with "New" badge)
         ───────────────────────────────────────────────────────────── */}
      {subTab === 'earnings' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900">Seller Earnings & Payout Breakdown</h2>
                  <span className="bg-[#c2185b] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-xs">
                    New
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Transparent breakdown of catalog earnings, shipping fees collected, deductions, and projected net deposit.
                </p>
              </div>

              {/* Timeframe selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {(['today', 'week', 'month', 'lifetime'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setEarningsTimeframe(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                      earningsTimeframe === t
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Payout Projection Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-100">
                  Estimated Net Seller Payout
                </span>
                <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full text-white">
                  Next Bank Deposit: {overview?.settlementCycle?.nextEstimatedPayoutDate || 'Scheduled'}
                </span>
              </div>
              <div className="text-3xl font-black tracking-tight">
                {overview ? formatINR(overview.netEarnings) : '₹0'}
              </div>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Calculated after subtracting completed customer refunds and standard gateway fees. Automatically transferred to your verified bank account via NEFT/RTGS.
              </p>
            </div>

            {/* Itemized Calculation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Gross Product Value</span>
                <div className="text-xl font-extrabold text-slate-900">
                  {overview ? formatINR(overview.grossVolume) : '₹0'}
                </div>
                <span className="text-[11px] text-slate-500">Order subtotal catalog prices</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Settled to Bank</span>
                <div className="text-xl font-extrabold text-emerald-700">
                  {overview ? formatINR(overview.settledVolume) : '₹0'}
                </div>
                <span className="text-[11px] text-emerald-600 font-medium">Successfully processed</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Refunds Processed</span>
                <div className="text-xl font-extrabold text-rose-700">
                  -{overview ? formatINR(overview.refundedVolume) : '₹0'}
                </div>
                <span className="text-[11px] text-rose-600 font-medium">Returned order adjustments</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Pending In-Pipeline</span>
                <div className="text-xl font-extrabold text-amber-700">
                  {overview ? formatINR(overview.pendingSettlements) : '₹0'}
                </div>
                <span className="text-[11px] text-amber-600 font-medium">Pending handover & delivery</span>
              </div>
            </div>

            {/* Payout Life Cycle Diagram */}
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                Flipkart Style Payout Timeline (T+2 Days)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="text-lg">🛒</span>
                  <div className="text-xs font-bold text-slate-900">1. Order Placed</div>
                  <div className="text-[10px] text-slate-400">Customer pays via UPI/Card/COD</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="text-lg">📦</span>
                  <div className="text-xs font-bold text-slate-900">2. Dispatched</div>
                  <div className="text-[10px] text-slate-400">India Post Speed Post booked</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="text-lg">🚚</span>
                  <div className="text-xs font-bold text-slate-900">3. Delivered</div>
                  <div className="text-[10px] text-slate-400">Customer receives parcel</div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 space-y-1">
                  <span className="text-lg">🏦</span>
                  <div className="text-xs font-extrabold text-emerald-800">4. Bank Deposit</div>
                  <div className="text-[10px] text-emerald-700">Direct settlement to SBI A/C</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. SUB-TAB: SEARCH ORDER-WISE SETTLEMENTS
         ───────────────────────────────────────────────────────────── */}
      {subTab === 'settlements' && (
        <div className="space-y-4">
          {/* Search and Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Order ID (#TW-...), Payment ID, Customer Name, or Phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
                />
              </div>

              {/* Payment Method Filter */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Method:</span>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="ALL">All Methods</option>
                  <option value="ONLINE">Online (UPI / Cards / Net Banking)</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">Debit / Credit Card</option>
                  <option value="NETBANKING">Net Banking</option>
                  <option value="COD">Cash on Delivery (COD)</option>
                </select>
              </div>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-slate-100 pt-3">
              {[
                { id: 'ALL', label: 'All Transactions' },
                { id: 'PAID', label: 'Successful (Paid)' },
                { id: 'PENDING', label: 'Pending' },
                { id: 'FAILED', label: 'Failed' },
                { id: 'REFUNDED', label: 'Refunded' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStatusFilter(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === s.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {s.label}
                </button>
              ))}
              <span className="ml-auto text-xs text-slate-400 font-semibold">
                Showing {filteredTransactions.length} records
              </span>
            </div>
          </div>

          {/* Settlements Data Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-100 text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">Payment Reference</th>
                    <th className="px-5 py-3.5">Order Number</th>
                    <th className="px-5 py-3.5">Date & Time</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Method</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Gross</th>
                    <th className="px-5 py-3.5">Gateway Fee</th>
                    <th className="px-5 py-3.5">Net Settled</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-12 text-slate-400">
                        <CreditCard className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                        <p className="font-bold text-sm">No transactions match your search filter.</p>
                        <p className="text-xs text-slate-400 mt-1">Try resetting the status filter or search query.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => {
                      const dateStr = new Date(tx.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Payment Reference */}
                          <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-slate-700">
                            {tx.paymentId}
                          </td>

                          {/* Order Number */}
                          <td className="px-5 py-3.5 font-extrabold text-slate-900">
                            <button
                              onClick={() => onPreviewOrder ? onPreviewOrder(tx) : null}
                              className="text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer flex items-center gap-1"
                              title="Click to view full order details"
                            >
                              #{tx.orderNumber}
                              <ExternalLink className="h-3 w-3 opacity-60" />
                            </button>
                          </td>

                          {/* Date & Time */}
                          <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              {dateStr}
                            </span>
                          </td>

                          {/* Customer */}
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-slate-800">{tx.customer?.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{tx.customer?.phone}</div>
                          </td>

                          {/* Method */}
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {tx.paymentMethod}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-3.5">
                            {tx.paymentStatus === 'PAID' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="h-3 w-3" /> Successful
                              </span>
                            ) : tx.paymentStatus === 'REFUNDED' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                                <RotateCcw className="h-3 w-3" /> Refunded
                              </span>
                            ) : tx.paymentStatus === 'FAILED' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                <XCircle className="h-3 w-3" /> Failed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                <Clock className="h-3 w-3" /> Pending
                              </span>
                            )}
                          </td>

                          {/* Gross */}
                          <td className="px-5 py-3.5 font-bold text-slate-900">
                            {formatINR(tx.grossAmount)}
                          </td>

                          {/* Gateway Fee */}
                          <td className="px-5 py-3.5 text-slate-500 font-medium">
                            {tx.estimatedGatewayFee > 0 ? formatINR(tx.estimatedGatewayFee) : '₹0'}
                          </td>

                          {/* Net Settled */}
                          <td className="px-5 py-3.5 font-black text-emerald-700">
                            {formatINR(tx.netSettled)}
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-3.5 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => openStatusModal(tx)}
                              className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                              title="Update payment status or record refund"
                            >
                              Update Status
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. SUB-TAB: REFUNDS MONITORING
         ───────────────────────────────────────────────────────────── */}
      {subTab === 'refunds' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <RotateCcw className="h-5 w-5 text-purple-600" />
                  Refunds & Returns Monitoring Desk
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Track completed refunds, returned parcels, and cancellation reversals with audit notes.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-bold block">Total Refunded</span>
                  <span className="text-lg font-black text-purple-700">
                    {overview ? formatINR(overview.refundedVolume) : '₹0'}
                  </span>
                </div>
              </div>
            </div>

            {/* Refunds Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">Order Number</th>
                    <th className="px-5 py-3.5">Customer Details</th>
                    <th className="px-5 py-3.5">Refund Date</th>
                    <th className="px-5 py-3.5">Original Amount</th>
                    <th className="px-5 py-3.5">Refunded Amount</th>
                    <th className="px-5 py-3.5">Reason for Refund</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.filter(t => t.paymentStatus === 'REFUNDED').length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400">
                        <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
                        <p className="font-bold text-sm text-slate-700">No refunds have been processed.</p>
                        <p className="text-xs text-slate-400 mt-1">All orders are currently settled or active.</p>
                      </td>
                    </tr>
                  ) : (
                    transactions
                      .filter(t => t.paymentStatus === 'REFUNDED')
                      .map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5 font-extrabold text-slate-900">
                            #{tx.orderNumber}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-slate-800">{tx.customer?.name}</div>
                            <div className="text-[11px] text-slate-400">{tx.customer?.phone}</div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                            <span className="flex items-center gap-1 font-medium">
                              <Clock className="h-3 w-3 text-slate-400" />
                              {new Date(tx.updatedAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 font-bold">
                            {formatINR(tx.grossAmount)}
                          </td>
                          <td className="px-5 py-3.5 text-purple-700 font-black">
                            {formatINR(tx.refundInfo?.refundAmount || tx.grossAmount)}
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate font-medium">
                            {tx.refundInfo?.refundReason || 'Order cancellation / return refund'}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                              <RotateCcw className="h-3 w-3" /> Refund Settled
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => openStatusModal(tx)}
                              className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                            >
                              View Notes
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. SUB-TAB: SERVICES TRANSACTION HISTORY
         ───────────────────────────────────────────────────────────── */}
      {subTab === 'transactions' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                Services Transaction History
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Logistics postal dispatch fees, packaging expenses, and payment gateway service charges.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">India Post Speed Post</span>
                <div className="text-xl font-black text-slate-900">₹45 / Parcel avg.</div>
                <p className="text-[11px] text-slate-500">Government postal tariff deduction</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Payment Gateway Fee</span>
                <div className="text-xl font-black text-slate-900">2.0% + GST</div>
                <p className="text-[11px] text-slate-500">UPI standard zero surcharge</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Packaging & Carton</span>
                <div className="text-xl font-black text-slate-900">₹12 / Book</div>
                <p className="text-[11px] text-slate-500">Bubble wrap envelope & tamper seal</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. SUB-TAB: SELLER PROTECTION FUND (SPF)
         ───────────────────────────────────────────────────────────── */}
      {subTab === 'spf' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  Seller Protection Fund (SPF)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Claim reimbursement for items damaged in postal transit, lost parcels, or incorrect customer return items.
                </p>
              </div>

              <button
                onClick={() => setIsSpfModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4" />
                File New SPF Claim
              </button>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs text-emerald-900 space-y-2">
              <div className="font-extrabold flex items-center gap-1.5">
                <Info className="h-4 w-4 text-emerald-700" />
                SPF Eligibility Criteria:
              </div>
              <ul className="list-disc list-inside space-y-1 text-emerald-800 text-[11px]">
                <li>Order must be dispatched via India Post Speed Post with valid tracking barcode.</li>
                <li>Claim must be submitted within 14 days of marked delivery or return receipt.</li>
                <li>Include photo proof of damaged book binding or postal tamper seal where applicable.</li>
              </ul>
            </div>

            {/* Claims Table */}
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
              <ShieldCheck className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">No active SPF claims</p>
              <p className="text-xs text-slate-400 mt-1">All seller compensation records are in order.</p>
            </div>
          </div>
        </div>
      )}
      </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: UPDATE PAYMENT STATUS & RECORD REFUND
         ───────────────────────────────────────────────────────────── */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Update Payment & Settlement Status
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Order #{selectedTx.orderNumber} • {formatINR(selectedTx.grossAmount)}
                </p>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Status Selector */}
              <div>
                <label className="font-extrabold text-slate-700 block mb-1.5">Payment Status</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { val: 'PAID', label: 'Successful', color: 'emerald' },
                    { val: 'PENDING', label: 'Pending', color: 'amber' },
                    { val: 'FAILED', label: 'Failed', color: 'rose' },
                    { val: 'REFUNDED', label: 'Refunded', color: 'purple' },
                  ].map((s) => (
                    <button
                      key={s.val}
                      type="button"
                      onClick={() => setUpdateStatus(s.val as any)}
                      className={`py-2 px-2.5 rounded-xl font-extrabold text-center transition-all border cursor-pointer ${
                        updateStatus === s.val
                          ? s.val === 'PAID'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : s.val === 'PENDING'
                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                            : s.val === 'FAILED'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                            : 'bg-purple-600 text-white border-purple-600 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment / Razorpay ID input */}
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Payment Reference / Razorpay ID
                </label>
                <input
                  type="text"
                  value={paymentIdInput}
                  onChange={(e) => setPaymentIdInput(e.target.value)}
                  placeholder="e.g. pay_Nabc123456 or Bank UTR number"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Conditional inputs when REFUNDED */}
              {updateStatus === 'REFUNDED' && (
                <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 space-y-3">
                  <div>
                    <label className="font-extrabold text-purple-950 block mb-1">
                      Refund Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs font-bold text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-purple-950 block mb-1">
                      Reason for Refund
                    </label>
                    <select
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs font-medium text-purple-950 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    >
                      <option value="Damaged / Defective Book Returned">Damaged / Defective Book Returned</option>
                      <option value="Customer Return (Wrong Book / Edition)">Customer Return (Wrong Book / Edition)</option>
                      <option value="Order Cancelled Before Dispatch">Order Cancelled Before Dispatch</option>
                      <option value="Delivery Failed / Returned to Origin (RTO)">Delivery Failed / Returned to Origin (RTO)</option>
                      <option value="Duplicate Payment Adjustment">Duplicate Payment Adjustment</option>
                      <option value="Other / Goodwill Refund">Other / Goodwill Refund</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Audit note input */}
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Internal Settlement Note (Optional)
                </label>
                <textarea
                  value={customRefundNote}
                  onChange={(e) => setCustomRefundNote(e.target.value)}
                  rows={2}
                  placeholder="Notes for accountant or future settlement audit..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSavePaymentStatus}
                disabled={isUpdating}
                className="px-5 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isUpdating ? 'Saving...' : 'Confirm & Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: FILE SPF CLAIM
         ───────────────────────────────────────────────────────────── */}
      {isSpfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <form onSubmit={handleFileSpfClaim} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                File Seller Protection Claim
              </h3>
              <button
                type="button"
                onClick={() => setIsSpfModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Order Number (#)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TW-20260906-1234"
                  value={spfOrderId}
                  onChange={(e) => setSpfOrderId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Claim Reason</label>
                <select
                  value={spfReason}
                  onChange={(e) => setSpfReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Lost in Postal Transit (India Post)">Lost in Postal Transit (India Post)</option>
                  <option value="Returned Book Damaged in Transit">Returned Book Damaged in Transit</option>
                  <option value="Customer Returned Incorrect Item / Tampered">Customer Returned Incorrect Item / Tampered</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Claim Amount (₹)</label>
                <input
                  type="number"
                  placeholder="Leave blank for full book price"
                  value={spfClaimAmount}
                  onChange={(e) => setSpfClaimAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSpfModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Submit SPF Claim
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

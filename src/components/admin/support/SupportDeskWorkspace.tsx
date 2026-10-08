import { useState, useEffect, useCallback } from 'react';
import {
  LifeBuoy,
  RefreshCw,
  Search,
  Send,
  CheckCircle2,
  XCircle,
  User,
  Package,
  Copy,
  Check,
  ShieldCheck,
  Inbox,
  MessageSquare,
  CornerDownRight,
} from 'lucide-react';
import { supportService } from '@/services/api';
import { toast } from 'sonner';

export interface TicketMessage {
  id: string;
  ticketId: string;
  sender: 'CUSTOMER' | 'ADMIN';
  body: string;
  htmlBody?: string;
  messageId?: string;
  adminUserId?: string;
  timestamp: string;
}

export interface TicketCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  customerId?: string;
  technoPoints?: number;
  technoWallet?: number;
  createdAt?: string;
}

export interface Ticket {
  id: string;
  ticketId: string;
  customerId?: string;
  customerEmail: string;
  customerName?: string;
  department: 'SUPPORT' | 'TEAM';
  subject: string;
  status: 'OPEN' | 'PENDING' | 'SOLVED' | 'DISCARDED';
  closureReason?: string;
  orderNumber?: string;
  createdAt: string;
  updatedAt: string;
  customer?: TicketCustomer;
  _count?: { messages: number };
  messages?: TicketMessage[];
}

export default function SupportDeskWorkspace() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  void recentOrders;

  const [loadingList, setLoadingList] = useState(false);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'PENDING' | 'SOLVED' | 'DISCARDED'>('ALL');
  const [deptFilter, setDeptFilter] = useState<'ALL' | 'SUPPORT' | 'TEAM'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ all: 0, open: 0, pending: 0, solved: 0, discarded: 0 });

  // Reply Composer State
  const [replyText, setReplyText] = useState('');
  const [markPendingOnReply, setMarkPendingOnReply] = useState(true);

  // Status Closure Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<'SOLVED' | 'DISCARDED' | 'OPEN' | null>(null);
  const [closureNote, setClosureNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(`Copied "${text}" to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Fetch ticket list
  const fetchTickets = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await supportService.getTickets({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        department: deptFilter !== 'ALL' ? deptFilter : undefined,
        q: searchQuery.trim() || undefined,
        limit: 50,
      });

      if (res.success && res.data) {
        setTickets(res.data.tickets || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
        // Auto-select first ticket if none selected
        if (!selectedTicketId && res.data.tickets?.length > 0) {
          setSelectedTicketId(res.data.tickets[0].ticketId);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load tickets');
    } finally {
      setLoadingList(false);
    }
  }, [statusFilter, deptFilter, searchQuery, selectedTicketId]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Fetch full details of selected ticket
  const fetchSelectedTicket = useCallback(async (id: string) => {
    setLoadingTicket(true);
    try {
      const res = await supportService.getTicket(id);
      if (res.success && res.data) {
        setActiveTicket(res.data.ticket);
        setRecentOrders(res.data.recentOrders || []);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load ticket conversation');
    } finally {
      setLoadingTicket(false);
    }
  }, []);

  useEffect(() => {
    if (selectedTicketId) {
      fetchSelectedTicket(selectedTicketId);
    } else {
      setActiveTicket(null);
    }
  }, [selectedTicketId, fetchSelectedTicket]);

  // Trigger Hostinger IMAP Sync
  const handleSyncMailbox = async () => {
    setSyncing(true);
    try {
      const res = await supportService.syncInboxes();
      if (res.success) {
        toast.success(res.message || 'IMAP synchronization complete');
        fetchTickets();
        if (selectedTicketId) {
          fetchSelectedTicket(selectedTicketId);
        }
      } else {
        toast.error('IMAP sync finished with warnings');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to sync with Hostinger mail server');
    } finally {
      setSyncing(false);
    }
  };

  // Submit Admin Reply
  const handleSendReply = async () => {
    if (!activeTicket) return;
    if (!replyText.trim()) {
      toast.error('Please enter a reply message before sending');
      return;
    }

    setSendingReply(true);
    try {
      const res = await supportService.replyTicket(activeTicket.ticketId, {
        body: replyText.trim(),
        markAsPending: markPendingOnReply,
      });

      if (res.success) {
        toast.success('Reply dispatched to customer email');
        setReplyText('');
        fetchSelectedTicket(activeTicket.ticketId);
        fetchTickets();
      } else {
        toast.error(res.message || 'Failed to dispatch reply');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  // Status Change Prompt
  const promptStatusChange = (status: 'SOLVED' | 'DISCARDED' | 'OPEN') => {
    setTargetStatus(status);
    setClosureNote('');
    setModalOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!activeTicket || !targetStatus) return;

    setUpdatingStatus(true);
    try {
      const res = await supportService.updateStatus(activeTicket.ticketId, {
        status: targetStatus,
        closureReason: closureNote.trim() || undefined,
      });

      if (res.success) {
        toast.success(`Ticket marked as ${targetStatus}`);
        setModalOpen(false);
        fetchSelectedTicket(activeTicket.ticketId);
        fetchTickets();
      } else {
        toast.error(res.message || 'Status update failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update ticket status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Format date helper
  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelative = (isoStr?: string) => {
    if (!isoStr) return '';
    const diffMs = Date.now() - new Date(isoStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Open
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            Pending
          </span>
        );
      case 'SOLVED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-300">
            Solved
          </span>
        );
      case 'DISCARDED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Discarded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            {status}
          </span>
        );
    }
  };

  const getDeptBadge = (dept: string) => {
    if (dept === 'TEAM') {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
          team@
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
        support@
      </span>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-white text-stone-900 border border-stone-200 rounded-lg overflow-hidden shadow-xs">
      {/* 1. TOP HEADER & CRM ACTION BAR */}
      <div className="px-5 py-3.5 border-b border-stone-200 bg-stone-50/70 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-md bg-emerald-800 text-white shrink-0">
            <LifeBuoy className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-base font-bold tracking-tight text-stone-900">Support Desk CRM</h2>
              <span className="text-[11px] font-medium text-stone-500 font-mono">
                {stats.all} Total Tickets
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              Hostinger IMAP Inbound Listener &bull; support@technoworldbooks.in &bull; team@technoworldbooks.in
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Metrics */}
          <div className="hidden lg:flex items-center gap-1.5 mr-2">
            <button
              onClick={() => setStatusFilter('OPEN')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors border ${
                statusFilter === 'OPEN'
                  ? 'bg-emerald-800 text-white border-emerald-800'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
              }`}
            >
              Open: <span className="font-mono">{stats.open}</span>
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors border ${
                statusFilter === 'PENDING'
                  ? 'bg-amber-700 text-white border-amber-700'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
              }`}
            >
              Pending: <span className="font-mono">{stats.pending}</span>
            </button>
            <button
              onClick={() => setStatusFilter('SOLVED')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors border ${
                statusFilter === 'SOLVED'
                  ? 'bg-stone-800 text-white border-stone-800'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
              }`}
            >
              Solved: <span className="font-mono">{stats.solved}</span>
            </button>
          </div>

          {/* Sync Inboxes Button */}
          <button
            onClick={handleSyncMailbox}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Checking Hostinger...' : 'Sync Mailboxes'}</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN 2-PANE WORKSPACE */}
      <div className="flex flex-1 min-h-0 divide-x divide-stone-200">
        {/* LEFT PANE: SEARCH, FILTERS & TICKET LIST */}
        <div className="w-full md:w-[380px] lg:w-[420px] flex flex-col shrink-0 bg-stone-50/30">
          {/* Search Bar & Filters */}
          <div className="p-3 border-b border-stone-200 space-y-2 bg-white">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket ID, email, name, subject..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-stone-200 bg-stone-50/50 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 transition-colors"
              />
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 [scrollbar-width:none]">
              {(['ALL', 'OPEN', 'PENDING', 'SOLVED', 'DISCARDED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap transition-colors border ${
                    statusFilter === st
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Department Filter Toggle */}
            <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-100">
              <span className="font-medium">Mailbox:</span>
              <div className="flex items-center gap-1">
                {(['ALL', 'SUPPORT', 'TEAM'] as const).map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setDeptFilter(dept)}
                    className={`px-2 py-0.5 rounded font-mono transition-colors ${
                      deptFilter === dept
                        ? 'font-bold text-stone-900 underline'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    {dept === 'ALL' ? 'All' : dept === 'SUPPORT' ? 'support@' : 'team@'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Ticket Cards Stream */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100 [scrollbar-width:thin]">
            {loadingList ? (
              <div className="p-8 text-center text-xs text-stone-500">
                <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-stone-400" />
                Loading support tickets...
              </div>
            ) : tickets.length === 0 ? (
              <div className="p-10 text-center">
                <Inbox className="h-8 w-8 mx-auto mb-2 text-stone-300" />
                <p className="text-xs font-semibold text-stone-700">No tickets found</p>
                <p className="text-[11px] text-stone-500 mt-1">
                  Try clearing search filters or click "Sync Mailboxes" to fetch new emails.
                </p>
              </div>
            ) : (
              tickets.map((t) => {
                const isSelected = selectedTicketId === t.ticketId;
                const latestMsg = t.messages?.[0];
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.ticketId)}
                    className={`p-3.5 transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-emerald-50/50 border-l-3 border-emerald-800'
                        : 'bg-white hover:bg-stone-50/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {getDeptBadge(t.department)}
                        <span className="font-mono text-xs font-bold text-stone-900 truncate">
                          {t.ticketId}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {getStatusBadge(t.status)}
                        <span className="text-[10px] text-stone-400 font-mono">
                          {formatRelative(t.updatedAt)}
                        </span>
                      </div>
                    </div>

                    <h4 className="font-semibold text-xs text-stone-900 line-clamp-1 mb-1">
                      {t.subject}
                    </h4>

                    <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                      {latestMsg?.body || 'No messages'}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[10.5px] text-stone-500 pt-1.5 border-t border-stone-100">
                      <span className="truncate max-w-[190px]">
                        {t.customerName || t.customerEmail}
                      </span>
                      {t.orderNumber && (
                        <span className="font-mono text-stone-600 bg-stone-100 px-1 rounded text-[10px]">
                          #{t.orderNumber}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANE: ACTIVE TICKET THREAD & RESOLUTION CONTROLS */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {loadingTicket ? (
            <div className="flex-1 flex items-center justify-center text-xs text-stone-500">
              <RefreshCw className="h-5 w-5 animate-spin mr-2 text-stone-400" />
              Loading ticket conversation...
            </div>
          ) : !activeTicket ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400">
              <MessageSquare className="h-10 w-10 mb-2 stroke-[1.5]" />
              <p className="text-sm font-semibold text-stone-700">Select a Ticket to View Thread</p>
              <p className="text-xs text-stone-500 mt-1 max-w-sm">
                Incoming customer emails received via IMAP are organized chronologically with direct reply capabilities.
              </p>
            </div>
          ) : (
            <>
              {/* Active Ticket Header */}
              <div className="px-5 py-3 border-b border-stone-200 bg-stone-50/50 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-stone-900">
                      {activeTicket.ticketId}
                    </span>
                    <button
                      onClick={() => copyToClipboard(activeTicket.ticketId, 'tkt')}
                      className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
                      title="Copy Ticket ID"
                    >
                      {copiedId === 'tkt' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    {getStatusBadge(activeTicket.status)}
                    {getDeptBadge(activeTicket.department)}
                  </div>
                  <h3 className="font-serif text-sm font-bold text-stone-900 truncate mt-0.5">
                    {activeTicket.subject}
                  </h3>
                </div>

                {/* Resolution Controls */}
                <div className="flex items-center gap-2">
                  {activeTicket.orderNumber && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-stone-100 text-stone-700 font-mono text-xs border border-stone-200">
                      <Package className="h-3 w-3 text-stone-500" />
                      #{activeTicket.orderNumber}
                      <button
                        onClick={() => copyToClipboard(activeTicket.orderNumber!, 'ord')}
                        className="ml-1 text-stone-400 hover:text-stone-700"
                        title="Copy Order Number"
                      >
                        {copiedId === 'ord' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </span>
                  )}

                  {activeTicket.status !== 'SOLVED' && (
                    <button
                      onClick={() => promptStatusChange('SOLVED')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-emerald-700 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Mark as Solved</span>
                    </button>
                  )}

                  {activeTicket.status !== 'DISCARDED' && (
                    <button
                      onClick={() => promptStatusChange('DISCARDED')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Discard</span>
                    </button>
                  )}

                  {(activeTicket.status === 'SOLVED' || activeTicket.status === 'DISCARDED') && (
                    <button
                      onClick={() => promptStatusChange('OPEN')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Re-open Ticket</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Customer Snapshot Banner */}
              <div className="px-5 py-2.5 bg-stone-100/60 border-b border-stone-200 flex flex-wrap items-center justify-between text-xs text-stone-600 gap-2 shrink-0">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-stone-400" />
                    <strong className="text-stone-900">{activeTicket.customerName || 'Customer'}</strong>
                    <span className="text-stone-500 font-mono">({activeTicket.customerEmail})</span>
                  </span>
                  {activeTicket.customer?.customerId && (
                    <span className="font-mono text-stone-700 bg-white px-1.5 py-0.5 rounded border border-stone-200 text-[11px]">
                      {activeTicket.customer.customerId}
                    </span>
                  )}
                </div>

                {activeTicket.closureReason && (
                  <div className="text-[11px] text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200">
                    <span className="font-semibold text-stone-700">Resolution Note: </span>
                    {activeTicket.closureReason}
                  </div>
                )}
              </div>

              {/* Message Thread Stream */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 [scrollbar-width:thin] bg-stone-50/20">
                {activeTicket.messages?.map((m) => {
                  const isStaff = m.sender === 'ADMIN';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg border p-4 shadow-2xs ${
                          isStaff
                            ? 'bg-emerald-50/60 border-emerald-200 text-stone-900'
                            : 'bg-white border-stone-200 text-stone-900'
                        }`}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-stone-200/60">
                          <div className="flex items-center gap-1.5">
                            {isStaff ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-800 text-white text-[10px] font-bold uppercase tracking-wider">
                                <ShieldCheck className="h-3 w-3" /> Staff Support
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px] font-bold uppercase tracking-wider">
                                <User className="h-3 w-3" /> {activeTicket.customerName || 'Customer'}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {formatDate(m.timestamp)}
                          </span>
                        </div>

                        {/* Body */}
                        <div className="text-xs leading-relaxed whitespace-pre-wrap break-words">
                          {m.body}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Admin Reply Composer */}
              <div className="p-4 border-t border-stone-200 bg-white shrink-0">
                <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5">
                  <span className="flex items-center gap-1">
                    <CornerDownRight className="h-3.5 w-3.5 text-stone-400" />
                    Sending email response from{' '}
                    <strong className="text-stone-800 font-mono">
                      {activeTicket.department === 'TEAM' ? 'team@technoworldbooks.in' : 'support@technoworldbooks.in'}
                    </strong>
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-stone-600">
                    <input
                      type="checkbox"
                      checked={markPendingOnReply}
                      onChange={(e) => setMarkPendingOnReply(e.target.checked)}
                      className="rounded border-stone-300 text-emerald-800 focus:ring-emerald-700"
                    />
                    <span>Set status to Pending on dispatch</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your official reply to the customer here. Your response will be emailed immediately via Nodemailer over TLS and added to this thread..."
                    className="w-full p-3 text-xs rounded-md border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-500 leading-relaxed [scrollbar-width:thin]"
                  />

                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={handleSendReply}
                      disabled={sendingReply || !replyText.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      <Send className={`h-3.5 w-3.5 ${sendingReply ? 'animate-pulse' : ''}`} />
                      <span>{sendingReply ? 'Sending to Customer...' : 'Send Reply & Email Customer'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 3. STATUS CLOSURE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-stone-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <h3 className="font-serif text-sm font-bold text-stone-900">
                {targetStatus === 'SOLVED'
                  ? 'Resolve & Close Ticket'
                  : targetStatus === 'DISCARDED'
                  ? 'Discard Ticket'
                  : 'Re-open Ticket'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              {targetStatus === 'SOLVED'
                ? 'Mark this ticket as solved. You can optionally attach an internal resolution summary note.'
                : targetStatus === 'DISCARDED'
                ? 'Discard this ticket (e.g. spam, promotional, or out-of-scope). Please state the reason for compliance.'
                : 'Re-open this ticket to move it back into active agent queue.'}
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 uppercase tracking-wider mb-1">
                Closure Reason / Note (Optional)
              </label>
              <textarea
                rows={3}
                value={closureNote}
                onChange={(e) => setClosureNote(e.target.value)}
                placeholder="e.g. Consignment tracking provided; replacement delivered; resolved over phone."
                className="w-full p-2.5 text-xs rounded-md border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                onClick={() => setModalOpen(false)}
                className="px-3 py-1.5 rounded-md border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusChange}
                disabled={updatingStatus}
                className="px-4 py-1.5 rounded-md bg-stone-900 hover:bg-stone-800 text-xs font-semibold text-white transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {updatingStatus ? 'Updating...' : 'Confirm Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

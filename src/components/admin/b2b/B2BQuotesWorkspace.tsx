import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  RefreshCw,
  Phone,
  Mail,
  ShoppingCart,
  CheckCircle2,
  X,
  Loader2,
  Trash2,
  User,
  Check,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { b2bService } from '@/services/api';
import { formatINR } from '@/utils/helpers';

interface AttachedCartItem {
  bookId?: string | null;
  isbn?: string | null;
  title: string;
  requestedQuantity: number;
  currentRetailPrice: number;
}

interface B2BEnquiry {
  id: string;
  organizationName: string;
  representativeName: string;
  email: string;
  phone: string;
  timeline?: string | null;
  requirements: string;
  attachedCartItems?: AttachedCartItem[] | any;
  status: 'Pending' | 'Contacted' | 'Quoted' | 'Closed';
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_FILTERS = [
  { id: 'ALL', label: 'All Inquiries' },
  { id: 'Pending', label: 'Pending Review' },
  { id: 'Contacted', label: 'Contacted' },
  { id: 'Quoted', label: 'Quoted' },
  { id: 'Closed', label: 'Closed / Won' },
];

export default function B2BQuotesWorkspace() {
  const [enquiries, setEnquiries] = useState<B2BEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [metaCounts, setMetaCounts] = useState({
    pending: 0,
    contacted: 0,
    quoted: 0,
    closed: 0,
    total: 0,
  });

  // Selected lead for detail inspection modal
  const [selectedLead, setSelectedLead] = useState<B2BEnquiry | null>(null);
  const [editStatus, setEditStatus] = useState<'Pending' | 'Contacted' | 'Quoted' | 'Closed'>('Pending');
  const [editNotes, setEditNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await b2bService.getQuoteRequests({
        limit: 100,
        status: statusFilter,
        search: searchQuery.trim() || undefined,
      });

      if (res.success) {
        setEnquiries(res.data || []);
        const metaAny = res.meta as any;
        if (metaAny?.counts) {
          setMetaCounts({
            pending: metaAny.counts.pending || 0,
            contacted: metaAny.counts.contacted || 0,
            quoted: metaAny.counts.quoted || 0,
            closed: metaAny.counts.closed || 0,
            total: metaAny.total || 0,
          });
        }
      }
    } catch (err: any) {
      console.error('Failed to load B2B enquiries:', err);
      toast.error('Failed to load quote requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter]);

  // Handle manual search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEnquiries();
  };

  const handleOpenLead = (lead: B2BEnquiry) => {
    setSelectedLead(lead);
    setEditStatus(lead.status);
    setEditNotes(lead.adminNotes || '');
  };

  const handleUpdateLead = async () => {
    if (!selectedLead) return;
    setIsUpdating(true);
    try {
      const res = await b2bService.updateQuoteRequestStatus(selectedLead.id, {
        status: editStatus,
        adminNotes: editNotes,
      });
      if (res.success) {
        toast.success('Inquiry updated successfully');
        setSelectedLead({
          ...selectedLead,
          status: editStatus,
          adminNotes: editNotes,
        });
        // Refresh local list
        setEnquiries((prev) =>
          prev.map((item) =>
            item.id === selectedLead.id
              ? { ...item, status: editStatus, adminNotes: editNotes }
              : item
          )
        );
      }
    } catch (err: any) {
      console.error('Failed to update inquiry:', err);
      toast.error(err?.message || 'Failed to update inquiry');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this quote request?')) return;
    try {
      await b2bService.deleteQuoteRequest(id);
      toast.success('Inquiry deleted');
      setEnquiries((prev) => prev.filter((item) => item.id !== id));
      if (selectedLead?.id === id) {
        setSelectedLead(null);
      }
    } catch (err: any) {
      console.error('Failed to delete inquiry:', err);
      toast.error(err?.message || 'Failed to delete inquiry');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    toast.success(`Copied ${label}`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Status badge styling (quiet luxury tones)
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Contacted':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Quoted':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Closed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-stone-50 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-emerald-800">
            <Building2 className="h-3.5 w-3.5 text-emerald-700" />
            <span>B2B & Institutional Sales</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-stone-900">
            Institutional Quote Requests
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-stone-600">
            Review incoming institutional leads, manage cart snapshots, negotiate volume discounts, and update deal statuses.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchEnquiries}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-emerald-700' : 'text-stone-500'}`} />
            <span>Refresh</span>
          </button>
          <a
            href="https://wa.me/917479135626"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-900 transition-colors shadow-2xs"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>Direct Sales Desk</span>
          </a>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Total Leads</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-stone-900">
              {metaCounts.total || enquiries.length}
            </span>
            <span className="text-xs text-stone-400">All Time</span>
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Pending Review
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-amber-900">
              {metaCounts.pending}
            </span>
            <span className="text-xs text-amber-600 font-medium">SLA: 2–4 hrs</span>
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-indigo-700 uppercase tracking-wider flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Quoted / Contacted
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-indigo-900">
              {metaCounts.contacted + metaCounts.quoted}
            </span>
            <span className="text-xs text-stone-400">In Negotiation</span>
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            Closed / Won
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-emerald-900">
              {metaCounts.closed}
            </span>
            <span className="text-xs text-emerald-700 font-medium">Completed</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 border border-stone-200 bg-stone-50 p-1 rounded-xl">
          {STATUS_FILTERS.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-stone-900 shadow-2xs border border-stone-200/80 font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search institute, contact, email..."
            className="w-full rounded-xl border border-stone-300 bg-white pl-9 pr-3 py-1.5 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700 transition-colors shadow-2xs"
          />
        </form>
      </div>

      {/* Quotes Table */}
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-2xs">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
          </div>
        ) : enquiries.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Building2 className="mx-auto h-12 w-12 text-stone-300" />
            <h3 className="text-base font-bold text-stone-800">No quote requests found</h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
              {searchQuery
                ? `No inquiries matching "${searchQuery}". Try a different keyword.`
                : 'No inquiries registered under this status filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Organization & Contact</th>
                  <th className="py-3 px-4">Contact Channels</th>
                  <th className="py-3 px-4">Timeline</th>
                  <th className="py-3 px-4">Cart Snapshot</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {enquiries.map((enquiry) => {
                  const cartItems: AttachedCartItem[] = Array.isArray(enquiry.attachedCartItems)
                    ? enquiry.attachedCartItems
                    : [];
                  const cartTotalValue = cartItems.reduce(
                    (acc, curr) => acc + (curr.currentRetailPrice || 0) * (curr.requestedQuantity || 1),
                    0
                  );

                  return (
                    <tr
                      key={enquiry.id}
                      className="hover:bg-stone-50/60 transition-colors group cursor-pointer"
                      onClick={() => handleOpenLead(enquiry)}
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-stone-500 text-xs font-mono">
                        {new Date(enquiry.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                        <div className="text-[10px] text-stone-400">
                          {new Date(enquiry.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Organization & Representative */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-900 group-hover:text-emerald-800 transition-colors">
                          {enquiry.organizationName}
                        </div>
                        <div className="text-xs text-stone-600 flex items-center gap-1 mt-0.5">
                          <User className="h-3 w-3 text-stone-400" />
                          <span>{enquiry.representativeName}</span>
                        </div>
                      </td>

                      {/* Contact Channels */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${enquiry.phone}`}
                            className="inline-flex items-center gap-1 font-mono text-xs font-medium text-stone-800 hover:text-emerald-700"
                            title="Call Representative"
                          >
                            <Phone className="h-3 w-3 text-stone-400" />
                            <span>{enquiry.phone}</span>
                          </a>
                          <a
                            href={`https://wa.me/${enquiry.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(enquiry.representativeName)},%20regarding%20your%20quote%20request%20for%20${encodeURIComponent(enquiry.organizationName)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-[10px] font-bold hover:bg-emerald-200 transition-colors"
                            title="WhatsApp Chat"
                          >
                            WA
                          </a>
                        </div>
                        <div className="text-[11px] text-stone-500 truncate max-w-[180px] mt-0.5 font-mono">
                          {enquiry.email}
                        </div>
                      </td>

                      {/* Timeline */}
                      <td className="py-3.5 px-4 text-xs text-stone-600 whitespace-nowrap">
                        <span className="rounded-md bg-stone-100 px-2 py-0.5 font-medium border border-stone-200">
                          {enquiry.timeline || 'Standard'}
                        </span>
                      </td>

                      {/* Cart Snapshot */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {cartItems.length > 0 ? (
                          <div className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                            <ShoppingCart className="h-3 w-3 text-emerald-700" />
                            <span>
                              {cartItems.length} book{cartItems.length !== 1 ? 's' : ''} ({formatINR(cartTotalValue)})
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-stone-400 italic">Custom book list</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(enquiry.status)}`}>
                          {enquiry.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleOpenLead(enquiry)}
                          className="rounded-lg border border-stone-300 bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:border-emerald-700 transition-colors shadow-2xs mr-1.5 cursor-pointer"
                        >
                          View Details
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLead(enquiry.id)}
                          className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete inquiry"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Slide-Over / Modal */}
      {selectedLead && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedLead(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 text-stone-900 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-stone-200 pb-4">
              <div>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(selectedLead.status)}`}>
                  {selectedLead.status}
                </span>
                <h2 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
                  {selectedLead.organizationName}
                </h2>
                <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-2">
                  <span>Logged: {new Date(selectedLead.createdAt).toLocaleString('en-IN')}</span>
                  <span>•</span>
                  <span>Timeline: {selectedLead.timeline || 'Standard Requisition'}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Representative & Contacts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 rounded-xl border border-stone-200 bg-stone-50/70 p-4">
              <div>
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Representative Name</span>
                <div className="font-semibold text-stone-900 text-sm mt-0.5">
                  {selectedLead.representativeName}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Phone / WhatsApp</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <a
                    href={`tel:${selectedLead.phone}`}
                    className="font-mono text-sm font-semibold text-emerald-800 hover:underline"
                  >
                    {selectedLead.phone}
                  </a>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedLead.phone, 'Phone')}
                    className="text-stone-400 hover:text-stone-700 cursor-pointer p-0.5"
                    title="Copy phone"
                  >
                    {copiedText === 'Phone' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Email Address</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <a
                    href={`mailto:${selectedLead.email}?subject=Institutional%20Quotation%20for%20${encodeURIComponent(selectedLead.organizationName)}`}
                    className="font-mono text-xs sm:text-sm text-stone-800 hover:underline"
                  >
                    {selectedLead.email}
                  </a>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedLead.email, 'Email')}
                    className="text-stone-400 hover:text-stone-700 cursor-pointer p-0.5"
                    title="Copy email"
                  >
                    {copiedText === 'Email' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Requirements Pitch */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Detailed Requirements & Book List
              </span>
              <div className="rounded-xl border border-stone-200 bg-white p-4 text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-wrap font-sans">
                {selectedLead.requirements}
              </div>
            </div>

            {/* Attached Cart Snapshot */}
            {Array.isArray(selectedLead.attachedCartItems) && selectedLead.attachedCartItems.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingCart className="h-3.5 w-3.5 text-emerald-700" />
                    <span>Attached Cart Snapshot ({selectedLead.attachedCartItems.length} items)</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-800">
                    Total: {formatINR(
                      selectedLead.attachedCartItems.reduce(
                        (acc: number, curr: any) => acc + (curr.currentRetailPrice || 0) * (curr.requestedQuantity || 1),
                        0
                      )
                    )}
                  </span>
                </div>

                <div className="rounded-xl border border-stone-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 border-b border-stone-200 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-2 px-3">Title / Details</th>
                        <th className="py-2 px-3 text-center">Qty</th>
                        <th className="py-2 px-3 text-right">Unit Price</th>
                        <th className="py-2 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-sans">
                      {selectedLead.attachedCartItems.map((item: any, idx: number) => {
                        const lineTotal = (item.currentRetailPrice || 0) * (item.requestedQuantity || 1);
                        return (
                          <tr key={idx} className="hover:bg-stone-50/50">
                            <td className="py-2 px-3">
                              <div className="font-medium text-stone-900">{item.title}</div>
                              {item.isbn && (
                                <div className="text-[10px] font-mono text-stone-500">ISBN: {item.isbn}</div>
                              )}
                            </td>
                            <td className="py-2 px-3 text-center font-mono font-bold">
                              {item.requestedQuantity || 1}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-stone-600">
                              {formatINR(item.currentRetailPrice || 0)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-stone-900">
                              {formatINR(lineTotal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Status & Admin Notes Form */}
            <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="lead-status" className="block text-xs font-bold text-stone-700">
                    Lead Status
                  </label>
                  <select
                    id="lead-status"
                    value={editStatus}
                    onChange={(e: any) => setEditStatus(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-900 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
                  >
                    <option value="Pending">Pending Review</option>
                    <option value="Contacted">Contacted Representative</option>
                    <option value="Quoted">Quoted Formal Pricing</option>
                    <option value="Closed">Closed / Deal Won</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="block text-xs font-bold text-stone-700">Quick Actions</span>
                  <div className="flex items-center gap-2 pt-0.5">
                    <a
                      href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(selectedLead.representativeName)},%20regarding%20your%20quote%20request%20for%20${encodeURIComponent(selectedLead.organizationName)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-2 text-xs font-bold text-white hover:bg-[#20ba5a] transition-all flex-1 text-center"
                    >
                      <span>WhatsApp</span>
                    </a>
                    <a
                      href={`mailto:${selectedLead.email}?subject=Techno%20World%20Books%20Formal%20Quotation%20-%20${encodeURIComponent(selectedLead.organizationName)}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-800 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-900 transition-all flex-1 text-center"
                    >
                      <Mail className="h-3 w-3" />
                      <span>Email Quote</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-1">
                <label htmlFor="lead-notes" className="block text-xs font-bold text-stone-700">
                  Internal Sales Notes & Negotiation Trace
                </label>
                <textarea
                  id="lead-notes"
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Quoted 25% discount tier on pharmacology sets. Contacted librarian Dr. Banerjee on WhatsApp. Tender terms expected by next Friday..."
                  className="w-full rounded-lg border border-stone-300 bg-white p-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700 leading-relaxed font-sans"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={handleUpdateLead}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-900 transition-colors shadow-2xs disabled:opacity-60 cursor-pointer"
                >
                  {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  <span>Save Status & Notes</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

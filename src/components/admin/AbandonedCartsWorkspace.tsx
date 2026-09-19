import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  Search,
  RefreshCw,
  Users,
  TrendingUp,
  Package,
} from 'lucide-react';
import { formatINR } from '@/utils/helpers';
import { toast } from 'sonner';

export const AbandonedCartsWorkspace: React.FC = () => {
  const [carts, setCarts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recoveredUserIds, setRecoveredUserIds] = useState<Set<string>>(new Set());

  const fetchAbandonedCarts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const res = await fetch('/api/v1/admin/abandoned-carts', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCarts(json.data);
      }
    } catch (err: any) {
      toast.error('Failed to load abandoned carts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAbandonedCarts();
  }, []);

  const filteredCarts = carts.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = (c.customerName || '').toLowerCase().includes(q);
    const emailMatch = (c.customerEmail || '').toLowerCase().includes(q);
    const phoneMatch = (c.customerPhone || '').includes(q);
    const bookMatch = (c.items || []).some((item: any) =>
      (item.title || '').toLowerCase().includes(q)
    );
    return nameMatch || emailMatch || phoneMatch || bookMatch;
  });

  const totalAbandonedAmount = carts.reduce((acc, c) => acc + (c.totalAmount || 0), 0);
  const totalPotentialItems = carts.reduce((acc, c) => acc + (c.itemCount || 0), 0);

  const handleSendWhatsApp = (cart: any) => {
    if (!cart.whatsappUrl) {
      toast.error('No valid 10-digit Indian mobile number found for this customer');
      return;
    }
    window.open(cart.whatsappUrl, '_blank');
    setRecoveredUserIds((prev) => new Set(prev).add(cart.userId));
    toast.success(`WhatsApp recovery link opened for ${cart.customerName}`);
  };

  return (
    <div className="space-y-5">
      
      {/* Top Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                <ShoppingCart className="h-3.5 w-3.5" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Abandoned Cart Recovery Workspace
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Recover drop-offs with personalized WhatsApp nudges and special book coupon incentives.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchAbandonedCarts}
              disabled={isLoading}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4 pt-4 border-t border-slate-100">
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold">Active Drop-offs</span>
              <Users className="h-4 w-4 text-slate-400" />
            </div>
            <div className="text-xl font-black text-slate-900 mt-1">{carts.length}</div>
            <span className="text-[10px] text-slate-400">Customers with unpurchased carts</span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold">Potential Sales Pipeline</span>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-emerald-700 mt-1">{formatINR(totalAbandonedAmount)}</div>
            <span className="text-[10px] text-slate-400">Total pipeline cart value</span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold">Pending Book Units</span>
              <Package className="h-4 w-4 text-slate-400" />
            </div>
            <div className="text-xl font-black text-slate-900 mt-1">{totalPotentialItems}</div>
            <span className="text-[10px] text-slate-400">Books currently waiting in carts</span>
          </div>
        </div>
      </div>

      {/* Toolbar & Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, phone, email, book title..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
            />
          </div>

          <span className="text-xs font-bold text-slate-500">
            Showing {filteredCarts.length} of {carts.length} drop-offs
          </span>
        </div>
      </div>

      {/* Carts Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        {filteredCarts.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <ShoppingCart className="h-10 w-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">No abandoned carts found</p>
            <p className="text-xs text-slate-400 mt-0.5">
              All active customer carts are either checked out or search filters yielded 0 records.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-600 border-b border-slate-200">
                  <th className="p-3.5 pl-5">Customer</th>
                  <th className="p-3.5">Cart Items</th>
                  <th className="p-3.5 text-center">Qty</th>
                  <th className="p-3.5 text-right">Cart Total</th>
                  <th className="p-3.5 text-center">Last Active</th>
                  <th className="p-3.5 pr-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCarts.map((cart) => {
                  const hasNudgeSent = recoveredUserIds.has(cart.userId);
                  return (
                    <tr key={cart.userId} className="hover:bg-slate-50/60 transition-colors">
                      {/* Customer Info */}
                      <td className="p-3.5 pl-5">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">
                            {cart.customerName}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <span>{cart.customerPhone || 'Phone not set'}</span>
                          </div>
                          {cart.customerEmail && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                              <Mail className="h-3 w-3 text-slate-400" />
                              <span className="truncate max-w-[160px]">{cart.customerEmail}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Items Preview */}
                      <td className="p-3.5 max-w-sm">
                        <div className="space-y-1.5">
                          {cart.items.slice(0, 2).map((item: any) => (
                            <div key={item.id} className="flex items-center gap-2">
                              {item.coverImage ? (
                                <img
                                  src={item.coverImage}
                                  alt={item.title}
                                  className="h-7 w-5 rounded object-cover border border-slate-200 shrink-0"
                                />
                              ) : (
                                <div className="h-7 w-5 rounded bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-[8px] text-slate-400 font-bold">
                                  BK
                                </div>
                              )}
                              <span className="font-semibold text-slate-800 truncate text-xs" title={item.title}>
                                {item.title}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                ×{item.quantity}
                              </span>
                            </div>
                          ))}
                          {cart.items.length > 2 && (
                            <span className="text-[10px] font-bold text-slate-400 block">
                              + {cart.items.length - 2} more item(s)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Item Count */}
                      <td className="p-3.5 text-center font-mono font-bold text-slate-700">
                        {cart.itemCount}
                      </td>

                      {/* Total Amount */}
                      <td className="p-3.5 text-right font-extrabold text-slate-900 text-xs">
                        {formatINR(cart.totalAmount)}
                      </td>

                      {/* Last Active */}
                      <td className="p-3.5 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                          <Clock className="h-3 w-3 text-slate-400" />
                          {cart.timeAgo}
                        </span>
                      </td>

                      {/* Recovery Actions */}
                      <td className="p-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleSendWhatsApp(cart)}
                            disabled={!cart.cleanPhone}
                            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer ${
                              hasNudgeSent
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40'
                            }`}
                            title="Send pre-filled WhatsApp reminder"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>{hasNudgeSent ? 'Sent Again' : 'WhatsApp Nudge'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default AbandonedCartsWorkspace;

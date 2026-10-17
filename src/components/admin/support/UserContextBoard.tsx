import React from 'react';
import {
  Copy,
  Check,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';

export interface CustomerProfileData {
  name: string;
  phone: string;
  accountAge: string;
  verified: boolean;
  lifetimeValue: string;
  ordersCount: number;
  shippingCity: string;
}

export interface RecentOrderItem {
  id: string;
  orderNumber: string;
  title: string;
  status: 'Delivered' | 'In Transit' | 'Processing' | 'Failed';
  amount: string;
  date: string;
}

interface UserContextBoardProps {
  profile: CustomerProfileData;
  recentOrders: RecentOrderItem[];
}

export const UserContextBoard: React.FC<UserContextBoardProps> = ({
  profile,
  recentOrders,
}) => {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Copied ${fieldName} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <aside className="w-80 shrink-0 flex flex-col h-full bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden select-none">
      {/* Pane 3 Header */}
      <div className="p-3.5 pb-2.5 border-b border-stone-200/50 dark:border-white/10 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          Customer Context
        </h2>
        <span className="text-[10px] font-medium text-stone-400">
          Live Metadata
        </span>
      </div>

      {/* Scrollable Context Cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        
        {/* Card 1: Customer Profile */}
        <div className="rounded-xl p-3.5 bg-white/60 dark:bg-stone-800/60 border border-stone-200/60 dark:border-white/10 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#081C15] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
              {profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                {profile.name}
              </h3>
              <div className="flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400">
                <span className="font-mono text-[10px]">{profile.phone}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(profile.phone, 'phone number')}
                  className="hover:text-stone-800 dark:hover:text-stone-200 p-0.5 rounded cursor-pointer"
                  title="Copy phone"
                >
                  {copiedField === 'phone number' ? (
                    <Check className="h-2.5 w-2.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-2.5 w-2.5 text-stone-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-200/40 dark:border-white/5 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-stone-400">Verification</span>
              {profile.verified ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="h-3 w-3" />
                  Verified Buyer
                </span>
              ) : (
                <span className="text-[10px] text-stone-400">Guest Visitor</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone-400">Account Age</span>
              <span className="font-medium text-stone-700 dark:text-stone-300">
                {profile.accountAge}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone-400">Location</span>
              <span className="font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-stone-400" />
                {profile.shippingCity}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Lifetime Value Metrics */}
        <div className="rounded-xl p-3.5 bg-white/60 dark:bg-stone-800/60 border border-stone-200/60 dark:border-white/10 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Lifetime Value
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              High Value
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
              {profile.lifetimeValue}
            </span>
            <span className="text-xs font-semibold text-stone-500">
              {profile.ordersCount} total orders
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-200/40 dark:border-white/5 text-[11px]">
            <div className="bg-stone-50 dark:bg-stone-900/40 p-2 rounded-lg text-center">
              <span className="block text-[10px] text-stone-400">RTO / Returns</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">0%</span>
            </div>
            <div className="bg-stone-50 dark:bg-stone-900/40 p-2 rounded-lg text-center">
              <span className="block text-[10px] text-stone-400">Support Load</span>
              <span className="font-bold text-stone-700 dark:text-stone-300">Low</span>
            </div>
          </div>
        </div>

        {/* Card 3: Recent Orders */}
        <div className="rounded-xl p-3.5 bg-white/60 dark:bg-stone-800/60 border border-stone-200/60 dark:border-white/10 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Recent Orders
            </span>
            <span className="text-[10px] font-medium text-stone-500">
              Last 30 Days
            </span>
          </div>

          <div className="space-y-2">
            {recentOrders.map((order) => {
              const isDelivered = order.status === 'Delivered';
              const isInTransit = order.status === 'In Transit';
              const isFailed = order.status === 'Failed';

              return (
                <div
                  key={order.id}
                  className="p-2.5 rounded-lg bg-stone-50/80 dark:bg-stone-900/40 border border-stone-200/40 dark:border-white/5 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-stone-800 dark:text-stone-200">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        isDelivered
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                          : isInTransit
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                          : isFailed
                          ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                          : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-1">
                    {order.title}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1">
                    <span>{order.date}</span>
                    <span className="font-semibold text-stone-700 dark:text-stone-300">
                      {order.amount}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </aside>
  );
};

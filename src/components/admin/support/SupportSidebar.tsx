import React from 'react';
import { Search, Phone } from 'lucide-react';

export interface SupportSessionItem {
  id: string;
  customerPhone: string;
  customerName: string;
  customerInitials: string;
  status: 'OPEN' | 'CLOSED';
  unread: boolean;
  lastMessage: string;
  lastMessageTime: string;
  orderNumber?: string;
}

interface SupportSidebarProps {
  sessions: SupportSessionItem[];
  selectedSessionId: string;
  onSelectSession: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: 'all' | 'unread';
  onFilterChange: (filter: 'all' | 'unread') => void;
}

export const SupportSidebar: React.FC<SupportSidebarProps> = ({
  sessions,
  selectedSessionId,
  onSelectSession,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
}) => {
  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.customerPhone.includes(searchQuery) ||
      (session.orderNumber && session.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      session.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === 'unread') {
      return matchesSearch && session.unread;
    }
    return matchesSearch;
  });

  const unreadCount = sessions.filter((s) => s.unread).length;

  return (
    <aside className="w-80 shrink-0 flex flex-col h-full bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden select-none">
      {/* Pane 1 Header */}
      <div className="p-3.5 pb-2.5 border-b border-stone-200/50 dark:border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Support Desk
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              WhatsApp CRM
            </span>
          </div>
          <span className="text-[11px] font-semibold text-stone-500">
            {sessions.length} OPEN
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search name, phone, order..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-100/70 dark:bg-stone-800/70 border border-stone-200/60 dark:border-white/10 rounded-lg text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-700/30 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={() => onFilterChange('all')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#081C15] text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5'
            }`}
          >
            All Sessions ({sessions.length})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('unread')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'unread'
                ? 'bg-[#081C15] text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5'
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-500 text-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto divide-y divide-stone-100/70 dark:divide-white/5">
        {filteredSessions.length === 0 ? (
          <div className="p-6 text-center text-xs text-stone-400">
            No matching support sessions found
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isSelected = session.id === selectedSessionId;

            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`p-3 transition-all cursor-pointer relative group ${
                  isSelected
                    ? 'bg-emerald-900/5 dark:bg-emerald-500/10 border-l-3 border-[#081C15] dark:border-emerald-500'
                    : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {/* Minimalist Avatar */}
                  <div
                    className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-xs font-bold transition-transform ${
                      isSelected
                        ? 'bg-[#081C15] text-white shadow-xs'
                        : 'bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {session.customerInitials}
                  </div>

                  {/* Body preview */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                        {session.customerName}
                      </span>
                      <span className="text-[10px] text-stone-400 font-medium shrink-0">
                        {session.lastMessageTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
                      <Phone className="h-2.5 w-2.5 text-stone-400 shrink-0" />
                      <span className="font-mono text-[10px] truncate">{session.customerPhone}</span>
                    </div>

                    <p className="text-[11px] text-stone-600 dark:text-stone-400 truncate leading-relaxed">
                      {session.lastMessage}
                    </p>

                    {/* Metadata Footer */}
                    <div className="flex items-center justify-between pt-1">
                      {session.orderNumber ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-medium">
                          {session.orderNumber}
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400">General Inquiry</span>
                      )}

                      {/* Unread Indicator: Solid Red Notification Dot */}
                      {session.unread && (
                        <span
                          className="h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-stone-900 shrink-0"
                          title="Unread message"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};

import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Package, Truck, CheckCircle2, Warehouse, Bike, Search } from 'lucide-react';
import { BOOKS } from '@/data/books';
import { formatINR } from '@/utils/helpers';
import { useStore } from '@/store/StoreContext';
import { BookCover } from '@/components/BookCover';

const STEPS = [
  { key: 'Placed', icon: Package, desc: 'Order confirmed & payment received' },
  { key: 'Packed', icon: Warehouse, desc: 'Packed at fulfilment centre, label generated' },
  { key: 'Shipped', icon: Truck, desc: 'Handed to courier partner' },
  { key: 'Out for Delivery', icon: Bike, desc: 'Arriving at your doorstep today' },
  { key: 'Delivered', icon: CheckCircle2, desc: 'Enjoy your books!' },
];

export default function Track() {
  const { orders } = useStore();
  const [params] = useSearchParams();
  const [input, setInput] = useState(params.get('id') ?? '');
  const [lookup, setLookup] = useState(params.get('id') ?? '');

  const order = orders.find((o) => o.id.toLowerCase() === lookup.trim().toLowerCase() || o.trackingId.toLowerCase() === lookup.trim().toLowerCase());

  const activeIdx = order ? STEPS.findIndex((s) => s.key === order.status) : -1;

  return (
    <div className="mx-auto max-w-3xl px-3 py-8 sm:px-6">
      <h1 className="text-2xl font-extrabold text-slate-900">Track Your Order</h1>
      <p className="mt-1 text-sm text-slate-500">Enter your Order ID (TWB…) or Tracking ID (TRK…)</p>
      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setLookup(input)}
          placeholder="e.g. TWB12345678"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
        />
        <button onClick={() => setLookup(input)} className="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800">
          <Search className="h-4 w-4" /> Track
        </button>
      </div>

      {lookup && !order && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-center text-sm text-amber-800">
          No order found for "<b>{lookup}</b>". Place an order first, or check the ID and try again.
        </div>
      )}

      {order && (
        <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-dashed border-slate-200 pb-4">
            <div>
              <p className="text-sm font-extrabold text-slate-900">Order {order.id}</p>
              <p className="text-xs text-slate-500">Placed {new Date(order.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} · {order.courier} · {order.trackingId}</p>
            </div>
            <p className="text-right text-sm">
              <span className="font-extrabold text-slate-900">{formatINR(order.total)}</span><br />
              <span className="text-xs text-slate-500">Expected {new Date(order.expectedDelivery).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            </p>
          </div>

          {/* timeline */}
          <div className="mt-6 space-y-0">
            {STEPS.map((s, i) => {
              const done = i <= activeIdx;
              const current = i === activeIdx;
              return (
                <div key={s.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${done ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-300'} ${current ? 'ring-4 ring-emerald-100' : ''}`}>
                      <s.icon className="h-4 w-4" />
                    </span>
                    {i < STEPS.length - 1 && <span className={`h-8 w-0.5 ${i < activeIdx ? 'bg-emerald-600' : 'bg-slate-200'}`} />}
                  </div>
                  <div className="pb-6 pt-1.5">
                    <p className={`text-sm font-bold ${done ? 'text-slate-900' : 'text-slate-400'}`}>{s.key}</p>
                    <p className="text-xs text-slate-500">{s.desc}</p>
                    {current && <p className="mt-0.5 text-xs font-semibold text-emerald-700">← Current status · updates on WhatsApp & SMS</p>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-2 flex gap-3 overflow-x-auto border-t border-dashed border-slate-200 pt-4">
            {order.items.map((i) => {
              const b = BOOKS.find((x) => x.id === i.bookId);
              return b ? (
                <Link key={i.bookId} to={`/book/${b.slug}`} className="w-20 shrink-0">
                  <BookCover book={b} className="text-[6px]" />
                  <p className="mt-1 line-clamp-2 text-[11px] font-semibold text-slate-700">{b.title}</p>
                </Link>
              ) : null;
            })}
          </div>
        </div>
      )}

      {!lookup && orders.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-base font-extrabold text-slate-900">Your recent orders</h2>
          <div className="space-y-2">
            {orders.map((o) => (
              <button key={o.id} onClick={() => { setInput(o.id); setLookup(o.id); }} className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-white p-4 text-left shadow-sm hover:shadow-md">
                <span>
                  <span className="block text-sm font-bold text-slate-800">{o.id}</span>
                  <span className="text-xs text-slate-500">{new Date(o.placedAt).toLocaleDateString('en-IN')} · {o.items.length} item(s)</span>
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">{o.status}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

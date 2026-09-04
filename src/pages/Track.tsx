import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Package, Truck, CheckCircle2, Warehouse, Bike, Search, MapPin, Clock, ShieldCheck, Loader2 } from 'lucide-react';
import { BOOKS } from '@/data/books';
import { formatINR } from '@/utils/helpers';
import { useStore } from '@/store/StoreContext';
import { BookCover } from '@/components/BookCover';
import { shippingService } from '@/services/api';

const DEFAULT_STEPS = [
  { key: 'Placed', icon: Package, desc: 'Order confirmed & payment received' },
  { key: 'Packed', icon: Warehouse, desc: 'Packed at fulfilment centre, label generated' },
  { key: 'Shipped', icon: Truck, desc: 'Handed to India Post Speed Post' },
  { key: 'Out for Delivery', icon: Bike, desc: 'Assigned to delivery postman today' },
  { key: 'Delivered', icon: CheckCircle2, desc: 'Consignment successfully delivered' },
];

export default function Track() {
  const { orders } = useStore();
  const [params] = useSearchParams();
  const [input, setInput] = useState(params.get('id') ?? '');
  const [lookup, setLookup] = useState(params.get('id') ?? '');
  const [loading, setLoading] = useState(false);
  const [liveTracking, setLiveTracking] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const localOrder = orders.find(
    (o) =>
      o.id.toLowerCase() === lookup.trim().toLowerCase() ||
      o.trackingId.toLowerCase() === lookup.trim().toLowerCase()
  );

  useEffect(() => {
    if (!lookup.trim()) {
      setLiveTracking(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setErrorMsg('');

    shippingService
      .trackShipment(lookup.trim())
      .then((res) => {
        if (isMounted) {
          if (res.success && res.data) {
            setLiveTracking(res.data);
          } else {
            setLiveTracking(null);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('Live tracking fallback:', err);
          // If local order exists, we still show the local representation
          if (!localOrder) {
            setErrorMsg('Unable to fetch live tracking. Please check the ID.');
          }
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [lookup]);

  const activeIdx = localOrder
    ? DEFAULT_STEPS.findIndex((s) => s.key === localOrder.status)
    : liveTracking?.tracking?.del_status?.del_status === 'delivered'
    ? 4
    : liveTracking?.tracking?.del_status?.del_status === 'out_for_delivery'
    ? 3
    : liveTracking?.tracking?.tracking_details?.length > 1
    ? 2
    : 1;

  const trackingDetails = liveTracking?.tracking?.tracking_details || [];
  const bookingDetails = liveTracking?.tracking?.booking_details;
  const matchedOrder = liveTracking?.order || localOrder;

  return (
    <div className="mx-auto max-w-3xl px-3 py-8 sm:px-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-extrabold text-slate-900">Track Your Order</h1>
        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800 flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" /> India Post Integrated
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Enter your Order ID (e.g. TW-20260901-...) or India Post Consignment Barcode (e.g. EB468827991IN)
      </p>

      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setLookup(input)}
          placeholder="e.g. TW-20260901-1234 or EB468827991IN"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 shadow-sm"
        />
        <button
          disabled={loading}
          onClick={() => setLookup(input)}
          className="flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50 transition-colors shadow-sm"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Track
        </button>
      </div>

      {lookup && !loading && !matchedOrder && !bookingDetails && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-center text-sm text-amber-800">
          {errorMsg || (
            <>
              No consignment or order found for "<b>{lookup}</b>". Please verify your Order ID or India Post barcode.
            </>
          )}
        </div>
      )}

      {(matchedOrder || bookingDetails) && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {/* Header Bar */}
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-dashed border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-base font-extrabold text-slate-900">
                  {matchedOrder?.orderNumber ? `Order #${matchedOrder.orderNumber}` : `Consignment ${bookingDetails?.article_number || lookup}`}
                </p>
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                  {matchedOrder?.carrier || 'India Post Speed Post'}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 flex items-center gap-2">
                <span>AWB: <b>{bookingDetails?.article_number || matchedOrder?.trackingNumber || lookup}</b></span>
                {bookingDetails?.booked_on && (
                  <span>· Booked: {new Date(bookingDetails.booked_on).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                )}
              </p>
            </div>

            {matchedOrder?.totalAmount && (
              <p className="text-right text-sm">
                <span className="font-extrabold text-slate-900">{formatINR(matchedOrder.totalAmount)}</span>
                <br />
                <span className="text-xs text-emerald-600 font-semibold">
                  Status: {matchedOrder.status || 'In Transit'}
                </span>
              </p>
            )}
          </div>

          {/* India Post Real-Time Checkpoints Timeline */}
          {trackingDetails.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Official India Post Postal History
              </h3>
              <div className="space-y-4">
                {trackingDetails.map((evt: any, idx: number) => {
                  const isLatest = idx === trackingDetails.length - 1;
                  return (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                            isLatest
                              ? 'border-2 border-emerald-600 bg-emerald-600 text-white ring-4 ring-emerald-100'
                              : 'border-2 border-slate-300 bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isLatest ? <Truck className="h-4 w-4" /> : <Clock className="h-3.5 w-3.5" />}
                        </span>
                        {idx < trackingDetails.length - 1 && (
                          <span className="h-10 w-0.5 bg-slate-200 mt-1" />
                        )}
                      </div>
                      <div className="pt-0.5 pb-2">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-bold ${isLatest ? 'text-emerald-900' : 'text-slate-800'}`}>
                            {evt.event}
                          </p>
                          {isLatest && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              Latest Checkpoint
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {evt.office} {evt.officeid ? `(Office ID: ${evt.officeid})` : ''}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {evt.date} · {evt.time} {evt.description ? `· ${evt.description}` : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Fallback high-level steps */
            <div className="mt-6 space-y-0">
              {DEFAULT_STEPS.map((s, i) => {
                const done = i <= activeIdx;
                const current = i === activeIdx;
                return (
                  <div key={s.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                          done
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-slate-200 bg-white text-slate-300'
                        } ${current ? 'ring-4 ring-emerald-100' : ''}`}
                      >
                        <s.icon className="h-4 w-4" />
                      </span>
                      {i < DEFAULT_STEPS.length - 1 && (
                        <span className={`h-8 w-0.5 ${i < activeIdx ? 'bg-emerald-600' : 'bg-slate-200'}`} />
                      )}
                    </div>
                    <div className="pb-6 pt-1.5">
                      <p className={`text-sm font-bold ${done ? 'text-slate-900' : 'text-slate-400'}`}>{s.key}</p>
                      <p className="text-xs text-slate-500">{s.desc}</p>
                      {current && (
                        <p className="mt-0.5 text-xs font-semibold text-emerald-700">
                          ← Current status · updates in real-time via India Post
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Book Items Preview */}
          {matchedOrder?.items && matchedOrder.items.length > 0 && (
            <div className="mt-4 flex gap-3 overflow-x-auto border-t border-dashed border-slate-200 pt-4">
              {matchedOrder.items.map((i: any, idx: number) => {
                const b = BOOKS.find((x) => x.id === (i.bookId || i.id) || x.slug === i.slug);
                return b ? (
                  <Link key={idx} to={`/book/${b.slug}`} className="w-20 shrink-0">
                    <BookCover book={b} className="text-[6px]" />
                    <p className="mt-1 line-clamp-2 text-[11px] font-semibold text-slate-700">{b.title}</p>
                  </Link>
                ) : (
                  <div key={idx} className="w-20 shrink-0 text-center">
                    <div className="h-24 rounded bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                      Book
                    </div>
                    <p className="mt-1 line-clamp-2 text-[11px] font-semibold text-slate-700">{i.title || 'Book Item'}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!lookup && orders.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-base font-extrabold text-slate-900">Your recent orders</h2>
          <div className="space-y-2">
            {orders.map((o) => (
              <button
                key={o.id}
                onClick={() => {
                  setInput(o.id);
                  setLookup(o.id);
                }}
                className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-white p-4 text-left shadow-sm hover:shadow-md transition-shadow"
              >
                <span>
                  <span className="block text-sm font-bold text-slate-800">{o.id}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(o.placedAt).toLocaleDateString('en-IN')} · {o.items.length} item(s) · {o.courier || 'India Post'}
                  </span>
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  {o.status}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


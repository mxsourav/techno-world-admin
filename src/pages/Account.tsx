import { Link, useNavigate } from 'react-router';
import { Package, Heart, MapPin, Gift, Bell, RotateCcw, User, LogOut, Download, RefreshCw } from 'lucide-react';
import { BOOKS } from '@/data/books';
import { formatINR } from '@/utils/helpers';
import { useStore } from '@/store/StoreContext';
import { BookCover } from '@/components/BookCover';
import { toast } from 'sonner';

export default function Account() {
  const { user, logout, orders, wishlist, addresses } = useStore();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <User className="mx-auto h-14 w-14 text-slate-300" />
        <h1 className="mt-3 text-xl font-bold text-slate-800">You're not logged in</h1>
        <p className="mt-1 text-sm text-slate-500">Use the Login button in the header — OTP, Google or email.</p>
        <Link to="/" className="mt-5 inline-block rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white">Go to Home</Link>
      </div>
    );
  }

  const buyAgain = orders.flatMap((o) => o.items.map((i) => BOOKS.find((b) => b.id === i.bookId))).filter(Boolean) as typeof BOOKS;

  return (
    <div className="mx-auto max-w-5xl px-3 py-6 sm:px-6">
      {/* profile card */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-emerald-700 p-6 text-white">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-400 text-xl font-extrabold text-slate-900">{user.name[0]}</span>
        <div className="flex-1">
          <h1 className="text-xl font-extrabold">{user.name}</h1>
          <p className="text-xs text-emerald-200">{user.email}{user.phone ? ` · +91 ${user.phone}` : ''}</p>
        </div>
        <div className="rounded-xl bg-white/10 px-4 py-2 text-center">
          <p className="flex items-center gap-1 text-lg font-extrabold text-amber-300"><Gift className="h-4 w-4" /> {user.rewardPoints}</p>
          <p className="text-[10px] uppercase tracking-wide text-emerald-200">Techno Points</p>
        </div>
        <button onClick={() => { logout(); navigate('/'); toast.success('Logged out'); }} className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold hover:bg-white/20">
          <LogOut className="h-3.5 w-3.5" /> Logout
        </button>
      </div>

      {/* quick links */}
      <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {[
          { icon: Package, t: 'Orders', to: '/track', n: orders.length },
          { icon: Heart, t: 'Wishlist', to: '/wishlist', n: wishlist.length },
          { icon: MapPin, t: 'Addresses', to: '/account', n: addresses.length },
          { icon: RotateCcw, t: 'Returns', to: '/help', n: 0 },
          { icon: Bell, t: 'Alerts', to: '/account', n: 2 },
          { icon: Gift, t: 'Refer & Earn', to: '/account', n: 0 },
        ].map((x) => (
          <Link key={x.t} to={x.to} onClick={(e) => { if (x.t === 'Refer & Earn') { e.preventDefault(); toast.success('Referral link copied! Both you and your friend get ₹100 in points.'); } }}
            className="relative flex flex-col items-center gap-1.5 rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md">
            <x.icon className="h-5 w-5 text-emerald-700" />
            <span className="text-xs font-bold text-slate-700">{x.t}</span>
            {x.n > 0 && <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">{x.n}</span>}
          </Link>
        ))}
      </div>

      {/* orders */}
      <section className="mt-6 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-base font-extrabold text-slate-900"><Package className="h-4 w-4 text-emerald-700" /> Order History</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-slate-500">No orders yet. <Link to="/" className="font-semibold text-emerald-700 hover:underline">Start shopping →</Link></p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-100 p-3">
                <div className="flex -space-x-4">
                  {o.items.slice(0, 3).map((i) => {
                    const b = BOOKS.find((x) => x.id === i.bookId);
                    return b ? <div key={i.bookId} className="w-10"><BookCover book={b} className="text-[5px]" /></div> : null;
                  })}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800">{o.id} · {formatINR(o.total)}</p>
                  <p className="text-xs text-slate-500">{o.items.length} item(s) · {new Date(o.placedAt).toLocaleDateString('en-IN')} · <span className="font-semibold text-emerald-700">{o.status}</span></p>
                </div>
                <div className="flex gap-2">
                  <Link to={`/track?id=${o.id}`} className="rounded-lg border border-emerald-600 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50">Track</Link>
                  <button onClick={() => toast.success('Invoice downloaded (PDF)')} className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50">
                    <Download className="h-3 w-3" /> Invoice
                  </button>
                  <button onClick={() => toast.success('Return request submitted. Pickup within 48h.')} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50">Return</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* buy again */}
      {buyAgain.length > 0 && (
        <section className="mt-6 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-base font-extrabold text-slate-900"><RefreshCw className="h-4 w-4 text-emerald-700" /> Buy Again</h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {buyAgain.slice(0, 6).map((b, idx) => (
              <Link key={b.id + idx} to={`/book/${b.slug}`} className="w-28 shrink-0">
                <BookCover book={b} className="text-[7px]" />
                <p className="mt-1 line-clamp-2 text-xs font-semibold text-slate-700">{b.title}</p>
                <p className="text-xs font-bold">{formatINR(b.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* addresses */}
      <section className="mt-6 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-base font-extrabold text-slate-900"><MapPin className="h-4 w-4 text-emerald-700" /> Saved Addresses</h2>
        {addresses.length === 0 ? (
          <p className="text-sm text-slate-500">No saved addresses — they're added automatically at checkout.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {addresses.map((a) => (
              <div key={a.id} className="rounded-lg border border-slate-100 p-3 text-sm">
                <p className="font-bold text-slate-800">{a.name} <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px]">{a.type}</span></p>
                <p className="text-xs text-slate-500">{a.line1}, {a.city}, {a.state} — {a.pincode}</p>
                <p className="text-xs text-slate-500">+91 {a.phone}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* notifications */}
      <section className="mt-6 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-base font-extrabold text-slate-900"><Bell className="h-4 w-4 text-emerald-700" /> Notifications</h2>
        <div className="space-y-2 text-sm">
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-900">🎉 Welcome bonus: 120 Techno Points added to your account!</p>
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-slate-600">📚 New arrivals in Competitive Exams — GATE 2026 papers now in stock.</p>
        </div>
      </section>
    </div>
  );
}

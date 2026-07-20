import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { Trash2, ShoppingBag, Tag, Truck, ArrowRight, Heart, Loader2 } from 'lucide-react';
import { formatINR } from '@/utils/helpers';
import { useStore, COUPONS } from '@/store/StoreContext';
import { BookCover } from '@/components/BookCover';
import { BookRow } from '@/components/BookCard';
import { bookService } from '@/services/api';
import type { Book } from '@/types';
import { toast } from 'sonner';

export function useCartTotals() {
  const { cart, coupon } = useStore();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{status: number, message: string} | null>(null);

  useEffect(() => {
    async function loadBooks() {
      if (cart.length === 0) {
        setBooks([]);
        setLoading(false);
        setError(null);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const ids = cart.map(i => i.bookId).join(',');
        const res = await bookService.getBooks({ ids, limit: 100 });
        setBooks(res.data || []);
      } catch (err: any) {
        setError({
          status: err?.status || 500,
          message: err?.status === 0 ? 'Network Error. Please check your connection.' : 'Failed to load cart items.'
        });
      } finally {
        setLoading(false);
      }
    }
    loadBooks();
  }, [cart]);

  return useMemo(() => {
    const items = cart
      .map((i) => ({ ...i, book: books.find((b) => b.id === i.bookId)! }))
      .filter((i) => i.book);
    const subtotal = items.reduce((s, i) => s + i.book.price * i.qty, 0);
    const mrpTotal = items.reduce((s, i) => s + i.book.mrp * i.qty, 0);
    const shipping = subtotal === 0 || subtotal >= 499 ? 0 : 40;
    const couponPct = coupon ? COUPONS[coupon]?.pct ?? 0 : 0;
    let discount = Math.round((subtotal * couponPct) / 100);
    if (coupon === 'NEWUSER20') discount = Math.min(discount, 500);
    const total = subtotal - discount + shipping;
    return { items, subtotal, mrpTotal, shipping, discount, total, coupon, loading, error };
  }, [cart, books, coupon, loading, error]);
}

export default function Cart() {
  const { removeFromCart, setQty, saveForLater, applyCoupon, clearCoupon, savedForLater, moveToCart } = useStore();
  const { items, subtotal, mrpTotal, shipping, discount, total, coupon, loading, error } = useCartTotals();
  const [code, setCode] = useState('');
  const [fbt, setFbt] = useState<Book[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    bookService.getBooks({ bestSeller: true, limit: 8 }).then(res => setFbt(res.data || [])).catch(console.error);
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-slate-500">
        <span className="text-4xl mb-4">⚠️</span>
        <h2 className="text-xl font-bold text-slate-700">Error Loading Cart</h2>
        <p className="text-sm mt-2">{error.message}</p>
        <button onClick={() => window.location.reload()} className="mt-4 rounded-lg bg-emerald-600 px-6 py-2 font-bold text-white">Retry</button>
      </div>
    );
  }

  if (items.length === 0 && savedForLater.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-slate-300" />
        <h1 className="mt-4 text-xl font-bold text-slate-800">Your cart is empty</h1>
        <p className="mt-1 text-sm text-slate-500">Browse best sellers, exam books and new releases.</p>
        <Link to="/" className="mt-5 inline-block rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-800">Start Shopping</Link>
        <div className="mt-8 text-left"><BookRow title="Best Sellers" books={fbt} /></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6">
      <h1 className="mb-4 text-2xl font-extrabold text-slate-900">Shopping Cart <span className="text-base font-medium text-slate-400">({items.length} item{items.length !== 1 ? 's' : ''})</span></h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {items.map((i) => (
            <div key={i.bookId} className="flex gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <Link to={`/book/${i.book.slug}`} className="w-20 shrink-0 sm:w-24"><BookCover book={i.book} className="text-[9px]" /></Link>
              <div className="min-w-0 flex-1">
                <Link to={`/book/${i.book.slug}`} className="line-clamp-2 text-sm font-bold text-slate-800 hover:text-emerald-800">{i.book.title}</Link>
                <p className="text-xs text-slate-500">{i.book.author}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Delivery by <b className="text-slate-700">{new Date(Date.now() + 4 * 86400000).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</b>
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <div className="flex items-center rounded-lg border border-slate-200">
                    <button onClick={() => setQty(i.bookId, i.qty - 1)} className="px-2.5 py-1 font-bold text-slate-500">−</button>
                    <span className="w-7 text-center text-sm font-bold">{i.qty}</span>
                    <button onClick={() => setQty(i.bookId, i.qty + 1)} className="px-2.5 py-1 font-bold text-slate-500">+</button>
                  </div>
                  <button onClick={() => { saveForLater(i.bookId); toast.info('Saved for later'); }} className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-700">
                    <Heart className="h-3.5 w-3.5" /> Save for later
                  </button>
                  <button onClick={() => removeFromCart(i.bookId)} className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600">
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base font-extrabold text-slate-900">{formatINR(i.book.price * i.qty)}</p>
                <p className="text-xs text-slate-400 line-through">{formatINR(i.book.mrp * i.qty)}</p>
              </div>
            </div>
          ))}

          {savedForLater.length > 0 && (
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="mb-3 text-sm font-bold text-slate-800">Saved for later ({savedForLater.length})</p>
              {savedForLater.map((i: any) => (
                <div key={i.bookId} className="flex items-center gap-3 border-t border-slate-50 py-3 first:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-semibold text-slate-800">Book ID: {i.bookId}</p>
                    <p className="text-xs font-bold text-slate-900">Qty: {i.qty}</p>
                  </div>
                  <button onClick={() => moveToCart(i.bookId)} className="rounded-lg border border-emerald-600 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50">Move to cart</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* price summary */}
        <aside className="h-fit rounded-xl border border-slate-100 bg-white p-5 shadow-sm lg:sticky lg:top-36">
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">Price Details</p>
          {coupon ? (
            <div className="mb-3 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-xs">
              <span className="flex items-center gap-1.5 font-bold text-emerald-800"><Tag className="h-3.5 w-3.5" /> {coupon} applied</span>
              <button onClick={clearCoupon} className="font-semibold text-rose-500">Remove</button>
            </div>
          ) : (
            <div className="mb-3">
              <div className="flex gap-2">
                <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Coupon code" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-emerald-500" />
                <button
                  onClick={() => { 
                    const r = applyCoupon(code); 
                    if (r.ok) { toast.success(r.message) } else { toast.error(r.message) } 
                  }}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                >Apply</button>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">Try: BOOKWORM10 · STUDENT15 · NEWUSER20</p>
            </div>
          )}
          <dl className="space-y-2 border-b border-dashed border-slate-200 pb-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Price ({items.reduce((s, i) => s + i.qty, 0)} items)</dt><dd>{formatINR(mrpTotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Book discount</dt><dd className="text-emerald-700">− {formatINR(mrpTotal - subtotal)}</dd></div>
            {discount > 0 && <div className="flex justify-between"><dt className="text-slate-500">Coupon savings</dt><dd className="text-emerald-700">− {formatINR(discount)}</dd></div>}
            <div className="flex justify-between">
              <dt className="flex items-center gap-1 text-slate-500"><Truck className="h-3.5 w-3.5" /> Delivery</dt>
              <dd>{shipping === 0 ? <span className="font-semibold text-emerald-700">FREE</span> : formatINR(shipping)}</dd>
            </div>
          </dl>
          <div className="mt-3 flex justify-between text-base font-extrabold"><span>Total</span><span>{formatINR(total)}</span></div>
          <p className="mt-1 text-xs font-semibold text-emerald-700">You save {formatINR(mrpTotal - subtotal + discount)} on this order 🎉</p>
          <button
            onClick={() => navigate('/checkout')}
            disabled={items.length === 0}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 text-sm font-extrabold text-slate-900 hover:bg-amber-500 disabled:opacity-40"
          >
            Proceed to Checkout <ArrowRight className="h-4 w-4" />
          </button>
        </aside>
      </div>

      <div className="mt-6"><BookRow title="Frequently bought together" books={fbt} /></div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  ChevronRight, Heart, Share2, Truck, ShieldCheck, RotateCcw, MapPin, Zap, ShoppingCart, BadgeCheck, Loader2
} from 'lucide-react';

import { discountPct, formatINR } from '@/utils/helpers';
import { bookService, categoryService } from '@/services/api';
import { useStore } from '@/store/StoreContext';
import { BookCover } from '@/components/BookCover';
import { BookRow, RatingStars } from '@/components/BookCard';
import { toast } from 'sonner';

export default function Product() {
  const { slug } = useParams();
  const [book, setBook] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [fbt, setFbt] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{status: number, message: string} | null>(null);
  const [cat, setCat] = useState<any>(null);
  
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted, addRecentlyViewed } = useStore();
  const [pincode, setPincode] = useState('');
  const [delivery, setDelivery] = useState<string | null>(null);
  const [tab, setTab] = useState<'desc' | 'toc' | 'reviews'>('desc');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    bookService.getBookBySlug(slug)
      .then(res => {
        if (res.success && res.data) {
          setBook(res.data);
          addRecentlyViewed(res.data.id);
          document.title = `${res.data.title} — ${res.data.author} | Techno World Books`;
          
          bookService.getBooks({ category: res.data.category, limit: 12 })
            .then(relRes => {
              if (relRes.success) {
                const others = relRes.data.filter((b: any) => b.id !== res.data.id);
                setRelated(others.slice(0, 10));
                setFbt(others.slice(0, 2));
              }
            }).catch(console.error);
        }
      })
      .catch((err: any) => {
        setError({
          status: err?.status || 500,
          message: err?.status === 404 ? 'Book not found' : err?.status === 0 ? 'Network Error. Please check your connection.' : 'Something went wrong.'
        });
      })
      .finally(() => {
        setLoading(false);
        window.scrollTo(0, 0);
      });
  }, [slug, addRecentlyViewed]);

  useEffect(() => {
    if (book?.category) {
      categoryService.getCategories().then(res => {
        setCat(res.data.find((c: any) => c.slug === book.category));
      }).catch(console.error);
    }
  }, [book?.category]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
        <p>Loading book details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-5xl">{error.status === 404 ? '📕' : '⚠️'}</p>
        <h1 className="mt-4 text-xl font-bold">{error.status === 404 ? 'Book not found' : error.message}</h1>
        <Link to="/" className="mt-4 inline-block rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white">Back to Home</Link>
      </div>
    );
  }

  if (!book) return null;

  const pct = discountPct(book);

  const checkPincode = () => {
    if (!/^\d{6}$/.test(pincode)) return toast.error('Enter a valid 6-digit pincode');
    const days = 2 + (parseInt(pincode[0], 10) % 4);
    const date = new Date(Date.now() + days * 86400000);
    setDelivery(`Delivery by ${date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} — ${book.price >= 499 ? 'FREE' : '₹40'}`);
  };

  const share = async () => {
    try {
      await navigator.share({ title: book.title, text: `${book.title} by ${book.author} — ${formatINR(book.price)} on Techno World Books`, url: window.location.href });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const ratingDist = [
    { star: 5, pct: Math.round(book.rating * 14) },
    { star: 4, pct: Math.round((5 - book.rating) * 20) },
    { star: 3, pct: 8 }, { star: 2, pct: 3 }, { star: 1, pct: 2 },
  ];

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6">
      {/* breadcrumbs */}
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs text-slate-500">
        <Link to="/" className="hover:text-emerald-700">Home</Link><ChevronRight className="h-3 w-3" />
        {cat && (<><Link to={`/category/${cat.slug}`} className="hover:text-emerald-700">{cat.name}</Link><ChevronRight className="h-3 w-3" /></>)}
        <span className="line-clamp-1 font-semibold text-slate-700">{book.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        {/* cover */}
        <div className="mx-auto w-full max-w-xs lg:sticky lg:top-36 lg:self-start">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <BookCover book={book} className="text-lg" />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg border border-slate-100 bg-white p-2 opacity-70 hover:opacity-100">
                <BookCover book={book} className="text-[6px]" />
              </div>
            ))}
          </div>
        </div>

        {/* details */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{book.title}</h1>
          <p className="mt-1 text-sm text-slate-600">
            by <Link to={`/search?q=${encodeURIComponent(book.author)}`} className="font-semibold text-emerald-700 hover:underline">{book.author}</Link>
            {' '}· <span className="text-slate-400">{book.publisher}</span>
          </p>
          <div className="mt-2 flex items-center gap-2">
            <RatingStars rating={book.rating} />
            <span className="text-sm font-bold text-slate-800">{book.rating}</span>
            <span className="text-xs text-slate-400">· {book.ratingsCount.toLocaleString('en-IN')} ratings</span>
            <span className="flex items-center gap-1 text-xs text-emerald-700"><BadgeCheck className="h-3.5 w-3.5" /> Verified reviews</span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-slate-900">{formatINR(book.price)}</span>
            {pct > 0 && <span className="text-lg text-slate-400 line-through">{formatINR(book.mrp)}</span>}
            {pct > 0 && <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-sm font-bold text-emerald-700">{pct}% off</span>}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">Inclusive of all taxes · Earn {Math.floor(book.price / 100) * 5} Techno Reward points</p>

          <div className="mt-3">
            {book.stock > 10 ? (
              <p className="text-sm font-semibold text-emerald-700">✓ In Stock — ships within 24 hours</p>
            ) : book.stock > 0 ? (
              <p className="text-sm font-semibold text-orange-600">⚠ Hurry, only {book.stock} left in stock!</p>
            ) : (
              <p className="text-sm font-semibold text-rose-600">Out of stock — we'll notify you on restock</p>
            )}
          </div>

          {/* delivery */}
          <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-700" />
              <input
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter delivery pincode"
                className="w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                inputMode="numeric"
              />
              <button onClick={checkPincode} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800">Check</button>
            </div>
            {delivery && <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-700"><Truck className="h-4 w-4" /> {delivery}</p>}
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5 text-emerald-600" /> Free delivery above ₹499</span>
              <span className="flex items-center gap-1"><RotateCcw className="h-3.5 w-3.5 text-emerald-600" /> 7-day easy returns</span>
              <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> 100% genuine books</span>
            </div>
          </div>

          {/* actions */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-lg border border-slate-200">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2.5 font-bold text-slate-500">−</button>
              <span className="w-8 text-center text-sm font-bold">{qty}</span>
              <button onClick={() => setQty(Math.min(10, qty + 1))} className="px-3 py-2.5 font-bold text-slate-500">+</button>
            </div>
            <button
              onClick={() => { addToCart(book.id, qty); toast.success('Added to cart'); }}
              disabled={book.stock === 0}
              className="flex items-center gap-2 rounded-xl border-2 border-amber-400 bg-white px-6 py-2.5 text-sm font-extrabold text-slate-900 hover:bg-amber-50 disabled:opacity-40"
            >
              <ShoppingCart className="h-4 w-4" /> Add to Cart
            </button>
            <button
              onClick={() => { addToCart(book.id, qty); navigate('/checkout'); }}
              disabled={book.stock === 0}
              className="flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-sm font-extrabold text-slate-900 hover:bg-amber-500 disabled:opacity-40"
            >
              <Zap className="h-4 w-4" /> Buy Now
            </button>
            <button
              onClick={() => toggleWishlist(book.id)}
              className={`flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold ${isWishlisted(book.id) ? 'border-rose-200 bg-rose-50 text-rose-600' : 'text-slate-600 hover:border-rose-200'}`}
            >
              <Heart className={`h-4 w-4 ${isWishlisted(book.id) ? 'fill-rose-500 text-rose-500' : ''}`} /> Wishlist
            </button>
            <button onClick={share} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:border-emerald-300">
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>

          {/* frequently bought together */}
          {fbt.length > 0 && (
            <div className="mt-6 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="mb-3 text-sm font-bold text-slate-800">Frequently bought together</p>
              <div className="flex flex-wrap items-center gap-3">
                {[book, ...fbt].map((b, i) => (
                  <div key={b.id} className="flex items-center gap-3">
                    {i > 0 && <span className="text-lg font-bold text-slate-300">+</span>}
                    <Link to={`/book/${b.slug}`} className="w-16 shrink-0"><BookCover book={b} className="text-[7px]" /></Link>
                  </div>
                ))}
                <div className="ml-auto">
                  <p className="text-sm text-slate-500">Total: <b className="text-slate-900">{formatINR(book.price + fbt.reduce((s, b) => s + b.price, 0))}</b></p>
                  <button
                    onClick={() => { addToCart(book.id); fbt.forEach((b) => addToCart(b.id)); toast.success('3 books added to cart'); }}
                    className="mt-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800"
                  >
                    Add all to cart
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* specs */}
          <div className="mt-6 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="mb-3 text-sm font-bold text-slate-800">Book Details</p>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
              {[
                ['ISBN', book.isbn], ['Publisher', book.publisher], ['Edition', book.edition],
                ['Publication Date', new Date(book.pubDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })],
                ['Language', book.language], ['Pages', String(book.pages)],
                ...(book.exam ? [['Exam', book.exam]] : []),
                ...(book.course ? [['Course', book.course]] : []),
                ...(book.semester ? [['Semester', book.semester]] : []),
              ].map(([k, v]) => (
                <div key={k}><dt className="text-xs text-slate-400">{k}</dt><dd className="font-semibold text-slate-700">{v}</dd></div>
              ))}
            </dl>
          </div>

          {/* tabs */}
          <div className="mt-6 rounded-xl border border-slate-100 bg-white shadow-sm">
            <div className="flex border-b">
              {([['desc', 'Description'], ['toc', 'Table of Contents'], ['reviews', `Reviews (${book.reviews.length})`]] as const).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`px-5 py-3 text-sm font-bold ${tab === k ? 'border-b-2 border-emerald-700 text-emerald-800' : 'text-slate-500'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="p-5">
              {tab === 'desc' && <p className="text-sm leading-relaxed text-slate-600">{book.description}</p>}
              {tab === 'toc' && (
                <ol className="list-decimal space-y-1.5 pl-5 text-sm text-slate-600">
                  {book.toc.map((t: string) => <li key={t}>{t}</li>)}
                </ol>
              )}
              {tab === 'reviews' && (
                <div className="grid gap-6 md:grid-cols-[220px_1fr]">
                  <div>
                    <p className="text-4xl font-extrabold text-slate-900">{book.rating}<span className="text-lg text-slate-400">/5</span></p>
                    <RatingStars rating={book.rating} />
                    <p className="mt-1 text-xs text-slate-400">{book.ratingsCount.toLocaleString('en-IN')} ratings</p>
                    <div className="mt-3 space-y-1">
                      {ratingDist.map((r) => (
                        <div key={r.star} className="flex items-center gap-2 text-xs">
                          <span className="w-6 font-semibold text-slate-600">{r.star}★</span>
                          <div className="h-1.5 flex-1 rounded-full bg-slate-100"><div className="h-full rounded-full bg-amber-400" style={{ width: `${r.pct}%` }} /></div>
                          <span className="w-8 text-slate-400">{r.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    {book.reviews.map((r: any) => (
                      <div key={r.id} className="border-b border-slate-100 pb-4 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">{r.user[0]}</span>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{r.user}</p>
                            <div className="flex items-center gap-1.5">
                              <RatingStars rating={r.rating} size={3} />
                              {r.verified && <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700"><BadgeCheck className="h-3 w-3" /> Verified Purchase</span>}
                            </div>
                          </div>
                          <span className="ml-auto text-xs text-slate-400">{new Date(r.date).toLocaleDateString('en-IN')}</span>
                        </div>
                        <p className="mt-2 text-sm font-bold text-slate-800">{r.title}</p>
                        <p className="text-sm text-slate-600">{r.body}</p>
                      </div>
                    ))}
                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="text-sm font-bold text-slate-800">Questions & Answers</p>
                      <p className="mt-1 text-xs text-slate-500">Have a question about this edition? <button className="font-semibold text-emerald-700 hover:underline" onClick={() => toast.success('Question submitted! Sellers typically answer within 24h.')}>Ask now</button></p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4"><BookRow title="Related Books" books={related} /></div>
    </div>
  );
}

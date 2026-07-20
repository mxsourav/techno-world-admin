import { Link } from 'react-router';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import type { Book } from '@/types';
import { discountPct, formatINR } from '@/utils/helpers';
import { useStore } from '@/store/StoreContext';
import { BookCover } from './BookCover';

export function RatingStars({ rating, size = 3.5 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-${size} w-${size} ${i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
          style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
        />
      ))}
    </span>
  );
}

export function BookCard({ book }: { book: Book }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const pct = discountPct(book);
  const wish = isWishlisted(book.id);
  return (
    <div className="group relative flex w-40 shrink-0 flex-col rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition hover:shadow-lg sm:w-48">
      <button
        onClick={() => toggleWishlist(book.id)}
        aria-label="Add to wishlist"
        className={`absolute right-4 top-4 z-10 rounded-full p-1.5 shadow-sm transition ${wish ? 'bg-rose-50 text-rose-500' : 'bg-white/90 text-slate-400 hover:text-rose-500'}`}
      >
        <Heart className={`h-4 w-4 ${wish ? 'fill-rose-500' : ''}`} />
      </button>
      <Link to={`/book/${book.slug}`} className="block">
        <BookCover book={book} className="text-sm transition-transform duration-300 group-hover:-translate-y-1" />
        <div className="mt-3 flex-1">
          <h3 className="line-clamp-2 min-h-[2.5em] text-sm font-semibold leading-tight text-slate-800 group-hover:text-emerald-800">
            {book.title}
          </h3>
          <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{book.author}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="flex items-center gap-0.5 rounded bg-emerald-700 px-1.5 py-0.5 text-[11px] font-bold text-white">
              {book.rating} <Star className="h-2.5 w-2.5 fill-white" />
            </span>
            <span className="text-[11px] text-slate-400">({book.ratingsCount.toLocaleString('en-IN')})</span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-base font-bold text-slate-900">{formatINR(book.price)}</span>
            {pct > 0 && <span className="text-xs text-slate-400 line-through">{formatINR(book.mrp)}</span>}
            {pct > 0 && <span className="text-xs font-semibold text-emerald-600">{pct}% off</span>}
          </div>
          {book.stock <= 5 && <p className="mt-0.5 text-[11px] font-medium text-orange-600">Only {book.stock} left!</p>}
        </div>
      </Link>
      <button
        onClick={() => addToCart(book.id)}
        className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-amber-400 py-1.5 text-xs font-bold text-slate-900 transition hover:bg-amber-500"
      >
        <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
      </button>
    </div>
  );
}

export function BookCardSkeleton() {
  return (
    <div className="flex w-40 shrink-0 flex-col rounded-xl border border-slate-100 bg-white p-3 shadow-sm sm:w-48 animate-pulse">
      <div className="w-full aspect-[2/3] bg-slate-200 rounded-lg"></div>
      <div className="mt-3 flex-1 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-full"></div>
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="h-3 bg-slate-200 rounded w-1/2 mt-2"></div>
        <div className="h-4 bg-slate-200 rounded w-1/3 mt-3"></div>
      </div>
      <div className="mt-2 h-7 bg-slate-200 rounded-lg w-full"></div>
    </div>
  );
}

export function BookRow({ title, icon, books, viewAllLink, loading }: { title: string; icon?: React.ReactNode; books: Book[]; viewAllLink?: string; loading?: boolean }) {
  if (!loading && !books.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-3 py-5 sm:px-6">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 sm:text-xl">
          {icon} {title}
        </h2>
        {viewAllLink && (
          <Link to={viewAllLink} className="text-sm font-semibold text-emerald-600 hover:text-emerald-500">
            View All
          </Link>
        )}
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:thin]">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <BookCardSkeleton key={i} />)
          : books.map((b) => <BookCard key={b.id} book={b} />)}
      </div>
    </section>
  );
}

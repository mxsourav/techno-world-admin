import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, FileText, ShoppingBag, Star, Loader2 } from 'lucide-react';
import { featuredBooks as manualFeaturedBooks, AUTO_FEATURED_BOOKS } from '@/config/featuredBooks';
import { useAutoFeaturedBooks } from '@/hooks/useAutoFeaturedBooks';
import { Link } from 'react-router';

export default function HeroFeaturedBooks() {
  const { books: autoBooks, loading } = useAutoFeaturedBooks();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const featuredBooks = AUTO_FEATURED_BOOKS ? autoBooks : manualFeaturedBooks;

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (featuredBooks.length || 1));
    }, 6000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (!isHovered && featuredBooks.length > 0) startTimer();
    else stopTimer();
    return () => stopTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHovered, featuredBooks.length]);

  const next = () => {
    if (featuredBooks.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % featuredBooks.length);
  };

  const prev = () => {
    if (featuredBooks.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + featuredBooks.length) % featuredBooks.length);
  };

  if (AUTO_FEATURED_BOOKS && loading) {
    return (
      <div className="relative flex min-h-[300px] w-full items-center justify-center overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/80 to-emerald-950/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="flex flex-col items-center gap-4 text-emerald-200">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm font-bold">Loading Featured Books...</p>
        </div>
      </div>
    );
  }

  if (!featuredBooks || featuredBooks.length === 0) return null;

  const activeBook = featuredBooks[currentIndex];
  // Determine if it's an auto-generated book with a slug or fallback to search query
  const shopNowLink = ('slug' in activeBook && activeBook.slug) 
    ? `/book/${activeBook.slug}` 
    : `/search?q=${encodeURIComponent(activeBook.title)}`;

  return (
    <div 
      className="relative w-full overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/80 to-emerald-950/80 p-6 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:shadow-emerald-900/80 sm:p-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute right-4 top-4 rounded-md bg-amber-400 px-3 py-1 text-xs font-bold text-slate-900 shadow-sm shadow-amber-400/20">
        Featured
      </div>

      <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
        {/* Book Cover */}
        <div className="group relative shrink-0 overflow-hidden rounded-xl bg-slate-100 shadow-xl h-48 w-32 mx-auto sm:mx-0 sm:h-[260px] sm:w-[180px]">
          <img 
            src={activeBook.cover} 
            alt={activeBook.title} 
            key={activeBook.id}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 animate-in fade-in"
            loading="lazy"
          />
        </div>

        {/* Book Details */}
        <div className="flex-1 space-y-4 text-white pl-2">
          <div key={`${activeBook.id}-details`} className="animate-in fade-in duration-700">
            <h3 className="text-2xl font-black leading-tight tracking-tight sm:text-3xl line-clamp-2 text-white">
              {activeBook.title}
            </h3>
            <p className="mt-2 text-sm text-emerald-100 sm:text-base">
              by <span className="font-bold text-amber-300">{activeBook.author}</span> • {activeBook.publisher}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center text-amber-400">
              <Star className="h-4 w-4 fill-current" />
              <span className="ml-1 text-sm font-bold">{activeBook.rating}</span>
            </div>
            <span className="text-emerald-400/50">•</span>
            <p className="text-xl font-black text-amber-400">
              {typeof activeBook.price === 'number' ? `₹${activeBook.price}` : activeBook.price}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {activeBook.pdf && (
              <a 
                href={activeBook.pdf} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/20"
              >
                <FileText className="h-4 w-4" /> Read Preview
              </a>
            )}
            <Link 
              to={shopNowLink}
              className="flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-extrabold text-slate-900 transition-colors hover:bg-amber-300"
            >
              <ShoppingBag className="h-4 w-4" /> Shop Now
            </Link>
          </div>
        </div>
      </div>

      {/* Manual Controls & Pagination */}
      <div className="mt-6 flex items-center justify-between border-t border-emerald-700/50 pt-5">
        <div className="flex gap-2">
          {featuredBooks.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-8 bg-amber-400' : 'w-2 bg-emerald-700 hover:bg-emerald-500'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={prev}
            className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-800 text-emerald-200 transition-colors hover:bg-emerald-700 hover:text-white"
            aria-label="Previous book"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={next}
            className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-800 text-emerald-200 transition-colors hover:bg-emerald-700 hover:text-white"
            aria-label="Next book"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

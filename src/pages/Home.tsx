import { Link, useNavigate } from 'react-router';
import { BadgePercent, Sparkles, Gift, Truck, ArrowRight, Trophy, Flame, TrendingUp, Sparkle, Stethoscope, Settings, GraduationCap, Library, BookOpen, Quote, Languages, Globe2, Gem, Heart, Clock, ShieldCheck, Package, MessageCircle, Tag, Users } from 'lucide-react';
import { useState, useEffect } from 'react';

import { bookService, categoryService } from '@/services/api';
import type { Book } from '@/types';
import { useStore } from '@/store/StoreContext';
import { BookRow } from '@/components/BookCard';
import { SearchBar } from '@/components/Header';
import HeroFeaturedBooks from '@/components/HeroFeaturedBooks';
import PublishedByTechnoWorld from '@/components/PublishedByTechnoWorld';
import StudyGuides from '@/components/StudyGuides';
import { useAutoFeaturedBooks } from '@/hooks/useAutoFeaturedBooks';

const PUBLISHERS = ['NCERT', 'Arihant Publications', 'McGraw Hill', 'Elsevier', 'Penguin', 'Ananda Publishers', 'MTG Learning Media', 'Dhanpat Rai'];

export default function Home() {
  const { recentlyViewed } = useStore();
  const navigate = useNavigate();

  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { books: autoBooks } = useAutoFeaturedBooks();

  useEffect(() => {
    // Keep for any future featured slider logic
  }, [autoBooks.length]);

  useEffect(() => {
    setLoading(true);
    setError(false);
    Promise.all([
      bookService.getBooks({ limit: 100 }).catch(() => ({ success: false, data: [] })),
      categoryService.getCategories().catch(() => ({ success: false, data: [] }))
    ])
    .then(([booksRes, catRes]) => {
      if (booksRes.success && booksRes.data?.length > 0) {
        setBooks(booksRes.data);
      } else if (!booksRes.success) {
        setError(true);
      }
      if (catRes.success && catRes.data?.length > 0) setCategories(catRes.data);
    })
    .finally(() => setLoading(false));
  }, []);

  const bestsellers = books.filter((b) => b.bestseller);
  const trending = books.filter((b) => b.trending);
  const newReleases = books.filter((b) => b.newRelease);
  const recent = recentlyViewed.map((id) => books.find((b) => b.id === id)).filter(Boolean) as Book[];
  const recommended = [...books].sort((a, b) => b.rating * b.ratingsCount - a.rating * a.ratingsCount).slice(0, 10);
  
  const byCategory = (slug: string) => books.filter((b) => b.category === slug).slice(0, 10);

  // const featuredBook = books.find((b) => b.featured) || books[0];

  return (
    <div className="bg-slate-50 selection:bg-emerald-500/30">
      {/* Hero Section */}
      <section className="relative w-full min-h-[85vh] overflow-x-clip bg-[#02120b] text-white flex flex-col justify-center py-14 lg:py-18">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-no-repeat bg-cover"
          style={{ 
            backgroundImage: 'url("/hero_mockup.png")',
            backgroundPosition: 'center 45%'
          }}
        />
        {/* Gradient Overlay (Cinematic Dark Mossy Green fade) */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#03150b] via-[#0a2e16]/95 to-transparent pointer-events-none w-full lg:w-[95%]"></div>
        
        {/* Subtle Geometric Texture Overlay (Fades out early to the right) */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none w-full lg:w-[70%] opacity-80"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M64 0H0v64' fill='none' stroke='%23ffffff' stroke-width='1.5' stroke-opacity='0.12'/%3E%3C/svg%3E")`,
            WebkitMaskImage: 'linear-gradient(to right, black, transparent 75%)'
          }}
        ></div>

        {/* Content Container - Exactly matches Header.tsx alignment */}
        <div className="relative z-10 w-full max-w-7xl px-3 sm:px-6 mx-auto lg:ml-[11%] lg:mr-auto">
          
          {/* Left Column (Right is empty because book is in the image) */}
          <div className="flex flex-col w-full lg:w-[60%] max-w-[750px] text-left overflow-visible">
            
            {/* Top Sale Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#0a2e1f] border border-[#D4A017] px-3.5 py-1 mb-5 shadow-sm">
              <Tag className="h-3.5 w-3.5 text-[#D4A017]" />
              <span className="text-[13px] font-medium text-[#D4A017]">Grand Book Sale — Up to 60% off 10,000+ titles</span>
            </div>
            
            {/* Main Heading */}
            <h1 
              className="font-bold drop-shadow-md max-w-[800px]"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(2.2rem, 3.5vw, 3.75rem)",
                lineHeight: "1.15",
                letterSpacing: "-0.01em"
              }}
            >
              <span 
                className="block"
                style={{ 
                  backgroundImage: "linear-gradient(to bottom, #FFFFFF 0%, #B8C4BE 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0px 3px 5px rgba(0,0,0,0.4))"
                }}
              >
                Every book India reads,
              </span>
              <span 
                className="block mt-1"
                style={{ 
                  backgroundImage: "linear-gradient(to bottom, #FFE885 0%, #E6A300 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.5))"
                }}
              >
                one search away.
              </span>
            </h1>
            
            {/* Description */}
            <p 
              className="mt-4 font-normal drop-shadow"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "1.05rem",
                lineHeight: "1.55",
                color: "rgba(255, 255, 255, 0.85)",
                maxWidth: "520px",
                textAlign: "justify"
              }}
            >
              From academic textbooks to bestselling fiction, get genuine books delivered straight to your doorstep with guaranteed lowest prices.
            </p>

            {/* Search Bar */}
            <SearchBar 
              className="mt-6 shadow-[0_12px_35px_rgba(0,0,0,0.4)] w-full h-[54px] [&_input]:text-[14px]" 
            />

            {/* Category Chips */}
            <div 
              className="mt-[18px] flex flex-wrap gap-[10px] items-center justify-center w-full hero-chip-container"
              style={{ overflow: 'visible', overflowY: 'hidden', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <style>{`
                .hero-chip-container::-webkit-scrollbar { display: none; }
              `}</style>
              {['NCERT Class 12', 'NEET books', 'Atomic Habits', 'UPSC polity', 'SSC', 'JEE'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
                  className="flex items-center gap-1.5 px-[16px] py-[8px] rounded-[999px] text-[#F5F5F5] text-[13px] transition-all duration-250 ease-in-out"
                  style={{ 
                    background: 'rgba(15,55,38,0.65)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(8px)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#0E5A3A'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15,55,38,0.65)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-300" />
                  {tag}
                </button>
              ))}
            </div>

            {/* Feature Icons (Flows naturally 40px below left content) */}
            <div className="mt-[30px] w-full rounded-[20px] bg-[#f8f5ef] py-2.5 px-5 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.5)] hidden lg:flex items-center justify-around border border-[#e5e0d8]">
              <div className="flex items-center gap-3 px-3">
                <Package className="h-6 w-6 text-slate-800" strokeWidth={1.5} />
                <div>
                  <div className="font-bold text-slate-900 text-[13px]">Easy Returns</div>
                  <div className="text-slate-500 text-[11px]">Hassle-free returns</div>
                </div>
              </div>
              <div className="w-px h-7 bg-slate-200"></div>
              <div className="flex items-center gap-3 px-3">
                <ShieldCheck className="h-6 w-6 text-slate-800" strokeWidth={1.5} />
                <div>
                  <div className="font-bold text-slate-900 text-[13px]">Secure Payments</div>
                  <div className="text-slate-500 text-[11px]">100% protected</div>
                </div>
              </div>
              <div className="w-px h-7 bg-slate-200"></div>
              <div className="flex items-center gap-3 px-3">
                <Users className="h-6 w-6 text-slate-800" strokeWidth={1.5} />
                <div>
                  <div className="font-bold text-slate-900 text-[13px]">Trusted by Students</div>
                  <div className="text-slate-500 text-[11px]">Across India</div>
                </div>
              </div>
              <div className="w-px h-7 bg-slate-200"></div>
              <div className="flex items-center gap-3 px-3">
                <MessageCircle className="h-6 w-6 text-slate-800" strokeWidth={1.5} />
                <div>
                  <div className="font-bold text-slate-900 text-[13px]">24/7 Support</div>
                  <div className="text-slate-500 text-[11px]">We're here to help</div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* CATEGORY GRID */}
      <section className="mx-auto max-w-7xl px-4 py-8 pb-12 sm:px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {categories.slice(0, 8).map((c: any) => (
            <Link
              key={c.slug}
              to={`/category/${c.slug}`}
              className="group flex flex-col items-center gap-3 rounded-2xl bg-white p-4 text-center shadow-sm transition hover:shadow-md border border-slate-100"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white">
                {c.icon || <BookOpen className="h-6 w-6" />}
              </div>
              <span className="text-[10px] font-semibold leading-tight text-slate-700 sm:text-[11px]">{c.name.replace(' Books', '').replace('Competitive Exam', 'Exams')}</span>
            </Link>
          ))}
        </div>
      </section>

      <PublishedByTechnoWorld />
      
      <StudyGuides />

      {/* OFFER STRIP */}
      <section className="mx-auto grid max-w-7xl gap-3 px-3 sm:grid-cols-3 sm:px-6 mb-8">
        {[
          { icon: BadgePercent, t: 'STUDENT15 — 15% off', d: 'For students on exam & academic books', c: 'from-amber-400 to-orange-400' },
          { icon: Truck, t: 'Free Delivery', d: 'On all orders above ₹499 across India', c: 'from-emerald-500 to-teal-500' },
          { icon: Gift, t: 'Techno Rewards', d: 'Earn 5 points per ₹100 spent, redeem anytime', c: 'from-violet-500 to-purple-500' },
        ].map((o) => (
          <div key={o.t} className={`flex items-center gap-3 rounded-xl bg-gradient-to-r ${o.c} p-4 text-white shadow-sm`}>
            <o.icon className="h-8 w-8 shrink-0 opacity-90" />
            <div>
              <p className="text-sm font-extrabold">{o.t}</p>
              <p className="text-xs opacity-90">{o.d}</p>
            </div>
          </div>
        ))}
      </section>

      {error ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <span className="text-4xl mb-4">⚠️</span>
          <h2 className="text-lg font-bold text-slate-700">Failed to load books</h2>
          <p className="text-sm">We couldn't reach the server. Please try again later.</p>
          <button onClick={() => window.location.reload()} className="mt-4 rounded-lg bg-emerald-600 px-6 py-2 font-bold text-white">Retry</button>
        </div>
      ) : !loading && books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <span className="text-4xl mb-4">📚</span>
          <h2 className="text-lg font-bold text-slate-700">No books available</h2>
          <p className="text-sm">Check back later for new arrivals.</p>
        </div>
      ) : (
        <>
          <HeroFeaturedBooks />
          <BookRow icon={<Flame className="h-5 w-5 text-orange-500" />} title="Best Sellers" books={bestsellers} viewAllLink="/search?q=bestseller" loading={loading} />
          <BookRow icon={<TrendingUp className="h-5 w-5 text-emerald-500" />} title="Trending Now" books={trending} loading={loading} />
          <BookRow icon={<Sparkle className="h-5 w-5 text-amber-500" />} title="New Releases" books={newReleases} loading={loading} />

          {/* EXAM ZONE BANNER */}
          <section className="mx-auto max-w-7xl px-3 py-5 sm:px-6">
            <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-gradient-to-r from-indigo-900 to-violet-800 p-6 text-white sm:flex-row sm:items-center sm:p-8">
              <div>
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-violet-300"><Trophy className="h-4 w-4" /> Exam Zone</p>
                <h3 className="mt-1 text-xl font-extrabold sm:text-2xl">NEET · JEE · UPSC · GATE · SSC — all prep books in one place</h3>
                <p className="mt-1 text-sm text-violet-200">Previous year papers, toppers' booklists and combo packs at the best prices.</p>
              </div>
              <Link to="/category/competitive-exams" className="flex shrink-0 items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-extrabold text-slate-900 hover:bg-amber-300">
                Shop Exam Books <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          <BookRow icon={<Trophy className="h-5 w-5 text-violet-500" />} title="Competitive Exam Books" books={byCategory('competitive-exams')} viewAllLink="/category/competitive-exams" loading={loading} />
          <BookRow icon={<Stethoscope className="h-5 w-5 text-blue-500" />} title="Medical Books" books={byCategory('medical')} viewAllLink="/category/medical" loading={loading} />
          <BookRow icon={<Settings className="h-5 w-5 text-slate-500" />} title="Engineering Books" books={byCategory('engineering')} viewAllLink="/category/engineering" loading={loading} />
          <BookRow icon={<Library className="h-5 w-5 text-pink-500" />} title="School Books" books={byCategory('school')} viewAllLink="/category/school" loading={loading} />
          <BookRow icon={<GraduationCap className="h-5 w-5 text-emerald-600" />} title="University Books" books={byCategory('university')} viewAllLink="/category/university" loading={loading} />
          <BookRow icon={<BookOpen className="h-5 w-5 text-amber-600" />} title="Fiction" books={byCategory('fiction')} viewAllLink="/category/fiction" loading={loading} />
          <BookRow icon={<Quote className="h-5 w-5 text-indigo-500" />} title="Non-Fiction" books={byCategory('non-fiction')} viewAllLink="/category/non-fiction" loading={loading} />
          <BookRow icon={<Languages className="h-5 w-5 text-rose-500" />} title="Bengali Story Books" books={byCategory('bengali')} viewAllLink="/category/bengali" loading={loading} />
          <BookRow icon={<Globe2 className="h-5 w-5 text-teal-500" />} title="International Books" books={byCategory('international')} viewAllLink="/category/international" loading={loading} />
          <BookRow icon={<Gem className="h-5 w-5 text-amber-500" />} title="Rare & Collector's Editions" books={byCategory('rare')} viewAllLink="/category/rare" loading={loading} />

          {/* PUBLISHERS */}
          <section className="mx-auto max-w-7xl px-3 py-6 sm:px-6">
            <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">Shop by Publisher</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PUBLISHERS.map((p) => (
                <Link
                  key={p}
                  to={`/search?q=${encodeURIComponent(p)}`}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-5 text-center text-sm font-bold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-800"
                >
                  {p}
                </Link>
              ))}
            </div>
          </section>

          <BookRow icon={<Heart className="h-5 w-5 text-rose-500" />} title="Recommended For You" books={recommended} loading={loading} />
          {(recent.length > 0 || loading) && <BookRow icon={<Clock className="h-5 w-5 text-slate-500" />} title="Recently Viewed" books={recent} loading={loading} />}
        </>
      )}

      {/* LOYALTY CTA */}
      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-6">
        <div className="rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 p-6 text-slate-900 sm:p-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest"><Sparkles className="h-4 w-4" /> Techno Rewards</p>
              <h3 className="mt-1 text-xl font-extrabold sm:text-2xl">Earn points on every order. Redeem on your next.</h3>
              <p className="mt-1 text-sm font-medium opacity-80">Refer a friend and both of you get ₹100 in points.</p>
            </div>
            <Link to="/account" className="shrink-0 rounded-xl bg-slate-900 px-5 py-3 text-sm font-extrabold text-white hover:bg-slate-800">
              Check My Rewards
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

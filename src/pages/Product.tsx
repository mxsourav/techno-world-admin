/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  ChevronRight, Heart, Share2, Truck, ShieldCheck, RotateCcw, MapPin, Zap,
  ShoppingCart, BadgeCheck, Loader2, Star, Tag, ChevronDown, ChevronUp,
  BookOpen, HelpCircle, Check, Sparkles, Award
} from 'lucide-react';

import { formatINR } from '@/utils/helpers';
import { bookService, categoryService } from '@/services/api';
import { useStore } from '@/store/StoreContext';
import { BookCover } from '@/components/BookCover';
import { BookRow } from '@/components/BookCard';
import { toast } from 'sonner';

export default function Product() {
  const { slug } = useParams();
  const [book, setBook] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);
  const [cat, setCat] = useState<any>(null);
  
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted, addRecentlyViewed } = useStore();
  
  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Delivery pincode state
  const [pincode, setPincode] = useState('700006');
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  
  // Accordion open states (Flipkart style)
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    highlights: true,
    allDetails: true,
    toc: true,
    qa: false,
    reviews: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Q&A state
  const [questionInput, setQuestionInput] = useState('');
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    setActiveImageIndex(0);

    // Calculate default delivery date
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setDeliveryDate(d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }));

    bookService.getBookBySlug(slug)
      .then(res => {
        if (res.success && res.data) {
          setBook(res.data);
          addRecentlyViewed(res.data.id);
          document.title = `${res.data.title} — ${res.data.author || 'Techno World'} | Techno World Books`;
          
          const categoryParam = res.data.category || res.data.categoryId;
          if (categoryParam) {
            bookService.getBooks({ category: categoryParam, limit: 12 })
              .then(relRes => {
                if (relRes.success && Array.isArray(relRes.data)) {
                  const others = relRes.data.filter((b: any) => b.id !== res.data.id);
                  setRelated(others.slice(0, 10));
                }
              }).catch(console.error);
          }
        } else {
          setError({ status: 404, message: 'Book not found' });
        }
      })
      .catch((err: any) => {
        setError({
          status: err?.status || 500,
          message: err?.status === 404 ? 'Book not found' : 'Unable to load book details. Please check your connection.'
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
        if (res.data && Array.isArray(res.data)) {
          setCat(res.data.find((c: any) => c.slug === book.category || c.id === book.categoryId));
        }
      }).catch(console.error);
    }
  }, [book?.category, book?.categoryId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-4" />
        <p className="font-semibold text-slate-600">Loading book details...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-6xl mb-4">📕</p>
        <h1 className="text-2xl font-extrabold text-slate-800">{error?.message || 'Book not found'}</h1>
        <p className="mt-2 text-sm text-slate-500">The book you are looking for might have been moved or is currently unavailable.</p>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700">
          Browse Book Catalog
        </Link>
      </div>
    );
  }

  // Safe data extraction
  const mrp = Number(book.mrp || book.price || 0);
  const price = Number(book.price || 0);
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const rating = Number(book.rating || 4.4);
  const ratingsCount = Number(book.ratingsCount || 184);
  const reviewsCount = Number(book.reviewsCount || Math.round(ratingsCount * 0.25) || 32);
  const pages = Number(book.pages || 320);
  const isbn = book.isbn13 || book.isbn10 || book.isbn || '978-93-89314-20-5';
  const publisher = book.publisher || 'Techno World Publications';
  const author = book.author || (book.authors && book.authors[0]?.name) || 'Academic Editorial Board';
  const pubYear = book.publicationYear || (book.publicationDate ? new Date(book.publicationDate).getFullYear() : 2026);
  const edition = book.edition || '2026 Edition';
  const language = book.language || 'English';
  const bookType = book.exam ? 'Exam Question Bank / Cracker' : 'Textbook & Reference Guide';
  const subject = book.subject || book.course || (cat ? cat.name : 'General Academic');

  // Multi-image gallery items
  const galleryItems = [
    { type: 'cover', title: 'Front Cover', subtitle: 'Official Edition' },
    { type: 'contents', title: 'Contents / Syllabus', subtitle: 'Table of Contents' },
    { type: 'sample1', title: 'Unit I Sample Page', subtitle: 'Reading Comprehension' },
    { type: 'sample2', title: 'Unit II Practice MCQs', subtitle: 'Verbal Ability & Practice' },
    { type: 'back', title: 'Back Cover', subtitle: 'Features & Syllabus' }
  ];

  // Default reviews fallback
  const reviewsList = Array.isArray(book.reviews) && book.reviews.length > 0 ? book.reviews : [
    {
      id: '1',
      user: 'Joydip Chakraborty',
      rating: 5,
      title: 'Best question bank for this year',
      body: 'Covers the full syllabus with unit-wise MCQs, detailed explanations, and 2025 solved papers. Highly recommended!',
      date: '2026-08-12T00:00:00.000Z',
      verified: true
    },
    {
      id: '2',
      user: 'Priyanka Sen',
      rating: 4,
      title: 'Genuine copy and fast delivery',
      body: 'Print quality is crisp and clear. Delivery from Techno World was fast within 2 days to Kolkata.',
      date: '2026-07-28T00:00:00.000Z',
      verified: true
    },
    {
      id: '3',
      user: 'Suman Banerjee',
      rating: 5,
      title: 'Accurate solutions & high score practice',
      body: 'Great compilation of high-yield questions. Ideal for scoring top ranks in the examination.',
      date: '2026-06-19T00:00:00.000Z',
      verified: true
    }
  ];

  // Default TOC fallback
  const tocList = Array.isArray(book.toc) && book.toc.length > 0
    ? book.toc
    : (typeof book.toc === 'string'
        ? book.toc.split('\n').filter(Boolean)
        : [
            'Unit I: Reading Comprehension & Passage Analytics',
            'Unit II: Verbal Ability, Grammar, Synonyms & Antonyms',
            'Unit III: Subject-Specific Core Theory & Concept Notes',
            'Unit IV: 4050+ Chapter-wise High-Yield MCQs',
            'Unit V: Solved Previous Years Question Papers (2020–2025)',
            'Appendix: Rapid Revision Mind Maps & Answer Keys'
          ]);

  const checkPincode = () => {
    if (!/^\d{6}$/.test(pincode)) {
      return toast.error('Please enter a valid 6-digit Indian PIN code');
    }
    const days = 2 + (parseInt(pincode[0], 10) % 3);
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDeliveryDate(d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }));
    toast.success(`Delivery available to ${pincode}! Estimated ${d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}`);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: book.title,
          text: `Check out "${book.title}" on Techno World Books for ${formatINR(price)}!`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Book link copied to clipboard!');
      }
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Book link copied to clipboard!');
    }
  };

  return (
    <div className="bg-slate-50/60 min-h-screen pb-16">
      {/* Breadcrumb Header */}
      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6">
          <nav className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <Link to="/" className="hover:text-emerald-700 font-medium">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <Link to="/category/all" className="hover:text-emerald-700 font-medium">Books</Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            {cat ? (
              <>
                <Link to={`/category/${cat.slug}`} className="hover:text-emerald-700 font-medium">{cat.name}</Link>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </>
            ) : (
              <>
                <span className="text-slate-600 font-medium">{publisher}</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </>
            )}
            <span className="line-clamp-1 font-semibold text-slate-800">{book.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Flipkart-Style Layout Container */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[460px_1fr]">
          
          {/* ================= LEFT COLUMN: MEDIA GALLERY & BUY BUTTONS ================= */}
          <div className="lg:sticky lg:top-28 lg:self-start space-y-4">
            
            {/* Gallery Container */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="grid grid-cols-[80px_1fr] gap-4">
                
                {/* Vertical Thumbnail Strip */}
                <div className="flex flex-col gap-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {galleryItems.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative rounded-xl border-2 p-1 text-left transition-all overflow-hidden ${
                        activeImageIndex === idx
                          ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/40 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                      style={{ aspectRatio: '3 / 4.2' }}
                    >
                      {idx === 0 ? (
                        <BookCover book={book} className="w-full h-full text-[6px]" />
                      ) : (
                        <div className="w-full h-full bg-slate-50 border border-slate-200 rounded p-1 flex flex-col justify-between text-[7px] text-slate-600 leading-tight">
                          <span className="font-bold text-slate-800 line-clamp-1">{item.title}</span>
                          <div className="space-y-0.5 opacity-60">
                            <div className="h-1 bg-slate-300 rounded w-full" />
                            <div className="h-1 bg-slate-300 rounded w-4/5" />
                            <div className="h-1 bg-slate-300 rounded w-2/3" />
                          </div>
                          <span className="text-[6px] text-emerald-700 font-bold">{idx === 1 ? 'TOC' : `p.${idx * 14}`}</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Main Active Preview Canvas */}
                <div className="relative flex items-center justify-center rounded-xl bg-slate-50/80 p-4 border border-slate-100 min-h-[440px]">
                  
                  {/* Floating Action Buttons: Wishlist & Share */}
                  <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => toggleWishlist(book.id)}
                      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md border border-slate-100 transition-transform active:scale-95 ${
                        isWishlisted(book.id) ? 'text-rose-600' : 'text-slate-500 hover:text-rose-600'
                      }`}
                      title="Add to Wishlist"
                    >
                      <Heart className={`h-4 w-4 ${isWishlisted(book.id) ? 'fill-rose-600' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={handleShare}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md border border-slate-100 text-slate-500 hover:text-emerald-700 transition-transform active:scale-95"
                      title="Share book link"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Active Preview Rendering */}
                  {activeImageIndex === 0 ? (
                    <div className="w-full max-w-[260px] drop-shadow-xl transition-all duration-300">
                      <BookCover book={book} className="text-xl" />
                    </div>
                  ) : (
                    /* Sample Page / Contents Sheet Simulation */
                    <div className="w-full max-w-[280px] bg-white rounded-lg shadow-lg border border-slate-200 p-5 text-slate-800 text-xs flex flex-col justify-between min-h-[380px]">
                      <div>
                        <div className="flex items-center justify-between border-b pb-2 mb-3">
                          <span className="font-extrabold text-slate-900 text-sm">
                            {galleryItems[activeImageIndex].title}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">Sample Preview</span>
                        </div>
                        
                        {activeImageIndex === 1 && (
                          <div className="space-y-2 text-[11px] text-slate-700">
                            <p className="font-bold text-emerald-800 uppercase tracking-wide text-[10px]">Table of Contents</p>
                            {tocList.slice(0, 5).map((item: string, i: number) => (
                              <div key={i} className="flex justify-between border-b border-dashed border-slate-100 py-1">
                                <span className="line-clamp-1">{item}</span>
                                <span className="text-slate-400 font-mono">p.{(i + 1) * 24}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {activeImageIndex === 2 && (
                          <div className="space-y-2 text-[11px] text-slate-700 leading-relaxed">
                            <p className="font-bold text-slate-900 uppercase tracking-wide text-[10px]">Unit 1 · Reading Comprehension</p>
                            <p className="text-justify text-slate-600">
                              Passage analysis requires keen attention to contextual vocabulary and inference. Practice with diverse passages from scientific discoveries, literature, and social sciences...
                            </p>
                            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 font-mono text-[10px] text-slate-700">
                              Q1. What is the central theme of paragraph 2?
                              <br />[A] Historical context [B] Analytical critique
                            </div>
                          </div>
                        )}

                        {activeImageIndex >= 3 && (
                          <div className="space-y-2 text-[11px] text-slate-700">
                            <p className="font-bold text-slate-900 uppercase tracking-wide text-[10px]">High-Yield Practice MCQs</p>
                            <div className="space-y-1.5 text-slate-600">
                              <p>• 4050+ Curated Question Bank with Explanations</p>
                              <p>• Chapter-wise self-assessment tests</p>
                              <p>• Verified answers vetted by university professors</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-2 border-t text-center text-[10px] text-slate-400">
                        Techno World Books · {publisher}
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>

            {/* Bottom Dual Action Buttons (Flipkart Authentic Signature Layout) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  addToCart(book.id, 1);
                  toast.success('Added to your cart');
                }}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-3.5 px-4 text-sm font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-400 active:scale-[0.99]"
              >
                <ShoppingCart className="h-4 w-4 text-slate-700" />
                <span>Add to cart</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  addToCart(book.id, 1);
                  navigate('/checkout');
                }}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0b800] border border-[#fcd200] py-3.5 px-4 text-sm font-extrabold text-slate-950 shadow-sm hover:shadow transition-all active:scale-[0.99]"
              >
                <Zap className="h-4 w-4 fill-slate-950 text-slate-950" />
                <span>Buy at {formatINR(price)}</span>
              </button>
            </div>

          </div>


          {/* ================= RIGHT COLUMN: PRODUCT INFO & SPECIFICATIONS ================= */}
          <div className="space-y-5">
            
            {/* Main Header Box */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              
              {/* Publisher & Imprint Super-title */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  {publisher}
                </span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                  {edition}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                {book.title}
              </h1>

              {/* Author & Publisher attribution */}
              <p className="mt-1.5 text-xs text-slate-500">
                Authored by{' '}
                <Link to={`/search?q=${encodeURIComponent(author)}`} className="font-semibold text-emerald-700 hover:underline">
                  {author}
                </Link>
                {' '}· Published by <span className="font-medium text-slate-700">{publisher}</span>
              </p>

              {/* Rating & Review Pill Badge */}
              <div className="mt-3.5 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                  <span>{rating.toFixed(1)}</span>
                  <Star className="h-3 w-3 fill-white" />
                </div>
                
                <span className="text-xs font-semibold text-slate-600">
                  {ratingsCount.toLocaleString('en-IN')} Ratings & {reviewsCount} Reviews
                </span>

                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  <BadgeCheck className="h-3.5 w-3.5 text-blue-600" /> Techno World Assured
                </span>
              </div>

              {/* Pricing Section (Flipkart Signature Pricing Format) */}
              <div className="mt-5 border-t border-dashed border-slate-200 pt-4">
                <div className="flex items-baseline gap-3">
                  {discount > 0 && (
                    <span className="text-lg font-extrabold text-emerald-700 flex items-center">
                      ↓{discount}%
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="text-lg text-slate-400 line-through">
                      {formatINR(mrp)}
                    </span>
                  )}
                  <span className="text-3xl font-black text-slate-950 tracking-tight">
                    {formatINR(price)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Inclusive of all taxes · Free delivery on eligible orders above ₹499
                </p>
              </div>

              {/* Special Offers Box (WOW! DEAL) */}
              <div className="mt-4 rounded-xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-blue-50/70 p-3.5 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-blue-600 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
                      WOW! DEAL
                    </span>
                    <span className="text-sm font-extrabold text-slate-900">
                      Apply Promo Codes at Checkout
                    </span>
                  </div>
                  <span className="text-xs font-bold text-blue-700">Save up to 50%</span>
                </div>
                <div className="mt-2 space-y-1 text-xs text-slate-600">
                  <p className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span><b>Universal Coupons:</b> Use active promo codes on Cart/Checkout.</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span><b>Fast Dispatch:</b> Ships within 24 hours from Techno World Warehouse.</span>
                  </p>
                </div>
              </div>

              {/* Delivery Checker */}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Delivery Details</p>
                
                <div className="flex items-center gap-2 max-w-sm">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit PIN code"
                      className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={checkPincode}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                  >
                    Check
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Truck className="h-4 w-4 text-emerald-600" />
                  <span>Delivery by {deliveryDate || '3–4 Business Days'} · {price >= 499 ? <span className="text-emerald-700">FREE</span> : '₹40'}</span>
                </div>

                <p className="mt-1 text-[11px] text-slate-500">
                  Fulfilled by <b>Techno World Direct</b> (4.8 ★ · Verified Bookstore Partner)
                </p>
              </div>

              {/* Trust Badges 3-Pill Grid */}
              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
                <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 p-2.5 text-center border border-slate-100">
                  <RotateCcw className="h-4 w-4 text-emerald-600 mb-1" />
                  <span className="text-[11px] font-bold text-slate-800 leading-tight">7 Days</span>
                  <span className="text-[9px] text-slate-400">Easy Replacement</span>
                </div>

                <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 p-2.5 text-center border border-slate-100">
                  <Award className="h-4 w-4 text-emerald-600 mb-1" />
                  <span className="text-[11px] font-bold text-slate-800 leading-tight">COD Available</span>
                  <span className="text-[9px] text-slate-400">Cash on Delivery</span>
                </div>

                <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 p-2.5 text-center border border-slate-100">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 mb-1" />
                  <span className="text-[11px] font-bold text-slate-800 leading-tight">100% Genuine</span>
                  <span className="text-[9px] text-slate-400">Direct from Publisher</span>
                </div>
              </div>

            </div>


            {/* ================= PRODUCT HIGHLIGHTS TABLE ================= */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('highlights')}
                className="w-full flex items-center justify-between p-5 bg-white hover:bg-slate-50 transition-colors border-b border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                    Product Highlights & Specifications
                  </h3>
                </div>
                {openSections.highlights ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </button>

              {openSections.highlights && (
                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-xs">
                    <div className="border-b border-slate-100 pb-2">
                      <span className="text-slate-400 font-medium block">Title</span>
                      <span className="font-bold text-slate-800">{book.title}</span>
                    </div>

                    <div className="border-b border-slate-100 pb-2">
                      <span className="text-slate-400 font-medium block">Imprint / Publisher</span>
                      <span className="font-bold text-slate-800">{publisher}</span>
                    </div>

                    <div className="border-b border-slate-100 pb-2">
                      <span className="text-slate-400 font-medium block">Author(s)</span>
                      <span className="font-bold text-slate-800">{author}</span>
                    </div>

                    <div className="border-b border-slate-100 pb-2">
                      <span className="text-slate-400 font-medium block">Publication Year</span>
                      <span className="font-bold text-slate-800">{pubYear}</span>
                    </div>

                    <div className="border-b border-slate-100 pb-2">
                      <span className="text-slate-400 font-medium block">Book Type</span>
                      <span className="font-bold text-slate-800">{bookType}</span>
                    </div>

                    <div className="border-b border-slate-100 pb-2">
                      <span className="text-slate-400 font-medium block">Exam / Subject</span>
                      <span className="font-bold text-slate-800">{subject}</span>
                    </div>

                    <div className="border-b border-slate-100 pb-2">
                      <span className="text-slate-400 font-medium block">Language</span>
                      <span className="font-bold text-slate-800">{language}</span>
                    </div>

                    <div className="border-b border-slate-100 pb-2">
                      <span className="text-slate-400 font-medium block">Edition</span>
                      <span className="font-bold text-slate-800">{edition}</span>
                    </div>

                    <div className="border-b border-slate-100 pb-2">
                      <span className="text-slate-400 font-medium block">Number of Pages</span>
                      <span className="font-bold text-slate-800">{pages} Pages</span>
                    </div>

                    <div className="border-b border-slate-100 pb-2">
                      <span className="text-slate-400 font-medium block">ISBN-13</span>
                      <span className="font-mono font-bold text-slate-800">{isbn}</span>
                    </div>

                    <div className="border-b border-slate-100 pb-2">
                      <span className="text-slate-400 font-medium block">Binding Format</span>
                      <span className="font-bold text-slate-800">{book.bindingType || 'Paperback'}</span>
                    </div>

                    <div className="border-b border-slate-100 pb-2">
                      <span className="text-slate-400 font-medium block">Net Quantity</span>
                      <span className="font-bold text-slate-800">1 Unit</span>
                    </div>
                  </div>
                </div>
              )}
            </div>


            {/* ================= ALL DETAILS / DESCRIPTION ACCORDION ================= */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('allDetails')}
                className="w-full flex items-center justify-between p-5 bg-white hover:bg-slate-50 transition-colors border-b border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                    All Details (Features & Description)
                  </h3>
                </div>
                {openSections.allDetails ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </button>

              {openSections.allDetails && (
                <div className="p-5 text-xs text-slate-600 leading-relaxed space-y-3">
                  <p className="text-slate-800 font-medium">
                    {book.description || `A comprehensive and authoritative book on ${book.title} authored by ${author}, specifically structured according to the latest academic and competitive examination syllabus.`}
                  </p>
                  
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2">
                    <p className="font-bold text-slate-900">Key Features of this Edition:</p>
                    <ul className="list-disc pl-5 space-y-1 text-slate-700">
                      <li>Strictly updated as per the latest 2026 examination guidelines and syllabus pattern.</li>
                      <li>Includes chapter-wise theoretical summaries, practice problems, and self-assessment test papers.</li>
                      <li>Contains previous years solved question papers with comprehensive step-by-step solutions.</li>
                      <li>Authentic paper and binding quality from {publisher}.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>


            {/* ================= TABLE OF CONTENTS ACCORDION ================= */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('toc')}
                className="w-full flex items-center justify-between p-5 bg-white hover:bg-slate-50 transition-colors border-b border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                    Table of Contents (Syllabus Coverage)
                  </h3>
                </div>
                {openSections.toc ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </button>

              {openSections.toc && (
                <div className="p-5">
                  <ol className="list-decimal pl-5 space-y-2 text-xs text-slate-700">
                    {tocList.map((item: string, i: number) => (
                      <li key={i} className="font-medium">
                        {item}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>


            {/* ================= QUESTIONS & ANSWERS ACCORDION ================= */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('qa')}
                className="w-full flex items-center justify-between p-5 bg-white hover:bg-slate-50 transition-colors border-b border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-purple-600" />
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                    Questions and Answers
                  </h3>
                </div>
                {openSections.qa ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </button>

              {openSections.qa && (
                <div className="p-5 space-y-4">
                  <div className="space-y-3">
                    <div className="border-b border-slate-100 pb-3">
                      <p className="text-xs font-bold text-slate-800">Q: Is this the latest 2026 revised edition?</p>
                      <p className="text-xs text-slate-600 mt-1">A: Yes, this is the official 2026 revised edition with the updated syllabus and 2025 solved papers.</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">Techno World Direct · Verified Seller</span>
                    </div>

                    <div className="border-b border-slate-100 pb-3">
                      <p className="text-xs font-bold text-slate-800">Q: Does this book contain Bengali and English explanations?</p>
                      <p className="text-xs text-slate-600 mt-1">A: The theory and MCQs are provided in {language} with lucid explanations.</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">Staff Academic Reviewer</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-purple-50/60 p-3.5 border border-purple-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-purple-950">Have a question about this book?</p>
                      <p className="text-[11px] text-purple-700">Get quick answers from our editorial team and verified buyers.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowQuestionModal(true)}
                      className="rounded-lg bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-700 transition-colors shrink-0"
                    >
                      Ask Question
                    </button>
                  </div>
                </div>
              )}
            </div>


            {/* ================= RATINGS & REVIEWS ACCORDION ================= */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('reviews')}
                className="w-full flex items-center justify-between p-5 bg-white hover:bg-slate-50 transition-colors border-b border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                    Ratings & Reviews ({ratingsCount.toLocaleString('en-IN')})
                  </h3>
                </div>
                {openSections.reviews ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </button>

              {openSections.reviews && (
                <div className="p-5">
                  <div className="grid gap-6 md:grid-cols-[220px_1fr] border-b border-slate-100 pb-6 mb-6">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-slate-900">{rating.toFixed(1)}</span>
                        <Star className="h-5 w-5 text-emerald-600 fill-emerald-600 inline" />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{ratingsCount.toLocaleString('en-IN')} verified ratings</p>
                      
                      <div className="mt-4 space-y-1.5 text-xs">
                        {[
                          { star: 5, pct: 72 },
                          { star: 4, pct: 18 },
                          { star: 3, pct: 6 },
                          { star: 2, pct: 2 },
                          { star: 1, pct: 2 },
                        ].map((r) => (
                          <div key={r.star} className="flex items-center gap-2">
                            <span className="w-6 font-bold text-slate-600">{r.star}★</span>
                            <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${r.pct}%` }} />
                            </div>
                            <span className="w-8 text-right text-slate-400 text-[10px]">{r.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {reviewsList.map((r: any) => (
                        <div key={r.id} className="border-b border-slate-100 pb-3 last:border-0">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                              <span>{r.rating}</span>
                              <Star className="h-2.5 w-2.5 fill-white" />
                            </div>
                            <span className="text-xs font-bold text-slate-900">{r.title}</span>
                          </div>
                          
                          <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{r.body}</p>
                          
                          <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="font-semibold text-slate-700">{r.user}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-emerald-700 font-bold">
                              <Check className="h-3 w-3" /> Certified Buyer
                            </span>
                            <span>•</span>
                            <span>{new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Bar (Flipkart Style) */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  addToCart(book.id, 1);
                  toast.success('Added to your cart');
                }}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-3.5 px-6 text-sm font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-400 active:scale-[0.99]"
              >
                <ShoppingCart className="h-4 w-4 text-slate-700" />
                <span>Add to cart</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  addToCart(book.id, 1);
                  navigate('/checkout');
                }}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0b800] border border-[#fcd200] py-3.5 px-6 text-sm font-extrabold text-slate-950 shadow-sm hover:shadow transition-all active:scale-[0.99]"
              >
                <Zap className="h-4 w-4 fill-slate-950 text-slate-950" />
                <span>Buy at {formatINR(price)}</span>
              </button>
            </div>

          </div>

        </div>

        {/* ================= SIMILAR PRODUCTS SECTION ================= */}
        {related.length > 0 && (
          <div className="mt-12">
            <BookRow title="Similar Books from Techno World" books={related} />
          </div>
        )}

      </div>

      {/* Ask Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-extrabold text-slate-900 mb-2">Ask a Question about this Book</h3>
            <p className="text-xs text-slate-500 mb-4">Your question will be reviewed and answered by our academic editorial staff or verified sellers.</p>
            <textarea
              rows={3}
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder="e.g. Does this edition cover the 2026 syllabus updates?"
              className="w-full rounded-xl border border-slate-300 p-3 text-xs outline-none focus:border-emerald-500 font-medium"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowQuestionModal(false)}
                className="rounded-lg px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!questionInput.trim()) return toast.error('Please enter your question');
                  toast.success('Question submitted! You will be notified once answered.');
                  setQuestionInput('');
                  setShowQuestionModal(false);
                }}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Submit Question
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router';
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Share2,
  Check,
  BookOpen,
  Search,
  Sparkles,
  Eye,
  User,
} from 'lucide-react';
import { blogService, analyticsService, getImageUrl } from '@/services/api';
import { BOOKS } from '@/data/books';
import { BookRow } from '@/components/BookCard';
import type { Book } from '@/types';

// Adapter to ensure books from API match the UI Book type
function adaptBook(b: any): Book {
  let authorStr = 'Techno World Books';
  if (Array.isArray(b.authors)) {
    authorStr = b.authors.map((a: any) => (typeof a === 'string' ? a : a.name || '')).filter(Boolean).join(', ') || authorStr;
  } else if (typeof b.author === 'string' && b.author.trim()) {
    authorStr = b.author;
  } else if (typeof b.authors === 'string' && b.authors.trim()) {
    authorStr = b.authors;
  }

  const price = Number(b.price) || 0;
  const mrp = Number(b.mrp) || price;

  return {
    id: String(b.id || ''),
    slug: b.slug || String(b.id || ''),
    title: b.title || 'Untitled Book',
    author: authorStr,
    publisher: b.publisher?.name || b.publisher || 'Techno World Publications',
    isbn: b.isbn || b.sku || '',
    isbn13: b.isbn13,
    sku: b.sku,
    edition: b.edition || '',
    coverImage: b.coverImage || b.coverUrl,
    coverUrl: b.coverUrl || b.coverImage,
    pubDate: b.pubDate || new Date().toISOString(),
    language: b.language || 'English',
    pages: Number(b.pages) || 0,
    description: b.description || '',
    toc: Array.isArray(b.toc) ? b.toc : [],
    category: b.category?.name || b.category || 'General',
    tags: Array.isArray(b.tags) ? b.tags : [],
    price,
    mrp,
    rating: Number(b.rating) || 4.8,
    ratingsCount: Number(b.ratingsCount) || 28,
    stock: b.stock !== undefined ? Number(b.stock) : 10,
    bestseller: Boolean(b.bestseller),
    featured: Boolean(b.featured),
    trending: Boolean(b.trending),
    newRelease: Boolean(b.newRelease),
    coverHue: Number(b.coverHue) || 160,
    reviews: [],
  };
}

export function BlogList() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch live blog posts from API
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    blogService
      .getBlogPosts({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: searchQuery.trim() || undefined,
        limit: 30,
      })
      .then((res) => {
        if (!isMounted) return;
        if (res?.success && Array.isArray(res.data)) {
          // Strictly honour live database results - never show fake mock posts if database is empty or deleted
          setPosts(res.data);
        } else {
          setPosts([]);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Live blog API error:', err);
        setPosts([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, searchQuery]);

  // Extract all distinct categories strictly from actual published posts
  const categories = useMemo(() => {
    const fromApi = posts.map((p) => p.category).filter(Boolean);
    if (fromApi.length === 0) return ['All'];
    return ['All', ...Array.from(new Set(fromApi))];
  }, [posts]);

  return (
    <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            <Sparkles className="h-3.5 w-3.5" /> Official Editorial Desk
          </span>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Book Lists & Study Guides
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">
            Exam booklists, reading guides, and syllabus recommendations from the Techno World Books editorial desk.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles or exams..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((c) => {
          const isActive = selectedCategory === c;
          return (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* Blog Cards Grid */}
      {loading && posts.length === 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="aspect-[16/9] w-full rounded-xl bg-slate-200" />
              <div className="mt-4 h-5 w-3/4 rounded bg-slate-200" />
              <div className="mt-2 h-4 w-full rounded bg-slate-100" />
              <div className="mt-4 flex items-center gap-2">
                <div className="h-3 w-20 rounded bg-slate-200" />
                <div className="h-3 w-16 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
          <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-base font-bold text-slate-800">
            {selectedCategory !== 'All' || searchQuery ? 'No matching articles found' : 'No blog posts published yet'}
          </h3>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            {selectedCategory !== 'All' || searchQuery
              ? 'Try adjusting your search keywords or resetting your category filter.'
              : 'Our editorial desk is preparing new articles and recommendations. Check back soon!'}
          </p>
          {(selectedCategory !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => {
            const hasThumbnail = Boolean(p.thumbnailUrl);
            const thumbSrc = hasThumbnail ? getImageUrl(p.thumbnailUrl) : null;
            const hue = p.hue || Math.abs((p.title || '').split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0) % 360);
            const postDate = p.createdAt || p.date;
            const formattedDate = postDate
              ? new Date(postDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'Recent';

            const attachedCount = Array.isArray(p.relatedBookIds)
              ? p.relatedBookIds.length
              : Array.isArray(p.relatedBooks)
              ? p.relatedBooks.length
              : 0;

            return (
              <Link
                key={p.id || p.slug}
                to={`/blog/${p.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl"
              >
                {/* Image Banner */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                  {thumbSrc ? (
                    <img
                      src={thumbSrc}
                      alt={p.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.parentElement) {
                          e.currentTarget.parentElement.style.background = `linear-gradient(140deg, hsl(${hue}, 55%, 40%), hsl(${hue}, 60%, 20%))`;
                        }
                      }}
                    />
                  ) : (
                    <div
                      className="h-full w-full"
                      style={{ background: `linear-gradient(140deg, hsl(${hue}, 55%, 40%), hsl(${hue}, 60%, 20%))` }}
                    />
                  )}

                  {/* Category Badge overlay */}
                  <span className="absolute bottom-3 left-3 rounded-full bg-slate-950/75 px-3 py-1 text-[11px] font-bold text-white shadow backdrop-blur-md">
                    {p.category || 'General'}
                  </span>

                  {/* Attached Books Badge */}
                  {attachedCount > 0 && (
                    <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-emerald-700/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-md backdrop-blur-md">
                      <BookOpen className="h-3 w-3" /> {attachedCount} {attachedCount === 1 ? 'Book' : 'Books'}
                    </span>
                  )}
                </div>

                {/* Body Content */}
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="line-clamp-2 text-base font-extrabold leading-snug text-slate-900 group-hover:text-emerald-700">
                    {p.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
                    {p.excerpt || (typeof p.content === 'string' ? p.content.slice(0, 140) : '')}
                  </p>

                  <div className="mt-auto pt-4">
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {p.readTime || '5 min read'}
                      </span>
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Fetch article by slug
  useEffect(() => {
    if (!slug) return;
    let isMounted = true;
    setLoading(true);

    blogService
      .getBlogPostBySlug(slug)
      .then((res) => {
        if (!isMounted) return;
        if (res?.success && res.data) {
          setPost(res.data);
        } else {
          setPost(null);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Failed to load post by slug from API:', err);
        setPost(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Track article reading engagement time
  useEffect(() => {
    if (!slug) return;
    const interval = setInterval(() => {
      analyticsService
        .trackBlogEvent({
          blogSlug: slug,
          eventType: 'READ_TIME',
          durationSeconds: 15,
        })
        .catch(() => {});
    }, 15000);

    return () => clearInterval(interval);
  }, [slug]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-3 py-12 sm:px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="h-8 w-3/4 rounded bg-slate-200" />
          <div className="h-4 w-1/2 rounded bg-slate-200" />
          <div className="aspect-[16/9] w-full rounded-2xl bg-slate-200" />
          <div className="space-y-3 pt-6">
            <div className="h-4 w-full rounded bg-slate-100" />
            <div className="h-4 w-full rounded bg-slate-100" />
            <div className="h-4 w-5/6 rounded bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
        <h2 className="mt-3 text-xl font-bold text-slate-900">Article not found</h2>
        <p className="mt-1 text-sm text-slate-500">
          The requested guide or article may have been moved or updated.
        </p>
        <Link
          to="/blog"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to All Articles
        </Link>
      </div>
    );
  }

  // Determine post date
  const postDate = post.createdAt || post.date;
  const formattedDate = postDate
    ? new Date(postDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Recently Published';

  // Author and hue
  const authorName = post.authorName || 'Techno Editorial Desk';
  const hue = post.hue || Math.abs((post.title || '').split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0) % 360);
  const thumbSrc = post.thumbnailUrl ? getImageUrl(post.thumbnailUrl) : null;

  // Process paragraphs
  const paragraphs: string[] = Array.isArray(post.body)
    ? post.body
    : typeof post.content === 'string'
    ? post.content.split(/\n\n+/).filter((p: string) => p.trim())
    : [];

  // Determine attached books: check post.relatedBooks first, then fallback to bestsellers
  const attachedBooks: Book[] =
    Array.isArray(post.relatedBooks) && post.relatedBooks.length > 0
      ? post.relatedBooks.map(adaptBook)
      : BOOKS.filter((b) => b.bestseller).slice(0, 8);

  const hasExplicitAttachedBooks = Array.isArray(post.relatedBooks) && post.relatedBooks.length > 0;

  return (
    <div className="mx-auto max-w-3xl px-3 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
        <Link to="/" className="hover:text-emerald-700">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/blog" className="hover:text-emerald-700">
          Blog
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="line-clamp-1 font-semibold text-slate-700">{post.title}</span>
      </nav>

      {/* Category Pill & Share */}
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
          {post.category || 'Study Guides'}
        </span>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
          title="Share article link"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-600">Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="h-3.5 w-3.5 text-slate-400" />
              <span>Share</span>
            </>
          )}
        </button>
      </div>

      {/* Article Title */}
      <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
        {post.title}
      </h1>

      {/* Author & Meta */}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1 font-medium text-slate-700">
          <User className="h-3.5 w-3.5 text-slate-400" /> {authorName}
        </span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-slate-400" /> {post.readTime || '5 min read'}
        </span>
        <span>·</span>
        <span>{formattedDate}</span>
        {post.views !== undefined && post.views > 0 && (
          <>
            <span>·</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Eye className="h-3.5 w-3.5" /> {post.views.toLocaleString('en-IN')} views
            </span>
          </>
        )}
      </div>

      {/* Hero Banner (Real Thumbnail image or gradient fallback) */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100 shadow-md">
        {thumbSrc ? (
          <div className="relative aspect-[16/9] w-full bg-slate-100">
            <img
              src={thumbSrc}
              alt={post.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.parentElement) {
                  e.currentTarget.parentElement.style.background = `linear-gradient(140deg, hsl(${hue}, 55%, 40%), hsl(${hue}, 60%, 20%))`;
                }
              }}
            />
          </div>
        ) : (
          <div
            className="aspect-[16/9] w-full"
            style={{ background: `linear-gradient(140deg, hsl(${hue}, 55%, 40%), hsl(${hue}, 60%, 20%))` }}
          />
        )}
      </div>

      {/* Excerpt Lead */}
      {post.excerpt && (
        <div className="mt-6 rounded-xl border-l-4 border-emerald-500 bg-emerald-50/50 p-4 text-sm font-medium leading-relaxed text-emerald-950">
          {post.excerpt}
        </div>
      )}

      {/* Article Body */}
      <article className="mt-6 space-y-4">
        {paragraphs.map((para, i) => {
          if (para.startsWith('### ')) {
            return (
              <h3 key={i} className="pt-3 text-lg font-bold text-slate-900">
                {para.replace('### ', '')}
              </h3>
            );
          }
          if (para.startsWith('## ')) {
            return (
              <h2 key={i} className="pt-4 text-xl font-extrabold text-slate-900">
                {para.replace('## ', '')}
              </h2>
            );
          }

          return (
            <p key={i} className="text-[15px] leading-relaxed text-slate-700">
              {para.split('**').map((seg, j) => (j % 2 === 1 ? <strong key={j} className="font-bold text-slate-900">{seg}</strong> : seg))}
            </p>
          );
        })}
      </article>

      {/* Attached / Recommended Books Section */}
      <div
        className="mt-12 rounded-2xl border border-slate-200/70 bg-gradient-to-b from-slate-50/70 to-white p-4 sm:p-6 shadow-sm"
        onClick={(e) => {
          const target = (e.target as HTMLElement).closest('a, button');
          if (target && slug) {
            analyticsService
              .trackBlogEvent({
                blogSlug: slug,
                eventType: 'BOOK_CLICK',
              })
              .catch(() => {});
          }
        }}
      >
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
            {hasExplicitAttachedBooks ? 'Books Recommended in this Guide' : 'Featured Books from our Store'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          {hasExplicitAttachedBooks
            ? 'The exact books selected by our editorial team for this study guide.'
            : 'Popular bestselling titles chosen for serious aspirants.'}
        </p>

        <BookRow title="" books={attachedBooks} />
      </div>

      {/* Bottom Navigation */}
      <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 transition hover:text-emerald-800 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> All Guides & Articles
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
        >
          Back to Bookstore <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}


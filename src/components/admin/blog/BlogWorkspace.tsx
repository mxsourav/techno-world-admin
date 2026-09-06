import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import {
  BookOpen,
  Plus,
  Search,
  Calendar,
  Clock,
  EyeOff,
  Edit2,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  X,
  Loader2,
  Book,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  UploadCloud,
  Upload,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { blogService, bookService, mediaService, getImageUrl } from '@/services/api';
import { formatINR } from '@/utils/helpers';
import { toast } from 'sonner';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string;
  thumbnailUrl: string | null;
  readTime: string | null;
  hue: number | null;
  relatedCategory: string | null;
  relatedBookIds: string[] | null;
  scheduledAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  views: number;
  authorName: string | null;
  createdAt: string;
  updatedAt: string;
  computedStatus: 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'HIDDEN';
}

export default function BlogWorkspace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get('filter') || 'all';
  const actionParam = searchParams.get('action');

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [counts, setCounts] = useState({ all: 0, active: 0, scheduled: 0, expired: 0, hidden: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedBodyId, setExpandedBodyId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Study Guides');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [readTime, setReadTime] = useState('5 min read');
  const [authorName, setAuthorName] = useState('Techno World Editorial');
  const [isActive, setIsActive] = useState(true);

  // Scheduling & Duration State
  const [scheduleType, setScheduleType] = useState<'NOW' | 'LATER'>('NOW');
  const [scheduledAt, setScheduledAt] = useState('');
  const [expiryType, setExpiryType] = useState<'NEVER' | 'PRESET' | 'CUSTOM'>('NEVER');
  const [durationDays, setDurationDays] = useState<number>(30);
  const [expiresAt, setExpiresAt] = useState('');

  // Thumbnail Image File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailFileName, setThumbnailFileName] = useState<string | null>(null);
  const [thumbnailFileSize, setThumbnailFileSize] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlFallback, setShowUrlFallback] = useState(false);

  // Dynamic Predictive Book Search State
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [bookSearchResults, setBookSearchResults] = useState<any[]>([]);
  const [isSearchingBooks, setIsSearchingBooks] = useState(false);
  const [attachedBooks, setAttachedBooks] = useState<any[]>([]);
  const [showBookSearchDropdown, setShowBookSearchDropdown] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await blogService.getAdminBlogPosts({
        status: filterParam !== 'all' ? filterParam : undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: searchQuery || undefined,
      });

      if (res.success) {
        setPosts(res.data || []);
        if ((res as any).counts) setCounts((res as any).counts);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filterParam, selectedCategory]);


  useEffect(() => {
    if (actionParam === 'new') {
      openCreateModal();
      // Clean up the URL action param
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [actionParam]);

  // Predictive Dynamic Book Search Debounce
  useEffect(() => {
    const q = bookSearchQuery.trim();
    if (!q || q.length < 1) {
      setBookSearchResults([]);
      setIsSearchingBooks(false);
      setShowBookSearchDropdown(false);
      return;
    }

    setIsSearchingBooks(true);
    setShowBookSearchDropdown(true);

    const timer = setTimeout(async () => {
      try {
        const res = await bookService.getBooks({ search: q, limit: 12 });
        if (res.success && Array.isArray(res.data)) {
          setBookSearchResults(res.data);
        } else {
          setBookSearchResults([]);
        }
      } catch {
        setBookSearchResults([]);
      } finally {
        setIsSearchingBooks(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [bookSearchQuery]);

  const handleThumbnailFile = async (file: File) => {
    if (!file) return;
    if (!file.type.match(/image\/(png|jpeg|jpg|webp)/i)) {
      toast.error('Please upload a valid PNG or JPEG image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setThumbnailFileName(file.name);
    setThumbnailFileSize((file.size / 1024).toFixed(0) + ' KB');

    // Instant Base64 preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setThumbnailUrl(dataUrl);
    };
    reader.readAsDataURL(file);

    // Concurrently upload to server media storage
    try {
      setUploadingThumbnail(true);
      const res = await mediaService.upload(file, 'blog', `${title || 'blog'}-thumb`);
      if (res.success && res.data?.url) {
        setThumbnailUrl(getImageUrl(res.data.url));
        toast.success('Thumbnail uploaded to media storage');
      }
    } catch {
      // Fallback is preserved via Base64 dataUrl
      toast.info('Local image preview attached');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleToggleAttachBook = (book: any) => {
    const isAttached = attachedBooks.some(b => b.id === book.id);
    if (isAttached) {
      const updated = attachedBooks.filter(b => b.id !== book.id);
      setAttachedBooks(updated);
      toast.info(`Removed "${book.title}" from attached books`);
    } else {
      const updated = [...attachedBooks, book];
      setAttachedBooks(updated);
      toast.success(`Attached "${book.title}" to post`);
    }
  };

  const handleRemoveAttachedBook = (bookId: string) => {
    const updated = attachedBooks.filter(b => b.id !== bookId);
    setAttachedBooks(updated);
  };

  const openCreateModal = () => {
    setEditingPost(null);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setCategory('Study Guides');
    setThumbnailUrl('');
    setThumbnailFileName(null);
    setThumbnailFileSize(null);
    setShowUrlFallback(false);
    setReadTime('5 min read');
    setAuthorName('Techno World Editorial');
    setAttachedBooks([]);
    setBookSearchQuery('');
    setBookSearchResults([]);
    setShowBookSearchDropdown(false);
    setIsActive(true);
    setScheduleType('NOW');
    setScheduledAt('');
    setExpiryType('NEVER');
    setDurationDays(30);
    setExpiresAt('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: BlogPost) => {
    setEditingPost(p);
    setTitle(p.title);
    setSlug(p.slug);
    setExcerpt(p.excerpt || '');
    setContent(p.content);
    setCategory(p.category);
    setThumbnailUrl(p.thumbnailUrl || '');
    setThumbnailFileName(null);
    setThumbnailFileSize(null);
    setShowUrlFallback(Boolean(p.thumbnailUrl && p.thumbnailUrl.startsWith('http') && !p.thumbnailUrl.includes('/uploads/')));
    setReadTime(p.readTime || '5 min read');
    setAuthorName(p.authorName || 'Techno World Editorial');
    const ids = Array.isArray(p.relatedBookIds) ? p.relatedBookIds : [];
    setBookSearchQuery('');
    setBookSearchResults([]);
    setShowBookSearchDropdown(false);
    setIsActive(p.isActive);

    if (p.scheduledAt && new Date(p.scheduledAt) > new Date()) {
      setScheduleType('LATER');
      setScheduledAt(new Date(p.scheduledAt).toISOString().slice(0, 16));
    } else {
      setScheduleType('NOW');
      setScheduledAt('');
    }

    if (p.expiresAt) {
      setExpiryType('CUSTOM');
      setExpiresAt(new Date(p.expiresAt).toISOString().slice(0, 16));
    } else {
      setExpiryType('NEVER');
      setExpiresAt('');
    }

    // Load attached book objects if IDs exist
    if (ids.length > 0) {
      bookService.getBooks({ ids: ids.join(','), limit: 50 })
        .then((res: any) => {
          if (res.success && Array.isArray(res.data)) {
            setAttachedBooks(res.data);
          } else {
            setAttachedBooks([]);
          }
        })
        .catch(() => setAttachedBooks([]));
    } else {
      setAttachedBooks([]);
    }

    setIsModalOpen(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!editingPost) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Please enter a title and content body');
      return;
    }

    // Compute scheduledAt & expiresAt
    let finalScheduledAt: string | null = null;
    if (scheduleType === 'LATER' && scheduledAt) {
      finalScheduledAt = new Date(scheduledAt).toISOString();
    }

    let finalExpiresAt: string | null = null;
    if (expiryType === 'PRESET') {
      const exp = new Date();
      exp.setDate(exp.getDate() + Number(durationDays));
      finalExpiresAt = exp.toISOString();
    } else if (expiryType === 'CUSTOM' && expiresAt) {
      finalExpiresAt = new Date(expiresAt).toISOString();
    }

    const payload = {
      title,
      slug: slug || undefined,
      excerpt,
      content,
      category,
      thumbnailUrl,
      readTime,
      authorName,
      relatedCategory: null,
      relatedBookIds: attachedBooks.map(b => b.id),
      scheduledAt: finalScheduledAt,
      expiresAt: finalExpiresAt,
      isActive,
    };

    setSaving(true);
    try {
      if (editingPost) {
        const res = await blogService.updatePost(editingPost.id, payload);
        if (res.success) {
          toast.success('Blog post updated successfully');
          setIsModalOpen(false);
          fetchPosts();
        }
      } else {
        const res = await blogService.createPost(payload);
        if (res.success) {
          toast.success('Blog post published / created successfully');
          setIsModalOpen(false);
          fetchPosts();
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save blog post');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await blogService.toggleBlogPostStatus(id);
      if (res.success) {
        toast.success(res.message);
        setPosts(prev =>
          prev.map(p => {
            if (p.id === id) {
              const updatedActive = !p.isActive;
              return {
                ...p,
                isActive: updatedActive,
                computedStatus: updatedActive ? 'ACTIVE' : 'HIDDEN',
              };
            }
            return p;
          })
        );
        fetchPosts();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle status');
    }
  };

  const handleDeletePost = async (id: string, postTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${postTitle}"?`)) return;
    try {
      const res = await blogService.deleteBlogPost(id);
      if (res.success) {
        toast.success('Post deleted');
        setPosts(prev => prev.filter(p => p.id !== id));
        fetchPosts();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete post');
    }
  };


  const renderStatusBadge = (status: BlogPost['computedStatus']) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live / Active
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300 px-2.5 py-0.5 text-xs font-bold">
            <Clock className="h-3 w-3 text-blue-600" />
            Scheduled
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 text-xs font-bold">
            <Calendar className="h-3 w-3 text-amber-700" />
            Expired / Archived
          </span>
        );
      case 'HIDDEN':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-0.5 text-xs font-bold">
            <EyeOff className="h-3 w-3 text-slate-500" />
            Hidden / Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 shadow">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">
                Blog & Social Posts Feed
              </h1>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                Manage editorial study guides, exam booklists, and social articles with thumbnails, attached books, and scheduling.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchPosts}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/20 transition-all"
            title="Refresh Feed"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            Create Social Post
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'All Posts', count: counts.all },
            { id: 'active', label: 'Live Active', count: counts.active },
            { id: 'scheduled', label: 'Scheduled', count: counts.scheduled },
            { id: 'expired', label: 'Expired', count: counts.expired },
            { id: 'hidden', label: 'Hidden / Drafts', count: counts.hidden },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                searchParams.set('filter', tab.id);
                setSearchParams(searchParams);
              }}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-extrabold transition-all ${
                filterParam === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  filterParam === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchPosts()}
              placeholder="Search posts..."
              className="h-9 w-48 rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs focus:bg-white focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
          >
            <option value="All">All Categories</option>
            <option value="Study Guides">Study Guides</option>
            <option value="Book Recommendations">Book Recommendations</option>
            <option value="NEET Preparation">NEET Preparation</option>
            <option value="Medical (MBBS)">Medical (MBBS)</option>
            <option value="JEE & Engineering">JEE & Engineering</option>
            <option value="UPSC & Civil Services">UPSC & Civil Services</option>
          </select>
        </div>
      </div>

      {/* Social Media Post Feed Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-16 text-slate-400 shadow-xs">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
          <p className="text-sm font-semibold">Loading editorial social posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-base font-extrabold text-slate-800">No blog posts found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery || filterParam !== 'all'
              ? 'Try clearing your search or category filter to view all articles.'
              : 'Publish your first book guide or study recommendation to engage readers.'}
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow transition-all"
          >
            <Plus className="h-4 w-4" /> Create First Post
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map(post => {
            const isExpanded = expandedBodyId === post.id;
            return (
              <div
                key={post.id}
                className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                {/* 1. Post Header (Social Media Author Style) */}
                <div className="p-5 pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-900 border border-emerald-700/60 flex items-center justify-center text-white font-black text-xs shadow-xs">
                        TW
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-black text-slate-900">
                            {post.authorName || 'Techno World Editorial'}
                          </p>
                          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 text-[9px] font-extrabold text-emerald-800">
                            Official Desk
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>{new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span>&bull;</span>
                          <span>{post.readTime || '5 min read'}</span>
                          <span>&bull;</span>
                          <span>👁️ {post.views} views</span>
                        </p>
                      </div>
                    </div>

                    <div>{renderStatusBadge(post.computedStatus)}</div>
                  </div>

                  {/* Title & Category */}
                  <div className="mt-3.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-600">
                        {post.category}
                      </span>
                      {post.relatedCategory && (
                        <span className="rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                          Related: {post.relatedCategory}
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-black text-slate-900 leading-snug">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </div>

                {/* 2. Visual Thumbnail Banner */}
                {post.thumbnailUrl ? (
                  <div className="relative h-48 sm:h-56 w-full bg-slate-100 overflow-hidden group">
                    <img
                      src={post.thumbnailUrl}
                      alt={post.title}
                      className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <button
                        type="button"
                        onClick={() => openEditModal(post)}
                        className="rounded-lg bg-white/90 backdrop-blur-xs px-3 py-1.5 text-xs font-bold text-slate-900 hover:bg-white shadow"
                      >
                        Change Thumbnail
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-28 bg-gradient-to-r from-emerald-900 to-slate-900 flex items-center justify-center text-white/40">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}

                {/* 3. Post Content Preview */}
                <div className="p-5 pt-3 space-y-3">
                  <div className="text-xs text-slate-600 leading-relaxed">
                    {isExpanded ? (
                      <div className="whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono text-[11px]">
                        {post.content}
                      </div>
                    ) : (
                      <p className="line-clamp-3">{post.content}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => setExpandedBodyId(isExpanded ? null : post.id)}
                      className="text-[11px] font-bold text-emerald-700 hover:underline mt-1 inline-flex items-center gap-0.5"
                    >
                      {isExpanded ? (
                        <>Collapse <ChevronUp className="h-3 w-3" /></>
                      ) : (
                        <>Read More <ChevronDown className="h-3 w-3" /></>
                      )}
                    </button>
                  </div>

                  {/* 4. Scheduling & Duration Timeline Card */}
                  <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-bold flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" /> Release Schedule:
                      </span>
                      <span className="font-medium text-slate-800">
                        {post.scheduledAt
                          ? `Scheduled for ${new Date(post.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}`
                          : 'Immediate Release'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200/60">
                      <span className="font-bold flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" /> Expiry / Duration:
                      </span>
                      <span className="font-medium text-slate-800">
                        {post.expiresAt
                          ? `Expires on ${new Date(post.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                          : 'Persistent (No Expiry)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. Actions Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50/70 border-t border-slate-100">
                  {/* Quick Active / Hidden Switch */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={post.isActive}
                      onChange={() => handleToggleStatus(post.id)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-slate-700">
                      {post.isActive ? 'Active (Live)' : 'Hidden (Draft)'}
                    </span>
                  </label>

                  <div className="flex items-center gap-2">
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="View live post on bookstore"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => openEditModal(post)}
                      className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Post"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePost(post.id, post.title)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Post"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Creator & Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingPost ? 'Edit Blog & Social Post' : 'Create New Social Media Blog Post'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Set thumbnail, content body, linked book categories, and schedule.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePost} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* 1. Title & URL Slug */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Post Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="e.g. Best NEET Books 2026: Complete Subject-wise List by Toppers"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={e => setSlug(e.target.value)}
                      placeholder="best-neet-books-2026"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-700 focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Post Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                    >
                      <option value="Study Guides">Study Guides</option>
                      <option value="Book Recommendations">Book Recommendations</option>
                      <option value="NEET Preparation">NEET Preparation</option>
                      <option value="Medical (MBBS)">Medical (MBBS)</option>
                      <option value="Engineering & JEE">Engineering & JEE</option>
                      <option value="UPSC & Civil Services">UPSC & Civil Services</option>
                      <option value="College Street Highlights">College Street Highlights</option>
                      <option value="Author Spotlight">Author Spotlight</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Thumbnail Image Upload (PNG / JPEG) */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4 text-emerald-600" /> Post Thumbnail Image (PNG / JPEG)
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Upload a PNG or JPEG file from your computer (16:9 banner preview).
                    </p>
                  </div>
                  {thumbnailUrl && (
                    <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                      {thumbnailFileName || 'Image Attached'}
                    </span>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleThumbnailFile(e.target.files[0]);
                  }}
                  className="hidden"
                />

                {thumbnailUrl ? (
                  <div className="space-y-2">
                    <div className="relative h-44 sm:h-52 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-950 shadow-sm group">
                      <img
                        src={thumbnailUrl}
                        alt="Thumbnail preview"
                        className="h-full w-full object-cover"
                      />
                      {uploadingThumbnail && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold gap-2">
                          <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
                          Uploading to media storage...
                        </div>
                      )}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="rounded-md bg-emerald-600/90 backdrop-blur-xs text-white px-2 py-0.5 text-[10px] font-bold shadow">
                          PNG / JPEG Attached
                        </span>
                        {thumbnailFileSize && (
                          <span className="rounded-md bg-slate-900/80 backdrop-blur-xs text-white px-2 py-0.5 text-[10px] font-medium shadow">
                            {thumbnailFileSize}
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="rounded-lg bg-white/95 hover:bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-md flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Upload className="h-3.5 w-3.5 text-emerald-700" /> Change Image
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setThumbnailUrl('');
                            setThumbnailFileName(null);
                            setThumbnailFileSize(null);
                          }}
                          className="rounded-lg bg-rose-600/90 hover:bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-md flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      if (e.dataTransfer.files?.[0]) handleThumbnailFile(e.dataTransfer.files[0]);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                      isDragOver
                        ? 'border-emerald-500 bg-emerald-50/70 scale-[1.01]'
                        : 'border-slate-300 bg-white hover:border-emerald-500 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 mb-2 shadow-xs">
                        <UploadCloud className="h-6 w-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        Click to upload or drag & drop PNG or JPEG
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Supports PNG, JPEG, JPG, WEBP • Max 10MB • Recommended 1200×675
                      </p>
                    </div>
                  </div>
                )}

                {/* Optional URL input toggle */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowUrlFallback(!showUrlFallback)}
                    className="text-[11px] text-slate-500 hover:text-emerald-700 font-semibold underline cursor-pointer"
                  >
                    {showUrlFallback ? '− Hide external image URL link' : '+ Or paste external image link'}
                  </button>
                  {showUrlFallback && (
                    <input
                      type="url"
                      value={thumbnailUrl}
                      onChange={e => setThumbnailUrl(e.target.value)}
                      placeholder="https://... (or use file upload above)"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                    />
                  )}
                </div>
              </div>

              {/* 3. Post Excerpt & Body Content */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Excerpt / Social Feed Hook
                </label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={e => setExcerpt(e.target.value)}
                  placeholder="Short 1-2 sentence hook displayed on feed cards and social shares..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Full Article Body <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={7}
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Write the full editorial text here. Use markdown bold (**keyword**) to emphasize critical book recommendations..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden leading-relaxed font-mono"
                />
              </div>

              {/* 4. Related Books by Dynamic Predictive Search */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                      <Book className="h-4 w-4 text-emerald-700" /> Related Books Catalog Attachment
                    </label>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Search books dynamically across Book Title, Author Name, or SKU / ISBN to attach them.
                    </p>
                  </div>
                  {attachedBooks.length > 0 && (
                    <span className="rounded-full bg-emerald-200 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-extrabold">
                      {attachedBooks.length} Book{attachedBooks.length > 1 ? 's' : ''} Attached
                    </span>
                  )}
                </div>

                {/* Author / Byline input alongside */}
                <div>
                  <label className="block text-[11px] font-bold text-emerald-950 mb-1">
                    Editorial Author / Byline
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={e => setAuthorName(e.target.value)}
                    placeholder="e.g. Techno World Editorial"
                    className="w-full sm:w-80 rounded-xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                {/* Predictive Dynamic Live Search Bar */}
                <div className="relative">
                  <label className="block text-[11px] font-bold text-emerald-950 mb-1">
                    Search Books to Attach (Title, Author, or SKU / ISBN)
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={bookSearchQuery}
                      onChange={(e) => {
                        setBookSearchQuery(e.target.value);
                        setShowBookSearchDropdown(true);
                      }}
                      onFocus={() => {
                        if (bookSearchQuery.trim().length > 0) setShowBookSearchDropdown(true);
                      }}
                      placeholder="Start typing Book Title, Author Name, or SKU ID (e.g. Physics, Irodov, SKU-01)..."
                      className="w-full rounded-xl border border-emerald-300 bg-white pl-10 pr-10 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-hidden shadow-xs"
                    />
                    {bookSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setBookSearchQuery('');
                          setBookSearchResults([]);
                          setShowBookSearchDropdown(false);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Predictive Results Dropdown Panel */}
                  {showBookSearchDropdown && bookSearchQuery.trim().length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-72 overflow-y-auto rounded-xl bg-white border border-slate-200 shadow-xl divide-y divide-slate-100">
                      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-700">
                        <span>Predictive Book Results</span>
                        <button
                          type="button"
                          onClick={() => setShowBookSearchDropdown(false)}
                          className="text-slate-400 hover:text-slate-600 text-[10px] font-medium"
                        >
                          Close [✕]
                        </button>
                      </div>

                      {isSearchingBooks ? (
                        <div className="flex items-center justify-center gap-2 py-6 text-xs font-semibold text-emerald-700">
                          <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                          Predicting matching books across Title, Author & SKU...
                        </div>
                      ) : bookSearchResults.length === 0 ? (
                        <div className="py-6 px-4 text-center text-xs text-slate-500">
                          No books matched <span className="font-bold text-slate-800">"{bookSearchQuery}"</span>. Try searching another title, author, or SKU.
                        </div>
                      ) : (
                        bookSearchResults.map((bk) => {
                          const isAlreadyAttached = attachedBooks.some(b => b.id === bk.id);
                          const authors = bk.authors
                            ? (Array.isArray(bk.authors) ? bk.authors.map((a: any) => a.name).join(', ') : bk.authors)
                            : (bk.author || 'Author not specified');
                          const sku = bk.sku || bk.bookCode || bk.isbn13 || bk.isbn10;
                          const cover = bk.thumbnailUrl || bk.coverUrl || bk.images?.[0];

                          return (
                            <div
                              key={bk.id}
                              className={`flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors ${
                                isAlreadyAttached ? 'bg-emerald-50/50' : ''
                              }`}
                            >
                              <div className="h-12 w-9 rounded-md bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                {cover ? (
                                  <img src={cover} alt={bk.title} className="h-full w-full object-cover" />
                                ) : (
                                  <Book className="h-4 w-4 text-slate-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate">{bk.title}</p>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[11px] text-slate-500">
                                  <span className="font-medium text-slate-700 truncate max-w-[180px]">
                                    ✍️ {authors}
                                  </span>
                                  {sku && (
                                    <span className="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded text-[10px] font-bold">
                                      SKU: {sku}
                                    </span>
                                  )}
                                  <span className="font-bold text-emerald-700">
                                    {formatINR(bk.price)}
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleToggleAttachBook(bk)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                                  isAlreadyAttached
                                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                                }`}
                              >
                                {isAlreadyAttached ? (
                                  <>
                                    <Check className="h-3 w-3" /> Attached
                                  </>
                                ) : (
                                  '+ Add to Post'
                                )}
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Attached Books Strip */}
                <div className="space-y-2 pt-2 border-t border-emerald-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Attached Books ({attachedBooks.length})
                    </span>
                    {attachedBooks.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setAttachedBooks([]);
                        }}
                        className="text-[11px] text-rose-600 hover:underline font-semibold cursor-pointer"
                      >
                        Remove All
                      </button>
                    )}
                  </div>

                  {attachedBooks.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-emerald-300 bg-white/80 p-4 text-center text-xs text-emerald-900/70">
                      No specific books attached yet. Type a Book Title, Author, or SKU code in the search bar above to predict and add books to this post.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                      {attachedBooks.map((bk) => {
                        const authors = bk.authors
                          ? (Array.isArray(bk.authors) ? bk.authors.map((a: any) => a.name).join(', ') : bk.authors)
                          : (bk.author || 'Author not specified');
                        const sku = bk.sku || bk.bookCode || bk.isbn13 || bk.isbn10;
                        const cover = bk.thumbnailUrl || bk.coverUrl || bk.images?.[0];

                        return (
                          <div
                            key={bk.id}
                            className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-emerald-300/80 shadow-xs group"
                          >
                            <div className="h-12 w-9 rounded-md bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {cover ? (
                                <img src={cover} alt={bk.title} className="h-full w-full object-cover" />
                              ) : (
                                <Book className="h-4 w-4 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-bold text-slate-900 truncate">{bk.title}</h5>
                              <p className="text-[10px] text-slate-500 truncate">✍️ {authors}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {sku && (
                                  <span className="font-mono text-[9px] bg-slate-100 text-slate-600 px-1 rounded font-bold">
                                    SKU: {sku}
                                  </span>
                                )}
                                <span className="text-[11px] font-bold text-emerald-700">
                                  {formatINR(bk.price)}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachedBook(bk.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Remove book from post"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* 5. Scheduling & Duration Options */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-emerald-600" /> Scheduling & Duration Controls
                  </label>
                  <span className="text-[11px] text-slate-400">Automated Post Lifecycle</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Schedule Release */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Release Schedule</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setScheduleType('NOW')}
                        className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                          scheduleType === 'NOW'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700'
                        }`}
                      >
                        Publish Now
                      </button>
                      <button
                        type="button"
                        onClick={() => setScheduleType('LATER')}
                        className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                          scheduleType === 'LATER'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700'
                        }`}
                      >
                        Schedule Date
                      </button>
                    </div>

                    {scheduleType === 'LATER' && (
                      <input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={e => setScheduledAt(e.target.value)}
                        className="w-full mt-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                      />
                    )}
                  </div>

                  {/* Expiration & Duration */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Duration / Expiry</label>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setExpiryType('NEVER')}
                        className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-bold transition-colors ${
                          expiryType === 'NEVER'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700'
                        }`}
                      >
                        No Expiry
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpiryType('PRESET')}
                        className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-bold transition-colors ${
                          expiryType === 'PRESET'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700'
                        }`}
                      >
                        Preset
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpiryType('CUSTOM')}
                        className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-bold transition-colors ${
                          expiryType === 'CUSTOM'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700'
                        }`}
                      >
                        Date
                      </button>
                    </div>

                    {expiryType === 'PRESET' && (
                      <div className="flex gap-1.5 mt-1.5">
                        {[7, 15, 30, 90].map(days => (
                          <button
                            key={days}
                            type="button"
                            onClick={() => setDurationDays(days)}
                            className={`flex-1 py-1 rounded border text-[11px] font-bold ${
                              durationDays === days
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            {days}d
                          </button>
                        ))}
                      </div>
                    )}

                    {expiryType === 'CUSTOM' && (
                      <input
                        type="datetime-local"
                        value={expiresAt}
                        onChange={e => setExpiresAt(e.target.value)}
                        className="w-full mt-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* 6. Active Initial Toggle */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={e => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Make this post active immediately upon saving
                  </span>
                </label>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-black text-white hover:bg-emerald-700 shadow transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {editingPost ? 'Save Changes' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

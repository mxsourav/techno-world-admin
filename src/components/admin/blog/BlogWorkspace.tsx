import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { blogService, categoryService, bookService } from '@/services/api';
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

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
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
  const [categories, setCategories] = useState<CategoryOption[]>([]);
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
  const [relatedCategory, setRelatedCategory] = useState('');
  const [relatedBookIds, setRelatedBookIds] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  // Scheduling & Duration State
  const [scheduleType, setScheduleType] = useState<'NOW' | 'LATER'>('NOW');
  const [scheduledAt, setScheduledAt] = useState('');
  const [expiryType, setExpiryType] = useState<'NEVER' | 'PRESET' | 'CUSTOM'>('NEVER');
  const [durationDays, setDurationDays] = useState<number>(30);
  const [expiresAt, setExpiresAt] = useState('');

  // Related Books Catalog Picker
  const [categoryBooks, setCategoryBooks] = useState<any[]>([]);
  const [loadingCategoryBooks, setLoadingCategoryBooks] = useState(false);

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
    categoryService.getCategories()
      .then((res: any) => {
        if (res.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (actionParam === 'new') {
      openCreateModal();
      // Clean up the URL action param
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [actionParam]);

  // Load books when relatedCategory changes in modal
  useEffect(() => {
    if (!relatedCategory) {
      setCategoryBooks([]);
      return;
    }
    setLoadingCategoryBooks(true);
    bookService.getBooks({ category: relatedCategory, limit: 20 })
      .then((res: any) => {
        if (res.success && Array.isArray(res.data)) {
          setCategoryBooks(res.data);
        } else {
          setCategoryBooks([]);
        }
      })
      .catch(() => setCategoryBooks([]))
      .finally(() => setLoadingCategoryBooks(false));
  }, [relatedCategory]);

  const openCreateModal = () => {
    setEditingPost(null);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setCategory('Study Guides');
    setThumbnailUrl('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80');
    setReadTime('5 min read');
    setAuthorName('Techno World Editorial');
    setRelatedCategory('Medical (MBBS)');
    setRelatedBookIds([]);
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
    setReadTime(p.readTime || '5 min read');
    setAuthorName(p.authorName || 'Techno World Editorial');
    setRelatedCategory(p.relatedCategory || '');
    setRelatedBookIds(Array.isArray(p.relatedBookIds) ? p.relatedBookIds : []);
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
      relatedCategory: relatedCategory || null,
      relatedBookIds,
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

  const toggleBookSelection = (bookId: string) => {
    setRelatedBookIds(prev =>
      prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
    );
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

              {/* 2. Thumbnail Image Setup */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-emerald-600" /> Post Thumbnail Image
                  </label>
                  <span className="text-[11px] text-slate-400">High-res 16:9 banner preview</span>
                </div>

                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={e => setThumbnailUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or paste image URL"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                />

                {thumbnailUrl && (
                  <div className="relative h-36 w-full rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                    <img src={thumbnailUrl} alt="Thumbnail preview" className="h-full w-full object-cover" />
                  </div>
                )}
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

              {/* 4. Related Books by Category Selection */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                      <Book className="h-4 w-4 text-emerald-700" /> Related Books Catalog Attachment
                    </label>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Choose a category to display matching books below this post on the public blog.
                    </p>
                  </div>
                  {relatedBookIds.length > 0 && (
                    <span className="rounded-full bg-emerald-200 text-emerald-900 px-2 py-0.5 text-[10px] font-extrabold">
                      {relatedBookIds.length} Hand-picked
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                      Select Book Category
                    </label>
                    <select
                      value={relatedCategory}
                      onChange={e => setRelatedCategory(e.target.value)}
                      className="w-full rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                    >
                      <option value="">-- Choose Category for Related Books --</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                      Author / Byline
                    </label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={e => setAuthorName(e.target.value)}
                      className="w-full rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Book Selection Checkboxes */}
                {relatedCategory && (
                  <div className="mt-2 space-y-2 border-t border-emerald-200 pt-3">
                    <p className="text-[11px] font-bold text-emerald-900">
                      Select specific books to highlight (leave unselected to auto-show top books):
                    </p>
                    {loadingCategoryBooks ? (
                      <div className="flex items-center gap-2 text-xs text-emerald-700 py-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Fetching books in {relatedCategory}...
                      </div>
                    ) : categoryBooks.length === 0 ? (
                      <p className="text-xs text-slate-500">No books found in this category.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                        {categoryBooks.map(bk => {
                          const isChecked = relatedBookIds.includes(bk.id);
                          return (
                            <label
                              key={bk.id}
                              className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                                isChecked
                                  ? 'bg-emerald-100/70 border-emerald-400 font-bold text-emerald-950'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleBookSelection(bk.id)}
                                className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600"
                              />
                              <span className="truncate">{bk.title}</span>
                              <span className="ml-auto text-[11px] text-slate-500 font-semibold shrink-0">
                                {formatINR(bk.price)}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
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

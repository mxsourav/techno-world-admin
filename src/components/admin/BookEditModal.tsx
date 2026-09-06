import React, { useState } from 'react';

import { toast } from 'sonner';
import { adminService, categoryService , getImageUrl} from '@/services/api';
import { CATEGORIES as WEBSITE_CATEGORIES } from '@/data/books';


function renderBookDescriptionPreview(text: string) {
  if (!text || !text.trim()) {
    return (
      <div className="py-8 text-center text-slate-400 italic text-xs">
        No description entered yet. Switch to "Write / Edit" to add details.
      </div>
    );
  }

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key} className="my-2 space-y-1.5 pl-1">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  const parseInline = (str: string): React.ReactNode => {
    const parts = str.split(/(\**[^*]+\**)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-extrabold text-slate-950">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    if (!line) {
      flushList(`list-${idx}`);
      elements.push(<div key={`blank-${idx}`} className="h-2" />);
      return;
    }

    if (line.startsWith('# ')) {
      flushList(`list-${idx}`);
      elements.push(
        <h1 key={`h1-${idx}`} className="text-base font-black text-slate-950 mt-3 mb-1 border-b border-slate-200 pb-1">
          {line.replace(/^#\s+/, '')}
        </h1>
      );
      return;
    }

    if (line.startsWith('## ')) {
      flushList(`list-${idx}`);
      elements.push(
        <h2 key={`h2-${idx}`} className="text-sm font-black text-slate-900 mt-3 mb-1">
          {line.replace(/^##\s+/, '')}
        </h2>
      );
      return;
    }

    if (line.startsWith('### ')) {
      flushList(`list-${idx}`);
      const title = line.replace(/^###\s+/, '');
      elements.push(
        <div key={`h3-${idx}`} className="mt-3.5 mb-1.5 flex items-center gap-2 border-b border-emerald-100 pb-1">
          <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
          <h3 className="text-xs font-black uppercase tracking-wider text-emerald-900">
            {title}
          </h3>
        </div>
      );
      return;
    }

    // Bullets: • or - or *
    if (line.startsWith('•') || line.startsWith('- ') || line.startsWith('* ')) {
      const clean = line.replace(/^[•\-*]\s*/, '');
      listItems.push(
        <li key={`li-${idx}`} className="flex items-start gap-2 text-xs text-slate-700">
          <span className="text-emerald-600 font-bold text-sm leading-none mt-0.5">•</span>
          <span className="flex-1 leading-relaxed">{parseInline(clean)}</span>
        </li>
      );
      return;
    }

    // Numbered lists: 1. 2.
    const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      listItems.push(
        <li key={`li-${idx}`} className="flex items-start gap-2 text-xs text-slate-700">
          <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold shrink-0 mt-0.5">
            {numMatch[1]}
          </span>
          <span className="flex-1 leading-relaxed">{parseInline(numMatch[2])}</span>
        </li>
      );
      return;
    }

    // Normal paragraph
    flushList(`list-${idx}`);
    elements.push(
      <p key={`p-${idx}`} className="text-xs text-slate-700 leading-relaxed">
        {parseInline(line)}
      </p>
    );
  });

  flushList('list-end');

  return <div className="space-y-1">{elements}</div>;
}

export default function BookEditModal({ book, onClose, onSaved }: { book: any | null, onClose: () => void, onSaved: () => void }) {
  const initialCategory = (() => {
    const catVal = (book?.categoryName || book?.category || '').trim();
    if (!catVal) return '';
    const match = WEBSITE_CATEGORIES.find(
      c => c.slug.toLowerCase() === catVal.toLowerCase() || c.name.toLowerCase() === catVal.toLowerCase()
    );
    return match ? match.name : catVal;
  })();

  const initialSeoKeywords = (() => {
    if (!book?.seoKeywords) return '';
    if (Array.isArray(book.seoKeywords)) return book.seoKeywords.join(', ');
    try {
      const parsed = JSON.parse(book.seoKeywords);
      if (Array.isArray(parsed)) return parsed.join(', ');
    } catch {}
    return String(book.seoKeywords);
  })();

  const [formData, setFormData] = useState<any>({
    title: book?.title || '',
    publicationDate: book?.publicationDate ? new Date(book.publicationDate).toISOString().split('T')[0] : '',
    isbn13: book?.isbn13 || '',
    isbn10: book?.isbn10 || '',
    sku: book?.sku || '',
    bookCode: book?.bookCode || '',
    price: book?.price || 0,
    mrp: book?.mrp || 0,
    stock: book?.stock || 0,
    pages: book?.pages || 0,
    description: book?.description || '',
    shortDescription: book?.shortDescription || '',
    edition: book?.edition || '1st Edition',
    language: book?.language || 'English',
    bindingType: book?.bindingType || 'Paperback',
    publisher: book?.publisherName || book?.publisher || '',
    authorsList: book?.authorsList || (book?.author ? [book.author] : []),
    subjects: book?.subjects || [],
    bookType: book?.bookType || '',
    category: initialCategory,
    seoKeywords: initialSeoKeywords,
    tags: book?.tags || []
  });
  
  const [descTab, setDescTab] = useState<'edit' | 'preview'>('edit');
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  // Auto-restore draft if adding new book
  React.useEffect(() => {
    if (!book) {
      try {
        const saved = localStorage.getItem('tw_book_draft_new');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object' && (parsed.title || parsed.description || parsed.isbn13)) {
            setFormData((prev: any) => ({ ...prev, ...parsed }));
            setHasRestoredDraft(true);
          }
        }
      } catch {}
    }
  }, []);

  // Auto-save draft on form change
  React.useEffect(() => {
    if (!book && (formData.title || formData.description || formData.isbn13 || formData.mrp)) {
      try {
        localStorage.setItem('tw_book_draft_new', JSON.stringify(formData));
      } catch {}
    }
  }, [formData]);

  const clearDraft = () => {
    localStorage.removeItem('tw_book_draft_new');
    setHasRestoredDraft(false);
    toast.success('Saved draft cleared');
  };
  const [categories, setCategories] = useState<any[]>(
    WEBSITE_CATEGORIES.map(c => ({ id: c.slug, name: c.name, slug: c.slug }))
  );
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  
  React.useEffect(() => {
    categoryService.getCategories().then((res: any) => {
      if (res?.data && Array.isArray(res.data)) {
        const map = new Map<string, any>();
        WEBSITE_CATEGORIES.forEach(c => map.set(c.name.toLowerCase(), { id: c.slug, name: c.name, slug: c.slug }));
        res.data.forEach((c: any) => {
          const key = (c.name || '').toLowerCase().trim();
          if (key && !map.has(key)) {
            map.set(key, c);
          }
        });
        setCategories(Array.from(map.values()));
      }
    }).catch(e => console.error('Failed to load categories:', e));
  }, []);

  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let bookId = book?.id;
      if (book?.id) {
        await adminService.updateBook(book.id, formData);
        toast.success(`"${formData.title}" updated successfully!`);
      } else {
        const newBook = await adminService.createBook(formData);
        bookId = newBook.data.id;
        toast.success(`"${formData.title}" created successfully!`);
      }
      
      if (file && bookId) {
        await adminService.uploadBookCover(bookId, file);
        toast.success('Thumbnail uploaded!');
      }
      onSaved();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save book');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (field: string, val: string) => {
    const arr = val.split(',').map(s => s.trim()).filter(Boolean);
    setFormData({ ...formData, [field]: arr });
  };

  const insertTemplate = (template: string) => {
    const current = formData.description ? formData.description + '\n\n' : '';
    setFormData({ ...formData, description: current + template });
    toast.success('Template inserted into description');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{book ? 'Edit Book Details' : 'Add New Book to Catalog'}</h2>
            <p className="text-xs text-slate-500">Manage title, pricing, book description, syllabus, and taxonomy</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl leading-none">&times;</button>
        </div>
        
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {hasRestoredDraft && (
            <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/90 px-4 py-2.5 text-xs text-blue-900 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-blue-800">💾 Unsaved Draft Restored:</span>
                <span className="text-slate-600">Your previously entered book details & description have been restored.</span>
              </div>
              <button
                type="button"
                onClick={clearDraft}
                className="text-xs font-extrabold text-rose-600 hover:text-rose-700 underline shrink-0 ml-3"
              >
                Discard Draft
              </button>
            </div>
          )}
          
          {/* Cover & Media */}
          <div className="flex gap-6 items-start p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            {file ? (
              <div className="w-24 shrink-0 flex flex-col items-center justify-center p-2 border border-slate-200 rounded-lg bg-white min-h-32 shadow-xs">
                {file.type.startsWith('image/') ? (
                  <img src={URL.createObjectURL(file)} className="w-full h-auto object-cover rounded" alt="Preview" />
                ) : (
                  <span className="text-xs text-center font-bold text-slate-500 overflow-hidden text-ellipsis w-full">{file.name}</span>
                )}
              </div>
            ) : book?.coverUrl ? (
              <div className="w-24 shrink-0">
                <img src={getImageUrl(book.coverUrl)} className="w-24 h-32 object-cover rounded-lg border border-slate-200 shadow-xs bg-slate-50" alt="Cover" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
              </div>
            ) : (
              <div className="w-24 h-32 shrink-0 rounded-lg bg-slate-200 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs text-center p-2">
                No Cover
              </div>
            )}
            <div className="flex-1 space-y-2">
              <label className="block text-xs font-bold text-slate-700">Cover Image / Thumbnail (Image or PDF)</label>
              <input 
                type="file" 
                accept="image/*,application/pdf"
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
              <p className="text-[10px] text-slate-400">Supported formats: JPG, PNG, WebP, PDF. Cover will display on storefront and product view.</p>
            </div>
          </div>
          
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Book Title *</label>
              <input required name="title" value={formData.title} onChange={handleChange} placeholder="e.g. WBSSC Group C & Group D Cracker" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Publication Date</label>
              <input type="date" name="publicationDate" value={formData.publicationDate || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
          </div>

          {/* Identifiers */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ISBN-13</label>
              <input name="isbn13" placeholder="978-..." value={formData.isbn13 || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">SKU</label>
              <input name="sku" placeholder="SKU-..." value={formData.sku || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Book / Item Code</label>
              <input name="bookCode" placeholder="BK-..." value={formData.bookCode || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono outline-none focus:border-emerald-500" />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (₹) *</label>
              <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Printed MRP (₹) *</label>
              <input required type="number" step="0.01" name="mrp" value={formData.mrp} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Stock Quantity</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Page Count</label>
              <input type="number" name="pages" value={formData.pages || ''} onChange={handleChange} placeholder="e.g. 480" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
          </div>

          {/* Specifications */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Edition</label>
              <input name="edition" placeholder="e.g. 2026 Edition" value={formData.edition || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Language</label>
              <select name="language" value={formData.language || 'English'} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 bg-white">
                <option value="English">English</option>
                <option value="Bengali">Bengali</option>
                <option value="Hindi">Hindi</option>
                <option value="Bilingual">Bilingual (English & Bengali)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Binding Format</label>
              <select name="bindingType" value={formData.bindingType || 'Paperback'} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 bg-white">
                <option value="Paperback">Paperback</option>
                <option value="Hardcover">Hardcover</option>
                <option value="Spiral Bound">Spiral Bound</option>
              </select>
            </div>
          </div>

          {/* Dedicated Rich Book Description & Overview Section */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/20 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                  Book Description & Syllabus Content *
                </label>
                <span className="text-[11px] text-slate-500">
                  This description powers the product overview, highlights, and exam syllabus details.
                </span>
              </div>

              {/* Edit / Preview Tabs */}
              <div className="flex items-center rounded-lg bg-slate-100 p-0.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setDescTab('edit')}
                  className={`px-3 py-1 rounded-md transition-all ${descTab === 'edit' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Write / Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDescTab('preview')}
                  className={`px-3 py-1 rounded-md transition-all ${descTab === 'preview' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Live Preview
                </button>
              </div>
            </div>

            {/* Quick-Insert Formatting Chips */}
            {descTab === 'edit' && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Quick Insert:</span>
                <button
                  type="button"
                  onClick={() => insertTemplate('### Key Features:\n• Comprehensive chapter-wise coverage\n• 2500+ Practice MCQs with detailed explanations\n• Previous 5 Years Solved Papers included')}
                  className="rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50"
                >
                  + Key Features List
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate('### Syllabus Breakdown:\n1. General Intelligence & Reasoning\n2. Quantitative Aptitude & Mathematics\n3. General Awareness & Current Affairs\n4. English & Language Comprehension')}
                  className="rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50"
                >
                  + Syllabus Breakdown
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate('### Target Examination:\nIdeal for aspirants preparing for Competitive Examinations, State Service Commission Exams, and Academic Entrance Tests.')}
                  className="rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50"
                >
                  + Target Exam Note
                </button>
              </div>
            )}

            {descTab === 'edit' ? (
              <div className="relative">
                <textarea 
                  name="description" 
                  value={formData.description || ''} 
                  onChange={handleChange} 
                  rows={8} 
                  placeholder="Enter detailed description, chapters outline, key highlights, examination syllabus, and author notes..." 
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs leading-relaxed outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-sans" 
                />
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Formatting: Paragraphs, bullet points (• or -), and line breaks are fully supported.</span>
                  <span>{(formData.description || '').length} characters · {(formData.description || '').split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>
            ) : (
              <div className="min-h-36 rounded-lg border border-slate-200 bg-slate-50/40 p-4 text-xs text-slate-800 leading-relaxed shadow-inner">
                {renderBookDescriptionPreview(formData.description)}
              </div>
            )}
          </div>

          {/* Authors & Publisher */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Authors (comma separated)</label>
              <input value={(formData.authorsList || []).join(', ')} onChange={e => handleArrayChange('authorsList', e.target.value)} placeholder="e.g. Dr. Rupa Acharya, Joydip Chakraborty" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Publisher</label>
              <input name="publisher" value={formData.publisher} onChange={handleChange} placeholder="e.g. Techno World Publications" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
          </div>

          {/* Categories & Subject */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              {isAddingNewCategory ? (
                <div className="flex gap-2">
                  <input autoFocus name="category" placeholder="New category name..." value={formData.category} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
                  <button type="button" onClick={() => setIsAddingNewCategory(false)} className="text-slate-400 hover:text-slate-600 px-2 text-xs font-bold">&times;</button>
                </div>
              ) : (
                <select 
                  name="category" 
                  value={formData.category || ''} 
                  onChange={(e) => {
                    if (e.target.value === 'ADD_NEW') {
                      setIsAddingNewCategory(true);
                      setFormData({ ...formData, category: '' });
                    } else {
                      handleChange(e as any);
                    }
                  }} 
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="">Select Category...</option>
                  {categories.map(c => (
                    <option key={c.id || c.slug} value={c.name}>{c.name}</option>
                  ))}
                  {formData.category && !categories.some(c => c.name.toLowerCase() === (formData.category || '').toLowerCase()) && (
                    <option value={formData.category}>{formData.category}</option>
                  )}
                  <option value="ADD_NEW" className="font-bold text-emerald-600">+ Add New Category...</option>
                </select>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Book Type</label>
              <input name="bookType" value={formData.bookType || ''} onChange={handleChange} placeholder="e.g. Text Book, Guide, Cracker" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subjects (comma separated)</label>
              <input value={(formData.subjects || []).join(', ')} onChange={e => handleArrayChange('subjects', e.target.value)} placeholder="e.g. Mathematics, Zoology" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
          </div>

          {/* Internal Search Keywords & Indexing (Admin Only - Never visible on customer storefront) */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-bold text-slate-900">
                Search & SEO Keywords (Internal Indexing Only)
              </label>
              <span className="rounded-md bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                🔒 Admin Only &bull; Hidden from Customer Storefront
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Enter comma-separated keywords, alternate spellings, exam tags, and syllabus terms (e.g. <i>NEET 2026, Physics MCQ, WBJEE, HC Verma, Class 11, Medical Entrance</i>). The customer search bar indexes these for ultra-fast query matching, but this section will never be shown to customers.
            </p>
            <input
              name="seoKeywords"
              value={formData.seoKeywords || ''}
              onChange={handleChange}
              placeholder="e.g. NEET 2026, Physics MCQ, WBJEE, HC Verma, Class 11, Medical Entrance"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            {/* Quick exam tags helper */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Quick Tags:</span>
              {['NEET 2026', 'JEE Advanced', 'WBJEE', 'UPSC Prelims', 'WBCS Exam', 'CBSE Class 12', 'Physics MCQ', 'Previous Years Solved'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const current = formData.seoKeywords ? String(formData.seoKeywords).trim() : '';
                    if (!current) {
                      setFormData({ ...formData, seoKeywords: tag });
                    } else if (!current.toLowerCase().includes(tag.toLowerCase())) {
                      setFormData({ ...formData, seoKeywords: `${current}, ${tag}` });
                    }
                  }}
                  className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 hover:border-emerald-500 hover:text-emerald-700 transition-colors shadow-2xs"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>
        </form>

        <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
          <button onClick={onClose} className="rounded-lg px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50">
            {loading ? 'Saving Book...' : 'Save Book & Description'}
          </button>
        </div>
      </div>
    </div>
  );
}

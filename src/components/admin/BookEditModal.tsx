import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { adminService, categoryService, getImageUrl, bookMediaService, type BookImageItem } from '@/services/api';
import { compressImageFile } from '@/utils/imageCompressor';
import { CATEGORIES as WEBSITE_CATEGORIES } from '@/data/books';
import {
  Upload,
  Trash2,
  Star,
  FileText,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { AnimatedGlassTabs } from '@/components/common/AnimatedGlassTabs';


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
    publicationDate: book?.publicationDate ? new Date(book.publicationDate).toISOString().slice(0, 7) : '',
    isbn13: book?.isbn13 || '',
    isbn10: book?.isbn10 || '',
    sku: book?.sku || '',
    bookCode: book?.bookCode || '',
    price: book?.price || 0,
    mrp: book?.mrp || 0,
    costPrice: book?.costPrice !== undefined && book?.costPrice !== null ? book.costPrice : '',
    stock: book?.stock || 0,
    reservedStock: book?.reservedStock !== undefined && book?.reservedStock !== null ? book.reservedStock : 0,
    reorderLevel: book?.reorderLevel !== undefined && book?.reorderLevel !== null ? book.reorderLevel : 20,
    warehouse: book?.warehouse || 'Main Warehouse',
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

  // Cloudinary Media Management State
  const [galleryImages, setGalleryImages] = useState<BookImageItem[]>([]);
  const [currentCoverUrl, setCurrentCoverUrl] = useState<string | null>(book?.coverUrl || null);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(book?.previewPdfUrl || null);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  // Staged media for new books or uncommitted files
  const [stagedImages, setStagedImages] = useState<{ id: string; file: File; previewUrl: string }[]>([]);
  const [stagedPdf, setStagedPdf] = useState<File | null>(null);
  const [stagedPdfUrl, setStagedPdfUrl] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Fetch existing gallery images for this book
  useEffect(() => {
    if (book?.id) {
      bookMediaService
        .getImages(book.id)
        .then((res: any) => {
          if (res?.data && Array.isArray(res.data)) {
            setGalleryImages(res.data);
            const cover = res.data.find((img: any) => img.isCover) || res.data[0];
            if (cover) setCurrentCoverUrl(cover.secureUrl);
          }
        })
        .catch((err) => console.error('Failed to load book images:', err));
    }
  }, [book?.id]);

  // Handle Multi-Image Selection from PC
  const handleSelectFilesFromPC = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files || []).slice(0, 8);
    if (!rawFiles.length) return;

    setIsUploadingGallery(true);
    try {
      // 1. Client-side compress all selected images to prevent Nginx 413 / timeout
      const compressedFiles = await Promise.all(rawFiles.map((f) => compressImageFile(f)));

      if (book?.id) {
        let successCount = 0;
        const uploadErrors: string[] = [];

        // 2. Upload images individually so one failure does not break the entire set
        for (let i = 0; i < compressedFiles.length; i++) {
          const file = compressedFiles[i];
          try {
            if ((!currentCoverUrl || currentCoverUrl.includes('placeholder-book.jpg')) && galleryImages.length === 0 && i === 0) {
              await bookMediaService.uploadCover(book.id, file);
            } else {
              await bookMediaService.uploadGallery(book.id, [file]);
            }
            successCount++;
          } catch (err: any) {
            console.error(`Image ${i + 1} upload failed:`, err);
            uploadErrors.push(err.message || `Image ${i + 1} failed`);
          }
        }

        // 3. Refresh live images
        const imgRes = await bookMediaService.getImages(book.id).catch(() => null);
        if (imgRes?.data && Array.isArray(imgRes.data)) {
          setGalleryImages(imgRes.data);
          const cover = imgRes.data.find((img: any) => img.isCover);
          if (cover) setCurrentCoverUrl(cover.secureUrl);
        }

        if (successCount > 0) {
          toast.success(`${successCount} image(s) uploaded successfully!`);
        }
        if (uploadErrors.length > 0) {
          toast.warning(`Note: ${uploadErrors.length} image(s) could not be uploaded: ${uploadErrors[0]}`);
        }
      } else {
        const newStaged = compressedFiles.map((f, i) => ({
          id: `staged-${Date.now()}-${i}`,
          file: f,
          previewUrl: URL.createObjectURL(f),
        }));
        setStagedImages((prev) => [...prev, ...newStaged].slice(0, 8));
        toast.success(`${compressedFiles.length} image(s) selected from PC`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to process images');
    } finally {
      setIsUploadingGallery(false);
      e.target.value = '';
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    if (book?.id) {
      const newItems = [...galleryImages];
      const [moved] = newItems.splice(draggedIndex, 1);
      newItems.splice(dropIndex, 0, moved);

      // The 1st image automatically becomes primary cover
      const updatedWithCover = newItems.map((item, idx) => ({
        ...item,
        isCover: idx === 0,
        sortOrder: idx,
      }));

      setGalleryImages(updatedWithCover);
      if (updatedWithCover[0]) {
        setCurrentCoverUrl(updatedWithCover[0].secureUrl);
      }
      setDraggedIndex(null);

      try {
        await bookMediaService.reorderImages(
          book.id,
          updatedWithCover.map((img) => img.id)
        );
        toast.success(dropIndex === 0 ? 'Image moved to 1st position & set as primary cover!' : 'Image order updated!');
      } catch (err: any) {
        toast.error('Failed to update image order');
      }
    } else {
      const newStaged = [...stagedImages];
      const [moved] = newStaged.splice(draggedIndex, 1);
      newStaged.splice(dropIndex, 0, moved);
      setStagedImages(newStaged);
      setDraggedIndex(null);
      toast.success(dropIndex === 0 ? 'Image moved to 1st position (Primary Cover)!' : 'Image order updated!');
    }
  };

  // Accessible move left/right
  const handleMoveImage = async (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (book?.id) {
      if (targetIndex < 0 || targetIndex >= galleryImages.length) return;
      const newOrder = [...galleryImages];
      const [moved] = newOrder.splice(index, 1);
      newOrder.splice(targetIndex, 0, moved);
      const updatedWithCover = newOrder.map((item, idx) => ({
        ...item,
        isCover: idx === 0,
        sortOrder: idx,
      }));
      setGalleryImages(updatedWithCover);
      if (updatedWithCover[0]) setCurrentCoverUrl(updatedWithCover[0].secureUrl);

      try {
        await bookMediaService.reorderImages(
          book.id,
          updatedWithCover.map((img) => img.id)
        );
        if (targetIndex === 0) {
          toast.success('Moved to 1st position & set as primary cover!');
        }
      } catch (err: any) {
        toast.error('Failed to update image order');
      }
    } else {
      if (targetIndex < 0 || targetIndex >= stagedImages.length) return;
      const newStaged = [...stagedImages];
      const [moved] = newStaged.splice(index, 1);
      newStaged.splice(targetIndex, 0, moved);
      setStagedImages(newStaged);
    }
  };

  // Handle Delete Image
  const handleDeleteImage = async (imageId: string) => {
    if (!book?.id) return;
    try {
      const res = await bookMediaService.deleteImage(book.id, imageId);
      if (res.data?.newCoverUrl !== undefined) {
        setCurrentCoverUrl(res.data.newCoverUrl);
      }
      if (res.data?.remainingImages) {
        setGalleryImages(res.data.remainingImages);
      } else {
        setGalleryImages((prev) => prev.filter((img) => img.id !== imageId));
      }
      toast.success('Image removed from Cloudinary');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete image');
    }
  };

  const handleDeleteStagedImage = (index: number) => {
    setStagedImages((prev) => prev.filter((_, i) => i !== index));
    toast.info('Image removed');
  };

  // Handle Preview PDF Upload
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (book?.id) {
      setIsUploadingPdf(true);
      try {
        const res = await bookMediaService.uploadPdf(book.id, selected);
        setCurrentPdfUrl(res.data.previewPdfUrl);
        toast.success('Preview PDF uploaded successfully!');
      } catch (err: any) {
        toast.error(err.message || 'Failed to upload preview PDF');
      } finally {
        setIsUploadingPdf(false);
        e.target.value = '';
      }
    } else {
      setStagedPdf(selected);
      setStagedPdfUrl(URL.createObjectURL(selected));
      toast.success('Preview PDF selected!');
      e.target.value = '';
    }
  };

  // Handle Preview PDF Delete
  const handleDeletePdf = async () => {
    if (book?.id) {
      if (!confirm('Are you sure you want to remove the preview PDF from this book?')) return;
      try {
        await bookMediaService.deletePdf(book.id);
        setCurrentPdfUrl(null);
        toast.success('Preview PDF removed from Cloudinary');
      } catch (err: any) {
        toast.error(err.message || 'Failed to remove PDF');
      }
    } else {
      setStagedPdf(null);
      setStagedPdfUrl(null);
      toast.info('Preview PDF removed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      if (payload.publicationDate && payload.publicationDate.length === 7) {
        payload.publicationDate = `${payload.publicationDate}-01T00:00:00.000Z`;
      }
      let bookId = book?.id;
      let isNewBook = false;
      if (book?.id) {
        await adminService.updateBook(book.id, payload);
        toast.success(`"${formData.title}" updated successfully!`);
      } else {
        const newBook = await adminService.createBook(payload);
        bookId = (newBook as any)?.data?.id || (newBook as any)?.id;
        isNewBook = true;
        toast.success(`"${formData.title}" created successfully!`);
      }
      
      // Upload staged images / PDF if creating a new book
      if (isNewBook && bookId) {
        const mediaErrors: string[] = [];
        if (stagedImages.length > 0) {
          try {
            await bookMediaService.uploadCover(bookId, stagedImages[0].file);
            if (stagedImages.length > 1) {
              for (let i = 1; i < stagedImages.length; i++) {
                try {
                  await bookMediaService.uploadGallery(bookId, [stagedImages[i].file]);
                } catch (sErr: any) {
                  console.error(`Staged gallery image ${i} error:`, sErr);
                }
              }
            }
          } catch (imgErr: any) {
            console.error('Staged cover image upload error:', imgErr);
            mediaErrors.push(`Images: ${imgErr.message || 'Upload failed'}`);
          }
        }
        if (stagedPdf) {
          try {
            await bookMediaService.uploadPdf(bookId, stagedPdf);
          } catch (pdfErr: any) {
            console.error('Staged PDF upload error:', pdfErr);
            mediaErrors.push(`PDF: ${pdfErr.message || 'Upload failed'}`);
          }
        }

        if (mediaErrors.length > 0) {
          toast.warning(`Book saved, but media upload had issues: ${mediaErrors.join('; ')}`, {
            duration: 6000,
          });
        }
      }

      // Clear draft on successful save
      if (!book?.id) {
        localStorage.removeItem('tw_book_draft_new');
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
          
          {/* Media & Documents (Multi-Image Drag-and-Drop & PDF Preview) */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-800 text-xs">
                  <ImageIcon className="h-3.5 w-3.5" />
                </span>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Book Images & Gallery
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-slate-500">
                  1st image is always the Primary Cover Thumbnail
                </span>
                {currentCoverUrl && (
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Cover Synced
                  </span>
                )}
              </div>
            </div>

            {/* Drag & Drop Multi-Image Selection & Gallery */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800">
                    Book Media & Views ({book?.id ? galleryImages.length : stagedImages.length} images)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Drag and drop images to rearrange. The 1st image automatically serves as the primary cover thumbnail.
                  </p>
                </div>
                <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer transition shadow-2xs shrink-0 self-start sm:self-auto">
                  {isUploadingGallery ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  <span>{isUploadingGallery ? 'Uploading...' : 'Select Images from PC'}</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    disabled={isUploadingGallery}
                    onChange={handleSelectFilesFromPC}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Image Grid or Empty Placeholder */}
              {(book?.id ? galleryImages.length > 0 : stagedImages.length > 0) ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-1">
                  {(book?.id ? galleryImages : stagedImages).map((img: any, idx: number) => {
                    const imgSrc = book?.id ? getImageUrl(img.secureUrl) : img.previewUrl;
                    const isCover = idx === 0 || img.isCover;
                    return (
                      <div
                        key={img.id || idx}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, idx)}
                        className={`group relative rounded-lg border overflow-hidden bg-slate-50 flex flex-col cursor-grab active:cursor-grabbing transition-all select-none ${
                          isCover ? 'border-emerald-500 ring-2 ring-emerald-500/25 shadow-xs' : 'border-slate-200 hover:border-slate-300'
                        } ${draggedIndex === idx ? 'opacity-40 scale-95 border-dashed border-emerald-500' : ''}`}
                      >
                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
                          <img
                            src={imgSrc}
                            alt={`Book view ${idx + 1}`}
                            className="w-full h-full object-cover pointer-events-none"
                          />
                          {isCover ? (
                            <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                              <Star className="h-2.5 w-2.5 fill-current" /> Cover Thumbnail
                            </span>
                          ) : (
                            <span className="absolute top-1 left-1 bg-black/60 text-white text-[9px] font-mono px-1 rounded">
                              #{idx + 1}
                            </span>
                          )}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between p-1 bg-white border-t border-slate-100 text-[10px]">
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              title="Move Left"
                              disabled={idx === 0}
                              onClick={() => handleMoveImage(idx, 'left')}
                              className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 rounded hover:bg-slate-100"
                            >
                              <ChevronLeft className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              title="Move Right"
                              disabled={idx === (book?.id ? galleryImages.length - 1 : stagedImages.length - 1)}
                              onClick={() => handleMoveImage(idx, 'right')}
                              className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 rounded hover:bg-slate-100"
                            >
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>

                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              title="Delete Image"
                              onClick={() => {
                                if (book?.id) {
                                  handleDeleteImage(img.id);
                                } else {
                                  handleDeleteStagedImage(idx);
                                }
                              }}
                              className="p-1 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs flex flex-col items-center justify-center gap-1.5">
                  <ImageIcon className="h-6 w-6 text-slate-300" />
                  <p className="font-semibold text-slate-600">No images selected yet</p>
                  <p className="text-[11px] text-slate-400">
                    Click "Select Images from PC" to pick book photos. You can drag and drop to arrange pages.
                  </p>
                </div>
              )}
            </div>

            {/* Preview PDF Document */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-rose-600" />
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      Sample Chapter / Index PDF
                    </label>
                    <p className="text-[10px] text-slate-400">
                      Upload PDF document to display live preview pages to customers
                    </p>
                  </div>
                </div>

                {(currentPdfUrl || stagedPdfUrl) ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={currentPdfUrl || stagedPdfUrl!}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200"
                    >
                      <ExternalLink className="h-3 w-3" /> Open in New Tab
                    </a>
                    <button
                      type="button"
                      onClick={handleDeletePdf}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md border border-rose-200"
                    >
                      <Trash2 className="h-3 w-3" /> Remove PDF
                    </button>
                  </div>
                ) : null}
              </div>

              {(currentPdfUrl || stagedPdfUrl) ? (
                <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 h-72 sm:h-96 w-full">
                  <iframe
                    src={`${currentPdfUrl || stagedPdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                    className="w-full h-full border-0"
                    title="PDF Sample Pages Preview"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="file"
                    accept="application/pdf"
                    disabled={isUploadingPdf}
                    onChange={handlePdfUpload}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                  />
                  {isUploadingPdf && <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />}
                </div>
              )}
            </div>
          </div>

          
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Book Title *</label>
              <input required name="title" value={formData.title} onChange={handleChange} placeholder="e.g. WBSSC Group C & Group D Cracker" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Publication Month & Year</label>
              <input type="month" name="publicationDate" value={formData.publicationDate || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
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

          {/* Pricing Details */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <span>💰 Pricing & Profit Margins</span>
              </h3>
              {formData.price && formData.costPrice && Number(formData.price) > 0 ? (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${Number(formData.price) >= Number(formData.costPrice) ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                  Profit: ₹{(Number(formData.price) - Number(formData.costPrice)).toFixed(2)} ({Math.round(((Number(formData.price) - Number(formData.costPrice)) / Number(formData.price)) * 100)}% Margin)
                </span>
              ) : null}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (₹) *</label>
                <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Printed MRP (₹) *</label>
                <input required type="number" step="0.01" name="mrp" value={formData.mrp} onChange={handleChange} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cost Price (₹)</label>
                <input type="number" step="0.01" name="costPrice" placeholder="Purchase cost" value={formData.costPrice} onChange={handleChange} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500" />
                <p className="text-[10px] text-slate-400 mt-0.5">Your procurement cost</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Page Count</label>
                <input type="number" name="pages" value={formData.pages || ''} onChange={handleChange} placeholder="e.g. 480" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500" />
              </div>
            </div>
          </div>

          {/* Inventory & Warehouse Management */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <span>📦 Inventory & Stock Thresholds</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Available Stock *</label>
                <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500" />
                <p className="text-[10px] text-slate-400 mt-0.5">Ready for online orders</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reserved Stock</label>
                <input type="number" name="reservedStock" value={formData.reservedStock} onChange={handleChange} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-emerald-500" />
                <p className="text-[10px] text-slate-400 mt-0.5">Held for counter / bulk</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reorder Level</label>
                <input type="number" name="reorderLevel" value={formData.reorderLevel} onChange={handleChange} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-amber-600 outline-none focus:border-emerald-500" />
                <p className="text-[10px] text-slate-400 mt-0.5">Low-stock alert threshold</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Warehouse</label>
                <input name="warehouse" value={formData.warehouse} onChange={handleChange} placeholder="Main Warehouse" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-emerald-500" />
                <p className="text-[10px] text-slate-400 mt-0.5">Physical storage hub</p>
              </div>
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
              <AnimatedGlassTabs
                tabs={[
                  { id: 'edit', label: 'Write / Edit' },
                  { id: 'preview', label: 'Live Preview' },
                ]}
                activeTab={descTab}
                onChange={(id) => setDescTab(id as 'edit' | 'preview')}
                size="sm"
              />
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
          <button onClick={onClose} className="glass-action-button">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="glass-action-button-primary disabled:opacity-50">
            {loading ? 'Saving Book...' : 'Save Book & Description'}
          </button>
        </div>
      </div>
    </div>
  );
}

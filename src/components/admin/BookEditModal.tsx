import React, { useState } from 'react';

import { toast } from 'sonner';
import { adminService } from '@/services/api';

export default function BookEditModal({ book, onClose, onSaved }: { book: any | null, onClose: () => void, onSaved: () => void }) {
  const [formData, setFormData] = useState<any>({
    title: book?.title || '', publicationDate: book?.publicationDate ? new Date(book.publicationDate).toISOString().split('T')[0] : '', isbn13: book?.isbn13 || '', isbn10: book?.isbn10 || '', sku: book?.sku || '', bookCode: book?.bookCode || '',
    price: book?.price || 0, mrp: book?.mrp || 0, stock: book?.stock || 0, pages: book?.pages || 0, description: book?.description || '', 
    publisher: book?.publisherName || book?.publisher || '', authorsList: book?.authorsList || [], subjects: book?.subjects || [], bookType: book?.bookType || '',
    category: book?.categoryName || book?.category || '', tags: book?.tags || []
  });
  
  const [categories, setCategories] = useState<any[]>([]);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  
  React.useEffect(() => {
    // Fetch existing categories (assuming categoryService exists, if not we'll handle gracefully)
    fetch('/api/categories').then(r => r.json()).then(data => {
      if (data?.data) setCategories(data.data);
    }).catch(e => console.error(e));
  }, []);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (field: string, val: string) => {
    const arr = val.split(',').map(s => s.trim()).filter(Boolean);
    setFormData({ ...formData, [field]: arr });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">{book ? 'Edit Book' : 'Add New Book'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="flex gap-6 items-start">
            {file ? (
              <div className="w-24 shrink-0 flex flex-col items-center justify-center p-2 border border-slate-200 rounded-lg bg-slate-50 min-h-32">
                {file.type.startsWith('image/') ? (
                  <img src={URL.createObjectURL(file)} className="w-full h-auto object-cover rounded shadow-sm" alt="Preview" />
                ) : (
                  <span className="text-xs text-center font-bold text-slate-500 overflow-hidden text-ellipsis w-full">{file.name}</span>
                )}
              </div>
            ) : book?.coverUrl ? (
              <div className="w-24 shrink-0">
                <img src={book.coverUrl} className="w-24 h-32 object-cover rounded-lg border border-slate-200 shadow-sm" alt="Cover" />
              </div>
            ) : null}
            <div className="flex-1 space-y-2">
              <label className="block text-xs font-bold text-slate-600">Thumbnail / Cover Image (Image or PDF)</label>
              <input 
                type="file" 
                accept="image/*,application/pdf"
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
              <p className="text-[10px] text-slate-400">Supported formats: JPG, PNG, PDF. (PDFs will be converted/used as cover)</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Title *</label>
              <input required name="title" value={formData.title} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Publication Date</label>
              <input type="date" name="publicationDate" value={formData.publicationDate || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">ISBN-13</label>
              <input name="isbn13" value={formData.isbn13 || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">SKU</label>
              <input name="sku" value={formData.sku || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Book Code</label>
              <input name="bookCode" value={formData.bookCode || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Price *</label>
              <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">MRP *</label>
              <input required type="number" name="mrp" value={formData.mrp} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Stock</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Pages</label>
              <input type="number" name="pages" value={formData.pages || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Description</label>
            <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Authors (comma separated)</label>
              <input value={(formData.authorsList || []).join(', ')} onChange={e => handleArrayChange('authorsList', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Publisher</label>
              <input name="publisher" value={formData.publisher} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Category</label>
              {isAddingNewCategory ? (
                <div className="flex gap-2">
                  <input autoFocus name="category" placeholder="New category name..." value={formData.category} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
                  <button type="button" onClick={() => setIsAddingNewCategory(false)} className="text-slate-400 hover:text-slate-600 px-2 text-xs font-bold">&times;</button>
                </div>
              ) : (
                <select 
                  name="category" 
                  value={formData.category} 
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
                    <option key={c.id} value={c.slug || c.name}>{c.name}</option>
                  ))}
                  <option value="ADD_NEW" className="font-bold text-emerald-600">+ Add New Category...</option>
                </select>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Book Type</label>
              <input name="bookType" value={formData.bookType || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Subjects (comma separated)</label>
              <input value={(formData.subjects || []).join(', ')} onChange={e => handleArrayChange('subjects', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
          </div>
        </form>
        <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
          <button onClick={onClose} className="rounded-lg px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Book'}
          </button>
        </div>
      </div>
    </div>
  );
}

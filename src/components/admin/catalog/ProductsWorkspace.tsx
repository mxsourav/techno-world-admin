import { useState, useEffect } from 'react';
import { adminService } from '@/services/api';
import { formatINR } from '@/utils/helpers';
import { toast } from 'sonner';
import BookEditModal from '@/components/admin/BookEditModal';
import { ActivityLogsModal } from './ActivityLogsModal';
import { Package, Download, Search, Settings2, Trash2, Edit2, Plus, X, AlertCircle, Eye, BarChart2, BookOpen, Check } from 'lucide-react';

export default function ProductsWorkspace() {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewingBook, setViewingBook] = useState<any>(null);
  const [editingBook, setEditingBook] = useState<any>(null);
  const [viewingLogs, setViewingLogs] = useState<any>(null);
  
  // Quick Description Editor state
  const [editingDescId, setEditingDescId] = useState<string | null>(null);
  const [descInput, setDescInput] = useState('');
  const [isSavingDesc, setIsSavingDesc] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAdminCatalog({
        tab: activeTab,
        search,
      });
      // res is ApiResponse: { success, message, data: books[], kpis: {...} }
      setData(res.data || []);
      setKpis((res as any).kpis || {});
    } catch (err) {
      toast.error('Failed to load catalog');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(data.map(d => d.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} selected books?`)) return;
    
    try {
      for (const id of selectedIds) {
        await adminService.deleteBook(id);
      }
      toast.success(`Deleted ${selectedIds.size} books successfully`);
      setSelectedIds(new Set());
      fetchData();
    } catch (err) {
      toast.error('Failed to delete books');
    }
  };

  const handleDeleteAll = async () => {
    const confirmName = window.prompt("Type 'DELETE ALL' to confirm deleting ALL books in the catalog.");
    if (confirmName === 'DELETE ALL') {
      try {
        await adminService.deleteAllBooks();
        toast.success("All books deleted");
        fetchData();
      } catch (err) {
        toast.error("Failed to delete all books");
      }
    }
  };

  const handleSingleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      await adminService.deleteBook(id);
      toast.success("Book deleted successfully");
      fetchData();
      if (viewingBook?.id === id) setViewingBook(null);
    } catch (err) {
      toast.error("Failed to delete book");
    }
  };

  return (
    <div className="flex h-full flex-col space-y-4">
      
      {/* Smart Header */}
      <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between border border-slate-200">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2.5 text-emerald-700">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Products</h1>
              <p className="text-sm font-medium text-slate-500">Manage your catalog & inventory</p>
            </div>
          </div>
          <div className="hidden h-10 w-px bg-slate-200 sm:block" />
          <div className="flex gap-6 text-sm">
            <div className="flex flex-col"><span className="text-slate-500">Total</span><span className="font-bold text-slate-900">{kpis.totalProducts || 0}</span></div>
            <div className="flex flex-col"><span className="text-emerald-600">Active</span><span className="font-bold text-slate-900">{kpis.activeProducts || 0}</span></div>
            <div className="flex flex-col"><span className="text-orange-500">Draft</span><span className="font-bold text-slate-900">{kpis.draftProducts || 0}</span></div>
            <div className="flex flex-col"><span className="text-rose-500">Out of Stock</span><span className="font-bold text-slate-900">{kpis.outOfStockProducts || 0}</span></div>
            <div className="flex flex-col"><span className="text-slate-500">Inventory Value</span><span className="font-bold text-slate-900">{formatINR(kpis.inventoryValue || 0)}</span></div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Download className="h-4 w-4" /> Export
          </button>
          <button onClick={() => setEditingBook({})} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Workspace Tabs & Table */}
      <div className="flex-1 rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="border-b border-slate-200 px-6 py-2">
          <div className="flex gap-6 overflow-x-auto">
            {['all', 'published', 'draft', 'low_stock', 'out_of_stock', 'archived'].map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`border-b-2 py-3 text-sm font-semibold capitalize whitespace-nowrap ${activeTab === t ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
              >
                {t === 'archived' ? 'Inactive' : t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products, ISBN, SKU..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-80 rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Settings2 className="h-4 w-4" /> More Filters
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            {selectedIds.size > 0 && (
              <button onClick={handleDeleteSelected} className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-1.5 text-sm font-bold text-rose-700 hover:bg-rose-100 transition-colors">
                <Trash2 className="h-4 w-4" /> Delete ({selectedIds.size})
              </button>
            )}
            <button onClick={handleDeleteAll} className="flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors">
              <AlertCircle className="h-4 w-4" /> Delete All
            </button>
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto p-0">
          <table className="w-full min-w-[1200px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3 w-12"><input type="checkbox" onChange={handleSelectAll} checked={data.length > 0 && selectedIds.size === data.length} className="rounded border-slate-300" /></th>
                <th className="px-6 py-3">Product Details</th>
                <th className="px-6 py-3">Pricing & Margin</th>
                <th className="px-6 py-3">Inventory</th>
                <th className="px-6 py-3">Sales & Health</th>
                <th className="px-6 py-3">Activity / Logs</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="py-20 text-center text-slate-500">Loading catalog...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={7} className="py-20 text-center text-slate-500">No products found.</td></tr>
              ) : (
                data.map((book) => (
                  <tr key={book.id} onClick={() => setViewingBook(book)} className="hover:bg-slate-50 group cursor-pointer transition-colors">
                    <td className="px-6 py-4 align-top" onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(book.id)} onChange={() => toggleSelect(book.id)} className="rounded border-slate-300" /></td>
                    
                    <td className="px-6 py-4">
                      <div className="flex gap-4">
                        {book.coverUrl ? (
                          <img src={book.coverUrl} className="h-16 w-12 rounded object-cover shadow-sm" alt={book.title} />
                        ) : (
                          <div className="h-16 w-12 rounded bg-slate-100 flex items-center justify-center border border-slate-200 text-xs text-slate-400">No Img</div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1">{book.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{book.categoryName} • {book.publisherName}</div>
                          <div className="flex items-center gap-2 mt-1.5 text-[10px] uppercase font-bold text-slate-400">
                            {book.sku && <span className="rounded bg-slate-100 px-1.5 py-0.5">SKU: {book.sku}</span>}
                            {book.isbn13 && <span>ISBN: {book.isbn13}</span>}
                            {(!book.description || book.description === 'No description provided.' || book.description.trim() === '') ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingBook(book);
                                }}
                                className="rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-amber-700 font-bold hover:bg-amber-100 transition-colors cursor-pointer lowercase"
                              >
                                ⚠️ Add description
                              </button>
                            ) : (
                              <span className="text-emerald-700 font-bold lowercase flex items-center gap-0.5">
                                <Check className="h-2.5 w-2.5" /> Description added
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between w-32"><span className="text-slate-500 text-xs">MRP:</span><span className="font-semibold text-slate-400 line-through">{formatINR(book.mrp)}</span></div>
                        <div className="flex justify-between w-32"><span className="text-slate-500 text-xs">Selling:</span><span className="font-bold text-slate-900">{formatINR(book.price)}</span></div>
                        <div className="flex justify-between w-32 mt-1"><span className="text-slate-500 text-xs">Margin:</span><span className="font-bold text-emerald-600">{book.costPrice ? Math.round(((book.price - book.costPrice) / book.price) * 100) : 0}%</span></div>
                      </div>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex h-2 w-2 rounded-full ${book.stock > 20 ? 'bg-emerald-500' : book.stock > 0 ? 'bg-orange-500' : 'bg-rose-500'}`}></span>
                          <span className="font-bold text-slate-900">{book.stock} units</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Reserved: {book.reservedStock || 0}
                        </div>
                        <div className="text-xs text-slate-400">
                          {book.warehouse || 'Main Warehouse'}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-col gap-2">
                        <div className="text-xs">
                          <span className="text-slate-500">Lifetime Sold: </span>
                          <span className="font-bold text-slate-900">{book.lifetimeSales || 0}</span>
                        </div>
                        <div className="inline-flex items-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${book.health === 'Excellent' ? 'bg-emerald-100 text-emerald-700' : book.health === 'Good' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>
                            {book.health} ({book.healthScore}%)
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-col gap-2">
                        <div className="text-xs">
                          <span className="text-slate-500">Last Updated: </span>
                          <span className="font-bold text-slate-900">{book.updatedAt ? new Date(book.updatedAt).toLocaleDateString() + ' ' + new Date(book.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setViewingLogs(book); }} className="text-left text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1">
                          View Change Logs
                        </button>
                      </div>
                    </td>


                    <td className="px-6 py-4 align-top text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setViewingBook(book)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="View Details"><Eye className="h-4 w-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); setEditingBook(book); }} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded" title="Edit"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={(e) => handleSingleDelete(book.id, e)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded" title="Delete"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Side Drawer */}
      {viewingBook && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity" onClick={() => setViewingBook(null)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Product Details</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditingBook(viewingBook); setViewingBook(null); }} className="rounded-lg bg-emerald-100 text-emerald-700 px-3 py-1.5 text-sm font-bold hover:bg-emerald-200">Edit</button>
                <button onClick={() => setViewingBook(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"><X className="h-5 w-5" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Header Info */}
              <div className="flex gap-6">
                {viewingBook.coverUrl ? (
                  <img src={viewingBook.coverUrl} className="h-32 w-24 rounded-lg object-cover shadow border border-slate-200" alt={viewingBook.title} />
                ) : (
                  <div className="h-32 w-24 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-xs text-center p-2">No Cover Available</div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${viewingBook.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{viewingBook.status}</span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${viewingBook.health === 'Excellent' ? 'bg-emerald-100 text-emerald-700' : viewingBook.health === 'Good' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>Health: {viewingBook.healthScore}%</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">{viewingBook.title}</h3>
                  <p className="text-sm font-semibold text-slate-500 mt-1">{viewingBook.author || 'Unknown Author'}</p>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 text-xs mb-1">ISBN 13</p>
                      <p className="font-mono font-medium text-slate-900">{viewingBook.isbn13 || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs mb-1">SKU</p>
                      <p className="font-mono font-medium text-slate-900">{viewingBook.sku || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart2 className="h-4 w-4 text-slate-400" />
                    <h4 className="font-bold text-slate-800">Pricing</h4>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">MRP</span><span className="font-medium text-slate-400 line-through">{formatINR(viewingBook.mrp)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Selling Price</span><span className="font-bold text-slate-900">{formatINR(viewingBook.price)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Cost Price</span><span className="font-medium text-slate-900">{formatINR(viewingBook.costPrice || 0)}</span></div>
                    <div className="flex justify-between border-t border-slate-100 pt-2"><span className="text-slate-500 font-bold">Margin</span><span className="font-bold text-emerald-600">{viewingBook.costPrice ? Math.round(((viewingBook.price - viewingBook.costPrice) / viewingBook.price) * 100) : 0}%</span></div>
                  </div>
                </div>
                
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="h-4 w-4 text-slate-400" />
                    <h4 className="font-bold text-slate-800">Inventory</h4>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Available</span><span className="font-bold text-slate-900">{viewingBook.stock}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Reserved</span><span className="font-medium text-slate-900">{viewingBook.reservedStock || 0}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Reorder Level</span><span className="font-medium text-amber-600">{viewingBook.reorderLevel || 20}</span></div>
                    <div className="flex justify-between border-t border-slate-100 pt-2"><span className="text-slate-500">Warehouse</span><span className="font-medium text-slate-700">{viewingBook.warehouse || 'Main Warehouse'}</span></div>
                  </div>
                </div>
              </div>

               {/* Performance / Sales */}
              <div className="rounded-xl border border-slate-200 p-4">
                 <h4 className="font-bold text-slate-800 mb-4">Performance</h4>
                 <div className="grid grid-cols-3 gap-4">
                   <div className="text-center p-3 bg-slate-50 rounded-lg">
                     <p className="text-xs text-slate-500 mb-1">Lifetime Sold</p>
                     <p className="text-lg font-extrabold text-emerald-700">{viewingBook.lifetimeSales || 0}</p>
                   </div>
                   <div className="text-center p-3 bg-slate-50 rounded-lg">
                     <p className="text-xs text-slate-500 mb-1">In Cart</p>
                     <p className="text-lg font-extrabold text-blue-700">12</p>
                   </div>
                   <div className="text-center p-3 bg-slate-50 rounded-lg">
                     <p className="text-xs text-slate-500 mb-1">Wishlisted</p>
                     <p className="text-lg font-extrabold text-rose-700">45</p>
                   </div>
                 </div>
              </div>

              {/* Book Description & Syllabus Card with 1-Click Quick Editor */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-emerald-600" />
                    <h4 className="font-bold text-slate-800">Book Description & Syllabus</h4>
                  </div>
                  {editingDescId !== viewingBook.id ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDescId(viewingBook.id);
                        setDescInput(viewingBook.description || '');
                      }}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="h-3 w-3" /> Edit Description
                    </button>
                  ) : null}
                </div>

                {editingDescId === viewingBook.id ? (
                  <div className="space-y-2">
                    <textarea
                      rows={6}
                      value={descInput}
                      onChange={(e) => setDescInput(e.target.value)}
                      placeholder="Enter comprehensive book description, syllabus, chapters outline, and exam features..."
                      className="w-full rounded-lg border border-slate-300 p-3 text-xs leading-relaxed outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-sans"
                    />
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">
                        {descInput.length} characters
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingDescId(null)}
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isSavingDesc}
                          onClick={async () => {
                            setIsSavingDesc(true);
                            try {
                              await adminService.updateBook(viewingBook.id, { description: descInput });
                              toast.success('Book description updated successfully!');
                              setViewingBook({ ...viewingBook, description: descInput });
                              setEditingDescId(null);
                              fetchData();
                            } catch (err: any) {
                              toast.error(err.message || 'Failed to update description');
                            } finally {
                              setIsSavingDesc(false);
                            }
                          }}
                          className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {isSavingDesc ? 'Saving...' : 'Save Description'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100 text-xs text-slate-700 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap">
                    {viewingBook.description && viewingBook.description.trim() !== '' && viewingBook.description !== 'No description provided.' ? (
                      viewingBook.description
                    ) : (
                      <div className="text-center py-3">
                        <p className="text-slate-400 italic text-xs mb-2">No description provided yet for this book.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDescId(viewingBook.id);
                            setDescInput('');
                          }}
                          className="rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 text-xs font-bold hover:bg-emerald-100"
                        >
                          + Add Description Now
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {editingBook && (
        <BookEditModal
          book={Object.keys(editingBook).length === 0 ? null : editingBook}
          onClose={() => setEditingBook(null)}
          onSaved={() => {
            setEditingBook(null);
            fetchData();
          }}
        />
      )}

      {/* Activity Logs Modal */}
      {viewingLogs && (
        <ActivityLogsModal 
          bookId={viewingLogs.id} 
          bookTitle={viewingLogs.title} 
          onClose={() => setViewingLogs(null)} 
        />
      )}

    </div>
  );
}

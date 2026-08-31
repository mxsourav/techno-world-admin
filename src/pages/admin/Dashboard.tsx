import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { BookOpen, Plus, Search, ShoppingCart, Users, Download, IndianRupee, AlertCircle, Pause, Play, Trash2, Edit3 } from 'lucide-react';
import { formatINR } from '@/utils/helpers';
import type { Book } from '@/types/index';
import { adminService, bookService, categoryService, orderService, mediaService, cmsService, promotionService } from '@/services/api';
import { toast } from 'sonner';
import PromotionEditModal from '@/components/admin/PromotionEditModal';
import ProductsWorkspace from '@/components/admin/catalog/ProductsWorkspace';

export default function Dashboard() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get('tab') || 'dashboard';


  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importAnalysis, setImportAnalysis] = useState<any>(null);
  


  const [stats, setStats] = useState({ 
    revenue: 0, totalOrders: 0, aov: 0, lowStock: 0, 
    totalBooks: 0, outOfStock: 0, totalUsers: 0 
  });
  const [categories, setCategories] = useState<any[]>([]);

  const [lowStockBooks, setLowStockBooks] = useState<Book[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [cmsSections, setCmsSections] = useState<any[]>([]);
  const [cmsEditing, setCmsEditing] = useState<Record<string, any>>({});  const [isUploading, setIsUploading] = useState(false);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [editingPromotion, setEditingPromotion] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);



  useEffect(() => {
    if (tab === 'dashboard') {
      adminService.getStats().then(res => setStats(res.data)).catch(console.error);
      categoryService.getCategories().then(res => setCategories(res.data)).catch(console.error);
      bookService.getBooks({ limit: 6 }).then(res => setLowStockBooks(res.data)).catch(console.error);
    }
  }, [tab]);


  useEffect(() => {
    if (tab === 'orders') {
      orderService.getAllOrders().then(res => setOrders(res.data)).catch(console.error);
    }
  }, [tab]);

  useEffect(() => {
    if (tab === 'media') {
      mediaService.list().then(res => setMediaItems(res.data)).catch(console.error);
    }
  }, [tab]);

  useEffect(() => {
    if (tab === 'cms') {
      cmsService.getSections().then(res => {
        setCmsSections(res.data);
        const editing: Record<string, any> = {};
        for (const s of res.data) editing[s.sectionKey] = s.configData;
        setCmsEditing(editing);
      }).catch(console.error);
    }
  }, [tab]);

  useEffect(() => {
    if (tab === 'coupons') {
      promotionService.getAll().then(res => setPromotions(res.data)).catch(console.error);
    }
  }, [tab]);

  const saveCmsSection = async (key: string) => {
    try {
      await cmsService.updateSection(key, { configData: cmsEditing[key] });
      toast.success(`"${key}" saved!`);
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    }
  };

  const toggleCmsSection = async (key: string) => {
    try {
      const res = await cmsService.toggleSection(key);
      setCmsSections(s => s.map(sec => sec.sectionKey === key ? { ...sec, isEnabled: res.data.isEnabled } : sec));
      toast.success(res.message);
    } catch (err: any) {
      toast.error(err.message || 'Toggle failed');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const res = await adminService.analyzeImport(file);
      setImportAnalysis({ ...res.data, file, filename: file.name });
      setIsImportModalOpen(true);
    } catch (err: any) {
      toast.error(err.message || 'Analysis failed');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExecuteImport = async () => {
    if (!importAnalysis) return;
    setIsImporting(true);
    try {
      const res = await adminService.executeImport({
        filename: importAnalysis.filename,
        toAdd: importAnalysis.toAdd,
        toUpdate: importAnalysis.toUpdate,
        newCategories: importAnalysis.newCategories,
        newAuthors: importAnalysis.newAuthors,
        newPublishers: importAnalysis.newPublishers,
        warnings: importAnalysis.warnings,
        strategy: 'SKIP', // or OVERWRITE
      });
      toast.success(`Import success! Added: ${(res as any).recordsAdded}, Updated: ${(res as any).recordsUpdated}, Skipped: ${(res as any).recordsSkipped}`);
      setImportResult(res);
      setImportAnalysis(null);
    } catch (err: any) {
      toast.error(err.message || 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const getStock = (_id: string, def: number) => def;

  const downloadErrorsCsv = () => {
    if (!importResult?.errors?.length) return;
    const csvContent = "data:text/csv;charset=utf-8," 
        + "Row,Error Message\n" 
        + importResult.errors.map((e: any) => `${e.row},"${e.message.replace(/"/g, '""')}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "import_errors.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await orderService.updateStatus(id, status);
      toast.success(`Order ${id} updated to ${status}`);
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    } catch (err) {
      toast.error('Failed to update status');
    }
  };


  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 capitalize">{tab.replace('-', ' ')}</h1>
        {['dashboard', 'products', 'inventory'].includes(tab) && (
          <>
            <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.xlsx" onChange={handleFileUpload} />
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors">
              <Plus className="h-3.5 w-3.5" /> Bulk CSV Import
            </button>
          </>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {tab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { icon: IndianRupee, t: 'Revenue (30d)', v: formatINR(stats.revenue), s: '+18.2% vs last month', c: 'emerald' },
                { icon: ShoppingCart, t: 'Orders (30d)', v: (stats.totalOrders || 0).toLocaleString('en-IN'), s: '+12.4% vs last month', c: 'blue' },
                { icon: BookOpen, t: 'Total Books', v: stats.totalBooks || 0, s: `${stats.outOfStock} out of stock`, c: 'amber' },
                { icon: Users, t: 'Total Users', v: stats.totalUsers || 0, s: 'Active base', c: 'violet' },
              ].map((k) => (
                <div key={k.t} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <k.icon className="h-5 w-5 text-emerald-700" />
                  <p className="mt-3 text-2xl font-extrabold text-slate-900">{k.v}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{k.t}</p>
                  <p className="mt-1 text-xs font-medium text-emerald-600">{k.s}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main Column */}
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-sm font-bold text-slate-800">Recent Orders</p>
                    <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700">View All</button>
                  </div>
                  <div className="space-y-4">
                    {((stats as any).recentOrders || []).map((o: any) => (
                      <div key={o.id} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{o.orderNumber}</p>
                          <p className="text-xs text-slate-500 mt-1">{o.user?.name || 'Guest'} · {o.items?.length || 0} items</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900 text-sm">{formatINR(o.totalAmount)}</p>
                          <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${o.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {!(stats as any).recentOrders?.length && <p className="text-sm text-slate-500">No recent orders found.</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="mb-4 text-sm font-bold text-slate-800">Top Categories</p>
                    {categories.slice(0, 5).map((c, i) => {
                      const pct = [92, 78, 64, 55, 41][i] || Math.floor(Math.random() * 50) + 10;
                      return (
                        <div key={c.slug} className="mb-3.5 last:mb-0">
                          <div className="flex justify-between text-xs mb-1.5"><span className="font-semibold text-slate-700">{c.name}</span><span className="text-slate-500 font-medium">{pct}%</span></div>
                          <div className="h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} /></div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="mb-4 text-sm font-bold text-slate-800">Coupon Usage & Marketing</p>
                    <div className="flex flex-col h-full justify-center text-center text-sm text-slate-500 p-4 border-2 border-dashed border-slate-100 rounded-lg">
                      <p className="font-medium text-slate-600 mb-1">Coupon System Pending</p>
                      <p className="text-xs">Analytics will appear here once the coupon module is fully implemented.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Column */}
              <div className="space-y-6">
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-rose-800 flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Low Stock Alerts</p>
                    <span className="bg-rose-200 text-rose-800 text-xs font-bold px-2 py-0.5 rounded-full">{stats.lowStock || 0}</span>
                  </div>
                  <div className="space-y-3">
                    {lowStockBooks.map((b) => (
                      <div key={b.id} className="flex flex-col border-b border-rose-200/50 pb-3 text-sm last:border-0 last:pb-0">
                        <span className="line-clamp-2 font-medium text-rose-900 leading-tight">{b.title}</span>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="font-mono text-xs text-rose-700">{b.isbn || 'No ISBN'}</span>
                          <span className="shrink-0 rounded bg-white px-2 py-0.5 text-xs font-bold text-rose-700 shadow-sm">
                            {getStock(b.id, b.stock)} left
                          </span>
                        </div>
                      </div>
                    ))}
                    {lowStockBooks.length === 0 && <p className="text-xs text-rose-600">All stock levels are healthy.</p>}
                  </div>
                  <button className="w-full mt-4 bg-white border border-rose-200 text-rose-700 text-xs font-bold py-2 rounded-lg hover:bg-rose-100 transition-colors">
                    Manage Inventory
                  </button>
                </div>
                
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="mb-4 text-sm font-bold text-slate-800">Latest Reviews</p>
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-slate-800">Great Quality</span>
                        <span className="text-amber-500 text-xs tracking-wider">★★★★★</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">"The book arrived in perfect condition and the content is exactly what I needed for my exams."</p>
                    </div>
                    <div className="border-b border-slate-100 pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-slate-800">Fast Delivery</span>
                        <span className="text-amber-500 text-xs tracking-wider">★★★★☆</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">"Delivered within 2 days. The packaging could be slightly better but overall good."</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'products' && <ProductsWorkspace />}
        {tab === 'orders' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="mb-6 text-sm font-bold text-slate-800">Order Management</p>
            {orders.length === 0 ? (
              <p className="text-sm text-slate-500">No customer orders yet.</p>
            ) : (
              <div className="space-y-3">
                {orders.map((o) => (
                  <div key={o.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 p-4 text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 text-base mb-1">{o.orderNumber} <span className="mx-2 text-slate-300">|</span> {formatINR(o.totalAmount)}</p>
                      <p className="text-slate-500">{o.user?.name || 'Guest'} · <span className="font-medium">{o.paymentMethod}</span></p>
                    </div>
                    <select value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20">
                      {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'reviews' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="mb-6 text-sm font-bold text-slate-800">Review Moderation</p>
            <div className="space-y-4">
              {[{ id: 1, title: 'Great read', book: 'Atomic Habits', rating: 5, body: 'Very helpful.' }, { id: 2, title: 'Too lengthy', book: 'UPSC Polity', rating: 3, body: 'Very informative but too long.' }].map((r) => (
                <div key={r.id} className="rounded-xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-base font-bold text-slate-900">{r.title}</p>
                      <p className="text-sm text-slate-500 mt-0.5">on <span className="font-medium text-slate-700">{r.book}</span></p>
                    </div>
                    <span className="text-sm font-bold text-amber-500 tracking-widest">{'★'.repeat(r.rating)}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">{r.body}</p>
                  <div className="mt-4 flex gap-3">
                    <button className="rounded-lg bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-700">Approve</button>
                    <button className="rounded-lg bg-rose-50 px-4 py-1.5 text-sm font-bold text-rose-700">Flag</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'media' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm font-bold text-slate-800">Media Library</p>
              <label className={`flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white cursor-pointer hover:bg-emerald-800 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                <Plus className="h-4 w-4" />
                <input type="file" multiple className="hidden" onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  if (!files.length) return;
                  setIsUploading(true);
                  try {
                    for (const file of files) {
                      await mediaService.upload(file, 'general');
                    }
                    toast.success(`${files.length} files uploaded`);
                    const res = await mediaService.list();
                    setMediaItems(res.data);
                  } catch(err) {
                    toast.error('Upload failed');
                  } finally {
                    setIsUploading(false);
                  }
                }} />
                {isUploading ? 'Uploading...' : 'Upload Files'}
              </label>
            </div>
            {mediaItems.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">No media files found. Upload some!</div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {mediaItems.map(m => (
                  <div key={m.id} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {m.type === 'image' ? (
                      <img src={m.url} alt={m.altText || m.filename} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center text-slate-400 p-2 text-center">
                        <BookOpen className="h-8 w-8 mb-2" />
                        <span className="text-xs font-medium break-all line-clamp-2">{m.filename}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-2">
                      <button onClick={() => window.open(m.url, '_blank')} className="rounded bg-white/20 p-2 text-white hover:bg-white/40"><Search className="h-4 w-4" /></button>
                      <button onClick={async () => {
                        if(confirm('Delete this file?')) {
                          try {
                            await mediaService.delete(m.id);
                            setMediaItems(items => items.filter(i => i.id !== m.id));
                            toast.success('Deleted');
                          } catch(err) { toast.error('Failed to delete'); }
                        }
                      }} className="rounded bg-rose-500/80 p-2 text-white hover:bg-rose-500"><AlertCircle className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'cms' && (
          <div className="space-y-5">
            <p className="text-sm text-slate-500">Edit homepage sections without touching code. Toggle sections on/off, update text, and save.</p>
            {cmsSections.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">No CMS sections found. Run the seed script first.</div>
            ) : (
              cmsSections.map(section => {
                const cfg = cmsEditing[section.sectionKey] || {};
                const updateField = (field: string, value: any) => {
                  setCmsEditing(prev => ({
                    ...prev,
                    [section.sectionKey]: { ...prev[section.sectionKey], [field]: value },
                  }));
                };
                return (
                  <div key={section.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`h-2.5 w-2.5 rounded-full ${section.isEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <h3 className="text-sm font-bold text-slate-800">{section.title || section.sectionKey}</h3>
                        <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{section.sectionKey}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleCmsSection(section.sectionKey)} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${section.isEnabled ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                          {section.isEnabled ? 'Enabled' : 'Disabled'}
                        </button>
                        <button onClick={() => saveCmsSection(section.sectionKey)} className="rounded-lg bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors">
                          Save
                        </button>
                      </div>
                    </div>
                    <div className="p-5 space-y-4">
                      {section.sectionKey === 'hero_banner' && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Headline</label>
                            <input value={cfg.headline || ''} onChange={e => updateField('headline', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Subtext</label>
                            <textarea value={cfg.subtext || ''} onChange={e => updateField('subtext', e.target.value)} rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">CTA Text</label>
                              <input value={cfg.ctaText || ''} onChange={e => updateField('ctaText', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">CTA Link</label>
                              <input value={cfg.ctaLink || ''} onChange={e => updateField('ctaLink', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                          </div>
                        </>
                      )}
                      {section.sectionKey === 'flash_sale' && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Headline</label>
                            <input value={cfg.headline || ''} onChange={e => updateField('headline', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Subtext</label>
                            <input value={cfg.subtext || ''} onChange={e => updateField('subtext', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">End Date</label>
                              <input type="datetime-local" value={cfg.endDate ? new Date(cfg.endDate).toISOString().slice(0, 16) : ''} onChange={e => updateField('endDate', new Date(e.target.value).toISOString())} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">Badge Text</label>
                              <input value={cfg.badgeText || ''} onChange={e => updateField('badgeText', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                          </div>
                        </>
                      )}
                      {section.sectionKey === 'featured_books' && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Section Title</label>
                            <input value={cfg.sectionTitle || ''} onChange={e => updateField('sectionTitle', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Max Books to Display</label>
                            <input type="number" value={cfg.maxDisplay || 10} onChange={e => updateField('maxDisplay', parseInt(e.target.value) || 10)} className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                          </div>
                          <p className="text-xs text-slate-400">Featured books are auto-selected from the catalog based on bestseller and trending flags.</p>
                        </>
                      )}
                      {section.sectionKey === 'testimonials' && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Section Title</label>
                            <input value={cfg.sectionTitle || ''} onChange={e => updateField('sectionTitle', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                          </div>
                          <div className="space-y-3">
                            {(cfg.items || []).map((item: any, idx: number) => (
                              <div key={idx} className="rounded-lg border border-slate-200 p-3 space-y-2">
                                <div className="grid grid-cols-2 gap-3">
                                  <input value={item.name} onChange={e => {
                                    const items = [...(cfg.items || [])];
                                    items[idx] = { ...items[idx], name: e.target.value };
                                    updateField('items', items);
                                  }} placeholder="Name" className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none" />
                                  <input type="number" min={1} max={5} value={item.rating} onChange={e => {
                                    const items = [...(cfg.items || [])];
                                    items[idx] = { ...items[idx], rating: parseInt(e.target.value) || 5 };
                                    updateField('items', items);
                                  }} placeholder="Rating" className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none w-20" />
                                </div>
                                <textarea value={item.text} onChange={e => {
                                  const items = [...(cfg.items || [])];
                                  items[idx] = { ...items[idx], text: e.target.value };
                                  updateField('items', items);
                                }} rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none resize-none" />
                                <button onClick={() => {
                                  const items = (cfg.items || []).filter((_: any, i: number) => i !== idx);
                                  updateField('items', items);
                                }} className="text-xs font-bold text-rose-600 hover:text-rose-700">Remove</button>
                              </div>
                            ))}
                            <button onClick={() => {
                              const items = [...(cfg.items || []), { name: '', text: '', rating: 5 }];
                              updateField('items', items);
                            }} className="rounded-lg border-2 border-dashed border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 hover:border-emerald-300 hover:text-emerald-700 transition-colors w-full">
                              + Add Testimonial
                            </button>
                          </div>
                        </>
                      )}
                      {section.sectionKey === 'sale_banner' && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Headline</label>
                            <input value={cfg.headline || ''} onChange={e => updateField('headline', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">CTA Text</label>
                              <input value={cfg.ctaText || ''} onChange={e => updateField('ctaText', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">CTA Link</label>
                              <input value={cfg.ctaLink || ''} onChange={e => updateField('ctaLink', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">Background Color</label>
                              <div className="flex items-center gap-2">
                                <input type="color" value={cfg.bgColor || '#065f46'} onChange={e => updateField('bgColor', e.target.value)} className="h-9 w-9 rounded cursor-pointer" />
                                <input value={cfg.bgColor || '#065f46'} onChange={e => updateField('bgColor', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-emerald-500/20" />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      {section.sectionKey === 'promo-banners' && (
                        <>
                          <div className="space-y-4">
                            <p className="text-xs text-slate-500 mb-2">Manage your promotional banners here. They will appear on the homepage below the hero section.</p>
                            {(cfg.banners || []).map((banner: any, idx: number) => (
                              <div key={idx} className="rounded-lg border border-slate-200 p-4 space-y-3 bg-slate-50 relative">
                                <div className="absolute top-3 right-3 flex gap-2">
                                  <button onClick={() => {
                                    const banners = [...(cfg.banners || [])];
                                    banners[idx] = { ...banners[idx], isActive: !banners[idx].isActive };
                                    updateField('banners', banners);
                                  }} className={`text-xs font-bold px-2 py-1 rounded ${banner.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                    {banner.isActive ? 'Active' : 'Inactive'}
                                  </button>
                                  <button onClick={() => {
                                    const banners = (cfg.banners || []).filter((_: any, i: number) => i !== idx);
                                    updateField('banners', banners);
                                  }} className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-100 px-2 py-1 rounded">Remove</button>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 pt-6">
                                  <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Image URL</label>
                                    <input value={banner.imageUrl || ''} onChange={e => {
                                      const banners = [...(cfg.banners || [])];
                                      banners[idx] = { ...banners[idx], imageUrl: e.target.value };
                                      updateField('banners', banners);
                                    }} placeholder="/banners/example.jpg" className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none" />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Link URL</label>
                                    <input value={banner.linkUrl || ''} onChange={e => {
                                      const banners = [...(cfg.banners || [])];
                                      banners[idx] = { ...banners[idx], linkUrl: e.target.value };
                                      updateField('banners', banners);
                                    }} placeholder="/category/engineering" className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none" />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Alt Text</label>
                                    <input value={banner.altText || ''} onChange={e => {
                                      const banners = [...(cfg.banners || [])];
                                      banners[idx] = { ...banners[idx], altText: e.target.value };
                                      updateField('banners', banners);
                                    }} placeholder="Engineering Books Offer" className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none" />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-xs font-bold text-slate-600 mb-1">Start Date (Optional)</label>
                                      <input type="datetime-local" value={banner.startDate ? new Date(banner.startDate).toISOString().slice(0, 16) : ''} onChange={e => {
                                        const banners = [...(cfg.banners || [])];
                                        banners[idx] = { ...banners[idx], startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined };
                                        updateField('banners', banners);
                                      }} className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none" />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-bold text-slate-600 mb-1">End Date (Optional)</label>
                                      <input type="datetime-local" value={banner.endDate ? new Date(banner.endDate).toISOString().slice(0, 16) : ''} onChange={e => {
                                        const banners = [...(cfg.banners || [])];
                                        banners[idx] = { ...banners[idx], endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined };
                                        updateField('banners', banners);
                                      }} className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <button onClick={() => {
                              const banners = [...(cfg.banners || []), { id: Date.now().toString(), imageUrl: '', linkUrl: '', altText: '', isActive: true }];
                              updateField('banners', banners);
                            }} className="rounded-lg border-2 border-dashed border-slate-200 px-4 py-3 text-xs font-bold text-slate-500 hover:border-emerald-300 hover:text-emerald-700 transition-colors w-full">
                              + Add Banner
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Promotions & Campaigns</h2>
                <p className="text-sm text-slate-500">Create and manage your promotional rules and discount codes</p>
              </div>
              <button onClick={() => setEditingPromotion({})} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors">
                <Plus className="h-3.5 w-3.5" /> New Promotion
              </button>
            </div>
            
            <div className="rounded-2xl border border-slate-100 bg-white p-1">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Name / Code</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Value</th>
                      <th className="px-6 py-4">Limit</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {promotions.map((promo) => {
                      const isActive = promo.status === 'ACTIVE';
                      const isPaused = promo.status === 'PAUSED';
                      return (
                        <tr key={promo.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">{promo.name}</div>
                            {promo.code && <div className="font-mono text-xs text-slate-500 mt-1 font-semibold">{promo.code}</div>}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {promo.promotionType || 'UNIVERSAL'}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900">
                            {promo.discountType === 'FIXED' ? formatINR(promo.discountValue) : promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}%` : 'Free Shipping'}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                            {promo.usageLimit ? `${promo.usedCount || 0} / ${promo.usageLimit}` : 'Unlimited'}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                                isActive 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                  : isPaused 
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : isPaused ? 'bg-amber-500' : 'bg-slate-400'}`} />
                              {isActive ? 'Live' : isPaused ? 'Paused' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isActive ? (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await promotionService.toggleActive(promo.id, 'PAUSED');
                                      const res = await promotionService.getAll();
                                      setPromotions(res.data);
                                      toast.success(`Coupon "${promo.name}" paused / snoozed`);
                                    } catch (e) {
                                      toast.error('Failed to pause promotion');
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                                  title="Pause / Snooze this code"
                                >
                                  <Pause className="h-3 w-3" /> Snooze
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await promotionService.toggleActive(promo.id, 'ACTIVE');
                                      const res = await promotionService.getAll();
                                      setPromotions(res.data);
                                      toast.success(`Coupon "${promo.name}" is now live!`);
                                    } catch (e) {
                                      toast.error('Failed to activate promotion');
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                                  title="Activate and make code live"
                                >
                                  <Play className="h-3 w-3" /> Go Live
                                </button>
                              )}
                              
                              <button 
                                onClick={() => setEditingPromotion(promo)} 
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                title="Edit promotion details"
                              >
                                <Edit3 className="h-3 w-3" /> Edit
                              </button>

                              <button 
                                onClick={async () => {
                                  if (confirm(`Are you sure you want to delete "${promo.name}"?`)) {
                                    try {
                                      await promotionService.remove(promo.id);
                                      const res = await promotionService.getAll();
                                      setPromotions(res.data);
                                      toast.success('Promotion deleted successfully');
                                    } catch (e) {
                                      toast.error('Failed to delete promotion');
                                    }
                                  }
                                }} 
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Delete coupon"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {promotions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                          No promotions found. Create one to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {editingPromotion && (
        <PromotionEditModal
          promotion={editingPromotion}
          onClose={() => setEditingPromotion(null)}
          onSuccess={() => {
            setEditingPromotion(null);
            promotionService.getAll().then(res => setPromotions(res.data));
          }}
        />
      )}

      {isImportModalOpen && importAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Import Analysis</h2>
            <p className="text-sm text-slate-500 mb-6">Review the file <span className="font-mono">{importAnalysis.filename}</span> before executing.</p>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">To Add</p>
                <p className="text-2xl font-extrabold text-emerald-900">{importAnalysis.toAdd.length}</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">To Update</p>
                <p className="text-2xl font-extrabold text-blue-900">{importAnalysis.toUpdate.length}</p>
              </div>
              <div className="rounded-xl bg-rose-50 p-4 border border-rose-100">
                <p className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">Errors</p>
                <p className="text-2xl font-extrabold text-rose-900">{importAnalysis.errors.length}</p>
              </div>
            </div>

            {importAnalysis.errors.length > 0 && (
              <div className="mb-6 rounded-xl border border-rose-200 bg-white">
                <div className="border-b border-rose-100 bg-rose-50/50 px-4 py-3 font-semibold text-rose-800">Errors found</div>
                <div className="max-h-40 overflow-y-auto p-2">
                  {importAnalysis.errors.map((e: any, i: number) => (
                    <div key={i} className="px-2 py-1.5 text-sm text-slate-700 border-b border-slate-50 last:border-0"><span className="font-mono text-xs mr-2 text-rose-600">Row {e.row}</span>{e.message}</div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button disabled={isImporting} onClick={() => setIsImportModalOpen(false)} className="rounded-lg px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
              <button disabled={isImporting || (importAnalysis.toAdd.length === 0 && importAnalysis.toUpdate.length === 0)} onClick={handleExecuteImport} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50">
                {isImporting ? 'Importing...' : 'Confirm Import'}
              </button>
            </div>
          </div>
        </div>
      )}
      {isImportModalOpen && importResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <AlertCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-900">Import Complete</h2>
            <p className="mb-6 text-sm text-slate-500">The catalog has been successfully updated.</p>

            <div className="mb-6 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-2xl font-extrabold text-slate-800">{importResult.recordsAdded}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">Added</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-2xl font-extrabold text-slate-800">{importResult.recordsUpdated}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">Updated</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-2xl font-extrabold text-slate-800">{importResult.recordsSkipped}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">Skipped</p>
              </div>
            </div>

            {importResult.errors?.length > 0 && (
              <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4">
                <p className="text-sm font-bold text-rose-800 mb-2">{importResult.errors.length} Errors encountered</p>
                <button onClick={downloadErrorsCsv} className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm transition-colors">
                  <Download className="h-4 w-4" /> Download Error Report
                </button>
              </div>
            )}

            <button onClick={() => { setIsImportModalOpen(false); setImportResult(null); }} className="w-full rounded-lg bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm">
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

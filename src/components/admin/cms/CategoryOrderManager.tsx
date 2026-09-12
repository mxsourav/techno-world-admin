import React, { useState, useEffect, useMemo } from 'react';
import {
  GripVertical,
  ArrowUpDown,
  RotateCcw,
  Save,
  Search,
  BookOpen,
  Eye,
  Sparkles,
  Smartphone,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
} from 'lucide-react';
import { categoryService } from '@/services/api';
import { toast } from 'sonner';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  _count?: {
    books?: number;
  };
}

export const CategoryOrderManager: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [originalCategories, setOriginalCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');

  // Load categories from database
  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getAllAdminCategories();
      const items: CategoryItem[] = res.data || [];
      const sorted = [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      setCategories(sorted);
      setOriginalCategories(sorted);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
      try {
        const res = await categoryService.getCategories();
        const items: CategoryItem[] = res.data || [];
        const sorted = [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        setCategories(sorted);
        setOriginalCategories(sorted);
      } catch (fallbackErr) {
        toast.error('Failed to load categories from database.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Detect if there are unsaved changes
  const hasChanges = useMemo(() => {
    if (categories.length !== originalCategories.length) return true;
    for (let i = 0; i < categories.length; i++) {
      if (categories[i].id !== originalCategories[i]?.id) return true;
    }
    return false;
  }, [categories, originalCategories]);

  // Move category item by offset (e.g. -1 for up, +1 for down)
  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newCategories = [...categories];
    const [moved] = newCategories.splice(index, 1);
    newCategories.splice(targetIndex, 0, moved);
    setCategories(newCategories);
  };

  // Move directly to top (#1 position)
  const moveToTop = (index: number) => {
    if (index === 0) return;
    const newCategories = [...categories];
    const [moved] = newCategories.splice(index, 1);
    newCategories.unshift(moved);
    setCategories(newCategories);
    toast.info(`Moved "${moved.name}" to Top (#1)`);
  };

  // Move directly to bottom
  const moveToBottom = (index: number) => {
    if (index === categories.length - 1) return;
    const newCategories = [...categories];
    const [moved] = newCategories.splice(index, 1);
    newCategories.push(moved);
    setCategories(newCategories);
    toast.info(`Moved "${moved.name}" to Bottom`);
  };

  // One-click Alphabetical sort (A to Z)
  const sortAlphabetically = () => {
    const sorted = [...categories].sort((a, b) =>
      a.name.trim().localeCompare(b.name.trim(), undefined, { sensitivity: 'base' })
    );
    setCategories(sorted);
    toast.success('Categories arranged in Alphabetical Order (A → Z). Click Save to apply.');
  };

  // Preset: Put Competitive Exam at the top (Joydaa's specific request)
  const moveCompetitiveToTop = () => {
    const compIndex = categories.findIndex(
      (c) =>
        c.name.toLowerCase().includes('competitive') ||
        c.slug.toLowerCase().includes('competitive')
    );
    if (compIndex > -1) {
      moveToTop(compIndex);
      toast.success('Moved "Competitive Exam" to top!');
    } else {
      toast.error('Competitive Exam category not found.');
    }
  };

  // Revert back to original saved order
  const resetOrder = () => {
    setCategories([...originalCategories]);
    toast.info('Reverted to saved order.');
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    if (e.dataTransfer.setDragImage && e.currentTarget) {
      e.dataTransfer.setDragImage(e.currentTarget, 20, 20);
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newCategories = [...categories];
    const [draggedItem] = newCategories.splice(draggedIndex, 1);
    newCategories.splice(dropIndex, 0, draggedItem);

    setCategories(newCategories);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Save new order to backend
  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      const categoryIds = categories.map((c) => c.id);
      await categoryService.reorderCategories(categoryIds);
      setOriginalCategories([...categories]);
      toast.success('Category order saved successfully! The storefront menu has been updated.');
    } catch (err: any) {
      console.error('Failed to save category order:', err);
      toast.error(err?.message || 'Failed to save category order. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Filtered categories for searching/locating
  const filteredCategoriesWithIndex = useMemo(() => {
    return categories
      .map((item, originalIdx) => ({ item, originalIdx }))
      .filter(({ item }) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q);
      });
  }, [categories, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              <ArrowUpDown className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Category Order & Menu Positions</span>
                {hasChanges && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-full animate-pulse">
                    Unsaved Changes
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Change the positions of category buttons via drag-and-drop, Up/Down buttons, or one-click Alphabetical sort.
              </p>
            </div>
          </div>
        </div>

        {/* Global Control Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Alphabetical Sort Button */}
          <button
            type="button"
            onClick={sortAlphabetically}
            disabled={loading || saving}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-700 transition shadow-sm cursor-pointer disabled:opacity-50"
            title="Sort all categories alphabetically from A to Z"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Sort Alphabetically (A → Z)</span>
          </button>

          {/* Preset: Competitive Exam First */}
          <button
            type="button"
            onClick={moveCompetitiveToTop}
            disabled={loading || saving}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-700 transition shadow-sm cursor-pointer disabled:opacity-50"
            title="Move Competitive Exam to #1 position"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Competitive First</span>
          </button>

          {/* Reset button */}
          {hasChanges && (
            <button
              type="button"
              onClick={resetOrder}
              disabled={loading || saving}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-100 dark:bg-neutral-800 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-700 transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}

          {/* Save Order Button */}
          <button
            type="button"
            onClick={handleSaveOrder}
            disabled={loading || saving || !hasChanges}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition cursor-pointer ${
              hasChanges
                ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-500/30'
                : 'bg-slate-300 dark:bg-neutral-800 text-slate-500 dark:text-neutral-500 cursor-not-allowed shadow-none'
            }`}
          >
            {saving ? (
              <>
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Saving Order...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Save Category Order</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Reorder List + Live Storefront Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Reorder List (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Quick Search & Count Filter */}
          <div className="flex items-center justify-between gap-3 bg-white dark:bg-neutral-900 p-3 rounded-xl border border-slate-200/80 dark:border-neutral-800 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Quick find category..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-neutral-400 shrink-0">
              Total <span className="font-bold text-slate-800 dark:text-white">{categories.length}</span> categories
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800">
              <span className="inline-block h-8 w-8 rounded-full border-3 border-emerald-600 border-t-transparent animate-spin mb-3" />
              <p className="text-xs text-slate-500 dark:text-neutral-400">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-dashed border-slate-300 dark:border-neutral-800">
              <BookOpen className="h-8 w-8 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-neutral-300">No categories found in database.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCategoriesWithIndex.map(({ item, originalIdx }) => {
                const isFirst = originalIdx === 0;
                const isLast = originalIdx === categories.length - 1;
                const isDragged = draggedIndex === originalIdx;
                const isDragOver = dragOverIndex === originalIdx && draggedIndex !== originalIdx;

                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, originalIdx)}
                    onDragOver={(e) => handleDragOver(e, originalIdx)}
                    onDrop={(e) => handleDrop(e, originalIdx)}
                    onDragEnd={handleDragEnd}
                    className={`group relative flex items-center gap-2 sm:gap-3 rounded-xl border p-2.5 sm:p-3 transition-all duration-150 select-none ${
                      isDragged
                        ? 'opacity-40 border-dashed border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-inner'
                        : isDragOver
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20 translate-y-1'
                        : 'border-slate-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-slate-300 dark:hover:border-neutral-700 shadow-sm'
                    }`}
                  >
                    {/* Drag Handle */}
                    <div
                      className="cursor-grab active:cursor-grabbing p-1 text-slate-300 group-hover:text-slate-500 dark:text-neutral-600 dark:group-hover:text-neutral-300 transition shrink-0"
                      title="Drag to reorder"
                    >
                      <GripVertical className="h-4 w-4" />
                    </div>

                    {/* Rank Badge */}
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        originalIdx === 0
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 ring-1 ring-amber-400/40'
                          : originalIdx === 1
                          ? 'bg-slate-200 text-slate-700 dark:bg-neutral-800 dark:text-neutral-300 ring-1 ring-slate-300'
                          : originalIdx === 2
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 ring-1 ring-orange-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-400'
                      }`}
                    >
                      #{originalIdx + 1}
                    </div>

                    {/* Category Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-neutral-100 truncate">
                          {item.name}
                        </span>
                        {!item.isActive && (
                          <span className="text-[10px] font-semibold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 px-1.5 py-0.2 rounded">
                            Hidden
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-neutral-500">
                        <span className="font-mono text-[10px] truncate max-w-[140px] sm:max-w-[200px]">
                          /{item.slug}
                        </span>
                        {item._count?.books !== undefined && (
                          <span>• {item._count.books} books</span>
                        )}
                      </div>
                    </div>

                    {/* Quick Move Action Controls (Up / Down / Top / Bottom) */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Move to Top */}
                      <button
                        type="button"
                        onClick={() => moveToTop(originalIdx)}
                        disabled={isFirst}
                        className="hidden sm:flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-400 disabled:opacity-20 disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer"
                        title="Move directly to top (#1)"
                      >
                        <ChevronsUp className="h-3.5 w-3.5" />
                      </button>

                      {/* Move Up */}
                      <button
                        type="button"
                        onClick={() => moveItem(originalIdx, 'up')}
                        disabled={isFirst}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-400 disabled:opacity-25 disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer"
                        title="Move Up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        onClick={() => moveItem(originalIdx, 'down')}
                        disabled={isLast}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-400 disabled:opacity-25 disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer"
                        title="Move Down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>

                      {/* Move to Bottom */}
                      <button
                        type="button"
                        onClick={() => moveToBottom(originalIdx)}
                        disabled={isLast}
                        className="hidden sm:flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-400 disabled:opacity-20 disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer"
                        title="Move directly to bottom"
                      >
                        <ChevronsDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Live Storefront Preview (5 cols) */}
        <div className="lg:col-span-5 sticky top-4 space-y-4">
          <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800 dark:text-neutral-200">
                  Live Storefront Preview
                </span>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-neutral-800 p-0.5 rounded-lg text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition cursor-pointer ${
                    previewDevice === 'mobile'
                      ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:text-neutral-400'
                  }`}
                >
                  <Smartphone className="h-3 w-3" />
                  <span>Mobile Drawer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition cursor-pointer ${
                    previewDevice === 'desktop'
                      ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:text-neutral-400'
                  }`}
                >
                  <BookOpen className="h-3 w-3" />
                  <span>Navbar Pills</span>
                </button>
              </div>
            </div>

            {/* Mobile Drawer Preview */}
            {previewDevice === 'mobile' ? (
              <div className="mx-auto max-w-xs rounded-2xl border-2 border-slate-800 bg-slate-900 p-1.5 shadow-xl">
                {/* Mobile Screen Shell */}
                <div className="rounded-xl bg-white overflow-hidden text-slate-800 text-left">
                  {/* Header Branding */}
                  <div className="bg-[#0a2e1f] p-3 text-white">
                    <div className="text-xs font-black tracking-wider">TECHNO WORLD</div>
                    <div className="text-[10px] text-emerald-200">Categories Menu Drawer</div>
                  </div>

                  {/* Drawer Category List */}
                  <div className="p-3 bg-white max-h-[380px] overflow-y-auto space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Explore Categories
                    </p>
                    {categories.slice(0, 15).map((cat, idx) => (
                      <div
                        key={cat.id}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                          idx === 0
                            ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-xs">📚</span>
                          <span className="truncate">{cat.name}</span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400">#{idx + 1}</span>
                      </div>
                    ))}
                    {categories.length > 15 && (
                      <p className="text-center text-[10px] text-slate-400 pt-1">
                        + {categories.length - 15} more categories below...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Desktop Header Navbar Pills Preview */
              <div className="rounded-xl bg-[#0a2e1f] p-3 text-white space-y-2">
                <div className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">
                  Desktop Category Strip Preview
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-64 overflow-y-auto p-1">
                  {categories.map((cat, idx) => (
                    <span
                      key={cat.id}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] transition ${
                        idx === 0
                          ? 'bg-emerald-500 text-white font-bold ring-1 ring-white/30'
                          : 'bg-white/10 text-emerald-100 hover:bg-white/20'
                      }`}
                    >
                      <span className="text-[9px] opacity-70">#{idx + 1}</span>
                      <span>{cat.name.replace(' Books', '')}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-neutral-800 text-center">
              <p className="text-[11px] text-slate-400 dark:text-neutral-500">
                💡 Tip: Changes saved here immediately update the live website menu for all visitors without needing any code changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryOrderManager;

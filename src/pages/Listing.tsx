import { useMemo, useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { ChevronRight, SlidersHorizontal, X } from 'lucide-react';

import { formatINR } from '@/utils/helpers';
import { bookService, categoryService } from '@/services/api';
import type { Book } from '@/types';
import { BookCard, BookCardSkeleton } from '@/components/BookCard';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

type SortKey = 'relevance' | 'price-low' | 'price-high' | 'rating' | 'discount' | 'newest';

export default function Listing() {
  const { category } = useParams();
  const [params] = useSearchParams();
  const query = params.get('q') ?? '';

  const [base, setBase] = useState<Book[]>([]);
  const [catObj, setCatObj] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{status: number, message: string} | null>(null);

  useEffect(() => {
    if (category) {
      categoryService.getCategories().then(res => {
        if (res.success) setCatObj(res.data.find((c: any) => c.slug === category));
      }).catch(console.error);
    } else {
      setCatObj(null);
    }

    const fetchParams: any = { limit: 1000 };
    if (category) fetchParams.category = category;
    if (query && query.toLowerCase() === 'bestseller') fetchParams.bestSeller = true;
    else if (query) fetchParams.search = query;

    setLoading(true);
    setError(null);
    bookService.getBooks(fetchParams).then(res => {
      if (res.success) setBase(res.data || []);
    }).catch((err: any) => setError({
      status: err?.status || 500,
      message: err?.status === 404 ? 'Category not found' : err?.status === 0 ? 'Network Error. Please check your connection.' : 'Failed to load books.'
    })).finally(() => setLoading(false));
  }, [category, query]);

  const publishers = useMemo(() => [...new Set(base.map((b) => b.publisher).filter(Boolean))], [base]);
  const languages = useMemo(() => [...new Set(base.map((b) => b.language).filter(Boolean))], [base]);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 15000]);
  const [selPubs, setSelPubs] = useState<string[]>([]);
  const [selLangs, setSelLangs] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minDiscount, setMinDiscount] = useState(0);
  const [sort, setSort] = useState<SortKey>('relevance');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = base.filter(
      (b) =>
        b.price >= priceRange[0] &&
        b.price <= priceRange[1] &&
        (selPubs.length === 0 || selPubs.includes(b.publisher)) &&
        (selLangs.length === 0 || (b.language && selLangs.includes(b.language))) &&
        (!inStockOnly || b.stock > 0) &&
        (b.mrp ? ((b.mrp - b.price) / b.mrp) * 100 >= minDiscount : true)
    );
    switch (sort) {
      case 'price-low': list = [...list].sort((a, b) => a.price - b.price); break;
      case 'price-high': list = [...list].sort((a, b) => b.price - a.price); break;
      case 'rating': list = [...list].sort((a, b) => b.rating - a.rating); break;
      case 'discount': list = [...list].sort((a, b) => (b.mrp ? (b.mrp - b.price) / b.mrp : 0) - (a.mrp ? (a.mrp - a.price) / a.mrp : 0)); break;
      case 'newest': list = [...list].sort((a, b) => (b.pubDate || '').localeCompare(a.pubDate || '')); break;
    }
    return list;
  }, [base, priceRange, selPubs, selLangs, inStockOnly, minDiscount, sort]);

  const toggle = (arr: string[], v: string, set: (x: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const clearAll = () => {
    setPriceRange([0, 15000]); setSelPubs([]); setSelLangs([]); setInStockOnly(false); setMinDiscount(0);
  };

  const Filters = (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-bold text-slate-800">Price</p>
        <Slider value={priceRange} min={0} max={15000} step={100} onValueChange={(v) => setPriceRange(v as [number, number])} />
        <div className="mt-1 flex justify-between text-xs text-slate-500">
          <span>{formatINR(priceRange[0])}</span><span>{formatINR(priceRange[1])}+</span>
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-bold text-slate-800">Publisher</p>
        <div className="max-h-44 space-y-2 overflow-auto pr-1">
          {publishers.map((p) => (
            <label key={p} className="flex items-center gap-2 text-sm text-slate-600">
              <Checkbox checked={selPubs.includes(p)} onCheckedChange={() => toggle(selPubs, p, setSelPubs)} /> {p}
            </label>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-bold text-slate-800">Language</p>
        {languages.map((l) => (
          <label key={l} className="flex items-center gap-2 py-1 text-sm text-slate-600">
            <Checkbox checked={selLangs.includes(l)} onCheckedChange={() => toggle(selLangs, l, setSelLangs)} /> {l}
          </label>
        ))}
      </div>
      <div>
        <p className="mb-2 text-sm font-bold text-slate-800">Discount</p>
        {[10, 25, 40, 50].map((d) => (
          <label key={d} className="flex items-center gap-2 py-1 text-sm text-slate-600">
            <Checkbox checked={minDiscount === d} onCheckedChange={() => setMinDiscount(minDiscount === d ? 0 : d)} /> {d}% or more
          </label>
        ))}
      </div>
      <div>
        <p className="mb-2 text-sm font-bold text-slate-800">Availability</p>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <Checkbox checked={inStockOnly} onCheckedChange={(v) => setInStockOnly(!!v)} /> In stock only
        </label>
      </div>
      <button onClick={clearAll} className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline">
        <X className="h-3 w-3" /> Clear all filters
      </button>
    </div>
  );

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 text-center">
        <div className="flex flex-col items-center justify-center text-slate-500 py-20">
          <span className="text-4xl mb-4">{error.status === 404 ? '🔍' : '⚠️'}</span>
          <h2 className="text-xl font-bold text-slate-700">{error.status === 404 ? 'Not Found' : 'Error'}</h2>
          <p className="text-sm mt-2">{error.message}</p>
          <button onClick={() => window.location.reload()} className="mt-4 rounded-lg bg-emerald-600 px-6 py-2 font-bold text-white">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6">
      {/* breadcrumbs */}
      <nav className="mb-3 flex items-center gap-1 text-xs text-slate-500">
        <Link to="/" className="hover:text-emerald-700">Home</Link>
        <ChevronRight className="h-3 w-3" />
        {catObj ? (
          <span className="font-semibold text-slate-700">{catObj.name}</span>
        ) : (
          <span className="font-semibold text-slate-700">Search: "{query}"</span>
        )}
      </nav>

      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
            {catObj ? catObj.name : `Results for "${query}"`}
          </h1>
          <p className="text-xs text-slate-500">{filtered.length} book{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <div className="flex items-center gap-2">
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 md:hidden">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-auto p-5">{Filters}</SheetContent>
          </Sheet>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-36 bg-white text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price-low">Price: Low → High</SelectItem>
              <SelectItem value="price-high">Price: High → Low</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="discount">Discount</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-6">
        <aside className="hidden w-56 shrink-0 rounded-xl border border-slate-100 bg-white p-5 shadow-sm md:block md:self-start md:sticky md:top-36">
          {Filters}
        </aside>
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="[&>div]:w-full">
                  <BookCardSkeleton />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <p className="text-4xl">📚</p>
              <p className="mt-3 font-bold text-slate-700">No books matched</p>
              <p className="mt-1 text-sm text-slate-500">Try clearing filters or a different search — title, author, ISBN, exam or university.</p>
              <button onClick={clearAll} className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((b) => (
                <div key={b.id} className="[&>div]:w-full">
                  <BookCard book={b} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

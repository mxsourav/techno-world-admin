import { Link } from 'react-router';
import { Star, Building2, ArrowRight } from 'lucide-react';
import { useAutoFeaturedBooks } from '@/hooks/useAutoFeaturedBooks';

export default function PublishedByTechnoWorld() {
  const { books, loading } = useAutoFeaturedBooks();

  if (loading || books.length === 0) return null;

  return (
    <section className="bg-slate-900 px-4 py-8 text-white sm:px-6 lg:py-12">
      <div className="mx-auto max-w-7xl">
        
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end sm:mb-8">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-semibold text-emerald-400">
              <Building2 className="h-4 w-4" /> In-House Publications
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Published by Techno World
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Explore our exclusive in-house publications carefully prepared for students, educators, and competitive exam aspirants.
            </p>
          </div>
          <Link to="/search?q=Techno%20World" className="group flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300">
            View All <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {books.slice(0, 6).map((book) => (
            <Link key={book.id} to={`/book/${book.slug}`} className="group relative flex flex-col overflow-hidden rounded-xl bg-slate-800 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-900/50">
              
              {/* Cover Image */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-700">
                <img 
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  src={(book as any).cover || (book as any).coverDataUrl} 
                  alt={book.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-3">
                <h3 className="line-clamp-2 text-sm font-bold leading-tight">
                  {book.title}
                </h3>
                
                <div className="mt-1 flex items-center text-amber-400">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="ml-1 text-xs font-bold">{book.rating || 4.5}</span>
                </div>

                <div className="mt-auto pt-2">
                  <span className="text-sm font-extrabold text-emerald-400">
                    {book.price === 'On Request' ? 'On Request' : `₹${book.price}`}
                  </span>
                </div>
              </div>
              
            </Link>
          ))}
        </div>
        
      </div>
    </section>
  );
}

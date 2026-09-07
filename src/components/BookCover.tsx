import type { Book } from '@/types';
import { getImageUrl } from '@/services/api';

export function BookCover({ book, className = '' }: { book: Book; className?: string }) {
  const imageUrl = getImageUrl(book.coverUrl || book.coverImage);

  if (imageUrl) {
    if (imageUrl.toLowerCase().endsWith('.pdf')) {
      return (
        <div className={`relative overflow-hidden rounded-md shadow-md ${className}`} style={{ aspectRatio: '3 / 4.2' }}>
          <iframe 
            src={`${imageUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} 
            className="w-full h-full border-0 pointer-events-none"
            title={`Cover of ${book.title}`} 
          />
          <div className="absolute inset-0 bg-transparent" />
        </div>
      );
    }
    
    return (
      <div className={`relative overflow-hidden rounded-md shadow-md ${className}`} style={{ aspectRatio: '3 / 4.2' }}>
        <img 
          src={imageUrl} 
          alt={`Cover of ${book.title}`} 
          className="w-full h-full object-cover" loading="lazy" decoding="async" 
          onError={(e) => {
            // Hide the broken image if it fails to load
            e.currentTarget.style.display = 'none';
            if (e.currentTarget.parentElement) {
              e.currentTarget.parentElement.classList.add('bg-slate-100');
            }
          }}
        />
      </div>
    );
  }

  // Calculate a deterministic hue based on title length and characters if coverHue is missing
  const h = book.coverHue ?? ((book.title || 'Book').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 37) % 360;
  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-md shadow-md ${className}`}
      style={{
        background: `linear-gradient(150deg, hsl(${h}, 55%, 38%) 0%, hsl(${h}, 60%, 22%) 60%, hsl(${h}, 65%, 14%) 100%)`,
        aspectRatio: '3 / 4.2',
      }}
      aria-label={`Cover of ${book.title}`}
    >
      {/* spine effect */}
      <div className="absolute left-0 top-0 h-full w-[7%] bg-black/25" />
      <div className="absolute left-[7%] top-0 h-full w-px bg-white/20" />
      {/* decorative band */}
      <div className="absolute right-0 top-[12%] h-px w-[55%]" style={{ background: `hsl(${h}, 70%, 70%)`, opacity: 0.6 }} />
      <div className="flex h-full flex-col justify-between p-[8%] pl-[14%]">
        <div>
          <p className="text-[0.55em] font-semibold uppercase tracking-[0.2em] text-white/70">
            {book.language === 'Bengali' ? 'বাংলা' : (book.category?.replace('-', ' ') || '')}
          </p>
          <h3 className="mt-[6%] font-serif text-[1em] font-bold leading-snug text-white line-clamp-4">
            {book.title}
          </h3>
        </div>
        <div>
          <div className="mb-[6%] h-px w-[35%] bg-amber-400/80" />
          <p className="text-[0.6em] font-medium text-white/85 line-clamp-1">{book.author}</p>
          <p className="text-[0.5em] uppercase tracking-wider text-white/50 line-clamp-1">{book.publisher}</p>
        </div>
      </div>
    </div>
  );
}

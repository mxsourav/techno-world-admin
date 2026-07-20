import type { Book } from '@/types';

/** Generates a stylized CSS book cover — deterministic per book. */
export function BookCover({ book, className = '' }: { book: Book; className?: string }) {
  const h = book.coverHue;
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
            {book.language === 'Bengali' ? 'বাংলা' : book.category.replace('-', ' ')}
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

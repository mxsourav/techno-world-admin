import { Link, useParams } from 'react-router';
import { ChevronRight, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { BLOG_POSTS } from '@/data/blog';
import { BOOKS } from '@/data/books';
import { BookRow } from '@/components/BookCard';

export function BlogList() {
  const cats = [...new Set(BLOG_POSTS.map((p) => p.category))];
  return (
    <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6">
      <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Book Lists & Study Guides</h1>
      <p className="mt-1 text-sm text-slate-500">Exam booklists, reading guides and recommendations from the Techno World Books editorial desk.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {cats.map((c) => (
          <span key={c} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">{c}</span>
        ))}
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {BLOG_POSTS.map((p) => (
          <Link key={p.slug} to={`/blog/${p.slug}`} className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-lg">
            <div
              className="flex h-40 items-end p-4"
              style={{ background: `linear-gradient(140deg, hsl(${p.hue}, 55%, 40%), hsl(${p.hue}, 60%, 20%))` }}
            >
              <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">{p.category}</span>
            </div>
            <div className="p-4">
              <h2 className="line-clamp-2 font-extrabold leading-snug text-slate-900 group-hover:text-emerald-800">{p.title}</h2>
              <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">{p.excerpt}</p>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="h-3 w-3" /> {p.readTime} · {new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BlogPost() {
  const { slug } = useParams();
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return <div className="p-20 text-center">Post not found. <Link to="/blog" className="text-emerald-700 underline">Back to blog</Link></div>;
  const idx = BLOG_POSTS.indexOf(post);
  const next = BLOG_POSTS[idx + 1];
  const featured = BOOKS.filter((b) => b.bestseller).slice(0, 8);

  return (
    <div className="mx-auto max-w-3xl px-3 py-8 sm:px-6">
      <nav className="mb-4 flex items-center gap-1 text-xs text-slate-500">
        <Link to="/" className="hover:text-emerald-700">Home</Link><ChevronRight className="h-3 w-3" />
        <Link to="/blog" className="hover:text-emerald-700">Blog</Link><ChevronRight className="h-3 w-3" />
        <span className="line-clamp-1 font-semibold text-slate-700">{post.title}</span>
      </nav>
      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">{post.category}</span>
      <h1 className="mt-3 text-2xl font-extrabold leading-tight text-slate-900 sm:text-4xl">{post.title}</h1>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
        <Clock className="h-3 w-3" /> {post.readTime} · {new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · Techno Editorial
      </p>
      <div className="mt-6 h-52 rounded-2xl sm:h-64" style={{ background: `linear-gradient(140deg, hsl(${post.hue}, 55%, 40%), hsl(${post.hue}, 60%, 20%))` }} />
      <article className="mt-6 space-y-4">
        {post.body.map((para, i) => (
          <p key={i} className="text-[15px] leading-relaxed text-slate-700">
            {para.split('**').map((seg, j) => (j % 2 === 1 ? <strong key={j} className="text-slate-900">{seg}</strong> : seg))}
          </p>
        ))}
      </article>
      {next && (
        <Link to={`/blog/${next.slug}`} className="mt-8 flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md">
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400"><ArrowLeft className="h-3.5 w-3.5" /> Read next</span>
          <span className="line-clamp-1 text-sm font-bold text-emerald-800">{next.title}</span>
        </Link>
      )}
      <div className="mt-8"><BookRow title="Books from this list" books={featured} /></div>
      <div className="mt-4">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:underline"><ArrowRight className="h-4 w-4 rotate-180" /> All articles</Link>
      </div>
    </div>
  );
}

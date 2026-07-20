import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';

const GUIDES = [
  {
    title: 'Engineering Semester Books',
    description: 'Complete syllabus coverage for B.Tech students.',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=600',
    link: '/category/engineering'
  },
  {
    title: 'Medical Entrance Guides',
    description: 'Top-rated NEET prep books and previous year papers.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600',
    link: '/category/medical'
  },
  {
    title: 'UPSC Reading List',
    description: 'Essential polity, history, and economy titles.',
    image: 'https://images.unsplash.com/photo-1544716278-e513176f20b5?auto=format&fit=crop&q=80&w=600',
    link: '/search?q=upsc'
  },
  {
    title: 'JEE Preparation',
    description: 'Master physics, chemistry, and maths for JEE Advanced.',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=600',
    link: '/search?q=jee'
  }
];

export default function StudyGuides() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      
      <div className="mb-10 sm:mb-12">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Book Lists & Study Guides
        </h2>
        <p className="mt-4 text-lg text-slate-600">
          Editorial recommendations from Techno World Books.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {GUIDES.map((guide, idx) => (
          <Link 
            key={idx} 
            to={guide.link}
            className="group relative flex h-40 flex-col justify-end overflow-hidden rounded-2xl bg-slate-900 sm:h-48"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src={guide.image} 
                alt={guide.title} 
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative p-5 sm:p-6">
              <h3 className="text-lg font-bold text-white sm:text-xl">{guide.title}</h3>
              <p className="mt-1 text-sm text-slate-300">{guide.description}</p>
              
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-400 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-2">
                Explore Collection <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
      
    </section>
  );
}

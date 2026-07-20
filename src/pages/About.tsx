import { BookOpen, Award, Users, Target } from 'lucide-react';

export default function About() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-emerald-900 sm:text-5xl">
          About Techno World Books
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-xl text-slate-500">
          Empowering minds since 2005. India's trusted destination for academic, competitive, and professional books.
        </p>
      </div>

      <div className="mt-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl font-bold tracking-tight text-emerald-900">
              Our Story
            </h2>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              Based in the intellectual heart of India, Kolkata, Techno World Books started with a simple mission: to make high-quality educational resources accessible to students across the country. Over the past two decades, we have grown from a small local bookstore to a nationwide platform serving millions of learners.
            </p>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              Whether you are preparing for competitive exams like NEET and JEE, pursuing higher education in engineering or medical sciences, or simply expanding your knowledge base, our expertly curated catalogue ensures you have exactly what you need to succeed.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-3xl shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              alt="Beautiful bookstore interior"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent"></div>
          </div>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: <BookOpen className="h-8 w-8 text-emerald-600" />, title: '50,000+ Titles', desc: 'A massive collection spanning all major academic disciplines.' },
          { icon: <Users className="h-8 w-8 text-emerald-600" />, title: '2M+ Students', desc: 'Trusted by learners and educators across India.' },
          { icon: <Award className="h-8 w-8 text-emerald-600" />, title: 'Premium Quality', desc: 'Curated selection from top publishers and authors.' },
          { icon: <Target className="h-8 w-8 text-emerald-600" />, title: 'Fast Delivery', desc: 'Reaching 27,000+ pincodes across the country rapidly.' }
        ].map((stat, idx) => (
          <div key={idx} className="rounded-2xl bg-white p-8 shadow-sm transition hover:shadow-md border border-slate-100">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              {stat.icon}
            </div>
            <h3 className="mt-6 text-xl font-bold text-slate-900">{stat.title}</h3>
            <p className="mt-2 text-slate-500">{stat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

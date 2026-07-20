import { MapPin, ShieldCheck, Truck, ThumbsUp, Tag } from 'lucide-react';

export default function AboutTechnoWorld() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
        
        {/* Text Content */}
        <div className="flex-1 space-y-6">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              About Techno World Books
            </h2>
            <div className="mt-2 h-1 w-20 rounded-full bg-emerald-600"></div>
          </div>
          
          <p className="text-lg leading-relaxed text-slate-600">
            Techno World Books is a trusted bookstore based in Kolkata, serving students, educators, professionals, and book lovers across India. We specialize in academic books, competitive examinations, engineering, medical, university, school education, fiction, non-fiction, Bengali literature, international publications, and rare collections. 
          </p>
          <p className="text-lg leading-relaxed text-slate-600">
            Our mission is to make quality books accessible through an intuitive online shopping experience with genuine products, competitive pricing, and dependable delivery.
          </p>
        </div>

        {/* Badges Grid */}
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { icon: MapPin, text: 'Based in Kolkata', color: 'text-rose-500', bg: 'bg-rose-50' },
            { icon: ShieldCheck, text: 'Genuine Books', color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { icon: Truck, text: 'Fast Delivery', color: 'text-blue-500', bg: 'bg-blue-50' },
            { icon: ThumbsUp, text: 'Trusted Seller', color: 'text-amber-500', bg: 'bg-amber-50' },
            { icon: Tag, text: 'Affordable Prices', color: 'text-purple-500', bg: 'bg-purple-50' },
          ].map((badge, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${badge.bg}`}>
                <badge.icon className={`h-6 w-6 ${badge.color}`} />
              </div>
              <span className="font-bold text-slate-800">{badge.text}</span>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}

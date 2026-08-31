import { CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-emerald-900 sm:text-5xl lg:text-6xl mb-6">
          About Techno World Books
        </h1>
        <p className="mx-auto max-w-3xl text-2xl text-emerald-700 leading-relaxed font-semibold">
          Your Trusted Bookstore for Every Reader
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
        {/* Text Content */}
        <div className="space-y-6 text-lg text-slate-700 leading-relaxed">
          <p>
            Welcome to Techno World Books, your trusted online and offline bookstore based in the heart of College Street, Kolkata—India's iconic destination for books and learning. Our mission is simple: to make quality books accessible, affordable, and available to readers, students, professionals, and lifelong learners across India.
          </p>
          <p>
            Whether you're preparing for an important exam, pursuing higher education, building your professional library, or simply looking for your next great read, we're here to help you find the right book at the right price.
          </p>
          <div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-3">Books for Every Need</h2>
            <p>
              At Techno World Books, we believe that every reader deserves easy access to the books they need. That's why we offer a growing collection across almost every category, including School and College Books, Engineering, Medical, Nursing, Pharmacy, Science, Commerce, Arts, Law, Competitive Exam Books (UPSC, WBCS, SSC, Banking, Railway, JEE, NEET, GATE, CAT and more), Fiction, Non-fiction, Novels, Children's Books, Self-help, Business, Literature, Religious Books, Academic Titles, and Bestsellers.
            </p>
          </div>
        </div>

        {/* Image Section */}
        <div className="relative overflow-hidden rounded-3xl shadow-2xl group h-full max-h-[600px]">
          <img
            src="/aboutsectionimage.jpeg"
            alt="Techno World Books Interior"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-emerald-900/5 rounded-3xl mix-blend-multiply transition-colors group-hover:bg-transparent"></div>
        </div>
      </div>

      <div className="mb-20">
        <div className="bg-emerald-50 rounded-3xl p-8 sm:p-12 shadow-sm border border-emerald-100">
          <h2 className="text-3xl font-bold tracking-tight text-emerald-900 mb-6 text-center lg:text-left">
            Can't Find a Book?
          </h2>
          <p className="text-lg text-slate-700 leading-relaxed mb-6">
            Our catalogue continues to grow every day, with new titles being added regularly to ensure you always have access to the latest and most relevant books.
          </p>
          <p className="text-lg text-slate-700 leading-relaxed">
            Don't worry if the book you're looking for isn't listed on our website. Simply contact us through WhatsApp or Email, and our team will do its best to source the book for you and arrange delivery anywhere in India. We are committed to helping you find the books you need—not just the ones currently displayed online.
          </p>
        </div>
      </div>

      <div className="mb-20">
        <h2 className="text-3xl font-bold tracking-tight text-emerald-900 mb-8 text-center">
          Why Choose Techno World Books?
        </h2>
        <div className="max-w-4xl mx-auto mb-10 text-lg text-slate-700 text-center">
          We are committed to becoming one of India's most trusted bookstores by focusing on what matters most:
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            'Genuine and authentic books',
            'Competitive pricing',
            'Secure online shopping',
            'Fast and reliable delivery across India',
            'Responsive customer support',
            'A customer-first approach built on trust and satisfaction'
          ].map((feature, idx) => (
            <div key={idx} className="flex items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mr-4 flex-shrink-0" />
              <span className="text-slate-800 font-medium text-lg leading-tight">{feature}</span>
            </div>
          ))}
        </div>

        <p className="mt-12 text-lg text-slate-700 leading-relaxed max-w-4xl mx-auto text-center font-medium">
          Backed by our presence in College Street, Kolkata, we combine the heritage of India's most famous book market with the convenience of modern online shopping, making it easier than ever to discover and purchase the books you need.
        </p>
      </div>

      <div className="text-center max-w-3xl mx-auto bg-slate-50 p-10 rounded-3xl border border-slate-100">
        <h2 className="text-3xl font-bold tracking-tight text-emerald-900 mb-6">
          Join Our Reading Journey
        </h2>
        <p className="text-lg text-slate-700 leading-relaxed mb-6">
          At Techno World Books, we're more than a bookstore—we're your partner in learning, growth, and discovery. Whether you're a student, educator, professional, parent, or passionate reader, we're here to support your journey with the right books and dependable service.
        </p>
        <p className="text-lg text-emerald-800 leading-relaxed font-bold">
          Explore our collection today, and if you ever need help finding a specific title, simply reach out. We'll be happy to help you find the book you're looking for.
        </p>
      </div>
    </div>
  );
}

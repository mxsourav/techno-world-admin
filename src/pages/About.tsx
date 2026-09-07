import { useState } from 'react';
import { CheckCircle2, BookOpen, Send, Upload, X, Loader2, Sparkles, MessageSquare, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { bookRequestService } from '@/services/api';
import { useStore } from '@/store/StoreContext';

export default function About() {
  const { user } = useStore();

  const [form, setForm] = useState({
    title: '',
    author: '',
    email: user?.email || '',
    phone: user?.phone || '',
    publisher: '',
    edition: '',
    notes: '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      return toast.error('Please enter the book title.');
    }
    if (!form.author.trim()) {
      return toast.error('Please enter the author name.');
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return toast.error('Please enter a valid email address.');
    }

    setSubmitting(true);
    try {
      const res = await bookRequestService.submitRequest({
        title: form.title.trim(),
        author: form.author.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        publisher: form.publisher.trim() || undefined,
        edition: form.edition.trim() || undefined,
        notes: form.notes.trim() || undefined,
        imageUrl: imagePreview || undefined,
      });

      if (res.success) {
        setSubmitted(true);
        toast.success(`Book request for "${form.title}" registered successfully!`);
      } else {
        toast.error(res.message || 'Failed to submit request.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error submitting request. Please try again or message us on WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

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
            Welcome to Techno World Books, your trusted academic and general bookstore rooted in the heart of College Street, Kolkata—India's legendary destination for books, higher education, and scholarship. Our mission is to make quality books accessible, affordable, and readily available to readers, students, medical & engineering aspirants, educators, and researchers nationwide.
          </p>
          <p>
            Whether you're preparing for competitive exams (NEET, JEE, UPSC, WBCS), pursuing university degrees, building your professional library, or simply searching for your next great read, our experienced College Street team is here to assist you with genuine editions and dependable delivery.
          </p>
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-800 border border-emerald-200">
              📍 College Street Flagship: 90/6A Mahatma Gandhi Rd, opp. Grace Cinema, Kolkata 700007
            </span>
          </div>
        </div>

        {/* Visual Element */}
        <div className="relative group">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-emerald-800 to-teal-950 flex items-center justify-center p-8 text-white relative">
            <div className="text-center space-y-4">
              <div className="text-6xl font-serif">❝</div>
              <p className="text-2xl font-serif italic max-w-md mx-auto leading-snug">
                "Connecting generations of readers with the rich literary and academic heritage of College Street."
              </p>
              <div className="pt-4 text-emerald-300 font-bold uppercase tracking-wider text-sm">
                Techno World Books · Kolkata
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-emerald-900/5 rounded-3xl mix-blend-multiply transition-colors group-hover:bg-transparent"></div>
        </div>
      </div>

      {/* CAN'T FIND A BOOK? & SOURCING REQUEST FORM */}
      <div className="mb-20">
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white rounded-3xl p-6 sm:p-12 shadow-sm border border-emerald-100">
          <div className="max-w-3xl mb-8">
            <div className="inline-flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="h-4 w-4" /> Book Procurement & Sourcing
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-emerald-950 mb-3">
              Can't Find a Book? Request It Here
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              Don't worry if the book you're looking for isn't currently displayed on our website. With our deep connections across College Street, national publishers, and academic distributors, our team can source rare, out-of-print, and foreign editions for you.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-2xl border border-emerald-300 bg-white p-8 text-center space-y-4 max-w-2xl mx-auto shadow-sm">
              <CheckCircle2 className="h-14 w-14 text-emerald-600 mx-auto" />
              <h3 className="text-xl font-black text-slate-900">Book Sourcing Request Submitted!</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Thank you! We have logged your request for <b>"{form.title}"</b> by <b>{form.author}</b> into our procurement desk. Our sourcing team is checking publisher availability and will contact you at <b>{form.email}</b> or WhatsApp.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setForm({
                      title: '',
                      author: '',
                      email: user?.email || '',
                      phone: user?.phone || '',
                      publisher: '',
                      edition: '',
                      notes: '',
                    });
                    setImagePreview(null);
                  }}
                  className="rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                >
                  Request Another Book
                </button>
                <a
                  href={`https://wa.me/917479135626?text=${encodeURIComponent(
                    `Hi Techno World Books, I submitted a sourcing request for "${form.title}" by ${form.author}.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm"
                >
                  <MessageSquare className="h-4 w-4" /> Message on WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl border border-emerald-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-emerald-700" /> Book Sourcing Request Form
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Fill in the book details below. Book name, author name, and your email are mandatory.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Book Title / Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Higher Algebra / Concepts of Physics"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Author Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    placeholder="e.g. Hall & Knight / H.C. Verma"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone / WhatsApp Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. 9876543210 (For WhatsApp updates)"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Publisher / Imprint (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.publisher}
                    onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                    placeholder="e.g. Cambridge / Wiley / NCERT / S. Chand"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Edition / Year (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.edition}
                    onChange={(e) => setForm({ ...form, edition: e.target.value })}
                    placeholder="e.g. 2026 Latest Edition / 4th Edition"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Image Upload (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Upload Book Photo / Syllabus / Cover (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-emerald-500 transition">
                    <Upload className="h-4 w-4 text-emerald-700" />
                    <span>Choose Image (Max 5MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  {imagePreview && (
                    <div className="relative inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1.5 shadow-xs">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-10 w-8 rounded object-cover border border-slate-200"
                      />
                      <span className="text-[11px] font-medium text-slate-600">Photo attached</span>
                      <button
                        type="button"
                        onClick={() => setImagePreview(null)}
                        className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Special Instructions / Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Additional Notes or Instructions (Optional)
                </label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="e.g. Required urgently for semester exams / need paperback edition / looking for 3 copies..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-7 py-3 text-sm font-bold text-white hover:bg-emerald-800 shadow transition disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Book Sourcing Request</span>
                    </>
                  )}
                </button>

                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Immediate inquiry? WhatsApp us at <b>+91 747 913 5626</b></span>
                </div>
              </div>
            </form>
          )}
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

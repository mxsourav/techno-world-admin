import { useState } from 'react';
import { Link } from 'react-router';
import { MessageCircle, Package, RotateCcw, CreditCard, Truck, Ticket, ChevronDown, Phone } from 'lucide-react';
import { toast } from 'sonner';

const FAQS = [
  { q: 'How long does delivery take?', a: 'Metro cities: 1–3 days. Rest of India: 3–7 days. Remote pincode via India Post may take up to 10 days. Enter your pincode on any product page for an exact estimate.' },
  { q: 'What is the return policy?', a: '7-day easy returns from delivery date. Books must be unread and in original condition. Raise a return from My Account → Orders → Return, and our courier will pick it up within 48 hours. Refunds are processed in 3–5 business days.' },
  { q: 'Are all books genuine and new?', a: 'Yes. Every title is sourced directly from publishers or authorised distributors. We have a zero-tolerance policy on pirated books — report any suspicion for a 200% refund.' },
  { q: 'How do Techno Rewards points work?', a: 'Earn 5 points for every ₹100 spent. 1 point = ₹1 off on future orders. Refer a friend and you both get ₹100 worth of points after their first order.' },
  { q: 'Can I pay cash on delivery?', a: 'Yes, COD is available on 27,000+ pincodes for orders up to ₹5,000. UPI, cards, net banking and wallets are always available.' },
  { q: 'Do you deliver old/rare books safely?', a: 'Rare and collector\'s editions ship in archival wrapping with rigid corner protection and tamper-proof packaging, fully insured.' },
];

const TOPICS = [
  { icon: Package, t: 'Order Issues', d: 'Missing, wrong or damaged items' },
  { icon: Truck, t: 'Delivery', d: 'Delays, pincode coverage, address change' },
  { icon: RotateCcw, t: 'Returns & Refunds', d: 'Return pickup and refund status' },
  { icon: CreditCard, t: 'Payments', d: 'Failed payments, COD, invoices' },
];

export default function Help() {
  const [open, setOpen] = useState<number | null>(0);
  const [ticket, setTicket] = useState({ subject: '', msg: '' });

  return (
    <div className="mx-auto max-w-4xl px-3 py-8 sm:px-6">
      <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Help Center</h1>
      <p className="mt-1 text-sm text-slate-500">We're here 9 AM – 9 PM, 7 days a week.</p>

      {/* contact cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl bg-emerald-600 p-4 text-white shadow-sm hover:bg-emerald-500">
          <MessageCircle className="h-7 w-7" />
          <span><b className="block text-sm">WhatsApp Chat</b><span className="text-xs opacity-90">Fastest — replies in minutes</span></span>
        </a>
        <button onClick={() => toast.success('Live chat connected! An agent will join shortly.')} className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm border border-slate-100 hover:shadow-md text-left">
          <MessageCircle className="h-7 w-7 text-emerald-700" />
          <span><b className="block text-sm text-slate-800">Live Chat</b><span className="text-xs text-slate-500">Chat with a support agent</span></span>
        </button>
        <a href="tel:18002662665" className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md">
          <Phone className="h-7 w-7 text-emerald-700" />
          <span><b className="block text-sm text-slate-800">1800-266-BOOK</b><span className="text-xs text-slate-500">Toll-free, 9 AM – 9 PM</span></span>
        </a>
      </div>

      <Link to="/track" className="mt-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 hover:bg-emerald-100">
        <span className="flex items-center gap-3 text-sm font-bold text-emerald-900"><Package className="h-5 w-5" /> Where is my order?</span>
        <span className="text-xs font-bold text-emerald-700">Track now →</span>
      </Link>

      {/* topics */}
      <h2 className="mt-8 text-lg font-extrabold text-slate-900">Browse by topic</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {TOPICS.map((t) => (
          <button key={t.t} onClick={() => toast.info(`Opening ${t.t} guide…`)} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 text-left shadow-sm hover:shadow-md">
            <t.icon className="h-6 w-6 shrink-0 text-emerald-700" />
            <span><b className="block text-sm text-slate-800">{t.t}</b><span className="text-xs text-slate-500">{t.d}</span></span>
          </button>
        ))}
      </div>

      {/* FAQs */}
      <h2 className="mt-8 text-lg font-extrabold text-slate-900">Frequently asked questions</h2>
      <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-100 bg-white shadow-sm">
        {FAQS.map((f, i) => (
          <div key={i}>
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-3 p-4 text-left">
              <span className="text-sm font-bold text-slate-800">{f.q}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${open === i ? 'rotate-180' : ''}`} />
            </button>
            {open === i && <p className="px-4 pb-4 text-sm leading-relaxed text-slate-600">{f.a}</p>}
          </div>
        ))}
      </div>

      {/* ticket */}
      <h2 className="mt-8 flex items-center gap-2 text-lg font-extrabold text-slate-900"><Ticket className="h-5 w-5 text-emerald-700" /> Raise a support ticket</h2>
      <div className="mt-3 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <input
          value={ticket.subject}
          onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
          placeholder="Subject (e.g. Order TWB12345678 not delivered)"
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
        />
        <textarea
          value={ticket.msg}
          onChange={(e) => setTicket({ ...ticket, msg: e.target.value })}
          placeholder="Describe your issue…"
          rows={4}
          className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
        />
        <button
          onClick={() => { if (!ticket.subject) return toast.error('Add a subject'); toast.success(`Ticket #T${Math.floor(Math.random() * 90000 + 10000)} created — we'll reply within 4 hours.`); setTicket({ subject: '', msg: '' }); }}
          className="mt-3 rounded-xl bg-emerald-700 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-800"
        >
          Submit Ticket
        </button>
      </div>
    </div>
  );
}

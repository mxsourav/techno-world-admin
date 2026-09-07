import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { MapPin, Phone, Mail, Clock, Send, ExternalLink, CheckCircle2, Loader2, MessageSquare, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { contactService } from '@/services/api';
import { useStore } from '@/store/StoreContext';

export default function Contact() {
  const [searchParams] = useSearchParams();
  const { user } = useStore();

  const urlOrderId = searchParams.get('orderId') || '';
  const urlName = searchParams.get('name') || '';
  const urlEmail = searchParams.get('email') || '';

  const [name, setName] = useState(urlName || user?.name || '');
  const [email, setEmail] = useState(urlEmail || user?.email || '');
  const [orderNumber, setOrderNumber] = useState(urlOrderId);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (urlOrderId) setOrderNumber(urlOrderId);
    if (urlName && !name) setName(urlName);
    if (urlEmail && !email) setEmail(urlEmail);
  }, [urlOrderId, urlName, urlEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      return toast.error('Please fill in all required fields.');
    }

    setLoading(true);
    try {
      const res = await contactService.submitMessage({
        name: name.trim(),
        email: email.trim(),
        orderNumber: orderNumber.trim() || undefined,
        message: message.trim(),
      });

      if (res.success) {
        setSubmitted(true);
        toast.success('Your message has been received! Our College Street team will reply within 24 hours.');
      } else {
        toast.error(res.message || 'Failed to submit message.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to connect with customer care. You can also reach us directly via WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="border-b border-slate-200 pb-6 mb-8">
        <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Phone className="h-4 w-4" /> Get in Touch
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Contact Techno World Books</h1>
        <p className="text-sm text-slate-500 mt-2">
          Visit our historic College Street bookshop or contact our digital customer service team
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Store Information & Direct Support */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">College Street Storefront</h2>
            
            <div className="flex items-start gap-3 text-sm text-slate-700">
              <MapPin className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">Techno World Books</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  90/6A, Mahatma Gandhi Rd, opp. Grace Cinema, Calcutta University, College Street, Kolkata, West Bengal 700007
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-700 pt-2 border-t border-slate-100">
              <Phone className="h-5 w-5 text-emerald-700 shrink-0" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Store Landline (9:00 AM – 8:00 PM)</p>
                <a href="tel:03322196115" className="font-bold text-slate-900 hover:text-emerald-700">
                  033 2219 6115
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-700 pt-2 border-t border-slate-100">
              <MessageSquare className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs text-slate-500 font-medium">WhatsApp Support</p>
                  <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-extrabold text-emerald-800">24/7 FASTEST</span>
                </div>
                <a href="https://wa.me/917479135626" target="_blank" rel="noreferrer" className="font-bold text-slate-900 hover:text-emerald-700">
                  +91 747 913 5626
                </a>
                <p className="text-[10px] text-slate-400">Usually replies within hours</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-700 pt-2 border-t border-slate-100">
              <Mail className="h-5 w-5 text-emerald-700 shrink-0" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Customer Support Email</p>
                <a href="mailto:support@technoworldbooks.in" className="font-bold text-slate-900 hover:text-emerald-700">
                  support@technoworldbooks.in
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-700 pt-2 border-t border-slate-100">
              <Clock className="h-5 w-5 text-emerald-700 shrink-0" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Store & Support Hours</p>
                <p className="font-bold text-slate-900">Mon &ndash; Sat: 9:00 AM &ndash; 8:00 PM</p>
                <p className="text-[11px] text-slate-400">Sunday Closed (WhatsApp active)</p>
              </div>
            </div>
          </div>

          {/* Replacement Assistance */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2.5 shadow-xs">
            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-emerald-700" /> Book Replacement Assistance
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              If your received books are damaged, defective, or misprinted, please send an unboxing video to WhatsApp <b>+91 747 913 5626</b> and submit our replacement form within 7 days of delivery.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSdP7BBi2SNX67XU0xoBDzqiXSaL4nyBBIwDfVacG8M9kVR1RQ/viewform?usp=publish-editor"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline"
              >
                Open Replacement Form <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://wa.me/917479135626"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700"
              >
                Chat on WhatsApp &rarr;
              </a>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Send us a Message</h2>
            <p className="text-xs text-slate-500 mb-6">
              Have a question about books, order delivery, or bulk publications? Fill out this form and our team will get back to you promptly.
            </p>

            {orderNumber && (
              <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 flex items-center justify-between">
                <span>Inquiry linked to Order: <b className="font-mono">#{orderNumber}</b></span>
                <button
                  type="button"
                  onClick={() => setOrderNumber('')}
                  className="text-[11px] text-emerald-700 hover:underline font-bold"
                >
                  Clear Order ID
                </button>
              </div>
            )}

            {submitted ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-8 text-center space-y-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-extrabold text-emerald-950">Thank you! Your Message Has Been Sent.</h3>
                <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                  Your inquiry has been successfully registered in our customer care system. A confirmation email has been dispatched to <b>{email}</b>, and our College Street team will reply shortly.
                </p>
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setMessage('');
                    }}
                    className="rounded-xl bg-emerald-700 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-800 shadow transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sen"
                      className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Order ID (if applicable)</label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g. TW-20260904-1234"
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">If your query is about an existing order, include the order number above.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Message or Query *</label>
                  <textarea
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we assist you regarding our books, publications, or orders?"
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-7 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`https://wa.me/917479135626?text=${encodeURIComponent(
                      `Hi Techno World Books, I need help.${orderNumber ? ` Order: #${orderNumber}` : ''}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700"
                  >
                    <span>Need instant help? Chat on WhatsApp</span> &rarr;
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import {
  Building2,
  X,
  Mail,
  CheckCircle2,
  Clock,
  ShoppingCart,
  Loader2,
  Send,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/store/StoreContext';
import { useCartTotals } from '@/hooks/useCartTotals';
import { b2bService } from '@/services/api';

interface InstitutionalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TIMELINE_OPTIONS = [
  'Within 1–2 weeks',
  'Within 2–4 weeks',
  'Immediate (Within 48 hours)',
  'Upcoming Academic Semester',
  'Annual Institutional Requisition',
];

export function InstitutionalModal({ isOpen, onClose }: InstitutionalModalProps) {
  const { cart } = useStore();
  const { items: cartPricingItems } = useCartTotals();

  const [organizationName, setOrganizationName] = useState('');
  const [representativeName, setRepresentativeName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [timeline, setTimeline] = useState('Within 1–2 weeks');
  const [requirements, setRequirements] = useState('');
  const [attachCart, setAttachCart] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cartItemCount = cart?.length || 0;

  // Auto-enable attachCart if user has items in cart
  useEffect(() => {
    if (cartItemCount > 0) {
      setAttachCart(true);
    } else {
      setAttachCart(false);
    }
  }, [cartItemCount, isOpen]);

  // Modal accessibility: Escape key and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose, isSubmitting]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsSubmitted(false);
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!organizationName.trim()) {
      setErrorMessage('Please enter your Institute or Organization Name.');
      return;
    }
    if (!representativeName.trim()) {
      setErrorMessage('Please enter the Representative Contact Name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please provide a valid official email address.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 7) {
      setErrorMessage('Please provide a valid phone or WhatsApp contact number.');
      return;
    }
    if (!requirements.trim()) {
      setErrorMessage('Please describe your book requirements, titles, or syllabus.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build cart snapshot if attached
      let attachedSnapshot: any[] = [];
      if (attachCart && cartItemCount > 0) {
        if (cartPricingItems && cartPricingItems.length > 0) {
          attachedSnapshot = cartPricingItems.map((item: any) => ({
            bookId: item.bookId || item.id || null,
            isbn: item.isbn || item.book?.isbn || null,
            title: item.title || item.book?.title || 'Book Title',
            requestedQuantity: Number(item.quantity || item.qty || 1),
            currentRetailPrice: Number(item.salePrice || item.price || item.book?.salePrice || 0),
          }));
        } else {
          attachedSnapshot = cart.map((i) => ({
            bookId: i.bookId,
            requestedQuantity: i.qty,
            title: `Cart Item (${i.bookId})`,
            currentRetailPrice: 0,
          }));
        }
      }

      await b2bService.submitQuoteRequest({
        organizationName: organizationName.trim(),
        representativeName: representativeName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        timeline,
        requirements: requirements.trim(),
        attachedCartItems: attachedSnapshot,
      });

      setIsSubmitted(true);
      toast.success('Your quote request has been logged successfully!');

      // Auto-clear and close modal after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setOrganizationName('');
        setRepresentativeName('');
        setEmail('');
        setPhone('');
        setRequirements('');
        onClose();
      }, 3000);
    } catch (err: any) {
      console.error('Failed to submit B2B quote request:', err);
      setErrorMessage(err?.message || 'Failed to submit quote request. Please try again or call our sales desk directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="b2b-modal-title"
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-stone-200 bg-white p-5 sm:p-8 text-stone-900 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {isSubmitted ? (
          /* Minimalist Editorial Success State */
          <div className="py-12 px-4 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 border border-stone-200 text-emerald-800">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
              Thank you. Your inquiry has been logged.
            </h3>
            <p className="max-w-md mx-auto text-sm text-stone-600 leading-relaxed">
              Our institutional sales team (Direct Sales Desk: Md. Washim Akram) will review your requirements and contact you within <strong className="text-stone-900">2–4 business hours</strong> with custom bulk pricing.
            </p>
            <div className="pt-2 text-xs text-stone-400 font-mono">
              Closing dialog automatically...
            </div>
          </div>
        ) : (
          /* Form Content */
          <>
            {/* Header & Eyebrow: Sophisticated Neutral Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-stone-800">
              <Building2 className="h-3.5 w-3.5 text-stone-700" />
              <span>Institutional & Bulk Purchases</span>
            </div>

            <h2 id="b2b-modal-title" className="mt-2.5 text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
              Institutional & Bulk Book Purchases
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-stone-600 leading-relaxed">
              Custom quotations and supply for schools, colleges, and libraries.
            </p>

            {/* SLA Assurance Banner: Understated Informational Neutral Box */}
            <div className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs text-stone-600 leading-relaxed">
              <Clock className="h-4 w-4 text-stone-700 shrink-0 mt-0.5" />
              <span>
                <strong className="text-stone-900 font-semibold">SLA Guarantee:</strong> Our institutional sales team will review your requirements and contact you within <span className="text-stone-900 font-semibold">2–4 business hours</span>.
              </span>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-3.5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Quote Request Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Organization Details */}
                <div className="space-y-1">
                  <label htmlFor="b2b-org" className="block text-xs font-semibold text-stone-800">
                    Institute / Organization Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="b2b-org"
                    type="text"
                    required
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="e.g. St. Xavier's College, Kolkata"
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-800 transition-colors"
                  />
                </div>

                {/* Representative Name */}
                <div className="space-y-1">
                  <label htmlFor="b2b-rep" className="block text-xs font-semibold text-stone-800">
                    Representative Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="b2b-rep"
                    type="text"
                    required
                    value={representativeName}
                    onChange={(e) => setRepresentativeName(e.target.value)}
                    placeholder="e.g. Dr. A. K. Banerjee (Librarian)"
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-800 transition-colors"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label htmlFor="b2b-email" className="block text-xs font-semibold text-stone-800">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="b2b-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="library@institution.ac.in"
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-800 transition-colors"
                  />
                </div>

                {/* Phone / WhatsApp */}
                <div className="space-y-1">
                  <label htmlFor="b2b-phone" className="block text-xs font-semibold text-stone-800">
                    Phone / WhatsApp Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="b2b-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-800 transition-colors"
                  />
                </div>

              </div>

              {/* Timeline */}
              <div className="space-y-1">
                <label htmlFor="b2b-timeline" className="block text-xs font-semibold text-stone-800">
                  Required By / Expected Timeline
                </label>
                <select
                  id="b2b-timeline"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs sm:text-sm text-stone-900 focus:border-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-800 transition-colors cursor-pointer"
                >
                  {TIMELINE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Requirements & Book List */}
              <div className="space-y-1">
                <label htmlFor="b2b-requirements" className="block text-xs font-semibold text-stone-800">
                  Detailed Requirements & Book List <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="b2b-requirements"
                  rows={3}
                  required
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Please describe the books, genres, or specific titles you need bulk pricing for (e.g. 30 sets of MBBS 1st Year Anatomy textbooks, or departmental requisition)..."
                  className="w-full rounded-lg border border-stone-300 bg-white p-3 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-800 transition-colors leading-relaxed"
                />
              </div>

              {/* Crucial UX: Link Cart Feature (Neutral Styling) */}
              <div className={`rounded-xl border p-3 sm:p-4 transition-colors ${
                cartItemCount > 0
                  ? 'border-stone-300 bg-stone-50/60'
                  : 'border-stone-200 bg-stone-50/30'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <ShoppingCart className="h-4 w-4 mt-0.5 shrink-0 text-stone-700" />
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                        <span>Attach Current Cart Items to Request</span>
                        {cartItemCount > 0 && (
                          <span className="rounded-full bg-stone-100 border border-stone-200 text-stone-700 px-2 py-0.5 text-[10px] font-semibold">
                            {cartItemCount} item{cartItemCount !== 1 ? 's' : ''} in cart
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-600 leading-normal">
                        {cartItemCount > 0 ? (
                          <>
                            Attach <strong>{cartItemCount} items</strong> currently in your shopping cart to this quotation. Our sales desk will quote institutional volume discounts on these exact titles.
                          </>
                        ) : (
                          <span className="text-stone-500 italic">
                            Your cart is empty. Add books to your cart to link them automatically.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Checkbox / Switch (Deep Forest Green Active State) */}
                  <label className={`relative inline-flex items-center shrink-0 ${
                    cartItemCount === 0 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                  }`}>
                    <input
                      type="checkbox"
                      disabled={cartItemCount === 0}
                      checked={attachCart}
                      onChange={(e) => setAttachCart(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-900"></div>
                  </label>
                </div>
              </div>

              {/* Submit Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-900 active:bg-emerald-950 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting Quote Request...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Quote Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Bottom Contact Footer (Clean Full-Width Flexbox Container, Non-Wrapping) */}
            <div className="mt-6 -mx-5 -mb-5 sm:-mx-8 sm:-mb-8 rounded-b-2xl bg-stone-50 border-t border-stone-200 px-5 sm:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
              {/* Left Side: Call Md. Washim */}
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-stone-500">Urgent?</span>
                <span className="text-stone-700">Call Md. Washim:</span>
                <a
                  href="tel:+917479135626"
                  className="font-bold text-stone-900 hover:text-emerald-800 font-mono tracking-tight whitespace-nowrap"
                >
                  +91 747 913 5626
                </a>
              </div>

              {/* Right Side: Email Desk */}
              <a
                href="mailto:team@technoworldbooks.in?subject=Institutional%20Quote%20Inquiry"
                className="inline-flex items-center gap-1.5 text-stone-700 hover:text-stone-900 font-mono text-xs whitespace-nowrap transition-colors"
              >
                <Mail className="h-3.5 w-3.5 text-stone-500 shrink-0" />
                <span>team@technoworldbooks.in</span>
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

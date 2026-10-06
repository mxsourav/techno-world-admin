import { useState, useEffect } from 'react';
import { Building2, X, PhoneCall, Mail, Copy, Check, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

interface InstitutionalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INSTITUTION_TAGS = [
  'Schools',
  'Colleges',
  'Universities',
  'Academic Libraries',
  'Coaching Institutes',
];

export function InstitutionalModal({ isOpen, onClose }: InstitutionalModalProps) {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText('+91 747 913 5626');
    setCopiedPhone(true);
    toast.success('Institutional sales phone copied: +91 747 913 5626');
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('team@technoworldbooks.in');
    setCopiedEmail(true);
    toast.success('B2B support email copied: team@technoworldbooks.in');
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="institutional-modal-title"
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 text-stone-900 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto"
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

        {/* Header Eyebrow */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800">
          <Building2 className="h-3.5 w-3.5 text-emerald-700" />
          <span>Institutional & Bulk Sales</span>
        </div>

        {/* Modal Heading & Description */}
        <h2 id="institutional-modal-title" className="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
          Direct Institutional & Corporate Purchasing
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-stone-600 leading-relaxed">
          Custom quotations, purchase orders, and special library pricing for academic and professional institutions.
        </p>

        {/* Segments Tags */}
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-xs text-stone-600">
          {INSTITUTION_TAGS.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-stone-200/70 bg-stone-100 px-2.5 py-1 font-medium text-stone-700"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 2-Column Responsive Card Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Card 1: Direct Institutional Sales Desk */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-emerald-800 uppercase bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200">
                  Direct Sales Desk
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-stone-500 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Priority Desk
                </span>
              </div>

              <h3 className="mt-3 text-sm sm:text-base font-bold text-stone-900">
                Md. Washim Akram
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                Head of Institutional Sales / B2B Accounts
              </p>

              <div className="mt-3 flex items-center justify-between rounded-lg bg-white px-3 py-2 border border-stone-200 shadow-2xs">
                <a
                  href="tel:+917479135626"
                  className="text-xs font-semibold text-stone-900 hover:text-emerald-700 transition-colors font-mono tracking-tight"
                  aria-label="Call Md. Washim Akram at +91 747 913 5626"
                >
                  +91 747 913 5626
                </a>
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="text-stone-400 hover:text-stone-700 transition-colors p-1 rounded cursor-pointer"
                  title="Copy phone number"
                  aria-label="Copy phone number +91 747 913 5626"
                >
                  {copiedPhone ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Direct Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href="tel:+917479135626"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-800 hover:bg-stone-50 hover:border-stone-400 transition-all text-center shadow-2xs"
                aria-label="Call institutional sales desk directly"
              >
                <PhoneCall className="h-3.5 w-3.5 text-stone-700" />
                <span>Call Now</span>
              </a>

              <a
                href="https://wa.me/917479135626?text=Hi%20Md.%20Washim,%20we%20require%20a%20bulk%20quote%20for%20our%20institution"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-2 text-xs font-bold text-white hover:bg-[#20ba5a] transition-all text-center shadow-2xs"
                aria-label="Chat on WhatsApp for institutional bulk quotation"
              >
                <svg className="h-3.5 w-3.5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.884 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Card 2: Official Quotation Desk */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-emerald-800 uppercase bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200">
                  Official Quotation Desk
                </span>
                <span className="text-[11px] text-stone-500 font-medium">
                  24h Turnaround
                </span>
              </div>

              <h3 className="mt-3 text-sm sm:text-base font-bold text-stone-900">
                Institutional Accounts Team
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                Custom POs, Tender Submissions & Library Invoices
              </p>

              <div className="mt-3 flex items-center justify-between rounded-lg bg-white px-3 py-2 border border-stone-200 shadow-2xs">
                <a
                  href="mailto:team@technoworldbooks.in?subject=Request%20for%20Bulk%20Quotation%20%2F%20Institutional%20Purchase"
                  className="text-xs font-semibold text-stone-900 hover:text-emerald-700 transition-colors font-mono tracking-tight truncate max-w-[190px]"
                  aria-label="Email institutional support at team@technoworldbooks.in"
                >
                  team@technoworldbooks.in
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="text-stone-400 hover:text-stone-700 transition-colors p-1 rounded shrink-0 ml-1 cursor-pointer"
                  title="Copy email address"
                  aria-label="Copy email team@technoworldbooks.in"
                >
                  {copiedEmail ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Email Action Link */}
            <div className="pt-1">
              <a
                href="mailto:team@technoworldbooks.in?subject=Request%20for%20Bulk%20Quotation%20%2F%20Institutional%20Purchase"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-all text-center shadow-2xs"
                aria-label="Request quotation via email"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Request Quotation via Email</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

        </div>

        {/* Footer Note */}
        <p className="mt-5 text-center text-xs text-stone-500">
          For university tenders or official vendor empanelment, please attach your institution's requisition list.
        </p>
      </div>
    </div>
  );
}

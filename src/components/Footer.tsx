import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { MapPin, Phone, Globe, Camera, Building2, Mail, Copy, Check, PhoneCall, ArrowUpRight } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { useAuthStore } from '@/store/AuthStore';
import { toast } from 'sonner';

const DEVELOPERS = [
  {
    handle: '@mxsourav',
    githubUrl: 'https://github.com/mxsourav',
    portfolioLabel: 'mxsourav.dev',
    portfolioUrl: 'https://mxsourav.dev',
  },
  {
    handle: '@joyxcode2005',
    githubUrl: 'https://github.com/joyxcode2005',
    portfolioLabel: 'portfolio.joycodes.me',
    portfolioUrl: 'https://portfolio.joycodes.me',
  },
];

export default function Footer() {
  const { user, logout: storeLogout } = useStore();
  const { logout: authLogout } = useAuthStore();
  const navigate = useNavigate();

  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

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

  const handleLogout = () => {
    storeLogout();
    authLogout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <footer className="mt-8 bg-gradient-to-b from-slate-950 to-black text-slate-300">
      <style>{`
        .tw-dev-box {
          display: inline-flex;
          align-items: center;
          justify-content: flex-start;
          padding: 5px 10px;
          padding-right: 38px;
          min-height: 42px;
          min-width: 148px;
          border-radius: 8px;
          background: rgba(48, 209, 88, 0.02);
          border: 1px solid rgba(48, 209, 88, 0.22);
          position: relative;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2), inset 0 0 8px rgba(48, 209, 88, 0.04);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .tw-dev-box:hover {
          border-color: rgba(48, 209, 88, 0.45);
          background: rgba(48, 209, 88, 0.05);
          box-shadow: 0 4px 14px rgba(48, 209, 88, 0.14), inset 0 0 10px rgba(48, 209, 88, 0.07);
          transform: translateY(-1px);
        }
        .tw-dev-handle {
          font-size: 0.76rem;
          font-weight: 800;
          color: #30d158;
          text-decoration: none;
          letter-spacing: 0.01em;
          text-shadow: 0 0 8px rgba(48, 209, 88, 0.55);
          line-height: 1.1;
          transition: color 0.25s ease, text-shadow 0.25s ease;
        }
        .tw-dev-handle:hover {
          color: #ffffff;
          text-shadow: 0 0 14px rgba(48, 209, 88, 0.8);
        }
        .tw-dev-portfolio {
          font-size: 0.6rem;
          font-weight: 600;
          color: #a1a1aa;
          text-decoration: none;
          letter-spacing: 0.02em;
          line-height: 1.1;
          transition: color 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }
        .tw-dev-portfolio:hover {
          color: #30d158;
        }
        .tw-github-badge {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #ffffff;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }
        .tw-github-badge img {
          width: 21px;
          height: 21px;
          object-fit: contain;
          margin-bottom: -1px;
        }
        .tw-github-badge:hover {
          transform: translateY(-50%) scale(1.08);
          box-shadow: 0 0 12px rgba(255, 255, 255, 0.4);
        }
      `}</style>

      {/* Enterprise B2B & Institutional Sales Section */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 pt-8 pb-2">
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900/80 p-5 sm:p-7 shadow-2xl backdrop-blur-md">
          {/* Subtle Ambient Backlight Glow */}
          <div className="pointer-events-none absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-12 -top-12 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Column: Heading, Value Proposition & Segment Tags */}
            <div className="lg:col-span-5 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <Building2 className="h-3.5 w-3.5" />
                <span>B2B & Institutional Sales</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                Institutional & Bulk Purchases
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Special institutional discounts, custom quotations, and bulk supply for schools, colleges, academic libraries, and corporate book drives.
              </p>

              {/* Institutional Segments Badges */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-medium text-slate-400">
                <span className="rounded-md bg-white/[0.05] px-2 py-0.5 border border-white/[0.06] text-slate-300">Schools</span>
                <span className="rounded-md bg-white/[0.05] px-2 py-0.5 border border-white/[0.06] text-slate-300">Colleges</span>
                <span className="rounded-md bg-white/[0.05] px-2 py-0.5 border border-white/[0.06] text-slate-300">Universities</span>
                <span className="rounded-md bg-white/[0.05] px-2 py-0.5 border border-white/[0.06] text-slate-300">Academic Libraries</span>
                <span className="rounded-md bg-white/[0.05] px-2 py-0.5 border border-white/[0.06] text-slate-300">Coaching Institutes</span>
              </div>
            </div>

            {/* Right Column: Interactive B2B Sales Desk Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card 1: Direct Institutional Sales Desk */}
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5 transition-all duration-200 hover:border-emerald-500/40 hover:bg-white/[0.06] flex flex-col justify-between space-y-3.5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
                      Direct Sales Desk
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Priority Response
                    </span>
                  </div>

                  <h3 className="mt-1 text-sm font-bold text-white">
                    Md. Washim Akram
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Head of Institutional Sales / B2B Accounts
                  </p>

                  <div className="mt-2.5 flex items-center justify-between rounded-lg bg-black/40 px-2.5 py-1.5 border border-white/[0.06]">
                    <a
                      href="tel:+917479135626"
                      className="text-xs font-semibold text-emerald-300 hover:text-emerald-200 transition-colors font-mono tracking-tight"
                      aria-label="Call Md. Washim Akram at +91 747 913 5626"
                    >
                      +91 747 913 5626
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="text-slate-400 hover:text-white transition-colors p-1 rounded"
                      title="Copy phone number"
                      aria-label="Copy phone number +91 747 913 5626"
                    >
                      {copiedPhone ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href="tel:+917479135626"
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/80 px-2.5 py-1.5 text-xs font-semibold text-white border border-slate-700/60 hover:bg-slate-700 transition-all text-center"
                    aria-label="Call institutional sales desk directly"
                  >
                    <PhoneCall className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Call Now</span>
                  </a>

                  <a
                    href="https://wa.me/917479135626?text=Hi%20Md.%20Washim,%20we%20require%20a%20bulk%20quote%20for%20our%20institution"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#25D366]/20 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 border border-[#25D366]/40 hover:bg-[#25D366]/30 transition-all text-center"
                    aria-label="Chat on WhatsApp for institutional bulk quotation"
                  >
                    {/* Inline WhatsApp SVG */}
                    <svg className="h-3.5 w-3.5 fill-current text-[#25D366]" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.884 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Card 2: Primary B2B Support Email */}
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5 transition-all duration-200 hover:border-emerald-500/40 hover:bg-white/[0.06] flex flex-col justify-between space-y-3.5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
                      Official Quotation Desk
                    </span>
                    <span className="text-[10px] text-slate-400">
                      24h SLA Turnaround
                    </span>
                  </div>

                  <h3 className="mt-1 text-sm font-bold text-white">
                    Institutional Accounts Team
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Custom POs, Tender Submissions & Library Invoices
                  </p>

                  <div className="mt-2.5 flex items-center justify-between rounded-lg bg-black/40 px-2.5 py-1.5 border border-white/[0.06]">
                    <a
                      href="mailto:team@technoworldbooks.in?subject=Request%20for%20Bulk%20Quotation%20%2F%20Institutional%20Purchase"
                      className="text-xs font-semibold text-emerald-300 hover:text-emerald-200 transition-colors font-mono tracking-tight truncate max-w-[190px]"
                      aria-label="Email institutional support at team@technoworldbooks.in"
                    >
                      team@technoworldbooks.in
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="text-slate-400 hover:text-white transition-colors p-1 rounded shrink-0 ml-1"
                      title="Copy email address"
                      aria-label="Copy email team@technoworldbooks.in"
                    >
                      {copiedEmail ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Email Action Link */}
                <div className="pt-1">
                  <a
                    href="mailto:team@technoworldbooks.in?subject=Request%20for%20Bulk%20Quotation%20%2F%20Institutional%20Purchase"
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 transition-all text-center"
                    aria-label="Request quotation via pre-filled email"
                  >
                    <Mail className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Request Quotation</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                  </a>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-6 md:grid-cols-12 md:gap-8">
        
        {/* Col 1: Address (Takes more space) */}
        <div className="space-y-3 md:col-span-5 lg:col-span-4">
          <div className="flex items-start gap-2 text-sm leading-relaxed">
            <MapPin className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
            <p>
              Address: 90/6A, Mahatma Gandhi Rd, opp. Grace Cinema, Calcutta University, College Street, Kolkata, West Bengal 700007
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold mt-2">
            <Phone className="h-4 w-4 shrink-0 text-slate-400" />
            <p>Call Us : 033 2219 6115</p>
          </div>
          
          {/* Payment Icons */}
          <div className="mt-3 flex items-center gap-2 pt-1">
            <div className="flex h-7 w-12 items-center justify-center rounded bg-gradient-to-br from-blue-400 to-blue-600 text-[9px] font-black text-white shadow">AMEX</div>
            <div className="flex h-7 w-12 items-center justify-center rounded bg-gradient-to-br from-blue-700 to-blue-900 text-[11px] font-black text-white shadow italic">VISA</div>
            <div className="flex h-7 w-12 relative items-center justify-center rounded bg-white shadow overflow-hidden">
               <div className="w-4 h-4 rounded-full bg-red-500 absolute left-1 mix-blend-multiply"></div>
               <div className="w-4 h-4 rounded-full bg-yellow-500 absolute right-1 mix-blend-multiply"></div>
            </div>
          </div>
        </div>

        {/* Col 2: Useful Links */}
        <div className="md:col-span-2 lg:col-span-3 lg:pl-10">
          <h3 className="mb-2 text-sm font-bold text-white uppercase tracking-wider">Useful Links</h3>
          <ul className="space-y-1.5 text-sm">
            <li><Link to="/about" className="hover:text-amber-400 transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-amber-400 transition-colors">Contact Us</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link></li>
            <li><Link to="/shipping-policy" className="hover:text-amber-400 transition-colors">Shipping Policy</Link></li>
            <li><Link to="/admin/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">Admin Login</Link></li>
          </ul>
        </div>

        {/* Col 3: Policy & Account */}
        <div className="md:col-span-3 lg:col-span-2">
          <h3 className="mb-2 text-sm font-bold text-white uppercase tracking-wider">Policy & Account</h3>
          <ul className="space-y-1.5 text-sm">
            <li><Link to="/profile" className="hover:text-amber-400 transition-colors">My Account</Link></li>
            <li><Link to="/checkout" className="hover:text-amber-400 transition-colors">Checkout</Link></li>
            <li><Link to="/refund-policy" className="hover:text-amber-400 transition-colors">Replacement & Refund Policy</Link></li>
            <li>
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hover:text-rose-400 text-left transition-colors"
                >
                  Log out
                </button>
              ) : (
                <Link to="/profile" className="hover:text-emerald-400 transition-colors">Login / Sign In</Link>
              )}
            </li>
          </ul>
        </div>

        {/* Col 4: Follow Us */}
        <div className="md:col-span-2 lg:col-span-3">
          <h3 className="mb-2 text-sm font-bold text-white uppercase tracking-wider">Follow Us</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                <Globe className="h-4 w-4" /> Facebook
              </a>
            </li>
            <li>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                <Camera className="h-4 w-4" /> Instagram
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Developer Credits Strip (AquaNexus Server Style) */}
      <div className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 py-2.5 flex flex-col lg:flex-row items-center justify-between gap-2.5">
          <div className="flex flex-col items-center lg:items-start gap-0.5 text-center lg:text-left">
            <span className="text-[11px] font-bold tracking-[0.08em] text-slate-400 uppercase">
              © {new Date().getFullYear()} Techno World Books. All rights reserved.
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-slate-600 uppercase">
              Official Online Bookstore • College Street, Kolkata
            </span>
          </div>

          <div className="flex flex-row flex-wrap items-center gap-2 justify-center">
            {DEVELOPERS.map((dev) => (
              <div key={dev.handle} className="tw-dev-box">
                <div className="flex flex-col items-start justify-center gap-0.5">
                  <span className="text-[8px] font-bold tracking-[0.08em] text-[#8e8e93] uppercase leading-none">
                    DEVELOPER
                  </span>
                  <a
                    href={dev.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="tw-dev-handle"
                  >
                    {dev.handle}
                  </a>
                  <a
                    href={dev.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="tw-dev-portfolio"
                  >
                    <Globe className="h-2 w-2 text-emerald-400/80" />
                    {dev.portfolioLabel}
                  </a>
                </div>
                <a
                  href={dev.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${dev.handle} GitHub`}
                  className="tw-github-badge"
                >
                  <img src="/github-logo.png" alt="GitHub" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Link, useNavigate } from 'react-router';
import { MapPin, Phone, Globe, Camera } from 'lucide-react';
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

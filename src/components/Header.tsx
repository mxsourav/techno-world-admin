import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  BookOpen, ShoppingCart, Heart, User, Menu, Search, Mic, MessageCircle,
  History, TrendingUp, ChevronDown, LogOut, MapPin, Tag
} from 'lucide-react';
import { POPULAR_SEARCHES } from '@/data/blog';
import { useStore } from '@/store/StoreContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { searchService, categoryService } from '@/services/api';

function LoginDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login } = useStore();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const sendOtp = () => {
    if (phone.length < 10) return toast.error('Enter a valid 10-digit mobile number');
    setStep('otp');
    toast.success('OTP sent! (demo — any 4 digits work)');
  };
  const verify = () => {
    if (otp.length !== 4) return toast.error('Enter the 4-digit OTP');
    login({ name: 'Reader', email: `user${phone.slice(-4)}@mail.com`, phone, rewardPoints: 120 });
    toast.success('Welcome to Techno World Books!');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); setStep('phone'); setOtp(''); } }}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
        {/* Decorative Header with SVG elements */}
        <div className="relative bg-gradient-to-br from-emerald-800 to-emerald-950 px-6 py-10 text-center overflow-hidden">
          {/* Abstract SVG Background Patterns */}
          <svg className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,100 C30,60 70,60 100,100 L100,0 L0,0 Z" fill="currentColor" className="text-white" />
            <circle cx="80" cy="20" r="15" fill="currentColor" className="text-white" />
            <circle cx="20" cy="80" r="25" fill="currentColor" className="text-white" />
          </svg>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-black/20 ring-4 ring-white/10">
              <User className="h-8 w-8 text-emerald-700" />
            </div>
            <DialogTitle className="text-2xl font-extrabold text-white tracking-tight">
              Welcome to Techno World
            </DialogTitle>
            <p className="text-emerald-100 text-sm mt-2 max-w-[280px] mx-auto font-medium">
              Login to track orders, access your wishlist, and earn reward points.
            </p>
          </div>
        </div>

        <div className="px-8 py-8">
          {step === 'phone' ? (
            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Mobile Number</label>
                <div className="flex items-center gap-0 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
                  <div className="bg-slate-100 px-3.5 py-3 border-r border-slate-200 flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-600">+91</span>
                  </div>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit number"
                    className="w-full bg-transparent px-4 py-3 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 placeholder:font-normal"
                    inputMode="numeric"
                  />
                </div>
              </div>
              
              <button 
                onClick={sendOtp} 
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 hover:shadow-lg hover:-translate-y-0.5 transition-all active:translate-y-0"
              >
                <MessageCircle className="h-4 w-4" /> Send OTP Securely
              </button>

              <div className="relative text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest before:absolute before:left-0 before:top-1/2 before:h-px before:w-[40%] before:bg-slate-200 after:absolute after:right-0 after:top-1/2 after:h-px after:w-[40%] after:bg-slate-200 my-6">
                OR LOGIN WITH
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { login({ name: 'Google User', email: 'reader@gmail.com', phone: '', rewardPoints: 120 }); toast.success('Signed in with Google'); onClose(); }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  {/* Custom Google G SVG */}
                  <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
                <button
                  onClick={() => { login({ name: 'Email User', email: 'reader@example.com', phone: '', rewardPoints: 120 }); toast.success('Signed in with email'); onClose(); }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <svg className="h-4 w-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  Email
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-2">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Enter the verification code sent to</p>
                <p className="text-sm font-extrabold text-emerald-700 mt-1">+91 {phone}</p>
              </div>
              
              <div className="flex justify-center pt-2">
                <InputOTP maxLength={4} value={otp} onChange={setOtp} className="gap-2">
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot index={0} className="w-12 h-14 text-lg font-bold rounded-xl border-slate-200" />
                    <InputOTPSlot index={1} className="w-12 h-14 text-lg font-bold rounded-xl border-slate-200" />
                    <InputOTPSlot index={2} className="w-12 h-14 text-lg font-bold rounded-xl border-slate-200" />
                    <InputOTPSlot index={3} className="w-12 h-14 text-lg font-bold rounded-xl border-slate-200" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              
              <div className="pt-2">
                <button onClick={verify} className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 hover:-translate-y-0.5 transition-all active:translate-y-0">
                  Verify & Login
                </button>
              </div>
              
              <button onClick={() => setStep('phone')} className="text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors">
                ← Change mobile number
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SearchBar({ autoFocus = false, className = '' }: { autoFocus?: boolean; className?: string }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { searchHistory, addSearchToHistory } = useStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    if (q.trim().length > 1) {
      setLoading(true);
      const timer = setTimeout(() => {
        searchService.instant(q.trim())
          .then(res => {
            if (res.success) setSuggestions(res.data);
          })
          .catch(() => setSuggestions([]))
          .finally(() => setLoading(false));
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setLoading(false);
    }
  }, [q]);

  const submit = (term?: string) => {
    const t = (term ?? q).trim();
    if (!t) return;
    addSearchToHistory(t);
    setOpen(false);
    setQ('');
    navigate(`/search?q=${encodeURIComponent(t)}`);
  };

  const voice = () => {
    type SpeechRec = { lang: string; onresult: ((e: { results: { 0: { 0: { transcript: string } } } }) => void) | null; start: () => void };
    const SR = (window as unknown as { webkitSpeechRecognition?: new () => SpeechRec }).webkitSpeechRecognition;
    if (!SR) return toast.error('Voice search is not supported in this browser');
    const rec = new SR();
    rec.lang = 'en-IN';
    rec.onresult = (e: { results: { 0: { 0: { transcript: string } } } }) => { const t = e.results[0][0].transcript; setQ(t); submit(t); };
    rec.start();
    toast.info('Listening… speak a book title or author');
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className="flex items-stretch rounded-full bg-white border-[4px] border-white shadow-sm h-full w-full min-h-[48px]">
        <div className="flex-1 flex items-center bg-transparent pl-4">
          <Search className="h-5 w-5 shrink-0 text-slate-400" />
          <input
            value={q}
            autoFocus={autoFocus}
            onChange={(e) => { setQ(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Search by title, author, ISBN, exam, university…"
            className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 self-stretch px-3"
          />
          <button onClick={voice} aria-label="Voice search" className="shrink-0 text-slate-400 hover:text-emerald-700 mx-2">
            <Mic className="h-5 w-5" />
          </button>
        </div>
        <button onClick={() => submit()} className="flex shrink-0 items-center justify-center px-8 bg-[#0a2e1f] text-white hover:bg-emerald-800 transition-colors rounded-r-full">
          <Search className="h-5 w-5" />
        </button>
      </div>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-96 overflow-auto rounded-lg border border-slate-100 bg-white py-2 shadow-xl">
          {loading ? (
            <div className="px-4 py-3 text-center text-sm text-slate-500">Loading...</div>
          ) : q.trim().length > 1 && suggestions.length === 0 ? (
            <div className="px-4 py-3 text-center text-sm text-slate-500">No books found</div>
          ) : suggestions.length > 0 ? (
            suggestions.map((b) => (
              <button
                key={b.id}
                onClick={() => { addSearchToHistory(b.title); setOpen(false); setQ(''); navigate(`/book/${b.slug}`); }}
                className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-emerald-50"
              >
                <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-800">{b.title}</span>
                  <span className="block truncate text-xs text-slate-500">{b.author} • {b.category}</span>
                </span>
              </button>
            )).concat(
              Array.from(new Set(suggestions.map(b => b.author))).map(author => (
                <button
                  key={`author-${author}`}
                  onClick={() => submit(author)}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-emerald-50 border-t border-slate-50"
                >
                  <User className="h-4 w-4 shrink-0 text-amber-500" />
                  <span className="truncate text-sm font-medium text-slate-700">Author: {author}</span>
                </button>
              ))
            ).concat(
              Array.from(new Set(suggestions.map(b => b.category))).map(cat => (
                <button
                  key={`cat-${cat}`}
                  onClick={() => submit(cat)}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-emerald-50 border-t border-slate-50"
                >
                  <Tag className="h-4 w-4 shrink-0 text-blue-500" />
                  <span className="truncate text-sm font-medium text-slate-700">Category: {cat}</span>
                </button>
              ))
            )
          ) : (
            <>
              {searchHistory.length > 0 && (
                <div className="px-4 pb-1 pt-1">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Recent searches</p>
                  {searchHistory.slice(0, 4).map((h) => (
                    <button key={h} onClick={() => submit(h)} className="flex w-full items-center gap-2 py-1.5 text-sm text-slate-600 hover:text-emerald-700">
                      <History className="h-3.5 w-3.5 text-slate-300" /> {h}
                    </button>
                  ))}
                </div>
              )}
              <div className="px-4 pb-1 pt-1">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Popular right now</p>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SEARCHES.slice(0, 6).map((p) => (
                    <button key={p} onClick={() => submit(p)} className="flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:border-emerald-300 hover:bg-emerald-50">
                      <TrendingUp className="h-3 w-3 text-emerald-600" /> {p}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}


export default function Header() {
  const { cart, wishlist, user, logout } = useStore();
  const [loginOpen, setLoginOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 450);
    window.addEventListener('scroll', onScroll);
    onScroll(); 
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    categoryService.getCategories().then((res: any) => setCategories(res.data)).catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#0a2e1f] text-white shadow-md transition-colors duration-300">
      {/* top strip */}
      <div className="hidden items-center justify-between bg-[#061d13] px-6 py-1.5 text-[11px] text-emerald-200 md:flex">
        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Delivering across India — 27,000+ pincodes</span>
        <div className="flex items-center gap-4">
          <Link to="/track" className="hover:text-white">Track Order</Link>
          <Link to="/help" className="hover:text-white">Help Center</Link>
          <Link to="/admin" className="hover:text-white">Seller/Admin</Link>
          <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white">
            <MessageCircle className="h-3 w-3" /> WhatsApp Support
          </a>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center px-3 py-3 sm:px-6">
        {/* Left Section (Fixed width to anchor search and balance centering) */}
        <div className="flex w-[220px] lg:w-[280px] shrink-0 items-center justify-start gap-3 sm:gap-5">
          {/* mobile menu */}
          <Sheet>
            <SheetTrigger className="md:hidden" aria-label="Menu"><Menu className="h-6 w-6" /></SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="bg-[#0a2e1f] p-4 text-white">
                <p className="flex items-center gap-2 font-bold"><img src="/techno_world.png" alt="Techno World Books Logo" className="h-8 w-auto object-contain brightness-0 invert" /></p>
                <p className="mt-1 text-xs text-emerald-200">{user ? `Hi, ${user.name}` : 'India ka apna bookstore'}</p>
              </div>
              <nav className="p-4">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Categories</p>
                {categories.map((c: any) => (
                  <Link key={c.slug} to={`/category/${c.slug}`} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-emerald-50">
                    {c.icon && <span className="text-emerald-700">{c.icon}</span>} <span>{c.name}</span>
                  </Link>
                ))}
                <div className="mt-3 border-t pt-3">
                  <Link to="/track" className="block rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-emerald-50">📦 Track Order</Link>
                  <Link to="/blog" className="block rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-emerald-50">✍️ Blog & Book Lists</Link>
                  <Link to="/help" className="block rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-emerald-50">❓ Help Center</Link>
                  <Link to="/admin" className="block rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-emerald-50">🛠️ Admin Panel</Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex shrink-0 items-center gap-2">
            <img src="/techno_world.png" alt="Techno World Books Logo" className="h-10 w-auto sm:h-[56px] object-contain brightness-0 invert" />
          </Link>
        </div>

        {/* Sticky Search Bar (Expands Left-to-Right because Right side has ml-auto) */}
        <div className={`hidden md:block transition-all duration-500 ease-in-out overflow-hidden mx-4 ${isScrolled ? 'flex-1 max-w-2xl opacity-100' : 'flex-none max-w-0 opacity-0'}`}>
          <SearchBar className="w-full rounded-full shadow-[0_12px_35px_rgba(0,0,0,0.6)] border-none ring-0" />
        </div>
        
        {/* Sticky Search Bar (Mobile Flex) */}
        <div className={`flex-1 md:hidden transition-all duration-300 ease-in-out ml-3`}>
          <SearchBar className="w-full rounded-full shadow-md shadow-black/40 border-none ring-0" />
        </div>

        {/* Right Section (Fixed width matches Left, ml-auto pushes it to right edge) */}
        <div className="flex w-[220px] lg:w-[280px] shrink-0 items-center justify-end ml-auto">
          <nav className="flex shrink-0 items-center gap-2 sm:gap-4">
            {user ? (
              <Link to="/account" className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-emerald-800">
                <User className="h-6 w-6 sm:h-7 sm:w-7" />
                <span className="hidden max-w-20 truncate text-sm font-bold md:block">Hi, {user.name.split(' ')[0]}</span>
              </Link>
            ) : (
              <button onClick={() => setLoginOpen(true)} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-emerald-800">
                <User className="h-6 w-6 sm:h-7 sm:w-7" />
                <span className="hidden text-sm font-bold md:block">Login</span>
              </button>
            )}
            {user && (
              <button onClick={logout} title="Logout" className="hidden rounded-lg p-1.5 hover:bg-emerald-800 md:block">
                <LogOut className="h-5 w-5" />
              </button>
            )}
            <Link to="/wishlist" className="relative rounded-lg p-2 hover:bg-emerald-800" aria-label="Wishlist">
              <Heart className="h-6 w-6 sm:h-7 sm:w-7" />
              {wishlist.length > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold">{wishlist.length}</span>
              )}
            </Link>
            <Link to="/cart" className="relative rounded-lg p-2 hover:bg-emerald-800" aria-label="Cart">
              <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7" />
              {cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-slate-900">{cartCount}</span>
              )}
            </Link>
          </nav>
        </div>
      </div>

      {/* category strip */}
      <nav className="hidden border-t border-white/5 bg-[#0a2e1f] md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-1">
          <div className="relative flex flex-1 min-w-0 items-center before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-4 before:bg-gradient-to-r before:from-[#0a2e1f] before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-8 after:bg-gradient-to-l after:from-[#0a2e1f] after:to-transparent">
            <div className="flex w-full items-center gap-1 overflow-x-auto px-4 pr-20 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <span className="mr-2 flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-semibold text-emerald-300">
                <ChevronDown className="h-3.5 w-3.5" /> Shop by category
              </span>
              {categories.map((c: any) => (
                <Link key={c.slug} to={`/category/${c.slug}`} className="whitespace-nowrap rounded-full px-3 py-1 text-xs text-emerald-100 transition hover:bg-white/10 hover:text-white">
                  {c.name.replace(' Books', '')}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 pl-6 border-l border-white/10">
            <Link to="/about" className="whitespace-nowrap rounded-full px-4 py-1 text-xs font-bold text-emerald-100 transition-colors hover:bg-white/10 hover:text-white">About</Link>
            <Link to="/blog" className="whitespace-nowrap rounded-full px-4 py-1 text-xs font-bold text-amber-300 transition-colors hover:bg-white/10">Blog</Link>
          </div>
        </div>
      </nav>

      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  );
}

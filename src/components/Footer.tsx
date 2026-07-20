import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { MapPin, Phone, Globe, Camera } from 'lucide-react';

export default function Footer() {
  const [uptime, setUptime] = useState('');
  
  // Use today's date minus 12 hours so it starts showing hours/mins/secs
  // then rolls over to days organically as time passes.
  const [buildTime] = useState(() => new Date(Date.now() - (12 * 60 * 60 * 1000 + 45 * 60 * 1000)).getTime()); 
  
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Date.now() - buildTime;
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);
      
      let out = '';
      if (d > 0) out += `${d} days, `;
      out += `${h} hours, ${m} mins, ${s} secs`;
      setUptime(out);
    }, 1000);
    return () => clearInterval(timer);
  }, [buildTime]);

  const todayStr = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY
  const timeStr = new Date(buildTime).toLocaleTimeString('en-US');

  return (
    <footer className="mt-8 bg-gradient-to-b from-slate-950 to-black text-slate-300">
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
            <li><Link to="#" className="hover:text-amber-400 transition-colors">About Us</Link></li>
            <li><Link to="#" className="hover:text-amber-400 transition-colors">Contact Us</Link></li>
            <li><Link to="#" className="hover:text-amber-400 transition-colors">Privacy Policy</Link></li>
            <li><Link to="#" className="hover:text-amber-400 transition-colors">Terms of Service</Link></li>
            <li><Link to="#" className="hover:text-amber-400 transition-colors">Shipping Policy</Link></li>
          </ul>
        </div>

        {/* Col 3: Policy */}
        <div className="md:col-span-2 lg:col-span-2">
          <h3 className="mb-2 text-sm font-bold text-white uppercase tracking-wider">Policy</h3>
          <ul className="space-y-1.5 text-sm">
            <li><Link to="/account" className="hover:text-amber-400 transition-colors">My Account</Link></li>
            <li><Link to="/cart" className="hover:text-amber-400 transition-colors">Checkout</Link></li>
            <li><button className="hover:text-amber-400 transition-colors">Log out</button></li>
          </ul>
        </div>

        {/* Col 4: Follow Us */}
        <div className="md:col-span-3 lg:col-span-3">
          <h3 className="mb-2 text-sm font-bold text-white uppercase tracking-wider">Follow Us</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                <Globe className="h-4 w-4" /> Facebook
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                <Camera className="h-4 w-4" /> Instagram
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Developer Strip with Live Counter */}
      <div className="border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-3 text-[11px] font-bold tracking-widest text-slate-500 uppercase flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <p>
              <a href="https://github.com/mxsourav" target="_blank" rel="noreferrer" className="text-amber-400 hover:text-amber-300 transition-colors">mx_sourav</a>
              <span className="ml-3">TECHNO_WORLD_STOREFRONT_V3.0</span>
            </p>
            <p className="text-slate-600 font-medium">
              DATE: {todayStr} &nbsp;&nbsp;&nbsp; LAST UPDATE: {timeStr}
            </p>
          </div>
          <div className="text-right flex flex-col items-end gap-1">
            <p className="text-slate-600">UPTIME COUNTER</p>
            <p className="text-emerald-400 font-mono tracking-normal text-xs font-medium bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900/50">
              {uptime}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

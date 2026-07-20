import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Loader2, Mail, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/AuthStore';
import technoLogo from '@/assets/images/techno_world.png';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        login(data.data.accessToken, data.data.user);
        toast.success('Welcome back!');
        navigate('/admin/dashboard');
      } else {
        toast.error(data.message || 'Invalid credentials');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md p-6 relative z-10">
        <div className="bg-slate-900/50 backdrop-blur-2xl rounded-3xl border border-slate-800 p-10 shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="mb-6 flex justify-center w-full">
              <img src={technoLogo} alt="Techno World Books" className="h-16 object-contain invert opacity-90 drop-shadow-md" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h1>
            <p className="text-slate-400 text-sm mt-2">Sign in to manage your store</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Username</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl py-3.5 transition-all shadow-lg shadow-emerald-900/50 hover:shadow-emerald-900/80 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
            </button>
          </form>
        </div>
        
        <p className="text-center text-xs text-slate-600 mt-8 font-medium">
          &copy; {new Date().getFullYear()} Techno World Books. All rights reserved.
        </p>
      </div>
    </div>
  );
}

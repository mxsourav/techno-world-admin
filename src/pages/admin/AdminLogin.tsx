import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/AuthStore';
import { authService } from '@/services/api';
import technoLogo from '@/assets/images/techno_world.png';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please enter both username/email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login({ email: email.trim(), password });
      
      if (res.success) {
        const token = res.data?.accessToken || res.data?.token || '';
        const refreshToken = res.data?.refreshToken || '';
        if (refreshToken) {
          localStorage.setItem('tw_admin_refresh_token', refreshToken);
        }
        const userData = res.data?.user || res.data;
        login(token, userData);
        toast.success(`Welcome back, ${userData.name || 'Admin'}!`);
        navigate('/admin/dashboard');
      } else {
        toast.error(res.message || 'Invalid credentials');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please check your credentials or server connection.');
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
        <div className="bg-slate-900/50 backdrop-blur-2xl rounded-3xl border border-slate-800 p-8 sm:p-10 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="mb-5 flex justify-center w-full">
              <img src={technoLogo} alt="Techno World Books" className="h-14 object-contain invert opacity-90 drop-shadow-md" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Sign in with username/email and password</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
                Username / Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
                  placeholder="admin or admin@technoworldbooks.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
                  placeholder="Enter admin password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl py-3 transition-all shadow-lg shadow-emerald-900/50 hover:shadow-emerald-900/80 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  <ShieldCheck className="h-4 w-4" /> Sign In to Dashboard
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-5 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-500">
              Techno World Books Administrative Control Center
            </p>
          </div>
        </div>
        
        <p className="text-center text-xs text-slate-600 mt-6 font-medium">
          &copy; {new Date().getFullYear()} Techno World Books. All rights reserved.
        </p>
      </div>
    </div>
  );
}


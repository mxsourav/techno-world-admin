import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, Phone, KeyRound } from 'lucide-react';
import { useAuthStore } from '@/store/AuthStore';
import { authService } from '@/services/api';
import technoLogo from '@/assets/images/techno_world.png';

export default function AdminLogin() {
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await authService.login({ email, password });
      
      if (res.success) {
        const token = res.data?.accessToken || res.data?.token || '';
        const refreshToken = res.data?.refreshToken || '';
        if (refreshToken) {
          localStorage.setItem('tw_admin_refresh_token', refreshToken);
        }
        const userData = res.data?.user || res.data;
        login(token, userData);
        toast.success('Welcome back, Admin!');
        navigate('/admin/dashboard');
      } else {
        toast.error(res.message || 'Invalid credentials');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 10) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.sendOtp(clean);
      if (res.success) {
        setOtpSent(true);
        const isSandbox = (res as any).sandboxMode || res.data?.sandboxMode;
        const devCode = (res as any).devOtp || res.data?.devOtp || '1234';
        if (isSandbox) {
          toast.success(`Admin OTP sent! (Sandbox Code: ${devCode})`);
        } else {
          toast.success(res.message || 'OTP sent successfully!');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      toast.error('Please enter the 4-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.verifyOtp({ phone: phone.trim(), otp: otp.trim() });
      if (res.success && res.data) {
        const token = res.data.accessToken || '';
        const refreshToken = res.data.refreshToken || '';
        if (refreshToken) {
          localStorage.setItem('tw_admin_refresh_token', refreshToken);
        }
        const userData = res.data.user;
        login(token, userData);
        toast.success(`Welcome back, ${userData.name}!`);
        navigate('/admin/dashboard');
      } else {
        toast.error(res.message || 'Invalid OTP code');
      }
    } catch (err: any) {
      toast.error(err.message || 'OTP verification failed');
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
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Sign in to manage your store & orders</p>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => setAuthMode('password')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === 'password'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('otp')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === 'otp'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mobile OTP
            </button>
          </div>

          {authMode === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Username / Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    placeholder="admin"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl py-3 transition-all shadow-lg shadow-emerald-900/50 hover:shadow-emerald-900/80 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Admin Mobile Number</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                      placeholder="9830012345"
                      maxLength={12}
                    />
                  </div>
                  <button
                    type="button"
                    disabled={loading || phone.length < 10}
                    onClick={handleSendOtp}
                    className="px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl disabled:opacity-40 transition-colors"
                  >
                    {otpSent ? 'Resend' : 'Send OTP'}
                  </button>
                </div>
              </div>

              {otpSent && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Enter 4-Digit OTP</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-200 text-sm tracking-widest font-mono text-center focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                      placeholder="1234"
                      maxLength={4}
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 text-center">
                    Default sandbox code is <span className="text-emerald-400 font-mono font-bold">1234</span>
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !otpSent || otp.length < 4}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl py-3 transition-all shadow-lg shadow-emerald-900/50 hover:shadow-emerald-900/80 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify & Enter Portal'}
              </button>
            </form>
          )}
        </div>
        
        <p className="text-center text-xs text-slate-600 mt-6 font-medium">
          &copy; {new Date().getFullYear()} Techno World Books. All rights reserved.
        </p>
      </div>
    </div>
  );
}

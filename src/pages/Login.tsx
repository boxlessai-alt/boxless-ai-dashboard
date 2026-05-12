import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter both username and password');
      return;
    }
    setIsSubmitting(true);
    try {
      await login(username, password);
      toast.success('Welcome back!');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 bg-[#2D0A2D]">
      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#4D1F4D]/40 to-[#4D1F4D]/10 border border-[#4D1F4D]/25 flex items-center justify-center mx-auto mb-5 accent-glow">
          <Lock size={32} className="text-[#FFB266]" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Boxless AI</h1>
        <p className="text-sm text-white/50">Approval Dashboard</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="glass-card p-4 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60 ml-1">Username</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#FFB266]/40 focus:ring-1 focus:ring-[#FFB266]/20 transition-all duration-200"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60 ml-1">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#FFB266]/40 focus:ring-1 focus:ring-[#FFB266]/20 transition-all duration-200"
                autoComplete="current-password"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-gradient-to-r from-[#4D1F4D] to-[#6b2f6b] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed accent-glow"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

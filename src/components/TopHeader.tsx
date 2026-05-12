import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function TopHeader() {
  const { user, logout } = useAuth();

  const displayName = user?.name ?? user?.username ?? 'User';

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-white/[0.06] bg-[#2D0A2D]/80 backdrop-blur-xl shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-white">Boxless AI</span>
        <span className="text-[10px] font-semibold text-[#FFB266]/70 uppercase tracking-[0.1em] ml-1">
          Approval Dashboard
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-white/40">
          Logged in as <span className="text-[#FFB266]/80 font-medium">{displayName}</span>
        </span>
        <button
          onClick={logout}
          className="p-2 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all duration-200"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}

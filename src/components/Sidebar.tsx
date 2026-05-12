import { NavLink } from 'react-router';
import {
  Layers,
  CheckCircle2,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQueue } from '@/hooks/useQueue';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/', label: 'Queue', icon: Layers },
  { to: '/approved', label: 'Approved', icon: CheckCircle2 },
  { to: '/stats', label: 'Stats', icon: BarChart3 },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { pendingCount } = useQueue();

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user?.username?.slice(0, 2).toUpperCase() ?? 'U';

  const displayName = user?.name ?? user?.username ?? 'User';

  const navItems = user?.role === 'admin'
    ? [...NAV_ITEMS, { to: '/settings', label: 'Settings', icon: Settings }]
    : NAV_ITEMS;

  return (
    <aside className="w-[220px] min-w-[220px] h-screen bg-[#1a0818] border-r border-white/[0.06] flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-5 pt-6 pb-2">
        <h1 className="text-lg font-bold text-white tracking-tight">Boxless AI</h1>
        <p className="text-[10px] font-semibold text-[#4D1F4D] uppercase tracking-[0.12em] mt-0.5">
          Approval Dashboard
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'sidebar-active text-white'
                  : 'text-white/40 hover:text-white/70 hover:bg-[#4D1F4D]/20'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={18}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className={cn(
                    'transition-all duration-200',
                    isActive && 'text-[#FFB266]'
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {item.to === '/' && pendingCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold bg-[#FFB266] text-[#4D1F4D] rounded-full animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 pb-4 pt-2 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4D1F4D]/60 to-[#4D1F4D]/20 border border-[#4D1F4D]/30 flex items-center justify-center text-xs font-bold text-[#FFB266] shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{displayName}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all duration-200 shrink-0"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

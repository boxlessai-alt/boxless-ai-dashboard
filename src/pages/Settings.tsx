import { useState } from 'react';
import {
  Settings as SettingsIcon,
  LogOut,
  Bell,
  Shield,
  Mail,
  User,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Settings() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);

  const isAdmin = user?.role === 'admin' || user?.username === 'sylvia';

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user?.username?.slice(0, 2).toUpperCase() ?? 'U';

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500/20 to-slate-500/5 border border-slate-500/15 flex items-center justify-center">
          <SettingsIcon size={18} className="text-slate-400" />
        </div>
      </div>

      <div className="space-y-4">
        {/* User Card */}
        <div
          className="glass-card p-5 flex items-center gap-4 animate-fade-in-up"
          style={{ opacity: 0, animationFillMode: 'forwards' }}
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#4D1F4D]/50 to-[#4D1F4D]/15 border-2 border-[#4D1F4D]/30 flex items-center justify-center text-lg font-bold text-[#FFB266] shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-white font-semibold text-sm truncate">{user?.name ?? user?.username}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#4D1F4D]/20 text-[#d48aae] border border-[#4D1F4D]/30 capitalize">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Account Section */}
        <div
          className="glass-card overflow-hidden animate-fade-in-up"
          style={{ animationDelay: '50ms', opacity: 0, animationFillMode: 'forwards' }}
        >
          <div className="px-5 py-3 border-b border-white/[0.06]">
            <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Account</h3>
          </div>
          <div className="divide-y divide-white/[0.04]">
            <SettingRow icon={User} label="Role" value={user?.role ?? '—'} />
            <SettingRow icon={Mail} label="Email" value={user?.username ? `${user.username}@boxless.ai` : '—'} />
            <SettingRow icon={Shield} label="Status" value="Active" />
          </div>
        </div>

        {/* Preferences Section */}
        <div
          className="glass-card overflow-hidden animate-fade-in-up"
          style={{ animationDelay: '100ms', opacity: 0, animationFillMode: 'forwards' }}
        >
          <div className="px-5 py-3 border-b border-white/[0.06]">
            <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Preferences</h3>
          </div>
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <Bell size={16} className="text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-white font-medium">Notifications</p>
                <p className="text-[10px] text-white/40">Push notifications</p>
              </div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors duration-200',
                notifications ? 'bg-[#4D1F4D]' : 'bg-white/10'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-sm',
                  notifications && 'translate-x-5'
                )}
              />
            </button>
          </div>
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <div
            className="glass-card overflow-hidden animate-fade-in-up"
            style={{ animationDelay: '150ms', opacity: 0, animationFillMode: 'forwards' }}
          >
            <div className="px-5 py-3 border-b border-white/[0.06]">
              <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Admin</h3>
            </div>
            <div className="divide-y divide-white/[0.04]">
              <div className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">Google Sheets</p>
                    <p className="text-[10px] text-white/40">Integration status</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Connected
                </span>
              </div>
              <AdminRow icon={FileSpreadsheet} label="Sheet ID" value="boxless-ai-leads-sheet" />
              <AdminRow icon={Mail} label="Service Account" value="dashboard@boxless-ai.iam.gserviceaccount.com" />
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div
          className="animate-fade-in-up"
          style={{ animationDelay: '200ms', opacity: 0, animationFillMode: 'forwards' }}
        >
          <button
            onClick={handleLogout}
            className="w-full py-3.5 bg-[#e74c6f]/15 text-[#e74c6f] font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 hover:bg-[#e74c6f]/25 border border-[#e74c6f]/20"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="px-5 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
          <Icon size={14} className="text-white/40" />
        </div>
        <span className="text-sm text-white/70">{label}</span>
      </div>
      <span className="text-xs text-white/50 truncate max-w-[200px]">{value}</span>
    </div>
  );
}

function AdminRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="px-5 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
          <Icon size={14} className="text-white/40" />
        </div>
        <span className="text-sm text-white/70">{label}</span>
      </div>
      <span className="text-[10px] text-white/40 truncate max-w-[240px] font-mono">{value}</span>
    </div>
  );
}

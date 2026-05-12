import { useState } from 'react';
import {
  Settings as SettingsIcon,
  LogOut,
  FileSpreadsheet,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';

export default function Settings() {
  const { user, logout } = useAuth();
  const { post } = useApi();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(60);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const isAdmin = user?.role === 'admin';

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user?.username?.slice(0, 2).toUpperCase() ?? 'U';

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setIsChangingPassword(true);
    try {
      await post('/api/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleClearStats = async () => {
    setShowClearConfirm(false);
    try {
      await post('/api/clear-today-stats', {});
      toast.success("Today's stats cleared");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to clear stats');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
  };

  const sheetUrl = import.meta.env.VITE_SHEET_URL || 'https://docs.google.com/spreadsheets/d/boxless-ai-leads-sheet';

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

        {/* Password Change Section */}
        <div
          className="glass-card overflow-hidden animate-fade-in-up"
          style={{ animationDelay: '50ms', opacity: 0, animationFillMode: 'forwards' }}
        >
          <div className="px-5 py-3 border-b border-white/[0.06]">
            <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
              <Shield size={12} />
              Change Password
            </h3>
          </div>
          <div className="p-5 space-y-3">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#FFB266]/40 focus:ring-1 focus:ring-[#FFB266]/20 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#FFB266]/40 focus:ring-1 focus:ring-[#FFB266]/20 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#FFB266]/40 focus:ring-1 focus:ring-[#FFB266]/20 transition-all"
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className="w-full py-2.5 rounded-full bg-[#FFB266] text-[#4D1F4D] text-sm font-bold hover:bg-[#FFB266]/90 transition-all duration-200 disabled:opacity-50 mt-2"
            >
              {isChangingPassword ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#4D1F4D]/30 border-t-[#4D1F4D] rounded-full animate-spin" />
                  Changing...
                </span>
              ) : (
                'Change Password'
              )}
            </button>
          </div>
        </div>

        {/* Admin-only settings */}
        {isAdmin && (
          <>
            {/* Sheet Info */}
            <div
              className="glass-card overflow-hidden animate-fade-in-up"
              style={{ animationDelay: '100ms', opacity: 0, animationFillMode: 'forwards' }}
            >
              <div className="px-5 py-3 border-b border-white/[0.06]">
                <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
                  <FileSpreadsheet size={12} />
                  Google Sheets
                </h3>
              </div>
              <div className="p-5">
                <label className="text-xs text-white/50 mb-1 block">Sheet URL</label>
                <input
                  type="text"
                  readOnly
                  value={sheetUrl}
                  className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white/60 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Refresh Interval */}
            <div
              className="glass-card overflow-hidden animate-fade-in-up"
              style={{ animationDelay: '150ms', opacity: 0, animationFillMode: 'forwards' }}
            >
              <div className="px-5 py-3 border-b border-white/[0.06]">
                <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Refresh Interval
                </h3>
              </div>
              <div className="p-5">
                <div className="flex gap-4">
                  {[{ value: 30, label: '30s' }, { value: 60, label: '60s' }, { value: 120, label: '120s' }].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="refreshInterval"
                        value={opt.value}
                        checked={refreshInterval === opt.value}
                        onChange={() => setRefreshInterval(opt.value)}
                        className="accent-[#FFB266]"
                      />
                      <span className="text-sm text-white/70">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Clear Today's Stats */}
            <div
              className="glass-card overflow-hidden animate-fade-in-up"
              style={{ animationDelay: '200ms', opacity: 0, animationFillMode: 'forwards' }}
            >
              <div className="px-5 py-3 border-b border-white/[0.06]">
                <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider text-red-400">
                  Danger Zone
                </h3>
              </div>
              <div className="p-5">
                {!showClearConfirm ? (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="px-4 py-2 rounded-full border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
                  >
                    Clear Today&apos;s Stats
                  </button>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-amber-400 text-sm">
                      <AlertTriangle size={14} />
                      <span>Are you sure?</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="px-4 py-2 rounded-full border border-white/20 text-white/70 text-sm font-medium hover:bg-white/[0.06] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleClearStats}
                        className="px-4 py-2 rounded-full bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors border border-red-500/30"
                      >
                        Yes, Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Logout Button */}
        <div
          className="animate-fade-in-up"
          style={{ animationDelay: isAdmin ? '250ms' : '150ms', opacity: 0, animationFillMode: 'forwards' }}
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

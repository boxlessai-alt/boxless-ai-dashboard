import { useMemo } from 'react';
import { BarChart3, AlertTriangle } from 'lucide-react';
import { useStats } from '@/hooks/useStats';
import { useQueue } from '@/hooks/useQueue';
import EmptyState from '@/components/EmptyState';
import LoadingState from '@/components/LoadingState';
import StatCard from '@/components/StatCard';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { cn } from '@/lib/utils';
import {
  getActionTypeColor,
  getActionTypeLabel,
} from '@/types';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Generate mock weekly data based on available stats
function generateWeeklyData(todayActions: number) {
  const base = Math.max(1, Math.round((todayActions || 0) / 1.5));
  return WEEK_DAYS.map((day, i) => {
    const factor = i === new Date().getDay() - 1 ? 1.2 : 0.6 + Math.random() * 0.8;
    return {
      day,
      connections: Math.max(0, Math.round(base * factor * 0.6)),
      dms: Math.max(0, Math.round(base * factor * 0.8)),
      replies: Math.max(0, Math.round(base * factor * 0.3)),
    };
  });
}

const PIPELINE_STAGES = [
  { name: 'New', color: '#60a5fa' },
  { name: 'Searching', color: '#a78bfa' },
  { name: 'Warming', color: '#c084fc' },
  { name: 'Invite Sent', color: '#5eead4' },
  { name: 'Connected', color: '#34d399' },
  { name: 'DM Sent', color: '#fbbf24' },
  { name: 'Replied', color: '#fb923c' },
  { name: 'Nurture', color: '#f87171' },
];

export default function Stats() {
  const { stats, isLoading, error } = useStats();
  const { actions } = useQueue();

  const weeklyData = useMemo(
    () => generateWeeklyData(stats?.todayActions ?? 0),
    [stats?.todayActions]
  );

  // Needs attention: replied_flagged items
  const needsAttention = useMemo(() => {
    return actions.filter((a) => a.action_type === 'replied_flagged');
  }, [actions]);

  const actionsTaken = stats?.todayActions ?? 0;
  const progressPercent = Math.min(100, (actionsTaken / 50) * 100);
  const remaining = Math.max(0, 50 - actionsTaken);

  if (error) {
    return (
      <div>
        <h1 className="text-xl font-bold text-white mb-6">Dashboard Stats</h1>
        <EmptyState title="Error loading stats" message={error.message} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Dashboard Stats</h1>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFB266]/20 to-[#FFB266]/5 border border-[#FFB266]/15 flex items-center justify-center">
          <BarChart3 size={18} className="text-[#FFB266]" />
        </div>
      </div>

      {isLoading ? (
        <LoadingState count={4} />
      ) : !stats ? (
        <EmptyState icon={BarChart3} title="No stats available" message="Statistics data is unavailable" />
      ) : (
        <div className="space-y-6">
          {/* Stats Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Pending" value={stats.stats.pending} isPulsing />
            <StatCard label="Approved Today" value={stats.stats.approvedToday} />
            <StatCard label="Skipped Today" value={stats.stats.skippedToday} />
            <StatCard label="Sent Today" value={stats.stats.sentToday} />
          </div>

          {/* Pipeline Funnel */}
          <div className="glass-card p-5 animate-fade-in-up-delay-1">
            <h2 className="text-sm font-semibold text-white mb-4">Pipeline</h2>
            <div className="space-y-2">
              {PIPELINE_STAGES.map((stage, i) => {
                const mockCount = Math.max(0, Math.round((stats.totalActions || 0) * (1 - i * 0.12)));
                const maxCount = stats.totalActions || 1;
                const barWidth = maxCount > 0 ? Math.max(8, (mockCount / maxCount) * 100) : 8;
                return (
                  <div key={stage.name} className="flex items-center gap-3">
                    <span className="text-xs text-white/50 w-24 shrink-0 text-right">{stage.name}</span>
                    <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%`, background: stage.color }}
                      />
                    </div>
                    <span className="text-xs text-white/50 w-6 text-right shrink-0">{mockCount}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Activity */}
          <div className="glass-card p-5 animate-fade-in-up-delay-1">
            <h2 className="text-sm font-semibold text-white mb-4">Today&apos;s Activity</h2>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">Actions taken</span>
                  <span className="text-xs text-white font-medium">{actionsTaken} / 50</span>
                </div>
                <div className="h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPercent}%`,
                      background: 'linear-gradient(90deg, #FFB266, #ffcc88)',
                    }}
                  />
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-bold text-white">{remaining}</p>
                <p className="text-[10px] text-white/50 uppercase tracking-wider">remaining</p>
              </div>
            </div>
          </div>

          {/* Needs Attention */}
          {needsAttention.length > 0 && (
            <div className="glass-card p-5 animate-fade-in-up-delay-2 border-red-500/20">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={16} className="text-red-400" />
                <h2 className="text-sm font-semibold text-white">Needs Attention</h2>
              </div>
              <div className="space-y-2">
                {needsAttention.map((action) => {
                  const colors = getActionTypeColor(action.action_type);
                  return (
                    <div
                      key={action.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
                    >
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full border shrink-0',
                          colors.bg,
                          colors.text,
                          colors.border
                        )}
                      >
                        {getActionTypeLabel(action.action_type)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-sm font-medium truncate">{action.lead_name}</p>
                        <p className="text-white/40 text-xs truncate">{action.company}</p>
                      </div>
                      <span className="text-[10px] text-red-400 font-medium shrink-0">Replied</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Weekly Trend */}
          <div className="glass-card p-5 animate-fade-in-up-delay-3">
            <h2 className="text-sm font-semibold text-white mb-4">Weekly Trend</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={weeklyData}
                  margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="day"
                    stroke="rgba(255,255,255,0.2)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.2)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a0818',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="connections"
                    stroke="#60a5fa"
                    strokeWidth={2}
                    dot={{ fill: '#60a5fa', r: 3 }}
                    name="Connections"
                  />
                  <Line
                    type="monotone"
                    dataKey="dms"
                    stroke="#FFB266"
                    strokeWidth={2}
                    dot={{ fill: '#FFB266', r: 3 }}
                    name="DMs"
                  />
                  <Line
                    type="monotone"
                    dataKey="replies"
                    stroke="#34d399"
                    strokeWidth={2}
                    dot={{ fill: '#34d399', r: 3 }}
                    name="Replies"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Action Type Breakdown */}
          {stats.actionTypeBreakdown && Object.keys(stats.actionTypeBreakdown).length > 0 && (
            <div className="glass-card p-5 animate-fade-in-up-delay-3">
              <h2 className="text-sm font-semibold text-white mb-4">Action Type Breakdown</h2>
              <div className="space-y-2">
                {Object.entries(stats.actionTypeBreakdown).map(([type, count]) => {
                  const colors = getActionTypeColor(type);
                  return (
                    <div key={type} className="flex items-center gap-3">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full border shrink-0',
                          colors.bg,
                          colors.text,
                          colors.border
                        )}
                      >
                        {getActionTypeLabel(type)}
                      </span>
                      <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (count / (stats.totalActions || 1)) * 100)}%`,
                            background: '#FFB266',
                          }}
                        />
                      </div>
                      <span className="text-xs text-white/50 w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

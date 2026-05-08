import { BarChart3 } from 'lucide-react';
import { useStats } from '@/hooks/useStats';
import EmptyState from '@/components/EmptyState';
import LoadingState from '@/components/LoadingState';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { StatsResponse } from '@/types';

const CHART_COLORS = [
  '#d48aae',
  '#60a5fa',
  '#22d3ee',
  '#fbbf24',
  '#a78bfa',
  '#f472b6',
  '#34d399',
  '#fb923c',
];

export default function Stats() {
  const { stats, isLoading, error } = useStats();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard Stats</h1>
          <p className="text-xs text-white/40 mt-0.5">Real-time performance</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/15 flex items-center justify-center">
          <BarChart3 size={18} className="text-purple-400" />
        </div>
      </div>

      {isLoading ? (
        <LoadingState count={4} />
      ) : error ? (
        <EmptyState title="Error loading stats" message={error.message} />
      ) : !stats ? (
        <EmptyState icon={BarChart3} title="No stats available" message="Statistics data is unavailable" />
      ) : (
        <StatsContent stats={stats} />
      )}
    </div>
  );
}

function StatsContent({ stats }: { stats: StatsResponse }) {
  const summary = stats;

  return (
    <div className="space-y-6">
      {/* Summary Grid - 4 cards in a row */}
      <div className="grid grid-cols-4 gap-4">
        <SummaryCard label="Pending" value={summary.totalPending ?? 0} color="#fbbf24" delay={0} />
        <SummaryCard label="Approved Today" value={summary.totalApproved ?? 0} color="#34d399" delay={50} />
        <SummaryCard label="Conversion Rate" value={`${Math.round((summary.conversionRate ?? 0) * 100)}%`} color="#60a5fa" delay={100} />
        <SummaryCard label="Total Leads" value={summary.totalLeads ?? 0} color="#d48aae" delay={150} />
      </div>

      {/* Pipeline Funnel */}
      <ChartCard title="Pipeline Funnel" delay={200}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={summary.pipelineSummary ?? []}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.2)" fontSize={10} />
              <YAxis
                type="category"
                dataKey="stage"
                stroke="rgba(255,255,255,0.3)"
                fontSize={10}
                width={100}
                tickFormatter={(value: string) => value.length > 14 ? value.slice(0, 14) + '...' : value}
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
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {(summary.pipelineSummary ?? []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color ?? CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Weekly Trends */}
      <ChartCard title="Weekly Trends" delay={250}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={summary.weeklyTrends ?? []}
              margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" stroke="rgba(255,255,255,0.2)" fontSize={10} />
              <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a0818',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
              <Line type="monotone" dataKey="approved" stroke="#34d399" strokeWidth={2} dot={{ r: 3, fill: '#34d399' }} />
              <Line type="monotone" dataKey="skipped" stroke="#e74c6f" strokeWidth={2} dot={{ r: 3, fill: '#e74c6f' }} />
              <Line type="monotone" dataKey="pending" stroke="#fbbf24" strokeWidth={2} dot={{ r: 3, fill: '#fbbf24' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-3">
          <LegendItem color="#34d399" label="Approved" />
          <LegendItem color="#e74c6f" label="Skipped" />
          <LegendItem color="#fbbf24" label="Pending" />
        </div>
      </ChartCard>

      {/* Activity by Type */}
      <ChartCard title="Activity by Type" delay={300}>
        <div className="h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={summary.activityByType ?? []}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={3}
                dataKey="count"
                nameKey="type"
              >
                {(summary.activityByType ?? []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color ?? CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a0818',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Type Legend */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-3">
          {(summary.activityByType ?? []).map((entry, index) => (
            <LegendItem
              key={entry.type}
              color={entry.color ?? CHART_COLORS[index % CHART_COLORS.length]}
              label={entry.type}
            />
          ))}
        </div>
      </ChartCard>
    </div>
  );
}

function SummaryCard({ label, value, color, delay }: { label: string; value: string | number; color: string; delay: number }) {
  return (
    <div
      className="glass-card p-5 flex flex-col justify-center animate-fade-in-up"
      style={{
        animationDelay: `${delay}ms`,
        opacity: 0,
        animationFillMode: 'forwards',
      }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40 mb-2">{label}</p>
      <p className="text-2xl font-bold leading-tight" style={{ color }}>{value}</p>
    </div>
  );
}

function ChartCard({ title, children, delay }: { title: string; children: React.ReactNode; delay?: number }) {
  return (
    <div
      className="glass-card p-5 animate-fade-in-up"
      style={{
        animationDelay: `${delay ?? 0}ms`,
        opacity: 0,
        animationFillMode: 'forwards',
      }}
    >
      <h2 className="text-sm font-semibold text-white mb-4">{title}</h2>
      {children}
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[10px] text-white/50 capitalize">{label}</span>
    </div>
  );
}

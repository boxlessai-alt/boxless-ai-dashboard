import { useState } from 'react';
import { CheckCircle2, XCircle, CheckSquare } from 'lucide-react';
import { useApproved } from '@/hooks/useApproved';
import EmptyState from '@/components/EmptyState';
import LoadingState from '@/components/LoadingState';
import { cn } from '@/lib/utils';
import type { FilterType, ApprovedItem } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'approved', label: 'Approved' },
  { key: 'skipped', label: 'Skipped' },
];

const actionTypeLabels: Record<string, string> = {
  tier_followup: 'Tier Followup',
  tier_routed: 'Tier Routed',
  reply: 'Reply',
  walkthrough_nudge: 'Walkthrough Nudge',
  form_submitted: 'Form Submitted',
  outreach: 'Outreach',
  connection_request: 'Connection',
  followup: 'Follow-up',
};

const actionTypeColors: Record<string, string> = {
  tier_followup: 'bg-[#4D1F4D]/20 text-[#d48aae] border-[#4D1F4D]/30',
  tier_routed: 'bg-[#4D1F4D]/25 text-[#e8b8d0] border-[#4D1F4D]/35',
  reply: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  walkthrough_nudge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  form_submitted: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  outreach: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  connection_request: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  followup: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

export default function Approved() {
  const [filter, setFilter] = useState<FilterType>('all');
  const { items, isLoading, error } = useApproved(filter);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Approved History</h1>
          <p className="text-xs text-white/40 mt-0.5">{items.length} items</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/15 flex items-center justify-center">
          <CheckSquare size={18} className="text-emerald-400" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 border',
              filter === f.key
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-white/[0.03] text-white/40 border-white/[0.06] hover:bg-white/[0.06]'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingState count={3} />
      ) : error ? (
        <EmptyState title="Error loading history" message={error.message} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No history"
          message={`No ${filter === 'all' ? '' : filter} items found`}
        />
      ) : (
        <div className="space-y-3 max-w-3xl">
          {items.map((item, index) => (
            <HistoryCard key={item.id} item={item} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryCard({ item, index }: { item: ApprovedItem; index: number }) {
  const typeLabel = actionTypeLabels[item.action_type] ?? item.action_type;
  const typeColor = actionTypeColors[item.action_type] ?? 'bg-white/10 text-white/60 border-white/15';
  const isApproved = item.status === 'approved';

  let timeAgo = '';
  try {
    timeAgo = formatDistanceToNow(new Date(item.approved_date), { addSuffix: true });
  } catch {
    timeAgo = item.approved_date ?? 'Unknown';
  }

  return (
    <div
      className={cn(
        'glass-card p-4 animate-fade-in-up'
      )}
      style={{
        animationDelay: `${Math.min(index * 40, 250)}ms`,
        opacity: 0,
        animationFillMode: 'forwards',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full border', typeColor)}>
              {typeLabel}
            </span>
            <span className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border',
              isApproved
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-[#e74c6f]/20 text-[#e74c6f] border-[#e74c6f]/30'
            )}>
              {isApproved ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
              {isApproved ? 'Approved' : 'Skipped'}
            </span>
          </div>
          <h3 className="text-white font-semibold text-sm truncate">{item.lead_name}</h3>
          <p className="text-white/50 text-xs truncate">{item.company}</p>
        </div>
      </div>
      <p className="text-[10px] text-white/30 mt-2">{timeAgo}</p>
    </div>
  );
}

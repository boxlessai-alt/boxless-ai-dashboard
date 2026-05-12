import { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApproved } from '@/hooks/useApproved';
import EmptyState from '@/components/EmptyState';
import LoadingState from '@/components/LoadingState';
import { cn } from '@/lib/utils';
import {
  getActionTypeColor,
  getActionTypeLabel,
} from '@/types';
import type { QueueAction } from '@/types';

type DateRange = 'today' | 'week' | 'all';
type ActionTypeFilter = 'all' | 'dms' | 'comments' | 'invites' | 'followups';

const DATE_RANGE_OPTIONS: { key: DateRange; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'all', label: 'All Time' },
];

const ACTION_TYPE_OPTIONS: { key: ActionTypeFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'dms', label: 'DMs' },
  { key: 'comments', label: 'Comments' },
  { key: 'invites', label: 'Invites' },
  { key: 'followups', label: 'Follow-ups' },
];

export default function Approved() {
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [actionType, setActionType] = useState<ActionTypeFilter>('all');
  const { items, isLoading, error } = useApproved(dateRange, actionType);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Approved History</h1>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/15 flex items-center justify-center">
          <CheckCircle2 size={18} className="text-emerald-400" />
        </div>
      </div>

      {/* Filter Bars */}
      <div className="flex flex-col gap-3 mb-6">
        {/* Date Range */}
        <div className="flex gap-1.5 flex-wrap">
          {DATE_RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setDateRange(opt.key)}
              className={cn(
                'px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-200 border',
                dateRange === opt.key
                  ? 'bg-[#FFB266] text-[#4D1F4D] border-[#FFB266]'
                  : 'bg-white/[0.03] text-white/40 border-white/[0.06] hover:bg-white/[0.06] hover:text-white/60'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {/* Action Type */}
        <div className="flex gap-1.5 flex-wrap">
          {ACTION_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setActionType(opt.key)}
              className={cn(
                'px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-200 border',
                actionType === opt.key
                  ? 'bg-[#FFB266] text-[#4D1F4D] border-[#FFB266]'
                  : 'bg-white/[0.03] text-white/40 border-white/[0.06] hover:bg-white/[0.06] hover:text-white/60'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingState count={3} />
      ) : error ? (
        <EmptyState title="Error loading history" message={error.message} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No approved actions yet"
          message="Actions you approve will appear here."
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

function HistoryCard({ item, index }: { item: QueueAction; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const typeColors = getActionTypeColor(item.action_type);
  const typeLabel = getActionTypeLabel(item.action_type);
  const isApproved = item.approved === 'true' || item.approved === '1';
  const isSent = item.sent === 'true' || item.sent === '1';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
      className="glass-card p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {/* Action type badge */}
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full border',
                typeColors.bg,
                typeColors.text,
                typeColors.border
              )}
            >
              {typeLabel}
            </span>
            {/* Approved/Skipped badge */}
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border',
                isApproved
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-gray-500/15 text-gray-400 border-gray-500/30'
              )}
            >
              {isApproved ? 'Approved' : 'Skipped'}
            </span>
            {/* Sent badge */}
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full border',
                isSent
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-white/[0.04] text-white/30 border-white/[0.08]'
              )}
            >
              Sent: {isSent ? 'Yes' : 'No'}
            </span>
          </div>
          <h3 className="text-white font-semibold text-sm truncate">{item.lead_name}</h3>
          <p className="text-white/50 text-xs truncate">{item.company}</p>
        </div>
      </div>

      {/* Date */}
      {item.next_action_date && (
        <p className="text-[10px] text-white/30 mt-2">
          {new Date(item.next_action_date).toLocaleDateString()}
        </p>
      )}

      {/* Expandable Draft */}
      {item.draft_message && (
        <div className="mt-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[10px] text-white/40 hover:text-[#FFB266] transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp size={12} />
                Hide message
              </>
            ) : (
              <>
                <ChevronDown size={12} />
                Show message
              </>
            )}
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="text-white/60 text-xs mt-2 leading-relaxed bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
                  {item.draft_message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

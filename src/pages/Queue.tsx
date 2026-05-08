import { useState, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { useQueue } from '@/hooks/useQueue';
import { useStats } from '@/hooks/useStats';
import ActionCard from '@/components/ActionCard';
import EmptyState from '@/components/EmptyState';
import LoadingState from '@/components/LoadingState';
import StatCard from '@/components/StatCard';
import { cn } from '@/lib/utils';
import type { PriorityTab, QueueAction } from '@/types';

const TABS: { key: PriorityTab; label: string; color: string; bgColor: string; borderColor: string }[] = [
  { key: 'conversions', label: 'Conversions', color: 'text-[#d48aae]', bgColor: 'bg-[#4D1F4D]/15', borderColor: 'border-[#4D1F4D]/30' },
  { key: 'replies', label: 'Replies', color: 'text-cyan-400', bgColor: 'bg-cyan-500/15', borderColor: 'border-cyan-500/30' },
  { key: 'walkthrough', label: 'Walkthrough', color: 'text-amber-400', bgColor: 'bg-amber-500/15', borderColor: 'border-amber-500/30' },
  { key: 'outreach', label: 'Outreach', color: 'text-slate-300', bgColor: 'bg-slate-500/15', borderColor: 'border-slate-500/30' },
];

export default function Queue() {
  const [activeTab, setActiveTab] = useState<PriorityTab>('conversions');
  const { actions, grouped, isLoading, error, mutate } = useQueue();
  const { stats } = useStats();

  const getActionsForTab = (): QueueAction[] => {
    switch (activeTab) {
      case 'conversions': return grouped?.conversions ?? [];
      case 'replies': return grouped?.replies ?? [];
      case 'walkthrough': return grouped?.walkthrough ?? [];
      case 'outreach': return grouped?.outreach ?? [];
      default: return actions;
    }
  };

  const tabActions = getActionsForTab();
  const totalCount = actions?.length ?? 0;

  // Derive summary stats from queue data and stats API
  const pendingCount = totalCount;
  const approvedToday = stats?.totalApproved ?? 0;
  const skippedToday = stats?.totalSkipped ?? 0;
  // "Sent today" is approximated as approved + skipped (processed items today)
  const sentToday = approvedToday + skippedToday;

  // Check if error is a backend connectivity issue
  const isBackendError = useMemo(() => {
    if (!error) return false;
    const msg = error.message?.toLowerCase() ?? '';
    return msg.includes('backend') || msg.includes('not running') || msg.includes('deploy to render');
  }, [error]);

  return (
    <div>
      {/* Stat Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Pending" value={pendingCount} color="#FFB266" delay={0} />
        <StatCard label="Approved Today" value={approvedToday} color="#4ade80" delay={50} />
        <StatCard label="Skipped Today" value={skippedToday} color="#f87171" delay={100} />
        <StatCard label="Sent Today" value={sentToday} color="#60a5fa" delay={150} />
      </div>

      {/* Priority Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map((tab) => {
          const count = (grouped?.[tab.key]?.length) ?? 0;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 rounded-full border text-xs font-medium whitespace-nowrap transition-all duration-200',
                isActive
                  ? `${tab.bgColor} ${tab.color} ${tab.borderColor}`
                  : 'bg-white/[0.03] text-white/40 border-white/[0.06] hover:bg-white/[0.06] hover:text-white/60'
              )}
            >
              <span>{tab.label}</span>
              <span className={cn(
                'text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1',
                isActive ? 'bg-white/[0.1]' : 'bg-white/[0.06]'
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingState count={3} />
      ) : error ? (
        isBackendError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
              <AlertCircle size={28} className="text-[#FFB266]/50" />
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">Connecting to server...</h3>
            <p className="text-white/40 text-xs max-w-sm">
              The backend server is starting up. This may take a minute on Render's free tier.
              Please wait a moment and refresh the page.
            </p>
          </div>
        ) : (
          <EmptyState
            title="Error loading queue"
            message={error.message}
          />
        )
      ) : tabActions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3 max-w-3xl">
          {tabActions.map((action, index) => (
            <ActionCard
              key={action.id}
              action={action}
              onMutate={mutate}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}

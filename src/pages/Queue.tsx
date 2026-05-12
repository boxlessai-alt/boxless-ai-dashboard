import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useQueue } from '@/hooks/useQueue';
import { useApi } from '@/hooks/useApi';
import ActionCard from '@/components/ActionCard';
import EmptyState from '@/components/EmptyState';
import LoadingState from '@/components/LoadingState';
import StatCard from '@/components/StatCard';

export default function Queue() {
  const { actions, stats, repliedFlagged, pendingCount, isLoading, error, mutate } = useQueue();
  const { post } = useApi();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const prevPendingCountRef = useRef<number>(0);

  // Toast notifications for new items
  useEffect(() => {
    if (prevPendingCountRef.current > 0 && pendingCount > prevPendingCountRef.current) {
      toast(`${pendingCount} new action(s) ready for review`, {
        style: { background: '#4D1F4D', border: '1px solid #FFB266', color: 'white' },
        duration: 4000,
      });
    }
    prevPendingCountRef.current = pendingCount;
  }, [pendingCount]);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await post(`/api/approve/${id}`, {});
      toast.success('Action approved');
      mutate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to approve');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSkip = async (id: string) => {
    setProcessingId(id);
    try {
      await post(`/api/skip/${id}`, {});
      toast.success('Action skipped');
      mutate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to skip');
    } finally {
      setProcessingId(null);
    }
  };

  const handleEdit = async (id: string, draft: string) => {
    setProcessingId(id);
    try {
      await post(`/api/edit/${id}`, { draft_message: draft });
      toast.success('Edited and approved');
      mutate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to edit');
    } finally {
      setProcessingId(null);
    }
  };

  if (error) {
    const msg = error.message?.toLowerCase() ?? '';
    const isBackendError =
      msg.includes('backend') || msg.includes('not running') || msg.includes('deploy');
    return (
      <div>
        <h1 className="text-xl font-bold text-white mb-6">Approval Queue</h1>
        {isBackendError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
              <div className="w-8 h-8 border-2 border-[#FFB266]/30 border-t-[#FFB266] rounded-full animate-spin" />
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">Connecting to server...</h3>
            <p className="text-white/40 text-xs max-w-sm">
              The backend server is starting up. This may take a minute on Render's free tier.
              Please wait a moment and refresh the page.
            </p>
          </div>
        ) : (
          <EmptyState title="Error loading queue" message={error.message} />
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Approval Queue</h1>
        {pendingCount > 0 && (
          <span className="text-xs font-semibold text-[#FFB266] bg-[#FFB266]/10 px-2.5 py-1 rounded-full border border-[#FFB266]/20">
            {pendingCount} pending
          </span>
        )}
      </div>

      {/* Replied Flagged Banner */}
      {repliedFlagged && (
        <div className="bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-4 flex items-center gap-3 animate-pulse-subtle">
          <span className="text-lg">⚠</span>
          <p className="text-sm font-medium">
            A lead has replied. Review immediately.
          </p>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Pending"
          value={stats?.pending ?? pendingCount ?? 0}
          isPulsing={true}
        />
        <StatCard
          label="Approved Today"
          value={stats?.approvedToday ?? 0}
        />
        <StatCard
          label="Skipped Today"
          value={stats?.skippedToday ?? 0}
        />
        <StatCard
          label="Sent Today"
          value={stats?.sentToday ?? 0}
        />
      </div>

      {/* Queue List */}
      {isLoading ? (
        <LoadingState count={3} />
      ) : actions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3 max-w-3xl">
          {actions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              onApprove={handleApprove}
              onSkip={handleSkip}
              onEdit={handleEdit}
              isProcessing={processingId === action.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import { GitBranch } from 'lucide-react';
import { usePipeline } from '@/hooks/usePipeline';
import EmptyState from '@/components/EmptyState';
import LoadingState from '@/components/LoadingState';
import { cn } from '@/lib/utils';
import type { PipelineLane as PipelineLaneType } from '@/types';

const STAGE_CONFIG: Record<string, { color: string; bgColor: string; borderColor: string }> = {
  prospecting: { color: 'text-slate-300', bgColor: 'bg-slate-500/15', borderColor: 'border-slate-500/25' },
  connected: { color: 'text-blue-300', bgColor: 'bg-blue-500/15', borderColor: 'border-blue-500/25' },
  'in conversation': { color: 'text-cyan-300', bgColor: 'bg-cyan-500/15', borderColor: 'border-cyan-500/25' },
  replied: { color: 'text-amber-300', bgColor: 'bg-amber-500/15', borderColor: 'border-amber-500/25' },
  walkthrough: { color: 'text-purple-300', bgColor: 'bg-purple-500/15', borderColor: 'border-purple-500/25' },
  'form submitted': { color: 'text-pink-300', bgColor: 'bg-pink-500/15', borderColor: 'border-pink-500/25' },
  'tier routed': { color: 'text-[#d48aae]', bgColor: 'bg-[#4D1F4D]/15', borderColor: 'border-[#4D1F4D]/25' },
  'booking confirmed': { color: 'text-emerald-300', bgColor: 'bg-emerald-500/15', borderColor: 'border-emerald-500/25' },
};

export default function Pipeline() {
  const { lanes, isLoading, error } = usePipeline();

  const totalLeads = lanes.reduce((sum, lane) => sum + (lane.count ?? 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">Pipeline View</h1>
          <p className="text-xs text-white/40 mt-0.5">{totalLeads} leads across {lanes.length} stages</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4D1F4D]/30 to-[#4D1F4D]/10 border border-[#4D1F4D]/20 flex items-center justify-center">
          <GitBranch size={18} className="text-[#FFB266]" />
        </div>
      </div>

      {/* Pipeline Content */}
      {isLoading ? (
        <LoadingState count={3} />
      ) : error ? (
        <EmptyState title="Error loading pipeline" message={error.message} />
      ) : lanes.length === 0 ? (
        <EmptyState icon={GitBranch} title="No pipeline data" message="Pipeline is empty" />
      ) : (
        <div className="space-y-3">
          {lanes.map((lane, index) => (
            <PipelineLane key={lane.stage} lane={lane} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

function PipelineLane({ lane, index }: { lane: PipelineLaneType; index: number }) {
  const config = STAGE_CONFIG[lane.stage.toLowerCase()] ?? {
    color: 'text-white/60',
    bgColor: 'bg-white/[0.06]',
    borderColor: 'border-white/[0.1]',
  };

  return (
    <div
      className={cn('glass-card overflow-hidden animate-fade-in-up')}
      style={{
        animationDelay: `${Math.min(index * 50, 300)}ms`,
        opacity: 0,
        animationFillMode: 'forwards',
      }}
    >
      {/* Lane Header */}
      <div className={cn('flex items-center justify-between px-4 py-3 border-b', config.borderColor, config.bgColor)}>
        <div className="flex items-center gap-2">
          <span className={cn('text-xs font-semibold', config.color)}>{lane.stage}</span>
        </div>
        <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', config.bgColor, config.color)}>
          {lane.count}
        </span>
      </div>

      {/* Leads List */}
      {lane.leads && lane.leads.length > 0 ? (
        <div className="divide-y divide-white/[0.04]">
          {lane.leads.map((lead) => (
            <div
              key={lead.id}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.02] transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white font-medium truncate">{lead.lead_name}</p>
                <p className="text-[11px] text-white/40 truncate">{lead.company}</p>
              </div>
              <div className={cn(
                'shrink-0 ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold',
                lead.days_in_stage > 7
                  ? 'bg-[#e74c6f]/15 text-[#e74c6f]'
                  : lead.days_in_stage > 3
                    ? 'bg-[#FFB266]/15 text-[#FFB266]'
                    : 'bg-emerald-500/15 text-emerald-400'
              )}>
                {lead.days_in_stage}d
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 py-4 text-center">
          <p className="text-xs text-white/25">No leads in this stage</p>
        </div>
      )}
    </div>
  );
}

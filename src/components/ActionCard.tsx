import { ExternalLink, Quote, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import type { QueueAction } from '@/types';

interface ActionCardProps {
  action: QueueAction;
  onMutate: () => void;
  index?: number;
}

const priorityBorderColors: Record<string, string> = {
  high: 'border-l-[#e74c6f]',
  medium: 'border-l-[#FFB266]',
  low: 'border-l-emerald-400',
};

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

export default function ActionCard({ action, onMutate, index = 0 }: ActionCardProps) {
  const { post } = useApi();

  const handleApprove = async () => {
    try {
      await post(`/api/approve/${action.id}`);
      onMutate();
    } catch (_err) {
      // handled by useApi
    }
  };

  const handleSkip = async () => {
    try {
      await post(`/api/skip/${action.id}`);
      onMutate();
    } catch (_err) {
      // handled by useApi
    }
  };

  const borderColor = priorityBorderColors[action.priority.toLowerCase()] ?? priorityBorderColors.low;
  const typeLabel = actionTypeLabels[action.action_type] ?? action.action_type;
  const typeColor = actionTypeColors[action.action_type] ?? 'bg-white/10 text-white/60 border-white/15';

  const delayMs = Math.min(index * 50, 300);

  return (
    <div
      className={cn(
        'glass-card border-l-[3px] overflow-hidden',
        borderColor,
        'animate-fade-in-up'
      )}
      style={{
        animationDelay: `${delayMs}ms`,
        opacity: 0,
        animationFillMode: 'forwards',
      }}
    >
      {/* Card Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn('inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full border', typeColor)}>
                {typeLabel}
              </span>
              <PriorityDot priority={action.priority} />
            </div>
            <h3 className="text-white font-semibold text-sm truncate">{action.lead_name}</h3>
            <p className="text-white/50 text-xs truncate">{action.company}</p>
          </div>
          {action.linkedin_url && (
            <a
              href={action.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-[#FFB266] transition-all duration-200"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>

        {/* Variant-specific content */}
        <CardContent action={action} />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-0 border-t border-white/[0.06]">
        <button
          onClick={handleSkip}
          className="flex-1 py-3 text-xs font-semibold text-[#e74c6f] hover:bg-[#e74c6f]/10 transition-colors duration-200 flex items-center justify-center gap-1.5"
        >
          Skip
        </button>
        <div className="w-px bg-white/[0.06]" />
        <button
          onClick={handleApprove}
          className="flex-1 py-3 text-xs font-semibold text-[#FFB266] hover:bg-[#FFB266]/10 transition-colors duration-200 flex items-center justify-center gap-1.5 approve-glow"
        >
          Approve
        </button>
      </div>
    </div>
  );
}

function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    high: 'bg-[#e74c6f]',
    medium: 'bg-[#FFB266]',
    low: 'bg-emerald-400',
  };
  return (
    <span className={cn('w-1.5 h-1.5 rounded-full', colors[priority.toLowerCase()] ?? colors.low)} />
  );
}

function CardContent({ action }: { action: QueueAction }) {
  // Tier variant
  if (action.action_type === 'tier_followup' || action.action_type === 'tier_routed') {
    return (
      <div className="mt-2 space-y-2">
        {action.offer_tier && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Tier</span>
            <span className="text-xs font-semibold text-[#d48aae]">{action.offer_tier}</span>
          </div>
        )}
        {action.bottleneck_stage && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/40 uppercase tracking-wider">Stage</span>
              <span className="text-[10px] text-white/50">{action.bottleneck_stage}</span>
            </div>
            <StageProgress stage={action.bottleneck_stage} />
          </div>
        )}
      </div>
    );
  }

  // Reply variant
  if (action.action_type === 'reply') {
    return (
      <div className="mt-2">
        {action.reply_content && (
          <div className="relative bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
            <Quote size={14} className="text-white/20 mb-1" />
            <p className="text-xs text-white/70 italic leading-relaxed line-clamp-4">
              {action.reply_content}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Walkthrough variant
  if (action.action_type === 'walkthrough_nudge' || action.action_type === 'form_submitted') {
    return (
      <div className="mt-2 flex items-center gap-3">
        {action.days_since_sent !== undefined && (
          <div className="flex items-center gap-2 bg-amber-500/10 rounded-xl px-3 py-2 border border-amber-500/15">
            <Clock size={14} className="text-amber-400" />
            <div>
              <span className="text-xs font-bold text-amber-400">{action.days_since_sent}</span>
              <span className="text-[10px] text-white/40 ml-1">days since sent</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className="mt-1">
      <p className="text-[11px] text-white/40 capitalize">
        {action.action_type.replace(/_/g, ' ')}
      </p>
    </div>
  );
}

function StageProgress({ stage }: { stage: string }) {
  const stages = ['prospecting', 'connected', 'in conversation', 'replied', 'walkthrough', 'form submitted', 'tier routed', 'booking confirmed'];
  const currentIndex = stages.findIndex(s => s.toLowerCase() === stage.toLowerCase());
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / stages.length) * 100 : 30;

  return (
    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #4D1F4D, #d48aae)',
        }}
      />
    </div>
  );
}

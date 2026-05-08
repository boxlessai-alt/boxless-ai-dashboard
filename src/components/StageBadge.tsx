import { cn } from '@/lib/utils';

interface StageBadgeProps {
  stage: string;
  className?: string;
}

const stageStyles: Record<string, string> = {
  prospecting: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  connected: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'in conversation': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  replied: 'bg-[#FFB266]/20 text-[#FFB266] border-[#FFB266]/30',
  walkthrough: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'form submitted': 'bg-[#c47a9e]/20 text-[#c47a9e] border-[#c47a9e]/30',
  'tier routed': 'bg-[#c47a9e]/25 text-[#d48aae] border-[#c47a9e]/35',
  'booking confirmed': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

export default function StageBadge({ stage, className }: StageBadgeProps) {
  const key = stage.toLowerCase();
  const style = stageStyles[key] ?? 'bg-white/10 text-white/60 border-white/15';

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border',
        style,
        className
      )}
    >
      {stage}
    </span>
  );
}

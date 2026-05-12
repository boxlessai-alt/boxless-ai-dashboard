import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

const priorityStyles: Record<string, string> = {
  high: 'bg-[#e74c6f]/20 text-[#e74c6f] border-[#e74c6f]/30',
  medium: 'bg-[#FFB266]/20 text-[#FFB266] border-[#FFB266]/30',
  low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

export default function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const style = priorityStyles[priority.toLowerCase()] ?? priorityStyles.low;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border',
        style,
        className
      )}
    >
      {priority}
    </span>
  );
}

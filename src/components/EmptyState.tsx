import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  message?: string;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title = 'Queue is clear. Manus is working.',
  message = 'New items will appear here automatically.',
  className,
}: EmptyStateProps) {
  const IconComponent = Icon ?? Inbox;
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 text-center', className)}>
      <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
        <IconComponent size={36} className="text-white/15" />
      </div>
      <h3 className="text-white font-semibold text-base mb-1.5">{title}</h3>
      <p className="text-white/40 text-sm">{message}</p>
    </div>
  );
}

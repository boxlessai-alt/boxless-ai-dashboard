import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  isPulsing?: boolean;
}

export default function StatCard({
  label,
  value,
  isPulsing = false,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'glass-card p-4 flex flex-col justify-center relative',
        isPulsing && value > 0 && 'animate-pulse-subtle'
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50 mb-2">
        {label}
      </p>
      <p className="text-2xl font-bold text-white leading-tight">
        {value}
      </p>
      {isPulsing && value > 0 && (
        <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#FFB266] animate-pulse" />
      )}
    </div>
  );
}

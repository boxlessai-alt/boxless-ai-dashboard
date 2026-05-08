import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
  delay?: number;
  className?: string;
}

export default function StatCard({
  label,
  value,
  color = '#FFB266',
  delay = 0,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'glass-card p-5 flex flex-col justify-center animate-fade-in-up',
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
        opacity: 0,
        animationFillMode: 'forwards',
      }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40 mb-2">
        {label}
      </p>
      <p
        className="text-3xl font-bold leading-tight"
        style={{ color }}
      >
        {value}
      </p>
    </div>
  );
}

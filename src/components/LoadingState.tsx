import { Skeleton } from '@/components/ui/skeleton';

interface LoadingStateProps {
  count?: number;
}

export default function LoadingState({ count = 3 }: LoadingStateProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="glass-card p-4 space-y-3"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full bg-white/[0.06]" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4 bg-white/[0.06]" />
              <Skeleton className="h-3 w-1/2 bg-white/[0.04]" />
            </div>
          </div>
          <Skeleton className="h-3 w-full bg-white/[0.04]" />
          <Skeleton className="h-3 w-2/3 bg-white/[0.04]" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-9 flex-1 rounded-full bg-white/[0.06]" />
            <Skeleton className="h-9 flex-1 rounded-full bg-white/[0.06]" />
          </div>
        </div>
      ))}
    </div>
  );
}

import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, variant = 'text', width, height }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'animate-pulse bg-zinc-100',
        {
          'rounded-md h-4': variant === 'text',
          'rounded-full': variant === 'circular',
          'rounded-2xl': variant === 'rectangular',
        },
        className
      )}
      style={{ width, height }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-100 p-6 space-y-4">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-100">
          <Skeleton variant="circular" className="h-10 w-10 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function JobCardSkeleton() {
  return (
    <div
      className="card animate-fade-in p-6"
      role="status"
      aria-label="Loading job"
    >
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <Skeleton className="mt-5 h-6 w-3/5" />
      <Skeleton className="mt-3 h-4 w-2/5" />
      <Skeleton className="mt-5 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-4/5" />
      <div className="mt-6 flex gap-3">
        <Skeleton className="h-10 w-32 rounded-full" />
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
    </div>
  );
}

export function JobGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <JobCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function TableRowSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card animate-fade-in divide-y divide-line p-2" role="status">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 px-4 py-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="hidden h-4 w-24 sm:block" />
          <Skeleton className="hidden h-5 w-20 rounded-full md:block" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton h-40 w-full ${className}`} aria-hidden="true" />;
}

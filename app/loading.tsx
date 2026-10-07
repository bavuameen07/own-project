import { JobGridSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div className="page-container py-16">
      <div className="mx-auto max-w-2xl text-center">
        <Skeleton className="mx-auto h-6 w-40 rounded-full" />
        <Skeleton className="mx-auto mt-6 h-12 w-3/4" />
        <Skeleton className="mx-auto mt-4 h-5 w-1/2" />
        <div className="mt-8 flex justify-center gap-3">
          <Skeleton className="h-12 w-44 rounded-full" />
          <Skeleton className="h-12 w-36 rounded-full" />
        </div>
      </div>
      <div className="mt-20">
        <JobGridSkeleton count={3} />
      </div>
    </div>
  );
}

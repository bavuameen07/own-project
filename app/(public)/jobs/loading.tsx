import { JobGridSkeleton } from "@/components/ui/skeleton";

export default function JobsLoading() {
  return (
    <div className="page-container py-14 sm:py-20">
      <div className="max-w-2xl">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton mt-4 h-9 w-64" />
        <div className="skeleton mt-4 h-4 w-full" />
        <div className="skeleton mt-2 h-4 w-3/4" />
      </div>

      <div className="card mt-10 p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
          <div className="skeleton h-10 w-full" />
          <div className="skeleton h-10 w-full lg:w-52" />
          <div className="skeleton h-10 w-full lg:w-52" />
        </div>
      </div>

      <div className="mt-8">
        <JobGridSkeleton />
      </div>
    </div>
  );
}

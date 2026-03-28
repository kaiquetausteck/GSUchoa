export function TestimonialCardSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={`rounded-[2rem] border border-outline-variant/12 bg-surface-container-low p-7 ${className ?? ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="h-3 w-24 animate-pulse rounded-full bg-surface-container-high" />
          <div className="mt-4 h-7 w-40 animate-pulse rounded-full bg-surface-container-high" />
          <div className="mt-3 h-3 w-32 animate-pulse rounded-full bg-surface-container-high" />
        </div>
        <div className="h-11 w-11 animate-pulse rounded-2xl bg-surface-container-high" />
      </div>

      <div className="mt-5 h-4 w-28 animate-pulse rounded-full bg-surface-container-high" />

      <div className="mt-5 space-y-3">
        <div className="h-4 w-full animate-pulse rounded-full bg-surface-container-high" />
        <div className="h-4 w-[92%] animate-pulse rounded-full bg-surface-container-high" />
        <div className="h-4 w-[76%] animate-pulse rounded-full bg-surface-container-high" />
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-outline-variant/12 bg-surface px-4 py-4">
        <div className="h-8 w-24 animate-pulse rounded-full bg-surface-container-high" />
        <div className="mt-3 h-4 w-3/4 animate-pulse rounded-full bg-surface-container-high" />
      </div>

      <div className="mt-6 h-4 w-32 animate-pulse rounded-full bg-surface-container-high" />
    </div>
  );
}

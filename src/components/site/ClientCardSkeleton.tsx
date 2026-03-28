export function ClientCardSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={`rounded-[2rem] border border-outline-variant/12 bg-surface-container-low p-7 ${className ?? ""}`}
    >
      <div className="partner-logo-card flex h-24 items-center justify-center rounded-[1.75rem] border px-6 py-5">
        <div className="h-10 w-32 animate-pulse rounded-full bg-surface-container-high" />
      </div>

      <div className="mt-6">
        <div className="h-8 w-40 animate-pulse rounded-full bg-surface-container-high" />
        <div className="mt-3 h-3 w-24 animate-pulse rounded-full bg-surface-container-high" />
      </div>

      <div className="mt-5 h-4 w-48 animate-pulse rounded-full bg-surface-container-high" />
      <div className="mt-6 h-4 w-28 animate-pulse rounded-full bg-surface-container-high" />
    </div>
  );
}

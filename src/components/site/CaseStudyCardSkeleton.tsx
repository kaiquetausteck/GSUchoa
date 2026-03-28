export function CaseStudyCardSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[2rem] border border-outline-variant/12 bg-surface-container-low ${className ?? ""}`}
    >
      <div className="aspect-[16/10] animate-pulse bg-surface-container-high" />

      <div className="space-y-5 p-7">
        <div>
          <div className="h-3 w-28 animate-pulse rounded-full bg-surface-container-high" />
          <div className="mt-4 h-8 w-4/5 animate-pulse rounded-full bg-surface-container-high" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              className="rounded-[1.35rem] border border-outline-variant/12 bg-surface px-4 py-4"
              key={index}
            >
              <div className="h-3 w-16 animate-pulse rounded-full bg-surface-container-high" />
              <div className="mt-3 h-4 w-20 animate-pulse rounded-full bg-surface-container-high" />
            </div>
          ))}
        </div>

        <div className="h-4 w-28 animate-pulse rounded-full bg-surface-container-high" />
      </div>
    </div>
  );
}

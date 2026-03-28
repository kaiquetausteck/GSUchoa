export function PanelDashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="h-4 w-32 rounded-full bg-surface-container-high animate-pulse" />
        <div className="h-10 w-64 rounded-2xl bg-surface-container-high animate-pulse" />
        <div className="h-4 w-[28rem] max-w-full rounded-full bg-surface-container-high animate-pulse" />
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            className="panel-card h-56 animate-pulse rounded-[1.75rem] border"
            key={index}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <div className="panel-card h-[28rem] animate-pulse rounded-[2rem] border" />
        <div className="panel-card h-[28rem] animate-pulse rounded-[2rem] border" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            className="panel-card h-[24rem] animate-pulse rounded-[2rem] border"
            key={index}
          />
        ))}
      </div>
    </div>
  );
}

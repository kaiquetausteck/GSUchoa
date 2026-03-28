import type { ReactNode } from "react";

export function PanelStatCard({
  eyebrow,
  value,
  description,
  icon,
}: {
  eyebrow: string;
  value: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <article className="panel-card rounded-[1.75rem] border p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
          {eyebrow}
        </p>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-black tracking-tight text-on-surface">{value}</p>
      <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{description}</p>
    </article>
  );
}

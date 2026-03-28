import type { ReactNode } from "react";

type PanelMetricCardMeta = {
  label: string;
  value: string;
};

type PanelMetricCardProps = {
  description: string;
  icon: ReactNode;
  label: string;
  meta?: PanelMetricCardMeta[];
  toneClassName?: string;
  value: string;
};

export function PanelMetricCard({
  description,
  icon,
  label,
  meta = [],
  toneClassName,
  value,
}: PanelMetricCardProps) {
  return (
    <article className="panel-card rounded-[1.75rem] border p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-on-surface-variant">
            {label}
          </p>
          <p className="mt-4 text-4xl font-black tracking-tight text-on-surface">
            {value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 flex-none items-center justify-center rounded-2xl border ${
            toneClassName ?? "border-primary/20 bg-primary/10 text-primary"
          }`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 min-h-[2.75rem] text-sm leading-relaxed text-on-surface-variant">
        {description}
      </p>

      {meta.length > 0 ? (
        <div className="mt-5 grid gap-3 border-t border-outline-variant/10 pt-4 sm:grid-cols-2">
          {meta.map((item) => (
            <div className="min-w-0" key={`${item.label}-${item.value}`}>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                {item.label}
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-on-surface">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}

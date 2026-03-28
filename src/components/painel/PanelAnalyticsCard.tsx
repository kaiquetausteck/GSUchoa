import type { ReactNode } from "react";

type PanelAnalyticsCardProps = {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  description?: string;
  eyebrow?: string;
  title: string;
};

export function PanelAnalyticsCard({
  actions,
  children,
  className,
  description,
  eyebrow,
  title,
}: PanelAnalyticsCardProps) {
  return (
    <section className={`panel-card rounded-[2rem] border p-6 md:p-7 ${className ?? ""}`}>
      <div className="flex flex-col gap-4 border-b border-outline-variant/10 pb-5 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-2 text-lg font-bold tracking-tight text-on-surface md:text-xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
              {description}
            </p>
          ) : null}
        </div>

        {actions ? (
          <div className="flex flex-wrap items-center gap-3">
            {actions}
          </div>
        ) : null}
      </div>

      <div className="pt-5">
        {children}
      </div>
    </section>
  );
}

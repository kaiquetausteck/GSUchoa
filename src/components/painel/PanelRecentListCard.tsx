import type { ReactNode } from "react";

import { PanelAnalyticsCard } from "./PanelAnalyticsCard";

type PanelRecentListItem = {
  id: string;
  badge?: ReactNode;
  meta: string;
  subtitle: string;
  title: string;
};

type PanelRecentListCardProps = {
  description: string;
  emptyDescription: string;
  eyebrow?: string;
  items: PanelRecentListItem[];
  title: string;
};

export function PanelRecentListCard({
  description,
  emptyDescription,
  eyebrow,
  items,
  title,
}: PanelRecentListCardProps) {
  return (
    <PanelAnalyticsCard
      description={description}
      eyebrow={eyebrow}
      title={title}
    >
      {items.length ? (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              className="panel-card-muted flex items-start gap-3 rounded-[1.5rem] border px-4 py-4"
              key={item.id}
            >
              {item.badge ? (
                <div className="mt-0.5 flex h-10 w-10 flex-none items-center justify-center rounded-2xl border border-outline-variant/10 bg-surface-container-low text-primary">
                  {item.badge}
                </div>
              ) : null}

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-on-surface">
                      {item.title}
                    </p>
                    <p className="mt-1 truncate text-sm text-on-surface-variant">
                      {item.subtitle}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                    {item.meta}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[13rem] items-center justify-center rounded-[1.5rem] border border-dashed border-outline-variant/20 px-6 text-center">
          <div>
            <p className="text-base font-semibold text-on-surface">
              Ainda nao ha registros recentes.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              {emptyDescription}
            </p>
          </div>
        </div>
      )}
    </PanelAnalyticsCard>
  );
}

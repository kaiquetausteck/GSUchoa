import type { ReactNode } from "react";

import {
  PanelBreadcrumbs,
  type PanelBreadcrumbItem,
} from "./PanelBreadcrumbs";

type PanelPageHeaderProps = {
  actions?: ReactNode;
  breadcrumbs: PanelBreadcrumbItem[];
  description?: string;
  title: string;
};

export function PanelPageHeader({
  actions,
  breadcrumbs,
  description,
  title,
}: PanelPageHeaderProps) {
  return (
    <section className="space-y-4">
      <PanelBreadcrumbs items={breadcrumbs} />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-black tracking-tight text-on-surface md:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant md:text-base">
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
    </section>
  );
}

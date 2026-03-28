import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

import { PanelAnalyticsCard } from "./PanelAnalyticsCard";

type PanelRecentModulesCardItem = {
  id: string;
  meta: string;
  status?: string;
  subtitle: string;
  title: string;
};

type PanelRecentModulesCardSection = {
  icon: ReactNode;
  items: PanelRecentModulesCardItem[];
  title: string;
  to: string;
};

type PanelRecentModulesCardProps = {
  description: string;
  sections: PanelRecentModulesCardSection[];
  title: string;
};

export function PanelRecentModulesCard({
  description,
  sections,
  title,
}: PanelRecentModulesCardProps) {
  return (
    <PanelAnalyticsCard
      description={description}
      eyebrow="Fluxo editorial"
      title={title}
    >
      <div className="space-y-4">
        {sections.map((section) => (
          <section
            className="panel-card-muted rounded-[1.5rem] border p-4"
            key={section.title}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl border border-outline-variant/10 bg-surface-container-low text-primary">
                  {section.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface">{section.title}</p>
                  <p className="text-xs text-on-surface-variant">
                    Ultimos registros criados nesse modulo.
                  </p>
                </div>
              </div>

              <Link
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary transition-opacity hover:opacity-80"
                to={section.to}
              >
                Abrir
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {section.items.length ? (
              <div className="mt-4 space-y-3">
                {section.items.map((item) => (
                  <div
                    className="flex items-start justify-between gap-3 rounded-[1.15rem] border border-outline-variant/8 bg-surface-container-low/70 px-3.5 py-3"
                    key={item.id}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-on-surface">
                        {item.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-on-surface-variant">
                        {item.subtitle}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1 text-right">
                      {item.status ? (
                        <span className="rounded-full border border-primary/12 bg-primary/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                          {item.status}
                        </span>
                      ) : null}
                      <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                        {item.meta}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-[1.15rem] border border-dashed border-outline-variant/20 px-4 py-6 text-center text-sm text-on-surface-variant">
                Nenhum registro recente encontrado nesse modulo.
              </div>
            )}
          </section>
        ))}
      </div>
    </PanelAnalyticsCard>
  );
}

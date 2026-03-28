import type { ReactNode } from "react";

type PanelFormSectionProps = {
  children: ReactNode;
  description?: string;
  icon?: ReactNode;
  title: string;
};

export function PanelFormSection({
  children,
  description,
  icon,
  title,
}: PanelFormSectionProps) {
  return (
    <section className="panel-card rounded-[1.75rem] border p-5">
      <div className="flex items-start gap-3">
        {icon ? (
          <div className="panel-card-muted flex h-10 w-10 flex-none items-center justify-center rounded-2xl border text-primary">
            {icon}
          </div>
        ) : null}

        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-on-surface">{title}</h3>
          {description ? (
            <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}

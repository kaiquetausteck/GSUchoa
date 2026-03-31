import type { ReactNode } from "react";

import { PanelAnimatedNumber } from "./PanelAnimatedNumber";

type PanelMetricCardMeta = {
  label: string;
  value: string;
};

type PanelMetricCardProps = {
  description: string;
  icon: ReactNode;
  label: string;
  loading?: boolean;
  meta?: PanelMetricCardMeta[];
  numberFormatter?: (value: number) => string;
  toneClassName?: string;
  valueNumber?: number;
  valueToneClassName?: string;
  value: string;
};

export function PanelMetricCard({
  description,
  icon,
  label,
  loading = false,
  meta = [],
  numberFormatter,
  toneClassName,
  valueNumber,
  valueToneClassName,
  value,
}: PanelMetricCardProps) {
  if (loading) {
    return (
      <article className="panel-premium-card rounded-[1.9rem] border p-6 md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="panel-skeleton h-3 w-24 rounded-full" />
            <div className="panel-skeleton mt-5 h-11 w-40 rounded-2xl" />
          </div>

          <div className="panel-skeleton h-14 w-14 rounded-[1.35rem]" />
        </div>

        <div className="mt-5 space-y-2">
          <div className="panel-skeleton h-3 w-full rounded-full" />
          <div className="panel-skeleton h-3 w-4/5 rounded-full" />
        </div>

        {meta.length > 0 ? (
          <div className="mt-5 grid gap-3 border-t border-outline-variant/10 pt-4 sm:grid-cols-2">
            {meta.map((item) => (
              <div className="min-w-0" key={item.label}>
                <div className="panel-skeleton h-3 w-20 rounded-full" />
                <div className="panel-skeleton mt-2 h-5 w-28 rounded-full" />
              </div>
            ))}
          </div>
        ) : null}
      </article>
    );
  }

  return (
    <article className="panel-premium-card group rounded-[1.9rem] border p-6 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant/85">
            {label}
          </p>
          <div className="mt-4">
            {typeof valueNumber === "number" && numberFormatter ? (
              <PanelAnimatedNumber
                className={`text-4xl font-black tracking-tight text-on-surface md:text-[2.6rem] ${valueToneClassName ?? ""}`}
                formatter={numberFormatter}
                value={valueNumber}
              />
            ) : (
              <p className={`text-4xl font-black tracking-tight text-on-surface md:text-[2.6rem] ${valueToneClassName ?? ""}`}>
                {value}
              </p>
            )}
          </div>
        </div>

        <div
          className={`flex h-14 w-14 flex-none items-center justify-center rounded-[1.35rem] border shadow-[0_14px_34px_rgba(15,23,42,0.08)] ${
            toneClassName ?? "border-primary/18 bg-primary/10 text-primary"
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

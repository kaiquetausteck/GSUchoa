import { PanelAnimatedNumber } from "./PanelAnimatedNumber";

type PanelProgressListItem = {
  color: string;
  helper?: string;
  label: string;
  value: number;
};

type PanelProgressListProps = {
  formatValue?: (value: number) => string;
  items: PanelProgressListItem[];
  loading?: boolean;
  maxValue?: number;
  suffix?: string;
};

export function PanelProgressList({
  formatValue,
  items,
  loading = false,
  maxValue,
  suffix = "",
}: PanelProgressListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="space-y-2" key={index}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="panel-skeleton h-4 w-24 rounded-full" />
                <div className="panel-skeleton mt-2 h-3 w-40 rounded-full" />
              </div>
              <div className="panel-skeleton h-4 w-14 rounded-full" />
            </div>

            <div className="panel-skeleton h-2.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  const safeMaxValue = Math.max(
    maxValue ?? 0,
    ...items.map((item) => item.value),
    1,
  );

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const progress = Math.min((item.value / safeMaxValue) * 100, 100);

        return (
          <div className="space-y-2" key={item.label}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-on-surface">{item.label}</p>
                {item.helper ? (
                  <p className="mt-1 text-xs text-on-surface-variant">{item.helper}</p>
                ) : null}
              </div>
              <PanelAnimatedNumber
                className="text-sm font-bold text-on-surface"
                formatter={(value) => formatValue ? formatValue(value) : `${Math.round(value)}${suffix}`}
                value={item.value}
              />
            </div>

            <div className="h-2 rounded-full bg-surface-container-highest/45">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  background: item.color,
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

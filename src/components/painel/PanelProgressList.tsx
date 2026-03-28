type PanelProgressListItem = {
  color: string;
  helper?: string;
  label: string;
  value: number;
};

type PanelProgressListProps = {
  items: PanelProgressListItem[];
  maxValue?: number;
  suffix?: string;
};

export function PanelProgressList({
  items,
  maxValue,
  suffix = "",
}: PanelProgressListProps) {
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
              <p className="text-sm font-bold text-on-surface">
                {item.value}
                {suffix}
              </p>
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

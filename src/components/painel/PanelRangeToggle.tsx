import type { PanelDashboardRange } from "../../services/painel/dashboard-api";

const RANGE_OPTIONS: Array<{ label: string; value: PanelDashboardRange }> = [
  { label: "7 dias", value: "7d" },
  { label: "30 dias", value: "30d" },
  { label: "12 meses", value: "12m" },
];

type PanelRangeToggleProps = {
  disabled?: boolean;
  onChange: (value: PanelDashboardRange) => void;
  value: PanelDashboardRange;
};

export function PanelRangeToggle({
  disabled = false,
  onChange,
  value,
}: PanelRangeToggleProps) {
  return (
    <div className="panel-card-muted inline-flex items-center gap-1 rounded-2xl border p-1">
      {RANGE_OPTIONS.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            className={`rounded-[1rem] px-3.5 py-2 text-sm font-semibold transition-colors ${
              isActive
                ? "bg-primary text-white shadow-[0_12px_28px_rgba(34,98,240,0.24)]"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
            disabled={disabled}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

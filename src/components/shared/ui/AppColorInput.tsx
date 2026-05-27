import type { ChangeEvent } from "react";

const DEFAULT_COLOR_OPTIONS = [
  "#2563eb",
  "#16a34a",
  "#14b8a6",
  "#7c3aed",
  "#0a66c2",
  "#f59e0b",
  "#f97316",
  "#ef4444",
  "#ec4899",
  "#64748b",
];

type AppColorInputProps = {
  colors?: string[];
  label?: string;
  onChange: (value: string) => void;
  value: string;
};

function normalizeColor(value: string) {
  return value.trim().toLowerCase();
}

export function AppColorInput({
  colors = DEFAULT_COLOR_OPTIONS,
  label,
  onChange,
  value,
}: AppColorInputProps) {
  const normalizedValue = normalizeColor(value);

  const handleNativeColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="space-y-2">
      {label ? <p className="text-xs font-semibold text-on-surface">{label}</p> : null}
      <div className="rounded-2xl border border-outline-variant/14 bg-surface-container-high/35 p-3">
        <div className="grid grid-cols-5 gap-2">
          {colors.map((color) => {
            const isSelected = normalizeColor(color) === normalizedValue;

            return (
              <button
                aria-label={`Selecionar cor ${color}`}
                className={`flex h-9 items-center justify-center rounded-xl border transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 ring-2 ring-primary/25"
                    : "border-outline-variant/14 bg-surface-container-high hover:border-primary/30"
                }`}
                key={color}
                onClick={() => onChange(color)}
                type="button"
              >
                <span
                  className="h-5 w-5 rounded-lg border border-white/25 shadow-sm"
                  style={{ backgroundColor: color }}
                />
              </button>
            );
          })}
        </div>
        <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-outline-variant/14 bg-surface-container-high/55 px-3 py-2 text-xs font-bold text-on-surface transition-colors hover:border-primary/30 hover:text-primary">
          <span className="inline-flex items-center gap-2">
            <span
              className="h-5 w-5 rounded-lg border border-white/25 shadow-sm"
              style={{ backgroundColor: value || "#2563eb" }}
            />
            Paleta personalizada
          </span>
          <span className="font-mono text-[10px] uppercase text-on-surface-variant">{value || "#2563eb"}</span>
          <input
            className="sr-only"
            onChange={handleNativeColorChange}
            type="color"
            value={value || "#2563eb"}
          />
        </label>
      </div>
    </div>
  );
}

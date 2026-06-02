import type { ButtonHTMLAttributes, ReactNode } from "react";

type AppSwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "onChange"> & {
  checked: boolean;
  description?: ReactNode;
  label: ReactNode;
  onCheckedChange: (checked: boolean) => void;
};

export function AppSwitch({
  checked,
  className = "",
  description,
  disabled,
  label,
  onCheckedChange,
  ...props
}: AppSwitchProps) {
  return (
    <button
      aria-checked={checked}
      className={`panel-card-muted flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition-colors hover:border-primary/30 disabled:cursor-not-allowed disabled:opacity-55 ${className}`}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      role="switch"
      type="button"
      {...props}
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-on-surface">{label}</span>
        {description ? (
          <span className="mt-1 block text-xs leading-relaxed text-on-surface-variant">
            {description}
          </span>
        ) : null}
      </span>
      <span
        className={`relative inline-flex h-7 w-12 flex-none items-center rounded-full border transition-colors ${
          checked
            ? "border-primary bg-primary"
            : "border-outline-variant/35 bg-surface-container-high"
        }`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}

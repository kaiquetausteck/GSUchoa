import type { ComponentPropsWithoutRef } from "react";

type AppSelectProps = ComponentPropsWithoutRef<"select"> & {
  label?: string;
};

export function AppSelect({
  children,
  className = "",
  label,
  ...props
}: AppSelectProps) {
  const field = (
    <select
      className={`panel-input min-w-0 max-w-full w-full truncate rounded-2xl border px-4 py-3 text-on-surface outline-none transition-colors focus:border-primary/35 ${className}`}
      {...props}
    >
      {children}
    </select>
  );

  if (!label) {
    return field;
  }

  return (
    <label className="block min-w-0 space-y-2">
      <span className="text-xs font-semibold text-on-surface">{label}</span>
      {field}
    </label>
  );
}

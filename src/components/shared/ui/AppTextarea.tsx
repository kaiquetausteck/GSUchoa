import type { ComponentPropsWithoutRef } from "react";

type AppTextareaProps = ComponentPropsWithoutRef<"textarea"> & {
  label?: string;
};

export function AppTextarea({
  className = "",
  label,
  rows = 4,
  ...props
}: AppTextareaProps) {
  const field = (
    <textarea
      className={`panel-input w-full rounded-2xl border px-4 py-3 text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-primary/35 ${className}`}
      rows={rows}
      {...props}
    />
  );

  if (!label) {
    return field;
  }

  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold text-on-surface">{label}</span>
      {field}
    </label>
  );
}

import type { ComponentPropsWithoutRef, ReactNode } from "react";

type AppInputProps = ComponentPropsWithoutRef<"input"> & {
  label?: string;
  leadingIcon?: ReactNode;
  wrapperClassName?: string;
};

export function AppInput({
  className = "",
  label,
  leadingIcon,
  wrapperClassName = "",
  ...props
}: AppInputProps) {
  const field = (
    <div className={`panel-input flex items-center rounded-2xl border px-4 ${wrapperClassName}`}>
      {leadingIcon ? <span className="text-on-surface-variant">{leadingIcon}</span> : null}
      <input
        className={`w-full bg-transparent py-3 text-on-surface outline-none placeholder:text-on-surface-variant/60 ${leadingIcon ? "px-3" : ""} ${className}`}
        {...props}
      />
    </div>
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

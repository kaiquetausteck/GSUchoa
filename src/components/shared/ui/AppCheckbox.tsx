import { Check } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";

type AppCheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: ReactNode;
};

export function AppCheckbox({
  checked,
  className = "",
  disabled,
  label,
  onChange,
  ...props
}: AppCheckboxProps) {
  return (
    <label
      className={`inline-flex cursor-pointer items-center gap-3 ${disabled ? "cursor-not-allowed opacity-55" : ""} ${className}`}
    >
      <span className="relative inline-flex h-5 w-5 flex-none items-center justify-center">
        <input
          checked={checked}
          className="peer sr-only"
          disabled={disabled}
          onChange={onChange}
          type="checkbox"
          {...props}
        />
        <span className="absolute inset-0 rounded-[0.45rem] border border-outline-variant/35 bg-surface-container-high transition-colors peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/35" />
        <Check className="relative h-3.5 w-3.5 scale-75 text-white opacity-0 transition-all peer-checked:scale-100 peer-checked:opacity-100" />
      </span>
      {label ? <span className="min-w-0">{label}</span> : null}
    </label>
  );
}

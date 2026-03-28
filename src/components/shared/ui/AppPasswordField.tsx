import { Eye, EyeOff } from "lucide-react";
import { useState, type ComponentPropsWithoutRef } from "react";

type AppPasswordFieldProps = Omit<ComponentPropsWithoutRef<"input">, "type"> & {
  label?: string;
};

export function AppPasswordField({
  className = "",
  label,
  ...props
}: AppPasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  const field = (
    <div className="panel-input flex items-center rounded-2xl border px-4">
      <input
        className={`w-full bg-transparent py-3 text-on-surface outline-none placeholder:text-on-surface-variant/60 ${className}`}
        type={visible ? "text" : "password"}
        {...props}
      />
      <button
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        className="ml-3 flex h-9 w-9 items-center justify-center rounded-xl text-on-surface-variant transition-colors hover:text-primary"
        onClick={() => setVisible((current) => !current)}
        type="button"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
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

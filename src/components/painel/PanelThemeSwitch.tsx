import { Moon, SunMedium } from "lucide-react";

import { useTheme } from "../../context/shared/ThemeContext";

export function PanelThemeSwitch() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      aria-pressed={!isDark}
      className="panel-card-muted relative inline-grid h-11 w-20 grid-cols-2 items-center rounded-full border p-1 text-on-surface transition-colors duration-300 hover:border-primary/35"
      onClick={toggleTheme}
      type="button"
    >
      <span
        className={`pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-primary shadow-[0_10px_24px_rgba(34,98,240,0.28)] transition-transform duration-300 ease-out ${
          isDark ? "translate-x-0" : "translate-x-full"
        }`}
      />
      <span className="relative z-10 flex h-full w-full items-center justify-center">
        <Moon className={`h-4 w-4 transition-colors ${isDark ? "text-white" : "text-on-surface-variant"}`} />
      </span>
      <span className="relative z-10 flex h-full w-full items-center justify-center">
        <SunMedium className={`h-4 w-4 transition-colors ${isDark ? "text-on-surface-variant" : "text-white"}`} />
      </span>
    </button>
  );
}

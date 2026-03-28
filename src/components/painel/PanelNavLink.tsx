import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

export function PanelNavLink({
  to,
  label,
  icon: Icon,
  collapsed = false,
  nested = false,
}: {
  to: string;
  label: string;
  icon: LucideIcon;
  collapsed?: boolean;
  nested?: boolean;
}) {
  return (
    <NavLink
      className={({ isActive }) =>
        `panel-nav-link flex items-center rounded-2xl border text-sm font-medium transition-all ${
          isActive
            ? "panel-nav-link-active border-primary/70 bg-primary text-white shadow-[0_16px_32px_rgba(34,98,240,0.26)]"
            : "border-transparent text-on-surface-variant hover:text-on-surface"
        } ${collapsed ? "justify-center px-3 py-3" : nested ? "gap-3 px-4 py-2.5" : "gap-3 px-4 py-3"}`
      }
      end
      title={collapsed ? label : undefined}
      to={to}
    >
      <Icon className="h-4 w-4 flex-none" />
      {collapsed ? null : label}
    </NavLink>
  );
}

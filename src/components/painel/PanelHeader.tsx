import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { PanelCommandMenu } from "./PanelCommandMenu";
import { PanelThemeSwitch } from "./PanelThemeSwitch";

type PanelHeaderProps = {
  collapsed: boolean;
  onOpenSidebar: () => void;
  onToggleCollapsed: () => void;
};

export function PanelHeader({
  collapsed,
  onOpenSidebar,
  onToggleCollapsed,
}: PanelHeaderProps) {
  return (
    <header className="panel-header-shell border-b px-5 py-4 backdrop-blur-xl md:px-8 xl:px-10">
      <div className="flex w-full items-center gap-3">
        <div className="flex items-center gap-3">
          <button
            aria-label="Abrir menu lateral"
            className="panel-card-muted flex h-11 w-11 items-center justify-center rounded-2xl border text-on-surface transition-colors hover:border-primary/30 hover:text-primary lg:hidden"
            onClick={onOpenSidebar}
            type="button"
          >
            <Menu className="h-5 w-5" />
          </button>

          <button
            aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
            className="panel-card-muted hidden h-11 w-11 items-center justify-center rounded-2xl border text-on-surface transition-colors hover:border-primary/30 hover:text-primary lg:flex"
            onClick={onToggleCollapsed}
            type="button"
          >
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <PanelCommandMenu />
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <PanelThemeSwitch />
        </div>
      </div>
    </header>
  );
}

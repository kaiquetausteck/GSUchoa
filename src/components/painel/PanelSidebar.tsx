import { X } from "lucide-react";

import { PanelBrand } from "./PanelBrand";
import { PanelNavGroup } from "./PanelNavGroup";
import { PanelNavLink } from "./PanelNavLink";
import { PanelUserMenu } from "./PanelUserMenu";
import {
  PANEL_NAV_GROUPS,
  PANEL_NAV_PRIMARY_ITEMS,
} from "../../config/painel/navigation";
import type { PanelUser } from "../../services/painel/auth-api";

type PanelSidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onGoToSite: () => void;
  onLogout: () => void | Promise<void>;
  onOpenProfile: () => void;
  user: PanelUser | null;
};

export function PanelSidebar({
  collapsed,
  mobileOpen,
  onCloseMobile,
  onGoToSite,
  onLogout,
  onOpenProfile,
  user,
}: PanelSidebarProps) {
  return (
    <>
      {mobileOpen ? (
        <button
          aria-label="Fechar menu lateral"
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
          type="button"
        />
      ) : null}

      <aside
        className={`panel-sidebar-shell fixed inset-y-0 left-0 z-40 flex h-screen w-[18rem] flex-col border-r backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          collapsed ? "lg:w-[6.5rem]" : "lg:w-[18rem]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-outline-variant/10 px-4 py-4">
          <PanelBrand collapsed={collapsed} />

          <button
            aria-label="Fechar menu lateral"
            className="panel-card-muted flex h-10 w-10 items-center justify-center rounded-xl border text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary lg:hidden"
            onClick={onCloseMobile}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
          <nav className="space-y-4">
            <div className="space-y-2">
              {PANEL_NAV_PRIMARY_ITEMS.map((item) => (
                <PanelNavLink
                  collapsed={collapsed}
                  icon={item.icon}
                  key={item.key}
                  label={item.label}
                  to={item.to}
                />
              ))}
            </div>

            {PANEL_NAV_GROUPS.map((group) => (
              <PanelNavGroup collapsed={collapsed} group={group} key={group.key} />
            ))}
          </nav>
        </div>

        <div className="border-t border-outline-variant/10 px-3 py-4">
          <PanelUserMenu
            collapsed={collapsed}
            onGoToSite={onGoToSite}
            onLogout={onLogout}
            onOpenProfile={onOpenProfile}
            user={user}
          />
        </div>
      </aside>
    </>
  );
}

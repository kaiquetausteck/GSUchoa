import {
  ArrowUpRight,
  ChevronDown,
  LogOut,
  UserCircle2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { type PanelUser } from "../../services/painel/auth-api";
import { PanelUserAvatar } from "./PanelUserAvatar";

export function PanelUserMenu({
  collapsed = false,
  onGoToSite,
  onOpenProfile,
  user,
  onLogout,
}: {
  collapsed?: boolean;
  onGoToSite: () => void;
  onOpenProfile: () => void;
  user: PanelUser | null;
  onLogout: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  const displayName = user?.name || "Administrador";
  const displayRole = user?.role || "Area restrita";
  const displayEmail = user?.email || "Sem e-mail";

  return (
    <div ref={rootRef} className="relative">
      <button
        aria-expanded={open}
        className={`panel-card-muted flex items-center rounded-2xl border px-3 py-2 transition-colors hover:border-primary/30 ${
          collapsed ? "w-full justify-center" : "w-full gap-3"
        }`}
        onClick={() => setOpen((current) => !current)}
        title={collapsed ? displayName : undefined}
        type="button"
      >
        <PanelUserAvatar
          avatarUrl={user?.avatarUrl}
          className="h-10 w-10 text-sm"
          name={displayName}
          roundedClassName="rounded-xl"
        />
        {collapsed ? null : (
          <>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-semibold text-on-surface">{displayName}</p>
              <p className="truncate text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                {displayRole}
              </p>
            </div>
            <ChevronDown className={`h-4 w-4 flex-none text-on-surface-variant transition-transform ${open ? "rotate-180" : ""}`} />
          </>
        )}
      </button>

      {open ? (
        <div
          className={`panel-popover absolute z-50 rounded-[1.5rem] border p-2 ${
            collapsed
              ? "bottom-0 left-[calc(100%+0.75rem)] w-72"
              : "bottom-[calc(100%+0.75rem)] left-0 w-full min-w-[16rem]"
          }`}
        >
          <div className="panel-card-muted flex items-center gap-3 rounded-[1.1rem] border px-3 py-3">
            <PanelUserAvatar
              avatarUrl={user?.avatarUrl}
              className="h-11 w-11 text-sm"
              name={displayName}
              roundedClassName="rounded-xl"
            />
            <div>
              <p className="text-sm font-semibold text-on-surface">{displayName}</p>
              <p className="mt-1 text-xs text-on-surface-variant">
                {displayEmail}
              </p>
            </div>
          </div>

          <div className="my-2 h-px bg-outline-variant/20" />

          <button
            className="flex w-full items-center gap-3 rounded-[1rem] px-3 py-3 text-left text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-high"
            onClick={() => {
              setOpen(false);
              onOpenProfile();
            }}
            type="button"
          >
            <UserCircle2 className="h-4 w-4 text-primary" />
            Meus Dados
          </button>
          <button
            className="flex w-full items-center gap-3 rounded-[1rem] px-3 py-3 text-left text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-high"
            onClick={() => {
              setOpen(false);
              onGoToSite();
            }}
            type="button"
          >
            <ArrowUpRight className="h-4 w-4 text-primary" />
            Ir para o site
          </button>
          <button
            className="mt-1 flex w-full items-center gap-3 rounded-[1rem] px-3 py-3 text-left text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            type="button"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      ) : null}
    </div>
  );
}

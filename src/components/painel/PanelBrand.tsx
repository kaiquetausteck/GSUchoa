import { LogoIconAnimated } from "../shared/LogoIconAnimated";

export function PanelBrand({
  collapsed = false,
}: {
  collapsed?: boolean;
}) {
  return (
    <div className={`flex items-center ${collapsed ? "justify-center" : "gap-4"}`}>
      <div className="panel-card-muted flex h-12 w-12 items-center justify-center rounded-2xl border">
        <LogoIconAnimated className="logo-icon-theme h-8 w-auto flex-none" title="GSUCHOA Icon" />
      </div>
      {collapsed ? null : (
        <div>
          <p className="text-sm font-semibold text-on-surface">GSUCHOA</p>
          <p className="text-[10px] uppercase tracking-[0.28em] text-on-surface-variant">
            Admin Console
          </p>
        </div>
      )}
    </div>
  );
}

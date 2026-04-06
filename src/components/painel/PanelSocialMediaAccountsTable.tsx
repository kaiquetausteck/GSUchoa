import { ArrowUpRight, BarChart3, Camera, CheckCircle2, Globe2, Radar } from "lucide-react";

import type { PanelMetaSocialMediaAccountRecord } from "../../services/painel/social-media-api";

type PanelSocialMediaAccountsTableProps = {
  isLoading: boolean;
  items: PanelMetaSocialMediaAccountRecord[];
  onOpenDashboard: (item: PanelMetaSocialMediaAccountRecord) => void;
};

function getAccountBadgeTone(platform: "facebook" | "instagram") {
  return platform === "instagram"
    ? "border-fuchsia-500/18 bg-fuchsia-500/10 text-fuchsia-500"
    : "border-sky-500/18 bg-sky-500/10 text-sky-500";
}

export function PanelSocialMediaAccountsTable({
  isLoading,
  items,
  onOpenDashboard,
}: PanelSocialMediaAccountsTableProps) {
  if (isLoading) {
    return (
      <div className="panel-card overflow-hidden rounded-[1.75rem] border">
        <div className="space-y-3 p-4 md:p-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              className="panel-card-muted h-28 animate-pulse rounded-2xl border"
              key={index}
            />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="panel-card rounded-[1.75rem] border border-dashed px-6 py-12 text-center">
        <p className="text-sm font-semibold text-on-surface">Nenhuma conta social Meta encontrada</p>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          Assim que a integração retornar contas com Facebook, Instagram ou ambos, elas aparecerão
          aqui para abrir o dashboard social consolidado.
        </p>
      </div>
    );
  }

  return (
    <div className="panel-card overflow-hidden rounded-[1.75rem] border">
      <div className="overflow-x-auto overflow-y-visible">
        <table className="min-w-full text-left text-sm">
          <thead className="panel-card-muted border-b border-outline-variant/12">
            <tr className="text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">
              <th className="px-6 py-4 font-semibold">Conta</th>
              <th className="px-6 py-4 font-semibold">Canais</th>
              <th className="px-6 py-4 font-semibold">Cobertura</th>
              <th className="px-6 py-4 text-right font-semibold">Abrir</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                className="border-b border-outline-variant/10 transition-colors hover:bg-surface-container-low/55 last:border-b-0"
                key={item.id}
              >
                <td className="min-w-[25rem] px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 flex-none items-center justify-center overflow-hidden rounded-2xl border border-primary/16 bg-primary/8 text-primary">
                      {item.avatarUrl ? (
                        <img
                          alt={item.displayName}
                          className="h-full w-full object-cover"
                          src={item.avatarUrl}
                        />
                      ) : item.type === "instagram" ? (
                        <Camera className="h-5 w-5" />
                      ) : (
                        <Globe2 className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-on-surface">
                        {item.displayName}
                      </p>
                      <p className="mt-1 truncate text-xs text-on-surface-variant">{item.id}</p>
                      <p className="mt-2 text-xs text-on-surface-variant">
                        {item.instagramUsername
                          ? `Instagram @${item.instagramUsername}`
                          : item.pageName || "Conta social pronta para dashboard"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="min-w-[18rem] px-6 py-5">
                  <div className="flex flex-wrap gap-2">
                    {item.platforms.map((platform) => (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${getAccountBadgeTone(
                          platform.platform,
                        )}`}
                        key={`${item.id}-${platform.platform}-${platform.externalId}`}
                      >
                        {platform.platform === "instagram" ? (
                          <Camera className="h-3.5 w-3.5" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        {platform.platform === "instagram"
                          ? platform.username
                            ? `@${platform.username}`
                            : "Instagram"
                          : "Facebook"}
                      </span>
                    ))}
                  </div>
                </td>

                <td className="min-w-[23rem] px-6 py-5">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-on-surface">
                      {item.relation.linked
                        ? "Facebook e Instagram vinculados"
                        : item.type === "both"
                          ? "Conta combinada sem vínculo explícito"
                          : "Canal único"}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full border border-outline-variant/14 bg-surface px-3 py-1 text-[11px] font-semibold text-on-surface-variant">
                        <BarChart3 className="h-3.5 w-3.5 text-primary" />
                        {item.capabilities.hasDashboard ? "Dashboard pronto" : "Sem dashboard"}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-outline-variant/14 bg-surface px-3 py-1 text-[11px] font-semibold text-on-surface-variant">
                        <Radar className="h-3.5 w-3.5 text-primary" />
                        {item.capabilities.hasInsights ? "Insights" : "Sem insights"}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-outline-variant/14 bg-surface px-3 py-1 text-[11px] font-semibold text-on-surface-variant">
                        <Camera className="h-3.5 w-3.5 text-primary" />
                        {item.capabilities.hasMedia ? "Conteúdos" : "Sem mídia"}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-5 text-right">
                  <button
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-outline-variant/16 px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                    onClick={() => onOpenDashboard(item)}
                    type="button"
                  >
                    Ver dashboard
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

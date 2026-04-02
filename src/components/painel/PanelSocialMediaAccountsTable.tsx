import { ArrowUpRight, Camera, CheckCircle2, Globe2 } from "lucide-react";

import type {
  PanelMetaSocialPageRecord,
  PanelMetaSocialInstagramSourceRecord,
} from "../../services/painel/social-media-api";

type SocialMediaPageTableItem = PanelMetaSocialPageRecord & {
  instagramSources: PanelMetaSocialInstagramSourceRecord[];
};

type PanelSocialMediaAccountsTableProps = {
  isLoading: boolean;
  items: SocialMediaPageTableItem[];
  onOpenDashboard: (item: SocialMediaPageTableItem) => void;
};

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
              className="panel-card-muted h-24 animate-pulse rounded-2xl border"
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
        <p className="text-sm font-semibold text-on-surface">Nenhuma página Meta encontrada</p>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          Quando a conexão Meta retornar páginas válidas, elas aparecerão aqui para abrir o
          módulo social por página.
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
              <th className="px-6 py-4 font-semibold">Página</th>
              <th className="px-6 py-4 font-semibold">Canais</th>
              <th className="px-6 py-4 font-semibold">Instagram vinculado</th>
              <th className="px-6 py-4 text-right font-semibold">Abrir</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                className="border-b border-outline-variant/10 transition-colors hover:bg-surface-container-low/55 last:border-b-0"
                key={item.pageId}
              >
                <td className="min-w-[24rem] px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 flex-none items-center justify-center overflow-hidden rounded-2xl border border-primary/16 bg-primary/8 text-primary">
                      {item.pictureUrl ? (
                        <img
                          alt={item.name}
                          className="h-full w-full object-cover"
                          src={item.pictureUrl}
                        />
                      ) : (
                        <Globe2 className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-on-surface">{item.name}</p>
                      <p className="mt-1 truncate text-xs text-on-surface-variant">{item.pageId}</p>
                      <p className="mt-2 text-xs text-on-surface-variant">
                        {item.category || "Categoria não informada"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/18 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-500">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Facebook
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${
                        item.instagramSources.length > 0 || item.hasInstagramBusinessAccount
                          ? "border-fuchsia-500/18 bg-fuchsia-500/10 text-fuchsia-500"
                          : "border-outline-variant/16 bg-surface-container-low text-on-surface-variant"
                      }`}
                    >
                      <Camera className="h-3.5 w-3.5" />
                      {item.instagramSources.length > 0 || item.hasInstagramBusinessAccount
                        ? "Instagram"
                        : "Sem Instagram"}
                    </span>

                  </div>
                </td>

                <td className="min-w-[18rem] px-6 py-5">
                  {item.instagramSources.length > 0 ? (
                    <div className="space-y-2">
                      {item.instagramSources.slice(0, 2).map((account) => (
                        <div className="flex items-center gap-3" key={account.instagramAccountId}>
                          <div className="flex h-10 w-10 flex-none items-center justify-center overflow-hidden rounded-2xl border border-fuchsia-500/16 bg-fuchsia-500/10 text-fuchsia-500">
                            {account.profilePictureUrl ? (
                              <img
                                alt={account.username || account.instagramAccountId}
                                className="h-full w-full object-cover"
                                src={account.profilePictureUrl}
                              />
                            ) : (
                              <Camera className="h-4 w-4" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-on-surface">
                              {account.username
                                ? `@${account.username}`
                                : "Conta detectada via vínculo"}
                            </p>
                            <p className="truncate text-xs text-on-surface-variant">
                              {account.name || `ID ${account.instagramAccountId}`}
                            </p>
                          </div>
                        </div>
                      ))}

                      {item.instagramSources.length > 2 ? (
                        <p className="text-xs text-on-surface-variant">
                          +{item.instagramSources.length - 2} perfil(is) adicional(is)
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <span className="inline-flex rounded-full border border-outline-variant/16 bg-surface-container-low px-3 py-1 text-xs font-semibold text-on-surface-variant">
                      Nenhuma conta Instagram vinculada
                    </span>
                  )}
                </td>

                <td className="px-6 py-5 text-right">
                  <button
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-outline-variant/16 px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                    onClick={() => onOpenDashboard(item)}
                    type="button"
                  >
                    Ver página
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

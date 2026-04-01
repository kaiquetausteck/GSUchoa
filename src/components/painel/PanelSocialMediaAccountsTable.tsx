import { ArrowUpRight, Camera, CheckCircle2, Image as ImageIcon, ShieldCheck } from "lucide-react";

import type { PanelSocialMediaAccountRecord } from "../../services/painel/social-media-api";

type PanelSocialMediaAccountsTableProps = {
  isLoading: boolean;
  items: PanelSocialMediaAccountRecord[];
  onOpenDashboard: (item: PanelSocialMediaAccountRecord) => void;
};

function formatNumber(value: number | null) {
  return new Intl.NumberFormat("pt-BR").format(value ?? 0);
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
        <p className="text-sm font-semibold text-on-surface">Nenhuma conta social encontrada</p>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          Quando a conexão Meta retornar contas sociais válidas, elas aparecerão aqui para abrir o
          dashboard mensal de cada cliente.
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
              <th className="px-6 py-4 font-semibold">Conta social</th>
              <th className="px-6 py-4 font-semibold">Instagram</th>
              <th className="px-6 py-4 font-semibold">Capacidade</th>
              <th className="px-6 py-4 text-right font-semibold">Dashboard</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                className="border-b border-outline-variant/10 transition-colors hover:bg-surface-container-low/55 last:border-b-0"
                key={`${item.pageId}-${item.instagramUserId ?? "facebook-only"}`}
              >
                <td className="min-w-[24rem] px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 flex-none items-center justify-center overflow-hidden rounded-2xl border border-primary/16 bg-primary/8 text-primary">
                      {item.pagePictureUrl ? (
                        <img
                          alt={item.pageName}
                          className="h-full w-full object-cover"
                          src={item.pagePictureUrl}
                        />
                      ) : (
                        <ShieldCheck className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-on-surface">{item.pageName}</p>
                      <p className="mt-1 truncate text-xs text-on-surface-variant">{item.pageId}</p>
                      <p className="mt-2 text-xs text-on-surface-variant">
                        {item.pageCategory || "Categoria não informada"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="min-w-[20rem] px-6 py-5">
                  {item.instagramUsername ? (
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 flex-none items-center justify-center overflow-hidden rounded-2xl border border-fuchsia-500/16 bg-fuchsia-500/10 text-fuchsia-500">
                        {item.profilePictureUrl ? (
                          <img
                            alt={item.instagramUsername}
                            className="h-full w-full object-cover"
                            src={item.profilePictureUrl}
                          />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-on-surface">
                          @{item.instagramUsername}
                        </p>
                        <p className="mt-1 truncate text-xs text-on-surface-variant">
                          {item.instagramName || "Nome do perfil não informado"}
                        </p>
                        <p className="mt-2 text-xs text-on-surface-variant">
                          {formatNumber(item.followersCount)} seguidores • {formatNumber(item.mediaCount)} mídias
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span className="inline-flex rounded-full border border-outline-variant/16 bg-surface-container-low px-3 py-1 text-xs font-semibold text-on-surface-variant">
                      Apenas Facebook
                    </span>
                  )}
                </td>

                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-2">
                    {item.tasks.length > 0 ? (
                      item.tasks.map((task) => (
                        <span
                          className="inline-flex items-center gap-1 rounded-full border border-emerald-500/18 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500"
                          key={task}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {task}
                        </span>
                      ))
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-outline-variant/16 bg-surface-container-low px-3 py-1 text-xs font-semibold text-on-surface-variant">
                        <ImageIcon className="h-3.5 w-3.5" />
                        Sem tarefas informadas
                      </span>
                    )}
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

import { ArrowUpRight, Clock3, Globe, ShieldCheck } from "lucide-react";

import type { PanelGoogleAdsCustomerRecord } from "../../services/painel/google-api";

type PanelPaidMediaGoogleCustomersTableProps = {
  isLoading: boolean;
  items: PanelGoogleAdsCustomerRecord[];
  onOpenDashboard: (item: PanelGoogleAdsCustomerRecord) => void;
};

function formatCustomerStatus(value: string | null) {
  if (!value) {
    return "Não informado";
  }

  return value;
}

export function PanelPaidMediaGoogleCustomersTable({
  isLoading,
  items,
  onOpenDashboard,
}: PanelPaidMediaGoogleCustomersTableProps) {
  if (isLoading) {
    return (
      <div className="panel-card overflow-hidden rounded-[1.75rem] border">
        <div className="space-y-3 p-4 md:p-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              className="panel-card-muted h-20 animate-pulse rounded-2xl border"
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
        <p className="text-sm font-semibold text-on-surface">Nenhuma conta Google Ads disponível</p>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          Quando o backend retornar clientes válidos do Google Ads, eles aparecerão aqui para abrir o dashboard.
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
              <th className="px-6 py-4 font-semibold">Conta Google Ads</th>
              <th className="px-6 py-4 font-semibold">Moeda</th>
              <th className="px-6 py-4 font-semibold">Fuso</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 text-right font-semibold">Dashboard</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                className="border-b border-outline-variant/10 transition-colors hover:bg-surface-container-low/55 last:border-b-0"
                key={item.customerId}
              >
                <td className="min-w-[24rem] px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl border border-primary/16 bg-primary/8 text-primary">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-on-surface">
                        {item.descriptiveName}
                      </p>
                      <p className="mt-1 truncate text-xs text-on-surface-variant">{item.customerId}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.manager ? (
                          <span className="inline-flex rounded-full border border-primary/18 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                            MCC
                          </span>
                        ) : null}
                        {item.testAccount ? (
                          <span className="inline-flex rounded-full border border-amber-500/18 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-600">
                            Teste
                          </span>
                        ) : null}
                        {item.hidden ? (
                          <span className="inline-flex rounded-full border border-outline-variant/16 bg-surface-container-low px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                            Oculta
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-on-surface-variant">
                  {item.currencyCode || "Não informada"}
                </td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center gap-2 text-on-surface-variant">
                    <Clock3 className="h-3.5 w-3.5" />
                    {item.timeZone || "Não informado"}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center gap-2 rounded-full border border-outline-variant/16 bg-surface-container-low px-3 py-1 text-xs font-semibold text-on-surface-variant">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {formatCustomerStatus(item.status)}
                  </span>
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

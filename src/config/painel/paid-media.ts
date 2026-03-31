import type {
  PanelPaidMediaCampaignStatus,
  PanelPaidMediaDashboardDataSource,
  PanelPaidMediaPlatform,
} from "../../services/painel/paid-media-api";

export const PANEL_PAID_MEDIA_PLATFORM_LABELS: Record<PanelPaidMediaPlatform, string> = {
  GOOGLE: "Google",
  LINKEDIN: "LinkedIn",
  META: "Meta",
};

export const PANEL_PAID_MEDIA_CAMPAIGN_STATUS_LABELS: Record<PanelPaidMediaCampaignStatus, string> =
  {
    active: "Ativa",
    archived: "Arquivada",
    completed: "Concluída",
    draft: "Rascunho",
    paused: "Pausada",
  };

export function getPanelPaidMediaCampaignStatusBadgeClassName(
  status: PanelPaidMediaCampaignStatus,
) {
  switch (status) {
    case "active":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-500";
    case "paused":
      return "border-amber-500/20 bg-amber-500/10 text-amber-500";
    case "completed":
      return "border-primary/20 bg-primary/10 text-primary";
    case "archived":
      return "border-outline-variant/18 bg-surface-container-low text-on-surface-variant";
    case "draft":
    default:
      return "border-sky-500/18 bg-sky-500/10 text-sky-600 dark:text-sky-400";
  }
}

export const PANEL_PAID_MEDIA_DASHBOARD_SOURCE_LABELS: Record<
  PanelPaidMediaDashboardDataSource,
  string
> = {
  ACCOUNT_FALLBACK: "Dados da conta conectada",
  EMPTY: "Sem dados disponíveis",
  LINKED_ENTITIES: "Dados das entidades vinculadas",
};

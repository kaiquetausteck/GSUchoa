import type { PanelMetaConnectionStatus } from "../../services/painel/meta-api";

export const PANEL_META_STATUS_LABELS: Record<PanelMetaConnectionStatus, string> = {
  NOT_CONNECTED: "Não conectado",
  CONNECTED: "Conectado",
  EXPIRED: "Expirado",
  INVALID: "Inválido",
  RECONNECT_REQUIRED: "Reconexão necessária",
};

export function getPanelMetaStatusLabel(status: PanelMetaConnectionStatus) {
  return PANEL_META_STATUS_LABELS[status];
}

export function getPanelMetaStatusDescription(status: PanelMetaConnectionStatus) {
  if (status === "CONNECTED") {
    return "A conta central da Meta está ativa e pronta para alimentar os próximos módulos de tráfego pago.";
  }

  if (status === "EXPIRED") {
    return "A autorização expirou e precisa ser refeita para continuar usando a integração.";
  }

  if (status === "INVALID") {
    return "A conexão atual foi considerada inválida pelo backend e precisa ser revisada.";
  }

  if (status === "RECONNECT_REQUIRED") {
    return "A Meta exige uma nova autorização para restaurar a integração com segurança.";
  }

  return "Nenhuma conta Meta central foi conectada à aplicação até o momento.";
}

export function getPanelMetaStatusBadgeClassName(status: PanelMetaConnectionStatus) {
  if (status === "CONNECTED") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-500";
  }

  if (status === "EXPIRED") {
    return "border-amber-500/20 bg-amber-500/10 text-amber-600";
  }

  if (status === "RECONNECT_REQUIRED") {
    return "border-violet-500/20 bg-violet-500/10 text-violet-500";
  }

  if (status === "INVALID") {
    return "border-red-500/20 bg-red-500/10 text-red-500";
  }

  return "border-rose-500/20 bg-rose-500/10 text-rose-500";
}

export function panelMetaStatusNeedsReconnect(status: PanelMetaConnectionStatus) {
  return status === "EXPIRED" || status === "INVALID" || status === "RECONNECT_REQUIRED";
}

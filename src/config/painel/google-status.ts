import type { PanelGoogleConnectionStatus } from "../../services/painel/google-api";

export const PANEL_GOOGLE_STATUS_LABELS: Record<PanelGoogleConnectionStatus, string> = {
  NOT_CONNECTED: "Não conectado",
  CONNECTED: "Conectado",
  EXPIRED: "Expirado",
  INVALID: "Inválido",
  RECONNECT_REQUIRED: "Reconexão necessária",
};

export function getPanelGoogleStatusLabel(status: PanelGoogleConnectionStatus) {
  return PANEL_GOOGLE_STATUS_LABELS[status];
}

export function getPanelGoogleStatusDescription(status: PanelGoogleConnectionStatus) {
  if (status === "CONNECTED") {
    return "A conta central do Google está ativa e pronta para alimentar os próximos módulos da operação.";
  }

  if (status === "EXPIRED") {
    return "A autorização expirou e precisa ser refeita para continuar usando a integração.";
  }

  if (status === "INVALID") {
    return "A conexão atual foi considerada inválida pelo backend e precisa ser revisada.";
  }

  if (status === "RECONNECT_REQUIRED") {
    return "O Google exige uma nova autorização para restaurar a integração com segurança.";
  }

  return "Nenhuma conta Google central foi conectada à aplicação até o momento.";
}

export function getPanelGoogleStatusBadgeClassName(status: PanelGoogleConnectionStatus) {
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

export function panelGoogleStatusNeedsReconnect(status: PanelGoogleConnectionStatus) {
  return status === "EXPIRED" || status === "INVALID" || status === "RECONNECT_REQUIRED";
}

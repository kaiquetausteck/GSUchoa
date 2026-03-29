import type { PanelContactStatus } from "../../services/painel/contact-api";

export const PANEL_CONTACT_STATUS_LABELS: Record<PanelContactStatus, string> = {
  new: "Novo",
  qualified: "Qualificado",
  contacted: "Contatado",
  meeting_scheduled: "Reunião agendada",
  proposal_sent: "Proposta enviada",
  won: "Ganhou",
  lost: "Perdido",
  archived: "Arquivado",
};

export const PANEL_CONTACT_STATUS_ORDER: PanelContactStatus[] = [
  "new",
  "qualified",
  "contacted",
  "meeting_scheduled",
  "proposal_sent",
  "won",
  "lost",
  "archived",
];

export const PANEL_CONTACT_FUNNEL_STATUSES: PanelContactStatus[] = PANEL_CONTACT_STATUS_ORDER.filter(
  (status) => status !== "archived",
);

export function getPanelContactStatusLabel(status: PanelContactStatus) {
  return PANEL_CONTACT_STATUS_LABELS[status];
}

export function getPanelContactStatusBadgeClassName(status: PanelContactStatus) {
  if (status === "new") {
    return "border-primary/20 bg-primary/10 text-primary";
  }

  if (status === "qualified") {
    return "border-violet-500/20 bg-violet-500/10 text-violet-500";
  }

  if (status === "contacted") {
    return "border-sky-500/20 bg-sky-500/10 text-sky-500";
  }

  if (status === "meeting_scheduled") {
    return "border-amber-500/20 bg-amber-500/10 text-amber-600";
  }

  if (status === "proposal_sent") {
    return "border-indigo-500/20 bg-indigo-500/10 text-indigo-500";
  }

  if (status === "won") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-500";
  }

  if (status === "lost") {
    return "border-rose-500/20 bg-rose-500/10 text-rose-500";
  }

  return "border-slate-500/20 bg-slate-500/10 text-slate-500";
}

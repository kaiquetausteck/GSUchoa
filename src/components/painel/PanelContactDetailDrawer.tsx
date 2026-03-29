import { CalendarClock, Mail, MessageSquareText, Phone, Tags } from "lucide-react";
import type { ReactNode } from "react";

import {
  PANEL_CONTACT_FUNNEL_STATUSES,
  PANEL_CONTACT_STATUS_ORDER,
  getPanelContactStatusLabel,
} from "../../config/painel/contact-status";
import type {
  PanelContactDetailRecord,
  PanelContactStatus,
} from "../../services/painel/contact-api";
import { PanelDrawer } from "../shared/PanelDrawer";
import { AppSelect } from "../shared/ui/AppSelect";
import { PanelContactStatusBadge } from "./PanelContactStatusBadge";
import {
  buildPanelContactWhatsAppHref,
  formatPanelContactDateTime,
} from "./panelContactUtils";

export type PanelContactDetailDraft = {
  notes: string;
  status: PanelContactStatus;
};

type PanelContactDetailDrawerProps = {
  contact: PanelContactDetailRecord | null;
  draft: PanelContactDetailDraft | null;
  hasChanges: boolean;
  isLoading: boolean;
  isSaving: boolean;
  onArchive: () => void;
  onClose: () => void;
  onDraftChange: <Field extends keyof PanelContactDetailDraft>(
    field: Field,
    value: PanelContactDetailDraft[Field],
  ) => void;
  onSave: () => void;
  open: boolean;
};

function FieldCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="panel-card-muted rounded-[1.35rem] border p-4">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <div className="mt-3 text-sm font-semibold text-on-surface">{value}</div>
    </div>
  );
}

export function PanelContactDetailDrawer({
  contact,
  draft,
  hasChanges,
  isLoading,
  isSaving,
  onArchive,
  onClose,
  onDraftChange,
  onSave,
  open,
}: PanelContactDetailDrawerProps) {
  const availableStatusOptions = draft
    ? draft.status === "archived"
      ? PANEL_CONTACT_STATUS_ORDER
      : PANEL_CONTACT_FUNNEL_STATUSES
    : PANEL_CONTACT_FUNNEL_STATUSES;

  return (
    <PanelDrawer
      defaultWidth={780}
      description="Revise os dados recebidos do site, registre observações internas e mova o lead entre as etapas do funil."
      footer={
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {contact?.status !== "archived" ? (
            <button
              className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/14 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading || isSaving}
              onClick={onArchive}
              type="button"
            >
              Arquivar contato
            </button>
          ) : (
            <span className="text-sm text-on-surface-variant">
              Este contato está arquivado e continua disponível na listagem histórica.
            </span>
          )}

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              className="panel-card-muted rounded-2xl border px-5 py-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
              onClick={onClose}
              type="button"
            >
              Fechar
            </button>
            <button
              className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading || isSaving || !hasChanges}
              onClick={onSave}
              type="button"
            >
              {isSaving ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </div>
      }
      maxWidth={960}
      minWidth={560}
      onClose={onClose}
      open={open}
      title={contact?.fullName ?? "Detalhes do contato"}
    >
      {isLoading || !contact || !draft ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              className="panel-card-muted h-28 animate-pulse rounded-[1.5rem] border"
              key={index}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <FieldCard
              icon={<Tags className="h-4 w-4" />}
              label="Status atual"
              value={<PanelContactStatusBadge status={contact.status} />}
            />
            <FieldCard
              icon={<CalendarClock className="h-4 w-4" />}
              label="Criado em"
              value={formatPanelContactDateTime(contact.createdAt)}
            />
            <FieldCard
              icon={<CalendarClock className="h-4 w-4" />}
              label="Atualizado em"
              value={formatPanelContactDateTime(contact.updatedAt ?? contact.createdAt)}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <FieldCard
              icon={<Mail className="h-4 w-4" />}
              label="E-mail"
              value={
                <a className="text-primary transition-opacity hover:opacity-80" href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
              }
            />
            <FieldCard
              icon={<Phone className="h-4 w-4" />}
              label="WhatsApp"
              value={
                <a
                  className="text-primary transition-opacity hover:opacity-80"
                  href={buildPanelContactWhatsAppHref(contact.whatsapp)}
                  rel="noreferrer"
                  target="_blank"
                >
                  {contact.whatsapp}
                </a>
              }
            />
            <FieldCard
              icon={<Tags className="h-4 w-4" />}
              label="Origem"
              value={
                contact.source ? (
                  <code className="rounded-full border border-outline-variant/14 bg-surface-container-low px-3 py-1 text-xs font-semibold text-on-surface-variant">
                    {contact.source}
                  </code>
                ) : (
                  "Não informada"
                )
              }
            />
            <FieldCard
              icon={<CalendarClock className="h-4 w-4" />}
              label="Mudança de status"
              value={formatPanelContactDateTime(contact.statusUpdatedAt ?? contact.updatedAt ?? contact.createdAt)}
            />
          </div>

          <section className="panel-card rounded-[1.5rem] border p-5">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
              <MessageSquareText className="h-4 w-4" />
              Mensagem recebida
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-on-surface-variant">
              {contact.message}
            </p>
          </section>

          <section className="grid gap-5 xl:grid-cols-[18rem_minmax(0,1fr)]">
            <div className="panel-card rounded-[1.5rem] border p-5">
              <AppSelect
                label="Etapa do funil"
                onChange={(event) => onDraftChange("status", event.target.value as PanelContactStatus)}
                value={draft.status}
              >
                {availableStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {getPanelContactStatusLabel(status)}
                  </option>
                ))}
              </AppSelect>

              <div className="mt-5 rounded-[1.25rem] border border-dashed border-outline-variant/16 px-4 py-4 text-sm leading-relaxed text-on-surface-variant">
                Use o botão de arquivar quando o lead sair do fluxo visual do funil, mas ainda precisar
                permanecer no histórico da operação.
              </div>
            </div>

            <label className="panel-card rounded-[1.5rem] border p-5">
              <span className="text-xs font-semibold text-on-surface">Notas internas</span>
              <textarea
                className="panel-input mt-3 min-h-[220px] w-full rounded-[1.25rem] border px-4 py-4 text-sm leading-relaxed text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-primary/35"
                onChange={(event) => onDraftChange("notes", event.target.value)}
                placeholder="Registre contexto comercial, próximos passos ou informações úteis para a equipe."
                value={draft.notes}
              />
            </label>
          </section>
        </div>
      )}
    </PanelDrawer>
  );
}

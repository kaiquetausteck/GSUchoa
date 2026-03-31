import { CalendarDays, FileText, Layers3, LoaderCircle, Megaphone, Target } from "lucide-react";

import type { PanelPaidMediaCampaignStatus } from "../../services/painel/paid-media-api";
import { AppInput } from "../shared/ui/AppInput";
import { AppSelect } from "../shared/ui/AppSelect";
import { AppTextarea } from "../shared/ui/AppTextarea";

export type PanelPaidMediaCampaignDraft = {
  clientId: string;
  endDate: string;
  metaAdAccountId: string;
  name: string;
  notes: string;
  objective: string;
  startDate: string;
  status: PanelPaidMediaCampaignStatus;
};

export type PanelPaidMediaCampaignFormErrors = Partial<
  Record<"endDate" | "name" | "startDate", string>
>;

type PanelPaidMediaCampaignFormProps = {
  adAccountOptions: Array<{ label: string; value: string }>;
  clientOptions: Array<{ label: string; value: string }>;
  draft: PanelPaidMediaCampaignDraft;
  errors: PanelPaidMediaCampaignFormErrors;
  isAccountsLoading: boolean;
  isClientsLoading: boolean;
  isSaving: boolean;
  mode: "create" | "edit";
  onCancel: () => void;
  onChange: (draft: PanelPaidMediaCampaignDraft) => void;
  onSubmit: () => void;
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs font-medium text-red-500">{message}</p>;
}

export function PanelPaidMediaCampaignForm({
  adAccountOptions,
  clientOptions,
  draft,
  errors,
  isAccountsLoading,
  isClientsLoading,
  isSaving,
  mode,
  onCancel,
  onChange,
  onSubmit,
}: PanelPaidMediaCampaignFormProps) {
  return (
    <div className="space-y-6">
      <section className="panel-card rounded-[2rem] border p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-primary/16 bg-primary/10 text-primary">
            <Megaphone className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-primary">
              Campanha interna
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-on-surface">
              {mode === "create" ? "Estrutura da nova campanha Meta" : "Editar campanha Meta"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
              Organize a operação de tráfego pago da agência com uma campanha interna clara,
              pronta para receber dashboard, período, cliente e futuras vinculações reais da Meta.
            </p>
          </div>
        </div>
      </section>

      <section className="panel-card rounded-[2rem] border p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <div>
              <AppInput
                label="Nome da campanha"
                leadingIcon={<Megaphone className="h-4 w-4" />}
                onChange={(event) => onChange({ ...draft, name: event.target.value })}
                placeholder="Ex: Meta Leads Abril 2026"
                value={draft.name}
              />
              <FieldError message={errors.name} />
            </div>

            <AppSelect
              label="Cliente"
              onChange={(event) => onChange({ ...draft, clientId: event.target.value })}
              value={draft.clientId}
            >
              <option value="">{isClientsLoading ? "Carregando clientes..." : "Sem cliente vinculado"}</option>
              {clientOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </AppSelect>

            <AppInput
              label="Objetivo"
              leadingIcon={<Target className="h-4 w-4" />}
              onChange={(event) => onChange({ ...draft, objective: event.target.value })}
              placeholder="Ex: Geração de leads"
              value={draft.objective}
            />
          </div>

          <div className="space-y-4">
            <AppSelect
              label="Status"
              onChange={(event) =>
                onChange({
                  ...draft,
                  status: event.target.value as PanelPaidMediaCampaignStatus,
                })}
              value={draft.status}
            >
              <option value="draft">Rascunho</option>
              <option value="active">Ativa</option>
              <option value="paused">Pausada</option>
              <option value="completed">Concluída</option>
              <option value="archived">Arquivada</option>
            </AppSelect>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <AppInput
                  label="Data de início"
                  leadingIcon={<CalendarDays className="h-4 w-4" />}
                  onChange={(event) => onChange({ ...draft, startDate: event.target.value })}
                  type="date"
                  value={draft.startDate}
                />
                <FieldError message={errors.startDate} />
              </div>

              <div>
                <AppInput
                  label="Data de encerramento"
                  leadingIcon={<CalendarDays className="h-4 w-4" />}
                  onChange={(event) => onChange({ ...draft, endDate: event.target.value })}
                  type="date"
                  value={draft.endDate}
                />
                <FieldError message={errors.endDate} />
              </div>
            </div>

            <AppSelect
              label="Conta Meta vinculada"
              onChange={(event) => onChange({ ...draft, metaAdAccountId: event.target.value })}
              value={draft.metaAdAccountId}
            >
              <option value="">
                {isAccountsLoading ? "Carregando contas Meta..." : "Nenhuma conta vinculada"}
              </option>
              {adAccountOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </AppSelect>
          </div>
        </div>
      </section>

      <section className="panel-card rounded-[2rem] border p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <AppTextarea
              label="Observações"
              onChange={(event) => onChange({ ...draft, notes: event.target.value })}
              placeholder="Contexto operacional, direcionamentos comerciais, observações de criativo ou quaisquer anotações relevantes."
              rows={7}
              value={draft.notes}
            />
          </div>

          <div className="panel-card-muted rounded-[1.6rem] border p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-outline-variant/15 bg-surface-container-low text-primary">
                <Layers3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">Plataforma fixa: Meta</p>
                <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
                  Esta etapa do módulo foi preparada exclusivamente para a operação de Meta Ads.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[1.3rem] border border-outline-variant/12 bg-surface-container-low px-4 py-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-on-surface">Escopo atual</p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                O cadastro já salva objetivo, status, período, observações e conta Meta opcional,
                mantendo espaço para dashboards e futuras vinculações com campanhas reais.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          className="panel-card-muted inline-flex h-12 items-center justify-center rounded-2xl border px-5 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
          onClick={onCancel}
          type="button"
        >
          Cancelar
        </button>
        <button
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55"
          disabled={isSaving}
          onClick={onSubmit}
          type="button"
        >
          {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          {mode === "create" ? "Criar campanha" : "Salvar alterações"}
        </button>
      </div>
    </div>
  );
}

import * as Popover from "@radix-ui/react-popover";
import { Copy, Edit3, FileText, Link2, PencilRuler, Plus, RefreshCcw, Save, Search, Share2, SlidersHorizontal, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PanelPageHeader } from "../../components/painel/PanelPageHeader";
import { PanelPagination } from "../../components/painel/PanelPagination";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { PanelDrawer } from "../../components/shared/PanelDrawer";
import { AppInput } from "../../components/shared/ui/AppInput";
import { AppSelect } from "../../components/shared/ui/AppSelect";
import { usePanelAuth } from "../../context/painel/PanelAuthContext";
import { useToast } from "../../context/shared/ToastContext";
import { useDebouncedValue } from "../../hooks/painel/useDebouncedValue";
import {
  createPanelClientReport,
  deletePanelClientReport,
  duplicatePanelClientReport,
  listPanelClientReportClients,
  listPanelClientReports,
  type PanelClientReportClientRecord,
  type PanelClientReportRecord,
  type PanelClientReportStatus,
  updatePanelClientReport,
} from "../../services/painel/client-reports-api";

type ReportDraft = {
  clientId: string;
  periodEnd: string;
  periodStart: string;
  status: PanelClientReportStatus;
  title: string;
};

type DrawerMode = "create" | "edit";
type StatusFilter = "all" | PanelClientReportStatus;

const EMPTY_DRAFT: ReportDraft = {
  clientId: "",
  periodEnd: "",
  periodStart: "",
  status: "draft",
  title: "",
};

const STATUS_LABELS: Record<PanelClientReportStatus, string> = {
  archived: "Arquivado",
  draft: "Rascunho",
  generated: "Gerado",
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "Sem registro";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Sem registro";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsedDate);
}

function formatPeriod(report: PanelClientReportRecord) {
  if (!report.periodStart && !report.periodEnd) {
    return "Sem período";
  }

  const formatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });
  const start = report.periodStart ? formatter.format(new Date(report.periodStart)) : "Início aberto";
  const end = report.periodEnd ? formatter.format(new Date(report.periodEnd)) : "Fim aberto";
  return `${start} - ${end}`;
}

function formatDateInput(value: string | null) {
  if (!value) {
    return "";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toISOString().slice(0, 10);
}

function createDraftFromReport(report: PanelClientReportRecord): ReportDraft {
  return {
    clientId: report.clientId,
    periodEnd: formatDateInput(report.periodEnd),
    periodStart: formatDateInput(report.periodStart),
    status: report.status,
    title: report.title,
  };
}

function createEmptyReportDraft(clients: PanelClientReportClientRecord[]): ReportDraft {
  return {
    ...EMPTY_DRAFT,
    clientId: clients[0]?.id ?? "",
  };
}

function buildDatePayload(value: string) {
  return value ? new Date(`${value}T00:00:00.000Z`).toISOString() : null;
}

function buildPublicClientReportsUrl(clientSlug: string) {
  return `${window.location.origin}/relatorios/${encodeURIComponent(clientSlug)}`;
}

function buildPublicReportUrl(report: PanelClientReportRecord) {
  return `${buildPublicClientReportsUrl(report.client.slug)}/${encodeURIComponent(report.id)}`;
}

export default function ClientReportsPage() {
  const navigate = useNavigate();
  const { token } = usePanelAuth();
  const toast = useToast();
  const [items, setItems] = useState<PanelClientReportRecord[]>([]);
  const [clients, setClients] = useState<PanelClientReportClientRecord[]>([]);
  const [drawerMode, setDrawerMode] = useState<DrawerMode | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ReportDraft>(EMPTY_DRAFT);
  const [reportToDelete, setReportToDelete] = useState<PanelClientReportRecord | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebouncedValue(searchInput, 350);
  const selectedReport = useMemo(
    () => items.find((item) => item.id === selectedReportId) ?? null,
    [items, selectedReportId],
  );

  const filteredItems = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();

    return items.filter((item) => {
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesSearch =
        !normalizedSearch ||
        [item.title, item.client.name, item.createdByUser.name, item.createdByUser.email]
          .some((value) => value.toLowerCase().includes(normalizedSearch));

      return matchesStatus && matchesSearch;
    });
  }, [debouncedSearch, items, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / perPage));
  const visibleItems = filteredItems.slice((page - 1) * perPage, page * perPage);
  const hasActiveFilters = statusFilter !== "all" || perPage !== 10;
  const statusLabel = statusFilter === "all" ? "Todos" : STATUS_LABELS[statusFilter];

  const loadData = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    try {
      const [reports, clientsResponse] = await Promise.all([
        listPanelClientReports(token),
        listPanelClientReportClients(token),
      ]);

      setItems(reports);
      setClients(clientsResponse);
    } catch (error) {
      toast.error({
        title: "Falha ao carregar relatórios",
        description: error instanceof Error ? error.message : "Não foi possível carregar os relatórios.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, perPage, statusFilter]);

  const closeDrawer = useCallback(() => {
    setDrawerMode(null);
    setSelectedReportId(null);
    setDraft(EMPTY_DRAFT);
  }, []);

  const openCreateDrawer = useCallback(() => {
    setDrawerMode("create");
    setSelectedReportId(null);
    setDraft(createEmptyReportDraft(clients));
  }, [clients]);

  const openEditDrawer = useCallback((report: PanelClientReportRecord) => {
    setDrawerMode("edit");
    setSelectedReportId(report.id);
    setDraft(createDraftFromReport(report));
  }, []);

  const saveReport = async () => {
    if (!token || !draft.clientId || !draft.title.trim()) {
      toast.error({
        title: "Campos obrigatórios",
        description: "Selecione o cliente e informe um título para salvar o relatório.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const input = {
        clientId: draft.clientId,
        periodEnd: buildDatePayload(draft.periodEnd),
        periodStart: buildDatePayload(draft.periodStart),
        status: draft.status,
        title: draft.title.trim(),
      };
      const saved = selectedReport
        ? await updatePanelClientReport(token, selectedReport.id, input)
        : await createPanelClientReport(token, input);

      setItems((current) =>
        current.some((item) => item.id === saved.id)
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...current],
      );
      setSelectedReportId(saved.id);
      setDraft(createDraftFromReport(saved));
      toast.success({
        title: "Relatório salvo",
        description: "As alterações foram registradas.",
      });
      closeDrawer();
    } catch (error) {
      toast.error({
        title: "Falha ao salvar relatório",
        description: error instanceof Error ? error.message : "Não foi possível salvar o relatório.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const duplicateReport = async (report: PanelClientReportRecord) => {
    if (!token) {
      return;
    }

    try {
      const clonedReport = await duplicatePanelClientReport(token, report.id);
      setItems((current) => [clonedReport, ...current]);
      toast.success({
        title: "Relatório clonado",
        description: "Uma cópia em rascunho foi criada.",
      });
    } catch (error) {
      toast.error({
        title: "Falha ao clonar relatório",
        description: error instanceof Error ? error.message : "Não foi possível clonar o relatório.",
      });
    }
  };

  const copyShareLink = async (url: string, label: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success({
        title: "Link copiado",
        description: `${label} pronto para compartilhar.`,
      });
    } catch {
      toast.error({
        title: "Falha ao copiar",
        description: "Não foi possível copiar o link para a área de transferência.",
      });
    }
  };

  const deleteReport = async () => {
    if (!token || !reportToDelete) {
      return;
    }

    setIsDeleting(true);
    try {
      await deletePanelClientReport(token, reportToDelete.id);
      setItems((current) => current.filter((item) => item.id !== reportToDelete.id));
      setReportToDelete(null);
      toast.success({
        title: "Relatório removido",
        description: "O relatório saiu da listagem.",
      });
    } catch (error) {
      toast.error({
        title: "Falha ao excluir relatório",
        description: error instanceof Error ? error.message : "Não foi possível excluir o relatório.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <PanelPageHeader
          actions={(
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              onClick={openCreateDrawer}
              type="button"
            >
              <Plus className="h-4 w-4" />
              Novo relatório
            </button>
          )}
          breadcrumbs={[
            { label: "Painel", to: "/painel/dashboard" },
            { label: "Relatório Cliente" },
          ]}
          description="Gerencie relatórios personalizados por cliente, com histórico de criação e edição."
          title="Relatório Cliente"
        />

        <div className="panel-card rounded-[1.75rem] border p-5 md:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 flex-1">
              <AppInput
                className="py-0"
                leadingIcon={<Search className="h-4 w-4" />}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Buscar por relatório, cliente ou responsável"
                value={searchInput}
                wrapperClassName="h-12 rounded-[1.2rem]"
              />

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="panel-card-muted inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold text-on-surface">
                  {statusLabel}
                </span>
                <span className="panel-card-muted inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold text-on-surface">
                  {perPage} por página
                </span>
                {hasActiveFilters || searchInput ? (
                  <button
                    className="inline-flex items-center gap-1 rounded-full border border-outline-variant/20 px-3 py-1.5 text-xs font-semibold text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary"
                    onClick={() => {
                      setSearchInput("");
                      setStatusFilter("all");
                      setPerPage(10);
                    }}
                    type="button"
                  >
                    <X className="h-3.5 w-3.5" />
                    Limpar filtros
                  </button>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 xl:self-start">
              <Popover.Root>
                <Popover.Trigger asChild>
                  <button
                    className="panel-card-muted relative inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                    type="button"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filtros
                    {hasActiveFilters ? (
                      <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-primary" />
                    ) : null}
                  </button>
                </Popover.Trigger>

                <Popover.Portal>
                  <Popover.Content
                    align="end"
                    className="panel-popover z-[120] w-[22rem] rounded-[1.5rem] border p-4 shadow-lg"
                    sideOffset={10}
                  >
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
                          Filtros
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-on-surface">
                          Ajustar listagem
                        </h3>
                      </div>

                      <AppSelect
                        label="Status"
                        onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                        value={statusFilter}
                      >
                        <option value="all">Todos</option>
                        <option value="draft">Rascunho</option>
                        <option value="generated">Gerado</option>
                        <option value="archived">Arquivado</option>
                      </AppSelect>

                      <AppSelect
                        label="Por página"
                        onChange={(event) => setPerPage(Number(event.target.value))}
                        value={String(perPage)}
                      >
                        {[10, 20, 30, 50].map((value) => (
                          <option key={value} value={String(value)}>
                            {value}
                          </option>
                        ))}
                      </AppSelect>

                      <div className="flex items-center justify-between gap-3 border-t border-outline-variant/10 pt-3">
                        <button
                          className="text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
                          onClick={() => {
                            setStatusFilter("all");
                            setPerPage(10);
                          }}
                          type="button"
                        >
                          Restaurar padrão
                        </button>
                        <Popover.Close asChild>
                          <button
                            className="rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                            type="button"
                          >
                            Concluir
                          </button>
                        </Popover.Close>
                      </div>
                    </div>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>

              <button
                className="panel-card-muted inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                onClick={() => void loadData()}
                type="button"
              >
                <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Atualizar
              </button>
            </div>
          </div>
        </div>

        <section className="panel-card overflow-hidden rounded-[1.75rem] border">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="panel-card-muted border-b border-outline-variant/12">
                <tr className="text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">
                  <th className="px-5 py-4 font-semibold">Relatório</th>
                  <th className="px-5 py-4 font-semibold">Cliente</th>
                  <th className="px-5 py-4 font-semibold">Período</th>
                  <th className="px-5 py-4 font-semibold">Responsável</th>
                  <th className="px-5 py-4 font-semibold">Atualizado</th>
                  <th className="px-5 py-4 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr className="border-b border-outline-variant/10 last:border-b-0" key={index}>
                      <td className="px-5 py-4" colSpan={6}>
                        <div className="panel-card-muted h-12 animate-pulse rounded-2xl border" />
                      </td>
                    </tr>
                  ))
                ) : visibleItems.length ? (
                  visibleItems.map((item) => (
                    <tr
                      className="border-b border-outline-variant/10 transition-colors hover:bg-surface-container-low/55 last:border-b-0"
                      key={item.id}
                    >
                      <td className="min-w-[18rem] px-5 py-4">
                        <p className="font-semibold text-on-surface">{item.title}</p>
                        <span className="mt-2 inline-flex rounded-full border border-primary/16 bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">
                          {STATUS_LABELS[item.status]}
                        </span>
                      </td>
                      <td className="min-w-[13rem] px-5 py-4 text-on-surface-variant">{item.client.name}</td>
                      <td className="min-w-[12rem] px-5 py-4 text-on-surface-variant">{formatPeriod(item)}</td>
                      <td className="min-w-[13rem] px-5 py-4">
                        <p className="font-semibold text-on-surface">{item.createdByUser.name}</p>
                        <p className="mt-1 text-xs text-on-surface-variant">{item.createdByUser.email}</p>
                      </td>
                      <td className="min-w-[10rem] px-5 py-4 text-on-surface-variant">{formatDateTime(item.updatedAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            className="panel-card-muted inline-flex h-10 w-10 items-center justify-center rounded-xl border text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary"
                            onClick={() => navigate(`/painel/relatorios-clientes/${item.id}/editor`)}
                            title="Editar conteúdo"
                            type="button"
                          >
                            <PencilRuler className="h-4 w-4" />
                          </button>
                          <button
                            className="panel-card-muted inline-flex h-10 w-10 items-center justify-center rounded-xl border text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary"
                            onClick={() => openEditDrawer(item)}
                            title="Editar dados"
                            type="button"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            className="panel-card-muted inline-flex h-10 w-10 items-center justify-center rounded-xl border text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary"
                            onClick={() => void duplicateReport(item)}
                            title="Clonar"
                            type="button"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            className="panel-card-muted inline-flex h-10 w-10 items-center justify-center rounded-xl border text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary"
                            onClick={() => void copyShareLink(buildPublicClientReportsUrl(item.client.slug), "Lista de relatórios do cliente")}
                            title="Copiar link dos relatórios do cliente"
                            type="button"
                          >
                            <Share2 className="h-4 w-4" />
                          </button>
                          <button
                            className="panel-card-muted inline-flex h-10 w-10 items-center justify-center rounded-xl border text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary"
                            onClick={() => void copyShareLink(buildPublicReportUrl(item), "Relatório")}
                            title="Copiar link público do relatório"
                            type="button"
                          >
                            <Link2 className="h-4 w-4" />
                          </button>
                          <button
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/8 text-red-500 transition-colors hover:bg-red-500/14"
                            onClick={() => setReportToDelete(item)}
                            title="Excluir"
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-6 py-14 text-center" colSpan={6}>
                      <FileText className="mx-auto h-10 w-10 text-primary" />
                      <p className="mt-4 text-sm font-semibold text-on-surface">Nenhum relatório encontrado</p>
                      <p className="mt-2 text-sm text-on-surface-variant">
                        Ajuste a busca ou crie um novo relatório.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-outline-variant/10 px-5 py-4">
            <PanelPagination currentPage={page} onPageChange={setPage} totalPages={totalPages} />
          </div>
        </section>
      </div>

      <PanelDrawer
        defaultWidth={720}
        description="Defina cliente, período e status do relatório."
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              className="panel-card-muted rounded-2xl border px-5 py-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
              onClick={closeDrawer}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving}
              onClick={() => void saveReport()}
              type="button"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Salvando..." : "Salvar relatório"}
            </button>
          </div>
        }
        maxWidth={920}
        minWidth={520}
        onClose={closeDrawer}
        open={drawerMode !== null}
        title={drawerMode === "create" ? "Novo relatório" : selectedReport?.title ?? "Editar relatório"}
      >
        <div className="space-y-5">
          <div className="panel-card rounded-[1.5rem] border p-5">
            <div className="grid gap-4">
              <AppInput
                label="Título"
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                placeholder="Relatório tráfego pago Kubis Advocacia"
                value={draft.title}
              />

              <AppSelect
                label="Cliente"
                onChange={(event) => setDraft((current) => ({ ...current, clientId: event.target.value }))}
                value={draft.clientId}
              >
                <option value="">Selecione um cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </AppSelect>

              <div className="grid gap-3 sm:grid-cols-2">
                <AppInput
                  label="Início"
                  onChange={(event) => setDraft((current) => ({ ...current, periodStart: event.target.value }))}
                  type="date"
                  value={draft.periodStart}
                />
                <AppInput
                  label="Fim"
                  onChange={(event) => setDraft((current) => ({ ...current, periodEnd: event.target.value }))}
                  type="date"
                  value={draft.periodEnd}
                />
              </div>

              <AppSelect
                label="Status"
                onChange={(event) =>
                  setDraft((current) => ({ ...current, status: event.target.value as PanelClientReportStatus }))}
                value={draft.status}
              >
                <option value="draft">Rascunho</option>
                <option value="generated">Gerado</option>
                <option value="archived">Arquivado</option>
              </AppSelect>
            </div>
          </div>
        </div>
      </PanelDrawer>

      <ConfirmDialog
        confirmLabel={isDeleting ? "Excluindo..." : "Excluir relatório"}
        description={
          reportToDelete
            ? `Essa ação remove o relatório "${reportToDelete.title}" da listagem.`
            : ""
        }
        isLoading={isDeleting}
        onClose={() => setReportToDelete(null)}
        onConfirm={() => void deleteReport()}
        open={Boolean(reportToDelete)}
        title="Confirmar exclusão"
      />
    </>
  );
}

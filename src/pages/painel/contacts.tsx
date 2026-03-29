import { Funnel, LayoutList } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { PanelContactDetailDrawer, type PanelContactDetailDraft } from "../../components/painel/PanelContactDetailDrawer";
import { PanelContactsKanban } from "../../components/painel/PanelContactsKanban";
import { PanelContactsFiltersBar } from "../../components/painel/PanelContactsFiltersBar";
import { PanelContactsTable } from "../../components/painel/PanelContactsTable";
import { PanelPageHeader } from "../../components/painel/PanelPageHeader";
import { PanelPagination } from "../../components/painel/PanelPagination";
import {
  createPanelContactFunnelRecord,
  mergePanelContactDetailIntoFunnelRecord,
  sortPanelContactsByCreatedAtDesc,
} from "../../components/painel/panelContactUtils";
import { PANEL_CONTACT_STATUS_LABELS } from "../../config/painel/contact-status";
import { usePanelAuth } from "../../context/painel/PanelAuthContext";
import { useToast } from "../../context/shared/ToastContext";
import { useDebouncedValue } from "../../hooks/painel/useDebouncedValue";
import {
  archivePanelContact,
  getPanelContactById,
  listAllPanelContactsForFunnel,
  listPanelContacts,
  updatePanelContact,
  updatePanelContactStatus,
  type PanelContactDetailRecord,
  type PanelContactFunnelRecord,
  type PanelContactSort,
  type PanelContactStatus,
  type PanelContactSummaryRecord,
} from "../../services/painel/contact-api";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";

type ContactsView = "list" | "funnel";

type ContactActionTarget =
  | PanelContactSummaryRecord
  | PanelContactFunnelRecord
  | PanelContactDetailRecord;

const DEFAULT_PER_PAGE = 10;
const DEFAULT_SORT: PanelContactSort = "createdAt-desc";

function buildDateRangeFilters(createdFromValue: string, createdToValue: string) {
  let normalizedFrom = createdFromValue;
  let normalizedTo = createdToValue;

  if (normalizedFrom && normalizedTo && normalizedFrom > normalizedTo) {
    normalizedFrom = createdToValue;
    normalizedTo = createdFromValue;
  }

  const startValue = normalizedFrom ? `${normalizedFrom}T00:00:00` : null;
  const endValue = normalizedTo ? `${normalizedTo}T23:59:59.999` : null;
  const startDate = startValue ? new Date(startValue) : null;
  const endDate = endValue ? new Date(endValue) : null;
  const hasValidStart = Boolean(startDate && !Number.isNaN(startDate.getTime()));
  const hasValidEnd = Boolean(endDate && !Number.isNaN(endDate.getTime()));

  return {
    createdFrom: hasValidStart && startDate ? startDate.toISOString() : undefined,
    createdTo: hasValidEnd && endDate ? endDate.toISOString() : undefined,
  };
}

function createContactDetailDraft(contact: PanelContactDetailRecord): PanelContactDetailDraft {
  return {
    notes: contact.notes ?? "",
    status: contact.status,
  };
}

function toContactSummary(contact: PanelContactDetailRecord): PanelContactSummaryRecord {
  return {
    id: contact.id,
    fullName: contact.fullName,
    email: contact.email,
    whatsapp: contact.whatsapp,
    status: contact.status,
    source: contact.source,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
  };
}

function chunkItems<Item>(items: Item[], size: number) {
  const chunks: Item[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

export default function ContactsPage() {
  const toast = useToast();
  const { token } = usePanelAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [listItems, setListItems] = useState<PanelContactSummaryRecord[]>([]);
  const [funnelItems, setFunnelItems] = useState<PanelContactFunnelRecord[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [statusFilter, setStatusFilter] = useState<"all" | PanelContactStatus>("all");
  const [sort, setSort] = useState<PanelContactSort>(DEFAULT_SORT);
  const [createdFromValue, setCreatedFromValue] = useState("");
  const [createdToValue, setCreatedToValue] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [isListLoading, setIsListLoading] = useState(false);
  const [isFunnelLoading, setIsFunnelLoading] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<string[]>([]);
  const [contactToArchive, setContactToArchive] = useState<ContactActionTarget | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<PanelContactDetailRecord | null>(null);
  const [selectedContactDraft, setSelectedContactDraft] = useState<PanelContactDetailDraft | null>(null);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);
  const [isDrawerSaving, setIsDrawerSaving] = useState(false);
  const debouncedSearch = useDebouncedValue(searchInput, 350);
  const funnelLoadRef = useRef(0);

  const view: ContactsView = location.pathname.startsWith("/painel/contatos/funil") ? "funnel" : "list";
  const dateRangeFilters = useMemo(
    () => buildDateRangeFilters(createdFromValue, createdToValue),
    [createdFromValue, createdToValue],
  );

  const setView = useCallback((nextView: ContactsView) => {
    navigate(nextView === "funnel" ? "/painel/contatos/funil" : "/painel/contatos");
  }, [navigate]);

  const addUpdatingId = useCallback((id: string) => {
    setUpdatingIds((current) => (current.includes(id) ? current : [...current, id]));
  }, []);

  const removeUpdatingId = useCallback((id: string) => {
    setUpdatingIds((current) => current.filter((currentId) => currentId !== id));
  }, []);

  const loadList = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsListLoading(true);

    try {
      const response = await listPanelContacts(token, {
        page,
        limit: perPage,
        search: debouncedSearch,
        status: statusFilter,
        sort,
        createdFrom: dateRangeFilters.createdFrom,
        createdTo: dateRangeFilters.createdTo,
      });

      setListItems(response.items);
      setTotalPages(response.totalPages);

      if (response.totalPages > 0 && page > response.totalPages) {
        setPage(response.totalPages);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os contatos agora.";

      setListItems([]);
      setTotalPages(1);
      toast.error({
        title: "Falha ao carregar contatos",
        description: message,
      });
    } finally {
      setIsListLoading(false);
    }
  }, [dateRangeFilters.createdFrom, dateRangeFilters.createdTo, debouncedSearch, page, perPage, sort, statusFilter, toast, token]);

  const hydrateFunnelDetails = useCallback(async (contactIds: string[], requestId: number) => {
    if (!token || !contactIds.length) {
      return;
    }

    const batches = chunkItems(contactIds, 8);

    for (const batch of batches) {
      const results = await Promise.allSettled(
        batch.map(async (id) => getPanelContactById(token, id)),
      );

      if (funnelLoadRef.current !== requestId) {
        return;
      }

      const fulfilledDetails = results
        .filter((result): result is PromiseFulfilledResult<PanelContactDetailRecord> => result.status === "fulfilled")
        .map((result) => result.value);

      if (!fulfilledDetails.length) {
        continue;
      }

      setFunnelItems((currentItems) => {
        let nextItems = currentItems;

        for (const detail of fulfilledDetails) {
          if (detail.status === "archived") {
            nextItems = nextItems.filter((item) => item.id !== detail.id);
            continue;
          }

          nextItems = mergePanelContactDetailIntoFunnelRecord(nextItems, detail);
        }

        return nextItems;
      });
    }
  }, [token]);

  const loadFunnel = useCallback(async () => {
    if (!token) {
      return;
    }

    const requestId = funnelLoadRef.current + 1;
    funnelLoadRef.current = requestId;
    setIsFunnelLoading(true);

    try {
      const response = await listAllPanelContactsForFunnel(token);
      const nextItems = sortPanelContactsByCreatedAtDesc(
        response
          .filter((item) => item.status !== "archived")
          .map((item) => createPanelContactFunnelRecord(item)),
      );

      if (funnelLoadRef.current !== requestId) {
        return;
      }

      setFunnelItems(nextItems);
      void hydrateFunnelDetails(
        nextItems.map((item) => item.id),
        requestId,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o funil de contatos agora.";

      setFunnelItems([]);
      toast.error({
        title: "Falha ao carregar o funil",
        description: message,
      });
    } finally {
      if (funnelLoadRef.current === requestId) {
        setIsFunnelLoading(false);
      }
    }
  }, [hydrateFunnelDetails, toast, token]);

  useEffect(() => {
    if (view === "funnel") {
      void loadFunnel();
      return;
    }

    void loadList();
  }, [loadFunnel, loadList, view]);

  useEffect(() => {
    if (!selectedContactId || !token) {
      return;
    }

    let isMounted = true;
    setIsDrawerLoading(true);

    void (async () => {
      try {
        const detail = await getPanelContactById(token, selectedContactId);

        if (!isMounted) {
          return;
        }

        setSelectedContact(detail);
        setSelectedContactDraft(createContactDetailDraft(detail));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        toast.error({
          title: "Não foi possível abrir este contato",
          description:
            error instanceof Error
              ? error.message
              : "Os detalhes do lead não puderam ser carregados.",
        });
        setSelectedContactId(null);
        setSelectedContact(null);
        setSelectedContactDraft(null);
      } finally {
        if (isMounted) {
          setIsDrawerLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [selectedContactId, toast, token]);

  const handleOpenDetails = useCallback((contact: ContactActionTarget) => {
    setSelectedContactId(contact.id);
    setSelectedContact(null);
    setSelectedContactDraft(null);
    setIsDrawerLoading(false);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedContactId(null);
    setSelectedContact(null);
    setSelectedContactDraft(null);
    setIsDrawerLoading(false);
  }, []);

  const applyContactUpdate = useCallback((updatedContact: PanelContactDetailRecord) => {
    setListItems((currentItems) => {
      const hasItem = currentItems.some((item) => item.id === updatedContact.id);

      if (!hasItem) {
        return currentItems;
      }

      if (statusFilter !== "all" && updatedContact.status !== statusFilter) {
        return currentItems.filter((item) => item.id !== updatedContact.id);
      }

      return currentItems.map((item) => (item.id === updatedContact.id ? toContactSummary(updatedContact) : item));
    });

    setFunnelItems((currentItems) => {
      if (updatedContact.status === "archived") {
        return currentItems.filter((item) => item.id !== updatedContact.id);
      }

      return mergePanelContactDetailIntoFunnelRecord(currentItems, updatedContact);
    });

    setSelectedContact((currentContact) =>
      currentContact?.id === updatedContact.id ? updatedContact : currentContact,
    );

    setSelectedContactDraft((currentDraft) => {
      if (!currentDraft || selectedContactId !== updatedContact.id) {
        return currentDraft;
      }

      return createContactDetailDraft(updatedContact);
    });
  }, [selectedContactId, statusFilter]);

  const handleStatusChange = useCallback(async (
    contact: ContactActionTarget,
    nextStatus: PanelContactStatus,
  ) => {
    if (!token || contact.status === nextStatus) {
      return;
    }

    addUpdatingId(contact.id);
    const optimisticTimestamp = new Date().toISOString();

    setListItems((currentItems) => currentItems.map((item) => {
      if (item.id !== contact.id) {
        return item;
      }

      return {
        ...item,
        status: nextStatus,
        updatedAt: optimisticTimestamp,
      };
    }).filter((item) => statusFilter === "all" || item.status === statusFilter));

    setFunnelItems((currentItems) => {
      if (nextStatus === "archived") {
        return currentItems.filter((item) => item.id !== contact.id);
      }

      return sortPanelContactsByCreatedAtDesc(
        currentItems.map((item) => (item.id === contact.id
          ? {
              ...item,
              status: nextStatus,
              statusUpdatedAt: optimisticTimestamp,
              updatedAt: optimisticTimestamp,
            }
          : item)),
      );
    });

    setSelectedContact((currentContact) => {
      if (!currentContact || currentContact.id !== contact.id) {
        return currentContact;
      }

      return {
        ...currentContact,
        status: nextStatus,
        statusUpdatedAt: optimisticTimestamp,
        updatedAt: optimisticTimestamp,
      };
    });

    setSelectedContactDraft((currentDraft) => {
      if (!currentDraft || selectedContactId !== contact.id) {
        return currentDraft;
      }

      return {
        ...currentDraft,
        status: nextStatus,
      };
    });

    try {
      const updatedContact = await updatePanelContactStatus(token, contact.id, nextStatus);
      applyContactUpdate(updatedContact);

      toast.success({
        title: nextStatus === "archived" ? "Contato arquivado" : "Status atualizado",
        description:
          nextStatus === "archived"
            ? "O lead foi removido do funil visual e continua disponível na listagem."
            : `O contato foi movido para ${PANEL_CONTACT_STATUS_LABELS[nextStatus].toLowerCase()}.`,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar este contato agora.";

      toast.error({
        title: "Falha ao atualizar o contato",
        description: message,
      });

      if (view === "funnel") {
        void loadFunnel();
      } else {
        void loadList();
      }

      if (selectedContactId === contact.id) {
        handleCloseDrawer();
      }
    } finally {
      removeUpdatingId(contact.id);
    }
  }, [addUpdatingId, applyContactUpdate, handleCloseDrawer, loadFunnel, loadList, removeUpdatingId, selectedContactId, statusFilter, toast, token, view]);

  const handleConfirmArchive = useCallback(async () => {
    if (!token || !contactToArchive) {
      return;
    }

    setIsArchiving(true);

    try {
      const updatedContact = await archivePanelContact(token, contactToArchive.id);
      applyContactUpdate(updatedContact);
      setContactToArchive(null);

      toast.success({
        title: "Contato arquivado",
        description: "O lead foi removido do funil e preservado na listagem histórica.",
      });
    } catch (error) {
      toast.error({
        title: "Falha ao arquivar o contato",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível arquivar este lead agora.",
      });
    } finally {
      setIsArchiving(false);
    }
  }, [applyContactUpdate, contactToArchive, toast, token]);

  const handleSaveDrawer = useCallback(async () => {
    if (!token || !selectedContact || !selectedContactDraft) {
      return;
    }

    setIsDrawerSaving(true);

    try {
      const updatedContact = await updatePanelContact(token, {
        id: selectedContact.id,
        status: selectedContactDraft.status,
        notes: selectedContactDraft.notes.trim() ? selectedContactDraft.notes.trim() : null,
      });

      applyContactUpdate(updatedContact);

      toast.success({
        title: "Contato atualizado",
        description: "As informações internas deste lead foram salvas com sucesso.",
      });
    } catch (error) {
      toast.error({
        title: "Falha ao salvar o contato",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível salvar este contato agora.",
      });
    } finally {
      setIsDrawerSaving(false);
    }
  }, [applyContactUpdate, selectedContact, selectedContactDraft, toast, token]);

  const handleResetFilters = useCallback(() => {
    setSearchInput("");
    setCreatedFromValue("");
    setCreatedToValue("");

    if (view === "list") {
      setStatusFilter("all");
      setSort(DEFAULT_SORT);
      setPerPage(DEFAULT_PER_PAGE);
      setPage(1);
    }
  }, [view]);

  const hasListFilters =
    Boolean(searchInput.trim()) ||
    statusFilter !== "all" ||
    sort !== DEFAULT_SORT ||
    perPage !== DEFAULT_PER_PAGE ||
    Boolean(createdFromValue) ||
    Boolean(createdToValue);

  const hasDrawerChanges = useMemo(() => {
    if (!selectedContact || !selectedContactDraft) {
      return false;
    }

    return (
      selectedContact.status !== selectedContactDraft.status ||
      (selectedContact.notes ?? "").trim() !== selectedContactDraft.notes.trim()
    );
  }, [selectedContact, selectedContactDraft]);

  return (
    <div className={view === "funnel" ? "space-y-3" : "space-y-6"}>
      <PanelPageHeader
        actions={
          <div className="panel-card-muted inline-flex rounded-[1.35rem] border p-1">
            <button
              className={`inline-flex items-center gap-2 rounded-[1rem] px-4 py-2.5 text-sm font-semibold transition-colors ${
                view === "list"
                  ? "bg-primary text-white shadow-[0_14px_28px_rgba(34,98,240,0.22)]"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
              onClick={() => setView("list")}
              type="button"
            >
              <LayoutList className="h-4 w-4" />
              Listagem
            </button>
            <button
              className={`inline-flex items-center gap-2 rounded-[1rem] px-4 py-2.5 text-sm font-semibold transition-colors ${
                view === "funnel"
                  ? "bg-primary text-white shadow-[0_14px_28px_rgba(34,98,240,0.22)]"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
              onClick={() => setView("funnel")}
              type="button"
            >
              <Funnel className="h-4 w-4" />
              Funil
            </button>
          </div>
        }
        breadcrumbs={[
          { label: "Painel", to: "/painel/dashboard" },
          { label: "Contatos" },
          { label: view === "list" ? "Listagem" : "Funil" },
        ]}
        description={
          view === "list"
            ? "Acompanhe todos os contatos recebidos, inclusive os arquivados, com busca, filtros, paginação e acesso rápido aos detalhes."
            : "Visualize os leads ativos por etapa do funil, mova cards entre colunas e mantenha o fluxo comercial organizado."
        }
        title={view === "list" ? "Contatos" : "Funil de contatos"}
      />

      {view === "list" ? (
        <PanelContactsFiltersBar
          createdFromValue={createdFromValue}
          createdToValue={createdToValue}
          hasActiveFilters={hasListFilters}
          isLoading={isListLoading}
          onCreatedFromChange={(value) => {
            setCreatedFromValue(value);
            setPage(1);
          }}
          onCreatedToChange={(value) => {
            setCreatedToValue(value);
            setPage(1);
          }}
          onPerPageChange={(value) => {
            setPerPage(value);
            setPage(1);
          }}
          onRefresh={() => {
            void loadList();
          }}
          onResetFilters={handleResetFilters}
          onSearchChange={(value) => {
            setSearchInput(value);
            setPage(1);
          }}
          onSortChange={(value) => {
            setSort(value);
            setPage(1);
          }}
          onStatusChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
          perPage={perPage}
          searchValue={searchInput}
          sortValue={sort}
          statusValue={statusFilter}
          view={view}
        />
      ) : null}

      {view === "list" ? (
        <PanelContactsTable
          footer={
            <PanelPagination
              currentPage={page}
              onPageChange={setPage}
              totalPages={totalPages}
            />
          }
          isLoading={isListLoading}
          items={listItems}
          onArchive={(item) => setContactToArchive(item)}
          onOpenDetails={handleOpenDetails}
          onStatusChange={handleStatusChange}
          updatingIds={updatingIds}
        />
      ) : (
        <PanelContactsKanban
          isLoading={isFunnelLoading}
          items={funnelItems}
          onArchive={(item) => setContactToArchive(item)}
          onOpenDetails={handleOpenDetails}
          onStatusChange={handleStatusChange}
          updatingIds={updatingIds}
        />
      )}

      <PanelContactDetailDrawer
        contact={selectedContact}
        draft={selectedContactDraft}
        hasChanges={hasDrawerChanges}
        isLoading={isDrawerLoading}
        isSaving={isDrawerSaving}
        onArchive={() => {
          if (selectedContact) {
            setContactToArchive(selectedContact);
          }
        }}
        onClose={handleCloseDrawer}
        onDraftChange={(field, value) => {
          setSelectedContactDraft((currentDraft) => {
            if (!currentDraft) {
              return currentDraft;
            }

            return {
              ...currentDraft,
              [field]: value,
            };
          });
        }}
        onSave={handleSaveDrawer}
        open={selectedContactId !== null}
      />

      <ConfirmDialog
        confirmLabel="Arquivar contato"
        description={
          contactToArchive
            ? `O contato ${contactToArchive.fullName} sairá do funil visual, mas continuará disponível na listagem histórica.`
            : ""
        }
        isLoading={isArchiving}
        onClose={() => {
          if (!isArchiving) {
            setContactToArchive(null);
          }
        }}
        onConfirm={handleConfirmArchive}
        open={contactToArchive !== null}
        title="Arquivar contato"
      />
    </div>
  );
}

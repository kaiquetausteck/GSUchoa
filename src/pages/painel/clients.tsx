import { Building2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { PanelClientsDrawer, type PanelClientDraft, type PanelClientsDrawerMode, type PanelClientsDrawerTab } from "../../components/painel/PanelClientsDrawer";
import { PanelClientsFiltersBar } from "../../components/painel/PanelClientsFiltersBar";
import { PanelClientsTable } from "../../components/painel/PanelClientsTable";
import { PanelPageHeader } from "../../components/painel/PanelPageHeader";
import { PanelPagination } from "../../components/painel/PanelPagination";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { usePanelAuth } from "../../context/painel/PanelAuthContext";
import { useToast } from "../../context/shared/ToastContext";
import { useDebouncedValue } from "../../hooks/painel/useDebouncedValue";
import {
  createPanelClient,
  deletePanelClient,
  getPanelClientById,
  listPanelClients,
  setPanelClientFeatured,
  setPanelClientPublished,
  type PanelClientDetailRecord,
  type PanelClientSort,
  type PanelClientSummaryRecord,
  updatePanelClient,
} from "../../services/painel/clients-api";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDateTimeLocal(value: string | null) {
  if (!value) {
    return "";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const local = new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function createClientDraft(detail: PanelClientDetailRecord): PanelClientDraft {
  return {
    createdAt: detail.createdAt,
    deletedAt: detail.deletedAt,
    description: detail.description ?? "",
    featured: detail.featured,
    id: detail.id,
    isPublished: detail.isPublished,
    logoFile: null,
    logoUrl: detail.logoUrl,
    name: detail.name,
    publishedAt: formatDateTimeLocal(detail.publishedAt),
    slug: detail.slug,
    sortOrder: detail.sortOrder,
    updatedAt: detail.updatedAt,
    website: detail.website ?? "",
  };
}

function createEmptyClientDraft(): PanelClientDraft {
  return {
    createdAt: null,
    deletedAt: null,
    description: "",
    featured: false,
    id: "",
    isPublished: false,
    logoFile: null,
    logoUrl: null,
    name: "",
    publishedAt: "",
    slug: "",
    sortOrder: 0,
    updatedAt: null,
    website: "",
  };
}

function getDrawerTabFromErrorMessage(message: string): PanelClientsDrawerTab {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("publica") ||
    normalizedMessage.includes("featured") ||
    normalizedMessage.includes("destaque") ||
    normalizedMessage.includes("ordem")
  ) {
    return "meta";
  }

  if (
    normalizedMessage.includes("descricao") ||
    normalizedMessage.includes("description")
  ) {
    return "content";
  }

  return "main";
}

export default function ClientsPage() {
  const toast = useToast();
  const { token } = usePanelAuth();

  const [items, setItems] = useState<PanelClientSummaryRecord[]>([]);
  const [drawerActiveTab, setDrawerActiveTab] = useState<PanelClientsDrawerTab>("main");
  const [drawerMode, setDrawerMode] = useState<PanelClientsDrawerMode | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<PanelClientDraft | null>(null);
  const [clientToDelete, setClientToDelete] = useState<PanelClientSummaryRecord | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [publishedFilter, setPublishedFilter] = useState<"all" | "published" | "draft">("all");
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "featured" | "regular">("all");
  const [sort, setSort] = useState<PanelClientSort>("sortOrder-asc");
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebouncedValue(searchInput, 350);

  const loadClients = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await listPanelClients(token, {
        page,
        perPage,
        search: debouncedSearch,
        featured: featuredFilter,
        published: publishedFilter,
        sort,
      });

      setItems(response.items);
      setTotalPages(response.totalPages);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os clientes.";

      setItems([]);
      setTotalPages(1);
      toast.error({
        title: "Falha ao carregar clientes",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, featuredFilter, page, perPage, publishedFilter, sort, toast, token]);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  useEffect(() => {
    if (!selectedClientId || !token || drawerMode !== "edit") {
      return;
    }

    let isMounted = true;
    setIsDrawerLoading(true);

    void (async () => {
      try {
        const detail = await getPanelClientById(token, selectedClientId);

        if (!isMounted) {
          return;
        }

        setSelectedClient(createClientDraft(detail));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        toast.error({
          title: "Não foi possível abrir o cliente",
          description:
            error instanceof Error
              ? error.message
              : "O painel não conseguiu carregar os detalhes deste cliente.",
        });
      } finally {
        if (isMounted) {
          setIsDrawerLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [drawerMode, selectedClientId, toast, token]);

  const handleCloseDrawer = useCallback(() => {
    setDrawerActiveTab("main");
    setDrawerMode(null);
    setSelectedClientId(null);
    setSelectedClient(null);
    setIsDrawerLoading(false);
  }, []);

  const handleOpenDrawer = useCallback((item: PanelClientSummaryRecord) => {
    setDrawerActiveTab("main");
    setDrawerMode("edit");
    setSelectedClientId(item.id);
    setIsDrawerLoading(false);
    setSelectedClient({
      ...createEmptyClientDraft(),
      description: item.description ?? "",
      featured: item.featured,
      id: item.id,
      isPublished: item.isPublished,
      logoUrl: item.logoUrl,
      name: item.name,
      publishedAt: formatDateTimeLocal(item.publishedAt),
      slug: item.slug,
      sortOrder: item.sortOrder,
      website: item.website ?? "",
    });
  }, []);

  const handleCreateClient = useCallback(() => {
    setDrawerActiveTab("main");
    setDrawerMode("create");
    setSelectedClientId(null);
    setIsDrawerLoading(false);
    setSelectedClient(createEmptyClientDraft());
  }, []);

  const handleDraftFieldChange = useCallback((field: keyof PanelClientDraft, value: string | boolean | number) => {
    setSelectedClient((current) => {
      if (!current) {
        return current;
      }

      if (field === "name" && typeof value === "string") {
        const nextName = value;
        const currentAutoSlug = slugify(current.name);
        const shouldSyncSlug = !current.slug.trim() || current.slug === currentAutoSlug;

        return {
          ...current,
          name: nextName,
          slug: shouldSyncSlug ? slugify(nextName) : current.slug,
        };
      }

      const nextValue = field === "slug" && typeof value === "string" ? slugify(value) : value;

      return {
        ...current,
        [field]: nextValue,
      };
    });
  }, []);

  const handleSaveClient = useCallback(async () => {
    if (!token || !selectedClient || !drawerMode) {
      return;
    }

    if (!selectedClient.name.trim() || !selectedClient.slug.trim()) {
      setDrawerActiveTab("main");
      toast.error({
        title: "Campos obrigatórios",
        description: "Nome e slug precisam ser preenchidos.",
      });
      return;
    }

    if (!selectedClient.logoFile && !selectedClient.logoUrl?.trim()) {
      setDrawerActiveTab("main");
      toast.error({
        title: "Logo obrigatória",
        description: "Envie uma logo para o cliente antes de salvar.",
      });
      return;
    }

    setIsSaving(true);

    try {
      const input = {
        description: selectedClient.description || null,
        featured: selectedClient.featured,
        isPublished: selectedClient.isPublished,
        logoFile: selectedClient.logoFile,
        name: selectedClient.name,
        publishedAt: selectedClient.publishedAt
          ? new Date(selectedClient.publishedAt).toISOString()
          : null,
        slug: selectedClient.slug,
        sortOrder: selectedClient.sortOrder,
        website: selectedClient.website || null,
      };

      if (drawerMode === "create") {
        const created = await createPanelClient(token, input);

        toast.success({
          title: "Cliente criado",
          description: "O novo cliente foi registrado com sucesso no painel.",
        });

        handleCloseDrawer();

        const shouldReloadList =
          page !== 1 ||
          Boolean(debouncedSearch) ||
          publishedFilter !== "all" ||
          featuredFilter !== "all" ||
          sort !== "sortOrder-asc";

        if (shouldReloadList) {
          if (page !== 1) {
            setPage(1);
          } else {
            void loadClients();
          }
        } else {
          setItems((currentItems) => [created, ...currentItems].slice(0, perPage));
        }

        return;
      }

      const updated = await updatePanelClient(token, selectedClient.id, input);

      setSelectedClient(createClientDraft(updated));
      setItems((currentItems) =>
        currentItems.map((item) => (item.id === updated.id ? updated : item)),
      );

      toast.success({
        title: "Cliente atualizado",
        description: "As alterações do cliente foram salvas com sucesso.",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível concluir esta operação agora.";

      setDrawerActiveTab(getDrawerTabFromErrorMessage(message));
      toast.error({
        title: drawerMode === "create" ? "Falha ao criar cliente" : "Falha ao salvar cliente",
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    debouncedSearch,
    drawerMode,
    featuredFilter,
    handleCloseDrawer,
    loadClients,
    page,
    perPage,
    publishedFilter,
    selectedClient,
    sort,
    toast,
    token,
  ]);

  const handleDeleteClient = useCallback(async () => {
    if (!token || !clientToDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      await deletePanelClient(token, clientToDelete.id);

      const deletedId = clientToDelete.id;
      const willEmptyPage = items.length === 1 && page > 1;

      setItems((currentItems) => currentItems.filter((item) => item.id !== deletedId));
      setClientToDelete(null);

      if (selectedClientId === deletedId) {
        handleCloseDrawer();
      }

      toast.success({
        title: "Cliente excluído",
        description: "O cliente foi removido com sucesso.",
      });

      if (willEmptyPage) {
        setPage((currentPage) => Math.max(1, currentPage - 1));
        return;
      }

      void loadClients();
    } catch (error) {
      toast.error({
        title: "Falha ao excluir cliente",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível excluir este cliente agora.",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [clientToDelete, handleCloseDrawer, items.length, loadClients, page, selectedClientId, toast, token]);

  const handleTogglePublished = useCallback(async (item: PanelClientSummaryRecord) => {
    if (!token) {
      return;
    }

    try {
      const updated = await setPanelClientPublished(token, item.id, !item.isPublished);
      setItems((currentItems) => currentItems.map((currentItem) => (currentItem.id === updated.id ? updated : currentItem)));
      if (selectedClientId === updated.id && drawerMode === "edit") {
        setSelectedClient(createClientDraft(updated));
      }
      toast.success({
        title: updated.isPublished ? "Cliente publicado" : "Cliente movido para rascunho",
        description: `${updated.name} foi atualizado com sucesso.`,
      });
    } catch (error) {
      toast.error({
        title: "Falha ao atualizar publicação",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar este cliente.",
      });
    }
  }, [drawerMode, selectedClientId, toast, token]);

  const handleToggleFeatured = useCallback(async (item: PanelClientSummaryRecord) => {
    if (!token) {
      return;
    }

    try {
      const updated = await setPanelClientFeatured(token, item.id, !item.featured);
      setItems((currentItems) => currentItems.map((currentItem) => (currentItem.id === updated.id ? updated : currentItem)));
      if (selectedClientId === updated.id && drawerMode === "edit") {
        setSelectedClient(createClientDraft(updated));
      }
      toast.success({
        title: updated.featured ? "Cliente em destaque" : "Destaque removido",
        description: `${updated.name} foi atualizado com sucesso.`,
      });
    } catch (error) {
      toast.error({
        title: "Falha ao atualizar destaque",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar este cliente.",
      });
    }
  }, [drawerMode, selectedClientId, toast, token]);

  return (
    <>
      <div className="space-y-6">
        <PanelPageHeader
          actions={(
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              onClick={handleCreateClient}
              type="button"
            >
              <Building2 className="h-4 w-4" />
              Adicionar cliente
            </button>
          )}
          breadcrumbs={[
            { label: "Painel", to: "/painel/dashboard" },
            { label: "Clientes" },
          ]}
          description="Organize a vitrine de marcas atendidas com controle de publicação, destaque e logotipo."
          title="Clientes"
        />

        <PanelClientsFiltersBar
          featuredValue={featuredFilter}
          hasActiveFilters={
            featuredFilter !== "all" ||
            publishedFilter !== "all" ||
            perPage !== 10 ||
            sort !== "sortOrder-asc"
          }
          isLoading={isLoading}
          onFeaturedChange={(value) => {
            setPage(1);
            setFeaturedFilter(value);
          }}
          onPerPageChange={(value) => {
            setPage(1);
            setPerPage(value);
          }}
          onPublishedChange={(value) => {
            setPage(1);
            setPublishedFilter(value);
          }}
          onRefresh={() => void loadClients()}
          onResetFilters={() => {
            setSearchInput("");
            setPage(1);
            setPerPage(10);
            setPublishedFilter("all");
            setFeaturedFilter("all");
            setSort("sortOrder-asc");
          }}
          onSearchChange={(value) => {
            setPage(1);
            setSearchInput(value);
          }}
          onSortChange={(value) => {
            setPage(1);
            setSort(value);
          }}
          perPage={perPage}
          publishedValue={publishedFilter}
          searchValue={searchInput}
          sortValue={sort}
        />

        <PanelClientsTable
          footer={(
            <PanelPagination
              currentPage={page}
              onPageChange={setPage}
              totalPages={totalPages}
            />
          )}
          isLoading={isLoading}
          items={items}
          onDelete={setClientToDelete}
          onEdit={handleOpenDrawer}
          onToggleFeatured={handleToggleFeatured}
          onTogglePublished={handleTogglePublished}
        />
      </div>

      <PanelClientsDrawer
        activeTab={drawerActiveTab}
        client={selectedClient}
        isLoading={isDrawerLoading}
        isSaving={isSaving}
        mode={drawerMode ?? "edit"}
        onActiveTabChange={setDrawerActiveTab}
        onChange={handleDraftFieldChange}
        onClose={handleCloseDrawer}
        onLogoChange={(file) => {
          setSelectedClient((current) => {
            if (!current) {
              return current;
            }

            return {
              ...current,
              logoFile: file,
              logoUrl: file ? current.logoUrl : null,
            };
          });
        }}
        onSave={() => void handleSaveClient()}
        open={drawerMode !== null}
      />

      <ConfirmDialog
        confirmLabel={isDeleting ? "Excluindo..." : "Excluir cliente"}
        description={
          clientToDelete
            ? `Essa ação remove o cliente ${clientToDelete.name} da área administrativa.`
            : ""
        }
        isLoading={isDeleting}
        onClose={() => setClientToDelete(null)}
        onConfirm={() => void handleDeleteClient()}
        open={Boolean(clientToDelete)}
        title="Confirmar exclusão"
      />
    </>
  );
}

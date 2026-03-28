import { MessageSquarePlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { PanelPageHeader } from "../../components/painel/PanelPageHeader";
import { PanelPagination } from "../../components/painel/PanelPagination";
import {
  PanelTestimonialsDrawer,
  type PanelTestimonialDraft,
  type PanelTestimonialsDrawerMode,
  type PanelTestimonialsDrawerTab,
} from "../../components/painel/PanelTestimonialsDrawer";
import { PanelTestimonialsFiltersBar } from "../../components/painel/PanelTestimonialsFiltersBar";
import { PanelTestimonialsTable } from "../../components/painel/PanelTestimonialsTable";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { usePanelAuth } from "../../context/painel/PanelAuthContext";
import { useToast } from "../../context/shared/ToastContext";
import { useDebouncedValue } from "../../hooks/painel/useDebouncedValue";
import {
  createPanelTestimonial,
  deletePanelTestimonial,
  getPanelTestimonialById,
  listPanelTestimonials,
  setPanelTestimonialFeatured,
  setPanelTestimonialPublished,
  type PanelTestimonialDetailRecord,
  type PanelTestimonialSort,
  type PanelTestimonialSummaryRecord,
  updatePanelTestimonial,
} from "../../services/painel/testimonials-api";

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

function createTestimonialDraft(detail: PanelTestimonialDetailRecord): PanelTestimonialDraft {
  return {
    authorName: detail.authorName,
    authorRole: detail.authorRole,
    brand: detail.brand,
    createdAt: detail.createdAt,
    deletedAt: detail.deletedAt,
    featured: detail.featured,
    highlightLabel: detail.highlightLabel ?? "",
    highlightValue: detail.highlightValue ?? "",
    id: detail.id,
    isPublished: detail.isPublished,
    message: detail.message,
    publishedAt: formatDateTimeLocal(detail.publishedAt),
    rating: detail.rating,
    sortOrder: detail.sortOrder,
    updatedAt: detail.updatedAt,
  };
}

function createEmptyTestimonialDraft(): PanelTestimonialDraft {
  return {
    authorName: "",
    authorRole: "",
    brand: "",
    createdAt: null,
    deletedAt: null,
    featured: false,
    highlightLabel: "",
    highlightValue: "",
    id: "",
    isPublished: false,
    message: "",
    publishedAt: "",
    rating: 5,
    sortOrder: 0,
    updatedAt: null,
  };
}

function getDrawerTabFromErrorMessage(message: string): PanelTestimonialsDrawerTab {
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
    normalizedMessage.includes("mensagem") ||
    normalizedMessage.includes("depoimento") ||
    normalizedMessage.includes("highlight")
  ) {
    return "content";
  }

  return "main";
}

export default function TestimonialsPage() {
  const toast = useToast();
  const { token } = usePanelAuth();

  const [items, setItems] = useState<PanelTestimonialSummaryRecord[]>([]);
  const [drawerActiveTab, setDrawerActiveTab] = useState<PanelTestimonialsDrawerTab>("main");
  const [drawerMode, setDrawerMode] = useState<PanelTestimonialsDrawerMode | null>(null);
  const [selectedTestimonialId, setSelectedTestimonialId] = useState<string | null>(null);
  const [selectedTestimonial, setSelectedTestimonial] = useState<PanelTestimonialDraft | null>(null);
  const [testimonialToDelete, setTestimonialToDelete] = useState<PanelTestimonialSummaryRecord | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [publishedFilter, setPublishedFilter] = useState<"all" | "published" | "draft">("all");
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "featured" | "regular">("all");
  const [sort, setSort] = useState<PanelTestimonialSort>("sortOrder-asc");
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebouncedValue(searchInput, 350);

  const loadTestimonials = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await listPanelTestimonials(token, {
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
          : "Nao foi possivel carregar os depoimentos.";

      setItems([]);
      setTotalPages(1);
      toast.error({
        title: "Falha ao carregar depoimentos",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, featuredFilter, page, perPage, publishedFilter, sort, toast, token]);

  useEffect(() => {
    void loadTestimonials();
  }, [loadTestimonials]);

  useEffect(() => {
    if (!selectedTestimonialId || !token || drawerMode !== "edit") {
      return;
    }

    let isMounted = true;
    setIsDrawerLoading(true);

    void (async () => {
      try {
        const detail = await getPanelTestimonialById(token, selectedTestimonialId);

        if (!isMounted) {
          return;
        }

        setSelectedTestimonial(createTestimonialDraft(detail));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        toast.error({
          title: "Nao foi possivel abrir o depoimento",
          description:
            error instanceof Error
              ? error.message
              : "O painel nao conseguiu carregar os detalhes desse depoimento.",
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
  }, [drawerMode, selectedTestimonialId, toast, token]);

  const handleCloseDrawer = useCallback(() => {
    setDrawerActiveTab("main");
    setDrawerMode(null);
    setSelectedTestimonialId(null);
    setSelectedTestimonial(null);
    setIsDrawerLoading(false);
  }, []);

  const handleOpenDrawer = useCallback((item: PanelTestimonialSummaryRecord) => {
    setDrawerActiveTab("main");
    setDrawerMode("edit");
    setSelectedTestimonialId(item.id);
    setIsDrawerLoading(false);
    setSelectedTestimonial({
      ...createEmptyTestimonialDraft(),
      authorName: item.authorName,
      authorRole: item.authorRole,
      brand: item.brand,
      featured: item.featured,
      highlightLabel: item.highlightLabel ?? "",
      highlightValue: item.highlightValue ?? "",
      id: item.id,
      isPublished: item.isPublished,
      message: item.message,
      publishedAt: formatDateTimeLocal(item.publishedAt),
      rating: item.rating,
      sortOrder: item.sortOrder,
    });
  }, []);

  const handleCreateTestimonial = useCallback(() => {
    setDrawerActiveTab("main");
    setDrawerMode("create");
    setSelectedTestimonialId(null);
    setIsDrawerLoading(false);
    setSelectedTestimonial(createEmptyTestimonialDraft());
  }, []);

  const handleDraftFieldChange = useCallback(
    (field: keyof PanelTestimonialDraft, value: string | boolean | number) => {
      setSelectedTestimonial((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          [field]: value,
        };
      });
    },
    [],
  );

  const handleSaveTestimonial = useCallback(async () => {
    if (!token || !selectedTestimonial || !drawerMode) {
      return;
    }

    if (
      !selectedTestimonial.brand.trim() ||
      !selectedTestimonial.authorName.trim() ||
      !selectedTestimonial.authorRole.trim()
    ) {
      setDrawerActiveTab("main");
      toast.error({
        title: "Campos obrigatorios",
        description: "Marca, autor e cargo precisam ser preenchidos.",
      });
      return;
    }

    if (!selectedTestimonial.message.trim()) {
      setDrawerActiveTab("content");
      toast.error({
        title: "Mensagem obrigatoria",
        description: "Preencha o depoimento antes de salvar.",
      });
      return;
    }

    if (selectedTestimonial.rating < 1 || selectedTestimonial.rating > 5) {
      setDrawerActiveTab("main");
      toast.error({
        title: "Nota invalida",
        description: "A nota precisa estar entre 1 e 5 estrelas.",
      });
      return;
    }

    setIsSaving(true);

    try {
      const input = {
        authorName: selectedTestimonial.authorName,
        authorRole: selectedTestimonial.authorRole,
        brand: selectedTestimonial.brand,
        featured: selectedTestimonial.featured,
        highlightLabel: selectedTestimonial.highlightLabel || null,
        highlightValue: selectedTestimonial.highlightValue || null,
        isPublished: selectedTestimonial.isPublished,
        message: selectedTestimonial.message,
        publishedAt: selectedTestimonial.publishedAt
          ? new Date(selectedTestimonial.publishedAt).toISOString()
          : null,
        rating: selectedTestimonial.rating,
        sortOrder: selectedTestimonial.sortOrder,
      };

      if (drawerMode === "create") {
        const created = await createPanelTestimonial(token, input);

        toast.success({
          title: "Depoimento criado",
          description: "O novo depoimento foi registrado com sucesso no painel.",
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
            void loadTestimonials();
          }
        } else {
          setItems((currentItems) => [created, ...currentItems].slice(0, perPage));
        }

        return;
      }

      const updated = await updatePanelTestimonial(token, selectedTestimonial.id, input);

      setSelectedTestimonial(createTestimonialDraft(updated));
      setItems((currentItems) =>
        currentItems.map((item) => (item.id === updated.id ? updated : item)),
      );

      toast.success({
        title: "Depoimento atualizado",
        description: "As alteracoes foram salvas com sucesso.",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Nao foi possivel concluir essa operacao agora.";

      setDrawerActiveTab(getDrawerTabFromErrorMessage(message));
      toast.error({
        title: drawerMode === "create" ? "Falha ao criar depoimento" : "Falha ao salvar depoimento",
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
    loadTestimonials,
    page,
    perPage,
    publishedFilter,
    selectedTestimonial,
    sort,
    toast,
    token,
  ]);

  const handleDeleteTestimonial = useCallback(async () => {
    if (!token || !testimonialToDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      await deletePanelTestimonial(token, testimonialToDelete.id);

      const deletedId = testimonialToDelete.id;
      const willEmptyPage = items.length === 1 && page > 1;

      setItems((currentItems) => currentItems.filter((item) => item.id !== deletedId));
      setTestimonialToDelete(null);

      if (selectedTestimonialId === deletedId) {
        handleCloseDrawer();
      }

      toast.success({
        title: "Depoimento excluido",
        description: "O depoimento foi removido com sucesso.",
      });

      if (willEmptyPage) {
        setPage((currentPage) => Math.max(1, currentPage - 1));
        return;
      }

      void loadTestimonials();
    } catch (error) {
      toast.error({
        title: "Falha ao excluir depoimento",
        description:
          error instanceof Error
            ? error.message
            : "Nao foi possivel excluir esse depoimento agora.",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [handleCloseDrawer, items.length, loadTestimonials, page, selectedTestimonialId, testimonialToDelete, toast, token]);

  const handleTogglePublished = useCallback(async (item: PanelTestimonialSummaryRecord) => {
    if (!token) {
      return;
    }

    try {
      const updated = await setPanelTestimonialPublished(token, item.id, !item.isPublished);
      setItems((currentItems) => currentItems.map((currentItem) => (currentItem.id === updated.id ? updated : currentItem)));
      if (selectedTestimonialId === updated.id && drawerMode === "edit") {
        setSelectedTestimonial(createTestimonialDraft(updated));
      }
      toast.success({
        title: updated.isPublished ? "Depoimento publicado" : "Depoimento movido para rascunho",
        description: `${updated.brand} foi atualizado com sucesso.`,
      });
    } catch (error) {
      toast.error({
        title: "Falha ao atualizar publicacao",
        description:
          error instanceof Error
            ? error.message
            : "Nao foi possivel atualizar esse depoimento.",
      });
    }
  }, [drawerMode, selectedTestimonialId, toast, token]);

  const handleToggleFeatured = useCallback(async (item: PanelTestimonialSummaryRecord) => {
    if (!token) {
      return;
    }

    try {
      const updated = await setPanelTestimonialFeatured(token, item.id, !item.featured);
      setItems((currentItems) => currentItems.map((currentItem) => (currentItem.id === updated.id ? updated : currentItem)));
      if (selectedTestimonialId === updated.id && drawerMode === "edit") {
        setSelectedTestimonial(createTestimonialDraft(updated));
      }
      toast.success({
        title: updated.featured ? "Depoimento em destaque" : "Destaque removido",
        description: `${updated.brand} foi atualizado com sucesso.`,
      });
    } catch (error) {
      toast.error({
        title: "Falha ao atualizar destaque",
        description:
          error instanceof Error
            ? error.message
            : "Nao foi possivel atualizar esse depoimento.",
      });
    }
  }, [drawerMode, selectedTestimonialId, toast, token]);

  return (
    <>
      <div className="space-y-6">
        <PanelPageHeader
          actions={(
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              onClick={handleCreateTestimonial}
              type="button"
            >
              <MessageSquarePlus className="h-4 w-4" />
              Adicionar depoimento
            </button>
          )}
          breadcrumbs={[
            { label: "Painel", to: "/painel/dashboard" },
            { label: "Depoimentos" },
          ]}
          description="Organize a prova social do site com controle de publicacao, destaque e ordem editorial."
          title="Depoimentos"
        />

        <PanelTestimonialsFiltersBar
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
          onRefresh={() => void loadTestimonials()}
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

        <PanelTestimonialsTable
          footer={(
            <PanelPagination
              currentPage={page}
              onPageChange={setPage}
              totalPages={totalPages}
            />
          )}
          isLoading={isLoading}
          items={items}
          onDelete={setTestimonialToDelete}
          onEdit={handleOpenDrawer}
          onToggleFeatured={handleToggleFeatured}
          onTogglePublished={handleTogglePublished}
        />
      </div>

      <PanelTestimonialsDrawer
        activeTab={drawerActiveTab}
        isLoading={isDrawerLoading}
        isSaving={isSaving}
        mode={drawerMode ?? "edit"}
        onActiveTabChange={setDrawerActiveTab}
        onChange={handleDraftFieldChange}
        onClose={handleCloseDrawer}
        onSave={() => void handleSaveTestimonial()}
        open={drawerMode !== null}
        testimonial={selectedTestimonial}
      />

      <ConfirmDialog
        confirmLabel={isDeleting ? "Excluindo..." : "Excluir depoimento"}
        description={
          testimonialToDelete
            ? `Essa acao remove o depoimento da marca ${testimonialToDelete.brand} da area administrativa.`
            : ""
        }
        isLoading={isDeleting}
        onClose={() => setTestimonialToDelete(null)}
        onConfirm={() => void handleDeleteTestimonial()}
        open={Boolean(testimonialToDelete)}
        title="Confirmar exclusao"
      />
    </>
  );
}

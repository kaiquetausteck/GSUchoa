import { ArrowLeft, ArrowUpRight, LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  PanelPaidMediaCampaignForm,
  type PanelPaidMediaCampaignDraft,
  type PanelPaidMediaCampaignFormErrors,
} from "../../components/painel/PanelPaidMediaCampaignForm";
import { PanelPageHeader } from "../../components/painel/PanelPageHeader";
import { usePanelAuth } from "../../context/painel/PanelAuthContext";
import { useToast } from "../../context/shared/ToastContext";
import { listPanelClients } from "../../services/painel/clients-api";
import { listPanelMetaAdAccounts } from "../../services/painel/meta-api";
import {
  createPanelPaidMediaCampaign,
  getPanelPaidMediaCampaignById,
  updatePanelPaidMediaCampaign,
  type PanelPaidMediaCampaignDetailRecord,
} from "../../services/painel/paid-media-api";

function createDraftFromDetail(detail?: PanelPaidMediaCampaignDetailRecord): PanelPaidMediaCampaignDraft {
  return {
    clientId: detail?.client?.id ?? "",
    endDate: detail?.endDate ? detail.endDate.slice(0, 10) : "",
    metaAdAccountId: detail?.metaAdAccount?.adAccountId ?? "",
    name: detail?.name ?? "",
    notes: detail?.notes ?? "",
    objective: detail?.objective ?? "",
    startDate: detail?.startDate ? detail.startDate.slice(0, 10) : "",
    status: detail?.status ?? "draft",
  };
}

function validateDraft(draft: PanelPaidMediaCampaignDraft) {
  const nextErrors: PanelPaidMediaCampaignFormErrors = {};

  if (draft.name.trim().length < 2) {
    nextErrors.name = "Informe um nome com pelo menos 2 caracteres.";
  }

  if (draft.startDate && draft.endDate && draft.startDate > draft.endDate) {
    nextErrors.endDate = "A data final precisa ser igual ou posterior à data inicial.";
  }

  return nextErrors;
}

export default function PaidMediaMetaCampaignFormPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { token } = usePanelAuth();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const [draft, setDraft] = useState<PanelPaidMediaCampaignDraft>(createDraftFromDetail());
  const [errors, setErrors] = useState<PanelPaidMediaCampaignFormErrors>({});
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [clientOptions, setClientOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [isClientsLoading, setIsClientsLoading] = useState(false);
  const [adAccountOptions, setAdAccountOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [isAccountsLoading, setIsAccountsLoading] = useState(false);
  const [campaignDetail, setCampaignDetail] = useState<PanelPaidMediaCampaignDetailRecord | null>(null);

  const pageTitle = isEditing ? "Editar campanha Meta" : "Nova campanha Meta";

  const loadSupportOptions = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsClientsLoading(true);
    setIsAccountsLoading(true);

    const [clientsResult, adAccountsResult] = await Promise.allSettled([
      listPanelClients(token, {
        featured: "all",
        page: 1,
        perPage: 100,
        published: "all",
        sort: "sortOrder-asc",
      }),
      listPanelMetaAdAccounts(token),
    ]);

    if (clientsResult.status === "fulfilled") {
      setClientOptions(
        clientsResult.value.items.map((item) => ({
          label: item.name,
          value: item.id,
        })),
      );
    } else {
      toast.error({
        title: "Clientes indisponíveis",
        description: clientsResult.reason instanceof Error
          ? clientsResult.reason.message
          : "Não foi possível carregar os clientes para o formulário.",
      });
    }

    if (adAccountsResult.status === "fulfilled") {
      setAdAccountOptions(
        adAccountsResult.value.map((item) => ({
          label: `${item.name} (${item.adAccountId})`,
          value: item.adAccountId,
        })),
      );
    }

    setIsClientsLoading(false);
    setIsAccountsLoading(false);
  }, [toast, token]);

  const loadCampaign = useCallback(async () => {
    if (!token || !id) {
      return;
    }

    setIsLoading(true);

    try {
      const detail = await getPanelPaidMediaCampaignById(token, id);
      setCampaignDetail(detail);
      setDraft(createDraftFromDetail(detail));
      if (detail.client) {
        setClientOptions((currentOptions) =>
          currentOptions.some((option) => option.value === detail.client?.id)
            ? currentOptions
            : [
              ...currentOptions,
              {
                label: detail.client.name,
                value: detail.client.id,
              },
            ],
        );
      }
      if (detail.metaAdAccount) {
        setAdAccountOptions((currentOptions) =>
          currentOptions.some((option) => option.value === detail.metaAdAccount?.adAccountId)
            ? currentOptions
            : [
              ...currentOptions,
              {
                label: `${detail.metaAdAccount.name} (${detail.metaAdAccount.adAccountId})`,
                value: detail.metaAdAccount.adAccountId,
              },
            ],
        );
      }
      setErrors({});
    } catch (error) {
      toast.error({
        title: "Falha ao carregar campanha",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível carregar essa campanha agora.",
      });
      navigate("/painel/trafego-pago/meta", { replace: true });
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, toast, token]);

  useEffect(() => {
    void loadSupportOptions();
  }, [loadSupportOptions]);

  useEffect(() => {
    if (isEditing) {
      void loadCampaign();
    }
  }, [isEditing, loadCampaign]);

  const linkedEntitiesSummary = useMemo(() => {
    if (!campaignDetail) {
      return "Nenhuma entidade Meta vinculada no momento.";
    }

    if (campaignDetail.links.length === 0) {
      return "Nenhuma entidade Meta vinculada no momento.";
    }

    return `${campaignDetail.links.length} entidade(s) Meta vinculada(s) atualmente.`;
  }, [campaignDetail]);

  const handleSubmit = useCallback(async () => {
    if (!token) {
      return;
    }

    const nextErrors = validateDraft(draft);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error({
        title: "Campos pendentes",
        description: "Revise os dados obrigatórios antes de continuar.",
      });
      return;
    }

    setIsSaving(true);

    try {
      if (isEditing && id) {
        await updatePanelPaidMediaCampaign(token, id, {
          clientId: draft.clientId.trim() ? draft.clientId : null,
          endDate: draft.endDate || null,
          metaAdAccountId: draft.metaAdAccountId.trim() ? draft.metaAdAccountId : null,
          name: draft.name.trim(),
          notes: draft.notes.trim() ? draft.notes.trim() : null,
          objective: draft.objective.trim() ? draft.objective.trim() : null,
          platform: "META",
          startDate: draft.startDate || null,
          status: draft.status,
        });

        toast.success({
          title: "Campanha atualizada",
          description: "As alterações da campanha Meta foram salvas com sucesso.",
        });
      } else {
        await createPanelPaidMediaCampaign(token, {
          clientId: draft.clientId.trim() || undefined,
          endDate: draft.endDate || undefined,
          metaAdAccountId: draft.metaAdAccountId.trim() || undefined,
          name: draft.name.trim(),
          notes: draft.notes.trim() || undefined,
          objective: draft.objective.trim() || undefined,
          platform: "META",
          startDate: draft.startDate || undefined,
          status: draft.status,
        });

        toast.success({
          title: "Campanha criada",
          description: "A nova campanha Meta foi criada e já pode receber acompanhamento.",
        });
      }

      navigate("/painel/trafego-pago/meta");
    } catch (error) {
      toast.error({
        title: isEditing ? "Falha ao salvar campanha" : "Falha ao criar campanha",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível concluir essa operação agora.",
      });
    } finally {
      setIsSaving(false);
    }
  }, [draft, id, isEditing, navigate, toast, token]);

  return (
    <div className="space-y-6">
      <PanelPageHeader
        actions={(
          <>
            {isEditing && id ? (
              <button
                className="panel-card-muted inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                onClick={() => navigate(`/painel/trafego-pago/meta/campanhas/${id}/dashboard`)}
                type="button"
              >
                Dashboard
                <ArrowUpRight className="h-4 w-4" />
              </button>
            ) : null}
            <button
              className="panel-card-muted inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
              onClick={() => navigate("/painel/trafego-pago/meta")}
              type="button"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
          </>
        )}
        breadcrumbs={[
          { label: "Painel", to: "/painel/dashboard" },
          { label: "Tráfego pago", to: "/painel/trafego-pago/meta" },
          { label: "Meta", to: "/painel/trafego-pago/meta" },
          { label: isEditing ? "Editar campanha" : "Nova campanha" },
        ]}
        description={
          isEditing
            ? linkedEntitiesSummary
            : "Cadastre uma nova campanha interna da Meta para centralizar objetivo, período e organização operacional."
        }
        title={pageTitle}
      />

      {isLoading ? (
        <section className="panel-card rounded-[2rem] border p-8">
          <div className="flex items-center gap-3 text-on-surface-variant">
            <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
            Carregando os dados da campanha...
          </div>
        </section>
      ) : (
        <PanelPaidMediaCampaignForm
          adAccountOptions={adAccountOptions}
          clientOptions={clientOptions}
          draft={draft}
          errors={errors}
          isAccountsLoading={isAccountsLoading}
          isClientsLoading={isClientsLoading}
          isSaving={isSaving}
          mode={isEditing ? "edit" : "create"}
          onCancel={() => navigate("/painel/trafego-pago/meta")}
          onChange={(nextDraft) => {
            setDraft(nextDraft);
            if (Object.keys(errors).length > 0) {
              setErrors(validateDraft(nextDraft));
            }
          }}
          onSubmit={() => void handleSubmit()}
        />
      )}
    </div>
  );
}

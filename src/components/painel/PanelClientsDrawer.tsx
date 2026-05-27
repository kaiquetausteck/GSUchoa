import {
  CalendarClock,
  FileText,
  Globe2,
  ImagePlus,
  LayoutTemplate,
  Megaphone,
  Plug,
  ShieldCheck,
  Upload,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { PanelClientAccessModule, PanelClientAccessPlatform, PanelClientStatus } from "../../services/painel/clients-api";
import type { PanelUserRecord } from "../../services/painel/users-api";
import { PanelFormSection } from "../shared/PanelFormSection";
import { ImageCropDialog } from "../shared/ImageCropDialog";
import { PanelDrawer } from "../shared/PanelDrawer";
import { AppInput } from "../shared/ui/AppInput";
import { AppCheckbox } from "../shared/ui/AppCheckbox";
import { AppSelect } from "../shared/ui/AppSelect";
import { AppTabs } from "../shared/ui/AppTabs";
import { AppTextarea } from "../shared/ui/AppTextarea";

export type PanelClientsDrawerMode = "create" | "edit";
export type PanelClientsDrawerTab = "main" | "content" | "integrations" | "permissions" | "meta";

export type PanelClientAccessResourceDraft = {
  module: PanelClientAccessModule;
  platform: PanelClientAccessPlatform;
  externalId: string;
  name: string;
  pictureUrl?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type PanelClientPermissionDraft = {
  userId: string;
  resources: PanelClientAccessResourceDraft[];
};

export type PanelClientDraft = {
  createdAt: string | null;
  deletedAt: string | null;
  description: string;
  featured: boolean;
  googleEnabled: boolean;
  id: string;
  isPublished: boolean;
  linkedinEnabled: boolean;
  logoFile: File | null;
  logoUrl: string | null;
  metaEnabled: boolean;
  name: string;
  paidMediaEnabled: boolean;
  permissions: PanelClientPermissionDraft[];
  resources: PanelClientAccessResourceDraft[];
  publishedAt: string;
  slug: string;
  sortOrder: number;
  socialMediaEnabled: boolean;
  status: PanelClientStatus;
  updatedAt: string | null;
  website: string;
};

type EditableClientField =
  | "description"
  | "featured"
  | "googleEnabled"
  | "isPublished"
  | "linkedinEnabled"
  | "metaEnabled"
  | "name"
  | "paidMediaEnabled"
  | "publishedAt"
  | "slug"
  | "sortOrder"
  | "socialMediaEnabled"
  | "status"
  | "website";

type PanelClientsDrawerProps = {
  activeTab: PanelClientsDrawerTab;
  availableUsers: PanelUserRecord[];
  accessResources: PanelClientAccessResourceDraft[];
  client: PanelClientDraft | null;
  isLoading: boolean;
  isSaving: boolean;
  isUsersLoading: boolean;
  mode: PanelClientsDrawerMode;
  onActiveTabChange: (tab: PanelClientsDrawerTab) => void;
  onChange: (field: EditableClientField, value: string | boolean | number) => void;
  onClose: () => void;
  onLogoChange: (file: File | null) => void;
  onIntegrationResourceToggle: (resource: PanelClientAccessResourceDraft, enabled: boolean) => void;
  onPermissionUserToggle: (userId: string, enabled: boolean) => void;
  onPermissionResourceToggle: (userId: string, resource: PanelClientAccessResourceDraft, enabled: boolean) => void;
  onSave: () => void;
  open: boolean;
};

function formatDate(value: string | null) {
  if (!value) {
    return "Sem registro";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Sem registro";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(parsedDate);
}

const CLIENT_STATUS_OPTIONS: Array<{ label: string; value: PanelClientStatus }> = [
  { label: "Ativo", value: "active" },
  { label: "Onboarding", value: "onboarding" },
  { label: "Pausado", value: "paused" },
  { label: "Inativo", value: "inactive" },
  { label: "Arquivado", value: "archived" },
];

export function PanelClientsDrawer({
  activeTab,
  accessResources,
  availableUsers,
  client,
  isLoading,
  isSaving,
  isUsersLoading,
  mode,
  onActiveTabChange,
  onChange,
  onClose,
  onIntegrationResourceToggle,
  onLogoChange,
  onPermissionResourceToggle,
  onPermissionUserToggle,
  onSave,
  open,
}: PanelClientsDrawerProps) {
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingCropFile, setPendingCropFile] = useState<File | null>(null);

  const logoPreviewUrl = useMemo(() => {
    if (!client?.logoFile) {
      return client?.logoUrl ?? null;
    }

    return URL.createObjectURL(client.logoFile);
  }, [client?.logoFile, client?.logoUrl]);

  useEffect(() => {
    if (!client?.logoFile || !logoPreviewUrl) {
      return;
    }

    return () => {
      URL.revokeObjectURL(logoPreviewUrl);
    };
  }, [client?.logoFile, logoPreviewUrl]);

  const title = mode === "create" ? "Adicionar cliente" : client?.name || "Editar cliente";
  const description =
    mode === "create"
      ? "Cadastre um novo cliente, defina operação, serviços e acesso da equipe."
      : "Atualize dados, operação, publicação e permissões desse cliente.";

  return (
    <>
      <PanelDrawer
        defaultWidth={900}
        description={description}
        footer={(
          <div className="flex items-center justify-end gap-3">
            <button
              className="panel-card-muted rounded-2xl border px-5 py-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
              onClick={onClose}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading || isSaving || !client}
              onClick={onSave}
              type="button"
            >
              {isSaving
                ? mode === "create"
                  ? "Criando..."
                  : "Salvando..."
                : mode === "create"
                  ? "Criar cliente"
                  : "Salvar alterações"}
            </button>
          </div>
        )}
        onClose={onClose}
        open={open}
        resizable
        title={title}
      >
        {isLoading || !client ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                className="panel-card-muted h-24 animate-pulse rounded-[1.5rem] border"
                key={index}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <AppTabs
              activeKey={activeTab}
              items={[
                {
                  key: "main",
                  label: "Dados principais",
                  icon: <FileText className="h-4 w-4" />,
                },
                {
                  key: "content",
                  label: "Conteúdo",
                  icon: <LayoutTemplate className="h-4 w-4" />,
                },
                {
                  key: "integrations",
                  label: "Integrações",
                  icon: <Plug className="h-4 w-4" />,
                },
                {
                  key: "permissions",
                  label: "Acessos",
                  icon: <UsersRound className="h-4 w-4" />,
                },
                {
                  key: "meta",
                  label: "Metadados",
                  icon: <CalendarClock className="h-4 w-4" />,
                },
              ]}
              onChange={(tab) => onActiveTabChange(tab as PanelClientsDrawerTab)}
            />

            {activeTab === "main" ? (
              <section className="space-y-6">
                <PanelFormSection
                  description="Envie o logo em imagem e recorte antes de salvar."
                  icon={<ImagePlus className="h-4 w-4" />}
                  title="Logo"
                >
                  <div className="mt-5 flex flex-col items-start gap-5">
                    <div className="partner-logo-card flex h-32 w-full items-center justify-center overflow-hidden rounded-[1.75rem] border px-6 py-5 sm:w-[18rem]">
                      {logoPreviewUrl ? (
                        <img
                          alt={client.name || "Logo do cliente"}
                          className="partner-logo-image max-h-16 w-full object-contain"
                          src={logoPreviewUrl}
                        />
                      ) : (
                        <div className="text-sm font-semibold text-on-surface-variant">
                          Sem logo
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm leading-relaxed text-on-surface-variant">
                        O logo será usado no carrossel, na listagem pública e na página do cliente.
                      </p>

                      <div className="flex flex-wrap gap-3">
                        <button
                          className="panel-card-muted inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                          onClick={() => logoInputRef.current?.click()}
                          type="button"
                        >
                          <Upload className="h-4 w-4" />
                          {client.logoFile || client.logoUrl ? "Trocar logo" : "Enviar logo"}
                        </button>
                        {client.logoFile || client.logoUrl ? (
                          <button
                            className="rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/12"
                            onClick={() => onLogoChange(null)}
                            type="button"
                          >
                            Remover logo
                          </button>
                        ) : null}
                      </div>

                      <input
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          if (file) {
                            setPendingCropFile(file);
                          }
                          event.currentTarget.value = "";
                        }}
                        ref={logoInputRef}
                        type="file"
                      />
                    </div>
                  </div>
                </PanelFormSection>

                <PanelFormSection
                  description="Esses dados estruturam o card e a rota pública do cliente."
                  icon={<FileText className="h-4 w-4" />}
                  title="Identificação"
                >
                  <div className="mt-5 grid gap-4">
                    <AppInput
                      label="Nome"
                      onChange={(event) => onChange("name", event.target.value)}
                      placeholder="Sound Black"
                      value={client.name}
                    />
                    <AppInput
                      label="Slug"
                      onChange={(event) => onChange("slug", event.target.value)}
                      placeholder="sound-black"
                      value={client.slug}
                    />
                    <AppInput
                      label="Site"
                      leadingIcon={<Globe2 className="h-4 w-4" />}
                      onChange={(event) => onChange("website", event.target.value)}
                      placeholder="https://soundblack.com.br"
                      value={client.website}
                    />
                    <AppSelect
                      label="Status operacional"
                      onChange={(event) => onChange("status", event.target.value)}
                      value={client.status}
                    >
                      {CLIENT_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </AppSelect>
                  </div>
                </PanelFormSection>
              </section>
            ) : null}

            {activeTab === "content" ? (
              <section className="space-y-6">
                <PanelFormSection
                  description="Texto usado na página pública do cliente e no contexto interno do painel."
                  icon={<LayoutTemplate className="h-4 w-4" />}
                  title="Descrição"
                >
                  <div className="mt-5">
                    <AppTextarea
                      label="Descrição"
                      onChange={(event) => onChange("description", event.target.value)}
                      placeholder="Marca parceira com foco em posicionamento e performance."
                      rows={7}
                      value={client.description}
                    />
                  </div>
                </PanelFormSection>
              </section>
            ) : null}

            {activeTab === "integrations" ? (
              <section className="space-y-6">
                <PanelFormSection
                  description="Vincule as páginas e contas que pertencem a esse cliente. Os relatórios e acessos usam somente esses vínculos."
                  icon={<Plug className="h-4 w-4" />}
                  title="Integrações do cliente"
                >
                  <div className="mt-5 grid gap-4 xl:grid-cols-2">
                    {[
                      {
                        title: "Tráfego pago",
                        groups: [
                          {
                            title: "Meta",
                            resources: accessResources.filter((resource) => resource.module === "paid_media" && resource.platform === "META"),
                          },
                          {
                            title: "Google",
                            resources: accessResources.filter((resource) => resource.module === "paid_media" && resource.platform === "GOOGLE"),
                          },
                        ],
                      },
                      {
                        title: "Social media",
                        groups: [
                          {
                            title: "Meta",
                            resources: accessResources.filter((resource) => resource.module === "social_media" && resource.platform === "META"),
                          },
                          {
                            title: "LinkedIn",
                            resources: accessResources.filter((resource) => resource.module === "social_media" && resource.platform === "LINKEDIN"),
                          },
                        ],
                      },
                    ].map((column) => (
                      <div className="rounded-[1.5rem] border border-outline-variant/12 bg-surface-container-low/45 p-4" key={column.title}>
                        <h4 className="text-sm font-black text-on-surface">{column.title}</h4>
                        <div className="mt-4 space-y-5">
                          {column.groups.map((group) => (
                            <div className="space-y-2" key={`${column.title}-${group.title}`}>
                              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{group.title}</p>
                              {group.resources.length === 0 ? (
                                <p className="rounded-2xl border border-dashed border-outline-variant/14 px-3 py-3 text-xs text-on-surface-variant">
                                  Nenhuma conta disponível.
                                </p>
                              ) : (
                                group.resources.map((resource) => {
                                  const checked = client.resources.some((item) =>
                                    item.module === resource.module &&
                                    item.platform === resource.platform &&
                                    item.externalId === resource.externalId,
                                  );

                                  return (
                                    <AppCheckbox
                                      checked={checked}
                                      className="flex rounded-2xl border border-outline-variant/14 px-3 py-2.5 text-sm text-on-surface transition-colors hover:border-primary/25"
                                      key={`${resource.module}-${resource.platform}-${resource.externalId}`}
                                      label={(
                                        <span className="flex min-w-0 items-center gap-3">
                                          {resource.pictureUrl ? (
                                            <img
                                              alt={resource.name}
                                              className="h-8 w-8 flex-none rounded-xl object-cover"
                                              src={resource.pictureUrl}
                                            />
                                          ) : (
                                            <span className="flex h-8 w-8 flex-none items-center justify-center rounded-xl bg-primary/10 text-xs font-black text-primary">
                                              {resource.name.slice(0, 2).toUpperCase()}
                                            </span>
                                          )}
                                          <span className="min-w-0">
                                            <span className="block truncate font-semibold">{resource.name}</span>
                                            <span className="block truncate text-xs text-on-surface-variant">{resource.externalId}</span>
                                          </span>
                                        </span>
                                      )}
                                      onChange={(event) => onIntegrationResourceToggle(resource, event.target.checked)}
                                    />
                                  );
                                })
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </PanelFormSection>
              </section>
            ) : null}

            {activeTab === "permissions" ? (
              <section className="space-y-6">
                <PanelFormSection
                  description="Selecione o funcionário e marque as páginas ou contas que ele pode acessar."
                  icon={<ShieldCheck className="h-4 w-4" />}
                  title="Acessos por funcionário"
                >
                  <div className="mt-5 space-y-3">
                    {isUsersLoading ? (
                      Array.from({ length: 4 }).map((_, index) => (
                        <div
                          className="panel-card-muted h-24 animate-pulse rounded-[1.5rem] border"
                          key={index}
                        />
                      ))
                    ) : availableUsers.length === 0 ? (
                      <div className="panel-card-muted rounded-[1.5rem] border border-dashed p-5 text-sm text-on-surface-variant">
                        Nenhum funcionário ativo encontrado para vincular.
                      </div>
                    ) : (
                      availableUsers.map((user) => {
                        const permission = client.permissions.find((item) => item.userId === user.id);
                        const enabled = Boolean(permission);
                        const paidMetaResources = client.resources.filter((resource) => resource.module === "paid_media" && resource.platform === "META");
                        const paidGoogleResources = client.resources.filter((resource) => resource.module === "paid_media" && resource.platform === "GOOGLE");
                        const socialMetaResources = client.resources.filter((resource) => resource.module === "social_media" && resource.platform === "META");
                        const socialLinkedinResources = client.resources.filter((resource) => resource.module === "social_media" && resource.platform === "LINKEDIN");

                        const renderResourceGroup = (title: string, resources: PanelClientAccessResourceDraft[]) => (
                          <div className="space-y-2">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{title}</p>
                            {resources.length === 0 ? (
                              <p className="rounded-2xl border border-dashed border-outline-variant/14 px-3 py-3 text-xs text-on-surface-variant">
                                Nenhuma conta disponível.
                              </p>
                            ) : (
                              resources.map((resource) => {
                                const checked = Boolean(permission?.resources.some((item) =>
                                  item.module === resource.module &&
                                  item.platform === resource.platform &&
                                  item.externalId === resource.externalId,
                                ));

                                return (
                                  <AppCheckbox
                                    checked={checked}
                                    className="flex rounded-2xl border border-outline-variant/14 px-3 py-2.5 text-sm text-on-surface transition-colors hover:border-primary/25"
                                    key={`${resource.module}-${resource.platform}-${resource.externalId}`}
                                    label={(
                                      <span className="flex min-w-0 items-center gap-3">
                                        {resource.pictureUrl ? (
                                          <img
                                            alt={resource.name}
                                            className="h-8 w-8 flex-none rounded-xl object-cover"
                                            src={resource.pictureUrl}
                                          />
                                        ) : (
                                          <span className="flex h-8 w-8 flex-none items-center justify-center rounded-xl bg-primary/10 text-xs font-black text-primary">
                                            {resource.name.slice(0, 2).toUpperCase()}
                                          </span>
                                        )}
                                        <span className="min-w-0">
                                          <span className="block truncate font-semibold">{resource.name}</span>
                                          <span className="block truncate text-xs text-on-surface-variant">{resource.externalId}</span>
                                        </span>
                                      </span>
                                    )}
                                    onChange={(event) =>
                                      onPermissionResourceToggle(user.id, resource, event.target.checked)}
                                  />
                                );
                              })
                            )}
                          </div>
                        );

                        return (
                          <div
                            className="panel-card-muted rounded-[1.5rem] border p-4"
                            key={user.id}
                          >
                            <div className="space-y-4">
                              <AppCheckbox
                                checked={enabled}
                                className="w-full"
                                label={(
                                  <span className="min-w-0">
                                    <span className="block truncate text-sm font-semibold text-on-surface">{user.name}</span>
                                    <span className="block truncate text-xs text-on-surface-variant">{user.email}</span>
                                  </span>
                                )}
                                onChange={(event) =>
                                  onPermissionUserToggle(user.id, event.target.checked)}
                              />

                              {enabled && permission ? (
                                <div className="grid gap-4 xl:grid-cols-2">
                                  <div className="rounded-[1.5rem] border border-outline-variant/12 bg-surface-container-low/45 p-4">
                                    <h4 className="text-sm font-black text-on-surface">Tráfego pago</h4>
                                    <div className="mt-4 space-y-4">
                                      {renderResourceGroup("Meta", paidMetaResources)}
                                      {renderResourceGroup("Google", paidGoogleResources)}
                                    </div>
                                  </div>
                                  <div className="rounded-[1.5rem] border border-outline-variant/12 bg-surface-container-low/45 p-4">
                                    <h4 className="text-sm font-black text-on-surface">Social media</h4>
                                    <div className="mt-4 space-y-4">
                                      {renderResourceGroup("Meta", socialMetaResources)}
                                      {renderResourceGroup("LinkedIn", socialLinkedinResources)}
                                    </div>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </PanelFormSection>
              </section>
            ) : null}

            {activeTab === "meta" ? (
              <section className="space-y-6">
                <PanelFormSection
                  description="Controles de exibição no site público, ordem e destaque."
                  icon={<Megaphone className="h-4 w-4" />}
                  title="Site e cases"
                >
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <AppSelect
                      label="Status"
                      onChange={(event) => onChange("isPublished", event.target.value === "published")}
                      value={client.isPublished ? "published" : "draft"}
                    >
                      <option value="draft">Rascunho</option>
                      <option value="published">Publicado</option>
                    </AppSelect>
                    <AppSelect
                      label="Destaque"
                      onChange={(event) => onChange("featured", event.target.value === "featured")}
                      value={client.featured ? "featured" : "regular"}
                    >
                      <option value="regular">Sem destaque</option>
                      <option value="featured">Em destaque</option>
                    </AppSelect>
                    <AppInput
                      label="Ordem"
                      min={0}
                      onChange={(event) => onChange("sortOrder", Number(event.target.value))}
                      type="number"
                      value={String(client.sortOrder)}
                    />
                    <AppInput
                      label="Publicado em"
                      onChange={(event) => onChange("publishedAt", event.target.value)}
                      type="datetime-local"
                      value={client.publishedAt}
                    />
                  </div>
                </PanelFormSection>

                <PanelFormSection
                  description="Referências retornadas pela API para auditoria interna."
                  icon={<FileText className="h-4 w-4" />}
                  title="Registro"
                >
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="panel-card-muted rounded-[1.5rem] border p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                        Criado em
                      </p>
                      <p className="mt-2 text-sm font-medium text-on-surface">{formatDate(client.createdAt)}</p>
                    </div>
                    <div className="panel-card-muted rounded-[1.5rem] border p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                        Atualizado em
                      </p>
                      <p className="mt-2 text-sm font-medium text-on-surface">{formatDate(client.updatedAt)}</p>
                    </div>
                    <div className="panel-card-muted rounded-[1.5rem] border p-4 md:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                        Removido em
                      </p>
                      <p className="mt-2 text-sm font-medium text-on-surface">{formatDate(client.deletedAt)}</p>
                    </div>
                  </div>
                </PanelFormSection>
              </section>
            ) : null}
          </div>
        )}
      </PanelDrawer>

      <ImageCropDialog
        onClose={() => setPendingCropFile(null)}
        onConfirm={(file) => {
          onLogoChange(file);
          setPendingCropFile(null);
        }}
        open={Boolean(pendingCropFile)}
        sourceFile={pendingCropFile}
        title="Recortar logo"
      />
    </>
  );
}

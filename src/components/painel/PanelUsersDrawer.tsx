import { Camera, FileText, ImagePlus, Shield, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { PanelFormSection } from "../shared/PanelFormSection";
import { ImageCropDialog } from "../shared/ImageCropDialog";
import { PanelDrawer } from "../shared/PanelDrawer";
import { AppInput } from "../shared/ui/AppInput";
import { AppPasswordField } from "../shared/ui/AppPasswordField";
import { AppTabs } from "../shared/ui/AppTabs";

export type PanelUsersDrawerMode = "create" | "edit";
export type PanelUsersDrawerTab = "main" | "meta" | "password";

export type PanelUserDraft = {
  avatarFile: File | null;
  avatarUrl: string | null;
  createdAt: string | null;
  email: string;
  id: string;
  isActive: boolean;
  name: string;
  password: string;
  passwordConfirmation: string;
  updatedAt: string | null;
};

type EditableUserField = "email" | "name" | "password" | "passwordConfirmation";

type PanelUsersDrawerProps = {
  activeTab: PanelUsersDrawerTab;
  isLoading: boolean;
  isSaving: boolean;
  mode: PanelUsersDrawerMode;
  onActiveTabChange: (tab: PanelUsersDrawerTab) => void;
  onAvatarChange: (file: File | null) => void;
  onChange: (field: EditableUserField, value: string) => void;
  onClose: () => void;
  onSave: () => void;
  open: boolean;
  user: PanelUserDraft | null;
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

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function PanelUsersDrawer({
  activeTab,
  isLoading,
  isSaving,
  mode,
  onActiveTabChange,
  onAvatarChange,
  onChange,
  onClose,
  onSave,
  open,
  user,
}: PanelUsersDrawerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingCropFile, setPendingCropFile] = useState<File | null>(null);
  const previewUrl = useMemo(() => {
    if (!user?.avatarFile) {
      return user?.avatarUrl ?? null;
    }

    return URL.createObjectURL(user.avatarFile);
  }, [user?.avatarFile, user?.avatarUrl]);

  useEffect(() => {
    if (!user?.avatarFile || !previewUrl) {
      return;
    }

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl, user?.avatarFile]);

  const title = mode === "create" ? "Adicionar usuário" : user?.name || "Editar usuário";
  const description =
    mode === "create"
      ? "Crie um novo acesso administrativo e deixe o perfil pronto para o painel."
      : "Atualize os dados principais, a senha e os metadados em um fluxo único.";

  return (
    <>
      <PanelDrawer
        defaultWidth={940}
        description={description}
        footer={
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
              disabled={isLoading || isSaving || !user}
              onClick={onSave}
              type="button"
            >
              {isSaving
                ? mode === "create"
                  ? "Criando..."
                  : "Salvando..."
                : mode === "create"
                  ? "Criar usuário"
                  : "Salvar alterações"}
            </button>
          </div>
        }
        onClose={onClose}
        open={open}
        resizable
        title={title}
      >
        {isLoading || !user ? (
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
                  key: "password",
                  label: "Senha",
                  icon: <Shield className="h-4 w-4" />,
                },
                {
                  key: "meta",
                  label: "Metadados",
                  icon: <ImagePlus className="h-4 w-4" />,
                },
              ]}
              onChange={(tab) => onActiveTabChange(tab as PanelUsersDrawerTab)}
            />

            {activeTab === "main" ? (
              <section className="space-y-6">
                <PanelFormSection
                  description="Envie uma imagem quadrada e recorte antes de salvar."
                  icon={<ImagePlus className="h-4 w-4" />}
                  title="Foto"
                >
                  <div className="mt-5 flex flex-col items-start gap-5">
                    <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-[1.75rem] bg-surface-container-high">
                      {previewUrl ? (
                        <img
                          alt={user.name || "Usuário"}
                          className="h-full w-full object-cover"
                          src={previewUrl}
                        />
                      ) : (
                        <span className="text-3xl font-black text-primary">
                          {getInitials(user.name || "Usuário")}
                        </span>
                      )}

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-10 items-center justify-center bg-black/30 text-white">
                        <Camera className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm leading-relaxed text-on-surface-variant">
                        Envie uma imagem quadrada ou recorte aqui antes de salvar o perfil.
                      </p>

                      <div className="flex flex-wrap gap-3">
                        <button
                          className="panel-card-muted inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                          onClick={() => fileInputRef.current?.click()}
                          type="button"
                        >
                          <Upload className="h-4 w-4" />
                          {user.avatarFile || user.avatarUrl ? "Trocar foto" : "Enviar foto"}
                        </button>

                        {user.avatarFile ? (
                          <button
                            className="rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/12"
                            onClick={() => onAvatarChange(null)}
                            type="button"
                          >
                            Remover nova foto
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
                        ref={fileInputRef}
                        type="file"
                      />
                    </div>
                  </div>
                </PanelFormSection>

                <PanelFormSection
                  description="Ajuste os dados principais exibidos no painel."
                  icon={<FileText className="h-4 w-4" />}
                  title="Dados principais"
                >
                  <div className="grid gap-4">
                    <AppInput
                      label="Nome"
                      onChange={(event) => onChange("name", event.target.value)}
                      placeholder="Nome completo"
                      value={user.name}
                    />

                    <AppInput
                      label="E-mail"
                      onChange={(event) => onChange("email", event.target.value)}
                      placeholder="usuario@empresa.com"
                      type="email"
                      value={user.email}
                    />
                  </div>
                </PanelFormSection>
              </section>
            ) : null}

            {activeTab === "password" ? (
              <PanelFormSection
                description="Troque a senha de acesso mantendo a confirmação no mesmo fluxo."
                icon={<Shield className="h-4 w-4" />}
                title="Senha"
              >
                <div className="mt-5 grid gap-4">
                  <AppPasswordField
                    label={mode === "create" ? "Senha inicial" : "Nova senha"}
                    onChange={(event) => onChange("password", event.target.value)}
                    placeholder={mode === "create" ? "Defina uma senha" : "Deixe em branco para manter"}
                    value={user.password}
                  />

                  <AppPasswordField
                    label="Confirmar senha"
                    onChange={(event) => onChange("passwordConfirmation", event.target.value)}
                    placeholder="Repita a senha"
                    value={user.passwordConfirmation}
                  />
                </div>
              </PanelFormSection>
            ) : null}

            {activeTab === "meta" ? (
              <section className="space-y-4">
                <div className="panel-card rounded-[1.5rem] border p-5">
                  <p className="text-xs font-semibold text-on-surface">Identificador</p>
                  <p className="mt-3 break-all text-sm leading-relaxed text-on-surface-variant">
                    {mode === "create" ? "Será gerado após salvar." : user.id}
                  </p>
                </div>

                <div className="panel-card rounded-[1.5rem] border p-5">
                  <p className="text-xs font-semibold text-on-surface">Criado em</p>
                  <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                    {mode === "create" ? "Será registrado após a criação." : formatDate(user.createdAt)}
                  </p>
                </div>

                <div className="panel-card rounded-[1.5rem] border p-5">
                  <p className="text-xs font-semibold text-on-surface">Atualizado em</p>
                  <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                    {mode === "create" ? "Ainda sem alterações." : formatDate(user.updatedAt)}
                  </p>
                </div>
              </section>
            ) : null}
          </div>
        )}
      </PanelDrawer>

      <ImageCropDialog
        onClose={() => setPendingCropFile(null)}
        onConfirm={(file) => {
          onAvatarChange(file);
          setPendingCropFile(null);
        }}
        open={Boolean(pendingCropFile)}
        sourceFile={pendingCropFile}
      />
    </>
  );
}

import { Plus, RefreshCcw, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PanelPageHeader } from "../../components/painel/PanelPageHeader";
import { AppCheckbox } from "../../components/shared/ui/AppCheckbox";
import { AppInput } from "../../components/shared/ui/AppInput";
import { PANEL_NAV_GROUPS, PANEL_NAV_PRIMARY_ITEMS } from "../../config/painel/navigation";
import { usePanelAuth } from "../../context/painel/PanelAuthContext";
import { useToast } from "../../context/shared/ToastContext";
import {
  createPanelRole,
  deletePanelRole,
  listPanelRoles,
  type PanelRoleRecord,
  updatePanelRole,
} from "../../services/painel/panel-roles-api";

const PANEL_PERMISSION_GROUPS = [
  {
    key: "primary",
    label: "Principal",
    items: PANEL_NAV_PRIMARY_ITEMS,
  },
  ...PANEL_NAV_GROUPS,
];

export default function PanelRolesPage() {
  const { token } = usePanelAuth();
  const toast = useToast();
  const [items, setItems] = useState<PanelRoleRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", pageKeys: [] as string[] });
  const [isLoading, setIsLoading] = useState(false);
  const selectedRole = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  const loadRoles = async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    try {
      const roles = await listPanelRoles(token);
      setItems(roles);
      if (!selectedId && roles[0]) {
        setSelectedId(roles[0].id);
        setDraft({ name: roles[0].name, pageKeys: roles[0].pageKeys });
      }
    } catch (error) {
      toast.error({
        title: "Falha ao carregar cargos",
        description: error instanceof Error ? error.message : "Não foi possível carregar cargos.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const selectRole = (role: PanelRoleRecord) => {
    setSelectedId(role.id);
    setDraft({ name: role.name, pageKeys: role.pageKeys });
  };

  const togglePage = (pageKey: string, checked: boolean) => {
    setDraft((current) => ({
      ...current,
      pageKeys: checked
        ? Array.from(new Set([...current.pageKeys.filter((key) => key !== "*"), pageKey]))
        : current.pageKeys.filter((key) => key !== pageKey),
    }));
  };

  const saveRole = async () => {
    if (!token || !draft.name.trim()) {
      return;
    }

    try {
      const saved = selectedRole
        ? await updatePanelRole(token, selectedRole.id, draft)
        : await createPanelRole(token, draft);
      setItems((current) =>
        current.some((item) => item.id === saved.id)
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...current],
      );
      setSelectedId(saved.id);
      toast.success({ title: "Cargo salvo", description: "As permissões do painel foram atualizadas." });
    } catch (error) {
      toast.error({
        title: "Falha ao salvar cargo",
        description: error instanceof Error ? error.message : "Não foi possível salvar o cargo.",
      });
    }
  };

  const removeRole = async () => {
    if (!token || !selectedRole) {
      return;
    }

    try {
      await deletePanelRole(token, selectedRole.id);
      setItems((current) => current.filter((item) => item.id !== selectedRole.id));
      setSelectedId(null);
      setDraft({ name: "", pageKeys: [] });
      toast.success({ title: "Cargo excluído", description: "O cargo foi removido." });
    } catch (error) {
      toast.error({
        title: "Falha ao excluir cargo",
        description: error instanceof Error ? error.message : "Não foi possível excluir o cargo.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <PanelPageHeader
        actions={(
          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white"
            onClick={() => {
              setSelectedId(null);
              setDraft({ name: "", pageKeys: [] });
            }}
            type="button"
          >
            <Plus className="h-4 w-4" />
            Novo cargo
          </button>
        )}
        breadcrumbs={[
          { label: "Painel", to: "/painel/dashboard" },
          { label: "Cargos" },
        ]}
        description="Cadastre cargos e defina quais páginas do painel cada cargo pode visualizar."
        title="Cargos e permissões"
      />

      <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <section className="panel-card rounded-[1.75rem] border p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-black text-on-surface">Cargos</p>
            <button className="text-on-surface-variant hover:text-primary" onClick={() => void loadRoles()} type="button">
              <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
          <div className="space-y-2">
            {items.map((role) => (
              <button
                className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
                  selectedId === role.id
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-outline-variant/12 text-on-surface hover:border-primary/25"
                }`}
                key={role.id}
                onClick={() => selectRole(role)}
                type="button"
              >
                <span className="block font-semibold">{role.name}</span>
                <span className="mt-1 block text-xs text-on-surface-variant">
                  {role.pageKeys.includes("*") ? "Todas as páginas" : `${role.pageKeys.length} página(s)`}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel-card rounded-[1.75rem] border p-5 md:p-6">
          <div className="grid gap-4">
            <AppInput
              label="Nome"
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              placeholder="Atendimento"
              value={draft.name}
            />
          </div>

          <div className="mt-6">
            <p className="text-sm font-black text-on-surface">Páginas permitidas</p>
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              {PANEL_PERMISSION_GROUPS.map((group) => (
                <section className="rounded-3xl border border-outline-variant/16 bg-surface-container/45 p-4" key={group.key}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[0.68rem] font-black uppercase text-primary">{group.label}</p>
                      <p className="mt-1 text-xs font-medium text-on-surface-variant">
                        {group.items.length} {group.items.length === 1 ? "página" : "páginas"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    {group.items.map((item) => (
                      <AppCheckbox
                        checked={draft.pageKeys.includes("*") || draft.pageKeys.includes(item.key)}
                        className="panel-card-muted inline-flex min-h-12 items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold text-on-surface"
                        disabled={draft.pageKeys.includes("*")}
                        key={item.key}
                        label={
                          <span className="min-w-0">
                            <span className="block truncate">{item.label}</span>
                            <span className="mt-0.5 block truncate text-xs font-medium text-on-surface-variant">
                              {group.label}
                            </span>
                          </span>
                        }
                        onChange={(event) => togglePage(item.key, event.target.checked)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            {selectedRole && !selectedRole.isSystem ? (
              <button
                className="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm font-semibold text-red-500"
                onClick={() => void removeRole()}
                type="button"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </button>
            ) : null}
            <button
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white"
              onClick={() => void saveRole()}
              type="button"
            >
              <Save className="h-4 w-4" />
              Salvar cargo
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

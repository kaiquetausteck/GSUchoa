import type { ReactNode } from "react";

import type { PanelUserRecord } from "../../services/painel/users-api";
import { PanelUserAvatar } from "./PanelUserAvatar";
import { PanelUsersActionMenu } from "./PanelUsersActionMenu";

type PanelUsersTableProps = {
  footer?: ReactNode;
  isLoading: boolean;
  items: PanelUserRecord[];
  onDelete: (user: PanelUserRecord) => void;
  onEdit: (user: PanelUserRecord) => void;
};

function getStatusBadgeClasses(status: PanelUserRecord["status"]) {
  if (status === "active") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-500";
  }

  return "border-red-500/20 bg-red-500/10 text-red-500";
}

function formatDate(value: string | null) {
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

export function PanelUsersTable({
  footer,
  isLoading,
  items,
  onDelete,
  onEdit,
}: PanelUsersTableProps) {
  if (isLoading) {
    return (
      <div className="panel-card overflow-hidden rounded-[1.75rem] border">
        <div className="space-y-3 p-4 md:p-5">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              className="panel-card-muted h-16 animate-pulse rounded-2xl border"
              key={index}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="panel-card rounded-[1.75rem] border border-dashed px-6 py-12 text-center">
        <p className="text-sm font-semibold text-on-surface">Nenhum usuario encontrado</p>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          Ajuste os filtros ou tente novamente com outra busca.
        </p>
      </div>
    );
  }

  return (
    <div className="panel-card overflow-hidden rounded-[1.75rem] border">
      <div className="overflow-x-auto overflow-y-visible">
        <table className="min-w-full text-left text-sm">
          <thead className="panel-card-muted border-b border-outline-variant/12">
            <tr className="text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">
              <th className="px-6 py-4 font-semibold">Usuario</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Criado em</th>
              <th className="px-6 py-4 font-semibold">Atualizado em</th>
              <th className="px-6 py-4 text-right font-semibold">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {items.map((user) => (
              <tr
                className="border-b border-outline-variant/10 transition-colors hover:bg-surface-container-low/55 last:border-b-0"
                key={user.id}
              >
                <td className="min-w-[19rem] px-6 py-5">
                  <div className="flex items-center gap-3">
                    <PanelUserAvatar
                      avatarUrl={user.avatarUrl}
                      className="h-12 w-12 text-sm"
                      name={user.name}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-on-surface">{user.name}</p>
                      <p className="mt-1 truncate text-xs text-on-surface-variant">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusBadgeClasses(
                      user.status,
                    )}`}
                  >
                    {user.status === "active" ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-6 py-5 text-on-surface-variant">{formatDate(user.createdAt)}</td>
                <td className="px-6 py-5 text-on-surface-variant">{formatDate(user.updatedAt)}</td>
                <td className="px-6 py-5 text-right">
                  <PanelUsersActionMenu
                    onDelete={() => onDelete(user)}
                    onEdit={() => onEdit(user)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {footer ? (
        <div className="panel-card-muted border-t border-outline-variant/10 px-4 py-4 md:px-6">
          {footer}
        </div>
      ) : null}
    </div>
  );
}

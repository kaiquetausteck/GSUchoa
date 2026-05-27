import { UsersRound } from "lucide-react";

import type { PanelResourceAccessUserRecord } from "../../services/painel/resource-access";

type PanelResourceAccessUsersProps = {
  users: PanelResourceAccessUserRecord[];
};

export function PanelResourceAccessUsers({ users }: PanelResourceAccessUsersProps) {
  if (users.length === 0) {
    return (
      <span className="inline-flex rounded-full border border-outline-variant/16 bg-surface-container-low px-3 py-1 text-xs font-semibold text-on-surface-variant">
        Sem funcionário vinculado
      </span>
    );
  }

  const visibleUsers = users.slice(0, 3);
  const remainingCount = users.length - visibleUsers.length;

  return (
    <div className="flex max-w-[18rem] flex-wrap gap-2">
      {visibleUsers.map((user) => (
        <span
          className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/16 bg-primary/8 px-2.5 py-1 text-xs font-semibold text-on-surface"
          key={`${user.id}-${user.clientId}`}
          title={`${user.name} • ${user.clientName}`}
        >
          {user.avatarUrl ? (
            <img alt="" className="h-5 w-5 rounded-full object-cover" src={user.avatarUrl} />
          ) : (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/14 text-[9px] font-black text-primary">
              {user.name.slice(0, 2).toUpperCase()}
            </span>
          )}
          <span className="truncate">{user.name}</span>
        </span>
      ))}
      {remainingCount > 0 ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-outline-variant/16 bg-surface-container-low px-2.5 py-1 text-xs font-semibold text-on-surface-variant">
          <UsersRound className="h-3.5 w-3.5" />
          +{remainingCount}
        </span>
      ) : null}
    </div>
  );
}

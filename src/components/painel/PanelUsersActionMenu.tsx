import { Ellipsis, PencilLine, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

import { FloatingPortal } from "../shared/FloatingPortal";

type PanelUsersActionMenuProps = {
  onDelete: () => void;
  onEdit: () => void;
};

export function PanelUsersActionMenu({
  onDelete,
  onEdit,
}: PanelUsersActionMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className="inline-flex">
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Abrir ações do usuário"
        className="panel-card-muted inline-flex h-10 w-10 items-center justify-center rounded-xl border text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
        onClick={() => setOpen((current) => !current)}
        ref={triggerRef}
        type="button"
      >
        <Ellipsis className="h-4 w-4" />
      </button>

      <FloatingPortal
        align="end"
        anchorElement={triggerRef.current}
        offset={10}
        onClose={() => setOpen(false)}
        open={open}
        width={192}
      >
        <div className="panel-popover rounded-[1.25rem] border p-2">
          <button
            className="flex w-full items-center gap-3 rounded-[1rem] px-3 py-3 text-left text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-high"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            type="button"
          >
            <PencilLine className="h-4 w-4 text-primary" />
            Editar
          </button>
          <button
            className="flex w-full items-center gap-3 rounded-[1rem] px-3 py-3 text-left text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            type="button"
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </button>
        </div>
      </FloatingPortal>
    </div>
  );
}

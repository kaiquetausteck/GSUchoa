import { AnimatePresence, motion } from "motion/react";

type ConfirmDialogProps = {
  cancelLabel?: string;
  confirmLabel?: string;
  description: string;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
};

export function ConfirmDialog({
  cancelLabel = "Cancelar",
  confirmLabel = "Confirmar",
  description,
  isLoading = false,
  onClose,
  onConfirm,
  open,
  title,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            animate={{ opacity: 1 }}
            aria-label="Fechar confirmação"
            className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-[2px]"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onClose}
            type="button"
          />

          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="panel-popover fixed left-1/2 top-1/2 z-[90] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border p-6"
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-primary">
              Confirmação
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-on-surface">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{description}</p>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                className="panel-card-muted rounded-2xl border px-5 py-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                onClick={onClose}
                type="button"
              >
                {cancelLabel}
              </button>
              <button
                className="rounded-2xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isLoading}
                onClick={onConfirm}
                type="button"
              >
                {isLoading ? "Processando..." : confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

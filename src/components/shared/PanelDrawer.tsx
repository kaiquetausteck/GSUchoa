import { GripVertical, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  useEffect,
  useMemo,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

type PanelDrawerProps = {
  children: ReactNode;
  defaultWidth?: number;
  description?: string;
  footer?: ReactNode;
  maxWidth?: number;
  minWidth?: number;
  onClose: () => void;
  open: boolean;
  resizable?: boolean;
  title: string;
};

const DRAWER_EASE = [0.22, 1, 0.36, 1] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function PanelDrawer({
  children,
  defaultWidth = 920,
  description,
  footer,
  maxWidth = 1180,
  minWidth = 620,
  onClose,
  open,
  resizable = true,
  title,
}: PanelDrawerProps) {
  const [drawerWidth, setDrawerWidth] = useState(defaultWidth);

  const viewportMaxWidth = useMemo(() => {
    if (typeof window === "undefined") {
      return maxWidth;
    }

    return Math.min(maxWidth, window.innerWidth - 16);
  }, [maxWidth]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setDrawerWidth((currentWidth) =>
      clamp(currentWidth || defaultWidth, minWidth, viewportMaxWidth),
    );
  }, [defaultWidth, minWidth, open, viewportMaxWidth]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleResize = () => {
      setDrawerWidth((currentWidth) => clamp(currentWidth, minWidth, Math.min(maxWidth, window.innerWidth - 16)));
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [maxWidth, minWidth, open]);

  const handleResizeStart = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!resizable) {
      return;
    }

    event.preventDefault();

    const startX = event.clientX;
    const startWidth = drawerWidth;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const delta = startX - moveEvent.clientX;
      const nextWidth = clamp(
        startWidth + delta,
        minWidth,
        Math.min(maxWidth, window.innerWidth - 16),
      );

      setDrawerWidth(nextWidth);
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            animate={{ opacity: 1 }}
            aria-label="Fechar painel lateral"
            className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px]"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onClose}
            type="button"
          />

          <motion.aside
            animate={{ opacity: 1, x: 0 }}
            className="panel-popover fixed inset-y-0 right-0 z-50 flex max-w-[calc(100vw-1rem)] flex-col border-l"
            exit={{ opacity: 1, x: "100%" }}
            initial={{ opacity: 1, x: "100%" }}
            style={{ width: `${drawerWidth}px` }}
            transition={{ duration: 0.28, ease: DRAWER_EASE }}
          >
            {resizable ? (
              <button
                aria-label="Redimensionar painel lateral"
                className="group absolute inset-y-0 left-0 hidden w-4 -translate-x-1/2 cursor-ew-resize items-center justify-center lg:flex"
                onPointerDown={handleResizeStart}
                type="button"
              >
                <span className="panel-card-muted flex h-12 w-6 items-center justify-center rounded-full border text-on-surface-variant transition-colors group-hover:border-primary/30 group-hover:text-primary">
                  <GripVertical className="h-4 w-4" />
                </span>
              </button>
            ) : null}

            <div className="flex items-start justify-between gap-4 border-b border-outline-variant/10 px-6 py-5">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-on-surface">{title}</h2>
                {description ? (
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-on-surface-variant">
                    {description}
                  </p>
                ) : null}
              </div>

              <button
                aria-label="Fechar painel lateral"
                className="panel-card-muted flex h-11 w-11 items-center justify-center rounded-2xl border text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary"
                onClick={onClose}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>

            {footer ? (
              <div className="border-t border-outline-variant/10 px-6 py-5">{footer}</div>
            ) : null}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

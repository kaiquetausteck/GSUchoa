import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { LogoIconAnimated } from "../../components/shared/LogoIconAnimated";

type ToastTone = "success" | "error" | "info";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastOptions = {
  title: string;
  description?: string;
  duration?: number;
};

type ToastContextValue = {
  success: (options: ToastOptions) => void;
  error: (options: ToastOptions) => void;
  info: (options: ToastOptions) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function getToastIcon(tone: ToastTone) {
  if (tone === "success") {
    return CheckCircle2;
  }

  if (tone === "error") {
    return CircleAlert;
  }

  return Info;
}

function getToastToneBadgeClasses(tone: ToastTone) {
  if (tone === "success") {
    return "border-emerald-500/20 bg-emerald-500/12 text-emerald-500";
  }

  if (tone === "error") {
    return "border-red-500/20 bg-red-500/12 text-red-500";
  }

  return "border-primary/20 bg-primary/10 text-primary";
}

export function ToastProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutRefs = useRef<Record<string, number>>({});

  const dismiss = useCallback((id: string) => {
    const timeoutId = timeoutRefs.current[id];
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      delete timeoutRefs.current[id];
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((tone: ToastTone, options: ToastOptions) => {
    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    setToasts((current) => [
      ...current,
      {
        id,
        tone,
        title: options.title,
        description: options.description,
      },
    ]);

    timeoutRefs.current[id] = window.setTimeout(() => {
      dismiss(id);
    }, options.duration ?? 4200);
  }, [dismiss]);

  const contextValue = useMemo<ToastContextValue>(
    () => ({
      success: (options) => pushToast("success", options),
      error: (options) => pushToast("error", options),
      info: (options) => pushToast("info", options),
      dismiss,
    }),
    [dismiss, pushToast],
  );

  return (
    <ToastContext.Provider
      value={contextValue}
    >
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[120] flex w-full max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const Icon = getToastIcon(toast.tone);

            return (
              <motion.div
                animate={{ opacity: 1, x: 0, y: 0 }}
                className="pointer-events-auto rounded-[1.5rem] border border-outline-variant/14 bg-surface-container-low/95 px-4 py-4 text-on-surface shadow-[0_24px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl"
                exit={{ opacity: 0, x: 24, y: -8 }}
                initial={{ opacity: 0, x: 24, y: -8 }}
                key={toast.id}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-11 w-11 flex-none items-center justify-center rounded-2xl border border-outline-variant/14 bg-surface">
                    <LogoIconAnimated
                      animated
                      className="logo-icon-theme h-6 w-auto"
                      decorative
                      delay={0.04}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-on-surface">{toast.title}</p>
                      <div
                        className={`flex h-8 w-8 flex-none items-center justify-center rounded-xl border ${getToastToneBadgeClasses(
                          toast.tone,
                        )}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                    {toast.description ? (
                      <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
                        {toast.description}
                      </p>
                    ) : null}
                  </div>

                  <button
                    aria-label="Fechar aviso"
                    className="flex h-9 w-9 flex-none items-center justify-center rounded-xl border border-outline-variant/15 bg-surface text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary"
                    onClick={() => dismiss(toast.id)}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return context;
}

import {
  Minus,
  PlayCircle,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { createPortal } from "react-dom";

import type { PublicPortfolioMedia } from "../../services/site/portfolio-api";

type CaseMediaDialogProps = {
  media: PublicPortfolioMedia | null;
  onClose: () => void;
  open: boolean;
};

type DragState = {
  originX: number;
  originY: number;
  startX: number;
  startY: number;
};

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const SCALE_STEP = 0.4;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function CaseMediaDialog({
  media,
  onClose,
  open,
}: CaseMediaDialogProps) {
  const [scale, setScale] = useState(MIN_SCALE);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const dragStateRef = useRef<DragState | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setScale(MIN_SCALE);
    setTranslateX(0);
    setTranslateY(0);
  }, [media, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  const canDrag = scale > MIN_SCALE && media?.type === "image";
  const isImage = media?.type === "image";
  const imageStyle = useMemo(
    () => ({
      transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
      cursor: canDrag ? "grab" : "zoom-in",
      transition: dragStateRef.current ? "none" : "transform 0.18s ease",
    }),
    [canDrag, scale, translateX, translateY],
  );

  const updateScale = (nextScale: number) => {
    const normalizedScale = clamp(nextScale, MIN_SCALE, MAX_SCALE);

    setScale(normalizedScale);

    if (normalizedScale === MIN_SCALE) {
      setTranslateX(0);
      setTranslateY(0);
    }
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (media?.type !== "image") {
      return;
    }

    event.preventDefault();
    updateScale(scale + (event.deltaY < 0 ? SCALE_STEP : -SCALE_STEP));
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLImageElement>) => {
    if (!canDrag) {
      return;
    }

    dragStateRef.current = {
      originX: translateX,
      originY: translateY,
      startX: event.clientX,
      startY: event.clientY,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLImageElement>) => {
    if (!dragStateRef.current || !canDrag) {
      return;
    }

    const deltaX = event.clientX - dragStateRef.current.startX;
    const deltaY = event.clientY - dragStateRef.current.startY;

    setTranslateX(dragStateRef.current.originX + deltaX);
    setTranslateY(dragStateRef.current.originY + deltaY);
  };

  const clearDragState = (event?: ReactPointerEvent<HTMLImageElement>) => {
    if (event?.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragStateRef.current = null;
  };

  if (!open || !media || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[180] bg-black/82"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
      >
        <motion.button
          aria-label="Fechar preview"
          className="absolute inset-0"
          onClick={onClose}
          type="button"
        />

        <motion.div
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute inset-0 flex items-center justify-center p-4 md:p-8"
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className={`relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-black/45 shadow-[0_30px_80px_rgba(0,0,0,0.4)] ${
              isImage ? "max-w-5xl" : "max-w-4xl"
            }`}
          >
            <div className="flex items-start justify-between gap-4 px-4 pb-4 pt-4 md:px-6 md:pb-5 md:pt-5">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
                  {isImage ? "Prévia da imagem" : "Prévia do vídeo"}
                </p>
                <h2 className="mt-2 truncate text-lg font-bold text-white md:text-2xl">
                  {media.alt}
                </h2>
                {media.caption ? (
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/70">
                    {media.caption}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                {isImage ? (
                  <>
                    <button
                      aria-label="Reduzir zoom"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-white transition-colors hover:border-primary/40 hover:bg-white/12"
                      onClick={() => updateScale(scale - SCALE_STEP)}
                      type="button"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <button
                      aria-label="Restaurar zoom"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-white transition-colors hover:border-primary/40 hover:bg-white/12"
                      onClick={() => {
                        setScale(MIN_SCALE);
                        setTranslateX(0);
                        setTranslateY(0);
                      }}
                      type="button"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <button
                      aria-label="Ampliar zoom"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-white transition-colors hover:border-primary/40 hover:bg-white/12"
                      onClick={() => updateScale(scale + SCALE_STEP)}
                      type="button"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </>
                ) : null}

                <button
                  aria-label="Fechar preview"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-white transition-colors hover:border-primary/40 hover:bg-white/12"
                  onClick={onClose}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="px-4 pb-4 md:px-6 md:pb-6">
              <div className="flex items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/50">
                {isImage ? (
                  <div
                    className="flex h-[min(62vh,720px)] w-full items-center justify-center overflow-hidden"
                    onWheel={handleWheel}
                  >
                    <img
                      alt={media.alt}
                      className="max-h-full max-w-full touch-none select-none object-contain"
                      draggable={false}
                      onPointerCancel={clearDragState}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={clearDragState}
                      src={media.src}
                      style={imageStyle}
                    />
                  </div>
                ) : (
                  <div className="w-full overflow-hidden rounded-[1.5rem]">
                    <video
                      autoPlay
                      className="max-h-[62vh] w-full bg-black object-contain"
                      controls
                      playsInline
                      poster={media.poster ?? undefined}
                      src={media.src}
                    >
                      Seu navegador não suporta a reprodução deste vídeo.
                    </video>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center px-4 pb-4 md:px-6 md:pb-6">
              {isImage ? (
                <div className="pointer-events-none rounded-full border border-white/10 bg-black/55 px-4 py-2 text-xs font-medium text-white/72">
                  Use o scroll para dar zoom e arraste para navegar
                </div>
              ) : (
                <div className="pointer-events-none flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-4 py-2 text-xs font-medium text-white/72">
                  <PlayCircle className="h-4 w-4 text-primary" />
                  Vídeo do case
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

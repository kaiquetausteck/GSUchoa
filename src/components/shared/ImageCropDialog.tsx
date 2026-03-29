import { ZoomIn } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Position = {
  x: number;
  y: number;
};

type ImageCropDialogProps = {
  confirmLabel?: string;
  description?: string;
  onClose: () => void;
  onConfirm: (file: File) => void;
  open: boolean;
  outputSize?: number;
  sourceFile: File | null;
  title?: string;
};

const CROPPER_SIZE = 320;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatFileName(name: string) {
  const lastDotIndex = name.lastIndexOf(".");

  if (lastDotIndex <= 0) {
    return `${name}-crop.png`;
  }

  return `${name.slice(0, lastDotIndex)}-crop.png`;
}

export function ImageCropDialog({
  confirmLabel = "Aplicar recorte",
  description = "Posicione a imagem dentro da área de recorte e ajuste o zoom antes de salvar.",
  onClose,
  onConfirm,
  open,
  outputSize = 1024,
  sourceFile,
  title = "Recortar imagem",
}: ImageCropDialogProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState({ width: 1, height: 1 });
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!open || !sourceFile) {
      setImageUrl(null);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      return;
    }

    const nextImageUrl = URL.createObjectURL(sourceFile);
    setImageUrl(nextImageUrl);
    setZoom(1);
    setPosition({ x: 0, y: 0 });

    return () => {
      URL.revokeObjectURL(nextImageUrl);
    };
  }, [open, sourceFile]);

  const baseScale = useMemo(() => {
    return Math.max(CROPPER_SIZE / naturalSize.width, CROPPER_SIZE / naturalSize.height);
  }, [naturalSize.height, naturalSize.width]);

  const renderedSize = useMemo(() => {
    const scale = baseScale * zoom;

    return {
      width: naturalSize.width * scale,
      height: naturalSize.height * scale,
    };
  }, [baseScale, naturalSize.height, naturalSize.width, zoom]);

  const clampPosition = (nextPosition: Position): Position => {
    const maxOffsetX = Math.max(0, (renderedSize.width - CROPPER_SIZE) / 2);
    const maxOffsetY = Math.max(0, (renderedSize.height - CROPPER_SIZE) / 2);

    return {
      x: clamp(nextPosition.x, -maxOffsetX, maxOffsetX),
      y: clamp(nextPosition.y, -maxOffsetY, maxOffsetY),
    };
  };

  useEffect(() => {
    setPosition((current) => clampPosition(current));
  }, [renderedSize.height, renderedSize.width]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    });
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragStart) {
      return;
    }

    const nextPosition = clampPosition({
      x: event.clientX - dragStart.x,
      y: event.clientY - dragStart.y,
    });

    setPosition(nextPosition);
  };

  const finishDrag = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const handleConfirm = async () => {
    if (!sourceFile || !imageRef.current) {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = outputSize;
    canvas.height = outputSize;

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const ratio = outputSize / CROPPER_SIZE;
    const drawWidth = renderedSize.width * ratio;
    const drawHeight = renderedSize.height * ratio;
    const drawX = (CROPPER_SIZE / 2 - renderedSize.width / 2 + position.x) * ratio;
    const drawY = (CROPPER_SIZE / 2 - renderedSize.height / 2 + position.y) * ratio;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, outputSize, outputSize);
    context.drawImage(imageRef.current, drawX, drawY, drawWidth, drawHeight);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, sourceFile.type || "image/png", 0.92);
    });

    if (!blob) {
      return;
    }

    const croppedFile = new File([blob], formatFileName(sourceFile.name), {
      type: blob.type || sourceFile.type || "image/png",
    });

    onConfirm(croppedFile);
  };

  return (
    <AnimatePresence>
      {open && sourceFile && imageUrl ? (
        <>
          <motion.button
            animate={{ opacity: 1 }}
            aria-label="Fechar recorte"
            className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-[3px]"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onClose}
            type="button"
          />

          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="panel-popover fixed left-1/2 top-1/2 z-[110] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border p-6 md:p-7"
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.32em] text-primary">
                  Recorte
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-on-surface">
                  {title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
                  {description}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-5">
              <div
                className="panel-card-muted relative mx-auto h-[320px] w-[320px] overflow-hidden rounded-[2rem] border"
                onPointerCancel={finishDrag}
                onPointerDown={handlePointerDown}
                onPointerLeave={finishDrag}
                onPointerMove={handlePointerMove}
                onPointerUp={finishDrag}
              >
                <div className="pointer-events-none absolute inset-0 rounded-[2rem] border border-white/20" />
                <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_999px_rgba(0,0,0,0.16)]" />

                <img
                  alt="Imagem para recorte"
                  className={`${isDragging ? "cursor-grabbing" : "cursor-grab"} absolute left-1/2 top-1/2 max-w-none select-none`}
                  draggable={false}
                  onLoad={(event) => {
                    setNaturalSize({
                      width: event.currentTarget.naturalWidth || 1,
                      height: event.currentTarget.naturalHeight || 1,
                    });
                  }}
                  ref={imageRef}
                  src={imageUrl}
                  style={{
                    width: `${renderedSize.width}px`,
                    height: `${renderedSize.height}px`,
                    transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                  }}
                />
              </div>

              <div className="panel-card-muted rounded-[1.5rem] border p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-on-surface">
                    <ZoomIn className="h-4 w-4 text-primary" />
                    Zoom
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
                <input
                  className="mt-4 w-full accent-[var(--color-primary)]"
                  max="2.6"
                  min="1"
                  onChange={(event) => {
                    setZoom(Number(event.target.value));
                  }}
                  step="0.01"
                  type="range"
                  value={zoom}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                className="panel-card-muted rounded-2xl border px-5 py-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                onClick={onClose}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                onClick={() => void handleConfirm()}
                type="button"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

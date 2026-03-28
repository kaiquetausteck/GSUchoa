import { createPortal } from "react-dom";
import {
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";

type FloatingPortalProps = {
  align?: "start" | "end";
  anchorElement: HTMLElement | null;
  children: ReactNode;
  offset?: number;
  onClose: () => void;
  open: boolean;
  width?: number;
};

type Position = {
  left: number;
  top: number;
};

function getPosition(
  anchorElement: HTMLElement,
  width: number,
  align: "start" | "end",
  offset: number,
): Position {
  const rect = anchorElement.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const estimatedHeight = 180;

  let left = align === "end" ? rect.right - width : rect.left;
  left = Math.max(12, Math.min(left, viewportWidth - width - 12));

  const fitsBelow = rect.bottom + offset + estimatedHeight <= viewportHeight - 12;
  const top = fitsBelow
    ? rect.bottom + offset
    : Math.max(12, rect.top - estimatedHeight - offset);

  return { left, top };
}

export function FloatingPortal({
  align = "end",
  anchorElement,
  children,
  offset = 8,
  onClose,
  open,
  width = 176,
}: FloatingPortalProps) {
  const [position, setPosition] = useState<Position | null>(null);

  useLayoutEffect(() => {
    if (!open || !anchorElement) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      setPosition(getPosition(anchorElement, width, align, offset));
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [align, anchorElement, offset, open, width]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (anchorElement?.contains(target)) {
        return;
      }

      const portalRoot = document.getElementById("floating-portal-root");
      if (portalRoot?.contains(target)) {
        return;
      }

      onClose();
    };

    window.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, [anchorElement, onClose, open]);

  if (!open || !position || typeof document === "undefined") {
    return null;
  }

  let portalRoot = document.getElementById("floating-portal-root");

  if (!portalRoot) {
    portalRoot = document.createElement("div");
    portalRoot.id = "floating-portal-root";
    document.body.appendChild(portalRoot);
  }

  return createPortal(
    <div
      className="fixed z-[120]"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
        width: `${width}px`,
      }}
    >
      {children}
    </div>,
    portalRoot,
  );
}

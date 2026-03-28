import type { ReactNode } from "react";

import {
  getSiteSectionRouteById,
  type SectionId,
} from "../../hooks/site/useSectionAnchors";

export function SectionLink({
  sectionId,
  onNavigate,
  className,
  children,
  onClick,
}: {
  sectionId: SectionId;
  onNavigate: (sectionId: SectionId) => void;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  const route = getSiteSectionRouteById(sectionId);

  return (
    <a
      className={className}
      href={route.href}
      onClick={(event) => {
        event.preventDefault();
        onClick?.();
        onNavigate(sectionId);
      }}
    >
      {children}
    </a>
  );
}

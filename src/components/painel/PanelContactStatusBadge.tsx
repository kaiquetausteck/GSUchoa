import { getPanelContactStatusBadgeClassName, getPanelContactStatusLabel } from "../../config/painel/contact-status";
import type { PanelContactStatus } from "../../services/painel/contact-api";

type PanelContactStatusBadgeProps = {
  status: PanelContactStatus;
};

export function PanelContactStatusBadge({ status }: PanelContactStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getPanelContactStatusBadgeClassName(
        status,
      )}`}
    >
      {getPanelContactStatusLabel(status)}
    </span>
  );
}

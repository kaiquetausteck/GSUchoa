import type {
  PanelContactDetailRecord,
  PanelContactFunnelRecord,
  PanelContactSummaryRecord,
} from "../../services/painel/contact-api";

export function formatPanelContactDateTime(value: string | null) {
  if (!value) {
    return "Sem registro";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Sem registro";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsedDate);
}

export function buildPanelContactWhatsAppHref(whatsapp: string) {
  const digits = whatsapp.replace(/\D/g, "");

  return digits ? `https://wa.me/55${digits.length <= 11 ? digits : digits.slice(-11)}` : "#";
}

export function getPanelContactMessagePreview(message: string | null, maxLength = 120) {
  if (!message?.trim()) {
    return "Mensagem em processamento. Abra os detalhes para visualizar o conteúdo completo.";
  }

  if (message.length <= maxLength) {
    return message;
  }

  return `${message.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export function createPanelContactFunnelRecord(
  contact: PanelContactSummaryRecord | PanelContactDetailRecord,
): PanelContactFunnelRecord {
  return {
    id: contact.id,
    fullName: contact.fullName,
    email: contact.email,
    whatsapp: contact.whatsapp,
    status: contact.status,
    source: contact.source,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
    message: "message" in contact ? contact.message : null,
    notes: "notes" in contact ? contact.notes : null,
    statusUpdatedAt: "statusUpdatedAt" in contact ? contact.statusUpdatedAt : null,
  };
}

export function mergePanelContactDetailIntoFunnelRecord(
  items: PanelContactFunnelRecord[],
  detail: PanelContactDetailRecord,
) {
  const nextRecord = createPanelContactFunnelRecord(detail);
  const existingIndex = items.findIndex((item) => item.id === detail.id);

  if (existingIndex === -1) {
    return sortPanelContactsByCreatedAtDesc([...items, nextRecord]);
  }

  const nextItems = [...items];
  nextItems[existingIndex] = {
    ...nextItems[existingIndex],
    ...nextRecord,
  };

  return sortPanelContactsByCreatedAtDesc(nextItems);
}

export function sortPanelContactsByCreatedAtDesc<
  Item extends {
    createdAt: string;
  },
>(items: Item[]) {
  return [...items].sort((firstItem, secondItem) => {
    const firstDate = new Date(firstItem.createdAt).getTime();
    const secondDate = new Date(secondItem.createdAt).getTime();

    return secondDate - firstDate;
  });
}

export function getPanelContactSearchValue(contact: {
  fullName: string;
  email: string;
  whatsapp: string;
  source?: string | null;
}) {
  return `${contact.fullName} ${contact.email} ${contact.whatsapp} ${contact.source ?? ""}`.toLowerCase();
}

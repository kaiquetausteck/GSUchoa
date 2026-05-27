export type PanelResourceAccessUserRecord = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  isActive: boolean;
  clientId: string;
  clientName: string;
};

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getFirstString(values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function getFirstBoolean(values: unknown[]) {
  for (const value of values) {
    if (typeof value === "boolean") {
      return value;
    }
  }

  return null;
}

export function normalizePanelResourceAccessUsers(value: unknown): PanelResourceAccessUserRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const id = getFirstString([item.id]);
      const name = getFirstString([item.name]);
      const email = getFirstString([item.email]);
      const clientId = getFirstString([item.clientId]);
      const clientName = getFirstString([item.clientName]);

      if (!id || !name || !email || !clientId || !clientName) {
        return null;
      }

      return {
        id,
        name,
        email,
        avatarUrl: getFirstString([item.avatarUrl]),
        isActive: getFirstBoolean([item.isActive]) ?? true,
        clientId,
        clientName,
      };
    })
    .filter((item): item is PanelResourceAccessUserRecord => item !== null);
}

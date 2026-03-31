export const PANEL_TOKEN_STORAGE_KEY = "@token";
export const PANEL_LOGIN_DRAFT_STORAGE_KEY = "@panel-login-draft";

export function getPanelToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(PANEL_TOKEN_STORAGE_KEY);
}

export function setPanelToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PANEL_TOKEN_STORAGE_KEY, token);
}

export function clearPanelToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PANEL_TOKEN_STORAGE_KEY);
}

export type PanelLoginDraft = {
  email: string;
  password: string;
};

export function getPanelLoginDraft(): PanelLoginDraft {
  if (typeof window === "undefined") {
    return { email: "", password: "" };
  }

  const draft = window.localStorage.getItem(PANEL_LOGIN_DRAFT_STORAGE_KEY);
  if (!draft) {
    return { email: "", password: "" };
  }

  try {
    const parsedDraft = JSON.parse(draft) as Partial<PanelLoginDraft>;

    return {
      email: parsedDraft.email ?? "",
      password: "",
    };
  } catch {
    return { email: "", password: "" };
  }
}

export function setPanelLoginDraft(draft: PanelLoginDraft) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    PANEL_LOGIN_DRAFT_STORAGE_KEY,
    JSON.stringify({
      email: draft.email,
    }),
  );
}

export function clearPanelLoginDraft() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PANEL_LOGIN_DRAFT_STORAGE_KEY);
}

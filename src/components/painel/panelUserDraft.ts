import type {
  PanelUserDraft,
  PanelUsersDrawerTab,
} from "./PanelUsersDrawer";
import type { PanelUserRecord } from "../../services/painel/users-api";

export function createPanelUserDraft(user: PanelUserRecord): PanelUserDraft {
  return {
    avatarFile: null,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    email: user.email,
    id: user.id,
    isActive: user.isActive,
    name: user.name,
    password: "",
    passwordConfirmation: "",
    updatedAt: user.updatedAt,
  };
}

export function createEmptyPanelUserDraft(): PanelUserDraft {
  return {
    avatarFile: null,
    avatarUrl: null,
    createdAt: null,
    email: "",
    id: "",
    isActive: true,
    name: "",
    password: "",
    passwordConfirmation: "",
    updatedAt: null,
  };
}

export function getPanelUserDrawerTabFromErrorMessage(message: string): PanelUsersDrawerTab {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("senha") ||
    normalizedMessage.includes("password")
  ) {
    return "password";
  }

  if (
    normalizedMessage.includes("email") ||
    normalizedMessage.includes("e-mail") ||
    normalizedMessage.includes("nome") ||
    normalizedMessage.includes("name") ||
    normalizedMessage.includes("avatar") ||
    normalizedMessage.includes("foto")
  ) {
    return "main";
  }

  return "main";
}

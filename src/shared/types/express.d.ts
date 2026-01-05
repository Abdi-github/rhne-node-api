import type { SupportedLanguage } from "./i18n.types";

declare global {
  namespace Express {
    interface Request {
      lang: SupportedLanguage;
      userId?: string;
      userRoles?: string[];
      userPermissions?: string[];
    }
  }
}

export {};

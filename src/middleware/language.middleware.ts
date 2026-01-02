import type { Request, Response, NextFunction } from "express";
import type { SupportedLanguage } from "@shared/types/i18n.types";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "@shared/types/i18n.types";

export const languageMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // 1. Check query param ?lang=
  const queryLang = req.query.lang as string | undefined;
  if (queryLang && SUPPORTED_LANGUAGES.includes(queryLang as SupportedLanguage)) {
    req.lang = queryLang as SupportedLanguage;
    next();
    return;
  }

  // 2. Check Accept-Language header
  const acceptLang = req.headers["accept-language"];
  if (acceptLang) {
    const primary = acceptLang.split(",")[0]?.split("-")[0]?.trim().toLowerCase();
    if (primary && SUPPORTED_LANGUAGES.includes(primary as SupportedLanguage)) {
      req.lang = primary as SupportedLanguage;
      next();
      return;
    }
  }

  // 3. Default to French
  req.lang = DEFAULT_LANGUAGE;
  next();
};

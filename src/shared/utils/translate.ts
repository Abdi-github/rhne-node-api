import type { SupportedLanguage, TranslatedField } from "@shared/types/i18n.types";
import { DEFAULT_LANGUAGE } from "@shared/types/i18n.types";

/**
 * Resolve a translated field to the requested language with fallback to FR.
 */
export const resolveTranslation = (
  field: TranslatedField | null | undefined,
  lang: SupportedLanguage
): string => {
  if (!field) return "";
  const value = field[lang];
  if (value && value.trim() !== "") return value;
  return field[DEFAULT_LANGUAGE] || "";
};

/**
 * Resolve translated field — returns the full TranslatedField or just the
 * resolved string depending on mode.
 */
export const resolveField = (
  field: TranslatedField | null | undefined,
  lang: SupportedLanguage,
  returnAll = false
): string | TranslatedField | null => {
  if (!field) return null;
  if (returnAll) return field;
  return resolveTranslation(field, lang);
};

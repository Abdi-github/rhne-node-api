export interface TranslatedField {
  fr: string;
  en: string;
  de: string;
  it: string;
}

export type SupportedLanguage = "fr" | "en" | "de" | "it";

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["fr", "en", "de", "it"];
export const DEFAULT_LANGUAGE: SupportedLanguage = "fr";

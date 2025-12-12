import i18next from "i18next";
import i18nextMiddleware from "i18next-http-middleware";

const resources = {
  fr: {
    translation: {
      welcome: "Bienvenue sur l'API RHNe",
      not_found: "Ressource non trouvée",
      server_error: "Erreur interne du serveur",
      unauthorized: "Non autorisé",
      forbidden: "Accès refusé",
      validation_error: "Erreur de validation",
      created: "{{resource}} créé(e) avec succès",
      updated: "{{resource}} mis(e) à jour avec succès",
      deleted: "{{resource}} supprimé(e) avec succès",
      retrieved: "{{resource}} récupéré(e)(s) avec succès",
      login_success: "Connexion réussie",
      logout_success: "Déconnexion réussie",
      invalid_credentials: "Identifiants invalides",
    },
  },
  en: {
    translation: {
      welcome: "Welcome to the RHNe API",
      not_found: "Resource not found",
      server_error: "Internal server error",
      unauthorized: "Unauthorized",
      forbidden: "Access denied",
      validation_error: "Validation error",
      created: "{{resource}} created successfully",
      updated: "{{resource}} updated successfully",
      deleted: "{{resource}} deleted successfully",
      retrieved: "{{resource}} retrieved successfully",
      login_success: "Login successful",
      logout_success: "Logout successful",
      invalid_credentials: "Invalid credentials",
    },
  },
  de: {
    translation: {
      welcome: "Willkommen bei der RHNe-API",
      not_found: "Ressource nicht gefunden",
      server_error: "Interner Serverfehler",
      unauthorized: "Nicht autorisiert",
      forbidden: "Zugriff verweigert",
      validation_error: "Validierungsfehler",
      created: "{{resource}} erfolgreich erstellt",
      updated: "{{resource}} erfolgreich aktualisiert",
      deleted: "{{resource}} erfolgreich gelöscht",
      retrieved: "{{resource}} erfolgreich abgerufen",
      login_success: "Anmeldung erfolgreich",
      logout_success: "Abmeldung erfolgreich",
      invalid_credentials: "Ungültige Anmeldedaten",
    },
  },
  it: {
    translation: {
      welcome: "Benvenuto nell'API RHNe",
      not_found: "Risorsa non trovata",
      server_error: "Errore interno del server",
      unauthorized: "Non autorizzato",
      forbidden: "Accesso negato",
      validation_error: "Errore di validazione",
      created: "{{resource}} creato/a con successo",
      updated: "{{resource}} aggiornato/a con successo",
      deleted: "{{resource}} eliminato/a con successo",
      retrieved: "{{resource}} recuperato/a/i con successo",
      login_success: "Accesso effettuato",
      logout_success: "Disconnessione effettuata",
      invalid_credentials: "Credenziali non valide",
    },
  },
};

i18next.use(i18nextMiddleware.LanguageDetector).init({
  resources,
  fallbackLng: "fr",
  supportedLngs: ["fr", "en", "de", "it"],
  preload: ["fr", "en", "de", "it"],
  detection: {
    order: ["querystring", "header"],
    lookupQuerystring: "lang",
    lookupHeader: "accept-language",
  },
  interpolation: {
    escapeValue: false,
  },
});

export { i18next, i18nextMiddleware };

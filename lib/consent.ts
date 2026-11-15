/**
 * Gestionnaire de consentement RGPD / CNIL — Open Hub (by Anarchy)
 *
 * Respecte les directives de la CNIL :
 * - Consentement libre, spécifique, éclairé et univoque
 * - Aucun traceur non-essentiel activé par défaut (Privacy by Design)
 * - Preuve de consentement horodatée et versionnée
 * - Droit à la portabilité (export JSON) et droit à l'effacement (purge totale)
 */

export const CONSENT_STORAGE_KEY = "openhub_rgpd_consent_v1";
export const CONSENT_COOKIE_NAME = "openhub_consent";
export const OPEN_COOKIE_MODAL_EVENT = "openhub:open-cookie-settings";

export interface ConsentPreferences {
  /** Version du schéma de consentement */
  version: string;
  /** Horodatage ISO 8601 du choix utilisateur */
  updatedAt: string;
  /** Cookies strictement nécessaires (sécurité, session, choix RGPD) — toujours true */
  essential: true;
  /** Préférences d'interface et du moteur audio (volume lecteur, buffer DSP) */
  audioPreferences: boolean;
  /** Mesure d'audience anonyme et intégrité des téléchargements VST */
  analytics: boolean;
  /** Contenus embarqués externes sur le Forum / Blog */
  communityEmbeds: boolean;
}

export const DEFAULT_REJECT_ALL_CONSENT: Omit<
  ConsentPreferences,
  "updatedAt"
> = {
  version: "1.0.0",
  essential: true,
  audioPreferences: false,
  analytics: false,
  communityEmbeds: false,
};

export const DEFAULT_ACCEPT_ALL_CONSENT: Omit<
  ConsentPreferences,
  "updatedAt"
> = {
  version: "1.0.0",
  essential: true,
  audioPreferences: true,
  analytics: true,
  communityEmbeds: true,
};

/**
 * Lit le consentement stocké localement (retourne `null` si l'utilisateur ne s'est pas encore prononcé).
 */
export function getStoredConsent(): ConsentPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentPreferences;
    if (parsed && parsed.essential === true && parsed.updatedAt) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Enregistre le choix de consentement dans localStorage + cookie First-Party sécurisé (SameSite=Lax; Secure en HTTPS).
 */
export function saveConsent(
  prefs: Omit<ConsentPreferences, "updatedAt" | "version" | "essential">
): ConsentPreferences {
  const record: ConsentPreferences = {
    version: "1.0.0",
    updatedAt: new Date().toISOString(),
    essential: true,
    audioPreferences: Boolean(prefs.audioPreferences),
    analytics: Boolean(prefs.analytics),
    communityEmbeds: Boolean(prefs.communityEmbeds),
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));

    // Synchronise un cookie first-party léger (6 mois max conformément aux recommandations CNIL)
    const maxAgeSixMonths = 60 * 60 * 24 * 180;
    const isSecure = window.location.protocol === "https:";
    const compactValue = encodeURIComponent(
      JSON.stringify({
        v: record.version,
        a: record.audioPreferences ? 1 : 0,
        m: record.analytics ? 1 : 0,
        c: record.communityEmbeds ? 1 : 0,
      })
    );
    document.cookie = `${CONSENT_COOKIE_NAME}=${compactValue}; Path=/; Max-Age=${maxAgeSixMonths}; SameSite=Lax${
      isSecure ? "; Secure" : ""
    }`;

    window.dispatchEvent(
      new CustomEvent("openhub:consent-updated", { detail: record })
    );
  }

  return record;
}

/**
 * Déclenche l'ouverture de la console de gestion des cookies depuis n'importe quel composant.
 */
export function openCookieSettingsModal(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_COOKIE_MODAL_EVENT));
  }
}

/**
 * Exporte toutes les données stockées localement pour l'utilisateur (Art. 20 RGPD — Portabilité).
 */
export function exportUserDataArchive(): string {
  if (typeof window === "undefined") return "{}";
  const localData: Record<string, unknown> = {};
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key) {
      const val = window.localStorage.getItem(key);
      try {
        localData[key] = val ? JSON.parse(val) : val;
      } catch {
        localData[key] = val;
      }
    }
  }

  return JSON.stringify(
    {
      platform: "OPEN HUB // by anarchy",
      rgpdExportArticle: "Article 20 RGPD - Droit à la portabilité des données",
      exportedAt: new Date().toISOString(),
      origin: window.location.origin,
      secureContext: window.isSecureContext,
      localStorage: localData,
      cookies: document.cookie || "(aucun cookie actif)",
    },
    null,
    2
  );
}

/**
 * Purge intégralement toutes les données locales et cookies (Art. 17 RGPD — Droit à l'effacement).
 */
export function purgeAllUserData(): void {
  if (typeof window === "undefined") return;
  window.localStorage.clear();
  window.sessionStorage.clear();

  // Expiration immédiate de tous les cookies accessibles du domaine
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const eqPos = cookie.indexOf("=");
    const name = (eqPos > -1 ? cookie.slice(0, eqPos) : cookie).trim();
    if (name) {
      document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
    }
  }

  window.dispatchEvent(
    new CustomEvent("openhub:consent-updated", { detail: null })
  );
}

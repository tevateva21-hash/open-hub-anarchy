"use client";

import React from "react";
import { openCookieSettingsModal } from "@/lib/consent";

/**
 * Bouton client permanent dans le Footer permettant de rouvrir à tout moment
 * le gestionnaire de consentement RGPD / Cookies (exigence CNIL : retrait du
 * consentement aussi simple que son octroi).
 */
export const FooterCookieTrigger: React.FC = () => {
  return (
    <button
      id="footer-open-cookie-settings"
      type="button"
      onClick={openCookieSettingsModal}
      className="font-mono text-xs text-brand-charcoal hover:text-brand-red underline decoration-neutral-300 hover:decoration-brand-red underline-offset-4 transition-colors"
    >
      GÉRER MES COOKIES [RGPD]
    </button>
  );
};

export default FooterCookieTrigger;

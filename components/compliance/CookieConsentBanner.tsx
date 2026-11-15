"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ConsentPreferences,
  DEFAULT_ACCEPT_ALL_CONSENT,
  DEFAULT_REJECT_ALL_CONSENT,
  OPEN_COOKIE_MODAL_EVENT,
  getStoredConsent,
  saveConsent,
} from "@/lib/consent";
import { Button } from "@/components/ui/Button";
import { AvatarBD } from "@/components/ui/AvatarBD";

/**
 * Composant `CookieConsentBanner` — Bandeau & Console RGPD / CNIL.
 *
 * Conforme aux exigences CNIL :
 * - Boutons "TOUT REFUSER" et "TOUT ACCEPTER" au même niveau hiérarchique
 * - Panneau granulaire "PERSONNALISER" par finalité avec toggles accessibles
 * - Direction Artistique : Base clinique blanche + Avatar BD 3D Anaglyphe
 */
export const CookieConsentBanner: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [audioPreferences, setAudioPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [communityEmbeds, setCommunityEmbeds] = useState(false);

  useEffect(() => {
    setMounted(true);
    const existing = getStoredConsent();
    if (!existing) {
      setIsOpen(true);
    } else {
      setAudioPreferences(existing.audioPreferences);
      setAnalytics(existing.analytics);
      setCommunityEmbeds(existing.communityEmbeds);
    }

    const handleOpenModal = () => {
      const current = getStoredConsent();
      if (current) {
        setAudioPreferences(current.audioPreferences);
        setAnalytics(current.analytics);
        setCommunityEmbeds(current.communityEmbeds);
      }
      setShowDetails(true);
      setIsOpen(true);
    };

    const handleConsentUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<ConsentPreferences | null>;
      if (!customEvent.detail) {
        // Si purge RGPD déclenchée, réaffiche le bandeau à l'état initial
        setAudioPreferences(false);
        setAnalytics(false);
        setCommunityEmbeds(false);
        setShowDetails(false);
        setIsOpen(true);
      }
    };

    window.addEventListener(OPEN_COOKIE_MODAL_EVENT, handleOpenModal);
    window.addEventListener("openhub:consent-updated", handleConsentUpdated);
    return () => {
      window.removeEventListener(OPEN_COOKIE_MODAL_EVENT, handleOpenModal);
      window.removeEventListener(
        "openhub:consent-updated",
        handleConsentUpdated
      );
    };
  }, []);

  if (!mounted || !isOpen) return null;

  const handleRejectAll = () => {
    saveConsent({
      audioPreferences: DEFAULT_REJECT_ALL_CONSENT.audioPreferences,
      analytics: DEFAULT_REJECT_ALL_CONSENT.analytics,
      communityEmbeds: DEFAULT_REJECT_ALL_CONSENT.communityEmbeds,
    });
    setIsOpen(false);
    setShowDetails(false);
  };

  const handleAcceptAll = () => {
    saveConsent({
      audioPreferences: DEFAULT_ACCEPT_ALL_CONSENT.audioPreferences,
      analytics: DEFAULT_ACCEPT_ALL_CONSENT.analytics,
      communityEmbeds: DEFAULT_ACCEPT_ALL_CONSENT.communityEmbeds,
    });
    setIsOpen(false);
    setShowDetails(false);
  };

  const handleSaveCustom = () => {
    saveConsent({
      audioPreferences,
      analytics,
      communityEmbeds,
    });
    setIsOpen(false);
    setShowDetails(false);
  };

  return (
    <aside
      id="rgpd-cookie-banner"
      role="dialog"
      aria-modal="false"
      aria-labelledby="rgpd-banner-title"
      className="fixed bottom-4 inset-x-4 z-50 max-w-4xl mx-auto"
    >
      <div className="bg-brand-white border-2 border-black rounded-xl shadow-comic overflow-hidden">
        {/* Barre supérieure technique style module DAW */}
        <div className="flex items-center justify-between px-4 py-2 bg-brand-pearl border-b border-neutral-200 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
            <span className="font-bold text-brand-black">
              {"PRIVACY_MODULE // RGPD & CNIL COMPLIANCE"}
            </span>
          </div>
          <span className="text-neutral-500">{"ZERO_TRACKER_BY_DEFAULT"}</span>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <AvatarBD
              name="Gardien RGPD 3D"
              size="md"
              badgeText="RGPD"
              className="shrink-0"
            />
            <div className="space-y-1.5 flex-1">
              <h2
                id="rgpd-banner-title"
                className="font-mono text-sm font-bold text-brand-black uppercase"
              >
                Transparence &amp; Contrôle des Cookies (Norme CNIL / UE)
              </h2>
              <p className="text-xs sm:text-sm text-brand-charcoal/90 leading-relaxed">
                <strong>Open Hub (by Anarchy)</strong> applique le principe de{" "}
                <em>Privacy by Design</em> : aucun traceur publicitaire n&apos;est
                utilisé. Nous utilisons uniquement un stockage local pour
                mémoriser vos choix RGPD, vos réglages de lecteur audio (buffer
                DSP, volume) et, si vous l&apos;acceptez, des métriques anonymes de
                téléchargement VST. Consultez notre{" "}
                <Link
                  href="/legal"
                  className="font-mono text-xs underline decoration-brand-red decoration-2 underline-offset-2 text-brand-black hover:text-brand-red"
                >
                  Centre Légal, RGPD &amp; Sécurité HTTPS
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Panneau granulaire de personnalisation par finalité */}
          {showDetails && (
            <div
              id="rgpd-granular-panel"
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-200"
            >
              {/* 1. Strictement nécessaires */}
              <div className="p-3 rounded-lg bg-brand-pearl/70 border border-neutral-200 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="font-mono text-xs font-bold text-brand-black">
                    01. ESSENTIELS &amp; SÉCURITÉ HTTPS
                  </div>
                  <p className="text-[11px] text-neutral-600">
                    Jeton de consentement RGPD, protection CSRF et intégrité des
                    sessions. Indispensables au fonctionnement.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded bg-brand-charcoal text-brand-white font-mono text-[10px] uppercase shrink-0">
                  REQUIS
                </span>
              </div>

              {/* 2. Préférences Audio DSP */}
              <label
                htmlFor="toggle-audio-prefs"
                className="p-3 rounded-lg bg-brand-pearl/70 border border-neutral-200 flex items-start justify-between gap-3 cursor-pointer hover:border-brand-charcoal transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="font-mono text-xs font-bold text-brand-black">
                    02. PRÉFÉRENCES AUDIO &amp; DSP
                  </div>
                  <p className="text-[11px] text-neutral-600">
                    Sauvegarde locale du volume du lecteur persistant, du thème
                    d&apos;oscilloscope et de la latence WebAudio.
                  </p>
                </div>
                <input
                  id="toggle-audio-prefs"
                  type="checkbox"
                  checked={audioPreferences}
                  onChange={(e) => setAudioPreferences(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-brand-red rounded border-neutral-300"
                />
              </label>

              {/* 3. Télémétrie VST anonyme */}
              <label
                htmlFor="toggle-analytics"
                className="p-3 rounded-lg bg-brand-pearl/70 border border-neutral-200 flex items-start justify-between gap-3 cursor-pointer hover:border-brand-charcoal transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="font-mono text-xs font-bold text-brand-black">
                    03. MÉTRIQUES VST ANONYMES
                  </div>
                  <p className="text-[11px] text-neutral-600">
                    Statistiques agrégées sans adresse IP complète pour mesurer
                    les plugins VST3/CLAP les plus téléchargés.
                  </p>
                </div>
                <input
                  id="toggle-analytics"
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-brand-red rounded border-neutral-300"
                />
              </label>

              {/* 4. Embeds Communauté */}
              <label
                htmlFor="toggle-community"
                className="p-3 rounded-lg bg-brand-pearl/70 border border-neutral-200 flex items-start justify-between gap-3 cursor-pointer hover:border-brand-charcoal transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="font-mono text-xs font-bold text-brand-black">
                    04. MÉDIAS EXTERNES FORUM
                  </div>
                  <p className="text-[11px] text-neutral-600">
                    Autorise le chargement de démonstrations vidéo/audio
                    externes partagées par les membres sur le Forum.
                  </p>
                </div>
                <input
                  id="toggle-community"
                  type="checkbox"
                  checked={communityEmbeds}
                  onChange={(e) => setCommunityEmbeds(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-brand-red rounded border-neutral-300"
                />
              </label>
            </div>
          )}

          {/* Barre d'actions conforme CNIL (Refuser aussi simple qu'Accepter) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-100">
            <Button
              id="btn-cookie-customize"
              variant="clinical"
              size="sm"
              onClick={() => setShowDetails((prev) => !prev)}
            >
              {showDetails ? "MASQUER LES DÉTAILS" : "⚙ PERSONNALISER"}
            </Button>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                id="btn-cookie-reject-all"
                variant="clinical"
                size="sm"
                onClick={handleRejectAll}
              >
                TOUT REFUSER
              </Button>
              {showDetails && (
                <Button
                  id="btn-cookie-save-custom"
                  variant="comic"
                  size="sm"
                  onClick={handleSaveCustom}
                >
                  ENREGISTRER MES CHOIX
                </Button>
              )}
              <Button
                id="btn-cookie-accept-all"
                variant="primary"
                size="sm"
                onClick={handleAcceptAll}
              >
                TOUT ACCEPTER
              </Button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default CookieConsentBanner;

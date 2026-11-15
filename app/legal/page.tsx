"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AvatarBD } from "@/components/ui/AvatarBD";
import {
  ConsentPreferences,
  exportUserDataArchive,
  getStoredConsent,
  openCookieSettingsModal,
  purgeAllUserData,
} from "@/lib/consent";

const SECURITY_HEADERS_SPEC = [
  {
    header: "Strict-Transport-Security (HSTS)",
    value: "max-age=63072000; includeSubDomains; preload",
    purpose: "Force exclusivement les connexions chiffrées HTTPS pendant 24 mois.",
  },
  {
    header: "Content-Security-Policy (CSP)",
    value: "default-src 'self'; frame-ancestors 'none'...",
    purpose:
      "Bloque les injections XSS et restreint l'exécution de scripts tiers non autorisés.",
  },
  {
    header: "Permissions-Policy",
    value: "camera=(), geolocation=(), browsing-topics=(), microphone=(self)",
    purpose:
      "Verrouille les capteurs matériels sensibles et désactive le pistage publicitaire Google Topics/FLoC.",
  },
  {
    header: "X-Content-Type-Options & X-Frame-Options",
    value: "nosniff // DENY",
    purpose:
      "Protège les téléchargements d'archives VST (.vst3/.clap/.wav) contre le détournement MIME et le clickjacking.",
  },
];

const COOKIE_INVENTORY = [
  {
    name: "openhub_rgpd_consent_v1",
    storage: "localStorage",
    duration: "6 mois (180 jours)",
    category: "Essentiel (Exempté)",
    purpose:
      "Conserve la preuve horodatée de vos choix d'acceptation ou de refus des cookies conformément aux directives CNIL.",
  },
  {
    name: "openhub_consent",
    storage: "Cookie HTTP First-Party (SameSite=Lax; Secure)",
    duration: "6 mois (180 jours)",
    category: "Essentiel (Exempté)",
    purpose:
      "Synchronise vos préférences de confidentialité avec le serveur Next.js pour ne charger aucun script non désiré.",
  },
  {
    name: "openhub_audio_prefs",
    storage: "localStorage (Opt-in)",
    duration: "Session / Persistant",
    category: "Préférences Audio & DSP",
    purpose:
      "Mémorise le niveau de sortie (dBFS) du lecteur audio persistant et la taille du buffer WebAudio.",
  },
  {
    name: "openhub_vst_telemetry",
    storage: "Mémoire éphémère (Opt-in)",
    duration: "Session uniquement",
    category: "Métriques Anonymes",
    purpose:
      "Comptabilise de manière anonyme les téléchargements de plugins VST afin d'allouer la bande passante des miroirs.",
  },
  {
    name: "anarchy-analysis (analyses)",
    storage: "IndexedDB locale navigateur (100% hors-ligne)",
    duration: "30 jours (max 5 pistes)",
    category: "Traitement Audio FFT Local",
    purpose:
      "Met en cache les enveloppes spectrales FFT 24kHz calculées localement pour Anarchy Visual Design. Aucun fichier audio ni spectre ne quitte votre appareil.",
  },
  {
    name: "openhub.visualEngine.savedPreset.v2",
    storage: "localStorage (Action utilisateur)",
    duration: "Jusqu'à suppression manuelle",
    category: "Préférences Visual Design",
    purpose:
      "Sauvegarde localement vos réglages des 19 faders, scènes et verrous du studio Anarchy Visual Design.",
  },
  {
    name: "openhub_user_session_v1",
    storage: "localStorage (Action utilisateur)",
    duration: "Jusqu'à déconnexion / purge",
    category: "Session Communauté",
    purpose:
      "Stocke localement votre pseudo, email et avatar BD lors de la connexion pour signer vos sons, likes et articles.",
  },
  {
    name: "openhub_radio_community_v1",
    storage: "localStorage (Action utilisateur)",
    duration: "Jusqu'à suppression manuelle",
    category: "Radio Générale & Ranking",
    purpose:
      "Conserve localement les sons ajoutés par la communauté et leurs votes (likes) sur la Radio Générale.",
  },
  {
    name: "openhub_community_blog_v1",
    storage: "localStorage (Action utilisateur)",
    duration: "Jusqu'à suppression manuelle",
    category: "Blog & Docs Communauté",
    purpose:
      "Conserve localement les articles et documentations publiés dans le tiroir Blog & Docs Communauté.",
  },
  {
    name: "openhub_soundcloud_url_v1",
    storage: "localStorage (Action utilisateur)",
    duration: "Jusqu'à suppression manuelle",
    category: "Radio Anarchy (SoundCloud)",
    purpose:
      "Mémorise le lien SoundCloud chargé dans le lecteur Radio Anarchy.",
  },
  {
    name: "openhub_community_stems_v1 / openhub_community_vst_v1 / openhub_vst_presets_v1",
    storage: "localStorage (Action utilisateur)",
    duration: "Jusqu'à suppression manuelle",
    category: "Contributions Communauté",
    purpose:
      "Conserve localement les dépôts de sons/stems, remixes, plugins VST et presets VST publiés.",
  },
];

/**
 * Page `/legal` — Centre de Conformité RGPD, Gestion des Cookies, Mentions Légales (LCEN) & Sécurité HTTPS.
 */
export default function LegalCompliancePage() {
  const [consent, setConsent] = useState<ConsentPreferences | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isHttpsContext, setIsHttpsContext] = useState<boolean>(true);

  useEffect(() => {
    setConsent(getStoredConsent());
    setIsHttpsContext(window.isSecureContext);

    const handleUpdate = () => {
      setConsent(getStoredConsent());
    };
    window.addEventListener("openhub:consent-updated", handleUpdate);
    return () =>
      window.removeEventListener("openhub:consent-updated", handleUpdate);
  }, []);

  const handleDownloadRgpdArchive = () => {
    const jsonPayload = exportUserDataArchive();
    const blob = new Blob([jsonPayload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `openhub-rgpd-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusMessage(
      "Archive JSON générée et téléchargée avec succès (Art. 20 RGPD — Portabilité)."
    );
  };

  const handlePurgeLocalData = () => {
    purgeAllUserData();
    setConsent(null);
    setStatusMessage(
      "Toutes vos données locales (localStorage, sessionStorage et cookies) ont été effacées (Art. 17 RGPD — Droit à l'oubli)."
    );
  };

  return (
    <div className="space-y-10">
      {/* En-tête de la page Conformité & Sécurité */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-brand-red font-bold uppercase">
            <span>{"// SECURITY_&_COMPLIANCE_HUB"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-black">
            Centre RGPD, Cookies, HTTPS &amp; Mentions Légales
          </h1>
          <p className="text-sm text-neutral-600">
            Conformité européenne (RGPD UE 2016/679, directives CNIL, LCEN) et
            architecture de sécurité HTTPS d&apos;Open Hub (by Anarchy).
          </p>
        </div>

        <Link href="/">
          <Button id="btn-back-home" variant="clinical" size="md">
            {"← RETOUR AU HUB"}
          </Button>
        </Link>
      </div>

      {/* Console Libre-Service RGPD (Droits Art. 15, 17, 20 RGPD) */}
      <section aria-labelledby="rgpd-console-heading">
        <Card
          moduleTitle="RGPD_SELF_SERVICE // DROITS UTILISATEUR EN TEMPS RÉEL"
          moduleMeta="UE 2016/679 (ART. 15, 17, 20)"
          activeIndicator
        >
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-neutral-100">
              <div className="flex items-center gap-4">
                <AvatarBD name="DPO Anarchy" size="md" badgeText="DPO" />
                <div>
                  <h2
                    id="rgpd-console-heading"
                    className="font-mono text-sm font-bold uppercase text-brand-black"
                  >
                    Console d&apos;Exercice Immédiat de vos Droits RGPD
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
                    Contrôlez vos préférences de consentement, téléchargez
                    l&apos;intégralité de vos données locales ou exercez votre
                    droit à l&apos;effacement en un clic.
                  </p>
                </div>
              </div>

              <div className="font-mono text-xs px-3 py-2 rounded-lg bg-brand-pearl border border-neutral-200">
                <div>
                  STATUT CONSENTEMENT :{" "}
                  {consent ? (
                    <span className="text-brand-black font-bold">
                      ENREGISTRÉ
                    </span>
                  ) : (
                    <span className="text-brand-red font-bold">
                      NON DÉFINI / PURGÉ
                    </span>
                  )}
                </div>
                {consent && (
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Horodatage : {new Date(consent.updatedAt).toLocaleString("fr-FR")}
                  </div>
                )}
              </div>
            </div>

            {/* État actuel par finalité */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-brand-pearl/70 border border-neutral-200">
                <div className="text-[10px] text-neutral-500">01. ESSENTIELS</div>
                <div className="font-bold text-brand-black mt-1">
                  ACTIF (REQUIS)
                </div>
              </div>
              <div className="p-3 rounded-lg bg-brand-pearl/70 border border-neutral-200">
                <div className="text-[10px] text-neutral-500">
                  02. AUDIO &amp; DSP
                </div>
                <div className="font-bold mt-1">
                  {consent?.audioPreferences ? (
                    <span className="text-brand-black">AUTORISÉ</span>
                  ) : (
                    <span className="text-neutral-500">REFUSÉ</span>
                  )}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-brand-pearl/70 border border-neutral-200">
                <div className="text-[10px] text-neutral-500">
                  03. MÉTRIQUES VST
                </div>
                <div className="font-bold mt-1">
                  {consent?.analytics ? (
                    <span className="text-brand-black">AUTORISÉ</span>
                  ) : (
                    <span className="text-neutral-500">REFUSÉ</span>
                  )}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-brand-pearl/70 border border-neutral-200">
                <div className="text-[10px] text-neutral-500">
                  04. MÉDIAS FORUM
                </div>
                <div className="font-bold mt-1">
                  {consent?.communityEmbeds ? (
                    <span className="text-brand-black">AUTORISÉ</span>
                  ) : (
                    <span className="text-neutral-500">REFUSÉ</span>
                  )}
                </div>
              </div>
            </div>

            {statusMessage && (
              <div
                role="status"
                className="p-3 rounded-lg bg-brand-pearl border-l-4 border-brand-red font-mono text-xs text-brand-black"
              >
                {statusMessage}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <Button
                id="btn-legal-open-cookies"
                variant="clinical"
                size="md"
                onClick={openCookieSettingsModal}
              >
                ⚙ MODIFIER MES CHOIX COOKIES
              </Button>
              <Button
                id="btn-legal-export-data"
                variant="comic"
                size="md"
                onClick={handleDownloadRgpdArchive}
              >
                ⬇ EXPORTER MES DONNÉES (.JSON)
              </Button>
              <Button
                id="btn-legal-purge-data"
                variant="primary"
                size="md"
                onClick={handlePurgeLocalData}
              >
                ✕ DROIT À L&apos;OUBLI (PURGER TOUT)
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Architecture HTTPS & En-têtes de Sécurité */}
      <section aria-labelledby="https-heading" className="space-y-4">
        <Card
          moduleTitle="HTTPS_&_SECURITY_HEADERS // PROTECTION TRANSPORT & NAVIGATEUR"
          moduleMeta={
            isHttpsContext ? "CONTEXTE SÉCURISÉ ACTIF" : "MODE DÉVELOPPEMENT"
          }
          activeIndicator
        >
          <div className="space-y-4">
            <div className="space-y-1">
              <h2
                id="https-heading"
                className="font-mono text-sm font-bold uppercase text-brand-black"
              >
                Politique HTTPS Stricte (HSTS) &amp; Isolation Applicative
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Toutes les requêtes vers <strong>Open Hub (by Anarchy)</strong>{" "}
                sont protégées par redirection automatique{" "}
                <code className="font-mono text-xs bg-brand-pearl px-1.5 py-0.5 rounded">
                  HTTP → HTTPS (308 Permanent Redirect)
                </code>{" "}
                via notre middleware Next.js et les en-têtes HTTP suivants :
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 font-mono text-[11px] text-neutral-500 uppercase">
                    <th className="py-2.5 pr-4">En-tête HTTP</th>
                    <th className="py-2.5 px-4">Directive Active</th>
                    <th className="py-2.5 pl-4">Rôle de Sécurité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs">
                  {SECURITY_HEADERS_SPEC.map((item) => (
                    <tr key={item.header}>
                      <td className="py-3 pr-4 font-mono font-bold text-brand-black whitespace-nowrap">
                        {item.header}
                      </td>
                      <td className="py-3 px-4 font-mono text-brand-red">
                        {item.value}
                      </td>
                      <td className="py-3 pl-4 text-neutral-600">
                        {item.purpose}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </section>

      {/* Inventaire Transparent des Cookies & Stockage Local */}
      <section aria-labelledby="cookies-table-heading" className="space-y-4">
        <Card
          moduleTitle="COOKIE_&_STORAGE_INVENTORY // REGISTRE DES TRACEURS"
          moduleMeta="DURÉE MAX : 6 MOIS (CNIL)"
        >
          <div className="space-y-4">
            <h2
              id="cookies-table-heading"
              className="font-mono text-sm font-bold uppercase text-brand-black"
            >
              Registre Complet des Cookies &amp; Clés LocalStorage
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 font-mono text-[11px] text-neutral-500 uppercase">
                    <th className="py-2.5 pr-4">Identifiant</th>
                    <th className="py-2.5 px-4">Type de Stockage</th>
                    <th className="py-2.5 px-4">Conservation</th>
                    <th className="py-2.5 px-4">Catégorie</th>
                    <th className="py-2.5 pl-4">Finalité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs">
                  {COOKIE_INVENTORY.map((c) => (
                    <tr key={c.name}>
                      <td className="py-3 pr-4 font-mono font-bold text-brand-black whitespace-nowrap">
                        {c.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-600">
                        {c.storage}
                      </td>
                      <td className="py-3 px-4 font-mono text-brand-red whitespace-nowrap">
                        {c.duration}
                      </td>
                      <td className="py-3 px-4 font-mono text-brand-charcoal">
                        {c.category}
                      </td>
                      <td className="py-3 pl-4 text-neutral-600">
                        {c.purpose}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </section>

      {/* Mentions Légales (LCEN) & Licences Open-Source Audio */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          moduleTitle="LCEN // MENTIONS LÉGALES"
          moduleMeta="LOI N° 2004-575"
        >
          <div className="space-y-3 text-xs sm:text-sm text-neutral-600 leading-relaxed">
            <h2 className="font-mono text-sm font-bold uppercase text-brand-black">
              Éditeur &amp; Publication
            </h2>
            <p>
              <strong>Nom de la plateforme :</strong> OPEN HUB // by anarchy
              <br />
              <strong>Nature du projet :</strong> Plateforme communautaire
              open-source dédiée aux plugins audio (VST3, CLAP, AU), aux banques
              de samples libres de droits et à la recherche DSP.
              <br />
              <strong>Contact DPO &amp; Légal :</strong>{" "}
              <code className="font-mono text-xs text-brand-black">
                privacy@openhub-anarchy.org
              </code>
              <br />
              <strong>Contact Sécurité (CERT/Vulnérabilités) :</strong>{" "}
              <code className="font-mono text-xs text-brand-black">
                security@openhub-anarchy.org
              </code>{" "}
              (voir{" "}
              <a
                href="/.well-known/security.txt"
                className="font-mono text-xs underline text-brand-red"
              >
                /.well-known/security.txt
              </a>
              )
            </p>
          </div>
        </Card>

        <Card
          moduleTitle="OPEN_SOURCE // LICENCES VST & SAMPLES"
          moduleMeta="GPL-3.0 / MIT / CC0"
        >
          <div className="space-y-3 text-xs sm:text-sm text-neutral-600 leading-relaxed">
            <h2 className="font-mono text-sm font-bold uppercase text-brand-black">
              Propriété Intellectuelle &amp; Intégrité Binaires
            </h2>
            <p>
              Les codes sources des plugins hébergés sur{" "}
              <strong>Open Hub (by Anarchy)</strong> sont distribués sous
              licences libres (<strong>GPL-3.0</strong> ou <strong>MIT</strong>)
              et les packs de samples sous licence{" "}
              <strong>Creative Commons CC0 / CC-BY 4.0</strong>. Chaque archive
              binaire publiée est accompagnée d&apos;une empreinte
              cryptographique{" "}
              <code className="font-mono text-xs text-brand-black">
                SHA-256
              </code>{" "}
              vérifiable avant installation dans votre DAW.
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AvatarBD } from "@/components/ui/AvatarBD";
import { useAudioPlayer } from "@/components/audio/AudioPlayerContext";
import { FigmaPluginRack } from "@/components/vst/FigmaPluginRack";
import {
  getPluginById,
  pluginToAudioTrack,
  type AvatarExpression,
  type VstPlugin,
} from "@/lib/openhub-data";
import {
  getStoredConsent,
  openCookieSettingsModal,
  type ConsentPreferences,
} from "@/lib/consent";

type OsTarget = "macOS" | "Windows" | "Linux" | "Source";
type FormatTarget = "VST3" | "CLAP" | "AU" | "SOURCE";

interface TarEntry {
  name: string;
  content: Uint8Array;
}

const TELEMETRY_STORAGE_KEY = "openhub_vst_telemetry";

/**
 * Construit une archive POSIX `ustar` (.tar) non compressée côté client (100% conforme CSP sans fetch externe).
 */
function buildPosixTarArchive(entries: TarEntry[]): Uint8Array {
  const encoder = new TextEncoder();
  const blocks: Uint8Array[] = [];

  for (const entry of entries) {
    const header = new Uint8Array(512);
    const nameBytes = encoder.encode(entry.name.slice(0, 99));
    header.set(nameBytes, 0);

    const writeOctal = (val: number, offset: number, length: number) => {
      const oct = val.toString(8).padStart(length - 1, "0") + "\0";
      header.set(encoder.encode(oct), offset);
    };

    writeOctal(0o644, 100, 8); // mode
    writeOctal(0, 108, 8); // uid
    writeOctal(0, 116, 8); // gid
    writeOctal(entry.content.length, 124, 12); // size
    writeOctal(Math.floor(Date.now() / 1000), 136, 12); // mtime

    // Checksum placeholder (8 spaces)
    for (let i = 148; i < 156; i++) header[i] = 32;
    header[156] = 48; // '0' regular file
    header.set(encoder.encode("ustar\0"), 257);
    header.set(encoder.encode("00"), 263);

    let sum = 0;
    for (let i = 0; i < 512; i++) sum += header[i];
    const chksum = sum.toString(8).padStart(6, "0") + "\0 ";
    header.set(encoder.encode(chksum), 148);

    blocks.push(header);

    const paddedLen = Math.ceil(entry.content.length / 512) * 512;
    const dataBlock = new Uint8Array(paddedLen);
    dataBlock.set(entry.content, 0);
    blocks.push(dataBlock);
  }

  // Fin d'archive TAR : 2 blocs de 512 octets nuls
  blocks.push(new Uint8Array(1024));

  const totalBytes = blocks.reduce((acc, b) => acc + b.length, 0);
  const archive = new Uint8Array(totalBytes);
  let cursor = 0;
  for (const b of blocks) {
    archive.set(b, cursor);
    cursor += b.length;
  }
  return archive;
}

function getOfficialSha256ForOs(plugin: VstPlugin, os: OsTarget): string {
  if (os === "Windows") return plugin.sha256.windows;
  if (os === "Linux") return plugin.sha256.linux;
  return plugin.sha256.macos;
}

interface CommunityReview {
  id: string;
  author: string;
  badge: string;
  expression: AvatarExpression;
  daw: string;
  rating: string;
  comment: string;
}

function buildDspReviews(plugin: VstPlugin): CommunityReview[] {
  return [
    {
      id: `${plugin.id}-rev-1`,
      author: "Studio_Nord_DSP",
      badge: "ENG",
      expression: "dsp",
      daw: "Reaper 7.2 • 48 kHz",
      rating: "5/5",
      comment: `Testé ${plugin.code} en insert master et bus parallèle : latence mesurée (${plugin.metrics.latency}) conforme et empreinte CPU stable (${plugin.metrics.cpuLoad}).`,
    },
    {
      id: `${plugin.id}-rev-2`,
      author: "Koma_3D_Lab",
      badge: "CLAP",
      expression: "spectateur-b",
      daw: "Bitwig 5.2 • PipeWire",
      rating: "5/5",
      comment: `Empreinte SHA-256 vérifiée sur le build Linux et modulation automatisée sans aucun aliasing audible en mode WET.`,
    },
  ];
}

export default function VstPluginDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id ?? "";
  let decodedId = rawId;
  try {
    decodedId = decodeURIComponent(rawId);
  } catch {
    decodedId = rawId;
  }

  const plugin = getPluginById(decodedId);
  if (!plugin) {
    notFound();
  }

  const {
    currentTrack,
    isPlaying,
    wetDryMix,
    playTrack,
    togglePlay,
    toggleWetDry,
  } = useAudioPlayer();

  const [selectedOs, setSelectedOs] = useState<OsTarget>("macOS");
  const [selectedFormat, setSelectedFormat] = useState<FormatTarget>(
    plugin.formats[0] ?? "VST3"
  );
  const [consent, setConsent] = useState<ConsentPreferences | null>(null);
  const [sessionTelemetryCount, setSessionTelemetryCount] = useState<number>(0);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const [pastedHash, setPastedHash] = useState<string>("");
  const [localFileHash, setLocalFileHash] = useState<string | null>(null);
  const [localFileName, setLocalFileName] = useState<string | null>(null);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = `${plugin.code} — ${plugin.name} | OPEN HUB // by anarchy`;
  }, [plugin.code, plugin.name]);

  // Synchronise consentement RGPD analytics + compteur sessionStorage sans toucher au SSR
  useEffect(() => {
    const syncTelemetryFromConsent = (
      currentConsent: ConsentPreferences | null
    ) => {
      setConsent(currentConsent);
      if (currentConsent?.analytics === true && typeof window !== "undefined") {
        try {
          const raw = window.sessionStorage.getItem(TELEMETRY_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as Record<string, number>;
            setSessionTelemetryCount(Number(parsed?.[plugin.id] ?? 0));
          } else {
            setSessionTelemetryCount(0);
          }
        } catch {
          setSessionTelemetryCount(0);
        }
      } else {
        setSessionTelemetryCount(0);
      }
    };

    syncTelemetryFromConsent(getStoredConsent());

    const handleConsentUpdated = (event: Event) => {
      const custom = event as CustomEvent<ConsentPreferences | null>;
      const nextConsent = custom.detail ?? getStoredConsent();
      if (!nextConsent?.analytics && typeof window !== "undefined") {
        try {
          window.sessionStorage.removeItem(TELEMETRY_STORAGE_KEY);
        } catch {
          // Ignore storage error
        }
      }
      syncTelemetryFromConsent(nextConsent);
    };

    window.addEventListener("openhub:consent-updated", handleConsentUpdated);
    return () =>
      window.removeEventListener("openhub:consent-updated", handleConsentUpdated);
  }, [plugin.id]);

  const activeHash = getOfficialSha256ForOs(plugin, selectedOs);
  const isThisTrack = currentTrack?.id === plugin.id;
  const isThisPlaying = isThisTrack && isPlaying;
  const analyticsAllowed = consent?.analytics === true;
  const reviews = useMemo(() => buildDspReviews(plugin), [plugin]);

  const handleOsSelect = (os: OsTarget) => {
    setSelectedOs(os);
    if (os === "Source") {
      setSelectedFormat("SOURCE");
    } else if (selectedFormat === "SOURCE") {
      setSelectedFormat(plugin.formats[0] ?? "VST3");
    }
    setVerifyMessage(null);
  };

  const handleCopySha256 = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(activeHash);
      } else {
        const el = document.createElement("textarea");
        el.value = activeHash;
        el.setAttribute("readonly", "");
        el.style.position = "absolute";
        el.style.left = "-9999px";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopyStatus(`Empreinte SHA-256 (${selectedOs}) copiée dans le presse-papiers.`);
    } catch {
      setCopyStatus("Sélectionnez le hash manuellement pour le copier.");
    }
  };

  const handleDownloadArchive = () => {
    const encoder = new TextEncoder();
    const formatSlug = selectedFormat.toLowerCase();
    const osSlug = selectedOs.toLowerCase();
    const archiveName = `${plugin.id}-${plugin.version}-${osSlug}-${formatSlug}.tar`;

    const readmeText = [
      `OPEN HUB // BY ANARCHY — PACKAGE OFFICIEL ${plugin.code}`,
      `Plugin : ${plugin.name} (${plugin.version})`,
      `Catégorie : ${plugin.category}`,
      `Cible OS / Format : ${selectedOs} / ${selectedFormat}`,
      `Licence Open-Source : ${plugin.metrics.license}`,
      `SHA-256 Officiel (${selectedOs}) : ${activeHash}`,
      "",
      "INSTALLATION :",
      "- macOS : Copier le bundle dans ~/Library/Audio/Plug-Ins/VST3/ (ou CLAP/ / Components/)",
      "- Windows : Copier le bundle dans C:\\Program Files\\Common Files\\VST3\\",
      "- Linux : Copier le bundle dans ~/.vst3/ ou ~/.clap/",
    ].join("\n");

    const manifestJson = JSON.stringify(
      {
        id: plugin.id,
        code: plugin.code,
        name: plugin.name,
        version: plugin.version,
        targetOs: selectedOs,
        format: selectedFormat,
        metrics: plugin.metrics,
        sha256: plugin.sha256,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );

    const dspHeader = [
      `// ${plugin.code} — ${plugin.name} (${plugin.version})`,
      `// License: ${plugin.metrics.license}`,
      `#pragma once`,
      `#include <cmath>`,
      `namespace anarchy::dsp {`,
      `inline float processSample(float x, float driveNorm) noexcept {`,
      `  const float g = 1.0f + driveNorm * 8.0f;`,
      `  return std::tanh(x * g) / std::tanh(g);`,
      `}`,
      `}`,
    ].join("\n");

    const licenseText = `${plugin.name} — Open-Source License: ${plugin.metrics.license}\nOpen Hub (by Anarchy) Audio Collective.\n`;

    const tarBytes = buildPosixTarArchive([
      { name: `${plugin.id}/README_INSTALL.txt`, content: encoder.encode(readmeText) },
      { name: `${plugin.id}/MANIFEST.json`, content: encoder.encode(manifestJson) },
      { name: `${plugin.id}/src/${plugin.id}_dsp.hpp`, content: encoder.encode(dspHeader) },
      { name: `${plugin.id}/LICENSE.txt`, content: encoder.encode(licenseText) },
    ]);

    const blob = new Blob([tarBytes.buffer as ArrayBuffer], {
      type: "application/x-tar",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = archiveName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);

    // Télémétrie strictement conditionnée au consentement RGPD analytics
    let recordedTelemetry = false;
    if (getStoredConsent()?.analytics === true && typeof window !== "undefined") {
      try {
        const raw = window.sessionStorage.getItem(TELEMETRY_STORAGE_KEY);
        const map = raw ? (JSON.parse(raw) as Record<string, number>) : {};
        const nextCount = Number(map[plugin.id] ?? 0) + 1;
        map[plugin.id] = nextCount;
        window.sessionStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(map));
        setSessionTelemetryCount(nextCount);
        recordedTelemetry = true;
      } catch {
        recordedTelemetry = false;
      }
    }

    setDownloadStatus(
      `Archive ${archiveName} générée localement.${
        recordedTelemetry
          ? " Compteur télémétrie de session incrémenté (analytics opt-in)."
          : " Aucune télémétrie écrite (consentement analytics désactivé)."
      }`
    );
  };

  const handleVerifyPasted = () => {
    const normalized = pastedHash.trim().toLowerCase();
    if (!normalized) {
      setVerifyMessage("Collez une somme SHA-256 (64 caractères hexadécimaux) à comparer.");
      return;
    }
    const matchesSelected = normalized === activeHash.toLowerCase();
    const matchedOs = (Object.keys(plugin.sha256) as Array<keyof typeof plugin.sha256>).find(
      (osKey) => plugin.sha256[osKey].toLowerCase() === normalized
    );
    if (matchesSelected) {
      setVerifyMessage(`VALIDE : correspond exactement à l'empreinte ${selectedOs} officielle.`);
    } else if (matchedOs) {
      setVerifyMessage(
        `VALIDE (${matchedOs.toUpperCase()}) : correspond au binaire ${matchedOs}, différent de l'onglet ${selectedOs}.`
      );
    } else {
      setVerifyMessage("NON CONFORME : l'empreinte saisie ne correspond à aucun binaire officiel de ce plugin.");
    }
  };

  const handleHashLocalFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalFileName(file.name);
    try {
      const buffer = await file.arrayBuffer();
      const digest = await crypto.subtle.digest("SHA-256", buffer);
      const hex = Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      setLocalFileHash(hex);
      setPastedHash(hex);
      const matches = hex.toLowerCase() === activeHash.toLowerCase();
      setVerifyMessage(
        matches
          ? `VALIDE : le fichier ${file.name} correspond au SHA-256 officiel (${selectedOs}).`
          : `SHA-256 calculé pour ${file.name} (archive locale synthétisée ou différente de la build binaire ${selectedOs}).`
      );
    } catch {
      setVerifyMessage("Impossible de calculer le digest WebCrypto SHA-256 sur ce fichier.");
    }
  };

  return (
    <div className="space-y-8 pb-6 min-w-0">
      {/* Breadcrumb & Retour Catalogue */}
      <nav
        aria-label="Fil d'Ariane plugin"
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 min-h-[42px] px-3.5 py-2 rounded-lg bg-brand-white border border-neutral-200/90 shadow-clinical font-mono text-xs font-bold uppercase tracking-wider text-brand-charcoal hover:border-brand-red hover:text-brand-red transition-colors"
        >
          {"← RETOUR AU CATALOGUE VST"}
        </Link>

        <div className="font-mono text-xs text-neutral-500 flex items-center gap-2">
          <span>OPEN HUB</span>
          <span>/</span>
          <span>VST</span>
          <span>/</span>
          <span className="font-bold text-brand-red">{plugin.code}</span>
        </div>
      </nav>

      {/* En-tête Clinique + BD 3D & Prévisualisation Audio A/B Dry/Wet */}
      <section aria-labelledby="vst-detail-heading">
        <Card
          moduleTitle={`${plugin.code} // ${plugin.category}`}
          moduleMeta={plugin.version}
          activeIndicator
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 min-w-0">
            <div className="space-y-4 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-brand-pearl border-2 border-black shadow-comic-sm font-mono text-[11px] font-bold uppercase text-brand-black">
                  {plugin.category}
                </span>
                {plugin.formats.map((fmt) => (
                  <span
                    key={fmt}
                    className="px-2 py-1 rounded bg-brand-white border border-neutral-200 font-mono text-[11px] font-bold text-brand-charcoal"
                  >
                    {fmt}
                  </span>
                ))}
                {plugin.os.map((osName) => (
                  <span
                    key={osName}
                    className="px-2 py-1 rounded bg-brand-pearl border border-neutral-200 font-mono text-[11px] text-neutral-600"
                  >
                    {osName}
                  </span>
                ))}
              </div>

              <h1
                id="vst-detail-heading"
                className="text-2xl sm:text-4xl font-bold tracking-tight text-brand-black break-words"
              >
                {plugin.name}
              </h1>

              <p className="text-sm sm:text-base text-brand-charcoal/85 leading-relaxed">
                {plugin.longDescription}
              </p>

              {/* Contrôles A/B Dry/Wet dans le Sticky Bottom Player */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button
                  id="btn-vst-ab-play"
                  variant={isThisPlaying ? "comic" : "primary"}
                  size="lg"
                  onClick={() =>
                    isThisTrack
                      ? togglePlay()
                      : playTrack(pluginToAudioTrack(plugin))
                  }
                  className="min-h-[44px]"
                >
                  {isThisPlaying ? "❚❚ PAUSE TEST_SIGNAL" : "▶ TEST_SIGNAL (A/B)"}
                </Button>

                <Button
                  id="btn-vst-ab-drywet"
                  variant="clinical"
                  size="lg"
                  aria-pressed={wetDryMix}
                  onClick={() => {
                    if (!isThisTrack) {
                      playTrack(pluginToAudioTrack(plugin));
                    }
                    toggleWetDry();
                  }}
                  className="min-h-[44px]"
                >
                  {wetDryMix
                    ? "SIGNAL A/B : WET (DSP ACTIF)"
                    : "SIGNAL A/B : DRY (BYPASS)"}
                </Button>
              </div>
            </div>

            {/* Carte auteur BD & Profil Audio */}
            <div className="w-full lg:w-72 shrink-0 bg-brand-pearl border-2 border-black rounded-xl p-4 shadow-comic-sm space-y-3">
              <div className="flex items-center gap-3 min-w-0">
                <AvatarBD
                  name={plugin.author}
                  expression={plugin.avatarExpression}
                  size="lg"
                  badgeText={plugin.authorBadge}
                  anaglyphRing={isThisPlaying}
                  audioReactive={isThisPlaying}
                />
                <div className="min-w-0">
                  <div className="font-mono text-[10px] uppercase text-neutral-500">
                    DÉVELOPPEUR DSP
                  </div>
                  <div className="font-mono text-sm font-bold text-brand-black truncate">
                    {plugin.author}
                  </div>
                  <div className="font-mono text-xs text-brand-red font-bold">
                    {`${plugin.audioProfile.bpm} BPM • ${plugin.audioProfile.key}`}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-200 font-mono text-[11px]">
                <div className="bg-brand-white rounded-lg p-2 border border-neutral-200">
                  <div className="text-[10px] text-neutral-500">TAILLE</div>
                  <div className="font-bold text-brand-black">{plugin.fileSize}</div>
                </div>
                <div className="bg-brand-white rounded-lg p-2 border border-neutral-200">
                  <div className="text-[10px] text-neutral-500">TÉLÉCH.</div>
                  <div className="font-bold text-brand-black">
                    {(plugin.downloadsCount + sessionTelemetryCount).toLocaleString(
                      "fr-FR"
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Métriques techniques DAW */}
          <div className="mt-6 pt-5 border-t border-neutral-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-brand-pearl/70 rounded-xl p-3 border border-neutral-200/80 min-w-0">
              <div className="font-mono text-[10px] text-neutral-500 uppercase">
                OVERSAMPLING
              </div>
              <div className="font-mono text-xs sm:text-sm font-bold text-brand-black mt-0.5 break-words">
                {plugin.metrics.oversampling}
              </div>
            </div>
            <div className="bg-brand-pearl/70 rounded-xl p-3 border border-neutral-200/80 min-w-0">
              <div className="font-mono text-[10px] text-neutral-500 uppercase">
                LATENCY
              </div>
              <div className="font-mono text-xs sm:text-sm font-bold text-brand-black mt-0.5">
                {plugin.metrics.latency}
              </div>
            </div>
            <div className="bg-brand-pearl/70 rounded-xl p-3 border border-neutral-200/80 min-w-0">
              <div className="font-mono text-[10px] text-neutral-500 uppercase">
                CPU_LOAD
              </div>
              <div className="font-mono text-xs sm:text-sm font-bold text-brand-black mt-0.5">
                {plugin.metrics.cpuLoad}
              </div>
            </div>
            <div className="bg-brand-pearl/70 rounded-xl p-3 border border-neutral-200/80 min-w-0">
              <div className="font-mono text-[10px] text-neutral-500 uppercase">
                LICENSE
              </div>
              <div className="font-mono text-xs sm:text-sm font-bold text-brand-red mt-0.5">
                {plugin.metrics.license}
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Rack Interactif Figma UI Kit v1.0 (Sections A, B, C, D) */}
      <section aria-labelledby="figma-rack-heading" className="space-y-3 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="figma-rack-heading"
            className="font-mono text-sm font-bold uppercase tracking-wider text-brand-black flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-brand-red" />
            {"01 // RACK INTERACTIF FIGMA UI KIT (AUDIO-RÉACTIF)"}
          </h2>
          <span className="font-mono text-xs text-neutral-500">
            SECTIONS A · B · C · D
          </span>
        </div>

        <FigmaPluginRack plugin={plugin} />
      </section>

      {/* Téléchargements Binaires OS + Vérification SHA-256 + Télémétrie RGPD */}
      <section
        id="download-integrity"
        aria-labelledby="downloads-heading"
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0"
      >
        {/* Panneau Téléchargement & Formats */}
        <Card
          moduleTitle="BINARIES // DOWNLOAD_MATRIX"
          moduleMeta={plugin.fileSize}
          activeIndicator
          className="lg:col-span-7 min-w-0"
        >
          <div className="space-y-5 min-w-0">
            <h2
              id="downloads-heading"
              className="font-mono text-base font-bold uppercase text-brand-black"
            >
              Téléchargement multi-plateforme &amp; Sommes SHA-256
            </h2>

            {/* Onglets OS : macOS, Windows, Linux, Source */}
            <div
              role="tablist"
              aria-label="Sélection du système d'exploitation"
              className="flex flex-wrap gap-2"
            >
              {(["macOS", "Windows", "Linux", "Source"] as const).map((osTab) => {
                const isSelected = selectedOs === osTab;
                return (
                  <button
                    key={osTab}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => handleOsSelect(osTab)}
                    className={[
                      "min-h-[42px] px-3.5 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider border transition-colors",
                      isSelected
                        ? "bg-brand-red text-brand-white border-brand-red"
                        : "bg-brand-pearl text-brand-charcoal border-neutral-200 hover:border-black",
                    ].join(" ")}
                  >
                    {osTab}
                  </button>
                );
              })}
            </div>

            {/* Sélecteur Format (VST3 / CLAP / AU / SOURCE) */}
            <div className="space-y-2">
              <div className="font-mono text-[11px] font-bold uppercase text-neutral-500">
                FORMAT CIBLE ({plugin.formats.join(" / ")})
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedOs === "Source" ? (
                  <button
                    type="button"
                    aria-pressed={true}
                    className="min-h-[40px] px-3 py-1.5 rounded-lg font-mono text-xs font-bold border-2 border-black bg-brand-white shadow-comic-sm"
                  >
                    SOURCE C++20 / CMAKE
                  </button>
                ) : (
                  plugin.formats.map((fmt) => {
                    const active = selectedFormat === fmt;
                    return (
                      <button
                        key={fmt}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setSelectedFormat(fmt)}
                        className={[
                          "min-h-[40px] px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold border transition-colors",
                          active
                            ? "border-2 border-black bg-brand-white text-brand-black shadow-comic-sm"
                            : "border-neutral-200 bg-brand-pearl text-neutral-600 hover:border-black",
                        ].join(" ")}
                      >
                        {fmt}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Action de téléchargement POSIX .tar */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                id={`btn-download-tar-${plugin.id}`}
                variant="primary"
                size="lg"
                onClick={handleDownloadArchive}
                className="min-h-[44px]"
              >
                {`TÉLÉCHARGER ${selectedOs.toUpperCase()} (${selectedFormat}) .TAR`}
              </Button>
            </div>

            {downloadStatus && (
              <div
                role="status"
                aria-live="polite"
                className="p-3 rounded-lg bg-brand-pearl border-l-4 border-brand-red font-mono text-xs text-brand-black"
              >
                {downloadStatus}
              </div>
            )}

            {/* Tableau récapitulatif complet SHA-256 macOS / Windows / Linux */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <div className="font-mono text-[11px] font-bold uppercase text-brand-charcoal">
                EMPREINTES SHA-256 OFFICIELLES (BUILD REPRODUCTIBLE)
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-500 text-[10px] uppercase">
                      <th className="py-2 pr-3">OS</th>
                      <th className="py-2">SHA-256</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    <tr>
                      <td className="py-2 pr-3 font-bold text-brand-black">macOS</td>
                      <td className="py-2 text-[11px] text-neutral-700 break-all">
                        {plugin.sha256.macos}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 font-bold text-brand-black">Windows</td>
                      <td className="py-2 text-[11px] text-neutral-700 break-all">
                        {plugin.sha256.windows}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 font-bold text-brand-black">Linux</td>
                      <td className="py-2 text-[11px] text-neutral-700 break-all">
                        {plugin.sha256.linux}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Card>

        {/* Panneau SHA-256 Copy/Verify + Garde RGPD Analytics */}
        <div className="lg:col-span-5 space-y-6 min-w-0">
          <Card
            moduleTitle="CRYPTO // SHA-256_VERIFY"
            moduleMeta={selectedOs.toUpperCase()}
          >
            <div className="space-y-4 min-w-0">
              <div className="p-3 rounded-lg bg-brand-pearl border border-neutral-200 space-y-2 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase text-neutral-500">
                    {`HASH SHA-256 (${selectedOs})`}
                  </span>
                  <Button
                    id="btn-copy-sha256"
                    variant="clinical"
                    size="sm"
                    onClick={handleCopySha256}
                    className="min-h-[36px]"
                  >
                    COPIER SHA-256
                  </Button>
                </div>
                <code className="block font-mono text-xs text-brand-black break-all">
                  {activeHash}
                </code>
              </div>

              {copyStatus && (
                <div
                  role="status"
                  aria-live="polite"
                  className="font-mono text-xs text-brand-red font-medium"
                >
                  {copyStatus}
                </div>
              )}

              {/* Vérificateur interactif (coller hash ou calculer WebCrypto sur fichier local) */}
              <div className="space-y-2.5 pt-2 border-t border-neutral-100">
                <label
                  htmlFor="sha256-verify-input"
                  className="block font-mono text-[11px] font-bold uppercase text-brand-charcoal"
                >
                  VÉRIFIER UNE EMPREINTE OU UN FICHIER LOCAL
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="sha256-verify-input"
                    type="text"
                    value={pastedHash}
                    onChange={(e) => setPastedHash(e.target.value)}
                    placeholder="Coller un hash SHA-256 (64 hex)..."
                    className="flex-1 min-w-0 min-h-[42px] px-3 py-2 rounded-lg border border-neutral-200 bg-brand-pearl font-mono text-xs text-brand-black focus:outline-none focus:border-brand-red"
                  />
                  <Button
                    variant="comic"
                    size="md"
                    onClick={handleVerifyPasted}
                    className="min-h-[42px] shrink-0"
                  >
                    VÉRIFIER
                  </Button>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="sha256-file-input"
                    className="block font-mono text-[10px] text-neutral-500 uppercase"
                  >
                    OU HASHER UN FICHIER LOCAL VIA WEBCRYPTO SHA-256
                  </label>
                  <input
                    id="sha256-file-input"
                    type="file"
                    onChange={handleHashLocalFile}
                    className="block w-full text-xs font-mono text-neutral-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-neutral-200 file:font-mono file:text-xs file:font-bold file:bg-brand-pearl file:text-brand-black hover:file:border-brand-red"
                  />
                  {localFileHash && localFileName && (
                    <div className="font-mono text-[10px] text-neutral-500 break-all">
                      {localFileName}: {localFileHash}
                    </div>
                  )}
                </div>

                {verifyMessage && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="p-2.5 rounded-lg bg-brand-pearl border border-neutral-200 font-mono text-xs text-brand-black"
                  >
                    {verifyMessage}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Panneau Télémétrie RGPD / CNIL */}
          <Card
            moduleTitle="RGPD // TELEMETRY_GUARD"
            moduleMeta={analyticsAllowed ? "OPT-IN" : "CNIL_LOCK"}
            activeIndicator={analyticsAllowed}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 font-mono text-xs">
                <span className="text-neutral-600">
                  Clé session :{" "}
                  <code className="text-brand-black font-bold">
                    openhub_vst_telemetry
                  </code>
                </span>
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    analyticsAllowed
                      ? "bg-brand-red text-brand-white"
                      : "bg-brand-pearl text-neutral-600 border border-neutral-200"
                  }`}
                >
                  {analyticsAllowed ? `SESSION: ${sessionTelemetryCount}` : "BLOQUÉ (CNIL)"}
                </span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Conformément aux directives CNIL, aucun compteur de téléchargement
                n&apos;est écrit en{" "}
                <code className="font-mono text-[11px]">sessionStorage</code> tant que
                vous n&apos;avez pas explicitement autorisé les métriques anonymes.
              </p>
              <Button
                variant="clinical"
                size="sm"
                onClick={openCookieSettingsModal}
                className="min-h-[40px] w-full"
              >
                GÉRER LE CONSENTEMENT ANALYTICS (RGPD)
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Changelog & Avis DSP Communautaires */}
      <section
        aria-labelledby="changelog-heading"
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0"
      >
        <Card
          moduleTitle="CHANGELOG // RELEASES"
          moduleMeta={plugin.version}
          className="lg:col-span-6 min-w-0"
        >
          <div className="space-y-4">
            <h2
              id="changelog-heading"
              className="font-mono text-sm font-bold uppercase text-brand-black"
            >
              Historique des versions
            </h2>
            <div className="space-y-4">
              {plugin.changelog.map((release) => (
                <div
                  key={release.version}
                  className="border-l-4 border-brand-red pl-3.5 space-y-1.5"
                >
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                    <span className="font-bold text-brand-black">
                      {release.version}
                    </span>
                    <span className="text-neutral-500">{release.date}</span>
                  </div>
                  <ul className="space-y-1 text-sm text-neutral-700 list-disc pl-4">
                    {release.notes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card
          moduleTitle="COMMUNITY // DSP_REVIEWS"
          moduleMeta={`${reviews.length} RETOURS`}
          className="lg:col-span-6 min-w-0"
        >
          <div className="space-y-4">
            <h2 className="font-mono text-sm font-bold uppercase text-brand-black">
              Retours techniques des ingénieurs audio
            </h2>
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3.5 rounded-xl bg-brand-pearl/70 border border-neutral-200 flex items-start gap-3 min-w-0"
                >
                  <AvatarBD
                    name={rev.author}
                    expression={rev.expression}
                    size="md"
                    badgeText={rev.badge}
                  />
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                      <span className="font-bold text-brand-black truncate">
                        {rev.author}
                      </span>
                      <span className="text-brand-red font-bold">{rev.rating}</span>
                    </div>
                    <div className="font-mono text-[10px] text-neutral-500">
                      {rev.daw}
                    </div>
                    <p className="text-xs sm:text-sm text-brand-charcoal leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

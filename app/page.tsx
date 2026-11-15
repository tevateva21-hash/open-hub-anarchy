"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AvatarBD } from "@/components/ui/AvatarBD";
import { useAuth } from "@/components/auth/AuthContext";
import {
  ANARCHY_VST_PLUGINS,
  type AvatarExpression,
} from "@/lib/openhub-data";

type VstDrawer = "ANARCHY_VSTSPLUGIN" | "COMMUNITY_VST";

interface CommunityVstSubmission {
  id: string;
  name: string;
  format: "VST" | "VST3" | "VST + VST3";
  os: string;
  description: string;
  authorPseudo: string;
  authorExpression: AvatarExpression;
  mode: "GITHUB" | "FILE";
  githubUrl?: string;
  fileName?: string;
  fileSizeLabel?: string;
  fileDownloadUrl?: string;
  createdAt: string;
}

const COMMUNITY_VST_STORAGE_KEY = "openhub_community_vst_v1";

/**
 * Page d'accueil `/` — VST Hub :
 * - Tiroir 1 : Plugins PsyLab synchronisés avec `tevateva21-hash/vstsplugin`
 * - Tiroir 2 : VST Communauté (dépôt par lien GitHub ou fichier `.vst` / `.vst3`)
 */
export default function HomePage() {
  const { user, openAuthModal } = useAuth();
  const [activeDrawer, setActiveDrawer] =
    useState<VstDrawer>("ANARCHY_VSTSPLUGIN");

  // État synchro GitHub `tevateva21-hash/vstsplugin`
  const [latestBuildUrl, setLatestBuildUrl] = useState<string>(
    "https://github.com/tevateva21-hash/vstsplugin/actions/runs/43568347316"
  );
  const [latestCommitMsg, setLatestCommitMsg] = useState<string | null>(null);
  const [isSyncingGitHub, setIsSyncingGitHub] = useState(false);

  // Dépôts communautaires
  const [communityVsts, setCommunityVsts] = useState<CommunityVstSubmission[]>(
    []
  );
  const [showVstForm, setShowVstForm] = useState(false);
  const [submitMode, setSubmitMode] = useState<"GITHUB" | "FILE">("GITHUB");
  const [vstName, setVstName] = useState("");
  const [vstFormat, setVstFormat] = useState<"VST" | "VST3" | "VST + VST3">(
    "VST3"
  );
  const [vstOs, setVstOs] = useState("Windows / macOS");
  const [vstDesc, setVstDesc] = useState("");
  const [vstGithubUrl, setVstGithubUrl] = useState("");
  const [vstFileName, setVstFileName] = useState("");
  const [vstFileSizeLabel, setVstFileSizeLabel] = useState("");
  const [vstFileUrl, setVstFileUrl] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);

  const syncVstsPluginRepo = async () => {
    setIsSyncingGitHub(true);
    try {
      const res = await fetch("/api/vst/sync", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as {
          latestBuildUrl?: string;
          latestBuildCommit?: string | null;
        };
        if (data.latestBuildUrl) setLatestBuildUrl(data.latestBuildUrl);
        if (data.latestBuildCommit) setLatestCommitMsg(data.latestBuildCommit);
      }
    } catch {
      // ignore
    } finally {
      setIsSyncingGitHub(false);
    }
  };

  useEffect(() => {
    void syncVstsPluginRepo();
    try {
      const raw = window.localStorage.getItem(COMMUNITY_VST_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CommunityVstSubmission[];
        if (Array.isArray(parsed)) setCommunityVsts(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const persistCommunityVsts = (next: CommunityVstSubmission[]) => {
    setCommunityVsts(next);
    try {
      const serializable = next.map((item) => ({
        ...item,
        fileDownloadUrl: undefined,
      }));
      window.localStorage.setItem(
        COMMUNITY_VST_STORAGE_KEY,
        JSON.stringify(serializable)
      );
    } catch {
      // ignore
    }
  };

  const handleOpenVstForm = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setActiveDrawer("COMMUNITY_VST");
    setShowVstForm((prev) => !prev);
  };

  const handleSubmitCommunityVst = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }

    const cleanName = vstName.trim();
    if (!cleanName) {
      setFormError("Le nom du plugin VST est obligatoire.");
      return;
    }

    if (submitMode === "GITHUB") {
      const cleanUrl = vstGithubUrl.trim();
      if (!cleanUrl || !cleanUrl.startsWith("http")) {
        setFormError("Veuillez saisir une URL GitHub valide (https://...).");
        return;
      }
    } else if (!vstFileName) {
      setFormError(
        "Veuillez sélectionner un fichier .vst, .vst3 ou une archive .zip."
      );
      return;
    }

    const created: CommunityVstSubmission = {
      id: `vst-comm-${Date.now()}`,
      name: cleanName,
      format: vstFormat,
      os: vstOs.trim() || "Windows / macOS",
      description:
        vstDesc.trim() ||
        `Plugin ${vstFormat} partagé par @${user.pseudo}.`,
      authorPseudo: user.pseudo,
      authorExpression: user.expression,
      mode: submitMode,
      githubUrl: submitMode === "GITHUB" ? vstGithubUrl.trim() : undefined,
      fileName: submitMode === "FILE" ? vstFileName : undefined,
      fileSizeLabel: submitMode === "FILE" ? vstFileSizeLabel : undefined,
      fileDownloadUrl: submitMode === "FILE" ? vstFileUrl : undefined,
      createdAt: new Date().toLocaleDateString("fr-FR"),
    };

    persistCommunityVsts([created, ...communityVsts]);
    setVstName("");
    setVstDesc("");
    setVstGithubUrl("");
    setVstFileName("");
    setVstFileSizeLabel("");
    setVstFileUrl(undefined);
    setFormError(null);
    setShowVstForm(false);
  };

  return (
    <div className="space-y-8">
      <section aria-labelledby="vst-hub-heading">
        <Card
          moduleTitle="VST_HUB // OPEN_SOURCE_AUDIO_PLUGINS"
          moduleMeta="VST · VST3 · GITHUB & DÉPÔT DIRECT"
          activeIndicator
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 font-mono text-xs text-brand-red font-bold uppercase">
                <span>{"// JUCE 8 · VST / VST3 · COMMUNAUTÉ"}</span>
              </div>
              <h1
                id="vst-hub-heading"
                className="font-sans text-2xl sm:text-4xl font-bold tracking-tight text-brand-black"
              >
                Open Hub — Plugins VST
              </h1>
              <p className="font-sans text-sm sm:text-base text-neutral-600 leading-relaxed">
                Retrouvez les plugins développés sur{" "}
                <a
                  href="https://github.com/tevateva21-hash/vstsplugin"
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono font-bold text-brand-red underline underline-offset-4"
                >
                  tevateva21-hash/vstsplugin
                </a>{" "}
                et déposez vos propres plugins au format{" "}
                <strong>VST / VST3</strong> ou via votre page GitHub.
              </p>
              {latestCommitMsg && (
                <div className="font-mono text-[11px] text-neutral-500 truncate">
                  Dernier build GitHub : {latestCommitMsg}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Button
                id="btn-sync-vstsplugin"
                variant="clinical"
                size="md"
                onClick={() => void syncVstsPluginRepo()}
                disabled={isSyncingGitHub}
              >
                {isSyncingGitHub ? "↻ SYNCHRO..." : "↻ SYNCHRONISER GITHUB"}
              </Button>
              <Button
                id="btn-toggle-vst-upload"
                variant="primary"
                size="md"
                onClick={handleOpenVstForm}
              >
                {user
                  ? showVstForm
                    ? "✕ FERMER FORMULAIRE"
                    : "+ DÉPOSER UN VST"
                  : "CONNEXION POUR DÉPOSER"}
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Petits tiroirs VST Anarchy / VST Communauté */}
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <button
          id="tab-vst-anarchy"
          type="button"
          onClick={() => setActiveDrawer("ANARCHY_VSTSPLUGIN")}
          className={`px-4 py-2 rounded-lg border-2 font-bold transition-all ${
            activeDrawer === "ANARCHY_VSTSPLUGIN"
              ? "bg-brand-red text-white border-black shadow-comic-sm"
              : "bg-brand-white text-brand-charcoal border-neutral-300 hover:border-black"
          }`}
        >
          ⚡ VST ANARCHY ({ANARCHY_VST_PLUGINS.length})
        </button>
        <button
          id="tab-vst-community"
          type="button"
          onClick={() => setActiveDrawer("COMMUNITY_VST")}
          className={`px-4 py-2 rounded-lg border-2 font-bold transition-all ${
            activeDrawer === "COMMUNITY_VST"
              ? "bg-black text-white border-black shadow-comic-sm"
              : "bg-brand-white text-brand-charcoal border-neutral-300 hover:border-black"
          }`}
        >
          🧩 VST COMMUNAUTÉ ({communityVsts.length})
        </button>
      </div>

      {activeDrawer === "ANARCHY_VSTSPLUGIN" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {ANARCHY_VST_PLUGINS.map((plugin) => (
            <Card
              key={plugin.id}
              moduleTitle={`PSYLAB // ${plugin.code}`}
              moduleMeta={plugin.formats.join(" · ")}
              activeIndicator
            >
              <div className="flex flex-col h-full justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <AvatarBD
                        name={plugin.code}
                        expression={plugin.avatarExpression}
                        size="md"
                        badgeText="VST3"
                      />
                      <div>
                        <h2 className="font-sans text-lg font-bold text-brand-black leading-tight">
                          {plugin.name}
                        </h2>
                        <div className="font-mono text-[11px] text-neutral-500">
                          {plugin.formats.join(" · ")} · {plugin.version}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-200 flex flex-wrap items-center gap-2">
                  <Link href={`/vst/${plugin.id}`}>
                    <Button variant="primary" size="sm">
                      ÉMULATEUR DAW →
                    </Button>
                  </Link>
                  <a href={latestBuildUrl} target="_blank" rel="noreferrer">
                    <Button variant="comic" size="sm">
                      ⬇ BUILD .VST3
                    </Button>
                  </a>
                  {plugin.repoUrl && (
                    <a
                      href={plugin.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[11px] font-bold text-neutral-600 hover:text-brand-red underline ml-auto"
                    >
                      GitHub ↗
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {showVstForm && user && (
            <Card
              moduleTitle="NEW_COMMUNITY_VST // GITHUB_OU_FICHIER_VST"
              moduleMeta={`PAR @${user.pseudo.toUpperCase()}`}
              activeIndicator
            >
              <form onSubmit={handleSubmitCommunityVst} className="space-y-4">
                <div className="flex flex-wrap gap-2 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setSubmitMode("GITHUB")}
                    className={`px-3 py-1.5 rounded border-2 font-bold ${
                      submitMode === "GITHUB"
                        ? "bg-brand-black text-white border-black"
                        : "bg-brand-pearl text-brand-charcoal border-neutral-300"
                    }`}
                  >
                    🔗 RELIER UNE PAGE GITHUB
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubmitMode("FILE")}
                    className={`px-3 py-1.5 rounded border-2 font-bold ${
                      submitMode === "FILE"
                        ? "bg-brand-red text-white border-black"
                        : "bg-brand-pearl text-brand-charcoal border-neutral-300"
                    }`}
                  >
                    📦 DÉPOSER UN FICHIER (.VST / .VST3)
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="vst-comm-name"
                      className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                    >
                      Nom du plugin *
                    </label>
                    <input
                      id="vst-comm-name"
                      type="text"
                      value={vstName}
                      onChange={(e) => setVstName(e.target.value)}
                      placeholder="Ex: Acid Filter MK2"
                      className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="vst-comm-format"
                      className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                    >
                      Format
                    </label>
                    <select
                      id="vst-comm-format"
                      value={vstFormat}
                      onChange={(e) =>
                        setVstFormat(
                          e.target.value as "VST" | "VST3" | "VST + VST3"
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs font-bold"
                    >
                      <option value="VST3">VST3</option>
                      <option value="VST">VST (VST2)</option>
                      <option value="VST + VST3">VST + VST3</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="vst-comm-os"
                      className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                    >
                      Systèmes (OS)
                    </label>
                    <input
                      id="vst-comm-os"
                      type="text"
                      value={vstOs}
                      onChange={(e) => setVstOs(e.target.value)}
                      placeholder="Windows / macOS / Linux"
                      className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                    />
                  </div>
                </div>

                {submitMode === "GITHUB" ? (
                  <div>
                    <label
                      htmlFor="vst-comm-github"
                      className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                    >
                      Lien du dépôt ou release GitHub *
                    </label>
                    <input
                      id="vst-comm-github"
                      type="url"
                      value={vstGithubUrl}
                      onChange={(e) => setVstGithubUrl(e.target.value)}
                      placeholder="https://github.com/mon-pseudo/mon-plugin-vst"
                      className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                    />
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor="vst-comm-file"
                      className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                    >
                      Fichier plugin (.vst, .vst3, .zip) *
                    </label>
                    <input
                      id="vst-comm-file"
                      type="file"
                      accept=".vst,.vst3,.zip,.tar.gz"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setVstFileName(file.name);
                        setVstFileSizeLabel(
                          `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                        );
                        setVstFileUrl(URL.createObjectURL(file));
                        if (!vstName) {
                          setVstName(
                            file.name.replace(/\.(vst3|vst|zip)$/i, "")
                          );
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-pearl font-mono text-xs"
                    />
                    {vstFileName && (
                      <div className="mt-1 font-mono text-[11px] text-brand-black">
                        Sélectionné : <strong>{vstFileName}</strong> (
                        {vstFileSizeLabel})
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="vst-comm-desc"
                    className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                  >
                    Description / Notice rapide
                  </label>
                  <textarea
                    id="vst-comm-desc"
                    rows={2}
                    value={vstDesc}
                    onChange={(e) => setVstDesc(e.target.value)}
                    placeholder="Décrivez votre VST (effets, synthé, instructions d'installation)..."
                    className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-sans text-sm"
                  />
                </div>

                {formError && (
                  <p className="font-mono text-xs font-bold text-brand-red">
                    ⚠ {formError}
                  </p>
                )}

                <Button type="submit" variant="primary" size="md">
                  PUBLIER SUR VST COMMUNAUTÉ →
                </Button>
              </form>
            </Card>
          )}

          {communityVsts.length === 0 ? (
            <Card
              moduleTitle="VST_COMMUNAUTÉ // DÉPÔTS_LIBRES"
              moduleMeta="0 PLUGIN"
            >
              <div className="py-8 text-center space-y-3">
                <p className="font-sans text-base font-semibold text-brand-black">
                  Aucun plugin communautaire déposé pour l&apos;instant.
                </p>
                <p className="font-sans text-sm text-neutral-600">
                  Reliez votre page GitHub ou déposez directement votre fichier
                  au format <strong>.vst</strong> / <strong>.vst3</strong>.
                </p>
                <Button
                  variant="comic"
                  size="md"
                  onClick={handleOpenVstForm}
                >
                  + DÉPOSER UN PLUGIN VST
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {communityVsts.map((item) => (
                <Card
                  key={item.id}
                  moduleTitle={`COMMUNAUTÉ // ${item.format}`}
                  moduleMeta={`@${item.authorPseudo.toUpperCase()} · ${item.createdAt}`}
                  activeIndicator
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <AvatarBD
                        name={item.authorPseudo}
                        expression={item.authorExpression}
                        size="md"
                        badgeText={item.format}
                      />
                      <div>
                        <h2 className="font-sans text-lg font-bold text-brand-black">
                          {item.name}
                        </h2>
                        <div className="font-mono text-[11px] text-neutral-500">
                          {item.os} • par @{item.authorPseudo}
                        </div>
                      </div>
                    </div>

                    <p className="font-sans text-sm text-neutral-700 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="pt-3 border-t border-neutral-200 flex flex-wrap items-center gap-2">
                      {item.mode === "GITHUB" && item.githubUrl && (
                        <a
                          href={item.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button variant="primary" size="sm">
                            OUVRIR GITHUB ↗
                          </Button>
                        </a>
                      )}
                      {item.mode === "FILE" && item.fileDownloadUrl && (
                        <a
                          href={item.fileDownloadUrl}
                          download={item.fileName}
                        >
                          <Button variant="comic" size="sm">
                            ⬇ TÉLÉCHARGER {item.fileName}
                          </Button>
                        </a>
                      )}
                      {item.mode === "FILE" && !item.fileDownloadUrl && (
                        <span className="font-mono text-[11px] text-neutral-500">
                          Fichier : {item.fileName} ({item.fileSizeLabel})
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

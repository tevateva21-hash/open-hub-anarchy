"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AvatarBD } from "@/components/ui/AvatarBD";
import { useAudioPlayer } from "@/components/audio/AudioPlayerContext";
import { useAuth } from "@/components/auth/AuthContext";
import {
  SAMPLE_TRACKS,
  sampleToAudioTrack,
  type AvatarExpression,
  type SampleTrack,
} from "@/lib/openhub-data";

type SamplesDrawer =
  | "ANARCHY_OFFICIAL"
  | "COMMUNITY_SAMPLES"
  | "VST_PRESETS";

type VstPresetCategory =
  | "Serum"
  | "Vital"
  | "PsyLab (Eclipse/Helios/Prism)"
  | "Massive / Phase Plant"
  | "À préciser";

interface VstPresetItem {
  id: string;
  name: string;
  vstCategory: VstPresetCategory;
  customVstName?: string;
  description: string;
  fileName?: string;
  fileUrl?: string;
  authorPseudo: string;
  authorExpression: AvatarExpression;
  likes: number;
  createdAt: string;
}

const VST_PRESETS_STORAGE_KEY = "openhub_vst_presets_v1";

const VST_PRESET_CATEGORIES: VstPresetCategory[] = [
  "Serum",
  "Vital",
  "PsyLab (Eclipse/Helios/Prism)",
  "Massive / Phase Plant",
  "À préciser",
];

/**
 * Page `/samples` — Avec 3 tiroirs :
 * 1. Packs Anarchy (Officiels)
 * 2. Samples Communauté
 * 3. Presets VST (Serum, Vital, PsyLab, Massive/Phase Plant, ou À préciser)
 */
export default function SamplesPage() {
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();
  const { user, openAuthModal } = useAuth();

  const [activeDrawer, setActiveDrawer] =
    useState<SamplesDrawer>("COMMUNITY_SAMPLES");
  const [samples, setSamples] = useState<SampleTrack[]>(SAMPLE_TRACKS);
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [showForm, setShowForm] = useState(false);

  // Formulaire Sample
  const [title, setTitle] = useState("");
  const [packName, setPackName] = useState("");
  const [bpm, setBpm] = useState(130);
  const [musicalKey, setMusicalKey] = useState("C Minor");
  const [genre, setGenre] = useState<SampleTrack["genre"]>("INDUSTRIAL");
  const [license, setLicense] = useState<SampleTrack["license"]>("CC0 1.0");
  const [error, setError] = useState<string | null>(null);

  // Presets VST (Serum, Vital, À préciser...)
  const [presets, setPresets] = useState<VstPresetItem[]>([]);
  const [presetFilter, setPresetFilter] = useState<string>("ALL");
  const [showPresetForm, setShowPresetForm] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [presetCategory, setPresetCategory] =
    useState<VstPresetCategory>("Serum");
  const [presetCustomVst, setPresetCustomVst] = useState("");
  const [presetDesc, setPresetDesc] = useState("");
  const [presetFileName, setPresetFileName] = useState("");
  const [presetFileUrl, setPresetFileUrl] = useState<string | undefined>(
    undefined
  );
  const [presetError, setPresetError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(VST_PRESETS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as VstPresetItem[];
        if (Array.isArray(parsed)) setPresets(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const persistPresets = (next: VstPresetItem[]) => {
    setPresets(next);
    try {
      const serializable = next.map((p) => ({ ...p, fileUrl: undefined }));
      window.localStorage.setItem(
        VST_PRESETS_STORAGE_KEY,
        JSON.stringify(serializable)
      );
    } catch {
      // ignore
    }
  };

  const handleOpenForm = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    if (activeDrawer === "VST_PRESETS") {
      setShowPresetForm((prev) => !prev);
      setShowForm(false);
    } else {
      setShowForm((prev) => !prev);
      setShowPresetForm(false);
    }
  };

  const handleSubmitSample = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    const cleanTitle = title.trim();
    const cleanPack = packName.trim() || "COMMUNITY PACK";

    if (!cleanTitle) {
      setError("Veuillez saisir un nom de fichier ou de sample.");
      return;
    }

    const nextSample: SampleTrack = {
      id: `smp-comm-${Date.now()}`,
      title: cleanTitle.endsWith(".wav") ? cleanTitle : `${cleanTitle}.wav`,
      packName: cleanPack,
      genre,
      bpm: Number(bpm) || 130,
      key: musicalKey.trim() || "C Minor",
      durationSec: 60,
      sampleRate: "48.0 kHz / 24-BIT",
      license,
      fileSizeMb: 12.0,
      author: user.pseudo,
      avatarExpression: user.expression,
      waveformPeaks: [
        0.4, 0.8, 0.6, 0.9, 0.5, 0.7, 0.85, 0.45, 0.75, 0.95, 0.65, 0.5, 0.8,
        0.7, 0.55, 0.35,
      ],
      synthProfile: {
        baseFreq: 98,
        tempoBpm: Number(bpm) || 130,
        pattern: [1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1],
        timbre: "acid",
      },
    };

    setSamples((prev) => [nextSample, ...prev]);
    setLikesMap((prev) => ({ ...prev, [nextSample.id]: 1 }));
    setTitle("");
    setPackName("");
    setError(null);
    setShowForm(false);
  };

  const handleSubmitPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    const cleanName = presetName.trim();
    if (!cleanName) {
      setPresetError("Veuillez saisir un nom pour votre preset.");
      return;
    }
    if (presetCategory === "À préciser" && !presetCustomVst.trim()) {
      setPresetError("Veuillez préciser le nom du VST cible.");
      return;
    }

    const created: VstPresetItem = {
      id: `preset-${Date.now()}`,
      name: cleanName,
      vstCategory: presetCategory,
      customVstName:
        presetCategory === "À préciser" ? presetCustomVst.trim() : undefined,
      description:
        presetDesc.trim() ||
        `Preset ${presetCategory === "À préciser" ? presetCustomVst.trim() : presetCategory} partagé par @${user.pseudo}.`,
      fileName: presetFileName || undefined,
      fileUrl: presetFileUrl,
      authorPseudo: user.pseudo,
      authorExpression: user.expression,
      likes: 1,
      createdAt: new Date().toLocaleDateString("fr-FR"),
    };

    persistPresets([created, ...presets]);
    setPresetName("");
    setPresetCustomVst("");
    setPresetDesc("");
    setPresetFileName("");
    setPresetFileUrl(undefined);
    setPresetError(null);
    setShowPresetForm(false);
  };

  const filteredPresets = presets.filter((p) =>
    presetFilter === "ALL" ? true : p.vstCategory === presetFilter
  );

  return (
    <div className="space-y-6">
      <Card
        moduleTitle="SAMPLES_&_PRESETS_HUB // PARTAGE_COMMUNAUTAIRE"
        moduleMeta={`${samples.length} SAMPLE(S) · ${presets.length} PRESET(S)`}
        activeIndicator
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="font-mono text-xs font-bold uppercase text-brand-red">
              {"// 48.0 kHz · 24-BIT · PRESETS SERUM / VITAL / PSYLAB"}
            </div>
            <h1 className="font-sans text-2xl sm:text-3xl font-bold text-brand-black">
              Banque de Samples &amp; Presets VST
            </h1>
            <p className="font-sans text-sm text-neutral-600">
              Partagez vos stems, packs libres de droits et presets de synthés
              (Serum, Vital, PsyLab ou autre VST à préciser).
            </p>
          </div>

          <Button
            id="btn-toggle-sample-form"
            variant="primary"
            size="md"
            onClick={handleOpenForm}
          >
            {user
              ? activeDrawer === "VST_PRESETS"
                ? showPresetForm
                  ? "✕ FERMER"
                  : "+ AJOUTER UN PRESET"
                : showForm
                  ? "✕ FERMER"
                  : "+ AJOUTER UN SAMPLE"
              : "CONNEXION POUR AJOUTER"}
          </Button>
        </div>
      </Card>

      {/* Petits tiroirs Samples Anarchy / Samples Communauté / Presets VST */}
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <button
          type="button"
          onClick={() => setActiveDrawer("ANARCHY_OFFICIAL")}
          className={`px-4 py-2 rounded-lg border-2 font-bold transition-all ${
            activeDrawer === "ANARCHY_OFFICIAL"
              ? "bg-brand-red text-white border-black shadow-comic-sm"
              : "bg-brand-white text-brand-charcoal border-neutral-300 hover:border-black"
          }`}
        >
          ⚡ PACKS ANARCHY (OFFICIELS)
        </button>
        <button
          type="button"
          onClick={() => setActiveDrawer("COMMUNITY_SAMPLES")}
          className={`px-4 py-2 rounded-lg border-2 font-bold transition-all ${
            activeDrawer === "COMMUNITY_SAMPLES"
              ? "bg-black text-white border-black shadow-comic-sm"
              : "bg-brand-white text-brand-charcoal border-neutral-300 hover:border-black"
          }`}
        >
          🎛 SAMPLES COMMUNAUTÉ ({samples.length})
        </button>
        <button
          id="tab-vst-presets"
          type="button"
          onClick={() => setActiveDrawer("VST_PRESETS")}
          className={`px-4 py-2 rounded-lg border-2 font-bold transition-all ${
            activeDrawer === "VST_PRESETS"
              ? "bg-brand-red text-white border-black shadow-comic-sm"
              : "bg-brand-white text-brand-charcoal border-neutral-300 hover:border-black"
          }`}
        >
          🎹 PRESETS VST ({presets.length})
        </button>
      </div>

      {/* Formulaire Sample */}
      {showForm && user && activeDrawer !== "VST_PRESETS" && (
        <Card
          moduleTitle={`SUBMIT_SAMPLE // @${user.pseudo.toUpperCase()}`}
          moduleMeta="COMMUNAUTÉ"
          activeIndicator
        >
          <form onSubmit={handleSubmitSample} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="smp-title"
                  className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                >
                  Nom du sample (.wav)
                </label>
                <input
                  id="smp-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: kick-acid-136.wav"
                  className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                />
              </div>

              <div>
                <label
                  htmlFor="smp-pack"
                  className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                >
                  Pack / Collection
                </label>
                <input
                  id="smp-pack"
                  type="text"
                  value={packName}
                  onChange={(e) => setPackName(e.target.value)}
                  placeholder="Ex: ANARCHY PACK 01"
                  className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label
                  htmlFor="smp-genre"
                  className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                >
                  Genre
                </label>
                <select
                  id="smp-genre"
                  value={genre}
                  onChange={(e) =>
                    setGenre(e.target.value as SampleTrack["genre"])
                  }
                  className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                >
                  <option value="INDUSTRIAL">INDUSTRIAL</option>
                  <option value="TRIBAL_CORE">TRIBAL_CORE</option>
                  <option value="PSYCHEDELIC">PSYCHEDELIC</option>
                  <option value="CYBER_TRAP">CYBER_TRAP</option>
                  <option value="SYNTHWAVE">SYNTHWAVE</option>
                  <option value="GLITCH_BASS">GLITCH_BASS</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="smp-bpm"
                  className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                >
                  BPM
                </label>
                <input
                  id="smp-bpm"
                  type="number"
                  min={40}
                  max={240}
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                />
              </div>

              <div>
                <label
                  htmlFor="smp-key"
                  className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                >
                  Tonalité
                </label>
                <input
                  id="smp-key"
                  type="text"
                  value={musicalKey}
                  onChange={(e) => setMusicalKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                />
              </div>

              <div>
                <label
                  htmlFor="smp-license"
                  className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                >
                  Licence
                </label>
                <select
                  id="smp-license"
                  value={license}
                  onChange={(e) =>
                    setLicense(e.target.value as SampleTrack["license"])
                  }
                  className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                >
                  <option value="CC0 1.0">CC0 1.0</option>
                  <option value="CC-BY 4.0">CC-BY 4.0</option>
                </select>
              </div>
            </div>

            {error && (
              <p role="alert" className="font-mono text-xs font-bold text-brand-red">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="clinical"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                ANNULER
              </Button>
              <Button type="submit" variant="primary" size="md">
                PUBLIER LE SAMPLE
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Formulaire Preset VST (Serum, Vital, À préciser...) */}
      {showPresetForm && user && activeDrawer === "VST_PRESETS" && (
        <Card
          moduleTitle={`SUBMIT_VST_PRESET // @${user.pseudo.toUpperCase()}`}
          moduleMeta="SERUM · VITAL · AUTRE"
          activeIndicator
        >
          <form onSubmit={handleSubmitPreset} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="preset-name"
                  className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                >
                  Nom du Preset *
                </label>
                <input
                  id="preset-name"
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Ex: Psy Acid Lead 01"
                  className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                />
              </div>

              <div>
                <label
                  htmlFor="preset-vst-cat"
                  className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                >
                  Catégorie VST *
                </label>
                <select
                  id="preset-vst-cat"
                  value={presetCategory}
                  onChange={(e) =>
                    setPresetCategory(e.target.value as VstPresetCategory)
                  }
                  className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs font-bold"
                >
                  {VST_PRESET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {presetCategory === "À préciser" && (
              <div>
                <label
                  htmlFor="preset-custom-vst"
                  className="block font-mono text-[11px] font-bold uppercase text-brand-red mb-1"
                >
                  Préciser le nom du VST / Synthé *
                </label>
                <input
                  id="preset-custom-vst"
                  type="text"
                  value={presetCustomVst}
                  onChange={(e) => setPresetCustomVst(e.target.value)}
                  placeholder="Ex: Diva, Pigments, Spire, Sylenth1..."
                  className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="preset-file"
                  className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                >
                  Fichier Preset (.fxp, .vital, .vstpreset, .zip)
                </label>
                <input
                  id="preset-file"
                  type="file"
                  accept=".fxp,.vital,.nmsv,.vstpreset,.zip"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setPresetFileName(file.name);
                    setPresetFileUrl(URL.createObjectURL(file));
                  }}
                  className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-pearl font-mono text-xs"
                />
              </div>

              <div>
                <label
                  htmlFor="preset-desc"
                  className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                >
                  Description / Usage
                </label>
                <input
                  id="preset-desc"
                  type="text"
                  value={presetDesc}
                  onChange={(e) => setPresetDesc(e.target.value)}
                  placeholder="Ex: Basse psytrance roll 138 BPM"
                  className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                />
              </div>
            </div>

            {presetError && (
              <p className="font-mono text-xs font-bold text-brand-red">
                ⚠ {presetError}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="clinical"
                size="sm"
                onClick={() => setShowPresetForm(false)}
              >
                ANNULER
              </Button>
              <Button type="submit" variant="primary" size="md">
                PUBLIER LE PRESET
              </Button>
            </div>
          </form>
        </Card>
      )}

      {activeDrawer === "ANARCHY_OFFICIAL" ? (
        <Card moduleTitle="PACKS_ANARCHY // OFFICIELS" moduleMeta="0 PACK">
          <div className="py-8 text-center space-y-2">
            <p className="font-sans text-base font-semibold text-brand-black">
              Aucun pack officiel Anarchy publié pour l&apos;instant.
            </p>
            <p className="font-sans text-sm text-neutral-600">
              Vos prochains packs officiels apparaîtront ici.
            </p>
          </div>
        </Card>
      ) : activeDrawer === "VST_PRESETS" ? (
        <div className="space-y-4">
          {/* Filtres par catégorie de VST */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <button
              type="button"
              onClick={() => setPresetFilter("ALL")}
              className={`px-3 py-1 rounded border font-bold ${
                presetFilter === "ALL"
                  ? "bg-brand-black text-white border-black"
                  : "bg-brand-pearl text-brand-charcoal border-neutral-300"
              }`}
            >
              TOUS ({presets.length})
            </button>
            {VST_PRESET_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setPresetFilter(cat)}
                className={`px-3 py-1 rounded border font-bold ${
                  presetFilter === cat
                    ? "bg-brand-red text-white border-black"
                    : "bg-brand-pearl text-brand-charcoal border-neutral-300"
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          {filteredPresets.length === 0 ? (
            <Card
              moduleTitle="PRESETS_VST // SERUM · VITAL · À PRÉCISER"
              moduleMeta="0 PRESET"
            >
              <div className="py-8 text-center space-y-3">
                <p className="font-sans text-base font-semibold text-brand-black">
                  Aucun preset VST publié dans cette catégorie pour l&apos;instant.
                </p>
                <p className="font-sans text-sm text-neutral-600">
                  Déposez vos presets pour <strong>Serum</strong>,{" "}
                  <strong>Vital</strong>, <strong>PsyLab</strong> ou tout
                  autre VST (<strong>À préciser</strong>).
                </p>
                <Button variant="comic" size="md" onClick={handleOpenForm}>
                  + AJOUTER UN PRESET VST
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPresets.map((p) => {
                const vstLabel =
                  p.vstCategory === "À préciser" && p.customVstName
                    ? p.customVstName
                    : p.vstCategory;
                return (
                  <Card
                    key={p.id}
                    moduleTitle={`PRESET // ${vstLabel.toUpperCase()}`}
                    moduleMeta={`@${p.authorPseudo.toUpperCase()} · ${p.createdAt}`}
                    activeIndicator
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <AvatarBD
                          name={p.authorPseudo}
                          expression={p.authorExpression}
                          size="sm"
                          badgeText="FXP"
                        />
                        <div className="min-w-0">
                          <h2 className="font-mono text-sm font-bold text-brand-black truncate">
                            {p.name}
                          </h2>
                          <div className="font-sans text-xs text-neutral-600 truncate">
                            {p.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            persistPresets(
                              presets.map((item) =>
                                item.id === p.id
                                  ? { ...item, likes: item.likes + 1 }
                                  : item
                              )
                            )
                          }
                          className="px-2.5 py-1 rounded border-2 border-black bg-brand-pearl font-mono text-xs font-bold"
                        >
                          ▲ {p.likes}
                        </button>
                        {p.fileUrl && (
                          <a href={p.fileUrl} download={p.fileName}>
                            <Button variant="comic" size="sm">
                              ⬇ {p.fileName}
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : samples.length === 0 ? (
        <Card moduleTitle="BANQUE_SAMPLES // VIDE" moduleMeta="0 FICHIER">
          <div className="py-8 text-center space-y-3">
            <p className="font-sans text-base font-semibold text-brand-black">
              Aucun sample communautaire publié pour l&apos;instant.
            </p>
            <p className="font-sans text-sm text-neutral-600">
              Connectez-vous puis cliquez sur{" "}
              <strong>+ AJOUTER UN SAMPLE</strong> pour commencer à remplir la
              banque.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...samples]
            .sort((a, b) => (likesMap[b.id] ?? 0) - (likesMap[a.id] ?? 0))
            .map((smp) => {
              const track = sampleToAudioTrack(smp);
              const active = currentTrack?.id === track.id && isPlaying;
              const likes = likesMap[smp.id] ?? 0;
              return (
                <Card
                  key={smp.id}
                  moduleTitle={smp.packName}
                  moduleMeta={`${smp.bpm} BPM • ${smp.key}`}
                  activeIndicator={active}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <AvatarBD
                        name={smp.author}
                        expression={smp.avatarExpression}
                        size="sm"
                        badgeText={smp.license}
                      />
                      <div>
                        <h2 className="font-mono text-sm font-bold text-brand-black">
                          {smp.title}
                        </h2>
                        <div className="font-mono text-[11px] text-neutral-500">
                          @{smp.author} • {smp.genre} • {smp.sampleRate}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setLikesMap((prev) => ({
                            ...prev,
                            [smp.id]: (prev[smp.id] ?? 0) + 1,
                          }))
                        }
                        className="px-2.5 py-1 rounded border-2 border-black bg-brand-pearl font-mono text-xs font-bold"
                      >
                        ▲ {likes}
                      </button>
                      <Button
                        variant={active ? "primary" : "comic"}
                        size="sm"
                        onClick={() => playTrack(track)}
                      >
                        {active ? "❚❚ PAUSE" : "▶ ÉCOUTER"}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
}

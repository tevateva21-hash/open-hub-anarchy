"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type {
  ExtraGeometry3DKind,
  PaletteId,
  Scene3DConfig,
  SceneId,
} from "@/lib/visual-engine/contracts";
import {
  AI_SCENE_PACK_PROMPT,
  DEFAULT_SCENE_PACKS,
  DEFAULT_SCRIPT_3D_TEMPLATE,
  createDefaultScene3DConfig,
  exportScenePackAsJson,
  generateRandomScenePack,
  parseScenePackFromText,
  sanitizeScenePackSlot,
  type ScenePack,
  type ScenePackSlot,
} from "@/lib/visual-engine/scene-packs";
import {
  SCENE_CATALOG,
  STUDY_PALETTES,
  validateScript3D,
} from "@/lib/visual-engine/renderer";

export const PACKS_STORAGE_KEY = "openhub_visual_scene_packs_v3";
export const ACTIVE_PACK_ID_KEY = "openhub_active_pack_id_v3";

interface ScenePackManagerProps {
  authorName: string;
  liveSlotIndex: number;
  bpm: number;
  beatsPerScene: number;
  onChangeBeatsPerScene?: (beats: number) => void;
  onPackChange: (pack: ScenePack) => void;
  onSelectSlot: (
    slotIndex: number,
    slot: ScenePackSlot,
    pack: ScenePack
  ) => void;
}

type EditorTab = "controls" | "script3d" | "json";

const EXTRA_GEOMETRY_LABELS: Record<ExtraGeometry3DKind, string> = {
  none: "Aucun objet additionnel",
  "katana-blades": "Lames / Piliers Katana 3D",
  "floating-monoliths": "Monolithes 3D en lévitation",
  "octo-rings": "Anneaux Octogonaux 3D",
  "cyber-pyramids": "Pyramides / Obélisques 3D",
};

const SCRIPT_3D_PRESETS: Array<{ label: string; code: string }> = [
  {
    label: "Torii Dojo Néon 3D",
    code: `function customizeScene3D(scene3d, audio, t) {
  const h = 2.0 + audio.bass * 1.2;
  scene3d.addBox3D(-3.2, -0.5, 6.4, 0.5, h, 0.5, 0.72, audio.flux > 0.28, true, t * 0.25);
  scene3d.addBox3D(3.2, -0.5, 6.4, 0.5, h, 0.5, 0.72, audio.flux > 0.28, true, -t * 0.25);
  scene3d.addBox3D(0, 1.2 + audio.bass * 0.3, 6.4, 7.2, 0.34, 0.45, 0.86, true, false, 0);
}`,
  },
  {
    label: "Totem Dragon Double Pyramide 3D",
    code: `function customizeScene3D(scene3d, audio, t) {
  const spin = t * 1.25;
  const r = 0.8 + audio.bass * 0.45;
  scene3d.addPyramid3D(0, 0.25 + Math.sin(t * 2.2) * 0.3, 5.8, r, 1.8, 0.88, true, false, spin);
  scene3d.addPyramid3D(0, -0.35 - Math.sin(t * 2.2) * 0.2, 5.8, r * 0.85, 1.4, 0.66, true, true, -spin);
}`,
  },
  {
    label: "Tunnel Anneaux Vortex 3D",
    code: `function customizeScene3D(scene3d, audio, t) {
  const pulse = 1 + audio.bass * 0.5;
  scene3d.addRing3D(4.2, 1.75 * pulse, 0.5, 8, t * 1.5, 0.88, true);
  scene3d.addRing3D(6.6, 2.2 * pulse, 0.55, 8, -t * 1.2, 0.68, audio.treble > 0.3);
}`,
  },
  {
    label: "Satellites Brutalistes 3D",
    code: `function customizeScene3D(scene3d, audio, t) {
  for (let i = 0; i < 4; i++) {
    const a = t * 0.95 + (i * Math.PI) / 2;
    scene3d.addBox3D(
      Math.cos(a) * 3.1,
      0.6 + Math.sin(t * 2 + i) * 0.4,
      5.6 + Math.sin(a) * 1.8,
      0.55,
      0.95 + audio.bass * 0.7,
      0.55,
      0.8,
      true,
      true,
      a
    );
  }
}`,
  },
];

export const ScenePackManager: React.FC<ScenePackManagerProps> = ({
  authorName,
  liveSlotIndex,
  bpm,
  beatsPerScene,
  onChangeBeatsPerScene,
  onPackChange,
  onSelectSlot,
}) => {
  const [packs, setPacks] = useState<ScenePack[]>(DEFAULT_SCENE_PACKS);
  const [selectedPackId, setSelectedPackId] = useState<string>(
    DEFAULT_SCENE_PACKS[0].id
  );
  const [customPackName, setCustomPackName] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");

  // Éditeur 3D en direct de la scène active
  const [showSceneEditor, setShowSceneEditor] = useState<boolean>(false);
  const [editorTab, setEditorTab] = useState<EditorTab>("controls");
  const [sceneJsonDraft, setSceneJsonDraft] = useState<string>("");
  const [sceneJsonError, setSceneJsonError] = useState<string>("");

  // Modales Export/Import Pack 3D & Documentation/Prompt IA
  const [showImportExportModal, setShowImportExportModal] =
    useState<boolean>(false);
  const [showDocModal, setShowDocModal] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>("");
  const [importPackName, setImportPackName] = useState<string>("");
  const [importPackAuthor, setImportPackAuthor] = useState<string>("");
  const [importError, setImportError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PACKS_STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as ScenePack[];
        if (Array.isArray(stored) && stored.length > 0) {
          const sanitizedPacks = stored.map((p) => ({
            ...p,
            scenes: (p.scenes || []).map((s, idx) =>
              sanitizeScenePackSlot(
                s as unknown as Record<string, unknown>,
                idx
              )
            ),
          }));
          const storedIds = new Set(sanitizedPacks.map((p) => p.id));
          const merged = [
            ...sanitizedPacks,
            ...DEFAULT_SCENE_PACKS.filter((d) => !storedIds.has(d.id)),
          ];
          setPacks(merged);
        }
      }
      const savedActiveId = window.localStorage.getItem(ACTIVE_PACK_ID_KEY);
      if (savedActiveId) {
        setSelectedPackId(savedActiveId);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const currentPack =
    packs.find((p) => p.id === selectedPackId) ?? packs[0];

  const safeSlotIndex =
    currentPack.scenes.length > 0
      ? Math.max(0, Math.min(currentPack.scenes.length - 1, liveSlotIndex))
      : 0;
  const activeSlot: ScenePackSlot =
    currentPack.scenes[safeSlotIndex] ?? currentPack.scenes[0];

  useEffect(() => {
    onPackChange(currentPack);
    try {
      window.localStorage.setItem(ACTIVE_PACK_ID_KEY, currentPack.id);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPack]);

  useEffect(() => {
    if (activeSlot && editorTab === "json") {
      setSceneJsonDraft(JSON.stringify(activeSlot, null, 2));
      setSceneJsonError("");
    }
  }, [activeSlot, safeSlotIndex, currentPack.id, editorTab]);

  const persistPacks = (nextPacks: ScenePack[]) => {
    setPacks(nextPacks);
    try {
      window.localStorage.setItem(PACKS_STORAGE_KEY, JSON.stringify(nextPacks));
    } catch {
      // ignore
    }
  };

  const updateCurrentPack = (updater: (pack: ScenePack) => ScenePack) => {
    const nextPacks = packs.map((p) =>
      p.id === currentPack.id ? updater(p) : p
    );
    persistPacks(nextPacks);
    const updated = nextPacks.find((p) => p.id === currentPack.id);
    if (updated) {
      onPackChange(updated);
    }
  };

  const updateActiveSlot = (
    updater: (slot: ScenePackSlot) => ScenePackSlot
  ) => {
    updateCurrentPack((pack) => {
      const nextScenes = pack.scenes.map((s, idx) =>
        idx === safeSlotIndex ? updater(s) : s
      );
      const nextPack = { ...pack, scenes: nextScenes };
      onSelectSlot(safeSlotIndex, nextScenes[safeSlotIndex], nextPack);
      return nextPack;
    });
  };

  const updateActiveConfig3D = (
    updater: (cfg: Scene3DConfig) => Scene3DConfig
  ) => {
    updateActiveSlot((slot) => ({
      ...slot,
      config3d: updater(
        slot.config3d ?? createDefaultScene3DConfig(slot.sceneId)
      ),
    }));
  };

  const handleGenerateNewPack = () => {
    const generated = generateRandomScenePack(
      authorName,
      customPackName,
      bpm,
      beatsPerScene > 0 ? beatsPerScene : 16,
      5
    );
    const next = [generated, ...packs];
    persistPacks(next);
    setSelectedPackId(generated.id);
    onPackChange(generated);
    onSelectSlot(0, generated.scenes[0], generated);
    setCustomPackName("");
    setFeedback(
      `Nouveau Pack 3D généré : "${generated.name}" (seed ${generated.seed}) — Faders & BPM intacts.`
    );
  };

  const handleDuplicatePack = () => {
    const copy: ScenePack = {
      ...currentPack,
      id: `pack-copy-${Date.now()}`,
      name: `${currentPack.name} (Copie)`,
      createdAt: new Date().toISOString(),
      scenes: currentPack.scenes.map((s) => ({
        ...s,
        config3d: JSON.parse(JSON.stringify(s.config3d)),
      })),
    };
    const next = [copy, ...packs];
    persistPacks(next);
    setSelectedPackId(copy.id);
    onPackChange(copy);
    onSelectSlot(0, copy.scenes[0], copy);
    setFeedback(`Pack 3D dupliqué sous "${copy.name}".`);
  };

  const handleAddSceneSlot = () => {
    updateCurrentPack((pack) => {
      const idx = pack.scenes.length;
      const baseSceneId: SceneId =
        SCENE_CATALOG[idx % SCENE_CATALOG.length]?.id ?? "rave-dungeon";
      const basePaletteId: PaletteId =
        STUDY_PALETTES[idx % STUDY_PALETTES.length]?.id ?? "anarchy-anaglyph";
      const newSlot: ScenePackSlot = {
        label: `0${idx + 1}. ${
          SCENE_CATALOG.find((s) => s.id === baseSceneId)?.name ?? "Scène 3D"
        }`,
        sceneId: baseSceneId,
        paletteId: basePaletteId,
        intensity: 85,
        strobe: 30,
        kaleidoscope: 35,
        feedbackTrails: 45,
        acidHueShift: 20,
        bloom: 50,
        glitch: 20,
        seed: (idx + 1) * 173,
        config3d: createDefaultScene3DConfig(baseSceneId),
        script3d: DEFAULT_SCRIPT_3D_TEMPLATE,
      };
      const nextScenes = [...pack.scenes, newSlot];
      const nextPack = { ...pack, scenes: nextScenes };
      onSelectSlot(nextScenes.length - 1, newSlot, nextPack);
      return nextPack;
    });
    setFeedback("Nouvelle scène 3D ajoutée au pack.");
  };

  const handleDuplicateSceneSlot = () => {
    if (!activeSlot) return;
    updateCurrentPack((pack) => {
      const copySlot: ScenePackSlot = {
        ...activeSlot,
        label: `${activeSlot.label || `Scène ${safeSlotIndex + 1}`} (Copie)`,
        config3d: JSON.parse(JSON.stringify(activeSlot.config3d)),
      };
      const nextScenes = [
        ...pack.scenes.slice(0, safeSlotIndex + 1),
        copySlot,
        ...pack.scenes.slice(safeSlotIndex + 1),
      ];
      const nextPack = { ...pack, scenes: nextScenes };
      onSelectSlot(safeSlotIndex + 1, copySlot, nextPack);
      return nextPack;
    });
    setFeedback("Scène 3D dupliquée.");
  };

  const handleDeleteSceneSlot = () => {
    if (currentPack.scenes.length <= 1) {
      setFeedback("Un pack 3D doit conserver au moins 1 scène.");
      return;
    }
    updateCurrentPack((pack) => {
      const nextScenes = pack.scenes.filter((_, idx) => idx !== safeSlotIndex);
      const nextIdx = Math.max(0, safeSlotIndex - 1);
      const nextPack = { ...pack, scenes: nextScenes };
      onSelectSlot(nextIdx, nextScenes[nextIdx], nextPack);
      return nextPack;
    });
    setFeedback("Scène 3D retirée du pack.");
  };

  const handleApplySceneJsonDraft = () => {
    try {
      const parsed = JSON.parse(sceneJsonDraft) as Record<string, unknown>;
      const sanitized = sanitizeScenePackSlot(parsed, safeSlotIndex);
      updateActiveSlot(() => sanitized);
      setSceneJsonError("");
      setFeedback(
        `Configuration 3D JSON appliquée en direct sur "${sanitized.label}".`
      );
    } catch (err) {
      setSceneJsonError(
        err instanceof Error ? err.message : "JSON de scène 3D invalide."
      );
    }
  };

  const handleDownloadPackJson = () => {
    const json = exportScenePackAsJson(currentPack);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const slug = currentPack.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    a.download = `${slug || "anarchy-pack-3d"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setFeedback(`Pack 3D "${currentPack.name}" téléchargé en JSON.`);
  };

  const handleImportPackJson = () => {
    const parsed = parseScenePackFromText(
      importJsonText,
      importPackAuthor.trim() || authorName || "Communauté",
      importPackName.trim() || undefined
    );
    if (!parsed) {
      setImportError(
        "JSON invalide. Colle un objet JSON de Pack 3D (avec un tableau scenes[]) ou d'une Scène 3D."
      );
      return;
    }
    const next = [parsed, ...packs];
    persistPacks(next);
    setSelectedPackId(parsed.id);
    onPackChange(parsed);
    onSelectSlot(0, parsed.scenes[0], parsed);
    setImportError("");
    setImportJsonText("");
    setImportPackName("");
    setShowImportExportModal(false);
    setFeedback(
      `Pack 3D "${parsed.name}" (${parsed.scenes.length} scènes) importé et activé — Faders & BPM conservés.`
    );
  };

  const scriptValidation = useMemo(
    () => validateScript3D(activeSlot?.script3d),
    [activeSlot?.script3d]
  );

  const cfg3d =
    activeSlot?.config3d ??
    createDefaultScene3DConfig(activeSlot?.sceneId ?? "rave-dungeon");

  return (
    <Card
      moduleTitle="PACK DE SCÈNES // ENCHAÎNEMENT BPM (MOTEUR 3D PS2 / LOW-POLY)"
      moduleMeta={`${currentPack.name} · ${currentPack.scenes.length} SCÈNES 3D · SEED ${currentPack.seed}`}
      activeIndicator
    >
      <div className="space-y-3.5">
        {/* Barre principale : Sélecteur Pack 3D + Génération + Éditeur 3D + Export/Import JSON */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Choisir un pack de scènes 3D"
              value={currentPack.id}
              onChange={(e) => {
                const found = packs.find((p) => p.id === e.target.value);
                if (found) {
                  // ISOLATION STRICTE : changer de Pack 3D ne modifie aucun fader ni le BPM
                  setSelectedPackId(found.id);
                  onPackChange(found);
                  onSelectSlot(0, found.scenes[0], found);
                  setFeedback(
                    `Pack 3D "${found.name}" chargé (Faders & BPM intacts).`
                  );
                }
              }}
              className="px-2.5 py-1.5 rounded border-2 border-black bg-brand-white font-mono text-xs font-bold"
            >
              {packs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.scenes.length} scènes)
                </option>
              ))}
            </select>

            <input
              type="text"
              value={customPackName}
              onChange={(e) => setCustomPackName(e.target.value)}
              placeholder="Nom optionnel..."
              className="w-36 px-2 py-1.5 rounded border border-neutral-400 bg-brand-white font-mono text-[11px]"
            />

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleGenerateNewPack}
            >
              🎲 GÉNÉRER UN PACK 3D
            </Button>

            <button
              type="button"
              onClick={handleDuplicatePack}
              className="px-2.5 py-1.5 rounded border-2 border-black bg-brand-pearl hover:bg-brand-white font-mono text-[11px] font-bold"
              title="Dupliquer ce pack 3D pour le modifier librement"
            >
              ⎘ Dupliquer Pack
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={showSceneEditor ? "comic" : "clinical"}
              size="sm"
              onClick={() => setShowSceneEditor((v) => !v)}
            >
              {showSceneEditor
                ? "✕ FERMER ÉDITEUR 3D"
                : "🎛 ÉDITER SCÈNE 3D (JSON / JS 3D)"}
            </Button>

            <Button
              type="button"
              variant="comic"
              size="sm"
              onClick={() => {
                setImportError("");
                setShowImportExportModal(true);
              }}
            >
              ⇄ EXPORTER / IMPORTER PACK 3D (JSON)
            </Button>

            <Button
              type="button"
              variant="clinical"
              size="sm"
              onClick={() => setShowDocModal(true)}
            >
              📖 DOC &amp; PROMPT IA 3D
            </Button>
          </div>
        </div>

        {/* Pastilles des Scènes 3D + Cadence BPM (2 ou 4 mesures) + Ajout/Suppression de Scène */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-brand-pearl border-2 border-black">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[10px] font-bold uppercase text-neutral-600 mr-1">
              SCÈNES 3D :
            </span>
            {currentPack.scenes.map((slot, idx) => {
              const isActive = safeSlotIndex === idx;
              return (
                <button
                  key={`${currentPack.id}-pill-${idx}`}
                  type="button"
                  onClick={() => onSelectSlot(idx, slot, currentPack)}
                  title={`${slot.label || `Scène ${idx + 1}`} (${slot.sceneId} · ${slot.paletteId})`}
                  className={`px-3 py-1 rounded-full border-2 font-mono text-[11px] font-bold transition-all ${
                    isActive
                      ? "border-black bg-brand-red text-white shadow-comic-sm scale-105"
                      : "border-black bg-brand-white hover:bg-brand-pearl text-brand-black"
                  }`}
                >
                  {slot.label || `0${idx + 1}. Scène 3D`}
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleAddSceneSlot}
              className="px-2.5 py-1 rounded-full border-2 border-dashed border-black bg-brand-white hover:bg-brand-pearl font-mono text-[11px] font-bold text-brand-black"
              title="Ajouter une nouvelle scène 3D au pack"
            >
              + Scène 3D
            </button>
          </div>

          {onChangeBeatsPerScene && (
            <div className="flex items-center gap-1 font-mono text-[10px]">
              <span className="font-bold text-neutral-600 uppercase mr-1">
                CADENCE ({bpm} BPM) :
              </span>
              {[
                { beats: 8, label: "2 Mesures (8T)" },
                { beats: 16, label: "4 Mesures (16T)" },
                { beats: 0, label: "Manuel 🔒" },
              ].map((opt) => (
                <button
                  key={opt.beats}
                  type="button"
                  onClick={() => onChangeBeatsPerScene(opt.beats)}
                  className={`px-2 py-0.5 rounded border font-bold ${
                    beatsPerScene === opt.beats
                      ? "bg-brand-black text-white border-black"
                      : "bg-brand-white text-brand-black border-neutral-300 hover:border-black"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ÉDITEUR EN DIRECT DE LA SCÈNE 3D ACTIVE (CONFIG 3D / SCRIPT 3D / JSON) */}
        {showSceneEditor && activeSlot && (
          <div className="p-4 rounded-xl border-2 border-black bg-brand-white space-y-4 font-mono text-xs shadow-comic-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-brand-red text-white text-[10px] font-bold uppercase">
                  SCÈNE 3D #{safeSlotIndex + 1}
                </span>
                <input
                  type="text"
                  aria-label="Nom de la scène 3D"
                  value={activeSlot.label ?? ""}
                  onChange={(e) =>
                    updateActiveSlot((s) => ({ ...s, label: e.target.value }))
                  }
                  className="px-2.5 py-1 rounded border-2 border-black bg-brand-pearl font-bold text-xs"
                />
                <button
                  type="button"
                  onClick={handleDuplicateSceneSlot}
                  className="px-2 py-1 rounded border border-black bg-brand-pearl hover:bg-brand-white text-[10px] font-bold"
                >
                  ⎘ Dupliquer Scène
                </button>
                {currentPack.scenes.length > 1 && (
                  <button
                    type="button"
                    onClick={handleDeleteSceneSlot}
                    className="px-2 py-1 rounded border border-brand-red text-brand-red hover:bg-red-50 text-[10px] font-bold"
                  >
                    ✕ Supprimer Scène
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1">
                {(
                  [
                    ["controls", "🎛 Paramètres 3D & Audio"],
                    ["script3d", "⚡ Script 3D Live (JS 60 FPS)"],
                    ["json", "{ } Config JSON 3D"],
                  ] as const
                ).map(([tabId, label]) => (
                  <button
                    key={tabId}
                    type="button"
                    onClick={() => setEditorTab(tabId)}
                    className={`px-2.5 py-1 rounded border-2 text-[11px] font-bold transition-all ${
                      editorTab === tabId
                        ? "bg-brand-black text-white border-black"
                        : "bg-brand-pearl text-brand-black border-neutral-300 hover:border-black"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* ONGLET 1 : CONTRÔLES 3D INTERACTIFS */}
            {editorTab === "controls" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Colonne 1 : Monde 3D, Palette & Géométries 3D */}
                <div className="p-3 rounded-lg bg-brand-pearl border border-neutral-300 space-y-2.5">
                  <div className="font-bold text-[11px] uppercase text-brand-red">
                    1. Monde &amp; Géométries 3D
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-600 mb-0.5">
                      Architecture 3D de base (sceneId)
                    </label>
                    <select
                      value={activeSlot.sceneId}
                      onChange={(e) => {
                        const nextSceneId = e.target.value as SceneId;
                        updateActiveSlot((s) => ({
                          ...s,
                          sceneId: nextSceneId,
                        }));
                      }}
                      className="w-full px-2 py-1 rounded border border-black bg-brand-white font-bold text-[11px]"
                    >
                      {SCENE_CATALOG.map((sc) => (
                        <option key={sc.id} value={sc.id}>
                          {sc.index}. {sc.name} ({sc.badge})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-600 mb-0.5">
                      Palette 3D de la scène (paletteId)
                    </label>
                    <select
                      value={activeSlot.paletteId}
                      onChange={(e) =>
                        updateActiveSlot((s) => ({
                          ...s,
                          paletteId: e.target.value as PaletteId,
                        }))
                      }
                      className="w-full px-2 py-1 rounded border border-black bg-brand-white font-bold text-[11px]"
                    >
                      {STUDY_PALETTES.map((pal) => (
                        <option key={pal.id} value={pal.id}>
                          {pal.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-600 mb-0.5">
                      Objets 3D Low-Poly additionnels
                    </label>
                    <select
                      value={cfg3d.geometries.extraObjects}
                      onChange={(e) =>
                        updateActiveConfig3D((c) => ({
                          ...c,
                          geometries: {
                            ...c.geometries,
                            extraObjects: e.target.value as ExtraGeometry3DKind,
                          },
                        }))
                      }
                      className="w-full px-2 py-1 rounded border border-black bg-brand-white font-bold text-[11px]"
                    >
                      {(
                        Object.keys(
                          EXTRA_GEOMETRY_LABELS
                        ) as ExtraGeometry3DKind[]
                      ).map((k) => (
                        <option key={k} value={k}>
                          {EXTRA_GEOMETRY_LABELS[k]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex justify-between text-[10px]">
                        <span>Échelle Piliers</span>
                        <strong>{cfg3d.geometries.monolithScale.toFixed(2)}×</strong>
                      </div>
                      <input
                        type="range"
                        min={0.4}
                        max={2.2}
                        step={0.05}
                        value={cfg3d.geometries.monolithScale}
                        onChange={(e) =>
                          updateActiveConfig3D((c) => ({
                            ...c,
                            geometries: {
                              ...c.geometries,
                              monolithScale: Number(e.target.value),
                            },
                          }))
                        }
                        className="w-full accent-brand-red"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px]">
                        <span>Échelle Noyau</span>
                        <strong>{cfg3d.geometries.coreScale.toFixed(2)}×</strong>
                      </div>
                      <input
                        type="range"
                        min={0.4}
                        max={2.2}
                        step={0.05}
                        value={cfg3d.geometries.coreScale}
                        onChange={(e) =>
                          updateActiveConfig3D((c) => ({
                            ...c,
                            geometries: {
                              ...c.geometries,
                              coreScale: Number(e.target.value),
                            },
                          }))
                        }
                        className="w-full accent-brand-red"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <label className="inline-flex items-center gap-1.5 text-[11px] font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cfg3d.geometries.wireframeRim}
                        onChange={(e) =>
                          updateActiveConfig3D((c) => ({
                            ...c,
                            geometries: {
                              ...c.geometries,
                              wireframeRim: e.target.checked,
                            },
                          }))
                        }
                        className="accent-brand-red"
                      />
                      <span>Arêtes Néon 3D</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-[11px] font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cfg3d.geometries.checkerTexture}
                        onChange={(e) =>
                          updateActiveConfig3D((c) => ({
                            ...c,
                            geometries: {
                              ...c.geometries,
                              checkerTexture: e.target.checked,
                            },
                          }))
                        }
                        className="accent-brand-red"
                      />
                      <span>Damier PS2</span>
                    </label>
                  </div>
                </div>

                {/* Colonne 2 : Caméra Perspective 3D, Environnement & Brouillard */}
                <div className="p-3 rounded-lg bg-brand-pearl border border-neutral-300 space-y-2.5">
                  <div className="font-bold text-[11px] uppercase text-brand-red">
                    2. Caméra 3D, Terrain &amp; Brouillard
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex justify-between text-[10px]">
                        <span>Distance Cam</span>
                        <strong>{cfg3d.camera.distance.toFixed(1)}</strong>
                      </div>
                      <input
                        type="range"
                        min={3.2}
                        max={14}
                        step={0.2}
                        value={cfg3d.camera.distance}
                        onChange={(e) =>
                          updateActiveConfig3D((c) => ({
                            ...c,
                            camera: {
                              ...c.camera,
                              distance: Number(e.target.value),
                            },
                          }))
                        }
                        className="w-full accent-brand-red"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px]">
                        <span>FOV 3D</span>
                        <strong>{cfg3d.camera.fovDegrees}°</strong>
                      </div>
                      <input
                        type="range"
                        min={45}
                        max={105}
                        step={1}
                        value={cfg3d.camera.fovDegrees}
                        onChange={(e) =>
                          updateActiveConfig3D((c) => ({
                            ...c,
                            camera: {
                              ...c.camera,
                              fovDegrees: Number(e.target.value),
                            },
                          }))
                        }
                        className="w-full accent-brand-red"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex justify-between text-[10px]">
                        <span>Inclinaison (Pitch)</span>
                        <strong>{cfg3d.camera.pitchDegrees}°</strong>
                      </div>
                      <input
                        type="range"
                        min={-20}
                        max={30}
                        step={1}
                        value={cfg3d.camera.pitchDegrees}
                        onChange={(e) =>
                          updateActiveConfig3D((c) => ({
                            ...c,
                            camera: {
                              ...c.camera,
                              pitchDegrees: Number(e.target.value),
                            },
                          }))
                        }
                        className="w-full accent-brand-red"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px]">
                        <span>Angle (Yaw)</span>
                        <strong>{cfg3d.camera.yawDegrees}°</strong>
                      </div>
                      <input
                        type="range"
                        min={-40}
                        max={40}
                        step={1}
                        value={cfg3d.camera.yawDegrees}
                        onChange={(e) =>
                          updateActiveConfig3D((c) => ({
                            ...c,
                            camera: {
                              ...c.camera,
                              yawDegrees: Number(e.target.value),
                            },
                          }))
                        }
                        className="w-full accent-brand-red"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex justify-between text-[10px]">
                        <span>Vitesse Tunnel</span>
                        <strong>{cfg3d.environment.tunnelSpeed.toFixed(1)}×</strong>
                      </div>
                      <input
                        type="range"
                        min={0.3}
                        max={3.2}
                        step={0.1}
                        value={cfg3d.environment.tunnelSpeed}
                        onChange={(e) =>
                          updateActiveConfig3D((c) => ({
                            ...c,
                            environment: {
                              ...c.environment,
                              tunnelSpeed: Number(e.target.value),
                            },
                          }))
                        }
                        className="w-full accent-brand-red"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px]">
                        <span>Brouillard 3D</span>
                        <strong>{Math.round(cfg3d.lighting.fogDensity * 100)}%</strong>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={cfg3d.lighting.fogDensity}
                        onChange={(e) =>
                          updateActiveConfig3D((c) => ({
                            ...c,
                            lighting: {
                              ...c.lighting,
                              fogDensity: Number(e.target.value),
                            },
                          }))
                        }
                        className="w-full accent-brand-red"
                      />
                    </div>
                  </div>
                </div>

                {/* Colonne 3 : Réactivité Audio 3D (Bass, Mid, Treble, Flux) */}
                <div className="p-3 rounded-lg bg-brand-pearl border border-neutral-300 space-y-2.5">
                  <div className="font-bold text-[11px] uppercase text-brand-red">
                    3. Réactivité Audio 3D (Bass / Mid / Treble / Flux)
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px]">
                      <span>Impact Basses (Kick 3D Pulse)</span>
                      <strong>{cfg3d.audioReactive.bassPulse.toFixed(2)}×</strong>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={2.4}
                      step={0.05}
                      value={cfg3d.audioReactive.bassPulse}
                      onChange={(e) =>
                        updateActiveConfig3D((c) => ({
                          ...c,
                          audioReactive: {
                            ...c.audioReactive,
                            bassPulse: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full accent-brand-red"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px]">
                      <span>Médiums (Élévation Piliers &amp; Vortex)</span>
                      <strong>{cfg3d.audioReactive.midMorph.toFixed(2)}×</strong>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={2.4}
                      step={0.05}
                      value={cfg3d.audioReactive.midMorph}
                      onChange={(e) =>
                        updateActiveConfig3D((c) => ({
                          ...c,
                          audioReactive: {
                            ...c.audioReactive,
                            midMorph: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full accent-brand-red"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px]">
                      <span>Aigus (Lasers, Pluie &amp; Strobe)</span>
                      <strong>{cfg3d.audioReactive.trebleStrobe.toFixed(2)}×</strong>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={2.4}
                      step={0.05}
                      value={cfg3d.audioReactive.trebleStrobe}
                      onChange={(e) =>
                        updateActiveConfig3D((c) => ({
                          ...c,
                          audioReactive: {
                            ...c.audioReactive,
                            trebleStrobe: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full accent-brand-red"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px]">
                      <span>Transitoires / Clap (Secousse Caméra 3D)</span>
                      <strong>{cfg3d.audioReactive.fluxJolt.toFixed(2)}×</strong>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={2.4}
                      step={0.05}
                      value={cfg3d.audioReactive.fluxJolt}
                      onChange={(e) =>
                        updateActiveConfig3D((c) => ({
                          ...c,
                          audioReactive: {
                            ...c.audioReactive,
                            fluxJolt: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full accent-brand-red"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ONGLET 2 : SCRIPT 3D LIVE (JS 60 FPS DANS LE MOTEUR 3D PRINCIPAL) */}
            {editorTab === "script3d" && (
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        scriptValidation.ok
                          ? "bg-emerald-100 text-emerald-900 border-emerald-500"
                          : "bg-red-100 text-brand-red border-brand-red"
                      }`}
                    >
                      {scriptValidation.ok
                        ? "✅ SCRIPT 3D ACTIF À 60 FPS"
                        : `⚠ ${scriptValidation.error}`}
                    </span>
                    <span className="text-[11px] text-neutral-600">
                      Injecte des volumes 3D low-poly dans{" "}
                      <code>renderLowPolyMesh</code> (tri Z, brouillard &amp;
                      tramage Bayer 4×4).
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <select
                      aria-label="Charger un exemple de géométrie 3D"
                      value=""
                      onChange={(e) => {
                        const found = SCRIPT_3D_PRESETS.find(
                          (p) => p.label === e.target.value
                        );
                        if (found) {
                          updateActiveSlot((s) => ({
                            ...s,
                            script3d: found.code,
                          }));
                        }
                      }}
                      className="px-2 py-1 rounded border border-black bg-brand-pearl text-[11px] font-bold"
                    >
                      <option value="">⚡ Modèles 3D prêts à l&apos;emploi...</option>
                      {SCRIPT_3D_PRESETS.map((p) => (
                        <option key={p.label} value={p.label}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <textarea
                  rows={8}
                  value={activeSlot.script3d ?? ""}
                  onChange={(e) =>
                    updateActiveSlot((s) => ({
                      ...s,
                      script3d: e.target.value,
                    }))
                  }
                  placeholder={DEFAULT_SCRIPT_3D_TEMPLATE}
                  className="w-full p-3 rounded-lg border-2 border-black bg-[#0D0F14] text-emerald-300 font-mono text-xs leading-relaxed focus:outline-none focus:border-brand-red"
                />

                <div className="text-[10px] text-neutral-500">
                  API 3D :{" "}
                  <code>
                    scene3d.addBox3D(x, y, z, w, h, d, tone, wireRim, checker, rotY)
                  </code>{" "}
                  ·{" "}
                  <code>
                    scene3d.addPyramid3D(x, y, z, radius, height, tone, wireRim, inverted, rotY)
                  </code>{" "}
                  ·{" "}
                  <code>
                    scene3d.addRing3D(z, radius, depth, segments, spinRad, tone, wireRim)
                  </code>
                </div>
              </div>
            )}

            {/* ONGLET 3 : CONFIGURATION JSON 3D COMPLÈTE DE LA SCÈNE */}
            {editorTab === "json" && (
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-neutral-600">
                    Modifie directement l&apos;objet JSON de la scène 3D{" "}
                    <strong>{activeSlot.label}</strong> :
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="clinical"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard
                          ?.writeText(JSON.stringify(activeSlot, null, 2))
                          .then(() =>
                            setFeedback("JSON de la scène 3D copié !")
                          )
                          .catch(() => {});
                      }}
                    >
                      📋 Copier JSON Scène
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleApplySceneJsonDraft}
                    >
                      ✓ Appliquer JSON 3D
                    </Button>
                  </div>
                </div>

                <textarea
                  rows={10}
                  value={sceneJsonDraft}
                  onChange={(e) => setSceneJsonDraft(e.target.value)}
                  className="w-full p-3 rounded-lg border-2 border-black bg-brand-pearl font-mono text-xs"
                />

                {sceneJsonError && (
                  <p className="text-brand-red font-bold text-[11px]">
                    {sceneJsonError}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {feedback && (
          <p className="font-mono text-[11px] font-bold text-brand-red">
            {feedback}
          </p>
        )}

        {/* MODALE EXPORT / IMPORT DE PACK 3D (JSON) */}
        {showImportExportModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Exporter ou Importer un Pack de Scènes 3D"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="w-full max-w-2xl rounded-2xl border-2 border-black bg-brand-white p-5 shadow-comic space-y-4 font-mono text-xs max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <div>
                  <span className="px-2 py-0.5 rounded bg-brand-red text-white text-[10px] font-bold uppercase">
                    PARTAGE &amp; SAUVEGARDE 3D
                  </span>
                  <h3 className="text-base font-bold text-brand-black mt-1">
                    Exporter / Importer un Pack de Scènes 3D (JSON)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowImportExportModal(false)}
                  className="px-2.5 py-1 rounded border-2 border-black bg-brand-pearl font-bold"
                >
                  ✕ FERMER
                </button>
              </div>

              {/* Section Export */}
              <div className="p-3.5 rounded-xl bg-brand-pearl border-2 border-black space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-brand-black uppercase">
                      1. Exporter le Pack 3D actif : {currentPack.name}
                    </div>
                    <div className="text-[11px] text-neutral-600">
                      Contient les {currentPack.scenes.length} scènes 3D, leurs
                      configurations 3D (caméra, géométries, lumière,
                      audio-réactivité) et leurs scripts 3D.
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="comic"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard
                          ?.writeText(exportScenePackAsJson(currentPack))
                          .then(() =>
                            setFeedback(
                              `JSON du Pack 3D "${currentPack.name}" copié dans le presse-papiers !`
                            )
                          )
                          .catch(() => {});
                      }}
                    >
                      📋 Copier le JSON 3D
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleDownloadPackJson}
                    >
                      ⬇ Télécharger .JSON
                    </Button>
                  </div>
                </div>
              </div>

              {/* Section Import */}
              <div className="p-3.5 rounded-xl bg-brand-white border-2 border-black space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold text-brand-black uppercase">
                    2. Importer un nouveau Pack de Scènes 3D (JSON)
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setImportJsonText(exportScenePackAsJson(currentPack))
                      }
                      className="px-2 py-1 rounded border border-black bg-brand-pearl text-[10px] font-bold"
                    >
                      Charger JSON du pack actif comme modèle
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2 py-1 rounded border border-black bg-brand-pearl text-[10px] font-bold"
                    >
                      📂 Charger fichier .json
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,application/json"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = "";
                        if (f) {
                          void f.text().then((txt) => setImportJsonText(txt));
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={importPackName}
                    onChange={(e) => setImportPackName(e.target.value)}
                    placeholder="Nom du Pack 3D (optionnel)"
                    className="px-2.5 py-1.5 rounded border border-black bg-brand-pearl text-xs"
                  />
                  <input
                    type="text"
                    value={importPackAuthor}
                    onChange={(e) => setImportPackAuthor(e.target.value)}
                    placeholder={`Auteur (défaut : ${authorName || "Communauté"})`}
                    className="px-2.5 py-1.5 rounded border border-black bg-brand-pearl text-xs"
                  />
                </div>

                <textarea
                  rows={8}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder='Colle ici le JSON complet d&apos;un Pack 3D ({ "name": "...", "scenes": [ ... ] })'
                  className="w-full p-3 rounded-lg border-2 border-black bg-brand-pearl font-mono text-xs"
                />

                {importError && (
                  <p className="text-brand-red font-bold text-[11px]">
                    {importError}
                  </p>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="clinical"
                    size="sm"
                    onClick={() => setShowImportExportModal(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleImportPackJson}
                  >
                    🚀 Importer &amp; Activer le Pack 3D
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODALE DOCUMENTATION & PROMPT IA PACK 3D */}
        {showDocModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Documentation et Prompt IA Pack 3D"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="w-full max-w-2xl rounded-2xl border-2 border-black bg-brand-white p-5 shadow-comic space-y-4 font-mono text-xs max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <div>
                  <span className="px-2 py-0.5 rounded bg-brand-black text-white text-[10px] font-bold uppercase">
                    GUIDE CRÉATEUR 3D
                  </span>
                  <h3 className="text-base font-bold text-brand-black mt-1">
                    Créer &amp; Générer un Pack de Scènes 3D (JSON / JS 3D)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-2.5 py-1 rounded border-2 border-black bg-brand-pearl font-bold"
                >
                  ✕ FERMER
                </button>
              </div>

              <div className="space-y-2 text-neutral-700 leading-relaxed">
                <p>
                  Chaque Pack 3D contient un <strong>nombre libre de scènes 3D</strong>{" "}
                  (1, 3, 5, 8+) qui s&apos;enchaînent automatiquement toutes les{" "}
                  <strong>2 ou 4 mesures</strong> selon le BPM, sans jamais
                  réinitialiser vos 10 faders.
                </p>
                <p>
                  Chaque scène combine un monde 3D (
                  <code>industrial-city</code>, <code>rave-dungeon</code>,{" "}
                  <code>techno-therapy</code>, <code>ps1-nightmare</code>,{" "}
                  <code>digital-void</code>), un objet{" "}
                  <code>config3d</code> (géométries, caméra perspective,
                  brouillard, réactivité <code>bass/mid/treble/flux</code>) et un
                  script optionnel <code>customizeScene3D(scene3d, audio, t)</code>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-brand-pearl border-2 border-black space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-black uppercase">
                    Prompt IA prêt à copier (ChatGPT / Claude / Gemini)
                  </span>
                  <Button
                    type="button"
                    variant="comic"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard
                        ?.writeText(AI_SCENE_PACK_PROMPT)
                        .then(() =>
                          setFeedback("Prompt IA Pack 3D copié !")
                        )
                        .catch(() => {});
                    }}
                  >
                    📋 Copier le Prompt IA 3D
                  </Button>
                </div>
                <pre className="p-2.5 rounded bg-brand-white border border-neutral-300 text-[10px] whitespace-pre-wrap max-h-56 overflow-y-auto">
                  {AI_SCENE_PACK_PROMPT}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

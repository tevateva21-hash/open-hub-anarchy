"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type {
  Anarchy3DPack,
  Anarchy3DScene,
  AnarchyBassTarget,
  AnarchyCameraMode,
  AnarchyFluxTarget,
  AnarchyMidTarget,
  AnarchySidePropType,
  AnarchySubjectMeshType,
  AnarchyTerrainType,
  AnarchyTrebleTarget,
  PaletteId,
  SceneId,
} from "@/lib/visual-engine/contracts";
import {
  AI_SCENE_PACK_PROMPT,
  AI_STYLE_PRESETS,
  ANARCHY_BASS_TARGETS,
  ANARCHY_CAMERA_MODES,
  ANARCHY_FLUX_TARGETS,
  ANARCHY_MID_TARGETS,
  ANARCHY_PROCEDURAL_PRIMITIVES,
  ANARCHY_SIDE_PROP_TYPES,
  ANARCHY_SUBJECT_MESH_TYPES,
  ANARCHY_TERRAIN_TYPES,
  ANARCHY_TREBLE_TARGETS,
  DEFAULT_SCENE_PACKS,
  JSON_SNIPPETS_3D,
  autoRepairPackJsonSyntax,
  createDefaultAnarchy3DScene,
  exportScenePackAsJson,
  generateAiPackPromptV3,
  generateRandomScenePack,
  parseForgivingPackJSON,
  parseScenePackFromText,
  sanitizeAnarchy3DScene,
  validateAnarchy3DPackJson,
  type ScenePack,
  type ScenePackSlot,
} from "@/lib/visual-engine/scene-packs";
import { POST_FX_REGISTRY } from "@/lib/visual-studio/registry";
import { SCENE_CATALOG, STUDY_PALETTES } from "@/lib/visual-engine/renderer";

export const PACKS_STORAGE_KEY = "openhub_anarchy_3d_packs_v4";
export const ACTIVE_PACK_ID_KEY = "openhub_active_3d_pack_id_v4";
export const FAVORITE_PACKS_STORAGE_KEY = "openhub_favorite_3d_packs_v1";

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

type EditorTab = "pack-json" | "scene-controls";

export const ScenePackManager: React.FC<ScenePackManagerProps> = ({
  authorName,
  liveSlotIndex,
  bpm,
  beatsPerScene,
  onChangeBeatsPerScene,
  onPackChange,
  onSelectSlot,
}) => {
  const [packs, setPacks] = useState<Anarchy3DPack[]>(DEFAULT_SCENE_PACKS);
  const [selectedPackId, setSelectedPackId] = useState<string>(
    DEFAULT_SCENE_PACKS[0].packId
  );
  const [customPackName, setCustomPackName] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");

  // Panneau "Éditer / Voir le JSON" (Validation en temps réel + Inspecteur Visuel)
  const [showJsonEditor, setShowJsonEditor] = useState<boolean>(false);
  const [editorTab, setEditorTab] = useState<EditorTab>("pack-json");
  const [packJsonDraft, setPackJsonDraft] = useState<string>("");
  const [selectedSnippetId, setSelectedSnippetId] = useState<string>(
    JSON_SNIPPETS_3D[0]?.id ?? "horizon-sun"
  );
  const [selectedAiStyleId, setSelectedAiStyleId] = useState<string>(
    AI_STYLE_PRESETS[0]?.id ?? "hotline-miami"
  );
  const [favoritePackIds, setFavoritePackIds] = useState<string[]>([]);

  // Modales Importer/Exporter un Pack & Doc / Générer avec une IA
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
      const rawFavs = window.localStorage.getItem(FAVORITE_PACKS_STORAGE_KEY);
      if (rawFavs) {
        const parsedFavs = JSON.parse(rawFavs) as unknown;
        if (Array.isArray(parsedFavs)) {
          setFavoritePackIds(
            parsedFavs.filter((id): id is string => typeof id === "string")
          );
        }
      }
      const raw = window.localStorage.getItem(PACKS_STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as unknown[];
        if (Array.isArray(stored) && stored.length > 0) {
          const sanitizedPacks: Anarchy3DPack[] = stored
            .map((item) => {
              const validation = validateAnarchy3DPackJson(
                JSON.stringify(item),
                authorName
              );
              return validation.ok ? validation.pack : null;
            })
            .filter((p): p is Anarchy3DPack => p !== null);

          if (sanitizedPacks.length > 0) {
            const storedIds = new Set(sanitizedPacks.map((p) => p.packId));
            const merged = [
              ...sanitizedPacks,
              ...DEFAULT_SCENE_PACKS.filter((d) => !storedIds.has(d.packId)),
            ];
            setPacks(merged);
          }
        }
      }
      const savedActiveId = window.localStorage.getItem(ACTIVE_PACK_ID_KEY);
      if (savedActiveId) {
        setSelectedPackId(savedActiveId);
      }
    } catch {
      // ignore storage errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentPack =
    packs.find((p) => p.packId === selectedPackId) ?? packs[0];

  const safeSlotIndex =
    currentPack.scenes.length > 0
      ? Math.max(0, Math.min(currentPack.scenes.length - 1, liveSlotIndex))
      : 0;
  const activeScene: Anarchy3DScene =
    currentPack.scenes[safeSlotIndex] ?? currentPack.scenes[0];

  useEffect(() => {
    onPackChange(currentPack);
    try {
      window.localStorage.setItem(ACTIVE_PACK_ID_KEY, currentPack.packId);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPack]);

  useEffect(() => {
    setPackJsonDraft(exportScenePackAsJson(currentPack));
  }, [currentPack]);

  const liveDraftValidation = useMemo(
    () => validateAnarchy3DPackJson(packJsonDraft, currentPack.author),
    [packJsonDraft, currentPack.author]
  );

  const liveImportValidation = useMemo(() => {
    if (!importJsonText.trim()) return null;
    return validateAnarchy3DPackJson(
      importJsonText,
      importPackAuthor.trim() || authorName || "Anarchy Studio"
    );
  }, [importJsonText, importPackAuthor, authorName]);

  const persistPacks = (nextPacks: Anarchy3DPack[]) => {
    setPacks(nextPacks);
    try {
      window.localStorage.setItem(PACKS_STORAGE_KEY, JSON.stringify(nextPacks));
    } catch {
      // ignore
    }
  };

  const updateCurrentPack = (
    updater: (pack: Anarchy3DPack) => Anarchy3DPack
  ) => {
    const nextPacks = packs.map((p) =>
      p.packId === currentPack.packId ? updater(p) : p
    );
    persistPacks(nextPacks);
    const updated = nextPacks.find((p) => p.packId === currentPack.packId);
    if (updated) {
      onPackChange(updated);
    }
  };

  const updateActiveScene = (
    updater: (scene: Anarchy3DScene) => Anarchy3DScene
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
    setSelectedPackId(generated.packId);
    onPackChange(generated);
    onSelectSlot(0, generated.scenes[0], generated);
    setCustomPackName("");
    setFeedback(
      `Nouveau Pack 3D JSON généré : "${generated.name}" (${generated.scenes.length} scènes) — Faders & BPM intacts.`
    );
  };

  const handleDuplicatePack = () => {
    const copyId = `${currentPack.packId}-copy-${Date.now().toString().slice(-4)}`;
    const copy: Anarchy3DPack = {
      ...currentPack,
      packId: copyId,
      name: `${currentPack.name} (Copie)`,
      createdAt: new Date().toISOString(),
      scenes: currentPack.scenes.map((s, idx) =>
        sanitizeAnarchy3DScene(
          JSON.parse(JSON.stringify(s)) as Record<string, unknown>,
          idx
        )
      ),
    };
    const next = [copy, ...packs];
    persistPacks(next);
    setSelectedPackId(copy.packId);
    onPackChange(copy);
    onSelectSlot(0, copy.scenes[0], copy);
    setFeedback(`Pack 3D dupliqué sous "${copy.name}".`);
  };

  const handleAddSceneSlot = () => {
    updateCurrentPack((pack) => {
      const idx = pack.scenes.length;
      const newScene = createDefaultAnarchy3DScene(idx);
      const nextScenes = [...pack.scenes, newScene];
      const nextPack = { ...pack, scenes: nextScenes };
      onSelectSlot(nextScenes.length - 1, newScene, nextPack);
      return nextPack;
    });
    setFeedback("Nouvelle scène 3D ajoutée au pack JSON.");
  };

  const handleDuplicateSceneSlot = () => {
    if (!activeScene) return;
    updateCurrentPack((pack) => {
      const copyScene: Anarchy3DScene = {
        ...JSON.parse(JSON.stringify(activeScene)),
        id: `scene-${pack.scenes.length + 1}`,
        name: `${activeScene.name} (Copie)`,
      };
      const nextScenes = [
        ...pack.scenes.slice(0, safeSlotIndex + 1),
        copyScene,
        ...pack.scenes.slice(safeSlotIndex + 1),
      ];
      const nextPack = { ...pack, scenes: nextScenes };
      onSelectSlot(safeSlotIndex + 1, copyScene, nextPack);
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

  const handleApplyPackJsonDraft = () => {
    if (!liveDraftValidation.ok) {
      setFeedback(`Erreur JSON : ${liveDraftValidation.error}`);
      return;
    }
    const validatedPack = liveDraftValidation.pack;
    const nextPacks = packs.map((p) =>
      p.packId === currentPack.packId ? validatedPack : p
    );
    persistPacks(nextPacks);
    setSelectedPackId(validatedPack.packId);
    onPackChange(validatedPack);
    const nextIdx = Math.min(safeSlotIndex, validatedPack.scenes.length - 1);
    onSelectSlot(nextIdx, validatedPack.scenes[nextIdx], validatedPack);
    setFeedback(
      `JSON du Pack 3D "${validatedPack.name}" validé et appliqué (${validatedPack.scenes.length} scènes) — Faders & BPM intacts.`
    );
  };

  const handleDownloadPackJson = () => {
    const json = exportScenePackAsJson(currentPack);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const slug = (currentPack.packId || currentPack.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    a.download = `${slug || "anarchy-pack-3d"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setFeedback(`Pack 3D "${currentPack.name}" téléchargé en .json.`);
  };

  const handleImportPackJson = () => {
    const parsed = parseScenePackFromText(
      importJsonText,
      importPackAuthor.trim() || authorName || "Anarchy Studio",
      importPackName.trim() || undefined
    );
    if (!parsed) {
      setImportError(
        liveImportValidation && !liveImportValidation.ok
          ? liveImportValidation.error
          : "JSON invalide. Colle un objet JSON Anarchy3DPack (avec scenes[]) ou une scène Anarchy3DScene."
      );
      return;
    }
    const existingIndex = packs.findIndex((p) => p.packId === parsed.packId);
    const next =
      existingIndex >= 0
        ? packs.map((p, idx) => (idx === existingIndex ? parsed : p))
        : [parsed, ...packs];
    persistPacks(next);
    setSelectedPackId(parsed.packId);
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

  const handleToggleFavoritePack = () => {
    const isFav = favoritePackIds.includes(currentPack.packId);
    const nextFavs = isFav
      ? favoritePackIds.filter((id) => id !== currentPack.packId)
      : [...favoritePackIds, currentPack.packId];
    setFavoritePackIds(nextFavs);
    try {
      window.localStorage.setItem(
        FAVORITE_PACKS_STORAGE_KEY,
        JSON.stringify(nextFavs)
      );
      persistPacks(packs);
    } catch {
      // ignore storage errors
    }
    setFeedback(
      isFav
        ? `Pack "${currentPack.name}" retiré des favoris.`
        : `★ Pack "${currentPack.name}" sauvegardé dans tes favoris !`
    );
  };

  const handlePrettifyJsonDraft = () => {
    const parsed = parseForgivingPackJSON(packJsonDraft);
    if (!parsed.ok) {
      setFeedback(`Impossible de formater : ${parsed.error}`);
      return;
    }
    setPackJsonDraft(JSON.stringify(parsed.data, null, 2));
    setFeedback("✨ JSON formaté (Prettify).");
  };

  const handleInsertSnippetIntoDraft = () => {
    const snippet = JSON_SNIPPETS_3D.find((s) => s.id === selectedSnippetId);
    if (!snippet) return;
    const parsed = parseForgivingPackJSON(packJsonDraft);
    if (!parsed.ok || !parsed.data || typeof parsed.data !== "object") {
      setFeedback(
        "Corrige d'abord la syntaxe JSON avant d'insérer un Snippet 3D."
      );
      return;
    }
    const root = structuredClone(parsed.data) as Record<string, unknown>;
    const scenesArr = Array.isArray(root.scenes)
      ? (root.scenes as Record<string, unknown>[])
      : null;
    if (!scenesArr || scenesArr.length === 0) {
      setFeedback('Le JSON doit contenir un tableau "scenes" non vide.');
      return;
    }
    const targetIdx = Math.max(0, Math.min(scenesArr.length - 1, safeSlotIndex));
    const targetScene = scenesArr[targetIdx];
    targetScene.version = 3;

    if (snippet.target === "backdrop") {
      const existingLayers = Array.isArray(targetScene.layers)
        ? (targetScene.layers as Record<string, unknown>[])
        : [];
      const withoutBackdrop = existingLayers.filter(
        (l) => l && l.kind !== "backdrop"
      );
      targetScene.layers = [
        structuredClone(snippet.payload) as Record<string, unknown>,
        ...withoutBackdrop,
      ];
    } else {
      const subjectPayload = structuredClone(snippet.payload) as Record<
        string,
        unknown
      >;
      if (Array.isArray(targetScene.layers)) {
        const layers = targetScene.layers as Record<string, unknown>[];
        const subjLayer = layers.find((l) => l && l.kind === "subjects");
        if (subjLayer && Array.isArray(subjLayer.subjects)) {
          (subjLayer.subjects as unknown[]).push(subjectPayload);
        } else {
          layers.push({ kind: "subjects", subjects: [subjectPayload] });
        }
      }
      if (Array.isArray(targetScene.subjects)) {
        (targetScene.subjects as unknown[]).push(subjectPayload);
      } else {
        targetScene.subjects = targetScene.subject
          ? [targetScene.subject, subjectPayload]
          : [subjectPayload];
      }
      if (!targetScene.subject) {
        targetScene.subject = subjectPayload;
      }
    }

    setPackJsonDraft(JSON.stringify(root, null, 2));
    setFeedback(
      `+ Snippet "${snippet.label}" inséré dans la scène #${targetIdx + 1} ! Clique sur "APPLIQUER" pour l'afficher.`
    );
  };

  return (
    <Card
      moduleTitle="PACKS DE SCÈNES 3D"
      moduleMeta={`${currentPack.scenes.length} SCÈNES · ${bpm} BPM`}
      activeIndicator
    >
      <div className="space-y-3">
        {/* Barre d'outils principale : Pack, Création & Édition */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <select
              aria-label="Choisir un pack de scènes 3D"
              value={currentPack.packId}
              onChange={(e) => {
                const found = packs.find((p) => p.packId === e.target.value);
                if (found) {
                  setSelectedPackId(found.packId);
                  onPackChange(found);
                  onSelectSlot(0, found.scenes[0], found);
                  setFeedback(
                    `Pack "${found.name}" chargé.`
                  );
                }
              }}
              className="px-2.5 py-1.5 rounded-lg border-2 border-black bg-brand-white font-mono text-xs font-bold"
            >
              {packs.map((p) => (
                <option key={p.packId} value={p.packId}>
                  {favoritePackIds.includes(p.packId) ? "★ " : ""}
                  {p.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleToggleFavoritePack}
              className={`px-2.5 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all ${
                favoritePackIds.includes(currentPack.packId)
                  ? "border-amber-500 bg-amber-100 text-amber-900"
                  : "border-neutral-300 bg-brand-pearl hover:border-black text-brand-black"
              }`}
              title="Sauvegarder ce pack dans tes favoris"
            >
              {favoritePackIds.includes(currentPack.packId) ? "★ Favori" : "☆ Favori"}
            </button>

            <input
              type="text"
              value={customPackName}
              onChange={(e) => setCustomPackName(e.target.value)}
              placeholder="Nom du pack..."
              className="w-32 px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-brand-white font-mono text-[11px] focus:border-black focus:outline-none"
            />

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleGenerateNewPack}
            >
              🎲 Nouveau Pack
            </Button>

            <button
              type="button"
              onClick={handleDuplicatePack}
              className="px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-brand-pearl hover:border-black font-mono text-[11px] font-bold transition-colors"
              title="Dupliquer ce pack 3D pour le modifier librement"
            >
              ⎘ Dupliquer
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              type="button"
              variant={showJsonEditor ? "comic" : "clinical"}
              size="sm"
              onClick={() => setShowJsonEditor((v) => !v)}
            >
              {showJsonEditor ? "✕ Fermer JSON" : "{ } Éditer JSON"}
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
              ⇄ Import / Export
            </Button>

            <Button
              type="button"
              variant="clinical"
              size="sm"
              onClick={() => setShowDocModal(true)}
            >
              🤖 Doc &amp; IA
            </Button>
          </div>
        </div>

        {/* Piste des Scènes 3D & Cadence BPM */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 rounded-xl bg-brand-pearl border border-neutral-300">
          <div className="flex flex-wrap items-center gap-1.5">
            {currentPack.scenes.map((scene, idx) => {
              const isActive = safeSlotIndex === idx;
              return (
                <button
                  key={`${currentPack.packId}-${scene.id}-${idx}`}
                  type="button"
                  onClick={() => onSelectSlot(idx, scene, currentPack)}
                  title={`${scene.name} — Terrain: ${scene.environment.terrainType} · Sujet: ${scene.subject.meshType} · Caméra: ${scene.camera.mode}`}
                  className={`px-3 py-1 rounded-full border font-mono text-[11px] font-bold transition-all ${
                    isActive
                      ? "border-black bg-brand-red text-white shadow-comic-sm"
                      : "border-neutral-300 bg-brand-white hover:border-black text-brand-black"
                  }`}
                >
                  {scene.name || `0${idx + 1}. Scène 3D`}
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleAddSceneSlot}
              className="px-2.5 py-1 rounded-full border border-dashed border-neutral-400 bg-brand-white hover:border-black font-mono text-[11px] font-bold text-neutral-700 hover:text-brand-black transition-colors"
              title="Ajouter une nouvelle scène 3D au pack"
            >
              + Scène
            </button>
          </div>

          {onChangeBeatsPerScene && (
            <div className="flex items-center gap-1 font-mono text-[10px]">
              <span className="font-bold text-neutral-500 uppercase mr-1">
                Cadence :
              </span>
              {[
                { beats: 8, label: "2 mes. (8T)" },
                { beats: 16, label: "4 mes. (16T)" },
                { beats: 0, label: "Manuel" },
              ].map((opt) => (
                <button
                  key={opt.beats}
                  type="button"
                  onClick={() => onChangeBeatsPerScene(opt.beats)}
                  className={`px-2 py-1 rounded-md border font-bold transition-colors ${
                    beatsPerScene === opt.beats
                      ? "bg-brand-black text-white border-black"
                      : "bg-brand-white text-neutral-700 border-neutral-300 hover:border-black"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Résumé compact & visuel de la scène active */}
        {activeScene && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-brand-white border border-neutral-200 font-mono text-[10px] text-neutral-600">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-brand-black">
                {activeScene.name}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-brand-pearl border border-neutral-200">
                Terrain : <strong className="text-brand-black">{activeScene.environment.terrainType}</strong>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-brand-pearl border border-neutral-200">
                Sujet : <strong className="text-brand-black">{activeScene.subject.meshType}</strong>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-brand-pearl border border-neutral-200">
                Caméra : <strong className="text-brand-black">{activeScene.camera.mode}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block w-3 h-3 rounded-sm border border-neutral-400"
                style={{ backgroundColor: activeScene.environment.skyColor }}
                title={`skyColor: ${activeScene.environment.skyColor}`}
              />
              <span
                className="inline-block w-3 h-3 rounded-sm border border-neutral-400"
                style={{
                  backgroundColor: activeScene.environment.terrainPrimaryColor,
                }}
                title={`terrainPrimaryColor: ${activeScene.environment.terrainPrimaryColor}`}
              />
              <span
                className="inline-block w-3 h-3 rounded-sm border border-neutral-400"
                style={{ backgroundColor: activeScene.subject.primaryColor }}
                title={`subject.primaryColor: ${activeScene.subject.primaryColor}`}
              />
              <span
                className="inline-block w-3 h-3 rounded-sm border border-neutral-400"
                style={{ backgroundColor: activeScene.subject.accentColor }}
                title={`subject.accentColor: ${activeScene.subject.accentColor}`}
              />
            </div>
          </div>
        )}

        {/* PANNEAU : ÉDITER / VOIR LE JSON (ÉDITEUR JSON TEMPS RÉEL + INSPECTEUR VISUEL 3D) */}
        {showJsonEditor && activeScene && (
          <div className="p-4 rounded-xl border-2 border-black bg-brand-white space-y-4 font-mono text-xs shadow-comic-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-brand-red text-white text-[10px] font-bold uppercase">
                  CARTOUCHE 3D JSON // SCÈNE #{safeSlotIndex + 1}
                </span>
                <input
                  type="text"
                  aria-label="Nom de la scène 3D"
                  value={activeScene.name}
                  onChange={(e) =>
                    updateActiveScene((s) => ({ ...s, name: e.target.value }))
                  }
                  className="px-2.5 py-1 rounded border-2 border-black bg-brand-pearl font-bold text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddSceneSlot}
                  className="px-2.5 py-1 rounded border-2 border-black bg-brand-red text-white hover:opacity-90 text-[10px] font-bold"
                >
                  + Ajouter une scène
                </button>
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
                    ["pack-json", "{ } Éditeur JSON du Pack (Validation Live)"],
                    [
                      "scene-controls",
                      "🎛 Inspecteur Visuel 3D (Environment / Subject / Camera / Audio)",
                    ],
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

            {/* ONGLET 1 : ÉDITEUR JSON DU PACK COMPLET AVEC VALIDATION DU SCHÉMA EN TEMPS RÉEL */}
            {editorTab === "pack-json" && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-brand-pearl border border-neutral-300">
                  <div className="text-[11px]">
                    <strong>Schéma JSON `Anarchy3DPack`</strong> (Zéro `eval` /
                    Zéro crash — fallback automatique sur chaque propriété) :
                    {liveDraftValidation.ok ? (
                      <span className="ml-2 px-2 py-0.5 rounded bg-emerald-700 text-white text-[10px] font-bold">
                        ✓ SCHÉMA JSON VALIDE ({liveDraftValidation.pack.scenes.length}{" "}
                        scènes)
                      </span>
                    ) : (
                      <span className="ml-2 px-2 py-0.5 rounded bg-brand-red text-white text-[10px] font-bold">
                        ✕ {liveDraftValidation.error}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePrettifyJsonDraft}
                      className="px-2.5 py-1 rounded border border-black bg-brand-white hover:bg-brand-pearl text-[10px] font-bold"
                      title="Formater et indenter proprement le JSON"
                    >
                      ✨ Prettify
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(packJsonDraft);
                        setFeedback(
                          "JSON du Pack 3D copié dans le presse-papiers."
                        );
                      }}
                      className="px-2.5 py-1 rounded border border-black bg-brand-white hover:bg-brand-pearl text-[10px] font-bold"
                    >
                      📋 Copier le JSON
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPackJsonDraft(exportScenePackAsJson(currentPack))
                      }
                      className="px-2.5 py-1 rounded border border-neutral-400 bg-brand-white hover:border-black text-[10px] font-bold"
                    >
                      ↺ Réinitialiser depuis le Pack actif
                    </button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      disabled={!liveDraftValidation.ok}
                      onClick={handleApplyPackJsonDraft}
                    >
                      ✓ APPLIQUER LE JSON AU MOTEUR 3D
                    </Button>
                  </div>
                </div>

                {/* COMPOSER STUDIO v3 : SNIPPETS 3D & GÉNÉRATEUR DE PROMPT IA DYNAMIQUE */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 p-2.5 rounded-lg bg-neutral-900 text-white border-2 border-black">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-cyan-300">
                      🧩 Snippets 3D :
                    </span>
                    <select
                      aria-label="Choisir un Snippet 3D à insérer"
                      value={selectedSnippetId}
                      onChange={(e) => setSelectedSnippetId(e.target.value)}
                      className="flex-1 min-w-[160px] px-2 py-1 rounded border border-neutral-600 bg-neutral-950 text-white text-[11px]"
                    >
                      {JSON_SNIPPETS_3D.map((snip) => (
                        <option key={snip.id} value={snip.id}>
                          {snip.label} — {snip.description}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleInsertSnippetIntoDraft}
                      className="px-2.5 py-1 rounded border border-cyan-400 bg-cyan-500/20 hover:bg-cyan-500/35 text-cyan-200 text-[10px] font-bold"
                    >
                      + Insérer dans Scène #{safeSlotIndex + 1}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-amber-300">
                      🤖 Prompt IA v3 :
                    </span>
                    <select
                      aria-label="Choisir un style artistique pour le Prompt IA"
                      value={selectedAiStyleId}
                      onChange={(e) => setSelectedAiStyleId(e.target.value)}
                      className="flex-1 min-w-[140px] px-2 py-1 rounded border border-neutral-600 bg-neutral-950 text-white text-[11px]"
                    >
                      {AI_STYLE_PRESETS.map((style) => (
                        <option key={style.id} value={style.id}>
                          {style.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        const prompt = generateAiPackPromptV3(
                          selectedAiStyleId,
                          bpm
                        );
                        navigator.clipboard?.writeText(prompt);
                        const styleName =
                          AI_STYLE_PRESETS.find((s) => s.id === selectedAiStyleId)
                            ?.label ?? "v3";
                        setFeedback(
                          `Prompt IA "${styleName}" (${Math.round(bpm)} BPM) copié dans le presse-papiers !`
                        );
                      }}
                      className="px-2.5 py-1 rounded border border-amber-400 bg-amber-500/20 hover:bg-amber-500/35 text-amber-200 text-[10px] font-bold"
                    >
                      🤖 Copier Prompt IA ({Math.round(bpm)} BPM)
                    </button>
                  </div>
                </div>

                {liveDraftValidation.ok &&
                  liveDraftValidation.repairs.length > 0 && (
                    <div className="p-2 rounded border border-cyan-600 bg-cyan-50 text-cyan-950 text-[10px] flex flex-wrap items-center justify-between gap-2">
                      <span>
                        ✨ Nettoyé automatiquement :{" "}
                        {liveDraftValidation.repairs.join(" · ")}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setPackJsonDraft(autoRepairPackJsonSyntax(packJsonDraft))
                        }
                        className="px-2 py-0.5 rounded border border-cyan-700 bg-white font-bold hover:bg-cyan-100"
                      >
                        Formater proprement
                      </button>
                    </div>
                  )}

                {!liveDraftValidation.ok && (
                  <div className="p-2.5 rounded-lg border-2 border-brand-red bg-red-50 text-brand-red text-[11px] space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold">
                        ✕ {liveDraftValidation.error}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setPackJsonDraft(autoRepairPackJsonSyntax(packJsonDraft))
                        }
                        className="px-2.5 py-1 rounded border-2 border-black bg-brand-white text-brand-black hover:bg-brand-pearl font-bold text-[10px]"
                      >
                        🔧 Auto-réparer la syntaxe
                      </button>
                    </div>
                    {liveDraftValidation.lineSnippet && (
                      <pre className="p-1.5 rounded bg-neutral-900 text-amber-300 text-[10px] overflow-x-auto">
                        Ligne {liveDraftValidation.line} : {liveDraftValidation.lineSnippet}
                      </pre>
                    )}
                  </div>
                )}

                {liveDraftValidation.ok &&
                  liveDraftValidation.warnings.length > 0 && (
                    <div className="p-2 rounded border border-amber-500 bg-amber-50 text-amber-900 text-[10px] space-y-0.5">
                      <div className="font-bold">
                        Fallbacks automatiques détectés (les valeurs inconnues
                        seront corrigées sans planter) :
                      </div>
                      {liveDraftValidation.warnings.slice(0, 4).map((w, i) => (
                        <div key={i}>• {w}</div>
                      ))}
                    </div>
                  )}

                <textarea
                  aria-label="Éditeur JSON du Pack 3D"
                  rows={16}
                  value={packJsonDraft}
                  onChange={(e) => setPackJsonDraft(e.target.value)}
                  spellCheck={false}
                  className="w-full p-3 rounded-lg border-2 border-black bg-neutral-950 text-cyan-300 font-mono text-xs leading-relaxed"
                />
              </div>
            )}

            {/* ONGLET 2 : INSPECTEUR VISUEL 3D (ENVIRONMENT / SUBJECT / CAMERA / AUDIOMAPPING) */}
            {editorTab === "scene-controls" && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                {/* 1. ENVIRONMENT */}
                <div className="p-3 rounded-lg bg-brand-pearl border border-neutral-300 space-y-2.5">
                  <div className="font-bold text-[11px] uppercase text-brand-red">
                    1. Environment (Monde &amp; Brouillard)
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-600 mb-0.5">
                      terrainType
                    </label>
                    <select
                      value={activeScene.environment.terrainType}
                      onChange={(e) =>
                        updateActiveScene((s) => ({
                          ...s,
                          environment: {
                            ...s.environment,
                            terrainType: e.target.value as AnarchyTerrainType,
                          },
                        }))
                      }
                      className="w-full px-2 py-1 rounded border border-black bg-brand-white font-bold text-[11px]"
                    >
                      {ANARCHY_TERRAIN_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex justify-between text-[10px]">
                        <span>terrainSpeed</span>
                        <strong>
                          {activeScene.environment.terrainSpeed.toFixed(1)}
                        </strong>
                      </div>
                      <input
                        type="range"
                        min={0.5}
                        max={30}
                        step={0.5}
                        value={activeScene.environment.terrainSpeed}
                        onChange={(e) =>
                          updateActiveScene((s) => ({
                            ...s,
                            environment: {
                              ...s.environment,
                              terrainSpeed: Number(e.target.value),
                            },
                          }))
                        }
                        className="w-full accent-brand-red"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px]">
                        <span>fogDensity</span>
                        <strong>
                          {activeScene.environment.fogDensity.toFixed(3)}
                        </strong>
                      </div>
                      <input
                        type="range"
                        min={0.005}
                        max={0.12}
                        step={0.005}
                        value={activeScene.environment.fogDensity}
                        onChange={(e) =>
                          updateActiveScene((s) => ({
                            ...s,
                            environment: {
                              ...s.environment,
                              fogDensity: Number(e.target.value),
                            },
                          }))
                        }
                        className="w-full accent-brand-red"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <label className="flex items-center justify-between text-[10px] bg-brand-white px-2 py-1 rounded border border-neutral-300">
                      <span>skyColor</span>
                      <input
                        type="color"
                        value={activeScene.environment.skyColor}
                        onChange={(e) =>
                          updateActiveScene((s) => ({
                            ...s,
                            environment: {
                              ...s.environment,
                              skyColor: e.target.value.toUpperCase(),
                            },
                          }))
                        }
                        className="w-6 h-5 cursor-pointer"
                      />
                    </label>
                    <label className="flex items-center justify-between text-[10px] bg-brand-white px-2 py-1 rounded border border-neutral-300">
                      <span>fogColor</span>
                      <input
                        type="color"
                        value={activeScene.environment.fogColor}
                        onChange={(e) =>
                          updateActiveScene((s) => ({
                            ...s,
                            environment: {
                              ...s.environment,
                              fogColor: e.target.value.toUpperCase(),
                            },
                          }))
                        }
                        className="w-6 h-5 cursor-pointer"
                      />
                    </label>
                    <label className="flex items-center justify-between text-[10px] bg-brand-white px-2 py-1 rounded border border-neutral-300">
                      <span>terrainPrimary</span>
                      <input
                        type="color"
                        value={activeScene.environment.terrainPrimaryColor}
                        onChange={(e) =>
                          updateActiveScene((s) => ({
                            ...s,
                            environment: {
                              ...s.environment,
                              terrainPrimaryColor: e.target.value.toUpperCase(),
                            },
                          }))
                        }
                        className="w-6 h-5 cursor-pointer"
                      />
                    </label>
                    <label className="flex items-center justify-between text-[10px] bg-brand-white px-2 py-1 rounded border border-neutral-300">
                      <span>terrainSecond</span>
                      <input
                        type="color"
                        value={activeScene.environment.terrainSecondaryColor}
                        onChange={(e) =>
                          updateActiveScene((s) => ({
                            ...s,
                            environment: {
                              ...s.environment,
                              terrainSecondaryColor:
                                e.target.value.toUpperCase(),
                            },
                          }))
                        }
                        className="w-6 h-5 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* 2. SUBJECT */}
                <div className="p-3 rounded-lg bg-brand-pearl border border-neutral-300 space-y-2.5">
                  <div className="font-bold text-[11px] uppercase text-brand-red">
                    2. Subject (Sujet 3D Central)
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-600 mb-0.5">
                      meshType
                    </label>
                    <select
                      value={activeScene.subject.meshType}
                      onChange={(e) =>
                        updateActiveScene((s) => ({
                          ...s,
                          subject: {
                            ...s.subject,
                            meshType: e.target.value as AnarchySubjectMeshType,
                          },
                        }))
                      }
                      className="w-full px-2 py-1 rounded border border-black bg-brand-white font-bold text-[11px]"
                    >
                      {ANARCHY_SUBJECT_MESH_TYPES.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px]">
                      <span>scale (Échelle 3D)</span>
                      <strong>{activeScene.subject.scale.toFixed(2)}×</strong>
                    </div>
                    <input
                      type="range"
                      min={0.3}
                      max={2.6}
                      step={0.05}
                      value={activeScene.subject.scale}
                      onChange={(e) =>
                        updateActiveScene((s) => ({
                          ...s,
                          subject: {
                            ...s.subject,
                            scale: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full accent-brand-red"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center justify-between text-[10px] bg-brand-white px-2 py-1 rounded border border-neutral-300">
                      <span>primaryColor</span>
                      <input
                        type="color"
                        value={activeScene.subject.primaryColor}
                        onChange={(e) =>
                          updateActiveScene((s) => ({
                            ...s,
                            subject: {
                              ...s.subject,
                              primaryColor: e.target.value.toUpperCase(),
                            },
                          }))
                        }
                        className="w-6 h-5 cursor-pointer"
                      />
                    </label>
                    <label className="flex items-center justify-between text-[10px] bg-brand-white px-2 py-1 rounded border border-neutral-300">
                      <span>accentColor</span>
                      <input
                        type="color"
                        value={activeScene.subject.accentColor}
                        onChange={(e) =>
                          updateActiveScene((s) => ({
                            ...s,
                            subject: {
                              ...s.subject,
                              accentColor: e.target.value.toUpperCase(),
                            },
                          }))
                        }
                        className="w-6 h-5 cursor-pointer"
                      />
                    </label>
                  </div>

                  <label className="inline-flex items-center gap-1.5 text-[11px] font-bold cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={activeScene.subject.wireframeOverlay}
                      onChange={(e) =>
                        updateActiveScene((s) => ({
                          ...s,
                          subject: {
                            ...s.subject,
                            wireframeOverlay: e.target.checked,
                          },
                        }))
                      }
                      className="accent-brand-red"
                    />
                    <span>wireframeOverlay (Arêtes Néon 3D)</span>
                  </label>
                </div>

                {/* 3. CAMERA & ARCHÉTYPE DE FOND */}
                <div className="p-3 rounded-lg bg-brand-pearl border border-neutral-300 space-y-2.5">
                  <div className="font-bold text-[11px] uppercase text-brand-red">
                    3. Camera (Optique &amp; Mouvement)
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-600 mb-0.5">
                      camera.mode
                    </label>
                    <select
                      value={activeScene.camera.mode}
                      onChange={(e) =>
                        updateActiveScene((s) => ({
                          ...s,
                          camera: {
                            ...s.camera,
                            mode: e.target.value as AnarchyCameraMode,
                          },
                        }))
                      }
                      className="w-full px-2 py-1 rounded border border-black bg-brand-white font-bold text-[11px]"
                    >
                      {ANARCHY_CAMERA_MODES.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex justify-between text-[10px]">
                        <span>fov (°)</span>
                        <strong>{activeScene.camera.fov}°</strong>
                      </div>
                      <input
                        type="range"
                        min={45}
                        max={120}
                        step={1}
                        value={activeScene.camera.fov}
                        onChange={(e) =>
                          updateActiveScene((s) => ({
                            ...s,
                            camera: {
                              ...s.camera,
                              fov: Number(e.target.value),
                            },
                          }))
                        }
                        className="w-full accent-brand-red"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px]">
                        <span>shakeIntensity</span>
                        <strong>
                          {activeScene.camera.shakeIntensity.toFixed(2)}
                        </strong>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={2}
                        step={0.05}
                        value={activeScene.camera.shakeIntensity}
                        onChange={(e) =>
                          updateActiveScene((s) => ({
                            ...s,
                            camera: {
                              ...s.camera,
                              shakeIntensity: Number(e.target.value),
                            },
                          }))
                        }
                        className="w-full accent-brand-red"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[9px] text-neutral-600 mb-0.5">
                        Ambiance 3D (optionnel)
                      </label>
                      <select
                        value={activeScene.sceneId ?? "rave-dungeon"}
                        onChange={(e) =>
                          updateActiveScene((s) => ({
                            ...s,
                            sceneId: e.target.value as SceneId,
                          }))
                        }
                        className="w-full px-1.5 py-1 rounded border border-neutral-400 bg-brand-white text-[10px]"
                      >
                        {SCENE_CATALOG.map((sc) => (
                          <option key={sc.id} value={sc.id}>
                            {sc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] text-neutral-600 mb-0.5">
                        Palette HUD (optionnel)
                      </label>
                      <select
                        value={activeScene.paletteId ?? "anarchy-anaglyph"}
                        onChange={(e) =>
                          updateActiveScene((s) => ({
                            ...s,
                            paletteId: e.target.value as PaletteId,
                          }))
                        }
                        className="w-full px-1.5 py-1 rounded border border-neutral-400 bg-brand-white text-[10px]"
                      >
                        {STUDY_PALETTES.map((pal) => (
                          <option key={pal.id} value={pal.id}>
                            {pal.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. AUDIO MAPPING */}
                <div className="p-3 rounded-lg bg-brand-pearl border border-neutral-300 space-y-2">
                  <div className="font-bold text-[11px] uppercase text-brand-red">
                    4. AudioMapping (Basses / Mids / Aigus / Flux)
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-600">
                      bassTarget (piloté par Fader Gain Basses)
                    </label>
                    <select
                      value={activeScene.audioMapping.bassTarget}
                      onChange={(e) =>
                        updateActiveScene((s) => ({
                          ...s,
                          audioMapping: {
                            ...s.audioMapping,
                            bassTarget: e.target.value as AnarchyBassTarget,
                          },
                        }))
                      }
                      className="w-full px-2 py-1 rounded border border-black bg-brand-white font-bold text-[10px]"
                    >
                      {ANARCHY_BASS_TARGETS.map((b) => (
                        <option key={b.value} value={b.value}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-600">
                      midTarget (piloté par Fader Gain Médiums)
                    </label>
                    <select
                      value={activeScene.audioMapping.midTarget}
                      onChange={(e) =>
                        updateActiveScene((s) => ({
                          ...s,
                          audioMapping: {
                            ...s.audioMapping,
                            midTarget: e.target.value as AnarchyMidTarget,
                          },
                        }))
                      }
                      className="w-full px-2 py-1 rounded border border-black bg-brand-white font-bold text-[10px]"
                    >
                      {ANARCHY_MID_TARGETS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-600">
                      trebleTarget (piloté par Fader Gain Aigus)
                    </label>
                    <select
                      value={activeScene.audioMapping.trebleTarget}
                      onChange={(e) =>
                        updateActiveScene((s) => ({
                          ...s,
                          audioMapping: {
                            ...s.audioMapping,
                            trebleTarget: e.target.value as AnarchyTrebleTarget,
                          },
                        }))
                      }
                      className="w-full px-2 py-1 rounded border border-black bg-brand-white font-bold text-[10px]"
                    >
                      {ANARCHY_TREBLE_TARGETS.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-600">
                      fluxTarget (piloté par Fader Glitch &amp; Transitoires)
                    </label>
                    <select
                      value={activeScene.audioMapping.fluxTarget}
                      onChange={(e) =>
                        updateActiveScene((s) => ({
                          ...s,
                          audioMapping: {
                            ...s.audioMapping,
                            fluxTarget: e.target.value as AnarchyFluxTarget,
                          },
                        }))
                      }
                      className="w-full px-2 py-1 rounded border border-black bg-brand-white font-bold text-[10px]"
                    >
                      {ANARCHY_FLUX_TARGETS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Calques v2 : Décor latéral & Post-FX par scène */}
                <div className="pt-2 border-t border-black/15 grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-neutral-600 block mb-0.5">
                      Décor Latéral (sideProps v2)
                    </label>
                    <select
                      value={
                        activeScene.layers?.find((l) => l.kind === "sideProps")
                          ?.sideProps.type ?? "none"
                      }
                      onChange={(e) => {
                        const nextType = e.target.value as AnarchySidePropType;
                        updateActiveScene((s) => {
                          const existingLayers = s.layers ?? [];
                          const hasSide = existingLayers.some(
                            (l) => l.kind === "sideProps"
                          );
                          const updatedLayers = hasSide
                            ? existingLayers.map((l) =>
                                l.kind === "sideProps"
                                  ? {
                                      ...l,
                                      sideProps: {
                                        ...l.sideProps,
                                        type: nextType,
                                      },
                                    }
                                  : l
                              )
                            : [
                                ...existingLayers,
                                {
                                  kind: "sideProps" as const,
                                  sideProps: {
                                    type: nextType,
                                    density: 0.7,
                                    primaryColor:
                                      s.environment.terrainPrimaryColor,
                                    secondaryColor:
                                      s.environment.terrainSecondaryColor,
                                  },
                                },
                              ];
                          return { ...s, version: 2, layers: updatedLayers };
                        });
                      }}
                      className="w-full px-2 py-1 rounded border border-black bg-brand-white font-bold text-[10px]"
                    >
                      {ANARCHY_SIDE_PROP_TYPES.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-neutral-600 block mb-0.5">
                      Post-FX : Kaléidoscope (
                      {activeScene.postFx?.kaleidoscopeSegments ?? 0} seg.)
                    </label>
                    <select
                      value={activeScene.postFx?.kaleidoscopeSegments ?? 0}
                      onChange={(e) => {
                        const segs = Number(e.target.value) as
                          | 0
                          | 2
                          | 4
                          | 6
                          | 8;
                        updateActiveScene((s) => ({
                          ...s,
                          version: 2,
                          postFx: {
                            ...s.postFx,
                            kaleidoscopeSegments: segs,
                          },
                        }));
                      }}
                      className="w-full px-2 py-1 rounded border border-black bg-brand-white font-bold text-[10px]"
                    >
                      <option value={0}>0 (Désactivé)</option>
                      <option value={2}>2 segments (Miroir)</option>
                      <option value={4}>4 segments (Quadrants)</option>
                      <option value={6}>6 segments (Hexa)</option>
                      <option value={8}>8 segments (Octa)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-neutral-600 block mb-0.5">
                      Post-FX : PS1 Jitter (
                      {(activeScene.postFx?.ps1VertexJitter ?? 0).toFixed(2)})
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={activeScene.postFx?.ps1VertexJitter ?? 0}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        updateActiveScene((s) => ({
                          ...s,
                          version: 2,
                          postFx: {
                            ...s.postFx,
                            ps1VertexJitter: val,
                          },
                        }));
                      }}
                      className="w-full accent-brand-red"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {feedback && (
          <div className="px-3 py-1.5 rounded-lg bg-brand-pearl border-l-4 border-brand-black text-brand-black font-mono text-[11px] flex items-center justify-between">
            <span>✓ {feedback}</span>
            <button
              type="button"
              onClick={() => setFeedback("")}
              className="text-neutral-500 hover:text-brand-black ml-2"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* MODALE : IMPORTER / EXPORTER UN PACK 3D (.JSON / COPIER LE CODE) */}
      {showImportExportModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-brand-white border-4 border-black rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-comic font-mono">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div>
                <h3 className="text-base font-black uppercase">
                  ⇄ Importer / Exporter un Pack 3D (.json / Copier le code)
                </h3>
                <p className="text-xs text-neutral-600">
                  Partage ta Cartouche 3D JSON complète (`Anarchy3DPack`) ou
                  colle un JSON généré par IA. Zéro `eval`, 100% sécurisé, les
                  10 faders et le BPM restent intacts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowImportExportModal(false)}
                className="px-3 py-1 rounded border-2 border-black bg-brand-pearl font-bold text-xs"
              >
                ✕ FERMER
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Colonne Export */}
              <div className="p-4 rounded-xl bg-brand-pearl border-2 border-black space-y-2.5">
                <div className="font-bold text-xs uppercase text-brand-red">
                  1. Exporter le Pack 3D Actif ({currentPack.name})
                </div>
                <p className="text-[11px] text-neutral-700">
                  Contient les <strong>{currentPack.scenes.length} scènes 3D</strong>{" "}
                  (`environment`, `subject`, `camera`, `audioMapping`).
                </p>
                <textarea
                  readOnly
                  rows={12}
                  value={exportScenePackAsJson(currentPack)}
                  className="w-full p-2.5 rounded border border-black bg-neutral-950 text-emerald-300 text-[10px]"
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        exportScenePackAsJson(currentPack)
                      );
                      setFeedback(
                        `Code JSON du Pack 3D "${currentPack.name}" copié dans le presse-papiers.`
                      );
                    }}
                  >
                    📋 Copier le Code JSON
                  </Button>
                  <Button
                    type="button"
                    variant="comic"
                    size="sm"
                    onClick={handleDownloadPackJson}
                  >
                    ⬇ Télécharger .json
                  </Button>
                </div>
              </div>

              {/* Colonne Import */}
              <div className="p-4 rounded-xl bg-brand-pearl border-2 border-black space-y-2.5">
                <div className="font-bold text-xs uppercase text-brand-red">
                  2. Importer un Pack 3D (Fichier .json ou Code JSON IA)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={importPackName}
                    onChange={(e) => setImportPackName(e.target.value)}
                    placeholder="Surcharger le nom (optionnel)"
                    className="px-2 py-1.5 rounded border border-black bg-brand-white text-xs"
                  />
                  <input
                    type="text"
                    value={importPackAuthor}
                    onChange={(e) => setImportPackAuthor(e.target.value)}
                    placeholder="Auteur (optionnel)"
                    className="px-2 py-1.5 rounded border border-black bg-brand-white text-xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        setImportJsonText(String(reader.result ?? ""));
                      };
                      reader.readAsText(file);
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1 rounded border-2 border-black bg-brand-white hover:bg-brand-pearl text-[11px] font-bold"
                  >
                    📂 Charger un fichier .json
                  </button>
                  {liveImportValidation && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        liveImportValidation.ok
                          ? "bg-emerald-700 text-white"
                          : "bg-brand-red text-white"
                      }`}
                    >
                      {liveImportValidation.ok
                        ? `✓ Valide (${liveImportValidation.pack.scenes.length} scènes)`
                        : "✕ JSON invalide"}
                    </span>
                  )}
                </div>

                <textarea
                  rows={9}
                  value={importJsonText}
                  onChange={(e) => {
                    setImportJsonText(e.target.value);
                    if (importError) setImportError("");
                  }}
                  placeholder='Colle ici un JSON Anarchy3DPack (même entouré de texte, ```json, commentaires // ou nombres 12.0f)...'
                  className="w-full p-2.5 rounded border border-black bg-brand-white text-[10px]"
                />
                {liveImportValidation &&
                  liveImportValidation.ok &&
                  liveImportValidation.repairs.length > 0 && (
                    <div className="p-2 rounded border border-cyan-600 bg-cyan-50 text-cyan-950 text-[10px]">
                      ✨ Nettoyage auto : {liveImportValidation.repairs.join(" · ")}
                    </div>
                  )}
                {((liveImportValidation && !liveImportValidation.ok) ||
                  importError) && (
                  <div className="p-2.5 rounded-lg border-2 border-brand-red bg-red-50 text-brand-red text-[10px] space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold">
                        ✕{" "}
                        {liveImportValidation && !liveImportValidation.ok
                          ? liveImportValidation.error
                          : importError}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setImportJsonText(
                            autoRepairPackJsonSyntax(importJsonText)
                          );
                          setImportError("");
                        }}
                        className="px-2.5 py-1 rounded border-2 border-black bg-brand-white text-brand-black hover:bg-brand-pearl font-bold text-[10px]"
                      >
                        🔧 Auto-réparer la syntaxe
                      </button>
                    </div>
                    {liveImportValidation &&
                      !liveImportValidation.ok &&
                      liveImportValidation.lineSnippet && (
                        <pre className="p-1.5 rounded bg-neutral-900 text-amber-300 text-[10px] overflow-x-auto">
                          Ligne {liveImportValidation.line} :{" "}
                          {liveImportValidation.lineSnippet}
                        </pre>
                      )}
                  </div>
                )}
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleImportPackJson}
                >
                  ✓ Importer &amp; Activer ce Pack 3D
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALE : DOC / GÉNÉRER AVEC UNE IA */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-brand-white border-4 border-black rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-comic font-mono">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div>
                <h3 className="text-base font-black uppercase">
                  📖 Doc / Générer un Pack 3D avec une IA (`Anarchy3DPack`)
                </h3>
                <p className="text-xs text-neutral-600">
                  Architecture Data-Driven JSON 100% sécurisée (zéro `eval`) ·
                  Les 10 Faders agissent comme multiplicateurs temps réel.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDocModal(false)}
                className="px-3 py-1 rounded border-2 border-black bg-brand-pearl font-bold text-xs"
              >
                ✕ FERMER
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-brand-pearl border-2 border-black space-y-1.5">
                <div className="font-bold uppercase text-brand-red">
                  1. Calques v2 — Terrain, SideProps &amp; Subjects
                </div>
                <p className="text-[11px]">
                  • <strong>terrain.type</strong> :{" "}
                  <code>
                    {ANARCHY_TERRAIN_TYPES.map((x) => x.value).join(" | ")}
                  </code>
                </p>
                <p className="text-[11px]">
                  • <strong>sideProps.type</strong> :{" "}
                  <code>
                    {ANARCHY_SIDE_PROP_TYPES.map((x) => x.value).join(" | ")}
                  </code>
                </p>
                <p className="text-[11px]">
                  • <strong>subject.meshType</strong> :{" "}
                  <code>
                    {ANARCHY_SUBJECT_MESH_TYPES.map((x) => x.value).join(" | ")}
                  </code>
                </p>
                <p className="text-[11px]">
                  • <strong>procedural_group parts[].primitive</strong> :{" "}
                  <code>
                    {ANARCHY_PROCEDURAL_PRIMITIVES.map((x) => x.value).join(" | ")}
                  </code>
                </p>
                <p className="text-[11px]">
                  • <strong>postFx</strong> :{" "}
                  <code>
                    {POST_FX_REGISTRY.map((x) => `${x.key} (${x.range})`).join(" · ")}
                  </code>
                </p>
                <p className="text-[11px]">
                  • <strong>renderStyle (v3)</strong> :{" "}
                  <code>
                    resolutionScale (0.15..1.0) · shading (wireframe | flat | toon_cel | hologram | chrome_reflective | neon_glow) · outlineThickness (0..6)
                  </code>
                </p>
                <p className="text-[11px]">
                  • <strong>compositionMode (v3)</strong> :{" "}
                  <code>
                    corridor | void_orbital | tunnel_infinite | kaleido_mandala | terrain_flyover
                  </code>{" "}
                  (+ <code>kaleidoAxes</code> 3..12)
                </p>
                <p className="text-[11px]">
                  • <strong>backdrop.shader &amp; generators[] (v3)</strong> :{" "}
                  <code>
                    plasma_fluid | voronoi_cells | radial_sunburst | grid_horizon | noise_fog
                  </code>{" "}
                  · <code>particle_field | ribbon_trails | audio_wave_mesh | instanced_array</code>
                </p>
                <p className="text-[11px]">
                  • <strong>Couche 1–3 Organique (v4)</strong> :{" "}
                  <code>
                    lightingPreset (studio_clean | cyber_neon | sunset_warm | dark_void)
                  </code>{" "}
                  ·{" "}
                  <code>
                    actors[] (organic_blob | wave_terrain | spline_ribbons | particle_swarm | glb_model | sprite_2d)
                  </code>{" "}
                  ·{" "}
                  <code>
                    postFX[] (bloom | depth_of_field | toon_outline | chromatic_aberration | film_grain | pixelate)
                  </code>{" "}
                  · <code>durationBars (1..64)</code> · <code>transition (cut | crossfade | camera_swoop | flash)</code>
                </p>
                <p className="text-[11px]">
                  • <strong>Cartoon 1930 / Cuphead (v5)</strong> :{" "}
                  <code>
                    actors[] (parallax_layer | cartoon_sprite | rubber_hose_mesh)
                  </code>{" "}
                  ·{" "}
                  <code>
                    cartoonPhysics (steppedFps: 12|24|60, squashStretch, lineBoil, faderBindings)
                  </code>{" "}
                  ·{" "}
                  <code>
                    vintage_1930_film (filmGrain, scratchesAndDust, gateWeave, colorGrade: technicolor_30s|sepia_warm|black_and_white_ink, vignette)
                  </code>{" "}
                  · <code>toon_outline (inkThickness, inkJitter)</code>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-brand-pearl border-2 border-black space-y-1.5">
                <div className="font-bold uppercase text-brand-red">
                  2. Valeurs autorisées — Camera &amp; AudioMapping
                </div>
                <p className="text-[11px]">
                  • <strong>camera.mode / rig (v3)</strong> :{" "}
                  <code>
                    {ANARCHY_CAMERA_MODES.map((x) => x.value).join(" | ")}
                  </code>{" "}
                  · rig:{" "}
                  <code>
                    orbit_smooth | dolly_zoom_on_kick | first_person_fly | top_down_spin | handheld_shake
                  </code>{" "}
                  (+ <code>beatCut</code>)
                </p>
                <p className="text-[11px]">
                  • <strong>audioMapping.bassTarget</strong> :{" "}
                  <code>
                    {ANARCHY_BASS_TARGETS.map((x) => x.value).join(" | ")}
                  </code>
                </p>
                <p className="text-[11px]">
                  • <strong>audioMapping.midTarget</strong> :{" "}
                  <code>
                    {ANARCHY_MID_TARGETS.map((x) => x.value).join(" | ")}
                  </code>
                </p>
                <p className="text-[11px]">
                  • <strong>audioMapping.trebleTarget</strong> :{" "}
                  <code>
                    {ANARCHY_TREBLE_TARGETS.map((x) => x.value).join(" | ")}
                  </code>
                </p>
                <p className="text-[11px]">
                  • <strong>audioMapping.fluxTarget</strong> :{" "}
                  <code>
                    {ANARCHY_FLUX_TARGETS.map((x) => x.value).join(" | ")}
                  </code>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 text-emerald-300 border-2 border-black space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-xs text-white uppercase">
                  🤖 Prompt IA Universel (ChatGPT / Claude / Gemini) — Générer
                  une Cartouche JSON `Anarchy3DPack`
                </span>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard?.writeText(AI_SCENE_PACK_PROMPT);
                    setFeedback(
                      "Prompt IA 3D copié ! Colle-le dans ChatGPT, Claude ou Gemini puis importe le JSON généré."
                    );
                  }}
                >
                  📋 Copier le Prompt IA
                </Button>
              </div>
              <pre className="text-[10px] whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {AI_SCENE_PACK_PROMPT}
              </pre>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

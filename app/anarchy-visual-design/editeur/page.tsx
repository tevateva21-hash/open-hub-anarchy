"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  CPP_PRESET_TEMPLATES,
  CPP_SHADER_AI_PROMPT,
  compileCppVisual,
  createCppRenderContext,
  type CppCompileResult,
  type CppUniformValue,
} from "@/lib/visual-engine/cpp-runtime";
import {
  applyCppSceneTransition,
  createDefaultCppWorkspace,
  extractDocumentUniformValues,
  loadCppWorkspace,
  resolveActiveCppScene,
  saveCppWorkspace,
  type CppDocument,
  type CppSceneRoutingMode,
  type CppSceneRule,
  type CppTransitionKind,
  type CppWorkspaceState,
} from "@/lib/visual-engine/cpp-workspace";
import {
  AI_SCENE_PACK_PROMPT,
  DEFAULT_SCENE_PACKS,
  exportScenePackAsCpp,
  parseScenePackFromText,
  type ScenePack,
} from "@/lib/visual-engine/scene-packs";
import {
  ACTIVE_PACK_ID_KEY,
  PACKS_STORAGE_KEY,
} from "@/components/visual-engine/ScenePackManager";
import { renderSceneFrame, SCENE_CATALOG } from "@/lib/visual-engine/renderer";
import type { SceneId, VideoAspectRatio } from "@/lib/visual-engine/contracts";
import { VIDEO_ASPECT_FORMATS } from "@/lib/visual-engine/lyrics-scenario";

const SECTION_DEMO_TAGS = ["AUTO", "INTRO", "MAIN", "COUPLET", "PRE_DROP", "DROP", "REFRAIN", "OUTRO"] as const;

export default function VisualSceneCppEditorPage() {
  const [workspace, setWorkspace] = useState<CppWorkspaceState>(() =>
    createDefaultCppWorkspace()
  );
  const [hydrated, setHydrated] = useState(false);

  // État UI Documents / Presets / Preview
  const [renamingDocId, setRenamingDocId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");
  const [newPresetName, setNewPresetName] = useState<string>("");
  const [previewAspect, setPreviewAspect] = useState<VideoAspectRatio>("16:9");
  const [simSection, setSimSection] = useState<string>("AUTO");
  const [followSceneRouting, setFollowSceneRouting] = useState<boolean>(true);
  const [runtimeError, setRuntimeError] = useState<string>("");
  const [activePreviewStatus, setActivePreviewStatus] = useState<string>("");

  // Packs de 5 scènes
  const [packs, setPacks] = useState<ScenePack[]>(DEFAULT_SCENE_PACKS);
  const [selectedPackId, setSelectedPackId] = useState<string>(
    DEFAULT_SCENE_PACKS[0].id
  );
  const [packRawCode, setPackRawCode] = useState<string>("");
  const [statusMsg, setStatusMsg] = useState<string>("");

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileImportRef = useRef<HTMLInputElement | null>(null);

  // Refs temps réel pour 60fps sans recompilation à chaque slide de paramètre
  const workspaceRef = useRef<CppWorkspaceState>(workspace);
  workspaceRef.current = workspace;
  const compiledCacheRef = useRef<Map<string, CppCompileResult>>(new Map());
  const simSectionRef = useRef<string>(simSection);
  simSectionRef.current = simSection;
  const followRoutingRef = useRef<boolean>(followSceneRouting);
  followRoutingRef.current = followSceneRouting;
  const aspectRef = useRef<VideoAspectRatio>(previewAspect);
  aspectRef.current = previewAspect;
  const lastSceneKeyRef = useRef<string>("");
  const transitionStartRef = useRef<number>(0);
  const lastRuntimeErrRef = useRef<string>("");

  // Charger workspace multi-documents & packs au montage
  useEffect(() => {
    const loaded = loadCppWorkspace();
    setWorkspace(loaded);
    setHydrated(true);

    try {
      const rawPacks = window.localStorage.getItem(PACKS_STORAGE_KEY);
      if (rawPacks) {
        const custom = JSON.parse(rawPacks) as ScenePack[];
        if (Array.isArray(custom) && custom.length > 0) {
          setPacks([...DEFAULT_SCENE_PACKS, ...custom]);
        }
      }
      const activeId = window.localStorage.getItem(ACTIVE_PACK_ID_KEY);
      if (activeId) setSelectedPackId(activeId);
    } catch {
      // ignore
    }
  }, []);

  // Persistance automatique dans localStorage + événement sync vers Studio principal
  useEffect(() => {
    if (!hydrated) return;
    saveCppWorkspace(workspace);
  }, [hydrated, workspace]);

  const activeDoc =
    workspace.documents.find((d) => d.id === workspace.activeDocumentId) ??
    workspace.documents[0];

  const compiledActive = useMemo(() => {
    const res = compileCppVisual(activeDoc.code);
    if (res.ok) {
      compiledCacheRef.current.set(`${activeDoc.id}::${activeDoc.code}`, res);
    }
    return res;
  }, [activeDoc.id, activeDoc.code]);

  const activeUniformValues = useMemo(
    () => extractDocumentUniformValues(activeDoc),
    [activeDoc]
  );

  const docCompileOkMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const d of workspace.documents) {
      map[d.id] = compileCppVisual(d.code).ok;
    }
    return map;
  }, [workspace.documents]);

  const currentPack =
    packs.find((p) => p.id === selectedPackId) ?? packs[0];

  // Helper de compilation avec cache par document
  const getCompiledForDoc = (doc: CppDocument): CppCompileResult => {
    const key = `${doc.id}::${doc.code}`;
    const cached = compiledCacheRef.current.get(key);
    if (cached) return cached;
    const res = compileCppVisual(doc.code);
    compiledCacheRef.current.set(key, res);
    return res;
  };

  // Boucle de prévisualisation 60fps temps réel (Documents, Scènes, Transitions & Uniforms live)
  useEffect(() => {
    let rafId = 0;
    const startMs = performance.now();
    let frameTick = 0;

    const draw = (now: number) => {
      const canvas = previewCanvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx) {
        const ws = workspaceRef.current;
        const t = (now - startMs) / 1000;
        const bpm = currentPack.bpm || 140;
        const beatFloat = t * (bpm / 60);
        const beatPhase = beatFloat - Math.floor(beatFloat);
        const bass = Math.max(0, 1 - beatPhase * 2.1);
        const mid = 0.4 + 0.35 * Math.sin(t * 3.2);
        const treble = 0.3 + 0.4 * Math.abs(Math.sin(t * 7.5));
        const rms = bass * 0.5 + mid * 0.3 + treble * 0.2;
        const flux = beatPhase < 0.12 ? 0.85 : 0.12;

        // Simulation cycle auto de sections si AUTO est sélectionné (change toutes les 6s)
        const autoCycle = ["INTRO", "MAIN", "DROP", "REFRAIN"];
        const simSec =
          simSectionRef.current === "AUTO"
            ? autoCycle[Math.floor(t / 6) % autoCycle.length]
            : simSectionRef.current;

        const simulatedWords =
          simSec === "DROP"
            ? ["ANARCHY", "DROP", "OVERDRIVE", "KATANA"]
            : simSec === "REFRAIN"
            ? ["OPEN", "HUB", "VISUAL", "STUDIO"]
            : ["PS2", "SIGNAL", "SYNC"];
        const simWord =
          simulatedWords[Math.floor(t * 2) % simulatedWords.length];

        const aspect = aspectRef.current;
        const spec = VIDEO_ASPECT_FORMATS[aspect];

        let targetDoc =
          ws.documents.find((d) => d.id === ws.activeDocumentId) ??
          ws.documents[0];
        let targetUniforms = extractDocumentUniformValues(targetDoc);
        let activeSceneRule: CppSceneRule | null = null;
        let reasonLabel = `DOC ÉDITÉ : ${targetDoc.name}`;

        if (followRoutingRef.current) {
          const resolved = resolveActiveCppScene(ws, t % 30, simSec);
          targetDoc = resolved.document;
          targetUniforms = resolved.uniforms;
          activeSceneRule = resolved.scene;
          reasonLabel = resolved.matchedReason;
        }

        const sceneKey = `${activeSceneRule?.id ?? "none"}::${targetDoc.id}`;
        if (lastSceneKeyRef.current && lastSceneKeyRef.current !== sceneKey) {
          transitionStartRef.current = now;
        }
        lastSceneKeyRef.current = sceneKey;

        const slotIdx = Math.floor(beatFloat / 8) % currentPack.scenes.length;
        const slot = currentPack.scenes[slotIdx] ?? currentPack.scenes[0];

        renderSceneFrame(ctx, {
          sceneId: activeSceneRule?.baseSceneId ?? slot.sceneId,
          paletteId: slot.paletteId,
          timeSeconds: t,
          intensity: slot.intensity / 100,
          liveAudioOverride: { bass, mid, treble, rms, spectralFlux: flux },
          seed: slot.seed ?? 101,
          aspectRatio: aspect,
        });

        const compiled = getCompiledForDoc(targetDoc);
        if (compiled.ok && compiled.fn) {
          try {
            const cppCtx = createCppRenderContext(ctx, spec.width, spec.height, {
              t,
              bpm,
              beat: Math.floor(beatFloat),
              beatPhase,
              bass,
              mid,
              treble,
              rms,
              flux,
              sceneIndex: slotIdx,
              lyricLine: `${simSec} // ${simWord}`,
              lyricWord: simWord,
              lyricProgress: (t % 6) / 6,
              lyricSection: simSec,
              params: targetUniforms,
            });
            compiled.fn(cppCtx, targetUniforms);

            if (activeSceneRule && transitionStartRef.current > 0) {
              const dur = Math.max(0.05, activeSceneRule.transitionDuration || 0.35);
              const elapsedSec = (now - transitionStartRef.current) / 1000;
              if (elapsedSec < dur) {
                applyCppSceneTransition(
                  cppCtx,
                  activeSceneRule.transition,
                  elapsedSec / dur
                );
              }
            }

            if (lastRuntimeErrRef.current !== "") {
              lastRuntimeErrRef.current = "";
              setRuntimeError("");
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Erreur runtime C++.";
            if (lastRuntimeErrRef.current !== msg) {
              lastRuntimeErrRef.current = msg;
              setRuntimeError(msg);
            }
          }
        }

        frameTick++;
        if (frameTick % 12 === 0) {
          setActivePreviewStatus(`${reasonLabel} · #${simSec}`);
        }
      }
      rafId = window.requestAnimationFrame(draw);
    };

    rafId = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(rafId);
  }, [currentPack]);

  // --- Actions MODULE 2 : Documents C++ ---
  const updateActiveDoc = (updater: (doc: CppDocument) => CppDocument) => {
    setWorkspace((curr) => ({
      ...curr,
      documents: curr.documents.map((d) =>
        d.id === curr.activeDocumentId ? updater(d) : d
      ),
    }));
  };

  const handleCreateDoc = () => {
    const id = `doc-${Date.now()}`;
    const idx = workspace.documents.length + 1;
    const newDoc: CppDocument = {
      id,
      name: `custom_fx_${idx}.cpp`,
      updatedAt: new Date().toISOString(),
      activePresetId: "preset-default",
      code: `// @param float speed = 3.0 [0.0, 15.0]\n// @color glowColor = "#00E5FF"\n// @toggle addScanlines = true\nvoid renderAnarchyFrame(AnarchyCtx& ctx) {\n  ctx.clear("#0A0C12");\n  float cx = ctx.width * 0.5f;\n  float cy = ctx.height * 0.5f;\n  ctx.ring(cx, cy, 20.0f + ctx.bass * 50.0f, 2.5f, glowColor);\n  ctx.grid(24, "rgba(255, 27, 36, 0.25)", speed * 12.0f);\n  if (addScanlines) ctx.scanlines(0.2f);\n}`,
      presets: [
        {
          id: "preset-default",
          name: "Défaut",
          values: { speed: 3.0, glowColor: "#00E5FF", addScanlines: true },
        },
      ],
    };
    setWorkspace((curr) => ({
      ...curr,
      activeDocumentId: id,
      documents: [...curr.documents, newDoc],
    }));
    setFollowSceneRouting(false);
    setStatusMsg(`Nouveau document "${newDoc.name}" créé.`);
  };

  const handleDuplicateDoc = (doc: CppDocument) => {
    const id = `doc-${Date.now()}`;
    const copyName = doc.name.replace(/\.cpp$/i, "") + "_copy.cpp";
    const cloned: CppDocument = {
      ...doc,
      id,
      name: copyName,
      updatedAt: new Date().toISOString(),
      presets: doc.presets.map((p) => ({ ...p, values: { ...p.values } })),
    };
    setWorkspace((curr) => ({
      ...curr,
      activeDocumentId: id,
      documents: [...curr.documents, cloned],
    }));
    setFollowSceneRouting(false);
    setStatusMsg(`Document dupliqué sous "${copyName}".`);
  };

  const handleDeleteDoc = (docId: string) => {
    if (workspace.documents.length <= 1) {
      setStatusMsg("Impossible de supprimer le dernier document C++.");
      return;
    }
    const remaining = workspace.documents.filter((d) => d.id !== docId);
    const fallbackId = remaining[0].id;
    setWorkspace((curr) => ({
      ...curr,
      activeDocumentId:
        curr.activeDocumentId === docId ? fallbackId : curr.activeDocumentId,
      documents: remaining,
      scenes: curr.scenes.map((s) =>
        s.documentId === docId ? { ...s, documentId: fallbackId } : s
      ),
    }));
    setStatusMsg("Document C++ supprimé.");
  };

  const handleExportCppFile = (doc: CppDocument) => {
    const blob = new Blob([doc.code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.name.endsWith(".cpp") ? doc.name : `${doc.name}.cpp`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusMsg(`Fichier "${a.download}" exporté.`);
  };

  const handleImportCppFile = async (file: File) => {
    const code = await file.text();
    const id = `doc-${Date.now()}`;
    const uniforms = compileCppVisual(code).uniforms;
    const defaultVals: Record<string, CppUniformValue> = {};
    for (const u of uniforms) defaultVals[u.name] = u.defaultValue;

    const imported: CppDocument = {
      id,
      name: file.name,
      code,
      updatedAt: new Date().toISOString(),
      activePresetId: "preset-imported",
      presets: [{ id: "preset-imported", name: "Importé", values: defaultVals }],
    };
    setWorkspace((curr) => ({
      ...curr,
      activeDocumentId: id,
      documents: [...curr.documents, imported],
    }));
    setFollowSceneRouting(false);
    setStatusMsg(`Document "${file.name}" importé et ouvert.`);
  };

  // --- Actions MODULE 4 : Uniforms & Presets ---
  const handleUniformChange = (name: string, val: CppUniformValue) => {
    updateActiveDoc((doc) => ({
      ...doc,
      updatedAt: new Date().toISOString(),
      presets: doc.presets.map((p) =>
        p.id === doc.activePresetId
          ? { ...p, values: { ...p.values, [name]: val } }
          : p
      ),
    }));
  };

  const handleSaveNewPreset = () => {
    const cleanName = newPresetName.trim();
    if (!cleanName) {
      setStatusMsg("Saisis un nom pour enregistrer le preset (ex: Néon Cyber).");
      return;
    }
    const presetId = `preset-${Date.now()}`;
    updateActiveDoc((doc) => ({
      ...doc,
      activePresetId: presetId,
      presets: [
        ...doc.presets,
        { id: presetId, name: cleanName, values: { ...activeUniformValues } },
      ],
    }));
    setNewPresetName("");
    setStatusMsg(`Preset "${cleanName}" sauvegardé pour ${activeDoc.name}.`);
  };

  const handleResetUniformsToDefaults = () => {
    const defaults: Record<string, CppUniformValue> = {};
    for (const u of compiledActive.uniforms) {
      defaults[u.name] = u.defaultValue;
    }
    updateActiveDoc((doc) => ({
      ...doc,
      presets: doc.presets.map((p) =>
        p.id === doc.activePresetId ? { ...p, values: defaults } : p
      ),
    }));
    setStatusMsg("Paramètres réinitialisés aux valeurs @param du code.");
  };

  // --- Actions MODULE 3 : Scènes & Routage Musical ---
  const handleAddSceneRule = () => {
    const id = `scene-${Date.now()}`;
    const newRule: CppSceneRule = {
      id,
      label: `Scène #${workspace.scenes.length + 1}`,
      documentId: activeDoc.id,
      presetId: activeDoc.activePresetId,
      routingMode: "section",
      sectionTag: "OUTRO",
      baseSceneId: "digital-void",
      transition: "fade",
      transitionDuration: 0.35,
    };
    setWorkspace((curr) => ({
      ...curr,
      scenes: [...curr.scenes, newRule],
    }));
  };

  const updateSceneRule = (
    sceneId: string,
    patch: Partial<CppSceneRule>
  ) => {
    setWorkspace((curr) => ({
      ...curr,
      scenes: curr.scenes.map((s) =>
        s.id === sceneId ? { ...s, ...patch } : s
      ),
    }));
  };

  const deleteSceneRule = (sceneId: string) => {
    setWorkspace((curr) => ({
      ...curr,
      manualSceneId: curr.manualSceneId === sceneId ? null : curr.manualSceneId,
      scenes: curr.scenes.filter((s) => s.id !== sceneId),
    }));
  };

  const handleApplyCppToSite = (enableState = true) => {
    if (!compiledActive.ok) {
      setStatusMsg(`Erreur C++ : ${compiledActive.error}`);
      return;
    }
    setWorkspace((curr) => ({ ...curr, enabled: enableState }));
    setStatusMsg(
      enableState
        ? "Workspace C++ (Documents, Scènes & Presets) ACTIVÉ sur le studio principal !"
        : "Workspace C++ sauvegardé (désactivé sur le studio principal)."
    );
  };

  // --- Packs de 5 scènes ---
  const handleImportPack = () => {
    const parsed = parseScenePackFromText(packRawCode, "Communauté");
    if (!parsed) {
      setStatusMsg(
        "Format Pack non reconnu. Colle un bloc C++ (ANARCHY_PACK[5]) ou JSON valide."
      );
      return;
    }
    const next = [parsed, ...packs];
    setPacks(next);
    setSelectedPackId(parsed.id);
    const defaultsIds = new Set(DEFAULT_SCENE_PACKS.map((p) => p.id));
    const customOnly = next.filter((p) => !defaultsIds.has(p.id));
    try {
      window.localStorage.setItem(PACKS_STORAGE_KEY, JSON.stringify(customOnly));
      window.localStorage.setItem(ACTIVE_PACK_ID_KEY, parsed.id);
    } catch {
      // ignore
    }
    setStatusMsg(`Pack "${parsed.name}" importé et activé dans le Studio !`);
    setPackRawCode("");
  };

  const handleCopyPrompt = async () => {
    const fullPrompt = `${AI_SCENE_PACK_PROMPT}\n\n---\n${CPP_SHADER_AI_PROMPT}`;
    try {
      await navigator.clipboard.writeText(fullPrompt);
      setStatusMsg("Prompt IA C++ + Pack 5 Scènes copié !");
    } catch {
      setStatusMsg("Impossible de copier automatiquement.");
    }
  };

  const aspectSpec = VIDEO_ASPECT_FORMATS[previewAspect];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* En-tête Éditeur Modulaire */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-4">
        <div>
          <span className="inline-block px-2 py-0.5 rounded bg-brand-black text-brand-white font-mono text-[10px] font-bold uppercase mb-2">
            STUDIO MODULAIRE C++ // TRANSPILEUR · DOCUMENTS · SCÈNES · UNIFORMS
          </span>
          <h1 className="font-mono text-2xl sm:text-3xl font-bold text-brand-black">
            Éditeur C++ Temps Réel &amp; Routage Musical
          </h1>
          <p className="font-sans text-sm text-neutral-600 mt-1">
            Multi-scripts <code>.cpp</code>, routage automatique sur <code>ctx.lyricSection</code> / temps / pads VJ et paramètres UI <code>@param</code> / <code>@color</code> à 60 FPS.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={workspace.enabled ? "comic" : "primary"}
            size="md"
            onClick={() => handleApplyCppToSite(!workspace.enabled)}
          >
            {workspace.enabled ? "🟢 C++ ACTIF SUR STUDIO" : "🚀 ACTIVER SUR STUDIO"}
          </Button>
          <Link href="/docs/visual-studio">
            <Button variant="clinical" size="md">
              📖 DOCS STUDIO
            </Button>
          </Link>
          <Link href="/anarchy-visual-design">
            <Button variant="clinical" size="md">
              ← RETOUR AU STUDIO
            </Button>
          </Link>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-xl border-2 border-black bg-brand-pearl font-mono text-xs font-bold text-brand-red">
          {statusMsg}
        </div>
      )}

      {/* GRILLE PRINCIPALE 3 COLONNES : MODULE 2 (DOCS) | ÉDITEUR C++ | PREVIEW + MODULE 4 (INSPECTOR) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* COLONNE GAUCHE : MODULE 2 — GESTIONNAIRE DE DOCUMENTS C++ */}
        <Card
          moduleTitle="01 // DOCUMENTS .CPP"
          moduleMeta={`${workspace.documents.length} FICHIERS`}
          className="lg:col-span-3"
        >
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleCreateDoc}
              >
                + NOUVEAU .CPP
              </Button>
              <Button
                type="button"
                variant="clinical"
                size="sm"
                onClick={() => fileImportRef.current?.click()}
              >
                ⬆ IMPORTER .CPP
              </Button>
              <input
                ref={fileImportRef}
                type="file"
                accept=".cpp,.hpp,.h,.txt"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) void handleImportCppFile(f);
                }}
              />
            </div>

            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {workspace.documents.map((doc) => {
                const isSelected = doc.id === activeDoc.id;
                const docOk = Boolean(docCompileOkMap[doc.id]);
                return (
                  <div
                    key={doc.id}
                    className={`p-2 rounded-lg border-2 transition-all font-mono text-xs ${
                      isSelected
                        ? "border-black bg-brand-pearl shadow-comic-sm"
                        : "border-neutral-200 bg-brand-white hover:border-black"
                    }`}
                  >
                    {renamingDocId === doc.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          className="w-full px-1.5 py-0.5 border border-black rounded text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const clean = renameValue.trim();
                            if (clean) {
                              setWorkspace((curr) => ({
                                ...curr,
                                documents: curr.documents.map((d) =>
                                  d.id === doc.id ? { ...d, name: clean } : d
                                ),
                              }));
                            }
                            setRenamingDocId(null);
                          }}
                          className="px-1.5 py-0.5 bg-black text-white rounded text-[10px]"
                        >
                          OK
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setWorkspace((curr) => ({
                            ...curr,
                            activeDocumentId: doc.id,
                          }));
                          setFollowSceneRouting(false);
                        }}
                        className="w-full text-left flex items-center justify-between gap-1 font-bold"
                      >
                        <span className="truncate">
                          {docOk ? "🟢" : "🔴"} {doc.name}
                        </span>
                        <span className="text-[10px] text-neutral-500 shrink-0">
                          {doc.presets.length}P
                        </span>
                      </button>
                    )}

                    <div className="flex flex-wrap gap-1 mt-1.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => {
                          setRenamingDocId(doc.id);
                          setRenameValue(doc.name);
                        }}
                        className="px-1.5 py-0.5 rounded border border-neutral-300 hover:border-black bg-brand-white"
                      >
                        Renommer
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicateDoc(doc)}
                        className="px-1.5 py-0.5 rounded border border-neutral-300 hover:border-black bg-brand-white"
                      >
                        Dupliquer
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportCppFile(doc)}
                        className="px-1.5 py-0.5 rounded border border-neutral-300 hover:border-black bg-brand-white"
                      >
                        ⬇ .cpp
                      </button>
                      {workspace.documents.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="px-1.5 py-0.5 rounded border border-neutral-300 hover:border-brand-red text-brand-red bg-brand-white"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* COLONNE CENTRE : ÉDITEUR C++ + MODULE 1 TRANSPILEUR */}
        <Card
          moduleTitle={`02 // CODE : ${activeDoc.name}`}
          moduleMeta={
            compiledActive.ok
              ? `✅ COMPILÉ (${compiledActive.uniforms.length} UNIFORMS)`
              : `⚠ LIGNE ${compiledActive.errorLine ?? "?"}`
          }
          activeIndicator={workspace.enabled}
          className="lg:col-span-5"
        >
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <select
                aria-label="Charger un template C++ dans le document courant"
                value=""
                onChange={(e) => {
                  const tpl = CPP_PRESET_TEMPLATES.find(
                    (t) => t.id === e.target.value
                  );
                  if (tpl) {
                    updateActiveDoc((doc) => ({
                      ...doc,
                      code: tpl.code,
                      updatedAt: new Date().toISOString(),
                    }));
                    setFollowSceneRouting(false);
                  }
                }}
                className="px-2 py-1 rounded border border-black bg-brand-pearl font-mono text-[11px] font-bold"
              >
                <option value="">⚡ Charger un template C++...</option>
                {CPP_PRESET_TEMPLATES.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </option>
                ))}
              </select>

              <Button
                type="button"
                variant="comic"
                size="sm"
                onClick={() => {
                  navigator.clipboard
                    ?.writeText(CPP_SHADER_AI_PROMPT)
                    .then(() =>
                      setStatusMsg("Prompt IA Shader C++ (@param + 9:16) copié !")
                    )
                    .catch(() => {});
                }}
              >
                📋 PROMPT IA C++
              </Button>
            </div>

            <textarea
              id="cpp-code-editor"
              rows={17}
              value={activeDoc.code}
              onChange={(e) => {
                const nextCode = e.target.value;
                updateActiveDoc((doc) => ({
                  ...doc,
                  code: nextCode,
                  updatedAt: new Date().toISOString(),
                }));
              }}
              spellCheck={false}
              className="w-full p-3 rounded-lg border-2 border-black bg-[#101216] text-[#00E5FF] font-mono text-xs leading-relaxed"
            />

            {!compiledActive.ok && compiledActive.error && (
              <div
                role="alert"
                className="p-2.5 rounded-lg border-2 border-brand-red bg-red-50 font-mono text-xs font-bold text-brand-red"
              >
                Compilation C++ — {compiledActive.error}
              </div>
            )}

            {runtimeError && (
              <div
                role="alert"
                className="p-2.5 rounded-lg border-2 border-amber-600 bg-amber-50 font-mono text-xs font-bold text-amber-900"
              >
                Runtime C++ — {runtimeError}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[10px] text-neutral-500">
                Syntaxes supportées : <code>#include</code>, <code>std::*</code>,{" "}
                <code>sinf/cosf</code>, tableaux <code>arr[N]</code>, lambdas{" "}
                <code>[&amp;]()</code>, <code>{"// @param"}</code>, <code>{"// @color"}</code>
              </span>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleApplyCppToSite(true)}
              >
                🚀 APPLIQUER AU STUDIO
              </Button>
            </div>
          </div>
        </Card>

        {/* COLONNE DROITE : PREVIEW 60FPS + MODULE 4 INSPECTOR / PRESETS */}
        <div className="lg:col-span-4 space-y-4">
          <Card
            moduleTitle="03 // MONITEUR LIVE 60 FPS"
            moduleMeta={activePreviewStatus || `${aspectSpec.width}×${aspectSpec.height}`}
            activeIndicator
          >
            <div className="space-y-2.5">
              {/* Ratio & Mode Preview */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 font-mono text-[10px]">
                <div className="flex flex-wrap gap-1">
                  {(["16:9", "9:16", "4:5", "1:1"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setPreviewAspect(r)}
                      className={`px-2 py-0.5 rounded border font-bold ${
                        previewAspect === r
                          ? "bg-black text-white border-black"
                          : "bg-brand-pearl text-brand-black border-neutral-300"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <label className="inline-flex items-center gap-1 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={followSceneRouting}
                    onChange={(e) => setFollowSceneRouting(e.target.checked)}
                    className="accent-brand-red"
                  />
                  <span>Routage Scènes</span>
                </label>
              </div>

              <div className="rounded-xl border-2 border-black bg-black p-1.5 flex justify-center">
                <canvas
                  ref={previewCanvasRef}
                  width={aspectSpec.width}
                  height={aspectSpec.height}
                  className="rounded border border-neutral-800 bg-black block"
                  style={{
                    imageRendering: "pixelated",
                    width:
                      previewAspect === "9:16"
                        ? "145px"
                        : previewAspect === "4:5"
                        ? "190px"
                        : previewAspect === "1:1"
                        ? "210px"
                        : "100%",
                    aspectRatio: `${aspectSpec.width} / ${aspectSpec.height}`,
                  }}
                />
              </div>

              {/* Simulateur Section Musicale */}
              <div className="space-y-1">
                <div className="font-mono text-[10px] font-bold text-neutral-500">
                  SIMULER SECTION LRC / WHISPER :
                </div>
                <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                  {SECTION_DEMO_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSimSection(tag);
                        setFollowSceneRouting(true);
                      }}
                      className={`px-2 py-0.5 rounded border font-bold ${
                        simSection === tag
                          ? "bg-brand-red text-white border-black"
                          : "bg-brand-pearl text-brand-black border-neutral-300 hover:border-black"
                      }`}
                    >
                      {tag === "AUTO" ? "🔁 AUTO" : `#${tag}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* MODULE 4 : INSPECTOR / PRESETS DYNAMIQUES */}
          <Card
            moduleTitle="04 // INSPECTOR & PRESETS"
            moduleMeta={`${compiledActive.uniforms.length} CONTRÔLES`}
          >
            <div className="space-y-3">
              {/* Presets nommés du document actif */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="font-bold text-neutral-500 uppercase">
                    PRESETS ({activeDoc.name})
                  </span>
                  <button
                    type="button"
                    onClick={handleResetUniformsToDefaults}
                    className="text-brand-red font-bold underline"
                  >
                    ↺ Défauts
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeDoc.presets.map((presetItem) => {
                    const isActive = presetItem.id === activeDoc.activePresetId;
                    return (
                      <button
                        key={presetItem.id}
                        type="button"
                        onClick={() =>
                          updateActiveDoc((d) => ({
                            ...d,
                            activePresetId: presetItem.id,
                          }))
                        }
                        className={`px-2.5 py-1 rounded border-2 font-mono text-[11px] font-bold transition-all ${
                          isActive
                            ? "border-black bg-brand-red text-white shadow-comic-sm"
                            : "border-black bg-brand-pearl hover:bg-brand-white text-brand-black"
                        }`}
                      >
                        {presetItem.name}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="Nom preset (ex: Néon Cyber)"
                    className="flex-1 px-2 py-1 rounded border border-black bg-brand-white font-mono text-[11px]"
                  />
                  <Button
                    type="button"
                    variant="clinical"
                    size="sm"
                    onClick={handleSaveNewPreset}
                  >
                    + SAUVER
                  </Button>
                </div>
              </div>

              {/* Uniforms UI auto-générés */}
              <div className="pt-2 border-t border-neutral-200 space-y-2.5">
                {compiledActive.uniforms.length === 0 ? (
                  <p className="font-mono text-[11px] text-neutral-500">
                    Ajoute <code>{"// @param float speed = 4.0 [0.0, 20.0]"}</code>{" "}
                    ou <code>{"// @color primaryColor = \"#00F0FF\""}</code> en
                    haut du code C++ pour générer des contrôles temps réel.
                  </p>
                ) : (
                  compiledActive.uniforms.map((u) => {
                    const val = activeUniformValues[u.name] ?? u.defaultValue;
                    if (u.kind === "color") {
                      return (
                        <div
                          key={u.name}
                          className="flex items-center justify-between gap-2 font-mono text-xs"
                        >
                          <label
                            htmlFor={`u-${u.name}`}
                            className="font-bold text-brand-black"
                          >
                            {u.name}
                          </label>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-neutral-500">
                              {String(val)}
                            </span>
                            <input
                              id={`u-${u.name}`}
                              type="color"
                              value={
                                /^#[0-9a-f]{6}$/i.test(String(val))
                                  ? String(val)
                                  : "#00E5FF"
                              }
                              onChange={(e) =>
                                handleUniformChange(u.name, e.target.value)
                              }
                              className="w-8 h-6 rounded border border-black cursor-pointer"
                            />
                          </div>
                        </div>
                      );
                    }
                    if (u.kind === "bool") {
                      return (
                        <label
                          key={u.name}
                          className="flex items-center justify-between gap-2 font-mono text-xs font-bold text-brand-black cursor-pointer"
                        >
                          <span>{u.name}</span>
                          <input
                            type="checkbox"
                            checked={Boolean(val)}
                            onChange={(e) =>
                              handleUniformChange(u.name, e.target.checked)
                            }
                            className="w-4 h-4 accent-brand-red"
                          />
                        </label>
                      );
                    }
                    const numVal = Number(val);
                    return (
                      <div key={u.name} className="font-mono text-xs">
                        <div className="flex justify-between mb-0.5">
                          <span className="font-bold text-brand-black">
                            {u.name}
                          </span>
                          <span className="text-brand-red font-bold">
                            {u.kind === "int"
                              ? Math.round(numVal)
                              : numVal.toFixed(2)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={u.min ?? 0}
                          max={u.max ?? 10}
                          step={u.step ?? (u.kind === "int" ? 1 : 0.05)}
                          value={numVal}
                          onChange={(e) =>
                            handleUniformChange(
                              u.name,
                              u.kind === "int"
                                ? Math.round(Number(e.target.value))
                                : Number(e.target.value)
                            )
                          }
                          className="w-full accent-brand-red"
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* MODULE 3 : SYSTÈME DE SCÈNES, PADS VJ & ROUTAGE MUSICAL */}
      <Card
        moduleTitle="05 // SYSTÈME DE SCÈNES & ROUTAGE MUSICAL (LRC · TEMPS · PADS VJ)"
        moduleMeta={`${workspace.scenes.length} SCÈNES ROUTÉES`}
        activeIndicator
      >
        <div className="space-y-4">
          {/* Pads VJ manuels rapides */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-brand-pearl border-2 border-black">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] font-bold uppercase text-brand-black">
                PADS VJ :
              </span>
              <button
                type="button"
                onClick={() =>
                  setWorkspace((curr) => ({ ...curr, manualSceneId: null }))
                }
                className={`px-2.5 py-1 rounded border-2 font-mono text-[11px] font-bold ${
                  workspace.manualSceneId === null
                    ? "bg-brand-black text-white border-black shadow-comic-sm"
                    : "bg-brand-white text-brand-black border-neutral-300"
                }`}
              >
                🔁 AUTO (SECTION / TEMPS)
              </button>
              {workspace.scenes.map((sc) => {
                const locked = workspace.manualSceneId === sc.id;
                return (
                  <button
                    key={`pad-${sc.id}`}
                    type="button"
                    onClick={() =>
                      setWorkspace((curr) => ({
                        ...curr,
                        manualSceneId: locked ? null : sc.id,
                      }))
                    }
                    className={`px-2.5 py-1 rounded border-2 font-mono text-[11px] font-bold transition-all ${
                      locked
                        ? "bg-brand-red text-white border-black shadow-comic-sm"
                        : "bg-brand-white hover:bg-brand-pearl text-brand-black border-black"
                    }`}
                  >
                    {locked ? "🔒 " : "▶ "}
                    {sc.label}
                  </button>
                );
              })}
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAddSceneRule}
            >
              + AJOUTER SCÈNE
            </Button>
          </div>

          {/* Règles de routage des scènes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {workspace.scenes.map((sc) => {
              const targetDoc =
                workspace.documents.find((d) => d.id === sc.documentId) ??
                activeDoc;
              return (
                <div
                  key={sc.id}
                  className="p-3 rounded-xl border-2 border-black bg-brand-white space-y-2.5 font-mono text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={sc.label}
                      onChange={(e) =>
                        updateSceneRule(sc.id, { label: e.target.value })
                      }
                      className="font-bold text-brand-black bg-brand-pearl px-2 py-1 rounded border border-black flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => deleteSceneRule(sc.id)}
                      className="px-2 py-1 rounded border border-neutral-300 hover:border-brand-red text-brand-red font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-[10px] text-neutral-500 mb-0.5">
                        DOCUMENT .CPP
                      </span>
                      <select
                        value={sc.documentId}
                        onChange={(e) => {
                          const nextDoc = workspace.documents.find(
                            (d) => d.id === e.target.value
                          );
                          updateSceneRule(sc.id, {
                            documentId: e.target.value,
                            presetId: nextDoc?.activePresetId,
                          });
                        }}
                        className="w-full px-2 py-1 rounded border border-black bg-brand-pearl font-bold text-[11px]"
                      >
                        {workspace.documents.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="block text-[10px] text-neutral-500 mb-0.5">
                        PRESET ASSIGNÉ
                      </span>
                      <select
                        value={sc.presetId ?? targetDoc.activePresetId}
                        onChange={(e) =>
                          updateSceneRule(sc.id, { presetId: e.target.value })
                        }
                        className="w-full px-2 py-1 rounded border border-black bg-brand-pearl font-bold text-[11px]"
                      >
                        {targetDoc.presets.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div>
                      <span className="block text-[10px] text-neutral-500 mb-0.5">
                        ROUTAGE
                      </span>
                      <select
                        value={sc.routingMode}
                        onChange={(e) =>
                          updateSceneRule(sc.id, {
                            routingMode: e.target.value as CppSceneRoutingMode,
                          })
                        }
                        className="w-full px-2 py-1 rounded border border-black bg-brand-white text-[11px] font-bold"
                      >
                        <option value="section">Section LRC</option>
                        <option value="time">Créneau Temps</option>
                        <option value="manual">Pad VJ Manuel</option>
                      </select>
                    </div>

                    {sc.routingMode === "section" && (
                      <div>
                        <span className="block text-[10px] text-neutral-500 mb-0.5">
                          TAG (#SECTION)
                        </span>
                        <input
                          type="text"
                          value={sc.sectionTag ?? "DROP"}
                          onChange={(e) =>
                            updateSceneRule(sc.id, {
                              sectionTag: e.target.value.toUpperCase(),
                            })
                          }
                          placeholder="DROP"
                          className="w-full px-2 py-1 rounded border border-black bg-brand-white text-[11px] font-bold"
                        />
                      </div>
                    )}

                    {sc.routingMode === "time" && (
                      <div className="flex items-end gap-1">
                        <input
                          type="number"
                          min={0}
                          step={0.5}
                          value={sc.startTime ?? 0}
                          onChange={(e) =>
                            updateSceneRule(sc.id, {
                              startTime: Number(e.target.value),
                            })
                          }
                          className="w-14 px-1.5 py-1 rounded border border-black text-[11px]"
                          title="Début (s)"
                        />
                        <span className="pb-1">→</span>
                        <input
                          type="number"
                          min={0}
                          step={0.5}
                          value={sc.endTime ?? 10}
                          onChange={(e) =>
                            updateSceneRule(sc.id, {
                              endTime: Number(e.target.value),
                            })
                          }
                          className="w-14 px-1.5 py-1 rounded border border-black text-[11px]"
                          title="Fin (s)"
                        />
                      </div>
                    )}

                    <div>
                      <span className="block text-[10px] text-neutral-500 mb-0.5">
                        SCÉNO BASE
                      </span>
                      <select
                        value={sc.baseSceneId ?? ""}
                        onChange={(e) =>
                          updateSceneRule(sc.id, {
                            baseSceneId: (e.target.value || undefined) as
                              | SceneId
                              | undefined,
                          })
                        }
                        className="w-full px-2 py-1 rounded border border-black bg-brand-white text-[11px]"
                      >
                        <option value="">Pack auto</option>
                        {SCENE_CATALOG.map((base) => (
                          <option key={base.id} value={base.id}>
                            {base.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-200">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-neutral-500">TRANSITION :</span>
                      <select
                        value={sc.transition}
                        onChange={(e) =>
                          updateSceneRule(sc.id, {
                            transition: e.target.value as CppTransitionKind,
                          })
                        }
                        className="px-2 py-0.5 rounded border border-black bg-brand-pearl text-[11px] font-bold"
                      >
                        <option value="cut">Cut sec</option>
                        <option value="fade">Fondu (tint)</option>
                        <option value="glitch">Glitch (slices)</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0.1}
                        max={2}
                        step={0.05}
                        value={sc.transitionDuration}
                        onChange={(e) =>
                          updateSceneRule(sc.id, {
                            transitionDuration: Number(e.target.value),
                          })
                        }
                        className="w-14 px-1.5 py-0.5 rounded border border-black text-[11px]"
                      />
                      <span className="text-[10px] text-neutral-500">s</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* SECTION PACKS DE 5 SCÈNES (PRÉSERVÉE) */}
      <Card
        moduleTitle="PACKS DE 5 SCÈNES // IMPORT / EXPORT (C++ .HPP & JSON)"
        moduleMeta={currentPack.name}
      >
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="comic"
                size="sm"
                onClick={() => void handleCopyPrompt()}
              >
                📋 COPIER PROMPT IA COMPLET
              </Button>
              <button
                type="button"
                onClick={() => setPackRawCode(exportScenePackAsCpp(currentPack))}
                className="px-2.5 py-1.5 rounded border border-black bg-brand-pearl hover:bg-brand-white font-mono text-[11px] font-bold"
              >
                Charger C++ du pack actif
              </button>
              <button
                type="button"
                onClick={() =>
                  setPackRawCode(JSON.stringify(currentPack, null, 2))
                }
                className="px-2.5 py-1.5 rounded border border-black bg-brand-pearl hover:bg-brand-white font-mono text-[11px] font-bold"
              >
                Charger JSON du pack actif
              </button>
            </div>
          </div>

          <textarea
            rows={7}
            value={packRawCode}
            onChange={(e) => setPackRawCode(e.target.value)}
            placeholder={AI_SCENE_PACK_PROMPT}
            className="w-full p-3 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
          />

          <div className="flex justify-end">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleImportPack}
            >
              IMPORTER LE PACK &amp; ACTIVER DANS LE STUDIO
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

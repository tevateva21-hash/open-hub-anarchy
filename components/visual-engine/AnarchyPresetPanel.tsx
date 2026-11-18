"use client";

import React, { useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CodeShaderEditor } from "@/components/visual-engine/CodeShaderEditor";
import {
  AI_ANARCHY_PRESET_PROMPT,
  DEFAULT_ANARCHY_PRESETS,
  DEFAULT_NEW_CPP_SCENE_CODE,
  DEFAULT_NEW_JS_SCENE_CODE,
  JS_CYBER_TRIO_PACK,
  parseAnarchyPresetFromCode,
  type AnarchyPreset,
  type AnarchyScene,
} from "@/lib/visual-engine/anarchy-presets";
import {
  compileVisualScript,
  detectScriptLanguage,
  type ScriptLanguage,
} from "@/lib/visual-engine/cpp-runtime";

interface AnarchyPresetPanelProps {
  presets: AnarchyPreset[];
  activePreset: AnarchyPreset;
  activeSceneIndex: number;
  manualSceneLock: boolean;
  presetEnabled: boolean;
  bpm: number;
  autoSceneSwitchBeats: number;
  runtimeError: string;
  onTogglePresetEnabled: (enabled: boolean) => void;
  onSelectPreset: (presetId: string) => void;
  onSelectSceneIndex: (index: number, lockManual: boolean) => void;
  onChangeCadenceBeats: (beats: number) => void;
  onUpdateActivePreset: (updater: (curr: AnarchyPreset) => AnarchyPreset) => void;
  onInstallPreset: (newPreset: AnarchyPreset) => void;
  onDeletePreset: (presetId: string) => void;
}

export const AnarchyPresetPanel: React.FC<AnarchyPresetPanelProps> = ({
  presets,
  activePreset,
  activeSceneIndex,
  manualSceneLock,
  presetEnabled,
  bpm,
  autoSceneSwitchBeats,
  runtimeError,
  onTogglePresetEnabled,
  onSelectPreset,
  onSelectSceneIndex,
  onChangeCadenceBeats,
  onUpdateActivePreset,
  onInstallPreset,
  onDeletePreset,
}) => {
  const [showSceneEditor, setShowSceneEditor] = useState<boolean>(false);
  const [showImportExportModal, setShowImportExportModal] =
    useState<boolean>(false);
  const [showDocModal, setShowDocModal] = useState<boolean>(false);

  // État modale Import / Export
  const [modalTab, setModalTab] = useState<"export" | "import">("export");
  const [importCodeText, setImportCodeText] = useState<string>("");
  const [importPresetName, setImportPresetName] = useState<string>("");
  const [importPresetAuthor, setImportPresetAuthor] = useState<string>("");
  const [importError, setImportError] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const manualForceCppRef = useRef<boolean>(false);

  const safeSceneIdx =
    activePreset.scenes.length > 0
      ? ((activeSceneIndex % activePreset.scenes.length) +
          activePreset.scenes.length) %
        activePreset.scenes.length
      : 0;
  const currentScene: AnarchyScene | undefined =
    activePreset.scenes[safeSceneIdx] ?? activePreset.scenes[0];

  // Compilation live de la scène sélectionnée pour retour immédiat dans l'éditeur
  const compileDiag = useMemo(() => {
    if (!currentScene) return null;
    return compileVisualScript(currentScene.code, currentScene.language);
  }, [currentScene]);

  const exportJsonString = useMemo(
    () => JSON.stringify(activePreset, null, 2),
    [activePreset]
  );

  const defaultIds = useMemo(
    () => new Set(DEFAULT_ANARCHY_PRESETS.map((p) => p.id)),
    []
  );

  const updateCurrentScene = (
    updater: (scene: AnarchyScene) => AnarchyScene
  ) => {
    if (!currentScene) return;
    onUpdateActivePreset((curr) => ({
      ...curr,
      scenes: curr.scenes.map((sc, idx) =>
        idx === safeSceneIdx ? updater(sc) : sc
      ),
    }));
  };

  const handleAddScene = (lang: ScriptLanguage = "js") => {
    const nextIdx = activePreset.scenes.length + 1;
    const ext = lang === "js" ? "js" : "cpp";
    const newScene: AnarchyScene = {
      id: `scene-${Date.now()}-${nextIdx}`,
      name: `${String(nextIdx).padStart(2, "0")}_scene_${lang}.${ext}`,
      language: lang,
      code:
        lang === "js" ? DEFAULT_NEW_JS_SCENE_CODE : DEFAULT_NEW_CPP_SCENE_CODE,
    };
    onUpdateActivePreset((curr) => ({
      ...curr,
      scenes: [...curr.scenes, newScene],
    }));
    onSelectSceneIndex(activePreset.scenes.length, true);
    setShowSceneEditor(true);
    setFeedback(
      `Scène "${newScene.name}" ajoutée au Preset (${activePreset.scenes.length + 1} scènes).`
    );
  };

  const handleDuplicateScene = () => {
    if (!currentScene) return;
    const baseName = currentScene.name.replace(/\.(js|cpp)$/i, "");
    const ext = currentScene.language === "js" ? "js" : "cpp";
    const dup: AnarchyScene = {
      id: `scene-${Date.now()}-dup`,
      name: `${baseName}_copy.${ext}`,
      language: currentScene.language,
      code: currentScene.code,
    };
    onUpdateActivePreset((curr) => {
      const next = [...curr.scenes];
      next.splice(safeSceneIdx + 1, 0, dup);
      return { ...curr, scenes: next };
    });
    onSelectSceneIndex(safeSceneIdx + 1, true);
    setFeedback(`Scène dupliquée : "${dup.name}".`);
  };

  const handleMoveScene = (delta: -1 | 1) => {
    const targetIdx = safeSceneIdx + delta;
    if (targetIdx < 0 || targetIdx >= activePreset.scenes.length) return;
    onUpdateActivePreset((curr) => {
      const next = [...curr.scenes];
      const [moved] = next.splice(safeSceneIdx, 1);
      next.splice(targetIdx, 0, moved);
      return { ...curr, scenes: next };
    });
    onSelectSceneIndex(targetIdx, manualSceneLock);
  };

  const handleDeleteScene = () => {
    if (activePreset.scenes.length <= 1) {
      setFeedback("Un Preset doit conserver au moins 1 scène (scenes.length >= 1).");
      return;
    }
    const removedName = currentScene?.name ?? "Scène";
    onUpdateActivePreset((curr) => ({
      ...curr,
      scenes: curr.scenes.filter((_, idx) => idx !== safeSceneIdx),
    }));
    onSelectSceneIndex(Math.max(0, safeSceneIdx - 1), manualSceneLock);
    setFeedback(`Scène "${removedName}" supprimée.`);
  };

  const handleSwitchSceneLanguage = (lang: ScriptLanguage) => {
    if (!currentScene) return;
    manualForceCppRef.current = lang === "cpp";
    const ext = lang === "js" ? ".js" : ".cpp";
    const nextName = /\.(js|cpp)$/i.test(currentScene.name)
      ? currentScene.name.replace(/\.(js|cpp)$/i, ext)
      : `${currentScene.name}${ext}`;
    updateCurrentScene((sc) => ({
      ...sc,
      language: lang,
      name: nextName,
    }));
  };

  const handleValidateAndImportPreset = () => {
    setImportError("");
    const { preset, error } = parseAnarchyPresetFromCode(
      importCodeText,
      importPresetName,
      importPresetAuthor
    );
    if (!preset || error) {
      setImportError(error || "Preset invalide.");
      return;
    }
    onInstallPreset(preset);
    setImportCodeText("");
    setImportPresetName("");
    setImportPresetAuthor("");
    setShowImportExportModal(false);
    setFeedback(
      `✅ Preset "${preset.name}" installé (${preset.scenes.length} scène${preset.scenes.length > 1 ? "s" : ""}) — Faders & BPM (${bpm} BPM) conservés intacts !`
    );
  };

  return (
    <>
      <Card
        moduleTitle="ANARCHY_PRESETS // PACKS DYNAMIQUES JS NATIF & C++ (MULTI-SCÈNES)"
        moduleMeta={`${activePreset.name} · ${activePreset.scenes.length} SCÈNE${activePreset.scenes.length > 1 ? "S" : ""} · ${bpm} BPM (FADERS ISOLÉS)`}
        activeIndicator={presetEnabled}
      >
        <div className="space-y-3 font-mono text-xs">
          {/* Barre supérieure : Sélecteur de Preset + Cadence 2/4 mesures + Boutons Modales */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                id="btn-toggle-anarchy-preset-engine"
                variant={presetEnabled ? "comic" : "primary"}
                size="sm"
                onClick={() => onTogglePresetEnabled(!presetEnabled)}
              >
                {presetEnabled
                  ? "🟢 PRESET JS/C++ ACTIF"
                  : "▶ ACTIVER PRESET JS/C++"}
              </Button>

              <label htmlFor="anarchy-preset-select" className="sr-only">
                Sélectionner un Preset de scènes
              </label>
              <select
                id="anarchy-preset-select"
                aria-label="Sélectionner un Preset de scènes"
                value={activePreset.id}
                onChange={(e) => onSelectPreset(e.target.value)}
                className="px-2.5 py-1.5 rounded border-2 border-black bg-brand-white font-mono text-xs font-bold"
              >
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.scenes.length} scène{p.scenes.length > 1 ? "s" : ""})
                  </option>
                ))}
              </select>

              {!defaultIds.has(activePreset.id) && (
                <button
                  type="button"
                  onClick={() => onDeletePreset(activePreset.id)}
                  className="px-2 py-1 rounded border border-brand-red text-brand-red hover:bg-brand-red hover:text-white font-bold text-[10px]"
                  title="Supprimer ce Preset personnalisé"
                >
                  ✕ Suppr. Preset
                </button>
              )}

              {/* Cadence horloge musicale : 2 ou 4 mesures (sans jamais toucher au BPM ni aux faders) */}
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded border-2 border-black bg-brand-pearl text-[10px]">
                <span className="font-bold text-neutral-600 uppercase">
                  CADENCE :
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onSelectSceneIndex(safeSceneIdx, false);
                    onChangeCadenceBeats(8);
                  }}
                  className={`px-1.5 py-0.5 rounded font-bold ${
                    !manualSceneLock && autoSceneSwitchBeats === 8
                      ? "bg-brand-red text-white"
                      : "bg-brand-white text-brand-black hover:bg-neutral-200"
                  }`}
                >
                  2 MESURES (8T)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectSceneIndex(safeSceneIdx, false);
                    onChangeCadenceBeats(16);
                  }}
                  className={`px-1.5 py-0.5 rounded font-bold ${
                    !manualSceneLock && autoSceneSwitchBeats === 16
                      ? "bg-brand-red text-white"
                      : "bg-brand-white text-brand-black hover:bg-neutral-200"
                  }`}
                >
                  4 MESURES (16T)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onSelectSceneIndex(safeSceneIdx, !manualSceneLock)
                  }
                  className={`px-1.5 py-0.5 rounded font-bold ${
                    manualSceneLock
                      ? "bg-black text-white"
                      : "bg-brand-white text-neutral-600 hover:bg-neutral-200"
                  }`}
                  title="Verrouiller la scène sélectionnée ou boucler automatiquement au BPM"
                >
                  {manualSceneLock ? "🔒 FIXE" : "🔁 AUTO BPM"}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                id="btn-open-preset-import-export"
                variant="primary"
                size="sm"
                onClick={() => {
                  setModalTab("export");
                  setImportError("");
                  setShowImportExportModal(true);
                }}
              >
                📦 Importer / Exporter un Preset
              </Button>
              <Button
                type="button"
                id="btn-open-preset-doc"
                variant="comic"
                size="sm"
                onClick={() => setShowDocModal(true)}
              >
                📖 Doc / Créer un Preset
              </Button>
            </div>
          </div>

          {/* Barre des scènes dynamiques (1, 3, 5, 8+ scènes) + actions Ajouter / Dupliquer / Réordonner */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-200">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase text-neutral-500 mr-1">
                SCÈNES ({activePreset.scenes.length}) :
              </span>
              {activePreset.scenes.map((scene, idx) => {
                const isSelected = safeSceneIdx === idx;
                return (
                  <button
                    key={scene.id}
                    type="button"
                    onClick={() => onSelectSceneIndex(idx, manualSceneLock)}
                    className={`px-2.5 py-1 rounded-full border-2 text-[11px] font-bold transition-all inline-flex items-center gap-1.5 ${
                      isSelected
                        ? "border-black bg-brand-red text-white shadow-comic-sm scale-105"
                        : "border-black bg-brand-pearl hover:bg-brand-white text-brand-black"
                    }`}
                  >
                    <span>
                      {idx + 1}. {scene.name}
                    </span>
                    <span
                      className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                        scene.language === "js"
                          ? "bg-amber-300 text-black"
                          : "bg-sky-200 text-sky-950"
                      }`}
                    >
                      {scene.language.toUpperCase()}
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                id="btn-add-anarchy-scene"
                onClick={() => handleAddScene("js")}
                className="px-2.5 py-1 rounded-full border-2 border-dashed border-black bg-brand-white hover:bg-amber-200 text-brand-black text-[11px] font-bold transition-colors"
              >
                + Ajouter une scène
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleMoveScene(-1)}
                disabled={safeSceneIdx <= 0}
                className="px-2 py-1 rounded border border-black bg-brand-white disabled:opacity-40 font-bold text-[10px]"
                title="Déplacer la scène vers la gauche"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => handleMoveScene(1)}
                disabled={safeSceneIdx >= activePreset.scenes.length - 1}
                className="px-2 py-1 rounded border border-black bg-brand-white disabled:opacity-40 font-bold text-[10px]"
                title="Déplacer la scène vers la droite"
              >
                →
              </button>
              <button
                type="button"
                onClick={handleDuplicateScene}
                className="px-2 py-1 rounded border border-black bg-brand-white hover:bg-brand-pearl font-bold text-[10px]"
              >
                ⎘ Dupliquer
              </button>
              <button
                type="button"
                onClick={handleDeleteScene}
                disabled={activePreset.scenes.length <= 1}
                className="px-2 py-1 rounded border border-brand-red text-brand-red hover:bg-brand-red hover:text-white disabled:opacity-40 font-bold text-[10px]"
              >
                ✕ Supprimer
              </button>
              <button
                type="button"
                id="btn-toggle-inline-scene-code"
                onClick={() => setShowSceneEditor((v) => !v)}
                className="px-2.5 py-1 rounded border-2 border-black bg-brand-black text-white font-bold text-[10px]"
              >
                {showSceneEditor
                  ? "▲ Masquer Code Scène"
                  : `✎ Code Scène (${currentScene?.language.toUpperCase() ?? "JS"})`}
              </button>
            </div>
          </div>

          {/* Éditeur rapide de la scène active avec sélecteur JS / C++ et auto-détection au collage */}
          {showSceneEditor && currentScene && (
            <div className="p-3 rounded-xl bg-brand-pearl border-2 border-black space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-[11px] uppercase text-brand-black">
                    SCÈNE #{safeSceneIdx + 1} :
                  </span>
                  <input
                    type="text"
                    value={currentScene.name}
                    onChange={(e) =>
                      updateCurrentScene((sc) => ({
                        ...sc,
                        name: e.target.value,
                      }))
                    }
                    className="px-2 py-1 rounded border border-black bg-brand-white font-mono text-xs font-bold w-56"
                  />

                  {/* Sélecteur de langage JS Natif / C++ */}
                  <div className="inline-flex rounded border-2 border-black overflow-hidden">
                    <button
                      type="button"
                      onClick={() => handleSwitchSceneLanguage("js")}
                      className={`px-2.5 py-1 text-[11px] font-bold ${
                        currentScene.language === "js"
                          ? "bg-amber-300 text-black"
                          : "bg-brand-white text-neutral-600 hover:bg-neutral-100"
                      }`}
                    >
                      🟨 JS NATIF (Fast-Path)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchSceneLanguage("cpp")}
                      className={`px-2.5 py-1 text-[11px] font-bold border-l border-black ${
                        currentScene.language === "cpp"
                          ? "bg-sky-300 text-black"
                          : "bg-brand-white text-neutral-600 hover:bg-neutral-100"
                      }`}
                    >
                      🟦 C++
                    </button>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                    compileDiag?.ok
                      ? "bg-emerald-100 border-emerald-700 text-emerald-950"
                      : "bg-red-100 border-brand-red text-brand-red"
                  }`}
                >
                  {compileDiag?.ok
                    ? currentScene.language === "js"
                      ? "✓ V8 FAST-PATH 60 FPS PRÊT"
                      : "✓ C++ TRANSPILÉ PRÊT"
                    : compileDiag?.error || "Erreur"}
                </span>
              </div>

              <CodeShaderEditor
                id="anarchy-preset-scene-editor"
                value={currentScene.code}
                language={currentScene.language}
                errorLine={compileDiag?.errorLine}
                rows={12}
                onPasteCode={(pastedText, nextValue) => {
                  const detected = detectScriptLanguage(
                    pastedText.trim().length > 12 ? pastedText : nextValue
                  );
                  if (detected !== currentScene.language) {
                    manualForceCppRef.current = false;
                    const ext = detected === "js" ? ".js" : ".cpp";
                    updateCurrentScene((sc) => ({
                      ...sc,
                      language: detected,
                      name: sc.name.replace(/\.(js|cpp)$/i, ext),
                      code: nextValue,
                    }));
                    setFeedback(
                      `Langage auto-détecté au collage : ${detected.toUpperCase()}.`
                    );
                  }
                }}
                onChange={(nextCode) => {
                  const autoLang =
                    !manualForceCppRef.current &&
                    detectScriptLanguage(nextCode) === "js"
                      ? "js"
                      : currentScene.language;
                  updateCurrentScene((sc) => ({
                    ...sc,
                    language: autoLang,
                    code: nextCode,
                  }));
                }}
              />
            </div>
          )}

          {runtimeError && (
            <div
              role="alert"
              className="p-2 rounded border-2 border-brand-red bg-red-50 text-brand-red font-bold text-[11px]"
            >
              ⚠️ Protection try/catch active (flux audio &amp; 60 FPS maintenus) —{" "}
              {runtimeError}
            </div>
          )}

          {feedback && (
            <p className="text-[11px] font-bold text-brand-red">{feedback}</p>
          )}
        </div>
      </Card>

      {/* MODALE 1 : Importer / Exporter un Preset par Code (Partage communautaire brut) */}
      {showImportExportModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Importer ou Exporter un Preset"
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-3xl rounded-xl border-4 border-black bg-brand-white shadow-comic overflow-hidden font-mono text-xs">
            <div className="px-4 py-3 bg-brand-black text-white flex items-center justify-between border-b-2 border-black">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-brand-red text-white font-bold text-[10px]">
                  PARTAGE COMMUNAUTAIRE BRUT
                </span>
                <span className="font-bold text-sm">
                  IMPORTER / EXPORTER UN PRESET (JS NATIF &amp; C++)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowImportExportModal(false)}
                className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-brand-red text-white font-bold"
              >
                ✕ FERMER
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[82vh] overflow-y-auto">
              <div className="flex items-center gap-2 border-b-2 border-black pb-3">
                <button
                  type="button"
                  onClick={() => setModalTab("export")}
                  className={`px-3 py-1.5 rounded border-2 font-bold ${
                    modalTab === "export"
                      ? "bg-brand-red text-white border-black shadow-comic-sm"
                      : "bg-brand-pearl text-brand-black border-black"
                  }`}
                >
                  📤 EXPORTER LE PRESET ACTIF ({activePreset.scenes.length}{" "}
                  SCÈNES)
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab("import")}
                  className={`px-3 py-1.5 rounded border-2 font-bold ${
                    modalTab === "import"
                      ? "bg-brand-red text-white border-black shadow-comic-sm"
                      : "bg-brand-pearl text-brand-black border-black"
                  }`}
                >
                  📥 IMPORTER UN PRESET (CODE / JSON / IA)
                </button>
              </div>

              {modalTab === "export" ? (
                <div className="space-y-3">
                  <div className="p-2.5 rounded bg-brand-pearl border border-black text-[11px] flex flex-wrap items-center justify-between gap-2">
                    <span>
                      Preset : <strong>{activePreset.name}</strong> (
                      {activePreset.scenes.length} scène
                      {activePreset.scenes.length > 1 ? "s" : ""}) — Aucun fader
                      n&apos;est écrasé au partage.
                    </span>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard
                          ?.writeText(exportJsonString)
                          .then(() =>
                            setFeedback(
                              "📋 Code JSON du Preset copié dans le presse-papier !"
                            )
                          )
                          .catch(() => {});
                      }}
                    >
                      📋 COPIER LE BLOC EN 1 CLIC
                    </Button>
                  </div>

                  <textarea
                    readOnly
                    rows={14}
                    value={exportJsonString}
                    aria-label="Code JSON brut du Preset actif"
                    className="w-full p-3 rounded-lg border-2 border-black bg-[#0B0D13] text-emerald-300 font-mono text-[11px]"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="font-sans text-xs text-neutral-700">
                    Colle ici le bloc JSON d&apos;un Preset partagé par la
                    communauté ou généré par une IA (ou même une fonction{" "}
                    <code>renderAnarchyFrame(ctx)</code> directe). Tes{" "}
                    <strong>10 faders et ton BPM ({bpm} BPM)</strong> resteront
                    strictement intacts.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                        Nom du Preset (optionnel, remplace celui du JSON)
                      </label>
                      <input
                        type="text"
                        value={importPresetName}
                        onChange={(e) => setImportPresetName(e.target.value)}
                        placeholder="Ex: Cyber Rave 6 Scènes..."
                        className="w-full px-2.5 py-1.5 rounded border-2 border-black bg-brand-white font-mono text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                        Auteur (optionnel)
                      </label>
                      <input
                        type="text"
                        value={importPresetAuthor}
                        onChange={(e) => setImportPresetAuthor(e.target.value)}
                        placeholder="Ex: Anarchy VJ"
                        className="w-full px-2.5 py-1.5 rounded border-2 border-black bg-brand-white font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold uppercase text-neutral-600">
                        Bloc JSON du Preset (scenes.length &gt;= 1) ou Script
                        JS/C++
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setImportCodeText(
                            JSON.stringify(JS_CYBER_TRIO_PACK, null, 2)
                          )
                        }
                        className="text-[10px] font-bold text-brand-red underline"
                      >
                        Charger un exemple 3 scènes JS
                      </button>
                    </div>
                    <textarea
                      id="anarchy-preset-import-textarea"
                      rows={11}
                      value={importCodeText}
                      onChange={(e) => setImportCodeText(e.target.value)}
                      placeholder={'{\n  "name": "Mon Pack Custom",\n  "scenes": [\n    {\n      "id": "s1",\n      "name": "01_tunnel.js",\n      "language": "js",\n      "code": "function renderAnarchyFrame(ctx) { ... }"\n    }\n  ]\n}'}
                      className="w-full p-3 rounded-lg border-2 border-black bg-[#0B0D13] text-amber-200 font-mono text-[11px]"
                    />
                  </div>

                  {importError && (
                    <div
                      role="alert"
                      className="p-2.5 rounded border-2 border-brand-red bg-red-50 text-brand-red font-bold"
                    >
                      {importError}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2">
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
                      id="btn-confirm-import-preset"
                      variant="primary"
                      size="sm"
                      onClick={handleValidateAndImportPreset}
                    >
                      ✅ Valider &amp; Installer dans ma Bibliothèque
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODALE 2 : Documentation Technique Intégrée ("Doc / Créer un Preset") */}
      {showDocModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Documentation technique — Créer un Preset"
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-4xl rounded-xl border-4 border-black bg-brand-white shadow-comic overflow-hidden font-mono text-xs">
            <div className="px-4 py-3 bg-brand-black text-white flex items-center justify-between border-b-2 border-black">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-300 text-black font-bold text-[10px]">
                  DOC CRÉATEURS // JS NATIF &amp; C++
                </span>
                <span className="font-bold text-sm">
                  CRÉER UN PRESET MULTI-SCÈNES POUR OPEN HUB
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowDocModal(false)}
                className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-brand-red text-white font-bold"
              >
                ✕ FERMER
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[84vh] overflow-y-auto">
              {/* 1. Architecture & Isolation Faders / Horloge BPM */}
              <div className="p-3 rounded-lg bg-brand-pearl border-2 border-black space-y-1.5 font-sans text-xs text-neutral-800">
                <div className="font-mono font-bold text-brand-black uppercase">
                  1. Isolation des Faders, Boucle 2 / 4 Mesures &amp; Règle
                  Multi-Ratio
                </div>
                <p>
                  Un <strong>AnarchyPreset</strong> contient un nombre libre de
                  scènes (<code>scenes.length &gt;= 1</code>, en{" "}
                  <code>&quot;js&quot;</code> natif Fast-Path V8 ou{" "}
                  <code>&quot;cpp&quot;</code>). Le chargement d&apos;un Preset{" "}
                  <strong>ne réinitialise jamais les faders ni le BPM</strong> :
                  l&apos;horloge musicale fait tourner automatiquement toutes
                  les scènes du Preset toutes les{" "}
                  <strong>2 mesures (8 temps)</strong> ou{" "}
                  <strong>4 mesures (16 temps)</strong>.
                </p>
                <p>
                  <strong>Adaptation Multi-Ratio (16:9, 9:16, 4:5, 1:1) :</strong>{" "}
                  calculez toujours vos positions à partir de{" "}
                  <code>ctx.width</code> et <code>ctx.height</code> (ex:{" "}
                  <code>const cx = ctx.width * 0.5; const cy = ctx.height * 0.5;</code>
                  ) pour que chaque scène s&apos;adapte instantanément aux
                  formats TikTok/Reels, Instagram et YouTube.
                </p>
              </div>

              {/* 2. Propriétés de ctx & Méthodes de rendu */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-brand-pearl border border-black space-y-1.5">
                  <div className="font-bold text-brand-red">
                    PROPRIÉTÉS TEMPS RÉEL DE ctx
                  </div>
                  <ul className="space-y-1 text-[11px] text-neutral-800">
                    <li>
                      <code>ctx.t, ctx.bpm, ctx.beat, ctx.beatPhase</code> —
                      Temps (s), BPM, index de temps &amp; phase (0..1)
                    </li>
                    <li>
                      <code>ctx.bass, ctx.mid, ctx.treble, ctx.rms, ctx.flux</code>{" "}
                      — Enveloppes audio live (0..1) modulées par les faders
                    </li>
                    <li>
                      <code>ctx.width, ctx.height, ctx.sceneIndex</code> —
                      Dimensions du canvas actif &amp; index de scène
                    </li>
                    <li>
                      <code>
                        ctx.lyricLine, ctx.lyricWord, ctx.lyricProgress,
                        ctx.lyricSection
                      </code>{" "}
                      — Paroles LRC / Whisper &amp; section (#INTRO, #DROP...)
                    </li>
                    <li>
                      <code>
                        ctx.intensity, ctx.strobe, ctx.kickBlackout,
                        ctx.psychedelic, ctx.colorMorph, ctx.anaglyph,
                        ctx.cameraZoom, ctx.pendulumSwing
                      </code>{" "}
                      — Valeurs directes des 10 faders de la console
                    </li>
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-brand-pearl border border-black space-y-1.5">
                  <div className="font-bold text-brand-black">
                    MÉTHODES DE RENDU &amp; POST-FX (ctx.*)
                  </div>
                  <ul className="space-y-1 text-[11px] text-neutral-800">
                    <li>
                      <code>ctx.clear(color)</code> — Efface le fond (ou omettre
                      pour dessiner en surcouche du moteur 3D)
                    </li>
                    <li>
                      <code>ctx.tint(color, alpha)</code> /{" "}
                      <code>ctx.zoom(scale)</code>
                    </li>
                    <li>
                      <code>ctx.circle(x, y, r, color, fill)</code> /{" "}
                      <code>ctx.ring(x, y, r, lw, color)</code>
                    </li>
                    <li>
                      <code>ctx.line(x1, y1, x2, y2, lw, color)</code> /{" "}
                      <code>ctx.rect(x, y, w, h, color)</code>
                    </li>
                    <li>
                      <code>ctx.grid(spacing, color, scrollSpeed)</code> /{" "}
                      <code>ctx.text(str, x, y, color, size)</code>
                    </li>
                    <li>
                      <code>ctx.kaleidoscope(segments, speed)</code> /{" "}
                      <code>ctx.glitchSlices(amount)</code>
                    </li>
                    <li>
                      <code>ctx.scanlines(alpha)</code> /{" "}
                      <code>ctx.invert(amount)</code> /{" "}
                      <code>ctx.rgb(r,g,b)</code> /{" "}
                      <code>ctx.rgba(r,g,b,a)</code>
                    </li>
                  </ul>
                </div>
              </div>

              {/* 3. Prompt IA prêt à copier */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-brand-black uppercase">
                    🤖 PROMPT IA PRÊT À COPIER (GÉNÉRER UN PRESET MULTI-SCÈNES EN
                    JS NATIF)
                  </span>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard
                        ?.writeText(AI_ANARCHY_PRESET_PROMPT)
                        .then(() =>
                          setFeedback(
                            "📋 Prompt IA Preset copié ! Colle-le dans ChatGPT / Claude puis importe le JSON généré."
                          )
                        )
                        .catch(() => {});
                    }}
                  >
                    📋 COPIER LE PROMPT IA
                  </Button>
                </div>
                <pre className="p-3 rounded-lg border-2 border-black bg-[#0B0D13] text-amber-200 text-[11px] overflow-x-auto whitespace-pre-wrap max-h-48">
                  {AI_ANARCHY_PRESET_PROMPT}
                </pre>
              </div>

              {/* 4. Exemple de Preset JSON complet */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-brand-black uppercase">
                    📦 EXEMPLE DE PRESET JSON COMPLET (3 SCÈNES JS NATIF)
                  </span>
                  <Button
                    type="button"
                    variant="clinical"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard
                        ?.writeText(JSON.stringify(JS_CYBER_TRIO_PACK, null, 2))
                        .then(() =>
                          setFeedback("📋 Exemple de Preset JSON copié !")
                        )
                        .catch(() => {});
                    }}
                  >
                    📋 COPIER L&apos;EXEMPLE JSON
                  </Button>
                </div>
                <pre className="p-3 rounded-lg border-2 border-black bg-[#0B0D13] text-emerald-300 text-[11px] overflow-x-auto max-h-52">
                  {JSON.stringify(JS_CYBER_TRIO_PACK, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

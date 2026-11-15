"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  AI_SCENE_PACK_PROMPT,
  DEFAULT_SCENE_PACKS,
  exportScenePackAsCpp,
  generateRandomScenePack,
  parseScenePackFromText,
  type ScenePack,
  type ScenePackSlot,
} from "@/lib/visual-engine/scene-packs";

const PACKS_STORAGE_KEY = "openhub_visual_scene_packs_v2";

interface ScenePackManagerProps {
  authorName: string;
  liveSlotIndex: number;
  bpm: number;
  beatsPerScene: number;
  onPackChange: (pack: ScenePack) => void;
  onSelectSlot: (slotIndex: number, slot: ScenePackSlot, pack: ScenePack) => void;
}

export const ScenePackManager: React.FC<ScenePackManagerProps> = ({
  authorName,
  liveSlotIndex,
  bpm,
  beatsPerScene,
  onPackChange,
  onSelectSlot,
}) => {
  const [packs, setPacks] = useState<ScenePack[]>(DEFAULT_SCENE_PACKS);
  const [selectedPackId, setSelectedPackId] = useState<string>(
    DEFAULT_SCENE_PACKS[0].id
  );
  const [customPackName, setCustomPackName] = useState<string>("");
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [rawCode, setRawCode] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PACKS_STORAGE_KEY);
      if (raw) {
        const custom = JSON.parse(raw) as ScenePack[];
        if (Array.isArray(custom) && custom.length > 0) {
          setPacks([...DEFAULT_SCENE_PACKS, ...custom]);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const currentPack =
    packs.find((p) => p.id === selectedPackId) ?? packs[0];

  useEffect(() => {
    onPackChange(currentPack);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPack.id]);

  const saveCustomPacks = (allPacks: ScenePack[]) => {
    const defaultsIds = new Set(DEFAULT_SCENE_PACKS.map((p) => p.id));
    const customOnly = allPacks.filter((p) => !defaultsIds.has(p.id));
    try {
      window.localStorage.setItem(PACKS_STORAGE_KEY, JSON.stringify(customOnly));
    } catch {
      // ignore
    }
  };

  const handleGenerateNewPack = () => {
    const generated = generateRandomScenePack(
      authorName,
      customPackName,
      bpm,
      beatsPerScene > 0 ? beatsPerScene : 16
    );
    const next = [generated, ...packs];
    setPacks(next);
    saveCustomPacks(next);
    setSelectedPackId(generated.id);
    onPackChange(generated);
    onSelectSlot(0, generated.scenes[0], generated);
    setCustomPackName("");
    setFeedback(
      `Nouveau pack généré : "${generated.name}" (seed ${generated.seed}) — enchaînement BPM actif.`
    );
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(AI_SCENE_PACK_PROMPT);
      setFeedback(
        "Prompt IA copié ! Colle-le dans ChatGPT/Claude/Gemini puis importe le résultat."
      );
    } catch {
      setFeedback(
        "Impossible de copier automatiquement — ouvre l'éditeur pour voir le prompt."
      );
    }
  };

  const handleImportText = () => {
    const parsed = parseScenePackFromText(rawCode, authorName);
    if (!parsed) {
      setFeedback(
        "Format non reconnu. Colle un bloc C++ (AnarchySceneSlot ANARCHY_PACK[5]) ou JSON valide."
      );
      return;
    }
    const next = [parsed, ...packs];
    setPacks(next);
    saveCustomPacks(next);
    setSelectedPackId(parsed.id);
    onPackChange(parsed);
    onSelectSlot(0, parsed.scenes[0], parsed);
    setFeedback(
      `Pack "${parsed.name}" (${parsed.scenes.length} scènes) importé et prêt !`
    );
    setRawCode("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setRawCode(reader.result);
        setShowEditor(true);
        setFeedback(
          `Fichier "${file.name}" chargé. Clique sur IMPORTER & PARTAGER.`
        );
      }
    };
    reader.readAsText(file);
  };

  const handleDownload = (format: "hpp" | "json") => {
    const content =
      format === "hpp"
        ? exportScenePackAsCpp(currentPack)
        : JSON.stringify(currentPack, null, 2);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentPack.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card
      moduleTitle="PACK DE 5 SCÈNES // ENCHAÎNEMENT BPM"
      moduleMeta={`${currentPack.name} · SEED ${currentPack.seed}`}
      activeIndicator
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Choisir un pack de 5 scènes"
              value={currentPack.id}
              onChange={(e) => {
                const found = packs.find((p) => p.id === e.target.value);
                if (found) {
                  setSelectedPackId(found.id);
                  onPackChange(found);
                  onSelectSlot(0, found.scenes[0], found);
                }
              }}
              className="px-2.5 py-1.5 rounded border-2 border-black bg-brand-white font-mono text-xs font-bold"
            >
              {packs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
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
              🎲 GÉNÉRER UN PACK
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              type="button"
              variant="comic"
              size="sm"
              onClick={handleCopyPrompt}
            >
              📋 PROMPT IA
            </Button>

            <label className="cursor-pointer px-2 py-1 rounded border-2 border-black bg-brand-pearl hover:bg-brand-white font-mono text-[10px] font-bold">
              📂 .CPP / .JSON
              <input
                type="file"
                accept=".cpp,.hpp,.h,.json,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <Button
              type="button"
              variant="clinical"
              size="sm"
              onClick={() => handleDownload("hpp")}
            >
              ⬇ .HPP
            </Button>
            <Button
              type="button"
              variant="clinical"
              size="sm"
              onClick={() => handleDownload("json")}
            >
              ⬇ .JSON
            </Button>
            <Button
              type="button"
              variant="clinical"
              size="sm"
              onClick={() => setShowEditor((v) => !v)}
            >
              {showEditor ? "FERMER" : "✏️ ÉDITER / IMPORTER"}
            </Button>
          </div>
        </div>

        {/* 5 mini-pastilles compactes montrant l'enchaînement BPM sans fiches */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] font-bold uppercase text-neutral-500">
            ENCHAÎNEMENT :
          </span>
          {currentPack.scenes.map((slot, idx) => {
            const isActive = liveSlotIndex === idx;
            return (
              <button
                key={`${currentPack.id}-pill-${idx}`}
                type="button"
                onClick={() => onSelectSlot(idx, slot, currentPack)}
                title={`${slot.label || `Scène ${idx + 1}`} (${slot.sceneId} · ${slot.paletteId})`}
                className={`px-3 py-1 rounded-full border-2 font-mono text-[11px] font-bold transition-all ${
                  isActive
                    ? "border-black bg-brand-red text-white shadow-comic-sm scale-105"
                    : "border-black bg-brand-pearl hover:bg-brand-white text-brand-black"
                }`}
              >
                {idx + 1}
                {slot.label && !slot.label.startsWith("Scène ")
                  ? ` · ${slot.label}`
                  : ""}
              </button>
            );
          })}
        </div>

        {feedback && (
          <p className="font-mono text-[11px] font-bold text-brand-red">
            {feedback}
          </p>
        )}

        {showEditor && (
          <div className="p-4 rounded-xl bg-brand-pearl border-2 border-black space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold">
                COLLER UN PACK C++ (.HPP/.CPP) OU JSON (NOMS OPTIONNELS)
              </span>
              <button
                type="button"
                onClick={() => setRawCode(exportScenePackAsCpp(currentPack))}
                className="font-mono text-[10px] underline text-brand-black"
              >
                Voir le C++ du pack actif
              </button>
            </div>
            <textarea
              rows={6}
              value={rawCode}
              onChange={(e) => setRawCode(e.target.value)}
              placeholder={AI_SCENE_PACK_PROMPT}
              className="w-full p-2.5 rounded border-2 border-black bg-brand-white font-mono text-[11px]"
            />
            <div className="flex justify-end">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleImportText}
              >
                IMPORTER &amp; PARTAGER LE PACK
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

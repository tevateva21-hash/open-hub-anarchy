"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  DEFAULT_SCENE_PACKS,
  generateRandomScenePack,
  type ScenePack,
  type ScenePackSlot,
} from "@/lib/visual-engine/scene-packs";
import { CPP_SHADER_ENABLED_KEY } from "@/lib/visual-engine/cpp-runtime";
import { CPP_WORKSPACE_EVENT } from "@/lib/visual-engine/cpp-workspace";

export const PACKS_STORAGE_KEY = "openhub_visual_scene_packs_v2";
export const ACTIVE_PACK_ID_KEY = "openhub_active_pack_id_v2";

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
  const [cppEnabled, setCppEnabled] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>("");

  useEffect(() => {
    const syncCppFlag = () => {
      try {
        setCppEnabled(
          window.localStorage.getItem(CPP_SHADER_ENABLED_KEY) === "true"
        );
      } catch {
        // ignore
      }
    };
    try {
      const raw = window.localStorage.getItem(PACKS_STORAGE_KEY);
      if (raw) {
        const custom = JSON.parse(raw) as ScenePack[];
        if (Array.isArray(custom) && custom.length > 0) {
          setPacks([...DEFAULT_SCENE_PACKS, ...custom]);
        }
      }
      const savedActiveId = window.localStorage.getItem(ACTIVE_PACK_ID_KEY);
      if (savedActiveId) {
        setSelectedPackId(savedActiveId);
      }
      syncCppFlag();
    } catch {
      // ignore
    }
    window.addEventListener("storage", syncCppFlag);
    window.addEventListener("focus", syncCppFlag);
    window.addEventListener(CPP_WORKSPACE_EVENT, syncCppFlag);
    return () => {
      window.removeEventListener("storage", syncCppFlag);
      window.removeEventListener("focus", syncCppFlag);
      window.removeEventListener(CPP_WORKSPACE_EVENT, syncCppFlag);
    };
  }, []);

  const currentPack =
    packs.find((p) => p.id === selectedPackId) ?? packs[0];

  useEffect(() => {
    onPackChange(currentPack);
    try {
      window.localStorage.setItem(ACTIVE_PACK_ID_KEY, currentPack.id);
    } catch {
      // ignore
    }
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
      `Nouveau pack généré : "${generated.name}" (seed ${generated.seed}).`
    );
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

          <div className="flex flex-wrap items-center gap-2">
            {cppEnabled && (
              <span className="px-2 py-1 rounded bg-emerald-100 border border-black font-mono text-[10px] font-bold text-emerald-900">
                💻 CODE C++ ACTIF
              </span>
            )}
            <Link href="/anarchy-visual-design/editeur">
              <Button type="button" variant="comic" size="sm">
                💻 ÉDITEUR C++ &amp; SCÈNES ↗
              </Button>
            </Link>
          </div>
        </div>

        {/* 5 mini-pastilles compactes montrant l'enchaînement BPM sans éditeur interne */}
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
      </div>
    </Card>
  );
};

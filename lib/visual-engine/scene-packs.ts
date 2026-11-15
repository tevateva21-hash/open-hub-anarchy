import type { PaletteId, SceneId } from "@/lib/visual-engine/contracts";
import { PALETTE_IDS, SCENE_IDS } from "@/lib/visual-engine/presets";

export interface ScenePackSlot {
  label: string;
  sceneId: SceneId;
  paletteId: PaletteId;
  intensity: number; // 0..100
  strobe: number; // 0..100
  kaleidoscope: number; // 0..100
  feedbackTrails: number; // 0..100
  acidHueShift: number; // 0..100
}

export interface ScenePack {
  id: string;
  name: string;
  author: string;
  bpm: number;
  beatsPerScene: number;
  scenes: ScenePackSlot[];
  createdAt: string;
}

export const DEFAULT_SCENE_PACKS: ScenePack[] = [
  {
    id: "pack-anarchy-rave-5",
    name: "Anarchy Rave (5 Scènes)",
    author: "Anarchy Studio",
    bpm: 140,
    beatsPerScene: 16,
    createdAt: "2026-11-15T00:00:00Z",
    scenes: [
      {
        label: "01. Intro Industriel",
        sceneId: "industrial-city",
        paletteId: "cold-concrete",
        intensity: 65,
        strobe: 10,
        kaleidoscope: 0,
        feedbackTrails: 20,
        acidHueShift: 0,
      },
      {
        label: "02. Montée Acid",
        sceneId: "techno-therapy",
        paletteId: "acid-violet",
        intensity: 80,
        strobe: 25,
        kaleidoscope: 35,
        feedbackTrails: 45,
        acidHueShift: 40,
      },
      {
        label: "03. Drop Anaglyphe",
        sceneId: "rave-dungeon",
        paletteId: "anarchy-anaglyph",
        intensity: 95,
        strobe: 60,
        kaleidoscope: 50,
        feedbackTrails: 55,
        acidHueShift: 25,
      },
      {
        label: "04. Break PS1",
        sceneId: "ps1-nightmare",
        paletteId: "blood-red",
        intensity: 75,
        strobe: 15,
        kaleidoscope: 20,
        feedbackTrails: 70,
        acidHueShift: 15,
      },
      {
        label: "05. Climax Void",
        sceneId: "digital-void",
        paletteId: "toxic-oxide",
        intensity: 100,
        strobe: 75,
        kaleidoscope: 80,
        feedbackTrails: 65,
        acidHueShift: 60,
      },
    ],
  },
  {
    id: "pack-psy-acid-5",
    name: "Psy-Acid 145 BPM (5 Scènes)",
    author: "PsyLab",
    bpm: 145,
    beatsPerScene: 8,
    createdAt: "2026-11-15T00:00:00Z",
    scenes: [
      {
        label: "01. Tunnel Void",
        sceneId: "digital-void",
        paletteId: "acid-violet",
        intensity: 70,
        strobe: 10,
        kaleidoscope: 45,
        feedbackTrails: 50,
        acidHueShift: 55,
      },
      {
        label: "02. Furnace Pulse",
        sceneId: "rave-dungeon",
        paletteId: "furnace-amber",
        intensity: 85,
        strobe: 35,
        kaleidoscope: 60,
        feedbackTrails: 60,
        acidHueShift: 35,
      },
      {
        label: "03. Techno Therapy",
        sceneId: "techno-therapy",
        paletteId: "techno-therapy",
        intensity: 92,
        strobe: 50,
        kaleidoscope: 75,
        feedbackTrails: 75,
        acidHueShift: 70,
      },
      {
        label: "04. Toxic Oxide",
        sceneId: "industrial-city",
        paletteId: "toxic-oxide",
        intensity: 88,
        strobe: 40,
        kaleidoscope: 30,
        feedbackTrails: 40,
        acidHueShift: 45,
      },
      {
        label: "05. Red Overload",
        sceneId: "ps1-nightmare",
        paletteId: "anarchy-anaglyph",
        intensity: 98,
        strobe: 80,
        kaleidoscope: 90,
        feedbackTrails: 85,
        acidHueShift: 80,
      },
    ],
  },
];

export const AI_SCENE_PACK_PROMPT = `Génère un Pack de 5 Scènes pour Open Hub Visual Studio (Anarchy) au format C++ (.hpp) OU JSON.
Respecte exactement ces IDs autorisés :
- sceneId: "industrial-city" | "ps1-nightmare" | "rave-dungeon" | "digital-void" | "techno-therapy"
- paletteId: "furnace-amber" | "toxic-oxide" | "cold-concrete" | "techno-therapy" | "acid-violet" | "anarchy-anaglyph" | "blood-red"
- Valeurs numériques entre 0 et 100 : intensity, strobe, kaleidoscope, feedbackTrails, acidHueShift

Format C++ attendu (5 scènes) :
// PACK_NAME: Mon Pack Techno 5 Scenes
// BPM: 140
// BEATS_PER_SCENE: 16
struct AnarchySceneSlot { const char* label; const char* sceneId; const char* paletteId; int intensity; int strobe; int kaleidoscope; int feedbackTrails; int acidHueShift; };
static const AnarchySceneSlot ANARCHY_PACK[5] = {
  {"01. Intro", "industrial-city", "cold-concrete", 65, 10, 0, 20, 0},
  {"02. Build", "techno-therapy", "acid-violet", 80, 25, 35, 45, 40},
  {"03. Drop", "rave-dungeon", "anarchy-anaglyph", 95, 60, 50, 55, 25},
  {"04. Break", "ps1-nightmare", "blood-red", 75, 15, 20, 70, 15},
  {"05. Climax", "digital-void", "toxic-oxide", 100, 75, 80, 65, 60}
};`;

function sanitizeSceneId(val: string): SceneId {
  return SCENE_IDS.includes(val as SceneId)
    ? (val as SceneId)
    : "techno-therapy";
}

function sanitizePaletteId(val: string): PaletteId {
  return PALETTE_IDS.includes(val as PaletteId)
    ? (val as PaletteId)
    : "anarchy-anaglyph";
}

function clamp100(n: unknown, fallback = 75): number {
  const num = Number(n);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(0, Math.min(100, Math.round(num)));
}

/**
 * Parse un pack de 5 scènes depuis du JSON ou un fichier C++ (.hpp / .cpp).
 */
export function parseScenePackFromText(
  raw: string,
  author = "Communauté"
): ScenePack | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // 1. Tentative JSON
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      const arr = Array.isArray(parsed) ? parsed : parsed.scenes;
      if (Array.isArray(arr) && arr.length > 0) {
        const scenes: ScenePackSlot[] = arr.slice(0, 5).map((item, idx) => ({
          label: String(item.label || `Scène ${idx + 1}`),
          sceneId: sanitizeSceneId(String(item.sceneId || "")),
          paletteId: sanitizePaletteId(String(item.paletteId || "")),
          intensity: clamp100(item.intensity, 80),
          strobe: clamp100(item.strobe, 25),
          kaleidoscope: clamp100(item.kaleidoscope, 30),
          feedbackTrails: clamp100(item.feedbackTrails, 40),
          acidHueShift: clamp100(item.acidHueShift, 20),
        }));
        return {
          id: `pack-${Date.now()}`,
          name: String(
            (!Array.isArray(parsed) && parsed.name) || "Pack Importé (JSON)"
          ),
          author: String(
            (!Array.isArray(parsed) && parsed.author) || author
          ),
          bpm: Number(!Array.isArray(parsed) && parsed.bpm) || 140,
          beatsPerScene:
            Number(!Array.isArray(parsed) && parsed.beatsPerScene) || 16,
          scenes,
          createdAt: new Date().toISOString(),
        };
      }
    } catch {
      // continue vers le parseur C++
    }
  }

  // 2. Parseur C++ (.hpp / .cpp)
  const nameMatch = trimmed.match(/\/\/\s*PACK_NAME\s*:\s*(.+)/i);
  const bpmMatch = trimmed.match(/\/\/\s*BPM\s*:\s*(\d+)/i);
  const beatsMatch = trimmed.match(/\/\/\s*BEATS_PER_SCENE\s*:\s*(\d+)/i);

  const rowRegex =
    /\{\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*\}/g;

  const scenes: ScenePackSlot[] = [];
  let match: RegExpExecArray | null = rowRegex.exec(trimmed);
  while (match && scenes.length < 5) {
    scenes.push({
      label: match[1],
      sceneId: sanitizeSceneId(match[2]),
      paletteId: sanitizePaletteId(match[3]),
      intensity: clamp100(match[4], 80),
      strobe: clamp100(match[5], 25),
      kaleidoscope: clamp100(match[6], 30),
      feedbackTrails: clamp100(match[7], 40),
      acidHueShift: clamp100(match[8], 20),
    });
    match = rowRegex.exec(trimmed);
  }

  if (scenes.length === 0) return null;

  return {
    id: `pack-cpp-${Date.now()}`,
    name: nameMatch?.[1]?.trim() || "Pack Importé (C++)",
    author,
    bpm: bpmMatch ? Number(bpmMatch[1]) : 140,
    beatsPerScene: beatsMatch ? Number(beatsMatch[1]) : 16,
    scenes,
    createdAt: new Date().toISOString(),
  };
}

export function exportScenePackAsCpp(pack: ScenePack): string {
  const rows = pack.scenes
    .map(
      (s) =>
        `  {"${s.label.replace(/"/g, "'")}", "${s.sceneId}", "${s.paletteId}", ${s.intensity}, ${s.strobe}, ${s.kaleidoscope}, ${s.feedbackTrails}, ${s.acidHueShift}}`
    )
    .join(",\n");

  return `// PACK_NAME: ${pack.name}
// AUTHOR: ${pack.author}
// BPM: ${pack.bpm}
// BEATS_PER_SCENE: ${pack.beatsPerScene}
#pragma once

struct AnarchySceneSlot {
  const char* label;
  const char* sceneId;
  const char* paletteId;
  int intensity;
  int strobe;
  int kaleidoscope;
  int feedbackTrails;
  int acidHueShift;
};

static const AnarchySceneSlot ANARCHY_PACK[${pack.scenes.length}] = {
${rows}
};
`;
}

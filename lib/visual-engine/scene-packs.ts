import type { PaletteId, SceneId } from "@/lib/visual-engine/contracts";
import { PALETTE_IDS, SCENE_IDS } from "@/lib/visual-engine/presets";

export interface ScenePackSlot {
  label?: string;
  sceneId: SceneId;
  paletteId: PaletteId;
  intensity: number; // 0..100
  strobe: number; // 0..100
  kaleidoscope: number; // 0..100
  feedbackTrails: number; // 0..100
  acidHueShift: number; // 0..100
  bloom?: number; // 0..100
  glitch?: number; // 0..100
  seed?: number;
}

export interface ScenePack {
  id: string;
  name: string;
  author: string;
  bpm: number;
  beatsPerScene: number;
  seed: number;
  scenes: ScenePackSlot[];
  createdAt: string;
}

export const DEFAULT_SCENE_PACKS: ScenePack[] = [
  {
    id: "pack-ps2-enter-the-dragon",
    name: "PS2 // Enter the Dragon (5 Scènes)",
    author: "Anarchy Studio",
    bpm: 140,
    beatsPerScene: 16,
    seed: 2003,
    createdAt: "2026-11-15T00:00:00Z",
    scenes: [
      {
        label: "01. Dojo Néon",
        sceneId: "industrial-city",
        paletteId: "cold-concrete",
        intensity: 68,
        strobe: 10,
        kaleidoscope: 0,
        feedbackTrails: 22,
        acidHueShift: 0,
        bloom: 35,
        glitch: 8,
        seed: 101,
      },
      {
        label: "02. Enter the Dragon",
        sceneId: "rave-dungeon",
        paletteId: "anarchy-anaglyph",
        intensity: 88,
        strobe: 35,
        kaleidoscope: 30,
        feedbackTrails: 48,
        acidHueShift: 18,
        bloom: 55,
        glitch: 15,
        seed: 202,
      },
      {
        label: "03. Katana Overdrive",
        sceneId: "techno-therapy",
        paletteId: "blood-red",
        intensity: 95,
        strobe: 60,
        kaleidoscope: 55,
        feedbackTrails: 62,
        acidHueShift: 35,
        bloom: 70,
        glitch: 28,
        seed: 303,
      },
      {
        label: "04. PS2 Nightmare",
        sceneId: "ps1-nightmare",
        paletteId: "furnace-amber",
        intensity: 80,
        strobe: 20,
        kaleidoscope: 25,
        feedbackTrails: 72,
        acidHueShift: 15,
        bloom: 45,
        glitch: 35,
        seed: 404,
      },
      {
        label: "05. Digital Void",
        sceneId: "digital-void",
        paletteId: "acid-violet",
        intensity: 100,
        strobe: 75,
        kaleidoscope: 82,
        feedbackTrails: 68,
        acidHueShift: 65,
        bloom: 80,
        glitch: 40,
        seed: 505,
      },
    ],
  },
  {
    id: "pack-psy-acid-5",
    name: "Psy-Acid 145 BPM (5 Scènes)",
    author: "PsyLab",
    bpm: 145,
    beatsPerScene: 8,
    seed: 1450,
    createdAt: "2026-11-15T00:00:00Z",
    scenes: [
      {
        label: "01. Tunnel Void",
        sceneId: "digital-void",
        paletteId: "acid-violet",
        intensity: 72,
        strobe: 12,
        kaleidoscope: 45,
        feedbackTrails: 50,
        acidHueShift: 55,
        bloom: 60,
        glitch: 10,
        seed: 111,
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
        bloom: 50,
        glitch: 20,
        seed: 222,
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
        bloom: 75,
        glitch: 25,
        seed: 333,
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
        bloom: 40,
        glitch: 30,
        seed: 444,
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
        bloom: 85,
        glitch: 45,
        seed: 555,
      },
    ],
  },
];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Génère un nouveau Pack de 5 Scènes procédural unique (chaque génération
 * possède sa propre seed, ses palettes, intensités, géométries et effets).
 * Le nom est optionnel : s'il est vide, un identifiant court est généré.
 */
export function generateRandomScenePack(
  author = "Anonyme",
  customName?: string,
  bpm = 140,
  beatsPerScene = 16
): ScenePack {
  const seed = Math.floor(Math.random() * 900000) + 100000;
  const rng = mulberry32(seed);

  const shuffledScenes = [...SCENE_IDS].sort(() => rng() - 0.5);
  const shuffledPalettes = [...PALETTE_IDS].sort(() => rng() - 0.5);

  const scenes: ScenePackSlot[] = Array.from({ length: 5 }, (_, idx) => ({
    label: `Scène ${idx + 1}`,
    sceneId: shuffledScenes[idx % shuffledScenes.length],
    paletteId: shuffledPalettes[idx % shuffledPalettes.length],
    intensity: Math.round(55 + rng() * 45),
    strobe: Math.round(rng() * 75),
    kaleidoscope: Math.round(rng() * 95),
    feedbackTrails: Math.round(15 + rng() * 80),
    acidHueShift: Math.round(rng() * 100),
    bloom: Math.round(20 + rng() * 75),
    glitch: Math.round(rng() * 60),
    seed: Math.floor(rng() * 99999) + 1,
  }));

  const cleanName = customName?.trim();
  return {
    id: `pack-gen-${seed}`,
    name: cleanName || `Pack #${seed.toString().slice(-4)} (5 Scènes)`,
    author: author.trim() || "Anonyme",
    bpm,
    beatsPerScene,
    seed,
    scenes,
    createdAt: new Date().toISOString(),
  };
}

export const AI_SCENE_PACK_PROMPT = `Génère un Pack de 5 Scènes pour Open Hub Visual Studio (Anarchy) au format C++ (.hpp) OU JSON.
Les noms des scènes et du pack sont libres / optionnels.
IDs autorisés :
- sceneId: "industrial-city" | "ps1-nightmare" | "rave-dungeon" | "digital-void" | "techno-therapy"
- paletteId: "furnace-amber" | "toxic-oxide" | "cold-concrete" | "techno-therapy" | "acid-violet" | "anarchy-anaglyph" | "blood-red"
- Valeurs numériques entre 0 et 100 : intensity, strobe, kaleidoscope, feedbackTrails, acidHueShift

Format C++ attendu (5 scènes) :
// PACK_NAME: Pack Libre 5 Scenes
// BPM: 140
// BEATS_PER_SCENE: 16
struct AnarchySceneSlot { const char* label; const char* sceneId; const char* paletteId; int intensity; int strobe; int kaleidoscope; int feedbackTrails; int acidHueShift; };
static const AnarchySceneSlot ANARCHY_PACK[5] = {
  {"01", "industrial-city", "cold-concrete", 65, 10, 0, 20, 0},
  {"02", "techno-therapy", "acid-violet", 80, 25, 35, 45, 40},
  {"03", "rave-dungeon", "anarchy-anaglyph", 95, 60, 50, 55, 25},
  {"04", "ps1-nightmare", "blood-red", 75, 15, 20, 70, 15},
  {"05", "digital-void", "toxic-oxide", 100, 75, 80, 65, 60}
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
          label: item.label ? String(item.label) : `Scène ${idx + 1}`,
          sceneId: sanitizeSceneId(String(item.sceneId || "")),
          paletteId: sanitizePaletteId(String(item.paletteId || "")),
          intensity: clamp100(item.intensity, 80),
          strobe: clamp100(item.strobe, 25),
          kaleidoscope: clamp100(item.kaleidoscope, 30),
          feedbackTrails: clamp100(item.feedbackTrails, 40),
          acidHueShift: clamp100(item.acidHueShift, 20),
          bloom: clamp100(item.bloom, 45),
          glitch: clamp100(item.glitch, 20),
          seed: Number(item.seed) || (idx + 1) * 137,
        }));
        return {
          id: `pack-${Date.now()}`,
          name: String(
            (!Array.isArray(parsed) && parsed.name) ||
              `Pack #${Date.now().toString().slice(-4)}`
          ),
          author: String(
            (!Array.isArray(parsed) && parsed.author) || author
          ),
          bpm: Number(!Array.isArray(parsed) && parsed.bpm) || 140,
          beatsPerScene:
            Number(!Array.isArray(parsed) && parsed.beatsPerScene) || 16,
          seed: Number(!Array.isArray(parsed) && parsed.seed) || Date.now(),
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
    /\{\s*"([^"]*)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*\}/g;

  const scenes: ScenePackSlot[] = [];
  let match: RegExpExecArray | null = rowRegex.exec(trimmed);
  while (match && scenes.length < 5) {
    scenes.push({
      label: match[1] || `Scène ${scenes.length + 1}`,
      sceneId: sanitizeSceneId(match[2]),
      paletteId: sanitizePaletteId(match[3]),
      intensity: clamp100(match[4], 80),
      strobe: clamp100(match[5], 25),
      kaleidoscope: clamp100(match[6], 30),
      feedbackTrails: clamp100(match[7], 40),
      acidHueShift: clamp100(match[8], 20),
      bloom: 50,
      glitch: 20,
      seed: (scenes.length + 1) * 211,
    });
    match = rowRegex.exec(trimmed);
  }

  if (scenes.length === 0) return null;

  return {
    id: `pack-cpp-${Date.now()}`,
    name: nameMatch?.[1]?.trim() || `Pack C++ #${Date.now().toString().slice(-4)}`,
    author,
    bpm: bpmMatch ? Number(bpmMatch[1]) : 140,
    beatsPerScene: beatsMatch ? Number(beatsMatch[1]) : 16,
    seed: Date.now(),
    scenes,
    createdAt: new Date().toISOString(),
  };
}

export function exportScenePackAsCpp(pack: ScenePack): string {
  const rows = pack.scenes
    .map(
      (s, i) =>
        `  {"${(s.label || `Scène ${i + 1}`).replace(/"/g, "'")}", "${s.sceneId}", "${s.paletteId}", ${s.intensity}, ${s.strobe}, ${s.kaleidoscope}, ${s.feedbackTrails}, ${s.acidHueShift}}`
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

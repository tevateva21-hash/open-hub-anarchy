import {
  detectScriptLanguage,
  type ScriptLanguage,
} from "@/lib/visual-engine/cpp-runtime";
import { DEFAULT_CPP_DOCUMENTS } from "@/lib/visual-engine/cpp-workspace";

export const ANARCHY_PRESETS_STORAGE_KEY = "openhub_anarchy_presets_v1";
export const ACTIVE_ANARCHY_PRESET_ID_KEY = "openhub_active_anarchy_preset_id_v1";
export const ANARCHY_PRESETS_EVENT = "openhub:anarchy-presets-updated";

export interface AnarchyScene {
  id: string;
  name: string;
  language: "js" | "cpp";
  code: string;
}

export interface AnarchyPreset {
  id: string;
  name: string;
  author?: string;
  scenes: AnarchyScene[]; // Nombre libre de scènes (1, 3, 5, 8+)
}

/**
 * Migration des 5 scènes actuelles par défaut de l'application vers le premier Preset officiel
 * "Default — Anarchy Pack", combinant C++ et JavaScript natif.
 */
export const DEFAULT_ANARCHY_PACK: AnarchyPreset = {
  id: "preset-default-anarchy-pack",
  name: "Default — Anarchy Pack",
  author: "Anarchy Studio",
  scenes: DEFAULT_CPP_DOCUMENTS.map((doc, idx) => ({
    id: `scene-default-${idx + 1}-${doc.id}`,
    name: doc.name,
    language: doc.language ?? (doc.name.endsWith(".js") ? "js" : "cpp"),
    code: doc.code,
  })),
};

/**
 * Second preset officiel en JavaScript natif pur à 3 scènes (illustre le nombre libre de scènes
 * et l'exécution Fast-Path V8 sans transpileur).
 */
export const JS_CYBER_TRIO_PACK: AnarchyPreset = {
  id: "preset-js-cyber-trio",
  name: "JS Natif — Cyber Low-Poly Trio (3 Scènes)",
  author: "Open Hub JS Lab",
  scenes: [
    {
      id: "scene-js-trio-1",
      name: "01_hypercube_wireframe.js",
      language: "js",
      code: `// @param float rotSpeed = 1.6 [0.1, 6.0]
// @color wireColor = "#00F0FF"
// @color coreColor = "#FF1B24"

let angleX = 0;
let angleY = 0;

const VERTS = [
  [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
  [-1, -1,  1], [1, -1,  1], [1, 1,  1], [-1, 1,  1],
];
const EDGES = [
  [0,1],[1,2],[2,3],[3,0],
  [4,5],[5,6],[6,7],[7,4],
  [0,4],[1,5],[2,6],[3,7],
];

function renderAnarchyFrame(ctx) {
  const cx = ctx.width * 0.5;
  const cy = ctx.height * 0.5;
  const scale = Math.min(ctx.width, ctx.height) * (0.22 + ctx.bass * 0.14) * (ctx.cameraZoom || 1);

  angleY += 0.018 * rotSpeed * (1 + ctx.bass * 0.8);
  angleX += 0.011 * rotSpeed * (1 + ctx.mid * 0.5);

  const cosY = Math.cos(angleY), sinY = Math.sin(angleY);
  const cosX = Math.cos(angleX), sinX = Math.sin(angleX);

  const proj = VERTS.map(([x, y, z]) => {
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;
    const y2 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX + 3.2;
    const f = scale / Math.max(0.8, z2);
    return [cx + x1 * f, cy + y2 * f];
  });

  for (let i = 0; i < EDGES.length; i++) {
    const [a, b] = EDGES[i];
    ctx.line(proj[a][0], proj[a][1], proj[b][0], proj[b][1], 1.6 + ctx.treble * 2, i % 3 === 0 ? coreColor : wireColor);
  }
  ctx.ring(cx, cy, 12 + ctx.bass * 36, 2, coreColor);
}`,
    },
    {
      id: "scene-js-trio-2",
      name: "02_acid_oscilloscope.js",
      language: "js",
      code: `// @param int bars = 14 [4, 28]
// @color waveColor = "#D4FF33"
// @color accentColor = "#FF1B24"

function renderAnarchyFrame(ctx) {
  const cy = ctx.height * 0.5;
  const stepX = ctx.width / bars;

  for (let i = 0; i < bars; i++) {
    const x = (i + 0.5) * stepX;
    const phase = ctx.t * 4.2 + i * 0.45;
    const amp = (Math.sin(phase) * 0.5 + 0.5) * (0.25 + ctx.bass * 0.75) * (ctx.height * 0.38);
    ctx.line(x, cy - amp, x, cy + amp, 2.2, i % 2 === 0 ? waveColor : accentColor);
    ctx.circle(x, cy - amp, 2.5 + ctx.treble * 4, "#FFFFFF", true);
  }

  if (ctx.flux > 0.3) {
    ctx.glitchSlices(ctx.flux * 0.7);
  }
}`,
    },
    {
      id: "scene-js-trio-3",
      name: "03_vortex_kaleido.js",
      language: "js",
      code: `// @param int rings = 6 [2, 12]
// @color ringColor = "#00E5FF"

function renderAnarchyFrame(ctx) {
  const cx = ctx.width * 0.5;
  const cy = ctx.height * 0.5;
  const maxR = Math.min(ctx.width, ctx.height) * 0.46;

  for (let i = 0; i < rings; i++) {
    const p = ((ctx.t * 0.45 + i / rings) % 1);
    const r = 6 + p * maxR * (0.8 + ctx.bass * 0.4);
    ctx.ring(cx, cy, r, 1.5 + (1 - p) * 2.5, i % 2 === 0 ? ringColor : "#FF1B24");
  }

  if (ctx.psychedelic > 0.1 || ctx.mid > 0.35) {
    ctx.kaleidoscope(6, 0.8 + ctx.mid);
  }
}`,
    },
  ],
};

export const DEFAULT_ANARCHY_PRESETS: AnarchyPreset[] = [
  DEFAULT_ANARCHY_PACK,
  JS_CYBER_TRIO_PACK,
];

export const DEFAULT_NEW_JS_SCENE_CODE = `// Nouvelle scène JavaScript Natif (Fast-Path V8 60 FPS)
// Les faders live et le BPM du Studio pilotent automatiquement ctx.*
function renderAnarchyFrame(ctx) {
  const cx = ctx.width * 0.5;
  const cy = ctx.height * 0.5;
  const radius = (16 + ctx.bass * 48) * (ctx.intensity || 0.8);

  ctx.grid(24, "rgba(0, 229, 255, 0.25)", 28 + ctx.bpm * 0.15);
  ctx.ring(cx, cy, radius, 2.2, "#FF1B24");
  ctx.circle(cx, cy, 6 + ctx.treble * 18, "#00E5FF", true);

  if (ctx.lyricWord) {
    ctx.text(ctx.lyricWord, 12, ctx.height - 18, "#FFFFFF", 11);
  }
}`;

export const DEFAULT_NEW_CPP_SCENE_CODE = `// Nouvelle scène C++ (transpilée à la volée avec protection try/catch)
#include <cmath>

void renderAnarchyFrame(AnarchyCtx& ctx) {
  float cx = ctx.width * 0.5f;
  float cy = ctx.height * 0.5f;
  float r = 18.0f + ctx.bass * 44.0f;

  ctx.grid(24, "#00E5FF", 32.0f);
  ctx.ring(cx, cy, r, 2.0f, "#FF1B24");
  ctx.circle(cx, cy, 6.0f + ctx.treble * 16.0f, "#FFFFFF", true);
}`;

export const AI_ANARCHY_PRESET_PROMPT = `Tu es un expert Creative Coding / VJing pour **Open Hub — Anarchy Visual Studio**.
Génère un **Preset JSON complet** (\`AnarchyPreset\`) contenant un nombre libre de scènes (ex: 3 à 6 scènes) en **JavaScript Natif** (\`"language": "js"\`) prêtes à être collées dans la modale **"Importer / Exporter un Preset"**.

### 1. Structure JSON stricte attendue
Réponds uniquement avec un bloc JSON valide respectant cette interface :
\`\`\`json
{
  "id": "preset-custom-ai",
  "name": "Nom du Preset",
  "author": "Créateur / IA",
  "scenes": [
    {
      "id": "scene-1",
      "name": "01_intro_wireframe.js",
      "language": "js",
      "code": "let spin = 0;\\nfunction renderAnarchyFrame(ctx) {\\n  const cx = ctx.width * 0.5, cy = ctx.height * 0.5;\\n  spin += 0.02 * (1 + ctx.bass);\\n  ctx.ring(cx, cy, 20 + ctx.bass * 45, 2, '#00E5FF');\\n}"
    }
  ]
}
\`\`\`

### 2. Règles d'or du moteur JavaScript Natif (Fast-Path 60 FPS)
- Chaque scène définit \`function renderAnarchyFrame(ctx) { ... }\`.
- Tu peux déclarer des variables/tableaux/fonctions helpers **en dehors** de \`renderAnarchyFrame(ctx)\` : leur état persiste à 60 FPS d'une frame à l'autre !
- **N'écrase jamais les contrôles utilisateur** : utilise les variables temps réel de \`ctx\` alimentées par les 10 faders et l'horloge BPM du Studio :
  - Horloge & BPM : \`ctx.t\` (secondes), \`ctx.bpm\`, \`ctx.beat\` (entier), \`ctx.beatPhase\` (0..1).
  - Audio live (0..1, modulés par les faders Bass/Treble) : \`ctx.bass\`, \`ctx.mid\`, \`ctx.treble\`, \`ctx.rms\`, \`ctx.flux\`.
  - Faders live (0..1) : \`ctx.intensity\`, \`ctx.strobe\`, \`ctx.kickBlackout\`, \`ctx.psychedelic\`, \`ctx.colorMorph\`, \`ctx.anaglyph\`, \`ctx.cameraZoom\`, \`ctx.pendulumSwing\`.
  - Paroles Whisper/LRC : \`ctx.lyricLine\`, \`ctx.lyricWord\`, \`ctx.lyricProgress\` (0..1), \`ctx.lyricSection\` ("INTRO", "DROP", "REFRAIN"...).
  - Multi-ratios (16:9, 9:16 TikTok, 4:5 Insta, 1:1) : calcule toujours tes coordonnées en relatif avec \`ctx.width\` et \`ctx.height\` (ex: \`const cx = ctx.width * 0.5; const cy = ctx.height * 0.5;\`).
- Méthodes de dessin & FX sur \`ctx\` :
  - \`ctx.clear(color)\` (optionnel : si omis, dessine en surcouche par-dessus le moteur 3D PS1/PS2 d'Open Hub ; si appelé, remplace le fond).
  - \`ctx.line(x1, y1, x2, y2, lw, color)\`, \`ctx.rect(x, y, w, h, color)\`, \`ctx.circle(x, y, r, color, fill)\`, \`ctx.ring(x, y, r, lw, color)\`, \`ctx.grid(spacing, color, speed)\`, \`ctx.text(str, x, y, color, size)\`.
  - Post-FX : \`ctx.zoom(scale)\`, \`ctx.tint(color, alpha)\`, \`ctx.kaleidoscope(segments, speed)\`, \`ctx.glitchSlices(amount)\`, \`ctx.scanlines(alpha)\`, \`ctx.invert(amount)\`, \`ctx.rgb(r,g,b)\`, \`ctx.rgba(r,g,b,a)\`.`;

function sanitizeScene(raw: unknown, idx: number): AnarchyScene | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const code = typeof obj.code === "string" ? obj.code : "";
  if (!code.trim()) return null;

  const rawName =
    typeof obj.name === "string" && obj.name.trim()
      ? obj.name.trim()
      : `scene_${idx + 1}.js`;
  const rawLang = obj.language;
  const language: ScriptLanguage =
    rawLang === "js" || rawLang === "cpp"
      ? rawLang
      : rawName.toLowerCase().endsWith(".cpp")
      ? "cpp"
      : detectScriptLanguage(code);

  const id =
    typeof obj.id === "string" && obj.id.trim()
      ? obj.id.trim()
      : `scene-${Date.now()}-${idx}`;

  return {
    id,
    name: rawName,
    language,
    code,
  };
}

export function sanitizeAnarchyPreset(
  raw: unknown,
  fallbackName = "Preset Importé"
): AnarchyPreset | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const rawScenes = Array.isArray(obj.scenes) ? obj.scenes : null;
  if (!rawScenes || rawScenes.length === 0) return null;

  const scenes: AnarchyScene[] = [];
  for (let i = 0; i < rawScenes.length; i++) {
    const s = sanitizeScene(rawScenes[i], i);
    if (s) scenes.push(s);
  }
  if (scenes.length === 0) return null;

  const name =
    typeof obj.name === "string" && obj.name.trim()
      ? obj.name.trim()
      : fallbackName;
  const author =
    typeof obj.author === "string" && obj.author.trim()
      ? obj.author.trim()
      : "Communauté";
  const id =
    typeof obj.id === "string" && obj.id.trim()
      ? obj.id.trim()
      : `preset-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  return {
    id,
    name,
    author,
    scenes,
  };
}

/**
 * Analyse et valide un Preset collé par l'utilisateur :
 * - Supporte un objet JSON `AnarchyPreset` (`{ name, scenes: [...] }`)
 * - Supporte un tableau JSON direct `AnarchyScene[]` (`[ { name, language, code }, ... ]`)
 * - Supporte un bloc entouré de backticks Markdown (```json ... ```)
 * - Supporte même un script JS ou C++ brut unique (le convertit automatiquement en Preset à 1 scène)
 */
export function parseAnarchyPresetFromCode(
  rawText: string,
  customName?: string,
  customAuthor?: string
): { preset: AnarchyPreset | null; error?: string } {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return { preset: null, error: "Le champ de code est vide." };
  }

  // Nettoyer d'éventuels blocs markdown ```json ... ```
  const fencedMatch = trimmed.match(/^```(?:json|js|javascript|cpp|c\+\+)?\s*([\s\S]*?)```$/i);
  const candidate = (fencedMatch ? fencedMatch[1] : trimmed).trim();

  if (candidate.startsWith("{") || candidate.startsWith("[")) {
    try {
      const parsed = JSON.parse(candidate);
      const normalizedObj = Array.isArray(parsed)
        ? {
            id: `preset-${Date.now()}`,
            name: customName?.trim() || "Preset Communautaire",
            author: customAuthor?.trim() || "Communauté",
            scenes: parsed,
          }
        : parsed;

      const preset = sanitizeAnarchyPreset(
        normalizedObj,
        customName?.trim() || "Preset Communautaire"
      );
      if (!preset) {
        return {
          preset: null,
          error:
            "Format JSON invalide : le Preset doit contenir un tableau `scenes` non vide (`scenes.length >= 1`) avec `{ name, language, code }`.",
        };
      }
      if (customName?.trim()) {
        preset.name = customName.trim();
      }
      if (customAuthor?.trim()) {
        preset.author = customAuthor.trim();
      }
      // Garantir un ID unique à l'import pour ne pas écraser le preset par défaut
      if (preset.id === DEFAULT_ANARCHY_PACK.id) {
        preset.id = `preset-${Date.now()}`;
      }
      return { preset };
    } catch (err) {
      return {
        preset: null,
        error: `Erreur de syntaxe JSON : ${
          err instanceof Error ? err.message : "JSON mal formé"
        }`,
      };
    }
  }

  // Si l'utilisateur colle directement une fonction `renderAnarchyFrame` en JS ou C++
  if (/renderAnarchyFrame/.test(candidate)) {
    const lang = detectScriptLanguage(candidate);
    const ext = lang === "js" ? "js" : "cpp";
    const name = customName?.trim() || `Preset Direct (${lang.toUpperCase()})`;
    return {
      preset: {
        id: `preset-${Date.now()}`,
        name,
        author: customAuthor?.trim() || "Communauté",
        scenes: [
          {
            id: `scene-${Date.now()}-1`,
            name: `01_scene_principale.${ext}`,
            language: lang,
            code: candidate,
          },
        ],
      },
    };
  }

  return {
    preset: null,
    error:
      "Format non reconnu. Colle un objet JSON AnarchyPreset (`{ \"name\": \"...\", \"scenes\": [...] }`) ou une fonction `renderAnarchyFrame(ctx)`.",
  };
}

export function loadAnarchyPresets(): {
  presets: AnarchyPreset[];
  activePresetId: string;
} {
  if (typeof window === "undefined") {
    return {
      presets: DEFAULT_ANARCHY_PRESETS,
      activePresetId: DEFAULT_ANARCHY_PACK.id,
    };
  }

  let customPresets: AnarchyPreset[] = [];
  try {
    const raw = window.localStorage.getItem(ANARCHY_PRESETS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        customPresets = parsed
          .map((item, idx) => sanitizeAnarchyPreset(item, `Preset #${idx + 1}`))
          .filter((p): p is AnarchyPreset => p !== null);
      }
    }
  } catch {
    // ignore storage errors
  }

  // Permet aussi à l'utilisateur de modifier les scènes des presets officiels et de les persister
  const customById = new Map(customPresets.map((p) => [p.id, p]));
  const mergedDefaults = DEFAULT_ANARCHY_PRESETS.map(
    (def) => customById.get(def.id) ?? def
  );
  const defaultIds = new Set(DEFAULT_ANARCHY_PRESETS.map((d) => d.id));
  const strictlyCustom = customPresets.filter((p) => !defaultIds.has(p.id));
  const allPresets = [...mergedDefaults, ...strictlyCustom];

  let activePresetId = DEFAULT_ANARCHY_PACK.id;
  try {
    const savedId = window.localStorage.getItem(ACTIVE_ANARCHY_PRESET_ID_KEY);
    if (savedId && allPresets.some((p) => p.id === savedId)) {
      activePresetId = savedId;
    }
  } catch {
    // ignore
  }

  return { presets: allPresets, activePresetId };
}

export function saveAnarchyPresets(
  presets: AnarchyPreset[],
  activePresetId?: string
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      ANARCHY_PRESETS_STORAGE_KEY,
      JSON.stringify(presets)
    );
    if (activePresetId) {
      window.localStorage.setItem(ACTIVE_ANARCHY_PRESET_ID_KEY, activePresetId);
    }
    window.dispatchEvent(new CustomEvent(ANARCHY_PRESETS_EVENT));
  } catch {
    // ignore quota errors
  }
}

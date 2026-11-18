import {
  detectScriptLanguage,
  type ScriptLanguage,
} from "@/lib/visual-engine/cpp-runtime";
import { DEFAULT_CPP_DOCUMENTS } from "@/lib/visual-engine/cpp-workspace";

export const ANARCHY_PRESETS_STORAGE_KEY = "openhub_anarchy_presets_v2";
export const ACTIVE_ANARCHY_PRESET_ID_KEY = "openhub_active_anarchy_preset_id_v2";
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
 * Premier Preset 3D Officiel : "PS2 // Enter the Dragon (5 Scènes 3D)"
 * Convertit l'intégralité du moteur 3D d'origine (Dojo Néon, Temple Dragon, Katana Overdrive,
 * Cour Brutaliste PS2, Mégapole Serveurs) en scènes 3D JS/C++ directement éditables et partageables.
 */
export const PS2_ENTER_THE_DRAGON_3D_PACK: AnarchyPreset = {
  id: "preset-ps2-enter-the-dragon-3d",
  name: "PS2 // Enter the Dragon (5 Scènes 3D)",
  author: "Anarchy 3D Engine",
  scenes: DEFAULT_CPP_DOCUMENTS.map((doc, idx) => ({
    id: `scene-ps2-dragon-${idx + 1}`,
    name: doc.name,
    language: doc.language ?? (doc.name.endsWith(".js") ? "js" : "cpp"),
    code: doc.code,
  })),
};

// Alias de compatibilité pour les imports existants
export const DEFAULT_ANARCHY_PACK: AnarchyPreset = PS2_ENTER_THE_DRAGON_3D_PACK;

/**
 * Second Preset 3D Officiel : "Psy-Acid 145 BPM (5 Scènes 3D)"
 * Convertit le pack 3D Psy-Acid d'origine en 5 scènes 3D programmables (JS natif & C++).
 */
export const PSY_ACID_145_3D_PACK: AnarchyPreset = {
  id: "preset-psy-acid-145-3d",
  name: "Psy-Acid 145 BPM (5 Scènes 3D)",
  author: "Anarchy 3D Lab",
  scenes: [
    {
      id: "scene-psy-3d-1",
      name: "01_tunnel_void_3d.js",
      language: "js",
      code: `// Psy-Acid 3D // Tunnel Void — Couloir 3D Acide & Portiques Rotatifs
// @param float speed = 5.2 [1.0, 14.0]
// @color acidGreen = "#D4FF33"
// @color cyanGlow = "#00F5A0"

let tunnelSpin = 0;

function renderAnarchyFrame(ctx) {
  tunnelSpin += 0.032 * (1 + ctx.bass);

  ctx.setCamera(
    Math.sin(ctx.t * 1.2) * 0.75,
    1.55,
    -5.2,
    0,
    1.0,
    14,
    66
  );
  ctx.setFog("#06100B", 3.0, 22);
  ctx.setAmbientLight("#10281C", 0.38 + ctx.rms * 0.25);
  ctx.setDirectionalLight(0.4, 1.0, -0.5, acidGreen, 0.9 + ctx.treble * 0.45);

  ctx.drawTerrain3D(
    speed * (1 + ctx.bass * 0.45),
    1.15 + ctx.bass * 0.65,
    "#0A1A12",
    acidGreen,
    "corridor"
  );

  for (let i = 0; i < 6; i++) {
    const z = ((i * 3.1 - (ctx.t * speed * 2.4) % 18.6) + 18.6) % 18.6 + 1.8;
    const rot = tunnelSpin + i * 0.52;
    const col = i % 2 === 0 ? acidGreen : cyanGlow;
    ctx.drawBox3D(0, 1.5, z, 2.9 + ctx.bass * 0.7, 0.26, 0.26, 0, 0, rot, "#12261C", col, false);
    ctx.drawBox3D(0, 1.5, z, 0.26, 2.9 + ctx.bass * 0.7, 0.26, 0, 0, rot, "#12261C", col, false);
  }

  ctx.drawCharacter3D(0, 0, 3.6, ctx.t * speed * 2.2, "cyborg", "#E2F8EC", acidGreen);
  ctx.drawParticles3D(48, 12, speed * 1.5, acidGreen, 2.2);
  ctx.scanlines(0.18);
}`,
    },
    {
      id: "scene-psy-3d-2",
      name: "02_furnace_pulse_3d.js",
      language: "js",
      code: `// Psy-Acid 3D // Furnace Pulse — Canyon Volcanique & Monolithes Incandescents
// @param float speed = 4.4 [1.0, 12.0]
// @color lavaRed = "#FF2A1B"
// @color amberNeon = "#FFB800"

function renderAnarchyFrame(ctx) {
  ctx.setCamera(
    Math.sin(ctx.t * 0.8) * 1.1,
    1.8 + ctx.bass * 0.35,
    -5.6,
    0,
    0.9,
    12,
    62
  );
  ctx.setFog("#140706", 3.5, 22);
  ctx.setAmbientLight("#2B120E", 0.4 + ctx.rms * 0.25);
  ctx.setDirectionalLight(-0.4, 1.0, -0.5, amberNeon, 0.9 + ctx.treble * 0.4);

  ctx.drawTerrain3D(
    speed * (1 + ctx.bass * 0.4),
    1.35 + ctx.bass * 0.75,
    "#1C0B09",
    lavaRed,
    "mountains"
  );

  for (let i = 0; i < 5; i++) {
    const z = ((i * 3.8 - (ctx.t * speed * 2.0) % 19) + 19) % 19 + 1.6;
    const h = 1.6 + (i % 3) * 0.65 + ctx.bass * 1.7;
    ctx.drawBox3D(-2.7, h * 0.5, z, 0.8, h, 0.8, 0, ctx.t * 0.4, 0, "#2A120E", lavaRed, false);
    ctx.drawBox3D( 2.7, h * 0.5, z, 0.8, h, 0.8, 0, -ctx.t * 0.4, 0, "#2A120E", amberNeon, false);
  }

  ctx.drawCharacter3D(0, 0, 3.6, ctx.t * speed * 2.3, "runner", "#F4E4DF", lavaRed);
  ctx.drawParticles3D(45, 11, speed * 1.4, amberNeon, 2.3);
  ctx.scanlines(0.18);
}`,
    },
    {
      id: "scene-psy-3d-3",
      name: "03_techno_therapy_3d.js",
      language: "js",
      code: `// Psy-Acid 3D // Techno Therapy — Dalles Flottantes & Égaliseur 3D
// @param int cols = 6 [3, 10]
// @color cyanNeon = "#00F0FF"
// @color magentaNeon = "#FF1B54"

function renderAnarchyFrame(ctx) {
  ctx.setCamera(
    Math.sin(ctx.t * 0.65) * 1.6,
    2.1,
    -5.8,
    0,
    1.1,
    7.5,
    60
  );
  ctx.setFog("#080B16", 3.5, 22);
  ctx.setAmbientLight("#182038", 0.36);
  ctx.setDirectionalLight(0.3, 1.0, -0.5, cyanNeon, 0.9);

  ctx.drawTerrain3D(3.5, 0.85 + ctx.bass * 0.55, "#0E1426", cyanNeon, "waves");

  for (let i = 0; i < cols; i++) {
    const x = (i - (cols - 1) * 0.5) * 1.15;
    const h = 0.7 + Math.abs(Math.sin(ctx.t * 3.4 + i * 0.8)) * 2.1 * (0.45 + ctx.bass * 0.95);
    const col = i % 2 === 0 ? cyanNeon : magentaNeon;
    ctx.drawBox3D(x, h * 0.5, 6.2, 0.7, h, 0.7, 0, ctx.t * 0.35, 0, "#1A243B", col, false);
  }

  ctx.drawCharacter3D(0, 0, 3.5, ctx.t * 5.2, "katana", "#E6ECF5", magentaNeon);
  ctx.drawParticles3D(40, 12, 2.4, cyanNeon, 2.0);
  ctx.scanlines(0.18);
}`,
    },
    {
      id: "scene-psy-3d-4",
      name: "04_toxic_oxide_3d.js",
      language: "js",
      code: `// Psy-Acid 3D // Toxic Oxide — Donjon Bio-Mécanique & Cubes en Lévitation
// @param float speed = 4.0 [1.0, 10.0]
// @color toxicLime = "#B8FF1B"
// @color tealNeon = "#00E5FF"

function renderAnarchyFrame(ctx) {
  ctx.setCamera(
    Math.cos(ctx.t * 0.75) * 1.2,
    1.75,
    -5.4,
    0,
    1.0,
    11,
    64
  );
  ctx.setFog("#07120E", 3.2, 21);
  ctx.setAmbientLight("#122A22", 0.38);
  ctx.setDirectionalLight(-0.3, 1.0, -0.6, toxicLime, 0.88 + ctx.treble * 0.4);

  ctx.drawTerrain3D(speed, 1.05 + ctx.bass * 0.6, "#0B1D16", toxicLime, "dungeon");

  for (let i = 0; i < 5; i++) {
    const angle = ctx.t * 0.9 + i * 1.256;
    const rx = Math.cos(angle) * 2.4;
    const rz = 6.0 + Math.sin(angle) * 2.2;
    const ry = 1.4 + Math.sin(ctx.t * 2.6 + i) * 0.45;
    ctx.drawBox3D(rx, ry, rz, 0.85, 0.85, 0.85, angle, angle * 1.3, 0, "#163026", i % 2 === 0 ? toxicLime : tealNeon, false);
  }

  ctx.drawCharacter3D(0, 0, 3.6, ctx.t * speed * 2.1, "cyborg", "#E0F2EA", toxicLime);
  ctx.drawParticles3D(42, 11, speed * 1.3, tealNeon, 2.1);
  ctx.scanlines(0.18);
}`,
    },
    {
      id: "scene-psy-3d-5",
      name: "05_red_overload_3d.cpp",
      language: "cpp",
      code: `// Psy-Acid 3D // Red Overload — Cathédrale Industrielle & Strobe Aigu (C++)
// @param float speed = 4.8 [1.0, 12.0]
// @color redCore = "#FF1B24"
// @color whiteHot = "#FFFFFF"
#include <cmath>

void renderAnarchyFrame(AnarchyCtx& ctx) {
  ctx.setCamera(
    sinf(ctx.t * 0.95f) * 0.9f,
    1.8f,
    -5.5f,
    0.0f,
    1.1f,
    12.0f,
    64.0f
  );
  ctx.setFog("#120608", 3.0f, 22.0f);
  ctx.setAmbientLight("#2B0E14", 0.4f);
  ctx.setDirectionalLight(0.2f, 1.0f, -0.5f, redCore, 0.95f + ctx.treble * 0.5f);

  ctx.drawTerrain3D(speed, 1.25f + ctx.bass * 0.7f, "#1A090C", redCore, "canyon");

  for (int i = 0; i < 5; i++) {
    float z = fmodf(i * 3.5f - ctx.t * speed * 2.1f + 22.0f, 17.5f) + 1.6f;
    float h = 2.0f + ctx.bass * 1.6f;
    ctx.drawBox3D(-2.5f, h * 0.5f, z, 0.65f, h, 0.65f, 0.0f, 0.0f, 0.0f, "#280C12", redCore, false);
    ctx.drawBox3D( 2.5f, h * 0.5f, z, 0.65f, h, 0.65f, 0.0f, 0.0f, 0.0f, "#280C12", whiteHot, false);
  }

  ctx.drawCharacter3D(0.0f, 0.0f, 3.5f, ctx.t * speed * 2.3f, "katana", "#F8FAFC", redCore);
  ctx.drawParticles3D(50, 12.0f, speed * 1.5f, redCore, 2.3f);

  if (ctx.flux > 0.28f) {
    ctx.glitchSlices(ctx.flux * 0.75f);
  }
  ctx.scanlines(0.20f);
}`,
    },
  ],
};

// Alias de compatibilité
export const JS_CYBER_TRIO_PACK: AnarchyPreset = PSY_ACID_145_3D_PACK;

export const DEFAULT_ANARCHY_PRESETS: AnarchyPreset[] = [
  PS2_ENTER_THE_DRAGON_3D_PACK,
  PSY_ACID_145_3D_PACK,
];

/**
 * Génère à la volée un nouveau Preset 3D complet (5 scènes 3D éditables en JS natif & C++)
 * lorsque l'utilisateur clique sur "🎲 Générer un Pack 3D".
 */
export function generateProcedural3DPreset(seed: number): AnarchyPreset {
  const cleanSeed = Math.abs(Math.round(seed)) || 1337;
  const palettes = [
    { name: "Cyber Samouraï", fog: "#080C18", ground: "#10162A", neonA: "#00F0FF", neonB: "#FF1B24" },
    { name: "Bio-Acide PS2", fog: "#06120C", ground: "#0B1E14", neonA: "#D4FF33", neonB: "#00F5A0" },
    { name: "Solar Temple", fog: "#140A06", ground: "#22110A", neonA: "#FFB800", neonB: "#FF2A1B" },
    { name: "Neo-Tokyo Void", fog: "#0E0718", ground: "#180D2B", neonA: "#FF1B8D", neonB: "#00E5FF" },
  ];
  const pal = palettes[cleanSeed % palettes.length];
  const terrains = ["canyon", "dungeon", "corridor", "mountains", "waves"] as const;
  const chars = ["katana", "runner", "cyborg"] as const;
  const speedBase = Number((3.4 + (cleanSeed % 25) * 0.1).toFixed(1));

  const scenes: AnarchyScene[] = [0, 1, 2, 3, 4].map((idx) => {
    const tStyle = terrains[(cleanSeed + idx) % terrains.length];
    const cStyle = chars[(cleanSeed + idx) % chars.length];
    const colA = idx % 2 === 0 ? pal.neonA : pal.neonB;
    const colB = idx % 2 === 0 ? pal.neonB : pal.neonA;
    const sp = Number((speedBase + idx * 0.35).toFixed(1));

    return {
      id: `scene-gen-${cleanSeed}-${idx + 1}`,
      name: `0${idx + 1}_${tStyle}_${cStyle}_3d.js`,
      language: "js",
      code: `// Scène 3D générée #${idx + 1} (${pal.name} — Seed ${cleanSeed})
// @param float speed = ${sp} [0.5, 12.0]
// @color primaryNeon = "${colA}"
// @color secondaryNeon = "${colB}"
// @toggle wireframe3D = false

let spin = 0;

function renderAnarchyFrame(ctx) {
  spin += 0.025 * (1 + ctx.bass);

  ctx.setCamera(
    Math.sin(ctx.t * 0.75) * 0.9,
    1.75 + ctx.bass * 0.3,
    -5.6,
    0,
    1.0,
    12,
    62
  );
  ctx.setFog("${pal.fog}", 3.5, 23);
  ctx.setAmbientLight("${pal.ground}", 0.38 + ctx.rms * 0.25);
  ctx.setDirectionalLight(-0.4, 1.0, -0.5, primaryNeon, 0.9 + ctx.treble * 0.45);

  ctx.drawTerrain3D(
    speed * (1 + ctx.bass * 0.4),
    1.05 + ctx.bass * 0.65,
    "${pal.ground}",
    primaryNeon,
    "${tStyle}"
  );

  for (let i = 0; i < 5; i++) {
    const z = ((i * 3.6 - (ctx.t * speed * 2.1) % 18) + 18) % 18 + 1.6;
    const h = 1.6 + (i % 3) * 0.6 + ctx.bass * 1.5;
    ctx.drawBox3D(-2.6, h * 0.5, z, 0.65, h, 0.65, 0, spin * 0.3, 0, "${pal.ground}", primaryNeon, wireframe3D);
    ctx.drawBox3D( 2.6, h * 0.5, z, 0.65, h, 0.65, 0, -spin * 0.3, 0, "${pal.ground}", secondaryNeon, wireframe3D);
  }

  ctx.drawCharacter3D(0, 0, 3.6, ctx.t * speed * 2.2, "${cStyle}", "#E8ECF4", secondaryNeon);
  ctx.drawParticles3D(42, 12, speed * 1.4, primaryNeon, 2.2);

  if (ctx.lyricWord) {
    ctx.text(ctx.lyricWord, 12, ctx.height - 16, "#FFFFFF", 12);
  }
  ctx.scanlines(0.18);
}`,
    };
  });

  return {
    id: `preset-3d-pack-${cleanSeed}`,
    name: `PS2 // ${pal.name} #${cleanSeed % 1000} (5 Scènes 3D)`,
    author: "Générateur 3D Anarchy",
    scenes,
  };
}

export const DEFAULT_NEW_JS_SCENE_CODE = `// Nouvelle scène 3D JavaScript Natif (Moteur 3D Unifié 60 FPS)
// Les 10 faders live et l'horloge BPM du Studio pilotent automatiquement ctx.*
// @param float speed = 3.8 [0.5, 12.0]
// @color neonColor = "#00F0FF"
// @color accentColor = "#FF1B24"

let spin = 0;

function renderAnarchyFrame(ctx) {
  spin += 0.025 * (1 + ctx.bass);

  ctx.setCamera(Math.sin(ctx.t * 0.7) * 0.85, 1.8, -5.6, 0, 1.0, 12, 62);
  ctx.setFog("#090C16", 3.5, 22);
  ctx.setAmbientLight("#1A2238", 0.38);
  ctx.setDirectionalLight(-0.4, 1.0, -0.5, neonColor, 0.9 + ctx.treble * 0.4);

  ctx.drawTerrain3D(speed * (1 + ctx.bass * 0.4), 1.0 + ctx.bass * 0.6, "#101628", neonColor, "canyon");

  for (let i = 0; i < 4; i++) {
    const z = ((i * 4.0 - (ctx.t * speed * 2.0) % 16) + 16) % 16 + 2.0;
    ctx.drawBox3D(-2.5, 1.3, z, 0.6, 2.6 + ctx.bass * 0.8, 0.6, 0, spin * 0.3, 0, "#1A2236", neonColor, false);
    ctx.drawBox3D( 2.5, 1.3, z, 0.6, 2.6 + ctx.bass * 0.8, 0.6, 0, -spin * 0.3, 0, "#1A2236", accentColor, false);
  }

  ctx.drawCharacter3D(0, 0, 3.6, ctx.t * speed * 2.2, "katana", "#E4E8F2", accentColor);
  ctx.drawParticles3D(40, 12, speed * 1.4, neonColor, 2.2);

  if (ctx.lyricWord) {
    ctx.text(ctx.lyricWord, 12, ctx.height - 16, "#FFFFFF", 12);
  }
  ctx.scanlines(0.18);
}`;

export const DEFAULT_NEW_CPP_SCENE_CODE = `// Nouvelle scène 3D C++ (Moteur 3D Unifié avec protection try/catch)
// @param float speed = 3.8 [0.5, 12.0]
// @color neonColor = "#00E5FF"
// @color accentColor = "#FF1B24"
#include <cmath>

void renderAnarchyFrame(AnarchyCtx& ctx) {
  ctx.setCamera(sinf(ctx.t * 0.7f) * 0.85f, 1.8f, -5.6f, 0.0f, 1.0f, 12.0f, 62.0f);
  ctx.setFog("#090C16", 3.5f, 22.0f);
  ctx.setAmbientLight("#1A2238", 0.38f);
  ctx.setDirectionalLight(-0.4f, 1.0f, -0.5f, neonColor, 0.9f);

  ctx.drawTerrain3D(speed, 1.0f + ctx.bass * 0.6f, "#101628", neonColor, "canyon");

  for (int i = 0; i < 4; i++) {
    float z = fmodf(i * 4.0f - ctx.t * speed * 2.0f + 20.0f, 16.0f) + 2.0f;
    ctx.drawBox3D(-2.5f, 1.3f, z, 0.6f, 2.6f + ctx.bass * 0.8f, 0.6f, 0.0f, 0.0f, 0.0f, "#1A2236", neonColor, false);
    ctx.drawBox3D( 2.5f, 1.3f, z, 0.6f, 2.6f + ctx.bass * 0.8f, 0.6f, 0.0f, 0.0f, 0.0f, "#1A2236", accentColor, false);
  }

  ctx.drawCharacter3D(0.0f, 0.0f, 3.6f, ctx.t * speed * 2.2f, "katana", "#E4E8F2", accentColor);
  ctx.drawParticles3D(40, 12.0f, speed * 1.4f, neonColor, 2.2f);
  ctx.scanlines(0.18f);
}`;

export const AI_ANARCHY_PRESET_PROMPT = `Tu es un expert Creative Coding 3D / VJing pour **Open Hub — Anarchy Visual Studio**.
Génère un **Preset 3D JSON complet** (\`AnarchyPreset\`) contenant un nombre libre de scènes 3D (ex: 3 à 5 scènes) en **JavaScript Natif** (\`"language": "js"\`) prêtes à être collées dans la modale **"Importer / Exporter un Preset"**.

### 1. Structure JSON stricte attendue
Réponds uniquement avec un bloc JSON valide respectant cette interface :
\`\`\`json
{
  "id": "preset-custom-3d-ai",
  "name": "Nom du Preset 3D",
  "author": "Créateur / IA",
  "scenes": [
    {
      "id": "scene-1",
      "name": "01_dojo_katana_3d.js",
      "language": "js",
      "code": "let spin = 0;\\nfunction renderAnarchyFrame(ctx) {\\n  spin += 0.02 * (1 + ctx.bass);\\n  ctx.setCamera(Math.sin(ctx.t * 0.6) * 0.8, 1.8, -5.6, 0, 1.0, 12, 62);\\n  ctx.setFog('#090C16', 3.5, 22);\\n  ctx.drawTerrain3D(3.8, 1.1 + ctx.bass * 0.6, '#101628', '#00F0FF', 'canyon');\\n  ctx.drawCharacter3D(0, 0, 3.6, ctx.t * 6.0, 'katana', '#E4E8F2', '#FF1B24');\\n  ctx.drawParticles3D(40, 12, 4.0, '#00F0FF', 2.2);\\n}"
    }
  ]
}
\`\`\`

### 2. API du Moteur 3D Unifié (Fast-Path 60 FPS)
- Chaque scène définit \`function renderAnarchyFrame(ctx) { ... }\`.
- **Contrôle de la Caméra & Environnement 3D** :
  - \`ctx.setCamera(x, y, z, targetX, targetY, targetZ, fov)\`
  - \`ctx.setFog(color, near, far)\`
  - \`ctx.setAmbientLight(color, intensity)\`
  - \`ctx.setDirectionalLight(x, y, z, color, intensity)\`
- **Primitives 3D Low-Poly / PS2 avec éclairage Lambert, brouillard & ombres au sol** :
  - \`ctx.drawTerrain3D(speed, amplitude, color, gridColor, style)\` où \`style\` = \`"canyon"\` | \`"mountains"\` | \`"waves"\` | \`"dungeon"\` | \`"corridor"\`.
  - \`ctx.drawBox3D(x, y, z, w, h, d, rotX, rotY, rotZ, color, emissiveColor, wireframe)\`
  - \`ctx.drawCharacter3D(x, y, z, animPhase, style, primaryColor, accentColor)\` où \`style\` = \`"katana"\` | \`"runner"\` | \`"cyborg"\`.
  - \`ctx.drawParticles3D(count, spread, speed, color, size)\`
- **Surcouches 2D HUD & Post-FX (appliqués par-dessus la scène 3D)** :
  - \`ctx.text(str, x, y, color, size)\`, \`ctx.glitchSlices(amount)\`, \`ctx.scanlines(alpha)\`, \`ctx.invert(amount)\`, \`ctx.zoom(scale)\`, \`ctx.tint(color, alpha)\`.
- **Variables Audio & 10 Faders Live sur \`ctx\` (ne jamais les écraser)** :
  - \`ctx.t\`, \`ctx.bpm\`, \`ctx.beat\`, \`ctx.beatPhase\`, \`ctx.bass\`, \`ctx.mid\`, \`ctx.treble\`, \`ctx.rms\`, \`ctx.flux\`, \`ctx.intensity\`, \`ctx.strobe\`, \`ctx.kickBlackout\`, \`ctx.psychedelic\`, \`ctx.colorMorph\`, \`ctx.anaglyph\`, \`ctx.cameraZoom\`, \`ctx.pendulumSwing\`, \`ctx.lyricLine\`, \`ctx.lyricWord\`, \`ctx.lyricSection\`.`;

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

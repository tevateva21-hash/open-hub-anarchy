import { Anarchy3DSceneBuffer } from "@/lib/visual-engine/engine-3d";

export const CPP_SHADER_STORAGE_KEY = "openhub_cpp_shader_v1";
export const CPP_SHADER_ENABLED_KEY = "openhub_cpp_shader_enabled_v1";

export type ScriptLanguage = "cpp" | "js";

export type CppUniformValue = number | string | boolean;

export type CppUniformKind = "float" | "int" | "color" | "bool";

export interface CppUniformSpec {
  name: string;
  kind: CppUniformKind;
  defaultValue: CppUniformValue;
  min?: number;
  max?: number;
  step?: number;
  line: number;
}

export interface CppCompileResult {
  ok: boolean;
  language?: ScriptLanguage;
  fn: ((ctx: CppRenderContext, uniforms?: Record<string, CppUniformValue>) => void) | null;
  uniforms: CppUniformSpec[];
  error?: string;
  errorLine?: number;
  transpiledCode?: string;
}

export interface CppRenderContext {
  t: number;
  bpm: number;
  beat: number;
  beatPhase: number;
  bass: number;
  mid: number;
  treble: number;
  rms: number;
  flux: number;
  width: number;
  height: number;
  sceneIndex: number;
  lyricLine: string;
  lyricWord: string;
  lyricProgress: number;
  lyricSection: string;
  intensity: number;
  strobe: number;
  kickBlackout: number;
  psychedelic: number;
  colorMorph: number;
  anaglyph: number;
  cameraZoom: number;
  pendulumSwing: number;
  params: Record<string, CppUniformValue>;
  // Primitives & Contrôles 3D PS2 / Low-Poly
  setCamera: (
    x?: number,
    y?: number,
    z?: number,
    targetX?: number,
    targetY?: number,
    targetZ?: number,
    fov?: number
  ) => void;
  setFog: (color?: string, near?: number, far?: number) => void;
  setAmbientLight: (color?: string, intensity?: number) => void;
  setDirectionalLight: (
    x?: number,
    y?: number,
    z?: number,
    color?: string,
    intensity?: number
  ) => void;
  drawBox3D: (
    x?: number,
    y?: number,
    z?: number,
    w?: number,
    h?: number,
    d?: number,
    rotX?: number,
    rotY?: number,
    rotZ?: number,
    color?: string,
    emissiveColor?: string,
    wireframe?: boolean
  ) => void;
  drawTerrain3D: (
    speed?: number,
    amplitude?: number,
    color?: string,
    gridColor?: string,
    style?: string
  ) => void;
  drawCharacter3D: (
    x?: number,
    y?: number,
    z?: number,
    animPhase?: number,
    style?: string,
    primaryColor?: string,
    accentColor?: string
  ) => void;
  drawParticles3D: (
    count?: number,
    spread?: number,
    speed?: number,
    color?: string,
    size?: number
  ) => void;
  // Overlays 2D & Post-FX
  clear: (color?: string) => void;
  background: (r: number, g: number, b: number, alpha?: number) => void;
  tint: (color: string, alpha?: number) => void;
  rgb: (r: number, g: number, b: number) => string;
  rgba: (r: number, g: number, b: number, a: number) => string;
  circle: (
    x: number,
    y: number,
    radius: number,
    color?: string,
    fill?: boolean
  ) => void;
  ring: (
    x: number,
    y: number,
    radius: number,
    lineWidth?: number,
    color?: string
  ) => void;
  line: (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    lineWidth?: number,
    color?: string
  ) => void;
  rect: (x: number, y: number, w: number, h: number, color?: string) => void;
  grid: (spacing?: number, color?: string, scrollSpeed?: number) => void;
  kaleidoscope: (segments?: number, speed?: number) => void;
  glitchSlices: (amount?: number) => void;
  scanlines: (alpha?: number) => void;
  invert: (amount?: number) => void;
  zoom: (scale?: number) => void;
  text: (str: string, x: number, y: number, color?: string, size?: number) => void;
}

export interface CppPresetTemplate {
  id: string;
  name: string;
  language: ScriptLanguage;
  code: string;
}

export const CPP_PRESET_TEMPLATES: CppPresetTemplate[] = [
  {
    id: "js-ps2-dojo-runner-3d",
    name: "JS 3D // PS2 Dojo Neon & Katana Runner",
    language: "js",
    code: `// @param float runSpeed = 2.6 [0.5, 8.0]
// @param float camDist = 6.8 [3.5, 14.0]
// @color fogColor = "#140A1E"
// @color neonColor = "#00F0FF"
// @color bladeColor = "#FF1B24"

let runPhase = 0;

function renderAnarchyFrame(ctx) {
  runPhase += 0.032 * runSpeed * (0.7 + ctx.bass * 1.1);

  ctx.setCamera(
    Math.sin(ctx.t * 0.65) * 1.4,
    1.65 + ctx.bass * 0.55,
    -camDist,
    0,
    0.2,
    5.5,
    64
  );
  ctx.setFog(fogColor, 4.0, 22.0);
  ctx.setAmbientLight("#FFFFFF", 0.55 + ctx.rms * 0.35);
  ctx.setDirectionalLight(-3.5, 7.5, -4.0, neonColor, 1.2 + ctx.treble * 0.8);

  // Sol & montagnes 3D en défilement
  ctx.drawTerrain3D(runSpeed * 1.4, 1.1 + ctx.bass * 0.9, "#1B1534", neonColor, "canyon");

  // Portiques Torii / Piliers Dojo 3D
  for (let i = 0; i < 4; i++) {
    const z = ((i * 4.2 - (ctx.t * runSpeed * 2.2) % 16.8) + 16.8) % 16.8 - 1.0;
    const h = 2.6 + ctx.mid * 1.2;
    ctx.drawBox3D(-2.6, -0.3, z, 0.45, h, 0.45, 0, 0, 0, "#24193C", bladeColor, true);
    ctx.drawBox3D( 2.6, -0.3, z, 0.45, h, 0.45, 0, 0, 0, "#24193C", bladeColor, true);
    ctx.drawBox3D( 0.0,  1.15 + ctx.bass * 0.25, z, 5.8, 0.32, 0.48, 0, 0, 0, bladeColor, neonColor, true);
  }

  // Personnage 3D articulé low-poly avec katana néon
  const jumpY = -0.65 + Math.max(0, Math.sin(ctx.beatPhase * Math.PI)) * ctx.bass * 0.85;
  ctx.drawCharacter3D(0, jumpY, 2.2, runPhase, "katana", bladeColor, neonColor);

  ctx.drawParticles3D(42, 11, runSpeed * 2.4, neonColor, 2.2);

  if (ctx.flux > 0.35) ctx.glitchSlices(ctx.flux * 0.6);
  if (ctx.lyricWord) {
    ctx.text(ctx.lyricWord, 12, ctx.height - 18, "#FFFFFF", 11);
  }
}`,
  },
  {
    id: "js-ps2-obelisk-courtyard-3d",
    name: "JS 3D // PS1 Nightmare Cour & Monolithe",
    language: "js",
    code: `// @param float orbitSpeed = 0.55 [0.1, 3.0]
// @param float monolithScale = 1.35 [0.6, 2.5]
// @color fogColor = "#1F0912"
// @color structureColor = "#4E1824"
// @color glowColor = "#FF1B24"

let monolithSpin = 0;

function renderAnarchyFrame(ctx) {
  monolithSpin += 0.018 * (0.8 + ctx.bass * 1.6);
  const camAngle = ctx.t * orbitSpeed;

  ctx.setCamera(
    Math.sin(camAngle) * 2.6,
    1.9 + ctx.mid * 0.5,
    -7.4 + Math.cos(camAngle) * 1.2,
    0,
    0.4,
    3.5,
    62
  );
  ctx.setFog(fogColor, 4.5, 22.0);
  ctx.setAmbientLight("#FF99AA", 0.52);
  ctx.setDirectionalLight(4, 8, -3, "#FFFFFF", 1.25);

  ctx.drawTerrain3D(1.2, 0.7 + ctx.bass * 0.8, "#260910", glowColor, "waves");

  // 4 Piliers brutalistes entourant la cour
  const coords = [[-3.2, 2.0], [3.2, 2.0], [-3.6, 6.2], [3.6, 6.2]];
  for (let i = 0; i < coords.length; i++) {
    const [px, pz] = coords[i];
    const h = 3.2 + ctx.mid * 1.4 + (i % 2) * 0.4;
    ctx.drawBox3D(px, -0.1, pz, 0.95, h, 0.95, 0, 0, 0, structureColor, glowColor, true);
  }

  // Monolithe / Obélisque central en lévitation réactive aux basses
  const levitateY = 0.85 + Math.sin(ctx.t * 1.8) * 0.35 + ctx.bass * 1.1;
  ctx.drawBox3D(
    0,
    levitateY,
    4.0,
    monolithScale * (1 + ctx.bass * 0.3),
    monolithScale * 1.75,
    monolithScale * (1 + ctx.bass * 0.3),
    monolithSpin * 0.7,
    monolithSpin,
    0.35,
    glowColor,
    "#00E5FF",
    true
  );

  ctx.drawParticles3D(36, 10, 1.6, "#00E5FF", 2.0);
}`,
  },
  {
    id: "js-rave-dungeon-corridor-3d",
    name: "JS 3D // Rave Dungeon Couloir Souterrain",
    language: "js",
    code: `// @param float tunnelSpeed = 3.2 [0.5, 10.0]
// @color fogColor = "#111622"
// @color wallColor = "#1F2B3B"
// @color neonColor = "#00F6FF"

function renderAnarchyFrame(ctx) {
  ctx.setCamera(
    Math.sin(ctx.t * 0.9) * 0.8,
    0.55 + ctx.bass * 0.3,
    -5.8,
    0,
    0.3,
    8.0,
    70
  );
  ctx.setFog(fogColor, 3.5, 20.0);
  ctx.setAmbientLight("#ADC6CE", 0.5);
  ctx.setDirectionalLight(0, 6, -2, neonColor, 1.3 + ctx.flux * 0.9);

  // Couloir souterrain 3D complet (sol + murs + plafond)
  ctx.drawTerrain3D(tunnelSpeed, 0.4 + ctx.bass * 0.6, wallColor, neonColor, "dungeon");

  // Portes blindées qui s'ouvrent sur les basses
  const openOffset = 1.1 + ctx.bass * 1.45;
  ctx.drawBox3D(-openOffset, 0.2, 6.5, 1.4, 3.2, 0.45, 0, 0, 0, wallColor, "#FF1B24", true);
  ctx.drawBox3D( openOffset, 0.2, 6.5, 1.4, 3.2, 0.45, 0, 0, 0, wallColor, "#FF1B24", true);

  ctx.drawParticles3D(45, 8, tunnelSpeed * 1.8, "#FF1B24", 2.0);
}`,
  },
  {
    id: "cpp-techno-therapy-3d",
    name: "C++ 3D // Techno Therapy Vortex & Anneaux",
    language: "cpp",
    code: `// @param float spinSpeed = 1.8 [0.2, 6.0]
// @color fogColor = "#09071A"
// @color boxColor = "#1C1842"
// @color neonColor = "#00F6FF"
#include <cmath>

void renderAnarchyFrame(AnarchyCtx& ctx) {
  ctx.setCamera(0.0f, 0.9f, -6.5f, 0.0f, 0.4f, 6.0f, 68.0f);
  ctx.setFog(fogColor, 3.5f, 22.0f);
  ctx.setAmbientLight("#FFFFFF", 0.55f);
  ctx.setDirectionalLight(-2.0f, 7.0f, -3.0f, neonColor, 1.3f);

  ctx.drawTerrain3D(2.8f, 0.8f + ctx.bass * 0.7f, boxColor, neonColor, "corridor");

  for (int i = 0; i < 6; i++) {
    float a = ctx.t * spinSpeed + i * 1.047f;
    float r = 2.1f + ctx.bass * 0.95f;
    float bx = cosf(a) * r;
    float by = 0.6f + sinf(a) * r * 0.65f;
    float bz = 2.5f + (i % 3) * 2.2f;
    ctx.drawBox3D(bx, by, bz, 0.75f, 0.75f, 0.75f, a, a * 1.3f, 0.0f, boxColor, i % 2 == 0 ? neonColor : "#FF2BD6", true);
  }

  ctx.drawParticles3D(48, 10.0f, 3.2f, "#FF2BD6", 2.2f);
}`,
  },
  {
    id: "cpp-digital-void-towers-3d",
    name: "C++ 3D // Digital Void Serveurs & Cyborg",
    language: "cpp",
    code: `// @param float speed = 2.4 [0.5, 7.0]
// @color fogColor = "#16081C"
// @color towerColor = "#270F36"
// @color acidColor = "#D4FF33"
#include <cmath>

void renderAnarchyFrame(AnarchyCtx& ctx) {
  ctx.setCamera(sinf(ctx.t * 0.5f) * 1.6f, 1.8f, -7.0f, 0.0f, 0.3f, 6.0f, 64.0f);
  ctx.setFog(fogColor, 4.0f, 24.0f);
  ctx.setAmbientLight("#B026FF", 0.6f);
  ctx.setDirectionalLight(3.0f, 9.0f, -4.0f, acidColor, 1.35f);

  ctx.drawTerrain3D(speed, 1.2f, towerColor, acidColor, "canyon");

  for (int i = 0; i < 4; i++) {
    float z = 1.8f + i * 3.2f;
    float h = 3.0f + ctx.bass * 1.8f + (i % 2) * 0.7f;
    ctx.drawBox3D(-3.1f, 0.0f, z, 1.1f, h, 1.1f, 0.0f, 0.0f, 0.0f, towerColor, acidColor, true);
    ctx.drawBox3D( 3.1f, 0.0f, z, 1.1f, h, 1.1f, 0.0f, 0.0f, 0.0f, towerColor, "#B026FF", true);
  }

  ctx.drawCharacter3D(0.0f, -0.65f, 2.4f, ctx.t * speed * 0.6f, "cyborg", "#B026FF", acidColor);
  ctx.drawParticles3D(50, 12.0f, speed * 2.0f, acidColor, 2.0f);
}`,
  },
];

export const CPP_SHADER_AI_PROMPT = `Tu es un architecte 3D temps réel (C++ / Low-Poly PS2) pour Open Hub / Anarchy Visual Studio.
Génère un script C++ 3D complet compatible avec le runtime navigateur :
// @param float speed = 2.8 [0.2, 8.0]
// @color fogColor = "#140A1E"
// @color neonColor = "#00F0FF"
#include <cmath>

void renderAnarchyFrame(AnarchyCtx& ctx) { ... }

Contrôles Caméra, Brouillard & Lumières 3D :
- ctx.setCamera(x, y, z, targetX, targetY, targetZ, fov)
- ctx.setFog(color, near, far)
- ctx.setAmbientLight(color, intensity)
- ctx.setDirectionalLight(x, y, z, color, intensity)

Primitives 3D Low-Poly / PS2 (avec ombrage Lambert, brouillard de profondeur et arêtes émissives) :
- ctx.drawBox3D(x, y, z, w, h, d, rotX, rotY, rotZ, color, emissiveColor, wireframe)
- ctx.drawTerrain3D(speed, amplitude, color, gridColor, style) // style: "canyon" | "mountains" | "waves" | "dungeon" | "corridor"
- ctx.drawCharacter3D(x, y, z, animPhase, style, primaryColor, accentColor) // style: "runner" | "katana" | "cyborg"
- ctx.drawParticles3D(count, spread, speed, color, size)

Variables temps réel sur ctx (alimentées par les 10 faders et l'horloge BPM sans jamais écraser les contrôles) :
- Temps & BPM : ctx.t, ctx.bpm, ctx.beat, ctx.beatPhase (0..1)
- Audio live : ctx.bass, ctx.mid, ctx.treble, ctx.rms, ctx.flux (0..1)
- Faders live : ctx.intensity, ctx.strobe, ctx.kickBlackout, ctx.psychedelic, ctx.colorMorph, ctx.anaglyph, ctx.cameraZoom, ctx.pendulumSwing
- Paroles Whisper/LRC : ctx.lyricLine, ctx.lyricWord, ctx.lyricProgress, ctx.lyricSection
- Overlays 2D & Post-FX : ctx.text(str, x, y, color, size), ctx.glitchSlices(amount), ctx.scanlines(alpha), ctx.invert(amount), ctx.zoom(scale), ctx.tint(color, alpha).`;

export const JS_SHADER_AI_PROMPT = `Tu es un architecte 3D temps réel JavaScript (PS2 / Low-Poly 3D Engine) pour Open Hub / Anarchy Visual Studio.
Génère un script JavaScript natif 3D exécuté directement à 60 FPS sans transpileur :
// @param float speed = 2.8 [0.2, 8.0]
// @color fogColor = "#140A1E"
// @color neonColor = "#00F0FF"

let runPhase = 0; // Persistant entre les frames à 60 FPS !

function renderAnarchyFrame(ctx) {
  runPhase += 0.03 * speed * (0.8 + ctx.bass);
  ctx.setCamera(Math.sin(ctx.t * 0.6) * 1.5, 1.7 + ctx.bass * 0.4, -7.0, 0, 0.3, 5.5, 65);
  ctx.setFog(fogColor, 4, 22);
  ctx.setAmbientLight("#FFFFFF", 0.55);
  ctx.setDirectionalLight(-3, 8, -4, neonColor, 1.25);

  ctx.drawTerrain3D(speed, 1.1 + ctx.bass * 0.8, "#1B1534", neonColor, "canyon");
  ctx.drawCharacter3D(0, -0.65, 2.2, runPhase, "katana", "#FF1B24", neonColor);
  ctx.drawParticles3D(40, 10, speed * 2, neonColor, 2.0);
}

Méthodes 3D disponibles sur ctx :
- ctx.setCamera(x, y, z, targetX, targetY, targetZ, fov)
- ctx.setFog(color, near, far)
- ctx.setAmbientLight(color, intensity)
- ctx.setDirectionalLight(x, y, z, color, intensity)
- ctx.drawBox3D(x, y, z, w, h, d, rotX, rotY, rotZ, color, emissiveColor, wireframe)
- ctx.drawTerrain3D(speed, amplitude, color, gridColor, style) // "canyon" | "mountains" | "waves" | "dungeon" | "corridor"
- ctx.drawCharacter3D(x, y, z, animPhase, style, primaryColor, accentColor) // "runner" | "katana" | "cyborg"
- ctx.drawParticles3D(count, spread, speed, color, size)
- Overlays 2D & Post-FX : ctx.text(str, x, y, color, size), ctx.glitchSlices(amount), ctx.scanlines(alpha), ctx.invert(amount), ctx.zoom(scale), ctx.tint(color, alpha).`;

export const DEFAULT_JS_SHADER_CODE =
  CPP_PRESET_TEMPLATES.find((t) => t.language === "js")?.code ??
  CPP_PRESET_TEMPLATES[0].code;

export const DEFAULT_CPP_SHADER_CODE =
  CPP_PRESET_TEMPLATES.find((t) => t.language === "cpp")?.code ??
  CPP_PRESET_TEMPLATES[0].code;

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function fmod(a: number, b: number): number {
  if (!b) return 0;
  return a % b;
}

function lerpNum(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function fract(x: number): number {
  return x - Math.floor(x);
}

function stepFn(edge: number, x: number): number {
  return x < edge ? 0 : 1;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1), 0, 1);
  return t * t * (3 - 2 * t);
}

const FORBIDDEN_IDENTIFIERS = [
  "window",
  "document",
  "globalThis",
  "self",
  "fetch",
  "XMLHttpRequest",
  "eval",
  "Function",
  "localStorage",
  "sessionStorage",
  "cookie",
  "process",
  "require",
  "import",
  "__proto__",
];

/**
 * Parse les annotations UI C++ :
 * - // @param float speed = 4.0 [0.0, 20.0]
 * - // @param int rings = 5 [1, 16]
 * - // @param bool glitch = true
 * - // @color primaryColor = "#00F0FF"
 * - // @toggle wireframe = false
 */
export function parseCppUniforms(source: string): CppUniformSpec[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const specs: CppUniformSpec[] = [];
  const seen = new Set<string>();

  for (let idx = 0; idx < lines.length; idx++) {
    const lineText = lines[idx].trim();
    if (!lineText.startsWith("//")) continue;

    // @color name = "#HEX"
    const colorMatch = lineText.match(
      /^\/\/\s*@color\s+([a-zA-Z_]\w*)\s*=\s*["']([^"']+)["']/i
    );
    if (colorMatch) {
      const name = colorMatch[1];
      if (!seen.has(name)) {
        seen.add(name);
        specs.push({
          name,
          kind: "color",
          defaultValue: colorMatch[2].trim(),
          line: idx + 1,
        });
      }
      continue;
    }

    // @toggle name = true|false
    const toggleMatch = lineText.match(
      /^\/\/\s*@(?:toggle|bool)\s+([a-zA-Z_]\w*)\s*=\s*(true|false|1|0)\b/i
    );
    if (toggleMatch) {
      const name = toggleMatch[1];
      const rawVal = toggleMatch[2].toLowerCase();
      if (!seen.has(name)) {
        seen.add(name);
        specs.push({
          name,
          kind: "bool",
          defaultValue: rawVal === "true" || rawVal === "1",
          line: idx + 1,
        });
      }
      continue;
    }

    // @param [type] <name> = <val> [min, max]
    const paramMatch = lineText.match(
      /^\/\/\s*@param\s+(?:(float|double|int|bool)\s+)?([a-zA-Z_]\w*)\s*=\s*([^\[\s]+)(?:\s*\[\s*([^,\]]+)\s*,\s*([^\]]+)\s*\])?/i
    );
    if (paramMatch) {
      const rawDefaultClean = paramMatch[3].replace(/[fF]$/, "");
      const rawType = (
        paramMatch[1] ??
        (rawDefaultClean === "true" || rawDefaultClean === "false" ? "bool" : "float")
      ).toLowerCase();
      const name = paramMatch[2];
      const rawDefault = rawDefaultClean;
      if (seen.has(name)) continue;
      seen.add(name);

      if (rawType === "bool") {
        specs.push({
          name,
          kind: "bool",
          defaultValue: rawDefault === "true" || rawDefault === "1",
          line: idx + 1,
        });
      } else {
        const isInt = rawType === "int";
        const parsedDefault = Number(rawDefault);
        const defNum = Number.isFinite(parsedDefault) ? parsedDefault : 0;
        const parsedMin = paramMatch[4]
          ? Number(paramMatch[4].replace(/[fF]$/, ""))
          : 0;
        const parsedMax = paramMatch[5]
          ? Number(paramMatch[5].replace(/[fF]$/, ""))
          : isInt
          ? Math.max(10, Math.abs(defNum) * 2 || 10)
          : Math.max(1, Math.abs(defNum) * 2 || 10);
        const min = Number.isFinite(parsedMin) ? parsedMin : 0;
        const max = Number.isFinite(parsedMax) ? parsedMax : min + 10;
        specs.push({
          name,
          kind: isInt ? "int" : "float",
          defaultValue: isInt ? Math.round(defNum) : defNum,
          min,
          max: max <= min ? min + 1 : max,
          step: isInt ? 1 : Number(((max - min) / 100).toFixed(3)) || 0.01,
          line: idx + 1,
        });
      }
    }
  }

  return specs;
}

/**
 * Tokenise littéraux chaînes & commentaires tout en préservant exactement le nombre de sauts de ligne (\n).
 */
function stripCommentsAndProtectStrings(src: string): {
  skeleton: string;
  strings: string[];
} {
  const strings: string[] = [];
  let out = "";
  let i = 0;
  const n = src.length;

  while (i < n) {
    const ch = src[i];
    const next = src[i + 1];

    // Commentaire ligne //
    if (ch === "/" && next === "/") {
      while (i < n && src[i] !== "\n") {
        i++;
      }
      continue;
    }

    // Commentaire bloc /* ... */ (garde le même nombre de \n)
    if (ch === "/" && next === "*") {
      i += 2;
      while (i < n && !(src[i] === "*" && src[i + 1] === "/")) {
        if (src[i] === "\n") out += "\n";
        i++;
      }
      i += 2;
      out += " ";
      continue;
    }

    // Chaîne "...", '...' ou template literal `...`
    if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      let lit = ch;
      i++;
      while (i < n) {
        const c = src[i];
        lit += c;
        if (c === "\\" && i + 1 < n) {
          i++;
          lit += src[i];
          i++;
          continue;
        }
        if (c === quote) {
          i++;
          break;
        }
        if (quote === "`" && c === "\n") {
          out += "\n";
        }
        i++;
      }
      const token = `__CPP_STR_${strings.length}__`;
      strings.push(lit);
      out += token;
      continue;
    }

    out += ch;
    i++;
  }

  return { skeleton: out, strings };
}

/**
 * Détecte automatiquement si le code saisi/collé est du JavaScript natif
 * (commence par `function renderAnarchyFrame(ctx)` ou utilise `const` / `let` / `=>`
 * sans signature C++ `void renderAnarchyFrame(AnarchyCtx...`).
 */
export function detectScriptLanguage(source: string): ScriptLanguage {
  const { skeleton } = stripCommentsAndProtectStrings(source.replace(/\r\n/g, "\n"));
  const trimmed = skeleton.trim();
  if (!trimmed) return "cpp";

  const hasCppSignature =
    /\bvoid\s+renderAnarchyFrame\s*\(\s*(?:const\s+)?AnarchyCtx\b/.test(trimmed) ||
    /^\s*#\s*(?:include|define|pragma)\b/m.test(trimmed) ||
    /\busing\s+namespace\b/.test(trimmed) ||
    /\bstd::/.test(trimmed);

  if (hasCppSignature) return "cpp";

  if (/^\s*(?:function\s+renderAnarchyFrame\s*\(|(?:const|let|var)\s+renderAnarchyFrame\s*=)/.test(trimmed)) {
    return "js";
  }

  const hasJsConstructs =
    /\bfunction\s+[a-zA-Z_]\w*\s*\(/.test(trimmed) ||
    /=>/.test(trimmed) ||
    /\b(?:const|let|var)\s+[a-zA-Z_\[{]/.test(trimmed) ||
    /\bMath\.(?:sin|cos|abs|floor|pow|min|max|PI)\b/.test(trimmed);

  if (hasJsConstructs) return "js";
  return "cpp";
}

function stripParamTypes(rawParams: string): string {
  const trimmed = rawParams.trim();
  if (!trimmed) return "";
  return trimmed
    .split(",")
    .map((part) => {
      const p = part.trim();
      if (!p) return "";
      const eqIdx = p.indexOf("=");
      const left = (eqIdx >= 0 ? p.slice(0, eqIdx) : p).trim();
      const right = eqIdx >= 0 ? p.slice(eqIdx) : "";
      const tokens = left.replace(/[&*]/g, " ").trim().split(/\s+/);
      const ident = tokens[tokens.length - 1] ?? "";
      return right ? `${ident} ${right}` : ident;
    })
    .filter(Boolean)
    .join(", ");
}

function convertArrayInitializers(code: string): string {
  // Convertit : type name[N] = { ... }; ou type name[] = { ... }; ou vector<type> name = { ... };
  let res = code.replace(
    /\b(?:const\s+|static\s+|constexpr\s+)*(?:float|double|int|long|unsigned\s+int|unsigned|bool|auto|size_t|string|String|const\s+char\s*\*|char\s*\*)\s+([a-zA-Z_]\w*)\s*\[\s*\d*\s*\]\s*=\s*\{([^;]*?)\}\s*;/g,
    (_m, name, items) => {
      const convertedItems = items.replace(/\{([^{}]*)\}/g, "[$1]");
      return `let ${name} = [${convertedItems}];`;
    }
  );

  res = res.replace(
    /\b(?:const\s+|static\s+)*vector\s*<[^>]+>\s+([a-zA-Z_]\w*)\s*(?:=\s*\{|\{)([^;]*?)\}\s*;/g,
    (_m, name, items) => `let ${name} = [${items}];`
  );

  // Tableau non initialisé : float arr[16];
  res = res.replace(
    /\b(?:float|double|int|long|unsigned\s+int|unsigned|bool|auto|size_t)\s+([a-zA-Z_]\w*)\s*\[\s*(\d+)\s*\]\s*;/g,
    (_m, name, len) => `let ${name} = new Array(${len}).fill(0);`
  );

  return res;
}

function findUnbalancedBraceLine(code: string): { line: number; message: string } | null {
  const lines = code.split("\n");
  const braceStack: number[] = [];
  const parenStack: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (ch === "{") braceStack.push(i + 1);
      else if (ch === "}") {
        if (braceStack.length === 0) {
          return { line: i + 1, message: "Accolade fermante '}' inattendue." };
        }
        braceStack.pop();
      } else if (ch === "(") parenStack.push(i + 1);
      else if (ch === ")") {
        if (parenStack.length === 0) {
          return { line: i + 1, message: "Parenthèse fermante ')' inattendue." };
        }
        parenStack.pop();
      }
    }
  }
  if (braceStack.length > 0) {
    return {
      line: braceStack[braceStack.length - 1],
      message: "Accolade '{' non fermée.",
    };
  }
  if (parenStack.length > 0) {
    return {
      line: parenStack[parenStack.length - 1],
      message: "Parenthèse '(' non fermée.",
    };
  }
  return null;
}

function detectCompileErrorLine(
  jsBody: string,
  prologueLineCount: number,
  userLineCount: number
): number | undefined {
  const balanceErr = findUnbalancedBraceLine(jsBody);
  if (balanceErr) {
    return Math.min(userLineCount, Math.max(1, balanceErr.line));
  }

  const lines = jsBody.split("\n");
  const closeBracesForPrefix = (prefix: string): string => {
    let openBraces = 0;
    let openParens = 0;
    for (const ch of prefix) {
      if (ch === "{") openBraces++;
      else if (ch === "}") openBraces = Math.max(0, openBraces - 1);
      else if (ch === "(") openParens++;
      else if (ch === ")") openParens = Math.max(0, openParens - 1);
    }
    return prefix + ")".repeat(openParens) + "\n" + "}".repeat(openBraces);
  };

  let lo = 1;
  let hi = lines.length;
  let firstBad = lines.length;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const candidate = closeBracesForPrefix(lines.slice(0, mid).join("\n"));
    try {
      new Function("ctx", "_u", "_m", candidate);
      lo = mid + 1;
    } catch {
      firstBad = mid;
      hi = mid - 1;
    }
  }
  void prologueLineCount;
  return Math.min(userLineCount, Math.max(1, firstBad));
}

function extractRuntimeErrorLine(
  err: unknown,
  prologueLineCount: number,
  userLineCount: number
): number | undefined {
  if (!(err instanceof Error) || !err.stack) return undefined;
  const m = err.stack.match(/<anonymous>:(\d+):\d+/);
  if (!m) return undefined;
  // V8 wraps `new Function(args, body)` with 2 header lines before body line 1
  const rawLine = Number(m[1]) - 2 - prologueLineCount;
  if (!Number.isFinite(rawLine) || rawLine < 1) return undefined;
  return Math.min(userLineCount, rawLine);
}

/**
 * Transpile un script C++ (`void renderAnarchyFrame(AnarchyCtx& ctx) { ... }`, fonctions utilitaires,
 * tableaux, lambdas, std::*, sinf/cosf, et directives `#include` / `using namespace`) en fonction JS sandboxée 60fps.
 */
export function compileCppVisual(source: string): CppCompileResult {
  const normalized = source.replace(/\r\n/g, "\n");
  const clean = normalized.trim();
  const uniforms = parseCppUniforms(normalized);

  if (!clean) {
    return { ok: false, fn: null, uniforms, error: "Code C++ vide.", errorLine: 1 };
  }

  const userLineCount = normalized.split("\n").length;
  const { skeleton, strings } = stripCommentsAndProtectStrings(normalized);

  for (const word of FORBIDDEN_IDENTIFIERS) {
    const rx = new RegExp(`\\b${word}\\b`);
    if (rx.test(skeleton)) {
      const idx = skeleton.split("\n").findIndex((l) => rx.test(l));
      return {
        ok: false,
        fn: null,
        uniforms,
        error: `Symbole non autorisé dans le shader C++ : ${word}`,
        errorLine: idx >= 0 ? idx + 1 : 1,
      };
    }
  }

  let js = skeleton
    // #define SIMPLE_NAME val -> const SIMPLE_NAME = val;
    .replace(
      /^[ \t]*#define[ \t]+([a-zA-Z_]\w*)[ \t]+([^\n]+)$/gm,
      "const $1 = $2;"
    )
    // Supprimer autres #include, #pragma, #ifdef... en conservant les lignes
    .replace(/^[ \t]*#[^\n]*$/gm, "")
    // Supprimer using namespace ...;
    .replace(/\busing\s+namespace\s+[a-zA-Z0-9_:]+\s*;/g, "")
    // std:: -> "" et -> -> .
    .replace(/\bstd::/g, "")
    .replace(/->/g, ".")
    // Sucre STL courant
    .replace(/\.empty\(\)/g, ".length === 0")
    .replace(/\.size\(\)/g, ".length")
    .replace(/\.c_str\(\)/g, "")
    .replace(/\.push_back\(/g, ".push(")
    .replace(/\b(?:nullptr|NULL)\b/g, "null");

  // Lambdas C++ : [&](float x, int i) -> float { ... }
  js = js.replace(
    /\[[^\]]*\]\s*\(([^)]*)\)\s*(?:->\s*[a-zA-Z0-9_:*&\s<>]+)?\s*\{/g,
    (_m, rawParams: string) => `(${stripParamTypes(rawParams)}) => {`
  );

  // Tableaux & std::vector C++ -> tableaux JS
  js = convertArrayInitializers(js);

  // Détecter et normaliser les fonctions (notamment renderAnarchyFrame)
  let hasEntrypoint = false;
  js = js.replace(
    /(?:^|\n)[ \t]*(?:static\s+|inline\s+|constexpr\s+)*(?:void|float|double|int|long|unsigned\s+int|unsigned|bool|auto|size_t|string|String|const\s+char\s*\*|char\s*\*)[ \t]+([a-zA-Z_]\w*)[ \t]*\(([^)]*)\)([ \t]*(?:\n[ \t]*)?)\{/g,
    (fullMatch, fnName: string, rawParams: string, wsAfter: string) => {
      const prefixNewline = fullMatch.startsWith("\n") ? "\n" : "";
      if (fnName === "renderAnarchyFrame") {
        hasEntrypoint = true;
        const firstParamClean = stripParamTypes(rawParams).split(",")[0]?.trim() || "ctx";
        const alias =
          firstParamClean && firstParamClean !== "ctx"
            ? ` const ${firstParamClean} = ctx;`
            : "";
        return `${prefixNewline}function renderAnarchyFrame(ctx)${wsAfter}{${alias}`;
      }
      return `${prefixNewline}function ${fnName}(${stripParamTypes(rawParams)})${wsAfter}{`;
    }
  );

  // Casts C++ : static_cast<T>(...), (float), (int)...
  js = js
    .replace(/\b(?:static_cast|reinterpret_cast|const_cast)\s*<[^>]+>\s*\(/g, "(")
    .replace(
      /\(\s*(?:const\s+)?(?:float|double|int|long|unsigned\s+int|unsigned|bool|size_t)\s*\)/g,
      ""
    );

  // Littéraux float C++ (0.5f, 20.f, .5F) sans toucher hex 0xff ni identifiants
  js = js.replace(/(?<![0-9a-fA-FxX_])(\d+(?:\.\d*)?|\.\d+)[fF]\b/g, "$1");

  // Boucle for range-based : for (auto& x : arr)
  js = js.replace(
    /\bfor\s*\(\s*(?:const\s+)?(?:auto|float|double|int|long|bool|string|String)\s*[&*]?\s+([a-zA-Z_]\w*)\s*:\s*([^)]+)\)/g,
    "for (let $1 of $2)"
  );

  // Déclarations de variables C++ -> let
  js = js
    .replace(
      /(?:\b(?:static|constexpr|const)\s+)*\b(?:float|double|int|long|unsigned\s+int|unsigned|bool|auto|size_t|string|String)\s*[&*]?\s+([a-zA-Z_]\w*)/g,
      "let $1"
    )
    .replace(/\b(?:const\s+)?char\s*\*\s*([a-zA-Z_]\w*)/g, "let $1");

  // Restaurer les chaînes protégées
  js = js.replace(/__CPP_STR_(\d+)__/g, (_m, idxStr) => {
    return strings[Number(idxStr)] ?? '""';
  });

  // Lier les paramètres @param / @color / @toggle sans recompiler à chaque slide
  const uniformPrologueParts: string[] = [];
  for (const u of uniforms) {
    const defLiteral = JSON.stringify(u.defaultValue);
    const redeclaredRx = new RegExp(`\\blet\\s+${u.name}\\b`);
    if (redeclaredRx.test(js)) {
      // Remplacer l'initialiseur existant par la valeur live
      const assignRx = new RegExp(
        `(\\blet\\s+${u.name}\\s*=\\s*)([^;\\n]+)`
      );
      js = js.replace(
        assignRx,
        `$1(_u[${JSON.stringify(u.name)}] !== undefined ? _u[${JSON.stringify(u.name)}] : ($2))`
      );
    } else {
      uniformPrologueParts.push(
        `const ${u.name} = (_u[${JSON.stringify(u.name)}] !== undefined ? _u[${JSON.stringify(u.name)}] : ${defLiteral});`
      );
    }
  }

  // Prologue sur UNE SEULE LIGNE pour que la ligne 2 de `compiledCode` = ligne 1 C++ utilisateur
  const prologue =
    `"use strict"; const { sin, cos, tan, asin, acos, atan, atan2, sqrt, pow, abs, floor, ceil, round, min, max, exp, log, PI } = _m; const TWO_PI = PI * 2; const sinf = sin, cosf = cos, tanf = tan, sqrtf = sqrt, powf = pow, fabs = abs, fabsf = abs, floorf = floor, ceilf = ceil, roundf = round, fmin = min, fminf = min, fmax = max, fmaxf = max; const clamp = _m.clamp, fmod = _m.fmod, fmodf = _m.fmod, lerp = _m.lerp, mix = _m.lerp, fract = _m.fract, step = _m.step, smoothstep = _m.smoothstep; ` +
    uniformPrologueParts.join(" ");

  const epilogue = hasEntrypoint
    ? `\nif (typeof renderAnarchyFrame === "function") { renderAnarchyFrame(ctx); }`
    : "";

  const fullCode = `${prologue}\n${js}${epilogue}`;

  try {
    const compiled = new Function("ctx", "_u", "_m", fullCode) as (
      ctx: CppRenderContext,
      _u: Record<string, CppUniformValue>,
      _m: typeof CPP_MATH_HELPERS
    ) => void;

    return {
      ok: true,
      language: "cpp",
      uniforms,
      transpiledCode: js,
      fn: (ctx: CppRenderContext, uniformOverrides?: Record<string, CppUniformValue>) => {
        const mergedUniforms: Record<string, CppUniformValue> = {};
        for (const u of uniforms) {
          mergedUniforms[u.name] =
            uniformOverrides && uniformOverrides[u.name] !== undefined
              ? uniformOverrides[u.name]
              : u.defaultValue;
        }
        ctx.params = mergedUniforms;
        try {
          compiled(ctx, mergedUniforms, CPP_MATH_HELPERS);
          (ctx as CppRenderContext & { __flush3D?: () => void }).__flush3D?.();
        } catch (runtimeErr) {
          const line = extractRuntimeErrorLine(runtimeErr, 1, userLineCount);
          const msg =
            runtimeErr instanceof Error ? runtimeErr.message : "Erreur runtime C++.";
          const wrapped = new Error(line ? `Ligne ${line} : ${msg}` : msg);
          (wrapped as Error & { errorLine?: number }).errorLine = line;
          throw wrapped;
        }
      },
    };
  } catch (err) {
    const errorLine = detectCompileErrorLine(js, 1, userLineCount);
    const rawMsg = err instanceof Error ? err.message : "Erreur de syntaxe C++.";
    return {
      ok: false,
      language: "cpp",
      fn: null,
      uniforms,
      errorLine,
      error: errorLine ? `Ligne ${errorLine} : ${rawMsg}` : rawMsg,
      transpiledCode: js,
    };
  }
}

/**
 * Fast-path JavaScript Natif : court-circuite intégralement le transpileur C++ -> JS.
 * Compile le module une seule fois par édition (préservant l'état top-level entre les frames)
 * et synchronise les uniforms @param / @color / @toggle via ctx.params et variables locales.
 */
export function compileJsVisual(source: string): CppCompileResult {
  const normalized = source.replace(/\r\n/g, "\n");
  const clean = normalized.trim();
  const uniforms = parseCppUniforms(normalized);

  if (!clean) {
    return {
      ok: false,
      language: "js",
      fn: null,
      uniforms,
      error: "Code JavaScript vide.",
      errorLine: 1,
    };
  }

  const userLineCount = normalized.split("\n").length;
  const { skeleton } = stripCommentsAndProtectStrings(normalized);

  for (const word of FORBIDDEN_IDENTIFIERS) {
    const rx = new RegExp(`\\b${word}\\b`);
    if (rx.test(skeleton)) {
      const idx = skeleton.split("\n").findIndex((l) => rx.test(l));
      return {
        ok: false,
        language: "js",
        fn: null,
        uniforms,
        error: `Symbole non autorisé dans le script JS : ${word}`,
        errorLine: idx >= 0 ? idx + 1 : 1,
      };
    }
  }

  const initialUniforms: Record<string, CppUniformValue> = {};
  for (const u of uniforms) {
    initialUniforms[u.name] = u.defaultValue;
  }

  const uniformBindings = uniforms
    .map((u) => `let ${u.name} = _u[${JSON.stringify(u.name)}];`)
    .join(" ");
  const uniformSync = uniforms
    .map((u) => `${u.name} = _p[${JSON.stringify(u.name)}];`)
    .join(" ");

  // Prologue sur UNE SEULE LIGNE pour que la ligne 2 de `factoryBody` = ligne 1 JS utilisateur
  const prologue =
    `"use strict"; const { sin, cos, tan, asin, acos, atan, atan2, sqrt, pow, abs, floor, ceil, round, min, max, exp, log, PI } = _m; const TWO_PI = PI * 2; const clamp = _m.clamp, fmod = _m.fmod, lerp = _m.lerp, mix = _m.lerp, fract = _m.fract, step = _m.step, smoothstep = _m.smoothstep; ${uniformBindings} return (() => {`;
  const epilogue =
    `\nif (typeof renderAnarchyFrame !== "function") { return null; } return function __anarchyFrameWrapper(ctx, _p) { ${uniformSync} return renderAnarchyFrame(ctx, _p); }; })();`;

  const factoryBody = `${prologue}\n${normalized}${epilogue}`;

  let entryFn:
    | ((ctx: CppRenderContext, _p: Record<string, CppUniformValue>) => void)
    | null = null;

  try {
    const factory = new Function("_u", "_m", factoryBody) as (
      _u: Record<string, CppUniformValue>,
      _m: typeof CPP_MATH_HELPERS
    ) => ((ctx: CppRenderContext, _p: Record<string, CppUniformValue>) => void) | null;

    try {
      entryFn = factory(initialUniforms, CPP_MATH_HELPERS);
    } catch (initErr) {
      const line = extractRuntimeErrorLine(initErr, 1, userLineCount);
      const rawMsg =
        initErr instanceof Error ? initErr.message : "Erreur d'initialisation JS.";
      return {
        ok: false,
        language: "js",
        fn: null,
        uniforms,
        errorLine: line,
        error: line ? `Ligne ${line} : ${rawMsg}` : rawMsg,
      };
    }
  } catch (syntaxErr) {
    const errorLine = detectCompileErrorLine(skeleton, 1, userLineCount);
    const rawMsg =
      syntaxErr instanceof Error ? syntaxErr.message : "Erreur de syntaxe JavaScript.";
    return {
      ok: false,
      language: "js",
      fn: null,
      uniforms,
      errorLine,
      error: errorLine ? `Ligne ${errorLine} : ${rawMsg}` : rawMsg,
    };
  }

  if (!entryFn) {
    return {
      ok: false,
      language: "js",
      fn: null,
      uniforms,
      errorLine: 1,
      error:
        "Fonction renderAnarchyFrame(ctx) introuvable. Définis `function renderAnarchyFrame(ctx) { ... }`.",
    };
  }

  const compiledEntry = entryFn;
  return {
    ok: true,
    language: "js",
    uniforms,
    fn: (ctx: CppRenderContext, uniformOverrides?: Record<string, CppUniformValue>) => {
      const mergedUniforms: Record<string, CppUniformValue> = {};
      for (const u of uniforms) {
        mergedUniforms[u.name] =
          uniformOverrides && uniformOverrides[u.name] !== undefined
            ? uniformOverrides[u.name]
            : u.defaultValue;
      }
      ctx.params = mergedUniforms;
      try {
        compiledEntry(ctx, mergedUniforms);
        (ctx as CppRenderContext & { __flush3D?: () => void }).__flush3D?.();
      } catch (runtimeErr) {
        const line = extractRuntimeErrorLine(runtimeErr, 1, userLineCount);
        const msg =
          runtimeErr instanceof Error ? runtimeErr.message : "Erreur runtime JavaScript.";
        const wrapped = new Error(line ? `Ligne ${line} : ${msg}` : msg);
        (wrapped as Error & { errorLine?: number }).errorLine = line;
        throw wrapped;
      }
    },
  };
}

/**
 * Compile un document visuel selon son langage (`js` -> Fast-Path V8 natif, `cpp` -> transpileur C++).
 */
export function compileVisualScript(
  source: string,
  language: ScriptLanguage = "cpp"
): CppCompileResult {
  if (language === "js") {
    return compileJsVisual(source);
  }
  return compileCppVisual(source);
}

const CPP_MATH_HELPERS = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  atan2: Math.atan2,
  sqrt: Math.sqrt,
  pow: Math.pow,
  abs: Math.abs,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  min: Math.min,
  max: Math.max,
  exp: Math.exp,
  log: Math.log,
  PI: Math.PI,
  clamp,
  fmod,
  lerp: lerpNum,
  fract,
  step: stepFn,
  smoothstep,
};

// Buffer 3D réutilisé entre les frames (zéro réallocation ni fuite mémoire à 60 FPS)
const shared3DBuffer = new Anarchy3DSceneBuffer();

export function createCppRenderContext(
  canvasCtx: CanvasRenderingContext2D,
  width: number,
  height: number,
  telemetry: {
    t: number;
    bpm: number;
    beat: number;
    beatPhase: number;
    bass: number;
    mid: number;
    treble: number;
    rms: number;
    flux: number;
    sceneIndex: number;
    lyricLine?: string;
    lyricWord?: string;
    lyricProgress?: number;
    lyricSection?: string;
    intensity?: number;
    strobe?: number;
    kickBlackout?: number;
    psychedelic?: number;
    colorMorph?: number;
    anaglyph?: number;
    cameraZoom?: number;
    pendulumSwing?: number;
    params?: Record<string, CppUniformValue>;
  }
): CppRenderContext {
  shared3DBuffer.reset();
  let has3D = false;
  let flushed3D = false;

  const flush3DIfNeeded = () => {
    if (!has3D || flushed3D) return;
    flushed3D = true;
    shared3DBuffer.renderToCanvas(canvasCtx, width, height, {
      t: telemetry.t,
      bass: telemetry.bass,
      mid: telemetry.mid,
      treble: telemetry.treble,
      flux: telemetry.flux,
      strobe: telemetry.strobe ?? 0.45,
      cameraZoom: telemetry.cameraZoom ?? 1,
      pendulumSwing: telemetry.pendulumSwing ?? 0.25,
    });
  };

  const rgb = (r: number, g: number, b: number) =>
    `rgb(${Math.round(clamp(r, 0, 255))},${Math.round(clamp(g, 0, 255))},${Math.round(clamp(b, 0, 255))})`;
  const rgba = (r: number, g: number, b: number, a: number) =>
    `rgba(${Math.round(clamp(r, 0, 255))},${Math.round(clamp(g, 0, 255))},${Math.round(clamp(b, 0, 255))},${clamp(a, 0, 1)})`;

  const ctxObj: CppRenderContext & { __flush3D?: () => void } = {
    ...telemetry,
    lyricLine: telemetry.lyricLine ?? "",
    lyricWord: telemetry.lyricWord ?? "",
    lyricProgress: telemetry.lyricProgress ?? 0,
    lyricSection: telemetry.lyricSection ?? "MAIN",
    intensity: telemetry.intensity ?? 0.75,
    strobe: telemetry.strobe ?? 0.45,
    kickBlackout: telemetry.kickBlackout ?? 0,
    psychedelic: telemetry.psychedelic ?? 0,
    colorMorph: telemetry.colorMorph ?? 0,
    anaglyph: telemetry.anaglyph ?? 0.16,
    cameraZoom: telemetry.cameraZoom ?? 1,
    pendulumSwing: telemetry.pendulumSwing ?? 0.25,
    params: telemetry.params ?? {},
    width,
    height,
    rgb,
    rgba,
    setCamera: (x, y, z, targetX = 0, targetY = 0.8, targetZ = 10, fov = 62) => {
      has3D = true;
      shared3DBuffer.setCamera(x, y, z, targetX, targetY, targetZ, fov);
    },
    setFog: (color, near = 3.5, far = 22) => {
      has3D = true;
      shared3DBuffer.setFog(color, near, far);
    },
    setAmbientLight: (color, intensity = 0.38) => {
      has3D = true;
      shared3DBuffer.setAmbientLight(color, intensity);
    },
    setDirectionalLight: (x, y, z, color = "#FFFFFF", intensity = 0.85) => {
      has3D = true;
      shared3DBuffer.setDirectionalLight(x, y, z, color, intensity);
    },
    drawBox3D: (
      x,
      y,
      z,
      w,
      h,
      d,
      rotX = 0,
      rotY = 0,
      rotZ = 0,
      color = "#283044",
      emissiveColor = "#00E5FF",
      wireframe = false
    ) => {
      has3D = true;
      shared3DBuffer.drawBox3D(
        x,
        y,
        z,
        w,
        h,
        d,
        rotX,
        rotY,
        rotZ,
        color,
        emissiveColor,
        wireframe
      );
    },
    drawTerrain3D: (
      speed = 3.2,
      amplitude = 1.0,
      color = "#121726",
      gridColor = "#00E5FF",
      style = "canyon"
    ) => {
      has3D = true;
      shared3DBuffer.drawTerrain3D(
        speed,
        amplitude,
        color,
        gridColor,
        style,
        telemetry.t,
        telemetry.bass
      );
    },
    drawCharacter3D: (
      x = 0,
      y = 0,
      z = 4.2,
      animPhase = telemetry.t * 6,
      style = "katana",
      primaryColor = "#D4D8E2",
      accentColor = "#FF1B24"
    ) => {
      has3D = true;
      shared3DBuffer.drawCharacter3D(
        x,
        y,
        z,
        animPhase,
        style,
        primaryColor,
        accentColor
      );
    },
    drawParticles3D: (
      count = 36,
      spread = 10,
      speed = 2.0,
      color = "#00E5FF",
      size = 2.0
    ) => {
      has3D = true;
      shared3DBuffer.drawParticles3D(count, spread, speed, color, size);
    },
    clear: (color = "#08090C") => {
      canvasCtx.save();
      canvasCtx.fillStyle = color;
      canvasCtx.fillRect(0, 0, width, height);
      canvasCtx.restore();
    },
    background: (r, g, b, alpha = 1) => {
      canvasCtx.save();
      canvasCtx.fillStyle = rgba(r, g, b, alpha);
      canvasCtx.fillRect(0, 0, width, height);
      canvasCtx.restore();
    },
    tint: (color, alpha = 0.25) => {
      flush3DIfNeeded();
      canvasCtx.save();
      canvasCtx.globalAlpha = clamp(alpha, 0, 1);
      canvasCtx.fillStyle = color;
      canvasCtx.fillRect(0, 0, width, height);
      canvasCtx.restore();
    },
    circle: (x, y, radius, color = "#FF1B24", fill = true) => {
      flush3DIfNeeded();
      canvasCtx.save();
      canvasCtx.beginPath();
      canvasCtx.arc(x, y, Math.max(0.5, radius), 0, Math.PI * 2);
      if (fill) {
        canvasCtx.fillStyle = color;
        canvasCtx.fill();
      } else {
        canvasCtx.strokeStyle = color;
        canvasCtx.lineWidth = 1.5;
        canvasCtx.stroke();
      }
      canvasCtx.restore();
    },
    ring: (x, y, radius, lineWidth = 2, color = "#00E5FF") => {
      flush3DIfNeeded();
      canvasCtx.save();
      canvasCtx.beginPath();
      canvasCtx.arc(x, y, Math.max(0.5, radius), 0, Math.PI * 2);
      canvasCtx.strokeStyle = color;
      canvasCtx.lineWidth = Math.max(0.5, lineWidth);
      canvasCtx.stroke();
      canvasCtx.restore();
    },
    line: (x1, y1, x2, y2, lineWidth = 1.5, color = "#FFFFFF") => {
      flush3DIfNeeded();
      canvasCtx.save();
      canvasCtx.beginPath();
      canvasCtx.moveTo(x1, y1);
      canvasCtx.lineTo(x2, y2);
      canvasCtx.strokeStyle = color;
      canvasCtx.lineWidth = Math.max(0.5, lineWidth);
      canvasCtx.stroke();
      canvasCtx.restore();
    },
    rect: (x, y, w, h, color = "#FF1B24") => {
      flush3DIfNeeded();
      canvasCtx.save();
      canvasCtx.fillStyle = color;
      canvasCtx.fillRect(x, y, w, h);
      canvasCtx.restore();
    },
    grid: (spacing = 20, color = "rgba(0,229,255,0.28)", scrollSpeed = 30) => {
      flush3DIfNeeded();
      const sp = Math.max(6, spacing);
      const offset = (telemetry.t * scrollSpeed) % sp;
      canvasCtx.save();
      canvasCtx.strokeStyle = color;
      canvasCtx.lineWidth = 1;
      for (let x = offset; x < width; x += sp) {
        canvasCtx.beginPath();
        canvasCtx.moveTo(x, 0);
        canvasCtx.lineTo(x, height);
        canvasCtx.stroke();
      }
      for (let y = offset; y < height; y += sp) {
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, y);
        canvasCtx.lineTo(width, y);
        canvasCtx.stroke();
      }
      canvasCtx.restore();
    },
    kaleidoscope: (segments = 4, speed = 1) => {
      flush3DIfNeeded();
      const segs = Math.max(2, Math.min(8, Math.round(segments)));
      canvasCtx.save();
      canvasCtx.globalAlpha = 0.35;
      canvasCtx.translate(width / 2, height / 2);
      canvasCtx.rotate(Math.sin(telemetry.t * speed) * 0.25);
      canvasCtx.scale(segs % 2 === 0 ? -1 : 1, -1);
      canvasCtx.drawImage(canvasCtx.canvas, -width / 2, -height / 2, width, height);
      canvasCtx.restore();
    },
    glitchSlices: (amount = 0.5) => {
      flush3DIfNeeded();
      const slices = Math.max(1, Math.min(10, Math.round(amount * 8)));
      canvasCtx.save();
      for (let i = 0; i < slices; i++) {
        const sy = Math.floor(((Math.sin(telemetry.t * 37 + i * 19) + 1) * 0.5) * (height - 12));
        const sh = 4 + (i % 4) * 3;
        const dx = Math.sin(telemetry.t * 53 + i * 7) * amount * 18;
        canvasCtx.drawImage(canvasCtx.canvas, 0, sy, width, sh, dx, sy, width, sh);
      }
      canvasCtx.restore();
    },
    scanlines: (alpha = 0.2) => {
      flush3DIfNeeded();
      canvasCtx.save();
      canvasCtx.fillStyle = `rgba(0,0,0,${clamp(alpha, 0, 0.8)})`;
      for (let y = 0; y < height; y += 3) {
        canvasCtx.fillRect(0, y, width, 1);
      }
      canvasCtx.restore();
    },
    invert: (amount = 0.5) => {
      flush3DIfNeeded();
      canvasCtx.save();
      canvasCtx.globalCompositeOperation = "difference";
      const gray = Math.round(clamp(amount, 0, 1) * 255);
      canvasCtx.fillStyle = `rgb(${gray},${gray},${gray})`;
      canvasCtx.fillRect(0, 0, width, height);
      canvasCtx.restore();
    },
    zoom: (scale = 1.1) => {
      flush3DIfNeeded();
      const s = clamp(scale, 0.5, 2.5);
      if (Math.abs(s - 1) < 0.005) return;
      canvasCtx.save();
      canvasCtx.translate(width / 2, height / 2);
      canvasCtx.scale(s, s);
      canvasCtx.drawImage(canvasCtx.canvas, -width / 2, -height / 2, width, height);
      canvasCtx.restore();
    },
    text: (str, x, y, color = "#FFFFFF", size = 10) => {
      flush3DIfNeeded();
      canvasCtx.save();
      canvasCtx.fillStyle = color;
      canvasCtx.font = `bold ${Math.max(6, size)}px monospace`;
      canvasCtx.fillText(String(str), x, y);
      canvasCtx.restore();
    },
    __flush3D: flush3DIfNeeded,
  };

  return ctxObj;
}


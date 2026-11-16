export const CPP_SHADER_STORAGE_KEY = "openhub_cpp_shader_v1";
export const CPP_SHADER_ENABLED_KEY = "openhub_cpp_shader_enabled_v1";

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
  params: Record<string, CppUniformValue>;
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
  code: string;
}

export const CPP_PRESET_TEMPLATES: CppPresetTemplate[] = [
  {
    id: "cpp-katana-grid",
    name: "PS2 // Katana Laser Grid",
    code: `// @param float speed = 45.0 [0.0, 120.0]
// @param float ringScale = 1.0 [0.4, 2.5]
// @color laserColor = "#00E5FF"
// @toggle enableGlitch = true
#include <cmath>

void renderAnarchyFrame(AnarchyCtx& ctx) {
  float pulse = 1.0f + ctx.bass * 0.25f;
  ctx.zoom(pulse);
  ctx.grid(20, laserColor, speed);

  float cx = ctx.width * 0.5f;
  float cy = ctx.height * 0.5f;
  float r = (24.0f + ctx.bass * 48.0f) * ringScale;
  ctx.ring(cx, cy, r, 2.5f, "#FF1B24");
  ctx.ring(cx, cy, r * 0.65f, 1.5f, laserColor);

  if (enableGlitch && ctx.flux > 0.28f) {
    ctx.glitchSlices(ctx.flux * 0.7f);
  }
  ctx.scanlines(0.22f);
}`,
  },
  {
    id: "cpp-anaglyph-radar",
    name: "Anaglyph // Bass Shockwave",
    code: `// @param int rings = 5 [1, 12]
// @param float waveSpeed = 1.4 [0.2, 5.0]
// @color leftColor = "#FF1B24"
// @color rightColor = "#00E5FF"
void renderAnarchyFrame(const AnarchyCtx& ctx) {
  ctx.tint("#10050A", 0.25f);
  float cx = ctx.width * 0.5f;
  float cy = ctx.height * 0.5f;
  for (int i = 0; i < rings; i++) {
    float phase = std::fmod(ctx.t * waveSpeed + i * 0.2f, 1.0f);
    float rad = 12.0f + phase * (70.0f + ctx.bass * 45.0f);
    ctx.ring(cx - 2.0f * ctx.bass * 4.0f, cy, rad, 1.5f, leftColor);
    ctx.ring(cx + 2.0f * ctx.bass * 4.0f, cy, rad, 1.5f, rightColor);
  }
  ctx.line(0, cy + std::sin(ctx.t * 5.0f) * 20.0f * ctx.mid, ctx.width, cy - std::sin(ctx.t * 5.0f) * 20.0f * ctx.mid, 1.5f, "#FFFFFF");
}`,
  },
  {
    id: "cpp-pure-cpp-scene",
    name: "Pure C++ // Enter the Matrix",
    code: `// @param int spokes = 12 [4, 24]
// @param float orbitSpeed = 1.8 [0.2, 6.0]
// @color bgColor = "#090B10"
void renderAnarchyFrame(AnarchyCtx& ctx) {
  ctx.clear(bgColor);
  ctx.grid(16, "#143844", 30.0f);

  float cx = ctx.width * 0.5f;
  float cy = ctx.height * 0.5f;
  for (int i = 0; i < spokes; i++) {
    float a = ctx.t * orbitSpeed + i * (6.28318f / spokes);
    float d = 22.0f + ctx.bass * 52.0f;
    float x = cx + cosf(a) * d;
    float y = cy + sinf(a) * d * 0.7f;
    ctx.line(cx, cy, x, y, 1.5f, i % 2 == 0 ? "#FF1B24" : "#00E5FF");
    ctx.circle(x, y, 3.0f + ctx.treble * 5.0f, "#FFFFFF", true);
  }
  ctx.text("C++ LIVE // ANARCHY", 10, 18, "#00E5FF", 10);
  ctx.scanlines(0.25f);
}`,
  },
  {
    id: "cpp-psy-mirror",
    name: "Psy // Kaleidoscope Overdrive",
    code: `// @param int segments = 6 [2, 10]
// @param float invertThresh = 0.45 [0.1, 0.95]
void renderAnarchyFrame(AnarchyCtx& ctx) {
  ctx.kaleidoscope(segments, 0.9f + ctx.mid);
  if (ctx.beatPhase < 0.14f && ctx.bass > invertThresh) {
    ctx.invert(0.65f);
  }
  ctx.scanlines(0.18f);
}`,
  },
  {
    id: "cpp-tiktok-karaoke",
    name: "TikTok / Reels // Paroles Karaoké & Glitch",
    code: `// @param float textScale = 13.0 [8.0, 22.0]
// @color highlightColor = "#00E5FF"
void renderAnarchyFrame(AnarchyCtx& ctx) {
  float cx = ctx.width * 0.5f;
  float cy = ctx.height * 0.72f;
  float pulse = 1.0f + ctx.bass * 0.12f;
  ctx.zoom(pulse);

  if (ctx.flux > 0.35f) {
    ctx.glitchSlices(ctx.flux * 0.5f);
  }
  if (!ctx.lyricWord.empty()) {
    float x = clamp(cx - ctx.lyricWord.length * 4.5f, 8.0f, ctx.width - 40.0f);
    ctx.rect(x - 6, cy - 16, ctx.lyricWord.length * 9 + 12, 22, "#000000");
    ctx.text(ctx.lyricWord, x - 1, cy, "#FF1B24", (int)textScale);
    ctx.text(ctx.lyricWord, x + 1, cy, highlightColor, (int)textScale);
    ctx.text(ctx.lyricWord, x, cy, "#FFFFFF", (int)textScale);
  }
  ctx.scanlines(0.15f);
}`,
  },
  {
    id: "cpp-scenario-storyboard",
    name: "Scénario // Sections & Barre Progression",
    code: `// @color barColor = "#FF1B24"
// @color sectionColor = "#00E5FF"
void renderAnarchyFrame(AnarchyCtx& ctx) {
  float barW = (ctx.width - 20.0f) * ctx.lyricProgress;
  ctx.rect(10, ctx.height - 16, ctx.width - 20, 4, "#15161A");
  ctx.rect(10, ctx.height - 16, barW, 4, barColor);

  if (ctx.lyricSection == "DROP") {
    ctx.ring(ctx.width * 0.5f, ctx.height * 0.45f, 20.0f + ctx.bass * 55.0f, 2.0f, sectionColor);
  }
  ctx.text(ctx.lyricSection, 10, 22, sectionColor, 10);
  if (ctx.lyricLine.length > 0) {
    ctx.text(ctx.lyricLine, 10, ctx.height - 26, "#FFFFFF", 9);
  }
}`,
  },
];

export const CPP_SHADER_AI_PROMPT = `Tu es un artiste shader C++ pour Open Hub / Anarchy Visual Studio.
Génère un script C++ complet compatible avec le runtime navigateur :
// @param float speed = 4.0 [0.0, 20.0]
// @color primaryColor = "#00F0FF"
// @toggle enableGlitch = true
void renderAnarchyFrame(AnarchyCtx& ctx) { ... }

Variables disponibles sur ctx :
- Temps & BPM : ctx.t, ctx.bpm, ctx.beat, ctx.beatPhase (0..1)
- Audio live : ctx.bass, ctx.mid, ctx.treble, ctx.rms, ctx.flux (0..1)
- Dimensions dynamiques (16:9=320x180, 9:16=180x320, 4:5=240x300, 1:1=240x240) : ctx.width, ctx.height
- Scénario & Paroles (LRC / Whisper) : ctx.lyricLine, ctx.lyricWord, ctx.lyricProgress (0..1), ctx.lyricSection (ex: "MAIN", "DROP", "REFRAIN")
- Paramètres exposés UI : chaque variable déclarée via // @param, // @color ou // @toggle est utilisable directement comme variable C++ (et sur ctx.params).

Méthodes disponibles :
- ctx.clear(color), ctx.tint(color, alpha), ctx.zoom(scale)
- ctx.circle(x, y, r, color, fill), ctx.ring(x, y, r, lineWidth, color), ctx.line(x1,y1,x2,y2,w,color), ctx.rect(x, y, w, h, color)
- ctx.grid(spacing, color, scrollSpeed), ctx.kaleidoscope(segments, speed), ctx.glitchSlices(amount), ctx.scanlines(alpha), ctx.invert(amount)
- ctx.text(str, x, y, color, size)

Tu peux utiliser : #include <cmath>, std::sin/cos/min/max/abs/pow/fmod, sinf/cosf/fabsf/fmodf/powf, tableaux type arr[N] = {...}, lambdas [&](){...} et fonctions utilitaires.
Contraintes : utilise toujours ctx.width et ctx.height pour que l'effet marche en 9:16 TikTok/Reels comme en 16:9 YouTube.`;

export const DEFAULT_CPP_SHADER_CODE = CPP_PRESET_TEMPLATES[0].code;

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

    // @param <type> <name> = <val> [min, max]
    const paramMatch = lineText.match(
      /^\/\/\s*@param\s+(float|double|int|bool)\s+([a-zA-Z_]\w*)\s*=\s*([^\[\s]+)(?:\s*\[\s*([^,\]]+)\s*,\s*([^\]]+)\s*\])?/i
    );
    if (paramMatch) {
      const rawType = paramMatch[1].toLowerCase();
      const name = paramMatch[2];
      const rawDefault = paramMatch[3].replace(/[fF]$/, "");
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
          : isInt
          ? 0
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

    // Chaîne "..." ou '...'
    if (ch === '"' || ch === "'") {
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
      fn: null,
      uniforms,
      errorLine,
      error: errorLine ? `Ligne ${errorLine} : ${rawMsg}` : rawMsg,
      transpiledCode: js,
    };
  }
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
    params?: Record<string, CppUniformValue>;
  }
): CppRenderContext {
  const rgb = (r: number, g: number, b: number) =>
    `rgb(${Math.round(clamp(r, 0, 255))},${Math.round(clamp(g, 0, 255))},${Math.round(clamp(b, 0, 255))})`;
  const rgba = (r: number, g: number, b: number, a: number) =>
    `rgba(${Math.round(clamp(r, 0, 255))},${Math.round(clamp(g, 0, 255))},${Math.round(clamp(b, 0, 255))},${clamp(a, 0, 1)})`;

  return {
    ...telemetry,
    lyricLine: telemetry.lyricLine ?? "",
    lyricWord: telemetry.lyricWord ?? "",
    lyricProgress: telemetry.lyricProgress ?? 0,
    lyricSection: telemetry.lyricSection ?? "MAIN",
    params: telemetry.params ?? {},
    width,
    height,
    rgb,
    rgba,
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
      canvasCtx.save();
      canvasCtx.globalAlpha = clamp(alpha, 0, 1);
      canvasCtx.fillStyle = color;
      canvasCtx.fillRect(0, 0, width, height);
      canvasCtx.restore();
    },
    circle: (x, y, radius, color = "#FF1B24", fill = true) => {
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
      canvasCtx.save();
      canvasCtx.beginPath();
      canvasCtx.arc(x, y, Math.max(0.5, radius), 0, Math.PI * 2);
      canvasCtx.strokeStyle = color;
      canvasCtx.lineWidth = Math.max(0.5, lineWidth);
      canvasCtx.stroke();
      canvasCtx.restore();
    },
    line: (x1, y1, x2, y2, lineWidth = 1.5, color = "#FFFFFF") => {
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
      canvasCtx.save();
      canvasCtx.fillStyle = color;
      canvasCtx.fillRect(x, y, w, h);
      canvasCtx.restore();
    },
    grid: (spacing = 20, color = "rgba(0,229,255,0.28)", scrollSpeed = 30) => {
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
      canvasCtx.save();
      canvasCtx.fillStyle = `rgba(0,0,0,${clamp(alpha, 0, 0.8)})`;
      for (let y = 0; y < height; y += 3) {
        canvasCtx.fillRect(0, y, width, 1);
      }
      canvasCtx.restore();
    },
    invert: (amount = 0.5) => {
      canvasCtx.save();
      canvasCtx.globalCompositeOperation = "difference";
      const gray = Math.round(clamp(amount, 0, 1) * 255);
      canvasCtx.fillStyle = `rgb(${gray},${gray},${gray})`;
      canvasCtx.fillRect(0, 0, width, height);
      canvasCtx.restore();
    },
    zoom: (scale = 1.1) => {
      const s = clamp(scale, 0.5, 2.5);
      if (Math.abs(s - 1) < 0.005) return;
      canvasCtx.save();
      canvasCtx.translate(width / 2, height / 2);
      canvasCtx.scale(s, s);
      canvasCtx.drawImage(canvasCtx.canvas, -width / 2, -height / 2, width, height);
      canvasCtx.restore();
    },
    text: (str, x, y, color = "#FFFFFF", size = 10) => {
      canvasCtx.save();
      canvasCtx.fillStyle = color;
      canvasCtx.font = `bold ${Math.max(6, size)}px monospace`;
      canvasCtx.fillText(String(str), x, y);
      canvasCtx.restore();
    },
  };
}

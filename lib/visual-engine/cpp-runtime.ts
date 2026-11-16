export const CPP_SHADER_STORAGE_KEY = "openhub_cpp_shader_v1";
export const CPP_SHADER_ENABLED_KEY = "openhub_cpp_shader_enabled_v1";

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
    code: `// Injecte du C++ visuel temps réel (320x180)
void renderAnarchyFrame(AnarchyCtx& ctx) {
  float pulse = 1.0f + ctx.bass * 0.25f;
  ctx.zoom(pulse);
  ctx.grid(20, ctx.rgba(0, 229, 255, 0.32f), 45.0f);

  float cx = ctx.width * 0.5f;
  float cy = ctx.height * 0.5f;
  float r = 24.0f + ctx.bass * 48.0f;
  ctx.ring(cx, cy, r, 2.5f, "#FF1B24");
  ctx.ring(cx, cy, r * 0.65f, 1.5f, "#00E5FF");

  if (ctx.flux > 0.28f) {
    ctx.glitchSlices(ctx.flux * 0.7f);
  }
  ctx.scanlines(0.22f);
}`,
  },
  {
    id: "cpp-anaglyph-radar",
    name: "Anaglyph // Bass Shockwave",
    code: `// Remplace ou transforme le rendu avec des ondes 3D Rouge/Cyan
void renderAnarchyFrame(AnarchyCtx& ctx) {
  ctx.tint("#10050A", 0.25f);
  float cx = ctx.width * 0.5f;
  float cy = ctx.height * 0.5f;
  int rings = 5;
  for (int i = 0; i < rings; i++) {
    float phase = fmod(ctx.t * 1.4f + i * 0.2f, 1.0f);
    float rad = 12.0f + phase * (70.0f + ctx.bass * 45.0f);
    ctx.ring(cx - 2.0f * ctx.bass * 4.0f, cy, rad, 1.5f, "#FF1B24");
    ctx.ring(cx + 2.0f * ctx.bass * 4.0f, cy, rad, 1.5f, "#00E5FF");
  }
  ctx.line(0, cy + sin(ctx.t * 5.0f) * 20.0f * ctx.mid, ctx.width, cy - sin(ctx.t * 5.0f) * 20.0f * ctx.mid, 1.5f, "#FFFFFF");
}`,
  },
  {
    id: "cpp-pure-cpp-scene",
    name: "Pure C++ // Enter the Matrix",
    code: `// MODE C++ PUR (appelle ctx.clear pour dessiner de zéro)
void renderAnarchyFrame(AnarchyCtx& ctx) {
  ctx.clear("#090B10");
  ctx.grid(16, "#143844", 30.0f);

  float cx = ctx.width * 0.5f;
  float cy = ctx.height * 0.5f;
  for (int i = 0; i < 12; i++) {
    float a = ctx.t * 1.8f + i * 0.5235f;
    float d = 22.0f + ctx.bass * 52.0f;
    float x = cx + cos(a) * d;
    float y = cy + sin(a) * d * 0.7f;
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
    code: `// Effet Kaléidoscope + Flash Beat
void renderAnarchyFrame(AnarchyCtx& ctx) {
  ctx.kaleidoscope(6, 0.9f + ctx.mid);
  if (ctx.beatPhase < 0.14f && ctx.bass > 0.45f) {
    ctx.invert(0.65f);
  }
  ctx.scanlines(0.18f);
}`,
  },
  {
    id: "cpp-tiktok-karaoke",
    name: "TikTok / Reels // Paroles Karaoké & Glitch",
    code: `// Animation paroles mot-à-mot (adaptée 9:16, 4:5, 1:1, 16:9)
void renderAnarchyFrame(AnarchyCtx& ctx) {
  float cx = ctx.width * 0.5f;
  float cy = ctx.height * 0.72f;
  float pulse = 1.0f + ctx.bass * 0.12f;
  ctx.zoom(pulse);

  if (ctx.flux > 0.35f) {
    ctx.glitchSlices(ctx.flux * 0.5f);
  }
  if (ctx.lyricWord.length > 0) {
    float x = _clamp(cx - ctx.lyricWord.length * 4.5f, 8.0f, ctx.width - 40.0f);
    ctx.rect(x - 6, cy - 16, ctx.lyricWord.length * 9 + 12, 22, "#000000");
    ctx.text(ctx.lyricWord, x - 1, cy, "#FF1B24", 13);
    ctx.text(ctx.lyricWord, x + 1, cy, "#00E5FF", 13);
    ctx.text(ctx.lyricWord, x, cy, "#FFFFFF", 13);
  }
  ctx.scanlines(0.15f);
}`,
  },
  {
    id: "cpp-scenario-storyboard",
    name: "Scénario // Sections & Barre Progression",
    code: `// Réagit aux sections #INTRO / #DROP et à la progression des paroles
void renderAnarchyFrame(AnarchyCtx& ctx) {
  float barW = (ctx.width - 20.0f) * ctx.lyricProgress;
  ctx.rect(10, ctx.height - 16, ctx.width - 20, 4, "#15161A");
  ctx.rect(10, ctx.height - 16, barW, 4, "#FF1B24");

  if (ctx.lyricSection == "DROP") {
    ctx.ring(ctx.width * 0.5f, ctx.height * 0.45f, 20.0f + ctx.bass * 55.0f, 2.0f, "#00E5FF");
  }
  ctx.text(ctx.lyricSection, 10, 22, "#00E5FF", 10);
  if (ctx.lyricLine.length > 0) {
    ctx.text(ctx.lyricLine, 10, ctx.height - 26, "#FFFFFF", 9);
  }
}`,
  },
];

export const CPP_SHADER_AI_PROMPT = `Tu es un artiste shader C++ pour Open Hub / Anarchy Visual Studio.
Génère une fonction C++ compatible avec le runtime navigateur :
void renderAnarchyFrame(AnarchyCtx& ctx) { ... }

Variables disponibles sur ctx :
- Temps & BPM : ctx.t, ctx.bpm, ctx.beat, ctx.beatPhase (0..1)
- Audio live : ctx.bass, ctx.mid, ctx.treble, ctx.rms, ctx.flux (0..1)
- Dimensions dynamiques (16:9=320x180, 9:16=180x320, 4:5=240x300, 1:1=240x240) : ctx.width, ctx.height
- Scénario & Paroles (LRC / Whisper) : ctx.lyricLine, ctx.lyricWord, ctx.lyricProgress (0..1), ctx.lyricSection (ex: "MAIN", "DROP", "REFRAIN")

Méthodes disponibles :
- ctx.clear(color), ctx.tint(color, alpha), ctx.zoom(scale)
- ctx.circle(x, y, r, color, fill), ctx.ring(x, y, r, lineWidth, color), ctx.line(x1, y1, x2, y2, w, color), ctx.rect(x, y, w, h, color)
- ctx.grid(spacing, color, scrollSpeed), ctx.kaleidoscope(segments, speed), ctx.glitchSlices(amount), ctx.scanlines(alpha), ctx.invert(amount)
- ctx.text(str, x, y, color, size)

Contraintes : utilise toujours ctx.width et ctx.height pour que l'effet marche en 9:16 TikTok/Reels comme en 16:9 YouTube, et anime ctx.lyricWord / ctx.lyricSection sur ctx.bass et ctx.flux.`;

export const DEFAULT_CPP_SHADER_CODE = CPP_PRESET_TEMPLATES[0].code;

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function fmod(a: number, b: number): number {
  if (!b) return 0;
  return a % b;
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
];

/**
 * Transpile un corps C++ (`void renderAnarchyFrame(AnarchyCtx& ctx) { ... }` ou instructions directes)
 * en fonction exécutable sur le Canvas 320x180 à 60fps.
 */
export function compileCppVisual(source: string): {
  ok: boolean;
  fn: ((ctx: CppRenderContext) => void) | null;
  error?: string;
} {
  const clean = source.trim();
  if (!clean) {
    return { ok: false, fn: null, error: "Code C++ vide." };
  }

  for (const word of FORBIDDEN_IDENTIFIERS) {
    const rx = new RegExp(`\\b${word}\\b`);
    if (rx.test(clean)) {
      return {
        ok: false,
        fn: null,
        error: `Symbole non autorisé dans le shader C++ : ${word}`,
      };
    }
  }

  // Extraire le corps de renderAnarchyFrame(...) si présent
  let body = clean;
  const fnMatch = clean.match(
    /void\s+\w+\s*\([^)]*\)\s*\{([\s\S]*)\}\s*$/
  );
  if (fnMatch) {
    body = fnMatch[1];
  }

  // Transpilation syntaxique C++ -> JS mathématique
  let js = body
    // Supprimer #pragma, #include, struct
    .replace(/^\s*#(pragma|include).*$/gm, "")
    // Convertir std::math -> math
    .replace(/\bstd::/g, "")
    // Accès C++ ptr/ref ctx->foo -> ctx.foo
    .replace(/->/g, ".")
    // Littéraux float C++ (ex: 1.5f, 20.f) -> nombre JS
    .replace(/(\d+(?:\.\d*)?|\.\d+)f\b/g, "$1")
    // Déclarations de variables C++ (const float, float, double, int, bool, auto, size_t) -> let
    .replace(
      /\b(?:const\s+)?(?:constexpr\s+)?(?:float|double|int|long|unsigned\s+int|unsigned|bool|auto|size_t)\s+([a-zA-Z_]\w*)/g,
      "let $1"
    )
    // const char* x = ... -> const x = ...
    .replace(/\b(?:const\s+)?char\s*\*\s*([a-zA-Z_]\w*)/g, "let $1");

  js = `
    "use strict";
    const sin = Math.sin, cos = Math.cos, tan = Math.tan, abs = Math.abs;
    const min = Math.min, max = Math.max, pow = Math.pow, sqrt = Math.sqrt;
    const floor = Math.floor, ceil = Math.ceil, round = Math.round;
    const PI = Math.PI;
    const clamp = _clamp;
    const fmod = _fmod;
    ${js}
  `;

  try {
    const compiled = new Function(
      "ctx",
      "_clamp",
      "_fmod",
      js
    ) as (
      ctx: CppRenderContext,
      _clamp: typeof clamp,
      _fmod: typeof fmod
    ) => void;

    return {
      ok: true,
      fn: (ctx: CppRenderContext) => compiled(ctx, clamp, fmod),
    };
  } catch (err) {
    return {
      ok: false,
      fn: null,
      error: err instanceof Error ? err.message : "Erreur de syntaxe C++.",
    };
  }
}

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

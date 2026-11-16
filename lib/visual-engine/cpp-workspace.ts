import type { SceneId } from "@/lib/visual-engine/contracts";
import {
  CPP_SHADER_ENABLED_KEY,
  CPP_SHADER_STORAGE_KEY,
  parseCppUniforms,
  type CppRenderContext,
  type CppUniformValue,
} from "@/lib/visual-engine/cpp-runtime";

export const CPP_WORKSPACE_STORAGE_KEY = "openhub_cpp_workspace_v1";
export const CPP_WORKSPACE_EVENT = "openhub:cpp-workspace-updated";

export interface CppDocumentPreset {
  id: string;
  name: string;
  values: Record<string, CppUniformValue>;
}

export interface CppDocument {
  id: string;
  name: string;
  code: string;
  presets: CppDocumentPreset[];
  activePresetId: string;
  updatedAt: string;
}

export type CppSceneRoutingMode = "section" | "time" | "manual";
export type CppTransitionKind = "cut" | "fade" | "glitch";

export interface CppSceneRule {
  id: string;
  label: string;
  documentId: string;
  presetId?: string;
  routingMode: CppSceneRoutingMode;
  sectionTag?: string; // ex: INTRO, MAIN, COUPLET, PRE_DROP, DROP, REFRAIN, OUTRO
  startTime?: number;
  endTime?: number;
  baseSceneId?: SceneId;
  transition: CppTransitionKind;
  transitionDuration: number; // secondes (ex: 0.35)
}

export interface CppWorkspaceState {
  version: 1;
  enabled: boolean;
  activeDocumentId: string;
  manualSceneId: string | null; // si défini, verrouille un pad VJ manuel
  documents: CppDocument[];
  scenes: CppSceneRule[];
}

export const DEFAULT_CPP_DOCUMENTS: CppDocument[] = [
  {
    id: "doc-sceno-openhub",
    name: "sceno_openhub_ps2.cpp",
    updatedAt: "2026-11-16T00:00:00Z",
    activePresetId: "preset-anarchy-3d",
    code: `// Scénographie Open Hub PS1/PS2 préservée + surcouche C++ temps réel
// @param float gridSpeed = 40.0 [0.0, 120.0]
// @param float ringPulse = 1.0 [0.3, 2.5]
// @param float glitchThresh = 0.32 [0.1, 0.95]
// @color primaryColor = "#00E5FF"
// @color accentColor = "#FF1B24"
// @toggle pureCppMode = false
#include <cmath>

void renderAnarchyFrame(AnarchyCtx& ctx) {
  if (pureCppMode) {
    ctx.clear("#090B10");
  }

  float pulse = 1.0f + ctx.bass * 0.14f;
  ctx.zoom(pulse);
  ctx.grid(22, primaryColor, gridSpeed);

  float cx = ctx.width * 0.5f;
  float cy = ctx.height * 0.5f;
  float r = (18.0f + ctx.bass * 42.0f) * ringPulse;
  ctx.ring(cx, cy, r, 2.0f, accentColor);
  ctx.ring(cx, cy, r * 0.65f, 1.5f, primaryColor);

  if (ctx.flux > glitchThresh) {
    ctx.glitchSlices(ctx.flux * 0.65f);
  }
  ctx.scanlines(0.18f);
}`,
    presets: [
      {
        id: "preset-anarchy-3d",
        name: "Anarchy 3D",
        values: {
          gridSpeed: 40,
          ringPulse: 1.0,
          glitchThresh: 0.32,
          primaryColor: "#00E5FF",
          accentColor: "#FF1B24",
          pureCppMode: false,
        },
      },
      {
        id: "preset-ps2-dragon",
        name: "PS2 Enter the Dragon",
        values: {
          gridSpeed: 78,
          ringPulse: 1.65,
          glitchThresh: 0.22,
          primaryColor: "#D4FF33",
          accentColor: "#FF1424",
          pureCppMode: false,
        },
      },
    ],
  },
  {
    id: "doc-brutalist-grid",
    name: "brutalist_grid.cpp",
    updatedAt: "2026-11-16T00:00:00Z",
    activePresetId: "preset-bunker",
    code: `// Architecture brutaliste & onde oscilloscope réactive aux kicks
// @param int cols = 8 [3, 16]
// @param float swayAmp = 24.0 [0.0, 60.0]
// @color strokeColor = "#ADC6CE"
// @color bgColor = "#0B0E14"
// @toggle invertOnKick = true
#include <cmath>

float calcWave(float t, float idx, float amp) {
  return std::sin(t * 2.4f + idx * 0.7f) * amp;
}

void renderAnarchyFrame(const AnarchyCtx& ctx) {
  ctx.clear(bgColor);
  ctx.grid(28, "rgba(173, 198, 206, 0.18)", 12.0f);

  float cx = ctx.width * 0.5f;
  float cy = ctx.height * 0.5f;

  for (int i = 0; i < cols; i++) {
    float x = (ctx.width / (float)cols) * (i + 0.5f);
    float yOff = calcWave(ctx.t, (float)i, swayAmp * (0.4f + ctx.mid));
    ctx.line(x, 12.0f, x, ctx.height - 12.0f, 1.5f, strokeColor);
    ctx.rect(x - 6.0f, cy + yOff - 4.0f, 12.0f, 8.0f, "#FF1B24");
  }

  ctx.line(0, cy, ctx.width, cy, 2.0f, strokeColor);
  ctx.ring(cx, cy, 16.0f + ctx.bass * 54.0f, 2.5f, strokeColor);

  if (invertOnKick && ctx.beatPhase < 0.12f && ctx.bass > 0.55f) {
    ctx.invert(0.75f);
  }
  ctx.scanlines(0.24f);
}`,
    presets: [
      {
        id: "preset-bunker",
        name: "Bunker Brutaliste",
        values: {
          cols: 8,
          swayAmp: 24,
          strokeColor: "#ADC6CE",
          bgColor: "#0B0E14",
          invertOnKick: true,
        },
      },
      {
        id: "preset-acid-concrete",
        name: "Acide Toxique",
        values: {
          cols: 12,
          swayAmp: 42,
          strokeColor: "#B9C87A",
          bgColor: "#09100C",
          invertOnKick: true,
        },
      },
    ],
  },
  {
    id: "doc-cyber-katana",
    name: "cyber_katana_drop.cpp",
    updatedAt: "2026-11-16T00:00:00Z",
    activePresetId: "preset-neon-cyber",
    code: `// Tunnel cyber & anneaux katana (démontre tableaux, lambdas & fmodf)
// @param float speed = 4.0 [0.5, 16.0]
// @param int spokes = 10 [4, 20]
// @color primaryColor = "#00F0FF"
// @color secondaryColor = "#FF1B24"
// @toggle kaleidoscopeFx = true
#include <cmath>
using namespace std;

void renderAnarchyFrame(AnarchyCtx& ctx) {
  ctx.clear("#07080F");
  float cx = ctx.width * 0.5f;
  float cy = ctx.height * 0.5f;

  float radii[4] = {18.0f, 36.0f, 58.0f, 82.0f};
  auto drawBlade = [&](float angle, float radius, const char* col) {
    float x2 = cx + cosf(angle) * radius;
    float y2 = cy + sinf(angle) * radius;
    ctx.line(cx, cy, x2, y2, 2.0f, col);
    ctx.circle(x2, y2, 2.5f + ctx.treble * 4.5f, "#FFFFFF", true);
  };

  for (int i = 0; i < spokes; i++) {
    float a = ctx.t * speed * 0.35f + i * (6.28318f / spokes);
    float len = radii[i % 4] * (0.75f + ctx.bass * 0.85f);
    drawBlade(a, len, i % 2 == 0 ? primaryColor : secondaryColor);
  }

  for (int r = 0; r < 4; r++) {
    float p = fmodf(ctx.t * speed * 0.3f + r * 0.25f, 1.0f);
    ctx.ring(cx, cy, 10.0f + p * min(ctx.width, ctx.height) * 0.48f, 1.8f, primaryColor);
  }

  if (kaleidoscopeFx) {
    ctx.kaleidoscope(6, 0.8f + ctx.mid);
  }
  if (ctx.flux > 0.25f) {
    ctx.glitchSlices(ctx.flux * 0.8f);
  }
  ctx.scanlines(0.20f);
}`,
    presets: [
      {
        id: "preset-neon-cyber",
        name: "Néon Cyber",
        values: {
          speed: 4.0,
          spokes: 10,
          primaryColor: "#00F0FF",
          secondaryColor: "#FF1B24",
          kaleidoscopeFx: true,
        },
      },
      {
        id: "preset-blood-overdrive",
        name: "Blood Overdrive",
        values: {
          speed: 9.5,
          spokes: 16,
          primaryColor: "#FF3940",
          secondaryColor: "#FFFFFF",
          kaleidoscopeFx: true,
        },
      },
    ],
  },
  {
    id: "doc-tiktok-karaoke",
    name: "tiktok_karaoke_hud.cpp",
    updatedAt: "2026-11-16T00:00:00Z",
    activePresetId: "preset-tiktok-anaglyph",
    code: `// Overlay Paroles Whisper/LRC adaptatif 9:16 TikTok & 16:9 YouTube
// @param float fontSize = 13.0 [8.0, 22.0]
// @param float yPosRatio = 0.70 [0.15, 0.90]
// @color cyanLayer = "#00E5FF"
// @color redLayer = "#FF1B24"
// @toggle showProgressBar = true
void renderAnarchyFrame(AnarchyCtx& ctx) {
  float cx = ctx.width * 0.5f;
  float cy = ctx.height * yPosRatio;

  ctx.zoom(1.0f + ctx.bass * 0.10f);

  if (showProgressBar) {
    float barW = (ctx.width - 20.0f) * ctx.lyricProgress;
    ctx.rect(10, ctx.height - 16, ctx.width - 20, 4, "#15161A");
    ctx.rect(10, ctx.height - 16, barW, 4, redLayer);
  }

  ctx.text(ctx.lyricSection, 10, 20, cyanLayer, 10);

  if (!ctx.lyricWord.empty()) {
    float estW = ctx.lyricWord.length * (fontSize * 0.62f);
    float x = clamp(cx - estW * 0.5f, 8.0f, ctx.width - 32.0f);
    ctx.rect(x - 6, cy - fontSize, estW + 12, fontSize + 8, "#000000");
    ctx.text(ctx.lyricWord, x - 1.5f, cy, redLayer, (int)fontSize);
    ctx.text(ctx.lyricWord, x + 1.5f, cy, cyanLayer, (int)fontSize);
    ctx.text(ctx.lyricWord, x, cy, "#FFFFFF", (int)fontSize);
  }

  if (ctx.lyricLine.length > 0) {
    ctx.text(ctx.lyricLine, 10, ctx.height - 26, "#D4D4D8", 9);
  }
}`,
    presets: [
      {
        id: "preset-tiktok-anaglyph",
        name: "TikTok Anaglyph",
        values: {
          fontSize: 13.0,
          yPosRatio: 0.70,
          cyanLayer: "#00E5FF",
          redLayer: "#FF1B24",
          showProgressBar: true,
        },
      },
      {
        id: "preset-clean-hud",
        name: "Subtitles Clean",
        values: {
          fontSize: 11.0,
          yPosRatio: 0.80,
          cyanLayer: "#FFFFFF",
          redLayer: "#00E5FF",
          showProgressBar: false,
        },
      },
    ],
  },
];

export const DEFAULT_CPP_SCENES: CppSceneRule[] = [
  {
    id: "scene-intro",
    label: "INTRO // Bunker",
    documentId: "doc-brutalist-grid",
    presetId: "preset-bunker",
    routingMode: "section",
    sectionTag: "INTRO",
    baseSceneId: "industrial-city",
    transition: "fade",
    transitionDuration: 0.45,
  },
  {
    id: "scene-main",
    label: "MAIN // Scéno PS2",
    documentId: "doc-sceno-openhub",
    presetId: "preset-anarchy-3d",
    routingMode: "section",
    sectionTag: "MAIN",
    baseSceneId: "ps1-nightmare",
    transition: "cut",
    transitionDuration: 0.25,
  },
  {
    id: "scene-drop",
    label: "DROP // Katana",
    documentId: "doc-cyber-katana",
    presetId: "preset-neon-cyber",
    routingMode: "section",
    sectionTag: "DROP",
    baseSceneId: "techno-therapy",
    transition: "glitch",
    transitionDuration: 0.4,
  },
  {
    id: "scene-refrain",
    label: "REFRAIN // Karaoké",
    documentId: "doc-tiktok-karaoke",
    presetId: "preset-tiktok-anaglyph",
    routingMode: "section",
    sectionTag: "REFRAIN",
    baseSceneId: "rave-dungeon",
    transition: "fade",
    transitionDuration: 0.35,
  },
];

export function createDefaultCppWorkspace(): CppWorkspaceState {
  return {
    version: 1,
    enabled: false,
    activeDocumentId: DEFAULT_CPP_DOCUMENTS[0].id,
    manualSceneId: null,
    documents: DEFAULT_CPP_DOCUMENTS.map((d) => ({
      ...d,
      presets: d.presets.map((p) => ({ ...p, values: { ...p.values } })),
    })),
    scenes: DEFAULT_CPP_SCENES.map((s) => ({ ...s })),
  };
}

export function extractDocumentUniformValues(
  doc: CppDocument,
  presetIdOverride?: string
): Record<string, CppUniformValue> {
  const specs = parseCppUniforms(doc.code);
  const out: Record<string, CppUniformValue> = {};
  for (const spec of specs) {
    out[spec.name] = spec.defaultValue;
  }
  const targetPresetId = presetIdOverride || doc.activePresetId;
  const preset = doc.presets.find((p) => p.id === targetPresetId);
  if (preset) {
    for (const [k, v] of Object.entries(preset.values)) {
      if (k in out) out[k] = v;
    }
  }
  return out;
}

export function loadCppWorkspace(): CppWorkspaceState {
  if (typeof window === "undefined") {
    return createDefaultCppWorkspace();
  }
  try {
    const raw = window.localStorage.getItem(CPP_WORKSPACE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CppWorkspaceState>;
      if (
        parsed &&
        Array.isArray(parsed.documents) &&
        parsed.documents.length > 0 &&
        Array.isArray(parsed.scenes)
      ) {
        return {
          version: 1,
          enabled:
            typeof parsed.enabled === "boolean"
              ? parsed.enabled
              : window.localStorage.getItem(CPP_SHADER_ENABLED_KEY) === "true",
          activeDocumentId:
            parsed.activeDocumentId &&
            parsed.documents.some((d) => d.id === parsed.activeDocumentId)
              ? parsed.activeDocumentId
              : parsed.documents[0].id,
          manualSceneId: parsed.manualSceneId ?? null,
          documents: parsed.documents,
          scenes: parsed.scenes,
        };
      }
    }

    // Migration depuis l'ancien stockage mono-script si présent
    const legacyCode = window.localStorage.getItem(CPP_SHADER_STORAGE_KEY);
    const legacyEnabled =
      window.localStorage.getItem(CPP_SHADER_ENABLED_KEY) === "true";
    const base = createDefaultCppWorkspace();
    base.enabled = legacyEnabled;
    if (legacyCode && legacyCode.trim()) {
      base.documents[0] = {
        ...base.documents[0],
        code: legacyCode,
        updatedAt: new Date().toISOString(),
      };
    }
    return base;
  } catch {
    return createDefaultCppWorkspace();
  }
}

export function saveCppWorkspace(workspace: CppWorkspaceState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      CPP_WORKSPACE_STORAGE_KEY,
      JSON.stringify(workspace)
    );
    window.localStorage.setItem(
      CPP_SHADER_ENABLED_KEY,
      workspace.enabled ? "true" : "false"
    );
    const activeDoc =
      workspace.documents.find((d) => d.id === workspace.activeDocumentId) ??
      workspace.documents[0];
    if (activeDoc) {
      window.localStorage.setItem(CPP_SHADER_STORAGE_KEY, activeDoc.code);
    }
    window.dispatchEvent(new CustomEvent(CPP_WORKSPACE_EVENT));
  } catch {
    // ignore storage quota errors
  }
}

export interface ResolvedCppScene {
  scene: CppSceneRule | null;
  document: CppDocument;
  uniforms: Record<string, CppUniformValue>;
  matchedReason: string;
}

/**
 * Résout quel Document C++ + Preset exécuter à l'instant `timeSeconds` et section `lyricSection` :
 * 1. Pad VJ manuel (`manualSceneId`)
 * 2. Créneau temporel (`routingMode === "time"`)
 * 3. Section LRC / Whisper (`routingMode === "section"`)
 * 4. Document actif de l'éditeur en fallback
 */
export function resolveActiveCppScene(
  workspace: CppWorkspaceState,
  timeSeconds: number,
  lyricSection: string
): ResolvedCppScene {
  const docs =
    workspace.documents.length > 0
      ? workspace.documents
      : DEFAULT_CPP_DOCUMENTS;
  const fallbackDoc =
    docs.find((d) => d.id === workspace.activeDocumentId) ?? docs[0];

  const findDoc = (docId: string) =>
    docs.find((d) => d.id === docId) ?? fallbackDoc;

  // 1. Pad VJ manuel prioritaire
  if (workspace.manualSceneId) {
    const manualScene = workspace.scenes.find(
      (s) => s.id === workspace.manualSceneId
    );
    if (manualScene) {
      const doc = findDoc(manualScene.documentId);
      return {
        scene: manualScene,
        document: doc,
        uniforms: extractDocumentUniformValues(doc, manualScene.presetId),
        matchedReason: `PAD VJ : ${manualScene.label}`,
      };
    }
  }

  // 2. Créneau temporel [startTime, endTime)
  const timeMatch = workspace.scenes.find(
    (s) =>
      s.routingMode === "time" &&
      typeof s.startTime === "number" &&
      typeof s.endTime === "number" &&
      timeSeconds >= s.startTime &&
      timeSeconds < s.endTime
  );
  if (timeMatch) {
    const doc = findDoc(timeMatch.documentId);
    return {
      scene: timeMatch,
      document: doc,
      uniforms: extractDocumentUniformValues(doc, timeMatch.presetId),
      matchedReason: `TEMPS ${timeMatch.startTime}s→${timeMatch.endTime}s`,
    };
  }

  // 3. Section LRC / Whisper (#INTRO, #DROP, #REFRAIN, #MAIN...)
  const cleanSection = lyricSection.replace(/^#/, "").trim().toUpperCase();
  if (cleanSection) {
    const secMatch = workspace.scenes.find(
      (s) =>
        s.routingMode === "section" &&
        (s.sectionTag ?? "").replace(/^#/, "").trim().toUpperCase() ===
          cleanSection
    );
    if (secMatch) {
      const doc = findDoc(secMatch.documentId);
      return {
        scene: secMatch,
        document: doc,
        uniforms: extractDocumentUniformValues(doc, secMatch.presetId),
        matchedReason: `SECTION #${cleanSection}`,
      };
    }
  }

  // 4. Fallback document actif
  return {
    scene: null,
    document: fallbackDoc,
    uniforms: extractDocumentUniformValues(fallbackDoc),
    matchedReason: `DOC ACTIF (${fallbackDoc.name})`,
  };
}

/**
 * Applique une transition fluide lors d'un changement de scène C++ (`cut`, `fade`, `glitch`).
 */
export function applyCppSceneTransition(
  cppCtx: CppRenderContext,
  transition: CppTransitionKind,
  progress: number
): void {
  if (transition === "cut" || progress >= 1 || progress < 0) return;
  const strength = Math.max(0, Math.min(1, 1 - progress));
  if (transition === "fade") {
    cppCtx.tint("#000000", strength * 0.85);
  } else if (transition === "glitch") {
    cppCtx.glitchSlices(strength * 0.95);
    if (strength > 0.45) {
      cppCtx.invert((strength - 0.45) * 1.1);
    }
  }
}

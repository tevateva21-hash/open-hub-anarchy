import type { SceneId } from "@/lib/visual-engine/contracts";
import {
  CPP_SHADER_ENABLED_KEY,
  CPP_SHADER_STORAGE_KEY,
  DEFAULT_JS_SHADER_CODE,
  detectScriptLanguage,
  parseCppUniforms,
  type CppRenderContext,
  type CppUniformValue,
  type ScriptLanguage,
} from "@/lib/visual-engine/cpp-runtime";

export const CPP_WORKSPACE_STORAGE_KEY = "openhub_cpp_workspace_v2";
export const CPP_WORKSPACE_EVENT = "openhub:cpp-workspace-updated";

export interface CppDocumentPreset {
  id: string;
  name: string;
  values: Record<string, CppUniformValue>;
}

export interface CppDocument {
  id: string;
  name: string;
  language?: ScriptLanguage;
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
    id: "doc-dojo-neon-3d",
    name: "01_dojo_neon_3d.js",
    language: "js",
    updatedAt: "2026-11-18T00:00:00Z",
    activePresetId: "preset-dojo-cyan",
    code: DEFAULT_JS_SHADER_CODE,
    presets: [
      {
        id: "preset-dojo-cyan",
        name: "Dojo Cyan & Katana",
        values: {
          runSpeed: 3.8,
          fov: 62.0,
          neonColor: "#00F0FF",
          katanaColor: "#FF1B24",
          fogColor: "#0A0D18",
          wireframePillars: false,
        },
      },
      {
        id: "preset-dojo-blood",
        name: "Dojo Blood Moon",
        values: {
          runSpeed: 5.4,
          fov: 68.0,
          neonColor: "#FF1B24",
          katanaColor: "#D4FF33",
          fogColor: "#16070B",
          wireframePillars: true,
        },
      },
    ],
  },
  {
    id: "doc-enter-dragon-3d",
    name: "02_enter_the_dragon_3d.js",
    language: "js",
    updatedAt: "2026-11-18T00:00:00Z",
    activePresetId: "preset-dragon-gold",
    code: `// PS2 // Enter the Dragon — Temple Souterrain & Arches 3D
// @param float templeSpeed = 3.6 [0.5, 10.0]
// @param int archCount = 5 [3, 8]
// @color fogColor = "#0C0914"
// @color goldNeon = "#FFB800"
// @color crimsonNeon = "#FF1B24"

let dragonSpin = 0;

function renderAnarchyFrame(ctx) {
  dragonSpin += 0.024 * (1 + ctx.bass * 0.9);

  ctx.setCamera(
    Math.sin(ctx.t * 0.65) * 0.9,
    1.7 + ctx.bass * 0.35,
    -5.5,
    0,
    1.0,
    12,
    60
  );
  ctx.setFog(fogColor, 3.5, 22);
  ctx.setAmbientLight("#1E1528", 0.36 + ctx.rms * 0.25);
  ctx.setDirectionalLight(-0.5, 1.0, -0.4, goldNeon, 0.85 + ctx.treble * 0.45);

  ctx.drawTerrain3D(
    templeSpeed * (1 + ctx.bass * 0.4),
    1.1 + ctx.bass * 0.65,
    "#140E1E",
    crimsonNeon,
    "dungeon"
  );

  for (let i = 0; i < archCount; i++) {
    const z = ((i * 3.8 - (ctx.t * templeSpeed * 2.2) % (archCount * 3.8)) + archCount * 3.8) % (archCount * 3.8) + 1.5;
    const col = i % 2 === 0 ? goldNeon : crimsonNeon;
    ctx.drawBox3D(-2.7, 1.4, z, 0.5, 2.8 + ctx.bass * 0.7, 0.5, 0, 0, 0, "#1E162B", col, false);
    ctx.drawBox3D( 2.7, 1.4, z, 0.5, 2.8 + ctx.bass * 0.7, 0.5, 0, 0, 0, "#1E162B", col, false);
    ctx.drawBox3D( 0.0, 2.9 + ctx.bass * 0.35, z, 6.0, 0.38, 0.5, 0, 0, 0, "#281C38", goldNeon, false);
  }

  // Relique Dragon en lévitation au fond du sanctuaire
  ctx.drawBox3D(0, 1.85 + Math.sin(ctx.t * 2.5) * 0.25, 8.2, 1.25, 1.25, 1.25, dragonSpin, dragonSpin * 1.3, 0, "#24162E", goldNeon, false);

  // Guerrier Low-Poly en course
  ctx.drawCharacter3D(0, 0, 3.6, ctx.t * templeSpeed * 2.4, "katana", "#E4E6F0", crimsonNeon);
  ctx.drawParticles3D(42, 12, templeSpeed * 1.3, goldNeon, 2.2);

  if (ctx.lyricWord) {
    ctx.text(ctx.lyricWord, 12, ctx.height - 16, "#FFFFFF", 12);
  }
  ctx.scanlines(0.18);
}`,
    presets: [
      {
        id: "preset-dragon-gold",
        name: "Sanctuaire Or & Sang",
        values: {
          templeSpeed: 3.6,
          archCount: 5,
          fogColor: "#0C0914",
          goldNeon: "#FFB800",
          crimsonNeon: "#FF1B24",
        },
      },
      {
        id: "preset-dragon-jade",
        name: "Dragon Jade Nocturne",
        values: {
          templeSpeed: 5.0,
          archCount: 6,
          fogColor: "#071412",
          goldNeon: "#00F5A0",
          crimsonNeon: "#00E5FF",
        },
      },
    ],
  },
  {
    id: "doc-katana-overdrive-3d",
    name: "03_katana_overdrive_3d.js",
    language: "js",
    updatedAt: "2026-11-18T00:00:00Z",
    activePresetId: "preset-katana-vortex",
    code: `// PS2 // Katana Overdrive — Couloir Infini & Anneaux 3D en Rotation
// @param float tunnelSpeed = 4.6 [1.0, 12.0]
// @color mainNeon = "#FF1B24"
// @color cyanNeon = "#00F0FF"
// @toggle wireframeGates = false

let gateSpin = 0;

function renderAnarchyFrame(ctx) {
  gateSpin += 0.03 * (1 + ctx.bass);

  ctx.setCamera(
    Math.sin(ctx.t * 1.1) * 0.55,
    1.55,
    -5.2,
    0,
    1.1,
    14,
    66
  );
  ctx.setFog("#080912", 3.0, 22);
  ctx.setAmbientLight("#16192B", 0.35);
  ctx.setDirectionalLight(0.3, 1.0, -0.5, cyanNeon, 0.9 + ctx.treble * 0.5);

  ctx.drawTerrain3D(
    tunnelSpeed * (1 + ctx.bass * 0.5),
    0.95 + ctx.bass * 0.5,
    "#0E1220",
    mainNeon,
    "corridor"
  );

  for (let i = 0; i < 6; i++) {
    const z = ((i * 3.2 - (ctx.t * tunnelSpeed * 2.5) % 19.2) + 19.2) % 19.2 + 1.8;
    const rot = gateSpin + i * 0.45;
    const col = i % 2 === 0 ? mainNeon : cyanNeon;
    ctx.drawBox3D(0, 1.5, z, 2.8 + ctx.bass * 0.8, 0.28, 0.28, 0, 0, rot, "#1A2034", col, wireframeGates);
    ctx.drawBox3D(0, 1.5, z, 0.28, 2.8 + ctx.bass * 0.8, 0.28, 0, 0, rot, "#1A2034", col, wireframeGates);
  }

  ctx.drawCharacter3D(
    Math.sin(ctx.t * 2.2) * 0.45,
    0,
    3.5,
    ctx.t * tunnelSpeed * 2.2,
    "katana",
    "#F4F6FA",
    mainNeon
  );
  ctx.drawParticles3D(50, 11, tunnelSpeed * 1.6, cyanNeon, 2.2);

  if (ctx.flux > 0.3) {
    ctx.glitchSlices(ctx.flux * 0.7);
  }
  ctx.scanlines(0.2);
}`,
    presets: [
      {
        id: "preset-katana-vortex",
        name: "Katana Overdrive",
        values: {
          tunnelSpeed: 4.6,
          mainNeon: "#FF1B24",
          cyanNeon: "#00F0FF",
          wireframeGates: false,
        },
      },
      {
        id: "preset-katana-wire",
        name: "Hyper Wireframe 3D",
        values: {
          tunnelSpeed: 6.8,
          mainNeon: "#D4FF33",
          cyanNeon: "#FF1B24",
          wireframeGates: true,
        },
      },
    ],
  },
  {
    id: "doc-ps2-nightmare-3d",
    name: "04_ps2_nightmare_3d.cpp",
    language: "cpp",
    updatedAt: "2026-11-18T00:00:00Z",
    activePresetId: "preset-nightmare-courtyard",
    code: `// PS2 // Nightmare Courtyard — Cour Brutaliste, 4 Piliers & Obélisque 3D (C++)
// @param float orbitSpeed = 0.65 [0.1, 3.0]
// @param float obeliskHeight = 2.6 [1.2, 4.5]
// @color fogColor = "#090C14"
// @color obeliskColor = "#FF1B24"
// @color gridNeon = "#00E5FF"
#include <cmath>

void renderAnarchyFrame(AnarchyCtx& ctx) {
  float camAngle = ctx.t * orbitSpeed;
  ctx.setCamera(
    sinf(camAngle) * 2.4f,
    2.1f + ctx.bass * 0.4f,
    -5.6f,
    0.0f,
    1.1f,
    5.5f,
    60.0f
  );
  ctx.setFog(fogColor, 3.5f, 22.0f);
  ctx.setAmbientLight("#1A2234", 0.38f + ctx.rms * 0.25f);
  ctx.setDirectionalLight(-0.4f, 1.0f, -0.5f, "#FFFFFF", 0.9f + ctx.treble * 0.4f);

  ctx.drawTerrain3D(2.2f, 0.7f + ctx.bass * 0.5f, "#101624", gridNeon, "waves");

  // 4 Piliers de la cour brutaliste PS2
  for (int i = 0; i < 4; i++) {
    float a = i * 1.57079f + ctx.t * 0.25f;
    float px = cosf(a) * 3.1f;
    float pz = 5.5f + sinf(a) * 2.4f;
    ctx.drawBox3D(px, 1.4f, pz, 0.65f, 2.8f + ctx.bass * 0.8f, 0.65f, 0.0f, a, 0.0f, "#1C2436", gridNeon, false);
  }

  // Obélisque central en lévitation
  ctx.drawBox3D(
    0.0f,
    1.6f + sinf(ctx.t * 2.2f) * 0.3f,
    5.5f,
    1.1f,
    obeliskHeight,
    1.1f,
    ctx.t * 0.7f,
    ctx.t * 1.1f,
    0.3f,
    "#2A1420",
    obeliskColor,
    false
  );

  ctx.drawCharacter3D(0.0f, 0.0f, 3.4f, ctx.t * 5.0f, "runner", "#D8DEE9", obeliskColor);
  ctx.drawParticles3D(38, 11.0f, 1.8f, gridNeon, 2.0f);
  ctx.scanlines(0.18f);
}`,
    presets: [
      {
        id: "preset-nightmare-courtyard",
        name: "Cour Brutaliste PS2",
        values: {
          orbitSpeed: 0.65,
          obeliskHeight: 2.6,
          fogColor: "#090C14",
          obeliskColor: "#FF1B24",
          gridNeon: "#00E5FF",
        },
      },
      {
        id: "preset-nightmare-acid",
        name: "Obélisque Acide",
        values: {
          orbitSpeed: 1.35,
          obeliskHeight: 3.4,
          fogColor: "#08120C",
          obeliskColor: "#D4FF33",
          gridNeon: "#00F5A0",
        },
      },
    ],
  },
  {
    id: "doc-digital-void-3d",
    name: "05_digital_void_3d.cpp",
    language: "cpp",
    updatedAt: "2026-11-18T00:00:00Z",
    activePresetId: "preset-void-monoliths",
    code: `// PS2 // Digital Void — Mégapole Serveurs & Monolithes 3D Audio-Réactifs (C++)
// @param int pairs = 5 [2, 8]
// @param float speed = 3.8 [0.5, 10.0]
// @color towerBase = "#161C2E"
// @color neonAccent = "#00F0FF"
// @toggle wireframeTowers = false
#include <cmath>

void renderAnarchyFrame(AnarchyCtx& ctx) {
  ctx.setCamera(
    sinf(ctx.t * 0.55f) * 0.8f,
    1.9f,
    -5.8f,
    0.0f,
    1.1f,
    12.0f,
    64.0f
  );
  ctx.setFog("#080B14", 3.5f, 24.0f);
  ctx.setAmbientLight("#1A2238", 0.35f);
  ctx.setDirectionalLight(0.3f, 1.0f, -0.6f, neonAccent, 0.9f);

  ctx.drawTerrain3D(speed, 1.1f + ctx.bass * 0.6f, "#0E1322", neonAccent, "canyon");

  for (int i = 0; i < pairs; i++) {
    float z = fmodf(i * 3.6f - ctx.t * speed * 1.8f + 24.0f, 18.0f) + 1.5f;
    float h = 1.6f + (i % 3) * 0.7f + ctx.bass * 1.8f;
    ctx.drawBox3D(-2.6f, h * 0.5f, z, 0.75f, h, 0.75f, 0.0f, 0.0f, 0.0f, towerBase, neonAccent, wireframeTowers);
    ctx.drawBox3D( 2.6f, h * 0.5f, z, 0.75f, h, 0.75f, 0.0f, 0.0f, 0.0f, towerBase, "#FF1B24", wireframeTowers);
  }

  ctx.drawCharacter3D(0.0f, 0.0f, 3.6f, ctx.t * speed * 2.0f, "cyborg", "#E2E8F0", "#FF1B24");
  ctx.drawParticles3D(44, 12.0f, speed * 1.4f, neonAccent, 2.2f);

  if (ctx.lyricWord.length > 0) {
    ctx.text(ctx.lyricWord, 12, ctx.height - 16, "#FFFFFF", 12);
  }
  ctx.scanlines(0.18f);
}`,
    presets: [
      {
        id: "preset-void-monoliths",
        name: "Monolithes Cyan",
        values: {
          pairs: 5,
          speed: 3.8,
          towerBase: "#161C2E",
          neonAccent: "#00F0FF",
          wireframeTowers: false,
        },
      },
      {
        id: "preset-void-matrix",
        name: "Wireframe Matrix 3D",
        values: {
          pairs: 6,
          speed: 5.5,
          towerBase: "#121A16",
          neonAccent: "#D4FF33",
          wireframeTowers: true,
        },
      },
    ],
  },
];

export const DEFAULT_CPP_SCENES: CppSceneRule[] = [
  {
    id: "scene-intro-dojo-3d",
    label: "INTRO // Dojo Néon 3D",
    documentId: "doc-dojo-neon-3d",
    presetId: "preset-dojo-cyan",
    routingMode: "section",
    sectionTag: "INTRO",
    baseSceneId: "industrial-city",
    transition: "fade",
    transitionDuration: 0.45,
  },
  {
    id: "scene-main-dragon-3d",
    label: "MAIN // Enter the Dragon 3D",
    documentId: "doc-enter-dragon-3d",
    presetId: "preset-dragon-gold",
    routingMode: "section",
    sectionTag: "MAIN",
    baseSceneId: "ps1-nightmare",
    transition: "cut",
    transitionDuration: 0.25,
  },
  {
    id: "scene-drop-katana-3d",
    label: "DROP // Katana Overdrive 3D",
    documentId: "doc-katana-overdrive-3d",
    presetId: "preset-katana-vortex",
    routingMode: "section",
    sectionTag: "DROP",
    baseSceneId: "techno-therapy",
    transition: "glitch",
    transitionDuration: 0.4,
  },
  {
    id: "scene-refrain-nightmare-3d",
    label: "REFRAIN // PS2 Nightmare 3D",
    documentId: "doc-ps2-nightmare-3d",
    presetId: "preset-nightmare-courtyard",
    routingMode: "section",
    sectionTag: "REFRAIN",
    baseSceneId: "rave-dungeon",
    transition: "fade",
    transitionDuration: 0.35,
  },
  {
    id: "scene-outro-void-3d",
    label: "OUTRO // Digital Void 3D",
    documentId: "doc-digital-void-3d",
    presetId: "preset-void-monoliths",
    routingMode: "section",
    sectionTag: "OUTRO",
    baseSceneId: "digital-void",
    transition: "fade",
    transitionDuration: 0.4,
  },
];

export function createDefaultCppWorkspace(): CppWorkspaceState {
  return {
    version: 1,
    enabled: true,
    activeDocumentId: DEFAULT_CPP_DOCUMENTS[0].id,
    manualSceneId: null,
    documents: DEFAULT_CPP_DOCUMENTS.map((d) => ({
      ...d,
      language: d.language ?? "js",
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

function normalizeDocLanguage(doc: CppDocument): CppDocument {
  if (doc.language === "js" || doc.language === "cpp") {
    return doc;
  }
  const inferred: ScriptLanguage = doc.name.toLowerCase().endsWith(".js")
    ? "js"
    : detectScriptLanguage(doc.code);
  return { ...doc, language: inferred };
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
        const docs = parsed.documents.map(normalizeDocLanguage);
        // Ajouter le document JS d'exemple si le workspace v1 a été créé avant le mode JS
        if (!docs.some((d) => d.language === "js")) {
          const defaultJs = DEFAULT_CPP_DOCUMENTS.find((d) => d.language === "js");
          if (defaultJs) {
            docs.push({
              ...defaultJs,
              presets: defaultJs.presets.map((p) => ({
                ...p,
                values: { ...p.values },
              })),
            });
          }
        }
        return {
          version: 1,
          enabled:
            typeof parsed.enabled === "boolean"
              ? parsed.enabled
              : window.localStorage.getItem(CPP_SHADER_ENABLED_KEY) === "true",
          activeDocumentId:
            parsed.activeDocumentId &&
            docs.some((d) => d.id === parsed.activeDocumentId)
              ? parsed.activeDocumentId
              : docs[0].id,
          manualSceneId: parsed.manualSceneId ?? null,
          documents: docs,
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
      const detected = detectScriptLanguage(legacyCode);
      base.documents[0] = {
        ...base.documents[0],
        language: detected,
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

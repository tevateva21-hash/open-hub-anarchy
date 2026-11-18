import type {
  ExtraGeometry3DKind,
  PaletteId,
  Scene3DConfig,
  SceneId,
} from "@/lib/visual-engine/contracts";
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
  /** Configuration 3D profonde éditable en temps réel (géométries, caméra, lumière, brouillard, audio-réactivité). */
  config3d: Scene3DConfig;
  /** Script JS 3D optionnel exécuté à 60 FPS dans le moteur 3D principal (scene3d, audio, t). */
  script3d?: string;
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

const EXTRA_GEOMETRY_KINDS: readonly ExtraGeometry3DKind[] = [
  "none",
  "katana-blades",
  "floating-monoliths",
  "octo-rings",
  "cyber-pyramids",
];

export const DEFAULT_SCRIPT_3D_TEMPLATE = `// Script 3D temps réel exécuté à 60 FPS dans le moteur 3D principal
// Variables : scene3d (API 3D), audio ({ bass, mid, treble, rms, flux }), t (secondes)
function customizeScene3D(scene3d, audio, t) {
  const pulse = 1 + audio.bass * 0.65;
  // Arche / Piliers 3D latéraux synchronisés sur le kick
  scene3d.addBox3D(-3.4, -0.4, 6.2, 0.55, 2.2 * pulse, 0.55, 0.72, audio.flux > 0.3, true, t * 0.4);
  scene3d.addBox3D(3.4, -0.4, 6.2, 0.55, 2.2 * pulse, 0.55, 0.72, audio.flux > 0.3, true, -t * 0.4);
  // Pyramide 3D inversée en lévitation
  scene3d.addPyramid3D(0, 1.1 + Math.sin(t * 2) * 0.35, 5.5, 0.85 * pulse, 1.5, 0.88, true, true, t * 1.1);
}`;

export function createDefaultScene3DConfig(
  sceneId: SceneId = "rave-dungeon",
  overrides?: Partial<{
    geometries: Partial<Scene3DConfig["geometries"]>;
    environment: Partial<Scene3DConfig["environment"]>;
    camera: Partial<Scene3DConfig["camera"]>;
    lighting: Partial<Scene3DConfig["lighting"]>;
    colors: Scene3DConfig["colors"];
    audioReactive: Partial<Scene3DConfig["audioReactive"]>;
  }>
): Scene3DConfig {
  const baseByScene: Record<SceneId, Scene3DConfig> = {
    "industrial-city": {
      geometries: {
        monolithScale: 1.1,
        coreScale: 1.0,
        extraObjects: "katana-blades",
        extraCount: 4,
        wireframeRim: true,
        checkerTexture: true,
      },
      environment: {
        horizonOffset: 0,
        tunnelSpeed: 1.2,
        floorDepth: 1.15,
      },
      camera: {
        distance: 8.5,
        pitchDegrees: 6,
        yawDegrees: 0,
        fovDegrees: 72,
        orbitSpeed: 0.35,
      },
      lighting: {
        fogDensity: 0.38,
        ditherStrength: 0.45,
        ambientBoost: 0.05,
      },
      audioReactive: {
        bassPulse: 1.2,
        midMorph: 1.0,
        trebleStrobe: 1.15,
        fluxJolt: 1.1,
      },
    },
    "rave-dungeon": {
      geometries: {
        monolithScale: 1.25,
        coreScale: 1.15,
        extraObjects: "floating-monoliths",
        extraCount: 4,
        wireframeRim: true,
        checkerTexture: true,
      },
      environment: {
        horizonOffset: 0,
        tunnelSpeed: 1.8,
        floorDepth: 1.3,
      },
      camera: {
        distance: 6.8,
        pitchDegrees: 5,
        yawDegrees: 0,
        fovDegrees: 75,
        orbitSpeed: 0.45,
      },
      lighting: {
        fogDensity: 0.42,
        ditherStrength: 0.5,
        ambientBoost: 0.08,
      },
      audioReactive: {
        bassPulse: 1.35,
        midMorph: 1.15,
        trebleStrobe: 1.2,
        fluxJolt: 1.25,
      },
    },
    "techno-therapy": {
      geometries: {
        monolithScale: 1.2,
        coreScale: 1.3,
        extraObjects: "octo-rings",
        extraCount: 4,
        wireframeRim: true,
        checkerTexture: true,
      },
      environment: {
        horizonOffset: 0,
        tunnelSpeed: 2.1,
        floorDepth: 1.2,
      },
      camera: {
        distance: 4.8,
        pitchDegrees: 3,
        yawDegrees: 0,
        fovDegrees: 78,
        orbitSpeed: 0.65,
      },
      lighting: {
        fogDensity: 0.35,
        ditherStrength: 0.48,
        ambientBoost: 0.1,
      },
      audioReactive: {
        bassPulse: 1.45,
        midMorph: 1.3,
        trebleStrobe: 1.35,
        fluxJolt: 1.3,
      },
    },
    "ps1-nightmare": {
      geometries: {
        monolithScale: 1.3,
        coreScale: 1.25,
        extraObjects: "cyber-pyramids",
        extraCount: 4,
        wireframeRim: true,
        checkerTexture: true,
      },
      environment: {
        horizonOffset: -2,
        tunnelSpeed: 1.4,
        floorDepth: 1.35,
      },
      camera: {
        distance: 10.5,
        pitchDegrees: 14,
        yawDegrees: 18,
        fovDegrees: 74,
        orbitSpeed: 0.45,
      },
      lighting: {
        fogDensity: 0.48,
        ditherStrength: 0.55,
        ambientBoost: 0.04,
      },
      audioReactive: {
        bassPulse: 1.3,
        midMorph: 1.15,
        trebleStrobe: 1.1,
        fluxJolt: 1.2,
      },
    },
    "digital-void": {
      geometries: {
        monolithScale: 1.35,
        coreScale: 1.4,
        extraObjects: "floating-monoliths",
        extraCount: 6,
        wireframeRim: true,
        checkerTexture: true,
      },
      environment: {
        horizonOffset: 0,
        tunnelSpeed: 2.0,
        floorDepth: 1.4,
      },
      camera: {
        distance: 7.4,
        pitchDegrees: 8,
        yawDegrees: 0,
        fovDegrees: 80,
        orbitSpeed: 0.55,
      },
      lighting: {
        fogDensity: 0.45,
        ditherStrength: 0.52,
        ambientBoost: 0.12,
      },
      audioReactive: {
        bassPulse: 1.5,
        midMorph: 1.25,
        trebleStrobe: 1.4,
        fluxJolt: 1.35,
      },
    },
  };

  const base = baseByScene[sceneId] ?? baseByScene["rave-dungeon"];
  return {
    geometries: { ...base.geometries, ...overrides?.geometries },
    environment: { ...base.environment, ...overrides?.environment },
    camera: { ...base.camera, ...overrides?.camera },
    lighting: { ...base.lighting, ...overrides?.lighting },
    colors: overrides?.colors ? { ...overrides.colors } : undefined,
    audioReactive: { ...base.audioReactive, ...overrides?.audioReactive },
  };
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
        config3d: createDefaultScene3DConfig("industrial-city", {
          geometries: {
            monolithScale: 1.15,
            coreScale: 1.1,
            extraObjects: "katana-blades",
            extraCount: 4,
            wireframeRim: true,
            checkerTexture: true,
          },
          camera: {
            distance: 8.2,
            pitchDegrees: 6,
            yawDegrees: 0,
            fovDegrees: 72,
            orbitSpeed: 0.35,
          },
        }),
        script3d: `function customizeScene3D(scene3d, audio, t) {
  // Torii / Piliers 3D Dojo Néon réactifs au kick
  const h = 2.0 + audio.bass * 1.1;
  scene3d.addBox3D(-3.2, -0.5, 6.4, 0.5, h, 0.5, 0.68, audio.flux > 0.28, true, t * 0.25);
  scene3d.addBox3D(3.2, -0.5, 6.4, 0.5, h, 0.5, 0.68, audio.flux > 0.28, true, -t * 0.25);
  scene3d.addBox3D(0, 1.2 + audio.bass * 0.3, 6.4, 7.2, 0.32, 0.45, 0.84, true, false, 0);
}`,
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
        config3d: createDefaultScene3DConfig("rave-dungeon", {
          geometries: {
            monolithScale: 1.3,
            coreScale: 1.25,
            extraObjects: "floating-monoliths",
            extraCount: 4,
            wireframeRim: true,
            checkerTexture: true,
          },
          environment: {
            horizonOffset: 0,
            tunnelSpeed: 1.9,
            floorDepth: 1.35,
          },
        }),
        script3d: `function customizeScene3D(scene3d, audio, t) {
  // Totem Dragon 3D central dans la voûte souterraine
  const spin = t * 1.2;
  const r = 0.75 + audio.bass * 0.45;
  scene3d.addPyramid3D(0, 0.2 + Math.sin(t * 2.2) * 0.3, 5.8, r, 1.8, 0.86, true, false, spin);
  scene3d.addPyramid3D(0, -0.3 - Math.sin(t * 2.2) * 0.2, 5.8, r * 0.85, 1.4, 0.64, true, true, -spin);
}`,
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
        config3d: createDefaultScene3DConfig("techno-therapy", {
          geometries: {
            monolithScale: 1.35,
            coreScale: 1.4,
            extraObjects: "katana-blades",
            extraCount: 6,
            wireframeRim: true,
            checkerTexture: true,
          },
          environment: {
            horizonOffset: 0,
            tunnelSpeed: 2.35,
            floorDepth: 1.3,
          },
        }),
        script3d: `function customizeScene3D(scene3d, audio, t) {
  // Anneau Katana Overdrive haute vitesse
  scene3d.addRing3D(4.2, 1.9 + audio.bass * 0.5, 0.5, 8, -t * 1.8, 0.9, audio.treble > 0.3);
}`,
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
        config3d: createDefaultScene3DConfig("ps1-nightmare", {
          geometries: {
            monolithScale: 1.35,
            coreScale: 1.3,
            extraObjects: "cyber-pyramids",
            extraCount: 4,
            wireframeRim: true,
            checkerTexture: true,
          },
        }),
        script3d: `function customizeScene3D(scene3d, audio, t) {
  // Satellites low-poly autour de l'obélisque brutaliste
  for (let i = 0; i < 4; i++) {
    const a = t * 0.9 + (i * Math.PI) / 2;
    scene3d.addBox3D(Math.cos(a) * 3.1, 0.8 + Math.sin(t * 2 + i) * 0.4, Math.sin(a) * 3.1, 0.55, 0.9 + audio.bass * 0.6, 0.55, 0.78, true, true, a);
  }
}`,
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
        config3d: createDefaultScene3DConfig("digital-void", {
          geometries: {
            monolithScale: 1.4,
            coreScale: 1.45,
            extraObjects: "octo-rings",
            extraCount: 5,
            wireframeRim: true,
            checkerTexture: true,
          },
        }),
        script3d: `function customizeScene3D(scene3d, audio, t) {
  // Vortex 3D au coeur du gouffre de données Digital Void
  scene3d.addRing3D(5.2, 1.65 + audio.bass * 0.55, 0.55, 8, t * 1.4, 0.85, true);
  scene3d.addPyramid3D(0, 0, 5.4, 0.75 + audio.bass * 0.4, 1.6, 0.92, true, true, -t * 1.5);
}`,
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
        config3d: createDefaultScene3DConfig("digital-void", {
          geometries: { extraObjects: "octo-rings", extraCount: 5 },
          environment: { tunnelSpeed: 2.2 },
        }),
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
        config3d: createDefaultScene3DConfig("rave-dungeon", {
          geometries: { extraObjects: "floating-monoliths", extraCount: 4 },
          environment: { tunnelSpeed: 2.0 },
        }),
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
        config3d: createDefaultScene3DConfig("techno-therapy", {
          geometries: { extraObjects: "octo-rings", extraCount: 6 },
          environment: { tunnelSpeed: 2.4 },
        }),
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
        config3d: createDefaultScene3DConfig("industrial-city", {
          geometries: { extraObjects: "cyber-pyramids", extraCount: 4 },
        }),
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
        config3d: createDefaultScene3DConfig("ps1-nightmare", {
          geometries: { extraObjects: "katana-blades", extraCount: 6 },
        }),
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

function clampNum(val: unknown, min: number, max: number, fallback: number): number {
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

export function sanitizeScene3DConfig(
  sceneId: SceneId,
  raw?: unknown
): Scene3DConfig {
  const base = createDefaultScene3DConfig(sceneId);
  if (!raw || typeof raw !== "object") return base;
  const obj = raw as Record<string, unknown>;
  const geom = (obj.geometries ?? {}) as Record<string, unknown>;
  const env = (obj.environment ?? {}) as Record<string, unknown>;
  const cam = (obj.camera ?? {}) as Record<string, unknown>;
  const light = (obj.lighting ?? {}) as Record<string, unknown>;
  const audio = (obj.audioReactive ?? {}) as Record<string, unknown>;
  const colors =
    obj.colors && typeof obj.colors === "object"
      ? (obj.colors as Record<string, unknown>)
      : undefined;

  const rawExtra = String(geom.extraObjects ?? base.geometries.extraObjects);
  const extraObjects: ExtraGeometry3DKind = EXTRA_GEOMETRY_KINDS.includes(
    rawExtra as ExtraGeometry3DKind
  )
    ? (rawExtra as ExtraGeometry3DKind)
    : base.geometries.extraObjects;

  const sanitizeHex = (v: unknown): string | undefined =>
    typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v.trim())
      ? v.trim()
      : undefined;

  return {
    geometries: {
      monolithScale: clampNum(
        geom.monolithScale,
        0.3,
        2.5,
        base.geometries.monolithScale
      ),
      coreScale: clampNum(geom.coreScale, 0.3, 2.5, base.geometries.coreScale),
      extraObjects,
      extraCount: Math.round(
        clampNum(geom.extraCount, 0, 12, base.geometries.extraCount)
      ),
      wireframeRim:
        typeof geom.wireframeRim === "boolean"
          ? geom.wireframeRim
          : base.geometries.wireframeRim,
      checkerTexture:
        typeof geom.checkerTexture === "boolean"
          ? geom.checkerTexture
          : base.geometries.checkerTexture,
    },
    environment: {
      horizonOffset: Math.round(
        clampNum(env.horizonOffset, -30, 30, base.environment.horizonOffset)
      ),
      tunnelSpeed: clampNum(
        env.tunnelSpeed,
        0.2,
        3.5,
        base.environment.tunnelSpeed
      ),
      floorDepth: clampNum(
        env.floorDepth,
        0.5,
        2.5,
        base.environment.floorDepth
      ),
    },
    camera: {
      distance: clampNum(cam.distance, 2.8, 16, base.camera.distance),
      pitchDegrees: clampNum(
        cam.pitchDegrees,
        -25,
        35,
        base.camera.pitchDegrees
      ),
      yawDegrees: clampNum(cam.yawDegrees, -45, 45, base.camera.yawDegrees),
      fovDegrees: clampNum(cam.fovDegrees, 40, 110, base.camera.fovDegrees),
      orbitSpeed: clampNum(cam.orbitSpeed, 0, 2.5, base.camera.orbitSpeed),
    },
    lighting: {
      fogDensity: clampNum(
        light.fogDensity,
        0,
        1,
        base.lighting.fogDensity
      ),
      ditherStrength: clampNum(
        light.ditherStrength,
        0,
        1,
        base.lighting.ditherStrength
      ),
      ambientBoost: clampNum(
        light.ambientBoost,
        -0.3,
        0.5,
        base.lighting.ambientBoost
      ),
    },
    colors: colors
      ? {
          sky: sanitizeHex(colors.sky),
          haze: sanitizeHex(colors.haze),
          structure: sanitizeHex(colors.structure),
          face: sanitizeHex(colors.face),
          light: sanitizeHex(colors.light),
          glow: sanitizeHex(colors.glow),
        }
      : undefined,
    audioReactive: {
      bassPulse: clampNum(
        audio.bassPulse,
        0,
        2.5,
        base.audioReactive.bassPulse
      ),
      midMorph: clampNum(audio.midMorph, 0, 2.5, base.audioReactive.midMorph),
      trebleStrobe: clampNum(
        audio.trebleStrobe,
        0,
        2.5,
        base.audioReactive.trebleStrobe
      ),
      fluxJolt: clampNum(audio.fluxJolt, 0, 2.5, base.audioReactive.fluxJolt),
    },
  };
}

/**
 * Génère un nouveau Pack de Scènes 3D procédural unique (chaque génération
 * possède sa propre seed, ses palettes, intensités, géométries 3D, caméra et effets).
 */
export function generateRandomScenePack(
  author = "Anonyme",
  customName?: string,
  bpm = 140,
  beatsPerScene = 16,
  sceneCount = 5
): ScenePack {
  const seed = Math.floor(Math.random() * 900000) + 100000;
  const rng = mulberry32(seed);

  const shuffledScenes = [...SCENE_IDS].sort(() => rng() - 0.5);
  const shuffledPalettes = [...PALETTE_IDS].sort(() => rng() - 0.5);
  const extraPool: ExtraGeometry3DKind[] = [
    "katana-blades",
    "floating-monoliths",
    "octo-rings",
    "cyber-pyramids",
  ];

  const count = Math.max(1, Math.min(16, Math.round(sceneCount)));
  const scenes: ScenePackSlot[] = Array.from({ length: count }, (_, idx) => {
    const sId = shuffledScenes[idx % shuffledScenes.length];
    const pId = shuffledPalettes[idx % shuffledPalettes.length];
    const extraKind = extraPool[Math.floor(rng() * extraPool.length)];
    return {
      label: `0${idx + 1}. ${sId
        .split("-")
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(" ")}`,
      sceneId: sId,
      paletteId: pId,
      intensity: Math.round(62 + rng() * 38),
      strobe: Math.round(10 + rng() * 65),
      kaleidoscope: Math.round(rng() * 85),
      feedbackTrails: Math.round(20 + rng() * 70),
      acidHueShift: Math.round(rng() * 90),
      bloom: Math.round(25 + rng() * 65),
      glitch: Math.round(rng() * 50),
      seed: Math.floor(rng() * 99999) + 1,
      config3d: createDefaultScene3DConfig(sId, {
        geometries: {
          monolithScale: Number((0.8 + rng() * 0.9).toFixed(2)),
          coreScale: Number((0.85 + rng() * 0.9).toFixed(2)),
          extraObjects: extraKind,
          extraCount: 3 + Math.floor(rng() * 4),
          wireframeRim: rng() > 0.2,
          checkerTexture: true,
        },
        environment: {
          horizonOffset: Math.round((rng() - 0.5) * 12),
          tunnelSpeed: Number((0.9 + rng() * 1.8).toFixed(2)),
          floorDepth: Number((0.9 + rng() * 0.7).toFixed(2)),
        },
        camera: {
          distance: Number((4.8 + rng() * 6.2).toFixed(1)),
          pitchDegrees: Math.round(-6 + rng() * 22),
          yawDegrees: Math.round((rng() - 0.5) * 28),
          fovDegrees: Math.round(64 + rng() * 24),
          orbitSpeed: Number((0.2 + rng() * 0.9).toFixed(2)),
        },
        lighting: {
          fogDensity: Number((0.25 + rng() * 0.45).toFixed(2)),
          ditherStrength: Number((0.35 + rng() * 0.4).toFixed(2)),
          ambientBoost: Number(((rng() - 0.3) * 0.25).toFixed(2)),
        },
        audioReactive: {
          bassPulse: Number((0.9 + rng() * 1.1).toFixed(2)),
          midMorph: Number((0.8 + rng() * 1.0).toFixed(2)),
          trebleStrobe: Number((0.8 + rng() * 1.1).toFixed(2)),
          fluxJolt: Number((0.8 + rng() * 1.1).toFixed(2)),
        },
      }),
      script3d: DEFAULT_SCRIPT_3D_TEMPLATE,
    };
  });

  const cleanName = customName?.trim();
  return {
    id: `pack-gen-${seed}`,
    name: cleanName || `Pack 3D #${seed.toString().slice(-4)} (${count} Scènes)`,
    author: author.trim() || "Anonyme",
    bpm,
    beatsPerScene,
    seed,
    scenes,
    createdAt: new Date().toISOString(),
  };
}

export const AI_SCENE_PACK_PROMPT = `Tu es un directeur artistique 3D temps réel pour Open Hub // Anarchy Visual Studio.
Génère un Pack de Scènes 3D profondes au format JSON (nombre libre de scènes : 1, 3, 5, 8+).

Mondes 3D de base disponibles ("sceneId") :
- "industrial-city" (éclipse industrielle, usines, ponts & monolithes)
- "rave-dungeon" (voûte souterraine 3D, arches béton, portail central & sol inondé)
- "techno-therapy" (vortex octogonal 3D rotatif, noyau diamant, lasers & ECG)
- "ps1-nightmare" (cour brutaliste low-poly 32-bit, obélisque inversé en lévitation, dallage en perspective)
- "digital-void" (gouffre de données 3D, tours serveurs, noyau lumineux & passerelles)

Palettes disponibles ("paletteId") :
- "anarchy-anaglyph" | "techno-therapy" | "blood-red" | "furnace-amber" | "toxic-oxide" | "cold-concrete" | "acid-violet"

Objets 3D additionnels ("config3d.geometries.extraObjects") :
- "none" | "katana-blades" | "floating-monoliths" | "octo-rings" | "cyber-pyramids"

Script 3D optionnel ("script3d") :
Fonction JS "function customizeScene3D(scene3d, audio, t)" pouvant appeler :
- scene3d.addBox3D(x, y, z, w, h, d, tone, wireRim, checker, rotY)
- scene3d.addPyramid3D(x, y, z, radius, height, tone, wireRim, inverted, rotY)
- scene3d.addRing3D(z, radius, depth, segments, spinRad, tone, wireRim)

Réponds uniquement avec un objet JSON valide suivant cette structure :
{
  "name": "Nom du Pack 3D",
  "author": "Anarchy Studio",
  "bpm": 140,
  "beatsPerScene": 16,
  "scenes": [
    {
      "label": "01. Dojo Néon",
      "sceneId": "rave-dungeon",
      "paletteId": "anarchy-anaglyph",
      "intensity": 88,
      "strobe": 35,
      "kaleidoscope": 30,
      "feedbackTrails": 48,
      "acidHueShift": 18,
      "config3d": {
        "geometries": { "monolithScale": 1.3, "coreScale": 1.25, "extraObjects": "katana-blades", "extraCount": 4, "wireframeRim": true, "checkerTexture": true },
        "environment": { "horizonOffset": 0, "tunnelSpeed": 1.8, "floorDepth": 1.3 },
        "camera": { "distance": 6.8, "pitchDegrees": 5, "yawDegrees": 0, "fovDegrees": 75, "orbitSpeed": 0.45 },
        "lighting": { "fogDensity": 0.42, "ditherStrength": 0.5, "ambientBoost": 0.08 },
        "audioReactive": { "bassPulse": 1.35, "midMorph": 1.15, "trebleStrobe": 1.2, "fluxJolt": 1.25 }
      },
      "script3d": "function customizeScene3D(scene3d, audio, t) { scene3d.addPyramid3D(0, 0.4, 5.6, 0.85 + audio.bass * 0.4, 1.7, 0.88, true, false, t); }"
    }
  ]
}`;

function sanitizeSceneId(val: string): SceneId {
  return SCENE_IDS.includes(val as SceneId)
    ? (val as SceneId)
    : "rave-dungeon";
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

export function sanitizeScenePackSlot(
  item: Record<string, unknown>,
  idx = 0
): ScenePackSlot {
  const sceneId = sanitizeSceneId(String(item.sceneId || "rave-dungeon"));
  const paletteId = sanitizePaletteId(
    String(item.paletteId || "anarchy-anaglyph")
  );
  return {
    label: item.label ? String(item.label) : `0${idx + 1}. Scène 3D`,
    sceneId,
    paletteId,
    intensity: clamp100(item.intensity, 85),
    strobe: clamp100(item.strobe, 25),
    kaleidoscope: clamp100(item.kaleidoscope, 30),
    feedbackTrails: clamp100(item.feedbackTrails, 45),
    acidHueShift: clamp100(item.acidHueShift, 20),
    bloom: clamp100(item.bloom, 50),
    glitch: clamp100(item.glitch, 20),
    seed: Number(item.seed) || (idx + 1) * 137,
    config3d: sanitizeScene3DConfig(sceneId, item.config3d),
    script3d:
      typeof item.script3d === "string" && item.script3d.trim().length > 0
        ? item.script3d
        : undefined,
  };
}

/**
 * Parse un Pack de Scènes 3D (1 à 24 scènes) depuis un bloc JSON (ou bloc markdown ```json).
 */
export function parseScenePackFromText(
  raw: string,
  author = "Communauté",
  customName?: string
): ScenePack | null {
  let trimmed = raw.trim();
  if (!trimmed) return null;

  const fenced = trimmed.match(/```(?:json|js|javascript)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    trimmed = fenced[1].trim();
  }

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      const rawScenes = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.scenes)
        ? parsed.scenes
        : parsed.sceneId || parsed.config3d
        ? [parsed]
        : null;

      if (Array.isArray(rawScenes) && rawScenes.length > 0) {
        const scenes: ScenePackSlot[] = rawScenes
          .slice(0, 24)
          .map((item, idx) =>
            sanitizeScenePackSlot(
              (item && typeof item === "object" ? item : {}) as Record<
                string,
                unknown
              >,
              idx
            )
          );
        const finalName =
          customName?.trim() ||
          (!Array.isArray(parsed) && typeof parsed.name === "string"
            ? parsed.name.trim()
            : "") ||
          `Pack 3D #${Date.now().toString().slice(-4)} (${scenes.length} Scènes)`;
        return {
          id: `pack-3d-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: finalName,
          author:
            (!Array.isArray(parsed) && typeof parsed.author === "string"
              ? parsed.author.trim()
              : "") || author,
          bpm: Number(!Array.isArray(parsed) && parsed.bpm) || 140,
          beatsPerScene:
            Number(!Array.isArray(parsed) && parsed.beatsPerScene) || 16,
          seed: Number(!Array.isArray(parsed) && parsed.seed) || Date.now() % 100000,
          scenes,
          createdAt: new Date().toISOString(),
        };
      }
    } catch {
      return null;
    }
  }

  return null;
}

export function exportScenePackAsJson(pack: ScenePack): string {
  return JSON.stringify(pack, null, 2);
}

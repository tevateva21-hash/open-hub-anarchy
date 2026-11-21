import type {
  Anarchy3DAnimation,
  Anarchy3DAnimationTarget,
  Anarchy3DAudioMapping,
  Anarchy3DBackdropLayer,
  Anarchy3DCamera,
  Anarchy3DCloner,
  Anarchy3DEnvironment,
  Anarchy3DLayer,
  Anarchy3DPack,
  Anarchy3DPostFx,
  Anarchy3DScene,
  Anarchy3DSidePropsLayer,
  Anarchy3DSubject,
  Anarchy3DTerrainLayer,
  Anarchy3DTrigger,
  Anarchy3DTriggerAction,
  AnarchyBassTarget,
  AnarchyCameraMode,
  AnarchyClonerMode,
  AnarchyFluxTarget,
  AnarchyMidTarget,
  AnarchyProceduralPart,
  AnarchyProceduralPrimitive,
  AnarchySidePropType,
  AnarchySubjectMeshType,
  AnarchyTerrainType,
  AnarchyTrebleTarget,
  PaletteId,
  SceneId,
} from "@/lib/visual-engine/contracts";
import { PALETTE_IDS, SCENE_IDS } from "@/lib/visual-engine/presets";
import { validateMathExpression } from "@/lib/visual-studio/math-expr";
import {
  AI_STYLE_PRESETS,
  BASS_TARGET_REGISTRY,
  CAMERA_MODE_REGISTRY,
  CLONER_MODE_REGISTRY,
  FLUX_TARGET_REGISTRY,
  JSON_SNIPPETS_3D,
  MID_TARGET_REGISTRY,
  PROCEDURAL_PRIMITIVE_REGISTRY,
  SIDE_PROPS_REGISTRY,
  SUBJECT_MESH_REGISTRY,
  TERRAIN_REGISTRY,
  TREBLE_TARGET_REGISTRY,
  TRIGGER_ACTION_REGISTRY,
  generateAiPackPromptFromRegistry,
  generateAiPackPromptV3,
  generateAiPackPromptV4,
} from "@/lib/visual-studio/registry";

export type {
  Anarchy3DPack,
  Anarchy3DScene,
  Anarchy3DEnvironment,
  Anarchy3DSubject,
  Anarchy3DCamera,
  Anarchy3DAudioMapping,
  Anarchy3DLayer,
  Anarchy3DBackdropLayer,
  Anarchy3DTerrainLayer,
  Anarchy3DSidePropsLayer,
  Anarchy3DPostFx,
  AnarchyProceduralPart,
  Anarchy3DCloner,
  Anarchy3DAnimation,
  Anarchy3DAnimationTarget,
  Anarchy3DTrigger,
  Anarchy3DTriggerAction,
};

export {
  AI_STYLE_PRESETS,
  JSON_SNIPPETS_3D,
  generateAiPackPromptV3,
  generateAiPackPromptV4,
};

export type ScenePackSlot = Anarchy3DScene;
export type ScenePack = Anarchy3DPack;

export const MAX_PRIMITIVES_PER_SCENE = 256;

export const ANARCHY_TERRAIN_TYPES = TERRAIN_REGISTRY;
export const ANARCHY_SIDE_PROP_TYPES = SIDE_PROPS_REGISTRY;
export const ANARCHY_SUBJECT_MESH_TYPES = SUBJECT_MESH_REGISTRY;
export const ANARCHY_PROCEDURAL_PRIMITIVES = PROCEDURAL_PRIMITIVE_REGISTRY;
export const ANARCHY_CAMERA_MODES = CAMERA_MODE_REGISTRY;
export const ANARCHY_CLONER_MODES = CLONER_MODE_REGISTRY;
export const ANARCHY_TRIGGER_ACTIONS = TRIGGER_ACTION_REGISTRY;
export const ANARCHY_BASS_TARGETS = BASS_TARGET_REGISTRY;
export const ANARCHY_MID_TARGETS = MID_TARGET_REGISTRY;
export const ANARCHY_TREBLE_TARGETS = TREBLE_TARGET_REGISTRY;
export const ANARCHY_FLUX_TARGETS = FLUX_TARGET_REGISTRY;

export const DEFAULT_POST_FX: Required<Anarchy3DPostFx> = {
  ps1VertexJitter: 0,
  crtScanlines: 0,
  chromaticAberration: 0,
  kaleidoscopeSegments: 0,
  bloomIntensity: 0.45,
};

const TERRAIN_SET = new Set<AnarchyTerrainType>(
  TERRAIN_REGISTRY.map((t) => t.value)
);
const SIDE_PROP_SET = new Set<AnarchySidePropType>(
  SIDE_PROPS_REGISTRY.map((p) => p.value)
);
const SUBJECT_SET = new Set<AnarchySubjectMeshType>(
  SUBJECT_MESH_REGISTRY.map((s) => s.value)
);
const PRIMITIVE_SET = new Set<AnarchyProceduralPrimitive>(
  PROCEDURAL_PRIMITIVE_REGISTRY.map((p) => p.value)
);
const CAMERA_MODE_SET = new Set<AnarchyCameraMode>(
  CAMERA_MODE_REGISTRY.map((c) => c.value)
);
const CLONER_MODE_SET = new Set<AnarchyClonerMode>(
  CLONER_MODE_REGISTRY.map((c) => c.value)
);
const TRIGGER_ACTION_SET = new Set<Anarchy3DTriggerAction>(
  TRIGGER_ACTION_REGISTRY.map((t) => t.value)
);
const ANIMATION_TARGET_SET = new Set<Anarchy3DAnimationTarget>([
  "pos.x",
  "pos.y",
  "pos.z",
  "rot.x",
  "rot.y",
  "rot.z",
  "scale",
  "scale.x",
  "scale.y",
  "scale.z",
  "emissiveIntensity",
  "fov",
]);
const BASS_TARGET_SET = new Set<AnarchyBassTarget>(
  BASS_TARGET_REGISTRY.map((b) => b.value)
);
const MID_TARGET_SET = new Set<AnarchyMidTarget>(
  MID_TARGET_REGISTRY.map((m) => m.value)
);
const TREBLE_TARGET_SET = new Set<AnarchyTrebleTarget>(
  TREBLE_TARGET_REGISTRY.map((t) => t.value)
);
const FLUX_TARGET_SET = new Set<AnarchyFluxTarget>(
  FLUX_TARGET_REGISTRY.map((f) => f.value)
);

/**
 * Associe automatiquement un `terrainType` et un `meshType` au monde 3D interne le plus pertinent
 * lorsque `sceneId` n'est pas explicitement fourni dans le JSON.
 */
export function inferSceneIdFromAnarchy3DScene(
  terrainType: AnarchyTerrainType,
  meshType: AnarchySubjectMeshType
): SceneId {
  if (terrainType === "dojo_pillars") return "rave-dungeon";
  if (terrainType === "tunnel" || terrainType === "mirror_floor") {
    return "techno-therapy";
  }
  if (terrainType === "neon_highway") return "industrial-city";
  if (terrainType === "lowpoly_mountains") {
    return meshType === "floating_monolith" ? "ps1-nightmare" : "industrial-city";
  }
  if (meshType === "floating_monolith" || meshType === "cyber_katana") {
    return "ps1-nightmare";
  }
  if (meshType === "abstract_polyhedron" || meshType === "procedural_group") {
    return "techno-therapy";
  }
  return "digital-void";
}

/**
 * Construit les calques v2 (`layers[]`) à partir d'une scène v1 ou partielle.
 */
export function buildDefaultLayersFromV1(
  environment: Anarchy3DEnvironment,
  subjects: Anarchy3DSubject[],
  overrides?: {
    backdrop?: Partial<Anarchy3DBackdropLayer>;
    sideProps?: Partial<Anarchy3DSidePropsLayer>;
  }
): Anarchy3DLayer[] {
  const backdrop: Anarchy3DBackdropLayer = {
    skyGradient: [environment.skyColor, environment.fogColor],
    horizonSun: overrides?.backdrop?.horizonSun ?? {
      enabled: false,
      colorTop: environment.terrainSecondaryColor,
      colorBottom: environment.terrainPrimaryColor,
      stripes: 6,
      size: 1.0,
    },
    starfield: overrides?.backdrop?.starfield ?? {
      enabled: true,
      density: 0.45,
      color: environment.terrainPrimaryColor,
    },
    ...(overrides?.backdrop?.skyGradient
      ? { skyGradient: overrides.backdrop.skyGradient }
      : {}),
  };

  const terrain: Anarchy3DTerrainLayer = {
    type: environment.terrainType,
    speed: environment.terrainSpeed,
    primaryColor: environment.terrainPrimaryColor,
    secondaryColor: environment.terrainSecondaryColor,
  };

  const sideProps: Anarchy3DSidePropsLayer = {
    type: overrides?.sideProps?.type ?? "none",
    density: overrides?.sideProps?.density ?? 0.6,
    primaryColor:
      overrides?.sideProps?.primaryColor ?? environment.terrainPrimaryColor,
    secondaryColor:
      overrides?.sideProps?.secondaryColor ?? environment.terrainSecondaryColor,
  };

  return [
    { kind: "backdrop", backdrop },
    { kind: "terrain", terrain },
    { kind: "sideProps", sideProps },
    { kind: "subjects", subjects },
  ];
}

export function createDefaultAnarchy3DScene(
  index = 0,
  overrides?: {
    id?: string;
    name?: string;
    version?: 1 | 2 | 3;
    environment?: Partial<Anarchy3DEnvironment>;
    subject?: Partial<Anarchy3DSubject>;
    subjects?: Anarchy3DSubject[];
    layers?: Anarchy3DLayer[];
    postFx?: Partial<Anarchy3DPostFx>;
    animations?: Anarchy3DAnimation[];
    backdrop?: Partial<Anarchy3DBackdropLayer>;
    sideProps?: Partial<Anarchy3DSidePropsLayer>;
    camera?: Partial<Anarchy3DCamera>;
    audioMapping?: Partial<Anarchy3DAudioMapping>;
    sceneId?: SceneId;
    paletteId?: PaletteId;
    seed?: number;
  }
): Anarchy3DScene {
  const environment: Anarchy3DEnvironment = {
    skyColor: "#060A12",
    fogColor: "#060A12",
    fogDensity: 0.045,
    terrainType: "infinite_grid",
    terrainSpeed: 12.0,
    terrainPrimaryColor: "#00F0FF",
    terrainSecondaryColor: "#FF0055",
    ...overrides?.environment,
  };
  const subject: Anarchy3DSubject = {
    meshType: "voxel_runner",
    primaryColor: "#00838F",
    accentColor: "#FF0055",
    wireframeOverlay: true,
    scale: 1.0,
    ...overrides?.subject,
  };
  const subjects =
    overrides?.subjects && overrides.subjects.length > 0
      ? overrides.subjects
      : [subject];
  const camera: Anarchy3DCamera = {
    mode: "chase_low",
    fov: 75,
    shakeIntensity: 0.4,
    ...overrides?.camera,
  };
  const audioMapping: Anarchy3DAudioMapping = {
    bassTarget: "camera_zoom_and_jump",
    midTarget: "terrain_wave_height",
    trebleTarget: "particles_burst",
    fluxTarget: "glitch_and_emissive",
    ...overrides?.audioMapping,
  };
  const postFx: Anarchy3DPostFx = {
    ...DEFAULT_POST_FX,
    ...overrides?.postFx,
  };
  const layers =
    overrides?.layers ??
    buildDefaultLayersFromV1(environment, subjects, {
      backdrop: overrides?.backdrop,
      sideProps: overrides?.sideProps,
    });

  const sceneId =
    overrides?.sceneId ??
    inferSceneIdFromAnarchy3DScene(environment.terrainType, subject.meshType);

  return {
    id: overrides?.id ?? `scene-${index + 1}`,
    name: overrides?.name ?? `0${index + 1}. Scène 3D`,
    version: overrides?.version ?? 2,
    environment,
    subject: subjects[0] ?? subject,
    subjects,
    layers,
    postFx,
    ...(overrides?.animations ? { animations: overrides.animations } : {}),
    camera,
    audioMapping,
    sceneId,
    paletteId: overrides?.paletteId ?? "anarchy-anaglyph",
    seed: overrides?.seed ?? (index + 1) * 137,
  };
}

/**
 * Packs 3D officiels au format strict `Anarchy3DPack` :
 * 1. PS2 // Enter the Dragon (5 Scènes)
 * 2. PS2 // Nether & Brutalist Runner (5 Scènes)
 * 3. Psy-Acid 145 BPM (5 Scènes)
 */
export const DEFAULT_SCENE_PACKS: Anarchy3DPack[] = [
  {
    packId: "ps2-enter-the-dragon",
    name: "PS2 // Enter the Dragon (5 Scènes)",
    author: "Anarchy Studio",
    bpm: 140,
    beatsPerScene: 16,
    seed: 199902,
    createdAt: "2026-11-15T12:00:00.000Z",
    scenes: [
      createDefaultAnarchy3DScene(0, {
        id: "scene-1",
        name: "01. Dojo Néon",
        sceneId: "rave-dungeon",
        paletteId: "anarchy-anaglyph",
        seed: 101,
        environment: {
          skyColor: "#060812",
          fogColor: "#090D1C",
          fogDensity: 0.045,
          terrainType: "dojo_pillars",
          terrainSpeed: 11.5,
          terrainPrimaryColor: "#00F0FF",
          terrainSecondaryColor: "#FF1B24",
        },
        subject: {
          meshType: "cyber_katana",
          primaryColor: "#142238",
          accentColor: "#FF1B24",
          wireframeOverlay: true,
          scale: 1.15,
        },
        camera: {
          mode: "chase_low",
          fov: 75,
          shakeIntensity: 0.35,
        },
        audioMapping: {
          bassTarget: "pillar_slam",
          midTarget: "subject_rotation",
          trebleTarget: "katana_slash",
          fluxTarget: "glitch_and_emissive",
        },
      }),
      createDefaultAnarchy3DScene(1, {
        id: "scene-2",
        name: "02. Enter the Dragon",
        sceneId: "ps1-nightmare",
        paletteId: "blood-red",
        seed: 202,
        environment: {
          skyColor: "#140408",
          fogColor: "#22060D",
          fogDensity: 0.055,
          terrainType: "lowpoly_mountains",
          terrainSpeed: 13.0,
          terrainPrimaryColor: "#FF1B24",
          terrainSecondaryColor: "#FFB300",
        },
        subject: {
          meshType: "floating_monolith",
          primaryColor: "#3D0A14",
          accentColor: "#FF2A36",
          wireframeOverlay: true,
          scale: 1.3,
        },
        camera: {
          mode: "orbit",
          fov: 78,
          shakeIntensity: 0.45,
        },
        audioMapping: {
          bassTarget: "subject_pulse",
          midTarget: "terrain_wave_height",
          trebleTarget: "particles_burst",
          fluxTarget: "camera_shake",
        },
      }),
      createDefaultAnarchy3DScene(2, {
        id: "scene-3",
        name: "03. Katana Rush",
        sceneId: "techno-therapy",
        paletteId: "techno-therapy",
        seed: 303,
        environment: {
          skyColor: "#040A14",
          fogColor: "#071426",
          fogDensity: 0.04,
          terrainType: "tunnel",
          terrainSpeed: 16.5,
          terrainPrimaryColor: "#00E5FF",
          terrainSecondaryColor: "#FF0055",
        },
        subject: {
          meshType: "voxel_runner",
          primaryColor: "#00838F",
          accentColor: "#00F0FF",
          wireframeOverlay: true,
          scale: 1.1,
        },
        camera: {
          mode: "fps_arms",
          fov: 84,
          shakeIntensity: 0.5,
        },
        audioMapping: {
          bassTarget: "tunnel_boost",
          midTarget: "subject_rotation",
          trebleTarget: "katana_slash",
          fluxTarget: "fov_kick",
        },
      }),
      createDefaultAnarchy3DScene(3, {
        id: "scene-4",
        name: "04. Shogun Boss",
        sceneId: "industrial-city",
        paletteId: "furnace-amber",
        seed: 404,
        environment: {
          skyColor: "#120804",
          fogColor: "#1F0E06",
          fogDensity: 0.05,
          terrainType: "dojo_pillars",
          terrainSpeed: 10.5,
          terrainPrimaryColor: "#FF6D00",
          terrainSecondaryColor: "#FF1B24",
        },
        subject: {
          meshType: "abstract_polyhedron",
          primaryColor: "#3E1C08",
          accentColor: "#FFAB00",
          wireframeOverlay: true,
          scale: 1.35,
        },
        camera: {
          mode: "dramatic_tilt",
          fov: 74,
          shakeIntensity: 0.55,
        },
        audioMapping: {
          bassTarget: "pillar_slam",
          midTarget: "color_shift",
          trebleTarget: "wireframe_glow",
          fluxTarget: "glitch_and_emissive",
        },
      }),
      createDefaultAnarchy3DScene(4, {
        id: "scene-5",
        name: "05. Digital Void",
        sceneId: "digital-void",
        paletteId: "anarchy-anaglyph",
        seed: 505,
        environment: {
          skyColor: "#05070E",
          fogColor: "#080D1A",
          fogDensity: 0.042,
          terrainType: "infinite_grid",
          terrainSpeed: 15.0,
          terrainPrimaryColor: "#00F0FF",
          terrainSecondaryColor: "#FF1B24",
        },
        subject: {
          meshType: "cyber_katana",
          primaryColor: "#101B2E",
          accentColor: "#00F0FF",
          wireframeOverlay: true,
          scale: 1.25,
        },
        camera: {
          mode: "chase_low",
          fov: 80,
          shakeIntensity: 0.45,
        },
        audioMapping: {
          bassTarget: "camera_zoom_and_jump",
          midTarget: "terrain_wave_height",
          trebleTarget: "particles_burst",
          fluxTarget: "invert_strobe",
        },
      }),
    ],
  },
  {
    packId: "ps2-nether-runner-v1",
    name: "PS2 // Nether & Brutalist Runner",
    author: "Anarchy Studio",
    bpm: 136,
    beatsPerScene: 16,
    seed: 202601,
    createdAt: "2026-11-16T12:00:00.000Z",
    scenes: [
      createDefaultAnarchy3DScene(0, {
        id: "scene-1",
        name: "01. Cyber Corridor",
        sceneId: "digital-void",
        paletteId: "anarchy-anaglyph",
        seed: 701,
        environment: {
          skyColor: "#060A12",
          fogColor: "#060A12",
          fogDensity: 0.045,
          terrainType: "infinite_grid",
          terrainSpeed: 12.0,
          terrainPrimaryColor: "#00F0FF",
          terrainSecondaryColor: "#FF0055",
        },
        subject: {
          meshType: "voxel_runner",
          primaryColor: "#00838F",
          accentColor: "#FF0055",
          wireframeOverlay: true,
          scale: 1.0,
        },
        camera: {
          mode: "chase_low",
          fov: 75,
          shakeIntensity: 0.4,
        },
        audioMapping: {
          bassTarget: "camera_zoom_and_jump",
          midTarget: "terrain_wave_height",
          trebleTarget: "particles_burst",
          fluxTarget: "glitch_and_emissive",
        },
      }),
      createDefaultAnarchy3DScene(1, {
        id: "scene-2",
        name: "02. Brutalist Canyon",
        sceneId: "ps1-nightmare",
        paletteId: "cold-concrete",
        seed: 702,
        environment: {
          skyColor: "#0A0D14",
          fogColor: "#111622",
          fogDensity: 0.05,
          terrainType: "lowpoly_mountains",
          terrainSpeed: 14.0,
          terrainPrimaryColor: "#78909C",
          terrainSecondaryColor: "#00E5FF",
        },
        subject: {
          meshType: "voxel_runner",
          primaryColor: "#263238",
          accentColor: "#00E5FF",
          wireframeOverlay: true,
          scale: 1.08,
        },
        camera: {
          mode: "chase_low",
          fov: 78,
          shakeIntensity: 0.42,
        },
        audioMapping: {
          bassTarget: "camera_zoom_and_jump",
          midTarget: "terrain_wave_height",
          trebleTarget: "wireframe_glow",
          fluxTarget: "camera_shake",
        },
      }),
      createDefaultAnarchy3DScene(2, {
        id: "scene-3",
        name: "03. Monolith Sanctum",
        sceneId: "rave-dungeon",
        paletteId: "blood-red",
        seed: 703,
        environment: {
          skyColor: "#0E0508",
          fogColor: "#1A070D",
          fogDensity: 0.052,
          terrainType: "dojo_pillars",
          terrainSpeed: 11.0,
          terrainPrimaryColor: "#FF1744",
          terrainSecondaryColor: "#00E5FF",
        },
        subject: {
          meshType: "floating_monolith",
          primaryColor: "#310B15",
          accentColor: "#FF1744",
          wireframeOverlay: true,
          scale: 1.25,
        },
        camera: {
          mode: "orbit",
          fov: 74,
          shakeIntensity: 0.38,
        },
        audioMapping: {
          bassTarget: "pillar_slam",
          midTarget: "subject_rotation",
          trebleTarget: "particles_burst",
          fluxTarget: "glitch_and_emissive",
        },
      }),
      createDefaultAnarchy3DScene(3, {
        id: "scene-4",
        name: "04. Nether Overdrive",
        sceneId: "techno-therapy",
        paletteId: "acid-violet",
        seed: 704,
        environment: {
          skyColor: "#090414",
          fogColor: "#140828",
          fogDensity: 0.04,
          terrainType: "tunnel",
          terrainSpeed: 18.0,
          terrainPrimaryColor: "#D500F9",
          terrainSecondaryColor: "#00E5FF",
        },
        subject: {
          meshType: "cyber_katana",
          primaryColor: "#311B92",
          accentColor: "#00E5FF",
          wireframeOverlay: true,
          scale: 1.2,
        },
        camera: {
          mode: "fps_arms",
          fov: 86,
          shakeIntensity: 0.55,
        },
        audioMapping: {
          bassTarget: "tunnel_boost",
          midTarget: "color_shift",
          trebleTarget: "katana_slash",
          fluxTarget: "fov_kick",
        },
      }),
      createDefaultAnarchy3DScene(4, {
        id: "scene-5",
        name: "05. Core Collapse",
        sceneId: "industrial-city",
        paletteId: "toxic-oxide",
        seed: 705,
        environment: {
          skyColor: "#050E0A",
          fogColor: "#0A1C14",
          fogDensity: 0.048,
          terrainType: "infinite_grid",
          terrainSpeed: 15.5,
          terrainPrimaryColor: "#00E676",
          terrainSecondaryColor: "#FF1744",
        },
        subject: {
          meshType: "abstract_polyhedron",
          primaryColor: "#004D40",
          accentColor: "#00E676",
          wireframeOverlay: true,
          scale: 1.3,
        },
        camera: {
          mode: "dramatic_tilt",
          fov: 80,
          shakeIntensity: 0.5,
        },
        audioMapping: {
          bassTarget: "subject_pulse",
          midTarget: "camera_sway",
          trebleTarget: "sky_flash",
          fluxTarget: "invert_strobe",
        },
      }),
    ],
  },
  {
    packId: "psy-acid-145-v1",
    name: "Psy-Acid 145 BPM (5 Scènes)",
    author: "Anarchy Studio",
    bpm: 145,
    beatsPerScene: 8,
    seed: 145303,
    createdAt: "2026-11-14T12:00:00.000Z",
    scenes: [
      createDefaultAnarchy3DScene(0, {
        id: "scene-1",
        name: "01. Acid Tunnel",
        sceneId: "techno-therapy",
        paletteId: "toxic-oxide",
        seed: 111,
        environment: {
          skyColor: "#041008",
          fogColor: "#071F10",
          fogDensity: 0.038,
          terrainType: "tunnel",
          terrainSpeed: 17.0,
          terrainPrimaryColor: "#00E676",
          terrainSecondaryColor: "#00E5FF",
        },
        subject: {
          meshType: "abstract_polyhedron",
          primaryColor: "#004D40",
          accentColor: "#76FF03",
          wireframeOverlay: true,
          scale: 1.2,
        },
        camera: {
          mode: "chase_low",
          fov: 82,
          shakeIntensity: 0.45,
        },
        audioMapping: {
          bassTarget: "tunnel_boost",
          midTarget: "subject_rotation",
          trebleTarget: "particles_burst",
          fluxTarget: "fov_kick",
        },
      }),
      createDefaultAnarchy3DScene(1, {
        id: "scene-2",
        name: "02. Vortex Psyché",
        sceneId: "rave-dungeon",
        paletteId: "acid-violet",
        seed: 222,
        environment: {
          skyColor: "#0C0418",
          fogColor: "#1A0833",
          fogDensity: 0.045,
          terrainType: "dojo_pillars",
          terrainSpeed: 14.5,
          terrainPrimaryColor: "#D500F9",
          terrainSecondaryColor: "#00E5FF",
        },
        subject: {
          meshType: "floating_monolith",
          primaryColor: "#311B92",
          accentColor: "#EA80FC",
          wireframeOverlay: true,
          scale: 1.28,
        },
        camera: {
          mode: "orbit",
          fov: 78,
          shakeIntensity: 0.4,
        },
        audioMapping: {
          bassTarget: "pillar_slam",
          midTarget: "color_shift",
          trebleTarget: "wireframe_glow",
          fluxTarget: "glitch_and_emissive",
        },
      }),
      createDefaultAnarchy3DScene(2, {
        id: "scene-3",
        name: "03. Bolide Rave",
        sceneId: "digital-void",
        paletteId: "techno-therapy",
        seed: 333,
        environment: {
          skyColor: "#050A14",
          fogColor: "#0A1428",
          fogDensity: 0.04,
          terrainType: "infinite_grid",
          terrainSpeed: 18.5,
          terrainPrimaryColor: "#00E5FF",
          terrainSecondaryColor: "#FF1744",
        },
        subject: {
          meshType: "voxel_runner",
          primaryColor: "#006064",
          accentColor: "#00E5FF",
          wireframeOverlay: true,
          scale: 1.15,
        },
        camera: {
          mode: "chase_low",
          fov: 85,
          shakeIntensity: 0.5,
        },
        audioMapping: {
          bassTarget: "camera_zoom_and_jump",
          midTarget: "terrain_wave_height",
          trebleTarget: "particles_burst",
          fluxTarget: "camera_shake",
        },
      }),
      createDefaultAnarchy3DScene(3, {
        id: "scene-4",
        name: "04. Fractal Core",
        sceneId: "ps1-nightmare",
        paletteId: "furnace-amber",
        seed: 444,
        environment: {
          skyColor: "#140802",
          fogColor: "#261004",
          fogDensity: 0.05,
          terrainType: "lowpoly_mountains",
          terrainSpeed: 13.5,
          terrainPrimaryColor: "#FF9100",
          terrainSecondaryColor: "#FF1744",
        },
        subject: {
          meshType: "cyber_katana",
          primaryColor: "#4E2608",
          accentColor: "#FFD600",
          wireframeOverlay: true,
          scale: 1.3,
        },
        camera: {
          mode: "fps_arms",
          fov: 80,
          shakeIntensity: 0.48,
        },
        audioMapping: {
          bassTarget: "subject_pulse",
          midTarget: "terrain_wave_height",
          trebleTarget: "katana_slash",
          fluxTarget: "glitch_and_emissive",
        },
      }),
      createDefaultAnarchy3DScene(4, {
        id: "scene-5",
        name: "05. Strobe Finale",
        sceneId: "industrial-city",
        paletteId: "anarchy-anaglyph",
        seed: 555,
        environment: {
          skyColor: "#060810",
          fogColor: "#0E1324",
          fogDensity: 0.042,
          terrainType: "tunnel",
          terrainSpeed: 20.0,
          terrainPrimaryColor: "#FF1B24",
          terrainSecondaryColor: "#00F0FF",
        },
        subject: {
          meshType: "abstract_polyhedron",
          primaryColor: "#1A237E",
          accentColor: "#FF1B24",
          wireframeOverlay: true,
          scale: 1.4,
        },
        camera: {
          mode: "dramatic_tilt",
          fov: 88,
          shakeIntensity: 0.6,
        },
        audioMapping: {
          bassTarget: "tunnel_boost",
          midTarget: "camera_sway",
          trebleTarget: "sky_flash",
          fluxTarget: "invert_strobe",
        },
      }),
    ],
  },
  {
    packId: "synthwave-outrun-v2",
    name: "Synthwave // Outrun Highway v2 (5 Scènes)",
    author: "Anarchy Studio",
    bpm: 128,
    beatsPerScene: 16,
    seed: 198402,
    createdAt: "2026-11-18T12:00:00.000Z",
    scenes: [
      createDefaultAnarchy3DScene(0, {
        id: "scene-1",
        name: "01. Sunset Outrun",
        version: 2,
        sceneId: "industrial-city",
        paletteId: "anarchy-anaglyph",
        seed: 801,
        environment: {
          skyColor: "#0B021C",
          fogColor: "#38073B",
          fogDensity: 0.038,
          terrainType: "neon_highway",
          terrainSpeed: 14.5,
          terrainPrimaryColor: "#00F0FF",
          terrainSecondaryColor: "#FF0055",
        },
        backdrop: {
          skyGradient: ["#0B021C", "#38073B"],
          horizonSun: {
            enabled: true,
            colorTop: "#FFD600",
            colorBottom: "#FF0055",
            stripes: 6,
            size: 1.05,
          },
          starfield: { enabled: true, density: 0.7, color: "#00F0FF" },
        },
        sideProps: {
          type: "palm_trees",
          density: 0.75,
          primaryColor: "#FF00AA",
          secondaryColor: "#00F0FF",
        },
        subjects: [
          {
            meshType: "procedural_group",
            primaryColor: "#1A1A2E",
            accentColor: "#FF0055",
            wireframeOverlay: true,
            scale: 1.05,
            position: [0, -0.35, 0],
            parts: [
              {
                primitive: "box",
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: [1.45, 0.34, 2.3],
                color: "#1E1B4B",
                emissive: false,
                wireframe: true,
              },
              {
                primitive: "wedge",
                position: [0, 0.28, -0.15],
                rotation: [0, 0, 0],
                scale: [1.1, 0.3, 1.25],
                color: "#FF0055",
                emissive: true,
                wireframe: true,
              },
              {
                primitive: "torus",
                position: [-0.72, -0.12, 0.75],
                rotation: [0, 1.57, 0],
                scale: [0.32, 0.32, 0.18],
                color: "#00F0FF",
                emissive: true,
                wireframe: false,
              },
              {
                primitive: "torus",
                position: [0.72, -0.12, 0.75],
                rotation: [0, 1.57, 0],
                scale: [0.32, 0.32, 0.18],
                color: "#00F0FF",
                emissive: true,
                wireframe: false,
              },
            ],
          },
          {
            meshType: "abstract_polyhedron",
            primaryColor: "#FFD600",
            accentColor: "#00F0FF",
            wireframeOverlay: true,
            scale: 0.45,
            position: [0, 1.35, 0.4],
          },
        ],
        postFx: {
          ps1VertexJitter: 0.15,
          crtScanlines: 0.3,
          chromaticAberration: 0.25,
          kaleidoscopeSegments: 0,
          bloomIntensity: 0.85,
        },
        camera: { mode: "chase_low", fov: 78, shakeIntensity: 0.38 },
        audioMapping: {
          bassTarget: "camera_zoom_and_jump",
          midTarget: "terrain_wave_height",
          trebleTarget: "particles_burst",
          fluxTarget: "glitch_and_emissive",
        },
      }),
      createDefaultAnarchy3DScene(1, {
        id: "scene-2",
        name: "02. Cyber Megapolis",
        version: 2,
        sceneId: "digital-void",
        paletteId: "techno-therapy",
        seed: 802,
        environment: {
          skyColor: "#040914",
          fogColor: "#0C1E3A",
          fogDensity: 0.042,
          terrainType: "mirror_floor",
          terrainSpeed: 13.0,
          terrainPrimaryColor: "#00F0FF",
          terrainSecondaryColor: "#7B2CBF",
        },
        backdrop: {
          skyGradient: ["#040914", "#0C1E3A"],
          horizonSun: {
            enabled: false,
            colorTop: "#00F0FF",
            colorBottom: "#7B2CBF",
            stripes: 4,
            size: 0.9,
          },
          starfield: { enabled: true, density: 0.55, color: "#00F0FF" },
        },
        sideProps: {
          type: "cyber_towers",
          density: 0.8,
          primaryColor: "#00F0FF",
          secondaryColor: "#7B2CBF",
        },
        subject: {
          meshType: "floating_monolith",
          primaryColor: "#0F172A",
          accentColor: "#00F0FF",
          wireframeOverlay: true,
          scale: 1.15,
        },
        postFx: {
          ps1VertexJitter: 0.22,
          crtScanlines: 0.25,
          chromaticAberration: 0.35,
          kaleidoscopeSegments: 0,
          bloomIntensity: 0.9,
        },
        camera: { mode: "orbit", fov: 76, shakeIntensity: 0.4 },
        audioMapping: {
          bassTarget: "subject_pulse",
          midTarget: "subject_rotation",
          trebleTarget: "wireframe_glow",
          fluxTarget: "camera_shake",
        },
      }),
      createDefaultAnarchy3DScene(2, {
        id: "scene-3",
        name: "03. Neon Arches",
        version: 2,
        sceneId: "rave-dungeon",
        paletteId: "techno-therapy",
        seed: 803,
        environment: {
          skyColor: "#04120A",
          fogColor: "#092917",
          fogDensity: 0.04,
          terrainType: "infinite_grid",
          terrainSpeed: 16.0,
          terrainPrimaryColor: "#00FF9D",
          terrainSecondaryColor: "#D500F9",
        },
        backdrop: {
          skyGradient: ["#04120A", "#092917"],
          horizonSun: {
            enabled: true,
            colorTop: "#00FF9D",
            colorBottom: "#D500F9",
            stripes: 5,
            size: 0.85,
          },
          starfield: { enabled: true, density: 0.6, color: "#00FF9D" },
        },
        sideProps: {
          type: "neon_arches",
          density: 0.7,
          primaryColor: "#00FF9D",
          secondaryColor: "#D500F9",
        },
        subject: {
          meshType: "voxel_runner",
          primaryColor: "#064E3B",
          accentColor: "#00FF9D",
          wireframeOverlay: true,
          scale: 1.1,
        },
        postFx: {
          ps1VertexJitter: 0.1,
          crtScanlines: 0.2,
          chromaticAberration: 0.25,
          kaleidoscopeSegments: 0,
          bloomIntensity: 0.95,
        },
        camera: { mode: "chase_low", fov: 82, shakeIntensity: 0.45 },
        audioMapping: {
          bassTarget: "tunnel_boost",
          midTarget: "camera_sway",
          trebleTarget: "particles_burst",
          fluxTarget: "fov_kick",
        },
      }),
      createDefaultAnarchy3DScene(3, {
        id: "scene-4",
        name: "04. Shogun Temple",
        version: 2,
        sceneId: "ps1-nightmare",
        paletteId: "blood-red",
        seed: 804,
        environment: {
          skyColor: "#140408",
          fogColor: "#2C0814",
          fogDensity: 0.048,
          terrainType: "dojo_pillars",
          terrainSpeed: 12.0,
          terrainPrimaryColor: "#FF1B24",
          terrainSecondaryColor: "#FFD600",
        },
        backdrop: {
          skyGradient: ["#140408", "#2C0814"],
          horizonSun: {
            enabled: true,
            colorTop: "#FFD600",
            colorBottom: "#FF1B24",
            stripes: 7,
            size: 1.15,
          },
          starfield: { enabled: false, density: 0.2, color: "#FFD600" },
        },
        sideProps: {
          type: "dojo_pillars",
          density: 0.75,
          primaryColor: "#FF1B24",
          secondaryColor: "#FFD600",
        },
        subject: {
          meshType: "cyber_katana",
          primaryColor: "#3D0A14",
          accentColor: "#FFD600",
          wireframeOverlay: true,
          scale: 1.25,
        },
        postFx: {
          ps1VertexJitter: 0.35,
          crtScanlines: 0.4,
          chromaticAberration: 0.3,
          kaleidoscopeSegments: 0,
          bloomIntensity: 0.75,
        },
        camera: { mode: "dramatic_tilt", fov: 74, shakeIntensity: 0.5 },
        audioMapping: {
          bassTarget: "pillar_slam",
          midTarget: "subject_rotation",
          trebleTarget: "katana_slash",
          fluxTarget: "glitch_and_emissive",
        },
      }),
      createDefaultAnarchy3DScene(4, {
        id: "scene-5",
        name: "05. Kaleido Warp v3",
        version: 3,
        sceneId: "techno-therapy",
        paletteId: "anarchy-anaglyph",
        seed: 805,
        environment: {
          skyColor: "#090418",
          fogColor: "#1E0B3B",
          fogDensity: 0.036,
          terrainType: "tunnel",
          terrainSpeed: 18.5,
          terrainPrimaryColor: "#00F0FF",
          terrainSecondaryColor: "#FF00AA",
        },
        backdrop: {
          skyGradient: ["#090418", "#1E0B3B"],
          starfield: { enabled: true, density: 0.85, color: "#FFFFFF" },
        },
        sideProps: {
          type: "neon_arches",
          density: 0.65,
          primaryColor: "#00F0FF",
          secondaryColor: "#FF00AA",
        },
        subject: {
          meshType: "procedural_group",
          primaryColor: "#14142B",
          accentColor: "#00F0FF",
          wireframeOverlay: true,
          scale: 1.15,
          parts: [
            {
              primitive: "icosahedron",
              position: [0, 0.2, 0],
              rotation: [0.3, 0.6, 0],
              scale: [0.9, 0.9, 0.9],
              color: "#FF00AA",
              emissive: true,
              wireframe: true,
              animations: [
                { target: "rot.y", expr: "t * 1.4 + beat * 0.8" },
                { target: "scale", expr: "0.9 + bass * 0.35" },
              ],
            },
            {
              primitive: "ring",
              position: [0, 0.2, -0.8],
              rotation: [0, 0, 0],
              scale: [1.35, 1.35, 0.3],
              color: "#00F0FF",
              emissive: true,
              wireframe: true,
              cloner: {
                mode: "spiral",
                count: 10,
                offset: [0.28, 0.06, -0.55],
                stepRotation: [0, 0, 22],
                stepScale: [0.96, 0.96, 0.96],
              },
              animations: [
                { target: "rot.z", expr: "t * 0.9 + i * 0.3" },
                { target: "scale", expr: "1 + sin(t * 3 + i * 0.4) * 0.1 + bass * 0.2" },
              ],
            },
            {
              primitive: "pyramid",
              position: [0, -0.75, 0],
              rotation: [0, 0, 0],
              scale: [1.1, 0.7, 1.1],
              color: "#FFD600",
              emissive: false,
              wireframe: true,
            },
          ],
        },
        postFx: {
          ps1VertexJitter: 0.1,
          crtScanlines: 0.25,
          chromaticAberration: 0.45,
          kaleidoscopeSegments: 4,
          bloomIntensity: 1.1,
        },
        camera: { mode: "fps_arms", fov: 86, shakeIntensity: 0.55 },
        audioMapping: {
          bassTarget: "tunnel_boost",
          midTarget: "color_shift",
          trebleTarget: "sky_flash",
          fluxTarget: "invert_strobe",
        },
      }),
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

function clampNum(
  val: unknown,
  min: number,
  max: number,
  fallback: number
): number {
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function sanitizeHexColor(val: unknown, fallback: string): string {
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toUpperCase();
    if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
      const r = trimmed[1];
      const g = trimmed[2];
      const b = trimmed[3];
      return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
    }
  }
  return fallback;
}

function sanitizeSceneId(val: unknown, fallback: SceneId): SceneId {
  return typeof val === "string" && SCENE_IDS.includes(val as SceneId)
    ? (val as SceneId)
    : fallback;
}

function sanitizePaletteId(val: unknown, fallback: PaletteId): PaletteId {
  return typeof val === "string" && PALETTE_IDS.includes(val as PaletteId)
    ? (val as PaletteId)
    : fallback;
}

function sanitizeVec3(
  val: unknown,
  fallback: [number, number, number],
  min = -50,
  max = 50
): [number, number, number] {
  if (!Array.isArray(val) || val.length < 3) return fallback;
  return [
    Number(clampNum(val[0], min, max, fallback[0]).toFixed(3)),
    Number(clampNum(val[1], min, max, fallback[1]).toFixed(3)),
    Number(clampNum(val[2], min, max, fallback[2]).toFixed(3)),
  ];
}

function sanitizeCloner(raw: unknown): Anarchy3DCloner | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const c = raw as Record<string, unknown>;
  const mode: AnarchyClonerMode = CLONER_MODE_SET.has(c.mode as AnarchyClonerMode)
    ? (c.mode as AnarchyClonerMode)
    : "linear";
  const count = Math.round(clampNum(c.count, 1, 64, 1));
  const offset = sanitizeVec3(c.offset, [0, 0, 0], -30, 30);
  const stepRotation = Array.isArray(c.stepRotation)
    ? sanitizeVec3(c.stepRotation, [0, 0, 0], -360, 360)
    : undefined;
  const stepScale = Array.isArray(c.stepScale)
    ? sanitizeVec3(c.stepScale, [1, 1, 1], 0.25, 2.5)
    : undefined;
  return {
    mode,
    count,
    offset,
    ...(stepRotation ? { stepRotation } : {}),
    ...(stepScale ? { stepScale } : {}),
  };
}

function sanitizeParams(raw: unknown): Record<string, number> | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const out: Record<string, number> = {};
  let count = 0;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (count >= 24) break;
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k)) continue;
    if (k === "__proto__" || k === "constructor" || k === "prototype") continue;
    const num = Number(v);
    if (!Number.isFinite(num)) continue;
    out[k] = Math.max(-1000, Math.min(1000, num));
    count++;
  }
  return count > 0 ? out : undefined;
}

function sanitizeTriggers(
  raw: unknown,
  allowedParams?: ReadonlySet<string>
): Anarchy3DTrigger[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const valid: Anarchy3DTrigger[] = [];
  for (const item of raw.slice(0, 16)) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const when = typeof obj.when === "string" ? obj.when.trim() : "";
    const action = obj.action as Anarchy3DTriggerAction;
    if (!when || !TRIGGER_ACTION_SET.has(action)) continue;
    if (!validateMathExpression(when, allowedParams).ok) continue;
    const intensity =
      obj.intensity !== undefined
        ? Number(clampNum(obj.intensity, 0, 2, 1).toFixed(2))
        : undefined;
    valid.push({
      when,
      action,
      ...(intensity !== undefined ? { intensity } : {}),
    });
  }
  return valid.length > 0 ? valid : undefined;
}

function sanitizeAnimations(
  raw: unknown,
  allowedParams?: ReadonlySet<string>
): Anarchy3DAnimation[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const valid: Anarchy3DAnimation[] = [];
  for (const item of raw.slice(0, 24)) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const target = obj.target as Anarchy3DAnimationTarget;
    const expr = typeof obj.expr === "string" ? obj.expr.trim() : "";
    if (!ANIMATION_TARGET_SET.has(target) || !expr) continue;
    if (!validateMathExpression(expr, allowedParams).ok) continue;
    valid.push({ target, expr });
  }
  return valid.length > 0 ? valid : undefined;
}

function sanitizeProceduralParts(
  rawParts: unknown,
  fallbackColor: string,
  allowedParams?: ReadonlySet<string>
): AnarchyProceduralPart[] {
  if (!Array.isArray(rawParts)) return [];
  return rawParts
    .slice(0, 48)
    .filter((p) => p && typeof p === "object")
    .map((p) => {
      const part = p as Record<string, unknown>;
      const primitive: AnarchyProceduralPrimitive = PRIMITIVE_SET.has(
        part.primitive as AnarchyProceduralPrimitive
      )
        ? (part.primitive as AnarchyProceduralPrimitive)
        : "box";
      const cloner = sanitizeCloner(part.cloner);
      const animations = sanitizeAnimations(part.animations, allowedParams);
      return {
        primitive,
        position: sanitizeVec3(part.position, [0, 0, 0], -20, 20),
        rotation: sanitizeVec3(part.rotation, [0, 0, 0], -Math.PI * 4, Math.PI * 4),
        scale: sanitizeVec3(part.scale, [1, 1, 1], 0.05, 15),
        color: sanitizeHexColor(part.color, fallbackColor),
        emissive: typeof part.emissive === "boolean" ? part.emissive : false,
        wireframe: typeof part.wireframe === "boolean" ? part.wireframe : true,
        ...(cloner ? { cloner } : {}),
        ...(animations ? { animations } : {}),
      };
    });
}

function sanitizeAnarchy3DSubject(
  raw: unknown,
  fallback: Anarchy3DSubject,
  allowedParams?: ReadonlySet<string>
): Anarchy3DSubject {
  const rawSub =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const meshType: AnarchySubjectMeshType = SUBJECT_SET.has(
    rawSub.meshType as AnarchySubjectMeshType
  )
    ? (rawSub.meshType as AnarchySubjectMeshType)
    : fallback.meshType;
  const primaryColor = sanitizeHexColor(
    rawSub.primaryColor,
    fallback.primaryColor
  );
  const accentColor = sanitizeHexColor(
    rawSub.accentColor,
    fallback.accentColor
  );
  const parts = sanitizeProceduralParts(rawSub.parts, accentColor, allowedParams);
  const cloner = sanitizeCloner(rawSub.cloner);
  const animations = sanitizeAnimations(rawSub.animations, allowedParams);

  return {
    meshType,
    primaryColor,
    accentColor,
    wireframeOverlay:
      typeof rawSub.wireframeOverlay === "boolean"
        ? rawSub.wireframeOverlay
        : fallback.wireframeOverlay,
    scale: Number(clampNum(rawSub.scale, 0.15, 4.0, fallback.scale).toFixed(2)),
    ...(Array.isArray(rawSub.position)
      ? { position: sanitizeVec3(rawSub.position, [0, 0, 0], -20, 20) }
      : {}),
    ...(Array.isArray(rawSub.rotation)
      ? {
          rotation: sanitizeVec3(
            rawSub.rotation,
            [0, 0, 0],
            -Math.PI * 4,
            Math.PI * 4
          ),
        }
      : {}),
    ...(meshType === "procedural_group" || parts.length > 0 ? { parts } : {}),
    ...(cloner ? { cloner } : {}),
    ...(animations ? { animations } : {}),
  };
}

function sanitizePostFx(raw: unknown): Anarchy3DPostFx {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_POST_FX };
  const fx = raw as Record<string, unknown>;
  const rawKaleido = Number(fx.kaleidoscopeSegments);
  const allowedKaleido: readonly (0 | 2 | 4 | 6 | 8)[] = [0, 2, 4, 6, 8];
  const kaleidoscopeSegments = allowedKaleido.includes(
    rawKaleido as 0 | 2 | 4 | 6 | 8
  )
    ? (rawKaleido as 0 | 2 | 4 | 6 | 8)
    : 0;
  return {
    ps1VertexJitter: Number(
      clampNum(fx.ps1VertexJitter, 0, 1, DEFAULT_POST_FX.ps1VertexJitter).toFixed(2)
    ),
    crtScanlines: Number(
      clampNum(fx.crtScanlines, 0, 1, DEFAULT_POST_FX.crtScanlines).toFixed(2)
    ),
    chromaticAberration: Number(
      clampNum(
        fx.chromaticAberration,
        0,
        1,
        DEFAULT_POST_FX.chromaticAberration
      ).toFixed(2)
    ),
    kaleidoscopeSegments,
    bloomIntensity: Number(
      clampNum(fx.bloomIntensity, 0, 2, DEFAULT_POST_FX.bloomIntensity).toFixed(2)
    ),
  };
}

/**
 * Nettoie et valide une scène 3D JSON (`Anarchy3DScene`) avec valeurs de repli (fallbacks) sécurisées.
 * Convertit automatiquement les scènes v1 (sans `layers[]`) vers le pipeline modulaire v2 à la volée.
 * Zéro exécution de code dynamique arbitraire.
 */
export function sanitizeAnarchy3DScene(
  raw: unknown,
  idx = 0,
  packParams?: Record<string, number>
): Anarchy3DScene {
  const fallback = createDefaultAnarchy3DScene(idx);
  if (!raw || typeof raw !== "object") return fallback;

  const item = raw as Record<string, unknown>;
  const sceneParams = sanitizeParams(item.params);
  const mergedParams =
    packParams || sceneParams
      ? { ...(packParams ?? {}), ...(sceneParams ?? {}) }
      : undefined;
  const allowedParams = mergedParams
    ? new Set(Object.keys(mergedParams))
    : undefined;
  const rawLayers = Array.isArray(item.layers) ? item.layers : null;

  // Extraire d'éventuels calques v2 pour synchroniser environment / subject si omis à la racine
  let layerTerrainRaw: Record<string, unknown> | null = null;
  let layerBackdropRaw: Record<string, unknown> | null = null;
  let layerSidePropsRaw: Record<string, unknown> | null = null;
  let layerSubjectsRaw: unknown[] | null = null;

  if (rawLayers) {
    for (const l of rawLayers) {
      if (!l || typeof l !== "object") continue;
      const layerObj = l as Record<string, unknown>;
      if (layerObj.kind === "terrain" && layerObj.terrain && typeof layerObj.terrain === "object") {
        layerTerrainRaw = layerObj.terrain as Record<string, unknown>;
      } else if (
        layerObj.kind === "backdrop" &&
        layerObj.backdrop &&
        typeof layerObj.backdrop === "object"
      ) {
        layerBackdropRaw = layerObj.backdrop as Record<string, unknown>;
      } else if (
        layerObj.kind === "sideProps" &&
        layerObj.sideProps &&
        typeof layerObj.sideProps === "object"
      ) {
        layerSidePropsRaw = layerObj.sideProps as Record<string, unknown>;
      } else if (layerObj.kind === "subjects" && Array.isArray(layerObj.subjects)) {
        layerSubjectsRaw = layerObj.subjects;
      }
    }
  }

  const rawEnv =
    item.environment && typeof item.environment === "object"
      ? (item.environment as Record<string, unknown>)
      : {};
  const rawCam =
    item.camera && typeof item.camera === "object"
      ? (item.camera as Record<string, unknown>)
      : {};
  const rawAudio =
    item.audioMapping && typeof item.audioMapping === "object"
      ? (item.audioMapping as Record<string, unknown>)
      : {};

  const candidateTerrainType =
    rawEnv.terrainType ?? layerTerrainRaw?.type;
  const terrainType: AnarchyTerrainType = TERRAIN_SET.has(
    candidateTerrainType as AnarchyTerrainType
  )
    ? (candidateTerrainType as AnarchyTerrainType)
    : fallback.environment.terrainType;

  const backdropSkyGrad = Array.isArray(layerBackdropRaw?.skyGradient)
    ? (layerBackdropRaw?.skyGradient as unknown[])
    : null;

  const environment: Anarchy3DEnvironment = {
    skyColor: sanitizeHexColor(
      rawEnv.skyColor ?? backdropSkyGrad?.[0],
      fallback.environment.skyColor
    ),
    fogColor: sanitizeHexColor(
      rawEnv.fogColor ?? backdropSkyGrad?.[1] ?? rawEnv.skyColor,
      fallback.environment.fogColor
    ),
    fogDensity: Number(
      clampNum(
        rawEnv.fogDensity,
        0,
        0.25,
        fallback.environment.fogDensity
      ).toFixed(4)
    ),
    terrainType,
    terrainSpeed: Number(
      clampNum(
        rawEnv.terrainSpeed ?? layerTerrainRaw?.speed,
        0.5,
        40,
        fallback.environment.terrainSpeed
      ).toFixed(2)
    ),
    terrainPrimaryColor: sanitizeHexColor(
      rawEnv.terrainPrimaryColor ?? layerTerrainRaw?.primaryColor,
      fallback.environment.terrainPrimaryColor
    ),
    terrainSecondaryColor: sanitizeHexColor(
      rawEnv.terrainSecondaryColor ?? layerTerrainRaw?.secondaryColor,
      fallback.environment.terrainSecondaryColor
    ),
  };

  // Sujets multiples (layers[kind="subjects"] ou item.subjects ou item.subject v1)
  const rawSubjectsList =
    layerSubjectsRaw && layerSubjectsRaw.length > 0
      ? layerSubjectsRaw
      : Array.isArray(item.subjects) && item.subjects.length > 0
      ? item.subjects
      : item.subject && typeof item.subject === "object"
      ? [item.subject]
      : [fallback.subject];

  const subjects: Anarchy3DSubject[] = rawSubjectsList
    .slice(0, 8)
    .map((s) => sanitizeAnarchy3DSubject(s, fallback.subject, allowedParams));
  const primarySubject = subjects[0] ?? fallback.subject;

  // Calques v2 normalisés (convertit automatiquement les scènes v1)
  const backdrop: Anarchy3DBackdropLayer = {
    skyGradient: [
      sanitizeHexColor(backdropSkyGrad?.[0], environment.skyColor),
      sanitizeHexColor(backdropSkyGrad?.[1], environment.fogColor),
    ],
    horizonSun:
      layerBackdropRaw?.horizonSun &&
      typeof layerBackdropRaw.horizonSun === "object"
        ? {
            enabled: Boolean(
              (layerBackdropRaw.horizonSun as Record<string, unknown>).enabled
            ),
            colorTop: sanitizeHexColor(
              (layerBackdropRaw.horizonSun as Record<string, unknown>).colorTop,
              environment.terrainSecondaryColor
            ),
            colorBottom: sanitizeHexColor(
              (layerBackdropRaw.horizonSun as Record<string, unknown>)
                .colorBottom,
              environment.terrainPrimaryColor
            ),
            stripes: Math.round(
              clampNum(
                (layerBackdropRaw.horizonSun as Record<string, unknown>).stripes,
                0,
                14,
                6
              )
            ),
            size: Number(
              clampNum(
                (layerBackdropRaw.horizonSun as Record<string, unknown>).size,
                0.3,
                2.0,
                1.0
              ).toFixed(2)
            ),
          }
        : {
            enabled: false,
            colorTop: environment.terrainSecondaryColor,
            colorBottom: environment.terrainPrimaryColor,
            stripes: 6,
            size: 1.0,
          },
    starfield:
      layerBackdropRaw?.starfield &&
      typeof layerBackdropRaw.starfield === "object"
        ? {
            enabled:
              typeof (layerBackdropRaw.starfield as Record<string, unknown>)
                .enabled === "boolean"
                ? Boolean(
                    (layerBackdropRaw.starfield as Record<string, unknown>)
                      .enabled
                  )
                : true,
            density: Number(
              clampNum(
                (layerBackdropRaw.starfield as Record<string, unknown>).density,
                0,
                1,
                0.5
              ).toFixed(2)
            ),
            color: sanitizeHexColor(
              (layerBackdropRaw.starfield as Record<string, unknown>).color,
              environment.terrainPrimaryColor
            ),
          }
        : {
            enabled: true,
            density: 0.45,
            color: environment.terrainPrimaryColor,
          },
  };

  const terrainLayer: Anarchy3DTerrainLayer = {
    type: environment.terrainType,
    speed: environment.terrainSpeed,
    primaryColor: environment.terrainPrimaryColor,
    secondaryColor: environment.terrainSecondaryColor,
  };

  const sidePropType: AnarchySidePropType = SIDE_PROP_SET.has(
    layerSidePropsRaw?.type as AnarchySidePropType
  )
    ? (layerSidePropsRaw?.type as AnarchySidePropType)
    : "none";

  const sidePropsLayer: Anarchy3DSidePropsLayer = {
    type: sidePropType,
    density: Number(
      clampNum(layerSidePropsRaw?.density, 0, 1, 0.6).toFixed(2)
    ),
    primaryColor: sanitizeHexColor(
      layerSidePropsRaw?.primaryColor,
      environment.terrainPrimaryColor
    ),
    secondaryColor: sanitizeHexColor(
      layerSidePropsRaw?.secondaryColor,
      environment.terrainSecondaryColor
    ),
  };

  const layers: Anarchy3DLayer[] = [
    { kind: "backdrop", backdrop },
    { kind: "terrain", terrain: terrainLayer },
    { kind: "sideProps", sideProps: sidePropsLayer },
    { kind: "subjects", subjects },
  ];

  const postFx = sanitizePostFx(item.postFx);

  const camMode: AnarchyCameraMode = CAMERA_MODE_SET.has(
    rawCam.mode as AnarchyCameraMode
  )
    ? (rawCam.mode as AnarchyCameraMode)
    : fallback.camera.mode;

  const bassTarget: AnarchyBassTarget = BASS_TARGET_SET.has(
    rawAudio.bassTarget as AnarchyBassTarget
  )
    ? (rawAudio.bassTarget as AnarchyBassTarget)
    : fallback.audioMapping.bassTarget;

  const midTarget: AnarchyMidTarget = MID_TARGET_SET.has(
    rawAudio.midTarget as AnarchyMidTarget
  )
    ? (rawAudio.midTarget as AnarchyMidTarget)
    : fallback.audioMapping.midTarget;

  const trebleTarget: AnarchyTrebleTarget = TREBLE_TARGET_SET.has(
    rawAudio.trebleTarget as AnarchyTrebleTarget
  )
    ? (rawAudio.trebleTarget as AnarchyTrebleTarget)
    : fallback.audioMapping.trebleTarget;

  const fluxTarget: AnarchyFluxTarget = FLUX_TARGET_SET.has(
    rawAudio.fluxTarget as AnarchyFluxTarget
  )
    ? (rawAudio.fluxTarget as AnarchyFluxTarget)
    : fallback.audioMapping.fluxTarget;

  const camera: Anarchy3DCamera = {
    mode: camMode,
    fov: Math.round(clampNum(rawCam.fov, 40, 115, fallback.camera.fov)),
    shakeIntensity: Number(
      clampNum(
        rawCam.shakeIntensity,
        0,
        2.0,
        fallback.camera.shakeIntensity
      ).toFixed(2)
    ),
  };

  const audioMapping: Anarchy3DAudioMapping = {
    bassTarget,
    midTarget,
    trebleTarget,
    fluxTarget,
  };

  const inferredSceneId = inferSceneIdFromAnarchy3DScene(
    terrainType,
    primarySubject.meshType
  );
  const rawName =
    typeof item.name === "string" && item.name.trim()
      ? item.name.trim()
      : typeof item.label === "string" && item.label.trim()
      ? item.label.trim()
      : `0${idx + 1}. Scène 3D`;

  const sceneAnimations = sanitizeAnimations(item.animations, allowedParams);
  const sceneTriggers = sanitizeTriggers(item.triggers, allowedParams);
  const hasV4Features = Boolean(mergedParams || sceneTriggers?.length);
  const hasV3Features =
    Boolean(sceneAnimations?.length) ||
    subjects.some(
      (s) =>
        Boolean(s.cloner) ||
        Boolean(s.animations?.length) ||
        Boolean(s.parts?.some((p) => Boolean(p.cloner) || Boolean(p.animations?.length)))
    );

  return {
    id:
      typeof item.id === "string" && item.id.trim()
        ? item.id.trim()
        : `scene-${idx + 1}`,
    name: rawName,
    version: hasV4Features
      ? 4
      : hasV3Features
      ? 3
      : rawLayers || item.postFx || item.subjects
      ? 2
      : 1,
    environment,
    subject: primarySubject,
    subjects,
    layers,
    postFx,
    ...(sceneAnimations ? { animations: sceneAnimations } : {}),
    ...(mergedParams ? { params: mergedParams } : {}),
    ...(sceneTriggers ? { triggers: sceneTriggers } : {}),
    camera,
    audioMapping,
    sceneId: sanitizeSceneId(item.sceneId, inferredSceneId),
    paletteId: sanitizePaletteId(item.paletteId, "anarchy-anaglyph"),
    seed: Number(item.seed) || (idx + 1) * 137,
  };
}

/**
 * Génère un nouveau Pack 3D (`Anarchy3DPack`) procédural unique par seed.
 */
export function generateRandomScenePack(
  author = "Anarchy Studio",
  customName?: string,
  bpm = 140,
  beatsPerScene = 16,
  sceneCount = 5,
  explicitSeed?: number
): Anarchy3DPack {
  const seed =
    explicitSeed !== undefined
      ? explicitSeed >>> 0
      : Math.floor(Math.random() * 900000) + 100000;
  const rng = mulberry32(seed);

  const skyPool = ["#060A12", "#120408", "#050D1A", "#0A0416", "#05100A"];
  const neonPool = [
    "#00F0FF",
    "#FF0055",
    "#00E676",
    "#FFAB00",
    "#D500F9",
    "#FF1B24",
  ];
  const primaryPool = [
    "#00838F",
    "#263238",
    "#311B92",
    "#3E1C08",
    "#101B2E",
    "#3D0A14",
  ];
  const terrains = ANARCHY_TERRAIN_TYPES.map((t) => t.value);
  const subjects = ANARCHY_SUBJECT_MESH_TYPES.map((s) => s.value).filter(
    (s) => s !== "none"
  );
  const camModes = ANARCHY_CAMERA_MODES.map((c) => c.value);
  const bassTargets = ANARCHY_BASS_TARGETS.map((b) => b.value);
  const midTargets = ANARCHY_MID_TARGETS.map((m) => m.value);
  const trebleTargets = ANARCHY_TREBLE_TARGETS.map((t) => t.value);
  const fluxTargets = ANARCHY_FLUX_TARGETS.map((f) => f.value);
  const shuffledPalettes = [...PALETTE_IDS].sort(() => rng() - 0.5);

  const count = Math.max(1, Math.min(16, Math.round(sceneCount)));
  const scenes: Anarchy3DScene[] = Array.from({ length: count }, (_, idx) => {
    const terrainType = terrains[Math.floor(rng() * terrains.length)];
    const meshType = subjects[Math.floor(rng() * subjects.length)];
    const camMode = camModes[Math.floor(rng() * camModes.length)];
    const sky = skyPool[Math.floor(rng() * skyPool.length)];
    const colA = neonPool[Math.floor(rng() * neonPool.length)];
    const colB =
      neonPool[(Math.floor(rng() * neonPool.length) + 1) % neonPool.length];
    const subPri = primaryPool[Math.floor(rng() * primaryPool.length)];

    return createDefaultAnarchy3DScene(idx, {
      id: `scene-${idx + 1}`,
      name: `0${idx + 1}. ${terrainType.replace("_", " ").toUpperCase()}`,
      paletteId: shuffledPalettes[idx % shuffledPalettes.length],
      seed: Math.floor(rng() * 99999) + 1,
      environment: {
        skyColor: sky,
        fogColor: sky,
        fogDensity: Number((0.03 + rng() * 0.04).toFixed(3)),
        terrainType,
        terrainSpeed: Number((8 + rng() * 12).toFixed(1)),
        terrainPrimaryColor: colA,
        terrainSecondaryColor: colB,
      },
      subject: {
        meshType,
        primaryColor: subPri,
        accentColor: colB,
        wireframeOverlay: rng() > 0.15,
        scale: Number((0.85 + rng() * 0.6).toFixed(2)),
      },
      camera: {
        mode: camMode,
        fov: Math.round(68 + rng() * 22),
        shakeIntensity: Number((0.25 + rng() * 0.45).toFixed(2)),
      },
      audioMapping: {
        bassTarget: bassTargets[Math.floor(rng() * bassTargets.length)],
        midTarget: midTargets[Math.floor(rng() * midTargets.length)],
        trebleTarget: trebleTargets[Math.floor(rng() * trebleTargets.length)],
        fluxTarget: fluxTargets[Math.floor(rng() * fluxTargets.length)],
      },
    });
  });

  const cleanName = customName?.trim();
  return {
    packId: `pack-3d-${seed}`,
    name:
      cleanName ||
      `Pack 3D #${seed.toString().slice(-4)} (${count} Scènes)`,
    author: author.trim() || "Anarchy Studio",
    bpm,
    beatsPerScene,
    seed,
    scenes,
    createdAt: new Date().toISOString(),
  };
}

export type ForgivingJsonParseResult =
  | {
      ok: true;
      data: unknown;
      cleanedJson: string;
      wasRepaired: boolean;
      repairs: string[];
    }
  | {
      ok: false;
      error: string;
      line: number | null;
      column: number | null;
      lineSnippet: string | null;
      cleanedJson: string;
    };

function extractJsonBlock(input: string): { text: string; extracted: boolean } {
  const trimmed = input.trim();
  const fenced = trimmed.match(/```(?:json|jsonc|js|ts|cpp)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return { text: fenced[1].trim(), extracted: true };
  }

  const firstObj = trimmed.indexOf("{");
  const firstArr = trimmed.indexOf("[");
  let start = -1;
  if (firstObj >= 0 && firstArr >= 0) start = Math.min(firstObj, firstArr);
  else start = Math.max(firstObj, firstArr);

  if (start < 0) return { text: trimmed, extracted: false };

  const openChar = trimmed[start];
  const closeChar = openChar === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escaped = false;
  let end = -1;

  for (let i = start; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === openChar) depth++;
    else if (ch === closeChar) {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  const sliced = end >= start ? trimmed.slice(start, end + 1) : trimmed.slice(start);
  return {
    text: sliced,
    extracted: start > 0 || (end >= 0 && end < trimmed.length - 1),
  };
}

function stripJsonCommentsPreservingLines(input: string): {
  text: string;
  stripped: boolean;
} {
  let out = "";
  let inString = false;
  let escaped = false;
  let stripped = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const next = input[i + 1];

    if (inString) {
      out += ch;
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }

    if (ch === '"') {
      inString = true;
      out += ch;
      continue;
    }

    if (ch === "/" && next === "/") {
      stripped = true;
      i += 2;
      while (i < input.length && input[i] !== "\n") {
        i++;
      }
      if (i < input.length && input[i] === "\n") {
        out += "\n";
      }
      continue;
    }

    if (ch === "/" && next === "*") {
      stripped = true;
      i += 2;
      while (i < input.length && !(input[i] === "*" && input[i + 1] === "/")) {
        if (input[i] === "\n") out += "\n";
        i++;
      }
      i++; // skip '/'
      continue;
    }

    out += ch;
  }

  return { text: out, stripped };
}

function mapOutsideStrings(
  input: string,
  transform: (segment: string) => string
): string {
  let out = "";
  let segment = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (inString) {
      out += ch;
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      if (segment) {
        out += transform(segment);
        segment = "";
      }
      inString = true;
      out += ch;
      continue;
    }
    segment += ch;
  }

  if (segment) {
    out += transform(segment);
  }
  return out;
}

function cleanCppNumbersAndTrailingCommas(input: string): {
  text: string;
  cleanedNumbers: boolean;
  removedTrailingCommas: boolean;
} {
  let cleanedNumbers = false;
  let removedTrailingCommas = false;

  // 1. Nombres C++/GLSL (suffixes f/F, décimales sans zéro initial .5 / -.5)
  const afterNumbers = mapOutsideStrings(input, (seg) => {
    let s = seg;
    const before = s;
    // : .5 -> : 0.5  et  : -.5 -> : -0.5  et  [.5 -> [0.5
    s = s.replace(/(^|[:\[,\s])(-?)\.(\d+)/g, "$1$20.$3");
    // 12.f -> 12.0
    s = s.replace(/(-?\d+)\.[fF](?=\s*[,}\]\n\r]|$)/g, "$1.0");
    // 12.0f / 0.5f -> 12.0 / 0.5
    s = s.replace(/(-?\d+\.\d+)[fF](?=\s*[,}\]\n\r]|$)/g, "$1");
    // 12f -> 12
    s = s.replace(/(-?\d+)[fF](?=\s*[,}\]\n\r]|$)/g, "$1");
    if (s !== before) cleanedNumbers = true;
    return s;
  });

  // 2. Virgules traînantes avant } ou ] (même sur plusieurs niveaux)
  let afterCommas = afterNumbers;
  for (let pass = 0; pass < 3; pass++) {
    const next = mapOutsideStrings(afterCommas, (seg) =>
      seg.replace(/,(\s*[}\]])/g, "$1")
    );
    if (next !== afterCommas) {
      removedTrailingCommas = true;
      afterCommas = next;
    } else {
      break;
    }
  }

  return {
    text: afterCommas,
    cleanedNumbers,
    removedTrailingCommas,
  };
}

function extractLineColumnFromSyntaxError(
  err: unknown,
  source: string
): { line: number | null; column: number | null; lineSnippet: string | null } {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  const lines = source.split("\n");

  const lineColMatch = msg.match(/line\s+(\d+)\s+column\s+(\d+)/i);
  if (lineColMatch) {
    const line = Math.max(1, Number(lineColMatch[1]));
    const column = Math.max(1, Number(lineColMatch[2]));
    return {
      line,
      column,
      lineSnippet: lines[line - 1]?.trimEnd() ?? null,
    };
  }

  const posMatch = msg.match(/position\s+(\d+)/i);
  if (posMatch) {
    const pos = Math.max(0, Math.min(source.length, Number(posMatch[1])));
    const before = source.slice(0, pos);
    const beforeLines = before.split("\n");
    const line = beforeLines.length;
    const column = beforeLines[beforeLines.length - 1].length + 1;
    return {
      line,
      column,
      lineSnippet: lines[line - 1]?.trimEnd() ?? null,
    };
  }

  return { line: null, column: null, lineSnippet: null };
}

/**
 * Parseur JSON tolérant ("forgiving") pour les Cartouches / Packs 3D générés par IA :
 * 1. Extrait le bloc JSON même entouré de prose ou balises Markdown (```json ... ```)
 * 2. Supprime les commentaires JS/C++ (`// ...` et `/* ... *\/`) hors chaînes
 * 3. Nettoie les nombres C++/GLSL (`12.0f` -> `12.0`, `.5` -> `0.5`, `-.5` -> `-0.5`)
 * 4. Supprime les virgules traînantes avant `}` ou `]`
 * 5. Retourne la ligne exacte en français si une erreur persiste
 */
export function parseForgivingPackJSON(raw: string): ForgivingJsonParseResult {
  if (!raw || !raw.trim()) {
    return {
      ok: false,
      error: "Le JSON est vide.",
      line: 1,
      column: 1,
      lineSnippet: null,
      cleanedJson: "",
    };
  }

  const repairs: string[] = [];
  const extracted = extractJsonBlock(raw);
  if (extracted.extracted) {
    repairs.push("Bloc JSON extrait du texte / Markdown");
  }

  const uncommented = stripJsonCommentsPreservingLines(extracted.text);
  if (uncommented.stripped) {
    repairs.push("Commentaires // et /* */ supprimés");
  }

  const cleaned = cleanCppNumbersAndTrailingCommas(uncommented.text);
  if (cleaned.cleanedNumbers) {
    repairs.push("Nombres C++/GLSL normalisés (suffixes 'f' et '.5' -> '0.5')");
  }
  if (cleaned.removedTrailingCommas) {
    repairs.push("Virgules traînantes supprimées");
  }

  try {
    const data = JSON.parse(cleaned.text);
    return {
      ok: true,
      data,
      cleanedJson: cleaned.text,
      wasRepaired: repairs.length > 0,
      repairs,
    };
  } catch (err) {
    const loc = extractLineColumnFromSyntaxError(err, cleaned.text);
    const rawMsg = err instanceof Error ? err.message : "Syntaxe JSON invalide";
    const linePrefix = loc.line
      ? `Erreur de syntaxe JSON à la ligne ${loc.line}${
          loc.column ? ` (col. ${loc.column})` : ""
        }`
      : "Erreur de syntaxe JSON";
    return {
      ok: false,
      error: `${linePrefix} : ${rawMsg}`,
      line: loc.line,
      column: loc.column,
      lineSnippet: loc.lineSnippet,
      cleanedJson: cleaned.text,
    };
  }
}

/**
 * Tente une auto-réparation syntaxique complète d'un JSON généré par IA
 * (guillemets simples, clés non quotées, virgules manquantes, accolades non fermées, etc.).
 */
export function autoRepairPackJsonSyntax(raw: string): string {
  const firstPass = parseForgivingPackJSON(raw);
  if (firstPass.ok) {
    return JSON.stringify(firstPass.data, null, 2);
  }

  let candidate = firstPass.cleanedJson || raw.trim();

  // 1. Convertir les chaînes entre guillemets simples 'abc' -> "abc"
  candidate = candidate.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_, inner) => {
    const escaped = String(inner).replace(/"/g, '\\"');
    return `"${escaped}"`;
  });

  // 2. Quoter les clés d'objet JS non quotées : { packId: "..." } -> { "packId": "..." }
  candidate = mapOutsideStrings(candidate, (seg) =>
    seg.replace(/([{,\s])([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
  );

  // 3. Ajouter les virgules manquantes entre propriétés/éléments sur des lignes adjacentes
  candidate = candidate.replace(
    /("(?:\\.|[^"\\])*"|-?\d+(?:\.\d+)?|true|false|null|\}|\])\s*\n(\s*)("(?:\\.|[^"\\])*"\s*:|\{|\[)/g,
    "$1,\n$2$3"
  );

  // 4. Nettoyer à nouveau nombres C++ et virgules traînantes
  candidate = cleanCppNumbersAndTrailingCommas(candidate).text;

  // 5. Fermer les crochets/accolades manquants si la réponse IA a été tronquée
  const stack: string[] = [];
  let inString = false;
  let escaped = false;
  for (let i = 0; i < candidate.length; i++) {
    const ch = candidate[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
    } else if (ch === "{") {
      stack.push("}");
    } else if (ch === "[") {
      stack.push("]");
    } else if ((ch === "}" || ch === "]") && stack.length > 0) {
      if (stack[stack.length - 1] === ch) {
        stack.pop();
      }
    }
  }
  if (stack.length > 0) {
    candidate = candidate.replace(/,\s*$/, "");
    candidate += "\n" + stack.reverse().join("\n");
  }

  const secondPass = parseForgivingPackJSON(candidate);
  if (secondPass.ok) {
    return JSON.stringify(secondPass.data, null, 2);
  }
  return candidate;
}

/**
 * Valide en temps réel un JSON de Pack 3D (`Anarchy3DPack`) ou de scène 3D et retourne
 * le pack nettoyé avec la liste éventuelle des champs corrigés par fallback.
 */
export function validateAnarchy3DPackJson(
  rawText: string,
  authorFallback = "Anarchy Studio",
  customName?: string
):
  | {
      ok: true;
      pack: Anarchy3DPack;
      warnings: string[];
      repairs: string[];
    }
  | {
      ok: false;
      error: string;
      line: number | null;
      column: number | null;
      lineSnippet: string | null;
    } {
  const forgiving = parseForgivingPackJSON(rawText);
  if (!forgiving.ok) {
    return {
      ok: false,
      error: forgiving.error,
      line: forgiving.line,
      column: forgiving.column,
      lineSnippet: forgiving.lineSnippet,
    };
  }

  const parsed = forgiving.data;
  if (!parsed || typeof parsed !== "object") {
    return {
      ok: false,
      error: "La racine du JSON doit être un objet ou un tableau.",
      line: 1,
      column: 1,
      lineSnippet: null,
    };
  }

  const warnings: string[] = [];
  const obj = parsed as Record<string, unknown>;
  const packParams = !Array.isArray(parsed)
    ? sanitizeParams(obj.params)
    : undefined;
  const rawScenes = Array.isArray(parsed)
    ? parsed
    : Array.isArray(obj.scenes)
    ? obj.scenes
    : obj.environment || obj.subject || obj.camera || obj.layers
    ? [parsed]
    : null;

  if (!Array.isArray(rawScenes) || rawScenes.length === 0) {
    return {
      ok: false,
      error:
        'Le JSON doit contenir un tableau "scenes" non vide (ou une scène 3D).',
      line: 1,
      column: 1,
      lineSnippet: null,
    };
  }

  const scenes: Anarchy3DScene[] = rawScenes.slice(0, 24).map((rawSc, idx) => {
    if (rawSc && typeof rawSc === "object") {
      const scObj = rawSc as Record<string, unknown>;
      const env = (scObj.environment ?? {}) as Record<string, unknown>;
      const sub = (scObj.subject ?? {}) as Record<string, unknown>;
      const cam = (scObj.camera ?? {}) as Record<string, unknown>;
      const aud = (scObj.audioMapping ?? {}) as Record<string, unknown>;
      if (
        env.terrainType &&
        !TERRAIN_SET.has(env.terrainType as AnarchyTerrainType)
      ) {
        warnings.push(
          `Scène #${idx + 1} : terrainType "${String(env.terrainType)}" inconnu → repli sur "infinite_grid".`
        );
      }
      if (
        sub.meshType &&
        !SUBJECT_SET.has(sub.meshType as AnarchySubjectMeshType)
      ) {
        warnings.push(
          `Scène #${idx + 1} : meshType "${String(sub.meshType)}" inconnu → repli sur "voxel_runner".`
        );
      }
      if (Array.isArray(scObj.layers)) {
        for (const l of scObj.layers) {
          if (!l || typeof l !== "object") continue;
          const layer = l as Record<string, unknown>;
          if (
            layer.kind === "terrain" &&
            layer.terrain &&
            typeof layer.terrain === "object"
          ) {
            const t = (layer.terrain as Record<string, unknown>).type;
            if (t && !TERRAIN_SET.has(t as AnarchyTerrainType)) {
              warnings.push(
                `Scène #${idx + 1} : terrain.type "${String(t)}" inconnu → repli sur "infinite_grid".`
              );
            }
          } else if (
            layer.kind === "sideProps" &&
            layer.sideProps &&
            typeof layer.sideProps === "object"
          ) {
            const p = (layer.sideProps as Record<string, unknown>).type;
            if (p && !SIDE_PROP_SET.has(p as AnarchySidePropType)) {
              warnings.push(
                `Scène #${idx + 1} : sideProps.type "${String(p)}" inconnu → repli sur "none".`
              );
            }
          } else if (layer.kind === "subjects" && Array.isArray(layer.subjects)) {
            for (const sItem of layer.subjects) {
              if (!sItem || typeof sItem !== "object") continue;
              const sObj = sItem as Record<string, unknown>;
              if (
                sObj.meshType &&
                !SUBJECT_SET.has(sObj.meshType as AnarchySubjectMeshType)
              ) {
                warnings.push(
                  `Scène #${idx + 1} : subjects[].meshType "${String(sObj.meshType)}" inconnu → repli sur "voxel_runner".`
                );
              }
              if (Array.isArray(sObj.parts)) {
                for (const part of sObj.parts) {
                  if (!part || typeof part !== "object") continue;
                  const prim = (part as Record<string, unknown>).primitive;
                  if (prim && !PRIMITIVE_SET.has(prim as AnarchyProceduralPrimitive)) {
                    warnings.push(
                      `Scène #${idx + 1} : parts[].primitive "${String(prim)}" inconnu → repli sur "box".`
                    );
                  }
                }
              }
            }
          }
        }
      }
      if (cam.mode && !CAMERA_MODE_SET.has(cam.mode as AnarchyCameraMode)) {
        warnings.push(
          `Scène #${idx + 1} : camera.mode "${String(cam.mode)}" inconnu → repli sur "chase_low".`
        );
      }
      if (
        aud.bassTarget &&
        !BASS_TARGET_SET.has(aud.bassTarget as AnarchyBassTarget)
      ) {
        warnings.push(
          `Scène #${idx + 1} : bassTarget "${String(aud.bassTarget)}" inconnu → repli sur "camera_zoom_and_jump".`
        );
      }
      if (
        aud.midTarget &&
        !MID_TARGET_SET.has(aud.midTarget as AnarchyMidTarget)
      ) {
        warnings.push(
          `Scène #${idx + 1} : midTarget "${String(aud.midTarget)}" inconnu → repli sur "terrain_wave_height".`
        );
      }
      if (
        aud.trebleTarget &&
        !TREBLE_TARGET_SET.has(aud.trebleTarget as AnarchyTrebleTarget)
      ) {
        warnings.push(
          `Scène #${idx + 1} : trebleTarget "${String(aud.trebleTarget)}" inconnu → repli sur "particles_burst".`
        );
      }
      if (
        aud.fluxTarget &&
        !FLUX_TARGET_SET.has(aud.fluxTarget as AnarchyFluxTarget)
      ) {
        warnings.push(
          `Scène #${idx + 1} : fluxTarget "${String(aud.fluxTarget)}" inconnu → repli sur "glitch_and_emissive".`
        );
      }

      // Validation v3/v4 : params, animations, triggers & cloneurs
      const sceneParams = sanitizeParams(scObj.params);
      const mergedParams =
        packParams || sceneParams
          ? { ...(packParams ?? {}), ...(sceneParams ?? {}) }
          : undefined;
      const allowedParams = mergedParams
        ? new Set(Object.keys(mergedParams))
        : undefined;

      const checkAnimations = (anims: unknown, scope: string) => {
        if (!Array.isArray(anims)) return;
        anims.forEach((a, aIdx) => {
          if (!a || typeof a !== "object") return;
          const aObj = a as Record<string, unknown>;
          const target = aObj.target as Anarchy3DAnimationTarget;
          if (!ANIMATION_TARGET_SET.has(target)) {
            warnings.push(
              `Scène #${idx + 1} (${scope}.animations[${aIdx}]) : cible "${String(aObj.target)}" inconnue.`
            );
          }
          const expr = typeof aObj.expr === "string" ? aObj.expr : "";
          const check = validateMathExpression(expr, allowedParams);
          if (!check.ok) {
            warnings.push(
              `Scène #${idx + 1} (${scope}.animations[${aIdx}].expr) : ${check.error}`
            );
          }
        });
      };

      const checkTriggers = (trigs: unknown) => {
        if (!Array.isArray(trigs)) return;
        trigs.forEach((t, tIdx) => {
          if (!t || typeof t !== "object") return;
          const tObj = t as Record<string, unknown>;
          const action = tObj.action as Anarchy3DTriggerAction;
          if (!TRIGGER_ACTION_SET.has(action)) {
            warnings.push(
              `Scène #${idx + 1} (triggers[${tIdx}].action) : action "${String(tObj.action)}" inconnue.`
            );
          }
          const when = typeof tObj.when === "string" ? tObj.when : "";
          const check = validateMathExpression(when, allowedParams);
          if (!check.ok) {
            warnings.push(
              `Scène #${idx + 1} (triggers[${tIdx}].when) : ${check.error}`
            );
          }
        });
      };

      const checkCloner = (cloner: unknown, scope: string) => {
        if (!cloner || typeof cloner !== "object") return;
        const cObj = cloner as Record<string, unknown>;
        if (cObj.mode && !CLONER_MODE_SET.has(cObj.mode as AnarchyClonerMode)) {
          warnings.push(
            `Scène #${idx + 1} (${scope}.cloner.mode) : mode "${String(cObj.mode)}" inconnu → repli sur "linear".`
          );
        }
      };

      checkAnimations(scObj.animations, "scene");
      checkTriggers(scObj.triggers);
      const rawSubjList = Array.isArray(scObj.subjects)
        ? scObj.subjects
        : scObj.subject
        ? [scObj.subject]
        : [];
      rawSubjList.forEach((s, sIdx) => {
        if (!s || typeof s !== "object") return;
        const sRec = s as Record<string, unknown>;
        checkCloner(sRec.cloner, `subjects[${sIdx}]`);
        checkAnimations(sRec.animations, `subjects[${sIdx}]`);
        if (Array.isArray(sRec.parts)) {
          sRec.parts.forEach((p, pIdx) => {
            if (!p || typeof p !== "object") return;
            const pRec = p as Record<string, unknown>;
            checkCloner(pRec.cloner, `subjects[${sIdx}].parts[${pIdx}]`);
            checkAnimations(pRec.animations, `subjects[${sIdx}].parts[${pIdx}]`);
          });
        }
      });
    }
    const sanitized = sanitizeAnarchy3DScene(rawSc, idx, packParams);
    // Vérifier le plafond de 256 primitives/instances par scène
    const subjArr = sanitized.subjects ?? [sanitized.subject];
    let totalInstances = 0;
    for (const s of subjArr) {
      const sCount = s.cloner ? s.cloner.count : 1;
      if (s.meshType === "procedural_group" && s.parts?.length) {
        let pTotal = 0;
        for (const p of s.parts) {
          pTotal += p.cloner ? p.cloner.count : 1;
        }
        totalInstances += sCount * pTotal;
      } else {
        totalInstances += sCount;
      }
    }
    if (totalInstances > MAX_PRIMITIVES_PER_SCENE) {
      warnings.push(
        `Scène #${idx + 1} : ${totalInstances} instances clonées détectées → plafonné à ${MAX_PRIMITIVES_PER_SCENE} pour garantir 60 FPS.`
      );
    }
    return sanitized;
  });

  const rawPackId =
    !Array.isArray(parsed) && typeof obj.packId === "string" && obj.packId.trim()
      ? obj.packId.trim()
      : !Array.isArray(parsed) && typeof obj.id === "string" && obj.id.trim()
      ? obj.id.trim()
      : `pack-3d-${Date.now().toString().slice(-5)}`;

  const finalName =
    customName?.trim() ||
    (!Array.isArray(parsed) && typeof obj.name === "string" && obj.name.trim()
      ? obj.name.trim()
      : `Pack 3D (${scenes.length} Scènes)`);

  const finalAuthor =
    (!Array.isArray(parsed) && typeof obj.author === "string" && obj.author.trim()
      ? obj.author.trim()
      : "") || authorFallback;

  return {
    ok: true,
    warnings,
    repairs: forgiving.repairs,
    pack: {
      packId: rawPackId,
      name: finalName,
      author: finalAuthor,
      scenes,
      ...(packParams ? { params: packParams } : {}),
      bpm: Number(!Array.isArray(parsed) && obj.bpm) || 140,
      beatsPerScene: Number(!Array.isArray(parsed) && obj.beatsPerScene) || 16,
      seed:
        Number(!Array.isArray(parsed) && obj.seed) || Date.now() % 100000,
      createdAt: new Date().toISOString(),
    },
  };
}

/**
 * Parse un Pack 3D (`Anarchy3DPack`) depuis un texte JSON (ou bloc markdown ```json).
 */
export function parseScenePackFromText(
  raw: string,
  author = "Anarchy Studio",
  customName?: string
): Anarchy3DPack | null {
  const result = validateAnarchy3DPackJson(raw, author, customName);
  return result.ok ? result.pack : null;
}

/**
 * Exporte un Pack 3D au format JSON strict `Anarchy3DPack` ("Cartouche / Pack 3D v4").
 */
export function exportScenePackAsJson(pack: Anarchy3DPack): string {
  const cleanExport = {
    packId: pack.packId,
    name: pack.name,
    author: pack.author,
    ...(pack.params ? { params: pack.params } : {}),
    ...(pack.bpm ? { bpm: pack.bpm } : {}),
    ...(pack.beatsPerScene ? { beatsPerScene: pack.beatsPerScene } : {}),
    scenes: pack.scenes.map((sc, idx) => ({
      id: sc.id || `scene-${idx + 1}`,
      name: sc.name || `0${idx + 1}. Scène 3D`,
      version: sc.version ?? 2,
      environment: {
        skyColor: sc.environment.skyColor,
        fogColor: sc.environment.fogColor,
        fogDensity: sc.environment.fogDensity,
        terrainType: sc.environment.terrainType,
        terrainSpeed: sc.environment.terrainSpeed,
        terrainPrimaryColor: sc.environment.terrainPrimaryColor,
        terrainSecondaryColor: sc.environment.terrainSecondaryColor,
      },
      subject: {
        meshType: sc.subject.meshType,
        primaryColor: sc.subject.primaryColor,
        accentColor: sc.subject.accentColor,
        wireframeOverlay: sc.subject.wireframeOverlay,
        scale: sc.subject.scale,
        ...(sc.subject.position ? { position: sc.subject.position } : {}),
        ...(sc.subject.rotation ? { rotation: sc.subject.rotation } : {}),
        ...(sc.subject.cloner ? { cloner: sc.subject.cloner } : {}),
        ...(sc.subject.animations ? { animations: sc.subject.animations } : {}),
        ...(sc.subject.parts ? { parts: sc.subject.parts } : {}),
      },
      ...(sc.layers ? { layers: sc.layers } : {}),
      ...(sc.postFx ? { postFx: sc.postFx } : {}),
      ...(sc.animations ? { animations: sc.animations } : {}),
      ...(sc.params ? { params: sc.params } : {}),
      ...(sc.triggers ? { triggers: sc.triggers } : {}),
      camera: {
        mode: sc.camera.mode,
        fov: sc.camera.fov,
        shakeIntensity: sc.camera.shakeIntensity,
      },
      audioMapping: {
        bassTarget: sc.audioMapping.bassTarget,
        midTarget: sc.audioMapping.midTarget,
        trebleTarget: sc.audioMapping.trebleTarget,
        fluxTarget: sc.audioMapping.fluxTarget,
      },
    })),
  };
  return JSON.stringify(cleanExport, null, 2);
}

export const AI_SCENE_PACK_PROMPT = generateAiPackPromptFromRegistry();

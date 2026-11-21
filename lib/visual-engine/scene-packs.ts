import type {
  Anarchy3DActor,
  Anarchy3DActorPhysics,
  Anarchy3DAnimation,
  Anarchy3DAnimationTarget,
  Anarchy3DAudioImpulse,
  Anarchy3DAudioMapping,
  Anarchy3DAudioModulation,
  Anarchy3DBackdropLayer,
  Anarchy3DBackdropShaderConfig,
  Anarchy3DCamera,
  Anarchy3DCameraCut,
  Anarchy3DCartoonPhysics,
  Anarchy3DCloner,
  Anarchy3DEnvironment,
  Anarchy3DGenerator,
  Anarchy3DLayer,
  Anarchy3DLfoModulator,
  Anarchy3DMorphTransition,
  Anarchy3DPack,
  Anarchy3DPackV3,
  Anarchy3DPackV4,
  Anarchy3DPackV5,
  Anarchy3DPackV6,
  Anarchy3DPackV7,
  Anarchy3DPhysicsBounds,
  Anarchy3DPhysicsJoint,
  Anarchy3DPhysicsWorld,
  Anarchy3DPostFx,
  Anarchy3DPostFxStep,
  Anarchy3DRenderStyle,
  Anarchy3DScene,
  Anarchy3DSceneAutomation,
  Anarchy3DSceneV3,
  Anarchy3DSceneV4,
  Anarchy3DSceneV5,
  Anarchy3DSceneV6,
  Anarchy3DSceneV7,
  Anarchy3DSidePropsLayer,
  Anarchy3DSubject,
  Anarchy3DTerrainLayer,
  Anarchy3DTrigger,
  Anarchy3DTriggerAction,
  AnarchyActorType,
  AnarchyBackdropShader,
  AnarchyBassTarget,
  AnarchyCameraCutTransition,
  AnarchyCameraMode,
  AnarchyCameraRig,
  AnarchyClonerMode,
  AnarchyCompositionMode,
  AnarchyFluxTarget,
  AnarchyGeneratorType,
  AnarchyLfoRateBeats,
  AnarchyLfoWaveform,
  AnarchyMaterialOverride,
  AnarchyMidTarget,
  AnarchyModulationSource,
  AnarchyModulationTarget,
  AnarchyMorphEasing,
  AnarchyParallaxPattern,
  AnarchyParticleBehavior,
  AnarchyPhysicsBodyType,
  AnarchyPhysicsBoundsShape,
  AnarchyPhysicsImpulseSource,
  AnarchyPhysicsJointType,
  AnarchyPhysicsSpawnShape,
  AnarchyPostFxStackType,
  AnarchyProceduralPart,
  AnarchyProceduralPrimitive,
  AnarchyRubberHoseShape,
  AnarchySceneTransitionType,
  AnarchyShadingMode,
  AnarchySidePropType,
  AnarchySteppedFps,
  AnarchyStudioLightingPreset,
  AnarchySubjectMeshType,
  AnarchySwarmBehavior,
  AnarchySwarmShapeTarget,
  AnarchyTerrainType,
  AnarchyToneMapping,
  AnarchyTrebleTarget,
  AnarchyV4BackdropType,
  AnarchyVintageColorGrade,
  PaletteId,
  SceneId,
} from "@/lib/visual-engine/contracts";
import { PALETTE_IDS, SCENE_IDS } from "@/lib/visual-engine/presets";
import { buildFictionalUniversePacks } from "@/lib/visual-engine/fictional-packs";
import { validateMathExpression } from "@/lib/visual-studio/math-expr";
import {
  ACTOR_TYPE_REGISTRY,
  AI_STYLE_PRESETS,
  BACKDROP_SHADER_REGISTRY,
  BASS_TARGET_REGISTRY,
  CAMERA_CUT_TRANSITION_REGISTRY,
  CAMERA_MODE_REGISTRY,
  CAMERA_RIG_REGISTRY,
  CLONER_MODE_REGISTRY,
  COMPOSITION_MODE_REGISTRY,
  EXTENDED_BARS_OPTIONS,
  FLUX_TARGET_REGISTRY,
  GENERATOR_TYPE_REGISTRY,
  JSON_SNIPPETS_3D,
  LFO_RATE_BEATS_OPTIONS,
  LFO_WAVEFORM_REGISTRY,
  MATERIAL_OVERRIDE_REGISTRY,
  MID_TARGET_REGISTRY,
  MODULATION_SOURCE_REGISTRY,
  MODULATION_TARGET_REGISTRY,
  MORPH_EASING_REGISTRY,
  PARALLAX_PATTERN_REGISTRY,
  PARTICLE_BEHAVIOR_REGISTRY,
  PHYSICS_BODY_TYPE_REGISTRY,
  PHYSICS_BOUNDS_SHAPE_REGISTRY,
  PHYSICS_IMPULSE_SOURCE_REGISTRY,
  PHYSICS_JOINT_TYPE_REGISTRY,
  PHYSICS_SPAWN_SHAPE_REGISTRY,
  POST_FX_STACK_TYPE_REGISTRY,
  PROCEDURAL_PRIMITIVE_REGISTRY,
  RUBBER_HOSE_SHAPE_REGISTRY,
  SCENE_TRANSITION_REGISTRY,
  SHADING_MODE_REGISTRY,
  SIDE_PROPS_REGISTRY,
  STEPPED_FPS_OPTIONS,
  STUDIO_LIGHTING_PRESET_REGISTRY,
  SUBJECT_MESH_REGISTRY,
  SWARM_BEHAVIOR_REGISTRY,
  SWARM_SHAPE_TARGET_REGISTRY,
  TERRAIN_REGISTRY,
  TONE_MAPPING_REGISTRY,
  TREBLE_TARGET_REGISTRY,
  TRIGGER_ACTION_REGISTRY,
  V4_BACKDROP_TYPE_REGISTRY,
  VINTAGE_COLOR_GRADE_REGISTRY,
  generateAiPackPromptFromRegistry,
  generateAiPackPromptV3,
  generateAiPackPromptV4,
  generateAiPackPromptV5,
  generateAiPackPromptV6,
  generateAiPackPromptV7,
} from "@/lib/visual-studio/registry";

export type {
  Anarchy3DPack,
  Anarchy3DPackV3,
  Anarchy3DPackV4,
  Anarchy3DPackV5,
  Anarchy3DPackV6,
  Anarchy3DPackV7,
  Anarchy3DScene,
  Anarchy3DSceneV3,
  Anarchy3DSceneV4,
  Anarchy3DSceneV5,
  Anarchy3DSceneV6,
  Anarchy3DSceneV7,
  Anarchy3DEnvironment,
  Anarchy3DSubject,
  Anarchy3DActor,
  Anarchy3DActorPhysics,
  Anarchy3DAudioImpulse,
  Anarchy3DPhysicsWorld,
  Anarchy3DPhysicsBounds,
  Anarchy3DPhysicsJoint,
  Anarchy3DCartoonPhysics,
  Anarchy3DMorphTransition,
  Anarchy3DSceneAutomation,
  Anarchy3DLfoModulator,
  Anarchy3DCameraCut,
  Anarchy3DAudioModulation,
  Anarchy3DPostFxStep,
  Anarchy3DCamera,
  Anarchy3DAudioMapping,
  Anarchy3DLayer,
  Anarchy3DBackdropLayer,
  Anarchy3DBackdropShaderConfig,
  Anarchy3DTerrainLayer,
  Anarchy3DSidePropsLayer,
  Anarchy3DPostFx,
  Anarchy3DRenderStyle,
  Anarchy3DGenerator,
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
  EXTENDED_BARS_OPTIONS,
  STEPPED_FPS_OPTIONS,
  LFO_RATE_BEATS_OPTIONS,
  generateAiPackPromptV3,
  generateAiPackPromptV4,
  generateAiPackPromptV5,
  generateAiPackPromptV6,
  generateAiPackPromptV7,
};

export type ScenePackSlot = Anarchy3DScene;
export type ScenePack = Anarchy3DPack;

export const MAX_PRIMITIVES_PER_SCENE = 256;

export const ANARCHY_TERRAIN_TYPES = TERRAIN_REGISTRY;
export const ANARCHY_SIDE_PROP_TYPES = SIDE_PROPS_REGISTRY;
export const ANARCHY_SUBJECT_MESH_TYPES = SUBJECT_MESH_REGISTRY;
export const ANARCHY_PROCEDURAL_PRIMITIVES = PROCEDURAL_PRIMITIVE_REGISTRY;
export const ANARCHY_CAMERA_MODES = CAMERA_MODE_REGISTRY;
export const ANARCHY_CAMERA_RIGS = CAMERA_RIG_REGISTRY;
export const ANARCHY_SHADING_MODES = SHADING_MODE_REGISTRY;
export const ANARCHY_COMPOSITION_MODES = COMPOSITION_MODE_REGISTRY;
export const ANARCHY_GENERATOR_TYPES = GENERATOR_TYPE_REGISTRY;
export const ANARCHY_PARTICLE_BEHAVIORS = PARTICLE_BEHAVIOR_REGISTRY;
export const ANARCHY_BACKDROP_SHADERS = BACKDROP_SHADER_REGISTRY;
export const ANARCHY_STUDIO_LIGHTING_PRESETS = STUDIO_LIGHTING_PRESET_REGISTRY;
export const ANARCHY_V4_BACKDROP_TYPES = V4_BACKDROP_TYPE_REGISTRY;
export const ANARCHY_TONE_MAPPINGS = TONE_MAPPING_REGISTRY;
export const ANARCHY_ACTOR_TYPES = ACTOR_TYPE_REGISTRY;
export const ANARCHY_RUBBER_HOSE_SHAPES = RUBBER_HOSE_SHAPE_REGISTRY;
export const ANARCHY_PARALLAX_PATTERNS = PARALLAX_PATTERN_REGISTRY;
export const ANARCHY_VINTAGE_COLOR_GRADES = VINTAGE_COLOR_GRADE_REGISTRY;
export const ANARCHY_MORPH_EASINGS = MORPH_EASING_REGISTRY;
export const ANARCHY_SWARM_SHAPE_TARGETS = SWARM_SHAPE_TARGET_REGISTRY;
export const ANARCHY_LFO_WAVEFORMS = LFO_WAVEFORM_REGISTRY;
export const ANARCHY_CAMERA_CUT_TRANSITIONS = CAMERA_CUT_TRANSITION_REGISTRY;
export const ANARCHY_PHYSICS_BOUNDS_SHAPES = PHYSICS_BOUNDS_SHAPE_REGISTRY;
export const ANARCHY_PHYSICS_BODY_TYPES = PHYSICS_BODY_TYPE_REGISTRY;
export const ANARCHY_PHYSICS_IMPULSE_SOURCES = PHYSICS_IMPULSE_SOURCE_REGISTRY;
export const ANARCHY_PHYSICS_JOINT_TYPES = PHYSICS_JOINT_TYPE_REGISTRY;
export const ANARCHY_PHYSICS_SPAWN_SHAPES = PHYSICS_SPAWN_SHAPE_REGISTRY;
export const ANARCHY_SWARM_BEHAVIORS = SWARM_BEHAVIOR_REGISTRY;
export const ANARCHY_MATERIAL_OVERRIDES = MATERIAL_OVERRIDE_REGISTRY;
export const ANARCHY_MODULATION_TARGETS = MODULATION_TARGET_REGISTRY;
export const ANARCHY_POST_FX_STACK_TYPES = POST_FX_STACK_TYPE_REGISTRY;
export const ANARCHY_SCENE_TRANSITIONS = SCENE_TRANSITION_REGISTRY;
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

const STUDIO_LIGHTING_SET = new Set<AnarchyStudioLightingPreset>(
  STUDIO_LIGHTING_PRESET_REGISTRY.map((x) => x.value)
);
const V4_BACKDROP_SET = new Set<AnarchyV4BackdropType>(
  V4_BACKDROP_TYPE_REGISTRY.map((x) => x.value)
);
const TONE_MAPPING_SET = new Set<AnarchyToneMapping>(
  TONE_MAPPING_REGISTRY.map((x) => x.value)
);
const ACTOR_TYPE_SET = new Set<AnarchyActorType>(
  ACTOR_TYPE_REGISTRY.map((x) => x.value)
);
const RUBBER_HOSE_SHAPE_SET = new Set<AnarchyRubberHoseShape>(
  RUBBER_HOSE_SHAPE_REGISTRY.map((x) => x.value)
);
const PARALLAX_PATTERN_SET = new Set<AnarchyParallaxPattern>(
  PARALLAX_PATTERN_REGISTRY.map((x) => x.value)
);
const VINTAGE_COLOR_GRADE_SET = new Set<AnarchyVintageColorGrade>(
  VINTAGE_COLOR_GRADE_REGISTRY.map((x) => x.value)
);
const MORPH_EASING_SET = new Set<AnarchyMorphEasing>(
  MORPH_EASING_REGISTRY.map((x) => x.value)
);
const SWARM_SHAPE_TARGET_SET = new Set<AnarchySwarmShapeTarget>(
  SWARM_SHAPE_TARGET_REGISTRY.map((x) => x.value)
);
const LFO_WAVEFORM_SET = new Set<AnarchyLfoWaveform>(
  LFO_WAVEFORM_REGISTRY.map((x) => x.value)
);
const CAMERA_CUT_TRANSITION_SET = new Set<AnarchyCameraCutTransition>(
  CAMERA_CUT_TRANSITION_REGISTRY.map((x) => x.value)
);
const PHYSICS_BOUNDS_SHAPE_SET = new Set<AnarchyPhysicsBoundsShape>(
  PHYSICS_BOUNDS_SHAPE_REGISTRY.map((x) => x.value)
);
const PHYSICS_BODY_TYPE_SET = new Set<AnarchyPhysicsBodyType>(
  PHYSICS_BODY_TYPE_REGISTRY.map((x) => x.value)
);
const PHYSICS_IMPULSE_SOURCE_SET = new Set<AnarchyPhysicsImpulseSource>(
  PHYSICS_IMPULSE_SOURCE_REGISTRY.map((x) => x.value)
);
const PHYSICS_JOINT_TYPE_SET = new Set<AnarchyPhysicsJointType>(
  PHYSICS_JOINT_TYPE_REGISTRY.map((x) => x.value)
);
const PHYSICS_SPAWN_SHAPE_SET = new Set<AnarchyPhysicsSpawnShape>(
  PHYSICS_SPAWN_SHAPE_REGISTRY.map((x) => x.value)
);
const SWARM_BEHAVIOR_SET = new Set<AnarchySwarmBehavior>(
  SWARM_BEHAVIOR_REGISTRY.map((x) => x.value)
);
const MATERIAL_OVERRIDE_SET = new Set<AnarchyMaterialOverride>(
  MATERIAL_OVERRIDE_REGISTRY.map((x) => x.value)
);
const MODULATION_SOURCE_SET = new Set<AnarchyModulationSource>(
  MODULATION_SOURCE_REGISTRY
);
const MODULATION_TARGET_SET = new Set<AnarchyModulationTarget>(
  MODULATION_TARGET_REGISTRY.map((x) => x.value)
);
const POST_FX_STACK_SET = new Set<AnarchyPostFxStackType>(
  POST_FX_STACK_TYPE_REGISTRY.map((x) => x.value)
);
const SCENE_TRANSITION_SET = new Set<AnarchySceneTransitionType>(
  SCENE_TRANSITION_REGISTRY.map((x) => x.value)
);

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
const CAMERA_RIG_SET = new Set<AnarchyCameraRig>(
  CAMERA_RIG_REGISTRY.map((r) => r.value)
);
const SHADING_SET = new Set<AnarchyShadingMode>(
  SHADING_MODE_REGISTRY.map((s) => s.value)
);
const COMPOSITION_SET = new Set<AnarchyCompositionMode>(
  COMPOSITION_MODE_REGISTRY.map((c) => c.value)
);
const GENERATOR_TYPE_SET = new Set<AnarchyGeneratorType>(
  GENERATOR_TYPE_REGISTRY.map((g) => g.value)
);
const PARTICLE_BEHAVIOR_SET = new Set<AnarchyParticleBehavior>(
  PARTICLE_BEHAVIOR_REGISTRY.map((b) => b.value)
);
const BACKDROP_SHADER_SET = new Set<AnarchyBackdropShader>(
  BACKDROP_SHADER_REGISTRY.map((b) => b.value)
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
    ...(overrides?.backdrop?.shader ? { shader: overrides.backdrop.shader } : {}),
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
    version?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    renderStyle?: Anarchy3DRenderStyle;
    compositionMode?: AnarchyCompositionMode;
    kaleidoAxes?: number;
    generators?: Anarchy3DGenerator[];
    actors?: Anarchy3DActor[];
    cartoonPhysics?: Anarchy3DCartoonPhysics;
    physicsWorld?: Anarchy3DPhysicsWorld;
    joints?: Anarchy3DPhysicsJoint[];
    morphTransition?: Anarchy3DMorphTransition;
    automations?: Anarchy3DSceneAutomation[];
    modulators?: Anarchy3DLfoModulator[];
    cameraCuts?: Anarchy3DCameraCut[];
    postFX?: Anarchy3DPostFxStep[];
    durationBars?: number;
    transition?: AnarchySceneTransitionType;
    environment?: Partial<Anarchy3DEnvironment>;
    subject?: Partial<Anarchy3DSubject>;
    subjects?: Anarchy3DSubject[];
    layers?: Anarchy3DLayer[];
    postFx?: Partial<Anarchy3DPostFx>;
    animations?: Anarchy3DAnimation[];
    params?: Record<string, number>;
    triggers?: Anarchy3DTrigger[];
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
    ...(overrides?.renderStyle ? { renderStyle: overrides.renderStyle } : {}),
    ...(overrides?.compositionMode ? { compositionMode: overrides.compositionMode } : {}),
    ...(overrides?.kaleidoAxes !== undefined ? { kaleidoAxes: overrides.kaleidoAxes } : {}),
    ...(overrides?.generators ? { generators: overrides.generators } : {}),
    ...(overrides?.actors ? { actors: overrides.actors } : {}),
    ...(overrides?.cartoonPhysics ? { cartoonPhysics: overrides.cartoonPhysics } : {}),
    ...(overrides?.physicsWorld ? { physicsWorld: overrides.physicsWorld } : {}),
    ...(overrides?.joints ? { joints: overrides.joints } : {}),
    ...(overrides?.morphTransition ? { morphTransition: overrides.morphTransition } : {}),
    ...(overrides?.automations ? { automations: overrides.automations } : {}),
    ...(overrides?.modulators ? { modulators: overrides.modulators } : {}),
    ...(overrides?.cameraCuts ? { cameraCuts: overrides.cameraCuts } : {}),
    ...(overrides?.postFX ? { postFX: overrides.postFX } : {}),
    ...(overrides?.durationBars !== undefined ? { durationBars: overrides.durationBars } : {}),
    ...(overrides?.transition ? { transition: overrides.transition } : {}),
    environment,
    subject: subjects[0] ?? subject,
    subjects,
    layers,
    postFx,
    ...(overrides?.animations ? { animations: overrides.animations } : {}),
    ...(overrides?.params ? { params: overrides.params } : {}),
    ...(overrides?.triggers ? { triggers: overrides.triggers } : {}),
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
  {
    packId: "phantom-of-the-paradise-v4",
    name: "Phantom // Paradise Opera (v4)",
    author: "Anarchy Studio",
    bpm: 132,
    beatsPerScene: 16,
    seed: 197401,
    createdAt: "2026-11-21T01:00:00.000Z",
    params: { operaSpeed: 1.8, dramaAmp: 0.75 },
    scenes: [
      createDefaultAnarchy3DScene(0, {
        id: "scene-1",
        name: "01. Death Records Press",
        version: 4,
        sceneId: "rave-dungeon",
        paletteId: "blood-red",
        seed: 19741,
        params: { operaSpeed: 1.8, pressDepth: 0.85 },
        triggers: [
          { when: "gt(bass, 0.72)", action: "emissive_surge", intensity: 1.3 },
          { when: "gt(flux, 0.65)", action: "boost_fov", intensity: 0.8 },
        ],
        animations: [
          { target: "fov", expr: "74 + pulse(beat, 0.28) * bass * 10" },
        ],
        environment: {
          skyColor: "#140308",
          fogColor: "#2E0712",
          fogDensity: 0.052,
          terrainType: "dojo_pillars",
          terrainSpeed: 12.5,
          terrainPrimaryColor: "#D4AF37",
          terrainSecondaryColor: "#E11D48",
        },
        backdrop: {
          skyGradient: ["#140308", "#3B0718"],
          horizonSun: {
            enabled: true,
            colorTop: "#FACC15",
            colorBottom: "#E11D48",
            stripes: 8,
            size: 1.2,
          },
          starfield: { enabled: true, density: 0.45, color: "#FDE047" },
        },
        sideProps: {
          type: "cyber_towers",
          density: 0.75,
          primaryColor: "#1F1218",
          secondaryColor: "#E11D48",
        },
        subject: {
          meshType: "procedural_group",
          primaryColor: "#1F2937",
          accentColor: "#E11D48",
          wireframeOverlay: true,
          scale: 1.1,
          position: [0, -0.1, -0.8],
          parts: [
            // Vinyle Death Records en rotation
            {
              primitive: "ring",
              position: [0, -0.35, 0],
              rotation: [1.35, 0, 0],
              scale: [1.65, 1.65, 0.25],
              color: "#111827",
              emissive: false,
              wireframe: true,
              animations: [
                { target: "rot.z", expr: "t * operaSpeed * 1.6" },
              ],
            },
            // Macaron rouge sang du vinyle
            {
              primitive: "cylinder",
              position: [0, -0.32, 0],
              rotation: [1.35, 0, 0],
              scale: [0.55, 0.55, 0.28],
              color: "#E11D48",
              emissive: true,
              wireframe: true,
              animations: [
                { target: "rot.z", expr: "t * operaSpeed * 1.6" },
              ],
            },
            // Mâchoire supérieure de la presse hydraulique
            {
              primitive: "box",
              position: [0, 0.95, 0],
              rotation: [0, 0, 0],
              scale: [2.1, 0.42, 1.5],
              color: "#94A3B8",
              emissive: false,
              wireframe: true,
              animations: [
                { target: "pos.y", expr: "mix(0.95, 0.05, pulse(beat, 0.35) * pressDepth)" },
              ],
            },
            // Colonnes de guidage de la presse (cloneur linéaire)
            {
              primitive: "box",
              position: [-1.15, 0.35, 0],
              rotation: [0, 0, 0],
              scale: [0.22, 1.9, 0.22],
              color: "#D4AF37",
              emissive: true,
              wireframe: true,
              cloner: {
                mode: "linear",
                count: 2,
                offset: [2.3, 0, 0],
              },
            },
          ],
        },
        postFx: {
          ps1VertexJitter: 0.25,
          crtScanlines: 0.35,
          chromaticAberration: 0.35,
          kaleidoscopeSegments: 0,
          bloomIntensity: 0.95,
        },
        camera: { mode: "dramatic_tilt", fov: 74, shakeIntensity: 0.5 },
        audioMapping: {
          bassTarget: "pillar_slam",
          midTarget: "subject_rotation",
          trebleTarget: "wireframe_glow",
          fluxTarget: "glitch_and_emissive",
        },
      }),
      createDefaultAnarchy3DScene(1, {
        id: "scene-2",
        name: "02. Silver Owl Mask",
        version: 4,
        sceneId: "techno-therapy",
        paletteId: "anarchy-anaglyph",
        seed: 19742,
        params: { operaSpeed: 1.5, haloRadius: 1.95 },
        triggers: [
          { when: "gt(bass, 0.7)", action: "boost_fov", intensity: 1.0 },
          { when: "gt(treble, 0.68)", action: "flash_sky", intensity: 0.9 },
        ],
        environment: {
          skyColor: "#070812",
          fogColor: "#1B0B2E",
          fogDensity: 0.038,
          terrainType: "mirror_floor",
          terrainSpeed: 10.5,
          terrainPrimaryColor: "#E2E8F0",
          terrainSecondaryColor: "#E11D48",
        },
        backdrop: {
          skyGradient: ["#070812", "#2A0B3B"],
          starfield: { enabled: true, density: 0.8, color: "#E2E8F0" },
        },
        sideProps: {
          type: "neon_arches",
          density: 0.7,
          primaryColor: "#E2E8F0",
          secondaryColor: "#E11D48",
        },
        subject: {
          meshType: "procedural_group",
          primaryColor: "#CBD5E1",
          accentColor: "#E11D48",
          wireframeOverlay: true,
          scale: 1.15,
          position: [0, 0.1, -0.7],
          animations: [
            { target: "rot.y", expr: "sin(t * 0.8) * 0.45" },
            { target: "pos.y", expr: "0.1 + sin(t * 2.0) * 0.12 + bass * 0.18" },
          ],
          parts: [
            // Crâne argenté du masque de Winslow
            {
              primitive: "icosahedron",
              position: [0, 0.25, 0],
              rotation: [0, 0, 0],
              scale: [1.05, 1.25, 0.85],
              color: "#E2E8F0",
              emissive: false,
              wireframe: true,
            },
            // Bec pointu du casque hibou
            {
              primitive: "pyramid",
              position: [0, -0.05, -0.58],
              rotation: [-1.45, 0, 0],
              scale: [0.35, 0.75, 0.35],
              color: "#94A3B8",
              emissive: false,
              wireframe: true,
            },
            // Orbites incandescentes (cloneur 2 yeux)
            {
              primitive: "ring",
              position: [-0.32, 0.35, -0.48],
              rotation: [0, 0, 0],
              scale: [0.32, 0.24, 0.15],
              color: "#E11D48",
              emissive: true,
              wireframe: true,
              cloner: {
                mode: "linear",
                count: 2,
                offset: [0.64, 0, 0],
              },
              animations: [
                { target: "scale", expr: "1 + treble * 0.45" },
              ],
            },
            // Couronne radiale de plumes/lames d'argent
            {
              primitive: "wedge",
              position: [0, 0.2, 0.25],
              rotation: [0, 0, 0],
              scale: [0.22, 0.65, 0.22],
              color: "#F8FAFC",
              emissive: true,
              wireframe: true,
              cloner: {
                mode: "radial",
                count: 12,
                offset: [1.65, 0, 0],
                stepRotation: [0, 30, 15],
              },
              animations: [
                { target: "pos.y", expr: "mix(-0.25, 0.75, pulse(beat + u, 0.35)) * (0.5 + bass)" },
                { target: "rot.z", expr: "t * operaSpeed + u * tau" },
              ],
            },
          ],
        },
        postFx: {
          ps1VertexJitter: 0.12,
          crtScanlines: 0.22,
          chromaticAberration: 0.4,
          kaleidoscopeSegments: 0,
          bloomIntensity: 1.15,
        },
        camera: { mode: "orbit", fov: 76, shakeIntensity: 0.35 },
        audioMapping: {
          bassTarget: "subject_pulse",
          midTarget: "camera_sway",
          trebleTarget: "wireframe_glow",
          fluxTarget: "glitch_and_emissive",
        },
      }),
      createDefaultAnarchy3DScene(2, {
        id: "scene-3",
        name: "03. Faustian Synth Organ",
        version: 4,
        sceneId: "industrial-city",
        paletteId: "furnace-amber",
        seed: 19743,
        params: { operaSpeed: 2.2, organScale: 1.1 },
        triggers: [
          { when: "gt(mid, 0.65)", action: "emissive_surge", intensity: 1.1 },
        ],
        environment: {
          skyColor: "#0D0414",
          fogColor: "#240B36",
          fogDensity: 0.044,
          terrainType: "infinite_grid",
          terrainSpeed: 11.0,
          terrainPrimaryColor: "#D4AF37",
          terrainSecondaryColor: "#A855F7",
        },
        backdrop: {
          skyGradient: ["#0D0414", "#310E4A"],
          horizonSun: {
            enabled: true,
            colorTop: "#FDE047",
            colorBottom: "#A855F7",
            stripes: 5,
            size: 1.0,
          },
          starfield: { enabled: true, density: 0.6, color: "#FDE047" },
        },
        sideProps: {
          type: "dojo_pillars",
          density: 0.7,
          primaryColor: "#D4AF37",
          secondaryColor: "#A855F7",
        },
        subject: {
          meshType: "procedural_group",
          primaryColor: "#1E1B4B",
          accentColor: "#FACC15",
          wireframeOverlay: true,
          scale: 1.0,
          position: [0, -0.35, -1.2],
          parts: [
            // 14 tuyaux d'orgue synthétiseur alignés réactifs par spectre
            {
              primitive: "box",
              position: [-2.6, 0.4, -0.5],
              rotation: [0, 0, 0],
              scale: [0.24, 1.2, 0.24],
              color: "#D4AF37",
              emissive: true,
              wireframe: true,
              cloner: {
                mode: "linear",
                count: 14,
                offset: [0.4, 0, 0],
              },
              animations: [
                { target: "scale.y", expr: "0.7 + abs(sin(t * operaSpeed + u * pi * 3)) * (0.8 + bass * 1.4)" },
                { target: "pos.y", expr: "0.2 + sin(u * pi) * 0.45 + bass * 0.3" },
              ],
            },
            // Clavier du synthé géant
            {
              primitive: "box",
              position: [0, -0.3, 0.45],
              rotation: [0.22, 0, 0],
              scale: [3.2, 0.22, 0.95],
              color: "#F8FAFC",
              emissive: false,
              wireframe: true,
            },
            // Noyau faustien au sommet de l'orgue
            {
              primitive: "icosahedron",
              position: [0, 1.35, -0.2],
              rotation: [0, 0, 0],
              scale: [0.7, 0.95, 0.7],
              color: "#A855F7",
              emissive: true,
              wireframe: true,
              animations: [
                { target: "rot.y", expr: "t * 1.5 + beat * 0.5" },
                { target: "scale", expr: "0.85 + mid * 0.55" },
              ],
            },
          ],
        },
        postFx: {
          ps1VertexJitter: 0.15,
          crtScanlines: 0.3,
          chromaticAberration: 0.28,
          kaleidoscopeSegments: 0,
          bloomIntensity: 1.05,
        },
        camera: { mode: "chase_low", fov: 78, shakeIntensity: 0.38 },
        audioMapping: {
          bassTarget: "camera_zoom_and_jump",
          midTarget: "terrain_wave_height",
          trebleTarget: "particles_burst",
          fluxTarget: "glitch_and_emissive",
        },
      }),
      createDefaultAnarchy3DScene(3, {
        id: "scene-4",
        name: "04. The Undeads Stage",
        version: 4,
        sceneId: "ps1-nightmare",
        paletteId: "techno-therapy",
        seed: 19744,
        params: { operaSpeed: 2.6 },
        triggers: [
          { when: "gt(flux, 0.58)", action: "spin_burst", intensity: 1.2 },
          { when: "gt(bass, 0.75)", action: "boost_fov", intensity: 0.9 },
        ],
        environment: {
          skyColor: "#090218",
          fogColor: "#3B0764",
          fogDensity: 0.04,
          terrainType: "neon_highway",
          terrainSpeed: 16.5,
          terrainPrimaryColor: "#FACC15",
          terrainSecondaryColor: "#EC4899",
        },
        backdrop: {
          skyGradient: ["#090218", "#4C1D95"],
          horizonSun: {
            enabled: true,
            colorTop: "#FDE047",
            colorBottom: "#EC4899",
            stripes: 7,
            size: 1.25,
          },
          starfield: { enabled: true, density: 0.75, color: "#00F0FF" },
        },
        sideProps: {
          type: "neon_arches",
          density: 0.85,
          primaryColor: "#FACC15",
          secondaryColor: "#EC4899",
        },
        subjects: [
          {
            meshType: "cyber_katana",
            primaryColor: "#1E1B4B",
            accentColor: "#FACC15",
            wireframeOverlay: true,
            scale: 1.15,
            position: [0, 0.15, 0],
            animations: [
              { target: "rot.z", expr: "sin(t * 2.4) * 0.25 + beat * 0.4" },
            ],
          },
          {
            meshType: "procedural_group",
            primaryColor: "#4C1D95",
            accentColor: "#EC4899",
            wireframeOverlay: true,
            scale: 0.85,
            position: [0, 0, -1.6],
            parts: [
              {
                primitive: "torus",
                position: [0, 0.2, 0],
                rotation: [0, 0, 0],
                scale: [1.5, 1.5, 0.3],
                color: "#EC4899",
                emissive: true,
                wireframe: true,
                cloner: {
                  mode: "spiral",
                  count: 10,
                  offset: [0.35, 0.1, -0.65],
                  stepRotation: [0, 0, 24],
                  stepScale: [0.95, 0.95, 0.95],
                },
                animations: [
                  { target: "rot.z", expr: "t * operaSpeed + u * tau" },
                  { target: "scale", expr: "1 + bass * 0.3" },
                ],
              },
            ],
          },
        ],
        postFx: {
          ps1VertexJitter: 0.2,
          crtScanlines: 0.35,
          chromaticAberration: 0.42,
          kaleidoscopeSegments: 0,
          bloomIntensity: 1.2,
        },
        camera: { mode: "chase_low", fov: 82, shakeIntensity: 0.48 },
        audioMapping: {
          bassTarget: "tunnel_boost",
          midTarget: "subject_rotation",
          trebleTarget: "katana_slash",
          fluxTarget: "fov_kick",
        },
      }),
      createDefaultAnarchy3DScene(4, {
        id: "scene-5",
        name: "05. Swan's Blood Finale",
        version: 4,
        sceneId: "techno-therapy",
        paletteId: "blood-red",
        seed: 19745,
        params: { operaSpeed: 3.0 },
        triggers: [
          { when: "gt(bass, 0.7)", action: "flash_sky", intensity: 1.2 },
          { when: "gt(flux, 0.6)", action: "emissive_surge", intensity: 1.5 },
        ],
        animations: [
          { target: "fov", expr: "80 + sin(t * 4) * 6 + bass * 14" },
          { target: "emissiveIntensity", expr: "0.7 + flux * 0.9" },
        ],
        environment: {
          skyColor: "#140206",
          fogColor: "#450A0A",
          fogDensity: 0.036,
          terrainType: "tunnel",
          terrainSpeed: 19.0,
          terrainPrimaryColor: "#FF1B24",
          terrainSecondaryColor: "#FACC15",
        },
        backdrop: {
          skyGradient: ["#140206", "#450A0A"],
          starfield: { enabled: true, density: 0.9, color: "#FDE047" },
        },
        sideProps: {
          type: "neon_arches",
          density: 0.8,
          primaryColor: "#FF1B24",
          secondaryColor: "#FACC15",
        },
        subject: {
          meshType: "procedural_group",
          primaryColor: "#1C1917",
          accentColor: "#FF1B24",
          wireframeOverlay: true,
          scale: 1.15,
          position: [0, 0, -1.0],
          parts: [
            {
              primitive: "ring",
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              scale: [1.4, 1.4, 0.25],
              color: "#FF1B24",
              emissive: true,
              wireframe: true,
              cloner: {
                mode: "spiral",
                count: 14,
                offset: [0.3, 0.08, -0.5],
                stepRotation: [0, 0, 26],
                stepScale: [0.95, 0.95, 0.95],
              },
              animations: [
                { target: "rot.z", expr: "t * operaSpeed + u * tau" },
                { target: "scale", expr: "0.95 + pulse(beat + u, 0.3) * bass * 0.45" },
              ],
            },
            {
              primitive: "icosahedron",
              position: [0, 0, 0.2],
              rotation: [0, 0, 0],
              scale: [0.85, 1.15, 0.85],
              color: "#FACC15",
              emissive: true,
              wireframe: true,
              animations: [
                { target: "rot.y", expr: "t * 2.2" },
                { target: "scale", expr: "0.85 + bass * 0.5" },
              ],
            },
          ],
        },
        postFx: {
          ps1VertexJitter: 0.15,
          crtScanlines: 0.3,
          chromaticAberration: 0.5,
          kaleidoscopeSegments: 4,
          bloomIntensity: 1.3,
        },
        camera: { mode: "fps_arms", fov: 85, shakeIntensity: 0.58 },
        audioMapping: {
          bassTarget: "tunnel_boost",
          midTarget: "color_shift",
          trebleTarget: "sky_flash",
          fluxTarget: "invert_strobe",
        },
      }),
    ],
  },
  {
    packId: "phantom-swan-glam-rave-v4",
    name: "Phantom // Swan's Glam Rave (v4)",
    author: "Anarchy Studio",
    bpm: 142,
    beatsPerScene: 16,
    seed: 197402,
    createdAt: "2026-11-21T01:05:00.000Z",
    params: { glamSpeed: 2.1, strobeGate: 0.7 },
    scenes: [
      createDefaultAnarchy3DScene(0, {
        id: "scene-1",
        name: "01. Juicy Fruits Neon",
        version: 4,
        sceneId: "industrial-city",
        paletteId: "techno-therapy",
        seed: 19751,
        params: { glamSpeed: 2.1 },
        triggers: [
          { when: "gt(bass, 0.74)", action: "boost_fov", intensity: 0.85 },
        ],
        environment: {
          skyColor: "#120326",
          fogColor: "#4A044E",
          fogDensity: 0.038,
          terrainType: "neon_highway",
          terrainSpeed: 15.5,
          terrainPrimaryColor: "#00F0FF",
          terrainSecondaryColor: "#FF00AA",
        },
        backdrop: {
          skyGradient: ["#120326", "#581C87"],
          horizonSun: {
            enabled: true,
            colorTop: "#FDE047",
            colorBottom: "#FF00AA",
            stripes: 6,
            size: 1.3,
          },
          starfield: { enabled: true, density: 0.65, color: "#00F0FF" },
        },
        sideProps: {
          type: "palm_trees",
          density: 0.8,
          primaryColor: "#FF00AA",
          secondaryColor: "#00F0FF",
        },
        subject: {
          meshType: "procedural_group",
          primaryColor: "#1E1B4B",
          accentColor: "#FDE047",
          wireframeOverlay: true,
          scale: 1.05,
          position: [0, -0.45, 0],
          animations: [
            { target: "pos.y", expr: "-0.45 + pulse(beat, 0.3) * bass * 0.25" },
            { target: "rot.z", expr: "sin(t * 2.4) * 0.08 * mid" },
          ],
          parts: [
            {
              primitive: "box",
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              scale: [1.4, 0.34, 2.5],
              color: "#3B0764",
              emissive: false,
              wireframe: true,
            },
            {
              primitive: "wedge",
              position: [0, 0.26, -0.1],
              rotation: [0, 0, 0],
              scale: [1.05, 0.28, 1.25],
              color: "#FF00AA",
              emissive: true,
              wireframe: true,
            },
            {
              primitive: "torus",
              position: [-0.74, -0.15, 0.75],
              rotation: [0, 1.57, 0],
              scale: [0.3, 0.3, 0.22],
              color: "#FDE047",
              emissive: true,
              wireframe: true,
              cloner: { mode: "linear", count: 2, offset: [1.48, 0, 0] },
            },
            {
              primitive: "torus",
              position: [-0.74, -0.15, -0.75],
              rotation: [0, 1.57, 0],
              scale: [0.3, 0.3, 0.22],
              color: "#00F0FF",
              emissive: true,
              wireframe: true,
              cloner: { mode: "linear", count: 2, offset: [1.48, 0, 0] },
            },
          ],
        },
        postFx: {
          ps1VertexJitter: 0.12,
          crtScanlines: 0.35,
          chromaticAberration: 0.3,
          kaleidoscopeSegments: 0,
          bloomIntensity: 1.0,
        },
        camera: { mode: "chase_low", fov: 78, shakeIntensity: 0.4 },
        audioMapping: {
          bassTarget: "camera_zoom_and_jump",
          midTarget: "terrain_wave_height",
          trebleTarget: "particles_burst",
          fluxTarget: "glitch_and_emissive",
        },
      }),
      createDefaultAnarchy3DScene(1, {
        id: "scene-2",
        name: "02. Winslow's Cell",
        version: 4,
        sceneId: "ps1-nightmare",
        paletteId: "cold-concrete",
        seed: 19752,
        params: { glamSpeed: 1.4, strobeGate: 0.65 },
        triggers: [
          { when: "gt(flux, strobeGate)", action: "jitter_spike", intensity: 1.2 },
          { when: "gt(bass, 0.72)", action: "emissive_surge", intensity: 1.0 },
        ],
        environment: {
          skyColor: "#090B10",
          fogColor: "#1E293B",
          fogDensity: 0.058,
          terrainType: "dojo_pillars",
          terrainSpeed: 9.5,
          terrainPrimaryColor: "#94A3B8",
          terrainSecondaryColor: "#E11D48",
        },
        backdrop: {
          skyGradient: ["#090B10", "#1E293B"],
          starfield: { enabled: false, density: 0.2, color: "#94A3B8" },
        },
        sideProps: {
          type: "dojo_pillars",
          density: 0.8,
          primaryColor: "#334155",
          secondaryColor: "#E11D48",
        },
        subject: {
          meshType: "procedural_group",
          primaryColor: "#334155",
          accentColor: "#E11D48",
          wireframeOverlay: true,
          scale: 0.9,
          position: [-1.35, -0.25, -1.6],
          cloner: {
            mode: "grid",
            count: 9,
            offset: [1.35, 0, -1.35],
            stepRotation: [0, 12, 0],
          },
          animations: [
            { target: "pos.y", expr: "-0.25 + step(0.5, fract(u * 3 + beat)) * bass * 0.55" },
            { target: "rot.y", expr: "t * 0.8 + u * pi" },
          ],
          parts: [
            {
              primitive: "box",
              position: [0, 0.6, 0],
              rotation: [0, 0, 0],
              scale: [0.22, 1.8, 0.22],
              color: "#94A3B8",
              emissive: false,
              wireframe: true,
            },
            {
              primitive: "pyramid",
              position: [0, 1.65, 0],
              rotation: [0, 0, 0],
              scale: [0.4, 0.45, 0.4],
              color: "#E11D48",
              emissive: true,
              wireframe: true,
            },
          ],
        },
        postFx: {
          ps1VertexJitter: 0.55,
          crtScanlines: 0.45,
          chromaticAberration: 0.25,
          kaleidoscopeSegments: 0,
          bloomIntensity: 0.7,
        },
        camera: { mode: "dramatic_tilt", fov: 72, shakeIntensity: 0.45 },
        audioMapping: {
          bassTarget: "pillar_slam",
          midTarget: "subject_rotation",
          trebleTarget: "wireframe_glow",
          fluxTarget: "camera_shake",
        },
      }),
      createDefaultAnarchy3DScene(2, {
        id: "scene-3",
        name: "03. Phoenix's Aria",
        version: 4,
        sceneId: "digital-void",
        paletteId: "acid-violet",
        seed: 19753,
        params: { glamSpeed: 1.6 },
        triggers: [
          { when: "gt(treble, 0.65)", action: "flash_sky", intensity: 0.85 },
        ],
        environment: {
          skyColor: "#140524",
          fogColor: "#4C1D95",
          fogDensity: 0.04,
          terrainType: "lowpoly_mountains",
          terrainSpeed: 11.5,
          terrainPrimaryColor: "#FACC15",
          terrainSecondaryColor: "#A855F7",
        },
        backdrop: {
          skyGradient: ["#140524", "#5B21B6"],
          horizonSun: {
            enabled: true,
            colorTop: "#FEF08A",
            colorBottom: "#F59E0B",
            stripes: 5,
            size: 1.15,
          },
          starfield: { enabled: true, density: 0.85, color: "#FEF08A" },
        },
        sideProps: {
          type: "none",
          density: 0.5,
          primaryColor: "#FACC15",
          secondaryColor: "#A855F7",
        },
        subject: {
          meshType: "procedural_group",
          primaryColor: "#5B21B6",
          accentColor: "#FACC15",
          wireframeOverlay: true,
          scale: 1.0,
          position: [0, 0.2, -1.2],
          cloner: {
            mode: "radial",
            count: 12,
            offset: [1.8, 0, 0],
            stepRotation: [0, 30, 0],
          },
          animations: [
            { target: "pos.y", expr: "0.2 + sin(t * glamSpeed + u * tau) * (0.35 + mid * 0.6)" },
            { target: "scale", expr: "0.75 + treble * 0.55" },
          ],
          parts: [
            {
              primitive: "icosahedron",
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              scale: [0.45, 0.85, 0.45],
              color: "#FACC15",
              emissive: true,
              wireframe: true,
            },
          ],
        },
        postFx: {
          ps1VertexJitter: 0.1,
          crtScanlines: 0.2,
          chromaticAberration: 0.35,
          kaleidoscopeSegments: 0,
          bloomIntensity: 1.2,
        },
        camera: { mode: "orbit", fov: 76, shakeIntensity: 0.3 },
        audioMapping: {
          bassTarget: "subject_pulse",
          midTarget: "terrain_wave_height",
          trebleTarget: "sky_flash",
          fluxTarget: "glitch_and_emissive",
        },
      }),
      createDefaultAnarchy3DScene(3, {
        id: "scene-4",
        name: "04. Beef's Electric Shock",
        version: 4,
        sceneId: "techno-therapy",
        paletteId: "anarchy-anaglyph",
        seed: 19754,
        params: { glamSpeed: 3.4, strobeGate: 0.55 },
        triggers: [
          { when: "gt(flux, strobeGate)", action: "flash_sky", intensity: 1.4 },
          { when: "gt(flux, strobeGate)", action: "boost_fov", intensity: 1.1 },
          { when: "gt(bass, 0.7)", action: "spin_burst", intensity: 1.4 },
        ],
        environment: {
          skyColor: "#040B14",
          fogColor: "#0C2440",
          fogDensity: 0.042,
          terrainType: "infinite_grid",
          terrainSpeed: 18.0,
          terrainPrimaryColor: "#38BDF8",
          terrainSecondaryColor: "#FACC15",
        },
        backdrop: {
          skyGradient: ["#040B14", "#0F294A"],
          starfield: { enabled: true, density: 0.9, color: "#38BDF8" },
        },
        sideProps: {
          type: "cyber_towers",
          density: 0.85,
          primaryColor: "#0F172A",
          secondaryColor: "#38BDF8",
        },
        subject: {
          meshType: "abstract_polyhedron",
          primaryColor: "#0284C7",
          accentColor: "#FACC15",
          wireframeOverlay: true,
          scale: 1.25,
          animations: [
            { target: "scale", expr: "1 + gt(flux, 0.55) * 0.45" },
            { target: "rot.x", expr: "t * glamSpeed" },
          ],
        },
        postFx: {
          ps1VertexJitter: 0.3,
          crtScanlines: 0.4,
          chromaticAberration: 0.6,
          kaleidoscopeSegments: 2,
          bloomIntensity: 1.25,
        },
        camera: { mode: "dramatic_tilt", fov: 84, shakeIntensity: 0.65 },
        audioMapping: {
          bassTarget: "camera_zoom_and_jump",
          midTarget: "subject_rotation",
          trebleTarget: "particles_burst",
          fluxTarget: "invert_strobe",
        },
      }),
      createDefaultAnarchy3DScene(4, {
        id: "scene-5",
        name: "05. Paradise Inferno",
        version: 4,
        sceneId: "techno-therapy",
        paletteId: "blood-red",
        seed: 19755,
        params: { glamSpeed: 2.8 },
        triggers: [
          { when: "gt(bass, 0.68)", action: "emissive_surge", intensity: 1.5 },
          { when: "gt(flux, 0.6)", action: "boost_fov", intensity: 1.0 },
        ],
        animations: [
          { target: "fov", expr: "82 + pulse(beat, 0.25) * 12" },
        ],
        environment: {
          skyColor: "#140204",
          fogColor: "#450A0A",
          fogDensity: 0.034,
          terrainType: "tunnel",
          terrainSpeed: 21.0,
          terrainPrimaryColor: "#FF1B24",
          terrainSecondaryColor: "#FACC15",
        },
        backdrop: {
          skyGradient: ["#140204", "#7F1D1D"],
          starfield: { enabled: true, density: 0.85, color: "#FACC15" },
        },
        sideProps: {
          type: "neon_arches",
          density: 0.9,
          primaryColor: "#FF1B24",
          secondaryColor: "#FACC15",
        },
        subjects: [
          {
            meshType: "floating_monolith",
            primaryColor: "#450A0A",
            accentColor: "#FACC15",
            wireframeOverlay: true,
            scale: 1.15,
            animations: [
              { target: "rot.y", expr: "t * 1.8" },
            ],
          },
          {
            meshType: "procedural_group",
            primaryColor: "#1C1917",
            accentColor: "#FF1B24",
            wireframeOverlay: true,
            scale: 1.0,
            position: [0, 0, -1.2],
            parts: [
              {
                primitive: "ring",
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: [1.45, 1.45, 0.25],
                color: "#FF1B24",
                emissive: true,
                wireframe: true,
                cloner: {
                  mode: "spiral",
                  count: 14,
                  offset: [0.35, 0.1, -0.55],
                  stepRotation: [0, 0, 25],
                  stepScale: [0.95, 0.95, 0.95],
                },
                animations: [
                  { target: "rot.z", expr: "t * glamSpeed + u * tau" },
                  { target: "scale", expr: "1 + sin(t * 4 + u * tau) * 0.14 + bass * 0.3" },
                ],
              },
            ],
          },
        ],
        postFx: {
          ps1VertexJitter: 0.18,
          crtScanlines: 0.3,
          chromaticAberration: 0.5,
          kaleidoscopeSegments: 6,
          bloomIntensity: 1.35,
        },
        camera: { mode: "fps_arms", fov: 86, shakeIntensity: 0.6 },
        audioMapping: {
          bassTarget: "tunnel_boost",
          midTarget: "color_shift",
          trebleTarget: "sky_flash",
          fluxTarget: "invert_strobe",
        },
      }),
    ],
  },
  {
    packId: "v3-showcase-5-scenes",
    name: "V3 Showcase // 5 Mondes Uniques",
    author: "Anarchy Studio",
    bpm: 134,
    beatsPerScene: 16,
    seed: 303001,
    createdAt: "2026-11-21T01:15:00.000Z",
    scenes: [
      // 1. Tunnel néon HD fluide
      createDefaultAnarchy3DScene(0, {
        id: "scene-1",
        name: "01. Tunnel Néon HD",
        version: 4,
        sceneId: "techno-therapy",
        paletteId: "techno-therapy",
        seed: 301,
        renderStyle: {
          resolutionScale: 1.0,
          shading: "neon_glow",
          outlineThickness: 0,
        },
        compositionMode: "tunnel_infinite",
        generators: [
          {
            type: "ribbon_trails",
            count: 6,
            color: "#00F6FF",
            secondaryColor: "#FF2BD6",
            speed: 2.2,
            amplitude: 1.2,
            scale: 1.0,
          },
        ],
        environment: {
          skyColor: "#040612",
          fogColor: "#0B102E",
          fogDensity: 0.032,
          terrainType: "tunnel",
          terrainSpeed: 18.0,
          terrainPrimaryColor: "#00F6FF",
          terrainSecondaryColor: "#FF2BD6",
        },
        backdrop: {
          skyGradient: ["#040612", "#0F172A"],
          shader: {
            type: "grid_horizon",
            colors: ["#040612", "#00F6FF", "#FF2BD6"],
            speed: 1.6,
            audioReactive: 0.85,
          },
          starfield: { enabled: false, density: 0, color: "#00F6FF" },
        },
        subject: {
          meshType: "abstract_polyhedron",
          primaryColor: "#090D24",
          accentColor: "#00F6FF",
          wireframeOverlay: true,
          scale: 0.9,
        },
        postFx: {
          ps1VertexJitter: 0,
          crtScanlines: 0,
          chromaticAberration: 0,
          kaleidoscopeSegments: 0,
          bloomIntensity: 1.25,
        },
        camera: {
          mode: "chase_low",
          rig: "first_person_fly",
          beatCut: false,
          fov: 82,
          shakeIntensity: 0.25,
        },
        audioMapping: {
          bassTarget: "tunnel_boost",
          midTarget: "subject_rotation",
          trebleTarget: "wireframe_glow",
          fluxTarget: "fov_kick",
        },
      }),
      // 2. Tempête de particules en orbite (sans sol)
      createDefaultAnarchy3DScene(1, {
        id: "scene-2",
        name: "02. Tempête Orbitale",
        version: 4,
        sceneId: "digital-void",
        paletteId: "acid-violet",
        seed: 302,
        renderStyle: {
          resolutionScale: 0.85,
          shading: "hologram",
          outlineThickness: 0,
        },
        compositionMode: "void_orbital",
        generators: [
          {
            type: "particle_field",
            count: 2200,
            behavior: "vortex",
            color: "#38BDF8",
            secondaryColor: "#A855F7",
            speed: 1.9,
            scale: 1.1,
            amplitude: 1.4,
          },
          {
            type: "particle_field",
            count: 800,
            behavior: "explosion_on_kick",
            color: "#FDE047",
            secondaryColor: "#EC4899",
            speed: 2.5,
            scale: 1.0,
          },
        ],
        environment: {
          skyColor: "#05020F",
          fogColor: "#1E0B3B",
          fogDensity: 0.025,
          terrainType: "mirror_floor",
          terrainSpeed: 10.0,
          terrainPrimaryColor: "#38BDF8",
          terrainSecondaryColor: "#A855F7",
        },
        backdrop: {
          skyGradient: ["#05020F", "#2E1065"],
          shader: {
            type: "plasma_fluid",
            colors: ["#05020F", "#6D28D9", "#38BDF8"],
            speed: 1.3,
            audioReactive: 0.9,
          },
          starfield: { enabled: true, density: 0.7, color: "#FFFFFF" },
        },
        subject: {
          meshType: "floating_monolith",
          primaryColor: "#1E1B4B",
          accentColor: "#38BDF8",
          wireframeOverlay: true,
          scale: 1.1,
        },
        postFx: {
          ps1VertexJitter: 0,
          crtScanlines: 0,
          chromaticAberration: 0.15,
          kaleidoscopeSegments: 0,
          bloomIntensity: 1.1,
        },
        camera: {
          mode: "orbit",
          rig: "orbit_smooth",
          beatCut: true,
          fov: 76,
          shakeIntensity: 0.2,
        },
        audioMapping: {
          bassTarget: "subject_pulse",
          midTarget: "camera_sway",
          trebleTarget: "particles_burst",
          fluxTarget: "glitch_and_emissive",
        },
      }),
      // 3. Monde Cel-Shading BD avec contours noirs
      createDefaultAnarchy3DScene(2, {
        id: "scene-3",
        name: "03. Cel-Shading BD",
        version: 4,
        sceneId: "industrial-city",
        paletteId: "furnace-amber",
        seed: 303,
        renderStyle: {
          resolutionScale: 1.0,
          shading: "toon_cel",
          outlineThickness: 2.5,
        },
        compositionMode: "corridor",
        environment: {
          skyColor: "#FFF7ED",
          fogColor: "#FDBA74",
          fogDensity: 0.02,
          terrainType: "neon_highway",
          terrainSpeed: 13.5,
          terrainPrimaryColor: "#EA580C",
          terrainSecondaryColor: "#DC2626",
        },
        backdrop: {
          skyGradient: ["#FEF3C7", "#F97316"],
          shader: {
            type: "radial_sunburst",
            colors: ["#FEF3C7", "#F97316", "#DC2626"],
            speed: 1.0,
            audioReactive: 0.75,
          },
          starfield: { enabled: false, density: 0, color: "#000000" },
        },
        sideProps: {
          type: "cyber_towers",
          density: 0.7,
          primaryColor: "#FACC15",
          secondaryColor: "#DC2626",
        },
        subject: {
          meshType: "voxel_runner",
          primaryColor: "#EF4444",
          accentColor: "#FACC15",
          wireframeOverlay: false,
          scale: 1.2,
        },
        postFx: {
          ps1VertexJitter: 0,
          crtScanlines: 0,
          chromaticAberration: 0,
          kaleidoscopeSegments: 0,
          bloomIntensity: 0.15,
        },
        camera: {
          mode: "chase_low",
          rig: "dolly_zoom_on_kick",
          beatCut: true,
          fov: 74,
          shakeIntensity: 0.35,
        },
        audioMapping: {
          bassTarget: "camera_zoom_and_jump",
          midTarget: "terrain_wave_height",
          trebleTarget: "particles_burst",
          fluxTarget: "fov_kick",
        },
      }),
      // 4. Survol de vagues audio-réactives chrome
      createDefaultAnarchy3DScene(3, {
        id: "scene-4",
        name: "04. Vagues Chrome FFT",
        version: 4,
        sceneId: "ps1-nightmare",
        paletteId: "cold-concrete",
        seed: 304,
        renderStyle: {
          resolutionScale: 0.9,
          shading: "chrome_reflective",
          outlineThickness: 0,
        },
        compositionMode: "terrain_flyover",
        generators: [
          {
            type: "audio_wave_mesh",
            color: "#E2E8F0",
            secondaryColor: "#38BDF8",
            speed: 1.8,
            amplitude: 1.5,
            segments: 14,
            scale: 1.1,
          },
        ],
        environment: {
          skyColor: "#0F172A",
          fogColor: "#1E293B",
          fogDensity: 0.038,
          terrainType: "lowpoly_mountains",
          terrainSpeed: 14.0,
          terrainPrimaryColor: "#CBD5E1",
          terrainSecondaryColor: "#38BDF8",
        },
        backdrop: {
          skyGradient: ["#0F172A", "#334155"],
          shader: {
            type: "noise_fog",
            colors: ["#0F172A", "#475569", "#94A3B8"],
            speed: 0.9,
            audioReactive: 0.6,
          },
          starfield: { enabled: false, density: 0, color: "#E2E8F0" },
        },
        subject: {
          meshType: "cyber_katana",
          primaryColor: "#E2E8F0",
          accentColor: "#38BDF8",
          wireframeOverlay: true,
          scale: 1.05,
        },
        postFx: {
          ps1VertexJitter: 0,
          crtScanlines: 0,
          chromaticAberration: 0,
          kaleidoscopeSegments: 0,
          bloomIntensity: 0.7,
        },
        camera: {
          mode: "dramatic_tilt",
          rig: "handheld_shake",
          beatCut: false,
          fov: 80,
          shakeIntensity: 0.45,
        },
        audioMapping: {
          bassTarget: "pillar_slam",
          midTarget: "subject_rotation",
          trebleTarget: "wireframe_glow",
          fluxTarget: "camera_shake",
        },
      }),
      // 5. Mandala géométrique fractal
      createDefaultAnarchy3DScene(4, {
        id: "scene-5",
        name: "05. Mandala Fractal",
        version: 4,
        sceneId: "techno-therapy",
        paletteId: "anarchy-anaglyph",
        seed: 305,
        renderStyle: {
          resolutionScale: 0.95,
          shading: "flat",
          outlineThickness: 1,
        },
        compositionMode: "kaleido_mandala",
        kaleidoAxes: 6,
        generators: [
          {
            type: "instanced_array",
            pattern: "fractal",
            count: 24,
            color: "#F43F5E",
            secondaryColor: "#22D3EE",
            speed: 1.6,
            scale: 1.0,
            amplitude: 1.1,
          },
        ],
        environment: {
          skyColor: "#090414",
          fogColor: "#1E0B3B",
          fogDensity: 0.028,
          terrainType: "mirror_floor",
          terrainSpeed: 12.0,
          terrainPrimaryColor: "#F43F5E",
          terrainSecondaryColor: "#22D3EE",
        },
        backdrop: {
          skyGradient: ["#090414", "#3B0764"],
          shader: {
            type: "voronoi_cells",
            colors: ["#090414", "#831843", "#06B6D4"],
            speed: 1.4,
            audioReactive: 0.85,
          },
          starfield: { enabled: true, density: 0.4, color: "#22D3EE" },
        },
        subject: {
          meshType: "procedural_group",
          primaryColor: "#F43F5E",
          accentColor: "#22D3EE",
          wireframeOverlay: true,
          scale: 0.85,
          parts: [
            {
              primitive: "pyramid",
              position: [0, 0.35, 0],
              rotation: [0, 0, 0],
              scale: [0.65, 1.1, 0.65],
              color: "#F43F5E",
              emissive: true,
              wireframe: true,
            },
            {
              primitive: "ring",
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              scale: [1.3, 1.3, 0.25],
              color: "#22D3EE",
              emissive: true,
              wireframe: true,
            },
          ],
        },
        postFx: {
          ps1VertexJitter: 0,
          crtScanlines: 0,
          chromaticAberration: 0,
          kaleidoscopeSegments: 6,
          bloomIntensity: 0.95,
        },
        camera: {
          mode: "orbit",
          rig: "top_down_spin",
          beatCut: true,
          fov: 78,
          shakeIntensity: 0.3,
        },
        audioMapping: {
          bassTarget: "subject_pulse",
          midTarget: "color_shift",
          trebleTarget: "sky_flash",
          fluxTarget: "glitch_and_emissive",
        },
      }),
    ],
  },
  {
    packId: "v4-organic-showcase",
    name: "V4 Organic // Studio & Blender Temps Réel",
    author: "Anarchy Visual Studio",
    bpm: 128,
    beatsPerScene: 16,
    seed: 40404,
    scenes: [
      createDefaultAnarchy3DScene(0, {
        id: "v4-liquid-chrome",
        name: "01. Sphère Liquide Chrome & Rubans Néon",
        version: 4,
        durationBars: 4,
        transition: "crossfade",
        compositionMode: "void_orbital",
        renderStyle: {
          resolutionScale: 1.0,
          shading: "chrome_reflective",
          outlineThickness: 0,
          toneMapping: "aces_filmic",
        },
        environment: {
          skyColor: "#0B0E17",
          fogColor: "#141B2D",
          fogDensity: 0.02,
          terrainType: "mirror_floor",
          terrainSpeed: 6.0,
          terrainPrimaryColor: "#E2E8F0",
          terrainSecondaryColor: "#38BDF8",
          lightingPreset: "studio_clean",
          backdropType: "gradient_sky",
          backdropColors: ["#090D16", "#1E293B", "#0F172A"],
          fog: { enabled: true, color: "#0F172A", density: 0.025 },
        },
        subject: {
          meshType: "none",
          primaryColor: "#E2E8F0",
          accentColor: "#38BDF8",
          wireframeOverlay: false,
          scale: 1.0,
        },
        actors: [
          {
            id: "liquid-chrome-core",
            type: "organic_blob",
            position: [0, 0.1, 4.8],
            scale: 1.35,
            color: "#F8FAFC",
            secondaryColor: "#38BDF8",
            material: "chrome",
            detail: 28,
            noiseStrength: 0.65,
            noiseFrequency: 1.8,
            speed: 1.3,
            audioModulation: [
              { source: "bass", target: "scale", amount: 0.45, offset: 0 },
              { source: "lowMid", target: "noiseStrength", amount: 0.7, offset: 0 },
              { source: "fader_1", target: "scale", amount: 0.35, offset: 0 },
            ],
          },
          {
            id: "neon-silk-ribbons",
            type: "spline_ribbons",
            position: [0, 0, 5.2],
            scale: 1.2,
            color: "#38BDF8",
            secondaryColor: "#F472B6",
            material: "emissive_neon",
            ribbonCount: 7,
            thickness: 2.5,
            speed: 1.6,
            audioModulation: [
              { source: "highMid", target: "scale", amount: 0.5, offset: 0 },
              { source: "treble", target: "emissiveIntensity", amount: 0.85, offset: 0.2 },
            ],
          },
        ],
        postFX: [
          { type: "bloom", intensity: 0.85, threshold: 0.55 },
          { type: "chromatic_aberration", intensity: 0.12 },
        ],
        postFx: {
          ps1VertexJitter: 0,
          crtScanlines: 0,
          chromaticAberration: 0,
          kaleidoscopeSegments: 0,
          bloomIntensity: 0.75,
        },
        camera: {
          mode: "orbit",
          rig: "orbit_smooth",
          beatCut: false,
          fov: 64,
          shakeIntensity: 0.12,
        },
        audioMapping: {
          bassTarget: "subject_pulse",
          midTarget: "color_shift",
          trebleTarget: "particles_burst",
          fluxTarget: "glitch_and_emissive",
        },
      }),
      createDefaultAnarchy3DScene(1, {
        id: "v4-curl-storm",
        name: "02. Tempête Curl-Noise & Flou Cinéma",
        version: 4,
        durationBars: 8,
        transition: "camera_swoop",
        compositionMode: "void_orbital",
        renderStyle: {
          resolutionScale: 1.0,
          shading: "neon_glow",
          outlineThickness: 0,
          toneMapping: "cineon",
        },
        environment: {
          skyColor: "#04050A",
          fogColor: "#090D1A",
          fogDensity: 0.03,
          terrainType: "infinite_grid",
          terrainSpeed: 8.0,
          terrainPrimaryColor: "#6366F1",
          terrainSecondaryColor: "#EC4899",
          lightingPreset: "dark_void",
          backdropType: "starfield",
          backdropColors: ["#03040A", "#0F172A", "#1E1B4B"],
          fog: { enabled: true, color: "#050712", density: 0.035 },
        },
        subject: {
          meshType: "none",
          primaryColor: "#818CF8",
          accentColor: "#F472B6",
          wireframeOverlay: false,
          scale: 1.0,
        },
        actors: [
          {
            id: "curl-swarm-main",
            type: "particle_swarm",
            position: [0, 0, 5.0],
            scale: 1.3,
            color: "#38BDF8",
            secondaryColor: "#EC4899",
            count: 5500,
            behavior: "curl_noise_flow",
            speed: 1.4,
            audioModulation: [
              { source: "energy", target: "rotationSpeed", amount: 1.2, offset: 0.2 },
              { source: "bass", target: "scale", amount: 0.55, offset: 0 },
            ],
          },
          {
            id: "floating-cinema-dust",
            type: "particle_swarm",
            position: [0, 0, 3.8],
            scale: 1.0,
            color: "#FDE68A",
            secondaryColor: "#FFFFFF",
            count: 1800,
            behavior: "floating_dust",
            speed: 0.7,
            audioModulation: [
              { source: "treble", target: "emissiveIntensity", amount: 0.9, offset: 0.1 },
            ],
          },
        ],
        postFX: [
          { type: "depth_of_field", intensity: 0.75, radius: 3.5 },
          { type: "bloom", intensity: 0.9, threshold: 0.45 },
          { type: "film_grain", intensity: 0.28 },
        ],
        postFx: {
          ps1VertexJitter: 0,
          crtScanlines: 0,
          chromaticAberration: 0,
          kaleidoscopeSegments: 0,
          bloomIntensity: 0.85,
        },
        camera: {
          mode: "dramatic_tilt",
          rig: "dolly_zoom_on_kick",
          beatCut: false,
          fov: 70,
          shakeIntensity: 0.22,
        },
        audioMapping: {
          bassTarget: "camera_zoom_and_jump",
          midTarget: "camera_sway",
          trebleTarget: "particles_burst",
          fluxTarget: "fov_kick",
        },
      }),
      createDefaultAnarchy3DScene(2, {
        id: "v4-organic-dunes",
        name: "03. Dunes Organiques & Plasma Solaire",
        version: 4,
        durationBars: 4,
        transition: "crossfade",
        compositionMode: "void_orbital",
        renderStyle: {
          resolutionScale: 1.0,
          shading: "flat",
          outlineThickness: 0,
          toneMapping: "aces_filmic",
        },
        environment: {
          skyColor: "#1A0B12",
          fogColor: "#7C2D12",
          fogDensity: 0.032,
          terrainType: "lowpoly_mountains",
          terrainSpeed: 10.0,
          terrainPrimaryColor: "#F97316",
          terrainSecondaryColor: "#FDE047",
          lightingPreset: "sunset_warm",
          backdropType: "liquid_plasma",
          backdropColors: ["#1C0A14", "#EA580C", "#FACC15"],
          fog: { enabled: true, color: "#9A3412", density: 0.03 },
        },
        subject: {
          meshType: "none",
          primaryColor: "#FB923C",
          accentColor: "#FDE047",
          wireframeOverlay: false,
          scale: 1.0,
        },
        actors: [
          {
            id: "simplex-bass-dunes",
            type: "wave_terrain",
            position: [0, -0.9, 4.6],
            scale: 1.35,
            color: "#FB923C",
            secondaryColor: "#FDE047",
            material: "matcap_clay",
            detail: 22,
            noiseStrength: 0.85,
            noiseFrequency: 1.2,
            speed: 1.25,
            audioModulation: [
              { source: "bass", target: "noiseStrength", amount: 1.15, offset: 0 },
              { source: "lowMid", target: "positionY", amount: 0.35, offset: 0 },
            ],
          },
          {
            id: "solar-glass-orb",
            type: "organic_blob",
            position: [0, 0.95, 6.2],
            scale: 0.85,
            color: "#FDE047",
            secondaryColor: "#F97316",
            material: "frosted_glass",
            detail: 20,
            noiseStrength: 0.35,
            noiseFrequency: 1.4,
            speed: 0.9,
            audioModulation: [
              { source: "energy", target: "scale", amount: 0.35, offset: 0 },
            ],
          },
        ],
        postFX: [
          { type: "bloom", intensity: 0.7, threshold: 0.5 },
          { type: "film_grain", intensity: 0.16 },
        ],
        postFx: {
          ps1VertexJitter: 0,
          crtScanlines: 0,
          chromaticAberration: 0,
          kaleidoscopeSegments: 0,
          bloomIntensity: 0.65,
        },
        camera: {
          mode: "chase_low",
          rig: "first_person_fly",
          beatCut: false,
          fov: 74,
          shakeIntensity: 0.18,
        },
        audioMapping: {
          bassTarget: "pillar_slam",
          midTarget: "terrain_wave_height",
          trebleTarget: "sky_flash",
          fluxTarget: "camera_shake",
        },
      }),
      createDefaultAnarchy3DScene(3, {
        id: "v4-hybrid-cel-comic",
        name: "04. Hybride Modèle 3D & BD Cel-Shading",
        version: 4,
        durationBars: 8,
        transition: "flash",
        compositionMode: "void_orbital",
        renderStyle: {
          resolutionScale: 1.0,
          shading: "toon_cel",
          outlineThickness: 3,
          toneMapping: "reinhard",
        },
        environment: {
          skyColor: "#FEF08A",
          fogColor: "#FDE047",
          fogDensity: 0.01,
          terrainType: "infinite_grid",
          terrainSpeed: 9.0,
          terrainPrimaryColor: "#FF1B24",
          terrainSecondaryColor: "#00F0FF",
          lightingPreset: "cyber_neon",
          backdropType: "grid_horizon",
          backdropColors: ["#FFFBEB", "#FF1B24", "#00B4D8"],
          fog: { enabled: false, color: "#FFFBEB", density: 0 },
        },
        subject: {
          meshType: "none",
          primaryColor: "#FF1B24",
          accentColor: "#00F0FF",
          wireframeOverlay: false,
          scale: 1.0,
        },
        actors: [
          {
            id: "anarchy-bust-glb",
            type: "glb_model",
            url: "/models/anarchy-totem.glb",
            position: [-0.85, -0.1, 5.0],
            scale: 1.15,
            color: "#FF1B24",
            secondaryColor: "#00F0FF",
            material: "toon_cel_outline",
            speed: 1.1,
            audioModulation: [
              { source: "bass", target: "scale", amount: 0.35, offset: 0 },
              { source: "highMid", target: "rotationSpeed", amount: 0.9, offset: 0.2 },
            ],
          },
          {
            id: "openhub-comic-mascot",
            type: "sprite_2d",
            label: "3d_glasses_character",
            position: [0.95, 0.05, 4.4],
            scale: 1.1,
            color: "#FF1B24",
            secondaryColor: "#00F0FF",
            parallax: 1.25,
            audioModulation: [
              { source: "bass", target: "positionY", amount: 0.4, offset: 0 },
              { source: "fader_2", target: "scale", amount: 0.3, offset: 0 },
            ],
          },
        ],
        postFX: [
          { type: "toon_outline", intensity: 1.2, color: "#09090B" },
          { type: "chromatic_aberration", intensity: 0.14 },
        ],
        postFx: {
          ps1VertexJitter: 0,
          crtScanlines: 0,
          chromaticAberration: 0,
          kaleidoscopeSegments: 0,
          bloomIntensity: 0.35,
        },
        camera: {
          mode: "orbit",
          rig: "handheld_shake",
          beatCut: true,
          fov: 68,
          shakeIntensity: 0.25,
        },
        audioMapping: {
          bassTarget: "subject_pulse",
          midTarget: "subject_rotation",
          trebleTarget: "wireframe_glow",
          fluxTarget: "camera_shake",
        },
      }),
    ],
  },
  {
    packId: "v5-cuphead-1930-showcase",
    name: "V5 Cartoon 1930 // Cuphead & Rubber-Hose",
    author: "Anarchy Visual Studio",
    bpm: 132,
    beatsPerScene: 16,
    seed: 19305,
    scenes: [
      createDefaultAnarchy3DScene(0, {
        id: "v5-theater-curtains",
        name: "01. Théâtre 1930 — Rideaux Rouges & Parallaxe",
        version: 5,
        durationBars: 4,
        transition: "crossfade",
        compositionMode: "void_orbital",
        renderStyle: {
          resolutionScale: 1.0,
          shading: "toon_cel",
          outlineThickness: 3,
          toneMapping: "reinhard",
        },
        cartoonPhysics: {
          steppedFps: 24,
          squashStretch: 0.55,
          squashTrigger: "bass",
          lineBoil: 0.75,
          faderBindings: {
            squashStretch: "fader_1",
            lineBoil: "fader_2",
            filmGrain: "fader_3",
            parallaxSpeed: "fader_4",
            steppedFps: "fader_5",
          },
        },
        environment: {
          skyColor: "#F6E7C1",
          fogColor: "#D9B37C",
          fogDensity: 0.012,
          terrainType: "infinite_grid",
          terrainSpeed: 8.0,
          terrainPrimaryColor: "#B91C1C",
          terrainSecondaryColor: "#F59E0B",
          lightingPreset: "sunset_warm",
          backdropType: "gradient_sky",
          backdropColors: ["#F6E7C1", "#E9C78B", "#C68B59"],
          fog: { enabled: true, color: "#E2C08D", density: 0.015 },
        },
        subject: {
          meshType: "none",
          primaryColor: "#B91C1C",
          accentColor: "#FDE68A",
          wireframeOverlay: false,
          scale: 1.0,
        },
        actors: [
          {
            id: "watercolor-hills-bg",
            type: "parallax_layer",
            pattern: "watercolor_hills",
            position: [0, 0.1, 8.0],
            scrollX: 0.35,
            scrollY: 0,
            depthBlur: 0.35,
            color: "#88A87A",
            secondaryColor: "#5C7C58",
            parallax: 0.6,
          },
          {
            id: "checker-stage-floor",
            type: "parallax_layer",
            pattern: "checker_floor",
            position: [0, -0.5, 5.5],
            scrollX: 0.9,
            scrollY: 0,
            color: "#F6E7C1",
            secondaryColor: "#78350F",
            parallax: 1.1,
          },
          {
            id: "stage-dancer-sprite",
            type: "cartoon_sprite",
            position: [0, -0.1, 4.6],
            scale: 1.15,
            framesX: 4,
            framesY: 2,
            bpmSync: true,
            inkOutline: true,
            color: "#DC2626",
            secondaryColor: "#FDE047",
            audioModulation: [
              { source: "kick", target: "squashStretch", amount: 0.65, offset: 0 },
              { source: "bass", target: "positionY", amount: 0.35, offset: 0 },
            ],
          },
          {
            id: "theater-curtains-fg",
            type: "parallax_layer",
            pattern: "stage_curtains",
            position: [0, 0, 2.8],
            scrollX: 0,
            scrollY: 0,
            color: "#991B1B",
            secondaryColor: "#F59E0B",
            parallax: 1.4,
          },
        ],
        postFX: [
          { type: "toon_outline", inkThickness: 3.5, inkJitter: 0.9, color: "#120E0B" },
          {
            type: "vintage_1930_film",
            filmGrain: 0.42,
            scratchesAndDust: 0.35,
            gateWeave: 0.35,
            colorGrade: "technicolor_30s",
            vignette: 0.52,
          },
        ],
        postFx: {
          ps1VertexJitter: 0,
          crtScanlines: 0,
          chromaticAberration: 0,
          kaleidoscopeSegments: 0,
          bloomIntensity: 0.25,
        },
        camera: {
          mode: "chase_low",
          rig: "handheld_shake",
          beatCut: false,
          fov: 66,
          shakeIntensity: 0.14,
        },
        audioMapping: {
          bassTarget: "subject_pulse",
          midTarget: "camera_sway",
          trebleTarget: "particles_burst",
          fluxTarget: "camera_shake",
        },
      }),
      createDefaultAnarchy3DScene(1, {
        id: "v5-rubber-hose-boss",
        name: "02. Boss Rubber-Hose en Technicolor",
        version: 5,
        durationBars: 4,
        transition: "flash",
        compositionMode: "void_orbital",
        renderStyle: {
          resolutionScale: 1.0,
          shading: "toon_cel",
          outlineThickness: 4,
          toneMapping: "reinhard",
        },
        cartoonPhysics: {
          steppedFps: 24,
          squashStretch: 0.85,
          squashTrigger: "kick",
          lineBoil: 1.05,
          faderBindings: {
            squashStretch: "fader_1",
            lineBoil: "fader_2",
            filmGrain: "fader_3",
            parallaxSpeed: "fader_4",
          },
        },
        environment: {
          skyColor: "#93C5FD",
          fogColor: "#FDE68A",
          fogDensity: 0.01,
          terrainType: "infinite_grid",
          terrainSpeed: 10.0,
          terrainPrimaryColor: "#EF4444",
          terrainSecondaryColor: "#38BDF8",
          lightingPreset: "studio_clean",
          backdropType: "gradient_sky",
          backdropColors: ["#60A5FA", "#BFDBFE", "#FEF3C7"],
          fog: { enabled: false, color: "#FEF3C7", density: 0 },
        },
        subject: {
          meshType: "none",
          primaryColor: "#EF4444",
          accentColor: "#FACC15",
          wireframeOverlay: false,
          scale: 1.0,
        },
        actors: [
          {
            id: "clouds-parallax-band",
            type: "parallax_layer",
            pattern: "clouds_band",
            position: [0, 0.35, 7.5],
            scrollX: 0.75,
            scrollY: 0,
            color: "#FFFBEB",
            secondaryColor: "#DBEAFE",
            parallax: 0.7,
          },
          {
            id: "boss-rubber-hose",
            type: "rubber_hose_mesh",
            shape: "boss_character",
            position: [0, 0, 4.8],
            scale: 1.25,
            color: "#DC2626",
            secondaryColor: "#FACC15",
            inkThickness: 3.8,
            speed: 1.4,
            audioModulation: [
              { source: "kick", target: "squashStretch", amount: 0.9, offset: 0 },
              { source: "snare", target: "lineBoil", amount: 0.8, offset: 0 },
            ],
          },
          {
            id: "waving-hose-arms",
            type: "rubber_hose_mesh",
            shape: "hose_arms",
            position: [0, 0.05, 4.6],
            scale: 1.15,
            color: "#18181B",
            secondaryColor: "#FFFBEB",
            inkThickness: 3.4,
            speed: 1.8,
          },
          {
            id: "bouncing-music-notes",
            type: "rubber_hose_mesh",
            shape: "music_notes",
            position: [0, 0.3, 4.0],
            scale: 1.0,
            color: "#09090B",
            secondaryColor: "#FDE047",
            inkThickness: 2.5,
            speed: 1.5,
            audioModulation: [
              { source: "treble", target: "positionY", amount: 0.45, offset: 0 },
            ],
          },
        ],
        postFX: [
          { type: "toon_outline", inkThickness: 3.5, inkJitter: 1.1, color: "#0B0908" },
          {
            type: "vintage_1930_film",
            filmGrain: 0.38,
            scratchesAndDust: 0.28,
            gateWeave: 0.42,
            colorGrade: "technicolor_30s",
            vignette: 0.45,
          },
        ],
        postFx: {
          ps1VertexJitter: 0,
          crtScanlines: 0,
          chromaticAberration: 0,
          kaleidoscopeSegments: 0,
          bloomIntensity: 0.2,
        },
        camera: {
          mode: "orbit",
          rig: "dolly_zoom_on_kick",
          beatCut: false,
          fov: 68,
          shakeIntensity: 0.2,
        },
        audioMapping: {
          bassTarget: "camera_zoom_and_jump",
          midTarget: "subject_rotation",
          trebleTarget: "sky_flash",
          fluxTarget: "camera_shake",
        },
      }),
      createDefaultAnarchy3DScene(2, {
        id: "v5-bw-ink-break-12fps",
        name: "03. Break Noir & Blanc 12 FPS (16 Mesures)",
        version: 5,
        durationBars: 16,
        transition: "crossfade",
        compositionMode: "void_orbital",
        renderStyle: {
          resolutionScale: 1.0,
          shading: "toon_cel",
          outlineThickness: 4,
          toneMapping: "cineon",
        },
        cartoonPhysics: {
          steppedFps: 12,
          squashStretch: 0.45,
          squashTrigger: "snare",
          lineBoil: 1.35,
          faderBindings: {
            lineBoil: "fader_2",
            filmGrain: "fader_3",
            parallaxSpeed: "fader_4",
            steppedFps: "fader_5",
          },
        },
        environment: {
          skyColor: "#E5E5E5",
          fogColor: "#A3A3A3",
          fogDensity: 0.02,
          terrainType: "infinite_grid",
          terrainSpeed: 6.0,
          terrainPrimaryColor: "#171717",
          terrainSecondaryColor: "#F5F5F5",
          lightingPreset: "studio_clean",
          backdropType: "gradient_sky",
          backdropColors: ["#F5F5F4", "#D6D3D1", "#78716C"],
          fog: { enabled: true, color: "#D6D3D1", density: 0.02 },
        },
        subject: {
          meshType: "none",
          primaryColor: "#171717",
          accentColor: "#F5F5F5",
          wireframeOverlay: false,
          scale: 1.0,
        },
        actors: [
          {
            id: "ink-city-bg",
            type: "parallax_layer",
            pattern: "city_silhouette",
            position: [0, -0.05, 7.2],
            scrollX: 0.55,
            scrollY: 0,
            color: "#1C1917",
            secondaryColor: "#57534E",
            parallax: 0.8,
          },
          {
            id: "vintage-spinning-wheel",
            type: "rubber_hose_mesh",
            shape: "vintage_wheel",
            position: [0, 0.05, 4.8],
            scale: 1.2,
            color: "#F5F5F4",
            secondaryColor: "#1C1917",
            inkThickness: 4.0,
            speed: 1.1,
            audioModulation: [
              { source: "energy", target: "rotationSpeed", amount: 0.9, offset: 0.2 },
            ],
          },
          {
            id: "retro-fluffy-clouds",
            type: "rubber_hose_mesh",
            shape: "fluffy_clouds",
            position: [0, 0.55, 4.2],
            scale: 1.0,
            color: "#FFFFFF",
            secondaryColor: "#D6D3D1",
            inkThickness: 3.0,
            speed: 0.8,
          },
        ],
        postFX: [
          { type: "toon_outline", inkThickness: 4.0, inkJitter: 1.5, color: "#09090B" },
          {
            type: "vintage_1930_film",
            filmGrain: 0.65,
            scratchesAndDust: 0.58,
            gateWeave: 0.55,
            colorGrade: "black_and_white_ink",
            vignette: 0.65,
          },
        ],
        postFx: {
          ps1VertexJitter: 0,
          crtScanlines: 0,
          chromaticAberration: 0,
          kaleidoscopeSegments: 0,
          bloomIntensity: 0.1,
        },
        camera: {
          mode: "dramatic_tilt",
          rig: "orbit_smooth",
          beatCut: false,
          fov: 64,
          shakeIntensity: 0.16,
        },
        audioMapping: {
          bassTarget: "pillar_slam",
          midTarget: "camera_sway",
          trebleTarget: "particles_burst",
          fluxTarget: "camera_shake",
        },
      }),
      createDefaultAnarchy3DScene(3, {
        id: "v5-psyche-tunnel-pie-eyes",
        name: "04. Drop Psychédélique — Tunnel & Pie-Eyes",
        version: 5,
        durationBars: 8,
        transition: "camera_swoop",
        compositionMode: "void_orbital",
        renderStyle: {
          resolutionScale: 1.0,
          shading: "toon_cel",
          outlineThickness: 4,
          toneMapping: "aces_filmic",
        },
        cartoonPhysics: {
          steppedFps: 24,
          squashStretch: 1.0,
          squashTrigger: "bass",
          lineBoil: 1.45,
          faderBindings: {
            squashStretch: "fader_1",
            lineBoil: "fader_2",
            filmGrain: "fader_3",
            parallaxSpeed: "fader_4",
            steppedFps: "fader_5",
          },
        },
        environment: {
          skyColor: "#3B0764",
          fogColor: "#BE185D",
          fogDensity: 0.015,
          terrainType: "tunnel",
          terrainSpeed: 16.0,
          terrainPrimaryColor: "#FACC15",
          terrainSecondaryColor: "#EC4899",
          lightingPreset: "cyber_neon",
          backdropType: "liquid_plasma",
          backdropColors: ["#2E1065", "#DB2777", "#FACC15"],
          fog: { enabled: false, color: "#2E1065", density: 0 },
        },
        subject: {
          meshType: "none",
          primaryColor: "#FACC15",
          accentColor: "#EC4899",
          wireframeOverlay: false,
          scale: 1.0,
        },
        actors: [
          {
            id: "hypnotic-psyche-rings",
            type: "parallax_layer",
            pattern: "psyche_rings",
            position: [0, 0, 7.0],
            scrollX: 1.2,
            scrollY: 0.6,
            color: "#FACC15",
            secondaryColor: "#EC4899",
            parallax: 1.0,
          },
          {
            id: "cartoon-psyche-tunnel",
            type: "rubber_hose_mesh",
            shape: "psyche_tunnel",
            position: [0, 0, 5.2],
            scale: 1.3,
            color: "#22D3EE",
            secondaryColor: "#F43F5E",
            inkThickness: 3.6,
            speed: 2.0,
            audioModulation: [
              { source: "bass", target: "scale", amount: 0.55, offset: 0 },
              { source: "energy", target: "rotationSpeed", amount: 1.2, offset: 0.3 },
            ],
          },
          {
            id: "floating-pie-eyes",
            type: "rubber_hose_mesh",
            shape: "pie_eyes",
            position: [0, 0, 4.2],
            scale: 1.15,
            color: "#FFFBEB",
            secondaryColor: "#09090B",
            inkThickness: 4.0,
            speed: 1.6,
            audioModulation: [
              { source: "kick", target: "squashStretch", amount: 0.95, offset: 0 },
              { source: "treble", target: "lineBoil", amount: 0.9, offset: 0 },
            ],
          },
        ],
        postFX: [
          { type: "toon_outline", inkThickness: 4.2, inkJitter: 1.6, color: "#09090B" },
          {
            type: "vintage_1930_film",
            filmGrain: 0.45,
            scratchesAndDust: 0.35,
            gateWeave: 0.48,
            colorGrade: "sepia_warm",
            vignette: 0.5,
          },
          { type: "chromatic_aberration", intensity: 0.18 },
        ],
        postFx: {
          ps1VertexJitter: 0,
          crtScanlines: 0,
          chromaticAberration: 0,
          kaleidoscopeSegments: 0,
          bloomIntensity: 0.5,
        },
        camera: {
          mode: "orbit",
          rig: "top_down_spin",
          beatCut: true,
          fov: 76,
          shakeIntensity: 0.3,
        },
        audioMapping: {
          bassTarget: "tunnel_boost",
          midTarget: "color_shift",
          trebleTarget: "sky_flash",
          fluxTarget: "fov_kick",
        },
      }),
    ],
  },
  {
    packId: "v6-morphing-showcase",
    name: "V6 Morphing // DAW Automations & Continuum",
    author: "Anarchy Visual Studio",
    bpm: 130,
    beatsPerScene: 16,
    seed: 60606,
    modulators: [
      { id: "lfo_1", waveform: "sine", rateBeats: 2, phase: 0 },
      { id: "lfo_2", waveform: "triangle", rateBeats: 4, phase: 0.25 },
      { id: "lfo_3", waveform: "saw", rateBeats: 1, phase: 0 },
      { id: "lfo_4", waveform: "random_hold", rateBeats: 0.5, phase: 0 },
    ],
    scenes: [
      createDefaultAnarchy3DScene(0, {
        id: "v6-chrome-genesis",
        name: "01. Genèse — Sphère Liquide Chrome HD",
        version: 6,
        durationBars: 4,
        transition: "morph",
        morphTransition: { durationBeats: 4, easing: "easeInOutCubic" },
        compositionMode: "void_orbital",
        renderStyle: {
          resolutionScale: 1.0,
          shading: "chrome_reflective",
          outlineThickness: 0,
          toneMapping: "aces_filmic",
        },
        modulators: [
          { id: "lfo_1", waveform: "sine", rateBeats: 2, phase: 0 },
          { id: "lfo_2", waveform: "triangle", rateBeats: 4, phase: 0.25 },
        ],
        automations: [
          {
            target: "noiseStrength",
            actorId: "main_entity",
            from: 0.35,
            to: 1.15,
            easing: "easeInOutCubic",
          },
          {
            target: "zoom",
            from: 1.0,
            to: 1.25,
            easing: "linear",
          },
        ],
        cameraCuts: [
          { mode: "orbit", rig: "orbit_smooth", fov: 64, switchEveryBars: 2, transition: "glide" },
          { mode: "dramatic_tilt", rig: "dolly_zoom_on_kick", fov: 72, switchEveryBars: 2, transition: "glide" },
        ],
        environment: {
          skyColor: "#070B14",
          fogColor: "#0F172A",
          fogDensity: 0.018,
          terrainType: "mirror_floor",
          terrainSpeed: 7.0,
          terrainPrimaryColor: "#E2E8F0",
          terrainSecondaryColor: "#38BDF8",
          lightingPreset: "studio_clean",
          backdropType: "gradient_sky",
          backdropColors: ["#050811", "#0F172A", "#1E293B"],
          fog: { enabled: true, color: "#0F172A", density: 0.02 },
        },
        subject: {
          meshType: "none",
          primaryColor: "#E2E8F0",
          accentColor: "#38BDF8",
          wireframeOverlay: false,
          scale: 1.0,
        },
        actors: [
          {
            id: "main_entity",
            type: "organic_blob",
            position: [0, 0.05, 4.8],
            scale: 1.35,
            color: "#F8FAFC",
            secondaryColor: "#38BDF8",
            material: "chrome",
            detail: 32,
            noiseStrength: 0.55,
            noiseFrequency: 1.8,
            speed: 1.3,
            audioModulation: [
              { source: "bass", target: "scale", amount: 0.45, offset: 0 },
              { source: "lfo_1", target: "noiseStrength", amount: 0.5, offset: 0 },
              { source: "fader_1", target: "scale", amount: 0.35, offset: 0 },
            ],
          },
          {
            id: "ambient_swarm",
            type: "particle_swarm",
            shapeTarget: "sphere",
            position: [0, 0, 5.2],
            scale: 1.15,
            color: "#38BDF8",
            secondaryColor: "#E2E8F0",
            count: 2500,
            behavior: "vortex",
            speed: 1.1,
            audioModulation: [
              { source: "lfo_2", target: "rotationSpeed", amount: 0.6, offset: 0 },
            ],
          },
        ],
        postFX: [
          { type: "bloom", intensity: 0.9, threshold: 0.5 },
          { type: "depth_of_field", intensity: 0.35, radius: 2.5 },
        ],
        postFx: {
          ps1VertexJitter: 0,
          crtScanlines: 0,
          chromaticAberration: 0,
          kaleidoscopeSegments: 0,
          bloomIntensity: 0.8,
        },
        camera: {
          mode: "orbit",
          rig: "orbit_smooth",
          beatCut: false,
          fov: 64,
          shakeIntensity: 0.1,
        },
        audioMapping: {
          bassTarget: "subject_pulse",
          midTarget: "color_shift",
          trebleTarget: "particles_burst",
          fluxTarget: "glitch_and_emissive",
        },
      }),
      createDefaultAnarchy3DScene(1, {
        id: "v6-morph-rubber-hose-1930",
        name: "02. Métamorphose — Entité Cartoon Rubber-Hose 1930",
        version: 6,
        durationBars: 8,
        transition: "morph",
        morphTransition: { durationBeats: 6, easing: "elasticOut" },
        compositionMode: "void_orbital",
        renderStyle: {
          resolutionScale: 1.0,
          shading: "toon_cel",
          outlineThickness: 4,
          toneMapping: "reinhard",
        },
        cartoonPhysics: {
          steppedFps: 60,
          squashStretch: 0.45,
          squashTrigger: "kick",
          lineBoil: 0.35,
          faderBindings: {
            squashStretch: "fader_1",
            lineBoil: "fader_2",
            filmGrain: "fader_3",
          },
        },
        modulators: [
          { id: "lfo_1", waveform: "sine", rateBeats: 2, phase: 0 },
          { id: "lfo_3", waveform: "triangle", rateBeats: 4, phase: 0 },
        ],
        automations: [
          {
            target: "lineBoil",
            actorId: "main_entity",
            from: 0.15,
            to: 0.45,
            easing: "easeInOutCubic",
          },
          {
            target: "squashStretch",
            actorId: "main_entity",
            from: 0.25,
            to: 0.55,
            easing: "easeInOutCubic",
          },
        ],
        cameraCuts: [
          { mode: "orbit", rig: "orbit_smooth", fov: 66, switchEveryBars: 4, onPeakBand: "snare", transition: "glide" },
          { mode: "orbit", rig: "dolly_zoom_on_kick", fov: 72, switchEveryBars: 4, onPeakBand: "snare", transition: "glide" },
        ],
        environment: {
          skyColor: "#F6E7C1",
          fogColor: "#D9B37C",
          fogDensity: 0.015,
          terrainType: "infinite_grid",
          terrainSpeed: 9.0,
          terrainPrimaryColor: "#DC2626",
          terrainSecondaryColor: "#FACC15",
          lightingPreset: "sunset_warm",
          backdropType: "gradient_sky",
          backdropColors: ["#F6E7C1", "#E9C78B", "#C68B59"],
          fog: { enabled: true, color: "#E2C08D", density: 0.018 },
        },
        subject: {
          meshType: "none",
          primaryColor: "#DC2626",
          accentColor: "#FACC15",
          wireframeOverlay: false,
          scale: 1.0,
        },
        actors: [
          {
            id: "main_entity",
            type: "rubber_hose_mesh",
            shape: "boss_character",
            position: [0, 0, 4.6],
            scale: 1.3,
            color: "#DC2626",
            secondaryColor: "#FACC15",
            material: "toon_cel_outline",
            inkThickness: 3.6,
            speed: 1.2,
            audioModulation: [
              { source: "kick", target: "squashStretch", amount: 0.45, offset: 0 },
              { source: "lfo_1", target: "positionY", amount: 0.15, offset: 0 },
            ],
          },
          {
            id: "ambient_swarm",
            type: "particle_swarm",
            shapeTarget: "vortex",
            position: [0, 0, 5.0],
            scale: 1.25,
            color: "#18181B",
            secondaryColor: "#DC2626",
            count: 3200,
            behavior: "vortex",
            speed: 1.15,
          },
        ],
        postFX: [
          { type: "toon_outline", inkThickness: 3.2, inkJitter: 0.35, color: "#0B0908" },
          {
            type: "vintage_1930_film",
            filmGrain: 0.22,
            scratchesAndDust: 0.18,
            gateWeave: 0.15,
            colorGrade: "technicolor_30s",
            vignette: 0.42,
          },
        ],
        postFx: {
          ps1VertexJitter: 0,
          crtScanlines: 0,
          chromaticAberration: 0,
          kaleidoscopeSegments: 0,
          bloomIntensity: 0.3,
        },
        camera: {
          mode: "orbit",
          rig: "orbit_smooth",
          beatCut: false,
          fov: 68,
          shakeIntensity: 0.08,
        },
        audioMapping: {
          bassTarget: "subject_pulse",
          midTarget: "camera_sway",
          trebleTarget: "particles_burst",
          fluxTarget: "glitch_and_emissive",
        },
      }),
      createDefaultAnarchy3DScene(2, {
        id: "v6-swarm-tunnel-explosion",
        name: "03. Éclatement — 5 000 Particules en Tunnel Infini",
        version: 6,
        durationBars: 16,
        transition: "morph",
        morphTransition: { durationBeats: 4, easing: "easeInOutCubic" },
        compositionMode: "void_orbital",
        renderStyle: {
          resolutionScale: 1.0,
          shading: "neon_glow",
          outlineThickness: 0,
          toneMapping: "cineon",
        },
        modulators: [
          { id: "lfo_2", waveform: "triangle", rateBeats: 4, phase: 0 },
          { id: "lfo_3", waveform: "sine", rateBeats: 2, phase: 0 },
        ],
        automations: [
          {
            target: "rotationSpeed",
            actorId: "main_entity",
            from: 0.9,
            to: 1.6,
            easing: "easeInOutCubic",
          },
          {
            target: "zoom",
            from: 0.96,
            to: 1.18,
            easing: "easeInOutCubic",
          },
          {
            target: "fov",
            from: 68,
            to: 78,
            easing: "easeInOutCubic",
          },
        ],
        cameraCuts: [
          { mode: "fps_arms", rig: "first_person_fly", fov: 74, switchEveryBars: 4, transition: "glide" },
          { mode: "orbit", rig: "orbit_smooth", fov: 78, switchEveryBars: 4, onPeakBand: "snare", transition: "glide" },
        ],
        environment: {
          skyColor: "#04030C",
          fogColor: "#1E1B4B",
          fogDensity: 0.025,
          terrainType: "tunnel",
          terrainSpeed: 14.0,
          terrainPrimaryColor: "#22D3EE",
          terrainSecondaryColor: "#F43F5E",
          lightingPreset: "cyber_neon",
          backdropType: "starfield",
          backdropColors: ["#03020A", "#0F172A", "#31104B"],
          fog: { enabled: true, color: "#090618", density: 0.028 },
        },
        subject: {
          meshType: "none",
          primaryColor: "#22D3EE",
          accentColor: "#F43F5E",
          wireframeOverlay: false,
          scale: 1.0,
        },
        actors: [
          {
            id: "main_entity",
            type: "particle_swarm",
            shapeTarget: "tunnel",
            position: [0, 0, 4.8],
            scale: 1.35,
            color: "#22D3EE",
            secondaryColor: "#F43F5E",
            count: 5000,
            behavior: "curl_noise_flow",
            speed: 1.35,
            audioModulation: [
              { source: "bass", target: "scale", amount: 0.35, offset: 0 },
              { source: "lfo_3", target: "rotationSpeed", amount: 0.4, offset: 0 },
            ],
          },
          {
            id: "ambient_swarm",
            type: "particle_swarm",
            shapeTarget: "tunnel",
            position: [0, 0, 5.4],
            scale: 1.2,
            color: "#FACC15",
            secondaryColor: "#A855F7",
            count: 5000,
            behavior: "vortex",
            speed: 1.2,
          },
        ],
        postFX: [
          { type: "bloom", intensity: 0.9, threshold: 0.45 },
          { type: "depth_of_field", intensity: 0.45, radius: 2.5 },
          { type: "chromatic_aberration", intensity: 0.12 },
        ],
        postFx: {
          ps1VertexJitter: 0,
          crtScanlines: 0,
          chromaticAberration: 0.08,
          kaleidoscopeSegments: 0,
          bloomIntensity: 0.85,
        },
        camera: {
          mode: "fps_arms",
          rig: "first_person_fly",
          beatCut: false,
          fov: 76,
          shakeIntensity: 0.1,
        },
        audioMapping: {
          bassTarget: "tunnel_boost",
          midTarget: "subject_rotation",
          trebleTarget: "particles_burst",
          fluxTarget: "glitch_and_emissive",
        },
      }),
      createDefaultAnarchy3DScene(3, {
        id: "v6-drop-recomposition",
        name: "04. Drop — Recomposition Hybride Chrome & Pie-Eyes",
        version: 6,
        durationBars: 8,
        transition: "morph",
        morphTransition: { durationBeats: 4, easing: "easeInOutCubic" },
        compositionMode: "void_orbital",
        renderStyle: {
          resolutionScale: 1.0,
          shading: "chrome_reflective",
          outlineThickness: 3,
          toneMapping: "aces_filmic",
        },
        cartoonPhysics: {
          steppedFps: 60,
          squashStretch: 0.55,
          squashTrigger: "bass",
          lineBoil: 0.3,
          faderBindings: {
            squashStretch: "fader_1",
            lineBoil: "fader_2",
          },
        },
        modulators: [
          { id: "lfo_1", waveform: "sine", rateBeats: 2, phase: 0 },
          { id: "lfo_4", waveform: "triangle", rateBeats: 4, phase: 0 },
        ],
        automations: [
          {
            target: "scale",
            actorId: "main_entity",
            from: 1.15,
            to: 1.38,
            easing: "easeInOutCubic",
          },
        ],
        cameraCuts: [
          { mode: "orbit", rig: "orbit_smooth", fov: 72, switchEveryBars: 4, onPeakBand: "kick", transition: "glide" },
          { mode: "dramatic_tilt", rig: "dolly_zoom_on_kick", fov: 76, switchEveryBars: 4, onPeakBand: "snare", transition: "glide" },
        ],
        environment: {
          skyColor: "#140524",
          fogColor: "#4C0519",
          fogDensity: 0.02,
          terrainType: "mirror_floor",
          terrainSpeed: 12.0,
          terrainPrimaryColor: "#F43F5E",
          terrainSecondaryColor: "#22D3EE",
          lightingPreset: "cyber_neon",
          backdropType: "liquid_plasma",
          backdropColors: ["#0F041D", "#831843", "#0284C7"],
          fog: { enabled: true, color: "#1E0933", density: 0.02 },
        },
        subject: {
          meshType: "none",
          primaryColor: "#F43F5E",
          accentColor: "#22D3EE",
          wireframeOverlay: false,
          scale: 1.0,
        },
        actors: [
          {
            id: "main_entity",
            type: "organic_blob",
            position: [0, 0.05, 4.6],
            scale: 1.35,
            color: "#F8FAFC",
            secondaryColor: "#F43F5E",
            material: "chrome",
            detail: 32,
            noiseStrength: 0.65,
            noiseFrequency: 2.0,
            speed: 1.35,
            audioModulation: [
              { source: "kick", target: "squashStretch", amount: 0.45, offset: 0 },
              { source: "lfo_1", target: "scale", amount: 0.2, offset: 0 },
            ],
          },
          {
            id: "ambient_swarm",
            type: "particle_swarm",
            shapeTarget: "text_outline",
            position: [0, 0, 4.4],
            scale: 1.25,
            color: "#FACC15",
            secondaryColor: "#22D3EE",
            count: 4200,
            behavior: "vortex",
            speed: 1.25,
          },
          {
            id: "drop_pie_eyes",
            type: "rubber_hose_mesh",
            shape: "pie_eyes",
            position: [0, 0.1, 4.1],
            scale: 1.05,
            color: "#FFFBEB",
            secondaryColor: "#09090B",
            inkThickness: 3.4,
            speed: 1.3,
          },
        ],
        postFX: [
          { type: "bloom", intensity: 0.85, threshold: 0.45 },
          { type: "toon_outline", inkThickness: 2.8, inkJitter: 0.3, color: "#09090B" },
          { type: "chromatic_aberration", intensity: 0.1 },
        ],
        postFx: {
          ps1VertexJitter: 0,
          crtScanlines: 0,
          chromaticAberration: 0.08,
          kaleidoscopeSegments: 0,
          bloomIntensity: 0.75,
        },
        camera: {
          mode: "orbit",
          rig: "orbit_smooth",
          beatCut: false,
          fov: 72,
          shakeIntensity: 0.08,
        },
        audioMapping: {
          bassTarget: "camera_zoom_and_jump",
          midTarget: "color_shift",
          trebleTarget: "sky_flash",
          fluxTarget: "glitch_and_emissive",
        },
      }),
    ],
  },
  {
    packId: "v7-cartoon-physics-showcase",
    name: "V7 Physics // Cartoon Collisions & Rubber-Hose Springs",
    author: "Anarchy Visual Studio",
    bpm: 128,
    beatsPerScene: 16,
    seed: 70707,
    scenes: [
      createDefaultAnarchy3DScene(0, {
        id: "v7-chrome-comic-rain",
        name: "01. Pluie de Sphères Chrome & Formes BD sur le Kick",
        version: 7,
        durationBars: 8,
        transition: "morph",
        morphTransition: { durationBeats: 4, easing: "easeInOutCubic" },
        compositionMode: "void_orbital",
        renderStyle: {
          resolutionScale: 1.0,
          shading: "chrome_reflective",
          outlineThickness: 3,
          toneMapping: "aces_filmic",
        },
        physicsWorld: {
          enabled: true,
          gravity: [0, -9.8, 0],
          bounds: {
            shape: "floor_only",
            radiusOrSize: 2.2,
            restitution: 0.92,
          },
          faderBindings: {
            gravity: "fader_1",
            restitution: "fader_2",
            impulseForce: "fader_3",
            springStiffness: "fader_4",
          },
        },
        cartoonPhysics: {
          steppedFps: 60,
          squashStretch: 0.65,
          squashTrigger: "kick",
          lineBoil: 0.25,
        },
        environment: {
          skyColor: "#0B1021",
          fogColor: "#1E293B",
          fogDensity: 0.018,
          terrainType: "mirror_floor",
          terrainSpeed: 9.0,
          terrainPrimaryColor: "#38BDF8",
          terrainSecondaryColor: "#F43F5E",
          lightingPreset: "studio_clean",
          backdropType: "gradient_sky",
          backdropColors: ["#0B1021", "#1E293B", "#0F172A"],
          fog: { enabled: true, color: "#0F172A", density: 0.018 },
        },
        subject: {
          meshType: "none",
          primaryColor: "#E2E8F0",
          accentColor: "#38BDF8",
          wireframeOverlay: false,
          scale: 1.0,
        },
        actors: [
          {
            id: "main_entity",
            type: "organic_blob",
            position: [-0.85, 0.9, 4.8],
            scale: 0.95,
            color: "#F8FAFC",
            secondaryColor: "#38BDF8",
            material: "chrome",
            detail: 28,
            noiseStrength: 0.45,
            noiseFrequency: 1.7,
            speed: 1.25,
            physics: {
              bodyType: "dynamic",
              mass: 1.4,
              restitution: 0.96,
              friction: 0.12,
              linearDamping: 0.06,
              collisionSquash: true,
              audioImpulses: [
                {
                  source: "bass",
                  force: [0.8, 7.8, 0],
                  torque: [0, 0, 2.2],
                  randomSpread: 1.1,
                },
              ],
            },
          },
          {
            id: "comic_bouncer",
            type: "rubber_hose_mesh",
            shape: "pie_eyes",
            position: [0.85, 1.2, 4.7],
            scale: 0.9,
            color: "#FACC15",
            secondaryColor: "#F43F5E",
            material: "toon_cel_outline",
            inkThickness: 3.4,
            speed: 1.3,
            physics: {
              bodyType: "dynamic",
              mass: 1.0,
              restitution: 1.05,
              friction: 0.1,
              linearDamping: 0.05,
              collisionSquash: true,
              audioImpulses: [
                {
                  source: "kick",
                  force: [-0.7, 8.4, 0],
                  torque: [0, 0, -2.5],
                  randomSpread: 1.2,
                },
              ],
            },
          },
          {
            id: "kick_spawner",
            type: "physics_spawner",
            position: [0, 1.65, 4.9],
            scale: 0.85,
            color: "#38BDF8",
            secondaryColor: "#FACC15",
            material: "chrome",
            spawnShape: "chrome_sphere",
            spawnRateBeats: 1,
            spawnOnKick: true,
            ttlBars: 4,
            maxInstances: 14,
            physics: {
              bodyType: "dynamic",
              mass: 0.75,
              restitution: 0.95,
              friction: 0.08,
              linearDamping: 0.04,
              collisionSquash: true,
              audioImpulses: [
                {
                  source: "bass",
                  force: [0, 5.5, 0],
                  randomSpread: 1.6,
                },
              ],
            },
          },
        ],
        postFX: [
          { type: "bloom", intensity: 0.85, threshold: 0.48 },
          { type: "toon_outline", inkThickness: 2.8, inkJitter: 0.25, color: "#09090B" },
        ],
        postFx: {
          ps1VertexJitter: 0,
          crtScanlines: 0,
          chromaticAberration: 0.05,
          kaleidoscopeSegments: 0,
          bloomIntensity: 0.75,
        },
        camera: {
          mode: "orbit",
          rig: "orbit_smooth",
          beatCut: false,
          fov: 68,
          shakeIntensity: 0.06,
        },
        audioMapping: {
          bassTarget: "subject_pulse",
          midTarget: "color_shift",
          trebleTarget: "particles_burst",
          fluxTarget: "glitch_and_emissive",
        },
      }),
      createDefaultAnarchy3DScene(1, {
        id: "v7-zero-g-rubber-chain",
        name: "02. Chaîne Articulée Rubber-Hose en Apesanteur",
        version: 7,
        durationBars: 8,
        transition: "morph",
        morphTransition: { durationBeats: 4, easing: "easeInOutCubic" },
        compositionMode: "void_orbital",
        renderStyle: {
          resolutionScale: 1.0,
          shading: "toon_cel",
          outlineThickness: 3.5,
          toneMapping: "reinhard",
        },
        physicsWorld: {
          enabled: true,
          gravity: [0, 0, 0],
          bounds: {
            shape: "sphere",
            radiusOrSize: 2.35,
            restitution: 0.88,
          },
          faderBindings: {
            gravity: "fader_1",
            restitution: "fader_2",
            impulseForce: "fader_3",
            springStiffness: "fader_4",
          },
        },
        joints: [
          {
            type: "spring",
            actorA: "chain_anchor",
            actorB: "main_entity",
            stiffness: 22.0,
            damping: 0.9,
            restLength: 0.72,
          },
          {
            type: "spring",
            actorA: "main_entity",
            actorB: "comic_bouncer",
            stiffness: 18.0,
            damping: 0.85,
            restLength: 0.75,
          },
          {
            type: "spring",
            actorA: "comic_bouncer",
            actorB: "chain_tail",
            stiffness: 15.0,
            damping: 0.8,
            restLength: 0.72,
          },
        ],
        cartoonPhysics: {
          steppedFps: 60,
          squashStretch: 0.55,
          squashTrigger: "snare",
          lineBoil: 0.3,
        },
        environment: {
          skyColor: "#130722",
          fogColor: "#2E1065",
          fogDensity: 0.018,
          terrainType: "infinite_grid",
          terrainSpeed: 8.0,
          terrainPrimaryColor: "#A855F7",
          terrainSecondaryColor: "#22D3EE",
          lightingPreset: "cyber_neon",
          backdropType: "liquid_plasma",
          backdropColors: ["#130722", "#3B0764", "#0E7490"],
          fog: { enabled: true, color: "#1E1B4B", density: 0.02 },
        },
        subject: {
          meshType: "none",
          primaryColor: "#A855F7",
          accentColor: "#22D3EE",
          wireframeOverlay: false,
          scale: 1.0,
        },
        actors: [
          {
            id: "chain_anchor",
            type: "rubber_hose_mesh",
            shape: "vintage_wheel",
            position: [0, 1.15, 4.7],
            scale: 0.7,
            color: "#FACC15",
            secondaryColor: "#09090B",
            material: "toon_cel_outline",
            inkThickness: 3.4,
            speed: 1.2,
            physics: {
              bodyType: "kinematic",
              mass: 2.0,
              restitution: 0.8,
            },
          },
          {
            id: "main_entity",
            type: "rubber_hose_mesh",
            shape: "boss_character",
            position: [-0.35, 0.35, 4.7],
            scale: 0.95,
            color: "#F43F5E",
            secondaryColor: "#FACC15",
            material: "toon_cel_outline",
            inkThickness: 3.8,
            speed: 1.3,
            physics: {
              bodyType: "dynamic",
              mass: 1.2,
              restitution: 0.9,
              friction: 0.1,
              linearDamping: 0.12,
              collisionSquash: true,
              audioImpulses: [
                {
                  source: "snare",
                  force: [3.8, -1.5, 0],
                  torque: [0, 0, 2.0],
                  randomSpread: 1.4,
                },
              ],
            },
          },
          {
            id: "comic_bouncer",
            type: "organic_blob",
            position: [0.35, -0.35, 4.7],
            scale: 0.85,
            color: "#22D3EE",
            secondaryColor: "#A855F7",
            material: "chrome",
            detail: 26,
            noiseStrength: 0.5,
            noiseFrequency: 1.9,
            speed: 1.35,
            physics: {
              bodyType: "dynamic",
              mass: 1.0,
              restitution: 0.92,
              friction: 0.1,
              linearDamping: 0.12,
              collisionSquash: true,
              audioImpulses: [
                {
                  source: "bass",
                  force: [-3.6, 2.2, 0],
                  randomSpread: 1.5,
                },
              ],
            },
          },
          {
            id: "chain_tail",
            type: "rubber_hose_mesh",
            shape: "music_notes",
            position: [0, -1.1, 4.7],
            scale: 0.85,
            color: "#FACC15",
            secondaryColor: "#F43F5E",
            material: "toon_cel_outline",
            inkThickness: 3.4,
            speed: 1.4,
            physics: {
              bodyType: "dynamic",
              mass: 0.8,
              restitution: 0.95,
              friction: 0.08,
              linearDamping: 0.1,
              collisionSquash: true,
              audioImpulses: [
                {
                  source: "treble",
                  force: [2.8, 3.2, 0],
                  randomSpread: 1.8,
                },
              ],
            },
          },
        ],
        postFX: [
          { type: "bloom", intensity: 0.9, threshold: 0.45 },
          { type: "toon_outline", inkThickness: 3.0, inkJitter: 0.3, color: "#09090B" },
        ],
        postFx: {
          ps1VertexJitter: 0,
          crtScanlines: 0,
          chromaticAberration: 0.06,
          kaleidoscopeSegments: 0,
          bloomIntensity: 0.8,
        },
        camera: {
          mode: "orbit",
          rig: "orbit_smooth",
          beatCut: false,
          fov: 70,
          shakeIntensity: 0.06,
        },
        audioMapping: {
          bassTarget: "subject_pulse",
          midTarget: "subject_rotation",
          trebleTarget: "particles_burst",
          fluxTarget: "glitch_and_emissive",
        },
      }),
      createDefaultAnarchy3DScene(2, {
        id: "v7-cuphead-collision-arena",
        name: "03. Arène de Collision Cuphead & Squash & Stretch",
        version: 7,
        durationBars: 8,
        transition: "morph",
        morphTransition: { durationBeats: 4, easing: "easeInOutCubic" },
        compositionMode: "void_orbital",
        renderStyle: {
          resolutionScale: 1.0,
          shading: "toon_cel",
          outlineThickness: 4,
          toneMapping: "reinhard",
        },
        physicsWorld: {
          enabled: true,
          gravity: [0, -7.5, 0],
          bounds: {
            shape: "box",
            radiusOrSize: 2.15,
            restitution: 1.02,
          },
          faderBindings: {
            gravity: "fader_1",
            restitution: "fader_2",
            impulseForce: "fader_3",
            springStiffness: "fader_4",
          },
        },
        cartoonPhysics: {
          steppedFps: 60,
          squashStretch: 0.85,
          squashTrigger: "kick",
          lineBoil: 0.35,
        },
        environment: {
          skyColor: "#F6E7C1",
          fogColor: "#D9B37C",
          fogDensity: 0.014,
          terrainType: "mirror_floor",
          terrainSpeed: 9.0,
          terrainPrimaryColor: "#DC2626",
          terrainSecondaryColor: "#FACC15",
          lightingPreset: "sunset_warm",
          backdropType: "gradient_sky",
          backdropColors: ["#F6E7C1", "#E9C78B", "#C68B59"],
          fog: { enabled: true, color: "#E2C08D", density: 0.015 },
        },
        subject: {
          meshType: "none",
          primaryColor: "#DC2626",
          accentColor: "#FACC15",
          wireframeOverlay: false,
          scale: 1.0,
        },
        actors: [
          {
            id: "main_entity",
            type: "rubber_hose_mesh",
            shape: "boss_character",
            position: [-0.75, 0.2, 4.6],
            scale: 1.1,
            color: "#DC2626",
            secondaryColor: "#FACC15",
            material: "toon_cel_outline",
            inkThickness: 3.8,
            speed: 1.35,
            physics: {
              bodyType: "dynamic",
              mass: 1.6,
              restitution: 1.05,
              friction: 0.1,
              linearDamping: 0.05,
              collisionSquash: true,
              audioImpulses: [
                {
                  source: "bass",
                  force: [4.5, 8.2, 0],
                  torque: [0, 0, 2.5],
                  randomSpread: 1.3,
                },
              ],
            },
          },
          {
            id: "comic_bouncer",
            type: "cartoon_sprite",
            position: [0.75, 0.35, 4.6],
            scale: 1.05,
            color: "#06B6D4",
            secondaryColor: "#FACC15",
            framesX: 4,
            framesY: 1,
            bpmSync: true,
            inkOutline: true,
            inkThickness: 3.6,
            speed: 1.3,
            physics: {
              bodyType: "dynamic",
              mass: 1.3,
              restitution: 1.08,
              friction: 0.1,
              linearDamping: 0.05,
              collisionSquash: true,
              audioImpulses: [
                {
                  source: "snare",
                  force: [-4.8, 7.8, 0],
                  torque: [0, 0, -2.5],
                  randomSpread: 1.3,
                },
              ],
            },
          },
          {
            id: "arena_note_spawner",
            type: "physics_spawner",
            position: [0, 1.35, 4.7],
            scale: 0.85,
            color: "#DC2626",
            secondaryColor: "#FACC15",
            material: "toon_cel_outline",
            spawnShape: "music_note",
            spawnRateBeats: 1,
            spawnOnKick: true,
            ttlBars: 3,
            maxInstances: 12,
            physics: {
              bodyType: "dynamic",
              mass: 0.7,
              restitution: 1.0,
              friction: 0.08,
              linearDamping: 0.04,
              collisionSquash: true,
              audioImpulses: [
                {
                  source: "treble",
                  force: [0, 6.2, 0],
                  randomSpread: 2.0,
                },
              ],
            },
          },
        ],
        postFX: [
          { type: "toon_outline", inkThickness: 3.4, inkJitter: 0.35, color: "#0B0908" },
          {
            type: "vintage_1930_film",
            filmGrain: 0.24,
            scratchesAndDust: 0.2,
            gateWeave: 0.14,
            colorGrade: "technicolor_30s",
            vignette: 0.45,
          },
        ],
        postFx: {
          ps1VertexJitter: 0,
          crtScanlines: 0,
          chromaticAberration: 0,
          kaleidoscopeSegments: 0,
          bloomIntensity: 0.35,
        },
        camera: {
          mode: "orbit",
          rig: "orbit_smooth",
          beatCut: false,
          fov: 68,
          shakeIntensity: 0.06,
        },
        audioMapping: {
          bassTarget: "subject_pulse",
          midTarget: "camera_sway",
          trebleTarget: "particles_burst",
          fluxTarget: "glitch_and_emissive",
        },
      }),
    ],
  },
  ...buildFictionalUniversePacks(createDefaultAnarchy3DScene),
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

function sanitizeRenderStyle(raw: unknown): Anarchy3DRenderStyle | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const rs = raw as Record<string, unknown>;
  const resolutionScale =
    rs.resolutionScale !== undefined
      ? Number(clampNum(rs.resolutionScale, 0.15, 1.0, 0.5).toFixed(2))
      : undefined;
  const shading: AnarchyShadingMode = SHADING_SET.has(rs.shading as AnarchyShadingMode)
    ? (rs.shading as AnarchyShadingMode)
    : "flat";
  const outlineThickness =
    rs.outlineThickness !== undefined
      ? Number(clampNum(rs.outlineThickness, 0, 6, 0).toFixed(2))
      : undefined;
  const toneMapping: AnarchyToneMapping | undefined = TONE_MAPPING_SET.has(
    rs.toneMapping as AnarchyToneMapping
  )
    ? (rs.toneMapping as AnarchyToneMapping)
    : undefined;
  return {
    ...(resolutionScale !== undefined ? { resolutionScale } : {}),
    shading,
    ...(outlineThickness !== undefined ? { outlineThickness } : {}),
    ...(toneMapping ? { toneMapping } : {}),
  };
}

function sanitizeAudioModulations(
  raw: unknown
): Anarchy3DAudioModulation[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const valid: Anarchy3DAudioModulation[] = [];
  for (const item of raw.slice(0, 12)) {
    if (!item || typeof item !== "object") continue;
    const m = item as Record<string, unknown>;
    const source: AnarchyModulationSource = MODULATION_SOURCE_SET.has(
      m.source as AnarchyModulationSource
    )
      ? (m.source as AnarchyModulationSource)
      : "bass";
    const target: AnarchyModulationTarget = MODULATION_TARGET_SET.has(
      m.target as AnarchyModulationTarget
    )
      ? (m.target as AnarchyModulationTarget)
      : "scale";
    valid.push({
      source,
      target,
      amount: Number(clampNum(m.amount, -5, 5, 0.5).toFixed(2)),
      ...(m.offset !== undefined
        ? { offset: Number(clampNum(m.offset, -5, 5, 0).toFixed(2)) }
        : {}),
    });
  }
  return valid.length > 0 ? valid : undefined;
}

function sanitizeActorPhysics(raw: unknown): Anarchy3DActorPhysics | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const p = raw as Record<string, unknown>;
  const bodyType: AnarchyPhysicsBodyType = PHYSICS_BODY_TYPE_SET.has(
    p.bodyType as AnarchyPhysicsBodyType
  )
    ? (p.bodyType as AnarchyPhysicsBodyType)
    : "dynamic";
  let audioImpulses: Anarchy3DAudioImpulse[] | undefined;
  if (Array.isArray(p.audioImpulses)) {
    const validImp: Anarchy3DAudioImpulse[] = [];
    for (const item of p.audioImpulses.slice(0, 8)) {
      if (!item || typeof item !== "object") continue;
      const imp = item as Record<string, unknown>;
      const source: AnarchyPhysicsImpulseSource = PHYSICS_IMPULSE_SOURCE_SET.has(
        imp.source as AnarchyPhysicsImpulseSource
      )
        ? (imp.source as AnarchyPhysicsImpulseSource)
        : "bass";
      const force = sanitizeVec3(imp.force, [0, 5, 0], -40, 40);
      const torque = Array.isArray(imp.torque)
        ? sanitizeVec3(imp.torque, [0, 0, 0], -40, 40)
        : undefined;
      validImp.push({
        source,
        force,
        ...(torque ? { torque } : {}),
        ...(imp.randomSpread !== undefined
          ? { randomSpread: Number(clampNum(imp.randomSpread, 0, 10, 0.8).toFixed(2)) }
          : {}),
      });
    }
    if (validImp.length > 0) audioImpulses = validImp;
  }
  return {
    bodyType,
    ...(p.mass !== undefined
      ? { mass: Number(clampNum(p.mass, 0.1, 50, 1.0).toFixed(2)) }
      : {}),
    ...(p.restitution !== undefined
      ? { restitution: Number(clampNum(p.restitution, 0, 1.2, 0.85).toFixed(2)) }
      : {}),
    ...(p.friction !== undefined
      ? { friction: Number(clampNum(p.friction, 0, 1, 0.15).toFixed(2)) }
      : {}),
    ...(p.linearDamping !== undefined
      ? { linearDamping: Number(clampNum(p.linearDamping, 0, 1, 0.08).toFixed(2)) }
      : {}),
    ...(typeof p.collisionSquash === "boolean"
      ? { collisionSquash: p.collisionSquash }
      : {}),
    ...(audioImpulses ? { audioImpulses } : {}),
  };
}

function sanitizePhysicsWorld(raw: unknown): Anarchy3DPhysicsWorld | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const pw = raw as Record<string, unknown>;
  const enabled = typeof pw.enabled === "boolean" ? pw.enabled : true;
  const gravity = sanitizeVec3(pw.gravity, [0, -9.8, 0], -40, 40);
  const rawBounds =
    pw.bounds && typeof pw.bounds === "object"
      ? (pw.bounds as Record<string, unknown>)
      : {};
  const shape: AnarchyPhysicsBoundsShape = PHYSICS_BOUNDS_SHAPE_SET.has(
    rawBounds.shape as AnarchyPhysicsBoundsShape
  )
    ? (rawBounds.shape as AnarchyPhysicsBoundsShape)
    : "box";
  const bounds: Anarchy3DPhysicsBounds = {
    shape,
    radiusOrSize: Number(clampNum(rawBounds.radiusOrSize, 0.8, 8, 2.4).toFixed(2)),
    restitution: Number(clampNum(rawBounds.restitution, 0, 1.2, 0.85).toFixed(2)),
  };
  let faderBindings: Anarchy3DPhysicsWorld["faderBindings"];
  if (pw.faderBindings && typeof pw.faderBindings === "object") {
    const fb = pw.faderBindings as Record<string, unknown>;
    const cleanFb: NonNullable<Anarchy3DPhysicsWorld["faderBindings"]> = {};
    const keys = [
      "gravity",
      "restitution",
      "impulseForce",
      "springStiffness",
    ] as const;
    for (const k of keys) {
      if (MODULATION_SOURCE_SET.has(fb[k] as AnarchyModulationSource)) {
        cleanFb[k] = fb[k] as AnarchyModulationSource;
      }
    }
    if (Object.keys(cleanFb).length > 0) {
      faderBindings = cleanFb;
    }
  }
  return {
    enabled,
    gravity,
    bounds,
    ...(faderBindings ? { faderBindings } : {}),
  };
}

function sanitizePhysicsJoints(raw: unknown): Anarchy3DPhysicsJoint[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const valid: Anarchy3DPhysicsJoint[] = [];
  for (const item of raw.slice(0, 16)) {
    if (!item || typeof item !== "object") continue;
    const j = item as Record<string, unknown>;
    const type: AnarchyPhysicsJointType = PHYSICS_JOINT_TYPE_SET.has(
      j.type as AnarchyPhysicsJointType
    )
      ? (j.type as AnarchyPhysicsJointType)
      : "spring";
    const actorA = typeof j.actorA === "string" ? j.actorA.trim() : "";
    const actorB = typeof j.actorB === "string" ? j.actorB.trim() : "";
    if (!actorA || !actorB) continue;
    valid.push({
      type,
      actorA,
      actorB,
      stiffness: Number(clampNum(j.stiffness, 1, 80, 18).toFixed(2)),
      damping: Number(clampNum(j.damping, 0.05, 5, 0.85).toFixed(2)),
      restLength: Number(clampNum(j.restLength, 0.15, 4, 0.65).toFixed(2)),
    });
  }
  return valid.length > 0 ? valid : undefined;
}

function sanitizeActors(raw: unknown): Anarchy3DActor[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const valid: Anarchy3DActor[] = [];
  for (let i = 0; i < Math.min(raw.length, 10); i++) {
    const item = raw[i];
    if (!item || typeof item !== "object") continue;
    const a = item as Record<string, unknown>;
    const type: AnarchyActorType = ACTOR_TYPE_SET.has(a.type as AnarchyActorType)
      ? (a.type as AnarchyActorType)
      : "organic_blob";
    const material: AnarchyMaterialOverride | undefined = MATERIAL_OVERRIDE_SET.has(
      a.material as AnarchyMaterialOverride
    )
      ? (a.material as AnarchyMaterialOverride)
      : undefined;
    const behavior: AnarchySwarmBehavior | undefined = SWARM_BEHAVIOR_SET.has(
      a.behavior as AnarchySwarmBehavior
    )
      ? (a.behavior as AnarchySwarmBehavior)
      : type === "particle_swarm"
      ? "curl_noise_flow"
      : undefined;
    const scaleVal: number | [number, number, number] = Array.isArray(a.scale)
      ? [
          Number(clampNum(a.scale[0], 0.1, 8, 1).toFixed(2)),
          Number(clampNum(a.scale[1], 0.1, 8, 1).toFixed(2)),
          Number(clampNum(a.scale[2], 0.1, 8, 1).toFixed(2)),
        ]
      : Number(clampNum(a.scale, 0.1, 8, 1).toFixed(2));
    const position: [number, number, number] | undefined = Array.isArray(a.position)
      ? [
          Number(clampNum(a.position[0], -12, 12, 0).toFixed(2)),
          Number(clampNum(a.position[1], -12, 12, 0).toFixed(2)),
          Number(clampNum(a.position[2], 1, 20, 5).toFixed(2)),
        ]
      : undefined;
    const rotation: [number, number, number] | undefined = Array.isArray(a.rotation)
      ? [
          Number(clampNum(a.rotation[0], -Math.PI * 2, Math.PI * 2, 0).toFixed(2)),
          Number(clampNum(a.rotation[1], -Math.PI * 2, Math.PI * 2, 0).toFixed(2)),
          Number(clampNum(a.rotation[2], -Math.PI * 2, Math.PI * 2, 0).toFixed(2)),
        ]
      : undefined;
    const audioModulation = sanitizeAudioModulations(a.audioModulation);
    const physics = sanitizeActorPhysics(a.physics);
    valid.push({
      ...(typeof a.id === "string" && a.id.trim() ? { id: a.id.trim() } : { id: `actor-${i + 1}` }),
      type,
      ...(position ? { position } : {}),
      ...(rotation ? { rotation } : {}),
      scale: scaleVal,
      color: sanitizeHexColor(a.color, "#38BDF8"),
      ...(a.secondaryColor !== undefined
        ? { secondaryColor: sanitizeHexColor(a.secondaryColor, "#F472B6") }
        : {}),
      ...(material ? { material } : {}),
      ...(a.detail !== undefined
        ? { detail: Math.round(clampNum(a.detail, 8, 48, 22)) }
        : {}),
      ...(a.noiseStrength !== undefined
        ? { noiseStrength: Number(clampNum(a.noiseStrength, 0, 2.5, 0.6).toFixed(2)) }
        : {}),
      ...(a.noiseFrequency !== undefined
        ? { noiseFrequency: Number(clampNum(a.noiseFrequency, 0.2, 6, 1.5).toFixed(2)) }
        : {}),
      ...(a.speed !== undefined
        ? { speed: Number(clampNum(a.speed, 0, 8, 1.2).toFixed(2)) }
        : {}),
      ...(a.count !== undefined
        ? { count: Math.round(clampNum(a.count, 1000, 10000, 3000)) }
        : {}),
      ...(behavior ? { behavior } : {}),
      ...(a.ribbonCount !== undefined
        ? { ribbonCount: Math.round(clampNum(a.ribbonCount, 2, 16, 6)) }
        : {}),
      ...(a.thickness !== undefined
        ? { thickness: Number(clampNum(a.thickness, 0.5, 8, 2.2).toFixed(2)) }
        : {}),
      ...(typeof a.url === "string" && a.url.trim() ? { url: a.url.trim() } : {}),
      ...(typeof a.label === "string" && a.label.trim() ? { label: a.label.trim() } : {}),
      ...(a.parallax !== undefined
        ? { parallax: Number(clampNum(a.parallax, 0, 2, 1).toFixed(2)) }
        : {}),
      ...(a.scrollX !== undefined
        ? { scrollX: Number(clampNum(a.scrollX, -5, 5, 0.5).toFixed(2)) }
        : {}),
      ...(a.scrollY !== undefined
        ? { scrollY: Number(clampNum(a.scrollY, -5, 5, 0).toFixed(2)) }
        : {}),
      ...(PARALLAX_PATTERN_SET.has(a.pattern as AnarchyParallaxPattern)
        ? { pattern: a.pattern as AnarchyParallaxPattern }
        : {}),
      ...(a.depthBlur !== undefined
        ? { depthBlur: Number(clampNum(a.depthBlur, 0, 1, 0).toFixed(2)) }
        : {}),
      ...(a.framesX !== undefined
        ? { framesX: Math.round(clampNum(a.framesX, 1, 16, 4)) }
        : {}),
      ...(a.framesY !== undefined
        ? { framesY: Math.round(clampNum(a.framesY, 1, 16, 1)) }
        : {}),
      ...(typeof a.bpmSync === "boolean" ? { bpmSync: a.bpmSync } : {}),
      ...(typeof a.inkOutline === "boolean" ? { inkOutline: a.inkOutline } : {}),
      ...(RUBBER_HOSE_SHAPE_SET.has(a.shape as AnarchyRubberHoseShape)
        ? { shape: a.shape as AnarchyRubberHoseShape }
        : {}),
      ...(a.inkThickness !== undefined
        ? { inkThickness: Number(clampNum(a.inkThickness, 1, 6, 3.2).toFixed(2)) }
        : {}),
      ...(SWARM_SHAPE_TARGET_SET.has(a.shapeTarget as AnarchySwarmShapeTarget)
        ? { shapeTarget: a.shapeTarget as AnarchySwarmShapeTarget }
        : {}),
      ...(physics ? { physics } : {}),
      ...(PHYSICS_SPAWN_SHAPE_SET.has(a.spawnShape as AnarchyPhysicsSpawnShape)
        ? { spawnShape: a.spawnShape as AnarchyPhysicsSpawnShape }
        : {}),
      ...(a.spawnRateBeats !== undefined
        ? { spawnRateBeats: Number(clampNum(a.spawnRateBeats, 0.25, 16, 1).toFixed(2)) }
        : {}),
      ...(typeof a.spawnOnKick === "boolean" ? { spawnOnKick: a.spawnOnKick } : {}),
      ...(a.ttlBars !== undefined
        ? { ttlBars: Number(clampNum(a.ttlBars, 0.5, 32, 4).toFixed(2)) }
        : {}),
      ...(a.maxInstances !== undefined
        ? { maxInstances: Math.round(clampNum(a.maxInstances, 2, 32, 14)) }
        : {}),
      ...(audioModulation ? { audioModulation } : {}),
    });
  }
  return valid.length > 0 ? valid : undefined;
}

function sanitizeCartoonPhysics(
  raw: unknown
): Anarchy3DCartoonPhysics | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const cp = raw as Record<string, unknown>;
  const rawFps = Number(cp.steppedFps);
  const steppedFps: AnarchySteppedFps | undefined =
    rawFps === 12 || rawFps === 24 || rawFps === 60
      ? rawFps
      : cp.steppedFps !== undefined
      ? 24
      : undefined;
  const squashTrigger =
    cp.squashTrigger === "bass" ||
    cp.squashTrigger === "snare" ||
    cp.squashTrigger === "kick" ||
    cp.squashTrigger === "energy"
      ? cp.squashTrigger
      : undefined;

  let faderBindings: Anarchy3DCartoonPhysics["faderBindings"];
  if (cp.faderBindings && typeof cp.faderBindings === "object") {
    const fb = cp.faderBindings as Record<string, unknown>;
    const cleanFb: NonNullable<Anarchy3DCartoonPhysics["faderBindings"]> = {};
    const keys = [
      "squashStretch",
      "lineBoil",
      "filmGrain",
      "parallaxSpeed",
      "steppedFps",
    ] as const;
    for (const k of keys) {
      if (MODULATION_SOURCE_SET.has(fb[k] as AnarchyModulationSource)) {
        cleanFb[k] = fb[k] as AnarchyModulationSource;
      }
    }
    if (Object.keys(cleanFb).length > 0) {
      faderBindings = cleanFb;
    }
  }

  return {
    ...(steppedFps !== undefined ? { steppedFps } : {}),
    ...(cp.squashStretch !== undefined
      ? { squashStretch: Number(clampNum(cp.squashStretch, 0, 1.5, 0.6).toFixed(2)) }
      : {}),
    ...(squashTrigger ? { squashTrigger } : {}),
    ...(cp.lineBoil !== undefined
      ? { lineBoil: Number(clampNum(cp.lineBoil, 0, 2, 0.8).toFixed(2)) }
      : {}),
    ...(faderBindings ? { faderBindings } : {}),
  };
}

function sanitizeMorphTransition(
  raw: unknown
): Anarchy3DMorphTransition | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const mt = raw as Record<string, unknown>;
  const easing: AnarchyMorphEasing = MORPH_EASING_SET.has(
    mt.easing as AnarchyMorphEasing
  )
    ? (mt.easing as AnarchyMorphEasing)
    : "easeInOutCubic";
  return {
    durationBeats: Number(clampNum(mt.durationBeats, 0.5, 32, 4).toFixed(2)),
    easing,
  };
}

function sanitizeSceneAutomations(
  raw: unknown
): Anarchy3DSceneAutomation[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const valid: Anarchy3DSceneAutomation[] = [];
  for (const item of raw.slice(0, 12)) {
    if (!item || typeof item !== "object") continue;
    const au = item as Record<string, unknown>;
    const target: AnarchyModulationTarget = MODULATION_TARGET_SET.has(
      au.target as AnarchyModulationTarget
    )
      ? (au.target as AnarchyModulationTarget)
      : "scale";
    const easing: AnarchyMorphEasing | undefined = MORPH_EASING_SET.has(
      au.easing as AnarchyMorphEasing
    )
      ? (au.easing as AnarchyMorphEasing)
      : undefined;
    valid.push({
      target,
      ...(typeof au.actorId === "string" && au.actorId.trim()
        ? { actorId: au.actorId.trim() }
        : {}),
      from: Number(clampNum(au.from, -10, 180, 0).toFixed(2)),
      to: Number(clampNum(au.to, -10, 180, 1).toFixed(2)),
      ...(easing ? { easing } : {}),
    });
  }
  return valid.length > 0 ? valid : undefined;
}

function sanitizeLfoModulators(
  raw: unknown
): Anarchy3DLfoModulator[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const valid: Anarchy3DLfoModulator[] = [];
  const validIds = new Set(["lfo_1", "lfo_2", "lfo_3", "lfo_4"]);
  const validRates = new Set([0.25, 0.5, 1, 2, 4, 8]);
  for (const item of raw.slice(0, 4)) {
    if (!item || typeof item !== "object") continue;
    const lfo = item as Record<string, unknown>;
    const id = validIds.has(String(lfo.id))
      ? (String(lfo.id) as Anarchy3DLfoModulator["id"])
      : (`lfo_${valid.length + 1}` as Anarchy3DLfoModulator["id"]);
    const waveform: AnarchyLfoWaveform = LFO_WAVEFORM_SET.has(
      lfo.waveform as AnarchyLfoWaveform
    )
      ? (lfo.waveform as AnarchyLfoWaveform)
      : "sine";
    const rawRate = Number(lfo.rateBeats);
    const rateBeats: AnarchyLfoRateBeats = validRates.has(rawRate)
      ? (rawRate as AnarchyLfoRateBeats)
      : 2;
    valid.push({
      id,
      waveform,
      rateBeats,
      ...(lfo.phase !== undefined
        ? { phase: Number(clampNum(lfo.phase, 0, 1, 0).toFixed(2)) }
        : {}),
    });
  }
  return valid.length > 0 ? valid : undefined;
}

function sanitizeCameraCuts(raw: unknown): Anarchy3DCameraCut[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const valid: Anarchy3DCameraCut[] = [];
  for (const item of raw.slice(0, 8)) {
    if (!item || typeof item !== "object") continue;
    const cc = item as Record<string, unknown>;
    const mode: AnarchyCameraMode = CAMERA_MODE_SET.has(
      cc.mode as AnarchyCameraMode
    )
      ? (cc.mode as AnarchyCameraMode)
      : "orbit";
    const rig: AnarchyCameraRig | undefined = CAMERA_RIG_SET.has(
      cc.rig as AnarchyCameraRig
    )
      ? (cc.rig as AnarchyCameraRig)
      : undefined;
    const onPeakBand =
      cc.onPeakBand === "snare" ||
      cc.onPeakBand === "kick" ||
      cc.onPeakBand === "bass"
        ? cc.onPeakBand
        : undefined;
    const transition: AnarchyCameraCutTransition | undefined =
      CAMERA_CUT_TRANSITION_SET.has(cc.transition as AnarchyCameraCutTransition)
        ? (cc.transition as AnarchyCameraCutTransition)
        : undefined;
    valid.push({
      mode,
      ...(rig ? { rig } : {}),
      ...(cc.fov !== undefined
        ? { fov: Math.round(clampNum(cc.fov, 40, 115, 72)) }
        : {}),
      ...(cc.shakeIntensity !== undefined
        ? { shakeIntensity: Number(clampNum(cc.shakeIntensity, 0, 2, 0.2).toFixed(2)) }
        : {}),
      ...(cc.switchEveryBars !== undefined
        ? { switchEveryBars: Math.round(clampNum(cc.switchEveryBars, 1, 64, 2)) }
        : {}),
      ...(onPeakBand ? { onPeakBand } : {}),
      ...(transition ? { transition } : {}),
    });
  }
  return valid.length > 0 ? valid : undefined;
}

function sanitizePostFxStack(raw: unknown): Anarchy3DPostFxStep[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const valid: Anarchy3DPostFxStep[] = [];
  for (const item of raw.slice(0, 8)) {
    if (!item || typeof item !== "object") continue;
    const fx = item as Record<string, unknown>;
    if (!POST_FX_STACK_SET.has(fx.type as AnarchyPostFxStackType)) continue;
    const colorGrade: AnarchyVintageColorGrade | undefined =
      VINTAGE_COLOR_GRADE_SET.has(fx.colorGrade as AnarchyVintageColorGrade)
        ? (fx.colorGrade as AnarchyVintageColorGrade)
        : undefined;
    valid.push({
      type: fx.type as AnarchyPostFxStackType,
      ...(fx.intensity !== undefined
        ? { intensity: Number(clampNum(fx.intensity, 0, 2, 0.8).toFixed(2)) }
        : {}),
      ...(fx.radius !== undefined
        ? { radius: Number(clampNum(fx.radius, 0.5, 16, 3).toFixed(2)) }
        : {}),
      ...(fx.threshold !== undefined
        ? { threshold: Number(clampNum(fx.threshold, 0, 1, 0.5).toFixed(2)) }
        : {}),
      ...(fx.color !== undefined
        ? { color: sanitizeHexColor(fx.color, "#09090B") }
        : {}),
      ...(fx.inkThickness !== undefined
        ? { inkThickness: Number(clampNum(fx.inkThickness, 1, 6, 3.2).toFixed(2)) }
        : {}),
      ...(fx.inkJitter !== undefined
        ? { inkJitter: Number(clampNum(fx.inkJitter, 0, 3, 1.0).toFixed(2)) }
        : {}),
      ...(fx.filmGrain !== undefined
        ? { filmGrain: Number(clampNum(fx.filmGrain, 0, 1, 0.45).toFixed(2)) }
        : {}),
      ...(fx.scratchesAndDust !== undefined
        ? { scratchesAndDust: Number(clampNum(fx.scratchesAndDust, 0, 1, 0.35).toFixed(2)) }
        : {}),
      ...(fx.gateWeave !== undefined
        ? { gateWeave: Number(clampNum(fx.gateWeave, 0, 1, 0.35).toFixed(2)) }
        : {}),
      ...(colorGrade ? { colorGrade } : {}),
      ...(fx.vignette !== undefined
        ? { vignette: Number(clampNum(fx.vignette, 0, 1, 0.5).toFixed(2)) }
        : {}),
    });
  }
  return valid.length > 0 ? valid : undefined;
}

function sanitizeBackdropShader(
  raw: unknown
): Anarchy3DBackdropShaderConfig | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const sh = raw as Record<string, unknown>;
  const type: AnarchyBackdropShader = BACKDROP_SHADER_SET.has(
    sh.type as AnarchyBackdropShader
  )
    ? (sh.type as AnarchyBackdropShader)
    : "none";
  if (type === "none") return undefined;
  const colors = Array.isArray(sh.colors)
    ? sh.colors.slice(0, 4).map((c) => sanitizeHexColor(c, "#00F0FF"))
    : undefined;
  return {
    type,
    ...(colors && colors.length > 0 ? { colors } : {}),
    ...(sh.speed !== undefined
      ? { speed: Number(clampNum(sh.speed, 0.1, 8, 1.2).toFixed(2)) }
      : {}),
    ...(sh.audioReactive !== undefined
      ? { audioReactive: Number(clampNum(sh.audioReactive, 0, 2, 0.8).toFixed(2)) }
      : {}),
  };
}

function sanitizeGenerators(raw: unknown): Anarchy3DGenerator[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const valid: Anarchy3DGenerator[] = [];
  for (const item of raw.slice(0, 6)) {
    if (!item || typeof item !== "object") continue;
    const g = item as Record<string, unknown>;
    if (!GENERATOR_TYPE_SET.has(g.type as AnarchyGeneratorType)) continue;
    const type = g.type as AnarchyGeneratorType;
    const maxCount = type === "particle_field" ? 5000 : 64;
    const defaultCount = type === "particle_field" ? 1200 : 12;
    const behavior: AnarchyParticleBehavior | undefined =
      PARTICLE_BEHAVIOR_SET.has(g.behavior as AnarchyParticleBehavior)
        ? (g.behavior as AnarchyParticleBehavior)
        : type === "particle_field"
        ? "vortex"
        : undefined;
    const pattern =
      g.pattern === "grid" ||
      g.pattern === "spiral" ||
      g.pattern === "ring" ||
      g.pattern === "fractal"
        ? g.pattern
        : undefined;
    valid.push({
      type,
      count: Math.round(clampNum(g.count, 4, maxCount, defaultCount)),
      ...(behavior ? { behavior } : {}),
      color: sanitizeHexColor(g.color, "#00F0FF"),
      secondaryColor: sanitizeHexColor(g.secondaryColor, "#FF0055"),
      speed: Number(clampNum(g.speed, 0.1, 10, 1.5).toFixed(2)),
      scale: Number(clampNum(g.scale, 0.2, 4, 1.0).toFixed(2)),
      segments: Math.round(clampNum(g.segments, 4, 32, 12)),
      amplitude: Number(clampNum(g.amplitude, 0.1, 4, 1.0).toFixed(2)),
      ...(pattern ? { pattern } : {}),
    });
  }
  return valid.length > 0 ? valid : undefined;
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

  const lightingPreset: AnarchyStudioLightingPreset | undefined =
    STUDIO_LIGHTING_SET.has(rawEnv.lightingPreset as AnarchyStudioLightingPreset)
      ? (rawEnv.lightingPreset as AnarchyStudioLightingPreset)
      : undefined;
  const backdropType: AnarchyV4BackdropType | undefined = V4_BACKDROP_SET.has(
    rawEnv.backdropType as AnarchyV4BackdropType
  )
    ? (rawEnv.backdropType as AnarchyV4BackdropType)
    : undefined;
  const backdropColors = Array.isArray(rawEnv.backdropColors)
    ? rawEnv.backdropColors
        .slice(0, 4)
        .map((c) => sanitizeHexColor(c, fallback.environment.skyColor))
    : undefined;
  const rawFog =
    rawEnv.fog && typeof rawEnv.fog === "object"
      ? (rawEnv.fog as Record<string, unknown>)
      : undefined;
  const v4Fog = rawFog
    ? {
        enabled: typeof rawFog.enabled === "boolean" ? rawFog.enabled : true,
        color: sanitizeHexColor(rawFog.color, fallback.environment.fogColor),
        density: Number(clampNum(rawFog.density, 0, 0.25, 0.03).toFixed(4)),
      }
    : undefined;

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
    ...(lightingPreset ? { lightingPreset } : {}),
    ...(backdropType ? { backdropType } : {}),
    ...(backdropColors && backdropColors.length > 0 ? { backdropColors } : {}),
    ...(v4Fog ? { fog: v4Fog } : {}),
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
  const backdropShader = sanitizeBackdropShader(layerBackdropRaw?.shader);
  const backdrop: Anarchy3DBackdropLayer = {
    skyGradient: [
      sanitizeHexColor(backdropSkyGrad?.[0], environment.skyColor),
      sanitizeHexColor(backdropSkyGrad?.[1], environment.fogColor),
    ],
    ...(backdropShader ? { shader: backdropShader } : {}),
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

  const camRig: AnarchyCameraRig | undefined = CAMERA_RIG_SET.has(
    rawCam.rig as AnarchyCameraRig
  )
    ? (rawCam.rig as AnarchyCameraRig)
    : undefined;

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
    ...(camRig ? { rig: camRig } : {}),
    ...(typeof rawCam.beatCut === "boolean" ? { beatCut: rawCam.beatCut } : {}),
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

  const renderStyle = sanitizeRenderStyle(item.renderStyle);
  const compositionMode: AnarchyCompositionMode | undefined = COMPOSITION_SET.has(
    item.compositionMode as AnarchyCompositionMode
  )
    ? (item.compositionMode as AnarchyCompositionMode)
    : undefined;
  const kaleidoAxes =
    item.kaleidoAxes !== undefined
      ? Math.round(clampNum(item.kaleidoAxes, 2, 12, 6))
      : undefined;
  const generators = sanitizeGenerators(item.generators);
  const actors = sanitizeActors(item.actors);
  const cartoonPhysics = sanitizeCartoonPhysics(item.cartoonPhysics);
  const physicsWorld = sanitizePhysicsWorld(item.physicsWorld);
  const joints = sanitizePhysicsJoints(item.joints);
  const morphTransition = sanitizeMorphTransition(item.morphTransition);
  const automations = sanitizeSceneAutomations(item.automations);
  const modulators = sanitizeLfoModulators(item.modulators);
  const cameraCuts = sanitizeCameraCuts(item.cameraCuts);
  const postFX = sanitizePostFxStack(item.postFX);
  const durationBars =
    item.durationBars !== undefined
      ? Math.round(clampNum(item.durationBars, 1, 64, 4))
      : undefined;
  const transition: AnarchySceneTransitionType | undefined =
    SCENE_TRANSITION_SET.has(item.transition as AnarchySceneTransitionType)
      ? (item.transition as AnarchySceneTransitionType)
      : undefined;

  const sceneAnimations = sanitizeAnimations(item.animations, allowedParams);
  const sceneTriggers = sanitizeTriggers(item.triggers, allowedParams);
  const hasV7Features = Boolean(
    item.version === 7 ||
      physicsWorld ||
      joints?.length ||
      actors?.some(
        (a) => a.type === "physics_spawner" || Boolean(a.physics)
      )
  );
  const hasV6Features = Boolean(
    item.version === 6 ||
      morphTransition ||
      automations?.length ||
      modulators?.length ||
      cameraCuts?.length ||
      transition === "morph" ||
      actors?.some((a) => Boolean(a.shapeTarget))
  );
  const hasV5Features = Boolean(
    cartoonPhysics ||
      actors?.some(
        (a) =>
          a.type === "parallax_layer" ||
          a.type === "cartoon_sprite" ||
          a.type === "rubber_hose_mesh"
      ) ||
      postFX?.some((p) => p.type === "vintage_1930_film")
  );
  const hasV4Features = Boolean(
    mergedParams ||
      sceneTriggers?.length ||
      actors?.length ||
      postFX?.length ||
      durationBars !== undefined ||
      transition ||
      environment.lightingPreset ||
      environment.backdropType
  );
  const hasV3Features =
    Boolean(
      sceneAnimations?.length ||
        renderStyle ||
        compositionMode ||
        generators?.length
    ) ||
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
    version: hasV7Features
      ? 7
      : hasV6Features
      ? 6
      : hasV5Features
      ? 5
      : hasV4Features
      ? 4
      : hasV3Features
      ? 3
      : rawLayers || item.postFx || item.subjects
      ? 2
      : 1,
    ...(renderStyle ? { renderStyle } : {}),
    ...(compositionMode ? { compositionMode } : {}),
    ...(kaleidoAxes !== undefined ? { kaleidoAxes: kaleidoAxes } : {}),
    ...(generators ? { generators } : {}),
    ...(actors ? { actors } : {}),
    ...(cartoonPhysics ? { cartoonPhysics } : {}),
    ...(physicsWorld ? { physicsWorld } : {}),
    ...(joints ? { joints } : {}),
    ...(morphTransition ? { morphTransition } : {}),
    ...(automations ? { automations } : {}),
    ...(modulators ? { modulators } : {}),
    ...(cameraCuts ? { cameraCuts } : {}),
    ...(postFX ? { postFX } : {}),
    ...(durationBars !== undefined ? { durationBars } : {}),
    ...(transition ? { transition } : {}),
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

  const packModulators = !Array.isArray(parsed)
    ? sanitizeLfoModulators(obj.modulators)
    : undefined;

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
      ...(packModulators ? { modulators: packModulators } : {}),
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
    ...(pack.modulators ? { modulators: pack.modulators } : {}),
    ...(pack.bpm ? { bpm: pack.bpm } : {}),
    ...(pack.beatsPerScene ? { beatsPerScene: pack.beatsPerScene } : {}),
    scenes: pack.scenes.map((sc, idx) => ({
      id: sc.id || `scene-${idx + 1}`,
      name: sc.name || `0${idx + 1}. Scène 3D`,
      version: sc.version ?? 2,
      ...(sc.renderStyle ? { renderStyle: sc.renderStyle } : {}),
      ...(sc.compositionMode ? { compositionMode: sc.compositionMode } : {}),
      ...(sc.kaleidoAxes !== undefined ? { kaleidoAxes: sc.kaleidoAxes } : {}),
      ...(sc.generators ? { generators: sc.generators } : {}),
      ...(sc.actors ? { actors: sc.actors } : {}),
      ...(sc.cartoonPhysics ? { cartoonPhysics: sc.cartoonPhysics } : {}),
      ...(sc.physicsWorld ? { physicsWorld: sc.physicsWorld } : {}),
      ...(sc.joints ? { joints: sc.joints } : {}),
      ...(sc.morphTransition ? { morphTransition: sc.morphTransition } : {}),
      ...(sc.automations ? { automations: sc.automations } : {}),
      ...(sc.modulators ? { modulators: sc.modulators } : {}),
      ...(sc.cameraCuts ? { cameraCuts: sc.cameraCuts } : {}),
      ...(sc.postFX ? { postFX: sc.postFX } : {}),
      ...(sc.durationBars !== undefined ? { durationBars: sc.durationBars } : {}),
      ...(sc.transition ? { transition: sc.transition } : {}),
      environment: {
        skyColor: sc.environment.skyColor,
        fogColor: sc.environment.fogColor,
        fogDensity: sc.environment.fogDensity,
        terrainType: sc.environment.terrainType,
        terrainSpeed: sc.environment.terrainSpeed,
        terrainPrimaryColor: sc.environment.terrainPrimaryColor,
        terrainSecondaryColor: sc.environment.terrainSecondaryColor,
        ...(sc.environment.lightingPreset ? { lightingPreset: sc.environment.lightingPreset } : {}),
        ...(sc.environment.backdropType ? { backdropType: sc.environment.backdropType } : {}),
        ...(sc.environment.backdropColors ? { backdropColors: sc.environment.backdropColors } : {}),
        ...(sc.environment.fog ? { fog: sc.environment.fog } : {}),
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
        ...(sc.camera.rig ? { rig: sc.camera.rig } : {}),
        ...(sc.camera.beatCut !== undefined ? { beatCut: sc.camera.beatCut } : {}),
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

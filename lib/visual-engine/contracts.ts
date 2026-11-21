/**
 * Contrats de données versionnés pour Anarchy Visual Engine (v2.0 M1–M6 + Open Hub).
 * Aucune dépendance React, Canvas ou WebAudio ici pour faciliter l'édition et les tests.
 */

import type {
  AnarchyTerrainType,
  AnarchySidePropType,
  AnarchySubjectMeshType,
  AnarchyProceduralPrimitive,
  AnarchyCameraMode,
  AnarchyBassTarget,
  AnarchyMidTarget,
  AnarchyTrebleTarget,
  AnarchyFluxTarget,
  AnarchyClonerMode,
  AnarchyShadingMode,
  AnarchyCompositionMode,
  AnarchyGeneratorType,
  AnarchyParticleBehavior,
  AnarchyBackdropShader,
  AnarchyCameraRig,
  AnarchyStudioLightingPreset,
  AnarchyV4BackdropType,
  AnarchyToneMapping,
  AnarchyActorType,
  AnarchySwarmBehavior,
  AnarchyMaterialOverride,
  AnarchyModulationSource,
  AnarchyModulationTarget,
  AnarchyPostFxStackType,
  AnarchySceneTransitionType,
} from "@/lib/visual-studio/registry";

export type {
  AnarchyTerrainType,
  AnarchySidePropType,
  AnarchySubjectMeshType,
  AnarchyProceduralPrimitive,
  AnarchyCameraMode,
  AnarchyBassTarget,
  AnarchyMidTarget,
  AnarchyTrebleTarget,
  AnarchyFluxTarget,
  AnarchyClonerMode,
  AnarchyShadingMode,
  AnarchyCompositionMode,
  AnarchyGeneratorType,
  AnarchyParticleBehavior,
  AnarchyBackdropShader,
  AnarchyCameraRig,
  AnarchyStudioLightingPreset,
  AnarchyV4BackdropType,
  AnarchyToneMapping,
  AnarchyActorType,
  AnarchySwarmBehavior,
  AnarchyMaterialOverride,
  AnarchyModulationSource,
  AnarchyModulationTarget,
  AnarchyPostFxStackType,
  AnarchySceneTransitionType,
};

export const PRESET_SCHEMA_VERSION = 1 as const;
export const PROJECT_SCHEMA_VERSION = 1 as const;
export const RANDOMIZER_VERSION = "1.0.0" as const;

export interface AudioFeatures {
  rms: number;
  bass: number;
  mid: number;
  treble: number;
  spectralFlux: number;
}

export interface AudioAnalysis {
  schemaVersion: 1;
  analyzerVersion: string;
  assetSha256: string;
  sampleRateHz: number;
  sampleCount: number;
  channelCount: number;
  durationSeconds: number;
  windowSamples: number;
  hopSamples: number;
  channelAggregation: "mean-power";
  bandEdgesHz: readonly [20, 250, 2000, 12000];
  timestamps: Float64Array;
  rms: Float32Array;
  bass: Float32Array;
  mid: Float32Array;
  treble: Float32Array;
  spectralFlux: Float32Array;
  waveformMin: Float32Array;
  waveformMax: Float32Array;
}

export interface AnalysisRequest {
  channels: Float32Array[];
  sampleRateHz: number;
  assetSha256: string;
}

export type AnalysisResponse =
  | { type: "progress"; fraction: number }
  | { type: "complete"; analysis: AudioAnalysis }
  | { type: "error"; message: string };

export type SceneId =
  | "industrial-city"
  | "ps1-nightmare"
  | "rave-dungeon"
  | "digital-void"
  | "techno-therapy";

export type RenderStyle = "pixel-16" | "lowpoly-32";

export type PaletteId =
  | "furnace-amber"
  | "toxic-oxide"
  | "cold-concrete"
  | "techno-therapy"
  | "acid-violet"
  | "anarchy-anaglyph"
  | "blood-red";

export type BassEffectTarget = "halo-pulse" | "camera-zoom" | "core-expand" | "shockwave";
export type MidEffectTarget = "haze-fog" | "geometry-warp" | "vortex-spin";
export type TrebleEffectTarget = "rain-glitter" | "laser-grid" | "glitch-scan";
export type TransientEffectTarget = "strobe-flash" | "camera-jolt" | "chroma-invert";

export interface AudioBandRouting {
  bassGain: number;
  midGain: number;
  trebleGain: number;
  transientGain: number;
  bassTarget: BassEffectTarget;
  midTarget: MidEffectTarget;
  trebleTarget: TrebleEffectTarget;
  transientTarget: TransientEffectTarget;
}

export type LyricsDisplayStyle =
  | "cinema-sub"
  | "center-impact"
  | "hud-terminal"
  | "psyche-wave";

export type VideoAspectRatio = "16:9" | "9:16" | "4:5" | "1:1";

export interface TimedLyricWord {
  word: string;
  start: number;
  end: number;
}

export interface LyricsOverlayConfig {
  enabled: boolean;
  text: string;
  style: LyricsDisplayStyle;
  autoVocalSync: boolean;
  timedWords?: readonly TimedLyricWord[];
}

export interface OrthographicCameraSettings {
  kind: "orthographic";
  x: number;
  y: number;
  zoom: number;
}

export interface PerspectiveCameraSettings {
  kind: "perspective";
  yawDegrees: number;
  pitchDegrees: number;
  distance: number;
  fovDegrees: number;
}

export type RetroRenderSettings =
  | {
      style: "pixel-16";
      logicalSize: { width: number; height: number };
      sampling: "nearest";
      camera: OrthographicCameraSettings;
    }
  | {
      style: "lowpoly-32";
      logicalSize: { width: number; height: number };
      sampling: "nearest";
      camera: PerspectiveCameraSettings;
    };

export interface RetroEffects {
  dither: number;
  fog: number;
  grain: number;
  vertexSnap: boolean;
  affineTextures: boolean;
  /** Intensité de distorsion kaléidoscope / plasma [0, 1]. */
  psychedelic?: number;
  /** Facteur de morphing vers targetPaletteId [0, 1]. */
  colorTransition?: number;
  targetPaletteId?: PaletteId;
  /** Intensité du fondu au noir sur chaque kick/beat [0, 1]. */
  kickBlackout?: number;
  /** Extension Open Hub : séparation stéréo anaglyphe Rouge/Cyan [0, 1]. */
  anaglyphSplit?: number;
  /** Extension Open Hub : lueur / flash stroboscopique sur crêtes [0, 1]. */
  strobeGlow?: number;
  /** Extension Pendulum Camera : oscillation pendulaire caméra [0, 1]. */
  pendulumSwing?: number;
}

export interface BpmSyncConfig {
  bpm: number;
  beatOffsetSeconds?: number;
  /** Changement automatique de scène tous les N temps (0 = désactivé, 4, 8, 16, 32). */
  autoSceneSwitchBeats?: number;
  kickBlackoutMode?: "duck-on-kick" | "open-on-kick";
}

export type PresetParameterPath =
  | "sceneId"
  | "paletteId"
  | "intensity"
  | "seed"
  | "render.style"
  | "render.logicalSize.width"
  | "render.logicalSize.height"
  | "render.camera.x"
  | "render.camera.y"
  | "render.camera.zoom"
  | "render.camera.yawDegrees"
  | "render.camera.pitchDegrees"
  | "render.camera.distance"
  | "render.camera.fovDegrees"
  | `effects.${keyof RetroEffects}`;

export interface RetroPresetConfig {
  schemaVersion: 1;
  presetId: string;
  presetVersion: string;
  engineVersion: string;
  sceneId: SceneId;
  paletteId: PaletteId;
  seed: number;
  intensity: number;
  render: RetroRenderSettings;
  effects: RetroEffects;
  locks: Partial<Record<PresetParameterPath, boolean>>;
}

export type CompatibilityRule =
  | {
      id: string;
      kind: "scene-style";
      sceneId: SceneId;
      allowedStyles: readonly RenderStyle[];
      reason: string;
    }
  | {
      id: string;
      kind: "effect-style";
      effect: "vertexSnap" | "affineTextures";
      allowedStyles: readonly RenderStyle[];
      reason: string;
    };

export interface RetroPresetDefinition {
  id: string;
  version: string;
  name: string;
  description: string;
  defaults: RetroPresetConfig;
  compatibility: readonly CompatibilityRule[];
}

export interface RandomizeRequest {
  randomizerVersion: string;
  seed: number;
  current: RetroPresetConfig;
}

export interface SceneAudioState {
  rms: number;
  bass: number;
  mid: number;
  treble: number;
  spectralFlux: number;
  bassEnvelope: number;
  rmsEnvelope: number;
  midEnvelope: number;
  trebleEnvelope: number;
  transientPulse: number;
  active: boolean;
}

export interface SceneGeometryBudget {
  maxVertices: number;
  maxTriangles: number;
  textureSize: number;
}

export interface SceneDescriptor {
  id: SceneId;
  index: string;
  name: string;
  style: RenderStyle;
  badge: string;
  sectorCaption: string;
  description: string;
  ariaLabel: string;
  geometryBudget: SceneGeometryBudget;
  audioMappings: readonly { band: string; target: string }[];
}

export interface Anarchy3DCloner {
  mode: AnarchyClonerMode;
  count: number;
  offset: [number, number, number];
  /** Incrément de rotation en degrés [rx, ry, rz] par instance */
  stepRotation?: [number, number, number];
  /** Facteur d'échelle progressif [sx, sy, sz] par instance */
  stepScale?: [number, number, number];
}

export type Anarchy3DAnimationTarget =
  | "pos.x"
  | "pos.y"
  | "pos.z"
  | "rot.x"
  | "rot.y"
  | "rot.z"
  | "scale"
  | "scale.x"
  | "scale.y"
  | "scale.z"
  | "emissiveIntensity"
  | "fov";

export interface Anarchy3DAnimation {
  target: Anarchy3DAnimationTarget;
  expr: string;
}

export interface AnarchyProceduralPart {
  primitive: AnarchyProceduralPrimitive;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  emissive?: boolean;
  wireframe?: boolean;
  cloner?: Anarchy3DCloner;
  animations?: Anarchy3DAnimation[];
}

export interface Anarchy3DEnvironment {
  skyColor: string;
  fogColor: string;
  fogDensity: number;
  terrainType: AnarchyTerrainType;
  terrainSpeed: number;
  terrainPrimaryColor: string;
  terrainSecondaryColor: string;
  /** Couche 1 v4 : Preset d'éclairage studio / HDRI virtuel */
  lightingPreset?: AnarchyStudioLightingPreset;
  /** Couche 1 v4 : Fond procédural sans code */
  backdropType?: AnarchyV4BackdropType;
  /** Couche 1 v4 : Palette de couleurs pour le fond procédural */
  backdropColors?: string[];
  /** Couche 1 v4 : Brouillard volumétrique configurable */
  fog?: {
    enabled?: boolean;
    color?: string;
    density?: number;
  };
}

export interface Anarchy3DSubject {
  meshType: AnarchySubjectMeshType;
  primaryColor: string;
  accentColor: string;
  wireframeOverlay: boolean;
  scale: number;
  /** Position 3D relative [x, y, z] pour les sujets multiples v2 */
  position?: [number, number, number];
  /** Rotation 3D initiale [rx, ry, rz] en radians */
  rotation?: [number, number, number];
  /** Liste des primitives géométriques lorsque meshType === "procedural_group" */
  parts?: AnarchyProceduralPart[];
  /** Cloneur procédural v3 appliqué au sujet */
  cloner?: Anarchy3DCloner;
  /** Expressions mathématiques temps réel v3 */
  animations?: Anarchy3DAnimation[];
}

export interface Anarchy3DBackdropShaderConfig {
  type: AnarchyBackdropShader;
  colors?: string[];
  speed?: number;
  audioReactive?: number;
}

export interface Anarchy3DBackdropLayer {
  skyGradient: [string, string];
  shader?: Anarchy3DBackdropShaderConfig;
  horizonSun?: {
    enabled: boolean;
    colorTop: string;
    colorBottom: string;
    stripes?: number;
    size?: number;
  };
  starfield?: {
    enabled: boolean;
    density?: number;
    color?: string;
  };
}

export interface Anarchy3DTerrainLayer {
  type: AnarchyTerrainType;
  speed: number;
  primaryColor: string;
  secondaryColor: string;
}

export interface Anarchy3DSidePropsLayer {
  type: AnarchySidePropType;
  density: number;
  primaryColor: string;
  secondaryColor: string;
}

export type Anarchy3DLayer =
  | { kind: "backdrop"; backdrop: Anarchy3DBackdropLayer }
  | { kind: "terrain"; terrain: Anarchy3DTerrainLayer }
  | { kind: "sideProps"; sideProps: Anarchy3DSidePropsLayer }
  | { kind: "subjects"; subjects: Anarchy3DSubject[] };

export interface Anarchy3DPostFx {
  ps1VertexJitter?: number;
  crtScanlines?: number;
  chromaticAberration?: number;
  kaleidoscopeSegments?: 0 | 2 | 4 | 6 | 8;
  bloomIntensity?: number;
}

export interface Anarchy3DRenderStyle {
  /** Facteur de résolution interne [0.15..1.0] (0.15 = ultra-pixel PS1, 1.0 = HD net) */
  resolutionScale?: number;
  shading?: AnarchyShadingMode;
  /** Épaisseur des contours noirs BD/cel-shading [0..6] */
  outlineThickness?: number;
  /** Couche 1 v4 : Tone mapping cinéma (ACESFilmic, Reinhard, Cineon, None) */
  toneMapping?: AnarchyToneMapping;
}

export interface Anarchy3DAudioModulation {
  source: AnarchyModulationSource;
  target: AnarchyModulationTarget;
  /** Amplitude de modulation [-5..5] */
  amount: number;
  /** Décalage constant optionnel */
  offset?: number;
}

export interface Anarchy3DActor {
  id?: string;
  type: AnarchyActorType;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  color?: string;
  secondaryColor?: string;
  material?: AnarchyMaterialOverride;
  /** Niveau de subdivision pour organic_blob / wave_terrain [8..48] */
  detail?: number;
  /** Intensité du bruit Simplex/Perlin 3D [0..2.5] */
  noiseStrength?: number;
  /** Fréquence spatiale du bruit [0.2..6] */
  noiseFrequency?: number;
  /** Vitesse d'animation propre à l'acteur */
  speed?: number;
  /** Nombre de particules pour particle_swarm [1000..10000] */
  count?: number;
  /** Comportement organique de l'essaim */
  behavior?: AnarchySwarmBehavior;
  /** Nombre de rubans pour spline_ribbons [2..16] */
  ribbonCount?: number;
  /** Épaisseur des rubans [0.5..8] */
  thickness?: number;
  /** Chemin /public/models/...glb ou URL image pour sprite_2d */
  url?: string;
  /** Libellé ou variante d'illustration BD pour sprite_2d */
  label?: string;
  /** Facteur parallaxe 2D/3D pour sprite_2d [0..2] */
  parallax?: number;
  /** Modulations audio (bass/lowMid/highMid/treble/energy) ou fader_1..fader_19 */
  audioModulation?: Anarchy3DAudioModulation[];
}

export interface Anarchy3DPostFxStep {
  type: AnarchyPostFxStackType;
  /** Intensité de l'effet [0..2] */
  intensity?: number;
  /** Rayon (ex: depth_of_field, bloom, pixelate) */
  radius?: number;
  /** Seuil lumineux (ex: bloom) */
  threshold?: number;
  /** Couleur de contour optionnelle (ex: toon_outline) */
  color?: string;
}

export interface Anarchy3DGenerator {
  type: AnarchyGeneratorType;
  count?: number;
  behavior?: AnarchyParticleBehavior;
  color?: string;
  secondaryColor?: string;
  speed?: number;
  scale?: number;
  segments?: number;
  amplitude?: number;
  pattern?: "grid" | "spiral" | "ring" | "fractal";
}

export interface Anarchy3DCamera {
  mode: AnarchyCameraMode;
  fov: number;
  shakeIntensity: number;
  rig?: AnarchyCameraRig;
  /** Coupure d'angle automatique sur les temps forts */
  beatCut?: boolean;
}

export interface Anarchy3DAudioMapping {
  bassTarget: AnarchyBassTarget;
  midTarget: AnarchyMidTarget;
  trebleTarget: AnarchyTrebleTarget;
  fluxTarget: AnarchyFluxTarget;
}

export type Anarchy3DTriggerAction =
  | "boost_fov"
  | "flash_sky"
  | "spin_burst"
  | "jitter_spike"
  | "emissive_surge";

export interface Anarchy3DTrigger {
  /** Expression mathématique conditionnelle (ex: "gt(bass, 0.72)" ou "pulse(beat, 0.25)") */
  when: string;
  action: Anarchy3DTriggerAction;
  /** Intensité [0..2] */
  intensity?: number;
}

export interface Anarchy3DScene {
  id: string;
  name: string;
  version?: 1 | 2 | 3 | 4;
  /** Style de rendu et résolution par scène */
  renderStyle?: Anarchy3DRenderStyle;
  /** Architecture de composition spatiale (corridor, void_orbital, tunnel_infinite, kaleido_mandala, terrain_flyover) */
  compositionMode?: AnarchyCompositionMode;
  /** Nombre d'axes pour kaleido_mandala (défaut 6) */
  kaleidoAxes?: number;
  /** Générateurs procéduraux avancés v3 (particules, rubans, vagues FFT, réseaux) */
  generators?: Anarchy3DGenerator[];
  /** Couche 2 v4 : Acteurs organiques & hybrides libres */
  actors?: Anarchy3DActor[];
  /** Couche 3 v4 : Pile d'effets post-processing optionnels et cumulables */
  postFX?: Anarchy3DPostFxStep[];
  /** Couche 3 v4 : Durée individuelle de la scène en mesures (1, 2, 4, 8, 16, 32, 64) */
  durationBars?: number;
  /** Couche 3 v4 : Transition d'entrée de la scène */
  transition?: AnarchySceneTransitionType;
  environment: Anarchy3DEnvironment;
  subject: Anarchy3DSubject;
  /** Calques composables v2 (backdrop, terrain, sideProps, subjects) */
  layers?: Anarchy3DLayer[];
  /** Sujets multiples rendus simultanément (raccourci ou miroir du calque subjects) */
  subjects?: Anarchy3DSubject[];
  /** Pipeline Post-Processing par scène (v2/v3) */
  postFx?: Anarchy3DPostFx;
  /** Animations mathématiques globales de scène v3/v4 (ex: fov, emissiveIntensity) */
  animations?: Anarchy3DAnimation[];
  /** Paramètres numériques nommés v4 utilisables dans animations[] et triggers[] */
  params?: Record<string, number>;
  /** Règles réactives conditionnelles v4 (zéro eval) */
  triggers?: Anarchy3DTrigger[];
  camera: Anarchy3DCamera;
  audioMapping: Anarchy3DAudioMapping;
  /** Identifiants optionnels de liaison avec le catalogue interne du moteur 3D */
  sceneId?: SceneId;
  paletteId?: PaletteId;
  seed?: number;
}

export interface Anarchy3DPack {
  packId: string;
  name: string;
  author: string;
  scenes: Anarchy3DScene[];
  /** Paramètres globaux v4 hérités par toutes les scènes du pack */
  params?: Record<string, number>;
  bpm?: number;
  beatsPerScene?: number;
  seed?: number;
  createdAt?: string;
}

export type Anarchy3DSceneV3 = Anarchy3DScene;
export type Anarchy3DPackV3 = Anarchy3DPack;
export type Anarchy3DSceneV4 = Anarchy3DScene;
export type Anarchy3DPackV4 = Anarchy3DPack;

export interface SceneFrameInput {
  sceneId: SceneId;
  paletteId: PaletteId;
  timeSeconds: number;
  analysis?: AudioAnalysis;
  /** Option temps-réel Open Hub quand le lecteur global joue sans analyse figée. */
  liveAudioOverride?: AudioFeatures;
  intensity?: number;
  reducedMotion?: boolean;
  effects?: Partial<RetroEffects>;
  bandRouting?: Partial<AudioBandRouting>;
  lyrics?: LyricsOverlayConfig;
  bpmConfig?: BpmSyncConfig;
  camera?: OrthographicCameraSettings | PerspectiveCameraSettings;
  seed?: number;
  aspectRatio?: VideoAspectRatio;
  /** Configuration 3D Data-Driven (JSON) de la scène active. */
  anarchy3dScene?: Anarchy3DScene;
  /** Valeurs normalisées [0..1] des 19 faders live pour audioModulation[] (fader_1..fader_19) */
  faderValues?: Record<string, number>;
  /** Progression de la transition de scène [0..1] (0 = début transition, 1 = terminée) */
  transitionProgress?: number;
  /** Type de transition de scène active */
  transitionType?: AnarchySceneTransitionType;
}

export type TransitionKind = "cut" | "dither-dissolve";

export interface SequenceSegment {
  id: string;
  startSeconds: number;
  endSeconds: number;
  preset: RetroPresetConfig;
  transition: TransitionKind;
  transitionDurationSeconds: number;
}

export type AutomatableParameter =
  | "intensity"
  | "effects.dither"
  | "effects.fog"
  | "effects.grain";

export interface AutomationPoint {
  timeSeconds: number;
  value: number;
}

export interface AutomationCurve {
  parameter: AutomatableParameter;
  points: readonly AutomationPoint[];
}

export interface StudioProject {
  schemaVersion: 1;
  id: string;
  name: string;
  engineVersion: string;
  activePreset: RetroPresetConfig;
  sequenceEnabled: boolean;
  segments: readonly SequenceSegment[];
  automations: readonly AutomationCurve[];
  reducedMotion: boolean;
}

/**
 * État complet de la Console à 18 Faders d'Anarchy Visual Design.
 */
export interface ConsoleTransportState {
  playbackSpeed: number; // 0..200 (%)
  envelopeSmooth: number; // 0..100 (%)
  bassGain: number; // 0..250 (%)
  midGain: number; // 0..250 (%)
  trebleGain: number; // 0..250 (%)
  transientGain: number; // 0..250 (%)
}

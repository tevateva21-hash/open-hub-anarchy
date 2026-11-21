import { getAudioFeaturesAt } from "./audioAnalysis";
import { evaluateMathExpression } from "@/lib/visual-studio/math-expr";
import type {
  Anarchy3DActor,
  Anarchy3DAnimation,
  Anarchy3DBackdropLayer,
  Anarchy3DBackdropShaderConfig,
  Anarchy3DCartoonPhysics,
  Anarchy3DCloner,
  Anarchy3DGenerator,
  Anarchy3DLfoModulator,
  Anarchy3DPostFx,
  Anarchy3DPostFxStep,
  Anarchy3DRenderStyle,
  Anarchy3DScene,
  Anarchy3DSceneAutomation,
  Anarchy3DSidePropsLayer,
  Anarchy3DSubject,
  Anarchy3DTerrainLayer,
  AnarchyMorphEasing,
  AnarchyProceduralPart,
  AnarchySceneTransitionType,
  AnarchyStudioLightingPreset,
  AnarchySwarmShapeTarget,
  AnarchyToneMapping,
  AudioAnalysis,
  AudioFeatures,
  PaletteId,
  RetroEffects,
  RetroPresetConfig,
  SceneAudioState,
  SceneDescriptor,
  SceneFrameInput,
  SceneId,
  StudioProject,
} from "./contracts";
import {
  DEFAULT_RETRO_EFFECTS,
  ENGINE_VERSION,
  STUDY_SIZE,
  evaluateSequenceAt,
  type EvaluatedSequenceState,
} from "./presets";
import { evaluateLyricsAt, VIDEO_ASPECT_FORMATS } from "./lyrics-scenario";

export { ENGINE_VERSION, STUDY_SIZE };
export const STUDY_FPS = 12;
export const STUDY_LAST_FRAME = 144;

export interface StudyPalette {
  id: PaletteId;
  name: string;
  sky: string;
  haze: string;
  distant: string;
  structure: string;
  face: string;
  shadow: string;
  light: string;
  glow: string;
  reflection: string;
}

export const STUDY_PALETTES: readonly StudyPalette[] = [
  {
    id: "anarchy-anaglyph",
    name: "Anarchy 3D (Rouge / Cyan)",
    sky: "#111216",
    haze: "#2b161b",
    distant: "#222226",
    structure: "#15161a",
    face: "#2c2e35",
    shadow: "#000000",
    light: "#FF1B24",
    glow: "#00E5FF",
    reflection: "#9e141a",
  },
  {
    id: "techno-therapy",
    name: "Techno Therapy (Cyan / Magenta)",
    sky: "#09071a",
    haze: "#1e1646",
    distant: "#15224c",
    structure: "#0d0b22",
    face: "#1c1842",
    shadow: "#05040f",
    light: "#00f6ff",
    glow: "#ff2bd6",
    reflection: "#6b38ff",
  },
  {
    id: "blood-red",
    name: "Blood Red (Chambre Cramoisie)",
    sky: "#12050a",
    haze: "#260910",
    distant: "#4a3236",
    structure: "#24070e",
    face: "#5e1c28",
    shadow: "#090205",
    light: "#ff1424",
    glow: "#ff3940",
    reflection: "#a53643",
  },
  {
    id: "furnace-amber",
    name: "Ambre industriel",
    sky: "#17191c",
    haze: "#3e342c",
    distant: "#302e2b",
    structure: "#121619",
    face: "#25272a",
    shadow: "#090d10",
    light: "#e4a35b",
    glow: "#95613b",
    reflection: "#66462e",
  },
  {
    id: "toxic-oxide",
    name: "Oxyde toxique",
    sky: "#141b19",
    haze: "#343f2a",
    distant: "#2a352d",
    structure: "#101915",
    face: "#222f27",
    shadow: "#080f0c",
    light: "#b9c87a",
    glow: "#748649",
    reflection: "#4a603c",
  },
  {
    id: "cold-concrete",
    name: "Béton froid",
    sky: "#161b25",
    haze: "#303e50",
    distant: "#2a3442",
    structure: "#101923",
    face: "#222e3b",
    shadow: "#080e17",
    light: "#adc6ce",
    glow: "#658394",
    reflection: "#3b5365",
  },
  {
    id: "acid-violet",
    name: "Violet acide",
    sky: "#16081c",
    haze: "#39134a",
    distant: "#2a1238",
    structure: "#120618",
    face: "#270f36",
    shadow: "#08020b",
    light: "#d4ff33",
    glow: "#b026ff",
    reflection: "#6c1ab8",
  },
];

export const SCENE_CATALOG: readonly SceneDescriptor[] = [
  {
    id: "industrial-city",
    index: "01",
    name: "Industrial City",
    style: "pixel-16",
    badge: "16-BIT / PIXEL ART",
    sectorCaption: "SECTEUR 09 — APRÈS LA DERNIÈRE RAME",
    description:
      "Usines en plans successifs, grue portuaire, viaduc ferroviaire et route humide sous une éclipse industrielle.",
    ariaLabel:
      "Étude pixel-art Industrial City : usines, grue et viaduc sous une éclipse",
    geometryBudget: { maxVertices: 0, maxTriangles: 0, textureSize: 0 },
    audioMappings: [
      { band: "Basses", target: "Couronne de l'éclipse & fenêtres de fonderie" },
      { band: "Médiums", target: "Nappes de brume & panaches de cheminées" },
      { band: "Aigus", target: "Densité de pluie & reflets d'asphalte" },
      { band: "Transitoires", target: "Balises de grue & passage du convoi" },
    ],
  },
  {
    id: "ps1-nightmare",
    index: "02",
    name: "PS1 Nightmare",
    style: "lowpoly-32",
    badge: "32-BIT / LOW-POLY PS1",
    sectorCaption: "SECTEUR 14 — COUR BRUTALISTE & MONOLITHE",
    description:
      "Cour géométrique anguleuse, obélisque inversé suspendu, dallage en perspective affine et tremblement de sommets.",
    ariaLabel:
      "Scène low-poly PS1 Nightmare : cour brutaliste et obélisque suspendu",
    geometryBudget: { maxVertices: 128, maxTriangles: 64, textureSize: 16 },
    audioMappings: [
      { band: "Basses", target: "Lévitation de l'obélisque & puits central" },
      { band: "Médiums", target: "Brouillard de profondeur & monolithes" },
      { band: "Aigus", target: "Tramage Bayer des dalles & grain 32-bit" },
      { band: "Transitoires", target: "Impulsion caméra & éclairs d'arêtes" },
    ],
  },
  {
    id: "rave-dungeon",
    index: "03",
    name: "Rave Dungeon",
    style: "lowpoly-32",
    badge: "32-BIT / LOW-POLY PS1",
    sectorCaption: "SOUS-SOL B4 — VOÛTE SOUTERRAINE & CAGE ACIER",
    description:
      "Galerie bétonnée en perspective, arches métalliques, colonnes acoustiques massives et sol inondé sous stroboscopes rares.",
    ariaLabel: "Scène low-poly Rave Dungeon : voûte souterraine industrielle et arches",
    geometryBudget: { maxVertices: 128, maxTriangles: 72, textureSize: 16 },
    audioMappings: [
      { band: "Basses", target: "Piliers de voûte & onde sur béton inondé" },
      { band: "Médiums", target: "Profondeur du couloir & balises latérales" },
      { band: "Aigus", target: "Trame des grilles suspendues" },
      { band: "Transitoires", target: "Faisceaux zénithaux de voûte" },
    ],
  },
  {
    id: "digital-void",
    index: "04",
    name: "Digital Void",
    style: "pixel-16",
    badge: "16-BIT / PIXEL ART",
    sectorCaption: "NOYAU 00 — GOUFFRE DE DONNÉES & TOURS SERVEURS",
    description:
      "Tours monolithiques au-dessus d'un abîme numérique, passerelles suspendues, horizon tramé et impulsions de télémétrie.",
    ariaLabel: "Scène pixel-art Digital Void : tours serveurs et abîme numérique",
    geometryBudget: { maxVertices: 0, maxTriangles: 0, textureSize: 0 },
    audioMappings: [
      { band: "Basses", target: "Ouverture du noyau abyssal & socles" },
      { band: "Médiums", target: "Baies lumineuses & horizon tramé" },
      { band: "Aigus", target: "Pluie de parité & interférences" },
      { band: "Transitoires", target: "Ponts optiques inter-monolithes" },
    ],
  },
  {
    id: "techno-therapy",
    index: "05",
    name: "Techno Therapy",
    style: "lowpoly-32",
    badge: "32-BIT / CYBER LAB",
    sectorCaption: "LABO 09 — CHAMBRE DE RÉSONANCE NEURALE & VORTEX ECG",
    description:
      "Tunnel octogonal en perspective 32-bit, anneaux de confinement rotatifs, noyau stroboscopique et électrocardiogramme neural.",
    ariaLabel:
      "Scène low-poly Techno Therapy : tunnel octogonal cybernétique et moniteur ECG",
    geometryBudget: { maxVertices: 128, maxTriangles: 80, textureSize: 16 },
    audioMappings: [
      { band: "Basses", target: "Dilatation des anneaux & noyau stroboscopique" },
      { band: "Médiums", target: "Rotation du vortex octogonal & ondes neurales" },
      { band: "Aigus", target: "Faisceaux laser & grille de télémétrie" },
      { band: "Transitoires", target: "Impulsions ECG & flashs de chambre" },
    ],
  },
];

export interface SceneRenderReport {
  sceneId: SceneId;
  paletteId: PaletteId;
  timeSeconds: number;
  audio: SceneAudioState;
  vertexCount: number;
  triangleCount: number;
}

const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
] as const;

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function getSceneDescriptor(sceneId: SceneId): SceneDescriptor {
  const descriptor = SCENE_CATALOG.find((item) => item.id === sceneId);
  if (!descriptor) throw new Error("Scène rétro inconnue.");
  return descriptor;
}

export function getStudyPalette(paletteId: PaletteId): StudyPalette {
  const palette = STUDY_PALETTES.find((item) => item.id === paletteId);
  if (!palette) return STUDY_PALETTES[0];
  return palette;
}

export function computeSceneAudioState(
  analysis: AudioAnalysis | undefined,
  timeSeconds: number,
  options?: {
    intensity?: number;
    reducedMotion?: boolean;
    liveAudioOverride?: AudioFeatures;
  }
): SceneAudioState {
  if (!Number.isFinite(timeSeconds) || timeSeconds < 0) {
    throw new Error("Instant de scène invalide.");
  }
  const rawIntensity = options?.intensity ?? 0.75;
  if (!Number.isFinite(rawIntensity)) throw new Error("Intensité invalide.");
  const reducedMotion = Boolean(options?.reducedMotion);
  const intensity = clamp01(rawIntensity) * (reducedMotion ? 0.35 : 1);

  if (options?.liveAudioOverride) {
    const live = options.liveAudioOverride;
    return {
      ...live,
      rmsEnvelope: clamp01(live.rms * 1.45 * intensity),
      bassEnvelope: clamp01(Math.sqrt(Math.max(0, live.bass)) * 1.35 * intensity),
      midEnvelope: clamp01(Math.sqrt(Math.max(0, live.mid)) * 1.45 * intensity),
      trebleEnvelope: clamp01(
        Math.sqrt(Math.max(0, live.treble)) * 1.65 * intensity
      ),
      transientPulse: reducedMotion
        ? 0
        : clamp01(Math.sqrt(Math.max(0, live.spectralFlux)) * 2.4 * intensity),
      active: intensity > 0,
    };
  }

  if (!analysis || analysis.timestamps.length === 0 || intensity === 0) {
    const instant =
      analysis && analysis.timestamps.length > 0
        ? getAudioFeaturesAt(analysis, timeSeconds)
        : { rms: 0, bass: 0, mid: 0, treble: 0, spectralFlux: 0 };
    return {
      ...instant,
      bassEnvelope: 0,
      rmsEnvelope: 0,
      midEnvelope: 0,
      trebleEnvelope: 0,
      transientPulse: 0,
      active: Boolean(analysis && intensity > 0),
    };
  }

  const instant = getAudioFeaturesAt(analysis, timeSeconds);
  const offsets = [0, 0.022, 0.045, 0.075, 0.115, 0.165] as const;
  const weights = [0.34, 0.24, 0.17, 0.12, 0.08, 0.05] as const;

  let smoothRms = 0;
  let smoothBass = 0;
  let smoothMid = 0;
  let smoothTreble = 0;
  let peakFlux = 0;

  for (let i = 0; i < offsets.length; i++) {
    const sampleTime = Math.max(0, timeSeconds - offsets[i]);
    const sample =
      i === 0 ? instant : getAudioFeaturesAt(analysis, sampleTime);
    const w = weights[i];
    smoothRms += sample.rms * w;
    smoothBass += Math.sqrt(Math.max(0, sample.bass)) * w;
    smoothMid += Math.sqrt(Math.max(0, sample.mid)) * w;
    smoothTreble += Math.sqrt(Math.max(0, sample.treble)) * w;
    const weightedFlux =
      Math.sqrt(Math.max(0, sample.spectralFlux)) * (1 - i * 0.14);
    if (weightedFlux > peakFlux) peakFlux = weightedFlux;
  }

  return {
    ...instant,
    rmsEnvelope: clamp01(smoothRms * 1.45 * intensity),
    bassEnvelope: clamp01(smoothBass * 1.35 * intensity),
    midEnvelope: clamp01(smoothMid * 1.45 * intensity),
    trebleEnvelope: clamp01(smoothTreble * 1.65 * intensity),
    transientPulse: reducedMotion
      ? 0
      : clamp01(peakFlux * 8.5 * intensity),
    active: true,
  };
}

interface RasterTools {
  rect: (x: number, y: number, w: number, h: number, color: string) => void;
  line: (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color: string
  ) => void;
  bayer: (x: number, y: number) => number;
}

function createRasterTools(ctx: CanvasRenderingContext2D): RasterTools {
  const rect = (x: number, y: number, w: number, h: number, color: string) => {
    const rx = Math.round(x);
    const ry = Math.round(y);
    const rw = Math.round(w);
    const rh = Math.round(h);
    if (rw <= 0 || rh <= 0) return;
    ctx.fillStyle = color;
    ctx.fillRect(rx, ry, rw, rh);
  };
  const line = (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color: string
  ) => {
    let cx0 = Math.round(x0);
    let cy0 = Math.round(y0);
    const cx1 = Math.round(x1);
    const cy1 = Math.round(y1);
    const dx = Math.abs(cx1 - cx0);
    const sx = cx0 < cx1 ? 1 : -1;
    const dy = -Math.abs(cy1 - cy0);
    const sy = cy0 < cy1 ? 1 : -1;
    let error = dx + dy;
    while (true) {
      rect(cx0, cy0, 1, 1, color);
      if (cx0 === cx1 && cy0 === cy1) break;
      const e2 = 2 * error;
      if (e2 >= dy) {
        error += dy;
        cx0 += sx;
      }
      if (e2 <= dx) {
        error += dx;
        cy0 += sy;
      }
    }
  };
  const bayer = (x: number, y: number) =>
    BAYER_4X4[((y % 4) + 4) % 4][((x % 4) + 4) % 4] / 16;
  return { rect, line, bayer };
}

function drawIndustrialCityScene(
  tools: RasterTools,
  p: StudyPalette,
  frame: number,
  audio: SceneAudioState,
  effects: RetroEffects
): void {
  const { rect, line, bayer } = tools;
  const bassBoost = Math.round(audio.bassEnvelope * 6);
  const midBoost = Math.round(audio.midEnvelope * 10);
  const trebleBoost = Math.round(audio.trebleEnvelope * 26);
  const strobeMul = 0.6 + (effects.strobeGlow ?? 0.25) * 0.8;
  const pulse = audio.transientPulse * strobeMul >= 0.32;

  rect(0, 0, 320, 180, p.sky);
  rect(
    0,
    60 - Math.round(midBoost * 0.4) - Math.round(effects.fog * 8),
    320,
    65 + Math.round(midBoost * 0.4) + Math.round(effects.fog * 12),
    p.haze
  );

  const ditherSpan = audio.active
    ? Math.round(effects.dither * 6)
    : Math.round(effects.dither * 3);
  for (let y = 42 - ditherSpan; y < 70; y += 2) {
    for (let x = ((y % 4) + 4) % 4; x < 320; x += 4) {
      if ((x + y * 3) % 11 < (y - 40 + midBoost) / 4) rect(x, y, 1, 1, p.haze);
    }
  }

  const sunRadiusSq = 529 + bassBoost * 18;
  const shadowCutoff = 430 - bassBoost * 14;
  for (let y = -26; y <= 26; y++) {
    for (let x = -26; x <= 26; x++) {
      const r2 = x * x + y * y;
      if (r2 <= sunRadiusSq && (x + 9) ** 2 + (y - 3) ** 2 > shadowCutoff) {
        const isOuterHalo = r2 > 529;
        const color = isOuterHalo
          ? bayer(237 + x, 48 + y) < 0.5
            ? p.glow
            : p.light
          : y % 3 === 0
          ? p.glow
          : p.light;
        rect(237 + x, 48 + y, 1, 1, color);
      }
    }
  }

  const skyline = [
    [0, 87, 20, 36],
    [24, 73, 12, 50],
    [40, 83, 24, 40],
    [69, 61, 8, 62],
    [82, 78, 31, 45],
    [117, 67, 19, 56],
    [140, 83, 28, 40],
    [175, 62, 27, 61],
    [208, 77, 23, 46],
    [237, 87, 36, 36],
    [280, 68, 20, 55],
    [307, 80, 13, 43],
  ] as const;
  const windowMod = audio.active && audio.bassEnvelope > 0.35 ? 3 : 5;
  for (const [x, y, w, h] of skyline) {
    rect(x, y, w, h, p.distant);
    for (let wy = y + 7; wy < 116; wy += 9) {
      for (let wx = x + 4; wx < x + w - 2; wx += 7) {
        if ((wx * 7 + wy) % windowMod === 0) {
          rect(
            wx,
            wy,
            1,
            2,
            pulse && (wx + wy) % 2 === 0 ? p.light : p.glow
          );
        }
      }
    }
  }

  const smokeCount = 28 + Math.round(audio.midEnvelope * 10);
  for (let i = 0; i < smokeCount; i++) {
    const x = 70 + ((i * 9 + Math.floor(frame / 3)) % 60);
    const y = 55 - ((i * 7 + Math.round(audio.midEnvelope * 6)) % 24);
    rect(x, y, 6 + (i % 7), 2, i % 3 ? p.distant : p.haze);
  }

  rect(0, 98, 113, 60, p.structure);
  rect(0, 94, 116, 4, p.shadow);
  rect(4, 101, 72, 44, p.face);
  for (let x = 8; x < 76; x += 13) {
    rect(x, 105, 8, 18, p.shadow);
    const furnaceHot =
      x % 3 === 0 || (audio.active && audio.rmsEnvelope > 0.3 && x % 2 === 0);
    rect(x + 1, 107, 5, 9, furnaceHot ? p.light : p.glow);
    rect(x + 3, 105, 1, 18, p.structure);
    rect(x, 113, 8, 1, p.structure);
  }
  rect(85, 108, 18, 42, p.shadow);
  rect(88, 110, 1, 31, p.face);
  for (let y = 126; y < 151; y += 4) line(2, y, 76, y, p.structure);
  rect(18, 58, 8, 39, p.structure);
  rect(16, 56, 12, 3, p.face);
  rect(94, 67, 5, 30, p.shadow);
  rect(92, 66, 9, 2, p.face);

  line(187, 42, 187, 111, p.structure);
  line(190, 42, 190, 111, p.structure);
  line(153, 46, 222, 46, p.structure);
  line(153, 49, 222, 49, p.structure);
  line(155, 46, 187, 34, p.structure);
  line(187, 34, 219, 46, p.structure);
  line(214, 49, 214, 86, p.structure);
  rect(210, 86, 9, 6, p.structure);
  if (pulse) {
    rect(186, 32, 3, 3, p.light);
    rect(213, 84, 3, 2, p.light);
  }

  rect(106, 112, 214, 6, p.face);
  rect(104, 118, 216, 6, p.shadow);
  for (let x = 123; x < 320; x += 48) {
    rect(x, 124, 8, 33, p.structure);
    rect(x - 2, 124, 12, 4, p.structure);
    rect(x + 1, 126, 1, 22, p.face);
    rect(x + 18, 114, 1, 1, pulse ? p.light : p.glow);
  }
  const trainX = 116 + (Math.floor(frame / 4) % 140);
  rect(trainX, 103, 48, 8, p.structure);
  for (let x = trainX + 3; x < trainX + 44; x += 7) {
    rect(x, 105, 4, 2, pulse ? p.light : p.glow);
  }

  rect(0, 157, 320, 23, p.shadow);
  const reflectionCount = 38 + Math.round(audio.bassEnvelope * 14);
  for (let i = 0; i < reflectionCount; i++) {
    const x = (i * 37 + 9) % 320;
    const y = 159 + ((i * 7) % 21);
    const color =
      i % 4 === 0
        ? pulse && i % 8 === 0
          ? p.light
          : p.reflection
        : p.structure;
    rect(x, y, 2 + (i % 11), 1, color);
  }
  line(157, 145, 111, 179, p.face);
  line(171, 145, 230, 179, p.face);
  rect(161, 154, 2, 3, p.glow);
  rect(163, 164, 3, 5, p.reflection);

  rect(179, 144, 3, 3, p.shadow);
  rect(178, 147, 5, 8, p.shadow);
  line(179, 155, 178, 159, p.shadow);
  line(182, 155, 183, 159, p.shadow);

  rect(305, 19, 4, 161, p.shadow);
  rect(295, 29, 23, 3, p.shadow);
  for (let x = 0; x < 307; x++) {
    const y = 22 + Math.round(17 * (1 - ((x - 150) / 155) ** 2));
    rect(x, y, 1, 1, p.shadow);
  }
  rect(291, 52, 10, 2, p.shadow);
  rect(290, 54, 4, 2, p.light);

  const rainCount = 40 + trebleBoost;
  for (let i = 0; i < rainCount; i++) {
    const x = (i * 53 + 17) % 320;
    const y = (i * 31 + frame * 2) % 180;
    line(x, y, x - 1, y + 3, i % 3 ? p.face : p.glow);
  }
}

function drawDigitalVoidScene(
  tools: RasterTools,
  p: StudyPalette,
  frame: number,
  audio: SceneAudioState,
  effects: RetroEffects,
  seed: number
): void {
  const { rect, line, bayer } = tools;
  const seedOffset = (seed >>> 0) % 29;
  const bassWidth = 14 + Math.round(audio.bassEnvelope * 22);
  const midHeight = 32 + Math.round(audio.midEnvelope * 20);
  const strobeMul = 0.6 + (effects.strobeGlow ?? 0.25) * 0.8;
  const pulse = audio.transientPulse * strobeMul >= 0.28;

  rect(0, 0, 320, 180, p.shadow);
  rect(0, 18, 320, 96, p.sky);

  const horizonY = 86;
  rect(0, horizonY - Math.floor(midHeight / 2), 320, midHeight, p.haze);
  const ditherThreshold = 0.25 + effects.dither * 0.55;
  for (let y = 36; y < 142; y += 2) {
    const dist = Math.abs(y - horizonY) / 54;
    for (let x = 0; x < 320; x += 2) {
      if (bayer(x, y) + dist < ditherThreshold) {
        rect(x, y, 2, 1, y < horizonY ? p.distant : p.structure);
      }
    }
  }

  const coreLeft = 160 - bassWidth;
  const coreWidth = bassWidth * 2;
  rect(coreLeft - 6, 8, coreWidth + 12, 166, p.structure);
  rect(coreLeft, 8, coreWidth, 166, p.shadow);
  for (let y = 14; y < 168; y += 6) {
    const scanPhase = (y + frame * 2 + seedOffset) % 36;
    const ringColor =
      scanPhase < 6 ? p.light : scanPhase < 14 ? p.glow : p.reflection;
    rect(coreLeft + 2, y, coreWidth - 4, 2, ringColor);
  }

  const towers = [
    { x: 10, w: 34, top: 14, bottom: 168, tier: "near" },
    { x: 52, w: 26, top: 24, bottom: 158, tier: "mid" },
    { x: 86, w: 22, top: 34, bottom: 148, tier: "far" },
    { x: 212, w: 22, top: 34, bottom: 148, tier: "far" },
    { x: 242, w: 26, top: 24, bottom: 158, tier: "mid" },
    { x: 276, w: 34, top: 14, bottom: 168, tier: "near" },
  ] as const;

  for (let tIdx = 0; tIdx < towers.length; tIdx++) {
    const t = towers[tIdx];
    const bodyColor =
      t.tier === "near"
        ? p.structure
        : t.tier === "mid"
        ? p.face
        : p.distant;
    rect(t.x, t.top, t.w, t.bottom - t.top, bodyColor);
    rect(t.x, t.top, 2, t.bottom - t.top, p.glow);
    rect(t.x + t.w - 2, t.top, 2, t.bottom - t.top, p.shadow);

    for (let y = t.top + 6; y < t.bottom - 8; y += 8) {
      rect(t.x + 5, y, t.w - 10, 4, p.shadow);
      const activeSlot =
        (y + frame + tIdx * 5 + seedOffset) % 16 <
        6 + Math.round(audio.midEnvelope * 7);
      if (activeSlot) {
        rect(
          t.x + 7,
          y + 1,
          Math.max(4, t.w - 16),
          2,
          pulse && y % 16 === 0 ? p.light : p.glow
        );
      }
    }
  }

  const bridges = [48, 96, 134] as const;
  for (let i = 0; i < bridges.length; i++) {
    const by = bridges[i];
    rect(44, by, 232, 3, p.face);
    rect(44, by + 3, 232, 2, p.shadow);
    if (pulse || i === Math.floor(frame / 12) % bridges.length) {
      line(86, by - 1, 234, by - 1, p.light);
    }
  }

  rect(0, 148, 320, 26, p.shadow);
  for (let i = -5; i <= 5; i++) {
    const xTop = 160 + i * 14;
    const xBot = 160 + i * 34;
    line(xTop, 148, xBot, 173, i === 0 ? p.glow : p.reflection);
  }
  for (let y = 152; y <= 172; y += 5) {
    line(0, y, 320, y, y % 10 === 2 ? p.face : p.structure);
  }

  const glyphCount = 32 + Math.round(audio.trebleEnvelope * 28);
  for (let i = 0; i < glyphCount; i++) {
    const gx = (i * 41 + seedOffset * 7 + 13) % 320;
    const gy = 10 + ((i * 29 + frame * 3) % 156);
    rect(gx, gy, 1, 3, i % 4 === 0 ? p.light : p.glow);
  }
}

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface Poly3D {
  vertices: readonly Vec3[];
  tone: number;
  checker?: boolean;
  wireRim?: boolean;
  fillColor?: string;
  wireColor?: string;
}

interface ProjectedVertex {
  sx: number;
  sy: number;
  z: number;
}

function renderLowPolyMesh(
  tools: RasterTools,
  p: StudyPalette,
  polygons: readonly Poly3D[],
  camera: {
    yawRad: number;
    pitchRad: number;
    distance: number;
    fovScale: number;
    targetY: number;
  },
  effects: RetroEffects,
  renderStyle?: Anarchy3DRenderStyle
): { vertexCount: number; triangleCount: number } {
  const { rect, line, bayer } = tools;
  const shading = renderStyle?.shading ?? "flat";
  const outlineThickness = Math.max(
    0,
    Math.min(6, renderStyle?.outlineThickness ?? 0)
  );
  const cosY = Math.cos(camera.yawRad);
  const sinY = Math.sin(camera.yawRad);
  const cosP = Math.cos(camera.pitchRad);
  const sinP = Math.sin(camera.pitchRad);
  const snapStep = effects.vertexSnap ? 2 : 1;

  const paletteRamp = [
    p.shadow,
    p.structure,
    p.distant,
    p.face,
    p.haze,
    p.reflection,
    p.glow,
    p.light,
  ] as const;

  const project = (v: Vec3): ProjectedVertex | null => {
    const rx = v.x * cosY - v.z * sinY;
    const rz = v.x * sinY + v.z * cosY;
    const dy = v.y - camera.targetY;
    const py = dy * cosP - rz * sinP;
    const pz = dy * sinP + rz * cosP + camera.distance;
    if (pz <= 1.2) return null;
    const rawX = 160 + (rx * camera.fovScale) / pz;
    const rawY = 92 - (py * camera.fovScale) / pz;
    const sx = Math.round(rawX / snapStep) * snapStep;
    const sy = Math.round(rawY / snapStep) * snapStep;
    return { sx, sy, z: pz };
  };

  interface DrawableTri {
    v0: ProjectedVertex;
    v1: ProjectedVertex;
    v2: ProjectedVertex;
    avgZ: number;
    tone: number;
    checker: boolean;
    wireRim: boolean;
    fillColor?: string;
    wireColor?: string;
    polyIndex: number;
  }

  const tris: DrawableTri[] = [];
  let vertexCount = 0;

  for (let pIdx = 0; pIdx < polygons.length; pIdx++) {
    const poly = polygons[pIdx];
    vertexCount += poly.vertices.length;
    const projected: ProjectedVertex[] = [];
    let clipped = false;
    for (const v of poly.vertices) {
      const pv = project(v);
      if (!pv) {
        clipped = true;
        break;
      }
      projected.push(pv);
    }
    if (clipped || projected.length < 3) continue;
    for (let i = 1; i < projected.length - 1; i++) {
      const v0 = projected[0];
      const v1 = projected[i];
      const v2 = projected[i + 1];
      const avgZ = (v0.z + v1.z + v2.z) / 3;
      tris.push({
        v0,
        v1,
        v2,
        avgZ,
        tone: poly.tone,
        checker: Boolean(poly.checker),
        wireRim: Boolean(poly.wireRim),
        fillColor: poly.fillColor,
        wireColor: poly.wireColor,
        polyIndex: pIdx,
      });
    }
  }

  tris.sort((a, b) =>
    b.avgZ !== a.avgZ ? b.avgZ - a.avgZ : a.polyIndex - b.polyIndex
  );

  const edgeInterp = (
    y0: number,
    x0: number,
    y1: number,
    x1: number,
    y: number
  ): number => {
    if (y1 === y0) return x0;
    return x0 + ((x1 - x0) * (y - y0)) / (y1 - y0);
  };

  for (const tri of tris) {
    const pts = [tri.v0, tri.v1, tri.v2].sort((a, b) => a.sy - b.sy);
    const [a, b, c] = pts;
    const minY = Math.max(8, Math.min(173, a.sy));
    const maxY = Math.max(8, Math.min(173, c.sy));
    if (maxY <= minY) continue;

    const fogFactor = clamp01(((tri.avgZ - 6) / 22) * effects.fog);
    const rawTone =
      shading === "toon_cel"
        ? tri.tone < 0.35
          ? 0.2
          : tri.tone < 0.72
          ? 0.58
          : 0.94
        : shading === "chrome_reflective"
        ? tri.tone > 0.74
          ? 0.98
          : tri.tone < 0.32
          ? 0.14
          : 0.55 + Math.sin(tri.tone * Math.PI * 3) * 0.22
        : tri.tone;
    const foggedTone = rawTone * (1 - fogFactor * 0.65) + 0.25 * fogFactor;
    const scaledTone = clamp01(foggedTone) * (paletteRamp.length - 1);
    const baseIdx = Math.floor(scaledTone);
    const frac = scaledTone - baseIdx;

    let customPrimaryFill = tri.fillColor
      ? lerpHexColor(
          rawTone < 0.7
            ? lerpHexColor(p.shadow, tri.fillColor, clamp01(rawTone * 1.35))
            : lerpHexColor(tri.fillColor, p.light, clamp01((rawTone - 0.7) * 1.6)),
          p.haze,
          fogFactor * 0.78
        )
      : undefined;

    if (shading === "neon_glow") {
      customPrimaryFill = lerpHexColor(
        p.shadow,
        customPrimaryFill ?? paletteRamp[baseIdx],
        0.42
      );
    } else if (shading === "chrome_reflective") {
      const chromeBase = lerpHexColor(p.shadow, p.reflection, clamp01(rawTone));
      customPrimaryFill =
        rawTone > 0.82 ? lerpHexColor(chromeBase, "#ffffff", 0.75) : chromeBase;
    }

    const customAltFill =
      customPrimaryFill && tri.checker
        ? lerpHexColor(customPrimaryFill, p.shadow, 0.26)
        : customPrimaryFill;

    if (shading !== "wireframe") {
      const yStep = shading === "hologram" ? 4 : 2;
      for (let y = minY; y <= maxY; y += yStep) {
        const xa = edgeInterp(a.sy, a.sx, c.sy, c.sx, y);
        const xb =
          y < b.sy
            ? edgeInterp(a.sy, a.sx, b.sy, b.sx, y)
            : edgeInterp(b.sy, b.sx, c.sy, c.sx, y);
        const xStart = Math.max(0, Math.min(318, Math.round(Math.min(xa, xb))));
        const xEnd = Math.max(0, Math.min(320, Math.round(Math.max(xa, xb))));
        if (xEnd <= xStart) continue;

        if (
          shading === "toon_cel" ||
          (!effects.affineTextures && !tri.checker && effects.dither < 0.15)
        ) {
          rect(
            xStart,
            y,
            xEnd - xStart,
            shading === "hologram" ? 2 : 2,
            customPrimaryFill ?? paletteRamp[baseIdx]
          );
          continue;
        }

        const spanWidth = Math.max(1, xEnd - xStart);
        for (let x = xStart; x < xEnd; x += 4) {
          const w = Math.min(4, xEnd - x);
          const u = Math.floor(((x - xStart) * 8) / spanWidth);
          const v = Math.floor((y - minY) / 4);
          const isCheckerCell =
            effects.affineTextures &&
            tri.checker &&
            (u + v + tri.polyIndex) % 2 === 0;
          if (customPrimaryFill) {
            rect(
              x,
              y,
              w,
              2,
              isCheckerCell ? customAltFill ?? customPrimaryFill : customPrimaryFill
            );
          } else {
            const affineShift = isCheckerCell ? 1 : 0;
            const ditherUp =
              frac > 1 - effects.dither * 0.85 && bayer(x >> 1, y >> 1) < frac
                ? 1
                : 0;
            const idx = Math.max(
              0,
              Math.min(paletteRamp.length - 1, baseIdx + ditherUp - affineShift)
            );
            rect(x, y, w, 2, paletteRamp[idx]);
          }
        }
      }
    }

    if (
      shading === "wireframe" ||
      shading === "hologram" ||
      shading === "neon_glow" ||
      tri.wireRim
    ) {
      const rimCol =
        shading === "hologram"
          ? lerpHexColor(tri.wireColor ?? p.glow, "#00f5ff", 0.55)
          : tri.wireColor ?? p.glow;
      line(tri.v0.sx, tri.v0.sy, tri.v1.sx, tri.v1.sy, rimCol);
      line(tri.v1.sx, tri.v1.sy, tri.v2.sx, tri.v2.sy, rimCol);
      if (shading === "wireframe" || shading === "neon_glow") {
        line(tri.v2.sx, tri.v2.sy, tri.v0.sx, tri.v0.sy, rimCol);
      }
    }

    if (outlineThickness > 0) {
      const outlineCol = "#050508";
      const passes = Math.min(3, Math.ceil(outlineThickness * 0.5));
      for (let op = 0; op < passes; op++) {
        line(tri.v0.sx + op, tri.v0.sy, tri.v1.sx + op, tri.v1.sy, outlineCol);
        line(tri.v1.sx, tri.v1.sy + op, tri.v2.sx, tri.v2.sy + op, outlineCol);
        line(tri.v2.sx - op, tri.v2.sy, tri.v0.sx - op, tri.v0.sy, outlineCol);
      }
    }
  }

  return { vertexCount, triangleCount: tris.length };
}

interface PerspectiveOffsets {
  yawRad: number;
  pitchRad: number;
  distMul: number;
  fovMul: number;
}

function drawPs1NightmareScene(
  tools: RasterTools,
  p: StudyPalette,
  timeSeconds: number,
  audio: SceneAudioState,
  effects: RetroEffects,
  reducedMotion: boolean,
  camOff: PerspectiveOffsets
): { vertexCount: number; triangleCount: number } {
  const { rect, line, bayer } = tools;
  rect(0, 0, 320, 180, p.sky);
  rect(0, 48, 320, 56, p.haze);
  rect(0, 104, 320, 70, p.shadow);

  for (let y = 32; y < 96; y += 2) {
    for (let x = 0; x < 320; x += 4) {
      if (bayer(x >> 1, y >> 1) < effects.fog * 0.65) {
        rect(x, y, 2, 2, y < 64 ? p.distant : p.haze);
      }
    }
  }

  const polygons: Poly3D[] = [];

  for (let gz = -2; gz < 2; gz++) {
    for (let gx = -2; gx < 2; gx++) {
      const x0 = gx * 3.2;
      const x1 = (gx + 1) * 3.2;
      const z0 = gz * 3.2;
      const z1 = (gz + 1) * 3.2;
      const isCenterPit = gx >= -1 && gx <= 0 && gz >= -1 && gz <= 0;
      const yLevel = isCenterPit ? -2.2 : -1.5;
      const baseTone = isCenterPit
        ? 0.15 + audio.bassEnvelope * 0.55
        : (gx + gz) & 1
        ? 0.36
        : 0.22;
      polygons.push({
        vertices: [
          { x: x0, y: yLevel, z: z0 },
          { x: x1, y: yLevel, z: z0 },
          { x: x1, y: yLevel, z: z1 },
          { x: x0, y: yLevel, z: z1 },
        ],
        tone: baseTone,
        checker: true,
        wireRim: isCenterPit && audio.transientPulse > 0.35,
      });
    }
  }

  const pillars = [
    { x: -4.2, z: -3.2, h: 4.0 },
    { x: 4.2, z: -3.2, h: 4.0 },
    { x: -4.6, z: 2.6, h: 4.6 },
    { x: 4.6, z: 2.6, h: 4.6 },
  ] as const;

  for (let i = 0; i < pillars.length; i++) {
    const pil = pillars[i];
    const w = 0.85;
    const y0 = -1.5;
    const y1 = y0 + pil.h + audio.midEnvelope * 0.8;
    polygons.push({
      vertices: [
        { x: pil.x - w, y: y0, z: pil.z - w },
        { x: pil.x + w, y: y0, z: pil.z - w },
        { x: pil.x + w * 0.75, y: y1, z: pil.z - w * 0.75 },
        { x: pil.x - w * 0.75, y: y1, z: pil.z - w * 0.75 },
      ],
      tone: 0.48 + (i % 2) * 0.1 + audio.midEnvelope * 0.2,
      checker: true,
    });
    polygons.push({
      vertices: [
        { x: pil.x + w, y: y0, z: pil.z - w },
        { x: pil.x + w, y: y0, z: pil.z + w },
        { x: pil.x + w * 0.75, y: y1, z: pil.z + w * 0.75 },
        { x: pil.x + w * 0.75, y: y1, z: pil.z - w * 0.75 },
      ],
      tone: 0.28 + audio.rmsEnvelope * 0.2,
      checker: false,
    });
  }

  const bob =
    (reducedMotion ? 0.1 : Math.sin(timeSeconds * 1.4) * 0.35) +
    audio.bassEnvelope * 0.95;
  const tipY = -0.7 + bob;
  const topY = 2.5 + bob;
  const r = 1.35 + audio.bassEnvelope * 0.35;
  const obeliskTone = 0.68 + audio.rmsEnvelope * 0.28;
  const rim = audio.transientPulse > 0.25;

  polygons.push(
    {
      vertices: [
        { x: 0, y: tipY, z: 0 },
        { x: -r, y: topY, z: -r },
        { x: r, y: topY, z: -r },
      ],
      tone: obeliskTone,
      checker: true,
      wireRim: rim,
    },
    {
      vertices: [
        { x: 0, y: tipY, z: 0 },
        { x: r, y: topY, z: -r },
        { x: r, y: topY, z: r },
      ],
      tone: obeliskTone * 0.78,
      checker: true,
      wireRim: rim,
    },
    {
      vertices: [
        { x: 0, y: tipY, z: 0 },
        { x: r, y: topY, z: r },
        { x: -r, y: topY, z: r },
      ],
      tone: obeliskTone * 0.62,
      checker: false,
      wireRim: rim,
    },
    {
      vertices: [
        { x: 0, y: tipY, z: 0 },
        { x: -r, y: topY, z: r },
        { x: -r, y: topY, z: -r },
      ],
      tone: obeliskTone * 0.85,
      checker: false,
      wireRim: rim,
    }
  );

  const motionScale = reducedMotion ? 0.15 : 1;
  const yawRad =
    0.38 + Math.sin(timeSeconds * 0.45) * 0.28 * motionScale + camOff.yawRad;
  const pitchRad =
    0.24 + (reducedMotion ? 0 : audio.transientPulse * 0.08) + camOff.pitchRad;
  const distance = Math.max(3.0, (11.2 - audio.bassEnvelope * 1.1) * camOff.distMul);
  const fovScale = Math.round(
    (195 + (reducedMotion ? 0 : audio.transientPulse * 14)) * camOff.fovMul
  );

  const counts = renderLowPolyMesh(
    tools,
    p,
    polygons,
    { yawRad, pitchRad, distance, fovScale, targetY: 0.2 },
    effects
  );

  const grainLines = Math.round((effects.grain + audio.trebleEnvelope) * 10);
  for (let i = 0; i < grainLines; i++) {
    const gy = 14 + ((i * 23 + Math.floor(timeSeconds * 12) * 5) % 154);
    const gx = (i * 67 + 19) % 280;
    line(gx, gy, gx + 14 + (i % 12), gy, i % 3 === 0 ? p.glow : p.face);
  }

  return counts;
}

function drawRaveDungeonScene(
  tools: RasterTools,
  p: StudyPalette,
  timeSeconds: number,
  audio: SceneAudioState,
  effects: RetroEffects,
  reducedMotion: boolean,
  camOff: PerspectiveOffsets
): { vertexCount: number; triangleCount: number } {
  const { rect, line } = tools;
  rect(0, 0, 320, 180, p.shadow);
  rect(0, 26, 320, 74, p.sky);
  rect(0, 100, 320, 74, p.structure);

  const polygons: Poly3D[] = [];
  const tunnelAdvance = (timeSeconds * (reducedMotion ? 0.6 : 1.8)) % 3.0;

  for (let seg = 0; seg < 5; seg++) {
    const z0 = -2.0 + seg * 3.0 - tunnelAdvance;
    const z1 = z0 + 2.6;
    const archHighlight =
      (seg % 2 === 0 ? 0.14 : 0) + audio.bassEnvelope * 0.28;

    polygons.push({
      vertices: [
        { x: -2.6, y: -1.8, z: z0 },
        { x: 2.6, y: -1.8, z: z0 },
        { x: 2.6, y: -1.8, z: z1 },
        { x: -2.6, y: -1.8, z: z1 },
      ],
      tone: 0.25 + archHighlight,
      checker: true,
      wireRim: seg === 1 && audio.bassEnvelope > 0.4,
    });

    polygons.push(
      {
        vertices: [
          { x: -3.2, y: -1.8, z: z0 },
          { x: -2.6, y: -1.8, z: z0 },
          { x: -2.2, y: 2.1, z: z0 },
          { x: -3.2, y: 2.4, z: z0 },
        ],
        tone: 0.44 + archHighlight,
        checker: true,
      },
      {
        vertices: [
          { x: 2.6, y: -1.8, z: z0 },
          { x: 3.2, y: -1.8, z: z0 },
          { x: 3.2, y: 2.4, z: z0 },
          { x: 2.2, y: 2.1, z: z0 },
        ],
        tone: 0.44 + archHighlight,
        checker: true,
      },
      {
        vertices: [
          { x: -2.4, y: 2.1, z: z0 },
          { x: 2.4, y: 2.1, z: z0 },
          { x: 2.0, y: 2.6, z: z1 },
          { x: -2.0, y: 2.6, z: z1 },
        ],
        tone: 0.34 + audio.midEnvelope * 0.26,
        checker: false,
        wireRim: audio.transientPulse > 0.3,
      }
    );
  }

  const gateOpen = audio.bassEnvelope * 0.7;
  polygons.push(
    {
      vertices: [
        { x: -2.2, y: -1.8, z: 11.5 },
        { x: -0.2 - gateOpen, y: -1.8, z: 11.5 },
        { x: -0.2 - gateOpen, y: 1.8, z: 11.5 },
        { x: -2.2, y: 1.8, z: 11.5 },
      ],
      tone: 0.56,
      checker: true,
    },
    {
      vertices: [
        { x: 0.2 + gateOpen, y: -1.8, z: 11.5 },
        { x: 2.2, y: -1.8, z: 11.5 },
        { x: 2.2, y: 1.8, z: 11.5 },
        { x: 0.2 + gateOpen, y: 1.8, z: 11.5 },
      ],
      tone: 0.56,
      checker: true,
    },
    {
      vertices: [
        { x: -0.9, y: -1.5, z: 12.0 },
        { x: 0.9, y: -1.5, z: 12.0 },
        { x: 0.9, y: 1.5, z: 12.0 },
        { x: -0.9, y: 1.5, z: 12.0 },
      ],
      tone: 0.85 + audio.rmsEnvelope * 0.15,
      checker: false,
    }
  );

  const sway = (reducedMotion ? 0 : Math.sin(timeSeconds * 0.9) * 0.12) + camOff.yawRad;
  const counts = renderLowPolyMesh(
    tools,
    p,
    polygons,
    {
      yawRad: sway,
      pitchRad: 0.08 + camOff.pitchRad,
      distance: Math.max(2.8, 6.8 * camOff.distMul),
      fovScale: Math.round(185 * camOff.fovMul),
      targetY: 0.0,
    },
    effects
  );

  const strobeBoost = 0.6 + (effects.strobeGlow ?? 0.25) * 0.8;
  if (!reducedMotion && audio.transientPulse * strobeBoost > 0.28) {
    line(160, 12, 118, 168, p.light);
    line(160, 12, 202, 168, p.light);
    rect(144, 152, 32, 4, p.light);
  }

  const rippleCount =
    12 + Math.round((audio.bassEnvelope + audio.trebleEnvelope) * 10);
  for (let i = 0; i < rippleCount; i++) {
    const ry = 128 + ((i * 5 + Math.floor(timeSeconds * 12)) % 42);
    const span = 12 + Math.round(((ry - 124) / 44) * 64);
    const rx = 160 - Math.floor(span / 2) + ((i * 7) % 9) - 4;
    rect(rx, ry, span, 1, i % 3 === 0 ? p.glow : p.reflection);
  }

  return counts;
}

function drawTechnoTherapyScene(
  tools: RasterTools,
  p: StudyPalette,
  timeSeconds: number,
  audio: SceneAudioState,
  effects: RetroEffects,
  reducedMotion: boolean,
  camOff: PerspectiveOffsets
): { vertexCount: number; triangleCount: number } {
  const { rect, line, bayer } = tools;
  rect(0, 0, 320, 180, p.sky);

  const psyche = clamp01(effects.psychedelic ?? 0);
  for (let y = 16; y < 164; y += 2) {
    const distY = Math.abs(y - 90) / 74;
    if (distY < 0.55 + audio.midEnvelope * 0.25) {
      for (let x = 24; x < 296; x += 4) {
        const distX = Math.abs(x - 160) / 136;
        const r = Math.sqrt(distX * distX + distY * distY);
        if (bayer(x >> 1, y >> 1) < (1 - r) * (0.45 + psyche * 0.4)) {
          rect(x, y, 3, 2, r < 0.35 ? p.haze : p.distant);
        }
      }
    }
  }

  const polygons: Poly3D[] = [];
  const ringCount = 3;
  const spinBase = reducedMotion
    ? 0
    : timeSeconds * (0.55 + audio.midEnvelope * 0.9 + psyche * 1.1);
  const pulseRadius = 1 + audio.bassEnvelope * 0.28;

  for (let rIdx = 0; rIdx < ringCount; rIdx++) {
    const zNear = 2.6 + rIdx * 2.2;
    const zFar = zNear + 0.65;
    const rad = (1.55 + rIdx * 0.38) * pulseRadius;
    const angleOffset = spinBase * (rIdx % 2 === 0 ? 1 : -1) + rIdx * 0.35;

    for (let seg = 0; seg < 8; seg++) {
      const a0 = angleOffset + (seg * Math.PI) / 4;
      const a1 = angleOffset + ((seg + 1) * Math.PI) / 4;
      const x0 = Math.cos(a0) * rad;
      const y0 = Math.sin(a0) * rad;
      const x1 = Math.cos(a1) * rad;
      const y1 = Math.sin(a1) * rad;

      polygons.push({
        vertices: [
          { x: x0, y: y0, z: zNear },
          { x: x1, y: y1, z: zNear },
          { x: x1, y: y1, z: zFar },
          { x: x0, y: y0, z: zFar },
        ],
        tone:
          seg % 2 === 0
            ? 0.72 + audio.bassEnvelope * 0.2
            : 0.38 + audio.midEnvelope * 0.2,
        checker: seg % 2 === 0,
      });
    }
  }

  const coreSpin = reducedMotion ? 0.3 : -timeSeconds * 1.4;
  const coreRad = 0.58 + audio.bassEnvelope * 0.36;
  const coreY = 0.9 + audio.rmsEnvelope * 0.35;
  const cPts = Array.from({ length: 4 }, (_, i) => {
    const a = coreSpin + (i * Math.PI) / 2;
    return {
      x: Math.cos(a) * coreRad,
      y: 0,
      z: 5.4 + Math.sin(a) * coreRad,
    };
  });
  const topApex = { x: 0, y: coreY, z: 5.4 };
  const botApex = { x: 0, y: -coreY, z: 5.4 };
  for (let i = 0; i < 4; i++) {
    const next = (i + 1) % 4;
    polygons.push(
      { vertices: [topApex, cPts[i], cPts[next]], tone: 0.88, checker: false },
      { vertices: [botApex, cPts[next], cPts[i]], tone: 0.64, checker: true }
    );
  }

  const counts = renderLowPolyMesh(
    tools,
    p,
    polygons,
    {
      yawRad:
        (reducedMotion ? 0 : Math.sin(timeSeconds * 0.7) * 0.14) +
        camOff.yawRad,
      pitchRad: 0.04 + camOff.pitchRad,
      distance: Math.max(2.4, 4.8 * camOff.distMul),
      fovScale: Math.round(190 * camOff.fovMul),
      targetY: 0,
    },
    effects
  );

  const laserCount = 4 + Math.round(audio.trebleEnvelope * 8);
  for (let i = 0; i < laserCount; i++) {
    const angle =
      (i / laserCount) * Math.PI * 2 + (reducedMotion ? 0 : timeSeconds * 0.8);
    const xOuter = 160 + Math.cos(angle) * 145;
    const yOuter = 90 + Math.sin(angle) * 78;
    const xInner = 160 + Math.cos(angle) * (18 + audio.bassEnvelope * 14);
    const yInner = 90 + Math.sin(angle) * (12 + audio.bassEnvelope * 10);
    line(
      xInner,
      yInner,
      xOuter,
      yOuter,
      i % 2 === 0 ? p.glow : p.reflection
    );
  }

  rect(18, 148, 284, 20, p.shadow);
  rect(18, 148, 284, 1, p.face);
  rect(18, 167, 284, 1, p.face);
  let prevX = 22;
  let prevY = 158;
  for (let x = 22; x <= 298; x += 4) {
    const phase = (x - 22) * 0.11 - timeSeconds * 9;
    const heartbeat =
      Math.sin(phase) *
      Math.exp(
        -Math.pow(((x + Math.floor(timeSeconds * 60)) % 48) - 24, 2) / 18
      );
    const amp = 3 + audio.bassEnvelope * 6 + audio.transientPulse * 5;
    const y = Math.max(
      150,
      Math.min(165, Math.round(158 - heartbeat * amp))
    );
    line(
      prevX,
      prevY,
      x,
      y,
      audio.transientPulse > 0.25 ? p.light : p.glow
    );
    prevX = x;
    prevY = y;
  }

  return counts;
}

function parseHexRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const n = parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHexRgb(r: number, g: number, b: number): string {
  const c = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

function lerpHexColor(hexA: string, hexB: string, t: number): string {
  const ratio = clamp01(t);
  if (ratio <= 0) return hexA;
  if (ratio >= 1) return hexB;
  const [r1, g1, b1] = parseHexRgb(hexA);
  const [r2, g2, b2] = parseHexRgb(hexB);
  return toHexRgb(
    r1 + (r2 - r1) * ratio,
    g1 + (g2 - g1) * ratio,
    b1 + (b2 - b1) * ratio
  );
}

export function blendStudyPalettes(
  base: StudyPalette,
  target: StudyPalette,
  factor: number
): StudyPalette {
  const t = clamp01(factor);
  if (t <= 0 || base === target) return base;
  if (t >= 1) return target;
  return {
    id: base.id,
    name: `${base.name} → ${target.name}`,
    sky: lerpHexColor(base.sky, target.sky, t),
    haze: lerpHexColor(base.haze, target.haze, t),
    distant: lerpHexColor(base.distant, target.distant, t),
    structure: lerpHexColor(base.structure, target.structure, t),
    face: lerpHexColor(base.face, target.face, t),
    shadow: lerpHexColor(base.shadow, target.shadow, t),
    light: lerpHexColor(base.light, target.light, t),
    glow: lerpHexColor(base.glow, target.glow, t),
    reflection: lerpHexColor(base.reflection, target.reflection, t),
  };
}

const PIXEL_FONT_5X5: Record<string, readonly number[]> = {
  A: [0b01110, 0b10001, 0b11111, 0b10001, 0b10001],
  B: [0b11110, 0b10001, 0b11110, 0b10001, 0b11110],
  C: [0b01111, 0b10000, 0b10000, 0b10000, 0b01111],
  D: [0b11110, 0b10001, 0b10001, 0b10001, 0b11110],
  E: [0b11111, 0b10000, 0b11110, 0b10000, 0b11111],
  F: [0b11111, 0b10000, 0b11110, 0b10000, 0b10000],
  G: [0b01111, 0b10000, 0b10111, 0b10001, 0b01111],
  H: [0b10001, 0b10001, 0b11111, 0b10001, 0b10001],
  I: [0b11111, 0b00100, 0b00100, 0b00100, 0b11111],
  J: [0b00111, 0b00010, 0b00010, 0b10010, 0b01100],
  K: [0b10001, 0b10010, 0b11100, 0b10010, 0b10001],
  L: [0b10000, 0b10000, 0b10000, 0b10000, 0b11111],
  M: [0b10001, 0b11011, 0b10101, 0b10001, 0b10001],
  N: [0b10001, 0b11001, 0b10101, 0b10011, 0b10001],
  O: [0b01110, 0b10001, 0b10001, 0b10001, 0b01110],
  P: [0b11110, 0b10001, 0b11110, 0b10000, 0b10000],
  Q: [0b01110, 0b10001, 0b10101, 0b10010, 0b01101],
  R: [0b11110, 0b10001, 0b11110, 0b10010, 0b10001],
  S: [0b01111, 0b10000, 0b01110, 0b00001, 0b11110],
  T: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100],
  U: [0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  V: [0b10001, 0b10001, 0b10001, 0b01010, 0b00100],
  W: [0b10001, 0b10001, 0b10101, 0b11011, 0b10001],
  X: [0b10001, 0b01010, 0b00100, 0b01010, 0b10001],
  Y: [0b10001, 0b01010, 0b00100, 0b00100, 0b00100],
  Z: [0b11111, 0b00010, 0b00100, 0b01000, 0b11111],
  "0": [0b01110, 0b10011, 0b10101, 0b11001, 0b01110],
  "1": [0b00100, 0b01100, 0b00100, 0b00100, 0b01110],
  "2": [0b01110, 0b10001, 0b00110, 0b01000, 0b11111],
  "3": [0b11110, 0b00001, 0b01110, 0b00001, 0b11110],
  "4": [0b10010, 0b10010, 0b11111, 0b00010, 0b00010],
  "5": [0b11111, 0b10000, 0b11110, 0b00001, 0b11110],
  "6": [0b01111, 0b10000, 0b11110, 0b10001, 0b01110],
  "7": [0b11111, 0b00010, 0b00100, 0b01000, 0b01000],
  "8": [0b01110, 0b10001, 0b01110, 0b10001, 0b01110],
  "9": [0b01110, 0b10001, 0b01111, 0b00001, 0b11110],
  "-": [0b00000, 0b00000, 0b11111, 0b00000, 0b00000],
  "/": [0b00001, 0b00010, 0b00100, 0b01000, 0b10000],
  ":": [0b00000, 0b00100, 0b00000, 0b00100, 0b00000],
  "!": [0b00100, 0b00100, 0b00100, 0b00000, 0b00100],
  "?": [0b01110, 0b00001, 0b00110, 0b00000, 0b00100],
  ".": [0b00000, 0b00000, 0b00000, 0b00000, 0b00100],
  ",": [0b00000, 0b00000, 0b00000, 0b00100, 0b01000],
  "'": [0b00100, 0b00100, 0b00000, 0b00000, 0b00000],
};

function drawLyricsOverlay(
  tools: RasterTools,
  p: StudyPalette,
  timeSeconds: number,
  audio: SceneAudioState,
  lyrics: NonNullable<SceneFrameInput["lyrics"]>,
  reducedMotion: boolean,
  canvasW: number = STUDY_SIZE.width,
  canvasH: number = STUDY_SIZE.height
): void {
  const evalState = evaluateLyricsAt(
    lyrics.text,
    timeSeconds,
    lyrics.timedWords
  );
  if (!evalState.line) return;

  const maxChars = Math.max(14, Math.floor((canvasW - 16) / 6));
  const scale =
    lyrics.style === "center-impact" && canvasW >= 240 ? 2 : 1;
  const charAdvance = 6 * scale;
  const maxLineChars = Math.max(10, Math.floor((canvasW - 16) / charAdvance));
  const activeLine = evalState.line.slice(0, Math.min(maxChars, maxLineChars));
  const totalWidth = Math.min(canvasW - 12, activeLine.length * charAdvance);
  const startX = Math.max(6, Math.floor((canvasW - totalWidth) / 2));

  // Positionnement adapté aux Safe Zones TikTok/Reels (9:16) vs 16:9
  const isVertical = canvasH > canvasW;
  const baseY =
    lyrics.style === "center-impact"
      ? Math.floor(canvasH * 0.48)
      : lyrics.style === "hud-terminal"
      ? isVertical
        ? 44
        : 18
      : isVertical
      ? Math.floor(canvasH * 0.72)
      : Math.max(20, canvasH - 28);

  tools.rect(startX - 4, baseY - 3, totalWidth + 8, 5 * scale + 6, p.shadow);
  tools.rect(
    startX - 4,
    baseY - 4,
    totalWidth + 8,
    1,
    audio.midEnvelope > 0.35 ? p.light : p.glow
  );

  let cursorX = startX;
  let currentWord = 0;
  for (let i = 0; i < activeLine.length; i++) {
    const ch = activeLine[i];
    if (ch === " ") {
      currentWord++;
      cursorX += charAdvance;
      continue;
    }
    const glyph = PIXEL_FONT_5X5[ch] ?? PIXEL_FONT_5X5["?"];
    const waveY =
      lyrics.style === "psyche-wave" && !reducedMotion
        ? Math.round(
            Math.sin(timeSeconds * 6 + i * 0.55) * (2 + audio.midEnvelope * 3)
          )
        : 0;
    const isHighlighted =
      !lyrics.autoVocalSync ||
      currentWord === evalState.activeWordIndex ||
      audio.midEnvelope > 0.3;
    const color = isHighlighted ? p.light : p.glow;

    for (let row = 0; row < 5; row++) {
      const bits = glyph[row];
      for (let col = 0; col < 5; col++) {
        if ((bits >> (4 - col)) & 1) {
          tools.rect(
            cursorX + col * scale,
            baseY + waveY + row * scale,
            scale,
            scale,
            color
          );
        }
      }
    }
    cursorX += charAdvance;
    if (cursorX > canvasW - 6) break;
  }
}

function applyPsychedelicPass(
  tools: RasterTools,
  p: StudyPalette,
  timeSeconds: number,
  audio: SceneAudioState,
  psychedelic: number,
  reducedMotion: boolean
): void {
  const amount = clamp01(psychedelic);
  if (amount <= 0.01) return;
  const { rect, line, bayer } = tools;
  const phase = reducedMotion ? 0 : timeSeconds * 3.2;

  const ringStep = amount > 0.6 ? 6 : 10;
  for (let y = 12; y < 168; y += ringStep) {
    for (let x = 16; x < 304; x += ringStep) {
      const dx = (x - 160) / 80;
      const dy = (y - 90) / 45;
      const wave =
        Math.sin(dx * 6 + phase) +
        Math.cos(dy * 6 - phase) +
        Math.sin(Math.sqrt(dx * dx + dy * dy) * 8 - phase * 1.5);
      const norm = (wave + 3) / 6;
      if (norm > 1 - amount * 0.55 && bayer(x >> 1, y >> 1) < amount) {
        const color =
          norm > 0.78 ? p.light : norm > 0.62 ? p.glow : p.reflection;
        rect(x, y, 2, 2, color);
        rect(318 - x, y, 2, 2, color);
        rect(x, 178 - y, 2, 2, color);
        rect(318 - x, 178 - y, 2, 2, color);
      }
    }
  }

  if (!reducedMotion && amount > 0.35) {
    const spokeCount = 4 + Math.round(amount * 8);
    for (let i = 0; i < spokeCount; i++) {
      const a = phase * 0.5 + (i * Math.PI * 2) / spokeCount;
      const rIn = 22 + audio.bassEnvelope * 24;
      const rOut = 52 + amount * 68;
      line(
        160 + Math.cos(a) * rIn,
        90 + Math.sin(a) * rIn * 0.6,
        160 + Math.cos(a) * rOut,
        90 + Math.sin(a) * rOut * 0.6,
        i % 2 === 0 ? p.light : p.glow
      );
    }
  }
}

/**
 * Symétrie miroir kaléidoscopique rapide (2, 4, 6 ou 8 segments) pilotée par `postFx.kaleidoscopeSegments`.
 */
function applyKaleidoscopePass(
  ctx: CanvasRenderingContext2D,
  segments: 0 | 2 | 4 | 6 | 8,
  width: number = STUDY_SIZE.width,
  height: number = STUDY_SIZE.height
): void {
  if (!segments || segments <= 0) return;
  const imgData = ctx.getImageData(0, 0, width, height);
  const src = new Uint8ClampedArray(imgData.data);
  const dst = imgData.data;
  const halfW = width >> 1;
  const halfH = height >> 1;

  if (segments === 2) {
    for (let y = 0; y < height; y++) {
      for (let x = halfW; x < width; x++) {
        const mx = width - 1 - x;
        const sIdx = (y * width + mx) * 4;
        const dIdx = (y * width + x) * 4;
        dst[dIdx] = src[sIdx];
        dst[dIdx + 1] = src[sIdx + 1];
        dst[dIdx + 2] = src[sIdx + 2];
      }
    }
  } else {
    // 4, 6 ou 8 segments : symétrie quadrants + diagonales pour 6/8
    for (let y = 0; y < height; y++) {
      const sy = y < halfH ? y : height - 1 - y;
      for (let x = 0; x < width; x++) {
        let sx = x < halfW ? x : width - 1 - x;
        let ty = sy;
        if (segments >= 6) {
          const nx = sx / Math.max(1, halfW);
          const ny = ty / Math.max(1, halfH);
          if (ny > nx) {
            sx = Math.min(halfW - 1, Math.round(ny * halfW));
            ty = Math.min(halfH - 1, Math.round(nx * halfH));
          }
        }
        const sIdx = (ty * width + sx) * 4;
        const dIdx = (y * width + x) * 4;
        dst[dIdx] = src[sIdx];
        dst[dIdx + 1] = src[sIdx + 1];
        dst[dIdx + 2] = src[sIdx + 2];
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

/**
 * Calque 0 (`backdrop`) du moteur v2 : dégradé de ciel 2 couleurs, soleil synthwave strié et étoiles.
 */
/**
 * Shaders procéduraux de fond (`backdrop.shader`) v3 :
 * plasma_fluid, voronoi_cells, radial_sunburst, grid_horizon, noise_fog.
 */
function drawProceduralBackdropShader(
  ctx: CanvasRenderingContext2D,
  shader: Anarchy3DBackdropShaderConfig,
  audio: SceneAudioState,
  timeSeconds: number,
  width: number,
  height: number,
  reducedMotion: boolean
): void {
  if (shader.type === "none") return;
  const cols =
    shader.colors && shader.colors.length >= 2
      ? shader.colors
      : ["#050510", "#ff2a85", "#00f5ff"];
  const c0 = cols[0];
  const c1 = cols[1];
  const c2 = cols[2] ?? cols[1];
  const spd = reducedMotion ? 0 : shader.speed ?? 1.0;
  const t = timeSeconds * spd;
  const audioBoost = shader.audioReactive
    ? 1 + audio.bassEnvelope * 0.6 + audio.midEnvelope * 0.35
    : 1;
  const horizonY = Math.round(height * 0.54);

  if (shader.type === "plasma_fluid") {
    const step = 6;
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const nx = (x / width) * 4.2;
        const ny = (y / height) * 3.6;
        const v =
          Math.sin(nx + t * 1.1) +
          Math.sin(ny * 1.3 - t * 0.9) +
          Math.sin((nx + ny) * 0.9 + t * 0.7 * audioBoost);
        const norm = clamp01((v + 3) / 6);
        ctx.fillStyle =
          norm < 0.5
            ? lerpHexColor(c0, c1, norm * 2)
            : lerpHexColor(c1, c2, (norm - 0.5) * 2);
        ctx.fillRect(x, y, step, step);
      }
    }
    return;
  }

  if (shader.type === "voronoi_cells") {
    const seeds = [
      { x: 0.2 + Math.sin(t * 0.7) * 0.12, y: 0.3 + Math.cos(t * 0.5) * 0.15 },
      { x: 0.5 + Math.cos(t * 0.6) * 0.18, y: 0.25 + Math.sin(t * 0.8) * 0.12 },
      { x: 0.8 + Math.sin(t * 0.5 + 1) * 0.12, y: 0.4 + Math.cos(t * 0.7) * 0.16 },
      { x: 0.35 + Math.cos(t * 0.9) * 0.14, y: 0.72 + Math.sin(t * 0.6) * 0.14 },
      { x: 0.7 + Math.sin(t * 0.8 + 2) * 0.15, y: 0.75 + Math.cos(t * 0.4) * 0.12 },
    ];
    const step = 6;
    for (let y = 0; y < height; y += step) {
      const ny = y / height;
      for (let x = 0; x < width; x += step) {
        const nx = x / width;
        let minD = 9;
        let secD = 9;
        for (let i = 0; i < seeds.length; i++) {
          const dx = nx - seeds[i].x;
          const dy = ny - seeds[i].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < minD) {
            secD = minD;
            minD = d;
          } else if (d < secD) {
            secD = d;
          }
        }
        const edge = clamp01(1 - (secD - minD) * (10 * audioBoost));
        const cellShade = clamp01(minD * 2.2);
        ctx.fillStyle = lerpHexColor(
          lerpHexColor(c0, c1, cellShade),
          c2,
          edge * 0.9
        );
        ctx.fillRect(x, y, step, step);
      }
    }
    return;
  }

  if (shader.type === "radial_sunburst") {
    const cx = width * 0.5;
    const cy = horizonY;
    const rays = 16;
    ctx.save();
    ctx.fillStyle = c0;
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < rays; i++) {
      const a0 = (i / rays) * Math.PI * 2 + t * 0.35;
      const a1 = a0 + (Math.PI / rays) * (0.65 + (audioBoost - 1) * 0.25);
      const r = Math.max(width, height) * 1.1;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a0) * r, cy + Math.sin(a0) * r);
      ctx.lineTo(cx + Math.cos(a1) * r, cy + Math.sin(a1) * r);
      ctx.closePath();
      ctx.fillStyle = i % 2 === 0 ? c1 : c2;
      ctx.globalAlpha = 0.45;
      ctx.fill();
    }
    ctx.restore();
    return;
  }

  if (shader.type === "grid_horizon") {
    ctx.save();
    ctx.fillStyle = c0;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = c1;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.55;
    const cx = width * 0.5;
    for (let i = -8; i <= 8; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * 6, horizonY);
      ctx.lineTo(cx + i * 38, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + i * 6, horizonY);
      ctx.lineTo(cx + i * 38, 0);
      ctx.stroke();
    }
    const scroll = (t * 24) % 16;
    ctx.strokeStyle = c2;
    for (let d = 1; d < 10; d++) {
      const off = Math.pow(d / 10, 1.7) * (height - horizonY) + scroll * 0.35;
      if (horizonY + off < height) {
        ctx.beginPath();
        ctx.moveTo(0, horizonY + off);
        ctx.lineTo(width, horizonY + off);
        ctx.stroke();
      }
      if (horizonY - off > 0) {
        ctx.beginPath();
        ctx.moveTo(0, horizonY - off);
        ctx.lineTo(width, horizonY - off);
        ctx.stroke();
      }
    }
    ctx.restore();
    return;
  }

  if (shader.type === "noise_fog") {
    ctx.save();
    ctx.fillStyle = c0;
    ctx.fillRect(0, 0, width, height);
    for (let b = 0; b < 7; b++) {
      const yBase = (b / 7) * height;
      const bandH = Math.round(height / 5);
      const shift = Math.sin(t * (0.4 + b * 0.13) + b * 1.7) * 24 * audioBoost;
      ctx.globalAlpha = 0.28 + (b % 2) * 0.12;
      ctx.fillStyle = b % 2 === 0 ? c1 : c2;
      ctx.fillRect(0, Math.round(yBase + shift * 0.3), width, bandH);
    }
    ctx.restore();
  }
}

function drawAnarchy3DBackdropLayer(
  ctx: CanvasRenderingContext2D,
  backdrop: Anarchy3DBackdropLayer,
  audio: SceneAudioState,
  timeSeconds: number,
  width: number,
  height: number,
  seed: number,
  reducedMotion: boolean
): void {
  const [skyTop, skyBottom] = backdrop.skyGradient;
  const horizonY = Math.round(height * 0.54);

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, skyTop);
  grad.addColorStop(0.54, skyBottom);
  grad.addColorStop(1, lerpHexColor(skyBottom, "#000000", 0.58));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  if (backdrop.shader && backdrop.shader.type !== "none") {
    drawProceduralBackdropShader(
      ctx,
      backdrop.shader,
      audio,
      timeSeconds,
      width,
      height,
      reducedMotion
    );
  }

  // Étoiles & particules d'ambiance
  if (backdrop.starfield?.enabled) {
    const density = clamp01(backdrop.starfield.density ?? 0.5);
    const starCount = Math.round(18 + density * 64);
    const starColor = backdrop.starfield.color ?? "#FFFFFF";
    let rng = (seed ^ 0x9e3779b9) >>> 0;
    const nextRand = () => {
      rng = (rng * 1664525 + 1013904223) >>> 0;
      return rng / 4294967296;
    };
    for (let i = 0; i < starCount; i++) {
      const sx = Math.floor(nextRand() * width);
      const sy = Math.floor(nextRand() * (horizonY - 6));
      const twinkle = reducedMotion
        ? 0.65
        : 0.35 + 0.65 * Math.abs(Math.sin(timeSeconds * (1.5 + (i % 5) * 0.4) + i));
      const sz = i % 7 === 0 && audio.trebleEnvelope > 0.35 ? 2 : 1;
      ctx.globalAlpha = clamp01(twinkle * (0.55 + audio.trebleEnvelope * 0.45));
      ctx.fillStyle = starColor;
      ctx.fillRect(sx, sy, sz, sz);
    }
    ctx.globalAlpha = 1;
  }

  // Soleil Synthwave strié à l'horizon
  if (backdrop.horizonSun?.enabled) {
    const sunSize = Math.max(0.3, Math.min(2.0, backdrop.horizonSun.size ?? 1.0));
    const radius = Math.round(32 * sunSize * (1 + audio.bassEnvelope * 0.08));
    const cx = Math.round(width * 0.5);
    const cy = horizonY - Math.round(radius * 0.28);

    const sunGrad = ctx.createLinearGradient(cx, cy - radius, cx, cy + radius);
    sunGrad.addColorStop(0, backdrop.horizonSun.colorTop);
    sunGrad.addColorStop(1, backdrop.horizonSun.colorBottom);

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = sunGrad;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

    // Bandes horizontales découpant la moitié inférieure du soleil
    const stripeCount = Math.max(0, Math.min(14, backdrop.horizonSun.stripes ?? 6));
    ctx.fillStyle = skyBottom;
    for (let s = 0; s < stripeCount; s++) {
      const t = (s + 1) / (stripeCount + 1);
      const sy = Math.round(cy + t * radius * 0.92);
      const sh = Math.max(1, Math.round(1 + t * 3.2));
      ctx.fillRect(cx - radius - 2, sy, radius * 2 + 4, sh);
    }
    ctx.restore();
  }

  // Ligne d'horizon lumineuse
  ctx.fillStyle = lerpHexColor(skyBottom, "#FFFFFF", 0.18 + audio.trebleEnvelope * 0.25);
  ctx.fillRect(0, horizonY, width, 1);
}

/**
 * Générateurs 2D/2.5D v3 (`particle_field`, `ribbon_trails`) rendus par-dessus la scène 3D.
 */
function drawAnarchy3DGeneratorsOverlay(
  ctx: CanvasRenderingContext2D,
  generators: readonly Anarchy3DGenerator[],
  audio: SceneAudioState,
  timeSeconds: number,
  width: number = STUDY_SIZE.width,
  height: number = STUDY_SIZE.height,
  seed: number,
  reducedMotion: boolean
): void {
  if (!generators || generators.length === 0) return;
  const t = reducedMotion ? 0 : timeSeconds;

  for (let gIdx = 0; gIdx < generators.length; gIdx++) {
    const gen = generators[gIdx];
    const col = gen.color ?? "#00f5ff";
    const col2 = gen.secondaryColor ?? "#ff2a85";
    const audioMul = 1 + audio.bassEnvelope * 0.8 + audio.transientPulse * 0.65;

    if (gen.type === "particle_field") {
      const count = Math.max(40, Math.min(600, Math.round((gen.count ?? 400) * 0.2)));
      const behavior = gen.behavior ?? "vortex";
      const spd = (gen.speed ?? 1.0) * (reducedMotion ? 0 : 1);
      const szBase = Math.max(1, Math.min(4, Math.round(gen.scale ?? 1.5)));
      let rng = ((seed + gIdx * 7919) ^ 0x517cc1b7) >>> 0;
      const nextRand = () => {
        rng = (rng * 1664525 + 1013904223) >>> 0;
        return rng / 4294967296;
      };
      ctx.save();
      for (let i = 0; i < count; i++) {
        const r0 = nextRand();
        const r1 = nextRand();
        const r2 = nextRand();
        let px = 0;
        let py = 0;
        if (behavior === "vortex") {
          const ang = r0 * Math.PI * 2 + t * spd * (0.6 + r1 * 1.4);
          const rad = (12 + r1 * (width * 0.45)) * (0.75 + (audioMul - 1) * 0.35);
          px = width * 0.5 + Math.cos(ang) * rad;
          py = height * 0.5 + Math.sin(ang) * rad * 0.62;
        } else if (behavior === "explosion_on_kick") {
          const ang = r0 * Math.PI * 2;
          const burst = ((t * spd * 0.7 + r2) % 1) * (width * 0.55) * audioMul;
          px = width * 0.5 + Math.cos(ang) * burst;
          py = height * 0.5 + Math.sin(ang) * burst * 0.72;
        } else if (behavior === "rain") {
          px = r0 * width;
          py = ((r1 * height + t * spd * (75 + r2 * 60) * audioMul) % (height + 8)) - 4;
        } else {
          // swarm
          px =
            width * 0.5 +
            Math.sin(t * spd * (0.9 + r0) + r1 * 12) * (width * 0.42) * audioMul;
          py =
            height * 0.5 +
            Math.cos(t * spd * (1.1 + r1) + r2 * 12) * (height * 0.38);
        }
        ctx.globalAlpha = 0.45 + r2 * 0.55;
        ctx.fillStyle = i % 3 === 0 ? col2 : col;
        if (behavior === "rain") {
          ctx.fillRect(Math.round(px), Math.round(py), 1, szBase * 3);
        } else {
          ctx.fillRect(Math.round(px), Math.round(py), szBase, szBase);
        }
      }
      ctx.restore();
    } else if (gen.type === "ribbon_trails") {
      const ribbons = Math.max(2, Math.min(12, Math.round(gen.count ?? 6)));
      const spd = (gen.speed ?? 1.0) * (reducedMotion ? 0 : 1);
      const amp = (gen.scale ?? 1.0) * 28 * audioMul;
      ctx.save();
      ctx.lineWidth = Math.max(1, Math.min(4, Math.round((gen.scale ?? 1) * 1.5)));
      for (let r = 0; r < ribbons; r++) {
        ctx.strokeStyle = r % 2 === 0 ? col : col2;
        ctx.globalAlpha = 0.65;
        ctx.beginPath();
        const yBase = ((r + 1) / (ribbons + 1)) * height;
        for (let x = 0; x <= width; x += 12) {
          const y =
            yBase +
            Math.sin(x * 0.025 + t * spd * 2.1 + r * 1.3) * amp +
            Math.cos(x * 0.012 - t * spd * 1.4 + r) * (amp * 0.5);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
  }
}

/**
 * Bruit 3D déterministe lisse (Simplex/Value FBM) — zéro eval, 60 FPS.
 */
function fbmNoise3D(x: number, y: number, z: number): number {
  const n1 = Math.sin(x * 1.7 + Math.cos(y * 1.3 + z * 0.9)) * Math.cos(z * 1.5 - x * 0.8);
  const n2 = Math.sin(x * 3.1 - y * 2.7 + z * 2.3) * 0.5;
  const n3 = Math.cos(y * 5.3 + z * 4.1 - x * 3.7) * 0.25;
  return (n1 + n2 + n3) / 1.75;
}

const V4_SPRITE_IMAGE_CACHE = new Map<string, HTMLImageElement>();

function getStudioLightConfig(preset?: AnarchyStudioLightingPreset): {
  keyColor: string;
  rimColor: string;
  ambient: number;
  lightDirX: number;
  lightDirY: number;
} {
  switch (preset) {
    case "studio_clean":
      return { keyColor: "#FFFFFF", rimColor: "#93C5FD", ambient: 0.45, lightDirX: -0.45, lightDirY: -0.6 };
    case "cyber_neon":
      return { keyColor: "#00F0FF", rimColor: "#FF1B6B", ambient: 0.3, lightDirX: 0.5, lightDirY: -0.5 };
    case "sunset_warm":
      return { keyColor: "#FDE047", rimColor: "#EA580C", ambient: 0.36, lightDirX: -0.3, lightDirY: -0.7 };
    case "dark_void":
    default:
      return { keyColor: "#E0E7FF", rimColor: "#6366F1", ambient: 0.18, lightDirX: 0.35, lightDirY: -0.65 };
  }
}

/**
 * COUCHE 1 v4 — Environnement, Éclairage Studio virtuel, Fond procédural & Brouillard volumétrique.
/**
 * Courbes d'easing v6 (linear, easeInOutCubic, elasticOut, expoIn).
 */
function evaluateMorphEasing(t: number, easing?: AnarchyMorphEasing): number {
  const x = clamp01(t);
  switch (easing) {
    case "easeInOutCubic":
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    case "elasticOut": {
      if (x === 0 || x === 1) return x;
      const c4 = (2 * Math.PI) / 3;
      return Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    }
    case "expoIn":
      return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
    case "linear":
    default:
      return x;
  }
}

/**
 * Évalue les 4 LFO synchronisés au BPM (`lfo_1`..`lfo_4`) dans [0..1].
 */
function evaluateSceneLfos(
  modulators: readonly Anarchy3DLfoModulator[] | undefined,
  timeSeconds: number,
  bpm = 128
): Record<string, number> {
  const out: Record<string, number> = {
    lfo_1: 0.5 + 0.5 * Math.sin(timeSeconds * 2),
    lfo_2: 0.5 + 0.5 * Math.cos(timeSeconds * 1.5),
    lfo_3: (timeSeconds * 0.8) % 1,
    lfo_4: Math.sin(timeSeconds * 4) >= 0 ? 1 : 0,
  };
  if (!modulators || modulators.length === 0) return out;
  const totalBeats = (timeSeconds * Math.max(40, bpm)) / 60;
  for (const mod of modulators) {
    const rate = Math.max(0.125, mod.rateBeats || 2);
    const rawPhase = totalBeats / rate + (mod.phase ?? 0);
    const cycle = ((rawPhase % 1) + 1) % 1;
    let val = 0.5;
    switch (mod.waveform) {
      case "sine":
        val = 0.5 + 0.5 * Math.sin(cycle * Math.PI * 2);
        break;
      case "triangle":
        val = 1 - Math.abs(cycle * 2 - 1);
        break;
      case "saw":
        val = cycle;
        break;
      case "square":
        val = cycle < 0.5 ? 1 : 0;
        break;
      case "random_hold": {
        const slot = Math.floor(rawPhase);
        const h = Math.sin(slot * 12.9898 + 78.233) * 43758.5453;
        val = h - Math.floor(h);
        break;
      }
    }
    out[mod.id] = clamp01(val);
  }
  return out;
}

/**
 * Évalue une cible d'automation v6 (`automations[]`) sur la progression [0..1] de la scène.
 */
function resolveAutomationOverride(
  automations: readonly Anarchy3DSceneAutomation[] | undefined,
  target: string,
  actorId: string | undefined,
  sceneProgress: number
): number | undefined {
  if (!automations || automations.length === 0) return undefined;
  for (const au of automations) {
    if (au.target !== target) continue;
    if (au.actorId && actorId && au.actorId !== actorId) continue;
    const e = evaluateMorphEasing(sceneProgress, au.easing);
    return au.from + (au.to - au.from) * e;
  }
  return undefined;
}

// Tampons Float32Array pré-alloués pour le morphing géométrique (Vertex Lerp) et de particules à 60 FPS (zéro allocation GC par frame)
const MORPH_VERTEX_STEPS = 64;
const MORPH_SWARM_COUNT = 520;
const MORPH_UNIT_ANGLES = (() => {
  const arr = new Float32Array(MORPH_VERTEX_STEPS + 1);
  for (let i = 0; i <= MORPH_VERTEX_STEPS; i++) {
    arr[i] = (i / MORPH_VERTEX_STEPS) * Math.PI * 2;
  }
  return arr;
})();
const MORPH_SWARM_SEEDS = (() => {
  const arr = new Float32Array(MORPH_SWARM_COUNT * 3);
  let rng = 0x6c8e9cf5 >>> 0;
  for (let i = 0; i < arr.length; i++) {
    rng = (rng * 1664525 + 1013904223) >>> 0;
    arr[i] = rng / 4294967296;
  }
  return arr;
})();

/**
 * Échantillonne le rayon polaire normalisé d'un acteur (`organic_blob` ou `rubber_hose_mesh`) à l'angle `ang`
 * pour permettre le Vertex Lerp temps réel entre deux formes ou topologies différentes.
 */
function sampleActorContourRadius(
  actor: Anarchy3DActor,
  ang: number,
  baseR: number,
  t: number,
  rotSpeed: number,
  noiseAmt: number,
  salt: number
): number {
  if (actor.type === "rubber_hose_mesh") {
    const shape = actor.shape ?? "boss_character";
    if (shape === "boss_character") {
      // Silhouette boss à couronne/cornes sur le haut
      const crown =
        ang > -Math.PI * 0.85 && ang < -Math.PI * 0.15
          ? Math.max(0, Math.sin((ang + Math.PI * 0.5) * 6)) * 0.28
          : 0;
      return baseR * (0.88 + crown);
    }
    if (shape === "vintage_wheel" || shape === "psyche_tunnel") {
      return baseR * (0.9 + 0.08 * Math.cos(ang * 8 + t * rotSpeed * 2));
    }
    if (shape === "pie_eyes") {
      return baseR * (0.78 + 0.22 * Math.abs(Math.cos(ang)));
    }
    return baseR * (0.85 + 0.15 * Math.sin(ang * 3 + t * rotSpeed));
  }
  // organic_blob (ou autre forme) : bruit Simplex/FBM 3D continu
  const freq = actor.noiseFrequency ?? 1.8;
  const nx = Math.cos(ang) * freq + t * rotSpeed * 0.55;
  const ny = Math.sin(ang) * freq - t * rotSpeed * 0.42;
  const nz = t * rotSpeed * 0.35 + salt * 2.1;
  const disp = fbmNoise3D(nx, ny, nz) * noiseAmt * 0.36;
  return baseR * (1 + disp);
}

/**
 * Calcule la position cible (x, y) de la particule `i` selon `shapeTarget` v6
 * (`sphere` | `vortex` | `tunnel` | `grid` | `text_outline`) ou `behavior`.
 */
function sampleParticleTargetPos(
  i: number,
  shapeTarget: AnarchySwarmShapeTarget | undefined,
  behavior: string | undefined,
  cx: number,
  cy: number,
  width: number,
  height: number,
  t: number,
  rotSpeed: number,
  scale: number
): [number, number] {
  const r0 = MORPH_SWARM_SEEDS[i * 3];
  const r1 = MORPH_SWARM_SEEDS[i * 3 + 1];
  const r2 = MORPH_SWARM_SEEDS[i * 3 + 2];

  if (shapeTarget === "sphere") {
    const theta = r0 * Math.PI * 2 + t * rotSpeed * 0.65;
    const phi = Math.acos(2 * r1 - 1);
    const rad = Math.min(width, height) * 0.32 * scale * (0.82 + 0.18 * r2);
    return [
      cx + Math.sin(phi) * Math.cos(theta) * rad,
      cy + Math.cos(phi) * rad * 0.85,
    ];
  }
  if (shapeTarget === "tunnel") {
    const ringIdx = i % 10;
    const depthFrac = ((ringIdx / 10 + t * rotSpeed * 0.25) % 1);
    const ang = r0 * Math.PI * 2 + t * rotSpeed * (ringIdx % 2 === 0 ? 0.5 : -0.5);
    const rad = (0.1 + depthFrac * 0.52) * Math.min(width, height) * scale;
    return [cx + Math.cos(ang) * rad * 1.25, cy + Math.sin(ang) * rad * 0.85];
  }
  if (shapeTarget === "grid") {
    const cols = 24;
    const rows = Math.ceil(MORPH_SWARM_COUNT / cols);
    const gx = (i % cols) / (cols - 1) - 0.5;
    const gy = Math.floor(i / cols) / Math.max(1, rows - 1) - 0.5;
    const wave = Math.sin(gx * 6 + gy * 6 + t * rotSpeed * 2) * 8 * scale;
    return [
      cx + gx * width * 0.78 * scale,
      cy + gy * height * 0.72 * scale + wave,
    ];
  }
  if (shapeTarget === "text_outline") {
    // Monogramme étoile / A-cercle Anarchy Open Hub
    const branch = i % 5;
    const u = r0;
    const outerR = Math.min(width, height) * 0.36 * scale;
    if (branch === 0) {
      const ang = u * Math.PI * 2 + t * rotSpeed * 0.3;
      return [cx + Math.cos(ang) * outerR, cy + Math.sin(ang) * outerR];
    }
    if (branch === 1) {
      return [
        cx + (u - 0.5) * outerR * 1.1,
        cy + outerR * 0.8 - Math.abs(u - 0.5) * outerR * 3.1,
      ];
    }
    if (branch === 2) {
      return [cx + (u - 0.5) * outerR * 1.25, cy + outerR * 0.12];
    }
    const ang = (branch * 2.4 + u * 6.28) + t * rotSpeed * 0.4;
    return [
      cx + Math.cos(ang) * outerR * 0.55,
      cy + Math.sin(ang) * outerR * 0.55,
    ];
  }
  if (shapeTarget === "vortex" || behavior === "vortex") {
    const ang = r0 * Math.PI * 2 + t * rotSpeed * (0.7 + r1 * 1.5);
    const rad = (10 + r1 * width * 0.44) * scale;
    return [cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad * 0.64];
  }
  if (behavior === "beat_explosion") {
    const ang = r0 * Math.PI * 2;
    const rad = ((t * rotSpeed * 0.65 + r2) % 1) * width * 0.52 * scale;
    return [cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad * 0.72];
  }
  if (behavior === "floating_dust") {
    return [
      ((r0 * width + Math.sin(t * 0.5 + i) * 18) % width + width) % width,
      ((r1 * height - t * rotSpeed * (12 + r2 * 18)) % height + height) % height,
    ];
  }
  // curl_noise_flow
  const bx = (r0 - 0.5) * width * 1.1;
  const by = (r1 - 0.5) * height * 1.1;
  const nx = bx * 0.012 + t * rotSpeed * 0.35;
  const ny = by * 0.012 - t * rotSpeed * 0.28;
  const curlX = fbmNoise3D(nx, ny, r2 * 4) * 52 * scale;
  const curlY = fbmNoise3D(ny + 3.1, nx - 1.7, r2 * 4) * 44 * scale;
  return [
    ((cx + bx + curlX) % width + width) % width,
    ((cy + by + curlY) % height + height) % height,
  ];
}

/**
 * COUCHE 1 v4/v6 — Environnement, Éclairage Studio virtuel, Fond procédural & Morphing inter-scènes.
 */
function drawV4EnvironmentLayer(
  ctx: CanvasRenderingContext2D,
  scene: Anarchy3DScene,
  audio: SceneAudioState,
  timeSeconds: number,
  width: number,
  height: number,
  seed: number,
  reducedMotion: boolean,
  prevScene?: Anarchy3DScene,
  morphAlpha = 1
): void {
  const env = scene.environment;
  const prevEnv = prevScene?.environment;
  const isMorphing = Boolean(prevEnv && morphAlpha < 0.999);
  const m = clamp01(morphAlpha);

  const rawCols =
    env.backdropColors && env.backdropColors.length > 0
      ? env.backdropColors
      : [env.skyColor, env.fogColor, env.terrainPrimaryColor];
  const prevCols =
    prevEnv?.backdropColors && prevEnv.backdropColors.length > 0
      ? prevEnv.backdropColors
      : [
          prevEnv?.skyColor ?? rawCols[0],
          prevEnv?.fogColor ?? rawCols[1],
          prevEnv?.terrainPrimaryColor ?? rawCols[2],
        ];

  const c0 = isMorphing
    ? lerpHexColor(prevCols[0] ?? "#090D16", rawCols[0] ?? "#090D16", m)
    : rawCols[0] ?? "#090D16";
  const c1 = isMorphing
    ? lerpHexColor(prevCols[1] ?? c0, rawCols[1] ?? c0, m)
    : rawCols[1] ?? c0;
  const c2 = isMorphing
    ? lerpHexColor(prevCols[2] ?? c1, rawCols[2] ?? c1, m)
    : rawCols[2] ?? c1;
  const t = reducedMotion ? 0 : timeSeconds;

  ctx.save();
  ctx.imageSmoothingEnabled = true;

  switch (env.backdropType) {
    case "solid_color":
      ctx.fillStyle = c0;
      ctx.fillRect(0, 0, width, height);
      break;
    case "liquid_plasma": {
      drawProceduralBackdropShader(
        ctx,
        { type: "plasma_fluid", colors: [c0, c1, c2], speed: 1.15, audioReactive: 0.85 },
        audio,
        timeSeconds,
        width,
        height,
        reducedMotion
      );
      break;
    }
    case "grid_horizon": {
      drawProceduralBackdropShader(
        ctx,
        { type: "grid_horizon", colors: [c0, c1, c2], speed: 1.0, audioReactive: 0.65 },
        audio,
        timeSeconds,
        width,
        height,
        reducedMotion
      );
      break;
    }
    case "starfield": {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, c0);
      grad.addColorStop(1, c1);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      let rng = (seed ^ 0x6c8e9cf5) >>> 0;
      const next = () => {
        rng = (rng * 1664525 + 1013904223) >>> 0;
        return rng / 4294967296;
      };
      for (let i = 0; i < 95; i++) {
        const sx = next() * width;
        const sy = next() * height;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.8 + (i % 4) * 0.4) + i));
        const r = i % 9 === 0 ? 1.8 : 0.9;
        ctx.globalAlpha = clamp01(tw * (0.65 + audio.trebleEnvelope * 0.35));
        ctx.fillStyle = i % 4 === 0 ? c2 : "#FFFFFF";
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      break;
    }
    case "gradient_sky":
    default: {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, c0);
      grad.addColorStop(0.55, c1);
      grad.addColorStop(1, c2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      break;
    }
  }

  // Éclairage studio virtuel (halo key-light + rim-light doux)
  if (env.lightingPreset || prevEnv?.lightingPreset) {
    const curLight = getStudioLightConfig(env.lightingPreset);
    const prevLight = getStudioLightConfig(prevEnv?.lightingPreset ?? env.lightingPreset);
    const keyColor = isMorphing
      ? lerpHexColor(prevLight.keyColor, curLight.keyColor, m)
      : curLight.keyColor;
    const rimColor = isMorphing
      ? lerpHexColor(prevLight.rimColor, curLight.rimColor, m)
      : curLight.rimColor;
    const dirX = isMorphing
      ? prevLight.lightDirX + (curLight.lightDirX - prevLight.lightDirX) * m
      : curLight.lightDirX;
    const dirY = isMorphing
      ? prevLight.lightDirY + (curLight.lightDirY - prevLight.lightDirY) * m
      : curLight.lightDirY;

    const keyX = width * (0.5 + dirX * 0.5);
    const keyY = height * (0.5 + dirY * 0.45);
    const keyGrad = ctx.createRadialGradient(keyX, keyY, 4, keyX, keyY, width * 0.72);
    keyGrad.addColorStop(0, keyColor);
    keyGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.16 + audio.bassEnvelope * 0.1;
    ctx.fillStyle = keyGrad;
    ctx.fillRect(0, 0, width, height);

    const rimX = width * (0.5 - dirX * 0.55);
    const rimY = height * 0.72;
    const rimGrad = ctx.createRadialGradient(rimX, rimY, 4, rimX, rimY, width * 0.65);
    rimGrad.addColorStop(0, rimColor);
    rimGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.14 + audio.midEnvelope * 0.12;
    ctx.fillStyle = rimGrad;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;
  }

  // Brouillard volumétrique doux (interpolé lors du morphing)
  const curFogDen = env.fog?.enabled ? env.fog.density ?? 0.03 : 0;
  const prevFogDen = prevEnv?.fog?.enabled ? prevEnv.fog.density ?? 0.03 : curFogDen;
  const effFogDen = isMorphing ? prevFogDen + (curFogDen - prevFogDen) * m : curFogDen;
  if (effFogDen > 0.002) {
    const curFogCol = env.fog?.color ?? env.fogColor;
    const prevFogCol = prevEnv?.fog?.color ?? prevEnv?.fogColor ?? curFogCol;
    const fogGrad = ctx.createLinearGradient(0, height * 0.45, 0, height);
    fogGrad.addColorStop(0, "rgba(0,0,0,0)");
    fogGrad.addColorStop(
      1,
      isMorphing ? lerpHexColor(prevFogCol, curFogCol, m) : curFogCol
    );
    ctx.globalAlpha = clamp01(effFogDen * 14);
    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

function resolveActorModulationValue(
  source: string,
  audio: SceneAudioState,
  faderValues?: Record<string, number>,
  lfoValues?: Record<string, number>
): number {
  switch (source) {
    case "bass":
      return audio.bassEnvelope;
    case "lowMid":
      return clamp01(audio.bassEnvelope * 0.45 + audio.midEnvelope * 0.55);
    case "highMid":
      return clamp01(audio.midEnvelope * 0.55 + audio.trebleEnvelope * 0.45);
    case "treble":
      return audio.trebleEnvelope;
    case "energy":
      return clamp01((audio.bassEnvelope + audio.midEnvelope + audio.trebleEnvelope) / 2.2);
    case "kick":
      return clamp01(audio.bassEnvelope * 0.8 + audio.transientPulse * 0.55);
    case "snare":
      return clamp01(audio.midEnvelope * 0.6 + audio.transientPulse * 0.7);
    default:
      if (source.startsWith("lfo_") && lfoValues) {
        return clamp01(lfoValues[source] ?? 0.5);
      }
      if (source.startsWith("fader_") && faderValues) {
        return clamp01(faderValues[source] ?? 0);
      }
      return 0;
  }
}

/**
 * COUCHE 2 v4/v5/v6 — Acteurs Organiques, Hybrides, Cartoon 1930 & Morphing Inter-Scènes (`actors[]`).
 */
function renderV4Actors(
  ctx: CanvasRenderingContext2D,
  scene: Anarchy3DScene,
  audio: SceneAudioState,
  timeSeconds: number,
  width: number,
  height: number,
  seed: number,
  reducedMotion: boolean,
  camOff: PerspectiveOffsets,
  faderValues?: Record<string, number>,
  beatPhase = 0,
  prevScene?: Anarchy3DScene,
  morphAlpha = 1,
  sceneProgress = 0,
  lfoValues?: Record<string, number>
): void {
  const actors = scene.actors;
  if (!actors || actors.length === 0) return;

  const isMorphing = Boolean(prevScene && morphAlpha < 0.999);
  const mAlpha = clamp01(morphAlpha);

  const cp = scene.cartoonPhysics;
  const fb = cp?.faderBindings;
  let steppedFps: number = cp?.steppedFps ?? 60;
  if (fb?.steppedFps && faderValues) {
    const fv = clamp01(faderValues[fb.steppedFps] ?? 0.5);
    steppedFps = fv < 0.34 ? 12 : fv < 0.68 ? 24 : 60;
  }
  const autoFps = resolveAutomationOverride(
    scene.automations,
    "steppedFps",
    undefined,
    sceneProgress
  );
  if (autoFps !== undefined) {
    steppedFps = autoFps < 18 ? 12 : autoFps < 40 ? 24 : 60;
  }
  const rawT = reducedMotion ? 0 : timeSeconds;
  const t = steppedFps < 60 ? Math.floor(rawT * steppedFps) / steppedFps : rawT;
  const boilTick = Math.floor(rawT * Math.min(24, steppedFps));
  const globalBoil =
    (cp?.lineBoil ?? 0) +
    (fb?.lineBoil
      ? resolveActorModulationValue(fb.lineBoil, audio, faderValues, lfoValues) * 1.4
      : 0);
  const globalParallaxMul =
    1 +
    (fb?.parallaxSpeed
      ? resolveActorModulationValue(fb.parallaxSpeed, audio, faderValues, lfoValues) * 1.8
      : 0);
  const squashTriggerVal = resolveActorModulationValue(
    cp?.squashTrigger ?? "bass",
    audio,
    faderValues,
    lfoValues
  );
  const globalSquashAmt =
    (cp?.squashStretch ?? 0) +
    (fb?.squashStretch
      ? resolveActorModulationValue(fb.squashStretch, audio, faderValues, lfoValues) * 0.9
      : 0);

  const boilOffset = (salt: number, amt: number): number => {
    if (amt <= 0.01 || reducedMotion) return 0;
    return Math.sin(boilTick * 12.9898 + salt * 78.233) * amt * 1.8;
  };

  const light = getStudioLightConfig(scene.environment.lightingPreset);

  ctx.save();
  ctx.imageSmoothingEnabled = true;

  for (let aIdx = 0; aIdx < actors.length; aIdx++) {
    const actor = actors[aIdx];
    const prevActor =
      isMorphing && actor.id
        ? prevScene?.actors?.find((pa) => pa.id === actor.id)
        : undefined;

    const extractScale = (a: Anarchy3DActor): number =>
      typeof a.scale === "number"
        ? a.scale
        : Array.isArray(a.scale)
        ? (a.scale[0] + a.scale[1] + a.scale[2]) / 3
        : 1.0;

    const curBaseScale = extractScale(actor);
    const prevBaseScale = prevActor ? extractScale(prevActor) : curBaseScale;
    const baseScale = prevActor
      ? prevBaseScale + (curBaseScale - prevBaseScale) * mAlpha
      : curBaseScale;

    let modScale =
      resolveAutomationOverride(scene.automations, "scale", actor.id, sceneProgress) ??
      baseScale;
    let modNoise =
      resolveAutomationOverride(
        scene.automations,
        "noiseStrength",
        actor.id,
        sceneProgress
      ) ??
      (prevActor
        ? (prevActor.noiseStrength ?? 0.6) +
          ((actor.noiseStrength ?? 0.6) - (prevActor.noiseStrength ?? 0.6)) * mAlpha
        : actor.noiseStrength ?? 0.6);
    let modRotSpeed =
      resolveAutomationOverride(
        scene.automations,
        "rotationSpeed",
        actor.id,
        sceneProgress
      ) ?? (actor.speed ?? 1.0);
    let modEmissive =
      resolveAutomationOverride(
        scene.automations,
        "emissiveIntensity",
        actor.id,
        sceneProgress
      ) ?? 0.7;
    const curPosY = actor.position?.[1] ?? 0;
    const prevPosY = prevActor?.position?.[1] ?? curPosY;
    let modPosY =
      resolveAutomationOverride(
        scene.automations,
        "positionY",
        actor.id,
        sceneProgress
      ) ?? (prevActor ? prevPosY + (curPosY - prevPosY) * mAlpha : curPosY);
    let modSquash =
      (resolveAutomationOverride(
        scene.automations,
        "squashStretch",
        actor.id,
        sceneProgress
      ) ?? globalSquashAmt) * squashTriggerVal;
    let modBoil =
      resolveAutomationOverride(
        scene.automations,
        "lineBoil",
        actor.id,
        sceneProgress
      ) ?? globalBoil;
    let modParallaxSpeed =
      resolveAutomationOverride(
        scene.automations,
        "parallaxSpeed",
        actor.id,
        sceneProgress
      ) ?? globalParallaxMul;

    if (actor.audioModulation) {
      for (const m of actor.audioModulation) {
        const v =
          resolveActorModulationValue(m.source, audio, faderValues, lfoValues) *
            m.amount +
          (m.offset ?? 0);
        if (m.target === "scale") modScale = Math.max(0.15, modScale + v);
        else if (m.target === "noiseStrength") modNoise = Math.max(0, modNoise + v);
        else if (m.target === "rotationSpeed") modRotSpeed += v;
        else if (m.target === "emissiveIntensity") modEmissive = clamp01(modEmissive + v);
        else if (m.target === "positionY") modPosY += v;
        else if (m.target === "squashStretch") modSquash = Math.max(0, modSquash + v);
        else if (m.target === "lineBoil") modBoil = Math.max(0, modBoil + v);
        else if (m.target === "parallaxSpeed") modParallaxSpeed = Math.max(0.1, modParallaxSpeed + v);
      }
    }
    // Conservation du volume Squash & Stretch : sx * sy = 1
    const sqWave = Math.sin(t * 7.5 + aIdx) * 0.15 + 0.85;
    const squashFactor = clamp01(modSquash * 0.45) * sqWave;
    const squashX = 1 + squashFactor * 0.42;
    const squashY = 1 / Math.max(0.55, squashX);

    const curPosX = actor.position?.[0] ?? 0;
    const prevPosX = prevActor?.position?.[0] ?? curPosX;
    const posX = prevActor ? prevPosX + (curPosX - prevPosX) * mAlpha : curPosX;
    const curPosZ = Math.max(1.8, actor.position?.[2] ?? 5.0);
    const prevPosZ = Math.max(1.8, prevActor?.position?.[2] ?? curPosZ);
    const posZ = prevActor ? prevPosZ + (curPosZ - prevPosZ) * mAlpha : curPosZ;
    const depthScale = 5.0 / posZ;
    const cx = width * 0.5 + (posX - camOff.yawRad * 1.4) * (width * 0.16) * depthScale;
    const cy = height * 0.5 - (modPosY - camOff.pitchRad * 1.1) * (height * 0.22) * depthScale;
    const rawCol1 = actor.color ?? "#38BDF8";
    const rawCol2 = actor.secondaryColor ?? "#F472B6";
    const col1 = prevActor
      ? lerpHexColor(prevActor.color ?? rawCol1, rawCol1, mAlpha)
      : rawCol1;
    const col2 = prevActor
      ? lerpHexColor(prevActor.secondaryColor ?? rawCol2, rawCol2, mAlpha)
      : rawCol2;
    const mat = actor.material ?? "chrome";

    // MORPHING GÉOMÉTRIQUE (Vertex Lerp) : organic_blob <-> rubber_hose_mesh (ou organic_blob <-> organic_blob)
    if (
      actor.type === "organic_blob" ||
      (prevActor &&
        prevActor.type === "organic_blob" &&
        actor.type === "rubber_hose_mesh" &&
        mAlpha < 0.72)
    ) {
      const baseR = Math.min(width, height) * 0.24 * modScale * depthScale;
      ctx.save();
      ctx.translate(cx + boilOffset(aIdx * 5, modBoil), cy + boilOffset(aIdx * 9, modBoil));
      ctx.scale(squashX, squashY);
      ctx.beginPath();
      for (let i = 0; i <= MORPH_VERTEX_STEPS; i++) {
        const ang = MORPH_UNIT_ANGLES[i];
        const rCur = sampleActorContourRadius(
          actor,
          ang,
          baseR,
          t,
          modRotSpeed,
          modNoise,
          aIdx
        );
        const rPrev = prevActor
          ? sampleActorContourRadius(
              prevActor,
              ang,
              baseR,
              t,
              prevActor.speed ?? modRotSpeed,
              prevActor.noiseStrength ?? modNoise,
              aIdx
            )
          : rCur;
        const r = prevActor ? rPrev + (rCur - rPrev) * mAlpha : rCur;
        const px = Math.cos(ang) * r;
        const py = Math.sin(ang) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      const hlX = light.lightDirX * baseR * 0.55;
      const hlY = light.lightDirY * baseR * 0.55;
      const grad = ctx.createRadialGradient(hlX, hlY, baseR * 0.06, 0, 0, baseR * 1.25);
      if (mat === "chrome" && (!prevActor || mAlpha > 0.35 || prevActor.material === "chrome")) {
        grad.addColorStop(0, "#FFFFFF");
        grad.addColorStop(0.28, col1);
        grad.addColorStop(0.62, lerpHexColor(col2, "#0F172A", 0.55));
        grad.addColorStop(0.88, col2);
        grad.addColorStop(1, "#020617");
      } else if (mat === "frosted_glass") {
        ctx.globalAlpha = 0.72;
        grad.addColorStop(0, "#FFFFFF");
        grad.addColorStop(0.45, col1);
        grad.addColorStop(1, col2);
      } else if (mat === "emissive_neon") {
        grad.addColorStop(0, "#FFFFFF");
        grad.addColorStop(0.4, col1);
        grad.addColorStop(1, col2);
      } else {
        grad.addColorStop(0, lerpHexColor(col1, light.keyColor, 0.45));
        grad.addColorStop(0.65, col1);
        grad.addColorStop(1, lerpHexColor(col2, "#09090B", 0.65));
      }

      ctx.fillStyle = grad;
      ctx.fill();

      // Reflet spéculaire interne liquide (Blender studio sheen)
      if (mat === "chrome" || mat === "frosted_glass") {
        ctx.globalAlpha = mat === "chrome" ? 0.55 : 0.32;
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(
          hlX,
          hlY,
          Math.max(4, baseR * 0.34),
          Math.max(2, baseR * 0.16),
          -0.45,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = "rgba(255,255,255,0.45)";
        ctx.fill();
      }

      // Apparition progressive du contour d'encre noir et des Pie-Eyes lors du morphing vers rubber_hose_mesh
      const targetInk =
        actor.type === "rubber_hose_mesh" || mat === "toon_cel_outline"
          ? actor.inkThickness ?? 3.6
          : prevActor?.type === "rubber_hose_mesh"
          ? (prevActor.inkThickness ?? 3.6) * (1 - mAlpha)
          : 0;
      if (targetInk > 0.2) {
        ctx.globalAlpha =
          actor.type === "rubber_hose_mesh" ? clamp01(mAlpha * 1.25) : 1;
        ctx.strokeStyle = "#09090B";
        ctx.lineWidth = targetInk;
        ctx.stroke();
      } else if (mat === "emissive_neon") {
        ctx.globalAlpha = 0.65 * modEmissive;
        ctx.strokeStyle = col2;
        ctx.lineWidth = 2.2;
        ctx.stroke();
      }

      // Morphing progressif des yeux Pie-Eyes quand organic_blob devient rubber_hose_mesh
      if (actor.type === "rubber_hose_mesh" && mAlpha > 0.22) {
        const eyeAlpha = clamp01((mAlpha - 0.22) / 0.5);
        ctx.globalAlpha = eyeAlpha;
        ctx.fillStyle = "#FFFBEB";
        ctx.strokeStyle = "#09090B";
        ctx.lineWidth = Math.max(2, targetInk * 0.8);
        ctx.beginPath();
        ctx.ellipse(-baseR * 0.28, -baseR * 0.16, baseR * 0.2, baseR * 0.28 * eyeAlpha, 0, 0, Math.PI * 2);
        ctx.ellipse(baseR * 0.28, -baseR * 0.16, baseR * 0.2, baseR * 0.28 * eyeAlpha, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#09090B";
        ctx.beginPath();
        ctx.arc(-baseR * 0.24, -baseR * 0.16, baseR * 0.11 * eyeAlpha, 0.2 * Math.PI, 1.82 * Math.PI);
        ctx.arc(baseR * 0.24, -baseR * 0.16, baseR * 0.11 * eyeAlpha, 0.2 * Math.PI, 1.82 * Math.PI);
        ctx.fill();
      }
      ctx.restore();
    } else if (actor.type === "wave_terrain") {
      const layers = Math.max(6, Math.min(18, Math.round((actor.detail ?? 16) * 0.65)));
      const freq = actor.noiseFrequency ?? 1.2;
      ctx.save();
      for (let l = 0; l < layers; l++) {
        const frac = l / Math.max(1, layers - 1);
        const yBase = height * (0.48 + frac * 0.48) - modPosY * 18;
        const amp = (14 + frac * 26) * modScale * (0.5 + modNoise * 0.65);
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 6) {
          const nx = (x / width) * 3.8 * freq;
          const n = fbmNoise3D(nx, frac * 2.2 + t * modRotSpeed * 0.45, t * 0.3 + l * 0.4);
          const y = yBase + n * amp;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();

        const layerColor = lerpHexColor(col2, col1, frac);
        ctx.fillStyle = lerpHexColor(layerColor, "#09090B", (1 - frac) * 0.45);
        ctx.globalAlpha = 0.32 + frac * 0.62;
        ctx.fill();
        ctx.strokeStyle = lerpHexColor(layerColor, light.keyColor, 0.45);
        ctx.lineWidth = mat === "toon_cel_outline" ? 2.0 : 1.0;
        ctx.globalAlpha = 0.55 + frac * 0.4;
        ctx.stroke();
      }
      ctx.restore();
    } else if (actor.type === "spline_ribbons") {
      const ribbons = Math.max(2, Math.min(14, actor.ribbonCount ?? 6));
      const thickness = Math.max(0.8, Math.min(6, actor.thickness ?? 2.2));
      ctx.save();
      ctx.lineCap = "round";
      for (let r = 0; r < ribbons; r++) {
        const rf = r / Math.max(1, ribbons - 1);
        const rCol = lerpHexColor(col1, col2, rf);
        ctx.strokeStyle = rCol;
        ctx.lineWidth = thickness * (0.7 + audio.trebleEnvelope * 0.6);
        ctx.globalAlpha = clamp01(0.45 + modEmissive * 0.5);
        ctx.beginPath();
        const segs = 28;
        for (let s = 0; s <= segs; s++) {
          const u = s / segs;
          const ang = u * Math.PI * 2 + t * modRotSpeed * (0.55 + rf * 0.5) + r * 0.85;
          const radX = width * (0.22 + rf * 0.22) * modScale * depthScale;
          const radY = height * (0.14 + Math.sin(u * Math.PI * 3 + t + r) * 0.14) * modScale * depthScale;
          const px = cx + Math.cos(ang) * radX;
          const py = cy + Math.sin(ang * 1.5 + r) * radY;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      ctx.restore();
    } else if (actor.type === "particle_swarm") {
      // MORPHING DE PARTICULES v6 : interpolation fluide entre shapeTarget précédent (ou forme solide éclatée) et shapeTarget courant
      const drawCount = Math.min(
        MORPH_SWARM_COUNT,
        Math.max(120, Math.round((actor.count ?? 3000) * 0.11))
      );
      const curShape = actor.shapeTarget;
      const prevShape: AnarchySwarmShapeTarget | undefined =
        prevActor?.type === "particle_swarm"
          ? prevActor.shapeTarget
          : prevActor
          ? "sphere"
          : undefined;
      const behavior = actor.behavior ?? "curl_noise_flow";
      const prevBehavior = prevActor?.behavior ?? behavior;

      ctx.save();
      for (let i = 0; i < drawCount; i++) {
        const [tx, ty] = sampleParticleTargetPos(
          i,
          curShape,
          behavior,
          cx,
          cy,
          width,
          height,
          t,
          modRotSpeed,
          modScale
        );
        let px = tx;
        let py = ty;
        if (prevActor && mAlpha < 0.999) {
          const [sx, sy] = sampleParticleTargetPos(
            i,
            prevShape,
            prevBehavior,
            cx,
            cy,
            width,
            height,
            t,
            prevActor.speed ?? modRotSpeed,
            prevBaseScale
          );
          px = sx + (tx - sx) * mAlpha;
          py = sy + (ty - sy) * mAlpha;
        }
        const r2 = MORPH_SWARM_SEEDS[i * 3 + 2];
        const sz = (0.85 + r2 * 2.3) * (behavior === "floating_dust" ? 0.9 : 1.15);
        ctx.globalAlpha = clamp01((0.32 + r2 * 0.65) * (0.65 + modEmissive * 0.45));
        ctx.fillStyle = i % 3 === 0 ? col2 : col1;
        ctx.beginPath();
        ctx.arc(px, py, sz, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (actor.type === "glb_model") {
      // Rendu procédural de sculpture/totem 3D haute lisibilité avec surcharge matériau (chrome, glass, clay, toon_cel_outline, neon)
      const r = Math.min(width, height) * 0.22 * modScale * depthScale;
      const rot = t * modRotSpeed * 0.9;
      ctx.save();
      ctx.translate(cx, cy);
      const facets = 6;
      for (let f = 0; f < facets; f++) {
        const a0 = rot + (f / facets) * Math.PI * 2;
        const a1 = rot + ((f + 1) / facets) * Math.PI * 2;
        const x0 = Math.cos(a0) * r;
        const x1 = Math.cos(a1) * r;
        const zAvg = (Math.sin(a0) + Math.sin(a1)) * 0.5;
        if (zAvg < -0.15) continue;
        const shade = clamp01(0.35 + zAvg * 0.65);
        ctx.beginPath();
        ctx.moveTo(0, -r * 1.15);
        ctx.lineTo(x0, -r * 0.15);
        ctx.lineTo(x1, -r * 0.15);
        ctx.closePath();
        ctx.fillStyle =
          mat === "chrome"
            ? lerpHexColor("#0F172A", "#FFFFFF", shade)
            : mat === "toon_cel_outline"
            ? shade > 0.62
              ? col1
              : col2
            : lerpHexColor(col2, col1, shade);
        ctx.globalAlpha = mat === "frosted_glass" ? 0.68 : 0.95;
        ctx.fill();
        if (mat === "toon_cel_outline" || mat === "emissive_neon") {
          ctx.strokeStyle = mat === "toon_cel_outline" ? "#09090B" : col2;
          ctx.lineWidth = mat === "toon_cel_outline" ? 2.4 : 1.5;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.moveTo(0, r * 1.05);
        ctx.lineTo(x0, -r * 0.15);
        ctx.lineTo(x1, -r * 0.15);
        ctx.closePath();
        ctx.fillStyle = lerpHexColor(col1, "#09090B", 0.35 + (1 - shade) * 0.4);
        ctx.fill();
        if (mat === "toon_cel_outline" || mat === "emissive_neon") {
          ctx.stroke();
        }
      }
      ctx.restore();
    } else if (actor.type === "sprite_2d") {
      // Plan 2D parallaxe BD/cartoon dans l'espace 3D (image externe ou mascotte Open Hub à lunettes 3D)
      const parallax = actor.parallax ?? 1.0;
      const px = cx - camOff.yawRad * 26 * parallax;
      const py = cy + Math.sin(t * 2.4) * 5 * modScale;
      const s = Math.min(width, height) * 0.22 * modScale * depthScale;
      ctx.save();
      ctx.translate(px, py);

      let drewImg = false;
      if (actor.url && typeof Image !== "undefined" && !actor.url.endsWith(".glb")) {
        let img = V4_SPRITE_IMAGE_CACHE.get(actor.url);
        if (!img) {
          img = new Image();
          img.crossOrigin = "anonymous";
          img.src = actor.url;
          V4_SPRITE_IMAGE_CACHE.set(actor.url, img);
        }
        if (img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, -s, -s, s * 2, s * 2);
          drewImg = true;
        }
      }

      if (!drewImg) {
        // Illustration BD Cel-Shading Open Hub (personnage à lunettes 3D rouge/cyan)
        ctx.lineWidth = 2.6;
        ctx.strokeStyle = "#09090B";
        // Tête BD
        ctx.fillStyle = "#FFFBEB";
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.85, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Monture lunettes 3D
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(-s * 0.72, -s * 0.24, s * 1.44, s * 0.42);
        ctx.strokeRect(-s * 0.72, -s * 0.24, s * 1.44, s * 0.42);
        // Verre gauche Rouge & Verre droit Cyan
        ctx.fillStyle = col1;
        ctx.fillRect(-s * 0.62, -s * 0.16, s * 0.54, s * 0.26);
        ctx.strokeRect(-s * 0.62, -s * 0.16, s * 0.54, s * 0.26);
        ctx.fillStyle = col2;
        ctx.fillRect(s * 0.08, -s * 0.16, s * 0.54, s * 0.26);
        ctx.strokeRect(s * 0.08, -s * 0.16, s * 0.54, s * 0.26);
        // Sourire expressif réactif aux basses
        ctx.beginPath();
        ctx.arc(0, s * 0.28, s * (0.28 + audio.bassEnvelope * 0.12), 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
      }
      ctx.restore();
    } else if (actor.type === "parallax_layer") {
      // Plan 2.5D parallaxe aquarelle/gouache ou image avec défilement infini (scrollX, scrollY)
      const scrollX = (actor.scrollX ?? 0.5) * modParallaxSpeed;
      const scrollY = (actor.scrollY ?? 0) * modParallaxSpeed;
      const parallax = actor.parallax ?? 1.0;
      const offX = ((t * scrollX * 42 + camOff.yawRad * 28 * parallax) % width + width) % width;
      const offY = ((t * scrollY * 26 + camOff.pitchRad * 14 * parallax) % height + height) % height;
      const pat = actor.pattern ?? "watercolor_hills";
      const inkW = Math.max(1.5, actor.inkThickness ?? 2.4);

      ctx.save();
      if ((actor.depthBlur ?? 0) > 0.05) {
        ctx.globalAlpha = clamp01(1 - (actor.depthBlur ?? 0) * 0.35);
      }

      if (actor.url && typeof Image !== "undefined" && !actor.url.endsWith(".glb")) {
        let img = V4_SPRITE_IMAGE_CACHE.get(actor.url);
        if (!img) {
          img = new Image();
          img.crossOrigin = "anonymous";
          img.src = actor.url;
          V4_SPRITE_IMAGE_CACHE.set(actor.url, img);
        }
        if (img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, -offX, -offY, width, height);
          ctx.drawImage(img, width - offX, -offY, width, height);
        }
      } else if (pat === "stage_curtains") {
        // Rideaux de théâtre 1930 drapés gauche/droite + cantonnière dorée
        const sw = width * 0.18;
        ctx.fillStyle = col1;
        ctx.strokeStyle = "#120E0B";
        ctx.lineWidth = inkW;
        // Gauche
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(sw + boilOffset(1, modBoil), 0);
        ctx.quadraticCurveTo(sw * 0.65, height * 0.5, sw * 1.15, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Droite
        ctx.beginPath();
        ctx.moveTo(width, 0);
        ctx.lineTo(width - sw + boilOffset(2, modBoil), 0);
        ctx.quadraticCurveTo(width - sw * 0.65, height * 0.5, width - sw * 1.15, height);
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Cantonnière haute
        ctx.fillStyle = col1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(width, 0);
        ctx.lineTo(width, 18);
        for (let i = 6; i >= 0; i--) {
          const sx = (i / 6) * width;
          const prevX = ((i + 0.5) / 6) * width;
          ctx.quadraticCurveTo(prevX, 28 + boilOffset(i + 5, modBoil), sx, 16);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Frange dorée
        ctx.strokeStyle = col2;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 17);
        ctx.lineTo(width, 17);
        ctx.stroke();
      } else if (pat === "watercolor_hills") {
        const yBase = height * 0.66 - modPosY * 18;
        ctx.fillStyle = col1;
        ctx.strokeStyle = "#120E0B";
        ctx.lineWidth = inkW * 0.85;
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 8) {
          const wx = (x + offX) * 0.02;
          const hy = yBase - Math.sin(wx) * 22 - Math.cos(wx * 2.1) * 10;
          ctx.lineTo(x, hy);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = col2;
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 8) {
          const wx = (x + offX * 1.5) * 0.028 + 2.1;
          const hy = yBase + 16 - Math.sin(wx) * 15;
          ctx.lineTo(x, hy);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (pat === "checker_floor") {
        const floorY = Math.round(height * 0.72);
        const rows = 5;
        const cols = 10;
        const tileW = width / cols;
        ctx.strokeStyle = "#120E0B";
        ctx.lineWidth = 1.2;
        for (let r = 0; r < rows; r++) {
          const y0 = floorY + (r / rows) * (height - floorY);
          const y1 = floorY + ((r + 1) / rows) * (height - floorY);
          const shift = ((offX * (1 + r * 0.35)) % (tileW * 2));
          for (let c = -2; c <= cols + 2; c++) {
            const x0 = c * tileW - shift;
            ctx.fillStyle = (r + c) % 2 === 0 ? col1 : col2;
            ctx.fillRect(x0, y0, tileW + 1, y1 - y0 + 1);
          }
        }
        ctx.beginPath();
        ctx.moveTo(0, floorY);
        ctx.lineTo(width, floorY);
        ctx.stroke();
      } else if (pat === "city_silhouette") {
        const baseY = height * 0.78;
        ctx.fillStyle = col1;
        ctx.strokeStyle = "#09090B";
        ctx.lineWidth = inkW * 0.8;
        const bCount = 12;
        const bw = width / bCount;
        for (let i = -1; i <= bCount + 1; i++) {
          const bx = i * bw - (offX % bw);
          const h = 30 + ((Math.abs(i * 37 + seed) % 5) * 14);
          ctx.fillRect(bx, baseY - h, bw - 2, h + height * 0.25);
          ctx.strokeRect(bx, baseY - h, bw - 2, h + height * 0.25);
          ctx.fillStyle = col2;
          ctx.fillRect(bx + 5, baseY - h + 6, 4, 5);
          ctx.fillRect(bx + bw - 12, baseY - h + 14, 4, 5);
          ctx.fillStyle = col1;
        }
      } else if (pat === "clouds_band") {
        const cyCloud = height * 0.26;
        ctx.fillStyle = col1;
        ctx.strokeStyle = "#120E0B";
        ctx.lineWidth = inkW * 0.8;
        for (let i = -1; i < 6; i++) {
          const clx = ((i * 78 - offX) % (width + 90) + (width + 90)) % (width + 90) - 45;
          const cly = cyCloud + (i % 2) * 14;
          ctx.beginPath();
          ctx.arc(clx, cly, 16, 0, Math.PI * 2);
          ctx.arc(clx + 15, cly - 5, 19, 0, Math.PI * 2);
          ctx.arc(clx + 31, cly, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      } else if (pat === "psyche_rings") {
        const rings = 9;
        for (let r = rings; r >= 1; r--) {
          const rad = ((r * 26 + offX * 0.7) % (width * 0.75)) + 8;
          ctx.beginPath();
          ctx.arc(width * 0.5, height * 0.5, rad, 0, Math.PI * 2);
          ctx.fillStyle = r % 2 === 0 ? col1 : col2;
          ctx.globalAlpha = 0.24;
          ctx.fill();
          ctx.globalAlpha = 0.85;
          ctx.strokeStyle = "#09090B";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
      ctx.restore();
    } else if (actor.type === "cartoon_sprite") {
      // Spritesheet framesX x framesY au BPM ou danseur Rubber-Hose 1930 intégré
      const fx = Math.max(1, actor.framesX ?? 4);
      const fy = Math.max(1, actor.framesY ?? 1);
      const totalFrames = fx * fy;
      const frameIdx = actor.bpmSync !== false
        ? Math.floor(beatPhase * totalFrames + t * 2) % totalFrames
        : Math.floor(t * 12) % totalFrames;
      const s = Math.min(width, height) * 0.24 * modScale * depthScale;
      const inkW = Math.max(1.8, actor.inkThickness ?? 3.0);

      ctx.save();
      ctx.translate(cx + boilOffset(aIdx * 7, modBoil), cy + boilOffset(aIdx * 11, modBoil));
      ctx.scale(squashX, squashY);

      let drewSheet = false;
      if (actor.url && typeof Image !== "undefined" && !actor.url.endsWith(".glb")) {
        let img = V4_SPRITE_IMAGE_CACHE.get(actor.url);
        if (!img) {
          img = new Image();
          img.crossOrigin = "anonymous";
          img.src = actor.url;
          V4_SPRITE_IMAGE_CACHE.set(actor.url, img);
        }
        if (img.complete && img.naturalWidth > 0) {
          const fw = img.naturalWidth / fx;
          const fh = img.naturalHeight / fy;
          const col = frameIdx % fx;
          const row = Math.floor(frameIdx / fx);
          ctx.drawImage(img, col * fw, row * fh, fw, fh, -s, -s, s * 2, s * 2);
          if (actor.inkOutline !== false) {
            ctx.strokeStyle = "#09090B";
            ctx.lineWidth = inkW;
            ctx.strokeRect(-s, -s, s * 2, s * 2);
          }
          drewSheet = true;
        }
      }

      if (!drewSheet) {
        // Personnage Cartoon 1930 Rubber-Hose animé au tempo BPM
        const danceSwing = Math.sin(frameIdx * ((Math.PI * 2) / Math.max(2, totalFrames))) * 0.45;
        ctx.strokeStyle = "#09090B";
        ctx.lineWidth = inkW;
        ctx.lineCap = "round";
        // Jambes rubber-hose courbées
        ctx.beginPath();
        ctx.moveTo(-s * 0.22, s * 0.35);
        ctx.quadraticCurveTo(-s * 0.38, s * 0.65, -s * 0.26 + danceSwing * 14, s * 0.92);
        ctx.moveTo(s * 0.22, s * 0.35);
        ctx.quadraticCurveTo(s * 0.38, s * 0.65, s * 0.26 - danceSwing * 14, s * 0.92);
        ctx.stroke();
        // Chaussures rétro jaunes
        ctx.fillStyle = col2;
        ctx.beginPath();
        ctx.ellipse(-s * 0.28 + danceSwing * 14, s * 0.95, s * 0.22, s * 0.12, 0, 0, Math.PI * 2);
        ctx.ellipse(s * 0.28 - danceSwing * 14, s * 0.95, s * 0.22, s * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Bras rubber-hose + gants blancs
        ctx.beginPath();
        ctx.moveTo(-s * 0.45, s * 0.05);
        ctx.quadraticCurveTo(-s * 0.9, -s * 0.15 + danceSwing * 22, -s * 0.98, -s * 0.45);
        ctx.moveTo(s * 0.45, s * 0.05);
        ctx.quadraticCurveTo(s * 0.9, -s * 0.15 - danceSwing * 22, s * 0.98, -s * 0.45);
        ctx.stroke();
        ctx.fillStyle = "#FFFBEB";
        ctx.beginPath();
        ctx.arc(-s * 0.98, -s * 0.45, s * 0.16, 0, Math.PI * 2);
        ctx.arc(s * 0.98, -s * 0.45, s * 0.16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Corps / Tête tasse 1930
        ctx.fillStyle = col1;
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.56, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Yeux Pie-Eyes blancs + encoche camembert
        ctx.fillStyle = "#FFFBEB";
        ctx.beginPath();
        ctx.ellipse(-s * 0.18, -s * 0.12, s * 0.16, s * 0.22, 0, 0, Math.PI * 2);
        ctx.ellipse(s * 0.18, -s * 0.12, s * 0.16, s * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#09090B";
        ctx.beginPath();
        ctx.moveTo(-s * 0.14, -s * 0.12);
        ctx.arc(-s * 0.14, -s * 0.12, s * 0.09, 0.25 * Math.PI, 1.85 * Math.PI);
        ctx.closePath();
        ctx.moveTo(s * 0.14, -s * 0.12);
        ctx.arc(s * 0.14, -s * 0.12, s * 0.09, 0.25 * Math.PI, 1.85 * Math.PI);
        ctx.closePath();
        ctx.fill();
        // Large sourire 1930
        ctx.beginPath();
        ctx.arc(0, s * 0.16, s * 0.26, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
      }
      ctx.restore();
    } else if (actor.type === "rubber_hose_mesh") {
      // Formes Cartoon 1930 / Cuphead en Cel-Shading plat + contour noir épais + line boil
      const shape = actor.shape ?? "boss_character";
      const s = Math.min(width, height) * 0.25 * modScale * depthScale;
      const inkW = Math.max(2.0, actor.inkThickness ?? 3.6);
      const bx = boilOffset(aIdx * 13 + 1, modBoil);
      const by = boilOffset(aIdx * 17 + 2, modBoil);

      ctx.save();
      ctx.translate(cx + bx, cy + by);
      ctx.scale(squashX, squashY);
      ctx.strokeStyle = "#09090B";
      ctx.lineWidth = inkW;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (shape === "boss_character") {
        // Boss 1930 rebondissant (corps rond, cornes/couronne, pie-eyes, sourire large)
        ctx.fillStyle = col2;
        ctx.beginPath();
        ctx.moveTo(-s * 0.45, -s * 0.65);
        ctx.lineTo(-s * 0.62, -s * 1.15);
        ctx.lineTo(-s * 0.18, -s * 0.82);
        ctx.lineTo(0, -s * 1.2);
        ctx.lineTo(s * 0.18, -s * 0.82);
        ctx.lineTo(s * 0.62, -s * 1.15);
        ctx.lineTo(s * 0.45, -s * 0.65);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = col1;
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.88, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Pie-eyes expressifs
        ctx.fillStyle = "#FFFBEB";
        ctx.beginPath();
        ctx.ellipse(-s * 0.28, -s * 0.18, s * 0.22, s * 0.3, 0, 0, Math.PI * 2);
        ctx.ellipse(s * 0.28, -s * 0.18, s * 0.22, s * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#09090B";
        const look = Math.sin(t * modRotSpeed * 2.2) * s * 0.06;
        ctx.beginPath();
        ctx.moveTo(-s * 0.24 + look, -s * 0.18);
        ctx.arc(-s * 0.24 + look, -s * 0.18, s * 0.12, 0.2 * Math.PI, 1.82 * Math.PI);
        ctx.closePath();
        ctx.moveTo(s * 0.24 + look, -s * 0.18);
        ctx.arc(s * 0.24 + look, -s * 0.18, s * 0.12, 0.2 * Math.PI, 1.82 * Math.PI);
        ctx.closePath();
        ctx.fill();

        // Bouche cartoon ouverte aux dents blanches
        ctx.fillStyle = "#FFFBEB";
        ctx.beginPath();
        ctx.arc(0, s * 0.24, s * 0.42, 0.05 * Math.PI, 0.95 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (shape === "hose_arms") {
        // Bras / tuyaux rubber-hose sinusoïdaux avec gants blancs
        const wave = Math.sin(t * modRotSpeed * 3.4) * s * 0.45;
        ctx.lineWidth = Math.max(4, inkW * 2.1);
        ctx.strokeStyle = col1;
        ctx.beginPath();
        ctx.moveTo(-s * 0.72, 0);
        ctx.bezierCurveTo(-s * 1.15, -wave, -s * 1.35, wave, -s * 1.62, -s * 0.25 + wave * 0.5);
        ctx.moveTo(s * 0.72, 0);
        ctx.bezierCurveTo(s * 1.15, wave, s * 1.35, -wave, s * 1.62, -s * 0.25 - wave * 0.5);
        ctx.stroke();

        ctx.lineWidth = inkW;
        ctx.strokeStyle = "#09090B";
        ctx.fillStyle = col2;
        ctx.beginPath();
        ctx.arc(-s * 1.62, -s * 0.25 + wave * 0.5, s * 0.24, 0, Math.PI * 2);
        ctx.arc(s * 1.62, -s * 0.25 - wave * 0.5, s * 0.24, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (shape === "pie_eyes") {
        // Paire d'yeux "Pie-Eyes" géants flottants
        const blink = Math.abs(Math.sin(t * modRotSpeed * 1.5)) < 0.08 ? 0.15 : 1;
        ctx.scale(1, blink);
        ctx.fillStyle = col1;
        ctx.beginPath();
        ctx.ellipse(-s * 0.48, 0, s * 0.44, s * 0.62, 0, 0, Math.PI * 2);
        ctx.ellipse(s * 0.48, 0, s * 0.44, s * 0.62, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = col2;
        const rotEye = t * modRotSpeed * 1.8;
        ctx.beginPath();
        ctx.moveTo(-s * 0.4, 0);
        ctx.arc(-s * 0.4, 0, s * 0.24, rotEye, rotEye + Math.PI * 1.62);
        ctx.closePath();
        ctx.moveTo(s * 0.4, 0);
        ctx.arc(s * 0.4, 0, s * 0.24, -rotEye, -rotEye + Math.PI * 1.62);
        ctx.closePath();
        ctx.fill();
      } else if (shape === "vintage_wheel") {
        // Roue / engrenage cartoon tournant au tempo steppedFps
        ctx.rotate(t * modRotSpeed * 1.1);
        ctx.fillStyle = col1;
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.92, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * s * 0.9, Math.sin(a) * s * 0.9);
          ctx.stroke();
        }
        ctx.fillStyle = col2;
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.28, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (shape === "music_notes") {
        for (let n = -1; n <= 1; n++) {
          const nx = n * s * 0.95;
          const ny = Math.sin(t * modRotSpeed * 3.2 + n * 1.4) * s * 0.28;
          ctx.fillStyle = n === 0 ? col2 : col1;
          ctx.beginPath();
          ctx.ellipse(nx, ny, s * 0.16, s * 0.11, -0.35, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(nx + s * 0.12, ny);
          ctx.lineTo(nx + s * 0.12, ny - s * 0.55);
          ctx.quadraticCurveTo(nx + s * 0.38, ny - s * 0.5, nx + s * 0.34, ny - s * 0.28);
          ctx.stroke();
        }
      } else if (shape === "fluffy_clouds") {
        ctx.fillStyle = col1;
        ctx.beginPath();
        ctx.arc(-s * 0.45, 0, s * 0.36, 0, Math.PI * 2);
        ctx.arc(0, -s * 0.18, s * 0.48, 0, Math.PI * 2);
        ctx.arc(s * 0.48, 0, s * 0.36, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (shape === "psyche_tunnel") {
        const rings = 7;
        for (let r = rings; r >= 1; r--) {
          const frac = ((r / rings) + (t * modRotSpeed * 0.28)) % 1;
          const rad = (0.18 + frac * 1.45) * s;
          ctx.beginPath();
          ctx.arc(
            Math.sin(t * 2 + r) * 8,
            Math.cos(t * 1.7 + r) * 6,
            rad,
            0,
            Math.PI * 2
          );
          ctx.strokeStyle = "#09090B";
          ctx.lineWidth = inkW + 1.5;
          ctx.stroke();
          ctx.strokeStyle = r % 2 === 0 ? col1 : col2;
          ctx.lineWidth = inkW * 0.7;
          ctx.stroke();
        }
      } else {
        // theater_curtains fallback shape
        ctx.fillStyle = col1;
        ctx.fillRect(-s, -s, s * 2, s * 0.4);
        ctx.strokeRect(-s, -s, s * 2, s * 0.4);
      }

      ctx.restore();
    }
  }

  ctx.restore();
}

/**
 * COUCHE 3 v4 — Pile Post-Processing optionnelle & cumulable (`postFX[]`), Tone Mapping & Transitions.
 */
function applyV4PostFxStack(
  ctx: CanvasRenderingContext2D,
  postFX: readonly Anarchy3DPostFxStep[] | undefined,
  toneMapping: AnarchyToneMapping | undefined,
  audio: SceneAudioState,
  timeSeconds: number,
  width: number,
  height: number,
  transitionType?: AnarchySceneTransitionType,
  transitionProgress?: number,
  cartoonPhysics?: Anarchy3DCartoonPhysics,
  faderValues?: Record<string, number>,
  prevPostFX?: readonly Anarchy3DPostFxStep[],
  morphAlpha: number = 1
): void {
  const filmTick = Math.floor(timeSeconds * (cartoonPhysics?.steppedFps ?? 24));
  const faderGrainBoost =
    cartoonPhysics?.faderBindings?.filmGrain
      ? resolveActorModulationValue(
          cartoonPhysics.faderBindings.filmGrain,
          audio,
          faderValues
        ) * 0.65
      : 0;

  // Fusion inter-scènes de la pile postFX pendant le morphing v6
  const effectiveSteps: Anarchy3DPostFxStep[] = [];
  if (prevPostFX && prevPostFX.length > 0 && morphAlpha < 0.999) {
    const curTypes = new Set((postFX ?? []).map((s) => s.type));
    for (const ps of prevPostFX) {
      if (!curTypes.has(ps.type)) {
        effectiveSteps.push({
          ...ps,
          intensity: (ps.intensity ?? 0.85) * (1 - morphAlpha),
        });
      }
    }
  }
  if (postFX && postFX.length > 0) {
    for (const cs of postFX) {
      const prevMatch =
        prevPostFX && morphAlpha < 0.999
          ? prevPostFX.find((p) => p.type === cs.type)
          : undefined;
      const curInt = cs.intensity ?? 0.85;
      const blendedInt = prevMatch
        ? (prevMatch.intensity ?? 0.85) +
          (curInt - (prevMatch.intensity ?? 0.85)) * morphAlpha
        : prevPostFX && morphAlpha < 0.999
        ? curInt * morphAlpha
        : curInt;
      effectiveSteps.push({
        ...cs,
        intensity: blendedInt,
      });
    }
  }

  if (effectiveSteps.length > 0) {
    for (const step of effectiveSteps) {
      const intensity = clamp01((step.intensity ?? 0.85) * 0.5) * 2;
      if (intensity <= 0.01) continue;

      if (step.type === "bloom") {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = clamp01(intensity * (0.14 + audio.bassEnvelope * 0.1));
        ctx.drawImage(ctx.canvas, -2, -2, width + 4, height + 4);
        ctx.restore();
      } else if (step.type === "depth_of_field") {
        ctx.save();
        const rad = Math.max(width, height) * 0.65;
        const dofGrad = ctx.createRadialGradient(
          width * 0.5,
          height * 0.5,
          rad * 0.38,
          width * 0.5,
          height * 0.5,
          rad
        );
        dofGrad.addColorStop(0, "rgba(0,0,0,0)");
        dofGrad.addColorStop(1, `rgba(6,8,18,${clamp01(intensity * 0.45).toFixed(3)})`);
        ctx.fillStyle = dofGrad;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      } else if (step.type === "toon_outline") {
        // Encrage noir épais type plume + vibration inkJitter (Line Boil)
        const inkW = Math.max(1.5, step.inkThickness ?? Math.max(2, Math.round(intensity * 3)));
        const jitter = step.inkJitter ?? 0;
        const jx = jitter > 0 ? Math.sin(filmTick * 17.3) * jitter : 0;
        const jy = jitter > 0 ? Math.cos(filmTick * 23.1) * jitter : 0;
        ctx.save();
        ctx.strokeStyle = step.color ?? "#09090B";
        ctx.lineWidth = inkW;
        ctx.strokeRect(2 + jx, 2 + jy, width - 4, height - 4);
        if (jitter > 0.3) {
          ctx.globalAlpha = 0.45;
          ctx.lineWidth = Math.max(1, inkW * 0.55);
          ctx.strokeRect(3 - jx, 3 - jy, width - 6, height - 6);
        }
        ctx.restore();
      } else if (step.type === "vintage_1930_film") {
        // 1. Gate Weave (micro-tremblement mécanique du projecteur 1930)
        const weave = clamp01(step.gateWeave ?? 0.35);
        if (weave > 0.02) {
          const wx = Math.round(Math.sin(filmTick * 11.7) * weave * 2.5);
          const wy = Math.round(Math.cos(filmTick * 19.3) * weave * 2.0);
          if (wx !== 0 || wy !== 0) {
            ctx.save();
            ctx.drawImage(ctx.canvas, wx, wy);
            ctx.restore();
          }
        }

        // 2. Color Grade 1930 (technicolor_30s | sepia_warm | black_and_white_ink | none)
        const grade = step.colorGrade ?? "technicolor_30s";
        if (grade === "black_and_white_ink") {
          ctx.save();
          ctx.globalCompositeOperation = "saturation";
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, width, height);
          ctx.globalCompositeOperation = "soft-light";
          ctx.globalAlpha = 0.25;
          ctx.fillStyle = "#1C1917";
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        } else if (grade === "sepia_warm") {
          ctx.save();
          ctx.globalCompositeOperation = "color";
          ctx.globalAlpha = 0.42;
          ctx.fillStyle = "#B47B38";
          ctx.fillRect(0, 0, width, height);
          ctx.globalCompositeOperation = "soft-light";
          ctx.globalAlpha = 0.25;
          ctx.fillStyle = "#F5D08A";
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        } else if (grade === "technicolor_30s") {
          ctx.save();
          ctx.globalCompositeOperation = "soft-light";
          ctx.globalAlpha = 0.24;
          const techGrad = ctx.createLinearGradient(0, 0, width, height);
          techGrad.addColorStop(0, "#EF4444");
          techGrad.addColorStop(0.5, "#FDE68A");
          techGrad.addColorStop(1, "#06B6D4");
          ctx.fillStyle = techGrad;
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        }

        // 3. Grain argentique 35 mm animé
        const grainAmt = clamp01((step.filmGrain ?? 0.45) + faderGrainBoost);
        if (grainAmt > 0.02) {
          ctx.save();
          let gRng = ((filmTick * 1664525) ^ 0x9e3779b9) >>> 0;
          const count = Math.round(width * height * 0.022 * grainAmt);
          for (let i = 0; i < count; i++) {
            gRng = (gRng * 1664525 + 1013904223) >>> 0;
            const gx = (gRng >>> 16) % width;
            const gy = (gRng & 0xffff) % height;
            ctx.fillStyle = i % 2 === 0 ? "#FFFFFF" : "#09090B";
            ctx.globalAlpha = clamp01(grainAmt * 0.2);
            ctx.fillRect(gx, gy, 1, 1);
          }
          ctx.restore();
        }

        // 4. Rayures verticales & poussières aléatoires
        const scratchAmt = clamp01(step.scratchesAndDust ?? 0.35);
        if (scratchAmt > 0.02) {
          ctx.save();
          let sRng = ((filmTick * 22695477) ^ 0x517cc1b7) >>> 0;
          const nextS = () => {
            sRng = (sRng * 1664525 + 1013904223) >>> 0;
            return sRng / 4294967296;
          };
          const scratchCount = Math.max(1, Math.round(scratchAmt * 4));
          for (let s = 0; s < scratchCount; s++) {
            if (nextS() > 0.45) {
              const sx = Math.round(nextS() * width);
              ctx.strokeStyle = s % 2 === 0 ? "rgba(255,250,235,0.38)" : "rgba(12,10,8,0.42)";
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(sx, 0);
              ctx.lineTo(sx + (nextS() - 0.5) * 4, height);
              ctx.stroke();
            }
          }
          const dustCount = Math.round(scratchAmt * 14);
          for (let d = 0; d < dustCount; d++) {
            const dx = nextS() * width;
            const dy = nextS() * height;
            const dr = 0.7 + nextS() * 1.6;
            ctx.fillStyle = d % 2 === 0 ? "rgba(12,10,8,0.45)" : "rgba(255,250,235,0.45)";
            ctx.beginPath();
            ctx.arc(dx, dy, dr, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // 5. Vignette projecteur douce
        const vigAmt = clamp01(step.vignette ?? 0.5);
        if (vigAmt > 0.02) {
          ctx.save();
          const rad = Math.max(width, height) * 0.72;
          const vGrad = ctx.createRadialGradient(
            width * 0.5,
            height * 0.5,
            rad * 0.34,
            width * 0.5,
            height * 0.5,
            rad
          );
          vGrad.addColorStop(0, "rgba(0,0,0,0)");
          vGrad.addColorStop(1, `rgba(10,8,6,${clamp01(vigAmt * 0.72).toFixed(3)})`);
          ctx.fillStyle = vGrad;
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        }
      } else if (step.type === "chromatic_aberration") {
        const offsetPx = Math.max(1, Math.round(intensity * (2.2 + audio.transientPulse * 2.5)));
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.globalAlpha = clamp01(intensity * 0.28);
        ctx.drawImage(ctx.canvas, -offsetPx, 0, width, height);
        ctx.drawImage(ctx.canvas, offsetPx, 0, width, height);
        ctx.restore();
      } else if (step.type === "film_grain") {
        ctx.save();
        let gRng = ((Math.floor(timeSeconds * 60) * 1664525) ^ 0x517cc1b7) >>> 0;
        const count = Math.round(width * height * 0.015 * clamp01(intensity + faderGrainBoost));
        ctx.fillStyle = "#FFFFFF";
        ctx.globalAlpha = clamp01(intensity * 0.14);
        for (let i = 0; i < count; i++) {
          gRng = (gRng * 1664525 + 1013904223) >>> 0;
          const gx = (gRng >>> 16) % width;
          const gy = (gRng & 0xffff) % height;
          ctx.fillRect(gx, gy, 1, 1);
        }
        ctx.restore();
      } else if (step.type === "pixelate" && typeof document !== "undefined") {
        const factor = Math.max(2, Math.round(2 + (step.radius ?? 3) * intensity));
        const pw = Math.max(32, Math.round(width / factor));
        const ph = Math.max(18, Math.round(height / factor));
        const tmp = document.createElement("canvas");
        tmp.width = pw;
        tmp.height = ph;
        const tctx = tmp.getContext("2d");
        if (tctx) {
          tctx.imageSmoothingEnabled = false;
          tctx.drawImage(ctx.canvas, 0, 0, pw, ph);
          ctx.save();
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(tmp, 0, 0, width, height);
          ctx.restore();
        }
      }
    }
  }

  // Tone mapping cinéma léger (ACESFilmic / Cineon)
  if (toneMapping === "aces_filmic" || toneMapping === "cineon") {
    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    ctx.globalAlpha = toneMapping === "aces_filmic" ? 0.16 : 0.22;
    ctx.fillStyle = toneMapping === "aces_filmic" ? "#1E293B" : "#1C1917";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // Transitions d'entrée de scène (crossfade, flash)
  if (
    transitionType &&
    transitionType !== "cut" &&
    transitionProgress !== undefined &&
    transitionProgress < 1
  ) {
    const p = clamp01(transitionProgress);
    const inv = 1 - p;
    ctx.save();
    if (transitionType === "flash") {
      ctx.fillStyle = "#FFFFFF";
      ctx.globalAlpha = inv * 0.85;
      ctx.fillRect(0, 0, width, height);
    } else if (transitionType === "crossfade") {
      ctx.fillStyle = "#05070E";
      ctx.globalAlpha = inv * 0.65;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();
  }
}

/**
 * Passe post-FX optionnelle Open Hub : Anaglyphe 3D / Chromatic Aberration,
 * scanlines CRT, kaléidoscope et bloom émissif.
 */
function applyOpenHubPostFx(
  ctx: CanvasRenderingContext2D,
  effects: RetroEffects,
  audio: SceneAudioState,
  timeSeconds: number,
  width: number = STUDY_SIZE.width,
  height: number = STUDY_SIZE.height,
  postFx?: Anarchy3DPostFx
): void {
  const cw = ctx.canvas?.width || width;
  const ch = ctx.canvas?.height || height;
  const bloomAmt = Math.max(0, Math.min(2, postFx?.bloomIntensity ?? 0));
  if (bloomAmt > 0.2) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = clamp01((bloomAmt - 0.15) * (0.12 + audio.bassEnvelope * 0.08));
    ctx.drawImage(ctx.canvas, -1, 0, width + 2, height);
    ctx.restore();
  }

  const kaleido = postFx?.kaleidoscopeSegments ?? 0;
  if (kaleido > 0) {
    applyKaleidoscopePass(ctx, kaleido, cw, ch);
  }

  const splitNorm = clamp01(
    Math.max(effects.anaglyphSplit ?? 0, postFx?.chromaticAberration ?? 0)
  );
  if (splitNorm > 0.02) {
    const offsetPx = Math.max(
      1,
      Math.round(splitNorm * (2.5 + audio.transientPulse * 3))
    );
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = clamp01(splitNorm * 0.35);
    ctx.drawImage(ctx.canvas, -offsetPx, 0, width, height);
    ctx.drawImage(ctx.canvas, offsetPx, 0, width, height);
    ctx.restore();
  }

  const grainStrength = clamp01(
    Math.max(effects.grain, postFx?.crtScanlines ?? 0)
  );
  if (grainStrength > 0.05) {
    ctx.fillStyle = `rgba(0,0,0,${(0.08 + grainStrength * 0.16).toFixed(3)})`;
    const offset = Math.floor(timeSeconds * 12) % 2;
    for (let y = 8 + offset; y < height - 6; y += 2) {
      ctx.fillRect(0, y, width, 1);
    }
  }
}

const BLACKOUT_PALETTE: StudyPalette = {
  id: "furnace-amber",
  name: "Blackout",
  sky: "#000000",
  haze: "#000000",
  distant: "#000000",
  structure: "#000000",
  face: "#000000",
  shadow: "#000000",
  light: "#000000",
  glow: "#000000",
  reflection: "#000000",
};

function buildAnarchy3DScenePolygons(
  scene: Anarchy3DScene,
  timeSeconds: number,
  audio: SceneAudioState,
  beatPhase = 0
): Poly3D[] {
  const polygons: Poly3D[] = [];
  const { environment: env, subject: sub, camera: cam, audioMapping: map } = scene;
  const MAX_POLYS = 1600;
  let instanceBudgetRemaining = 256;

  const baseExprCtx = {
    t: timeSeconds,
    beat: beatPhase,
    i: 0,
    bass: clamp01(audio.bassEnvelope),
    mid: clamp01(audio.midEnvelope),
    treble: clamp01(audio.trebleEnvelope),
    flux: clamp01(audio.transientPulse),
    rms: clamp01(audio.rmsEnvelope),
    seed: ((scene.seed ?? 1) % 1000) / 1000,
    count: 1,
    u: 0,
    params: scene.params,
  };

  interface ClonerTransform {
    pos: [number, number, number];
    rot: [number, number, number];
    scale: [number, number, number];
  }

  const expandClonerTransforms = (
    cloner: Anarchy3DCloner | undefined,
    basePos: [number, number, number],
    baseRot: [number, number, number],
    baseScale: [number, number, number]
  ): ClonerTransform[] => {
    if (!cloner || cloner.count <= 1) {
      if (instanceBudgetRemaining <= 0) return [];
      instanceBudgetRemaining -= 1;
      return [{ pos: basePos, rot: baseRot, scale: baseScale }];
    }
    const count = Math.max(1, Math.min(64, cloner.count, instanceBudgetRemaining));
    instanceBudgetRemaining -= count;
    const deg2rad = Math.PI / 180;
    const sr = cloner.stepRotation ?? [0, 0, 0];
    const ss = cloner.stepScale ?? [1, 1, 1];
    const off = cloner.offset ?? [0, 0, 0];
    const cols = Math.max(1, Math.ceil(Math.sqrt(count)));
    const out: ClonerTransform[] = [];

    for (let idx = 0; idx < count; idx++) {
      let px = basePos[0];
      let py = basePos[1];
      let pz = basePos[2];

      if (cloner.mode === "linear") {
        px += off[0] * idx;
        py += off[1] * idx;
        pz += off[2] * idx;
      } else if (cloner.mode === "radial") {
        const radius = Math.hypot(off[0], off[2]) || 1.6;
        const angle = (idx / count) * Math.PI * 2;
        px += Math.cos(angle) * radius;
        py += off[1] * idx;
        pz += Math.sin(angle) * radius;
      } else if (cloner.mode === "grid") {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        px += col * off[0];
        py += row * off[1];
        pz += row * off[2];
      } else if (cloner.mode === "spiral") {
        const stepAngle = (sr[2] !== 0 ? sr[2] : 20) * deg2rad;
        const angle = idx * stepAngle;
        const rxRadius = off[0] !== 0 ? off[0] : 0.45;
        const ryRadius = off[1] !== 0 ? off[1] : rxRadius;
        px += Math.cos(angle) * rxRadius;
        py += Math.sin(angle) * ryRadius;
        pz += off[2] * idx;
      }

      const rx = baseRot[0] + sr[0] * deg2rad * idx;
      const ry = baseRot[1] + sr[1] * deg2rad * idx;
      const rz = baseRot[2] + sr[2] * deg2rad * idx;
      const sx = baseScale[0] * Math.pow(ss[0], idx);
      const sy = baseScale[1] * Math.pow(ss[1], idx);
      const sz = baseScale[2] * Math.pow(ss[2], idx);
      out.push({ pos: [px, py, pz], rot: [rx, ry, rz], scale: [sx, sy, sz] });
    }
    return out;
  };

  const applyAnimations = (
    anims: Anarchy3DAnimation[] | undefined,
    i: number,
    state: {
      pos: [number, number, number];
      rot: [number, number, number];
      scale: [number, number, number];
      emissiveIntensity: number;
    },
    totalCount = 1
  ) => {
    if (!anims || anims.length === 0) return;
    const safeCount = Math.max(1, totalCount);
    const ctx = {
      ...baseExprCtx,
      i,
      count: safeCount,
      u: safeCount > 1 ? i / (safeCount - 1) : 0,
    };
    for (const anim of anims) {
      const val = evaluateMathExpression(anim.expr, ctx, Number.NaN);
      if (!Number.isFinite(val)) continue;
      switch (anim.target) {
        case "pos.x":
          state.pos[0] = val;
          break;
        case "pos.y":
          state.pos[1] = val;
          break;
        case "pos.z":
          state.pos[2] = val;
          break;
        case "rot.x":
          state.rot[0] = val;
          break;
        case "rot.y":
          state.rot[1] = val;
          break;
        case "rot.z":
          state.rot[2] = val;
          break;
        case "scale":
          state.scale[0] *= val;
          state.scale[1] *= val;
          state.scale[2] *= val;
          break;
        case "scale.x":
          state.scale[0] = val;
          break;
        case "scale.y":
          state.scale[1] = val;
          break;
        case "scale.z":
          state.scale[2] = val;
          break;
        case "emissiveIntensity":
          state.emissiveIntensity = val;
          break;
      }
    }
  };

  // Extraire les calques v2 s'ils sont présents (sinon fallback v1 transparent)
  const terrainLayer: Anarchy3DTerrainLayer =
    scene.layers?.find(
      (l): l is Extract<NonNullable<Anarchy3DScene["layers"]>[number], { kind: "terrain" }> =>
        l.kind === "terrain"
    )?.terrain ?? {
      type: env.terrainType,
      speed: env.terrainSpeed,
      primaryColor: env.terrainPrimaryColor,
      secondaryColor: env.terrainSecondaryColor,
    };

  const sidePropsLayer: Anarchy3DSidePropsLayer =
    scene.layers?.find(
      (l): l is Extract<NonNullable<Anarchy3DScene["layers"]>[number], { kind: "sideProps" }> =>
        l.kind === "sideProps"
    )?.sideProps ?? {
      type: "none",
      density: 0.6,
      primaryColor: env.terrainPrimaryColor,
      secondaryColor: env.terrainSecondaryColor,
    };

  const subjectsList: Anarchy3DSubject[] =
    scene.layers?.find(
      (l): l is Extract<NonNullable<Anarchy3DScene["layers"]>[number], { kind: "subjects" }> =>
        l.kind === "subjects"
    )?.subjects ??
    (scene.subjects && scene.subjects.length > 0 ? scene.subjects : [sub]);

  const rotYPoint = (
    lx: number,
    ly: number,
    lz: number,
    cx: number,
    cy: number,
    cz: number,
    angle: number
  ): Vec3 => {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return {
      x: cx + lx * c - lz * s,
      y: cy + ly,
      z: cz + lx * s + lz * c,
    };
  };

  const rotEulerPoint = (
    lx: number,
    ly: number,
    lz: number,
    cx: number,
    cy: number,
    cz: number,
    rx: number,
    ry: number,
    rz: number
  ): Vec3 => {
    // Rotation X
    const cx0 = Math.cos(rx);
    const sx0 = Math.sin(rx);
    const y1 = ly * cx0 - lz * sx0;
    const z1 = ly * sx0 + lz * cx0;
    // Rotation Y
    const cy0 = Math.cos(ry);
    const sy0 = Math.sin(ry);
    const x2 = lx * cy0 + z1 * sy0;
    const z2 = -lx * sy0 + z1 * cy0;
    // Rotation Z
    const cz0 = Math.cos(rz);
    const sz0 = Math.sin(rz);
    const x3 = x2 * cz0 - y1 * sz0;
    const y3 = x2 * sz0 + y1 * cz0;
    return { x: cx + x3, y: cy + y3, z: cz + z2 };
  };

  let triggerEmissive = 0;
  let triggerSpinBurst = 0;
  if (scene.triggers?.length) {
    for (const trig of scene.triggers) {
      const fired = evaluateMathExpression(trig.when, baseExprCtx, 0) > 0.5;
      if (!fired) continue;
      const amt = Math.max(0, Math.min(2, trig.intensity ?? 1));
      if (trig.action === "emissive_surge" || trig.action === "flash_sky") {
        triggerEmissive += amt * 0.3;
      } else if (trig.action === "spin_burst") {
        triggerSpinBurst += amt * 1.4;
      }
    }
  }

  const sceneEmissiveAnim = scene.animations?.find(
    (a) => a.target === "emissiveIntensity"
  );
  const sceneEmissiveExtra = sceneEmissiveAnim
    ? clamp01(evaluateMathExpression(sceneEmissiveAnim.expr, baseExprCtx, 0)) * 0.35
    : 0;

  const emissiveBoost =
    (map.fluxTarget === "glitch_and_emissive" ? audio.transientPulse * 0.25 : 0) +
    sceneEmissiveExtra +
    triggerEmissive;
  const wireGlowActive =
    sub.wireframeOverlay ||
    (map.trebleTarget === "wireframe_glow" && audio.trebleEnvelope > 0.22) ||
    audio.transientPulse > 0.35 ||
    triggerEmissive > 0.15;

  const primaryCol =
    map.midTarget === "color_shift"
      ? lerpHexColor(
          sub.primaryColor,
          sub.accentColor,
          clamp01(audio.midEnvelope * 0.75)
        )
      : sub.primaryColor;
  const accentCol = sub.accentColor;

  const addBox = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    fillColor: string,
    wireColor: string,
    tone = 0.74,
    wireRim = wireGlowActive,
    checker = true,
    rotY = 0,
    rotX = 0,
    rotZ = 0
  ) => {
    if (polygons.length > MAX_POLYS) return;
    const hw = Math.max(0.06, w * 0.5);
    const hh = Math.max(0.06, h * 0.5);
    const hd = Math.max(0.06, d * 0.5);
    const t = clamp01(tone + emissiveBoost);
    const pt = (lx: number, ly: number, lz: number) =>
      rotX === 0 && rotZ === 0
        ? rotYPoint(lx, ly, lz, x, y, z, rotY)
        : rotEulerPoint(lx, ly, lz, x, y, z, rotX, rotY, rotZ);

    polygons.push(
      {
        vertices: [
          pt(-hw, -hh, -hd),
          pt(hw, -hh, -hd),
          pt(hw, hh, -hd),
          pt(-hw, hh, -hd),
        ],
        tone: t,
        checker,
        wireRim,
        fillColor,
        wireColor,
      },
      {
        vertices: [
          pt(hw, -hh, -hd),
          pt(hw, -hh, hd),
          pt(hw, hh, hd),
          pt(hw, hh, -hd),
        ],
        tone: clamp01(t * 0.78),
        checker: false,
        wireRim,
        fillColor,
        wireColor,
      },
      {
        vertices: [
          pt(-hw, -hh, hd),
          pt(-hw, -hh, -hd),
          pt(-hw, hh, -hd),
          pt(-hw, hh, hd),
        ],
        tone: clamp01(t * 0.68),
        checker: false,
        wireRim: false,
        fillColor,
        wireColor,
      },
      {
        vertices: [
          pt(-hw, hh, -hd),
          pt(hw, hh, -hd),
          pt(hw, hh, hd),
          pt(-hw, hh, hd),
        ],
        tone: clamp01(t * 1.12),
        checker,
        wireRim,
        fillColor,
        wireColor,
      }
    );
  };

  const addWedge = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    fillColor: string,
    wireColor: string,
    tone = 0.82,
    wireRim = wireGlowActive,
    rx = 0,
    ry = 0,
    rz = 0
  ) => {
    if (polygons.length > MAX_POLYS) return;
    const hw = Math.max(0.06, w * 0.5);
    const hh = Math.max(0.06, h * 0.5);
    const hd = Math.max(0.06, d * 0.5);
    const t = clamp01(tone + emissiveBoost);
    const pt = (lx: number, ly: number, lz: number) =>
      rotEulerPoint(lx, ly, lz, x, y, z, rx, ry, rz);

    // Rampe / cockpit biseauté (avant plus bas que l'arrière)
    polygons.push(
      {
        vertices: [
          pt(-hw, -hh, -hd),
          pt(hw, -hh, -hd),
          pt(hw, hh, hd),
          pt(-hw, hh, hd),
        ],
        tone: clamp01(t * 1.05),
        checker: false,
        wireRim,
        fillColor,
        wireColor,
      },
      {
        vertices: [
          pt(-hw, -hh, hd),
          pt(hw, -hh, hd),
          pt(hw, hh, hd),
          pt(-hw, hh, hd),
        ],
        tone: clamp01(t * 0.72),
        checker: false,
        wireRim,
        fillColor,
        wireColor,
      },
      {
        vertices: [
          pt(-hw, -hh, -hd),
          pt(-hw, -hh, hd),
          pt(-hw, hh, hd),
        ],
        tone: clamp01(t * 0.68),
        checker: false,
        wireRim,
        fillColor,
        wireColor,
      },
      {
        vertices: [
          pt(hw, -hh, -hd),
          pt(hw, hh, hd),
          pt(hw, -hh, hd),
        ],
        tone: clamp01(t * 0.8),
        checker: false,
        wireRim,
        fillColor,
        wireColor,
      }
    );
  };

  const addPyramid = (
    x: number,
    y: number,
    z: number,
    radius: number,
    height: number,
    fillColor: string,
    wireColor: string,
    tone = 0.82,
    wireRim = wireGlowActive,
    inverted = false,
    rotY = 0,
    rotX = 0,
    rotZ = 0
  ) => {
    if (polygons.length > MAX_POLYS) return;
    const r = Math.max(0.1, radius);
    const h = Math.max(0.12, height);
    const tipOffset = inverted ? -h * 0.5 : h * 0.5;
    const baseOffset = inverted ? h * 0.5 : -h * 0.5;
    const pt = (lx: number, ly: number, lz: number) =>
      rotX === 0 && rotZ === 0
        ? rotYPoint(lx, ly, lz, x, y, z, rotY)
        : rotEulerPoint(lx, ly, lz, x, y, z, rotX, rotY, rotZ);

    const apex = pt(0, tipOffset, 0);
    const corners = [
      pt(-r, baseOffset, -r),
      pt(r, baseOffset, -r),
      pt(r, baseOffset, r),
      pt(-r, baseOffset, r),
    ];
    const baseTone = clamp01(tone + emissiveBoost);
    for (let i = 0; i < 4; i++) {
      const next = (i + 1) % 4;
      polygons.push({
        vertices: [apex, corners[i], corners[next]],
        tone: clamp01(baseTone * (1 - i * 0.1)),
        checker: i % 2 === 0,
        wireRim,
        fillColor,
        wireColor,
      });
    }
  };

  const addRing = (
    z: number,
    radius: number,
    depth: number,
    segments: number,
    spinRad: number,
    fillColor: string,
    wireColor: string,
    tone = 0.78,
    wireRim = wireGlowActive,
    cx = 0,
    cy = 0,
    rx = 0,
    ry = 0
  ) => {
    if (polygons.length > MAX_POLYS) return;
    const segs = Math.max(4, Math.min(10, Math.round(segments)));
    const baseTone = clamp01(tone + emissiveBoost);
    for (let s = 0; s < segs; s++) {
      const a0 = spinRad + (s * Math.PI * 2) / segs;
      const a1 = spinRad + ((s + 1) * Math.PI * 2) / segs;
      const x0 = Math.cos(a0) * radius;
      const y0 = Math.sin(a0) * radius;
      const x1 = Math.cos(a1) * radius;
      const y1 = Math.sin(a1) * radius;
      const pt = (lx: number, ly: number, lz: number) =>
        rx === 0 && ry === 0
          ? { x: cx + lx, y: cy + ly, z: z + lz }
          : rotEulerPoint(lx, ly, lz, cx, cy, z, rx, ry, 0);

      polygons.push({
        vertices: [
          pt(x0, y0, 0),
          pt(x1, y1, 0),
          pt(x1, y1, depth),
          pt(x0, y0, depth),
        ],
        tone: s % 2 === 0 ? baseTone : clamp01(baseTone * 0.65),
        checker: s % 2 === 0,
        wireRim: wireRim && s % 2 === 0,
        fillColor,
        wireColor,
      });
    }
  };

  const addProceduralPart = (
    part: AnarchyProceduralPart,
    cx: number,
    cy: number,
    cz: number,
    parentScale: number,
    parentAccent: string,
    baseRotY: number,
    parentInstanceIdx = 0
  ) => {
    const partTransforms = expandClonerTransforms(
      part.cloner,
      part.position,
      part.rotation,
      part.scale
    );
    const fill = part.color;
    const wire = part.emissive ? "#FFFFFF" : parentAccent;
    const baseTone = part.emissive ? 0.96 : 0.78;
    const wireRim = part.wireframe ?? true;

    for (let pIdx = 0; pIdx < partTransforms.length; pIdx++) {
      const tr = partTransforms[pIdx];
      const animState = {
        pos: [...tr.pos] as [number, number, number],
        rot: [...tr.rot] as [number, number, number],
        scale: [...tr.scale] as [number, number, number],
        emissiveIntensity: baseTone,
      };
      applyAnimations(
        part.animations,
        pIdx + parentInstanceIdx,
        animState,
        partTransforms.length
      );

      const px = cx + animState.pos[0] * parentScale;
      const py = cy + animState.pos[1] * parentScale;
      const pz = cz + animState.pos[2] * parentScale;
      const sx = animState.scale[0] * parentScale;
      const sy = animState.scale[1] * parentScale;
      const sz = animState.scale[2] * parentScale;
      const rx = animState.rot[0];
      const ry = animState.rot[1] + baseRotY;
      const rz = animState.rot[2];
      const tone = clamp01(animState.emissiveIntensity);

      switch (part.primitive) {
        case "box":
          addBox(px, py, pz, sx, sy, sz, fill, wire, tone, wireRim, false, ry, rx, rz);
          break;
        case "wedge":
          addWedge(px, py, pz, sx, sy, sz, fill, wire, tone, wireRim, rx, ry, rz);
          break;
        case "pyramid":
          addPyramid(
            px,
            py,
            pz,
            Math.max(sx, sz) * 0.55,
            sy,
            fill,
            wire,
            tone,
            wireRim,
            false,
            ry,
            rx,
            rz
          );
          break;
        case "icosahedron":
          addPyramid(
            px,
            py + sy * 0.28,
            pz,
            Math.max(sx, sz) * 0.52,
            sy * 0.6,
            fill,
            wire,
            tone,
            wireRim,
            false,
            ry,
            rx,
            rz
          );
          addPyramid(
            px,
            py - sy * 0.28,
            pz,
            Math.max(sx, sz) * 0.52,
            sy * 0.6,
            fill,
            wire,
            clamp01(tone * 0.85),
            wireRim,
            true,
            ry,
            rx,
            rz
          );
          break;
        case "cylinder":
          addRing(
            pz - sz * 0.5,
            Math.max(sx, sy) * 0.5,
            Math.max(0.18, sz),
            6,
            rz,
            fill,
            wire,
            tone,
            wireRim,
            px,
            py,
            rx,
            ry
          );
          break;
        case "torus":
        case "ring":
          addRing(
            pz - sz * 0.2,
            Math.max(sx, sy) * 0.55,
            Math.max(0.14, sz * 0.45),
            8,
            rz,
            fill,
            wire,
            tone,
            wireRim,
            px,
            py,
            rx,
            ry
          );
          break;
      }
    }
  };

  // 1. TERRAIN 3D DATA-DRIVEN (compositionMode + terrainLayer.type)
  const compMode = scene.compositionMode ?? "corridor";
  const waveAmp =
    map.midTarget === "terrain_wave_height"
      ? 0.25 + audio.midEnvelope * 0.85
      : 0.15 + audio.midEnvelope * 0.25;
  const scrollZ = (timeSeconds * 2.4) % 2.4;

  if (compMode === "terrain_flyover") {
    const flyAmp = waveAmp * (1.7 + audio.bassEnvelope * 1.2);
    for (let row = 0; row < 5; row++) {
      const z0 = 1.8 + row * 2.1 - scrollZ * 0.85;
      const z1 = z0 + 1.95;
      for (let col = -3; col <= 2; col++) {
        const x0 = col * 1.55;
        const x1 = (col + 1) * 1.55;
        const y00 = -1.6 + Math.sin(x0 * 0.8 + z0 * 0.7 + timeSeconds * 2.2) * flyAmp;
        const y10 = -1.6 + Math.sin(x1 * 0.8 + z0 * 0.7 + timeSeconds * 2.2) * flyAmp;
        const y11 = -1.6 + Math.sin(x1 * 0.8 + z1 * 0.7 + timeSeconds * 2.2) * flyAmp;
        const y01 = -1.6 + Math.sin(x0 * 0.8 + z1 * 0.7 + timeSeconds * 2.2) * flyAmp;
        polygons.push({
          vertices: [
            { x: x0, y: y00, z: z0 },
            { x: x1, y: y10, z: z0 },
            { x: x1, y: y11, z: z1 },
            { x: x0, y: y01, z: z1 },
          ],
          tone: clamp01(0.35 + (y00 + 1.6) * 0.45),
          checker: (row + col) % 2 === 0,
          wireRim: true,
          fillColor:
            (row + col) % 2 === 0
              ? terrainLayer.primaryColor
              : terrainLayer.secondaryColor,
          wireColor: terrainLayer.secondaryColor,
        });
      }
    }
  } else if (compMode === "tunnel_infinite") {
    const ringBoost =
      map.bassTarget === "tunnel_boost"
        ? 1 + audio.bassEnvelope * 0.45
        : 1 + audio.bassEnvelope * 0.22;
    for (let r = 0; r < 6; r++) {
      const zPos = 2.2 + r * 1.8 - (scrollZ % 1.8);
      addRing(
        zPos,
        (2.1 + r * 0.18) * ringBoost,
        0.48,
        8,
        timeSeconds * (r % 2 === 0 ? 0.85 : -0.85) + r * 0.35,
        r % 2 === 0 ? terrainLayer.primaryColor : terrainLayer.secondaryColor,
        r % 2 === 0 ? terrainLayer.secondaryColor : terrainLayer.primaryColor,
        0.82,
        true
      );
    }
  } else if (compMode === "corridor") {
    switch (terrainLayer.type) {
    case "infinite_grid": {
      for (let row = 0; row < 4; row++) {
        const z0 = 2.0 + row * 2.4 - scrollZ;
        const z1 = z0 + 2.1;
        for (let col = -2; col <= 1; col++) {
          const x0 = col * 1.9;
          const x1 = (col + 1) * 1.9;
          const yWave =
            -1.65 +
            Math.sin(timeSeconds * 2.2 + row * 0.9 + col) * waveAmp * 0.35;
          const isAlt = (row + col) % 2 === 0;
          polygons.push({
            vertices: [
              { x: x0, y: yWave, z: z0 },
              { x: x1, y: yWave, z: z0 },
              { x: x1, y: yWave, z: z1 },
              { x: x0, y: yWave, z: z1 },
            ],
            tone: isAlt ? 0.62 : 0.42,
            checker: true,
            wireRim: true,
            fillColor: isAlt
              ? terrainLayer.primaryColor
              : terrainLayer.secondaryColor,
            wireColor: isAlt
              ? terrainLayer.secondaryColor
              : terrainLayer.primaryColor,
          });
        }
      }
      break;
    }
    case "neon_highway": {
      const roadY = -1.58;
      for (let row = 0; row < 4; row++) {
        const z0 = 1.8 + row * 2.4 - scrollZ;
        const z1 = z0 + 2.25;
        // Chaussée centrale sombre bordée de néon
        polygons.push({
          vertices: [
            { x: -2.6, y: roadY, z: z0 },
            { x: 2.6, y: roadY, z: z0 },
            { x: 2.6, y: roadY, z: z1 },
            { x: -2.6, y: roadY, z: z1 },
          ],
          tone: 0.32,
          checker: false,
          wireRim: true,
          fillColor: lerpHexColor(env.skyColor, terrainLayer.primaryColor, 0.14),
          wireColor: terrainLayer.primaryColor,
        });
        // Marquages de voies défilants
        if (row % 2 === 0) {
          for (const lx of [-0.9, 0.9]) {
            polygons.push({
              vertices: [
                { x: lx - 0.06, y: roadY + 0.02, z: z0 + 0.3 },
                { x: lx + 0.06, y: roadY + 0.02, z: z0 + 0.3 },
                { x: lx + 0.06, y: roadY + 0.02, z: z0 + 1.35 },
                { x: lx - 0.06, y: roadY + 0.02, z: z0 + 1.35 },
              ],
              tone: 0.95,
              checker: false,
              wireRim: false,
              fillColor: terrainLayer.secondaryColor,
              wireColor: terrainLayer.secondaryColor,
            });
          }
        }
        // Glissières latérales lumineuses
        addBox(
          -2.75,
          roadY + 0.18,
          (z0 + z1) * 0.5,
          0.16,
          0.32,
          2.2,
          terrainLayer.secondaryColor,
          terrainLayer.primaryColor,
          0.88,
          true,
          false,
          0
        );
        addBox(
          2.75,
          roadY + 0.18,
          (z0 + z1) * 0.5,
          0.16,
          0.32,
          2.2,
          terrainLayer.secondaryColor,
          terrainLayer.primaryColor,
          0.88,
          true,
          false,
          0
        );
      }
      break;
    }
    case "mirror_floor": {
      const floorY = -1.62;
      for (let row = 0; row < 4; row++) {
        const z0 = 2.0 + row * 2.4 - scrollZ;
        const z1 = z0 + 2.2;
        for (let col = -2; col <= 1; col++) {
          const x0 = col * 1.95;
          const x1 = (col + 1) * 1.95;
          const isStripe = (row + col) % 2 === 0;
          polygons.push({
            vertices: [
              { x: x0, y: floorY, z: z0 },
              { x: x1, y: floorY, z: z0 },
              { x: x1, y: floorY, z: z1 },
              { x: x0, y: floorY, z: z1 },
            ],
            tone: isStripe ? 0.45 : 0.25,
            checker: false,
            wireRim: true,
            fillColor: lerpHexColor(
              env.skyColor,
              isStripe ? terrainLayer.primaryColor : terrainLayer.secondaryColor,
              0.22 + audio.bassEnvelope * 0.18
            ),
            wireColor: isStripe
              ? terrainLayer.primaryColor
              : terrainLayer.secondaryColor,
          });
        }
      }
      break;
    }
    case "lowpoly_mountains": {
      for (let i = 0; i < 4; i++) {
        const zPos = 3.0 + i * 2.4 - scrollZ;
        const hPeak =
          1.45 +
          ((i * 7) % 3) * 0.35 +
          waveAmp * 1.15 +
          (map.bassTarget === "pillar_slam" ? audio.bassEnvelope * 0.9 : 0);
        addPyramid(
          -3.4 - (i % 2) * 0.5,
          -1.5 + hPeak * 0.5,
          zPos,
          1.15,
          hPeak,
          i % 2 === 0 ? terrainLayer.primaryColor : terrainLayer.secondaryColor,
          terrainLayer.secondaryColor,
          0.68,
          true,
          false,
          i * 0.4
        );
        addPyramid(
          3.4 + (i % 2) * 0.5,
          -1.5 + hPeak * 0.5,
          zPos,
          1.15,
          hPeak,
          i % 2 === 1 ? terrainLayer.primaryColor : terrainLayer.secondaryColor,
          terrainLayer.primaryColor,
          0.68,
          true,
          false,
          -i * 0.4
        );
      }
      break;
    }
    case "dojo_pillars": {
      const slamBoost =
        map.bassTarget === "pillar_slam"
          ? audio.bassEnvelope * 1.35
          : audio.bassEnvelope * 0.45;
      for (let i = 0; i < 3; i++) {
        const zPos = 3.4 + i * 2.8 - scrollZ;
        const pHeight = 2.5 + slamBoost;
        addBox(
          -2.9,
          -1.6 + pHeight * 0.5,
          zPos,
          0.52,
          pHeight,
          0.52,
          terrainLayer.primaryColor,
          terrainLayer.secondaryColor,
          0.72,
          true,
          true,
          0
        );
        addBox(
          2.9,
          -1.6 + pHeight * 0.5,
          zPos,
          0.52,
          pHeight,
          0.52,
          terrainLayer.primaryColor,
          terrainLayer.secondaryColor,
          0.72,
          true,
          true,
          0
        );
        addBox(
          0,
          -1.5 + pHeight,
          zPos,
          6.4,
          0.28,
          0.42,
          terrainLayer.secondaryColor,
          terrainLayer.primaryColor,
          0.84,
          true,
          false,
          0
        );
      }
      break;
    }
    case "tunnel": {
      const ringBoost =
        map.bassTarget === "tunnel_boost"
          ? 1 + audio.bassEnvelope * 0.45
          : 1 + audio.bassEnvelope * 0.2;
      for (let r = 0; r < 3; r++) {
        const zPos = 3.0 + r * 2.6 - scrollZ;
        addRing(
          zPos,
          (1.85 + r * 0.25) * ringBoost,
          0.55,
          8,
          timeSeconds * (r % 2 === 0 ? 0.75 : -0.75),
          r % 2 === 0 ? terrainLayer.primaryColor : terrainLayer.secondaryColor,
          r % 2 === 0 ? terrainLayer.secondaryColor : terrainLayer.primaryColor,
          0.76,
          true
        );
      }
      break;
    }
  }
  }

  // 2. DÉCORS LATÉRAUX PROCÉDURAUX (sidePropsLayer)
  if (compMode === "corridor" && sidePropsLayer.type !== "none" && sidePropsLayer.density > 0.05) {
    const propCount = Math.max(1, Math.min(4, Math.round(1 + sidePropsLayer.density * 3)));
    const propStep = 9.0 / propCount;
    const propScroll = (timeSeconds * 2.4) % propStep;

    for (let i = 0; i < propCount; i++) {
      const zPos = 2.6 + i * propStep - propScroll;
      switch (sidePropsLayer.type) {
        case "palm_trees": {
          for (const side of [-1, 1]) {
            const px = side * 3.35;
            addBox(
              px,
              -0.35,
              zPos,
              0.22,
              2.35,
              0.22,
              sidePropsLayer.primaryColor,
              sidePropsLayer.secondaryColor,
              0.78,
              true,
              false,
              0,
              0,
              side * -0.08
            );
            addPyramid(
              px,
              0.95,
              zPos,
              0.95,
              0.65,
              sidePropsLayer.secondaryColor,
              sidePropsLayer.primaryColor,
              0.88,
              true,
              true,
              i * 0.5
            );
          }
          break;
        }
        case "cyber_towers": {
          for (const side of [-1, 1]) {
            const px = side * (3.5 + (i % 2) * 0.45);
            const hTower = 2.6 + ((i * 3) % 3) * 0.75 + audio.bassEnvelope * 0.55;
            addBox(
              px,
              -1.6 + hTower * 0.5,
              zPos,
              0.85,
              hTower,
              0.85,
              sidePropsLayer.primaryColor,
              sidePropsLayer.secondaryColor,
              0.7,
              true,
              true,
              0
            );
          }
          break;
        }
        case "dojo_pillars": {
          for (const side of [-1, 1]) {
            const px = side * 3.15;
            addBox(
              px,
              -0.25,
              zPos,
              0.38,
              2.5,
              0.38,
              sidePropsLayer.primaryColor,
              sidePropsLayer.secondaryColor,
              0.76,
              true,
              true,
              0
            );
            addBox(
              px,
              1.1,
              zPos,
              0.72,
              0.22,
              0.72,
              sidePropsLayer.secondaryColor,
              sidePropsLayer.primaryColor,
              0.9,
              true,
              false,
              0
            );
          }
          break;
        }
        case "neon_arches": {
          addRing(
            zPos,
            2.75 + audio.bassEnvelope * 0.25,
            0.35,
            6,
            0,
            sidePropsLayer.primaryColor,
            sidePropsLayer.secondaryColor,
            0.84,
            true
          );
          break;
        }
      }
    }
  }

  // 3. SUJETS 3D MULTIPLES DATA-DRIVEN (subjects[])
  const subjectPulse =
    map.bassTarget === "subject_pulse"
      ? 1 + audio.bassEnvelope * 0.65
      : 1 + audio.bassEnvelope * 0.25;
  const rotSpeed =
    (map.midTarget === "subject_rotation"
      ? 1.8 + audio.midEnvelope * 2.4
      : 0.95) + triggerSpinBurst;
  const subRotY = timeSeconds * rotSpeed;
  const jumpY =
    map.bassTarget === "camera_zoom_and_jump"
      ? audio.bassEnvelope * 0.75
      : Math.sin(timeSeconds * 2.4) * 0.15;

  for (let sIdx = 0; sIdx < subjectsList.length; sIdx++) {
    const curSub = subjectsList[sIdx];
    const baseSubPos: [number, number, number] = [
      curSub.position?.[0] ?? 0,
      curSub.position?.[1] ?? 0,
      curSub.position?.[2] ?? 0,
    ];
    const baseSubRot: [number, number, number] = [
      curSub.rotation?.[0] ?? 0,
      curSub.rotation?.[1] ?? 0,
      curSub.rotation?.[2] ?? 0,
    ];
    const subTransforms = expandClonerTransforms(
      curSub.cloner,
      baseSubPos,
      baseSubRot,
      [curSub.scale, curSub.scale, curSub.scale]
    );
    const sPrimary =
      map.midTarget === "color_shift"
        ? lerpHexColor(
            curSub.primaryColor,
            curSub.accentColor,
            clamp01(audio.midEnvelope * 0.75)
          )
        : curSub.primaryColor;
    const sAccent = curSub.accentColor;
    const sWire = curSub.wireframeOverlay || wireGlowActive;

    for (let instIdx = 0; instIdx < subTransforms.length; instIdx++) {
      const tr = subTransforms[instIdx];
      const animState = {
        pos: [...tr.pos] as [number, number, number],
        rot: [...tr.rot] as [number, number, number],
        scale: [...tr.scale] as [number, number, number],
        emissiveIntensity: 0.85,
      };
      applyAnimations(
        curSub.animations,
        instIdx,
        animState,
        subTransforms.length
      );
      const sc =
        ((animState.scale[0] + animState.scale[1] + animState.scale[2]) / 3) *
        subjectPulse;
      const offX = animState.pos[0];
      const offY = animState.pos[1];
      const offZ = animState.pos[2];
      const baseRotY = animState.rot[1];

      switch (curSub.meshType) {
        case "procedural_group": {
          const centerZ = 4.9 + offZ;
          const baseY = offY + jumpY * 0.45;
          const parts = curSub.parts ?? [];
          for (const part of parts) {
            addProceduralPart(
              part,
              offX,
              baseY,
              centerZ,
              sc,
              sAccent,
              baseRotY +
                (sIdx > 0 || instIdx > 0
                  ? subRotY * 0.5
                  : Math.sin(timeSeconds * 0.9) * 0.12),
              instIdx
            );
          }
          break;
        }
      case "voxel_runner": {
        const runPhase = timeSeconds * Math.max(4, terrainLayer.speed * 0.65);
        const stride = Math.sin(runPhase) * 0.45;
        const centerZ = 4.6 + offZ;
        const baseY = -0.35 + offY + jumpY;
        addBox(
          offX,
          baseY + 0.35 * sc,
          centerZ,
          0.72 * sc,
          0.92 * sc,
          0.44 * sc,
          sPrimary,
          sAccent,
          0.82,
          sWire,
          true,
          baseRotY + Math.sin(runPhase * 0.5) * 0.18
        );
        addBox(
          offX,
          baseY + 1.02 * sc,
          centerZ - 0.05,
          0.48 * sc,
          0.44 * sc,
          0.46 * sc,
          sAccent,
          sPrimary,
          0.92,
          true,
          false,
          baseRotY
        );
        addBox(
          offX - 0.58 * sc,
          baseY + 0.32 * sc - stride * 0.25,
          centerZ + stride * 0.5,
          0.26 * sc,
          0.75 * sc,
          0.28 * sc,
          sAccent,
          sPrimary,
          0.78,
          sWire,
          false,
          baseRotY + stride * 0.4
        );
        addBox(
          offX + 0.58 * sc,
          baseY + 0.32 * sc + stride * 0.25,
          centerZ - stride * 0.5,
          0.26 * sc,
          0.75 * sc,
          0.28 * sc,
          sAccent,
          sPrimary,
          0.78,
          sWire,
          false,
          baseRotY - stride * 0.4
        );
        addBox(
          offX - 0.24 * sc,
          baseY - 0.42 * sc + Math.max(0, -stride * 0.3),
          centerZ - stride * 0.55,
          0.28 * sc,
          0.78 * sc,
          0.3 * sc,
          sPrimary,
          sAccent,
          0.68,
          sWire,
          true,
          baseRotY
        );
        addBox(
          offX + 0.24 * sc,
          baseY - 0.42 * sc + Math.max(0, stride * 0.3),
          centerZ + stride * 0.55,
          0.28 * sc,
          0.78 * sc,
          0.3 * sc,
          sPrimary,
          sAccent,
          0.68,
          sWire,
          true,
          baseRotY
        );
        break;
      }
      case "floating_monolith": {
        const centerZ = 5.4 + offZ;
        const monoY = 0.25 + offY + jumpY;
        addBox(
          offX,
          monoY,
          centerZ,
          0.95 * sc,
          2.45 * sc,
          0.75 * sc,
          sPrimary,
          sAccent,
          0.84,
          sWire,
          true,
          baseRotY + subRotY * 0.55
        );
        for (let i = 0; i < 3; i++) {
          const a = subRotY + (i * Math.PI * 2) / 3;
          addPyramid(
            offX + Math.cos(a) * 1.95 * sc,
            monoY + Math.sin(timeSeconds * 2 + i) * 0.35,
            centerZ + Math.sin(a) * 1.35 * sc,
            0.38 * sc,
            0.85 * sc,
            sAccent,
            sPrimary,
            0.9,
            true,
            i % 2 === 1,
            a
          );
        }
        break;
      }
      case "cyber_katana": {
        const centerZ = 5.0 + offZ;
        const slashBoost =
          map.trebleTarget === "katana_slash"
            ? audio.trebleEnvelope * 1.2
            : 0.3;
        addPyramid(
          offX,
          0.35 + offY + jumpY,
          centerZ,
          0.78 * sc,
          1.25 * sc,
          sPrimary,
          sAccent,
          0.88,
          sWire,
          false,
          baseRotY + subRotY
        );
        addPyramid(
          offX,
          -0.45 + offY + jumpY,
          centerZ,
          0.78 * sc,
          1.1 * sc,
          sPrimary,
          sAccent,
          0.74,
          sWire,
          true,
          baseRotY + subRotY
        );
        for (let b = -1; b <= 1; b += 2) {
          addBox(
            offX + b * (1.25 + slashBoost * 0.45) * sc,
            0.15 + offY + jumpY,
            centerZ - 0.3,
            0.18 * sc,
            2.55 * sc,
            0.36 * sc,
            sAccent,
            sPrimary,
            0.94,
            true,
            false,
            baseRotY + b * (0.48 + slashBoost * 0.5) + subRotY * 0.35
          );
        }
        break;
      }
      case "abstract_polyhedron": {
        const centerZ = 5.2 + offZ;
        const polyY = 0.2 + offY + jumpY;
        addPyramid(
          offX,
          polyY + 0.45 * sc,
          centerZ,
          0.92 * sc,
          1.15 * sc,
          sPrimary,
          sAccent,
          0.88,
          sWire,
          false,
          baseRotY + subRotY
        );
        addPyramid(
          offX,
          polyY - 0.45 * sc,
          centerZ,
          0.92 * sc,
          1.15 * sc,
          sAccent,
          sPrimary,
          0.78,
          sWire,
          true,
          baseRotY - subRotY
        );
        addRing(
          centerZ - 0.25,
          1.55 * sc,
          0.42 * sc,
          8,
          subRotY * 0.8,
          sAccent,
          sPrimary,
          0.86,
          true,
          offX,
          polyY
        );
        break;
      }
      case "none":
        break;
      }
    }
  }

  // 3B. KALEIDO_MANDALA : symétrie radiale sur N axes autour de (0, 0, 5.0)
  if (compMode === "kaleido_mandala" && polygons.length > 0) {
    const axes = Math.max(3, Math.min(12, Math.round(scene.kaleidoAxes ?? 6)));
    const baseCount = polygons.length;
    for (let ax = 1; ax < axes; ax++) {
      const ang = (ax / axes) * Math.PI * 2;
      const cosA = Math.cos(ang);
      const sinA = Math.sin(ang);
      for (let pi = 0; pi < baseCount; pi++) {
        const srcPoly = polygons[pi];
        polygons.push({
          ...srcPoly,
          vertices: srcPoly.vertices.map((v) => ({
            x: v.x * cosA - v.y * sinA,
            y: v.x * sinA + v.y * cosA,
            z: v.z,
          })),
        });
      }
    }
  }

  // 3C. GÉNÉRATEURS 3D PROCÉDURAUX (audio_wave_mesh, instanced_array)
  if (scene.generators && scene.generators.length > 0) {
    for (let gIdx = 0; gIdx < scene.generators.length; gIdx++) {
      const gen = scene.generators[gIdx];
      const gCol = gen.color ?? primaryCol;
      const gCol2 = gen.secondaryColor ?? accentCol;
      const gSpd = gen.speed ?? 1.0;
      const gScale = gen.scale ?? 1.0;
      const gAudio = 1 + audio.bassEnvelope * 0.8 + audio.midEnvelope * 0.55;

      if (gen.type === "audio_wave_mesh") {
        const cols = 7;
        const rows = 3;
        const amp = (gen.amplitude ?? 0.55) * gScale * gAudio;
        for (let r = 0; r < rows; r++) {
          const z0 = 3.2 + r * 1.4;
          const z1 = z0 + 1.25;
          for (let c = -3; c < cols - 3; c++) {
            const x0 = c * 0.85;
            const x1 = (c + 1) * 0.85;
            const y00 = -0.85 + Math.sin(x0 * 1.4 + timeSeconds * 3.0 * gSpd + r) * amp;
            const y10 = -0.85 + Math.sin(x1 * 1.4 + timeSeconds * 3.0 * gSpd + r) * amp;
            const y11 = -0.85 + Math.sin(x1 * 1.4 + timeSeconds * 3.0 * gSpd + r + 1) * amp;
            const y01 = -0.85 + Math.sin(x0 * 1.4 + timeSeconds * 3.0 * gSpd + r + 1) * amp;
            polygons.push({
              vertices: [
                { x: x0, y: y00, z: z0 },
                { x: x1, y: y10, z: z0 },
                { x: x1, y: y11, z: z1 },
                { x: x0, y: y01, z: z1 },
              ],
              tone: clamp01(0.45 + (y00 + 0.85) * 0.5),
              checker: (r + c) % 2 === 0,
              wireRim: true,
              fillColor: (r + c) % 2 === 0 ? gCol : gCol2,
              wireColor: gCol2,
            });
          }
        }
      } else if (gen.type === "instanced_array") {
        const count = Math.max(4, Math.min(36, Math.round(gen.count ?? 16)));
        const pattern = gen.pattern ?? "spiral";
        const prim = pattern === "ring" ? "ring" : pattern === "fractal" ? "pyramid" : "box";
        for (let i = 0; i < count; i++) {
          const frac = i / Math.max(1, count);
          let ix = 0;
          let iy = 0;
          let iz = 5.2;
          let isc = 0.28 * gScale;
          if (pattern === "grid") {
            const side = Math.max(2, Math.round(Math.sqrt(count)));
            const gx = (i % side) - (side - 1) * 0.5;
            const gz = Math.floor(i / side) - (side - 1) * 0.5;
            ix = gx * 0.9;
            iy = Math.sin(timeSeconds * 2.2 * gSpd + gx + gz) * 0.4 * gAudio;
            iz = 5.2 + gz * 0.9;
          } else if (pattern === "ring") {
            const ang = frac * Math.PI * 2 + timeSeconds * 0.8 * gSpd;
            const rad = 1.65 * gScale * (0.85 + gAudio * 0.18);
            ix = Math.cos(ang) * rad;
            iy = Math.sin(ang) * rad;
            iz = 5.0;
          } else if (pattern === "fractal") {
            const ang = i * 2.39996 + timeSeconds * 0.6 * gSpd;
            const rad = Math.sqrt(frac) * 2.1 * gScale;
            ix = Math.cos(ang) * rad;
            iy = Math.sin(ang) * rad * 0.75;
            iz = 4.6 + frac * 2.2;
            isc *= 1.15 - frac * 0.65;
          } else {
            // spiral
            const ang = frac * Math.PI * 4 + timeSeconds * 1.1 * gSpd;
            const rad = (0.4 + frac * 1.8) * gScale;
            ix = Math.cos(ang) * rad;
            iy = (frac - 0.5) * 2.2;
            iz = 4.2 + Math.sin(ang) * 1.4;
          }
          const colA = i % 2 === 0 ? gCol : gCol2;
          const colB = i % 2 === 0 ? gCol2 : gCol;
          if (prim === "pyramid") {
            addPyramid(ix, iy, iz, isc, isc * 1.4, colA, colB, 0.84, true, false, timeSeconds * gSpd + i);
          } else if (prim === "ring") {
            addRing(iz, isc, isc * 0.35, 6, timeSeconds * gSpd + i, colA, colB, 0.85, true, ix, iy);
          } else {
            addBox(ix, iy, iz, isc, isc, isc, colA, colB, 0.84, true, false, timeSeconds * gSpd + i);
          }
        }
      }
    }
  }

  // 4. MODE CAMÉRA FPS_ARMS : Bras / Lames 3D cybernétiques au premier plan
  if (cam.mode === "fps_arms") {
    const slash =
      map.trebleTarget === "katana_slash"
        ? audio.trebleEnvelope * 0.55
        : audio.bassEnvelope * 0.35;
    addBox(
      -1.35,
      -0.75 + slash * 0.35,
      2.65,
      0.24,
      1.35,
      0.55,
      primaryCol,
      accentCol,
      0.86,
      true,
      true,
      0.35 + slash
    );
    addBox(
      1.35,
      -0.75 + slash * 0.35,
      2.65,
      0.24,
      1.35,
      0.55,
      accentCol,
      primaryCol,
      0.92,
      true,
      true,
      -0.35 - slash
    );
  }

  // 5. PARTICULES 3D SUR LES AIGUS (trebleTarget === "particles_burst" ou "katana_slash")
  if (
    (map.trebleTarget === "particles_burst" ||
      map.trebleTarget === "katana_slash") &&
    audio.trebleEnvelope > 0.08
  ) {
    const pCount = Math.min(6, 2 + Math.round(audio.trebleEnvelope * 5));
    for (let i = 0; i < pCount; i++) {
      const a = timeSeconds * 1.7 + (i * Math.PI * 2) / pCount;
      const rad = 1.8 + ((i * 3) % 4) * 0.45;
      addPyramid(
        Math.cos(a) * rad,
        0.4 + Math.sin(timeSeconds * 3.1 + i) * 0.75,
        3.8 + (i % 3) * 1.1,
        0.18 + audio.trebleEnvelope * 0.16,
        0.36 + audio.trebleEnvelope * 0.25,
        accentCol,
        terrainLayer.primaryColor,
        0.95,
        true,
        i % 2 === 0,
        a
      );
    }
  }

  return polygons;
}

export function renderSceneFrame(
  ctx: CanvasRenderingContext2D,
  input: SceneFrameInput
): SceneRenderReport {
  if (!Number.isFinite(input.timeSeconds) || input.timeSeconds < 0) {
    throw new Error("Instant de scène invalide.");
  }
  const reducedMotion = Boolean(input.reducedMotion);
  const rawAudio = computeSceneAudioState(input.analysis, input.timeSeconds, {
    intensity: input.intensity,
    reducedMotion,
    liveAudioOverride: input.liveAudioOverride,
  });

  const bassGain = Math.max(0, Math.min(2.5, input.bandRouting?.bassGain ?? 1));
  const midGain = Math.max(0, Math.min(2.5, input.bandRouting?.midGain ?? 1));
  const trebleGain = Math.max(
    0,
    Math.min(2.5, input.bandRouting?.trebleGain ?? 1)
  );
  const transientGain = Math.max(
    0,
    Math.min(2.5, input.bandRouting?.transientGain ?? 1)
  );

  const audio: SceneAudioState = {
    ...rawAudio,
    bassEnvelope: clamp01(rawAudio.bassEnvelope * bassGain),
    midEnvelope: clamp01(rawAudio.midEnvelope * midGain),
    trebleEnvelope: clamp01(rawAudio.trebleEnvelope * trebleGain),
    transientPulse: reducedMotion
      ? 0
      : clamp01(rawAudio.transientPulse * transientGain),
  };

  const bpm = Math.max(40, Math.min(240, input.bpmConfig?.bpm ?? 128));
  const beatOffset = input.bpmConfig?.beatOffsetSeconds ?? 0;
  const beatFloat = Math.max(0, (input.timeSeconds - beatOffset) * (bpm / 60));
  const beatPhase = beatFloat - Math.floor(beatFloat);
  const switchBeats = input.bpmConfig?.autoSceneSwitchBeats ?? 0;

  const scene3d: Anarchy3DScene | undefined = input.anarchy3dScene;
  const prevScene3d: Anarchy3DScene | undefined = input.previousAnarchy3dScene;
  const sceneProgress = clamp01(input.sceneProgress ?? 0);
  const rawMorphProgress = clamp01(input.transitionProgress ?? 1);
  const morphAlpha =
    prevScene3d && rawMorphProgress < 0.999
      ? evaluateMorphEasing(
          rawMorphProgress,
          scene3d?.morphTransition?.easing ?? "easeInOutCubic"
        )
      : 1;
  const lfoValues = evaluateSceneLfos(
    scene3d?.modulators,
    input.timeSeconds,
    bpm
  );

  let effectiveSceneId: SceneId = scene3d?.sceneId ?? input.sceneId;
  let transitionBlackout = 0;
  if (switchBeats > 0 && !scene3d) {
    const baseSceneIdx = Math.max(
      0,
      SCENE_CATALOG.findIndex((s) => s.id === input.sceneId)
    );
    const cycleIdx = Math.floor(beatFloat / switchBeats);
    effectiveSceneId =
      SCENE_CATALOG[(baseSceneIdx + cycleIdx) % SCENE_CATALOG.length].id;
    const posInCycle = beatFloat % switchBeats;
    const distToBoundary = Math.min(posInCycle, switchBeats - posInCycle);
    if (distToBoundary < 0.35 && !reducedMotion) {
      transitionBlackout = clamp01(1 - distToBoundary / 0.35);
    }
  } else if (switchBeats > 0 && scene3d) {
    const posInCycle = beatFloat % switchBeats;
    const distToBoundary = Math.min(posInCycle, switchBeats - posInCycle);
    if (distToBoundary < 0.28 && !reducedMotion) {
      transitionBlackout = clamp01((1 - distToBoundary / 0.28) * 0.55);
    }
  }

  const descriptor = getSceneDescriptor(effectiveSceneId);
  const basePalette = getStudyPalette(input.paletteId);

  const colorTransition = clamp01(input.effects?.colorTransition ?? 0);
  const targetPalette = input.effects?.targetPaletteId
    ? getStudyPalette(input.effects.targetPaletteId)
    : STUDY_PALETTES[
        (STUDY_PALETTES.findIndex((p) => p.id === basePalette.id) + 1) %
          STUDY_PALETTES.length
      ];

  // Si une scène Anarchy3DScene est active, ses couleurs JSON définissent la direction artistique
  // et le fader Morph Couleur (colorTransition) agit comme multiplicateur vers targetPalette
  let artisticBasePalette: StudyPalette = basePalette;
  if (scene3d) {
    const { environment: env, subject: sub } = scene3d;
    const prevEnv = prevScene3d?.environment;
    const prevSub = prevScene3d?.subject;
    const skyCol =
      prevEnv && morphAlpha < 0.999
        ? lerpHexColor(prevEnv.skyColor, env.skyColor, morphAlpha)
        : env.skyColor;
    const fogCol =
      prevEnv && morphAlpha < 0.999
        ? lerpHexColor(prevEnv.fogColor, env.fogColor, morphAlpha)
        : env.fogColor;
    const tPrim =
      prevEnv && morphAlpha < 0.999
        ? lerpHexColor(prevEnv.terrainPrimaryColor, env.terrainPrimaryColor, morphAlpha)
        : env.terrainPrimaryColor;
    const tSec =
      prevEnv && morphAlpha < 0.999
        ? lerpHexColor(prevEnv.terrainSecondaryColor, env.terrainSecondaryColor, morphAlpha)
        : env.terrainSecondaryColor;
    const sPrim =
      prevSub && morphAlpha < 0.999
        ? lerpHexColor(prevSub.primaryColor, sub.primaryColor, morphAlpha)
        : sub.primaryColor;
    const sAcc =
      prevSub && morphAlpha < 0.999
        ? lerpHexColor(prevSub.accentColor, sub.accentColor, morphAlpha)
        : sub.accentColor;

    artisticBasePalette = {
      ...basePalette,
      sky: skyCol,
      haze: fogCol,
      distant: lerpHexColor(fogCol, tPrim, 0.35),
      structure: tPrim,
      reflection: tSec,
      face: sPrim,
      glow: sAcc,
      light: lerpHexColor(sAcc, "#FFFFFF", 0.55),
      shadow: lerpHexColor(skyCol, "#000000", 0.65),
    };
  }

  let palette = blendStudyPalettes(
    artisticBasePalette,
    targetPalette,
    colorTransition
  );

  // Mapping midTarget === "color_shift"
  if (scene3d?.audioMapping.midTarget === "color_shift" && audio.midEnvelope > 0.05) {
    const shiftAmt = clamp01(audio.midEnvelope * 0.55);
    palette = {
      ...palette,
      structure: lerpHexColor(palette.structure, palette.glow, shiftAmt),
      face: lerpHexColor(palette.face, palette.reflection, shiftAmt),
    };
  }

  const kickBlackoutStrength = clamp01(input.effects?.kickBlackout ?? 0);
  if (kickBlackoutStrength > 0.005 || transitionBlackout > 0.005) {
    const beatPulse = Math.exp(-beatPhase * 5.2);
    const kickEnergy = clamp01(
      Math.max(
        audio.bassEnvelope * 0.95 + audio.transientPulse * 0.45,
        input.bpmConfig ? beatPulse : 0
      )
    );
    const mode = input.bpmConfig?.kickBlackoutMode ?? "duck-on-kick";
    const kickDarkness =
      mode === "open-on-kick"
        ? clamp01((1 - kickEnergy) * kickBlackoutStrength)
        : clamp01(kickEnergy * kickBlackoutStrength);
    const totalDarkness = clamp01(Math.max(kickDarkness, transitionBlackout));
    palette = blendStudyPalettes(palette, BLACKOUT_PALETTE, totalDarkness);
  }

  // Le fader fog agit comme multiplicateur de fogDensity du JSON (avec automation DAW v6 éventuelle)
  const autoFogDensity = resolveAutomationOverride(
    scene3d?.automations,
    "fogDensity",
    undefined,
    sceneProgress
  );
  const rawFogDensity = autoFogDensity ?? scene3d?.environment.fogDensity ?? 0.035;
  const jsonFogNormalized = scene3d
    ? clamp01(rawFogDensity * 10)
    : DEFAULT_RETRO_EFFECTS.fog;
  const faderFogMul =
    (input.effects?.fog ?? DEFAULT_RETRO_EFFECTS.fog) /
    Math.max(0.1, DEFAULT_RETRO_EFFECTS.fog);

  const fluxGlitchBoost =
    scene3d?.audioMapping.fluxTarget === "glitch_and_emissive"
      ? audio.transientPulse * 0.22
      : 0;

  const isV3Style = Boolean(scene3d?.renderStyle);
  const effects: RetroEffects = {
    dither: clamp01(
      input.effects?.dither ?? (isV3Style ? 0.08 : DEFAULT_RETRO_EFFECTS.dither)
    ),
    fog: clamp01(jsonFogNormalized * faderFogMul),
    grain: clamp01(
      (isV3Style
        ? scene3d?.postFx?.crtScanlines ?? 0
        : input.effects?.grain ?? DEFAULT_RETRO_EFFECTS.grain) + fluxGlitchBoost
    ),
    vertexSnap:
      Boolean(input.effects?.vertexSnap ?? (isV3Style ? false : DEFAULT_RETRO_EFFECTS.vertexSnap)) ||
      (scene3d?.postFx?.ps1VertexJitter ?? 0) > 0.12,
    affineTextures:
      input.effects?.affineTextures ?? DEFAULT_RETRO_EFFECTS.affineTextures,
    psychedelic: clamp01(input.effects?.psychedelic ?? 0),
    colorTransition,
    targetPaletteId: input.effects?.targetPaletteId,
    kickBlackout: kickBlackoutStrength,
    anaglyphSplit: clamp01(
      (isV3Style
        ? scene3d?.postFx?.chromaticAberration ?? 0
        : input.effects?.anaglyphSplit ?? 0.16) + fluxGlitchBoost * 0.5
    ),
    strobeGlow: clamp01(input.effects?.strobeGlow ?? 0.25),
    pendulumSwing: clamp01(input.effects?.pendulumSwing ?? 0.25),
  };

  // Strobe aigu / clap : flash clair en arrière-plan (multiplié par le fader Strobe Aigu + trebleTarget/fluxTarget)
  const strobeAmt = effects.strobeGlow ?? 0;
  const skyFlashBonus =
    scene3d?.audioMapping.trebleTarget === "sky_flash" ? 1.35 : 1.0;
  const invertStrobeBonus =
    scene3d?.audioMapping.fluxTarget === "invert_strobe" &&
    audio.transientPulse > 0.32
      ? 1.45
      : 1.0;
  const trebleSnap = clamp01(
    Math.max(
      audio.trebleEnvelope * 1.15 * skyFlashBonus,
      audio.transientPulse * 0.95 * invertStrobeBonus
    )
  );
  const clapFlash =
    !reducedMotion && strobeAmt > 0.02
      ? clamp01((trebleSnap - 0.15) * 2.15 * strobeAmt)
      : 0;
  if (clapFlash > 0.02) {
    palette = {
      ...palette,
      sky: lerpHexColor(palette.sky, "#ffffff", clapFlash * 0.85),
      haze: lerpHexColor(palette.haze, palette.light, clapFlash * 0.9),
      distant: lerpHexColor(palette.distant, "#ffffff", clapFlash * 0.55),
    };
  }

  // Paramètres caméra unifiés : JSON camera (mode, rig, beatCut, fov, shakeIntensity) × Multiplicateurs Faders + cameraCuts[] v6
  const pendulumAmt = reducedMotion ? 0 : effects.pendulumSwing ?? 0;
  const midSwayBonus =
    scene3d?.audioMapping.midTarget === "camera_sway"
      ? 1 + audio.midEnvelope * 0.85
      : 1;

  let modeYaw = 0;
  let modePitch = 0;
  let modeDistFactor = 1;
  let cutFovOverride: number | undefined;
  if (scene3d) {
    let activeRig = scene3d.camera.rig;
    // Multi-Caméras & Cuts Rythmiques v6 (`cameraCuts[]`)
    if (!reducedMotion && scene3d.cameraCuts && scene3d.cameraCuts.length > 0) {
      const cuts = scene3d.cameraCuts;
      const barFloat = beatFloat / 4;
      let activeCut = cuts[0];
      for (let cIdx = 0; cIdx < cuts.length; cIdx++) {
        const cut = cuts[cIdx];
        if (cut.onPeakBand === "snare" && audio.transientPulse > 0.36) {
          activeCut = cut;
          break;
        }
        if (cut.onPeakBand === "kick" && audio.bassEnvelope > 0.58) {
          activeCut = cut;
          break;
        }
        if (cut.onPeakBand === "bass" && audio.bassEnvelope > 0.45) {
          activeCut = cut;
        }
        if (cut.switchEveryBars && cut.switchEveryBars > 0) {
          const slot = Math.floor(barFloat / cut.switchEveryBars) % cuts.length;
          activeCut = cuts[slot];
        }
      }
      activeRig = activeCut.rig;
      cutFovOverride = activeCut.fov;
    }

    switch (scene3d.camera.mode) {
      case "chase_low":
        modePitch = -0.06;
        modeDistFactor = 0.88;
        break;
      case "orbit":
        modeYaw = reducedMotion ? 0.25 : Math.sin(input.timeSeconds * 0.65) * 0.48;
        modePitch = 0.14;
        modeDistFactor = 1.02;
        break;
      case "fps_arms":
        modePitch = 0.02;
        modeDistFactor = 0.74;
        break;
      case "dramatic_tilt":
        modeYaw = reducedMotion ? -0.22 : Math.cos(input.timeSeconds * 0.75) * 0.34;
        modePitch = 0.24;
        modeDistFactor = 0.94;
        break;
    }

    if (!reducedMotion && activeRig) {
      switch (activeRig) {
        case "orbit_smooth":
          modeYaw = Math.sin(input.timeSeconds * 0.55) * 0.95;
          modePitch = 0.14 + Math.sin(input.timeSeconds * 0.32) * 0.09;
          modeDistFactor = 1.04;
          break;
        case "dolly_zoom_on_kick": {
          const kickD = audio.bassEnvelope * 0.45 + audio.transientPulse * 0.35;
          modeDistFactor = 0.85 + kickD * 0.45;
          modePitch = 0.06;
          break;
        }
        case "first_person_fly":
          modeYaw = Math.sin(input.timeSeconds * 0.72) * 0.24;
          modePitch = -0.04 + Math.cos(input.timeSeconds * 0.88) * 0.07;
          modeDistFactor = 0.72;
          break;
        case "top_down_spin":
          modeYaw = input.timeSeconds * 0.45;
          modePitch = 0.78;
          modeDistFactor = 1.12;
          break;
        case "handheld_shake":
          modeYaw = Math.sin(input.timeSeconds * 2.1) * 0.14 + Math.sin(input.timeSeconds * 11) * 0.03;
          modePitch = Math.cos(input.timeSeconds * 1.7) * 0.11 + Math.cos(input.timeSeconds * 13) * 0.025;
          modeDistFactor = 0.92;
          break;
      }
    }

    if (!reducedMotion && scene3d.camera.beatCut) {
      const beatSlot = Math.floor(
        input.bpmConfig ? (input.timeSeconds * input.bpmConfig.bpm) / 60 : input.timeSeconds * 2
      );
      const cutAngles = [0, 0.55, -0.62, 0.28, -0.38, 0.85];
      modeYaw = cutAngles[Math.abs(beatSlot) % cutAngles.length];
      modePitch += (beatSlot % 3 - 1) * 0.12;
    }
  }

  const shakeMul =
    !reducedMotion && scene3d
      ? scene3d.camera.shakeIntensity *
        (scene3d.audioMapping.fluxTarget === "camera_shake"
          ? audio.transientPulse * 1.45 + audio.bassEnvelope * 0.45
          : audio.transientPulse * 0.65)
      : 0;
  const shakeYaw = Math.sin(input.timeSeconds * 37) * 0.09 * shakeMul;
  const shakePitch = Math.cos(input.timeSeconds * 43) * 0.07 * shakeMul;

  const pendulumYaw =
    Math.sin(input.timeSeconds * 0.85) * 0.22 * pendulumAmt * midSwayBonus;
  const orthoCam =
    input.camera?.kind === "orthographic" ? input.camera : undefined;
  const perspCam =
    input.camera?.kind === "perspective" ? input.camera : undefined;
  const bassJumpZoom =
    !reducedMotion && scene3d?.audioMapping.bassTarget === "camera_zoom_and_jump"
      ? audio.bassEnvelope * 0.18
      : !reducedMotion
      ? audio.bassEnvelope * 0.08
      : 0;
  const fovKickBonus =
    !reducedMotion && scene3d?.audioMapping.fluxTarget === "fov_kick"
      ? audio.transientPulse * 0.18
      : 0;

  const autoZoom = resolveAutomationOverride(
    scene3d?.automations,
    "zoom",
    undefined,
    sceneProgress
  );
  const baseUnifiedZoom = orthoCam
    ? Math.max(0.5, Math.min(2.5, orthoCam.zoom))
    : perspCam
    ? Math.max(0.5, Math.min(2.2, 1 / Math.max(0.45, perspCam.distance)))
    : 1;
  const unifiedZoom =
    autoZoom !== undefined
      ? Math.max(0.45, Math.min(2.6, baseUnifiedZoom * autoZoom))
      : baseUnifiedZoom;

  const frameExprCtx = {
    t: input.timeSeconds,
    beat: beatPhase,
    i: 0,
    bass: clamp01(audio.bassEnvelope),
    mid: clamp01(audio.midEnvelope),
    treble: clamp01(audio.trebleEnvelope),
    flux: clamp01(audio.transientPulse),
    rms: clamp01(audio.rmsEnvelope),
    seed: ((scene3d?.seed ?? 1) % 1000) / 1000,
    count: 1,
    u: 0,
    params: scene3d?.params,
  };
  let triggerFovBoost = 0;
  if (scene3d?.triggers?.length) {
    for (const trig of scene3d.triggers) {
      if (trig.action === "boost_fov" && evaluateMathExpression(trig.when, frameExprCtx, 0) > 0.5) {
        triggerFovBoost += Math.max(0, Math.min(2, trig.intensity ?? 1)) * 12;
      }
    }
  }
  const autoFov = resolveAutomationOverride(
    scene3d?.automations,
    "fov",
    undefined,
    sceneProgress
  );
  const defaultSceneFov = cutFovOverride ?? autoFov ?? scene3d?.camera.fov ?? 75;
  const sceneFovAnim = scene3d?.animations?.find((a) => a.target === "fov");
  const baseAnimFov = sceneFovAnim
    ? evaluateMathExpression(
        sceneFovAnim.expr,
        frameExprCtx,
        defaultSceneFov
      )
    : defaultSceneFov;
  const animatedFov = Math.max(40, Math.min(115, baseAnimFov + triggerFovBoost));
  const cfgFovFactor = scene3d ? animatedFov / 75 : 1;

  const camOff: PerspectiveOffsets = {
    yawRad:
      ((perspCam?.yawDegrees ?? 0) * Math.PI) / 180 +
      pendulumYaw +
      modeYaw +
      shakeYaw,
    pitchRad:
      ((perspCam?.pitchDegrees ?? 0) * Math.PI) / 180 +
      modePitch +
      shakePitch,
    distMul: perspCam
      ? Math.max(
          0.38,
          Math.min(
            2.4,
            (perspCam.distance * modeDistFactor) / (1 + bassJumpZoom * 1.35)
          )
        )
      : Math.max(
          0.38,
          Math.min(
            2.4,
            modeDistFactor / (unifiedZoom * (1 + bassJumpZoom * 1.35))
          )
        ),
    fovMul: perspCam
      ? Math.max(
          0.55,
          Math.min(
            1.7,
            (perspCam.fovDegrees / 70) *
              cfgFovFactor *
              (1 + bassJumpZoom + fovKickBonus)
          )
        )
      : cfgFovFactor * (1 + bassJumpZoom + fovKickBonus),
  };

  let cachedStageOffscreen: HTMLCanvasElement | null = null;
  function getStageOffscreenContext(): {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
  } | null {
    if (typeof document === "undefined") return null;
    if (!cachedStageOffscreen) {
      cachedStageOffscreen = document.createElement("canvas");
      cachedStageOffscreen.width = STUDY_SIZE.width;
      cachedStageOffscreen.height = STUDY_SIZE.height;
    }
    const octx = cachedStageOffscreen.getContext("2d");
    if (!octx) return null;
    return { canvas: cachedStageOffscreen, ctx: octx };
  }

  // terrainSpeed (défaut 12.0) multiplié par l'intensité Master et le boost basse éventuel
  const intensitySpeedMul = 0.55 + clamp01(input.intensity ?? 0.75) * 0.65;
  const tunnelBassBoost =
    scene3d?.audioMapping.bassTarget === "tunnel_boost"
      ? 1 + audio.bassEnvelope * 0.35
      : 1;
  const speedMul = scene3d
    ? (scene3d.environment.terrainSpeed / 12.0) *
      intensitySpeedMul *
      tunnelBassBoost
    : 1;
  const effectiveTime = input.timeSeconds * speedMul;
  const frameIndex = Math.round(effectiveTime * STUDY_FPS);
  const seed = (input.seed ?? 1) >>> 0;
  const aspectSpec = VIDEO_ASPECT_FORMATS[input.aspectRatio ?? "16:9"];
  const logicalW = aspectSpec.width;
  const logicalH = aspectSpec.height;
  const canvasW = ctx.canvas?.width || logicalW;
  const canvasH = ctx.canvas?.height || logicalH;
  const scaleX = canvasW / Math.max(1, logicalW);
  const scaleY = canvasH / Math.max(1, logicalH);
  const targetW = logicalW;
  const targetH = logicalH;
  const isCustomAspect =
    targetW !== STUDY_SIZE.width || targetH !== STUDY_SIZE.height;
  const offscreen = isCustomAspect ? getStageOffscreenContext() : null;
  const sceneCtx = offscreen ? offscreen.ctx : ctx;
  const isV4OrV5RichScene = Boolean(
    scene3d?.actors?.length ||
      scene3d?.environment?.lightingPreset ||
      scene3d?.environment?.backdropType ||
      scene3d?.cartoonPhysics ||
      (scene3d?.renderStyle?.resolutionScale ?? 0) >= 0.85
  );

  sceneCtx.save();
  sceneCtx.resetTransform();
  if (!offscreen && (scaleX !== 1 || scaleY !== 1)) {
    sceneCtx.scale(scaleX, scaleY);
  }
  sceneCtx.globalAlpha = 1;
  sceneCtx.globalCompositeOperation = "source-over";
  sceneCtx.imageSmoothingEnabled = isV4OrV5RichScene;
  if (isV4OrV5RichScene && "imageSmoothingQuality" in sceneCtx) {
    sceneCtx.imageSmoothingQuality = "high";
  }

  if (descriptor.style === "pixel-16") {
    const pendulumPanX =
      Math.sin(effectiveTime * 0.85) * 10 * pendulumAmt * midSwayBonus;
    const zoom = Math.max(
      0.5,
      Math.min(
        2.5,
        (unifiedZoom / Math.max(0.5, modeDistFactor)) * (1 + bassJumpZoom)
      )
    );
    const camX = orthoCam?.x ?? 0;
    const camY = orthoCam?.y ?? 0;
    if (zoom !== 1 || camX !== 0 || camY !== 0 || pendulumPanX !== 0) {
      sceneCtx.fillStyle = palette.shadow;
      sceneCtx.fillRect(0, 0, STUDY_SIZE.width, STUDY_SIZE.height);
      sceneCtx.translate(160 - (camX + pendulumPanX), 90 - camY);
      sceneCtx.scale(zoom, zoom);
      sceneCtx.translate(-160, -90);
    }
  }

  const sceneTools = createRasterTools(sceneCtx);

  let vertexCount = 0;
  let triangleCount = 0;

  if (scene3d) {
    const rawBackdrop: Anarchy3DBackdropLayer =
      scene3d.layers?.find(
        (
          l
        ): l is Extract<
          NonNullable<Anarchy3DScene["layers"]>[number],
          { kind: "backdrop" }
        > => l.kind === "backdrop"
      )?.backdrop ?? {
        skyGradient: [scene3d.environment.skyColor, scene3d.environment.fogColor],
        starfield: {
          enabled: true,
          density: 0.45,
          color: scene3d.environment.terrainPrimaryColor,
        },
      };
    const effectiveBackdrop: Anarchy3DBackdropLayer = {
      ...rawBackdrop,
      skyGradient: [
        colorTransition > 0.01 ? palette.sky : rawBackdrop.skyGradient[0],
        colorTransition > 0.01 ? palette.haze : rawBackdrop.skyGradient[1],
      ],
    };

    if (scene3d.environment.backdropType || scene3d.environment.lightingPreset) {
      drawV4EnvironmentLayer(
        sceneCtx,
        scene3d,
        audio,
        input.timeSeconds,
        STUDY_SIZE.width,
        STUDY_SIZE.height,
        scene3d.seed ?? seed,
        reducedMotion,
        prevScene3d,
        morphAlpha
      );
    } else {
      drawAnarchy3DBackdropLayer(
        sceneCtx,
        effectiveBackdrop,
        audio,
        input.timeSeconds,
        STUDY_SIZE.width,
        STUDY_SIZE.height,
        scene3d.seed ?? seed,
        reducedMotion
      );
    }

    const swoopCamOff: PerspectiveOffsets =
      input.transitionType === "camera_swoop" &&
      input.transitionProgress !== undefined &&
      input.transitionProgress < 1
        ? {
            ...camOff,
            yawRad: camOff.yawRad + (1 - clamp01(input.transitionProgress)) * 1.15,
            distMul: camOff.distMul * (1 + (1 - clamp01(input.transitionProgress)) * 0.45),
          }
        : camOff;

    const customPolys = buildAnarchy3DScenePolygons(
      scene3d,
      effectiveTime,
      audio,
      beatPhase
    );
    if (customPolys.length > 0) {
      const customCounts = renderLowPolyMesh(
        sceneTools,
        palette,
        customPolys,
        {
          yawRad: swoopCamOff.yawRad,
          pitchRad: 0.08 + swoopCamOff.pitchRad,
          distance: Math.max(2.4, 6.4 * swoopCamOff.distMul),
          fovScale: Math.round(188 * swoopCamOff.fovMul),
          targetY: 0,
        },
        effects,
        scene3d.renderStyle
      );
      vertexCount += customCounts.vertexCount;
      triangleCount += customCounts.triangleCount;
    }

    if (scene3d.actors && scene3d.actors.length > 0) {
      renderV4Actors(
        sceneCtx,
        scene3d,
        audio,
        effectiveTime,
        STUDY_SIZE.width,
        STUDY_SIZE.height,
        scene3d.seed ?? seed,
        reducedMotion,
        swoopCamOff,
        input.faderValues,
        beatPhase,
        prevScene3d,
        morphAlpha,
        sceneProgress,
        lfoValues
      );
    }

    if (scene3d.generators && scene3d.generators.length > 0) {
      drawAnarchy3DGeneratorsOverlay(
        sceneCtx,
        scene3d.generators,
        audio,
        effectiveTime,
        STUDY_SIZE.width,
        STUDY_SIZE.height,
        scene3d.seed ?? seed,
        reducedMotion
      );
    }

    const resScale = scene3d.renderStyle?.resolutionScale;
    if (resScale !== undefined && resScale < 0.72 && typeof document !== "undefined") {
      const lowW = Math.max(48, Math.round(STUDY_SIZE.width * Math.max(0.15, resScale)));
      const lowH = Math.max(27, Math.round(STUDY_SIZE.height * Math.max(0.15, resScale)));
      const tmp = document.createElement("canvas");
      tmp.width = lowW;
      tmp.height = lowH;
      const tctx = tmp.getContext("2d");
      if (tctx) {
        tctx.imageSmoothingEnabled = false;
        tctx.drawImage(sceneCtx.canvas, 0, 0, lowW, lowH);
        sceneCtx.save();
        sceneCtx.resetTransform();
        if (!offscreen && (scaleX !== 1 || scaleY !== 1)) {
          sceneCtx.scale(scaleX, scaleY);
        }
        sceneCtx.imageSmoothingEnabled = false;
        sceneCtx.drawImage(tmp, 0, 0, STUDY_SIZE.width, STUDY_SIZE.height);
        sceneCtx.restore();
      }
    }
  } else {
    switch (descriptor.id) {
      case "industrial-city":
        drawIndustrialCityScene(sceneTools, palette, frameIndex, audio, effects);
        break;
      case "digital-void":
        drawDigitalVoidScene(
          sceneTools,
          palette,
          frameIndex,
          audio,
          effects,
          seed
        );
        break;
      case "ps1-nightmare": {
        const counts = drawPs1NightmareScene(
          sceneTools,
          palette,
          effectiveTime,
          audio,
          effects,
          reducedMotion,
          camOff
        );
        vertexCount = counts.vertexCount;
        triangleCount = counts.triangleCount;
        break;
      }
      case "rave-dungeon": {
        const counts = drawRaveDungeonScene(
          sceneTools,
          palette,
          effectiveTime,
          audio,
          effects,
          reducedMotion,
          camOff
        );
        vertexCount = counts.vertexCount;
        triangleCount = counts.triangleCount;
        break;
      }
      case "techno-therapy": {
        const counts = drawTechnoTherapyScene(
          sceneTools,
          palette,
          effectiveTime,
          audio,
          effects,
          reducedMotion,
          camOff
        );
        vertexCount = counts.vertexCount;
        triangleCount = counts.triangleCount;
        break;
      }
    }
  }

  sceneCtx.resetTransform();
  if (!offscreen && (scaleX !== 1 || scaleY !== 1)) {
    sceneCtx.scale(scaleX, scaleY);
  }

  if ((effects.psychedelic ?? 0) > 0.01) {
    applyPsychedelicPass(
      sceneTools,
      palette,
      input.timeSeconds,
      audio,
      effects.psychedelic ?? 0,
      reducedMotion
    );
  }
  sceneCtx.restore();

  ctx.save();
  ctx.resetTransform();
  if (scaleX !== 1 || scaleY !== 1) {
    ctx.scale(scaleX, scaleY);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.imageSmoothingEnabled = isV4OrV5RichScene;
  if (isV4OrV5RichScene && "imageSmoothingQuality" in ctx) {
    ctx.imageSmoothingQuality = "high";
  }

  if (offscreen) {
    // Blit de la scène centrée avec zoom adapté à la largeur cible
    const scale = Math.max(targetW / STUDY_SIZE.width, 0.82);
    const drawW = Math.round(STUDY_SIZE.width * scale);
    const drawH = Math.round(STUDY_SIZE.height * scale);
    const dx = Math.floor((targetW - drawW) / 2);
    const dy = Math.floor((targetH - drawH) / 2);

    // Fond uniforme et continu accordé exactement aux couleurs de la scène active
    // (évite toute bande de couleur différente en bas en 9:16 TikTok / 4:5 / 1:1)
    const backdropLayer = scene3d?.layers?.find(
      (l): l is Extract<NonNullable<Anarchy3DScene["layers"]>[number], { kind: "backdrop" }> =>
        l.kind === "backdrop"
    )?.backdrop;
    const rawTop =
      colorTransition > 0.01 || !scene3d
        ? palette.sky
        : scene3d.environment.backdropColors?.[0] ??
          backdropLayer?.skyGradient?.[0] ??
          scene3d.environment.skyColor;
    const rawMid =
      colorTransition > 0.01 || !scene3d
        ? palette.haze
        : scene3d.environment.backdropColors?.[1] ??
          backdropLayer?.skyGradient?.[1] ??
          scene3d.environment.fogColor;
    const rawBottom = scene3d
      ? scene3d.environment.backdropColors?.[2] ??
        lerpHexColor(rawMid, "#000000", 0.58)
      : rawTop;

    const topStop = Math.max(0, Math.min(1, dy / Math.max(1, targetH)));
    const bottomStop = Math.max(topStop, Math.min(1, (dy + drawH) / Math.max(1, targetH)));

    const unifiedGrad = ctx.createLinearGradient(0, 0, 0, targetH);
    unifiedGrad.addColorStop(0, rawTop);
    unifiedGrad.addColorStop(topStop, rawTop);
    unifiedGrad.addColorStop(bottomStop, rawBottom);
    unifiedGrad.addColorStop(1, rawBottom);
    ctx.fillStyle = unifiedGrad;
    ctx.fillRect(0, 0, targetW, targetH);

    ctx.drawImage(offscreen.canvas, dx, dy, drawW, drawH);

    // Ré-exécuter les acteurs V4/V5/V6 directement en résolution HD sur le canvas principal
    if (scene3d && scene3d.actors && scene3d.actors.length > 0) {
      ctx.save();
      ctx.translate(dx, dy);
      ctx.scale(drawW / STUDY_SIZE.width, drawH / STUDY_SIZE.height);
      if (scene3d.environment.backdropType || scene3d.environment.lightingPreset) {
        drawV4EnvironmentLayer(
          ctx,
          scene3d,
          audio,
          input.timeSeconds,
          STUDY_SIZE.width,
          STUDY_SIZE.height,
          scene3d.seed ?? seed,
          reducedMotion,
          prevScene3d,
          morphAlpha
        );
      }
      renderV4Actors(
        ctx,
        scene3d,
        audio,
        effectiveTime,
        STUDY_SIZE.width,
        STUDY_SIZE.height,
        scene3d.seed ?? seed,
        reducedMotion,
        camOff,
        input.faderValues,
        beatPhase,
        prevScene3d,
        morphAlpha,
        sceneProgress,
        lfoValues
      );
      ctx.restore();
    }
  }

  const tools = createRasterTools(ctx);

  // Letterbox cinéma haut/bas adaptés à la résolution active
  tools.rect(0, 0, targetW, 6, palette.shadow);
  tools.rect(0, targetH - 6, targetW, 6, palette.shadow);

  if (input.lyrics?.enabled && input.lyrics.text.trim().length > 0) {
    drawLyricsOverlay(
      tools,
      palette,
      input.timeSeconds,
      audio,
      input.lyrics,
      reducedMotion,
      targetW,
      targetH
    );
  }

  applyOpenHubPostFx(
    ctx,
    effects,
    audio,
    input.timeSeconds,
    targetW,
    targetH,
    scene3d?.postFx
  );

  applyV4PostFxStack(
    ctx,
    scene3d?.postFX,
    scene3d?.renderStyle?.toneMapping,
    audio,
    input.timeSeconds,
    targetW,
    targetH,
    input.transitionType ?? scene3d?.transition,
    input.transitionProgress,
    scene3d?.cartoonPhysics,
    input.faderValues,
    prevScene3d?.postFX,
    morphAlpha
  );

  ctx.restore();

  return {
    sceneId: descriptor.id,
    paletteId: basePalette.id,
    timeSeconds: input.timeSeconds,
    audio,
    vertexCount,
    triangleCount,
  };
}


export function renderPresetFrame(
  ctx: CanvasRenderingContext2D,
  preset: RetroPresetConfig,
  timeSeconds: number,
  analysis?: AudioAnalysis,
  options?: {
    reducedMotion?: boolean;
    liveAudioOverride?: AudioFeatures;
  }
): SceneRenderReport {
  return renderSceneFrame(ctx, {
    sceneId: preset.sceneId,
    paletteId: preset.paletteId,
    timeSeconds,
    analysis,
    liveAudioOverride: options?.liveAudioOverride,
    intensity: preset.intensity,
    reducedMotion: options?.reducedMotion,
    effects: preset.effects,
    camera: preset.render.camera,
    seed: preset.seed,
  });
}

export function renderProjectFrame(
  ctx: CanvasRenderingContext2D,
  project: StudioProject,
  timeSeconds: number,
  analysis?: AudioAnalysis
): SceneRenderReport & { sequence: EvaluatedSequenceState } {
  const sequence = project.sequenceEnabled
    ? evaluateSequenceAt(
        project.segments,
        project.activePreset,
        project.automations,
        timeSeconds
      )
    : {
        activePreset: project.activePreset,
        dissolveFactor: 0,
        segmentIndex: 0,
      };
  const report = renderPresetFrame(
    ctx,
    sequence.activePreset,
    timeSeconds,
    analysis,
    { reducedMotion: project.reducedMotion }
  );
  return { ...report, sequence };
}

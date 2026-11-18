import { getAudioFeaturesAt } from "./audioAnalysis";
import type {
  Anarchy3DBackdropLayer,
  Anarchy3DPostFx,
  Anarchy3DScene,
  Anarchy3DSidePropsLayer,
  Anarchy3DSubject,
  Anarchy3DTerrainLayer,
  AnarchyProceduralPart,
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
  effects: RetroEffects
): { vertexCount: number; triangleCount: number } {
  const { rect, line, bayer } = tools;
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
    const foggedTone = tri.tone * (1 - fogFactor * 0.65) + 0.25 * fogFactor;
    const scaledTone = clamp01(foggedTone) * (paletteRamp.length - 1);
    const baseIdx = Math.floor(scaledTone);
    const frac = scaledTone - baseIdx;

    const customPrimaryFill = tri.fillColor
      ? lerpHexColor(
          tri.tone < 0.7
            ? lerpHexColor(p.shadow, tri.fillColor, clamp01(tri.tone * 1.35))
            : lerpHexColor(tri.fillColor, p.light, clamp01((tri.tone - 0.7) * 1.6)),
          p.haze,
          fogFactor * 0.78
        )
      : undefined;
    const customAltFill =
      customPrimaryFill && tri.checker
        ? lerpHexColor(customPrimaryFill, p.shadow, 0.26)
        : customPrimaryFill;

    for (let y = minY; y <= maxY; y += 2) {
      const xa = edgeInterp(a.sy, a.sx, c.sy, c.sx, y);
      const xb =
        y < b.sy
          ? edgeInterp(a.sy, a.sx, b.sy, b.sx, y)
          : edgeInterp(b.sy, b.sx, c.sy, c.sx, y);
      const xStart = Math.max(0, Math.min(318, Math.round(Math.min(xa, xb))));
      const xEnd = Math.max(0, Math.min(320, Math.round(Math.max(xa, xb))));
      if (xEnd <= xStart) continue;

      if (!effects.affineTextures && !tri.checker && effects.dither < 0.15) {
        rect(
          xStart,
          y,
          xEnd - xStart,
          2,
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

    if (tri.wireRim) {
      const rimCol = tri.wireColor ?? p.glow;
      line(tri.v0.sx, tri.v0.sy, tri.v1.sx, tri.v1.sy, rimCol);
      line(tri.v1.sx, tri.v1.sy, tri.v2.sx, tri.v2.sy, rimCol);
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
    applyKaleidoscopePass(ctx, kaleido, width, height);
  }

  const splitNorm = clamp01(
    Math.max(effects.anaglyphSplit ?? 0, postFx?.chromaticAberration ?? 0)
  );
  if (splitNorm > 0.02) {
    const offsetPx = Math.max(
      1,
      Math.round(splitNorm * (3 + audio.transientPulse * 4))
    );
    const imgData = ctx.getImageData(0, 0, width, height);
    const src = new Uint8ClampedArray(imgData.data);
    const dst = imgData.data;
    const w = width;
    const h = height;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const leftX = Math.max(0, x - offsetPx);
        const rightX = Math.min(w - 1, x + offsetPx);
        dst[idx] = Math.max(dst[idx], src[(y * w + leftX) * 4]);
        dst[idx + 2] = Math.max(dst[idx + 2], src[(y * w + rightX) * 4 + 2]);
      }
    }
    ctx.putImageData(imgData, 0, 0);
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
  audio: SceneAudioState
): Poly3D[] {
  const polygons: Poly3D[] = [];
  const { environment: env, subject: sub, camera: cam, audioMapping: map } = scene;
  const MAX_POLYS = 260;

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

  const emissiveBoost =
    map.fluxTarget === "glitch_and_emissive" ? audio.transientPulse * 0.25 : 0;
  const wireGlowActive =
    sub.wireframeOverlay ||
    (map.trebleTarget === "wireframe_glow" && audio.trebleEnvelope > 0.22) ||
    audio.transientPulse > 0.35;

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
    baseRotY: number
  ) => {
    const px = cx + part.position[0] * parentScale;
    const py = cy + part.position[1] * parentScale;
    const pz = cz + part.position[2] * parentScale;
    const sx = part.scale[0] * parentScale;
    const sy = part.scale[1] * parentScale;
    const sz = part.scale[2] * parentScale;
    const rx = part.rotation[0];
    const ry = part.rotation[1] + baseRotY;
    const rz = part.rotation[2];
    const fill = part.color;
    const wire = part.emissive ? "#FFFFFF" : parentAccent;
    const tone = part.emissive ? 0.96 : 0.78;
    const wireRim = part.wireframe ?? true;

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
  };

  // 1. TERRAIN 3D DATA-DRIVEN (terrainLayer.type)
  const waveAmp =
    map.midTarget === "terrain_wave_height"
      ? 0.25 + audio.midEnvelope * 0.85
      : 0.15 + audio.midEnvelope * 0.25;
  const scrollZ = (timeSeconds * 2.4) % 2.4;

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

  // 2. DÉCORS LATÉRAUX PROCÉDURAUX (sidePropsLayer)
  if (sidePropsLayer.type !== "none" && sidePropsLayer.density > 0.05) {
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
    map.midTarget === "subject_rotation"
      ? 1.8 + audio.midEnvelope * 2.4
      : 0.95;
  const subRotY = timeSeconds * rotSpeed;
  const jumpY =
    map.bassTarget === "camera_zoom_and_jump"
      ? audio.bassEnvelope * 0.75
      : Math.sin(timeSeconds * 2.4) * 0.15;

  for (let sIdx = 0; sIdx < subjectsList.length; sIdx++) {
    const curSub = subjectsList[sIdx];
    const sc = curSub.scale * subjectPulse;
    const offX = curSub.position?.[0] ?? 0;
    const offY = curSub.position?.[1] ?? 0;
    const offZ = curSub.position?.[2] ?? 0;
    const baseRotY = curSub.rotation?.[1] ?? 0;
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
            baseRotY + (sIdx > 0 ? subRotY * 0.5 : Math.sin(timeSeconds * 0.9) * 0.12)
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
    artisticBasePalette = {
      ...basePalette,
      sky: env.skyColor,
      haze: env.fogColor,
      distant: lerpHexColor(env.fogColor, env.terrainPrimaryColor, 0.35),
      structure: env.terrainPrimaryColor,
      reflection: env.terrainSecondaryColor,
      face: sub.primaryColor,
      glow: sub.accentColor,
      light: lerpHexColor(sub.accentColor, "#FFFFFF", 0.55),
      shadow: lerpHexColor(env.skyColor, "#000000", 0.65),
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

  // Le fader fog agit comme multiplicateur de fogDensity du JSON (ex: 0.045 * 10 ≈ 0.45)
  const jsonFogNormalized = scene3d
    ? clamp01(scene3d.environment.fogDensity * 10)
    : DEFAULT_RETRO_EFFECTS.fog;
  const faderFogMul =
    (input.effects?.fog ?? DEFAULT_RETRO_EFFECTS.fog) /
    Math.max(0.1, DEFAULT_RETRO_EFFECTS.fog);

  const fluxGlitchBoost =
    scene3d?.audioMapping.fluxTarget === "glitch_and_emissive"
      ? audio.transientPulse * 0.22
      : 0;

  const effects: RetroEffects = {
    dither: clamp01(input.effects?.dither ?? DEFAULT_RETRO_EFFECTS.dither),
    fog: clamp01(jsonFogNormalized * faderFogMul),
    grain: clamp01(
      (input.effects?.grain ?? DEFAULT_RETRO_EFFECTS.grain) + fluxGlitchBoost
    ),
    vertexSnap:
      Boolean(input.effects?.vertexSnap ?? DEFAULT_RETRO_EFFECTS.vertexSnap) ||
      (scene3d?.postFx?.ps1VertexJitter ?? 0) > 0.12,
    affineTextures:
      input.effects?.affineTextures ?? DEFAULT_RETRO_EFFECTS.affineTextures,
    psychedelic: clamp01(input.effects?.psychedelic ?? 0),
    colorTransition,
    targetPaletteId: input.effects?.targetPaletteId,
    kickBlackout: kickBlackoutStrength,
    anaglyphSplit: clamp01(
      (input.effects?.anaglyphSplit ?? 0.16) + fluxGlitchBoost * 0.5
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

  // Paramètres caméra unifiés : JSON camera (mode, fov, shakeIntensity) × Multiplicateurs Faders
  const pendulumAmt = reducedMotion ? 0 : effects.pendulumSwing ?? 0;
  const midSwayBonus =
    scene3d?.audioMapping.midTarget === "camera_sway"
      ? 1 + audio.midEnvelope * 0.85
      : 1;

  let modeYaw = 0;
  let modePitch = 0;
  let modeDistFactor = 1;
  if (scene3d) {
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

  const unifiedZoom = orthoCam
    ? Math.max(0.5, Math.min(2.5, orthoCam.zoom))
    : perspCam
    ? Math.max(0.5, Math.min(2.2, 1 / Math.max(0.45, perspCam.distance)))
    : 1;

  const cfgFovFactor = scene3d ? scene3d.camera.fov / 75 : 1;

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
  const targetW = aspectSpec.width;
  const targetH = aspectSpec.height;
  const isCustomAspect =
    targetW !== STUDY_SIZE.width || targetH !== STUDY_SIZE.height;
  const offscreen = isCustomAspect ? getStageOffscreenContext() : null;
  const sceneCtx = offscreen ? offscreen.ctx : ctx;

  sceneCtx.save();
  sceneCtx.resetTransform();
  sceneCtx.globalAlpha = 1;
  sceneCtx.globalCompositeOperation = "source-over";
  sceneCtx.imageSmoothingEnabled = false;

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

    const customPolys = buildAnarchy3DScenePolygons(
      scene3d,
      effectiveTime,
      audio
    );
    if (customPolys.length > 0) {
      const customCounts = renderLowPolyMesh(
        sceneTools,
        palette,
        customPolys,
        {
          yawRad: camOff.yawRad,
          pitchRad: 0.08 + camOff.pitchRad,
          distance: Math.max(2.4, 6.4 * camOff.distMul),
          fovScale: Math.round(188 * camOff.fovMul),
          targetY: 0,
        },
        effects
      );
      vertexCount += customCounts.vertexCount;
      triangleCount += customCounts.triangleCount;
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
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.imageSmoothingEnabled = false;

  if (offscreen) {
    // Extension atmosphérique verticale/carrée (ciel + halo + reflets sol)
    const halfH = Math.floor(targetH * 0.5);
    const skyGrad = ctx.createLinearGradient(0, 0, 0, halfH);
    skyGrad.addColorStop(0, palette.sky);
    skyGrad.addColorStop(1, palette.haze);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, targetW, halfH);

    const floorGrad = ctx.createLinearGradient(0, halfH, 0, targetH);
    floorGrad.addColorStop(0, palette.reflection);
    floorGrad.addColorStop(0.35, palette.structure);
    floorGrad.addColorStop(1, palette.shadow);
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, halfH, targetW, targetH - halfH);

    // Lignes d'horizon réactives au kick/basse dans les bandes haut/bas
    const barW = Math.round(targetW * (0.45 + audio.bassEnvelope * 0.45));
    const barX = Math.floor((targetW - barW) / 2);
    ctx.fillStyle = palette.glow;
    ctx.fillRect(barX, Math.floor(targetH * 0.14), barW, 1);
    ctx.fillStyle = palette.light;
    ctx.fillRect(barX, Math.floor(targetH * 0.86), barW, 1);

    // Blit de la scène 320x180 centrée avec zoom adapté à la largeur cible
    const scale = Math.max(targetW / STUDY_SIZE.width, 0.82);
    const drawW = Math.round(STUDY_SIZE.width * scale);
    const drawH = Math.round(STUDY_SIZE.height * scale);
    const dx = Math.floor((targetW - drawW) / 2);
    const dy = Math.floor((targetH - drawH) / 2);
    ctx.drawImage(offscreen.canvas, dx, dy, drawW, drawH);
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

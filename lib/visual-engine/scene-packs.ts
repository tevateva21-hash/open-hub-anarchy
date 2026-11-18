import type {
  Anarchy3DAudioMapping,
  Anarchy3DCamera,
  Anarchy3DEnvironment,
  Anarchy3DPack,
  Anarchy3DScene,
  Anarchy3DSubject,
  AnarchyBassTarget,
  AnarchyCameraMode,
  AnarchyFluxTarget,
  AnarchyMidTarget,
  AnarchySubjectMeshType,
  AnarchyTerrainType,
  AnarchyTrebleTarget,
  PaletteId,
  SceneId,
} from "@/lib/visual-engine/contracts";
import { PALETTE_IDS, SCENE_IDS } from "@/lib/visual-engine/presets";

export type {
  Anarchy3DPack,
  Anarchy3DScene,
  Anarchy3DEnvironment,
  Anarchy3DSubject,
  Anarchy3DCamera,
  Anarchy3DAudioMapping,
};

export type ScenePackSlot = Anarchy3DScene;
export type ScenePack = Anarchy3DPack;

export const ANARCHY_TERRAIN_TYPES: readonly {
  value: AnarchyTerrainType;
  label: string;
  desc: string;
}[] = [
  {
    value: "infinite_grid",
    label: "infinite_grid (Grille Perspective Infinie)",
    desc: "Dallage cybernétique 3D en perspective infinie avec lignes d'horizon réactives.",
  },
  {
    value: "lowpoly_mountains",
    label: "lowpoly_mountains (Montagnes Low-Poly PS2)",
    desc: "Crêtes et canyons low-poly 3D défilant sur les flancs gauche et droit.",
  },
  {
    value: "dojo_pillars",
    label: "dojo_pillars (Piliers & Arches Dojo Brutaliste)",
    desc: "Colonnes et portiques 3D monumentaux rythmant la profondeur Z.",
  },
  {
    value: "tunnel",
    label: "tunnel (Tunnel Octogonal 3D)",
    desc: "Anneaux octogonaux 3D concentriques propulsés vers la caméra.",
  },
];

export const ANARCHY_SUBJECT_MESH_TYPES: readonly {
  value: AnarchySubjectMeshType;
  label: string;
  desc: string;
}[] = [
  {
    value: "voxel_runner",
    label: "voxel_runner (Runner Cyber Low-Poly Articulé)",
    desc: "Personnage 3D articulé en course avec jambes, bras et ailes d'énergie.",
  },
  {
    value: "floating_monolith",
    label: "floating_monolith (Monolithe Brutaliste en Lévitation)",
    desc: "Obélisque 3D massif entouré de fragments orbitaux synchronisés.",
  },
  {
    value: "cyber_katana",
    label: "cyber_katana (Lames Katana Croisées & Noyau Shogun)",
    desc: "Lames 3D croisées et diamant central découpant l'espace sur les aigus.",
  },
  {
    value: "abstract_polyhedron",
    label: "abstract_polyhedron (Polyèdre Gyroscopique 3D)",
    desc: "Octaèdre 3D central imbriqué dans des anneaux gyroscopiques.",
  },
  {
    value: "none",
    label: "none (Aucun sujet central — Décor 3D pur)",
    desc: "Laisse toute la place au terrain 3D et au monde environnant.",
  },
];

export const ANARCHY_CAMERA_MODES: readonly {
  value: AnarchyCameraMode;
  label: string;
  desc: string;
}[] = [
  {
    value: "chase_low",
    label: "chase_low (Poursuite Basse Dynamique)",
    desc: "Caméra en contre-plongée derrière le sujet, idéale pour la vitesse.",
  },
  {
    value: "orbit",
    label: "orbit (Orbite Panoramique 360°)",
    desc: "Rotation orbitale fluide autour du sujet et du décor 3D.",
  },
  {
    value: "fps_arms",
    label: "fps_arms (Vue Première Personne + Bras/Lames 3D)",
    desc: "Immersion subjective avec bras/lames 3D cybernétiques au premier plan.",
  },
  {
    value: "dramatic_tilt",
    label: "dramatic_tilt (Angle Dramatique & Plongée)",
    desc: "Cadrage incliné nerveux à fort impact visuel sur les drops.",
  },
];

export const ANARCHY_BASS_TARGETS: readonly {
  value: AnarchyBassTarget;
  label: string;
}[] = [
  { value: "camera_zoom_and_jump", label: "camera_zoom_and_jump (Zoom & Saut Caméra)" },
  { value: "subject_pulse", label: "subject_pulse (Pulsation d'Échelle du Sujet 3D)" },
  { value: "pillar_slam", label: "pillar_slam (Impact & Élévation des Piliers/Sol)" },
  { value: "tunnel_boost", label: "tunnel_boost (Accélération Brutale du Décor)" },
];

export const ANARCHY_MID_TARGETS: readonly {
  value: AnarchyMidTarget;
  label: string;
}[] = [
  { value: "terrain_wave_height", label: "terrain_wave_height (Hauteur d'Onde du Terrain)" },
  { value: "subject_rotation", label: "subject_rotation (Vitesse de Rotation du Sujet)" },
  { value: "color_shift", label: "color_shift (Glissement Chromatique des Matériaux)" },
  { value: "camera_sway", label: "camera_sway (Balancement Latéral Caméra)" },
];

export const ANARCHY_TREBLE_TARGETS: readonly {
  value: AnarchyTrebleTarget;
  label: string;
}[] = [
  { value: "particles_burst", label: "particles_burst (Pluie d'Étincelles & Particules 3D)" },
  { value: "wireframe_glow", label: "wireframe_glow (Surbrillance des Arêtes 3D)" },
  { value: "sky_flash", label: "sky_flash (Éclair Atmosphérique Horizon/Ciel)" },
  { value: "katana_slash", label: "katana_slash (Faisceaux & Découpe Laser 3D)" },
];

export const ANARCHY_FLUX_TARGETS: readonly {
  value: AnarchyFluxTarget;
  label: string;
}[] = [
  { value: "glitch_and_emissive", label: "glitch_and_emissive (Flash Émissif & Glitch)" },
  { value: "camera_shake", label: "camera_shake (Secousse Caméra sur Transitoires)" },
  { value: "fov_kick", label: "fov_kick (Ouverture Focale FOV sur Clap/Kick)" },
  { value: "invert_strobe", label: "invert_strobe (Inversion Stroboscopique)" },
];

const TERRAIN_SET = new Set<AnarchyTerrainType>(
  ANARCHY_TERRAIN_TYPES.map((t) => t.value)
);
const SUBJECT_SET = new Set<AnarchySubjectMeshType>(
  ANARCHY_SUBJECT_MESH_TYPES.map((s) => s.value)
);
const CAMERA_MODE_SET = new Set<AnarchyCameraMode>(
  ANARCHY_CAMERA_MODES.map((c) => c.value)
);
const BASS_TARGET_SET = new Set<AnarchyBassTarget>(
  ANARCHY_BASS_TARGETS.map((b) => b.value)
);
const MID_TARGET_SET = new Set<AnarchyMidTarget>(
  ANARCHY_MID_TARGETS.map((m) => m.value)
);
const TREBLE_TARGET_SET = new Set<AnarchyTrebleTarget>(
  ANARCHY_TREBLE_TARGETS.map((t) => t.value)
);
const FLUX_TARGET_SET = new Set<AnarchyFluxTarget>(
  ANARCHY_FLUX_TARGETS.map((f) => f.value)
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
  if (terrainType === "tunnel") return "techno-therapy";
  if (terrainType === "lowpoly_mountains") {
    return meshType === "floating_monolith" ? "ps1-nightmare" : "industrial-city";
  }
  if (meshType === "floating_monolith" || meshType === "cyber_katana") {
    return "ps1-nightmare";
  }
  if (meshType === "abstract_polyhedron") return "techno-therapy";
  return "digital-void";
}

export function createDefaultAnarchy3DScene(
  index = 0,
  overrides?: {
    id?: string;
    name?: string;
    environment?: Partial<Anarchy3DEnvironment>;
    subject?: Partial<Anarchy3DSubject>;
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

  const sceneId =
    overrides?.sceneId ??
    inferSceneIdFromAnarchy3DScene(environment.terrainType, subject.meshType);

  return {
    id: overrides?.id ?? `scene-${index + 1}`,
    name: overrides?.name ?? `0${index + 1}. Scène 3D`,
    environment,
    subject,
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

/**
 * Nettoie et valide une scène 3D JSON (`Anarchy3DScene`) avec valeurs de repli (fallbacks) sécurisées.
 * Zéro exécution de code dynamique arbitraire.
 */
export function sanitizeAnarchy3DScene(
  raw: unknown,
  idx = 0
): Anarchy3DScene {
  const fallback = createDefaultAnarchy3DScene(idx);
  if (!raw || typeof raw !== "object") return fallback;

  const item = raw as Record<string, unknown>;
  const rawEnv =
    item.environment && typeof item.environment === "object"
      ? (item.environment as Record<string, unknown>)
      : {};
  const rawSub =
    item.subject && typeof item.subject === "object"
      ? (item.subject as Record<string, unknown>)
      : {};
  const rawCam =
    item.camera && typeof item.camera === "object"
      ? (item.camera as Record<string, unknown>)
      : {};
  const rawAudio =
    item.audioMapping && typeof item.audioMapping === "object"
      ? (item.audioMapping as Record<string, unknown>)
      : {};

  const terrainType: AnarchyTerrainType = TERRAIN_SET.has(
    rawEnv.terrainType as AnarchyTerrainType
  )
    ? (rawEnv.terrainType as AnarchyTerrainType)
    : fallback.environment.terrainType;

  const meshType: AnarchySubjectMeshType = SUBJECT_SET.has(
    rawSub.meshType as AnarchySubjectMeshType
  )
    ? (rawSub.meshType as AnarchySubjectMeshType)
    : fallback.subject.meshType;

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

  const environment: Anarchy3DEnvironment = {
    skyColor: sanitizeHexColor(rawEnv.skyColor, fallback.environment.skyColor),
    fogColor: sanitizeHexColor(rawEnv.fogColor, fallback.environment.fogColor),
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
        rawEnv.terrainSpeed,
        0.5,
        40,
        fallback.environment.terrainSpeed
      ).toFixed(2)
    ),
    terrainPrimaryColor: sanitizeHexColor(
      rawEnv.terrainPrimaryColor,
      fallback.environment.terrainPrimaryColor
    ),
    terrainSecondaryColor: sanitizeHexColor(
      rawEnv.terrainSecondaryColor,
      fallback.environment.terrainSecondaryColor
    ),
  };

  const subject: Anarchy3DSubject = {
    meshType,
    primaryColor: sanitizeHexColor(
      rawSub.primaryColor,
      fallback.subject.primaryColor
    ),
    accentColor: sanitizeHexColor(
      rawSub.accentColor,
      fallback.subject.accentColor
    ),
    wireframeOverlay:
      typeof rawSub.wireframeOverlay === "boolean"
        ? rawSub.wireframeOverlay
        : fallback.subject.wireframeOverlay,
    scale: Number(
      clampNum(rawSub.scale, 0.25, 3.0, fallback.subject.scale).toFixed(2)
    ),
  };

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

  const inferredSceneId = inferSceneIdFromAnarchy3DScene(terrainType, meshType);
  const rawName =
    typeof item.name === "string" && item.name.trim()
      ? item.name.trim()
      : typeof item.label === "string" && item.label.trim()
      ? item.label.trim()
      : `0${idx + 1}. Scène 3D`;

  return {
    id:
      typeof item.id === "string" && item.id.trim()
        ? item.id.trim()
        : `scene-${idx + 1}`,
    name: rawName,
    environment,
    subject,
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
  const rawScenes = Array.isArray(parsed)
    ? parsed
    : Array.isArray(obj.scenes)
    ? obj.scenes
    : obj.environment || obj.subject || obj.camera
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
    }
    return sanitizeAnarchy3DScene(rawSc, idx);
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
 * Exporte un Pack 3D au format JSON strict `Anarchy3DPack` ("Cartouche / Pack 3D").
 */
export function exportScenePackAsJson(pack: Anarchy3DPack): string {
  const cleanExport = {
    packId: pack.packId,
    name: pack.name,
    author: pack.author,
    scenes: pack.scenes.map((sc, idx) => ({
      id: sc.id || `scene-${idx + 1}`,
      name: sc.name || `0${idx + 1}. Scène 3D`,
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
      },
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

export const AI_SCENE_PACK_PROMPT = `Tu es un directeur artistique 3D temps réel pour Open Hub // Anarchy Visual Studio.
Génère une "Cartouche / Pack 3D" au format JSON strict (Anarchy3DPack) contenant un nombre libre de scènes 3D profondes (ex: 5 scènes).

IMPORTANT — RÈGLES STRICTES :
1. Réponds UNIQUEMENT avec un bloc JSON valide (aucun code JS/C++, aucune fonction).
2. Utilise exclusivement les valeurs autorisées ci-dessous :
   - environment.terrainType : "infinite_grid" | "lowpoly_mountains" | "dojo_pillars" | "tunnel"
   - subject.meshType : "voxel_runner" | "floating_monolith" | "cyber_katana" | "abstract_polyhedron" | "none"
   - camera.mode : "chase_low" | "orbit" | "fps_arms" | "dramatic_tilt"
   - audioMapping.bassTarget : "camera_zoom_and_jump" | "subject_pulse" | "pillar_slam" | "tunnel_boost"
   - audioMapping.midTarget : "terrain_wave_height" | "subject_rotation" | "color_shift" | "camera_sway"
   - audioMapping.trebleTarget : "particles_burst" | "wireframe_glow" | "sky_flash" | "katana_slash"
   - audioMapping.fluxTarget : "glitch_and_emissive" | "camera_shake" | "fov_kick" | "invert_strobe"
3. Toutes les couleurs doivent être au format hexadécimal "#RRGGBB".

Schéma JSON exact attendu :
{
  "packId": "ps2-nether-runner-v1",
  "name": "PS2 // Nether & Brutalist Runner",
  "author": "Anarchy Studio",
  "scenes": [
    {
      "id": "scene-1",
      "name": "01. Cyber Corridor",
      "environment": {
        "skyColor": "#060A12",
        "fogColor": "#060A12",
        "fogDensity": 0.045,
        "terrainType": "infinite_grid",
        "terrainSpeed": 12.0,
        "terrainPrimaryColor": "#00F0FF",
        "terrainSecondaryColor": "#FF0055"
      },
      "subject": {
        "meshType": "voxel_runner",
        "primaryColor": "#00838F",
        "accentColor": "#FF0055",
        "wireframeOverlay": true,
        "scale": 1.0
      },
      "camera": {
        "mode": "chase_low",
        "fov": 75,
        "shakeIntensity": 0.4
      },
      "audioMapping": {
        "bassTarget": "camera_zoom_and_jump",
        "midTarget": "terrain_wave_height",
        "trebleTarget": "particles_burst",
        "fluxTarget": "glitch_and_emissive"
      }
    }
  ]
}`;

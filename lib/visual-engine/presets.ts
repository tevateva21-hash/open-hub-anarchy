import {
  PRESET_SCHEMA_VERSION,
  PROJECT_SCHEMA_VERSION,
  RANDOMIZER_VERSION,
  type AutomatableParameter,
  type AutomationCurve,
  type CompatibilityRule,
  type OrthographicCameraSettings,
  type PaletteId,
  type PerspectiveCameraSettings,
  type PresetParameterPath,
  type RandomizeRequest,
  type RenderStyle,
  type RetroEffects,
  type RetroPresetConfig,
  type RetroPresetDefinition,
  type RetroRenderSettings,
  type SceneId,
  type SequenceSegment,
  type StudioProject,
} from "./contracts";

export const ENGINE_VERSION = "2.0.0";
export const STUDY_SIZE = { width: 320, height: 180 } as const;

export const DEFAULT_RETRO_EFFECTS: RetroEffects = {
  dither: 0.65,
  fog: 0.55,
  grain: 0.35,
  vertexSnap: true,
  affineTextures: true,
  psychedelic: 0,
  colorTransition: 0,
  kickBlackout: 0,
  anaglyphSplit: 0.16,
  strobeGlow: 0.25,
  pendulumSwing: 0.25,
};

export const SCENE_IDS: readonly SceneId[] = [
  "industrial-city",
  "ps1-nightmare",
  "rave-dungeon",
  "digital-void",
  "techno-therapy",
];

export const PALETTE_IDS: readonly PaletteId[] = [
  "furnace-amber",
  "toxic-oxide",
  "cold-concrete",
  "techno-therapy",
  "acid-violet",
  "anarchy-anaglyph",
  "blood-red",
];

export const ALL_PARAMETER_PATHS: readonly PresetParameterPath[] = [
  "sceneId",
  "paletteId",
  "intensity",
  "seed",
  "render.style",
  "render.logicalSize.width",
  "render.logicalSize.height",
  "render.camera.x",
  "render.camera.y",
  "render.camera.zoom",
  "render.camera.yawDegrees",
  "render.camera.pitchDegrees",
  "render.camera.distance",
  "render.camera.fovDegrees",
  "effects.dither",
  "effects.fog",
  "effects.grain",
  "effects.vertexSnap",
  "effects.affineTextures",
  "effects.psychedelic",
  "effects.colorTransition",
  "effects.targetPaletteId",
  "effects.kickBlackout",
  "effects.anaglyphSplit",
  "effects.strobeGlow",
  "effects.pendulumSwing",
];

export const COMPATIBILITY_RULES: readonly CompatibilityRule[] = [
  {
    id: "rule-industrial-city-style",
    kind: "scene-style",
    sceneId: "industrial-city",
    allowedStyles: ["pixel-16"],
    reason:
      "La scène Industrial City exige le style pixel-16 et une caméra orthographique.",
  },
  {
    id: "rule-digital-void-style",
    kind: "scene-style",
    sceneId: "digital-void",
    allowedStyles: ["pixel-16"],
    reason:
      "La scène Digital Void exige le style pixel-16 et une caméra orthographique.",
  },
  {
    id: "rule-ps1-nightmare-style",
    kind: "scene-style",
    sceneId: "ps1-nightmare",
    allowedStyles: ["lowpoly-32"],
    reason:
      "La scène PS1 Nightmare exige le style lowpoly-32 et une caméra perspective.",
  },
  {
    id: "rule-rave-dungeon-style",
    kind: "scene-style",
    sceneId: "rave-dungeon",
    allowedStyles: ["lowpoly-32"],
    reason:
      "La scène Rave Dungeon exige le style lowpoly-32 et une caméra perspective.",
  },
  {
    id: "rule-techno-therapy-style",
    kind: "scene-style",
    sceneId: "techno-therapy",
    allowedStyles: ["lowpoly-32"],
    reason:
      "La scène Techno Therapy exige le style lowpoly-32 et une caméra perspective.",
  },
  {
    id: "rule-vertex-snap-style",
    kind: "effect-style",
    effect: "vertexSnap",
    allowedStyles: ["lowpoly-32"],
    reason:
      "L'accrochage de sommets PS1 (vertexSnap) est réservé aux scènes lowpoly-32.",
  },
  {
    id: "rule-affine-textures-style",
    kind: "effect-style",
    effect: "affineTextures",
    allowedStyles: ["lowpoly-32"],
    reason:
      "Les textures affines PS1 (affineTextures) sont réservées aux scènes lowpoly-32.",
  },
];

export function requiredStyleForScene(sceneId: SceneId): RenderStyle {
  return sceneId === "ps1-nightmare" ||
    sceneId === "rave-dungeon" ||
    sceneId === "techno-therapy"
    ? "lowpoly-32"
    : "pixel-16";
}

export function defaultCameraForStyle(
  style: "pixel-16"
): OrthographicCameraSettings;
export function defaultCameraForStyle(
  style: "lowpoly-32"
): PerspectiveCameraSettings;
export function defaultCameraForStyle(
  style: RenderStyle
): OrthographicCameraSettings | PerspectiveCameraSettings;
export function defaultCameraForStyle(
  style: RenderStyle
): OrthographicCameraSettings | PerspectiveCameraSettings {
  if (style === "pixel-16") {
    return { kind: "orthographic", x: 0, y: 0, zoom: 1 };
  }
  return {
    kind: "perspective",
    yawDegrees: 0,
    pitchDegrees: 0,
    distance: 1.0,
    fovDegrees: 70,
  };
}

export function createDefaultPresetConfig(
  sceneId: SceneId = "industrial-city",
  paletteId: PaletteId = "anarchy-anaglyph",
  seed = 104729
): RetroPresetConfig {
  const style = requiredStyleForScene(sceneId);
  const render: RetroRenderSettings =
    style === "pixel-16"
      ? {
          style: "pixel-16",
          logicalSize: { width: STUDY_SIZE.width, height: STUDY_SIZE.height },
          sampling: "nearest",
          camera: defaultCameraForStyle("pixel-16"),
        }
      : {
          style: "lowpoly-32",
          logicalSize: { width: STUDY_SIZE.width, height: STUDY_SIZE.height },
          sampling: "nearest",
          camera: defaultCameraForStyle("lowpoly-32"),
        };

  const effects: RetroEffects = {
    ...DEFAULT_RETRO_EFFECTS,
    vertexSnap: style === "lowpoly-32",
    affineTextures: style === "lowpoly-32",
  };

  return {
    schemaVersion: PRESET_SCHEMA_VERSION,
    presetId: `preset-${sceneId}`,
    presetVersion: "1.0.0",
    engineVersion: ENGINE_VERSION,
    sceneId,
    paletteId,
    seed: seed >>> 0,
    intensity: 0.75,
    render,
    effects,
    locks: {},
  };
}

export const PRESET_DEFINITIONS: readonly RetroPresetDefinition[] = [
  {
    id: "preset-industrial-city",
    version: "1.0.0",
    name: "Industrial City — Standard",
    description:
      "Étude pixel-art 16-bit : fonderies, grue portuaire et viaduc sous éclipse.",
    defaults: createDefaultPresetConfig("industrial-city", "furnace-amber", 104729),
    compatibility: COMPATIBILITY_RULES,
  },
  {
    id: "preset-ps1-nightmare",
    version: "1.0.0",
    name: "PS1 Nightmare — Brutalist",
    description:
      "Cour low-poly 32-bit : monolithes béton, obélisque inversé et vertex snap.",
    defaults: createDefaultPresetConfig("ps1-nightmare", "cold-concrete", 229841),
    compatibility: COMPATIBILITY_RULES,
  },
  {
    id: "preset-rave-dungeon",
    version: "1.0.0",
    name: "Rave Dungeon — Vault B4",
    description:
      "Galerie souterraine low-poly 32-bit : arches d'acier et sol inondé.",
    defaults: createDefaultPresetConfig("rave-dungeon", "toxic-oxide", 381907),
    compatibility: COMPATIBILITY_RULES,
  },
  {
    id: "preset-digital-void",
    version: "1.0.0",
    name: "Digital Void — Core 00",
    description: "Tours serveurs monolithiques et abîme numérique tramé.",
    defaults: createDefaultPresetConfig("digital-void", "anarchy-anaglyph", 519203),
    compatibility: COMPATIBILITY_RULES,
  },
  {
    id: "preset-techno-therapy",
    version: "1.0.0",
    name: "Techno Therapy — Lab 09",
    description:
      "Chambre cybernétique 32-bit : tunnel octogonal, anneaux de confinement et moniteur ECG neural.",
    defaults: createDefaultPresetConfig("techno-therapy", "techno-therapy", 742913),
    compatibility: COMPATIBILITY_RULES,
  },
];

export function checkPresetCompatibility(config: RetroPresetConfig): string[] {
  const errors: string[] = [];
  for (const rule of COMPATIBILITY_RULES) {
    if (rule.kind === "scene-style" && config.sceneId === rule.sceneId) {
      if (!rule.allowedStyles.includes(config.render.style)) {
        errors.push(rule.reason);
      }
    } else if (rule.kind === "effect-style") {
      if (
        config.effects[rule.effect] &&
        !rule.allowedStyles.includes(config.render.style)
      ) {
        errors.push(rule.reason);
      }
    }
  }
  if (
    config.render.style === "pixel-16" &&
    config.render.camera.kind !== "orthographic"
  ) {
    errors.push("Le style pixel-16 exige une caméra orthographique.");
  }
  if (
    config.render.style === "lowpoly-32" &&
    config.render.camera.kind !== "perspective"
  ) {
    errors.push("Le style lowpoly-32 exige une caméra perspective.");
  }
  return errors;
}

const FORBIDDEN_VALUE_PATTERN =
  /(?:^|[/:\\])(?:file:|http:|https:|blob:|\/home\/|\/etc\/|\/Users\/|[A-Za-z]:\\|secret|password|apikey|bearer\s)/i;

function assertSafeString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0 || value.length > 120) {
    throw new Error(`Champ ${field} invalide.`);
  }
  if (FORBIDDEN_VALUE_PATTERN.test(value)) {
    throw new Error(
      `Valeur interdite dans ${field} : aucun chemin hôte, URL ou secret n'est autorisé.`
    );
  }
  return value;
}

function assertBoundedNumber(
  value: unknown,
  field: string,
  min: number,
  max: number
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < min ||
    value > max
  ) {
    throw new Error(`Paramètre ${field} hors bornes [${min}, ${max}].`);
  }
  return value;
}

export function migratePresetConfig(raw: unknown): unknown {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Configuration de preset invalide : objet JSON attendu.");
  }
  const obj = { ...(raw as Record<string, unknown>) };
  if (obj.schemaVersion === 0) {
    const sceneId: SceneId = SCENE_IDS.includes(obj.sceneId as SceneId)
      ? (obj.sceneId as SceneId)
      : "industrial-city";
    const style = requiredStyleForScene(sceneId);
    obj.schemaVersion = PRESET_SCHEMA_VERSION;
    obj.presetVersion =
      typeof obj.presetVersion === "string" ? obj.presetVersion : "1.0.0";
    obj.engineVersion = ENGINE_VERSION;
    obj.locks = obj.locks && typeof obj.locks === "object" ? obj.locks : {};
    if (!obj.render || typeof obj.render !== "object") {
      obj.render = createDefaultPresetConfig(sceneId).render;
    }
    if (!obj.effects || typeof obj.effects !== "object") {
      obj.effects = {
        ...DEFAULT_RETRO_EFFECTS,
        vertexSnap: style === "lowpoly-32",
        affineTextures: style === "lowpoly-32",
      };
    }
  }
  return obj;
}

export function validatePresetConfig(rawInput: unknown): RetroPresetConfig {
  const migrated = migratePresetConfig(rawInput) as Record<string, unknown>;
  if (migrated.schemaVersion !== PRESET_SCHEMA_VERSION) {
    throw new Error(
      `Version de schéma de preset non prise en charge : ${String(migrated.schemaVersion)}.`
    );
  }

  const allowedTopKeys = new Set([
    "schemaVersion",
    "presetId",
    "presetVersion",
    "engineVersion",
    "sceneId",
    "paletteId",
    "seed",
    "intensity",
    "render",
    "effects",
    "locks",
  ]);
  for (const key of Object.keys(migrated)) {
    if (!allowedTopKeys.has(key)) {
      throw new Error(
        `Propriété de preset inconnue ou non autorisée : ${key}.`
      );
    }
  }

  const presetId = assertSafeString(migrated.presetId, "presetId");
  const presetVersion = assertSafeString(migrated.presetVersion, "presetVersion");
  const engineVersion = assertSafeString(migrated.engineVersion, "engineVersion");

  if (!SCENE_IDS.includes(migrated.sceneId as SceneId)) {
    throw new Error(`Scène inconnue : ${String(migrated.sceneId)}.`);
  }
  const sceneId = migrated.sceneId as SceneId;

  if (!PALETTE_IDS.includes(migrated.paletteId as PaletteId)) {
    throw new Error(`Palette inconnue : ${String(migrated.paletteId)}.`);
  }
  const paletteId = migrated.paletteId as PaletteId;

  const seed = migrated.seed;
  if (
    typeof seed !== "number" ||
    !Number.isInteger(seed) ||
    seed < 0 ||
    seed > 0xffffffff
  ) {
    throw new Error("La seed doit être un entier uint32 [0, 4294967295].");
  }

  const intensity = assertBoundedNumber(migrated.intensity, "intensity", 0, 1);

  if (!migrated.render || typeof migrated.render !== "object") {
    throw new Error("Paramètres de rendu manquants.");
  }
  const renderRaw = migrated.render as Record<string, unknown>;
  if (renderRaw.sampling !== "nearest") {
    throw new Error('L’échantillonnage de rendu doit être "nearest".');
  }
  const logicalSize = renderRaw.logicalSize as
    | Record<string, unknown>
    | undefined;
  if (
    !logicalSize ||
    logicalSize.width !== STUDY_SIZE.width ||
    logicalSize.height !== STUDY_SIZE.height
  ) {
    throw new Error(
      `La résolution logique doit être ${STUDY_SIZE.width}×${STUDY_SIZE.height}.`
    );
  }

  if (renderRaw.style !== "pixel-16" && renderRaw.style !== "lowpoly-32") {
    throw new Error(`Style de rendu inconnu : ${String(renderRaw.style)}.`);
  }
  const camRaw = renderRaw.camera as Record<string, unknown> | undefined;
  if (!camRaw || typeof camRaw !== "object") {
    throw new Error("Configuration de caméra manquante.");
  }

  let render: RetroRenderSettings;
  if (renderRaw.style === "pixel-16") {
    if (camRaw.kind !== "orthographic") {
      throw new Error("Le style pixel-16 exige une caméra orthographique.");
    }
    render = {
      style: "pixel-16",
      logicalSize: { width: STUDY_SIZE.width, height: STUDY_SIZE.height },
      sampling: "nearest",
      camera: {
        kind: "orthographic",
        x: assertBoundedNumber(camRaw.x, "render.camera.x", -64, 64),
        y: assertBoundedNumber(camRaw.y, "render.camera.y", -48, 48),
        zoom: assertBoundedNumber(camRaw.zoom, "render.camera.zoom", 0.5, 2.5),
      },
    };
  } else {
    if (camRaw.kind !== "perspective") {
      throw new Error("Le style lowpoly-32 exige une caméra perspective.");
    }
    render = {
      style: "lowpoly-32",
      logicalSize: { width: STUDY_SIZE.width, height: STUDY_SIZE.height },
      sampling: "nearest",
      camera: {
        kind: "perspective",
        yawDegrees: assertBoundedNumber(
          camRaw.yawDegrees,
          "render.camera.yawDegrees",
          -180,
          180
        ),
        pitchDegrees: assertBoundedNumber(
          camRaw.pitchDegrees,
          "render.camera.pitchDegrees",
          -45,
          60
        ),
        distance: assertBoundedNumber(
          camRaw.distance,
          "render.camera.distance",
          0.4,
          20
        ),
        fovDegrees: assertBoundedNumber(
          camRaw.fovDegrees,
          "render.camera.fovDegrees",
          40,
          120
        ),
      },
    };
  }

  if (!migrated.effects || typeof migrated.effects !== "object") {
    throw new Error("Paramètres d'effets manquants.");
  }
  const effectsRaw = migrated.effects as Record<string, unknown>;
  if (
    typeof effectsRaw.vertexSnap !== "boolean" ||
    typeof effectsRaw.affineTextures !== "boolean"
  ) {
    throw new Error(
      "Les effets vertexSnap et affineTextures doivent être booléens."
    );
  }
  const effects: RetroEffects = {
    dither: assertBoundedNumber(effectsRaw.dither, "effects.dither", 0, 1),
    fog: assertBoundedNumber(effectsRaw.fog, "effects.fog", 0, 1),
    grain: assertBoundedNumber(effectsRaw.grain, "effects.grain", 0, 1),
    vertexSnap: effectsRaw.vertexSnap,
    affineTextures: effectsRaw.affineTextures,
    psychedelic:
      effectsRaw.psychedelic !== undefined
        ? assertBoundedNumber(effectsRaw.psychedelic, "effects.psychedelic", 0, 1)
        : 0,
    colorTransition:
      effectsRaw.colorTransition !== undefined
        ? assertBoundedNumber(
            effectsRaw.colorTransition,
            "effects.colorTransition",
            0,
            1
          )
        : 0,
    targetPaletteId:
      effectsRaw.targetPaletteId &&
      PALETTE_IDS.includes(effectsRaw.targetPaletteId as PaletteId)
        ? (effectsRaw.targetPaletteId as PaletteId)
        : undefined,
    kickBlackout:
      effectsRaw.kickBlackout !== undefined
        ? assertBoundedNumber(
            effectsRaw.kickBlackout,
            "effects.kickBlackout",
            0,
            1
          )
        : 0,
    anaglyphSplit:
      effectsRaw.anaglyphSplit !== undefined
        ? assertBoundedNumber(
            effectsRaw.anaglyphSplit,
            "effects.anaglyphSplit",
            0,
            1
          )
        : 0.16,
    strobeGlow:
      effectsRaw.strobeGlow !== undefined
        ? assertBoundedNumber(
            effectsRaw.strobeGlow,
            "effects.strobeGlow",
            0,
            1
          )
        : 0.25,
    pendulumSwing:
      effectsRaw.pendulumSwing !== undefined
        ? assertBoundedNumber(
            effectsRaw.pendulumSwing,
            "effects.pendulumSwing",
            0,
            1
          )
        : 0.25,
  };

  if (
    migrated.locks !== undefined &&
    (!migrated.locks ||
      typeof migrated.locks !== "object" ||
      Array.isArray(migrated.locks))
  ) {
    throw new Error("Le champ locks doit être un objet.");
  }
  const locksRaw = (migrated.locks ?? {}) as Record<string, unknown>;
  const locks: Partial<Record<PresetParameterPath, boolean>> = {};
  for (const [k, v] of Object.entries(locksRaw)) {
    if (
      !ALL_PARAMETER_PATHS.includes(k as PresetParameterPath) ||
      typeof v !== "boolean"
    ) {
      throw new Error(`Verrou de paramètre invalide : ${k}.`);
    }
    if (v) locks[k as PresetParameterPath] = true;
  }

  const candidate: RetroPresetConfig = {
    schemaVersion: PRESET_SCHEMA_VERSION,
    presetId,
    presetVersion,
    engineVersion,
    sceneId,
    paletteId,
    seed,
    intensity,
    render,
    effects,
    locks,
  };

  const violations = checkPresetCompatibility(candidate);
  if (violations.length > 0) {
    throw new Error(`Configuration incompatible : ${violations.join(" ")}`);
  }

  return candidate;
}

export function createPrng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function roundStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export function randomizePresetConfig(
  request: RandomizeRequest
): RetroPresetConfig {
  if (request.randomizerVersion !== RANDOMIZER_VERSION) {
    throw new Error(
      `Version de randomizer non prise en charge : ${request.randomizerVersion}.`
    );
  }
  if (
    !Number.isInteger(request.seed) ||
    request.seed < 0 ||
    request.seed > 0xffffffff
  ) {
    throw new Error("La seed de tirage doit être un entier uint32.");
  }

  const current = request.current;
  const locks = current.locks ?? {};

  if (locks["sceneId"] && locks["render.style"]) {
    const expected = requiredStyleForScene(current.sceneId);
    if (current.render.style !== expected) {
      throw new Error(
        `Conflit de verrous impossible à résoudre : la scène verrouillée "${current.sceneId}" exige le style "${expected}", mais "${current.render.style}" est verrouillé.`
      );
    }
  }
  const lockedStyle: RenderStyle | undefined = locks["render.style"]
    ? current.render.style
    : locks["sceneId"]
    ? requiredStyleForScene(current.sceneId)
    : undefined;

  if (lockedStyle === "pixel-16") {
    if (locks["effects.vertexSnap"] && current.effects.vertexSnap) {
      throw new Error(
        "Conflit de verrous impossible à résoudre : vertexSnap est verrouillé à true alors que le style pixel-16 est imposé."
      );
    }
    if (locks["effects.affineTextures"] && current.effects.affineTextures) {
      throw new Error(
        "Conflit de verrous impossible à résoudre : affineTextures est verrouillé à true alors que le style pixel-16 est imposé."
      );
    }
  }

  const rand = createPrng(request.seed);

  const rScene = rand();
  const rPalette = rand();
  const rIntensity = rand();
  const rOrthoX = rand();
  const rOrthoY = rand();
  const rOrthoZoom = rand();
  const rYaw = rand();
  const rPitch = rand();
  const rDist = rand();
  const rFov = rand();
  const rDither = rand();
  const rFog = rand();
  const rGrain = rand();
  const rVertexSnap = rand();
  const rAffine = rand();
  const rPsyche = rand();
  const rAnaglyph = rand();
  const rStrobe = rand();
  const rPendulum = rand();

  let allowedScenes = [...SCENE_IDS];
  if (lockedStyle) {
    allowedScenes = allowedScenes.filter(
      (s) => requiredStyleForScene(s) === lockedStyle
    );
  }
  if (
    (locks["effects.vertexSnap"] && current.effects.vertexSnap) ||
    (locks["effects.affineTextures"] && current.effects.affineTextures)
  ) {
    allowedScenes = allowedScenes.filter(
      (s) => requiredStyleForScene(s) === "lowpoly-32"
    );
  }

  const sceneId: SceneId = locks["sceneId"]
    ? current.sceneId
    : allowedScenes[Math.floor(rScene * allowedScenes.length)];
  const style: RenderStyle = locks["render.style"]
    ? current.render.style
    : requiredStyleForScene(sceneId);

  const paletteId: PaletteId = locks["paletteId"]
    ? current.paletteId
    : PALETTE_IDS[Math.floor(rPalette * PALETTE_IDS.length)];

  const intensity = locks["intensity"]
    ? current.intensity
    : Number(roundStep(0.35 + rIntensity * 0.65, 0.05).toFixed(2));

  const nextSeed = locks["seed"] ? current.seed : request.seed >>> 0;

  let render: RetroRenderSettings;
  if (style === "pixel-16") {
    const prevOrtho =
      current.render.style === "pixel-16"
        ? current.render.camera
        : defaultCameraForStyle("pixel-16");
    render = {
      style: "pixel-16",
      logicalSize: {
        width: locks["render.logicalSize.width"]
          ? current.render.logicalSize.width
          : STUDY_SIZE.width,
        height: locks["render.logicalSize.height"]
          ? current.render.logicalSize.height
          : STUDY_SIZE.height,
      },
      sampling: "nearest",
      camera: {
        kind: "orthographic",
        x: locks["render.camera.x"]
          ? prevOrtho.x
          : Math.round((rOrthoX - 0.5) * 32),
        y: locks["render.camera.y"]
          ? prevOrtho.y
          : Math.round((rOrthoY - 0.5) * 20),
        zoom: locks["render.camera.zoom"]
          ? prevOrtho.zoom
          : Number(roundStep(0.85 + rOrthoZoom * 0.55, 0.05).toFixed(2)),
      },
    };
  } else {
    const prevPersp =
      current.render.style === "lowpoly-32"
        ? current.render.camera
        : defaultCameraForStyle("lowpoly-32");
    render = {
      style: "lowpoly-32",
      logicalSize: {
        width: locks["render.logicalSize.width"]
          ? current.render.logicalSize.width
          : STUDY_SIZE.width,
        height: locks["render.logicalSize.height"]
          ? current.render.logicalSize.height
          : STUDY_SIZE.height,
      },
      sampling: "nearest",
      camera: {
        kind: "perspective",
        yawDegrees: locks["render.camera.yawDegrees"]
          ? prevPersp.yawDegrees
          : Math.round((rYaw - 0.5) * 70),
        pitchDegrees: locks["render.camera.pitchDegrees"]
          ? prevPersp.pitchDegrees
          : Math.round((rPitch - 0.5) * 24),
        distance: locks["render.camera.distance"]
          ? prevPersp.distance
          : Number(roundStep(0.75 + rDist * 0.65, 0.05).toFixed(2)),
        fovDegrees: locks["render.camera.fovDegrees"]
          ? prevPersp.fovDegrees
          : Math.round(58 + rFov * 34),
      },
    };
  }

  const effects: RetroEffects = {
    dither: locks["effects.dither"]
      ? current.effects.dither
      : Number(roundStep(0.25 + rDither * 0.7, 0.05).toFixed(2)),
    fog: locks["effects.fog"]
      ? current.effects.fog
      : Number(roundStep(0.2 + rFog * 0.7, 0.05).toFixed(2)),
    grain: locks["effects.grain"]
      ? current.effects.grain
      : Number(roundStep(0.1 + rGrain * 0.65, 0.05).toFixed(2)),
    vertexSnap: locks["effects.vertexSnap"]
      ? current.effects.vertexSnap
      : style === "lowpoly-32"
      ? rVertexSnap >= 0.2
      : false,
    affineTextures: locks["effects.affineTextures"]
      ? current.effects.affineTextures
      : style === "lowpoly-32"
      ? rAffine >= 0.25
      : false,
    psychedelic: locks["effects.psychedelic"]
      ? current.effects.psychedelic ?? 0
      : Number(roundStep(rPsyche * 0.75, 0.05).toFixed(2)),
    colorTransition: locks["effects.colorTransition"]
      ? current.effects.colorTransition ?? 0
      : current.effects.colorTransition ?? 0,
    targetPaletteId: current.effects.targetPaletteId,
    kickBlackout: locks["effects.kickBlackout"]
      ? current.effects.kickBlackout ?? 0
      : current.effects.kickBlackout ?? 0,
    anaglyphSplit: locks["effects.anaglyphSplit"]
      ? current.effects.anaglyphSplit ?? 0.16
      : Number(roundStep(rAnaglyph * 0.55, 0.05).toFixed(2)),
    strobeGlow: locks["effects.strobeGlow"]
      ? current.effects.strobeGlow ?? 0.25
      : Number(roundStep(0.15 + rStrobe * 0.65, 0.05).toFixed(2)),
    pendulumSwing: locks["effects.pendulumSwing"]
      ? current.effects.pendulumSwing ?? 0.25
      : Number(roundStep(rPendulum * 0.8, 0.05).toFixed(2)),
  };

  return validatePresetConfig({
    schemaVersion: PRESET_SCHEMA_VERSION,
    presetId: `preset-${sceneId}`,
    presetVersion: current.presetVersion,
    engineVersion: ENGINE_VERSION,
    sceneId,
    paletteId,
    seed: nextSeed,
    intensity,
    render,
    effects,
    locks: { ...locks },
  });
}

export function serializePresetConfig(config: RetroPresetConfig): string {
  const valid = validatePresetConfig(config);
  return JSON.stringify(valid, null, 2);
}

export function parsePresetConfig(json: string): RetroPresetConfig {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("JSON de preset mal formé.");
  }
  return validatePresetConfig(parsed);
}

export function generatePresetVariations(
  base: RetroPresetConfig,
  count: number,
  baseSeed = base.seed
): RetroPresetConfig[] {
  if (!Number.isInteger(count) || count < 1 || count > 16) {
    throw new Error("Le nombre de variations doit être compris entre 1 et 16.");
  }
  const variations: RetroPresetConfig[] = [];
  for (let i = 0; i < count; i++) {
    const derivedSeed = ((baseSeed >>> 0) + (i + 1) * 0x9e3779b9) >>> 0;
    variations.push(
      randomizePresetConfig({
        randomizerVersion: RANDOMIZER_VERSION,
        seed: derivedSeed,
        current: structuredClone(base),
      })
    );
  }
  return variations;
}

export function evaluateAutomationAt(
  curves: readonly AutomationCurve[],
  parameter: AutomatableParameter,
  timeSeconds: number,
  fallback: number
): number {
  const curve = curves.find((item) => item.parameter === parameter);
  if (!curve || curve.points.length === 0) return fallback;
  const sorted = [...curve.points].sort((a, b) => a.timeSeconds - b.timeSeconds);
  if (timeSeconds <= sorted[0].timeSeconds) return sorted[0].value;
  if (timeSeconds >= sorted[sorted.length - 1].timeSeconds) {
    return sorted[sorted.length - 1].value;
  }
  for (let i = 0; i < sorted.length - 1; i++) {
    const p0 = sorted[i];
    const p1 = sorted[i + 1];
    if (timeSeconds >= p0.timeSeconds && timeSeconds <= p1.timeSeconds) {
      const span = p1.timeSeconds - p0.timeSeconds;
      if (span <= 0) return p1.value;
      const ratio = (timeSeconds - p0.timeSeconds) / span;
      return p0.value * (1 - ratio) + p1.value * ratio;
    }
  }
  return fallback;
}

export function applyAutomationsToPreset(
  preset: RetroPresetConfig,
  automations: readonly AutomationCurve[] | undefined,
  timeSeconds: number
): RetroPresetConfig {
  if (!automations || automations.length === 0) return preset;
  return {
    ...preset,
    intensity: Math.max(
      0,
      Math.min(
        1,
        evaluateAutomationAt(
          automations,
          "intensity",
          timeSeconds,
          preset.intensity
        )
      )
    ),
    effects: {
      ...preset.effects,
      dither: Math.max(
        0,
        Math.min(
          1,
          evaluateAutomationAt(
            automations,
            "effects.dither",
            timeSeconds,
            preset.effects.dither
          )
        )
      ),
      fog: Math.max(
        0,
        Math.min(
          1,
          evaluateAutomationAt(
            automations,
            "effects.fog",
            timeSeconds,
            preset.effects.fog
          )
        )
      ),
      grain: Math.max(
        0,
        Math.min(
          1,
          evaluateAutomationAt(
            automations,
            "effects.grain",
            timeSeconds,
            preset.effects.grain
          )
        )
      ),
    },
  };
}

export interface EvaluatedSequenceState {
  activePreset: RetroPresetConfig;
  previousPreset?: RetroPresetConfig;
  dissolveFactor: number;
  segmentIndex: number;
}

export function evaluateSequenceAt(
  segments: readonly SequenceSegment[] | undefined,
  fallbackPreset: RetroPresetConfig,
  automations: readonly AutomationCurve[] | undefined,
  timeSeconds: number
): EvaluatedSequenceState {
  if (!segments || segments.length === 0) {
    return {
      activePreset: applyAutomationsToPreset(
        fallbackPreset,
        automations,
        timeSeconds
      ),
      dissolveFactor: 0,
      segmentIndex: 0,
    };
  }
  const totalDuration = segments[segments.length - 1]?.endSeconds || 15;
  const wrappedTime =
    totalDuration > 0 ? ((timeSeconds % totalDuration) + totalDuration) % totalDuration : timeSeconds;
  const sorted = [...segments].sort((a, b) => a.startSeconds - b.startSeconds);
  let activeIndex = sorted.findIndex(
    (seg) => wrappedTime >= seg.startSeconds && wrappedTime < seg.endSeconds
  );
  if (activeIndex === -1) {
    activeIndex = wrappedTime < sorted[0].startSeconds ? 0 : sorted.length - 1;
  }
  const activeSeg = sorted[activeIndex];
  const activePreset = applyAutomationsToPreset(
    activeSeg.preset,
    automations,
    wrappedTime
  );

  if (
    activeIndex > 0 &&
    activeSeg.transition === "dither-dissolve" &&
    activeSeg.transitionDurationSeconds > 0
  ) {
    const elapsedInSeg = wrappedTime - activeSeg.startSeconds;
    if (
      elapsedInSeg >= 0 &&
      elapsedInSeg < activeSeg.transitionDurationSeconds
    ) {
      const prevPreset = applyAutomationsToPreset(
        sorted[activeIndex - 1].preset,
        automations,
        wrappedTime
      );
      return {
        activePreset,
        previousPreset: prevPreset,
        dissolveFactor: 1 - elapsedInSeg / activeSeg.transitionDurationSeconds,
        segmentIndex: activeIndex,
      };
    }
  }

  return {
    activePreset,
    dissolveFactor: 0,
    segmentIndex: activeIndex,
  };
}

export function createDefaultStudioProject(): StudioProject {
  const s1 = createDefaultPresetConfig("industrial-city", "anarchy-anaglyph", 104729);
  const s2 = createDefaultPresetConfig("ps1-nightmare", "blood-red", 229841);
  const s3 = createDefaultPresetConfig("rave-dungeon", "toxic-oxide", 381907);
  const s4 = createDefaultPresetConfig("digital-void", "cold-concrete", 519203);
  const s5 = createDefaultPresetConfig("techno-therapy", "techno-therapy", 742913);
  return {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    id: "project-anarchy-01",
    name: "Session Anarchy Open Hub 01",
    engineVersion: ENGINE_VERSION,
    activePreset: s1,
    sequenceEnabled: false,
    segments: [
      {
        id: "seg-1",
        startSeconds: 0,
        endSeconds: 3,
        preset: s1,
        transition: "cut",
        transitionDurationSeconds: 0,
      },
      {
        id: "seg-2",
        startSeconds: 3,
        endSeconds: 6,
        preset: s2,
        transition: "dither-dissolve",
        transitionDurationSeconds: 0.5,
      },
      {
        id: "seg-3",
        startSeconds: 6,
        endSeconds: 9,
        preset: s3,
        transition: "dither-dissolve",
        transitionDurationSeconds: 0.5,
      },
      {
        id: "seg-4",
        startSeconds: 9,
        endSeconds: 12,
        preset: s4,
        transition: "dither-dissolve",
        transitionDurationSeconds: 0.5,
      },
      {
        id: "seg-5",
        startSeconds: 12,
        endSeconds: 15,
        preset: s5,
        transition: "dither-dissolve",
        transitionDurationSeconds: 0.5,
      },
    ],
    automations: [
      {
        parameter: "intensity",
        points: [
          { timeSeconds: 0, value: 0.65 },
          { timeSeconds: 7.5, value: 0.92 },
          { timeSeconds: 15, value: 0.72 },
        ],
      },
    ],
    reducedMotion: false,
  };
}

/**
 * Registre extensible centralisé d'Anarchy Visual Studio (Architecture v2 Data-Driven JSON).
 * Tout nouvel élément ajouté ici met automatiquement à jour le typage TypeScript,
 * la validation des Packs 3D JSON et le Prompt IA / documentation dans `/docs/visual-studio`.
 */

export const TERRAIN_REGISTRY = [
  {
    value: "infinite_grid",
    label: "infinite_grid (Grille Perspective Infinie)",
    desc: "Dallage cybernétique 3D en perspective infinie avec lignes d'horizon réactives.",
  },
  {
    value: "neon_highway",
    label: "neon_highway (Autoroute à Voies Néon)",
    desc: "Autoroute synthwave à 3 voies avec marquages lumineux défilants et glissières néon.",
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
  {
    value: "mirror_floor",
    label: "mirror_floor (Sol Miroir Réfléchissant)",
    desc: "Surface sombre spéculaire reflétant les lignes d'énergie et le sujet central.",
  },
] as const;

export const SIDE_PROPS_REGISTRY = [
  {
    value: "none",
    label: "none (Aucun décor latéral)",
    desc: "Laisse le terrain et le ciel totalement dégagés sur les côtés.",
  },
  {
    value: "palm_trees",
    label: "palm_trees (Palmiers Synthwave Low-Poly)",
    desc: "Rangées de palmiers géométriques bordant l'axe de course.",
  },
  {
    value: "cyber_towers",
    label: "cyber_towers (Tours Cybernétiques Illuminées)",
    desc: "Monolithes urbains futuristes à arêtes néon défilant à gauche et à droite.",
  },
  {
    value: "dojo_pillars",
    label: "dojo_pillars (Colonnes & Lanternes Dojo)",
    desc: "Piliers architecturaux japonais rythmant les bords de la scène.",
  },
  {
    value: "neon_arches",
    label: "neon_arches (Portiques & Arches Néon)",
    desc: "Grandes arches lumineuses enjambant la piste au rythme du BPM.",
  },
] as const;

export const SUBJECT_MESH_REGISTRY = [
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
    value: "procedural_group",
    label: "procedural_group (Assemblage 3D Procédural via parts[])",
    desc: "Objet 3D complexe composé librement de primitives géométriques dans le JSON (voitures, vaisseaux, masques, temples...).",
  },
  {
    value: "none",
    label: "none (Aucun sujet)",
    desc: "Laisse toute la place au décor multi-calques.",
  },
] as const;

export const PROCEDURAL_PRIMITIVE_REGISTRY = [
  { value: "box", label: "box (Cube / Parallélépipède)" },
  { value: "pyramid", label: "pyramid (Pyramide 4 faces)" },
  { value: "wedge", label: "wedge (Prisme / Rampe biseautée)" },
  { value: "cylinder", label: "cylinder (Cylindre low-poly)" },
  { value: "torus", label: "torus (Tore / Jante / Anneau épais)" },
  { value: "icosahedron", label: "icosahedron (Cristal / Icosaèdre)" },
  { value: "ring", label: "ring (Anneau octogonal plat)" },
] as const;

export const CAMERA_MODE_REGISTRY = [
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
    label: "fps_arms (Vue Subjective FPS + Bras Cyber 3D)",
    desc: "Caméra à la 1ère personne avec avant-bras et lames cybernétiques au premier plan.",
  },
  {
    value: "dramatic_tilt",
    label: "dramatic_tilt (Angle Hollandais & Contre-Plongée)",
    desc: "Cadrage incliné agressif accentué sur les kicks et transitions.",
  },
] as const;

export const BASS_TARGET_REGISTRY = [
  { value: "camera_zoom_and_jump", label: "camera_zoom_and_jump (Zoom FOV + Rebond)" },
  { value: "subject_pulse", label: "subject_pulse (Pulsation Échelle Sujet 3D)" },
  { value: "pillar_slam", label: "pillar_slam (Impact Vertical des Structures)" },
  { value: "tunnel_boost", label: "tunnel_boost (Accélération Vitesse Terrain)" },
] as const;

export const MID_TARGET_REGISTRY = [
  { value: "terrain_wave_height", label: "terrain_wave_height (Ondulation Relief Terrain)" },
  { value: "subject_rotation", label: "subject_rotation (Rotation Accélérée du Sujet)" },
  { value: "color_shift", label: "color_shift (Modulation Chromatique)" },
  { value: "camera_sway", label: "camera_sway (Balancement Latéral Caméra)" },
] as const;

export const TREBLE_TARGET_REGISTRY = [
  { value: "particles_burst", label: "particles_burst (Éclats de Particules 3D)" },
  { value: "wireframe_glow", label: "wireframe_glow (Surbrillance Wireframe Néon)" },
  { value: "sky_flash", label: "sky_flash (Éclair Horizon / Ciel)" },
  { value: "katana_slash", label: "katana_slash (Faisceaux / Coups de Lame 3D)" },
] as const;

export const FLUX_TARGET_REGISTRY = [
  { value: "glitch_and_emissive", label: "glitch_and_emissive (Glitch + Émissivité Néon)" },
  { value: "camera_shake", label: "camera_shake (Secousse Caméra sur Transitoires)" },
  { value: "fov_kick", label: "fov_kick (Ouverture Brusque du FOV)" },
  { value: "invert_strobe", label: "invert_strobe (Inversion Stroboscopique)" },
] as const;

export const POST_FX_REGISTRY = [
  {
    key: "ps1VertexJitter",
    label: "ps1VertexJitter",
    range: "0..1",
    desc: "Quantification / tremblement des sommets 3D façon PlayStation 1.",
  },
  {
    key: "crtScanlines",
    label: "crtScanlines",
    range: "0..1",
    desc: "Lignes de balayage écran cathodique CRT.",
  },
  {
    key: "chromaticAberration",
    label: "chromaticAberration",
    range: "0..1",
    desc: "Décalage RVB sur les bords et sur les kicks.",
  },
  {
    key: "kaleidoscopeSegments",
    label: "kaleidoscopeSegments",
    range: "0 | 2 | 4 | 6 | 8",
    desc: "Symétrie miroir psychédélique multi-segments.",
  },
  {
    key: "bloomIntensity",
    label: "bloomIntensity",
    range: "0..2",
    desc: "Halo néon sur les matériaux émissifs.",
  },
] as const;

export const CLONER_MODE_REGISTRY = [
  {
    value: "linear",
    label: "linear (Alignement Linéaire)",
    desc: "Duplique les instances le long d'un vecteur [dx, dy, dz] régulier.",
  },
  {
    value: "radial",
    label: "radial (Couronne / Anneau Radial)",
    desc: "Répartit les instances en cercle (rayon défini par offset[0]) autour du centre.",
  },
  {
    value: "grid",
    label: "grid (Matrice 2D / 3D)",
    desc: "Dispose les instances en grille carrée/cubique régulière.",
  },
  {
    value: "spiral",
    label: "spiral (Spirale / Hélice 3D)",
    desc: "Combine rotation radiale, élévation et profondeur Z pour former tunnels et hélices.",
  },
] as const;

export const AI_STYLE_PRESETS = [
  {
    id: "hotline-miami",
    label: "Hotline Miami",
    paletteHint: "Magenta #FF0088, Cyan #00F0FF, Jaune #FFD600, Nuit #120428",
    terrainHint: "neon_highway, palm_trees, horizonSun strié, voiture low-poly",
    fxHint: "crtScanlines: 0.4, chromaticAberration: 0.35, bloomIntensity: 1.0",
  },
  {
    id: "ps1-dark-fantasy",
    label: "PS1 Dark Fantasy",
    paletteHint: "Rouge sang #B91C1C, Pierre sombre #1C1917, Braise #F59E0B",
    terrainHint: "lowpoly_mountains ou dojo_pillars, floating_monolith, arches gothiques",
    fxHint: "ps1VertexJitter: 0.65, crtScanlines: 0.3, bloomIntensity: 0.6",
  },
  {
    id: "brutalist-techno",
    label: "Brutalist Techno",
    paletteHint: "Blanc #F8FAFC, Acier #334155, Rouge Alerte #FF1B24, Noir #09090B",
    terrainHint: "dojo_pillars, mirror_floor, cloneurs linéaires et matrices de monolithes",
    fxHint: "chromaticAberration: 0.25, crtScanlines: 0.2, bloomIntensity: 0.85",
  },
  {
    id: "cyberpunk-tokyo",
    label: "Cyberpunk Tokyo",
    paletteHint: "Cyan #00F6FF, Rose Néon #FF0055, Indigo #0F172A, Or #FBBF24",
    terrainHint: "infinite_grid, cyber_towers, cyber_katana, spirales d'anneaux",
    fxHint: "chromaticAberration: 0.45, crtScanlines: 0.35, bloomIntensity: 1.15",
  },
  {
    id: "acid-rave",
    label: "Acid Rave",
    paletteHint: "Vert Acide #A3E635, Violet #A855F7, Magenta #EC4899, Noir #05020A",
    terrainHint: "tunnel, neon_arches, spirales et cloneurs radiaux kaléidoscopiques",
    fxHint: "kaleidoscopeSegments: 6, chromaticAberration: 0.5, bloomIntensity: 1.3",
  },
] as const;

export type AnarchyTerrainType = (typeof TERRAIN_REGISTRY)[number]["value"];
export type AnarchySidePropType = (typeof SIDE_PROPS_REGISTRY)[number]["value"];
export type AnarchySubjectMeshType = (typeof SUBJECT_MESH_REGISTRY)[number]["value"];
export type AnarchyProceduralPrimitive =
  (typeof PROCEDURAL_PRIMITIVE_REGISTRY)[number]["value"];
export type AnarchyCameraMode = (typeof CAMERA_MODE_REGISTRY)[number]["value"];
export type AnarchyBassTarget = (typeof BASS_TARGET_REGISTRY)[number]["value"];
export type AnarchyMidTarget = (typeof MID_TARGET_REGISTRY)[number]["value"];
export type AnarchyTrebleTarget = (typeof TREBLE_TARGET_REGISTRY)[number]["value"];
export type AnarchyFluxTarget = (typeof FLUX_TARGET_REGISTRY)[number]["value"];
export type AnarchyClonerMode = (typeof CLONER_MODE_REGISTRY)[number]["value"];

export interface JsonSnippet3D {
  id: string;
  label: string;
  target: "backdrop" | "subject";
  description: string;
  payload: unknown;
}

export const JSON_SNIPPETS_3D: readonly JsonSnippet3D[] = [
  {
    id: "horizon-sun",
    label: "Soleil Synthwave Strié",
    target: "backdrop",
    description: "Calque ciel dégradé + soleil synthwave strié + champ d'étoiles",
    payload: {
      kind: "backdrop",
      backdrop: {
        skyGradient: ["#0B021C", "#38073B"],
        horizonSun: {
          enabled: true,
          colorTop: "#FFD600",
          colorBottom: "#FF0055",
          stripes: 6,
          size: 1.15,
        },
        starfield: {
          enabled: true,
          density: 0.75,
          color: "#00F0FF",
        },
      },
    },
  },
  {
    id: "neon-ring-spiral",
    label: "Spirale d'Anneaux Néon",
    target: "subject",
    description: "16 anneaux néon en spirale animés par le BPM et les basses",
    payload: {
      meshType: "procedural_group",
      primaryColor: "#00F0FF",
      accentColor: "#FF0055",
      wireframeOverlay: true,
      scale: 1.0,
      position: [0, 0, -1.5],
      cloner: {
        mode: "spiral",
        count: 16,
        offset: [0.45, 0.12, -0.55],
        stepRotation: [0, 0, 18],
        stepScale: [0.97, 0.97, 0.97],
      },
      animations: [
        { target: "rot.z", expr: "t * 0.8 + i * 0.25 + beat * 0.6" },
        { target: "scale", expr: "1 + sin(t * 3 + i * 0.35) * 0.12 + bass * 0.25" },
      ],
      parts: [
        {
          primitive: "ring",
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1.1, 1.1, 0.25],
          color: "#00F0FF",
          emissive: true,
          wireframe: true,
        },
      ],
    },
  },
  {
    id: "brutalist-arch",
    label: "Arche Brutaliste",
    target: "subject",
    description: "Portique brutaliste répété en profondeur avec pulsation sur kick",
    payload: {
      meshType: "procedural_group",
      primaryColor: "#1E293B",
      accentColor: "#FF1B24",
      wireframeOverlay: true,
      scale: 1.0,
      position: [0, -0.35, -1.0],
      cloner: {
        mode: "linear",
        count: 6,
        offset: [0, 0, -1.4],
        stepRotation: [0, 0, 0],
        stepScale: [1, 1, 1],
      },
      animations: [
        { target: "pos.y", expr: "-0.35 + bass * 0.2" },
        { target: "emissiveIntensity", expr: "0.7 + flux * 1.2" },
      ],
      parts: [
        {
          primitive: "box",
          position: [-1.35, 0.9, 0],
          rotation: [0, 0, 0],
          scale: [0.35, 2.2, 0.35],
          color: "#1E293B",
          emissive: false,
          wireframe: true,
        },
        {
          primitive: "box",
          position: [1.35, 0.9, 0],
          rotation: [0, 0, 0],
          scale: [0.35, 2.2, 0.35],
          color: "#1E293B",
          emissive: false,
          wireframe: true,
        },
        {
          primitive: "wedge",
          position: [0, 2.1, 0],
          rotation: [0, 0, 0],
          scale: [3.2, 0.4, 0.45],
          color: "#FF1B24",
          emissive: true,
          wireframe: true,
        },
      ],
    },
  },
  {
    id: "lowpoly-car",
    label: "Véhicule Low-Poly",
    target: "subject",
    description: "Bolide synthwave low-poly avec suspension réactive aux basses",
    payload: {
      meshType: "procedural_group",
      primaryColor: "#1A1A2E",
      accentColor: "#FF0055",
      wireframeOverlay: true,
      scale: 1.0,
      position: [0, -0.45, 0],
      animations: [
        { target: "pos.y", expr: "-0.45 + sin(t * 5) * 0.04 + bass * 0.14" },
        { target: "rot.z", expr: "sin(t * 2.1) * 0.06 * mid" },
      ],
      parts: [
        {
          primitive: "box",
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1.35, 0.35, 2.4],
          color: "#1E1B4B",
          emissive: false,
          wireframe: true,
        },
        {
          primitive: "wedge",
          position: [0, 0.28, -0.15],
          rotation: [0, 0, 0],
          scale: [1.05, 0.28, 1.2],
          color: "#FF0055",
          emissive: true,
          wireframe: true,
        },
        {
          primitive: "torus",
          position: [-0.72, -0.16, 0.72],
          rotation: [0, 1.57, 0],
          scale: [0.28, 0.28, 0.22],
          color: "#00F0FF",
          emissive: true,
          wireframe: true,
        },
        {
          primitive: "torus",
          position: [0.72, -0.16, 0.72],
          rotation: [0, 1.57, 0],
          scale: [0.28, 0.28, 0.22],
          color: "#00F0FF",
          emissive: true,
          wireframe: true,
        },
        {
          primitive: "torus",
          position: [-0.72, -0.16, -0.72],
          rotation: [0, 1.57, 0],
          scale: [0.28, 0.28, 0.22],
          color: "#00F0FF",
          emissive: true,
          wireframe: true,
        },
        {
          primitive: "torus",
          position: [0.72, -0.16, -0.72],
          rotation: [0, 1.57, 0],
          scale: [0.28, 0.28, 0.22],
          color: "#00F0FF",
          emissive: true,
          wireframe: true,
        },
      ],
    },
  },
  {
    id: "monolith-grid",
    label: "Matrice de Monolithes",
    target: "subject",
    description: "Grille 3x3 de cristaux/monolithes ondulant selon une fonction sin(t + i)",
    payload: {
      meshType: "procedural_group",
      primaryColor: "#111827",
      accentColor: "#A855F7",
      wireframeOverlay: true,
      scale: 0.75,
      position: [-1.4, -0.2, -1.8],
      cloner: {
        mode: "grid",
        count: 9,
        offset: [1.4, 0, -1.4],
        stepRotation: [0, 15, 0],
        stepScale: [1, 1, 1],
      },
      animations: [
        { target: "pos.y", expr: "sin(t * 2.5 + i * 0.7) * 0.45 + bass * 0.5" },
        { target: "rot.y", expr: "t * 0.9 + i * 0.4" },
      ],
      parts: [
        {
          primitive: "pyramid",
          position: [0, 0.45, 0],
          rotation: [0, 0, 0],
          scale: [0.45, 1.1, 0.45],
          color: "#A855F7",
          emissive: true,
          wireframe: true,
        },
      ],
    },
  },
];

/**
 * Génère le Prompt IA complet v3 (cloners, animations mathématiques, style & BPM actif).
 */
export function generateAiPackPromptV3(
  styleId?: string,
  activeBpm = 128
): string {
  const terrains = TERRAIN_REGISTRY.map((t) => `"${t.value}"`).join(" | ");
  const props = SIDE_PROPS_REGISTRY.map((p) => `"${p.value}"`).join(" | ");
  const meshes = SUBJECT_MESH_REGISTRY.map((m) => `"${m.value}"`).join(" | ");
  const primitives = PROCEDURAL_PRIMITIVE_REGISTRY.map((p) => `"${p.value}"`).join(" | ");
  const cameras = CAMERA_MODE_REGISTRY.map((c) => `"${c.value}"`).join(" | ");
  const cloners = CLONER_MODE_REGISTRY.map((c) => `"${c.value}"`).join(" | ");
  const bass = BASS_TARGET_REGISTRY.map((b) => `"${b.value}"`).join(" | ");
  const mid = MID_TARGET_REGISTRY.map((m) => `"${m.value}"`).join(" | ");
  const treble = TREBLE_TARGET_REGISTRY.map((t) => `"${t.value}"`).join(" | ");
  const flux = FLUX_TARGET_REGISTRY.map((f) => `"${f.value}"`).join(" | ");

  const stylePreset =
    AI_STYLE_PRESETS.find((s) => s.id === styleId) ?? AI_STYLE_PRESETS[0];

  return `Tu es un directeur artistique 3D temps réel pour Open Hub // Anarchy Visual Studio (Moteur v3 Data-Driven).
Génère une "Cartouche / Pack 3D v3" au format JSON strict (Anarchy3DPack) contenant 4 à 5 scènes 3D évolutives synchronisées à ${Math.round(activeBpm)} BPM.

DIRECTION ARTISTIQUE DEMANDÉE (${stylePreset.label}) :
- Palette conseillée : ${stylePreset.paletteHint}
- Décors & Sujets : ${stylePreset.terrainHint}
- Post-FX suggérés : ${stylePreset.fxHint}

IMPORTANT — RÈGLES STRICTES v3 :
1. Réponds UNIQUEMENT avec un bloc JSON valide (aucun code JS/C++, aucune fonction, aucun \`eval\`).
2. Valeurs autorisées issues du Registre :
   - terrain.type : ${terrains}
   - sideProps.type : ${props}
   - subject.meshType : ${meshes}
   - procedural_group parts[].primitive : ${primitives}
   - cloner.mode : ${cloners} (count entre 2 et 64, total < 256 primitives/scène pour 60 FPS)
   - camera.mode : ${cameras}
   - audioMapping.bassTarget : ${bass}
   - audioMapping.midTarget : ${mid}
   - audioMapping.trebleTarget : ${treble}
   - audioMapping.fluxTarget : ${flux}
3. Cloneurs Procéduraux ("cloner") sur n'importe quel sujet de "subjects[]" ou élément de "parts[]" :
   - { "mode": "linear"|"radial"|"grid"|"spiral", "count": 12, "offset": [dx, dy, dz], "stepRotation": [rxDeg, ryDeg, rzDeg], "stepScale": [sx, sy, sz] }
4. Expressions Mathématiques Temps Réel ("animations[]") :
   - Cibles : "pos.x", "pos.y", "pos.z", "rot.x", "rot.y", "rot.z", "scale", "scale.x", "scale.y", "scale.z", "emissiveIntensity", "fov"
   - Variables : t (secondes), beat (0..1 phase BPM), i (index du clone), bass, mid, treble, flux (0..1)
   - Fonctions : sin, cos, tan, abs, min, max, clamp, smoothstep, constantes pi, tau, opérateurs + - * / % ^
   - Exemple : { "target": "pos.y", "expr": "sin(t * 2 + i * 0.4) * bass * 1.2" }
5. Toutes les couleurs doivent être au format hexadécimal "#RRGGBB".`;
}

/**
 * Génère automatiquement le Prompt IA complet à partir du registre extensible.
 */
export function generateAiPackPromptFromRegistry(): string {
  return generateAiPackPromptV3();
}


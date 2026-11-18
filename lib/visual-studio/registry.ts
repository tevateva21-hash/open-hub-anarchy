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

/**
 * Génère automatiquement le Prompt IA complet à partir du registre extensible.
 */
export function generateAiPackPromptFromRegistry(): string {
  const terrains = TERRAIN_REGISTRY.map((t) => `"${t.value}"`).join(" | ");
  const props = SIDE_PROPS_REGISTRY.map((p) => `"${p.value}"`).join(" | ");
  const meshes = SUBJECT_MESH_REGISTRY.map((m) => `"${m.value}"`).join(" | ");
  const primitives = PROCEDURAL_PRIMITIVE_REGISTRY.map((p) => `"${p.value}"`).join(" | ");
  const cameras = CAMERA_MODE_REGISTRY.map((c) => `"${c.value}"`).join(" | ");
  const bass = BASS_TARGET_REGISTRY.map((b) => `"${b.value}"`).join(" | ");
  const mid = MID_TARGET_REGISTRY.map((m) => `"${m.value}"`).join(" | ");
  const treble = TREBLE_TARGET_REGISTRY.map((t) => `"${t.value}"`).join(" | ");
  const flux = FLUX_TARGET_REGISTRY.map((f) => `"${f.value}"`).join(" | ");

  return `Tu es un directeur artistique 3D temps réel pour Open Hub // Anarchy Visual Studio (Moteur v2 Multi-Calques).
Génère une "Cartouche / Pack 3D v2" au format JSON strict (Anarchy3DPack) contenant un nombre libre de scènes 3D profondes (ex: 5 scènes).

IMPORTANT — RÈGLES STRICTES :
1. Réponds UNIQUEMENT avec un bloc JSON valide (aucun code JS/C++, aucune fonction).
2. Utilise exclusivement les valeurs autorisées issues du Registre :
   - terrain.type : ${terrains}
   - sideProps.type : ${props}
   - subject.meshType : ${meshes}
   - procedural_group parts[].primitive : ${primitives}
   - camera.mode : ${cameras}
   - audioMapping.bassTarget : ${bass}
   - audioMapping.midTarget : ${mid}
   - audioMapping.trebleTarget : ${treble}
   - audioMapping.fluxTarget : ${flux}
3. Tu peux composer plusieurs calques dans "layers[]" (backdrop, terrain, sideProps, subjects) et plusieurs sujets simultanés dans "subjects[]" (y compris "procedural_group" avec "parts[]" pour construire voitures, vaisseaux, temples, masques...).
4. Tu peux doser "postFx" par scène : ps1VertexJitter (0..1), crtScanlines (0..1), chromaticAberration (0..1), kaleidoscopeSegments (0|2|4|6|8), bloomIntensity (0..2).
5. Toutes les couleurs doivent être au format hexadécimal "#RRGGBB".

Schéma JSON v2 attendu :
{
  "packId": "synthwave-outrun-v2",
  "name": "Synthwave // Outrun Highway v2",
  "author": "Anarchy Studio",
  "scenes": [
    {
      "id": "scene-1",
      "name": "01. Sunset Outrun",
      "version": 2,
      "layers": [
        {
          "kind": "backdrop",
          "backdrop": {
            "skyGradient": ["#0B021C", "#38073B"],
            "horizonSun": {
              "enabled": true,
              "colorTop": "#FFD600",
              "colorBottom": "#FF0055",
              "stripes": 6,
              "size": 1.0
            },
            "starfield": { "enabled": true, "density": 0.7, "color": "#00F0FF" }
          }
        },
        {
          "kind": "terrain",
          "terrain": {
            "type": "neon_highway",
            "speed": 14.0,
            "primaryColor": "#00F0FF",
            "secondaryColor": "#FF0055"
          }
        },
        {
          "kind": "sideProps",
          "sideProps": {
            "type": "palm_trees",
            "density": 0.75,
            "primaryColor": "#FF00AA",
            "secondaryColor": "#00F0FF"
          }
        },
        {
          "kind": "subjects",
          "subjects": [
            {
              "meshType": "procedural_group",
              "primaryColor": "#1A1A2E",
              "accentColor": "#FF0055",
              "wireframeOverlay": true,
              "scale": 1.0,
              "position": [0, -0.45, 0],
              "parts": [
                { "primitive": "box", "position": [0, 0, 0], "rotation": [0, 0, 0], "scale": [1.4, 0.35, 2.4], "color": "#1E1B4B", "emissive": false, "wireframe": true },
                { "primitive": "wedge", "position": [0, 0.28, -0.15], "rotation": [0, 0, 0], "scale": [1.1, 0.3, 1.2], "color": "#FF0055", "emissive": true, "wireframe": true }
              ]
            }
          ]
        }
      ],
      "camera": { "mode": "chase_low", "fov": 78, "shakeIntensity": 0.4 },
      "audioMapping": {
        "bassTarget": "camera_zoom_and_jump",
        "midTarget": "terrain_wave_height",
        "trebleTarget": "particles_burst",
        "fluxTarget": "glitch_and_emissive"
      },
      "postFx": {
        "ps1VertexJitter": 0.2,
        "crtScanlines": 0.35,
        "chromaticAberration": 0.3,
        "kaleidoscopeSegments": 0,
        "bloomIntensity": 0.85
      }
    }
  ]
}`;
}

/**
 * Registre extensible centralisé d'Anarchy Visual Studio (Architecture v2 Data-Driven JSON).
 * Tout nouvel élément ajouté ici met automatiquement à jour le typage TypeScript,
 * la validation des Packs 3D JSON et le Prompt IA / documentation dans `/docs/visual-studio`.
 */

export const RETRO_2D_THEME_REGISTRY = [
  {
    value: "none",
    label: "none (Moteur 3D pur)",
    desc: "Utilise uniquement le moteur 3D Low-Poly sans décor 2D rétro.",
  },
  {
    value: "industrial-city",
    label: "industrial-city (16-Bit Pixel Art — Usines, Grue & Train)",
    desc: "Scène originelle 16-bit : usines en parallaxe, grue portuaire, viaduc ferroviaire et éclipse.",
  },
  {
    value: "digital-void",
    label: "digital-void (16-Bit Pixel Art — Tours Serveurs & Abîme)",
    desc: "Scène originelle 16-bit : tours monolithiques, passerelles optiques et pluie numérique.",
  },
  {
    value: "arcade-outrun",
    label: "arcade-outrun (2D Jeu Vidéo — Montagnes Parallaxe & Soleil 16-Bit)",
    desc: "Décor 2D arcade 16-bit : montagnes en dégradé Bayer, soleil strié pixel-art, palmiers et piste néon.",
  },
  {
    value: "cyber-shogun-2d",
    label: "cyber-shogun-2d (2D Jeu Vidéo — Toits Dojo, Lune Sanglante & Pluie)",
    desc: "Décor 2D néo-tokyo 16-bit : pagodes en silhouettes, lune cramoisie tramée, enseignes néon et pluie.",
  },
  {
    value: "ps1-nightmare",
    label: "ps1-nightmare (32-Bit PS1 — Cour Brutaliste & Obélisque)",
    desc: "Scène originelle 32-bit PS1 : cour anguleuse, obélisque inversé suspendu et dallage affine.",
  },
  {
    value: "rave-dungeon",
    label: "rave-dungeon (32-Bit PS1 — Voûte Souterraine & Arches)",
    desc: "Scène originelle 32-bit PS1 : galerie bétonnée, arches métalliques et sol inondé.",
  },
  {
    value: "techno-therapy",
    label: "techno-therapy (32-Bit Cyber Lab — Tunnel & Moniteur ECG)",
    desc: "Scène originelle 32-bit : tunnel octogonal, anneaux rotatifs et électrocardiogramme neural.",
  },
] as const;

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

export const SHADING_MODE_REGISTRY = [
  { value: "flat", label: "flat (Aplats Low-Poly)" },
  { value: "wireframe", label: "wireframe (Filaire Néon Pur)" },
  { value: "toon_cel", label: "toon_cel (Cel-Shading BD + Contours Noirs)" },
  { value: "hologram", label: "hologram (Hologramme Translucide)" },
  { value: "chrome_reflective", label: "chrome_reflective (Chrome Spéculaire)" },
  { value: "neon_glow", label: "neon_glow (Halo Néon Émissif)" },
] as const;

export const COMPOSITION_MODE_REGISTRY = [
  { value: "corridor", label: "corridor (Couloir Terrain + Décors)" },
  { value: "void_orbital", label: "void_orbital (Espace 360° Sans Sol)" },
  { value: "tunnel_infinite", label: "tunnel_infinite (Tunnel Infini BPM)" },
  { value: "kaleido_mandala", label: "kaleido_mandala (Mandala Radial N Axes)" },
  { value: "terrain_flyover", label: "terrain_flyover (Survol Vagues/Montagnes)" },
] as const;

export const GENERATOR_TYPE_REGISTRY = [
  { value: "particle_field", label: "particle_field (Nuage 500–5000 Particules)" },
  { value: "ribbon_trails", label: "ribbon_trails (Rubans / Courbes 3D Fluides)" },
  { value: "audio_wave_mesh", label: "audio_wave_mesh (Maillage Déformé FFT)" },
  { value: "instanced_array", label: "instanced_array (Réseau / Fractale Paramétrique)" },
] as const;

export const PARTICLE_BEHAVIOR_REGISTRY = [
  { value: "vortex", label: "vortex (Tourbillon Orbital)" },
  { value: "explosion_on_kick", label: "explosion_on_kick (Éruption sur Kick)" },
  { value: "rain", label: "rain (Pluie Verticale / Matricielle)" },
  { value: "swarm", label: "swarm (Essaim Organique 3D)" },
] as const;

export const BACKDROP_SHADER_REGISTRY = [
  { value: "none", label: "none (Dégradé Ciel Classique)" },
  { value: "plasma_fluid", label: "plasma_fluid (Plasma Fluide Audio)" },
  { value: "voronoi_cells", label: "voronoi_cells (Cellules Voronoi)" },
  { value: "radial_sunburst", label: "radial_sunburst (Rayons Radiaux BD)" },
  { value: "grid_horizon", label: "grid_horizon (Horizon Grille Rétro)" },
  { value: "noise_fog", label: "noise_fog (Brume Procédurale)" },
] as const;

export const CAMERA_RIG_REGISTRY = [
  { value: "orbit_smooth", label: "orbit_smooth (Orbite 360° Fluide)" },
  { value: "dolly_zoom_on_kick", label: "dolly_zoom_on_kick (Vertigo sur Kick)" },
  { value: "first_person_fly", label: "first_person_fly (Vol FPV Dynamique)" },
  { value: "top_down_spin", label: "top_down_spin (Plongée Zénithale Rotative)" },
  { value: "handheld_shake", label: "handheld_shake (Caméra Épaule Organique)" },
] as const;

export type AnarchyShadingMode = (typeof SHADING_MODE_REGISTRY)[number]["value"];
export type AnarchyCompositionMode = (typeof COMPOSITION_MODE_REGISTRY)[number]["value"];
export type AnarchyGeneratorType = (typeof GENERATOR_TYPE_REGISTRY)[number]["value"];
export type AnarchyParticleBehavior = (typeof PARTICLE_BEHAVIOR_REGISTRY)[number]["value"];
export type AnarchyBackdropShader = (typeof BACKDROP_SHADER_REGISTRY)[number]["value"];
export type AnarchyCameraRig = (typeof CAMERA_RIG_REGISTRY)[number]["value"];

export const STUDIO_LIGHTING_PRESET_REGISTRY = [
  { value: "studio_clean", label: "studio_clean (Éclairage Studio Blanc Doux)" },
  { value: "cyber_neon", label: "cyber_neon (Rim-Light Cyan / Magenta)" },
  { value: "sunset_warm", label: "sunset_warm (Coucher de Soleil Doré)" },
  { value: "dark_void", label: "dark_void (Clair-Obscur Cinéma)" },
] as const;

export const V4_BACKDROP_TYPE_REGISTRY = [
  { value: "liquid_plasma", label: "liquid_plasma (Plasma Liquide Organique)" },
  { value: "gradient_sky", label: "gradient_sky (Dégradé Studio / Ciel)" },
  { value: "starfield", label: "starfield (Champ d'Étoiles Profond)" },
  { value: "grid_horizon", label: "grid_horizon (Horizon Grille Perspective)" },
  { value: "solid_color", label: "solid_color (Fond Uni Minimaliste)" },
] as const;

export const TONE_MAPPING_REGISTRY = [
  { value: "aces_filmic", label: "aces_filmic (Cinéma ACES Filmic)" },
  { value: "reinhard", label: "reinhard (Doux Équilibré)" },
  { value: "cineon", label: "cineon (Pellicule Ciné)" },
  { value: "none", label: "none (Brut Linéaire)" },
] as const;

export const ACTOR_TYPE_REGISTRY = [
  { value: "organic_blob", label: "organic_blob (Sphère Organique Déformée 3D)" },
  { value: "wave_terrain", label: "wave_terrain (Surface d'Ondes Simplex + FFT)" },
  { value: "spline_ribbons", label: "spline_ribbons (Rubans / Courbes Bézier Fluides)" },
  { value: "particle_swarm", label: "particle_swarm (Essaim 1k–10k Particules)" },
  { value: "glb_model", label: "glb_model (Modèle 3D .glb + Surcharge Matériau)" },
  { value: "sprite_2d", label: "sprite_2d (Plan 2D Illustration BD Parallaxe)" },
  { value: "parallax_layer", label: "parallax_layer (Plan 2.5D Aquarelle / Gouache Parallaxe)" },
  { value: "cartoon_sprite", label: "cartoon_sprite (Spritesheet BPM + Contour Encre Noir)" },
  { value: "rubber_hose_mesh", label: "rubber_hose_mesh (Formes Rubber-Hose 1930 Cel-Shading)" },
  { value: "physics_spawner", label: "physics_spawner (Émetteur d'Instances Physiques & Collisions v7)" },
] as const;

export const RUBBER_HOSE_SHAPE_REGISTRY = [
  { value: "hose_arms", label: "hose_arms (Bras / Tuyaux Ondulants)" },
  { value: "pie_eyes", label: "pie_eyes (Yeux Pie-Eyes Rétro 1930)" },
  { value: "vintage_wheel", label: "vintage_wheel (Roue / Engrenage Cartoon)" },
  { value: "music_notes", label: "music_notes (Notes de Musique Rebondissantes)" },
  { value: "fluffy_clouds", label: "fluffy_clouds (Nuages Rétro 1930)" },
  { value: "theater_curtains", label: "theater_curtains (Rideaux de Théâtre Rouges)" },
  { value: "boss_character", label: "boss_character (Boss Rubber-Hose Rebondissant)" },
  { value: "psyche_tunnel", label: "psyche_tunnel (Tunnel Psychédélique Cartoon)" },
] as const;

export const PARALLAX_PATTERN_REGISTRY = [
  { value: "watercolor_hills", label: "watercolor_hills (Collines Peintes à l'Aquarelle)" },
  { value: "stage_curtains", label: "stage_curtains (Scène & Rideaux de Théâtre 1930)" },
  { value: "city_silhouette", label: "city_silhouette (Silhouettes Urbaines Encre)" },
  { value: "clouds_band", label: "clouds_band (Bande de Nuages Gouache)" },
  { value: "checker_floor", label: "checker_floor (Sol Damier Perspective Cartoon)" },
  { value: "psyche_rings", label: "psyche_rings (Anneaux Hypnotiques Psyché)" },
] as const;

export const VINTAGE_COLOR_GRADE_REGISTRY = [
  { value: "technicolor_30s", label: "technicolor_30s (Technicolor 2-Strip 1930)" },
  { value: "sepia_warm", label: "sepia_warm (Sépia Chaud Pellicule)" },
  { value: "black_and_white_ink", label: "black_and_white_ink (Noir & Blanc Encre)" },
  { value: "none", label: "none (Couleurs Natives)" },
] as const;

export const STEPPED_FPS_OPTIONS = [12, 24, 60] as const;

export const SWARM_BEHAVIOR_REGISTRY = [
  { value: "curl_noise_flow", label: "curl_noise_flow (Flux Fluide Curl-Noise)" },
  { value: "vortex", label: "vortex (Tourbillon Orbital)" },
  { value: "beat_explosion", label: "beat_explosion (Explosion sur Kick/Beat)" },
  { value: "floating_dust", label: "floating_dust (Poussière Cinéma Flottante)" },
] as const;

export const MATERIAL_OVERRIDE_REGISTRY = [
  { value: "chrome", label: "chrome (Chrome Liquide Réfléchissant)" },
  { value: "frosted_glass", label: "frosted_glass (Verre Dépoli Translucide)" },
  { value: "matcap_clay", label: "matcap_clay (Argile Sculptée Matcap)" },
  { value: "toon_cel_outline", label: "toon_cel_outline (BD Cel-Shading + Contours)" },
  { value: "emissive_neon", label: "emissive_neon (Néon Émissif Pur)" },
] as const;

export const MODULATION_SOURCE_REGISTRY = [
  "bass",
  "lowMid",
  "highMid",
  "treble",
  "energy",
  "kick",
  "snare",
  "lfo_1",
  "lfo_2",
  "lfo_3",
  "lfo_4",
  "fader_1",
  "fader_2",
  "fader_3",
  "fader_4",
  "fader_5",
  "fader_6",
  "fader_7",
  "fader_8",
  "fader_9",
  "fader_10",
  "fader_11",
  "fader_12",
  "fader_13",
  "fader_14",
  "fader_15",
  "fader_16",
  "fader_17",
  "fader_18",
  "fader_19",
] as const;

export const MODULATION_TARGET_REGISTRY = [
  { value: "scale", label: "scale (Échelle Globale)" },
  { value: "noiseStrength", label: "noiseStrength (Amplitude Déformation Bruit)" },
  { value: "rotationSpeed", label: "rotationSpeed (Vitesse de Rotation)" },
  { value: "emissiveIntensity", label: "emissiveIntensity (Intensité Émissive)" },
  { value: "positionY", label: "positionY (Élévation Verticale Y)" },
  { value: "squashStretch", label: "squashStretch (Écrasement / Étirement Cartoon)" },
  { value: "lineBoil", label: "lineBoil (Vibration d'Encre)" },
  { value: "filmGrain", label: "filmGrain (Grain Pellicule 35 mm)" },
  { value: "parallaxSpeed", label: "parallaxSpeed (Vitesse Parallaxe)" },
  { value: "steppedFps", label: "steppedFps (Cadence 12 / 24 / 60 FPS)" },
  { value: "zoom", label: "zoom (Zoom / Distance Caméra)" },
  { value: "fov", label: "fov (Angle de Champ Caméra)" },
  { value: "fogDensity", label: "fogDensity (Densité Brouillard)" },
  { value: "gravity", label: "gravity (Multiplicateur Gravité v7)" },
  { value: "restitution", label: "restitution (Élasticité / Rebond v7)" },
  { value: "impulseForce", label: "impulseForce (Force des Impulsions Audio v7)" },
  { value: "springStiffness", label: "springStiffness (Raideur des Ressorts v7)" },
] as const;

export const MORPH_EASING_REGISTRY = [
  { value: "linear", label: "linear (Linéaire Constant)" },
  { value: "easeInOutCubic", label: "easeInOutCubic (Cubique Doux)" },
  { value: "elasticOut", label: "elasticOut (Rebond Élastique Cartoon)" },
  { value: "expoIn", label: "expoIn (Accélération Exponentielle Drop)" },
] as const;

export const SWARM_SHAPE_TARGET_REGISTRY = [
  { value: "sphere", label: "sphere (Sphère Orbitale 3D)" },
  { value: "vortex", label: "vortex (Tourbillon / Spirale)" },
  { value: "tunnel", label: "tunnel (Tunnel Infini)" },
  { value: "grid", label: "grid (Matrice / Grille 3D)" },
  { value: "text_outline", label: "text_outline (Silhouette Logo ANARCHY)" },
] as const;

export const LFO_WAVEFORM_REGISTRY = [
  { value: "sine", label: "sine (Onde Sinusoïdale)" },
  { value: "triangle", label: "triangle (Onde Triangulaire)" },
  { value: "saw", label: "saw (Dent de Scie)" },
  { value: "square", label: "square (Onde Carrée)" },
  { value: "random_hold", label: "random_hold (Sample & Hold Aléatoire)" },
] as const;

export const LFO_RATE_BEATS_OPTIONS = [0.25, 0.5, 1, 2, 4, 8] as const;

export const CAMERA_CUT_TRANSITION_REGISTRY = [
  { value: "cut", label: "cut (Coupe Franche)" },
  { value: "glide", label: "glide (Glissement Fluide Rapide)" },
] as const;

export const PHYSICS_BOUNDS_SHAPE_REGISTRY = [
  { value: "box", label: "box (Boîte / Arène 3D Fermée)" },
  { value: "sphere", label: "sphere (Bulle / Dôme Sphérique)" },
  { value: "floor_only", label: "floor_only (Sol Élastique Ouvert)" },
] as const;

export const PHYSICS_BODY_TYPE_REGISTRY = [
  { value: "dynamic", label: "dynamic (Corps Dynamique Soumis aux Forces & Collisions)" },
  { value: "kinematic", label: "kinematic (Corps Piloté par Animation / Orbite)" },
  { value: "static", label: "static (Obstacle / Point d'Ancrage Fixe)" },
] as const;

export const PHYSICS_IMPULSE_SOURCE_REGISTRY = [
  { value: "bass", label: "bass (Impulsion sur Basses / Kick)" },
  { value: "snare", label: "snare (Impulsion sur Caisse Claire / Clap)" },
  { value: "treble", label: "treble (Impulsion sur Aigus / Hi-Hats)" },
  { value: "kick", label: "kick (Impulsion sur Kick Pur)" },
] as const;

export const PHYSICS_JOINT_TYPE_REGISTRY = [
  { value: "spring", label: "spring (Ressort Souple / Chaîne Rubber-Hose)" },
] as const;

export const PHYSICS_SPAWN_SHAPE_REGISTRY = [
  { value: "chrome_sphere", label: "chrome_sphere (Sphère Chrome Liquide)" },
  { value: "music_note", label: "music_note (Note de Musique Cartoon 1930)" },
  { value: "comic_star", label: "comic_star (Étoile / Forme BD Cel-Shading)" },
  { value: "pie_eye_ball", label: "pie_eye_ball (Bille Pie-Eye Rétro)" },
] as const;

export const POST_FX_STACK_TYPE_REGISTRY = [
  { value: "bloom", label: "bloom (Halo Lumineux Cinéma)" },
  { value: "depth_of_field", label: "depth_of_field (Flou de Profondeur Blender)" },
  { value: "toon_outline", label: "toon_outline (Contours Noirs Plume BD)" },
  { value: "chromatic_aberration", label: "chromatic_aberration (Aberration Chromatique)" },
  { value: "film_grain", label: "film_grain (Grain Pellicule 35mm)" },
  { value: "pixelate", label: "pixelate (Pixelisation Rétro Optionnelle)" },
  { value: "vintage_1930_film", label: "vintage_1930_film (Pellicule 1930 : Grain, Rayures, Gate Weave, Technicolor/Sépia/N&B)" },
] as const;

export const SCENE_TRANSITION_REGISTRY = [
  { value: "cut", label: "cut (Coupure Franche)" },
  { value: "crossfade", label: "crossfade (Fondu Enchaîné)" },
  { value: "camera_swoop", label: "camera_swoop (Mouvement Caméra Rapide)" },
  { value: "flash", label: "flash (Flash Lumineux au Beat)" },
  { value: "morph", label: "morph (Morphing Géométrique & Particules Inter-Scènes)" },
] as const;

export const EXTENDED_BARS_OPTIONS = [0, 1, 2, 4, 8, 16, 32, 64] as const;

export type AnarchyStudioLightingPreset = (typeof STUDIO_LIGHTING_PRESET_REGISTRY)[number]["value"];
export type AnarchyV4BackdropType = (typeof V4_BACKDROP_TYPE_REGISTRY)[number]["value"];
export type AnarchyToneMapping = (typeof TONE_MAPPING_REGISTRY)[number]["value"];
export type AnarchyActorType = (typeof ACTOR_TYPE_REGISTRY)[number]["value"];
export type AnarchyRubberHoseShape = (typeof RUBBER_HOSE_SHAPE_REGISTRY)[number]["value"];
export type AnarchyParallaxPattern = (typeof PARALLAX_PATTERN_REGISTRY)[number]["value"];
export type AnarchyVintageColorGrade = (typeof VINTAGE_COLOR_GRADE_REGISTRY)[number]["value"];
export type AnarchySteppedFps = (typeof STEPPED_FPS_OPTIONS)[number];
export type AnarchySwarmBehavior = (typeof SWARM_BEHAVIOR_REGISTRY)[number]["value"];
export type AnarchyMaterialOverride = (typeof MATERIAL_OVERRIDE_REGISTRY)[number]["value"];
export type AnarchyModulationSource = (typeof MODULATION_SOURCE_REGISTRY)[number];
export type AnarchyModulationTarget = (typeof MODULATION_TARGET_REGISTRY)[number]["value"];
export type AnarchyPostFxStackType = (typeof POST_FX_STACK_TYPE_REGISTRY)[number]["value"];
export type AnarchySceneTransitionType = (typeof SCENE_TRANSITION_REGISTRY)[number]["value"];
export type AnarchyMorphEasing = (typeof MORPH_EASING_REGISTRY)[number]["value"];
export type AnarchySwarmShapeTarget = (typeof SWARM_SHAPE_TARGET_REGISTRY)[number]["value"];
export type AnarchyLfoWaveform = (typeof LFO_WAVEFORM_REGISTRY)[number]["value"];
export type AnarchyLfoRateBeats = (typeof LFO_RATE_BEATS_OPTIONS)[number];
export type AnarchyCameraCutTransition = (typeof CAMERA_CUT_TRANSITION_REGISTRY)[number]["value"];
export type AnarchyPhysicsBoundsShape = (typeof PHYSICS_BOUNDS_SHAPE_REGISTRY)[number]["value"];
export type AnarchyPhysicsBodyType = (typeof PHYSICS_BODY_TYPE_REGISTRY)[number]["value"];
export type AnarchyPhysicsImpulseSource = (typeof PHYSICS_IMPULSE_SOURCE_REGISTRY)[number]["value"];
export type AnarchyPhysicsJointType = (typeof PHYSICS_JOINT_TYPE_REGISTRY)[number]["value"];
export type AnarchyPhysicsSpawnShape = (typeof PHYSICS_SPAWN_SHAPE_REGISTRY)[number]["value"];

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
export type AnarchyRetro2DTheme =
  (typeof RETRO_2D_THEME_REGISTRY)[number]["value"];

export interface JsonSnippet3D {
  id: string;
  label: string;
  target: "backdrop" | "subject" | "retro2d";
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
  {
    id: "quantized-reactor-v4",
    label: "Réacteur Quantifié (v4)",
    target: "subject",
    description: "Couronne radiale v4 utilisant u, pulse(beat), mix() et step()",
    payload: {
      meshType: "procedural_group",
      primaryColor: "#0F172A",
      accentColor: "#00F0FF",
      wireframeOverlay: true,
      scale: 1.0,
      position: [0, 0.15, -1.2],
      cloner: {
        mode: "radial",
        count: 12,
        offset: [1.85, 0, 0],
        stepRotation: [0, 30, 0],
        stepScale: [1, 1, 1],
      },
      animations: [
        { target: "pos.y", expr: "mix(-0.4, 0.8, pulse(beat + u, 0.35)) * (0.6 + bass)" },
        { target: "scale", expr: "0.8 + step(0.5, fract(u * 3 + beat)) * 0.45 * bass" },
        { target: "rot.y", expr: "t * 0.7 + u * tau" },
      ],
      parts: [
        {
          primitive: "icosahedron",
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [0.42, 0.75, 0.42],
          color: "#00F0FF",
          emissive: true,
          wireframe: true,
        },
      ],
    },
  },
];

export const TRIGGER_ACTION_REGISTRY = [
  { value: "boost_fov", label: "boost_fov (Ouverture brusque FOV)" },
  { value: "flash_sky", label: "flash_sky (Éclair de luminosité)" },
  { value: "spin_burst", label: "spin_burst (Accélération rotation)" },
  { value: "jitter_spike", label: "jitter_spike (Pic vertex jitter PS1)" },
  { value: "emissive_surge", label: "emissive_surge (Surbrillance néon)" },
] as const;

/**
 * Génère le Prompt IA complet v4 (cloners, expressions mathématiques étendues, params, triggers, style & BPM actif).
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
  const cameraRigs = CAMERA_RIG_REGISTRY.map((r) => `"${r.value}"`).join(" | ");
  const shadings = SHADING_MODE_REGISTRY.map((s) => `"${s.value}"`).join(" | ");
  const compositions = COMPOSITION_MODE_REGISTRY.map((c) => `"${c.value}"`).join(" | ");
  const generatorTypes = GENERATOR_TYPE_REGISTRY.map((g) => `"${g.value}"`).join(" | ");
  const particleBehaviors = PARTICLE_BEHAVIOR_REGISTRY.map((b) => `"${b.value}"`).join(" | ");
  const backdropShaders = BACKDROP_SHADER_REGISTRY.map((b) => `"${b.value}"`).join(" | ");
  const lightingPresets = STUDIO_LIGHTING_PRESET_REGISTRY.map((l) => `"${l.value}"`).join(" | ");
  const v4Backdrops = V4_BACKDROP_TYPE_REGISTRY.map((b) => `"${b.value}"`).join(" | ");
  const toneMappings = TONE_MAPPING_REGISTRY.map((t) => `"${t.value}"`).join(" | ");
  const actorTypes = ACTOR_TYPE_REGISTRY.map((a) => `"${a.value}"`).join(" | ");
  const swarmBehaviors = SWARM_BEHAVIOR_REGISTRY.map((s) => `"${s.value}"`).join(" | ");
  const materials = MATERIAL_OVERRIDE_REGISTRY.map((m) => `"${m.value}"`).join(" | ");
  const modTargets = MODULATION_TARGET_REGISTRY.map((m) => `"${m.value}"`).join(" | ");
  const postFxStack = POST_FX_STACK_TYPE_REGISTRY.map((p) => `"${p.value}"`).join(" | ");
  const transitions = SCENE_TRANSITION_REGISTRY.map((t) => `"${t.value}"`).join(" | ");
  const rubberShapes = RUBBER_HOSE_SHAPE_REGISTRY.map((r) => `"${r.value}"`).join(" | ");
  const parallaxPatterns = PARALLAX_PATTERN_REGISTRY.map((p) => `"${p.value}"`).join(" | ");
  const vintageGrades = VINTAGE_COLOR_GRADE_REGISTRY.map((v) => `"${v.value}"`).join(" | ");
  const morphEasings = MORPH_EASING_REGISTRY.map((m) => `"${m.value}"`).join(" | ");
  const swarmShapes = SWARM_SHAPE_TARGET_REGISTRY.map((s) => `"${s.value}"`).join(" | ");
  const lfoWaveforms = LFO_WAVEFORM_REGISTRY.map((w) => `"${w.value}"`).join(" | ");
  const cloners = CLONER_MODE_REGISTRY.map((c) => `"${c.value}"`).join(" | ");
  const triggers = TRIGGER_ACTION_REGISTRY.map((t) => `"${t.value}"`).join(" | ");
  const bass = BASS_TARGET_REGISTRY.map((b) => `"${b.value}"`).join(" | ");
  const mid = MID_TARGET_REGISTRY.map((m) => `"${m.value}"`).join(" | ");
  const treble = TREBLE_TARGET_REGISTRY.map((t) => `"${t.value}"`).join(" | ");
  const flux = FLUX_TARGET_REGISTRY.map((f) => `"${f.value}"`).join(" | ");

  const stylePreset =
    AI_STYLE_PRESETS.find((s) => s.id === styleId) ?? AI_STYLE_PRESETS[0];

  return `Tu es un directeur artistique 3D / 2.5D temps réel pour Open Hub // Anarchy Visual Studio (Moteur v7 Data-Driven Cartoon Physics & Collisions, Morphing Inter-Scènes, DAW Automations & Cartoon 1930).
Génère une "Cartouche / Pack 3D" au format JSON strict (Anarchy3DPackV7) contenant 3 à 5 scènes enchaînées par morphing fluide à ${Math.round(activeBpm)} BPM.

DIRECTION ARTISTIQUE DEMANDÉE (${stylePreset.label}) :
- Palette conseillée : ${stylePreset.paletteHint}
- Décors & Sujets : ${stylePreset.terrainHint}
- Post-FX suggérés : ${stylePreset.fxHint}

ARCHITECTURE MODULAIRE EN 3 COUCHES + PHYSIQUE CARTOON v7, MORPHING & DAW (Anarchy3DPackV7) :
1. COUCHE 1 — ENVIRONNEMENT & ÉCLAIRAGE STUDIO ("environment" & "renderStyle") :
   - environment.lightingPreset : ${lightingPresets}
   - environment.backdropType : ${v4Backdrops} (avec backdropColors: ["#...", "#...", "#..."])
   - environment.fog : { "enabled": true, "color": "#...", "density": 0.03 }
   - renderStyle : { "resolutionScale": 0.2..1.0 (1.0 = HD net), "toneMapping": ${toneMappings}, "shading": ${shadings}, "outlineThickness": 0..6 }

2. COUCHE 2 — ACTEURS ORGANIQUES, CARTOON 1930, MORPHING & ÉMETTEUR PHYSIQUE ("actors[]") :
   - actors[].type : ${actorTypes}
   - MORPHING INTER-SCÈNES ("morphTransition" / shared "id") :
     * Conserve le MÊME "id" (ex: "id": "main_entity") d'une scène à l'autre pour interpoler sa géométrie (Vertex Lerp : organic_blob ↔ rubber_hose_mesh ↔ particle_swarm), ses couleurs et ses positions sur "morphTransition": { "durationBeats": 4, "easing": ${morphEasings} }.
     * Pour "particle_swarm", définis "shapeTarget": ${swarmShapes} afin que chaque particule glisse vers sa nouvelle forme cible.
   - Acteurs Cartoon 1930 / Cuphead :
     * "parallax_layer" : plan 2.5D (pattern: ${parallaxPatterns}, scrollX, scrollY, depthBlur)
     * "cartoon_sprite" : spritesheet (framesX, framesY, bpmSync: true, inkOutline: true)
     * "rubber_hose_mesh" : formes 1930 cel-shading + contour noir épais (shape: ${rubberShapes}, inkThickness: 2..5)
   - Acteur Émetteur Physique v7 ("physics_spawner") :
     * Génère périodiquement ou sur chaque kick des instances physiques légères : { "type": "physics_spawner", "spawnShape": "chrome_sphere" | "music_note" | "comic_star" | "pie_eye_ball", "spawnRateBeats": 1, "spawnOnKick": true, "ttlBars": 4, "maxInstances": 16, "physics": { "bodyType": "dynamic", "mass": 1.0, "restitution": 0.92, "collisionSquash": true } }
   - actors[].material : ${materials} · behavior : ${swarmBehaviors}
   - actors[].audioModulation[] : source ("bass" | "lowMid" | "highMid" | "treble" | "energy" | "kick" | "snare" | "lfo_1".."lfo_4" | "fader_1".."fader_19") → target (${modTargets}).

3. MOTEUR DE PHYSIQUE CARTOON & COLLISIONS v7 ("physicsWorld", "actor.physics", "joints[]") :
   - physicsWorld : { "enabled": true, "gravity": [0, -9.8, 0] (ou [0, 0, 0] apesanteur), "bounds": { "shape": "box" | "sphere" | "floor_only", "radiusOrSize": 2.4, "restitution": 0.85 }, "faderBindings": { "gravity": "fader_1", "restitution": "fader_2", "impulseForce": "fader_3", "springStiffness": "fader_4" } }
   - actor.physics : { "bodyType": "dynamic" | "kinematic" | "static", "mass": 1.0, "restitution": 0.0..1.2, "friction": 0.15, "linearDamping": 0.08, "collisionSquash": true, "audioImpulses": [{ "source": "bass" | "snare" | "treble" | "kick", "force": [0, 6.5, 0], "torque": [0, 0, 2.0], "randomSpread": 1.2 }] }
   - joints[] : liaisons élastiques entre deux acteurs : [{ "type": "spring", "actorA": "anchor_top", "actorB": "link_1", "stiffness": 18.0, "damping": 0.85, "restLength": 0.65 }]

4. PROGRAMMATION DAW ("automations[]", "modulators[]", "cameraCuts[]") :
   - automations[] : courbes sur la durée de la scène (progress 0.0 → 1.0) : { "target": ${modTargets}, "actorId"?: "main_entity", "from": 0.2, "to": 1.4, "easing": ${morphEasings} }
   - modulators[] : LFO synchronisés au BPM : { "id": "lfo_1".."lfo_4", "waveform": ${lfoWaveforms}, "rateBeats": 0.25 | 0.5 | 1 | 2 | 4 | 8, "phase": 0..1 }
   - cameraCuts[] : multi-caméras rythmiques : { "mode": ${cameras}, "rig"?: ${cameraRigs}, "fov": 68, "switchEveryBars"?: 2, "onPeakBand"?: "snare" | "kick" | "bass", "transition": "cut" | "glide" }

5. PHYSIQUE CARTOON ("cartoonPhysics") & COUCHE 3 POST-PROCESSING ("postFX[]", "durationBars", "transition") :
   - cartoonPhysics : { "steppedFps": 12 | 24 | 60, "squashStretch": 0..1.5, "squashTrigger": "bass" | "snare" | "kick" | "energy", "lineBoil": 0..2, "faderBindings": { "squashStretch": "fader_1", "lineBoil": "fader_2", "filmGrain": "fader_3", "parallaxSpeed": "fader_4", "steppedFps": "fader_5" } }
   - postFX[] : pile d'objets { "type": ${postFxStack}, "intensity": 0..2 } (dont "vintage_1930_film" colorGrade: ${vintageGrades} et "toon_outline" inkThickness/inkJitter)
   - durationBars : 1 | 2 | 4 | 8 | 16 | 32 | 64 mesures · transition : ${transitions}

RÈGLES STRICTES & RÉTROCOMPATIBILITÉ (v1–v6) :
- Réponds UNIQUEMENT avec un bloc JSON valide (zéro JS, zéro fonction, zéro \`eval\`).
- Champs v2/v3 toujours supportés : compositionMode (${compositions}), backdrop.shader (${backdropShaders}), generators[] (${generatorTypes}, behavior: ${particleBehaviors}), camera.mode (${cameras}), camera.rig (${cameraRigs}, beatCut), terrain (${terrains}), sideProps (${props}), subject (${meshes}, primitives: ${primitives}), cloner.mode (${cloners}), triggers[].action (${triggers}), audioMapping (bass: ${bass}; mid: ${mid}; treble: ${treble}; flux: ${flux}).
- Toutes les couleurs doivent être au format hexadécimal "#RRGGBB".`;
}

export const generateAiPackPromptV4 = generateAiPackPromptV3;
export const generateAiPackPromptV5 = generateAiPackPromptV3;
export const generateAiPackPromptV6 = generateAiPackPromptV3;
export const generateAiPackPromptV7 = generateAiPackPromptV3;

/**
 * Génère automatiquement le Prompt IA complet à partir du registre extensible.
 */
export function generateAiPackPromptFromRegistry(): string {
  return generateAiPackPromptV3();
}


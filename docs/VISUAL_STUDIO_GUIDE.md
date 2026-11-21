# Documentation Complète — Anarchy Visual Studio 3D (Data-Driven JSON)

Guide de référence officiel pour **Anarchy Visual Studio** (`/anarchy-visual-design`).

---

## 1. Architecture & Philosophie du Studio

Anarchy Visual Studio est un moteur graphique **3D Low-Poly / PS1-PS2 profond temps réel (60 FPS)** exécuté intégralement dans le navigateur avec tri Z-buffer, ombrage Lambert directionnel, brouillard de profondeur, dithering Bayer 4×4 et Web Audio FFT 24 kHz (aucune latence serveur pour le rendu).

- **Architecture Data-Driven JSON (`Anarchy3DPack` & `Anarchy3DScene`)** : aucune exécution de code arbitraire (`eval` / `new Function` strictement bannis). Chaque Pack 3D est une cartouche JSON pure validée en temps réel avec fallback automatique si une propriété est absente ou inconnue.
- **Studio principal (`/anarchy-visual-design`)** : pilotage musical, **Packs de Scènes 3D JSON** enchaînés au BPM, éditeur JSON en direct + inspecteur visuel 3D (`environment`, `subject`, `camera`, `audioMapping`), couleurs/variations, formats réseaux sociaux, 10 faders live souverains, paroles/Whisper et export MP4 avec son.
- **Documentation (`/docs/visual-studio`)** : accessible depuis la barre du haut (`📖 DOCUMENTATION`), le bandeau du Studio (`📖 DOCS STUDIO`) et `/docs`.

---

## 2. Audio Lab & Zone d'Extrait Prévisualisée (max 70 Mio)

### Sources Audio
1. **Piste Locale Analysée** : importez un fichier **MP3** ou **WAV** jusqu'à **70 Mio** et **8 minutes** (cache hors-ligne IndexedDB conservant les 5 dernières analyses FFT 24 kHz).
2. **Piste Démo (WAV 120 BPM)** : génère instantanément un morceau synthétique de test pour expérimenter sans fichier local.
3. **Synchro Lecteur Open Hub** : synchronise les visuels directement avec l'audio du lecteur global.

### Waveform & Curseur .NET MAUI
- **Curseur continu sans crans** : cliquez ou glissez librement sur la waveform pour placer la tête de lecture à la seconde exacte.
- **Zone d'extrait glissable (30s par défaut, réglable 5s → 120s)** : la fenêtre surlignée sur la waveform représente exactement la zone prévisualisée à l'écoute **et** la zone exportée dans le MP4.
- **Fondus Entrée / Sortie (Fade In / Fade Out)** : appliqués en temps réel au volume audio et embarqués dans le flux audio du MP4 exporté.
- **Pause Globale du Site (`⏸ PAUSE`)** : coupe instantanément toute lecture audio active sur le site (piste locale et lecteur global), également accessible via le badge rouge haut-droite.

---

## 3. Schéma JSON d'une Cartouche / Pack 3D (`Anarchy3DPack`)

Chaque Pack 3D exportable ou généré par une IA suit ce schéma JSON strict :

```json
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
}
```

### Valeurs autorisées par propriété (Registre centralisé `lib/visual-studio/registry.ts`)
- **`terrain.type`** : `'infinite_grid' | 'neon_highway' | 'lowpoly_mountains' | 'dojo_pillars' | 'tunnel' | 'mirror_floor'`
- **`sideProps.type`** : `'none' | 'palm_trees' | 'cyber_towers' | 'dojo_pillars' | 'neon_arches'`
- **`subject.meshType`** : `'voxel_runner' | 'floating_monolith' | 'cyber_katana' | 'abstract_polyhedron' | 'procedural_group' | 'none'`
- **`procedural_group parts[].primitive`** : `'box' | 'pyramid' | 'wedge' | 'cylinder' | 'torus' | 'icosahedron' | 'ring'`
- **`postFx`** : `ps1VertexJitter (0..1)`, `crtScanlines (0..1)`, `chromaticAberration (0..1)`, `kaleidoscopeSegments (0|2|4|6|8)`, `bloomIntensity (0..2)`
- **`camera.mode`** : `'chase_low' | 'orbit' | 'fps_arms' | 'dramatic_tilt'`
- **`audioMapping.bassTarget`** : `'camera_zoom_and_jump' | 'subject_pulse' | 'pillar_slam' | 'tunnel_boost'`
- **`audioMapping.midTarget`** : `'terrain_wave_height' | 'subject_rotation' | 'color_shift' | 'camera_sway'`
- **`audioMapping.trebleTarget`** : `'particles_burst' | 'wireframe_glow' | 'sky_flash' | 'katana_slash'`
- **`audioMapping.fluxTarget`** : `'glitch_and_emissive' | 'camera_shake' | 'fov_kick' | 'invert_strobe'`

> **Rétrocompatibilité v1 → v2** : les anciens Packs JSON v1 (`environment` + `subject` unique, sans `layers[]` ni `postFx`) sont automatiquement convertis à la volée vers le pipeline multi-calques v2 (`backdrop`, `terrain`, `sideProps`, `subjects[]`). Les couleurs JSON ont toujours la priorité absolue sur la palette par défaut de l'interface.

---

## 4. Articulation avec les 10 Faders & l'Horloge BPM (Zéro conflit)

- **Les Faders restent souverains** : le JSON définit les *valeurs de base* (`terrainSpeed`, `shakeIntensity`, `fogDensity`, `fov`, `scale`, `audioMapping.*`), et les **10 faders de l'interface** agissent comme **multiplicateurs en temps réel** par-dessus.
- **L'Horloge BPM pilote le tableau `scenes[]`** : que le pack JSON contienne 2, 5 ou 12 scènes, le séquenceur boucle proprement sur `pack.scenes` toutes les **2 mesures (8T)** ou **4 mesures (16T)** selon le BPM réglé.
- **Isolation stricte** : changer de Pack 3D ou importer un JSON ne réinitialise jamais aucun des 10 faders ni le BPM.

---

## 5. Éditeur JSON, Import/Export & Prompt IA intégré

Dans le panneau **`PACK DE SCÈNES // ENCHAÎNEMENT BPM`** :
1. **`{ } ÉDITER / VOIR LE JSON`** : éditez le JSON complet du pack avec validation du schéma en temps réel, ou utilisez l'Inspecteur Visuel 3D (`environment`, `subject`, `camera`, `audioMapping`) et le bouton **`+ Ajouter une scène`**.
2. **`⇄ IMPORTER / EXPORTER UN PACK (.JSON / COPIER LE CODE)`** : copiez le JSON en 1 clic, téléchargez un fichier `.json`, ou importez un Pack 3D JSON généré par IA.
3. **`📖 DOC / GÉNÉRER AVEC UNE IA`** : consultez toutes les valeurs autorisées et cliquez sur **`📋 Copier le Prompt IA`** pour générer un Pack 3D JSON 100% valide dans ChatGPT, Claude ou Gemini.

## 6. Moteur v3 : Cloneurs Procéduraux, Expressions Mathématiques & JSON Studio Composer

- **Cloneurs Procéduraux (`cloner`)** sur tout sujet de `subjects[]` ou élément de `parts[]` :
  - `mode` : `linear | radial | grid | spiral`
  - `count` : `2..64` (plafonné à 256 primitives/instances par scène pour garantir 60 FPS)
  - `offset` : `[dx, dy, dz]` · `stepRotation` : `[rx, ry, rz]` en degrés · `stepScale` : `[sx, sy, sz]`
- **Expressions Mathématiques Temps Réel (`animations[]`, 100 % sandboxé sans `eval`)** :
  - Cibles : `pos.x`, `pos.y`, `pos.z`, `rot.x`, `rot.y`, `rot.z`, `scale`, `scale.x`, `scale.y`, `scale.z`, `emissiveIntensity`, `fov`
  - Variables : `t` (secondes), `beat` (phase BPM `0..1`), `i` (index du clone), `bass`, `mid`, `treble`, `flux` (`0..1`)
  - Fonctions : `sin`, `cos`, `tan`, `abs`, `min`, `max`, `clamp`, `smoothstep`, constantes `pi`, `tau`, opérateurs `+ - * / % ^`
- **JSON Studio Composer** dans `{ } ÉDITER / VOIR LE JSON` :
  - **Snippets 3D** insérables en 1 clic (*Soleil Synthwave Strié*, *Spirale d'Anneaux Néon*, *Arche Brutaliste*, *Véhicule Low-Poly*, *Matrice de Monolithes*).
  - **Générateur de Prompt IA v3** avec sélecteur de style (*Hotline Miami*, *PS1 Dark Fantasy*, *Brutalist Techno*, *Cyberpunk Tokyo*, *Acid Rave*) injectant automatiquement le **BPM actif**.
  - Boutons **`✨ Prettify`** et **`★ Favori`** (sauvegarde `localStorage`).
- **Capacités Expressives v3 (`renderStyle`, `compositionMode`, `generators[]`, `backdrop.shader`, `camera.rig`)** :
  - **`renderStyle`** : `resolutionScale (0.15..1.0)`, `shading (wireframe | flat | toon_cel | hologram | chrome_reflective | neon_glow)`, `outlineThickness (0..6)` (CRT/scanlines strictement optionnels).
  - **`compositionMode`** : `corridor | void_orbital | tunnel_infinite | kaleido_mandala | terrain_flyover` (+ `kaleidoAxes`).
  - **`generators[]`** : `particle_field`, `ribbon_trails`, `audio_wave_mesh`, `instanced_array`.
  - **`backdrop.shader`** : `none | plasma_fluid | voronoi_cells | radial_sunburst | grid_horizon | noise_fog`.
  - **`camera.rig` & `beatCut`** : `orbit_smooth | dolly_zoom_on_kick | first_person_fly | top_down_spin | handheld_shake`.

## 7. Moteur v4 : Architecture Modulaire en 3 Couches (`Anarchy3DPackV4`)

1. **Couche 1 — Environnement & Éclairage Studio (`environment` & `renderStyle`)** :
   - `lightingPreset` : `studio_clean | cyber_neon | sunset_warm | dark_void`
   - `backdropType` : `liquid_plasma | gradient_sky | starfield | grid_horizon | solid_color` (+ `backdropColors[]` & `fog`)
   - `renderStyle.toneMapping` : `aces_filmic | reinhard | cineon | none` (zéro pixelisation/CRT par défaut).
2. **Couche 2 — Acteurs Organiques & Hybrides (`actors[]`)** :
   - Types : `organic_blob`, `wave_terrain`, `spline_ribbons`, `particle_swarm` (`curl_noise_flow | vortex | beat_explosion | floating_dust`), `glb_model`, `sprite_2d`.
   - Matériaux : `chrome | frosted_glass | matcap_clay | toon_cel_outline | emissive_neon`.
   - `audioModulation[]` : relie `bass | lowMid | highMid | treble | energy | fader_1..fader_19` à `scale | noiseStrength | rotationSpeed | emissiveIntensity | positionY`.
3. **Couche 3 — Post-Processing Cumulable & Horloge Étendue (`postFX[]`, `durationBars`, `transition`)** :
   - `postFX[]` : `bloom`, `depth_of_field`, `toon_outline`, `chromatic_aberration`, `film_grain`, `pixelate`.
   - Horloge BPM : `HOLD (Manuel)`, `1, 2, 4, 8, 16, 32, 64` mesures + `durationBars` par scène & transitions (`cut | crossfade | camera_swoop | flash`).

## 8. Moteur v5 : Cartoon 1930 / Cuphead (`Anarchy3DPackV5`)

1. **Acteurs 2.5D & Parallaxe Multi-Plans (`actors[]`)** :
   - `parallax_layer` : plan 2.5D (image ou motif aquarelle/gouache `watercolor_hills | stage_curtains | city_silhouette | clouds_band | checker_floor | psyche_rings`) à profondeur `z` avec `scrollX`, `scrollY`, `depthBlur`.
   - `cartoon_sprite` : spritesheet `framesX × framesY` jouée au BPM avec contour d'encre noir automatique.
   - `rubber_hose_mesh` : formes rétro 1930 (`hose_arms | pie_eyes | vintage_wheel | music_notes | fluffy_clouds | theater_curtains | boss_character | psyche_tunnel`) en Cel-Shading plat + contour noir épais (`inkThickness`).
2. **Physique Dessin Animé (`cartoonPhysics`)** :
   - `steppedFps` : `12 | 24 | 60` FPS (saccade celluloïd), `squashStretch` + `squashTrigger` (`bass | snare | kick | energy`), `lineBoil` (vibration d'encre).
   - `faderBindings` : liaison libre des 19 faders sur `squashStretch`, `lineBoil`, `filmGrain`, `parallaxSpeed` et `steppedFps`.
3. **Post-Processing Pellicule 1930 (`postFX[]`)** :
   - `vintage_1930_film` : `filmGrain`, `scratchesAndDust`, `gateWeave`, `colorGrade` (`technicolor_30s | sepia_warm | black_and_white_ink | none`), `vignette`.
   - `toon_outline` : encrage plume (`inkThickness`, `inkJitter`).

## 9. Moteur v6 : Morphing Inter-Scènes & Programmation Temporelle DAW (`Anarchy3DPackV6`)

1. **Moteur de Morphing Inter-Scènes (`morphTransition` & même `actor.id`)** :
   - Lorsqu'un acteur conserve le même `id` entre deux scènes consécutives (ex. `id: "main_entity"`), ses sommets, couleurs, matériaux et contours sont interpolés en continu sur `morphTransition.durationBeats` (`1..16` temps) avec easing `linear | easeInOutCubic | elasticOut | expoIn`.
   - **Vertex Lerp** : transformation géométrique fluide d'une goutte de mercure liquide (`organic_blob` chrome) vers un Boss Cartoon 1930 (`rubber_hose_mesh` Cel-Shading + Pie-Eyes).
   - **Particle Swarm Morphing (`particle_swarm`)** : chaque particule glisse de sa forme dans la Scène A vers sa nouvelle cible `shapeTarget` (`sphere | vortex | tunnel | grid | text_outline`) dans la Scène B.
2. **Courbes d'Automation DAW par Scène (`automations[]`)** :
   - Fait évoluer automatiquement n'importe quelle cible (`scale`, `noiseStrength`, `rotationSpeed`, `emissiveIntensity`, `positionY`, `squashStretch`, `lineBoil`, `filmGrain`, `parallaxSpeed`, `steppedFps`, `zoom`, `fov`, `fogDensity`) de `from` vers `to` sur la progression normalisée `0.0 → 1.0` de la scène.
3. **Modulateurs LFO Synchronisés au BPM (`modulators[]`)** :
   - Jusqu'à 4 oscillateurs internes `lfo_1..lfo_4` (`waveform: sine | triangle | saw | square | random_hold`, `rateBeats: 0.25 | 0.5 | 1 | 2 | 4 | 8`, `phase: 0..1`) directement utilisables dans `audioModulation[].source`.
4. **Multi-Caméras & Cuts Rythmiques (`cameraCuts[]`)** :
   - Définit plusieurs presets de caméra par scène alternant toutes les `switchEveryBars` mesures ou sur un pic audio (`onPeakBand: snare | kick | bass`) avec transition `cut | glide`.

## 10. Moteur v7 : Physique Cartoon & Collisions (`Anarchy3DPackV7`)

1. **Monde Physique Global par Scène (`physicsWorld`)** :
   - `enabled` : `boolean` (désactivé par défaut pour préserver les scènes abstraites v1–v6).
   - `gravity` : `[gx, gy, gz]` (ex. `[0, -9.8, 0]` chute classique, `[0, 0, 0]` apesanteur, `[0, 4, 0]` bulles montantes).
   - `bounds` : `{ shape: "box" | "sphere" | "floor_only", radiusOrSize, restitution }` (murs invisibles ou sol élastique).
   - `faderBindings` : liaison des 19 faders live (`fader_1..fader_19`) sur `gravity`, `restitution`, `impulseForce` et `springStiffness`.
2. **Corps Physiques par Acteur (`actor.physics`)** :
   - `bodyType` : `"dynamic" | "kinematic" | "static"`, `mass`, `restitution` (`0.0..1.2`), `friction`, `linearDamping`.
   - `collisionSquash` : déclenche automatiquement un *Squash & Stretch* proportionnel à la force de l'impact lors d'une collision avec le sol ou un autre acteur.
   - `audioImpulses[]` : `{ source: "bass" | "snare" | "treble" | "kick", force: [x, y, z], torque: [x, y, z], randomSpread }` pour faire bondir ou tournoyer les objets sur le beat.
3. **Liaisons Élastiques & Émetteurs Physiques (`joints[]` & `physics_spawner`)** :
   - `joints[]` : `{ type: "spring", actorA, actorB, stiffness, damping, restLength }` pour créer des chaînes articulées, pendules ou tentacules rubber-hose.
   - `physics_spawner` : génère périodiquement (`spawnRateBeats`) ou sur chaque kick (`spawnOnKick`) des instances physiques légères (`spawnShape: "chrome_sphere" | "music_note" | "comic_star" | "pie_eye_ball"`) avec durée de vie (`ttlBars`) et limite maximale (`maxInstances` plafonné pour garantir 60 FPS avec sous-pas fixes `fixedTimeStep = 1/120 s`).

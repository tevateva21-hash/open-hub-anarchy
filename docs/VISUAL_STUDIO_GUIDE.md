# Documentation Complète — Anarchy Visual Studio

Guide de référence officiel pour **Anarchy Visual Studio** (`/anarchy-visual-design`) et l'**Éditeur Externe C++** (`/anarchy-visual-design/editeur`).

---

## 1. Architecture & Philosophie du Studio

Anarchy Visual Studio est un moteur graphique **pixel-perfect & 3D PS1/PS2 temps réel (60 FPS)** exécuté intégralement dans le navigateur via Canvas 2D et Web Audio FFT 24 kHz (aucune latence serveur pour le rendu).

- **Studio principal (`/anarchy-visual-design`)** : pilotage musical, packs de 5 scènes, couleurs/variations, formats réseaux sociaux, 10 faders live, paroles/Whisper et export MP4 avec son.
- **Éditeur Externe (`/anarchy-visual-design/editeur`)** : environnement dédié pour écrire ou injecter du code **C++ temps réel** (`renderAnarchyFrame(AnarchyCtx& ctx)`) et éditer/importer des **Packs de 5 Scènes** (`.hpp` C++ ou `.json`).
- **Documentation (`/docs/visual-studio`)** : accessible depuis la barre du haut (`📖 DOCUMENTATION`), le bandeau du Studio (`📖 DOCS STUDIO`), l'Éditeur C++ et `/docs`.

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

### Calage BPM & Mesures
- **Offset `0.00s` par défaut** : le calage 1er temps (`beatOffset`) démarre verrouillé à `0.00s` (bouton `↺ 0.00s` pour réinitialiser à tout moment, ou `⚡ CALER 1ER TEMPS ICI` pour aligner sur le kick courant).
- **Switch Scènes (Mesures)** : règle la fréquence de bascule automatique entre les 5 scènes d'un pack (`Fixe`, `1`, `2`, `4`, `8`, `16`, `32` ou `64` temps).

---

## 3. Packs de 5 Scènes (C++ `.hpp` / JSON)

Plutôt que d'éditer une scène isolée, le studio travaille avec des **Packs de 5 Scènes** qui s'enchaînent au rythme du BPM :
- **Pack original inclus** : `PS2 // Enter the Dragon (5 Scènes)` (`Dojo Néon`, `Enter the Dragon`, `Katana Overdrive`, `PS2 Nightmare`, `Digital Void`) et `Psy-Acid 145 BPM`.
- **Générateur Procédural (`🎲 GÉNÉRER UN PACK`)** : crée un pack unique de 5 scènes via graine aléatoire (`seed`), avec nom optionnel.
- **Enchaînement** : les 5 pastilles numérotées permettent de suivre ou forcer le slot actif sans encombrer l'interface.

---

## 4. Couleurs & 4 Variations Rapides

Le panneau **Couleurs & Variations** contrôle l'esthétique globale en temps réel sans casser la synchro du pack :
- **Palette Principale (7 palettes)** : `Oxyde toxique`, `Anarchy Anaglyph`, `Blood Red`, `Acid Violet`, `Furnace Amber`, `Cold Concrete`, `Techno Therapy`.
- **Cible Color Morph** : choisissez une seconde palette cible vers laquelle les couleurs basculent progressivement via le fader **Morph Couleur**.
- **4 Variations Rapides** : boutons de test instantané (`#1 digital`, `#2 rave`, `#3 furnace`, `#4 rave cold`) pour expérimenter rapidement différents styles et palettes en live.

---

## 5. Console des 10 Faders Essentiels

Chaque fader agit immédiatement sur la vidéo (même lors du défilement automatique d'un pack) et dispose d'un bouton cadenas (**Lock**) :

| Banque | Fader | Rôle sur le rendu vidéo |
| --- | --- | --- |
| **01 // Dynamique** | **Gain Basses** | Amplifie la réactivité des kicks/basses (pulsation, zoom, géométrie) |
| **01 // Dynamique** | **Gain Aigus / Clap** | Amplifie les cymbales, claps et transitoires haute fréquence |
| **01 // Dynamique** | **Master Int.** | Intensité globale du moteur visuel (`0%` → `100%`) |
| **02 // FX** | **Strobe Aigu** | Déclenche un **flash clair d'arrière-plan** lorsque les aigus / claps frappent |
| **02 // FX** | **Kick Blackout** | Coupe ou atténue brièvement l'image sur les kicks lourds |
| **02 // FX** | **Psychédélie** | Kaléidoscope, rotation psychédélique et distorsion |
| **02 // FX** | **Morph Couleur** | Progression du mélange entre la Palette Principale et la Cible Color Morph |
| **02 // FX** | **Anaglyph 3D** | Séparation stéréoscopique Rouge / Cyan style lunettes 3D |
| **03 // Caméra** | **Zoom Cam** | Zoom unifié 2D (pixel) et 3D (`50%` → `220%`) |
| **03 // Caméra** | **Pendule Cam** | Balancement pendulaire de la caméra synchronisé au tempo |

---

## 6. Formats Réseaux Sociaux & Export MP4 avec Son

Sélectionnez votre format cible directement au-dessus du moniteur :

| Format | Résolution Moteur | Export HD | Usage |
| --- | --- | --- | --- |
| **16:9** | `320×180` | `1280×720` | YouTube, Twitch, Desktop |
| **9:16** | `180×320` | `1080×1920` | TikTok, Instagram Reels, YouTube Shorts |
| **4:5** | `240×300` | `1080×1350` | Feed Instagram, Facebook |
| **1:1** | `240×240` | `1080×1080` | Post Instagram, Carrousel, Pochette |

- **Safe Zone TikTok / Reels** : affiche un gabarit pointillé en `9:16` et `4:5` indiquant les marges sûres hors boutons d'interface TikTok/Instagram.
- **Export MP4 + Son** : clique sur `🎬 EXPORTER MP4 ...` pour lancer la lecture et capturer exactement la zone prévisualisée (`clipStartSeconds` → `+clipDurationSeconds`) avec le son (fondus inclus) et arrêt automatique en fin d'extrait.
- **Snapshot PNG** : exporte l'image courante en haute définition pixel-perfect (`nearest-neighbor`).

---

## 7. Scénario, Paroles LRC & Transcription Whisper

Le module **Paroles & Micro** permet de synchroniser du texte et des sections de montage sur votre audio :

### Format Scénario & LRC
```lrc
[00:00.00] #INTRO ANARCHY VISUAL ENGINE
[00:04.20] #PRE_DROP TENSION MONTE
[00:08.50] #DROP ENTER THE DRAGON
[00:16.00] #REFRAIN CODE C++ LIVE
```
- **Timecodes `[mm:ss.xx]`** : insérez le timecode courant automatiquement avec le bouton `⏱ + TIMECODE`.
- **Sections `#TAG`** (`#INTRO`, `#COUPLET`, `#PRE_DROP`, `#DROP`, `#REFRAIN`, `#OUTRO`) : exposées dans le runtime C++ via `ctx.lyricSection` pour déclencher des effets selon la partie du morceau !
- **4 styles pixel** : Sous-titre Cinéma 16-bit, Impact Central Brutaliste, Terminal HUD Haut, Onde Psychédélique.

### Fonctionnement de Whisper (`/api/whisper`)
1. Lorsque vous cliquez sur **`✨ TRANSCRIRE (WHISPER)`**, le studio découpe automatiquement **uniquement votre zone d'extrait prévisualisée** en WAV mono 16 kHz léger (~960 Ko pour 30s) via `OfflineAudioContext`.
2. Ce fichier léger est envoyé à la route Next.js `POST /api/whisper`.
3. Le serveur interroge **Groq (`whisper-large-v3`)** si `GROQ_API_KEY` est configurée, ou **OpenAI (`whisper-1`)** si `OPENAI_API_KEY` est configurée, avec `timestamp_granularities[]=word,segment`.
4. Le retour fournit les lignes LRC horodatées et un alignement **mot-à-mot** exact transmis en live à l'overlay vidéo et à `ctx.lyricWord` en C++.

---

## 8. Moteur 3D Unifié & Presets JS Natif (`.js`) / C++ (`.cpp`) (`/anarchy-visual-design/editeur`)

Le moteur graphique 3D PS2/Low-Poly (caméra perspective LookAt, éclairage Lambert directionnel + ambiant, brouillard de profondeur, dithering Bayer 4×4 et ombres portées) est désormais **l'unique moteur graphique du Studio**, programmable directement en **JavaScript Natif (`.js`)** et en **C++ (`.cpp`)** à 60 FPS :

1. **Panneau Unifié de Presets 3D Multi-Scènes** : remplace l'ancienne double interface et supprime tous les presets 2D filaires génériques au profit des Presets 3D officiels **`PS2 // Enter the Dragon (5 Scènes 3D)`** (`01_dojo_neon_3d.js`, `02_enter_the_dragon_3d.js`, `03_katana_overdrive_3d.js`, `04_ps2_nightmare_3d.cpp`, `05_digital_void_3d.cpp`) et **`Psy-Acid 145 BPM (5 Scènes 3D)`**, ainsi que du générateur **`🎲 Générer un Pack 3D (5 Scènes)`**.
2. **Mode JavaScript Natif (`language: 'js'`) — Fast-Path V8** : contourne intégralement le transpileur C++ dès que `JS NATIF` est sélectionné (ou détecté automatiquement lors du collage d'un script `function renderAnarchyFrame(ctx)`). Compile une seule fois par édition et conserve les variables d'état hors `renderAnarchyFrame(ctx)` entre les frames sans fuite mémoire.
3. **Transpileur C++ → JS blindé** : supporte `#include <cmath>`, `using namespace std;`, `AnarchyCtx& ctx`, `0.5f`, casts `(float)`, tableaux `float radii[4] = {...};`, lambdas `[&](...) { ... }`, `std::sin/cos/min/max/abs/pow/fmod` et `sinf/cosf/fabsf/fmodf/powf`, avec signalement d'erreur à la ligne exacte sans crasher `requestAnimationFrame`.
4. **Uniforms UI (`@param` / `@color` / `@toggle`) & Isolation des 10 Faders** : le chargement ou l'import d'un Preset 3D ne réinitialise jamais les 10 faders ni l'horloge BPM (rotation toutes les 2 ou 4 mesures).

```js
// @param float runSpeed = 3.8 [0.5, 12.0]
// @color neonColor = "#00F0FF"
// @color katanaColor = "#FF1B24"

let spin = 0;

function renderAnarchyFrame(ctx) {
  spin += 0.025 * (1 + ctx.bass);
  ctx.setCamera(Math.sin(ctx.t * 0.7) * 0.85, 1.8, -5.6, 0, 1.0, 12, 62);
  ctx.setFog("#0A0D18", 3.5, 22);
  ctx.setAmbientLight("#1A2238", 0.38 + ctx.rms * 0.25);
  ctx.setDirectionalLight(-0.4, 1.0, -0.5, neonColor, 0.9 + ctx.treble * 0.45);

  ctx.drawTerrain3D(runSpeed * (1 + ctx.bass * 0.4), 1.1 + ctx.bass * 0.6, "#101628", neonColor, "canyon");
  ctx.drawCharacter3D(0, 0, 3.6, ctx.t * runSpeed * 2.2, "katana", "#E4E8F2", katanaColor);
  ctx.drawParticles3D(42, 12, runSpeed * 1.4, neonColor, 2.2);
  ctx.scanlines(0.18);
}
```

### Variables disponibles sur `ctx`
- **Temps & Rythme** : `ctx.t` (secondes), `ctx.bpm`, `ctx.beat` (index entier), `ctx.beatPhase` (`0.0` → `1.0`), `ctx.sceneIndex`.
- **Audio Temps Réel (`0.0` → `1.0`)** : `ctx.bass`, `ctx.mid`, `ctx.treble`, `ctx.rms`, `ctx.flux` (transitoires / claps).
- **Dimensions Dynamiques** : `ctx.width`, `ctx.height` (`320×180` en `16:9`, `180×320` en `9:16`, `240×300` en `4:5`, `240×240` en `1:1`).
- **Scénario & Paroles** : `ctx.lyricLine`, `ctx.lyricWord`, `ctx.lyricProgress` (`0.0` → `1.0`), `ctx.lyricSection` (`"INTRO"`, `"DROP"`, `"REFRAIN"`...).
- **10 Faders Live (Isolation stricte)** : `ctx.intensity`, `ctx.strobe`, `ctx.kickBlackout`, `ctx.psychedelic`, `ctx.colorMorph`, `ctx.anaglyph`, `ctx.cameraZoom`, `ctx.pendulumSwing`.
- **Uniforms UI** : chaque variable déclarée via `// @param`, `// @color` ou `// @toggle` est accessible directement par son nom et via `ctx.params`.

### Primitives 3D PS2/Low-Poly & Surcouches 2D sur `ctx`
- **Caméra & Environnement 3D** :
  - `ctx.setCamera(x, y, z, targetX, targetY, targetZ, fov)`
  - `ctx.setFog(color, near, far)`
  - `ctx.setAmbientLight(color, intensity)`
  - `ctx.setDirectionalLight(x, y, z, color, intensity)`
- **Objets, Terrains, Personnages & Particules 3D** :
  - `ctx.drawTerrain3D(speed, amplitude, color, gridColor, style)` (`"canyon" | "mountains" | "waves" | "dungeon" | "corridor"`)
  - `ctx.drawBox3D(x, y, z, w, h, d, rotX, rotY, rotZ, color, emissiveColor, wireframe)`
  - `ctx.drawCharacter3D(x, y, z, animPhase, style, primaryColor, accentColor)` (`"katana" | "runner" | "cyborg"`)
  - `ctx.drawParticles3D(count, spread, speed, color, size)`
- **Surcouches HUD 2D & Post-FX (appliqués par-dessus la 3D)** :
  - `ctx.text(str, x, y, color, size)` / `ctx.glitchSlices(amount)` / `ctx.scanlines(alpha)` / `ctx.invert(amount)` / `ctx.zoom(scale)` / `ctx.tint(color, alpha)`
  - `ctx.circle(x, y, radius, color, fill)` / `ctx.ring(x, y, radius, lineWidth, color)` / `ctx.line(x1, y1, x2, y2, lineWidth, color)` / `ctx.rect(x, y, w, h, color)` / `ctx.grid(spacing, color, scrollSpeed)` / `ctx.kaleidoscope(segments, speed)`
- Fonctions math C++ standard disponibles : `sin`, `cos`, `tan`, `abs`, `min`, `max`, `pow`, `sqrt`, `floor`, `ceil`, `round`, `clamp`, `fmod`, `sinf`, `cosf`, `fabsf`, `fmodf`, `powf`, `PI`.

> Le code C++ est transpilé localement dans un bac à sable sécurisé (les identifiants DOM/réseau tels que `window`, `document`, `fetch`, `localStorage`, etc. sont bloqués) et synchronisé entre `/anarchy-visual-design/editeur` et `/anarchy-visual-design`.

---

## 9. Système de Prompts IA (Workflow Complet)

Anarchy Visual Studio intègre **3 Prompts IA spécialisés** que vous pouvez copier en 1 clic et coller dans ChatGPT, Claude ou Gemini :

### Prompt 1 — Générer un Pack de 5 Scènes (`.hpp` C++ ou `.json`)
Permet de demander à une IA un pack complet sur un thème précis (ex: *"Crée un pack Cyberpunk Tokyo 142 BPM"*), puis de le coller dans l'onglet **Packs de 5 Scènes** de `/anarchy-visual-design/editeur` pour l'activer immédiatement.

### Prompt 2 — Générer un Shader C++ Live (`renderAnarchyFrame`)
Force l'IA à utiliser la bonne signature `void renderAnarchyFrame(AnarchyCtx& ctx)`, les variables audio/paroles (`ctx.bass`, `ctx.lyricWord`, `ctx.lyricSection`) et les dimensions adaptatives (`ctx.width`, `ctx.height`) pour que l'effet fonctionne aussi bien en **9:16 TikTok** qu'en **16:9 YouTube**.

### Prompt 3 — Transformer des Paroles en Scénario LRC Horodaté
Prend vos paroles brutes + le BPM et la zone d'extrait active, et demande à l'IA de découper en lignes courtes de **3 à 6 mots** lisibles en mobile vertical (`9:16`), avec tags `[mm:ss.xx] #SECTION`.

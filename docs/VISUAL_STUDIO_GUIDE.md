# Documentation Complète — Anarchy Visual Studio 3D

Guide de référence officiel pour **Anarchy Visual Studio** (`/anarchy-visual-design`).

---

## 1. Architecture & Philosophie du Studio

Anarchy Visual Studio est un moteur graphique **3D Low-Poly / PS1-PS2 profond temps réel (60 FPS)** exécuté intégralement dans le navigateur avec tri Z-buffer, ombrage Lambert directionnel, brouillard de profondeur, dithering Bayer 4×4 et Web Audio FFT 24 kHz (aucune latence serveur pour le rendu).

- **Studio principal (`/anarchy-visual-design`)** : pilotage musical, **Packs de Scènes 3D profondes** enchaînées au BPM, éditeur 3D en direct (`config3d` JSON & script `customizeScene3D` 60 FPS), couleurs/variations, formats réseaux sociaux, 10 faders live isolés, paroles/Whisper et export MP4 avec son.
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

### Calage BPM & Mesures
- **Offset `0.00s` par défaut** : le calage 1er temps (`beatOffset`) démarre verrouillé à `0.00s` (bouton `↺ 0.00s` pour réinitialiser à tout moment, ou `⚡ CALER 1ER TEMPS ICI` pour aligner sur le kick courant).
- **Switch Scènes (Mesures)** : règle la fréquence de bascule automatique entre les scènes 3D d'un pack (`2 Mesures (8T)`, `4 Mesures (16T)`, `Manuel 🔒` ou `1..64` temps).

---

## 3. Packs de Scènes 3D Profondes (`PACK DE SCÈNES // ENCHAÎNEMENT BPM`)

Le studio utilise un système unifié de **Packs de Scènes 3D profondes** qui s'enchaînent au rythme du BPM :
- **Packs 3D officiels inclus** :
  - `PS2 // Enter the Dragon (5 Scènes)` : `01. Dojo Néon`, `02. Enter the Dragon`, `03. Katana Rush`, `04. Shogun Boss`, `05. Digital Void`.
  - `Psy-Acid 145 BPM (5 Scènes)` : `01. Acid Tunnel`, `02. Vortex Psyché`, `03. Bolide Rave`, `04. Fractal Core`, `05. Strobe Finale`.
- **Nombre libre de scènes 3D** : un pack peut contenir 1, 3, 5, 8 scènes ou plus (bouton `+ Scène 3D`, duplication `⎘`, réordonnancement `◀`/`▶` et suppression `✕`).
- **Générateur Procédural (`🎲 GÉNÉRER UN PACK 3D`)** : crée un pack 3D complet via graine aléatoire (`seed`), avec nom optionnel.
- **Isolation stricte des Faders & du BPM** : charger un pack 3D, importer un JSON ou changer de scène 3D (automatiquement toutes les 2 ou 4 mesures ou au clic) **ne réinitialise jamais aucun des 10 faders ni le BPM**.

---

## 4. Personnalisation 3D en Direct (JSON / JS 3D) & Export/Import Pack 3D

Dans le panneau **`PACK DE SCÈNES // ENCHAÎNEMENT BPM`**, cliquez sur **`🎛 ÉDITER SCÈNE 3D (JSON / JS 3D)`** pour ouvrir l'inspecteur 3D à 60 FPS de la scène active :

### 1. Onglet `🎛 Paramètres 3D & Audio` (`config3d`)
Chaque scène 3D possède un objet `config3d` structuré contrôlant directement le moteur 3D :
- **Géométries 3D (`geometries`)** : objets 3D additionnels (`none`, `katana-blades`, `floating-monoliths`, `octo-rings`, `cyber-pyramids`), densité (`objectCount` 0..16), échelle (`meshScale`) et extrusion wireframe (`wireframeExtrusion`).
- **Environnement & Terrain 3D (`environment`)** : vitesse de défilement 3D (`scrollSpeed`), vitesse du tunnel (`tunnelSpeed`), damier au sol (`floorCheckerboard`) et hauteur du terrain (`horizonLift`).
- **Caméra Perspective 3D (`camera`)** : focale (`fov` 32°..110°), recul (`distance`), inclinaison (`pitch`), lacet (`yaw`) et orbite (`orbitSpeed`).
- **Éclairage & Brouillard (`lighting`)** : profondeur du brouillard (`fogDepth`), intensité lumineuse (`ambientBoost`) et tramage Bayer (`ditherStrength`).
- **Palette & Surcouches (`colors`)** : palette de base + couleurs d'accentuation optionnelles (`accentOverride`, `glowOverride`, `fogOverride`).
- **Multiplicateurs Audio-Réactifs (`audioReactive`)** : `bassScale`, `midRotation`, `trebleFlash`, `fluxGlitch`.

### 2. Onglet `⚡ Script 3D Live (JS 60 FPS)` (`script3d`)
Permet d'écrire une fonction `customizeScene3D(scene3d, audio, t)` compilée une seule fois par édition et exécutée à 60 FPS directement dans le pipeline 3D (`renderLowPolyMesh`) :
- `scene3d.addBox(x, y, z, w, h, d, rx, ry, rz, colorHex, emissive)`
- `scene3d.addPyramid(x, y, z, radius, height, ry, colorHex, emissive)`
- `scene3d.addRing(x, y, z, radius, thickness, rx, ry, colorHex, emissive)`
- `scene3d.addRibbon(x1, y1, z1, x2, y2, z2, width, colorHex, emissive)`
- `audio` : `{ bass, mid, treble, rms, flux }` (`0..1`), `t` : temps en secondes.

### 3. Modales `⇄ EXPORTER / IMPORTER PACK 3D (JSON)` & `📖 DOC & PROMPT IA 3D`
- **Exporter** : copiez le JSON complet du Pack 3D actif ou téléchargez le fichier `.json`.
- **Importer** : collez un JSON de Pack 3D (généré par IA ou partagé) ou chargez un fichier `.json` sans toucher aux faders ni au BPM.

---

## 5. Couleurs & 4 Variations Rapides

Le panneau **Couleurs & Variations** contrôle l'esthétique globale en temps réel :
- **Palette Principale (7 palettes)** : `Oxyde toxique`, `Anarchy Anaglyph`, `Blood Red`, `Acid Violet`, `Furnace Amber`, `Cold Concrete`, `Techno Therapy`.
- **Cible Color Morph** : choisissez une seconde palette cible vers laquelle les couleurs basculent progressivement via le fader **Morph Couleur**.
- **4 Variations Rapides** : boutons de test instantané pour expérimenter rapidement différents styles et palettes en live.

---

## 6. Console des 10 Faders Essentiels (Isolation Stricte)

Chaque fader agit immédiatement sur la scène 3D (même lors du défilement automatique d'un pack) et dispose d'un bouton cadenas (**Lock**) :

| Banque | Fader | Rôle sur le rendu 3D |
| --- | --- | --- |
| **01 // Dynamique** | **Bass Punch** | Amplifie la réactivité des kicks/basses (pulsation 3D, zoom, géométrie) |
| **01 // Dynamique** | **Aigus / Clap** | Amplifie les cymbales, claps et transitoires haute fréquence |
| **01 // Dynamique** | **Master Int.** | Intensité globale du moteur visuel 3D (`0%` → `100%`) |
| **02 // FX** | **Strobe Aigu** | Déclenche un **flash clair d'arrière-plan** lorsque les aigus / claps frappent |
| **02 // FX** | **Kick Blackout** | Coupe ou atténue brièvement l'image sur les kicks lourds |
| **02 // FX** | **Psychédélie** | Kaléidoscope, rotation psychédélique et distorsion |
| **02 // FX** | **Morph Couleur** | Progression du mélange entre la Palette Principale et la Cible Color Morph |
| **02 // FX** | **Anaglyph 3D** | Séparation stéréoscopique Rouge / Cyan style lunettes 3D |
| **03 // Caméra** | **Zoom Cam** | Zoom unifié de la caméra perspective 3D (`50%` → `220%`) |
| **03 // Caméra** | **Pendule Cam** | Balancement pendulaire de la caméra 3D synchronisé au tempo |

---

## 7. Formats Réseaux Sociaux & Export MP4 avec Son

| Format | Résolution Moteur | Export HD | Usage |
| --- | --- | --- | --- |
| **16:9** | `320×180` | `1280×720` | YouTube, Twitch, Desktop |
| **9:16** | `180×320` | `1080×1920` | TikTok, Instagram Reels, YouTube Shorts |
| **4:5** | `240×300` | `1080×1350` | Feed Instagram, Facebook |
| **1:1** | `240×240` | `1080×1080` | Post Instagram, Carrousel, Pochette |

---

## 8. Scénario, Paroles LRC & Transcription Whisper (`/api/whisper`)

- **Timecodes `[mm:ss.xx]` & Sections `#TAG`** (`#INTRO`, `#PRE_DROP`, `#DROP`, `#REFRAIN`, `#OUTRO`) incrustés en bitmap 5×5 sur le rendu 3D.
- **Transcription Whisper** : découpe uniquement la zone d'extrait prévisualisée en WAV mono 16 kHz léger et l'envoie à `POST /api/whisper` (Groq `whisper-large-v3` ou OpenAI `whisper-1`) avec alignement mot-à-mot.

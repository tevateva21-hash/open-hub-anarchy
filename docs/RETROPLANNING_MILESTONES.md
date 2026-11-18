# Rétroplanning & Milestones — Open Hub by Anarchy

Document de suivi complet des jalons réalisés sur **Open Hub by Anarchy** (`tevateva21-hash/open-hub-anarchy`).

---

## Vue d'ensemble des Jalons

| Jalon | Date / Commit | Contenu principal | Statut |
| --- | --- | --- | --- |
| **M0 — Initialisation** | `306303b` | Socle Next.js 14 App Router, Tailwind CSS, TypeScript | ✅ Terminé |
| **M1 — Identité & Studio V2** | `9035be8` | Design System Anarchy, Visual Design V2 (19 faders), pages VST, Samples, Forum, Blog, RGPD | ✅ Terminé |
| **M2 — Nettoyage HUD & Footer RGPD** | `8bd9c86` | Suppression du bandeau redondant, déplacement RGPD/HTTPS en pied de page, Radio déplacée vers `/radio`, purge des contenus factices | ✅ Terminé |
| **M3 — Auth, Tiroirs & Ranking Radio** | `ccb566a` | Connexion Email + Pseudo, tiroirs Anarchy/Communauté, ranking Radio, export vidéo & synchro scènes | ✅ Terminé |
| **M4 — Intégration PsyLab VST3 (`vstsplugin`)** | `c05313d` / `90d889a` | Import des plugins `ECLIPSE`, `HELIOS`, `PRISM` + synchro GitHub Actions (`/api/vst/sync`) + dépôt VST communauté | ✅ Terminé |
| **M5 — Presets VST & Navigation Plate** | `9abc061` | Suppression de l'onglet Communauté séparé, ajout des tiroirs Presets VST (Serum, Vital, PsyLab, À préciser) | ✅ Terminé |
| **M6 — Visual Studio Ergonomie & Fondus** | `8627488` / `c589519` | Prévisualisation son 30s au-dessus, Fade In/Out 60fps, boucle 30s verrouillée, switch scènes BPM + calage 1er temps | ✅ Terminé |
| **M7 — SoundCloud & Sons Communauté** | `d825a0a` | Remplacement Google Drive par SoundCloud sur `/radio`, création `/sons-communaute` (audio + `.zip` stems + réponses/remix) | ✅ Terminé |
| **M8 — Supabase, Sociabilité & Avatars** | `a69a3e5` / `19a6b2c` | Schéma SQL complet, Storage helper, `/api/health/supabase`, `/reseau` (Follow, Mur social, Profils), nouveaux avatars + upload, `site-texts.ts` | ✅ Terminé |
| **M9 — Now Playing & Émulation DAW** | `f74830b` | Badge « son en cours » global en haut à droite, suppression des fiches/commentaires VST au profit de l'émulation DAW pure | ✅ Terminé |
| **M10 — Docs & Packs de 5 Scènes (C++/JSON + IA)** | `b9222be` | Rétroplanning GitHub/Drive/Site (`/docs/retroplanning`) + Packs de 5 scènes Visual Studio (JSON & C++ `.hpp`/`.cpp`, Prompt IA, partage communauté) | ✅ Terminé |
| **M11 — Refonte Paradigme Packs de 5 Scènes** | `87fe70e` | Pack original `PS2 // Enter the Dragon`, générateur procédural par seed (`🎲 GÉNÉRER UN PACK`), enchaînement automatique 5 scènes au BPM, noms optionnels, scènes individuelles masquées par défaut | ✅ Terminé |
| **M12 — Curseur MAUI, Éditeur C++ Externe & Calage 0.00s** | `c16e12c` | Curseur audio libre sans crans + fenêtre 30s glissable sur la waveform (style .NET MAUI), éditeur externe `/anarchy-visual-design/editeur` avec exécution de code C++ temps réel sur le canvas, calage BPM verrouillé à `0.00s` par défaut | ✅ Terminé |
| **M13 — Export MP4 avec Son & Ergonomie Zone Prévisualisée** | `9db0926` | Déplacement de `RANDOMIZE`, `UNDO`/`REDO`, `PNG` et `EXPORT MP4` directement sous le moniteur vidéo et près de l'audio ; capture audio+vidéo muxée (`MediaStream` local/Open Hub) enregistrant exactement la zone d'extrait prévisualisée avec arrêt automatique et fondus | ✅ Terminé |
| **M14 — Épuration Studio & Système Pause Site Global** | `3fdf239` | Suppression des contrôles redondants (`Curseur libre`, barre `<audio>` native, en-tête/pied du moniteur, `Randomize`, grille 4 bandes et `Début extrait`) et ajout du système global `pauseAllAudio()` relié au bouton `⏸ PAUSE` et au badge haut-droite | ✅ Terminé |
| **M15 — Console 10 Faders Live & Strobe Aigu / Clap en Fond** | `af6f620` | Déblocage des faders temps réel (suppression de l'écrasement par le slot actif), console épurée à 10 faders utiles (Basses, Aigus/Clap, Master, Strobe Aigu, Kick Blackout, Psychédélie, Morph, Anaglyph 3D, Zoom Cam, Pendule) et flash clair en arrière-plan sur les claps/aigus | ✅ Terminé |
| **M16 — Panneau Couleurs & Variations Rapides Live** | `fed2173` | Suppression des contrôles redondants du panneau Matrice (5 scènes, BPM/Switch/Kick Mode, Vertex Snap, Seed, JSON, Sauver/Charger/Reset) au profit du seul changement de couleur (`Palette principale`, `Cible Color Morph`) et des `4 Variations rapides`, avec correction de la boucle temps réel pour que les couleurs et variations s'appliquent immédiatement sur la vidéo | ✅ Terminé |
| **M17 — Formats Réseaux Sociaux (9:16, 4:5, 1:1), Whisper, Scénario LRC & C++ Paroles** | `4ebe405` | Sélecteur de formats (`16:9` YouTube, `9:16` TikTok/Reels avec Safe Zone, `4:5` Insta Feed, `1:1` Carré) adapté au moteur pixel/3D et à l'export PNG/MP4 ; API `/api/whisper` (Groq/OpenAI) avec découpe WAV 16 kHz de l'extrait, scénario LRC horodaté (`#INTRO`, `#DROP`), variables C++ (`ctx.lyricWord`, `ctx.lyricSection`, `ctx.width`/`height`) + 2 templates & Prompts IA | ✅ Terminé |
| **M18 — Audio 70 Mio, Documentation Complète & En-tête Épuré** | `7e57485` | Passage de la limite d'import audio à **70 Mio** (8 min / 96 Mio PCM), création de la documentation complète Anarchy Visual Studio (`/docs/visual-studio` et `docs/VISUAL_STUDIO_GUIDE.md` couvrant Prompts IA, C++ live, Whisper/LRC, 10 faders, formats sociaux) accessible depuis le Studio, l'Éditeur C++, la barre du haut et `/docs`, et suppression de l'en-tête donnant accès aux autres catégories (Samples, VSTs, etc.) | ✅ Terminé |
| **M19 — Refonte C++ Modulaire (4 Modules : Transpileur, Multi-.cpp, Scènes & Uniforms)** | `9463345` | Blindage du transpileur C++ → JS (`#include`, `using namespace`, tableaux, lambdas, casts, `std::` / `sinf`/`fmodf`, erreurs ligne exacte sans crash RAF), gestionnaire multi-documents `.cpp` (`sceno_openhub_ps2.cpp` préservant la scénographie Open Hub + 3 exemples), routage par scènes LRC/Whisper, créneaux temporels & pads VJ avec transitions (`Cut`, `Fondu`, `Glitch`), et Inspector auto-généré via `// @param`, `// @color`, `// @toggle` + presets nommés | ✅ Terminé |
| **M20 — Mode JavaScript Natif (`.js`) Fast-Path V8, Détection Auto & Coloration Syntaxique** | `b2d43cf` | Coexistence complète `.js` / `.cpp` : sélecteur `JS NATIF` / `C++`, détection automatique du collage/saisie JS (`function renderAnarchyFrame(ctx)`, `const`/`let`/`=>`), exécution directe V8 à 60 FPS sans transpileur avec état persistant hors boucle, coloration syntaxique dédiée (`CodeShaderEditor`), support `@param/@color/@toggle` + mixage libre de scènes `.js` et `.cpp`, et template 3D low-poly réactif au son (`lowpoly_3d_js.js`) | ✅ Terminé |
| **M21 — Architecture Modulaire `AnarchyPreset` Multi-Scènes & Isolation Faders/BPM** | `86a3869` | Séparation stricte Couche Contrôle Live (10 Faders + Horloge BPM 2/4 mesures jamais écrasés) / Couche Graphique (`AnarchyPreset` & `AnarchyScene` à nombre libre de scènes `.js` et `.cpp`), ajout/duplication/réordonnancement/suppression de scènes, modale `"Importer / Exporter un Preset"` et modale `"Doc / Créer un Preset"` avec exemple JSON + Prompt IA | ✅ Terminé |
| **M22 — Unification du Moteur 3D & Presets 3D Programmables (`ctx.*3D`)** | `9f1a1fd` | Fusion en un panneau unique de Presets 3D piloté par l'horloge BPM (2/4 mesures) et remplacement des anciens presets 2D par `PS2 // Enter the Dragon (5 Scènes 3D)` et `Psy-Acid 145 BPM (5 Scènes 3D)` | ✅ Terminé |
| **M23 — Nettoyage complet du système 2D JS/C++ parallèle & Unification du Moteur 3D** | `5aadf17` | Suppression intégrale de la route `/anarchy-visual-design/editeur`, de ses liens de navigation, du panneau 2D `AnarchyPresetPanel`, du transpileur C++→JS et des fichiers associés ; concentration à 100 % sur le vrai moteur 3D profond (`PACK DE SCÈNES // ENCHAÎNEMENT BPM`) | ✅ Terminé |
| **M24 — Architecture Data-Driven JSON (`Anarchy3DPack` & `Anarchy3DScene`)** | `530dc27` | Refactorisation du moteur 3D en Data-Driven piloté par JSON strict (`Anarchy3DPack` / `Anarchy3DScene` : `environment`, `subject`, `camera`, `audioMapping`) sans aucune exécution de code arbitraire (zéro `eval` / `new Function`) ; parseur JSON tolérant (`parseForgivingPackJSON` + auto-réparation syntaxique), calage BPM précis et 4 variations rapides | ✅ Terminé |
| **M25 — Moteur Modulaire Multi-Calques v2 (`Anarchy3DPack v2`, `procedural_group`, `postFx` & Registre)** | *Actuel* | Pipeline 3D multi-calques (`backdrop` skyGradient/soleil synthwave/étoiles, `terrain` avec `neon_highway`/`mirror_floor`, `sideProps` latéraux, `subjects[]` multiples + `procedural_group` à 7 primitives 3D, `postFx` par scène avec PS1 jitter, CRT, aberration chromatique, kaléidoscope et bloom), registre centralisé `lib/visual-studio/registry.ts` et rétrocompatibilité v1 totale | ✅ Terminé |

---

## Détail des évolutions clés

### 1. Audio & Lecteur Global
- Lecteur Web Audio persistant (`AudioPlayerContext`) + détection globale des balises `<audio>` du site.
- Affichage temps réel du morceau en cours + bouton Pause en haut à droite (`HeaderNav`).
- Radio Anarchy via SoundCloud + Radio Générale communautaire avec likes & ranking.
- Page `/sons-communaute` dédiée : écoute directe, téléchargement `.zip` de stems indépendants et réponses/remix imbriquées.

### 2. Anarchy Visual Design (`/anarchy-visual-design`)
- Prévisualisation audio 30s en haut avec boucle 60fps et Fade In / Fade Out.
- Synchronisation BPM par mesures (`0` à `64` temps) + calage du 1er temps (`beatOffset` + bouton `⚡ CALER 1ER TEMPS ICI`).
- Fenêtres modulables et fermables.
- **Nouveau** : Éditeur & partage de **Packs de 5 Scènes** (import/export `.json` ou `.hpp`/`.cpp`, générateur de Prompt IA prêt à copier, et bibliothèque communautaire).

### 3. VST Hub (`/`) & Émulateur DAW (`/vst/[id]`)
- Synchronisé avec `tevateva21-hash/vstsplugin` (`ECLIPSE`, `HELIOS`, `PRISM`).
- Interface épurée : émulation DAW interactive sans fiches ni commentaires superflus.

### 4. Backend Supabase & Sociabilité (`/reseau`)
- Schéma SQL complet dans `supabase/schema.sql` + diagnostic `/api/health/supabase`.
- Page `/reseau` : profils, upload d'avatar personnalisé ou choix parmi 6 styles Anarchy, système Suivre, mur social & collaborations.
- Textes centralisés éditables indépendamment dans `lib/site-texts.ts`.

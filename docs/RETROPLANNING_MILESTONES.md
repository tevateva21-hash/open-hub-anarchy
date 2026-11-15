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
| **M14 — Épuration Studio & Système Pause Site Global** | *Actuel* | Suppression des contrôles redondants (`Curseur libre`, barre `<audio>` native, en-tête/pied du moniteur, `Randomize`, grille 4 bandes et `Début extrait`) et ajout du système global `pauseAllAudio()` relié au bouton `⏸ PAUSE` et au badge haut-droite | ✅ Terminé |

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

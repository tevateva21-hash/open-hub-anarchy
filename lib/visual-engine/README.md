# Anarchy Visual Engine — Module Autonome (`/lib/visual-engine` & `/components/visual-engine`)

Ce module encapsule l'intégralité du moteur visuel audio-réactif **Anarchy Visual Engine (v2.0 M1–M6)** issu de `tevateva21-hash/anarchy-visual-engine`, isolé physiquement pour rester simple à modifier ou étendre indépendamment du reste d'Open Hub.

## Architecture physique des fichiers

- `lib/visual-engine/contracts.ts` — Tous les types TypeScript (Scènes, Palettes, Effets, Faders Console, BPM Sync, Lyrics, Presets, Timeline M6).
- `lib/visual-engine/audioAnalysis.ts` — Analyse spectrale déterministe FFT radix-2 à 24 kHz, détection de tempo/phase (`estimateTempoBpm`), générateur WAV synthétique (`createSyntheticDemoWavFile`), et extracteur temps réel pour le lecteur persistant Open Hub.
- `lib/visual-engine/analysis.worker.ts` — Web Worker hors-fil pour calculer la FFT sans bloquer l'interface.
- `lib/visual-engine/cache.ts` — Cache IndexedDB local (`anarchy-analysis`, max 5 pistes, TTL 30 jours, aucune donnée personnelle).
- `lib/visual-engine/importAudio.ts` — Validation d'en-têtes MP3/WAV, décodage `OfflineAudioContext` à 24 kHz et orchestration du Worker.
- `lib/visual-engine/presets.ts` — Schémas M4/M6, PRNG Mulberry32 déterministe, verrous individuels, sérialisation/validation JSON, variations contraintes et évaluation de timeline multi-scènes.
- `lib/visual-engine/renderer.ts` — Moteur de rendu logiciel `320×180` nearest-neighbor :
  - **2 scènes 16-bit Pixel Art** (`industrial-city`, `digital-void`)
  - **3 scènes 32-bit Low-Poly PS1** (`ps1-nightmare`, `rave-dungeon`, `techno-therapy`) avec rasterizer logiciel, tramage Bayer 4×4, brouillard Z et textures affines
  - **7 palettes** dont `techno-therapy`, `acid-violet`, `anarchy-anaglyph` et `blood-red`
  - **Passes post-FX & audio** : Kick Blackout au BPM, morphing inter-palettes, kaléidoscope psychédélique, pendule caméra (`feature/pendulum-camera`), anaglyphe 3D rouge/cyan, incrustation de paroles en police bitmap 5×5.

## Page dédiée et composants UI

- `components/visual-engine/ConsoleFader.tsx` — Fader vertical tactile DAW avec capuchon BD et verrou individuel.
- `components/visual-engine/WaveformCanvas.tsx` — Enveloppe min/max interactive et seekable.
- `components/visual-engine/VisualEngineStudio.tsx` — Studio complet à **18 faders console**, presets M4, timeline M6, lecteur local & synchro Open Hub.
- `app/anarchy-visual-design/page.tsx` — Page publique principale accessible via `/anarchy-visual-design` (et alias `/visual-engine`).

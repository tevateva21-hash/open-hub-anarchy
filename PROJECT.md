# Project: Open Hub (by Anarchy)

## Architecture
- **Framework**: Next.js 14.2.35 (App Router, TypeScript 5, Tailwind CSS 3.4.1) in `/home/antigravity`.
- **Artistic Direction (Clinical DAW + 3D Anaglyph Cartoon BD / Figma UI Kit)**:
  - **Clinical Base**: Pure White (`#FFFFFF` / `brand-white`) module containers, Pearl Grey (`#F5F5F5` / `brand-pearl`) backgrounds, Structural Charcoal (`#222226` / `brand-charcoal` & `#302E2E`), soft clinical drop shadows (`shadow-clinical`, `shadow-clinical-hover`), 1px precision borders (`border-neutral-200/90`).
  - **Technical Accents**: `Roboto Mono` (`font-mono`) for DAW readouts, buttons, timecodes, SHA-256 hashes, and metrics; `Inter` (`font-sans`) for body copy, thread titles, and documentation; Cinema Red (`#FF1B24` / `brand-red`) for primary CTAs, active LED indicators, oscilloscope traces, and blockquote/code left borders.
  - **BD / Pop-Art Touches**: Thick black ink borders (`#000000` / `brand-black`, `border-2` / `border-4 border-black`, `shadow-comic`, `shadow-comic-sm`), circular `AvatarBD` illustrations featuring characters wearing 3D anaglyph glasses (Left lens `#FF1B24`, Right lens `#00E5FF`) with multiple expressions/presets (`spectateur-a`, `spectateur-b`, `synth`, `dsp`, `mod`, `hyped`, `shocked`, `glitch`), `.anaglyph-ring` hover effect, and comic speech-bubble tooltips/stickers.
- **Module Boundaries & Data Flow**:
  1. **Data & Domain Catalog (`lib/openhub-data.ts`)**: Authoritative typed catalog for 6+ open-source VST/CLAP/AU plugins (including `anr-vst-01` Anaglyph Saturator, `anr-vst-02` Clinical Transient, `anr-vst-03` Spectateur 3D Video/FX Synth, `anr-vst-04` Sub-Zero Phase Limiter, `anr-vst-05` Cyan Reverb Matrix, `anr-vst-06` Bit-Crush BD-808), 6+ royalty-free Sample Packs / Stems (matching Google Drive `Sons/` tracks: `Anarchy.wav`, `SYSTEM OVERLOAD.wav`, `POWER GLOVE REMIX.wav`, `psychedelic trap.wav`, `PSYCHEDELIC VIBE.wav`, `tribal -136.wav`), initial Forum discussions across boards (`/dsp/`, `/vst/`, `/samples/`, `/showcase/`), and Blog/Documentation technical articles.
  2. **Global Persistent Audio Engine (`components/audio/AudioPlayerContext.tsx` & `components/audio/StickyBottomPlayer.tsx`)**: React Context mounted in `app/layout.tsx` backed by browser Web Audio API (`AudioContext`, `AnalyserNode`, procedural multi-preset synth/drum/bass + Dry/Wet DSP effect chain) driving a 60fps `<canvas>` red (`#FF1B24`) oscilloscope and bicolor VU meters in a fixed bottom bar (`fixed bottom-0 left-0 right-0 z-40`), persisting playback across App Router navigation and respecting `openhub_audio_prefs` GDPR consent.
  3. **Global Navigation, Responsive Shell & Compliance (`app/layout.tsx`, `components/layout/HeaderNav.tsx`, `components/compliance/CookieConsentBanner.tsx`)**: Sticky header with 3D glasses emblem, desktop + mobile (`<768px`) navigation drawer/bar for `/`, `/samples`, `/forum`, `/blog`, `/legal`, and coordinated z-index/bottom offsets (`pb-28` on body/footer, `bottom-24` on CookieConsentBanner) plus strict CNIL Privacy-by-Design default (`useState(false)` for `audioPreferences`).
  4. **Main Hub, VST Catalogue, Samples Hub, Forum & Blog (`app/page.tsx`, `app/samples/page.tsx`, `app/forum/page.tsx`, `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`)**: Jalon 2 pages with interactive search, filtering, audio preview triggers, imageboard + alternating row forum (`#FFFFFF`/`#F5F5F5`) with live thread/reply creation, and `max-w-3xl mx-auto` technical blog/docs with `#FF1B24` framed callouts/code.
  5. **Detailed Plugin Hosting & Interactive Figma UI Kit Rack (`app/vst/[id]/page.tsx`, `components/vst/FigmaPluginRack.tsx`)**: Jalon 4 dedicated plugin pages featuring the 4 modular Figma UI Kit sections from `Prompt_Plugin_Video_UI.md` (Section A Video Output Preview `1920x1080 | 60FPS` with 3D BD status overlay, Section B 16-Step Sequencer + Color Wheel + Glitch/Strobe/Invert triggers, Section C Modulation Matrix Router with `1.5px` Bézier cables + minimalist Knobs & Sliders, Section D 3D BD Avatar Presets `SPECTATEUR 3D A/B` & comic tooltips), OS installers (`.vst3`, `.clap`, `.au`, source), SHA-256 verification copy button, and `openhub_vst_telemetry` opt-in counter.

## Feature Inventory
Every feature from the Survey phase must appear here with its assigned milestone. No feature may be left unassigned.
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Hybrid Clinical DAW + 3D BD Color Palette & Shadows | Tailwind palette (`#FFFFFF`, `#F5F5F5`, `#222226`/`#302E2E`, `#FF1B24`, `#000000`, `#00E5FF`) & clinical/comic shadows | M1 | survey |
| 2 | Dual Technical & UI Typography (`Inter` + `Roboto Mono`) | `Inter` for UI/body/titles, `Roboto Mono` for DAW metrics/buttons/timestamps | M1 | survey |
| 3 | `AvatarBD.tsx` Expressive 3D BD Character System | Circular `border-4 border-black` SVG character with `#FF1B24`/`#00E5FF` 3D glasses, distinct expressions/categories (`spectateur-a`, `spectateur-b`, `synth`, `dsp`, `mod`, `hyped`, `shocked`), `.anaglyph-ring` hover, and reactive peak state | M1 | survey |
| 4 | `Card.tsx`, `Button.tsx` & Comic Badges/Tooltips | Clinical cards with DAW top bar & LED indicator, `Roboto Mono` buttons (`clinical`, `primary`, `comic`), and BD speech-bubble tooltips | M1 | survey |
| 5 | Sticky Header with 3D Emblem, Real Route Nav & Mobile Menu | Header with 3D glasses logo, `OPEN HUB // by anarchy`, active links (`/`, `/samples`, `/forum`, `/blog`, `/legal`), and responsive mobile drawer/menu (`<768px`) | M1 | survey |
| 6 | Filterable 3-Column VST Plugin Catalogue (`app/page.tsx`) | `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` plugin cards with category filter, live search, 3D BD category badges, `▶ TEST_SIGNAL` audio trigger, and `GET_VST3` link to `/vst/[id]` | M2 | survey |
| 7 | Samples & Sounds Sharing Hub (`/samples`) | Open-source sample packs & stems (`Anarchy.wav`, `SYSTEM OVERLOAD.wav`, `POWER GLOVE REMIX.wav`, `psychedelic trap.wav`, `PSYCHEDELIC VIBE.wav`, `tribal -136.wav`) with BPM/key filter, 1-click Sticky Player preview, WAV download, and community pack submission | M2 | survey |
| 8 | Community Forum (`/forum`) | Modernized imageboard + alternating rows (`#FFFFFF` / `#F5F5F5`) with `AvatarBD` expressions, `Inter` semi-bold titles, `Roboto Mono` metadata, category filtering, thread expansion, and client-side New Thread / Quick Reply composer | M3 | survey |
| 9 | Blog & Technical DSP Documentation (`/blog` & `/blog/[slug]`) | Clean single-column reading layout (`max-w-3xl mx-auto`), `Inter` Bold headings, `Roboto Mono` code/DSP math blocks, quotes/callouts framed by `#FF1B24` left border, and interactive audio examples | M3 | survey |
| 10 | Persistent Sticky Bottom Audio Player & Global Context (Jalon 3) | `fixed bottom-0 left-0 right-0 z-40` `#F5F5F5` bar with `#302E2E` top border, global `React Context` + Web Audio API procedural DSP synth/effects engine, real-time `#FF1B24` `<canvas>` oscilloscope, bicolor VU meters, DRY/WET DSP switch, and `openhub_audio_prefs` persistence | M1 | survey |
| 11 | Detailed Plugin Download Pages (`/vst/[id]`) (Jalon 4) | Dedicated page per plugin with technical specs, OS binary downloads (macOS, Windows, Linux VST3/CLAP/AU), SHA-256 checksum copy/verify, changelog, A/B dry-wet preview, and `openhub_vst_telemetry` opt-in counter | M2 | survey |
| 12 | Interactive Figma UI Kit Audio-Reactive Plugin Rack (`Prompt_Plugin_Video_UI.md`) | 4 modular Figma UI Kit sections: (A) `1920x1080 | 60FPS` Video Output Preview with 3D BD spectator status overlay, (B) 16-Step Sequencer + Color Wheel + Glitch/Strobe/Invert triggers, (C) Modulation Matrix Router with `1.5px` Bézier cables + minimalist Knobs & Sliders, (D) 3D BD Avatar Presets (`SPECTATEUR 3D A/B`) & comic tooltips | M2 | survey |
| 13 | HTTPS/HSTS/CSP Security & RGPD/CNIL Compliance Refinement | Fix `CookieConsentBanner.tsx:29` `audioPreferences` default to `false`, coordinate bottom offset with Sticky Player, add `worker-src 'self' blob:` to CSP, update `sitemap.ts`/`robots.ts`/`.gitignore` | M1 | survey |
| 14 | Anarchy Visual Design Studio V2 (`/anarchy-visual-design`, 19 Faders) | Isolated modular visual synthesizer (`lib/visual-engine/*`, `components/visual-engine/*`) integrated from `tevateva21-hash/anarchy-visual-engine` (`d925fd4` + pendulum/anaglyph): 5 scenes (incl. `techno-therapy`), 7 palettes + morphing, 19 `ConsoleFader` controls in 3 banks, local 24kHz FFT Worker + IndexedDB cache, M4 randomizer/locks & M6 Undo/Redo + Multi-scene Timeline | M1 | user_request |
| 15 | Anarchy Retro Browser HUD Site Wrapper (`AnarchyHudShell.tsx`) | Global 90s Win98/IE retro browser chrome (segmented green→cobalt→sky gradient title bar, quick module strip + monochrome/3D `[A]` badge, interactive `Address` bar, desktop scrollbar rail, `Done` bottom bar) merged with Figma Clinical + BD 3D ink styling, strictly without external nightclub references | M1 | user_request |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Core Data, Persistent Audio Engine (Jalon 3), Expressive `AvatarBD`, Responsive Header, GDPR Fixes, Visual Engine V2 & Retro Anarchy HUD | `lib/openhub-data.ts`, `components/audio/*`, `components/ui/AvatarBD.tsx`, `components/layout/HeaderNav.tsx`, `components/layout/AnarchyHudShell.tsx`, `lib/visual-engine/*`, `components/visual-engine/*`, `app/anarchy-visual-design/page.tsx`, `app/layout.tsx`, `components/compliance/CookieConsentBanner.tsx`, `next.config.mjs`, `app/sitemap.ts`, `app/robots.ts`, `.gitignore` | none | DONE |
| M2 | Home VST Catalogue, Samples Hub (`/samples`), Detailed Plugin Pages (`/vst/[id]`) & Interactive Figma UI Kit Rack (Jalons 2 & 4) | `app/page.tsx`, `app/samples/page.tsx`, `app/vst/[id]/page.tsx`, `components/vst/FigmaPluginRack.tsx` | M1 | DONE |
| M3 | Modernized Imageboard Forum (`/forum`) & Single-Column Technical Blog/Docs (`/blog`, `/blog/[slug]`) (Jalon 2) | `app/forum/page.tsx`, `app/blog/page.tsx`, `app/blog/[slug]/page.tsx` | M1 | DONE |
| M4 | Final Milestone — E2E Test Suite Pass (Tiers 1–4 + F14/F15) & Adversarial Coverage Hardening (Tier 5) | Run E2E test suite against live server on port 3000 (`156/156 PASSED`), fix any defects across viewports (`375px`, `768px`, `1440px`), and complete verification | M1, M2, M3, E2E Track | DONE |

## Interface Contracts

### `lib/openhub-data.ts` ↔ All Pages & Audio Engine
- **`VstPlugin`**:
  ```ts
  export type VstCategory = "SATURATION" | "DYNAMICS" | "SYNTH" | "REVERB" | "VIDEO_FX" | "UTILITY";
  export type AvatarExpression = "spectateur-a" | "spectateur-b" | "synth" | "dsp" | "mod" | "hyped" | "shocked" | "glitch";

  export interface VstPlugin {
    id: string; // e.g. "anr-vst-01"
    code: string; // e.g. "ANR-VST-01"
    name: string; // e.g. "ANAGLYPH SATURATOR"
    version: string; // e.g. "v2.4.0"
    category: VstCategory;
    formats: ("VST3" | "CLAP" | "AU")[];
    os: ("macOS" | "Windows" | "Linux")[];
    author: string;
    authorBadge: string;
    avatarExpression: AvatarExpression;
    description: string;
    longDescription: string;
    metrics: {
      oversampling: string;
      latency: string;
      cpuLoad: string;
      license: string;
    };
    sha256: {
      macos: string;
      windows: string;
      linux: string;
    };
    fileSize: string;
    downloadsCount: number;
    audioProfile: {
      bpm: number;
      key: string;
      synthType: "saturator" | "transient" | "video-synth" | "limiter" | "reverb" | "bitcrush";
      baseFreq: number;
      driveAmount: number;
    };
    defaultKnobs: {
      cutoff: number; // 0-100
      resonance: number; // 0-100
      drive: number; // 0-100
      mix: number; // 0-100
      gainDb: number; // -24 to +12
    };
    changelog: { version: string; date: string; notes: string[] }[];
  }
  ```
- **`SampleTrack`**:
  ```ts
  export interface SampleTrack {
    id: string; // e.g. "smp-anarchy-01"
    title: string; // e.g. "Anarchy.wav"
    packName: string;
    genre: "INDUSTRIAL" | "CYBER_TRAP" | "SYNTHWAVE" | "TRIBAL_CORE" | "PSYCHEDELIC" | "GLITCH_BASS";
    bpm: number;
    key: string;
    durationSec: number;
    sampleRate: string; // "48.0 kHz / 24-BIT"
    license: "CC0 1.0" | "CC-BY 4.0";
    fileSizeMb: number;
    author: string;
    avatarExpression: AvatarExpression;
    waveformPeaks: number[]; // 32 normalized values 0.1..1.0
    synthProfile: {
      baseFreq: number;
      tempoBpm: number;
      pattern: number[]; // 16-step note/trigger array
      timbre: "acid" | "overload" | "powerglove" | "psytrap" | "psyvibe" | "tribal";
    };
  }
  ```
- **`ForumThread` & `ForumReply`**:
  ```ts
  export type ForumBoard = "ALL" | "DSP_DEV" | "VST_RELEASE" | "SAMPLES" | "SHOWCASE";
  export interface ForumReply {
    id: string;
    author: string;
    tripcode: string;
    badge: string;
    avatarExpression: AvatarExpression;
    createdAt: string;
    content: string;
    attachedTrackId?: string;
  }
  export interface ForumThread {
    id: string;
    board: Exclude<ForumBoard, "ALL">;
    title: string;
    author: string;
    tripcode: string;
    badge: string;
    avatarExpression: AvatarExpression;
    createdAt: string;
    lastBump: string;
    views: number;
    pinned?: boolean;
    content: string;
    attachedTrackId?: string;
    replies: ForumReply[];
  }
  ```
- **`BlogPost`**:
  ```ts
  export interface BlogPost {
    slug: string;
    title: string;
    subtitle: string;
    category: "DSP_WHITE_PAPER" | "VST_ARCHITECTURE" | "FIGMA_DESIGN_SYSTEM" | "RELEASE_NOTES";
    author: string;
    authorRole: string;
    authorBadge: string;
    avatarExpression: AvatarExpression;
    publishedAt: string;
    readingTimeMin: number;
    summary: string;
    quoteCallout: string;
    codeSnippet: { language: string; title: string; code: string };
    sections: { heading: string; paragraphs: string[]; formulaOrTip?: string }[];
    relatedPluginId?: string;
  }
  ```

### `components/audio/AudioPlayerContext.tsx` ↔ Consumers (`app/page.tsx`, `app/vst/[id]/page.tsx`, `app/samples/page.tsx`, `app/forum/page.tsx`, `app/blog/[slug]/page.tsx`)
- **`useAudioPlayer()` hook signature**:
  ```ts
  export interface AudioTrackItem {
    id: string;
    title: string;
    subtitle: string;
    sourceType: "VST_DEMO" | "SAMPLE_WAV";
    bpm: number;
    key: string;
    avatarExpression: AvatarExpression;
    pluginId?: string;
  }

  export interface AudioPlayerContextValue {
    currentTrack: AudioTrackItem | null;
    queue: AudioTrackItem[];
    isPlaying: boolean;
    wetDryMix: boolean; // true = WET (DSP active), false = DRY (bypass)
    volume: number; // 0..1
    isMuted: boolean;
    currentTime: number;
    duration: number;
    oscilloscopeMode: "WAVE" | "FFT" | "ANAGLYPH";
    peakLevels: { left: number; right: number }; // 0..100 for bicolor VU meters
    playTrack: (track: AudioTrackItem) => void;
    togglePlay: () => void;
    nextTrack: () => void;
    prevTrack: () => void;
    setVolume: (vol: number) => void;
    toggleMute: () => void;
    toggleWetDry: () => void;
    setOscilloscopeMode: (mode: "WAVE" | "FFT" | "ANAGLYPH") => void;
    seekTo: (seconds: number) => void;
    getTimeDomainData: (target: Uint8Array) => void;
    getFrequencyData: (target: Uint8Array) => void;
    triggerGlitchBurst: (type?: "glitch" | "strobe" | "invert") => void;
  }
  ```

### `components/ui/AvatarBD.tsx` ↔ All Pages
- Backward-compatible with existing props (`src`, `alt`, `name`, `size`, `badgeText`, `className`), plus optional:
  - `expression?: AvatarExpression` (defaults to deterministic hash of `name` so different users automatically get distinct comic character expressions/hair/frames!)
  - `anaglyphRing?: boolean` (adds `.anaglyph-ring` red/cyan 3D border offset)
  - `audioReactive?: boolean` (pulses glasses when audio is playing)

## Code Layout
- `/home/antigravity/lib/openhub-data.ts` — Owned by **M1** (read by M2, M3)
- `/home/antigravity/components/audio/AudioPlayerContext.tsx` — Owned by **M1**
- `/home/antigravity/components/audio/StickyBottomPlayer.tsx` — Owned by **M1**
- `/home/antigravity/components/layout/HeaderNav.tsx` — Owned by **M1** (PRESERVE)
- `/home/antigravity/components/layout/AnarchyHudShell.tsx` — Owned by **M1** (PRESERVE — Retro Anarchy Browser HUD wrapper)
- `/home/antigravity/lib/visual-engine/*` — Owned by **M1** (PRESERVE — Physically isolated Anarchy Visual Engine V2 core)
- `/home/antigravity/components/visual-engine/*` — Owned by **M1** (PRESERVE — Studio UI + 19 `ConsoleFader` + `WaveformCanvas`)
- `/home/antigravity/app/anarchy-visual-design/page.tsx` & `/home/antigravity/app/visual-engine/page.tsx` — Owned by **M1** (PRESERVE)
- `/home/antigravity/components/ui/AvatarBD.tsx` — Owned by **M1**
- `/home/antigravity/components/compliance/CookieConsentBanner.tsx` — Owned by **M1**
- `/home/antigravity/app/layout.tsx`, `app/globals.css`, `next.config.mjs`, `app/sitemap.ts`, `app/robots.ts`, `.gitignore` — Owned by **M1**
- `/home/antigravity/app/page.tsx` — Owned by **M2**
- `/home/antigravity/app/samples/page.tsx` — Owned by **M2**
- `/home/antigravity/app/vst/[id]/page.tsx` & `/home/antigravity/components/vst/FigmaPluginRack.tsx` — Owned by **M2**
- `/home/antigravity/app/forum/page.tsx` — Owned by **M3**
- `/home/antigravity/app/blog/page.tsx` & `/home/antigravity/app/blog/[slug]/page.tsx` — Owned by **M3**
- `/home/antigravity/tests/e2e/*` & `/home/antigravity/TEST_INFRA.md` & `/home/antigravity/TEST_READY.md` — Owned by **E2E Testing Track**

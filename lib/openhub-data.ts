/**
 * OPEN HUB // by anarchy — Authoritative Domain & Technical Catalog
 *
 * Strictly implements PROJECT.md § Interface Contracts for:
 * - VST3 / CLAP / AU Open-Source Plugins (6 modules)
 * - Royalty-Free Sample Packs & Stems matching Google Drive `Sons/` (6 tracks)
 * - Community Forum Boards, Threads & Replies (6+ discussions)
 * - Technical DSP Blog & Documentation Articles (4 comprehensive whitepapers/guides)
 * - Audio Player Queue items & conversion helpers
 */

export type VstCategory =
  | "SATURATION"
  | "DYNAMICS"
  | "SYNTH"
  | "REVERB"
  | "VIDEO_FX"
  | "UTILITY";

export type AvatarExpression =
  | "spectateur-a"
  | "spectateur-b"
  | "synth"
  | "dsp"
  | "mod"
  | "hyped"
  | "shocked"
  | "glitch";

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
    synthType:
      | "saturator"
      | "transient"
      | "video-synth"
      | "limiter"
      | "reverb"
      | "bitcrush";
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

export interface SampleTrack {
  id: string; // e.g. "smp-anarchy-01"
  title: string; // e.g. "Anarchy.wav"
  packName: string;
  genre:
    | "INDUSTRIAL"
    | "CYBER_TRAP"
    | "SYNTHWAVE"
    | "TRIBAL_CORE"
    | "PSYCHEDELIC"
    | "GLITCH_BASS";
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
    timbre:
      | "acid"
      | "overload"
      | "powerglove"
      | "psytrap"
      | "psyvibe"
      | "tribal";
  };
}

export type ForumBoard =
  | "ALL"
  | "DSP_DEV"
  | "VST_RELEASE"
  | "SAMPLES"
  | "SHOWCASE";

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

export interface BlogPost {
  slug: string;
  title: string;
  subtitle: string;
  category:
    | "DSP_WHITE_PAPER"
    | "VST_ARCHITECTURE"
    | "FIGMA_DESIGN_SYSTEM"
    | "RELEASE_NOTES";
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

/**
 * 1. VST / CLAP / AU OPEN-SOURCE PLUGIN CATALOG (6 MODULES)
 */
export const VST_PLUGINS: VstPlugin[] = [
  {
    id: "anr-vst-01",
    code: "ANR-VST-01",
    name: "ANAGLYPH SATURATOR",
    version: "v2.4.0",
    category: "SATURATION",
    formats: ["VST3", "CLAP", "AU"],
    os: ["macOS", "Windows", "Linux"],
    author: "Anarchy DSP Core",
    authorBadge: "DSP",
    avatarExpression: "spectateur-a",
    description:
      "Saturateur harmonique multibande à séparation stéréo Rouge/Cyan, conçu pour sculpter des basses industrielles et des synthés agressifs sans aliasing.",
    longDescription:
      "ANAGLYPH SATURATOR (ANR-VST-01) décompose le signal stéréo en deux canaux d'excitation complémentaires : le canal Mid/Left ('Rouge Cinéma') applique une distorsion à lampe triode asymétrique riche en harmoniques paires, tandis que le canal Side/Right ('Cyan Anaglyphe') injecte un pliage d'onde (wavefolding) de Chebyshev d'ordre 5 avec compensation de phase linéaire. Doté d'un filtre anti-aliasing polyphasé 16x à phase minimale, il préserve l'impact des transitoires tout en élargissant la scène stéréo.",
    metrics: {
      oversampling: "16x Polyphase",
      latency: "0.4 ms",
      cpuLoad: "1.8% @ 48kHz",
      license: "GPL-3.0",
    },
    sha256: {
      macos: "8f4b2e91c7d03a65b12e894c5f6a7d3e9201b4c8d7e6f5a4b3c2d1e0f9a8b7c6",
      windows: "3a7c9e12f4b80d56e21a903f4c8b7d6e1029a3b4c5d6e7f8091a2b3c4d5e6f7a",
      linux: "c1d2e3f4a5b60789123456789abcdef0123456789abcdef0fedcba9876543210",
    },
    fileSize: "14.2 MB",
    downloadsCount: 18420,
    audioProfile: {
      bpm: 140,
      key: "F Minor",
      synthType: "saturator",
      baseFreq: 87.31,
      driveAmount: 82,
    },
    defaultKnobs: {
      cutoff: 78,
      resonance: 42,
      drive: 85,
      mix: 76,
      gainDb: 1.5,
    },
    changelog: [
      {
        version: "v2.4.0",
        date: "2026-11-10",
        notes: [
          "Ajout du moteur d'oversampling 16x ADAA (Antiderivative Anti-Aliasing) du second ordre.",
          "Intégration du visualiseur temps-réel Figma UI Kit (Video Output 60fps & Matrice Bézier).",
          "Support natif CLAP 1.2 avec modulation polyphonique par voix sous Bitwig & Reaper.",
        ],
      },
      {
        version: "v2.2.1",
        date: "2026-08-19",
        notes: [
          "Correction d'un décalage DC de -0.02 dBFS lors de l'activation du pliage Cyan Side.",
          "Optimisation SIMD AVX2 / NEON réduisant l'empreinte CPU de 34%.",
        ],
      },
    ],
  },
  {
    id: "anr-vst-02",
    code: "ANR-VST-02",
    name: "CLINICAL TRANSIENT",
    version: "v1.1.2",
    category: "DYNAMICS",
    formats: ["VST3", "CLAP", "AU"],
    os: ["macOS", "Windows", "Linux"],
    author: "Dr. RedShift",
    authorBadge: "MOD",
    avatarExpression: "dsp",
    description:
      "Processeur d'enveloppe transitoire chirurgical à phase linéaire et détection différentielle double-enveloppe sans pompage.",
    longDescription:
      "CLINICAL TRANSIENT (ANR-VST-02) abandonne les détecteurs RMS classiques au profit d'un réseau de suivi d'enveloppe différentiel ultra-rapide (temps d'attaque < 50 microsecondes) couplé à un étage de maintien adaptatif dépendant de la fréquence. Idéal pour faire claquer des caisses claires industrielles, raccourcir la résonance de kicks 808 ou extraire les micro-détails d'une boucle percussive.",
    metrics: {
      oversampling: "8x Linear-Phase",
      latency: "0.0 ms",
      cpuLoad: "0.9% @ 48kHz",
      license: "MIT",
    },
    sha256: {
      macos: "5e9d1c3b7a2f4086d19e2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d",
      windows: "9b8a7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
      linux: "7f6e5d4c3b2a1908f7e6d5c4b3a291807f6e5d4c3b2a1908f7e6d5c4b3a29180",
    },
    fileSize: "9.8 MB",
    downloadsCount: 14290,
    audioProfile: {
      bpm: 136,
      key: "D Minor",
      synthType: "transient",
      baseFreq: 110.0,
      driveAmount: 64,
    },
    defaultKnobs: {
      cutoff: 88,
      resonance: 25,
      drive: 65,
      mix: 90,
      gainDb: 2.0,
    },
    changelog: [
      {
        version: "v1.1.2",
        date: "2026-10-28",
        notes: [
          "Ajout du limiteur de crête True-Peak en sortie d'étage d'attaque.",
          "Nouveau mode Sidechain Tilt permettant de cibler uniquement la bande 1.5 kHz – 8 kHz.",
        ],
      },
      {
        version: "v1.0.0",
        date: "2026-06-04",
        notes: [
          "Publication initiale open-source sous licence MIT pour macOS Universal, Windows et Linux.",
        ],
      },
    ],
  },
  {
    id: "anr-vst-03",
    code: "ANR-VST-03",
    name: "SPECTATEUR 3D VIDEO-SYNTH",
    version: "v3.0.1",
    category: "VIDEO_FX",
    formats: ["VST3", "CLAP"],
    os: ["macOS", "Windows", "Linux"],
    author: "Koma_3D & Anarchy",
    authorBadge: "3D",
    avatarExpression: "spectateur-b",
    description:
      "Synthétiseur hybride audio-vidéo générant des trames vectorielles anaglyphes 60fps et des textures FM synchronisées au séquenceur 16 pas.",
    longDescription:
      "SPECTATEUR 3D VIDEO-SYNTH (ANR-VST-03) incarne l'architecture complète du Figma UI Kit d'Open Hub. Il combine un synthétiseur FM à 4 opérateurs et table d'ondes avec un générateur de shaders GLSL/WebGL temps-réel produisant des visuels stéréoscopiques Rouge/Cyan (#FF1B24 / #00E5FF) pilotés par les transitoires, la fondamentale (Pitch) et le niveau RMS.",
    metrics: {
      oversampling: "8x + GPU 60FPS",
      latency: "1.2 ms",
      cpuLoad: "3.1% @ 48kHz",
      license: "GPL-3.0",
    },
    sha256: {
      macos: "1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f809",
      windows: "2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a",
      linux: "3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b",
    },
    fileSize: "22.6 MB",
    downloadsCount: 23150,
    audioProfile: {
      bpm: 128,
      key: "A Minor",
      synthType: "video-synth",
      baseFreq: 110.0,
      driveAmount: 74,
    },
    defaultKnobs: {
      cutoff: 85,
      resonance: 60,
      drive: 72,
      mix: 100,
      gainDb: 0.0,
    },
    changelog: [
      {
        version: "v3.0.1",
        date: "2026-11-12",
        notes: [
          "Implémentation complète des 4 sections du Figma UI Kit v1.0 (Video Output 1920x1080, 16-Step Sequencer, Matrix Router Bézier, Presets Spectateur 3D).",
          "Ajout des déclencheurs matériels Glitch, Strobe et Invert pilotables en MIDI CC.",
        ],
      },
    ],
  },
  {
    id: "anr-vst-04",
    code: "ANR-VST-04",
    name: "SUB-ZERO PHASE LIMITER",
    version: "v1.8.4",
    category: "DYNAMICS",
    formats: ["VST3", "CLAP", "AU"],
    os: ["macOS", "Windows", "Linux"],
    author: "ZeroLatency Lab",
    authorBadge: "CORE",
    avatarExpression: "mod",
    description:
      "Limiteur de mastering brickwall ITU-R BS.1770-4 avec alignement de phase sub-basse et saturation douce de crête.",
    longDescription:
      "SUB-ZERO PHASE LIMITER (ANR-VST-04) est conçu pour les ingénieurs de mastering club et bass-music. Son étage d'anticipation (Lookahead 1.5 ms) sépare le spectre sous 90 Hz pour verrouiller la phase du sub-grave au centre tout en maximisant la sonie LUFS sur le reste du spectre sans distorsion inter-échantillons (ISP).",
    metrics: {
      oversampling: "4x True-Peak",
      latency: "1.5 ms",
      cpuLoad: "1.4% @ 48kHz",
      license: "GPL-3.0",
    },
    sha256: {
      macos: "4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c",
      windows: "5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d",
      linux: "6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e",
    },
    fileSize: "11.4 MB",
    downloadsCount: 11840,
    audioProfile: {
      bpm: 150,
      key: "E Minor",
      synthType: "limiter",
      baseFreq: 82.41,
      driveAmount: 55,
    },
    defaultKnobs: {
      cutoff: 92,
      resonance: 18,
      drive: 58,
      mix: 100,
      gainDb: 3.5,
    },
    changelog: [
      {
        version: "v1.8.4",
        date: "2026-09-30",
        notes: [
          "Calibration des vumètres bicolores L/R sur la norme EBU R128 / -0.1 dBTP.",
          "Ajout du commutateur d'écoute Delta (Différence Entrée/Sortie) instantané.",
        ],
      },
    ],
  },
  {
    id: "anr-vst-05",
    code: "ANR-VST-05",
    name: "CYAN REVERB MATRIX",
    version: "v2.1.0",
    category: "REVERB",
    formats: ["VST3", "CLAP", "AU"],
    os: ["macOS", "Windows", "Linux"],
    author: "Vortex_ acoustical",
    authorBadge: "WAV",
    avatarExpression: "synth",
    description:
      "Réverbération algorithmique FDN à 16 lignes de retard modulées en quadrature avec gel spectral (Freeze) et shimmer granulaire.",
    longDescription:
      "CYAN REVERB MATRIX (ANR-VST-05) utilise un réseau de rétroaction à matrice de Hadamard 16x16 couplé à des filtres passe-tout modulés pour créer des espaces acoustiques allant de la chambre clinique ultra-courte aux cathédrales cybernétiques infinies. L'étage Shimmer décale la queue de réverbération d'une octave supérieure avec filtrage formantique.",
    metrics: {
      oversampling: "2x Internal",
      latency: "0.0 ms",
      cpuLoad: "2.2% @ 48kHz",
      license: "MIT",
    },
    sha256: {
      macos: "708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f",
      windows: "8192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f70",
      linux: "92a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f7081",
    },
    fileSize: "13.1 MB",
    downloadsCount: 16090,
    audioProfile: {
      bpm: 122,
      key: "C Minor",
      synthType: "reverb",
      baseFreq: 130.81,
      driveAmount: 45,
    },
    defaultKnobs: {
      cutoff: 68,
      resonance: 52,
      drive: 40,
      mix: 64,
      gainDb: 0.0,
    },
    changelog: [
      {
        version: "v2.1.0",
        date: "2026-10-14",
        notes: [
          "Nouvel algorithme de diffusion granulaire stéréo à décorrélation interaurale.",
          "Réduction de 40% de l'utilisation mémoire des tampons de ligne à retard.",
        ],
      },
    ],
  },
  {
    id: "anr-vst-06",
    code: "ANR-VST-06",
    name: "BIT-CRUSH BD-808",
    version: "v1.5.0",
    category: "SYNTH",
    formats: ["VST3", "CLAP", "AU"],
    os: ["macOS", "Windows", "Linux"],
    author: "Anarchy Bass Unit",
    authorBadge: "808",
    avatarExpression: "hyped",
    description:
      "Synthétiseur de basses sub-harmoniques 808 et décimateur d'échantillonnage (4-bit à 16-bit) avec filtre résonant en échelle de diodes.",
    longDescription:
      "BIT-CRUSH BD-808 (ANR-VST-06) fusionne un oscillateur sub-grave à pont en T ponté inspiré des circuits analogiques historiques avec un étage de réduction de fréquence d'échantillonnage (Sample-Rate Decimator) synchronisé à la hauteur de note. Chaque attaque génère un punch viscéral suivi d'un grain numérique chantant.",
    metrics: {
      oversampling: "8x Nonlinear",
      latency: "0.2 ms",
      cpuLoad: "1.6% @ 48kHz",
      license: "GPL-3.0",
    },
    sha256: {
      macos: "a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192",
      windows: "b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3",
      linux: "c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4",
    },
    fileSize: "15.7 MB",
    downloadsCount: 20480,
    audioProfile: {
      bpm: 145,
      key: "G Minor",
      synthType: "bitcrush",
      baseFreq: 98.0,
      driveAmount: 90,
    },
    defaultKnobs: {
      cutoff: 74,
      resonance: 68,
      drive: 90,
      mix: 85,
      gainDb: 2.5,
    },
    changelog: [
      {
        version: "v1.5.0",
        date: "2026-11-02",
        notes: [
          "Ajout du suivi de clavier 100% sur la fréquence de décimation Sample & Hold.",
          "Intégration de 32 presets de basses Cyber-Trap et Industrial Hardcore.",
        ],
      },
    ],
  },
];

/**
 * 2. ROYALTY-FREE SAMPLE PACKS & WAV STEMS (MATCHING GOOGLE DRIVE `Sons/`)
 */
export const SAMPLE_TRACKS: SampleTrack[] = [
  {
    id: "smp-anarchy-01",
    title: "Anarchy.wav",
    packName: "ANARCHY CORE VOL. 1",
    genre: "INDUSTRIAL",
    bpm: 140,
    key: "F Minor",
    durationSec: 134,
    sampleRate: "48.0 kHz / 24-BIT",
    license: "CC0 1.0",
    fileSizeMb: 61.18,
    author: "Anarchy Studio",
    avatarExpression: "spectateur-a",
    waveformPeaks: [
      0.35, 0.88, 0.94, 0.62, 0.45, 0.91, 0.78, 0.52,
      0.84, 0.96, 0.71, 0.48, 0.89, 0.93, 0.64, 0.39,
      0.86, 0.98, 0.75, 0.55, 0.92, 0.81, 0.49, 0.77,
      0.95, 0.83, 0.61, 0.87, 0.91, 0.68, 0.44, 0.32,
    ],
    synthProfile: {
      baseFreq: 87.31, // F2
      tempoBpm: 140,
      pattern: [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
      timbre: "acid",
    },
  },
  {
    id: "smp-overload-02",
    title: "SYSTEM OVERLOAD.wav",
    packName: "ANARCHY CORE VOL. 1",
    genre: "GLITCH_BASS",
    bpm: 150,
    key: "E Minor",
    durationSec: 112,
    sampleRate: "48.0 kHz / 24-BIT",
    license: "CC0 1.0",
    fileSizeMb: 44.18,
    author: "Anarchy Studio",
    avatarExpression: "shocked",
    waveformPeaks: [
      0.92, 0.97, 0.81, 0.95, 0.66, 0.89, 0.99, 0.73,
      0.58, 0.94, 0.91, 0.84, 0.49, 0.96, 0.88, 0.77,
      0.93, 0.98, 0.69, 0.85, 0.91, 0.74, 0.62, 0.95,
      0.97, 0.82, 0.71, 0.89, 0.93, 0.76, 0.54, 0.41,
    ],
    synthProfile: {
      baseFreq: 82.41, // E2
      tempoBpm: 150,
      pattern: [1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
      timbre: "overload",
    },
  },
  {
    id: "smp-powerglove-03",
    title: "POWER GLOVE REMIX.wav",
    packName: "RETRO ANAGLYPH 1989",
    genre: "SYNTHWAVE",
    bpm: 128,
    key: "A Minor",
    durationSec: 118,
    sampleRate: "48.0 kHz / 24-BIT",
    license: "CC-BY 4.0",
    fileSizeMb: 40.14,
    author: "Koma_3D",
    avatarExpression: "synth",
    waveformPeaks: [
      0.42, 0.76, 0.84, 0.68, 0.59, 0.81, 0.88, 0.64,
      0.55, 0.79, 0.92, 0.73, 0.61, 0.85, 0.77, 0.52,
      0.69, 0.88, 0.91, 0.74, 0.63, 0.82, 0.86, 0.58,
      0.75, 0.89, 0.78, 0.65, 0.71, 0.62, 0.48, 0.36,
    ],
    synthProfile: {
      baseFreq: 110.0, // A2
      tempoBpm: 128,
      pattern: [1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
      timbre: "powerglove",
    },
  },
  {
    id: "smp-psytrap-04",
    title: "psychedelic trap.wav",
    packName: "PSYCHEDELIC SUB LAB",
    genre: "CYBER_TRAP",
    bpm: 145,
    key: "G Minor",
    durationSec: 142,
    sampleRate: "48.0 kHz / 24-BIT",
    license: "CC0 1.0",
    fileSizeMb: 50.55,
    author: "Dr. RedShift",
    avatarExpression: "hyped",
    waveformPeaks: [
      0.89, 0.95, 0.44, 0.38, 0.91, 0.96, 0.52, 0.41,
      0.87, 0.93, 0.61, 0.78, 0.94, 0.82, 0.39, 0.35,
      0.92, 0.98, 0.48, 0.42, 0.88, 0.91, 0.67, 0.53,
      0.95, 0.89, 0.56, 0.74, 0.86, 0.63, 0.45, 0.29,
    ],
    synthProfile: {
      baseFreq: 98.0, // G2
      tempoBpm: 145,
      pattern: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0],
      timbre: "psytrap",
    },
  },
  {
    id: "smp-psyvibe-05",
    title: "PSYCHEDELIC VIBE.wav",
    packName: "PSYCHEDELIC SUB LAB",
    genre: "PSYCHEDELIC",
    bpm: 122,
    key: "C Minor",
    durationSec: 138,
    sampleRate: "48.0 kHz / 24-BIT",
    license: "CC-BY 4.0",
    fileSizeMb: 50.01,
    author: "Vortex_acoustical",
    avatarExpression: "spectateur-b",
    waveformPeaks: [
      0.31, 0.54, 0.72, 0.85, 0.79, 0.64, 0.58, 0.76,
      0.88, 0.91, 0.77, 0.62, 0.69, 0.83, 0.87, 0.71,
      0.59, 0.74, 0.89, 0.93, 0.81, 0.68, 0.61, 0.78,
      0.84, 0.76, 0.65, 0.57, 0.51, 0.44, 0.37, 0.28,
    ],
    synthProfile: {
      baseFreq: 130.81, // C3
      tempoBpm: 122,
      pattern: [1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0],
      timbre: "psyvibe",
    },
  },
  {
    id: "smp-tribal-06",
    title: "tribal -136.wav",
    packName: "TRIBAL PERCUSSION MATRIX",
    genre: "TRIBAL_CORE",
    bpm: 136,
    key: "D Minor",
    durationSec: 116,
    sampleRate: "48.0 kHz / 24-BIT",
    license: "CC0 1.0",
    fileSizeMb: 39.85,
    author: "Anarchy Bass Unit",
    avatarExpression: "dsp",
    waveformPeaks: [
      0.82, 0.64, 0.91, 0.73, 0.88, 0.59, 0.95, 0.78,
      0.84, 0.67, 0.92, 0.71, 0.89, 0.62, 0.96, 0.81,
      0.85, 0.66, 0.93, 0.75, 0.87, 0.61, 0.94, 0.79,
      0.83, 0.68, 0.90, 0.72, 0.81, 0.58, 0.46, 0.34,
    ],
    synthProfile: {
      baseFreq: 73.42, // D2
      tempoBpm: 136,
      pattern: [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1],
      timbre: "tribal",
    },
  },
];

/**
 * 3. COMMUNITY FORUM THREADS & REPLIES (MODERNIZED IMAGEBOARD + ALTERNATING ROWS)
 */
export const FORUM_THREADS: ForumThread[] = [
  {
    id: "thr-dsp-01",
    board: "DSP_DEV",
    title:
      "[WHITE PAPER] Implémentation ADAA d'ordre 2 pour ANR-VST-01 Anaglyph Saturator sans coût CPU",
    author: "Anarchy_Lead",
    tripcode: "!ANR#808dsp",
    badge: "CORE_DEV",
    avatarExpression: "dsp",
    createdAt: "2026-11-14 06:42 UTC",
    lastBump: "Il y a 12 min",
    views: 1420,
    pinned: true,
    attachedTrackId: "anr-vst-01",
    content:
      "Nous venons de publier la branche v2.4.0 de l'Anaglyph Saturator. En combinant une approximation analytique de la primitive de tanh(x) avec un filtre polyphasé demi-bande à coefficients symétriques, nous avons éliminé le repliement spectral (aliasing) au-dessus de 18 kHz tout en gardant la charge CPU sous 1.8% sur un cœur unique. Testez le signal ci-joint en basculant le switch DRY/WET du lecteur persistant !",
    replies: [
      {
        id: "rep-101",
        author: "Dr. RedShift",
        tripcode: "!Red#Shift99",
        badge: "DSP",
        avatarExpression: "spectateur-a",
        createdAt: "2026-11-14 07:05 UTC",
        content:
          "La différence en mode WET sur le canal Side Cyan est bluffante. J'ai vérifié à l'analyseur FFT : les harmoniques impaires décroissent proprement à -12 dB/oct sans aucune composante inharmonique repliée dans le bas-médium.",
        attachedTrackId: "anr-vst-01",
      },
      {
        id: "rep-102",
        author: "Koma_3D",
        tripcode: "!Koma#GLSL",
        badge: "3D",
        avatarExpression: "spectateur-b",
        createdAt: "2026-11-14 07:18 UTC",
        content:
          "J'ai relié la sortie RMS du saturateur directement à la matrice Bézier du Spectateur 3D Video-Synth. Le décalage anaglyphe rouge/cyan suit les crêtes au pixel près à 60 FPS.",
      },
    ],
  },
  {
    id: "thr-vst-02",
    board: "VST_RELEASE",
    title:
      "[RELEASE v3.0.1] SPECTATEUR 3D VIDEO-SYNTH — Kit UI Figma modulaire & binaires CLAP/VST3",
    author: "Koma_3D",
    tripcode: "!Koma#GLSL",
    badge: "3D_ART",
    avatarExpression: "spectateur-b",
    createdAt: "2026-11-13 21:15 UTC",
    lastBump: "Il y a 38 min",
    views: 985,
    pinned: true,
    attachedTrackId: "anr-vst-03",
    content:
      "Le build v3.0.1 de SPECTATEUR 3D VIDEO-SYNTH (ANR-VST-03) est en ligne avec ses sommes de contrôle SHA-256 vérifiées pour macOS Universal, Windows et Linux. Cette version intègre le séquenceur 16 pas 1/16th, la roue chromatique minimale et les triggers d'effets temps-réel (Glitch / Strobe / Invert).",
    replies: [
      {
        id: "rep-201",
        author: "SynthGlove89",
        tripcode: "!Glove#1989",
        badge: "SYNTH",
        avatarExpression: "synth",
        createdAt: "2026-11-13 22:04 UTC",
        content:
          "Testé sous Reaper 7.22 Linux (Arch + PipeWire, buffer 64 samples). Zéro xrun, le viewport vidéo tourne à 60.0 FPS constants et les câbles Bézier de la matrice de modulation sont super fluides.",
        attachedTrackId: "smp-powerglove-03",
      },
    ],
  },
  {
    id: "thr-smp-03",
    board: "SAMPLES",
    title:
      "[PACK CC0] Stems officiels Google Drive 'Sons/' (Anarchy.wav, SYSTEM OVERLOAD, tribal -136)",
    author: "Anarchy_Bass_Unit",
    tripcode: "!Bass#136bpm",
    badge: "WAV_CC0",
    avatarExpression: "hyped",
    createdAt: "2026-11-13 18:30 UTC",
    lastBump: "Il y a 1 h",
    views: 1640,
    attachedTrackId: "smp-anarchy-01",
    content:
      "Tous les masters et stems 48.0 kHz / 24-bit du dossier 'Sons/' sont désormais indexés sur Open Hub : Anarchy.wav (140 BPM), SYSTEM OVERLOAD.wav (150 BPM), POWER GLOVE REMIX.wav (128 BPM), psychedelic trap.wav (145 BPM), PSYCHEDELIC VIBE.wav (122 BPM) et tribal -136.wav (136 BPM). Licence CC0 / CC-BY : utilisez-les librement dans vos productions et vos bancs de test DSP.",
    replies: [
      {
        id: "rep-301",
        author: "TribalTek_FR",
        tripcode: "!Tribe#23",
        badge: "USER",
        avatarExpression: "shocked",
        createdAt: "2026-11-13 19:12 UTC",
        content:
          "Le kick-bass de 'tribal -136.wav' passé dans CLINICAL TRANSIENT avec +2.0 dB de gain d'attaque démonte littéralement mes moniteurs de studio. Merci pour le partage en 24-bit !",
        attachedTrackId: "smp-tribal-06",
      },
      {
        id: "rep-302",
        author: "ZeroLatency_Lab",
        tripcode: "!Zero#TP",
        badge: "MOD",
        avatarExpression: "mod",
        createdAt: "2026-11-13 20:01 UTC",
        content:
          "Petit conseil mastering sur 'SYSTEM OVERLOAD.wav' : activez le SUB-ZERO PHASE LIMITER avec le verrouillage de phase sous 90 Hz pour garder une compatibilité mono club irréprochable.",
        attachedTrackId: "smp-overload-02",
      },
    ],
  },
  {
    id: "thr-dsp-04",
    board: "DSP_DEV",
    title:
      "Comparatif de matrices de Hadamard vs Householder dans CYAN REVERB MATRIX (ANR-VST-05)",
    author: "Vortex_acoustical",
    tripcode: "!FDN#16x16",
    badge: "DSP",
    avatarExpression: "synth",
    createdAt: "2026-11-12 14:20 UTC",
    lastBump: "Il y a 3 h",
    views: 742,
    attachedTrackId: "anr-vst-05",
    content:
      "Pour obtenir une densité d'échos maximale dès les 15 premières millisecondes sans coloration métallique, nous utilisons une transformation de Walsh-Hadamard rapide (FWHT) en O(N log N) sur 16 lignes de retard premières entre elles. Voici les courbes de décroissance RT60 mesurées.",
    replies: [
      {
        id: "rep-401",
        author: "Dr. RedShift",
        tripcode: "!Red#Shift99",
        badge: "DSP",
        avatarExpression: "dsp",
        createdAt: "2026-11-12 16:05 UTC",
        content:
          "Est-ce que la modulation sinusoïdale en quadrature dans la boucle FDN préserve l'unitarité de la matrice lorsque le paramètre Freeze est engagé à 100% ?",
      },
    ],
  },
  {
    id: "thr-show-05",
    board: "SHOWCASE",
    title:
      "[LIVE SESSION] Psychedelic Trap 145 BPM — Chaîne complète Bit-Crush BD-808 + Anaglyph Saturator",
    author: "SubAlchemist",
    tripcode: "!Alch#808",
    badge: "PRODUCER",
    avatarExpression: "glitch",
    createdAt: "2026-11-11 23:50 UTC",
    lastBump: "Il y a 5 h",
    views: 890,
    attachedTrackId: "smp-psytrap-04",
    content:
      "Voici le rendu de ma dernière session entièrement mixée avec les plugins open-source d'Open Hub. La 808 est générée par BIT-CRUSH BD-808 (décimateur réglé à 28%) puis sculptée par CLINICAL TRANSIENT.",
    replies: [
      {
        id: "rep-501",
        author: "Anarchy_Lead",
        tripcode: "!ANR#808dsp",
        badge: "CORE_DEV",
        avatarExpression: "spectateur-a",
        createdAt: "2026-11-12 08:14 UTC",
        content:
          "Le grain dans le haut-médium de la 808 ressort super bien sur l'oscilloscope rouge ! On l'a ajouté à la playlist par défaut du lecteur.",
        attachedTrackId: "anr-vst-06",
      },
    ],
  },
  {
    id: "thr-vst-06",
    board: "VST_RELEASE",
    title:
      "Vérification cryptographique SHA-256 & reproductibilité des builds CI/CD Linux/macOS/Windows",
    author: "ZeroLatency_Lab",
    tripcode: "!Zero#TP",
    badge: "SECURITY",
    avatarExpression: "mod",
    createdAt: "2026-11-10 11:00 UTC",
    lastBump: "Il y a 9 h",
    views: 615,
    attachedTrackId: "anr-vst-04",
    content:
      "Chaque archive binaire publiée sur Open Hub est compilée de manière déterministe et signée. Vous pouvez copier l'empreinte SHA-256 directement depuis la fiche de chaque plugin et la vérifier via `sha256sum` ou `shasum -a 256` avant installation dans votre dossier VST3/CLAP.",
    replies: [
      {
        id: "rep-601",
        author: "LinuxAudio_Dev",
        tripcode: "!LV2#CLAP",
        badge: "DEV",
        avatarExpression: "dsp",
        createdAt: "2026-11-10 13:22 UTC",
        content:
          "Vérifié sur les 6 plugins ce matin : les sommes SHA-256 correspondent bit pour bit aux artefacts de compilation CMake.",
      },
    ],
  },
];

/**
 * 4. TECHNICAL BLOG & DOCUMENTATION ARTICLES (`max-w-3xl mx-auto` single-column reader)
 */
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "antialiasing-adaa-anaglyph-saturator",
    title:
      "Suppression de l'Aliasing Non-Linéaire par Primitives Analytiques (ADAA) dans Anaglyph Saturator",
    subtitle:
      "Comment obtenir une distorsion triode et wavefolding d'une pureté chirurgicale sans suréchantillonnage 64x prohibitif.",
    category: "DSP_WHITE_PAPER",
    author: "Anarchy DSP Core",
    authorRole: "Lead Audio Mathematician",
    authorBadge: "DSP",
    avatarExpression: "dsp",
    publishedAt: "2026-11-14",
    readingTimeMin: 7,
    relatedPluginId: "anr-vst-01",
    summary:
      "L'application naïve d'une fonction de transfert non-linéaire en temps discret génère un repliement spectral (aliasing) inharmonique. Cet article détaille l'architecture ADAA d'ordre 2 combinée à un filtre polyphasé dans ANR-VST-01.",
    quoteCallout:
      "« Une distorsion analogique musicale ne dépend pas de la douceur de sa courbe statique, mais de l'absence totale de repliement spectral inharmonique dans la bande audible 20 Hz – 20 kHz. »",
    codeSnippet: {
      language: "cpp",
      title: "AnaglyphSaturatorDSP.hpp — Étage ADAA d'ordre 1 & Séparation Rouge/Cyan",
      code: `// Antiderivative Anti-Aliasing (ADAA) pour f(x) = tanh(drive * x)
// F1(x) = ln(cosh(drive * x)) / drive
inline float processChannelADAA(float x, float& x1, float drive) noexcept {
    const float gx = drive * x;
    const float gx1 = drive * x1;
    const float diff = x - x1;
    float y = 0.0f;

    if (std::fabs(diff) > 1e-5f) {
        const float F1_x  = std::log(std::cosh(gx)) / drive;
        const float F1_x1 = std::log(std::cosh(gx1)) / drive;
        y = (F1_x - F1_x1) / diff;
    } else {
        y = std::tanh(0.5f * (gx + gx1));
    }
    x1 = x;
    return y;
}`,
    },
    sections: [
      {
        heading: "01. Le problème du repliement spectral dans les saturateurs numériques",
        paragraphs: [
          "Lorsqu'un signal audio numérique échantillonné à 48.0 kHz traverse une non-linéarité abrupte comme une tangente hyperbolique ou un plieur d'onde de Chebyshev, des harmoniques d'ordre supérieur sont créées bien au-delà de la fréquence de Nyquist (24.0 kHz).",
          "Dans un système temps-discret standard, ces fréquences supérieures se replient autour de la fréquence de Nyquist et retombent dans le spectre audible sous forme de composantes inharmoniques métalliques qui détruisent la définition des transitoires.",
        ],
        formulaOrTip:
          "f_alias = | k · f_s ± n · f_0 |   où f_s = 48 000 Hz et n représente l'ordre harmonique.",
      },
      {
        heading: "02. Formulation mathématique de l'ADAA (Antiderivative Anti-Aliasing)",
        paragraphs: [
          "Plutôt que d'évaluer ponctuellement la fonction non-linéaire f(x[n]), la méthode ADAA consiste à représenter le signal discret comme une fonction continue linéaire par morceaux entre les échantillons x[n-1] et x[n], puis à intégrer analytiquement la primitive F_1(x) de la non-linéarité.",
          "Cette intégration agit comme un filtre sinc continu implicite avant l'échantillonnage, atténuant drastiquement les harmoniques hautes avant même l'étage de décimation.",
        ],
        formulaOrTip:
          "y[n] = ( F_1(x[n]) - F_1(x[n-1]) ) / ( x[n] - x[n-1] )   avec F_1'(x) = f(x).",
      },
      {
        heading: "03. Architecture Mid/Side Anaglyphe : Rouge Cinéma vs Cyan Pop",
        paragraphs: [
          "Dans ANR-VST-01, le canal Mid ('Rouge Cinéma' #FF1B24) subit une saturation asymétrique qui renforce la fondamentale et l'harmonique 2, tandis que le canal Side ('Cyan Anaglyphe' #00E5FF) traverse un wavefolder symétrique qui ouvre l'image stéréo sans jamais déphaser le sous-grave.",
        ],
      },
    ],
  },
  {
    slug: "figma-ui-kit-clinical-daw-cartoon-bd",
    title:
      "Design System Hybride : Fusionner l'Ergonomie Clinique DAW et l'Esthétique BD Anaglyphe 3D",
    subtitle:
      "Spécifications complètes du Figma UI Kit v1.0 utilisé pour les interfaces de plugins Open Hub et le lecteur persistant.",
    category: "FIGMA_DESIGN_SYSTEM",
    author: "Koma_3D",
    authorRole: "Principal UI/UX & Shader Designer",
    authorBadge: "3D",
    avatarExpression: "spectateur-b",
    publishedAt: "2026-11-12",
    readingTimeMin: 6,
    relatedPluginId: "anr-vst-03",
    summary:
      "Décryptage de la direction artistique d'Open Hub (by Anarchy) : comment concilier la lisibilité chirurgicale des instruments de mesure audio (#FFFFFF / #F5F5F5 / #302E2E) avec l'énergie Pop-Art des avatars BD aux contours d'encre noire.",
    quoteCallout:
      "« Chaque pixel de l'interface doit mériter sa place : la rigueur clinique d'un oscilloscope de laboratoire alliée à l'impact visuel immédiat d'un comic-book en 3D anaglyphe. »",
    codeSnippet: {
      language: "glsl",
      title: "Spectateur3D_AnaglyphShader.frag — Séparation Chromatique Audio-Réactive",
      code: `precision highp float;
uniform sampler2D u_sceneTexture;
uniform float u_rmsPeak; // 0.0 .. 1.0 depuis l'AnalyserNode WebAudio
varying vec2 v_uv;

void main() {
    vec2 offset = vec2(0.003 + u_rmsPeak * 0.012, 0.0);
    float leftRed   = texture2D(u_sceneTexture, v_uv - offset).r;
    vec2 rightCyan  = texture2D(u_sceneTexture, v_uv + offset).gb;
    // Fusion Cinéma Rouge (#FF1B24) & Cyan Anaglyphe (#00E5FF)
    gl_FragColor = vec4(leftRed, rightCyan.x * 0.9, rightCyan.y, 1.0);
}`,
    },
    sections: [
      {
        heading: "01. Hiérarchie Chromatique : Blanc Pur, Gris Perle et Rouge Cinéma",
        paragraphs: [
          "Les sessions de mixage et de sound design durent souvent plusieurs heures. Une interface surchargée fatigue le système visuel. C'est pourquoi Open Hub adopte une base clinique lumineuse : conteneurs Blanc Pur (#FFFFFF), arrière-plans Gris Perle (#F5F5F5) et typographie Anthracite (#222226 / #302E2E).",
          "La couleur d'accentuation Rouge Cinéma (#FF1B24) est réservée exclusivement aux éléments porteurs de signal ou d'action : pas actifs du séquenceur 16-steps, curseurs de potentiomètres, tracé temps-réel de l'oscilloscope et boutons d'action primaires.",
        ],
        formulaOrTip:
          "Contraste WCAG AAA garanti : Noir d'encre #000000 sur Blanc Pur #FFFFFF = ratio 21:1.",
      },
      {
        heading: "02. Les 4 Familles Modulaires du Rack Audio-Réactif",
        paragraphs: [
          "Chaque page de plugin hébergée sur Open Hub expose les 4 modules du Figma UI Kit : (A) l'écran de prévisualisation vidéo 1920x1080 60FPS avec incrustation du spectateur BD, (B) le séquenceur 16 pas et ses déclencheurs Glitch/Strobe/Invert, (C) la matrice de modulation à câbles de Bézier 1.5px, et (D) le sélecteur de préréglages illustrés.",
        ],
      },
    ],
  },
  {
    slug: "architecture-clap-vst3-zero-latency",
    title:
      "Architecture C++20 Lock-Free pour Plugins VST3 & CLAP à Latence Nulle",
    subtitle:
      "Communication inter-threads sans mutex entre le thread temps-réel audio et le rendu graphique 60fps.",
    category: "VST_ARCHITECTURE",
    author: "Dr. RedShift",
    authorRole: "Systems & DSP Architect",
    authorBadge: "MOD",
    avatarExpression: "mod",
    publishedAt: "2026-11-08",
    readingTimeMin: 8,
    relatedPluginId: "anr-vst-02",
    summary:
      "Un guide pratique sur la conception du moteur audio d'Open Hub : files d'attente SPSC (Single-Producer Single-Consumer) sans verrou, alignement cache 64 octets et vectorisation SIMD.",
    quoteCallout:
      "« Dans le callback processBlock() d'un hôte DAW à 48 kHz / 64 échantillons, vous disposez de 1,33 milliseconde. Un seul appel système bloquant ou une allocation mémoire suffit à provoquer un craquement audible. »",
    codeSnippet: {
      language: "cpp",
      title: "LockFreeRingBuffer.hpp — File SPSC Atomique pour Oscilloscope 60FPS",
      code: `template <typename T, size_t Capacity>
class LockFreeAudioRingBuffer {
public:
    bool push(const T& sample) noexcept {
        const size_t w = writeIdx_.load(std::memory_order_relaxed);
        const size_t next = (w + 1) & (Capacity - 1);
        if (next == readIdx_.load(std::memory_order_acquire)) return false;
        buffer_[w] = sample;
        writeIdx_.store(next, std::memory_order_release);
        return true;
    }
private:
    alignas(64) std::atomic<size_t> writeIdx_{0};
    alignas(64) std::atomic<size_t> readIdx_{0};
    std::array<T, Capacity> buffer_{};
};`,
    },
    sections: [
      {
        heading: "01. La règle d'or du thread audio temps-réel",
        paragraphs: [
          "Le thread audio d'un DAW s'exécute avec une priorité d'ordonnancement temps-réel stricte. Toute opération dont la borne supérieure de temps d'exécution n'est pas déterministe (`malloc`, `new`, `std::mutex::lock`, lectures disque) y est formellement proscrite.",
          "Tous les plugins de la suite ANR-VST pré-allouent leurs tampons de lignes à retard et leurs tables de filtres polyphasés lors de l'appel à `prepareToPlay(sampleRate, maxBlockSize)`.",
        ],
      },
      {
        heading: "02. Télémétrie visuelle vers l'oscilloscope à 60 FPS",
        paragraphs: [
          "Pour alimenter l'oscilloscope rouge (#FF1B24) et les vumètres bicolores sans ralentir le traitement DSP, le thread audio pousse les échantillons de crête dans un tampon circulaire atomique (`std::memory_order_release`), lu de manière asynchrone par la boucle `requestAnimationFrame` de l'interface.",
        ],
      },
    ],
  },
  {
    slug: "open-hub-v2-4-release-notes-rgpd-webaudio",
    title:
      "Notes de Version Open Hub v2.4 : Moteur WebAudio Persistant, Conformité CNIL & Sécurité TLS 1.3",
    subtitle:
      "Tout savoir sur le lecteur audio global Jalon 3, le commutateur DSP DRY/WET en direct et la gouvernance Privacy-by-Design.",
    category: "RELEASE_NOTES",
    author: "ZeroLatency Lab",
    authorRole: "Security & Compliance Lead",
    authorBadge: "CORE",
    avatarExpression: "spectateur-a",
    publishedAt: "2026-11-14",
    readingTimeMin: 5,
    relatedPluginId: "anr-vst-04",
    summary:
      "Tour d'horizon de l'infrastructure technique d'Open Hub (by Anarchy) : persistance du contexte WebAudio à travers le routage Next.js App Router, en-têtes HSTS/CSP stricts et contrôle granulaire des données locales.",
    quoteCallout:
      "« L'open-source ne s'arrête pas au code DSP : il exige une transparence totale sur la sécurité du transport HTTPS et le respect inconditionnel de la vie privée des musiciens. »",
    codeSnippet: {
      language: "typescript",
      title: "WebAudioDryWetChain.ts — Routage Dynamique DRY/WET sans Clic",
      code: `// Commutation continue DRY (Bypass) vs WET (Saturateur + Filtre Actif)
export function applyDryWetRouting(
  ctx: AudioContext,
  dryGain: GainNode,
  wetGain: GainNode,
  isWetActive: boolean
): void {
  const now = ctx.currentTime;
  dryGain.gain.setTargetAtTime(isWetActive ? 0.15 : 1.0, now, 0.015);
  wetGain.gain.setTargetAtTime(isWetActive ? 0.95 : 0.0, now, 0.015);
}`,
    },
    sections: [
      {
        heading: "01. Lecteur Audio Persistant & Synthèse Procédurale WebAudio",
        paragraphs: [
          "Grâce au montage du `AudioPlayerProvider` à la racine du layout Next.js, le flux audio et le tracé de l'oscilloscope ne subissent aucune micro-coupure lorsque vous naviguez du catalogue VST vers le Forum ou la documentation technique.",
          "Le commutateur matériel DRY / WET intégré au lecteur permet d'entendre instantanément l'effet du traitement non-linéaire (waveshaper + filtrage résonant) sur n'importe quelle piste de démonstration.",
        ],
      },
      {
        heading: "02. Privacy-by-Design : Zéro Traceur par Défaut",
        paragraphs: [
          "Conformément aux recommandations de la CNIL et aux articles 17 et 20 du RGPD, la sauvegarde locale de vos préférences audio (`openhub_audio_prefs`) est désactivée par défaut tant que vous ne l'avez pas explicitement autorisée.",
        ],
      },
    ],
  },
];

/**
 * 5. HELPER FUNCTIONS & DEFAULT AUDIO PLAYER QUEUE
 */
export function getPluginById(id: string): VstPlugin | undefined {
  const normalized = id.toLowerCase();
  return VST_PLUGINS.find(
    (p) => p.id.toLowerCase() === normalized || p.code.toLowerCase() === normalized
  );
}

export function getSampleById(id: string): SampleTrack | undefined {
  return SAMPLE_TRACKS.find((s) => s.id === id);
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((b) => b.slug === slug);
}

export function pluginToAudioTrack(plugin: VstPlugin): AudioTrackItem {
  return {
    id: plugin.id,
    title: `${plugin.code} // ${plugin.name}`,
    subtitle: `VST_DEMO • ${plugin.category} • ${plugin.metrics.oversampling}`,
    sourceType: "VST_DEMO",
    bpm: plugin.audioProfile.bpm,
    key: plugin.audioProfile.key,
    avatarExpression: plugin.avatarExpression,
    pluginId: plugin.id,
  };
}

export function sampleToAudioTrack(sample: SampleTrack): AudioTrackItem {
  return {
    id: sample.id,
    title: sample.title,
    subtitle: `${sample.packName} • ${sample.genre} • ${sample.sampleRate}`,
    sourceType: "SAMPLE_WAV",
    bpm: sample.bpm,
    key: sample.key,
    avatarExpression: sample.avatarExpression,
  };
}

export const DEFAULT_AUDIO_QUEUE: AudioTrackItem[] = [
  ...VST_PLUGINS.map(pluginToAudioTrack),
  ...SAMPLE_TRACKS.map(sampleToAudioTrack),
];

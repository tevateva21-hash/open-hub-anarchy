/**
 * OPEN HUB // by anarchy — Authoritative Domain Types & Empty Community Stores
 *
 * Aucune donnée fictive pré-remplie :
 * - `VST_PLUGINS` : prêt à recevoir les plugins depuis le dépôt GitHub `VST plugin`
 * - `SAMPLE_TRACKS` : prêt pour les dépôts communautaires
 * - `FORUM_THREADS` : prêt pour les discussions communautaires
 * - `BLOG_POSTS` : prêt pour les articles & docs rédigés par l'équipe
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
  id: string;
  code: string;
  name: string;
  version: string;
  category: VstCategory;
  formats: ("VST3" | "CLAP" | "AU")[];
  os: ("macOS" | "Windows" | "Linux")[];
  author: string;
  authorBadge: string;
  avatarExpression: AvatarExpression;
  repoUrl?: string;
  buildUrl?: string;
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
    cutoff: number;
    resonance: number;
    drive: number;
    mix: number;
    gainDb: number;
  };
  changelog: { version: string; date: string; notes: string[] }[];
}

export interface SampleTrack {
  id: string;
  title: string;
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
  sampleRate: string;
  license: "CC0 1.0" | "CC-BY 4.0";
  fileSizeMb: number;
  author: string;
  avatarExpression: AvatarExpression;
  waveformPeaks: number[];
  synthProfile: {
    baseFreq: number;
    tempoBpm: number;
    pattern: number[];
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

export const ANARCHY_VST_PLUGINS: VstPlugin[] = [
  {
    id: "psylab-eclipse",
    code: "ECLIPSE",
    name: "Eclipse — Psychedelic Sampler",
    version: "v1.0.0",
    category: "SYNTH",
    formats: ["VST3"],
    os: ["Windows", "macOS"],
    author: "tevateva21 / PsyLab",
    authorBadge: "VSTSPLUGIN",
    avatarExpression: "glitch",
    repoUrl: "https://github.com/tevateva21-hash/vstsplugin",
    buildUrl: "https://github.com/tevateva21-hash/vstsplugin/actions/runs/43568347316",
    description:
      "Sampler psychédélique 8 pistes (24 samples synthétisés + LOAD/drag&drop WAV/AIFF/MP3/FLAC/OGG), grille 32 pas, 19 effets par pas, FX Lane 14 effets maître et export MIDI.",
    longDescription:
      "Eclipse Psy Sampler (Eclipse Psy Sampler.vst3) est un sampler 8 pistes issu de la suite PsyLab (JUCE 8 / CMake). Il inclut 24 samples synthétisés intégrés, le chargement de vos propres samples, une grille jusqu'à 32 pas avec swing et outils euclidiens, 19 effets par pas (ratchet, reverse, tape stop, bitcrush, ring mod...), une FX Lane maître de 14 effets et un delay/reverb/phaser psychédélique.",
    metrics: {
      oversampling: "JUCE 8 / 64-BIT",
      latency: "0.0 ms (Live)",
      cpuLoad: "4.2 %",
      license: "Open Source (vstsplugin)",
    },
    sha256: {
      macos: "psylab-macos-latest (Actions #43568347316)",
      windows: "psylab-windows-latest (Actions #43568347316)",
      linux: "CMake Release Build",
    },
    fileSize: "VST3 + Standalone",
    downloadsCount: 0,
    audioProfile: {
      bpm: 136,
      key: "F Minor",
      synthType: "bitcrush",
      baseFreq: 110,
      driveAmount: 0.65,
    },
    defaultKnobs: {
      cutoff: 72,
      resonance: 45,
      drive: 55,
      mix: 100,
      gainDb: 0,
    },
    changelog: [
      {
        version: "v1.0.0",
        date: "2026-11-14",
        notes: [
          "8 pistes, 24 samples synthétisés + LOAD/drag&drop utilisateur",
          "19 effets par pas + FX Lane 14 effets maître + 7 patterns MIDI",
        ],
      },
    ],
  },
  {
    id: "psylab-helios",
    code: "HELIOS",
    name: "Helios — Psychedelic Guitar Synth",
    version: "v1.0.0",
    category: "SYNTH",
    formats: ["VST3"],
    os: ["Windows", "macOS"],
    author: "tevateva21 / PsyLab",
    authorBadge: "VSTSPLUGIN",
    avatarExpression: "synth",
    repoUrl: "https://github.com/tevateva21-hash/vstsplugin",
    buildUrl: "https://github.com/tevateva21-hash/vstsplugin/actions/runs/43568347316",
    description:
      "Synthé guitare MIDI Karplus-Strong 12 voix / Mono Legato inspiré Pink Floyd / Gilmour : pédalier complet (Big Muff, Wah, Ampli 4 bandes, Leslie, Binson Tape Delay, Shimmer Reverb) et 18 presets.",
    longDescription:
      "Helios Guitar (Helios Guitar.vst3) est un instrument MIDI à modélisation physique Karplus-Strong polyphonique 12 voix ou Mono Legato. Il embarque sustain infini, doublage 12 cordes, accords automatiques avec strum réglable, un pédalier complet (Comp, Octaver, Fuzz/Big Muff, Wah, Ampli 1x12/2x12/4x12, Tremolo, Phaser, Leslie, Tape Delay, Shimmer Reverb) et 18 presets d'usine.",
    metrics: {
      oversampling: "JUCE 8 / 64-BIT",
      latency: "0.0 ms (MIDI)",
      cpuLoad: "5.1 %",
      license: "Open Source (vstsplugin)",
    },
    sha256: {
      macos: "psylab-macos-latest (Actions #43568347316)",
      windows: "psylab-windows-latest (Actions #43568347316)",
      linux: "CMake Release Build",
    },
    fileSize: "VST3 + Standalone",
    downloadsCount: 0,
    audioProfile: {
      bpm: 120,
      key: "D Minor",
      synthType: "reverb",
      baseFreq: 146.83,
      driveAmount: 0.45,
    },
    defaultKnobs: {
      cutoff: 68,
      resonance: 35,
      drive: 48,
      mix: 85,
      gainDb: 0,
    },
    changelog: [
      {
        version: "v1.0.0",
        date: "2026-11-14",
        notes: [
          "Moteur Karplus-Strong 12 voix + Mono Legato + 12 cordes",
          "Pédalier complet + 18 presets d'usine + bouton DICE",
        ],
      },
    ],
  },
  {
    id: "psylab-prism",
    code: "PRISM",
    name: "Prism — Psychedelic Filter Sampler",
    version: "v1.0.0",
    category: "SATURATION",
    formats: ["VST3"],
    os: ["Windows", "macOS"],
    author: "tevateva21 / PsyLab",
    authorBadge: "VSTSPLUGIN",
    avatarExpression: "dsp",
    repoUrl: "https://github.com/tevateva21-hash/vstsplugin",
    buildUrl: "https://github.com/tevateva21-hash/vstsplugin/actions/runs/43568347316",
    description:
      "Sampler filtrant monophonique avec moteur granulaire, 2 filtres multi-modes (Ladder 24 dB acide, Comb, Formant voyelles), 2 LFO, séquenceur de filtre 32 pas et 16 presets d'usine.",
    longDescription:
      "Prism Filter (Prism Filter.vst3) sculpte n'importe quel sample (drag&drop ou 12 textures intégrées) via un moteur granulaire, 2 filtres multi-modes en série ou parallèle avec courbe de réponse temps réel (LP/HP/BP/Notch, Ladder 24 dB acide, Comb +/-, Formant A-E-I-O-U), 2 LFO synchronisables, séquenceur de filtre 32 pas et effets de fin de chaîne.",
    metrics: {
      oversampling: "JUCE 8 / 64-BIT",
      latency: "0.0 ms (Live)",
      cpuLoad: "3.8 %",
      license: "Open Source (vstsplugin)",
    },
    sha256: {
      macos: "psylab-macos-latest (Actions #43568347316)",
      windows: "psylab-windows-latest (Actions #43568347316)",
      linux: "CMake Release Build",
    },
    fileSize: "VST3 + Standalone",
    downloadsCount: 0,
    audioProfile: {
      bpm: 134,
      key: "A Minor",
      synthType: "saturator",
      baseFreq: 110,
      driveAmount: 0.72,
    },
    defaultKnobs: {
      cutoff: 60,
      resonance: 78,
      drive: 64,
      mix: 100,
      gainDb: 0,
    },
    changelog: [
      {
        version: "v1.0.0",
        date: "2026-11-14",
        notes: [
          "Moteur granulaire + 2 filtres multi-modes (Ladder, Comb, Formant)",
          "Séquenceur de filtre 32 pas dessinable + 16 presets d'usine",
        ],
      },
    ],
  },
];

export const VST_PLUGINS: VstPlugin[] = [];

export const SAMPLE_TRACKS: SampleTrack[] = [];

export const FORUM_THREADS: ForumThread[] = [];

export const BLOG_POSTS: BlogPost[] = [];

export function getPluginById(id: string): VstPlugin | undefined {
  const normalized = id.toLowerCase();
  return [...ANARCHY_VST_PLUGINS, ...VST_PLUGINS].find(
    (p) =>
      p.id.toLowerCase() === normalized || p.code.toLowerCase() === normalized
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

export const DEFAULT_AUDIO_QUEUE: AudioTrackItem[] = [];

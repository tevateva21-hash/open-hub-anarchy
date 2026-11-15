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

export const VST_PLUGINS: VstPlugin[] = [];

export const SAMPLE_TRACKS: SampleTrack[] = [];

export const FORUM_THREADS: ForumThread[] = [];

export const BLOG_POSTS: BlogPost[] = [];

export function getPluginById(id: string): VstPlugin | undefined {
  const normalized = id.toLowerCase();
  return VST_PLUGINS.find(
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

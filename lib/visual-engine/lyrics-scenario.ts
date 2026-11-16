import type { TimedLyricWord, VideoAspectRatio } from "./contracts";

export interface AspectFormatSpec {
  id: VideoAspectRatio;
  label: string;
  shortLabel: string;
  platforms: string;
  width: number;
  height: number;
  exportWidth: number;
  exportHeight: number;
}

export const VIDEO_ASPECT_FORMATS: Record<VideoAspectRatio, AspectFormatSpec> = {
  "16:9": {
    id: "16:9",
    label: "16:9 Paysage (YouTube / Twitch)",
    shortLabel: "16:9 YT",
    platforms: "YouTube · Twitch · Desktop",
    width: 320,
    height: 180,
    exportWidth: 1280,
    exportHeight: 720,
  },
  "9:16": {
    id: "9:16",
    label: "9:16 Vertical (TikTok / Reels / Shorts)",
    shortLabel: "9:16 TIKTOK",
    platforms: "TikTok · Reels · Shorts",
    width: 180,
    height: 320,
    exportWidth: 1080,
    exportHeight: 1920,
  },
  "4:5": {
    id: "4:5",
    label: "4:5 Portrait (Feed Insta / FB)",
    shortLabel: "4:5 INSTA",
    platforms: "Feed Instagram · Facebook",
    width: 240,
    height: 300,
    exportWidth: 1080,
    exportHeight: 1350,
  },
  "1:1": {
    id: "1:1",
    label: "1:1 Carré (Post Insta / Pochette)",
    shortLabel: "1:1 CARRÉ",
    platforms: "Post Instagram · Carrousel",
    width: 240,
    height: 240,
    exportWidth: 1080,
    exportHeight: 1080,
  },
};

export interface ParsedScenarioCue {
  timeSeconds: number | null;
  section: string;
  text: string;
}

export interface EvaluatedLyricState {
  line: string;
  words: string[];
  activeWordIndex: number;
  activeWord: string;
  progress: number;
  section: string;
  lineIndex: number;
}

const LRC_LINE_RE = /^\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]\s*(.*)$/;
const SECTION_TAG_RE = /^#([A-Z0-9_-]+)\s*(.*)$/i;

export function parseScenarioCues(rawText: string): ParsedScenarioCue[] {
  const normalized = rawText
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  if (!normalized) return [];

  const lines = normalized
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let currentSection = "MAIN";
  const cues: ParsedScenarioCue[] = [];

  for (const line of lines) {
    let timeSeconds: number | null = null;
    let body = line;

    const lrcMatch = line.match(LRC_LINE_RE);
    if (lrcMatch) {
      const mins = Number(lrcMatch[1]) || 0;
      const secs = Number(lrcMatch[2]) || 0;
      const fracRaw = lrcMatch[3] ?? "0";
      const frac = Number(fracRaw) / Math.pow(10, fracRaw.length);
      timeSeconds = mins * 60 + secs + frac;
      body = (lrcMatch[4] ?? "").trim();
    }

    const secMatch = body.match(SECTION_TAG_RE);
    if (secMatch) {
      currentSection = secMatch[1].toUpperCase();
      body = (secMatch[2] ?? "").trim();
    }

    if (body.length > 0 || timeSeconds !== null) {
      cues.push({
        timeSeconds,
        section: currentSection,
        text: (body || currentSection).toUpperCase(),
      });
    }
  }

  return cues;
}

export function evaluateLyricsAt(
  rawText: string,
  timeSeconds: number,
  timedWords?: readonly TimedLyricWord[]
): EvaluatedLyricState {
  // 1. Si des mots Whisper horodatés sont fournis et couvrent l'instant courant
  if (timedWords && timedWords.length > 0) {
    const windowSize = 5;
    let activeGlobalIdx = timedWords.findIndex(
      (w) => timeSeconds >= w.start && timeSeconds <= w.end
    );
    if (activeGlobalIdx === -1) {
      // Chercher le dernier mot déjà commencé
      for (let i = timedWords.length - 1; i >= 0; i--) {
        if (timeSeconds >= timedWords[i].start) {
          activeGlobalIdx = i;
          break;
        }
      }
    }

    if (activeGlobalIdx >= 0) {
      const chunkStart = Math.floor(activeGlobalIdx / windowSize) * windowSize;
      const chunk = timedWords.slice(chunkStart, chunkStart + windowSize);
      const words = chunk.map((w) =>
        w.word
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toUpperCase()
          .trim()
      );
      const activeWordIndex = activeGlobalIdx - chunkStart;
      const wStart = chunk[0]?.start ?? timeSeconds;
      const wEnd = chunk[chunk.length - 1]?.end ?? wStart + 1;
      const progress = Math.max(
        0,
        Math.min(1, (timeSeconds - wStart) / Math.max(0.15, wEnd - wStart))
      );
      const cues = parseScenarioCues(rawText);
      let section = "WHISPER";
      for (const c of cues) {
        if (c.timeSeconds !== null && timeSeconds >= c.timeSeconds) {
          section = c.section;
        }
      }
      return {
        line: words.join(" "),
        words,
        activeWordIndex,
        activeWord: words[activeWordIndex] ?? "",
        progress,
        section,
        lineIndex: Math.floor(activeGlobalIdx / windowSize),
      };
    }
  }

  // 2. Sinon, lecture LRC horodatée ou cadence auto 2.5s/ligne
  const cues = parseScenarioCues(rawText);
  if (cues.length === 0) {
    return {
      line: "",
      words: [],
      activeWordIndex: 0,
      activeWord: "",
      progress: 0,
      section: "MAIN",
      lineIndex: 0,
    };
  }

  const hasTimestamps = cues.some((c) => c.timeSeconds !== null);
  let activeIdx = 0;
  let lineProgress = 0;

  if (hasTimestamps) {
    const timedCues = cues.map((c, idx) => ({
      ...c,
      t: c.timeSeconds ?? idx * 2.5,
    }));
    for (let i = timedCues.length - 1; i >= 0; i--) {
      if (timeSeconds >= timedCues[i].t) {
        activeIdx = i;
        break;
      }
    }
    const startT = timedCues[activeIdx].t;
    const nextT = timedCues[activeIdx + 1]?.t ?? startT + 2.5;
    lineProgress = Math.max(
      0,
      Math.min(1, (timeSeconds - startT) / Math.max(0.25, nextT - startT))
    );
  } else {
    activeIdx = Math.floor(timeSeconds / 2.5) % cues.length;
    lineProgress = (timeSeconds % 2.5) / 2.5;
  }

  const activeCue = cues[activeIdx];
  const words = activeCue.text.split(/\s+/).filter(Boolean);
  const activeWordIndex =
    words.length > 0
      ? Math.min(words.length - 1, Math.floor(lineProgress * words.length))
      : 0;

  return {
    line: activeCue.text,
    words,
    activeWordIndex,
    activeWord: words[activeWordIndex] ?? "",
    progress: lineProgress,
    section: activeCue.section,
    lineIndex: activeIdx,
  };
}

export function formatLrcTimestamp(seconds: number): string {
  const safe = Math.max(0, seconds);
  const mins = Math.floor(safe / 60);
  const secs = Math.floor(safe % 60);
  const cs = Math.floor((safe - Math.floor(safe)) * 100);
  return `[${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(cs).padStart(2, "0")}]`;
}

export interface WhisperSegmentInput {
  start: number;
  end: number;
  text: string;
}

export function formatWhisperToLrc(
  segments: readonly WhisperSegmentInput[],
  offsetSeconds = 0
): string {
  return segments
    .map((seg) => {
      const txt = seg.text.trim();
      if (!txt) return "";
      return `${formatLrcTimestamp(seg.start + offsetSeconds)} ${txt.toUpperCase()}`;
    })
    .filter(Boolean)
    .join("\n");
}

function encodeMonoWav16k(samples: Float32Array, sampleRate: number): Blob {
  const numSamples = samples.length;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) {
      view.setUint8(offset + i, s.charCodeAt(i));
    }
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, numSamples * 2, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(
      offset,
      clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff,
      true
    );
    offset += 2;
  }
  return new Blob([buffer], { type: "audio/wav" });
}

/**
 * Découpe la zone prévisualisée [startSec, startSec + durationSec] en WAV 16 kHz mono
 * léger (~960 Ko pour 30s) pour l'envoi rapide vers /api/whisper.
 */
export async function extractAudioClipWav(
  audioUrl: string,
  startSec: number,
  durationSec: number
): Promise<File> {
  const res = await fetch(audioUrl);
  const arrayBuf = await res.arrayBuffer();
  const AudioCtxCtor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  const decodeCtx = new AudioCtxCtor();
  try {
    const decoded = await decodeCtx.decodeAudioData(arrayBuf.slice(0));
    const safeStart = Math.max(0, Math.min(decoded.duration - 0.5, startSec));
    const safeDur = Math.max(
      1,
      Math.min(decoded.duration - safeStart, durationSec)
    );
    const targetRate = 16000;
    const frameCount = Math.floor(safeDur * targetRate);
    const offline = new OfflineAudioContext(1, frameCount, targetRate);
    const src = offline.createBufferSource();
    src.buffer = decoded;
    src.connect(offline.destination);
    src.start(0, safeStart, safeDur);
    const rendered = await offline.startRendering();
    const wavBlob = encodeMonoWav16k(rendered.getChannelData(0), targetRate);
    return new File([wavBlob], "extract-16k.wav", { type: "audio/wav" });
  } finally {
    await decodeCtx.close().catch(() => {});
  }
}

import type {
  AnalysisRequest,
  AudioAnalysis,
  AudioFeatures,
} from "./contracts";

export const ANALYZER_VERSION = "1.0.0";
export const SAMPLE_RATE = 24000;
export const WINDOW = 2048;
export const HOP = 512;
export const LIMITS = {
  bytes: 70 * 1024 * 1024,
  seconds: 480,
  pcmBytes: 96 * 1024 * 1024,
} as const;
export const FEATURE_KEYS = [
  "rms",
  "bass",
  "mid",
  "treble",
  "spectralFlux",
] as const;

export function validateFileSize(bytes: number): void {
  if (!Number.isSafeInteger(bytes) || bytes <= 0) {
    throw new Error("Le fichier est vide.");
  }
  if (bytes > LIMITS.bytes) {
    throw new Error("Fichier trop volumineux : maximum 70 Mio.");
  }
}

export function validateDuration(seconds: number): void {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    throw new Error("Durée audio invalide.");
  }
  if (seconds > LIMITS.seconds) {
    throw new Error("Morceau trop long : maximum 8 minutes.");
  }
}

/** FFT radix-2 en place, déterministe et sans horloge externe. */
function fft(real: Float64Array, imag: Float64Array): void {
  const n = real.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [real[i], real[j]] = [real[j], real[i]];
    }
  }
  for (let size = 2; size <= n; size *= 2) {
    const angle = (-2 * Math.PI) / size;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    for (let start = 0; start < n; start += size) {
      let wr = 1;
      let wi = 0;
      for (let j = 0; j < size / 2; j++) {
        const a = start + j;
        const b = a + size / 2;
        const tr = wr * real[b] - wi * imag[b];
        const ti = wr * imag[b] + wi * real[b];
        real[b] = real[a] - tr;
        imag[b] = imag[a] - ti;
        real[a] += tr;
        imag[a] += ti;
        const next = wr * c - wi * s;
        wi = wr * s + wi * c;
        wr = next;
      }
    }
  }
}

export function analyzePCM(
  request: AnalysisRequest,
  progress?: (fraction: number) => void
): AudioAnalysis {
  const { channels, sampleRateHz, assetSha256 } = request;
  if (sampleRateHz !== SAMPLE_RATE) {
    throw new Error("Le PCM doit être décodé à 24 kHz.");
  }
  const length = channels[0]?.length ?? 0;
  if (
    channels.length < 1 ||
    channels.length > 2 ||
    channels.some((c) => c.length !== length)
  ) {
    throw new Error("Audio mono ou stéréo requis, canaux de même longueur.");
  }
  validateDuration(length / sampleRateHz);
  if (length * channels.length * 4 > LIMITS.pcmBytes) {
    throw new Error("PCM trop volumineux.");
  }
  for (const channel of channels) {
    for (let i = 0; i < channel.length; i++) {
      if (!Number.isFinite(channel[i])) {
        throw new Error("Le PCM contient une valeur non finie.");
      }
    }
  }

  const count = Math.ceil(length / HOP);
  const result: AudioAnalysis = {
    schemaVersion: 1,
    analyzerVersion: ANALYZER_VERSION,
    assetSha256,
    sampleRateHz,
    sampleCount: length,
    channelCount: channels.length,
    durationSeconds: length / sampleRateHz,
    windowSamples: WINDOW,
    hopSamples: HOP,
    channelAggregation: "mean-power",
    bandEdgesHz: [20, 250, 2000, 12000],
    timestamps: new Float64Array(count),
    rms: new Float32Array(count),
    bass: new Float32Array(count),
    mid: new Float32Array(count),
    treble: new Float32Array(count),
    spectralFlux: new Float32Array(count),
    waveformMin: new Float32Array(count),
    waveformMax: new Float32Array(count),
  };

  const hannWindow = Float64Array.from(
    { length: WINDOW },
    (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (WINDOW - 1))
  );
  const windowPower = hannWindow.reduce((sum, x) => sum + x * x, 0);
  const real = new Float64Array(WINDOW);
  const imag = new Float64Array(WINDOW);
  const previous = new Float64Array(WINDOW / 2 + 1);
  const power = new Float64Array(previous.length);

  for (let frame = 0; frame < count; frame++) {
    const center = frame * HOP;
    const start = center - WINDOW / 2;
    let sumSquares = 0;
    let samples = 0;
    let min = Infinity;
    let max = -Infinity;
    power.fill(0);

    for (const channel of channels) {
      imag.fill(0);
      for (let i = 0; i < WINDOW; i++) {
        const index = start + i;
        const sample = index >= 0 && index < length ? channel[index] : 0;
        real[i] = sample * hannWindow[i];
        if (index >= 0 && index < length) {
          sumSquares += sample * sample;
          samples++;
          if (sample < min) min = sample;
          if (sample > max) max = sample;
        }
      }
      fft(real, imag);
      for (let bin = 0; bin < power.length; bin++) {
        const factor = bin === 0 || bin === WINDOW / 2 ? 1 : 2;
        power[bin] +=
          (factor * (real[bin] ** 2 + imag[bin] ** 2)) /
          (WINDOW * windowPower * channels.length);
      }
    }

    let bass = 0;
    let mid = 0;
    let treble = 0;
    let flux = 0;
    for (let bin = 0; bin < power.length; bin++) {
      const hz = (bin * sampleRateHz) / WINDOW;
      if (hz >= 20 && hz < 250) bass += power[bin];
      else if (hz >= 250 && hz < 2000) mid += power[bin];
      else if (hz >= 2000 && hz <= 12000) treble += power[bin];
      if (frame > 0) flux += Math.max(0, power[bin] - previous[bin]);
    }

    previous.set(power);
    result.timestamps[frame] = center / sampleRateHz;
    result.rms[frame] = samples > 0 ? Math.sqrt(sumSquares / samples) : 0;
    result.bass[frame] = bass;
    result.mid[frame] = mid;
    result.treble[frame] = treble;
    result.spectralFlux[frame] = flux;
    result.waveformMin[frame] = Number.isFinite(min) ? min : 0;
    result.waveformMax[frame] = Number.isFinite(max) ? max : 0;
    if (frame % 64 === 0) progress?.(frame / count);
  }

  progress?.(1);
  return result;
}

export function getAudioFeaturesAt(
  analysis: AudioAnalysis,
  timeSeconds: number
): AudioFeatures {
  if (!Number.isFinite(timeSeconds)) throw new Error("Temps non fini.");
  const n = analysis.timestamps.length;
  if (!n) throw new Error("Analyse vide.");

  let low = 0;
  let high = n - 1;
  const t = Math.max(
    analysis.timestamps[0],
    Math.min(timeSeconds, analysis.timestamps[high])
  );
  while (low + 1 < high) {
    const mid = (low + high) >> 1;
    if (analysis.timestamps[mid] <= t) low = mid;
    else high = mid;
  }
  const span = analysis.timestamps[high] - analysis.timestamps[low];
  const ratio = span === 0 ? 0 : (t - analysis.timestamps[low]) / span;

  return {
    rms: analysis.rms[low] * (1 - ratio) + analysis.rms[high] * ratio,
    bass: analysis.bass[low] * (1 - ratio) + analysis.bass[high] * ratio,
    mid: analysis.mid[low] * (1 - ratio) + analysis.mid[high] * ratio,
    treble: analysis.treble[low] * (1 - ratio) + analysis.treble[high] * ratio,
    spectralFlux:
      analysis.spectralFlux[low] * (1 - ratio) +
      analysis.spectralFlux[high] * ratio,
  };
}

export function createAudioFeatureAccessor(analysis: AudioAnalysis) {
  return {
    getAudioFeaturesAt: (timeSeconds: number) =>
      getAudioFeaturesAt(analysis, timeSeconds),
  };
}

export function isAudioAnalysis(
  value: unknown,
  hash: string
): value is AudioAnalysis {
  if (!value || typeof value !== "object") return false;
  const a = value as AudioAnalysis;
  if (
    a.schemaVersion !== 1 ||
    a.analyzerVersion !== ANALYZER_VERSION ||
    a.assetSha256 !== hash ||
    a.sampleRateHz !== SAMPLE_RATE ||
    !Number.isSafeInteger(a.sampleCount) ||
    a.sampleCount <= 0 ||
    a.sampleCount > SAMPLE_RATE * LIMITS.seconds ||
    a.durationSeconds !== a.sampleCount / SAMPLE_RATE ||
    ![1, 2].includes(a.channelCount) ||
    a.windowSamples !== WINDOW ||
    a.hopSamples !== HOP ||
    a.channelAggregation !== "mean-power" ||
    JSON.stringify(a.bandEdgesHz) !== "[20,250,2000,12000]"
  ) {
    return false;
  }
  const count = Math.ceil(a.sampleCount / HOP);
  if (
    !(a.timestamps instanceof Float64Array) ||
    a.timestamps.length !== count ||
    a.timestamps.some((t, i) => t !== (i * HOP) / SAMPLE_RATE)
  ) {
    return false;
  }
  for (const key of [...FEATURE_KEYS, "waveformMin", "waveformMax"] as const) {
    if (
      !(a[key] instanceof Float32Array) ||
      a[key].length !== count ||
      a[key].some(
        (v) =>
          !Number.isFinite(v) ||
          (FEATURE_KEYS.includes(key as (typeof FEATURE_KEYS)[number]) && v < 0)
      )
    ) {
      return false;
    }
  }
  return true;
}

export interface TempoEstimate {
  bpm: number;
  confidence: number;
  beatOffsetSeconds: number;
}

/**
 * Estimateur déterministe de BPM & phase rythmique (80–180 BPM) sur AudioAnalysis figé.
 */
export function estimateTempoBpm(analysis: AudioAnalysis): TempoEstimate {
  const n = analysis.timestamps.length;
  const dt = analysis.hopSamples / analysis.sampleRateHz;
  if (n < 32 || !Number.isFinite(dt) || dt <= 0) {
    return { bpm: 128, confidence: 0, beatOffsetSeconds: 0 };
  }

  const onset = new Float64Array(n);
  let maxOnset = 0;
  for (let i = 1; i < n; i++) {
    const bassDiff = Math.max(0, analysis.bass[i] - analysis.bass[i - 1]);
    const val =
      Math.sqrt(bassDiff) * 2.2 +
      Math.sqrt(Math.max(0, analysis.spectralFlux[i]));
    onset[i] = val;
    if (val > maxOnset) maxOnset = val;
  }
  if (maxOnset <= 1e-6) {
    return { bpm: 128, confidence: 0, beatOffsetSeconds: 0 };
  }
  for (let i = 0; i < n; i++) onset[i] /= maxOnset;

  let bestBpm = 128;
  let bestScore = -1;
  let secondScore = 0;

  for (let bpm = 80; bpm <= 180; bpm += 1) {
    const periodFrames = 60 / bpm / dt;
    let sum = 0;
    let count = 0;
    for (let mult = 1; mult <= 3; mult++) {
      const lag = Math.round(periodFrames * mult);
      if (lag >= n) break;
      const weight = mult === 1 ? 1 : mult === 2 ? 0.55 : 0.3;
      for (let i = 0; i + lag < n; i++) {
        sum += onset[i] * onset[i + lag] * weight;
        count += weight;
      }
    }
    const prior = 1 + 0.12 * Math.exp(-Math.pow((bpm - 130) / 32, 2));
    const score = count > 0 ? (sum / count) * prior : 0;
    if (score > bestScore) {
      secondScore = bestScore > 0 ? bestScore : score * 0.7;
      bestScore = score;
      bestBpm = bpm;
    } else if (score > secondScore) {
      secondScore = score;
    }
  }

  const periodSeconds = 60 / bestBpm;
  const periodFrames = Math.max(2, Math.round(periodSeconds / dt));
  let bestPhaseFrame = 0;
  let bestPhaseEnergy = -1;
  for (let phase = 0; phase < periodFrames; phase++) {
    let energy = 0;
    for (let f = phase; f < n; f += periodFrames) {
      energy += onset[f] + (f + 1 < n ? onset[f + 1] * 0.5 : 0);
    }
    if (energy > bestPhaseEnergy) {
      bestPhaseEnergy = energy;
      bestPhaseFrame = phase;
    }
  }

  const confidence =
    bestScore > 0
      ? Math.max(
          0,
          Math.min(
            1,
            ((bestScore - secondScore * 0.85) / (bestScore + 1e-6)) * 2.5
          )
        )
      : 0;
  return {
    bpm: bestBpm,
    confidence: Math.round(confidence * 100) / 100,
    beatOffsetSeconds: Math.round(bestPhaseFrame * dt * 1000) / 1000,
  };
}

/**
 * Pont temps-réel entre `AudioPlayerContext` (AnalyserNode 256) et les caractéristiques du moteur.
 */
export function extractLiveFeaturesFromBuffers(
  timeDomain: Uint8Array,
  freqData: Uint8Array,
  prevFreq: Uint8Array
): AudioFeatures {
  let sumSq = 0;
  for (let i = 0; i < timeDomain.length; i++) {
    const centered = (timeDomain[i] - 128) / 128;
    sumSq += centered * centered;
  }
  const rms = timeDomain.length > 0 ? Math.sqrt(sumSq / timeDomain.length) : 0;

  let bassSum = 0;
  let midSum = 0;
  let trebleSum = 0;
  let flux = 0;

  const n = freqData.length;
  for (let i = 0; i < n; i++) {
    const norm = freqData[i] / 255;
    const prevNorm = (prevFreq[i] ?? 0) / 255;
    const p = norm * norm;
    if (i <= 5) bassSum += p;
    else if (i <= 34) midSum += p;
    else trebleSum += p;
    flux += Math.max(0, norm - prevNorm);
    prevFreq[i] = freqData[i];
  }

  return {
    rms: Math.min(1, rms * 1.6),
    bass: Math.min(1, bassSum / 3.5),
    mid: Math.min(1, midSum / 14),
    treble: Math.min(1, trebleSum / 36),
    spectralFlux: Math.min(1, flux / 18),
  };
}

/**
 * Générateur de piste démo industrielle synthétique (WAV PCM 24 kHz 4s à 120 BPM)
 * issu d'`anarchy-visual-engine` V2 pour tester immédiatement sans upload externe.
 */
export function createSyntheticDemoWavFile(): File {
  const sampleRate = SAMPLE_RATE;
  const seconds = 4.0;
  const samples = Math.floor(sampleRate * seconds);
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);
  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples * 2, true);
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
  view.setUint32(40, samples * 2, true);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const beatEnv = Math.exp(-((t % 0.5) * 9));
    const bass =
      0.58 * Math.sin(2 * Math.PI * (82 - 36 * (1 - beatEnv)) * t) * (0.35 + 0.65 * beatEnv);
    const mid =
      0.26 * Math.sin(2 * Math.PI * (t > 2.0 ? 520 : 640) * t) * (t % 1.0 < 0.7 ? 1 : 0.2);
    const treble =
      0.16 * Math.sin(2 * Math.PI * 4200 * t) * beatEnv;
    const sample = Math.max(-1, Math.min(1, bass + mid + treble));
    view.setInt16(44 + i * 2, Math.round(sample * 32767), true);
  }
  return new File([buffer], "anarchy-demo-synth.wav", { type: "audio/wav" });
}

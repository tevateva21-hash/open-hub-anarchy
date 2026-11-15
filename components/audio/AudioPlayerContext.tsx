"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AudioTrackItem,
  AvatarExpression,
  DEFAULT_AUDIO_QUEUE,
  getPluginById,
  getSampleById,
} from "@/lib/openhub-data";
import { ConsentPreferences, getStoredConsent } from "@/lib/consent";

export type { AudioTrackItem, AvatarExpression };

export interface ExternalAudioStatus {
  title: string;
  isPlaying: boolean;
  pause: () => void;
}

export interface AudioPlayerContextValue {
  currentTrack: AudioTrackItem | null;
  queue: AudioTrackItem[];
  isPlaying: boolean;
  externalAudio: ExternalAudioStatus | null;
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
  getCaptureAudioStream: () => MediaStream | null;
}

const AUDIO_PREFS_STORAGE_KEY = "openhub_audio_prefs";

interface StoredAudioPrefs {
  volume?: number;
  isMuted?: boolean;
  wetDryMix?: boolean;
  oscilloscopeMode?: "WAVE" | "FFT" | "ANAGLYPH";
}

/**
 * Construit une courbe de saturation harmonique non-linéaire (tanh + Chebyshev asymétrique)
 * pour le WaveShaperNode WebAudio afin que le mode WET produise une vraie coloration DSP.
 */
function createSaturationCurve(driveAmount: number): Float32Array {
  const samples = 4096;
  const curve = new Float32Array(samples);
  const k = Math.max(1.5, (driveAmount / 100) * 14);
  const norm = Math.tanh(k);
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    // Combinaison triode asymétrique (Mid/Rouge) + harmonique 3 (Side/Cyan)
    const saturated = Math.tanh(k * x) / norm;
    const chebyshev3 = 4 * x * x * x - 3 * x;
    curve[i] = Math.max(-0.98, Math.min(0.98, 0.82 * saturated + 0.18 * chebyshev3));
  }
  return curve;
}

function getTrackDurationSec(track: AudioTrackItem | null): number {
  if (!track) return 134;
  if (track.sourceType === "SAMPLE_WAV") {
    const smp = getSampleById(track.id);
    if (smp) return smp.durationSec;
  }
  return 134; // 02:14 par défaut pour les démonstrations DSP
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [queue] = useState<AudioTrackItem[]>(DEFAULT_AUDIO_QUEUE);
  const [currentTrack, setCurrentTrack] = useState<AudioTrackItem | null>(
    DEFAULT_AUDIO_QUEUE[0] ?? null
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [externalAudio, setExternalAudio] =
    useState<ExternalAudioStatus | null>(null);

  useEffect(() => {
    const handlePlay = (ev: Event) => {
      const target = ev.target;
      if (target instanceof HTMLAudioElement) {
        const rawTitle =
          target.getAttribute("data-track-title") ||
          target.title ||
          target
            .closest("[data-track-title]")
            ?.getAttribute("data-track-title") ||
          "Audio en cours";
        setExternalAudio({
          title: rawTitle,
          isPlaying: true,
          pause: () => target.pause(),
        });
      }
    };
    const handleStop = (ev: Event) => {
      const target = ev.target;
      if (target instanceof HTMLAudioElement) {
        setExternalAudio((prev) => (prev ? null : prev));
      }
    };
    document.addEventListener("play", handlePlay, true);
    document.addEventListener("pause", handleStop, true);
    document.addEventListener("ended", handleStop, true);
    return () => {
      document.removeEventListener("play", handlePlay, true);
      document.removeEventListener("pause", handleStop, true);
      document.removeEventListener("ended", handleStop, true);
    };
  }, []);
  const [wetDryMix, setWetDryMix] = useState<boolean>(true);
  const [volume, setVolumeState] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(() =>
    getTrackDurationSec(DEFAULT_AUDIO_QUEUE[0] ?? null)
  );
  const [oscilloscopeMode, setOscilloscopeModeState] = useState<
    "WAVE" | "FFT" | "ANAGLYPH"
  >("WAVE");
  const [peakLevels, setPeakLevels] = useState<{ left: number; right: number }>({
    left: 6,
    right: 6,
  });

  // Références Web Audio API persistantes entre toutes les routes App Router
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const dryBusGainRef = useRef<GainNode | null>(null);
  const wetBusGainRef = useRef<GainNode | null>(null);
  const wetFilterRef = useRef<BiquadFilterNode | null>(null);
  const waveShaperRef = useRef<WaveShaperNode | null>(null);
  const streamDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  // État interne temps-réel pour le séquenceur procédural et le fallback oscilloscope
  const isPlayingRef = useRef<boolean>(false);
  const wetDryRef = useRef<boolean>(true);
  const volumeRef = useRef<number>(0.8);
  const isMutedRef = useRef<boolean>(false);
  const currentTrackRef = useRef<AudioTrackItem | null>(
    DEFAULT_AUDIO_QUEUE[0] ?? null
  );
  const stepIndexRef = useRef<number>(0);
  const synthPhaseRef = useRef<number>(0);
  const glitchUntilRef = useRef<number>(0);

  isPlayingRef.current = isPlaying;
  wetDryRef.current = wetDryMix;
  volumeRef.current = volume;
  isMutedRef.current = isMuted;
  currentTrackRef.current = currentTrack;

  // 1. Chargement initial des préférences audio SI le consentement RGPD l'autorise
  useEffect(() => {
    const consent = getStoredConsent();
    if (consent?.audioPreferences && typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(AUDIO_PREFS_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as StoredAudioPrefs;
          if (typeof parsed.volume === "number") {
            setVolumeState(Math.max(0, Math.min(1, parsed.volume)));
          }
          if (typeof parsed.isMuted === "boolean") {
            setIsMuted(parsed.isMuted);
          }
          if (typeof parsed.wetDryMix === "boolean") {
            setWetDryMix(parsed.wetDryMix);
          }
          if (
            parsed.oscilloscopeMode === "WAVE" ||
            parsed.oscilloscopeMode === "FFT" ||
            parsed.oscilloscopeMode === "ANAGLYPH"
          ) {
            setOscilloscopeModeState(parsed.oscilloscopeMode);
          }
        }
      } catch {
        // Ignore malformed localStorage
      }
    }

    const handleConsentUpdate = (event: Event) => {
      const custom = event as CustomEvent<ConsentPreferences | null>;
      const detail = custom.detail;
      if (!detail || !detail.audioPreferences) {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(AUDIO_PREFS_STORAGE_KEY);
        }
      } else if (detail.audioPreferences && typeof window !== "undefined") {
        const payload: StoredAudioPrefs = {
          volume: volumeRef.current,
          isMuted: isMutedRef.current,
          wetDryMix: wetDryRef.current,
          oscilloscopeMode,
        };
        window.localStorage.setItem(
          AUDIO_PREFS_STORAGE_KEY,
          JSON.stringify(payload)
        );
      }
    };

    window.addEventListener("openhub:consent-updated", handleConsentUpdate);
    return () => {
      window.removeEventListener(
        "openhub:consent-updated",
        handleConsentUpdate
      );
    };
  }, [oscilloscopeMode]);

  // 2. Persistance automatique dans `openhub_audio_prefs` uniquement sous consentement
  useEffect(() => {
    if (typeof window === "undefined") return;
    const consent = getStoredConsent();
    if (consent?.audioPreferences) {
      const payload: StoredAudioPrefs = {
        volume,
        isMuted,
        wetDryMix,
        oscilloscopeMode,
      };
      try {
        window.localStorage.setItem(
          AUDIO_PREFS_STORAGE_KEY,
          JSON.stringify(payload)
        );
      } catch {
        // Ignore quota errors
      }
    }
  }, [volume, isMuted, wetDryMix, oscilloscopeMode]);

  // 3. Initialisation paresseuse du graphe Web Audio API sur geste utilisateur
  const ensureAudioGraph = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current) {
      const AudioCtxConstructor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtxConstructor) return null;

      try {
        const ctx = new AudioCtxConstructor();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.82;

        const masterGain = ctx.createGain();
        masterGain.gain.value = isMutedRef.current ? 0 : volumeRef.current;

        const dryBusGain = ctx.createGain();
        const wetBusGain = ctx.createGain();
        dryBusGain.gain.value = wetDryRef.current ? 0.18 : 1.0;
        wetBusGain.gain.value = wetDryRef.current ? 0.92 : 0.0;

        const wetFilter = ctx.createBiquadFilter();
        wetFilter.type = "lowpass";
        wetFilter.frequency.value = 3400;
        wetFilter.Q.value = 4.2;

        const waveShaper = ctx.createWaveShaper();
        waveShaper.curve = createSaturationCurve(82) as Float32Array<ArrayBuffer>;
        waveShaper.oversample = "4x";

        // Chaîne DRY : dryBusGain -> masterGain
        dryBusGain.connect(masterGain);

        // Chaîne WET (DSP actif) : wetBusGain -> wetFilter -> waveShaper -> masterGain
        wetBusGain.connect(wetFilter);
        wetFilter.connect(waveShaper);
        waveShaper.connect(masterGain);

        // Sortie Master -> AnalyserNode -> Destination
        masterGain.connect(analyser);
        analyser.connect(ctx.destination);

        audioCtxRef.current = ctx;
        analyserRef.current = analyser;
        masterGainRef.current = masterGain;
        dryBusGainRef.current = dryBusGain;
        wetBusGainRef.current = wetBusGain;
        wetFilterRef.current = wetFilter;
        waveShaperRef.current = waveShaper;
      } catch {
        return null;
      }
    }

    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {
        // Browser autoplay policy may hold until direct click
      });
    }

    return audioCtxRef.current;
  }, []);

  // Synchronise le gain master et le routage DRY/WET en temps réel
  useEffect(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    if (masterGainRef.current) {
      const targetGain = isMuted ? 0 : volume;
      masterGainRef.current.gain.setTargetAtTime(targetGain, now, 0.015);
    }
    if (dryBusGainRef.current && wetBusGainRef.current) {
      dryBusGainRef.current.gain.setTargetAtTime(
        wetDryMix ? 0.15 : 1.0,
        now,
        0.015
      );
      wetBusGainRef.current.gain.setTargetAtTime(
        wetDryMix ? 0.95 : 0.0,
        now,
        0.015
      );
    }
  }, [volume, isMuted, wetDryMix]);

  // Met à jour la courbe du WaveShaper lorsque la piste change
  useEffect(() => {
    if (!currentTrack || !waveShaperRef.current) return;
    const plugin = getPluginById(currentTrack.pluginId || currentTrack.id);
    const drive = plugin ? plugin.audioProfile.driveAmount : 78;
    waveShaperRef.current.curve = createSaturationCurve(drive) as Float32Array<ArrayBuffer>;
  }, [currentTrack]);

  // 4. Déclenchement d'un pas synthétique WebAudio (Kick/Sub + Synth/Lead + Hat)
  const triggerSynthStep = useCallback((step: number) => {
    const ctx = audioCtxRef.current;
    const dryBus = dryBusGainRef.current;
    const wetBus = wetBusGainRef.current;
    if (!ctx || ctx.state !== "running" || !dryBus || !wetBus) return;

    const track = currentTrackRef.current;
    if (!track) return;

    const plugin = getPluginById(track.pluginId || track.id);
    const sample = getSampleById(track.id);

    const baseFreq =
      plugin?.audioProfile.baseFreq ??
      sample?.synthProfile.baseFreq ??
      92.5;
    const pattern = sample?.synthProfile.pattern ?? [
      1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1,
    ];
    const isStepActive = pattern[step % pattern.length] === 1;
    if (!isStepActive && step % 4 !== 0) return;

    const now = ctx.currentTime;
    const stepDuration = 0.14;

    // Semitones mélodiques typés DAW / Acid / Industrial
    const semitoneOffsets = [0, 0, 12, 3, 0, 7, 10, 0, 0, 12, 3, 5, 0, 7, 12, 15];
    const semi = semitoneOffsets[step % semitoneOffsets.length];
    const noteFreq = baseFreq * Math.pow(2, semi / 12);

    // Oscillateur principal (Sub / Bassline)
    const osc = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const envGain = ctx.createGain();

    const synthType =
      plugin?.audioProfile.synthType ??
      sample?.synthProfile.timbre ??
      "saturator";

    if (synthType === "saturator" || synthType === "acid") {
      osc.type = "sawtooth";
      subOsc.type = "square";
    } else if (synthType === "bitcrush" || synthType === "overload") {
      osc.type = "square";
      subOsc.type = "sawtooth";
    } else if (synthType === "video-synth" || synthType === "powerglove") {
      osc.type = "sawtooth";
      subOsc.type = "triangle";
    } else {
      osc.type = "triangle";
      subOsc.type = "sine";
    }

    // Punch d'enveloppe de hauteur sur les temps forts (Kick 808 / Transient)
    if (step % 4 === 0) {
      osc.frequency.setValueAtTime(noteFreq * 2.2, now);
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(40, noteFreq),
        now + 0.055
      );
    } else {
      osc.frequency.setValueAtTime(noteFreq, now);
    }

    subOsc.frequency.setValueAtTime(Math.max(32, noteFreq * 0.5), now);

    // Balayage du filtre résonant en mode WET
    if (wetFilterRef.current) {
      const cutoffBase = wetDryRef.current ? 2600 : 1200;
      const accent = step % 4 === 0 ? 2200 : 600;
      wetFilterRef.current.frequency.setValueAtTime(
        cutoffBase + accent,
        now
      );
      wetFilterRef.current.frequency.exponentialRampToValueAtTime(
        800,
        now + stepDuration
      );
    }

    const peakGain = step % 4 === 0 ? 0.26 : 0.16;
    envGain.gain.setValueAtTime(0.001, now);
    envGain.gain.linearRampToValueAtTime(peakGain, now + 0.008);
    envGain.gain.exponentialRampToValueAtTime(0.0008, now + stepDuration);

    osc.connect(envGain);
    subOsc.connect(envGain);
    envGain.connect(dryBus);
    envGain.connect(wetBus);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + stepDuration + 0.02);
    subOsc.stop(now + stepDuration + 0.02);
  }, []);

  // 5. Boucle du séquenceur rythmique + compteur de temps + vumètres bicolores L/R
  useEffect(() => {
    if (!isPlaying) {
      setPeakLevels({ left: 6, right: 6 });
      return;
    }

    const bpm = currentTrack?.bpm ?? 136;
    const sixteenthMs = Math.max(75, Math.round((60000 / bpm) / 4));

    const stepInterval = window.setInterval(() => {
      const nextStep = (stepIndexRef.current + 1) % 16;
      stepIndexRef.current = nextStep;
      triggerSynthStep(nextStep);

      // Calcul réaliste des crêtes VU-mètre L/R (plus intenses en mode WET)
      if (isMutedRef.current || volumeRef.current <= 0.01) {
        setPeakLevels({ left: 2, right: 2 });
      } else {
        const wetBoost = wetDryRef.current ? 18 : 0;
        const beatAccent = nextStep % 4 === 0 ? 16 : 4;
        const jitterL = Math.sin(nextStep * 1.7) * 7;
        const jitterR = Math.cos(nextStep * 2.3) * 7;
        const scale = volumeRef.current;

        const left = Math.min(
          98,
          Math.max(12, Math.round((56 + wetBoost + beatAccent + jitterL) * scale))
        );
        const right = Math.min(
          98,
          Math.max(12, Math.round((54 + wetBoost + beatAccent + jitterR) * scale))
        );
        setPeakLevels({ left, right });
      }
    }, sixteenthMs);

    const timeInterval = window.setInterval(() => {
      setCurrentTime((prev) => {
        if (prev + 0.25 >= duration) {
          return 0;
        }
        return Number((prev + 0.25).toFixed(2));
      });
    }, 250);

    return () => {
      window.clearInterval(stepInterval);
      window.clearInterval(timeInterval);
    };
  }, [isPlaying, currentTrack, duration, triggerSynthStep]);

  // 6. Actions publiques du lecteur
  const playTrack = useCallback(
    (track: AudioTrackItem) => {
      ensureAudioGraph();
      const isSame = currentTrackRef.current?.id === track.id;
      setCurrentTrack(track);
      setDuration(getTrackDurationSec(track));
      if (!isSame) {
        setCurrentTime(0);
        stepIndexRef.current = 0;
      }
      setIsPlaying(true);
      triggerSynthStep(stepIndexRef.current);
    },
    [ensureAudioGraph, triggerSynthStep]
  );

  const togglePlay = useCallback(() => {
    ensureAudioGraph();
    setIsPlaying((prev) => {
      const next = !prev;
      if (next) {
        triggerSynthStep(stepIndexRef.current);
      }
      return next;
    });
  }, [ensureAudioGraph, triggerSynthStep]);

  const nextTrack = useCallback(() => {
    ensureAudioGraph();
    if (queue.length === 0) return;
    const idx = currentTrack
      ? queue.findIndex((item) => item.id === currentTrack.id)
      : -1;
    const nextItem = queue[(idx + 1) % queue.length];
    setCurrentTrack(nextItem);
    setDuration(getTrackDurationSec(nextItem));
    setCurrentTime(0);
    stepIndexRef.current = 0;
    if (isPlayingRef.current) {
      triggerSynthStep(0);
    }
  }, [ensureAudioGraph, queue, currentTrack, triggerSynthStep]);

  const prevTrack = useCallback(() => {
    ensureAudioGraph();
    if (queue.length === 0) return;
    const idx = currentTrack
      ? queue.findIndex((item) => item.id === currentTrack.id)
      : 0;
    const prevIdx = (idx - 1 + queue.length) % queue.length;
    const prevItem = queue[prevIdx];
    setCurrentTrack(prevItem);
    setDuration(getTrackDurationSec(prevItem));
    setCurrentTime(0);
    stepIndexRef.current = 0;
    if (isPlayingRef.current) {
      triggerSynthStep(0);
    }
  }, [ensureAudioGraph, queue, currentTrack, triggerSynthStep]);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (clamped > 0 && isMutedRef.current) {
      setIsMuted(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const toggleWetDry = useCallback(() => {
    setWetDryMix((prev) => !prev);
  }, []);

  const setOscilloscopeMode = useCallback(
    (mode: "WAVE" | "FFT" | "ANAGLYPH") => {
      setOscilloscopeModeState(mode);
    },
    []
  );

  const seekTo = useCallback(
    (seconds: number) => {
      const clamped = Math.max(0, Math.min(duration, seconds));
      setCurrentTime(clamped);
    },
    [duration]
  );

  const triggerGlitchBurst = useCallback(
    (type: "glitch" | "strobe" | "invert" = "glitch") => {
      const ctx = ensureAudioGraph();
      glitchUntilRef.current = Date.now() + 450;

      if (ctx && ctx.state === "running" && masterGainRef.current) {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const mod = ctx.createOscillator();
        const modGain = ctx.createGain();
        const burstGain = ctx.createGain();

        osc.type = type === "invert" ? "square" : "sawtooth";
        mod.type = "square";

        const startFreq =
          type === "strobe" ? 880 : type === "invert" ? 320 : 540;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(95, now + 0.22);

        mod.frequency.setValueAtTime(48, now);
        modGain.gain.setValueAtTime(280, now);

        burstGain.gain.setValueAtTime(0.18 * volumeRef.current, now);
        burstGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

        mod.connect(modGain);
        modGain.connect(osc.frequency);
        osc.connect(burstGain);
        burstGain.connect(masterGainRef.current);

        osc.start(now);
        mod.start(now);
        osc.stop(now + 0.25);
        mod.stop(now + 0.25);
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("openhub:glitch-burst", {
            detail: { type, timestamp: Date.now() },
          })
        );
      }
    },
    [ensureAudioGraph]
  );

  // 7. Acquisition temps-réel pour l'Oscilloscope <canvas> 60fps
  const getTimeDomainData = useCallback((target: Uint8Array) => {
    const analyser = analyserRef.current;
    if (analyser && isPlayingRef.current) {
      analyser.getByteTimeDomainData(target as Uint8Array<ArrayBuffer>);
      // Vérifie si l'AnalyserNode contient un signal non-plat (en cas de suspension navigateur headless)
      let maxDeviation = 0;
      for (let i = 0; i < target.length; i += 8) {
        const dev = Math.abs(target[i] - 128);
        if (dev > maxDeviation) maxDeviation = dev;
      }
      if (maxDeviation > 2) {
        return;
      }
    }

    if (!isPlayingRef.current || isMutedRef.current || volumeRef.current <= 0.01) {
      target.fill(128);
      return;
    }

    // Synthèse d'onde temps-réel haute précision (reflétant instantanément DRY vs WET + Glitch)
    synthPhaseRef.current += 0.095;
    const phase = synthPhaseRef.current;
    const isWet = wetDryRef.current;
    const isGlitching = Date.now() < glitchUntilRef.current;
    const amp = (isWet ? 58 : 38) * volumeRef.current;
    const stepPulse = stepIndexRef.current % 4 === 0 ? 1.22 : 0.92;

    for (let i = 0; i < target.length; i++) {
      const norm = i / target.length;
      const fundamental = Math.sin(norm * Math.PI * 6 + phase);
      const thirdHarmonic = isWet
        ? 0.42 * Math.sin(norm * Math.PI * 18 - phase * 1.6)
        : 0.08 * Math.sin(norm * Math.PI * 12 + phase);
      const fifthHarmonic = isWet
        ? 0.24 * Math.cos(norm * Math.PI * 30 + phase * 2.4)
        : 0;
      const glitchMod = isGlitching
        ? (Math.sin(i * 1.9 + phase * 5) > 0 ? 0.45 : -0.45)
        : 0;

      let sample =
        (fundamental + thirdHarmonic + fifthHarmonic + glitchMod) * stepPulse;
      if (isWet) {
        // Écrêtage doux tanh caractéristique du mode WET saturé
        sample = Math.tanh(sample * 1.65);
      }
      const byteVal = Math.max(
        8,
        Math.min(248, Math.round(128 + sample * amp))
      );
      target[i] = byteVal;
    }
  }, []);

  const getFrequencyData = useCallback((target: Uint8Array) => {
    const analyser = analyserRef.current;
    if (analyser && isPlayingRef.current) {
      analyser.getByteFrequencyData(target as Uint8Array<ArrayBuffer>);
      let maxEnergy = 0;
      for (let i = 0; i < target.length; i += 8) {
        if (target[i] > maxEnergy) maxEnergy = target[i];
      }
      if (maxEnergy > 8) {
        return;
      }
    }

    if (!isPlayingRef.current || isMutedRef.current || volumeRef.current <= 0.01) {
      target.fill(0);
      return;
    }

    synthPhaseRef.current += 0.05;
    const phase = synthPhaseRef.current;
    const isWet = wetDryRef.current;
    const scale = volumeRef.current;

    for (let i = 0; i < target.length; i++) {
      const decay = Math.exp(-i / (isWet ? 48 : 26));
      const harmonicPeak =
        Math.abs(Math.sin(i * 0.28 + phase)) * (isWet ? 215 : 155);
      target[i] = Math.min(
        255,
        Math.max(0, Math.round(harmonicPeak * decay * scale))
      );
    }
  }, []);

  const getCaptureAudioStream = useCallback((): MediaStream | null => {
    const ctx = ensureAudioGraph();
    if (!ctx || !analyserRef.current) return null;
    if (!streamDestRef.current) {
      try {
        const dest = ctx.createMediaStreamDestination();
        analyserRef.current.connect(dest);
        streamDestRef.current = dest;
      } catch {
        return null;
      }
    }
    return streamDestRef.current.stream;
  }, [ensureAudioGraph]);

  const contextValue = useMemo<AudioPlayerContextValue>(
    () => ({
      currentTrack,
      queue,
      isPlaying,
      externalAudio,
      wetDryMix,
      volume,
      isMuted,
      currentTime,
      duration,
      oscilloscopeMode,
      peakLevels,
      playTrack,
      togglePlay,
      nextTrack,
      prevTrack,
      setVolume,
      toggleMute,
      toggleWetDry,
      setOscilloscopeMode,
      seekTo,
      getTimeDomainData,
      getFrequencyData,
      triggerGlitchBurst,
      getCaptureAudioStream,
    }),
    [
      currentTrack,
      queue,
      isPlaying,
      externalAudio,
      wetDryMix,
      volume,
      isMuted,
      currentTime,
      duration,
      oscilloscopeMode,
      peakLevels,
      playTrack,
      togglePlay,
      nextTrack,
      prevTrack,
      setVolume,
      toggleMute,
      toggleWetDry,
      setOscilloscopeMode,
      seekTo,
      getTimeDomainData,
      getFrequencyData,
      triggerGlitchBurst,
      getCaptureAudioStream,
    ]
  );

  return (
    <AudioPlayerContext.Provider value={contextValue}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export function useAudioPlayer(): AudioPlayerContextValue {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) {
    throw new Error(
      "useAudioPlayer must be used within an <AudioPlayerProvider>"
    );
  }
  return ctx;
}

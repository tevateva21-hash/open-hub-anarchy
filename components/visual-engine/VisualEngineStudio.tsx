"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AvatarBD } from "@/components/ui/AvatarBD";
import { useAudioPlayer } from "@/components/audio/AudioPlayerContext";
import { ConsoleFader } from "@/components/visual-engine/ConsoleFader";
import { ScenePackManager } from "@/components/visual-engine/ScenePackManager";
import {
  DEFAULT_SCENE_PACKS,
  type ScenePack,
  type ScenePackSlot,
} from "@/lib/visual-engine/scene-packs";
import { WaveformCanvas } from "@/components/visual-engine/WaveformCanvas";
import {
  type AudioAnalysis,
  type AudioFeatures,
  type LyricsDisplayStyle,
  type PresetParameterPath,
  type RetroPresetConfig,
  type StudioProject,
  type TimedLyricWord,
  type VideoAspectRatio,
} from "@/lib/visual-engine/contracts";
import {
  VIDEO_ASPECT_FORMATS,
  extractAudioClipWav,
  formatLrcTimestamp,
  formatWhisperToLrc,
} from "@/lib/visual-engine/lyrics-scenario";
import {
  createAudioFeatureAccessor,
  createSyntheticDemoWavFile,
  estimateTempoBpm,
  extractLiveFeaturesFromBuffers,
} from "@/lib/visual-engine/audioAnalysis";
import { clearAnalysisCache } from "@/lib/visual-engine/cache";
import { importAudio } from "@/lib/visual-engine/importAudio";
import { fixRecordedVideoSeekable } from "@/lib/visual-engine/webm-duration-fix";
import {
  createDefaultStudioProject,
  evaluateSequenceAt,
  generatePresetVariations,
} from "@/lib/visual-engine/presets";
import {
  SCENE_CATALOG,
  STUDY_FPS,
  STUDY_PALETTES,
  getSceneDescriptor,
  renderSceneFrame,
  type SceneRenderReport,
} from "@/lib/visual-engine/renderer";

type AudioSourceMode = "LIVE_HUB" | "LOCAL_FILE";
type BankFilter = "ALL" | "AUDIO" | "FX" | "CAMERA";
type StudioControlTab = "faders" | "audio" | "variations" | "lyrics";

const ZERO_FEATURES: AudioFeatures = {
  rms: 0,
  bass: 0,
  mid: 0,
  treble: 0,
  spectralFlux: 0,
};

/**
 * Composant `VisualEngineStudio` — Intégration complète V2 dans Open Hub :
 * - Console modulaire à 10 Faders DAW/VJ essentiels (Basses, Aigus/Clap, Strobe Aigu, Psyché, Caméra)
 * - Packs de scènes 3D profondes enchaînées au BPM + Éditeur 3D en direct (JSON / JS 3D)
 * - Incrustation de paroles bitmap 5x5 + Micro Web Speech API
 * - Synthèse piste démo WAV + Import MP3/WAV FFT Worker + Export MP4 avec son
 */
export const VisualEngineStudio: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    getTimeDomainData,
    getFrequencyData,
    getCaptureAudioStream,
    pauseAllAudio,
  } = useAudioPlayer();

  // Projet M6 complet + pile Undo/Redo
  const [project, setProject] = useState<StudioProject>(() => {
    const initial = createDefaultStudioProject();
    if (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function"
    ) {
      initial.reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
    }
    return initial;
  });
  const [historyPast, setHistoryPast] = useState<StudioProject[]>([]);
  const [historyFuture, setHistoryFuture] = useState<StudioProject[]>([]);

  // Mode horloge & source audio
  const [sourceMode, setSourceMode] = useState<AudioSourceMode>("LIVE_HUB");
  const [bankFilter, setBankFilter] = useState<BankFilter>("ALL");
  const [frame, setFrame] = useState<number>(0);
  const [autoAnimate, setAutoAnimate] = useState<boolean>(true);
  const playbackSpeed = 100;
  const envelopeSmooth = 22;

  // Gains essentiels (0..250%) : Basses & Aigus/Clap
  const [bassGain, setBassGain] = useState<number>(110);
  const midGain = 100;
  const [trebleGain, setTrebleGain] = useState<number>(125);

  // BPM, Beat Sync & Kick Blackout
  const [bpm, setBpm] = useState<number>(128);
  const [beatOffset, setBeatOffset] = useState<number>(0);
  const [sceneAnchorSeconds, setSceneAnchorSeconds] = useState<number>(0);
  const [autoSceneSwitchBeats, setAutoSceneSwitchBeats] = useState<number>(16);
  const kickBlackoutMode = "duck-on-kick" as const;
  const activePackRef = useRef<ScenePack>(DEFAULT_SCENE_PACKS[0]);
  const [livePackSlotIndex, setLivePackSlotIndex] = useState<number>(0);
  const livePackSlotIndexRef = useRef<number>(0);
  const [useCustomPalette, setUseCustomPalette] = useState<boolean>(false);
  const useCustomPaletteRef = useRef<boolean>(false);
  const [activeVariationIdx, setActiveVariationIdx] = useState<number | null>(
    null
  );
  const variationSeedNonceRef = useRef<number>(1);

  // Paroles incrustées, Scénario LRC, Whisper & Micro
  const [lyricsEnabled, setLyricsEnabled] = useState<boolean>(false);
  const [lyricsText, setLyricsText] = useState<string>(
    "[00:00.00] #INTRO ANARCHY VISUAL ENGINE\n[00:05.00] #DROP TECHNO THERAPY LOCKED\n[00:10.00] #REFRAIN OPEN HUB 3D"
  );
  const [lyricsStyle, setLyricsStyle] =
    useState<LyricsDisplayStyle>("cinema-sub");
  const [speechActive, setSpeechActive] = useState<boolean>(false);
  const [timedWords, setTimedWords] = useState<TimedLyricWord[]>([]);
  const [whisperBusy, setWhisperBusy] = useState<boolean>(false);
  const [whisperStatus, setWhisperStatus] = useState<string>("");

  // Format vidéo Réseaux Sociaux (16:9, 9:16 TikTok/Reels, 4:5 Insta, 1:1 Carré)
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>("16:9");
  const [showSafeZone, setShowSafeZone] = useState<boolean>(true);
  const aspectSpec = VIDEO_ASPECT_FORMATS[aspectRatio];

  // Import MP3/WAV + Web Worker FFT + IndexedDB
  const [analysis, setAnalysis] = useState<AudioAnalysis>();
  const [localUrl, setLocalUrl] = useState<string>();
  const [fileName, setFileName] = useState<string>("");
  const [importStatus, setImportStatus] = useState<string>(
    "Chargez la piste démo WAV en 1 clic, importez un MP3/WAV, ou pilotez via le Lecteur Open Hub."
  );
  const [importError, setImportError] = useState<string>("");
  const [importWarning, setImportWarning] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);
  const [localTime, setLocalTime] = useState<number>(0);

  // Variations rapides, Changement de couleur & Télémétrie scène
  const [liveFeatures, setLiveFeatures] =
    useState<AudioFeatures>(ZERO_FEATURES);
  const [renderReport, setRenderReport] = useState<SceneRenderReport>();
  const [presetMessage, setPresetMessage] = useState<string>("");
  const [presetError, setPresetError] = useState<string>("");
  const [variations, setVariations] = useState<RetroPresetConfig[]>(() =>
    generatePresetVariations(createDefaultStudioProject().activePreset, 4)
  );

  // Extrait audio (30s par défaut) & Fondus entrée / sortie
  const [clipStartSeconds, setClipStartSeconds] = useState<number>(0);
  const [clipDurationSeconds, setClipDurationSeconds] = useState<number>(30);
  const [fadeInSeconds, setFadeInSeconds] = useState<number>(1.5);
  const [fadeOutSeconds, setFadeOutSeconds] = useState<number>(2.0);
  const [clipActive, setClipActive] = useState<boolean>(true);
  const [clipLoop, setClipLoop] = useState<boolean>(true);

  // Interface épurée par onglets + Mode Plein Écran
  const [activeTab, setActiveTab] = useState<StudioControlTab>("faders");
  const [showAllPanels, setShowAllPanels] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const stageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const prevFreqRef = useRef<Uint8Array>(new Uint8Array(128));
  const smoothedFeaturesRef = useRef<AudioFeatures>({ ...ZERO_FEATURES });
  const timeAccumRef = useRef<number>(0);

  useEffect(() => {
    const onFsChange = () => {
      const fsEl = document.fullscreenElement;
      setIsFullscreen(Boolean(fsEl && fsEl === stageContainerRef.current));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = stageContainerRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement === el) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } else if (typeof el.requestFullscreen === "function") {
        await el.requestFullscreen();
        setIsFullscreen(true);
      } else {
        setIsFullscreen((v) => !v);
      }
    } catch {
      // Fallback plein écran CSS si l'API Fullscreen est bloquée (ex: iframe)
      setIsFullscreen((v) => !v);
    }
  }, []);

  const preset = project.activePreset;
  const activeDescriptor = getSceneDescriptor(
    renderReport?.sceneId ?? preset.sceneId
  );

  // Helpers immuables pour mettre à jour projet / preset avec Undo/Redo
  const updateProject = useCallback(
    (
      updater: (current: StudioProject) => StudioProject,
      recordHistory = true
    ) => {
      setProject((current) => {
        const next = updater(current);
        if (recordHistory) {
          setHistoryPast((past) => [...past.slice(-19), current]);
          setHistoryFuture([]);
        }
        return next;
      });
    },
    []
  );

  const updatePreset = useCallback(
    (
      updater: (current: RetroPresetConfig) => RetroPresetConfig,
      recordHistory = true
    ) => {
      updateProject(
        (current) => ({
          ...current,
          activePreset: updater(current.activePreset),
        }),
        recordHistory
      );
    },
    [updateProject]
  );

  useEffect(() => {
    return () => {
      if (localUrl) URL.revokeObjectURL(localUrl);
    };
  }, [localUrl]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event: MediaQueryListEvent) => {
      setProject((curr) => ({ ...curr, reducedMotion: event.matches }));
    };
    media.addEventListener?.("change", onChange);
    return () => media.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    if (analysis) {
      const est = estimateTempoBpm(analysis);
      setBpm(est.bpm);
      // Toujours garder le calage vidéo BPM à 0.00s par défaut au chargement d'une musique
      setBeatOffset(0);
    }
  }, [analysis]);

  const handleFileLoad = async (file: File) => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    localAudioRef.current?.pause();
    setLocalUrl(undefined);
    setAnalysis(undefined);
    setLocalTime(0);
    setFrame(0);
    setClipStartSeconds(0);
    setBeatOffset(0);
    timeAccumRef.current = 0;
    setBusy(true);
    setImportError("");
    setImportWarning("");
    setFileName(file.name);

    try {
      const result = await importAudio(
        file,
        controller.signal,
        setImportStatus
      );
      if (controller.signal.aborted) return;
      setAnalysis(result.analysis);
      setLocalUrl(URL.createObjectURL(file));
      setSourceMode("LOCAL_FILE");
      setImportWarning(result.cacheWarning ?? "");
      setImportStatus(
        result.cached
          ? "Analyse FFT prête — chargée depuis le cache IndexedDB local."
          : "Analyse FFT prête — calculée hors ligne à 24 kHz."
      );
    } catch (cause) {
      if (!controller.signal.aborted) {
        setImportError(
          cause instanceof Error ? cause.message : "Import impossible."
        );
        setImportStatus("Import interrompu.");
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setBusy(false);
      }
    }
  };

  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const isRecordingVideoRef = useRef<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const recordAutoStopTimerRef = useRef<number | null>(null);
  const localAudioCaptureRef = useRef<{
    el: HTMLAudioElement;
    ctx: AudioContext;
    dest: MediaStreamAudioDestinationNode;
  } | null>(null);

  const stopActiveRecording = useCallback(() => {
    if (recordAutoStopTimerRef.current !== null) {
      window.clearTimeout(recordAutoStopTimerRef.current);
      recordAutoStopTimerRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    isRecordingVideoRef.current = false;
    setIsRecordingVideo(false);
  }, []);

  const applyClipFadeVolume = useCallback(
    (audioEl: HTMLAudioElement, t: number) => {
      if (!clipActive && !isRecordingVideoRef.current) {
        audioEl.volume = 1;
        return;
      }
      const clipEnd = clipStartSeconds + clipDurationSeconds;
      if (t >= clipEnd) {
        if (isRecordingVideoRef.current) {
          audioEl.pause();
          audioEl.currentTime = clipStartSeconds;
          setLocalTime(clipStartSeconds);
          stopActiveRecording();
          return;
        }
        if (clipLoop) {
          audioEl.currentTime = clipStartSeconds;
          setLocalTime(clipStartSeconds);
          audioEl.volume = fadeInSeconds > 0 ? 0.05 : 1;
        } else {
          audioEl.pause();
          audioEl.currentTime = clipStartSeconds;
          setLocalTime(clipStartSeconds);
          audioEl.volume = fadeInSeconds > 0 ? 0.05 : 1;
        }
        return;
      }
      const elapsed = Math.max(0, t - clipStartSeconds);
      const remaining = Math.max(0, clipEnd - t);
      let vol = 1;
      if (fadeInSeconds > 0 && elapsed < fadeInSeconds) {
        vol = Math.min(vol, Math.max(0.02, elapsed / fadeInSeconds));
      }
      if (fadeOutSeconds > 0 && remaining < fadeOutSeconds) {
        vol = Math.min(vol, Math.max(0.02, remaining / fadeOutSeconds));
      }
      audioEl.volume = Math.min(1, Math.max(0, vol));
    },
    [
      clipActive,
      clipDurationSeconds,
      clipLoop,
      clipStartSeconds,
      fadeInSeconds,
      fadeOutSeconds,
      stopActiveRecording,
    ]
  );

  // Boucle de rendu déterministe / temps-réel (pilote le Canvas 320x180)
  useEffect(() => {
    let rafId = 0;
    let lastTimestamp = performance.now();
    const timeBuf = new Uint8Array(128);
    const freqBuf = new Uint8Array(128);

    const tick = (now: number) => {
      const dt = Math.min(0.1, Math.max(0, (now - lastTimestamp) / 1000));
      lastTimestamp = now;

      let timeSeconds = frame / STUDY_FPS;
      let rawFeatures: AudioFeatures = ZERO_FEATURES;
      let useLiveOverride = false;

      if (sourceMode === "LOCAL_FILE" && analysis) {
        const audioEl = localAudioRef.current;
        let t = audioEl ? audioEl.currentTime : localTime;
        if (audioEl && !audioEl.paused) {
          if (clipActive || isRecordingVideoRef.current) {
            const clipEnd = Math.min(
              analysis.durationSeconds,
              clipStartSeconds + clipDurationSeconds
            );
            if (t >= clipEnd) {
              if (isRecordingVideoRef.current) {
                audioEl.pause();
                audioEl.currentTime = clipStartSeconds;
                t = clipStartSeconds;
                stopActiveRecording();
              } else if (clipLoop) {
                audioEl.currentTime = clipStartSeconds;
                t = clipStartSeconds;
              } else {
                audioEl.pause();
              }
            }
            applyClipFadeVolume(audioEl, t);
          }
          setLocalTime(t);
        }
        timeSeconds = Math.max(0, t);
        rawFeatures = createAudioFeatureAccessor(analysis).getAudioFeaturesAt(
          timeSeconds
        );
      } else {
        if (autoAnimate && playbackSpeed > 0 && !project.reducedMotion) {
          timeAccumRef.current += dt * (playbackSpeed / 100);
          timeSeconds = timeAccumRef.current;
        } else {
          timeAccumRef.current = frame / STUDY_FPS;
          timeSeconds = timeAccumRef.current;
        }

        if (isPlaying) {
          getTimeDomainData(timeBuf);
          getFrequencyData(freqBuf);
          rawFeatures = extractLiveFeaturesFromBuffers(
            timeBuf,
            freqBuf,
            prevFreqRef.current
          );
          useLiveOverride = true;
        }
      }

      const smoothFactor = Math.max(
        0.05,
        Math.min(0.95, 1 - envelopeSmooth / 105)
      );
      const prev = smoothedFeaturesRef.current;
      const nextSmoothed: AudioFeatures = {
        rms: prev.rms + (rawFeatures.rms - prev.rms) * smoothFactor,
        bass: prev.bass + (rawFeatures.bass - prev.bass) * smoothFactor,
        mid: prev.mid + (rawFeatures.mid - prev.mid) * smoothFactor,
        treble: prev.treble + (rawFeatures.treble - prev.treble) * smoothFactor,
        spectralFlux:
          prev.spectralFlux +
          (rawFeatures.spectralFlux - prev.spectralFlux) * smoothFactor,
      };
      smoothedFeaturesRef.current = nextSmoothed;
      setLiveFeatures(nextSmoothed);

      const sequenceEval = project.sequenceEnabled
        ? evaluateSequenceAt(
            project.segments,
            project.activePreset,
            project.automations,
            timeSeconds
          )
        : {
            activePreset: project.activePreset,
            dissolveFactor: 0,
            segmentIndex: 0,
          };

      const effectivePreset = sequenceEval.activePreset;
      const pack = activePackRef.current;
      let activeSlot: ScenePackSlot | undefined;
      let prevSlot: ScenePackSlot | undefined;
      let sceneProgress = 0;
      let transitionProgress = 1;
      const beatDur = 60 / Math.max(40, bpm);

      if (pack.scenes.length > 0) {
        if (autoSceneSwitchBeats > 0) {
          const slotDurationSec = Math.max(0.25, beatDur * autoSceneSwitchBeats);
          const elapsedFromAnchor = Math.max(0, timeSeconds - sceneAnchorSeconds);
          const rawSlotIdx = Math.floor(elapsedFromAnchor / slotDurationSec);
          const slotIdx =
            ((rawSlotIdx % pack.scenes.length) + pack.scenes.length) %
            pack.scenes.length;
          activeSlot = pack.scenes[slotIdx];
          if (pack.scenes.length > 1) {
            const prevIdx =
              (slotIdx - 1 + pack.scenes.length) % pack.scenes.length;
            prevSlot = pack.scenes[prevIdx];
          }
          const slotElapsedSec = elapsedFromAnchor % slotDurationSec;
          sceneProgress = Math.max(
            0,
            Math.min(1, slotElapsedSec / slotDurationSec)
          );
          const morphBeats = Math.min(
            autoSceneSwitchBeats * 0.45,
            activeSlot?.morphTransition?.durationBeats ?? 3
          );
          const morphDurationSec = Math.max(
            0.25,
            Math.min(slotDurationSec * 0.5, beatDur * morphBeats)
          );
          transitionProgress =
            rawSlotIdx === 0 && elapsedFromAnchor < slotDurationSec
              ? 1
              : Math.max(0, Math.min(1, slotElapsedSec / morphDurationSec));
          if (livePackSlotIndexRef.current !== slotIdx) {
            livePackSlotIndexRef.current = slotIdx;
            setLivePackSlotIndex(slotIdx);
          }
        } else {
          const safeIdx =
            Math.max(0, livePackSlotIndexRef.current) % pack.scenes.length;
          activeSlot = pack.scenes[safeIdx];
          if (pack.scenes.length > 1) {
            prevSlot =
              pack.scenes[
                (safeIdx - 1 + pack.scenes.length) % pack.scenes.length
              ];
          }
          const slotBars = activeSlot?.durationBars ?? 8;
          const slotDurationSec = Math.max(1, slotBars * 4 * beatDur);
          const slotElapsedSec =
            Math.max(0, timeSeconds - sceneAnchorSeconds) % slotDurationSec;
          sceneProgress = Math.max(
            0,
            Math.min(1, slotElapsedSec / slotDurationSec)
          );
          // En mode HOLD / sélection manuelle d'une scène, ne morpher que lors d'un clic sur une nouvelle scène (pendant les premiers temps après sceneAnchorSeconds), jamais en boucle à l'intérieur de la scène
          const elapsedSinceSwitch = Math.max(0, timeSeconds - sceneAnchorSeconds);
          const morphBeats = activeSlot?.morphTransition?.durationBeats;
          if (morphBeats && morphBeats > 0 && sceneAnchorSeconds > 0.05) {
            const morphDurationSec = Math.max(
              0.25,
              Math.min(2.5, beatDur * morphBeats)
            );
            transitionProgress = Math.max(
              0,
              Math.min(1, elapsedSinceSwitch / morphDurationSec)
            );
          } else {
            transitionProgress = 1;
          }
        }
      }

      const canvas = stageCanvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (ctx) {
        const nextReport = renderSceneFrame(ctx, {
          sceneId: activeSlot?.sceneId ?? effectivePreset.sceneId,
          paletteId:
            useCustomPaletteRef.current || !activeSlot?.paletteId
              ? effectivePreset.paletteId
              : activeSlot.paletteId,
          timeSeconds,
          analysis: sourceMode === "LOCAL_FILE" ? analysis : undefined,
          liveAudioOverride: useLiveOverride ? nextSmoothed : undefined,
          intensity: effectivePreset.intensity,
          reducedMotion: project.reducedMotion,
          effects: effectivePreset.effects,
          bandRouting: {
            bassGain: bassGain / 100,
            midGain: midGain / 100,
            trebleGain: trebleGain / 100,
            transientGain: trebleGain / 100,
            bassTarget: "halo-pulse",
            midTarget: "haze-fog",
            trebleTarget: "rain-glitter",
            transientTarget: "strobe-flash",
          },
          lyrics: {
            enabled: lyricsEnabled,
            text: lyricsText,
            style: lyricsStyle,
            autoVocalSync: true,
            timedWords,
          },
          bpmConfig:
            autoSceneSwitchBeats > 0 ||
            (effectivePreset.effects.kickBlackout ?? 0) > 0
              ? {
                  bpm,
                  beatOffsetSeconds: beatOffset,
                  autoSceneSwitchBeats: 0,
                  kickBlackoutMode,
                }
              : undefined,
          camera: effectivePreset.render.camera,
          seed: activeSlot?.seed ?? effectivePreset.seed,
          aspectRatio,
          anarchy3dScene: activeSlot,
          previousAnarchy3dScene: prevSlot,
          sceneProgress,
          transitionType: activeSlot?.transition,
          transitionProgress,
        });

        setRenderReport(nextReport);
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [
    analysis,
    applyClipFadeVolume,
    aspectRatio,
    aspectSpec.height,
    aspectSpec.width,
    autoAnimate,
    autoSceneSwitchBeats,
    bassGain,
    beatOffset,
    bpm,
    clipActive,
    clipDurationSeconds,
    clipLoop,
    clipStartSeconds,
    frame,
    getFrequencyData,
    getTimeDomainData,
    isPlaying,
    kickBlackoutMode,
    localTime,
    lyricsEnabled,
    lyricsStyle,
    lyricsText,
    project,
    sceneAnchorSeconds,
    sourceMode,
    stopActiveRecording,
    timedWords,
    trebleGain,
  ]);

  // Actions Couleurs, Variations & Historique
  const toggleLock = (path: PresetParameterPath) => {
    updatePreset((curr) => {
      const nextLocks = { ...curr.locks };
      if (nextLocks[path]) delete nextLocks[path];
      else nextLocks[path] = true;
      return { ...curr, locks: nextLocks };
    }, false);
  };

  const handleGenerateVariations = () => {
    setPresetError("");
    variationSeedNonceRef.current += 1;
    const derivedBaseSeed =
      ((preset.seed >>> 0) + variationSeedNonceRef.current * 0x9e3779b9) >>> 0;
    try {
      const nextVars = generatePresetVariations(preset, 4, derivedBaseSeed);
      setVariations(nextVars);
      setActiveVariationIdx(null);
      setPresetMessage("4 nouvelles variations rapides générées.");
    } catch (cause) {
      setPresetError(
        cause instanceof Error ? cause.message : "Génération impossible."
      );
    }
  };

  const handleApplyVariation = (v: RetroPresetConfig, idx: number) => {
    setPresetError("");
    useCustomPaletteRef.current = true;
    setUseCustomPalette(true);
    setActiveVariationIdx(idx);
    setAutoSceneSwitchBeats(0);
    updatePreset(() => v);
    setPresetMessage(
      `Variation #${idx + 1} appliquée (${v.sceneId} · ${v.paletteId}).`
    );
  };

  const handleUndo = () => {
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1];
    setHistoryPast((past) => past.slice(0, -1));
    setHistoryFuture((future) => [project, ...future]);
    setProject(previous);
  };

  const handleRedo = () => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    setHistoryFuture((future) => future.slice(1));
    setHistoryPast((past) => [...past, project]);
    setProject(next);
  };

  const handleExportSnapshot = () => {
    const src = stageCanvasRef.current;
    if (!src) return;
    // Rendu direct en haute définition (exportWidth × exportHeight, ex: 1280×720 ou 1080×1920)
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = aspectSpec.exportWidth;
    exportCanvas.height = aspectSpec.exportHeight;
    const ectx = exportCanvas.getContext("2d");
    if (!ectx) return;
    ectx.imageSmoothingEnabled = true;
    if ("imageSmoothingQuality" in ectx) {
      ectx.imageSmoothingQuality = "high";
    }
    ectx.drawImage(
      src,
      0,
      0,
      aspectSpec.exportWidth,
      aspectSpec.exportHeight
    );
    const url = exportCanvas.toDataURL("image/png", 1.0);
    const a = document.createElement("a");
    a.href = url;
    a.download = `anarchy-visual-${aspectRatio.replace(":", "x")}-${preset.sceneId}-${preset.seed}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setPresetMessage(
      `Image PNG Haute Définition (${aspectSpec.exportWidth}×${aspectSpec.exportHeight}) téléchargée !`
    );
  };

  const handleWhisperTranscribe = async () => {
    if (!localUrl) {
      setWhisperStatus(
        "Importez d'abord une piste MP3/WAV (ou chargez la piste démo) pour la transcrire avec Whisper."
      );
      return;
    }
    setWhisperBusy(true);
    setWhisperStatus(
      `Découpage de l'extrait (${clipStartSeconds.toFixed(1)}s → ${(clipStartSeconds + clipDurationSeconds).toFixed(1)}s) & envoi Whisper...`
    );
    try {
      const wavFile = await extractAudioClipWav(
        localUrl,
        clipStartSeconds,
        clipDurationSeconds
      );
      const fd = new FormData();
      fd.append("file", wavFile);
      fd.append("language", "fr");
      const res = await fetch("/api/whisper", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setWhisperStatus(data.error || "Erreur Whisper.");
        return;
      }

      const rawWords = Array.isArray(data.words)
        ? (data.words as Array<{ word: string; start: number; end: number }>)
        : [];
      const shiftedWords: TimedLyricWord[] = rawWords.map((w) => ({
        word: w.word,
        start: Number((w.start + clipStartSeconds).toFixed(2)),
        end: Number((w.end + clipStartSeconds).toFixed(2)),
      }));
      setTimedWords(shiftedWords);

      const segments = Array.isArray(data.segments) ? data.segments : [];
      const lrc =
        segments.length > 0
          ? formatWhisperToLrc(segments, clipStartSeconds)
          : `${formatLrcTimestamp(clipStartSeconds)} ${String(data.text || "").toUpperCase()}`;
      if (lrc) {
        setLyricsText(lrc);
      }
      setLyricsEnabled(true);
      setWhisperStatus(
        `✅ Whisper (${data.provider}) : ${shiftedWords.length} mots synchronisés au centième de seconde !`
      );
    } catch (err) {
      setWhisperStatus(
        err instanceof Error
          ? err.message
          : "Impossible de contacter /api/whisper."
      );
    } finally {
      setWhisperBusy(false);
    }
  };

  const handleInsertLrcTimecode = () => {
    const t = localAudioRef.current?.currentTime ?? localTime;
    const stamp = formatLrcTimestamp(t);
    setLyricsText((prev) =>
      prev.trim().length > 0 ? `${prev.trimEnd()}\n${stamp} ` : `${stamp} `
    );
    setLyricsEnabled(true);
  };

  const handleToggleVideoExport = async () => {
    if (isRecordingVideo && mediaRecorderRef.current) {
      stopActiveRecording();
      localAudioRef.current?.pause();
      return;
    }

    const canvas = stageCanvasRef.current;
    if (!canvas || typeof MediaRecorder === "undefined") {
      setPresetError(
        "L'enregistrement vidéo MediaRecorder n'est pas supporté sur ce navigateur."
      );
      return;
    }

    try {
      // Capture à 60 FPS en résolution HD native (exportWidth × exportHeight)
      const videoStream = canvas.captureStream(60);
      const tracks: MediaStreamTrack[] = [...videoStream.getVideoTracks()];
      let hasAudioTrack = false;

      // 1. Capturer le son de l'extrait local (avec Fade In/Out) OU le flux live Open Hub
      const audioEl = localAudioRef.current;
      if (sourceMode === "LOCAL_FILE" && audioEl && localUrl) {
        try {
          if (
            !localAudioCaptureRef.current ||
            localAudioCaptureRef.current.el !== audioEl
          ) {
            if (localAudioCaptureRef.current) {
              localAudioCaptureRef.current.ctx.close().catch(() => {});
              localAudioCaptureRef.current = null;
            }
            const AudioCtxCtor =
              window.AudioContext ||
              (window as unknown as { webkitAudioContext?: typeof AudioContext })
                .webkitAudioContext;
            if (AudioCtxCtor) {
              const ctx = new AudioCtxCtor();
              const srcNode = ctx.createMediaElementSource(audioEl);
              const dest = ctx.createMediaStreamDestination();
              srcNode.connect(ctx.destination);
              srcNode.connect(dest);
              localAudioCaptureRef.current = { el: audioEl, ctx, dest };
            }
          }
          if (localAudioCaptureRef.current) {
            if (localAudioCaptureRef.current.ctx.state === "suspended") {
              await localAudioCaptureRef.current.ctx.resume();
            }
            const audioTracks =
              localAudioCaptureRef.current.dest.stream.getAudioTracks();
            tracks.push(...audioTracks);
            hasAudioTrack = audioTracks.length > 0;
          }
        } catch {
          // fallback navigateur : captureStream sur <audio> si dispo
          const fallbackEl = audioEl as HTMLAudioElement & {
            captureStream?: () => MediaStream;
            mozCaptureStream?: () => MediaStream;
          };
          const cap =
            fallbackEl.captureStream?.() ?? fallbackEl.mozCaptureStream?.();
          if (cap) {
            const audioTracks = cap.getAudioTracks();
            tracks.push(...audioTracks);
            hasAudioTrack = audioTracks.length > 0;
          }
        }
      } else {
        if (!isPlaying) {
          togglePlay();
          await new Promise((r) => window.setTimeout(r, 80));
        }
        const hubAudioStream = getCaptureAudioStream();
        if (hubAudioStream) {
          const audioTracks = hubAudioStream.getAudioTracks();
          tracks.push(...audioTracks);
          hasAudioTrack = audioTracks.length > 0;
        }
      }

      const combinedStream = new MediaStream(tracks);
      const candidates = hasAudioTrack
        ? [
            "video/mp4;codecs=avc1.640028,mp4a.40.2",
            "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
            "video/mp4;codecs=avc1,mp4a",
            "video/mp4",
            "video/webm;codecs=vp9,opus",
            "video/webm;codecs=vp8,opus",
            "video/webm",
          ]
        : [
            "video/mp4;codecs=avc1.640028",
            "video/mp4;codecs=avc1",
            "video/mp4",
            "video/webm;codecs=vp9",
            "video/webm",
          ];
      const mimeType =
        candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
      const recorderOptions: MediaRecorderOptions = {
        ...(mimeType ? { mimeType } : {}),
        videoBitsPerSecond: 16_000_000, // 16 Mbps Haute Qualité HD
        audioBitsPerSecond: 256_000, // 256 kbps Audio Studio
      };
      const recorder = new MediaRecorder(combinedStream, recorderOptions);

      recordedChunksRef.current = [];
      recordingStartTimeRef.current = performance.now();
      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          recordedChunksRef.current.push(ev.data);
        }
      };
      recorder.onstop = async () => {
        const elapsedMs = Math.max(
          500,
          Math.round(performance.now() - recordingStartTimeRef.current)
        );
        const finalType = recorder.mimeType || mimeType || "video/webm";
        const ext = finalType.includes("mp4") ? "mp4" : "webm";
        const rawBlob = new Blob(recordedChunksRef.current, { type: finalType });
        // Injecter la durée EBML dans l'en-tête WebM pour rendre la vidéo déplaçable dans le temps (seekable)
        const seekableBlob = await fixRecordedVideoSeekable(rawBlob, elapsedMs);
        const url = URL.createObjectURL(seekableBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `anarchy-visual-${aspectRatio.replace(":", "x")}-${clipStartSeconds.toFixed(0)}s-${clipDurationSeconds}s.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.setTimeout(() => URL.revokeObjectURL(url), 5000);
        isRecordingVideoRef.current = false;
        setIsRecordingVideo(false);
        setPresetMessage(
          `Vidéo HD (${aspectSpec.exportWidth}×${aspectSpec.exportHeight} · 16 Mbps · Seekable) exportée (.${ext.toUpperCase()}) !`
        );
      };

      // Caler exactement sur la zone prévisualisée [clipStartSeconds -> clipEnd]
      setClipActive(true);
      isRecordingVideoRef.current = true;
      setIsRecordingVideo(true);
      setAutoAnimate(true);
      recorder.start(200);
      mediaRecorderRef.current = recorder;

      if (sourceMode === "LOCAL_FILE" && audioEl) {
        audioEl.currentTime = clipStartSeconds;
        setLocalTime(clipStartSeconds);
        applyClipFadeVolume(audioEl, clipStartSeconds);
        await audioEl.play().catch(() => {});
      } else {
        recordAutoStopTimerRef.current = window.setTimeout(() => {
          stopActiveRecording();
        }, clipDurationSeconds * 1000);
      }

      setPresetError("");
      setPresetMessage(
        `⏺ Enregistrement HD ${aspectSpec.exportWidth}×${aspectSpec.exportHeight} (${clipStartSeconds.toFixed(1)}s → ${(clipStartSeconds + clipDurationSeconds).toFixed(1)}s · ${hasAudioTrack ? "Son inclus" : "Vidéo seule"})...`
      );
    } catch {
      isRecordingVideoRef.current = false;
      setIsRecordingVideo(false);
      setPresetError("Impossible de démarrer l'enregistrement vidéo HD.");
    }
  };

  const handleAutoSyncScenesToAudio = () => {
    const start = clipActive ? clipStartSeconds : 0;
    const totalAvailable = analysis?.durationSeconds ?? clipDurationSeconds;
    const span = clipActive
      ? Math.min(clipDurationSeconds, Math.max(4, totalAvailable - start))
      : totalAvailable;
    const count = project.segments.length || 5;
    const beatSec = 60 / Math.max(60, bpm);
    const barSec = beatSec * 4;
    const rawSlice = span / count;
    // Aligner chaque segment sur des temps / mesures du BPM
    const bpmAlignedSlice = Math.max(
      beatSec,
      Math.round(rawSlice / beatSec) * beatSec
    );

    updateProject((curr) => ({
      ...curr,
      sequenceEnabled: true,
      segments: curr.segments.map((seg, idx) => {
        const s = start + idx * bpmAlignedSlice;
        const e =
          idx === count - 1
            ? start + span
            : Math.min(start + span, start + (idx + 1) * bpmAlignedSlice);
        return {
          ...seg,
          startSeconds: Number(s.toFixed(2)),
          endSeconds: Number(Math.max(s + beatSec, e).toFixed(2)),
        };
      }),
    }));
    if (autoSceneSwitchBeats === 0) {
      setAutoSceneSwitchBeats(16);
    }
    setPresetMessage(
      `Scènes calées en BPM (${bpm} BPM · ${barSec.toFixed(2)}s/mesure) sur l'extrait ${start.toFixed(1)}s → ${(start + span).toFixed(1)}s.`
    );
  };

  const handlePlayClipExtract = () => {
    if (!localAudioRef.current) return;
    pauseAllAudio();
    localAudioRef.current.currentTime = clipStartSeconds;
    setLocalTime(clipStartSeconds);
    setSourceMode("LOCAL_FILE");
    setAutoAnimate(true);
    void localAudioRef.current.play().catch(() => {});
  };

  const handlePauseSiteMusic = () => {
    pauseAllAudio();
    setPresetMessage("Musique du site mise en pause.");
  };

  const handleSpeechMic = () => {
    const w = window as unknown as Record<string, unknown>;
    const SpeechRec = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRec) {
      setPresetMessage(
        "Reconnaissance vocale indisponible dans ce navigateur — saisissez vos paroles directement ci-dessous."
      );
      setLyricsEnabled(true);
      return;
    }
    const rec = new (SpeechRec as new () => {
      lang: string;
      continuous: boolean;
      interimResults: boolean;
      onresult: (ev: {
        results: ArrayLike<ArrayLike<{ transcript: string }>>;
      }) => void;
      onerror: () => void;
      onend: () => void;
      start: () => void;
    })();
    rec.lang = "fr-FR";
    rec.continuous = false;
    rec.interimResults = true;
    setSpeechActive(true);
    setLyricsEnabled(true);
    rec.onresult = (ev) => {
      const transcript = Array.from(ev.results)
        .map((r) => r[0]?.transcript ?? "")
        .join("\n")
        .toUpperCase();
      if (transcript) setLyricsText(transcript);
    };
    rec.onerror = () => setSpeechActive(false);
    rec.onend = () => setSpeechActive(false);
    rec.start();
  };

  const seekLocalAudio = (seconds: number) => {
    setLocalTime(seconds);
    if (localAudioRef.current) {
      localAudioRef.current.currentTime = seconds;
    }
  };

  const isLowPoly = preset.render.style === "lowpoly-32";

  const showFaders = showAllPanels || activeTab === "faders";
  const showAudio = showAllPanels || activeTab === "audio";
  const showVariations = showAllPanels || activeTab === "variations";
  const showLyrics = showAllPanels || activeTab === "lyrics";

  return (
    <div className="space-y-5">
      {/* Élément audio local toujours monté pour ne jamais couper la lecture lors du changement d'onglet */}
      {localUrl && (
        <audio
          ref={localAudioRef}
          src={localUrl}
          data-track-title={fileName || "Visual Studio"}
          onTimeUpdate={(e) => {
            const t = e.currentTarget.currentTime;
            setLocalTime(t);
            applyClipFadeVolume(e.currentTarget, t);
          }}
          onSeeked={(e) => setLocalTime(e.currentTarget.currentTime)}
          className="hidden"
          aria-hidden="true"
        />
      )}

      {/* 1. En-tête Studio épuré & barre de transport */}
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-brand-white border-2 border-black shadow-comic-sm">
        <div className="flex items-center gap-3">
          <AvatarBD
            name="Visual Synth"
            expression="glitch"
            size="sm"
            badgeText="3D"
            anaglyphRing
            audioReactive={isPlaying || liveFeatures.rms > 0.08}
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-brand-black">
                Anarchy Visual <span className="text-brand-red">Studio</span>
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-brand-pearl border border-neutral-300 font-mono text-[10px] font-bold text-neutral-700">
                {activeDescriptor.name} · {bpm} BPM
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              {sourceMode === "LOCAL_FILE" && fileName
                ? `Piste locale : ${fileName}`
                : isPlaying && currentTrack
                ? `Open Hub : ${currentTrack.title}`
                : "Prêt — importe un MP3/WAV ou lance le lecteur Open Hub"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <Button
            variant={isPlaying ? "clinical" : "primary"}
            size="sm"
            onClick={
              sourceMode === "LOCAL_FILE" && analysis
                ? isPlaying
                  ? handlePauseSiteMusic
                  : handlePlayClipExtract
                : togglePlay
            }
          >
            {isPlaying ? "❚❚ Pause" : "▶ Lecture"}
          </Button>
          <Button
            id="btn-ve-fullscreen-top"
            variant="comic"
            size="sm"
            onClick={() => void toggleFullscreen()}
          >
            {isFullscreen ? "✕ Quitter Plein Écran" : "⛶ Plein Écran"}
          </Button>
          <button
            type="button"
            onClick={() => setShowAllPanels((v) => !v)}
            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-colors ${
              showAllPanels
                ? "bg-brand-black text-white border-black"
                : "bg-brand-pearl text-neutral-700 border-neutral-300 hover:border-black"
            }`}
            title="Basculer entre la vue épurée par onglets et tous les panneaux ouverts"
          >
            {showAllPanels ? "Vue épurée" : "Tout afficher"}
          </button>
          <Link
            href="/docs/visual-studio"
            className="px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-brand-pearl text-brand-black hover:border-black text-[11px] font-bold transition-colors"
          >
            Docs
          </Link>
        </div>
      </header>

      {/* 2. Cockpit principal : Moniteur Vidéo 3D (gauche) + Contrôles par onglets (droite) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* COLONNE GAUCHE : MONITEUR VIDÉO + PLEIN ÉCRAN + EXPORT */}
        <div className="xl:col-span-7 space-y-3">
          <div className="rounded-xl border-2 border-black bg-brand-white p-3 sm:p-4 shadow-comic-sm space-y-3">
            {/* Barre du moniteur : Format & Plein écran */}
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
              <div className="flex flex-wrap items-center gap-1.5">
                {(["16:9", "9:16", "4:5", "1:1"] as const).map((ratio) => {
                  const spec = VIDEO_ASPECT_FORMATS[ratio];
                  const active = aspectRatio === ratio;
                  return (
                    <button
                      key={ratio}
                      type="button"
                      id={`btn-aspect-${ratio.replace(":", "x")}`}
                      onClick={() => setAspectRatio(ratio)}
                      title={spec.label}
                      className={`px-2.5 py-1 rounded-md border font-bold transition-all ${
                        active
                          ? "bg-brand-black text-white border-black"
                          : "bg-brand-pearl text-neutral-700 border-neutral-300 hover:border-black"
                      }`}
                    >
                      {spec.shortLabel}
                    </button>
                  );
                })}
                {(aspectRatio === "9:16" || aspectRatio === "4:5") && (
                  <label className="ml-2 inline-flex items-center gap-1.5 font-bold text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showSafeZone}
                      onChange={(e) => setShowSafeZone(e.target.checked)}
                      className="accent-brand-red"
                    />
                    <span>Safe Zone</span>
                  </label>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-[10px] text-neutral-500">
                  {aspectSpec.width}×{aspectSpec.height}
                  {isLowPoly && renderReport
                    ? ` · ${renderReport.triangleCount} tri`
                    : ""}
                </span>
                <button
                  type="button"
                  id="btn-ve-fullscreen"
                  onClick={() => void toggleFullscreen()}
                  className="px-2.5 py-1 rounded-md border border-black bg-brand-pearl hover:bg-brand-red hover:text-white font-bold transition-colors"
                  title="Afficher le rendu 3D en plein écran"
                >
                  {isFullscreen ? "✕ Quitter" : "⛶ Plein écran"}
                </button>
              </div>
            </div>

            {/* Cadre Moniteur Vidéo (devient conteneur plein écran natif) */}
            <div
              ref={stageContainerRef}
              onDoubleClick={() => void toggleFullscreen()}
              className={
                isFullscreen
                  ? "fixed inset-0 z-50 bg-black flex items-center justify-center p-0 group"
                  : "relative rounded-xl border-2 border-black bg-[#07080b] p-2 flex justify-center group"
              }
            >
              <div
                className={
                  isFullscreen
                    ? "relative w-full h-full flex items-center justify-center"
                    : "relative"
                }
                style={
                  isFullscreen
                    ? undefined
                    : {
                        width:
                          aspectRatio === "9:16"
                            ? "min(100%, 270px)"
                            : aspectRatio === "4:5"
                            ? "min(100%, 340px)"
                            : aspectRatio === "1:1"
                            ? "min(100%, 360px)"
                            : "100%",
                      }
                }
              >
                <canvas
                  ref={stageCanvasRef}
                  width={aspectSpec.exportWidth}
                  height={aspectSpec.exportHeight}
                  role="img"
                  aria-label={activeDescriptor.ariaLabel}
                  className={
                    isFullscreen
                      ? "max-w-full max-h-full w-auto h-full object-contain bg-black block"
                      : "w-full h-auto rounded-lg bg-black block"
                  }
                  style={{
                    aspectRatio: `${aspectSpec.width} / ${aspectSpec.height}`,
                  }}
                />
                {showSafeZone &&
                  !isFullscreen &&
                  (aspectRatio === "9:16" || aspectRatio === "4:5") && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-lg border-2 border-dashed border-[#00E5FF]/60"
                    >
                      <div className="absolute top-[11%] left-[6%] right-[16%] bottom-[22%] border border-dashed border-brand-red/70 rounded">
                        <span className="inline-block bg-black/75 text-[#00E5FF] font-mono text-[8px] px-1">
                          SAFE ZONE {aspectRatio}
                        </span>
                      </div>
                    </div>
                  )}
              </div>

              {/* Overlay discret en mode Plein Écran */}
              {isFullscreen && (
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white font-mono text-xs opacity-90 hover:opacity-100 transition-opacity">
                  <span className="text-neutral-300">
                    {activeDescriptor.name} · {bpm} BPM
                  </span>
                  <button
                    type="button"
                    onClick={
                      sourceMode === "LOCAL_FILE" && analysis
                        ? isPlaying
                          ? handlePauseSiteMusic
                          : handlePlayClipExtract
                        : togglePlay
                    }
                    className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 font-bold"
                  >
                    {isPlaying ? "❚❚ Pause" : "▶ Lecture"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void toggleFullscreen()}
                    className="px-3 py-1 rounded-full bg-brand-red hover:bg-red-600 font-bold"
                  >
                    ✕ Quitter
                  </button>
                </div>
              )}
            </div>

            {/* Barre d'actions & Export MP4 compacte */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                <Button
                  id="btn-ve-undo"
                  variant="clinical"
                  size="sm"
                  disabled={historyPast.length === 0}
                  onClick={handleUndo}
                >
                  ↶ Undo
                </Button>
                <Button
                  id="btn-ve-redo"
                  variant="clinical"
                  size="sm"
                  disabled={historyFuture.length === 0}
                  onClick={handleRedo}
                >
                  ↷ Redo
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  id="btn-ve-snapshot"
                  variant="clinical"
                  size="sm"
                  onClick={handleExportSnapshot}
                >
                  ⬇ PNG
                </Button>
                <Button
                  id="btn-ve-video"
                  variant={isRecordingVideo ? "comic" : "primary"}
                  size="sm"
                  onClick={() => void handleToggleVideoExport()}
                >
                  {isRecordingVideo
                    ? "⏹ Stop & Sauver MP4"
                    : `🎬 Exporter MP4 (${clipDurationSeconds}s)`}
                </Button>
              </div>
            </div>

            {presetMessage && (
              <p
                role="status"
                className="px-3 py-2 rounded-lg bg-brand-pearl border-l-4 border-[#00E5FF] font-mono text-[11px] text-brand-black"
              >
                {presetMessage}
              </p>
            )}
            {presetError && (
              <p
                role="alert"
                className="px-3 py-2 rounded-lg bg-red-50 border-l-4 border-brand-red font-mono text-[11px] text-brand-red font-bold"
              >
                {presetError}
              </p>
            )}
          </div>
        </div>

        {/* COLONNE DROITE : PANNEAU DE CONTRÔLE À ONGLETS ÉPURÉS */}
        <div className="xl:col-span-5 space-y-4">
          {!showAllPanels && (
            <nav
              aria-label="Onglets de contrôle du studio"
              className="grid grid-cols-4 gap-1.5 p-1.5 rounded-xl bg-brand-pearl border-2 border-black font-mono text-[11px]"
            >
              {(
                [
                  { id: "faders", label: "🎚 Faders" },
                  { id: "audio", label: "🎵 Audio" },
                  { id: "variations", label: "🎨 Styles" },
                  { id: "lyrics", label: "🎤 Paroles" },
                ] as const
              ).map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-2 rounded-lg font-bold transition-all text-center ${
                      active
                        ? "bg-brand-black text-white shadow-comic-sm"
                        : "text-neutral-600 hover:text-brand-black hover:bg-brand-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          )}

          {/* ONGLET 1 : CONSOLE 10 FADERS */}
          {showFaders && (
            <Card
              moduleTitle="CONSOLE // 10_FADERS"
              moduleMeta="DOUBLE-CLIC = RESET"
              activeIndicator
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
                  {(
                    [
                      { id: "ALL", label: "Tous (10)" },
                      { id: "AUDIO", label: "Audio (3)" },
                      { id: "FX", label: "FX & Strobe (5)" },
                      { id: "CAMERA", label: "Caméra (2)" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setBankFilter(tab.id)}
                      className={[
                        "px-2.5 py-1 rounded-md font-bold border transition-all",
                        bankFilter === tab.id
                          ? "bg-brand-black text-white border-black"
                          : "bg-brand-pearl text-neutral-700 border-neutral-300 hover:border-black",
                      ].join(" ")}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {(bankFilter === "ALL" || bankFilter === "AUDIO") && (
                  <div className="space-y-2">
                    <div className="font-mono text-[10px] font-bold uppercase text-neutral-500">
                      Audio &amp; Puissance
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <ConsoleFader
                        id="fader-bass"
                        shortTag="BASS"
                        label="Basses"
                        value={bassGain}
                        min={0}
                        max={250}
                        defaultValue={110}
                        unit="%"
                        accent="red"
                        compact
                        liveMeter={Math.min(1, Math.sqrt(liveFeatures.bass))}
                        onChange={setBassGain}
                      />
                      <ConsoleFader
                        id="fader-treble"
                        shortTag="CLAP"
                        label="Aigus"
                        value={trebleGain}
                        min={0}
                        max={250}
                        defaultValue={125}
                        unit="%"
                        accent="cyan"
                        compact
                        liveMeter={Math.min(
                          1,
                          Math.max(
                            Math.sqrt(liveFeatures.treble),
                            Math.sqrt(liveFeatures.spectralFlux) * 2
                          )
                        )}
                        onChange={setTrebleGain}
                      />
                      <ConsoleFader
                        id="fader-intensity"
                        shortTag="MSTR"
                        label="Master"
                        value={Math.round(preset.intensity * 100)}
                        min={0}
                        max={100}
                        defaultValue={75}
                        unit="%"
                        accent="red"
                        compact
                        locked={Boolean(preset.locks["intensity"])}
                        liveMeter={liveFeatures.rms}
                        onToggleLock={() => toggleLock("intensity")}
                        onChange={(val) =>
                          updatePreset((curr) => ({ ...curr, intensity: val / 100 }))
                        }
                      />
                    </div>
                  </div>
                )}

                {(bankFilter === "ALL" || bankFilter === "FX") && (
                  <div className="space-y-2 pt-2 border-t border-neutral-200">
                    <div className="font-mono text-[10px] font-bold uppercase text-neutral-500">
                      Strobe, Blackout &amp; Psyché
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <ConsoleFader
                        id="fader-strobe"
                        shortTag="FLASH"
                        label="Strobe"
                        value={Math.round((preset.effects.strobeGlow ?? 0.45) * 100)}
                        min={0}
                        max={100}
                        defaultValue={45}
                        unit="%"
                        accent="red"
                        compact
                        locked={Boolean(preset.locks["effects.strobeGlow"])}
                        liveMeter={Math.min(
                          1,
                          Math.max(
                            Math.sqrt(liveFeatures.treble),
                            Math.sqrt(liveFeatures.spectralFlux) * 2
                          )
                        )}
                        onToggleLock={() => toggleLock("effects.strobeGlow")}
                        onChange={(val) =>
                          updatePreset((curr) => ({
                            ...curr,
                            effects: { ...curr.effects, strobeGlow: val / 100 },
                          }))
                        }
                      />
                      <ConsoleFader
                        id="fader-blackout"
                        shortTag="KICK"
                        label="Blackout"
                        value={Math.round((preset.effects.kickBlackout ?? 0) * 100)}
                        min={0}
                        max={100}
                        defaultValue={0}
                        unit="%"
                        accent="red"
                        compact
                        locked={Boolean(preset.locks["effects.kickBlackout"])}
                        onToggleLock={() => toggleLock("effects.kickBlackout")}
                        onChange={(val) =>
                          updatePreset((curr) => ({
                            ...curr,
                            effects: { ...curr.effects, kickBlackout: val / 100 },
                          }))
                        }
                      />
                      <ConsoleFader
                        id="fader-psyche"
                        shortTag="PSYCHE"
                        label="Psyché"
                        value={Math.round((preset.effects.psychedelic ?? 0) * 100)}
                        min={0}
                        max={100}
                        defaultValue={0}
                        unit="%"
                        accent="cyan"
                        compact
                        locked={Boolean(preset.locks["effects.psychedelic"])}
                        onToggleLock={() => toggleLock("effects.psychedelic")}
                        onChange={(val) =>
                          updatePreset((curr) => ({
                            ...curr,
                            effects: { ...curr.effects, psychedelic: val / 100 },
                          }))
                        }
                      />
                      <ConsoleFader
                        id="fader-morph"
                        shortTag="MORPH"
                        label="Morph"
                        value={Math.round((preset.effects.colorTransition ?? 0) * 100)}
                        min={0}
                        max={100}
                        defaultValue={0}
                        unit="%"
                        accent="cyan"
                        compact
                        locked={Boolean(preset.locks["effects.colorTransition"])}
                        onToggleLock={() => toggleLock("effects.colorTransition")}
                        onChange={(val) =>
                          updatePreset((curr) => ({
                            ...curr,
                            effects: { ...curr.effects, colorTransition: val / 100 },
                          }))
                        }
                      />
                      <ConsoleFader
                        id="fader-anaglyph"
                        shortTag="3D-FX"
                        label="Anaglyph"
                        value={Math.round((preset.effects.anaglyphSplit ?? 0.16) * 100)}
                        min={0}
                        max={100}
                        defaultValue={16}
                        unit="%"
                        accent="red"
                        compact
                        locked={Boolean(preset.locks["effects.anaglyphSplit"])}
                        onToggleLock={() => toggleLock("effects.anaglyphSplit")}
                        onChange={(val) =>
                          updatePreset((curr) => ({
                            ...curr,
                            effects: { ...curr.effects, anaglyphSplit: val / 100 },
                          }))
                        }
                      />
                    </div>
                  </div>
                )}

                {(bankFilter === "ALL" || bankFilter === "CAMERA") && (
                  <div className="space-y-2 pt-2 border-t border-neutral-200">
                    <div className="font-mono text-[10px] font-bold uppercase text-neutral-500">
                      Caméra
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <ConsoleFader
                        id="fader-cam-zoom"
                        shortTag="ZOOM"
                        label="Zoom"
                        value={
                          preset.render.camera.kind === "orthographic"
                            ? Math.round(preset.render.camera.zoom * 100)
                            : Math.round(
                                (1 / Math.max(0.45, preset.render.camera.distance)) *
                                  100
                              )
                        }
                        min={50}
                        max={220}
                        defaultValue={100}
                        unit="%"
                        accent="cyan"
                        compact
                        locked={Boolean(
                          preset.render.camera.kind === "orthographic"
                            ? preset.locks["render.camera.zoom"]
                            : preset.locks["render.camera.distance"]
                        )}
                        onToggleLock={() =>
                          toggleLock(
                            preset.render.camera.kind === "orthographic"
                              ? "render.camera.zoom"
                              : "render.camera.distance"
                          )
                        }
                        onChange={(val) =>
                          updatePreset((curr) =>
                            curr.render.style === "pixel-16"
                              ? {
                                  ...curr,
                                  render: {
                                    ...curr.render,
                                    camera: {
                                      ...curr.render.camera,
                                      zoom: val / 100,
                                    },
                                  },
                                }
                              : {
                                  ...curr,
                                  render: {
                                    ...curr.render,
                                    camera: {
                                      ...curr.render.camera,
                                      distance: 100 / Math.max(50, val),
                                    },
                                  },
                                }
                          )
                        }
                      />
                      <ConsoleFader
                        id="fader-pendulum"
                        shortTag="SWAY"
                        label="Pendule"
                        value={Math.round(
                          (preset.effects.pendulumSwing ?? 0.25) * 100
                        )}
                        min={0}
                        max={100}
                        defaultValue={25}
                        unit="%"
                        accent="cyan"
                        compact
                        locked={Boolean(preset.locks["effects.pendulumSwing"])}
                        onToggleLock={() => toggleLock("effects.pendulumSwing")}
                        onChange={(val) =>
                          updatePreset((curr) => ({
                            ...curr,
                            effects: { ...curr.effects, pendulumSwing: val / 100 },
                          }))
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* ONGLET 2 : AUDIO & BPM */}
          {showAudio && (
            <Card
              moduleTitle="AUDIO_&_BPM // SOURCE_&_EXTRAIT"
              moduleMeta="MP3 / WAV (70 MO) · SYNC"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <button
                      type="button"
                      onClick={() => setSourceMode("LIVE_HUB")}
                      className={`px-2.5 py-1 rounded-md border font-bold ${
                        sourceMode === "LIVE_HUB"
                          ? "bg-brand-red text-white border-black"
                          : "bg-brand-pearl text-neutral-700 border-neutral-300"
                      }`}
                    >
                      Lecteur Hub
                    </button>
                    <button
                      type="button"
                      onClick={() => setSourceMode("LOCAL_FILE")}
                      disabled={!analysis}
                      className={`px-2.5 py-1 rounded-md border font-bold disabled:opacity-40 ${
                        sourceMode === "LOCAL_FILE"
                          ? "bg-brand-black text-white border-black"
                          : "bg-brand-pearl text-neutral-700 border-neutral-300"
                      }`}
                    >
                      Fichier local
                    </button>
                  </div>
                  <Button
                    id="btn-load-demo-wav"
                    variant="comic"
                    size="sm"
                    disabled={busy}
                    onClick={() => void handleFileLoad(createSyntheticDemoWavFile())}
                  >
                    ⚡ Démo WAV
                  </Button>
                </div>

                <div className="p-3 rounded-lg bg-brand-pearl border border-neutral-300">
                  <label
                    htmlFor="ve-audio-file"
                    className="block font-mono text-[11px] font-bold text-brand-black mb-1.5"
                  >
                    Importer MP3 ou WAV (max 70 Mio)
                  </label>
                  <input
                    id="ve-audio-file"
                    type="file"
                    accept=".mp3,.wav,audio/mpeg,audio/wav"
                    disabled={busy}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      if (f) void handleFileLoad(f);
                    }}
                    className="w-full font-mono text-[11px] file:mr-2 file:px-2.5 file:py-1 file:rounded file:border file:border-black file:bg-brand-white file:text-[11px] file:font-bold file:cursor-pointer"
                  />
                  <p role="status" aria-live="polite" className="mt-1.5 font-mono text-[11px] text-neutral-600">
                    {importStatus}
                  </p>
                  {busy && (
                    <Button
                      variant="clinical"
                      size="sm"
                      onClick={() => {
                        abortControllerRef.current?.abort();
                        setBusy(false);
                        setImportStatus("Import annulé.");
                      }}
                    >
                      Annuler
                    </Button>
                  )}
                  {importError && (
                    <p role="alert" className="mt-1 font-mono text-[11px] text-brand-red font-bold">
                      {importError}
                    </p>
                  )}
                  {importWarning && (
                    <p className="mt-1 font-mono text-[11px] text-amber-700">
                      {importWarning}
                    </p>
                  )}
                </div>

                {analysis && (
                  <div className="space-y-3 pt-2 border-t border-neutral-200">
                    <WaveformCanvas
                      analysis={analysis}
                      time={localTime}
                      onSeek={seekLocalAudio}
                      clipActive={clipActive}
                      clipStartSeconds={clipStartSeconds}
                      clipDurationSeconds={clipDurationSeconds}
                      fadeInSeconds={fadeInSeconds}
                      fadeOutSeconds={fadeOutSeconds}
                      onClipStartChange={setClipStartSeconds}
                    />

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3 font-mono text-[11px]">
                        <label className="inline-flex items-center gap-1.5 font-bold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={clipActive}
                            onChange={(e) => setClipActive(e.target.checked)}
                            className="accent-brand-red"
                          />
                          <span>Extrait ({clipDurationSeconds}s)</span>
                        </label>
                        <label className="inline-flex items-center gap-1.5 font-bold text-brand-red cursor-pointer">
                          <input
                            type="checkbox"
                            checked={clipLoop}
                            onChange={(e) => setClipLoop(e.target.checked)}
                            className="accent-brand-red"
                          />
                          <span>Boucle</span>
                        </label>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="comic"
                          size="sm"
                          onClick={handlePlayClipExtract}
                        >
                          ▶ Extrait
                        </Button>
                        <Button
                          id="btn-ve-global-pause"
                          variant="clinical"
                          size="sm"
                          onClick={handlePauseSiteMusic}
                        >
                          ⏸ Pause
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                      <div>
                        <div className="flex justify-between mb-0.5">
                          <span>Durée</span>
                          <strong>{clipDurationSeconds}s</strong>
                        </div>
                        <input
                          type="range"
                          min={5}
                          max={120}
                          step={1}
                          value={clipDurationSeconds}
                          onChange={(e) => setClipDurationSeconds(Number(e.target.value))}
                          className="w-full accent-brand-red"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-0.5">
                          <span>Fade In</span>
                          <strong>{fadeInSeconds.toFixed(1)}s</strong>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={5}
                          step={0.1}
                          value={fadeInSeconds}
                          onChange={(e) => setFadeInSeconds(Number(e.target.value))}
                          className="w-full accent-brand-red"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-0.5">
                          <span>Fade Out</span>
                          <strong>{fadeOutSeconds.toFixed(1)}s</strong>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={5}
                          step={0.1}
                          value={fadeOutSeconds}
                          onChange={(e) => setFadeOutSeconds(Number(e.target.value))}
                          className="w-full accent-brand-red"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-200 space-y-2.5 font-mono text-[11px]">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <span className="font-bold mr-1">BPM :</span>
                          <button
                            type="button"
                            onClick={() => setBpm((b) => Math.max(40, Math.round(b / 2)))}
                            className="px-1.5 py-0.5 rounded border border-neutral-400 bg-brand-white text-[10px] font-bold"
                          >
                            ÷2
                          </button>
                          <button
                            type="button"
                            onClick={() => setBpm((b) => Math.max(40, b - 1))}
                            className="px-1.5 py-0.5 rounded border border-neutral-400 bg-brand-white text-[10px] font-bold"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            aria-label="BPM manuel"
                            min={40}
                            max={240}
                            value={bpm}
                            onChange={(e) => {
                              const v = Number(e.target.value);
                              if (Number.isFinite(v)) {
                                setBpm(Math.max(40, Math.min(240, Math.round(v))));
                              }
                            }}
                            className="w-14 px-1 py-0.5 rounded border border-black bg-brand-white text-center font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => setBpm((b) => Math.min(240, b + 1))}
                            className="px-1.5 py-0.5 rounded border border-neutral-400 bg-brand-white text-[10px] font-bold"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => setBpm((b) => Math.min(240, Math.round(b * 2)))}
                            className="px-1.5 py-0.5 rounded border border-neutral-400 bg-brand-white text-[10px] font-bold"
                          >
                            ×2
                          </button>
                        </div>

                        <select
                          value={autoSceneSwitchBeats}
                          onChange={(e) => setAutoSceneSwitchBeats(Number(e.target.value))}
                          className="px-2 py-1 rounded border border-black bg-brand-white text-[11px] font-bold"
                          aria-label="Switch scènes par mesures"
                        >
                          <option value={0}>Switch : HOLD (Manuel)</option>
                          <option value={4}>Switch : 1 mesure (4T)</option>
                          <option value={8}>Switch : 2 mesures (8T)</option>
                          <option value={16}>Switch : 4 mesures (16T)</option>
                          <option value={32}>Switch : 8 mesures (32T)</option>
                          <option value={64}>Switch : 16 mesures (64T)</option>
                          <option value={128}>Switch : 32 mesures (128T)</option>
                          <option value={256}>Switch : 64 mesures (256T)</option>
                        </select>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-[160px]">
                          <span className="text-[10px] text-neutral-600">
                            Offset {beatOffset.toFixed(2)}s
                          </span>
                          <input
                            type="range"
                            min={-2}
                            max={2}
                            step={0.01}
                            value={beatOffset}
                            onChange={(e) => {
                              const nextOffset = Number(e.target.value);
                              setBeatOffset(nextOffset);
                              setSceneAnchorSeconds(nextOffset);
                            }}
                            className="flex-1 accent-brand-red"
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="clinical"
                            size="sm"
                            onClick={() => {
                              const t = localAudioRef.current?.currentTime ?? localTime;
                              const beatDur = 60 / Math.max(40, bpm);
                              const phase = Number((t % beatDur).toFixed(2));
                              setBeatOffset(phase);
                              setSceneAnchorSeconds(t);
                              if (autoSceneSwitchBeats === 0) setAutoSceneSwitchBeats(16);
                              setPresetMessage(
                                `1er temps calé à ${t.toFixed(2)}s (${bpm} BPM).`
                              );
                            }}
                          >
                            ⚡ Caler 1er temps
                          </Button>
                          <Button
                            variant="clinical"
                            size="sm"
                            onClick={handleAutoSyncScenesToAudio}
                          >
                            ⏱ Auto BPM
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mini jauges audio temps réel */}
                <div className="grid grid-cols-5 gap-1.5 pt-1 font-mono text-[9px]">
                  {(
                    [
                      ["RMS", liveFeatures.rms],
                      ["BASS", Math.sqrt(Math.max(0, liveFeatures.bass))],
                      ["MID", Math.sqrt(Math.max(0, liveFeatures.mid))],
                      ["HIGH", Math.sqrt(Math.max(0, liveFeatures.treble))],
                      ["FLUX", Math.min(1, Math.sqrt(Math.max(0, liveFeatures.spectralFlux)) * 2)],
                    ] as const
                  ).map(([label, val]) => (
                    <div key={label} className="p-1.5 rounded bg-brand-pearl border border-neutral-200">
                      <div className="font-bold text-neutral-500">{label}</div>
                      <meter
                        aria-label={label}
                        min={0}
                        max={1}
                        value={Math.min(1, Math.max(0, val))}
                        className="w-full h-1.5 mt-1"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await clearAnalysisCache();
                        setImportWarning("Cache FFT vidé.");
                      } catch {
                        setImportWarning("Impossible de vider le cache.");
                      }
                    }}
                    className="font-mono text-[10px] text-neutral-500 hover:text-brand-red underline"
                  >
                    Vider le cache FFT
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* ONGLET 3 : VARIATIONS & COULEURS */}
          {showVariations && (
            <Card
              moduleTitle="STYLES_&_VARIATIONS // 3D"
              moduleMeta="4 VARIATIONS RAPIDES"
              activeIndicator={activeVariationIdx !== null}
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-neutral-600">
                    Clique pour tester une variation sans couper l&apos;audio :
                  </span>
                  <div className="flex items-center gap-1.5">
                    {useCustomPalette && (
                      <button
                        type="button"
                        onClick={() => {
                          useCustomPaletteRef.current = false;
                          setUseCustomPalette(false);
                          setActiveVariationIdx(null);
                        }}
                        className="font-mono text-[10px] font-bold px-2 py-1 rounded border border-black bg-brand-pearl hover:bg-brand-white"
                      >
                        ↺ Couleurs Pack
                      </button>
                    )}
                    <Button
                      id="btn-ve-variations"
                      variant="clinical"
                      size="sm"
                      onClick={handleGenerateVariations}
                    >
                      🎲 Nouvelles
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {variations.map((v, idx) => {
                    const isSelected = activeVariationIdx === idx;
                    const sceneName =
                      SCENE_CATALOG.find((s) => s.id === v.sceneId)?.name ??
                      v.sceneId;
                    const paletteName =
                      STUDY_PALETTES.find((p) => p.id === v.paletteId)?.name ??
                      v.paletteId;
                    return (
                      <button
                        key={`${v.seed}-${idx}`}
                        type="button"
                        onClick={() => handleApplyVariation(v, idx)}
                        className={`p-2.5 rounded-lg border-2 font-mono text-xs font-bold text-left transition-all ${
                          isSelected
                            ? "border-black bg-brand-red text-white shadow-comic-sm"
                            : "border-black bg-brand-pearl hover:bg-brand-white text-brand-black"
                        }`}
                      >
                        <div className="truncate">{sceneName}</div>
                        <div
                          className={`text-[10px] truncate mt-0.5 ${
                            isSelected ? "text-white/90" : "text-neutral-500"
                          }`}
                        >
                          {paletteName}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}

          {/* ONGLET 4 : PAROLES & WHISPER LRC */}
          {showLyrics && (
            <Card
              moduleTitle="PAROLES_&_LRC"
              moduleMeta={
                timedWords.length > 0
                  ? `WHISPER (${timedWords.length} MOTS)`
                  : "BITMAP 3D"
              }
              activeIndicator={lyricsEnabled}
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor="ve-lyrics-toggle"
                    className="inline-flex items-center gap-2 font-mono text-xs font-bold text-brand-black cursor-pointer"
                  >
                    <input
                      id="ve-lyrics-toggle"
                      type="checkbox"
                      checked={lyricsEnabled}
                      onChange={(e) => setLyricsEnabled(e.target.checked)}
                      className="accent-brand-red w-4 h-4"
                    />
                    <span>Afficher sur la vidéo</span>
                  </label>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <Button
                      id="btn-ve-whisper"
                      variant="primary"
                      size="sm"
                      disabled={whisperBusy}
                      onClick={() => void handleWhisperTranscribe()}
                    >
                      {whisperBusy ? "⏳..." : "✨ Whisper"}
                    </Button>
                    <Button
                      id="btn-ve-timecode"
                      variant="clinical"
                      size="sm"
                      onClick={handleInsertLrcTimecode}
                    >
                      ⏱ +TC
                    </Button>
                    <Button
                      id="btn-ve-mic"
                      variant={speechActive ? "primary" : "comic"}
                      size="sm"
                      onClick={handleSpeechMic}
                    >
                      {speechActive ? "● Micro" : "🎙 Micro"}
                    </Button>
                  </div>
                </div>

                {whisperStatus && (
                  <p
                    role="status"
                    className="p-2 rounded bg-brand-pearl border-l-4 border-[#00E5FF] font-mono text-[11px] text-brand-black"
                  >
                    {whisperStatus}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    id="ve-lyrics-style"
                    aria-label="Style typographique pixel"
                    value={lyricsStyle}
                    onChange={(e) =>
                      setLyricsStyle(e.target.value as LyricsDisplayStyle)
                    }
                    className="flex-1 px-2.5 py-1.5 rounded-lg border-2 border-black bg-brand-white font-mono text-xs font-bold"
                  >
                    <option value="cinema-sub">Sous-titre Cinéma 16-bit</option>
                    <option value="center-impact">Impact Central Brutaliste</option>
                    <option value="hud-terminal">Terminal HUD Haut</option>
                    <option value="psyche-wave">Onde Psychédélique</option>
                  </select>

                  <Button
                    type="button"
                    variant="comic"
                    size="sm"
                    onClick={() => {
                      const scenarioPrompt = `Transforme ces paroles en scénario LRC horodaté pour Anarchy Visual Studio (${bpm} BPM, extrait ${clipStartSeconds.toFixed(1)}s → ${(clipStartSeconds + clipDurationSeconds).toFixed(1)}s) :\nFormat exact par ligne : [mm:ss.xx] #SECTION TEXTE COURT\nSections disponibles : #INTRO, #COUPLET, #PRE_DROP, #DROP, #REFRAIN, #OUTRO.\nGarde 3 à 6 mots max par ligne pour un rendu TikTok / 9:16 lisible.`;
                      navigator.clipboard
                        ?.writeText(scenarioPrompt)
                        .then(() =>
                          setWhisperStatus(
                            "📋 Prompt IA Scénario LRC copié !"
                          )
                        )
                        .catch(() => {});
                    }}
                  >
                    📋 Prompt LRC
                  </Button>
                </div>

                <textarea
                  id="ve-lyrics-text"
                  rows={4}
                  value={lyricsText}
                  onChange={(e) => {
                    setLyricsText(e.target.value);
                    if (timedWords.length > 0) setTimedWords([]);
                  }}
                  placeholder="[00:00.00] #INTRO ANARCHY VISUAL ENGINE"
                  className="w-full p-2.5 rounded-lg border-2 border-black bg-brand-pearl font-mono text-xs text-brand-black focus:outline-none focus:border-brand-red"
                />
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* 3. Packs de Scènes 3D & JSON Composer */}
      <ScenePackManager
        authorName="Anarchy Studio"
        liveSlotIndex={livePackSlotIndex}
        bpm={bpm}
        beatsPerScene={autoSceneSwitchBeats}
        onChangeBeatsPerScene={setAutoSceneSwitchBeats}
        onPackChange={(pack: ScenePack) => {
          activePackRef.current = pack;
        }}
        onSelectSlot={(
          slotIndex: number,
          slot: ScenePackSlot,
          pack: ScenePack
        ) => {
          activePackRef.current = pack;
          livePackSlotIndexRef.current = slotIndex;
          setLivePackSlotIndex(slotIndex);
          updatePreset(
            (curr) => ({
              ...curr,
              sceneId: slot.sceneId ?? curr.sceneId,
              paletteId: useCustomPaletteRef.current
                ? curr.paletteId
                : slot.paletteId ?? curr.paletteId,
              seed: slot.seed ?? curr.seed,
            }),
            false
          );
        }}
      />
    </div>
  );
};

export default VisualEngineStudio;


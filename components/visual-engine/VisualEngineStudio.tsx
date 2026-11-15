"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
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
import {
  CPP_SHADER_ENABLED_KEY,
  CPP_SHADER_STORAGE_KEY,
  compileCppVisual,
  createCppRenderContext,
  type CppRenderContext,
} from "@/lib/visual-engine/cpp-runtime";
import { WaveformCanvas } from "@/components/visual-engine/WaveformCanvas";
import {
  type AudioAnalysis,
  type AudioFeatures,
  type LyricsDisplayStyle,
  type PaletteId,
  type PresetParameterPath,
  type RetroPresetConfig,
  type StudioProject,
} from "@/lib/visual-engine/contracts";
import {
  createAudioFeatureAccessor,
  createSyntheticDemoWavFile,
  estimateTempoBpm,
  extractLiveFeaturesFromBuffers,
} from "@/lib/visual-engine/audioAnalysis";
import { clearAnalysisCache } from "@/lib/visual-engine/cache";
import { importAudio } from "@/lib/visual-engine/importAudio";
import {
  createDefaultStudioProject,
  evaluateSequenceAt,
  generatePresetVariations,
} from "@/lib/visual-engine/presets";
import {
  STUDY_FPS,
  STUDY_PALETTES,
  STUDY_SIZE,
  getSceneDescriptor,
  renderSceneFrame,
  type SceneRenderReport,
} from "@/lib/visual-engine/renderer";

type AudioSourceMode = "LIVE_HUB" | "LOCAL_FILE";
type BankFilter = "ALL" | "AUDIO" | "FX" | "CAMERA";

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
 * - Packs de 5 scènes enchaînées au BPM + 4 Variations rapides & Changement de couleur / Color Morph
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

  // Paroles incrustées & Micro
  const [lyricsEnabled, setLyricsEnabled] = useState<boolean>(false);
  const [lyricsText, setLyricsText] = useState<string>(
    "ANARCHY VISUAL ENGINE\nTECHNO THERAPY LOCKED\nOPEN HUB 3D"
  );
  const [lyricsStyle, setLyricsStyle] =
    useState<LyricsDisplayStyle>("cinema-sub");
  const [speechActive, setSpeechActive] = useState<boolean>(false);

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

  // Fenêtres / Onglets fermables et modulables
  const [showAudioPanel, setShowAudioPanel] = useState<boolean>(true);
  const [showStagePanel, setShowStagePanel] = useState<boolean>(true);
  const [showMatrixPanel, setShowMatrixPanel] = useState<boolean>(true);
  const [showFadersPanel, setShowFadersPanel] = useState<boolean>(true);
  const [showLyricsPanel, setShowLyricsPanel] = useState<boolean>(true);

  const stageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const prevFreqRef = useRef<Uint8Array>(new Uint8Array(128));
  const smoothedFeaturesRef = useRef<AudioFeatures>({ ...ZERO_FEATURES });
  const timeAccumRef = useRef<number>(0);
  const cppFnRef = useRef<((ctx: CppRenderContext) => void) | null>(null);

  useEffect(() => {
    const loadCppShader = () => {
      try {
        const enabled =
          window.localStorage.getItem(CPP_SHADER_ENABLED_KEY) === "true";
        const code = window.localStorage.getItem(CPP_SHADER_STORAGE_KEY);
        if (enabled && code) {
          const compiled = compileCppVisual(code);
          cppFnRef.current = compiled.ok ? compiled.fn : null;
        } else {
          cppFnRef.current = null;
        }
      } catch {
        cppFnRef.current = null;
      }
    };
    loadCppShader();
    window.addEventListener("storage", loadCppShader);
    window.addEventListener("focus", loadCppShader);
    return () => {
      window.removeEventListener("storage", loadCppShader);
      window.removeEventListener("focus", loadCppShader);
    };
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
      if (autoSceneSwitchBeats > 0 && pack.scenes.length > 0) {
        const beatFloat = Math.max(0, (timeSeconds - beatOffset) * (bpm / 60));
        const slotIdx =
          Math.floor(beatFloat / autoSceneSwitchBeats) % pack.scenes.length;
        activeSlot = pack.scenes[slotIdx];
        if (livePackSlotIndexRef.current !== slotIdx) {
          livePackSlotIndexRef.current = slotIdx;
          setLivePackSlotIndex(slotIdx);
        }
      }

      const canvas = stageCanvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (ctx) {
        const nextReport = renderSceneFrame(ctx, {
          sceneId: activeSlot ? activeSlot.sceneId : effectivePreset.sceneId,
          paletteId:
            useCustomPaletteRef.current || !activeSlot
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
        });

        if (cppFnRef.current) {
          try {
            const beatFloat = Math.max(0, (timeSeconds - beatOffset) * (bpm / 60));
            const cppCtx = createCppRenderContext(ctx, 320, 180, {
              t: timeSeconds,
              bpm,
              beat: Math.floor(beatFloat),
              beatPhase: beatFloat - Math.floor(beatFloat),
              bass: nextReport.audio.bassEnvelope,
              mid: nextReport.audio.midEnvelope,
              treble: nextReport.audio.trebleEnvelope,
              rms: nextReport.audio.rmsEnvelope,
              flux: nextReport.audio.transientPulse,
              sceneIndex: livePackSlotIndexRef.current,
            });
            cppFnRef.current(cppCtx);
          } catch {
            // ignore runtime errors from custom C++
          }
        }

        setRenderReport(nextReport);
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [
    analysis,
    applyClipFadeVolume,
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
    sourceMode,
    stopActiveRecording,
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
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = 1280;
    exportCanvas.height = 720;
    const ectx = exportCanvas.getContext("2d");
    if (!ectx) return;
    ectx.imageSmoothingEnabled = false;
    ectx.drawImage(src, 0, 0, 1280, 720);
    const url = exportCanvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `anarchy-visual-${preset.sceneId}-${preset.paletteId}-${preset.seed}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
      const videoStream = canvas.captureStream(30);
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
            "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
            "video/mp4;codecs=avc1,mp4a",
            "video/mp4",
            "video/webm;codecs=vp9,opus",
            "video/webm;codecs=vp8,opus",
            "video/webm",
          ]
        : [
            "video/mp4;codecs=avc1",
            "video/mp4",
            "video/webm;codecs=vp9",
            "video/webm",
          ];
      const mimeType =
        candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
      const recorder = mimeType
        ? new MediaRecorder(combinedStream, { mimeType })
        : new MediaRecorder(combinedStream);

      recordedChunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          recordedChunksRef.current.push(ev.data);
        }
      };
      recorder.onstop = () => {
        const finalType = recorder.mimeType || mimeType || "video/webm";
        const ext = finalType.includes("mp4") ? "mp4" : "webm";
        const blob = new Blob(recordedChunksRef.current, { type: finalType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `anarchy-visual-${clipStartSeconds.toFixed(0)}s-${clipDurationSeconds}s.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        isRecordingVideoRef.current = false;
        setIsRecordingVideo(false);
        setPresetMessage(
          `Extrait vidéo + son exporté (.${ext.toUpperCase()} · ${clipDurationSeconds}s) !`
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
        `⏺ Enregistrement de la zone prévisualisée (${clipStartSeconds.toFixed(1)}s → ${(clipStartSeconds + clipDurationSeconds).toFixed(1)}s · ${hasAudioTrack ? "Son inclus" : "Vidéo seule"})...`
      );
    } catch {
      isRecordingVideoRef.current = false;
      setIsRecordingVideo(false);
      setPresetError("Impossible de démarrer l'enregistrement MP4.");
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

  return (
    <div className="space-y-8">
      {/* 1. Bandeau En-tête Anarchy Visual Design */}
      <Card
        moduleTitle="ANARCHY_VISUAL_DESIGN // STUDIO_10_FADERS"
        moduleMeta={`${activeDescriptor.badge} // 10_CONSOLE_FADERS`}
        activeIndicator={isPlaying || sourceMode === "LOCAL_FILE"}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <AvatarBD
              name="Visual Synth"
              expression="glitch"
              size="lg"
              badgeText="FX"
              anaglyphRing
              audioReactive={isPlaying || liveFeatures.rms > 0.08}
            />
            <div className="space-y-1.5">
              <div className="inline-flex flex-wrap items-center gap-2 font-mono text-[11px] font-bold uppercase text-brand-red">
                <span className="px-2 py-0.5 rounded bg-brand-pearl border-2 border-black shadow-comic-sm text-brand-black">
                  TEVATEVA21 / ANARCHY-VISUAL-ENGINE v2.0
                </span>
                <span>{"// 320x180 NEAREST-NEIGHBOR + 32-BIT PS1 + 10 FADERS"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-black">
                Anarchy Visual Design{" "}
                <span className="text-brand-red underline decoration-4 underline-offset-4">
                  Studio
                </span>
              </h1>
              <p className="text-sm text-neutral-600 max-w-2xl">
                Packs de 5 scènes génératives, flash strobe aigu sur clap, psychédélie &amp; caméra,
                éditeur C++ live et export MP4 avec son sur votre extrait audio.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 font-mono text-[11px]">
            <span className="px-2.5 py-1 rounded border-2 border-black bg-brand-pearl text-brand-black font-bold">
              SEED #{preset.seed}
            </span>
            <span className="px-2.5 py-1 rounded border-2 border-black bg-brand-white text-brand-red font-bold">
              {bpm} BPM · {clipStartSeconds.toFixed(1)}s → {(clipStartSeconds + clipDurationSeconds).toFixed(1)}s
            </span>
          </div>
        </div>
      </Card>

      {/* Barre de fenêtres modulables & fermables */}
      <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-brand-pearl border-2 border-black shadow-comic-sm font-mono text-xs">
        <span className="font-bold text-brand-red uppercase mr-1">
          {"// FENÊTRES :"}
        </span>
        {[
          { label: "🎵 AUDIO & EXTRAIT 30S", open: showAudioPanel, toggle: () => setShowAudioPanel((v) => !v) },
          { label: "📺 MONITEUR VIDÉO", open: showStagePanel, toggle: () => setShowStagePanel((v) => !v) },
          { label: "🎨 COULEURS & VARIATIONS", open: showMatrixPanel, toggle: () => setShowMatrixPanel((v) => !v) },
          { label: "🎚 CONSOLE 10 FADERS", open: showFadersPanel, toggle: () => setShowFadersPanel((v) => !v) },
          { label: "🎤 PAROLES & MICRO", open: showLyricsPanel, toggle: () => setShowLyricsPanel((v) => !v) },
        ].map((win) => (
          <button
            key={win.label}
            type="button"
            onClick={win.toggle}
            className={`px-3 py-1.5 rounded-lg border-2 font-bold transition-all ${
              win.open
                ? "bg-brand-black text-white border-black shadow-comic-sm"
                : "bg-brand-white text-neutral-500 border-neutral-300 hover:border-black"
            }`}
          >
            {win.open ? "✓ " : "+ "}
            {win.label}
          </button>
        ))}
      </div>

      {showAudioPanel && (
      <div className="space-y-4">
          <Card
            moduleTitle="AUDIO_LAB // FFT_24KHZ_&_OPENHUB_SYNC"
            moduleMeta="MONO / STÉRÉO · INDEXEDDB (MAX 5)"
          >
            <div className="space-y-4">
              {/* Choix source : Lecteur Open Hub persistant OU Piste MP3/WAV locale */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSourceMode("LIVE_HUB")}
                    className={`px-3 py-1.5 rounded-lg border-2 font-mono text-xs font-bold transition-all ${
                      sourceMode === "LIVE_HUB"
                        ? "bg-brand-red text-white border-black shadow-comic-sm"
                        : "bg-brand-pearl text-brand-charcoal border-neutral-300"
                    }`}
                  >
                    SYNCHRO LECTEUR OPEN HUB
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceMode("LOCAL_FILE")}
                    disabled={!analysis}
                    className={`px-3 py-1.5 rounded-lg border-2 font-mono text-xs font-bold transition-all disabled:opacity-50 ${
                      sourceMode === "LOCAL_FILE"
                        ? "bg-black text-white border-black shadow-comic-sm"
                        : "bg-brand-pearl text-brand-charcoal border-neutral-300"
                    }`}
                  >
                    PISTE LOCALE ANALYSÉE
                  </button>
                </div>

                {sourceMode === "LIVE_HUB" && (
                  <Button
                    variant="clinical"
                    size="sm"
                    onClick={togglePlay}
                  >
                    {isPlaying
                      ? `❚❚ PAUSE (${currentTrack?.title ?? "SIGNAL"})`
                      : "▶ PLAY LECTEUR OPEN HUB"}
                  </Button>
                )}
              </div>

              {/* Zone upload + bouton Démo WAV 1-clic */}
              <div className="p-4 rounded-xl bg-brand-pearl border-2 border-dashed border-neutral-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <label
                    htmlFor="ve-audio-file"
                    className="block font-mono text-xs font-bold uppercase text-brand-black mb-1.5"
                  >
                    Importer MP3 ou WAV (max 50 Mio · 5 min)
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
                    className="font-mono text-xs file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-2 file:border-black file:bg-brand-white file:font-mono file:text-xs file:font-bold file:cursor-pointer"
                  />
                </div>
                <Button
                  id="btn-load-demo-wav"
                  variant="comic"
                  size="sm"
                  disabled={busy}
                  onClick={() => void handleFileLoad(createSyntheticDemoWavFile())}
                >
                  ⚡ PISTE DÉMO (WAV 120 BPM)
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                <p role="status" aria-live="polite" className="text-brand-charcoal">
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
              </div>

              {importError && (
                <p role="alert" className="font-mono text-xs text-brand-red font-bold">
                  {importError}
                </p>
              )}
              {importWarning && (
                <p className="font-mono text-xs text-amber-700">
                  {importWarning}
                </p>
              )}

              {analysis && (
                <div className="space-y-4 pt-2 border-t border-neutral-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                    <strong className="text-brand-black">{fileName}</strong>
                    <span className="text-neutral-500">
                      {analysis.durationSeconds.toFixed(2)}s ·{" "}
                      {analysis.sampleRateHz}Hz · {analysis.timestamps.length}{" "}
                      fenêtres
                    </span>
                  </div>
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

                  {/* Calage Extrait 30s + Fondu Entrée / Sortie + Synchro BPM */}
                  <div className="p-3.5 rounded-xl bg-brand-pearl border-2 border-black space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="inline-flex items-center gap-2 font-mono text-xs font-bold text-brand-black cursor-pointer">
                          <input
                            type="checkbox"
                            checked={clipActive}
                            onChange={(e) => setClipActive(e.target.checked)}
                            className="accent-brand-red"
                          />
                          <span>✂ EXTRAIT ({clipDurationSeconds}s) + FONDUS</span>
                        </label>
                        <label className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-brand-red cursor-pointer">
                          <input
                            type="checkbox"
                            checked={clipLoop}
                            onChange={(e) => setClipLoop(e.target.checked)}
                            className="accent-brand-red"
                          />
                          <span>🔁 BOUCLE</span>
                        </label>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="comic"
                          size="sm"
                          onClick={handlePlayClipExtract}
                        >
                          ▶ LIRE L&apos;EXTRAIT ({clipDurationSeconds}s)
                        </Button>
                        <Button
                          id="btn-ve-global-pause"
                          variant="clinical"
                          size="sm"
                          onClick={handlePauseSiteMusic}
                        >
                          ⏸ PAUSE
                        </Button>
                        <Button
                          variant={isRecordingVideo ? "comic" : "primary"}
                          size="sm"
                          onClick={() => void handleToggleVideoExport()}
                        >
                          {isRecordingVideo
                            ? "⏹ STOP & SAUVER MP4"
                            : `🎬 ENREGISTRER EXTRAIT (${clipDurationSeconds}s + SON)`}
                        </Button>
                        <Button
                          variant="clinical"
                          size="sm"
                          onClick={handleAutoSyncScenesToAudio}
                        >
                          ⏱ CALER SCÈNES EN BPM ({bpm} BPM)
                        </Button>
                      </div>
                    </div>

                    <div className="px-2.5 py-1.5 rounded-lg bg-brand-white border border-black font-mono text-[10px] flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-brand-black">
                        ZONE PRÉVISUALISÉE &amp; ENREGISTRÉE :{" "}
                        <span className="text-brand-red">
                          {clipStartSeconds.toFixed(2)}s → {(clipStartSeconds + clipDurationSeconds).toFixed(2)}s
                        </span>{" "}
                        ({clipDurationSeconds}s)
                      </span>
                      <span className="text-neutral-600">
                        Audio + Vidéo + Fondus ({fadeInSeconds.toFixed(1)}s / {fadeOutSeconds.toFixed(1)}s) synchronisés dans le MP4
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px]">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>DURÉE EXTRAIT</span>
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
                        <div className="flex justify-between mb-1">
                          <span>FONDU ENTRÉE</span>
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
                        <div className="flex justify-between mb-1">
                          <span>FONDU SORTIE</span>
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

                    {/* Calage fin BPM & Mesures (défaut verrouillé à 0.00s) */}
                    <div className="pt-2.5 border-t border-neutral-300 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center font-mono text-[11px]">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>SWITCH SCÈNES (MESURES)</span>
                          <strong className="text-brand-red">
                            {autoSceneSwitchBeats === 0
                              ? "FIXE"
                              : `${autoSceneSwitchBeats} TEMPS`}
                          </strong>
                        </div>
                        <select
                          value={autoSceneSwitchBeats}
                          onChange={(e) =>
                            setAutoSceneSwitchBeats(Number(e.target.value))
                          }
                          className="w-full px-2 py-1 rounded border border-black bg-brand-white font-bold"
                        >
                          <option value={0}>Fixe (manuel)</option>
                          <option value={1}>1 temps (rapide)</option>
                          <option value={2}>2 temps (1/2 mes.)</option>
                          <option value={4}>4 temps (1 mesure)</option>
                          <option value={8}>8 temps (2 mesures)</option>
                          <option value={16}>16 temps (4 mesures)</option>
                          <option value={32}>32 temps (8 mesures)</option>
                          <option value={64}>64 temps (16 mesures)</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span>CALAGE 1ER TEMPS (OFFSET)</span>
                          <div className="flex items-center gap-1.5">
                            <strong>{beatOffset.toFixed(2)}s</strong>
                            <button
                              type="button"
                              onClick={() => setBeatOffset(0)}
                              className="px-1.5 py-0.5 rounded border border-black bg-brand-white text-[9px] font-bold hover:bg-brand-red hover:text-white"
                            >
                              ↺ 0.00s
                            </button>
                          </div>
                        </div>
                        <input
                          type="range"
                          min={-2}
                          max={2}
                          step={0.01}
                          value={beatOffset}
                          onChange={(e) => setBeatOffset(Number(e.target.value))}
                          className="w-full accent-brand-red"
                        />
                      </div>

                      <div className="flex items-end h-full">
                        <Button
                          variant="clinical"
                          size="sm"
                          onClick={() => {
                            const t =
                              localAudioRef.current?.currentTime ?? localTime;
                            const beatDur = 60 / Math.max(60, bpm);
                            const phase = Number((t % beatDur).toFixed(2));
                            setBeatOffset(phase);
                            if (autoSceneSwitchBeats === 0) {
                              setAutoSceneSwitchBeats(16);
                            }
                            setPresetMessage(
                              `1er temps calé sur ${t.toFixed(2)}s (phase ${phase}s @ ${bpm} BPM).`
                            );
                          }}
                        >
                          ⚡ CALER 1ER TEMPS ICI
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Jauges des 5 caractéristiques audio en temps réel */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                {(
                  [
                    ["RMS", liveFeatures.rms],
                    ["BASSES", Math.sqrt(Math.max(0, liveFeatures.bass))],
                    ["MÉDIUMS", Math.sqrt(Math.max(0, liveFeatures.mid))],
                    ["AIGUS", Math.sqrt(Math.max(0, liveFeatures.treble))],
                    [
                      "TRANSIT.",
                      Math.min(1, Math.sqrt(Math.max(0, liveFeatures.spectralFlux)) * 2),
                    ],
                  ] as const
                ).map(([label, val]) => (
                  <div
                    key={label}
                    className="p-2.5 rounded-lg bg-brand-pearl border border-neutral-200 font-mono"
                  >
                    <div className="text-[10px] text-neutral-500 font-bold">
                      {label}
                    </div>
                    <div className="text-xs font-bold text-brand-black mt-0.5">
                      {val.toFixed(3)}
                    </div>
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

              <div className="flex items-center justify-between pt-2 border-t border-neutral-200 font-mono text-[11px] text-neutral-500">
                <span>Cache hors-ligne IndexedDB (expire après 30 jours)</span>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await clearAnalysisCache();
                      setImportWarning("Cache local IndexedDB vidé.");
                    } catch {
                      setImportWarning("Impossible de vider le cache.");
                    }
                  }}
                  className="text-brand-red font-bold underline"
                >
                  Vider cache FFT
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <ScenePackManager
        authorName="Anarchy Community"
        liveSlotIndex={livePackSlotIndex}
        bpm={bpm}
        beatsPerScene={autoSceneSwitchBeats}
        onPackChange={(pack: ScenePack) => {
          activePackRef.current = pack;
          setBpm(pack.bpm);
          setAutoSceneSwitchBeats(pack.beatsPerScene);
        }}
        onSelectSlot={(idx: number, slot: ScenePackSlot, pack: ScenePack) => {
          activePackRef.current = pack;
          livePackSlotIndexRef.current = idx;
          setLivePackSlotIndex(idx);
          setBpm(pack.bpm);
          useCustomPaletteRef.current = false;
          setUseCustomPalette(false);
          if (activeVariationIdx !== null && pack.beatsPerScene > 0) {
            setAutoSceneSwitchBeats(pack.beatsPerScene);
          }
          setActiveVariationIdx(null);
          updatePreset((curr) => ({
            ...curr,
            sceneId: slot.sceneId,
            paletteId: slot.paletteId,
            intensity: slot.intensity,
            seed: slot.seed ?? curr.seed,
            effects: {
              ...curr.effects,
              strobeGlow: slot.strobe / 100,
              psychedelic: slot.kaleidoscope / 100,
              colorTransition: slot.acidHueShift / 100,
              anaglyphSplit: slot.feedbackTrails / 100,
            },
          }));
        }}
      />

      {(showStagePanel || showMatrixPanel) && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {showStagePanel && (
            <div className={showMatrixPanel ? "xl:col-span-7 space-y-4" : "xl:col-span-12 space-y-4"}>
          <Card
            moduleTitle={`STAGE_OUTPUT // ${activeDescriptor.name.toUpperCase()}`}
            moduleMeta={
              isLowPoly && renderReport
                ? `${STUDY_SIZE.width}×${STUDY_SIZE.height} // ${renderReport.triangleCount}/${activeDescriptor.geometryBudget.maxTriangles} TRI`
                : `${STUDY_SIZE.width}×${STUDY_SIZE.height} PIXEL-PERFECT`
            }
            activeIndicator
          >
            <div className="space-y-4">
              {/* Cadre moniteur encré style BD / Figma */}
              <div className="relative rounded-xl border-4 border-black bg-[#08090c] p-2 shadow-comic">
                <canvas
                  ref={stageCanvasRef}
                  width={STUDY_SIZE.width}
                  height={STUDY_SIZE.height}
                  role="img"
                  aria-label={activeDescriptor.ariaLabel}
                  className="w-full aspect-video rounded border-2 border-neutral-800 bg-black"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>

              {/* Barre Actions & Export MP4 synchronisée (proche du son et de l'image) */}
              <div className="p-3 rounded-xl bg-brand-pearl border-2 border-black shadow-comic-sm space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px]">
                  <span className="font-bold text-brand-black uppercase">
                    EXPORT &amp; GÉNÉRATION DIRECTE {"//"} ZONE :{" "}
                    <span className="text-brand-red">
                      {clipStartSeconds.toFixed(1)}s → {(clipStartSeconds + clipDurationSeconds).toFixed(1)}s
                    </span>{" "}
                    ({clipDurationSeconds}s + SON)
                  </span>
                  <span className="text-neutral-600">
                    {isRecordingVideo
                      ? "⏺ Enregistrement en cours (arrêt auto fin d'extrait)..."
                      : sourceMode === "LOCAL_FILE"
                        ? "Prêt : piste locale + fondus + vidéo"
                        : "Prêt : flux Open Hub + vidéo"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      id="btn-ve-undo"
                      variant="clinical"
                      size="sm"
                      disabled={historyPast.length === 0}
                      onClick={handleUndo}
                    >
                      ↶ UNDO
                    </Button>
                    <Button
                      id="btn-ve-redo"
                      variant="clinical"
                      size="sm"
                      disabled={historyFuture.length === 0}
                      onClick={handleRedo}
                    >
                      ↷ REDO
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      id="btn-ve-snapshot"
                      variant="clinical"
                      size="sm"
                      onClick={handleExportSnapshot}
                    >
                      ⬇ PNG 1280×720
                    </Button>
                    <Button
                      id="btn-ve-video"
                      variant={isRecordingVideo ? "comic" : "primary"}
                      size="sm"
                      onClick={() => void handleToggleVideoExport()}
                    >
                      {isRecordingVideo
                        ? "⏹ STOP & SAUVER MP4"
                        : `🎬 EXPORTER EXTRAIT MP4 (${clipDurationSeconds}s + SON)`}
                    </Button>
                  </div>
                </div>
                {presetMessage && (
                  <p
                    role="status"
                    className="p-2 rounded bg-brand-white border-l-4 border-[#00E5FF] font-mono text-[11px] text-brand-black"
                  >
                    {presetMessage}
                  </p>
                )}
                {presetError && (
                  <p
                    role="alert"
                    className="p-2 rounded bg-brand-white border-l-4 border-brand-red font-mono text-[11px] text-brand-red font-bold"
                  >
                    {presetError}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

          )}
          {showMatrixPanel && (
            <div className={showStagePanel ? "xl:col-span-5 space-y-4" : "xl:col-span-12 space-y-4"}>
          <Card
            moduleTitle="COLOR_&_VARIATIONS // COULEURS_&_VARIATIONS"
            moduleMeta="7 PALETTES · COLOR MORPH · 4 VARIATIONS"
            activeIndicator={useCustomPalette || activeVariationIdx !== null}
          >
            <div className="space-y-4">
              {/* Changement de couleur : Palette Principale & Palette Cible Color Morph */}
              {(() => {
                const displayedPaletteId = useCustomPalette
                  ? preset.paletteId
                  : renderReport?.paletteId ?? preset.paletteId;
                const activePal =
                  STUDY_PALETTES.find((p) => p.id === displayedPaletteId) ??
                  STUDY_PALETTES[0];
                const morphRatio = Math.max(
                  0,
                  Math.min(1, preset.effects.colorTransition ?? 0)
                );
                const targetPal =
                  STUDY_PALETTES.find(
                    (p) =>
                      p.id ===
                      (preset.effects.targetPaletteId ?? "techno-therapy")
                  ) ?? STUDY_PALETTES[0];

                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label
                            htmlFor="ve-palette-select"
                            className="font-mono text-[10px] font-bold uppercase text-brand-charcoal"
                          >
                            Palette principale
                          </label>
                          <div className="flex items-center gap-1.5">
                            {useCustomPalette && (
                              <button
                                type="button"
                                onClick={() => {
                                  useCustomPaletteRef.current = false;
                                  setUseCustomPalette(false);
                                }}
                                className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border border-black bg-brand-pearl hover:bg-brand-white text-brand-black"
                                title="Revenir aux couleurs automatiques du pack"
                              >
                                ↺ Pack
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => toggleLock("paletteId")}
                              className="font-mono text-[9px] font-bold text-brand-red underline"
                              title="Verrouiller la palette lors des variations"
                            >
                              {preset.locks["paletteId"] ? "🔒" : "🔓"}
                            </button>
                          </div>
                        </div>
                        <select
                          id="ve-palette-select"
                          value={displayedPaletteId}
                          onChange={(e) => {
                            const nextPal = e.target.value as PaletteId;
                            useCustomPaletteRef.current = true;
                            setUseCustomPalette(true);
                            updatePreset((curr) => ({
                              ...curr,
                              paletteId: nextPal,
                            }));
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border-2 border-black bg-brand-white font-mono text-xs text-brand-black font-bold"
                        >
                          {STUDY_PALETTES.map((pal) => (
                            <option key={pal.id} value={pal.id}>
                              {pal.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="ve-target-palette-select"
                          className="block font-mono text-[10px] font-bold uppercase text-brand-charcoal mb-1"
                        >
                          Cible Color Morph{" "}
                          {morphRatio > 0.01 && (
                            <span className="text-brand-red">
                              ({Math.round(morphRatio * 100)}%)
                            </span>
                          )}
                        </label>
                        <select
                          id="ve-target-palette-select"
                          value={
                            preset.effects.targetPaletteId ?? "techno-therapy"
                          }
                          onChange={(e) => {
                            const nextTarget = e.target.value as PaletteId;
                            useCustomPaletteRef.current = true;
                            setUseCustomPalette(true);
                            updatePreset((curr) => ({
                              ...curr,
                              paletteId: displayedPaletteId,
                              effects: {
                                ...curr.effects,
                                targetPaletteId: nextTarget,
                                colorTransition:
                                  (curr.effects.colorTransition ?? 0) <= 0.02
                                    ? 0.5
                                    : curr.effects.colorTransition,
                              },
                            }));
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border-2 border-neutral-400 bg-brand-white font-mono text-xs text-brand-charcoal font-bold"
                        >
                          {STUDY_PALETTES.map((pal) => (
                            <option key={`target-${pal.id}`} value={pal.id}>
                              → {pal.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Aperçu nuancier de la palette active (+ morph cible) */}
                    <div className="space-y-1">
                      <div className="flex h-3.5 rounded overflow-hidden border border-black">
                        {[
                          activePal.shadow,
                          activePal.structure,
                          activePal.distant,
                          activePal.face,
                          activePal.haze,
                          activePal.reflection,
                          activePal.glow,
                          activePal.light,
                        ].map((hex, i) => (
                          <span
                            key={`base-${hex}-${i}`}
                            className="flex-1"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                      {morphRatio > 0.01 && (
                        <div className="flex h-2 rounded overflow-hidden border border-neutral-400">
                          {[
                            targetPal.shadow,
                            targetPal.structure,
                            targetPal.distant,
                            targetPal.face,
                            targetPal.haze,
                            targetPal.reflection,
                            targetPal.glow,
                            targetPal.light,
                          ].map((hex, i) => (
                            <span
                              key={`target-${hex}-${i}`}
                              className="flex-1"
                              style={{ backgroundColor: hex }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Variations rapides pour expérimenter */}
              <div className="space-y-2 pt-3 border-t border-neutral-200">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase text-brand-red">
                    Variations rapides (Cliquer pour charger)
                  </span>
                  <Button
                    id="btn-ve-variations"
                    variant="clinical"
                    size="sm"
                    onClick={handleGenerateVariations}
                  >
                    🎲 4 Variations
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {variations.map((v, idx) => {
                    const isSelected = activeVariationIdx === idx;
                    return (
                      <button
                        key={`${v.seed}-${idx}`}
                        type="button"
                        onClick={() => handleApplyVariation(v, idx)}
                        className={`px-2.5 py-1.5 rounded-lg border-2 font-mono text-[11px] font-bold text-left transition-all ${
                          isSelected
                            ? "border-black bg-brand-red text-white shadow-comic-sm"
                            : "border-black bg-brand-pearl hover:bg-brand-white text-brand-black shadow-comic-sm"
                        }`}
                      >
                        #{idx + 1} · {v.sceneId.split("-")[0]} ({v.paletteId.split("-")[0]})
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>
          )}
        </div>
      )}

      {showFadersPanel && (
        <Card
        moduleTitle="MIXING_CONSOLE // 10_FADERS_ESSENTIELS"
        moduleMeta="DOUBLE-CLIC = RESET · RÉACTIF EN TEMPS RÉEL"
        activeIndicator
      >
        <div className="space-y-6">
          {/* Barre de filtre rapide des banques de faders */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200">
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
              {(
                [
                  { id: "ALL", label: "TOUS LES FADERS (10)" },
                  { id: "AUDIO", label: "AUDIO : BASSES & AIGUS (3)" },
                  { id: "FX", label: "STROBE AIGU & PSYCHÉ (5)" },
                  { id: "CAMERA", label: "CAMÉRA (2)" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setBankFilter(tab.id)}
                  className={[
                    "px-3 py-1.5 rounded-lg font-bold border-2 transition-all",
                    bankFilter === tab.id
                      ? "bg-black text-white border-black shadow-comic-sm"
                      : "bg-brand-pearl text-brand-charcoal border-neutral-300 hover:border-black",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <span className="font-mono text-[11px] text-neutral-500">
              Temps réel sur <strong className="text-brand-black">STAGE_OUTPUT</strong>
            </span>
          </div>

          {/* 01 // AUDIO : BASSES, AIGUS/CLAP & MASTER (3 Faders) */}
          {(bankFilter === "ALL" || bankFilter === "AUDIO") && (
            <div className="space-y-2.5">
              <div className="font-mono text-xs font-bold uppercase text-brand-red flex items-center gap-2">
                <span>{"01 //"}</span>
                <span>AUDIO — BASSES, AIGUS / CLAP &amp; PUISSANCE (3 FADERS)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ConsoleFader
                  id="fader-bass"
                  shortTag="BASS"
                  label="Bass Punch"
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
                  shortTag="CLAP-HI"
                  label="Aigus / Clap"
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
                  label="Master Int."
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

          {/* 02 // STROBE AIGU, BLACKOUT & PSYCHÉDÉLIE (5 Faders) */}
          {(bankFilter === "ALL" || bankFilter === "FX") && (
            <div className="space-y-2.5 pt-2 border-t border-neutral-200">
              <div className="font-mono text-xs font-bold uppercase text-brand-black flex items-center gap-2">
                <span className="text-[#00E5FF]">{"02 //"}</span>
                <span>STROBE AIGU (FLASH FOND), KICK BLACKOUT &amp; PSYCHÉDÉLIE (5 FADERS)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <ConsoleFader
                  id="fader-strobe"
                  shortTag="FLASH"
                  label="Strobe Aigu"
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
                  label="Kick Blackout"
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
                  label="Psychédélie"
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
                  label="Morph Couleur"
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
                  label="Anaglyph 3D"
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

          {/* 03 // CAMÉRA (2 Faders) */}
          {(bankFilter === "ALL" || bankFilter === "CAMERA") && (
            <div className="space-y-2.5 pt-2 border-t border-neutral-200">
              <div className="font-mono text-xs font-bold uppercase text-brand-charcoal flex items-center gap-2">
                <span className="text-brand-red">{"03 //"}</span>
                <span>CAMÉRA — ZOOM &amp; BALANCEMENT PENDULAIRE (2 FADERS)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ConsoleFader
                  id="fader-cam-zoom"
                  shortTag="ZOOM"
                  label="Zoom Cam"
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
                  label="Pendule Cam"
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

      {showLyricsPanel && (
      <div>
          <Card
            moduleTitle="LYRICS_OVERLAY // BITMAP_5X5_&_MIC"
            moduleMeta="SYNCHRO VOCALE MÉDIUMS"
            activeIndicator={lyricsEnabled}
          >
            <div className="space-y-4">
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
                  <span>Activer incrustation paroles</span>
                </label>

                <Button
                  id="btn-ve-mic"
                  variant={speechActive ? "primary" : "comic"}
                  size="sm"
                  onClick={handleSpeechMic}
                >
                  {speechActive ? "● ÉCOUTE MICRO..." : "🎙 MICRO PAROLES"}
                </Button>
              </div>

              <div>
                <label
                  htmlFor="ve-lyrics-style"
                  className="block font-mono text-[10px] font-bold uppercase text-neutral-500 mb-1"
                >
                  Style typographique pixel
                </label>
                <select
                  id="ve-lyrics-style"
                  value={lyricsStyle}
                  onChange={(e) =>
                    setLyricsStyle(e.target.value as LyricsDisplayStyle)
                  }
                  className="w-full px-3 py-1.5 rounded-lg border-2 border-black bg-brand-white font-mono text-xs font-bold"
                >
                  <option value="cinema-sub">Sous-titre Cinéma 16-bit</option>
                  <option value="center-impact">Impact Central Brutaliste</option>
                  <option value="hud-terminal">Terminal HUD Haut</option>
                  <option value="psyche-wave">Onde Psychédélique</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="ve-lyrics-text"
                  className="block font-mono text-[10px] font-bold uppercase text-neutral-500 mb-1"
                >
                  Texte affiché sur la scène (1 ligne / 2.5s)
                </label>
                <textarea
                  id="ve-lyrics-text"
                  rows={5}
                  value={lyricsText}
                  onChange={(e) => setLyricsText(e.target.value)}
                  placeholder="Entrez vos paroles ou slogans..."
                  className="w-full p-3 rounded-lg border-2 border-black bg-brand-pearl font-mono text-xs text-brand-black focus:outline-none focus:border-brand-red"
                />
              </div>

              <div className="p-3 rounded-lg bg-brand-pearl border-l-4 border-brand-red font-mono text-[11px] text-neutral-600">
                Chaque mot s&apos;illumine dynamiquement selon la bande médiums
                (250–2000 Hz) avec police bitmap 5×5 intégrée au moteur.
              </div>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
};

export default VisualEngineStudio;

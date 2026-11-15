"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AvatarBD } from "@/components/ui/AvatarBD";
import { useAudioPlayer } from "@/components/audio/AudioPlayerContext";
import { ConsoleFader } from "@/components/visual-engine/ConsoleFader";
import { WaveformCanvas } from "@/components/visual-engine/WaveformCanvas";
import {
  RANDOMIZER_VERSION,
  type AudioAnalysis,
  type AudioFeatures,
  type LyricsDisplayStyle,
  type PaletteId,
  type PresetParameterPath,
  type RetroPresetConfig,
  type SceneId,
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
  createDefaultPresetConfig,
  createDefaultStudioProject,
  evaluateSequenceAt,
  generatePresetVariations,
  parsePresetConfig,
  randomizePresetConfig,
  serializePresetConfig,
} from "@/lib/visual-engine/presets";
import {
  SCENE_CATALOG,
  STUDY_FPS,
  STUDY_LAST_FRAME,
  STUDY_PALETTES,
  STUDY_SIZE,
  getSceneDescriptor,
  renderSceneFrame,
  type SceneRenderReport,
} from "@/lib/visual-engine/renderer";

type AudioSourceMode = "LIVE_HUB" | "LOCAL_FILE";
type BankFilter = "ALL" | "AUDIO" | "FX" | "CAMERA";

const PRESET_STORAGE_KEY = "openhub.visualEngine.savedPreset.v2";

const ZERO_FEATURES: AudioFeatures = {
  rms: 0,
  bass: 0,
  mid: 0,
  treble: 0,
  spectralFlux: 0,
};

/**
 * Composant `VisualEngineStudio` — Intégration complète V2 (`d925fd4` M1–M6)
 * d'Anarchy Visual Engine dans Open Hub :
 * - Console modulaire à 19 Faders DAW/VJ regroupés en 3 banques (Audio, FX/Psyche/Blackout, Caméra/Pendule)
 * - 5 scènes (Industrial City, PS1 Nightmare, Rave Dungeon, Digital Void, Techno Therapy)
 * - 7 palettes avec Morphing inter-palettes & Blood Red / Anarchy Anaglyph 3D
 * - BPM detector (`estimateTempoBpm`), Kick Blackout (`duck-on-kick` / `open-on-kick`) & Auto Scene Switch
 * - Incrustation de paroles bitmap 5x5 + Micro Web Speech API
 * - M4 Presets (seed, locks, Randomize, JSON, LocalStorage) & M6 (Undo/Redo, 4 Variations, Timeline Multi-Scènes)
 * - Synthèse piste démo WAV instantanée + Import MP3/WAV FFT Worker + Synchro Lecteur Persistant Open Hub
 */
export const VisualEngineStudio: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    getTimeDomainData,
    getFrequencyData,
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
  const [frame, setFrame] = useState<number>(48);
  const [autoAnimate, setAutoAnimate] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(100); // % (0 = pause/scrub)
  const [envelopeSmooth, setEnvelopeSmooth] = useState<number>(30); // %

  // Gains par bande audio (0..250%)
  const [bassGain, setBassGain] = useState<number>(100);
  const [midGain, setMidGain] = useState<number>(100);
  const [trebleGain, setTrebleGain] = useState<number>(100);
  const [transientGain, setTransientGain] = useState<number>(100);

  // BPM, Beat Sync & Kick Blackout
  const [bpm, setBpm] = useState<number>(128);
  const [beatOffset, setBeatOffset] = useState<number>(0);
  const [bpmConfidence, setBpmConfidence] = useState<number | null>(null);
  const [autoSceneSwitchBeats, setAutoSceneSwitchBeats] = useState<number>(0);
  const [kickBlackoutMode, setKickBlackoutMode] = useState<
    "duck-on-kick" | "open-on-kick"
  >("duck-on-kick");

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

  // Presets, JSON, Variations & Télémétrie scène
  const [liveFeatures, setLiveFeatures] =
    useState<AudioFeatures>(ZERO_FEATURES);
  const [renderReport, setRenderReport] = useState<SceneRenderReport>();
  const [activeSegIndex, setActiveSegIndex] = useState<number>(0);
  const [presetMessage, setPresetMessage] = useState<string>("");
  const [presetError, setPresetError] = useState<string>("");
  const [jsonDraft, setJsonDraft] = useState<string>("");
  const [showJsonEditor, setShowJsonEditor] = useState<boolean>(false);
  const [variations, setVariations] = useState<RetroPresetConfig[]>([]);

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
  const timeAccumRef = useRef<number>(48 / STUDY_FPS);

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
      setBeatOffset(est.beatOffsetSeconds);
      setBpmConfidence(est.confidence);
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

  const applyClipFadeVolume = useCallback(
    (audioEl: HTMLAudioElement, t: number) => {
      if (!clipActive) {
        audioEl.volume = 1;
        return;
      }
      const clipEnd = clipStartSeconds + clipDurationSeconds;
      if (t >= clipEnd) {
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
    [clipActive, clipDurationSeconds, clipLoop, clipStartSeconds, fadeInSeconds, fadeOutSeconds]
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
          if (clipActive) {
            const clipEnd = Math.min(
              analysis.durationSeconds,
              clipStartSeconds + clipDurationSeconds
            );
            if (t >= clipEnd) {
              if (clipLoop) {
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
      setActiveSegIndex(sequenceEval.segmentIndex);

      const effectivePreset = sequenceEval.activePreset;
      const canvas = stageCanvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (ctx) {
        const nextReport = renderSceneFrame(ctx, {
          sceneId: effectivePreset.sceneId,
          paletteId: effectivePreset.paletteId,
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
            transientGain: transientGain / 100,
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
                  autoSceneSwitchBeats,
                  kickBlackoutMode,
                }
              : undefined,
          camera: effectivePreset.render.camera,
          seed: effectivePreset.seed,
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
    autoAnimate,
    autoSceneSwitchBeats,
    bassGain,
    beatOffset,
    bpm,
    clipActive,
    clipDurationSeconds,
    clipLoop,
    clipStartSeconds,
    envelopeSmooth,
    frame,
    getFrequencyData,
    getTimeDomainData,
    isPlaying,
    kickBlackoutMode,
    localTime,
    lyricsEnabled,
    lyricsStyle,
    lyricsText,
    midGain,
    playbackSpeed,
    project,
    sourceMode,
    transientGain,
    trebleGain,
  ]);

  // Actions M4/M6
  const handleSceneChange = (nextSceneId: SceneId) => {
    setPresetError("");
    updatePreset((curr) => {
      const defaults = createDefaultPresetConfig(
        nextSceneId,
        curr.paletteId,
        curr.seed
      );
      return {
        ...defaults,
        intensity: curr.intensity,
        locks: curr.locks,
        effects: {
          ...curr.effects,
          vertexSnap:
            defaults.render.style === "lowpoly-32"
              ? curr.effects.vertexSnap || true
              : false,
          affineTextures:
            defaults.render.style === "lowpoly-32"
              ? curr.effects.affineTextures || true
              : false,
        },
      };
    });
  };

  const toggleLock = (path: PresetParameterPath) => {
    updatePreset((curr) => {
      const nextLocks = { ...curr.locks };
      if (nextLocks[path]) delete nextLocks[path];
      else nextLocks[path] = true;
      return { ...curr, locks: nextLocks };
    }, false);
  };

  const handleRandomize = () => {
    setPresetError("");
    setPresetMessage("");
    try {
      const nextSeed = (preset.seed + 0x9e3779b9) >>> 0 || 1;
      const randomized = randomizePresetConfig({
        randomizerVersion: RANDOMIZER_VERSION,
        seed: nextSeed,
        current: preset,
      });
      updatePreset(() => randomized);
      setPresetMessage(
        `Seed ${randomized.seed} appliquée (${randomized.sceneId} / ${randomized.paletteId}).`
      );
    } catch (cause) {
      setPresetError(
        cause instanceof Error ? cause.message : "Tirage impossible."
      );
    }
  };

  const handleSaveLocal = () => {
    setPresetError("");
    try {
      const serialized = serializePresetConfig(preset);
      window.localStorage.setItem(PRESET_STORAGE_KEY, serialized);
      setJsonDraft(serialized);
      setPresetMessage("Preset sauvegardé localement dans votre navigateur.");
    } catch (cause) {
      setPresetError(
        cause instanceof Error ? cause.message : "Sauvegarde locale impossible."
      );
    }
  };

  const handleLoadLocal = () => {
    setPresetError("");
    try {
      const raw = window.localStorage.getItem(PRESET_STORAGE_KEY);
      if (!raw) {
        setPresetError("Aucun preset sauvegardé localement pour le moment.");
        return;
      }
      const loaded = parsePresetConfig(raw);
      updatePreset(() => loaded);
      setJsonDraft(raw);
      setPresetMessage(
        `Preset chargé (${loaded.sceneId} / seed ${loaded.seed}).`
      );
    } catch (cause) {
      setPresetError(
        cause instanceof Error ? cause.message : "Chargement local impossible."
      );
    }
  };

  const handleImportJson = () => {
    setPresetError("");
    try {
      const parsed = parsePresetConfig(jsonDraft);
      updatePreset(() => parsed);
      setPresetMessage(`JSON validé et appliqué (${parsed.sceneId}).`);
    } catch (cause) {
      setPresetError(
        cause instanceof Error ? cause.message : "JSON de preset invalide."
      );
    }
  };

  const handleGenerateVariations = () => {
    setPresetError("");
    try {
      const nextVars = generatePresetVariations(preset, 4, preset.seed);
      setVariations(nextVars);
      setPresetMessage("4 variations contraintes générées sans modifier le preset actif.");
    } catch (cause) {
      setPresetError(
        cause instanceof Error ? cause.message : "Génération impossible."
      );
    }
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

  const handleReset = () => {
    updateProject(() => createDefaultStudioProject());
    setBassGain(100);
    setMidGain(100);
    setTrebleGain(100);
    setTransientGain(100);
    setPlaybackSpeed(100);
    setEnvelopeSmooth(30);
    setAutoSceneSwitchBeats(0);
    setPresetMessage("Console et projet réinitialisés aux valeurs d'usine.");
    setPresetError("");
  };

  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

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

  const handleToggleVideoExport = () => {
    if (isRecordingVideo && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecordingVideo(false);
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
      const stream = canvas.captureStream(30);
      const candidates = [
        "video/mp4;codecs=avc1",
        "video/mp4",
        "video/webm;codecs=vp9",
        "video/webm",
      ];
      const mimeType =
        candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

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
        a.download = `anarchy-visual-${preset.sceneId}-${preset.seed}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setPresetMessage(`Vidéo exportée au format .${ext.toUpperCase()} !`);
      };

      // Caler la lecture audio sur le début de l'extrait au lancement de l'export vidéo
      if (localAudioRef.current) {
        localAudioRef.current.currentTime = clipStartSeconds;
        setLocalTime(clipStartSeconds);
        void localAudioRef.current.play().catch(() => {});
      }

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecordingVideo(true);
      setAutoAnimate(true);
      setPresetError("");
      setPresetMessage(
        `Enregistrement vidéo de l'extrait (${clipDurationSeconds}s) en cours... Cliquez à nouveau pour télécharger.`
      );
    } catch {
      setPresetError("Impossible de démarrer l'enregistrement vidéo.");
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
    localAudioRef.current.currentTime = clipStartSeconds;
    setLocalTime(clipStartSeconds);
    setSourceMode("LOCAL_FILE");
    setAutoAnimate(true);
    void localAudioRef.current.play().catch(() => {});
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
        moduleTitle="ANARCHY_VISUAL_DESIGN // STUDIO_19_FADERS"
        moduleMeta={`${activeDescriptor.badge} // 19_CONSOLE_FADERS`}
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
                <span>{"// 320x180 NEAREST-NEIGHBOR + 32-BIT PS1 + 19 FADERS"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-black">
                Anarchy Visual Design{" "}
                <span className="text-brand-red underline decoration-4 underline-offset-4">
                  Studio
                </span>
              </h1>
              <p className="text-sm text-neutral-600 max-w-2xl">
                5 scènes génératives (dont <strong>Techno Therapy</strong>), 7 palettes
                avec morphing temps-réel, synchronisation BPM &amp; Kick Blackout,
                filtre psychédélique, paroles bitmap et console à 19 faders verrouillables.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
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
            <Button
              id="btn-ve-randomize"
              variant="comic"
              size="md"
              onClick={handleRandomize}
            >
              🎲 RANDOMIZE (SEED)
            </Button>
            <Button
              id="btn-ve-snapshot"
              variant="primary"
              size="md"
              onClick={handleExportSnapshot}
            >
              ⬇ PNG 1280×720
            </Button>
            <Button
              id="btn-ve-video"
              variant={isRecordingVideo ? "comic" : "clinical"}
              size="md"
              onClick={handleToggleVideoExport}
            >
              {isRecordingVideo
                ? "⏹ STOP & SAUVER VIDÉO"
                : "🎬 EXPORT VIDÉO (MP4/WEBM)"}
            </Button>
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
          { label: "🎬 SCÈNES & PALETTES", open: showMatrixPanel, toggle: () => setShowMatrixPanel((v) => !v) },
          { label: "🎚 CONSOLE 19 FADERS", open: showFadersPanel, toggle: () => setShowFadersPanel((v) => !v) },
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
                  />
                  {localUrl && (
                    <audio
                      ref={localAudioRef}
                      controls
                      src={localUrl}
                      onTimeUpdate={(e) => {
                        const t = e.currentTarget.currentTime;
                        setLocalTime(t);
                        applyClipFadeVolume(e.currentTarget, t);
                      }}
                      onSeeked={(e) => setLocalTime(e.currentTarget.currentTime)}
                      className="w-full"
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
                          variant="primary"
                          size="sm"
                          onClick={handleAutoSyncScenesToAudio}
                        >
                          ⏱ CALER SCÈNES EN BPM ({bpm} BPM)
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-[11px]">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>DÉBUT EXTRAIT</span>
                          <strong>{clipStartSeconds.toFixed(1)}s</strong>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={Math.max(0, (analysis?.durationSeconds ?? 60) - 5)}
                          step={0.5}
                          value={clipStartSeconds}
                          onChange={(e) => setClipStartSeconds(Number(e.target.value))}
                          className="w-full accent-brand-red"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>DURÉE EXTRAIT</span>
                          <strong>{clipDurationSeconds}s</strong>
                        </div>
                        <select
                          value={clipDurationSeconds}
                          onChange={(e) => setClipDurationSeconds(Number(e.target.value))}
                          className="w-full px-2 py-1 rounded border border-black bg-brand-white font-bold"
                        >
                          <option value={15}>15 secondes</option>
                          <option value={30}>30 secondes</option>
                          <option value={45}>45 secondes</option>
                          <option value={60}>60 secondes</option>
                        </select>
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
                          step={0.25}
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
                          step={0.25}
                          value={fadeOutSeconds}
                          onChange={(e) => setFadeOutSeconds(Number(e.target.value))}
                          className="w-full accent-brand-red"
                        />
                      </div>
                    </div>

                    {/* Calage fin BPM & Mesures (temps / phase du 1er temps) */}
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
                        <div className="flex justify-between mb-1">
                          <span>CALAGE 1ER TEMPS (OFFSET)</span>
                          <strong>{beatOffset.toFixed(2)}s</strong>
                        </div>
                        <input
                          type="range"
                          min={-2}
                          max={2}
                          step={0.02}
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
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 px-1 font-mono text-[10px] text-neutral-300">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isPlaying || sourceMode === "LOCAL_FILE"
                          ? "bg-brand-red animate-pulse"
                          : "bg-[#00E5FF]"
                      }`}
                    />
                    <span className="font-bold text-white">
                      {activeDescriptor.sectorCaption}
                    </span>
                    {project.sequenceEnabled && (
                      <span className="px-1.5 py-0.5 rounded bg-brand-red text-white font-bold">
                        SWITCH SCÈNE #{activeSegIndex + 1}
                      </span>
                    )}
                  </span>
                  <span className="text-[#00E5FF]">
                    SEED: {preset.seed} {"//"} {bpm} BPM
                  </span>
                </div>

                <canvas
                  ref={stageCanvasRef}
                  width={STUDY_SIZE.width}
                  height={STUDY_SIZE.height}
                  role="img"
                  aria-label={activeDescriptor.ariaLabel}
                  className="w-full aspect-video rounded border-2 border-neutral-800 bg-black"
                  style={{ imageRendering: "pixelated" }}
                />

                {/* Barre de transport temporel & Reduced Motion */}
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAutoAnimate((prev) => !prev)}
                      className={`px-2.5 py-1 rounded border-2 border-black font-mono text-[11px] font-bold shadow-comic-sm transition-colors ${
                        autoAnimate
                          ? "bg-brand-red text-white"
                          : "bg-brand-white text-black"
                      }`}
                    >
                      {autoAnimate ? "❚❚ PAUSE_MOTEUR" : "▶ ANIMER_MOTEUR"}
                    </button>
                    <label className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-900 border border-neutral-700 font-mono text-[10px] text-neutral-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={project.reducedMotion}
                        onChange={(e) =>
                          updateProject(
                            (curr) => ({
                              ...curr,
                              reducedMotion: e.target.checked,
                            }),
                            false
                          )
                        }
                        className="accent-brand-red"
                      />
                      <span>Mouvement sûr</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-900 border border-neutral-700 font-mono text-[10px] text-[#00E5FF] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={project.sequenceEnabled}
                        onChange={(e) =>
                          updateProject((curr) => ({
                            ...curr,
                            sequenceEnabled: e.target.checked,
                          }))
                        }
                        className="accent-brand-red"
                      />
                      <span>Switch entre les scènes</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoSyncScenesToAudio}
                      title="Caler automatiquement le switch entre les scènes sur le morceau / BPM"
                      className="px-2 py-1 rounded bg-[#00E5FF] text-black border border-black font-mono text-[10px] font-bold hover:opacity-90 transition-opacity"
                    >
                      ⏱ Caler sur le morceau
                    </button>
                  </div>

                  <div className="flex-1 flex items-center gap-2 font-mono text-[11px] text-neutral-300">
                    <label htmlFor="ve-scrub-frame" className="shrink-0">
                      FRM {String(frame).padStart(3, "0")}/{STUDY_LAST_FRAME}
                    </label>
                    <input
                      id="ve-scrub-frame"
                      type="range"
                      min={0}
                      max={STUDY_LAST_FRAME}
                      step={1}
                      value={frame}
                      onChange={(e) => {
                        setAutoAnimate(false);
                        setFrame(Number(e.target.value));
                      }}
                      className="w-full accent-brand-red"
                    />
                  </div>
                </div>
              </div>

              {/* Matrice des 4 Mappings Audio-Visuels de la scène active */}
              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                aria-label="Mappings audio-visuels actifs"
              >
                {activeDescriptor.audioMappings.map((m) => (
                  <div
                    key={m.band}
                    className="p-2.5 rounded-lg bg-brand-pearl border border-neutral-200 font-mono"
                  >
                    <div className="text-[10px] font-bold text-brand-red uppercase">
                      {m.band}
                    </div>
                    <div className="text-[11px] text-brand-charcoal mt-0.5 leading-snug">
                      {m.target}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

          )}
          {showMatrixPanel && (
            <div className={showStagePanel ? "xl:col-span-5 space-y-4" : "xl:col-span-12 space-y-4"}>
          <Card
            moduleTitle="SCENE_&_PRESET_MATRIX // SCÈNES_&_PRESETS"
            moduleMeta="5 SCÈNES · 7 PALETTES · JSON"
          >
            <div className="space-y-4">
              {/* Sélecteur des 5 Scènes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold uppercase text-brand-black">
                    01 // Choisir la scène
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleLock("sceneId")}
                    className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                      preset.locks["sceneId"]
                        ? "bg-black text-white border-black"
                        : "bg-brand-pearl text-neutral-600 border-neutral-300"
                    }`}
                  >
                    {preset.locks["sceneId"] ? "🔒 SCÈNE LOCKED" : "🔓 LOCK SCÈNE"}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SCENE_CATALOG.map((scene) => {
                    const active = scene.id === preset.sceneId;
                    return (
                      <button
                        key={scene.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => handleSceneChange(scene.id)}
                        className={[
                          "p-2.5 rounded-lg text-left transition-all border-2",
                          active
                            ? "bg-brand-pearl border-black shadow-comic-sm"
                            : "bg-brand-white border-neutral-200 hover:border-black",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between font-mono text-[10px]">
                          <span className="font-bold text-brand-red">
                            {scene.index} {"//"} {scene.style}
                          </span>
                        </div>
                        <div className="font-bold text-xs text-brand-black mt-0.5">
                          {scene.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sélecteur Palette Principale & Palette Cible Morphing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-200">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="ve-palette-select"
                      className="font-mono text-[10px] font-bold uppercase text-brand-charcoal"
                    >
                      Palette principale
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleLock("paletteId")}
                      className="font-mono text-[9px] font-bold text-brand-red underline"
                    >
                      {preset.locks["paletteId"] ? "🔒" : "🔓"}
                    </button>
                  </div>
                  <select
                    id="ve-palette-select"
                    value={preset.paletteId}
                    onChange={(e) =>
                      updatePreset((curr) => ({
                        ...curr,
                        paletteId: e.target.value as PaletteId,
                      }))
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border-2 border-black bg-brand-white font-mono text-xs text-brand-black"
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
                    Cible Color Morph
                  </label>
                  <select
                    id="ve-target-palette-select"
                    value={
                      preset.effects.targetPaletteId ?? "techno-therapy"
                    }
                    onChange={(e) =>
                      updatePreset((curr) => ({
                        ...curr,
                        effects: {
                          ...curr.effects,
                          targetPaletteId: e.target.value as PaletteId,
                        },
                      }))
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-brand-white font-mono text-xs text-brand-charcoal"
                  >
                    {STUDY_PALETTES.map((pal) => (
                      <option key={`target-${pal.id}`} value={pal.id}>
                        → {pal.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Aperçu nuancier de la palette active */}
              <div className="flex h-3 rounded overflow-hidden border border-black">
                {(() => {
                  const pal =
                    STUDY_PALETTES.find((p) => p.id === preset.paletteId) ??
                    STUDY_PALETTES[0];
                  return [
                    pal.shadow,
                    pal.structure,
                    pal.distant,
                    pal.face,
                    pal.haze,
                    pal.reflection,
                    pal.glow,
                    pal.light,
                  ].map((hex, i) => (
                    <span
                      key={`${hex}-${i}`}
                      className="flex-1"
                      style={{ backgroundColor: hex }}
                    />
                  ));
                })()}
              </div>

              {/* BPM, Beat Sync & Paramètres Low-Poly PS1 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-neutral-200 font-mono text-xs">
                <div>
                  <label
                    htmlFor="ve-bpm"
                    className="block text-[10px] font-bold text-neutral-500 uppercase mb-1"
                  >
                    BPM {bpmConfidence !== null ? `(${Math.round(bpmConfidence * 100)}%)` : ""}
                  </label>
                  <input
                    id="ve-bpm"
                    type="number"
                    min={60}
                    max={220}
                    value={bpm}
                    onChange={(e) =>
                      setBpm(
                        Math.max(60, Math.min(220, Number(e.target.value) || 128))
                      )
                    }
                    className="w-full px-2 py-1 rounded border border-neutral-300 bg-brand-pearl text-xs font-bold"
                  />
                </div>
                <div>
                  <label
                    htmlFor="ve-bpm-switch"
                    className="block text-[10px] font-bold text-neutral-500 uppercase mb-1"
                  >
                    Auto Switch
                  </label>
                  <select
                    id="ve-bpm-switch"
                    value={autoSceneSwitchBeats}
                    onChange={(e) =>
                      setAutoSceneSwitchBeats(Number(e.target.value))
                    }
                    className="w-full px-2 py-1 rounded border border-neutral-300 bg-brand-pearl text-xs"
                  >
                    <option value={0}>Fixe</option>
                    <option value={4}>4 temps</option>
                    <option value={8}>8 temps</option>
                    <option value={16}>16 temps</option>
                    <option value={32}>32 temps</option>
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label
                    htmlFor="ve-blackout-mode"
                    className="block text-[10px] font-bold text-neutral-500 uppercase mb-1"
                  >
                    Kick Mode
                  </label>
                  <select
                    id="ve-blackout-mode"
                    value={kickBlackoutMode}
                    onChange={(e) =>
                      setKickBlackoutMode(
                        e.target.value as "duck-on-kick" | "open-on-kick"
                      )
                    }
                    className="w-full px-2 py-1 rounded border border-neutral-300 bg-brand-pearl text-xs"
                  >
                    <option value="duck-on-kick">Noir au Kick</option>
                    <option value="open-on-kick">Ouvre au Kick</option>
                  </select>
                </div>
              </div>

              {isLowPoly && (
                <div className="flex flex-wrap gap-3 pt-1 font-mono text-xs">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preset.effects.vertexSnap}
                      onChange={(e) =>
                        updatePreset((curr) => ({
                          ...curr,
                          effects: {
                            ...curr.effects,
                            vertexSnap: e.target.checked,
                          },
                        }))
                      }
                      className="accent-brand-red"
                    />
                    <span>Vertex Snap PS1</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preset.effects.affineTextures}
                      onChange={(e) =>
                        updatePreset((curr) => ({
                          ...curr,
                          effects: {
                            ...curr.effects,
                            affineTextures: e.target.checked,
                          },
                        }))
                      }
                      className="accent-brand-red"
                    />
                    <span>Textures affines</span>
                  </label>
                </div>
              )}

              {/* Seed & Actions M4/M6 Presets */}
              <div className="pt-2 border-t border-neutral-200 space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <label
                    htmlFor="ve-seed-input"
                    className="font-mono text-[10px] font-bold uppercase text-neutral-500"
                  >
                    Seed:
                  </label>
                  <input
                    id="ve-seed-input"
                    type="number"
                    min={0}
                    max={4294967295}
                    value={preset.seed}
                    onChange={(e) => {
                      const val = Math.max(
                        0,
                        Math.min(0xffffffff, Math.floor(Number(e.target.value) || 0))
                      );
                      updatePreset((curr) => ({ ...curr, seed: val }));
                    }}
                    className="w-28 px-2 py-1 rounded border border-neutral-300 font-mono text-xs font-bold"
                  />
                  <Button
                    variant="clinical"
                    size="sm"
                    onClick={handleGenerateVariations}
                  >
                    4 Variations
                  </Button>
                  <Button
                    variant="clinical"
                    size="sm"
                    onClick={() => {
                      setJsonDraft(serializePresetConfig(preset));
                      setShowJsonEditor((v) => !v);
                    }}
                  >
                    {showJsonEditor ? "Fermer JSON" : "JSON"}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="clinical"
                    size="sm"
                    onClick={handleSaveLocal}
                  >
                    Sauver Preset
                  </Button>
                  <Button
                    variant="clinical"
                    size="sm"
                    onClick={handleLoadLocal}
                  >
                    Charger Preset
                  </Button>
                  <Button variant="clinical" size="sm" onClick={handleReset}>
                    Reset Usine
                  </Button>
                </div>

                {presetMessage && (
                  <p
                    role="status"
                    className="p-2 rounded bg-brand-pearl border-l-4 border-[#00E5FF] font-mono text-[11px] text-brand-black"
                  >
                    {presetMessage}
                  </p>
                )}
                {presetError && (
                  <p
                    role="alert"
                    className="p-2 rounded bg-brand-pearl border-l-4 border-brand-red font-mono text-[11px] text-brand-red font-bold"
                  >
                    {presetError}
                  </p>
                )}

                {showJsonEditor && (
                  <div className="space-y-2 pt-2">
                    <textarea
                      aria-label="Configuration JSON du preset"
                      rows={5}
                      value={jsonDraft}
                      onChange={(e) => setJsonDraft(e.target.value)}
                      className="w-full p-2 rounded border-2 border-black bg-brand-charcoal text-brand-white font-mono text-[11px]"
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleImportJson}
                    >
                      Valider &amp; Appliquer JSON
                    </Button>
                  </div>
                )}

                {variations.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-neutral-200">
                    <div className="font-mono text-[10px] font-bold uppercase text-brand-red">
                      Variations rapides (Cliquer pour charger)
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {variations.map((v, idx) => (
                        <button
                          key={`${v.seed}-${idx}`}
                          type="button"
                          onClick={() => updatePreset(() => v)}
                          className="px-2 py-1 rounded border border-black bg-brand-pearl hover:bg-brand-white font-mono text-[10px] font-bold shadow-comic-sm"
                        >
                          #{idx + 1} · {v.sceneId.split("-")[0]} ({v.paletteId.split("-")[0]})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
          )}
        </div>
      )}

      {showFadersPanel && (
        <Card
        moduleTitle="MIXING_CONSOLE // 19_PRECISION_FADERS"
        moduleMeta="DOUBLE-CLIC = RESET · OPEN/LOCK = RANDOMIZER"
        activeIndicator
      >
        <div className="space-y-6">
          {/* Barre de filtre rapide des banques de faders */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200">
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
              {(
                [
                  { id: "ALL", label: "TOUTES LES BANQUES (19)" },
                  { id: "AUDIO", label: "BANK A : AUDIO & BANDES (6)" },
                  { id: "FX", label: "BANK B : RETRO, PSYCHE & BLACKOUT (7)" },
                  { id: "CAMERA", label: "BANK C : CAMÉRA & PENDULE (6)" },
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
              Style actif : <strong className="text-brand-black">{preset.render.style.toUpperCase()}</strong>
            </span>
          </div>

          {/* BANK A — AUDIO & BANDS (6 Faders) */}
          {(bankFilter === "ALL" || bankFilter === "AUDIO") && (
            <div className="space-y-2.5">
              <div className="font-mono text-xs font-bold uppercase text-brand-red flex items-center gap-2">
                <span>{"01 //"}</span>
                <span>BANK A — AUDIO REACTIVITY &amp; FREQUENCY BANDS (6 FADERS)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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
                <ConsoleFader
                  id="fader-bass"
                  shortTag="20-250"
                  label="Bass Gain"
                  value={bassGain}
                  min={0}
                  max={250}
                  defaultValue={100}
                  unit="%"
                  accent="red"
                  compact
                  liveMeter={Math.min(1, Math.sqrt(liveFeatures.bass))}
                  onChange={setBassGain}
                />
                <ConsoleFader
                  id="fader-mid"
                  shortTag="250-2K"
                  label="Mid Gain"
                  value={midGain}
                  min={0}
                  max={250}
                  defaultValue={100}
                  unit="%"
                  accent="cyan"
                  compact
                  liveMeter={Math.min(1, Math.sqrt(liveFeatures.mid))}
                  onChange={setMidGain}
                />
                <ConsoleFader
                  id="fader-treble"
                  shortTag="2K-12K"
                  label="Treble Gain"
                  value={trebleGain}
                  min={0}
                  max={250}
                  defaultValue={100}
                  unit="%"
                  accent="cyan"
                  compact
                  liveMeter={Math.min(1, Math.sqrt(liveFeatures.treble))}
                  onChange={setTrebleGain}
                />
                <ConsoleFader
                  id="fader-flux"
                  shortTag="FLUX"
                  label="Transient"
                  value={transientGain}
                  min={0}
                  max={250}
                  defaultValue={100}
                  unit="%"
                  accent="red"
                  compact
                  liveMeter={Math.min(1, Math.sqrt(liveFeatures.spectralFlux) * 2)}
                  onChange={setTransientGain}
                />
                <ConsoleFader
                  id="fader-smooth"
                  shortTag="ENV"
                  label="Smoothing"
                  value={envelopeSmooth}
                  min={0}
                  max={100}
                  defaultValue={30}
                  unit="%"
                  accent="charcoal"
                  compact
                  onChange={setEnvelopeSmooth}
                />
              </div>
            </div>
          )}

          {/* BANK B — RETRO, PSYCHE & BLACKOUT FX (7 Faders) */}
          {(bankFilter === "ALL" || bankFilter === "FX") && (
            <div className="space-y-2.5 pt-2 border-t border-neutral-200">
              <div className="font-mono text-xs font-bold uppercase text-brand-black flex items-center gap-2">
                <span className="text-[#00E5FF]">{"02 //"}</span>
                <span>BANK B — RETRO, PSYCHEDELIC, KICK BLACKOUT &amp; 3D ANAGLYPH (7 FADERS)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                <ConsoleFader
                  id="fader-dither"
                  shortTag="BAYER"
                  label="Dither 4x4"
                  value={Math.round(preset.effects.dither * 100)}
                  min={0}
                  max={100}
                  defaultValue={65}
                  unit="%"
                  accent="charcoal"
                  compact
                  locked={Boolean(preset.locks["effects.dither"])}
                  onToggleLock={() => toggleLock("effects.dither")}
                  onChange={(val) =>
                    updatePreset((curr) => ({
                      ...curr,
                      effects: { ...curr.effects, dither: val / 100 },
                    }))
                  }
                />
                <ConsoleFader
                  id="fader-fog"
                  shortTag="Z-FOG"
                  label="Atmos Fog"
                  value={Math.round(preset.effects.fog * 100)}
                  min={0}
                  max={100}
                  defaultValue={55}
                  unit="%"
                  accent="charcoal"
                  compact
                  locked={Boolean(preset.locks["effects.fog"])}
                  onToggleLock={() => toggleLock("effects.fog")}
                  onChange={(val) =>
                    updatePreset((curr) => ({
                      ...curr,
                      effects: { ...curr.effects, fog: val / 100 },
                    }))
                  }
                />
                <ConsoleFader
                  id="fader-grain"
                  shortTag="CRT"
                  label="Grain / Scan"
                  value={Math.round(preset.effects.grain * 100)}
                  min={0}
                  max={100}
                  defaultValue={35}
                  unit="%"
                  accent="charcoal"
                  compact
                  locked={Boolean(preset.locks["effects.grain"])}
                  onToggleLock={() => toggleLock("effects.grain")}
                  onChange={(val) =>
                    updatePreset((curr) => ({
                      ...curr,
                      effects: { ...curr.effects, grain: val / 100 },
                    }))
                  }
                />
                <ConsoleFader
                  id="fader-psyche"
                  shortTag="PSYCHE"
                  label="Kaleidoscope"
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
                  label="Color Morph"
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

          {/* BANK C — CAMERA, PENDULUM & CLOCK (6 Faders) */}
          {(bankFilter === "ALL" || bankFilter === "CAMERA") && (
            <div className="space-y-2.5 pt-2 border-t border-neutral-200">
              <div className="font-mono text-xs font-bold uppercase text-brand-charcoal flex items-center gap-2">
                <span className="text-brand-red">{"03 //"}</span>
                <span>
                  BANK C — CAMERA{" "}
                  {preset.render.style === "pixel-16"
                    ? "(ORTHOGRAPHIQUE)"
                    : "(PERSPECTIVE PS1)"}
                  , PENDULUM &amp; HORLOGE (6 FADERS)
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <ConsoleFader
                  id="fader-speed"
                  shortTag="CLOCK"
                  label="Speed FPS"
                  value={playbackSpeed}
                  min={0}
                  max={200}
                  defaultValue={100}
                  unit="%"
                  accent="red"
                  compact
                  onChange={setPlaybackSpeed}
                />

                {preset.render.camera.kind === "orthographic" ? (
                  <>
                    <ConsoleFader
                      id="fader-cam-zoom"
                      shortTag="ZOOM"
                      label="Ortho Zoom"
                      value={Math.round(preset.render.camera.zoom * 100)}
                      min={50}
                      max={250}
                      defaultValue={100}
                      unit="x"
                      accent="cyan"
                      compact
                      locked={Boolean(preset.locks["render.camera.zoom"])}
                      onToggleLock={() => toggleLock("render.camera.zoom")}
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
                            : curr
                        )
                      }
                    />
                    <ConsoleFader
                      id="fader-cam-x"
                      shortTag="PAN-X"
                      label="Ortho X"
                      value={Math.round(preset.render.camera.x)}
                      min={-64}
                      max={64}
                      defaultValue={0}
                      unit="px"
                      accent="charcoal"
                      compact
                      locked={Boolean(preset.locks["render.camera.x"])}
                      onToggleLock={() => toggleLock("render.camera.x")}
                      onChange={(val) =>
                        updatePreset((curr) =>
                          curr.render.style === "pixel-16"
                            ? {
                                ...curr,
                                render: {
                                  ...curr.render,
                                  camera: { ...curr.render.camera, x: val },
                                },
                              }
                            : curr
                        )
                      }
                    />
                    <ConsoleFader
                      id="fader-cam-y"
                      shortTag="PAN-Y"
                      label="Ortho Y"
                      value={Math.round(preset.render.camera.y)}
                      min={-48}
                      max={48}
                      defaultValue={0}
                      unit="px"
                      accent="charcoal"
                      compact
                      locked={Boolean(preset.locks["render.camera.y"])}
                      onToggleLock={() => toggleLock("render.camera.y")}
                      onChange={(val) =>
                        updatePreset((curr) =>
                          curr.render.style === "pixel-16"
                            ? {
                                ...curr,
                                render: {
                                  ...curr.render,
                                  camera: { ...curr.render.camera, y: val },
                                },
                              }
                            : curr
                        )
                      }
                    />
                  </>
                ) : (
                  <>
                    <ConsoleFader
                      id="fader-cam-dist"
                      shortTag="DIST"
                      label="Cam Dist."
                      value={Math.round(preset.render.camera.distance * 100)}
                      min={50}
                      max={200}
                      defaultValue={100}
                      unit="x"
                      accent="cyan"
                      compact
                      locked={Boolean(preset.locks["render.camera.distance"])}
                      onToggleLock={() => toggleLock("render.camera.distance")}
                      onChange={(val) =>
                        updatePreset((curr) =>
                          curr.render.style === "lowpoly-32"
                            ? {
                                ...curr,
                                render: {
                                  ...curr.render,
                                  camera: {
                                    ...curr.render.camera,
                                    distance: val / 100,
                                  },
                                },
                              }
                            : curr
                        )
                      }
                    />
                    <ConsoleFader
                      id="fader-cam-yaw"
                      shortTag="YAW"
                      label="Cam Yaw"
                      value={Math.round(preset.render.camera.yawDegrees)}
                      min={-90}
                      max={90}
                      defaultValue={0}
                      unit="°"
                      accent="charcoal"
                      compact
                      locked={Boolean(preset.locks["render.camera.yawDegrees"])}
                      onToggleLock={() =>
                        toggleLock("render.camera.yawDegrees")
                      }
                      onChange={(val) =>
                        updatePreset((curr) =>
                          curr.render.style === "lowpoly-32"
                            ? {
                                ...curr,
                                render: {
                                  ...curr.render,
                                  camera: {
                                    ...curr.render.camera,
                                    yawDegrees: val,
                                  },
                                },
                              }
                            : curr
                        )
                      }
                    />
                    <ConsoleFader
                      id="fader-cam-pitch"
                      shortTag="PITCH"
                      label="Cam Pitch"
                      value={Math.round(preset.render.camera.pitchDegrees)}
                      min={-30}
                      max={30}
                      defaultValue={0}
                      unit="°"
                      accent="charcoal"
                      compact
                      locked={Boolean(
                        preset.locks["render.camera.pitchDegrees"]
                      )}
                      onToggleLock={() =>
                        toggleLock("render.camera.pitchDegrees")
                      }
                      onChange={(val) =>
                        updatePreset((curr) =>
                          curr.render.style === "lowpoly-32"
                            ? {
                                ...curr,
                                render: {
                                  ...curr.render,
                                  camera: {
                                    ...curr.render.camera,
                                    pitchDegrees: val,
                                  },
                                },
                              }
                            : curr
                        )
                      }
                    />
                  </>
                )}

                <ConsoleFader
                  id="fader-strobe"
                  shortTag="STROBE"
                  label="Strobe Glow"
                  value={Math.round((preset.effects.strobeGlow ?? 0.25) * 100)}
                  min={0}
                  max={100}
                  defaultValue={25}
                  unit="%"
                  accent="red"
                  compact
                  locked={Boolean(preset.locks["effects.strobeGlow"])}
                  onToggleLock={() => toggleLock("effects.strobeGlow")}
                  onChange={(val) =>
                    updatePreset((curr) => ({
                      ...curr,
                      effects: { ...curr.effects, strobeGlow: val / 100 },
                    }))
                  }
                />

                <ConsoleFader
                  id="fader-pendulum"
                  shortTag="SWAY"
                  label="Pendulum Cam"
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

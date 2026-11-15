"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AvatarExpression, VstPlugin } from "@/lib/openhub-data";
import { pluginToAudioTrack } from "@/lib/openhub-data";
import { useAudioPlayer } from "@/components/audio/AudioPlayerContext";
import { AvatarBD } from "@/components/ui/AvatarBD";

export interface FigmaPluginRackProps {
  plugin: VstPlugin;
}

type FxType = "glitch" | "strobe" | "invert";

type MatrixSource = "Pitch" | "Transient" | "RMS" | "Envelope";
type MatrixTarget = "Scale" | "Rotation" | "Color Shift" | "Distortion";

interface KnobValues {
  cutoff: number;
  resonance: number;
  drive: number;
  mix: number;
  gainDb: number;
}

interface RackPreset {
  id: string;
  label: string;
  subtitle: string;
  expression: AvatarExpression;
  badgeText: string;
  hue: number;
  saturation: number;
  knobs: KnobValues;
  steps: boolean[];
  routes: Record<string, boolean>;
  tip: string;
}

const MATRIX_SOURCES: MatrixSource[] = [
  "Pitch",
  "Transient",
  "RMS",
  "Envelope",
];

const MATRIX_TARGETS: MatrixTarget[] = [
  "Scale",
  "Rotation",
  "Color Shift",
  "Distortion",
];

function routeKey(source: MatrixSource, target: MatrixTarget): string {
  return `${source}->${target}`;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sNorm * Math.min(lNorm, 1 - lNorm);
  const f = (n: number) =>
    lNorm - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

function buildDefaultSteps(plugin: VstPlugin): boolean[] {
  if (plugin.category === "VIDEO_FX") {
    return Array.from(
      { length: 16 },
      (_, idx) => idx % 4 === 0 || idx === 3 || idx === 6 || idx === 11 || idx === 14
    );
  }
  if (plugin.category === "DYNAMICS") {
    return Array.from({ length: 16 }, (_, idx) => idx % 4 === 0 || idx % 8 === 6);
  }
  return Array.from(
    { length: 16 },
    (_, idx) => idx === 0 || idx === 3 || idx === 5 || idx === 8 || idx === 11 || idx === 13
  );
}

function buildInitialRoutes(plugin: VstPlugin): Record<string, boolean> {
  const routes: Record<string, boolean> = {};
  for (const s of MATRIX_SOURCES) {
    for (const t of MATRIX_TARGETS) {
      routes[routeKey(s, t)] = false;
    }
  }
  routes[routeKey("Transient", "Scale")] = true;
  routes[routeKey("RMS", "Distortion")] = true;
  if (plugin.category === "VIDEO_FX" || plugin.category === "REVERB") {
    routes[routeKey("Pitch", "Color Shift")] = true;
    routes[routeKey("Envelope", "Rotation")] = true;
  } else {
    routes[routeKey("Envelope", "Color Shift")] = true;
  }
  return routes;
}

interface RotaryKnobProps {
  id: string;
  label: string;
  value: number;
  defaultValue: number;
  unit?: string;
  onChange: (next: number) => void;
}

const RotaryKnob: React.FC<RotaryKnobProps> = ({
  id,
  label,
  value,
  defaultValue,
  unit = "%",
  onChange,
}) => {
  const dragRef = useRef<{ startY: number; startVal: number } | null>(null);
  const clamped = clamp(Math.round(value), 0, 100);
  const angleDeg = -135 + (clamped / 100) * 270;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startY: e.clientY, startVal: clamped };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || e.buttons !== 1) return;
    const deltaY = dragRef.current.startY - e.clientY;
    const next = clamp(Math.round(dragRef.current.startVal + deltaY * 0.7), 0, 100);
    onChange(next);
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      e.preventDefault();
      onChange(clamp(clamped + 2, 0, 100));
    } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      e.preventDefault();
      onChange(clamp(clamped - 2, 0, 100));
    } else if (e.key === "PageUp") {
      e.preventDefault();
      onChange(clamp(clamped + 10, 0, 100));
    } else if (e.key === "PageDown") {
      e.preventDefault();
      onChange(clamp(clamped - 10, 0, 100));
    } else if (e.key === "Home") {
      e.preventDefault();
      onChange(0);
    } else if (e.key === "End") {
      e.preventDefault();
      onChange(100);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 p-2.5 rounded-xl bg-brand-white border border-[#E5E5E5] shadow-clinical min-w-0">
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.05em] text-[#302E2E] text-center truncate w-full">
        {label}
      </span>

      <div
        id={id}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
        onDoubleClick={() => onChange(clamp(Math.round(defaultValue), 0, 100))}
        title={`${label} [${clamped}${unit}] — Glisser verticalement ou double-clic pour réinitialiser`}
        className="relative w-16 h-16 rounded-full bg-brand-pearl border border-[#E5E5E5] flex items-center justify-center cursor-ns-resize touch-none select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
      >
        <svg viewBox="0 0 64 64" className="w-full h-full" aria-hidden="true">
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke="#E5E5E5"
            strokeWidth="3"
            strokeDasharray="122 165"
            strokeDashoffset="-21"
            transform="rotate(135 32 32)"
          />
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke="#FF1B24"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${Math.round((clamped / 100) * 122)} 165`}
            transform="rotate(135 32 32)"
          />
        </svg>

        <div
          className="absolute w-11 h-11 rounded-full bg-brand-white border border-[#302E2E]/25 shadow-clinical flex items-center justify-center pointer-events-none"
          style={{ transform: `rotate(${angleDeg}deg)` }}
        >
          <span className="w-0.5 h-4 bg-brand-red rounded-full -translate-y-2.5" />
        </div>
      </div>

      <div className="flex items-center justify-center gap-1 w-full">
        <button
          type="button"
          onClick={() => onChange(clamp(clamped - 5, 0, 100))}
          aria-label={`Diminuer ${label}`}
          className="min-w-[32px] min-h-[32px] rounded border border-[#E5E5E5] bg-brand-pearl font-mono text-xs font-bold text-[#302E2E] hover:border-brand-red hover:text-brand-red transition-colors"
        >
          -
        </button>
        <span className="font-mono text-[11px] font-bold text-brand-red tabular-nums px-1.5 py-0.5 rounded bg-brand-pearl border border-[#E5E5E5] min-w-[48px] text-center">
          [{clamped}
          {unit}]
        </span>
        <button
          type="button"
          onClick={() => onChange(clamp(clamped + 5, 0, 100))}
          aria-label={`Augmenter ${label}`}
          className="min-w-[32px] min-h-[32px] rounded border border-[#E5E5E5] bg-brand-pearl font-mono text-xs font-bold text-[#302E2E] hover:border-brand-red hover:text-brand-red transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
};

/**
 * Rack interactif Figma UI Kit v1.0 (Sections A, B, C, D) — Open Hub (by Anarchy).
 */
export const FigmaPluginRack: React.FC<FigmaPluginRackProps> = ({ plugin }) => {
  const {
    currentTrack,
    isPlaying,
    wetDryMix,
    peakLevels,
    playTrack,
    togglePlay,
    toggleWetDry,
    getTimeDomainData,
    getFrequencyData,
    triggerGlitchBurst,
  } = useAudioPlayer();

  const [knobs, setKnobs] = useState<KnobValues>(() => ({
    cutoff: clamp(plugin.defaultKnobs.cutoff, 0, 100),
    resonance: clamp(plugin.defaultKnobs.resonance, 0, 100),
    drive: clamp(plugin.defaultKnobs.drive, 0, 100),
    mix: clamp(plugin.defaultKnobs.mix, 0, 100),
    gainDb: clamp(plugin.defaultKnobs.gainDb, -24, 12),
  }));

  const [steps, setSteps] = useState<boolean[]>(() => buildDefaultSteps(plugin));
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [hue, setHue] = useState<number>(356);
  const [saturation, setSaturation] = useState<number>(92);
  const [activeFx, setActiveFx] = useState<FxType | null>(null);
  const [matrixRoutes, setMatrixRoutes] = useState<Record<string, boolean>>(() =>
    buildInitialRoutes(plugin)
  );
  const [activePresetId, setActivePresetId] = useState<string>("spectateur-a");
  const [tooltipText, setTooltipText] = useState<string>(
    `Rack prêt sur ${plugin.code} (${plugin.audioProfile.bpm} BPM). Cliquez un nœud de matrice ou déclenchez Glitch/Strobe/Invert.`
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const gainTrackRef = useRef<HTMLDivElement | null>(null);
  const burstUntilRef = useRef<number>(0);
  const burstTypeRef = useRef<FxType | null>(null);

  const presets: RackPreset[] = useMemo(
    () => [
      {
        id: "spectateur-a",
        label: "SPECTATEUR 3D A",
        subtitle: "ANAGLYPH CINEMA",
        expression: "spectateur-a",
        badgeText: "3D-A",
        hue: 356,
        saturation: 95,
        knobs: {
          cutoff: clamp(plugin.defaultKnobs.cutoff, 0, 100),
          resonance: clamp(plugin.defaultKnobs.resonance, 0, 100),
          drive: clamp(plugin.defaultKnobs.drive, 0, 100),
          mix: clamp(plugin.defaultKnobs.mix, 0, 100),
          gainDb: clamp(plugin.defaultKnobs.gainDb, -24, 12),
        },
        steps: buildDefaultSteps(plugin),
        routes: buildInitialRoutes(plugin),
        tip: "Preset SPECTATEUR 3D A : séparation stéréo Rouge/Cyan calibrée et saturation harmonique équilibrée.",
      },
      {
        id: "spectateur-b",
        label: "SPECTATEUR 3D B",
        subtitle: "VECTOR MATRIX",
        expression: "spectateur-b",
        badgeText: "3D-B",
        hue: 188,
        saturation: 96,
        knobs: {
          cutoff: 88,
          resonance: 64,
          drive: 70,
          mix: 100,
          gainDb: 1.0,
        },
        steps: Array.from(
          { length: 16 },
          (_, i) => i % 2 === 0 || i === 5 || i === 13
        ),
        routes: {
          [routeKey("Pitch", "Rotation")]: true,
          [routeKey("Transient", "Scale")]: true,
          [routeKey("RMS", "Color Shift")]: true,
          [routeKey("Envelope", "Distortion")]: true,
        },
        tip: "Preset SPECTATEUR 3D B : les 4 sources modulent les 4 cibles vidéo 60FPS avec accentuation Cyan #00E5FF.",
      },
      {
        id: "anarchy-overdrive",
        label: "ANARCHY OVERDRIVE",
        subtitle: "MAX HARMONICS",
        expression: "hyped",
        badgeText: "OVR",
        hue: 4,
        saturation: 100,
        knobs: {
          cutoff: 94,
          resonance: 78,
          drive: 96,
          mix: 100,
          gainDb: 4.5,
        },
        steps: Array.from({ length: 16 }, (_, i) => i % 3 !== 2),
        routes: {
          [routeKey("Pitch", "Distortion")]: true,
          [routeKey("Transient", "Scale")]: true,
          [routeKey("Transient", "Distortion")]: true,
          [routeKey("RMS", "Rotation")]: true,
          [routeKey("Envelope", "Color Shift")]: true,
        },
        tip: "Mode ANARCHY OVERDRIVE : saturation maximale, résonance haute et impulsion Glitch réactive sur les transitoires.",
      },
      {
        id: "clinical-clean",
        label: "CLINICAL CLEAN",
        subtitle: "REFERENCE 0 dB",
        expression: "dsp",
        badgeText: "0dB",
        hue: 215,
        saturation: 22,
        knobs: {
          cutoff: 72,
          resonance: 18,
          drive: 25,
          mix: 50,
          gainDb: 0,
        },
        steps: Array.from({ length: 16 }, (_, i) => i % 4 === 0),
        routes: {
          [routeKey("RMS", "Scale")]: true,
        },
        tip: "Mode CLINICAL CLEAN : monitoring chirurgical 0 dB sans distorsion pour comparer la dynamique DRY/WET.",
      },
    ],
    [plugin]
  );

  // Respect prefers-reduced-motion for strobes/flashes (WCAG 2.3.1)
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const onChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Listen to global StickyBottomPlayer / rack glitch burst events
  useEffect(() => {
    const handleBurst = (event: Event) => {
      const custom = event as CustomEvent<{ type?: FxType }>;
      const type = custom.detail?.type ?? "glitch";
      burstTypeRef.current = type;
      burstUntilRef.current = Date.now() + 550;
      setActiveFx(type);
      window.setTimeout(() => {
        if (Date.now() >= burstUntilRef.current - 20) {
          setActiveFx(null);
        }
      }, 560);
    };
    window.addEventListener("openhub:glitch-burst", handleBurst);
    return () => window.removeEventListener("openhub:glitch-burst", handleBurst);
  }, []);

  // Sync 16-step playhead to BPM when global audio player is running
  useEffect(() => {
    if (!isPlaying) return;
    const bpm = currentTrack?.bpm ?? plugin.audioProfile.bpm;
    const intervalMs = Math.max(70, Math.round(60000 / bpm / 4));
    const timer = window.setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 16);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [isPlaying, currentTrack?.bpm, plugin.audioProfile.bpm]);

  const knobsRef = useRef(knobs);
  knobsRef.current = knobs;
  const stepsRef = useRef(steps);
  stepsRef.current = steps;
  const currentStepRef = useRef(currentStep);
  currentStepRef.current = currentStep;
  const hueRef = useRef(hue);
  hueRef.current = hue;
  const satRef = useRef(saturation);
  satRef.current = saturation;
  const routesRef = useRef(matrixRoutes);
  routesRef.current = matrixRoutes;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const wetDryRef = useRef(wetDryMix);
  wetDryRef.current = wetDryMix;
  const reducedMotionRef = useRef(prefersReducedMotion);
  reducedMotionRef.current = prefersReducedMotion;

  // Section A: 60fps Audio-Reactive Video Output Preview Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const timeBuf = new Uint8Array(256);
    const freqBuf = new Uint8Array(64);
    let animId = 0;
    let phase = 0;

    const drawFrame = () => {
      const w = canvas.width;
      const h = canvas.height;
      phase += isPlayingRef.current ? 0.045 : 0.015;

      getTimeDomainData(timeBuf);
      getFrequencyData(freqBuf);

      const k = knobsRef.current;
      const activeStepOn = stepsRef.current[currentStepRef.current] ?? false;
      const now = Date.now();
      const isBursting = now < burstUntilRef.current;
      const fx = isBursting ? burstTypeRef.current : null;
      const routes = routesRef.current;

      // Compute RMS & transient proxy from live audio buffers
      let rmsSum = 0;
      for (let i = 0; i < timeBuf.length; i++) {
        const d = (timeBuf[i] - 128) / 128;
        rmsSum += d * d;
      }
      const rms = Math.sqrt(rmsSum / timeBuf.length);
      const peakBass = freqBuf[2] / 255;

      const scaleRoute =
        routes[routeKey("Transient", "Scale")] || routes[routeKey("RMS", "Scale")];
      const rotRoute =
        routes[routeKey("Envelope", "Rotation")] ||
        routes[routeKey("Pitch", "Rotation")] ||
        routes[routeKey("RMS", "Rotation")];
      const colorRoute =
        routes[routeKey("Pitch", "Color Shift")] ||
        routes[routeKey("RMS", "Color Shift")] ||
        routes[routeKey("Envelope", "Color Shift")];
      const distRoute =
        routes[routeKey("RMS", "Distortion")] ||
        routes[routeKey("Transient", "Distortion")] ||
        routes[routeKey("Pitch", "Distortion")];

      const invertActive = fx === "invert" && !reducedMotionRef.current;
      const strobeFlash =
        fx === "strobe" && !reducedMotionRef.current && Math.floor(now / 70) % 2 === 0;
      const glitchActive = fx === "glitch" && !reducedMotionRef.current;

      // Background fill
      ctx.fillStyle = invertActive
        ? "#F5F5F5"
        : strobeFlash
        ? "#2A080B"
        : "#0E0E12";
      ctx.fillRect(0, 0, w, h);

      // Subtle clinical grid
      ctx.strokeStyle = invertActive
        ? "rgba(34,34,38,0.12)"
        : "rgba(255,255,255,0.07)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Spectrum bars at bottom
      const barCount = 32;
      const barW = w / barCount;
      const shiftDeg = colorRoute ? Math.round((rms + peakBass) * 90) : 0;
      const dynHue = (hueRef.current + shiftDeg) % 360;
      ctx.fillStyle = `hsla(${dynHue}, ${satRef.current}%, 52%, 0.42)`;
      for (let i = 0; i < barCount; i++) {
        const val = isPlayingRef.current
          ? freqBuf[i] / 255
          : 0.14 + 0.12 * Math.sin(phase * 1.4 + i * 0.4) * (k.cutoff / 100);
        const barH = Math.max(4, val * (h * 0.45) * (0.6 + k.mix / 200));
        ctx.fillRect(i * barW + 2, h - barH, Math.max(2, barW - 4), barH);
      }

      // Audio-reactive 3D Anaglyph Vector Geometry
      const cx = w * 0.5;
      const cy = h * 0.47;
      const gainScale = 1 + (k.gainDb + 24) / 72;
      const baseRadius =
        Math.min(w, h) *
        0.22 *
        gainScale *
        (1 + (scaleRoute ? rms * 0.9 + (activeStepOn ? 0.12 : 0) : 0.05));
      const rot =
        (rotRoute ? phase * (0.8 + k.resonance / 80) : phase * 0.25) +
        (activeStepOn ? 0.12 : 0);
      const sides = plugin.category === "VIDEO_FX" ? 6 : 8;
      const anaglyphOffset =
        3 +
        (k.drive / 100) * 10 +
        (distRoute ? rms * 22 : 2) +
        (glitchActive ? (Math.sin(now * 0.08) * 14) : 0);

      const drawPolygon = (offsetX: number, stroke: string) => {
        ctx.save();
        ctx.translate(cx + offsetX, cy);
        ctx.rotate(rot);
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
          const theta = (i / sides) * Math.PI * 2;
          const warp =
            1 +
            (k.resonance / 100) *
              0.24 *
              Math.sin(theta * 3 + phase * 2) *
              (isPlayingRef.current ? 1 + rms * 2 : 0.6);
          const rx = Math.cos(theta) * baseRadius * warp;
          const ry = Math.sin(theta) * baseRadius * warp;
          if (i === 0) ctx.moveTo(rx, ry);
          else ctx.lineTo(rx, ry);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      };

      drawPolygon(-anaglyphOffset, invertActive ? "#00E5FF" : "#FF1B24");
      drawPolygon(anaglyphOffset, invertActive ? "#FF1B24" : "#00E5FF");

      // Center oscilloscope waveform trace
      ctx.beginPath();
      ctx.strokeStyle = invertActive
        ? "#000000"
        : `hsl(${dynHue}, ${satRef.current}%, 58%)`;
      ctx.lineWidth = 2;
      for (let i = 0; i < timeBuf.length; i++) {
        const x = (i / (timeBuf.length - 1)) * w;
        const sample = isPlayingRef.current
          ? (timeBuf[i] - 128) / 128
          : 0.25 *
            Math.sin((i / timeBuf.length) * Math.PI * 6 + phase * 2) *
            (0.4 + k.drive / 150);
        const distAmt = distRoute && wetDryRef.current ? 1 + k.drive / 90 : 1;
        const y =
          cy +
          Math.tanh(sample * distAmt) *
            (h * 0.24) *
            (0.5 + k.cutoff / 180) +
          (glitchActive && i % 16 < 3 ? (Math.sin(i + phase * 10) * 18) : 0);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animId = window.requestAnimationFrame(drawFrame);
    };

    animId = window.requestAnimationFrame(drawFrame);
    return () => window.cancelAnimationFrame(animId);
  }, [getFrequencyData, getTimeDomainData, plugin.category]);

  const handleTriggerFx = (fx: FxType) => {
    triggerGlitchBurst(fx);
    setTooltipText(
      `Effet ${fx.toUpperCase()} déclenché sur ${plugin.code} (synchronisé avec l'oscilloscope global).`
    );
  };

  const handleToggleStep = (index: number) => {
    setSteps((prev) => prev.map((val, i) => (i === index ? !val : val)));
  };

  const handleColorWheelPointer = useCallback(
    (clientX: number, clientY: number) => {
      const wheel = wheelRef.current;
      if (!wheel) return;
      const rect = wheel.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const rad = Math.atan2(dy, dx);
      const deg = Math.round(((rad * 180) / Math.PI + 360 + 90) % 360);
      const dist = Math.min(1, Math.hypot(dx, dy) / (rect.width / 2));
      setHue(deg);
      setSaturation(clamp(Math.round(dist * 100), 15, 100));
    },
    []
  );

  const handleGainPointer = useCallback((clientY: number) => {
    const track = gainTrackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    if (rect.height <= 0) return;
    const ratio = 1 - (clientY - rect.top) / rect.height;
    const bounded = clamp(ratio, 0, 1);
    const nextDb = Math.round((-24 + bounded * 36) * 2) / 2;
    setKnobs((prev) => ({ ...prev, gainDb: clamp(nextDb, -24, 12) }));
  }, []);

  const toggleMatrixRoute = (source: MatrixSource, target: MatrixTarget) => {
    const key = routeKey(source, target);
    setMatrixRoutes((prev) => {
      const nextVal = !prev[key];
      setTooltipText(
        `Matrice de modulation : ${source} → ${target} ${
          nextVal ? "CONNECTÉ (#FF1B24)" : "DÉCONNECTÉ"
        }.`
      );
      return { ...prev, [key]: nextVal };
    });
  };

  const applyPreset = (preset: RackPreset) => {
    setActivePresetId(preset.id);
    setHue(preset.hue);
    setSaturation(preset.saturation);
    setKnobs({ ...preset.knobs });
    setSteps([...preset.steps]);
    setMatrixRoutes({ ...preset.routes });
    setTooltipText(preset.tip);
  };

  const activeHex = useMemo(
    () => hslToHex(hue, saturation, 52),
    [hue, saturation]
  );

  const reticleCoords = useMemo(() => {
    const rad = ((hue - 90) * Math.PI) / 180;
    const radiusPct = (saturation / 100) * 40;
    return {
      left: `${50 + Math.cos(rad) * radiusPct}%`,
      top: `${50 + Math.sin(rad) * radiusPct}%`,
    };
  }, [hue, saturation]);

  const isThisTrack = currentTrack?.id === plugin.id;
  const isThisPlaying = isThisTrack && isPlaying;
  const peakMax = Math.max(peakLevels.left, peakLevels.right);
  const currentPreset =
    presets.find((p) => p.id === activePresetId) ?? presets[0];

  const mascotExpression: AvatarExpression = activeFx
    ? "glitch"
    : isPlaying && peakMax > 84
    ? "shocked"
    : isPlaying && peakMax > 65
    ? "hyped"
    : currentPreset.expression;

  const gainPercent = ((knobs.gainDb + 24) / 36) * 100;

  // Coordinates for 4x4 Bezier Modulation Matrix (viewBox 0 0 400 180)
  const sourceY = [24, 68, 112, 156];
  const targetY = [24, 68, 112, 156];

  return (
    <div
      id="figma-plugin-rack"
      data-testid="figma-plugin-rack"
      className="bg-brand-pearl border-2 border-neutral-200/90 rounded-2xl p-3 sm:p-5 shadow-clinical space-y-5 min-w-0"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(48,46,46,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(48,46,46,0.045) 1px, transparent 1px)",
        backgroundSize: "16px 16px",
      }}
    >
      {/* Top Bar Figma UI Kit */}
      <div className="bg-brand-white border border-[#E5E5E5] rounded-xl px-3.5 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              isThisPlaying ? "bg-brand-red animate-pulse" : "bg-brand-red"
            }`}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <div className="font-mono text-xs font-bold uppercase tracking-[0.05em] text-[#302E2E] truncate">
              {`FIGMA UI KIT RACK // ${plugin.code}`}
            </div>
            <div className="font-mono text-[10px] text-neutral-500">
              {`BPM: ${plugin.audioProfile.bpm} • KEY: ${plugin.audioProfile.key} • ${
                wetDryMix ? "DSP WET" : "BYPASS DRY"
              }`}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              isThisTrack ? togglePlay() : playTrack(pluginToAudioTrack(plugin))
            }
            className={[
              "min-h-[40px] px-3 py-1.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider border transition-colors",
              isThisPlaying
                ? "bg-brand-red text-brand-white border-brand-red"
                : "bg-brand-white text-[#302E2E] border-[#302E2E]/30 hover:border-brand-red hover:text-brand-red",
            ].join(" ")}
          >
            {isThisPlaying ? "❚❚ PAUSE RACK" : "▶ PLAY RACK"}
          </button>

          <button
            type="button"
            onClick={toggleWetDry}
            aria-pressed={wetDryMix}
            className={[
              "min-h-[40px] px-3 py-1.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider border transition-colors",
              wetDryMix
                ? "bg-brand-pearl text-brand-red border-brand-red"
                : "bg-brand-pearl text-[#302E2E] border-neutral-300",
            ].join(" ")}
          >
            {wetDryMix ? "DSP: WET" : "DSP: DRY"}
          </button>

          <button
            type="button"
            onClick={() => applyPreset(presets[0])}
            className="min-h-[40px] px-3 py-1.5 rounded-lg font-mono text-xs font-medium uppercase tracking-wider bg-brand-pearl text-[#302E2E] border border-[#E5E5E5] hover:border-black transition-colors"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Zone Principale 2 Colonnes Desktop : Section A (Gauche) + Section C Matrix (Droite) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-w-0">
        {/* SECTION A — VIDEO OUTPUT PREVIEW LEVEL 01 */}
        <section
          aria-labelledby="rack-section-a"
          className="lg:col-span-7 bg-brand-white border border-[#E5E5E5] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col min-w-0"
        >
          <div className="px-4 py-2.5 border-b border-[#E5E5E5] bg-brand-pearl/60 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2 h-2 rounded-full bg-brand-red shrink-0"
                aria-hidden="true"
              />
              <h3
                id="rack-section-a"
                className="font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[#302E2E]"
              >
                VIDEO OUTPUT PREVIEW LEVEL 01
              </h3>
            </div>
            <span className="font-mono text-[11px] font-bold text-brand-red bg-brand-white px-2 py-0.5 rounded border border-[#E5E5E5]">
              [ 1920x1080 | 60FPS ]
            </span>
          </div>

          <div className="relative w-full aspect-video bg-[#0E0E12] overflow-hidden">
            <canvas
              ref={canvasRef}
              width={640}
              height={360}
              aria-label="Prévisualisation vidéo audio-réactive 1920x1080 60FPS"
              className="w-full h-full block"
            />

            {/* Badge FX actif dans le viewport uniquement */}
            {activeFx && (
              <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded bg-brand-red text-brand-white font-mono text-[10px] font-bold uppercase border-2 border-black shadow-comic-sm">
                FX ACTIVE: {activeFx.toUpperCase()}
              </div>
            )}

            {/* Overlay statut inférieur gauche avec AvatarBD Spectateur miniature */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:right-auto bg-brand-white/95 border-2 border-black rounded-lg px-2.5 py-1.5 shadow-comic-sm flex flex-wrap items-center gap-2 max-w-full">
              <AvatarBD
                name={`Spectateur ${plugin.code}`}
                expression={mascotExpression}
                size="sm"
                audioReactive={isPlaying}
                anaglyphRing={isPlaying}
              />
              <span className="font-mono text-[10px] sm:text-xs font-bold text-[#302E2E] tracking-tight">
                FPS: 60.0 | RES: FULL | SYNC: DAW
              </span>
            </div>
          </div>
        </section>

        {/* SECTION C1 — MODULATION MATRIX ROUTER (Câbles Bézier 1.5px) */}
        <section
          aria-labelledby="rack-section-c-matrix"
          className="lg:col-span-5 bg-brand-white border border-[#E5E5E5] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex flex-col min-w-0"
        >
          <div className="px-4 py-2.5 border-b border-[#E5E5E5] bg-brand-pearl/60 flex flex-wrap items-center justify-between gap-2">
            <h3
              id="rack-section-c-matrix"
              className="font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[#302E2E]"
            >
              MODULATION MATRIX ROUTER
            </h3>
            <span className="font-mono text-[10px] text-brand-red font-bold">
              {
                Object.values(matrixRoutes).filter(Boolean).length
              }{" "}
              PATCHES 1.5px
            </span>
          </div>

          <div className="p-3 sm:p-4 space-y-3 flex-1 flex flex-col justify-between min-w-0">
            {/* Câblage SVG Bézier fluide 1.5px dans conteneur scrollable sur 375px */}
            <div className="overflow-x-auto pb-1">
              <div className="min-w-[360px] bg-brand-pearl/60 border border-[#E5E5E5] rounded-xl p-2.5">
                <div className="grid grid-cols-[90px_1fr_98px] items-center gap-1">
                  <div className="space-y-3 font-mono text-[10px] font-bold text-[#302E2E] uppercase">
                    {MATRIX_SOURCES.map((src) => (
                      <div key={src} className="h-7 flex items-center justify-end pr-1">
                        {src}
                      </div>
                    ))}
                  </div>

                  <svg
                    viewBox="0 0 220 180"
                    className="w-full h-[156px] block"
                    role="img"
                    aria-label="Diagramme de câblage Bézier Modulation Matrix"
                  >
                    {MATRIX_SOURCES.map((src, si) =>
                      MATRIX_TARGETS.map((tgt, ti) => {
                        const key = routeKey(src, tgt);
                        const active = Boolean(matrixRoutes[key]);
                        const y1 = sourceY[si];
                        const y2 = targetY[ti];
                        const d = `M 14 ${y1} C 102 ${y1}, 118 ${y2}, 206 ${y2}`;
                        return (
                          <path
                            key={key}
                            d={d}
                            fill="none"
                            stroke={active ? "#FF1B24" : "#302E2E"}
                            strokeWidth="1.5"
                            strokeOpacity={active ? 0.95 : 0.14}
                          />
                        );
                      })
                    )}

                    {/* Points de connexion sources */}
                    {MATRIX_SOURCES.map((src, si) => {
                      const hasAny = MATRIX_TARGETS.some(
                        (tgt) => matrixRoutes[routeKey(src, tgt)]
                      );
                      return (
                        <circle
                          key={src}
                          cx={14}
                          cy={sourceY[si]}
                          r={5}
                          fill={hasAny ? "#FF1B24" : "#FFFFFF"}
                          stroke="#302E2E"
                          strokeWidth="1.5"
                        />
                      );
                    })}

                    {/* Points de connexion cibles */}
                    {MATRIX_TARGETS.map((tgt, ti) => {
                      const hasAny = MATRIX_SOURCES.some(
                        (src) => matrixRoutes[routeKey(src, tgt)]
                      );
                      return (
                        <circle
                          key={tgt}
                          cx={206}
                          cy={targetY[ti]}
                          r={5}
                          fill={hasAny ? "#FF1B24" : "#FFFFFF"}
                          stroke="#302E2E"
                          strokeWidth="1.5"
                        />
                      );
                    })}
                  </svg>

                  <div className="space-y-3 font-mono text-[10px] font-bold text-[#302E2E] uppercase">
                    {MATRIX_TARGETS.map((tgt) => (
                      <div key={tgt} className="h-7 flex items-center pl-1 truncate">
                        {tgt}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Grille interactive 4x4 pour activer/désactiver chaque câble */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[300px] border-collapse font-mono text-[10px]">
                <thead>
                  <tr>
                    <th className="p-1 text-left text-neutral-500 font-medium">
                      SRC \ TGT
                    </th>
                    {MATRIX_TARGETS.map((tgt) => (
                      <th
                        key={tgt}
                        className="p-1 text-center text-[#302E2E] font-bold uppercase"
                      >
                        {tgt.split(" ")[0]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MATRIX_SOURCES.map((src) => (
                    <tr key={src} className="border-t border-neutral-100">
                      <td className="p-1 font-bold text-[#302E2E]">{src}</td>
                      {MATRIX_TARGETS.map((tgt) => {
                        const key = routeKey(src, tgt);
                        const active = Boolean(matrixRoutes[key]);
                        return (
                          <td key={key} className="p-1 text-center">
                            <button
                              type="button"
                              onClick={() => toggleMatrixRoute(src, tgt)}
                              aria-pressed={active}
                              aria-label={`Router ${src} vers ${tgt}`}
                              className={[
                                "w-7 h-7 rounded-md border inline-flex items-center justify-center transition-colors",
                                active
                                  ? "bg-brand-red/10 border-brand-red text-brand-red"
                                  : "bg-brand-pearl border-[#E5E5E5] text-neutral-400 hover:border-[#302E2E]",
                              ].join(" ")}
                            >
                              <span
                                className={`w-2.5 h-2.5 rounded-full ${
                                  active ? "bg-brand-red" : "bg-neutral-300"
                                }`}
                              />
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* SECTION B — 16-STEP SEQUENCER + COLOR WHEEL + FX TRIGGERS */}
      <section
        aria-labelledby="rack-section-b"
        className="bg-brand-white border border-[#E5E5E5] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-3.5 sm:p-5 space-y-5 min-w-0"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E5E5] pb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-2 h-2 rounded-full bg-brand-red shrink-0"
              aria-hidden="true"
            />
            <h3
              id="rack-section-b"
              className="font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[#302E2E]"
            >
              STEP SEQUENCER [16 STEPS / 1/16TH]
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSteps(Array.from({ length: 16 }, () => false))}
              className="min-h-[36px] px-2.5 py-1 rounded border border-[#E5E5E5] bg-brand-pearl font-mono text-[10px] font-bold uppercase text-[#302E2E] hover:border-brand-red"
            >
              CLEAR
            </button>
            <button
              type="button"
              onClick={() => setSteps(Array.from({ length: 16 }, () => true))}
              className="min-h-[36px] px-2.5 py-1 rounded border border-[#E5E5E5] bg-brand-pearl font-mono text-[10px] font-bold uppercase text-[#302E2E] hover:border-brand-red"
            >
              FILL
            </button>
            <button
              type="button"
              onClick={() => setSteps(buildDefaultSteps(plugin))}
              className="min-h-[36px] px-2.5 py-1 rounded border border-[#E5E5E5] bg-brand-pearl font-mono text-[10px] font-bold uppercase text-[#302E2E] hover:border-brand-red"
            >
              DEFAULT
            </button>
          </div>
        </div>

        {/* 16 Steps — Responsive 4 -> 8 -> 16 columns without grid-cols-16 */}
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-[repeat(16,minmax(0,1fr))] gap-1.5 sm:gap-2">
          {steps.map((isActive, idx) => {
            const isPlayhead = currentStep === idx;
            const stepLabel = String(idx + 1).padStart(2, "0");
            return (
              <button
                key={stepLabel}
                type="button"
                onClick={() => handleToggleStep(idx)}
                aria-pressed={isActive}
                aria-label={`Pas ${stepLabel} ${isActive ? "actif" : "inactif"}`}
                className={[
                  "relative min-h-[48px] rounded-lg border font-mono text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all",
                  isActive
                    ? "bg-brand-red border-brand-red text-brand-white shadow-[0_0_12px_rgba(255,27,36,0.45)]"
                    : "bg-[#F5F5F5] border-[#E5E5E5] text-[#302E2E] hover:border-[#302E2E]",
                  isPlayhead ? "ring-2 ring-[#302E2E] ring-offset-1" : "",
                ].join(" ")}
              >
                {/* Playhead vertical line 2px #302E2E */}
                {isPlayhead && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-[#302E2E] opacity-75 pointer-events-none"
                  />
                )}
                <span className="relative z-10">{stepLabel}</span>
                <span
                  aria-hidden="true"
                  className={`relative z-10 w-2 h-2 rounded-full ${
                    isActive ? "bg-brand-white" : "bg-neutral-300"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Color Wheel + FX Triggers (Glitch / Strobe / Invert) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-[#E5E5E5] items-center">
          {/* Minimalist Color Wheel + Crosshair Reticle */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 min-w-0">
            <div
              ref={wheelRef}
              role="slider"
              tabIndex={0}
              aria-label="Roue chromatique Hue (degrés)"
              aria-valuemin={0}
              aria-valuemax={360}
              aria-valuenow={hue}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                handleColorWheelPointer(e.clientX, e.clientY);
              }}
              onPointerMove={(e) => {
                if (e.buttons !== 1) return;
                handleColorWheelPointer(e.clientX, e.clientY);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                  e.preventDefault();
                  setHue((h) => (h + 15) % 360);
                } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                  e.preventDefault();
                  setHue((h) => (h - 15 + 360) % 360);
                }
              }}
              className="relative w-28 h-28 rounded-full border-2 border-[#302E2E] shrink-0 cursor-crosshair touch-none select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
              style={{
                background:
                  "conic-gradient(from 0deg, #ff1b24, #ff9900, #ffee00, #22c55e, #00e5ff, #3b82f6, #d946ef, #ff1b24)",
              }}
            >
              {/* Minimalist inner white/charcoal studio ring + thin crosshair reticle */}
              <div className="absolute inset-3 rounded-full bg-brand-white/25 border border-[#302E2E]/40 pointer-events-none" />
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-2 bottom-2 w-px bg-black/45 -translate-x-1/2 pointer-events-none"
              />
              <span
                aria-hidden="true"
                className="absolute top-1/2 left-2 right-2 h-px bg-black/45 -translate-y-1/2 pointer-events-none"
              />
              {/* Red circular reticle cursor */}
              <span
                aria-hidden="true"
                className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full bg-brand-red border-2 border-white shadow pointer-events-none"
                style={{
                  left: reticleCoords.left,
                  top: reticleCoords.top,
                }}
              />
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.05em] text-[#302E2E]">
                COLOR WHEEL // LIVE SHADER TINT
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="w-5 h-5 rounded border border-black shrink-0"
                  style={{ backgroundColor: activeHex }}
                  aria-hidden="true"
                />
                <span className="font-mono text-xs font-bold text-brand-red">
                  {activeHex}
                </span>
              </div>
              <div className="font-mono text-[11px] text-neutral-600">
                HSL({hue}°, {saturation}%, 52%)
              </div>
            </div>
          </div>

          {/* FX Push-Buttons: Glitch / Strobe / Invert */}
          <div className="space-y-2 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.05em] text-[#302E2E]">
                FX TRIGGERS (BUS VIDÉO &amp; AUDIO)
              </span>
              {prefersReducedMotion && (
                <span className="font-mono text-[9px] text-neutral-500 uppercase">
                  REDUCED MOTION ON
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "glitch", label: "Glitch" },
                  { id: "strobe", label: "Strobe" },
                  { id: "invert", label: "Invert" },
                ] as const
              ).map((fx) => {
                const isActive = activeFx === fx.id;
                return (
                  <button
                    key={fx.id}
                    type="button"
                    onClick={() => handleTriggerFx(fx.id)}
                    aria-pressed={isActive}
                    className={[
                      "min-h-[44px] px-2.5 py-2 rounded-lg bg-brand-white border font-mono text-xs font-bold text-[#302E2E] flex items-center justify-center gap-2 transition-all",
                      isActive
                        ? "border-brand-red shadow-[0_0_10px_rgba(255,27,36,0.3)]"
                        : "border-[#E5E5E5] hover:border-[#302E2E]",
                    ].join(" ")}
                  >
                    <span
                      aria-hidden="true"
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        isActive ? "bg-brand-red" : "bg-brand-red/75"
                      }`}
                    />
                    <span>{fx.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION C2 (Knobs & Gain Slider) + SECTION D (3D BD Presets & Comic Tooltip) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-w-0">
        {/* Rotary Knobs & Linear Vertical Gain Slider */}
        <section
          aria-labelledby="rack-section-c-knobs"
          className="lg:col-span-7 bg-brand-white border border-[#E5E5E5] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-3.5 sm:p-5 space-y-4 min-w-0"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E5E5] pb-2.5">
            <h3
              id="rack-section-c-knobs"
              className="font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[#302E2E]"
            >
              KNOBS &amp; VERTICAL GAIN SLIDER
            </h3>
            <span className="font-mono text-[10px] text-neutral-500">
              0..100% // -24..+12 dB
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-stretch min-w-0">
            <RotaryKnob
              id="knob-cutoff"
              label="CUTOFF FREQ"
              value={knobs.cutoff}
              defaultValue={plugin.defaultKnobs.cutoff}
              onChange={(cutoff) => setKnobs((p) => ({ ...p, cutoff }))}
            />
            <RotaryKnob
              id="knob-resonance"
              label="RESONANCE"
              value={knobs.resonance}
              defaultValue={plugin.defaultKnobs.resonance}
              onChange={(resonance) => setKnobs((p) => ({ ...p, resonance }))}
            />
            <RotaryKnob
              id="knob-drive"
              label="DRIVE"
              value={knobs.drive}
              defaultValue={plugin.defaultKnobs.drive}
              onChange={(drive) => setKnobs((p) => ({ ...p, drive }))}
            />
            <RotaryKnob
              id="knob-mix"
              label="MIX"
              value={knobs.mix}
              defaultValue={plugin.defaultKnobs.mix}
              onChange={(mix) => setKnobs((p) => ({ ...p, mix }))}
            />

            {/* Linear Vertical Gain Slider (-24 to +12 dB) */}
            <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-between gap-2 p-2.5 rounded-xl bg-brand-white border border-[#E5E5E5] shadow-clinical min-w-0">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.05em] text-[#302E2E]">
                GAIN
              </span>

              <div
                ref={gainTrackRef}
                role="slider"
                tabIndex={0}
                aria-label="GAIN (dB)"
                aria-valuemin={-24}
                aria-valuemax={12}
                aria-valuenow={knobs.gainDb}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  handleGainPointer(e.clientY);
                }}
                onPointerMove={(e) => {
                  if (e.buttons !== 1) return;
                  handleGainPointer(e.clientY);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowRight") {
                    e.preventDefault();
                    setKnobs((p) => ({
                      ...p,
                      gainDb: clamp(p.gainDb + 1, -24, 12),
                    }));
                  } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
                    e.preventDefault();
                    setKnobs((p) => ({
                      ...p,
                      gainDb: clamp(p.gainDb - 1, -24, 12),
                    }));
                  } else if (e.key === "Home") {
                    e.preventDefault();
                    setKnobs((p) => ({ ...p, gainDb: -24 }));
                  } else if (e.key === "End") {
                    e.preventDefault();
                    setKnobs((p) => ({ ...p, gainDb: 12 }));
                  }
                }}
                onDoubleClick={() =>
                  setKnobs((p) => ({
                    ...p,
                    gainDb: clamp(plugin.defaultKnobs.gainDb, -24, 12),
                  }))
                }
                title="Gain linéaire (-24 à +12 dB) — double-clic pour réinitialiser"
                className="relative w-10 h-24 flex items-center justify-center cursor-ns-resize touch-none select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
              >
                <div className="w-1.5 h-full rounded-full bg-[#302E2E]" />
                <div
                  className="absolute left-1 right-1 h-4 rounded bg-brand-white border border-[#302E2E] shadow-sm flex items-center justify-center pointer-events-none"
                  style={{
                    bottom: `calc(${gainPercent}% - 8px)`,
                  }}
                >
                  <span className="w-5 h-[2px] bg-brand-red rounded" />
                </div>
              </div>

              <div className="flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setKnobs((p) => ({
                      ...p,
                      gainDb: clamp(p.gainDb - 1, -24, 12),
                    }))
                  }
                  aria-label="Baisser le gain dB"
                  className="min-w-[28px] min-h-[28px] rounded border border-[#E5E5E5] bg-brand-pearl font-mono text-xs font-bold text-[#302E2E]"
                >
                  -
                </button>
                <span className="font-mono text-[10px] font-bold text-brand-red tabular-nums px-1">
                  {knobs.gainDb > 0 ? `+${knobs.gainDb}` : knobs.gainDb}dB
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setKnobs((p) => ({
                      ...p,
                      gainDb: clamp(p.gainDb + 1, -24, 12),
                    }))
                  }
                  aria-label="Augmenter le gain dB"
                  className="min-w-[28px] min-h-[28px] rounded border border-[#E5E5E5] bg-brand-pearl font-mono text-xs font-bold text-[#302E2E]"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION D — 3D BD AVATAR PRESETS (SPECTATEUR 3D A/B) & COMIC TOOLTIPS */}
        <section
          aria-labelledby="rack-section-d"
          className="lg:col-span-5 bg-brand-white border border-[#E5E5E5] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-3.5 sm:p-5 space-y-4 min-w-0"
        >
          <div className="flex items-center justify-between gap-2 border-b border-[#E5E5E5] pb-2.5">
            <h3
              id="rack-section-d"
              className="font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[#302E2E]"
            >
              3D BD AVATAR PRESETS
            </h3>
            <span className="font-mono text-[10px] font-bold text-brand-black bg-brand-pearl px-2 py-0.5 rounded border-2 border-black">
              CARTOON // #FF1B24 · #00E5FF
            </span>
          </div>

          {/* 4 Preset Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {presets.map((preset) => {
              const selected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  aria-pressed={selected}
                  className={[
                    "min-h-[56px] p-2.5 rounded-xl border-2 border-black shadow-comic-sm text-left flex items-center gap-2.5 transition-transform hover:-translate-y-0.5",
                    selected ? "bg-brand-pearl ring-2 ring-brand-red" : "bg-brand-white",
                  ].join(" ")}
                >
                  <AvatarBD
                    name={preset.label}
                    expression={preset.expression}
                    size="sm"
                    badgeText={preset.badgeText}
                    anaglyphRing={selected}
                  />
                  <div className="min-w-0">
                    <div className="font-mono text-[11px] font-bold text-brand-black truncate">
                      {preset.label}
                    </div>
                    <div className="font-mono text-[9px] text-neutral-600 truncate">
                      {preset.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mascotte réactive au signal + Bulle de dialogue BD (Tooltip) */}
          <div className="pt-1 flex items-start gap-3">
            <AvatarBD
              name="Mascotte Spectateur 3D"
              expression={mascotExpression}
              size="lg"
              badgeText={activeFx ? activeFx.toUpperCase() : "LIVE"}
              audioReactive={isPlaying}
              anaglyphRing={isPlaying || Boolean(activeFx)}
            />
            <div
              role="status"
              aria-live="polite"
              className="flex-1 min-w-0 bg-brand-white border-2 border-black rounded-xl p-3 shadow-comic-sm space-y-1"
            >
              <div className="font-mono text-[10px] font-bold uppercase text-brand-red">
                ASTUCE SPECTATEUR 3D // PEAK {peakMax}%
              </div>
              <p className="text-xs text-brand-charcoal leading-snug">
                {tooltipText}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FigmaPluginRack;

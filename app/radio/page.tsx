"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AvatarBD } from "@/components/ui/AvatarBD";
import { useAudioPlayer } from "@/components/audio/AudioPlayerContext";
import type { AudioTrackItem } from "@/lib/openhub-data";

function formatTimecode(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

const DEFAULT_RADIO_STREAM: AudioTrackItem = {
  id: "anarchy-radio-stream",
  title: "ANARCHY RADIO // SIGNAL LIVE",
  subtitle: "WEBAUDIO DSP STREAM • 48.0 kHz / 24-BIT",
  sourceType: "VST_DEMO",
  bpm: 136,
  key: "F Minor",
  avatarExpression: "spectateur-a",
};

/**
 * Page `/radio` — Espace Radio & Oscilloscope dédié.
 * Déplace le lecteur audio hors de la barre inférieure permanente pour garder
 * le reste du site épuré et respirant.
 */
export default function RadioPage() {
  const {
    currentTrack,
    isPlaying,
    wetDryMix,
    volume,
    isMuted,
    currentTime,
    duration,
    oscilloscopeMode,
    peakLevels,
    playTrack,
    togglePlay,
    setVolume,
    toggleMute,
    toggleWetDry,
    setOscilloscopeMode,
    getTimeDomainData,
    getFrequencyData,
    triggerGlitchBurst,
  } = useAudioPlayer();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = 128;
    const dataArray = new Uint8Array(bufferLength);
    let animationFrameId = 0;

    const renderFrame = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "#E5E5E5";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (oscilloscopeMode === "FFT") {
        getFrequencyData(dataArray);
        const barCount = 32;
        const barWidth = width / barCount - 1.5;

        for (let i = 0; i < barCount; i++) {
          const val = dataArray[i * 2] / 255;
          const barHeight = Math.max(2, val * (height - 4));
          const x = i * (barWidth + 1.5);
          const y = height - barHeight;

          ctx.fillStyle = val > 0.62 || wetDryMix ? "#FF1B24" : "#222226";
          ctx.fillRect(x, y, barWidth, barHeight);
        }
      } else {
        getTimeDomainData(dataArray);
        const sliceWidth = width / (bufferLength - 1);

        if (oscilloscopeMode === "ANAGLYPH") {
          ctx.lineWidth = 2;
          ctx.strokeStyle = "#00E5FF";
          ctx.beginPath();
          let xCyan = 0;
          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * height) / 2 + 2;
            if (i === 0) ctx.moveTo(xCyan + 2.5, y);
            else ctx.lineTo(xCyan + 2.5, y);
            xCyan += sliceWidth;
          }
          ctx.stroke();
        }

        ctx.lineWidth = wetDryMix ? 2.5 : 2;
        ctx.strokeStyle = "#FF1B24";
        ctx.beginPath();
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }

      animationFrameId = window.requestAnimationFrame(renderFrame);
    };

    animationFrameId = window.requestAnimationFrame(renderFrame);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [getFrequencyData, getTimeDomainData, oscilloscopeMode, wetDryMix]);

  const activeTrack = currentTrack ?? DEFAULT_RADIO_STREAM;

  const handleToggleRadio = () => {
    if (!currentTrack) {
      playTrack(DEFAULT_RADIO_STREAM);
    } else {
      togglePlay();
    }
  };

  return (
    <div className="space-y-8">
      <Card
        moduleTitle="ANARCHY_RADIO // WEBAUDIO_OSC_&_DSP_DECK"
        moduleMeta="48.0 kHz // 24-BIT"
        activeIndicator={isPlaying}
      >
        <div className="space-y-6">
          {/* En-tête Radio */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-neutral-200">
            <div className="flex items-center gap-4">
              <AvatarBD
                name={activeTrack.title}
                expression={activeTrack.avatarExpression}
                size="md"
                badgeText="LIVE"
                audioReactive={isPlaying}
                anaglyphRing={isPlaying}
              />
              <div>
                <div className="font-mono text-xs font-bold uppercase text-brand-red">
                  {"// RADIO_STREAM"}
                </div>
                <h1 className="font-sans text-2xl sm:text-3xl font-bold text-brand-black">
                  {activeTrack.title}
                </h1>
                <p className="font-mono text-xs text-neutral-500">
                  {activeTrack.subtitle} • {activeTrack.bpm} BPM •{" "}
                  {activeTrack.key}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                id="btn-radio-play"
                variant={isPlaying ? "primary" : "comic"}
                size="lg"
                onClick={handleToggleRadio}
              >
                {isPlaying ? "❚❚ PAUSE RADIO" : "▶ LANCER LA RADIO"}
              </Button>
              <Link href="/anarchy-visual-design">
                <Button variant="clinical" size="lg">
                  ⚡ SYNCHRO VISUAL DESIGN
                </Button>
              </Link>
            </div>
          </div>

          {/* Oscilloscope + Vumètres */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            <div className="lg:col-span-9 bg-brand-white border-2 border-black rounded-xl p-3 shadow-comic-sm space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                <span className="font-bold text-brand-black">
                  OSCILLOSCOPE TEMPS RÉEL (#FF1B24)
                </span>
                <div className="flex items-center gap-1.5">
                  {(["WAVE", "FFT", "ANAGLYPH"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setOscilloscopeMode(mode)}
                      className={`px-2 py-0.5 rounded border font-bold ${
                        oscilloscopeMode === mode
                          ? "bg-brand-black text-brand-white border-black"
                          : "bg-brand-pearl text-brand-charcoal border-neutral-300"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <canvas
                ref={canvasRef}
                width={760}
                height={180}
                aria-label="Oscilloscope Radio Anarchy"
                className="w-full h-44 rounded border border-neutral-200 bg-brand-white"
              />

              <div className="flex items-center justify-between font-mono text-xs text-neutral-500">
                <span>
                  {formatTimecode(currentTime)} / {formatTimecode(duration)}
                </span>
                <span>
                  MODE DSP :{" "}
                  <strong className="text-brand-black">
                    {wetDryMix ? "WET (ACTIF)" : "DRY (BYPASS)"}
                  </strong>
                </span>
              </div>
            </div>

            {/* Contrôles DSP & Vumètres */}
            <div className="lg:col-span-3 bg-brand-pearl border-2 border-black rounded-xl p-4 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="font-mono text-xs font-bold uppercase text-brand-black">
                  NIVEAUX L / R
                </div>
                {(
                  [
                    ["L", peakLevels.left],
                    ["R", peakLevels.right],
                  ] as const
                ).map(([ch, level]) => (
                  <div key={ch} className="space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span>CH_{ch}</span>
                      <span>{Math.round(level)}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-white border border-black rounded overflow-hidden">
                      <div
                        className={`h-full transition-all duration-75 ${
                          level > 75 ? "bg-brand-red" : "bg-brand-charcoal"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, level))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-3 border-t border-neutral-300">
                <div className="flex items-center justify-between gap-2">
                  <Button
                    variant={wetDryMix ? "primary" : "clinical"}
                    size="sm"
                    onClick={toggleWetDry}
                  >
                    {wetDryMix ? "DSP: WET" : "DSP: DRY"}
                  </Button>
                  <Button
                    variant="comic"
                    size="sm"
                    onClick={() => triggerGlitchBurst("glitch")}
                  >
                    GLITCH
                  </Button>
                </div>

                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex items-center justify-between">
                    <span>VOLUME</span>
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="underline text-brand-red font-bold"
                    >
                      {isMuted ? "UNMUTE" : "MUTE"}
                    </button>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round((isMuted ? 0 : volume) * 100)}
                    onChange={(e) => setVolume(Number(e.target.value) / 100)}
                    aria-label="Volume Radio"
                    className="w-full accent-brand-red"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-brand-pearl border border-neutral-200 font-mono text-xs text-neutral-600">
            Astuce : lancez la radio ici puis ouvrez{" "}
            <Link
              href="/anarchy-visual-design"
              className="text-brand-red font-bold underline"
            >
              03.VISUAL_DESIGN
            </Link>{" "}
            pour piloter les visuels 19 faders en temps réel sur le flux audio.
          </div>
        </div>
      </Card>
    </div>
  );
}

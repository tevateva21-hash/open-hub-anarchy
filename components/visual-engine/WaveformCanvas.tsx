"use client";

import React, { useEffect, useRef, useState } from "react";
import type { AudioAnalysis } from "@/lib/visual-engine/contracts";

export interface WaveformCanvasProps {
  analysis: AudioAnalysis;
  time: number;
  onSeek?: (seconds: number) => void;
  clipActive?: boolean;
  clipStartSeconds?: number;
  clipDurationSeconds?: number;
  fadeInSeconds?: number;
  fadeOutSeconds?: number;
  onClipStartChange?: (seconds: number) => void;
}

/**
 * Composant `WaveformCanvas` — Inspiré du lecteur .NET MAUI Anarchy Visual Engine :
 * - Glisser n'importe où sur la waveform déplace le curseur audio au millimètre (aucun cran fixe).
 * - Quand l'extrait (30s par défaut) est actif, une fenêtre visuelle avec rampes Fade In / Fade Out
 *   et barre supérieure glissable permet de déplacer tout le bloc dans la musique facilement.
 */
export const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
  analysis,
  time,
  onSeek,
  clipActive = false,
  clipStartSeconds = 0,
  clipDurationSeconds = 30,
  fadeInSeconds = 0,
  fadeOutSeconds = 0,
  onClipStartChange,
}) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const [dragMode, setDragMode] = useState<"none" | "seek" | "window">("none");
  const dragOffsetSecRef = useRef<number>(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const draw = () => {
      const width = Math.max(
        1,
        Math.round(canvas.getBoundingClientRect().width)
      );
      const height = 160;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.scale(dpr, dpr);
      ctx.fillStyle = "#14161A";
      ctx.fillRect(0, 0, width, height);

      const dur = Math.max(0.001, analysis.durationSeconds);

      // Fenêtre d'extrait glissable (ex: 30s) + courbes Fade In / Fade Out
      if (clipActive) {
        const startX = Math.max(0, Math.min(width, (clipStartSeconds / dur) * width));
        const endSec = Math.min(dur, clipStartSeconds + clipDurationSeconds);
        const endX = Math.max(startX + 4, Math.min(width, (endSec / dur) * width));
        const winW = endX - startX;

        ctx.fillStyle = "rgba(0, 229, 255, 0.13)";
        ctx.fillRect(startX, 0, winW, height);

        // Barre supérieure draggable de la fenêtre 30s
        ctx.fillStyle = "#00E5FF";
        ctx.fillRect(startX, 0, winW, 18);
        ctx.fillStyle = "#0B0C10";
        ctx.font = "bold 10px monospace";
        const label = `⇄ EXTRAIT ${clipStartSeconds.toFixed(1)}s → ${endSec.toFixed(1)}s`;
        if (winW > 75) {
          ctx.fillText(label, startX + 6, 13);
        }

        // Bords de fenêtre
        ctx.strokeStyle = "#00E5FF";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, 0);
        ctx.lineTo(startX, height);
        ctx.moveTo(endX, 0);
        ctx.lineTo(endX, height);
        ctx.stroke();

        // Enveloppe visuelle Fade In / Fade Out
        const fiX = Math.min(endX, startX + (fadeInSeconds / dur) * width);
        const foX = Math.max(startX, endX - (fadeOutSeconds / dur) * width);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(startX, height - 8);
        ctx.lineTo(fiX, 24);
        ctx.lineTo(foX, 24);
        ctx.lineTo(endX, height - 8);
        ctx.stroke();
      }

      // Ligne centrale 0 dBFS
      ctx.strokeStyle = "#2C2E35";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2 + 6);
      ctx.lineTo(width, height / 2 + 6);
      ctx.stroke();

      const count = analysis.timestamps.length;
      const cursorX = Math.min(
        width - 1,
        Math.max(0, (time / dur) * width)
      );

      // Tracé déjà lu (Cyan #00E5FF) vs à lire (Rouge Cinéma #FF1B24)
      for (let x = 0; x < width; x++) {
        const start = Math.min(count - 1, Math.floor((x * count) / width));
        const end = Math.min(
          count,
          Math.max(start + 1, Math.floor(((x + 1) * count) / width))
        );
        let min = 1;
        let max = -1;
        for (let i = start; i < end; i++) {
          if (analysis.waveformMin[i] < min) min = analysis.waveformMin[i];
          if (analysis.waveformMax[i] > max) max = analysis.waveformMax[i];
        }
        ctx.strokeStyle = x <= cursorX ? "#00E5FF" : "#FF1B24";
        ctx.beginPath();
        ctx.moveTo(x, height / 2 + 6 - max * 60);
        ctx.lineTo(x, height / 2 + 6 - min * 60);
        ctx.stroke();
      }

      // Tête de lecture clinique blanche avec poignée triangulaire
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cursorX, 18);
      ctx.lineTo(cursorX, height);
      ctx.stroke();

      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.moveTo(cursorX - 6, 18);
      ctx.lineTo(cursorX + 6, 18);
      ctx.lineTo(cursorX, 27);
      ctx.closePath();
      ctx.fill();
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [
    analysis,
    time,
    clipActive,
    clipStartSeconds,
    clipDurationSeconds,
    fadeInSeconds,
    fadeOutSeconds,
  ]);

  const pointerToSeconds = (clientX: number): { sec: number; yRatio: number; yPx: number } => {
    const canvas = ref.current;
    if (!canvas) return { sec: 0, yRatio: 0.5, yPx: 80 };
    const rect = canvas.getBoundingClientRect();
    const ratioX = Math.max(0, Math.min(1, (clientX - rect.left) / Math.max(1, rect.width)));
    return {
      sec: ratioX * analysis.durationSeconds,
      yRatio: 0.5,
      yPx: rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = ref.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const yPx = e.clientY - rect.top;
    const { sec } = pointerToSeconds(e.clientX);

    canvas.setPointerCapture(e.pointerId);

    // Si on clique sur la barre supérieure (0..24px) dans la fenêtre d'extrait, on déplace toute la fenêtre
    if (
      clipActive &&
      onClipStartChange &&
      yPx <= 24 &&
      sec >= clipStartSeconds - 1 &&
      sec <= clipStartSeconds + clipDurationSeconds + 1
    ) {
      dragOffsetSecRef.current = sec - clipStartSeconds;
      setDragMode("window");
      return;
    }

    setDragMode("seek");
    onSeek?.(sec);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragMode === "none") return;
    const { sec } = pointerToSeconds(e.clientX);

    if (dragMode === "window" && onClipStartChange) {
      const maxStart = Math.max(0, analysis.durationSeconds - Math.min(clipDurationSeconds, analysis.durationSeconds));
      const nextStart = Math.max(0, Math.min(maxStart, sec - dragOffsetSecRef.current));
      onClipStartChange(Number(nextStart.toFixed(2)));
      return;
    }

    if (dragMode === "seek") {
      onSeek?.(sec);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragMode !== "none") {
      ref.current?.releasePointerCapture(e.pointerId);
      setDragMode("none");
    }
  };

  return (
    <canvas
      ref={ref}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="h-[160px] w-full rounded-xl border-2 border-black shadow-comic-sm cursor-ew-resize touch-none select-none"
      role="img"
      aria-label="Waveform interactive : glisser pour déplacer le curseur librement ou déplacer la barre cyan d'extrait"
    />
  );
};

export default WaveformCanvas;

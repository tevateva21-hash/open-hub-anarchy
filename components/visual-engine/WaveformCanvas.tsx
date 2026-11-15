"use client";

import React, { useEffect, useRef } from "react";
import type { AudioAnalysis } from "@/lib/visual-engine/contracts";

export interface WaveformCanvasProps {
  analysis: AudioAnalysis;
  time: number;
  onSeek?: (seconds: number) => void;
}

/**
 * Composant `WaveformCanvas` — Port de `Waveform.tsx` (`anarchy-visual-engine`)
 * adapté à la DA Open Hub (fond clinique foncé/contraste fort + pics Rouge Cinéma `#FF1B24`
 * & reflets Cyan `#00E5FF`, avec clic interactif pour naviguer dans le morceau).
 */
export const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
  analysis,
  time,
  onSeek,
}) => {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const draw = () => {
      const width = Math.max(
        1,
        Math.round(canvas.getBoundingClientRect().width)
      );
      const height = 148;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.scale(dpr, dpr);
      ctx.fillStyle = "#14161A";
      ctx.fillRect(0, 0, width, height);

      // Ligne centrale 0 dBFS
      ctx.strokeStyle = "#2C2E35";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      const count = analysis.timestamps.length;
      const cursorX = Math.min(
        width - 1,
        Math.max(0, (time / Math.max(0.001, analysis.durationSeconds)) * width)
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
        ctx.moveTo(x, height / 2 - max * 66);
        ctx.lineTo(x, height / 2 - min * 66);
        ctx.stroke();
      }

      // Tête de lecture clinique blanche
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cursorX, 0);
      ctx.lineTo(cursorX, height);
      ctx.stroke();
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [analysis, time]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onSeek || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width)
    );
    onSeek(ratio * analysis.durationSeconds);
  };

  return (
    <canvas
      ref={ref}
      onClick={handleClick}
      className="h-[148px] w-full rounded-xl border-2 border-black shadow-comic-sm cursor-pointer"
      role="img"
      aria-label="Waveform du morceau : enveloppe des pics minimum et maximum (cliquer pour naviguer)"
    />
  );
};

export default WaveformCanvas;

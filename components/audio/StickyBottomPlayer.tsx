"use client";

import React, { useEffect, useRef } from "react";
import { useAudioPlayer } from "@/components/audio/AudioPlayerContext";
import { AvatarBD } from "@/components/ui/AvatarBD";

function formatTimecode(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Composant `StickyBottomPlayer` — Jalon 3 : Le Lecteur Audio Persistant.
 *
 * Caractéristiques :
 * - Position fixe en bas d'écran (`fixed bottom-0 left-0 right-0 z-40`)
 * - Barre compacte `#F5F5F5` (`bg-brand-pearl`) avec bordure supérieure `#302E2E` (`border-t-2 border-[#302E2E]`)
 * - Oscilloscope minimaliste temps-réel `<canvas>` (tracé Rouge Cinéma `#FF1B24`, modes WAVE, FFT et ANAGLYPH `#FF1B24`+`#00E5FF`)
 * - Vumètres bicolores L/R (`#222226` normal + `#FF1B24` crête)
 * - Contrôles de transport en `Roboto Mono`, sélecteur de piste rapide, switch matériel DSP DRY / WET, trigger Glitch et volume
 */
export const StickyBottomPlayer: React.FC = () => {
  const {
    currentTrack,
    queue,
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
  } = useAudioPlayer();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Boucle 60fps requestAnimationFrame pour l'oscilloscope minimaliste Rouge Cinéma (#FF1B24)
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

      // Fond clinique blanc pur avec grille de mesure subtile
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      // Ligne de référence zéro dBFS (pointillée)
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

          // Bicolore : Rouge Cinéma sur les crêtes / hautes énergies, Anthracite sinon
          ctx.fillStyle = val > 0.62 || wetDryMix ? "#FF1B24" : "#222226";
          ctx.fillRect(x, y, barWidth, barHeight);
        }
      } else {
        getTimeDomainData(dataArray);
        const sliceWidth = width / (bufferLength - 1);

        // En mode ANAGLYPH (ou lorsque WET est actif en mode ANAGLYPH), trace d'abord le canal fantôme Cyan (#00E5FF)
        if (oscilloscopeMode === "ANAGLYPH") {
          ctx.lineWidth = 1.8;
          ctx.strokeStyle = "#00E5FF";
          ctx.beginPath();
          let xCyan = 0;
          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * height) / 2 + 1.5;
            if (i === 0) {
              ctx.moveTo(xCyan + 2.5, y);
            } else {
              ctx.lineTo(xCyan + 2.5, y);
            }
            xCyan += sliceWidth;
          }
          ctx.stroke();
        }

        // Tracé principal Rouge Cinéma (#FF1B24) obligatoire
        ctx.lineWidth = wetDryMix ? 2.2 : 1.75;
        ctx.strokeStyle = "#FF1B24";
        ctx.beginPath();

        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.stroke();
      }

      animationFrameId = window.requestAnimationFrame(renderFrame);
    };

    animationFrameId = window.requestAnimationFrame(renderFrame);
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [oscilloscopeMode, wetDryMix, getTimeDomainData, getFrequencyData]);

  const progressPercent =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <aside
      id="sticky-bottom-player"
      data-testid="sticky-bottom-player"
      aria-label="Lecteur audio persistant Open Hub"
      className="fixed bottom-0 left-0 right-0 z-40 bg-brand-pearl border-t-2 border-[#302E2E] shadow-[0_-4px_20px_-2px_rgba(0,0,0,0.08)]"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5 sm:gap-4">
        {/* ZONE GAUCHE : AvatarBD réactif + Métadonnées piste + Sélecteur rapide */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 lg:flex-initial lg:w-[300px]">
          <AvatarBD
            name={currentTrack?.title ?? "Open Hub Audio"}
            expression={currentTrack?.avatarExpression ?? "spectateur-a"}
            size="sm"
            badgeText={currentTrack?.sourceType === "VST_DEMO" ? "VST" : "WAV"}
            anaglyphRing={isPlaying}
            audioReactive={isPlaying}
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isPlaying ? "bg-brand-red animate-pulse" : "bg-neutral-400"
                }`}
                aria-hidden="true"
              />
              <p
                id="player-track-title"
                data-testid="player-track-title"
                className="font-mono text-xs font-bold text-brand-black truncate"
              >
                {currentTrack?.title ?? "AUCUN SIGNAL"}
              </p>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-[10px] text-[#302E2E] bg-brand-white px-1.5 py-0.5 rounded border border-neutral-300 shrink-0">
                {currentTrack?.bpm ?? 140} BPM • {currentTrack?.key ?? "F Min"}
              </span>

              <label htmlFor="player-track-select" className="sr-only">
                Sélectionner une piste ou démo VST
              </label>
              <select
                id="player-track-select"
                data-testid="player-track-select"
                value={currentTrack?.id ?? ""}
                onChange={(e) => {
                  const found = queue.find((item) => item.id === e.target.value);
                  if (found) playTrack(found);
                }}
                className="font-mono text-[10px] bg-brand-white text-brand-charcoal border border-neutral-300 rounded px-1.5 py-0.5 truncate max-w-[140px] sm:max-w-[170px] focus:outline-none focus:border-brand-red"
              >
                {queue.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ZONE CENTRALE : Transport Roboto Mono + Oscilloscope Rouge <canvas> + Vumètres Bicolores */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 flex-1 justify-center">
          {/* Boutons Transport */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id="player-prev-btn"
              data-testid="player-prev-btn"
              type="button"
              onClick={prevTrack}
              aria-label="Piste précédente"
              className="px-2 py-1.5 rounded bg-brand-white border border-neutral-300 hover:border-brand-charcoal font-mono text-[11px] font-bold text-[#302E2E] transition-colors"
            >
              {"|◀"}
            </button>

            <button
              id="player-play-toggle"
              data-testid="player-play-toggle"
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Mettre en pause" : "Lancer la lecture"}
              className="px-3 py-1.5 rounded bg-brand-red text-brand-white border-2 border-black shadow-comic-sm hover:bg-brand-red/90 font-mono text-xs font-bold tracking-wider uppercase transition-transform active:translate-y-0.5"
            >
              {isPlaying ? "❚❚ PAUSE" : "▶ PLAY"}
            </button>

            <button
              id="player-next-btn"
              data-testid="player-next-btn"
              type="button"
              onClick={nextTrack}
              aria-label="Piste suivante"
              className="px-2 py-1.5 rounded bg-brand-white border border-neutral-300 hover:border-brand-charcoal font-mono text-[11px] font-bold text-[#302E2E] transition-colors"
            >
              {"▶|"}
            </button>
          </div>

          {/* Oscilloscope minimaliste Rouge (#FF1B24) + Sélecteur de mode + Barre de progression */}
          <div className="flex items-center gap-2 bg-brand-white border border-neutral-300 rounded-lg px-2.5 py-1 shadow-inner">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#302E2E]">
                  OSC // {oscilloscopeMode}
                </span>
                <div className="flex items-center gap-0.5">
                  {(["WAVE", "FFT", "ANAGLYPH"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setOscilloscopeMode(mode)}
                      className={`px-1 py-0.2 font-mono text-[8px] rounded uppercase transition-colors ${
                        oscilloscopeMode === mode
                          ? "bg-brand-red text-brand-white font-bold"
                          : "bg-brand-pearl text-neutral-600 hover:text-brand-black"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <canvas
                id="player-oscilloscope-canvas"
                data-testid="player-oscilloscope-canvas"
                ref={canvasRef}
                width={180}
                height={32}
                className="w-[130px] sm:w-[180px] h-8 rounded border border-neutral-200 bg-brand-white block"
              />

              {/* Scrub bar & Timecode */}
              <div className="flex items-center gap-2">
                <input
                  id="player-seek-slider"
                  data-testid="player-seek-slider"
                  type="range"
                  min={0}
                  max={duration}
                  step={0.5}
                  value={currentTime}
                  onChange={(e) => seekTo(Number(e.target.value))}
                  aria-label="Position de lecture"
                  className="w-full h-1 accent-brand-red bg-neutral-200 rounded cursor-pointer"
                />
                <span
                  id="player-timecode"
                  data-testid="player-timecode"
                  className="font-mono text-[9px] text-[#302E2E] shrink-0"
                >
                  {formatTimecode(currentTime)} / {formatTimecode(duration)}
                </span>
              </div>
              {/* Barre visuelle de progression pour lecture rapide */}
              <div className="sr-only">{Math.round(progressPercent)}%</div>
            </div>

            {/* Vumètres bicolores L / R (Anthracite #222226 + Crête Rouge Cinéma #FF1B24) */}
            <div
              data-testid="player-vu-meters"
              className="flex items-end gap-1 h-11 px-1.5 py-1 bg-brand-pearl rounded border border-neutral-200"
              title="Vumètres bicolores L/R (dBFS)"
            >
              {/* Canal L */}
              <div className="flex flex-col items-center h-full justify-end gap-0.5">
                <div className="w-2 h-7 bg-neutral-200 rounded-sm overflow-hidden flex flex-col justify-end">
                  <div
                    style={{ height: `${peakLevels.left}%` }}
                    className={`w-full transition-all duration-75 ${
                      peakLevels.left > 72 ? "bg-brand-red" : "bg-brand-charcoal"
                    }`}
                  />
                </div>
                <span className="font-mono text-[8px] font-bold text-[#302E2E] leading-none">
                  L
                </span>
              </div>

              {/* Canal R */}
              <div className="flex flex-col items-center h-full justify-end gap-0.5">
                <div className="w-2 h-7 bg-neutral-200 rounded-sm overflow-hidden flex flex-col justify-end">
                  <div
                    style={{ height: `${peakLevels.right}%` }}
                    className={`w-full transition-all duration-75 ${
                      peakLevels.right > 72
                        ? "bg-brand-red"
                        : "bg-brand-charcoal"
                    }`}
                  />
                </div>
                <span className="font-mono text-[8px] font-bold text-[#302E2E] leading-none">
                  R
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ZONE DROITE : Commutateur DSP DRY/WET + Trigger Glitch + Volume / Mute */}
        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
          {/* Switch matériel DRY / WET */}
          <button
            id="player-wet-dry-toggle"
            data-testid="player-wet-dry-toggle"
            type="button"
            onClick={toggleWetDry}
            aria-pressed={wetDryMix}
            className={`px-2.5 py-1.5 rounded border-2 font-mono text-[10px] font-bold uppercase tracking-wider transition-all ${
              wetDryMix
                ? "bg-brand-white border-black text-brand-red shadow-comic-sm"
                : "bg-brand-white border-neutral-300 text-neutral-600"
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  wetDryMix ? "bg-brand-red" : "bg-neutral-400"
                }`}
              />
              {wetDryMix ? "DSP: WET (ACTIVE)" : "DSP: DRY (BYPASS)"}
            </span>
          </button>

          {/* Bouton d'impulsion Glitch */}
          <button
            id="player-glitch-trigger"
            data-testid="player-glitch-trigger"
            type="button"
            onClick={() => triggerGlitchBurst("glitch")}
            className="px-2 py-1.5 rounded bg-brand-white border border-neutral-300 hover:border-brand-red font-mono text-[10px] font-bold text-[#302E2E] hover:text-brand-red transition-colors"
            title="Injecter une impulsion Glitch dans le bus DSP"
          >
            ⚡ GLITCH
          </button>

          {/* Contrôle Volume & Mute */}
          <div className="flex items-center gap-1.5 bg-brand-white border border-neutral-300 rounded px-2 py-1">
            <button
              id="player-mute-toggle"
              data-testid="player-mute-toggle"
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? "Réactiver le son" : "Couper le son"}
              className="font-mono text-[10px] font-bold text-[#302E2E] hover:text-brand-red"
            >
              {isMuted || volume === 0 ? "MUTE" : "VOL"}
            </button>
            <input
              id="player-volume-slider"
              data-testid="player-volume-slider"
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Volume de sortie maître"
              className="w-16 h-1.5 accent-brand-red bg-neutral-200 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default StickyBottomPlayer;

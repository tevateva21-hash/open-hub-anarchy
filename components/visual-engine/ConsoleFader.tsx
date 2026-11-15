"use client";

import React, { useCallback, useRef } from "react";

export interface ConsoleFaderProps {
  id: string;
  label: string;
  shortTag: string;
  value: number;
  min: number;
  max: number;
  defaultValue: number;
  unit?: string;
  accent?: "red" | "cyan" | "charcoal";
  locked?: boolean;
  liveMeter?: number; // 0..1 optional dynamic signal beside fader track
  compact?: boolean;
  onChange: (nextValue: number) => void;
  onToggleLock?: () => void;
}

/**
 * Composant `ConsoleFader` — Fader vertical tactile DAW + Style BD 3D.
 *
 * - Piste calibrée avec graduations DAW
 * - Capuchon chunké `border-2 border-black shadow-comic-sm` façon BD
 * - Double-clic sur la piste/valeur pour réinitialiser au défaut
 * - Bouton cadenas individuel pour verrouiller avant Randomize (M4)
 * - Contrôle clavier complet (Flèches / PageUp / PageDown / Home / End) & drag pointer
 */
export const ConsoleFader: React.FC<ConsoleFaderProps> = ({
  id,
  label,
  shortTag,
  value,
  min,
  max,
  defaultValue,
  unit = "%",
  accent = "red",
  locked = false,
  liveMeter,
  compact = false,
  onChange,
  onToggleLock,
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const clamped = Math.max(min, Math.min(max, value));
  const ratio = max > min ? (clamped - min) / (max - min) : 0;
  const percent = Math.round(ratio * 100);

  const updateFromClientY = useCallback(
    (clientY: number) => {
      const track = trackRef.current;
      if (!track || locked) return;
      const rect = track.getBoundingClientRect();
      if (rect.height <= 0) return;
      const rawRatio = 1 - (clientY - rect.top) / rect.height;
      const bounded = Math.max(0, Math.min(1, rawRatio));
      const next = Math.round(min + bounded * (max - min));
      onChange(next);
    },
    [locked, max, min, onChange]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (locked) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromClientY(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (locked || e.buttons !== 1) return;
    updateFromClientY(e.clientY);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (locked) return;
    const step = Math.max(1, Math.round((max - min) / 40));
    const bigStep = Math.max(5, Math.round((max - min) / 10));
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      e.preventDefault();
      onChange(Math.min(max, clamped + step));
    } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      e.preventDefault();
      onChange(Math.max(min, clamped - step));
    } else if (e.key === "PageUp") {
      e.preventDefault();
      onChange(Math.min(max, clamped + bigStep));
    } else if (e.key === "PageDown") {
      e.preventDefault();
      onChange(Math.max(min, clamped - bigStep));
    } else if (e.key === "Home") {
      e.preventDefault();
      onChange(min);
    } else if (e.key === "End") {
      e.preventDefault();
      onChange(max);
    }
  };

  const fillColorClass =
    accent === "cyan"
      ? "bg-[#00E5FF]"
      : accent === "charcoal"
      ? "bg-brand-charcoal"
      : "bg-brand-red";

  const capLineClass =
    accent === "cyan"
      ? "bg-[#00E5FF]"
      : accent === "charcoal"
      ? "bg-brand-charcoal"
      : "bg-brand-red";

  const displayValue =
    unit === "x"
      ? `${(clamped / 100).toFixed(2)}x`
      : `${clamped > 0 && min < 0 ? "+" : ""}${clamped}${unit}`;

  const trackHeightClass = compact ? "h-28" : "h-36";

  return (
    <div
      data-testid={`fader-${id}`}
      className={[
        "flex flex-col items-center gap-1.5 rounded-xl border transition-colors select-none",
        compact ? "p-2" : "p-2.5",
        locked
          ? "bg-brand-pearl border-brand-black"
          : "bg-brand-white border-neutral-200/90 hover:border-neutral-300",
      ].join(" ")}
    >
      {/* En-tête compact + Verrou */}
      <div className="w-full flex items-center justify-between gap-1">
        <span className="font-mono text-[9px] font-bold tracking-tight text-neutral-500 uppercase truncate">
          {shortTag}
        </span>
        {onToggleLock && (
          <button
            type="button"
            onClick={onToggleLock}
            aria-label={
              locked
                ? `Déverrouiller le fader ${label}`
                : `Verrouiller le fader ${label}`
            }
            aria-pressed={locked}
            title={locked ? "Verrouillé (protégé du Randomize)" : "Verrouiller"}
            className={[
              "px-1 py-0.5 rounded font-mono text-[8px] font-bold border transition-colors shrink-0",
              locked
                ? "bg-brand-black text-brand-white border-brand-black"
                : "bg-brand-pearl text-neutral-500 border-neutral-200 hover:border-black hover:text-black",
            ].join(" ")}
          >
            {locked ? "LOCK" : "OPEN"}
          </button>
        )}
      </div>

      {/* Corps du fader : Graduations + Piste Interactive + Optionnel VU Signal */}
      <div className="flex items-center justify-center gap-1.5 py-0.5">
        <div
          className={`${trackHeightClass} flex flex-col justify-between items-end font-mono text-[7px] text-neutral-400 leading-none pointer-events-none`}
          aria-hidden="true"
        >
          <span>—</span>
          <span>—</span>
          <span className="text-neutral-600 font-bold">—</span>
          <span>—</span>
          <span>—</span>
        </div>

        <div
          ref={trackRef}
          id={id}
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={clamped}
          aria-disabled={locked}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onKeyDown={handleKeyDown}
          onDoubleClick={() => {
            if (!locked) onChange(defaultValue);
          }}
          title={`${label} : ${displayValue} (Double-clic pour réinitialiser)`}
          className={[
            "relative w-7 flex items-center justify-center touch-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red rounded-md",
            trackHeightClass,
            locked ? "cursor-not-allowed opacity-75" : "cursor-ns-resize",
          ].join(" ")}
        >
          <div className="w-2 h-full rounded-full bg-brand-pearl border border-neutral-300 overflow-hidden relative shadow-inner">
            <div
              className={`absolute bottom-0 left-0 right-0 transition-[height] duration-75 ${fillColorClass}`}
              style={{ height: `${percent}%` }}
            />
          </div>

          <div
            className="absolute left-0 right-0 h-5 rounded bg-brand-white border-2 border-black shadow-comic-sm flex flex-col items-center justify-center gap-0.5 pointer-events-none"
            style={{
              bottom: `calc(${percent}% - 10px)`,
            }}
          >
            <span className="w-3.5 h-[1.5px] bg-neutral-300 rounded" />
            <span className={`w-4 h-[2px] rounded ${capLineClass}`} />
            <span className="w-3.5 h-[1.5px] bg-neutral-300 rounded" />
          </div>
        </div>

        {typeof liveMeter === "number" && (
          <div
            className={`w-1.5 ${trackHeightClass} rounded-full bg-neutral-200 overflow-hidden flex flex-col justify-end`}
            aria-hidden="true"
          >
            <div
              className={`w-full transition-[height] duration-75 ${
                liveMeter > 0.72 ? "bg-brand-red" : "bg-brand-charcoal"
              }`}
              style={{
                height: `${Math.min(
                  100,
                  Math.max(4, Math.round(liveMeter * 100))
                )}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* Lecture numérique + Nom */}
      <div className="w-full text-center space-y-0.5">
        <button
          type="button"
          onClick={() => {
            if (!locked) onChange(defaultValue);
          }}
          title="Cliquer pour réinitialiser"
          className="w-full py-0.5 px-1 rounded bg-brand-pearl border border-neutral-200 font-mono text-[10px] font-bold text-brand-black hover:border-brand-red transition-colors"
        >
          {displayValue}
        </button>
        <div className="font-mono text-[9px] font-bold text-brand-charcoal leading-tight truncate">
          {label}
        </div>
      </div>
    </div>
  );
};

export default ConsoleFader;

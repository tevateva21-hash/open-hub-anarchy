import type { Metadata } from "next";
import Link from "next/link";
import { VisualEngineStudio } from "@/components/visual-engine/VisualEngineStudio";

export const metadata: Metadata = {
  title: "Anarchy Visual Design — Studio Visuel Audio-Réactif (19 Faders)",
  description:
    "Page dédiée Anarchy Visual Design intégrée à Open Hub : analyse FFT 24kHz locale MP3/WAV, 5 scènes 16-bit/PS1/Techno-Therapy, morphing 7 palettes, effet 3D Anaglyph et console à 19 faders.",
};

/**
 * Route `/anarchy-visual-design` — Intégration dédiée et physiquement isolée
 * du module Anarchy Visual Engine V2 (`lib/visual-engine/*` & `components/visual-engine/*`).
 */
export default function AnarchyVisualDesignPage() {
  return (
    <div className="space-y-6">
      {/* Bandeau contextuel Figma + BD / Anarchy HUD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-white border-2 border-black shadow-comic-sm rounded-xl px-4 py-3">
        <div className="space-y-0.5">
          <div className="font-mono text-[10px] font-bold uppercase text-brand-red flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
            <span>{"OPEN HUB // MODULE ANARCHY VISUAL DESIGN (ISOLÉ)"}</span>
          </div>
          <p className="text-xs text-neutral-600">
            Architecture modulaire autonome ({" "}
            <code className="font-mono text-brand-black bg-brand-pearl px-1 rounded">
              lib/visual-engine/*
            </code>{" "}
            &amp;{" "}
            <code className="font-mono text-brand-black bg-brand-pearl px-1 rounded">
              components/visual-engine/*
            </code>
            ) pour édition indépendante.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg border-2 border-black bg-brand-pearl font-mono text-xs font-bold text-brand-black hover:bg-brand-white shadow-comic-sm"
          >
            {"← CATALOGUE VST"}
          </Link>
          <Link
            href="/samples"
            className="px-3 py-1.5 rounded-lg border-2 border-black bg-brand-white font-mono text-xs font-bold text-brand-black hover:bg-brand-pearl shadow-comic-sm"
          >
            {"SAMPLES STUDIO →"}
          </Link>
        </div>
      </div>

      <VisualEngineStudio />
    </div>
  );
}

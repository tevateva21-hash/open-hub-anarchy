import type { Metadata } from "next";
import { VisualEngineStudio } from "@/components/visual-engine/VisualEngineStudio";

export const metadata: Metadata = {
  title: "Anarchy Visual Design — Studio Visuel Audio-Réactif (10 Faders)",
  description:
    "Page dédiée Anarchy Visual Design intégrée à Open Hub : analyse FFT 24kHz locale MP3/WAV (70 Mio), packs de 5 scènes, formats TikTok/Insta, Whisper LRC, injecteur C++ live et console 10 faders.",
};

/**
 * Route `/anarchy-visual-design` — Intégration dédiée et physiquement isolée
 * du module Anarchy Visual Engine V2 (`lib/visual-engine/*` & `components/visual-engine/*`).
 */
export default function AnarchyVisualDesignPage() {
  return (
    <div className="space-y-6">
      <VisualEngineStudio />
    </div>
  );
}

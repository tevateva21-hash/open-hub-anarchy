import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function DocsIndexPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-4">
        <div>
          <span className="inline-block px-2 py-0.5 rounded bg-brand-black text-brand-white font-mono text-[10px] font-bold uppercase mb-2">
            DOCUMENTATION // OPEN HUB ANARCHY
          </span>
          <h1 className="font-mono text-2xl sm:text-3xl font-bold text-brand-black">
            Centre de Documentation
          </h1>
          <p className="font-sans text-sm text-neutral-600 mt-1">
            Guides techniques, référence C++ live, système de prompts IA et suivi des jalons.
          </p>
        </div>
        <Link
          href="/anarchy-visual-design"
          className="px-3 py-1.5 rounded border-2 border-black bg-brand-red text-white hover:bg-black font-mono text-xs font-bold shadow-comic-sm transition-colors"
        >
          🎨 OUVRIR VISUAL STUDIO
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          moduleTitle="GUIDE_COMPLET // ANARCHY_VISUAL_STUDIO"
          moduleMeta="AUDIO 70 MIO · C++ · PROMPTS IA · TIKTOK/LRC"
          activeIndicator
        >
          <div className="space-y-3">
            <h2 className="font-mono text-lg font-bold text-brand-black">
              Comment fonctionne Anarchy Visual Studio
            </h2>
            <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Manuel complet : import audio 70 Mio, waveform .NET MAUI, Packs de 5 scènes,
              10 faders, formats 9:16/4:5/1:1/16:9, export MP4 avec son, Whisper/LRC,
              API C++ live et Prompts IA prêts à copier.
            </p>
            <Link
              href="/docs/visual-studio"
              className="inline-block px-3 py-2 rounded border-2 border-black bg-brand-black text-white font-mono text-xs font-bold hover:bg-brand-red transition-colors"
            >
              📖 LIRE LE GUIDE COMPLET →
            </Link>
          </div>
        </Card>

        <Card
          moduleTitle="MILESTONES // RÉTROPLANNING"
          moduleMeta="M0 → M18"
        >
          <div className="space-y-3">
            <h2 className="font-mono text-lg font-bold text-brand-black">
              Rétroplanning &amp; Historique Technique
            </h2>
            <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Journal complet des évolutions déployées sur GitHub, Vercel et Google Drive
              pour Open Hub &amp; Anarchy Visual Studio.
            </p>
            <Link
              href="/docs/retroplanning"
              className="inline-block px-3 py-2 rounded border-2 border-black bg-brand-pearl text-brand-black font-mono text-xs font-bold hover:bg-brand-white transition-colors"
            >
              📋 VOIR LES JALONS →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

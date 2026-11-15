import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

const MILESTONES = [
  {
    id: "M0",
    commit: "306303b",
    title: "Initialisation Next.js 14 + Tailwind + TypeScript",
    details: "Mise en place du socle App Router et de l'architecture Vercel.",
  },
  {
    id: "M1",
    commit: "9035be8",
    title: "Identité Anarchy & Visual Design V2 (19 faders)",
    details: "Design System, studio visuel 19 faders, pages VST, Samples, Forum, Blog et RGPD.",
  },
  {
    id: "M2",
    commit: "8bd9c86",
    title: "Nettoyage HUD, Radio dédiée & Footer RGPD",
    details: "Suppression du bandeau redondant, RGPD déplacé en pied de page, Radio déplacée vers /radio, purge des contenus factices.",
  },
  {
    id: "M3",
    commit: "ccb566a",
    title: "Connexion communautaire, Tiroirs & Ranking Radio",
    details: "Auth email/pseudo, tiroirs Anarchy/Communauté, ranking Radio, export vidéo.",
  },
  {
    id: "M4",
    commit: "c05313d / 90d889a",
    title: "Intégration PsyLab VST3 (vstsplugin) & Dépôt VST",
    details: "Import ECLIPSE, HELIOS, PRISM, synchro /api/vst/sync et dépôt VST GitHub/VST3.",
  },
  {
    id: "M5",
    commit: "9abc061",
    title: "Navigation plate & Presets VST (Serum, Vital...)",
    details: "Suppression de l'onglet Communauté séparé, ajout du tiroir Presets VST dans /samples.",
  },
  {
    id: "M6",
    commit: "8627488 / c589519",
    title: "Visual Studio : Boucle 30s 60fps, Fondus & Calage BPM",
    details: "Prévisualisation audio au-dessus, Fade In/Out 60fps, boucle 30s, switch scènes par mesures et calage 1er temps.",
  },
  {
    id: "M7",
    commit: "d825a0a",
    title: "SoundCloud Radio & Sons Communauté (Stems .zip + Remix)",
    details: "Intégration SoundCloud sur /radio et nouvelle page /sons-communaute avec stems .zip et réponses remix.",
  },
  {
    id: "M8",
    commit: "a69a3e5 / 19a6b2c",
    title: "Supabase, Sociabilité (/reseau), Avatars & site-texts.ts",
    details: "Schéma SQL complet, Storage helper, /api/health/supabase, /reseau (Follow, Mur, Profils), nouveaux avatars + upload.",
  },
  {
    id: "M9",
    commit: "f74830b",
    title: "Indicateur Audio Haut-Droite & Émulation DAW pure",
    details: "Badge Now Playing global en haut à droite + suppression des fiches/commentaires VST au profit de l'émulateur DAW.",
  },
  {
    id: "M10",
    commit: "b9222be",
    title: "Rétroplanning caché & Packs de 5 Scènes (JSON/C++ + Prompt IA)",
    details: "Documentation GitHub/Drive/Site + éditeur communautaire de packs de 5 scènes avec import C++/.json et Prompt IA.",
  },
  {
    id: "M11",
    commit: "ACTUEL",
    title: "Refonte Paradigme Packs de 5 Scènes (PS2 Enter the Dragon + Générateur)",
    details: "Pack original PS2 / Enter the Dragon, générateur procédural unique par seed, enchaînement automatique des 5 scènes au BPM, noms optionnels et scènes individuelles masquées par défaut.",
  },
];

export default function HiddenRetroplanningPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-4">
        <div>
          <span className="inline-block px-2 py-0.5 rounded bg-brand-black text-brand-white font-mono text-[10px] font-bold uppercase mb-2">
            DOCUMENTS INTERNES // NON RÉFÉRENCÉ
          </span>
          <h1 className="font-mono text-2xl sm:text-3xl font-bold text-brand-black">
            Rétroplanning &amp; Milestones — Open Hub
          </h1>
          <p className="font-sans text-sm text-neutral-600 mt-1">
            Historique complet des évolutions déployées sur GitHub, Vercel et Google Drive.
          </p>
        </div>
        <Link
          href="/"
          className="px-3 py-1.5 rounded border-2 border-black bg-brand-white hover:bg-brand-pearl font-mono text-xs font-bold shadow-comic-sm"
        >
          ← RETOUR HUB
        </Link>
      </div>

      <div className="space-y-3">
        {MILESTONES.map((m) => (
          <Card key={m.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-2 py-0.5 rounded bg-brand-red text-white font-bold">
                  {m.id}
                </span>
                <span className="px-2 py-0.5 rounded bg-brand-pearl border border-black font-bold">
                  {m.commit}
                </span>
                <span className="font-bold text-brand-black text-sm">{m.title}</span>
              </div>
              <p className="font-sans text-xs sm:text-sm text-neutral-600">
                {m.details}
              </p>
            </div>
            <span className="font-mono text-[11px] font-bold text-emerald-700 shrink-0">
              ✅ OK
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}

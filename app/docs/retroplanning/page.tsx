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
    commit: "87fe70e",
    title: "Refonte Paradigme Packs de 5 Scènes (PS2 Enter the Dragon + Générateur)",
    details: "Pack original PS2 / Enter the Dragon, générateur procédural unique par seed, enchaînement automatique des 5 scènes au BPM, noms optionnels et scènes individuelles masquées par défaut.",
  },
  {
    id: "M12",
    commit: "c16e12c",
    title: "Prévisualisation .NET MAUI, Éditeur C++ Externe & Calage 0.00s",
    details: "Curseur musique continu sans crans + fenêtre 30s glissable sur la waveform, éditeur externe /anarchy-visual-design/editeur avec injection C++ live modifiant le rendu, calage BPM verrouillé à 0.00s par défaut.",
  },
  {
    id: "M13",
    commit: "9db0926",
    title: "Export MP4 avec Son & Cohérence Zone Prévisualisée",
    details: "Boutons Randomize, Undo/Redo, Snapshot PNG et Export MP4 déplacés au plus près du moniteur vidéo et de l'extrait audio ; capture muxée vidéo + audio (piste locale avec fondus ou flux Open Hub) enregistrant automatiquement la zone prévisualisée.",
  },
  {
    id: "M14",
    commit: "3fdf239",
    title: "Épuration Studio & Pause Audio Globale du Site",
    details: "Suppression des éléments superflus (curseur libre doublon, lecteur HTML natif, bandeaux au-dessus/dessous de la vidéo, Randomize, grille 4 bandes et slider Début extrait) ; bouton Pause relié à pauseAllAudio() pour couper toute musique sur le site.",
  },
  {
    id: "M15",
    commit: "af6f620",
    title: "Console 10 Faders Live & Strobe Aigu (Flash Fond sur Clap)",
    details: "Correction de la boucle temps réel pour que les 10 faders agissent immédiatement même lors du défilement de packs ; ajout d'un flash clair d'arrière-plan sur les aigus/claps (Strobe Aigu), zoom caméra unifié 2D/3D, bass punch, psychédélie et anaglyphe.",
  },
  {
    id: "M16",
    commit: "fed2173",
    title: "Panneau Couleurs & Variations Rapides Live",
    details: "Suppression des contrôles redondants (sélecteur 5 scènes, BPM/Auto Switch/Kick Mode, Vertex Snap, Seed, JSON, Sauver/Charger/Reset) ; conservation uniquement du changement de couleur (Palette principale + Cible Color Morph) et des 4 Variations rapides, avec application immédiate vérifiée sur le rendu vidéo.",
  },
  {
    id: "M17",
    commit: "4ebe405",
    title: "Formats TikTok/Insta (9:16, 4:5, 1:1), Whisper, Scénario LRC & C++ Paroles",
    details: "Ajout du sélecteur de formats vidéo (16:9, 9:16 TikTok/Reels + Safe Zone, 4:5 Insta, 1:1 Carré) sur le moteur et l'export PNG/MP4 ; intégration Whisper (/api/whisper) sur l'extrait audio, scénario LRC horodaté (#INTRO, #DROP), variables C++ paroles/dimensions et Prompts IA dédiés.",
  },
  {
    id: "M18",
    commit: "7e57485",
    title: "Audio 70 Mio, Documentation Complète (/docs/visual-studio) & En-tête Épuré",
    details: "Passage de la limite audio locale à 70 Mio (8 min / 96 Mio PCM), création du guide complet Anarchy Visual Studio (/docs/visual-studio et docs/VISUAL_STUDIO_GUIDE.md) couvrant Prompts IA, C++ live, Whisper/LRC, 10 faders et formats sociaux, et suppression de l'en-tête donnant accès aux autres catégories (Samples, VSTs...).",
  },
  {
    id: "M19",
    commit: "9463345",
    title: "Architecture C++ Modulaire (Transpileur blindé, Multi-.cpp, Scènes/Pads VJ & Presets)",
    details: "Refonte en 4 modules : transpileur C++→JS blindé (#include, tableaux, lambdas, casts, std::/sinf/fmodf, erreur ligne exacte sans crash 60fps), gestionnaire multi-documents .cpp (sceno_openhub_ps2.cpp préservant la scénographie + brutalist_grid, cyber_katana_drop, tiktok_karaoke_hud), routage de scènes (section LRC, créneau temps, pads VJ) avec transitions Cut/Fondu/Glitch, et Inspector auto-généré via // @param, // @color, // @toggle + presets par document.",
  },
  {
    id: "M20",
    commit: "b2d43cf",
    title: "Mode JavaScript Natif (.js) Fast-Path V8, Détection Auto & Éditeur Colorisé",
    details: "Ajout du mode JavaScript natif (.js) contournant le transpileur C++ pour une exécution directe V8 60 FPS avec état persistant entre frames, sélecteur JS / C++, détection automatique au collage, coloration syntaxique dédiée JS/C++, compatibilité complète @param/@color/@toggle + routage mixte .js/.cpp, et template 3D low-poly réactif au son.",
  },
  {
    id: "M21",
    commit: "ACTUEL",
    title: "Architecture Modulaire AnarchyPreset Multi-Scènes & Isolation Faders/BPM",
    details: "Séparation stricte entre la couche de contrôle live (10 Faders + Horloge BPM 2 ou 4 mesures jamais écrasés au changement de Preset) et la couche graphique (AnarchyPreset / AnarchyScene à nombre libre de scènes .js et .cpp), migration officielle 'Default — Anarchy Pack', gestion dynamique des scènes (+ Ajouter, Dupliquer, Réordonner, Supprimer), modale 'Importer / Exporter un Preset' et modale 'Doc / Créer un Preset' avec Prompt IA.",
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
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/docs/visual-studio"
            className="px-3 py-1.5 rounded border-2 border-black bg-brand-red text-white hover:bg-black font-mono text-xs font-bold shadow-comic-sm transition-colors"
          >
            📖 GUIDE VISUAL STUDIO
          </Link>
          <Link
            href="/anarchy-visual-design"
            className="px-3 py-1.5 rounded border-2 border-black bg-brand-white hover:bg-brand-pearl font-mono text-xs font-bold shadow-comic-sm"
          >
            ← RETOUR STUDIO
          </Link>
        </div>
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

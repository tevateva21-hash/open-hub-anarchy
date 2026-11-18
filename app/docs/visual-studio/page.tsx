"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  AI_SCENE_PACK_PROMPT,
  DEFAULT_SCENE_PACKS,
  exportScenePackAsJson,
} from "@/lib/visual-engine/scene-packs";

const LRC_SCENARIO_PROMPT = `Transforme ces paroles en scénario LRC horodaté pour Anarchy Visual Studio (140 BPM, extrait 0.0s → 30.0s) :
Format exact par ligne : [mm:ss.xx] #SECTION TEXTE COURT
Sections disponibles : #INTRO, #COUPLET, #PRE_DROP, #DROP, #REFRAIN, #OUTRO.
Garde 3 à 6 mots max par ligne pour un rendu TikTok / 9:16 lisible.`;

const JS_3D_EXAMPLE_FULL = `// Hook 3D temps réel exécuté à 60 FPS dans le moteur 3D profond (Low-Poly PS1/PS2)
function customizeScene3D(scene3d, audio, t) {
  // 1. Piliers 3D verticaux audio-réactifs sur le kick (audio.bass)
  for (let i = 0; i < 4; i++) {
    const z = ((i * 1.4 - t * 2.2) % 5.6 + 5.6) % 5.6 - 2.2;
    const h = 0.65 + audio.bass * 0.95;
    scene3d.addBox(-1.6, 0, z, 0.24, h, 0.24, 0, t * 0.4, 0, "#FF1B24", 0.55 + audio.bass * 0.4);
    scene3d.addBox( 1.6, 0, z, 0.24, h, 0.24, 0, -t * 0.4, 0, "#00E5FF", 0.55 + audio.treble * 0.4);
  }

  // 2. Anneau octaédrique 3D central en rotation rapide sur les transitoires (audio.flux)
  scene3d.addRing(0, 0.1, 0.2, 1.05 + audio.bass * 0.35, 0.08, t * 1.1, t * 1.7, "#00E5FF", 0.85);

  // 3. Pyramide 3D suspendue au-dessus du dojo
  scene3d.addPyramid(0, 0.55 + audio.treble * 0.3, 0.1, 0.45, 0.65, -t * 1.4, "#FF1B24", 0.9);
}`;

const FADERS_DOC = [
  { bank: "01 // Dynamique", name: "Bass Punch", desc: "Amplifie la réaction aux kicks et basses fréquences (scale 3D, rebond caméra, flash)." },
  { bank: "01 // Dynamique", name: "Aigus / Clap", desc: "Amplifie les hautes fréquences (claps, charleys, transitoires)." },
  { bank: "01 // Dynamique", name: "Master Int.", desc: "Intensité énergétique globale de la scène 3D (0% à 100%)." },
  { bank: "02 // FX", name: "Strobe Aigu", desc: "Déclenche un flash clair d'arrière-plan lorsque les aigus ou claps frappent." },
  { bank: "02 // FX", name: "Kick Blackout", desc: "Coupe ou assombrit brièvement l'image sur les gros kicks." },
  { bank: "02 // FX", name: "Psychédélie", desc: "Ajoute kaléidoscope, symétries et déformation psychédélique sur le rendu 3D." },
  { bank: "02 // FX", name: "Morph Couleur", desc: "Fait glisser la Palette Principale vers la palette Cible Color Morph." },
  { bank: "02 // FX", name: "Anaglyph 3D", desc: "Séparation Rouge / Cyan 3D réactive à l'audio." },
  { bank: "03 // Caméra", name: "Zoom Cam", desc: "Zoom unifié de la caméra perspective 3D (50% à 220%)." },
  { bank: "03 // Caméra", name: "Pendule Cam", desc: "Balancement pendulaire de la caméra 3D calé sur le tempo." },
];

const FORMATS_DOC = [
  { ratio: "16:9", engine: "320 × 180", exportRes: "1280 × 720", usage: "YouTube · Twitch · Desktop" },
  { ratio: "9:16", engine: "180 × 320", exportRes: "1080 × 1920", usage: "TikTok · Reels · YouTube Shorts (+ Safe Zone)" },
  { ratio: "4:5", engine: "240 × 300", exportRes: "1080 × 1350", usage: "Feed Instagram · Facebook (+ Safe Zone)" },
  { ratio: "1:1", engine: "240 × 240", exportRes: "1080 × 1080", usage: "Post Instagram · Carrousel · Pochette" },
];

export default function VisualStudioDocsPage() {
  const [copiedId, setCopiedId] = useState<string>("");

  const copyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((prev) => (prev === id ? "" : prev)), 2500);
    } catch {
      setCopiedId("ERR");
    }
  };

  const samplePackJson = exportScenePackAsJson(DEFAULT_SCENE_PACKS[0]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* En-tête Documentation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black pb-4">
        <div>
          <span className="inline-block px-2 py-0.5 rounded bg-brand-red text-white font-mono text-[10px] font-bold uppercase mb-2">
            DOCUMENTATION OFFICIELLE // ANARCHY VISUAL STUDIO 3D
          </span>
          <h1 className="font-mono text-2xl sm:text-3xl font-bold text-brand-black">
            Guide Complet : Packs de Scènes 3D, Faders, Whisper &amp; Prompts IA
          </h1>
          <p className="font-sans text-sm text-neutral-600 mt-1">
            Tout comprendre pour importer un son (jusqu&apos;à 70 Mio), personnaliser les vraies scènes 3D profondes (JSON / JS 3D),
            piloter les 10 faders et exporter en 9:16 TikTok ou 16:9 YouTube avec son.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/docs/retroplanning">
            <Button variant="clinical" size="sm">
              📋 RÉTROPLANNING
            </Button>
          </Link>
          <Link href="/anarchy-visual-design">
            <Button variant="primary" size="sm">
              🎨 OUVRIR LE STUDIO
            </Button>
          </Link>
        </div>
      </div>

      {/* Sommaire rapide */}
      <Card moduleTitle="SOMMAIRE_RAPIDE // ACCÈS_DIRECT" moduleMeta="7 SECTIONS">
        <div className="flex flex-wrap gap-2 font-mono text-xs">
          {[
            ["#audio-lab", "1. Audio Lab (70 Mio) & Calage BPM"],
            ["#packs-couleurs", "2. Packs de Scènes 3D & Enchaînement BPM"],
            ["#faders", "3. Console 10 Faders (Isolation Stricte)"],
            ["#formats-export", "4. Formats TikTok/Insta & Export MP4"],
            ["#whisper-lrc", "5. Whisper & Scénario LRC"],
            ["#config-3d", "6. Personnalisation 3D (JSON / JS 3D) & Import/Export"],
            ["#prompts-ia", "7. Système de Prompts IA 3D (Copier)"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="px-2.5 py-1.5 rounded border border-black bg-brand-pearl hover:bg-brand-red hover:text-white font-bold transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
      </Card>

      {/* 1. Audio Lab */}
      <div id="audio-lab">
        <Card
          moduleTitle="01 // AUDIO_LAB (MAX 70 MIO) & CURSEUR .NET MAUI"
          moduleMeta="MP3 / WAV · FFT 24 KHZ · 0.00S OFFSET"
          activeIndicator
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs sm:text-sm text-neutral-700 leading-relaxed">
            <div className="space-y-2">
              <h3 className="font-mono font-bold text-brand-black text-sm">
                Import Audio (70 Mio) &amp; Cache Offline
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Formats acceptés</strong> : MP3 ou WAV jusqu&apos;à{" "}
                  <strong>70 Mio</strong> et <strong>8 minutes</strong> (décodage Web Audio 24 kHz en local).
                </li>
                <li>
                  <strong>Cache IndexedDB</strong> : les 5 dernières analyses FFT sont mémorisées
                  localement pour un rechargement instantané.
                </li>
                <li>
                  <strong>Piste Démo WAV 120 BPM</strong> : génère un son de test en 1 clic.
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-mono font-bold text-brand-black text-sm">
                Zone d&apos;extrait, Fondus &amp; Calage BPM
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Curseur libre + Fenêtre 30s glissable</strong> : cliquez/glissez sur la waveform
                  pour choisir la zone écoutée et exportée dans le MP4.
                </li>
                <li>
                  <strong>Calage 1er temps (<code>beatOffset</code>)</strong> : verrouillé à{" "}
                  <code>0.00s</code> par défaut, ajustable au centième ou via{" "}
                  <code>⚡ CALER 1ER TEMPS ICI</code>.
                </li>
                <li>
                  <strong>Pause Globale (<code>⏸ PAUSE</code>)</strong> : coupe immédiatement toute lecture sur le site.
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* 2. Packs 3D & Couleurs */}
      <div id="packs-couleurs">
        <Card
          moduleTitle="02 // PACKS DE SCÈNES 3D PROFONDES & ENCHAÎNEMENT BPM"
          moduleMeta="PS2 ENTER THE DRAGON · PSY-ACID 145 BPM · CADENCE 2/4 MESURES"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs sm:text-sm text-neutral-700 leading-relaxed">
            <div className="space-y-2">
              <h3 className="font-mono font-bold text-brand-black text-sm">
                Moteur de Rendu 3D Profond Unique (Low-Poly PS1/PS2)
              </h3>
              <p>
                Le moteur 3D Low-Poly / PS2 est l&apos;unique moteur graphique du Studio. Dans{" "}
                <strong>PACK DE SCÈNES // ENCHAÎNEMENT BPM</strong>, chaque pack (comme{" "}
                <strong>PS2 // Enter the Dragon (5 Scènes)</strong> avec <code>01. Dojo Néon</code>,{" "}
                <code>02. Enter the Dragon</code>, <code>03. Katana Rush</code>, <code>04. Shogun Boss</code>,{" "}
                <code>05. Digital Void</code>) contient un nombre libre de scènes 3D profondes (1, 3, 5, 8+) qui
                s&apos;enchaînent automatiquement toutes les <strong>2 mesures (8T)</strong> ou{" "}
                <strong>4 mesures (16T)</strong> selon le BPM.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-mono font-bold text-brand-black text-sm">
                Couleurs, Morph &amp; 4 Variations Rapides
              </h3>
              <p>
                Dans le panneau <strong>Couleurs &amp; Variations</strong>, changez instantanément la{" "}
                <strong>Palette Principale</strong>, sélectionnez une <strong>Cible Color Morph</strong>{" "}
                (pilotée par le fader <code>Morph Couleur</code>), ou cliquez sur l&apos;une des{" "}
                <strong>4 Variations Rapides</strong> pour expérimenter sans couper la lecture.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Console 10 Faders */}
      <div id="faders">
        <Card
          moduleTitle="03 // CONSOLE DES 10 FADERS LIVE (ISOLATION STRICTE)"
          moduleMeta="TEMPS RÉEL 60 FPS · JAMAIS ÉCRASÉS PAR LES PACKS 3D"
        >
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-brand-pearl border-l-4 border-[#00E5FF] font-sans text-xs text-neutral-700">
              <strong>Isolation stricte des Faders &amp; du BPM :</strong> changer de Pack 3D, importer un
              nouveau Pack JSON ou laisser les scènes 3D s&apos;enchaîner toutes les 2 ou 4 mesures{" "}
              <strong>ne réinitialise jamais aucun des 10 faders ni le BPM</strong>. Les faders modulent
              toujours le rendu 3D en temps réel par-dessus la scène active.
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse font-mono text-xs">
                <thead>
                  <tr className="bg-brand-pearl border-b-2 border-black text-left">
                    <th className="p-2">Banque</th>
                    <th className="p-2">Fader</th>
                    <th className="p-2">Effet réel sur la scène 3D</th>
                  </tr>
                </thead>
                <tbody>
                  {FADERS_DOC.map((f) => (
                    <tr key={f.name} className="border-b border-neutral-200">
                      <td className="p-2 text-neutral-500 whitespace-nowrap">{f.bank}</td>
                      <td className="p-2 font-bold text-brand-black whitespace-nowrap">{f.name}</td>
                      <td className="p-2 font-sans text-neutral-700">{f.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>

      {/* 4. Formats & Export MP4 */}
      <div id="formats-export">
        <Card
          moduleTitle="04 // FORMATS RÉSEAUX SOCIAUX & EXPORT MP4 + SON"
          moduleMeta="16:9 · 9:16 TIKTOK · 4:5 INSTA · 1:1 CARRÉ"
        >
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse font-mono text-xs">
                <thead>
                  <tr className="bg-brand-pearl border-b-2 border-black text-left">
                    <th className="p-2">Format</th>
                    <th className="p-2">Canvas Moteur</th>
                    <th className="p-2">Export HD</th>
                    <th className="p-2">Plateformes</th>
                  </tr>
                </thead>
                <tbody>
                  {FORMATS_DOC.map((fmt) => (
                    <tr key={fmt.ratio} className="border-b border-neutral-200">
                      <td className="p-2 font-bold text-brand-red">{fmt.ratio}</td>
                      <td className="p-2">{fmt.engine}</td>
                      <td className="p-2 font-bold">{fmt.exportRes}</td>
                      <td className="p-2 font-sans text-neutral-700">{fmt.usage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 rounded-lg bg-brand-pearl border-l-4 border-brand-red font-sans text-xs sm:text-sm text-neutral-700">
              <strong>Cohérence Audio / Vidéo / Export :</strong> le bouton{" "}
              <code>🎬 EXPORTER MP4</code> lance la lecture de votre zone d&apos;extrait prévisualisée,
              enregistre la vidéo 3D au format choisi avec le son (et vos fondus entrée/sortie),
              puis arrête et télécharge automatiquement le fichier à la fin de l&apos;extrait.
              En <code>9:16</code> et <code>4:5</code>, activez la <strong>Safe Zone</strong> pour
              éviter les boutons TikTok/Reels.
            </div>
          </div>
        </Card>
      </div>

      {/* 5. Whisper & Scénario LRC */}
      <div id="whisper-lrc">
        <Card
          moduleTitle="05 // WHISPER IA, SCÉNARIO #SECTIONS & PAROLES LRC"
          moduleMeta="POST /API/WHISPER · ALIGNEMENT MOT-À-MOT"
          activeIndicator
        >
          <div className="space-y-3 font-sans text-xs sm:text-sm text-neutral-700 leading-relaxed">
            <p>
              Le panneau <strong>Paroles &amp; Micro</strong> accepte les timecodes LRC standards{" "}
              (<code>[00:08.50]</code>) ainsi que des balises de scénario (<code>#INTRO</code>,{" "}
              <code>#PRE_DROP</code>, <code>#DROP</code>, <code>#REFRAIN</code>) incrustées en
              direct par-dessus le rendu 3D en bitmap 5×5.
            </p>
            <div className="p-3 rounded-lg bg-brand-pearl border border-black space-y-1.5">
              <div className="font-mono text-xs font-bold text-brand-black">
                Comment fonctionne la transcription Whisper ?
              </div>
              <ol className="list-decimal pl-5 space-y-1 text-xs">
                <li>
                  Votre navigateur découpe uniquement l&apos;extrait prévisualisé (ex: 30s) en WAV mono 16 kHz léger (~960 Ko).
                </li>
                <li>
                  L&apos;extrait est envoyé à <code>/api/whisper</code> qui appelle{" "}
                  <strong>Groq (<code>whisper-large-v3</code>)</strong> ou{" "}
                  <strong>OpenAI (<code>whisper-1</code>)</strong> selon la clé API configurée sur le serveur (<code>GROQ_API_KEY</code> ou <code>OPENAI_API_KEY</code>).
                </li>
                <li>
                  Les paroles horodatées et chaque mot individuel se calent automatiquement sur la musique !
                </li>
              </ol>
            </div>
          </div>
        </Card>
      </div>

      {/* 6. Personnalisation 3D Profonde (JSON / JS 3D) & Import/Export */}
      <div id="config-3d">
        <Card
          moduleTitle="06 // PERSONNALISATION DES SCÈNES 3D (JSON / JS 3D) & EXPORT PACK 3D"
          moduleMeta="CONFIG3D · CUSTOMIZESCENE3D 60 FPS · IMPORT/EXPORT JSON"
          activeIndicator
        >
          <div className="space-y-4">
            <p className="font-sans text-xs sm:text-sm text-neutral-700">
              Dans le panneau <strong>PACK DE SCÈNES // ENCHAÎNEMENT BPM</strong> du Studio, cliquez sur{" "}
              <code>🎛 ÉDITER SCÈNE 3D (JSON / JS 3D)</code> pour personnaliser en direct à 60 FPS la scène 3D active,
              ou sur <code>⇄ EXPORTER / IMPORTER PACK 3D (JSON)</code> pour partager un pack complet de scènes 3D.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans text-xs text-neutral-700">
              <div className="p-3 rounded-lg bg-brand-pearl border border-black space-y-1">
                <div className="font-mono font-bold text-brand-black">1. Onglet Paramètres 3D &amp; Audio</div>
                <p>
                  Réglez le moteur 3D de base (<code>ps1-bolide</code>, <code>lowpoly-tunnel</code>,{" "}
                  <code>lowpoly-vortex</code>), les géométries 3D additionnelles (<code>katana-blades</code>,{" "}
                  <code>floating-monoliths</code>, <code>octo-rings</code>, <code>cyber-pyramids</code>), la caméra
                  perspective (FOV, distance, pitch, yaw, orbite), le brouillard et les multiplicateurs audio.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-brand-pearl border border-black space-y-1">
                <div className="font-mono font-bold text-brand-black">2. Onglet Script 3D Live (JS 60 FPS)</div>
                <p>
                  Injectez des volumes 3D low-poly directement dans le pipeline Z-buffer/Lambert via{" "}
                  <code>customizeScene3D(scene3d, audio, t)</code> : boîtes 3D, pyramides 3D, anneaux octaédriques
                  et rubans 3D éclairés et projetés en perspective avec la scène principale.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-brand-pearl border border-black space-y-1">
                <div className="font-mono font-bold text-brand-black">3. Onglet Config JSON 3D &amp; Export Pack</div>
                <p>
                  Éditez l&apos;objet <code>config3d</code> complet d&apos;une scène ou exportez/importez un{" "}
                  <strong>Pack 3D JSON</strong> entier (1, 3, 5, 8 scènes ou plus) en un clic ou via un fichier{" "}
                  <code>.json</code>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[11px]">
              <div className="p-3 rounded-lg bg-brand-pearl border border-black space-y-1.5">
                <div className="font-bold text-brand-red">API JS 3D LIVE (scene3d.* dans customizeScene3D)</div>
                <ul className="space-y-1 text-neutral-800">
                  <li><code>scene3d.addBox(x, y, z, w, h, d, rx, ry, rz, colorHex, emissive)</code> — Volume 3D plein</li>
                  <li><code>scene3d.addPyramid(x, y, z, radius, height, ry, colorHex, emissive)</code> — Pyramide 3D</li>
                  <li><code>scene3d.addRing(x, y, z, radius, thickness, rx, ry, colorHex, emissive)</code> — Anneau 3D</li>
                  <li><code>scene3d.addRibbon(x1, y1, z1, x2, y2, z2, width, colorHex, emissive)</code> — Lame / Ruban 3D</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-brand-pearl border border-black space-y-1.5">
                <div className="font-bold text-brand-black">VARIABLES AUDIO &amp; TEMPS (audio.*, t)</div>
                <ul className="space-y-1 text-neutral-800">
                  <li><code>audio.bass</code> (0..1) — Kicks &amp; basses fréquences</li>
                  <li><code>audio.mid</code> (0..1) — Médiums &amp; synthés</li>
                  <li><code>audio.treble</code> (0..1) — Aigus &amp; charleys</li>
                  <li><code>audio.rms</code> (0..1) — Volume énergétique global</li>
                  <li><code>audio.flux</code> (0..1) — Transitoires rapides / claps</li>
                  <li><code>t</code> (secondes) — Horloge continue à 60 FPS</li>
                </ul>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 font-mono text-xs">
                <span className="font-bold text-brand-black">EXEMPLE DE SCRIPT JS 3D LIVE (PILIERS, ANNEAU &amp; PYRAMIDE 3D AUDIO-RÉACTIFS)</span>
                <Button
                  type="button"
                  variant="clinical"
                  size="sm"
                  onClick={() => void copyText("js3d-ex", JS_3D_EXAMPLE_FULL)}
                >
                  {copiedId === "js3d-ex" ? "✅ COPIÉ !" : "📋 COPIER SCRIPT 3D"}
                </Button>
              </div>
              <pre className="p-3 rounded-lg border-2 border-black bg-[#101216] text-[#00E5FF] font-mono text-[11px] overflow-x-auto leading-relaxed">
                {JS_3D_EXAMPLE_FULL}
              </pre>
            </div>
          </div>
        </Card>
      </div>

      {/* 7. Système de Prompts IA */}
      <div id="prompts-ia">
        <Card
          moduleTitle="07 // SYSTÈME DE PROMPTS IA 3D (PRÊTS À COPIER)"
          moduleMeta="PACK 3D MULTI-SCÈNES (JSON + JS 3D) · SCÉNARIO LRC"
          activeIndicator
        >
          <div className="space-y-5">
            <p className="font-sans text-xs sm:text-sm text-neutral-700">
              Copiez l&apos;un de ces prompts système dans votre IA (ChatGPT, Claude, Gemini...),
              ajoutez votre ambiance ou vos paroles, puis collez directement le JSON généré dans{" "}
              <code>⇄ EXPORTER / IMPORTER PACK 3D (JSON)</code> !
            </p>

            {/* Prompt 1 : Pack 3D */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-mono text-xs font-bold text-brand-black uppercase">
                  1. Prompt IA — Générer un Pack de Scènes 3D Profondes (JSON + Script 3D Live)
                </h3>
                <Button
                  type="button"
                  variant="comic"
                  size="sm"
                  onClick={() => void copyText("p1", AI_SCENE_PACK_PROMPT)}
                >
                  {copiedId === "p1" ? "✅ PROMPT 3D COPIÉ !" : "📋 COPIER PROMPT PACK 3D"}
                </Button>
              </div>
              <pre className="p-3 rounded-lg border border-black bg-[#101216] font-mono text-[11px] text-[#00E5FF] whitespace-pre-wrap">
                {AI_SCENE_PACK_PROMPT}
              </pre>
            </div>

            {/* Exemple JSON Pack 3D */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-mono text-xs font-bold text-brand-red uppercase">
                  2. Exemple Complet — Pack 3D Officiel &quot;PS2 // Enter the Dragon (5 Scènes)&quot; (JSON)
                </h3>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => void copyText("p2json", samplePackJson)}
                >
                  {copiedId === "p2json" ? "✅ JSON COPIÉ !" : "📋 COPIER PACK JSON"}
                </Button>
              </div>
              <pre className="p-3 rounded-lg border border-black bg-brand-pearl font-mono text-[10px] text-brand-black max-h-64 overflow-y-auto whitespace-pre-wrap">
                {samplePackJson}
              </pre>
            </div>

            {/* Prompt 3 : LRC */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-mono text-xs font-bold text-brand-black uppercase">
                  3. Prompt IA — Transformer des Paroles en Scénario LRC (#INTRO / #DROP)
                </h3>
                <Button
                  type="button"
                  variant="clinical"
                  size="sm"
                  onClick={() => void copyText("p3", LRC_SCENARIO_PROMPT)}
                >
                  {copiedId === "p3" ? "✅ PROMPT LRC COPIÉ !" : "📋 COPIER PROMPT LRC"}
                </Button>
              </div>
              <pre className="p-3 rounded-lg border border-black bg-brand-pearl font-mono text-[11px] text-brand-black whitespace-pre-wrap">
                {LRC_SCENARIO_PROMPT}
              </pre>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

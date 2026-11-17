"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  CPP_SHADER_AI_PROMPT,
  JS_SHADER_AI_PROMPT,
} from "@/lib/visual-engine/cpp-runtime";
import { AI_SCENE_PACK_PROMPT } from "@/lib/visual-engine/scene-packs";

const LRC_SCENARIO_PROMPT = `Transforme ces paroles en scénario LRC horodaté pour Anarchy Visual Studio (140 BPM, extrait 0.0s → 30.0s) :
Format exact par ligne : [mm:ss.xx] #SECTION TEXTE COURT
Sections disponibles : #INTRO, #COUPLET, #PRE_DROP, #DROP, #REFRAIN, #OUTRO.
Garde 3 à 6 mots max par ligne pour un rendu TikTok / 9:16 lisible.`;

const CPP_EXAMPLE_FULL = `// Exemple complet compatible 9:16 TikTok et 16:9 YouTube
// @param float pulseGain = 0.22 [0.05, 0.80]
// @param float ringRadius = 24.0 [10.0, 60.0]
// @color primaryColor = "#00E5FF"
// @toggle enableGlitch = true
#include <cmath>

void renderAnarchyFrame(AnarchyCtx& ctx) {
  float pulse = 1.0f + ctx.bass * pulseGain;
  ctx.zoom(pulse);
  ctx.grid(20, primaryColor, 40.0f);

  float cx = ctx.width * 0.5f;
  float cy = ctx.height * 0.48f;

  // Réagit automatiquement aux sections #DROP / #REFRAIN du scénario LRC
  if (ctx.lyricSection == "DROP" || ctx.lyricSection == "REFRAIN") {
    ctx.ring(cx, cy, ringRadius + ctx.bass * 52.0f, 2.5f, "#FF1B24");
    ctx.ring(cx, cy, ringRadius * 0.65f + ctx.treble * 36.0f, 1.5f, primaryColor);
  }

  // Glitch sur les claps / transitoires
  if (enableGlitch && ctx.flux > 0.30f) {
    ctx.glitchSlices(ctx.flux * 0.65f);
  }

  // Mot Whisper / LRC courant en anaglyphe 3D
  if (!ctx.lyricWord.empty()) {
    float x = clamp(cx - ctx.lyricWord.length * 4.2f, 8.0f, ctx.width - 36.0f);
    float y = ctx.height * 0.72f;
    ctx.text(ctx.lyricWord, x - 1, y, "#FF1B24", 12);
    ctx.text(ctx.lyricWord, x + 1, y, primaryColor, 12);
    ctx.text(ctx.lyricWord, x, y, "#FFFFFF", 12);
  }
  ctx.scanlines(0.18f);
}`;

const FADERS_DOC = [
  { bank: "01 // Dynamique", name: "Gain Basses", desc: "Amplifie la réaction aux kicks et basses fréquences (zoom, onde, flash)." },
  { bank: "01 // Dynamique", name: "Gain Aigus / Clap", desc: "Amplifie les hautes fréquences (claps, charleys, transitoires)." },
  { bank: "01 // Dynamique", name: "Master Int.", desc: "Intensité énergétique globale de la scène (0% à 100%)." },
  { bank: "02 // FX", name: "Strobe Aigu", desc: "Déclenche un flash clair d'arrière-plan lorsque les aigus ou claps frappent." },
  { bank: "02 // FX", name: "Kick Blackout", desc: "Coupe ou assombrit brièvement l'image sur les gros kicks." },
  { bank: "02 // FX", name: "Psychédélie", desc: "Ajoute kaléidoscope, symétries et déformation psychédélique." },
  { bank: "02 // FX", name: "Morph Couleur", desc: "Fait glisser la Palette Principale vers la palette Cible Color Morph." },
  { bank: "02 // FX", name: "Anaglyph 3D", desc: "Séparation Rouge / Cyan 3D réactive à l'audio." },
  { bank: "03 // Caméra", name: "Zoom Cam", desc: "Zoom unifié des scènes 2D pixel et 3D low-poly (50% à 220%)." },
  { bank: "03 // Caméra", name: "Pendule Cam", desc: "Balancement pendulaire de la caméra calé sur le tempo." },
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* En-tête Documentation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black pb-4">
        <div>
          <span className="inline-block px-2 py-0.5 rounded bg-brand-red text-white font-mono text-[10px] font-bold uppercase mb-2">
            DOCUMENTATION OFFICIELLE // ANARCHY VISUAL STUDIO
          </span>
          <h1 className="font-mono text-2xl sm:text-3xl font-bold text-brand-black">
            Guide Complet : Studio, C++, Whisper &amp; Prompts IA
          </h1>
          <p className="font-sans text-sm text-neutral-600 mt-1">
            Tout comprendre pour importer un son (jusqu&apos;à 70 Mio), piloter les 10 faders,
            injecter du C++ live et exporter en 9:16 TikTok ou 16:9 YouTube avec son.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/docs/retroplanning">
            <Button variant="clinical" size="sm">
              📋 RÉTROPLANNING
            </Button>
          </Link>
          <Link href="/anarchy-visual-design/editeur">
            <Button variant="comic" size="sm">
              💻 ÉDITEUR C++
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
      <Card moduleTitle="SOMMAIRE_RAPIDE // ACCÈS_DIRECT" moduleMeta="9 SECTIONS">
        <div className="flex flex-wrap gap-2 font-mono text-xs">
          {[
            ["#audio-lab", "1. Audio Lab (70 Mio) & Calage BPM"],
            ["#packs-couleurs", "2. Packs 5 Scènes & Variations"],
            ["#faders", "3. Console 10 Faders"],
            ["#formats-export", "4. Formats TikTok/Insta & Export MP4"],
            ["#whisper-lrc", "5. Whisper & Scénario LRC"],
            ["#cpp-runtime", "6. Runtime C++ Live (AnarchyCtx)"],
            ["#prompts-ia", "7. Système de Prompts IA (Copier)"],
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
                  <strong>Calage 1er temps (`beatOffset`)</strong> : verrouillé à{" "}
                  <code>0.00s</code> par défaut, ajustable au centième ou via{" "}
                  <code>⚡ CALER 1ER TEMPS ICI</code>.
                </li>
                <li>
                  <strong>Pause Globale (`⏸ PAUSE`)</strong> : coupe immédiatement toute lecture sur le site.
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* 2. Packs & Couleurs */}
      <div id="packs-couleurs">
        <Card
          moduleTitle="02 // PACKS DE 5 SCÈNES & COULEURS / VARIATIONS"
          moduleMeta="ENTER THE DRAGON · SEED · 4 VARIATIONS"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs sm:text-sm text-neutral-700 leading-relaxed">
            <div className="space-y-2">
              <h3 className="font-mono font-bold text-brand-black text-sm">
                Système de Packs de 5 Scènes
              </h3>
              <p>
                Au lieu d&apos;une scène statique, le studio enchaîne automatiquement{" "}
                <strong>5 scènes au BPM</strong> (par défaut toutes les 16 mesures). Le pack
                original <strong>PS2 // Enter the Dragon</strong> est fourni de base, et le bouton{" "}
                <code>🎲 GÉNÉRER UN PACK</code> crée à l&apos;infini de nouveaux packs uniques par seed.
              </p>
              <p className="text-neutral-500 font-mono text-xs">
                Les packs peuvent aussi être importés/exportés en C++ (<code>ANARCHY_PACK[5]</code>) ou JSON dans l&apos;Éditeur C++.
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
          moduleTitle="03 // CONSOLE DES 10 FADERS LIVE"
          moduleMeta="TEMPS RÉEL 60 FPS · LOCK PAR PARAMÈTRE"
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-brand-pearl border-b-2 border-black text-left">
                  <th className="p-2">Banque</th>
                  <th className="p-2">Fader</th>
                  <th className="p-2">Effet réel sur la vidéo</th>
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
              enregistre la vidéo au format choisi avec le son (et vos fondus entrée/sortie),
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
              <code>#PRE_DROP</code>, <code>#DROP</code>, <code>#REFRAIN</code>) transmises en
              direct au moteur vidéo et au code C++.
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
                  Les paroles horodatées et chaque mot individuel (<code>ctx.lyricWord</code>) se calent automatiquement sur la musique !
                </li>
              </ol>
            </div>
          </div>
        </Card>
      </div>

      {/* 6. Runtime JS & C++ Live */}
      <div id="cpp-runtime">
        <Card
          moduleTitle="06 // RUNTIME MODULAIRE JS NATIF (.JS) & C++ (.CPP)"
          moduleMeta="FAST-PATH V8 60 FPS · MULTI-FICHIERS · @PARAM · PADS VJ"
          activeIndicator
        >
          <div className="space-y-4">
            <p className="font-sans text-xs sm:text-sm text-neutral-700">
              Dans <Link href="/anarchy-visual-design/editeur" className="font-bold text-brand-red underline">/anarchy-visual-design/editeur</Link>,
              vous pouvez coder soit en <strong>JavaScript Natif (<code>.js</code>)</strong> — qui court-circuite le transpileur C++ pour une exécution V8 directe à 60 FPS avec état persistant hors boucle — soit en <strong>C++ (<code>.cpp</code>)</strong>, et mixer librement vos scènes (<code>sceno_openhub_ps2.cpp</code>, <code>lowpoly_3d_js.js</code>...).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-sans text-xs text-neutral-700">
              <div className="p-3 rounded-lg bg-brand-pearl border border-black space-y-1">
                <div className="font-mono font-bold text-brand-black">1. Mode JS Natif (Fast-Path V8) &amp; Détection Auto</div>
                <p>
                  Dès qu&apos;un script commence par <code>function renderAnarchyFrame(ctx)</code> (ou utilise{" "}
                  <code>const</code>/<code>let</code>/<code>=&gt;</code> sans signature <code>AnarchyCtx</code>),
                  l&apos;éditeur bascule en <strong>JS Natif</strong> avec coloration syntaxique adaptée, exposition de{" "}
                  <code>Math.*</code> et conservation de vos variables d&apos;état entre les frames.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-brand-pearl border border-black space-y-1">
                <div className="font-mono font-bold text-brand-black">2. Transpileur C++ &amp; Documents Multi-Fichiers</div>
                <p>
                  En mode C++, le transpileur accepte <code>#include</code>, <code>std::*</code>, tableaux{" "}
                  <code>arr[N]</code> et lambdas <code>[&amp;]()</code>. Créez, renommez, dupliquez, importez ou
                  exportez vos scripts <code>.js</code> et <code>.cpp</code>.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-brand-pearl border border-black space-y-1">
                <div className="font-mono font-bold text-brand-black">3. Scènes Mixtes (.js / .cpp) &amp; Pads VJ</div>
                <p>
                  Assignez n&apos;importe quel document <code>.js</code> ou <code>.cpp</code> + un preset à une section LRC/Whisper (<code>INTRO</code>,{" "}
                  <code>MAIN</code>, <code>DROP</code>, <code>REFRAIN</code>, <code>OUTRO</code>), un créneau temporel
                  ou un pad VJ manuel avec transitions (<code>Cut</code>, <code>Fondu</code>, <code>Glitch</code>).
                </p>
              </div>
              <div className="p-3 rounded-lg bg-brand-pearl border border-black space-y-1">
                <div className="font-mono font-bold text-brand-black">4. Uniforms UI &amp; Presets par Document</div>
                <p>
                  Déclarez <code>{"// @param float speed = 4.0 [0.0, 20.0]"}</code>,{" "}
                  <code>{'// @color primaryColor = "#00F0FF"'}</code> ou{" "}
                  <code>{"// @toggle enableGlitch = true"}</code> : identique en <strong>JS</strong> et en <strong>C++</strong>, l&apos;Inspector génère sliders, color pickers
                  et toggles injectés à 60 FPS via <code>ctx.params</code> et variables locales sans recompiler.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[11px]">
              <div className="p-3 rounded-lg bg-brand-pearl border border-black space-y-1.5">
                <div className="font-bold text-brand-red">VARIABLES DISPONIBLES (ctx.*)</div>
                <ul className="space-y-1 text-neutral-800">
                  <li><code>ctx.t, ctx.bpm, ctx.beat, ctx.beatPhase</code> — Temps &amp; rythme (0..1)</li>
                  <li><code>ctx.bass, ctx.mid, ctx.treble, ctx.rms, ctx.flux</code> — Audio live (0..1)</li>
                  <li><code>ctx.width, ctx.height</code> — Résolution dynamique selon le format (9:16, 16:9...)</li>
                  <li><code>ctx.sceneIndex</code> — Index de la scène active (0..4)</li>
                  <li><code>ctx.lyricLine, ctx.lyricWord</code> — Ligne et mot Whisper/LRC actif</li>
                  <li><code>ctx.lyricProgress, ctx.lyricSection</code> — Progression (0..1) &amp; section (#DROP...)</li>
                  <li><code>ctx.params</code> &amp; variables <code>@param/@color/@toggle</code> — Uniforms live</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-brand-pearl border border-black space-y-1.5">
                <div className="font-bold text-brand-black">FONCTIONS DE DESSIN &amp; FX (ctx.*)</div>
                <ul className="space-y-1 text-neutral-800">
                  <li><code>ctx.clear(color)</code> — Efface la scène de base (Mode C++ Pur)</li>
                  <li><code>ctx.tint(color, alpha)</code> / <code>ctx.zoom(scale)</code></li>
                  <li><code>ctx.circle(...)</code> / <code>ctx.ring(...)</code> / <code>ctx.line(...)</code> / <code>ctx.rect(...)</code></li>
                  <li><code>ctx.grid(spacing, color, speed)</code> / <code>ctx.text(str, x, y, color, size)</code></li>
                  <li><code>ctx.kaleidoscope(segs, speed)</code> / <code>ctx.glitchSlices(amount)</code></li>
                  <li><code>ctx.scanlines(alpha)</code> / <code>ctx.invert(amount)</code> / <code>rgba(r,g,b,a)</code></li>
                </ul>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 font-mono text-xs">
                <span className="font-bold text-brand-black">EXEMPLE C++ COMPLET (UNIFORMS + PAROLES + RESPONSIVE 9:16)</span>
                <Button
                  type="button"
                  variant="clinical"
                  size="sm"
                  onClick={() => void copyText("cpp-ex", CPP_EXAMPLE_FULL)}
                >
                  {copiedId === "cpp-ex" ? "✅ COPIÉ !" : "📋 COPIER EXEMPLE"}
                </Button>
              </div>
              <pre className="p-3 rounded-lg border-2 border-black bg-[#101216] text-[#00E5FF] font-mono text-[11px] overflow-x-auto leading-relaxed">
                {CPP_EXAMPLE_FULL}
              </pre>
            </div>
          </div>
        </Card>
      </div>

      {/* 7. Système de Prompts IA */}
      <div id="prompts-ia">
        <Card
          moduleTitle="07 // SYSTÈME DE PROMPTS IA (PRÊTS À COPIER)"
          moduleMeta="PACK 5 SCÈNES · SHADER C++ · SCÉNARIO LRC"
          activeIndicator
        >
          <div className="space-y-5">
            <p className="font-sans text-xs sm:text-sm text-neutral-700">
              Copiez l&apos;un de ces 3 prompts système dans votre IA (ChatGPT, Claude, Gemini...),
              ajoutez votre thème musical ou vos paroles, puis collez directement le résultat dans
              le Studio ou l&apos;Éditeur C++ !
            </p>

            {/* Prompt 1 */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-mono text-xs font-bold text-brand-black uppercase">
                  1. Prompt IA — Générer un Pack de 5 Scènes (C++ .hpp / JSON)
                </h3>
                <Button
                  type="button"
                  variant="comic"
                  size="sm"
                  onClick={() => void copyText("p1", AI_SCENE_PACK_PROMPT)}
                >
                  {copiedId === "p1" ? "✅ PROMPT 1 COPIÉ !" : "📋 COPIER PROMPT PACK"}
                </Button>
              </div>
              <pre className="p-3 rounded-lg border border-black bg-brand-pearl font-mono text-[11px] text-brand-black whitespace-pre-wrap">
                {AI_SCENE_PACK_PROMPT}
              </pre>
            </div>

            {/* Prompt 2 */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-mono text-xs font-bold text-brand-red uppercase">
                  2. Prompt IA — Générer un Shader C++ Live (Paroles &amp; Formats 9:16 / 16:9)
                </h3>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => void copyText("p2", CPP_SHADER_AI_PROMPT)}
                >
                  {copiedId === "p2" ? "✅ PROMPT 2 COPIÉ !" : "📋 COPIER PROMPT C++"}
                </Button>
              </div>
              <pre className="p-3 rounded-lg border border-black bg-[#101216] font-mono text-[11px] text-[#00E5FF] whitespace-pre-wrap">
                {CPP_SHADER_AI_PROMPT}
              </pre>
            </div>

            {/* Prompt 2bis : JS Natif */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-mono text-xs font-bold text-amber-700 uppercase">
                  2b. Prompt IA — Générer un Script JavaScript Natif 60 FPS (3D Low-Poly / Creative Coding)
                </h3>
                <Button
                  type="button"
                  variant="comic"
                  size="sm"
                  onClick={() => void copyText("p2js", JS_SHADER_AI_PROMPT)}
                >
                  {copiedId === "p2js" ? "✅ PROMPT JS COPIÉ !" : "📋 COPIER PROMPT JS"}
                </Button>
              </div>
              <pre className="p-3 rounded-lg border border-black bg-[#0D1016] font-mono text-[11px] text-amber-300 whitespace-pre-wrap">
                {JS_SHADER_AI_PROMPT}
              </pre>
            </div>

            {/* Prompt 3 */}
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
                  {copiedId === "p3" ? "✅ PROMPT 3 COPIÉ !" : "📋 COPIER PROMPT LRC"}
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

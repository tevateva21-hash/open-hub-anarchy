"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  AI_SCENE_PACK_PROMPT,
  ANARCHY_BASS_TARGETS,
  ANARCHY_CAMERA_MODES,
  ANARCHY_FLUX_TARGETS,
  ANARCHY_MID_TARGETS,
  ANARCHY_PROCEDURAL_PRIMITIVES,
  ANARCHY_SIDE_PROP_TYPES,
  ANARCHY_SUBJECT_MESH_TYPES,
  ANARCHY_TERRAIN_TYPES,
  ANARCHY_TREBLE_TARGETS,
  DEFAULT_SCENE_PACKS,
  exportScenePackAsJson,
} from "@/lib/visual-engine/scene-packs";
import { POST_FX_REGISTRY } from "@/lib/visual-studio/registry";

const LRC_SCENARIO_PROMPT = `Transforme ces paroles en scénario LRC horodaté pour Anarchy Visual Studio (140 BPM, extrait 0.0s → 30.0s) :
Format exact par ligne : [mm:ss.xx] #SECTION TEXTE COURT
Sections disponibles : #INTRO, #COUPLET, #PRE_DROP, #DROP, #REFRAIN, #OUTRO.
Garde 3 à 6 mots max par ligne pour un rendu TikTok / 9:16 lisible.`;

const CANONICAL_PACK_EXAMPLE = `{
  "packId": "ps2-nether-runner-v1",
  "name": "PS2 // Nether & Brutalist Runner",
  "author": "Anarchy Studio",
  "scenes": [
    {
      "id": "scene-1",
      "name": "01. Cyber Corridor",
      "environment": {
        "skyColor": "#060A12",
        "fogColor": "#060A12",
        "fogDensity": 0.045,
        "terrainType": "infinite_grid",
        "terrainSpeed": 12.0,
        "terrainPrimaryColor": "#00F0FF",
        "terrainSecondaryColor": "#FF0055"
      },
      "subject": {
        "meshType": "voxel_runner",
        "primaryColor": "#00838F",
        "accentColor": "#FF0055",
        "wireframeOverlay": true,
        "scale": 1.0
      },
      "camera": {
        "mode": "chase_low",
        "fov": 75,
        "shakeIntensity": 0.4
      },
      "audioMapping": {
        "bassTarget": "camera_zoom_and_jump",
        "midTarget": "terrain_wave_height",
        "trebleTarget": "particles_burst",
        "fluxTarget": "glitch_and_emissive"
      }
    }
  ]
}`;

const FADERS_DOC = [
  { bank: "01 // Dynamique", name: "Bass Punch", desc: "Multiplicateur direct sur audioMapping.bassTarget (zoom/jump caméra, pulsation du sujet 3D, impact des piliers)." },
  { bank: "01 // Dynamique", name: "Aigus / Clap", desc: "Multiplicateur direct sur audioMapping.trebleTarget (pluie de particules 3D, surbrillance wireframe, slash katana)." },
  { bank: "01 // Dynamique", name: "Master Int.", desc: "Multiplicateur global sur la vitesse terrainSpeed, la densité du brouillard fogDensity et l'échelle du sujet 3D." },
  { bank: "02 // FX", name: "Strobe Aigu", desc: "Déclenche un flash clair d'arrière-plan lorsque les aigus ou claps frappent." },
  { bank: "02 // FX", name: "Kick Blackout", desc: "Coupe ou assombrit brièvement l'image sur les gros kicks." },
  { bank: "02 // FX", name: "Psychédélie", desc: "Ajoute kaléidoscope, symétries et déformation psychédélique sur le rendu 3D." },
  { bank: "02 // FX", name: "Morph Couleur", desc: "Fait glisser la Palette Principale vers la palette Cible Color Morph." },
  { bank: "02 // FX", name: "Anaglyph 3D", desc: "Séparation Rouge / Cyan 3D réactive à l'audio." },
  { bank: "03 // Caméra", name: "Zoom Cam", desc: "Multiplicateur unifié sur camera.fov et la distance de projection perspective 3D (50% à 220%)." },
  { bank: "03 // Caméra", name: "Pendule Cam", desc: "Amplifie le roulis et camera.shakeIntensity calés sur le tempo BPM." },
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
            DOCUMENTATION OFFICIELLE // ANARCHY VISUAL STUDIO 3D (DATA-DRIVEN JSON)
          </span>
          <h1 className="font-mono text-2xl sm:text-3xl font-bold text-brand-black">
            Guide Complet : Cartouches / Packs 3D JSON (`Anarchy3DPack`), Faders, Whisper &amp; Prompts IA
          </h1>
          <p className="font-sans text-sm text-neutral-600 mt-1">
            Tout comprendre pour importer un son (jusqu&apos;à 70 Mio), personnaliser les scènes 3D profondes via le schéma JSON{" "}
            <code>Anarchy3DPack</code> (zéro <code>eval</code>, zéro crash), piloter les 10 faders et exporter en 9:16 TikTok ou 16:9 YouTube.
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
            ["#faders", "3. Console 10 Faders (Multiplicateurs Temps Réel)"],
            ["#formats-export", "4. Formats TikTok/Insta & Export MP4"],
            ["#whisper-lrc", "5. Whisper & Scénario LRC"],
            ["#config-3d", "6. Schéma JSON Cartouche 3D (Anarchy3DPack)"],
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
          moduleMeta="PS2 ENTER THE DRAGON · NETHER RUNNER · PSY-ACID 145 BPM · CADENCE 2/4 MESURES"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs sm:text-sm text-neutral-700 leading-relaxed">
            <div className="space-y-2">
              <h3 className="font-mono font-bold text-brand-black text-sm">
                Moteur de Rendu 3D Data-Driven (Low-Poly PS1/PS2)
              </h3>
              <p>
                Le moteur 3D Low-Poly / PS2 est l&apos;unique moteur graphique du Studio et fonctionne en mode{" "}
                <strong>100% Data-Driven JSON</strong>. Dans{" "}
                <strong>PACK DE SCÈNES // ENCHAÎNEMENT BPM</strong>, chaque pack (comme{" "}
                <strong>PS2 // Enter the Dragon (5 Scènes)</strong>,{" "}
                <strong>PS2 // Nether &amp; Brutalist Runner</strong> ou{" "}
                <strong>Psy-Acid 145 BPM (5 Scènes)</strong>) contient un nombre libre de scènes 3D profondes (1, 3, 5, 8+) qui
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
          moduleTitle="03 // CONSOLE DES 10 FADERS LIVE (MULTIPLICATEURS TEMPS RÉEL)"
          moduleMeta="ZÉRO CONFLIT · JAMAIS ÉCRASÉS PAR LES PACKS 3D JSON"
        >
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-brand-pearl border-l-4 border-[#00E5FF] font-sans text-xs text-neutral-700">
              <strong>Les Faders restent souverains :</strong> le JSON d&apos;une scène 3D définit les{" "}
              <em>valeurs de base</em> (<code>terrainSpeed</code>, <code>fogDensity</code>,{" "}
              <code>camera.fov</code>, <code>camera.shakeIntensity</code>, <code>subject.scale</code>,{" "}
              <code>audioMapping.*</code>), et les <strong>10 faders de l&apos;interface</strong> agissent comme{" "}
              <strong>multiplicateurs en temps réel</strong> par-dessus. Changer ou importer un Pack 3D JSON ne
              modifie jamais aucun fader ni le BPM.
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse font-mono text-xs">
                <thead>
                  <tr className="bg-brand-pearl border-b-2 border-black text-left">
                    <th className="p-2">Banque</th>
                    <th className="p-2">Fader</th>
                    <th className="p-2">Multiplicateur temps réel sur la scène 3D JSON</th>
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

      {/* 6. Schéma JSON Cartouche 3D (Anarchy3DPack & Anarchy3DScene) */}
      <div id="config-3d">
        <Card
          moduleTitle="06 // ARCHITECTURE DATA-DRIVEN : CARTOUCHE / PACK 3D JSON (ANARCHY3DPACK)"
          moduleMeta="ZÉRO EVAL · ZÉRO CRASH · VALIDATION TEMPS RÉEL"
          activeIndicator
        >
          <div className="space-y-4">
            <p className="font-sans text-xs sm:text-sm text-neutral-700">
              Au lieu d&apos;exécuter du code arbitraire fragile, chaque Pack 3D exportable ou généré par une IA suit le schéma JSON strict{" "}
              <code>Anarchy3DPack</code>. Dans le panneau <strong>PACK DE SCÈNES // ENCHAÎNEMENT BPM</strong>, utilisez{" "}
              <code>{`{ } ÉDITER / VOIR LE JSON`}</code>, <code>⇄ IMPORTER / EXPORTER UN PACK</code> ou{" "}
              <code>📖 DOC / GÉNÉRER AVEC UNE IA</code>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[11px]">
              <div className="p-3 rounded-lg bg-brand-pearl border border-black space-y-1.5">
                <div className="font-bold text-brand-red">1. CALQUES V2 — TERRAIN, SIDEPROPS, SUBJECTS &amp; POSTFX</div>
                <ul className="space-y-1 text-neutral-800">
                  <li>
                    <strong>terrain.type</strong> :{" "}
                    <code>{ANARCHY_TERRAIN_TYPES.map((x) => x.value).join(" | ")}</code>
                  </li>
                  <li>
                    <strong>sideProps.type</strong> :{" "}
                    <code>{ANARCHY_SIDE_PROP_TYPES.map((x) => x.value).join(" | ")}</code>
                  </li>
                  <li>
                    <strong>subject.meshType</strong> :{" "}
                    <code>{ANARCHY_SUBJECT_MESH_TYPES.map((x) => x.value).join(" | ")}</code>
                  </li>
                  <li>
                    <strong>procedural_group parts[].primitive</strong> :{" "}
                    <code>{ANARCHY_PROCEDURAL_PRIMITIVES.map((x) => x.value).join(" | ")}</code>
                  </li>
                  <li>
                    <strong>postFx</strong> :{" "}
                    <code>{POST_FX_REGISTRY.map((x) => `${x.key} (${x.range})`).join(" · ")}</code>
                  </li>
                  <li>
                    <strong>cloner.mode (v3)</strong> :{" "}
                    <code>linear | radial | grid | spiral</code> (<code>count</code> 2..64,{" "}
                    <code>offset</code>, <code>stepRotation</code>°, <code>stepScale</code>, plafond 256 primitives/scène)
                  </li>
                  <li>
                    <strong>animations[] (v3, zéro eval)</strong> : cibles{" "}
                    <code>pos.x/y/z, rot.x/y/z, scale, scale.x/y/z, emissiveIntensity, fov</code> · variables{" "}
                    <code>t, beat, i, bass, mid, treble, flux</code> · fonctions{" "}
                    <code>sin, cos, tan, abs, min, max, clamp, smoothstep, pi, tau</code>
                  </li>
                  <li>
                    <strong>renderStyle (v3)</strong> :{" "}
                    <code>resolutionScale (0.15..1.0)</code>,{" "}
                    <code>shading (wireframe | flat | toon_cel | hologram | chrome_reflective | neon_glow)</code>,{" "}
                    <code>outlineThickness (0..6)</code> (CRT/scanlines strictement optionnels)
                  </li>
                  <li>
                    <strong>compositionMode &amp; backdrop.shader (v3)</strong> :{" "}
                    <code>corridor | void_orbital | tunnel_infinite | kaleido_mandala | terrain_flyover</code> ·{" "}
                    shaders <code>none | plasma_fluid | voronoi_cells | radial_sunburst | grid_horizon | noise_fog</code>
                  </li>
                  <li>
                    <strong>generators[] (v3)</strong> :{" "}
                    <code>particle_field</code> (<code>vortex | explosion_on_kick | rain | swarm</code>),{" "}
                    <code>ribbon_trails</code>, <code>audio_wave_mesh</code>,{" "}
                    <code>instanced_array</code> (<code>grid | spiral | ring | fractal</code>)
                  </li>
                  <li>
                    <strong>Couche 1–3 Organique (Anarchy3DPackV4)</strong> :{" "}
                    <code>environment.lightingPreset</code> (<code>studio_clean | cyber_neon | sunset_warm | dark_void</code>),{" "}
                    <code>backdropType</code> (<code>liquid_plasma | gradient_sky | starfield | grid_horizon | solid_color</code>),{" "}
                    <code>renderStyle.toneMapping</code> (<code>aces_filmic | reinhard | cineon | none</code>),{" "}
                    <code>actors[]</code> (<code>organic_blob | wave_terrain | spline_ribbons | particle_swarm | glb_model | sprite_2d</code> + <code>audioModulation[]</code> sur <code>bass/lowMid/highMid/treble/energy/fader_1..19</code>),{" "}
                    <code>postFX[]</code> cumulable (<code>bloom | depth_of_field | toon_outline | chromatic_aberration | film_grain | pixelate</code>),{" "}
                    <code>durationBars</code> (<code>1..64</code> + <code>HOLD</code>) &amp; <code>transition</code> (<code>cut | crossfade | camera_swoop | flash</code>).
                  </li>
                  <li>
                    <strong>Cartoon 1930 / Cuphead (Anarchy3DPackV5)</strong> :{" "}
                    <code>parallax_layer</code> (<code>watercolor_hills | stage_curtains | city_silhouette | clouds_band | checker_floor | psyche_rings</code>, <code>scrollX/Y</code>),{" "}
                    <code>cartoon_sprite</code> (<code>framesX × framesY</code> au BPM + contour noir),{" "}
                    <code>rubber_hose_mesh</code> (<code>hose_arms | pie_eyes | vintage_wheel | music_notes | fluffy_clouds | theater_curtains | boss_character | psyche_tunnel</code>),{" "}
                    <code>cartoonPhysics</code> (<code>steppedFps: 12|24|60</code>, <code>squashStretch</code>, <code>lineBoil</code>, <code>faderBindings</code>),{" "}
                    <code>vintage_1930_film</code> (<code>filmGrain</code>, <code>scratchesAndDust</code>, <code>gateWeave</code>, <code>colorGrade</code>, <code>vignette</code>) &amp;{" "}
                    <code>toon_outline</code> (<code>inkThickness</code>, <code>inkJitter</code>).
                  </li>
                  <li>
                    <strong>Morphing Inter-Scènes &amp; Programmation Temporelle DAW (Anarchy3DPackV6)</strong> :{" "}
                    même <code>actor.id</code> entre 2 scènes consécutives déclenche un{" "}
                    <strong>Vertex Lerp géométrique</strong> (ex. <code>organic_blob</code> ↔ <code>rubber_hose_mesh</code>) et un{" "}
                    <strong>Particle Swarm Morphing</strong> (<code>shapeTarget: sphere | vortex | tunnel | grid | text_outline</code>) sur{" "}
                    <code>morphTransition</code> (<code>durationBeats: 1..16</code>, <code>easing: linear | easeInOutCubic | elasticOut | expoIn</code>),{" "}
                    <code>automations[]</code> (<code>target</code>, <code>from</code>, <code>to</code>, <code>easing</code> sur la progression <code>0.0 → 1.0</code>),{" "}
                    <code>modulators[]</code> (<code>lfo_1..lfo_4</code>, <code>waveform: sine | triangle | saw | square | random_hold</code>, <code>rateBeats: 0.25..8</code>) et{" "}
                    <code>cameraCuts[]</code> (<code>rig</code>, <code>fov</code>, <code>switchEveryBars</code>, <code>onPeakBand: snare | kick | bass</code>, <code>transition: cut | glide</code>).
                  </li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-brand-pearl border border-black space-y-1.5">
                <div className="font-bold text-brand-black">2. CAMERA &amp; AUDIOMAPPING (VALEURS AUTORISÉES)</div>
                <ul className="space-y-1 text-neutral-800">
                  <li>
                    <strong>camera.mode / rig (v3)</strong> :{" "}
                    <code>{ANARCHY_CAMERA_MODES.map((x) => x.value).join(" | ")}</code> · rig:{" "}
                    <code>orbit_smooth | dolly_zoom_on_kick | first_person_fly | top_down_spin | handheld_shake</code> (+ <code>beatCut</code>)
                  </li>
                  <li>
                    <strong>audioMapping.bassTarget</strong> :{" "}
                    <code>{ANARCHY_BASS_TARGETS.map((x) => x.value).join(" | ")}</code>
                  </li>
                  <li>
                    <strong>audioMapping.midTarget</strong> :{" "}
                    <code>{ANARCHY_MID_TARGETS.map((x) => x.value).join(" | ")}</code>
                  </li>
                  <li>
                    <strong>audioMapping.trebleTarget</strong> :{" "}
                    <code>{ANARCHY_TREBLE_TARGETS.map((x) => x.value).join(" | ")}</code>
                  </li>
                  <li>
                    <strong>audioMapping.fluxTarget</strong> :{" "}
                    <code>{ANARCHY_FLUX_TARGETS.map((x) => x.value).join(" | ")}</code>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 font-mono text-xs">
                <span className="font-bold text-brand-black">
                  SCHÉMA OFFICIEL `Anarchy3DPack` (&quot;PS2 // Nether &amp; Brutalist Runner&quot;)
                </span>
                <Button
                  type="button"
                  variant="clinical"
                  size="sm"
                  onClick={() => void copyText("canonical-pack", CANONICAL_PACK_EXAMPLE)}
                >
                  {copiedId === "canonical-pack" ? "✅ COPIÉ !" : "📋 COPIER CE SCHÉMA JSON"}
                </Button>
              </div>
              <pre className="p-3 rounded-lg border-2 border-black bg-[#101216] text-[#00E5FF] font-mono text-[11px] overflow-x-auto leading-relaxed">
                {CANONICAL_PACK_EXAMPLE}
              </pre>
            </div>
          </div>
        </Card>
      </div>

      {/* 7. Système de Prompts IA */}
      <div id="prompts-ia">
        <Card
          moduleTitle="07 // SYSTÈME DE PROMPTS IA 3D (PRÊTS À COPIER)"
          moduleMeta="GÉNÉRER UN PACK 3D JSON 100% VALIDE · SCÉNARIO LRC"
          activeIndicator
        >
          <div className="space-y-5">
            <p className="font-sans text-xs sm:text-sm text-neutral-700">
              Copiez l&apos;un de ces prompts système dans votre IA (ChatGPT, Claude, Gemini...),
              ajoutez votre ambiance ou vos paroles, puis collez directement le JSON généré dans{" "}
              <code>⇄ IMPORTER / EXPORTER UN PACK (.JSON / COPIER LE CODE)</code> !
            </p>

            {/* Prompt 1 : Pack 3D */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-mono text-xs font-bold text-brand-black uppercase">
                  1. Prompt IA — Générer un Pack de Scènes 3D (`Anarchy3DPack` JSON)
                </h3>
                <Button
                  type="button"
                  variant="comic"
                  size="sm"
                  onClick={() => void copyText("p1", AI_SCENE_PACK_PROMPT)}
                >
                  {copiedId === "p1" ? "✅ PROMPT 3D COPIÉ !" : "📋 COPIER LE PROMPT IA"}
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

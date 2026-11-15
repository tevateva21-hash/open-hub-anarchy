"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { AvatarBD } from "@/components/ui/AvatarBD";
import { Button } from "@/components/ui/Button";
import { useAudioPlayer } from "@/components/audio/AudioPlayerContext";
import {
  BLOG_POSTS,
  FORUM_THREADS,
  SAMPLE_TRACKS,
  VST_PLUGINS,
  pluginToAudioTrack,
  sampleToAudioTrack,
  type VstCategory,
  type VstPlugin,
} from "@/lib/openhub-data";

const COLOR_TOKENS = [
  {
    name: "brand-white",
    hex: "#FFFFFF",
    role: "Surface clinique principale & cartes",
    swatchClass: "bg-brand-white border border-neutral-200",
  },
  {
    name: "brand-pearl",
    hex: "#F5F5F5",
    role: "Châssis DAW & arrière-plan global",
    swatchClass: "bg-brand-pearl border border-neutral-300",
  },
  {
    name: "brand-red",
    hex: "#FF1B24",
    role: "Accent Rouge Cinéma, REC & verre 3D gauche",
    swatchClass: "bg-brand-red border border-brand-red",
  },
  {
    name: "brand-charcoal",
    hex: "#222226",
    role: "Typographie technique & contrôles secondaires",
    swatchClass: "bg-brand-charcoal border border-brand-charcoal",
  },
  {
    name: "brand-black",
    hex: "#000000",
    role: "Encrage BD épais (border-4) & contraste fort",
    swatchClass: "bg-brand-black border border-brand-black",
  },
];

type CategoryFilter = "ALL" | VstCategory;
type FormatFilter = "ALL" | "VST3" | "CLAP" | "AU";
type OsFilter = "ALL" | "macOS" | "Windows" | "Linux";
type SortMode = "DEFAULT" | "DOWNLOADS" | "LATENCY" | "BPM";

const CATEGORY_OPTIONS: CategoryFilter[] = [
  "ALL",
  "SATURATION",
  "DYNAMICS",
  "SYNTH",
  "REVERB",
  "VIDEO_FX",
  "UTILITY",
];

function parseLatencyMs(val: string): number {
  const num = parseFloat(val);
  return Number.isNaN(num) ? 99 : num;
}

/**
 * Page d'accueil — Open Hub (by Anarchy) Milestone M2.
 * Catalogue VST3/CLAP/AU filtrable, Passerelle Visual Design V2 (19 faders),
 * Aperçu Écosystème (Samples / Forum / Blog) & Design System Clinique + BD 3D.
 */
export default function HomePage() {
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudioPlayer();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("ALL");
  const [selectedFormat, setSelectedFormat] = useState<FormatFilter>("ALL");
  const [selectedOs, setSelectedOs] = useState<OsFilter>("ALL");
  const [sortMode, setSortMode] = useState<SortMode>("DEFAULT");
  const [comicMode, setComicMode] = useState<boolean>(false);

  const filteredPlugins = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = VST_PLUGINS.filter((plugin: VstPlugin) => {
      if (selectedCategory !== "ALL" && plugin.category !== selectedCategory) {
        return false;
      }
      if (
        selectedFormat !== "ALL" &&
        !plugin.formats.includes(selectedFormat)
      ) {
        return false;
      }
      if (selectedOs !== "ALL" && !plugin.os.includes(selectedOs)) {
        return false;
      }
      if (q) {
        const haystack = `${plugin.id} ${plugin.code} ${plugin.name} ${plugin.category} ${plugin.author} ${plugin.description}`.toLowerCase();
        if (!haystack.includes(q)) {
          return false;
        }
      }
      return true;
    });

    if (sortMode === "DOWNLOADS") {
      return [...list].sort((a, b) => b.downloadsCount - a.downloadsCount);
    }
    if (sortMode === "LATENCY") {
      return [...list].sort(
        (a, b) =>
          parseLatencyMs(a.metrics.latency) - parseLatencyMs(b.metrics.latency)
      );
    }
    if (sortMode === "BPM") {
      return [...list].sort((a, b) => b.audioProfile.bpm - a.audioProfile.bpm);
    }
    return list;
  }, [
    searchQuery,
    selectedCategory,
    selectedFormat,
    selectedOs,
    sortMode,
  ]);

  const resetVstFilters = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setSelectedFormat("ALL");
    setSelectedOs("ALL");
    setSortMode("DEFAULT");
  };

  const scrollToSection = (sectionId: string) => {
    if (typeof document === "undefined") return;
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const featuredSamples = SAMPLE_TRACKS.slice(0, 3);
  const pinnedThreads = FORUM_THREADS.slice(0, 2);
  const featuredPost = BLOG_POSTS[0];

  return (
    <div className="space-y-10 pb-4 min-w-0">
      {/* 1. Bannière Hero Clinique + 3D BD */}
      <section aria-labelledby="hero-heading" className="min-w-0">
        <Card
          moduleTitle="SYS_INIT // OPEN_HUB_V2.4"
          moduleMeta="48.0 kHz // 24-BIT · TLS 1.3"
          activeIndicator
          className={comicMode ? "border-2 border-black shadow-comic" : ""}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 min-w-0">
            <div className="space-y-4 max-w-2xl min-w-0">
              <div className="inline-flex flex-wrap items-center gap-2 px-2.5 py-1 rounded bg-brand-pearl border border-neutral-200 font-mono text-xs text-brand-charcoal">
                <span className="w-2 h-2 rounded-full bg-brand-red shrink-0" />
                <span>OPEN-SOURCE AUDIO &amp; VISUAL ECOSYSTEM</span>
              </div>

              <h1
                id="hero-heading"
                className="text-2xl sm:text-4xl font-bold tracking-tight text-brand-black leading-tight"
              >
                Précision chirurgicale d&apos;un DAW.{" "}
                <span className="underline decoration-brand-red decoration-4 underline-offset-4">
                  Énergie brute d&apos;une BD 3D.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-brand-charcoal/85 leading-relaxed">
                Bienvenue sur{" "}
                <strong className="font-semibold text-brand-black">
                  Open Hub (by Anarchy)
                </strong>
                . Explorez 6 plugins open-source{" "}
                <span className="font-mono text-xs font-bold text-brand-black">
                  VST3 / CLAP / AU
                </span>
                , des samples 48.0 kHz / 24-BIT libres de droits, le studio{" "}
                <span className="font-mono text-xs font-bold text-brand-red">
                  Anarchy Visual Design V2
                </span>{" "}
                à 19 faders, le forum imageboard et la documentation DSP.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button
                  id="btn-explore-vst"
                  variant="primary"
                  size="lg"
                  onClick={() => scrollToSection("vst-preview")}
                  className="min-h-[44px]"
                >
                  EXPLORER LES MODULES VST
                </Button>
                <Button
                  id="btn-inspect-ds"
                  variant="clinical"
                  size="lg"
                  onClick={() => scrollToSection("design-system")}
                  className="min-h-[44px]"
                >
                  INSPECTER LE DESIGN SYSTEM
                </Button>
                <Button
                  id="btn-comic-mode"
                  variant="comic"
                  size="md"
                  aria-pressed={comicMode}
                  onClick={() => setComicMode((prev) => !prev)}
                  className={[
                    "min-h-[44px]",
                    comicMode ? "ring-2 ring-brand-red" : "",
                  ].join(" ")}
                >
                  {comicMode
                    ? "ANAGLYPH_SPEC // 3D ON"
                    : "ANAGLYPH_SPEC // 3D"}
                </Button>
              </div>
            </div>

            {/* Panneau d'illustration BD / Spectateurs 3D responsive (sans min-w-[270px]) */}
            <div className="bg-brand-pearl border-2 border-black rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center gap-4 w-full lg:w-auto min-w-0 shadow-comic-sm shrink-0">
              <div className="flex flex-wrap items-center justify-center -space-x-2">
                <AvatarBD
                  name="Spec Alpha"
                  expression="spectateur-a"
                  size="lg"
                  badgeText="VST3"
                  anaglyphRing={comicMode || isPlaying}
                  audioReactive={isPlaying}
                />
                <AvatarBD
                  name="Spec Beta"
                  expression="spectateur-b"
                  size="xl"
                  badgeText="3D"
                  anaglyphRing={comicMode || isPlaying}
                  audioReactive={isPlaying}
                />
                <AvatarBD
                  name="Spec Gamma"
                  expression="glitch"
                  size="lg"
                  badgeText="WAV"
                  anaglyphRing={comicMode || isPlaying}
                  audioReactive={isPlaying}
                />
              </div>
              <div className="text-center space-y-1 min-w-0">
                <p className="font-mono text-xs font-bold uppercase tracking-wider text-brand-black">
                  {"CREW ANARCHY // SPECTATEURS 3D"}
                </p>
                <p className="font-mono text-[11px] text-neutral-600">
                  6 VST3/CLAP · 6 WAV 48.0 kHz · 19 FADERS
                </p>
                {currentTrack?.sourceType === "VST_DEMO" && (
                  <p className="font-mono text-[10px] font-bold text-brand-red uppercase">
                    {`ACTIVE VST_DEMO: ${currentTrack.title}`}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* 2. Catalogue VST3 / CLAP / AU Filtrable 3 Colonnes (6 Plugins) */}
      <section
        id="vst-preview"
        aria-labelledby="vst-heading"
        className="space-y-4 min-w-0"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="vst-heading"
            className="font-mono text-sm font-bold uppercase tracking-wider text-brand-black flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-brand-red shrink-0" />
            {"01 // CATALOGUE PLUGINS VST3 · CLAP · AU (OPEN-SOURCE)"}
          </h2>
          <span className="font-mono text-xs text-neutral-500">
            {`${filteredPlugins.length} / ${VST_PLUGINS.length} MODULES · 48.0 kHz`}
          </span>
        </div>

        {/* Barre de recherche & filtres */}
        <div className="bg-brand-white border border-neutral-200/90 rounded-xl p-3.5 sm:p-4 shadow-clinical space-y-3 min-w-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 min-w-0">
              <label htmlFor="vst-search-input" className="sr-only">
                Rechercher un plugin VST3, CLAP ou AU
              </label>
              <input
                id="vst-search-input"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un plugin (ex: ANAGLYPH, anr-vst-01, REVERB, Koma_3D)..."
                className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-neutral-200 bg-brand-pearl font-mono text-xs text-brand-black placeholder:text-neutral-400 focus:outline-none focus:border-brand-red"
              />
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              <div className="min-w-0 flex-1 sm:flex-none">
                <label htmlFor="vst-format-filter" className="sr-only">
                  Filtrer par format
                </label>
                <select
                  id="vst-format-filter"
                  value={selectedFormat}
                  onChange={(e) =>
                    setSelectedFormat(e.target.value as FormatFilter)
                  }
                  className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-neutral-200 bg-brand-pearl font-mono text-xs font-bold text-brand-charcoal focus:outline-none focus:border-brand-red"
                >
                  <option value="ALL">FORMAT: ALL</option>
                  <option value="VST3">VST3</option>
                  <option value="CLAP">CLAP</option>
                  <option value="AU">AU</option>
                </select>
              </div>

              <div className="min-w-0 flex-1 sm:flex-none">
                <label htmlFor="vst-os-filter" className="sr-only">
                  Filtrer par système d&apos;exploitation
                </label>
                <select
                  id="vst-os-filter"
                  value={selectedOs}
                  onChange={(e) => setSelectedOs(e.target.value as OsFilter)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-neutral-200 bg-brand-pearl font-mono text-xs font-bold text-brand-charcoal focus:outline-none focus:border-brand-red"
                >
                  <option value="ALL">OS: ALL</option>
                  <option value="macOS">macOS</option>
                  <option value="Windows">Windows</option>
                  <option value="Linux">Linux</option>
                </select>
              </div>

              <div className="min-w-0 flex-1 sm:flex-none">
                <label htmlFor="vst-sort-select" className="sr-only">
                  Trier les plugins
                </label>
                <select
                  id="vst-sort-select"
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as SortMode)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-neutral-200 bg-brand-pearl font-mono text-xs font-bold text-brand-charcoal focus:outline-none focus:border-brand-red"
                >
                  <option value="DEFAULT">TRI: RACK</option>
                  <option value="DOWNLOADS">TÉLÉCHARGEMENTS</option>
                  <option value="LATENCY">LATENCE MIN</option>
                  <option value="BPM">TEMPO BPM</option>
                </select>
              </div>
            </div>
          </div>

          {/* Catégories VST */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-neutral-100">
            {CATEGORY_OPTIONS.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedCategory(cat)}
                  className={[
                    "min-h-[38px] px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold uppercase border transition-colors",
                    active
                      ? "bg-brand-red text-brand-white border-brand-red"
                      : "bg-brand-pearl text-brand-charcoal border-neutral-200 hover:border-black",
                  ].join(" ")}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Empty State ou Grille 3 colonnes */}
        {filteredPlugins.length === 0 ? (
          <Card
            moduleTitle="VST_SEARCH // 0_MATCH"
            moduleMeta="EMPTY_RACK"
          >
            <div className="flex flex-col items-center text-center py-8 space-y-4">
              <AvatarBD
                name="Zero VST Match"
                expression="shocked"
                size="lg"
                badgeText="0 VST"
              />
              <div className="space-y-1">
                <h3 className="font-mono text-base font-bold text-brand-black">
                  Aucun module VST trouvé pour ces critères
                </h3>
                <p className="text-sm text-neutral-600">
                  Effacez la recherche ou réinitialisez la catégorie sur ALL
                  pour afficher les 6 plugins Anarchy.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={resetVstFilters}
                className="min-h-[44px]"
              >
                RÉINITIALISER LE CATALOGUE
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-0">
            {filteredPlugins.map((plugin) => {
              const isThisTrack = currentTrack?.id === plugin.id;
              const isThisPlaying = isThisTrack && isPlaying;
              return (
                <Card
                  key={plugin.id}
                  moduleTitle={`${plugin.code} // ${plugin.formats.join("·")}`}
                  moduleMeta={plugin.version}
                  activeIndicator={isThisTrack || plugin.id === "anr-vst-01"}
                  interactive
                  className={[
                    "flex flex-col justify-between min-w-0",
                    comicMode ? "border-2 border-black shadow-comic" : "",
                  ].join(" ")}
                >
                  <div className="space-y-4 min-w-0">
                    <div className="flex items-start justify-between gap-3 min-w-0">
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-brand-pearl border border-neutral-200 font-mono text-[10px] font-bold uppercase text-brand-charcoal">
                          <span>{plugin.category}</span>
                          <span className="text-neutral-400">•</span>
                          <span className="text-brand-red">
                            {`${plugin.audioProfile.bpm} BPM`}
                          </span>
                        </div>
                        <h3 className="font-mono text-base sm:text-lg font-bold text-brand-black tracking-tight break-words">
                          {plugin.name}
                        </h3>
                        <p className="text-sm text-neutral-600 leading-relaxed line-clamp-3">
                          {plugin.description}
                        </p>
                      </div>

                      <AvatarBD
                        name={plugin.author}
                        expression={plugin.avatarExpression}
                        size="md"
                        badgeText={plugin.authorBadge}
                        anaglyphRing={comicMode || isThisPlaying}
                        audioReactive={isThisPlaying}
                      />
                    </div>

                    {/* Métriques techniques DAW (2x2 pour confort 375px / 768px / 1440px) */}
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-100">
                      <div className="bg-brand-pearl/70 rounded-lg px-2.5 py-2 border border-neutral-200/60 min-w-0">
                        <div className="font-mono text-[10px] text-neutral-500 uppercase">
                          OVERSAMPLING
                        </div>
                        <div className="font-mono text-xs font-bold text-brand-black mt-0.5 truncate">
                          {plugin.metrics.oversampling}
                        </div>
                      </div>
                      <div className="bg-brand-pearl/70 rounded-lg px-2.5 py-2 border border-neutral-200/60 min-w-0">
                        <div className="font-mono text-[10px] text-neutral-500 uppercase">
                          LATENCY
                        </div>
                        <div className="font-mono text-xs font-bold text-brand-black mt-0.5 truncate">
                          {plugin.metrics.latency}
                        </div>
                      </div>
                      <div className="bg-brand-pearl/70 rounded-lg px-2.5 py-2 border border-neutral-200/60 min-w-0">
                        <div className="font-mono text-[10px] text-neutral-500 uppercase">
                          CPU_LOAD
                        </div>
                        <div className="font-mono text-xs font-bold text-brand-black mt-0.5 truncate">
                          {plugin.metrics.cpuLoad}
                        </div>
                      </div>
                      <div className="bg-brand-pearl/70 rounded-lg px-2.5 py-2 border border-neutral-200/60 min-w-0">
                        <div className="font-mono text-[10px] text-neutral-500 uppercase">
                          LICENSE
                        </div>
                        <div className="font-mono text-xs font-bold text-brand-red mt-0.5 truncate">
                          {plugin.metrics.license}
                        </div>
                      </div>
                    </div>

                    {/* OS & Downloads */}
                    <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-neutral-500">
                      <span className="truncate">
                        {plugin.os.join(" · ")}
                      </span>
                      <span className="font-bold text-brand-charcoal">
                        {`${plugin.downloadsCount.toLocaleString("fr-FR")} DL • ${
                          plugin.fileSize
                        }`}
                      </span>
                    </div>

                    {/* Footer d'actions sans imbrication button-in-Link */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-neutral-100">
                      <Button
                        id={`btn-audio-preview-${plugin.id}`}
                        variant={isThisPlaying ? "comic" : "clinical"}
                        size="sm"
                        onClick={() =>
                          isThisTrack
                            ? togglePlay()
                            : playTrack(pluginToAudioTrack(plugin))
                        }
                        className="min-h-[40px]"
                      >
                        {isThisPlaying ? "❚❚ SIGNAL_ACTIVE" : "▶ TEST_SIGNAL"}
                      </Button>

                      <Link
                        id={`btn-download-${plugin.id}`}
                        href={`/vst/${plugin.id}`}
                        className="inline-flex items-center justify-center gap-2 min-h-[40px] px-3.5 py-1.5 rounded-lg font-mono text-xs font-medium tracking-wider uppercase bg-brand-red text-brand-white border border-brand-red shadow-clinical hover:bg-[#e0141c] transition-colors"
                      >
                        GET_VST3 →
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Passerelle Découplée vers Anarchy Visual Design Studio V2 */}
      <section
        id="visual-design-gateway"
        aria-labelledby="visual-gateway-heading"
        className="min-w-0"
      >
        <Card
          moduleTitle="STUDIO_V2 // VISUAL_DESIGN"
          moduleMeta="19 FADERS"
          activeIndicator
          className="border-2 border-black shadow-comic min-w-0"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center min-w-0">
            {/* Aperçu visuel léger purement CSS/SVG (zéro import visual-engine) */}
            <div className="lg:col-span-5 bg-[#08090c] border-2 border-black rounded-xl p-4 shadow-comic-sm space-y-3 min-w-0">
              <div className="flex items-center justify-between gap-2 font-mono text-[10px]">
                <span className="text-[#00E5FF] font-bold uppercase">
                  SCENE 05 // TECHNO THERAPY
                </span>
                <span className="text-brand-red font-bold">320×180 → 720p</span>
              </div>

              <div className="relative aspect-video rounded-lg border border-white/15 bg-gradient-to-br from-[#121218] via-[#08090c] to-[#1a090c] overflow-hidden flex items-center justify-center p-3">
                <svg
                  viewBox="0 0 320 180"
                  className="w-full h-full"
                  role="img"
                  aria-label="Aperçu synthétiseur visuel Anarchy Visual Design V2"
                >
                  <line
                    x1="0"
                    y1="90"
                    x2="320"
                    y2="90"
                    stroke="#FFFFFF"
                    strokeOpacity="0.12"
                  />
                  <line
                    x1="160"
                    y1="0"
                    x2="160"
                    y2="180"
                    stroke="#FFFFFF"
                    strokeOpacity="0.12"
                  />
                  <polygon
                    points="154,28 214,60 214,120 154,152 94,120 94,60"
                    fill="none"
                    stroke="#FF1B24"
                    strokeWidth="2.5"
                  />
                  <polygon
                    points="166,28 226,60 226,120 166,152 106,120 106,60"
                    fill="none"
                    stroke="#00E5FF"
                    strokeWidth="2.5"
                  />
                  <polyline
                    points="16,96 68,96 86,52 104,132 128,74 152,110 176,42 204,138 228,82 254,96 304,96"
                    fill="none"
                    stroke="#FF1B24"
                    strokeWidth="2.5"
                  />
                </svg>

                <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-brand-white/95 border-2 border-black rounded-lg px-2 py-1 shadow-comic-sm">
                  <AvatarBD
                    name="Visual Engine FX"
                    expression="glitch"
                    size="sm"
                    badgeText="FX"
                    anaglyphRing
                    audioReactive={isPlaying}
                  />
                  <span className="font-mono text-[10px] font-bold text-brand-black">
                    FFT 24kHz · BAYER 4×4
                  </span>
                </div>
              </div>
            </div>

            {/* Spécifications vérifiées & CTA */}
            <div className="lg:col-span-7 space-y-4 min-w-0">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-brand-pearl border border-neutral-200 font-mono text-[11px] font-bold text-brand-red">
                <span>SYNTHÉTISEUR VISUEL TEMPS-RÉEL ISOLÉ</span>
              </div>

              <h2
                id="visual-gateway-heading"
                className="text-xl sm:text-3xl font-bold tracking-tight text-brand-black"
              >
                Anarchy Visual Design Studio V2
              </h2>

              <p className="text-sm text-brand-charcoal/85 leading-relaxed">
                Pilotez des visuels 16-bit &amp; Low-Poly PS1 synchronisés au
                lecteur Open Hub ou sur vos propres MP3/WAV sans aucun envoi
                serveur.
              </p>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs text-brand-charcoal">
                <li className="bg-brand-pearl rounded-lg px-3 py-2 border border-neutral-200">
                  <strong className="text-brand-black">19 ConsoleFaders</strong>{" "}
                  répartis en 3 banques (Audio · Retro/FX · Caméra)
                </li>
                <li className="bg-brand-pearl rounded-lg px-3 py-2 border border-neutral-200">
                  <strong className="text-brand-black">5 Scènes</strong> dont{" "}
                  <span className="text-brand-red font-bold">
                    Techno Therapy
                  </span>{" "}
                  &amp; 7 Palettes + Morphing
                </li>
                <li className="bg-brand-pearl rounded-lg px-3 py-2 border border-neutral-200">
                  <strong className="text-brand-black">Worker FFT 24 kHz</strong>{" "}
                  + cache local IndexedDB{" "}
                  <code className="text-[10px]">anarchy-analysis</code>
                </li>
                <li className="bg-brand-pearl rounded-lg px-3 py-2 border border-neutral-200">
                  <strong className="text-brand-black">Studio M4 / M6</strong> :
                  Locks, Mulberry32, Undo/Redo &amp; Timeline
                </li>
              </ul>

              <div className="pt-1 flex flex-wrap items-center gap-3">
                <Link
                  href="/anarchy-visual-design"
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg font-mono text-xs sm:text-sm font-bold tracking-wider uppercase bg-brand-red text-brand-white border border-brand-red shadow-clinical hover:bg-[#e0141c] transition-colors"
                >
                  OUVRIR VISUAL DESIGN STUDIO →
                </Link>
                <Button
                  variant="comic"
                  size="md"
                  onClick={() => playTrack(pluginToAudioTrack(VST_PLUGINS[2]))}
                  className="min-h-[44px]"
                >
                  ▶ TEST AUDIO SYNC (128 BPM)
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* 4. Aperçu Écosystème Hub : Samples / Forum / Blog */}
      <section aria-labelledby="hub-preview-heading" className="space-y-4 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="hub-preview-heading"
            className="font-mono text-sm font-bold uppercase tracking-wider text-brand-black flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-brand-red shrink-0" />
            {"02 // ÉCOSYSTÈME OPEN HUB : SAMPLES · FORUM · DOCS DSP"}
          </h2>
          <span className="font-mono text-xs text-neutral-500">
            MODULES COMMUNAUTAIRES
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-w-0">
          {/* Card 1: Samples Hub */}
          <Card
            moduleTitle="02 // SAMPLES_HUB"
            moduleMeta={`${SAMPLE_TRACKS.length} WAV`}
            activeIndicator
            className="flex flex-col justify-between min-w-0"
          >
            <div className="space-y-3 min-w-0">
              <p className="text-xs sm:text-sm text-neutral-600">
                Stems libres 48.0 kHz / 24-BIT sous licences CC0 &amp; CC-BY
                avec synthèse PCM téléchargeable.
              </p>
              <ul className="space-y-2">
                {featuredSamples.map((sample) => {
                  const isActive = currentTrack?.id === sample.id && isPlaying;
                  return (
                    <li
                      key={sample.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-brand-pearl border border-neutral-200/80 min-w-0"
                    >
                      <div className="min-w-0">
                        <div className="font-mono text-xs font-bold text-brand-black truncate">
                          {sample.title}
                        </div>
                        <div className="font-mono text-[10px] text-neutral-500">
                          {`${sample.bpm} BPM • ${sample.license}`}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          isActive
                            ? togglePlay()
                            : playTrack(sampleToAudioTrack(sample))
                        }
                        aria-label={`Écouter ${sample.title}`}
                        className="min-w-[38px] min-h-[38px] px-2 rounded border border-neutral-300 bg-brand-white font-mono text-xs font-bold text-brand-red hover:border-brand-red shrink-0"
                      >
                        {isActive ? "❚❚" : "▶"}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <Link
                href="/samples"
                className="inline-flex w-full min-h-[42px] items-center justify-center rounded-lg px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider bg-brand-pearl text-brand-black border border-neutral-200 hover:border-brand-red hover:text-brand-red transition-colors"
              >
                EXPLORER LES SAMPLES →
              </Link>
            </div>
          </Card>

          {/* Card 2: Forum Imageboard */}
          <Card
            moduleTitle="04 // FORUM_BOARD"
            moduleMeta={`${FORUM_THREADS.length} THREADS`}
            className="flex flex-col justify-between min-w-0"
          >
            <div className="space-y-3 min-w-0">
              <p className="text-xs sm:text-sm text-neutral-600">
                Imageboard technique modernisé : retours DSP, releases CLAP/VST3
                et démos audio attachées.
              </p>
              <div className="space-y-2">
                {pinnedThreads.map((thread) => (
                  <div
                    key={thread.id}
                    className="p-2.5 rounded-lg bg-brand-pearl border border-neutral-200/80 flex items-start gap-2.5 min-w-0"
                  >
                    <AvatarBD
                      name={thread.author}
                      expression={thread.avatarExpression}
                      size="sm"
                      badgeText={thread.badge}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-[10px] text-brand-red font-bold">
                        {`[${thread.board}] • ${thread.replies.length} RÉPONSES`}
                      </div>
                      <div className="text-xs font-semibold text-brand-black line-clamp-2">
                        {thread.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/forum"
                className="inline-flex w-full min-h-[42px] items-center justify-center rounded-lg px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider bg-brand-pearl text-brand-black border border-neutral-200 hover:border-brand-red hover:text-brand-red transition-colors"
              >
                ACCÉDER AU FORUM →
              </Link>
            </div>
          </Card>

          {/* Card 3: Blog & Docs DSP */}
          <Card
            moduleTitle="05 // BLOG_&_DOCS"
            moduleMeta={`${BLOG_POSTS.length} ARTICLES`}
            className="flex flex-col justify-between min-w-0"
          >
            <div className="space-y-3 min-w-0">
              <div className="font-mono text-[10px] font-bold text-brand-red uppercase">
                {`${featuredPost.category} • ${featuredPost.readingTimeMin} MIN`}
              </div>
              <h3 className="text-sm font-bold text-brand-black leading-snug">
                {featuredPost.title}
              </h3>
              <blockquote className="border-l-4 border-brand-red pl-3 text-xs text-neutral-600 italic line-clamp-3">
                {featuredPost.quoteCallout}
              </blockquote>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="flex-1 inline-flex min-h-[42px] items-center justify-center rounded-lg px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider bg-brand-red text-brand-white hover:bg-[#e0141c] transition-colors"
                >
                  LIRE L&apos;ARTICLE
                </Link>
                <Link
                  href="/blog"
                  className="inline-flex min-h-[42px] items-center justify-center rounded-lg px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider bg-brand-pearl text-brand-black border border-neutral-200 hover:border-brand-red hover:text-brand-red transition-colors"
                >
                  TOUS →
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 5. Section Design System : Palette & Tokens */}
      <section
        id="design-system"
        aria-labelledby="ds-heading"
        className="space-y-4 min-w-0"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="ds-heading"
            className="font-mono text-sm font-bold uppercase tracking-wider text-brand-black flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-brand-red shrink-0" />
            {"03 // TOKENS TAILWIND & DIRECTION ARTISTIQUE"}
          </h2>
          <span className="font-mono text-xs text-neutral-500">
            tailwind.config.js • #FF1B24 / #00E5FF
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 min-w-0">
          {COLOR_TOKENS.map((token) => (
            <Card key={token.name} interactive className="p-4 min-w-0">
              <div
                className={`w-full h-14 rounded-lg mb-3 ${token.swatchClass}`}
              />
              <div className="space-y-1 min-w-0">
                <div className="flex items-center justify-between gap-2 font-mono text-xs">
                  <span className="font-bold text-brand-black truncate">
                    {token.name}
                  </span>
                  <span className="text-brand-red font-medium shrink-0">
                    {token.hex}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 leading-snug">
                  {token.role}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 6. Section Focus AvatarBD (responsive flex-wrap!) & Statut Production */}
      <section
        id="avatars-bd"
        aria-labelledby="milestone-heading"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0"
      >
        <Card
          moduleTitle="UI_COMPONENT // AVATAR_BD"
          moduleMeta="POP_ART_SPEC"
          className="lg:col-span-2 min-w-0"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6 min-w-0">
            <div className="flex flex-wrap items-end justify-center sm:justify-start gap-3 sm:gap-4 shrink-0">
              <AvatarBD name="Size SM" size="sm" expression="spectateur-a" />
              <AvatarBD
                name="Size MD"
                size="md"
                badgeText="MD"
                expression="dsp"
              />
              <AvatarBD
                name="Size LG"
                size="lg"
                badgeText="LG"
                expression="synth"
              />
              <AvatarBD
                name="Size XL"
                size="xl"
                badgeText="3D"
                expression="spectateur-b"
                anaglyphRing={comicMode}
              />
            </div>
            <div className="space-y-2 min-w-0">
              <h3
                id="milestone-heading"
                className="font-mono text-sm font-bold uppercase text-brand-black"
              >
                Spécification `AvatarBD.tsx`
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Chaque avatar applique la classe{" "}
                <code className="font-mono text-xs bg-brand-pearl px-1.5 py-0.5 rounded border border-neutral-200 text-brand-red">
                  border-4 border-black
                </code>{" "}
                associée à une ombre portée franche et une illustration
                vectorielle anaglyphe (Rouge Cinéma{" "}
                <code className="font-mono text-xs">#FF1B24</code> &amp; Cyan{" "}
                <code className="font-mono text-xs">#00E5FF</code>).
              </p>
            </div>
          </div>
        </Card>

        <Card
          id="architecture-status"
          moduleTitle="SYSTEM // RGPD & HTTPS"
          moduleMeta="TLS 1.3 · OK"
          activeIndicator
          className="min-w-0"
        >
          <div className="space-y-4">
            <ul className="space-y-2 font-mono text-xs">
              <li className="flex items-center justify-between text-brand-black">
                <span>[x] NEXT.JS 14 APP ROUTER</span>
                <span className="text-brand-red font-bold">OK</span>
              </li>
              <li className="flex items-center justify-between text-brand-black">
                <span>[x] 6 VST3 / CLAP + FIGMA RACK</span>
                <span className="text-brand-red font-bold">OK</span>
              </li>
              <li className="flex items-center justify-between text-brand-black">
                <span>[x] VISUAL DESIGN 19 FADERS</span>
                <span className="text-brand-red font-bold">OK</span>
              </li>
              <li className="flex items-center justify-between text-brand-black">
                <span>[x] HTTPS / HSTS / CSP HEADERS</span>
                <span className="text-brand-red font-bold">OK</span>
              </li>
              <li className="flex items-center justify-between text-brand-black">
                <span>[x] RGPD &amp; COOKIES CNIL</span>
                <span className="text-brand-red font-bold">OK</span>
              </li>
            </ul>

            <div className="pt-2 border-t border-neutral-100">
              <Link
                href="/legal"
                className="inline-flex w-full min-h-[42px] items-center justify-center rounded-lg px-3 py-2 font-mono text-xs font-medium uppercase tracking-wider bg-brand-pearl text-brand-black border border-neutral-200 hover:border-brand-red hover:text-brand-red transition-colors"
              >
                {"OUVRIR LE CENTRE RGPD & HTTPS →"}
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

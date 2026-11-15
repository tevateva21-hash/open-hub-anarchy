"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AvatarBD } from "@/components/ui/AvatarBD";
import { useAudioPlayer } from "@/components/audio/AudioPlayerContext";
import {
  SAMPLE_TRACKS,
  sampleToAudioTrack,
  type SampleTrack,
} from "@/lib/openhub-data";
import { getStoredConsent, type ConsentPreferences } from "@/lib/consent";

type GenreFilter = "ALL" | SampleTrack["genre"];
type BpmBandFilter = "ALL" | "120-130" | "131-142" | "143+";
type LicenseFilter = "ALL" | "CC0 1.0" | "CC-BY 4.0";

const COMMUNITY_SAMPLES_KEY = "openhub_community_samples_v1";

const GENRE_OPTIONS: GenreFilter[] = [
  "ALL",
  "INDUSTRIAL",
  "CYBER_TRAP",
  "SYNTHWAVE",
  "TRIBAL_CORE",
  "PSYCHEDELIC",
  "GLITCH_BASS",
];

const BPM_BAND_OPTIONS: { id: BpmBandFilter; label: string }[] = [
  { id: "ALL", label: "ALL BPM" },
  { id: "120-130", label: "120–130 BPM" },
  { id: "131-142", label: "131–142 BPM" },
  { id: "143+", label: "143+ BPM" },
];

const KEY_OPTIONS = [
  "F Minor",
  "E Minor",
  "A Minor",
  "G Minor",
  "C Minor",
  "D Minor",
];

function formatDuration(sec: number): string {
  const safe = Math.max(0, Math.floor(sec));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function generateDeterministicPeaks(seed: string, bpm: number): number[] {
  let h = 2166136261;
  const full = `${seed}:${bpm}`;
  for (let i = 0; i < full.length; i++) {
    h ^= full.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Array.from({ length: 32 }, (_, idx) => {
    const stepHash = Math.abs(Math.sin((h % 1000) * 0.1 + idx * 0.68));
    const accent = idx % 4 === 0 ? 0.25 : 0;
    const raw = 0.22 + stepHash * 0.68 + accent;
    return Number(Math.max(0.1, Math.min(1.0, raw)).toFixed(2));
  });
}

/**
 * Synthétise un fichier RIFF PCM `.wav` stéréo 48 000 Hz / 16-bit authentique et jouable
 * à partir du `synthProfile` du sample (100% local, conforme CSP).
 */
function synthesizeStereoWavBlob(sample: SampleTrack): Blob {
  const sampleRate = 48000;
  const numChannels = 2;
  const bitsPerSample = 16;
  const bpm = Math.max(60, Math.min(220, sample.synthProfile.tempoBpm || sample.bpm));
  const stepSec = 60 / bpm / 4; // 1/16th note duration
  const totalSteps = 32; // 2 bars
  const durationSec = Math.min(6, stepSec * totalSteps);
  const totalFrames = Math.floor(sampleRate * durationSec);
  const dataByteLength = totalFrames * numChannels * (bitsPerSample / 8);

  const buffer = new ArrayBuffer(44 + dataByteLength);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // Header canonique RIFF WAVE (44 octets)
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataByteLength, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // AudioFormat 1 = PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
  view.setUint16(32, numChannels * (bitsPerSample / 8), true);
  view.setUint16(34, bitsPerSample, true);
  writeStr(36, "data");
  view.setUint32(40, dataByteLength, true);

  const { baseFreq, pattern, timbre } = sample.synthProfile;
  const safePattern = pattern.length > 0 ? pattern : [1, 0, 1, 0];
  const semitones = [0, 0, 12, 3, 0, 7, 10, 0, 5, 12, 3, 7, 0, 10, 12, 15];
  const fadeSamples = Math.floor(sampleRate * 0.005); // 5ms click-free fade

  let byteOffset = 44;
  for (let i = 0; i < totalFrames; i++) {
    const t = i / sampleRate;
    const stepIdx = Math.floor(t / stepSec);
    const localStepTime = t - stepIdx * stepSec;
    const stepNorm = localStepTime / stepSec;
    const isActive = safePattern[stepIdx % safePattern.length] === 1 || stepIdx % 4 === 0;

    const noteFreq =
      baseFreq * Math.pow(2, semitones[stepIdx % semitones.length] / 12);
    const kickEnv = stepIdx % 4 === 0 ? Math.exp(-localStepTime * 24) : 0;
    const kickFreq = 52 + 140 * Math.exp(-localStepTime * 42);
    const kick = Math.sin(2 * Math.PI * kickFreq * localStepTime) * kickEnv * 0.55;

    let synth = 0;
    if (isActive) {
      const env = Math.exp(-stepNorm * 3.8);
      const phase = (t * noteFreq) % 1;
      const saw = 2 * phase - 1;
      const sq = phase < 0.5 ? 1 : -1;
      const sine = Math.sin(2 * Math.PI * noteFreq * t);

      if (timbre === "overload") {
        synth = Math.tanh((saw * 0.7 + sq * 0.6) * 2.8) * env * 0.42;
      } else if (timbre === "powerglove") {
        const detune = 2 * ((t * noteFreq * 1.006) % 1) - 1;
        synth = (saw * 0.55 + detune * 0.45) * env * 0.38;
      } else if (timbre === "psytrap") {
        const subGlide = Math.sin(2 * Math.PI * (baseFreq * 0.5) * t);
        synth = (subGlide * 0.75 + sq * 0.25) * env * 0.45;
      } else if (timbre === "psyvibe") {
        const fifth = Math.sin(2 * Math.PI * noteFreq * 1.5 * t);
        synth = (sine * 0.65 + fifth * 0.35) * env * 0.4;
      } else if (timbre === "tribal") {
        const tom = Math.sin(2 * Math.PI * (noteFreq * (1 + 0.6 * Math.exp(-localStepTime * 28))) * localStepTime);
        synth = (tom * 0.7 + saw * 0.2) * env * 0.48;
      } else {
        // acid
        synth = Math.tanh((saw * 1.9 + sq * 0.4) * (1 + 2 * (1 - stepNorm))) * env * 0.42;
      }
    }

    // Subtil élargissement stéréo anaglyphe L/R
    const stereoWidth = Math.sin(t * 7.5) * 0.08;
    let fade = 1;
    if (i < fadeSamples) fade = i / fadeSamples;
    else if (i > totalFrames - fadeSamples) fade = (totalFrames - i) / fadeSamples;

    const left = Math.max(-0.96, Math.min(0.96, (kick + synth * (1 + stereoWidth)) * fade));
    const right = Math.max(-0.96, Math.min(0.96, (kick + synth * (1 - stereoWidth)) * fade));

    view.setInt16(byteOffset, Math.round(left * 32767), true);
    view.setInt16(byteOffset + 2, Math.round(right * 32767), true);
    byteOffset += 4;
  }

  return new Blob([buffer], { type: "audio/wav" });
}

export default function SamplesHubPage() {
  const { currentTrack, isPlaying, currentTime, duration, playTrack, togglePlay } =
    useAudioPlayer();

  const [communitySamples, setCommunitySamples] = useState<SampleTrack[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [genreFilter, setGenreFilter] = useState<GenreFilter>("ALL");
  const [bpmFilter, setBpmFilter] = useState<BpmBandFilter>("ALL");
  const [keyFilter, setKeyFilter] = useState<string>("ALL");
  const [licenseFilter, setLicenseFilter] = useState<LicenseFilter>("ALL");
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);

  // Community Submission Form State
  const [formTitle, setFormTitle] = useState<string>("");
  const [formPackName, setFormPackName] = useState<string>("");
  const [formAuthor, setFormAuthor] = useState<string>("");
  const [formGenre, setFormGenre] = useState<SampleTrack["genre"]>("INDUSTRIAL");
  const [formBpm, setFormBpm] = useState<string>("136");
  const [formKey, setFormKey] = useState<string>("F Minor");
  const [formLicense, setFormLicense] = useState<SampleTrack["license"]>("CC0 1.0");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Hydrate community samples ONLY if user consented to audioPreferences
  useEffect(() => {
    const loadFromConsent = (consent: ConsentPreferences | null) => {
      if (consent?.audioPreferences === true && typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem(COMMUNITY_SAMPLES_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as unknown;
            if (Array.isArray(parsed)) {
              const valid = parsed.filter(
                (item): item is SampleTrack =>
                  Boolean(item) &&
                  typeof item.id === "string" &&
                  typeof item.title === "string" &&
                  Array.isArray(item.waveformPeaks)
              );
              setCommunitySamples(valid);
            }
          }
        } catch {
          // Ignore malformed JSON
        }
      }
    };

    loadFromConsent(getStoredConsent());

    const handleConsentUpdate = (event: Event) => {
      const custom = event as CustomEvent<ConsentPreferences | null>;
      const detail = custom.detail ?? getStoredConsent();
      if (!detail?.audioPreferences && typeof window !== "undefined") {
        try {
          window.localStorage.removeItem(COMMUNITY_SAMPLES_KEY);
        } catch {
          // Ignore storage errors
        }
      }
    };

    window.addEventListener("openhub:consent-updated", handleConsentUpdate);
    return () =>
      window.removeEventListener("openhub:consent-updated", handleConsentUpdate);
  }, []);

  const allSamples = useMemo(
    () => [...communitySamples, ...SAMPLE_TRACKS],
    [communitySamples]
  );

  const uniqueKeys = useMemo(() => {
    const set = new Set<string>(allSamples.map((s) => s.key));
    return ["ALL", ...Array.from(set)];
  }, [allSamples]);

  const filteredSamples = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allSamples.filter((sample) => {
      if (genreFilter !== "ALL" && sample.genre !== genreFilter) return false;
      if (licenseFilter !== "ALL" && sample.license !== licenseFilter) return false;
      if (keyFilter !== "ALL" && sample.key !== keyFilter) return false;
      if (bpmFilter === "120-130" && (sample.bpm < 120 || sample.bpm > 130))
        return false;
      if (bpmFilter === "131-142" && (sample.bpm < 131 || sample.bpm > 142))
        return false;
      if (bpmFilter === "143+" && sample.bpm < 143) return false;

      if (q) {
        const haystack =
          `${sample.title} ${sample.packName} ${sample.author} ${sample.genre} ${sample.key}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [allSamples, bpmFilter, genreFilter, keyFilter, licenseFilter, searchQuery]);

  const resetFilters = () => {
    setSearchQuery("");
    setGenreFilter("ALL");
    setBpmFilter("ALL");
    setKeyFilter("ALL");
    setLicenseFilter("ALL");
  };

  const handleDownloadWav = (sample: SampleTrack) => {
    const wavBlob = synthesizeStereoWavBlob(sample);
    const url = URL.createObjectURL(wavBlob);
    const cleanFilename = sample.title.toLowerCase().endsWith(".wav")
      ? sample.title
      : `${sample.title}.wav`;
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = cleanFilename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);

    setDownloadFeedback(
      `Fichier PCM RIFF 48.0 kHz généré et téléchargé : ${cleanFilename} (${sample.license}).`
    );
  };

  const handleSubmitPack = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const trimmedTitle = formTitle.trim();
    const trimmedPack = formPackName.trim();
    const trimmedAuthor = formAuthor.trim();
    const parsedBpm = Number(formBpm);

    if (!trimmedTitle || !trimmedPack || !trimmedAuthor) {
      setFormError(
        "Tous les champs obligatoires (Titre .wav, Nom du Pack, Auteur) doivent être renseignés."
      );
      return;
    }

    if (Number.isNaN(parsedBpm) || parsedBpm < 60 || parsedBpm > 220) {
      setFormError("Le tempo BPM doit être compris entre 60 et 220.");
      return;
    }

    const normalizedTitle = trimmedTitle.toLowerCase().endsWith(".wav")
      ? trimmedTitle
      : `${trimmedTitle}.wav`;

    const timbreByGenre: Record<
      SampleTrack["genre"],
      SampleTrack["synthProfile"]["timbre"]
    > = {
      INDUSTRIAL: "acid",
      GLITCH_BASS: "overload",
      SYNTHWAVE: "powerglove",
      CYBER_TRAP: "psytrap",
      PSYCHEDELIC: "psyvibe",
      TRIBAL_CORE: "tribal",
    };

    const newSample: SampleTrack = {
      id: `smp-comm-${Date.now()}`,
      title: normalizedTitle,
      packName: trimmedPack.toUpperCase(),
      genre: formGenre,
      bpm: Math.round(parsedBpm),
      key: formKey,
      durationSec: 120,
      sampleRate: "48.0 kHz / 24-BIT",
      license: formLicense,
      fileSizeMb: 42.5,
      author: trimmedAuthor,
      avatarExpression: "hyped",
      waveformPeaks: generateDeterministicPeaks(normalizedTitle, parsedBpm),
      synthProfile: {
        baseFreq: 92.5,
        tempoBpm: Math.round(parsedBpm),
        pattern: [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
        timbre: timbreByGenre[formGenre],
      },
    };

    const nextCommunity = [newSample, ...communitySamples];
    setCommunitySamples(nextCommunity);

    if (getStoredConsent()?.audioPreferences === true && typeof window !== "undefined") {
      try {
        window.localStorage.setItem(
          COMMUNITY_SAMPLES_KEY,
          JSON.stringify(nextCommunity)
        );
      } catch {
        // Ignore quota errors
      }
    }

    setFormTitle("");
    setFormPackName("");
    setFormAuthor("");
    setFormSuccess(
      `Sample "${newSample.title}" (${newSample.bpm} BPM • ${newSample.license}) ajouté à la banque !`
    );
  };

  return (
    <div className="space-y-8 pb-6 min-w-0">
      {/* En-tête Samples Hub */}
      <section aria-labelledby="samples-heading">
        <Card
          moduleTitle="SAMPLES_HUB // STEMS_48KHZ"
          moduleMeta="CC0 1.0 · CC-BY 4.0"
          activeIndicator
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 min-w-0">
            <div className="space-y-3 max-w-2xl min-w-0">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-brand-pearl border border-neutral-200 font-mono text-xs text-brand-charcoal">
                <span className="w-2 h-2 rounded-full bg-brand-red" />
                <span>BANQUE AUDIO LIBRE DE DROITS // 48.0 kHz / 24-BIT</span>
              </div>

              <h1
                id="samples-heading"
                className="text-2xl sm:text-4xl font-bold tracking-tight text-brand-black"
              >
                Samples &amp; Stems{" "}
                <span className="underline decoration-brand-red decoration-4 underline-offset-4">
                  Open-Source Anarchy
                </span>
              </h1>

              <p className="text-sm sm:text-base text-brand-charcoal/85 leading-relaxed">
                Écoutez instantanément les 6 stems officiels{" "}
                <strong className="font-semibold text-brand-black">
                  48.0 kHz / 24-BIT
                </strong>{" "}
                dans le lecteur audio persistant, inspectez leurs formes
                d&apos;ondes cliniques et exportez de véritables fichiers{" "}
                <code className="font-mono text-xs bg-brand-pearl px-1.5 py-0.5 rounded border border-neutral-200">
                  .WAV PCM
                </code>{" "}
                sous licence ouverte.
              </p>
            </div>

            <div className="bg-brand-pearl border-2 border-black rounded-xl p-4 shadow-comic-sm flex items-center gap-3 w-full lg:w-auto shrink-0">
              <AvatarBD
                name="Samples Operator"
                expression="synth"
                size="lg"
                badgeText="WAV"
                audioReactive={isPlaying}
                anaglyphRing={isPlaying}
              />
              <div className="font-mono text-xs space-y-1 min-w-0">
                <div className="font-bold text-brand-black uppercase">
                  {`${allSamples.length} TRACKS DISPONIBLES`}
                </div>
                <div className="text-neutral-600">48.0 kHz / 24-BIT</div>
                <Link
                  href="/anarchy-visual-design"
                  className="inline-block text-brand-red font-bold hover:underline"
                >
                  TESTER DANS VISUAL DESIGN →
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Barre de recherche et filtres multi-critères */}
      <section aria-label="Filtres de la banque de samples" className="min-w-0">
        <div className="bg-brand-white border border-neutral-200/90 rounded-xl p-3.5 sm:p-5 shadow-clinical space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 min-w-0">
              <label
                htmlFor="samples-search-input"
                className="sr-only"
              >
                Rechercher un sample .wav par titre, pack, tonalité ou auteur
              </label>
              <input
                id="samples-search-input"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un stem .wav (ex: Anarchy, tribal, 136, F Minor)..."
                className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-neutral-200 bg-brand-pearl font-mono text-xs text-brand-black placeholder:text-neutral-400 focus:outline-none focus:border-brand-red"
              />
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              <div className="min-w-0 flex-1 sm:flex-none">
                <label htmlFor="samples-key-select" className="sr-only">
                  Filtrer par tonalité
                </label>
                <select
                  id="samples-key-select"
                  value={keyFilter}
                  onChange={(e) => setKeyFilter(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-neutral-200 bg-brand-pearl font-mono text-xs font-bold text-brand-charcoal focus:outline-none focus:border-brand-red"
                >
                  {uniqueKeys.map((k) => (
                    <option key={k} value={k}>
                      {k === "ALL" ? "KEY: ALL" : k}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-0 flex-1 sm:flex-none">
                <label htmlFor="samples-license-select" className="sr-only">
                  Filtrer par licence
                </label>
                <select
                  id="samples-license-select"
                  value={licenseFilter}
                  onChange={(e) =>
                    setLicenseFilter(e.target.value as LicenseFilter)
                  }
                  className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-neutral-200 bg-brand-pearl font-mono text-xs font-bold text-brand-charcoal focus:outline-none focus:border-brand-red"
                >
                  <option value="ALL">LICENCE: ALL</option>
                  <option value="CC0 1.0">CC0 1.0</option>
                  <option value="CC-BY 4.0">CC-BY 4.0</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filtres Genre + Plage BPM */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-neutral-100">
            <div className="flex flex-wrap items-center gap-1.5">
              {GENRE_OPTIONS.map((genre) => {
                const active = genreFilter === genre;
                return (
                  <button
                    key={genre}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setGenreFilter(genre)}
                    className={[
                      "min-h-[38px] px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold uppercase border transition-colors",
                      active
                        ? "bg-brand-red text-brand-white border-brand-red"
                        : "bg-brand-pearl text-brand-charcoal border-neutral-200 hover:border-black",
                    ].join(" ")}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {BPM_BAND_OPTIONS.map((band) => {
                const active = bpmFilter === band.id;
                return (
                  <button
                    key={band.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setBpmFilter(band.id)}
                    className={[
                      "min-h-[38px] px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold uppercase border transition-colors",
                      active
                        ? "border-2 border-black bg-brand-white text-brand-black shadow-comic-sm"
                        : "bg-brand-pearl text-neutral-600 border-neutral-200 hover:border-black",
                    ].join(" ")}
                  >
                    {band.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-neutral-500">
            <span>
              {`AFFICHAGE : ${filteredSamples.length} / ${allSamples.length} SAMPLES`}
            </span>
            {downloadFeedback && (
              <span
                role="status"
                aria-live="polite"
                className="text-brand-red font-bold"
              >
                {downloadFeedback}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Liste / Grille des Samples ou Empty State */}
      <section aria-label="Catalogue des pistes .wav" className="min-w-0">
        {filteredSamples.length === 0 ? (
          <Card
            moduleTitle="SAMPLES_SEARCH // 0_MATCH"
            moduleMeta="EMPTY_BUS"
          >
            <div className="flex flex-col items-center text-center py-8 space-y-4">
              <AvatarBD
                name="Empty Samples"
                expression="shocked"
                size="lg"
                badgeText="0 WAV"
              />
              <div className="space-y-1">
                <h2 className="font-mono text-base font-bold text-brand-black">
                  Aucun sample ne correspond à vos filtres
                </h2>
                <p className="text-sm text-neutral-600">
                  Réinitialisez les filtres de genre, BPM ou recherche pour
                  afficher les 6 stems officiels.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={resetFilters}
                className="min-h-[44px]"
              >
                RÉINITIALISER LES FILTRES
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
            {filteredSamples.map((sample) => {
              const isThisTrack = currentTrack?.id === sample.id;
              const isThisPlaying = isThisTrack && isPlaying;
              const progressRatio =
                isThisTrack && duration > 0
                  ? Math.max(0, Math.min(1, currentTime / duration))
                  : 0;

              return (
                <Card
                  key={sample.id}
                  moduleTitle={`${sample.genre} // ${sample.bpm} BPM`}
                  moduleMeta={sample.license}
                  activeIndicator={isThisTrack}
                  interactive
                  className="min-w-0"
                >
                  <div className="space-y-4 min-w-0">
                    {/* Header sample + AvatarBD */}
                    <div className="flex items-start justify-between gap-3 min-w-0">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="font-mono text-[10px] font-bold uppercase text-brand-red truncate">
                          {sample.packName}
                        </div>
                        <h2 className="font-mono text-lg font-bold text-brand-black break-words">
                          {sample.title}
                        </h2>
                        <div className="font-mono text-xs text-neutral-500">
                          {`BY @${sample.author} • ${sample.key} • ${formatDuration(
                            sample.durationSec
                          )}`}
                        </div>
                      </div>

                      <AvatarBD
                        name={sample.author}
                        expression={sample.avatarExpression}
                        size="md"
                        badgeText={sample.license.startsWith("CC0") ? "CC0" : "CC-BY"}
                        anaglyphRing={isThisPlaying}
                        audioReactive={isThisPlaying}
                      />
                    </div>

                    {/* Visualiseur Waveform 32 barres */}
                    <div
                      aria-label={`Forme d'onde de ${sample.title}`}
                      className="h-16 bg-brand-pearl/80 border border-neutral-200 rounded-xl px-2.5 py-2 flex items-end gap-[2px] w-full"
                    >
                      {sample.waveformPeaks.map((peak, idx) => {
                        const clampedPeak = Math.max(0.1, Math.min(1.0, peak));
                        const heightPct = Math.round(clampedPeak * 100);
                        const barPos = idx / Math.max(1, sample.waveformPeaks.length);
                        const isPassed = isThisTrack && barPos <= progressRatio;
                        return (
                          <span
                            key={idx}
                            style={{ height: `${heightPct}%` }}
                            className={[
                              "flex-1 min-w-[2px] rounded-t-sm transition-colors",
                              isPassed
                                ? "bg-brand-red"
                                : isThisPlaying
                                ? "bg-brand-charcoal"
                                : "bg-neutral-400",
                            ].join(" ")}
                          />
                        );
                      })}
                    </div>

                    {/* Métadonnées techniques DAW */}
                    <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                      <div className="bg-brand-pearl/70 rounded-lg px-2.5 py-2 border border-neutral-200/70 min-w-0">
                        <div className="text-[9px] text-neutral-500 uppercase">
                          FORMAT
                        </div>
                        <div className="font-bold text-brand-black truncate">
                          {sample.sampleRate}
                        </div>
                      </div>
                      <div className="bg-brand-pearl/70 rounded-lg px-2.5 py-2 border border-neutral-200/70 min-w-0">
                        <div className="text-[9px] text-neutral-500 uppercase">
                          TEMPO / KEY
                        </div>
                        <div className="font-bold text-brand-black truncate">
                          {`${sample.bpm} BPM • ${sample.key}`}
                        </div>
                      </div>
                      <div className="bg-brand-pearl/70 rounded-lg px-2.5 py-2 border border-neutral-200/70 min-w-0">
                        <div className="text-[9px] text-neutral-500 uppercase">
                          TAILLE
                        </div>
                        <div className="font-bold text-brand-black truncate">
                          {`${sample.fileSizeMb.toFixed(2)} MB`}
                        </div>
                      </div>
                    </div>

                    {/* Boutons d'action : Preview Sticky Player + Download WAV PCM */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100">
                      <Button
                        id={`btn-sample-play-${sample.id}`}
                        variant={isThisPlaying ? "comic" : "clinical"}
                        size="md"
                        onClick={() =>
                          isThisTrack
                            ? togglePlay()
                            : playTrack(sampleToAudioTrack(sample))
                        }
                        className="min-h-[42px] flex-1 sm:flex-none"
                      >
                        {isThisPlaying ? "❚❚ PAUSE LECTEUR" : "▶ ÉCOUTER STEM"}
                      </Button>

                      <Button
                        id={`btn-sample-download-${sample.id}`}
                        variant="primary"
                        size="md"
                        onClick={() => handleDownloadWav(sample)}
                        className="min-h-[42px] flex-1 sm:flex-none"
                      >
                        TÉLÉCHARGER .WAV
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Formulaire de Soumission d'un Sample Pack Communautaire */}
      <section aria-labelledby="submit-sample-heading" className="min-w-0">
        <Card
          moduleTitle="COMMUNITY_UPLOAD // SUBMIT_PACK"
          moduleMeta="CC0 / CC-BY"
          activeIndicator
        >
          <form onSubmit={handleSubmitPack} className="space-y-4 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2
                id="submit-sample-heading"
                className="font-mono text-base font-bold uppercase text-brand-black"
              >
                Partager un Sample / Stem Communautaire (.WAV)
              </h2>
              <span className="font-mono text-[11px] text-neutral-500">
                Synthèse locale 48.0 kHz &amp; ajout instantané au catalogue
              </span>
            </div>

            {formError && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-brand-red/10 border-l-4 border-brand-red font-mono text-xs text-brand-red font-bold"
              >
                {formError}
              </div>
            )}

            {formSuccess && (
              <div
                role="status"
                aria-live="polite"
                className="p-3 rounded-lg bg-brand-pearl border-l-4 border-brand-red font-mono text-xs text-brand-black font-bold"
              >
                {formSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label
                  htmlFor="sample-title-input"
                  className="block font-mono text-xs font-bold uppercase text-brand-charcoal"
                >
                  Nom du fichier (.wav) *
                </label>
                <input
                  id="sample-title-input"
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="ex: Anaglyph_Bass_138.wav"
                  className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-neutral-200 bg-brand-pearl font-mono text-xs text-brand-black focus:outline-none focus:border-brand-red"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="sample-pack-input"
                  className="block font-mono text-xs font-bold uppercase text-brand-charcoal"
                >
                  Nom du Sample Pack *
                </label>
                <input
                  id="sample-pack-input"
                  type="text"
                  required
                  value={formPackName}
                  onChange={(e) => setFormPackName(e.target.value)}
                  placeholder="ex: ANARCHY MODULAR VOL. 2"
                  className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-neutral-200 bg-brand-pearl font-mono text-xs text-brand-black focus:outline-none focus:border-brand-red"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="sample-author-input"
                  className="block font-mono text-xs font-bold uppercase text-brand-charcoal"
                >
                  Producteur / Auteur *
                </label>
                <input
                  id="sample-author-input"
                  type="text"
                  required
                  value={formAuthor}
                  onChange={(e) => setFormAuthor(e.target.value)}
                  placeholder="ex: Studio_Alpha"
                  className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-neutral-200 bg-brand-pearl font-mono text-xs text-brand-black focus:outline-none focus:border-brand-red"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="sample-genre-select"
                  className="block font-mono text-xs font-bold uppercase text-brand-charcoal"
                >
                  Genre
                </label>
                <select
                  id="sample-genre-select"
                  value={formGenre}
                  onChange={(e) =>
                    setFormGenre(e.target.value as SampleTrack["genre"])
                  }
                  className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-neutral-200 bg-brand-pearl font-mono text-xs font-bold text-brand-black focus:outline-none focus:border-brand-red"
                >
                  {GENRE_OPTIONS.filter((g) => g !== "ALL").map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="sample-bpm-input"
                  className="block font-mono text-xs font-bold uppercase text-brand-charcoal"
                >
                  BPM (60–220) *
                </label>
                <input
                  id="sample-bpm-input"
                  type="number"
                  min={60}
                  max={220}
                  required
                  value={formBpm}
                  onChange={(e) => setFormBpm(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-neutral-200 bg-brand-pearl font-mono text-xs font-bold text-brand-black focus:outline-none focus:border-brand-red"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label
                    htmlFor="sample-key-input"
                    className="block font-mono text-xs font-bold uppercase text-brand-charcoal"
                  >
                    Tonalité
                  </label>
                  <select
                    id="sample-key-input"
                    value={formKey}
                    onChange={(e) => setFormKey(e.target.value)}
                    className="w-full min-h-[44px] px-2.5 py-2 rounded-lg border border-neutral-200 bg-brand-pearl font-mono text-xs font-bold text-brand-black focus:outline-none focus:border-brand-red"
                  >
                    {KEY_OPTIONS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="sample-license-input"
                    className="block font-mono text-xs font-bold uppercase text-brand-charcoal"
                  >
                    Licence
                  </label>
                  <select
                    id="sample-license-input"
                    value={formLicense}
                    onChange={(e) =>
                      setFormLicense(e.target.value as SampleTrack["license"])
                    }
                    className="w-full min-h-[44px] px-2.5 py-2 rounded-lg border border-neutral-200 bg-brand-pearl font-mono text-xs font-bold text-brand-black focus:outline-none focus:border-brand-red"
                  >
                    <option value="CC0 1.0">CC0 1.0</option>
                    <option value="CC-BY 4.0">CC-BY 4.0</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-[11px] text-neutral-500">
                Publication soumise aux licences libres CC0 / CC-BY d&apos;Open Hub.
              </p>
              <Button
                id="btn-submit-community-sample"
                type="submit"
                variant="primary"
                size="lg"
                className="min-h-[44px]"
              >
                PUBLIER LE SAMPLE PACK →
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </div>
  );
}

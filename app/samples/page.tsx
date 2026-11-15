"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AvatarBD } from "@/components/ui/AvatarBD";
import { useAudioPlayer } from "@/components/audio/AudioPlayerContext";
import { useAuth } from "@/components/auth/AuthContext";
import {
  SAMPLE_TRACKS,
  sampleToAudioTrack,
  type SampleTrack,
} from "@/lib/openhub-data";

type SamplesDrawer = "ANARCHY_OFFICIAL" | "COMMUNITY_SAMPLES";

/**
 * Page `/samples` — Avec 2 tiroirs (Samples Anarchy Officiels & Samples Communauté)
 * et attribution automatique au pseudo connecté (`useAuth`).
 */
export default function SamplesPage() {
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();
  const { user, openAuthModal } = useAuth();

  const [activeDrawer, setActiveDrawer] =
    useState<SamplesDrawer>("COMMUNITY_SAMPLES");
  const [samples, setSamples] = useState<SampleTrack[]>(SAMPLE_TRACKS);
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [packName, setPackName] = useState("");
  const [bpm, setBpm] = useState(130);
  const [musicalKey, setMusicalKey] = useState("C Minor");
  const [genre, setGenre] = useState<SampleTrack["genre"]>("INDUSTRIAL");
  const [license, setLicense] = useState<SampleTrack["license"]>("CC0 1.0");
  const [error, setError] = useState<string | null>(null);

  const handleOpenForm = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setShowForm((prev) => !prev);
  };

  const handleSubmitSample = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    const cleanTitle = title.trim();
    const cleanPack = packName.trim() || "COMMUNITY PACK";

    if (!cleanTitle) {
      setError("Veuillez saisir un nom de fichier ou de sample.");
      return;
    }

    const nextSample: SampleTrack = {
      id: `smp-comm-${Date.now()}`,
      title: cleanTitle.endsWith(".wav") ? cleanTitle : `${cleanTitle}.wav`,
      packName: cleanPack,
      genre,
      bpm: Number(bpm) || 130,
      key: musicalKey.trim() || "C Minor",
      durationSec: 60,
      sampleRate: "48.0 kHz / 24-BIT",
      license,
      fileSizeMb: 12.0,
      author: user.pseudo,
      avatarExpression: user.expression,
      waveformPeaks: [
        0.4, 0.8, 0.6, 0.9, 0.5, 0.7, 0.85, 0.45, 0.75, 0.95, 0.65, 0.5, 0.8,
        0.7, 0.55, 0.35,
      ],
      synthProfile: {
        baseFreq: 98,
        tempoBpm: Number(bpm) || 130,
        pattern: [1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1],
        timbre: "acid",
      },
    };

    setSamples((prev) => [nextSample, ...prev]);
    setLikesMap((prev) => ({ ...prev, [nextSample.id]: 1 }));
    setTitle("");
    setPackName("");
    setError(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <Card
        moduleTitle="SAMPLES_HUB // PARTAGE_COMMUNAUTAIRE"
        moduleMeta={`${samples.length} SAMPLE(S)`}
        activeIndicator
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="font-mono text-xs font-bold uppercase text-brand-red">
              {"// 48.0 kHz · 24-BIT · CC0 / CC-BY"}
            </div>
            <h1 className="font-sans text-2xl sm:text-3xl font-bold text-brand-black">
              Banque de Samples
            </h1>
            <p className="font-sans text-sm text-neutral-600">
              Partagez vos stems et packs libres de droits avec la communauté.
            </p>
          </div>

          <Button
            id="btn-toggle-sample-form"
            variant="primary"
            size="md"
            onClick={handleOpenForm}
          >
            {user
              ? showForm
                ? "✕ FERMER"
                : "+ AJOUTER UN SAMPLE"
              : "CONNEXION POUR AJOUTER"}
          </Button>
        </div>
      </Card>

      {/* Petits tiroirs Samples Anarchy / Communauté */}
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <button
          type="button"
          onClick={() => setActiveDrawer("ANARCHY_OFFICIAL")}
          className={`px-4 py-2 rounded-lg border-2 font-bold transition-all ${
            activeDrawer === "ANARCHY_OFFICIAL"
              ? "bg-brand-red text-white border-black shadow-comic-sm"
              : "bg-brand-white text-brand-charcoal border-neutral-300 hover:border-black"
          }`}
        >
          ⚡ PACKS ANARCHY (OFFICIELS)
        </button>
        <button
          type="button"
          onClick={() => setActiveDrawer("COMMUNITY_SAMPLES")}
          className={`px-4 py-2 rounded-lg border-2 font-bold transition-all ${
            activeDrawer === "COMMUNITY_SAMPLES"
              ? "bg-black text-white border-black shadow-comic-sm"
              : "bg-brand-white text-brand-charcoal border-neutral-300 hover:border-black"
          }`}
        >
          🎛 SAMPLES COMMUNAUTÉ ({samples.length})
        </button>
      </div>

      {showForm && user && (
        <Card
          moduleTitle={`SUBMIT_SAMPLE // @${user.pseudo.toUpperCase()}`}
          moduleMeta="COMMUNAUTÉ"
          activeIndicator
        >
          <form onSubmit={handleSubmitSample} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="smp-title"
                  className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                >
                  Nom du sample (.wav)
                </label>
                <input
                  id="smp-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: kick-acid-136.wav"
                  className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                />
              </div>

              <div>
                <label
                  htmlFor="smp-pack"
                  className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                >
                  Pack / Collection
                </label>
                <input
                  id="smp-pack"
                  type="text"
                  value={packName}
                  onChange={(e) => setPackName(e.target.value)}
                  placeholder="Ex: ANARCHY PACK 01"
                  className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label
                  htmlFor="smp-genre"
                  className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                >
                  Genre
                </label>
                <select
                  id="smp-genre"
                  value={genre}
                  onChange={(e) =>
                    setGenre(e.target.value as SampleTrack["genre"])
                  }
                  className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                >
                  <option value="INDUSTRIAL">INDUSTRIAL</option>
                  <option value="TRIBAL_CORE">TRIBAL_CORE</option>
                  <option value="PSYCHEDELIC">PSYCHEDELIC</option>
                  <option value="CYBER_TRAP">CYBER_TRAP</option>
                  <option value="SYNTHWAVE">SYNTHWAVE</option>
                  <option value="GLITCH_BASS">GLITCH_BASS</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="smp-bpm"
                  className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                >
                  BPM
                </label>
                <input
                  id="smp-bpm"
                  type="number"
                  min={40}
                  max={240}
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                />
              </div>

              <div>
                <label
                  htmlFor="smp-key"
                  className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                >
                  Tonalité
                </label>
                <input
                  id="smp-key"
                  type="text"
                  value={musicalKey}
                  onChange={(e) => setMusicalKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                />
              </div>

              <div>
                <label
                  htmlFor="smp-license"
                  className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                >
                  Licence
                </label>
                <select
                  id="smp-license"
                  value={license}
                  onChange={(e) =>
                    setLicense(e.target.value as SampleTrack["license"])
                  }
                  className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                >
                  <option value="CC0 1.0">CC0 1.0</option>
                  <option value="CC-BY 4.0">CC-BY 4.0</option>
                </select>
              </div>
            </div>

            {error && (
              <p role="alert" className="font-mono text-xs font-bold text-brand-red">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="clinical"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                ANNULER
              </Button>
              <Button type="submit" variant="primary" size="md">
                PUBLIER LE SAMPLE
              </Button>
            </div>
          </form>
        </Card>
      )}

      {activeDrawer === "ANARCHY_OFFICIAL" ? (
        <Card moduleTitle="PACKS_ANARCHY // OFFICIELS" moduleMeta="0 PACK">
          <div className="py-8 text-center space-y-2">
            <p className="font-sans text-base font-semibold text-brand-black">
              Aucun pack officiel Anarchy publié pour l&apos;instant.
            </p>
            <p className="font-sans text-sm text-neutral-600">
              Vos prochains packs officiels apparaîtront ici.
            </p>
          </div>
        </Card>
      ) : samples.length === 0 ? (
        <Card moduleTitle="BANQUE_SAMPLES // VIDE" moduleMeta="0 FICHIER">
          <div className="py-8 text-center space-y-3">
            <p className="font-sans text-base font-semibold text-brand-black">
              Aucun sample communautaire publié pour l&apos;instant.
            </p>
            <p className="font-sans text-sm text-neutral-600">
              Connectez-vous puis cliquez sur{" "}
              <strong>+ AJOUTER UN SAMPLE</strong> pour commencer à remplir la
              banque.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...samples]
            .sort((a, b) => (likesMap[b.id] ?? 0) - (likesMap[a.id] ?? 0))
            .map((smp) => {
              const track = sampleToAudioTrack(smp);
              const active = currentTrack?.id === track.id && isPlaying;
              const likes = likesMap[smp.id] ?? 0;
              return (
                <Card
                  key={smp.id}
                  moduleTitle={smp.packName}
                  moduleMeta={`${smp.bpm} BPM • ${smp.key}`}
                  activeIndicator={active}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <AvatarBD
                        name={smp.author}
                        expression={smp.avatarExpression}
                        size="sm"
                        badgeText={smp.license}
                      />
                      <div>
                        <h2 className="font-mono text-sm font-bold text-brand-black">
                          {smp.title}
                        </h2>
                        <div className="font-mono text-[11px] text-neutral-500">
                          @{smp.author} • {smp.genre} • {smp.sampleRate}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setLikesMap((prev) => ({
                            ...prev,
                            [smp.id]: (prev[smp.id] ?? 0) + 1,
                          }))
                        }
                        className="px-2.5 py-1 rounded border-2 border-black bg-brand-pearl font-mono text-xs font-bold"
                      >
                        ▲ {likes}
                      </button>
                      <Button
                        variant={active ? "primary" : "comic"}
                        size="sm"
                        onClick={() => playTrack(track)}
                      >
                        {active ? "❚❚ PAUSE" : "▶ ÉCOUTER"}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
}

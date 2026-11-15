"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AvatarBD } from "@/components/ui/AvatarBD";
import { useAudioPlayer } from "@/components/audio/AudioPlayerContext";
import {
  SAMPLE_TRACKS,
  sampleToAudioTrack,
  type SampleTrack,
} from "@/lib/openhub-data";

/**
 * Page `/samples` — Banque de samples communautaire vierge par défaut,
 * prête à être remplie par l'auteur et la communauté.
 */
export default function SamplesPage() {
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();
  const [samples, setSamples] = useState<SampleTrack[]>(SAMPLE_TRACKS);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [packName, setPackName] = useState("");
  const [author, setAuthor] = useState("");
  const [bpm, setBpm] = useState(130);
  const [musicalKey, setMusicalKey] = useState("C Minor");
  const [genre, setGenre] = useState<SampleTrack["genre"]>("INDUSTRIAL");
  const [license, setLicense] = useState<SampleTrack["license"]>("CC0 1.0");
  const [error, setError] = useState<string | null>(null);

  const handleSubmitSample = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    const cleanPack = packName.trim() || "COMMUNITY PACK";
    const cleanAuthor = author.trim() || "Membre Anarchy";

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
      author: cleanAuthor,
      avatarExpression: "spectateur-b",
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
    setTitle("");
    setPackName("");
    setError(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-8">
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
              Banque de Samples Communautaire
            </h1>
            <p className="font-sans text-sm text-neutral-600">
              Espace vierge prêt à accueillir vos propres packs et stems audio.
            </p>
          </div>

          <Button
            id="btn-toggle-sample-form"
            variant="primary"
            size="md"
            onClick={() => setShowForm((prev) => !prev)}
          >
            {showForm ? "✕ FERMER" : "+ AJOUTER UN SAMPLE"}
          </Button>
        </div>
      </Card>

      {showForm && (
        <Card
          moduleTitle="SUBMIT_SAMPLE // AJOUTER À LA BANQUE"
          moduleMeta="COMMUNAUTÉ"
          activeIndicator
        >
          <form onSubmit={handleSubmitSample} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

              <div>
                <label
                  htmlFor="smp-author"
                  className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                >
                  Auteur
                </label>
                <input
                  id="smp-author"
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Votre pseudo"
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

      {samples.length === 0 ? (
        <Card
          moduleTitle="BANQUE_SAMPLES // VIDE"
          moduleMeta="0 FICHIER"
        >
          <div className="py-8 text-center space-y-3">
            <p className="font-sans text-base font-semibold text-brand-black">
              Aucun sample publié pour l&apos;instant.
            </p>
            <p className="font-sans text-sm text-neutral-600">
              Cliquez sur <strong>+ AJOUTER UN SAMPLE</strong> pour commencer à
              remplir la banque communautaire.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {samples.map((smp) => {
            const track = sampleToAudioTrack(smp);
            const active = currentTrack?.id === track.id && isPlaying;
            return (
              <Card
                key={smp.id}
                moduleTitle={smp.packName}
                moduleMeta={`${smp.bpm} BPM • ${smp.key}`}
                activeIndicator={active}
              >
                <div className="space-y-4">
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
                          {smp.author} • {smp.genre} • {smp.sampleRate}
                        </div>
                      </div>
                    </div>

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

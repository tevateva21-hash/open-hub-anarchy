"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AvatarBD } from "@/components/ui/AvatarBD";
import { useAuth } from "@/components/auth/AuthContext";
import type { AvatarExpression } from "@/lib/openhub-data";

type RadioDrawer = "ANARCHY_SOUNDCLOUD" | "GENERAL_COMMUNITY";

interface CommunityRadioTrack {
  id: string;
  title: string;
  authorPseudo: string;
  authorExpression: AvatarExpression;
  genre: string;
  bpm: number;
  likes: number;
  likedByMe?: boolean;
  createdAt: string;
  audioUrl?: string;
}

const RADIO_STORAGE_KEY = "openhub_radio_community_v1";
const SOUNDCLOUD_STORAGE_KEY = "openhub_soundcloud_url_v1";
const DEFAULT_SOUNDCLOUD_URL = "https://soundcloud.com/discover/sets/charts-top:electronic";

function buildSoundCloudEmbedSrc(targetUrl: string): string {
  const encoded = encodeURIComponent(targetUrl.trim() || DEFAULT_SOUNDCLOUD_URL);
  return `https://w.soundcloud.com/player/?url=${encoded}&color=%23ff1b24&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;
}

/**
 * Page `/radio` — Avec 2 tiroirs :
 * 1. Radio Anarchy (Intégration SoundCloud officielle Anarchy)
 * 2. Radio Générale (Communauté : dépôt de sons, Likes & Ranking)
 */
export default function RadioPage() {
  const { user, openAuthModal } = useAuth();

  const [activeDrawer, setActiveDrawer] =
    useState<RadioDrawer>("ANARCHY_SOUNDCLOUD");

  // Intégration SoundCloud Anarchy
  const [soundcloudUrl, setSoundcloudUrl] = useState<string>(
    DEFAULT_SOUNDCLOUD_URL
  );
  const [soundcloudInput, setSoundcloudInput] = useState<string>("");
  const [soundcloudError, setSoundcloudError] = useState<string | null>(null);

  // Radio Générale Communauté
  const [communityTracks, setCommunityTracks] = useState<CommunityRadioTrack[]>(
    []
  );
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [trackTitle, setTrackTitle] = useState("");
  const [trackGenre, setTrackGenre] = useState("Techno / Psy");
  const [trackBpm, setTrackBpm] = useState(138);
  const [localAudioUrl, setLocalAudioUrl] = useState<string | undefined>(
    undefined
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [activeLocalPreviewId, setActiveLocalPreviewId] = useState<
    string | null
  >(null);

  const localAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      const savedSc = window.localStorage.getItem(SOUNDCLOUD_STORAGE_KEY);
      if (savedSc && savedSc.startsWith("http")) {
        setSoundcloudUrl(savedSc);
        setSoundcloudInput(savedSc);
      }
      const raw = window.localStorage.getItem(RADIO_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CommunityRadioTrack[];
        if (Array.isArray(parsed)) {
          setCommunityTracks(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const persistTracks = (next: CommunityRadioTrack[]) => {
    setCommunityTracks(next);
    try {
      const serializable = next.map((track) => ({
        ...track,
        audioUrl: undefined,
      }));
      window.localStorage.setItem(
        RADIO_STORAGE_KEY,
        JSON.stringify(serializable)
      );
    } catch {
      // ignore
    }
  };

  const rankedCommunityTracks = useMemo(() => {
    return [...communityTracks].sort((a, b) => b.likes - a.likes);
  }, [communityTracks]);

  const handleApplySoundCloudUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = soundcloudInput.trim();
    if (!clean.includes("soundcloud.com")) {
      setSoundcloudError(
        "Veuillez coller un lien SoundCloud valide (ex: https://soundcloud.com/...)."
      );
      return;
    }
    setSoundcloudError(null);
    setSoundcloudUrl(clean);
    try {
      window.localStorage.setItem(SOUNDCLOUD_STORAGE_KEY, clean);
    } catch {
      // ignore
    }
  };

  const handleOpenUpload = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setShowUploadForm((prev) => !prev);
  };

  const handleAddCommunityTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    const cleanTitle = trackTitle.trim();
    if (!cleanTitle) {
      setFormError("Veuillez saisir le titre de votre morceau.");
      return;
    }

    const nextTrack: CommunityRadioTrack = {
      id: `radio-comm-${Date.now()}`,
      title: cleanTitle,
      authorPseudo: user.pseudo,
      authorExpression: user.expression,
      genre: trackGenre.trim() || "Techno",
      bpm: Number(trackBpm) || 138,
      likes: 1,
      likedByMe: true,
      createdAt: new Date().toLocaleDateString("fr-FR"),
      audioUrl: localAudioUrl,
    };

    persistTracks([nextTrack, ...communityTracks]);
    setTrackTitle("");
    setLocalAudioUrl(undefined);
    setFormError(null);
    setShowUploadForm(false);
  };

  const handleToggleLike = (trackId: string) => {
    if (!user) {
      openAuthModal();
      return;
    }
    const updated = communityTracks.map((t) => {
      if (t.id !== trackId) return t;
      const already = Boolean(t.likedByMe);
      return {
        ...t,
        likes: already ? Math.max(0, t.likes - 1) : t.likes + 1,
        likedByMe: !already,
      };
    });
    persistTracks(updated);
  };

  const handlePlayCommunityTrack = (track: CommunityRadioTrack) => {
    if (!track.audioUrl || !localAudioRef.current) return;
    if (activeLocalPreviewId === track.id) {
      localAudioRef.current.pause();
      setActiveLocalPreviewId(null);
    } else {
      localAudioRef.current.src = track.audioUrl;
      void localAudioRef.current.play();
      setActiveLocalPreviewId(track.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Petits tiroirs Radio Anarchy (SoundCloud) / Radio Générale */}
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <button
          id="tab-radio-anarchy"
          type="button"
          onClick={() => setActiveDrawer("ANARCHY_SOUNDCLOUD")}
          className={`px-4 py-2 rounded-lg border-2 font-bold transition-all ${
            activeDrawer === "ANARCHY_SOUNDCLOUD"
              ? "bg-brand-red text-white border-black shadow-comic-sm"
              : "bg-brand-white text-brand-charcoal border-neutral-300 hover:border-black"
          }`}
        >
          📻 RADIO ANARCHY (SOUNDCLOUD)
        </button>
        <button
          id="tab-radio-general"
          type="button"
          onClick={() => setActiveDrawer("GENERAL_COMMUNITY")}
          className={`px-4 py-2 rounded-lg border-2 font-bold transition-all ${
            activeDrawer === "GENERAL_COMMUNITY"
              ? "bg-black text-white border-black shadow-comic-sm"
              : "bg-brand-white text-brand-charcoal border-neutral-300 hover:border-black"
          }`}
        >
          🌍 RADIO GÉNÉRALE &amp; RANKING ({communityTracks.length})
        </button>
      </div>

      {/* TIROIR 1 : RADIO ANARCHY — INTÉGRATION SOUNDCLOUD */}
      {activeDrawer === "ANARCHY_SOUNDCLOUD" && (
        <Card
          moduleTitle="RADIO_ANARCHY // SOUNDCLOUD_LIVE_INTEGRATION"
          moduleMeta="FLUX SOUNDCLOUD OFFICIEL"
          activeIndicator
        >
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-neutral-200">
              <div className="flex items-center gap-4">
                <AvatarBD
                  name="Anarchy SoundCloud"
                  expression="hyped"
                  size="md"
                  badgeText="SC"
                  anaglyphRing
                />
                <div>
                  <div className="font-mono text-xs font-bold uppercase text-brand-red">
                    {"// RADIO_ANARCHY · SOUNDCLOUD"}
                  </div>
                  <h1 className="font-sans text-2xl sm:text-3xl font-bold text-brand-black">
                    Radio Anarchy — SoundCloud
                  </h1>
                  <p className="font-sans text-sm text-neutral-600">
                    Écoutez la sélection SoundCloud Anarchy ou chargez n&apos;importe
                    quelle playlist / track SoundCloud en direct.
                  </p>
                </div>
              </div>

              <a
                href={soundcloudUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0"
              >
                <Button variant="comic" size="md">
                  OUVRIR SUR SOUNDCLOUD ↗
                </Button>
              </a>
            </div>

            {/* Barre de sélection d'URL SoundCloud */}
            <form
              onSubmit={handleApplySoundCloudUrl}
              className="flex flex-col sm:flex-row gap-2.5"
            >
              <input
                id="input-soundcloud-url"
                type="url"
                value={soundcloudInput}
                onChange={(e) => setSoundcloudInput(e.target.value)}
                placeholder="Coller un lien SoundCloud (playlist, set ou morceau Anarchy)..."
                className="flex-1 px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
              />
              <Button type="submit" variant="primary" size="md">
                CHARGER LE FLUX SOUNDCLOUD
              </Button>
            </form>

            {soundcloudError && (
              <p className="font-mono text-xs font-bold text-brand-red">
                ⚠ {soundcloudError}
              </p>
            )}

            {/* Lecteur SoundCloud embarqué */}
            <div className="rounded-xl border-2 border-black overflow-hidden shadow-comic bg-brand-pearl">
              <iframe
                title="Lecteur SoundCloud Radio Anarchy"
                width="100%"
                height="420"
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                src={buildSoundCloudEmbedSrc(soundcloudUrl)}
              />
            </div>
          </div>
        </Card>
      )}

      {/* TIROIR 2 : RADIO GÉNÉRALE COMMUNAUTAIRE + LIKES & RANKING */}
      {activeDrawer === "GENERAL_COMMUNITY" && (
        <div className="space-y-6">
          <audio
            ref={localAudioRef}
            className="hidden"
            onEnded={() => setActiveLocalPreviewId(null)}
          />

          <Card
            moduleTitle="RADIO_GÉNÉRALE // DÉPÔTS_COMMUNAUTÉ_&_RANKING"
            moduleMeta={`${communityTracks.length} SON(S) EN LIGNE`}
            activeIndicator
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-mono text-xs font-bold uppercase text-brand-red">
                  {"// CLASSEMENT PAR LIKES · COMMUNAUTÉ"}
                </div>
                <h2 className="font-sans text-xl sm:text-2xl font-bold text-brand-black">
                  Radio Générale &amp; Ranking Communautaire
                </h2>
                <p className="font-sans text-sm text-neutral-600">
                  Déposez vos sons, écoutez ceux des autres et votez : les sons
                  les plus likés montent automatiquement en haut du classement.
                </p>
              </div>

              <Button
                id="btn-toggle-radio-upload"
                variant="primary"
                size="md"
                onClick={handleOpenUpload}
              >
                {user
                  ? showUploadForm
                    ? "✕ FERMER"
                    : "+ DÉPOSER UN SON"
                  : "CONNEXION POUR DÉPOSER"}
              </Button>
            </div>
          </Card>

          {showUploadForm && user && (
            <Card
              moduleTitle={`UPLOAD_RADIO_TRACK // @${user.pseudo.toUpperCase()}`}
              moduleMeta="MP3 / WAV"
              activeIndicator
            >
              <form onSubmit={handleAddCommunityTrack} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="radio-track-title"
                      className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                    >
                      Titre du son *
                    </label>
                    <input
                      id="radio-track-title"
                      type="text"
                      value={trackTitle}
                      onChange={(e) => setTrackTitle(e.target.value)}
                      placeholder="Ex: Acid Ritual 138"
                      className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="radio-track-genre"
                      className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                    >
                      Style / Genre
                    </label>
                    <input
                      id="radio-track-genre"
                      type="text"
                      value={trackGenre}
                      onChange={(e) => setTrackGenre(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="radio-track-bpm"
                      className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                    >
                      BPM
                    </label>
                    <input
                      id="radio-track-bpm"
                      type="number"
                      min={50}
                      max={240}
                      value={trackBpm}
                      onChange={(e) => setTrackBpm(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="radio-track-file"
                    className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                  >
                    Fichier audio (MP3 / WAV)
                  </label>
                  <input
                    id="radio-track-file"
                    type="file"
                    accept=".mp3,.wav,audio/mpeg,audio/wav"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setLocalAudioUrl(URL.createObjectURL(file));
                      if (!trackTitle) {
                        setTrackTitle(file.name.replace(/\.(mp3|wav)$/i, ""));
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-pearl font-mono text-xs"
                  />
                </div>

                {formError && (
                  <p className="font-mono text-xs font-bold text-brand-red">
                    ⚠ {formError}
                  </p>
                )}

                <Button type="submit" variant="primary" size="md">
                  PUBLIER SUR LA RADIO GÉNÉRALE →
                </Button>
              </form>
            </Card>
          )}

          {rankedCommunityTracks.length === 0 ? (
            <Card moduleTitle="CLASSEMENT_RADIO // VIDE" moduleMeta="0 TRACK">
              <div className="py-8 text-center space-y-3">
                <p className="font-sans text-base font-semibold text-brand-black">
                  Aucun son déposé sur la Radio Générale pour l&apos;instant.
                </p>
                <p className="font-sans text-sm text-neutral-600">
                  Connectez-vous avec votre pseudo et déposez le premier son
                  pour lancer le classement !
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {rankedCommunityTracks.map((track, idx) => {
                const isPlayingLocal = activeLocalPreviewId === track.id;
                return (
                  <Card
                    key={track.id}
                    moduleTitle={`RANK #${idx + 1} // ${track.genre.toUpperCase()}`}
                    moduleMeta={`${track.bpm} BPM • @${track.authorPseudo.toUpperCase()}`}
                    activeIndicator={isPlayingLocal}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg border-2 border-black bg-brand-black text-white font-mono text-sm font-bold flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </div>
                        <AvatarBD
                          name={track.authorPseudo}
                          expression={track.authorExpression}
                          size="sm"
                          badgeText={track.likedByMe ? "♥" : "MP3"}
                        />
                        <div>
                          <h3 className="font-sans text-base font-bold text-brand-black">
                            {track.title}
                          </h3>
                          <p className="font-mono text-[11px] text-neutral-500">
                            Posté par @{track.authorPseudo} • {track.createdAt}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleLike(track.id)}
                          className={`px-3 py-1.5 rounded-lg border-2 font-mono text-xs font-bold transition-all ${
                            track.likedByMe
                              ? "bg-brand-red text-white border-black shadow-comic-sm"
                              : "bg-brand-pearl text-brand-black border-black hover:bg-brand-white"
                          }`}
                        >
                          ▲ LIKE ({track.likes})
                        </button>
                        {track.audioUrl && (
                          <Button
                            variant={isPlayingLocal ? "primary" : "comic"}
                            size="sm"
                            onClick={() => handlePlayCommunityTrack(track)}
                          >
                            {isPlayingLocal ? "❚❚ PAUSE" : "▶ ÉCOUTER"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

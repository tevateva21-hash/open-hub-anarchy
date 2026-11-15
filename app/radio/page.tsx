"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AvatarBD } from "@/components/ui/AvatarBD";
import { useAudioPlayer } from "@/components/audio/AudioPlayerContext";
import { useAuth } from "@/components/auth/AuthContext";
import type { AudioTrackItem, AvatarExpression } from "@/lib/openhub-data";

type RadioDrawer = "ANARCHY_OFFICIAL" | "GENERAL_COMMUNITY";

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
  audioUrl?: string; // ObjectURL temporaire si fichier MP3/WAV importé en session
}

const RADIO_STORAGE_KEY = "openhub_radio_community_v1";

function formatTimecode(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

const DEFAULT_RADIO_STREAM: AudioTrackItem = {
  id: "anarchy-radio-stream",
  title: "ANARCHY RADIO // SIGNAL LIVE",
  subtitle: "WEBAUDIO DSP STREAM • 48.0 kHz / 24-BIT",
  sourceType: "VST_DEMO",
  bpm: 136,
  key: "F Minor",
  avatarExpression: "spectateur-a",
};

/**
 * Page `/radio` — Avec 2 tiroirs :
 * 1. Radio Anarchy (Officielle)
 * 2. Radio Générale (Communauté : dépôt de sons, Likes & Ranking)
 */
export default function RadioPage() {
  const {
    currentTrack,
    isPlaying,
    wetDryMix,
    volume,
    isMuted,
    currentTime,
    duration,
    oscilloscopeMode,
    peakLevels,
    playTrack,
    togglePlay,
    setVolume,
    toggleMute,
    toggleWetDry,
    setOscilloscopeMode,
    getTimeDomainData,
    getFrequencyData,
    triggerGlitchBurst,
  } = useAudioPlayer();

  const { user, openAuthModal } = useAuth();

  const [activeDrawer, setActiveDrawer] =
    useState<RadioDrawer>("ANARCHY_OFFICIAL");
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

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const localAudioRef = useRef<HTMLAudioElement | null>(null);

  // Charger les morceaux communautaires depuis localStorage
  useEffect(() => {
    try {
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
      // Ne pas persister les blob: URLs éphémères entre sessions
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

  // Classement automatique par nombre de Likes décroissant (Ranking)
  const rankedCommunityTracks = useMemo(() => {
    return [...communityTracks].sort((a, b) => b.likes - a.likes);
  }, [communityTracks]);

  // Boucle 60fps oscilloscope
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = 128;
    const dataArray = new Uint8Array(bufferLength);
    let animationFrameId = 0;

    const renderFrame = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "#E5E5E5";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (oscilloscopeMode === "FFT") {
        getFrequencyData(dataArray);
        const barCount = 32;
        const barWidth = width / barCount - 1.5;

        for (let i = 0; i < barCount; i++) {
          const val = dataArray[i * 2] / 255;
          const barHeight = Math.max(2, val * (height - 4));
          const x = i * (barWidth + 1.5);
          const y = height - barHeight;
          ctx.fillStyle = val > 0.62 || wetDryMix ? "#FF1B24" : "#222226";
          ctx.fillRect(x, y, barWidth, barHeight);
        }
      } else {
        getTimeDomainData(dataArray);
        const sliceWidth = width / (bufferLength - 1);

        if (oscilloscopeMode === "ANAGLYPH") {
          ctx.lineWidth = 2;
          ctx.strokeStyle = "#00E5FF";
          ctx.beginPath();
          let xCyan = 0;
          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * height) / 2 + 2;
            if (i === 0) ctx.moveTo(xCyan + 2.5, y);
            else ctx.lineTo(xCyan + 2.5, y);
            xCyan += sliceWidth;
          }
          ctx.stroke();
        }

        ctx.lineWidth = wetDryMix ? 2.5 : 2;
        ctx.strokeStyle = "#FF1B24";
        ctx.beginPath();
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }

      animationFrameId = window.requestAnimationFrame(renderFrame);
    };

    animationFrameId = window.requestAnimationFrame(renderFrame);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [getFrequencyData, getTimeDomainData, oscilloscopeMode, wetDryMix]);

  const activeTrack = currentTrack ?? DEFAULT_RADIO_STREAM;

  const handleToggleRadio = () => {
    if (!currentTrack) {
      playTrack(DEFAULT_RADIO_STREAM);
    } else {
      togglePlay();
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
      id: `rad-comm-${Date.now()}`,
      title: cleanTitle,
      authorPseudo: user.pseudo,
      authorExpression: user.expression,
      genre: trackGenre.trim() || "Electronic",
      bpm: Number(trackBpm) || 136,
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

  const handleToggleLike = (id: string) => {
    if (!user) {
      openAuthModal();
      return;
    }
    const next = communityTracks.map((t) => {
      if (t.id !== id) return t;
      const wasLiked = Boolean(t.likedByMe);
      return {
        ...t,
        likedByMe: !wasLiked,
        likes: Math.max(0, t.likes + (wasLiked ? -1 : 1)),
      };
    });
    persistTracks(next);
  };

  const handlePlayCommunityTrack = (t: CommunityRadioTrack) => {
    if (t.audioUrl && localAudioRef.current) {
      if (activeLocalPreviewId === t.id && !localAudioRef.current.paused) {
        localAudioRef.current.pause();
        setActiveLocalPreviewId(null);
        return;
      }
      localAudioRef.current.src = t.audioUrl;
      void localAudioRef.current.play();
      setActiveLocalPreviewId(t.id);
    } else {
      playTrack({
        id: t.id,
        title: t.title,
        subtitle: `RADIO GÉNÉRALE • @${t.authorPseudo} • ${t.genre}`,
        sourceType: "SAMPLE_WAV",
        bpm: t.bpm,
        key: "F Minor",
        avatarExpression: t.authorExpression,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Tiroirs Radio Anarchy / Radio Générale */}
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <button
          id="tab-radio-official"
          type="button"
          onClick={() => setActiveDrawer("ANARCHY_OFFICIAL")}
          className={`px-4 py-2 rounded-lg border-2 font-bold transition-all ${
            activeDrawer === "ANARCHY_OFFICIAL"
              ? "bg-brand-red text-white border-black shadow-comic-sm"
              : "bg-brand-white text-brand-charcoal border-neutral-300 hover:border-black"
          }`}
        >
          📻 RADIO ANARCHY (OFFICIELLE)
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

      {/* TIROIR 1 : RADIO ANARCHY OFFICIELLE */}
      {activeDrawer === "ANARCHY_OFFICIAL" && (
        <Card
          moduleTitle="RADIO_ANARCHY // FLUX_OFFICIEL_&_OSCILLOSCOPE"
          moduleMeta="48.0 kHz // 24-BIT"
          activeIndicator={isPlaying}
        >
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-neutral-200">
              <div className="flex items-center gap-4">
                <AvatarBD
                  name={activeTrack.title}
                  expression={activeTrack.avatarExpression}
                  size="md"
                  badgeText="LIVE"
                  audioReactive={isPlaying}
                  anaglyphRing={isPlaying}
                />
                <div>
                  <div className="font-mono text-xs font-bold uppercase text-brand-red">
                    {"// RADIO_ANARCHY"}
                  </div>
                  <h1 className="font-sans text-2xl sm:text-3xl font-bold text-brand-black">
                    {activeTrack.title}
                  </h1>
                  <p className="font-mono text-xs text-neutral-500">
                    {activeTrack.subtitle} • {activeTrack.bpm} BPM •{" "}
                    {activeTrack.key}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  id="btn-radio-play"
                  variant={isPlaying ? "primary" : "comic"}
                  size="lg"
                  onClick={handleToggleRadio}
                >
                  {isPlaying ? "❚❚ PAUSE RADIO" : "▶ LANCER LA RADIO"}
                </Button>
                <Link href="/anarchy-visual-design">
                  <Button variant="clinical" size="lg">
                    ⚡ SYNCHRO VISUAL DESIGN
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              <div className="lg:col-span-9 bg-brand-white border-2 border-black rounded-xl p-3 shadow-comic-sm space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                  <span className="font-bold text-brand-black">
                    OSCILLOSCOPE TEMPS RÉEL (#FF1B24)
                  </span>
                  <div className="flex items-center gap-1.5">
                    {(["WAVE", "FFT", "ANAGLYPH"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setOscilloscopeMode(mode)}
                        className={`px-2 py-0.5 rounded border font-bold ${
                          oscilloscopeMode === mode
                            ? "bg-brand-black text-brand-white border-black"
                            : "bg-brand-pearl text-brand-charcoal border-neutral-300"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <canvas
                  ref={canvasRef}
                  width={760}
                  height={180}
                  aria-label="Oscilloscope Radio Anarchy"
                  className="w-full h-44 rounded border border-neutral-200 bg-brand-white"
                />

                <div className="flex items-center justify-between font-mono text-xs text-neutral-500">
                  <span>
                    {formatTimecode(currentTime)} / {formatTimecode(duration)}
                  </span>
                  <span>
                    MODE DSP :{" "}
                    <strong className="text-brand-black">
                      {wetDryMix ? "WET (ACTIF)" : "DRY (BYPASS)"}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="lg:col-span-3 bg-brand-pearl border-2 border-black rounded-xl p-4 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="font-mono text-xs font-bold uppercase text-brand-black">
                    NIVEAUX L / R
                  </div>
                  {(
                    [
                      ["L", peakLevels.left],
                      ["R", peakLevels.right],
                    ] as const
                  ).map(([ch, level]) => (
                    <div key={ch} className="space-y-1 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span>CH_{ch}</span>
                        <span>{Math.round(level)}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-white border border-black rounded overflow-hidden">
                        <div
                          className={`h-full transition-all duration-75 ${
                            level > 75 ? "bg-brand-red" : "bg-brand-charcoal"
                          }`}
                          style={{
                            width: `${Math.min(100, Math.max(0, level))}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-3 border-t border-neutral-300">
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      variant={wetDryMix ? "primary" : "clinical"}
                      size="sm"
                      onClick={toggleWetDry}
                    >
                      {wetDryMix ? "DSP: WET" : "DSP: DRY"}
                    </Button>
                    <Button
                      variant="comic"
                      size="sm"
                      onClick={() => triggerGlitchBurst("glitch")}
                    >
                      GLITCH
                    </Button>
                  </div>

                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="flex items-center justify-between">
                      <span>VOLUME</span>
                      <button
                        type="button"
                        onClick={toggleMute}
                        className="underline text-brand-red font-bold"
                      >
                        {isMuted ? "UNMUTE" : "MUTE"}
                      </button>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round((isMuted ? 0 : volume) * 100)}
                      onChange={(e) => setVolume(Number(e.target.value) / 100)}
                      aria-label="Volume Radio"
                      className="w-full accent-brand-red"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* TIROIR 2 : RADIO GÉNÉRALE COMMUNAUTAIRE + LIKES & RANKING */}
      {activeDrawer === "GENERAL_COMMUNITY" && (
        <div className="space-y-6">
          <audio ref={localAudioRef} className="hidden" />

          <Card
            moduleTitle="RADIO_GÉNÉRALE // CLASSEMENT_&_SONS_COMMUNAUTÉ"
            moduleMeta="TRIÉ PAR LIKES"
            activeIndicator
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h1 className="font-sans text-2xl font-bold text-brand-black">
                  Radio Générale &amp; Ranking Communauté
                </h1>
                <p className="font-sans text-sm text-neutral-600">
                  Déposez vos morceaux dans la radio communautaire et votez
                  pour faire monter vos favoris en tête du classement.
                </p>
              </div>

              <Button
                id="btn-radio-add-track"
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
              moduleTitle={`AJOUT_SON // @${user.pseudo.toUpperCase()}`}
              moduleMeta="RADIO GÉNÉRALE"
              activeIndicator
            >
              <form onSubmit={handleAddCommunityTrack} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="rad-title"
                      className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                    >
                      Titre du morceau
                    </label>
                    <input
                      id="rad-title"
                      type="text"
                      value={trackTitle}
                      onChange={(e) => setTrackTitle(e.target.value)}
                      placeholder="Ex: Acid Therapy 01"
                      className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="rad-genre"
                      className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                    >
                      Style / Genre
                    </label>
                    <input
                      id="rad-genre"
                      type="text"
                      value={trackGenre}
                      onChange={(e) => setTrackGenre(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="rad-bpm"
                      className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                    >
                      BPM
                    </label>
                    <input
                      id="rad-bpm"
                      type="number"
                      min={40}
                      max={240}
                      value={trackBpm}
                      onChange={(e) => setTrackBpm(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="rad-file"
                    className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                  >
                    Fichier MP3 / WAV (optionnel pour lecture directe)
                  </label>
                  <input
                    id="rad-file"
                    type="file"
                    accept=".mp3,.wav,audio/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setLocalAudioUrl(URL.createObjectURL(f));
                        if (!trackTitle.trim()) {
                          setTrackTitle(f.name.replace(/\.[^.]+$/, ""));
                        }
                      }
                    }}
                    className="font-mono text-xs"
                  />
                </div>

                {formError && (
                  <p role="alert" className="font-mono text-xs font-bold text-brand-red">
                    {formError}
                  </p>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="clinical"
                    size="sm"
                    onClick={() => setShowUploadForm(false)}
                  >
                    ANNULER
                  </Button>
                  <Button type="submit" variant="primary" size="md">
                    PUBLIER SUR LA RADIO
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {rankedCommunityTracks.length === 0 ? (
            <Card moduleTitle="RANKING // VIDE" moduleMeta="0 MORCEAU">
              <div className="py-8 text-center space-y-2">
                <p className="font-sans text-base font-semibold text-brand-black">
                  Aucun son déposé sur la Radio Générale pour l&apos;instant.
                </p>
                <p className="font-sans text-sm text-neutral-600">
                  Connectez-vous et publiez le premier morceau pour lancer le
                  classement !
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {rankedCommunityTracks.map((t, index) => {
                const isActive =
                  (currentTrack?.id === t.id && isPlaying) ||
                  activeLocalPreviewId === t.id;
                return (
                  <div
                    key={t.id}
                    className="bg-brand-white border-2 border-black rounded-xl p-4 shadow-comic-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-lg border-2 border-black font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                          index === 0
                            ? "bg-brand-red text-white"
                            : "bg-brand-pearl text-brand-black"
                        }`}
                      >
                        #{index + 1}
                      </span>
                      <AvatarBD
                        name={t.authorPseudo}
                        expression={t.authorExpression}
                        size="sm"
                        badgeText="DJ"
                      />
                      <div>
                        <div className="font-sans text-base font-bold text-brand-black">
                          {t.title}
                        </div>
                        <div className="font-mono text-[11px] text-neutral-500">
                          @{t.authorPseudo} • {t.genre} • {t.bpm} BPM •{" "}
                          {t.createdAt}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleLike(t.id)}
                        className={`px-3 py-1.5 rounded-lg border-2 border-black font-mono text-xs font-bold transition-all ${
                          t.likedByMe
                            ? "bg-brand-red text-white shadow-comic-sm"
                            : "bg-brand-pearl text-brand-black hover:bg-brand-white"
                        }`}
                      >
                        ▲ {t.likes} LIKE{t.likes > 1 ? "S" : ""}
                      </button>
                      <Button
                        variant={isActive ? "primary" : "comic"}
                        size="sm"
                        onClick={() => handlePlayCommunityTrack(t)}
                      >
                        {isActive ? "❚❚ PAUSE" : "▶ ÉCOUTER"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

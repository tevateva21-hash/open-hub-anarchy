"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AvatarBD } from "@/components/ui/AvatarBD";
import { useAuth } from "@/components/auth/AuthContext";
import type { AvatarExpression } from "@/lib/openhub-data";

interface StemRemixReply {
  id: string;
  title: string;
  note: string;
  authorPseudo: string;
  authorExpression: AvatarExpression;
  audioFileName?: string;
  audioUrl?: string;
  stemsZipName?: string;
  stemsZipUrl?: string;
  createdAt: string;
}

interface CommunityStemTrack {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  musicalKey: string;
  description: string;
  authorPseudo: string;
  authorExpression: AvatarExpression;
  audioFileName?: string;
  audioUrl?: string;
  stemsZipName?: string;
  stemsZipUrl?: string;
  likes: number;
  createdAt: string;
  remixes: StemRemixReply[];
}

const STEMS_STORAGE_KEY = "openhub_community_stems_v1";

/**
 * Page `/sons-communaute` — Sons Communautaires & Stems (.zip) :
 * - Déposer un morceau fini (audio) + son pack `.zip` de stems indépendants
 * - Écouter le morceau directement sur la carte
 * - Télécharger le `.zip` des stems pour le modifier dans sa DAW
 * - Remixer / Répondre à un son en déposant sa version modifiée en dessous
 */
export default function CommunitySoundsPage() {
  const { user, openAuthModal } = useAuth();

  const [tracks, setTracks] = useState<CommunityStemTrack[]>([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  // Formulaire Nouveau Son + Stems ZIP
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("Techno / Psy");
  const [bpm, setBpm] = useState(136);
  const [musicalKey, setMusicalKey] = useState("F Minor");
  const [description, setDescription] = useState("");
  const [audioFileName, setAudioFileName] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
  const [stemsZipName, setStemsZipName] = useState("");
  const [stemsZipUrl, setStemsZipUrl] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);

  // Formulaire Remix / Réponse
  const [remixTitle, setRemixTitle] = useState("");
  const [remixNote, setRemixNote] = useState("");
  const [remixAudioName, setRemixAudioName] = useState("");
  const [remixAudioUrl, setRemixAudioUrl] = useState<string | undefined>(
    undefined
  );
  const [remixZipName, setRemixZipName] = useState("");
  const [remixZipUrl, setRemixZipUrl] = useState<string | undefined>(undefined);
  const [remixError, setRemixError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STEMS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CommunityStemTrack[];
        if (Array.isArray(parsed)) setTracks(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const persistTracks = (next: CommunityStemTrack[]) => {
    setTracks(next);
    try {
      const serializable = next.map((t) => ({
        ...t,
        audioUrl: undefined,
        stemsZipUrl: undefined,
        remixes: t.remixes.map((r) => ({
          ...r,
          audioUrl: undefined,
          stemsZipUrl: undefined,
        })),
      }));
      window.localStorage.setItem(
        STEMS_STORAGE_KEY,
        JSON.stringify(serializable)
      );
    } catch {
      // ignore
    }
  };

  const handleOpenNewForm = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setShowNewForm((prev) => !prev);
  };

  const handleOpenRemixForm = (trackId: string) => {
    if (!user) {
      openAuthModal();
      return;
    }
    setReplyingToId((prev) => (prev === trackId ? null : trackId));
    setRemixError(null);
  };

  const handlePublishTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!title.trim()) {
      setFormError("Veuillez indiquer le titre du morceau.");
      return;
    }
    if (!audioUrl && !stemsZipUrl) {
      setFormError(
        "Ajoutez au moins un fichier audio (MP3/WAV) ou un pack de stems (.zip)."
      );
      return;
    }

    const created: CommunityStemTrack = {
      id: `stem-${Date.now()}`,
      title: title.trim(),
      genre: genre.trim() || "Techno",
      bpm: Number(bpm) || 136,
      musicalKey: musicalKey.trim() || "C Minor",
      description:
        description.trim() ||
        "Morceau ouvert au remix — téléchargez les stems et répondez avec votre version.",
      authorPseudo: user.pseudo,
      authorExpression: user.expression,
      audioFileName: audioFileName || undefined,
      audioUrl,
      stemsZipName: stemsZipName || undefined,
      stemsZipUrl,
      likes: 1,
      createdAt: new Date().toLocaleDateString("fr-FR"),
      remixes: [],
    };

    persistTracks([created, ...tracks]);
    setTitle("");
    setDescription("");
    setAudioFileName("");
    setAudioUrl(undefined);
    setStemsZipName("");
    setStemsZipUrl(undefined);
    setFormError(null);
    setShowNewForm(false);
  };

  const handlePublishRemix = (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!remixTitle.trim()) {
      setRemixError("Veuillez indiquer un titre pour votre remix / réponse.");
      return;
    }

    const reply: StemRemixReply = {
      id: `remix-${Date.now()}`,
      title: remixTitle.trim(),
      note: remixNote.trim() || "Nouvelle version / modification.",
      authorPseudo: user.pseudo,
      authorExpression: user.expression,
      audioFileName: remixAudioName || undefined,
      audioUrl: remixAudioUrl,
      stemsZipName: remixZipName || undefined,
      stemsZipUrl: remixZipUrl,
      createdAt: new Date().toLocaleDateString("fr-FR"),
    };

    persistTracks(
      tracks.map((t) =>
        t.id === parentId ? { ...t, remixes: [...t.remixes, reply] } : t
      )
    );

    setRemixTitle("");
    setRemixNote("");
    setRemixAudioName("");
    setRemixAudioUrl(undefined);
    setRemixZipName("");
    setRemixZipUrl(undefined);
    setRemixError(null);
    setReplyingToId(null);
  };

  return (
    <div className="space-y-6">
      {/* En-tête clair & ergonomique */}
      <Card
        moduleTitle="SONS_COMMUNAUTÉ // ÉCOUTE_&_STEMS_REMIX"
        moduleMeta={`${tracks.length} PROJET(S) OUVERT(S)`}
        activeIndicator
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="font-mono text-xs font-bold uppercase text-brand-red">
              {"// 1. ÉCOUTER · 2. TÉLÉCHARGER LE .ZIP STEMS · 3. REMIXER & RÉPONDRE"}
            </div>
            <h1 className="font-sans text-2xl sm:text-3xl font-bold text-brand-black">
              Sons Communautaires &amp; Stems
            </h1>
            <p className="font-sans text-sm text-neutral-600 leading-relaxed">
              Déposez un morceau avec son pack <strong>.zip de stems</strong>{" "}
              (pistes séparées). N&apos;importe quel membre peut l&apos;écouter,
              télécharger les stems, les modifier dans sa DAW et poster sa
              version en réponse juste en dessous.
            </p>
          </div>

          <Button
            id="btn-new-stem-track"
            variant="primary"
            size="lg"
            onClick={handleOpenNewForm}
          >
            {user
              ? showNewForm
                ? "✕ FERMER"
                : "+ DÉPOSER UN SON + STEMS (.ZIP)"
              : "CONNEXION POUR DÉPOSER"}
          </Button>
        </div>
      </Card>

      {/* Formulaire de dépôt principal */}
      {showNewForm && user && (
        <Card
          moduleTitle={`NOUVEAU_PROJET_STEMS // @${user.pseudo.toUpperCase()}`}
          moduleMeta="AUDIO + ARCHIVE .ZIP"
          activeIndicator
        >
          <form onSubmit={handlePublishTrack} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label
                  htmlFor="stem-title"
                  className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                >
                  Titre du morceau *
                </label>
                <input
                  id="stem-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Anarchy Bassline Project"
                  className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                />
              </div>
              <div>
                <label
                  htmlFor="stem-bpm"
                  className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                >
                  BPM
                </label>
                <input
                  id="stem-bpm"
                  type="number"
                  min={50}
                  max={240}
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                />
              </div>
              <div>
                <label
                  htmlFor="stem-key"
                  className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                >
                  Tonalité
                </label>
                <input
                  id="stem-key"
                  type="text"
                  value={musicalKey}
                  onChange={(e) => setMusicalKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="stem-audio-file"
                  className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                >
                  1. Fichier d&apos;écoute (MP3 / WAV)
                </label>
                <input
                  id="stem-audio-file"
                  type="file"
                  accept=".mp3,.wav,audio/mpeg,audio/wav"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setAudioFileName(f.name);
                    setAudioUrl(URL.createObjectURL(f));
                    if (!title) setTitle(f.name.replace(/\.(mp3|wav)$/i, ""));
                  }}
                  className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-pearl font-mono text-xs"
                />
              </div>
              <div>
                <label
                  htmlFor="stem-zip-file"
                  className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                >
                  2. Pack de Stems indépendants (.ZIP)
                </label>
                <input
                  id="stem-zip-file"
                  type="file"
                  accept=".zip,.rar,.7z"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setStemsZipName(f.name);
                    setStemsZipUrl(URL.createObjectURL(f));
                  }}
                  className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-pearl font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="stem-genre"
                  className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                >
                  Style / Genre
                </label>
                <input
                  id="stem-genre"
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                />
              </div>
              <div>
                <label
                  htmlFor="stem-desc"
                  className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                >
                  Note pour les remixeurs
                </label>
                <input
                  id="stem-desc"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Stems kick/bass/lead séparés, amusez-vous !"
                  className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                />
              </div>
            </div>

            {formError && (
              <p className="font-mono text-xs font-bold text-brand-red">
                ⚠ {formError}
              </p>
            )}

            <Button type="submit" variant="primary" size="md">
              PUBLIER LE SON &amp; SES STEMS →
            </Button>
          </form>
        </Card>
      )}

      {/* Liste des Sons Communautaires */}
      {tracks.length === 0 ? (
        <Card moduleTitle="PROJETS_OUVERTS // VIDE" moduleMeta="0 SON">
          <div className="py-10 text-center space-y-3">
            <p className="font-sans text-base font-semibold text-brand-black">
              Aucun son communautaire déposé pour l&apos;instant.
            </p>
            <p className="font-sans text-sm text-neutral-600">
              Déposez un premier morceau avec son <strong>.zip de stems</strong>{" "}
              pour que la communauté puisse l&apos;écouter, le télécharger et
              proposer des remixes.
            </p>
            <Button variant="comic" size="md" onClick={handleOpenNewForm}>
              + DÉPOSER LE PREMIER SON
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {tracks.map((track) => (
            <Card
              key={track.id}
              moduleTitle={`${track.genre.toUpperCase()} // ${track.bpm} BPM · ${track.musicalKey}`}
              moduleMeta={`@${track.authorPseudo.toUpperCase()} · ${track.createdAt}`}
              activeIndicator
            >
              <div className="space-y-4">
                {/* En-tête du morceau */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <AvatarBD
                      name={track.authorPseudo}
                      expression={track.authorExpression}
                      size="md"
                      badgeText="STEMS"
                    />
                    <div>
                      <h2 className="font-sans text-xl font-bold text-brand-black">
                        {track.title}
                      </h2>
                      <p className="font-sans text-sm text-neutral-600">
                        {track.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        persistTracks(
                          tracks.map((t) =>
                            t.id === track.id ? { ...t, likes: t.likes + 1 } : t
                          )
                        )
                      }
                      className="px-3 py-1.5 rounded-lg border-2 border-black bg-brand-pearl font-mono text-xs font-bold"
                    >
                      ▲ {track.likes}
                    </button>

                    {track.stemsZipUrl ? (
                      <a href={track.stemsZipUrl} download={track.stemsZipName}>
                        <Button variant="comic" size="sm">
                          📦 TÉLÉCHARGER STEMS (.ZIP)
                        </Button>
                      </a>
                    ) : (
                      track.stemsZipName && (
                        <span className="px-2.5 py-1 rounded border border-neutral-300 bg-brand-pearl font-mono text-[11px]">
                          📦 {track.stemsZipName}
                        </span>
                      )
                    )}

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenRemixForm(track.id)}
                    >
                      ↳ REMIXER / RÉPONDRE
                    </Button>
                  </div>
                </div>

                {/* Lecteur audio direct */}
                {track.audioUrl && (
                  <div className="p-3 rounded-xl bg-brand-pearl border-2 border-black">
                    <audio controls src={track.audioUrl} className="w-full" />
                  </div>
                )}

                {/* Formulaire de réponse / remix */}
                {replyingToId === track.id && user && (
                  <form
                    onSubmit={(e) => handlePublishRemix(e, track.id)}
                    className="p-4 rounded-xl bg-brand-pearl border-2 border-black space-y-3"
                  >
                    <div className="font-mono text-xs font-bold uppercase text-brand-red">
                      ↳ DÉPOSER VOTRE REMIX / RÉPONSE (@{user.pseudo})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={remixTitle}
                        onChange={(e) => setRemixTitle(e.target.value)}
                        placeholder="Titre de votre version (ex: Acid Remix)"
                        className="px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                      />
                      <input
                        type="text"
                        value={remixNote}
                        onChange={(e) => setRemixNote(e.target.value)}
                        placeholder="Ce que vous avez modifié (ex: nouveau kick + synth)"
                        className="px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                      <div>
                        <span className="block text-[10px] font-bold mb-1">
                          Audio modifié (MP3 / WAV)
                        </span>
                        <input
                          type="file"
                          accept=".mp3,.wav,audio/mpeg,audio/wav"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            setRemixAudioName(f.name);
                            setRemixAudioUrl(URL.createObjectURL(f));
                          }}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold mb-1">
                          Vos nouveaux Stems (.ZIP, optionnel)
                        </span>
                        <input
                          type="file"
                          accept=".zip,.rar,.7z"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            setRemixZipName(f.name);
                            setRemixZipUrl(URL.createObjectURL(f));
                          }}
                          className="w-full"
                        />
                      </div>
                    </div>
                    {remixError && (
                      <p className="font-mono text-xs font-bold text-brand-red">
                        ⚠ {remixError}
                      </p>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="clinical"
                        size="sm"
                        onClick={() => setReplyingToId(null)}
                      >
                        ANNULER
                      </Button>
                      <Button type="submit" variant="primary" size="sm">
                        PUBLIER LA RÉPONSE →
                      </Button>
                    </div>
                  </form>
                )}

                {/* Chaîne des Remixes & Réponses */}
                {track.remixes.length > 0 && (
                  <div className="pt-3 border-t border-neutral-200 space-y-3">
                    <div className="font-mono text-xs font-bold uppercase text-neutral-600">
                      REMIXES &amp; RÉPONSES ({track.remixes.length})
                    </div>
                    <div className="space-y-2.5 pl-3 border-l-4 border-brand-red">
                      {track.remixes.map((r) => (
                        <div
                          key={r.id}
                          className="p-3 rounded-xl bg-brand-pearl border border-black space-y-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <AvatarBD
                                name={r.authorPseudo}
                                expression={r.authorExpression}
                                size="sm"
                                badgeText="REMIX"
                              />
                              <div>
                                <div className="font-sans text-sm font-bold text-brand-black">
                                  {r.title}
                                </div>
                                <div className="font-mono text-[11px] text-neutral-600">
                                  par @{r.authorPseudo} · {r.createdAt} —{" "}
                                  {r.note}
                                </div>
                              </div>
                            </div>
                            {r.stemsZipUrl && (
                              <a href={r.stemsZipUrl} download={r.stemsZipName}>
                                <Button variant="comic" size="sm">
                                  📦 STEMS (.ZIP)
                                </Button>
                              </a>
                            )}
                          </div>
                          {r.audioUrl && (
                            <audio
                              controls
                              src={r.audioUrl}
                              className="w-full"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

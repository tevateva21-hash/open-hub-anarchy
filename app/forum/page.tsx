"use client";

import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AvatarBD } from "@/components/ui/AvatarBD";
import { useAudioPlayer } from "@/components/audio/AudioPlayerContext";
import { useAuth } from "@/components/auth/AuthContext";
import {
  FORUM_THREADS,
  type AvatarExpression,
  type ForumBoard,
  type ForumThread,
  getPluginById,
  getSampleById,
  pluginToAudioTrack,
  sampleToAudioTrack,
} from "@/lib/openhub-data";

const BOARD_FILTERS: { id: ForumBoard; label: string; tag: string }[] = [
  { id: "ALL", label: "TOUS LES BOARDS", tag: "/all/" },
  { id: "DSP_DEV", label: "DSP_DEV", tag: "/dsp/" },
  { id: "VST_RELEASE", label: "VST_RELEASE", tag: "/vst/" },
  { id: "SAMPLES", label: "SAMPLES", tag: "/samples/" },
  { id: "SHOWCASE", label: "SHOWCASE", tag: "/showcase/" },
];

type ForumDrawer = "ANARCHY_OFFICIAL" | "COMMUNITY_FORUM";

/**
 * Page `/forum` — Imageboard modernisé à lignes alternées (`#FFFFFF` / `#F5F5F5`),
 * tiroirs Annonces Anarchy vs Discussions Communauté, avatars BD 3D (`AvatarBD`),
 * et création de sujets / réponses signés par le pseudo connecté.
 */
export default function ForumPage() {
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();
  const { user, openAuthModal } = useAuth();

  const [activeDrawer, setActiveDrawer] =
    useState<ForumDrawer>("COMMUNITY_FORUM");
  const [threads, setThreads] = useState<ForumThread[]>(FORUM_THREADS);
  const [selectedBoard, setSelectedBoard] = useState<ForumBoard>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedThreadIds, setExpandedThreadIds] = useState<Record<string, boolean>>({
    [FORUM_THREADS[0]?.id ?? "thr-dsp-01"]: true,
  });

  // Compositeur Nouveau Sujet
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBoard, setNewBoard] = useState<Exclude<ForumBoard, "ALL">>("DSP_DEV");
  const [newAuthor, setNewAuthor] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTrackId, setNewTrackId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Compositeurs Réponse Rapide par thread
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyAuthor, setReplyAuthor] = useState<Record<string, string>>({});
  const [replyErrors, setReplyErrors] = useState<Record<string, string>>({});

  const filteredThreads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return threads
      .filter((t) => {
        if (activeDrawer === "ANARCHY_OFFICIAL" && !t.pinned) return false;
        if (selectedBoard !== "ALL" && t.board !== selectedBoard) return false;
        if (!q) return true;
        return (
          t.title.toLowerCase().includes(q) ||
          t.content.toLowerCase().includes(q) ||
          t.author.toLowerCase().includes(q) ||
          t.tripcode.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));
  }, [threads, activeDrawer, selectedBoard, searchQuery]);

  const toggleExpand = (threadId: string) => {
    setExpandedThreadIds((prev) => ({
      ...prev,
      [threadId]: !prev[threadId],
    }));
  };

  const resolveAttachedTrack = (attachedTrackId?: string) => {
    if (!attachedTrackId) return null;
    const plugin = getPluginById(attachedTrackId);
    if (plugin) return pluginToAudioTrack(plugin);
    const sample = getSampleById(attachedTrackId);
    if (sample) return sampleToAudioTrack(sample);
    return null;
  };

  const handlePlayAttachedTrack = (attachedTrackId?: string) => {
    const track = resolveAttachedTrack(attachedTrackId);
    if (track) {
      playTrack(track);
    }
  };

  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = newTitle.trim();
    const cleanContent = newContent.trim();
    const cleanAuthor = newAuthor.trim() || "Anon_DSP";

    if (!cleanTitle || !cleanContent) {
      setFormError(
        "Le titre et le message ne peuvent pas être vides ou composés uniquement d'espaces."
      );
      return;
    }

    const expressions: AvatarExpression[] = [
      "spectateur-a",
      "spectateur-b",
      "dsp",
      "synth",
      "hyped",
    ];
    const pickedExpression =
      expressions[threads.length % expressions.length] ?? "spectateur-a";

    const created: ForumThread = {
      id: `thr-local-${Date.now()}`,
      board: newBoard,
      title: cleanTitle,
      author: cleanAuthor,
      tripcode: `!${cleanAuthor.slice(0, 4)}#${String(threads.length + 101)}`,
      badge: "MEMBER",
      avatarExpression: pickedExpression,
      createdAt: "À l'instant",
      lastBump: "À l'instant",
      views: 1,
      pinned: false,
      content: cleanContent,
      attachedTrackId: newTrackId.trim() || undefined,
      replies: [],
    };

    setThreads((prev) => [created, ...prev]);
    setExpandedThreadIds((prev) => ({ ...prev, [created.id]: true }));
    setNewTitle("");
    setNewContent("");
    setNewTrackId("");
    setFormError(null);
    setShowNewThreadForm(false);
  };

  const handleAddReply = (e: React.FormEvent, threadId: string) => {
    e.preventDefault();
    const cleanReply = (replyDrafts[threadId] ?? "").trim();
    const cleanAuthor = (replyAuthor[threadId] ?? "").trim() || "Anon_Audio";

    if (!cleanReply) {
      setReplyErrors((prev) => ({
        ...prev,
        [threadId]: "La réponse ne peut pas être vide.",
      }));
      return;
    }

    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id !== threadId) return thread;
        return {
          ...thread,
          lastBump: "À l'instant",
          views: thread.views + 1,
          replies: [
            ...thread.replies,
            {
              id: `rep-local-${Date.now()}`,
              author: cleanAuthor,
              tripcode: `!${cleanAuthor.slice(0, 4)}#live`,
              badge: "USER",
              avatarExpression: "spectateur-b",
              createdAt: "À l'instant",
              content: cleanReply,
            },
          ],
        };
      })
    );

    setReplyDrafts((prev) => ({ ...prev, [threadId]: "" }));
    setReplyErrors((prev) => {
      const next = { ...prev };
      delete next[threadId];
      return next;
    });
  };

  return (
    <div className="space-y-8">
      {/* En-tête Forum Imageboard */}
      <section aria-labelledby="forum-heading">
        <Card
          moduleTitle="COMMUNITY_FORUM // IMAGEBOARD_&_DSP_DISCUSSIONS"
          moduleMeta={`${threads.length} THREADS ACTIFS`}
          activeIndicator
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 font-mono text-xs text-brand-red font-bold uppercase">
                <span>{"// BOARDS: /DSP/ /VST/ /SAMPLES/ /SHOWCASE/"}</span>
              </div>
              <h1
                id="forum-heading"
                className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-brand-black"
              >
                Forum Technique &amp; Imageboard Open Hub
              </h1>
              <p className="font-sans text-sm text-neutral-600 leading-relaxed">
                Échangez sur l&apos;architecture DSP C++20/WebAudio, les builds
                VST3/CLAP et vos chaînes de mastering. Chaque fil supporte
                l&apos;écoute directe des pistes attachées dans le lecteur
                persistant.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {!user && (
                <Button variant="clinical" size="md" onClick={openAuthModal}>
                  CONNEXION (@PSEUDO)
                </Button>
              )}
              <Button
                id="btn-new-thread-toggle"
                variant="primary"
                size="md"
                onClick={() => setShowNewThreadForm((prev) => !prev)}
              >
                {showNewThreadForm ? "✕ FERMER ÉDITEUR" : "+ NOUVEAU SUJET"}
              </Button>
            </div>
          </div>

          {/* Tiroirs : Annonces Anarchy vs Discussions Communauté */}
          <div className="mt-5 pt-4 border-t border-neutral-200 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveDrawer("ANARCHY_OFFICIAL")}
              className={`px-3.5 py-2 rounded-lg border-2 font-mono text-xs font-bold transition-all ${
                activeDrawer === "ANARCHY_OFFICIAL"
                  ? "bg-brand-red text-white border-black shadow-comic-sm"
                  : "bg-brand-pearl text-brand-charcoal border-neutral-300 hover:border-black"
              }`}
            >
              ⚡ ANNONCES ANARCHY (OFFICIEL)
            </button>
            <button
              type="button"
              onClick={() => setActiveDrawer("COMMUNITY_FORUM")}
              className={`px-3.5 py-2 rounded-lg border-2 font-mono text-xs font-bold transition-all ${
                activeDrawer === "COMMUNITY_FORUM"
                  ? "bg-brand-black text-white border-black shadow-comic-sm"
                  : "bg-brand-pearl text-brand-charcoal border-neutral-300 hover:border-black"
              }`}
            >
              💬 DISCUSSIONS COMMUNAUTÉ ({threads.length})
            </button>
          </div>

          {/* Barre de filtres Boards & Recherche */}
          <div className="mt-4 pt-4 border-t border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {BOARD_FILTERS.map((board) => {
                const active = selectedBoard === board.id;
                return (
                  <button
                    key={board.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelectedBoard(board.id)}
                    className={[
                      "px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all border-2",
                      active
                        ? "bg-brand-black text-brand-white border-black shadow-comic-sm"
                        : "bg-brand-pearl text-brand-charcoal border-neutral-300 hover:border-black",
                    ].join(" ")}
                  >
                    <span className="text-brand-red mr-1">{board.tag}</span>
                    {board.label}
                  </button>
                );
              })}
            </div>

            <div className="w-full md:w-72">
              <label htmlFor="forum-search-input" className="sr-only">
                Rechercher un sujet ou tripcode
              </label>
              <input
                id="forum-search-input"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrer titre, auteur, !tripcode..."
                className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs text-brand-black focus:outline-none focus:border-brand-red"
              />
            </div>
          </div>
        </Card>
      </section>

      {/* Formulaire Nouveau Sujet */}
      {showNewThreadForm && (
        <section aria-label="Créer un nouveau sujet">
          <Card
            moduleTitle="NEW_THREAD // PUBLIER SUR L'IMAGEBOARD"
            moduleMeta="CLIENT_STATE"
            activeIndicator
          >
            <form onSubmit={handleCreateThread} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="new-thread-board"
                    className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                  >
                    Board
                  </label>
                  <select
                    id="new-thread-board"
                    value={newBoard}
                    onChange={(e) =>
                      setNewBoard(
                        e.target.value as Exclude<ForumBoard, "ALL">
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs font-bold"
                  >
                    <option value="DSP_DEV">DSP_DEV</option>
                    <option value="VST_RELEASE">VST_RELEASE</option>
                    <option value="SAMPLES">SAMPLES</option>
                    <option value="SHOWCASE">SHOWCASE</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="new-thread-author"
                    className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                  >
                    Pseudo / Tripcode
                  </label>
                  <input
                    id="new-thread-author"
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                  />
                </div>

                <div>
                  <label
                    htmlFor="new-thread-track"
                    className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                  >
                    Piste audio jointe (optionnel)
                  </label>
                  <select
                    id="new-thread-track"
                    value={newTrackId}
                    onChange={(e) => setNewTrackId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
                  >
                    <option value="">Aucune piste</option>
                    <option value="anr-vst-01">ANR-VST-01 Anaglyph Saturator</option>
                    <option value="anr-vst-03">ANR-VST-03 Spectateur 3D</option>
                    <option value="smp-anarchy-01">Anarchy.wav (140 BPM)</option>
                    <option value="smp-tribal-06">tribal -136.wav (136 BPM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="new-thread-title"
                  className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                >
                  Titre du sujet
                </label>
                <input
                  id="new-thread-title"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: [DSP] Optimisation filtre polyphasé 48kHz..."
                  className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-sans text-sm font-semibold"
                />
              </div>

              <div>
                <label
                  htmlFor="new-thread-content"
                  className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                >
                  Message
                </label>
                <textarea
                  id="new-thread-content"
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Partagez vos mesures, patches ou retours..."
                  className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-sans text-sm"
                />
              </div>

              {formError && (
                <p role="alert" className="font-mono text-xs font-bold text-brand-red">
                  {formError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="clinical"
                  size="sm"
                  onClick={() => setShowNewThreadForm(false)}
                >
                  ANNULER
                </Button>
                <Button type="submit" variant="primary" size="md">
                  PUBLIER LE SUJET
                </Button>
              </div>
            </form>
          </Card>
        </section>
      )}

      {/* Liste des fils — Lignes alternées #FFFFFF (bg-brand-white) / #F5F5F5 (bg-brand-pearl) */}
      <section aria-label="Liste des discussions du forum" className="space-y-4">
        {filteredThreads.length === 0 ? (
          <Card moduleTitle="EMPTY_BOARD // 0 RÉSULTAT" moduleMeta="FILTRE ACTIF">
            <div className="py-8 text-center space-y-3">
              <p className="font-mono text-sm font-bold text-brand-black">
                Aucun fil de discussion ne correspond à votre recherche.
              </p>
              <Button
                variant="clinical"
                size="sm"
                onClick={() => {
                  setSelectedBoard("ALL");
                  setSearchQuery("");
                }}
              >
                RÉINITIALISER LES FILTRES
              </Button>
            </div>
          </Card>
        ) : (
          <div className="border-2 border-black rounded-xl overflow-hidden shadow-comic bg-brand-white divide-y divide-neutral-200">
            {filteredThreads.map((thread, idx) => {
              const isExpanded = Boolean(expandedThreadIds[thread.id]);
              const attachedTrack = resolveAttachedTrack(thread.attachedTrackId);
              const isTrackActive =
                attachedTrack && currentTrack?.id === attachedTrack.id && isPlaying;
              const rowBg =
                idx % 2 === 0 ? "bg-brand-white" : "bg-brand-pearl";

              return (
                <article
                  key={thread.id}
                  id={`forum-thread-${thread.id}`}
                  className={`${rowBg} p-4 sm:p-5 transition-colors`}
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-start gap-3 shrink-0">
                      <AvatarBD
                        name={thread.author}
                        expression={thread.avatarExpression}
                        size="md"
                        badgeText={thread.badge}
                        anaglyphRing={Boolean(thread.pinned)}
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Métadonnées Roboto Mono */}
                      <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-neutral-600">
                        <span className="px-2 py-0.5 rounded bg-brand-black text-brand-white font-bold">
                          [{thread.board}]
                        </span>
                        {thread.pinned && (
                          <span className="px-2 py-0.5 rounded bg-brand-red text-brand-white font-bold">
                            PINNED
                          </span>
                        )}
                        <span className="font-bold text-brand-black">
                          {thread.author}
                        </span>
                        <span className="text-brand-red font-bold">
                          {thread.tripcode}
                        </span>
                        <span>•</span>
                        <span>{thread.createdAt}</span>
                        <span>•</span>
                        <span>{thread.views} views</span>
                        <span>•</span>
                        <span>Bump: {thread.lastBump}</span>
                      </div>

                      {/* Titre en Inter Semi-Bold / Bold */}
                      <h2 className="font-sans text-base sm:text-lg font-semibold text-brand-black leading-snug">
                        <button
                          type="button"
                          onClick={() => toggleExpand(thread.id)}
                          aria-expanded={isExpanded}
                          className="text-left hover:text-brand-red transition-colors focus:outline-none"
                        >
                          {thread.title}
                        </button>
                      </h2>

                      {/* Corps du post */}
                      <p className="font-sans text-sm text-brand-charcoal/90 leading-relaxed">
                        {thread.content}
                      </p>

                      {/* Barre d'actions du thread */}
                      <div className="pt-2 flex flex-wrap items-center gap-2.5">
                        <Button
                          variant="clinical"
                          size="sm"
                          onClick={() => toggleExpand(thread.id)}
                        >
                          {isExpanded
                            ? `▾ MASQUER (${thread.replies.length} RÉPONSES)`
                            : `▸ RÉPONSES (${thread.replies.length})`}
                        </Button>

                        {attachedTrack && (
                          <Button
                            variant={isTrackActive ? "primary" : "comic"}
                            size="sm"
                            onClick={() =>
                              handlePlayAttachedTrack(thread.attachedTrackId)
                            }
                          >
                            {isTrackActive
                              ? `❚❚ EN LECTURE : ${attachedTrack.title}`
                              : `▶ ÉCOUTER : ${attachedTrack.title}`}
                          </Button>
                        )}
                      </div>

                      {/* Réponses + Compositeur Quick Reply */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-neutral-200 space-y-3">
                          {thread.replies.map((reply, rIdx) => {
                            const replyTrack = resolveAttachedTrack(
                              reply.attachedTrackId
                            );
                            const replyRowBg =
                              rIdx % 2 === 0
                                ? "bg-brand-pearl"
                                : "bg-brand-white";
                            return (
                              <div
                                key={reply.id}
                                className={`${replyRowBg} border border-neutral-200 border-l-4 border-l-brand-black rounded-lg p-3 flex flex-col sm:flex-row gap-3`}
                              >
                                <AvatarBD
                                  name={reply.author}
                                  expression={reply.avatarExpression}
                                  size="sm"
                                  badgeText={reply.badge}
                                />
                                <div className="flex-1 min-w-0 space-y-1">
                                  <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-neutral-600">
                                    <span className="font-bold text-brand-black">
                                      {reply.author}
                                    </span>
                                    <span className="text-brand-red font-bold">
                                      {reply.tripcode}
                                    </span>
                                    <span>•</span>
                                    <span>{reply.createdAt}</span>
                                  </div>
                                  <p className="font-sans text-xs sm:text-sm text-brand-charcoal leading-relaxed">
                                    {reply.content}
                                  </p>
                                  {replyTrack && (
                                    <div className="pt-1">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handlePlayAttachedTrack(
                                            reply.attachedTrackId
                                          )
                                        }
                                        className="font-mono text-[11px] font-bold text-brand-red hover:underline"
                                      >
                                        ▶ Lire piste jointe : {replyTrack.title}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {/* Quick Reply */}
                          <form
                            onSubmit={(e) => handleAddReply(e, thread.id)}
                            className="p-3 rounded-lg bg-brand-white border-2 border-black space-y-2.5"
                          >
                            <div className="font-mono text-[10px] font-bold uppercase text-neutral-500">
                              {"// QUICK_REPLY → "}
                              {thread.id}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                              <input
                                type="text"
                                aria-label="Pseudo pour la réponse"
                                value={replyAuthor[thread.id] ?? ""}
                                onChange={(e) =>
                                  setReplyAuthor((prev) => ({
                                    ...prev,
                                    [thread.id]: e.target.value,
                                  }))
                                }
                                placeholder="Pseudo (optionnel)"
                                className="sm:col-span-1 px-2.5 py-1.5 rounded border border-neutral-300 font-mono text-xs"
                              />
                              <input
                                type="text"
                                aria-label="Contenu de la réponse"
                                value={replyDrafts[thread.id] ?? ""}
                                onChange={(e) =>
                                  setReplyDrafts((prev) => ({
                                    ...prev,
                                    [thread.id]: e.target.value,
                                  }))
                                }
                                placeholder="Votre réponse technique..."
                                className="sm:col-span-2 px-2.5 py-1.5 rounded border border-neutral-300 font-sans text-xs"
                              />
                              <Button
                                type="submit"
                                variant="primary"
                                size="sm"
                                className="sm:col-span-1"
                              >
                                RÉPONDRE
                              </Button>
                            </div>
                            {replyErrors[thread.id] && (
                              <p
                                role="alert"
                                className="font-mono text-[11px] font-bold text-brand-red"
                              >
                                {replyErrors[thread.id]}
                              </p>
                            )}
                          </form>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

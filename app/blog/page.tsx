"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AvatarBD } from "@/components/ui/AvatarBD";
import { useAuth } from "@/components/auth/AuthContext";
import { BLOG_POSTS, type AvatarExpression } from "@/lib/openhub-data";

type BlogDrawer = "ANARCHY_OFFICIAL" | "COMMUNITY_BLOGS";

interface CommunityArticle {
  id: string;
  title: string;
  kind: "BLOG" | "DOC";
  authorPseudo: string;
  authorExpression: AvatarExpression;
  summary: string;
  content: string;
  codeSnippet?: string;
  createdAt: string;
}

const BLOG_STORAGE_KEY = "openhub_community_blog_v1";

/**
 * Page `/blog` — Avec 2 tiroirs :
 * 1. Blog & Docs Anarchy (Officiels)
 * 2. Blog & Docs Communauté (publication libre par les membres connectés)
 */
export default function BlogIndexPage() {
  const { user, openAuthModal } = useAuth();
  const [activeDrawer, setActiveDrawer] =
    useState<BlogDrawer>("ANARCHY_OFFICIAL");
  const [communityPosts, setCommunityPosts] = useState<CommunityArticle[]>([]);
  const [showComposer, setShowComposer] = useState(false);

  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<"BLOG" | "DOC">("BLOG");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(BLOG_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CommunityArticle[];
        if (Array.isArray(parsed)) setCommunityPosts(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const persistPosts = (next: CommunityArticle[]) => {
    setCommunityPosts(next);
    try {
      window.localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const handleOpenComposer = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setShowComposer((prev) => !prev);
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!title.trim() || !content.trim()) {
      setError("Le titre et le contenu de l'article sont obligatoires.");
      return;
    }

    const created: CommunityArticle = {
      id: `blog-comm-${Date.now()}`,
      title: title.trim(),
      kind,
      authorPseudo: user.pseudo,
      authorExpression: user.expression,
      summary: summary.trim() || content.trim().slice(0, 140),
      content: content.trim(),
      codeSnippet: codeSnippet.trim() || undefined,
      createdAt: new Date().toLocaleDateString("fr-FR"),
    };

    persistPosts([created, ...communityPosts]);
    setTitle("");
    setSummary("");
    setContent("");
    setCodeSnippet("");
    setError(null);
    setShowComposer(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="space-y-3">
        <div className="font-mono text-xs text-brand-red font-bold uppercase">
          {"// BLOG_&_DOCS"}
        </div>
        <h1 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-brand-black">
          Blog &amp; Documentation
        </h1>

        {/* Petits tiroirs Officiels vs Communauté */}
        <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
          <button
            id="tab-blog-official"
            type="button"
            onClick={() => setActiveDrawer("ANARCHY_OFFICIAL")}
            className={`px-4 py-2 rounded-lg border-2 font-bold transition-all ${
              activeDrawer === "ANARCHY_OFFICIAL"
                ? "bg-brand-red text-white border-black shadow-comic-sm"
                : "bg-brand-white text-brand-charcoal border-neutral-300 hover:border-black"
            }`}
          >
            ⚡ BLOG ANARCHY (OFFICIEL)
          </button>
          <button
            id="tab-blog-community"
            type="button"
            onClick={() => setActiveDrawer("COMMUNITY_BLOGS")}
            className={`px-4 py-2 rounded-lg border-2 font-bold transition-all ${
              activeDrawer === "COMMUNITY_BLOGS"
                ? "bg-black text-white border-black shadow-comic-sm"
                : "bg-brand-white text-brand-charcoal border-neutral-300 hover:border-black"
            }`}
          >
            ✍ BLOG &amp; DOCS COMMUNAUTÉ ({communityPosts.length})
          </button>
        </div>
      </header>

      {/* TIROIR 1 : OFFICIEL ANARCHY */}
      {activeDrawer === "ANARCHY_OFFICIAL" && (
        <section aria-label="Blog officiel Anarchy">
          {BLOG_POSTS.length === 0 ? (
            <Card
              moduleTitle="BLOG_ANARCHY // OFFICIEL"
              moduleMeta="0 ARTICLE PUBLIÉ"
            >
              <div className="py-8 text-center space-y-2">
                <p className="font-sans text-base font-semibold text-brand-black">
                  Aucun article officiel Anarchy publié pour l&apos;instant.
                </p>
                <p className="font-sans text-sm text-neutral-600">
                  Basculez sur le tiroir{" "}
                  <strong>Blog &amp; Docs Communauté</strong> pour lire ou
                  publier des articles communautaires.
                </p>
              </div>
            </Card>
          ) : null}
        </section>
      )}

      {/* TIROIR 2 : COMMUNAUTÉ */}
      {activeDrawer === "COMMUNITY_BLOGS" && (
        <section aria-label="Blog et documentation de la communauté" className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <p className="font-sans text-sm text-neutral-600">
              Partagez vos tutoriels DSP, documentations VST ou notes de
              production.
            </p>
            <Button
              id="btn-blog-new-post"
              variant="primary"
              size="sm"
              onClick={handleOpenComposer}
            >
              {user
                ? showComposer
                  ? "✕ FERMER"
                  : "+ ÉCRIRE UN ARTICLE / DOC"
                : "CONNEXION POUR ÉCRIRE"}
            </Button>
          </div>

          {showComposer && user && (
            <Card
              moduleTitle={`NOUVEL_ARTICLE // @${user.pseudo.toUpperCase()}`}
              moduleMeta="COMMUNAUTÉ"
              activeIndicator
            >
              <form onSubmit={handlePublish} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="blog-title"
                      className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                    >
                      Titre
                    </label>
                    <input
                      id="blog-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Guide filtre passe-bas résonant"
                      className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-sans text-sm font-semibold"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label
                      htmlFor="blog-kind"
                      className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                    >
                      Type
                    </label>
                    <select
                      id="blog-kind"
                      value={kind}
                      onChange={(e) =>
                        setKind(e.target.value as "BLOG" | "DOC")
                      }
                      className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-mono text-xs font-bold"
                    >
                      <option value="BLOG">BLOG</option>
                      <option value="DOC">DOC</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="blog-summary"
                    className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                  >
                    Résumé (optionnel)
                  </label>
                  <input
                    id="blog-summary"
                    type="text"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-sans text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="blog-content"
                    className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                  >
                    Contenu
                  </label>
                  <textarea
                    id="blog-content"
                    rows={5}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-white font-sans text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="blog-code"
                    className="block font-mono text-[11px] font-bold uppercase text-neutral-600 mb-1"
                  >
                    Extrait de code / formule (optionnel)
                  </label>
                  <textarea
                    id="blog-code"
                    rows={3}
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border-2 border-black bg-brand-pearl font-mono text-xs"
                  />
                </div>

                {error && (
                  <p role="alert" className="font-mono text-xs font-bold text-brand-red">
                    {error}
                  </p>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="clinical"
                    size="sm"
                    onClick={() => setShowComposer(false)}
                  >
                    ANNULER
                  </Button>
                  <Button type="submit" variant="primary" size="md">
                    PUBLIER
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {communityPosts.length === 0 ? (
            <Card moduleTitle="COMMUNAUTÉ // VIDE" moduleMeta="0 PUBLICATION">
              <div className="py-8 text-center space-y-2">
                <p className="font-sans text-base font-semibold text-brand-black">
                  Aucun article communautaire publié pour l&apos;instant.
                </p>
                <p className="font-sans text-sm text-neutral-600">
                  Soyez le premier à publier un article ou une documentation !
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-5">
              {communityPosts.map((post) => (
                <Card
                  key={post.id}
                  moduleTitle={`${post.kind} // @${post.authorPseudo.toUpperCase()}`}
                  moduleMeta={post.createdAt}
                  activeIndicator
                >
                  <article className="space-y-3">
                    <div className="flex items-center gap-3">
                      <AvatarBD
                        name={post.authorPseudo}
                        expression={post.authorExpression}
                        size="sm"
                        badgeText={post.kind}
                      />
                      <div>
                        <h2 className="font-sans text-xl font-bold text-brand-black">
                          {post.title}
                        </h2>
                        <div className="font-mono text-[11px] text-neutral-500">
                          Par @{post.authorPseudo} • {post.createdAt}
                        </div>
                      </div>
                    </div>

                    <p className="font-sans text-sm text-brand-charcoal leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>

                    {post.codeSnippet && (
                      <pre className="border-l-4 border-brand-red bg-brand-pearl p-3 rounded-r-lg overflow-x-auto font-mono text-xs text-brand-black">
                        <code>{post.codeSnippet}</code>
                      </pre>
                    )}
                  </article>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

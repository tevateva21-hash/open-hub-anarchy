"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AvatarBD } from "@/components/ui/AvatarBD";
import { useAudioPlayer } from "@/components/audio/AudioPlayerContext";
import {
  getBlogPostBySlug,
  getPluginById,
  pluginToAudioTrack,
} from "@/lib/openhub-data";

/**
 * Page `/blog/[slug]` — Lecteur d'article technique mono-colonne (`max-w-3xl mx-auto`).
 * Inclut encadrés Rouge Cinéma (`border-l-4 border-brand-red`), blocs code `Roboto Mono`
 * avec copie en 1 clic, et écoute directe de la démonstration DSP associée.
 */
export default function BlogArticlePage() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const post = getBlogPostBySlug(slug);

  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();
  const [copiedCode, setCopiedCode] = useState(false);

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <Card
          moduleTitle="404 // ARTICLE_NOT_FOUND"
          moduleMeta="BLOG_INDEX"
          activeIndicator
        >
          <div className="space-y-4 py-4">
            <h1 className="font-sans text-2xl font-bold text-brand-black">
              Article introuvable
            </h1>
            <p className="font-sans text-sm text-neutral-600">
              L&apos;article demandé ({slug || "inconnu"}) n&apos;existe pas ou
              a été déplacé dans les archives Open Hub.
            </p>
            <Link href="/blog">
              <Button variant="primary" size="md">
                ← RETOUR À L&apos;INDEX DU BLOG
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const relatedPlugin = post.relatedPluginId
    ? getPluginById(post.relatedPluginId)
    : undefined;
  const relatedTrack = relatedPlugin ? pluginToAudioTrack(relatedPlugin) : null;
  const isRelatedPlaying =
    relatedTrack && currentTrack?.id === relatedTrack.id && isPlaying;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(post.codeSnippet.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      setCopiedCode(false);
    }
  };

  return (
    <article className="max-w-3xl mx-auto space-y-8">
      {/* Navigation retour */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/blog">
          <Button variant="clinical" size="sm">
            ← RETOUR AU BLOG
          </Button>
        </Link>

        <div className="font-mono text-xs text-neutral-500">
          <span>{post.publishedAt}</span>
          <span className="mx-2">•</span>
          <span className="text-brand-red font-bold">
            {post.readingTimeMin} MIN DE LECTURE
          </span>
        </div>
      </div>

      {/* En-tête de l'article */}
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-brand-white border border-neutral-200 font-mono text-xs font-bold text-brand-red">
          <span>{post.category}</span>
        </div>

        <h1 className="font-sans text-2xl sm:text-4xl font-bold tracking-tight text-brand-black leading-tight">
          {post.title}
        </h1>

        <p className="font-sans text-base sm:text-lg text-neutral-600 leading-relaxed">
          {post.subtitle}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-y border-neutral-200 py-4">
          <div className="flex items-center gap-3">
            <AvatarBD
              name={post.author}
              expression={post.avatarExpression}
              size="md"
              badgeText={post.authorBadge}
              anaglyphRing
            />
            <div>
              <div className="font-sans text-sm font-bold text-brand-black">
                {post.author}
              </div>
              <div className="font-mono text-xs text-neutral-500">
                {post.authorRole}
              </div>
            </div>
          </div>

          {relatedTrack && (
            <Button
              id="btn-blog-play-dsp"
              variant={isRelatedPlaying ? "primary" : "comic"}
              size="sm"
              onClick={() => playTrack(relatedTrack)}
            >
              {isRelatedPlaying
                ? `❚❚ PAUSE DÉMO (${relatedPlugin?.code})`
                : `▶ ÉCOUTER DÉMO DSP (${relatedPlugin?.code})`}
            </Button>
          )}
        </div>
      </header>

      {/* Citation / Callout encadrée à gauche en Rouge Cinéma #FF1B24 */}
      <blockquote className="border-l-4 border-brand-red bg-brand-white p-5 rounded-r-xl shadow-clinical font-sans text-base italic text-brand-black">
        {post.quoteCallout}
      </blockquote>

      {/* Résumé */}
      <p className="font-sans text-base text-brand-charcoal leading-relaxed">
        {post.summary}
      </p>

      {/* Sections techniques */}
      <div className="space-y-8">
        {post.sections.map((section) => (
          <section key={section.heading} className="space-y-3">
            <h2 className="font-sans text-xl sm:text-2xl font-bold text-brand-black">
              {section.heading}
            </h2>
            {section.paragraphs.map((p, pIdx) => (
              <p
                key={pIdx}
                className="font-sans text-sm sm:text-base text-brand-charcoal/90 leading-relaxed"
              >
                {p}
              </p>
            ))}
            {section.formulaOrTip && (
              <div className="border-l-4 border-brand-red bg-brand-white px-4 py-3 rounded-r-lg font-mono text-xs sm:text-sm text-brand-black overflow-x-auto">
                {section.formulaOrTip}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Bloc Code DSP Roboto Mono avec copie */}
      <Card
        moduleTitle={post.codeSnippet.title}
        moduleMeta={post.codeSnippet.language.toUpperCase()}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-neutral-500">
              Implémentation de référence (Roboto Mono)
            </span>
            <Button variant="clinical" size="sm" onClick={handleCopyCode}>
              {copiedCode ? "✓ COPIÉ" : "COPIER LE CODE"}
            </Button>
          </div>
          <pre className="border-l-4 border-brand-red bg-brand-pearl p-4 rounded-r-lg overflow-x-auto font-mono text-xs text-brand-black leading-relaxed">
            <code>{post.codeSnippet.code}</code>
          </pre>
        </div>
      </Card>

      {/* Lien vers le plugin VST associé */}
      {relatedPlugin && post.relatedPluginId && (
        <Card
          moduleTitle="RELATED_PLUGIN // TÉLÉCHARGEMENT & RACK FIGMA"
          moduleMeta={relatedPlugin.code}
          activeIndicator
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AvatarBD
                name={relatedPlugin.name}
                expression={relatedPlugin.avatarExpression}
                size="md"
                badgeText={relatedPlugin.authorBadge}
              />
              <div>
                <div className="font-sans text-base font-bold text-brand-black">
                  {relatedPlugin.name} ({relatedPlugin.version})
                </div>
                <div className="font-mono text-xs text-neutral-500">
                  {relatedPlugin.formats.join(" / ")} •{" "}
                  {relatedPlugin.metrics.license}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="comic"
                size="sm"
                onClick={() => playTrack(pluginToAudioTrack(relatedPlugin))}
              >
                ▶ TEST_SIGNAL
              </Button>
              <Link href={`/vst/${post.relatedPluginId}`}>
                <Button variant="primary" size="sm">
                  OUVRIR FICHE PLUGIN →
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}
    </article>
  );
}

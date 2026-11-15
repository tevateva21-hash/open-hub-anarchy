"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AvatarBD } from "@/components/ui/AvatarBD";
import { BLOG_POSTS, type BlogPost } from "@/lib/openhub-data";

type BlogCategoryFilter = "ALL" | BlogPost["category"];

const CATEGORY_FILTERS: { id: BlogCategoryFilter; label: string }[] = [
  { id: "ALL", label: "TOUS LES ARTICLES" },
  { id: "DSP_WHITE_PAPER", label: "DSP_WHITE_PAPER" },
  { id: "FIGMA_DESIGN_SYSTEM", label: "FIGMA_DESIGN_SYSTEM" },
  { id: "VST_ARCHITECTURE", label: "VST_ARCHITECTURE" },
  { id: "RELEASE_NOTES", label: "RELEASE_NOTES" },
];

/**
 * Page `/blog` — Index éditorial mono-colonne épuré (`max-w-3xl mx-auto`)
 * regroupant les livres blancs DSP, spécifications Figma et notes de version.
 */
export default function BlogIndexPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<BlogCategoryFilter>("ALL");

  const filteredPosts = useMemo(() => {
    if (selectedCategory === "ALL") return BLOG_POSTS;
    return BLOG_POSTS.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* En-tête éditorial */}
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 font-mono text-xs text-brand-red font-bold uppercase">
          <span>{"// BLOG_&_DSP_DOCUMENTATION"}</span>
        </div>
        <h1 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-brand-black">
          Recherche DSP, Design System &amp; Documentation Open Hub
        </h1>
        <p className="font-sans text-base text-neutral-600 leading-relaxed">
          Articles techniques, mathématiques du signal audio (ADAA, FDN,
          Ring-Buffers Lock-Free) et spécifications du Figma UI Kit hybride
          Clinique / BD 3D.
        </p>

        {/* Filtres par catégorie */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {CATEGORY_FILTERS.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedCategory(cat.id)}
                className={[
                  "px-3 py-1.5 rounded-lg font-mono text-xs font-bold border-2 transition-all",
                  active
                    ? "bg-brand-red text-brand-white border-black shadow-comic-sm"
                    : "bg-brand-white text-brand-charcoal border-neutral-300 hover:border-black",
                ].join(" ")}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Liste des articles en colonne unique */}
      <section aria-label="Liste des articles techniques" className="space-y-6">
        {filteredPosts.map((post) => (
          <Card
            key={post.slug}
            moduleTitle={post.category}
            moduleMeta={`${post.publishedAt} • ${post.readingTimeMin} MIN`}
            activeIndicator
          >
            <article className="space-y-4">
              <div className="flex items-center gap-3">
                <AvatarBD
                  name={post.author}
                  expression={post.avatarExpression}
                  size="sm"
                  badgeText={post.authorBadge}
                />
                <div className="font-mono text-xs">
                  <div className="font-bold text-brand-black">{post.author}</div>
                  <div className="text-[11px] text-neutral-500">
                    {post.authorRole}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <h2 className="font-sans text-xl sm:text-2xl font-bold text-brand-black leading-snug">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:text-brand-red transition-colors"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="font-sans text-sm text-neutral-600">
                  {post.subtitle}
                </p>
              </div>

              <blockquote className="border-l-4 border-brand-red bg-brand-pearl/70 px-4 py-3 rounded-r-lg font-sans text-sm italic text-brand-charcoal">
                {post.quoteCallout}
              </blockquote>

              <p className="font-sans text-sm text-brand-charcoal/90 leading-relaxed">
                {post.summary}
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <Link href={`/blog/${post.slug}`}>
                  <Button variant="primary" size="sm">
                    LIRE L&apos;ARTICLE COMPLET →
                  </Button>
                </Link>

                {post.relatedPluginId && (
                  <Link
                    href={`/vst/${post.relatedPluginId}`}
                    className="font-mono text-xs font-bold text-brand-charcoal hover:text-brand-red underline underline-offset-4"
                  >
                    Plugin associé : {post.relatedPluginId.toUpperCase()}
                  </Link>
                )}
              </div>
            </article>
          </Card>
        ))}
      </section>
    </div>
  );
}

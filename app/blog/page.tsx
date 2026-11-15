"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { BLOG_POSTS } from "@/lib/openhub-data";

/**
 * Page `/blog` — Espace Blog & Documentation vierge par défaut,
 * prêt à être rempli par l'auteur et la communauté.
 */
export default function BlogIndexPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header className="space-y-2">
        <div className="font-mono text-xs text-brand-red font-bold uppercase">
          {"// BLOG_&_DOCS"}
        </div>
        <h1 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-brand-black">
          Blog &amp; Documentation
        </h1>
        <p className="font-sans text-base text-neutral-600">
          Espace éditorial et documentaire prêt pour vos propres articles et
          guides communautaires.
        </p>
      </header>

      {BLOG_POSTS.length === 0 ? (
        <Card
          moduleTitle="BLOG_&_DOCS // VIDE"
          moduleMeta="0 ARTICLE PUBLIÉ"
        >
          <div className="py-8 text-center space-y-2">
            <p className="font-sans text-base font-semibold text-brand-black">
              Aucun article publié pour l&apos;instant.
            </p>
            <p className="font-sans text-sm text-neutral-600">
              Cet espace a été vidé pour vous permettre d&apos;y publier vos
              propres articles et documentations techniques.
            </p>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

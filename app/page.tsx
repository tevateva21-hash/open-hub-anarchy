"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AvatarBD } from "@/components/ui/AvatarBD";
import { VST_PLUGINS } from "@/lib/openhub-data";

/**
 * Page d'accueil `/` — VST Hub.
 * Affiche un état communautaire épuré tant que les plugins du dépôt GitHub
 * `VST plugin` ne sont pas encore importés, tout en mettant en avant
 * le studio Anarchy Visual Design déjà disponible.
 */
export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* En-tête VST Hub */}
      <section aria-labelledby="vst-hub-heading">
        <Card
          moduleTitle="VST_HUB // OPEN_SOURCE_AUDIO_PLUGINS"
          moduleMeta="COMMUNAUTÉ ANARCHY"
          activeIndicator
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 font-mono text-xs text-brand-red font-bold uppercase">
                <span>{"// VST3 · CLAP · AU"}</span>
              </div>
              <h1
                id="vst-hub-heading"
                className="font-sans text-2xl sm:text-4xl font-bold tracking-tight text-brand-black"
              >
                Open Hub — Espace Plugins VST
              </h1>
              <p className="font-sans text-sm sm:text-base text-neutral-600 leading-relaxed">
                Plateforme communautaire open-source dédiée aux plugins VST, aux
                samples, à la radio et au studio visuel audio-réactif{" "}
                <strong className="text-brand-black">
                  Anarchy Visual Design
                </strong>
                .
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <AvatarBD
                name="Open Hub Lead"
                expression="spectateur-a"
                size="lg"
                badgeText="3D"
                anaglyphRing
              />
            </div>
          </div>
        </Card>
      </section>

      {/* État vide VST Hub (prêt pour import depuis le dépôt GitHub `VST plugin`) */}
      <section aria-label="Catalogue VST">
        {VST_PLUGINS.length === 0 ? (
          <Card
            moduleTitle="CATALOGUE_VST // EN ATTENTE D'IMPORT GITHUB"
            moduleMeta="0 PLUGIN PUBLIÉ"
          >
            <div className="py-6 space-y-4">
              <h2 className="font-sans text-lg font-bold text-brand-black">
                Aucun plugin VST n&apos;est encore importé ici
              </h2>
              <p className="font-sans text-sm text-neutral-600 max-w-2xl leading-relaxed">
                Le catalogue est volontairement vierge afin d&apos;accueillir
                exclusivement les vrais plugins de votre dépôt GitHub{" "}
                <code className="font-mono text-xs bg-brand-pearl px-1.5 py-0.5 rounded border border-neutral-200 text-brand-black">
                  VST plugin
                </code>{" "}
                et les contributions de la communauté.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link href="/anarchy-visual-design">
                  <Button variant="primary" size="md">
                    OUVRIR ANARCHY VISUAL DESIGN →
                  </Button>
                </Link>
                <Link href="/radio">
                  <Button variant="comic" size="md">
                    OUVRIR LA RADIO
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ) : null}
      </section>

      {/* Passerelle directe vers Anarchy Visual Design (le module créé et complet) */}
      <section aria-label="Anarchy Visual Design Studio">
        <Card
          moduleTitle="ANARCHY_VISUAL_DESIGN // STUDIO_19_FADERS"
          moduleMeta="MODULE ACTIF"
          activeIndicator
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h2 className="font-sans text-xl font-bold text-brand-black">
                Studio Anarchy Visual Design V2
              </h2>
              <p className="font-sans text-sm text-neutral-600 leading-relaxed">
                Générateur visuel audio-réactif intégré depuis{" "}
                <code className="font-mono text-xs text-brand-black">
                  tevateva21-hash/anarchy-visual-engine
                </code>{" "}
                : console à 19 faders, 5 scènes (dont Techno Therapy), 7
                palettes avec morphing, Kick Blackout, Anaglyph 3D, Pendulum
                Cam, analyse FFT locale MP3/WAV et export PNG 1280×720.
              </p>
            </div>
            <Link href="/anarchy-visual-design" className="shrink-0">
              <Button variant="comic" size="lg">
                LANCER LE STUDIO →
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}

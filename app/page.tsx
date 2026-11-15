"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AvatarBD } from "@/components/ui/AvatarBD";
import { VST_PLUGINS } from "@/lib/openhub-data";

type VstDrawer = "ANARCHY_VSTSPLUGIN" | "COMMUNITY_VST";

/**
 * Page d'accueil `/` — VST Hub avec 2 tiroirs :
 * 1. Plugins Anarchy (lié au dépôt `tevateva21-hash/vstsplugin`)
 * 2. Plugins Communauté
 */
export default function HomePage() {
  const [activeDrawer, setActiveDrawer] =
    useState<VstDrawer>("ANARCHY_VSTSPLUGIN");

  return (
    <div className="space-y-8">
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

      {/* Petits tiroirs VST Anarchy / VST Communauté */}
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <button
          id="tab-vst-anarchy"
          type="button"
          onClick={() => setActiveDrawer("ANARCHY_VSTSPLUGIN")}
          className={`px-4 py-2 rounded-lg border-2 font-bold transition-all ${
            activeDrawer === "ANARCHY_VSTSPLUGIN"
              ? "bg-brand-red text-white border-black shadow-comic-sm"
              : "bg-brand-white text-brand-charcoal border-neutral-300 hover:border-black"
          }`}
        >
          ⚡ VST ANARCHY (vstsplugin)
        </button>
        <button
          id="tab-vst-community"
          type="button"
          onClick={() => setActiveDrawer("COMMUNITY_VST")}
          className={`px-4 py-2 rounded-lg border-2 font-bold transition-all ${
            activeDrawer === "COMMUNITY_VST"
              ? "bg-black text-white border-black shadow-comic-sm"
              : "bg-brand-white text-brand-charcoal border-neutral-300 hover:border-black"
          }`}
        >
          🧩 VST COMMUNAUTÉ ({VST_PLUGINS.length})
        </button>
      </div>

      {activeDrawer === "ANARCHY_VSTSPLUGIN" ? (
        <Card
          moduleTitle="CATALOGUE_VST // TEVATEVA21-HASH/VSTSPLUGIN"
          moduleMeta="EN ATTENTE D'ACCÈS"
        >
          <div className="py-6 space-y-4">
            <h2 className="font-sans text-lg font-bold text-brand-black">
              Dépôt lié :{" "}
              <code className="font-mono text-sm bg-brand-pearl px-2 py-0.5 rounded border border-neutral-200">
                tevateva21-hash/vstsplugin
              </code>
            </h2>
            <p className="font-sans text-sm text-neutral-600 max-w-2xl leading-relaxed">
              Ce tiroir accueillera les plugins du dépôt{" "}
              <strong>vstsplugin</strong> dès que celui-ci sera rattaché ou
              accessible en lecture au connecteur GitHub.
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
      ) : (
        <Card
          moduleTitle="VST_COMMUNAUTÉ // DÉPÔTS_LIBRES"
          moduleMeta="0 PLUGIN"
        >
          <div className="py-8 text-center space-y-2">
            <p className="font-sans text-base font-semibold text-brand-black">
              Aucun plugin communautaire publié pour l&apos;instant.
            </p>
            <p className="font-sans text-sm text-neutral-600">
              Les créations VST3 / CLAP partagées par la communauté apparaîtront
              ici.
            </p>
          </div>
        </Card>
      )}

      {/* Passerelle directe vers Anarchy Visual Design */}
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
                Générateur visuel audio-réactif : console à 19 faders, 5 scènes
                (dont Techno Therapy), 7 palettes avec morphing, Kick Blackout,
                Anaglyph 3D, Pendulum Cam, switch entre les scènes, analyse FFT
                locale MP3/WAV et export vidéo / PNG.
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

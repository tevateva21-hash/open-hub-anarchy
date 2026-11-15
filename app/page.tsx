"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AvatarBD } from "@/components/ui/AvatarBD";
import { ANARCHY_VST_PLUGINS, VST_PLUGINS } from "@/lib/openhub-data";

type VstDrawer = "ANARCHY_VSTSPLUGIN" | "COMMUNITY_VST";

/**
 * Page d'accueil `/` — VST Hub centré uniquement sur les plugins VST,
 * avec 2 tiroirs :
 * 1. VST Anarchy (suite PsyLab depuis `tevateva21-hash/vstsplugin`)
 * 2. VST Communauté
 */
export default function HomePage() {
  const [activeDrawer, setActiveDrawer] =
    useState<VstDrawer>("ANARCHY_VSTSPLUGIN");

  return (
    <div className="space-y-8">
      <section aria-labelledby="vst-hub-heading">
        <Card
          moduleTitle="VST_HUB // OPEN_SOURCE_AUDIO_PLUGINS"
          moduleMeta="SUITE PSYLAB · VST3 / STANDALONE"
          activeIndicator
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 font-mono text-xs text-brand-red font-bold uppercase">
                <span>{"// JUCE 8 · VST3 · WINDOWS & MACOS"}</span>
              </div>
              <h1
                id="vst-hub-heading"
                className="font-sans text-2xl sm:text-4xl font-bold tracking-tight text-brand-black"
              >
                Open Hub — Plugins VST
              </h1>
              <p className="font-sans text-sm sm:text-base text-neutral-600 leading-relaxed">
                Retrouvez les plugins VST3 / Standalone développés sur{" "}
                <a
                  href="https://github.com/tevateva21-hash/vstsplugin"
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono font-bold text-brand-red underline underline-offset-4"
                >
                  tevateva21-hash/vstsplugin
                </a>{" "}
                ainsi que les créations partagées par la communauté.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <AvatarBD
                name="PsyLab VST"
                expression="synth"
                size="lg"
                badgeText="VST3"
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
          ⚡ VST ANARCHY ({ANARCHY_VST_PLUGINS.length})
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {ANARCHY_VST_PLUGINS.map((plugin) => (
            <Card
              key={plugin.id}
              moduleTitle={`PSYLAB // ${plugin.code}`}
              moduleMeta={plugin.formats.join(" · ")}
              activeIndicator
            >
              <div className="flex flex-col h-full justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <AvatarBD
                        name={plugin.code}
                        expression={plugin.avatarExpression}
                        size="md"
                        badgeText="VST3"
                      />
                      <div>
                        <h2 className="font-sans text-lg font-bold text-brand-black leading-tight">
                          {plugin.name}
                        </h2>
                        <div className="font-mono text-[11px] text-neutral-500">
                          {plugin.os.join(" · ")} — {plugin.metrics.oversampling}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="font-sans text-sm text-neutral-700 leading-relaxed">
                    {plugin.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-200 flex flex-wrap items-center gap-2">
                  <Link href={`/vst/${plugin.id}`}>
                    <Button variant="primary" size="sm">
                      FICHE &amp; DÉTAILS →
                    </Button>
                  </Link>
                  {plugin.buildUrl && (
                    <a
                      href={plugin.buildUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button variant="comic" size="sm">
                        ⬇ BUILD .VST3
                      </Button>
                    </a>
                  )}
                  {plugin.repoUrl && (
                    <a
                      href={plugin.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[11px] font-bold text-neutral-600 hover:text-brand-red underline ml-auto"
                    >
                      GitHub ↗
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
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
    </div>
  );
}

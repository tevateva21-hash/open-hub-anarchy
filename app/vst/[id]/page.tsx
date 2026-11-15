"use client";

import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAudioPlayer } from "@/components/audio/AudioPlayerContext";
import { FigmaPluginRack } from "@/components/vst/FigmaPluginRack";
import { getPluginById, pluginToAudioTrack } from "@/lib/openhub-data";

export default function VstPluginDawPage({
  params,
}: {
  params: { id: string };
}) {
  const plugin = getPluginById(params.id);
  if (!plugin) {
    notFound();
  }

  return <VstPluginDawInner pluginId={plugin.id} />;
}

function VstPluginDawInner({ pluginId }: { pluginId: string }) {
  const plugin = getPluginById(pluginId);
  const { currentTrack, isPlaying, wetDryMix, playTrack, togglePlay, toggleWetDry } =
    useAudioPlayer();

  if (!plugin) {
    notFound();
  }

  const isThisTrack = currentTrack?.id === plugin.id;
  const isThisPlaying = isThisTrack && isPlaying;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Barre DAW minimale */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-black">
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <Link
            href="/"
            className="px-2.5 py-1 rounded border-2 border-black bg-brand-white hover:bg-brand-pearl font-mono text-xs font-bold shadow-comic-sm"
          >
            ← VST HUB
          </Link>
          <h1 className="font-mono text-xl sm:text-2xl font-bold text-brand-black truncate">
            {plugin.name}
          </h1>
          <span className="px-2 py-0.5 rounded bg-brand-black text-brand-white font-mono text-[10px] font-bold">
            {plugin.formats.join(" · ")} · {plugin.version}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            id="btn-vst-ab-play"
            variant={isThisPlaying ? "comic" : "primary"}
            size="sm"
            onClick={() =>
              isThisTrack ? togglePlay() : playTrack(pluginToAudioTrack(plugin))
            }
          >
            {isThisPlaying ? "❚❚ PAUSE DAW" : "▶ TESTER DANS LE DAW"}
          </Button>

          <Button
            id="btn-vst-ab-drywet"
            variant="clinical"
            size="sm"
            aria-pressed={wetDryMix}
            onClick={() => {
              if (!isThisTrack) {
                playTrack(pluginToAudioTrack(plugin));
              }
              toggleWetDry();
            }}
          >
            {wetDryMix ? "WET (DSP)" : "DRY (BYPASS)"}
          </Button>

          {plugin.repoUrl && (
            <a
              href={`${plugin.repoUrl}/actions`}
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="comic" size="sm">
                ⬇ .VST3
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Émulation DAW */}
      <section aria-label="Émulation DAW du plugin" className="min-w-0">
        <FigmaPluginRack plugin={plugin} />
      </section>
    </div>
  );
}

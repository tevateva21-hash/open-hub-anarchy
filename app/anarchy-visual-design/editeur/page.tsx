"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  CPP_PRESET_TEMPLATES,
  CPP_SHADER_ENABLED_KEY,
  CPP_SHADER_STORAGE_KEY,
  DEFAULT_CPP_SHADER_CODE,
  compileCppVisual,
  createCppRenderContext,
} from "@/lib/visual-engine/cpp-runtime";
import {
  AI_SCENE_PACK_PROMPT,
  DEFAULT_SCENE_PACKS,
  exportScenePackAsCpp,
  parseScenePackFromText,
  type ScenePack,
} from "@/lib/visual-engine/scene-packs";
import {
  ACTIVE_PACK_ID_KEY,
  PACKS_STORAGE_KEY,
} from "@/components/visual-engine/ScenePackManager";
import { renderSceneFrame } from "@/lib/visual-engine/renderer";

export default function VisualSceneCppEditorPage() {
  const [cppCode, setCppCode] = useState<string>(DEFAULT_CPP_SHADER_CODE);
  const [cppEnabled, setCppEnabled] = useState<boolean>(false);
  const [packs, setPacks] = useState<ScenePack[]>(DEFAULT_SCENE_PACKS);
  const [selectedPackId, setSelectedPackId] = useState<string>(
    DEFAULT_SCENE_PACKS[0].id
  );
  const [packRawCode, setPackRawCode] = useState<string>("");
  const [statusMsg, setStatusMsg] = useState<string>("");

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    try {
      const savedCpp = window.localStorage.getItem(CPP_SHADER_STORAGE_KEY);
      if (savedCpp) setCppCode(savedCpp);
      setCppEnabled(
        window.localStorage.getItem(CPP_SHADER_ENABLED_KEY) === "true"
      );

      const rawPacks = window.localStorage.getItem(PACKS_STORAGE_KEY);
      if (rawPacks) {
        const custom = JSON.parse(rawPacks) as ScenePack[];
        if (Array.isArray(custom) && custom.length > 0) {
          setPacks([...DEFAULT_SCENE_PACKS, ...custom]);
        }
      }
      const activeId = window.localStorage.getItem(ACTIVE_PACK_ID_KEY);
      if (activeId) setSelectedPackId(activeId);
    } catch {
      // ignore
    }
  }, []);

  const compiled = useMemo(() => compileCppVisual(cppCode), [cppCode]);

  const currentPack =
    packs.find((p) => p.id === selectedPackId) ?? packs[0];

  // Prévisualisation 60fps en direct de l'injection C++
  useEffect(() => {
    let rafId = 0;
    const startMs = performance.now();

    const draw = (now: number) => {
      const canvas = previewCanvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx) {
        const t = (now - startMs) / 1000;
        const bpm = currentPack.bpm || 140;
        const beatFloat = t * (bpm / 60);
        const beatPhase = beatFloat - Math.floor(beatFloat);
        const bass = Math.max(0, 1 - beatPhase * 2.1);
        const mid = 0.4 + 0.35 * Math.sin(t * 3.2);
        const treble = 0.3 + 0.4 * Math.abs(Math.sin(t * 7.5));
        const rms = bass * 0.5 + mid * 0.3 + treble * 0.2;
        const flux = beatPhase < 0.12 ? 0.85 : 0.12;

        const slotIdx = Math.floor(beatFloat / 8) % currentPack.scenes.length;
        const slot = currentPack.scenes[slotIdx] ?? currentPack.scenes[0];

        renderSceneFrame(ctx, {
          sceneId: slot.sceneId,
          paletteId: slot.paletteId,
          timeSeconds: t,
          intensity: slot.intensity,
          liveAudioOverride: { bass, mid, treble, rms, spectralFlux: flux },
          seed: slot.seed ?? 101,
        });

        if (compiled.ok && compiled.fn) {
          try {
            const cppCtx = createCppRenderContext(ctx, 320, 180, {
              t,
              bpm,
              beat: Math.floor(beatFloat),
              beatPhase,
              bass,
              mid,
              treble,
              rms,
              flux,
              sceneIndex: slotIdx,
            });
            compiled.fn(cppCtx);
          } catch {
            // ignore runtime errors during typing
          }
        }
      }
      rafId = window.requestAnimationFrame(draw);
    };

    rafId = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(rafId);
  }, [compiled, currentPack]);

  const handleApplyCppToSite = (enableState = true) => {
    if (!compiled.ok) {
      setStatusMsg(`Erreur C++ : ${compiled.error}`);
      return;
    }
    try {
      window.localStorage.setItem(CPP_SHADER_STORAGE_KEY, cppCode);
      window.localStorage.setItem(
        CPP_SHADER_ENABLED_KEY,
        enableState ? "true" : "false"
      );
      setCppEnabled(enableState);
      setStatusMsg(
        enableState
          ? "Code C++ injecté et ACTIVÉ sur le studio Visual Design !"
          : "Code C++ sauvegardé (désactivé sur le studio)."
      );
    } catch {
      setStatusMsg("Impossible d'enregistrer dans le navigateur.");
    }
  };

  const handleImportPack = () => {
    const parsed = parseScenePackFromText(packRawCode, "Communauté");
    if (!parsed) {
      setStatusMsg(
        "Format Pack non reconnu. Colle un bloc C++ (ANARCHY_PACK[5]) ou JSON valide."
      );
      return;
    }
    const next = [parsed, ...packs];
    setPacks(next);
    setSelectedPackId(parsed.id);
    const defaultsIds = new Set(DEFAULT_SCENE_PACKS.map((p) => p.id));
    const customOnly = next.filter((p) => !defaultsIds.has(p.id));
    try {
      window.localStorage.setItem(PACKS_STORAGE_KEY, JSON.stringify(customOnly));
      window.localStorage.setItem(ACTIVE_PACK_ID_KEY, parsed.id);
    } catch {
      // ignore
    }
    setStatusMsg(`Pack "${parsed.name}" importé et activé dans le Studio !`);
    setPackRawCode("");
  };

  const handleCopyPrompt = async () => {
    const fullPrompt = `${AI_SCENE_PACK_PROMPT}

---
OPTIONNEL (Shader C++ temps réel pour modifier directement le rendu) :
void renderAnarchyFrame(AnarchyCtx& ctx) {
  // Variables disponibles : ctx.t, ctx.bpm, ctx.beat, ctx.beatPhase, ctx.bass, ctx.mid, ctx.treble, ctx.rms, ctx.flux, ctx.width (320), ctx.height (180), ctx.sceneIndex
  // Fonctions : ctx.clear("#hex"), ctx.tint("#hex", alpha), ctx.grid(spacing, color, speed), ctx.ring(x, y, r, lw, color), ctx.circle(x, y, r, color, fill), ctx.line(x1,y1,x2,y2,lw,color), ctx.kaleidoscope(segs, speed), ctx.glitchSlices(amount), ctx.scanlines(alpha), ctx.invert(amount), ctx.zoom(scale)
}`;
    try {
      await navigator.clipboard.writeText(fullPrompt);
      setStatusMsg("Prompt IA C++ + Pack 5 Scènes copié !");
    } catch {
      setStatusMsg("Impossible de copier automatiquement.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-4">
        <div>
          <span className="inline-block px-2 py-0.5 rounded bg-brand-black text-brand-white font-mono text-[10px] font-bold uppercase mb-2">
            ÉDITEUR EXTERNE // C++ RUNTIME &amp; PACKS DE 5 SCÈNES
          </span>
          <h1 className="font-mono text-2xl sm:text-3xl font-bold text-brand-black">
            Injecteur C++ &amp; Éditeur de Scènes
          </h1>
          <p className="font-sans text-sm text-neutral-600 mt-1">
            Écris ou injecte du code C++ ici pour transformer directement le
            résultat visuel sur le studio principal.
          </p>
        </div>

        <Link href="/anarchy-visual-design">
          <Button variant="primary" size="md">
            ← RETOUR AU STUDIO
          </Button>
        </Link>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-xl border-2 border-black bg-brand-pearl font-mono text-xs font-bold text-brand-red">
          {statusMsg}
        </div>
      )}

      {/* SECTION 1 : INJECTEUR C++ TEMPS RÉEL + MONITEUR LIVE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card
          moduleTitle="C++ LIVE SHADER // void renderAnarchyFrame(AnarchyCtx& ctx)"
          moduleMeta={compiled.ok ? "✅ COMPILÉ" : "⚠ ERREUR SYNTAXE"}
          activeIndicator={cppEnabled}
          className="lg:col-span-7"
        >
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {CPP_PRESET_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setCppCode(tpl.code)}
                  className="px-2.5 py-1 rounded border border-black bg-brand-pearl hover:bg-brand-white font-mono text-[10px] font-bold"
                >
                  {tpl.name}
                </button>
              ))}
            </div>

            <textarea
              rows={13}
              value={cppCode}
              onChange={(e) => setCppCode(e.target.value)}
              spellCheck={false}
              className="w-full p-3 rounded-lg border-2 border-black bg-[#101216] text-[#00E5FF] font-mono text-xs leading-relaxed"
            />

            {!compiled.ok && compiled.error && (
              <p className="font-mono text-xs font-bold text-brand-red">
                Erreur C++ : {compiled.error}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-mono text-[10px] text-neutral-500">
                API : <code>ctx.bass</code>, <code>ctx.mid</code>,{" "}
                <code>ctx.treble</code>, <code>ctx.t</code>,{" "}
                <code>ctx.ring()</code>, <code>ctx.grid()</code>,{" "}
                <code>ctx.glitchSlices()</code>, <code>ctx.kaleidoscope()</code>
              </div>
              <div className="flex flex-wrap gap-2">
                {cppEnabled && (
                  <Button
                    type="button"
                    variant="clinical"
                    size="sm"
                    onClick={() => handleApplyCppToSite(false)}
                  >
                    DÉSACTIVER C++
                  </Button>
                )}
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => handleApplyCppToSite(true)}
                >
                  🚀 APPLIQUER CE C++ AU SITE
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card
          moduleTitle="APERÇU LIVE DU RÉSULTAT C++"
          moduleMeta="320x180 · 60 FPS"
          activeIndicator
          className="lg:col-span-5"
        >
          <div className="space-y-3">
            <canvas
              ref={previewCanvasRef}
              width={320}
              height={180}
              className="w-full aspect-video rounded-xl border-2 border-black bg-black"
              style={{ imageRendering: "pixelated" }}
            />
            <p className="font-mono text-[11px] text-neutral-600">
              Statut sur le site principal :{" "}
              <strong
                className={
                  cppEnabled ? "text-emerald-700" : "text-neutral-500"
                }
              >
                {cppEnabled
                  ? "🟢 INJECTION C++ ACTIVE SUR /anarchy-visual-design"
                  : "⚪ NON ACTIVÉ (clique sur APPLIQUER CE C++ AU SITE)"}
              </strong>
            </p>
          </div>
        </Card>
      </div>

      {/* SECTION 2 : ÉDITEUR & IMPORT/EXPORT DES PACKS DE 5 SCÈNES */}
      <Card
        moduleTitle="PACKS DE 5 SCÈNES // IMPORT / EXPORT (C++ .HPP & JSON)"
        moduleMeta={currentPack.name}
      >
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="comic"
                size="sm"
                onClick={() => void handleCopyPrompt()}
              >
                📋 COPIER PROMPT IA COMPLET
              </Button>
              <button
                type="button"
                onClick={() => setPackRawCode(exportScenePackAsCpp(currentPack))}
                className="px-2.5 py-1.5 rounded border border-black bg-brand-pearl hover:bg-brand-white font-mono text-[11px] font-bold"
              >
                Charger C++ du pack actif
              </button>
              <button
                type="button"
                onClick={() =>
                  setPackRawCode(JSON.stringify(currentPack, null, 2))
                }
                className="px-2.5 py-1.5 rounded border border-black bg-brand-pearl hover:bg-brand-white font-mono text-[11px] font-bold"
              >
                Charger JSON du pack actif
              </button>
            </div>
          </div>

          <textarea
            rows={8}
            value={packRawCode}
            onChange={(e) => setPackRawCode(e.target.value)}
            placeholder={AI_SCENE_PACK_PROMPT}
            className="w-full p-3 rounded-lg border-2 border-black bg-brand-white font-mono text-xs"
          />

          <div className="flex justify-end">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleImportPack}
            >
              IMPORTER LE PACK &amp; ACTIVER DANS LE STUDIO
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

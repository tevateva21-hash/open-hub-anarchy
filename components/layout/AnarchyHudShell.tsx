"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface AnarchyHudShellProps {
  header: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
}

/**
 * Emblème carré pixel/BD [A] Open Hub by Anarchy.
 */
const AnarchySquareEmblem: React.FC<{ size?: "xs" | "md" }> = ({
  size = "xs",
}) => {
  const dim = size === "md" ? "w-7 h-7" : "w-4 h-4";
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center ${dim} bg-brand-black border border-black shrink-0 overflow-hidden`}
    >
      <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
        <rect width="24" height="24" fill="#000000" />
        <path
          d="M11 4L5 20H8.2L9.5 16.5H14.5L15.8 20H19L13 4H11ZM10.4 13.8L12 9L13.6 13.8H10.4Z"
          transform="translate(-0.8 0)"
          fill="#FF1B24"
          opacity="0.85"
        />
        <path
          d="M11 4L5 20H8.2L9.5 16.5H14.5L15.8 20H19L13 4H11ZM10.4 13.8L12 9L13.6 13.8H10.4Z"
          transform="translate(0.8 0)"
          fill="#00E5FF"
          opacity="0.85"
        />
        <path
          d="M11 4L5 20H8.2L9.5 16.5H14.5L15.8 20H19L13 4H11ZM10.4 13.8L12 9L13.6 13.8H10.4Z"
          fill="#FFFFFF"
        />
        <circle
          cx="12"
          cy="14"
          r="9"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeOpacity="0.45"
        />
      </svg>
    </span>
  );
};

/**
 * `AnarchyHudShell` — Habillage épuré rétro-HUD (cadre biseauté + barre de titre
 * dégradée vert → cobalt → bleu ciel + rail scrollbar + barre d'état Done),
 * sans aucune barre d'adresse ni menu redondant avec `HeaderNav`.
 */
export const AnarchyHudShell: React.FC<AnarchyHudShellProps> = ({
  header,
  children,
  footer,
}) => {
  const pathname = usePathname() || "/";
  const [hudExpanded, setHudExpanded] = useState(false);
  const [showStatusBar, setShowStatusBar] = useState(true);
  const [statusNotice, setStatusNotice] = useState(
    "Done · HTTPS TLS 1.3 · RGPD CNIL OK"
  );

  useEffect(() => {
    setStatusNotice(`Done · ${pathname} · TLS 1.3 OK`);
  }, [pathname]);

  const scrollByStep = (delta: number) => {
    window.scrollBy({ top: delta, behavior: "smooth" });
  };

  return (
    <div
      id="anarchy-hud-shell"
      data-testid="anarchy-hud-shell"
      className={`min-h-screen w-full overflow-x-clip bg-[#E6E6EA] transition-all ${
        hudExpanded ? "p-1 sm:p-1.5" : "p-1 sm:p-3 lg:p-4"
      }`}
    >
      {/* Fenêtre Rétro-HUD biseautée + bordure d'encre noire BD */}
      <div
        className={`mx-auto w-full ${
          hudExpanded ? "max-w-[1640px]" : "max-w-[1460px]"
        } bg-[#D4D0C8] border-2 border-black shadow-comic flex flex-col min-w-0`}
      >
        {/* 1. BARRE DE TITRE SEGMENTÉE VERT -> COBALT -> BLEU CIEL -> GRIS */}
        <div
          id="anarchy-hud-titlebar"
          className="flex items-center justify-between gap-2 px-1.5 py-1 border-b border-[#808080] select-none"
          style={{
            background:
              "linear-gradient(90deg, #52B755 0%, #52B755 34%, #4B63B5 34%, #4B63B5 48%, #6FA6DF 48%, #6FA6DF 63%, #A7D4EE 63%, #A7D4EE 82%, #DFE6EC 82%, #DFE6EC 100%)",
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <AnarchySquareEmblem size="xs" />
            <span className="font-mono text-[11px] sm:text-xs font-bold tracking-tight text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,0.85)] truncate">
              {"OPEN HUB // BY ANARCHY"}
            </span>
          </div>

          {/* Boutons classiques [_] [□] [✕] */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setShowStatusBar((prev) => !prev)}
              title="Afficher ou masquer la barre d'état HUD"
              aria-label="Afficher ou masquer la barre d'état HUD"
              className="w-5 h-5 bg-[#D4D0C8] text-black font-mono text-[11px] font-bold leading-none flex items-center justify-center border border-t-white border-l-white border-r-[#404040] border-b-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white"
            >
              _
            </button>
            <button
              type="button"
              onClick={() => setHudExpanded((prev) => !prev)}
              title={
                hudExpanded
                  ? "Largeur standard du HUD"
                  : "Élargir la fenêtre HUD"
              }
              aria-label="Basculer l'élargissement de la fenêtre HUD"
              className="w-5 h-5 bg-[#D4D0C8] text-black font-mono text-[11px] font-bold leading-none flex items-center justify-center border border-t-white border-l-white border-r-[#404040] border-b-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white"
            >
              □
            </button>
            <button
              type="button"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                setStatusNotice("HUD Viewport centered · ANARCHY 2026");
              }}
              title="Revenir en haut du HUD"
              aria-label="Revenir en haut du HUD"
              className="w-5 h-5 bg-[#D4D0C8] text-black font-mono text-[11px] font-bold leading-none flex items-center justify-center border border-t-white border-l-white border-r-[#404040] border-b-[#404040] hover:text-brand-red active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 2. CONTENEUR CENTRAL (HEADER + MAIN + FOOTER + RAIL SCROLLBAR DÉCORATIF) */}
        <div className="flex min-w-0 bg-brand-pearl border-t border-white">
          <div className="flex-1 min-w-0 flex flex-col">
            {header}
            {children}
            {footer}
          </div>

          {/* Rail scrollbar rétro Win98 (bureau xl+) */}
          <div
            aria-hidden="true"
            className="hidden xl:flex flex-col justify-between w-4 bg-[#D4D0C8] border-l border-[#808080] shrink-0 select-none"
          >
            <button
              type="button"
              tabIndex={-1}
              onClick={() => scrollByStep(-280)}
              className="w-4 h-4 bg-[#D4D0C8] text-[8px] leading-none flex items-center justify-center border border-t-white border-l-white border-r-[#404040] border-b-[#404040] hover:bg-[#E2DFD9]"
            >
              ▲
            </button>

            <div className="flex-1 bg-[#EAE8E3] p-[1px] flex flex-col items-center">
              <div className="w-full h-24 mt-3 bg-[#D4D0C8] border border-t-white border-l-white border-r-[#404040] border-b-[#404040]" />
            </div>

            <button
              type="button"
              tabIndex={-1}
              onClick={() => scrollByStep(280)}
              className="w-4 h-4 bg-[#D4D0C8] text-[8px] leading-none flex items-center justify-center border border-t-white border-l-white border-r-[#404040] border-b-[#404040] hover:bg-[#E2DFD9]"
            >
              ▼
            </button>
          </div>
        </div>

        {/* 3. BARRE D'ÉTAT INFÉRIEURE RÉTRO (`Done`) */}
        {showStatusBar && (
          <div
            id="anarchy-hud-statusbar"
            className="flex flex-wrap items-center justify-between gap-1.5 px-1.5 py-1 bg-[#D4D0C8] border-t-2 border-white font-mono text-[10px] sm:text-[11px] text-neutral-800"
          >
            <div className="flex-1 min-w-[180px] flex items-center gap-1.5 px-2 py-0.5 bg-[#D4D0C8] border border-t-[#808080] border-l-[#808080] border-r-white border-b-white truncate">
              <AnarchySquareEmblem size="xs" />
              <span className="truncate font-medium">{statusNotice}</span>
            </div>

            <div className="hidden sm:block px-2 py-0.5 bg-[#D4D0C8] border border-t-[#808080] border-l-[#808080] border-r-white border-b-white text-neutral-700">
              {"48.0 kHz // 24-BIT"}
            </div>

            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#D4D0C8] border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-bold text-brand-black">
              <AnarchySquareEmblem size="xs" />
              <span>ANARCHY 2026</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnarchyHudShell;

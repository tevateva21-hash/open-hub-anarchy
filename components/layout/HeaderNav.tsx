"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AvatarBD } from "@/components/ui/AvatarBD";
import { useAudioPlayer } from "@/components/audio/AudioPlayerContext";

interface NavItem {
  id: string;
  href: string;
  label: string;
  accent?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: "nav-vst", href: "/", label: "01.VST_HUB" },
  { id: "nav-samples", href: "/samples", label: "02.SAMPLES" },
  {
    id: "nav-visual-design",
    href: "/anarchy-visual-design",
    label: "03.VISUAL_DESIGN",
  },
  { id: "nav-forum", href: "/forum", label: "04.FORUM" },
  { id: "nav-blog", href: "/blog", label: "05.BLOG_&_DOCS" },
  { id: "nav-legal", href: "/legal", label: "06.RGPD_&_HTTPS", accent: true },
];

/**
 * Composant `HeaderNav` — Header Clinique DAW + Emblème Lunettes 3D BD + Navigation Desktop & Mobile.
 */
export const HeaderNav: React.FC = () => {
  const pathname = usePathname() || "/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isPlaying, togglePlay, currentTrack } = useAudioPlayer();

  const isRouteActive = (href: string): boolean => {
    if (href === "/") {
      return pathname === "/" || pathname.startsWith("/vst");
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header
      id="global-header"
      className="sticky top-0 z-40 w-full bg-brand-white/95 backdrop-blur-md border-b border-neutral-200 shadow-clinical"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Identité visuelle & Titre technique obligatoire en police monospace */}
        <Link
          href="/"
          className="flex items-center gap-3 focus:outline-none group shrink-0"
        >
          {/* Emblème Lunettes 3D Anaglyphes encré style BD */}
          <div
            className="w-10 h-7 rounded border-2 border-black bg-brand-white shadow-comic-sm flex items-center justify-center p-0.5 shrink-0 transition-transform group-hover:-translate-y-0.5"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 44 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <rect
                x="2"
                y="3"
                width="17"
                height="16"
                rx="2"
                fill="#FF1B24"
                stroke="#000000"
                strokeWidth="2.5"
              />
              <path
                d="M5 15L11 7"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="19"
                y1="10"
                x2="25"
                y2="10"
                stroke="#000000"
                strokeWidth="2.5"
              />
              <rect
                x="25"
                y="3"
                width="17"
                height="16"
                rx="2"
                fill="#00E5FF"
                stroke="#000000"
                strokeWidth="2.5"
              />
              <path
                d="M28 15L34 7"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-sm sm:text-base font-bold tracking-tight text-brand-black">
              OPEN HUB{" "}
              <span className="text-brand-red font-bold">{"//"}</span>{" "}
              <span className="text-brand-charcoal font-medium">
                by anarchy
              </span>
            </span>
            <span className="hidden xl:inline-flex items-center gap-1.5 ml-1 px-2 py-0.5 rounded bg-brand-pearl border border-neutral-200 font-mono text-[10px] text-brand-charcoal uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
              v2.4_TLS1.3
            </span>
          </div>
        </Link>

        {/* Navigation Principale Desktop */}
        <nav
          id="primary-navigation"
          aria-label="Navigation principale"
          className="hidden md:flex items-center gap-1 font-mono text-xs"
        >
          {NAV_ITEMS.map((item) => {
            const active = isRouteActive(item.href);
            return (
              <Link
                key={item.id}
                id={item.id}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "px-3 py-1.5 rounded-md transition-colors whitespace-nowrap",
                  active
                    ? "bg-brand-pearl text-brand-black font-bold border border-black shadow-comic-sm"
                    : item.accent
                    ? "text-brand-red font-medium hover:bg-brand-pearl/70"
                    : "text-neutral-600 hover:text-brand-black hover:bg-brand-pearl/70",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone droite : Bouton rapide TEST_SIGNAL + Statut Audio + AvatarBD + Toggle Mobile */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="header-test-signal-btn"
            data-testid="header-test-signal-btn"
            type="button"
            onClick={togglePlay}
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded font-mono text-[11px] font-bold uppercase tracking-wider border-2 border-black shadow-comic-sm transition-transform active:translate-y-0.5 ${
              isPlaying
                ? "bg-brand-charcoal text-brand-white"
                : "bg-brand-red text-brand-white"
            }`}
          >
            <span>{isPlaying ? "❚❚ STOP_SIG" : "▶ TEST_SIGNAL"}</span>
          </button>

          <div className="hidden lg:flex flex-col items-end font-mono text-[10px] leading-tight">
            <span className="text-brand-black font-bold">
              {"48.0 kHz // 24-BIT"}
            </span>
            <span className="text-neutral-500 truncate max-w-[110px]">
              {currentTrack ? currentTrack.key : "HTTPS_STRICT"}
            </span>
          </div>

          <AvatarBD
            id="header-user-avatar"
            name="Anarchy Lead"
            expression="spectateur-a"
            size="sm"
            badgeText="3D"
            audioReactive={isPlaying}
          />

          {/* Bouton Hamburger / Drawer Mobile (<768px) */}
          <button
            id="mobile-menu-toggle"
            data-testid="mobile-menu-toggle"
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={
              mobileMenuOpen
                ? "Fermer le menu de navigation"
                : "Ouvrir le menu de navigation"
            }
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center px-2.5 py-1.5 rounded border-2 border-black bg-brand-white text-brand-black font-mono text-xs font-bold shadow-comic-sm"
          >
            {mobileMenuOpen ? "✕ CLOSE" : "☰ MENU"}
          </button>
        </div>
      </div>

      {/* Tiroir de navigation Mobile (<768px) */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          data-testid="mobile-nav-drawer"
          className="md:hidden bg-brand-white border-b-2 border-black px-4 pt-2 pb-4 space-y-2 shadow-clinical"
        >
          <div className="flex items-center justify-between py-1.5 border-b border-neutral-200 font-mono text-[10px] text-neutral-500">
            <span>{"SYS_NAV // MOBILE_DRAWER"}</span>
            <span className="text-brand-red font-bold">
              {"TLS_1.3 // RGPD_OK"}
            </span>
          </div>

          <nav
            aria-label="Navigation mobile"
            className="flex flex-col gap-1.5 font-mono text-xs"
          >
            {NAV_ITEMS.map((item) => {
              const active = isRouteActive(item.href);
              return (
                <Link
                  key={`mobile-${item.id}`}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={[
                    "px-3 py-2 rounded-md flex items-center justify-between transition-colors",
                    active
                      ? "bg-brand-pearl text-brand-black font-bold border-2 border-black shadow-comic-sm"
                      : "text-brand-charcoal hover:bg-brand-pearl border border-neutral-200",
                  ].join(" ")}
                >
                  <span>{item.label}</span>
                  <span className="text-[10px] text-brand-red">{"→"}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                togglePlay();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 rounded bg-brand-red text-brand-white border-2 border-black shadow-comic-sm font-mono text-xs font-bold uppercase"
            >
              {isPlaying ? "❚❚ PAUSE TEST_SIGNAL" : "▶ PLAY TEST_SIGNAL"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default HeaderNav;

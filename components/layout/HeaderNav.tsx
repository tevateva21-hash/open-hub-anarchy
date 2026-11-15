"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AvatarBD } from "@/components/ui/AvatarBD";
import { useAudioPlayer } from "@/components/audio/AudioPlayerContext";
import { useAuth } from "@/components/auth/AuthContext";
import { SITE_TEXTS } from "@/lib/site-texts";

interface NavItem {
  id: string;
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "nav-vst", href: "/", label: SITE_TEXTS.nav.vst },
  { id: "nav-samples", href: "/samples", label: SITE_TEXTS.nav.samples },
  {
    id: "nav-visual-design",
    href: "/anarchy-visual-design",
    label: SITE_TEXTS.nav.visualDesign,
  },
  { id: "nav-radio", href: "/radio", label: SITE_TEXTS.nav.radio },
  { id: "nav-sons-commu", href: "/sons-communaute", label: SITE_TEXTS.nav.sonsCommu },
  { id: "nav-reseau", href: "/reseau", label: SITE_TEXTS.nav.social },
  { id: "nav-forum", href: "/forum", label: SITE_TEXTS.nav.forum },
  { id: "nav-blog", href: "/blog", label: SITE_TEXTS.nav.blog },
];

/**
 * Composant `HeaderNav` — Navigation principale directe (VST Hub, Samples,
 * Visual Design, Radio, Forum, Blog & Docs) sans onglet Communauté séparé,
 * chaque section intégrant ses propres tiroirs Anarchy / Communauté.
 */
export const HeaderNav: React.FC = () => {
  const pathname = usePathname() || "/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isPlaying } = useAudioPlayer();
  const { user, openAuthModal, logout } = useAuth();

  const isRouteActive = (href: string): boolean => {
    if (href === "/") {
      return pathname === "/" || pathname.startsWith("/vst");
    }
    if (
      href === "/samples" &&
      pathname.startsWith("/communaute/samples")
    ) {
      return true;
    }
    if (href === "/forum" && pathname.startsWith("/communaute/forum")) {
      return true;
    }
    if (href === "/blog" && pathname.startsWith("/communaute/blog")) {
      return true;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header
      id="global-header"
      className="sticky top-0 z-40 w-full bg-brand-white/95 backdrop-blur-md border-b border-neutral-200 shadow-clinical"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Identité visuelle & Titre technique */}
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

          <span className="font-mono text-sm sm:text-base font-bold tracking-tight text-brand-black">
            OPEN HUB{" "}
            <span className="text-brand-red font-bold">{"//"}</span>{" "}
            <span className="text-brand-charcoal font-medium">by anarchy</span>
          </span>
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
                    : "text-neutral-600 hover:text-brand-black hover:bg-brand-pearl/70",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone droite : Connexion / @pseudo + Statut Radio + AvatarBD + Toggle Mobile */}
        <div className="flex items-center gap-2 shrink-0">
          {isPlaying && (
            <Link
              href="/radio"
              className="hidden lg:inline-flex items-center gap-1.5 px-2 py-1 rounded border-2 border-black bg-brand-red text-brand-white font-mono text-[10px] font-bold uppercase shadow-comic-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>RADIO</span>
            </Link>
          )}

          {user ? (
            <div className="hidden sm:flex items-center gap-1.5">
              <Link
                href="/reseau"
                className="px-2 py-1 rounded bg-brand-pearl border border-black font-mono text-[11px] font-bold text-brand-black hover:bg-brand-white"
              >
                @{user.pseudo}
              </Link>
              <button
                type="button"
                onClick={logout}
                title="Se déconnecter"
                className="px-2 py-1 rounded border border-neutral-300 bg-brand-white hover:border-black font-mono text-[10px] text-neutral-600 hover:text-brand-red"
              >
                {SITE_TEXTS.auth.logoutButton}
              </button>
            </div>
          ) : (
            <button
              id="btn-header-login"
              type="button"
              onClick={openAuthModal}
              className="hidden sm:inline-flex items-center px-2.5 py-1.5 rounded border-2 border-black bg-brand-white hover:bg-brand-pearl font-mono text-[11px] font-bold text-brand-black shadow-comic-sm"
            >
              {SITE_TEXTS.auth.loginButton}
            </button>
          )}

          <Link href="/reseau" aria-label="Profil et réseau communautaire">
            <AvatarBD
              id="header-user-avatar"
              name={user?.pseudo ?? "Visiteur"}
              expression={user?.expression ?? "spectateur-a"}
              src={user?.avatarUrl}
              size="sm"
              badgeText={user ? "ON" : "3D"}
              audioReactive={isPlaying}
            />
          </Link>

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

          <div className="pt-2 border-t border-neutral-200 flex items-center justify-between gap-2 font-mono text-xs">
            {user ? (
              <>
                <span className="font-bold text-brand-black">
                  Connecté : @{user.pseudo}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1 rounded border border-black text-brand-red font-bold"
                >
                  QUITTER
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal();
                }}
                className="w-full py-2 rounded border-2 border-black bg-brand-red text-white font-bold shadow-comic-sm"
              >
                CONNEXION (@PSEUDO)
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

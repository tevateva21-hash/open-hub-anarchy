import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { AudioPlayerProvider } from "@/components/audio/AudioPlayerContext";
import { StickyBottomPlayer } from "@/components/audio/StickyBottomPlayer";
import { HeaderNav } from "@/components/layout/HeaderNav";
import { AnarchyHudShell } from "@/components/layout/AnarchyHudShell";
import { CookieConsentBanner } from "@/components/compliance/CookieConsentBanner";
import { FooterCookieTrigger } from "@/components/compliance/FooterCookieTrigger";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://openhub-anarchy.org"),
  title: {
    default:
      "OPEN HUB // by anarchy — Plateforme Open-Source VST, Samples & Audio",
    template: "%s | OPEN HUB // by anarchy",
  },
  description:
    "Plateforme open-source destinée à héberger des plugins VST, un forum, un blog technique et à partager des sons et samples pour la communauté Anarchy.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "OPEN HUB // by anarchy",
    description:
      "Écosystème open-source VST3/CLAP, samples libres de droits, forum et recherche DSP.",
    type: "website",
    locale: "fr_FR",
    siteName: "OPEN HUB // by anarchy",
  },
};

/**
 * Layout global `RootLayout` — Open Hub (by Anarchy).
 *
 * Intègre :
 * - Lien d'évitement RGAA / WCAG ("Aller au contenu principal")
 * - Typographies Google Fonts `Inter` et `Roboto Mono`
 * - Habillage Rétro Anarchy HUD (`AnarchyHudShell`) fusionné Figma + BD 3D
 * - Contexte Audio Global (`AudioPlayerProvider`) persistant à travers le routage App Router
 * - Header clinique & responsive (`HeaderNav`) avec emblème lunettes 3D anaglyphes
 * - Lecteur Audio Persistant en bas d'écran (`StickyBottomPlayer`) avec oscilloscope `#FF1B24`
 * - Bandeau & Console de consentement RGPD / CNIL (`CookieConsentBanner`)
 * - Espace inférieur `pb-28` pour ne jamais masquer la barre d'état HUD ni le footer par le lecteur persistant
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-brand-pearl text-brand-charcoal font-sans pb-28">
        <AudioPlayerProvider>
          {/* Lien d'évitement accessibilité RGAA / WCAG */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-brand-red focus:text-brand-white focus:font-mono focus:text-xs"
          >
            Aller au contenu principal
          </a>

          <AnarchyHudShell
            header={<HeaderNav />}
            footer={
              <footer className="w-full bg-brand-white border-t border-neutral-200/80 py-6 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs text-neutral-500">
                  <div>
                    <span>{"OPEN HUB // BY ANARCHY"}</span> —{" "}
                    <span className="text-brand-red">v2.4</span> VST3/CLAP,
                    SAMPLES, VISUAL DESIGN, FORUM &amp; RGPD
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <FooterCookieTrigger />
                    <span>•</span>
                    <Link
                      href="/legal"
                      className="text-brand-charcoal hover:text-brand-red underline decoration-neutral-300 hover:decoration-brand-red underline-offset-4 transition-colors"
                    >
                      MENTIONS LÉGALES &amp; RGPD
                    </Link>
                    <span>•</span>
                    <a
                      href="/.well-known/security.txt"
                      className="text-brand-charcoal hover:text-brand-red underline decoration-neutral-300 hover:decoration-brand-red underline-offset-4 transition-colors"
                    >
                      SECURITY.TXT
                    </a>
                  </div>
                </div>
              </footer>
            }
          >
            {/* Contenu principal */}
            <main
              id="main-content"
              className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10"
            >
              {children}
            </main>
          </AnarchyHudShell>

          {/* Bandeau & Console RGPD / Cookies (CNIL) positionné au-dessus du lecteur */}
          <CookieConsentBanner />

          {/* Jalon 3 : Lecteur Audio Persistant avec Oscilloscope Rouge */}
          <StickyBottomPlayer />
        </AudioPlayerProvider>
      </body>
    </html>
  );
}

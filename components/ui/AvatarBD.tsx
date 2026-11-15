import React from "react";
import type { AvatarExpression } from "@/lib/openhub-data";

export type AvatarBDSize = "sm" | "md" | "lg" | "xl";

export interface AvatarBDProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Nom d'utilisateur ou texte alternatif */
  name?: string;
  /** Texte alternatif optionnel pour compatibilité standard */
  alt?: string;
  /** URL d'image optionnelle (upload utilisateur ou lien externe) */
  src?: string;
  /** Taille de l'avatar */
  size?: AvatarBDSize;
  /** Badge technique optionnel (ex: "DEV", "MOD", "3D", "DSP") */
  badgeText?: string;
  /** Archétype / style visuel Anarchy (si omis, calculé par hachage déterministe de `name`) */
  expression?: AvatarExpression;
  /** Active la bague de décalage anaglyphe 3D (.anaglyph-ring) */
  anaglyphRing?: boolean;
  /** Active l'animation réactive pendant la lecture audio */
  audioReactive?: boolean;
  /** Active le halo / rebond au survol */
  anaglyphHover?: boolean;
}

const SIZE_CLASSES: Record<AvatarBDSize, string> = {
  sm: "w-10 h-10",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

const ALL_EXPRESSIONS: AvatarExpression[] = [
  "spectateur-a",
  "spectateur-b",
  "synth",
  "dsp",
  "mod",
  "hyped",
  "shocked",
  "glitch",
];

interface AvatarTheme {
  bg: string;
  accent: string;
  secondary: string;
  text: string;
  ring: string;
}

const AVATAR_THEMES: Record<AvatarExpression, AvatarTheme> = {
  "spectateur-a": {
    bg: "#0B0B0E",
    accent: "#FF1B24",
    secondary: "#00E5FF",
    text: "#FFFFFF",
    ring: "#FFFFFF",
  },
  "spectateur-b": {
    bg: "#12131A",
    accent: "#00E5FF",
    secondary: "#FF1B24",
    text: "#FFFFFF",
    ring: "#00E5FF",
  },
  synth: {
    bg: "#09151A",
    accent: "#22D3EE",
    secondary: "#A855F7",
    text: "#ECFEFF",
    ring: "#22D3EE",
  },
  dsp: {
    bg: "#140D1B",
    accent: "#D946EF",
    secondary: "#00E5FF",
    text: "#FDF4FF",
    ring: "#D946EF",
  },
  mod: {
    bg: "#0F1712",
    accent: "#4ADE80",
    secondary: "#22D3EE",
    text: "#ECFDF5",
    ring: "#4ADE80",
  },
  hyped: {
    bg: "#1F090C",
    accent: "#FF1B24",
    secondary: "#FACC15",
    text: "#FFFFFF",
    ring: "#FACC15",
  },
  shocked: {
    bg: "#171209",
    accent: "#F59E0B",
    secondary: "#FF1B24",
    text: "#FFFBEB",
    ring: "#F59E0B",
  },
  glitch: {
    bg: "#070709",
    accent: "#FF1B24",
    secondary: "#00E5FF",
    text: "#FFFFFF",
    ring: "#FF1B24",
  },
};

export function resolveAvatarExpression(
  seed: string,
  explicit?: AvatarExpression
): AvatarExpression {
  if (explicit && ALL_EXPRESSIONS.includes(explicit)) {
    return explicit;
  }
  let hash = 2166136261;
  const input = seed || "ANR";
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const index = Math.abs(hash) % ALL_EXPRESSIONS.length;
  return ALL_EXPRESSIONS[index];
}

function getInitials(label: string): string {
  const clean = label.replace(/^@/, "").trim();
  if (!clean) return "AN";
  const parts = clean.split(/[\s_-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

/**
 * Composant `AvatarBD` — Nouveaux avatars Anarchy Cyber-Audio / Studio.
 * Supporte une image personnalisée (`src`) ou génère un emblème géométrique
 * avec initiales, ondes sonores et signature chromatique.
 */
export const AvatarBD = React.forwardRef<HTMLDivElement, AvatarBDProps>(
  (
    {
      name = "Anarchy Spec",
      alt,
      src,
      size = "md",
      badgeText,
      expression,
      anaglyphRing = false,
      audioReactive = false,
      anaglyphHover = true,
      className = "",
      ...props
    },
    ref
  ) => {
    const label = name || alt || "Anarchy Spec";
    const resolvedExpression = resolveAvatarExpression(label, expression);
    const theme = AVATAR_THEMES[resolvedExpression];
    const initials = getInitials(label);

    return (
      <div
        ref={ref}
        data-expression={resolvedExpression}
        data-audio-reactive={audioReactive ? "true" : "false"}
        className={[
          "relative inline-flex items-center justify-center select-none group shrink-0",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        title={label}
        {...props}
      >
        <div
          className={[
            SIZE_CLASSES[size],
            "rounded-full border-2 border-black bg-brand-black overflow-hidden shadow-comic-sm transition-all duration-150",
            anaglyphRing ? "anaglyph-ring" : "",
            anaglyphHover
              ? "group-hover:-translate-y-0.5 group-hover:anaglyph-ring"
              : "",
            audioReactive ? "ring-2 ring-brand-red/80 animate-pulse" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt || label}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
              role="img"
              aria-label={`Avatar Anarchy (${resolvedExpression}) de ${label}`}
            >
              <rect width="100" height="100" fill={theme.bg} />

              {/* Grille studio subtile */}
              <path
                d="M0 25H100M0 50H100M0 75H100M25 0V100M50 0V100M75 0V100"
                stroke="#FFFFFF"
                strokeOpacity="0.06"
                strokeWidth="1"
              />

              {/* Halo orbital */}
              <circle
                cx="50"
                cy="50"
                r="39"
                stroke={theme.accent}
                strokeWidth="2.5"
                strokeDasharray={
                  resolvedExpression === "glitch"
                    ? "8 4 3 5"
                    : resolvedExpression === "synth"
                    ? "14 6"
                    : undefined
                }
              />
              <circle
                cx="50"
                cy="50"
                r="33"
                stroke={theme.secondary}
                strokeOpacity="0.55"
                strokeWidth="1.5"
              />

              {/* Motif central distinct selon l'archétype */}
              {(resolvedExpression === "synth" ||
                resolvedExpression === "dsp") && (
                <path
                  d="M16 68 Q28 45 38 66 T60 66 T84 56"
                  stroke={theme.secondary}
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              )}

              {(resolvedExpression === "hyped" ||
                resolvedExpression === "shocked") && (
                <polygon
                  points="50,14 82,74 18,74"
                  stroke={theme.accent}
                  strokeOpacity="0.55"
                  strokeWidth="2.5"
                  fill="none"
                />
              )}

              {resolvedExpression === "glitch" && (
                <g>
                  <rect
                    x="14"
                    y="30"
                    width="24"
                    height="4"
                    fill={theme.secondary}
                    opacity="0.7"
                  />
                  <rect
                    x="62"
                    y="66"
                    width="24"
                    height="4"
                    fill={theme.accent}
                    opacity="0.85"
                  />
                </g>
              )}

              {resolvedExpression === "mod" && (
                <rect
                  x="24"
                  y="24"
                  width="52"
                  height="52"
                  rx="10"
                  transform="rotate(45 50 50)"
                  stroke={theme.accent}
                  strokeOpacity="0.5"
                  strokeWidth="2"
                />
              )}

              {/* Barres égaliseur en bas */}
              <g fill={theme.accent} opacity="0.85">
                <rect x="33" y="74" width="4" height="10" rx="1.5" />
                <rect x="41" y="70" width="4" height="14" rx="1.5" />
                <rect x="49" y="67" width="4" height="17" rx="1.5" />
                <rect x="57" y="71" width="4" height="13" rx="1.5" />
                <rect x="65" y="75" width="4" height="9" rx="1.5" />
              </g>

              {/* Monogramme central */}
              <text
                x="50"
                y="54"
                textAnchor="middle"
                fill={theme.text}
                fontSize="26"
                fontWeight="800"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                letterSpacing="1"
              >
                {initials}
              </text>
            </svg>
          )}
        </div>

        {badgeText && (
          <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-tighter bg-brand-red text-brand-white border border-black rounded shadow-comic-sm">
            {badgeText}
          </span>
        )}
      </div>
    );
  }
);

AvatarBD.displayName = "AvatarBD";

export default AvatarBD;

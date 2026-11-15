import React from "react";
import type { AvatarExpression } from "@/lib/openhub-data";

export type AvatarBDSize = "sm" | "md" | "lg" | "xl";

export interface AvatarBDProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Nom d'utilisateur ou texte alternatif */
  name?: string;
  /** Texte alternatif optionnel pour compatibilité standard */
  alt?: string;
  /** URL d'image optionnelle (si absente, affiche le personnage BD anaglyphe 3D correspondant) */
  src?: string;
  /** Taille de l'avatar */
  size?: AvatarBDSize;
  /** Badge technique optionnel (ex: "DEV", "MOD", "3D", "DSP") */
  badgeText?: string;
  /** Expression / archétype du personnage BD (si omis, calculé par hachage déterministe de `name`) */
  expression?: AvatarExpression;
  /** Active la bague de décalage anaglyphe 3D (.anaglyph-ring) */
  anaglyphRing?: boolean;
  /** Active l'animation réactive des verres 3D pendant la lecture audio */
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

/**
 * Calcule une expression BD déterministe à partir d'une chaîne (nom d'utilisateur, code VST, etc.)
 * afin que chaque entité possède automatiquement un visage et une silhouette comic-book distincts.
 */
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

/**
 * Composant `AvatarBD` — Touche "BD / Pop-Art" & "Figma UI Kit Section D" d'Open Hub.
 *
 * Caractéristiques :
 * - Placeholder circulaire avec contour noir d'encre très épais (`border-4 border-black`)
 * - Ombre portée franche style comic-book (`shadow-comic-sm`)
 * - 8 archétypes/expressions vectoriels SVG encrés portant des lunettes 3D anaglyphes
 *   (verre gauche Rouge Cinéma `#FF1B24`, verre droit Cyan `#00E5FF` + reflets spéculaires blancs)
 * - Support de `.anaglyph-ring` et de la réactivité audio (`audioReactive`)
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
        {/* Conteneur rond avec bordure d'encre noire très épaisse (border-4 border-black) */}
        <div
          className={[
            SIZE_CLASSES[size],
            "rounded-full border-4 border-black bg-brand-pearl overflow-hidden shadow-comic-sm transition-all duration-150",
            anaglyphRing ? "anaglyph-ring" : "",
            anaglyphHover
              ? "group-hover:-translate-y-0.5 group-hover:anaglyph-ring"
              : "",
            audioReactive ? "ring-2 ring-brand-red/70" : "",
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
              aria-label={`Avatar BD 3D (${resolvedExpression}) de ${label}`}
            >
              {/* 1. Fond Pop-Art et trame Ben-Day selon l'expression */}
              <rect
                width="100"
                height="100"
                fill={
                  resolvedExpression === "glitch"
                    ? "#222226"
                    : resolvedExpression === "hyped" ||
                      resolvedExpression === "shocked"
                    ? "#FFFFFF"
                    : "#F5F5F5"
                }
              />

              {/* Points de trame Ben-Day */}
              <circle
                cx="18"
                cy="20"
                r="2.6"
                fill={
                  resolvedExpression === "glitch" ? "#FF1B24" : "#DCDCE0"
                }
              />
              <circle
                cx="82"
                cy="22"
                r="2.6"
                fill={
                  resolvedExpression === "glitch" ? "#00E5FF" : "#DCDCE0"
                }
              />
              <circle cx="14" cy="74" r="2.6" fill="#DCDCE0" />
              <circle cx="86" cy="76" r="2.6" fill="#DCDCE0" />
              <circle cx="26" cy="12" r="1.8" fill="#E5E5E5" />
              <circle cx="74" cy="12" r="1.8" fill="#E5E5E5" />

              {/* Lignes d'impact Pop-Art pour 'hyped' ou 'shocked' */}
              {(resolvedExpression === "hyped" ||
                resolvedExpression === "shocked") && (
                <g stroke="#000000" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="8" y1="36" x2="17" y2="40" />
                  <line x1="92" y1="36" x2="83" y2="40" />
                  <line x1="12" y1="14" x2="20" y2="21" />
                  <line x1="88" y1="14" x2="80" y2="21" />
                </g>
              )}

              {/* Arceau de casque studio pour 'dsp' ou 'synth' */}
              {(resolvedExpression === "dsp" ||
                resolvedExpression === "synth") && (
                <path
                  d="M21 48C21 24 34 11 50 11C66 11 79 24 79 48"
                  stroke="#000000"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              )}

              {/* 2. Épaules / Col de blouson ou Hoodie encré noir */}
              <path
                d="M15 100C17 81 30 73 50 73C70 73 83 81 85 100"
                fill={
                  resolvedExpression === "spectateur-b" ||
                  resolvedExpression === "hyped"
                    ? "#FF1B24"
                    : resolvedExpression === "synth"
                    ? "#00E5FF"
                    : "#222226"
                }
                stroke="#000000"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Détail col / zip technique */}
              <path
                d="M44 74L50 88L56 74"
                stroke="#000000"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="#FFFFFF"
              />

              {/* 3. Tête / Visage style comic-book à contour d'encre épais */}
              <path
                d="M29 46C29 30 37 22 50 22C63 22 71 30 71 46C71 62 62 72 50 72C38 72 29 62 29 46Z"
                fill="#FFFFFF"
                stroke="#000000"
                strokeWidth="4.5"
                strokeLinejoin="round"
              />

              {/* Oreillettes de casque studio pour 'dsp' et 'synth' */}
              {(resolvedExpression === "dsp" ||
                resolvedExpression === "synth") && (
                <>
                  <rect
                    x="16"
                    y="40"
                    width="9"
                    height="18"
                    rx="4"
                    fill={resolvedExpression === "dsp" ? "#FF1B24" : "#222226"}
                    stroke="#000000"
                    strokeWidth="3.8"
                  />
                  <rect
                    x="75"
                    y="40"
                    width="9"
                    height="18"
                    rx="4"
                    fill={resolvedExpression === "dsp" ? "#00E5FF" : "#222226"}
                    stroke="#000000"
                    strokeWidth="3.8"
                  />
                </>
              )}

              {/* 4. Coiffure / Couvre-chef distinctif selon l'archétype */}
              {resolvedExpression === "spectateur-a" && (
                /* Mèche dynamique classique encrée */
                <path
                  d="M27 39C26 23 38 14 53 15C64 15 73 22 74 35C66 28 58 27 49 29C41 30 34 34 27 39Z"
                  fill="#000000"
                />
              )}

              {resolvedExpression === "spectateur-b" && (
                /* Bonnet / Beanie urbain encré avec revers */
                <g>
                  <path
                    d="M28 36C29 20 38 13 50 13C62 13 71 20 72 36Z"
                    fill="#222226"
                    stroke="#000000"
                    strokeWidth="4"
                  />
                  <rect
                    x="26"
                    y="30"
                    width="48"
                    height="8"
                    rx="3"
                    fill="#FF1B24"
                    stroke="#000000"
                    strokeWidth="3.8"
                  />
                </g>
              )}

              {resolvedExpression === "synth" && (
                /* Crête Cyber-Synth asymétrique */
                <path
                  d="M32 34L40 12L49 24L58 10L64 28L70 35C58 29 44 29 32 34Z"
                  fill="#000000"
                  stroke="#000000"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              )}

              {resolvedExpression === "dsp" && (
                /* Coupe ingénieur / laboratoire épurée avec antenne osseuse */
                <path
                  d="M29 36C31 23 40 18 50 18C60 18 69 23 71 36C62 31 38 31 29 36Z"
                  fill="#222226"
                  stroke="#000000"
                  strokeWidth="3.5"
                />
              )}

              {resolvedExpression === "mod" && (
                /* Visière casquette tactique noire */
                <g>
                  <path
                    d="M27 35C28 20 38 14 50 14C62 14 72 20 73 35Z"
                    fill="#000000"
                  />
                  <path
                    d="M24 34H78L73 29H27L24 34Z"
                    fill="#FF1B24"
                    stroke="#000000"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                  />
                </g>
              )}

              {(resolvedExpression === "hyped" ||
                resolvedExpression === "shocked") && (
                /* Cheveux hérissés haute tension Pop-Art */
                <path
                  d="M25 38L22 22L35 27L42 11L51 24L61 11L66 27L78 21L74 38C62 31 38 31 25 38Z"
                  fill="#000000"
                />
              )}

              {resolvedExpression === "glitch" && (
                /* Coiffure fracturée / décalage de trame */
                <g>
                  <path
                    d="M26 36H74V24H54V16H34V26H26V36Z"
                    fill="#000000"
                  />
                  <rect x="30" y="18" width="14" height="4" fill="#00E5FF" />
                  <rect x="56" y="20" width="14" height="4" fill="#FF1B24" />
                </g>
              )}

              {/* 5. Sourcils expressifs au-dessus de la monture */}
              {resolvedExpression === "mod" || resolvedExpression === "dsp" ? (
                <g stroke="#000000" strokeWidth="3.5" strokeLinecap="round">
                  <line x1="30" y1="33" x2="45" y2="36" />
                  <line x1="70" y1="33" x2="55" y2="36" />
                </g>
              ) : resolvedExpression === "shocked" ? (
                <g stroke="#000000" strokeWidth="3.5" strokeLinecap="round">
                  <path d="M29 34C34 29 41 29 45 34" />
                  <path d="M55 34C59 29 66 29 71 34" />
                </g>
              ) : null}

              {/* 6. Monture des Lunettes 3D Anaglyphes (style BD épais obligatoire) */}
              <g
                className={
                  audioReactive ? " origin-center animate-pulse" : undefined
                }
              >
                {/* Ombre décalée anaglyphe sous la monture en mode glitch/reactive */}
                {(resolvedExpression === "glitch" || audioReactive) && (
                  <rect
                    x="21.5"
                    y="39.5"
                    width="57"
                    height="18"
                    rx="3"
                    fill="none"
                    stroke="#00E5FF"
                    strokeWidth="2"
                  />
                )}

                <rect
                  x="23"
                  y="38"
                  width="54"
                  height="18"
                  rx="3"
                  fill="#FFFFFF"
                  stroke="#000000"
                  strokeWidth="4.5"
                />
                {/* Pont central des lunettes */}
                <line
                  x1="50"
                  y1="38"
                  x2="50"
                  y2="56"
                  stroke="#000000"
                  strokeWidth="4"
                />

                {/* Verre Gauche : Rouge Cinéma (#FF1B24) */}
                <rect
                  x="26.5"
                  y="41.5"
                  width="20.5"
                  height="11"
                  rx="1"
                  fill="#FF1B24"
                />
                {/* Reflet spéculaire diagonal blanc sur le verre rouge */}
                <path
                  d="M29 50L35 43"
                  stroke="#FFFFFF"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <path
                  d="M35 50L38 46.5"
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />

                {/* Verre Droit : Cyan Anaglyphe (#00E5FF) */}
                <rect
                  x="53"
                  y="41.5"
                  width="20.5"
                  height="11"
                  rx="1"
                  fill="#00E5FF"
                />
                {/* Reflet spéculaire diagonal blanc sur le verre cyan */}
                <path
                  d="M56 50L62 43"
                  stroke="#FFFFFF"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <path
                  d="M62 50L65 46.5"
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </g>

              {/* 7. Expression de la bouche / mâchoire selon l'archétype */}
              {resolvedExpression === "spectateur-a" && (
                /* Sourire en coin BD encré */
                <path
                  d="M42 62C46 65 53 65 59 60.5"
                  stroke="#000000"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                />
              )}

              {resolvedExpression === "spectateur-b" && (
                /* Sourire large Pop-Art dents blanches */
                <path
                  d="M39 60H61C60 66 55 68 50 68C45 68 40 66 39 60Z"
                  fill="#FFFFFF"
                  stroke="#000000"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                />
              )}

              {resolvedExpression === "synth" && (
                /* Expression concentrée "onde en dents de scie" */
                <path
                  d="M41 63L45 60L49 64L53 60L57 63L60 61"
                  stroke="#000000"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {resolvedExpression === "dsp" && (
                /* Expression analytique chirurgicale + micro casque */
                <g>
                  <line
                    x1="43"
                    y1="62.5"
                    x2="57"
                    y2="62.5"
                    stroke="#000000"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M23 54C26 63 34 65 40 64"
                    stroke="#000000"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx="40" cy="64" r="2.8" fill="#FF1B24" stroke="#000000" strokeWidth="2" />
                </g>
              )}

              {resolvedExpression === "mod" && (
                /* Moue stoïque d'administrateur système */
                <path
                  d="M42 64C46 61.5 54 61.5 58 64"
                  stroke="#000000"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                />
              )}

              {resolvedExpression === "hyped" && (
                /* Cri d'enthousiasme BD ouvert */
                <g>
                  <path
                    d="M40 59H60C60 66 55 69 50 69C45 69 40 66 40 59Z"
                    fill="#FF1B24"
                    stroke="#000000"
                    strokeWidth="3.6"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="43"
                    y1="61.5"
                    x2="57"
                    y2="61.5"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                  />
                </g>
              )}

              {resolvedExpression === "shocked" && (
                /* Bouche "O" choquée par les sous-basses */
                <ellipse
                  cx="50"
                  cy="63.5"
                  rx="5.5"
                  ry="4.5"
                  fill="#000000"
                />
              )}

              {resolvedExpression === "glitch" && (
                /* Bouche pixelisée / bitcrush */
                <g fill="#000000">
                  <rect x="40" y="61" width="6" height="4" />
                  <rect x="46" y="59" width="8" height="4" />
                  <rect x="54" y="61" width="6" height="4" />
                </g>
              )}
            </svg>
          )}
        </div>

        {/* Badge Pop-Art optionnel en bas à droite */}
        {badgeText && (
          <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-tighter bg-brand-red text-brand-white border-2 border-black rounded shadow-comic-sm">
            {badgeText}
          </span>
        )}
      </div>
    );
  }
);

AvatarBD.displayName = "AvatarBD";

export default AvatarBD;

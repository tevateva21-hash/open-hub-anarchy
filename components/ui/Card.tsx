import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Titre ou identifiant technique affiché dans l'en-tête de la carte (style module DAW) */
  moduleTitle?: string;
  /** Code ou métadonnée secondaire en police monospace (ex: "VST3 // v1.4.2") */
  moduleMeta?: string;
  /** Active un point d'état Rouge Cinéma (#FF1B24) dans l'en-tête */
  activeIndicator?: boolean;
  /** Active une élévation douce au survol */
  interactive?: boolean;
  /** Supprime le padding interne par défaut si besoin d'un layout sur-mesure */
  noPadding?: boolean;
}

/**
 * Composant `Card` — Base "Clinique" du Design System Open Hub.
 *
 * Respecte la DA inspirée des DAW haut de gamme :
 * - Fond Blanc pur (`bg-brand-white` / `#FFFFFF`)
 * - Bordure grise très fine (`border border-neutral-200/90`)
 * - Ombre portée très douce (`shadow-clinical`)
 * - Barre d'en-tête modulaire optionnelle avec typographie technique `Roboto Mono`
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className = "",
      moduleTitle,
      moduleMeta,
      activeIndicator = false,
      interactive = false,
      noPadding = false,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={[
          "bg-brand-white border border-neutral-200/90 rounded-xl shadow-clinical transition-all duration-200",
          interactive
            ? "hover:shadow-clinical-hover hover:border-neutral-300"
            : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {(moduleTitle || moduleMeta) && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 bg-brand-pearl/40 rounded-t-xl">
            <div className="flex items-center gap-2.5">
              <span
                className={[
                  "inline-block w-2 h-2 rounded-full",
                  activeIndicator ? "bg-brand-red" : "bg-neutral-300",
                ].join(" ")}
                aria-hidden="true"
              />
              {moduleTitle && (
                <span className="font-mono text-xs font-medium tracking-wider uppercase text-brand-charcoal">
                  {moduleTitle}
                </span>
              )}
            </div>
            {moduleMeta && (
              <span className="font-mono text-[11px] text-neutral-500 tracking-tight">
                {moduleMeta}
              </span>
            )}
          </div>
        )}

        <div className={noPadding ? "" : "p-6"}>{children}</div>
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;

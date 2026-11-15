import React from "react";

export type ButtonVariant = "clinical" | "primary" | "comic";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visuelle conforme à la DA Open Hub */
  variant?: ButtonVariant;
  /** Taille du bouton */
  size?: "sm" | "md" | "lg";
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  // Bouton DAW clinique : fond blanc, bordure fine, ombre très douce
  clinical:
    "bg-brand-white text-brand-charcoal border border-neutral-200/90 shadow-clinical hover:border-brand-charcoal hover:shadow-clinical-hover active:translate-y-px",
  // Bouton d'action Rouge Cinéma (#FF1B24)
  primary:
    "bg-brand-red text-brand-white border border-brand-red shadow-clinical hover:bg-[#e0141c] active:translate-y-px",
  // Bouton touche BD / Pop-Art : bordure noire d'encre épaisse
  comic:
    "bg-brand-white text-brand-black border-2 border-black shadow-comic-sm hover:-translate-y-0.5 active:translate-y-0",
};

const SIZE_CLASSES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-xs",
  lg: "px-5 py-2.5 text-sm",
};

/**
 * Composant `Button` — Bouton technique en police `Roboto Mono`.
 * Accompagne `Card` et `AvatarBD` dans le Design System du Jalon 1.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "clinical",
      size = "md",
      className = "",
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={[
          "inline-flex items-center justify-center gap-2 rounded-lg font-mono font-medium tracking-wider uppercase transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40 disabled:opacity-50 disabled:pointer-events-none",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;

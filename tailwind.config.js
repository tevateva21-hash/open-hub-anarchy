/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette stricte Direction Artistique "Open Hub (by Anarchy)"
        // Accessible via bg-brand-white, text-brand-red, border-brand-black, etc.
        brand: {
          white: "#FFFFFF",    // Blanc clinique pur (surfaces principales, cartes)
          pearl: "#F5F5F5",    // Gris perle (fond global DAW, zones secondaires)
          red: "#FF1B24",      // Rouge Cinéma (accents techniques, REC/LED, verre 3D gauche)
          charcoal: "#222226", // Gris anthracite (typographie technique et secondaire)
          black: "#000000",    // Noir d'encre (contours BD épais, contrastes forts)
        },
        // Accents secondaires pour l'effet lunettes 3D anaglyphes (Pop-Art / BD)
        anaglyph: {
          red: "#FF1B24",
          cyan: "#00E5FF",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-roboto-mono)", "monospace"],
      },
      boxShadow: {
        // Ombre très douce inspirée des interfaces DAW cliniques haut de gamme
        clinical:
          "0 2px 10px -2px rgba(0, 0, 0, 0.04), 0 1px 3px -1px rgba(0, 0, 0, 0.03)",
        "clinical-hover":
          "0 8px 24px -4px rgba(0, 0, 0, 0.07), 0 2px 6px -1px rgba(0, 0, 0, 0.04)",
        // Ombre franche à l'encre noire pour les éléments BD / Pop-Art
        comic: "3px 3px 0px 0px #000000",
        "comic-sm": "2px 2px 0px 0px #000000",
      },
    },
  },
  plugins: [],
};

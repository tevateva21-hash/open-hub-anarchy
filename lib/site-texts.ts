/**
 * ============================================================================
 * FICHIER CENTRAL DES TEXTES & PHRASES — OPEN HUB BY ANARCHY
 * ============================================================================
 *
 * Modifie librement n'importe quelle phrase ci-dessous (même directement depuis
 * GitHub avec l'icône crayon ✏️) sans toucher au code React/TypeScript.
 * Dès que tu enregistres (Commit), Vercel redéploie automatiquement le site.
 */

export const SITE_TEXTS = {
  brand: {
    title: "OPEN HUB",
    subtitle: "by anarchy",
    tagline: "VST3 · Samples · Visual Design · Radio · Communauté",
  },
  nav: {
    vst: "01.VST_HUB",
    samples: "02.SAMPLES",
    visualDesign: "03.VISUAL_DESIGN",
    radio: "04.RADIO",
    sonsCommu: "05.SONS_COMMU",
    social: "06.RÉSEAU",
    forum: "07.FORUM",
    blog: "08.BLOG_&_DOCS",
  },
  auth: {
    modalTitle: "CONNEXION // OPEN HUB COMMUNAUTÉ",
    modalDescription:
      "Connectez-vous avec un e-mail, un pseudo et un avatar personnalisé pour publier des sons, suivre d'autres artistes, poster sur le réseau ou partager des VST.",
    loginButton: "CONNEXION",
    logoutButton: "QUITTER",
  },
  social: {
    pageBadge: "06 // RÉSEAU & SOCIABILITÉ",
    pageTitle: "Réseau Communauté Anarchy",
    pageDescription:
      "Suis les producteurs, découvre les profils, échange en direct sur le mur communautaire et retrouve toute l'activité du hub.",
    wallPlaceholder:
      "Partage une idée, un lien SoundCloud, un retour sur un VST ou cherche une collab...",
    wallSubmitLabel: "PUBLIER SUR LE MUR",
  },
  footer: {
    copyright: "© Open Hub by Anarchy — Plateforme libre audio & visuel.",
    rgpdLabel: "RGPD & Confidentialité",
  },
} as const;

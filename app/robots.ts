import { MetadataRoute } from "next";

/**
 * Génération dynamique du fichier `/robots.txt` pour l'indexation SEO propre.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/samples",
          "/anarchy-visual-design",
          "/visual-engine",
          "/forum",
          "/blog",
          "/vst",
          "/legal",
        ],
        disallow: ["/api/", "/_next/"],
      },
    ],
    sitemap: "https://openhub-anarchy.org/sitemap.xml",
  };
}

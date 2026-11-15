import { MetadataRoute } from "next";

/**
 * Web App Manifest (`/manifest.webmanifest`) aligné avec la DA Open Hub.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OPEN HUB // by anarchy",
    short_name: "OPEN HUB",
    description:
      "Plateforme open-source de plugins VST, samples, forum et recherche audio par Anarchy.",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F5F5",
    theme_color: "#FF1B24",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}

import { MetadataRoute } from "next";
import { ANARCHY_VST_PLUGINS, BLOG_POSTS, VST_PLUGINS } from "@/lib/openhub-data";

/**
 * Génération dynamique du `/sitemap.xml` pour les moteurs de recherche.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const baseUrl = "https://openhub-anarchy.org";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/anarchy-visual-design`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/radio`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/communaute/samples`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/communaute/forum`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/communaute/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/legal`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const vstRoutes: MetadataRoute.Sitemap = [
    ...ANARCHY_VST_PLUGINS,
    ...VST_PLUGINS,
  ].map((plugin) => ({
    url: `${baseUrl}/vst/${plugin.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...vstRoutes, ...blogRoutes];
}

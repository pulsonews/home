import { MetadataRoute } from "next";
import { database } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://seusite.com.br";
  const [articles, categories] = await Promise.all([
    database.getArticles(),
    database.getCategories()
  ]);

  return [
    { url: siteUrl, changeFrequency: "always", priority: 1 },
    ...categories.map((c) => ({
      url: `${siteUrl}/categoria/${c.slug}`,
      changeFrequency: "hourly" as const,
      priority: 0.8
    })),
    ...articles.map((a) => ({
      url: `${siteUrl}/noticia/${a.id}`,
      lastModified: new Date(a.publicadoEm),
      changeFrequency: "daily" as const,
      priority: 0.6
    }))
  ];
}

import type { MetadataRoute } from "next";
import { listPublicTips } from "@/lib/bets";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tips = await listPublicTips();

  const tipEntries: MetadataRoute.Sitemap = tips
    // Only list tips with real content — thin tips are noindexed anyway.
    .filter((t) => t.hasAnalysis)
    .map((t) => ({
      url: `${SITE_URL}/tip/${t.id}`,
      lastModified: new Date(t.updatedAt),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  return [
    { url: `${SITE_URL}/feed`, changeFrequency: "hourly", priority: 0.9 },
    ...tipEntries,
  ];
}

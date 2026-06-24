import type { MetadataRoute } from "next";
import { listPublicTips, listTipsterUsernames } from "@/lib/bets";
import { allTerms } from "@/lib/glossary";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tips, usernames] = await Promise.all([listPublicTips(), listTipsterUsernames()]);

  const profileEntries: MetadataRoute.Sitemap = usernames.map((u) => ({
    url: `${SITE_URL}/u/${u}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const tipEntries: MetadataRoute.Sitemap = tips
    // Only list tips with real content — thin tips are noindexed anyway.
    .filter((t) => t.hasAnalysis)
    .map((t) => ({
      url: `${SITE_URL}/tip/${t.slug}`,
      lastModified: new Date(t.updatedAt),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  const glossaryEntries: MetadataRoute.Sitemap = allTerms().map((t) => ({
    url: `${SITE_URL}/glossary/${t.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/feed`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/leaderboard`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/glossary`, changeFrequency: "weekly", priority: 0.7 },
    ...glossaryEntries,
    ...profileEntries,
    ...tipEntries,
  ];
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sports Betting Tips Feed · Live Picks from Verified Tipsters · Bankroller",
  description:
    "The latest public sports betting tips across football, tennis and more, from tipsters with verified, sample-size-adjusted track records. Follow the picks that have an edge.",
  keywords: ["sports betting tips", "free betting tips", "football tips", "betting picks", "verified tipsters", "tips feed"],
  alternates: { canonical: "/feed" },
  openGraph: {
    title: "Sports Betting Tips Feed · Bankroller",
    description: "Live public picks from verified tipsters.",
    type: "website",
    url: "/feed",
  },
};

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return children;
}

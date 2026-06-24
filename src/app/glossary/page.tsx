import type { Metadata } from "next";
import Link from "next/link";
import { allTerms } from "@/lib/glossary";
import { GlossaryBrowser } from "@/components/GlossaryBrowser";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Betting Glossary · Terms Explained by People Who Bet · Bankroller",
  description:
    "Plain, honest explanations of the terms serious bettors actually use: closing line value, units, Asian handicaps and more. No fluff, no 101 lecture.",
  keywords: ["betting glossary", "betting terms", "closing line value", "units betting", "asian handicap explained"],
  alternates: { canonical: "/glossary" },
  openGraph: {
    title: "Betting Glossary · Bankroller",
    description: "The terms serious bettors actually use, explained plainly.",
    type: "website",
    url: "/glossary",
  },
};

export default function GlossaryPage() {
  const terms = allTerms();

  // Term of the day: deterministic rotation by day-of-year (no Math.random).
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const featured = terms[dayOfYear % terms.length];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Bankroller Betting Glossary",
    url: `${SITE_URL}/glossary`,
    hasDefinedTerm: terms.map((t) => ({
      "@type": "DefinedTerm",
      name: t.term,
      description: t.oneLiner,
      url: `${SITE_URL}/glossary/${t.slug}`,
    })),
  };

  return (
    <div className="fade-in" style={{ maxWidth: 760, margin: "0 auto", position: "relative" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Kraken motif behind the header */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo/bankroller-kraken-dots.png"
        alt=""
        aria-hidden
        style={{ position: "absolute", top: -30, right: -20, width: 260, opacity: 0.07, pointerEvents: "none", zIndex: 0 }}
      />

      <div style={{ position: "relative", zIndex: 1, marginBottom: 24 }}>
        <div className="label" style={{ color: "var(--accent)", marginBottom: 8 }}>The Bankroller glossary</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>Betting terms, explained straight</h1>
        <p style={{ color: "var(--text-2)", marginTop: 8, fontSize: 14, lineHeight: 1.6, maxWidth: 600 }}>
          The terms serious bettors actually use, explained the way we&apos;d explain them to a mate:
          plainly, with the bits that matter and the mistakes we&apos;ve made ourselves.
        </p>
      </div>

      {/* Term of the day */}
      <Link
        href={`/glossary/${featured.slug}`}
        className="panel"
        style={{
          position: "relative", zIndex: 1, display: "block", padding: "18px 20px", marginBottom: 30,
          textDecoration: "none", color: "inherit",
          border: "1px solid color-mix(in oklch, var(--accent) 30%, transparent)",
          background: "color-mix(in oklch, var(--accent) 6%, transparent)",
        }}
      >
        <div className="label" style={{ color: "var(--accent)", marginBottom: 8 }}>Term of the day</div>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em" }}>
          {featured.term}{featured.abbr ? <span style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 14, fontWeight: 500 }}> · {featured.abbr}</span> : null}
        </div>
        <div style={{ color: "var(--text-2)", fontSize: 13.5, lineHeight: 1.6, marginTop: 6 }}>{featured.oneLiner}</div>
        <div style={{ color: "var(--accent)", fontFamily: "var(--mono)", fontSize: 12, marginTop: 10 }}>Read it →</div>
      </Link>

      <div style={{ position: "relative", zIndex: 1 }}>
        <GlossaryBrowser terms={terms} />
      </div>
    </div>
  );
}

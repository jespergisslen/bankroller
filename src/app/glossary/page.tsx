import type { Metadata } from "next";
import Link from "next/link";
import { allTerms } from "@/lib/glossary";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Betting Glossary — Terms Explained by People Who Bet · Bankroller",
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
  const groups = [...new Set(terms.map((t) => t.group))];

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
    <div className="fade-in" style={{ maxWidth: 760, margin: "0 auto" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ marginBottom: 26 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Betting glossary</h1>
        <p style={{ color: "var(--text-2)", marginTop: 8, fontSize: 14, lineHeight: 1.6, maxWidth: 600 }}>
          The terms serious bettors actually use, explained the way we&apos;d explain them to a mate:
          plainly, with the bits that actually matter and the mistakes we&apos;ve made ourselves.
        </p>
      </div>

      {groups.map((group) => (
        <div key={group} style={{ marginBottom: 28 }}>
          <div className="label" style={{ marginBottom: 12 }}>{group}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {terms.filter((t) => t.group === group).map((t) => (
              <Link key={t.slug} href={`/glossary/${t.slug}`} className="panel" style={{
                padding: 16, textDecoration: "none", color: "inherit",
                display: "flex", flexDirection: "column", gap: 6,
              }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {t.term}{t.abbr ? <span style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 12 }}> · {t.abbr}</span> : null}
                </div>
                <div style={{ color: "var(--text-3)", fontSize: 12.5, lineHeight: 1.5 }}>{t.oneLiner}</div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

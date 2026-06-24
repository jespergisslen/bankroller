import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTerm, allTerms } from "@/lib/glossary";
import { SITE_URL } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return allTerms().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const t = getTerm(slug);
  if (!t) return { title: "Glossary · Bankroller" };
  const title = `${t.term}${t.abbr ? ` (${t.abbr})` : ""} — betting term explained`;
  return {
    title: `${title} · Bankroller`,
    description: t.oneLiner,
    alternates: { canonical: `/glossary/${t.slug}` },
    openGraph: { title: `${t.term} · Bankroller glossary`, description: t.oneLiner, type: "article", url: `/glossary/${t.slug}` },
  };
}

export default async function TermPage({ params }: Params) {
  const { slug } = await params;
  const t = getTerm(slug);
  if (!t) notFound();

  const related = (t.related ?? []).map(getTerm).filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: t.term,
    alternateName: t.abbr,
    description: t.oneLiner,
    inDefinedTermSet: `${SITE_URL}/glossary`,
    url: `${SITE_URL}/glossary/${t.slug}`,
  };

  return (
    <div className="fade-in" style={{ maxWidth: 680, margin: "0 auto" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link href="/glossary" style={{ textDecoration: "none", color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 12 }}>
        ← Glossary
      </Link>

      <div style={{ marginTop: 14, marginBottom: 8 }}>
        <div className="label" style={{ marginBottom: 8 }}>{t.group}</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>
          {t.term}{t.abbr ? <span style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 18, fontWeight: 500 }}> ({t.abbr})</span> : null}
        </h1>
      </div>

      {t.body.map((p, i) => (
        <p key={i} style={{ color: i === 0 ? "var(--text)" : "var(--text-2)", fontSize: 15, lineHeight: 1.7, marginTop: 14 }}>
          {p}
        </p>
      ))}

      {t.sharpNote && (
        <div style={{
          marginTop: 22, padding: "14px 16px", borderRadius: "var(--r-m)",
          border: "1px solid color-mix(in oklch, var(--accent) 28%, transparent)",
          background: "color-mix(in oklch, var(--accent) 7%, transparent)",
        }}>
          <div className="label" style={{ color: "var(--accent)", marginBottom: 6 }}>Sharp&apos;s note</div>
          <div style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6 }}>{t.sharpNote}</div>
        </div>
      )}

      {related.length > 0 && (
        <div style={{ marginTop: 30, paddingTop: 18, borderTop: "1px solid var(--line)" }}>
          <div className="label" style={{ marginBottom: 12 }}>Related terms</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {related.map((r) => (
              <Link key={r!.slug} href={`/glossary/${r!.slug}`} className="btn sm" style={{ textDecoration: "none" }}>
                {r!.term} ↗
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

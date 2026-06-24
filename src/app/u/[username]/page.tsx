import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTipsterProfile } from "@/lib/bets";
import { SITE_URL } from "@/lib/site";

type Params = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { username } = await params;
  const p = await getTipsterProfile(username);
  if (!p) return { title: "Tipster · Bankroller" };
  const title = `${p.name}: tipster track record`;
  const description = p.bio
    ? p.bio.slice(0, 200)
    : `${p.name}'s public betting tips and track record on Bankroller, with ${p.tips.length} published picks.`;
  return {
    title: `${title} · Bankroller`,
    description,
    alternates: { canonical: `/u/${p.username}` },
    robots: p.tips.length ? undefined : { index: false, follow: true },
    openGraph: { title, description, type: "profile", url: `/u/${p.username}` },
    twitter: { card: "summary", title, description },
  };
}

export default async function ProfilePage({ params }: Params) {
  const { username } = await params;
  const p = await getTipsterProfile(username);
  if (!p) notFound();

  const settled = p.tips.filter((t) => t.result === "win" || t.result === "loss" || t.result === "void");
  const wins = settled.filter((t) => t.result === "win").length;
  const netUnits = settled.reduce((acc, t) => acc + (t.profit ?? 0), 0);
  const winRate = settled.length ? Math.round((wins / settled.length) * 100) : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: p.name,
      alternateName: p.username,
      ...(p.bio ? { description: p.bio } : {}),
      url: `${SITE_URL}/u/${p.username}`,
    },
  };

  const stats: { label: string; value: string }[] = [
    { label: "Public tips", value: String(p.tips.length) },
    { label: "Settled", value: String(settled.length) },
    { label: "Win rate", value: winRate !== null ? `${winRate}%` : "—" },
    { label: "Net units", value: settled.length ? `${netUnits > 0 ? "+" : ""}${netUnits.toFixed(2)}u` : "—" },
  ];

  return (
    <div className="fade-in" style={{ maxWidth: 820, margin: "0 auto" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link href="/feed" style={{ textDecoration: "none", color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 12 }}>
        ← Back to feed
      </Link>

      {/* Header */}
      <div className="panel" style={{ marginTop: 16, padding: "var(--pad)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16,
            background: p.color + "22", border: `1px solid ${p.color}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--mono)", fontSize: 20, fontWeight: 700, color: p.color, flexShrink: 0,
          }}>{p.initials}</div>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" }}>{p.name}</h1>
            <div style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 12, marginTop: 2 }}>
              @{p.username} · Sports betting tipster
            </div>
          </div>
        </div>
        {p.bio && <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.65, marginTop: 14 }}>{p.bio}</p>}
        <p style={{ color: "var(--text-3)", fontSize: 13, lineHeight: 1.6, marginTop: p.bio ? 8 : 14 }}>
          {p.name}&apos;s verified sports betting tips and track record on Bankroller: yield, win rate and every published pick.
        </p>

        {/* Stats */}
        <div className="kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 18 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ padding: "12px 14px", borderRadius: "var(--r-m)", background: "var(--bg-2)" }}>
              <div className="label" style={{ marginBottom: 6 }}>{s.label}</div>
              <div className="num" style={{ fontSize: 20, fontWeight: 600 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="panel" style={{ marginTop: 16 }}>
        <div style={{ padding: "14px var(--pad)", borderBottom: "1px solid var(--line)", fontWeight: 600, fontSize: 13 }}>
          Published tips
        </div>
        {p.tips.length === 0 ? (
          <div style={{ padding: "48px var(--pad)", textAlign: "center", color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 12.5 }}>
            No public tips yet.
          </div>
        ) : (
          p.tips.map((t, i) => (
            <Link
              key={t.slug}
              href={`/tip/${t.slug}`}
              style={{
                display: "flex", alignItems: "center", gap: 14, padding: "14px var(--pad)",
                borderBottom: i === p.tips.length - 1 ? "none" : "1px solid var(--line)",
                textDecoration: "none", color: "inherit",
              }}
            >
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)", minWidth: 70, flexShrink: 0 }}>
                {t.sportEmoji} {t.date}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.match}</div>
                <div style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 10.5, marginTop: 1 }}>{t.pick}</div>
              </div>
              <span className="num pos glow" style={{ fontSize: 14, fontWeight: 600, flexShrink: 0 }}>{t.odds.toFixed(2)}</span>
              <span className={`result-pill ${t.result}`} style={{ flexShrink: 0 }}>{t.result}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

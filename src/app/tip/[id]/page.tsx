import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicTip } from "@/lib/bets";
import { ShareBar } from "@/components/ShareBar";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const tip = await getPublicTip(id);
  if (!tip) return { title: "Tip · Bankroller" };
  const title = `${tip.match} — ${tip.pick} @ ${tip.odds.toFixed(2)}`;
  const description = tip.analysis
    ? tip.analysis.slice(0, 200)
    : `${tip.name}'s pick on Bankroller — ${tip.pick} at ${tip.odds.toFixed(2)}.`;
  return {
    title: `${title} · Bankroller`,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function TipPage({ params }: Params) {
  const { id } = await params;
  const tip = await getPublicTip(id);
  if (!tip) notFound();

  const shareText = `${tip.match} — ${tip.pick} @ ${tip.odds.toFixed(2)} (${tip.name} on Bankroller)`;

  return (
    <div className="fade-in" style={{ maxWidth: 720, margin: "0 auto" }}>
      <Link href="/feed" style={{ textDecoration: "none", color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 12 }}>
        ← Back to feed
      </Link>

      <div className="panel" style={{ marginTop: 16, padding: "var(--pad)" }}>
        {/* Tipster */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 12,
            background: tip.color + "22", border: `1px solid ${tip.color}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, color: tip.color,
          }}>{tip.initials}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>
              {tip.name}
              {tip.verified && <span style={{ color: "var(--accent)", marginLeft: 5, fontSize: 12 }}>✓</span>}
            </div>
            <div style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 11.5, marginTop: 2 }}>
              {tip.sportEmoji} {tip.league} · {tip.date}
            </div>
          </div>
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 14 }}>{tip.match}</h1>

        {tip.analysis && (
          <p style={{ color: "var(--text-2)", fontSize: 14.5, lineHeight: 1.7, marginBottom: 20 }}>{tip.analysis}</p>
        )}

        {/* Pick box */}
        <div className="feed-pick" style={{
          display: "inline-flex", alignItems: "center",
          background: "var(--bg-2)", border: "1px solid var(--line-2)",
          borderRadius: "var(--r-m)", overflow: "hidden", marginBottom: 22,
        }}>
          <div style={{ padding: "12px 18px", borderRight: "1px solid var(--line)" }}>
            <div className="label" style={{ marginBottom: 3 }}>Pick</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{tip.pick}</div>
          </div>
          <div style={{ padding: "12px 18px", borderRight: "1px solid var(--line)" }}>
            <div className="label" style={{ marginBottom: 3 }}>Odds</div>
            <div className="num pos glow" style={{ fontSize: 18, fontWeight: 500 }}>{tip.odds.toFixed(2)}</div>
          </div>
          <div style={{ padding: "12px 18px" }}>
            <div className="label" style={{ marginBottom: 3 }}>Stake</div>
            <div className="num" style={{ fontSize: 14, color: "var(--text-2)" }}>{tip.stake}u</div>
          </div>
        </div>

        <ShareBar tipId={tip.id} shareText={shareText} />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { getTopTipsters } from "@/lib/bets";

export const metadata: Metadata = {
  title: "Top tipsters — track records · Bankroller",
  description: "The best sports betting tipsters on Bankroller, ranked by verified yield from their published tips.",
  alternates: { canonical: "/leaderboard" },
  openGraph: { title: "Top tipsters · Bankroller", description: "Ranked by verified yield.", type: "website", url: "/leaderboard" },
};

export default async function LeaderboardPage() {
  const tipsters = await getTopTipsters(50);

  return (
    <div className="fade-in" style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>Top tipsters</h1>
        <p style={{ color: "var(--text-2)", marginTop: 4, fontSize: 13.5 }}>Ranked by verified yield from published tips.</p>
      </div>

      <div className="panel" style={{ overflow: "hidden" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "34px 1fr 80px 70px 80px", gap: 10,
          padding: "11px var(--pad)", borderBottom: "1px solid var(--line)",
          fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "1px", textTransform: "uppercase", color: "var(--text-4)",
        }}>
          <span>#</span><span>Tipster</span>
          <span style={{ textAlign: "right" }}>Tips</span>
          <span style={{ textAlign: "right" }}>Win</span>
          <span style={{ textAlign: "right" }}>Yield</span>
        </div>

        {tipsters.length === 0 ? (
          <div style={{ padding: "48px var(--pad)", textAlign: "center", color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 12.5 }}>
            No ranked tipsters yet.
          </div>
        ) : tipsters.map((t, i) => (
          <Link
            key={t.username}
            href={`/u/${t.username}`}
            style={{
              display: "grid", gridTemplateColumns: "34px 1fr 80px 70px 80px", gap: 10, alignItems: "center",
              padding: "12px var(--pad)", borderBottom: i === tipsters.length - 1 ? "none" : "1px solid var(--line)",
              textDecoration: "none", color: "inherit",
            }}
          >
            <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: i < 3 ? "var(--accent)" : "var(--text-3)", fontWeight: i < 3 ? 600 : 400 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <span style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: t.color + "22", border: `1px solid ${t.color}44`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--mono)", fontSize: 10.5, fontWeight: 700, color: t.color,
              }}>{t.initials}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--text-3)" }}>@{t.username}</div>
              </div>
            </div>
            <span className="num" style={{ textAlign: "right", fontSize: 13, color: "var(--text-2)" }}>{t.tips}</span>
            <span className="num" style={{ textAlign: "right", fontSize: 13, color: "var(--text-2)" }}>{t.winRate !== null ? `${t.winRate}%` : "—"}</span>
            {t.yieldPct !== null ? (
              <span className={`num ${t.yieldPct >= 0 ? "pos glow" : "neg"}`} style={{ textAlign: "right", fontSize: 13.5, fontWeight: 600 }}>
                {t.yieldPct >= 0 ? "+" : ""}{t.yieldPct.toFixed(1)}%
              </span>
            ) : (
              <span style={{ textAlign: "right", fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-4)" }}>—</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

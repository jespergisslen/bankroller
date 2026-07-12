import type { Metadata } from "next";
import Link from "next/link";
import { getTopTipsters } from "@/lib/bets";
import { RankMedal, medalColor } from "@/components/RankMedal";

export const metadata: Metadata = {
  title: "Sports Betting Tipster Leaderboard · Verified Track Records · Bankroller",
  description:
    "The best sports betting tipsters, ranked on a verified, sample-size-adjusted yield (ROI) from every published pick across football, tennis and more. See who really has an edge.",
  keywords: ["sports betting tipsters", "tipster leaderboard", "best betting tips", "verified tipster", "betting yield", "betting ROI"],
  alternates: { canonical: "/leaderboard" },
  openGraph: {
    title: "Sports Betting Tipster Leaderboard · Bankroller",
    description: "The best tipsters, ranked by verified, sample-size-adjusted yield.",
    type: "website", url: "/leaderboard",
  },
};

export default async function LeaderboardPage() {
  const tipsters = await getTopTipsters(50);

  return (
    <div className="fade-in" style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>Sports betting tipster leaderboard</h1>
        <p style={{ color: "var(--text-2)", marginTop: 6, fontSize: 13.5, lineHeight: 1.55, maxWidth: 600 }}>
          The top sports betting tipsters on Bankroller, ranked by a verified, sample-size-adjusted
          yield (ROI) across every published pick, so a long, consistent record beats one lucky bet.
          Follow the tipsters who genuinely have an edge.
        </p>
      </div>

      <details style={{
        marginBottom: 18, padding: "12px 16px", borderRadius: "var(--r-m)",
        border: "1px solid var(--line)", background: "rgba(255,255,255,0.02)",
      }}>
        <summary style={{ cursor: "pointer", fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-2)" }}>
          How is the ranking calculated?
        </summary>
        <div style={{ marginTop: 10, color: "var(--text-3)", fontSize: 12.5, lineHeight: 1.6 }}>
          <p style={{ margin: "0 0 8px" }}>
            Tipsters are ranked by <strong style={{ color: "var(--text-2)" }}>yield</strong>: net units won divided by total units staked, across all settled public tips.
          </p>
          <p style={{ margin: "0 0 8px" }}>
            To keep a single lucky bet from topping the board, yield is <strong style={{ color: "var(--text-2)" }}>adjusted for sample size</strong>:
            a track record with few settled tips is pulled toward a neutral 0%, and counts more at face value as the number of tips grows.
            So 50 tips at a steady +20% outrank one bet at +100%.
          </p>
          <p style={{ margin: 0 }}>
            Asian half-results count too: a ½ win scores as half a win, a ½ loss as half a loss. Only settled tips count; open tips don&apos;t affect the ranking.
          </p>
        </div>
      </details>

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
            <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: medalColor(i + 1) ?? "var(--text-3)", fontWeight: i < 3 ? 600 : 400 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <span style={{ position: "relative", display: "inline-block", width: 30, height: 30, flexShrink: 0 }}>
                <span style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: t.color + "22", border: `1px solid ${t.color}44`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--mono)", fontSize: 10.5, fontWeight: 700, color: t.color,
                }}>{t.initials}</span>
                <RankMedal rank={i < 3 ? i + 1 : undefined} size={15} />
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--text-3)" }}>
                  @{t.username}{t.currency !== "units" ? ` · ${t.currency}` : ""}
                </div>
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

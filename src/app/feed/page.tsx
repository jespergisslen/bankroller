"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/lib/currencyContext";
import { createClient } from "@/lib/supabase";
import { fetchPublicBets, getTopTipsters, type PublicTip, type TipsterRank } from "@/lib/bets";
import { ShareModal } from "@/components/ShareModal";
import { RankMedal, medalColor } from "@/components/RankMedal";
import Link from "next/link";

const BOOKIE_LINKS: Record<string, string> = {
  "Bet365":       "https://www.bet365.com",
  "Unibet":       "https://www.unibet.se",
  "Betsson":      "https://www.betsson.se",
  "ATG":          "https://www.atg.se",
  "NordicBet":    "https://www.nordicbet.com",
  "William Hill": "https://www.williamhill.com",
  "Pinnacle":     "https://www.pinnacle.com",
  "Polymarket":   "https://polymarket.com",
  "LeoVegas":     "https://www.leovegas.com",
  "Betsafe":      "https://www.betsafe.com",
  "Svenska Spel": "https://www.svenskaspel.se",
};

const SPORTS_FILTER = ["All", "⚽ Football", "🎾 Tennis", "🐎 Trotting", "🏀 Basketball"];

type FeedTip = {
  id?: string;
  slug?: string;
  tipster: { name: string; username?: string; initials: string; color: string; verified: boolean };
  sport: string; league: string; match: string; date: string;
  analysis: string; pick: string; odds: number; stake: number;
  bookmaker: string; referralLink?: string | null; postedYield: number | null;
  posted: string;
  isMaxbet: boolean; result: string; profit: number | null; isNew: boolean;
};

const VIEWS = ["Latest", "Upcoming", "Settled", "Top yield"];
const SETTLED_RESULTS = new Set(["win", "loss", "void", "half_win", "half_loss"]);
const PAGE_SIZE = 35;

const tipYield = (t: { profit: number | null; stake: number }) =>
  t.profit !== null && t.stake > 0 ? t.profit / t.stake : -Infinity;

export default function FeedPage() {
  const { stakeLabel } = useCurrency();
  const router = useRouter();
  const [sportFilter, setSportFilter] = useState("All");
  const [view, setView] = useState("Latest");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [realTips, setRealTips] = useState<PublicTip[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [topTipsters, setTopTipsters] = useState<TipsterRank[]>([]);

  useEffect(() => {
    createClient().auth.getSession().then(({ data }) => setIsLoggedIn(!!data.session?.user)).catch(() => {});
    fetchPublicBets({ limit: PAGE_SIZE })
      .then((tips) => { setRealTips(tips); setHasMore(tips.length === PAGE_SIZE); })
      .catch(() => setRealTips([]))
      .finally(() => setLoaded(true));
    getTopTipsters(6).then(setTopTipsters).catch(() => setTopTipsters([]));
  }, []);

  const loadMore = () => {
    const last = realTips[realTips.length - 1];
    if (!last) return;
    setLoadingMore(true);
    fetchPublicBets({ limit: PAGE_SIZE, before: last.createdAt })
      .then((more) => {
        setRealTips((prev) => [...prev, ...more]);
        setHasMore(more.length === PAGE_SIZE);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  };

  const requireAuth = () => {
    router.push(isLoggedIn ? "/dashboard" : "/register");
  };

  const allTips: FeedTip[] = realTips;
  let filtered = allTips.filter((tip) => {
    if (sportFilter !== "All" && tip.sport !== sportFilter.split(" ")[0]) return false;
    if (view === "Upcoming") return tip.result === "open";
    if (view === "Settled" || view === "Top yield") return SETTLED_RESULTS.has(tip.result);
    return true; // Latest
  });
  if (view === "Top yield") {
    filtered = [...filtered].sort((a, b) => tipYield(b) - tipYield(a));
  }
  // Latest / Upcoming / Settled keep the server order (newest placed first).

  // Top-3 tipsters (by yield) get a rank medal wherever their avatar appears.
  const topRank = new Map(topTipsters.slice(0, 3).map((t, i) => [t.username, i + 1]));

  return (
    <div className="fade-in">
      {/* Page head */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>Sports betting tips feed</h1>
          <p style={{ color: "var(--text-2)", marginTop: 4, fontSize: 13.5, lineHeight: 1.55, maxWidth: 560 }}>
            The latest public sports betting tips across football, tennis and more, from tipsters building a verified track record on Bankroller.
          </p>
        </div>
        <button className="btn accent sm" onClick={requireAuth}>+ Publish a tip</button>
      </div>

      {/* Filters */}
      <div className="panel" style={{ padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <span className="label">Sport</span>
        <Segmented options={SPORTS_FILTER} value={sportFilter} onChange={setSportFilter} />
        <div style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--text-3)" }}>
          {filtered.length} tips
        </div>
      </div>

      {/* Two-column layout */}
      <div className="feed-layout" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, alignItems: "start" }}>

        {/* Feed */}
        <div className="panel">
          <div style={{ padding: "14px var(--pad)", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>Tips</span>
            <Segmented options={VIEWS} value={view} onChange={setView} small />
          </div>

          {!loaded ? (
            <div style={{ padding: "60px var(--pad)", textAlign: "center", color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 12.5 }}>
              Loading tips…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "60px var(--pad)", textAlign: "center", color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 12.5 }}>
              {allTips.length === 0 ? "No public tips yet. Be the first to publish one." : "No tips match the filter."}
            </div>
          ) : (
            filtered.map((tip, i) => (
              <FeedRow key={i} tip={tip} stakeLabel={stakeLabel} rank={topRank.get(tip.tipster.username ?? "")} isLast={i === filtered.length - 1 && !hasMore} />
            ))
          )}

          {loaded && hasMore && (
            <div style={{ padding: "16px var(--pad)", textAlign: "center" }}>
              <button className="btn sm" onClick={loadMore} disabled={loadingMore} style={{ minWidth: 140, justifyContent: "center" }}>
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </div>

        {/* Right rail */}
        <div className="feed-sidebar" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Leaderboard — real tipsters by yield */}
          <div className="panel">
            <div style={{ padding: "14px var(--pad)", borderBottom: "1px solid var(--line)", fontWeight: 600, fontSize: 13 }}>
              Top tipsters · yield
            </div>
            <div style={{ padding: "8px 0" }}>
              {topTipsters.length === 0 ? (
                <div style={{ padding: "20px var(--pad)", color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 11.5 }}>
                  No ranked tipsters yet.
                </div>
              ) : topTipsters.map((t, i) => (
                <Link key={t.username} href={`/u/${t.username}`} style={{
                  display: "grid", gridTemplateColumns: "26px 32px 1fr auto",
                  alignItems: "center", gap: 10,
                  padding: "9px var(--pad)",
                  borderBottom: i < topTipsters.length - 1 ? "1px solid var(--line)" : "none",
                  textDecoration: "none", color: "inherit", transition: "background 0.1s",
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: medalColor(i + 1) ?? "var(--text-3)", fontWeight: i < 3 ? 600 : 400 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: t.color + "22", border: `1px solid ${t.color}44`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600, color: t.color,
                  }}>{t.initials}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
                    <div style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 10.5, marginTop: 1 }}>
                      {t.tips} tip{t.tips === 1 ? "" : "s"}
                    </div>
                  </div>
                  {t.yieldPct !== null ? (
                    <div className={`num ${t.yieldPct >= 0 ? "pos glow" : "neg"}`} style={{ fontSize: 13.5, fontWeight: 600 }}>
                      {t.yieldPct >= 0 ? "+" : ""}{t.yieldPct.toFixed(1)}%
                    </div>
                  ) : (
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--text-4)" }}>—</div>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Become a tipster CTA — no pricing */}
          <div className="panel" style={{ padding: "var(--pad)" }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Share your picks</div>
            <div style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
              Log your bets, publish your analysis, and build a verified track record the community can follow.
            </div>
            <button className="btn accent" style={{ width: "100%", justifyContent: "center" }} onClick={requireAuth}>Get started →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedRow({ tip, stakeLabel, rank, isLast }: {
  tip: FeedTip;
  stakeLabel: string;
  rank?: number;
  isLast: boolean;
}) {
  const [shareOpen, setShareOpen] = useState(false);
  const bookieUrl = tip.referralLink || BOOKIE_LINKS[tip.bookmaker] || null;
  const shareText = `${tip.match}: ${tip.pick} @ ${tip.odds.toFixed(2)} (${tip.tipster.name} on Bankroller)`;
  const shareId = tip.slug || tip.id;
  const stakeDisplay = `${tip.stake}${stakeLabel === "u" ? "u" : " " + stakeLabel}`;

  return (
    <div className="feed-row" style={{
      display: "grid", gridTemplateColumns: "44px 1fr auto",
      gap: 14, padding: "18px var(--pad)",
      borderBottom: isLast ? "none" : "1px solid var(--line)",
      transition: "background 0.1s",
    }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.015)"}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
    >
      {/* Avatar — links to the tipster's profile */}
      {(() => {
        const avatar = (
          <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 11,
              background: tip.tipster.color + "22",
              border: `1px solid ${tip.tipster.color}44`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, color: tip.tipster.color,
            }}>{tip.tipster.initials}</div>
            <RankMedal rank={rank} />
          </div>
        );
        return tip.tipster.username ? (
          <a href={`/u/${tip.tipster.username}`} aria-label={`${tip.tipster.name}'s profile`} style={{ textDecoration: "none", flexShrink: 0 }}>
            {avatar}
          </a>
        ) : avatar;
      })()}

      {/* Body */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
          {tip.tipster.username ? (
            <a href={`/u/${tip.tipster.username}`} style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text)", textDecoration: "none" }}>
              {tip.tipster.name}
            </a>
          ) : (
            <span style={{ fontWeight: 600, fontSize: 13.5 }}>{tip.tipster.name}</span>
          )}
          {tip.tipster.verified && (
            <span title="Verified tipster" style={{ color: "var(--accent)", fontSize: 11 }}>✓</span>
          )}
          <span style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 11 }}>
            {tip.sport} {tip.league} · {tip.date}
          </span>
          {tip.isMaxbet && (
            <span title="Maxbet: highest-conviction pick" style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
              textTransform: "uppercase", color: "var(--accent)",
              padding: "2px 7px 2px 5px", borderRadius: 5,
              background: "color-mix(in oklch, var(--accent) 12%, transparent)",
              border: "1px solid color-mix(in oklch, var(--accent) 30%, transparent)",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo/bankroller-mark-accent.png" alt="" style={{ width: 13, height: 13 }} />
              Maxbet
            </span>
          )}
        </div>

        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{tip.match}</div>

        <div style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.65, maxWidth: "64ch", marginBottom: 12, whiteSpace: "pre-wrap" }}>
          {tip.analysis}
        </div>

        {/* Pick box */}
        <div className="feed-pick" style={{
          display: "inline-flex", alignItems: "center",
          background: "var(--bg-2)",
          border: "1px solid var(--line-2)",
          borderRadius: "var(--r-m)",
          overflow: "hidden",
        }}>
          <div style={{ padding: "10px 16px", borderRight: "1px solid var(--line)" }}>
            <div className="label" style={{ marginBottom: 3 }}>Pick</div>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>{tip.pick}</div>
          </div>
          <div style={{ padding: "10px 16px", borderRight: "1px solid var(--line)" }}>
            <div className="label" style={{ marginBottom: 3 }}>Odds</div>
            <div className="num pos glow" style={{ fontSize: 17, fontWeight: 500 }}>{tip.odds.toFixed(2)}</div>
          </div>
          <div style={{ padding: "10px 16px", borderRight: "1px solid var(--line)" }}>
            <div className="label" style={{ marginBottom: 3 }}>Stake</div>
            <div className="num" style={{ fontSize: 13.5, color: "var(--text-2)" }}>{stakeDisplay}</div>
          </div>
          {bookieUrl ? (
            <a
              href={bookieUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "10px 16px",
                display: "flex", flexDirection: "column", gap: 3,
                textDecoration: "none", transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
            >
              <div className="label" style={{ marginBottom: 3 }}>Bet at</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--accent)", fontWeight: 500 }}>
                {tip.bookmaker} ↗
              </div>
            </a>
          ) : (
            <div style={{ padding: "10px 16px", display: "flex", flexDirection: "column", gap: 3 }}>
              <div className="label" style={{ marginBottom: 3 }}>Bet at</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-2)", fontWeight: 500 }}>
                {tip.bookmaker}
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "var(--text-4)", fontFamily: "var(--mono)", fontSize: 10.5 }}>{tip.posted}</span>
          {shareId && (
            <button
              onClick={() => setShareOpen(true)}
              className="btn sm"
              style={{
                color: "var(--accent)",
                borderColor: "color-mix(in oklch, var(--accent) 35%, transparent)",
                background: "color-mix(in oklch, var(--accent) 8%, transparent)",
              }}
            >
              ↗ Share
            </button>
          )}
        </div>
        {shareOpen && shareId && (
          <ShareModal tipId={shareId} shareText={shareText} onClose={() => setShareOpen(false)} />
        )}
      </div>

      {/* Status / result badge */}
      <div className="feed-yield" style={{ textAlign: "right", flexShrink: 0 }}>
        {tip.result !== "open" ? (
          <ResultBadge result={tip.result} profit={tip.profit} stakeLabel={stakeLabel} />
        ) : tip.isNew ? (
          <span style={{
            fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
            padding: "2px 7px", borderRadius: 4,
            background: "color-mix(in oklch, #5ad1ff 12%, transparent)", color: "#5ad1ff",
            border: "1px solid color-mix(in oklch, #5ad1ff 30%, transparent)",
          }}>NEW</span>
        ) : (
          <span style={{
            fontFamily: "var(--mono)", fontSize: 10, padding: "2px 7px", borderRadius: 4,
            background: "rgba(255,255,255,0.05)", color: "var(--text-3)",
            border: "1px solid var(--line-2)",
          }}>OPEN</span>
        )}
      </div>
    </div>
  );
}

function ResultBadge({ result, profit, stakeLabel }: { result: string; profit: number | null; stakeLabel: string }) {
  const won = result === "win" || result === "half_win";
  const lost = result === "loss" || result === "half_loss";
  const label = result === "win" ? "WON" : result === "loss" ? "LOST"
    : result === "half_win" ? "HALF WON" : result === "half_loss" ? "HALF LOST" : "VOID";
  const color = won ? "var(--accent)" : lost ? "#e05555" : "var(--text-3)";
  const unit = stakeLabel === "u" ? "u" : " " + stakeLabel;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
      <span style={{
        fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
        padding: "2px 8px", borderRadius: 4,
        color, background: `color-mix(in oklch, ${color} 13%, transparent)`,
        border: `1px solid color-mix(in oklch, ${color} 30%, transparent)`,
      }}>{label}</span>
      {profit !== null && (
        <span className={`num ${profit > 0 ? "pos glow" : profit < 0 ? "neg" : ""}`} style={{ fontSize: 14, fontWeight: 600 }}>
          {profit > 0 ? "+" : ""}{profit}{unit}
        </span>
      )}
    </div>
  );
}

function Segmented({ options, value, onChange, accent, small }: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div style={{
      display: "flex", gap: 3,
      background: "var(--bg-1)", border: "1px solid var(--line)",
      borderRadius: "var(--r-s)", padding: 2,
    }}>
      {options.map(opt => {
        const on = opt === value;
        return (
          <button key={opt} onClick={() => onChange(opt)} style={{
            fontFamily: "var(--mono)", fontSize: small ? 10.5 : 11.5,
            padding: small ? "3px 8px" : "4px 10px",
            borderRadius: 4, border: "none", cursor: "pointer",
            background: on ? "rgba(255,255,255,0.07)" : "transparent",
            color: on ? (accent ? "var(--accent)" : "var(--text)") : "var(--text-2)",
            transition: "all 0.15s", whiteSpace: "nowrap",
          }}>{opt}</button>
        );
      })}
    </div>
  );
}

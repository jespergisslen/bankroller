"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/lib/currencyContext";
import { createClient } from "@/lib/supabase";
import { fetchPublicBets, type PublicTip } from "@/lib/bets";
import { ShareModal } from "@/components/ShareModal";

const TIPSTERS = [
  { id: "vh",  name: "ValueHunter", initials: "VH", color: "#00e5a0", verified: true,  yield: 12.4, tips: 612  },
  { id: "xg",  name: "xG_Machine",  initials: "XG", color: "#5ad1ff", verified: true,  yield: 9.8,  tips: 488  },
  { id: "ace", name: "AceServe",    initials: "AS", color: "#e6b23a", verified: true,  yield: 8.1,  tips: 295  },
  { id: "gr",  name: "GreenRoom",   initials: "GR", color: "#b48cff", verified: false, yield: 6.5,  tips: 188  },
  { id: "tt",  name: "TravTanten",  initials: "TT", color: "#ff7a7a", verified: true,  yield: 5.2,  tips: 522  },
  { id: "sl",  name: "SharpLines",  initials: "SL", color: "#00e5a0", verified: true,  yield: 4.9,  tips: 210  },
];

const BOOKIE_LINKS: Record<string, string> = {
  "Bet365":       "https://www.bet365.com",
  "Unibet":       "https://www.unibet.se",
  "Betsson":      "https://www.betsson.se",
  "ATG":          "https://www.atg.se",
  "NordicBet":    "https://www.nordicbet.com",
  "William Hill": "https://www.williamhill.com",
  "Pinnacle":     "https://www.pinnacle.com",
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
};

export default function FeedPage() {
  const { stakeLabel } = useCurrency();
  const router = useRouter();
  const [sportFilter, setSportFilter] = useState("All");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [realTips, setRealTips] = useState<PublicTip[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user));
    fetchPublicBets()
      .then(setRealTips)
      .catch(() => setRealTips([]))
      .finally(() => setLoaded(true));
  }, []);

  const requireAuth = () => {
    router.push(isLoggedIn ? "/dashboard" : "/register");
  };

  const allTips: FeedTip[] = realTips;
  const filtered = allTips.filter(tip =>
    sportFilter === "All" || tip.sport === sportFilter.split(" ")[0]
  );

  return (
    <div className="fade-in">
      {/* Page head */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>Feed</h1>
          <p style={{ color: "var(--text-2)", marginTop: 4, fontSize: 13.5 }}>Public picks from verified tipsters.</p>
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
            <span style={{ fontWeight: 600, fontSize: 13 }}>Latest tips</span>
            <Segmented options={["Latest", "Yield", "Hottest"]} value="Latest" onChange={() => {}} small />
          </div>

          {!loaded ? (
            <div style={{ padding: "60px var(--pad)", textAlign: "center", color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 12.5 }}>
              Loading tips…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "60px var(--pad)", textAlign: "center", color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 12.5 }}>
              {allTips.length === 0 ? "No public tips yet — be the first to publish one." : "No tips match the filter."}
            </div>
          ) : (
            filtered.map((tip, i) => (
              <FeedRow key={i} tip={tip} stakeLabel={stakeLabel} isLast={i === filtered.length - 1} />
            ))
          )}
        </div>

        {/* Right rail */}
        <div className="feed-sidebar" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Leaderboard */}
          <div className="panel">
            <div style={{ padding: "14px var(--pad)", borderBottom: "1px solid var(--line)", fontWeight: 600, fontSize: 13 }}>
              Top tipsters · yield
            </div>
            <div style={{ padding: "8px 0" }}>
              {TIPSTERS.map((t, i) => (
                <div key={t.id} style={{
                  display: "grid", gridTemplateColumns: "26px 32px 1fr auto",
                  alignItems: "center", gap: 10,
                  padding: "9px var(--pad)",
                  borderBottom: i < TIPSTERS.length - 1 ? "1px solid var(--line)" : "none",
                  cursor: "pointer", transition: "background 0.1s",
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: i < 3 ? "var(--accent)" : "var(--text-3)", fontWeight: i < 3 ? 600 : 400 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: t.color + "22", border: `1px solid ${t.color}44`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600, color: t.color,
                  }}>{t.initials}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {t.name}
                      {t.verified && <span style={{ color: "var(--accent)", marginLeft: 4, fontSize: 11 }}>✓</span>}
                    </div>
                    <div style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 10.5, marginTop: 1 }}>
                      {t.tips} tips
                    </div>
                  </div>
                  <div className="num pos glow" style={{ fontSize: 13.5, fontWeight: 600 }}>+{t.yield}%</div>
                </div>
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

function FeedRow({ tip, stakeLabel, isLast }: {
  tip: FeedTip;
  stakeLabel: string;
  isLast: boolean;
}) {
  const [shareOpen, setShareOpen] = useState(false);
  const bookieUrl = tip.referralLink || BOOKIE_LINKS[tip.bookmaker] || "#";
  const shareText = `${tip.match} — ${tip.pick} @ ${tip.odds.toFixed(2)} (${tip.tipster.name} on Bankroller)`;
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
      {/* Avatar */}
      <div style={{
        width: 44, height: 44, borderRadius: 11,
        background: tip.tipster.color + "22",
        border: `1px solid ${tip.tipster.color}44`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, color: tip.tipster.color,
        flexShrink: 0,
      }}>{tip.tipster.initials}</div>

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
        </div>

        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{tip.match}</div>

        <div style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.65, maxWidth: "64ch", marginBottom: 12 }}>
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

      {/* Yield badge */}
      <div className="feed-yield" style={{ textAlign: "right", flexShrink: 0 }}>
        {tip.postedYield !== null ? (
          <>
            <div className="label" style={{ marginBottom: 6 }}>verified yield</div>
            <div className="num pos glow" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>
              +{tip.postedYield}%
            </div>
          </>
        ) : (
          <span style={{
            fontFamily: "var(--mono)", fontSize: 10, padding: "2px 7px", borderRadius: 4,
            background: "color-mix(in oklch, var(--accent) 12%, transparent)", color: "var(--accent)",
          }}>NEW</span>
        )}
      </div>
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

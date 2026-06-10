"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/lib/currencyContext";
import { createClient } from "@/lib/supabase";

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

const FEED = [
  {
    tipster: TIPSTERS[0], sport: "🎾",
    league: "Roland Garros · Men's Final", match: "Jannik Sinner – Carlos Alcaraz", date: "Sun 8 Jun · 15:00 CET",
    analysis: "The final we all wanted. Sinner has been immaculate on clay this fortnight — zero dropped sets, best return stats in the draw. Alcaraz is brilliant but has looked slightly leggy after a brutal semi. Sinner's consistency should prevail in a long match. Total looks set high given both players' defensive quality; backing under.",
    pick: "Under 40.5 games", odds: 1.87, stake: 2.0,
    bookmaker: "Unibet", postedYield: 12.4, posted: "2 hr ago",
  },
  {
    tipster: TIPSTERS[1], sport: "🎾",
    league: "Roland Garros · Men's Final", match: "Jannik Sinner – Carlos Alcaraz", date: "Sun 8 Jun · 15:00 CET",
    analysis: "Model strongly disagrees with the market on Sinner ML. His clay-court xRating this season is the highest since Nadal's peak years. Alcaraz's movement has been visibly restricted on his left ankle — worth monitoring but the price hasn't moved.",
    pick: "Sinner to win", odds: 2.10, stake: 1.5,
    bookmaker: "Pinnacle", postedYield: 9.8, posted: "1 hr ago",
  },
  {
    tipster: TIPSTERS[2], sport: "🏀",
    league: "NBA Finals · Game 4", match: "Oklahoma City Thunder – Minnesota Timberwolves", date: "Tue 10 Jun · 02:30 CET",
    analysis: "OKC lead the series 2-1 and are 8-1 at home in the playoffs. Minnesota's defence on Gilgeous-Alexander has been leaky in the half-court. Home side to cover a -5.5 spread that feels conservative given the crowd advantage at Paycom Center.",
    pick: "OKC -5.5", odds: 1.91, stake: 1.5,
    bookmaker: "Bet365", postedYield: 8.1, posted: "3 hr ago",
  },
  {
    tipster: TIPSTERS[3], sport: "⚽",
    league: "FIFA World Cup 2026 · Group A", match: "Mexico – Poland", date: "Thu 11 Jun · 21:00 CET",
    analysis: "Tournament opener and Mexico are huge home-crowd favourites playing in front of 80k at Estadio Azteca. Poland rely on Lewandowski who's 38 and hasn't scored in a major tournament opener since 2018. Mexico have looked sharp in warm-ups. Backing the hosts on the Asian line.",
    pick: "Mexico -0.25 AH", odds: 1.95, stake: 1.75,
    bookmaker: "Betsson", postedYield: 6.5, posted: "5 hr ago",
  },
  {
    tipster: TIPSTERS[5], sport: "⚽",
    league: "FIFA World Cup 2026 · Group B", match: "England – Serbia", date: "Fri 12 Jun · 18:00 CET",
    analysis: "England are heavy favourites but Serbia are pragmatic and well-organised — they'll park and counter. Under the total is my angle here. Both teams played out 1-0s in their last warm-up games. Tournament overs tend to be inflated early on before market adjusts.",
    pick: "Under 2.5 goals", odds: 2.05, stake: 2.0,
    bookmaker: "William Hill", postedYield: 4.9, posted: "6 hr ago",
  },
  {
    tipster: TIPSTERS[4], sport: "🐎",
    league: "Solvalla · V75 Rnd 4", match: "V75-4 · Solvalla", date: "Sat 7 Jun · 19:30 CET",
    analysis: "Track was re-watered after yesterday's heat and the inner lane has been dominant all night. The market favourite in this leg has a wide post position and a tendency to break gait in tight fields. Two value horses drawn inside at 8-1 and 12-1.",
    pick: "Jackpot Reserve (trap 3)", odds: 8.50, stake: 0.5,
    bookmaker: "ATG", postedYield: 5.2, posted: "1 hr ago",
  },
  {
    tipster: TIPSTERS[0], sport: "⚽",
    league: "FIFA World Cup 2026 · Group C", match: "Brazil – Croatia", date: "Sat 14 Jun · 21:00 CET",
    analysis: "Brazil finally look like themselves again under the new coach — high press, Vinicius Jr at his electric best. Croatia won't have the same Modric they had in 2022. Brazil to win and both teams to score feels like the spot here given Croatia's counter-attacking threat.",
    pick: "Brazil win & BTTS", odds: 2.40, stake: 1.25,
    bookmaker: "Unibet", postedYield: 12.4, posted: "20 min ago",
  },
  {
    tipster: TIPSTERS[2], sport: "🎾",
    league: "Queen's Club · R1", match: "Carlos Alcaraz – Jack Draper", date: "Mon 9 Jun · 13:00 CET",
    analysis: "Alcaraz rolls straight from Paris to London and Draper is the wildcard home favourite. But grass is Alcaraz's best surface and Draper hasn't played competitively in 3 weeks. Backing Alcaraz in straight sets — market undervalues his grass-court dominance.",
    pick: "Alcaraz -1.5 sets", odds: 1.78, stake: 1.0,
    bookmaker: "NordicBet", postedYield: 8.1, posted: "45 min ago",
  },
];

const SPORTS_FILTER = ["All", "⚽ Football", "🎾 Tennis", "🐎 Trotting", "🏀 Basketball"];

export default function FeedPage() {
  const { stakeLabel } = useCurrency();
  const router = useRouter();
  const [sportFilter, setSportFilter] = useState("All");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user));
  }, []);

  const requireAuth = () => {
    router.push(isLoggedIn ? "/dashboard" : "/register");
  };

  const filtered = FEED.filter(tip =>
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

          {filtered.length === 0 ? (
            <div style={{ padding: "60px var(--pad)", textAlign: "center", color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 12.5 }}>
              No tips match the filter.
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
  tip: typeof FEED[0];
  stakeLabel: string;
  isLast: boolean;
}) {
  const bookieUrl = BOOKIE_LINKS[tip.bookmaker];
  const stakeDisplay = `${tip.stake}${stakeLabel === "u" ? "u" : " " + stakeLabel}`;

  return (
    <div style={{
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
          <span style={{ fontWeight: 600, fontSize: 13.5 }}>{tip.tipster.name}</span>
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
        <div style={{
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

        <div style={{ marginTop: 8, color: "var(--text-4)", fontFamily: "var(--mono)", fontSize: 10.5 }}>
          {tip.posted}
        </div>
      </div>

      {/* Yield badge */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div className="label" style={{ marginBottom: 6 }}>verified yield</div>
        <div className="num pos glow" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>
          +{tip.postedYield}%
        </div>

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

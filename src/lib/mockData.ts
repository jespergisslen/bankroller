// A realistic bankroll equity curve: a steady long-term edge with genuine
// day-to-day swings and the odd drawdown, drifting slowly upward. Generated
// deterministically (fixed-seed mulberry32) so the server and client render
// the exact same curve and there is no hydration mismatch.
export const BANKROLL_START = 10000;
export const BANKROLL_CURVE = (() => {
  const N = 110;
  let v = BANKROLL_START;
  const pts = [Math.round(v)];
  let seed = 0x9e3779b9;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = 1; i < N; i++) {
    const drift = 23;                     // the edge: steady upward pull
    const noise = (rand() - 0.5) * 150;   // day-to-day swing (+/- ~75)
    const wave = Math.sin(i / 6.5) * 22;  // slower winning/losing phases
    v += drift + noise + wave;
    pts.push(Math.round(v));
  }
  return pts;
})();

export const BANKROLL_NOW = BANKROLL_CURVE[BANKROLL_CURVE.length - 1];
const BANKROLL_GROWTH_PCT = ((BANKROLL_NOW - BANKROLL_START) / BANKROLL_START) * 100;

export const DASH_KPIS = [
  { k: "Bankroll",  v: "$" + BANKROLL_NOW.toLocaleString("en-US"), d: `+${BANKROLL_GROWTH_PCT.toFixed(1)}%`, up: true,  sub: "all time" },
  { k: "Yield",     v: "+8.4 %",   d: "+0.6",  up: true,  sub: "642 bets" },
  { k: "Win rate",  v: "54.2 %",   d: "+1.1",  up: true,  sub: "348 / 642" },
  { k: "CLV",       v: "+2.1 %",   d: "+0.3",  up: true,  sub: "closing line" },
  { k: "Open exp.", v: "$1,240", d: "5 bets", up: null,  sub: "live" },
];

export const YIELD_SPORT = [
  { name: "Football", emoji: "⚽", val: 11.2, vol: 312 },
  { name: "Tennis",   emoji: "🎾", val: 6.8,  vol: 142 },
  { name: "Golf",     emoji: "⛳", val: 14.6, vol: 58  },
  { name: "Trotting", emoji: "🐎", val: -3.4, vol: 130 },
];

export const YIELD_MARKET = [
  { name: "Asian Handicap", val: 9.7,  vol: 188 },
  { name: "Top goalscorer", val: 16.2, vol: 74  },
  { name: "Bookings",       val: -5.1, vol: 96  },
  { name: "1X2",            val: 4.3,  vol: 142 },
  { name: "BTTS",           val: 7.8,  vol: 86  },
  { name: "Over / Under",   val: -1.9, vol: 56  },
];

export type Selection = {
  sport: string;
  match: string;
  market: string;
  line: string;
  odds: number;
  closingOdds: number | null;
};

export type Bet = {
  id?: string;
  date: string;
  isoDate?: string;     // raw YYYY-MM-DD event date (for overdue-settlement checks)
  betType: "Single" | "Double" | "Treble" | "Accumulator";
  stake: number;
  result: string;
  profit: number | null;
  bookmaker?: string | null;
  referralLink?: string | null;
  isPublic?: boolean;
  analysis?: string | null;
  isMaxbet?: boolean;
  selections: Selection[];
};

// Helpers
const single = (
  date: string, sport: string, match: string,
  market: string, line: string, odds: number,
  closingOdds: number | null, stake: number, result: string, profit: number | null
): Bet => ({
  date, betType: "Single", stake, result, profit,
  selections: [{ sport, match, market, line, odds, closingOdds }],
});

export const RECENT_BETS: Bet[] = [
  single("04 Jun", "⚽", "Arsenal – Man City",  "Asian Handicap", "+0.5 ARS",       1.92, null, 2.0, "open", null),
  single("04 Jun", "🎾", "Sinner – Alcaraz",    "Over / Under",   "Over 38.5 gms",  1.85, null, 1.5, "open", null),
  // Double: Liverpool BTTS + Real Betis BTTS
  {
    date: "03 Jun", betType: "Double", stake: 1.0, result: "win", profit: 3.10,
    selections: [
      { sport: "⚽", match: "Liverpool – Chelsea",  market: "BTTS",           line: "Yes",           odds: 1.78, closingOdds: 1.72 },
      { sport: "⚽", match: "Real – Betis",         market: "BTTS",           line: "Yes",           odds: 1.75, closingOdds: 1.68 },
    ],
  },
  single("03 Jun", "⚽", "Liverpool – Chelsea",  "Top goalscorer", "Salah anytime",  2.30, 2.05, 2.0, "win",  2.60),
  single("03 Jun", "⛳", "PGA · Memorial",        "1X2",            "Scheffler top 5",2.10, 2.00, 1.5, "win",  1.65),
  // Treble: three football 1X2s
  {
    date: "02 Jun", betType: "Treble", stake: 0.5, result: "loss", profit: -0.5,
    selections: [
      { sport: "⚽", match: "Man City – Newcastle",  market: "1X2", line: "Man City",  odds: 1.55, closingOdds: 1.50 },
      { sport: "⚽", match: "PSG – Lyon",            market: "1X2", line: "PSG",       odds: 1.62, closingOdds: 1.58 },
      { sport: "⚽", match: "Bayern – Dortmund",     market: "1X2", line: "Bayern",    odds: 1.70, closingOdds: 1.65 },
    ],
  },
  single("02 Jun", "🐎", "Solvalla V75-4",        "1X2",            "Don Fanucci",    3.40, 4.20, 1.0, "loss", -1.0),
  single("01 Jun", "⚽", "Inter – Napoli",         "Bookings",       "Over 4.5",       1.95, 1.88, 1.5, "loss", -1.5),
  single("01 Jun", "🎾", "Zverev – Medvedev",      "Asian Handicap", "-1.5 sets ZVE",  2.05, 1.82, 1.5, "win",  1.58),
  single("31 May", "⚽", "Brighton – Spurs",        "Over / Under",   "Over 2.5",       1.88, 1.85, 2.0, "win",  1.76),
  single("31 May", "🐎", "Åby V64-2",              "1X2",            "Global Withdraw", 2.60, 2.75, 1.0, "void", 0),
];

export const BANKROLL_CURVE = (() => {
  let v = 20000;
  const pts = [v];
  const seed = [120,-80,260,90,-140,310,-60,180,40,-220,260,150,-90,80,330,-180,
    210,90,-60,270,120,-160,380,-90,140,60,-240,290,170,80,-120,360,-70,200,110,
    -180,420,90,-60,250,140,-200,330,180,-90,70,290,-150,210,120,80,-110,400,-80,
    240,160,-190,360,110,-70,300,180,-130,90,420,-160,260,140,80,-100,380,-90,
    240,170,-180,440,120,-60,320,200,-140,100,460,-150,280,160,90,-110,500,-80,310,210];
  seed.forEach(d => { v += d; pts.push(v); });
  return pts;
})();

export const BANKROLL_NOW = BANKROLL_CURVE[BANKROLL_CURVE.length - 1];

export const DASH_KPIS = [
  { k: "Bankroll",    v: BANKROLL_NOW.toLocaleString("sv-SE") + " kr", d: "+24.8%", up: true,  sub: "all time" },
  { k: "Yield",       v: "+8.4 %",  d: "+0.6",  up: true,  sub: "642 bets" },
  { k: "Win rate",    v: "54.2 %",  d: "+1.1",  up: true,  sub: "348 / 642" },
  { k: "CLV",         v: "+2.1 %",  d: "+0.3",  up: true,  sub: "closing line" },
  { k: "Open exp.",   v: "1 240 kr", d: "5 bets", up: null, sub: "live" },
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

export const RECENT_BETS = [
  { date: "04 Jun", match: "Arsenal – Man City",   sport: "⚽", market: "Asian Handicap", line: "+0.5 ARS",      odds: 1.92, closingOdds: null,  stake: 2.0, result: "open", profit: null },
  { date: "04 Jun", match: "Sinner – Alcaraz",     sport: "🎾", market: "Over / Under",   line: "Over 38.5 gms", odds: 1.85, closingOdds: null,  stake: 1.5, result: "open", profit: null },
  { date: "03 Jun", match: "Liverpool – Chelsea",  sport: "⚽", market: "Top goalscorer", line: "Salah anytime", odds: 2.30, closingOdds: 2.05,  stake: 2.0, result: "win",  profit: 2.60 },
  { date: "03 Jun", match: "PGA — Memorial",       sport: "⛳", market: "1X2",            line: "Scheffler top 5",odds: 2.10,closingOdds: 2.00,  stake: 1.5, result: "win",  profit: 1.65 },
  { date: "02 Jun", match: "Solvalla V75-4",       sport: "🐎", market: "1X2",            line: "Don Fanucci",   odds: 3.40, closingOdds: 4.20,  stake: 1.0, result: "loss", profit: -1.0 },
  { date: "02 Jun", match: "Real – Betis",         sport: "⚽", market: "BTTS",           line: "Yes",           odds: 1.75, closingOdds: 1.68,  stake: 2.0, result: "win",  profit: 1.50 },
  { date: "01 Jun", match: "Inter – Napoli",       sport: "⚽", market: "Bookings",       line: "Over 4.5",      odds: 1.95, closingOdds: 1.88,  stake: 1.5, result: "loss", profit: -1.5 },
  { date: "01 Jun", match: "Zverev – Medvedev",    sport: "🎾", market: "Asian Handicap", line: "-1.5 sets ZVE", odds: 2.05, closingOdds: 1.82,  stake: 1.5, result: "win",  profit: 1.58 },
  { date: "31 May", match: "Brighton – Spurs",     sport: "⚽", market: "Over / Under",   line: "Over 2.5",      odds: 1.88, closingOdds: 1.85,  stake: 2.0, result: "win",  profit: 1.76 },
  { date: "31 May", match: "Åby V64-2",            sport: "🐎", market: "1X2",            line: "Global Withdraw",odds: 2.60,closingOdds: 2.75,  stake: 1.0, result: "void", profit: 0    },
];

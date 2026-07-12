import type { Bet } from "./mockData";

export interface BetStats {
  netUnits: number;          // total profit in units
  totalStaked: number;
  yieldPct: number | null;   // profit / staked
  winRate: number | null;    // wins / settled
  settledCount: number;
  winCount: number;
  betCount: number;
  avgClv: number | null;     // average CLV across selections w/ closing odds
  openExposure: number;      // sum of stakes on open bets
  openCount: number;
  curve: number[];           // cumulative net units over time (oldest → newest)
  bySport: { name: string; emoji: string; val: number; vol: number }[];
  byMarket: { name: string; val: number; vol: number }[];
}

const SPORT_EMOJI: Record<string, string> = {
  Football: "⚽", Tennis: "🎾", Golf: "⛳", Trotting: "🐎",
  Basketball: "🏀", "Ice Hockey": "🏒", Other: "🎱",
};

export function computeStats(bets: Bet[]): BetStats {
  let netUnits = 0;
  let totalStaked = 0;
  let settledCount = 0;
  let winCount = 0;
  let openExposure = 0;
  let openCount = 0;

  const clvVals: number[] = [];

  // Group accumulators for yield breakdowns
  const sportAgg: Record<string, { profit: number; staked: number; vol: number; emoji: string }> = {};
  const marketAgg: Record<string, { profit: number; staked: number; vol: number }> = {};

  // Reverse so oldest first for the curve (fetchMyBets returns newest first)
  const chronological = [...bets].reverse();
  const curve: number[] = [];
  let running = 0;

  for (const bet of chronological) {
    totalStaked += bet.stake;

    if (bet.result === "open") {
      openExposure += bet.stake;
      openCount += 1;
    } else {
      settledCount += 1;
      if (bet.result === "win") winCount += 1;
      if (bet.profit !== null) {
        netUnits += bet.profit;
        running += bet.profit;
      }
    }
    curve.push(running);

    // CLV per selection
    for (const sel of bet.selections) {
      if (sel.closingOdds && sel.closingOdds > 0) {
        clvVals.push(((sel.odds / sel.closingOdds) - 1) * 100);
      }
    }

    // Sport / market breakdown — attribute settled profit to first selection's sport/market
    if (bet.result !== "open" && bet.profit !== null) {
      const sel0 = bet.selections[0];
      if (sel0) {
        const sportName = sel0.sport ?? "Other";
        if (!sportAgg[sportName]) sportAgg[sportName] = { profit: 0, staked: 0, vol: 0, emoji: SPORT_EMOJI[sportName] ?? "" };
        sportAgg[sportName].profit += bet.profit;
        sportAgg[sportName].staked += bet.stake;
        sportAgg[sportName].vol += 1;

        const m = sel0.market || "Other";
        if (!marketAgg[m]) marketAgg[m] = { profit: 0, staked: 0, vol: 0 };
        marketAgg[m].profit += bet.profit;
        marketAgg[m].staked += bet.stake;
        marketAgg[m].vol += 1;
      }
    }
  }

  const settledStaked = chronological
    .filter(b => b.result !== "open")
    .reduce((s, b) => s + b.stake, 0);

  return {
    netUnits,
    totalStaked,
    yieldPct: settledStaked > 0 ? (netUnits / settledStaked) * 100 : null,
    winRate: settledCount > 0 ? (winCount / settledCount) * 100 : null,
    settledCount,
    winCount,
    betCount: bets.length,
    avgClv: clvVals.length > 0 ? clvVals.reduce((a, b) => a + b, 0) / clvVals.length : null,
    openExposure,
    openCount,
    curve: curve.length > 0 ? curve : [0],
    bySport: Object.entries(sportAgg)
      .map(([name, a]) => ({ name, emoji: a.emoji, val: a.staked > 0 ? (a.profit / a.staked) * 100 : 0, vol: a.vol }))
      .sort((a, b) => b.val - a.val),
    byMarket: Object.entries(marketAgg)
      .map(([name, a]) => ({ name, val: a.staked > 0 ? (a.profit / a.staked) * 100 : 0, vol: a.vol }))
      .sort((a, b) => b.val - a.val),
  };
}

import { createClient } from "./supabase";
import type { Bet, Selection } from "./mockData";

const SPORT_EMOJI: Record<string, string> = {
  Football: "⚽", Tennis: "🎾", Golf: "⛳", Trotting: "🐎",
  Basketball: "🏀", "Ice Hockey": "🏒", Other: "🎱",
};
const AVATAR_COLORS = ["#00e5a0", "#5ad1ff", "#e6b23a", "#b48cff", "#ff7a7a"];

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export interface PublicTip {
  id: string;
  tipster: { name: string; initials: string; color: string; verified: boolean };
  sport: string;       // emoji
  league: string;
  match: string;
  date: string;
  analysis: string;
  pick: string;
  odds: number;
  stake: number;
  bookmaker: string;
  referralLink: string | null;
  postedYield: number | null;
  posted: string;
}

// Fetch all public bets (the community feed)
export async function fetchPublicBets(): Promise<PublicTip[]> {
  const supabase = createClient();
  const { data: betsData, error } = await supabase
    .from("bets")
    .select("*, selections(*)")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error || !betsData) return [];

  // Fetch author profiles
  const userIds = [...new Set(betsData.map((b) => b.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .in("id", userIds);
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return betsData.map((b) => {
    const sels = (b.selections as Selection[] & { sort_order?: number }[])
      .slice()
      .sort((a: any, c: any) => (a.sort_order ?? 0) - (c.sort_order ?? 0));
    const sel0 = sels[0] ?? ({} as any);
    const combinedOdds = sels.reduce((acc: number, s: any) => acc * Number(s.odds), 1);
    const isMulti = b.bet_type !== "Single";

    const prof = profileMap.get(b.user_id);
    const name = prof?.display_name || prof?.username || "Anonymous";
    const initials = name.slice(0, 2).toUpperCase();
    const colorIdx = name.charCodeAt(0) % AVATAR_COLORS.length;

    const pick = isMulti
      ? sels.map((s: any) => s.line || s.match).join(" + ")
      : (sel0.line || sel0.market || sel0.match || "");

    return {
      id: b.id,
      tipster: { name, initials, color: AVATAR_COLORS[colorIdx], verified: false },
      sport: SPORT_EMOJI[sel0.sport] ?? sel0.sport ?? "🎱",
      league: isMulti ? `${b.bet_type} · ${sels.length} selections` : (sel0.market || ""),
      match: isMulti ? sels.map((s: any) => s.match.split(" – ")[0]).join(" + ") : sel0.match,
      date: new Date(b.date).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" }),
      analysis: b.analysis || "",
      pick,
      odds: isMulti ? combinedOdds : Number(sel0.odds),
      stake: Number(b.stake),
      bookmaker: b.bookmaker || "",
      referralLink: b.referral_link || null,
      postedYield: null,
      posted: relativeTime(b.created_at),
    };
  });
}

// Fetch all bets for the logged-in user
export async function fetchMyBets(): Promise<Bet[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data: betsData, error } = await supabase
    .from("bets")
    .select("*, selections(*)")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !betsData) return [];

  return betsData.map((b) => ({
    id: b.id,
    date: new Date(b.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
    betType: b.bet_type as Bet["betType"],
    stake: Number(b.stake),
    result: b.result,
    profit: b.profit !== null ? Number(b.profit) : null,
    bookmaker: b.bookmaker,
    referralLink: b.referral_link,
    isPublic: b.is_public,
    analysis: b.analysis,
    isMaxbet: b.is_maxbet,
    selections: (b.selections as any[])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((s) => ({
        sport: s.sport,
        match: s.match,
        market: s.market,
        line: s.line ?? "",
        odds: Number(s.odds),
        closingOdds: s.closing_odds !== null ? Number(s.closing_odds) : null,
      })),
  }));
}

// Save a new bet
export async function saveBet(params: {
  betType: Bet["betType"];
  stake: number;
  matchDate?: string;
  bookmaker: string;
  referralLink?: string;
  isPublic: boolean;
  analysis: string;
  isMaxbet: boolean;
  selections: Omit<Selection, "closingOdds">[];
}): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };

  const { data: bet, error: betError } = await supabase
    .from("bets")
    .insert({
      user_id: user.id,
      bet_type: params.betType,
      stake: params.stake,
      ...(params.matchDate ? { date: params.matchDate } : {}),
      bookmaker: params.bookmaker || null,
      referral_link: params.referralLink || null,
      is_public: params.isPublic,
      analysis: params.analysis || null,
      is_maxbet: params.isMaxbet,
      result: "open",
    })
    .select()
    .single();

  if (betError || !bet) return { error: betError?.message ?? "Failed to save bet" };

  const { error: selError } = await supabase.from("selections").insert(
    params.selections.map((s, i) => ({
      bet_id: bet.id,
      sport: s.sport,
      match: s.match,
      market: s.market,
      line: s.line || null,
      odds: s.odds,
      closing_odds: null,
      sort_order: i,
    }))
  );

  if (selError) return { error: selError.message };
  return { error: null };
}

// Update closing odds for a bet's selections
export async function updateClosingOdds(
  betId: string,
  selectionUpdates: { index: number; closingOdds: number | null }[]
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { data: selections } = await supabase
    .from("selections")
    .select("id, sort_order")
    .eq("bet_id", betId)
    .order("sort_order");

  if (!selections) return { error: "Selections not found" };

  for (const upd of selectionUpdates) {
    const sel = selections[upd.index];
    if (!sel) continue;
    await supabase
      .from("selections")
      .update({ closing_odds: upd.closingOdds })
      .eq("id", sel.id);
  }
  return { error: null };
}

// Settle a bet — set result and computed profit
export async function settleBet(
  betId: string,
  result: "win" | "loss" | "void" | "open",
  profit: number | null
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("bets")
    .update({ result, profit })
    .eq("id", betId);
  return { error: error?.message ?? null };
}

// Delete a bet
export async function deleteBet(betId: string): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("bets").delete().eq("id", betId);
  return { error: error?.message ?? null };
}

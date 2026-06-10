import { createClient } from "./supabase";
import type { Bet, Selection } from "./mockData";

// Fetch all bets for the logged-in user
export async function fetchMyBets(): Promise<Bet[]> {
  const supabase = createClient();
  const { data: betsData, error } = await supabase
    .from("bets")
    .select("*, selections(*)")
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
  bookmaker: string;
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
      bookmaker: params.bookmaker || null,
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

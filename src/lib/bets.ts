import { createClient } from "./supabase";
import type { Bet, Selection } from "./mockData";

const SPORT_EMOJI: Record<string, string> = {
  Football: "⚽", Tennis: "🎾", Golf: "⛳", Trotting: "🐎",
  Basketball: "🏀", "Ice Hockey": "🏒", Other: "🎱",
};
const AVATAR_COLORS = ["#00e5a0", "#5ad1ff", "#e6b23a", "#b48cff", "#ff7a7a"];

// Readable, URL-safe slug from arbitrary text.
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/-$/, "");
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  slug: string;
  tipster: { name: string; username: string; initials: string; color: string; verified: boolean };
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

// Fetch all public bets (the community feed).
// Uses raw REST (anon) — public data needs no auth, and this avoids the
// supabase-js browser client awaiting the GoTrue auth lock (which can hang).
export async function fetchPublicBets(): Promise<PublicTip[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const headers = { apikey: key, Authorization: `Bearer ${key}` };

  const betsRes = await fetch(
    `${url}/rest/v1/bets?is_public=eq.true&select=*,selections(*)&order=created_at.desc`,
    { headers, cache: "no-store" }
  );
  if (!betsRes.ok) return [];
  const betsData = (await betsRes.json()) as any[];
  if (!betsData?.length) return [];

  // Fetch author profiles (the persona that posted each tip)
  const profileIds = [...new Set(betsData.map((b) => b.profile_id || b.user_id))];
  const profRes = await fetch(
    `${url}/rest/v1/profiles?id=in.(${profileIds.join(",")})&select=id,username,display_name`,
    { headers, cache: "no-store" }
  );
  const profiles = profRes.ok ? ((await profRes.json()) as any[]) : [];
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  return betsData.map((b) => {
    const sels = (b.selections as Selection[] & { sort_order?: number }[])
      .slice()
      .sort((a: any, c: any) => (a.sort_order ?? 0) - (c.sort_order ?? 0));
    const sel0 = sels[0] ?? ({} as any);
    const combinedOdds = sels.reduce((acc: number, s: any) => acc * Number(s.odds), 1);
    const isMulti = b.bet_type !== "Single";

    const prof = profileMap.get(b.profile_id || b.user_id);
    const name = prof?.display_name || prof?.username || "Anonymous";
    const initials = name.slice(0, 2).toUpperCase();
    const colorIdx = name.charCodeAt(0) % AVATAR_COLORS.length;

    const pick = isMulti
      ? sels.map((s: any) => s.line || s.match).join(" + ")
      : (sel0.line || sel0.market || sel0.match || "");

    return {
      id: b.id,
      slug: b.slug || b.id,
      tipster: { name, username: prof?.username || "", initials, color: AVATAR_COLORS[colorIdx], verified: false },
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

export interface TipData {
  id: string;
  slug: string;
  name: string;
  username: string;
  initials: string;
  color: string;
  verified: boolean;
  sportEmoji: string;
  sportLabel: string;
  league: string;
  match: string;
  date: string;
  isoDate: string;
  analysis: string;
  pick: string;
  odds: number;
  stake: number;
  bookmaker: string;
  referralLink: string | null;
  betType: string;
  legs: { match: string; market: string; line: string; odds: number }[];
}

// List all public tips (id + dates + whether they carry analysis) for the sitemap.
// Server-safe (REST + fetch).
export async function listPublicTips(): Promise<
  { id: string; slug: string; updatedAt: string; hasAnalysis: boolean }[]
> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  const res = await fetch(
    `${url}/rest/v1/bets?is_public=eq.true&select=id,slug,created_at,analysis&order=created_at.desc`,
    { headers, cache: "no-store" }
  );
  if (!res.ok) return [];
  const rows = await res.json();
  return (rows as any[]).map((b) => ({
    id: b.id,
    slug: b.slug || b.id,
    updatedAt: b.created_at,
    hasAnalysis: !!(b.analysis && String(b.analysis).trim().length > 0),
  }));
}

// Fetch a single public tip by slug (or legacy UUID) — works server-side (REST + fetch).
// Used by the public /tip/[slug] page and its dynamic OG image.
export async function getPublicTip(slugOrId: string): Promise<TipData | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const headers = { apikey: key, Authorization: `Bearer ${key}` };

  const matchCol = UUID_RE.test(slugOrId)
    ? `id=eq.${slugOrId}`
    : `slug=eq.${encodeURIComponent(slugOrId)}`;
  const betRes = await fetch(
    `${url}/rest/v1/bets?${matchCol}&is_public=eq.true&select=*,selections(*)`,
    { headers, cache: "no-store" }
  );
  if (!betRes.ok) return null;
  const betsData = await betRes.json();
  const b = betsData?.[0];
  if (!b) return null;

  const profRes = await fetch(
    `${url}/rest/v1/profiles?id=eq.${b.profile_id || b.user_id}&select=username,display_name`,
    { headers, cache: "no-store" }
  );
  const prof = profRes.ok ? (await profRes.json())?.[0] : null;
  const name = prof?.display_name || prof?.username || "Anonymous";

  const sels = (b.selections as any[]).slice().sort(
    (a, c) => (a.sort_order ?? 0) - (c.sort_order ?? 0)
  );
  const sel0 = sels[0] ?? {};
  const isMulti = b.bet_type !== "Single";
  const combinedOdds = sels.reduce((acc, s) => acc * Number(s.odds), 1);
  const colorIdx = name.charCodeAt(0) % AVATAR_COLORS.length;

  return {
    id: b.id,
    slug: b.slug || b.id,
    name,
    username: prof?.username || "",
    initials: name.slice(0, 2).toUpperCase(),
    color: AVATAR_COLORS[colorIdx],
    verified: false,
    sportEmoji: SPORT_EMOJI[sel0.sport] ?? "🎱",
    sportLabel: sel0.sport ?? "",
    league: isMulti ? `${b.bet_type} · ${sels.length} selections` : (sel0.market || ""),
    match: isMulti ? sels.map((s) => s.match.split(" – ")[0]).join(" + ") : (sel0.match || ""),
    date: new Date(b.date).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" }),
    isoDate: b.date,
    analysis: b.analysis || "",
    pick: isMulti ? sels.map((s) => s.line || s.match).join(" + ") : (sel0.line || sel0.market || sel0.match || ""),
    odds: isMulti ? combinedOdds : Number(sel0.odds),
    stake: Number(b.stake),
    bookmaker: b.bookmaker || "",
    referralLink: b.referral_link || null,
    betType: b.bet_type,
    legs: sels.map((s) => ({ match: s.match, market: s.market, line: s.line ?? "", odds: Number(s.odds) })),
  };
}

export interface TipsterProfile {
  id: string;
  name: string;
  username: string;
  initials: string;
  color: string;
  bio: string;
  tips: {
    slug: string;
    match: string;
    pick: string;
    odds: number;
    stake: number;
    sportEmoji: string;
    sportLabel: string;
    league: string;
    date: string;
    isoDate: string;
    analysis: string;
    result: string;
    profit: number | null;
  }[];
}

// Fetch a tipster's public profile + their published tips. Server-safe (REST + fetch).
export async function getTipsterProfile(username: string): Promise<TipsterProfile | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const headers = { apikey: key, Authorization: `Bearer ${key}` };

  const profRes = await fetch(
    `${url}/rest/v1/profiles?username=eq.${encodeURIComponent(username)}&select=id,username,display_name,bio`,
    { headers, cache: "no-store" }
  );
  if (!profRes.ok) return null;
  const prof = (await profRes.json())?.[0];
  if (!prof) return null;

  const betsRes = await fetch(
    `${url}/rest/v1/bets?profile_id=eq.${prof.id}&is_public=eq.true&select=*,selections(*)&order=created_at.desc`,
    { headers, cache: "no-store" }
  );
  const bets = betsRes.ok ? await betsRes.json() : [];
  const name = prof.display_name || prof.username || "Anonymous";
  const colorIdx = name.charCodeAt(0) % AVATAR_COLORS.length;

  const tips = (bets as any[]).map((b) => {
    const sels = (b.selections as any[]).slice().sort((a, c) => (a.sort_order ?? 0) - (c.sort_order ?? 0));
    const sel0 = sels[0] ?? {};
    const isMulti = b.bet_type !== "Single";
    const combinedOdds = sels.reduce((acc, s) => acc * Number(s.odds), 1);
    return {
      slug: b.slug || b.id,
      match: isMulti ? sels.map((s) => s.match.split(" – ")[0]).join(" + ") : (sel0.match || ""),
      pick: isMulti ? sels.map((s) => s.line || s.match).join(" + ") : (sel0.line || sel0.market || sel0.match || ""),
      odds: isMulti ? combinedOdds : Number(sel0.odds),
      stake: Number(b.stake),
      sportEmoji: SPORT_EMOJI[sel0.sport] ?? "🎱",
      sportLabel: sel0.sport ?? "",
      league: isMulti ? `${b.bet_type} · ${sels.length} selections` : (sel0.market || ""),
      date: new Date(b.date).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" }),
      isoDate: b.date,
      analysis: b.analysis || "",
      result: b.result,
      profit: b.profit !== null ? Number(b.profit) : null,
    };
  });

  return {
    id: prof.id,
    name,
    username: prof.username,
    initials: name.slice(0, 2).toUpperCase(),
    color: AVATAR_COLORS[colorIdx],
    bio: prof.bio || "",
    tips,
  };
}

export interface TipsterRank {
  username: string;
  name: string;
  initials: string;
  color: string;
  tips: number;
  settled: number;
  wins: number;
  winRate: number | null;
  netUnits: number;
  yieldPct: number | null;
}

// Rank public tipsters by track record from their settled public tips. Server-safe.
export async function getTopTipsters(limit = 10): Promise<TipsterRank[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const headers = { apikey: key, Authorization: `Bearer ${key}` };

  const betsRes = await fetch(
    `${url}/rest/v1/bets?is_public=eq.true&select=profile_id,user_id,result,profit,stake`,
    { headers, cache: "no-store" }
  );
  if (!betsRes.ok) return [];
  const bets = (await betsRes.json()) as any[];
  if (!bets.length) return [];

  const agg = new Map<string, { tips: number; settled: number; wins: number; net: number; staked: number }>();
  for (const b of bets) {
    const pid = b.profile_id || b.user_id;
    const a = agg.get(pid) ?? { tips: 0, settled: 0, wins: 0, net: 0, staked: 0 };
    a.tips += 1;
    if (b.result === "win" || b.result === "loss" || b.result === "void") {
      a.settled += 1;
      a.staked += Number(b.stake) || 0;
      a.net += b.profit !== null ? Number(b.profit) : 0;
      if (b.result === "win") a.wins += 1;
    }
    agg.set(pid, a);
  }

  const ids = [...agg.keys()];
  const profRes = await fetch(
    `${url}/rest/v1/profiles?id=in.(${ids.join(",")})&select=id,username,display_name`,
    { headers, cache: "no-store" }
  );
  const profs = profRes.ok ? ((await profRes.json()) as any[]) : [];
  const profMap = new Map(profs.map((p) => [p.id, p]));

  const ranked: TipsterRank[] = ids.map((pid) => {
    const a = agg.get(pid)!;
    const prof = profMap.get(pid);
    const name = prof?.display_name || prof?.username || "Anonymous";
    const colorIdx = name.charCodeAt(0) % AVATAR_COLORS.length;
    return {
      username: prof?.username || "",
      name,
      initials: name.slice(0, 2).toUpperCase(),
      color: AVATAR_COLORS[colorIdx],
      tips: a.tips,
      settled: a.settled,
      wins: a.wins,
      winRate: a.settled ? Math.round((a.wins / a.settled) * 100) : null,
      netUnits: a.net,
      yieldPct: a.staked > 0 ? (a.net / a.staked) * 100 : null,
    };
  }).filter((t) => t.username);

  // Tipsters with a settled record rank first (by yield), then the rest by tip volume.
  ranked.sort((x, y) => {
    if ((y.yieldPct ?? -Infinity) !== (x.yieldPct ?? -Infinity))
      return (y.yieldPct ?? -Infinity) - (x.yieldPct ?? -Infinity);
    return y.tips - x.tips;
  });

  return ranked.slice(0, limit);
}

// List usernames that have published at least one public tip (for the sitemap).
export async function listTipsterUsernames(): Promise<string[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  const betsRes = await fetch(
    `${url}/rest/v1/bets?is_public=eq.true&select=profile_id,user_id`,
    { headers, cache: "no-store" }
  );
  if (!betsRes.ok) return [];
  const profileIds = [...new Set((await betsRes.json() as any[]).map((b) => b.profile_id || b.user_id))];
  if (!profileIds.length) return [];
  const profRes = await fetch(
    `${url}/rest/v1/profiles?id=in.(${profileIds.join(",")})&select=username`,
    { headers, cache: "no-store" }
  );
  if (!profRes.ok) return [];
  return (await profRes.json() as any[]).map((p) => p.username).filter(Boolean);
}

// Fetch all bets for the logged-in user
export async function fetchMyBets(profileId?: string): Promise<Bet[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  let query = supabase
    .from("bets")
    .select("*, selections(*)")
    .eq("user_id", user.id);
  if (profileId) query = query.eq("profile_id", profileId);
  const { data: betsData, error } = await query
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
  profileId?: string;
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
      profile_id: params.profileId ?? user.id,
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

  // Readable slug from the lead selection + a short id suffix for uniqueness.
  const lead = params.selections[0];
  const base = slugify(`${lead?.match ?? ""} ${lead?.line || lead?.market || ""}`) || "tip";
  const slug = `${base}-${String(bet.id).slice(0, 8)}`;
  await supabase.from("bets").update({ slug }).eq("id", bet.id);

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

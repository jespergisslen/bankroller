"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Sparkline } from "@/components/Sparkline";
import { LogBetModal } from "@/components/LogBetModal";
import { BetDrawer } from "@/components/BetDrawer";
import { type Bet } from "@/lib/mockData";
import { fetchMyBets, updateClosingOdds, deleteBet, settleBet, RESULT_LABEL, type BetResult } from "@/lib/bets";
import { createClient } from "@/lib/supabase";
import { computeStats } from "@/lib/stats";
import { InfoTip } from "@/components/InfoTip";
import { CURRENCIES } from "@/lib/currencyContext";
import { usePersona } from "@/lib/personaContext";

const RANGES = ["1M", "3M", "6M", "YTD", "ALL"];

// Optional explanatory tooltips for KPI tiles, keyed by label.
const KPI_INFO: Record<string, string> = {
  "Open exp.": "Open exposure: the total stake tied up in bets that haven't been settled yet. Your money currently on the table.",
};

export default function DashboardPage() {
  const router = useRouter();
  const { activeId, active } = usePersona();
  const [range, setRange] = useState("3M");
  const [showModal, setShowModal] = useState(false);
  const [bets, setBets] = useState<Bet[]>([]);
  const [loadingBets, setLoadingBets] = useState(true);
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [dismissedOverdue, setDismissedOverdue] = useState<string[]>([]);
  const [activeCurrency, setActiveCurrency] = useState("units");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bankroller_dismissed_overdue");
      if (raw) setDismissedOverdue(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  // Open bets whose event date has already passed → awaiting settlement.
  const overdueBets = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return bets
      .filter((b) => b.result === "open" && b.isoDate && b.isoDate < today)
      .sort((a, b) => (a.isoDate! < b.isoDate! ? -1 : 1)); // oldest first
  }, [bets]);

  // Show only bets the user hasn't already dismissed; a brand-new overdue bet re-triggers.
  const pendingOverdue = overdueBets.filter((b) => b.id && !dismissedOverdue.includes(b.id));

  const dismissOverdue = () => {
    const ids = overdueBets.map((b) => b.id!).filter(Boolean);
    const merged = Array.from(new Set([...dismissedOverdue, ...ids]));
    setDismissedOverdue(merged);
    try { localStorage.setItem("bankroller_dismissed_overdue", JSON.stringify(merged)); } catch { /* ignore */ }
  };

  // Bets are kept as separate books per currency (no conversion). The dashboard
  // shows one book at a time; the toggle only appears when there's more than one.
  const currencies = useMemo(() => {
    const present = new Set(bets.map((b) => b.currency ?? "units"));
    const ordered = CURRENCIES.map((c) => c.value).filter((v) => present.has(v));
    return ordered.length ? ordered : ["units"];
  }, [bets]);
  const effectiveCurrency = currencies.includes(activeCurrency) ? activeCurrency : currencies[0];
  const curSym = CURRENCIES.find((c) => c.value === effectiveCurrency)?.symbol ?? "u";
  const unitSfx = effectiveCurrency === "units" ? "u" : ` ${curSym}`;
  const viewBets = useMemo(
    () => bets.filter((b) => (b.currency ?? "units") === effectiveCurrency),
    [bets, effectiveCurrency],
  );

  const stats = useMemo(() => computeStats(viewBets), [viewBets]);
  const maxSport = Math.max(1, ...stats.bySport.map(s => Math.abs(s.val)));
  const maxMarket = Math.max(1, ...stats.byMarket.map(m => Math.abs(m.val)));

  const kpis = [
    {
      k: "Net units",
      v: `${stats.netUnits >= 0 ? "+" : ""}${stats.netUnits.toFixed(2)}${unitSfx}`,
      up: stats.netUnits > 0 ? true : stats.netUnits < 0 ? false : null,
      sub: stats.betCount > 0 ? `${stats.betCount} bets` : "no bets yet",
    },
    {
      k: "Yield",
      v: stats.yieldPct !== null ? `${stats.yieldPct >= 0 ? "+" : ""}${stats.yieldPct.toFixed(1)} %` : "—",
      up: stats.yieldPct === null ? null : stats.yieldPct >= 0,
      sub: `${stats.settledCount} settled`,
    },
    {
      k: "Win rate",
      v: stats.winRate !== null ? `${stats.winRate.toFixed(1)} %` : "—",
      up: stats.winRate === null ? null : stats.winRate >= 50,
      sub: stats.settledCount > 0 ? `${stats.winCount} / ${stats.settledCount}` : "—",
    },
    {
      k: "CLV",
      v: stats.avgClv !== null ? `${stats.avgClv >= 0 ? "+" : ""}${stats.avgClv.toFixed(1)} %` : "—",
      up: stats.avgClv === null ? null : stats.avgClv >= 0,
      sub: "closing line",
    },
    {
      k: "Open exp.",
      v: `${stats.openExposure.toFixed(2)}${unitSfx}`,
      up: null,
      sub: stats.openCount > 0 ? `${stats.openCount} open` : "none",
    },
  ];

  // Auth guard — redirect to login if not logged in
  useEffect(() => {
    createClient().auth.getSession()
      .then(({ data }) => { if (!data.session?.user) router.replace("/login"); })
      .catch(() => {});
  }, [router]);

  // Export the active currency book to CSV.
  const exportCsv = () => {
    if (!viewBets.length) return;
    const esc = (v: string | number | null | undefined) => {
      const s = v === null || v === undefined ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = ["Date", "Type", "Sport", "Match", "Market", "Pick", "Odds", "Currency", "Stake", "Result", "Profit", "CLV%"];
    const rows = viewBets.map((b) => {
      const s0 = b.selections[0];
      const isMulti = b.betType !== "Single";
      const odds = isMulti ? b.selections.reduce((a, s) => a * s.odds, 1) : s0?.odds;
      const clv = !isMulti && s0?.closingOdds ? (((s0.odds / s0.closingOdds) - 1) * 100).toFixed(1) : "";
      return [
        b.isoDate ?? b.date,
        b.betType,
        isMulti ? "" : (s0?.sport ?? ""),
        isMulti ? `${b.betType} (${b.selections.length} legs)` : (s0?.match ?? ""),
        isMulti ? "" : (s0?.market ?? ""),
        isMulti ? "" : (s0?.line ?? ""),
        typeof odds === "number" ? odds.toFixed(2) : "",
        b.currency ?? "units",
        b.stake,
        b.result,
        b.profit ?? "",
        clv,
      ].map(esc).join(",");
    });
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bankroller-${effectiveCurrency}-bets-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadBets = useCallback(async () => {
    setLoadingBets(true);
    const data = await fetchMyBets(activeId ?? undefined);
    setBets(data);
    setLoadingBets(false);
  }, [activeId]);

  useEffect(() => { if (activeId) loadBets(); }, [loadBets, activeId]);

  const handleSave = async (closingOdds: number | null) => {
    if (!selectedBet) return;
    const id = selectedBet.id;
    if (id) {
      await updateClosingOdds(id, [{ index: 0, closingOdds }]);
    }
    await loadBets();
    setSelectedBet(null);
  };

  const handleDelete = async () => {
    if (!selectedBet) return;
    const id = selectedBet.id;
    if (id) await deleteBet(id);
    await loadBets();
    setSelectedBet(null);
  };

  const handleSettle = async (result: BetResult, profit: number | null) => {
    if (!selectedBet) return;
    const id = selectedBet.id;
    if (id) {
      const { error } = await settleBet(id, result, profit);
      if (error) {
        // Keep the panel open and tell the user instead of closing silently.
        window.alert(`Could not update result: ${error}`);
        return;
      }
    }
    await loadBets();
    setSelectedBet(null);
  };

  return (
    <>
      {showModal && <LogBetModal onClose={() => setShowModal(false)} onSaved={loadBets} />}
      {selectedBet && (
        <BetDrawer
          bet={selectedBet}
          onClose={() => setSelectedBet(null)}
          onSave={handleSave}
          onDelete={handleDelete}
          onSettle={handleSettle}
        />
      )}

      <div className="fade-in">
        {/* Page head */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>My Bets</h1>
            <p style={{ color: "var(--text-2)", marginTop: 4, fontSize: 13.5 }}>Full control over where you&apos;re up and down, and why.</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button className="btn sm" onClick={exportCsv} disabled={!viewBets.length}>⤓ Export</button>
            <button className="btn accent sm" onClick={() => setShowModal(true)}>+ Log a bet</button>
          </div>
        </div>

        {/* Awaiting-settlement reminder */}
        {pendingOverdue.length > 0 && (
          <div className="fade-in" style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14,
            padding: "12px 16px", marginBottom: 20, borderRadius: "var(--r-m)",
            border: "1px solid color-mix(in oklch, var(--warn) 35%, transparent)",
            background: "color-mix(in oklch, var(--warn) 8%, transparent)",
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--warn)" }}>
                ⏰ {pendingOverdue.length === 1
                  ? "1 bet is awaiting settlement"
                  : `${pendingOverdue.length} bets are awaiting settlement`}
              </div>
              <div style={{ color: "var(--text-2)", fontSize: 12.5, marginTop: 2 }}>
                The event date has passed. Settle {pendingOverdue.length === 1 ? "it" : "them"} to keep your stats accurate.
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button className="btn accent sm" onClick={() => setSelectedBet(pendingOverdue[0])}>
                Settle {pendingOverdue.length > 1 ? "oldest" : "now"}
              </button>
              <button className="btn sm" onClick={dismissOverdue} title="Hide until a new bet becomes overdue">
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Currency books — only when the user has bets in more than one */}
        {currencies.length > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <span className="label" style={{ marginRight: 2 }}>Book</span>
            {currencies.map((c) => {
              const on = c === effectiveCurrency;
              const meta = CURRENCIES.find((x) => x.value === c);
              return (
                <button
                  key={c}
                  onClick={() => setActiveCurrency(c)}
                  style={{
                    fontFamily: "var(--mono)", fontSize: 11, cursor: "pointer",
                    padding: "5px 11px", borderRadius: 20,
                    border: `1px solid ${on ? "color-mix(in oklch, var(--accent) 45%, transparent)" : "var(--line-2)"}`,
                    background: on ? "color-mix(in oklch, var(--accent) 12%, transparent)" : "transparent",
                    color: on ? "var(--accent)" : "var(--text-3)", transition: "all 0.2s",
                  }}
                >
                  {c === "units" ? "Units" : meta?.value}
                </button>
              );
            })}
          </div>
        )}

        {/* KPI strip — raised so a KPI tooltip paints above the sections below */}
        <div
          className="d1 fade-in kpi-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20, position: "relative", zIndex: 5 }}
        >
          {kpis.map((kpi) => (
            <div
              key={kpi.k}
              className="panel"
              style={{
                padding: "14px 15px 13px",
                position: "relative",
                cursor: "default",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "color-mix(in oklch, var(--accent) 30%, transparent)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--line)";
              }}
            >
              <div className="label" style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                {kpi.k}
                {KPI_INFO[kpi.k] && <InfoTip text={KPI_INFO[kpi.k]} align="right" placement="bottom" />}
              </div>
              <div
                className={`num ${kpi.up === true ? "pos glow" : kpi.up === null ? "" : "neg"}`}
                style={{ fontSize: 25, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1 }}
              >
                {kpi.v}
              </div>
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 10.5 }}>{kpi.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="d2 fade-in" style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 16, marginBottom: 16 }}>
          {/* Bankroll curve */}
          <div className="panel">
            <div style={{
              padding: "14px var(--pad)", borderBottom: "1px solid var(--line)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>Profit curve</span>
              <div style={{ display: "flex", gap: 3, background: "var(--bg-1)", border: "1px solid var(--line)", borderRadius: "var(--r-s)", padding: 2 }}>
                {RANGES.map(r => (
                  <button key={r} onClick={() => setRange(r)} style={{
                    fontFamily: "var(--mono)", fontSize: 11.5, padding: "4px 9px",
                    borderRadius: 4, border: "none", cursor: "pointer",
                    background: range === r ? "rgba(255,255,255,0.07)" : "transparent",
                    color: range === r ? "var(--accent)" : "var(--text-2)",
                    transition: "all 0.15s",
                  }}>{r}</button>
                ))}
              </div>
            </div>
            <div style={{ padding: "var(--pad)" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
                <span className={`num ${stats.netUnits >= 0 ? "pos glow" : "neg"}`} style={{ fontSize: 34, fontWeight: 500, letterSpacing: "-0.02em" }}>
                  {stats.netUnits >= 0 ? "+" : ""}{stats.netUnits.toFixed(2)}u
                </span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)" }}>
                  net profit · {stats.settledCount} settled
                </span>
              </div>
              {stats.betCount === 0 ? (
                <div style={{ height: 196, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-4)", fontFamily: "var(--mono)", fontSize: 12, border: "1px dashed var(--line)", borderRadius: "var(--r-m)" }}>
                  Your profit curve will appear here once you log bets
                </div>
              ) : (
                <Sparkline data={stats.curve} height={196} />
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0, marginTop: 16, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
                {[
                  { label: "Total staked", val: `${stats.totalStaked.toFixed(1)}${unitSfx}`, pos: null },
                  { label: "Settled", val: `${stats.settledCount}`, pos: null },
                  { label: "Open", val: `${stats.openCount}`, pos: null },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <div className="label" style={{ marginBottom: 4 }}>{s.label}</div>
                    <div className="num" style={{ fontSize: 13, fontWeight: 500 }}>{s.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Breakdown column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Sport */}
            <div className="panel" style={{ flex: 1 }}>
              <div style={{ padding: "14px var(--pad)", borderBottom: "1px solid var(--line)", fontWeight: 600, fontSize: 13 }}>
                Yield per sport
              </div>
              <div style={{ padding: "var(--pad)", display: "flex", flexDirection: "column", gap: 14 }}>
                {stats.bySport.length === 0 ? (
                  <div style={{ color: "var(--text-4)", fontFamily: "var(--mono)", fontSize: 11.5, padding: "8px 0" }}>
                    No settled bets yet
                  </div>
                ) : stats.bySport.map(s => (
                  <div key={s.name} style={{ display: "grid", gridTemplateColumns: "132px 1fr 60px", gap: 14, alignItems: "center" }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 12 }}>
                      <span style={{ marginRight: 6 }}>{s.emoji}</span>{s.name}
                    </div>
                    <div style={{ height: 8, borderRadius: 5, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 5,
                        width: `${(Math.abs(s.val) / maxSport) * 100}%`,
                        background: s.val >= 0
                          ? "linear-gradient(90deg, var(--accent), color-mix(in oklch, var(--accent) 60%, transparent))"
                          : "linear-gradient(90deg, var(--neg), color-mix(in oklch, var(--neg) 60%, transparent))",
                        boxShadow: s.val >= 0 ? "0 0 8px color-mix(in oklch, var(--accent) 40%, transparent)" : "none",
                        transition: "width 0.8s ease",
                      }} />
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className={`num ${s.val >= 0 ? "pos" : "neg"}`} style={{ fontSize: 12.5, fontWeight: 500 }}>
                        {s.val >= 0 ? "+" : ""}{s.val.toFixed(1)}%
                      </div>
                      <div style={{ color: "var(--text-4)", fontFamily: "var(--mono)", fontSize: 10, marginTop: 1 }}>{s.vol}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market */}
            <div className="panel" style={{ flex: 1 }}>
              <div style={{ padding: "14px var(--pad)", borderBottom: "1px solid var(--line)", fontWeight: 600, fontSize: 13 }}>
                Yield per market
              </div>
              <div style={{ padding: "var(--pad)", display: "flex", flexDirection: "column", gap: 12 }}>
                {stats.byMarket.length === 0 ? (
                  <div style={{ color: "var(--text-4)", fontFamily: "var(--mono)", fontSize: 11.5, padding: "8px 0" }}>
                    No settled bets yet
                  </div>
                ) : stats.byMarket.map(m => (
                  <div key={m.name} style={{ display: "grid", gridTemplateColumns: "132px 1fr 60px", gap: 14, alignItems: "center" }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--text-2)" }}>{m.name}</div>
                    <div style={{ height: 8, borderRadius: 5, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 5,
                        width: `${(Math.abs(m.val) / maxMarket) * 100}%`,
                        background: m.val >= 0
                          ? "linear-gradient(90deg, var(--accent), color-mix(in oklch, var(--accent) 60%, transparent))"
                          : "linear-gradient(90deg, var(--neg), color-mix(in oklch, var(--neg) 60%, transparent))",
                        boxShadow: m.val >= 0 ? "0 0 8px color-mix(in oklch, var(--accent) 40%, transparent)" : "none",
                        transition: "width 0.8s ease",
                      }} />
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className={`num ${m.val >= 0 ? "pos" : "neg"}`} style={{ fontSize: 12.5, fontWeight: 500 }}>
                        {m.val >= 0 ? "+" : ""}{m.val.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bets table */}
        <div className="panel d3 fade-in">
          <div style={{
            padding: "14px var(--pad)", borderBottom: "1px solid var(--line)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>Recent bets</span>
            <button className="btn sm" style={{ color: "var(--accent)" }}>All bets →</button>
          </div>
          <div className="bets-table-wrap" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    { h: "Date", cls: "col-date" },
                    { h: "Bet",  cls: "" },
                    { h: "Odds", cls: "" },
                    { h: "CLV",  cls: "col-clv" },
                    { h: "Stake",cls: "col-stake" },
                    { h: "Result",cls: "" },
                    { h: "P&L",  cls: "" },
                  ].map(({ h, cls }, i) => (
                    <th key={h} className={cls} style={{
                      padding: "10px var(--pad)",
                      fontFamily: "var(--mono)", fontSize: 10, fontWeight: 500,
                      letterSpacing: "0.14em", textTransform: "uppercase",
                      color: h === "CLV" ? "var(--accent)" : "var(--text-3)",
                      textAlign: i >= 2 ? "right" : "left",
                      whiteSpace: "nowrap",
                    }}>
                      {h === "CLV" ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                          CLV
                          <InfoTip align="right" placement="bottom" text="Closing Line Value: how your odds compared to the market's final price at kickoff. Beating it regularly is the sign of a real edge. Shown once you add closing odds to a single." />
                        </span>
                      ) : h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {viewBets.map((bet, i) => (
                  <BetRow key={i} bet={bet} onClick={() => setSelectedBet(bet)} />
                ))}
              </tbody>
            </table>
            {loadingBets && (
              <div style={{ padding: "32px var(--pad)", textAlign: "center", color: "var(--text-4)", fontFamily: "var(--mono)", fontSize: 12 }}>
                Loading…
              </div>
            )}
            {!loadingBets && viewBets.length === 0 && (
              <div style={{ padding: "48px var(--pad)", textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>📋</div>
                <div style={{ color: "var(--text-2)", fontWeight: 500, marginBottom: 6 }}>No bets yet</div>
                <div style={{ color: "var(--text-3)", fontSize: 13, marginBottom: 20 }}>Log your first bet to start tracking your edge.</div>
                <button className="btn accent sm" onClick={() => setShowModal(true)}>+ Log a bet</button>
              </div>
            )}
          </div>
          <div style={{ padding: "12px var(--pad)", borderTop: "1px solid var(--line)", color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 11.5 }}>
            Showing {viewBets.length} bets
          </div>
        </div>
      </div>
    </>
  );
}

// ── BetRow ──────────────────────────────────────────────────

function BetRow({ bet, onClick }: { bet: Bet; onClick: () => void }) {
  const betCur = bet.currency ?? "units";
  const stakeSfx = betCur === "units" ? "u" : ` ${CURRENCIES.find((c) => c.value === betCur)?.symbol ?? ""}`;
  const isMulti = bet.betType !== "Single";
  const sel0 = bet.selections[0];
  const combinedOdds = bet.selections.reduce((acc, s) => acc * s.odds, 1);
  const clv = !isMulti && sel0.closingOdds
    ? ((sel0.odds / sel0.closingOdds) - 1) * 100
    : null;

  const betTypeColor: Record<string, string> = {
    Double: "#5ad1ff", Treble: "#e6b23a", Accumulator: "#b48cff",
  };

  return (
    <tr
      onClick={onClick}
      style={{ borderTop: "1px solid var(--line)", height: "var(--row-h)", transition: "background 0.1s", cursor: "pointer" }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.035)"}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
    >
      {/* Date — hidden on mobile */}
      <td className="col-date" style={{ padding: "0 var(--pad)", fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--text-3)", whiteSpace: "nowrap" }}>
        {bet.date}
      </td>

      {/* Bet description */}
      <td style={{ padding: "0 var(--pad)" }}>
        {isMulti ? (
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{
              fontFamily: "var(--mono)", fontSize: 10, padding: "2px 7px", borderRadius: 4,
              background: betTypeColor[bet.betType] + "18",
              border: `1px solid ${betTypeColor[bet.betType]}44`,
              color: betTypeColor[bet.betType], flexShrink: 0,
              minWidth: 68, textAlign: "center", boxSizing: "border-box",
            }}>{bet.betType}</span>
            <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 14, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {bet.selections.map(s => s.match.split(" – ")[0]).join("  +  ")}
              </div>
              <div style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 10.5, marginTop: 1 }}>
                {bet.selections.length} legs · {bet.selections.map(s => s.sport).filter((v, i, a) => a.indexOf(v) === i).join(", ")}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{
              fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)",
              minWidth: 68, flexShrink: 0,
            }}>{sel0.sport}</span>
            <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 14 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: "nowrap" }}>{sel0.match}</div>
              <div style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 10.5, marginTop: 1 }}>
                {sel0.market}{sel0.line ? ` · ${sel0.line}` : ""}
              </div>
            </div>
          </div>
        )}
      </td>

      {/* Odds */}
      <td style={{ padding: "0 var(--pad)", textAlign: "right", whiteSpace: "nowrap" }}>
        {isMulti ? (
          <div>
            <div className="num pos glow" style={{ fontSize: 13, fontWeight: 600 }}>{combinedOdds.toFixed(2)}</div>
            <div style={{ color: "var(--text-4)", fontFamily: "var(--mono)", fontSize: 10, marginTop: 1 }}>
              {bet.selections.map(s => s.odds.toFixed(2)).join(" × ")}
            </div>
          </div>
        ) : (
          <span className="num" style={{ fontSize: 13 }}>{sel0.odds.toFixed(2)}</span>
        )}
      </td>

      {/* CLV — hidden on mobile */}
      <td className="col-clv" style={{ padding: "0 var(--pad)", textAlign: "right" }}>
        {clv !== null ? (
          <div>
            <div className={`num ${clv >= 0 ? "pos" : "neg"}`} style={{ fontSize: 12.5, fontWeight: 600 }}>
              {clv >= 0 ? "+" : ""}{clv.toFixed(1)}%
            </div>
            <div style={{ color: "var(--text-4)", fontFamily: "var(--mono)", fontSize: 10, marginTop: 1 }}>
              cl. {sel0.closingOdds!.toFixed(2)}
            </div>
          </div>
        ) : (
          <span style={{ color: "var(--text-4)", fontFamily: "var(--mono)", fontSize: 12 }}>—</span>
        )}
      </td>

      {/* Stake — hidden on mobile */}
      <td className="col-stake" style={{ padding: "0 var(--pad)", textAlign: "right" }}>
        <span className="num" style={{ fontSize: 13, color: "var(--text-2)" }}>{bet.stake}{stakeSfx}</span>
      </td>

      {/* Result */}
      <td style={{ padding: "0 var(--pad)", textAlign: "center" }}>
        <span className={`result-pill ${bet.result}`}>{RESULT_LABEL[bet.result] ?? bet.result}</span>
      </td>

      {/* P&L */}
      <td style={{ padding: "0 var(--pad)", textAlign: "right" }}>
        {bet.profit === null
          ? <span style={{ color: "var(--text-4)", fontFamily: "var(--mono)", fontSize: 13 }}>—</span>
          : <span className={`num ${bet.profit > 0 ? "pos glow" : bet.profit < 0 ? "neg" : ""}`} style={{ fontSize: 13, fontWeight: 500 }}>
              {bet.profit > 0 ? "+" : ""}{bet.profit === 0 ? "—" : bet.profit}
            </span>
        }
      </td>
    </tr>
  );
}

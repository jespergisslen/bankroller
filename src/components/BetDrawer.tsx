"use client";

import { useState } from "react";
import { type Bet } from "@/lib/mockData";

interface BetDrawerProps {
  bet: Bet;
  onClose: () => void;
  onDelete: () => void;
  onSave: (closingOdds: number | null, selectionIndex?: number) => void;
  onSettle: (result: "win" | "loss" | "void" | "open", profit: number | null) => void;
}

export function BetDrawer({ bet, onClose, onDelete, onSave, onSettle }: BetDrawerProps) {
  const isMulti = bet.betType !== "Single";
  const combinedOdds = bet.selections.reduce((acc, s) => acc * s.odds, 1);
  const effectiveOdds = isMulti ? combinedOdds : bet.selections[0].odds;

  const [closingValues, setClosingValues] = useState<string[]>(
    bet.selections.map(s => s.closingOdds ? String(s.closingOdds) : "")
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [settling, setSettling] = useState(false);

  // Profit if this bet were settled as win / loss / void
  const profitFor = (result: "win" | "loss" | "void"): number => {
    if (result === "win") return +(bet.stake * (effectiveOdds - 1)).toFixed(2);
    if (result === "loss") return -bet.stake;
    return 0; // void
  };

  const handleSettle = async (result: "win" | "loss" | "void") => {
    setSettling(true);
    await onSettle(result, profitFor(result));
    setSettling(false);
  };

  const updateClosing = (i: number, val: string) => {
    setClosingValues(prev => prev.map((v, idx) => idx === i ? val : v));
  };

  const clvFor = (odds: number, closingStr: string) => {
    const c = parseFloat(closingStr);
    return c > 0 ? ((odds / c) - 1) * 100 : null;
  };

  const betTypeColor: Record<string, string> = {
    Double: "#5ad1ff", Treble: "#e6b23a", Accumulator: "#b48cff", Single: "var(--accent)",
  };

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 80,
        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)",
        animation: "fadeInBd 0.2s ease both",
      }} />

      <div className="bet-drawer" style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: 440, zIndex: 90,
        background: "var(--bg-1)", borderLeft: "1px solid var(--line-2)",
        display: "flex", flexDirection: "column",
        animation: "slideIn 0.22s cubic-bezier(.2,.7,.2,1) both",
        overflowY: "auto",
      }}>
        <style>{`
          @keyframes fadeInBd { from { opacity: 0 } to { opacity: 1 } }
          @keyframes slideIn  { from { transform: translateX(40px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
        `}</style>

        {/* Header */}
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid var(--line)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, background: "var(--bg-1)", zIndex: 1,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              fontFamily: "var(--mono)", fontSize: 10.5, padding: "3px 8px", borderRadius: 4,
              background: betTypeColor[bet.betType] + "18",
              border: `1px solid ${betTypeColor[bet.betType]}44`,
              color: betTypeColor[bet.betType],
            }}>{bet.betType}</span>
            <div style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 11 }}>{bet.date}</div>
          </div>
          <button onClick={onClose} className="btn sm" style={{ width: 28, height: 28, padding: 0, justifyContent: "center" }}>✕</button>
        </div>

        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>

          {/* Result + P&L */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className={`result-pill ${bet.result}`} style={{ fontSize: 12, padding: "4px 10px" }}>{bet.result}</span>
            {bet.profit !== null && bet.profit !== 0 && (
              <span className={`num ${bet.profit > 0 ? "pos glow" : "neg"}`} style={{ fontSize: 18, fontWeight: 700 }}>
                {bet.profit > 0 ? "+" : ""}{bet.profit}u
              </span>
            )}
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <div className="label" style={{ marginBottom: 3 }}>{isMulti ? "combined" : "odds"}</div>
              <div className="num pos glow" style={{ fontSize: isMulti ? 22 : 20, fontWeight: 700 }}>
                {isMulti ? combinedOdds.toFixed(2) : bet.selections[0].odds.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Stake */}
          <div style={{ padding: "10px 14px", background: "var(--bg-2)", borderRadius: "var(--r-m)", border: "1px solid var(--line)", display: "flex", justifyContent: "space-between" }}>
            <span className="label">Stake</span>
            <span className="num" style={{ fontSize: 14, color: "var(--text-2)" }}>{bet.stake}u</span>
          </div>

          {/* Settle — only for open bets */}
          {bet.result === "open" && (
            <div style={{ padding: 14, borderRadius: "var(--r-m)", border: "1px solid color-mix(in oklch, var(--warn) 30%, transparent)", background: "color-mix(in oklch, var(--warn) 6%, transparent)" }}>
              <div className="label" style={{ marginBottom: 10 }}>Settle this bet</div>
              <div style={{ display: "flex", gap: 8 }}>
                {([
                  { r: "win" as const,  label: "Win",  color: "var(--accent)" },
                  { r: "loss" as const, label: "Loss", color: "var(--neg)" },
                  { r: "void" as const, label: "Void", color: "var(--text-2)" },
                ]).map(({ r, label, color }) => {
                  const p = profitFor(r);
                  return (
                    <button
                      key={r}
                      className="btn"
                      disabled={settling}
                      onClick={() => handleSettle(r)}
                      style={{
                        flex: 1, flexDirection: "column", gap: 2, padding: "10px 6px",
                        justifyContent: "center", alignItems: "center",
                        borderColor: `color-mix(in oklch, ${color} 35%, transparent)`,
                        color,
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{label}</span>
                      <span className="num" style={{ fontSize: 11, opacity: 0.85 }}>
                        {p > 0 ? "+" : ""}{p}u
                      </span>
                    </button>
                  );
                })}
              </div>
              <div style={{ color: "var(--text-4)", fontFamily: "var(--mono)", fontSize: 10.5, marginTop: 8 }}>
                Profit is calculated from your {isMulti ? "combined odds" : "odds"} ({effectiveOdds.toFixed(2)}) × stake.
              </div>
            </div>
          )}

          {/* Re-open a settled bet */}
          {bet.result !== "open" && (
            <button
              className="btn sm"
              disabled={settling}
              onClick={async () => { setSettling(true); await onSettle("open", null); setSettling(false); }}
              style={{ color: "var(--text-3)", alignSelf: "flex-start" }}
            >
              ↺ Re-open (undo settle)
            </button>
          )}

          {/* Selections */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {bet.selections.map((sel, i) => {
              const clv = clvFor(sel.odds, closingValues[i]);
              return (
                <div key={i} style={{
                  padding: 14, borderRadius: "var(--r-m)",
                  border: `1px solid ${clv !== null && clv >= 0 ? "color-mix(in oklch, var(--accent) 20%, transparent)" : "var(--line)"}`,
                  background: "var(--bg-2)",
                  display: "flex", flexDirection: "column", gap: 12,
                  transition: "border-color 0.2s",
                }}>
                  {/* Selection header */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      {isMulti && (
                        <div style={{ color: "var(--text-4)", fontFamily: "var(--mono)", fontSize: 10, marginBottom: 4 }}>
                          Selection {i + 1}
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 16 }}>{sel.sport}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13.5 }}>{sel.match}</div>
                          <div style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 11, marginTop: 2 }}>
                            {sel.market}{sel.line ? ` · ${sel.line}` : ""}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div className="label" style={{ marginBottom: 3 }}>odds</div>
                      <div className="num pos" style={{ fontSize: 16, fontWeight: 600 }}>{sel.odds.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Closing odds / CLV */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <div className="label">
                        Closing odds <span style={{ color: "var(--text-4)", letterSpacing: 0, textTransform: "none", fontSize: 11 }}>(optional)</span>
                      </div>
                      {clv !== null && (
                        <div className={`num ${clv >= 0 ? "pos glow" : "neg"}`} style={{ fontSize: 16, fontWeight: 700 }}>
                          {clv >= 0 ? "+" : ""}{clv.toFixed(1)}%
                        </div>
                      )}
                    </div>
                    <input
                      value={closingValues[i]}
                      onChange={e => updateClosing(i, e.target.value)}
                      placeholder="e.g. 1.90 — fetched automatically via Odds API"
                      type="number" step="0.01" min="1"
                      style={{
                        width: "100%", padding: "9px 12px",
                        borderRadius: "var(--r-s)",
                        border: "1px solid var(--line-2)",
                        background: "var(--bg-3)",
                        color: "var(--text)", fontFamily: "var(--mono)", fontSize: 13,
                        outline: "none",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save */}
          <button
            className="btn accent"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={() => {
              // For simplicity save first selection's closing; real DB would save per selection
              onSave(closingValues[0] ? parseFloat(closingValues[0]) : null);
            }}
          >
            Save changes
          </button>
        </div>

        {/* Delete */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--line)" }}>
          {confirmDelete ? (
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ flex: 1, fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-2)", display: "flex", alignItems: "center" }}>
                Remove this bet?
              </span>
              <button className="btn sm" onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button className="btn sm" onClick={onDelete}
                style={{ borderColor: "#e05555", color: "#e05555", background: "rgba(224,85,85,0.06)" }}>
                Yes, delete
              </button>
            </div>
          ) : (
            <button className="btn sm" onClick={() => setConfirmDelete(true)}
              style={{ color: "var(--text-3)", width: "100%", justifyContent: "center" }}>
              🗑 Remove bet
            </button>
          )}
        </div>
      </div>
    </>
  );
}

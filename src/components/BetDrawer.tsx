"use client";

import { useState } from "react";

type Bet = {
  date: string;
  match: string;
  sport: string;
  market: string;
  line: string;
  odds: number;
  closingOdds: number | null;
  stake: number;
  result: string;
  profit: number | null;
};

interface BetDrawerProps {
  bet: Bet;
  onClose: () => void;
  onDelete: () => void;
  onSave: (closingOdds: number | null) => void;
}

export function BetDrawer({ bet, onClose, onDelete, onSave }: BetDrawerProps) {
  const [closingOdds, setClosingOdds] = useState(
    bet.closingOdds ? String(bet.closingOdds) : ""
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  const clv =
    closingOdds && bet.odds && parseFloat(closingOdds) > 0
      ? ((bet.odds / parseFloat(closingOdds)) - 1) * 100
      : null;

  const resultColors: Record<string, string> = {
    win: "var(--accent)",
    loss: "var(--neg)",
    open: "var(--warn)",
    void: "var(--text-2)",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 80,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(2px)",
          animation: "fadeInBd 0.2s ease both",
        }}
      />

      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: 420, zIndex: 90,
        background: "var(--bg-1)",
        borderLeft: "1px solid var(--line-2)",
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
          padding: "16px 20px",
          borderBottom: "1px solid var(--line)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, background: "var(--bg-1)", zIndex: 1,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>{bet.sport}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em" }}>{bet.match}</div>
              <div style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 11, marginTop: 2 }}>{bet.date}</div>
            </div>
          </div>
          <button onClick={onClose} className="btn sm" style={{ width: 28, height: 28, padding: 0, justifyContent: "center" }}>✕</button>
        </div>

        {/* Content */}
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>

          {/* Result badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className={`result-pill ${bet.result}`} style={{ fontSize: 12, padding: "4px 10px" }}>{bet.result}</span>
            {bet.profit !== null && bet.profit !== 0 && (
              <span
                className={`num ${bet.profit > 0 ? "pos glow" : "neg"}`}
                style={{ fontSize: 16, fontWeight: 600 }}
              >
                {bet.profit > 0 ? "+" : ""}{bet.profit}u
              </span>
            )}
          </div>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { label: "Market",    val: bet.market },
              { label: "Selection", val: bet.line || "—" },
              { label: "Odds",      val: bet.odds.toFixed(2), mono: true, highlight: true },
              { label: "Stake",     val: `${bet.stake}u`, mono: true },
            ].map(item => (
              <div key={item.label} style={{
                padding: "12px 14px",
                background: "var(--bg-2)",
                borderRadius: "var(--r-m)",
                border: "1px solid var(--line)",
              }}>
                <div className="label" style={{ marginBottom: 5 }}>{item.label}</div>
                <div
                  className={item.mono ? "num" : ""}
                  style={{
                    fontSize: item.highlight ? 20 : 14,
                    fontWeight: item.highlight ? 600 : 500,
                    color: item.highlight ? "var(--accent)" : "var(--text)",
                    textShadow: item.highlight ? "0 0 calc(10px * var(--glow)) color-mix(in oklch, var(--accent) 60%, transparent)" : "none",
                  }}
                >{item.val}</div>
              </div>
            ))}
          </div>

          {/* Closing odds / CLV */}
          <div style={{
            padding: "16px",
            background: "var(--bg-2)",
            borderRadius: "var(--r-m)",
            border: `1px solid ${clv !== null ? (clv >= 0 ? "color-mix(in oklch, var(--accent) 25%, transparent)" : "var(--line)") : "var(--line)"}`,
            transition: "border-color 0.2s",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div className="label">Closing Line Value</div>
              {clv !== null && (
                <div className={`num ${clv >= 0 ? "pos glow" : "neg"}`} style={{ fontSize: 20, fontWeight: 700 }}>
                  {clv >= 0 ? "+" : ""}{clv.toFixed(1)}%
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div className="label" style={{ marginBottom: 6 }}>Closing odds</div>
                <input
                  value={closingOdds}
                  onChange={e => setClosingOdds(e.target.value)}
                  placeholder="e.g. 1.90"
                  type="number"
                  step="0.01"
                  min="1"
                  style={{
                    width: "100%", padding: "9px 12px",
                    borderRadius: "var(--r-s)",
                    border: "1px solid var(--line-2)",
                    background: "var(--bg-3)",
                    color: "var(--text)",
                    fontFamily: "var(--mono)", fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>
              {bet.odds && closingOdds && (
                <div style={{ flexShrink: 0, paddingTop: 22, color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 11, textAlign: "center" }}>
                  <div>your bet</div>
                  <div className="num" style={{ color: "var(--text-2)", fontSize: 14 }}>{bet.odds.toFixed(2)}</div>
                </div>
              )}
            </div>

            {clv === null && (
              <div style={{ color: "var(--text-4)", fontFamily: "var(--mono)", fontSize: 11, marginTop: 8 }}>
                Fetched automatically via Odds API after kickoff — or enter manually.
              </div>
            )}
          </div>

          {/* Save button */}
          <button
            className="btn accent"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={() => onSave(closingOdds ? parseFloat(closingOdds) : null)}
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
              <button
                className="btn sm"
                onClick={onDelete}
                style={{ borderColor: "#e05555", color: "#e05555", background: "rgba(224,85,85,0.06)" }}
              >
                Yes, delete
              </button>
            </div>
          ) : (
            <button
              className="btn sm"
              onClick={() => setConfirmDelete(true)}
              style={{ color: "var(--text-3)", width: "100%", justifyContent: "center" }}
            >
              🗑 Remove bet
            </button>
          )}
        </div>
      </div>
    </>
  );
}

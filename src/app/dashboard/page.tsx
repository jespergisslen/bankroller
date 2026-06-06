"use client";

import { useState } from "react";
import { Sparkline } from "@/components/Sparkline";
import { LogBetModal } from "@/components/LogBetModal";
import { BANKROLL_CURVE, BANKROLL_NOW, DASH_KPIS, YIELD_SPORT, YIELD_MARKET, RECENT_BETS } from "@/lib/mockData";

const RANGES = ["1M", "3M", "6M", "YTD", "ALL"];

export default function DashboardPage() {
  const [range, setRange] = useState("3M");
  const [showModal, setShowModal] = useState(false);

  const maxSport = Math.max(...YIELD_SPORT.map(s => Math.abs(s.val)));
  const maxMarket = Math.max(...YIELD_MARKET.map(m => Math.abs(m.val)));

  return (
    <>
      {showModal && <LogBetModal onClose={() => setShowModal(false)} />}

      <div className="fade-in">
        {/* Page head */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>My Bets</h1>
            <p style={{ color: "var(--text-2)", marginTop: 4, fontSize: 13.5 }}>Full control over where you&apos;re up and down — and why.</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button className="btn sm">⤓ Export</button>
            <button className="btn accent sm" onClick={() => setShowModal(true)}>+ Log a bet</button>
          </div>
        </div>

        {/* KPI strip */}
        <div
          className="d1 fade-in"
          style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}
        >
          {DASH_KPIS.map((kpi) => (
            <div
              key={kpi.k}
              className="panel"
              style={{
                padding: "14px 15px 13px",
                position: "relative",
                overflow: "hidden",
                cursor: "default",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "color-mix(in oklch, var(--accent) 30%, transparent)";
                const bar = e.currentTarget.querySelector(".kpi-bar") as HTMLElement;
                if (bar) bar.style.opacity = "1";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--line)";
                const bar = e.currentTarget.querySelector(".kpi-bar") as HTMLElement;
                if (bar) bar.style.opacity = "0";
              }}
            >
              <div className="kpi-bar" style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: 2, background: "var(--accent)", opacity: 0, transition: "opacity 0.15s",
              }} />
              <div className="label" style={{ marginBottom: 8 }}>{kpi.k}</div>
              <div
                className={`num ${kpi.up === true ? "pos glow" : kpi.up === null ? "" : "neg"}`}
                style={{ fontSize: 25, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1 }}
              >
                {kpi.v}
              </div>
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                {kpi.up !== null && (
                  <span style={{
                    fontFamily: "var(--mono)", fontSize: 10.5, padding: "2px 6px",
                    borderRadius: 4,
                    background: kpi.up ? "color-mix(in oklch, var(--accent) 12%, transparent)" : "rgba(255,255,255,0.04)",
                    color: kpi.up ? "var(--accent)" : "var(--neg)",
                  }}>
                    {kpi.up ? "▲" : "▼"} {kpi.d}
                  </span>
                )}
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
              <span style={{ fontWeight: 600, fontSize: 13 }}>Bankroll curve</span>
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
                <span className="num pos glow" style={{ fontSize: 34, fontWeight: 500, letterSpacing: "-0.02em" }}>
                  {BANKROLL_NOW.toLocaleString("sv-SE")} kr
                </span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--accent)" }}>+9 360 kr</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)" }}>from 20 000 kr</span>
              </div>
              <Sparkline data={BANKROLL_CURVE} height={196} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0, marginTop: 16, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
                {[
                  { label: "Best day",  val: "+500 kr",   pos: true },
                  { label: "Worst day", val: "−240 kr",   pos: false },
                  { label: "Avg stake", val: "212 kr",    pos: null },
                  { label: "Best run",  val: "7 wins",    pos: true },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <div className="label" style={{ marginBottom: 4 }}>{s.label}</div>
                    <div className={`num ${s.pos === true ? "pos" : s.pos === false ? "neg" : ""}`} style={{ fontSize: 13, fontWeight: 500 }}>{s.val}</div>
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
                {YIELD_SPORT.map(s => (
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
                        {s.val >= 0 ? "+" : ""}{s.val}%
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
                {YIELD_MARKET.map(m => (
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
                        {m.val >= 0 ? "+" : ""}{m.val}%
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
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Date", "Match", "Market", "Odds", "CLV", "Stake", "Result", "P&L"].map((h, i) => (
                    <th key={h} style={{
                      padding: "10px var(--pad)",
                      fontFamily: "var(--mono)", fontSize: 10, fontWeight: 500,
                      letterSpacing: "0.14em", textTransform: "uppercase",
                      color: h === "CLV" ? "var(--accent)" : "var(--text-3)",
                      textAlign: i >= 3 ? "right" : "left",
                      whiteSpace: "nowrap",
                    }}>
                      {h === "CLV"
                        ? <span title="Closing Line Value — how your odds compared to the market at kickoff. Positive = you beat the market." style={{ cursor: "help", borderBottom: "1px dashed var(--text-4)" }}>CLV ⓘ</span>
                        : h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECENT_BETS.map((bet, i) => (
                  <tr
                    key={i}
                    style={{ borderTop: "1px solid var(--line)", height: "var(--row-h)", transition: "background 0.1s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.022)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                  >
                    <td style={{ padding: "0 var(--pad)", fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--text-3)", whiteSpace: "nowrap" }}>{bet.date}</td>
                    <td style={{ padding: "0 var(--pad)", whiteSpace: "nowrap" }}>
                      <span style={{ marginRight: 6 }}>{bet.sport}</span>
                      <span style={{ fontSize: 13.5, fontWeight: 500 }}>{bet.match}</span>
                    </td>
                    <td style={{ padding: "0 var(--pad)" }}>
                      <span className="tag" style={{ marginRight: 4 }}>{bet.market}</span>
                      {bet.line && <span className="tag">{bet.line}</span>}
                    </td>
                    <td style={{ padding: "0 var(--pad)", textAlign: "right" }}>
                      <span className="num" style={{ fontSize: 13 }}>{bet.odds.toFixed(2)}</span>
                    </td>
                    <td style={{ padding: "0 var(--pad)", textAlign: "right" }}>
                      {bet.closingOdds ? (() => {
                        const clv = ((bet.odds / bet.closingOdds) - 1) * 100;
                        return (
                          <div>
                            <div className={`num ${clv >= 0 ? "pos" : "neg"}`} style={{ fontSize: 12.5, fontWeight: 600 }}>
                              {clv >= 0 ? "+" : ""}{clv.toFixed(1)}%
                            </div>
                            <div style={{ color: "var(--text-4)", fontFamily: "var(--mono)", fontSize: 10, marginTop: 1 }}>
                              cl. {bet.closingOdds.toFixed(2)}
                            </div>
                          </div>
                        );
                      })() : (
                        <span style={{ color: "var(--text-4)", fontFamily: "var(--mono)", fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "0 var(--pad)", textAlign: "right" }}>
                      <span className="num" style={{ fontSize: 13, color: "var(--text-2)" }}>{bet.stake}u</span>
                    </td>
                    <td style={{ padding: "0 var(--pad)", textAlign: "center" }}>
                      <span className={`result-pill ${bet.result}`}>{bet.result}</span>
                    </td>
                    <td style={{ padding: "0 var(--pad)", textAlign: "right" }}>
                      {bet.profit === null
                        ? <span style={{ color: "var(--text-4)", fontFamily: "var(--mono)", fontSize: 13 }}>—</span>
                        : <span className={`num ${bet.profit > 0 ? "pos glow" : bet.profit < 0 ? "neg" : ""}`} style={{ fontSize: 13, fontWeight: 500 }}>
                            {bet.profit > 0 ? "+" : ""}{bet.profit === 0 ? "—" : bet.profit}
                          </span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "12px var(--pad)", borderTop: "1px solid var(--line)", color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 11.5 }}>
            Showing 10 of 642 bets
          </div>
        </div>
      </div>
    </>
  );
}

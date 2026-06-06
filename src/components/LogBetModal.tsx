"use client";

import { useState } from "react";
import { useCurrency } from "@/lib/currencyContext";

interface LogBetModalProps {
  onClose: () => void;
}

const SPORTS = [
  { emoji: "⚽", label: "Football" },
  { emoji: "🎾", label: "Tennis" },
  { emoji: "⛳", label: "Golf" },
  { emoji: "🐎", label: "Trotting" },
  { emoji: "🏀", label: "Basketball" },
  { emoji: "🏒", label: "Ice Hockey" },
  { emoji: "🎱", label: "Other" },
];

const MARKETS = ["1X2", "Asian Handicap", "Over / Under", "BTTS", "Top goalscorer", "Bookings", "Draw No Bet", "Outright", "Other"];

const BOOKMAKERS = [
  "Bet365", "Betsson", "Unibet", "LeoVegas",
  "Svenska Spel", "ATG", "Betsafe", "NordicBet",
  "William Hill", "Pinnacle", "Other",
];

export function LogBetModal({ onClose }: LogBetModalProps) {
  const { stakeLabel, currency } = useCurrency();
  const [step, setStep] = useState<"details" | "publish">("details");
  const [sport, setSport] = useState("");
  const [match, setMatch] = useState("");
  const [market, setMarket] = useState("");
  const [line, setLine] = useState("");
  const [odds, setOdds] = useState("");
  const [closingOdds, setClosingOdds] = useState("");
  const [stake, setStake] = useState("");
  const [bookmaker, setBookmaker] = useState("");
  const [customBookmaker, setCustomBookmaker] = useState("");
  const [showCustomBookie, setShowCustomBookie] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [isMaxbet, setIsMaxbet] = useState(false);

  const effectiveBookmaker = bookmaker === "Other" ? customBookmaker : bookmaker;

  const canProceed = match && sport && odds && stake;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="panel fade-in"
        style={{ width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Header */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--line)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em" }}>Log a bet</div>
            <div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 2, fontFamily: "var(--mono)" }}>
              {step === "details" ? "1 / 2 — Bet details" : "2 / 2 — Publish settings"}
            </div>
          </div>
          <button onClick={onClose} className="btn sm" style={{ width: 28, height: 28, padding: 0, justifyContent: "center", fontSize: 16 }}>✕</button>
        </div>

        {step === "details" ? (
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Sport picker */}
            <div>
              <div className="label" style={{ marginBottom: 8 }}>Sport</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {SPORTS.map(s => (
                  <button
                    key={s.label}
                    onClick={() => setSport(s.label)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "6px 12px",
                      borderRadius: "var(--r-s)",
                      border: `1px solid ${sport === s.label ? "var(--accent)" : "var(--line-2)"}`,
                      background: sport === s.label ? "color-mix(in oklch, var(--accent) 12%, transparent)" : "rgba(255,255,255,0.025)",
                      color: sport === s.label ? "var(--accent)" : "var(--text-2)",
                      fontFamily: "var(--mono)", fontSize: 12,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <span>{s.emoji}</span> {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Match */}
            <div>
              <div className="label" style={{ marginBottom: 8 }}>Match / Event</div>
              <input
                value={match}
                onChange={e => setMatch(e.target.value)}
                placeholder="e.g. Arsenal – Man City"
                style={inputStyle}
              />
            </div>

            {/* Market + Line */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div className="label" style={{ marginBottom: 8 }}>Market</div>
                <select value={market} onChange={e => setMarket(e.target.value)} style={inputStyle}>
                  <option value="">Select…</option>
                  {MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <div className="label" style={{ marginBottom: 8 }}>Selection / Line</div>
                <input
                  value={line}
                  onChange={e => setLine(e.target.value)}
                  placeholder="e.g. +0.5 ARS"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Odds + Stake */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div className="label" style={{ marginBottom: 8 }}>Odds (decimal)</div>
                <input
                  value={odds}
                  onChange={e => setOdds(e.target.value)}
                  placeholder="1.92"
                  type="number"
                  step="0.01"
                  min="1"
                  style={inputStyle}
                />
              </div>
              <div style={{ position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div className="label">Stake</div>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--text-3)" }}>
                    currency: <span style={{ color: "var(--accent)" }}>{currency}</span>
                  </span>
                </div>
                <input
                  value={stake}
                  onChange={e => setStake(e.target.value)}
                  placeholder={currency === "units" ? "1.5" : "300"}
                  type="number"
                  min="0"
                  step={currency === "units" ? "0.25" : "10"}
                  style={{ ...inputStyle, paddingRight: 40 }}
                />
                <div style={{
                  position: "absolute", right: 12, bottom: 10,
                  fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)",
                  pointerEvents: "none",
                }}>{stakeLabel}</div>
              </div>
            </div>

            {/* Closing odds / CLV */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div className="label">Closing odds <span style={{ color: "var(--text-4)", letterSpacing: 0, textTransform: "none", fontSize: 11 }}>(optional)</span></div>
                {odds && closingOdds && parseFloat(odds) > 0 && parseFloat(closingOdds) > 0 && (
                  <div style={{ fontFamily: "var(--mono)", fontSize: 11 }}>
                    <span style={{ color: "var(--text-3)" }}>CLV </span>
                    {(() => {
                      const clv = ((parseFloat(odds) / parseFloat(closingOdds)) - 1) * 100;
                      return (
                        <span style={{ color: clv >= 0 ? "var(--accent)" : "var(--neg)", fontWeight: 600 }}>
                          {clv >= 0 ? "+" : ""}{clv.toFixed(1)}%
                        </span>
                      );
                    })()}
                  </div>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "start" }}>
                <div style={{ position: "relative" }}>
                  <input
                    value={closingOdds}
                    onChange={e => setClosingOdds(e.target.value)}
                    placeholder="e.g. 1.90"
                    type="number"
                    step="0.01"
                    min="1"
                    style={inputStyle}
                  />
                </div>
                <div style={{
                  padding: "9px 12px",
                  borderRadius: "var(--r-s)",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--line)",
                  fontFamily: "var(--mono)", fontSize: 11.5,
                  color: "var(--text-3)",
                  lineHeight: 1.5,
                }}>
                  The market odds at kickoff — we&apos;ll fetch this automatically via Odds API. You can also fill it in manually.
                </div>
              </div>
            </div>

            {/* Bookmaker */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div className="label">Bookmaker</div>
                <button
                  onClick={() => { setShowCustomBookie(!showCustomBookie); setBookmaker(""); }}
                  style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  {showCustomBookie ? "← Pick from list" : "+ Add other"}
                </button>
              </div>
              {showCustomBookie ? (
                <input
                  value={customBookmaker}
                  onChange={e => setCustomBookmaker(e.target.value)}
                  placeholder="e.g. Matchbook, Betfair…"
                  style={inputStyle}
                  autoFocus
                />
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {BOOKMAKERS.filter(b => b !== "Other").map(b => (
                    <button
                      key={b}
                      onClick={() => setBookmaker(bookmaker === b ? "" : b)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: "var(--r-s)",
                        border: `1px solid ${bookmaker === b ? "var(--accent)" : "var(--line-2)"}`,
                        background: bookmaker === b ? "color-mix(in oklch, var(--accent) 12%, transparent)" : "rgba(255,255,255,0.025)",
                        color: bookmaker === b ? "var(--accent)" : "var(--text-2)",
                        fontFamily: "var(--mono)", fontSize: 11,
                        cursor: "pointer", transition: "all 0.15s",
                      }}
                    >{b}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Maxbet toggle */}
            <div
              onClick={() => setIsMaxbet(!isMaxbet)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 16px",
                borderRadius: "var(--r-m)",
                border: `1px solid ${isMaxbet ? "color-mix(in oklch, var(--accent) 35%, transparent)" : "var(--line)"}`,
                background: isMaxbet ? "color-mix(in oklch, var(--accent) 6%, transparent)" : "rgba(255,255,255,0.02)",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              <span
                style={{
                  width: 36, height: 36, flexShrink: 0,
                  background: isMaxbet ? "var(--accent)" : "var(--text-3)",
                  WebkitMask: "url(/logo/bankroller-mark-white.png) center/contain no-repeat",
                  mask: "url(/logo/bankroller-mark-white.png) center/contain no-repeat",
                  filter: isMaxbet ? "drop-shadow(0 0 6px color-mix(in oklch, var(--accent) 60%, transparent))" : "none",
                  transition: "all 0.2s",
                }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: isMaxbet ? "var(--accent)" : "var(--text)" }}>
                  Maxbet
                </div>
                <div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 2 }}>
                  Flag this as your highest-conviction bet
                </div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Switch on={isMaxbet} />
              </div>
            </div>

            <button
              className={`btn${canProceed ? " accent" : ""}`}
              style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
              onClick={() => canProceed && setStep("publish")}
              disabled={!canProceed}
            >
              Continue →
            </button>
          </div>
        ) : (
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Bet summary */}
            <div style={{
              padding: "12px 14px",
              borderRadius: "var(--r-m)",
              background: "var(--bg-2)",
              border: "1px solid var(--line)",
              display: "flex", gap: 12, alignItems: "center",
            }}>
              <span style={{ fontSize: 22 }}>{SPORTS.find(s => s.label === sport)?.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{match}</div>
                <div style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 11, marginTop: 2 }}>
                  {market}{line ? ` · ${line}` : ""}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div className="num pos glow" style={{ fontSize: 17, fontWeight: 500 }}>{odds}</div>
                <div style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 11 }}>
                  {stake} {stakeLabel}{effectiveBookmaker ? ` · ${effectiveBookmaker}` : ""}
                </div>
              </div>
              {isMaxbet && (
                <span
                  title="Maxbet"
                  style={{
                    width: 20, height: 20, flexShrink: 0,
                    background: "var(--accent)",
                    WebkitMask: "url(/logo/bankroller-mark-white.png) center/contain no-repeat",
                    mask: "url(/logo/bankroller-mark-white.png) center/contain no-repeat",
                    filter: "drop-shadow(0 0 4px color-mix(in oklch, var(--accent) 60%, transparent))",
                  }}
                />
              )}
            </div>

            {/* Visibility toggle */}
            <div>
              <div className="label" style={{ marginBottom: 10 }}>Visibility</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { id: false, icon: "🔒", title: "Private", desc: "Only you can see this bet" },
                  { id: true,  icon: "🌐", title: "Public tip", desc: "Visible in the community feed" },
                ].map(opt => (
                  <button
                    key={String(opt.id)}
                    onClick={() => setIsPublic(opt.id)}
                    style={{
                      padding: "14px",
                      borderRadius: "var(--r-m)",
                      border: `1px solid ${isPublic === opt.id ? "color-mix(in oklch, var(--accent) 35%, transparent)" : "var(--line)"}`,
                      background: isPublic === opt.id ? "color-mix(in oklch, var(--accent) 8%, transparent)" : "rgba(255,255,255,0.02)",
                      textAlign: "left", cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    <div style={{ fontSize: 18, marginBottom: 6 }}>{opt.icon}</div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: isPublic === opt.id ? "var(--accent)" : "var(--text)" }}>{opt.title}</div>
                    <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 3 }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Analysis — only if public */}
            {isPublic && (
              <div className="fade-in">
                <div className="label" style={{ marginBottom: 8 }}>Analysis <span style={{ color: "var(--text-4)", letterSpacing: 0, textTransform: "none", fontSize: 11 }}>(optional)</span></div>
                <textarea
                  value={analysis}
                  onChange={e => setAnalysis(e.target.value)}
                  placeholder="Why do you like this bet? Your reasoning will appear in the feed alongside the pick…"
                  rows={5}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                />
                <div style={{ color: "var(--text-4)", fontFamily: "var(--mono)", fontSize: 10.5, marginTop: 6, textAlign: "right" }}>
                  {analysis.length} / 500
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button className="btn" style={{ flex: 1, justifyContent: "center" }} onClick={() => setStep("details")}>
                ← Back
              </button>
              <button className="btn accent" style={{ flex: 2, justifyContent: "center" }}>
                {isPublic ? "Save & publish tip" : "Save bet"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Switch({ on }: { on: boolean }) {
  return (
    <div style={{
      width: 40, height: 23,
      borderRadius: 12,
      background: on ? "color-mix(in oklch, var(--accent) 30%, var(--bg-3))" : "var(--bg-3)",
      border: `1px solid ${on ? "color-mix(in oklch, var(--accent) 50%, transparent)" : "var(--line-2)"}`,
      position: "relative",
      transition: "all 0.2s",
      flexShrink: 0,
    }}>
      <div style={{
        position: "absolute",
        top: 3, left: on ? 19 : 3,
        width: 15, height: 15,
        borderRadius: "50%",
        background: on ? "var(--accent)" : "var(--text-3)",
        transition: "left 0.2s, background 0.2s",
      }} />
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: "var(--r-s)",
  border: "1px solid var(--line-2)",
  background: "var(--bg-3)",
  color: "var(--text)",
  fontFamily: "var(--mono)",
  fontSize: 13,
  outline: "none",
  transition: "border-color 0.15s",
};

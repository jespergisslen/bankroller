"use client";

import { useState } from "react";
import { useCurrency } from "@/lib/currencyContext";
import { saveBet } from "@/lib/bets";

interface LogBetModalProps {
  onClose: () => void;
  onSaved?: () => void;
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
  "William Hill", "Pinnacle",
];

type BetType = "Single" | "Double" | "Treble" | "Accumulator";

const BET_TYPES: { label: BetType; count: number }[] = [
  { label: "Single",      count: 1 },
  { label: "Double",      count: 2 },
  { label: "Treble",      count: 3 },
  { label: "Accumulator", count: 4 },
];

type Selection = {
  sport: string;
  match: string;
  market: string;
  line: string;
  odds: string;
  closingOdds: string;
};

const emptySelection = (): Selection => ({
  sport: "", match: "", market: "", line: "", odds: "", closingOdds: "",
});

function makeSelections(count: number, existing: Selection[]): Selection[] {
  if (count <= existing.length) return existing.slice(0, count);
  return [...existing, ...Array.from({ length: count - existing.length }, emptySelection)];
}

export function LogBetModal({ onClose, onSaved }: LogBetModalProps) {
  const { stakeLabel, currency } = useCurrency();
  const [step, setStep] = useState<"details" | "publish">("details");

  const [betType, setBetType] = useState<BetType>("Single");
  const [selections, setSelections] = useState<Selection[]>([emptySelection()]);

  const [stake, setStake] = useState("");
  const [bookmaker, setBookmaker] = useState("");
  const [customBookmaker, setCustomBookmaker] = useState("");
  const [showCustomBookie, setShowCustomBookie] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [isMaxbet, setIsMaxbet] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const isAcca = betType === "Accumulator";

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    const { error } = await saveBet({
      betType,
      stake: parseFloat(stake),
      bookmaker: showCustomBookie ? customBookmaker : bookmaker,
      isPublic,
      analysis,
      isMaxbet,
      selections: selections.map(s => ({
        sport: s.sport,
        match: s.match,
        market: s.market,
        line: s.line,
        odds: parseFloat(s.odds),
      })),
    });
    setSaving(false);
    if (error) { setSaveError(error); return; }
    onSaved?.();
    onClose();
  };

  const handleBetType = (type: BetType) => {
    const count = BET_TYPES.find(b => b.label === type)!.count;
    setBetType(type);
    setSelections(makeSelections(count, selections));
  };

  const updateSelection = (i: number, field: keyof Selection, value: string) => {
    setSelections(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  const addSelection = () => setSelections(prev => [...prev, emptySelection()]);
  const removeSelection = (i: number) => setSelections(prev => prev.filter((_, idx) => idx !== i));

  // Combined odds = product of all selections
  const combinedOdds = selections.reduce((acc, s) => {
    const o = parseFloat(s.odds);
    return o > 0 ? acc * o : acc;
  }, 1);
  const combinedOddsStr = selections.every(s => parseFloat(s.odds) > 0)
    ? combinedOdds.toFixed(2)
    : "";

  const canProceed = selections.every(s => s.match && s.sport && s.odds) && !!stake;

  const effectiveBookmaker = showCustomBookie ? customBookmaker : bookmaker;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="panel fade-in log-bet-modal"
        style={{ width: "100%", maxWidth: 580, maxHeight: "92vh", overflowY: "auto" }}
      >
        {/* Header */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--line)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, background: "var(--bg-1)", zIndex: 10,
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
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Bet type */}
            <div>
              <div className="label" style={{ marginBottom: 8 }}>Bet type</div>
              <div style={{ display: "flex", gap: 6 }}>
                {BET_TYPES.map(bt => (
                  <button
                    key={bt.label}
                    onClick={() => handleBetType(bt.label)}
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      borderRadius: "var(--r-s)",
                      border: `1px solid ${betType === bt.label ? "var(--accent)" : "var(--line-2)"}`,
                      background: betType === bt.label ? "color-mix(in oklch, var(--accent) 12%, transparent)" : "rgba(255,255,255,0.025)",
                      color: betType === bt.label ? "var(--accent)" : "var(--text-2)",
                      fontFamily: "var(--mono)", fontSize: 11.5,
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    {bt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Selections */}
            {selections.map((sel, i) => (
              <div
                key={i}
                style={{
                  padding: 16,
                  borderRadius: "var(--r-m)",
                  border: "1px solid var(--line)",
                  background: "rgba(255,255,255,0.015)",
                  display: "flex", flexDirection: "column", gap: 14,
                }}
              >
                {/* Selection header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%",
                      background: "var(--bg-3)", border: "1px solid var(--line-2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "var(--mono)", fontSize: 10, color: "var(--accent)", fontWeight: 600,
                    }}>{i + 1}</div>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--text-3)" }}>
                      {betType === "Single" ? "Selection" : `Selection ${i + 1}`}
                    </span>
                    {sel.odds && (
                      <span className="num pos" style={{ fontSize: 12, fontWeight: 600 }}>{parseFloat(sel.odds).toFixed(2)}</span>
                    )}
                  </div>
                  {isAcca && selections.length > 4 && (
                    <button
                      onClick={() => removeSelection(i)}
                      style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--text-4)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Sport */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {SPORTS.map(s => (
                    <button
                      key={s.label}
                      onClick={() => updateSelection(i, "sport", s.label)}
                      style={{
                        display: "flex", alignItems: "center", gap: 5,
                        padding: "5px 10px",
                        borderRadius: "var(--r-s)",
                        border: `1px solid ${sel.sport === s.label ? "var(--accent)" : "var(--line-2)"}`,
                        background: sel.sport === s.label ? "color-mix(in oklch, var(--accent) 12%, transparent)" : "rgba(255,255,255,0.025)",
                        color: sel.sport === s.label ? "var(--accent)" : "var(--text-2)",
                        fontFamily: "var(--mono)", fontSize: 11, cursor: "pointer", transition: "all 0.15s",
                      }}
                    >
                      {s.emoji} {s.label}
                    </button>
                  ))}
                </div>

                {/* Match */}
                <input
                  value={sel.match}
                  onChange={e => updateSelection(i, "match", e.target.value)}
                  placeholder="Match / Event — e.g. Arsenal – Man City"
                  style={inputStyle}
                />

                {/* Market + Line + Odds */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", gap: 10 }}>
                  <select value={sel.market} onChange={e => updateSelection(i, "market", e.target.value)} style={inputStyle}>
                    <option value="">Market…</option>
                    {MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <input
                    value={sel.line}
                    onChange={e => updateSelection(i, "line", e.target.value)}
                    placeholder="Selection"
                    style={inputStyle}
                  />
                  <input
                    value={sel.odds}
                    onChange={e => updateSelection(i, "odds", e.target.value)}
                    placeholder="Odds"
                    type="number" step="0.01" min="1"
                    style={inputStyle}
                  />
                </div>

              </div>
            ))}

            {/* Add selection (Accumulator only) */}
            {isAcca && (
              <button onClick={addSelection} className="btn" style={{ justifyContent: "center", borderStyle: "dashed" }}>
                + Add selection
              </button>
            )}

            {/* Combined odds display (multi) */}
            {betType !== "Single" && combinedOddsStr && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px",
                borderRadius: "var(--r-m)",
                background: "color-mix(in oklch, var(--accent) 6%, transparent)",
                border: "1px solid color-mix(in oklch, var(--accent) 20%, transparent)",
              }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-2)" }}>
                  Combined odds ({selections.length} selections)
                </span>
                <span className="num pos glow" style={{ fontSize: 20, fontWeight: 700 }}>{combinedOddsStr}</span>
              </div>
            )}

            {/* Stake + Bookmaker */}
            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <div className="label" style={{ marginBottom: 8 }}>Stake</div>
                <input
                  value={stake}
                  onChange={e => setStake(e.target.value)}
                  placeholder={currency === "units" ? "1.5" : "300"}
                  type="number" min="0"
                  step={currency === "units" ? "0.25" : "10"}
                  style={{ ...inputStyle, paddingRight: 34 }}
                />
                <div style={{ position: "absolute", right: 10, bottom: 10, fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)", pointerEvents: "none" }}>
                  {stakeLabel}
                </div>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div className="label">Bookmaker</div>
                  <button
                    onClick={() => { setShowCustomBookie(!showCustomBookie); setBookmaker(""); }}
                    style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  >
                    {showCustomBookie ? "← List" : "+ Other"}
                  </button>
                </div>
                {showCustomBookie ? (
                  <input
                    value={customBookmaker}
                    onChange={e => setCustomBookmaker(e.target.value)}
                    placeholder="e.g. Betfair, Matchbook…"
                    style={inputStyle}
                    autoFocus
                  />
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {BOOKMAKERS.map(b => (
                      <button key={b} onClick={() => setBookmaker(bookmaker === b ? "" : b)} style={{
                        padding: "5px 9px", borderRadius: "var(--r-s)",
                        border: `1px solid ${bookmaker === b ? "var(--accent)" : "var(--line-2)"}`,
                        background: bookmaker === b ? "color-mix(in oklch, var(--accent) 12%, transparent)" : "rgba(255,255,255,0.025)",
                        color: bookmaker === b ? "var(--accent)" : "var(--text-2)",
                        fontFamily: "var(--mono)", fontSize: 11, cursor: "pointer", transition: "all 0.15s",
                      }}>{b}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Maxbet */}
            <div
              onClick={() => setIsMaxbet(!isMaxbet)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 16px", borderRadius: "var(--r-m)",
                border: `1px solid ${isMaxbet ? "color-mix(in oklch, var(--accent) 35%, transparent)" : "var(--line)"}`,
                background: isMaxbet ? "color-mix(in oklch, var(--accent) 6%, transparent)" : "rgba(255,255,255,0.02)",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              <span style={{
                width: 36, height: 36, flexShrink: 0,
                background: isMaxbet ? "var(--accent)" : "var(--text-3)",
                WebkitMask: "url(/logo/bankroller-mark-white.png) center/contain no-repeat",
                mask: "url(/logo/bankroller-mark-white.png) center/contain no-repeat",
                filter: isMaxbet ? "drop-shadow(0 0 6px color-mix(in oklch, var(--accent) 60%, transparent))" : "none",
                transition: "all 0.2s",
              }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: isMaxbet ? "var(--accent)" : "var(--text)" }}>Maxbet</div>
                <div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 2 }}>Flag this as your highest-conviction bet</div>
              </div>
              <div style={{ marginLeft: "auto" }}><Switch on={isMaxbet} /></div>
            </div>

            <button
              className={`btn${canProceed ? " accent" : ""}`}
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => canProceed && setStep("publish")}
              disabled={!canProceed}
            >
              Continue →
            </button>
          </div>

        ) : (
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Summary */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {selections.map((sel, i) => (
                <div key={i} style={{
                  padding: "11px 14px",
                  borderRadius: "var(--r-m)",
                  background: "var(--bg-2)",
                  border: "1px solid var(--line)",
                  display: "flex", gap: 12, alignItems: "center",
                }}>
                  <span style={{ color: "var(--text-4)", fontFamily: "var(--mono)", fontSize: 10, minWidth: 14 }}>{i + 1}</span>
                  <span style={{ fontSize: 16 }}>{SPORTS.find(s => s.label === sel.sport)?.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sel.match}</div>
                    <div style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 10.5, marginTop: 1 }}>
                      {sel.market}{sel.line ? ` · ${sel.line}` : ""}
                    </div>
                  </div>
                  <span className="num pos glow" style={{ fontSize: 15, fontWeight: 600, flexShrink: 0 }}>{parseFloat(sel.odds).toFixed(2)}</span>
                </div>
              ))}

              {/* Combined / stake row */}
              <div style={{
                padding: "11px 14px",
                borderRadius: "var(--r-m)",
                background: "color-mix(in oklch, var(--accent) 5%, var(--bg-2))",
                border: "1px solid color-mix(in oklch, var(--accent) 18%, transparent)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)" }}>
                    {betType}{effectiveBookmaker ? ` · ${effectiveBookmaker}` : ""}
                    {isMaxbet && " 🦑"}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  {combinedOddsStr && (
                    <div className="num pos glow" style={{ fontSize: 17, fontWeight: 700 }}>{combinedOddsStr}</div>
                  )}
                  <div style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 11 }}>{stake} {stakeLabel}</div>
                </div>
              </div>
            </div>

            {/* Visibility */}
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
                      padding: "14px", borderRadius: "var(--r-m)",
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

            {isPublic && (
              <div className="fade-in">
                <div className="label" style={{ marginBottom: 8 }}>
                  Analysis <span style={{ color: "var(--text-4)", letterSpacing: 0, textTransform: "none", fontSize: 11 }}>(optional)</span>
                </div>
                <textarea
                  value={analysis}
                  onChange={e => setAnalysis(e.target.value)}
                  placeholder="Why do you like this bet? Your reasoning will appear in the feed…"
                  rows={5}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                />
                <div style={{ color: "var(--text-4)", fontFamily: "var(--mono)", fontSize: 10.5, marginTop: 6, textAlign: "right" }}>
                  {analysis.length} / 500
                </div>
              </div>
            )}

            {saveError && (
              <div style={{
                padding: "10px 12px", borderRadius: "var(--r-s)",
                background: "rgba(224,85,85,0.08)", border: "1px solid rgba(224,85,85,0.3)",
                color: "#e05555", fontFamily: "var(--mono)", fontSize: 12,
              }}>{saveError}</div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn" style={{ flex: 1, justifyContent: "center" }} onClick={() => setStep("details")}>← Back</button>
              <button className="btn accent" style={{ flex: 2, justifyContent: "center" }} onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : isPublic ? "Save & publish tip" : "Save bet"}
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
      width: 40, height: 23, borderRadius: 12,
      background: on ? "color-mix(in oklch, var(--accent) 30%, var(--bg-3))" : "var(--bg-3)",
      border: `1px solid ${on ? "color-mix(in oklch, var(--accent) 50%, transparent)" : "var(--line-2)"}`,
      position: "relative", transition: "all 0.2s", flexShrink: 0,
    }}>
      <div style={{
        position: "absolute", top: 3, left: on ? 19 : 3,
        width: 15, height: 15, borderRadius: "50%",
        background: on ? "var(--accent)" : "var(--text-3)",
        transition: "left 0.2s, background 0.2s",
      }} />
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px",
  borderRadius: "var(--r-s)",
  border: "1px solid var(--line-2)",
  background: "var(--bg-3)",
  color: "var(--text)",
  fontFamily: "var(--mono)", fontSize: 13,
  outline: "none", transition: "border-color 0.15s",
};

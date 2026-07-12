"use client";

import { useEffect, useRef, useState } from "react";
import { BANKROLL_CURVE, DASH_KPIS } from "@/lib/mockData";

// Precompute the bankroll curve path once (static demo data).
const CW = 560, CH = 150;
const CURVE = (() => {
  const min = Math.min(...BANKROLL_CURVE);
  const max = Math.max(...BANKROLL_CURVE);
  const span = max - min || 1;
  const pts = BANKROLL_CURVE.map((v, i) => {
    const x = (i / (BANKROLL_CURVE.length - 1)) * CW;
    const y = CH - ((v - min) / span) * (CH - 12) - 6;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const line = "M" + pts.join(" L");
  const area = `${line} L${CW},${CH} L0,${CH} Z`;
  return { line, area };
})();

const VIEWS = ["Dashboard", "Log a bet", "Track record", "Leaderboard"];

const label: React.CSSProperties = {
  fontFamily: "var(--mono)", fontSize: 9.5, letterSpacing: "1.5px",
  textTransform: "uppercase", color: "var(--text-3)",
};

export function HeroShowcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (reduced.current || paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % VIEWS.length), 4200);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div style={{ perspective: 1600, margin: "8px auto 0", maxWidth: 720 }}>
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        style={{
          transformStyle: "preserve-3d",
          transform: paused ? "none" : "rotateX(3deg) rotateY(-6deg)",
          transition: "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Window */}
        <div style={{
          position: "relative", borderRadius: 14, overflow: "hidden",
          background: "linear-gradient(180deg, var(--bg-1), var(--bg))",
          border: "1px solid var(--line-2)",
          boxShadow: "0 30px 80px -24px rgba(0,0,0,0.7), 0 0 60px -20px color-mix(in oklch, var(--accent) 30%, transparent)",
        }}>
          {/* Chrome bar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "11px 14px", borderBottom: "1px solid var(--line)",
          }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ff5f57" }} />
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#febc2e" }} />
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#28c840" }} />
            <span style={{ ...label, marginLeft: 10 }}>{VIEWS[active]}</span>
          </div>

          {/* Views (crossfade) */}
          <div style={{ position: "relative", height: 296 }}>
            {[<DashboardView key="d" />, <LogBetView key="l" />, <TrackRecordView key="t" />, <LeaderboardView key="b" />].map((v, i) => (
              <div key={i} style={{
                position: "absolute", inset: 0, padding: "18px 20px",
                opacity: i === active ? 1 : 0,
                transform: i === active ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 0.55s ease, transform 0.55s ease",
                pointerEvents: i === active ? "auto" : "none",
              }}>
                {v}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* View tabs */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 18, flexWrap: "wrap" }}>
        {VIEWS.map((v, i) => (
          <button
            key={v}
            onClick={() => setActive(i)}
            style={{
              fontFamily: "var(--mono)", fontSize: 11, cursor: "pointer",
              padding: "5px 11px", borderRadius: 20,
              border: `1px solid ${i === active ? "color-mix(in oklch, var(--accent) 45%, transparent)" : "var(--line-2)"}`,
              background: i === active ? "color-mix(in oklch, var(--accent) 12%, transparent)" : "transparent",
              color: i === active ? "var(--accent)" : "var(--text-3)",
              transition: "all 0.2s",
            }}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Views ---------- */

function DashboardView() {
  const kpis = DASH_KPIS.slice(0, 4);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
        {kpis.map((k) => (
          <div key={k.k} style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "9px 10px", background: "rgba(255,255,255,0.02)" }}>
            <div style={label}>{k.k}</div>
            <div className={`num ${k.up ? "pos glow" : ""}`} style={{ fontSize: 16, fontWeight: 600, marginTop: 5, color: k.up ? "var(--accent)" : "var(--text)" }}>{k.v}</div>
          </div>
        ))}
      </div>
      <div style={{ ...label, marginBottom: 8 }}>Bankroll · all time</div>
      <div style={{ flex: 1, position: "relative" }}>
        <svg viewBox={`0 0 ${CW} ${CH}`} preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="hs-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={CURVE.area} fill="url(#hs-fill)" />
          <path d={CURVE.line} fill="none" stroke="var(--accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </div>
  );
}

function LogBetView() {
  const sports = [["⚽", "Football", true], ["🎾", "Tennis", false], ["⛳", "Golf", false], ["🐎", "Trotting", false]] as const;
  const field: React.CSSProperties = {
    border: "1px solid var(--line-2)", borderRadius: 8, padding: "10px 12px",
    background: "rgba(255,255,255,0.025)", color: "var(--text)", fontSize: 13,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      <div style={label}>New selection</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {sports.map(([e, name, on]) => (
          <span key={name} style={{
            display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 8,
            border: `1px solid ${on ? "var(--accent)" : "var(--line-2)"}`,
            background: on ? "color-mix(in oklch, var(--accent) 12%, transparent)" : "rgba(255,255,255,0.025)",
            color: on ? "var(--accent)" : "var(--text-2)", fontFamily: "var(--mono)", fontSize: 11,
          }}>{e} {name}</span>
        ))}
      </div>
      <div style={{ ...field, color: "var(--text-2)" }}>Real Madrid – Barcelona</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 90px", gap: 8 }}>
        <div style={{ ...field, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Over / Under</span><span style={{ color: "var(--text-3)" }}>▾</span>
        </div>
        <div style={{ ...field, color: "var(--text-2)" }}>Over 2.5</div>
        <div style={{ ...field, fontFamily: "var(--mono)", textAlign: "center" }}>1.90</div>
      </div>
      <div style={{
        marginTop: 4, textAlign: "center", padding: "11px", borderRadius: 8,
        background: "color-mix(in oklch, var(--accent) 14%, transparent)",
        border: "1px solid color-mix(in oklch, var(--accent) 45%, transparent)",
        color: "var(--accent)", fontFamily: "var(--mono)", fontSize: 12.5, fontWeight: 600,
      }}>Save bet</div>
    </div>
  );
}

function TrackRecordView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={label}>Published tip</div>
      <div style={{ border: "1px solid var(--line)", borderRadius: 10, padding: 15, background: "rgba(255,255,255,0.02)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <span style={{ position: "relative", display: "inline-block", width: 40, height: 40, flexShrink: 0 }}>
            <span style={{
              width: 40, height: 40, borderRadius: 10, background: "#8a8d9622", border: "1px solid #8a8d9644",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, color: "#8a8d96",
            }}>ZI</span>
            <span style={{
              position: "absolute", top: -5, left: -5, width: 17, height: 17, borderRadius: "50%",
              background: "#e6b23a", color: "#1c1c1d", border: "2px solid var(--bg-1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--mono)", fontSize: 9.5, fontWeight: 700,
            }}>1</span>
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>zinkcity</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)" }}>@zinkcity</div>
          </div>
          <span style={{
            fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
            padding: "2px 8px", borderRadius: 4, color: "var(--accent)",
            background: "color-mix(in oklch, var(--accent) 13%, transparent)",
            border: "1px solid color-mix(in oklch, var(--accent) 30%, transparent)",
          }}>WON</span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 500, marginTop: 13 }}>Real Madrid – Barcelona</div>
        <div style={{ display: "flex", gap: 18, marginTop: 10 }}>
          <Stat k="PICK" v="Over 2.5" />
          <Stat k="ODDS" v="1.90" accent />
          <Stat k="PROFIT" v="+1.9u" pos />
        </div>
      </div>
    </div>
  );
}

function Stat({ k, v, accent, pos }: { k: string; v: string; accent?: boolean; pos?: boolean }) {
  return (
    <div>
      <div style={label}>{k}</div>
      <div className={pos ? "num pos glow" : "num"} style={{
        fontFamily: "var(--mono)", fontSize: 15, fontWeight: 600, marginTop: 4,
        color: accent || pos ? "var(--accent)" : "var(--text)",
      }}>{v}</div>
    </div>
  );
}

function LeaderboardView() {
  const rows = [
    { m: "#e6b23a", n: "01", name: "hotdog", init: "HO", y: "+18.2%" },
    { m: "#c3c7d0", n: "02", name: "zinkcity", init: "ZI", y: "+12.7%" },
    { m: "#cd8b53", n: "03", name: "bankroller", init: "BA", y: "+9.4%" },
    { m: "", n: "04", name: "betedge", init: "BE", y: "+6.1%" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "grid", gridTemplateColumns: "30px 1fr 70px", gap: 10, padding: "2px 4px 8px" }}>
        <span style={label}>#</span><span style={label}>Tipster</span><span style={{ ...label, textAlign: "right" }}>Yield</span>
      </div>
      {rows.map((r) => (
        <div key={r.n} style={{ display: "grid", gridTemplateColumns: "30px 1fr 70px", gap: 10, alignItems: "center", padding: "8px 4px", borderTop: "1px solid var(--line)" }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: r.m ? 600 : 400, color: r.m || "var(--text-3)" }}>{r.n}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{
              width: 26, height: 26, borderRadius: 7, background: "#8a8d9622", border: "1px solid #8a8d9644",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--mono)", fontSize: 9.5, fontWeight: 700, color: "#8a8d96",
            }}>{r.init}</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{r.name}</span>
          </div>
          <span className="num pos" style={{ textAlign: "right", fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>{r.y}</span>
        </div>
      ))}
    </div>
  );
}

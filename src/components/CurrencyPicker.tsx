"use client";

import { useState, useRef, useEffect } from "react";
import { useCurrency, CURRENCIES } from "@/lib/currencyContext";

export function CurrencyPicker() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = CURRENCIES.find(c => c.value === currency)!;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        className="btn sm"
        onClick={() => setOpen(!open)}
        style={{ gap: 5, color: "var(--text-2)" }}
      >
        <span style={{ color: "var(--accent)" }}>◈</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 11 }}>{current.label}</span>
        <span style={{ color: "var(--text-4)", fontSize: 9 }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          background: "var(--bg-1)",
          border: "1px solid var(--line-2)",
          borderRadius: "var(--r-m)",
          minWidth: 160,
          zIndex: 200,
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}>
          {CURRENCIES.map(c => (
            <button
              key={c.value}
              onClick={() => { setCurrency(c.value); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                width: "100%", padding: "9px 14px",
                fontFamily: "var(--mono)", fontSize: 12,
                background: currency === c.value ? "rgba(255,255,255,0.06)" : "transparent",
                color: currency === c.value ? "var(--accent)" : "var(--text-2)",
                border: "none", cursor: "pointer",
                borderBottom: "1px solid var(--line)",
                transition: "background 0.1s",
              }}
              onMouseEnter={e => { if (currency !== c.value) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
              onMouseLeave={e => { if (currency !== c.value) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <span>{c.label}</span>
              {currency === c.value && <span style={{ fontSize: 10 }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

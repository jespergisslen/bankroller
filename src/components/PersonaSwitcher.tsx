"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePersona } from "@/lib/personaContext";
import { MAX_PERSONAS } from "@/lib/personas";

function initialsOf(p: { displayName: string; username: string }) {
  return (p.displayName || p.username || "??").slice(0, 2).toUpperCase();
}

export function PersonaSwitcher({ fallbackInitials, onSignOut }: {
  fallbackInitials: string;
  onSignOut: () => void;
}) {
  const { personas, active, activeId, setActiveId } = usePersona();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const badge = active ? initialsOf(active) : fallbackInitials;
  const multi = personas.length > 1;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        className="btn sm"
        onClick={() => setOpen((o) => !o)}
        style={{ display: "flex", alignItems: "center", gap: 7 }}
        aria-label="Switch profile"
      >
        <span style={{
          width: 22, height: 22, borderRadius: 7, flexShrink: 0,
          background: "color-mix(in oklch, var(--accent) 16%, transparent)",
          border: "1px solid color-mix(in oklch, var(--accent) 30%, transparent)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--mono)", fontSize: 9.5, fontWeight: 700, color: "var(--accent)",
        }}>{badge}</span>
        {active && <span className="nav-label" style={{ fontFamily: "var(--mono)", fontSize: 11.5 }}>{active.displayName || active.username}</span>}
        <span style={{ color: "var(--text-3)", fontSize: 9 }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 60,
          minWidth: 220, background: "var(--bg-1)",
          border: "1px solid var(--line-2)", borderRadius: "var(--r-m)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)", overflow: "hidden",
        }}>
          {multi && (
            <div style={{ padding: "8px 12px 4px", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--text-4)" }}>
              Posting as
            </div>
          )}
          {personas.map((p) => {
            const on = p.id === activeId;
            return (
              <button
                key={p.id}
                onClick={() => { setActiveId(p.id); setOpen(false); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px", background: on ? "rgba(255,255,255,0.04)" : "transparent",
                  border: "none", cursor: "pointer", textAlign: "left",
                }}
              >
                <span style={{
                  width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                  background: "color-mix(in oklch, var(--accent) 14%, transparent)",
                  border: "1px solid color-mix(in oklch, var(--accent) 28%, transparent)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, color: "var(--accent)",
                }}>{initialsOf(p)}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{p.displayName || p.username}</span>
                  <span style={{ display: "block", fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--text-3)" }}>@{p.username}</span>
                </span>
                {on && <span style={{ color: "var(--accent)", fontSize: 12 }}>✓</span>}
              </button>
            );
          })}

          <div style={{ borderTop: "1px solid var(--line)" }}>
            <Link href="/profile" onClick={() => setOpen(false)} style={{ display: "block", padding: "9px 12px", fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-2)", textDecoration: "none" }}>
              Profile
            </Link>
            {active?.username && (
              <Link href={`/u/${active.username}`} onClick={() => setOpen(false)} style={{ display: "block", padding: "9px 12px", borderTop: "1px solid var(--line)", fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-2)", textDecoration: "none" }}>
                View public profile ↗
              </Link>
            )}
            {personas.length < MAX_PERSONAS && (
              <Link href="/profile" onClick={() => setOpen(false)} style={{ display: "block", padding: "9px 12px", borderTop: "1px solid var(--line)", fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-2)", textDecoration: "none" }}>
                + New profile
              </Link>
            )}
            <button
              onClick={() => { setOpen(false); onSignOut(); }}
              style={{ width: "100%", padding: "9px 12px", background: "none", border: "none", borderTop: "1px solid var(--line)", cursor: "pointer", textAlign: "left", fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-3)" }}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

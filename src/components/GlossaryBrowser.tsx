"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { GlossaryTerm } from "@/lib/glossary";

export function GlossaryBrowser({ terms }: { terms: GlossaryTerm[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return terms;
    return terms.filter((t) =>
      (t.term + " " + (t.abbr ?? "") + " " + t.oneLiner + " " + t.group).toLowerCase().includes(needle)
    );
  }, [q, terms]);

  const groups = [...new Set(filtered.map((t) => t.group))];

  // Stable index across the full list so numbers don't reshuffle on filter.
  const indexOf = (slug: string) => terms.findIndex((t) => t.slug === slug) + 1;

  return (
    <div>
      {/* Terminal-style search */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginBottom: 26,
        padding: "10px 14px", borderRadius: "var(--r-m)",
        border: "1px solid var(--line-2)", background: "var(--bg-2)",
      }}>
        <span style={{ color: "var(--accent)", fontFamily: "var(--mono)", fontSize: 13 }}>&gt;</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="filter terms…"
          style={{
            flex: 1, border: "none", outline: "none", background: "transparent",
            color: "var(--text)", fontFamily: "var(--mono)", fontSize: 13.5,
          }}
        />
        <span style={{ color: "var(--text-4)", fontFamily: "var(--mono)", fontSize: 11.5 }}>
          {filtered.length}/{terms.length}
        </span>
      </div>

      {groups.length === 0 && (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 13 }}>
          No terms match &ldquo;{q}&rdquo;.
        </div>
      )}

      {groups.map((group) => (
        <div key={group} style={{ marginBottom: 26 }}>
          <div className="label" style={{ marginBottom: 8 }}>{group}</div>
          <div style={{ borderTop: "1px solid var(--line)" }}>
            {filtered.filter((t) => t.group === group).map((t) => (
              <Link
                key={t.slug}
                href={`/glossary/${t.slug}`}
                className="glossary-row"
                style={{
                  display: "grid", gridTemplateColumns: "34px 1fr auto", gap: 12, alignItems: "baseline",
                  padding: "13px 8px", borderBottom: "1px solid var(--line)",
                  textDecoration: "none", color: "inherit",
                }}
              >
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-4)" }}>
                  {String(indexOf(t.slug)).padStart(2, "0")}
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>
                    {t.term}
                    {t.abbr ? <span style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 12 }}> · {t.abbr}</span> : null}
                  </span>
                  <span style={{ display: "block", color: "var(--text-3)", fontSize: 12.5, lineHeight: 1.5, marginTop: 2 }}>
                    {t.oneLiner}
                  </span>
                </span>
                <span className="glossary-arrow" style={{ color: "var(--accent)", fontFamily: "var(--mono)", fontSize: 13, opacity: 0.5 }}>→</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

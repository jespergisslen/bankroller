"use client";

import { useState } from "react";

// A small "i" icon that reveals a short explanation on hover. Resets the
// inherited label styles (uppercase, letter-spacing and white-space: nowrap)
// so the text wraps inside the box, and can align left or right so it stays
// on-screen wherever the icon sits.
export function InfoTip({ text, align = "left", placement = "top" }: {
  text: string;
  align?: "left" | "right";
  placement?: "top" | "bottom";
}) {
  const [show, setShow] = useState(false);
  return (
    <span
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span
        role="img"
        aria-label="More info"
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 14, height: 14, borderRadius: "50%", cursor: "help",
          border: "1px solid var(--line-3)", color: "var(--text-3)",
          fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700, lineHeight: 1, textTransform: "none",
        }}
      >i</span>
      {show && (
        <span style={{
          position: "absolute", zIndex: 50,
          ...(placement === "bottom" ? { top: "calc(100% + 8px)" } : { bottom: "calc(100% + 8px)" }),
          ...(align === "right" ? { right: 0 } : { left: 0 }),
          display: "block", boxSizing: "border-box",
          width: 240, maxWidth: "calc(100vw - 56px)", padding: "10px 12px", borderRadius: 8,
          background: "var(--bg-2)", border: "1px solid var(--line-2)",
          color: "var(--text-2)", fontSize: 11.5, lineHeight: 1.5, fontWeight: 400,
          textTransform: "none", letterSpacing: "normal", whiteSpace: "normal", textAlign: "left",
          boxShadow: "0 8px 24px rgba(0,0,0,0.45)", pointerEvents: "none",
        }}>{text}</span>
      )}
    </span>
  );
}

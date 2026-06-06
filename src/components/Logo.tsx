"use client";

interface LogoProps {
  variant?: "wordmark" | "mark" | "monogram";
  size?: number;
}

export function Logo({ variant = "wordmark", size = 40 }: LogoProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: variant === "wordmark" ? 11 : 12, textDecoration: "none" }}>
      <span
        className="kraken"
        style={{ width: size, height: size }}
        aria-hidden
      />
      {variant === "wordmark" && (
        <span
          className="pos glow"
          style={{
            fontFamily: "var(--logo-font)",
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          Bankroller
        </span>
      )}
      {variant === "mark" && (
        <span
          style={{
            fontFamily: "var(--mono)",
            fontWeight: 600,
            fontSize: 13,
            letterSpacing: "0.14em",
            color: "var(--text)",
            textTransform: "uppercase",
          }}
        >
          Bankroller
        </span>
      )}
    </div>
  );
}

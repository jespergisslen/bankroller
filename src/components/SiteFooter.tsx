"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { allTerms } from "@/lib/glossary";

// Full-screen centered auth pages have no room for a footer.
const HIDE_ON = ["/login", "/register"];
// In-app pages keep the footer but drop the logged-out "Get started" column.
const APP_ROUTES = ["/dashboard", "/profile"];

const linkStyle: React.CSSProperties = {
  display: "block", color: "var(--text-3)", textDecoration: "none",
  fontSize: 13, padding: "3px 0", lineHeight: 1.5,
};

export function SiteFooter() {
  const pathname = usePathname();
  if (HIDE_ON.some((p) => pathname === p || pathname.startsWith(p + "/"))) return null;

  const inApp = APP_ROUTES.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const featured = allTerms().slice(0, 5);

  return (
    <footer style={{ position: "relative", marginTop: 80, overflow: "hidden", isolation: "isolate" }}>
      {/* Deep-sea gradient: surface fades into the dark */}
      <div style={{
        position: "absolute", inset: 0, zIndex: -2,
        background: "linear-gradient(180deg, transparent 0%, #080c0e 38%, #04070a 100%)",
      }} />

      {/* The kraken, rising from the deep — large, faint, cut off at the bottom */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo/bankroller-mark-white.png"
        alt=""
        aria-hidden
        style={{
          position: "absolute", zIndex: -1, bottom: -90, left: "50%",
          transform: "translateX(-50%)", width: 720, maxWidth: "140%",
          opacity: 0.06, pointerEvents: "none",
          filter: "drop-shadow(0 0 60px color-mix(in oklch, var(--accent) 40%, transparent))",
        }}
      />

      {/* Faint accent line at the waterline */}
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, color-mix(in oklch, var(--accent) 35%, transparent), transparent)" }} />

      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "44px 22px 0" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 40, justifyContent: "space-between" }}>
          {/* Brand */}
          <div style={{ maxWidth: 300 }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <span className="kraken" style={{ width: 26, height: 26 }} aria-hidden />
              <span className="pos glow" style={{ fontFamily: "var(--logo-font)", fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em" }}>
                Bankroller
              </span>
            </Link>
            <p style={{ color: "var(--text-3)", fontSize: 12.5, lineHeight: 1.6, marginTop: 12 }}>
              The terminal for serious bettors. Track your edge, publish your picks, build a record that lasts.
            </p>
          </div>

          {/* Product */}
          <div>
            <div className="label" style={{ marginBottom: 10 }}>Product</div>
            <Link href="/dashboard" style={linkStyle}>My Bets</Link>
            <Link href="/feed" style={linkStyle}>Feed</Link>
            <Link href="/leaderboard" style={linkStyle}>Leaderboard</Link>
          </div>

          {/* Learn / glossary */}
          <div>
            <div className="label" style={{ marginBottom: 10 }}>Learn</div>
            <Link href="/glossary" style={{ ...linkStyle, color: "var(--text-2)" }}>Betting glossary</Link>
            {featured.map((t) => (
              <Link key={t.slug} href={`/glossary/${t.slug}`} style={linkStyle}>{t.term}</Link>
            ))}
          </div>

          {/* Get started — only for logged-out / marketing pages */}
          {!inApp && (
            <div>
              <div className="label" style={{ marginBottom: 10 }}>Get started</div>
              <Link href="/register" style={linkStyle}>Create account</Link>
              <Link href="/login" style={linkStyle}>Log in</Link>
            </div>
          )}
        </div>

        {/* Bottom line — sits above the deep where the kraken rises */}
        <div style={{
          marginTop: 40, paddingTop: 18, paddingBottom: 130,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ color: "var(--text-4)", fontFamily: "var(--mono)", fontSize: 11 }}>
            © {2026} Bankroller. Bet responsibly. 18+.
          </span>
          <span style={{ color: "var(--text-4)", fontFamily: "var(--mono)", fontSize: 11 }}>
            Track your edge. Publish your picks.
          </span>
        </div>
      </div>
    </footer>
  );
}

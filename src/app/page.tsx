import type { Metadata } from "next";
import Link from "next/link";
import { fetchPublicBets } from "@/lib/bets";
import { LoggedInRedirect } from "@/components/LoggedInRedirect";

export const metadata: Metadata = {
  title: "Bankroller — the terminal for serious bettors",
  description:
    "Track every bet, sharpen your edge with closing-line value, and publish your picks to build a verified track record. Free to start.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Bankroller — the terminal for serious bettors",
    description: "Track your edge. Publish your picks. Build a verified track record.",
    type: "website",
    url: "/",
  },
};

const ctaPrimary: React.CSSProperties = {
  fontSize: 14, color: "var(--accent)",
  background: "color-mix(in oklch, var(--accent) 12%, transparent)",
  border: "1px solid color-mix(in oklch, var(--accent) 45%, transparent)",
  borderRadius: "var(--r-s)", padding: "12px 22px", fontWeight: 600,
  textDecoration: "none", boxShadow: "0 0 22px color-mix(in oklch, var(--accent) 25%, transparent)",
  fontFamily: "var(--mono)",
};
const ctaGhost: React.CSSProperties = {
  fontFamily: "var(--mono)", fontSize: 13, color: "var(--text)",
  border: "1px solid var(--line-2)", borderRadius: "var(--r-s)",
  padding: "12px 18px", textDecoration: "none",
};

const FEATURES = [
  { t: "Track everything", d: "Log singles & multis, settle win/loss/void, watch net units and ROI build over time." },
  { t: "Closing-line value", d: "Measure your true edge against the closing line on every pick — not just results." },
  { t: "Publish & get followed", d: "Share tips to the community feed and build a public track record people can follow." },
];

export default async function Home() {
  const tips = (await fetchPublicBets()).slice(0, 5);

  return (
    <div className="fade-in" style={{ maxWidth: 880, margin: "0 auto" }}>
      <LoggedInRedirect />

      {/* Hero */}
      <section style={{ position: "relative", textAlign: "center", padding: "48px 16px 40px", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo/bankroller-kraken-dots.png"
          alt=""
          style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", width: 420, opacity: 0.12, pointerEvents: "none" }}
        />
        <div style={{ position: "relative" }}>
          <div style={{
            display: "inline-block", fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "1.5px",
            textTransform: "uppercase", color: "var(--accent)",
            border: "1px solid color-mix(in oklch, var(--accent) 30%, transparent)",
            borderRadius: 20, padding: "5px 13px", marginBottom: 20,
          }}>For serious bettors</div>
          <h1 style={{ fontFamily: "var(--logo)", fontSize: 40, lineHeight: 1.08, fontWeight: 700, letterSpacing: "-0.02em", maxWidth: 560, margin: "0 auto" }}>
            The terminal for <span style={{ color: "var(--accent)" }}>serious bettors</span>
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 15.5, lineHeight: 1.6, maxWidth: 460, margin: "16px auto 0" }}>
            Track every bet, sharpen your edge with closing-line value, and publish your picks to build a verified track record.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}>
            <Link href="/register" style={ctaPrimary}>Get started free</Link>
            <Link href="/feed" style={ctaGhost}>Browse the feed ↗</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 8 }}>
        {FEATURES.map((f) => (
          <div key={f.t} className="panel" style={{ padding: 18 }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{f.t}</div>
            <div style={{ color: "var(--text-2)", fontSize: 12.5, lineHeight: 1.55 }}>{f.d}</div>
          </div>
        ))}
      </section>

      {/* Latest tips */}
      <section className="panel" style={{ marginTop: 16, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px var(--pad)", borderBottom: "1px solid var(--line)" }}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>Latest tips</span>
          <Link href="/feed" style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--accent)", textDecoration: "none" }}>View all tips →</Link>
        </div>
        {tips.length === 0 ? (
          <div style={{ padding: "40px var(--pad)", textAlign: "center", color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 12.5 }}>
            No public tips yet.
          </div>
        ) : (
          tips.map((t, i) => (
            <Link
              key={t.id}
              href={`/tip/${t.slug}`}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "13px var(--pad)",
                borderBottom: i === tips.length - 1 ? "none" : "1px solid var(--line)",
                textDecoration: "none", color: "inherit",
              }}
            >
              <span style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: t.tipster.color + "22", border: `1px solid ${t.tipster.color}44`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--mono)", fontSize: 10.5, fontWeight: 700, color: t.tipster.color,
              }}>{t.tipster.initials}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.sport} {t.match}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--text-3)", marginTop: 1 }}>@{t.tipster.username} · {t.pick}</div>
              </div>
              <span className="num pos glow" style={{ fontSize: 14, fontWeight: 600, flexShrink: 0 }}>{t.odds.toFixed(2)}</span>
            </Link>
          ))
        )}
      </section>

      {/* Closing CTA */}
      <section style={{ textAlign: "center", padding: "44px 16px 24px" }}>
        <h2 style={{ fontFamily: "var(--logo)", fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em" }}>
          Start tracking your <span style={{ color: "var(--accent)" }}>edge</span> today
        </h2>
        <p style={{ color: "var(--text-2)", fontSize: 13.5, margin: "10px auto 22px", maxWidth: 380 }}>
          Free to start. Your bets stay private until you choose to publish.
        </p>
        <Link href="/register" style={ctaPrimary}>Create your account</Link>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-4)", marginTop: 26 }}>
          Track your edge. Publish your picks.
        </div>
      </section>
    </div>
  );
}

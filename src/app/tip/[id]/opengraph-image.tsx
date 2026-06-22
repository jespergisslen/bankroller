import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getPublicTip } from "@/lib/bets";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Bankroller tip";

async function loadFont(family: string, weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`,
      { headers: { "User-Agent": "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)" } }
    ).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\) format/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tip = await getPublicTip(id);

  const markBuf = await readFile(join(process.cwd(), "public/logo/bankroller-mark-accent.png"));
  const mark = `data:image/png;base64,${markBuf.toString("base64")}`;

  const [grotesk700, grotesk500, mono600] = await Promise.all([
    loadFont("Space+Grotesk", 700),
    loadFont("Space+Grotesk", 500),
    loadFont("IBM+Plex+Mono", 600),
  ]);
  const fonts: { name: string; data: ArrayBuffer; weight: 500 | 600 | 700; style: "normal" }[] = [];
  if (grotesk700) fonts.push({ name: "Grotesk", data: grotesk700, weight: 700, style: "normal" });
  if (grotesk500) fonts.push({ name: "Grotesk", data: grotesk500, weight: 500, style: "normal" });
  if (mono600) fonts.push({ name: "Mono", data: mono600, weight: 600, style: "normal" });

  const accent = "#00e5a0";
  const text = "#f0f0f1";
  const muted = "#a8a8ac";
  const faint = "#75757a";

  const match = tip?.match || "Bankroller tip";
  const pick = tip?.pick || "—";
  const odds = tip ? tip.odds.toFixed(2) : "—";
  const stake = tip ? `${tip.stake}u` : "—";
  const name = tip?.name || "A bettor";
  const initials = tip?.initials || "BR";
  const sub = tip ? [tip.sportLabel, tip.league, tip.date].filter(Boolean).join(" · ") : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          background: "#252526", fontFamily: "Grotesk", position: "relative",
        }}
      >
        {/* Accent glow top */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: 1200, height: 360, display: "flex",
          backgroundImage: "radial-gradient(ellipse 60% 100% at 50% 0%, rgba(0,229,160,0.18), rgba(0,229,160,0))",
        }} />
        {/* Kraken watermark */}
        <img src={mark} alt="" width={780} height={602} style={{ position: "absolute", right: -140, bottom: -150, opacity: 0.16 }} />

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "54px 64px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img src={mark} alt="Bankroller" width={58} height={45} />
            <span style={{ fontSize: 40, fontWeight: 700, color: text, letterSpacing: -1 }}>Bankroller</span>
          </div>
          <span style={{ fontFamily: "Mono", fontSize: 18, fontWeight: 600, color: faint, letterSpacing: 3 }}>PUBLIC TIP</span>
        </div>

        {/* Glass card */}
        <div style={{
          display: "flex", flexDirection: "column", margin: "auto 64px",
          padding: 40, borderRadius: 24,
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(0,229,160,0.28)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(0,229,160,0.14)", border: "1px solid rgba(0,229,160,0.3)",
              fontFamily: "Mono", fontSize: 20, fontWeight: 600, color: accent,
            }}>{initials}</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 26, fontWeight: 500, color: text }}>{name}</span>
              <span style={{ fontFamily: "Mono", fontSize: 18, fontWeight: 600, color: muted, marginTop: 2 }}>{sub}</span>
            </div>
          </div>

          <span style={{ fontSize: 56, fontWeight: 700, color: text, letterSpacing: -1.5, marginBottom: 28 }}>{match}</span>

          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", paddingRight: 40, marginRight: 40, borderRight: "1px solid rgba(255,255,255,0.12)" }}>
              <span style={{ fontFamily: "Mono", fontSize: 16, fontWeight: 600, color: faint, letterSpacing: 2, marginBottom: 8 }}>PICK</span>
              <span style={{ fontSize: 30, fontWeight: 500, color: text }}>{pick}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", paddingRight: 40, marginRight: 40, borderRight: "1px solid rgba(255,255,255,0.12)" }}>
              <span style={{ fontFamily: "Mono", fontSize: 16, fontWeight: 600, color: faint, letterSpacing: 2, marginBottom: 8 }}>ODDS</span>
              <span style={{ fontFamily: "Mono", fontSize: 38, fontWeight: 600, color: accent }}>{odds}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: "Mono", fontSize: 16, fontWeight: 600, color: faint, letterSpacing: 2, marginBottom: 8 }}>STAKE</span>
              <span style={{ fontFamily: "Mono", fontSize: 30, fontWeight: 600, color: text }}>{stake}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 64px 48px" }}>
          <span style={{ fontSize: 22, fontWeight: 500, color: faint }}>Track your edge. Publish your picks.</span>
          <span style={{ fontFamily: "Mono", fontSize: 18, fontWeight: 600, color: "#54545a" }}>app.bankroller.bet</span>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined }
  );
}

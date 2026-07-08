import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { loadOgFonts } from "@/lib/ogFonts";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Bankroller: the terminal for serious bettors";

export default async function Image() {
  const markBuf = await readFile(join(process.cwd(), "public/logo/bankroller-mark-accent.png"));
  const mark = `data:image/png;base64,${markBuf.toString("base64")}`;

  const fonts = await loadOgFonts();

  const accent = "#00e5a0";
  const text = "#f0f0f1";
  const faint = "#75757a";

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
          position: "absolute", top: 0, left: 0, width: 1200, height: 420, display: "flex",
          backgroundImage: "radial-gradient(ellipse 60% 100% at 50% 0%, rgba(0,229,160,0.20), rgba(0,229,160,0))",
        }} />
        {/* Kraken watermark */}
        <img src={mark} alt="" width={820} height={633} style={{ position: "absolute", right: -170, bottom: -170, opacity: 0.16 }} />

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "56px 64px 0" }}>
          <img src={mark} alt="Bankroller" width={64} height={49} />
          <span style={{ fontSize: 44, fontWeight: 700, color: text, letterSpacing: -1 }}>
            Bankroller<span style={{ color: accent }}>.bet</span>
          </span>
        </div>

        {/* Hero copy */}
        <div style={{ display: "flex", flexDirection: "column", margin: "auto 64px" }}>
          <span style={{ fontSize: 76, fontWeight: 700, color: text, letterSpacing: -2, lineHeight: 1.05, maxWidth: 880 }}>
            {"The terminal for "}
            <span style={{ color: accent }}>serious bettors</span>
          </span>
          <span style={{ fontSize: 32, fontWeight: 500, color: "#c4c4c8", marginTop: 26, maxWidth: 820, lineHeight: 1.35 }}>
            Track every bet, sharpen your edge with closing-line value, and publish your picks to build a verified track record.
          </span>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 64px 52px" }}>
          <span style={{ fontFamily: "Mono", fontSize: 22, fontWeight: 600, color: accent, letterSpacing: 1 }}>
            Track your edge. Publish your picks.
          </span>
          <span style={{ fontFamily: "Mono", fontSize: 20, fontWeight: 600, color: "#54545a" }}>bankroller.bet</span>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined }
  );
}

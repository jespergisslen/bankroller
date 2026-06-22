"use client";

import { useState } from "react";

interface ShareModalProps {
  tipId: string;
  shareText: string;
  onClose: () => void;
}

export function ShareModal({ tipId, shareText, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined"
    ? `${window.location.origin}/tip/${tipId}`
    : `/tip/${tipId}`;
  const imageUrl = `/tip/${tipId}/opengraph-image`;
  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  const nativeShare = async () => {
    try {
      await navigator.share({ title: "Bankroller", text: shareText, url });
    } catch {
      /* user cancelled */
    }
  };

  const shareOnX = () => {
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
    window.open(intent, "_blank", "noopener,noreferrer");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="panel fade-in share-modal" style={{ width: "100%", maxWidth: 460, overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          padding: "15px 18px", borderBottom: "1px solid var(--line)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Share tip</div>
          <button onClick={onClose} className="btn sm" style={{ width: 28, height: 28, padding: 0, justifyContent: "center", fontSize: 16 }}>✕</button>
        </div>

        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* OG preview */}
          <div style={{ borderRadius: "var(--r-m)", overflow: "hidden", border: "1px solid var(--line)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Share card preview" style={{ width: "100%", display: "block" }} />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {canNativeShare && (
              <button className="btn accent" style={{ justifyContent: "center" }} onClick={nativeShare}>
                ↗ Share…
              </button>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn" style={{ flex: 1, justifyContent: "center" }} onClick={shareOnX}>𝕏 Share on X</button>
              <button className="btn" style={{ flex: 1, justifyContent: "center" }} onClick={copyLink}>
                {copied ? "✓ Copied" : "🔗 Copy link"}
              </button>
            </div>
            <a className="btn" href={imageUrl} download={`bankroller-tip-${tipId}.png`} style={{ justifyContent: "center", textDecoration: "none" }}>
              ⬇ Download image
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

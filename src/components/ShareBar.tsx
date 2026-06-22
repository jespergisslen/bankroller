"use client";

import { useState } from "react";

interface ShareBarProps {
  tipId: string;
  shareText: string;
}

export function ShareBar({ tipId, shareText }: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined"
    ? `${window.location.origin}/tip/${tipId}`
    : `/tip/${tipId}`;
  const imageUrl = `/tip/${tipId}/opengraph-image`;

  const nativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Bankroller", text: shareText, url });
      } catch {
        /* user cancelled */
      }
    } else {
      copyLink();
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
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <button className="btn accent" onClick={nativeShare}>
        ↗ Share
      </button>
      <button className="btn" onClick={shareOnX}>
        𝕏 Share on X
      </button>
      <button className="btn" onClick={copyLink}>
        {copied ? "✓ Copied" : "🔗 Copy link"}
      </button>
      <a className="btn" href={imageUrl} download={`bankroller-tip-${tipId}.png`} style={{ textDecoration: "none" }}>
        ⬇ Download image
      </a>
    </div>
  );
}

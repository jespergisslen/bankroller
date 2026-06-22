"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { fetchMyProfile, updateMyProfile } from "@/lib/profile";

const BIO_MAX = 240;

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: "var(--r-s)",
  border: "1px solid var(--line-2)", background: "var(--bg-3)",
  color: "var(--text)", fontFamily: "var(--mono)", fontSize: 13.5, outline: "none",
};

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace("/login"); return; }
      fetchMyProfile().then((p) => {
        if (p) { setUsername(p.username); setDisplayName(p.displayName); setBio(p.bio); }
        setLoading(false);
      });
    });
  }, [router]);

  const handleSave = async () => {
    setSaving(true); setSaved(false); setError(null);
    const { error } = await updateMyProfile({ displayName, bio });
    setSaving(false);
    if (error) { setError(error); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const initials = (displayName || username || "??").slice(0, 2).toUpperCase();

  if (loading) {
    return (
      <div className="fade-in" style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 12.5, padding: 40 }}>
        Loading…
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: 620, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>Edit profile</h1>
          <p style={{ color: "var(--text-2)", marginTop: 4, fontSize: 13.5 }}>Your name and bio appear on your public tipster page.</p>
        </div>
        {username && (
          <Link href={`/u/${username}`} className="btn sm" style={{ textDecoration: "none", whiteSpace: "nowrap" }}>
            View public profile ↗
          </Link>
        )}
      </div>

      <div className="panel" style={{ padding: "var(--pad)" }}>
        {/* Identity preview */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: "color-mix(in oklch, var(--accent) 13%, transparent)",
            border: "1px solid color-mix(in oklch, var(--accent) 30%, transparent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--mono)", fontSize: 18, fontWeight: 700, color: "var(--accent)", flexShrink: 0,
          }}>{initials}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{displayName || username}</div>
            <div style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 12, marginTop: 2 }}>@{username}</div>
          </div>
        </div>

        {/* Display name */}
        <div style={{ marginBottom: 18 }}>
          <div className="label" style={{ marginBottom: 8 }}>Display name</div>
          <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder={username} maxLength={40} style={inputStyle} />
        </div>

        {/* Username (read-only) */}
        <div style={{ marginBottom: 18 }}>
          <div className="label" style={{ marginBottom: 8 }}>
            Username <span style={{ color: "var(--text-4)", letterSpacing: 0, textTransform: "none", fontSize: 11 }}>(your handle — can&apos;t be changed)</span>
          </div>
          <input value={`@${username}`} disabled style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }} />
        </div>

        {/* Bio */}
        <div style={{ marginBottom: 20 }}>
          <div className="label" style={{ marginBottom: 8 }}>Bio</div>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value.slice(0, BIO_MAX))}
            placeholder="Tell the community about your betting style — sports, edge, approach…"
            rows={4}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
          />
          <div style={{ color: "var(--text-4)", fontFamily: "var(--mono)", fontSize: 10.5, marginTop: 6, textAlign: "right" }}>
            {bio.length} / {BIO_MAX}
          </div>
        </div>

        {error && (
          <div style={{
            padding: "10px 12px", borderRadius: "var(--r-s)", marginBottom: 14,
            background: "rgba(224,85,85,0.08)", border: "1px solid rgba(224,85,85,0.3)",
            color: "#e05555", fontFamily: "var(--mono)", fontSize: 12,
          }}>{error}</div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn accent" onClick={handleSave} disabled={saving} style={{ justifyContent: "center" }}>
            {saving ? "Saving…" : "Save changes"}
          </button>
          {saved && <span style={{ color: "var(--accent)", fontFamily: "var(--mono)", fontSize: 12 }}>✓ Saved</span>}
        </div>

        <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--line)", color: "var(--text-4)", fontFamily: "var(--mono)", fontSize: 11, lineHeight: 1.6 }}>
          Avatar uploads are coming soon — for now your initials are shown.
        </div>
      </div>
    </div>
  );
}

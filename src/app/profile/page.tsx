"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { usePersona } from "@/lib/personaContext";
import { updatePersona, createPersona, MAX_PERSONAS } from "@/lib/personas";

const BIO_MAX = 240;

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: "var(--r-s)",
  border: "1px solid var(--line-2)", background: "var(--bg-3)",
  color: "var(--text)", fontFamily: "var(--mono)", fontSize: 13.5, outline: "none",
};

export default function ProfilePage() {
  const router = useRouter();
  const { personas, active, activeId, setActiveId, refresh, loading } = usePersona();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create-persona form
  const [newUsername, setNewUsername] = useState("");
  const [newDisplay, setNewDisplay] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    createClient().auth.getSession()
      .then(({ data }) => { if (!data.session?.user) router.replace("/login"); })
      .catch(() => {});
  }, [router]);

  // Sync form to the active persona whenever it changes.
  useEffect(() => {
    if (active) { setDisplayName(active.displayName); setBio(active.bio); }
  }, [active]);

  const handleSave = async () => {
    if (!activeId) return;
    setSaving(true); setSaved(false); setError(null);
    const { error } = await updatePersona(activeId, { displayName, bio });
    setSaving(false);
    if (error) { setError(error); return; }
    await refresh();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCreate = async () => {
    setCreating(true); setCreateError(null);
    const { error, id } = await createPersona({ username: newUsername, displayName: newDisplay });
    setCreating(false);
    if (error) { setCreateError(error); return; }
    await refresh();
    if (id) setActiveId(id);
    setNewUsername(""); setNewDisplay(""); setShowCreate(false);
  };

  if (loading || !active) {
    return (
      <div className="fade-in" style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 12.5, padding: 40 }}>
        Loading…
      </div>
    );
  }

  const initials = (displayName || active.username || "??").slice(0, 2).toUpperCase();

  return (
    <div className="fade-in" style={{ maxWidth: 620, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>Edit profile</h1>
          <p style={{ color: "var(--text-2)", marginTop: 4, fontSize: 13.5 }}>
            Editing <span style={{ color: "var(--accent)" }}>@{active.username}</span> — switch profiles in the top-right menu.
          </p>
        </div>
        <Link href={`/u/${active.username}`} className="btn sm" style={{ textDecoration: "none", whiteSpace: "nowrap" }}>
          View public profile ↗
        </Link>
      </div>

      <div className="panel" style={{ padding: "var(--pad)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: "color-mix(in oklch, var(--accent) 13%, transparent)",
            border: "1px solid color-mix(in oklch, var(--accent) 30%, transparent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--mono)", fontSize: 18, fontWeight: 700, color: "var(--accent)", flexShrink: 0,
          }}>{initials}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{displayName || active.username}</div>
            <div style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 12, marginTop: 2 }}>@{active.username}</div>
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div className="label" style={{ marginBottom: 8 }}>Display name</div>
          <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder={active.username} maxLength={40} style={inputStyle} />
        </div>

        <div style={{ marginBottom: 18 }}>
          <div className="label" style={{ marginBottom: 8 }}>
            Username <span style={{ color: "var(--text-4)", letterSpacing: 0, textTransform: "none", fontSize: 11 }}>(handle — can&apos;t be changed)</span>
          </div>
          <input value={`@${active.username}`} disabled style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <div className="label" style={{ marginBottom: 8 }}>Bio</div>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value.slice(0, BIO_MAX))}
            placeholder="Tell the community about your betting style — sports, edge, approach…"
            rows={4}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
          />
          <div style={{ color: "var(--text-4)", fontFamily: "var(--mono)", fontSize: 10.5, marginTop: 6, textAlign: "right" }}>{bio.length} / {BIO_MAX}</div>
        </div>

        {error && (
          <div style={{ padding: "10px 12px", borderRadius: "var(--r-s)", marginBottom: 14, background: "rgba(224,85,85,0.08)", border: "1px solid rgba(224,85,85,0.3)", color: "#e05555", fontFamily: "var(--mono)", fontSize: 12 }}>{error}</div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn accent" onClick={handleSave} disabled={saving} style={{ justifyContent: "center" }}>
            {saving ? "Saving…" : "Save changes"}
          </button>
          {saved && <span style={{ color: "var(--accent)", fontFamily: "var(--mono)", fontSize: 12 }}>✓ Saved</span>}
        </div>
      </div>

      {/* Profiles list + create */}
      <div className="panel" style={{ marginTop: 16, padding: "var(--pad)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Your profiles <span style={{ color: "var(--text-4)", fontFamily: "var(--mono)", fontSize: 11, fontWeight: 400 }}>{personas.length}/{MAX_PERSONAS}</span></div>
          {personas.length < MAX_PERSONAS && (
            <button className="btn sm" onClick={() => setShowCreate(s => !s)}>{showCreate ? "Cancel" : "+ New profile"}</button>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {personas.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveId(p.id)}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                borderRadius: "var(--r-m)", textAlign: "left", cursor: "pointer",
                border: `1px solid ${p.id === activeId ? "color-mix(in oklch, var(--accent) 35%, transparent)" : "var(--line)"}`,
                background: p.id === activeId ? "color-mix(in oklch, var(--accent) 7%, transparent)" : "rgba(255,255,255,0.02)",
              }}
            >
              <span style={{
                width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                background: "color-mix(in oklch, var(--accent) 14%, transparent)",
                border: "1px solid color-mix(in oklch, var(--accent) 28%, transparent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: "var(--accent)",
              }}>{(p.displayName || p.username).slice(0, 2).toUpperCase()}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 13.5, fontWeight: 500 }}>{p.displayName || p.username}</span>
                <span style={{ display: "block", fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)" }}>@{p.username}</span>
              </span>
              {p.id === activeId && <span style={{ color: "var(--accent)", fontFamily: "var(--mono)", fontSize: 10.5 }}>active</span>}
            </button>
          ))}
        </div>

        {showCreate && (
          <div className="fade-in" style={{ marginTop: 14, paddingTop: 16, borderTop: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div className="label" style={{ marginBottom: 8 }}>Username</div>
              <input value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="e.g. bankroller" style={inputStyle} />
            </div>
            <div>
              <div className="label" style={{ marginBottom: 8 }}>Display name</div>
              <input value={newDisplay} onChange={e => setNewDisplay(e.target.value)} placeholder="e.g. Bankroller" style={inputStyle} />
            </div>
            {createError && (
              <div style={{ padding: "9px 12px", borderRadius: "var(--r-s)", background: "rgba(224,85,85,0.08)", border: "1px solid rgba(224,85,85,0.3)", color: "#e05555", fontFamily: "var(--mono)", fontSize: 12 }}>{createError}</div>
            )}
            <button className="btn accent" onClick={handleCreate} disabled={creating || !newUsername} style={{ justifyContent: "center" }}>
              {creating ? "Creating…" : "Create profile"}
            </button>
          </div>
        )}

        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line)", color: "var(--text-4)", fontFamily: "var(--mono)", fontSize: 11, lineHeight: 1.6 }}>
          One login can hold up to {MAX_PERSONAS} profiles — e.g. your personal handle and a brand. Avatar uploads coming soon; initials shown for now.
        </div>
      </div>
    </div>
  );
}

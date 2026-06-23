"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      <div className="panel fade-in" style={{ width: "100%", maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ padding: "24px 24px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Logo variant="wordmark" size={34} />
          <div style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 12, marginTop: 10 }}>
            Sign in to your account
          </div>
        </div>

        <form onSubmit={handleLogin} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="label" style={{ display: "block", marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: "100%", padding: "10px 12px",
                borderRadius: "var(--r-s)", border: "1px solid var(--line-2)",
                background: "var(--bg-3)", color: "var(--text)",
                fontSize: 14, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label className="label" style={{ display: "block", marginBottom: 6 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: "100%", padding: "10px 12px",
                borderRadius: "var(--r-s)", border: "1px solid var(--line-2)",
                background: "var(--bg-3)", color: "var(--text)",
                fontSize: 14, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: "10px 12px", borderRadius: "var(--r-s)",
              background: "rgba(224,85,85,0.08)", border: "1px solid rgba(224,85,85,0.3)",
              color: "#e05555", fontFamily: "var(--mono)", fontSize: 12,
            }}>{error}</div>
          )}

          <button
            type="submit"
            className="btn accent"
            style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in →"}
          </button>

          <div style={{ textAlign: "center", color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 12 }}>
            No account?{" "}
            <Link href="/register" style={{ color: "var(--accent)", textDecoration: "none" }}>
              Create one
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

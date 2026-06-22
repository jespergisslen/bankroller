"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { CurrencyPicker } from "./CurrencyPicker";
import { PersonaSwitcher } from "./PersonaSwitcher";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

// hrefOut = where it points when logged OUT (My Bets → sign in, Profile → leaderboard)
const NAV = [
  { index: "01", label: "My Bets", href: "/dashboard",   hrefOut: "/login" },
  { index: "02", label: "Feed",    href: "/feed",        hrefOut: "/feed" },
  { index: "03", label: "Profile", href: "/profile",     hrefOut: "/leaderboard" },
];

function LiveClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      setTime(`${hh}:${mm}:${ss}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;
  return (
    <div className="num topbar-clock" style={{ fontSize: 12.5, color: "var(--text-2)", display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: "var(--accent)",
        boxShadow: "0 0 0 0 var(--accent)",
        animation: "pulse 2.4s ease-out infinite",
        flexShrink: 0,
      }} />
      <span>
        {time.slice(0, 5)}
        <span style={{ color: "var(--text-3)" }}>{time.slice(5)}</span>
        {" "}CET
      </span>
    </div>
  );
}

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoadingUser(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/feed");
    router.refresh();
  };

  const initials = user?.user_metadata?.username
    ? user.user_metadata.username.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <header className="topbar" style={{
      position: "sticky", top: 0, height: 56, zIndex: 50,
      display: "flex", alignItems: "center",
      padding: "0 22px", gap: 28,
      backdropFilter: "blur(14px) saturate(1.2)",
      background: "color-mix(in oklch, var(--bg) 82%, transparent)",
      borderBottom: "1px solid var(--line)",
    }}>
      <Link href="/" style={{ textDecoration: "none" }}>
        <Logo />
      </Link>

      <nav className="topbar-nav" style={{ display: "flex", gap: 4 }}>
        {NAV.map((item) => {
          const href = user ? item.href : item.hrefOut;
          const active = pathname.startsWith(href);
          return (
            <Link key={item.label} href={href} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 10px", borderRadius: "var(--r-s)",
              textDecoration: "none", fontFamily: "var(--mono)", fontSize: 12.5,
              color: active ? "var(--text)" : "var(--text-2)",
              background: active ? "rgba(255,255,255,0.035)" : "transparent",
              position: "relative", transition: "color 0.15s, background 0.15s",
            }}>
              <span style={{ color: "var(--text-3)", fontSize: 10 }}>{item.index}</span>
              <span className="nav-label">{item.label}</span>
              {active && (
                <span style={{
                  position: "absolute", bottom: -1, left: 10, right: 10,
                  height: 2, borderRadius: 2,
                  background: "var(--accent)",
                  boxShadow: "0 0 calc(6px * var(--glow)) var(--accent)",
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      {!loadingUser && (
        <div className="topbar-right" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {user ? (
            <>
              <LiveClock />
              <CurrencyPicker />
              <PersonaSwitcher fallbackInitials={initials} onSignOut={handleSignOut} />
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Link href="/login" className="btn sm" style={{ textDecoration: "none" }}>
                Log in
              </Link>
              <Link href="/register" className="btn sm accent" style={{ textDecoration: "none" }}>
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

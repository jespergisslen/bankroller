"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

// Sends already-logged-in visitors from the public landing page to their dashboard.
// Non-blocking: the landing renders immediately; this just redirects if a session exists.
export function LoggedInRedirect() {
  const router = useRouter();
  useEffect(() => {
    createClient().auth.getUser()
      .then(({ data }) => { if (data.user) router.replace("/dashboard"); })
      .catch(() => {});
  }, [router]);
  return null;
}

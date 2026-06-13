"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      router.replace(data.user ? "/dashboard" : "/feed");
    });
  }, [router]);

  return null;
}

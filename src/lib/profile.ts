import { createClient } from "./supabase";

export interface MyProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
}

export async function fetchMyProfile(): Promise<MyProfile | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio")
    .eq("id", user.id)
    .single();
  if (!data) return null;
  return {
    id: data.id,
    username: data.username ?? "",
    displayName: data.display_name ?? "",
    bio: data.bio ?? "",
  };
}

export async function updateMyProfile(params: {
  displayName: string;
  bio: string;
}): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: params.displayName || null, bio: params.bio || null })
    .eq("id", user.id);
  return { error: error?.message ?? null };
}

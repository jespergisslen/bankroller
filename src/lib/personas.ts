import { createClient } from "./supabase";
import { validateUsername } from "./usernameRules";

// Maximum profiles (personas) a single user can own.
export const MAX_PERSONAS = 2;

export interface Persona {
  id: string;
  username: string;
  displayName: string;
  bio: string;
}

// All personas owned by the logged-in user (primary + brand profiles).
export async function fetchMyPersonas(): Promise<Persona[]> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) return [];
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true });
  return (data ?? []).map((p) => ({
    id: p.id,
    username: p.username ?? "",
    displayName: p.display_name ?? "",
    bio: p.bio ?? "",
  }));
}

// Update a persona's editable fields. RLS ensures the user owns it.
export async function updatePersona(profileId: string, params: {
  displayName: string;
  bio: string;
}): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: params.displayName || null, bio: params.bio || null })
    .eq("id", profileId);
  return { error: error?.message ?? null };
}

// Create a new persona (brand profile) owned by the logged-in user.
export async function createPersona(params: {
  username: string;
  displayName: string;
}): Promise<{ error: string | null; id: string | null }> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) return { error: "Not logged in", id: null };

  // Cap at MAX_PERSONAS profiles per user.
  const { count } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id);
  if ((count ?? 0) >= MAX_PERSONAS) {
    return { error: `You can have at most ${MAX_PERSONAS} profiles.`, id: null };
  }

  const username = params.username.trim().toLowerCase();
  const invalid = validateUsername(username);
  if (invalid) return { error: invalid, id: null };

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      owner_id: user.id,
      username,
      display_name: params.displayName.trim() || username,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505" || /duplicate|unique/i.test(error.message)) {
      return { error: "That username is already taken.", id: null };
    }
    return { error: error.message, id: null };
  }
  return { error: null, id: data.id };
}

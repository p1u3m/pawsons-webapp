"use server";

import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  assigned_character: string | null;
  house: string | null;
  vibe: string | null;
};

/** Fetch the current user's profile, or null if not logged in. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const meta = user.user_metadata ?? {};

  // 1. Try to read from profiles table
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (data && !error) {
      return data;
    }
  } catch {
    // Table might not exist yet; fall back to user metadata
  }

  // 2. Seamless fallback: use user_metadata directly from Auth
  return {
    id: user.id,
    display_name:
      meta.full_name ??
      meta.name ??
      user.email?.split("@")[0] ??
      "Friend",
    avatar_url: meta.avatar_url ?? null,
    assigned_character: meta.assigned_character ?? null,
    house: meta.house ?? null,
    vibe: meta.vibe ?? null,
  };
}

/** Save the quiz result (character type, house, and vibe) to the profile. */
export async function saveQuizResult(
  characterType: string,
  houseId: string,
  vibe: string | null,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not logged in" };

  const normalizedChar = characterType.toUpperCase();

  // 1. Update user_metadata in Auth (works IMMEDIATELY, zero DB setup required!)
  try {
    await supabase.auth.updateUser({
      data: {
        assigned_character: normalizedChar,
        house: houseId,
        vibe: vibe ?? null,
      },
    });
  } catch (err) {
    console.error("Auth updateUser error:", err);
  }

  // 2. Also upsert to profiles table if table exists
  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "Friend";
  const avatarUrl = user.user_metadata?.avatar_url ?? null;

  try {
    await supabase.from("profiles").upsert({
      id: user.id,
      display_name: displayName,
      avatar_url: avatarUrl,
      assigned_character: normalizedChar,
      house: houseId,
      vibe: vibe ?? null,
      updated_at: new Date().toISOString(),
    });
  } catch {
    // If profiles table isn't created yet, auth metadata still holds the data
  }

  return { success: true };
}

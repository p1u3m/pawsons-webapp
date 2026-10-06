import { createClient } from "@/lib/supabase/server";

/** Ids of the rooms the signed-in member owns (row-level security limits it to their own). */
export async function getMyRooms(): Promise<string[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("room_unlocks")
    .select("room_id")
    .eq("user_id", user.id);
  return (data ?? []).map((row) => row.room_id);
}

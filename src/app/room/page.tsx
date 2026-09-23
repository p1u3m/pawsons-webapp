import { getProfile } from "@/lib/supabase/profile";
import { getCharacter } from "@/lib/data";
import { redirect } from "next/navigation";
import RoomScene from "@/components/room-scene";

export const metadata = { title: "My Room" };

export default async function Page() {
  const profile = await getProfile();

  // Not logged in → redirect to home
  if (!profile) redirect("/");

  // No character assigned yet → prompt to take quiz
  const character = profile.assigned_character
    ? getCharacter(profile.assigned_character)
    : null;

  return (
    <div className="wrap room-page">
      <RoomScene profile={profile} character={character ?? null} />
    </div>
  );
}

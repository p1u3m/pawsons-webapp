import { getMyCoins } from "@/lib/supabase/coins";
import { getMyRooms } from "@/lib/supabase/rooms";
import { getProfile } from "@/lib/supabase/profile";
import { getCharacter } from "@/lib/data";
import { redirect } from "next/navigation";
import RoomScene from "@/components/room/room-scene";

export const metadata = { title: "My Room" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  const [profile, coins, unlocked] = await Promise.all([
    getProfile(),
    getMyCoins(0),
    getMyRooms(),
  ]);

  // Not logged in → redirect to home
  if (!profile) redirect("/");

  // No character assigned yet → the room shows a prompt to take the quiz
  const character = profile.assigned_character
    ? getCharacter(profile.assigned_character)
    : null;

  return (
    <div className="wrap max-w-[860px] page-top pb-[110px]">
      <RoomScene
        character={character ?? null}
        unlocked={unlocked}
        balance={coins?.balance ?? 0}
      />
    </div>
  );
}

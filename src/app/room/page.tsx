import { CoinCard } from "@/components/coin-card";
import { getMyCoins } from "@/lib/supabase/coins";
import { getProfile } from "@/lib/supabase/profile";
import { getCharacter } from "@/lib/data";
import { redirect } from "next/navigation";
import RoomScene from "@/components/room-scene";

export const metadata = { title: "My Room" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  const [profile, coins] = await Promise.all([getProfile(), getMyCoins()]);

  // Not logged in → redirect to home
  if (!profile) redirect("/");

  // No character assigned yet → prompt to take quiz
  const character = profile.assigned_character
    ? getCharacter(profile.assigned_character)
    : null;

  return (
    <div className="wrap max-w-[600px] pt-6 pb-[110px]">
      <RoomScene profile={profile} character={character ?? null} />
      {coins && (
        <CoinCard
          className="mt-5"
          balance={coins.balance}
          history={coins.history}
        />
      )}
    </div>
  );
}

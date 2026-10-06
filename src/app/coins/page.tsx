import { redirect } from "next/navigation";
import { CoinBalance, CoinHistory } from "@/components/coin-ui";
import { PageIntro } from "@/components/character-ui";
import { BackButton } from "@/components/paper-ui";
import { getMyCoins } from "@/lib/supabase/coins";

export const metadata = { title: "Coin ของคุณ" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const coins = await getMyCoins(50);

  // Not signed in → home
  if (!coins) redirect("/");

  return (
    <div className="wrap max-w-[720px] page-top pb-[110px]">
      <div className="mb-7">
        <BackButton href="/room" label="กลับไปห้องของฉัน" />
      </div>
      <PageIntro label="MY COIN" title="Coin ของคุณ" className="mb-8">
        ยอดคงเหลือและประวัติการได้รับ Coin ทั้งหมดของคุณ
      </PageIntro>
      <CoinBalance balance={coins.balance} />
      <CoinHistory history={coins.history} />
    </div>
  );
}

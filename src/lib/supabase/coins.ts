import "server-only";
import { coinTransactionColumns, type CoinTransaction } from "@/lib/coins";
import { createClient } from "@/lib/supabase/server";

/** Coin numbers for the admin dashboard (admins can read every wallet and ledger row). */
export async function getCoinStats(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const [wallets, recent, latest] = await Promise.all([
    // Small member base for now; the cap keeps this bounded as it grows.
    supabase.from("coin_wallets").select("balance").limit(5000),
    supabase
      .from("coin_transactions")
      .select("amount")
      .gte("created_at", since)
      .limit(5000),
    supabase
      .from("coin_transactions")
      .select(`${coinTransactionColumns},user_id`)
      .order("id", { ascending: false })
      .limit(5),
  ]);
  const rows = (latest.data ?? []) as (CoinTransaction & { user_id: string })[];
  const ids = [...new Set(rows.map((row) => row.user_id))];
  const { data: people } = ids.length
    ? await supabase.from("profiles").select("id,display_name").in("id", ids)
    : { data: [] };
  const names = new Map(
    (people ?? []).map((p) => [p.id, p.display_name as string | null]),
  );
  const amounts = (recent.data ?? []).map((row) => row.amount);
  return {
    failed: Boolean(wallets.error || recent.error || latest.error),
    circulation: (wallets.data ?? []).reduce((sum, w) => sum + w.balance, 0),
    holders: (wallets.data ?? []).filter((w) => w.balance > 0).length,
    granted30d: amounts.filter((a) => a > 0).reduce((s, a) => s + a, 0),
    removed30d: amounts
      .filter((a) => a < 0)
      .reduce((s, a) => s + Math.abs(a), 0),
    latest: rows.map((row) => ({
      ...row,
      name: names.get(row.user_id) || "ไม่ระบุชื่อ",
    })),
  };
}

/** The signed-in member's Coin balance and latest ledger rows (row-level security limits it to their own). */
export async function getMyCoins(limit = 8) {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const [wallet, history] = await Promise.all([
    supabase
      .from("coin_wallets")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("coin_transactions")
      .select(coinTransactionColumns)
      .eq("user_id", user.id)
      .order("id", { ascending: false })
      .limit(limit),
  ]);
  return {
    balance: wallet.data?.balance ?? 0,
    history: (history.data ?? []) as CoinTransaction[],
  };
}

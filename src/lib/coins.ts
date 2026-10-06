// Coin: a member's stored-value balance (1 Coin = 1 baht). The balance and the
// ledger live in the database (coin_wallets, coin_transactions); see
// supabase/migrations/*_coin_ledger.sql.

export type CoinKind =
  | "signup"
  | "quiz"
  | "admin_grant"
  | "admin_deduct"
  | "purchase"
  | "spend"
  | "refund";

export type CoinTransaction = {
  id: number;
  amount: number;
  kind: CoinKind;
  reason: string | null;
  created_at: string;
};

export const coinTransactionColumns = "id,amount,kind,reason,created_at";

export const coinKindLabel: Record<CoinKind, string> = {
  signup: "ของขวัญต้อนรับ",
  quiz: "ทำแบบทดสอบ",
  admin_grant: "ทีมงานเพิ่มให้",
  admin_deduct: "ทีมงานปรับลด",
  purchase: "ซื้อ Coin",
  spend: "ใช้จ่าย",
  refund: "คืน Coin",
};

const number = new Intl.NumberFormat("th-TH");

/** "1,250" */
export function formatCoins(amount: number) {
  return number.format(amount);
}

/** "+50" or "−20" */
export function formatCoinChange(amount: number) {
  return `${amount > 0 ? "+" : "−"}${number.format(Math.abs(amount))}`;
}

/** Biggest single admin adjustment, in either direction. */
export const maxCoinAdjustment = 100000;

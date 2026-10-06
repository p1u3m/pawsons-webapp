"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/use-auth";

/** The signed-in member's Coin balance (null while loading or when signed out). */
export function useCoinBalance() {
  const { supabase, user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const userId = user?.id;

  useEffect(() => {
    if (!supabase || !userId) {
      setBalance(null);
      return;
    }
    let stale = false;
    supabase
      .from("coin_wallets")
      .select("balance")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!stale) setBalance(data?.balance ?? 0);
      });
    return () => {
      stale = true;
    };
  }, [supabase, userId]);

  return balance;
}

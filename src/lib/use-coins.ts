"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/use-auth";

const coinEvent = "pawsons:coin-balance";

/** Tells the account menus a new balance (after spending Coin on the page). */
export function announceCoinBalance(balance: number) {
  window.dispatchEvent(new CustomEvent(coinEvent, { detail: balance }));
}

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
    const onChange = (e: Event) =>
      setBalance((e as CustomEvent<number>).detail);
    window.addEventListener(coinEvent, onChange);
    return () => {
      stale = true;
      window.removeEventListener(coinEvent, onChange);
    };
  }, [supabase, userId]);

  return balance;
}

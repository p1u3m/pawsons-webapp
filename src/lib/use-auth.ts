"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  openGoogleSignInWindow,
  subscribeToAuthTab,
} from "@/lib/supabase/oauth-tab";
import type { User } from "@supabase/supabase-js";

// Global cache to avoid flickering between navigation updates and renders
let globalCachedUser: User | null = null;
let globalCachedIsAdmin = false;
let globalHasCheckedAuth = false;

export function useAuth() {
  const [user, setUser] = useState<User | null>(globalCachedUser);
  const [isAdmin, setIsAdmin] = useState<boolean>(globalCachedIsAdmin);
  const [loading, setLoading] = useState(!globalHasCheckedAuth);
  const router = useRouter();

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      globalHasCheckedAuth = true;
      return;
    }

    async function evaluateAdmin(u: User | null) {
      if (!u) {
        globalCachedIsAdmin = false;
        setIsAdmin(false);
        return;
      }
      if (u.email === "pitipong544@gmail.com") {
        globalCachedIsAdmin = true;
        setIsAdmin(true);
        return;
      }
      try {
        const { data } = await supabase!
          .from("profiles")
          .select("role")
          .eq("id", u.id)
          .maybeSingle();
        const admin = data?.role === "admin";
        globalCachedIsAdmin = admin;
        setIsAdmin(admin);
      } catch {
        globalCachedIsAdmin = false;
        setIsAdmin(false);
      }
    }

    if (!globalHasCheckedAuth) {
      supabase.auth.getUser().then(({ data: { user: u } }) => {
        globalCachedUser = u ?? null;
        globalHasCheckedAuth = true;
        setUser(u ?? null);
        evaluateAdmin(u ?? null);
        setLoading(false);
      });
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      globalCachedUser = u;
      globalHasCheckedAuth = true;
      setUser(u);
      evaluateAdmin(u);
      setLoading(false);
    });

    const unsubscribeTab = subscribeToAuthTab(async () => {
      const {
        data: { user: u },
      } = await supabase.auth.getUser();
      globalCachedUser = u ?? null;
      globalHasCheckedAuth = true;
      setUser(u ?? null);
      await evaluateAdmin(u ?? null);
      setLoading(false);
      router.refresh();
    });

    return () => {
      subscription.unsubscribe();
      unsubscribeTab();
    };
  }, [supabase, router]);

  const signInWithGoogle = useCallback(() => {
    if (!supabase) return;
    void openGoogleSignInWindow(supabase);
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    globalCachedUser = null;
    globalCachedIsAdmin = false;
    setUser(null);
    setIsAdmin(false);
    await supabase.auth.signOut();
    router.refresh();
  }, [supabase, router]);

  const displayName =
    user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "User";
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

  return {
    supabase,
    user,
    isAdmin,
    loading,
    displayName,
    avatarUrl,
    signInWithGoogle,
    signOut,
  };
}

"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Memoize the client so it isn't recreated on every render
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // Close menu on Escape
  useEffect(() => {
    if (!menuOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [menuOpen]);

  async function handleSignIn() {
    if (!supabase) return;
    setLoading(true);
    const origin = window.location.origin.includes("0.0.0.0")
      ? window.location.origin.replace("0.0.0.0", "localhost")
      : window.location.origin;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
  }

  async function handleSignOut() {
    if (!supabase) return;
    setMenuOpen(false);
    await supabase.auth.signOut();
    router.refresh();
  }

  // Supabase not configured — render nothing
  if (!supabase) return null;

  if (loading) {
    return <div className="auth-skeleton" aria-hidden="true" />;
  }

  // Signed out — show login button
  if (!user) {
    return (
      <button
        className="auth-login-btn"
        onClick={handleSignIn}
        aria-label="ลงชื่อเข้าใช้ด้วย Google"
      >
        <svg
          className="auth-google-icon"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          aria-hidden="true"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        <span>Sign in</span>
      </button>
    );
  }

  // Signed in — show avatar with dropdown
  const displayName =
    user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User";
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <div className="auth-user-wrap" ref={menuRef}>
      <button
        className="auth-avatar-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-expanded={menuOpen}
        aria-haspopup="true"
        aria-label={`เมนูผู้ใช้ · ${displayName}`}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={32}
            height={32}
            className="auth-avatar-img"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="auth-avatar-fallback" aria-hidden="true">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </button>

      {menuOpen && (
        <div className="auth-dropdown" role="menu">
          <div className="auth-dropdown-header">
            <span className="auth-dropdown-name">{displayName}</span>
            <span className="auth-dropdown-email">{user.email}</span>
          </div>
          <hr className="auth-dropdown-divider" />
          <Link
            href="/room"
            className="auth-dropdown-item"
            role="menuitem"
            onClick={() => setMenuOpen(false)}
          >
            🏡 ห้องของฉัน (My Room)
          </Link>
          <button
            className="auth-dropdown-item"
            onClick={handleSignOut}
            role="menuitem"
          >
            ออกจากระบบ
          </button>
        </div>
      )}
    </div>
  );
}

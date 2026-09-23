"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthButtonProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

// Global in-memory cache to prevent flickering when opening mobile drawer
let globalCachedUser: User | null = null;
let globalCachedIsAdmin = false;
let globalHasCheckedAuth = false;

export default function AuthButton({ mobile = false, onNavigate }: AuthButtonProps) {
  const [user, setUser] = useState<User | null>(globalCachedUser);
  const [isAdmin, setIsAdmin] = useState<boolean>(globalCachedIsAdmin);
  const [loading, setLoading] = useState(!globalHasCheckedAuth);
  const [signingIn, setSigningIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Memoize the client so it isn't recreated on every render
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

    // If not checked yet, get initial session
    if (!globalHasCheckedAuth) {
      supabase.auth.getUser().then(({ data: { user: u } }) => {
        globalCachedUser = u ?? null;
        globalHasCheckedAuth = true;
        setUser(u ?? null);
        evaluateAdmin(u ?? null);
        setLoading(false);
      });
    }

    // Listen for auth state changes
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
    if (!supabase || signingIn) return;
    setSigningIn(true);
    const origin = window.location.origin.includes("0.0.0.0")
      ? window.location.origin.replace("0.0.0.0", "localhost")
      : window.location.origin;

    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });
    } catch {
      setSigningIn(false);
    }
  }

  async function handleSignOut() {
    if (!supabase) return;
    setMenuOpen(false);
    globalCachedUser = null;
    setUser(null);
    await supabase.auth.signOut();
    router.refresh();
  }

  // Supabase not configured — render nothing
  if (!supabase) return null;

  if (loading) {
    return mobile ? (
      <div className="mobile-auth-skeleton" aria-hidden="true" />
    ) : (
      <div className="auth-skeleton" aria-hidden="true" />
    );
  }

  // Google SVG Icon
  const googleIcon = (
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
  );

  // Spinner SVG for active connecting state
  const spinnerIcon = (
    <svg
      className="auth-spinner-icon"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" />
      <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" />
    </svg>
  );

  // Signed out — Mobile view
  if (!user && mobile) {
    return (
      <button
        className={`mobile-auth-login-btn ${signingIn ? "is-loading" : ""}`}
        onClick={handleSignIn}
        disabled={signingIn}
        aria-label="Sign in with Google"
      >
        {signingIn ? spinnerIcon : googleIcon}
        <span>{signingIn ? "Connecting..." : "Sign in with Google"}</span>
      </button>
    );
  }

  // Signed out — Desktop view
  if (!user) {
    return (
      <button
        className={`auth-login-btn ${signingIn ? "is-loading" : ""}`}
        onClick={handleSignIn}
        disabled={signingIn}
        aria-label="Sign in with Google"
      >
        {signingIn ? spinnerIcon : googleIcon}
        <span>{signingIn ? "Connecting..." : "Sign in"}</span>
      </button>
    );
  }

  // Signed in user data
  const displayName =
    user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User";
  const avatarUrl = user.user_metadata?.avatar_url;

  // Signed in — Mobile view (dedicated user card)
  if (mobile) {
    return (
      <div className="mobile-auth-card">
        <div className="mobile-auth-user">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              width={42}
              height={42}
              className="mobile-auth-avatar"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="mobile-auth-fallback" aria-hidden="true">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="mobile-auth-info">
            <span className="mobile-auth-label">My Account</span>
            <span className="mobile-auth-name">{displayName}</span>
            <span className="mobile-auth-email">{user.email}</span>
          </div>
        </div>

        <div className="mobile-auth-links">
          <Link
            href="/room"
            className="mobile-auth-room-btn"
            onClick={() => onNavigate?.()}
          >
            <span className="auth-btn-label">
              <span className="material-symbols-rounded">cottage</span>
              <span>My Room</span>
            </span>
            <span className="icon-disc" aria-hidden="true">
              →
            </span>
          </Link>
          {isAdmin && (
            <Link
              href="/admin/contents"
              className="mobile-auth-room-btn"
              onClick={() => onNavigate?.()}
              style={{
                background: "rgba(61, 127, 88, 0.08)",
                borderColor: "rgba(61, 127, 88, 0.25)",
                color: "#255338",
                fontWeight: 600,
              }}
            >
              <span className="auth-btn-label">
                <span className="material-symbols-rounded">dashboard_customize</span>
                <span>Manage Content (Admin)</span>
              </span>
              <span className="icon-disc" aria-hidden="true">
                →
              </span>
            </Link>
          )}
          <button
            type="button"
            className="mobile-auth-signout-btn"
            onClick={() => {
              onNavigate?.();
              handleSignOut();
            }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: "16px" }}>logout</span>
            <span>Sign out</span>
          </button>
        </div>
      </div>
    );
  }

  // Signed in — Desktop view (avatar with dropdown)
  return (
    <div className="auth-user-wrap" ref={menuRef}>
      <button
        className="auth-avatar-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-expanded={menuOpen}
        aria-haspopup="true"
        aria-label={`User menu · ${displayName}`}
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
            <span className="material-symbols-rounded">cottage</span>
            <span>My Room</span>
          </Link>
          {isAdmin && (
            <Link
              href="/admin/contents"
              className="auth-dropdown-item"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              style={{ color: "#3d7f58", fontWeight: 600 }}
            >
              <span className="material-symbols-rounded">dashboard_customize</span>
              <span>Manage Content (Admin)</span>
            </Link>
          )}
          <button
            className="auth-dropdown-item auth-dropdown-signout"
            onClick={handleSignOut}
            role="menuitem"
          >
            <span className="material-symbols-rounded">logout</span>
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}

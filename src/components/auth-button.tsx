"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  EnvelopeSimpleIcon,
  HouseIcon,
  ReceiptIcon,
  SignOutIcon,
  SquaresFourIcon,
} from "@phosphor-icons/react";
import { useAuth } from "@/lib/use-auth";
import { cn } from "@/lib/utils";

/** Google sign-in button for the desktop header; avatar menu once signed in. */
export default function AuthButton() {
  const {
    supabase,
    user,
    isAdmin,
    loading,
    displayName,
    avatarUrl,
    signInWithGoogle,
    signOut,
  } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the menu on an outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  // Supabase not configured — render nothing
  if (!supabase) return null;

  if (loading) {
    return (
      <div
        className="size-[34px] shrink-0 rounded-full border border-line bg-ink/3 opacity-60"
        aria-hidden="true"
      />
    );
  }

  if (!user) {
    return (
      <button
        className="flex shrink-0 items-center gap-[7px] rounded-full border border-line bg-ink/4 py-[7px] pr-4 pl-3 text-[13px] font-semibold whitespace-nowrap text-ink hover:border-line-strong hover:bg-ink/8"
        onClick={signInWithGoogle}
        aria-label="Sign in with Google"
      >
        <GoogleIcon size={16} />
        <span>Sign in</span>
      </button>
    );
  }

  const close = () => setMenuOpen(false);

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        className="flex size-9 items-center justify-center overflow-hidden rounded-full border-2 border-line bg-paper-soft hover:border-line-strong hover:shadow-soft"
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
            className="size-8 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span
            className="text-[14px] leading-none font-bold text-ink-muted"
            aria-hidden="true"
          >
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </button>

      {menuOpen && (
        <div
          className="absolute top-[calc(100%+10px)] right-0 z-60 min-w-[210px] rounded-card-sm border border-line bg-cream p-2.5 shadow-float transition-[opacity,translate] duration-150 starting:-translate-y-1 starting:opacity-0"
          role="menu"
        >
          <div className="flex flex-col gap-0.5 px-2.5 pt-1.5 pb-2">
            <span className="text-[14px] font-semibold text-ink">
              {displayName}
            </span>
            <span className="truncate text-[12px] text-ink-muted">
              {user.email}
            </span>
          </div>
          <hr className="my-1 border-line" />
          <Link
            href="/room"
            className={menuItem}
            role="menuitem"
            onClick={close}
          >
            <HouseIcon size={20} aria-hidden="true" />
            <span>My Room</span>
          </Link>
          <Link
            href="/shop/orders"
            className={menuItem}
            role="menuitem"
            onClick={close}
          >
            <ReceiptIcon size={20} aria-hidden="true" />
            <span>My orders</span>
          </Link>
          <Link
            href="/letters"
            className={menuItem}
            role="menuitem"
            onClick={close}
          >
            <EnvelopeSimpleIcon size={20} aria-hidden="true" />
            <span>Letters</span>
          </Link>
          {isAdmin && (
            <Link
              href="/admin/contents"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                menuItem,
                "font-semibold text-green hover:text-green",
              )}
              role="menuitem"
              onClick={close}
            >
              <SquaresFourIcon size={20} aria-hidden="true" />
              <span>Admin</span>
            </Link>
          )}
          <button
            className={cn(
              menuItem,
              "text-danger hover:bg-danger/8 hover:text-danger-ink",
            )}
            onClick={() => {
              close();
              void signOut();
            }}
            role="menuitem"
          >
            <SignOutIcon size={20} aria-hidden="true" />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}

const menuItem =
  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium text-ink-muted hover:bg-ink/5 hover:text-ink [&_svg]:shrink-0 [&_svg]:opacity-85";

export function GoogleIcon({ size }: { size: number }) {
  return (
    <svg
      className="shrink-0"
      viewBox="0 0 24 24"
      width={size}
      height={size}
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
}

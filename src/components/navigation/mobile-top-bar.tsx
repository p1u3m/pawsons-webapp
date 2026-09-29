"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/use-auth";

interface MobileTopBarProps {
  onOpenAccount: () => void;
}

export default function MobileTopBar({ onOpenAccount }: MobileTopBarProps) {
  const { user, displayName, avatarUrl, loading } = useAuth();

  return (
    <div className="mobile-top-bar-wrapper">
      <header className="mobile-top-bar">
        <Link
          href="/"
          className="mobile-top-brand"
          aria-label="Pawsons Home"
        >
          <Image
            src="/logos/Logo_main.svg"
            width={120}
            height={28}
            alt="pawsons"
            priority
          />
        </Link>

        <button
          type="button"
          className="mobile-top-avatar-btn"
          onClick={onOpenAccount}
          aria-label={user ? `บัญชีของฉัน (${displayName})` : "เปิดเมนูบัญชี"}
          aria-haspopup="dialog"
        >
          {loading ? (
            <span className="mobile-top-avatar-skeleton" aria-hidden="true" />
          ) : user && avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              width={34}
              height={34}
              className="mobile-top-avatar-img"
              referrerPolicy="no-referrer"
            />
          ) : user ? (
            <span className="mobile-top-avatar-fallback" aria-hidden="true">
              {displayName.charAt(0).toUpperCase()}
            </span>
          ) : (
            <span className="mobile-top-avatar-guest" aria-hidden="true">
              <span className="material-symbols-rounded">account_circle</span>
            </span>
          )}
        </button>
      </header>
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { UserCircleIcon } from "@phosphor-icons/react";
import { useAuth } from "@/lib/use-auth";

interface MobileTopBarProps {
  onOpenAccount: () => void;
}

const avatar = "flex size-9 items-center justify-center rounded-full";

export default function MobileTopBar({ onOpenAccount }: MobileTopBarProps) {
  const { user, displayName, avatarUrl, loading } = useAuth();

  return (
    <div className="pointer-events-none sticky top-3 z-45 w-full px-4 md:hidden">
      <header className="pointer-events-auto relative z-46 mx-auto flex h-14 max-w-[520px] items-center justify-between rounded-full border border-ink/8 bg-cream py-1.5 pr-2.5 pl-[18px] shadow-[0_12px_30px_-8px_rgb(74_68_53/0.12),0_2px_6px_rgb(74_68_53/0.04)]">
        <Link
          href="/"
          className="flex min-h-11 items-center pr-3"
          aria-label="Pawsons Home"
        >
          <Image
            src="/logos/Logo_main.svg"
            width={120}
            height={28}
            alt="pawsons"
            priority
            className="h-auto w-28 object-contain"
          />
        </Link>

        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-1 transition-transform duration-200 ease-spring hover:scale-105 focus-visible:outline-offset-2 active:scale-95"
          onClick={onOpenAccount}
          aria-label={user ? `บัญชีของฉัน (${displayName})` : "เปิดเมนูบัญชี"}
          aria-haspopup="dialog"
        >
          {loading ? (
            <span className={`${avatar} animate-pulse bg-ink/6`} aria-hidden="true" />
          ) : user && avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              width={34}
              height={34}
              className="size-9 rounded-full border-2 border-cream object-cover shadow-[0_2px_6px_rgb(24_24_24/0.12)]"
              referrerPolicy="no-referrer"
            />
          ) : user ? (
            <span
              className={`${avatar} bg-sun text-[15px] font-bold text-sun-ink shadow-[0_2px_6px_rgb(184_134_11/0.25)]`}
              aria-hidden="true"
            >
              {displayName.charAt(0).toUpperCase()}
            </span>
          ) : (
            <span className={`${avatar} bg-ink/5 text-ink`} aria-hidden="true">
              <UserCircleIcon size={24} />
            </span>
          )}
        </button>
      </header>
    </div>
  );
}

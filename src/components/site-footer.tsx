"use client";

import MotionLink from "@/components/motion-link";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconDisc, pillButton } from "@/components/pill-button";

export default function SiteFooter() {
  // Admin has its own layout.
  if (usePathname().startsWith("/admin")) return null;

  return (
    // On mobile the bottom padding leaves room for the bottom navigation.
    <footer className="mx-auto flex w-[min(1180px,calc(100%-64px))] flex-wrap items-center justify-between gap-8 pt-10 pb-11 max-md:flex-col max-md:gap-5 max-md:pt-9 max-md:pb-[calc(96px+env(safe-area-inset-bottom,16px))] max-md:text-center">
      <Link
        href="/"
        className="group flex shrink-0 items-center"
        aria-label="Pawsons หน้าแรก"
      >
        <Image
          src="/logos/Logo_main.svg"
          alt="pawsons"
          width={125}
          height={28}
          className="h-7 w-[125px] object-contain transition-opacity group-hover:opacity-80"
        />
      </Link>
      <div className="flex flex-col gap-0.5">
        <p className="text-[14.5px] font-medium text-ink">
          A little place to be you.
        </p>
        <span className="text-[13px] text-ink-muted">
          ค่อย ๆ รู้จักกัน ในจังหวะของคุณ
        </span>
      </div>
      <div className="ml-auto flex flex-col items-end gap-2 max-md:ml-0 max-md:items-center">
        <MotionLink
          href="/letters"
          className={pillButton({ variant: "ledge" })}
        >
          <span>Personal letters</span>
          <IconDisc>↗</IconDisc>
        </MotionLink>
        <small className="text-[12px] text-ink-muted">
          © {new Date().getFullYear()} Pawsons · Made with a little warmth
        </small>
      </div>
    </footer>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { houseBackground, type Character } from "@/lib/data";
import { cn } from "@/lib/utils";

// Shared pieces of the paper look used by /contents and /shop: cream cards
// on solid ledges, yellow sign buttons, round ink-blue buttons.

/** Yellow sign button on a gold ledge; rises on hover, sinks when pressed. */
export const signButton =
  "inline-flex min-h-[52px] items-center justify-center gap-2.5 press rounded-card bg-sun px-[26px] text-[16px] font-bold whitespace-nowrap text-gold-ink [--ledge-2:var(--color-ledge-sun)] [--ledge:var(--color-gold)] [text-shadow:0_1px_0_rgb(255_255_255/0.35)]";

/** Round cream button with an ink-blue icon (back, cart). */
export const roundButton =
  "grid size-[46px] shrink-0 place-items-center rounded-full bg-cream text-navy press ";

/** Small house-coloured dot. */
export function Dot({ color, className }: { color?: string; className?: string }) {
  return (
    <span
      className={cn("inline-block size-2 shrink-0 rounded-full bg-green", className)}
      style={color ? ({ background: color } as CSSProperties) : undefined}
      aria-hidden="true"
    />
  );
}

/** Card linking to a character's page: avatar, title and tagline. */
export function FriendLink({ character: c, title }: { character: Character; title: string }) {
  return (
    <Link
      className="group flex items-center gap-3.5 rounded-card-sm bg-cream py-3 pr-[18px] pl-3 press [--depth:3px] [--ledge-2:var(--color-ledge-2)]"
      href={`/characters/${c.type.toLowerCase()}`}
    >
      <span
        className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl"
        style={{ background: houseBackground(c.house) }}
      >
        <Image src={c.image} alt="" width={96} height={96} sizes="56px" className="h-auto w-[84%]" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <strong>{title}</strong>
        <small className="truncate text-[13px] text-ink-muted">{c.tagline}</small>
      </span>
      <span
        aria-hidden="true"
        className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      >
        ↗
      </span>
    </Link>
  );
}

/** Page hero of /contents: copy beside art on a cream arch, stacked on phones. */
export const pageHero =
  "wrap mb-11 grid grid-cols-2 items-center gap-16 pt-5 pb-3 max-[62.5rem]:gap-8 max-md:grid-cols-1 max-md:gap-6 max-md:py-0 max-md:text-left [&>div:last-child]:w-[min(100%,380px)] [&>div:last-child]:justify-self-center [&>div:last-child]:rounded-[48%_48%_16px_16px] [&>div:last-child]:bg-cream [&>div:last-child]:p-5 max-md:[&>div:last-child]:w-[min(80%,280px)]";
export const pageHeroTitle =
  "mb-4 text-[clamp(34px,3.8vw,48px)] leading-[1.35] tracking-[-0.02em] text-balance max-md:mb-3.5 max-md:text-[30px] max-md:leading-[1.4]";
export const pageHeroText =
  "max-w-[460px] text-[17px] leading-[1.75] text-ink-soft max-md:mr-auto max-md:ml-0 max-md:max-w-[38ch] max-md:text-[15px] max-md:leading-[1.7]";

/** Listing pages (/contents, /shop): focus ring, text selection, toolbar, result header. */
export const listingPage =
  "[--focus-ring:var(--color-green)] [--focus-offset:4px] selection:bg-navy selection:text-cream";
export const listToolbar =
  "flex flex-wrap items-center gap-4 rounded-card-sm p-4 max-md:gap-3 max-md:p-0";
export const listFilters =
  "flex-wrap items-start gap-x-6 gap-y-4";
export const listResults =
  "mt-7 mb-6 flex flex-wrap items-baseline justify-between gap-3 max-md:mt-6 max-md:mb-5";
export const listResultsTitle =
  "text-[26px] leading-[1.4] tracking-[-0.02em] max-md:text-[23px]";
export const listResultsCount = "mt-1.5 text-[13px] text-ink-muted";
export const listReset =
  "inline-flex min-h-11 items-center gap-2 text-[13px] text-ink-soft underline underline-offset-4";

/**
 * Stand-in for a missing picture (product photo, post artwork): a picture
 * glyph (Material Symbols Rounded "image") with an optional label.
 */
export function ImagePlaceholder({ label }: { label?: string }) {
  const size = label ? 36 : 24;
  return (
    <span className="flex flex-col items-center gap-1.5 text-center text-[13px] text-ink-faint">
      <svg
        width={size}
        height={size}
        viewBox="0 -960 960 960"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0 0v-560 560Zm80-80h400q12 0 18-11t-2-21L586-459q-6-8-16-8t-16 8L450-320l-74-99q-6-8-16-8t-16 8l-80 107q-8 10-2 21t18 11Z" />
      </svg>
      {label}
    </span>
  );
}
